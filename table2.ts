/// <reference path="table_grid.ts"/> 
/// <reference path="utilities.ts"/>
/// <reference path="sys/ArrayList.ts"/> 
/// <reference path="sys/Functions.ts"/>

class Table {
	private _table : HTMLTableElement;
	private _grid : TableGrid.Grid;
	private _selection : Rect | Point;

	public get table() : HTMLTableElement { 
		return this._table;
	}

	constructor(parent : Node, rows : number, cols : number) {
		this._table = DOM.createTable(rows, cols);
        this._table.id = "datatable";

        if (parent !== null) {
            parent.appendChild(this._table);
        } 

        this._grid = new TableGrid.Grid(this._table);
	}

	public get hasSelection() : boolean {
		return this._selection !== null;
	}

	public select(p : Point|Rect) : void {
		this.deselect();
		
		this._selection = p;

		if (p instanceof Rect) {
			var left = p.all().map(x => this._grid.left(x)).foldr1(sys.Functions.min);
			var top = p.all().map(x => this._grid.top(x)).foldr1(sys.Functions.min);
			var right = p.all().map(x => this._grid.right(x)).foldr1(sys.Functions.max);
			var bottom = p.all().map(x => this._grid.bottom(x)).foldr1(sys.Functions.max);

			var selection = new Rect(new Point(left, top), new Point(right, bottom));			

			selection.all().foreach(p => {
					this._grid.get(p).classList.add("selected");
					});
			this._selection = selection;

		} else if (p instanceof Point) {
			this._grid.get(p).classList.add("selected");
		}		

	}
	// public select(r : Rect) : void;

	public deselect() : void {
		if (!this.hasSelection) {
			console.log("deselect: no selection.");
			return;
		}

		var selection = <sys.ArrayList<HTMLTableCellElement>>
			sys.ArrayList.fromNodeList(this._table.querySelectorAll(".selected"));
		selection.foreach(p => p.classList.remove("selected"));

		this._selection = null;
	}

