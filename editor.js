var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.equals = function (other) {
        return (this.x === other.x && this.y === other.y);
    };
    Point.fromTarget = function (target) {
        return new Point(parseInt(target.dataset.left), parseInt(target.dataset.top));
    };
    return Point;
})();
var Rect = (function () {
    function Rect(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
    return Rect;
})();
var DOM;
(function (DOM) {
    function createTable(rows, cols, headrows, headcols) {
        var table = document.createElement("table");
        for (var i = 0; i < headrows; ++i) {
            var row = document.createElement("tr");
            for (var j = 0; j < cols + headcols; ++j) {
                var col = document.createElement("th");
                row.appendChild(col);
            }
            table.appendChild(row);
        }
        for (var i = 0; i < rows; ++i) {
            var row = document.createElement("tr");
            for (var j = 0; j < headcols; ++j) {
                var col = document.createElement("th");
                row.appendChild(col);
            }
            for (var j = 0; j < cols; ++j) {
                var col = document.createElement("td");
                row.appendChild(col);
            }
            table.appendChild(row);
        }
        return table;
    }
    DOM.createTable = createTable;
})(DOM || (DOM = {}));
/// <reference path="utilities.ts"/>
var TableGrid;
(function (TableGrid) {
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
    function generate(table) {
        var accumulator = new Array(table.rows.length);
        var indexes = new Array(table.rows.length);
        for (var i = 0; i < accumulator.length; ++i) {
            accumulator[i] = new Array();
            indexes[i] = 0;
        }
        for (var row = smallestIndex(accumulator); !(row === 0 && emptyTable(table, indexes)); row = smallestIndex(accumulator)) {
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
                accumulator[i][j].dataset["top"] = i;
                accumulator[i][j].dataset["left"] = j;
            }
        }
        return accumulator;
    }
    function min(x, y) {
        return x < y ? x : y;
    }
    function max(x, y) {
        return x > y ? x : y;
    }
    var Grid = (function () {
        function Grid(table) {
            if (table instanceof HTMLTableElement) {
                this._table = table;
            }
            else if (typeof table === "string") {
                var maybe_table = document.querySelector(table);
                if (maybe_table instanceof HTMLTableElement) {
                    this._table = maybe_table;
                }
                else {
                    throw String(table) + " is not a table or queryable table";
                }
            }
            this.update();
        }
        Grid.prototype.update = function () {
            this._grid = generate(this._table);
        };
        Grid.prototype.get = function () {
            if (arguments.length === 1) {
                var p = arguments[0];
                return this._grid[p.y][p.x];
            } // otherwise x and y
            var x = arguments[0];
            var y = arguments[1];
            return this._grid[y][x];
        };
        Grid.prototype.select = function (rect) {
            var p1 = rect.p1, p2 = rect.p2;
            var left = Math.min(p1.x, p2.x), top = Math.min(p1.y, p2.y), bottom = Math.max(p1.y, p2.y), right = Math.max(p1.x, p2.x);
            for (var i = left; i <= right; ++i) {
                for (var j = top; j <= bottom; ++j) {
                    this.get(i, j).classList.add("selected");
                }
            }
        };
        Grid.prototype.deselect = function (rect) {
            var p1 = rect.p1, p2 = rect.p2;
            var left = Math.min(p1.x, p2.x), top = Math.min(p1.y, p2.y), bottom = Math.max(p1.y, p2.y), right = Math.max(p1.x, p2.x);
            for (var i = left; i <= right; ++i) {
                for (var j = top; j <= bottom; ++j) {
                    this.get(i, j).classList.remove("selected");
                }
            }
        };
        Object.defineProperty(Grid.prototype, "width", {
            get: function () {
                return this._grid[0].length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Grid.prototype, "height", {
            get: function () {
                return this._grid.length;
            },
            enumerable: true,
            configurable: true
        });
        return Grid;
    })();
    TableGrid.Grid = Grid;
})(TableGrid || (TableGrid = {}));
/// <reference path="mousetrap.d.ts"/>
/// <reference path="utilities.ts"/>
/// <reference path="table_grid.ts"/>
var Table = (function () {
    function Table(parent, rows, cols, headrows, headcols) {
        var _this = this;
        this._a = null;
        this._b = null;
        this.old_a = null;
        this.old_b = null;
        this._state = 0;
        this.__focus = false;
        this.__position = new Point(0, 0);
        this._table = DOM.createTable(rows, cols, headrows, headcols);
        this._table.id = "datatable";
        if (parent !== null) {
            parent.appendChild(this._table);
        }
        this.grid = new TableGrid.Grid(this._table);
        // mousedown in table
        this._table.addEventListener("mousedown", function (e) {
            switch (_this.state) {
                case 0:
                    _this.a = Point.fromTarget(e.target);
                    _this.state = 1;
                    break;
                case 2:
                    if (e.target === _this.grid.get(_this.a)) {
                        _this.state = 6;
                    }
                    else {
                        _this.a = Point.fromTarget(e.target);
                        _this.state = 1;
                    }
                    break;
                case 4:
                    _this.b = null;
                    _this.a = Point.fromTarget(e.target);
                    _this.state = 1;
                    break;
                case 5:
                    if (e.target !== _this.grid.get(_this.a)) {
                        _this.a = Point.fromTarget(e.target);
                        _this.state = 1;
                    }
            }
            e.stopPropagation();
        });
        this._table.addEventListener("mousemove", function (e) {
            switch (_this.state) {
                case 6:
                    _this.state = 1;
            }
        });
        // off table listener
        document.addEventListener("mousedown", function (e) {
            switch (_this.state) {
                case 0:
                case 2:
                case 4:
                case 5:
                    _this.state = 0;
            }
        });
        this._table.addEventListener("mouseup", function (e) {
            switch (_this.state) {
                case 1:
                    _this.state = 2;
                    break;
                case 3:
                    _this.state = 4;
                    break;
                case 6:
                    _this.state = 5;
                    break;
            }
            e.stopPropagation();
        });
        this._table.addEventListener("mouseout", function (e) {
            switch (_this.state) {
                case 1:
                    var t = Point.fromTarget(e.target);
                    console.log("mouseOut: target(" + t.x + ", " + t.y + ") a(" + _this.a.x + ", " + _this.a.y + ")");
                    console.log(Point.fromTarget(e.target).equals(_this.a));
                    //                if (e.target === this.grid.get(this.a)) {
                    if (Point.fromTarget(e.target).equals(_this.a)) {
                        _this.b = Point.fromTarget(e.relatedTarget);
                        _this.state = 3;
                    }
            }
            e.stopPropagation();
        });
        this._table.addEventListener("mouseover", function (e) {
            switch (_this.state) {
                case 3:
                    if (e.target == _this.grid.get(_this.a)) {
                        _this.b = null;
                        _this.state = 1;
                    }
                    else {
                        if (e.target === null) {
                        }
                        _this.b = Point.fromTarget(e.target);
                    }
            }
            e.stopPropagation();
        });
        document.addEventListener("keypress", function (e) {
            switch (_this.state) {
                case 2:
                    //                var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
                    //                this.grid.get(this.a).textContent = String.fromCharCode(charCode);
                    _this.state = 5;
            }
        });
        Mousetrap.bind("esc", function (e) {
            switch (_this.state) {
                case 5:
                    console.log("escape!");
                    _this.state = 2;
                    return false;
            }
        });
        Mousetrap.bind("tab", function (e) {
            switch (_this.state) {
                case 5:
                    _this.state = 2;
                    _this.a = new Point(_this.a.x + 1, _this.a.y);
                    return false;
            }
        });
        Mousetrap.bind("enter", function (e) {
            switch (_this.state) {
                case 5:
                    _this.state = 2;
                    _this.a = new Point(_this.a.x, _this.a.y + 1);
                    return false;
            }
        });
        var __this = this;
        Mousetrap.bind("left", function (e) {
            switch (_this.state) {
                case 4:
                    _this.b = null;
                    _this.state = 2;
                case 2:
                    _this.a = new Point(_this.a.x - 1, _this.a.y);
                    return false;
            }
            return true;
        });
        Mousetrap.bind("up", function (e) {
            switch (_this.state) {
                case 4:
                    _this.b = null;
                    _this.state = 2;
                case 2:
                    _this.a = new Point(_this.a.x, _this.a.y - 1);
                    return false;
            }
            return true;
        });
        Mousetrap.bind("down", function (e) {
            switch (_this.state) {
                case 4:
                    _this.b = null;
                    _this.state = 2;
                case 2:
                    _this.a = new Point(_this.a.x, _this.a.y + 1);
                    return false;
            }
            return true;
        });
        Mousetrap.bind("right", function (e) {
            switch (_this.state) {
                case 4:
                    _this.b = null;
                    _this.state = 2;
                case 2:
                    _this.a = new Point(_this.a.x + 1, _this.a.y);
                    return false;
            }
            return true;
        });
        Mousetrap.bind("shift+left", function (e) {
            switch (_this.state) {
                case 2:
                    _this.b = new Point(_this.a.x - 1, _this.a.y);
                    _this.state = 4;
                    return false;
                case 4:
                    _this.b = new Point(_this.b.x - 1, _this.b.y);
                    if (_this.b.equals(_this.a)) {
                        _this.b = null;
                        _this.state = 2;
                    }
                    return false;
            }
            return true;
        });
        Mousetrap.bind("shift+up", function (e) {
            switch (_this.state) {
                case 2:
                    _this.b = new Point(_this.a.x, _this.a.y - 1);
                    _this.state = 4;
                    return false;
                case 4:
                    _this.b = new Point(_this.b.x, _this.b.y - 1);
                    if (_this.b.equals(_this.a)) {
                        _this.b = null;
                        _this.state = 2;
                    }
                    return false;
            }
            return true;
        });
        Mousetrap.bind("shift+down", function (e) {
            switch (_this.state) {
                case 2:
                    _this.b = new Point(_this.a.x, _this.a.y + 1);
                    _this.state = 4;
                    return false;
                case 4:
                    _this.b = new Point(_this.b.x, _this.b.y + 1);
                    if (_this.b.equals(_this.a)) {
                        _this.b = null;
                        _this.state = 2;
                    }
                    return false;
            }
            return true;
        });
        Mousetrap.bind("shift+right", function (e) {
            switch (_this.state) {
                case 2:
                    _this.b = new Point(_this.a.x + 1, _this.a.y);
                    _this.state = 4;
                    return false;
                case 4:
                    _this.b = new Point(_this.b.x + 1, _this.b.y);
                    if (_this.b.equals(_this.a)) {
                        _this.b = null;
                        _this.state = 2;
                    }
                    return false;
            }
            return true;
        });
        Mousetrap.bind(["delete", "backspace"], function (e) {
            switch (_this.state) {
                case 2:
                    _this.grid.get(_this.a).textContent = "";
                    return false;
                case 4:
                    var cells = _this._table.querySelectorAll(".selected");
                    for (var i = 0; i < cells.length; ++i) {
                        cells.item(i).textContent = "";
                    }
                    return false;
            }
        });
    }
    Object.defineProperty(Table.prototype, "a", {
        get: function () {
            return this._a;
        },
        set: function (value) {
            if (value === null) {
                this.old_a = this._a;
                if (this.old_a !== null) {
                    this.grid.get(this.old_a).classList.remove("selected");
                }
                this._a = null; // clearing
            }
            else {
                if (value.x >= this.grid.width) {
                    value.x = this.grid.width - 1;
                }
                if (value.y >= this.grid.height) {
                    value.y = this.grid.height - 1;
                }
                if (value.x < 0) {
                    value.x = 0;
                }
                if (value.y < 0) {
                    value.y = 0;
                }
                this.old_a = this.a;
                this._a = value;
                if (this.old_a !== null) {
                    this.grid.get(this.old_a).classList.remove("selected");
                }
                this.grid.get(this.a).classList.add("selected");
                console.log("a = " + value.x + ", " + value.y);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "state", {
        get: function () {
            return this._state;
        },
        set: function (value) {
            this.onStateChange(this._state, value);
            this._state = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "b", {
        get: function () {
            return this._b;
        },
        set: function (value) {
            if (value === null) {
                this.old_b = this._b;
                this._b = null;
                if (this.old_b !== null) {
                    this.grid.deselect(new Rect(this.a, this.old_b));
                }
                this.a = this.a; // make sure we are still selected
            }
            else {
                if (value.x >= this.grid.width) {
                    value.x = this.grid.width - 1;
                }
                if (value.y >= this.grid.height) {
                    value.y = this.grid.height - 1;
                }
                if (value.x < 0) {
                    value.x = 0;
                }
                if (value.y < 0) {
                    value.y = 0;
                }
                this.old_b = this._b;
                this._b = value;
                // this is 'quick and dirty', could use proper dirty rectangles
                if (this.old_b !== null) {
                    this.grid.deselect(new Rect(this._a, this.old_b));
                }
                this.grid.select(new Rect(this.a, this.b));
            }
        },
        enumerable: true,
        configurable: true
    });
    Table.prototype.deselectAll = function () {
        for (var i = 0; i < this.grid.height; ++i) {
            for (var j = 0; j < this.grid.width; ++j) {
                this.grid.get(j, i).classList.remove("selected");
            }
        }
    };
    Table.prototype.onStateChange = function (from, to) {
        if (from === 0 && to === 1) {
            this._table.classList.add("selected");
            //            this.grid.get(this.a).classList.add("selected");
            return;
        }
        if (from === 1 && to === 2) {
            // nothing to do, because 1 already selected a
            return;
        }
        if (from === 2 && to === 1) {
        }
        if (from === 2 && to === 6) {
        }
        if (from === 6 && to === 5) {
            var element = this.grid.get(this.a);
            element.contentEditable = "true";
            element.focus();
        }
        if (from === 2 && to === 5) {
            var element = this.grid.get(this.a);
            element.textContent = "";
            element.contentEditable = "true";
            element.focus();
        }
        if (from === 5 && to === 2) {
            var element = this.grid.get(this.a);
            element.contentEditable = "false";
            element.blur();
        }
        if (from === 5 && to === 1) {
            var element = this.grid.get(this.old_a);
            element.contentEditable = "false";
            element.blur();
        }
        if (to === 0) {
            this.a = null;
            this.deselectAll();
            this._table.classList.remove("selected");
        }
    };
    return Table;
})();
/// <reference path="utilities.ts"/>
/// <reference path="table.ts"/>
var Editor;
(function (Editor) {
    function _start() {
        var table = new Table(document.querySelector(".table_div"), 6, 6, 1, 1);
        console.log("Table Selector Start");
    }
    Editor._start = _start;
})(Editor || (Editor = {}));
document.addEventListener("DOMContentLoaded", Editor._start);
//# sourceMappingURL=editor.js.map