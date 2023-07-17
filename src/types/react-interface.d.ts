/// <reference types="react-scripts" />

declare module '*.svg';

type SetAppStateInput = (Pick<C0VMApplicationState, any> | C0VMApplicationState | null)

/* Breakpoint representation */
type BreakPoint = {
    line: number,       /* The line number that breakpoint is on right now */
    charPos: number     /* The (character-based) position of breakpoint in codemirror editor */
}

/* Typedef statements in C0 source code */
type TypeDefInfo = {
    source: string, /* source: the original type being aliased */
    alias: string,  /* alias: the alias type name in source code */
    // key: number     /* key: the key of editor where this typedef info entry comes from */
}

/* Describes a C0Editor Tab */
type C0EditorTab = {
    title  : string,            /* Title of editor tab */
    key    : number,            /* Key of editor tab */
    content: string,            /* Content (raw string) of that tab */
    breakpoints: BreakPoint[],  /* Breakpoints attatched to that tab */
    noCompile: boolean          /* true to ignore this file in compile process */
};

interface C0VMApplicationProps {
    displayMode    : "full-page" | "embeddable",
    showStdOut     : boolean,
    showDebug      : boolean
}

interface C0VMApplicationState {
    crashed        : boolean,               /* C0VM Application top-level error boundary */
    c0_only        : boolean,               /* C0 only mode or not */
    contentChanged : boolean,               /* If content has changed or not (requires re-compile) */
    dbgFullScreen  : boolean,               /* If it is in full screen mode currently */

    tutorialOn     : boolean,               /* See if the tutorial page is on or not */
    settingMenuOn  : boolean,               /* See if the setting menu is on or not */

    BC0SourceCode  : string,                /* The content of BC0 code editor */
    BC0BreakPoints : Set<BreakPoint>,       /* Breakpoints activated in BC0 code editor */

    C0Editors      : C0EditorTab[],         /* Code editor tab titles */
    ActiveEditor   : number,                /* Currently activated tab index of C0Editor */

    PrintoutValue  : string,                /* The string to show in the stdout console */

    C0Running      : boolean,               /* If the C0VM is running currently */
    C0Runtime      : C0VM_RT | undefined,   /* Runtime of C0VM */
    CompilerFlags  : Record<string, boolean>    /* Compiler Flags (-d) */
};


// The props that main control bar component will accept
interface MainControlProps {
    application_state   : C0VMApplicationState,
    set_app_state<K extends keyof C0VMApplicationState>(
                            state: ((prevState: Readonly<C0VMApplicationState>, props: Readonly<P>) 
                                    => (Pick<C0VMApplicationState, K> | C0VMApplicationState | null)) 
                                | (Pick<C0VMApplicationState, K> 
                                | C0VMApplicationState 
                                | null),
                            callback?: () => void
                        ): void,
};


interface TutorialPanelProps {
    state : C0VMApplicationState,
    set_app_state<K extends keyof C0VMApplicationState>(
        state: ((prevState: Readonly<C0VMApplicationState>, props: Readonly<P>) 
                => (Pick<C0VMApplicationState, K> | C0VMApplicationState | null)) 
            | (Pick<C0VMApplicationState, K> 
            | C0VMApplicationState 
            | null),
        callback?: () => void
    ): void
}


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
}

interface CodeEditorState {
    mode: "c0" | "bc0";     /* Editor mode (C0 or BC0) */
    C0_nextKey: number      /* Editor key for next tab */
}

interface C0EditorGroupProps {
    /* currLine = [ FileName, lineNumber, isBreakPoint ] */
    currLine     : [string, number, boolean] | undefined,   /* Current C0 line the C0VM is executing */

    appState     : C0VMApplicationState,                    /* C0VM Application State */
    selector     : JSX.Element | undefined                  /* Code editor mode selector */
    set_app_state<K extends keyof C0VMApplicationState>(
        state: ((prevState: Readonly<C0VMApplicationState>, props: Readonly<P>) 
                => (Pick<C0VMApplicationState, K> | C0VMApplicationState | null)) 
            | (Pick<C0VMApplicationState, K> 
            | C0VMApplicationState 
            | null),
            callback?: () => void
        ): void;
    
    set_group_state: (mode: "c0" | "bc0") => void,
    newPanel     : () => void,
    removePanel  : (key: string) => void,
    updateContent: (key: number, s: string) => void,
    handle_import_folder: (F: RcFile, FList: RcFile[]) => void,
}


