// UnitPanel: shows a planet's units as rows with  [-] number [+]  buttons.
//
// The panel edits the dictionary it is given IN PLACE ({ unitName: number }),
// so the planet sees the new numbers immediately. After every change it calls onChange
// so the game can save.
//
// Usage:
//   const panel = new UnitPanel(document.getElementById('unit_panel'), () => game.save());
//   panel.show('Hoth', planet.units);   // when a planet is selected
//   panel.clear();                      // when nothing is selected

class UnitPanel {
  /**
   * @param {HTMLElement} container   element the panel renders into
   * @param {Function} [onChange]     called as onChange(unitName, newNumber) after each change
   * @param {string[]|Function} [allUnits]  optional list of unit names (or a function that returns
   *                                  one, e.g. () => getUnitNames(game.useExpansion)); shows a row
   *                                  for every name even if the planet's dictionary doesn't have it
   *                                  yet. A planet's units with a number above 0 that are not in the
   *                                  list are still shown.
   */
  constructor(container, onChange, allUnits) {
    this.container = container;
    this.onChange = onChange || function () {};
    this.allUnits = allUnits || null;

    this.units = null; // the dictionary being edited
    this.counters = {}; // unit name -> the <span> that shows its number
    // (a plain object: this project defines its own class Map)

    // one listener for all buttons
    this.container.addEventListener("click", (e) => {
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
    this.render(title);
  }

  // Nothing selected
  clear() {
    this.units = null;
    this.counters = {};
    this.container.innerHTML = '<p class="unit-empty">Select a planet</p>';
  }

  // Add delta to a unit's number (never below 0)
  change(unit, delta) {
    const newAmount = Math.max(0, (this.units[unit] || 0) + delta);
    this.units[unit] = newAmount;

    const counter = this.counters[unit];
    if (counter) {
      counter.textContent = newAmount;
    }
    this.onChange(unit, newAmount);
  }

  render(title) {
    this.container.innerHTML = "";
    this.counters = {};

    const heading = document.createElement("h3");
    heading.textContent = title;
    this.container.appendChild(heading);

    const list =
      typeof this.allUnits === "function" ? this.allUnits() : this.allUnits;
    let names;
    if (list) {
      //   console.log("UnitPanel: using list of units", list);
      names = list.slice();
      // keep showing units the planet has, even if they are not in the list
      // (for example expansion units after the expansion was switched off)
      Object.keys(this.units).forEach((unit) => {
        if (this.units[unit] > 0 && names.indexOf(unit) === -1) {
          names.push(unit);
        }
      });
    } else {
      //   console.log("Using only units already on planet", list);
      names = Object.keys(this.units);
    }
    names.forEach((unit) => {
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
