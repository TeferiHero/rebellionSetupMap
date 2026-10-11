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
    str += this.addObject(
      "rebel",
      "loyalty",
      mapData.rebel,
      "unit-mode-hidden",
    );
    str += this.addObject(
      "empire",
      "loyalty",
      mapData.empire,
      "unit-mode-hidden",
    );
    str += this.addObject(
      "storm",
      "loyalty",
      mapData.storm,
      "unit-mode-hidden",
    );
    str += this.addObject(
      "rebel_storm",
      "loyalty",
      mapData.rebel_storm,
      "unit-mode-hidden",
    );
    str += this.addObject(
      "chewi",
      "loyalty",
      mapData.chewi,
      "unit-mode-hidden",
    );

    str += this.addObject(
      "probe",
      "probe",
      mapData.probe,
      "probe-mode-dependent",
    );
    str += this.addObject(
      "intel",
      "probe",
      mapData.intel,
      "probe-mode-dependent",
    );

    // Add resource icons
    str += this.addResourceIcons();

    // A layer for planet units TODO move to function
    // str += '<g id="units_' + name + '" pointer-events="none"></g>';

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

    const unitsNode = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    unitsNode.setAttribute("id", "units_" + name);
    // document.getElementById("UnitLayer").appendChild(unitsNode);
    document
      .getElementById(this.data.unitLayer || "UnitLayer")
      .appendChild(unitsNode);
    this.unitsLayer = Snap(unitsNode);
    // this.unitsLayer = this.planet.select("#units_" + name);
    this.renderUnits();

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
    this.renderUnits();

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

    this.sabotageFlag = !data.sabotage;
    this.toggleSabotage();
    // console.log(  "toggling sabotage on" + this.name + " value: " + this.sabotageFlag);
    // console.log(data);
    this.renderUnits();
  }

  addObject(key, translateKey, obj, mode_dependent = "") {
    const data = this.data[translateKey];
    let mode_dependent_str =
      mode_dependent !== "" ? 'class="' + mode_dependent + '" ' : "";
    return (
      "<g " +
      mode_dependent_str +
      ' id="' +
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
        '<g  class="unit-mode-hidden" id="queue_' +
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
            '<g class="unit-mode-hidden" id="res_' +
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
            '<g class="unit-mode-hidden" id="res_' +
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
            '<g class="unit-mode-hidden" id="res_' +
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
      '<g class="unit-mode-hidden" id="sabotage_' +
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

    // this.hide("sabotage");
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

    // TODO: MAYBE KEEP ? a planet with its own colour (the rebel base) keeps it in every loyalty state
    if (this.data.bgFill) {
      this.bg.attr({
        fill: this.data.bgFill,
        opacity: this.data.bgOpacity ?? 0.45,
      });
    }
  }

  toggleProbeStatus() {
    if (this.data.noProbe) {
      return; // this system can't be probed
    }
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

  getPrettyName() {
    const result = this.name.replace(/(?!^)([A-Z])/g, " $1");
    return result;
  }

  changePlanetUnits(unit, newAmount) {
    const next = Math.max(0, newAmount);
    this.units[unit] = next;
    this.renderUnits();
  }

  // Top-left corner of slot number i
  getUnitSlot(i) {
    const size = Planet.UNIT_SIZE,
      gap = Planet.UNIT_GAP;

    // 1) hand-placed slots from map.js:  unitSlots: ["100, 200", "135, 200"]
    const slots = this.data.unitSlots || [];
    if (i < slots.length) {
      const s = slots[i];
      const [x, y] = Array.isArray(s) ? s : String(s).split(",").map(Number);
      return [x, y];
    }

    // 2) automatic grid inside the planet's outline
    const n = i - slots.length;
    const box = this.bg.node.getBBox();
    const maxCols = this.data.unitCols || 4;
    const cols = Math.max(
      1,
      Math.min(maxCols, Math.floor((box.width - 20) / (size + gap))),
    );
    return [
      box.x + 10 + (n % cols) * (size + gap),
      box.y + 10 + Math.floor(n / cols) * (size + gap),
    ];
  }

  renderUnits() {
    // if (!unitsMode) {
    //   this.unitsLayer.node.innerHTML = str;
    // }
    if (!this.unitsLayer) {
      return;
    }
    const size = Planet.UNIT_SIZE;
    const order = typeof UNITS !== "undefined" ? UNITS.map((u) => u.name) : [];
    const rank = (u) => (order.indexOf(u) < 0 ? 999 : order.indexOf(u));

    const present = Object.keys(this.units)
      .filter((u) => this.units[u] > 0)
      .sort((a, b) => rank(a) - rank(b));

    let str = "";
    present.forEach((unit, i) => {
      const [x, y] = this.getUnitSlot(i);
      const faction =
        typeof getUnitFaction === "function" ? getUnitFaction(unit) : null;
      const fill =
        faction === "empire"
          ? "#5a1414"
          : faction === "rebel"
            ? "#7a4a00"
            : "#333";
      const label =
        typeof getUnitShort === "function" ? getUnitShort(unit) : unit;
      const resInfo =
        typeof getUnitResourceInfo === "function"
          ? getUnitResourceInfo(unit)
          : null;
      const resIcon = resInfo
        ? // ? this.resourceShape(resInfo, 3, 3, size * 0.3) // x, y offset and size of the icon
          this.resourceShape(resInfo, 2, 2, size - 4) // x, y offset and size of the icon
        : "";
      const nameStroke = "#fff";
      // const nameStroke = "name_color" in resInfo ? resInfo.name_color : "#fff";

      const isTriangleOffset =
        "shape" in resInfo && resInfo.shape === "triangle" ? 15 : 0;
      str +=
        '<g class="unit-mode-dependent" transform="translate(' +
        x +
        "," +
        y +
        ')">' +
        // The square
        // '<rect width="' +
        // size +
        // '" height="' +
        // size +
        // '" rx="3" fill="' +
        // fill +
        // '" stroke="#fff" stroke-width="1.5"/>' +
        // the resource icon
        resIcon +
        // The name text
        '<text x="' +
        size / 2 +
        '" y="' +
        (size / 2 + isTriangleOffset) +
        '" text-anchor="middle" dy=".35em" font-size="20" fill="' +
        nameStroke +
        // '"#0a0a0a"' +
        '" stroke="none">' +
        // '" stroke="#0a0a0a" stroke-width="1">' +

        label +
        "</text>" +
        // The number of units text
        '<text x="' +
        (size - 3) +
        '" y="' +
        (size - 3) +
        '" text-anchor="end" font-size="20" font-weight="bold" fill="#fff" ' +
        'stroke="#000" stroke-width="3" paint-order="stroke">' +
        this.units[unit] +
        "</text>" +
        "<title>" +
        unit +
        "</title></g>";
    });
    this.unitsLayer.node.innerHTML = str;
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

  // SVG for one resource marker (typeId 1-6, see the table in map.js) in an s x s box at x,y
  resourceShape(info, x, y, s) {
    // const info = RESOURCE_INFO[typeId];
    if (!info) {
      return "";
    }
    let stroke = "#fff";
    if ("border" in info) {
      stroke = info.border;
    }
    const look =
      ' fill="' + info.color + '" stroke="' + stroke + '" stroke-width="3"';
    switch (info.shape) {
      case "triangle":
        return (
          '<polygon points="' +
          x +
          "," +
          (y + s) +
          " " +
          (x + s / 2) +
          "," +
          y +
          " " +
          (x + s) +
          "," +
          (y + s) +
          '"' +
          look +
          "/>"
        );
      case "circle":
        return (
          '<circle cx="' +
          (x + s / 2) +
          '" cy="' +
          (y + s / 2) +
          '" r="' +
          s / 2 +
          '"' +
          look +
          "/>"
        );
      default:
        return (
          '<rect x="' +
          x +
          '" y="' +
          y +
          '" width="' +
          s +
          '" height="' +
          s +
          '"' +
          look +
          "/>"
        );
    }
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

Planet.UNIT_SIZE = 60;
Planet.UNIT_GAP = 4;
