
class Mission {
    constructor(t = -1,c = -1,s = -1) {
        if (t == -1) {
            if (getRandomInt(6) == 1) {
                if (getRandomInt(2) == 1) {
                    // only allow one lzr upgrade at a time
                    let t = false;
                    for (let i = 0; i < missions.length; i++) {
                        if (missions[i].type == "lzr") {
                            t = true;
                        }
                    } 
                    if (t) {
                        this.type = "life"; 
                    } else {
                        this.type = "lzr"; 
                    }
                } else { 
                    this.type = "life";
                }
            } else {
                if (getRandomInt(2) == 1) {
                    this.type = "kill"; 
                } else { 
                    this.type = "sos";
                }
            }
            
        } else {
            this.type = t;
        }
        if (c == -1) {
            this.constellation = getRandomInt(constellationNames.length);
        } else {
            this.constellation = c;
        }
        if (s == -1) {
            this.sector = getRandomInt(mapLocations[this.constellation].length);
        } else {
            this.sector = s;
        }
        //console.log(this.sector)
        if (
            this.sector == 2 ||
            this.sector == 4 ||
            this.sector == 5 ||
            this.sector == 7
        ) {
            this.sector --;
            if (this.sector == 4) {
                this.sector --;
            }
        }
        this.colorLevel = 256;
        this.x = getRandomInt((getWidth()/4)*3)+(getWidth()/8);
        this.y = getRandomInt((getHeight()/4)*3)+(getHeight()/8);
        this.need = getRandomInt(ship.storage.length);
        this.needAmount = getRandomInt(50 * (Math.floor(this.constellation/3)+1));
        this.killNum = getRandomInt(3) + 1; 

        msgTimerMsg = "";
        if (this.type == 'kill') {
            msgTimerMsg = `MISSION: The Corpo drones in ${mapLocations[this.constellation][this.sector].name} killed my brother. Avenge me ${this.killNum} of them`;
            mapLocations[this.constellation][this.sector].isHostile = true;
            this.reward = 1500 * this.killNum * (Math.floor(this.constellation/3)+1);
        } else if (this.type == 'sos') {
            msgTimerMsg = `MISSION: A Settlment in ${mapLocations[this.constellation][this.sector].name} is desperate for ${resourceNames[this.need]} requesting ${this.needAmount} ASAP`;
            this.reward = 120 * this.needAmount * (Math.floor(this.constellation/3)+1);
        } else if (this.type == 'life') {
            msgTimerMsg = `MISSION: Compatiple ship conponents detected in ${mapLocations[this.constellation][this.sector].name}. Investigation recommended.`;
            this.needAmount = 2025*(this.constellation/3+1);
            this.reward = 120;
        } else if (this.type == 'lzr') {
            this.needAmount = 100 + getRandomInt(500);
            if (ship.lzrLvl == 1) {
                msgTimerMsg = `MISSION: Collect the L.Z.R. Optical Mining System`;
            } else if (ship.lzrLvl == 3){
                msgTimerMsg = `MISSION: Install the Offensive upgrade for the L.Z.R. Optical Mining System`;
            } else {
                msgTimerMsg = `MISSION: Upgrade the L.Z.R. Optical Mining System to level ${ship.lzrLvl+1}`;
            }
            this.reward = 254;
        }
        msgTimer = 1000;
        this.msg = msgTimerMsg;
        this.collectionDelay = 0;
    }
}

