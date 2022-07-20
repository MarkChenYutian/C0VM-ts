import { Node } from "react-flow-renderer";
import { is_struct_pointer } from "../../utility/debug_utility";
import { internal_error } from "../../utility/errors";
import { calculate_node_height, valid_variable_count } from "../../utility/graphical_utility";

export function build_nodes(state: VM_State, mem: C0HeapAllocator):
Node<C0StackFrameNodeData | C0StructNodeData>[]
{
    // Step 1. Build stack memory nodes
    let [x, y] = [10, 10];
    let nodes:Node<any>[] = [];
    for (let i = 0; i < state.CallStack.length; i ++) {
        nodes.push({
            id: `stack-${i}`,
            position: {x, y},
            data: {frame: state.CallStack[i], mem: mem},
            type: "stackNode"
        });
        y += calculate_node_height(valid_variable_count(state.CallStack[i]), "frame");
    }
    nodes.push({
        id: `stack-${state.CallStack.length}`,
        position: {x, y},
        data: {frame: state.CurrFrame, mem: mem},
        type: "stackNode"
    });

    // Step 2. Build heap memory nodes
    nodes = nodes.concat(DFS_heap_get_nodes(state, mem));

    return nodes;
}

function DFS_heap_get_nodes(state: VM_State, mem: C0HeapAllocator) {
    const job_list = scan_stack_get_ptrs(state);

    const output: Node<C0StructNodeData>[] = [];
    let [x, y] = [400, 10];

    while (job_list.length > 0) {
        const curr_node = job_list.pop();
        let struct_height = 0;

        if (curr_node === undefined) break;
        if (is_struct_pointer(curr_node)){
            output.push({
                id: `heap-${curr_node.value.getUint32(0)}`,
                position: {x, y},
                data: {ptr: curr_node, mem: mem, typeRecord: state.TypeRecord},
                type: "structNode"
            });
            struct_height = (state.TypeRecord.get(get_struct_name_from_ptr(curr_node)) ?? new Map()).size;
        }
        y += calculate_node_height(struct_height, "struct");
    }

    return output;
}


function scan_stack_get_ptrs(state: VM_State): C0Value<"ptr">[] {
    let result = [];

    for (let i = 0; i < state.CallStack.length; i ++) {
        const frame = state.CallStack[i];
        for (let j = 0; j < frame.V.length; j ++) {
            const val = frame.V[j];
            if (val !== undefined && val.type.type === "ptr") {
                result.push(val as C0Value<"ptr">);
            }
        }
    }
    for (let j = 0; j < state.CurrFrame.V.length; j ++) {
        const val = state.CurrFrame.V[j];
        if (val !== undefined && val.type.type === "ptr") {
            result.push(val as C0Value<"ptr">);
        }
    }
    return result;
}

function get_struct_name_from_ptr(ptr: C0Value<"ptr">): string {
    if (!is_struct_pointer(ptr)){
        if (DEBUG) console.log(ptr);
        throw new internal_error("get_struct_name_from_ptr() receives non-struct-ptr.");
    }
    const subtype = ptr.type.value as C0Type<"ptr">;
    return subtype.value as string;
}
