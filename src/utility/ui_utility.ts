import { Type2String } from "./c0_type_utility";

export function replacer(key: any, value: any) {
    if (value instanceof Map) {
        return Array.from(value.entries()).map(([key, value]) => {return {k: key, v: value}});
    }
    if (value instanceof Set) {
        return Array.from(value.entries()).map(([key,]) => key);
    }
    if (value instanceof Object && value.type !== undefined) {
        return Type2String(value.type as C0Type<C0TypeClass>)
    }
    else {
        return value;
    }
}
