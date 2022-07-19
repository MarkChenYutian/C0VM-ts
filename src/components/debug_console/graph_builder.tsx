import { Node } from "react-flow-renderer";
import { calculate_node_height, valid_variable_count } from "../../utility/graphical_utility";

export function build_nodes(state: VM_State, mem: C0HeapAllocator):
Node<C0StackFrameNodeData | C0StructNodeData>[]
{
    // Step 1. Build stack memory nodes
    let [x, y] = [10, 10];
    const nodes:Node<any>[] = [];
    for (let i = 0; i < state.CallStack.length; i ++) {
        nodes.push({
            id: `stack-${i}`,
            position: {x, y},
            data: {frame: state.CallStack[i], mem: mem},
            type: "stackNode"
        });
        y += calculate_node_height(valid_variable_count(state.CallStack[i]));
    }
    nodes.push({
        id: `stack-${state.CallStack.length}`,
        position: {x, y},
        data: {frame: state.CurrFrame, mem: mem},
        type: "stackNode"
    });

    // Step 2. Build heap memory nodes
    

    return nodes;
}


