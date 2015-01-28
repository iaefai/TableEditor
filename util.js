var Pair = (function() {
    return function(x, y) {
        this.x = x;
        this.y = y;
        
        this.equals = function(other) {
            return (this.x === other.x && this.y === other.y);
        }
    }
})();

var pairFromTarget = (function() {
    return function(target) {
        return new Pair(parseInt(target.dataset.left),
                parseInt(target.dataset.top));
    }
})();

var Rect = (function() {
    return function(p1, p2) {
        if (p1 instanceof Pair && p2 instanceof Pair) {
            this.p1 = p1;
            this.p2 = p2;
        } else {
            throw "Rect can only be created with pairs";
        }
    }
})();

var DOM = (function() {
    var self = {};

    self.createTable = function(rows, cols, headrows, headcols) {
        var table = document.createElement("table");
        /*
         * rows -= headrows; cols -= headcols;
         */
        for (var i = 0; i < headrows; ++i) {
            var row = document.createElement("tr");
            for (var j = 0; j < cols + headcols; ++j) {
                var col = document.createElement("th");
                row.appendChild(col);
            }
            table.appendChild(row);
        }

        for (var i = 0; i < rows; ++i) {
            var row = document.createElement("tr");
            for (var j = 0; j < headcols; ++j) {
                var col = document.createElement("th");
                row.appendChild(col);
            }
            for (var j = 0; j < cols; ++j) {
                var col = document.createElement("td");
                row.appendChild(col);
            }
            table.appendChild(row);
        }

        return table;
    };
    return self;
})();