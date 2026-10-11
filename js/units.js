// Every unit in Star Wars: rebel.
// Units marked  expansion: true  exist only with the "Rise of the Empire" expansion.
//
//   getUnits(useExpansion [, faction])      -> array of { name, faction, expansion? }
//   getUnitNames(useExpansion [, faction])  -> array of names
//
// faction is 'empire' or 'rebel'; leave it out to get both factions.

// Resource types. The numbers match the ids used in map.js (planet "types").

const UNIT_RESOURCE_COLOR = Object.freeze({
  // BLUE: "#3175e2",
  // BLUE: "#2860bb",
  BLUE: "#22519b",
  // BLUE: "#14315f",

  // ORANGE: "#d8a10a",
  // ORANGE: "#ba8b09",
  ORANGE: "#9f7708",
  // ORANGE: "#705408",

  // MISSION: "#819f87",
  MISSION: "#5f7563",
  // MISSION: "#3e4c41",
});

const RESOURCE_ARENA_TO_COLOR = Object.freeze({
  ground: UNIT_RESOURCE_COLOR.ORANGE,
  space: UNIT_RESOURCE_COLOR.BLUE,
  mission: UNIT_RESOURCE_COLOR.MISSION,
});

const FACTION_BORDER_COLOR = Object.freeze({
  empire: "#272728",
  rebel: "#dbdbdc",
});

const FACTION_NAME_COLOR = Object.freeze({
  empire: "#272728",
  rebel: "#ffffff",
});

// Resource types. 1-6 match the ids used in map.js (planet "types").
const RESOURCE = Object.freeze({
  BLUE_TRIANGLE: 1,
  BLUE_CIRCLE: 2,
  BLUE_SQUARE: 3,
  ORANGE_TRIANGLE: 4,
  ORANGE_CIRCLE: 5,
  ORANGE_SQUARE: 6,
  MISSION_TRIANGLE: 7,
  MISSION_CIRCLE: 8,
  MISSION_SQUARE: 9,
});

const RESOURCE_INFO = Object.freeze({
  [RESOURCE.BLUE_TRIANGLE]: {
    color: UNIT_RESOURCE_COLOR.BLUE,
    shape: "triangle",
  },
  [RESOURCE.BLUE_CIRCLE]: { color: UNIT_RESOURCE_COLOR.BLUE, shape: "circle" },
  [RESOURCE.BLUE_SQUARE]: { color: UNIT_RESOURCE_COLOR.BLUE, shape: "square" },
  [RESOURCE.ORANGE_TRIANGLE]: {
    color: UNIT_RESOURCE_COLOR.ORANGE,
    shape: "triangle",
  },
  [RESOURCE.ORANGE_CIRCLE]: {
    color: UNIT_RESOURCE_COLOR.ORANGE,
    shape: "circle",
  },
  [RESOURCE.ORANGE_SQUARE]: {
    color: UNIT_RESOURCE_COLOR.ORANGE,
    shape: "square",
  },
  [RESOURCE.MISSION_TRIANGLE]: {
    color: UNIT_RESOURCE_COLOR.MISSION,
    shape: "triangle",
  },
  [RESOURCE.MISSION_CIRCLE]: {
    color: UNIT_RESOURCE_COLOR.MISSION,
    shape: "circle",
  },
  [RESOURCE.MISSION_SQUARE]: {
    color: UNIT_RESOURCE_COLOR.MISSION,
    shape: "square",
  },
});

// const FACTION = Object.freeze({
//   EMPIRE: "empire",
//   rebel: "rebel"
// });

// const UNIT_CLASS = Object.freeze({
//   TRIANGLE: "triangle",
//   CIRCLE: "circle",
//   SQUARE: "square"
// });

