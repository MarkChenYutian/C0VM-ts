import * as arithmetic from "../utility/arithmetic";
import { copy_dataview } from "../utility/array_buffer";
import { build_c0_value, cvt_c0_value } from "../utility/c0_value";
import { vm_error } from "../utility/errors";
import { shift_ptr } from "../utility/pointer_ops";
import { safe_pop_stack } from "./helpers";

export function step(state: VM_State, allocator: C0HeapAllocator, msg_handle: MessageEmitter): boolean {
    const F = state.CurrFrame.P; // the function that is currently running on
    switch (F.code[state.CurrFrame.PC]) {
        // dup
        case 0x59: {
            state.CurrFrame.PC += 1;

            const v = safe_pop_stack(state.CurrFrame.S);
            const nv = build_c0_value(
                copy_dataview(v.value), v.vm_type, v.type
            );

            state.CurrFrame.S.push(v);
            state.CurrFrame.S.push(nv);
            break;
        }

        // pop
        case 0x57: {
            state.CurrFrame.PC += 1;
            safe_pop_stack(state.CurrFrame.S);
            break;
        }

        // swap
        case 0x5F: {
            state.CurrFrame.PC += 1;

            const v2 = safe_pop_stack(state.CurrFrame.S);
            const v1 = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(v2);
            state.CurrFrame.S.push(v1);
            break;
        }

        // iadd
        case 0x60: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.CurrFrame.S);
            const x = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(
                build_c0_value(
                    arithmetic.c_add(x.value, y.value),
                    "value",
                    "int"
                )
            );
            break;
        }

        // iand
        case 0x7E: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.CurrFrame.S);
            const x = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(
                build_c0_value(
                    arithmetic.c_and(x.value, y.value),
                    "value",
                    "int"
                )
            );
            break;
        }

        // idiv
        case 0x6c: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.CurrFrame.S);
            const x = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(
                build_c0_value(
                    arithmetic.c_div(x.value, y.value), 
                    "value",
                    "int"
                )
            );
            break;
        }

        // imul
        case 0x68: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.CurrFrame.S);
            const x = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(
                build_c0_value(
                    arithmetic.c_mul(x.value, y.value, msg_handle), 
                    "value",
                    "int"
                )
            );
            break;
        }

        // ior
        case 0x80: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.CurrFrame.S);
            const x = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(
                build_c0_value(
                    arithmetic.c_or(x.value, y.value),
                    "value",
                    "int"
                )
            );
            break;
        }

        // irem
        case 0x70: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.CurrFrame.S);
            const x = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(
                build_c0_value(
                    arithmetic.c_rem(x.value, y.value),
                    "value",
                    "int"
                )
            );
            break;
        }

        // ishl
        case 0x78: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.CurrFrame.S);
            const x = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(
                build_c0_value(
                    arithmetic.c_lsh(x.value, y.value),
                    "value",
                    "int"
                )
            );
            break;
        }

        // ishr
        case 0x7a: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.CurrFrame.S);
            const x = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(
                build_c0_value(
                    arithmetic.c_rsh(x.value, y.value),
                    "value",
                    "int"
                )
            );
            break;
        }

        // isub
        case 0x64: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.CurrFrame.S);
            const x = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(
                build_c0_value(
                    arithmetic.c_sub(x.value, y.value),
                    "value",
                    "int"
                )
            );
            break;
        }

        // ixor
        case 0x82: {
            state.CurrFrame.PC += 1;

            const y = safe_pop_stack(state.CurrFrame.S);
            const x = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.S.push(
                build_c0_value(
                    arithmetic.c_xor(x.value, y.value),
                    "value",
                    "int"
                )
            );
            break;
        }

        // aconst_null
        case 0x01: {
            state.CurrFrame.PC += 1;

            state.CurrFrame.S.push(
                build_c0_value(
                    new DataView(new ArrayBuffer(8)),
                    "ptr", "<unknown>"
                )
            );
            break;
        }

        // bipush
        case 0x10: {
            // in this case, we will have sign extension
            const b = F.code[state.CurrFrame.PC + 1];
            let rebuild_type: C0ValueType = F.comment.get(state.CurrFrame.PC).dataType;

            if (rebuild_type === undefined) {
                rebuild_type = "<unknown>"
            }

            state.CurrFrame.PC += 2;

            const v = new DataView(new ArrayBuffer(4));
            v.setInt32(0, b);
            state.CurrFrame.S.push(
                build_c0_value(
                    v,
                    "value",
                    rebuild_type
                )
            );
            break;
        }

        // ildc
        case 0x13: {
            const c1 = F.code[state.CurrFrame.PC + 1];
            const c2 = F.code[state.CurrFrame.PC + 2];
            const idx = (c1 << 8) | c2;

            state.CurrFrame.PC += 3;

            state.CurrFrame.S.push(cvt_c0_value(
                state.P.intPool[idx]
            ));
            break;
        }

        // aldc
        case 0x14: {
            const c1 = F.code[state.CurrFrame.PC + 1];
            const c2 = F.code[state.CurrFrame.PC + 2];
            const idx = (c1 << 8) | c2;

            state.CurrFrame.PC += 3;

            state.CurrFrame.S.push({
                type: "string",
                vm_type: "ptr",
                value: shift_ptr(state.C.stringPoolPtr, idx)
            });
            break;
        }

        // aconst_null
        case 0x01: {
            state.CurrFrame.PC += 1;

            const null_ptr = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
            state.CurrFrame.S.push({
                type: "<unknown>",
                vm_type: "ptr",
                value: new DataView(null_ptr.buffer)
            });
            break;
        }

        // vload
        case 0x15: {
            const idx = F.code[state.CurrFrame.PC + 1];

            state.CurrFrame.PC += 2;

            if (state.CurrFrame.V[idx] === undefined) {
                throw new vm_error("Unable to load undefined local variable.");
            }
            state.CurrFrame.S.push(state.CurrFrame.V[idx]);
            break;
        }

        // vstore
        case 0x36: {
            const idx = F.code[state.CurrFrame.PC + 1];

            state.CurrFrame.PC += 2;

            const val = safe_pop_stack(state.CurrFrame.S);
            state.CurrFrame.V[idx] = val;
            break;
        }

        // return
        case 0xB0: {
            const retval = safe_pop_stack(state.CurrFrame.S);
            console.log(`return from <${state.CurrFrame.P.name}> with retval:`);
            console.log(retval);

            return false;
        }

        default: {
            throw new vm_error(`Undefined instruction ${F.code[state.CurrFrame.PC]}`);
        }
    }
    return true;
}
