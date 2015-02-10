
class Point {
    public constructor(
        public x : number,
        public y : number) {        
    }

    public equals(other : Point) : boolean {
        return (this.x === other.x && this.y === other.y);
    }

    static fromTarget(target : EventTarget) : Point {
        var element : HTMLTableCellElement;

        if (target instanceof HTMLSpanElement) {
            element = <HTMLTableCellElement>(<HTMLDivElement>target).parentElement;
        } else if (target instanceof HTMLTableCellElement) {
            element = <HTMLTableCellElement>target;
        } else {
            throw "Point::fromTarget: Not a Div or TableCell";
        }

        return new Point(parseInt(element.dataset["left"]),
                parseInt(element.dataset["top"]));
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

    export function forall(nodes : NodeList, f : (n : Node) => void) : void {
        for (var i = 0; i < nodes.length; ++i) {
            f(nodes.item(i));
        }
    }

    export function cell() : HTMLTableCellElement {
        return document.createElement("td");
    }
}

