import { vm_error } from "../../utility/errors";

/**
 * Converting JavaScript primitive into C0Value
 * @param value The JavaScript value that is going to be converted into C0Value
 * @returns A C0Value<C0ValueVMType.value>
 */
export function js_cvt2_c0_value(value: boolean | number | string): C0Value<"value"> {
    let view = new DataView(new ArrayBuffer(4));
    switch (typeof value) {
        case "boolean":
            view.setUint32(0, value ? 1 : 0);
            return ({
                type: {type: "value", value: "bool"},
                value: view
            });
        case "number":
            view.setUint32(0, value);
            return ({
                type: {type: "value", value: "int"},
                value: view
            });
        case "string":
            let ascii_code = value.charCodeAt(0);
            ascii_code = isNaN(ascii_code) ? 0 : ascii_code;
            if (ascii_code < 0 || ascii_code > 127) {
                throw new vm_error("C0 standard only accepts ascii string (in range [0, 128))")
            }
            view.setUint8(3, ascii_code);
            return ({
                type: {type: "value", value: "char"},
                value: view
            });
    }
}

/**
 * Converting C0Value back to JS Value
 * 
 * * C0Value<C0ValueVMType.ptr> => number - the address the pointer is pointing at
 * * C0Value<C0ValueVMType.value> => number | string | boolean - depends on the type, 
 * if <type> is <unknown>, then return the number (`getInt32(0)`) directly.
 * @param value The C0 Value that is going to be converted to a JS value
 */
export function c0_cvt2_js_value(value: C0Value<Maybe<"value">>): number | string | boolean {
    if (value.type.type === "<unknown>") {
        return value.value.getInt32(0);
    }
    switch (value.type.value) {
        case "int": {
            return value.value.getInt32(0);
        }
        case "char": {
            return String.fromCharCode(value.value.getUint8(3));                
        }
        case "bool": {
            return value.value.getUint32(0) !== 0;
        }
    };
}

/**
 * Wrap up a DataView into a C0Value<C0ValueVMType.value>
 * @param value The Dataview that is going to be wrapped into C0Value
 * @param t Optional - the type of object that represented by the DataView passed in
 * @returns A constructed C0Value
 */
export function build_c0_value(value: DataView, t?: C0ValueTypes): C0Value<Maybe<"value">> {
    if (t === undefined) {
        return { value: value, type: { type: "<unknown>" } }
    }
    return {
        value: value,
        type: { type: "value", value: t }
    };
}

export function build_c0_ptrValue(value: C0Pointer, kind: "arr" | "ptr", dest_type?: C0Type<C0TypeClass>): C0Value<"ptr"> {
    return {
        value: value,
        type: { 
            type: "ptr", kind: kind, value: 
                dest_type === undefined ? { type: "<unknown>" } : dest_type
        }
    };
}


export function build_c0_stringValue(value: C0Pointer): C0Value<"string"> {
    return {
        value: value,
        type: {
            type: "string",
            value: "string"
        }
    };
}

/**
 * Compares whether two dataview have the same data.
 */
export function is_same_value(x: DataView, y: DataView): boolean {
    if (x.byteLength !== y.byteLength) return false;
    for (let i = 0; i < x.byteLength; i++) {
        if (x.getUint8(i) !== y.getUint8(i)) return false;
    }
    return true;
}
