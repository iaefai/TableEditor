/// <reference path="utilities.ts"/>
/// <reference path="table.ts"/>

module Editor {
	export function _start() : void {
		var table = new Table(document.querySelector(".table_div"), 6, 6, 1, 1);
		console.log("Table Selector Start");
	}
}

document.addEventListener("DOMContentLoaded", Editor._start);