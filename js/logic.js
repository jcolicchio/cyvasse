var initFlags = function(_team) {
    clearFlagClasses();
    for(var i=0;i<9;i++) {
        for(var j=0;j<Math.min(i,8-i)+8;j++) {
            var cell = board[i][j];
            cell.hinder = cell.block = cell.occupied = cell.no_engage = cell.walkable = cell.capture = cell.selected = false;
            cell.engaged_by = 0;
            cell.target = [-1, -1];
        }
    }
    //go through each cell, if it's an enemy, block
    //if it's an ally, occupy
    //if it's a mountain, block
    //if it's a spear, hinder 2 cells in "front" of it
    //set engaged by to be 0, and no_engage to 0 as well
    for(i=0;i<9;i++) {
        for(j=0;j<Math.min(i,8-i)+8;j++) {
            var cell = board[i][j];
            if(cell.unitId != -1) {
                if(cell.team != _team) {
                    cell.block = true;
                    if(cell.unitId == SPEARS) {
                        if(cell.team == WHITE) {
                            var xval = twoAbove(j, i);
                            var y = i-1;
                            if(valid(xval[0], y)) {
                                board[y][xval[0]].hinder = true;
                            }
                            if(valid(xval[1], y)) {
                                board[y][xval[1]].hinder = true;
                            }
                        } else {
                            var xval = twoBelow(j, i);
                            var y = i+1;
                            if(valid(xval[0], y)) {
                                board[y][xval[0]].hinder = true;
                            }
                            if(valid(xval[1], y)) {
                                board[y][xval[1]].hinder = true;
                            }
                        }
                    }
                } else {
                    cell.occupied = true;
                }
            } else if(cell.terrainId == MOUNTAINS) {
                cell.block = true;
            }
        }
    }
    
    for(i=0;i<9;i++) {
        for(j=0;j<Math.min(i,8-i)+8;j++) {
            //if this is your unit, run engage on it
            //be sure to skip any unit that's near an enemy tower, BUT
            //if that unit can engage an enemy tower, do so!
            var cell = board[i][j];
            if(cell.team == _team) {
                unitEngage(j, i);
            }
        }
    }
}

