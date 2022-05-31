import { vm_error } from "../utility/errors";

/**
 * Pop out a value from C0VM Stack with stack-size check
 * @param S Stack of C0VM
 * @returns The top of C0VM Stack
 * @throws `vm_error` if the stack S is empty
 */
export function safe_pop_stack(S: VM_OperandStack): C0Value<C0ValueVMType> {
    if (S.length < 1) throw new vm_error("Unable to pop value out of an empty stack!");
    return S.pop();
}


export function ptr2val_type_inference(T: C0PointerType): C0ValueType {
    switch (T) {
        case "<unknown>":
        case "<unknown>[]": 
        case "struct":
            return "<unknown>";
        case "boolean":
        case "boolean[]":
            return "boolean";
        case "char":
        case "char[]": 
            return "char";
        case "int":
        case "int[]":
            return "int";
        default: 
            throw new vm_error(`Unexpected pointer type ${T}`);
    }
}

export function ptr2ptr_type_inference(T: C0PointerType): C0PointerType {
    switch (T) {
        case "<unknown>":
        case "<unknown>[]":
            return "<unknown>";
        
        case "boolean":
        case "boolean[]":
            return "boolean";
        
        case "char":
        case "char[]":
            return "char";
        
        case "int":
        case "int[]":
            return "int";
        
        case "string":
        case "string[]":
            return "string";
        
        case "struct":
        case "struct[]":
            return "struct";
    }
}
