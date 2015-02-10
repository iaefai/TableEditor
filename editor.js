var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.equals = function (other) {
        return (this.x === other.x && this.y === other.y);
    };
    Point.fromTarget = function (target) {
        var element;
        if (target instanceof HTMLSpanElement) {
            element = target.parentElement;
        }
        else if (target instanceof HTMLTableCellElement) {
            element = target;
        }
        else {
            throw "Point::fromTarget: Not a Div or TableCell";
        }
        return new Point(parseInt(element.dataset["left"]), parseInt(element.dataset["top"]));
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
                var col = document.createElement("td");
                var div = document.createElement("span");
                col.appendChild(div);
                row.appendChild(col);
            }
            table.appendChild(row);
        }
        for (var i = 0; i < rows; ++i) {
            var row = document.createElement("tr");
            for (var j = 0; j < headcols; ++j) {
                var col = document.createElement("td");
                var div = document.createElement("span");
                col.appendChild(div);
                row.appendChild(col);
            }
            for (var j = 0; j < cols; ++j) {
                var col = document.createElement("td");
                var div = document.createElement("span");
                col.appendChild(div);
                row.appendChild(col);
            }
            table.appendChild(row);
        }
        return table;
    }
    DOM.createTable = createTable;
    function forall(nodes, f) {
        for (var i = 0; i < nodes.length; ++i) {
            f(nodes.item(i));
        }
    }
    DOM.forall = forall;
    function cell() {
        return document.createElement("td");
    }
    DOM.cell = cell;
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
/// <references path="table.ts"/>
var TableEvents = (function () {
    function TableEvents(table) {
        var _this = this;
        this.table = table;
        // mousedown in table
        this.table.tableElement.addEventListener("mousedown", function (e) {
            if (e.target instanceof HTMLTableElement) {
                return;
            }
            if (e.button !== 0)
                return; // left button only
            switch (_this.table.state) {
                case 0:
                    _this.table.a = Point.fromTarget(e.target);
                    _this.table.state = 1;
                    break;
                case 2:
                    if (e.target === _this.table.grid.get(_this.table.a)) {
                        _this.table.state = 6;
                    }
                    else {
                        _this.table.a = Point.fromTarget(e.target);
                        _this.table.state = 1;
                    }
                    break;
                case 4:
                    _this.table.b = null;
                    _this.table.a = Point.fromTarget(e.target);
                    _this.table.state = 1;
                    break;
                case 5:
                    if (e.target !== _this.table.grid.get(_this.table.a)) {
                        _this.table.a = Point.fromTarget(e.target);
                        _this.table.state = 1;
                    }
            }
            e.stopPropagation();
        });
        this.table.tableElement.addEventListener("mousemove", function (e) {
            switch (_this.table.state) {
                case 6:
                    _this.table.state = 1;
            }
        });
        this.table.tableElement.addEventListener("contextmenu", function (e) {
            console.log("context menu in state " + _this.table.state);
            switch (_this.table.state) {
                case 2:
                case 4:
                    _this.table.contextMenu(new Point(e.clientX, e.clientY));
                    e.preventDefault();
                    return;
            }
        });
        // off table listener
        document.addEventListener("mousedown", function (e) {
            if (e.button !== 0)
                return; // left button only
            switch (_this.table.state) {
                case 0:
                case 2:
                case 4:
                case 5:
                    _this.table.state = 0;
            }
        });
        this.mouseUpEvent = function (e) {
            if (e.button !== 0)
                return; // left button only
            switch (_this.table.state) {
                case 1:
                    _this.table.state = 2;
                    break;
                case 3:
                    _this.table.state = 4;
                    break;
                case 6:
                    _this.table.state = 5;
                    break;
            }
            e.stopPropagation();
        };
        this.table.tableElement.addEventListener("mouseup", this.mouseUpEvent);
        this.table.tableElement.addEventListener("mouseout", function (e) {
            switch (_this.table.state) {
                case 1:
                    var t = Point.fromTarget(e.target);
                    console.log("mouseOut: target(" + t.x + ", " + t.y + ") a(" + _this.table.a.x + ", " + _this.table.a.y + ")");
                    console.log(Point.fromTarget(e.target).equals(_this.table.a));
                    //                if (e.target === this.table.grid.get(this.table.a)) {
                    if (Point.fromTarget(e.target).equals(_this.table.a)) {
                        _this.table.b = Point.fromTarget(e.relatedTarget);
                        _this.table.state = 3;
                    }
            }
            e.stopPropagation();
        });
        this.table.tableElement.addEventListener("mouseover", function (e) {
            if (e.target instanceof HTMLTableElement) {
                return;
            }
            switch (_this.table.state) {
                case 3:
                    if (e.target == _this.table.grid.get(_this.table.a)) {
                        _this.table.b = null;
                        _this.table.state = 1;
                    }
                    else {
                        if (e.target === null) {
                        }
                        _this.table.b = Point.fromTarget(e.target);
                    }
            }
            e.stopPropagation();
        });
        document.addEventListener("keypress", function (e) {
            switch (_this.table.state) {
                case 2:
                    //                var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
                    //                this.table.grid.get(this.table.a).textContent = String.fromCharCode(charCode);
                    _this.table.state = 5;
            }
        });
        Mousetrap.bind("esc", function (e) {
            switch (_this.table.state) {
                case 5:
                    console.log("escape!");
                    _this.table.state = 2;
                    return false;
            }
        });
        Mousetrap.bind("tab", function (e) {
            switch (_this.table.state) {
                case 5:
                    _this.table.state = 2;
                    _this.table.a = new Point(_this.table.a.x + 1, _this.table.a.y);
                    return false;
            }
        });
        Mousetrap.bind("enter", function (e) {
            switch (_this.table.state) {
                case 5:
                    _this.table.state = 2;
                    _this.table.a = new Point(_this.table.a.x, _this.table.a.y + 1);
                    return false;
            }
        });
        var __this = this;
        Mousetrap.bind("left", function (e) {
            switch (_this.table.state) {
                case 4:
                    _this.table.b = null;
                    _this.table.state = 2;
                case 2:
                    _this.table.a = new Point(_this.table.a.x - 1, _this.table.a.y);
                    return false;
            }
            return true;
        });
        Mousetrap.bind("up", function (e) {
            switch (_this.table.state) {
                case 4:
                    _this.table.b = null;
                    _this.table.state = 2;
                case 2:
                    _this.table.a = new Point(_this.table.a.x, _this.table.a.y - 1);
                    return false;
            }
            return true;
        });
        Mousetrap.bind("down", function (e) {
            switch (_this.table.state) {
                case 4:
                    _this.table.b = null;
                    _this.table.state = 2;
                case 2:
                    _this.table.a = new Point(_this.table.a.x, _this.table.a.y + 1);
                    return false;
            }
            return true;
        });
        Mousetrap.bind("right", function (e) {
            switch (_this.table.state) {
                case 4:
                    _this.table.b = null;
                    _this.table.state = 2;
                case 2:
                    _this.table.a = new Point(_this.table.a.x + 1, _this.table.a.y);
                    return false;
            }
            return true;
        });
        Mousetrap.bind("shift+left", function (e) {
            switch (_this.table.state) {
                case 2:
                    _this.table.b = new Point(_this.table.a.x - 1, _this.table.a.y);
                    _this.table.state = 4;
                    return false;
                case 4:
                    _this.table.b = new Point(_this.table.b.x - 1, _this.table.b.y);
                    if (_this.table.b.equals(_this.table.a)) {
                        _this.table.b = null;
                        _this.table.state = 2;
                    }
                    return false;
            }
            return true;
        });
        Mousetrap.bind("shift+up", function (e) {
            switch (_this.table.state) {
                case 2:
                    _this.table.b = new Point(_this.table.a.x, _this.table.a.y - 1);
                    _this.table.state = 4;
                    return false;
                case 4:
                    _this.table.b = new Point(_this.table.b.x, _this.table.b.y - 1);
                    if (_this.table.b.equals(_this.table.a)) {
                        _this.table.b = null;
                        _this.table.state = 2;
                    }
                    return false;
            }
            return true;
        });
        Mousetrap.bind("shift+down", function (e) {
            switch (_this.table.state) {
                case 2:
                    _this.table.b = new Point(_this.table.a.x, _this.table.a.y + 1);
                    _this.table.state = 4;
                    return false;
                case 4:
                    _this.table.b = new Point(_this.table.b.x, _this.table.b.y + 1);
                    if (_this.table.b.equals(_this.table.a)) {
                        _this.table.b = null;
                        _this.table.state = 2;
                    }
                    return false;
            }
            return true;
        });
        Mousetrap.bind("shift+right", function (e) {
            switch (_this.table.state) {
                case 2:
                    _this.table.b = new Point(_this.table.a.x + 1, _this.table.a.y);
                    _this.table.state = 4;
                    return false;
                case 4:
                    _this.table.b = new Point(_this.table.b.x + 1, _this.table.b.y);
                    if (_this.table.b.equals(_this.table.a)) {
                        _this.table.b = null;
                        _this.table.state = 2;
                    }
                    return false;
            }
            return true;
        });
        Mousetrap.bind(["delete", "backspace"], function (e) {
            switch (_this.table.state) {
                case 2:
                    _this.table.grid.get(_this.table.a).textContent = "";
                    return false;
                case 4:
                    var cells = _this.table.tableElement.querySelectorAll(".selected");
                    for (var i = 0; i < cells.length; ++i) {
                        cells.item(i).textContent = "";
                    }
                    return false;
            }
        });
    }
    TableEvents.prototype.registerEditingEvents = function (div) {
    };
    return TableEvents;
})();
var TableOperations = (function () {
    function TableOperations(table) {
        var _this = this;
        this.table = table;
        this.add_row_above = function (e) {
            console.log("add row above");
            return false;
        };
        this.add_row_below = function (e) {
            return false;
        };
        this.add_column_before = function (e) {
            return false;
        };
        this.add_column_after = function (e) {
            return false;
        };
        this.delete_row = function (e) {
            return false;
        };
        this.delete_column = function (e) {
            return false;
        };
        this.merge_cells = function (e) {
            if (_this.table.state === 4) {
                _this.table.mergeCells();
            }
            else if (_this.table.state === 2) {
                _this.table.splitCell();
            }
            else {
                throw "Invalid state detected for merging: " + _this.table.state;
            }
            return false;
        };
        document.querySelector("#merge_cells").addEventListener("click", this.merge_cells, true);
        // prevent buttons from triggering deselection of table
        document.querySelector(".toolbar").addEventListener("mousedown", function (e) {
            e.stopPropagation();
        }, true);
        document.querySelector(".toolbar").addEventListener("mouseup", function (e) {
            e.stopPropagation();
        }, true);
    }
    return TableOperations;
})();
/// <reference path="mousetrap.d.ts"/>
/// <reference path="utilities.ts"/>
/// <reference path="table_grid.ts"/>
/// <reference path="table_events.ts"/>
/// <reference path="table_operations.ts"/>
var Table = (function () {
    function Table(parent, rows, cols, headrows, headcols) {
        this._a = null;
        this._b = null;
        this.old_a = null;
        this.old_b = null;
        this._state = 0;
        this._table = DOM.createTable(rows, cols, headrows, headcols);
        this._table.id = "datatable";
        if (parent !== null) {
            this._contextMenu = document.createElement("div");
            this._contextMenu.classList.add("contextmenu");
            parent.appendChild(this._contextMenu);
            parent.appendChild(this._table);
        }
        else {
            this._contextMenu = null;
        }
        this.grid = new TableGrid.Grid(this._table);
        this._events = new TableEvents(this);
        this.updateContextMenu();
        this._operations = new TableOperations(this);
    }
    Table.prototype.contextMenu = function (location) {
        console.log("Display menu @ " + location.x + ", " + location.y);
    };
    Table.prototype.updateContextMenu = function () {
        var main_elements = document.querySelectorAll(".main_op");
        switch (this.state) {
            case 4:
                DOM.forall(main_elements, function (e) {
                    e.disabled = false;
                });
                document.querySelector("#merge_cells").disabled = false;
                document.querySelector("#merge_cells").textContent = "Merge Cells";
                break;
            case 2:
                DOM.forall(main_elements, function (e) {
                    e.disabled = false;
                });
                document.querySelector("#merge_cells").disabled = true;
                var cell = this.grid.get(this.a);
                if (cell.colSpan != 1 || cell.rowSpan != 1) {
                    var button = document.querySelector("#merge_cells");
                    button.textContent = "Split Cell";
                    button.disabled = false;
                }
                break;
            default:
                document.querySelector("#merge_cells").disabled = true;
                DOM.forall(main_elements, function (e) {
                    e.disabled = true;
                });
        }
    };
    // Merge cells between a and b
    // assumptions: 
    //   1. elements selected have selected class
    //   2. we are in state 4
    // post:
    //   1. one cell remains
    //   2. we are in state 2
    Table.prototype.mergeCells = function () {
        var left = Math.min(this.a.x, this.b.x);
        var top = Math.min(this.a.y, this.b.y);
        var top_left = this.grid.get(left, top);
        top_left.classList.remove("selected");
        var cells = Array.prototype.slice.call(this._table.querySelectorAll(".selected"));
        for (var i = 0; i < cells.length; ++i) {
            cells[i].parentNode.removeChild(cells[i]);
        }
        top_left.rowSpan = Math.abs(this.b.y - this.a.y) + 1;
        top_left.colSpan = Math.abs(this.b.x - this.a.x) + 1;
        this.b = null;
        this.state = 2;
        this.grid.update();
    };
    // Split cells
    // pre:
    //  1. element selected has a colspan or rowspan > 1
    //  2. we are in state 2
    // post:
    //  1. number of cells increase my how many atomic cells existed prior
    //  2. we are in state 4
    Table.prototype.splitCell = function () {
        var cell = this.grid.get(this.a);
        var start_row = this.a.y;
        var start_col = this.a.x;
        var colspan = cell.colSpan;
        var rowspan = cell.rowSpan;
        var text = cell.textContent;
        var refcolumn = start_col + colspan;
        if (refcolumn > this.grid.width)
            refcolumn = null;
        cell.parentNode.removeChild(cell);
        for (var i = start_row; i < start_row + rowspan; ++i) {
            var row = this.tableElement.rows.item(i);
            var refcell;
            var refcolumn2 = refcolumn;
            while (true) {
                if (refcolumn2 === null || refcolumn2 >= this.grid.width) {
                    refcell = null;
                    break;
                }
                refcell = this.grid.get(refcolumn2, i);
                if (parseInt(refcell.dataset["top"]) === i) {
                    break;
                }
                refcolumn2++;
            }
            for (var j = start_col; j < start_col + colspan; ++j) {
                var blankcell = document.createElement("td");
                row.insertBefore(blankcell, refcell);
            }
        }
        this.grid.update();
        this.a = new Point(start_col, start_row);
        this.b = new Point(start_col + colspan - 1, start_row + rowspan - 1);
        this.state = 4;
    };
    Table.prototype.startEditing = function (cell) {
        var element = this.grid.get(cell);
        var div = element.querySelector("span");
        div.contentEditable = "true";
        div.focus();
    };
    Table.prototype.stopEditing = function (cell) {
        var element = this.grid.get(cell);
        var div = element.querySelector("span");
        div.contentEditable = "false";
        div.blur();
    };
    Table.prototype.clearCell = function (cell) {
        var element = this.grid.get(cell);
        var div = element.querySelector("span");
        div.textContent = "";
    };
    Table.prototype.select = function (cell) {
    };
    Object.defineProperty(Table.prototype, "tableElement", {
        get: function () {
            return this._table;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "grid", {
        get: function () {
            return this._grid;
        },
        set: function (value) {
            this._grid = value;
        },
        enumerable: true,
        configurable: true
    });
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
            this.updateContextMenu();
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
        if (to === 3) {
            var body = document.getElementsByTagName("body").item(0);
            body.classList.add("noselect");
            window.addEventListener("mouseup", this._events.mouseUpEvent);
        }
        if (from === 3) {
            var body = document.getElementsByTagName("body").item(0);
            body.classList.remove("noselect");
            window.removeEventListener("mouseup", this._events.mouseUpEvent);
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
            this.startEditing(this.a);
        }
        if (from === 2 && to === 5) {
            this.clearCell(this.a);
            this.startEditing(this.a);
        }
        if (from === 5 && to === 2) {
            this.stopEditing(this.a);
        }
        if (from === 5 && to === 1) {
            this.stopEditing(this.old_a);
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