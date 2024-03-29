import * as Arithmetic from "../utility/arithmetic";
import * as TypeUtil from "../../utility/c0_type_utility";

import { build_c0_ptrValue, build_c0_value, js_cvt2_c0_value, is_same_value, build_c0_stringValue } from "../../utility/c0_value_utility";
import { c0_assertion_error, c0_memory_error, c0_user_error, vm_error } from "../../utility/errors";
import { build_null_ptr, isNullPtr, read_ptr, shift_ptr } from "../../utility/pointer_utility";
import { loadString } from "../../utility/string_utility";
import { create_tagptr, read_tagptr } from "../../utility/tag_ptr_utility";
import { create_funcPtr, read_funcPtr } from "../../utility/func_ptr_utility";
import OpCode from "./opcode";

/**
 * Pop out a value from C0VM Stack with stack-size check
 * @param S Stack of C0VM
 * @returns The top of C0VM Stack
 * @throws `vm_error` if the stack S is empty
 */
function safe_pop_stack(
    state: VM_State,
    mem: C0HeapAllocator
): C0Value<C0TypeClass> {
    const V = state.CurrFrame.S.pop();
    if (V === undefined) throw new vm_error("Unable to pop value out of an empty stack!");
    
    let ret_val = V;

    /**
     * Since in C0, there can't have struct on stack, a value with type of struct without ptr MUST be a poitner
     * to some field of the struct.
     * 
     * The code below will "auto-deboxing" the type information from type record pool.
     */
    if (TypeUtil.isPointerType(V) && V.type.kind === "struct") {
        const fields = state.TypeRecord.get(V.type.value);
        if (fields !== undefined) {
            const deref_type = fields.get(V.type.offset)?.type;
            if (deref_type !== undefined) {
                ret_val = { value: V.value, type: deref_type };
            }
        }
    }

    /**
     * In C1, a tagged pointer's actual type can be found by searching through tagRecord
     */
    if (TypeUtil.isTagPointerType(V) && V.type.value.type === "<unknown>" && !isNullPtr(V.value)) {
        const [, tag] = read_tagptr(V.value, mem);
        const actualType = state.TagRecord.get(tag);
        if (actualType !== undefined) {
            ret_val = {value: V.value, type: {type: "tagptr", value: actualType}}
        }
    }

    return ret_val;
}


function updateTypeRecord(state: VM_State, a: C0Value<C0TypeClass>, x: C0Value<C0TypeClass>){
    if (TypeUtil.isPointerType(a) && TypeUtil.is_struct_pointer(a) && TypeUtil.isCertainType(x.type)){
        const a_concrete = a.type.value;
        let struct_field_record = state.TypeRecord.get(a_concrete.value);

        if (struct_field_record === undefined) {
            struct_field_record = new Map();
        }

        let field_type_record = struct_field_record.get(a_concrete.offset);

        if (field_type_record === undefined){
            field_type_record = {}
        }
        struct_field_record.set(a_concrete.offset, {name: field_type_record.name, type: TypeUtil.removeTagOnType(x.type)});

        state.TypeRecord.set(a_concrete.value, struct_field_record);
    }
}

/**
 * Main function of C0VM.ts, perform transformation on VM_State and allocator
 * @param state Current state of virtual machine
 * @param allocator The heap memory allocator of current VM
 * @returns `true` if the VM is still able to "step forward"
 * @returns `false` if this step is the last step of current program
 */
