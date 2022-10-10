/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract Generate the nodes and edges based on the given VM_State
 * and heap memory allocator.
 * 
 * @describe There are also many helper functions (edge_factory) and merge
 * state function described in this file.
 */

import { Node, Edge, MarkerType, CoordinateExtent } from "react-flow-renderer";
import { isPointerType, is_struct_pointer } from "../../../utility/c0_type_utility";
import { deref_C0Value, expand_C0Array, expand_C0Struct } from "../../../utility/c0_value_utility";
import { internal_error } from "../../../utility/errors";
import { calculate_node_height, valid_variable_count } from "./graphical_utility";
import { isNullPtr, read_ptr } from "../../../utility/pointer_utility";
import { Type2String } from "../../../utility/c0_type_utility";

// ID Generate function that is shared between component and edge linker

// the i-th stack frame in call stack
function stackNodeID(i: number) {
    return `stack-${i}`;
}
// the heap node at memory address ptr.val
function heapNodeID(ptr: C0Value<"ptr">) {
    return `heap-${read_ptr(ptr.value)[0]}`;
}

// Handle IDs will be used by each component in the reactflow directory,
// so they have to be exported.
// the pointer is the j-th var in stack frame
export function stackSrcHandleID(j: number) {
    return "s-val-ptr-" + j;
}
export function heapNodeTargetHandleID() {
    return "target";
}
export function structSrcHandleID(offset: number) {
    return "s-val-ptr-" + offset;
}
export function arrSrcHandleID(idx: number) {
    return "a-val-ptr-" + idx;
}
export function ptrSrcHandleID() {
    return "p-val-ptr";
}


/**
 * Build the graph
 * @param state The VM_State
 * @param mem Heap Allocator
 * @returns A set of nodes (vertex) and edges that makes are in the heap memory space and
 * contains stack frames to represent a graphical visualization.
 */
export function build_nodes(state: VM_State, mem: C0HeapAllocator):
[Node<VisData>[], Edge<undefined>[]]
{
    // Step 1. Build stack memory nodes
    let [x, y] = [10, 10];
    let nodes:Node<VisData>[] = [];


    nodes.push({
        id: `stack-${state.CallStack.length}`,
        position: {x, y},
        data: {frame: state.CurrFrame, mem: mem, dragged: false},
        type: "stackNode",
        draggable: false
    });
    y += calculate_node_height(valid_variable_count(state.CurrFrame), "frame");

    for (let i = state.CallStack.length - 1; i >= 0; i --) {
        nodes.push({
            id: stackNodeID(i),
            position: {x, y},
            data: {frame: state.CallStack[i], mem: mem, dragged: false},
            type: "stackNode",
            draggable: false
        });
        y += calculate_node_height(valid_variable_count(state.CallStack[i]), "frame");
    }
    

    // Step 2. Build heap memory nodes
    let [heap_nodes, edges] = BFS_heap_scan(state, mem);
    nodes = nodes.concat(heap_nodes);

    return [nodes, edges];
}

/**
 * @param state The VM_STATE
 * @param mem The heap memory allocator
 * @returns A set of nodes and edges that represents the situation of heap memory space
 */
function BFS_heap_scan(state: VM_State, mem: C0HeapAllocator): [Node<VisData>[], Edge<undefined>[]]
{
    // Initialize the "fringe (to-be-explored)" in BFS
    let job_list: {val: C0Value<"ptr">, lv: number}[] = [];
    job_list = scan_stack_get_ptrs(state);

    const output: Node<VisData>[] = [];
    let edges : Edge<undefined>[] = scan_stack_build_edges(state);

    // The nodes we have already explored will not be expand again
    const drawn_ids: Set<string> = new Set();

    let curr_lv = 1;
    let [x, y] = [450, 50];

    while (job_list.length > 0) {
        const curr_job = job_list.shift();
        if (curr_job === undefined) break;
        const {val, lv} = curr_job;

        if (drawn_ids.has(heapNodeID(val))) { continue; }
        else { drawn_ids.add(heapNodeID(val)); }

        if (lv !== curr_lv) {
            [x, y] = [150 + 300 * lv, 80 * lv];  // Start position for next level of nodes
            curr_lv = lv;
        }

        const [new_node, new_edge, dy] = C0_Value_to_graph(val, state, mem, x, y);

        get_successors(val, mem, state, lv).forEach(
            (v) => { job_list.push(v); }
        );

        output.push(new_node);
        edges = edges.concat(new_edge);
        // new_edge.forEach((e) => { edges.push(e); });
        y += dy;
    }

    return [output, edges];
}

