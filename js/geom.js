//fetch the x coordinates of the two cells above x, y
var twoAbove = function(x, y) {
    if(y > 4) {
        return [x, x+1.0];
    } else {
        return [x-1.0, x];
    }
}
var twoBelow = function(x, y) {
    if(y < 4) {
        return [x, x+1.0];
    } else {
        return [x-1.0, x];
    }
}
//given two points, return all coords on a line
//unless they arent in a line, in which case, return []
var lineBetween = function(x1, y1, x2, y2) {
    var r = [];
    var i, j;
    if(y1 == y2) {
        if(x1 < x2) {
            for(i=x1;i<=x2;i++)
                r.push([i, y1]);
        } else {
            for(i=x1;i>=x2;i--)
                r.push([i, y1]);
        }
        return r;
    } else if(y1 > y2) {
        //we're going up, from y1 to y2, it gets smaller
        var times = y1 - y2 - 1;
        var up = twoAbove(x1, y1);
        var a = [[x1, y1], [up[0], y1-1]];
        var b = [[x1, y1], [up[1], y1-1]];
        for(i=0;i<times;i++) {
            var out = project(a[i][0], a[i][1], a[i+1][0], a[i+1][1]);
            a.push([out[0], out[1]]);
            out = project(b[i][0], b[i][1], b[i+1][0], b[i+1][1]);
            b.push([out[0], out[1]]);
        }
        if(a[times+1][0] == x2 && a[times+1][1] == y2)
            return a;
        else if(b[times+1][0] == x2 && b[times+1][1] == y2)
            return b;
        else
            return [];
    } else if(y1 < y2) {
        var times = y2 - y1 - 1;
        var down = twoBelow(x1, y1);
        var a = [[x1, y1], [down[0], y1+1]];
        var b = [[x1, y1], [down[1], y1+1]];
        for(i=0;i<times;i++) {
            var out = project(a[i][0], a[i][1], a[i+1][0], a[i+1][1]);
            a.push([out[0], out[1]]);
            out = project(b[i][0], b[i][1], b[i+1][0], b[i+1][1]);
            b.push([out[0], out[1]]);
        }
        if(a[times+1][0] == x2 && a[times+1][1] == y2)
            return a;
        else if(b[times+1][0] == x2 && b[times+1][1] == y2)
            return b;
        else
            return [];
    }
}
//given two points on a line, return the third point
var project = function(x1, y1, x2, y2) {
    if(y1 == y2) {
        if(x1 > x2)
            return [x2-1, y1];
        else
            return [x2+1, y1];
    } else if(y1 > y2) {
        var up = twoAbove(x2, y2);
        var up2 = twoAbove(x1, y1);
        if(up2[0] == x2)
            return[up[0], y2-1];
        else
            return[up[1], y2-1];
    } else if(y1 < y2) {
        var down = twoBelow(x2, y2);
        var down2 = twoBelow(x1, y1);
        if(down2[0] == x2)
            return[down[0], y2+1];
        else
            return[down[1], y2+1];
    }
}
//return if the spot is valid for a 9, min(y,8-y)+8 grid
var valid = function(x, y) {
    return (y >= 0 && y < 9 && x >= 0 && x < Math.min(y, 8-y)+8);
}