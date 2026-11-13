// *************
// draw function
// *************

function draw() {
    ctx.lineWidth = defaultLineWidth;
    sctx.lineWidth = defaultLineWidth;
    actx.lineWidth = defaultLineWidth;
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
        case 8:
            drawJoyConfig();
            break;
        default:
    }
    
    if (debug) {
        ctx.font = scaleFont(0.015, "Hyperspace");
        if (stage == 1) {
            ctx.fillText('debugging 1 - 1up, 2 - nuke, 3 - hbox, 4 - +FUEL, 7 - B.Spd, 8 - B.Dmg, 9 - $1K', 10, c.height - 10);
        } else {
            ctx.fillText('debugging', 10, c.height - 10);
        }
    
    }
    /*/ center guide lines
    ctx.strokeStyle = "#00FF00";
    ctx.beginPath();
    ctx.rect(0, c.height/2, c.width, 1);
    ctx.rect(c.width/2, 0, 1, c.height);
    ctx.stroke();
    */
}

function drawStringFX(ctx, text, x, y, spacing) {
    for (let i = 0; i < text.length; i++) {
        let r = Math.abs(i - titleI);
        ctx.fillStyle = `rgb(${255-(255/(r/5))},${255-(255/(r/5))},${255-(255/(r/5))})`;
        //console.log(ctx.fontSize)
        ctx.fillText(text[i], x+(spacing*i), y);//- ((255/(r/5))/10));
    }
    titleI = titleI + 0.2;
    if (titleI > text.length + 50) {
        titleI = -50
    }
}