var findKills = function(x, y) {
    var cell = board[y][x];
    //crossbow: cant cap, ignore this function completely
    //tower cant cap either
    if(cell.unitId == CROSSBOW || cell.unitId == TOWER)
        return;
    
    //if you're moving a second rabble, cant capture!
    if(cell.unitId == RABBLE && rabbleMoved)
        return;
    
    //if towered units cant kill, we should return here
    //since trebs have to engage the unit they cap, no_engage trebs are useless, they cant engage adjacent towers, so they cant cap at all
    if(cell.unitId == TREB && cell.no_engage)
        return;
    
    //find all enemy units where engaged >= armor
    for(var i=0;i<9;i++) {
        for(var j=0;j<Math.min(i,8-i)+8;j++) {
            var enemy = board[i][j];
            if(enemy.unitId > -1 && enemy.team != cell.team && enemy.engaged_by >= enemy.armor) {
                var path = lineBetween(cell.x, cell.y, j, i);
                
                //we have an enemy that's killable, see if this unit, cell, can kill
                    //default rules: straight line, dist <= move, unblocked path(no enemy or mountains)
                
                //if there's a path
                if(path.length > 0) {
                    var adequatePath = false;
                    var firstCell = board[path[1][1]][path[1][0]];
                    
                    //if we're not a treb, and the path length is sufficient
                    if(cell.unitId != TREB && cell.unitId != SPEARS && path.length <= cell.move + 1)
                        adequatePath = true;
                    
                    //if we're a spears, make sure it's going the right way, and make sure its length is 1
                    if(cell.unitId == SPEARS && ((cell.y == enemy.y+1 && cell.team == WHITE) || (cell.y == enemy.y-1 && cell.team == BLACK)))
                        adequatePath = true;
                    
                    //elephant: if dist == 2 and space in between has NO tiles
                        //friendly or otherwise
                    if(cell.unitId == ELEPHANT && path.length <= cell.move+2 && firstCell.unitId == -1)
                        adequatePath = true;
                    
                    //if you're a king, and there's an allied castle which would allow you to capture the piece on the other side
                    if(cell.unitId == KING && path.length <= cell.move+2 && firstCell.unitId == TOWER && firstCell.team == cell.team)
                        adequatePath = true;
                    
                    if(adequatePath) {
                        //the path is within move/charge distance, and if charge, the middle tile has no unit
                        //make sure the path is walkable, or youre a dragon
                        var clearPath = true;
                        for(var k=1;k<path.length-1;k++) {
                            var pathCell = board[path[k][1]][path[k][0]];
                            //if it's hindered, give up
                            if(pathCell.hinder)
                                clearPath = false;
                            //if it's blocked and you're not a dragon, give up
                            
                            //dragon: can go off mountains, and over enemies as well
                                //note: dragon can't go through spear hinder, right?
                            else if(pathCell.block && cell.unitId != DRAGON)
                                clearPath = false;
                        }
                        //make sure nothing in the path is hindered
                        if(clearPath) {
                            //this unit is capable of killing the target
                            //color this a kill color
                            enemy.capture = true;
                            enemy.target = [enemy.x, enemy.y];

                            //horse: you can keep going as you cap, up to move distance
                                //so long as you arent hindered or blocked by a second unit or mountain
                                //cant capture 2 like this, only 1
                            
                            //in addition, if this is a horse, we need to generate a path of length unit.move + 1
                            if((cell.unitId == LHORSE || cell.unitId == HHORSE) && !enemy.hinder) {
                                var old1 = [path[path.length-2][0], path[path.length-2][1]];
                                var old2 = [path[path.length-1][0], path[path.length-1][1]];
                                var oneAfter = project(old1[0], old1[1], old2[0], old2[1]);
                                var twoAfter = project(old2[0], old2[1], oneAfter[0], oneAfter[1]);
                                //if path.length <= move, try oneAfter
                                if(path.length <= cell.move) {
                                    if(valid(oneAfter[0], oneAfter[1])) {
                                        //make sure it's not hindered or blocked
                                        var after = board[oneAfter[1]][oneAfter[0]];
                                        if(!after.block && !enemy.hinder) {
                                            if(!after.occupied) {
                                                //color this tile as a kill color!
                                                after.walkable = true; // necessary?
                                                after.capture = true;
                                                after.target = [enemy.x, enemy.y];
                                            }
                                            //if path.length+1 <= move, try twoAfter
                                            if(path.length < cell.move) {
                                                if(valid(twoAfter[0], twoAfter[1])) {
                                                    var prev = after;
                                                    after = board[twoAfter[1]][twoAfter[0]];
                                                    if(!after.block && !prev.hinder && !after.occupied) {
                                                        //color this tile as a kill color
                                                        after.walkable = true; // necessary?
                                                        after.capture = true;
                                                        after.target = [enemy.x, enemy.y];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else if(cell.unitId == TREB && path.length-1 >= 2 && path.length-1 <= 4) {
                        //treb time, make sure the path length-1 is between 2-4
                        //now let's make sure everything between the treb and path is not blocked
                        //we dont care about occupy, just block (enemy unit and mountain)
                        var clearPath = true;
                        for(var k=1;k<path.length-1;k++) {
                            if(board[path[k][1]][path[k][0]].block)
                                clearPath = false;
                        }
                        if(clearPath) {
                            //project path1 to path0, make sure it's walkable by the treb
                            var backwards = project(path[1][0], path[1][1], path[0][0], path[0][1]);
                            if(valid(backwards[0], backwards[1])) {
                                var back = board[backwards[1]][backwards[0]];
                                if(back.walkable) {
                                    //the treb can kill this target!
                                    //turn the cell behind the treb into a kill color
                                    //as well as the unit the treb can kill?
                                
                                    //dont highlight enemy, it lets trebs warp-capture to them
                                    back.capture = true;
                                    back.target = [enemy.x, enemy.y];
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

var scanTowers = function(x, y) {
    var cell = board[y][x];
    var up = twoAbove(x, y);
    var down = twoBelow(x, y);
    var neighbors = [];
    neighbors[0] = [up[0], y-1];
    neighbors[1] = [up[1], y-1];
    neighbors[2] = [x-1, y];
    neighbors[3] = [x+1, y];
    neighbors[4] = [down[0], y+1];
    neighbors[5] = [down[1], y+1];
    for(var i=0;i<6;i++) {
        var x = neighbors[i][0];
        var y = neighbors[i][1];
        if(valid(x, y)) {
            var neighbor = board[y][x];
            var teamToBe = -1;
            if(i == 0 || i == 1)
                teamToBe = WHITE;
            else if(i == 4 || i == 5)
                teamToBe = BLACK;
        
            if(neighbor.team != cell.team && neighbor.unitId == TOWER) {
                //if it's a treb, do nothing
                if(cell.engage >= 1 && cell.unitId != TREB && (cell.unitId != SPEARS || cell.team == teamToBe)) {
                    neighbor.engaged_by++;
                }
                //if it's a spear aimed the right way, target the tower and do nothing
                //else, target the tower
                cell.no_engage = true;
            }
        }
    }
}

var unitEngage = function(x, y) {
    //get the unit at x, y, and run his engage function
    var cell = board[y][x];
    //water means no engagement by this unit
    if(cell.terrainId == WATER) {
        cell.no_engage = true;
        return;
    }
    //scan for enemy towers
    scanTowers(x, y);
    if(cell.no_engage) {
        return;
    }
    if(cell.unitId == SPEARS) {
        //if team 1, engage down, else engage up
        if(cell.team == WHITE) {
            engageUp(x, y, cell.engage);
        } else {
            engageDown(x, y, cell.engage);
        }
    } else {
        engageAt(x, y, cell.engage);
    }
}

var engageAt = function(x, y, range) {
    engageUp(x, y, range);
    engageSide(x, y, range);
    engageDown(x, y, range);
}

var engageUp = function(x, y, range) {
    var up = twoAbove(x, y);
    engageLine(x, y, up[0], y-1, range-1);
    engageLine(x, y, up[1], y-1, range-1);
}

var engageDown = function(x, y, range) {
    var down = twoBelow(x, y);
    engageLine(x, y, down[0], y+1, range-1);
    engageLine(x, y, down[1], y+1, range-1);
}

var engageSide = function(x, y, range) {
    engageLine(x, y, x-1, y, range-1);
    engageLine(x, y, x+1, y, range-1);
}

var engageLine = function(x1, y1, x2, y2, range) {
    //send engage raytrace until it hits a block?
    if(!valid(x2, y2))
        return;
    //if this spot isnt blocked, engage it
    var cell = board[y2][x2];
    if(cell.unitId != -1 && !cell.occupied && range != 3) {
        cell.engaged_by++;
    }
    if(cell.block)
        return;
    if(range <= 0)
        return;
    var out = project(x1, y1, x2, y2);
    engageLine(x2, y2, out[0], out[1], range-1);
}

var walkAt = function (x, y, range, piece) {
    //if it's somewhere you could stop, mark it walkable
    if(!valid(x, y))
        return;
    var cell = board[y][x];
    if(cell.block && piece.unitId != DRAGON) {
        //turn cell red? i.e. add class block
        return;
    }
    if(!cell.occupied && !cell.block) {
        cell.walkable = true;
    } else if(cell.unitId == TOWER && piece.unitId == KING && !cell.hinder) {
        //calculate the jumpover
        var out = project(piece.x, piece.y, cell.x, cell.y);
        walkAt(out[0], out[1], range, piece);
    } else if(cell.block && piece.unitId == DRAGON) {
        cell.occupied = true;
    }
    if(cell.hinder && board[y][x] != piece) {
        return;
    }
    if(range == 0)
        return;
    
    var up = twoAbove(x, y);
    var down = twoBelow(x, y);
    walkAt(up[0], y-1, range-1, piece);
    walkAt(up[1], y-1, range-1, piece);
    walkAt(down[0], y+1, range-1, piece);
    walkAt(down[1], y+1, range-1, piece);
    walkAt(x-1, y, range-1, piece);
    walkAt(x+1, y, range-1, piece);
}