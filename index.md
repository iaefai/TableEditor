---
layout: table_editor
title: Table Editor
permalink: /table_editor/index.html
---

The Table Editor (work in progress) was born out of a need to integrate some form of data entry into a contract project for researchers. Presently, the tool works in Safari, Chrome, and Firefox with support for Internet Explorer 11 expected soon — absent due to differing implementation.

As of 28 January 2015, Table Editor has been converted over to [TypeScript](http://typescriptlang.org/), and using the [Mousetrap](http://craig.is/killing/mice) keyboard handling library. It has a type definition library, where the previous library [jwerty](https://github.com/keithamus/jwerty) does not. The primary benefit of TypeScript has been the use of lexical closures to move towards allowing multiple table editors on a single page.

Future work will include merging and splitting table cells.

To use the table editor, clicking in a cell will select it, dragging from one cell to another will select multiple cells. When a single cell is selected, clicking again or typing will enter edit mode.

<div class="table_div">
</div>

<script src="mousetrap.min.js" type="application/ecmascript"></script>
<script src="editor.js" type="application/ecmascript"></script>

## State machine

<img src="table_editor.svg"/>