0// gameplay canvas
const c = document.getElementById("myCanvas");
const ctx = c.getContext("2d");
let cLeft = c.offsetLeft + c.clientLeft;
let cTop = c.offsetTop + c.clientTop;
// hidden ship canvas 40x40
const s = document.getElementById("shipCanvas");
const sctx = s.getContext("2d");
sctx.translate(20,20);
sctx.rotate(90 * Math.PI / 180);
// hidden asteroid canvas 80x80
const a = document.getElementById("asteroidCanvas");
const actx = a.getContext("2d");
actx.translate(40,40);
// black background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 400, 400);
// enemies array
let enemies = [];
let deadEnemies = [];
// player ship
let ship;
let lives;
let score;
let stage = 0; // stage 0 = title, stage 1 = default game, stage 2 = space map
let locationNames = ['Aelia', 'Adhara', 'Amalthea', 'Andromeda', 'Ascella', 'Astra', 'Aurora', 'Bianca',
                    'Calypso', 'Celeste', 'Chanda', 'Cordelia', 'Diana', 'Elara', 'Halley', 'Helia',
                    'Hilal', 'Larissa', 'Leda', 'Libra', 'Lyra', 'Miranda', 'Nashira', 'Ophelia',
                    'Pandora', 'Phoebe', 'Portia', 'Titania', 'Stella', 'Vega', 'Luna', 'Eluria', 'Mithras'];
let constellationNames = ['AQUARIUS', 'ARIES', 'CANCER', 'CAPRICORNUS', 'GEMINI', 'LEO', 'LIBRA', 
                        'PISCES', 'SAGITTARIUS', 'SCORPIUS', 'TAURUS', 'VIRGO'];
// RD: name, color
let resourceNames = ['Gold', 'Silver', 'Copper', 'Diamond', 'Platnum', 'Uranium', 'Lithium', 'Ytterbium'];
let resourceColor = ['#E8B923', '#7d3c98', '#3498db', '#27ae60', '#d35400', '#5d6d7e', '#cd6155', '#48c9b0'];
let constellationStarsArrays = [[166,423,261,250,358,251,373,386,350,420,401,201,495,174,582,155,525,288,546,360,685,227,851,308],
                                [761,314,665,316,406,378,251,381,183,411,170,382,142,379,806,380,810,418,420,193,344,181],
                                [409,120,509,304,516,378,481,505,722,463,674,291],
                                [725,189,708,244,536,497,516,518,304,367,273,310,252,302,226,268,279,273,467,282,473,342],
                                [655,488,544,388,687,401,407,354,292,287,189,222,220,330,341,251,389,183,242,168,437,115,499,271,642,327,647,252,730,244,830,176],
                                [168,339,311,267,314,336,272,393,287,488,427,436,557,328,547,394,691,431,524,268,534,227,661,176,817,167,801,262,710,240],
                                [298,200,176,257,242,341,342,320,390,290,503,124,646,277,562,462,342,498,299,503,285,537,607,114],
                                [759,469,687,485,656,434,599,455,520,430,346,423,271,415,117,476,193,324,269,223,334,183,343,145,321,121,377,93],
                                [330,526,363,490,196,482,334,418,153,355,145,324,108,226,167,201,275,151,411,238,424,308,556,250,470,211,441,159,476,148,418,122,386,97,348,84,665,248,766,158,722,322,794,342,863,303,625,424,677,475],
                                [639,101,585,223,636,223,680,300,665,369,691,411,553,332,494,350,454,382,432,461,435,503,434,544,355,543,221,523,118,451,148,405,181,333,261,341],
                                [583,250,204,132,364,251,431,319,474,372,516,412,400,418,333,396,78,274,597,436,481,482,589,520,743,403,796,466,841,501],
                                [142,282,324,279,405,304,555,289,736,249,855,315,804,411,689,450,569,442,460,463,360,522,192,503,185,434,493,141]];
let resources = [];
let deadResources = [];
let bullets = [];
let bulletColorsEnabled = false;
let bulletColors = ['#9B9BFF', '$009BFF', '#00FF00','#9BFF00', '$FF00FF',
                    '$FF0000', '#FF9B00', '#9B00FF', '#00FF9B'];
let deadBullets = [];
let colorCycle = 0;
// enemy respawn timer
respawnTimer = 0;
jumpTimer = 0;
// arrow keys
let left = false;
let right = false;
let up = false;
let down = false;
let spaceBar = false;
// asteroids
let asteroids = [];
let deadAsteroids = [];
// damageNumbers
let damageNumbers = [];
let deadNumbers = [];
// step init
let start;
// debris
let debrisArray = [];
let deadDebris = [];
// debug
let showHitbox = false;
// map
let mapLocations = [[],[],[],[],[],[],[],[],[],[],[],[]];
let curMapLoc = 0; // sector where the player currently is
let curMapSel = 0; // location player has selected to move to
let mapReminder = false;
// warp is travel between locations, not constilations - confusing
let warping = false;
let warper = null;
// star field
let constellation = 0;
let starField = [];
let deadStarField = [];
let starFieldDelay = 20;
let starFieldMax = 100;
let possibleUpgrades = ["FUEL TANK", "MAX SHIP SPEED", "SHIP ACCELERATION", "MAX BULLETS", "BULLET RATE",
                        "MAX STORAGE", "COLLECTION DISTANCE"]

