class Ship {
    constructor(x = c.width/2, y = c.height/2) {
        this.rot = 0;
        this.x = x;
        this.y = y;
        this.speed = 0;
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
        this.hbOffset1 = 10;
        this.hbOffset2 = 20;
        this.dead = 0;
        // asteroids flight model
        this.flightModel = 1;
        this.velX = 0;
        this.velY = 0;
        this.drag = 0.995; // 1 = frictionless

    }
}

class mobile {
    constructor(x = 0, y = 0) {
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
                    this.y = c.heigth + 3;
                }
            }
        } else {
            this.x = x;
            this.y = y;
        }
        this.speed = 1;
        this.acceleration = 0.05;
        this.breakSpeed = 0.05;
        this.maxSpeed = 2;
        this.maxBullets = 2;
        this.baseDamage = 4;
        this.bulletRate = 40; // delay before next bullet
        this.bulletTimer = 100; // cool down remaining before firing next bullet
        this.bulletLife = 100; // how far bullets travel before disapearing
        this.color = '#FFFFFF'
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
        this.hbOffset1 = 25;
        this.hbOffset2 = 30;
        this.health = getRandomInt(5)+(5*constellation);
        this.dead = 0;
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
    constructor(type, num, constNumber) {
        this.x = constellationStarsArrays[constNumber][num];
        this.y = constellationStarsArrays[constNumber][num+1];
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
        for (let i = 0; i < s; i++) {
            // build location's star background
            this.bg.push(getRandomInt(c.width));
            this.bg.push(getRandomInt(c.height));
        }
        this.isHostile = false;
        if (type == 'sector') {
            this.name = locationNames[getRandomInt(locationNames.length-1)];
            if (getRandomInt(10) > 4) {
                this.isHostile = true;
            }
            let r = getRandomInt(2) + 1;
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
            let r = getRandomInt(3) + 2;
            while (this.locationUpgrades.length < r) {
                let u = getRandomInt(possibleUpgrades.length);
                this.locationUpgrades.push(u);
            }
            this.uniqueNumbers = [...new Set(this.locationUpgrades)];
            this.locationUpgrades = [];
            this.locationUpgrades = this.uniqueNumbers;
            console.log("this.locationUpgrades: " + this.locationUpgrades);
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
        this.radius = getRandomInt(5) + 1;
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
            this.path.lineTo(-15, 5);
            this.path.lineTo(-10, 5);
            this.path.lineTo(-15, -5)
            this.path.lineTo(-12, -10)
            this.path.lineTo(0, -20);
            this.hbOffset1 = 25;
            this.hbOffset2 = 30;
            this.health = getRandomInt(5)+(5*constellation);
        }
        this.large = large;
        this.spin = getRandomInt(360);
        this.speed = getRandomInt(3)+0.2;
        this.color = '#FFFFFF';
        this.clockwise = getRandomInt(2);
    }
}
