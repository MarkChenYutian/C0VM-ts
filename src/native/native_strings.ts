import { c0_cvt2_js_value } from "../utility/c0_value";
import { vm_error } from "../utility/errors";
import { isNullPtr, read_ptr } from "../utility/pointer_ops";
import { loadString } from "../utility/string_utility";

function allocate_js_string(mem: C0HeapAllocator, s: string): C0Pointer {
    const ptr = mem.malloc(s.length + 1);
    const block = mem.deref(ptr);
    for (let i = 0; i < s.length; i ++) {
        block.setUint8(i, s.charCodeAt(i));
    }
    block.setUint8(s.length, 0);    // NUL Terminator
    return ptr;
}

export function c0_string_compare(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.ptr>, arg2: C0Value<C0ValueVMType.ptr>): number {
    const byte_arr_1 = isNullPtr(arg1.value) ? new DataView(new ArrayBuffer(0)) : mem.deref(arg1.value);
    const byte_arr_2 = isNullPtr(arg1.value) ? new DataView(new ArrayBuffer(0)) : mem.deref(arg2.value);

    const dec = new TextDecoder();
    const str_1 = dec.decode(byte_arr_1);
    const str_2 = dec.decode(byte_arr_2);
    return str_1 < str_2 ? -1 : (str_1 > str_2 ? 1 : 0)
}


export function c0_string_equal(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.ptr>, arg2: C0Value<C0ValueVMType.ptr>): boolean {
    return c0_string_compare(mem, arg1, arg2) === 0;
}

export function c0_string_frombool(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.value>): C0Pointer {
    arg1.type = "boolean";
    return allocate_js_string(mem, c0_cvt2_js_value(arg1) ? "true" : "false");
}

export function c0_string_fromchar(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.value>): C0Pointer {
    arg1.type = "char";
    return allocate_js_string(mem, c0_cvt2_js_value(arg1) as string);
}

export function c0_string_fromint(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.value>): C0Pointer {
    arg1.type = "int";
    return allocate_js_string(
        mem, 
        "" + c0_cvt2_js_value(arg1)
    );
}

export function c0_string_join(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.ptr>, arg2: C0Value<C0ValueVMType.ptr>): C0Pointer {
    return allocate_js_string(
        mem,
        loadString(arg1, mem) + loadString(arg2, mem)
    );
}

export function c0_string_length(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.ptr>): number {
    return loadString(arg1, mem).length;
}

export function c0_string_to_chararray(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.ptr>): C0Pointer {
    const str = loadString(arg1, mem);
    const ptr = mem.malloc(str.length + 1 + 4);
    const mem_block = mem.deref(ptr);
    mem_block.setUint32(0, 1);   // Each char use 4 bytes of space
    for (let i = 0; i < str.length; i ++) {
        mem_block.setUint8(4 + i, str.charCodeAt(i));   // Fill in the data
    }
    mem_block.setUint8(str.length + 4, 0);  // NUL Terminator
    return ptr;
}

export function c0_string_from_chararray(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.ptr>): C0Pointer {
    const mem_block = mem.deref(arg1.value);
    if (mem_block.getUint8(0) !== 1) throw new vm_error("String from Chararray receive array with elem size other than 1");
    const [addr, offset, size] = read_ptr(arg1.value);
    const length = size - offset;
    let str = "";
    for (let i = 0; i < length; i ++) {
        str = str + String.fromCharCode(mem_block.getUint8(4 + i));
    }
    return allocate_js_string(mem, str);
}