class Ship {
    constructor(x = c.width/2, y = c.height/2) {
        this.rot = 0;
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.money = 390;
        this.maxFuel = 50;
        this.fuelTotal = 50;
        this.maxStorage = 20;
        this.storageTotal = 0;
        this.storage = [0,0,0,0,0,0,0,0];
        this.upgrades = [0,0,0,0,0,0,0]; // upgrade levels
        this.collectDistance = 100;
        this.acceleration = 0.05;
        this.breakSpeed = 0.05;
        this.maxSpeed = 2;
        this.maxBullets = 3;
        this.baseDamage = 4;
        this.comboDamage = 0;
        this.bulletRate = 40; // delay before next bullet
        this.bulletTimer = 0; // cool down remaining before firing next bullet
        this.color = 'rgb(255, 255, 255)'
        this.path = new Path2D();
        this.path.moveTo(0, -10);
        this.path.lineTo(10, 10);
        this.path.lineTo(-10, 10);
        this.path.lineTo(0, -10);
        this.hbOffset1 = 10;
        this.hbOffset2 = 20;
        this.dead = 0;
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
        this.speed = 3;
        this.maxSpeed = 3;
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
    constructor(angle, x, y, speed = 5, fromShip = true) {
        this.damage = getRandomInt(ship.baseDamage/2) + ship.baseDamage;
        this.angle = angle;
        this.x = x;
        this.y = y;
        this.fromShip = fromShip;
        this.life = 100;
        if (bulletColorsEnabled) {
            this.color = bulletColors[colorCycle];
            // rainbow bullets
            colorCycle = (colorCycle += 1) % 8;
        } else {
            this.color = '#FFFFFF';
        }
        this.speed = speed;
        this.hbOffset1 = 10;
        this.hbOffset2 = 20;
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

// ********************
// animation & movement
// ********************

requestAnimationFrame(step);

function step(timeStamp) {
    if (start === undefined) {
        doResize();
        score = 0;
        lives = 3;
        start = timeStamp;
        ship = new Ship();
        genMapLocations();
        mapLocations[constellation][0].visited = true;
        newAstroidField();
        starField.push(new StarFieldStar());
        //enemies.push(new mobile(0,0)); // 0,0 = radom x,y along width height
    }
    const elapsed = timeStamp - start;

    // damageNumber movement
    damageNumbers.forEach(n => {
        n.y --;
        n.life --;
        if (n.life < 0) {
            deadNumbers.push(n);
        }
    });
    damageNumbers = damageNumbers.filter(n => !deadNumbers.includes(n));
    deadNumbers = [];

    if (stage == 1) {
        moveShip();
        if (respawnTimer) {
            respawnTimer --;
            if (respawnTimer == 0) {
                enemies.push(new mobile(0,0));
            }
        }
    }
    
    if (stage == 0 || stage == 1) {
        // asteroid movement
        asteroids.forEach(roid => {
            if (roid.clockwise == 1) {
                roid.spin = (roid.spin -= 1) % 360;
            } else {
                roid.spin = (roid.spin += 1) % 360;
            }
            moveEntity(roid);
        });

        // move resource
        resources.forEach(r => {
            moveEntity(r);
            if (collision(r, ship)) {
                if (ship.storageTotal < ship.maxStorage) {
                    deadResources.push(r);
                    if (ship.storageTotal + r.radius > ship.maxStorage) {
                        // discard part of resources that don't fit the maxStorage
                        ship.storage[r.resource] += ship.maxStorage - ship.storageTotal;
                        ship.storageTotal += ship.maxStorage - ship.storageTotal;
                    } else {
                        ship.storage[r.resource] += r.radius;
                        ship.storageTotal += r.radius;
                    }
                    resources = resources.filter(n => !deadResources.includes(n));
                    deadResources = [];
                }
            } else if (distance2D(r, ship) < ship.collectDistance && ship.storageTotal < ship.maxStorage ) {
                let a = ship.hbOffset1+(ship.hbOffset2/2);
                r.rot = angle360(r.x, r.y, ship.x+a, ship.y+a);
                if (r.speed < r.maxSpeed) {
                    r.speed += 0.1;
                }
            }
        });

        // move debris
        debrisArray.forEach(d => {
            moveEntity(d);
            d.life --;
            if (d.life < 0) {
                deadDebris.push(d);
            }
        });
        debrisArray = debrisArray.filter(n => !deadDebris.includes(n));
        deadDebris = [];
        

        // move bullets
        bullets.forEach(b => {
            let bRad = b.angle * Math.PI / 180;
            b.x += (b.speed * Math.cos(bRad));
            b.y += (b.speed * Math.sin(bRad));
            // keep in bounds 
            if (b.x > c.width) {
                b.x = 0;
            } else if (b.x < 0) {
                b.x = c.width;
            }
            if (b.y > c.height) {
                b.y = 0;
            } else if (b.y < 0) {
                b.y = c.height;
            }
            b.life --;
            if (b.life < 0) {
                deadBullets.push(b);
                ship.comboDamage = 0;
            } else {
                // bullet collision
                if (!b.fromShip) {
                    // fired by enemy
                    if (collision(b, ship) && !ship.dead) {
                        ship.dead = 100;
                        ship.speed = 0;
                        deadBullets.push(b);
                        let r = getRandomInt(5) + 5;
                        let x1 = ship.x + ship.hbOffset1 + (ship.hbOffset2/2);
                        let y1 = ship.y + ship.hbOffset1 + (ship.hbOffset2/2);
                        for (let i = 0; i < r; i++) {
                            debrisArray.push(new Debri(x1, y1));
                        }
                    }
                } else {
                    // fired by player 
                    enemies.forEach(e => {
                        if (collision(b, e)) {
                            deadBullets.push(b) 
                            let damage = b.damage + ship.comboDamage
                            e.health -= damage;
                            damageNumbers.push(new DamageNumber(damage, e.x+e.hbOffset1+(e.hbOffset2/2), e.y+e.hbOffset1+(e.hbOffset2/2)));
                            if (e.health <= 0) {
                                if (enemies.length == 1) {
                                    // set timer for new mobile
                                    respawnTimer = 400;
                                }
                                deadEnemies.push(e);
                                let r = getRandomInt(5) + 5;
                                let x1 = e.x + e.hbOffset1 + (e.hbOffset2/2);
                                let y1 = e.y + e.hbOffset1 + (e.hbOffset2/2);
                                for (let i = 0; i < r; i++) {
                                    debrisArray.push(new Debri(x1, y1));
                                }
                            }
                        }
                    });
                    enemies = enemies.filter(e => !deadEnemies.includes(e));
                    deadEnemies = [];
                }

        
                asteroids.forEach(roid => {
                    if (b.x > roid.x + 15 && b.y > roid.y + 15 && b.x < roid.x + 65 && b.y < roid.y + 65) {
                        deadBullets.push(b);
                        let damage = b.damage + ship.comboDamage
                        roid.health -= damage;
                        // c-c-c-combo damage 
                        ship.comboDamage += 1;
                        if (ship.comboDamage > 10) {ship.comboDamage = 10}
                        console.log("combo: " + ship.comboDamage);
                        score += 5;
                        if (roid.health < 0) {
                            deadAsteroids.push(roid);
                            // small little if large
                            if (roid.large) {
                                score += 250;
                                let r = getRandomInt(2) + 2;
                                for (let i=0; i<r; i++) {
                                    asteroids.push(new Asteroid(false, roid.x, roid.y));
                                }
                            } else {
                                // small score
                                score += 100;
                                let r = getRandomInt(2) + 1;
                                for (let i=0; i<r; i++) {
                                    resources.push(new Resource(mapLocations[constellation][curMapLoc].resource,
                                        roid.x+roid.hbOffset1+(roid.hbOffset2/2), roid.y+roid.hbOffset1+(roid.hbOffset2/2)));
                                }
                            }
                        }
                        damageNumbers.push(new DamageNumber(damage, roid.x+roid.hbOffset1+(roid.hbOffset2/2), roid.y+roid.hbOffset1+(roid.hbOffset2/2)));
                    }
                });
                asteroids = asteroids.filter(r => !deadAsteroids.includes(r));
                deadAsteroids = [];
            }
            // stage clear?
            if (asteroids.length < 1) {
                //asteroids.push(new Asteroid());
                mapReminder = true;
            }
        });
        bullets = bullets.filter(b => !deadBullets.includes(b));
        deadBullets = [];
    }

    // STARFIELD MOVEMENT
    if (stage == 7 || stage == 0) {
        starField.forEach(s => {
            moveEntity(s, false);
            if (s.speed < 7) {
                s.speed += 0.05;
            }
            if (s.radius < 3) {
                s.radius += 0.03;
            }
            if (s.x < 0 || s.x > c.width || s.y < 0 || s.y > c.height) {
                deadStarField.push(s);
            }
            starField = starField.filter(s => !deadStarField.includes(s));
            deadStarField = [];
        });
        starFieldDelay --;
        if (starFieldDelay < 1) {
            starFieldDelay = 5;
            if (starField.length < starFieldMax) {
                starField.push(new StarFieldStar());
                starField.push(new StarFieldStar());
            }
        }
    }

    draw();
    previousTimeStamp = timeStamp;
    requestAnimationFrame(step);
}

function moveEntity(e, screenWrap = true) {
    // move ship
    let angleRad = e.rot * Math.PI / 180;
    e.x += (e.speed * Math.cos(angleRad));
    e.y += (e.speed * Math.sin(angleRad));
    // keep in bounds 
    if (screenWrap) {
        if (e.x > c.width + e.hbOffset1 + 5) {
            e.x = 0 - e.hbOffset1 - e.hbOffset2;
        } else if (e.x < 0 - e.hbOffset1 - e.hbOffset2 - 5) {
            e.x = c.width + e.hbOffset1;
        }
        if (e.y > c.height + e.hbOffset1 + 5) {
            e.y = 0 - e.hbOffset1 - e.hbOffset2;
        } else if (e.y < 0  - e.hbOffset1 - e.hbOffset2 - 5) {
            e.y = c.height + e.hbOffset1;
        }
    }
}



// *************
// draw function
// *************

function draw() {
    switch (stage) {
        case 0:
            drawTitle();
            break;
        case 1:
            drawStage1();
            break;
        case 2:
            drawMap();
            break;
        case 3:
            drawTradingPost();
            break;
        case 4:
            drawFuelDepot();
            break;
        case 5:
            drawStarField();
            break;
        case 6:
            drawUpgrade();
            break;
        case 7:
            drawWarp();
            break;
        default:
    }
}



function drawTitle() {
    clearCanvas();
    drawBG();
    drawAsteroids();

    ctx.font = scaleFont(0.1, "Hyperspace");
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("ASTEROIDS 2025", c.width/20*1.5, c.height/20*10);

    ctx.font = scaleFont(0.03, "Hyperspace"); //"25px Hyperspace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("ARROW KEYS MOVE, SPACE KEY FIRE", c.width/20*4, c.height/20*13);

    ctx.font = scaleFont(0.05, "Hyperspace"); //"40px Hyperspace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("PRESS ANY KEY", c.width/20*6, c.height/20*16);
}

function drawStage1() {
    clearCanvas();
    drawBG();
    drawAsteroids();
    drawMobiles();
    
    // draw ship
    if (ship.dead <= 0 && lives > 0) {
        sctx.strokeStyle = ship.color;
        sctx.clearRect(-20,-20,40,40);
        sctx.stroke(ship.path);
        ctx.drawImage(s, 0,0,40,40, ship.x, ship.y,40,40);
        if (showHitbox) {
            drawHitbox(ship);
        }
    } else {
        // Ship is currently dead or game over
        if (ship.dead == 1) {
            // reposition
            lives --; 
            if (lives > 0) {
                ship.x = c.width/2;
                ship.y = c.height/2;
            } else {
                // move ship offscreen
                ship.x = 2000;
                ship.y = 2000;
            }
        }
        ship.dead --;
    }
    
    // draw bullets
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2, 0, (2+(ship.baseDamage/4)) * Math.PI);
        ctx.strokeStyle = b.color;
        ctx.stroke();
        ctx.closePath();
    });

