//state variables for game/ui
var playing = false;
var turn = WHITE;
var selected = false;
var sX = 0;
var sY = 0;
var rabbleMoved = false;
var rabbleX = -1;
var rabbleY = -1;

var pieceLocation = -1;
var pieceHover = -1;
var pieceHoverChanged = false;

var pieceCount = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

//setup and state variables
var board = [];
for(var i=0;i<9;i++) {
    board[i] = [];
    for(var j=0;j<Math.min(i,8-i)+8;j++) {
        board[i][j] = {
            "x": j,
            "y": i,
            "unit": "none",
            "unitId": -1,
            
            "color": "none",
            "team": -1,
            
            "move": -1,
            "armor": -1,
            "engage": -1,
            
            "terrain": "grass",
            "terrainId": 0,
            
            "selected": false,
            "hinder": false,
            "block": false,
            "engaged_by": 0,
            "occupied": false,
            "no_engage": false,
            "walkable": false,
            "capture": false,
            "target": [-1, -1]
        };
    }
}

//switch turns
var switchTurns = function(){
    //clearFlagClasses();
    rabbleMoved = false;
    selected = false;
    turn = 1 - turn;

    //ui
    //$('.board').toggleClass('flipped');
}

var setTerrain = function(x, y, n) {
    //var tile = getTile(x, y);
    var cell = board[y][x];
    clearCell(x, y);
    var old = cell.terrainId;
    cell.terrainId = n;
    cell.terrain = terrains[cell.terrainId];

    //ui
    //tile.removeClass(terrains[old]);
    //tile.addClass(terrains[n]);
}

var addUnit = function(x, y, n, t) {
    var cell = board[y][x];
    clearCell(x, y);

    if(cell.unitId == -1 && cell.terrainId != MOUNTAINS) {
        cell.x = x;
        cell.y = y;
        cell.unitId = n;
        cell.unit = units[n].name;
        
        cell.team = t;
        cell.color = colors[cell.team];
        
        cell.move = units[n].move;
        cell.armor = units[n].armor;
        cell.engage = units[n].engage;

        pieceCount[t][n]++;

        //ui 
        //var tile = getTile(x, y);
        //tile.addClass("unit");
        //tile.addClass(cell.unit);
        //tile.addClass(cell.color);
    }
}

var copyUnit = function(x1, y1, x2, y2) {
    var cell = board[y1][x1];
    
    clearCell(x2, y2);
    addUnit(x2, y2, cell.unitId, cell.team);
}

var clearCell = function(x, y) {
    //var tile = getTile(x, y);
    var cell = board[y][x];
    if(cell.unitId >= 0)
        pieceCount[cell.team][cell.unitId]--;
    
    cell.unitId = -1;
    cell.unit = "none";
    
    cell.team = -1;
    cell.color = "none";
    
    cell.move = cell.armor = cell.engage = -1;

    //ui
    //tile.removeClass("unit");
    //tile.removeClass(cell.unit);
    //tile.removeClass(cell.color);
}

var clearTerrain = function(){
    for(var i=0;i<9;i++) {
        for(var j=0;j<Math.min(i,8-i)+8;j++) {
            setTerrain(j, i, GRASS);
        }
    }
}

var buildFromPieces = function(){
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
}