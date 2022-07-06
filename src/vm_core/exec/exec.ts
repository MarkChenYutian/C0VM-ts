import * as Arithmetic from "../utility/arithmetic";
import * as TypeUtil from "../types/c0type_utility";

import { build_c0_ptrValue, build_c0_value, js_cvt2_c0_value, is_same_value, build_c0_stringValue } from "../utility/c0_value";
import { c0_memory_error, c0_user_error, vm_error, vm_instruct_error } from "../../utility/errors";
import { read_ptr, shift_ptr } from "../utility/pointer_ops";
import { loadString } from "../utility/string_utility";
import OpCode from "./opcode";

/**
 * Pop out a value from C0VM Stack with stack-size check
 * @param S Stack of C0VM
 * @returns The top of C0VM Stack
 * @throws `vm_error` if the stack S is empty
 */
function safe_pop_stack(typeRecord: Map<string, Map<number, Struct_Type_Record>>, S: VM_OperandStack): C0Value<C0TypeClass> {
    const V = S.pop();
    if (V === undefined) throw new vm_error("Unable to pop value out of an empty stack!");
    
    /**
     * Since in C0, there can't have struct on stack, a value with type of struct without ptr MUST be a poitner
     * to some field of the struct.
     * 
     * The code below will "auto-deboxing" the type information from type record pool.
     */
    if (V.type.type === "ptr" && V.type.kind === "struct") {
        const fields = typeRecord.get(V.type.value);
        if (fields !== undefined) {
            const deref_type = fields.get(V.type.offset)?.type;
            if (deref_type !== undefined) {
                return {
                    value: V.value,
                    type: deref_type
                };
            }
        }
    }
    return V;
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
        throw new vm_error("Failed to load mapping between executable bytecode and .bc0 linue number");
    }
    if (globalThis.DEBUG_DUMP_STEP) {
        console.log(`Executing OpCode: ${F.code[state.CurrFrame.PC]}@${state.CurrFrame.PC}. Mapped from ${comment.lineNumber}`);
        console.log(state.CurrFrame);
    }
    state.CurrLineNumber = comment.lineNumber;
    switch (F.code[state.CurrFrame.PC]) {
        // dup
        case OpCode.DUP: {
            state.CurrFrame.PC += 1;

            const v = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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
            safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            break;
        }

        // swap
        case OpCode.SWAP: {
            state.CurrFrame.PC += 1;

            const v2 = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const v1 = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            state.CurrFrame.S.push(v2);
            state.CurrFrame.S.push(v1);
            break;
        }

        // iadd
        case OpCode.IADD: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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
                state.CurrFrame.S.push( {value: v, type: { type: "<unknown>" }});
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

            const null_ptr = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
            state.CurrFrame.S.push(
                {
                    value: new DataView(null_ptr.buffer),
                    type: {type: "<unknown>"}
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
                throw new vm_error("Unable to load undefined local variable.");
            }
            state.CurrFrame.S.push(to_be_loaded);
            break;
        }

        // vstore
        case OpCode.VSTORE: {
            const idx = F.code[state.CurrFrame.PC + 1];

            state.CurrFrame.PC += 2;

            const val = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            state.CurrFrame.V[idx] = val;
            break;
        }

        // return
        case OpCode.RETURN: {
            state.CurrFrame.PC += 1;

            const retval = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (globalThis.DEBUG) {
                console.log(`return from <${state.CurrFrame.P.name}> with retval:`);
                console.log(retval);
            }
            const restore_frame = state.CallStack.pop();
            if (restore_frame === undefined) {
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

            const str_ptr = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (!TypeUtil.maybeStringType(str_ptr)) {
                throw new vm_error(`Type unmatch: expected a pointer in C0Value, received a ${str_ptr.type.type}`);
            }
            throw new c0_user_error(loadString(str_ptr, allocator));
        }

        // assert
        case OpCode.ASSERT: {
            state.CurrFrame.PC += 1;

            const str_ptr = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (!TypeUtil.maybeStringType(str_ptr)) {
                throw new vm_error(`Type unmatch: expected a string in C0Value, received a ${str_ptr.type.type}`);
            }
            const val = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (!TypeUtil.maybeValueType(val)) {
                throw new vm_error(`Type unmatch: expected a value in C0Value, received a ${str_ptr.type.type}`);
            }
            if (val.value.getUint32(0) === 0) {
                throw new c0_user_error(loadString(str_ptr, allocator));
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

            const v1 = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const v2 = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const v1 = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const v2 = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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

            const y = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
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
            const o2 = view.getInt8(state.CurrFrame.PC + 2);
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

            if (native_F === undefined) {
                throw new vm_instruct_error("Native function not implemented yet!");
            }

            for (let i = 0; i < native_F.numArgs; i ++) {
                args.unshift(safe_pop_stack(state.TypeRecord, state.CurrFrame.S));
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
            for (let i = called_F.numArgs - 1; i >= 0; i --) {
                called_F_vars[i] = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            }
            // Switch Context
            state.CallStack.push(state.CurrFrame);
            if (state.CallStack.length > globalThis.C0_MAX_RECURSION) {
                throw new c0_memory_error("Maximum Recursion Depth Exceeded (current maximum: " + globalThis.C0_MAX_RECURSION + " )");
            }
            state.CurrFrame = {
                PC: 0,
                S: [],
                V: called_F_vars,
                P: called_F
            };
            break;
        }

        case OpCode.NEW: {
            const s = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;

            const ptr = allocator.malloc(s);
            //@ts-ignore
            const T = TypeUtil.String2Type(comment.dataType);
            state.CurrFrame.S.push(
                build_c0_ptrValue(
                    ptr, "ptr", T
                )
            );
            break;
        }

        case OpCode.IMLOAD: {
            state.CurrFrame.PC += 1;

            const a = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (a.type.type !== "ptr" && a.type.type !== "<unknown>") {
                throw new vm_error("Type unmatch, IMLOAD expect to receive a pointer");
            }
            const mem_block = allocator.imload(a.value);
            state.CurrFrame.S.push(
                build_c0_value(mem_block, "int")
            );
            break;
        }

        case OpCode.IMSTORE: {
            state.CurrFrame.PC += 1;
            
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const a = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if ((x.type.type !== "value" && x.type.type !== "<unknown>")
                || 
                (a.type.type !== "ptr" && a.type.type !== "<unknown>")) {
                throw new vm_error("Type unmatch, IMSTORE expected to have {ptr, value}");
            }
            allocator.imstore( a.value, x.value );

            /**
             * Type Inference Type(a<unknown>) => Type(a<int>)
             */
            if (a.type.type !== "<unknown>") {
                const a_concrete = a.type.value;
                if (typeof a_concrete !== "string" && a_concrete.type === "ptr" && a_concrete.kind === "struct") {
                    const struct_field_record = state.TypeRecord.get(a_concrete.value);
                    if (struct_field_record === undefined) state.TypeRecord.set(a_concrete.value, new Map());

                    let struct_field_entry = (state.TypeRecord.get(a_concrete.value) as Map<number, Struct_Type_Record>).get(a_concrete.offset);
                    struct_field_entry = Object.assign(struct_field_entry === undefined ? {} : struct_field_entry, {type: x.type});
                    (state.TypeRecord.get(a_concrete.value) as Map<number, Struct_Type_Record>).set(a_concrete.offset, struct_field_entry);

                }
            }

            break;
        }

        case OpCode.AMLOAD: {
            state.CurrFrame.PC += 1;
            
            const a = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (!TypeUtil.maybePointerType(a)) {
                throw new vm_error("Type unmatch, AMLOAD expect to receive a pointer");
            }
            const mem_block = allocator.amload(a.value);
            if (a.type.type === "ptr") {
                if (a.type.kind === "struct") {
                    state.CurrFrame.S.push(
                        {value: mem_block, type: (TypeUtil.getType(a.type, state.TypeRecord))}
                    )
                } else {
                    state.CurrFrame.S.push(
                        {value: mem_block, type: (a.type.value)}
                    );
                }
            } else {
                state.CurrFrame.S.push(
                    {value: mem_block, type: {type: "<unknown>"}}
                );
            }
            
            break;
        }

        case OpCode.AMSTORE: {
            state.CurrFrame.PC += 1;
            
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const a = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);

            if ((x.type.type !== "ptr" && x.type.type !== "<unknown>" && x.type.type !== "string")
                || 
                (a.type.type !== "ptr" && a.type.type !== "<unknown>" && a.type.type !== "string")) {
                throw new vm_error("Type unmatch, AMSTORE expected to have {ptr|string, ptr|string}");
            }
            allocator.amstore( a.value, x.value );

            /**
             * Type Inference Type(x) => Type(a)
             */
            if (a.type.type !== "<unknown>") {
                const a_concrete = a.type.value as C0Type<"ptr">;
                if (a_concrete.kind === "struct") {
                    const struct_field_record = state.TypeRecord.get(a_concrete.value);
                    if (struct_field_record === undefined) state.TypeRecord.set(a_concrete.value, new Map());

                    let struct_field_entry = (state.TypeRecord.get(a_concrete.value) as Map<number, Struct_Type_Record>).get(a_concrete.offset);
                    struct_field_entry = Object.assign(struct_field_entry === undefined ? {} : struct_field_entry, {type: x.type});
                    (state.TypeRecord.get(a_concrete.value) as Map<number, Struct_Type_Record>).set(a_concrete.offset, struct_field_entry);
                }
            }
            break;
        }

        case OpCode.CMLOAD: {
            state.CurrFrame.PC += 1;
            
            const a = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (!TypeUtil.maybePointerType(a)) {
                throw new vm_error("Type unmatch, CMLOAD expect to receive a pointer");
            }
            const mem_block = allocator.cmload(a.value);
            if (a.type.type === "ptr") {
                state.CurrFrame.S.push({
                    value: mem_block,
                    type: (a.type.value as C0Type<"value">)
                });
            } else {
                state.CurrFrame.S.push({
                    value: mem_block,
                    type: {type: "<unknown>"}
                });
            }
            break;
        }

        case OpCode.CMSTORE: {
            state.CurrFrame.PC += 1;
            
            const x = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const a = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if ((x.type.type !== "value" && x.type.type !== "<unknown>")
                || 
                (a.type.type !== "ptr" && a.type.type !== "<unknown>")) {
                throw new vm_error("Type unmatch, CMSTORE expected to have {ptr, value}");
            }
            allocator.cmstore( a.value, x.value );

            /**
             * Type Inference Type(a<unknown>), Type(x) => Type(a) = Type(x)
             */
             if (a.type.type !== "<unknown>") {
                const a_concrete = a.type.value;
                if (typeof a_concrete !== "string" && a_concrete.type === "ptr" && a_concrete.kind === "struct") {
                    const struct_field_record = state.TypeRecord.get(a_concrete.value);
                    if (struct_field_record === undefined) state.TypeRecord.set(a_concrete.value, new Map());
                    
                    let struct_field_entry = (state.TypeRecord.get(a_concrete.value) as Map<number, Struct_Type_Record>).get(a_concrete.offset);
                    struct_field_entry = Object.assign(struct_field_entry === undefined ? {} : struct_field_entry, {type: x.type});
                    (state.TypeRecord.get(a_concrete.value) as Map<number, Struct_Type_Record>).set(a_concrete.offset, struct_field_entry);
                }
            }

            break;
        }

        case OpCode.AADDF: {
            const f = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;
            
            const a = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (!TypeUtil.maybePointerType(a)) {
                throw new vm_error("Type unmatch, AADDF expect to receive a pointer");
            }
            const off_ptr = shift_ptr(a.value, f);

            if (a.type.type === "ptr") {
                const new_type = (TypeUtil.CloneType(a.type) as C0Type<"ptr">);
                const child_type = new_type.value as C0Type<C0TypeClass>;
                if (child_type.type !== "ptr" || child_type.kind !== "struct") {
                    throw new vm_error("AADDF should only be applied on a struct pointer");
                }
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


                state.CurrFrame.S.push(
                    {
                        value: off_ptr,
                        type: new_type
                    }
                );
            } else {
                state.CurrFrame.S.push(
                    {value: off_ptr, type: {type: "<unknown>"}}
                );   
            }
            break;
        }

        case OpCode.NEWARRAY: {
            const f = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;

            const a = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (a.type.type !== "value" && a.type.type !== "<unknown>") {
                throw new vm_error("Type unmatch, NEWARRAY expect to receive a value");
            }

            // for the +4 in this malloc, See explanation of t[] in README.md
            const ptr = allocator.malloc(f * a.value.getUint32(0) + 4);
            const comment_str = comment.dataType;
            const type = comment_str === undefined ? {type: "<unknown>"} : TypeUtil.String2Type(comment_str);
            allocator.deref(ptr).setUint32(0, f);
            state.CurrFrame.S.push(
                {
                    value: ptr,
                    //@ts-ignore
                    type: {type: "ptr", kind: "arr", value: type}
                }
            );
            break;
        }

        case OpCode.ARRAYLENGTH: {
            state.CurrFrame.PC += 1;

            const a = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (a.type.type !== "ptr" && a.type.type !== "<unknown>") {
                throw new vm_error("Type unmatch, expected to have pointer");
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

            const i = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            const a = safe_pop_stack(state.TypeRecord, state.CurrFrame.S);
            if (!TypeUtil.maybeValueType(i) || a.type.type !== "ptr") {
                throw new vm_error("Type unmatch, expected to have {ptr, value}");
            }

            const s = allocator.deref(a.value).getUint32(0);
            if (a.type.kind === "arr") {
                // if (a.type.value.type === "value" || a.type.value.type === "string") {
                    state.CurrFrame.S.push(
                        {
                            value: shift_ptr(a.value, 4 + s * i.value.getUint32(0)), 
                            type: {
                                type: "ptr",
                                kind: "ptr",
                                value: (a.type.value as C0Type<C0TypeClass>)
                            }
                        }
                    )
                // } else {
                //     state.CurrFrame.S.push(
                //         {
                //             value: shift_ptr(a.value, 4 + s * i.value.getUint32(0)), 
                //             type: (a.type.value as C0Type<"ptr">)
                //         }
                //     );
                // }
            } else {
                throw new vm_error("AADDS is only expected to apply on ptr<arr> type.")
            }
            break;
        }

        default: {
            throw new vm_error(`Undefined instruction ${F.code[state.CurrFrame.PC]}`);
        }
    }
    return true;
}
