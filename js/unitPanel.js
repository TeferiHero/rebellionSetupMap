// UnitPanel: shows the units on the map.
//
// NO PLANET SELECTED: an overview of every planet that has units
//
//   ALL PLANETS
//   [ All ] [ Empire ] [ Rebel ]
//   PLANETS WITH UNITS
//     Hoth                      <- planets sorted by name
//       TIE Fighter        x3
//       Rebel Trooper      x2
//     Kessel
//       Star Destroyer     x1
//
// A PLANET SELECTED: that planet's units, editable
//
//   <planet name>
//   [ All ] [ Empire ] [ Rebel ]        <- the filter is shared with the overview
//   ON THIS PLANET                      <- units with a number above 0
//     TIE Fighter            x3
//   EDIT UNITS                          <- one row per unit:  name  [-] number [+]
//
// The panel edits the dictionary it is given IN PLACE ({ unitName: number }),
// so the planet sees the new numbers immediately. After every change it calls onChange
// so the game can save.
//
// Needs units.js (getUnitFaction) for the Empire / Rebel filter.
//
// Usage:
//   const panel = new UnitPanel(
//       document.getElementById('unit_panel'),
//       () => game.save(),
//       () => getUnitNames(game.useExpansion),
//       () => Object.values(game.map.planets)     // anything with .name and .units
//   );
//   panel.show('Hoth', planet.units);   // when a planet is selected
//   panel.clear();                      // when nothing is selected (shows the overview)
//   panel.refresh();                    // after the planets were loaded or reset

class UnitPanel {
  /**
   * @param {HTMLElement} container   element the panel renders into
   * @param {Function} [onChange]     called as onChange(unitName, newNumber) after each change
   * @param {string[]|Function} [allUnits]  optional list of unit names (or a function that returns
   *                                  one, e.g. () => getUnitNames(game.useExpansion)); shows a row
   *                                  for every name even if the planet's dictionary doesn't have it
   *                                  yet. A planet's units with a number above 0 that are not in the
   *                                  list are still shown.
   * @param {Function} [getPlanets]   returns an array of planets ({ name, units }) for the overview.
   *                                  It is called every time the overview is drawn.
   */
  constructor(container, onChange, allUnits, getPlanets) {
    this.container = container;
    this.onChange = onChange || function () {};
    this.allUnits = allUnits || null;
    this.getPlanets = getPlanets || null;

    this.isOverview = true; // true = no planet selected, false = one planet selected
    this.units = null; // the dictionary being edited (null = overview)
    this.title = "";
    this.filter = "all"; // 'all' | 'empire' | 'rebel'
    this.counters = {}; // unit name -> the <span> that shows its number
    // (a plain object: this project defines its own class Map)
    this.summaryEl = null; // element that lists the units with a number above 0

    // one listener for all buttons
    this.container.addEventListener("click", (e) => {
      const filterBtn = e.target.closest("button[data-filter]");
      if (filterBtn) {
        this.setFilter(filterBtn.dataset.filter);
        return;
      }

      const btn = e.target.closest("button[data-unit]");
      if (!btn || !this.units) {
        return;
      }
      this.change(btn.dataset.unit, Number(btn.dataset.delta));
    });

    this.clear();
  }

  // Show the units of one planet
  show(title, units) {
    this.units = units;
    this.title = title;
    this.render();
  }

  // Nothing selected: show the overview of all planets
  clear() {
    this.units = null;
    this.counters = {};
    this.summaryEl = null;
    this.renderOverview();
  }

  // Call after the planets were loaded or reset: goes back to the overview with fresh numbers
  refresh() {
    if (this.isOverview) {
      this.renderOverview();
    } else {
      this.render();
    }
  }

  // 'all', 'empire' or 'rebel'
  setFilter(filter) {
    this.filter = filter;
    if (this.units) {
      this.render();
    } else {
      this.renderOverview();
    }
  }

  // Add delta to a unit's number (never below 0)
  change(unit, delta) {
    const next = Math.max(0, (this.units[unit] || 0) + delta);
    this.units[unit] = next;

    const counter = this.counters[unit];
    if (counter) {
      counter.textContent = next;
    }
    this.renderSummary();
    this.onChange(unit, next);
  }

  // Does this unit belong to the faction that is currently shown?
  // (units whose faction is unknown are always shown, so a number never disappears)
  matchesFilter(unit) {
    if (this.filter === "all") {
      return true;
    }
    const faction =
      typeof getUnitFaction === "function" ? getUnitFaction(unit) : null;
    return faction === null || faction === this.filter;
  }

