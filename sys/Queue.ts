/// <reference path="LinkedList.ts"/>

module sys {
    export class Queue<T> {
        private data : LinkedList<T>;

        public constructor() {
            this.data = new LinkedList<T>();
        }

        public enqueue(item : T) {
            this.data.pushFront(item);
        }

        public dequeue() : T {
            return this.data.popBack();
        }

        public empty() : boolean {
            return this.data.empty();
        }

    }
}
