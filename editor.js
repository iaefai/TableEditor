var sys;
(function (sys) {
    function range(from, to, step) {
        if (step === void 0) { step = 1; }
        var list = new ArrayList();
        for (var i = from; i <= to; i += step) {
            list.append(i);
        }
        return list;
    }
    sys.range = range;
    var ArrayList = (function () {
        function ArrayList(items) {
            if (items === undefined) {
                this._data = new Array();
            }
            else {
                this._data = items.slice();
            }
        }
        ArrayList.fromNodeList = function (list) {
            var arr = new ArrayList();
            for (var i = 0; i < list.length; ++i) {
                arr.append(list.item(i));
            }
            return arr;
        };
        Object.defineProperty(ArrayList.prototype, "length", {
            get: function () {
                return this._data.length;
            },
            enumerable: true,
            configurable: true
        });
        ArrayList.prototype.get = function (n) {
            return this._data[n];
        };
        ArrayList.prototype.has = function (item) {
            return this._data.indexOf(item) != -1;
        };
        ArrayList.prototype.find = function (item, comp) {
            if (comp === undefined)
                return this._data.indexOf(item);
            for (var i = 0; i < this.length; ++i)
                if (comp(item, this.get(i)) == 0)
                    return i;
            return -1;
        };
        ArrayList.prototype.empty = function () {
            return this._data.length == 0;
        };
        ArrayList.prototype.foreach = function (f) {
            for (var i = 0; i < this.length; ++i) {
                f(this._data[i]);
            }
        };
        // untested
        //public insert(index : number, ...items : T[]) : void {
        //    if (items.length === 1) {
        //        this._data.splice(index, 0, items[0]);
        //    } else {
        //        var newarray = new Array<T>();
        //        newarray.concat(this._data.slice(0, index));
        //        newarray.concat(items);
        //        newarray.concat(this._data.slice(index));
        //        this._data = newarray;
        //    }
        //}
        ArrayList.prototype.append = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i - 0] = arguments[_i];
            }
            this._data = this._data.concat(items);
        };
        // untested
        ArrayList.prototype.prepend = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i - 0] = arguments[_i];
            }
            this._data = items.concat(this._data);
        };
        // untested
        ArrayList.prototype.remove = function (index) {
            this._data.splice(index, 1);
        };
        // untested
        ArrayList.prototype.removeAll = function (item, comp) {
            var i = this.find(item, comp);
            while (i !== -1) {
                this.remove(i);
                i = this.find(item, comp);
            }
        };
        // untested
        ArrayList.prototype.removeDuplicates = function (comp) {
            for (var i = 0; i < this._data.length; ++i) {
                for (var j = i + 1; j < this._data.length;) {
                    if (comp !== undefined) {
                        if (comp(this._data[i], this._data[j]) === 0) {
                            this.remove(j);
                            continue;
                        }
                        else {
                            j++;
                            continue;
                        }
                    }
                    else {
                        if (this._data[i] === this._data[j]) {
                            this.remove(j);
                            continue;
                        }
                        else {
                            j++;
                            continue;
                        }
                    }
                }
            }
        };
        ArrayList.prototype.map = function (f) {
            var n = new ArrayList();
            for (var i = 0; i < this.length; ++i) {
                n.append(f(this.get(i)));
            }
            return n;
        };
        ArrayList.prototype.foldr = function (f, init) {
            if (this.length == 0)
                return init;
            var result = init;
            for (var i = this._data.length - 1; i >= 0; --i) {
                result = f(this._data[i], result);
            }
            return result;
        };
        ArrayList.prototype.foldl = function (f, init) {
            if (this.length == 0)
                return init;
            var result = init;
            for (var i = 0; i < this._data.length; ++i)
                result = f(result, this._data[i]);
            return result;
        };
        ArrayList.prototype.foldr1 = function (f) {
            if (this.length == 0)
                throw new Error("foldr1 requires a non-empty list");
            var result = this._data[this._data.length - 1]; // last entry
            for (var i = this._data.length - 2; i >= 0; --i) {
                result = f(this._data[i], result);
            }
            return result;
        };
        ArrayList.prototype.foldl1 = function (f) {
            if (this.length == 0)
                throw new Error("foldl1 requires a non-empty list");
            var result = this._data[0];
            for (var i = 1; i < this._data.length; ++i)
                result = f(result, this._data[i]);
            return result;
        };
        ArrayList.prototype.filter = function (f) {
            var array = new ArrayList();
            this.foreach(function (x) {
                if (f(x))
                    array.append(x);
            });
            return array;
        };
        return ArrayList;
    })();
    sys.ArrayList = ArrayList;
})(sys || (sys = {}));
/// <reference path="sys/ArrayList.ts"/> 
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
    // lexicographical order, total ordering
    Point.comparator = function () {
        return function (p1, p2) {
            if (p1.x < p2.x)
                return -1;
            else if (p1.x === p2.x) {
                if (p1.y < p2.y)
                    return -1;
                else if (p1.y === p2.y)
                    return 0;
                else
                    return 1;
            }
            else
                return 1;
        };
    };
    return Point;
})();
var Rect = (function () {
    function Rect(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
    // makes p1 upper left, p2 lower right
    Rect.prototype.normalize = function () {
        var left = Math.min(this.p1.x, this.p2.x);
        var top = Math.min(this.p1.y, this.p2.y);
        var right = Math.max(this.p1.x, this.p2.x);
        var bottom = Math.max(this.p1.y, this.p2.y);
        return new Rect(new Point(left, top), new Point(right, bottom));
    };
    Object.defineProperty(Rect.prototype, "width", {
        get: function () {
            var norm = this.normalize();
            return norm.p2.x - norm.p1.x + 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "height", {
        get: function () {
            var norm = this.normalize();
            return norm.p2.y - norm.p1.y + 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "left", {
        get: function () {
            var norm = this.normalize();
            return norm.p1.x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "top", {
        get: function () {
            var norm = this.normalize();
            return norm.p1.y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "right", {
        get: function () {
            var norm = this.normalize();
            return norm.p2.x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "bottom", {
        get: function () {
            var norm = this.normalize();
            return norm.p2.y;
        },
        enumerable: true,
        configurable: true
    });
    Rect.prototype.all = function () {
        var list = new sys.ArrayList();
        var normalized = this.normalize();
        for (var i = normalized.p1.x; i <= normalized.p2.x; ++i) {
            for (var j = normalized.p1.y; j <= normalized.p2.y; ++j) {
                list.append(new Point(i, j));
            }
        }
        return list;
    };
    return Rect;
})();
var DOM;
(function (DOM) {
    function createTable(rows, cols) {
        var table = document.createElement("table");
        for (var i = 0; i < rows; ++i) {
            var row = document.createElement("tr");
            for (var j = 0; j < cols; ++j) {
                row.appendChild(this.cell());
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
    function cell(rowspan, colspan) {
        if (rowspan === void 0) { rowspan = 1; }
        if (colspan === void 0) { colspan = 1; }
        var cell = document.createElement("td");
        var span = document.createElement("span");
        cell.appendChild(span);
        cell.colSpan = colspan;
        cell.rowSpan = rowspan;
        span.textContent = randomText(5);
        return cell;
    }
    DOM.cell = cell;
})(DOM || (DOM = {}));
function randomText(len) {
    if (len === void 0) { len = 5; }
    return Math.random().toString(36).substr(2, 5);
}
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
            if (y > this._grid.length) {
                throw "Grid::get: y is greater than height";
            }
            else if (x > this._grid[y].length) {
                throw "Grid::get: x is greater than width";
            }
            return this._grid[y][x];
        };
        Grid.prototype.isSpanned = function () {
            if (arguments.length === 1) {
                var p = arguments[0];
            }
            else {
                var x = arguments[0];
                var y = arguments[1];
                var p = new Point(x, y);
            }
            return this.get(p).colSpan !== 1 || this.get(p).rowSpan !== 1;
        };
        Grid.prototype.isOriginal = function () {
            if (arguments.length === 1) {
                var p = arguments[0];
            }
            else {
                var x = arguments[0];
                var y = arguments[1];
                var p = new Point(x, y);
            }
            var cell = this.get(p);
            return parseInt(cell.dataset["top"]) === p.y && parseInt(cell.dataset["left"]) === p.x;
        };
        Grid.prototype.original = function (p) {
            var cell = this.get(p);
            return new Point(parseInt(cell.dataset["left"]), parseInt(cell.dataset["top"]));
        };
        Grid.prototype.isOriginalSameRow = function () {
            if (arguments.length === 1) {
                var p = arguments[0];
            }
            else {
                var x = arguments[0];
                var y = arguments[1];
                var p = new Point(x, y);
            }
            var cell = this.get(p);
            return parseInt(cell.dataset["top"]) === p.y;
        };
        Grid.prototype.isOriginalSameColumn = function () {
            if (arguments.length === 1) {
                var p = arguments[0];
            }
            else {
                var x = arguments[0];
                var y = arguments[1];
                var p = new Point(x, y);
            }
            var cell = this.get(p);
            return parseInt(cell.dataset["left"]) === p.x;
        };
        Grid.prototype.left = function (p) {
            var cell = this.get(p);
            return parseInt(cell.dataset["left"]);
        };
        Grid.prototype.top = function (p) {
            var cell = this.get(p);
            return parseInt(cell.dataset["top"]);
        };
        Grid.prototype.right = function (p) {
            var cell = this.get(p);
            return parseInt(cell.dataset["left"]) + cell.colSpan - 1;
        };
        Grid.prototype.bottom = function (p) {
            var cell = this.get(p);
            return parseInt(cell.dataset["top"]) + cell.rowSpan - 1;
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
var sys;
(function (sys) {
    var Functions;
    (function (Functions) {
        //export function max<T>(x : T, y : T) : T {
        //    return x > y ? x : y;
        //}
        Functions.max = function (x, y) { return x > y ? x : y; };
        Functions.min = function (x, y) { return x < y ? x : y; };
        Functions.sum = function (x, y) { return x + y; };
    })(Functions = sys.Functions || (sys.Functions = {}));
})(sys || (sys = {}));
/// <reference path="table_grid.ts"/> 
/// <reference path="utilities.ts"/>
/// <reference path="sys/ArrayList.ts"/> 
/// <reference path="sys/Functions.ts"/>
var Table = (function () {
    function Table(parent, rows, cols) {
        this._table = DOM.createTable(rows, cols);
        this._table.id = "datatable";
        if (parent !== null) {
            parent.appendChild(this._table);
        }
        this._grid = new TableGrid.Grid(this._table);
    }
    Object.defineProperty(Table.prototype, "table", {
        get: function () {
            return this._table;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "hasSelection", {
        get: function () {
            return this._selection !== null;
        },
        enumerable: true,
        configurable: true
    });
    Table.prototype.select = function (p) {
        var _this = this;
        this.deselect();
        this._selection = p;
        if (p instanceof Rect) {
            var left = p.all().map(function (x) { return _this._grid.left(x); }).foldr1(sys.Functions.min);
            var top = p.all().map(function (x) { return _this._grid.top(x); }).foldr1(sys.Functions.min);
            var right = p.all().map(function (x) { return _this._grid.right(x); }).foldr1(sys.Functions.max);
            var bottom = p.all().map(function (x) { return _this._grid.bottom(x); }).foldr1(sys.Functions.max);
            var selection = new Rect(new Point(left, top), new Point(right, bottom));
            selection.all().foreach(function (p) {
                _this._grid.get(p).classList.add("selected");
            });
            this._selection = selection;
        }
        else if (p instanceof Point) {
            this._grid.get(p).classList.add("selected");
        }
    };
    // public select(r : Rect) : void;
    Table.prototype.deselect = function () {
        if (!this.hasSelection) {
            console.log("deselect: no selection.");
            return;
        }
        var selection = sys.ArrayList.fromNodeList(this._table.querySelectorAll(".selected"));
        selection.foreach(function (p) { return p.classList.remove("selected"); });
        this._selection = null;
    };
    // merges selected cells
    Table.prototype.mergeCells = function () {
        var _this = this;
        if (!this.hasSelection) {
            console.log("mergeCells: no selection.");
            return;
        }
        var selection = this._selection;
        if (selection instanceof Point) {
            console.log("Attempt to merge single cell, nothing to do.");
        }
        if (selection instanceof Rect) {
            var sel = selection.normalize();
            var prototype = this._grid.get(sel.p1);
            var cells = sel.all().map(function (p) { return _this._grid.original(p); });
            cells.removeAll(sel.p1, Point.comparator());
            cells.removeDuplicates(Point.comparator());
            cells.map(function (p) { return _this._grid.get(p); }).foreach(function (cell) { return cell.parentNode.removeChild(cell); });
            prototype.colSpan = sel.width;
            prototype.rowSpan = sel.height;
            this._selection = sel.p1;
            this._grid.update();
        }
    };
    // splits selected cell into atomic cells
    Table.prototype.splitCell = function (p) {
        var location;
        if (p === undefined) {
            var maybecell = this._selection;
            if (maybecell instanceof Point)
                location = maybecell;
            else {
                console.log("splitCell called with selection as Rect, and without passing Point. Nothing to do.");
                return;
            }
        }
        else {
            location = p;
        }
        var cell = this._grid.get(location);
        var start_row = location.y;
        var start_col = location.x;
        var colspan = cell.colSpan;
        var rowspan = cell.rowSpan;
        if (colspan === 1 && rowspan === 1) {
            console.log("splitCell: cell is already atomic. Nothing to do.");
            return;
        }
        var text = cell.textContent;
        var refcolumn = start_col + colspan;
        if (refcolumn > this._grid.width)
            refcolumn = null;
        cell.parentNode.removeChild(cell);
        for (var i = start_row; i < start_row + rowspan; ++i) {
            var row = this._table.rows.item(i);
            var refcell;
            var refcolumn2 = refcolumn;
            while (true) {
                if (refcolumn2 === null || refcolumn2 >= this._grid.width) {
                    refcell = null;
                    break;
                }
                refcell = this._grid.get(refcolumn2, i);
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
        this._grid.update();
        this.select(new Rect(new Point(start_col, start_row), new Point(start_col + colspan - 1, start_row + rowspan - 1)));
        this._grid.get(new Point(start_col, start_row)).textContent = text;
    };
    Table.prototype.splitCells = function () {
        var _this = this;
        if (!this.hasSelection) {
            console.log("splitCells: no selection.");
            return;
        }
        var selection = this._selection;
        if (selection instanceof Point) {
            if (this._grid.isSpanned(selection)) {
                this.splitCell(selection);
            }
        }
        else if (selection instanceof Rect) {
            var spanned = selection.all().filter(function (x) { return _this._grid.isSpanned(x); }).map(function (x) { return _this._grid.original(x); });
            spanned.removeDuplicates(Point.comparator());
            spanned.foreach(function (p) { return _this.splitCell(p); });
        }
    };
    // inserts row/column before/after selection
    Table.prototype.insertRowAbove = function () {
        if (!this.hasSelection) {
            console.log("insertRowAbove: no selection.");
            return;
        }
        var selection = this._selection;
        var row;
        // find row...
        if (selection instanceof Rect) {
            row = selection.normalize().p1.y;
        }
        else if (selection instanceof Point) {
            row = selection.y;
        }
        var newrow = this._table.insertRow(row);
        for (var i = 0; i < this._grid.width; ++i) {
            if (this._grid.isOriginal(i, row)) {
                var cell = this._grid.get(i, row);
                newrow.appendChild(DOM.cell(cell.rowSpan, cell.colSpan));
            }
            else {
                if (this._grid.isOriginalSameColumn(i, row)) {
                    this._grid.get(i, row).rowSpan++;
                }
            }
        }
        this._grid.update();
        if (selection instanceof Rect) {
            selection.p1.y++;
            selection.p2.y++;
        }
        else if (selection instanceof Point) {
            selection.y++;
        }
        this.select(selection);
    };
    Table.prototype.insertRowBelow = function () {
        if (!this.hasSelection) {
            console.log("insertRowBelow: no selection.");
            return;
        }
        var selection = this._selection;
        var row;
        // find row...
        if (selection instanceof Rect) {
            // potentially erroneous assumption:
            // that p2.y is guaranteed to be within the table, thus +1 can be at most == height
            row = selection.normalize().p2.y + 1;
        }
        else if (selection instanceof Point) {
            row = selection.y + 1;
        }
        var newrow = this._table.insertRow(row);
        for (var i = 0; i < this._grid.width; ++i) {
            if (this._grid.isOriginal(i, row)) {
                var cell = this._grid.get(i, row);
                newrow.appendChild(DOM.cell(cell.rowSpan, cell.colSpan));
            }
            else {
                if (this._grid.isOriginalSameColumn(i, row)) {
                    this._grid.get(i, row).rowSpan++;
                }
            }
        }
        this._grid.update();
    };
    Table.prototype.insertColumnBefore = function () {
        var _this = this;
        var selection = this._selection;
        var column_to_duplicate;
        if (selection instanceof Point) {
            column_to_duplicate = selection.x;
        }
        else if (selection instanceof Rect) {
            column_to_duplicate = selection.left;
        }
        var column = new Rect(new Point(column_to_duplicate, 0), new Point(column_to_duplicate, this._grid.height - 1));
        // three types of cells:
        // type A: cells with colspan 1		
        var cellsA = column.all().filter(function (x) { return _this._grid.get(x).colSpan === 1; }).map(function (x) { return _this._grid.original(x); });
        // type B: cells with colspan > 1 starting in column
        var cellsB = column.all().filter(function (x) { return _this._grid.get(x).colSpan !== 1; }).filter(function (x) { return _this._grid.isOriginalSameColumn(x); }).map(function (x) { return _this._grid.original(x); });
        // type C: cells with colspan > 1 starting before column
        var cellsC = column.all().filter(function (x) { return _this._grid.get(x).colSpan !== 1; }).filter(function (x) { return !_this._grid.isOriginalSameColumn(x); }).map(function (x) { return _this._grid.original(x); });
        cellsA.removeDuplicates(Point.comparator());
        cellsB.removeDuplicates(Point.comparator());
        cellsC.removeDuplicates(Point.comparator());
        // A: colspan 1 -> duplicate
        cellsA.map(function (x) { return _this._grid.get(x); }).foreach(function (x) {
            var cell = DOM.cell(x.rowSpan, x.colSpan);
            x.parentNode.insertBefore(cell, x);
        });
        // B: starting in column -> replace with individual cells
        cellsB.foreach(function (x) {
            var originalCell = _this._grid.get(x);
            var cell = DOM.cell(originalCell.rowSpan, 1);
            originalCell.parentNode.insertBefore(cell, originalCell);
            // still to do: split the cell - will do that after updating grid
        });
        // C: increase colspan by 1
        cellsC.map(function (x) { return _this._grid.get(x); }).foreach(function (x) {
            x.colSpan++;
        });
        this._grid.update();
        cellsB.foreach(function (x) { return _this.splitCell(x); });
    };
    Table.prototype.insertColumnAfter = function () {
        var _this = this;
        var selection = this._selection;
        var column_to_duplicate;
        if (selection instanceof Point) {
            column_to_duplicate = selection.x;
        }
        else if (selection instanceof Rect) {
            column_to_duplicate = selection.left;
        }
        var column = new Rect(new Point(column_to_duplicate, 0), new Point(column_to_duplicate, this._grid.height - 1));
        // three types of cells:
        // type A: cells with colspan 1		
        var cellsA = column.all().filter(function (x) { return _this._grid.get(x).colSpan === 1; }).map(function (x) { return _this._grid.original(x); });
        // type B: cells with colspan > 1 end in column
        var cellsB = column.all().filter(function (x) { return _this._grid.get(x).colSpan !== 1; }).filter(function (x) { return _this._grid.right(x) === column_to_duplicate; }).map(function (x) { return _this._grid.original(x); });
        // type C: cells with colspan > 1 ending after column
        var cellsC = column.all().filter(function (x) { return _this._grid.get(x).colSpan !== 1; }).filter(function (x) { return _this._grid.right(x) > column_to_duplicate; }).map(function (x) { return _this._grid.original(x); });
        cellsA.removeDuplicates(Point.comparator());
        cellsB.removeDuplicates(Point.comparator());
        cellsC.removeDuplicates(Point.comparator());
        // last edit
        // A: colspan 1 -> duplicate
        cellsA.foreach(function (p) {
            var cell = _this._grid.get(p);
            var newcell = DOM.cell(cell.rowSpan, cell.colSpan);
            if (p.x + 1 >= _this._grid.width) {
                cell.parentNode.insertBefore(newcell);
            }
            else {
                p.x++;
                cell.parentNode.insertBefore(newcell, _this._grid.get(p));
            }
        });
        // B: ending in column -> replace with individual cells
        cellsB.foreach(function (p) {
            var cell = _this._grid.get(p);
            var newcell = DOM.cell(cell.rowSpan, 1);
            if (p.x + 1 >= _this._grid.width) {
                cell.parentNode.insertBefore(newcell);
            }
            else {
                p.x++;
                cell.parentNode.insertBefore(newcell, _this._grid.get(p));
            }
            // still to do: split the cell - will do that after updating grid
        });
        // C: increase colspan by 1
        cellsC.map(function (x) { return _this._grid.get(x); }).foreach(function (x) {
            x.colSpan++;
        });
        this._grid.update();
        cellsB.map(function (p) {
            p.x++;
            return p;
        }).foreach(function (p) { return _this.splitCell(p); });
    };
    Table.prototype.deleteRows = function () {
        var _this = this;
        if (!this.hasSelection) {
            console.log("deleteRows: No selection.");
        }
        var selection = this._selection;
        if (selection instanceof Point) {
            this.deleteRow(selection.y);
        }
        else if (selection instanceof Rect) {
            var range = sys.range(selection.p1.y, selection.p2.y);
            range.foreach(function (i) { return _this.deleteRow(i); });
        }
    };
    Table.prototype.deleteRow = function (i) {
        var _this = this;
        var all = sys.range(0, this._grid.width - 1, 1);
        // obtain original cell instance
        var cells = all.map(function (index) { return new Point(index, i); }).map(function (p) { return _this._grid.original(p); }).map(function (p) { return _this._grid.get(p); });
        // cells that start on this row (i)
        var cellsA = cells.filter(function (cell) { return parseInt(cell.dataset["top"]) === i; });
        // cells that do not start on this row 
        var cellsB = cells.filter(function (cell) { return parseInt(cell.dataset["top"]) !== i; });
        // cells that start on this row, and have a rowspan > 1
        var cellsA2 = cellsA.filter(function (cell) { return cell.rowSpan > 1; });
        // cells that do not start ont his row are by definition more than one row
        // therefore decrease their rowpsan
        cellsB.foreach(function (cell) { return cell.rowSpan--; });
        // cells that start out on this row, but are multirow must be moved to the next row
        cellsA2.foreach(function (cell) {
            cell.parentNode.removeChild(cell);
            cell.rowSpan--;
            var top = i + 1;
            var left = parseInt(cell.dataset["left"]);
            cell.dataset["top"] = top;
            left += cell.colSpan;
            var next = null;
            for (var i = left; i < _this._grid.width; i++) {
                var nxt = _this._grid.original(new Point(i, top));
                if (nxt.y === top) {
                    next = _this._grid.get(nxt);
                    break;
                }
            }
            _this._table.rows.item(top).insertBefore(cell, next);
        });
        this._table.deleteRow(i);
        this._grid.update();
    };
    Table.prototype.deleteColumns = function () {
        var _this = this;
        if (!this.hasSelection) {
            console.log("deleteColumns: No selection.");
        }
        var selection = this._selection;
        if (selection instanceof Point) {
            this.deleteColumn(selection.x);
        }
        else if (selection instanceof Rect) {
            var range = sys.range(selection.p1.x, selection.p2.x);
            range.foreach(function (i) { return _this.deleteColumn(i); });
        }
    };
    Table.prototype.deleteColumn = function (i) {
        var _this = this;
        var all = sys.range(0, this._grid.height - 1, 1);
        var points = all.map(function (row) { return new Point(i, row); });
        var originalPoints = points.map(function (cell) { return _this._grid.original(cell); });
        originalPoints.removeDuplicates(Point.comparator());
        var cells = originalPoints.map(function (point) { return _this._grid.get(point); });
        // cells that are only in this column
        var cellsA = cells.filter(function (cell) { return cell.colSpan === 1; });
        // cells that are in more than this column
        var cellsB = cells.filter(function (cell) { return cell.colSpan !== 1; });
        // delete cells that are only in this column
        cellsA.foreach(function (cell) { return cell.parentNode.removeChild(cell); });
        // reduece colspan of the rest
        cellsB.foreach(function (cell) { return cell.colSpan--; });
        this._grid.update();
    };
    return Table;
})();
/// <reference path="utilities.ts"/>
/// <reference path="table2.ts"/>
var Editor;
(function (Editor) {
    Editor.table;
    function createTable(rows, cols) {
        var node = document.querySelector(".table_div");
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        Editor.table = new Table(document.querySelector(".table_div"), rows, cols);
    }
    Editor.createTable = createTable;
    function _start() {
        Editor.createTable(6, 6);
        document.getElementById("buttonReset").addEventListener("click", function (e) {
            Editor.createTable(6, 6);
        });
        document.getElementById("buttonExecute").addEventListener("click", function (e) {
            try {
                document.getElementById("errors").innerHTML = "";
                eval(editor.getValue());
            }
            catch (e) {
                document.getElementById("errors").innerHTML = e.message;
            }
        });
    }
    Editor._start = _start;
})(Editor || (Editor = {}));
document.addEventListener("DOMContentLoaded", Editor._start);
//# sourceMappingURL=editor.js.map