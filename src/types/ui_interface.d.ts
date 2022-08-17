interface C0VMApplicationState {
    crashed      : boolean,         /* C0VM Application top-level error boundary */

    BC0SourceCode: string,          /* The content of BC0 code editor */
    BC0BreakPoints: Set<number>,    /* Breakpoints activated in BC0 code editor */
    TypedefRecord: Map<string, TypeDefInfo>, /* Record the typedef names for string substitution */

    C0TabTitles: EditorTabTitle[],  /* Code editor tab titles */
    C0SourceCodes: string[],        /* Content (in differnet tabs) of C0 code editors */
    ActiveEditor : number,          /* Currently activated tab index of C0Editor */

    PrintoutValue: string,          /* The string to show in the stdout console */

    C0Runtime: C0VM_RuntimeState | undefined,   /* Runtime of C0VM */
    CompilerFlags: Record<string, boolean>      /* Compiler Flags (-d) */
};

/* to: the string of typedef source */
/* key: the key of editor where this typedef info entry comes from */
type TypeDefInfo = {source: string, key: number}

// The props that main control bar component will accept
interface MainControlProps {
    application_state: C0VMApplicationState,

    update_value: (ns: string) => void,
    update_state: (ns: C0RuntimeState | undefined) => void,
    update_print: (ns: string) => void,
    clear_print: () => void,
};

interface CodeEditorProps {
    C0_TabTitles: EditorTabTitle[],
    C0_Contents: string[],
    C0_ActiveTab: number,
    BC0_Content: string,
    BC0_Breakpoint: Set<number>,
    BC0_Execline: number,
    set_app_state<K extends keyof C0VMApplicationState>(
        state: ((prevState: Readonly<C0VMApplicationState>, props: Readonly<P>) => (
            Pick<C0VMApplicationState, K> | C0VMApplicationState | null)) | (Pick<C0VMApplicationState, K> | C0VMApplicationState | null),
        callback?: () => void
    ): void;
    set_typedef: (key: number, newMap: Map<string, string>) => void;
}

interface CodeEditorState {
    mode: "c0" | "bc0";

    C0_nextKey: number
}

interface C0EditorGroupProps {
    activeTab    : number,

    currTabs     : EditorTabTitle[],
    currContents : string[],

    setActiveTab : (i: number) => void,
    setTabName   : (key: number, name: string) => void,
    
    newPanel     : () => void,
    removePanel  : (key: string) => void,

    updateContent: (s: string, key: number) => void,
    updateTypedef: (key: number, newTypeDef: Map<string, string>) => void;
}

type EditorTabTitle = {name: string, key: number};

interface C0EditorProps {
    updateContent : (s: string) => void,
    updateTypedef : (newTypeDef: Map<string, string>) => void,
    editorValue   : string,
    updateName   ?: (s: string) => void,
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
}


interface DebugConsoleState {
    show: boolean,
    mode: "Table" | "Graph",
    err: boolean,
    fullscreen: boolean,
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
    compiler_option: boolean,
    std_out: boolean,
    debug_console: boolean
}
