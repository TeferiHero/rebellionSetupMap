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
    this.buttons = {};

    // (a plain object: this project defines its own class Map)
    this.summaryEl = null; // element that lists the units with a number above 0

    this.spacer = null; // empty element at the bottom that gives the scroll fix room

    // one listener for all buttons
    this.container.addEventListener("click", (e) => {
      if (e.target.closest("button[data-clear]")) {
        this.clearAll();
        return;
      }
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
    this.buttons = {};
    this.summaryEl = null;
    this.renderOverview();
    this.spacer = null; // empty element at the bottom that gives the scroll fix room
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

  // The nearest ancestor that scrolls (the .left-right column)
  getScroller() {
    let el = this.container;
    while (el && el !== document.body) {
      const overflow = getComputedStyle(el).overflowY;
      if (overflow === "auto" || overflow === "scroll") {
        return el;
      }
      el = el.parentElement;
    }
    return document.scrollingElement;
  }

  // Add delta to a unit's number (never below 0, never above the map-wide limit)
  change(unit, delta) {
    const current = this.units[unit] || 0;
    const next = Math.min(this.getMax(unit), Math.max(0, current + delta));
    if (next === current) {
      return;
    }
    this.units[unit] = next;

    const counter = this.counters[unit];
    // remember where this unit's row is on screen
    const before = counter ? counter.getBoundingClientRect().top : null;

    if (counter) {
      counter.textContent = next;
    }
    this.updateButtons(unit);
    this.renderSummary();

    // the list above may have grown or shrunk: scroll by the same amount
    // so the buttons stay where the pointer is
    // the list above may have grown or shrunk: scroll by the same amount
    // so the buttons stay where the pointer is
    if (before !== null) {
      const shift = counter.getBoundingClientRect().top - before;
      if (shift !== 0) {
        const scroller = this.getScroller();
        if (shift > 0 && this.spacer) {
          // where the content really ends (the bottom of the spacer, plus the column's padding)
          const bottom =
            this.spacer.getBoundingClientRect().bottom -
            scroller.getBoundingClientRect().top +
            scroller.scrollTop +
            (parseFloat(getComputedStyle(scroller).paddingBottom) || 0);

          // to scroll down by `shift` the content must end at least here:
          const needed = scroller.scrollTop + shift + scroller.clientHeight;

          if (bottom < needed) {
            const height = parseFloat(this.spacer.style.height) || 0;
            this.spacer.style.height = height + (needed - bottom) + "px";
          }
        }
        scroller.scrollTop += shift;
      }
    }

    this.onChange(unit, next);
  }

  // // Add delta to a unit's number (never below 0, never above the map-wide limit)
  // change(unit, delta) {
  //   const current = this.units[unit] || 0;
  //   const next = Math.min(this.getMax(unit), Math.max(0, current + delta));
  //   if (next === current) {
  //     return;
  //   }
  //   this.units[unit] = next;

  //   const counter = this.counters[unit];
  //   if (counter) {
  //     counter.textContent = next;
  //   }
  //   this.updateButtons(unit);
  //   this.renderSummary();
  //   this.onChange(unit, next);
  // }

  getLimit(unit) {
    return typeof getUnitLimit === "function" ? getUnitLimit(unit) : Infinity;
  }

  // How many of this unit are on all the OTHER planets
  getOthers(unit) {
    let sum = 0;
    (this.getPlanets ? this.getPlanets() || [] : []).forEach((planet) => {
      if (planet.units && planet.units !== this.units) {
        sum += planet.units[unit] || 0;
      }
    });
    return sum;
  }

  // The highest number this planet can have of the unit
  // (if loaded data is already over the limit, the current number stays allowed)
  getMax(unit) {
    const current = this.units[unit] || 0;
    return Math.max(current, this.getLimit(unit) - this.getOthers(unit));
  }

  // Gray out - at 0 and + at the limit
  updateButtons(unit) {
    const b = this.buttons[unit];
    if (!b) {
      return;
    }
    const current = this.units[unit] || 0;
    b.minus.disabled = current <= 0;
    b.plus.disabled = current >= this.getMax(unit);
  }

  // Set every unit on the selected planet to 0
  clearAll() {
    if (!this.units) {
      return;
    }
    // const names = Object.keys(this.units).filter((u) => this.units[u] > 0);
    const names = this.getNames(this.units).filter((u) => this.units[u] > 0);
    if (names.length === 0) {
      return;
    }
    if (!confirm("Delete all units on " + this.title + "?")) {
      return;
    }
    names.forEach((unit) => {
      this.units[unit] = 0;
      this.onChange(unit, 0); // updates the planet, redraws its squares, saves
    });
    this.render();
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

    // console.log("Rendering overview for " + planets.length + " planets");
    // console.log(planets.map((p) => p.name).join(", "));
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
      name.textContent = planet.getPrettyName
        ? planet.getPrettyName()
        : planet.name;
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
    this.buttons = {};

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
      // other planets already hold every copy: no row here
      if (
        (this.units[unit] || 0) === 0 &&
        this.getOthers(unit) >= this.getLimit(unit)
      ) {
        return;
      }

      const row = document.createElement("div");
      row.className = "unit-row";

      const label = document.createElement("span");
      label.className = "unit-name";
      label.textContent = unit;

      const minus = this.makeButton(unit, -1, "\u2212");
      const plus = this.makeButton(unit, 1, "+");

      const count = document.createElement("span");
      count.className = "unit-count";
      count.textContent = this.units[unit] || 0;
      this.counters[unit] = count;
      this.buttons[unit] = { minus, plus };

      row.append(label, minus, count, plus);
      this.container.appendChild(row);
      this.updateButtons(unit);
    });

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "unit-clear-btn button";
    clearBtn.dataset.clear = "1";
    clearBtn.textContent = "Delete all units";
    this.container.appendChild(clearBtn);

    // empty element at the bottom: grows when the scroll fix needs more room
    this.spacer = document.createElement("div");
    this.spacer.className = "unit-spacer";
    this.container.appendChild(this.spacer);
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
    const p = document.createElement("span");
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
