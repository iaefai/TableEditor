var Keys = (function(jwerty) {
    var self = {};
    
    self.init = function() {
        jwerty.key("left", function() {
            if (self.focus) {
                
                var pos = self.position;
                if (pos.x > 0) pos.x--;
                self.position = pos;
                return false;
            }
            return true;
        });
        
        jwerty.key("up", function() {
            if (self.focus) {            
                var pos = self.position;
                if (pos.y > 0) pos.y--;
                self.position = pos;
                return false;
            }
            return true;
        });
        
        jwerty.key("down", function() {
            if (self.focus) {            
                var pos = self.position;
                if (pos.y+1 < self.grid.height) pos.y++;
                self.position = pos;
                return false;
            }
            return true;
        });
        
        jwerty.key("right", function() {
            if (self.focus) {            
                var pos = self.position;
                if (pos.x+1 < self.grid.width) pos.x++;
                self.position = pos;
                return false;
            }
            return true;
        });
        
        jwerty.key("tab", function() {
            if (document.activeElement === document.getElementById("source")) {
                self.focus = true;
                document.activeElement.blur();
                return false;
            }
            
            if (self.focus) {
                self.focus = false;
                document.getElementById("name").focus();
                return false;
            }
        });
        
        jwerty.key("shift+tab", function() {
            if (self.focus) {
                self.focus = false;
                document.getElementById("source").focus();
                return false;
            }
            
            if (document.activeElement === document.getElementById("name")) {
                self.focus = true;
                document.activeElement.blur();
                return false;
            }
        });
    };
    
    return self;
})(jwerty);