// const UNIT_ARENA = Object.freeze({
//   TRIANGLE: "triangle",
//   CIRCLE: "circle",
//   SQUARE: "square"
// });
const UNITS = [
  // ---------- Empire ----------

  // Ground
  {
    name: "Stormtrooper",
    arena: "ground",
    class: "triangle",
    faction: "empire",
  },
  {
    name: "Assault Tank",
    arena: "ground",
    class: "triangle",
    faction: "empire",
    expansion: true,
  },
  { name: "AT-ST", arena: "ground", class: "circle", faction: "empire" },
  {
    name: "Shield Bunker",
    arena: "ground",
    class: "circle",
    faction: "empire",
    expansion: true,
  },
  { name: "AT-AT", arena: "ground", class: "square", faction: "empire" },

  // Space
  { name: "TIE Fighter", arena: "space", class: "triangle", faction: "empire" },
  {
    name: "TIE Striker",
    arena: "space",
    class: "triangle",
    faction: "empire",
    expansion: true,
  },
  {
    name: "Assault Carrier",
    arena: "space",
    class: "circle",
    faction: "empire",
  },
  {
    name: "Star Destroyer",
    arena: "space",
    class: "square",
    faction: "empire",
  },
  {
    name: "Super Star Destroyer",
    arena: "space",
    class: "square",
    faction: "empire",
    mission: true,
  },
  {
    name: "Death Star",
    arena: "space",
    class: "square",
    faction: "empire",
    mission: true,
  },
  {
    name: "Death Star Under Construction",
    arena: "space",
    class: "square",
    faction: "empire",
    mission: true,
  },

  {
    name: "Interdictor",
    arena: "space",
    class: "square",
    faction: "empire",
    mission: true,
    expansion: true,
  },

  // ---------- Rebels ----------

  // Ground
  {
    name: "Rebel Trooper",
    arena: "ground",
    class: "triangle",
    faction: "rebel",
  },
  {
    name: "Rebel Vanguard",
    arena: "ground",
    class: "triangle",
    faction: "rebel",
    expansion: true,
  },
  { name: "Airspeeder", arena: "ground", class: "circle", faction: "rebel" },
  {
    name: "Golan Arms Turret",
    arena: "ground",
    class: "circle",
    faction: "rebel",
    expansion: true,
  },

  {
    name: "Shield Generator",
    arena: "ground",
    class: "square",
    faction: "rebel",
  },
  { name: "Ion Cannon", arena: "ground", class: "square", faction: "rebel" },

  // Space
  { name: "X-Wing", arena: "space", class: "triangle", faction: "rebel" },
  { name: "Y-Wing", arena: "space", class: "triangle", faction: "rebel" },
  {
    name: "U-Wing",
    arena: "space",
    class: "triangle",
    faction: "rebel",
    expansion: true,
  },
  {
    name: "Rebel Transport",
    arena: "space",
    class: "triangle",
    faction: "rebel",
  },
  {
    name: "Corellian Corvette",
    arena: "space",
    class: "circle",
    faction: "rebel",
  },
  {
    name: "Nebulon-B Frigate",
    arena: "space",
    class: "circle",
    faction: "rebel",
    expansion: true,
  },
  {
    name: "Mon Calamari Cruiser",
    arena: "space",
    class: "square",
    faction: "rebel",
  },

  // Rise of the Empire
];

const UNIT_SHORT = {
  "TIE Fighter": "TIE",
  "Assault Carrier": "ACar",
  "Star Destroyer": "SD",
  "Super Star Destroyer": "SSD",
  "Death Star": "DS",
  "Death Star Under Construction": "DS\u2692",
  Stormtrooper: "STr",
  "AT-ST": "ATST",
  "AT-AT": "ATAT",
  "TIE Striker": "T-S",
  Interdictor: "INT",
  "Assault Tank": "Tnk",
  "Shield Bunker": "SBnk",
  "X-Wing": "XW",
  "Y-Wing": "YW",
  "Rebel Transport": "Trs",
  "Corellian Corvette": "CCor",
  "Mon Calamari Cruiser": "MCC",
  "Rebel Trooper": "RTr",
  Airspeeder: "ASpd",
  "Shield Generator": "SGen",
  "Ion Cannon": "IonC",
  "U-Wing": "UW",
  "Nebulon-B Frigate": "NebB",
  "Rebel Vanguard": "Van",
  "Golan Arms Turret": "GTrt",
};

// Max number of each unit on the whole map. Edit any entry, e.g. UNIT_LIMITS["Death Star"] = 1;
const MAX_UNIT_LIMIT = 99;
const DEFAULT_UNIT_LIMIT = 9;
const UNIT_LIMITS = {};

UNITS.forEach(function (unit) {
  UNIT_LIMITS[unit.name] = DEFAULT_UNIT_LIMIT;
});

function getUnitLimit(name) {
  return name in UNIT_LIMITS ? UNIT_LIMITS[name] : DEFAULT_UNIT_LIMIT;
}

function setUnitLimit(name, value) {
  UNIT_LIMITS[name] = Math.max(0, Math.min(MAX_UNIT_LIMIT, value));
}

