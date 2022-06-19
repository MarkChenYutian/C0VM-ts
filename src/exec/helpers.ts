import { vm_error } from "../utility/errors";

/**
 * Pop out a value from C0VM Stack with stack-size check
 * @param S Stack of C0VM
 * @returns The top of C0VM Stack
 * @throws `vm_error` if the stack S is empty
 */
export function safe_pop_stack(S: VM_OperandStack): C0Value<C0TypeClass> {
    if (S.length < 1) throw new vm_error("Unable to pop value out of an empty stack!");
    return S.pop();
}
