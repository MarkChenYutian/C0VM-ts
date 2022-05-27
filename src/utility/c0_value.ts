import { vm_error } from "./errors";

export function cvt_c0_value(value: boolean | number | string): C0Value{
    let view = new DataView(new ArrayBuffer(4));
    switch (typeof value) {
        case "boolean":
            view.setUint32(0, value ? 1 : 0);
            return ({
                vm_type: "value",
                type: "boolean",
                value: view
            });
        case "number":
            view.setUint32(0, value);
            return ({
                vm_type: "value",
                type: "int",
                value: view
            });
        case "string":
            let ascii_code = value.charCodeAt(0);
            ascii_code = ascii_code === NaN ? 0 : ascii_code;
            if (ascii_code < 0 || ascii_code > 127) {
                throw new vm_error("C0 standard only accepts ascii string (in range [0, 128))")
            }
            view.setUint8(0, ascii_code);
            return ({
                vm_type: "value",
                type: "string",
                value: view
            });
    }
}

export function build_c0_value(value: DataView, vm_type: C0ValueVMType, t?: C0ValueType): C0Value {
    return {
        value: value,
        type: t ? "<unknown>" : t,
        vm_type: vm_type
    };
}