class Ship {
    constructor(x = c.width/2, y = c.height/2) {
        this.rot = 0;
        this.x = x;
        this.y = y;
        this.fuelCon = 0;
        this.storageWarning = true;
        this.storageWarnCoolDown = 1;
        this.fuelStat = 0;
        this.lzrLvl = 1;
        this.lzrEquip = false;
        this.lzrDistance = 120;
        this.sosColor = '#ccfcd2';
        this.killColor = '#f59b9b';
        this.lifeColor = '#03bcfa';
        this.lzrColor = '#fafaa6'
        this.drawBackgrounds = true;
        this.type = "ship";
        this.shield = true; 
        this.shieldRad = 18
        this.speed = 0;
        this.curMission = -1;
        this.money = getRandomInt(512);
        if (this.money == 256) {
            this.money = getRandomInt(9999);
        }
        this.maxFuel = 50;
        this.fuelTotal = 50;
        this.maxStorage = 20;
        this.storageTotal = 0;
        this.storage = [0,0,0,0,0,0,0,0];
        this.upgrades = [0,0,0,0,0,0,0,0,0,0]; // upgrade levels
        this.collectDistance = 100;
        this.acceleration = 0.05;
        this.breakSpeed = 0.05;
        this.maxSpeed = 2;
        this.maxBullets = 3;
        this.baseDamage = 4;
        this.rotSpeed = 3;
        this.comboDamage = 0;
        this.bulletRate = 40; // delay before next bullet
        this.bulletTimer = 0; // cool down remaining before firing next bullet
        this.bulletLife = 100;
        this.color = 'rgb(255, 255, 255)'
        this.path = new Path2D();
        this.path.moveTo(0, -10);
        this.path.lineTo(10, 10);
        this.path.lineTo(-10, 10);
        this.path.lineTo(0, -10);
        this.thrustPath = new Path2D();
        this.thrustPath.moveTo(0, 11);
        this.thrustPath.lineTo(5, 15);
        this.thrustPath.lineTo(0, 18);
        this.thrustPath.lineTo(-5, 16);
        this.thrustPath.lineTo(0, 11);
        this.hbOffset1 = 10;
        this.hbOffset2 = 20;
        this.dead = 0;
        // asteroids flight model
        this.flightModel = 1;
        this.velX = 0;
        this.velY = 0;
        this.drag = 0.995; // 1 = frictionless
        this.drawBG = true;

    }
}

class mobile {
    constructor(x = 0, y = 0) {
        this.type = "enemy";
        this.rot = getRandomInt(360);
        if (x == 0 && y == 0) {
            if (getRandomInt(2) == 1) {
                if (getRandomInt(2) == 1) {
                    this.x = -3;
                } else {
                    this.x = c.width + 3;
                }
                this.y = getRandomInt(c.height);
            } else {
                this.x = getRandomInt(c.width);
                if (getRandomInt(2) == 1) {
                    this.y = -3;
                } else {
                    this.y = c.height + 3;
                }
            }
        } else {
            this.x = 100//x;
            this.y = 50//y;
        }
        this.speed = 1;
        this.acceleration = 0.05;
        this.breakSpeed = 0.05;
        this.maxSpeed = 1 + getRandomInt(3);
        this.maxBullets = 4;
        this.baseDamage = getRandomInt(10);
        this.bulletRate = 20; // delay before next bullet
        this.bulletTimer = getRandomInt(100); // cool down remaining before firing next bullet
        this.bulletLife = 20 + getRandomInt(200); // how far bullets travel before disapearing
        this.color = '#FFFFFF'
        this.lzrCool = 25;
        // star shaped
        this.path = new Path2D();
        this.path.moveTo(0, -20);
        this.path.lineTo(7, -7);
        this.path.lineTo(20, 0);
        this.path.lineTo(7, 7);
        this.path.lineTo(0, 20);
        this.path.lineTo(-7, 7);
        this.path.lineTo(-20, 0);
        this.path.lineTo(-7, -7);
        this.path.lineTo(0, -20);
        this.hbOffset1 = 20;
        this.hbOffset2 = 40;
        this.health = getRandomInt(9)+(5*constellation);
        this.dead = 0;
        //console.log("x,y: ",this.x,this.y)
    }
}

class Warper {
    constructor(x, y, tx, ty) {
        this.x = x;
        this.y = y;
        this.speed = 0.1;
        this.maxSpeed = 0.6;
        this.tx = tx;
        this.ty = ty;
        this.color = '#FF00FF';
        this.rot = angle360(x, y, tx, ty);
        this.hbOffset1 = 0;
        this.hbOffset2 = 0;
    }
}

