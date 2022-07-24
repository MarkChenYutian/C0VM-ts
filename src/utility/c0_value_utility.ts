/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract A pack of C0_value related utility functions
 * 
 * @description This file contains:
 * 1. Conversion between JS value (number | boolean | string) and C0 Value (w32)
 * 2. C0 value constructors with TS type annotation
 * 3. Compare if two C0 values are equal
 * 4. Expand C0 struct, array and pointers:
 *      * C0Value<T[]> => C0Value<T>[]
 *      * C0Value<*T> => C0Value<T>
 *      * C0Value<struct T> => C0StructJSEntry[]
 * 5. Render a C0 value into string for user interface
 */

import { vm_error } from "./errors";
import { read_ptr, shift_ptr } from "./pointer_utility";
import { internal_error } from "./errors";

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


/**
 * Expend an array pointer in C0Value into a list of C0Value.
 * 
 * @param mem The heap memory allocator that contains the array
 * @param V The pointer points to the start of array
 * @returns A list of values in the array V points to
 */
 export function expand_C0Array(
    mem: C0HeapAllocator,
    V: C0Value<"ptr">
): C0Value<C0TypeClass>[] {
    const [addr, , block_size] = read_ptr(V.value);
    const block = mem.deref(V.value);
    const elem_size = block.getInt32(0);
    const result = [];
    const childType = V.type.value as C0Type<C0TypeClass>
    if (childType.type === "value") {
        for (let offset = 4; offset < block_size; offset += elem_size) {
            switch (childType.value) {
                case "bool":
                case "char":
                    result.push({
                        value: new DataView(
                            new Uint8Array([0, 0, 0, block.getUint8(offset)]).buffer
                        ),
                        type: childType,
                    });
                    break;
                case "int":
                    result.push({
                        value: new DataView(
                            new Uint8Array([
                                block.getUint8(offset), block.getUint8(offset + 1), block.getUint8(offset + 2), block.getUint8(offset + 3)
                            ]).buffer
                        ),
                        type: childType,
                    });
                    break;
            }
        }
    } else {
        for (let offset = 4; offset < block_size; offset += elem_size) {
            result.push({
                value: new DataView(block.buffer.slice(
                    addr + offset,
                    addr + offset + elem_size
                )),
                type: childType,
            });
        }
    }
    return result;
}

/**
 * Dereference a C0Value Pointer and return the C0Value accordingly.
 * @param mem The heap memory allocator
 * @param V The C0Value Pointer you want to dereference
 * @returns The C0Value after dereference
 */
export function deref_C0Value(mem: C0HeapAllocator, V: C0Value<"ptr">): C0Value<C0TypeClass> 
{
    const block = mem.deref(V.value);
    const childType = V.type.value as C0Type<C0TypeClass>;
    if (childType.type === "value") {
        switch (childType.value) {
            case "bool":
            case "char":
                return {
                    type: childType,
                    value: new DataView(
                        new Uint8Array([0, 0, 0, block.getUint8(0)]).buffer
                    ),
                };
            case "int":
                return {
                    type: childType,
                    value: block,
                };
        }
    }
    if (childType.type === "string" || childType.type === "ptr") {
        return {
            type: childType,
            value: new DataView(
                block.buffer.slice(block.byteOffset, block.byteOffset + 8)
            ),
        };
    }
    return {
        type: childType,
        value: new DataView(
            block.buffer.slice(
                block.byteOffset,
                block.byteOffset + block.byteLength
            )
        ),
    };
}

export function expand_C0Struct(mem: C0HeapAllocator, typeRecord: Map<string, Map<number, Struct_Type_Record>>, v: C0Value<"ptr">): C0StructJSEntry[]{
    const struct_type = v.type.value;
    if (typeof struct_type === "string" || struct_type.type !== "ptr" || struct_type.kind !== "struct") {
        throw new internal_error("Receives a non-struct pointer");
    }

    const StructInformation = typeRecord.get(struct_type.value);
    if (StructInformation === undefined) return [];
    const StructFields: C0StructJSEntry[] = [];
    
    StructInformation.forEach(
        (record, offset) => {
            const record_type = record.type;
            const record_name = record.name;

            if (record_type === undefined) {
                StructFields.push({name: record_name, offset: offset, value: undefined});
                return;
            }

            let ptr_to_field: C0Value<"ptr"> = {
                value: shift_ptr(v.value, offset),
                type: {type: "ptr", kind: "ptr", value: record_type}
            };

            const deref_value = deref_C0Value(mem, ptr_to_field as C0Value<"ptr">);
            StructFields.push({
                name: record_name, offset: offset, value: deref_value
            })
        }
    );
    return StructFields;
}

/**
 * @param v C0Value to be "rendered"
 * @returns The string that shows C0Value that is interpreted correctly
 */
export function c0_value_cvt2_js_string(v: C0Value<"value">): string {
    switch (v.type.value) {
        case "bool":
        case "int":
            return "" + c0_cvt2_js_value(v);
        case "char":
            const string = c0_cvt2_js_value(v);
            if (string === "\n") {
                return "'\\n'";
            } else if (string === "\0") {
                return "'\\0'";
            }
            return "'" + string + "'";
    }
}
