
export function clone_type(T: C0Type): C0Type {
    if (typeof T === "string"){
        return T;   // Concrete Type
    }
    if (T.type === "pointer") {
        return {
            type: "pointer",
            name: T.name,
            val: clone_type(T.val)
        };
    }
    if (T.type === "struct") {
        return {
            type: "struct",
            name: T.name,
            val: T.val.map((e) => clone_type(e))
        }
    }
}

export function string2type(S: string): C0Type {
    if (S.endsWith("[]")) {
        return {
            type: "pointer",
            name: "arr",
            val: string2type(S.substring(0, S.length - 2))
        };
    }
    if (S.endsWith("*")) {
        return {
            type: "pointer",
            name: "ptr",
            val: string2type(S.substring(0, S.length - 1))
        };
    }
    if (S === "int" || S === "char" || S === "boolean") return S;
    return {
        type: "struct",
        name: S,
        val: []
    }
}


export function type2string(T: C0Type): string {
    if (typeof T === "string") return T;
    if (T.type === "pointer" && T.name === "arr") return type2string(T.val) + "[]";
    if (T.type === "pointer" && T.name === "ptr") return type2string(T.val) + "*";
    if (T.type === "struct") return T.name;
}


export function readBaseType(T: C0Type): string {
    if (typeof T === "string") return T;
    if (T.type === "pointer") return readBaseType(T.val);
    if (T.type === "struct") return T.name;
}
