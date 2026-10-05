// TurnOrder: knows the phases/steps of the game and moves through them.
// Created by Game:  this.turnOrder = new TurnOrder(this);
// It talks back to the game through this.game (settings, updateInfo, save, and the objects
// named in a step's "modes", e.g. ['map', 'setClicksAllowed', true] or ['buildQueue', 'showRebelBuild']).

class TurnOrder {
  /**
   * @param {Game} game
   * @param {HTMLElement} infoText
   */
  constructor(game, infoText) {
    this.game = game;
    this.infoText = infoText;

    this.currentPhase = "";
    this.currentStep = undefined;
    this.nextStep = "";

    this.initGameOrder();
  }

  // Start a phase from its first step (used for a new game)
  start(phase) {
    this.currentPhase = phase;
    this.run(phase);
  }

  // State that the game saves
  getState() {
    return {
      phase: this.currentPhase,
      step: this.currentStep,
    };
  }

  // Restore saved state; call next() afterwards to continue
  setState(phase, step) {
    this.currentPhase = "init";
    if (phase !== "") {
      this.currentPhase = phase;
    }
    this.nextStep = step;
  }

  next() {
    let phase = this.currentPhase;
    let nextStep = this.nextStep;

    // If next step is not set
    if (!nextStep) {
      if (this.gameOrder[phase].confirm) {
        if (!confirm("End phase?")) {
          return;
        }
      }

      phase = this.gameOrder[phase].next;
      this.currentPhase = phase;
      nextStep = undefined;
    }
    this.currentStep = nextStep;
    this.run(phase, nextStep);
    this.game.save();
  }

  run(key, next) {
    const phase = this.gameOrder[key];
    // Start a phase if next step is not selected
    next = next !== undefined ? next : phase.start;
    let current = phase[next];

    // updatePlayersNumber();
    // updateUseExpansion();

    if (this.game.useExpansion) {
      console.log("Running with expansion rules");
    }
    if (this.game.isAdvanced) {
      console.log("Running with 4 player mode");
    }

    // Check that this step is not only for expansion and skip it, if expansion is not used
    if (current.isExpansion !== undefined && this.game.useExpansion == false) {
      this.run(key, current.next);
      return;
      //current = phase[current.next];
    }

    // Check if we use expansion rules and if there any special step for expansion
    if (this.game.useExpansion && phase[next + "_exp"] !== undefined) {
      // If yes - use expansion rules
      next += "_exp";
      current = phase[next];
    }

    // Check if we have 4 player mode enabled and if current step have 4 player mode info
    if (this.game.isAdvanced && phase[next + "_adv"] !== undefined) {
      current = phase[next + "_adv"];
    }

    this.nextStep = current.next !== undefined ? current.next : null;

    console.log("Running [" + key + "->" + next + "]");

    this.updateInfo(current.info);
    if (current.modes) {
      current.modes.forEach(this.runMode.bind(this));
    }
  }

  updateInfo(text) {
    this.infoText.innerHTML = text;
  }

  runMode(data) {
    const el = data[0] == "this" ? this.game : this.game[data[0]],
      func = data[1],
      param = data[2] !== undefined ? data[2] : null;
    el[func](param);
  }

