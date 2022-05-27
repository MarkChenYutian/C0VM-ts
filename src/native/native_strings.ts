import { c0_value_error } from "../utility/errors";
import { read_ptr } from "../utility/pointer_ops";

export function c0_string_compare(mem: C0HeapAllocator, arg1: C0Value, arg2: C0Value): number {
    if (arg1.class !== 'ptr' || arg2.class !== 'ptr') {
        throw new c0_value_error("String compare only receives strings on heap memory");
    }
    const [addr1, offset1, size1] = read_ptr(arg1.value);
    const [addr2, offset2, size2] = read_ptr(arg2.value);

    const byte_arr_1 = addr1 === 0 ? new DataView(new ArrayBuffer(0)) : mem.deref(arg1.value, size1 - offset1);
    const byte_arr_2 = addr2 === 0 ? new DataView(new ArrayBuffer(0)) : mem.deref(arg2.value, size2 - offset2);

    const dec = new TextDecoder();
    const str_1 = dec.decode(byte_arr_1);
    const str_2 = dec.decode(byte_arr_2);
    return str_1 < str_2 ? -1 : (str_1 > str_2 ? 1 : 0)
}


export function c0_string_equal(mem: C0HeapAllocator, arg1: C0Value, arg2: C0Value): boolean {
    return c0_string_compare(mem, arg1, arg2) === 0;
}

