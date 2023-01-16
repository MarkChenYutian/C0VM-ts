import { Type2String } from "./c0_type_utility";

export function replacer(key: any, value: any) {
    if (value instanceof Map) {
        if (value.entries.length !== 0 && 
            Array.from(value.values())[0] instanceof Map){
            return "test"
        } else {
            return Array.from(value.entries()).map(([key, value]) => [{k: key, v: value}]);
        }
    } 
    if (value instanceof Object && value.type !== undefined) {
        return Type2String(value.type as C0Type<C0TypeClass>)
    }
    else {
        return value;
    }
}
