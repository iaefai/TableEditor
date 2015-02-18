/// <reference path="utilities.ts"/>
/// <reference path="table2.ts"/>

// ace
declare module editor {
	export function getValue() : string;
}

module Editor {
	export var table : Table;

	export function createTable(rows : number, cols : number) : void {
		var node = document.querySelector(".table_div");

		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}

		Editor.table = new Table(document.querySelector(".table_div"), rows, cols);
	}

	export function _start() : void {
		Editor.createTable(6, 6);

		document.getElementById("buttonReset").addEventListener("click",
			e => {
				Editor.createTable(6, 6);
			});

		document.getElementById("buttonExecute").addEventListener("click",
			e => {
				try {
					document.getElementById("errors").innerHTML = "";
					eval(editor.getValue());
				} catch (e) {
					if (typeof e === "string") {
						document.getElementById("errors").textContent = "Info: " + e;
					} else {
						document.getElementById("errors").innerHTML = "Bug: " + e.message;
					}
				}
			});


	}
}

document.addEventListener("DOMContentLoaded", Editor._start);