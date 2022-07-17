interface C0VMApplicationState {
    EditorContent: string,
    PrintoutValue: string,
    C0SourceCodes: string[],
    ActiveEditor : number,
    C0Runtime: C0VM_RuntimeState | undefined,
    CompilerFlags: Record<string, boolean>
};

// The props that main control bar component will accept
interface MainControlProps {
    isbc0: boolean,
    
    curr_bc0_content: string,
    curr_c0_contents: string[],

    curr_state: C0VM_RuntimeState | undfined,
    flags: Record<string, boolean>,

    update_value: (ns: string) => void,
    update_state: (ns: C0RuntimeState | undefined) => void,
    update_print: (ns: string) => void,
    clear_print: () => void,
};

interface CodeEditorProps {
    C0_Contents: string[],
    C0_ActiveTab: number,
    BC0_Content: string,
    set_app_state<K extends keyof C0VMApplicationState>(ns: Pick<C0VMApplicationState, K>): void;
}

interface CodeEditorState {
    mode: "c0" | "bc0";

    C0_tabTitle: EditorTabTitle[],
    C0_nextKey: number
}

interface C0EditorGroupProps {
    activeTab   : number,

    currTabs    : EditorTabTitle[],
    currContents: string[],

    updateContent: (s: string, key: number) => void,
    setActiveTab : (i: number) => void,
    setTabName   : (key: number, name: string) => void,

    newPanel     : () => void,
    removePanel  : (key: string) => void,
}

type EditorTabTitle = {name: string, key: number};

interface C0EditorProps {
    updateContent : (s: string) => void,
    editorValue   : string,
    updateName   ?: (s: string) => void,
    revUpdate    ?: boolean
}

interface C0EditorState {
    shouldRevUpdate  : boolean
}

// The props that CompilerOption component will accept
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