class MapLocation {
    constructor(type, num, constNumber, sector) {
        this.x = constellationStarsArrays[constNumber][num];
        this.y = constellationStarsArrays[constNumber][num+1];
        this.sectorNum = sector;
        this.constNumber = constNumber;
        this.type = type;
        this.visited = false;
        this.color = '#FFFFFF';
        this.resources = [];
        this.fuelPrice = 0
        this.bg = []
        this.buySell = 0;
        this.menuNum = 0;
        this.priceList = [];
        this.locationUpgrades = [];
        this.warpDestinations = [];
        for (let i = 0; i < 8; i++) {
            this.priceList.push(getRandomInt(30)+10);
        }
        let s = getRandomInt(50) + 5;
        // random palette for each zone
        this.palette = [
            `rgb(${getRandomInt(256)},${getRandomInt(256)},${getRandomInt(256)})`,
            `rgb(${getRandomInt(256)},${getRandomInt(256)},${getRandomInt(256)})`,
            `rgb(${getRandomInt(256)},${getRandomInt(256)},${getRandomInt(256)})`,
            `rgb(${getRandomInt(256)},${getRandomInt(256)},${getRandomInt(256)})`
        ];
        for (let i = 0; i < s; i++) {
            // build location's star background
            let r = getRandomInt(30);
            if (r == 0) {
               r = getRandomInt(70) 
            } else {
                r = 2;
            }
            this.bg.push(
                [getRandomInt(100),
                getRandomInt(100),
                this.palette[getRandomInt(this.palette.length)],
                r]
            );
            this.bg.push(getRandomInt(c.height));
        }
        this.isHostile = false;
        if (type == 'sector') {
            this.name = locationNames[getRandomInt(locationNames.length-1)];
            if (getRandomInt(10) > 4) {
                this.isHostile = true;
                //console.log(this.name, " is hostile")
            }
            let r = getRandomInt(3) + 1;
            for (let i = 0; i < r; i++) {
                let j = getRandomInt(resourceNames.length-1);
                if (!this.resources.includes(j)) {
                    this.resources.push(j);
                }
            }
        } else if (type == 'trade') {
            this.name = 'TRADING POST';
        } else if (type == 'upgrade') {
            this.name = 'UPGRADE SHOP';
            let r = getRandomInt(2) + 3;
            while (this.locationUpgrades.length < r) {
                let u = getRandomInt(possibleUpgrades.length);
                this.locationUpgrades.push(u);
            }
            this.uniqueNumbers = [...new Set(this.locationUpgrades)];
            this.locationUpgrades = [];
            this.locationUpgrades = this.uniqueNumbers;
            //console.log("this.locationUpgrades: " + this.locationUpgrades);
        } else if (type == 'fuel') {
            this.name = 'FUEL DEPOT';
            this.fuelPrice = getRandomInt(6) + 1;
        } else if (type == 'warp') {
            this.name = 'QUANTIUM JUMP STATION';
            // define available warps for each constilation
            let availWarpArray = [1,11, 0,2, 1,3, 2,4, 3,5, 4,6, 5,7, 6,8, 7,9, 8,10, 9,11, 10,0];
            this.warpDestinations.push(availWarpArray[constNumber*2]);
            this.warpDestinations.push(availWarpArray[(constNumber*2)+1]);
        }
    }
}

class Resource {
    constructor(type, x, y) {
        this.x = x - 5 + getRandomInt(10);
        this.y = y - 5 + getRandomInt(10);
        this.hbOffset1 = 0;
        this.hbOffset2 = 0;
        this.speed = 0.1;
        this.maxSpeed = 2;
        this.rot = getRandomInt(360);
        this.radius = getRandomInt(5 * (karma/2)) + 1;
        let loc = mapLocations[constellation][curMapLoc];
        let s = getRandomInt(loc.resources.length);
        let t = loc.resources[s];
        this.resource = t;
        this.name = resourceNames[t];
        this.color = resourceColor[t];
    }
}

