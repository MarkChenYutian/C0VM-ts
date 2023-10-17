/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract Given VM State, Memory Allocation, and typedef information, 
 * return a set of nodes and edges that forms the graphical debugger display
 * 
 * This file is not used ... It's an attempt to replace the graph_builder.ts (failed)
 */
import * as TypeUtil from "../../../utility/c0_type_utility";
import { internal_error } from "../../../utility/errors";
import { Node, Edge } from "reactflow";
import { calculate_node_height, valid_variable_count, is_valid_var } from "./graphical_utility";
import { read_ptr } from "../../../utility/pointer_utility";


type StackNodeID = `stack-${number}`;
type HeapNodeID  = `heap-${number}`;
type SourceID    = `src-${number}`;
type EdgeID      = `${SourceID}@${StackNodeID|HeapNodeID}>${HeapNodeID}`;
type HeapPointer = {level: number, to: C0Value<"ptr"|"tagptr">, srcid: StackNodeID|HeapNodeID, dstid: HeapNodeID, selfid: EdgeID};

type StackNode   = Node< C0StackFrameNodeData > & {id: StackNodeID};
type HeapNode    = Node< C0ArrayNodeData | C0ValueNodeData | C0PointerNodeData | C0TagPointerData > & {id: HeapNodeID}

function getStackNodeID(id: number): StackNodeID { return `stack-${id}`; }
function getHeapNodeID(addr: number): HeapNodeID { return `heap-${addr}`; }
function getSourceID(cnt: number): SourceID { return `src-${cnt}`; }
function getEdgeID(srcid: SourceID, src: StackNodeID|HeapNodeID, dst: HeapNodeID): EdgeID { return `${srcid}@${src}>${dst}`; }

function createStackNodeData(
    cnt     : number,
    position: [number, number],
    state   : VM_State,
    frame   : VM_StackFrame,
    mem     : C0HeapAllocator,
    isActive: boolean,
    typedef : Map<SourceType, AliasType>
): StackNode {
    return {
        id: getStackNodeID(cnt),
        position: {x: position[0], y: position[1]},
        data: {frame, mem, typedef, state, dragged: false, isActive},
        type: "stackNode",
        draggable: false
    };
}

/**
 * Generate an array of stack nodes from the current VM state
 */
function generateStackNodes(
    state: VM_State,
    mem: C0HeapAllocator,
    typedef: Map<SourceType, AliasType>
): StackNode[] {
    let [xCoord, yCoord] = [0, 0];
    const all_stack = [state.CurrFrame, ...state.CallStack.reverse()];
    const stackNodes: StackNode[] = [];
    for (let i = 0; i < all_stack.length; i ++) {
        stackNodes.push(
            createStackNodeData(i, [xCoord, yCoord], state, state.CallStack[i], mem, false, typedef)
        );
        yCoord += calculate_node_height(valid_variable_count(state.CallStack[i]), "frame");
    }
    return stackNodes
}

/**
 * Retrieve the pointer from stack -> heap as starting frontier for the BFS 
 * heap scan algorithm
 */
function retrieveStackPointers(state: VM_State): HeapPointer[] {
    const all_stacks: VM_StackFrame[] = [state.CurrFrame, ...state.CallStack.reverse()];
    const stack_ptrs: HeapPointer[] = [];
    for (let s = 0; s < all_stacks.length; s ++) {
        const stack = all_stacks[s];

        for (let i = 0; i < stack.V.length; i ++) {
            const V = stack.V[i];
            if (!is_valid_var(stack.V_Name[i])) continue;

            if (V !== undefined && (TypeUtil.isTagPointerType(V) || TypeUtil.isPointerType(V))) {
                const srcId = getSourceID(i);
                const srcNodeId = getStackNodeID(s);
                const [dstAddr, , ] = read_ptr(V.value);
                const dstNodeId = getHeapNodeID(dstAddr);
                stack_ptrs.push({
                    level: 0, to: V, 
                    selfid: getEdgeID(srcId, srcNodeId, dstNodeId), 
                    srcid: srcNodeId, dstid: dstNodeId 
                });
            }
        }
    }
    return stack_ptrs;
}

/**
 * Generate an array of heap nodes from the current VM State
 * 
 * Warning: the created node is not positioned properly
 */
function retrieveHeapPointers(
    state: VM_State,
    mem: C0HeapAllocator,
    typdef: Map<SourceType, AliasType>
): HeapPointer[] {
    const exploredIDs: Set<EdgeID> = new Set();
    const heapNodes: HeapPointer[] = [];
    const frontier: HeapPointer[] = retrieveStackPointers(state);

    while (frontier.length !== 0) {
        const curr_edge = frontier.shift();
        if (curr_edge === undefined) throw new internal_error("Unexpected undefined value for curr_ptr");
        if (exploredIDs.has(curr_edge.selfid)) continue;

        heapNodes.push(curr_edge);

        switch (curr_edge.to.type.type) {
            case "ptr":
                break;
        
            case "tagptr":
                break;
        }
    }

    return heapNodes;
}

export function buildNodes(
    state: VM_State,
    mem: C0HeapAllocator,
    typedef: Map<SourceType, AliasType>
): [Node[], Edge[]] {
    const stackNodes = generateStackNodes(state, mem, typedef);

    return [stackNodes, []];
}
