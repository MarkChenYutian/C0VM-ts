import { vm_error } from "../utility/errors";

export function safe_pop_stack(S: VM_OperandStack): C0Value {
    if (S.length < 1) throw new vm_error("Unable to pop value out of an empty stack!");
    return S.pop();
}

