import { loadString } from "../utility/string_utility";


function internal_print(s: string): boolean {
    return process.stdout.write(s);
}

export function c0_print(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.ptr>): boolean {
    return internal_print(loadString(arg1, mem));
}

export function c0_println(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.ptr>): boolean {
    c0_print(mem, arg1);
    return internal_print("\n");
}

export function c0_print_int(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.value>): boolean {
    return internal_print("" + arg1.value.getInt32(0));
}

export function c0_print_bool(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.value>): boolean {
    return internal_print(arg1.value.getUint32(0) === 0 ? "false" : "true");
}

export function c0_print_char(mem: C0HeapAllocator, arg1: C0Value<C0ValueVMType.value>): boolean {
    return internal_print(String.fromCharCode(arg1.value.getUint8(3)));
}
