// Main Game class: setup, save/load, settings, menu and buttons.
// It owns two helper objects:  this.turnOrder (turnOrder.js)  and  this.buildQueue (buildQueue.js).

class Game {
  constructor() {
    this.map = new GameMap(this.save.bind(this));

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

    this.map.onSelect = (planet) => {
      console.log("Selected planet: " + (planet ? planet.name : "none"));
      if (planet) {
        this.unitPanel.show(planet.name, planet.units);
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
      this.toggleGameInfo();
    }
    // this.toggleGameInfo();
    this.showButtons();
    this.load();
  }

  save(name = "") {
    const data = {
      ...this.turnOrder.getState(),
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
    this.isAdvanced = data.isAdvanced;
    this.useExpansion = data.isExpansion;

    this.map.loadPlanets(data.map);
    this.unitPanel.clear();
    this.turnOrder.next();
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
    this.mode = playerNum;
    if (this.mode == 4) {
      this.isAdvanced = true;
    } else {
      this.isAdvanced = false;
    }
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
  }

  initNewGame() {
    this.map.reset();
    this.unitPanel.clear();

    this.updatePlayersNumber();
    this.updateUseExpansion();

    this.turnOrder.start("init");
  }

  // showStartMenu() {
  //     document.getElementsByClassName('button')[0].style.opacity = 1;
  //     document.getElementsByClassName('button')[1].style.opacity = 1;
  //     document.getElementsByClassName('continue')[0].addEventListener("click",function(){
  //         this.closeMenu();
  //         this.load();
  //     }.bind(this));
  //     document.getElementsByClassName('newgame')[0].addEventListener("click",function(){
  //         this.closeMenu();
  //         this.initNewGame();
  //     }.bind(this));
  // }

  // closeMenu() {
  //     let mask = document.getElementsByClassName('mask')[0];
  //     mask.style.opacity = 0;
  //     setTimeout(function () {
  //         mask.style.display = "none";
  //     },500);

  //     /*
  //     this.nextButton = document.getElementById('next_button');
  //     this.nextButton.style.display = 'flex';

  //     this.nextButton.addEventListener("click",);
  //     */
  //     showNavs();
  // }

  showButtons() {
    const imported_file_picker = document.getElementById("import_file");

    const buttons = {
      next_button: () => this.turnOrder.next(),
      menu_button: () => this.toggleGameInfo(),
      map_nav: () => this.map.setMapMode(),
      sabotage_nav: () => this.map.setSabotageMode(),
      probe_nav: () => this.map.setProbeMode(),
      unit_nav: () => this.map.setUnitMode(),

      set_starting_loyalty_button: () => {
        this.save("Backup");
        this.map.setStartingLoyalty();
      },

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
      useExpansion: () => this.updateUseExpansion(),
      pl2: () => this.setPlayersNumber(2),
      pl4: () => this.setPlayersNumber(4),
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

    // Game.showButton('next_button', function(){
    //     this.turnOrder.next();
    // }.bind(this));
    // Game.showButton('menu_button', function(){
    //     this.toggleGameInfo();
    // }.bind(this));
    // Game.showButton('map_nav', function(){
    //     this.map.setMapMode();
    // }.bind(this));
    // Game.showButton('sabotage_nav', function(){
    //     this.map.setSabotageMode();
    // }.bind(this));
    // Game.showButton('probe_nav', function(){
    //     this.map.setProbeMode();
    // }.bind(this));
    // Game.showButton('unit_nav', function(){
    //     this.map.setUnitMode();
    // }.bind(this));

    // Game.showButton('set_starting_loyalty_button', function(){
    //     this.save('Backup');
    //     this.map.setStartingLoyalty();
    // }.bind(this));
    // Game.showButton('reset_map_button', function(){
    //     this.save('Backup');
    //     this.map.reset();
    // }.bind(this));
    // Game.showButton('reset_game_button', function(){
    //     this.save('Backup');
    //     this.initNewGame();
    // }.bind(this));

    // Game.showButton('undo_reset_button', function(){
    //     this.load('Backup');
    // }.bind(this));
    // Game.showButton('useExpansion', function(){
    //     this.updateUseExpansion();
    // }.bind(this));
    // Game.showButton('pl2', function(){
    //     this.setPlayersNumber(2);
    // }.bind(this));
    // Game.showButton('pl4', function(){
    //     this.setPlayersNumber(4);
    // }.bind(this));
  }

  toggleGameInfo() {
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
      this.map.toggleClicks(true);
    }
  }

  static showButton(id, callback) {
    let button = document.getElementById(id);
    button.style.display = "flex";
    button.addEventListener("click", callback);
  }
}