    // draw debris
    debrisArray.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        ctx.closePath();
    });

    // damage numbers
    damageNumbers.forEach(n => {
        ctx.font = "18px Hyperspace";
        ctx.fillStyle = n.color;
        ctx.fillText(n.num, n.x, n.y);
    });

    // draw resrouces
    resources.forEach(r => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = r.color;
        ctx.stroke();
        ctx.closePath();
    });

    drawGauges();

    if (lives <= 0) {
        ctx.font = scaleFont(0.05, "Hyperspace");
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("GAME OVER", (c.width/20)*8, (c.height/20)*10);
    }

    if (mapReminder || ship.storageTotal == ship.maxStorage) {
        ctx.font = scaleFont(0.03, "Hyperspace");
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("PRESS 'M' FOR SPACE MAP", c.width/20*6, c.height/20*18);
    }
}

function drawMap() {
    // stage 2
    clearCanvas();
    drawBG();
    drawGauges();

    // map boarders
    ctx.fillStyle = '#090909';
    ctx.fillRect(c.width/20-10, c.height/12-10, (c.width/20)*18+20, (c.width/10)*7);
    ctx.fillStyle = '#000000';
    ctx.fillRect(c.width/20, c.height/12, (c.width/20)*18, (c.width/10)*5);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(c.width/20, c.height/12, (c.width/20)*18, (c.width/10)*5);
    ctx.strokeRect(c.width/20-10, c.height/12-10, (c.width/20)*18+20, (c.width/10)*7);
    
    
    // draw locations
    mapLocations[constellation].forEach(l => {
        let ind = mapLocations[constellation].indexOf(l);
        ctx.beginPath();
        ctx.arc(l.x, l.y, 5, 0, 2 * Math.PI);
        ctx.strokeStyle = l.color;
        ctx.stroke();
        ctx.closePath();

        ctx.font = "15px Hyperspace";
        ctx.fillStyle = l.color;
        ctx.fillText(l.name, l.x, l.y + 30);

        // draw more stuff if selected
        if (curMapSel == ind) {

            ctx.fillText("CONSTILATION: ", 180, 610)
            ctx.fillText(constellationNames[constellation], 320, 610);

            ctx.fillText("SECTOR NAME: ", 180, 650)
            ctx.fillText(l.name, 320, 650);

            ctx.fillText("TYPE: ", 180, 690)
            ctx.fillText(l.type, 320, 690);

            if (l.type == 'sector') {
                ctx.fillText("RESOURCES: ", 600, 660)
                ctx.fillText("HOSTILE: ", 180, 730);
                if (l.visited) {
                    ctx.fillText(l.isHostile, 320, 730);
                } else {
                    ctx.fillText("???", 320, 730);
                }
            } else if (l.type == 'trade') {
                ctx.fillText("RESOURCES: ", 600, 660)
            } else if (l.type == 'upgrade') {
                ctx.fillText("AVAILABLE UPGRADES: ", 550, 660)
            } else if (l.type == 'fuel') {
                ctx.fillText("FUEL PRICE: ", 600, 660)
            }
            let r;
            if (l.visited) {
                if (l.type == 'sector') {
                    for (let i = 0; i < l.resources.length; i++) {
                        ctx.fillText(resourceNames[l.resources[i]], 720, 660 + (30 * i));
                    }
                } else if (l.type == 'trade') {
                    ctx.fillText("BUY AND SELL", 520, 660);
                } else if (l.type == 'upgrade') {
                    for (let i = 0; i < l.locationUpgrades.length; i++) {
                        ctx.fillText(possibleUpgrades[l.locationUpgrades[i]], 730, 660 + (30 * i));
                    }
                } else if (l.type == 'fuel') {
                    ctx.fillText("FUEL PRICE: " + l.fuelPrice, 600, 660)
                }
            } else {
                ctx.fillText("???", 720, 660);
            };

            // selection rect
            ctx.strokeStyle = '#FF0000';
            ctx.strokeRect(l.x-10, l.y-10, 20, 20);
        }
        if (curMapLoc == ind) {
            // you are here marker
            ctx.fillStyle = '#00FFFF';
            ctx.fillText("You are here", l.x-40, l.y - 20);
        }
    });

    if (warper) {
        ship.fuelTotal -= 0.05;
        if (ship.fuelTotal < 0) {
            ship.fuelTotal = 0;
        }
        if (ship.fuelTotal > 0) {
            moveEntity(warper);
        } else {
            ctx.font = "40px Hyperspace";
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText("OUT OF FUEL - GAME OVER", 230, 400);
        }
        ctx.beginPath();
        ctx.arc(warper.x, warper.y, 3, 0, 2 * Math.PI);
        ctx.strokeStyle = warper.color;
        ctx.stroke();
        ctx.closePath();
        if (warper.x < warper.tx+2 &&
            warper.x > warper.tx-2 &&
            warper.y < warper.ty+2 &&
            warper.y > warper.ty-2) {
            warper = null;
            warping = false;
            mapLocations[constellation][curMapSel].visited = true;
            resources = [];
            curMapLoc = curMapSel;
            let ty = mapLocations[constellation][curMapSel].type;
            if (ty == 'trade') {
                changePrices(mapLocations[constellation][curMapLoc]);
                stage = 3; // trading
            } else if (ty == 'fuel') {
                changePrices(mapLocations[constellation][curMapLoc]);
                stage = 4; // refill gas
            } else if (ty == 'upgrade') {
                changePrices(mapLocations[constellation][curMapLoc]);
                stage = 6; // upgrade location
            } else if (ty == 'warp') {
                stage = 7; // warp to other constilations
            } else {
                stage = 1; // asteriods
                ship.x = c.width/2;
                ship.y = c.height/2;
                newAstroidField();
            }
        }
    } else {

    }
}