export function step(state: VM_State, allocator: C0HeapAllocator, UIHooks: ReactUIHook): boolean {
    const F = state.CurrFrame.P; // the function that is currently running on
    const comment = F.comment.get(state.CurrFrame.PC);
    if (comment === undefined) {
        if (DEBUG) {
            console.warn(`Expect comment field on function ${F.name} at PC=${state.CurrFrame.PC}.\nHint: Last line number executed = ${state.CurrLineNumber}.`);
        }
        throw new vm_error("Failed to load mapping between executable bytecode and .bc0 linue number");
    }
    if (globalThis.DEBUG_DUMP_STEP) {
        console.log(`Executing OpCode: ${F.code[state.CurrFrame.PC]}@${state.CurrFrame.PC}. Mapped from ${comment.lineNumber}`);
        console.log(state.CurrFrame);
    }
    // Update line number
    state.CurrLineNumber = comment.lineNumber;
    state.CurrC0RefLine  = comment.c0RefNumber;
    //
    switch (F.code[state.CurrFrame.PC]) {
        // dup
        case OpCode.DUP: {
            state.CurrFrame.PC += 1;

            const v = safe_pop_stack(state, allocator);
            const nv = {
                    value: new DataView(v.value.buffer.slice(v.value.byteOffset, v.value.byteLength)),
                    type: TypeUtil.CloneType(v.type)
                };

            state.CurrFrame.S.push(v);
            state.CurrFrame.S.push(nv);
            break;
        }

        // pop
        case OpCode.POP: {
            state.CurrFrame.PC += 1;
            safe_pop_stack(state, allocator);
            break;
        }

        // swap
        case OpCode.SWAP: {
            state.CurrFrame.PC += 1;

            const v2 = safe_pop_stack(state, allocator);
            const v1 = safe_pop_stack(state, allocator);
            state.CurrFrame.S.push(v2);
            state.CurrFrame.S.push(v1);
            break;
        }

        // iadd
        case OpCode.IADD: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IADD expect (value, value)`);
            }

            state.CurrFrame.S.push(
                build_c0_value(
                    Arithmetic.c_add(x.value, y.value),
                    "int"
                )
            );
            break;
        }

        // iand
        case OpCode.IAND: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IAND expect (value, value)`);
            }

            state.CurrFrame.S.push(
                build_c0_value(
                    Arithmetic.c_and(x.value, y.value),
                    "int"
                )
            );
            break;
        }

        // idiv
        case OpCode.IDIV: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IDIV expect (value, value)`);
            }

            state.CurrFrame.S.push(
                build_c0_value(
                    Arithmetic.c_div(x.value, y.value), 
                    "int"
                )
            );
            break;
        }

        // imul
        case OpCode.IMUL: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IMUL expect (value, value)`);
            }

            state.CurrFrame.S.push(
                build_c0_value(
                    Arithmetic.c_mul(x.value, y.value, globalThis.MSG_EMITTER), 
                    "int"
                )
            );
            break;
        }

        // ior
        case OpCode.IOR: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IOR expect (value, value)`);
            }

            state.CurrFrame.S.push(
                build_c0_value(
                    Arithmetic.c_or(x.value, y.value),
                    "int"
                )
            );
            break;
        }

        // irem
        case OpCode.IREM: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IREM expect (value, value)`);
            }

            state.CurrFrame.S.push(
                build_c0_value(
                    Arithmetic.c_rem(x.value, y.value),
                    "int"
                )
            );
            break;
        }

        // ishl
        case OpCode.ISHL: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: ISHL expect (value, value)`);
            }

            state.CurrFrame.S.push(
                build_c0_value(
                    Arithmetic.c_lsh(x.value, y.value),
                    "int"
                )
            );
            break;
        }

        // ishr
        case OpCode.ISHR: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: ISHR expect (value, value)`);
            }

            state.CurrFrame.S.push(
                build_c0_value(
                    Arithmetic.c_rsh(x.value, y.value),
                    "int"
                )
            );
            break;
        }

        // isub
        case OpCode.ISUB: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: ISUB expect (value, value)`);
            }

            state.CurrFrame.S.push(
                build_c0_value(
                    Arithmetic.c_sub(x.value, y.value),
                    "int"
                )
            );
            break;
        }

        // ixor
        case OpCode.IXOR: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IXOR expect (value, value)`);
            }

            state.CurrFrame.S.push(
                build_c0_value(
                    Arithmetic.c_xor(x.value, y.value),
                    "int"
                )
            );
            break;
        }

        // bipush
        case OpCode.BIPUSH: {
            // in this case, we will have sign extension
            const b = new DataView(F.code.buffer).getInt8(state.CurrFrame.PC + 1);
            const type_note = comment.dataType;
            state.CurrFrame.PC += 2;

            const v = new DataView(new ArrayBuffer(4));
            v.setInt32(0, b);

            if (type_note === undefined) {
                if (DEBUG) console.warn(`BIPUSH reconstruction failed on line ${state.CurrLineNumber}`)
                throw new vm_error("BIPUSH type reconstruction failed!");
            } else {
                state.CurrFrame.S.push( build_c0_value(v, (type_note as C0ValueTypes)) );
            }
            break;
        }

        // ildc
        case OpCode.ILDC: {
            const c1 = F.code[state.CurrFrame.PC + 1];
            const c2 = F.code[state.CurrFrame.PC + 2];
            const idx = (c1 << 8) | c2;

            state.CurrFrame.PC += 3;

            // Sorry, things are ugly when endianness came in
            state.CurrFrame.S.push(js_cvt2_c0_value(
                new DataView(state.P.intPool.buffer).getInt32(idx * 4, false)
            ));
            break;
        }

        // aldc
        case OpCode.ALDC: {
            const c1 = F.code[state.CurrFrame.PC + 1];
            const c2 = F.code[state.CurrFrame.PC + 2];
            const idx = (c1 << 8) | c2;

            state.CurrFrame.PC += 3;

            state.CurrFrame.S.push(
                build_c0_stringValue(shift_ptr(state.C.stringPoolPtr, idx))
            );
            break;
        }

        // aconst_null
        case OpCode.ACONST: {
            state.CurrFrame.PC += 1;

            state.CurrFrame.S.push(
                {
                    value: build_null_ptr(),
                    type: {type: "ptr", kind: "ptr", value: {type: "<unknown>"}}
                }
            );
            break;
        }

        // vload
        case OpCode.VLOAD: {
            const idx = F.code[state.CurrFrame.PC + 1];

            state.CurrFrame.PC += 2;
            const to_be_loaded = state.CurrFrame.V[idx];
            if (to_be_loaded === undefined) {
                throw new vm_error("Uninitialized value: Loading a local variable before it is initialized");
            }

            const var_name = comment.varName;
            if (var_name !== undefined) state.CurrFrame.V_Name[idx] = var_name;

            state.CurrFrame.S.push(to_be_loaded);
            break;
        }

        // vstore
        case OpCode.VSTORE: {
            const idx = F.code[state.CurrFrame.PC + 1];

            state.CurrFrame.PC += 2;

            const val = safe_pop_stack(state, allocator);

            // In case that someone set local var to NULL deliberately
            const to_be_replaced = state.CurrFrame.V[idx];
            if (!TypeUtil.isCertainType(val.type) 
                && to_be_replaced !== undefined 
                && TypeUtil.isCertainType(to_be_replaced.type)
                ) 
            {
                val.type = TypeUtil.removeTagOnType(to_be_replaced.type);
            }

            state.CurrFrame.V[idx] = val;

            const var_name = comment.varName;
            if (var_name !== undefined) state.CurrFrame.V_Name[idx] = var_name;

            break;
        }

        // return
        case OpCode.RETURN: {
            state.CurrFrame.PC += 1;

            const retval = safe_pop_stack(state, allocator);

            if (globalThis.DEBUG) {
                console.log(`return from <${state.CurrFrame.P.name}> with retval:`);
                console.log(retval);
            }

            const restore_frame = state.CallStack.pop();
            if (restore_frame === undefined) {
                // We are run out of code - program exit from main()
                return false;
            } else {
                state.CurrFrame = restore_frame;
                state.CurrFrame.S.push(retval);
            }
            break;
        }

        // athrow
        case OpCode.ATHROW: {
            state.CurrFrame.PC += 1;

            const str_ptr = safe_pop_stack(state, allocator);
            if (!TypeUtil.maybeStringType(str_ptr)) {
                throw new vm_error(`Type unmatch: ATHROW expect (string)`);
            }
            const err_prompt = loadString(str_ptr, allocator);
            throw new c0_user_error(err_prompt);
        }

        // assert
        case OpCode.ASSERT: {
            state.CurrFrame.PC += 1;

            const str_ptr = safe_pop_stack(state, allocator);
            const val = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeStringType(str_ptr) || !TypeUtil.maybeValueType(val)) {
                throw new vm_error(`Type unmatch: ASSERT expect (value, string)`);
            }

            if (val.value.getUint32(0) === 0) {
                const err_prompt = loadString(str_ptr, allocator).substring(45);
                throw new c0_assertion_error(err_prompt);
            }
            break;
        }

        case OpCode.NOP: {
            state.CurrFrame.PC += 1;
            break;
        }

        case OpCode.IF_CMPEQ: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const offset = (o1 << 8) | o2;

            const v1 = safe_pop_stack(state, allocator);
            const v2 = safe_pop_stack(state, allocator);
            if (is_same_value(v1.value, v2.value)) {
                state.CurrFrame.PC += offset
            } else {
                state.CurrFrame.PC += 3
            }
            break;
        }

        case OpCode.IF_CMPNE: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const offset = (o1 << 8) | o2;

            const v1 = safe_pop_stack(state, allocator);
            const v2 = safe_pop_stack(state, allocator);
            if (!is_same_value(v1.value, v2.value)) {
                state.CurrFrame.PC += offset
            } else {
                state.CurrFrame.PC += 3
            }
            break;
        }

        case OpCode.IF_ICMPLT: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const offset = (o1 << 8) | o2;

            
            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IF_ICMPLT expect (value, value)`);
            }

            if (x.value.getInt32(0) < y.value.getInt32(0)) {
                state.CurrFrame.PC += offset
            } else {
                state.CurrFrame.PC += 3
            }
            break;
        }

        case OpCode.IF_ICMPGT: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const offset = (o1 << 8) | o2;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IF_ICMPGT expect (value, value)`);
            }

            if (x.value.getInt32(0) > y.value.getInt32(0)) {
                state.CurrFrame.PC += offset
            } else {
                state.CurrFrame.PC += 3
            }
            break;
        }

        case OpCode.IF_ICMPGE: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const offset = (o1 << 8) | o2;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IF_ICMPGE expect (value, value)`);
            }

            if (x.value.getInt32(0) >= y.value.getInt32(0)) {
                state.CurrFrame.PC += offset
            } else {
                state.CurrFrame.PC += 3
            }
            break;
        }

        case OpCode.IF_ICMPLE: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const offset = (o1 << 8) | o2;

            const y = safe_pop_stack(state, allocator);
            const x = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybeValueType(y)){
                throw new vm_error(`Type unmatch: IF_ICMPLE expect (value, value)`);
            }

            if (x.value.getInt32(0) <= y.value.getInt32(0)) {
                state.CurrFrame.PC += offset
            } else {
                state.CurrFrame.PC += 3
            }
            break;
        }

        case OpCode.GOTO: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getUint8(state.CurrFrame.PC + 2);
            const offset = (o1 << 8) | o2;
            state.CurrFrame.PC += offset;
            break;
        }

        case OpCode.INVOKENATIVE: {
            const c1 = F.code[state.CurrFrame.PC + 1];
            const c2 = F.code[state.CurrFrame.PC + 2];
            state.CurrFrame.PC += 3;

            const fidx = (c1 << 8) | c2;
            const native_F = state.P.nativePool[fidx];
            const args: C0Value<C0TypeClass>[] = [];

            for (let i = 0; i < native_F.numArgs; i ++) {
                args.unshift(safe_pop_stack(state, allocator));
            }
            
            const res = native_F.f(UIHooks, allocator, ...args);
            state.CurrFrame.S.push(res);
            break;
        }

        case OpCode.INVOKESTATIC: {
            const c1 = F.code[state.CurrFrame.PC + 1];
            const c2 = F.code[state.CurrFrame.PC + 2];
            state.CurrFrame.PC += 3;

            // Load Called Function
            const fidx = (c1 << 8) | c2;
            const called_F = state.P.functionPool[fidx];

            // Extract Arguments
            const called_F_vars: VM_LocalVariables = new Array(called_F.numVars).fill(undefined);
            const called_F_varNames: string[] =  new Array(called_F.numVars).fill("<Anonymous>");
            for (let i = called_F.numArgs - 1; i >= 0; i --) {
                called_F_vars[i] = safe_pop_stack(state, allocator);
                called_F_varNames[i] = called_F.argName[i]; // fill in argument names
            }
            // Switch Context
            state.CallStack.push(state.CurrFrame);
            if (state.CallStack.length > globalThis.C0_MAX_RECURSION) {
                throw new c0_memory_error("Maximum Recursion Depth Exceeded (current max depth: " + globalThis.C0_MAX_RECURSION + " )");
            }
            state.CurrFrame = {
                PC: 0,
                S: [],
                V: called_F_vars,
                V_Name:called_F_varNames,
                P: called_F
            };
            break;
        }

        case OpCode.NEW: {
            const s = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;

            const ptr = allocator.malloc(s);
            const T = TypeUtil.stripFuncPtrType(TypeUtil.String2Type(comment.dataType as string), state.FuncTypeRecord);
            state.CurrFrame.S.push(
                build_c0_ptrValue(ptr, "ptr", T)
            );
            break;
        }

        case OpCode.IMLOAD: {
            state.CurrFrame.PC += 1;

            const a = safe_pop_stack(state, allocator);
            if (!TypeUtil.maybePointerType(a)) {
                throw new vm_error(`Type unmatch: IMLOAD expect (pointer)`);
            }

            const mem_block = allocator.imload(a.value);
            state.CurrFrame.S.push(
                build_c0_value(mem_block, "int")
            );
            break;
        }

        case OpCode.IMSTORE: {
            state.CurrFrame.PC += 1;
            
            const x = safe_pop_stack(state, allocator);
            const a = safe_pop_stack(state, allocator);
            if (!TypeUtil.maybeValueType(x)|| !TypeUtil.maybePointerType(a)) {
                throw new vm_error(`Type unmatch: IMSTORE expect (pointer, value)`);
            }
            allocator.imstore( a.value, x.value );

            /**
             * Type Inference Type(a<unknown>) => Type(a<int>)
             * Since we call imstore on a struct pointer, we know that this offset in
             * the struct must stores an integer
             * 
             * Fix: Issue #5, when Type(x) is <unknown>, we should not update the record
             */
            updateTypeRecord(state, a, x);
            break;
        }

        case OpCode.AMLOAD: {
            state.CurrFrame.PC += 1;
            
            const a = safe_pop_stack(state, allocator);
            if (!TypeUtil.maybePointerType(a)) {
                throw new vm_error("Type unmatch, AMLOAD expect to receive a pointer");
            }
            const mem_block = allocator.amload(a.value);

            if (TypeUtil.isPointerType(a)){
                if (a.type.kind === "struct"){
                    state.CurrFrame.S.push({value: mem_block, type: a.type});
                } else {
                    state.CurrFrame.S.push({value: mem_block, type: a.type.value});
                }
            } else {
                state.CurrFrame.S.push({value: mem_block, type: {type: "<unknown>"}});
            }
            break;
        }

        case OpCode.AMSTORE: {
            state.CurrFrame.PC += 1;
            
            const x = safe_pop_stack(state, allocator);
            const a = safe_pop_stack(state, allocator);

            if ((!TypeUtil.maybePointerType(x) && 
                 !TypeUtil.maybeStringType(x) && 
                 !TypeUtil.maybeTagPointerType(x) &&
                 !TypeUtil.maybeFuncPointerType(x))
                 || (!TypeUtil.maybePointerType(a))){
                throw new vm_error("Type unmatch, AMSTORE expected to have (pointer, [pointer | string | tag_ptr | funcptr])");
            }
            allocator.amstore( a.value, x.value );

            /**
             * Type Inference Type(x) => Type(a)
             * If x and a are not unknown, then we can and a refers to struct T*, we can use x's type
             * info to inference the type info of struct T* at offset = a.type.value.offset.
             * 
             * Fix: Issue #5, when Type(x) is <unknown>, we should not update the record to prevent overwriting existing record.
             */
            updateTypeRecord(state, a, x);
            break;
        }

        case OpCode.CMLOAD: {
            state.CurrFrame.PC += 1;
            
            const a = safe_pop_stack(state, allocator);
            if (!TypeUtil.maybePointerType(a)) {
                throw new vm_error("Type unmatch, CMLOAD expect to receive (pointer)");
            }
            const mem_block = allocator.cmload(a.value);
            
            if (TypeUtil.isPointerType(a) && a.type.kind !== "struct"){
                state.CurrFrame.S.push({value: mem_block, type: a.type.value});
            } else {
                state.CurrFrame.S.push({value: mem_block, type: {type: "<unknown>"}});
            }
            break;
        }

        case OpCode.CMSTORE: {
            state.CurrFrame.PC += 1;
            
            const x = safe_pop_stack(state, allocator);
            const a = safe_pop_stack(state, allocator);
            if (!TypeUtil.maybeValueType(x) || !TypeUtil.maybePointerType(a)) {
                throw new vm_error("Type unmatch, CMSTORE expected to receive (pointer, value)");
            }
            allocator.cmstore( a.value, x.value );

            /**
             * Type Inference Type(a<unknown>), Type(x) => Type(a) = Type(x)
             */
            updateTypeRecord(state, a, x)

            break;
        }

        case OpCode.AADDF: {
            const f = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;
            
            const a = safe_pop_stack(state, allocator);
            if (!TypeUtil.maybePointerType(a)) {
                throw new vm_error("Type unmatch, AADDF expect to receive a pointer");
            }

            if (isNullPtr(a.value)) {
                throw new c0_memory_error("Trying to shift the NULL pointer");
            }

            const off_ptr = shift_ptr(a.value, f);

            const new_type = TypeUtil.CloneType(a.type);
            const new_value = {value: off_ptr, type: new_type};

            if (TypeUtil.isPointerType(new_value)) {
                if (!TypeUtil.is_struct_pointer(new_value)) {
                    console.log(new_value);
                    console.log(state.CurrC0RefLine);
                    console.log(state.CurrLineNumber);
                    throw new vm_error("AADDF should only be applied on a struct pointer");
                }

                const child_type = new_value.type.value;
                child_type.offset += f;

                // Register the field name on type record.
                
                if (state.TypeRecord.get(child_type.value) === undefined) {
                    state.TypeRecord.set(child_type.value, new Map<number, Struct_Type_Record>());
                }
                const struct_type_fields = state.TypeRecord.get(child_type.value) as Map<number, Struct_Type_Record>;
                let struct_field_entry = struct_type_fields.get(child_type.offset);
                
                struct_field_entry = Object.assign(struct_field_entry === undefined ? {} : struct_field_entry, {name: 
                    F.comment.get(state.CurrFrame.PC - 2)?.fieldName
                });

                (state.TypeRecord.get(child_type.value) as Map<number, Struct_Type_Record>).set(child_type.offset, struct_field_entry);

                state.CurrFrame.S.push(new_value);
            } else {
                state.CurrFrame.S.push({value: off_ptr, type: {type: "<unknown>"}});
            }
            break;
        }

        case OpCode.NEWARRAY: {
            const f = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;

            const a = safe_pop_stack(state, allocator);
            if (!TypeUtil.maybeValueType(a)) {
                throw new vm_error("Type unmatch, NEWARRAY expect to receive a value");
            }

            // for the +4 in this malloc, See explanation of t[] in Execution/C0Value and Pointer
            const ptr = allocator.malloc(f * a.value.getUint32(0) + 4);
            const comment_str = comment.dataType;
            const elem_type = comment_str === undefined ? 
                {type: "<unknown>"} : 
                TypeUtil.stripFuncPtrType(TypeUtil.String2Type(comment_str), state.FuncTypeRecord);
            
            // the first 4 bytes of array is used to store the size of each element
            allocator.deref(ptr).setUint32(0, f);
            
            // For some unknown reason, TS checker constantly mark the line below as error
            //@ts-ignore
            const arr_pointer : C0Value<C0TypeClass> = {value: ptr, type: {type: "ptr", kind: "arr", value: elem_type}};

            state.CurrFrame.S.push(arr_pointer);
            break;
        }

        case OpCode.ARRAYLENGTH: {
            state.CurrFrame.PC += 1;

            const a = safe_pop_stack(state, allocator);
            if (!TypeUtil.maybePointerType(a)) {
                throw new vm_error("Type unmatch, ARRAYLENGTH expected to receive pointer");
            }

            const [, , size] = read_ptr(a.value);
            const s = allocator.deref(a.value).getUint32(0);
            const length = (size - 4) / s
            state.CurrFrame.S.push(
                js_cvt2_c0_value(length)
            );
            break;
        }

        case OpCode.AADDS: {
            state.CurrFrame.PC += 1;

            const i = safe_pop_stack(state, allocator);
            const a = safe_pop_stack(state, allocator);
            if (!TypeUtil.maybeValueType(i) || !TypeUtil.maybePointerType(a)) {
                throw new vm_error("Type unmatch, AADDS expected to have {ptr, value}");
            }

            const elem_size = allocator.deref(a.value).getUint32(0);
            let elem_ptr;
            try {
                elem_ptr = shift_ptr(a.value, 4 + elem_size * i.value.getUint32(0));    
            } catch (error) {
                /**
                 * New in v1.2.2, wrap around the shift_ptr function to provide more user-friendly
                 * error message.
                 */
                const [, offset, block_size] = read_ptr(a.value);
                const index = i.value.getUint32(0);
                const length = (block_size - 4 - offset) / elem_size;
                throw new c0_memory_error(`Array index out-of-bound. Try to access index ${index} in array with length ${length}`);
            }

            if (TypeUtil.isUnknownType(a)){
                state.CurrFrame.S.push(
                    {
                        value: elem_ptr, 
                        type: {type: "ptr", kind: "ptr", value: {type: "<unknown>"}}
                    }
                );
            } else if (TypeUtil.isPointerType(a) && a.type.kind === "arr") {
                state.CurrFrame.S.push(
                    {
                        value: elem_ptr, 
                        type: {type: "ptr", kind: "ptr", value: a.type.value}
                    }
                );
            } else {
                throw new vm_error("Type unmatch: AADDS is only expected to apply on ptr<arr> type.");
            }
            break;
        }

        case OpCode.CHECKTAG: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const tag = (o1 << 8) | o2;
            state.CurrFrame.PC += 3;

            const p = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeTagPointerType(p)) {
                throw new vm_error("Type unmatch: CHECKTAG is only expected to apply on <TagPtr> type.");
            }

            if (isNullPtr(p.value)) break;
            const [raw_ptr, p_tag] = read_tagptr(p.value, allocator);
            if (tag !== p_tag) throw new c0_memory_error(`Failing CHECKTAG, expect ${tag}, received ${p_tag}`);

            let raw_ptr_type: C0Type<C0TypeClass> = {type: "<unknown>"};
            if (!TypeUtil.isUnknownType(p)) {
                raw_ptr_type = (p as any as C0Value<"tagptr">).type.value
            }

            state.CurrFrame.S.push({type: raw_ptr_type, value: raw_ptr});

            break;
        }

        case OpCode.HASTAG: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const tag = (o1 << 8) | o2;
            state.CurrFrame.PC += 3;

            const p = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybeTagPointerType(p)) {
                throw new vm_error("Type unmatch: HASTAG is only expected to apply on <TagPtr> type.");
            }

            let is_match_tag = false;
            if (isNullPtr(p.value)) {
                is_match_tag = true;
            } else {
                const [, p_tag] = read_tagptr(p.value, allocator);
                is_match_tag = tag === p_tag;
            }
            state.CurrFrame.S.push(js_cvt2_c0_value(is_match_tag));

            break;
        }

        case OpCode.ADDTAG: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const tag = (o1 << 8) | o2;
            state.CurrFrame.PC += 3;

            const p = safe_pop_stack(state, allocator);

            if (!TypeUtil.maybePointerType(p)) {
                throw new vm_error("Type unmatch: HASTAG is only expected to apply on <ptr> type.");
            }

            const tag_ptr = create_tagptr(p.value, tag, allocator);

            if (!TypeUtil.isUnknownType(p)) state.TagRecord.set(tag, p.type as C0Type<"ptr">);

            state.CurrFrame.S.push({
                type: {type: "tagptr", value: p.type},
                value: tag_ptr
            });
            break;
        }

        case OpCode.ADDROF_STATIC: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const index = (o1 << 8) | o2;
            state.CurrFrame.PC += 3;

            state.CurrFrame.S.push(create_funcPtr(index, state.P, false));
            break;
        }

        case OpCode.ADDROF_NATIVE: {
            const view = new DataView(F.code.buffer);
            const o1 = view.getInt8(state.CurrFrame.PC + 1);
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
            const index = (o1 << 8) | o2;
            state.CurrFrame.PC += 3;

            state.CurrFrame.S.push(create_funcPtr(index, state.P, true));
            break;
        }

        case OpCode.INVOKEDYNAMIC: {
            state.CurrFrame.PC += 1;

            const fp = safe_pop_stack(state, allocator);
            if (!TypeUtil.isFuncPointerType(fp)) {
                throw new vm_error(`Type unmatch: INVOKEDYNAMIC is only expected to apply on <funcptr> type`);
            }

            const [fIndex, isNative] = read_funcPtr(fp);

            if (isNative) {
                const native_F = state.P.nativePool[fIndex];
                const args: C0Value<C0TypeClass>[] = [];

                for (let i = 0; i < native_F.numArgs; i ++) {
                    args.unshift(safe_pop_stack(state, allocator));
                }
                
                const res = native_F.f(UIHooks, allocator, ...args);
                state.CurrFrame.S.push(res);
            } else {
                const called_F = state.P.functionPool[fIndex];

                // Extract Arguments
                const called_F_vars: VM_LocalVariables = new Array(called_F.numVars).fill(undefined);
                const called_F_varNames: string[] = new Array(called_F.numVars).fill("<Anonymous>");

                for (let i = called_F.numArgs - 1; i >= 0; i --) {
                    called_F_vars[i] = safe_pop_stack(state, allocator);
                    called_F_varNames[i] = called_F.argName[i];
                }
                // Switch Context
                state.CallStack.push(state.CurrFrame);
                if (state.CallStack.length > globalThis.C0_MAX_RECURSION) {
                    throw new c0_memory_error("Maximum Recursion Depth Exceeded (current max depth: " + globalThis.C0_MAX_RECURSION + " )");
                }
                state.CurrFrame = {
                    PC: 0,
                    S: [],
                    V: called_F_vars,
                    V_Name: called_F_varNames,
                    P: called_F
                };
            }
            
            break;
        }

        default: {
            throw new vm_error(`Undefined instruction ${F.code[state.CurrFrame.PC]}`);
        }
    }
    return true;
}
