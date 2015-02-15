
module sys {
    class Node<T> {
        prev : Node<T>;
        next : Node<T>;
        data : T;

        constructor(data : T) {
            this.data = data;
            this.prev = null;
            this.next = null;
        }
    }

    export class LinkedList<T> {
        private head : Node<T>;
        private tail : Node<T>;

        constructor() {
            this.head = null;
            this.tail = null;
        }

        public length() : number {
            return this.foldr((x, y) => 1 + y, 0);
        }

        public empty() : boolean {
            return this.head === null;
        }

        public pushFront(item : T) {
            var x = new Node<T>(item);

            if (this.head === null) {
                this.head = x;
                this.tail = this.head;
            } else {
                x.next = this.head;
                this.head.prev = x;
                this.head = x;
            }
        }

        public popFront() : T {
            if (this.head === null) {
                return undefined;
            } else if (this.head.next === null) { // one item
                var x = this.head;
                this.head = null;
                this.tail = null;
                return x.data;
            } else { // two or more items
                var x = this.head;
                this.head = this.head.next;
                this.head.prev = null;
                return x.data;
            }
        }

        public pushBack(item : T) {
            var x = new Node<T>(item);

            if (this.head === null) {
                this.head = x;
                this.tail = x;
            } else {    // nonempty list
                this.tail.next = x;
                x.prev = this.tail;
                this.tail = x;
            }
        }

        public popBack() : T {
            if (this.head === null)
                return undefined;
            else if (this.head.next === null) { // one item
                var x = this.head;
                this.head = null;
                this.tail = null;
                return x.data;
            } else { // two+ items
                var x = this.tail;
                this.tail = x.prev;
                this.tail.next = null;
                return x.data;
            }
        }

        private findNodeByIndex(index : number) : Node<T> {
            if (index < 0) return undefined;

            var start = this.head;

            for (var i = 0; start != null && i <= index; ++i) {
                start = start.next;
            }

            if (i == index)
                return start;
            else
                return undefined;
        }

        /*
        public insertAt(index : number, data : T) {
            var node = this.findNodeByIndex(index);

            if (node !== undefined) {
                var x = new Node<T>(data);

                if (node.prev !== null) { // has a previous element
                    if (node.prev === this.head) { // previous element is head
                }
            }
        }*/

        public foreach(f : (x : T) => void) {
            var item = this.head;

            while (item != null) {
                f(item.data);
            }

        }

        public map<Y>(f : (x : T) => Y) : LinkedList<Y> {
            var x = new LinkedList<Y>();

            var item = this.head;
            while (item != null) {
                var y = f(item.data);
                x.pushBack(y);
            }

            return x;
        }

        public foldr<B>(f : (x : T, y : B) => B, init : B) : B {
            var result = init;

            var item = this.tail;
            while (item != null) {
                result = f(item.data, result);
                item = item.prev;
            }

            return result;
        }

        public foldl<B>(f : (x : B, y : T) => B, init : B) : B {
            var result = init;

            var item = this.head;
            while (item != null) {
                result = f(result, item.data);
                item = item.next;
            }

            return result;
        }

        public foldr1(f : (x : T, y : T) => T) : T {
            if (this.head === null) throw new Error("foldr1 requires a non-empty list");

            var item = this.tail;
            var result = item.data;
            item = item.prev;

            while (item != null) {
                result = f(item.data, result);
                item = item.prev;
            }

            return result;
        }

        public foldl1(f : (x : T, y : T) => T) : T {
            if (this.head === null) throw new Error("foldl1 requires a non-empty list");

            var item = this.head;
            var result = item.data;
            item = item.next;

            while (item != null) {
                result = f(result, item.data);
                item = item.next;
            }

            return result;
        }

        public filter(f : (x : T) => boolean) : LinkedList<T> {
            var list = new LinkedList<T>();

            this.foreach(x => {
                if (f(x)) list.pushBack(x);
            });

            return list;
        }

    }

}