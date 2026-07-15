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
ctx.fillRect(0, 0, c.width, c.height);
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
                    'Pandora', 'Phoebe', 'Portia', 'Titania', 'Stella', 'Vega', 'Luna', 'Eluria', 'Mithras',
                    'Calar 25', 'Laffer', '5Bonds-12', 'Rosella', 'Graham', 'Fenrus', 'Wilkans', 'Alpha-Bains-6',
                    'Vohaul', 'Mosely', 'Nakimura 4', 'Shema', 'Shameen', 'Erana', 'Kalalau','Cassima', 'Delaney',
                    'Zara', 'SPR-3', 'Anansi', 'RAVE-II', 'Beatrice', 'LIAM', 'Boogle'];
let constellationNames = ['AQUARIUS', 'ARIES', 'CANCER', 'CAPRICORNUS', 'GEMINI', 'LEO', 'LIBRA', 
                        'PISCES', 'SAGITTARIUS', 'SCORPIUS', 'TAURUS', 'VIRGO'];
// RD: name, color
let resourceNames = ['Gold', 'Silver', 'Copper', 'Diamond', 'Platnum', 'Uranium', 'Lithium', 'Ytterbium'];
let resourceColor = ['#E8B923', '#7d3c98', '#3498db', '#27ae60', '#d35400', '#5d6d7e', '#cd6155', '#48c9b0'];
// x is 1.724% y is 3.06
let constellationStarsArrays = [[2.9, 12.9, 4.5, 7.6, 6.2, 7.7, 6.4, 11.8, 6.0, 12.9, 6.9, 6.2, 8.5, 5.3, 10.0, 4.7, 9.1, 8.8, 9.4, 11.0, 11.8, 6.9, 14.7, 9.4],
                                [13.1, 9.6, 11.5, 9.7, 7, 10.6, 4.3, 9.7, 5.2, 13.6, 1.9, 11.7, 2.4, 9.6, 13.9, 11.6, 17, 12.8, 8.2, 5.9, 5.9, 4.5],
                                [7.1, 3.7, 8.8, 7.3, 8.9, 10.6, 6.3, 13.5, 13.4, 13.2, 11.6, 8.9],
                                [15.5, 5.8, 13.2, 7.5, 10.2, 13.2, 7.9, 13.9, 5.2, 12.2, 4.7, 9.5, 2.3, 8.2, 1.9, 4.2, 4.8, 6.4, 9.1, 7.6, 9.2, 10.5], // cap
                                [11.3, 12.9, 9.4, 10.9, 13.8, 12.3, 6, 11.8, 4, 9.8, 1.3, 6.8, 2.8, 11.1, 5.9, 7.7, 6.7, 5.6, 3.2, 5.1, 7.5, 3.5, 8.6, 8.3, 12.1, 10, 12.2, 7.7, 13.6, 6.5, 15.3, 4.4], // gemini
                                [2.9, 9.4, 5.4, 6.2, 5.4, 9.3, 4.7, 11, 3.9, 13.9, 7.4, 12.3, 9.6, 10, 10.4, 12.1, 13.9, 13.2, 9, 7.2, 9.2, 5.9, 11.4, 4.4, 14.1, 4.1, 13.8, 8, 12.2, 7.3], // leo
                                [5.1, 3.1, 2, 5.9, 4.2, 9.4, 7.9, 7.8, 6.7, 5.9, 12.7, 4.8, 12.1, 8.5, 9.7, 13.1, 5.9, 11.2, 5.2, 12.4, 3.9, 13.4, 14.5, 3.], // Libra
                                [13.1, 13.4, 16.8, 13.8, 14.3, 12.3, 11.3, 12.9, 10, 10.2, 7, 12.9, 4.7, 11.7, 2, 13.6, 3.3, 8.9, 4.6, 6.8, 8.8, 6.6, 5.9, 4.4, 7.5, 3.7, 8.5, 2.8], // pisces
                                [3.7, 13.1, 8.3, 13, 1.4, 13.7, 5.8, 12.8, 2.6, 10.9, 2.5, 8.9, 1.9, 6.9, 2.9, 6.2, 3.7, 4.6, 7.1, 8.3, 7.3, 10.4, 9.6, 9.6, 8.1, 7.5, 7.6, 5.9, 10.2, 6.5, 7.2, 4.7, 6.7, 3, 5, 3.6, 12.5, 7.6, 15.2, 4.8, 14.4, 8.9, 15.7, 10.5, 16.9, 9.3, 12.8, 12, 14.7, 13.5], // sag
                                [11, 3.1, 10.1, 5.8, 13, 5.8, 11.7, 8.2, 11.5, 10.3, 11.9, 12.6, 7.5, 6.2, 6.5, 7.7, 7.8, 9.7, 6.4, 11.1, 8.5, 11.4, 8.5, 13.6, 6.1, 13.6, 3.8, 13, 2, 13.8, 2.6, 11.4, 2.1, 8.2, 4.5, 8.4], // scorp
                                [11.1, 5.6, 2.5, 3, 6.3, 4.7, 7.4, 7.8, 10.2, 8.4, 8.9, 10.6, 6.9, 10.8, 3.7, 9.1, 1.3, 7.4, 10.3, 12.3, 8.3, 12.7, 10.2, 13.9, 12.8, 10.3, 14.7, 12.3, 16.5, 13.3], // taurus
                                [2.4, 6.6, 5.6, 6.5, 7, 8.3, 9.6, 6.8, 12.7, 5.6, 14.7, 8.6, 14.9, 12.6, 11.9, 12.8, 9.8, 13.5, 7.9, 13.2, 5.8, 13, 3.3, 12.4, 3.2, 10.3, 8.5, 3.3]]; // virgo
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
                        "MAX STORAGE", "COLLECTION DISTANCE", "SHIP DECELERATION", "BULLET DAMAGE", "BULLET DISTANCE"]
