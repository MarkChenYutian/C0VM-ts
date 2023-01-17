/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract A pack of function pointer related utility function including
 * creating and reading function pointer.
 */

import { vm_error } from "./errors";

function create_native_funcPtr(index: number, code: C0ByteCode): C0Value<"funcptr"> {
    if (index >= code.nativeCount) throw new vm_error(
        `Trying to create a native function pointer with index of ${index}, but there are only ${code.nativeCount} natives in current program`
    );

    const fp_type: C0Type<"funcptr"> = {type: "funcptr"};
    const fp_buf = new Uint8Array(8).buffer;
    const fp     = new DataView(fp_buf);
    fp.setUint8(0, 0xAE);   // Set nAtivE (native) flag
    fp.setUint32(4, index); // Store the function index

    return {type: fp_type, value: fp};
}

function create_static_funcPtr(index: number, code: C0ByteCode): C0Value<"funcptr"> {
    if (index >= code.functionCount) throw new vm_error(
        `Trying to create a static function pointer with index of ${index}, but there are only ${code.functionCount} statics in current program`
    );

    const fp_type: C0Type<"funcptr"> = {type: "funcptr"};

    const fp_buf = new Uint8Array(8).buffer;
    const fp     = new DataView(fp_buf);
    fp.setUint8(0, 0xAC);   // Set stAtiC (static) flag
    fp.setUint32(4, index); // Store the function index

    return {type: fp_type, value: fp};
}


export function read_funcPtr(fp: C0Value<"funcptr">): [number, boolean] {
    const fp_val  = fp.value;
    const fp_flag = fp_val.getUint8(0);
    const fp_idx  = fp_val.getUint32(4);
    let is_native = false;

    if (fp_flag === 0xAC) {
        is_native = false;
    } else if (fp_flag === 0xAE) {
        is_native = true;
    } else {
        console.warn(fp);
        throw new vm_error(`Failed to read function pointer, does not have correct flag.`);
    }

    return [fp_idx, is_native];
}


export function create_funcPtr(index: number, code: C0ByteCode, isNative: boolean): C0Value<"funcptr"> {
    if (isNative) return create_native_funcPtr(index, code);
    return create_static_funcPtr(index, code);
}


