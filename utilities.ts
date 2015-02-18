/// <reference path="sys/ArrayList.ts"/> 

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

    // lexicographical order, total ordering
    static comparator() : sys.comparator {
        return (p1 : Point, p2 : Point) => {
            if (p1.x < p2.x) return -1;
            else if (p1.x === p2.x) {
                if (p1.y < p2.y) return -1;
                else if (p1.y === p2.y) return 0;
                else return 1;
            } else return 1;
        }
    }
}

class Rect {
    public constructor(
        public p1 : Point,
        public p2 : Point) {
    }

    // makes p1 upper left, p2 lower right
    public normalize() : Rect {
        var left = Math.min(this.p1.x, this.p2.x);
        var top = Math.min(this.p1.y, this.p2.y);
        var right = Math.max(this.p1.x, this.p2.x);
        var bottom = Math.max(this.p1.y, this.p2.y);

        return new Rect(new Point(left, top), new Point(right, bottom));
    }

    public get width() : number {
        var norm = this.normalize();
        return norm.p2.x - norm.p1.x + 1;
    }

    public get height() : number {
        var norm = this.normalize();
        return norm.p2.y - norm.p1.y + 1;
    }

    public get left() : number {
        var norm = this.normalize();
        return norm.p1.x;
    }

    public get top() : number {
        var norm = this.normalize();
        return norm.p1.y;
    }

    public get right() : number {
        var norm = this.normalize();
        return norm.p2.x;
    }

    public get bottom() : number {
        var norm = this.normalize();
        return norm.p2.y;
    }

    public all() : sys.ArrayList<Point> {
        var list = new sys.ArrayList<Point>();

        var normalized = this.normalize();

        for (var i = normalized.p1.x; i <= normalized.p2.x; ++i) {
            for (var j = normalized.p1.y; j <= normalized.p2.y; ++j) {
                list.append(new Point(i, j));
            }
        }

        return list;
    }
}

module DOM {
    export function createTable(
        rows : number,
        cols : number) : HTMLTableElement {
        
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

    export function forall(nodes : NodeList, f : (n : Node) => void) : void {
        for (var i = 0; i < nodes.length; ++i) {
            f(nodes.item(i));
        }
    }

    export function cell(rowspan : number = 1, colspan : number = 1) : HTMLTableCellElement {
        var cell = document.createElement("td");
        var span = document.createElement("span");
        cell.appendChild(span);
        cell.colSpan = colspan;
        cell.rowSpan = rowspan;
        span.textContent = ""; // randomText(5);
        return cell;
    }
}

function randomText(len : number = 5) : string {
    return Math.random().toString(36).substr(2, 5);
}
