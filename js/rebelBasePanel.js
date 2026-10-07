// The Rebel Base: a hidden system in a slide-out panel on the left.
// It is a normal Planet (planet.js) that lives in its own small SVG instead of the map.
// Build this panel BEFORE the GameMap, because Planet needs its <g id="RebelBase"> to exist.

const REBEL_BASE = {
  name: "RebelBase",
  width: 240,
  height: 420,
  // purely visual dark sphere in the middle of the system (drawn behind the system)
  sphere: { cx: 120, cy: 210, r: 85 },
  // border around the system (drawn behind it, so the selection glow lies on top)
  border: { color: "#E6A447", width: 10.5146 },
  planet: {
    // the system: a rounded rectangle (this is what you click and what gets selected)
    bg: "M24,10 H216 Q230,10 230,24 V396 Q230,410 216,410 H24 Q10,410 10,396 V24 Q10,10 24,10 Z",
    bgFill: "#e8872a", // slightly orange tint of the system; delete this line for the default dark one
    bgOpacity: 0.3, // strength of that tint (it also covers the sphere behind it)
    const_loyalty: 1, // always rebel: clicking it never cycles the loyalty
    noProbe: true, // clicks in probe mode do nothing
    loyalty: "85, 390", // marker positions (shown only in loyalty / probe mode,
    probe: "-1000,-1000", //  unit squares only in unit mode, so they never overlap)
    unitLayer: "RebelBaseUnits", // id of the group below that holds the unit squares
    // unitSlots: [
    //   "52, 30",
    //   "128, 30",
    //   "52, 100",
    //   "128, 100",
    //   "52, 170",
    //   "128, 170",
    //   "52, 240",
    //   "128, 240",
    //   "52, 310",
    //   "128, 310",
    // ],
  },
};

class RebelBasePanel {
  constructor() {
    this.open = false;
    const { name, width, height, sphere, border, planet } = REBEL_BASE;

    this.wrap = document.createElement("div");
    this.wrap.id = "rebel_base_wrap";
    this.wrap.className = "limits-wrap rebel-base-wrap";

    this.panel = document.createElement("div");
    this.panel.id = "rebel_base_panel";
    this.panel.className = "limits-panel rebel-base-panel";
    this.panel.innerHTML =
      "<h3>Rebel Base</h3>" +
      '<svg id="rebel_base_svg" class="rebel-base-svg" viewBox="0 0 ' +
      width +
      " " +
      height +
      '" xmlns="http://www.w3.org/2000/svg">' +
      "<defs>" +
      '<radialGradient id="rebel_base_sphere" cx="0.35" cy="0.3" r="0.85">' +
      '<stop offset="0" stop-color="#4a4a58"/>' +
      '<stop offset="0.55" stop-color="#15151c"/>' +
      '<stop offset="1" stop-color="#020204"/>' +
      "</radialGradient>" +
      "</defs>" +
      // behind the system: the sphere, then the border
      '<circle cx="' +
      sphere.cx +
      '" cy="' +
      sphere.cy +
      '" r="' +
      sphere.r +
      '" fill="url(#rebel_base_sphere)" stroke="rgba(255,255,255,0.15)" ' +
      'stroke-width="1.5" pointer-events="none"/>' +
      '<path d="' +
      planet.bg +
      '" fill="none" stroke="' +
      border.color +
      '" stroke-width="' +
      border.width +
      '" stroke-linejoin="round" pointer-events="none"/>' +
      // the system itself (Planet draws into it), then the unit squares on top
      '<g id="' +
      name +
      '"></g>' +
      '<g id="' +
      planet.unitLayer +
      '" class="unit-mode-dependent" pointer-events="none"></g>' +
      "</svg>" +
      '<button type="button" class="button rebel-base-fill" id="rebel_base_fill_button">' +
      "Add remaining rebel units</button>" +
      '<p class="unit-empty">Select the base in unit mode to edit its units</p>';

    this.toggle = document.createElement("button");
    this.toggle.type = "button";
    this.toggle.className = "limits-toggle";

    this.wrap.append(this.panel, this.toggle);
    document.body.appendChild(this.wrap);

    // the Snap paper Planet draws into (the map passes it to Planet)
    this.svg = Snap("#rebel_base_svg");

    // set by the game: what the button does
    this.onFillRemaining = null;
    this.panel
      .querySelector("#rebel_base_fill_button")
      .addEventListener("click", () => {
        if (this.onFillRemaining) {
          this.onFillRemaining();
        }
      });

    this.toggle.addEventListener("click", () => this.setOpen(!this.open));

    // only one side panel open at a time
    document.addEventListener("sidepanel-open", (e) => {
      if (e.detail !== this && this.open) {
        this.setOpen(false);
      }
    });

    this.setOpen(false);
  }

  setOpen(open) {
    this.open = open;
    this.wrap.classList.toggle("open", open);
    this.toggle.textContent = "Rebel Base " + (open ? "\u25C0" : "\u25B6");
    if (open) {
      document.dispatchEvent(
        new CustomEvent("sidepanel-open", { detail: this }),
      );
    }
    refreshSidePanelState();
  }
}
