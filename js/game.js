// Main Game class: setup, save/load, settings, menu and buttons.
// It owns two helper objects:  this.turnOrder (turnOrder.js)  and  this.buildQueue (buildQueue.js).

class Game {
  constructor() {
    // Setting up Map and RebelBase interactions
    this.rebelBasePanel = new RebelBasePanel();
    this.map = new GameMap(this.save.bind(this), {
      [REBEL_BASE.name]: this.rebelBasePanel.svg,
    });
    this.rebelBasePanel.onFillRemaining = () => this.fillRebelBase();
    // this.map = new GameMap(this.save.bind(this));

    // Amount of players mode
    this.mode = 2;
    this.menuShown = true;
    this.isAdvanced = false;
    this.useExpansion = false;

    this.mapData = {};

    this.unitPanel = new UnitPanel(
      document.getElementById("unit_panel"),
      (unit, newAmount) => {
        this.map.getSelectedPlanet().changePlanetUnits(unit, newAmount);
        this.save();
      },
      () => getUnitNames(this.useExpansion),
      () => Object.values(this.map.getPlanetsData() || {}),
    );

    this.limitsPanel = new LimitsPanel(
      () => {
        this.unitPanel.refresh(); // rows and +/- states depend on the limits
        this.save();
      },
      (faction) => getUnitNames(this.useExpansion, faction),
    );

    this.map.onSelect = (planet) => {
      console.log("Selected planet: " + (planet ? planet.name : "none"));
      if (planet) {
        const planetName = planet.getPrettyName
          ? planet.getPrettyName()
          : planet.name;
        this.unitPanel.show(planetName, planet.units);
      } else {
        this.unitPanel.clear();
      }
    };

    // Helper objects the game talks to
    this.buildQueue = new BuildQueue(
      this,
      document.getElementById("build_queue"),
    );
    this.turnOrder = new TurnOrder(this, document.getElementById("game_info"));

    // this.showStartMenu();
    if (this.menuShown) {
      this.toggleTurnInfo();
    }
    // this.toggleTurnInfo();
    this.showButtons();
    // a link pasted into the address bar while the page is open
    window.addEventListener("hashchange", () => this.openSharedLink());
    this.loadFromLinkOrStorage();
  }

  save(name = "") {
    const data = {
      ...this.turnOrder.getState(),
      unitLimits: { ...UNIT_LIMITS },
      isAdvanced: this.isAdvanced,
      isExpansion: this.useExpansion,
      map: this.map.savePlanets(),
    };
    localStorage.setItem(`rebellionData${name}`, JSON.stringify(data));
    return data;
  }

  load(name = "") {
    let data = undefined;
    try {
      data =
        JSON.parse(localStorage.getItem(`rebellionData${name}`) || "") || false;
      if (!data || typeof data !== "object") {
        alert("New game");
        this.initNewGame();
        return;
      }
    } catch (e) {
      alert("New game");
      this.initNewGame();
      return;
    }

    console.log("Load data:");
    console.log(data);

    this.turnOrder.setState(data.phase, data.step);
    this.setPlayersNumber(data.isAdvanced ? 4 : 2);
    this.setUseExpansion(data.isExpansion);
    // this.isAdvanced = data.isAdvanced;
    // this.useExpansion = data.isExpansion;

    if (data.unitLimits) {
      Object.assign(UNIT_LIMITS, data.unitLimits);
    }
    this.limitsPanel.render();

    this.map.loadPlanets(data.map);
    this.unitPanel.clear();
    this.turnOrder.next();
  }

