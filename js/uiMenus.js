var setup = function(){
    
    setTerrain(1, 3, WATER);
    setTerrain(7, 3, WATER);
    setTerrain(8, 3, WATER);
    setTerrain(9, 3, WATER);
    setTerrain(2, 1, MOUNTAINS);
    setTerrain(3, 2, MOUNTAINS);
    setTerrain(4, 1, CASTLE);
    
    addUnit(3, 5, RABBLE, WHITE);
    addUnit(4, 5, RABBLE, WHITE);
    addUnit(6, 5, RABBLE, WHITE);
    addUnit(8, 5, RABBLE, WHITE);
    addUnit(5, 8, RABBLE, WHITE);
    addUnit(6, 8, RABBLE, WHITE);
    
    addUnit(0, 5, SPEARS, WHITE);
    addUnit(5, 5, SPEARS, WHITE);
    addUnit(7, 5, SPEARS, WHITE);
    
    addUnit(8, 6, LHORSE, WHITE);
    addUnit(3, 8, LHORSE, WHITE);
    addUnit(4, 8, LHORSE, WHITE);
    
    addUnit(0, 6, HHORSE, WHITE);
    addUnit(3, 6, HHORSE, WHITE);
    
    addUnit(1, 8, CROSSBOW, WHITE);
    addUnit(5, 7, CROSSBOW, WHITE);
    
    addUnit(2, 6, TREB, WHITE);
    
    addUnit(1, 6, ELEPHANT, WHITE);
    addUnit(4, 6, ELEPHANT, WHITE);
    
    addUnit(7, 6, DRAGON, WHITE);
    
    addUnit(5, 6, TOWER, WHITE);
    addUnit(3, 7, TOWER, WHITE);
    
    addUnit(4, 7, KING, WHITE);
    
    addUnit(2, 3, RABBLE, BLACK);
    addUnit(4, 3, RABBLE, BLACK);
    addUnit(6, 3, RABBLE, BLACK);
    addUnit(7, 3, RABBLE, BLACK);
    addUnit(1, 0, RABBLE, BLACK);
    addUnit(2, 0, RABBLE, BLACK);
    
    addUnit(3, 3, SPEARS, BLACK);
    addUnit(5, 3, SPEARS, BLACK);
    addUnit(10, 3, SPEARS, BLACK);
    
    addUnit(3, 0, LHORSE, BLACK);
    addUnit(4, 0, LHORSE, BLACK);
    addUnit(1, 2, LHORSE, BLACK);
    
    addUnit(9, 2, HHORSE, BLACK);
    addUnit(6, 2, HHORSE, BLACK);
    
    addUnit(6, 0, CROSSBOW, BLACK);
    addUnit(3, 1, CROSSBOW, BLACK);
    
    addUnit(7, 2, TREB, BLACK);
    
    addUnit(5, 2, ELEPHANT, BLACK);
    addUnit(8, 2, ELEPHANT, BLACK);
    
    addUnit(2, 2, DRAGON, BLACK);
    
    addUnit(5, 1, TOWER, BLACK);
    addUnit(4, 2, TOWER, BLACK);
    
    addUnit(4, 1, KING, BLACK);
}

//ui
var setModeActive = function(n){
    mode = n;
    $('.list.modes li.active').removeClass('active');
    $('.list.modes li:eq('+n+')').addClass('active');
}

var setUnitActive = function(n, _team) {
    $('.unitlist .selected').removeClass('selected');
    $('.unitlist .row:eq('+n+') .tile:eq('+_team+')').addClass('selected');
}

//modes
var TERRAIN = 0;
var ADD = 1;
var MOVE = 2;
var CLEAR = 3;
var DEFAULT = 4;
var PLAY = 5;
var ASDF = 6;

var modes = [];
modes[TERRAIN] = {
    "name": "Edit Terrain",
    "fn": function(){
        //set the board according to orientation, rotated, and kingpos
        buildFromPieces();
    }
};

modes[ADD] = {
    "name": "Add Units",
    "fn": function(){
        refreshUnitMenu();
    }
};

modes[MOVE] = {
    "name": "Move Units",
    "fn": function(){}
};

modes[CLEAR] = {
    "name": "Clear Board",
    "fn": function(){
        clearTerrain(); // necessary?
        clickMode(TERRAIN);
    }
};

