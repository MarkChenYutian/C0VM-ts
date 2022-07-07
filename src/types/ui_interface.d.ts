interface C0VMApplicationState {
    EditorContent: string,
    PrintoutValue: string,
    C0Runtime: C0VM_RuntimeState | undefined,
    CompilerFlags: Record<string, boolean>
};

interface MainControlProps {
    isbc0: boolean,
    curr_content: string,
    curr_state: C0VM_RuntimeState | undfined,
    // update_state: (ns: Pick<C0VMApplicationState, keyof C0VMApplicationState>) => void
    update_state: (ns: C0RuntimeState | undefined) => void
    update_print: (ns: string) => void
    clear_print: () => void
};

interface CompilerOptionPropInterface {
    flip_d_flag: () => void
};

interface C0OutputPropInterface {
    printContent: string
};

interface DebugConsoleProps {
    state: C0VM_RuntimeState | undefined,
}


interface DebugConsoleState {
    show: boolean,
    mode: "tablular" | "graphical"
}

interface TabularDebugEvaluationProps {
    state: VM_State
    mem: C0HeapAllocator
}

interface TabularStackFrameProps {
    frame: VM_StackFrame,
    mem: C0HeapAllocator,
    typeRecord: Map<string, Map<number, Struct_Type_Record>>
}


interface C0ValueTabularDisplayProps {
    mem: C0HeapAllocator,
    value: C0Value<C0TypeClass>,
    typeRecord: Map<string, Map<number, Struct_Type_Record>>,
    default_expand: boolean
}