  async copyShareLink() {
    const code = await encodeState(this.save());
    let origin = location.origin;
    console.log(origin);
    console.log(location.protocol);
    if (location.protocol === "file:") {
      origin = "file://";
    }
    const url = origin + location.pathname + "#s=" + code;
    console.log(location.origin);
    console.log(location.pathname);
    console.log(code);

    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied (" + url.length + " characters)");
    } catch (e) {
      prompt("Copy this link:", url); // clipboard needs https or localhost
    }
  }
  // Open a shared link if there is one, otherwise load the normal save
  async loadFromLinkOrStorage() {
    if (!(await this.openSharedLink())) {
      this.load();
    }
  }

  // Looks for #s=... in the address. Returns true if a shared game was loaded.
  async openSharedLink() {
    const match = location.hash.match(/^#s=(.+)$/);
    if (!match) {
      return false;
    }

    let loaded = false;
    try {
      const data = await decodeState(match[1]);
      if (!data || typeof data !== "object" || !("map" in data)) {
        throw new Error("not a game link");
      }
      if (confirm("Load the shared game? It replaces your current game.")) {
        this.save("Backup"); // "Undo reset" can bring the old game back
        localStorage.setItem("rebellionData", JSON.stringify(data));
        loaded = true;
      }
    } catch (e) {
      alert("Could not open the link: " + e.message);
    }

    // remove the code from the address, so a refresh doesn't ask again
    // (replaceState doesn't fire hashchange)
    history.replaceState(null, "", location.pathname + location.search);

    if (loaded) {
      this.load();
    }
    return loaded;
  }

  exportSave() {
    const data = this.save();
    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rebellion-save.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async importSave(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== "object" || !("map" in data)) {
        throw new Error("this is not a save file");
      }
      localStorage.setItem("rebellionData", JSON.stringify(data));
      this.load();
    } catch (e) {
      alert("Could not import: " + e.message);
    }
  }

  updatePlayersNumber() {
    const mode = document.getElementsByName("players");

    console.log("Current mode: " + this.mode + " players");
    for (let i = 0; i < mode.length; i++) {
      if (mode[i].checked) {
        this.setPlayersNumber(mode[i].value);
        break;
      }
    }
  }

  setPlayersNumber(playerNum) {
    const pl2 = document.getElementById("pl2");
    const pl4 = document.getElementById("pl4");

    this.mode = playerNum;
    if (this.mode == 4) {
      this.isAdvanced = true;
      pl4.checked = true;
    } else {
      this.isAdvanced = false;
      pl2.checked = true;
    }
    // this.save();
  }

  updateUseExpansion() {
    console.log("Updating use of expansion rules");
    const expansion = document.getElementById("useExpansion");
    if (expansion.checked) {
      this.useExpansion = true;
      console.log("Using expansion rules");
    } else {
      this.useExpansion = false;
    }
    this.unitPanel.refresh();
    this.limitsPanel?.render();
  }

  setUseExpansion(flag) {
    const expansion = document.getElementById("useExpansion");
    this.useExpansion = flag;
    expansion.checked = flag;
  }

  initNewGame() {
    this.map.reset();
    this.unitPanel.clear();

    this.updatePlayersNumber();
    this.updateUseExpansion();

    applyUnitPreset("setup");
    this.limitsPanel.render();
    this.turnOrder.start("init");
  }

  showButtons() {
    const imported_file_picker = document.getElementById("import_file");

    const buttons = {
      next_button: () => this.turnOrder.next(),
      menu_button: () => this.toggleTurnInfo(),
      loyalty_nav: () => {
        this.map.setMapMode();
        this.unitPanel.clear();
      },
      sabotage_nav: () => {
        this.map.setSabotageMode();
        this.unitPanel.clear();
      },
      probe_nav: () => {
        this.map.setProbeMode();
        this.unitPanel.clear();
      },
      unit_nav: () => this.map.setUnitMode(),

      set_starting_loyalty_button: () => {
        this.save("Backup");
        this.map.setStartingLoyalty();
      },
      // set_starting_loyalty_button: () => {
      //   this.save("Backup");
      //   this.map.setStartingLoyalty();
      // },

      reset_map_button: () => {
        this.save("Backup");
        this.map.reset();
        this.unitPanel.clear();
      },

      reset_game_button: () => {
        this.save("Backup");
        this.initNewGame();
      },

      undo_reset_button: () => this.load("Backup"),
      useExpansion: () => {
        this.updateUseExpansion();
        this.save();
      },
      pl2: () => {
        this.setPlayersNumber(2);
        this.save();
      },
      pl4: () => {
        this.setPlayersNumber(4);
        this.save();
      },
      share_link_button: () => this.copyShareLink(),
      export_save_button: () => this.exportSave(),
      import_save_button: () => imported_file_picker.click(),
    };

    imported_file_picker.addEventListener("change", () => {
      if (imported_file_picker.files[0]) {
        this.importSave(imported_file_picker.files[0]);
      }
      imported_file_picker.value = ""; // lets you pick the same file again later
    });

    Object.entries(buttons).forEach(([id, action]) => {
      Game.showButton(id, action);
    });
  }

  // Put every rebel unit that is not on the map yet into the Rebel Base,
  // so the whole map ends up with the max of each rebel unit
  fillRebelBase() {
    const planetsData = this.map.getPlanetsData() || {};
    const planets = Object.values(planetsData);
    const base = planetsData[REBEL_BASE.name];
    if (!base) {
      return;
    }

    let added = 0;
    getUnitNames(this.useExpansion, "rebel").forEach((unit) => {
      let total = 0;
      planets.forEach((p) => {
        total += (p.units && p.units[unit]) || 0;
      });
      const remaining = getUnitLimit(unit) - total;
      if (remaining > 0) {
        base.changePlanetUnits(unit, (base.units[unit] || 0) + remaining);
        added += remaining;
      }
    });

    if (added === 0) {
      alert("There are no remaining rebel units to add.");
      return;
    }
    this.save();
    this.unitPanel.refresh(); // overview and planet rows depend on the new numbers
  }

  toggleTurnInfo() {
    let header = document.getElementById("game_info_container"),
      next = document.getElementById("next_button");

    const hide = true;
    if (!hide) {
      const display = this.menuShown ? "none" : "flex";
      header.style.display = display;
      next.style.display = display;
    } else {
      const opacity = this.menuShown ? 0 : 1;
      header.style.opacity = opacity;
      next.style.opacity = opacity;
    }

    this.menuShown = !this.menuShown;

    if (!this.menuShown) {
      this.map.setClicksAllowed(true);
    }
  }

  static showButton(id, callback) {
    let button = document.getElementById(id);
    button.style.display = "flex";
    button.addEventListener("click", callback);
  }
}
