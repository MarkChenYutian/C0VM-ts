import { vm_error } from "./errors";
import { read_ptr } from "./pointer_ops";

/**
 * Converting JavaScript primitive into C0Value
 * @param value The JavaScript value that is going to be converted into C0Value
 * @returns A C0Value<C0ValueVMType.value>
 */
export function js_cvt2_c0_value(value: boolean | number | string): C0Value<C0ValueVMType.value> {
    let view = new DataView(new ArrayBuffer(4));
    switch (typeof value) {
        case "boolean":
            view.setUint32(0, value ? 1 : 0);
            return ({
                vm_type: C0ValueVMType.value,
                type: "boolean",
                value: view
            });
        case "number":
            view.setUint32(0, value);
            return ({
                vm_type: C0ValueVMType.value,
                type: "int",
                value: view
            });
        case "string":
            let ascii_code = value.charCodeAt(0);
            ascii_code = ascii_code === NaN ? 0 : ascii_code;
            if (ascii_code < 0 || ascii_code > 127) {
                throw new vm_error("C0 standard only accepts ascii string (in range [0, 128))")
            }
            view.setUint8(3, ascii_code);
            return ({
                vm_type: C0ValueVMType.value,
                type: "char",
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
export function c0_cvt2_js_value(value: C0Value<C0ValueVMType>): number | string | boolean {
    if (value.vm_type === C0ValueVMType.ptr) {
        const [addr, offset, size] = read_ptr(value.value);
        return addr + offset;
    } else {
        switch (value.type) {
            case "int": {
                return value.value.getInt32(0);
            }
            case "char": {
                return String.fromCharCode(value.value.getUint8(3));                
            }
            case "boolean": {
                return value.value.getUint32(0) !== 0;
            }
            case "<unknown>": {
                return value.value.getInt32(0);
            }
        }
    }
}


/**
 * Wrap up a C0Pointer into a C0Value<C0ValueVMType.ptr>
 * @param value The C0Pointer that is going to be wrapped into C0Value
 * @param t Optional - the type of object that the pointer is pointing to
 * @returns A constructed C0Value
 */
export function build_c0_ptrValue(value: C0Pointer, t: C0PointerType<C0PointerNames>): C0Value<C0ValueVMType.ptr> {
    return {
        value: value,
        type: t,
        vm_type: C0ValueVMType.ptr
    }
}

/**
 * Wrap up a DataView into a C0Value<C0ValueVMType.value>
 * @param value The Dataview that is going to be wrapped into C0Value
 * @param t Optional - the type of object that represented by the DataView passed in
 * @returns A constructed C0Value
 */
export function build_c0_value(value: DataView, t: C0ValueType): C0Value<C0ValueVMType.value> {
    return {
        value: value,
        type: t,
        vm_type: C0ValueVMType.value
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
