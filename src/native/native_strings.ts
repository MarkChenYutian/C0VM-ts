import { isNullPtr } from "../utility/pointer_ops";

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

