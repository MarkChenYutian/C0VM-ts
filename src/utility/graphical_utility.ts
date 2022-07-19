export function valid_variable_count(frame: VM_StackFrame): number {
    let cnt = 0;
    for (let i = 0; i < frame.V.length; i ++) {
        if (frame.V[i] !== undefined && frame.P.varName[i] !== undefined) {
            cnt ++;
        }
    }
    return cnt;
}


const LINE_HEIGHT = 25;
const PAD_HEIGHT  = 50;

// Full of magic number and hard-coded. If change node props in application.css
// Remember to change this line
export function calculate_node_height(lines: number) {
    return Math.max(PAD_HEIGHT + LINE_HEIGHT, PAD_HEIGHT + LINE_HEIGHT * lines);
}

export function calculate_entry_height(lines: number) {
    return PAD_HEIGHT + LINE_HEIGHT * (lines - 1) + 0.9 * LINE_HEIGHT;
}
