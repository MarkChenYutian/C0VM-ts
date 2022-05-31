import { vm_error } from "./errors";

export function cvt_c0_value(value: boolean | number | string): C0Value<C0ValueVMType.value>{
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

export function build_c0_ptrValue(value: C0Pointer, t?: C0PointerType): C0Value<C0ValueVMType.ptr> {
    return {
        value: value,
        type: t ? t : "<unknown>",
        vm_type: C0ValueVMType.ptr
    }    
}

export function build_c0_value(value: DataView, t?: C0ValueType): C0Value<C0ValueVMType.value> {
    return {
        value: value,
        type: t ? t : "<unknown>",
        vm_type: C0ValueVMType.value
    };
}

export function is_same_value(x: DataView, y: DataView): boolean {
    if (x.byteLength !== y.byteLength) return false;
    for (let i = 0; i < x.byteLength; i ++) {
        if (x.getUint8(i) !== y.getUint8(i)) return false;
    }
    return true;
}
