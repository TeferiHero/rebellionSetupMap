// LimitsPanel: a slide-out panel on the left to edit the map-wide max of each unit.
// It builds its own DOM. A preset dropdown at the top always shows the preset the
// current limits match (or "Custom").
//
// Needs units.js (UNIT_PRESETS, getUnitLimit, setUnitLimit, applyUnitPreset,
// findMatchingPreset, getUnitNames, MAX_UNIT_LIMIT).
//
// Usage:
//   const panel = new LimitsPanel(
//       () => { unitPanel.refresh(); game.save(); },   // called after every change
//       (faction) => getUnitNames(game.useExpansion, faction)
//   );
//   panel.render();   // after limits were loaded or the expansion was toggled

class LimitsPanel {
  constructor(onChange, getNames) {
    this.onChange = onChange || function () {};
    this.getNames = getNames || ((faction) => getUnitNames(true, faction));
    this.open = false;
    this.counters = {}; // unit name -> <span> with its limit
    this.select = null; // the preset dropdown

    this.wrap = document.createElement("div");
    this.wrap.id = "limits_wrap";
    this.wrap.className = "limits-wrap";

    this.panel = document.createElement("div");
    this.panel.id = "limits_panel";
    this.panel.className = "limits-panel";

    this.toggle = document.createElement("button");
    this.toggle.type = "button";
    this.toggle.className = "limits-toggle";

    this.wrap.append(this.panel, this.toggle);
    document.body.appendChild(this.wrap);

    this.toggle.addEventListener("click", () => this.setOpen(!this.open));
    this.panel.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-unit]");
      if (btn) {
        this.change(btn.dataset.unit, Number(btn.dataset.delta));
      }
    });

    this.setOpen(false);
    this.render();
  }

  setOpen(open) {
    this.open = open;
    this.wrap.classList.toggle("open", open);
    this.updateToggleLabel();
  }

  // The always-visible tab: "Limits (<preset name>) ▶"
  // The always-visible tab: "Unit Limits ▶" on line 1, "(<preset name>)" on line 2
  updateToggleLabel() {
    const match = findMatchingPreset();
    const name = match ? match.name : "Custom";

    const line1 = document.createElement("span");
    line1.className = "limits-toggle-title";
    line1.textContent = "Unit Limits " + (this.open ? "\u25C0" : "\u25B6");

    const line2 = document.createElement("span");
    line2.className = "limits-toggle-preset";
    line2.textContent = "(" + name + ")";

    this.toggle.replaceChildren(line1, line2);
  }

  // Set the dropdown and the tab to the matching preset, or to "Custom"
  updatePresetSelect() {
    this.updateToggleLabel();
    if (!this.select) {
      return;
    }
    const match = findMatchingPreset();
    this.select.value = match ? match.id : "custom";
  }

  change(unit, delta) {
    const current = getUnitLimit(unit);
    const next = Math.max(0, Math.min(MAX_UNIT_LIMIT, current + delta));
    if (next === current) {
      return;
    }
    setUnitLimit(unit, next);
    this.counters[unit].textContent = next;
    this.updateButtons(unit);
    this.updatePresetSelect();
    this.onChange();
  }

  updateButtons(unit) {
    const row = this.panel.querySelector('[data-row="' + unit + '"]');
    if (!row) {
      return;
    }
    const value = getUnitLimit(unit);
    row.querySelector('button[data-delta="-1"]').disabled = value <= 0;
    row.querySelector('button[data-delta="1"]').disabled =
      value >= MAX_UNIT_LIMIT;
  }

  render() {
    this.panel.innerHTML = "";
    this.counters = {};

    const heading = document.createElement("h3");
    heading.textContent = "Max units";
    this.panel.appendChild(heading);

    // preset dropdown
    // preset dropdown (same look as the menu dropdowns)
    this.select = document.createElement("select");
    UNIT_PRESETS.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      this.select.appendChild(opt);
    });
    const custom = document.createElement("option");
    custom.value = "custom";
    custom.textContent = "Custom";
    custom.disabled = true; // shown when nothing matches, but can't be picked
    this.select.appendChild(custom);

    this.select.addEventListener("change", () => {
      applyUnitPreset(this.select.value);
      this.render();
      this.onChange();
    });

    const selectWrap = document.createElement("div");
    selectWrap.className = "select-option limits-select";
    selectWrap.appendChild(this.select);
    this.panel.appendChild(selectWrap);

    [
      ["empire", "Empire"],
      ["rebel", "Rebel"],
    ].forEach(([faction, title]) => {
      const sub = document.createElement("h4");
      sub.textContent = title;
      this.panel.appendChild(sub);

      this.getNames(faction).forEach((unit) => {
        const row = document.createElement("div");
        row.className = "unit-row"; // was limits-row
        row.dataset.row = unit;

        const label = document.createElement("span");
        label.className = "unit-name"; // was limits-name
        label.textContent = unit;

        const count = document.createElement("span");
        count.className = "unit-count"; // was limits-count
        count.textContent = getUnitLimit(unit);
        this.counters[unit] = count;

        row.append(
          label,
          this.makeButton(unit, -1, "\u2212"),
          count,
          this.makeButton(unit, 1, "+"),
        );
        this.panel.appendChild(row);
        this.updateButtons(unit);
      });
    });

    this.updatePresetSelect();
  }

  makeButton(unit, delta, text) {
    const btn = document.createElement("button");
    btn.type = "button";
    // btn.className = "limits-btn";
    btn.className = "unit-btn";
    btn.dataset.unit = unit;

    btn.dataset.delta = delta;
    btn.textContent = text;
    return btn;
  }
}