function drawTitle() {
    clearCanvas();
    drawBG();
    drawAsteroids();

    ctx.font = scaleFont(0.1, "Hyperspace");
    ctx.fillStyle = '#FFFFFF';
    drawStringFX(ctx, "ASTEROIDS 2025", c.width/20*1.5, c.height/20*6, c.width * 0.06);

    let ox = 0, oy = 10;
    ctx.font = scaleFont(0.025, "Hyperspace");
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("STARTING UPGRADE LEVELS:", (c.width/20*(10*ox)+(c.width/20*2.1)), c.height/20*8.5);
    for (let i = 0; i < ship.upgrades.length; i ++) {
        // skip sheild
        if (possibleUpgrades[i] == "SHIELD") {
            continue;
        }
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

    // Paint UPGRADE locations
    let loc = mapLocations[constellation][curMapLoc];
    if (loc.hasPaint) {
        if (loc.paintDelay > 0) {
            loc.paintDelay --;
        }
        if (loc.paintDelay == 0) {
            loc.paintDelay = 30;
        }
        if (
            ship.x + 20 > loc.paintX - 10 &&
            ship.x + 20 < loc.paintX + 50 &&
            ship.y + 20 > loc.paintY - 10 &&
            ship.y + 20 < loc.paintY + 40
        ) {
            if (ship.velX > 0.35) {
                ship.velX = 0.35;
            }
            if (ship.velY > 0.35) {
                ship.velY = 0.35;
            }
            if (ship.velX < -0.35) {
                ship.velX = -0.35;
            }
            if (ship.velY < -0.35) {
                ship.velY = -0.35;
            }
        
            if (loc.paintCost > 0) {
                loc.paintCost --;
            }
            
        }
        
        // complete paint
        if (loc.paintCost <= 0) {
            loc.hasPaint = false;
            ship.bulletColor = ship.color;
            ship.color = loc.paintColor;
            setAudioSource(7);
            let r = getRandomInt(ship.upgrades.length);
            ship.upgrades[r] ++;
            doUpgrade(r, ship.upgrades[r]);
            speak(`Paint job Completed.`);
            if (getRandomInt(3) == 1) {
                ship.shield = true;
            }
        }
        //console.log(loc)
        ctx.strokeStyle = loc.paintColor
        ctx.lineWidth = defaultLineWidth + 3;
        ctx.strokeRect(loc.paintX-10, loc.paintY-10, 50, 40);
        ctx.font = scaleFont(0.013, "Hyperspace"); //"12px Hyperspace";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(`Paint JOB`, loc.paintX-30,loc.paintY-20);
        ctx.fillText(loc.paintCost, loc.paintX,loc.paintY+50);
        ctx.lineWidth = defaultLineWidth;
        
    }

    drawAsteroids();
    drawMobiles();


    
    // draw ship
    if (!ship.dead && lives > 0) {
        sctx.strokeStyle = ship.color;
        sctx.clearRect(-20,-20,40,40);
        sctx.stroke(ship.path);
        if (up && ship.fuelTotal > 0) {
            sctx.strokeStyle = "#f50d0d";
            sctx.stroke(ship.thrustPath);
        }
        // draw lazer nub on top ship
        if (ship.lzrEquip) {
            sctx.beginPath();
            sctx.arc(0, 0, 3, 0, 2 * Math.PI);
            sctx.strokeStyle = "#FFFFFF";
            sctx.stroke();
            sctx.closePath();
        }
            
        ctx.drawImage(s, 0,0,40,40, ship.x, ship.y,40,40);
        if (showHitbox && debug) {
            drawHitbox(ship);
        }
        if (ship.shield) {
            ctx.lineWidth = defaultLineWidth;
            ctx.strokeStyle = "#0d40f5"
            ctx.beginPath();
            ctx.arc(ship.x+20, ship.y+20, ship.shieldRad, 0, 2 * Math.PI);
            ship.shieldRad += 0.8;
            if (ship.shieldRad > 24) {
                ship.shieldRad = 18;
            }
            ctx.stroke();
            ctx.closePath();
        }
    } else {
        // Ship is currently dead or game over
        if (ship.deadCounter == 1) {
            lives --; 
            if (lives > 0) {
                ship.x = c.width/2;
                ship.y = c.height/2;
                ship.dead = false;
                if (ship.fuelTotal > 50) {
                    ship.fuelTotal = 50;
                }
            } else {
                // move ship offscreen
                ship.x = c.width*2;
                ship.y = c.height*2;
            }
        }
        if (ship.deadCounter > 0) {
            ship.deadCounter --;
        }
    }

    // game over if ship drifting in the void without gas
    if (!ship.fuelRelatedDeath && ship.fuelTotal <= 0) {
        ship.fuelRelatedDeath = true;
        // drift for a bit longer for dramatic effect
        lives = 1;
        ship.gameOverCounter = 600;
        speak("OUT OF FUEL - GAME OVER");
    } else if (ship.fuelRelatedDeath && ship.fuelTotal <= 0 && !ship.dead) {
        ctx.font = scaleFont(0.05, "Hyperspace");
        ctx.fillStyle = '#FFFFFF';
        drawStringFX(ctx, "OUT OF FUEL - GAME OVER",c.width/20*3.5, c.width/20*6, c.width/20 * 0.6);
        if (ship.gameOverCounter > 0) {
            //drawStringFX(ctx, `  ${ship.gameOverCounter}`,c.width/20*7, c.width/20*8, c.width/20 * 0.7);
            ship.gameOverCounter --;
        } else {
            drawStringFX(ctx, `PRESS KEY TO RESTART`,c.width/20*3.5, c.width/20*8, c.width/20 * 0.7);
        }
    }
    
    // draw bullets
    bullets.forEach(b => {
        ctx.beginPath();
        //console.log(b, b.x, b.y)
        ctx.arc(b.x, b.y, 2+(b.damage/4), 0, 2 * Math.PI);  
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
        ctx.strokeStyle = d.color;
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
        ctx.font = scaleFont(0.06, "Hyperspace");
        ctx.fillStyle = '#FFFFFF';
        drawStringFX(ctx, "GAME OVER",c.width/20*7, c.width/20*6, c.width/20 * 0.7);
        if (ship.gameOverCounter == 200) {
            speak("GAME OVER");
            ship.gameOverCounter --;
        } else if (ship.gameOverCounter > 0) {
            //drawStringFX(ctx, `  ${ship.gameOverCounter}`,c.width/20*7, c.width/20*8, c.width/20 * 0.7);
            ship.gameOverCounter --;
        } else {
            drawStringFX(ctx, `PRESS KEY TO RESTART`,c.width/20*3.5, c.width/20*8, c.width/20 * 0.7);
        }
    }

    if (!ship.dead) {
        if ((mapReminder || ship.storageTotal == ship.maxStorage) && !ship.fuelRelatedDeath) {
            ctx.font = scaleFont(0.03, "Hyperspace");
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText("PRESS 'M' FOR SPACE MAP", c.width/20*6, c.height/20*18);
        }
        if (ship.storageWarnCoolDown > 0) {
            ship.storageWarnCoolDown --;
        }
        if (
            ship.storageTotal == ship.maxStorage &&
            ship.storageWarnCoolDown == 0 && 
            msgTimer == 0 && 
            bgmTimer == 0 &&
            ship.storageWarning
        ) {
            speak("Storage is full");
            msgTimer = 400;
            msgTimerMsg = "Storage is full";
            ship.storageWarnCoolDown = 800;
        }
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
        ctx.arc(c.width/20*l.x, c.height/20*l.y, c.width/20*0.1, 0, 2 * Math.PI);
        ctx.strokeStyle = l.color;
        archColor(l);
        ctx.stroke();
        ctx.closePath();

        ctx.font = scaleFont(0.013, "Hyperspace");
        if (l.visited) {
            ctx.fillStyle = l.color;
        } else {
            ctx.fillStyle = "#999999";
        }
        ctx.fillText(l.name, c.width/20*l.x, c.height/20*l.y+(c.height/20*0.6));

        // mission markers
        ctx.font = scaleFont(0.012, "Hyperspace");
        for (let i = 0; i < missions.length; i++) {
            //console.log(missions[i].constellation, constellation,missions[i].sector, l.sectorNum)
            //console.log(missions[i].constellation,l.constNumber )
            if (
                missions[i].constellation == l.constNumber &&
                missions[i].sector == l.sectorNum
            ) {
                ship.curMission = i;
                //console.log(missions[i].constellation, constellation,missions[i].sector, l.sectorNum)
                if (missions[i].type == 'kill') {
                    ctx.fillStyle = ship.killColor;
                } else if (missions[i].type == 'sos') {
                    ctx.fillStyle = ship.sosColor;
                } else if (missions[i].type == 'life') {
                    ctx.fillStyle = ship.lifeColor;
                } else if (missions[i].type == 'lzr') {
                    ctx.fillStyle = ship.lzrColor;
                }
                ctx.fillText("M", c.width/20*l.x-(c.width/20*0.3), c.height/20*l.y + (c.height/20*0.1));
            }
        }
        ctx.font = scaleFont(0.018, "Hyperspace");

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
                    if (l.isHostile) {
                        ctx.fillStyle = "#FF0000";
                    } else {
                        ctx.fillStyle = "#00FF00";
                    }
                    ctx.fillText(l.isHostile, c.width/20*6, c.height/20*19);
                    ctx.fillStyle = '#FFFFFF';
                } else {
                    ctx.fillText("???", c.width/20*6, c.height/20*19);
                }
                ctx.fillText("RESOURCES: ", c.width/20*11, c.height/20*16)
            } else if (l.type == 'trade') {
                // draw known resource prices
                if (l.visited) {
                    let loc = mapLocations[constellation][curMapLoc];
                    ctx.fillStyle = '#FFFFFF';
                    for (let i = 0; i < resourceNames.length; i++) {
                        let o = (i > 3) ? 4.5 : 0;
                        ctx.fillStyle = resourceColor[i]
                        ctx.fillText(resourceNames[i], c.width/20*(10.5+o), c.height/20*16+(c.height/20*0.8*(i%4)));

                        // sell price
                        ctx.fillStyle = '#FF0000';
                        ctx.fillText(Math.floor(l.priceList[i]*0.85), c.width/20*(12.75+o), c.height/20*16+(c.height/20*0.8*(i%4)));
                        // buy price
                        ctx.fillStyle = '#00FF00';
                        ctx.fillText(l.priceList[i], c.width/20*(13.25+o), c.height/20*16+(c.height/20*0.8*(i%4)));

                        // owned
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillText(ship.storage[i], c.width/20*(14+o), c.height/20*16+(c.height/20*0.8*(i%4)));
                    }
                } else {
                    ctx.fillText("RESOURCES: ", c.width/20*11, c.height/20*16);
                }
            } else if (l.type == 'warp') {
                ctx.fillText("AVAIL.DEST.:", c.width/20*11, c.height/20*16);
            } else if (l.type == 'upgrade') {
                ctx.fillText("UPGRADES: ", c.width/20*11, c.height/20*16)
            } else if (l.type == 'fuel') {
                ctx.fillText("FUEL PRICE: ", c.width/20*11, c.height/20*16)
            }
            let r;
            if (l.visited) {
                if (l.type == 'sector') {
                    for (let i = 0; i < l.resources.length; i++) {
                        ctx.fillStyle = resourceColor[l.resources[i]];
                        ctx.fillText(resourceNames[l.resources[i]], c.width/20*13.5, c.height/20*16+(c.height/20*i));
                    }
                } else if (l.type == 'upgrade') {
                    for (let i = 0; i < l.locationUpgrades.length; i++) {
                        ctx.fillText(possibleUpgrades[l.locationUpgrades[i]], c.width/20*13, c.height/20*16+(c.height/20*i));
                        // curr upgrade level
                        ctx.fillText(ship.upgrades[l.locationUpgrades[i]], c.width/20*17.5, c.height/20*16+(c.height/20*i));
                        // upgrade price
                        let depot = mapLocations[constellation][2];
                        let lev = ship.upgrades[depot.locationUpgrades[i]];
                        ctx.fillText((lev * lev * 100)+200, c.width/20*18.25, c.height/20*16+(c.height/20*i));
                    }
                } else if (l.type == 'fuel') {
                    ctx.fillText("FUEL PRICE: " + l.fuelPrice, c.width/20*11, c.height/20*16);
                } else if (l.type == 'warp') {
                    ctx.fillText(constellationNames[l.warpDestinations[0]], c.width/20*14, c.height/20*16);
                    ctx.fillText(constellationNames[l.warpDestinations[1]], c.width/20*14, c.height/20*17);
                }
            } else {
                ctx.fillText("???", c.width/20*13.5, c.height/20*16);
            };

            // selection rect
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = defaultLineWidth + 2;
            ctx.strokeRect((c.width/20*l.x)-(c.width/20*0.2), (c.height/20*l.y)-(c.height/20*0.3), (c.width/20*0.4),  (c.height/20*0.6));
            ctx.lineWidth = defaultLineWidth;
        }
        if (curMapLoc == ind) {
            // you are here marker
            ctx.font = scaleFont(0.013, "Hyperspace");
            ctx.fillStyle = '#00FFFF';
            ctx.fillText("You are here", (c.width/20*l.x)-(c.width/20*1), (c.height/20*l.y)-(c.height/20*0.5));
            ctx.font = scaleFont(0.018, "Hyperspace");
        }
    });

    // alt map control scheme visual info
    if (ship.mapDirHints) {
        const col = ['#cfdd09','#dd2c09','#09badd','#dd09b6'];
        let b = mapLocations[constellation][curMapSel];
        const q = [135, 225, 315, 45];

        // show dir angles
        if (ship.mapDirAdjustTimer > 0) {
            ship.mapDirAdjustTimer --;
        }
        if (ship.mapDirAdjustTimer) {
            ctx.save();

            const cl = new Path2D();
            cl.rect(c.width/20*1, c.height/20*2.5, c.width/20*18, c.height/20*12.5);
            ctx.clip(cl);

            // dash out effect
            let k1 = 100;
            let k2;
            if (ship.mapDirAdjustTimer < 100) {
                k1 = ship.mapDirAdjustTimer;
                k2 = 100 - k1;
            }
            ctx.setLineDash([k1,k2]);

            // Do: Left,Up,Right,Down
            for (let i = 0; i < 4; i++) {
                ctx.strokeStyle = col[i];

                // start angle
                let s = calculateNewPoint(b.x, b.y, q[i] - ship.mapDirOff, 9999); 
                let path = new Path2D();
                path.moveTo(c.width/20*s.x, c.height/20*s.y);
                path.lineTo(c.width/20*b.x, c.height/20*b.y);

                // finish angle
                let t = (i == 3) ? q[0] : q[i+1];
                let f = calculateNewPoint(b.x, b.y, t + ship.mapDirOff, 9999); 
                path.moveTo(c.width/20*f.x, c.height/20*f.y);
                path.lineTo(c.width/20*b.x, c.height/20*b.y);

                ctx.stroke(path);
            }
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Draw dashed direction destion display
        const dr = ["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"];
        const xO = [-5, 0, 5, 0];
        const yO = [0, -5, 0, 5];
        ctx.font = scaleFont(0.007, "Hyperspace");
        ctx.fillStyle = '#fbfbfb';
        ctx.lineDashOffset += 0.2;
    
        for (let i = 0; i < 4; i++) {
            let t = (i == 3) ? q[0] : q[i+1];
            let l = getNearestLoc({key: dr[i]});
            if (l != -1) {
                ctx.fillStyle = col[i];
                ctx.strokeStyle = col[i];
                ctx.setLineDash([10,30]);
                let e = mapLocations[constellation][l];
                let path = new Path2D();
                path.moveTo((c.width/20*e.x)+xO[i], (c.height/20*e.y)+yO[i]);
                path.lineTo(c.width/20*b.x, c.height/20*b.y);
                ctx.stroke(path);
            }  
        }
        ctx.setLineDash([]);
    }

    if (ship.fuelTotal > 0) {
        moveEntity(warper);
    } else {
        ctx.font = scaleFont(0.05, "Hyperspace");
        ctx.fillStyle = '#FFFFFF';
        drawStringFX(ctx, "OUT OF FUEL - GAME OVER",c.width/20*3, c.width/20*6, c.width/20 * 0.6);
        if (ship.gameOverCounter > 0) {
            ship.gameOverCounter --;
        } else {
            drawStringFX(ctx, `PRESS KEY TO RESTART`,c.width/20*3.5, c.width/20*8, c.width/20 * 0.7);
        }
    }
    
    if (warper) {
        ship.fuelCon = ship.storageTotal/400;
        ship.fuelTotal -= ship.fuelCon;
        ship.fuelStat += ship.fuelCon;
        if (ship.fuelTotal < 0) {
            ship.fuelTotal = 0;
        }
    
        ctx.beginPath();
        //ctx.arc(warper.x, warper.y, 3, 0, 2 * Math.PI);
        ctx.arc(c.width/20*warper.x, c.height/20*warper.y, c.width/20*0.1, 0, 2 * Math.PI);
        
        ctx.strokeStyle = warper.color;
        ctx.lineWidth = defaultLineWidth + 2;
        ctx.stroke();
        ctx.closePath();
        ctx.lineWidth = defaultLineWidth;
        
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
            ctx.fillStyle = resourceColor[i];
            ctx.fillRect(c.width/20*3.8, c.height/20*6.15+(c.height/20*1.2*i), c.width/20*3.2, c.height/20*1);
            ctx.fillStyle = '#000000';
            ctx.fillText(resourceNames[i], c.width/20*4, c.height/20*7+(c.height/20*1.2*i));
        } else {
            ctx.fillStyle = resourceColor[i];
            ctx.fillText(resourceNames[i], c.width/20*4, c.height/20*7+(c.height/20*1.2*i));
        }

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
        
        ctx.fillStyle = '#FFFFFF';
        if (possibleUpgrades[depot.locationUpgrades[i]] == "SHIELD") {
            if (ship.shield) {
                ctx.fillStyle = '#f90202';
                ctx.fillText("MAX", c.width/20*10.5, c.height/20*7+(c.height/20*1.2*i));
            } else {
                ctx.fillText("AVAIL.", c.width/20*10.5, c.height/20*7+(c.height/20*1.2*i));
            }
        } else if (possibleUpgrades[depot.locationUpgrades[i]] == "LZR UPGRADE") {
            if (ship.lzrEquip) {
                ctx.fillText(ship.lzrLvl, c.width/20*10.5, c.height/20*7+(c.height/20*1.2*i));
            } else {
                ctx.fillStyle = '#f90202';
                ctx.fillText("UNAVAIL.", c.width/20*10.5, c.height/20*7+(c.height/20*1.2*i));
            }
        } else {
            // curr upgrade level
            ctx.fillText(ship.upgrades[depot.locationUpgrades[i]], c.width/20*10.5, c.height/20*7+(c.height/20*1.2*i));
        }
        // upgrade price 
        if (possibleUpgrades[depot.locationUpgrades[i]] == "LZR UPGRADE") {
            ctx.fillText((3000*ship.lzrLvl)+200, c.width/20*14.5, c.height/20*7+(c.height/20*1.2*i));
        } else {
            let lev = ship.upgrades[depot.locationUpgrades[i]];
            ctx.fillText((lev * lev * 100)+200, c.width/20*14.5, c.height/20*7+(c.height/20*1.2*i));
        }
    }
}

