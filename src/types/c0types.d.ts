declare const enum C0TypeClass {
    unknown = "<unknown>",
    value = "value",
    ptr = "ptr",
    string = "string"
}

type C0ValueTypes = "int" | "char" | "bool";

type Maybe<T extends C0TypeClass> = T | C0TypeClass.unknown;

type C0Type<T extends C0TypeClass> = 
    T extends C0TypeClass.value ? {
        type: T,
        value: C0ValueTypes
    } : 
    T extends C0TypeClass.ptr ? {
        type: T,
        kind: "arr"| "ptr",         // "arr" -> "C[]", "ptr" -> "C*"
        value: C0Type<C0TypeClass>, // the type "C" in comment above
    } | {
        type: T,
        kind: "struct",
        value: string,  // If a pointer points to the struct, we record the 
        offset: number  // struct type name and offset
    } : 
    T extends C0TypeClass.string ? {
        type: T,
        value: "string"
    } : 
    T extends C0TypeClass.unknown ? {
        type: T         // No more type information for unknown
    } : never;