	// merges selected cells
	public mergeCells() : void {
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

			var cells = sel.all().map(p => this._grid.original(p));

			cells.removeAll(sel.p1, Point.comparator());
			cells.removeDuplicates(Point.comparator());
			cells.map(p => this._grid.get(p)).foreach(
				cell => cell.parentNode.removeChild(cell));

			prototype.colSpan = sel.width;
			prototype.rowSpan = sel.height;

			this._selection = sel.p1;

        	this._grid.update();
		}
	}

	// splits selected cell into atomic cells
	private splitCell(p? : Point) : void {
		var location : Point;
		if (p === undefined) {
			var maybecell = this._selection;
			if (maybecell instanceof Point) 
				location = maybecell;
		 	else  {
		 		console.log("splitCell called with selection as Rect, and without passing Point. Nothing to do.");
		 		return;
		 	}
		} else {
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

            var refcell : HTMLTableCellElement;
            var refcolumn2 = refcolumn;

            // handles case where the row span causes there to be no cell available
            // for refcell
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
        this.select(new Rect(new Point(start_col, start_row),
        	new Point(start_col + colspan - 1, start_row + rowspan - 1)));

        this._grid.get(new Point(start_col, start_row)).textContent = text;
	}

	public splitCells() : void {
		if (!this.hasSelection) {
			console.log("splitCells: no selection.");
			return;
		}

		var selection = this._selection;

		if (selection instanceof Point) {
			if (this._grid.isSpanned(selection)) {
				this.splitCell(selection);
			}
		} else if (selection instanceof Rect) { 
			var spanned = selection.all()
				.filter(x => this._grid.isSpanned(x))
				.map(x => this._grid.original(x));

			spanned.removeDuplicates(Point.comparator());			
			spanned.foreach(p => this.splitCell(p));
		}
	}
 
	// inserts row/column before/after selection
	public insertRowAbove() : void {
		if (!this.hasSelection) {
			console.log("insertRowAbove: no selection.");
			return;
		}

		var selection = this._selection;
		var row : number;

		// find row...
		if (selection instanceof Rect) {
			row = selection.normalize().p1.y;
		} else if (selection instanceof Point) {
			row = selection.y;
		}

        var newrow = this._table.insertRow(row);        

        for (var i = 0; i < this._grid.width; ++i) {
            if (this._grid.isOriginal(i, row)) {
                var cell = this._grid.get(i, row);

                newrow.appendChild(DOM.cell(cell.rowSpan, cell.colSpan));
            } else {
                if (this._grid.isOriginalSameColumn(i, row)) {
                    this._grid.get(i, row).rowSpan++;
                }
            }
        }
        
        this._grid.update();

        if (selection instanceof Rect) {
        	selection.p1.y++;
        	selection.p2.y++;
        } else if (selection instanceof Point) {
        	selection.y++;
        }
         
        this.select(selection);
	}


	public insertRowBelow() : void {
		if (!this.hasSelection) {
			console.log("insertRowBelow: no selection.");
			return;
		}

		var selection = this._selection;
		var row : number;

		// find row...
		if (selection instanceof Rect) {
			// potentially erroneous assumption:
			// that p2.y is guaranteed to be within the table, thus +1 can be at most == height
			row = selection.normalize().p2.y+1;
		} else if (selection instanceof Point) {
			row = selection.y + 1;
		}

        var newrow = this._table.insertRow(row);

        for (var i = 0; i < this._grid.width; ++i) {
            if (this._grid.isOriginal(i, row)) {
                var cell = this._grid.get(i, row);

                newrow.appendChild(DOM.cell(cell.rowSpan, cell.colSpan));
            } else {
                if (this._grid.isOriginalSameColumn(i, row)) {
                    this._grid.get(i, row).rowSpan++;
                }
            }
        }
        
        this._grid.update();        
	}

	public insertColumnBefore() : void {
		var selection = this._selection;

		var column_to_duplicate : number;

		if (selection instanceof Point) {
			column_to_duplicate = selection.x;
		} else if (selection instanceof Rect) {
			column_to_duplicate = selection.left;
		}	

		var column = new Rect(new Point(column_to_duplicate, 0), 
				new Point(column_to_duplicate, this._grid.height - 1));

		// three types of cells:
		// type A: cells with colspan 1		
		var cellsA = column.all()
			.filter(x => this._grid.get(x).colSpan === 1)
			.map(x => this._grid.original(x));

		// type B: cells with colspan > 1 starting in column
		var cellsB = column.all()
			.filter(x => this._grid.get(x).colSpan !== 1)
			.filter(x => this._grid.isOriginalSameColumn(x))
			.map(x => this._grid.original(x));

		// type C: cells with colspan > 1 starting before column
		var cellsC = column.all()
			.filter(x => this._grid.get(x).colSpan !== 1)
			.filter(x => !this._grid.isOriginalSameColumn(x))
			.map(x => this._grid.original(x));

		cellsA.removeDuplicates(Point.comparator());
		cellsB.removeDuplicates(Point.comparator());
		cellsC.removeDuplicates(Point.comparator());
		
		// A: colspan 1 -> duplicate
		cellsA.map(x => this._grid.get(x)).foreach(x => {
			var cell = DOM.cell(x.rowSpan, x.colSpan);
			x.parentNode.insertBefore(cell, x);
		});

		// B: starting in column -> replace with individual cells
		cellsB.foreach(x => {
			var originalCell = this._grid.get(x);
			var cell = DOM.cell(originalCell.rowSpan, 1); 
			originalCell.parentNode.insertBefore(cell, originalCell);			
			// still to do: split the cell - will do that after updating grid
		});

		// C: increase colspan by 1
		cellsC.map(x => this._grid.get(x)).foreach(x => {
			x.colSpan++;
		});

		this._grid.update();
		
		cellsB.foreach(x => this.splitCell(x));
	}	

	public insertColumnAfter() : void {
		var selection = this._selection;

		var column_to_duplicate : number;

		if (selection instanceof Point) {
			column_to_duplicate = selection.x;
		} else if (selection instanceof Rect) {
			column_to_duplicate = selection.left;
		}

		var column = new Rect(new Point(column_to_duplicate, 0), 
				new Point(column_to_duplicate, this._grid.height - 1));

		// three types of cells:
		// type A: cells with colspan 1		
		var cellsA = column.all()
			.filter(x => this._grid.get(x).colSpan === 1)
			.map(x => this._grid.original(x));

		// type B: cells with colspan > 1 end in column
		var cellsB = column.all()
			.filter(x => this._grid.get(x).colSpan !== 1)
			.filter(x => this._grid.right(x) === column_to_duplicate)
			.map(x => this._grid.original(x));

		// type C: cells with colspan > 1 ending after column
		var cellsC = column.all()
			.filter(x => this._grid.get(x).colSpan !== 1)
			.filter(x => this._grid.right(x) > column_to_duplicate)
			.map(x => this._grid.original(x));

		cellsA.removeDuplicates(Point.comparator());
		cellsB.removeDuplicates(Point.comparator());
		cellsC.removeDuplicates(Point.comparator());
		
// last edit

		// A: colspan 1 -> duplicate
		cellsA.map(x => this._grid.get(x)).foreach(x => {
			var cell = DOM.cell(x.rowSpan, x.colSpan);
			x.parentNode.insertBefore(cell, x);
		});

		// B: starting in column -> replace with individual cells
		cellsB.foreach(x => {
			var originalCell = this._grid.get(x);
			var cell = DOM.cell(originalCell.rowSpan, 1); 
			originalCell.parentNode.insertBefore(cell, originalCell);			
			// still to do: split the cell - will do that after updating grid
		});

		// C: increase colspan by 1
		cellsC.map(x => this._grid.get(x)).foreach(x => {
			x.colSpan++;
		});

		this._grid.update();
		
		cellsB.foreach(x => this.splitCell(x));
	}

	// public deleteRow() : void;
	// public deleteColumn() : void;

	// edit cell selected (invalid in multiselection)
	// public edit() : void;

	// public clear() : void;
	// public copy() : void;
	// public paste() : void;



}