  // Names of the units to show for one planet's dictionary, in order, with the filter applied
  getNames(units) {
    const list =
      typeof this.allUnits === "function" ? this.allUnits() : this.allUnits;
    let names;
    if (list) {
      names = list.slice();
      // keep showing units the planet has, even if they are not in the list
      // (for example expansion units after the expansion was switched off)
      Object.keys(units).forEach((unit) => {
        if (units[unit] > 0 && names.indexOf(unit) === -1) {
          names.push(unit);
        }
      });
    } else {
      names = Object.keys(units);
    }
    return names.filter((unit) => this.matchesFilter(unit));
  }

  // ---------- overview (no planet selected) ----------

  renderOverview() {
    this.isOverview = true;
    this.container.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = "All planets";
    this.container.appendChild(heading);

    const planets = this.getPlanets ? this.getPlanets() || [] : [];
    if (!this.getPlanets) {
      this.container.appendChild(this.makeEmptyText("Select a planet"));
      return;
    }

    console.log("Rendering overview for " + planets.length + " planets");
    console.log(planets.map((p) => p.name).join(", "));
    // console.log(planets.map((p) => JSON.stringify(p)).join(", "));
    this.container.appendChild(this.makeFilterBar());

    const hint = this.makeEmptyText("Select a planet to edit its units");
    this.container.appendChild(hint);

    this.container.appendChild(this.makeSubheading("Planets with units"));

    const sorted = planets
      .slice()
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    let shown = 0;
    sorted.forEach((planet) => {
      const units = planet.units || {};
      const present = this.getNames(units).filter(
        (unit) => (units[unit] || 0) > 0,
      );
      if (present.length === 0) {
        return;
      }
      shown++;

      const box = document.createElement("div");
      box.className = "unit-planet";

      const name = document.createElement("div");
      name.className = "unit-planet-name";
      name.textContent = planet.name;
      box.appendChild(name);

      present.forEach((unit) =>
        box.appendChild(this.makeSummaryRow(unit, units[unit])),
      );
      this.container.appendChild(box);
    });

    if (shown === 0) {
      this.container.appendChild(this.makeEmptyText("No units on any planet"));
    }
  }

  // ---------- one planet ----------

  render() {
    this.isOverview = false;
    this.container.innerHTML = "";
    this.counters = {};

    const heading = document.createElement("h3");
    heading.textContent = this.title;
    this.container.appendChild(heading);

    this.container.appendChild(this.makeFilterBar());

    // units on this planet (filled by renderSummary)
    this.container.appendChild(this.makeSubheading("On this planet"));
    this.summaryEl = document.createElement("div");
    this.summaryEl.className = "unit-summary";
    this.container.appendChild(this.summaryEl);

    // editable rows
    this.container.appendChild(this.makeSubheading("Edit units"));
    this.getNames(this.units).forEach((unit) => {
      const row = document.createElement("div");
      row.className = "unit-row";

      const label = document.createElement("span");
      label.className = "unit-name";
      label.textContent = unit;

      const minus = this.makeButton(unit, -1, "\u2212"); // minus sign
      const plus = this.makeButton(unit, 1, "+");

      const count = document.createElement("span");
      count.className = "unit-count";
      count.textContent = this.units[unit] || 0;
      this.counters[unit] = count;

      row.append(label, minus, count, plus);
      this.container.appendChild(row);
    });

    this.renderSummary();
  }

  // The list of units with a number above 0
  renderSummary() {
    if (!this.summaryEl) {
      return;
    }
    this.summaryEl.innerHTML = "";

    const present = this.getNames(this.units).filter(
      (unit) => (this.units[unit] || 0) > 0,
    );
    if (present.length === 0) {
      this.summaryEl.appendChild(this.makeEmptyText("No units"));
      return;
    }
    present.forEach((unit) =>
      this.summaryEl.appendChild(this.makeSummaryRow(unit, this.units[unit])),
    );
  }

  // ---------- small builders ----------

  makeSummaryRow(unit, amount) {
    const row = document.createElement("div");
    row.className = "unit-sum-row";

    const name = document.createElement("span");
    name.textContent = unit;

    const number = document.createElement("span");
    number.className = "unit-sum-amount";
    number.textContent = "\u00D7" + amount; // multiplication sign

    row.append(name, number);
    return row;
  }

  makeEmptyText(text) {
    const p = document.createElement("p");
    p.className = "unit-empty";
    p.textContent = text;
    return p;
  }

  makeFilterBar() {
    const bar = document.createElement("div");
    bar.className = "unit-filter";

    [
      ["all", "All"],
      ["empire", "Empire"],
      ["rebel", "Rebel"],
    ].forEach(([value, text]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "unit-filter-btn" + (this.filter === value ? " active" : "");
      btn.dataset.filter = value;
      btn.textContent = text;
      bar.appendChild(btn);
    });
    return bar;
  }

  makeSubheading(text) {
    const el = document.createElement("h4");
    el.textContent = text;
    return el;
  }

  makeButton(unit, delta, text) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "unit-btn";
    btn.dataset.unit = unit;
    btn.dataset.delta = delta;
    btn.textContent = text;
    return btn;
  }
}
