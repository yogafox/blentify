const randomInt = function (base, top) {
    // return a integer with value in [base, top]
    return Math.floor(Math.random() * (top - base + 1)) + base;
};

const shuffleArray = function (array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

class Map {
    // constant values
    MAX_MAP_TYPE = 9;
    static diffTypeMap = [[0], [1, 2, 3, 4], [5, 6, 7], [8, 9]];

    // static COLOR_TYPE = 'RGB';
    static COLOR_TYPE = 'HSL';
    static MAX_RGB_STEP = 30;
    static MIN_RGB_STEP = 10;
    static MAX_HUE_STEP = 30;
    static MIN_HUE_STEP = 0;
    static MAX_PERCENT_STEP = 20;
    static MIN_PERCENT_STEP = 0;

    static oppositeColor(color, colorType) {
        if (colorType === "HSL") return [(color[0] + 180) % 360, color[1], color[2]];
        else {
            let HSLColor = Map.RGBtoHSL(color);
            return [(HSLColor[0] + 180) % 360, HSLColor[1], HSLColor[2]];
        }
    }

    static sameColor(colorA, colorB) {
        for (let i = 0, size = colorA.length; i < size; i++) {
            if (colorA[i] !== colorB[i]) return false;
        }
        return true;
    }

    static validColor(color) {
        if (Map.COLOR_TYPE === 'RGB') {
            for (let i = 0; i < 3; i++) {
                if (color[i] > 255 || color[i] < 0) return false;
            }
            return true;
        } else if (Map.COLOR_TYPE === 'HSL') {
            return (color[0] >= 0 && color[0] < 360
                && color[1] >= 0 && color[1] <= 100
                && color[2] >= 0 && color[2] <= 100);
        } else return false;
    }

    static colorToString(color) {
        let ret = "";
        for (let i = 0, size = color.length; i < size; i++) {
            ret += color[i].toString() + '-';
        }
        return ret;
    }

    static uniqueColorArray(colorArray) {
        let hashMap = {};
        for (let i = 0, size = colorArray.length; i < size; i++){
            let str = Map.colorToString(colorArray[i]);
            if (hashMap[str]) return false;
            hashMap[str] = true;
        }
        return true;
    };

    static properStep(step, length) {
        if (Map.COLOR_TYPE === 'RGB') {
            for (let i = 0; i < 3; i++) {
                if (step[i] * length > 255) return false;
            }
            return true;
        } else if (Map.COLOR_TYPE === 'HSL') {
            let saturationEdge = step[1] * length,
                lightnessEdge = step[2] * length;
            return (saturationEdge >= -100 && saturationEdge <= 100
                && lightnessEdge >= -100 && lightnessEdge <= 100);
        } else return false;
    }

    static zeroStep(step) {
        for (let i = 0, size = step.length; i < size; i++) {
            if (step[i] !== 0) return false;
        }
        return true;
    }

    static sameStep(stepA, stepB) {
        for (let i = 0, size = stepA.length; i < size; i++) {
            if (stepA[i] !== stepB[i]) return false;
        }
        return true;
    }

    static RGBtoHSL(color) {
        let rRatio = Math.max(Math.min(color[0] / 255, 1), 0),
            gRatio = Math.max(Math.min(color[1] / 255, 1), 0),
            bRatio = Math.max(Math.min(color[2] / 255, 1), 0),
            max = Math.max(rRatio, gRatio, bRatio),
            min = Math.min(rRatio, gRatio, bRatio),
            delta = max - min,
            lightness = (max + min) / 2,
            saturation = 0,
            hue = 0;
        if (max !== min) {
            saturation = (lightness > 0.5) ? delta / (2 - max - min) : delta / (max + min);
            if (max === rRatio) hue = (gRatio - bRatio) / delta + (gRatio < bRatio ? 6 : 0);
            else if (max === gRatio) hue = (bRatio - rRatio) / delta + 2;
            else hue = (rRatio - gRatio) / delta + 4;
            hue = hue / 6;
        } else {
            hue = saturation = 0;
        }
        return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(lightness * 100)];
    }

    static HSLtoRGB(color) {
        let hRatio = Math.max(Math.min(color[0], 360), 0) / 360,
            sRatio = Math.max(Math.min(color[1], 100), 0) / 100,
            lRatio = Math.max(Math.min(color[2], 100), 0) / 100,
            value = (lRatio <= 0.5) ? lRatio * (1 + sRatio) : lRatio + sRatio - lRatio * sRatio,
            min = 2 * lRatio - value,
            type = Math.floor(hRatio * 6),
            fraction = hRatio * 6 - type,
            svValueFraction,
            rRatio = 0,
            gRatio = 0,
            bRatio = 0;
        if (value === 0) return [0, 0, 0];
        let sv = (value - min) / value;
        svValueFraction = sv * value * fraction;
        switch (type) {
            case 1:
                rRatio = value - svValueFraction;
                gRatio = value;
                bRatio = min;
                break;
            case 2:
                rRatio = min;
                gRatio = value;
                bRatio = min + svValueFraction;
                break;
            case 3:
                rRatio = min;
                gRatio = value - svValueFraction;
                bRatio = value;
                break;
            case 4:
                rRatio = min + svValueFraction;
                gRatio = min;
                bRatio = value;
                break;
            case 5:
                rRatio = value;
                gRatio = min;
                bRatio = value - svValueFraction;
                break;
            default:
                rRatio = value;
                gRatio = min + svValueFraction;
                bRatio = min;
                break;
        }
        return [Math.round(rRatio * 255), Math.round(gRatio * 255), Math.round(bRatio * 255)];
    }

    static randomColorRGB(type) {
        let r = randomInt(0, 255),
            g = randomInt(0, 255),
            b = randomInt(0, 255);
        if (type === "PureColor") {
            return Map.HSLtoRGB(Map.randomColorHSL("PureColor"));
        }
        return [r, g, b];
    }

    static randomColorHSL(type) {
        let h = randomInt(0, 359),
            s = randomInt(0, 100),
            l = randomInt(0, 100);
        if (type === "PureColor") return [h, 1, 50];
        return [h, s, l];
    }

    static randomColor(type) {
        return (Map.COLOR_TYPE === 'RGB') ? Map.randomColorRGB(type) : Map.randomColorHSL(type);
    }

    static randomRGBStep(type) {
        let r_step = randomInt(Map.MIN_RGB_STEP, Map.MAX_RGB_STEP),
            g_step = randomInt(Map.MIN_RGB_STEP, Map.MAX_RGB_STEP),
            b_step = randomInt(Map.MIN_RGB_STEP, Map.MAX_RGB_STEP);
        r_step = (Math.random() < 0.5) ? r_step : -r_step;
        g_step = (Math.random() < 0.5) ? g_step : -g_step;
        b_step = (Math.random() < 0.5) ? b_step : -b_step;
        return [r_step, g_step, b_step];
    }

    static randomHSLStep(type) {
        let h_step = randomInt(Map.MIN_HUE_STEP, Map.MAX_HUE_STEP),
            s_step = randomInt(Map.MIN_PERCENT_STEP, Map.MAX_PERCENT_STEP),
            l_step = randomInt(Map.MIN_PERCENT_STEP, Map.MAX_PERCENT_STEP);
        h_step = (Math.random() < 0.5) ? h_step : -h_step;
        s_step = (Math.random() < 0.5) ? s_step : -s_step;
        l_step = (Math.random() < 0.5) ? l_step : -l_step;
        if (type === "PureHue") return [h_step, 0, 0];
        else if (type === "PureSaturation") return [0, s_step, 0];
        else if (type === "PureLightness") return [0, 0, l_step];
        else return [h_step, s_step, l_step];
    }

    static randomStep(type) {
        let HSLStep = [],
            retStep = [];
        if (type === "PureHue") HSLStep =  Map.randomHSLStep("PureHue");
        else if (type === "PureSaturation") HSLStep = Map.randomHSLStep("PureSaturation");
        else if (type === "PureLightness") HSLStep =  Map.randomHSLStep("PureLightness");
        else {
            retStep = (Map.COLOR_TYPE === 'RGB') ? Map.randomRGBStep(type) : Map.randomHSLStep(type);
            while (Map.zeroStep(retStep)) {
                retStep = (Map.COLOR_TYPE === 'RGB') ? Map.randomRGBStep(type) : Map.randomHSLStep(type);
            }
            return retStep;
        }
        retStep = (Map.COLOR_TYPE === 'RGB') ? Map.HSLtoRGB(HSLStep) : HSLStep;
        while (Map.zeroStep(retStep)) retStep = (Map.COLOR_TYPE === 'RGB') ? Map.HSLtoRGB(HSLStep) : HSLStep;
        return retStep;
    }

    static addStep(color, step) {
        let ret = color.slice();
        for (let i = 0, size = color.length; i < size; i++) {
            ret[i] += step[i];
        }
        if (Map.COLOR_TYPE === 'HSL') ret[0] %= 360;
        return ret;
    }

    static minusStep(color, step) {
        let ret = color.slice();
        for (let i = 0, size = color.length; i < size; i++) {
            ret[i] -= step[i];
        }
        if (Map.COLOR_TYPE === 'HSL') ret[0] = (ret[0] + 360) % 360;
        return ret;
    }

    static interpolate(colorA, colorB, cnt) {
        // return the step from colorA to colorB with cnt steps
        // if the step is not valid, return -1;
        let size = colorA.length,
            diffColor = colorB.map((item, i) => (item - colorA[i])),
            step = [],
            check = colorA.slice();
        for (let i = 0; i < size; i++) {
            diffColor.push(colorB[i] - colorA[i]);
        }
        if (Map.COLOR_TYPE === 'HSL' && colorA[0] > colorB[0]) {
            diffColor[0] = colorB[0] + 360 - colorA[0];
        }
        for (let i = 0; i < size; i++) {
            step.push(Math.floor(diffColor[i] / cnt));
            if (step[i] !== diffColor[i] / cnt) return [];
        }
        for (let i = 0; i < cnt; i++) {
            check = Map.addStep(check, step);
        }
        if (Map.sameColor(colorB, check)) return step;
        else return [];
    }

    static checkConstraint(length, line, constraints) {
        for (let i = 0, check = 0; i < length && check < constraints.length; i++) {
            if (i === constraints[check][0]) {
                if (Map.sameColor(line[i], constraints[check][1]) === false) {
                    return false;
                }
                check++;
            }
        }
        return true;
    }

    static stepLineMaker(length, startColor, step) {
        let line = [startColor];
        for (let i = 0; i < length - 1; i++) {
            let newColor = Map.addStep(line[i], step);
            if (Map.validColor(newColor)) line.push(newColor);
            else {
                line = [];
                break;
            }
        }
        return [line, step];
    }

    static consStepLineMaker(length, step, constraints) {
        // constraints: an array of [place, color] tuple
        let ret = [];
        if (constraints.length === 0) {
            let baseColor = Map.randomColor();
            ret = Map.stepLineMaker(length, baseColor, step);
            while (ret[0].length !== length) {
                baseColor = Map.randomColor();
                ret = Map.stepLineMaker(length, baseColor, step);
            }
        } else if (constraints.length === 1) {
            let place = constraints[0][0],
                color = constraints[0][1];
            while (place > 0) {
                color = Map.minusStep(color, step);
                place--;
            }
            if (Map.validColor(color)) {
                ret = Map.stepLineMaker(length, color, step);
            }
            else ret = [[], step];
        } else if (constraints.length >= 2) {
            let placeDiff = constraints[1][0] - constraints[0][0],
                diffStep = Map.interpolate(constraints[0][1], constraints[1][1], placeDiff);
            if (diffStep.length === 0 || Map.sameStep(step, diffStep) === false) ret = [[], step];
            else {
                let place = constraints[0][0],
                    color = constraints[0][1];
                while (place > 0) {
                    color = Map.minusStep(color, step);
                    place--;
                }
                if (Map.validColor(color)) {
                    ret = Map.stepLineMaker(length, color, step);
                    if (ret[0].length !== length || Map.checkConstraint(length, ret[0], constraints) === false) {
                        ret = [[], step];
                    }
                }
            }
        }
        return ret;
    }

    static consLineMaker(length, constraints) {
        // constraints: an array of [place, color] tuple
        let ret = [];
        if (constraints.length === 0 || constraints.length === 1) {
            while (ret.length === 0 || ret[0].length !== length) {
                let step = Map.randomStep();
                while (Map.properStep(step, length) === false) step = Map.randomStep();
                ret = Map.consStepLineMaker(length, step, constraints);
            }
        } else if (constraints.length >= 2) {
            let placeDiff = constraints[1][0] - constraints[0][0],
                step = Map.interpolate(constraints[0][1], constraints[1][1], placeDiff);
            ret = Map.consStepLineMaker(length, step, constraints);
        }
        return ret;
    }

    static checkLockList(id, lockList) {
        for (let i = 0, size = lockList.length; i < size; i++) {
            if (id === lockList[i]) return true;
        }
        return false;
    };

    mapLogger = (type) => {
        for (let row = 0; row < this.height; row++) {
            let rowOut = [];
            for (let column = 0; column < this.width; column++) {
                let id = this.mapToId[row][column],
                    status = this.mapStatus[row][column],
                    color = this.idToColor[id];
                if (status === "Space") color = [0, 0, 0];
                if (type === "status") rowOut.push(status);
                else if (type === "color") rowOut.push(color);
            }
            console.log(rowOut);
        }
    };

    setType = (type) => {
        if (type !== 0) {
            this.type = type;
        } else {
            this.type = randomInt(1, this.MAX_MAP_TYPE);
        }
    };

    setPalette = (RGBPalette) => {
        if (Map.COLOR_TYPE === "RGB") this.palette = RGBPalette;
        else this.palette = RGBPalette.map((color) => (Map.RGBtoHSL(color)));
    };

    setSize = (type) => {
        switch (type) {
            case 1:
                this.width = randomInt(5, 9);
                this.height = 1;
                break;
            case 2:
                this.width = randomInt(5, 9);
                this.height = randomInt(2, 3) * 2 - 1;
                break;
            case 3:
                this.width = randomInt(2, 4) * 2 + 1;
                this.height = randomInt(2, 4) + 1;
                break;
            case 4:
                this.width = randomInt(2, 4) * 2 + 1;
                this.height = randomInt(2, 4) * 2 + 1;
                break;
            case 5:
            case 6:
            case 7:
                this.width = randomInt(3, 5);
                this.height = randomInt(3, 5);
                break;
            case 8:
                this.height = randomInt(3, 5);
                this.width = this.height * 2 - 1;
                break;
            case 9:
                let convert = [0, 0, 0, 1, 1, 2, 2, 3, 3, 4];
                this.height = randomInt(3, 9);
                this.width = randomInt(convert[this.height], 4) * 2 + 1;
                break;
            case 10:
                this.m = randomInt(1, 3);
                this.n = randomInt(1, 3);
                this.r = randomInt(1, 2);
                this.width = this.m + this.r * 2 + 2;
                this.height = this.n + this.r * 2 + 2;
                break;
            default:
                console.log("Set Size Error");
                break;
        }
    };

    setMap = (type) => {
        let mapId = 0;
        this.mapStatus = [];
        this.mapToId = [];
        this.idToMap = [];
        if (type === 1) {
            this.middle = Math.floor(this.width / 2);
            let lineStatus = [],
                lineToId = [];
            for (let column = 0; column < this.width; column++) {
                lineStatus.push("Color");
                lineToId.push(mapId);
                this.idToMap[mapId] = [0, column];
                mapId++;
            }
            this.mapStatus.push(lineStatus);
            this.mapToId.push(lineToId);
            this.tileCount = mapId;
            this.lineCount = 1;
        }
        else if (type === 2) {
            this.middle = Math.floor(this.width / 2);
            let lineStatus = [],
                lineToId = [];
            for (let row = 0; row < this.height; row++) {
                for (let column = 0; column < this.width; column++) {
                    if (row % 2 === 1) {
                        lineStatus.push("Space");
                        lineToId.push("Space");
                        continue;
                    }
                    lineStatus.push("Color");
                    lineToId.push(mapId);
                    this.idToMap[mapId] = [row, column];
                    mapId++;
                }
                this.mapStatus.push(lineStatus);
                this.mapToId.push(lineToId);
                lineStatus = [];
                lineToId = [];
            }
            this.tileCount = mapId;
            this.lineCount = Math.ceil(this.height / 2);
        }
        else if (type === 3) {
            this.middle = Math.floor(this.width / 2);
            this.columnPlace = randomInt(0, this.width - 1);
            this.rowPlace = randomInt(0, 1) * (this.height - 1);
            let lineStatus = [],
                lineToId = [];
            for (let row = 0; row < this.height; row++) {
                for (let column = 0; column < this.width; column++) {
                    if (row === this.rowPlace || column === this.columnPlace) {
                        if (row === this.rowPlace && column === this.columnPlace) {
                            this.intersectionId = mapId;
                        }
                        lineStatus.push("Color");
                        lineToId.push(mapId);
                        this.idToMap[mapId] = [row, column];
                        mapId++;
                    } else {
                        lineStatus.push("Space");
                        lineToId.push("Space");
                    }
                }
                this.mapStatus.push(lineStatus);
                this.mapToId.push(lineToId);
                lineStatus = [];
                lineToId = [];
            }
            this.tileCount = mapId;
            this.lineCount = 2;
        }
        else if (type === 4) {
            this.middle = Math.floor(this.width / 2);
            this.columnPlace = randomInt(0, this.width - 1);
            this.rowPlace = randomInt(0, this.height - 1);
            let lineStatus = [],
                lineToId = [];
            for (let row = 0; row < this.height; row++) {
                for (let column = 0; column < this.width; column++) {
                    if (row === this.rowPlace || column === this.columnPlace) {
                        if (row === this.rowPlace && column === this.columnPlace) {
                            this.intersectionId = mapId;
                        }
                        lineStatus.push("Color");
                        lineToId.push(mapId);
                        this.idToMap[mapId] = [row, column];
                        mapId++;
                    } else {
                        lineStatus.push("Space");
                        lineToId.push("Space");
                    }
                }
                this.mapStatus.push(lineStatus);
                this.mapToId.push(lineToId);
                lineStatus = [];
                lineToId = [];
            }
            this.tileCount = mapId;
            this.lineCount = 2;
        }
        else if (type === 5) {
            this.middle = Math.floor(this.width / 2);
            let lineStatus = [],
                lineToId = [];
            for (let row = 0; row < this.height; row++) {
                for (let column = 0; column < this.width; column++) {
                    lineStatus.push("Color");
                    lineToId.push(mapId);
                    this.idToMap[mapId] = [row, column];
                    mapId++;
                }
                this.mapStatus.push(lineStatus);
                this.mapToId.push(lineToId);
                lineStatus = [];
                lineToId = [];
            }
            this.tileCount = mapId;
            this.lineCount = this.height;
        }
        else if (type === 6) {
            this.middle = Math.floor(this.width / 2);
            let lineStatus = [],
                lineToId = [];
            for (let row = 0; row < this.height; row++) {
                for (let column = 0; column < this.width; column++) {
                    lineStatus.push("Color");
                    lineToId.push(mapId);
                    this.idToMap[mapId] = [row, column];
                    mapId++;
                }
                this.mapStatus.push(lineStatus);
                this.mapToId.push(lineToId);
                lineStatus = [];
                lineToId = [];
            }
            this.tileCount = mapId;
            this.lineCount = this.height;
        }
        else if (type === 7) {
            this.middle = Math.floor(this.width / 2);
            let lineStatus = [],
                lineToId = [];
            for (let row = 0; row < this.height; row++) {
                for (let column = 0; column < this.width; column++) {
                    lineStatus.push("Color");
                    lineToId.push(mapId);
                    this.idToMap[mapId] = [row, column];
                    mapId++;
                }
                this.mapStatus.push(lineStatus);
                this.mapToId.push(lineToId);
                lineStatus = [];
                lineToId = [];
            }
            this.tileCount = mapId;
            this.lineCount = this.height;
        }
        else if (type === 8) {
            this.middle = Math.floor(this.width / 2);
            let lineStatus = [],
                lineToId = [];
            for (let row = 0; row < this.height; row++) {
                for (let column = 0; column < this.width; column++) {
                    if (column >= (this.middle - row) && column <= (this.middle + row)) {
                        lineStatus.push("Color");
                        lineToId.push(mapId);
                        this.idToMap[mapId] = [row, column];
                        mapId++;
                    } else {
                        lineStatus.push("Space");
                        lineToId.push("Space");
                    }
                }
                this.mapStatus.push(lineStatus);
                this.mapToId.push(lineToId);
                lineStatus = [];
                lineToId = [];
            }
            this.tileCount = mapId;
            this.lineCount = this.height;
        }
        else if (type === 9) {
            this.middle = Math.floor(this.width / 2);
            let rest = this.height,
                restBar = [1, 3, 2, 2, 1],
                chosenBar = [0, 0, 0, 0, 0],
                lineStatus = [],
                lineToId = [];
            chosenBar[this.middle] += 1;
            restBar[this.middle] -= 1;
            rest -= 1;
            while (rest > 0) {
                let chosen = randomInt(0, this.middle);
                if (restBar[chosen] > 0 && (2 * chosen + 1) <= this.width) {
                    restBar[chosen]--;
                    chosenBar[chosen]++;
                    rest--;
                }
            }
            for (let barSize = 0, row = 0; barSize < 5; barSize++) {
                for (let bar = 0; bar < chosenBar[barSize]; bar++, row++) {
                    for (let column = 0; column < this.width; column++) {
                        if (column >= (this.middle - barSize) && column <= (this.middle + barSize)) {
                            lineStatus.push("Color");
                            lineToId.push(mapId);
                            this.idToMap[mapId] = [row, column];
                            mapId++;
                        } else {
                            lineStatus.push("Space");
                            lineToId.push("Space");
                        }
                    }
                    this.mapStatus.push(lineStatus);
                    this.mapToId.push(lineToId);
                    lineStatus = [];
                    lineToId = [];
                }
            }
            this.chosenBar = chosenBar;
            this.tileCount = mapId;
            this.lineCount = this.height;
        }
        else if (type === 10) {
            this.middle = Math.floor(this.width / 2);
        }
        else {
            console.log("Set Map Error");
        }
        console.log(this.mapToId);
    };

    mapLiner = (type) => {
        this.lines = [];
        if (type === 1) {
            let line = Map.consLineMaker(this.width, []);
            this.lines.push(line);
        }
        else if (type === 2) {
            for (let i = 0; i < this.lineCount; i++) {
                let line = Map.consLineMaker(this.width, []);
                this.lines.push(line);
            }
        }
        else if (type === 3) {
            let line = Map.consLineMaker(this.width, []),
                intersectionColor = line[0][this.columnPlace].slice();
            this.lines.push(line);
            line = Map.consLineMaker(this.height, [[this.rowPlace, intersectionColor]]);
            this.lines.push(line);
        }
        else if (type === 4) {
            let line = Map.consLineMaker(this.width, []),
                intersectionColor = line[0][this.columnPlace].slice();
            this.lines.push(line);
            line = Map.consLineMaker(this.height, [[this.rowPlace, intersectionColor]]);
            this.lines.push(line);
        }
        else if (type === 5) {
            while (this.lines.length !== this.height) {
                this.lines = [];
                let line = Map.consLineMaker(this.width, []),
                    intersectionColor = line[0][0].slice(),
                    rowStep = line[1].slice(),
                    columnLine = Map.consLineMaker(this.height, [[0, intersectionColor]]);
                this.lines.push(line);
                for (let i = 1; i < this.height; i++) {
                    intersectionColor = columnLine[0][i].slice();
                    line = Map.stepLineMaker(this.width, intersectionColor, rowStep);
                    if (line[0].length ===  0) break;
                    this.lines.push(line);
                }
            }
        }
        else if (type === 6) {
            while (this.lines.length !== this.height) {
                this.lines = [];
                let leftLine = Map.consLineMaker(this.height, []),
                    rightLine = Map.consLineMaker(this.height, []);
                for (let i = 0; i < this.height; i++) {
                    let leftColor = leftLine[0][i].slice(),
                        rightColor = rightLine[0][i].slice(),
                        line = Map.consLineMaker(this.width, [[0, leftColor], [this.width - 1, rightColor]]);
                    if (line[0].length === 0) break;
                    this.lines.push(line);
                }
            }
        }
        else if (type === 7) {
            // same as type 6
            while (this.lines.length !== this.height) {
                this.lines = [];
                let leftLine = Map.consLineMaker(this.height, []),
                    rightLine = Map.consLineMaker(this.height, []);
                for (let i = 0; i < this.height; i++) {
                    let leftColor = leftLine[0][i].slice(),
                        rightColor = rightLine[0][i].slice(),
                        line = Map.consLineMaker(this.width, [[0, leftColor], [this.width - 1, rightColor]]);
                    if (line[0].length === 0) break;
                    this.lines.push(line);
                }
            }
        }
        else if (type === 8) {
            while (this.lines.length !== this.height) {
                this.lines = [];
                let bottomLine = Map.consLineMaker(this.width, []),
                    rowStep = bottomLine[1],
                    intersectionColor = bottomLine[0][this.middle].slice(),
                    middleLine = Map.consLineMaker(this.height, [[this.height - 1, intersectionColor]]);
                for (let i = 0; i < this.height; i++) {
                    let middleColor = middleLine[0][i],
                        line = Map.consStepLineMaker(2 * i + 1, rowStep, [[i, middleColor]]);
                    if (line[0].length === 0) break;
                    this.lines.push(line);
                }
            }
        }
        else if (type === 9) {
            while (this.lines.length !== this.height) {
                this.lines = [];
                let bottomLine = Map.consLineMaker(this.width, []),
                    rowStep = bottomLine[1],
                    intersectionColor = bottomLine[0][this.middle].slice(),
                    middleLine = Map.consLineMaker(this.height, [[this.height - 1, intersectionColor]]);
                for (let barSize = 0, row = 0; barSize < 5; barSize++) {
                    for (let bar = 0; bar < this.chosenBar[barSize]; bar++, row++) {
                        let middleColor = middleLine[0][row],
                            length = 2 * barSize + 1,
                            line = Map.consStepLineMaker(length, rowStep, [[barSize, middleColor]]);
                        if (line[0].length === 0) break;
                        this.lines.push(line);
                    }
                }
            }
        }
        else if (type === 10) {

        } else {

        }
        console.log(this.lines);
    };

    paletteLiner = (type, palette) => {
        this.lines = [];
        if (type === 1) {
            let line = Map.consLineMaker(this.width, [[0, palette[0]]]);
            this.lines.push(line);
        }
        else if (type === 2) {
            for (let i = 0; i < this.lineCount; i++) {
                let line = Map.consLineMaker(this.width, []);
                if (i < palette.length) line = Map.consLineMaker(this.width, [[0, palette[i]]]);
                this.lines.push(line);
            }
        }
        else if (type === 3) {
            let line = Map.consLineMaker(this.width, [[0, palette[0]]]),
                intersectionColor = line[0][this.columnPlace].slice();
            this.lines.push(line);
            line = Map.consLineMaker(this.height, [[this.rowPlace, intersectionColor]]);
            this.lines.push(line);
        }
        else if (type === 4) {
            let line = Map.consLineMaker(this.width, [[0, palette[0]]]),
                intersectionColor = line[0][this.columnPlace].slice();
            this.lines.push(line);
            line = Map.consLineMaker(this.height, [[this.rowPlace, intersectionColor]]);
            this.lines.push(line);
        }
        else if (type === 5) {
            while (this.lines.length !== this.height) {
                this.lines = [];
                let line = Map.consLineMaker(this.width, [[0, palette[0]]]),
                    intersectionColor = line[0][0].slice(),
                    rowStep = line[1].slice(),
                    columnLine = Map.consLineMaker(this.height, [[0, intersectionColor]]);
                this.lines.push(line);
                for (let i = 1; i < this.height; i++) {
                    intersectionColor = columnLine[0][i].slice();
                    line = Map.stepLineMaker(this.width, intersectionColor, rowStep);
                    if (line[0].length ===  0) break;
                    this.lines.push(line);
                }
            }
        }
        else if (type === 6) {
            while (this.lines.length !== this.height) {
                this.lines = [];
                let leftLine = Map.consLineMaker(this.height, [[0, palette[0]]]),
                    rightLine = Map.consLineMaker(this.height, [[this.height - 1, palette[1]]]);
                for (let i = 0; i < this.height; i++) {
                    let leftColor = leftLine[0][i].slice(),
                        rightColor = rightLine[0][i].slice(),
                        line = Map.consLineMaker(this.width, [[0, leftColor], [this.width - 1, rightColor]]);
                    if (line[0].length === 0) break;
                    this.lines.push(line);
                }
            }
        }
        else if (type === 7) {
            while (this.lines.length !== this.height) {
                this.lines = [];
                let leftLine = Map.consLineMaker(this.height, [[0, palette[0]]]),
                    rightLine = Map.consLineMaker(this.height, [[0, palette[1]]]);
                for (let i = 0; i < this.height; i++) {
                    let leftColor = leftLine[0][i].slice(),
                        rightColor = rightLine[0][i].slice(),
                        line = Map.consLineMaker(this.width, [[0, leftColor], [this.width - 1, rightColor]]);
                    if (line[0].length === 0) break;
                    this.lines.push(line);
                }
            }
        }
        else if (type === 8) {
            while (this.lines.length !== this.height) {
                this.lines = [];
                let bottomLine = Map.consLineMaker(this.width, [[0, palette[0]]]),
                    rowStep = bottomLine[1],
                    intersectionColor = bottomLine[0][this.middle].slice(),
                    middleLine = Map.consLineMaker(this.height, [[this.height - 1, intersectionColor]]);
                for (let i = 0; i < this.height; i++) {
                    let middleColor = middleLine[0][i],
                        line = Map.consStepLineMaker(2 * i + 1, rowStep, [[i, middleColor]]);
                    if (line[0].length === 0) break;
                    this.lines.push(line);
                }
            }
        }
        else if (type === 9) {
            while (this.lines.length !== this.height) {
                this.lines = [];
                let bottomLine = Map.consLineMaker(this.width, [[0, palette[0]]]),
                    rowStep = bottomLine[1],
                    intersectionColor = bottomLine[0][this.middle].slice(),
                    middleLine = Map.consLineMaker(this.height, [[this.height - 1, intersectionColor]]);
                for (let barSize = 0, row = 0; barSize < 5; barSize++) {
                    for (let bar = 0; bar < this.chosenBar[barSize]; bar++, row++) {
                        let middleColor = middleLine[0][row],
                            length = 2 * barSize + 1,
                            line = Map.consStepLineMaker(length, rowStep, [[barSize, middleColor]]);
                        if (line[0].length === 0) break;
                        this.lines.push(line);
                    }
                }
            }
        }
        else if (type === 10) {

        } else {

        }
        console.log(this.lines);
    };

    colorizeMap = (type) => {
        this.idToColor = [];
        if (type === 1) {
            for (let column = 0; column < this.width; column++) {
                this.idToColor.push(this.lines[0][0][column]);
            }
        }
        else if (type === 2) {
            for (let line = 0; line < this.lineCount; line++) {
                let rowLine = this.lines[line][0].slice();
                for (let column = 0; column < this.width; column++) {
                    this.idToColor.push(rowLine[column]);
                }
            }
        }
        else if (type === 3) {
            let rowLine = this.lines[0][0].slice(),
                columnLine = this.lines[1][0].slice();
            for (let row = 0; row < this.height; row++) {
                for (let column = 0; column < this.width; column++) {
                    if (row === this.rowPlace || column === this.columnPlace) {
                        if (row === this.rowPlace && column === this.columnPlace) {
                            this.idToColor.push(rowLine[column]);
                        } else if (column === this.columnPlace) {
                            this.idToColor.push(columnLine[row]);
                        } else if (row === this.rowPlace) {
                            this.idToColor.push(rowLine[column]);
                        }
                    }
                }
            }
        }
        else if (type === 4) {
            let rowLine = this.lines[0][0].slice(),
                columnLine = this.lines[1][0].slice();
            for (let row = 0; row < this.height; row++) {
                for (let column = 0; column < this.width; column++) {
                    if (row === this.rowPlace || column === this.columnPlace) {
                        if (row === this.rowPlace && column === this.columnPlace) {
                            this.idToColor.push(rowLine[column]);
                        } else if (column === this.columnPlace) {
                            this.idToColor.push(columnLine[row]);
                        } else if (row === this.rowPlace) {
                            this.idToColor.push(rowLine[column]);
                        }
                    }
                }
            }
        }
        else if (type === 5) {
            for (let row = 0; row < this.height; row++) {
                let rowLine = this.lines[row][0].slice();
                for (let column = 0; column < this.width; column++) {
                    this.idToColor.push(rowLine[column]);
                }
            }
        }
        else if (type === 6) {
            for (let row = 0; row < this.height; row++) {
                let rowLine = this.lines[row][0].slice();
                for (let column = 0; column < this.width; column++) {
                    this.idToColor.push(rowLine[column]);
                }
            }
        }
        else if (type === 7) {
            for (let row = 0; row < this.height; row++) {
                let rowLine = this.lines[row][0].slice();
                for (let column = 0; column < this.width; column++) {
                    this.idToColor.push(rowLine[column]);
                }
            }
        }
        else if (type === 8) {
            for (let row = 0; row < this.height; row++) {
                let rowLine = this.lines[row][0].slice();
                for (let column = 0; column < rowLine.length; column++) {
                    this.idToColor.push(rowLine[column]);
                }
            }
        }
        else if (type === 9) {
            for (let row = 0; row < this.height; row++) {
                let rowLine = this.lines[row][0].slice();
                for (let column = 0; column < rowLine.length; column++) {
                    this.idToColor.push(rowLine[column]);
                }
            }
        }
        else if (type === 10) {

        }
        else {

        }
    };

    setLockId = (type) => {
        let lockList = [],
            lockId = randomInt(0, this.tileCount-1);
        if (type === 1) {
            while (lockId === this.middle) lockId = randomInt(0, this.tileCount - 1);
            lockList.push(lockId);
        }
        else if (type === 2) {
            for (let i = 0; i < this.lineCount; i++) {
                lockId = randomInt(this.width * i, this.width * (i + 1) - 1 );
                while (lockId % this.width === this.middle) {
                    lockId = randomInt(this.width * i, this.width * (i + 1) - 1 );
                }
                lockList.push(lockId);
            }
        }
        else if (type === 3) {
            while (lockId % this.width === this.intersectionId) lockId = randomInt(0, this.tileCount - 1);
            lockList.push(lockId);
        }
        else if (type === 4) {
            while (lockId % this.width === this.intersectionId) lockId = randomInt(0, this.tileCount - 1);
            lockList.push(lockId);
        }
        else if (type === 5) {
            let corner = [0, this.width - 1, this.tileCount - this.width, this.tileCount-1];
            lockId = corner[randomInt(0, 3)];
            lockList.push(lockId);
            while (lockId === lockList[0]) lockId = corner[randomInt(0, 3)];
            lockList.push(lockId);
        }
        else if (type === 6) {
            let corner = [0, this.width - 1, this.tileCount - this.width, this.tileCount-1];
            lockId = corner[randomInt(0, 3)];
            lockList.push(lockId);
            while (lockId === lockList[0]) lockId = corner[randomInt(0, 3)];
            lockList.push(lockId);
        }
        else if (type === 7) {
            let corner = [0, this.width - 1, this.tileCount - this.width, this.tileCount-1];
            lockId = corner[randomInt(0, 3)];
            lockList.push(lockId);
            while (lockId === lockList[0]) lockId = corner[randomInt(0, 3)];
            lockList.push(lockId);
        }
        else if (type === 8) {
            let bottomCorner = [this.tileCount - this.width, this.tileCount - 1],
                lockPlace = this.idToMap[lockId];
            while (lockId === bottomCorner[0] || lockId === bottomCorner[1] || lockPlace[1] === this.middle) {
                lockId = randomInt(0, this.tileCount - 1);
                lockPlace = this.idToMap[lockId];
            }
            lockList.push(lockId);
        }
        else if (type === 9) {
            let bottomCorner = [this.tileCount - this.width, this.tileCount - 1],
                lockPlace = this.idToMap[lockId];
            while (lockId === bottomCorner[0] || lockId === bottomCorner[1] || lockPlace[1] === this.middle) {
                lockId = randomInt(0, this.tileCount - 1);
                lockPlace = this.idToMap[lockId];
            }
            lockList.push(lockId);
        }
        else if (type === 10) {

        }
        else {

        }
        console.log(lockList);
        this.lockList = lockList;
    };


    generateInitial = () => {
        this.mapAnswer = [];
        this.initGround = [];
        this.initGroundStatus = [];
        for (let row = 0; row < this.height; row++) {
            let lineInit = [],
                lineStatus = [],
                lineAnswer = [];
            for (let column = 0; column < this.width; column++) {
                let id = this.mapToId[row][column];
                if (Map.checkLockList(id, this.lockList)) {
                    lineAnswer.push(this.idToColor[id]);
                    lineInit.push(this.idToColor[id]);
                    lineStatus.push("Lock");
                }
                else if (this.mapStatus[row][column] === "Space") {
                    lineAnswer.push([0, 0, 0]);
                    lineInit.push([0, 0, 0]);
                    lineStatus.push("Space");
                }
                else if (this.mapStatus[row][column] === "Blank") {
                    lineAnswer.push([0, 0, 0]);
                    lineInit.push([0, 0, 0]);
                    lineStatus.push("Blank");
                }
                else {
                    lineAnswer.push(this.idToColor[id]);
                    lineInit.push([0, 0, 0]);
                    lineStatus.push("Blank");
                }
            }
            this.mapAnswer.push(lineAnswer.slice());
            this.initGround.push(lineInit.slice());
            this.initGroundStatus.push(lineStatus.slice());
        }
        this.initCandidate = this.idToColor.slice();
        this.candidateRowCount = Math.ceil(this.initCandidate.length / 9);
        this.candidateSize = this.candidateRowCount * 9;
        for (let id = 0; id < this.candidateSize; id++) {
            if (Map.checkLockList(id, this.lockList)) this.initCandidate[id] = [0, 0, 0];
            if (id >= this.tileCount) this.initCandidate.push([0, 0, 0]);
        }
    };

    statusChecker = () => {
        this.candidateStatus = [];
        for (let id = 0; id < this.candidateSize; id++) {
            if (Map.sameColor(this.initCandidate[id], [0, 0, 0]))
                this.candidateStatus.push("Blank");
            else this.candidateStatus.push("Color");
        }
    };

    constructor(mapType, palette) {
        this.setType(mapType);
        this.setPalette(palette);
        this.setSize(this.type);
        this.setMap(this.type);
        if (this.palette.length === 0) {
            this.mapLiner(this.type);
            this.colorizeMap(this.type);
            while (Map.uniqueColorArray(this.idToColor) === false) {
                this.mapLiner(this.type);
                this.colorizeMap(this.type);
            }
        }
        else {
            if (this.palette.length < 2) {
                let oppositeColor = Map.oppositeColor(this.palette[0], Map.COLOR_TYPE);
                this.palette.push(oppositeColor);
            }
            this.paletteLiner(this.type, palette);
            this.colorizeMap(this.type);
            while (Map.uniqueColorArray(this.idToColor) === false) {
                this.paletteLiner(this.type, palette);
                this.colorizeMap(this.type);
            }
        }
        this.mapLogger("status");
        this.mapLogger("color");
        this.setLockId(this.type);
        this.generateInitial();
        shuffleArray(this.initCandidate);
        this.statusChecker();
        console.log(this.initCandidate);
    }
}

export default Map;