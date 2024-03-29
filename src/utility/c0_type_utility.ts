/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract A pack of utility functions that deal with C0Types and helps
 * TS to perform type inference better on C0Value
 * 
 * @description Contains:
 * 1. Deep Copy (Clone) a C0Type
 * 2. Conversion between string and corresponding C0Type 
 *    ("int*" => {type: "ptr", kind: "ptr", value: {type: "value", value: "int"}})
 * 3. Load C0Type of struct field
 * 4. Force cast the c0value type with type annotation for TS type inference
 * 5. Type Narrowing (Predicate) Functions
 */

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
        case "tagptr":
            return {type: T.type, value: CloneType(T.value) as C0Type<"ptr">};
        case "funcptr":
            return {type: T.type};
        case "<unknown>":
            return {type: T.type};
    }
}

/**
 * "Serialize" the C0Type Object
 * @param T The type to be converted to the string
 * @returns The C0 type name (e.g. `int*`)
 */
export function Type2String(T: C0Type<C0TypeClass> | string, TypedefRec?: Map<AliasType, SourceType>): string {
    let retVal = "";
    if (typeof T === "string") retVal = T;
    else {
        switch (T.type) {
            case "ptr":
                if (T.kind === "arr") retVal = Type2String(T.value, TypedefRec) + "[]";
                else if (T.kind === "ptr") retVal = Type2String(T.value, TypedefRec) + "*";
                else if (T.kind === "struct") retVal = T.value
                else retVal = "";
                break;
            case "string":
                retVal = "string";
                break;
            case "tagptr":
                retVal = "void*";
                break;
            case "funcptr":
                retVal = "&func";
                break;
            case "<unknown>":
                retVal = "<unknown>";
                break;
            case "value":
                retVal = T.value;
                break;
        }
    }
    if (TypedefRec === undefined) return retVal;
    if (TypedefRec.has(retVal)) return TypedefRec.get(retVal) as string;
    return retVal;
}

/**
 * Parse the C0 Type Name string
 * @param S The string to be parsed into the C0Type Object
 * @returns A C0Type object based parsed from S
 */
export function String2Type(S: string): C0Type<Exclude<C0TypeClass, "funcptr">> {
    if (S === "void*") return { type: "tagptr", value: {type: "<unknown>"}};
    // else if (S === "&func") return { type: "funcptr", kind: "static", fname: "" };
    // There's no need to support String2Type on funcptr because we can't actually recover the information and 
    // we won't need this
    else if (S.endsWith("*")) return { type: "ptr", kind: "ptr", value: String2Type(S.slice(0, S.length - 1)) };
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

// Cast with TS type inference utility
export function castToType<T extends C0TypeClass>(V: C0Value<C0TypeClass>, newType: C0Type<T>): C0Value<T> {
    V.type = newType;
    return V as C0Value<T>;
}

// Strip the tag of void* so that we allow same field of struct contains void* with different types
export function removeTagOnType(T: C0Type<C0TypeClass>): C0Type<C0TypeClass> {
    switch (T.type) {
        case "value":
        case "<unknown>":
        case "string":
            return T;
        case "ptr":
            switch (T.kind) {
                case "arr":
                case "ptr":
                    return {type: T.type, kind: T.kind, value: removeTagOnType(T.value)}
                case "struct":
                    return T
            }
            break;  // To make TS Linter happy
        case "tagptr":
            return { type: T.type, value: {type: "<unknown>"} }
        case "funcptr":
            return { type: T.type }
    }
}

// Check if the type is "certain" - i.e. does not contain <unknown> on all levels
export function isCertainType(T: C0Type<C0TypeClass>): boolean {
    switch (T.type) {
        case "<unknown>":
            return false;
        case "value":
        case "funcptr":
        case "string":
            return true;
        case "ptr":
            switch (T.kind) {
                case "arr":
                case "ptr":
                    return isCertainType(T.value);
                case "struct":
                    return true;
            }
            break;  // To make TS Linter happy
        case "tagptr":
            return true;
    }
}

// Convert T* into function pointer type if T is a registered function type in F
export function stripFuncPtrType(T: C0Type<C0TypeClass>, F: Set<string>): C0Type<C0TypeClass> {
    // T is struct pointer type
    if (T.type === "ptr" && T.kind === "ptr" && T.value.type === "ptr" && T.value.kind === "struct") {
        if (F.has(T.value.value)) {
            return { type: "funcptr" }
        }  
    } else if (T.type === "ptr") {
        const internal_type = T.value;
        if (typeof internal_type !== "string") {
            T.value = stripFuncPtrType(internal_type, F);
        }
    } else if (T.type === "tagptr") {
        T.value = stripFuncPtrType(T.value, F) as C0Type<"ptr">;
    }
    return T;
}

/**
 * Type Narrowing functions that works better with TS type inference
 */

// Explicit Type Narrowing. I don't know how to make the const enum type as a parameter and 
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

export function maybeTagPointerType(V: C0Value<C0TypeClass>): V is C0Value<Maybe<"tagptr">> {
    return V.type.type === "tagptr" || V.type.type === "<unknown>";
}

export function maybeFuncPointerType(V: C0Value<C0TypeClass>): V is C0Value<Maybe<"funcptr">> {
    return V.type.type === "funcptr" || V.type.type === "<unknown>";
}

// A failed version of 
// export function maybeTypeOf<T extends C0TypeClass>(V: C0Value<C0TypeClass>): V is C0Value<Maybe<T>> {
//     return V.type.type === T || V.type.type === "<unknown>";
// }

export function isStringType(V: C0Value<C0TypeClass>): V is C0Value<"string"> {
    return V.type.type === "string";
}

export function isValueType(V: C0Value<C0TypeClass>): V is C0Value<"value"> {
    return V.type.type === "value";
}

export function isPointerType(V: C0Value<C0TypeClass>): V is C0Value<"ptr"> {
    return V.type.type === "ptr";
}

export function isUnknownType(V: C0Value<C0TypeClass>): V is C0Value<"<unknown>"> {
    return V.type.type === "<unknown>";
}

export function isTagPointerType(V: C0Value<C0TypeClass>): V is C0Value<"tagptr"> {
    return V.type.type === "tagptr";
}

export function isFuncPointerType(V: C0Value<C0TypeClass>): V is C0Value<"funcptr"> {
    return V.type.type === "funcptr";
}

export function is_struct_pointer(V: C0Value<"ptr">): V is {
    value: C0Pointer,
    type: {type: "ptr", kind: "ptr", value: {type: "ptr", kind: "struct", value: string, offset: number}}
} {
    const struct_type = V.type.value;
    if (typeof struct_type === "string" || struct_type.type !== "ptr" || struct_type.kind !== "struct") {
        return false;
    }
    return true;
}