modes[DEFAULT] = {
    "name": "Default Setup",
    "fn": function(){
        clickMode(CLEAR);
        setup();
        clickMode(MOVE);
    }
};

modes[PLAY] = {
    "name": "Play!",
    "fn": function(){
        clickMode(DEFAULT);
        setModeActive(PLAY);
        playing = true;
        turn = WHITE;
    }
};

modes[ASDF] = {
    "name": "Test1",
    "fn": function(){
        //buildFromPieces();
    }
}

var clickMode = function(n) {
    resetGame();
    setModeActive(n);
    modes[n].fn();
    refreshBoard();
}

var clickUnit = function(n, _team) {
    unit = n;
    team = _team;
    setUnitActive(n, _team);
}

var generatePiece = function(n, rot, side) {
    var str = "";
    //<div class='piece' piece='"+n+"' rot='"+rot+"' side='"+side+"'>";

    for(i=0;i<2;i++) {
        str += "<div class='row'>";
        var extra = "<div class='tile hidden'></div>";
        //if(i == 0 && side == RIGHT)
        //    str += extra;
        for(var j=0;j<2;j++) {
            var index = i%2 * 2 + j;
            if(rot)
                index = 3 - index;
            //if you're on the right, and the top, flip the 2 cells
            //so 0 => 1, 1 => 0, 2 => 3, 3 => 2
            if(side == RIGHT)
                if(index % 2 == 0)
                    index++;
                else
                    index--;
            var type = terrains[pieces[n][side][index]];
            str += "<div class='tile "+type+"'><div class='top'></div><div class='bottom'></div></div>";
        }
        if(i == 0)
            str += extra;
        str += "</div>";
    }
    //str += "</div>";

    return str;
}

var setupMenus = function(){
    $('.list.modes').on('click', 'li', function(){
        var _mode = parseInt($(this).attr('mode'));
        clickMode(_mode);
    });

    $('.unitlist').on('click', '.tile', function(){
        var _unit = parseInt($(this).attr('unit'));
        var _team = parseInt($(this).attr('team'));
        clickUnit(_unit, _team);
    });

    $('.boardlist').on('click', '.piece', function(e){
        //flip the piece? rotate it?
        var _piece = parseInt($(this).attr("piece"));
        var _rot = $(this).attr("rot") == "true";
        var _side = $(this).attr("side");
        _rot = !_rot;
        if(_rot)
            _side = _side==LEFT ? RIGHT : LEFT;

        var newHTML = generatePiece(_piece, _rot, _side);
        $(this).replaceWith(newHTML);
    });

    for(var i=0;i<modes.length;i++) {
        var str = "<li mode="+i;
        str += ">"+modes[i].name+"</li>";
        $('.list.modes').append(str);
    }

    //unit list for game setup / maybe for add unit menu?
    var unitList = ["", ""];
    for(var j=0;j<2;j++) {
        unitList[j] += "<div class='row'>";
        for(i=0;i<units.length;i++) {
            var selected = "";
            unitList[j] += "<div unit='"+i+"' team='"+j+"' class='tile unit hidden "+colors[j]+" "+units[i].name+"'></div>";
        }
        unitList[j] += "</div>";
    }

    $('.unitlist').append(unitList[0]+unitList[1]).hide();
    setUnitActive(RABBLE, WHITE);
}

var refreshUnitMenu = function(){
    $('.unitlist .selected').removeClass('selected');
    $('.unitlist .transparent').removeClass('transparent');

    for(var i=0;i<10;i++) {
        if(unit == i)
            $('.unitlist .unit.'+colors[team]+'.'+units[i].name).addClass('selected');
        for(var j=0;j<2;j++)
            if(pieceCount[j][i] >= quota[i])
                $('.unitlist .unit.'+colors[j]+'.'+units[i].name).addClass('transparent');
    }
}