interface C0EditorProps {
    execLine      : number,                     /* The line number C0VM is currently on (0 if not running on this C0 tab) */
    editorValue   : string,                     /* Editor content (raw string) */
    editable      : boolean                     /* Is editor editable? (if false, in read-only mode) */
    breakPoints   : BreakPoint[],               /* Breakpoints attatched to this editor */
    
    updateContent : (s: string) => void,
    setBreakPts   : (lns: BreakPoint[]) => void,
    updateName    : (s: string) => void,
    handle_import_folder: (F: RcFile, FList: RcFile[]) => void,
}

interface BC0EditorProps {
    updateContent : (s: string) => void,
    editorValue   : string,
    execLine      : number,
    breakpointVal : Set<BreakPoint>,
    updateBrkPts  : (ns: BreakPoint[]) => void,
}

interface TextEditorProps {
    updateContent : (s: string) => void,
    editorValue   : string,
    updateCompileLine : (fileSeq: string[]) => void
    updateName    : (s: string) => void,
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
    state: C0VM_RT | undefined,
    c0_only: boolean,
    isFullScreen: boolean,
    setFullScreen: (s: boolean) => void
}


interface DebugConsoleState {
    show: boolean,
    mode: "Table" | "Graph" | "Detail",
    err: boolean
}

interface DebugConsoleInterface {
    state: VM_State
    mem: C0HeapAllocator
    cnt: number
    typedef: Map<string, string>
}

interface TabularStackFrameProps {
    frame: VM_StackFrame,
    state: VM_State,
    mem: C0HeapAllocator,
    typedef: Map<string, string>,
}


interface C0ValueTabularDisplayProps {
    state: VM_State,
    mem: C0HeapAllocator,
    value: C0Value<C0TypeClass>,
    typedef: Map<string, string>,
    default_expand: boolean
}

interface C0StackFrameNodeData {
    frame: VM_StackFrame,
    mem: C0HeapAllocator,
    state: VM_State,
    typedef: Map<string, string>,
    dragged: boolean,
}

interface C0StructNodeData {
    ptr: C0Value<"ptr">,
    mem: C0HeapAllocator,
    state: VM_State,
    typedef: Map<string, string>,
    dragged: boolean,
}

interface C0ArrayNodeData {
    ptr: C0Value<"ptr">,
    mem: C0HeapAllocator,
    typedef: Map<string, string>,
    state: VM_State,
    dragged: boolean,
}

interface C0TagPointerData {
    tagptr: C0Value<"ptr">,
    mem: C0HeapAllocator,
    typedef: Map<string, string>,
    state: VM_State,
    dragged: boolean
}

interface C0PointerNodeData {
    ptr: C0Value<"ptr">,
    mem: C0HeapAllocator,
    typedef: Map<string, string>,
    state: VM_State,
    dragged: boolean,
}

interface C0FuncPtrNodeData {
    ptr: C0Value<"ptr">,
    mem: C0HeapAllocator,
    typedef: Map<string, string>,
    state: VM_State,
    dragged: boolean,
}

interface C0ValueNodeData {
    val: C0Value<"ptr">,
    mem: C0HeapAllocator,
    typedef: Map<string, string>,
    state: VM_State,
    dragged: boolean,
}

type VisData = C0StackFrameNodeData | C0StructNodeData | C0ArrayNodeData | C0PointerNodeData | C0ValueNodeData | C0TagPointerData | C0FuncPtrNodeData;

interface ApplicationCrashPageProps {
    state: C0VMApplicationState;
    setState<K extends keyof C0VMApplicationState>(ns: Pick<C0VMApplicationState, K>): void;
}

interface ApplicationContextInterface {
    theme: "dark" | "light"
}

interface SettingMenuProps {
    state: C0VMApplicationState,
    set_app_state<K extends keyof C0VMApplicationState>(
        state: ((prevState: Readonly<C0VMApplicationState>, props: Readonly<P>) => (
            Pick<C0VMApplicationState, K> | C0VMApplicationState | null)) | (Pick<C0VMApplicationState, K> | C0VMApplicationState | null),
        callback?: () => void
    ): void;
}


interface BreakpointExtProps {
    currBps: BreakPoint[],                  // Current breakpoints
    setBps: (ns: BreakPoint[]) => void      // Update breakpoints
}

type BreakpointExt = (props: BreakpointExtProps) => ((StateField<RangeSet<GutterMarker>> | Extension)[])

interface ContextValue {
    themeColor: string | undefined
}

type AliasType = string;
type SourceType = string;

interface EditableTabProps {
    title: string,
    editor_key: string,
    updateName: (key: string, a: string) => void
}

interface EditableTabState {
    title: string,
    being_edited: boolean,
    wip_title: string
}