/**
 * Given a C0Value, automatically expand it based on type information
 * and trace down the pointers in its field if there exists non-NULL pointers.
 * 
 * Return a series of BFS nodes that are "successors" of current node V.
 */
function get_successors(V: C0Value<"ptr">, M: C0HeapAllocator, S: VM_State, lv: number): {val: C0Value<"ptr">, lv: number}[]
{
    const output: {val: C0Value<"ptr">, lv: number}[] = [];
    // Populate joblist, if necessary:
    switch (V.type.kind) {
        case "arr":
            const js_arr = expand_C0Array(M, V);
            for (let i = 0; i < js_arr.length; i ++) {
                const arr_c0val = js_arr[i];
                if (isPointerType(arr_c0val) && !isNullPtr(arr_c0val.value)) {
                    output.push({val: arr_c0val, lv: lv + 1});
                }
            }
            break;
        case "ptr":
            if (is_struct_pointer(V) && !isNullPtr(V.value)) {
                const js_struct = expand_C0Struct(M, S.TypeRecord, V);
                js_struct.forEach(
                    ({value, offset, name}) => {
                        if (value !== undefined && isPointerType(value) && !isNullPtr(value.value)) {
                            output.push({val: value, lv: lv + 1});
                        }
                    }
                )
            } else if (!isNullPtr(V.value)) {
                const js_deref = deref_C0Value(M, V);
                if (isPointerType(js_deref) && !isNullPtr(js_deref.value)) {
                    output.push({val: js_deref, lv: lv + 1});
                }
            }
            break;
        case "struct":
            throw new internal_error("This branch shouldn't be reached.");
    }
    return output;
    // return [];
}

/**
 * Note: V here must be a C0Value<"ptr"> since if we have a 
 * pointer T*, this function will always render the value "T"
 * instead of T* itself.
 * 
 * V = String2Type("T*");
 *           ------------
 *   -----> |  T Typed  |
 *          ------------
 * 
 * @param v The value to be rendered
 * @param state The VM state to be rendered
 * @param mem The heap memory of current VM
 * @param x x-coordinate to place this node
 * @param y y-coordinate to place this node
 * @returns [Node itself, Edges sourced from this node, delta_y]
 */
function C0_Value_to_graph(v: C0Value<"ptr">, state: VM_State, mem: C0HeapAllocator, x: number, y: number): [Node<VisData>, Edge<undefined>[], number] {
    const heap_node_extent: CoordinateExtent = [[310, 0], [10000, 10000]];
    let result_data = undefined;
    let result_edge: Edge<undefined>[] = [];
    let delta_y = 0;

    if (is_struct_pointer(v)){
        result_data = {
            id: heapNodeID(v),
            position: {x, y},
            data: {ptr: v, mem: mem, typeRecord: state.TypeRecord, dragged: false},
            type: "structNode",
            extent: heap_node_extent
        };

        const fields = expand_C0Struct(mem, state.TypeRecord, v);
        delta_y = calculate_node_height(fields.length, "struct");
        ///////// Get Edges /////////
        for (let i = 0; i < fields.length; i ++) {
            const fv = fields[i].value; // This is for typescript to know fv !== undefined after the branching
            if (fv === undefined) continue;
            if (isPointerType(fv)) {
                result_edge.push(edge_factory(
                    heapNodeID(v),
                    heapNodeID(fv),
                    structSrcHandleID(fields[i].offset),
                ));
            }
        }
        ////// Get edges above //////

    } else if (v.type.kind === "arr") {
        result_data = {
            id: heapNodeID(v),
            position: {x, y},
            data: {ptr: v, mem: mem, dragged: false},
            type: "arrayNode",
            extent: heap_node_extent
        }

        const elems = expand_C0Array(mem, v);
        delta_y = calculate_node_height(elems.length, "array");
        ///////// Get Edges /////////
        for (let i = 0; i < elems.length; i ++) {
            const elem = elems[i];
            if (isPointerType(elem) && !isNullPtr(elem.value)) {
                result_edge.push(edge_factory(
                    heapNodeID(v),
                    heapNodeID(elem),
                    arrSrcHandleID(i)
                ));
            }
        }
        ////// Get edges above //////
        
    } else if (v.type.kind === "ptr") {
        switch (v.type.value.type) {
            case "<unknown>":
                result_data = {
                    id: heapNodeID(v),
                    position: {x, y},
                    data: {ptr: v, mem: mem, dragged: false},
                    type: "unknownNode",
                    extent: heap_node_extent
                };
                break;
            case "ptr":
                result_data = {
                    id: heapNodeID(v),
                    position: {x, y},
                    data: {ptr: v, mem: mem, dragged: false},
                    type: "pointerNode",
                    extent: heap_node_extent
                };
                break;
            case "string":
            case "value":
                result_data = {
                    id: heapNodeID(v),
                    position: {x, y},
                    data: {val: v, mem: mem, dragged: false},
                    type: "valueNode",
                    extent: heap_node_extent
                };
                break;
        }
        delta_y = calculate_node_height(1, "struct");
        ///////// Get Edges /////////
        const val = deref_C0Value(mem, v);
        if (isPointerType(val) && !isNullPtr(val.value)) {
            result_edge.push(edge_factory(
                heapNodeID(v),
                heapNodeID(val),
                ptrSrcHandleID()
            ));
        }
        ////// Get edges above //////
    } else {
        if (DEBUG) {
            console.warn(`Received ptr: ${read_ptr(v.value)} with type ${Type2String(v.type)}`);
        }
        throw new internal_error("Can't render a naked struct (struct must be rendered as struct*)");
    }
    return [result_data, result_edge, delta_y];
}

