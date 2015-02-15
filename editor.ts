/// <reference path="utilities.ts"/>
/// <reference path="table2.ts"/>

module Editor {
	export var table : Table;

	export function _start() : void {
		Editor.table = new Table(document.querySelector(".table_div"), 6, 6);
		console.log("Table Selector Start");

		Editor.table.select(new Rect(new Point(1,1), new Point(2,2)));
		Editor.table.mergeCells();
		Editor.table.select(new Point(2, 0));
		Editor.table.insertColumnBefore();
	}
}

document.addEventListener("DOMContentLoaded", Editor._start);