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
    if (debug) {
        ctx.fillText('debugging', 10, c.height - 10);
    }
    /*/ center guide lines
    ctx.strokeStyle = "#00FF00";
    ctx.beginPath();
    ctx.rect(0, c.height/2, c.width, 1);
    ctx.rect(c.width/2, 0, 1, c.height);
    ctx.stroke();
    */
}



function drawTitle() {
    clearCanvas();
    drawBG();
    drawAsteroids();

    ctx.font = scaleFont(0.1, "Hyperspace");
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("ASTEROIDS 2025", c.width/20*1.5, c.height/20*6);

    let ox = 0, oy = 10;
    ctx.font = scaleFont(0.025, "Hyperspace");
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("STARTING UPGRADE LEVELS:", (c.width/20*(10*ox)+(c.width/20*2.1)), c.height/20*8.5);
    for (let i = 0; i < ship.upgrades.length; i ++) {
        if (ship.upgrades[i] > 0) {
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.fillStyle = '#888888';
        }
        ctx.fillText(possibleUpgrades[i]+": "+ship.upgrades[i], (c.width/20*(10*ox)+(c.width/20*2.1)), (c.height/20*(1*oy)));
        ox ++;
        if (ox > 1) {
            ox = 0;
            oy ++;
        }
    }

    ctx.font = scaleFont(0.03, "Hyperspace"); //"25px Hyperspace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("ARROW KEYS MOVE, SPACE KEY FIRE", c.width/20*4, c.height/20*16.5);

    ctx.font = scaleFont(0.05, "Hyperspace"); //"40px Hyperspace";
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("PRESS ANY KEY", c.width/20*6, c.height/20*18.5);
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
        if (showHitbox && debug) {
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
                ship.x = c.width*2;
                ship.y = c.height*2;
            }
        }
        ship.dead --;
    }
    
    // draw bullets
    bullets.forEach(b => {
        ctx.beginPath();
        //console.log(b, b.x, b.y)
        ctx.arc(b.x, b.y, 2+(b.damage/4), 0, 360);  
        ctx.strokeStyle = b.color;
        ctx.stroke();
        ctx.closePath();
        if (showHitbox && debug) {
            drawHitbox(b);
        }
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
        ctx.arc(r.x, r.y, r.radius/2, 0, 2 * Math.PI);
        ctx.strokeStyle = r.color;
        ctx.stroke();
        ctx.closePath();
    });

    drawGauges();

    if (lives <= 0) {
        ctx.font = scaleFont(0.05, "Hyperspace");
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("GAME OVER", (c.width/20)*8, (c.height/20)*10);
        location.reload();
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

    // map clear
    ctx.fillStyle = '#0F0F0F';
    ctx.fillRect(c.width/20*0.5, c.height/20*2, c.width/20*19, c.height/20*17.5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(c.width/20*1, c.height/20*2.5, c.width/20*18, c.height/20*12.5);
    
    // map boarders
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(c.width/20*0.5, c.height/20*2, c.width/20*19, c.height/20*17.5);
    ctx.strokeRect(c.width/20*1, c.height/20*2.5, c.width/20*18, c.height/20*12.5);
    
    // draw locations
    mapLocations[constellation].forEach(l => {
        let ind = mapLocations[constellation].indexOf(l);
        ctx.beginPath();
        ctx.arc(c.width/20*l.x, c.height/20*l.y, c.width/20*0.1, 0, 360);
        ctx.strokeStyle = l.color;
        archColor(l);
        ctx.stroke();
        ctx.closePath();

        ctx.font = scaleFont(0.018, "Hyperspace");
        if (l.visited) {
            ctx.fillStyle = l.color;
        } else {
            ctx.fillStyle = "#999999";
        }
        ctx.fillText(l.name, c.width/20*l.x, c.height/20*l.y+(c.height/20*1));

        // draw more stuff if selected
        ctx.fillStyle = l.color;
        if (curMapSel == ind) {

            ctx.fillText("CONSTILATION: ", c.width/20*3, c.height/20*16)
            ctx.fillText(constellationNames[constellation], c.width/20*6, c.height/20*16);

            ctx.fillText("SECTOR NAME: ", c.width/20*3, c.height/20*17)
            ctx.fillText(l.name, c.width/20*6, c.height/20*17);

            ctx.fillText("TYPE: ", c.width/20*3, c.height/20*18)
            ctx.fillText(l.type, c.width/20*6, c.height/20*18);

            if (l.type == 'sector') {
                ctx.fillText("HOSTILE: ", c.width/20*3, c.height/20*19);
                if (l.visited) {
                    ctx.fillText(l.isHostile, c.width/20*6, c.height/20*19);
                } else {
                    ctx.fillText("???", c.width/20*6, c.height/20*19);
                }
                ctx.fillText("RESOURCES: ", c.width/20*11, c.height/20*16)
            } else if (l.type == 'trade') {
                ctx.fillText("RESOURCES: ", c.width/20*11, c.height/20*16)
            } else if (l.type == 'upgrade') {
                ctx.fillText("UPGRADES: ", c.width/20*11, c.height/20*16)
            } else if (l.type == 'fuel') {
                ctx.fillText("FUEL PRICE: ", c.width/20*11, c.height/20*16)
            }
            let r;
            if (l.visited) {
                if (l.type == 'sector') {
                    for (let i = 0; i < l.resources.length; i++) {
                        ctx.fillText(resourceNames[l.resources[i]], c.width/20*13.5, c.height/20*16+(c.height/20*i));
                    }
                } else if (l.type == 'trade') {
                    ctx.fillText("BUY AND SELL", 520, 660);
                } else if (l.type == 'upgrade') {
                    for (let i = 0; i < l.locationUpgrades.length; i++) {
                        ctx.fillText(possibleUpgrades[l.locationUpgrades[i]], c.width/20*13.5, c.height/20*16+(c.height/20*i));
                    }
                } else if (l.type == 'fuel') {
                    ctx.fillText("FUEL PRICE: " + l.fuelPrice, c.width/20*11, c.height/20*16);
                }
            } else {
                ctx.fillText("???", c.width/20*13.5, c.height/20*16);
            };

            // selection rect
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 3;
            ctx.strokeRect((c.width/20*l.x)-(c.width/20*0.2), (c.height/20*l.y)-(c.height/20*0.3), (c.width/20*0.4),  (c.height/20*0.6));
            ctx.lineWidth = 1;
        }
        if (curMapLoc == ind) {
            // you are here marker
            ctx.fillStyle = '#00FFFF';
            ctx.fillText("You are here", (c.width/20*l.x)-(c.width/20*1), (c.height/20*l.y)-(c.height/20*0.5));
        }
    });

    if (ship.fuelTotal > 0) {
        moveEntity(warper);
    } else {
        ctx.font = "40px Hyperspace";
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("OUT OF FUEL - GAME OVER", 230, 400);
    }
    
    if (warper) {
        ship.fuelTotal -= 0.05;
        if (ship.fuelTotal < 0) {
            ship.fuelTotal = 0;
        }
    
        ctx.beginPath();
        //ctx.arc(warper.x, warper.y, 3, 0, 360);
        ctx.arc(c.width/20*warper.x, c.height/20*warper.y, c.width/20*0.1, 0, 360);
        
        ctx.strokeStyle = warper.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
        ctx.lineWidth = 1;
        
        if (distanceWarper(warper) < c.width/20*0.005) {
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
    ctx.fillRect(c.width/20*2, c.height/20*2, c.width/20*16, c.height/20*16);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(c.width/20*2, c.height/20*2, c.width/20*16, c.height/20*16);
    ctx.font = scaleFont(0.025, "Hyperspace");
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("TRADING POST :", c.width/20*3, c.height/20*3);
    if (station.buySell == 0) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(c.width/20*9.8, c.height/20*2.2, c.width/20*1.5, c.height/20*1);
        ctx.fillStyle = '#000000';
        ctx.fillText("SELL", c.width/20*10, c.height/20*3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("BUY", c.width/20*14, c.height/20*3);
    } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(c.width/20*13.65, c.height/20*2.2, c.width/20*1.5, c.height/20*1);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("SELL", c.width/20*10, c.height/20*3);
        ctx.fillStyle = '#000000';
        ctx.fillText("BUY", c.width/20*14, c.height/20*3);
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("PRICE", c.width/20*10, c.height/20*5.5);
    ctx.fillText("OWNED", c.width/20*14, c.height/20*5.5);

    for (let i = 0; i<resourceNames.length; i++) {
        if (mapLocations[constellation][curMapLoc].menuNum == i) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(c.width/20*3.8, c.height/20*6.15+(c.height/20*1.2*i), c.width/20*3.2, c.height/20*1);
            ctx.fillStyle = '#000000'
        } else {
            ctx.fillStyle = '#FFFFFF';
        }
        ctx.fillText(resourceNames[i], c.width/20*4, c.height/20*7+(c.height/20*1.2*i));

        // price
        if (station.buySell == 0) {
            // sell
            ctx.fillStyle = '#FF0000';
            ctx.fillText(Math.floor(station.priceList[i]*0.85), c.width/20*10.5, c.height/20*7+(c.height/20*1.2*i));
        } else {
            // buy
            ctx.fillStyle = '#00FF00';
            ctx.fillText(station.priceList[i], c.width/20*10.5, c.height/20*7+(c.height/20*1.2*i));
        }

        // owned
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(ship.storage[i], c.width/20*14.5, c.height/20*7+(c.height/20*1.2*i));

        ctx.fillStyle = '#888888';
        //ctx.font = scaleFont(0.018, "Hyperspace");
        ctx.fillText("ARROW KEYS SELECT - SPACE TO TRADE", c.width/20*5, c.height/20*17.5);
        ctx.fillText("PRESS M TO EXIT", c.width/20*7.8, c.height/20*19.5);

    }
}

function drawFuelDepot() {
    clearCanvas();
    drawBG();
    drawGauges();
    let depot = mapLocations[constellation][curMapLoc];
    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.font = scaleFont(0.025, "Hyperspace");
    ctx.fillRect(c.width/20*2, c.height/20*2, c.width/20*16, c.height/20*16);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(c.width/20*2, c.height/20*2, c.width/20*16, c.height/20*16);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = scaleFont(0.04, "Hyperspace");
    ctx.fillText("FUEL DEPOT", c.width/20*3, c.height/20*3.5);
    ctx.fillText("FUEL PRICE: $" + depot.fuelPrice, c.width/20*6.5, c.height/20*7);
    ctx.fillText("TANK: " + ship.fuelTotal.toFixed(0) + " OF " + ship.maxFuel, c.width/20*6.5, c.height/20*9);
    ctx.fillStyle = '#888888';
    ctx.fillText("PRESS SPACE TO PURCHASE", c.width/20*4.5, c.height/20*16);
    ctx.fillText("PRESS M TO EXIT", c.width/20*7, c.height/20*19.5);

    // big fuel gauge
    let x = c.width/20*4;
    let y = c.height/20*12; 
    ctx.fillStyle = "#888888";
    ctx.fillRect(c.width/20*5, c.height/20*10, ((c.width/20)*10/ship.maxFuel)*ship.fuelTotal, c.height/20*2.5);

    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.rect(c.width/20*5, c.height/20*10, c.width/20*10, c.height/20*2.5);
    ctx.stroke();

    ctx.font = scaleFont(0.06, "Hyperspace");
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("Fuel", c.width/20*9, c.height/20*12);
}

function drawUpgrade() {
    clearCanvas();
    drawBG();
    drawGauges();
    let depot = mapLocations[constellation][curMapLoc];
    ctx.font = scaleFont(0.025, "Hyperspace");
    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect(c.width/20*2, c.height/20*2, c.width/20*16, c.height/20*16);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(c.width/20*2, c.height/20*2, c.width/20*16, c.height/20*16);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("SHIP UPGRADES", c.width/20*3, c.height/20*3);
    ctx.fillText("LEVEL", c.width/20*10, c.height/20*5.5);
    ctx.fillText("COST", c.width/20*14, c.height/20*5.5);
    ctx.fillStyle = '#888888';
    ctx.fillText("ARROW KEYS SELECT - SPACE TO BUY", c.width/20*5, c.height/20*17.5);
    ctx.fillText("PRESS M TO EXIT", c.width/20*7.8, c.height/20*19.5);

    // list upgrades

    for (let i = 0; i<depot.locationUpgrades.length; i++) {
        if (mapLocations[constellation][curMapLoc].menuNum == i) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(c.width/20*3.3, c.height/20*6.15+(c.height/20*1.2*i), c.width/20*6, c.height/20*1);
            ctx.fillStyle = '#000000'
        } else {
            ctx.fillStyle = '#FFFFFF';
        }
        // upgrade name
        ctx.fillText(possibleUpgrades[depot.locationUpgrades[i]], c.width/20*3.5, c.height/20*7+(c.height/20*1.2*i));
        // curr upgrade level
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(ship.upgrades[depot.locationUpgrades[i]], c.width/20*10.5, c.height/20*7+(c.height/20*1.2*i));
        // upgrade price 
        ctx.fillText(ship.upgrades[depot.locationUpgrades[i]] * 100+200, c.width/20*14.5, c.height/20*7+(c.height/20*1.2*i));
    }
}

function archColor(l) {
    ctx.lineWidth = 1;
    if (l.visited) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
    } else {
        ctx.strokeStyle = "#646363";
    }
    if (l.name == "QUANTIUM JUMP STATION") {
        if (l.visited) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#fc0303"//l.color;
        }
    }
    if (l.name == "TRADING POST") {
        if (l.visited) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#e7fb04"//l.color;
        }
    }
    if (l.name == "UPGRADE SHOP") {
        if (l.visited) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#0088ff"//l.color;
        }
    }
    if (l.name == "FUEL DEPOT") {
        if (l.visited) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#efa505"//l.color;
        }
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
        ctx.fillText("CURR. CONSTILATION", c.width/20*1.5, c.height/10*2);
        ctx.fillStyle = '#ff0000';
        ctx.fillText(constellationNames[constellation], c.width/20*2.5, c.height/10*3);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("JUMP TO SYSTEM", c.width/20*1.5, c.height/10*4)

        let loc = mapLocations[constellation][curMapLoc];
        // draw ring
        for (let i = 0; i < constellationNames.length; i++) {
            if (i == constellation) {
                ctx.strokeStyle = '#ff0000';
                ctx.fillStyle = '#ff0000';
                ctx.lineWidth = 6;
            } else {
                if (loc.warpDestinations[loc.menuNum] == i) {
                    ctx.strokeStyle = '#15e731';
                    ctx.fillStyle = '#15e731';
                    ctx.lineWidth = 3;
                } else {
                    ctx.strokeStyle = '#2d1dd8';
                    ctx.fillStyle = '#808180';
                    ctx.lineWidth = 1;
                }
            }
            ctx.font = "18px Hyperspace";
            let off = 14.5;
            if (i % 2 == 0) {
                off = 17;
            }
            ctx.fillText(constellationNames[i], c.width/15*i + (c.width/10), c.height/20*off);
            ctx.font = "30px Hyperspace";
            ctx.strokeRect(c.width/15*i + (c.width/10), c.height/20*15, (c.width/40)*1, (c.height/20)*1);
            ctx.lineWidth = 1;
        }
        
        // draw dest locations
        ctx.strokeStyle = "#ffffff";
        // map boarder
        ctx.strokeRect(
            (c.width/20*1)/2.5 + (c.width/1.8),
            (c.height/20*2.5)/2.5 + (c.height/8),
            (c.width/20*18)/2.5,
            (c.height/20*12.5)/2.5
        );
        mapLocations[loc.warpDestinations[loc.menuNum]].forEach(l => {
            let ind = mapLocations[constellation].indexOf(l);
            ctx.beginPath();
            ctx.arc(
                ((c.width/20*l.x)/2.5) + (c.width/1.8), 
                (c.height/20*l.y)/2.5 + (c.height/8), 
                c.width/30*0.1, 
                0, 360);
            /*if (l.visited) {
                ctx.strokeStyle = "#ffffff";
            } else {
                ctx.strokeStyle = "#646363";
            }*/
            archColor(l);
            ctx.lineWidth = 1;
            ctx.fillStyle = "#646363"//l.color;
            if (l.visited) {
                ctx.lineWidth = 2;
                ctx.fillStyle = "#f8faf8"
            }
            ctx.stroke();
            ctx.closePath();

            ctx.font = scaleFont(0.008, "Hyperspace");
            ctx.fillText(l.name, (c.width/20*l.x)/2.5 + (c.width/1.8), (c.height/20*l.y+(c.height/20*1))/2.5 + (c.height/8));
            ctx.font = scaleFont(0.014, "Hyperspace");

            // draw known resource prices
            if (l.name == "TRADING POST" && l.visited) {
                ctx.fillStyle = '#e5ff00';
                ctx.fillText(`${constellationNames[loc.warpDestinations[loc.menuNum]]} Prices`, c.width/20*7, c.height/20*4+(c.height/20));
                ctx.fillStyle = '#FFFFFF';
                for (let i = 0; i < resourceNames.length; i++) {
                    ctx.fillText(resourceNames[i], c.width/20*7, c.height/20*6+(c.height/20*0.8*i));

                    // sell price
                    ctx.fillStyle = '#FF0000';
                    ctx.fillText(Math.floor(l.priceList[i]*0.85), c.width/20*8.75, c.height/20*6+(c.height/20*0.8*i));
                    // buy price
                    ctx.fillStyle = '#00FF00';
                    ctx.fillText(l.priceList[i], c.width/20*9.25, c.height/20*6+(c.height/20*0.8*i));

                    // owned
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText(ship.storage[i], c.width/20*10, c.height/20*6+(c.height/20*0.8*i));
                }
            }

            // draw know upgrades
            if (l.name == "UPGRADE SHOP" && l.visited) {
                ctx.fillStyle = "#0088ff";
                ctx.fillText(`${constellationNames[loc.warpDestinations[loc.menuNum]]} Upgrades`, c.width/20*12, c.height/20*10);
                ctx.fillStyle = '#FFFFFF';
                for (let i = 0; i< l.locationUpgrades.length; i++) {
                    // upgrade name
                    ctx.fillText(possibleUpgrades[l.locationUpgrades[i]], c.width/20*12, c.height/20*11+(c.height/20*0.8*i));
                    // curr upgrade level
                    ctx.fillText(ship.upgrades[l.locationUpgrades[i]], c.width/20*16, c.height/20*11+(c.height/20*0.8*i));
                    // upgrade price 
                    ctx.fillText(ship.upgrades[l.locationUpgrades[i]] * 100+200, c.width/20*17, c.height/20*11+(c.height/20*0.8*i));
                }
            }

            ctx.font = scaleFont(0.018, "Hyperspace");
    
        });
        ctx.strokeStyle = "#ffffff";

        for (let i = 0; i < loc.warpDestinations.length; i++) {
            if (loc.menuNum == i) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect((c.width/20)*2.5, (c.height/10)*5+(i*40)-25, 180, 30);
                ctx.fillStyle = '#000000'
            } else {
                ctx.fillStyle = '#FFFFFF';
            }
            ctx.fillText(constellationNames[loc.warpDestinations[i]], (c.width/20)*2.9, (c.height/10)*5+(i*40));
        }
    } else {
        jumpTimer --;
        if (jumpTimer% 10) {
            ship.fuelTotal -= 0.1;
            if (ship.fuelTotal <= 0) {
                // TODO Fix this 
                lives --; //= 0;
            }
        }
        if (jumpTimer < 1) {
            warping = false;
            mapLocations[constellation][curMapSel].visited = true;
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
    if (ship.fuelTotal < 0) {
        stage = 2;
    }
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
        if (showHitbox && debug) {
            drawHitbox(roid);
        }
    });
}

function drawMobiles() {
    enemies.forEach(e => {
        moveEntity(e);
        e.bulletTimer --;
        if (e.bulletTimer <= 0) {
            e.bulletTimer = getRandomInt(250) + 50;
            if (!ship.dead) {
                //console.log("e ",e, angle(e.x,e.y,ship.x+ship.hbOffset1,ship.y+ship.hbOffset1), e.x + 40, e.y + 40, 5, false)
                bullets.push(new Bullet(e, angle(e.x,e.y,ship.x+ship.hbOffset1,ship.y+ship.hbOffset1), e.x + 40, e.y + 40, 5, false));
                //console.log(bullets[bullets.length-1])
            }
        }
        if (getRandomInt(20) == 1) {
            e.rot += getRandomInt(30) - 15
        }
        actx.clearRect(-40,-40,80,80);
        actx.rotate(e.spin * Math.PI / 180);
        actx.strokeStyle = e.color;
        actx.stroke(e.path);
        //console.log(e, e.x,e.y)
        if (isNaN(e.x)) {
            e.x = 100;
            e.y = 100;
        }
        ctx.drawImage(a, 0,0,80,80, e.x, e.y,80,80);
        actx.rotate(-e.spin * Math.PI / 180);
        if (showHitbox && debug) {
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