/**
 * Create an initial job queue for BFS by scanning through stack frames.
 * 
 * @param state The VM_state
 * @returns A set of vertex in BFS as the initial level (thouse directly pointed by some
 * local variables in stack frames)
 */
function scan_stack_get_ptrs(state: VM_State): {val: C0Value<"ptr">, lv: number}[] {
    let result = [];

    for (let i = state.CallStack.length - 1; i > -1 ; i --) {
        const frame = state.CallStack[i];
        for (let j = 0; j < frame.V.length; j ++) {
            const val = frame.V[j];
            if (val !== undefined && isPointerType(val) && !isNullPtr(val.value)) {
                result.push({val: val, lv: 1});
            }
        }
    }
    for (let j = 0; j < state.CurrFrame.V.length; j ++) {
        const val = state.CurrFrame.V[j];
        if (val !== undefined && isPointerType(val) && !isNullPtr(val.value)) {
            result.push({val: val, lv: 1});
        }
    }
    return result;
}

/**
 * @param state The VM_state
 * @returns A set of edges where originated from stack frame and 
 * pointing to somewhere in the heap memory.
 */
function scan_stack_build_edges(state: VM_State): Edge<undefined>[] {
    const result: Edge<undefined>[] = [];
    for (let i = 0; i < state.CallStack.length; i ++) {
        const frame = state.CallStack[i];
        for (let j = 0; j < frame.V.length; j ++) {
            const val = frame.V[j];
            if (val !== undefined && isPointerType(val) && !isNullPtr(val.value)) {
                result.push(edge_factory(
                    stackNodeID(i),
                    heapNodeID(val),
                    stackSrcHandleID(j),
                ));
            }
        }
    }
    for (let j = 0; j < state.CurrFrame.V.length; j ++) {
        const val = state.CurrFrame.V[j];
        if (val !== undefined && isPointerType(val)) {
            result.push(edge_factory(
                stackNodeID(state.CallStack.length),
                heapNodeID(val),
                stackSrcHandleID(j)
            ));
        }
    }
    return result;
}

/**
 * 
 * An abstracted method to build edge so that we can easily apply some global 
 * styles (e.g. high zIndex, markerEnd, etc.) without being verbose.
 * 
 */
function edge_factory(source: string, target: string, sourceHandle: string): Edge<undefined> {
    return {
        source, target, id: `${source}@${sourceHandle}>${target}`, sourceHandle,
        zIndex: 999,
        markerEnd: {type: MarkerType.Arrow}
    };
}

/**
 * @param original_state The original position of nodes (possibly changed by user)
 * @param new_state The new positions of nodes generated by BFS
 * @return Whenever possible, use the position that user designates.
 */
export function merge_nodes(original_state: Node<VisData>[], new_state: Node<VisData>[]): Node<VisData>[] {
    const original_map = original_state.reduce(
        (prev, curr) => {
            return prev.set(curr.id, curr);
        },
        new Map<string, Node<VisData>>()
    );
    
    const merged_state = new_state.map(
        (node) => {
            const original_node = original_map.get(node.id);
            if (original_node !== undefined && original_node.data.dragged) {
                node.position = original_node.position;
                node.data.dragged = true;
                return node;
            }
            return node;
        }
    );

    return merged_state;
}

