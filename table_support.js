var TableGrid = (function() {


    // emptyTable :: [[Node]] -> [Int] -> Boolean
    function emptyTable(table, indexes) {
        for (var i = 0; i < table.rows.length; ++i) {
            if (indexes[i] !== table.rows.item(i).cells.length)
                return false;
        }

        return true;
    }

    // smallest_index :: [[Node]] -> Int
    function smallestIndex(accumulator) {
        'use strict';

        // find the first smallest index in accumulator

        if (accumulator.length === 0)
            throw "Empty accumulator";

        var i = 0;
        var length = accumulator[0].length;

        for (var index = 1; index < accumulator.length; ++index) {
            if (accumulator[index].length < length) {
                length = accumulator[index].length;
                i = index;
            }
        }

        return i;
    }

    var generate = function(table) {
        var accumulator = new Array(table.rows.length);
        var indexes = new Array(table.rows.length);

        for (var i = 0; i < accumulator.length; ++i) {
            accumulator[i] = new Array();
            indexes[i] = 0;
        }

        // indexes represents what index per row of the table we are on
        for (var row = smallestIndex(accumulator); !(row === 0 && emptyTable(
                table, indexes)); row = smallestIndex(accumulator)) {

            var cell = table.rows.item(row).cells.item(indexes[row]);
            indexes[row]++;

            for (var i = row; i < row + cell.rowSpan; ++i) {
                for (var j = 0; j < cell.colSpan; ++j) {
                    accumulator[i].push(cell);
                }
            }
        }

        for (var i = 0; i < accumulator.length; ++i) {
            for (var j = 0; j < accumulator[i].length; ++j) {
                var cell = accumulator[i][j];

                if (i > 0) {
                    if (cell == accumulator[i - 1][j])
                        continue;
                }

                if (j > 0) {
                    if (cell == accumulator[i][j - 1])
                        continue;
                }

                accumulator[i][j].dataset.top = i;
                accumulator[i][j].dataset.left = j;
            }
        }

        return accumulator;
    }

    var min = function(x, y) {
        return x < y ? x : y;
    };

    var max = function(x, y) {
        return x > y ? x : y;
    };

    var select = function(grid, x1, y1, x2, y2) {
        clear_select(grid);
        var a1 = self.min(x1, x2);
        var a2 = self.max(x1, x2);
        var b1 = self.min(y1, y2);
        var b2 = self.max(y1, y2);
        for (var i = b1; i <= b2; ++i) {
            for (var j = a1; j <= a2; ++j) {
                grid[i][j].classList.add("selected");
            }
        }
    };



    
    var self = function(table) {
        this.table = table;

        this.update = function() {
            this.grid = generate(this.table);
        }
        
        this.update();
        
        this.get = function(x, y) {
            if (arguments.length === 1) {   // assume pair
                return this.grid[arguments[0].y][arguments[0].x];
            } // otherwise x and y
            return this.grid[y][x];
        };
        
        this.select = function(rect) {
            if (rect instanceof Rect) {
                var p1 = rect.p1,
                    p2 = rect.p2;
                
                var left = Math.min(p1.x, p2.x),
                    top = Math.min(p1.y, p2.y),
                    bottom = Math.max(p1.y, p2.y),
                    right = Math.max(p1.x, p2.x);
                
                for (var i = left; i <= right; ++i) {
                    for (var j = top; j <= bottom; ++j) {
                        this.get(i, j).classList.add("selected");
                    }
                }
            } else {
                throw "select only works with Rect";
            }
        }
        
        this.deselect = function(rect) {
            if (rect instanceof Rect) {
                var p1 = rect.p1,
                    p2 = rect.p2;
                
                var left = Math.min(p1.x, p2.x),
                    top = Math.min(p1.y, p2.y),
                    bottom = Math.max(p1.y, p2.y),
                    right = Math.max(p1.x, p2.x);
                
                for (var i = left; i <= right; ++i) {
                    for (var j = top; j <= bottom; ++j) {
                        this.get(i, j).classList.remove("selected");
                    }
                }
            } else {
                throw "deselect only works with Rect";
            }
        }

        
        Object.defineProperty(this, "width", {
            get: function() {
                return this.grid[0].length;
            }
        });
        
        Object.defineProperty(this, "height", {
            get: function() {
                return this.grid.length;
            }
        });
    }
    
    return self;
})();