function drawTradingPost() {
    clearCanvas();
    drawBG();
    drawGauges();
    let station = mapLocations[constellation][curMapLoc];

    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect((c.width/10)*2, (c.height/10)*2, (c.width/10)*6, (c.height/10)*6);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect((c.width/10)*2, (c.height/10)*2, (c.width/10)*6, (c.height/10)*6);
    ctx.font = "20px Hyperspace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("TRADING POST: ", (c.width/10)*2+20, (c.height/10)*2+40);
    if (station.buySell == 0) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect((c.width/10)*2+290, (c.height/10)*2+20, 70, 30);
        ctx.fillStyle = '#000000';
        ctx.fillText("SELL", (c.width/10)*2+305, (c.height/10)*2+40);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("BUY", (c.width/10)*2+410, (c.height/10)*2+40);
    } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect((c.width/10)*2+390, (c.height/10)*2+20, 70, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("SELL", (c.width/10)*2+305, (c.height/10)*2+40);
        ctx.fillStyle = '#000000';
        ctx.fillText("BUY", (c.width/10)*2+410, (c.height/10)*2+40);
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("PRICE", (c.width/10)*2+275, (c.height/10)*2+100);
    ctx.fillText("OWNED", (c.width/10)*2+430, (c.height/10)*2+100);

    for (let i = 0; i<resourceNames.length-1; i++) {
        if (mapLocations[constellation][curMapLoc].menuNum == i) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect((c.width/10)*2+55, (c.height/10)*2+115+(i*40), 90, 30);
            ctx.fillStyle = '#000000'
        } else {
            ctx.fillStyle = '#FFFFFF';
        }
        ctx.fillText(resourceNames[i], (c.width/10)*2+60, (c.height/10)*2+140+(i*40));

        // price
        if (station.buySell == 0) {
            // sell
            ctx.fillStyle = '#FF0000';
            ctx.fillText(Math.floor(station.priceList[i]*0.85), (c.width/10)*2+290, (c.height/10)*2+140+(i*40));
        } else {
            // buy
            ctx.fillStyle = '#00FF00';
            ctx.fillText(station.priceList[i], (c.width/10)*2+290, (c.height/10)*2+140+(i*40));
        }

        // owned
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(ship.storage[i], (c.width/10)*2+450, (c.height/10)*2+140+(i*40));

        ctx.fillStyle = '#888888';
        ctx.fillText("ARROW KEYS SELECT - SPACE TO TRADE", (c.width/10)*2+90, (c.height/10)*2+430);
        ctx.fillText("PRESS M TO EXIT", (c.width/10)*2+200, (c.height/10)*2+460);

    }
}

