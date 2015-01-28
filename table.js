var Table = (function(jwerty) {
    var _instance;
    var __focus = false;
    var __position = new Pair(0, 0);
    var self = {};

    var α = null, // cursor
    β = null; // second corner of selection in mode 4

    self.old_α = null;
    self.old_β = null;

    var state = 0;

    Object.defineProperty(self, 'state', {
        set : function(value) {
            self.onStateChange(state, value);
            state = value;
            //document.querySelector("#output").textContent = String(state);
        },
        get : function() {
            return state;
        }
    });

    Object.defineProperty(self, 'α', {
        set : function(value) {
            if (value instanceof Pair) {
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
                        
                self.old_α = α;
                α = value;
                
                if (self.old_α !== null) {
                    self.grid.get(self.old_α).classList.remove("selected");
                } 
                   
                self.grid.get(self.α).classList.add("selected");
                   

                console.log("Clicked " + value.x + ", " + value.y);
                /*
                 * deselectAll(); self.grid.get(value.x,
                 * value.y).classList.add("selected");
                 */
            } else if (value === null) {
                self.old_α = α;
                
                if (self.old_α !== null) {
                    self.grid.get(self.old_α).classList.remove("selected");
                } 
                
                α = null; // clearing
            } else {
                throw "position can only contain a Pair";
            }
        },
        get : function() {
            return α;
        }
    });

    Object.defineProperty(self, 'β', {
        set : function(value) {
            if (value instanceof Pair) {
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
                
                self.old_β = β;
                β = value;

                // this is 'quick and dirty', could use proper dirty rectangles
                if (self.old_β !== null) { 
                    this.grid.deselect(new Rect(α, self.old_β));
                }
                this.grid.select(new Rect(α, β));
                
            } else if (value === null) {
                self.old_β = β;
                β = null;
                
                if (self.old_β !== null) { 
                    this.grid.deselect(new Rect(α, self.old_β));
                }
                
                self.α = α; // make sure we are still selected
                
            } else {
                throw "position can only contain a Pair";
            }
        },
        get : function() {
            return β;
        }
    });

    function deselectAll() {
        for (var i = 0; i < self.grid.height; ++i) {
            for (var j = 0; j < self.grid.width; ++j) {
                self.grid.get(j, i).classList.remove("selected");
            }
        }
    }
    ;

    self.init = function(parent, rows, cols, headrows, headcols) {
        self.table = DOM.createTable(rows, cols, headrows, headcols);
        self.table.id = "datatable";

        if (parent !== null) {
            parent.appendChild(self.table);
        }

        self.grid = new TableGrid(self.table);

        self.mousedown_in_table = self.table.addEventListener("mousedown",
                function(e) {
                    switch (self.state) {
                    case 0:
                        self.α = pairFromTarget(e.target);
                        self.state = 1;
                        break;
                    case 2:
                        if (e.target === self.grid.get(α)) {
                            self.state = 6;
                        } else {
                            self.α = pairFromTarget(e.target);
                            self.state = 1;
                        }
                        break;
                    case 4:
//                        if (e.target === self.grid.get(α)) { // in α
//                        } else {
                            self.β = null;
                            self.α = pairFromTarget(e.target);

                            self.state = 1;
//                        }
                        break;
                    case 5:
                        if (e.target !== self.grid.get(α)) {
                            self.α = pairFromTarget(e.target);
                            self.state = 1;
                        }
                    }
                    e.stopPropagation();
                });
        
        self.mousemove = self.table.addEventListener("mousemove", 
                function(e) {
            switch (self.state) {
            case 6:
                self.state = 1;
            }
        });

        self.mousedown_off_table = document.addEventListener("mousedown",
                function(e) {
                    switch (self.state) {
                    case 0:
                    case 2:
                    case 4:
                    case 5:
                        self.state = 0;
                    }
                });

        self.mouseup = self.table.addEventListener("mouseup", function(e) {
            switch (self.state) {
            case 1:
                self.state = 2;
                break;
            case 3:
                self.state = 4;
                break;
            case 6:
                self.state = 5;
                break;
                
            }
            e.stopPropagation();
        });
        
        self.mouseout = self.table.addEventListener("mouseout", function(e) {
            switch (self.state) {
            case 1:         
                var t = pairFromTarget(e.target);
                
                console.log("mouseOut: target(" + t.x + ", " + t.y + ") α(" + self.α.x + ", " + self.α.y + ")" );
                console.log(pairFromTarget(e.target).equals(self.α));
//                if (e.target === self.grid.get(self.α)) {
                if (pairFromTarget(e.target).equals(self.α)) {
                    self.β = pairFromTarget(e.relatedTarget);
                    self.state = 3;
                }
            }
            e.stopPropagation();
        });
        
        self.mouseover = self.table.addEventListener("mouseover", function(e) {
            switch (self.state) {
            case 3:
                if (e.target == self.grid.get(self.α)) {
                    self.β = null;
                    self.state = 1;
                } else {
                    if (e.target === null) {
                        // might have moved off the table
                    }
                    self.β = pairFromTarget(e.target);
                }
            }
            e.stopPropagation();
        });

        self.keypress = document.addEventListener("keypress", function(e) {
            switch (self.state) {
            case 2:
//                var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
//                self.grid.get(self.α).textContent = String.fromCharCode(charCode);
                self.state = 5;
            }
        });
        
        jwerty.key("esc", function() {
            switch (self.state) {
            case 5:
                console.log("escape!");
                self.state = 2;
                return false;
            }
        });
        
        jwerty.key("tab", function() {
            switch (self.state) {
            case 5:
                self.state = 2;
                self.α = new Pair(self.α.x+1, self.α.y);
                return false;
            }
        });
        
        jwerty.key("enter", function() {
            switch (self.state) {
            case 5:
                self.state = 2;
                self.α = new Pair(self.α.x, self.α.y+1);               
                return false;
            }
        });
        
        jwerty.key("left", function() {
            switch (self.state) {
            case 4:
                self.β = null;
                self.state = 2; // and drop down into case 2
            case 2:
                self.α = new Pair(self.α.x-1, self.α.y);
                return false;
            }
            
            return true;
        });
        
        jwerty.key("up", function() {
            switch (self.state) {
            case 4:
                self.β = null;
                self.state = 2; // and drop down into case 2
            case 2:
                self.α = new Pair(self.α.x, self.α.y-1);
                return false;
            }
            
            return true;
        });
        
        jwerty.key("down", function() {
            switch (self.state) {
            case 4:
                self.β = null;
                self.state = 2; // and drop down into case 2
            case 2:
                self.α = new Pair(self.α.x, self.α.y+1);
                return false;
            }
            
            return true;
        });
        
        jwerty.key("right", function() {
            switch (self.state) {
            case 4:
                self.β = null;
                self.state = 2; // and drop down into case 2
            case 2:
                self.α = new Pair(self.α.x+1, self.α.y);
                return false;
            }
            
            return true;
        });
        
        jwerty.key("shift+left", function() {
            switch (self.state) {
            case 2:
                self.β = new Pair(self.α.x-1, self.α.y);
                self.state = 4;
                return false;
            case 4:
                self.β = new Pair(self.β.x-1, self.β.y);
                if (self.β.equals(self.α)) {
                    self.β = null;
                    self.state = 2;
                }
                return false;
            }
            
            return true;
        });
        
        jwerty.key("shift+up", function() {
            switch (self.state) {
            case 2:
                self.β = new Pair(self.α.x, self.α.y-1);
                self.state = 4;
                return false;
            case 4:
                self.β = new Pair(self.β.x, self.β.y-1);
                if (self.β.equals(self.α)) {
                    self.β = null;
                    self.state = 2;
                }
                return false;
            }
            
            return true;
        });
        
        jwerty.key("shift+down", function() {
            switch (self.state) {
            case 2:
                self.β = new Pair(self.α.x, self.α.y+1);
                self.state = 4;
                return false;
            case 4:
                self.β = new Pair(self.β.x, self.β.y+1);
                if (self.β.equals(self.α)) {
                    self.β = null;
                    self.state = 2;
                }
                return false;
            }
            
            return true;
        });
        
        jwerty.key("shift+right", function() {
            switch (self.state) {
            case 2:
                self.β = new Pair(self.α.x+1, self.α.y);
                self.state = 4;
                return false;
            case 4:
                self.β = new Pair(self.β.x+1, self.β.y);
                if (self.β.equals(self.α)) {
                    self.β = null;
                    self.state = 2;
                }
                return false;
            }
            
            return true;
        });
        
        jwerty.key("delete/backspace", function() {
            switch (self.state) {
            case 2:
                self.grid.get(self.α).textContent = "";
                return false;
            case 4:
                var cells = self.table.querySelectorAll(".selected");
                for (var i = 0; i < cells.length; ++i) {
                    cells.item(i).textContent = "";
                }
                return false;
            }
        });
    }

    self.onStateChange = function(from, to) {
        if (from === 0 && to === 1) {            
            self.table.classList.add("selected");
//            self.grid.get(self.α).classList.add("selected");
            return;
        }

        if (from === 1 && to === 2) {
            // nothing to do, because 1 already selected α
            return;
        }

        if (from === 2 && to === 1) {
//            self.grid.get(self.old_α).classList.remove("selected");
//            self.grid.get(self.α).classList.add("selected");
        }

        if (from === 2 && to === 6) {
            //
        }
        
        if (from === 6 && to === 5) {
            var element = self.grid.get(self.α);
            element.contentEditable = true;
            element.focus();
        }
        
        if (from === 2 && to === 5) {
            var element = self.grid.get(self.α);
            element.textContent = "";
            element.contentEditable = true;
            element.focus();
        }
        
        if (from === 5 && to === 2) {
            var element = self.grid.get(self.α);
            element.contentEditable = false;
            element.blur();
        }
        
        if (from === 5 && to === 1) {
            var element = self.grid.get(self.old_α);
            element.contentEditable = false;
            element.blur();
        }

        if (to === 0) {
            self.α = null;
            deselectAll();
            this.table.classList.remove("selected");
        }
    };

    return self;
})(jwerty);