// A preset gives every unit `fill`, except the ones listed in `overrides`.
// These are examples: replace the numbers with the ones you actually want.
const UNIT_PRESETS = [
  {
    id: "setup",
    name: "Setup (base)",
    fill: 0,
    overrides: {
      // Empire
      "Star Destroyer": 3,
      "Assault Carrier": 3,
      "TIE Fighter": 12,
      "AT-AT": 1,
      "AT-ST": 5,
      Stormtrooper: 12,
      "Death Star": 1,
      // Rebels
      "Corellian Corvette": 1,
      "Rebel Transport": 1,
      "X-Wing": 2,
      "Y-Wing": 2,
      Airspeeder: 2,
      "Rebel Trooper": 6,
    },
  },
  {
    id: "setup_expansion",
    name: "Setup (Rise of the Empire)",
    fill: 0,
    overrides: {
      // Empire
      "Star Destroyer": 3,
      "Assault Carrier": 3,
      "TIE Fighter": 12,
      "TIE Striker": 3,
      "AT-AT": 1,
      "AT-ST": 4,
      Stormtrooper: 13,
      "Assault Tank": 2,
      "Death Star Under Construction": 1,
      // Rebels
      "Corellian Corvette": 1,
      "Rebel Transport": 1,
      "X-Wing": 1,
      "Y-Wing": 1,
      "U-Wing": 1,
      Airspeeder: 2,
      "Rebel Trooper": 5,
      "Rebel Vanguard": 1,
    },
  },
  // { id: "default", name: "Default (9 each)", fill: 9 },
  // { id: "low", name: "Low (5 each)", fill: 5 },
  {
    id: "max",
    name: "Maximum",
    fill: MAX_UNIT_LIMIT,
    overrides: { "Death Star": 1, "Super Star Destroyer": 1 },
  },
];

// Full { unitName: limit } dictionary for a preset (covers every unit, expansion or not)
function resolvePreset(preset) {
  const out = {};
  UNITS.forEach(function (unit) {
    const o = preset.overrides;
    out[unit.name] = o && unit.name in o ? o[unit.name] : preset.fill;
  });
  return out;
}

function applyUnitPreset(id) {
  const preset = UNIT_PRESETS.find(function (p) {
    return p.id === id;
  });
  if (!preset) {
    return;
  }
  const limits = resolvePreset(preset);
  Object.keys(limits).forEach(function (name) {
    setUnitLimit(name, limits[name]);
  });
}

// The preset the current limits are identical to, or null
function findMatchingPreset() {
  return (
    UNIT_PRESETS.find(function (preset) {
      const limits = resolvePreset(preset);
      return UNITS.every(function (unit) {
        return getUnitLimit(unit.name) === limits[unit.name];
      });
    }) || null
  );
}

function getUnitLimit(name) {
  return name in UNIT_LIMITS ? UNIT_LIMITS[name] : DEFAULT_UNIT_LIMIT;
}

function getUnitShort(name) {
  return UNIT_SHORT[name] || name.slice(0, 3).toUpperCase();
}

function getUnitResourceInfo(name) {
  const unit = UNITS.find((unit) => unit.name === name);
  // console.log("ok, fair enough");
  if (!unit) {
    console.log("unit empty");
    return null;
  }
  console.log(`unit not empty ${unit}`);

  if ("arena" in unit && "class" in unit && "faction" in unit) {
    let color = RESOURCE_ARENA_TO_COLOR[unit.arena];
    let shape = unit.class;
    let border = FACTION_BORDER_COLOR[unit.faction];
    let name_color = FACTION_NAME_COLOR[unit.faction];
    if (unit.mission === true) {
      color = UNIT_RESOURCE_COLOR.MISSION;
    }
    return {
      color: color,
      shape: shape,
      border: border,
      name_color: name_color,
    };
  }
  return null;
}

function getUnits(useExpansion, faction) {
  return UNITS.filter(function (unit) {
    return (
      (useExpansion || !unit.expansion) &&
      (!faction || unit.faction === faction)
    );
  });
}

function getUnitNames(useExpansion, faction) {
  return getUnits(useExpansion, faction).map(function (unit) {
    return unit.name;
  });
}

function getUnitFaction(name) {
  for (let i = 0; i < UNITS.length; i++) {
    if (UNITS[i].name === name) {
      return UNITS[i].faction;
    }
  }
  return null;
}