function archColor(l) {
    ctx.lineWidth = defaultLineWidth;
    if (l.visited) {
        ctx.lineWidth = defaultLineWidth + 2;
        ctx.strokeStyle = "#ffffff";
    } else {
        ctx.strokeStyle = "#646363";
    }
    if (l.name == "QUANTIUM JUMP STATION") {
        if (l.visited) {
            ctx.lineWidth = defaultLineWidth + 2;
            ctx.strokeStyle = "#fc0303"//l.color;
        }
    }
    if (l.name == "TRADING POST") {
        if (l.visited) {
            ctx.lineWidth = defaultLineWidth + 2;
            ctx.strokeStyle = "#e7fb04"//l.color;
        }
    }
    if (l.name == "UPGRADE SHOP") {
        if (l.visited) {
            ctx.lineWidth = defaultLineWidth + 2;
            ctx.strokeStyle = "#0088ff"//l.color;
        }
    }
    if (l.name == "FUEL DEPOT") {
        if (l.visited) {
            ctx.lineWidth = defaultLineWidth + 2;
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
        ctx.fillText("JUMP TO SYSTEM", c.width/20*1.5, c.height/10*4);
        ctx.fillText("'M' TO EXIT", c.width/20*1.5, c.height/10*6.5);

        let loc = mapLocations[constellation][curMapLoc];
        // draw ring
        for (let i = 0; i < constellationNames.length; i++) {
            if (i == constellation) {
                ctx.strokeStyle = '#ff0000';
                ctx.fillStyle = '#ff0000';
                ctx.lineWidth = defaultLineWidth + 5;
            } else {
                if (loc.warpDestinations[loc.menuNum] == i) {
                    ctx.strokeStyle = '#15e731';
                    ctx.fillStyle = '#15e731';
                    ctx.lineWidth = defaultLineWidth + 2;
                } else {
                    ctx.strokeStyle = '#2d1dd8';
                    ctx.fillStyle = '#808180';
                    ctx.lineWidth = defaultLineWidth;
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
            ctx.lineWidth = defaultLineWidth;
            ctx.font = scaleFont(0.015, "Hyperspace");
            
            // offset multipule missions markers in same constillation
            let oa = [];
            for (let j = 0; j < constellationNames.length; j++) {
                oa.push(0);
            }
            for (let j = 0; j < missions.length; j++) {
                if (missions[j].constellation == i) {
                    if (missions[j].type == 'kill') {
                        ctx.fillStyle = ship.killColor;
                    } else if (missions[j].type == 'sos') {
                        ctx.fillStyle = ship.sosColor;
                    } else if (missions[j].type == 'life') {
                        ctx.fillStyle = ship.lifeColor;
                    } else if (missions[j].type == 'lzr') {
                        ctx.fillStyle = ship.lzrColor;
                    }
                    ctx.fillText("M", c.width/15*i + (c.width/10) + (c.width/160) + (4*oa[missions[j].constellation]), c.height/20*15 + (c.height/30));
                    oa[missions[j].constellation] ++;
                }
            }
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
                0,
                2 * Math.PI
            );
            /*if (l.visited) {
                ctx.strokeStyle = "#ffffff";
            } else {
                ctx.strokeStyle = "#646363";
            }*/
            archColor(l);
            ctx.lineWidth = defaultLineWidth;
            ctx.fillStyle = "#646363"//l.color;
            if (l.visited) {
                ctx.lineWidth = defaultLineWidth + 1;
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
                    ctx.fillStyle = resourceColor[i];
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

            // draw known upgrades
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
                    let depot = mapLocations[constellation][2];
                    
                    let lev = ship.upgrades[depot.locationUpgrades[i]];
                    //console.log(depot.locationUpgrades)
                    ctx.fillText((lev * lev * 100)+200, c.width/20*17, c.height/20*11+(c.height/20*0.8*i));
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
        if (jumpTimer % 10 == 0) {
            ship.fuelCon = ship.storageTotal/80;
            ship.fuelTotal -= ship.fuelCon;//-= 0.1;
            ship.fuelStat += ship.fuelCon;
            if (ship.fuelTotal <= 0) {
                stage = 2;
            }
        }
        if (jumpTimer < 1) {
            warping = false;
            mapLocations[constellation][curMapSel].visited = true;
            stage = 2;
        }
    }
}

function drawJoyConfig() {
    drawStarField();
    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.font = scaleFont(0.025, "Hyperspace");
    ctx.fillRect(c.width/20*2, c.height/20*2, c.width/20*16, c.height/20*16);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(c.width/20*2, c.height/20*2, c.width/20*16, c.height/20*16);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = scaleFont(0.04, "Hyperspace");
    ctx.fillText("CONTROLER CONFIG", c.width/20*5, c.height/20*3.5);
    ctx.fillText(`PRESS ${configButtonNames[configInc]}`, c.width/20*6, c.height/20*10);
}

function drawStarField() {
    clearCanvas();
    //drawBG();
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
    if (ship.drawBackgrounds) {
        let loc = mapLocations[constellation][curMapLoc];
        for (let i = 0; i < loc.bg.length - 1; i ++) {
            let r = 2;
            ctx.beginPath();
            ctx.arc(c.width*(loc.bg[i][0]/100), c.height*(loc.bg[i][1]/100), loc.bg[i][3], 0, 2 * Math.PI);
            ctx.fillStyle = loc.bg[i][2];
            ctx.fill();
            ctx.closePath();
        }
    }

    if (bgmTimer > 0) {
        bgmTimer --;
        if (bgmTimer < 256) {
            ctx.fillStyle = `rgb(${bgmTimer},${bgmTimer},${bgmTimer})`;
        } else {
            ctx.fillStyle = "#FFFFFF";
        }
        ctx.font = scaleFont(0.015, "Hyperspace");
        ctx.fillText(`streaming ${backgroudMusic.src}`, 10, c.height - 10);
    }
    if (msgTimer > 0) {
        // defer to bgm
        if (bgmTimer > 0) {
            msgTimer = 0;
        }
        msgTimer --;
        if (msgTimer < 256) {
            ctx.fillStyle = `rgb(${msgTimer},${msgTimer},${msgTimer})`;
        } else {
            ctx.fillStyle = "#FFFFFF";
        }
        ctx.font = scaleFont(0.02, "Hyperspace");
        ctx.fillText(`${msgTimerMsg}`, 10, c.height - 10);
    }
}

function clearCanvas() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, c.width, c.height);
}

function drawAsteroids() {
    asteroids.forEach(e => {
        actx.clearRect(-40,-40,80,80);
        actx.rotate(e.spin * Math.PI / 180);
        actx.strokeStyle = e.color;
        actx.stroke(e.path);
        ctx.drawImage(a, 0,0,80,80, e.x, e.y,80,80);
        actx.rotate(-e.spin * Math.PI / 180);
        if (showHitbox && debug) {
            drawHitbox(e);
        }

        if (ship.lzrEquip && !ship.dead) {
            if (distance2D({"x":e.x+e.hbOffset2*0.8,"y":e.y+e.hbOffset2*0.8}, {"x":ship.x+ship.hbOffset2,"y":ship.y+ship.hbOffset2}) < ship.lzrDistance + (15*ship.lzrLvl) && stage != 0) {
                ctx.strokeStyle = "#fbff00";
                ctx.lineWidth = Math.min(ship.lzrLvl, 5);
                ctx.beginPath(); 
                ctx.moveTo(ship.x+ship.hbOffset2, ship.y+ship.hbOffset2); 
                if (e.large) {
                    ctx.lineTo(e.x + e.hbOffset2*0.8, e.y + e.hbOffset2*0.8); 
                } else {
                    ctx.lineTo(e.x + e.hbOffset2*1.3, e.y + e.hbOffset2*1.3); 
                }
                ctx.stroke(); // Render the line
                ctx.lineWidth = defaultLineWidth;
                if (e.lzrCool <= 0) {
                    let dam = getRandomInt(ship.lzrLvl*(ship.baseDamage/2))+1;
                    e.health -= dam;
                    damageNumbers.push(new DamageNumber(dam, e.x+e.hbOffset1+(e.hbOffset2/2), e.y+e.hbOffset1+(e.hbOffset2/2)));
                    e.lzrCool = 25;
                    //console.log(e.health)
                    if (e.health <= 0) {
                        // updated missions
                        killRoid(e);
                        asteroids = asteroids.filter(r => !deadAsteroids.includes(r));
                        deadAsteroids = [];
                    }
                }
            }
            if (e.lzrCool > 0) {
                e.lzrCool --;
            }
        }
        ctx.lineWidth = defaultLineWidth;
    });
}

function drawMobiles() {
    enemies.forEach(e => {
        moveEntity(e);
        e.bulletTimer --;
        if (e.bulletTimer <= 0) {
            if (e.timesFired % 5 == 0) {
                e.bulletTimer = getRandomInt(400);
            } else {
                e.bulletTimer = getRandomInt(e.bulletRate)+5;
            }
            if (!ship.dead) {
                setAudioSource(1);
                let rx = getRandomInt(e.shotJitter);
                rx = rx - (e.shotJitter/2);
                let ry = getRandomInt(e.shotJitter);
                ry = ry - (e.shotJitter/2);
                //console.log("e ",e, angle(e.x,e.y,ship.x+ship.hbOffset1,ship.y+ship.hbOffset1), e.x + 40, e.y + 40, 5, false)
                bullets.push(new Bullet(e, angle(
                    e.x + e.hbOffset2,
                    e.y + e.hbOffset2,
                    ship.x + ship.hbOffset2 + rx,
                    ship.y + ship.hbOffset2 + rx),
                    e.x + e.hbOffset2,
                    e.y + e.hbOffset2, 5, false));
                //console.log(bullets[bullets.length-1])
                // improved Enemy accuacy every bullet, 
                // learning faster with high ship.karma
                e.timesFired ++;
                e.shotJitter -= e.int; 
                if (e.shotJitter < 0) {
                    e.shotJitter = 0;
                }
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
        ctx.drawImage(a, 0,0,80,80, e.x, e.y,80,80);
        actx.rotate(-e.spin * Math.PI / 180);
        if (showHitbox && debug) {
            drawHitbox(e);
        }

        // check if in laser range
        if (ship.lzrEquip && ship.lzrLvl > 3 && !ship.dead) {
            if (distance2D({"x":e.x+e.hbOffset2*1.4,"y":e.y+e.hbOffset2*1.4}, {"x":ship.x+ship.hbOffset2,"y":ship.y+ship.hbOffset2}) < ship.lzrDistance + (15*ship.lzrLvl)) {
                ctx.strokeStyle = "#FF0000";
                ctx.lineWidth = Math.min(ship.lzrLvl, 5);
                ctx.beginPath(); 
                ctx.moveTo(ship.x+ship.hbOffset2, ship.y+ship.hbOffset2); 
                ctx.lineTo(e.x + (e.hbOffset2*1.4), e.y+ (e.hbOffset2*1.4)); 
                ctx.stroke(); // Render the line
                ctx.lineWidth = defaultLineWidth;
                if (e.lzrCool <= 0) {
                    let dam = getRandomInt(ship.lzrLvl+1)+1;
                    e.health -= dam;
                    damageNumbers.push(new DamageNumber(dam, e.x+e.hbOffset1+(e.hbOffset2/2), e.y+e.hbOffset1+(e.hbOffset2/2)));
                    e.lzrCool = 25;
                    console.log(e.health)
                    if (e.health <= 0) {
                        // updated missions
                        killEnemyShip(e);
                        enemies = enemies.filter(e => !deadEnemies.includes(e));
                        deadEnemies = [];
                    }
                }
            }
            if (e.lzrCool > 0) {
                e.lzrCool --;
            }
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
    let p = 0;
    for (let i = 0; i < ship.storage.length; i++) {
        if (ship.storage[i] > 0) {
            ctx.fillStyle = resourceColor[i];
            let rw = ship.storage[i]/ship.maxStorage;
            ctx.fillRect((c.width/20*3)+p, c.height/20*0.8, ((c.width/20)*2.5)*rw, c.height/20*0.8);
            p += ((c.width/20)*2.5)*rw;
        }
    }

    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.rect(c.width/20*3, c.height/20*0.8, c.width/20*2.5, c.height/20*0.8);
    ctx.stroke();

    ctx.font = scaleFont(0.02, "Hyperspace"); //"12px Hyperspace";
    ctx.fillStyle = '#000000';
    ctx.fillText(`${Math.floor(ship.storageTotal)}/${ship.maxStorage}`, (c.width/20*3.4) - 2, (c.height/20*1.45) - 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${Math.floor(ship.storageTotal)}/${ship.maxStorage}`, c.width/20*3.4, c.height/20*1.45);


    // missions
    ctx.font = scaleFont(0.015, "Hyperspace"); //"12px Hyperspace";
    if (ship.curMission == -1 && missions.length > 0) {
        ship.curMission = 0;
    }
    if (missions.length > 0) {
        let mission = missions[ship.curMission];
        // goal text
        if (mission.type == 'sos') {
            ctx.fillStyle = ship.sosColor;
            ctx.fillText(`${constellationNames[mission.constellation]} / ${mapLocations[mission.constellation][mission.sector].name} / ${resourceNames[mission.need]} / ${mission.needAmount}` , c.width/20*6, c.height/20*1.45);
        } else if (mission.type == 'kill') {
            ctx.fillStyle = ship.killColor;
            ctx.fillText(`${constellationNames[mission.constellation]} / ${mapLocations[mission.constellation][mission.sector].name} / ${mission.killNum}` , c.width/20*6, c.height/20*1.45);
        } else if (mission.type == 'life') {
            ctx.fillStyle = ship.lifeColor;
            ctx.fillText(`${constellationNames[mission.constellation]} / ${mapLocations[mission.constellation][mission.sector].name} / $${mission.needAmount}` , c.width/20*6, c.height/20*1.45);
        } else if (mission.type == 'lzr') {
            ctx.fillStyle = ship.lzrColor;
            if (ship.lzrLvl == 1) {
                ctx.fillText(`${constellationNames[mission.constellation]} / ${mapLocations[mission.constellation][mission.sector].name} / L.Z.R. Install`, c.width/20*6, c.height/20*1.45);
            }  else if (ship.lzrLvl == 3) {
                ctx.fillText(`${constellationNames[mission.constellation]} / ${mapLocations[mission.constellation][mission.sector].name} / L.Z.R. Offensive Upgrade`, c.width/20*6, c.height/20*1.45);
            } else {
                ctx.fillText(`${constellationNames[mission.constellation]} / ${mapLocations[mission.constellation][mission.sector].name} / L.Z.R. Upgrade ${ship.lzrLvl}`, c.width/20*6, c.height/20*1.45);
            }
            
        }
        for (let i = 0; i < missions.length; i++) {
            let m = missions[i];
            //console.log(m.type, m.x, m.y, c.width/20*0.5, c.height/20*0.8)
            if (m.constellation == constellation) {
                ship.curMission = i;
            }
            if (
                (
                    m.type == 'sos' ||
                    m.type == 'life' ||
                    m.type == 'lzr'
                ) &&
                m.constellation == constellation &&
                m.sector == curMapLoc
            ) {
                ship.curMission = i;
                //console.log(m.x, m.y, c.width/20*0.5, c.height/20*0.8)
                ctx.strokeStyle = "#FFFFFF";
                ctx.strokeRect(m.x, m.y, 30, 20);
                if (
                    ship.x + 20 > m.x - 10&&
                    ship.x + 20 < m.x + 50 &&
                    ship.y + 20 > m.y - 10 &&
                    ship.y + 20 < m.y + 40
                ) {
                    if (ship.velX > 0.35) {
                        ship.velX = 0.35;
                    }
                    if (ship.velY > 0.35) {
                        ship.velY = 0.35;
                    }
                    if (ship.velX < -0.35) {
                        ship.velX = -0.35;
                    }
                    if (ship.velY < -0.35) {
                        ship.velY = -0.35;
                    }

                    if (m.type == 'life') {
                        if (m.needAmount > 2025 && ship.money > 50 ) {
                            ctx.strokeStyle = "#00FF00";
                            ship.money -= 500;
                            m.needAmount -= 500;
                        } else if (ship.money > 50) {
                            ctx.strokeStyle = "#00FF00";
                            ship.money -= 50;
                            m.needAmount -= 50;
                        } else {
                            ctx.strokeStyle = "#FF0000";
                        }
                    } else if (m.type == 'lzr') {
                        ctx.strokeStyle = "#00FF00";
                        m.needAmount -= 1;
                        m.collectionDelay = 10;
                    } else if (
                        ship.storage[m.need] > 0 &&
                        m.needAmount > 0 &&
                        m.collectionDelay <= 0 &&
                        !ship.dead
                    ) {
                        ctx.strokeStyle = "#00FF00";
                        ship.storage[m.need] --;
                        ship.storageTotal --;
                        m.needAmount --;
                        m.collectionDelay = 10;
                    } else if (
                        ship.storage[m.need] > 0 &&
                        m.needAmount > 0 &&
                        !ship.dead
                    ) {
                        // collection delay requirement makes color jittery
                        ctx.strokeStyle = "#00FF00";
                    } else {
                        ctx.strokeStyle = "#FF0000";
                    }
                } else {
                    if (m.type == 'life') {
                        // blue strobe
                        ctx.strokeStyle = `rgb(0,${m.colorLevel/2},${m.colorLevel})`;
                    } else if (m.type == 'lzr') {
                        // yellow strobe
                        ctx.strokeStyle = `rgb(${m.colorLevel},${m.colorLevel},0)`;
                    } else {
                        ctx.strokeStyle = `rgb(0,${m.colorLevel},${m.colorLevel})`;
                    }
                    
                    m.colorLevel --;
                    if (m.colorLevel <= 50) {
                        m.colorLevel = 256;
                    }
                }
                if (m.collectionDelay > 0) {
                    m.collectionDelay --;
                }
                // complete sos mission
                if (m.needAmount <= 0) {
                    ship.money += m.reward;
                    setAudioSource(7);
                    if (m.type == "life") {
                        lives ++;
                        speak(`Mission Completed. Extra spaceship awarded.`);
                    } else if (m.type == 'lzr') {
                        if (ship.lzrEquip) {
                            ship.lzrLvl ++;
                            if (ship.lzrLvl == 4) {
                                speak(`Mission Completed. L.Z.R. Optical Weapons Platform installed.`);
                            } else {
                                speak(`Mission Completed. L.Z.R. Optical Mining System upgraded.`);
                            }
                            
                        } else {
                            ship.lzrEquip = true;
                            speak(`Mission Completed. L.Z.R. Optical Mining System installed.`);
                        }
                    } else {
                        if (getRandomInt(3) == 1) {
                            ship.shield = true;
                        }
                        karma ++;
                        speak(`Mission Completed. ${m.reward} transfered to account`);
                    }
                    
                    missions = missions.filter(r => r != m);
                    missions.push(new Mission());
                }
                ctx.strokeRect(m.x-10, m.y-10, 50, 40);
                ctx.font = scaleFont(0.013, "Hyperspace"); //"12px Hyperspace";
                ctx.fillStyle = "#FFFFFF"
                if (m.type == 'life') {
                    ctx.fillText("EXTRA SHIP "+ m.needAmount, m.x-40,m.y+50);
                } else if (m.type == 'lzr') {
                    ctx.fillText(`INSTALL LVL.${ship.lzrLvl}`, m.x-40,m.y-20);
                    ctx.fillText(m.needAmount, m.x,m.y+50);
                } else {
                    ctx.fillText("need "+ m.needAmount + " " + (resourceNames[m.need]), m.x-40,m.y+50);
                }
            }
        }
    }

    

    // fuel gauge
    //console.log(ship.fuelTotal/ship.maxFuel)
    if (ship.fuelTotal/ship.maxFuel <= 0.25) {
        ctx.fillStyle = "#AA0000";
        ctx.strokeStyle = "#FF0000";
        if (msgTimer == 0 && !ship.dead) {
            msgTimer = 600;
            msgTimerMsg = "FUEL LEVEL IS LOW";
            speak(msgTimerMsg);
        }
    } else {
        ctx.fillStyle = "#888888";
        ctx.strokeStyle = "#FFFFFF";
    }
    ctx.fillRect(c.width/20*13, c.height/20*0.8, (c.width/20*2.5/100)*ship.fuelTotal*(100/ship.maxFuel), c.height/20*0.8);

    ctx.beginPath();
    ctx.rect(c.width/20*13, c.height/20*0.8, c.width/20*2.5, c.height/20*0.8);
    ctx.stroke();

    ctx.font = scaleFont(0.02, "Hyperspace");
    ctx.fillStyle = '#000000';
    ctx.fillText(`${Math.floor(ship.fuelTotal)}/${ship.maxFuel}`, (c.width/20*13.2)-2, (c.height/20*1.45)-2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${Math.floor(ship.fuelTotal)}/${ship.maxFuel}`, c.width/20*13.2, c.height/20*1.45);

    // fuel consumption readout
    ctx.fillStyle = '#777676';
    ctx.font = scaleFont(0.02, "Hyperspace");
    ctx.fillText(Math.floor(ship.fuelCon*500), c.width/20*15.8, c.height/20*1.45);

}