function drawFuelDepot() {
    clearCanvas();
    drawBG();
    drawGauges();
    let depot = mapLocations[constellation][curMapLoc];
    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect((c.width/10)*2, (c.height/10)*2, (c.width/10)*6, (c.height/10)*6);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect((c.width/10)*2, (c.height/10)*2, (c.width/10)*6, (c.height/10)*6);
    ctx.font = "20px Hyperspace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("FUEL DEPOT: ", (c.width/10)*3, (c.height/10)*3);
    ctx.fillText("FUEL PRICE: " + depot.fuelPrice, (c.width/10)*4.25, (c.height/10)*5);
    ctx.fillStyle = '#888888';
    ctx.fillText("PRESS SPACE TO PURCHASE", (c.width/10)*3.75, (c.height/10)*8.5);
    ctx.fillText("PRESS M TO EXIT", (c.width/10)*4.25, (c.height/10)*9);

    // big fuel gauge
    let x = (c.width / 2) - 100; //400
    let y = (c.height/10)*6; //400
    ctx.fillStyle = "#888888";
    ctx.fillRect(x, y, ship.fuelTotal*(200/ship.maxFuel), 40);

    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.rect(x, y, 200, 40);
    ctx.stroke();

    ctx.font = "30px Hyperspace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("Fuel", x + 60, y + 30);
}

function drawUpgrade() {
    clearCanvas();
    drawBG();
    drawGauges();
    let depot = mapLocations[constellation][curMapLoc];
    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect((c.width/10)*2, (c.height/10)*2, (c.width/10)*6, (c.height/10)*6);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect((c.width/10)*2, (c.height/10)*2, (c.width/10)*6, (c.height/10)*6);
    ctx.font = "20px Hyperspace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("SHIP UPGRADES", (c.width/10)*2.5, (c.height/10)*2.5);
    ctx.fillText("Curr. level", (c.width/10)*4.5, (c.height/10)*3);
    ctx.fillText("COST", (c.width/10)*7, (c.height/10)*3);
    ctx.fillStyle = '#888888';
    ctx.fillText("ARROW KEYS SELECT - SPACE TO BUY", (c.width/10)*3, (c.height/10)*8.5);
    ctx.fillText("PRESS M TO EXIT", (c.width/10)*2+200, (c.height/10)*9);

    // list upgrades

    for (let i = 0; i<depot.locationUpgrades.length; i++) {
        if (mapLocations[constellation][curMapLoc].menuNum == i) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect((c.width/10)*2.2, (c.height/10)*4+(i*c.height/10)-25, 220, 30);
            ctx.fillStyle = '#000000'
        } else {
            ctx.fillStyle = '#FFFFFF';
        }
        // upgrade name
        ctx.fillText(possibleUpgrades[depot.locationUpgrades[i]], (c.width/10)*2.25, (c.height/10)*4+(i*c.height/10));
        // curr upgrade level
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(ship.upgrades[depot.locationUpgrades[i]], (c.width/10)*5, (c.height/10)*4+(i*c.height/10));
        // upgrade price 
        ctx.fillText(ship.upgrades[depot.locationUpgrades[i]] * 100+200, (c.width/10)*7, (c.height/10)*4+(i*c.height/10));
    }
}


function drawWarp() {
    drawStarField();

    if (!warping) {
        // map boarders width="1000" height="800"
        ctx.fillStyle = '#090909';
        ctx.fillRect(c.width/20*1, c.height/20*2, (c.width/20)*18, (c.height/20)*16);
        //ctx.fillStyle = '#000000';
        //ctx.fillRect(c.width/20, c.height/12, (c.width/20)*18, (c.width/10)*5);

        ctx.strokeStyle = '#FFFFFF';
        //ctx.strokeRect(c.width/20, c.height/12, (c.width/20)*18, (c.width/10)*5);
        ctx.strokeRect(c.width/20*1, c.height/20*2, (c.width/20)*18, (c.height/20)*16);

        // print current constilation
        ctx.fillStyle = '#FFFFFF';
        ctx.font = "30px Hyperspace";
        ctx.fillText("CURR. CONSTILATION: ", c.width/20*6, c.height/10*2)
        ctx.fillText(constellationNames[constellation], c.width/20*8, c.height/10*3);

        ctx.fillText("JUMP TO SYSTEM:", c.width/20*6, c.height/10*5)

        let l = mapLocations[constellation][curMapLoc];
        for (let i = 0; i < l.warpDestinations.length; i++) {
            if (l.menuNum == i) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect((c.width/20)*7.6, (c.height/10)*6+(i*40)-25, 180, 30);
                ctx.fillStyle = '#000000'
            } else {
                ctx.fillStyle = '#FFFFFF';
            }
            ctx.fillText(constellationNames[l.warpDestinations[i]], (c.width/20)*8, (c.height/10)*6+(i*40));
        }
    } else {
        jumpTimer --;
        if (jumpTimer% 10) {
            ship.fuelTotal -= 0.1;
            if (ship.fuelTotal <= 0) {
                // TODO Fix this 
                lives = 0;
            }
        }
        if (jumpTimer < 1) {
            warping = false;
            stage = 2;
        }
    }
}

