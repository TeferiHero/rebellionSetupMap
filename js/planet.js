class Planet {
  constructor(name, planetData, svg, mapData) {
    this.name = name;
    this.data = planetData;
    this.svg = svg;
    this.constLoyalty = planetData.const_loyalty || null;

    this.reset();

    this.planetContainer = document.getElementById(name);
    this.planet = svg.select("#" + name);

    // Set planet html and svg code
    let str =
      '<path id="BG_' + name + '" class="st45" d="' + planetData.bg + '"/>';

    str +=
      '<path id="SEL_' +
      name +
      '" d="' +
      planetData.bg +
      '" fill="none" ' +
      'stroke="#ffcc00" stroke-width="4" stroke-linejoin="round" pointer-events="none"/>';

    // Set markers
    str += this.addObject("rebel", "loyalty", mapData.rebel);
    str += this.addObject("empire", "loyalty", mapData.empire);
    str += this.addObject("storm", "loyalty", mapData.storm);
    str += this.addObject("rebel_storm", "loyalty", mapData.rebel_storm);
    str += this.addObject("chewi", "loyalty", mapData.chewi);

    str += this.addObject("probe", "probe", mapData.probe);
    str += this.addObject("intel", "probe", mapData.intel);

    // Add resource icons
    str += this.addResourceIcons();

    this.planetContainer.innerHTML += str;

    // Init hovers
    this.bg = this.planet.select("#BG_" + name);

    this.rebel = this.planet.select("#rebel_" + name);
    this.empire = this.planet.select("#empire_" + name);
    this.storm = this.planet.select("#storm_" + name);
    this.rebel_storm = this.planet.select("#rebel_storm_" + name);
    this.chewi = this.planet.select("#chewi_" + name);
    //this.imperial = this.planet.select('.imperial');

    this.probe = this.planet.select("#probe_" + name);
    this.intel = this.planet.select("#intel_" + name);

    this.sabotage = this.planet.select("#sabotage_" + name);

    this.selection = this.planet.select("#SEL_" + name);

    this.hideAllIcons();
    this.hideBackgrounds();
  }

  reset() {
    // Planet loyalty
    this.loyalty = this.constLoyalty > 0 ? this.constLoyalty : 0; // Neutral
    // Probe status
    this.probeStatus = 1; // Current probeStatus, empty
    // Is planet under sabotage
    this.sabotageFlag = false;

    this.units = {};

    // Not used
    // Show that in this system there is an opponent army
    this.underSiege = false;

    this.selected = false;

    this.hideAllIcons();
    this.hideBackgrounds();
    // this.updateLoyalty();
  }

  save() {
    return {
      loyalty: this.loyalty,
      probeStatus: this.probeStatus,
      sabotage: this.sabotageFlag,
      units: this.units,
    };
  }

  load(data) {
    this.loyalty = data.loyalty;
    this.probeStatus = data.probeStatus;
    this.units = data.units || {};

    this.sabotageFlag = !data.sabotageFlag;
    this.toggleSabotage();
  }

  addObject(key, translateKey, obj) {
    const data = this.data[translateKey];
    return (
      '<g id="' +
      key +
      "_" +
      this.name +
      '" transform="translate(' +
      data +
      ") " +
      obj.transform +
      '" fill=#fff stroke="none">' +
      obj.path +
      "</g>"
    );
  }

  addResourceIcons() {
    if (this.data.resource === undefined) {
      // No resources on this planet
      return "";
    }
    const data = this.data.resource,
      height = 32,
      name = this.name;
    let str =
        '<g id="queue_' +
        this.name +
        '">' +
        '<circle style="fill:#00bf00;stroke:#00bf00;stroke-width:1.6871;stroke-miterlimit:10;" cx="' +
        data.x +
        '" cy="' +
        data.y +
        '" r="' +
        height / 2 +
        '"></circle>' +
        '<text x="' +
        (data.x + 1) +
        '" y="' +
        (data.y + 1) +
        '" text-anchor="middle" stroke="#ffffff" stroke-width="2px" dy=".3em">' +
        data.queue +
        "</text>" +
        "</g>",
      offset = 0,
      len = 1;

    data.types.forEach(function (typeId, idx) {
      offset += height + 5;
      len++;
      const currentType = typeId % 3,
        color = typeId > 3 ? "#d8a10a" : "#3175e2",
        cx = data.x + offset,
        cy = data.y;

      switch (currentType) {
        case 1:
          const dx = height / 2;
          const triangle = [
            0 + cx - dx + "," + (height + cy - dx),
            height / 2 + cx - dx + "," + (0 + cy - dx),
            height + cx - dx + "," + (height + cy - dx),
          ];

          str +=
            '<g id="res_' +
            name +
            "_" +
            idx +
            '">' +
            '<polygon points="' +
            triangle.join(" ") +
            '" fill="' +
            color +
            '" />' +
            "</g>";

          break;
        case 2: // Circle
          str +=
            '<g id="res_' +
            name +
            "_" +
            idx +
            '">' +
            '<circle style="fill:' +
            color +
            ';" cx="' +
            cx +
            '" cy="' +
            cy +
            '" r="' +
            height / 2 +
            '"></circle>' +
            "</g>";
          break;
        default: // Square
          str +=
            '<g id="res_' +
            name +
            "_" +
            idx +
            '">' +
            '<rect x="' +
            (cx - height / 2) +
            '" y="' +
            (cy - height / 2) +
            '" width="' +
            height +
            '" height="' +
            height +
            '" fill="' +
            color +
            '"></rect>' +
            "</g>";
          break;
      }
    });

    // Sabotage marker
    str +=
      '<g id="sabotage_' +
      name +
      '">' +
      '<rect x="' +
      (data.x - height / 2 - 2) +
      '" y="' +
      (data.y - height / 2 - 2) +
      '" width="' +
      (len * (height + 5) + 4) +
      '" height="' +
      (height + 4) +
      '" fill="#ba0000" fill-opacity=".5"></rect>' +
      '<text x="' +
      (data.x + (height / 2) * len - 10) +
      '" y="' +
      (data.y + 3) +
      '" text-anchor="middle" stroke="#ffffff" stroke-width="1px" >Sabotage</text>' +
      "</g>";

    return str;
  }

  getButton() {
    return this.planet;
  }

  hideAllIcons() {
    this.hide("rebel");
    this.hide("empire");
    this.hide("storm");
    this.hide("rebel_storm");
    this.hide("chewi");

    this.hide("probe");
    this.hide("intel");

    this.hide("sabotage");
  }

  hideBackgrounds() {
    if (this.bg !== undefined) {
      this.bg.attr({ fill: "#000", opacity: 0.25 });
    }
    if (this.selection !== undefined) {
      this.selected = false;
      this.hide("selection");
    }
  }

  toggleSabotage() {
    if (this.data.resource === undefined) {
      // No resources on this planet
      return;
    }
    this.sabotageFlag = !this.sabotageFlag;
    if (this.sabotageFlag) {
      this.show("sabotage");
    } else {
      this.hide("sabotage");
    }
  }

  toggleLoyalty() {
    if (this.constLoyalty === null) {
      this.loyalty = (this.loyalty % 6) + 1; // 1 - 5
    }
    this.updateLoyalty();
  }

  updateLoyalty() {
    switch (this.loyalty) {
      case 1: // Green - Rebel
        this.bg.attr({ fill: "#00bf00", opacity: 0.4 });
        this.show("rebel");
        break;
      case 2: // Red - Subjugated Rebel
        this.bg.attr({ fill: "#bf0000", opacity: 0.6 });
        this.hide("rebel");
        this.show("rebel_storm");
        break;
      case 3: // Neutral Subjugated
        this.bg.attr({ fill: "#bf0000", opacity: 0.6 });
        this.hide("rebel_storm");
        this.show("storm");
        break;
      case 4: // Empire
        this.bg.attr({ fill: "#bf0000", opacity: 0.6 });
        this.hide("storm");
        this.show("empire");
        break;
      case 5: // Chewi - Empire loyalty under rebel siege (fleets or units)
        this.bg.attr({ fill: "#0000bf", opacity: 0.6 });
        this.hide("empire");
        this.show("chewi");
        break;
      default: // BLACK - Neutral
        this.bg.attr({ fill: "#000", opacity: 0.25 });
        this.hide("chewi");
    }
  }

  toggleProbeStatus() {
    this.probeStatus = (this.probeStatus % 3) + 1; // CYCLE TO NEXT STATE (1-3)
    this.updateProbeStatus();
  }

  updateProbeStatus() {
    let currentLoyalty = this.loyalty % 6;
    switch (this.probeStatus) {
      case 2: // ORANGE - PROBE DROID
        if (currentLoyalty < 2) {
          this.bg.attr({ fill: "#b96000", opacity: 0.6 });
        }
        this.show("probe");
        break;
      case 3: // AQUA - INTEL
        this.hide("probe");
        this.show("intel");
        if (currentLoyalty < 2) {
          this.bg.attr({ fill: "#009999", opacity: 0.6 });
        }
        break;
      default: // BLACK - NONE
        this.updateLoyalty();
        this.hide("intel");
    }
  }

  togglePlanetSelection() {
    if (this.selected) {
      this.unselectPlanetUnits();
    } else {
      this.selectPlanetUnits();
    }
  }

  selectPlanetUnits() {
    this.selected = true;
    this.show("selection");
    this.bg.addClass("planet-selected");
  }

  unselectPlanetUnits() {
    this.selected = false;
    this.hide("selection");
    this.bg.removeClass("planet-selected");
  }

  isSelected() {
    return this.selected;
  }

  changePlanetUnits(unit, newAmount) {
    const next = Math.max(0, newAmount);
    this.units[unit] = next;
  }

  getResources(ids) {
    if (this.data.resource === undefined) {
      // No resources on this planet
      return [];
    }
    if (ids.includes(this.loyalty) == false) {
      return [];
    }
    //console.log('Planet '+ this.name + ' is valid');
    if (this.sabotageFlag) {
      //console.log('Under sabotage, skipping');
      return [];
    }
    /*if(this.underSiege) {
            console.log('Is under attack, skipping');
            return [];
        }*/
    const data = this.data.resource;
    if (this.loyalty == 2 || this.loyalty == 3) {
      // Subjugated system
      //console.log('Is subjagated');
      return [{ type: data.types[0], q: data.queue }];
    }
    let res = [];
    data.types.forEach(function (el) {
      res.push({ type: el, q: data.queue });
    });
    return res;
  }

  hideProbeData() {
    this.hide("intel");
    this.hide("probe");
  }

  hide(el) {
    el = this[el];
    if (el) {
      el.attr({ display: "none" });
    }
  }

  show(el) {
    el = this[el];
    if (el) {
      el.attr({ display: "inline" });
    }
  }
}
