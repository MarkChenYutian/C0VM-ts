export function valid_variable_count(frame: VM_StackFrame): number {
    let cnt = 0;
    for (let i = 0; i < frame.V.length; i ++) {
        if (frame.V[i] !== undefined && frame.P.varName[i] !== undefined) {
            cnt ++;
        }
    }
    return cnt;
}

type NodeTypes = "frame" | "struct" | "array" | "pointer";

const TOP_PADDING = 25;
const STRUCT_TOP_HEIGHT  = 47;
const LINE_HEIGHT = 25;
const TOP_HEIGHT  = 50;

// Full of magic number and hard-coded. If change node props in application.css
// Remember to change this line
export function calculate_node_height(lines: number, type: NodeTypes) {
    switch (type) {
        case "frame":
            return Math.max(STRUCT_TOP_HEIGHT + LINE_HEIGHT, TOP_HEIGHT + LINE_HEIGHT * lines);
        case "struct":
            return Math.max(TOP_HEIGHT + LINE_HEIGHT, TOP_HEIGHT + LINE_HEIGHT * lines);
        case "array":
            return Math.max(TOP_HEIGHT, TOP_PADDING * 2 + LINE_HEIGHT * lines);
        case "pointer":
            return TOP_HEIGHT;
    }
    
}

export function calculate_entry_height(lines: number, type: NodeTypes) {
    switch (type) {
        case "frame":
            return TOP_HEIGHT + LINE_HEIGHT * (lines - 1) + 0.8 * LINE_HEIGHT;
        case "struct":
            return STRUCT_TOP_HEIGHT + LINE_HEIGHT * (lines - 1) + 0.8 * LINE_HEIGHT;
        case "array": 
            return TOP_PADDING + LINE_HEIGHT * (lines - 1) + 0.8 * LINE_HEIGHT;
        case "pointer":
            return 0.8 * LINE_HEIGHT;
    }
    
}