function drawStarField() {
    clearCanvas();
    drawBG();
    drawGauges();

    starField.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.closePath();
    });
}

function drawBG() {
    let loc = mapLocations[constellation][curMapLoc];
    for (let i = 0; i < loc.bg.length - 1; i ++) {
        ctx.beginPath();
        ctx.arc(loc.bg[i], loc.bg[i+1], 2, 0, .5 * Math.PI);
        ctx.strokeStyle = '#445533';
        ctx.stroke();
        ctx.closePath();
    }
}

// **********************
// player input functions
// **********************

/*c.oncontextmenu = function(event) {
    var x = Math.floor((event.pageX - cLeft) / scale),
        y = Math.floor((event.pageY - cTop) / scale);
    
    click(x, y, event.button);
    event.preventDefault();
}
c.addEventListener('click', function(event) {
    var x = Math.floor((event.pageX - cLeft)),
        y = Math.floor((event.pageY - cTop));
    
    click(x, y, event.button);
}, false);*/

function click(x, y, button) {
    //console.log("click x: " + x + ", y: " + y)
    //sctx.rotate(20 * Math.PI / 180);
    //draw();
}

window.addEventListener("keydown", kDown);
window.addEventListener("keyup", kUp);
window.addEventListener('resize', doResize);

function kDown(e) {
    if (stage == 0) {
        // title controls
        stage ++;
    } else if (stage == 2) {
        if (!warping) {
            // map controls
            if (e.key == 'ArrowLeft') {curMapSel --;}
            if (e.key == 'ArrowRight') {curMapSel ++;}
            if (e.key == 'ArrowUp') {curMapSel --;}
            if (e.key == 'ArrowDown') {curMapSel ++;}
            if (curMapSel > mapLocations[constellation].length - 1) {
                curMapSel = 0;
            }
            if (curMapSel < 0) {
                curMapSel = mapLocations[constellation].length - 1;
            }
            //console.log("curmapsel: " + curMapSel);
            // space to goto des
            if (e.key == ' ') {
                if (curMapLoc == curMapSel) {
                    if (mapLocations[constellation][curMapLoc].type == 'trade') {
                        stage = 3;
                    } else if (mapLocations[constellation][curMapLoc].type == 'fuel') {
                        stage = 4;
                    } else if (mapLocations[constellation][curMapLoc].type == 'upgrade') {
                        stage = 6;
                    } else if (mapLocations[constellation][curMapLoc].type == 'warp') {
                        stage = 7;
                    } else {
                        stage = 1;
                    }
                } else {
                    warping = true;
                    let o = mapLocations[constellation][curMapLoc];
                    let d = mapLocations[constellation][curMapSel];
                    warper = new Warper(o.x, o.y, d.x, d.y);
                }
            }
        } else {
            // disable controls while warping
        }
    } else if (stage == 3) {
        if (e.key == 'ArrowLeft' || e.key == 'ArrowRight' ) {
            if (mapLocations[constellation][curMapLoc].buySell == 0) {
                mapLocations[constellation][curMapLoc].buySell = 1;
            } else {
                mapLocations[constellation][curMapLoc].buySell = 0;
            }
        }
        if (e.key == 'ArrowUp') {
            mapLocations[constellation][curMapLoc].menuNum --;
            if (mapLocations[constellation][curMapLoc].menuNum < 0) {
                mapLocations[constellation][curMapLoc].menuNum = 0;
            }
        }
        if (e.key == 'ArrowDown') {
            mapLocations[constellation][curMapLoc].menuNum ++;
            if (mapLocations[constellation][curMapLoc].menuNum >= resourceNames.length-2) {
                mapLocations[constellation][curMapLoc].menuNum = resourceNames.length-2;
            }
        }

        if (e.key == ' ') {
            let loc = mapLocations[constellation][curMapLoc];
            if (loc.buySell == 0) {
                // sell
                if (ship.storage[loc.menuNum] > 0) {
                    ship.storage[loc.menuNum] --;
                    ship.storageTotal --;
                    ship.money += Math.floor(loc.priceList[loc.menuNum]*0.85);
                }
            } else {
                // buy
                if (ship.storageTotal < ship.maxStorage) {
                    if (ship.money >= loc.priceList[loc.menuNum]) {
                        ship.storage[loc.menuNum] ++;
                        ship.storageTotal ++;
                        ship.money -= loc.priceList[loc.menuNum];
                    }
                }
            }
        }
        if (e.key == 'm') {
            stage = 2;
        }
    } else if (stage == 4) {
        // fuel depot controls
        let loc = mapLocations[constellation][curMapLoc];
        if (e.key == ' ') {
            if (ship.fuelTotal < ship.maxFuel && ship.money > loc.fuelPrice) {
                ship.money -= loc.fuelPrice;
                ship.fuelTotal += 1;
                if (ship.fuelTotal > ship.maxFuel) {
                    ship.fuelTotal = ship.maxFuel
                }
            }
        }
        if (e.key == 'm') {
            stage = 2;
        }
    } else if (stage == 6) {
        if (e.key == 'ArrowUp') {
            mapLocations[constellation][curMapLoc].menuNum --;
            if (mapLocations[constellation][curMapLoc].menuNum < 0) {
                mapLocations[constellation][curMapLoc].menuNum = 0;
            }
        }
        if (e.key == 'ArrowDown') {
            mapLocations[constellation][curMapLoc].menuNum ++;
            if (mapLocations[constellation][curMapLoc].menuNum >= mapLocations[curMapLoc].locationUpgrades.length-1) {
                mapLocations[constellation][curMapLoc].menuNum = mapLocations[curMapLoc].locationUpgrades.length-1;
            }
        }

        if (e.key == ' ') {
            let loc = mapLocations[constellation][curMapLoc];
            
            // buy
            let depot = mapLocations[constellation][curMapLoc];
            let cost = ship.upgrades[depot.locationUpgrades[mapLocations[constellation][curMapLoc].menuNum]] * 100 + 200;
            if (ship.money >= cost) {
                ship.money -= cost;
                ship.upgrades[depot.locationUpgrades[mapLocations[constellation][curMapLoc].menuNum]] += 1;
                let lvl = ship.upgrades[depot.locationUpgrades[mapLocations[constellation][curMapLoc].menuNum]]
                switch (depot.locationUpgrades[mapLocations[constellation][curMapLoc].menuNum]) {
                    case 0:
                        // fuel tank
                        ship.maxFuel += 50 * lvl;
                        break;
                    case 1:
                        // max ship speed
                        ship.maxSpeed += 1;
                        break;
                    case 2:
                        // ship acceleration
                        ship.acceleration += 1;
                        break;
                    case 3:
                        // max bullets
                        ship.maxBullets += 1;
                        break;
                    case 4:
                        // bullet rate
                        ship.bulletRate -= 5;
                        if (ship.bulletRate < 1) {
                            ship.bulletRate = 1;
                        }
                        break;
                    case 5:
                        // max storage
                        ship.maxStorage += 20 * lvl;
                        break;
                    case 6:
                        // collection distance
                        ship.collectDistance += 50 * lvl;
                        break;
                }
            }
        }

        if (e.key == 'm') {
            stage = 2;
        }
    } else if (stage == 7) {
        console.log(warping);
        // warp to other constilation
        if (!warping) {
            jumpTimer = 200;
            if (e.key == 'ArrowUp') {
                mapLocations[constellation][curMapLoc].menuNum --;
                if (mapLocations[constellation][curMapLoc].menuNum < 0) {
                    mapLocations[constellation][curMapLoc].menuNum = 0;
                }
            }
            if (e.key == 'ArrowDown') {
                mapLocations[constellation][curMapLoc].menuNum ++;
                if (mapLocations[constellation][curMapLoc].menuNum >= mapLocations[constellation][curMapLoc].warpDestinations.length-1) {
                    mapLocations[constellation][curMapLoc].menuNum = mapLocations[constellation][curMapLoc].warpDestinations.length-1;
                }
            }
            console.log(mapLocations[constellation][curMapLoc].menuNum)
            if (e.key == ' ') {
                constellation = mapLocations[constellation][curMapLoc].warpDestinations[mapLocations[constellation][curMapLoc].menuNum];
                warping = true;
            }
            if (e.key == 'm') {
                stage = 2;
            }
        } else {
            // do nothing, count down timer in drawWarp
        }

    } else {
        if (!ship.dead) {
            // default controls 
            if (e.key == '9') {
                ship.money += 1000;
            }
            if (e.key == '1') {
                lives ++;
            }
            if (e.key == ' ') {
                spaceBar = true;
                // always add a bullet if one doesn't exist
                if (bullets.length <= 0 && ship.dead == 0) {
                    ship.bulletTimer = ship.bulletRate;
                    bullets.push(new Bullet(ship.rot, ship.x + 20, ship.y + 20));
                }
            }
            if (e.key == 'ArrowLeft') {left = true;}
            if (e.key == 'ArrowRight') {right = true;}
            if (e.key == 'ArrowUp') {up = true;}
            if (e.key == 'ArrowDown') {down = true;}
            // go to map
            if (e.key == 'm') {stage = 2; mapReminder = false;}
        }
        if (e.key == '0') {
            window.location.reload();
        }
    }
}

