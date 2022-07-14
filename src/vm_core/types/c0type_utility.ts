/**
 * Clone (deep copy) a type information by recursion
 * @param T The type object to be cloned
 * @returns The cloned (deep copy) of T
 */
export function CloneType(T: C0Type<C0TypeClass>): C0Type<C0TypeClass> {
    switch (T.type) {
        case "value":
            return {type: T.type, value: T.value};
        case "ptr":
            if (T.kind === "struct") 
                return {type: T.type, kind: T.kind, value: T.value, offset: T.offset};
            else
                return {type: T.type, kind: T.kind, value: CloneType(T.value)};
        case "string":
            return {type: T.type, value: T.value};
        case "<unknown>":
            return {type: T.type};
    }
}

/**
 * "Serialize" the C0Type Object
 * @param T The type to be converted to the string
 * @returns The C0 type name (e.g. `int*`)
 */
export function Type2String(T: C0Type<C0TypeClass>): string {
    switch (T.type) {
        case "ptr":
            if (T.kind === "arr") return Type2String(T.value) + "[]";
            else if (T.kind === "ptr") return Type2String(T.value) + "*";
            else if (T.kind === "struct") return T.value;
            else return "";
        case "string":
            return "string";
        case "<unknown>":
            return "<unknown>";
        case "value":
            return T.value;
    }
}

/**
 * "Deserialize" the C0 Type Name string
 * @param S The string to be parsed into the C0Type Object
 * @returns A C0Type object based parsed from S
 */
export function String2Type(S: string): C0Type<C0TypeClass> {
    if (S.endsWith("*")) return { type: "ptr", kind: "ptr", value: String2Type(S.slice(0, S.length - 1)) };
    else if (S.endsWith("[]")) return { type: "ptr", kind: "arr", value: String2Type(S.slice(0, S.length - 2)) };
    else if (S === "string") return { type: "string", value: "string" };
    else if (S === "int" || S === "char" || S === "bool") return { type: "value", value: S };
    else if (S === "<unknown>") return { type: "<unknown>" };
    else return { type: "ptr", kind: "struct", value: S, offset: 0 };
}

export function getType(T: C0Type<C0TypeClass>, TypeRecord: Map<string, Map<number, Struct_Type_Record>>): C0Type<C0TypeClass> {
    if (T.type === "ptr" && T.kind === "struct") {
        const struct_fields = TypeRecord.get(T.value);

        if (struct_fields === undefined) return { type: "<unknown>" }

        const type_cache = struct_fields.get(T.offset)?.type;
        return type_cache === undefined ? {type: "<unknown>"} : type_cache;
        
    } else return T;
}


// Explicit Type Narrowing. I don't know how to make the cosnt enum type as a parameter and 
// pass it to the result type as generic type argument. So I have to enumerate them manually here
export function maybeStringType(V: C0Value<C0TypeClass>): V is C0Value<Maybe<"string">> {
    return V.type.type === "string" || V.type.type === "<unknown>";
}

export function maybeValueType(V: C0Value<C0TypeClass>): V is C0Value<Maybe<"value">> {
    return V.type.type === "value" || V.type.type === "<unknown>";
}

export function maybePointerType(V: C0Value<C0TypeClass>): V is C0Value<Maybe<"ptr">> {
    return V.type.type === "ptr" || V.type.type === "<unknown>";
}

// export function maybeTypeOf<T extends C0TypeClass>(V: C0Value<C0TypeClass>): V is C0Value<Maybe<T>> {
//     return V.type.type === T || V.type.type === "<unknown>";
// }

