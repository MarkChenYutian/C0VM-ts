/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract Given VM State, Memory Allocation, and typedef information, 
 * return a set of nodes and edges that forms the graphical debugger display
 * 
 * This file is not used ... It's an attempt to replace the graph_builder.ts (failed)
 */
import { Node } from "react-flow-renderer";
import { calculate_node_height, valid_variable_count } from "./graphical_utility";


type StackNodeID = `stack-${number}`;
type HeapNodeID  = `heap-${number}`;
type SourceID    = `src-${number}`;
type EdgeID      = `${SourceID}@${StackNodeID|HeapNodeID}>${HeapNodeID}`;

type StackNode   = Node< C0StackFrameNodeData > & {id: StackNodeID};
type HeapNode    = Node< C0ArrayNodeData | C0ValueNodeData | C0PointerNodeData | C0TagPointerData > & {id: HeapNodeID}

function getStackNodeID(id: number): StackNodeID { return `stack-${id}`; }
function getHeapNodeID(addr: number): HeapNodeID { return `heap-${addr}`; }
function getSourceID(cnt: number): SourceID { return `src-${cnt}`; }

function createStackNodeData(
    cnt     : number,
    position: [number, number],
    state   : VM_State,
    frame   : VM_StackFrame,
    mem     : C0HeapAllocator,
    typedef : Map<SourceType, AliasType>
): StackNode {
    return {
        id: getStackNodeID(cnt),
        position: {x: position[0], y: position[1]},
        data: {frame, mem, typedef, state, dragged: false},
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

    const stackNodes: StackNode[] = [
        createStackNodeData(state.CallStack.length, [xCoord, yCoord], state, state.CurrFrame, mem, typedef)
    ];
    yCoord += calculate_node_height(valid_variable_count(state.CurrFrame), "frame");

    for (let i = state.CallStack.length - 1; i >= 0; i --) {
        stackNodes.push(
            createStackNodeData(i, [xCoord, yCoord], state, state.CallStack[i], mem, typedef)
        );
        yCoord += calculate_node_height(valid_variable_count(state.CallStack[i]), "frame");
    }

    return stackNodes
}

/**
 * Generate an array of heap nodes from the current VM State
 * 
 * Warning: the created node is not positioned properly
 */
function generateHeapNodes(
    state: VM_State,
    mem: C0HeapAllocator,
    typdef: Map<SourceType, AliasType>
): {level: number, node: C0Value<"ptr"|"tagptr">}[] {
    let heapNodes: any[] = [];
    

    return heapNodes;
}

export {};


