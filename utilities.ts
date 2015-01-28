
class Point {
    public constructor(
        public x : number,
        public y : number) {        
    }

    public equals(other : Point) : boolean {
        return (this.x === other.x && this.y === other.y);
    }

    static fromTarget(target : any) : Point {
        return new Point(parseInt(target.dataset.left),
                parseInt(target.dataset.top));
    }
}

class Rect {
    public constructor(
        public p1 : Point,
        public p2 : Point) {
    }
}

module DOM {
    export function createTable(
        rows : number,
        cols : number, 
        headrows : number,
        headcols : number) : HTMLTableElement {
        
        var table = document.createElement("table");
        /*
         * rows -= headrows; cols -= headcols;
         */
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
}