  initGameOrder() {
    this.gameOrder = {
      // Phase
      init: {
        // First block of this phase that will be shown
        start: "setup",
        // Link to the next phase, when step->next block is null
        next: "assignment",

        // Step information
        // Setup step cover 1 and 2 steps from setup guide
        setup: {
          // Message to show above the map
          info:
            "<strong>Setup</strong>: " +
            "Choose Factions and gather components. Take starting leaders for each faction<br />" +
            "<strong>Empire</strong>: Darth Vader, General Tagge, Palpatine, Moff Tarkin<br />" +
            "<strong>Rebels</strong>: General Rieekan, Princess Leia, Jan Dodonna, Mon Mothma",
          // Link to the next phase inside current phase
          next: "game_board",
        },

        // Rules Setup, step 3
        game_board: {
          info:
            "<strong>Setup</strong>: " +
            'Prepare Time tracker <br />Time marker on space "1" and reputation marker on space "14"',
          next: "prepare_objective",
        },

        // Rules Setup, step 4
        prepare_objective: {
          info:
            "<strong>Setup</strong>: Prepare Objective Deck <br />" +
            "Sort the objective cards into three piles based on the number on the card back. Shuffle each pile and place them I->II->III to make a deck.<br />",
          next: "prepare_objective_end",
        },

        // Rules Setup, step 4, expansion
        prepare_objective_exp: {
          info:
            "<strong>Setup</strong>: Sort the objective cards info three files according to the numbers <br />" +
            'Build a III deck with 1 "Death Star Plans" card and 4 random cards. Build a sII deck with 1 "Death Star Plans" and 4 random sII cards <br />' +
            "Shuffle the sI pile and deal 5 random cards onto the top of sII deck. Return all unused to game box",
          next: "prepare_objective_end",
        },

        prepare_objective_end: {
          info:
            "<strong>Setup</strong>:<br />" +
            "<strong>Rebel player</strong> draw one card from the objective deck and keep it secret.",
          next: "before_prepare_action",
        },

        // Rules that are used before using expansion cards - need to replace some cards.
        before_prepare_action: {
          info:
            "<strong>Expansion</strong>: Remove cards listed below and use replacement from expansion<br />" +
            "<strong>Sabotage</strong> (Rebel mission card), <strong>Son of Skywalker</strong> (Rebel action card)<br />" +
            "<strong>Good intel</strong> (Imperial action card), <strong>Construct Super Star Destroyer</strong> (both copies of this Imperial mission card)",
          next: "prepare_action",
          // This block will be shown only if expansion rules are selected. If not - will be skipped to next
          isExpansion: true,
        },

        // Rules Setup, step 5
        prepare_action: {
          info:
            "<strong>Setup</strong>:<br />" +
            "Take all actions cards (small) with recruit icon above them, shuffle.",
          next: "prepare_tactics",
        },

        // Rules Setup, step 6
        prepare_tactics: {
          info:
            "<strong>Setup</strong>:<br />" +
            "Shuffle the space and ground tactics decks individually and place them within easy reach.",
          next: "before_prepare_missions",
        },

        // Rules Setup, step 6, expansion
        prepare_tactics_exp: {
          info:
            "<strong>Setup</strong>:<br />" +
            "Each player takes his space and ground tactics cards to his hand.",
          next: "before_prepare_missions",
        },

        before_prepare_missions: {
          info:
            "<strong>Choosing mission sets for each player</strong>: Each player selects one card from missions and show them simultaneously.<br />" +
            "If card have Darth Vader icon - use expansion cards (remove all <strong>mission cards</strong> that do not have Leader or Vader icon) <br/>" +
            "Other vise use default cards - remove all cards from the <strong>missions</strong> that have Darth Vader icon",
          next: "prepare_missions",
          isExpansion: true,
        },

        prepare_missions: {
          info:
            "<strong>Starting Missions</strong>: take 4 starting missions (curved arrow) <br />" +
            "<strong>Projects</strong>: shuffle all projects (white star) and place them aside <br />" +
            "<strong>Remaining</strong>: shuffle and place into mission deck slot",
          next: "planet_selection",
        },

        planet_selection: {
          info:
            "Shuffle the probe deck and reveal cards from the top of the deck until <strong>3 Rebel</strong> systems and <strong>5 Imperial</strong> systems have been revealed.<br />" +
            "Place a <strong>Rebel loyalty</strong> marker in each of the <strong>3 Rebel</strong> systems.<br />" +
            "Place a <strong>subjugation marker</strong> in the <strong>first 2 Imperial</strong> systems drawn and " +
            "an <strong>Imperial loyalty marker</strong> in each of the <strong>other 3 Imperial</strong> systems drawn.",
          modes: [
            // ["map", "setClicksAllowed", true],
            ["map", "setClickMode", "toggleLoyalty"],
            ["map", "setStartingLoyalty"],
          ],
          next: "before_set_ships_empire",
        },

        before_set_ships_empire: {
          info:
            "Players must agree to choose either expansion set of starting units, or base game one.<br />" +
            "Both modes will be shown next.",
          // modes: [["map", "setClicksAllowed", false]],
          next: "set_ships_empire",
          isExpansion: true,
        },

        set_ships_empire: {
          info:
            "<strong>Base game:</strong> The Imperial player receives 3 Star Destroyers, 3 Assault Carriers, 12 TIE Fighters, 12 Stormtroopers, 5 AT-STs, 1 AT-AT,<br />" +
            "and 1 Death Star. These units can be placed in any system that has an Imperial loyalty marker or subjugation marker. <br />" +
            "At least 1 ground unit must be placed in each Imperial system.",
          // modes: [["map", "setClicksAllowed", false]],
          next: "set_ships_expansion_empire",
        },

        set_ships_expansion_empire: {
          info:
            "<strong>Expansion:</strong> The Imperial player places 1 DS on space 3 of building queue. Then he chooses <strong>any</strong> remote system and places</br>" +
            "4 TIE Fighters, 1 Stormtroopers and 1 Death Star Under Construction in that system.<br />" +
            "Also remove remote system from probe deck.",
          next: "set_ships_expansion_empire2",
          isExpansion: true,
        },

        set_ships_expansion_empire2: {
          info:
            "<strong>Expansion:</strong> Then he takes 8 TIE Fighters, 3 Assault Carriers, 3 Star Destroyers, 2 TIE Strikers, 12 Stormtroopers, 4 AT-STs, </br>" +
            "2 Assault Tanks and 1 AT-AT. These units can be placed in any system that has an Imperial loyalty marker, subjugation marker, <br />" +
            "or Death Star Under Construction. At least 1 ground unit must be placed in each Imperial system.",
          next: "set_ships_rebel",
          isExpansion: true,
        },

        set_ships_rebel: {
          info:
            "<strong>Base game:</strong> The Rebel player receives 1 Corellian Corvette, 1 Rebel Transport,<br />" +
            "2 X-wings, 2 Y-wings, 6 Rebel Troopers, and 2 Airspeeders. <br />" +
            "These units can be placed in the “Rebel Base” space of the game board and/or in any <strong>one</strong> Rebel or neutral system.",
          next: "set_ships_expansion_rebel",
        },

        set_ships_expansion_rebel: {
          info:
            "<strong>Expansion:</strong> The Rebel player receives 1 X-wing, 1 Y-wing, 1 Rebel transport, 1 Corellian Corvette,<br />" +
            "5 Rebel Troopers, 2 Airspeeders and 1 Rebel Vanguard.<br />" +
            "These units can be placed in the “Rebel Base” space of the game board and/or in any <strong>one</strong> Rebel or neutral system.",
          next: "draw_starting_actions",
          isExpansion: true,
        },

        draw_starting_actions: {
          info:
            "Each faction draws two random starting action cards (i.e., the action cards without a recruit icon on them).<br />" +
            "These cards provide special, once-per-game abilities.",
          next: "select_base",
        },

        select_base: {
          info: "Choose Rebel Base Location",
          next: "draw_starting_hand",
        },

        draw_starting_hand: {
          info: "Draw Starting Hand: Each player takes his four starting missions and draws two cards from his mission",
          next: null,
        },
      },

      assignment: {
        start: "rebel_assignment",
        next: "command",

        rebel_assignment: {
          info:
            "<strong>Assignment phase.</strong><br />" +
            "The <strong>Rebel player starts</strong> by assigning any of his leaders to missions. When he is finished, the Imperial player assigns any of his leaders to missions.",
          next: null,
        },
      },

      command: {
        start: "command_phase",
        next: "refresh",
        confirm: true,

        command_phase: {
          info:
            "<strong>Command phase.</strong><br />" + "Order: Rebel -> Empire",
          modes: [
            // ["map", "setClicksAllowed", true],
            ["map", "setClickMode", "toggleLoyalty"],
          ],
          next: null,
        },

        command_phase_adv: {
          info:
            "<strong>Command phase.</strong><br />" +
            'Order: <span class="admiral">Rebel Admiral</span>, <span class="admiral">Empire Admiral</span>, <br />' +
            '<span class="general">Empire General</span>, <span class="general">Rebel General</span><br />',
          modes: [
            // ["map", "setClicksAllowed", true],
            ["map", "setClickMode", "toggleLoyalty"],
          ],
          next: null,
        },
      },

      refresh: {
        start: "refresh_start",
        next: "assignment",

        refresh_start: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            '<strong>Rebel player</strong>: "Start of Refresh Phase" objectives',
          // modes: [["map", "setClicksAllowed", false]],
          next: "retrieve_leaders",
        },

        retrieve_leaders: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            "Retrieve Leaders. <br />Captured leaders stays on the map as units.",
          next: "draw_missions",
        },

        draw_missions: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            "Draw Missions: Each player draws two mission cards and, if there are more than 10 cards in his hand, he discards down to 10 cards",
          next: "launch_probe_droid",
        },

