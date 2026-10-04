// Every unit in Star Wars: Rebellion.
// Units marked  expansion: true  exist only with the "Rise of the Empire" expansion.
//
//   getUnits(useExpansion [, faction])      -> array of { name, faction, expansion? }
//   getUnitNames(useExpansion [, faction])  -> array of names
//
// faction is 'empire' or 'rebel'; leave it out to get both factions.

const UNITS = [
  // ---------- Empire ----------
  { name: "TIE Fighter", faction: "empire" },
  { name: "Assault Carrier", faction: "empire" },
  { name: "Star Destroyer", faction: "empire" },
  { name: "Super Star Destroyer", faction: "empire" },
  { name: "Death Star", faction: "empire" },
  { name: "Death Star Under Construction", faction: "empire" },
  { name: "Stormtrooper", faction: "empire" },
  { name: "AT-ST", faction: "empire" },
  { name: "AT-AT", faction: "empire" },
  // Rise of the Empire
  { name: "TIE Striker", faction: "empire", expansion: true },
  { name: "Interdictor", faction: "empire", expansion: true },
  { name: "Assault Tank", faction: "empire", expansion: true },
  { name: "Shield Bunker", faction: "empire", expansion: true },

  // ---------- Rebels ----------
  { name: "X-Wing", faction: "rebel" },
  { name: "Y-Wing", faction: "rebel" },
  { name: "Rebel Transport", faction: "rebel" },
  { name: "Corellian Corvette", faction: "rebel" },
  { name: "Mon Calamari Cruiser", faction: "rebel" },
  { name: "Rebel Trooper", faction: "rebel" },
  { name: "Airspeeder", faction: "rebel" },
  { name: "Shield Generator", faction: "rebel" },
  { name: "Ion Cannon", faction: "rebel" },
  // Rise of the Empire
  { name: "U-Wing", faction: "rebel", expansion: true },
  { name: "Nebulon-B Frigate", faction: "rebel", expansion: true },
  { name: "Rebel Vanguard", faction: "rebel", expansion: true },
  { name: "Golan Arms Turret", faction: "rebel", expansion: true },
];

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
