/// <reference path="mousetrap.d.ts"/>
/// <reference path="utilities.ts"/>
/// <reference path="table_grid.ts"/>
/// <reference path="table_events.ts"/>

class Table {
    private _a : Point = null;
    private _b : Point = null;
    private old_a : Point = null;
    private old_b : Point = null;
    private _state : number = 0;
    private _grid : TableGrid.Grid;
    private _table : HTMLTableElement;
    private _events : TableEvents;
    private _contextMenu : HTMLDivElement;

    public contextMenu(location : Point) {
        console.log("Display menu @ " + location.x + ", " + location.y);
    }
    private updateContextMenu() {
        /*if (this._contextMenu !== null) {
            switch (this.state) {
                case 2:
                    this._contextMenu.textContent = "insert before, insert after, delete before, delete after";
                    break;
                case 4:
                    this._contextMenu.textContent = "insert before, insert after, delete before, delete after, merge cells";
                    break;
                default:
                    this._contextMenu.textContent = "Nothing to do";
            }
        }*/
    }

    private startEditing(cell : Point) {
        var element = this.grid.get(cell);
        var div = <HTMLDivElement>element.querySelector("span");
        div.contentEditable = "true";
        div.focus();
    }

    private stopEditing(cell : Point) {
        var element = this.grid.get(cell);
        var div = <HTMLDivElement>element.querySelector("span");
        div.contentEditable = "false";
        div.blur();
    }

    private clearCell(cell : Point) {
        var element = this.grid.get(cell);
        var div = <HTMLDivElement>element.querySelector("span");
        div.textContent = "";
    }

    private select(cell : Point) {

    }

    get tableElement() : HTMLTableElement {
        return this._table;
    }

    get grid() : TableGrid.Grid {
        return this._grid;
    }

    set grid(value : TableGrid.Grid) {
        this._grid = value;
    }

    get a() : Point {
        return this._a;
    }

    set a(value : Point) {
        if (value === null) {
            this.old_a = this._a;

            if (this.old_a !== null) {
                this.grid.get(this.old_a).classList.remove("selected");
            } 
                
            this._a = null; // clearing
        } else {
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
    } 

    get state() : number {
        return this._state;
    }

    set state(value : number) {
        this.onStateChange(this._state, value);
        this._state = value;
        this.updateContextMenu();
    }

    get b() : Point {
        return this._b;
    }

    set b(value : Point) {
        if (value === null) {
            this.old_b = this._b;
            this._b = null;
            
            if (this.old_b !== null) { 
                this.grid.deselect(new Rect(this.a, this.old_b));
            }
            
            this.a = this.a; // make sure we are still selected
        } else {
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
    }

    public deselectAll() : void {
        for (var i = 0; i < this.grid.height; ++i) {
            for (var j = 0; j < this.grid.width; ++j) {
                this.grid.get(j, i).classList.remove("selected");
            }
        }
    }

    public constructor(parent : Node, 
        rows : number,
        cols : number,
        headrows : number,
        headcols : number) {

        this._table = DOM.createTable(rows, cols, headrows, headcols);
        this._table.id = "datatable";

        if (parent !== null) {
            this._contextMenu = document.createElement("div");
            this._contextMenu.classList.add("contextmenu");

            parent.appendChild(this._contextMenu);
            parent.appendChild(this._table);
        } else {
            this._contextMenu = null;
        }


        this.grid = new TableGrid.Grid(this._table);

        this._events = new TableEvents(this);

        
        
        
    }

    public onStateChange(from : number, to : number) : void {
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
//            this.grid.get(self.old_a).classList.remove("selected");
//            this.grid.get(this.a).classList.add("selected");
        }

        if (from === 2 && to === 6) {
            //
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
    }
}