        draw_missions_adv: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            'Draw Missions: Each <span class="general">General</span> player draws two mission cards and, if there are more than 10 cards in his hand, he discards down to 10 cards',
          next: "launch_probe_droid",
        },

        launch_probe_droid: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            "<strong>Imperial player</strong> draws two probe cards",
          modes: [
            // ["map", "setClicksAllowed", true],
            ["map", "setClickMode", "toggleLoyalty"],
          ],
          next: "draw_objective",
        },

        launch_probe_droid_adv: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            '<strong>Imperial <span class="general">General</span></strong> draws two probe cards',
          modes: [
            // ["map", "setClicksAllowed", true],
            ["map", "setClickMode", "toggleLoyalty"],
          ],
          next: "draw_objective",
        },

        draw_objective: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            "The <strong>Rebel player</strong> draws one objective card and adds it to his hand.",
          // modes: [["map", "setClicksAllowed", false]],
          next: "advance_time_marker",
        },

        advance_time_marker: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            "Advance Time Marker: Advance the time marker one space along the track. ",
          next: "recruit",
        },

        recruit: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            "<strong>Recruit Icon</strong>: Each player draws two cards from his action deck, chooses one leader shown on either card, and places that leader in his leader pool.",
          next: "build_rebel",
        },

        recruit_adv: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            '<strong>Recruit Icon</strong>: Each <span class="general">general player</span> draws two cards from his action deck, chooses one leader shown on either card, and places that leader in his leader pool.',
          next: "build_rebel",
        },

        build_rebel: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            "<strong>Build Icon</strong>: Rebel player builds one unit matching each resource icon in his loyal.",
          modes: [["buildQueue", "showRebelBuild"]],
          next: "build_empire",
        },

        build_rebel_adv: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            '<strong>Build Icon</strong>: <span class="admiral">Rebel admiral</span> player builds one unit matching each resource icon in his loyal.',
          modes: [["buildQueue", "showRebelBuild"]],
          next: "build_empire",
        },

        build_empire: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            "<strong>Build Icon</strong>: Empire player builds one unit matching each resource icon in his loyal and subjugated systems.",
          modes: [["buildQueue", "showEmpireBuild"]],
          next: "deploy_rebel",
        },

        build_empire_adv: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            '<strong>Build Icon</strong>: <span class="admiral">Empire admiral</span> player builds one unit matching each resource icon in his loyal and subjugated systems.',
          modes: [["buildQueue", "showEmpireBuild"]],
          next: "deploy_rebel",
        },

        deploy_rebel: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            "<strong>Deploy Units</strong>: the <strong>Rebel</strong> player slides all units one space down his build queue.<br />" +
            "The player deploys these units in systems that have his loyalty. Max 2 units per system/rebel base.",
          modes: [["buildQueue", "hideBuild"]],
          next: "deploy_empire",
        },

        deploy_rebel_adv: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            '<strong>Deploy Units</strong>: the <span class="admiral">Rebel Admiral</span> player slides all units one space down his build queue.<br />' +
            "The player deploys these units in systems that have his loyalty",
          modes: [["buildQueue", "hideBuild"]],
          next: "deploy_empire",
        },

        deploy_empire: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            "<strong>Deploy Units</strong>: the <strong>Empire</strong> player slides all units one space down his build queue.<br />" +
            "The player deploys these units in systems that have his loyalty or subjugation markers.",
          next: null,
        },

        deploy_empire_adv: {
          info:
            "<strong>Refresh phase.</strong><br />" +
            '<strong>Deploy Units</strong>: the <span class="admiral">Empire Admiral</span> player slides all units one space down his build queue.<br />' +
            "The player deploys these units in systems that have his loyalty or subjugation markers.",
          next: null,
        },
      },
    };
  }
}