function kUp(e) {
    if (e.key == ' ') {spaceBar = false;}
    if (e.key == 'ArrowLeft') {left = false;}
	if (e.key == 'ArrowRight') {right = false;}
    if (e.key == 'ArrowUp') {up = false;}
	if (e.key == 'ArrowDown') {down = false;}
}

// *****************
// utility functions
// *****************

function moveShip() {
    // move ship
    if (ship.dead <= 0 && lives > 0) {
        // fire
        if (spaceBar) {
            if (bullets.length < ship.maxBullets) {
                if (ship.bulletTimer < 0) {
                    ship.bulletTimer = ship.bulletRate;
                    bullets.push(new Bullet(ship.rot, ship.x + 20, ship.y + 20));
                    // rainbow bullets
                    colorCycle = (colorCycle += 1) % 8;
                } else {
                    ship.bulletTimer --;
                }
            }
        }

        // ship rotation
        if (left) {
            ship.rot = (ship.rot -= 5) % 360;
            sctx.rotate(-5 * Math.PI / 180);
            if (ship.rot < 0) {
                ship.rot = 360 + ship.rot;
            }
        }
        if (right) {
            sctx.rotate(5 * Math.PI / 180);
            ship.rot = (ship.rot += 5) % 360;
        }
        // ship breaking
        if (down) {
            ship.speed -= ship.breakSpeed;
            if (ship.speed < 0) {
                ship.speed = 0;
            }   
        }
        // ship speed up
        if (up && ship.fuelTotal > 0) {
            if (ship.speed < ship.maxSpeed) {
                ship.speed += ship.acceleration;
            }
            ship.fuelTotal -= 0.003;
            if (ship.fuelTotal < 0) {
                ship.fuelTotal = 0;
            }
        } else {
            if (ship.speed > 0) {
                ship.speed -= 0.01;
            } else {
                ship.speed = 0;
            }
        }
        moveEntity(ship);
        // ship & asteroid collision
        asteroids.forEach(roid => {
            if (collision(ship, roid)) {
                ship.dead = 100;
                ship.speed = 0;
                let r = getRandomInt(5) + 5;
                let x1 = ship.x + ship.hbOffset1 + (ship.hbOffset2/2);
                let y1 = ship.y + ship.hbOffset1 + (ship.hbOffset2/2);
                for (let i = 0; i < r; i++) {
                    debrisArray.push(new Debri(x1, y1));
                }
            }
        });
    } else {

    }
}

function clearCanvas() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, c.width, c.height);
}

function drawAsteroids() {
    asteroids.forEach(roid => {
        actx.clearRect(-40,-40,80,80);
        actx.rotate(roid.spin * Math.PI / 180);
        actx.strokeStyle = roid.color;
        actx.stroke(roid.path);
        ctx.drawImage(a, 0,0,80,80, roid.x, roid.y,80,80);
        actx.rotate(-roid.spin * Math.PI / 180);
        if (showHitbox) {
            drawHitbox(roid);
        }
    });
}

