$(document).ready(function(){
    setupMenus();
    setupBoard();
    clickMode(TERRAIN);
    
    $('.board').on('click', '.tile', function(){
        var x = parseInt($(this).attr('x'));
        var y = parseInt($(this).attr('y'));
        var cell = board[y][x];
        var oldCell = board[sY][sX];
        if(mode == ASDF) {
            //modify terrain
            setTerrain(x, y, (cell.terrainId+1) % terrains.length);
            refreshBoard();
        } else if(mode == ADD) {
            //add units
            var quotaFilled = pieceCount[team][unit] >= quota[unit];
            if(cell.unitId == -1 && quotaFilled)
                return;
            if(cell.unitId != unit || cell.team != team) {
                if(!quotaFilled && (cell.terrainId == CASTLE) == (unit == KING))
                    addUnit(x, y, unit, team);
                else {
                    if(cell.unitId >= 0)
                        unit = cell.unitId;
                    clearCell(x, y);
                }
            } else {
                clearCell(x, y);
            }
            refreshBoard();
            refreshUnitMenu();
        } else if(mode == MOVE || mode == PLAY) {
            //set selected unit to this
            clearFlagClasses();
            if(playing && !selected && cell.team != turn)
                    return;
            
            if(cell.unitId > -1 && (cell.team == turn || !playing)) {
                //if you select one of your own units
                
                //selected self again, unselect
                if(selected && x == sX && y == sY) {
                    selected = false;
                    refreshLegend();
                    return;
                }
                
                if(rabbleMoved && rabbleX == x && rabbleY == y) {
                    //selected same rabble twice, wants to end turn?
                    switchTurns();
                    refreshBoard();
                    refreshLegend();
                    return;
                } else if(rabbleMoved && cell.unitId != RABBLE) {
                    //must select another rabble to move, or same to skip
                    selected = false;
                    refreshLegend();
                    return;
                }
                
                //normal routine for newly selected unit
                selected = true;
                
                sX = x;
                sY = y;
                initFlags(cell.team);
                //now that we've set up the board, we need to figure out
                
                cell.selected = true;
                walkAt(x, y, cell.move, cell);
                findKills(x, y);
            } else if(selected) {
                //empty or enemy unit selected, perform a move/cap
                
                //if the clicked cell is capturable, but the target of the capture exists elsewhere
                if(playing && cell.capture && (cell.target[0] != x || cell.target[1] != y)) {
                    //target should be cleared
                    clearCell(cell.target[0], cell.target[1]);
                }
                
                //if you didnt click a mountain, and the cell is either walkable, capturable, or you're not playing:
                if(cell.terrainId != MOUNTAINS && (!playing || cell.walkable || cell.capture)) {
                    if(playing) {
                        //check to see if piece being copied is rabble, and if copy-to spot is occupied by enemy
                        if(oldCell.unitId == RABBLE && cell.unitId == -1) {
                            if(rabbleMoved) {
                                switchTurns();
                            } else {
                                rabbleMoved = true;
                                rabbleX = x;
                                rabbleY = y;
                            }
                        } else {
                            //normal move or rabble capture, auto-end
                            switchTurns();
                        }
                    }
                    copyUnit(sX, sY, x, y);
                    clearCell(sX, sY);
                }
                
                selected = false;
            }

            refreshBoard();
            refreshLegend();
        } else if(mode == TERRAIN) {
            var location = pieceIndex(x, y);
            var side = pieceSide(location);

            //pieceHover = -1; // why was this happening?
            //if no piece is selected, select the one you click
            if(!selected) {
                selected = true;
                pieceHoverChanged = false;
                pieceLocation = location;
                //now simulate a move to refresh?
                $(this).mouseover();
                refreshBoard();
            } else if(pieceLocation == location) {
                if(pieceLocation != 8 && !pieceHoverChanged) {
                    rotated[pieceLocation] = !rotated[pieceLocation];
                }
                selected = false;
                buildFromPieces();
            } else if(pieceLocation == 8) {
                //figure out, based on what you clicked, where to move the king
                selected = false;
                pieceHover = 8;
                var savedPos = kingPos;
                var oldPos = kingPos;
                kingPos = 0;
                if(pieceIndex(x, y) == 8)
                    savedPos = 0;
                kingPos = 2;
                if(pieceIndex(x, y) == 8)
                    savedPos = 2;
                kingPos = 1;
                if(pieceIndex(x, y) == 8)
                    savedPos = 1;
                kingPos = oldPos;
                if(kingPos != savedPos) {
                    kingPos = savedPos;
                    buildFromPieces();
                } else {
                    pieceHover = -1;
                    refreshBoard();
                }
            } else if(location != 8) {
                //swap the pieces
                var temp = orientation[pieceLocation];
                orientation[pieceLocation] = orientation[location];
                orientation[location] = temp;

                if(pieceSide(location) == pieceSide(pieceLocation)) {
                    temp = rotated[pieceLocation];
                    rotated[pieceLocation] = rotated[location];
                    rotated[location] = temp;
                } else 
                    rotated[location] = rotated[pieceLocation] = false;
                selected = false;
                buildFromPieces();
            } else {
                selected = false;
                refreshBoard();
            }
            refreshPieceMenu();
            //if the king is selected and you chose a piece 1 or 2 to the left of it, and not the bottom row, move the king, swapping with
            //the two cells to the side, and flipping them, deselecting king

            //if the same piece was clicked a second time, deselect it and rotate it

            //if a different piece was clicked, swap them

            //if any movement was made, redo the terrain!

            //whenever you make a switch, build from pieces
            //buildFromPieces();
        }
    });

    $('.board').on('mouseenter', '.tile', function(){
        var beforeHover = pieceHover;
        if(mode == TERRAIN) {
            //set pieceHover based on x, y
            var x = parseInt($(this).attr('x'));
            var y = parseInt($(this).attr('y'));

            if(!selected || pieceLocation != 8) {
                pieceHover = pieceIndex(x, y);
            } else {
                //pieceHover is what the prospective kingPos is
                var oldPos = kingPos;
                var savedPos = -1;
                for(i=0;i<3;i++) {
                    kingPos = i;
                    if(pieceIndex(x, y) == 8)
                        savedPos = i;
                }
                kingPos = oldPos;
                if(savedPos >= 0)
                    pieceHover = savedPos;
                else
                    pieceHover = -1;
            }
            //try new orientation, kingPos, rotated is false for both?
            var oldPos = kingPos;
            var oldOrientation = [0, 0, 0, 0, 0, 0, 0, 0];
            var oldR1 = rotated[pieceHover];
            var oldR2 = rotated[pieceLocation];
            for(var i=0;i<8;i++)
                oldOrientation[i] = orientation[i];
            //swap the values
            if(selected && pieceLocation >= 0 && pieceLocation < 8) {
                if(pieceHover != pieceLocation && pieceHover >= 0 && pieceHover < 8) {
                    var temp = orientation[pieceHover];
                    orientation[pieceHover] = orientation[pieceLocation];
                    orientation[pieceLocation] = temp;
                    //if the sides are opposite, flip
                    if(pieceSide(pieceHover) != pieceSide(pieceLocation))
                        rotated[pieceHover] = rotated[pieceLocation] = false;
                    else {
                        rotated[pieceHover] = oldR2;
                        rotated[pieceLocation] = oldR1;
                    }

                } else if(pieceHover >= 0 && pieceHover < 8 && pieceHover == pieceLocation) {
                    //same piece, flip it around?
                    //rotated[pieceLocation] = !oldR2;
                }
            } else if(selected) {
                //if you're selecting piece 8 and you're hovering over a place where piece 8 might go
                if(pieceLocation == 8 && pieceHover >= 0 && pieceHover < 3) {
                    //set the king position
                    kingPos = pieceHover;

                    //make sure to highlight the pieces that will be moved as well!
                }
            }
            buildFromPieces();
            for(var i=0;i<8;i++)
                orientation[i] = oldOrientation[i];
            kingPos = oldPos;
            rotated[pieceHover] = oldR1;
            rotated[pieceLocation] = oldR2;
            refreshBoard();
            refreshPieceMenu();
        }

        if(pieceHover != beforeHover)
            pieceHoverChanged = true;
    });

    $('.board').on('mouseleave', '.tile', function(e){
        //set pieceHover to -1 unless the target
        var tile = $(e.relatedTarget);
        if(tile.hasClass('top') || tile.hasClass('bottom'))
            tile = tile.parent();
        if(tile.hasClass('transparent') || !tile.hasClass('tile'))
            pieceHover = -1;
        //if we set pieceHover to -1 outright, that's not very fair
        //could be you just moved adjacent tiles in the same piece
        //pieceHover = -1;
        refreshBoard();
        refreshPieceMenu();
    });
    $(document).on('mousemove', function(e){
        //console.log("HI");
        if(mode == TERRAIN && selected && pieceLocation != 8) {
            //var offset = $('.board .row:eq(4)').first().find('.tile').first().offset();
            //var bX = offset.left
            //var bY = offset.top
            $('.board .piece.floating').css(
                {
                    "left": e.pageX,
                    "top": e.pageY
                }
            );
        }
    });
    $(document).on('click', function(e){
        if(mode == TERRAIN) {
            $('.board .piece.floating').css(
                {
                    "left": e.pageX,
                    "top": e.pageY
                }
            );
        }
    });
});