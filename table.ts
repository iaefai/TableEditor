/// <reference path="mousetrap.d.ts"/>
/// <reference path="utilities.ts"/>
/// <reference path="table_grid.ts"/>

class Table {
    private _a : Point = null;
    private _b : Point = null;
    old_a = null;
    old_b = null;
    private _state : number = 0;
    __focus = false;
    __position = new Point(0, 0);
    private grid : TableGrid.Grid;
    private _table : HTMLTableElement;


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
            parent.appendChild(this._table);
        }

        this.grid = new TableGrid.Grid(this._table);

        // mousedown in table
        this._table.addEventListener("mousedown", e => {
            switch (this.state) {
                case 0:
                    this.a = Point.fromTarget(e.target);
                    this.state = 1;
                    break;
                case 2:
                    if (e.target === this.grid.get(this.a)) {
                        this.state = 6;
                    } else {
                        this.a = Point.fromTarget(e.target);
                        this.state = 1;
                    }
                    break;
                case 4:
                        this.b = null;
                        this.a = Point.fromTarget(e.target);

                        this.state = 1;
                    break;
                case 5:
                    if (e.target !== this.grid.get(this.a)) {
                        this.a = Point.fromTarget(e.target);
                        this.state = 1;
                    }
                }
                e.stopPropagation();
 
        });
        
        this._table.addEventListener("mousemove", e => {
            switch (this.state) {
            case 6:
                this.state = 1;
            }
        });

        // off table listener
        document.addEventListener("mousedown",
            e => {
                    switch (this.state) {
                    case 0:
                    case 2:
                    case 4:
                    case 5:
                        this.state = 0;
                    }
                });

        this._table.addEventListener("mouseup", e => {
            switch (this.state) {
            case 1:
                this.state = 2;
                break;
            case 3:
                this.state = 4;
                break;
            case 6:
                this.state = 5;
                break;
                
            }
            e.stopPropagation();
        });
        
        this._table.addEventListener("mouseout", e => {
            switch (this.state) {
            case 1:         
                var t = Point.fromTarget(e.target);
                
                console.log("mouseOut: target(" + t.x + ", " + t.y + ") a(" + this.a.x + ", " + this.a.y + ")" );
                console.log(Point.fromTarget(e.target).equals(this.a));
//                if (e.target === this.grid.get(this.a)) {
                if (Point.fromTarget(e.target).equals(this.a)) {
                    this.b = Point.fromTarget(e.relatedTarget);
                    this.state = 3;
                }
            }
            e.stopPropagation();
        });
        
        this._table.addEventListener("mouseover", e => {
            switch (this.state) {
            case 3:
                if (e.target == this.grid.get(this.a)) {
                    this.b = null;
                    this.state = 1;
                } else {
                    if (e.target === null) {
                        // might have moved off the table
                    }
                    this.b = Point.fromTarget(e.target);
                }
            }
            e.stopPropagation();
        });

        document.addEventListener("keypress", e => {
            switch (this.state) {
            case 2:
//                var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
//                this.grid.get(this.a).textContent = String.fromCharCode(charCode);
                this.state = 5;
            }
        });
        
        Mousetrap.bind("esc", e => {
            switch (this.state) {
            case 5:
                console.log("escape!");
                this.state = 2;
                return false;
            }
        });
        
        Mousetrap.bind("tab", e => {
            switch (this.state) {
            case 5:
                this.state = 2;
                this.a = new Point(this.a.x+1, this.a.y);
                return false;
            }
        });
        
        Mousetrap.bind("enter", e => {
            switch (this.state) {
            case 5:
                this.state = 2;
                this.a = new Point(this.a.x, this.a.y+1);               
                return false;
            }
        });
        
        var __this = this;

        Mousetrap.bind("left", e => {
            
            
            switch (this.state) {
            case 4:
                this.b = null;
                this.state = 2; // and drop down into case 2
            case 2:
                this.a = new Point(this.a.x-1, this.a.y);
                return false;
            }
            
            return true;
        });
        
        Mousetrap.bind("up", e => {
            

            switch (this.state) {
            case 4:
                this.b = null;
                this.state = 2; // and drop down into case 2
            case 2:
                this.a = new Point(this.a.x, this.a.y-1);
                return false;
            }
            
            return true;
        });
        
        Mousetrap.bind("down", e => {
            
            switch (this.state) {
            case 4:
                this.b = null;
                this.state = 2; // and drop down into case 2
            case 2:
                this.a = new Point(this.a.x, this.a.y+1);
                return false;
            }
            
            return true;
        });
        
        Mousetrap.bind("right", e => {
            
            switch (this.state) {
            case 4:
                this.b = null;
                this.state = 2; // and drop down into case 2
            case 2:
                this.a = new Point(this.a.x+1, this.a.y);
                return false;
            }
            
            return true;
        });
        
        Mousetrap.bind("shift+left", e => {
            
            switch (this.state) {
            case 2:
                this.b = new Point(this.a.x-1, this.a.y);
                this.state = 4;
                return false;
            case 4:
                this.b = new Point(this.b.x-1, this.b.y);
                if (this.b.equals(this.a)) {
                    this.b = null;
                    this.state = 2;
                }
                return false;
            }
            
            return true;
        });
        
        Mousetrap.bind("shift+up", e => {
            
            switch (this.state) {
            case 2:
                this.b = new Point(this.a.x, this.a.y-1);
                this.state = 4;
                return false;
            case 4:
                this.b = new Point(this.b.x, this.b.y-1);
                if (this.b.equals(this.a)) {
                    this.b = null;
                    this.state = 2;
                }
                return false;
            }
            
            return true;
        });
        
        Mousetrap.bind("shift+down", e => {
            
            switch (this.state) {
            case 2:
                this.b = new Point(this.a.x, this.a.y+1);
                this.state = 4;
                return false;
            case 4:
                this.b = new Point(this.b.x, this.b.y+1);
                if (this.b.equals(this.a)) {
                    this.b = null;
                    this.state = 2;
                }
                return false;
            }
            
            return true;
        });
        
        Mousetrap.bind("shift+right", e => {
            
            switch (this.state) {
            case 2:
                this.b = new Point(this.a.x+1, this.a.y);
                this.state = 4;
                return false;
            case 4:
                this.b = new Point(this.b.x+1, this.b.y);
                if (this.b.equals(this.a)) {
                    this.b = null;
                    this.state = 2;
                }
                return false;
            }
            
            return true;
        });
        
        Mousetrap.bind(["delete", "backspace"], e => {
            switch (this.state) {
            case 2:
                this.grid.get(this.a).textContent = "";
                return false;
            case 4:
                var cells = this._table.querySelectorAll(".selected");
                for (var i = 0; i < cells.length; ++i) {
                    cells.item(i).textContent = "";
                }
                return false;
            }
        });
    }

    public onStateChange(from : number, to : number) : void {
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
//            this.grid.get(self.old_a).classList.remove("selected");
//            this.grid.get(this.a).classList.add("selected");
        }

        if (from === 2 && to === 6) {
            //
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
    }
}