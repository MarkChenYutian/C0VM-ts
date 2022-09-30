interface C0VMApplicationState {
    crashed      : boolean,         /* C0VM Application top-level error boundary */

    dbgFullScreen: boolean,         /* If it is in full screen mode currently */
    settingMenuOn: boolean,         /* See if the setting menu is on or not */

    BC0SourceCode: string,          /* The content of BC0 code editor */
    BC0BreakPoints: Set<number>,    /* Breakpoints activated in BC0 code editor */
    TypedefRecord: Map<string, TypeDefInfo>, /* Record the typedef names for string substitution */

    C0Editors  : C0EditorTab[],     /* Code editor tab titles */
    ActiveEditor : number,          /* Currently activated tab index of C0Editor */
    C0BreakPoint: Set<string> /* Breakpoints on C0 Source code */

    PrintoutValue: string,          /* The string to show in the stdout console */

    C0Running: boolean,             /* If the C0VM is running currently */
    C0Runtime: C0VM_RuntimeState | undefined,   /* Runtime of C0VM */
    CompilerFlags: Record<string, boolean>      /* Compiler Flags (-d) */
};

/* to: the string of typedef source */
/* key: the key of editor where this typedef info entry comes from */
type TypeDefInfo = {source: string, key: number}

// The props that main control bar component will accept
interface MainControlProps {
    application_state: C0VMApplicationState,
    c0_only          : boolean,

    update_running: (ns: boolean) => void,
    update_value: (ns: string) => void,
    update_state: (ns: C0RuntimeState | undefined) => void,
    update_print: (ns: string) => void,
    clear_print: () => void,
};

interface CodeEditorProps {
    app_state: C0VMApplicationState,
    set_app_state<K extends keyof C0VMApplicationState>(
        state: ((prevState: Readonly<C0VMApplicationState>, props: Readonly<P>) 
                => (Pick<C0VMApplicationState, K> | C0VMApplicationState | null)) 
            | (Pick<C0VMApplicationState, K> 
            | C0VMApplicationState 
            | null),
        callback?: () => void
    ): void;
    c0_only: boolean
}

interface CodeEditorState {
    mode: "c0" | "bc0";
    C0_nextKey: number
}

interface C0EditorGroupProps {
    currLine     : [string, number, boolean] | undefined,
    c0BreakPoints: Set<string>,
    setC0BrkPoint: (s: string, ln: number) => void,
    writeC0BrkPts: (s: Set<string>) => void,

    activeTab    : number,
    setActiveTab : (i: number) => void,

    currTabs     : C0EditorTab[],
    setTabName   : (key: number, name: string) => void,
    setTabs      : (nt: C0EditorTab[]) => void,
    
    newPanel     : () => void,
    removePanel  : (key: string) => void,

    updateContent: (s: string, key: number) => void,
    updateTypedef: (key: number, newTypeDef: Map<string, string>) => void;
}

type C0EditorTab = {title: string, key: number, content: string};

interface C0EditorProps {
    lineNumber    : number,
    updateContent : (s: string) => void,
    updateTypedef : (newTypeDef: Map<string, string>) => void,
    editorValue   : string,
    updateName   ?: (s: string) => void,
    updateBrkPts  : (ln: number) => void,
    setBreakPts   : (lns: number[]) => void,
    editable      : boolean
}

interface BC0EditorProps {
    updateContent : (s: string) => void,
    editorValue   : string,
    execLine      : number,
    breakpointVal : Set<number>,
    updateBrkPts  : (ns: Set<number>) => void,
}

// The props that CompilerOption component will accept
interface CompilerOptionPropInterface {
    d_flag_stat: boolean;
    flip_d_flag: () => void
};

interface C0OutputPropInterface {
    printContent: string
};

interface DebugConsoleProps {
    state: C0VM_RuntimeState | undefined,
    isFullScreen: boolean,
    setFullScreen: (s: boolean) => void
}


interface DebugConsoleState {
    show: boolean,
    mode: "Table" | "Graph",
    err: boolean
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

interface C0StackFrameNodeData {
    frame: VM_StackFrame,
    mem: C0HeapAllocator,
    dragged: boolean,
}

interface C0StructNodeData {
    ptr: C0Value<"ptr">,
    mem: C0HeapAllocator,
    typeRecord: Map<string, Map<number, Struct_Type_Record>>,
    dragged: boolean,
}

interface C0ArrayNodeData {
    ptr: C0Value<"ptr">,
    mem: C0HeapAllocator,
    dragged: boolean,
}

interface C0PointerNodeData {
    ptr: C0Value<"ptr">,
    mem: C0HeapAllocator,
    dragged: boolean,
}

interface C0ValueNodeData {
    val: C0Value<"ptr">,
    mem: C0HeapAllocator,
    dragged: boolean,
}

type VisData = C0StackFrameNodeData | C0StructNodeData | C0ArrayNodeData | C0PointerNodeData | C0ValueNodeData;

interface ApplicationCrashPageProps {
    state: C0VMApplicationState;
    setState<K extends keyof C0VMApplicationState>(ns: Pick<C0VMApplicationState, K>): void;
}

interface ApplicationContextInterface {
    mode: "full-page" | "embeddable",
    std_out: boolean,
    debug_console: boolean,
    c0_only: boolean
}

interface SettingMenuProps {
    state: C0VMApplicationState,
    set_app_state<K extends keyof C0VMApplicationState>(
        state: ((prevState: Readonly<C0VMApplicationState>, props: Readonly<P>) => (
            Pick<C0VMApplicationState, K> | C0VMApplicationState | null)) | (Pick<C0VMApplicationState, K> | C0VMApplicationState | null),
        callback?: () => void
    ): void;
}
