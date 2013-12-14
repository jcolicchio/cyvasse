var RABBLE = 0;
var SPEARS = 1;
var LHORSE = 2;
var HHORSE = 3;
var CROSSBOW = 4;
var TREB = 5;
var ELEPHANT = 6;
var DRAGON = 7;
var TOWER = 8;
var KING = 9;

var WHITE = 0;
var BLACK = 1;

var GRASS = 0;
var MOUNTAINS = 1;
var WATER = 2;
var CASTLE = 3;

var LEFT = "left";
var RIGHT = "right";

var units = [
{"name":"rabble",  "title":"Rabble",     "move":1,"armor":1,"engage":1},
{"name":"spears",  "title":"Spears",     "move":1,"armor":1,"engage":1},
{"name":"lhorse",  "title":"Light Horse","move":3,"armor":1,"engage":1},
{"name":"hhorse",  "title":"Heavy Horse","move":2,"armor":2,"engage":1},
{"name":"crossbow","title":"Crossbow",   "move":2,"armor":0,"engage":3},
{"name":"treb",    "title":"Trebuchet",  "move":1,"armor":0,"engage":4},
{"name":"elephant","title":"Elephant",   "move":1,"armor":2,"engage":2},
{"name":"dragon",  "title":"Dragon",     "move":4,"armor":2,"engage":2},
{"name":"tower",   "title":"Tower",      "move":0,"armor":2,"engage":1},
{"name":"king",    "title":"King",       "move":1,"armor":1,"engage":1}
];

var bios = [
	"Rabble are like pawns, move 1, engage 1, but if you move a rabble without capturing, you can optionally move a second one on your turn. If you don't want to, click the rabble again to end your turn.",
	"Spears can only engage or capture the 2 spaces in front of them. However, enemies that enter this cell have to stop there, they can't keep moving through, even to capture the spear.",
	"Light horses can capture an enemy in a straight line, and keep going \"through\" the enemy, up to their full movement range.",
	"Heavy horses can capture an enemy in a straight line, and keep going \" through \" the enemy, up to their full movement range.",
	"Crossbows have a high engage range, but cannot capture an enemy on their own. Another piece must make the capture.",
	"Trebuchets must engage the unit they wish to capture. They cannot engage a unit 1 tile away, their range is 2-4. The path between them must be clear of enemies or mountains. They must also have 1 space available to move backwards as they capture.",
	"Elephants have a move range of 1, but can move 2 to capture if the cell in between them and an enemy is empty and not a mountain.",
	"Dragons can move over mountains and enemy units as if they were allies.",
	"Towers can't move, but any enemy in a tile next to your tower is prevented from engaging any non-tower units.",
	"If the king is next to a tower, the king can jump over the castle to the other side, as long as the other tile is empty, or there's an enemy that the king can legally capture."
];

var quota = [6, 3, 3, 2, 2, 1, 2, 1, 2, 1];
var colors = ["white", "black"];
var terrains = ["grass", "mountain", "water", "castle"];

var pieces = [
	{
		"left": [MOUNTAINS, GRASS, GRASS, MOUNTAINS],
		"right": [GRASS, MOUNTAINS, GRASS, GRASS]
	},
	{
		"left": [MOUNTAINS, GRASS, GRASS, GRASS],
		"right": [WATER, GRASS, GRASS, GRASS]
	},
	{
		"left": [MOUNTAINS, GRASS, GRASS, GRASS],
		"right": [GRASS, GRASS, GRASS, GRASS]
	},
	{
		"left": [GRASS, GRASS, GRASS, GRASS],
		"right": [GRASS, GRASS, GRASS, GRASS]
	},
	{
		"left": [WATER, WATER, GRASS, GRASS],
		"right": [WATER, GRASS, GRASS, GRASS]
	},
	{
		"left": [GRASS, WATER, GRASS, GRASS],
		"right": [GRASS, MOUNTAINS, GRASS, GRASS]
	},
	{
		"left": [GRASS, WATER, GRASS, GRASS],
		"right": [GRASS, GRASS, GRASS, GRASS]
	},
	{
		"left": [GRASS, GRASS, GRASS, GRASS],
		"right": [GRASS, GRASS, GRASS, GRASS]
	}
];