class Debri {
    constructor(x, y) {
        this.color = "#FFFFFF";
        this.x = x;
        this.y = y;
        this.speed = getRandomInt(2) + 3;
        this.rot = getRandomInt(360);
        this.life = getRandomInt(20) + 10;
        this.hbOffset1 = 0;
        this.hbOffset2 = 0;
        this.radius = getRandomInt(3) + 1;
    }
}

class StarFieldStar {
    constructor() {
        this.color = "#FFFFFF";
        this.x = c.width/2;
        this.y = c.height/2;
        this.speed = 0.01;
        this.rot = getRandomInt(360);
        this.hbOffset1 = 0;
        this.hbOffset2 = 0;
        this.radius = 0;
    }
}

class Bullet {
    constructor(e, angle, x, y, speed = 5, fromShip = true) {
        this.fromShip = fromShip;
        this.angle = angle;
        this.x = x;
        this.y = y;
        this.life = e.bulletLife;
        this.damage = getRandomInt(e.baseDamage/2) + e.baseDamage;
        if (bulletColorsEnabled) {
            this.color = bulletColors[colorCycle];
            // rainbow bullets
            colorCycle = (colorCycle += 1) % 8;
        } else {
            this.color = '#FFFFFF';
        }
        this.speed = speed;
        this.hbOffset1 = -this.damage/3;
        this.hbOffset2 = this.damage/1.5;
    }
}

class DamageNumber {
    constructor(num, x, y) {
        this.num = num;
        this.x = x;
        this.y = y;
        this.life = 20;
        this.color = "#FFFFFF";
    }
}

class Asteroid {
    constructor(large = true, x, y) {
        this.rot = getRandomInt(360);
        if (large) {
            // large 
            if (getRandomInt(2) == 1) {
                // start along x axis
                this.x = getRandomInt(c.width);
                if (getRandomInt(2) == 1) {
                    this.y = 0;
                } else {
                    this.y = c.height;
                }
            } else {
                // y axis
                this.y = getRandomInt(c.height);
                if (getRandomInt(2) == 1) {
                    this.x = 0;
                } else {
                    this.x = c.width;
                }
            }
            this.path = new Path2D();
            this.path.moveTo(0, -30);
            this.path.lineTo(20, -20);
            this.path.lineTo(30, 0);
            this.path.lineTo(22, 10);
            this.path.lineTo(18, 25);
            this.path.lineTo(5, 33);
            this.path.lineTo(-15, 25);
            this.path.lineTo(-25, 15);
            this.path.lineTo(-20, 5);
            this.path.lineTo(-30, -5)
            this.path.lineTo(-22, -20)
            this.path.lineTo(0, -30);
            this.hbOffset1 = 15;
            this.hbOffset2 = 50;
            this.health = getRandomInt(10)+(10* constellation);
            this.large = true;
        } else {
            // small
            this.x = x;
            this.y = y;
            this.path = new Path2D();
            this.path.moveTo(0, -20);
            this.path.lineTo(15, -15);
            this.path.lineTo(20, 0);
            this.path.lineTo(12, 5);
            this.path.lineTo(8, 15);
            this.path.lineTo(5, 20);
            this.path.lineTo(-5, 10);
            this.path.lineTo(-10, 10);
            this.path.lineTo(-10, 5);
            this.path.lineTo(-15, -5)
            this.path.lineTo(-12, -10)
            this.path.lineTo(0, -20);
            this.hbOffset1 = 25;
            this.hbOffset2 = 30;
            this.health = getRandomInt(5)+(5*constellation);
            this.large = false;
        }
        this.large = large;
        this.spin = getRandomInt(360);
        this.speed = getRandomInt(3)+0.2;
        this.color = '#FFFFFF';
        this.clockwise = getRandomInt(2);
        this.lzrCool = 25;
    }
}