let debug = false;



// ********************
// animation & movement
// ********************

function step(timeStamp) {
    if (start === undefined) {
        doResize();
        score = 0;
        lives = 3;
        start = timeStamp;
        ship = new Ship();
        // random inital upgrades
        for (let i = 0; i < ship.upgrades.length; i++) {
            if (getRandomInt(3) == 1) {
                let l = getRandomInt(5);
                let j = 0;
                while (j < l) {
                    ship.upgrades[i] ++;
                    doUpgrade(i, ship.upgrades[i]);
                    j ++;
                }
            }
            console.log(possibleUpgrades[i] + ": " + ship.upgrades[i]);
        }
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
                        if (b.fromShip) {
                            ship.comboDamage += 1;
                            if (ship.comboDamage > 10) {ship.comboDamage = 10}
                            console.log("combo: " + ship.comboDamage);
                            score += 5;
                        }
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
    if (ship.flightModel == 1 && e.acceleration > 0) {
        // Move ship asteroids style
        e.x += e.velX;
        e.y += e.velY;
    } else {
        let angleRad = e.rot * Math.PI / 180;
        e.x += (e.speed * Math.cos(angleRad));
        e.y += (e.speed * Math.sin(angleRad));
    }
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

// **********************
// player input functions
// **********************

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
            if (mapLocations[constellation][curMapLoc].menuNum >= resourceNames.length-1) {
                mapLocations[constellation][curMapLoc].menuNum = resourceNames.length-1;
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
            for (let i = 0; i < (ship.upgrades[0]+1)*3; i++) { // speed up pumping on larger tanks
                if (ship.fuelTotal < ship.maxFuel && ship.money > loc.fuelPrice) {
                    ship.money -= loc.fuelPrice;
                    ship.fuelTotal += 1;
                    if (ship.fuelTotal > ship.maxFuel) {
                        ship.fuelTotal = ship.maxFuel
                    }
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
            if (mapLocations[constellation][curMapLoc].menuNum >= mapLocations[constellation][curMapLoc].locationUpgrades.length-1) {
                mapLocations[constellation][curMapLoc].menuNum = mapLocations[constellation][curMapLoc].locationUpgrades.length-1;
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
                let sel = depot.locationUpgrades[mapLocations[constellation][curMapLoc].menuNum];
                doUpgrade(sel, lvl);
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
            if (e.key == ' ') {
                spaceBar = true;
                // TODO bullet firing feels unresponsive 
                if (bullets.length < ship.maxBullets) {
                    ship.bulletTimer = ship.bulletRate;
                    bullets.push(new Bullet(ship, ship.rot, ship.x + 20, ship.y + 20));
                }
            }
            if (e.key == 'ArrowLeft') {left = true;}
            if (e.key == 'ArrowRight') {right = true;}
            if (e.key == 'ArrowUp') {up = true;}
            if (e.key == 'ArrowDown') {down = true;}
            // go to map
            if (e.key == 'm') {stage = 2; mapReminder = false;}
            // change flight model
            if (e.key == 'f') {
                ship.flightModel == 0 ? ship.flightModel = 1 : ship.flightModel = 0;
            }
        }
    }
    if (e.key == '+') {
        if (debug) {
            debug = false;
        } else {
            debug = true;
        }
        console.log("debug: " + debug);
    }
    if (e.key == '0') {
        window.location.reload();
    }
    if (debug) {
        if (stage == 2) {
            if (e.key == 'a') {
                mapLocations[constellation][curMapSel].x -= 1;
            }
            if (e.key == 'd') {
                mapLocations[constellation][curMapSel].x += 1;
            }
            if (e.key == 'w') {
                mapLocations[constellation][curMapSel].y -= 1;
            }
            if (e.key == 's') {
                mapLocations[constellation][curMapSel].y += 1;
            }
            if (e.key == 'e') {
                let str = "[";
                mapLocations[constellation].forEach(l => {
                    str += l.x + ", " + l.y + ", ";
                });
                console.log(str);
            }
        }

        if (e.key == '1') {
            lives ++;
        }
        if (e.key == '2') {
            asteroids.forEach(roid => {
                roid.health = -1;
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
                damageNumbers.push(new DamageNumber(999999, roid.x+roid.hbOffset1+(roid.hbOffset2/2), roid.y+roid.hbOffset1+(roid.hbOffset2/2)));
                asteroids = asteroids.filter(r => !deadAsteroids.includes(r));
                deadAsteroids = [];
            });
        }
        if (e.key == '3') {
            if (showHitbox) {
                showHitbox = false;
            } else {
                showHitbox = true;
            }
        }
        if (e.key == '7') {
            ship.bulletRate -= 10;
        }
        if (e.key == '8') {
            ship.baseDamage += 2;
        }
        if (e.key == '9') {
            ship.money += 1000;
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

function doUpgrade(sel, lvl) {
    switch (sel) {
        case 0:
            // fuel tank
            ship.maxFuel += 50 * lvl;
            break;
        case 1:
            // max ship speed
            ship.maxSpeed += 0.25;
            break;
        case 2:
            // ship acceleration
            ship.acceleration += 0.25;
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
        case 7:
            // ship deceleration
            ship.breakSpeed += 0.25;
            break;
        case 8:
            // bullet damage
            ship.baseDamage += 2;
            break;
        case 9:
            // bullet distance
            ship.bulletLife += 20;
            break;
    }
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
                    bullets.push(new Bullet(ship, ship.rot, ship.x + 20, ship.y + 20));
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

        if (ship.flightModel == 0) { // car style flight
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
        } else {
            // classic asteroids flight
            // thrust
            if (up && ship.fuelTotal > 0) {

                const angle = ship.rot * Math.PI / 180;

                ship.velX += Math.cos(angle) * ship.acceleration;
                ship.velY += Math.sin(angle) * ship.acceleration;

                // Optional speed cap
                const speed = Math.hypot(ship.velX, ship.velY);
                if (speed > ship.maxSpeed) {
                    ship.velX = (ship.velX / speed) * ship.maxSpeed;
                    ship.velY = (ship.velY / speed) * ship.maxSpeed;
                }

                ship.fuelTotal -= 0.003;
                if (ship.fuelTotal < 0) {
                    ship.fuelTotal = 0;
                }
            }
            /* reverse thrust (not in original Asteroids)
            if (down) {
                const angle = ship.rot * Math.PI / 180;

                ship.velX -= Math.cos(angle) * ship.acceleration * 0.5;
                ship.velY -= Math.sin(angle) * ship.acceleration * 0.5;
            }*/

            // Apply drag
            ship.velX *= ship.drag;
            ship.velY *= ship.drag;
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
    // only calculate if close enough to hit
    if (distance2D(e, t) <= e.hbOffset2 + t.hbOffset2 * 2) {
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

function distanceWarper(e) {
    let x1 = e.x;
    let y1 = e.y;
    let x2 = e.tx;
    let y2 = e.ty;
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

