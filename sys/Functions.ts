
module sys {
    export module Functions {
        //export function max<T>(x : T, y : T) : T {
        //    return x > y ? x : y;
        //}
        export var max = (x : any, y : any) => x > y ? x : y;
        export var min = (x : any, y : any) => x < y ? x : y;
        export var sum = (x : any, y : any) => x + y;
        //export function min<T>(x : T, y : T) : T {
        //    return x < y ? x : y;
        //}
    }
}