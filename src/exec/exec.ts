import * as arithmetic from "../utility/arithmetic";
import { copy_dataview } from "../utility/array_buffer";
import { build_c0_value } from "../utility/c0_value";
import { vm_error } from "../utility/errors";
import { safe_pop_stack } from "./helpers";

export function step(state: VM_State, allocator: C0HeapAllocator, msg_handle: MessageEmitter): C0Value | undefined {
    switch (state.F.code[state.PC]) {
        // dup
        case 0x59: {
            state.PC += 1;

            const v = safe_pop_stack(state.S);
            const nv = build_c0_value(
                copy_dataview(v.value), v.vm_type, v.type
            );

            state.S.push(v);
            state.S.push(nv);
            break;
        }

        // pop
        case 0x57: {
            state.PC += 1;
            safe_pop_stack(state.S);
            break;
        }

        // swap
        case 0x5F: {
            state.PC += 1;

            const v2 = safe_pop_stack(state.S);
            const v1 = safe_pop_stack(state.S);
            state.S.push(v2);
            state.S.push(v1);
            break;
        }

        // iadd
        case 0x60: {
            state.PC += 1;

            const y = safe_pop_stack(state.S);
            const x = safe_pop_stack(state.S);
            state.S.push(
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
            state.PC += 1;

            const y = safe_pop_stack(state.S);
            const x = safe_pop_stack(state.S);
            state.S.push(
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
            state.PC += 1;

            const y = safe_pop_stack(state.S);
            const x = safe_pop_stack(state.S);
            state.S.push(
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
            state.PC += 1;

            const y = safe_pop_stack(state.S);
            const x = safe_pop_stack(state.S);
            state.S.push(
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
            state.PC += 1;

            const y = safe_pop_stack(state.S);
            const x = safe_pop_stack(state.S);
            state.S.push(
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
            state.PC += 1;

            const y = safe_pop_stack(state.S);
            const x = safe_pop_stack(state.S);
            state.S.push(
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
            state.PC += 1;

            const y = safe_pop_stack(state.S);
            const x = safe_pop_stack(state.S);
            state.S.push(
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
            state.PC += 1;

            const y = safe_pop_stack(state.S);
            const x = safe_pop_stack(state.S);
            state.S.push(
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
            state.PC += 1;

            const y = safe_pop_stack(state.S);
            const x = safe_pop_stack(state.S);
            state.S.push(
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
            state.PC += 1;

            const y = safe_pop_stack(state.S);
            const x = safe_pop_stack(state.S);
            state.S.push(
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
            state.PC += 1;

            state.S.push(
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
            const b = new DataView(state.F.code.buffer)
                .getInt8(state.PC + 1);
            const rebuild_type = state.F.comment.get(state.PC).dataType;

            state.PC += 2;

            const v = new DataView(new ArrayBuffer(4));
            v.setInt32(0, b);
            state.S.push(
                build_c0_value(
                    v,
                    "value",
                    rebuild_type ? rebuild_type : "<unknown>"
                )
            );
            break;
        }

        default:
            throw new vm_error(`Undefined instruction ${state.F.code[state.PC]}`);
    }
    return undefined;
}
