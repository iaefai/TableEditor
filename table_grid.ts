/// <reference path="utilities.ts"/>
module TableGrid {


    // emptyTable :: [[Node]] -> [Int] -> Boolean
    function emptyTable(table : HTMLTableElement, indexes : Array<number>) : boolean {
        for (var i = 0; i < table.rows.length; ++i) {
            if (indexes[i] !== (<HTMLTableRowElement>table.rows.item(i)).cells.length)
                return false;
        }

        return true;
    }

    // smallest_index :: [[Node]] -> Int
    function smallestIndex(accumulator : Array<Array<HTMLTableCellElement>>) : number {
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

    function generate(table : HTMLTableElement) {
        var accumulator : Array<Array<HTMLTableCellElement>> = new Array(table.rows.length);
        var indexes : Array<number> = new Array(table.rows.length);

        for (var i = 0; i < accumulator.length; ++i) {
            accumulator[i] = new Array();
            indexes[i] = 0;
        }

        // indexes represents what index per row of the table we are on
        for (var row = smallestIndex(accumulator); !(row === 0 && emptyTable(
                table, indexes)); row = smallestIndex(accumulator)) {

            var cell = <HTMLTableCellElement> (<HTMLTableRowElement>table.rows.item(row)).cells.item(indexes[row]);
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

    function min(x : number, y : number) : number {
        return x < y ? x : y;
    }

    function max(x : number, y : number) : number {
        return x > y ? x : y;
    }

    export class Grid {
        private _table : HTMLTableElement;
        private _grid : Array<Array<HTMLTableCellElement>>;

        public update() {
            this._grid = generate(this._table);
        }

        // union types would be cleaner, but no idea how to use both primitive and class types together
        public constructor(table : HTMLTableElement);
        public constructor(table : string);
        public constructor(table : any) {
            if (table instanceof HTMLTableElement) {
                this._table = table;
            } else if (typeof table === "string") {
                var maybe_table = document.querySelector(table);
                if (maybe_table instanceof HTMLTableElement) {
                    this._table = <HTMLTableElement>maybe_table;
                } else {
                    throw String(table) + " is not a table or queryable table";
                }
            }

            this.update();
        }

        public get(p : Point) : HTMLTableCellElement;
        public get(x : number, y : number) : HTMLTableCellElement;
        public get() : HTMLTableCellElement {
            if (arguments.length === 1) {   // Point
                var p : Point = arguments[0];
                return this._grid[p.y][p.x];
            } // otherwise x and y
            var x : number = arguments[0];
            var y : number = arguments[1];
            if (y > this._grid.length) {
                throw "Grid::get: y is greater than height";
            } else if (x > this._grid[y].length) {
                throw "Grid::get: x is greater than width";
            }
            return this._grid[y][x];
        }

        public isSpanned(p : Point) : boolean;
        public isSpanned(x : number, y : number) : boolean;
        public isSpanned() : boolean {
            if (arguments.length === 1) {   // Point
                var p : Point = arguments[0];                
            } else { // otherwise x and y
                var x : number = arguments[0];
                var y : number = arguments[1];
                var p = new Point(x, y);
            }

            return this.get(p).colSpan !== 1 || this.get(p).rowSpan !== 1;
        }

        // determines if the cell at p is the original cell, or part of the 'phantom' span
        public isOriginal(p : Point) : boolean;
        public isOriginal(x : number, y : number) : boolean;
        public isOriginal() : boolean {

            if (arguments.length === 1) {   // Point
                var p : Point = arguments[0];                
            } else { // otherwise x and y
                var x : number = arguments[0];
                var y : number = arguments[1];
                var p = new Point(x, y);
            }

            var cell = this.get(p);

            return parseInt(cell.dataset["top"]) === p.y 
                && parseInt(cell.dataset["left"]) === p.x;
        }

        public original(p : Point) : Point {
            var cell = this.get(p);
            return new Point(parseInt(cell.dataset["left"]),
                parseInt(cell.dataset["top"]));
        }

        public isOriginalSameRow(p : Point) : boolean;
        public isOriginalSameRow(x : number, y : number) : boolean;
        public isOriginalSameRow() : boolean {
            if (arguments.length === 1) {   // Point
                var p : Point = arguments[0];                
            } else { // otherwise x and y
                var x : number = arguments[0];
                var y : number = arguments[1];
                var p = new Point(x, y);
            }

            var cell = this.get(p);

            return parseInt(cell.dataset["top"]) === p.y;
        }
        

        public isOriginalSameColumn(p : Point) : boolean;
        public isOriginalSameColumn(x : number, y : number) : boolean;
        public isOriginalSameColumn() : boolean {
            if (arguments.length === 1) {   // Point
                var p : Point = arguments[0];                
            } else { // otherwise x and y
                var x : number = arguments[0];
                var y : number = arguments[1];
                var p = new Point(x, y);
            }

            var cell = this.get(p);

            return parseInt(cell.dataset["left"]) === p.x;
        }

        public left(p : Point) : number {
            var cell = this.get(p);

            return parseInt(cell.dataset["left"]);
        }

        public top(p : Point) : number {
            var cell = this.get(p);

            return parseInt(cell.dataset["top"]);
        }

        public right(p : Point) : number {
            var cell = this.get(p);

            return parseInt(cell.dataset["left"]) + cell.colSpan - 1;
        }

        public bottom(p : Point) : number {
            var cell = this.get(p);

            return parseInt(cell.dataset["top"]) + cell.rowSpan - 1;
        }


        public select(rect : Rect) : void {
        
            var p1 = rect.p1,
                p2 = rect.p2;
            
            var left = Math.min(p1.x, p2.x),
                top = Math.min(p1.y, p2.y),
                bottom = Math.max(p1.y, p2.y),
                right = Math.max(p1.x, p2.x);

            // we have the top left, but the bottom right is not really corrected for colspan

            for (var i = left; i <= right; ++i) {
                for (var j = top; j <= bottom; ++j) {
                    this.get(i, j).classList.add("selected");
                }
            }

        }


        
        public deselect(rect : Rect) {
        
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
        }

        get width() : number {
            return this._grid[0].length;
        }

        get height() : number {
            return this._grid.length;
        }
    }
}