function drawMobiles() {
    enemies.forEach(e => {
        moveEntity(e);
        e.bulletTimer --;
        if (e.bulletTimer <= 0) {
            e.bulletTimer = getRandomInt(150) + 100;
            if (!ship.dead) {
                bullets.push(new Bullet(angle(e.x,e.y,ship.x,ship.y), e.x + 40, e.y + 40, 5, false));
            }
        }
        if (getRandomInt(20) == 1) {
            e.rot += getRandomInt(30) - 15
        }
        actx.clearRect(-40,-40,80,80);
        actx.rotate(e.spin * Math.PI / 180);
        actx.strokeStyle = e.color;
        actx.stroke(e.path);
        ctx.drawImage(a, 0,0,80,80, e.x, e.y,80,80);
        actx.rotate(-e.spin * Math.PI / 180);
        if (showHitbox) {
            drawHitbox(e);
        }
    });
}

function drawHitbox(e) {
    ctx.strokeStyle = '#FF0000';
    ctx.strokeRect(e.x+e.hbOffset1, e.y+e.hbOffset1, e.hbOffset2, e.hbOffset2);
}

function drawGauges() {
    // UI
    ctx.font = scaleFont(0.03, "Hyperspace"); //"30px Hyperspace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("$" + ship.money, (c.width/20)*0.5, (c.height/20)*1.5);
    ctx.fillText("LIVES: "+lives, (c.width/20)*16.5, (c.height/20)*1.5);

    let x = c.width/4;
    let y = 20;

    // storage gague
    ctx.fillStyle = "#888888";
    ctx.fillRect(c.width/20*3, c.height/20*0.8, (c.width/20*2.5/100)*ship.storageTotal*(100/ship.maxStorage), c.height/20*0.8);

    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.rect(c.width/20*3, c.height/20*0.8, c.width/20*2.5, c.height/20*0.8);
    ctx.stroke();

    ctx.font = scaleFont(0.02, "Hyperspace"); //"12px Hyperspace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("storage", c.width/20*3.4, c.height/20*1.45);

    // fuel gauge
    ctx.fillStyle = "#888888";
    ctx.fillRect(c.width/20*13, c.height/20*0.8, (c.width/20*2.5/100)*ship.fuelTotal*(100/ship.maxFuel), c.height/20*0.8);

    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.rect(c.width/20*13, c.height/20*0.8, c.width/20*2.5, c.height/20*0.8);
    ctx.stroke();

    ctx.font = scaleFont(0.02, "Hyperspace");
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("Fuel", c.width/20*13.9, c.height/20*1.45);

}

function changePrices(loc) {
    if (loc.type == 'fuel') {
        loc.fuelPrice += getRandomInt(2) - 1;
        if (loc.fuelPrice < 1) {
            loc.fuelPrice = 1;
        }
    } else {
        for (let i = 0; i < loc.priceList.length; i++) {
            loc.priceList[i] = loc.priceList[i] + getRandomInt(20) - 10;
        }
    }
}

function collision(e, t) {
    let p = [e.x + e.hbOffset1, e.y + e.hbOffset1, 
            e.x + e.hbOffset1, e.y + e.hbOffset1 + e.hbOffset2,
            e.x + e.hbOffset1 + e.hbOffset2, e.y + e.hbOffset1,
            e.x + e.hbOffset1 + e.hbOffset2, e.y + e.hbOffset1 + e.hbOffset2];
    for (let i = 0; i < 8; i+=2) {
        if (p[i] > t.x + t.hbOffset1 && 
            p[i+1] > t.y + t.hbOffset1 &&
            p[i] < t.x + t.hbOffset1 + t.hbOffset2 &&
            p[i+1] < t.y + t.hbOffset1 + t.hbOffset2) {
                return true;
        }
    }
}

function genMapLocations() {
    for (j = 0; j < mapLocations.length; j++ ) {
        for (let i = 0; i < constellationStarsArrays[j].length/2; i++) {
            t = 'sector';
            if (i == 2) {
                t = 'upgrade';
            } else if (i == 4) {
                t = 'warp';
            } else if (i == 5) {
                t = 'trade';
            } else if (i == 7) {
                t = 'fuel';
            }
            mapLocations[j].push(new MapLocation(t,i*2, j));
        }
    }
}

function newAstroidField() {
    asteroids = [];
    enemies = [];
    //resources = []; // needed? 
    let r = getRandomInt(6) + 4;
    for (let i=0; i<r; i++) {
        asteroids.push(new Asteroid());
    }
    if (mapLocations[constellation][curMapLoc].isHostile) {
        enemies.push(new mobile(0,0)); // 0,0 = radom x,y along width height
    }
}

function angle360(cx, cy, ex, ey) {
    var theta = angle(cx, cy, ex, ey); // range (-180, 180]
    if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    return theta;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function shuffle(array) {
    let t,r,l;
    l = array.length-1;
    while (l) {
        r = Math.floor(Math.random() * l)
        t = array[r]
        array[r] = array[l];
        array[l] = t;
        l--;
    }
}

function distance2D(e1, e2) {
    let x1 = e1.x;
    let y1 = e1.y;
    let x2 = e2.x;
    let y2 = e2.y;
    return Math.hypot(x2 - x1, y2 - y1);
}

function getWidth() {
    // multi-browser support
    if (self.innerWidth) {
      return self.innerWidth;
    }
    if (document.documentElement && document.documentElement.clientWidth) {
      return document.documentElement.clientWidth;
    }
    if (document.body) {
      return document.body.clientWidth;
    }
  }

  function getHeight() {
    if (self.innerHeight) {
      return self.innerHeight;
    }
    if (document.documentElement && document.documentElement.clientHeight) {
      return document.documentElement.clientHeight;
    }
    if (document.body) {
      return document.body.clientHeight;
    }
  }

  function doResize() {
    c.width = getWidth() - 50;
    c.height = getHeight() - 30;
  }

  function scaleFont(s, f) {
    return (c.width * s) + "px " + f;                     
  }

