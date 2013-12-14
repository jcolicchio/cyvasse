var mode = TERRAIN;
var unit = RABBLE;
var team = WHITE;


//used for piece setup
var orientation = [6, 4, 0, 1, 7, 3, 5, 2];
var rotated = [false, false, true, false, false, false, false, false];
var kingPos = 1;

//calculates the index of the piece currently clicked
//-1 for invalid
//8 for king's landing (huehuehue)
var pieceIndex = function(x, y) {
    if(!valid(x, y) || y <= 4)
        return -1;
    if(x >= kingPos*2+2 && x < kingPos*2+2+3 && y >= 5 && y <= 7) {
        if(y < (8 - x + 2 + 2*kingPos))
            return 8;
    }
    var xPos = 0;
    if(x < kingPos*2 + 2) {
        xPos = Math.floor(x/2);
    } else {
        xPos = Math.floor((x - (8-y))/2);
    }
    if(y > 6)
        xPos += 4;
    return xPos;
}

var pieceTile = function(x, y) {
    var offset = x;
    if(pieceSide(pieceIndex(x, y)) == RIGHT)
        offset -= (8-y);
    var index = 2*((y+1)%2) + offset % 2;
    return index;
}

var pieceSide = function(n) {
    if(n >= 4)
        n -= 4;
    if(n > kingPos)
        return RIGHT;
    else
        return LEFT;
}

var setupBoard = function(){
    var str = "";
    for(i=0;i<9;i++) {
        var l = "mid";
        if(i < 4)
            l = "top";
        else if(i > 4)
            l = "bot";
        str += "<div class='row "+l+"'>";
        var cols = Math.min(i, 8-i);
        for(var j=0; j<8+cols; j++) {
            
            str += "<div class='tile grass' x="+j+" y="+i+"><div class='top'></div><div class='bottom'></div></div>";
        }
        str += "</div>";
    }
    $('.board').append(str);
    $('.board').append("<div class='piece floating'></div>");
}

//this logic belongs with the board state
/*var buildFromPieces = function(){
    for(i=4;i<9;i++) {
        for(j=0;j<Math.min(i,8-i)+8;j++) {
            //for this cell at (j, i), get the piece index, what side its on, and if its rotated
            var piece = pieceIndex(j, i);
            if(piece == -1)
                setTerrain(j, i, GRASS);
            else if(piece == 8)
                if(i == 7)
                    setTerrain(j, i, CASTLE);
                else
                    setTerrain(j, i, GRASS);
            else {
                var _rotated = rotated[piece];
                var side = pieceSide(piece);
                var index = pieceTile(j, i);
                if(_rotated)
                    index = 3 - index;
                var terrain = pieces[orientation[piece]][side][index];
                setTerrain(j, i, terrain);
            }
        }
    }
    refreshBoard();
}*/

/*var clearTerrain = function(){
    for(var i=0;i<9;i++) {
        for(var j=0;j<Math.min(i,8-i)+8;j++) {
            setTerrain(j, i, GRASS);
        }
    }
}*/

var clearTerrainClasses = function(){
    for(var i=0;i<terrains.length;i++)
        $('.board .'+terrains[i]).removeClass(terrains[i]);
}

var clearFlagClasses = function(){
    $('.hinder').removeClass('hinder');
    $('.block').removeClass('block');
    $('.occupied').removeClass('occupied');
    $('.no_engage').removeClass('no_engage');
    $('.walkable').removeClass('walkable');
    $('.engaged').removeClass('engaged');
    $('.engaged').removeClass('no_engage');
    $('.capture').removeClass('capture');
    $('.board .highlighted').removeClass('highlighted');
    $('.board .tile.transparent').removeClass('transparent');
    if(rabbleMoved)
        getTile(rabbleX, rabbleY).addClass('transparent');
    $('.board .selected').removeClass('selected');
}

var clearUnitClasses = function(){
    $('.board .unit').removeClass("unit");
    for(var i=0;i<units.length;i++) {
        var name = units[i].name;
        $('.board .'+name).removeClass(name);
    }
    for(i=0;i<colors.length;i++)
        $('.board .tile.'+colors[i]).removeClass(colors[i]);
}

