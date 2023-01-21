type NodeTypes = "frame" | "struct" | "array" | "pointer";

const STRUCT_TOP_HEIGHT  = 47;
const LINE_HEIGHT = 25;
const TOP_HEIGHT  = 50;
const LEFT_WIDTH = 95;
const ARR_ELEM_WIDTH = 82;

export function valid_variable_count(frame: VM_StackFrame): number {
    let cnt = 0;
    for (let i = 0; i < frame.V.length; i ++) {
        if (frame.V[i] !== undefined && frame.P.varName[i] !== undefined) {
            cnt ++;
        }
    }
    return cnt;
}

// Full of magic number and hard-coded. If change node props in application.css
// Remember to change this line
export function calculate_node_height(lines: number, type: NodeTypes) {
    switch (type) {
        case "frame":
            return Math.max(STRUCT_TOP_HEIGHT + LINE_HEIGHT, TOP_HEIGHT + LINE_HEIGHT * lines);
        case "struct":
            return Math.max(TOP_HEIGHT + LINE_HEIGHT, TOP_HEIGHT + LINE_HEIGHT * lines);
        case "array":
            return TOP_HEIGHT * 2;
        case "pointer":
            return TOP_HEIGHT;
    }
    
}

export function calculate_entry_height(lines: number, type: NodeTypes) {
    switch (type) {
        case "frame":
            return TOP_HEIGHT + LINE_HEIGHT * (lines - 1) + 0.9 * LINE_HEIGHT;
        case "struct":
            return STRUCT_TOP_HEIGHT + LINE_HEIGHT * (lines - 1) + 0.8 * LINE_HEIGHT;
        case "array": 
            return LEFT_WIDTH + ARR_ELEM_WIDTH * (lines - 1) + 0.5 * ARR_ELEM_WIDTH;
        case "pointer":
            return 0.8 * LINE_HEIGHT;
    }
    
}