var refreshPieceMenu = function(){
    if(mode != TERRAIN) {
        $('.boardlist').html("");
        return;
    }
    //instead of left and right, current-side and opposite side
    //if we hover over a real piece and not selected, show its opposite
    //var currentSide = pieceSide(pieceHover);
    //if(selected)
    //    currentSide = pieceSide(pieceLocation);
    //var otherSide = currentSide==LEFT ? RIGHT : LEFT;

    //for the first part, _side is the side of the piece selected, it'll be LEFT if no piece selected
    var _side = pieceSide(pieceLocation)==LEFT ? RIGHT : LEFT;
    if(selected && pieceLocation < 8 && pieceLocation >= 0) {
        //if there's a piece that isn't invalid or castle that's selected
        var pieceId = orientation[pieceLocation];
        $('.boardlist.'+LEFT).html(generatePiece(pieceId, rotated[pieceLocation], _side)).show();
            flipPieceMenu(_side);
        $('.board .piece.floating').html(generatePiece(pieceId, rotated[pieceLocation], pieceSide(pieceLocation)));
    } else if(selected && pieceLocation == 8 && pieceHover >= 0) {
        //if the piece selected is the castle and we're hovering over a move
        var _side = LEFT;
        if(pieceHover < kingPos)
            _side = RIGHT;
        if(pieceHover != kingPos && pieceHover >= 0 && pieceHover != 8) {
            var str = "";
            if((_side == RIGHT && (kingPos == 1 || pieceHover == 0)) || (_side == LEFT && kingPos == 0)) {
                str += generatePiece(orientation[1], rotated[1], _side);
                str += generatePiece(orientation[5], rotated[5], _side);
            }
            if((_side == RIGHT && kingPos == 2) || (_side == LEFT && (kingPos == 1 || pieceHover == 2))) {
                str += generatePiece(orientation[2], rotated[2], _side);
                str += generatePiece(orientation[6], rotated[6], _side);
            }
            $('.boardlist.'+LEFT).html(str);
            flipPieceMenu(_side);
        }
    } else if(selected && pieceLocation == 8 && pieceHover == -1) {
        //this happens when castle is selected, and we're hovering over a non prospective castle move
        $('.boardlist').html("");
    }

    //for the second part, if we're hovering over something real
    _side = pieceSide(pieceHover)==LEFT ? RIGHT : LEFT;
    //if side is RIGHT, set boardlist left to 
    if(pieceHover >= 0 && pieceHover < 8) {
        if((!selected || pieceLocation != 8) && pieceHover < 8 && pieceHover >= 0) {
            var pieceId = orientation[pieceHover];
            $('.boardlist.'+LEFT).html(generatePiece(pieceId, rotated[pieceHover], _side)).show();
            flipPieceMenu(_side);
        } else if(!selected || pieceLocation != 8 && pieceHover >= 0 && pieceHover < 8) {
            $('.boardlist.'+LEFT).html("");
        }
    } else if(!selected) {
        //if hover is -1 and nothing is selected, clear everything
        $('.boardlist').html("");
    } else if(_side == pieceSide(pieceLocation) || pieceHover == 8 || pieceHover == -1) {
        $('.boardlist.'+LEFT).html("");
    }

    if((pieceLocation != 8 || !selected) && pieceHover >= 0) {
        var pieceId = orientation[pieceLocation];
        _side = pieceSide(pieceHover);
        if(selected)
            $('.board .piece.floating').html(generatePiece(pieceId, rotated[pieceLocation], _side));
        if(pieceHover == 8 || pieceSide(pieceHover) == RIGHT) {
            $('.board .piece.floating').addClass('flipped');
            //generate otherside
        } else {
            $('.board .piece.floating').removeClass('flipped');
        }
        if(pieceSide(pieceHover) == pieceSide(pieceLocation))
            $('.board .piece.floating').addClass('transparent');
        else
            $('.board .piece.floating').removeClass('transparent');
    }
    if(!selected) {
        $('.board .piece.floating').html("");
    }

    //remove the right list entirely
    //$('.boardlist.'+RIGHT).html("");
}

var flipPieceMenu = function(_side) {
    if(_side == LEFT)
        $('.boardlist.left').removeClass('flipped');
    else
        $('.boardlist.left').addClass('flipped');
}

var refreshLegend = function(){
    if(!selected) {
        $('.legend').html("");
        return;
    }

    var tile = board[sY][sX];
    var unitId = tile.unitId;
    var info = units[unitId];
    var bio = bios[unitId];

    var str = info.title+"<br/>Move: "+info.move+"<br/>Engage: "+info.engage+"<br/>Armor: "+info.armor+"<br/>"+bio;
    $('.legend').html(str);
}