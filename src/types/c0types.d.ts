declare const enum C0TypeClass {
    unknown = "<unknown>",
    value = "value",
    ptr = "ptr",
    string = "string"
}

type C0ValueTypes = "int" | "char" | "boolean";
type C0PointerKinds = "ptr" | "arr" | "struct";

type Maybe<T extends C0TypeClass> = T | C0TypeClass.unknown;

type C0Type<T extends C0TypeClass> = 
    T extends C0TypeClass.value ? {
        type: T,
        value: C0ValueTypes
    } : 
    T extends (C0TypeClass.ptr) ? {
        type: T,
        kind: "arr"| "ptr",
        // If a pointer points to the struct, we record the 
        // struct type name and offset
        value: C0Type<C0TypeClass>,
    } | {
        type: T,
        kind: "struct",
        value: string,
        offset: number
    } : 
    T extends (C0TypeClass.string) ? {
        type: T,
        value: "string"
    } : 
    T extends (C0TypeClass.unknown) ? {
        type: T
    } : never;