var refreshBoard = function(){
    clearTerrainClasses();
    clearFlagClasses();
    clearUnitClasses();

    for(var i=0;i<9;i++) {
        for(var j=0;j<Math.min(i,8-i)+8;j++) {
            //grab the type of terrain, the type of unit, the status of the cell
            var cell = board[i][j];
            var tile = getTile(j, i);

            tile.addClass(cell.terrain);

            if(cell.unitId > -1 && mode != TERRAIN) {
                tile.addClass("unit").addClass(cell.unit).addClass(cell.color);

                //if this rabble was moved this turn, transparent it to indicate free mode if you want
                if(rabbleMoved && cell.x == rabbleX && cell.y == rabbleY)
                    tile.addClass("transparent");
            }

            if(selected && (mode == PLAY || mode == MOVE)) {
                if(cell.capture)
                    tile.addClass("capture");
                else if(cell.engaged_by > 0)
                    tile.addClass("engaged");
                else if(cell.no_engage)
                    tile.addClass("no_engage");
                else if(cell.walkable)
                    tile.addClass("walkable")
                else if(cell.occupied)
                    tile.addClass("occupied");
                else if(cell.hinder)
                    tile.addClass("hinder");
                else if(cell.block)
                    tile.addClass("block");
                if(cell.selected)
                    tile.addClass("selected");
            }

            var index = pieceIndex(j, i);
            if(mode == TERRAIN) {
                //if you're moving a king to a prospective new location, highlight all cells affected
                if((selected && index == pieceLocation) || ((!selected || (pieceLocation != 8 && pieceHover != 8)) && index == pieceHover && index >= 0)) {
                    //if there's a piece selected and this tile's piece is from selected
                    //or if a non-8 piece is hovered, and this is from the hovered
                    //tile.addClass("selected").addClass("unit");
                    //if the prospective index
                    var oldPos = kingPos;
                    kingPos = pieceHover;
                    if(selected && index == pieceLocation && (pieceLocation != 8 || pieceIndex(j, i) == 8))
                        tile.addClass('highlighted').addClass('garbage');
                    kingPos = oldPos;

                } else if(selected && pieceLocation == 8 && pieceHover >= 0 && pieceHover < 3) {
                    var isSwapped = false;
                    if(index == 8)
                        isSwapped = true;
                    if(kingPos >= 1 && pieceHover == 0 && (index == 1 || index == 5))
                        isSwapped = true;
                    if(kingPos == 0 && pieceHover >= 1 && (index == 1 || index == 5))
                        isSwapped = true;
                    if(kingPos == 2 && pieceHover <= 1 && (index == 2 || index == 6))
                        isSwapped = true;
                    if(kingPos <= 1 && pieceHover == 2 && (index == 2 || index == 6))
                        isSwapped = true;
                    //if you're in 8, or kingPos = 2 and pieceHover <= 1 and you're in 
                    //var oldPos = kingPos;
                    //kingPos = pieceHover;
                    if(!isSwapped)
                        tile.addClass("transparent");
                    else {
                        //if it belongs to the prospective new king piece, highlight it
                        var oldPos = kingPos;
                        kingPos = pieceHover;
                        if(pieceIndex(j, i) == 8)
                            tile.addClass('highlighted');
                        kingPos = oldPos;
                    }
                    //kingPos = oldPos;
                } else {
                    tile.addClass("transparent");
                }
            }
        }
    }

    if(playing && turn == BLACK)
        $('.board').addClass('flipped');
    else
        $('.board').removeClass('flipped');

    if(mode == TERRAIN || mode == ADD) {
        $('.board .row.top').hide();
    } else {
        $('.board .row.top').show();
    }

    if(mode == ADD)
        $('.unitlist').show();
    else
        $('.unitlist').hide();
}

var getTile = function(x, y) {
    //ui
    return $('.row:eq('+y+') .tile:eq('+x+')');
}

//reset the gameboard, state vars, unflip it, stop playing
var resetGame = function(){
    clearFlagClasses();
    rabbleMoved = false;
    selected = false;
    
    $('.board.flipped').removeClass('flipped');
    turn = WHITE;
    playing = false;
}