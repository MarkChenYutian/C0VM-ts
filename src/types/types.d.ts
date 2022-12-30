type C0TypeClass = "<unknown>" | "value" | "ptr" | "string";

type C0ValueTypes = "int" | "char" | "bool";

type Maybe<T extends C0TypeClass> = T | "<unknown>";

type C0Type<T extends C0TypeClass> = 
    T extends "value" ? {
        type: T,
        value: C0ValueTypes
    } : 
    T extends "ptr" ? {
        type: T,
        kind: "arr"| "ptr",         // "arr" -> "C[]", "ptr" -> "C*"
        value: C0Type<C0TypeClass>, // the type "C" in comment above
    } | {
        type: T,
        kind: "struct",
        value: string,  // If a pointer points to the struct, we record the 
        offset: number  // struct type name and offset
    } : 
    T extends "string" ? {
        type: T,
        value: "string"
    } : 
    T extends "<unknown>" ? {
        type: T         // No more type information for unknown
    } : never;

type C0Function = {
    // function name, inferenced from comments in .bc0 file
    name: string;
    // Number of local vairables in function
    numVars: number;
    // Number of arguments the function receives        
    numArgs: number;
    // name of local variables, inferenced from comments in .bc0 file
    varName: string[];
    // the length of code of the function
    size: number;
    // bytecodes of the function
    code: Uint8Array;
    /**
     * the mapping between the bytecode index and the comment
     * Note: only the opcode's bytecode will have mapping. For instance
     * if there's 
     * 
     * bipush 00 01 # something
     * 
     * then "something" as a reference will only be mapped from the index of bipush
     */
    comment: Map<number, CodeComment>;
};

// Information extracted from comment during parsing phase
// Facilitate type inference etc.
type CodeComment = {
    dataType?: string,  // If command = new/new_array/bipush, the type name of variable will be placed here
    fieldName?: string, // If command = aaddf, the field name will be placed here
    // File name, row, can_break_here
    c0RefNumber?: [string, number, bool], // The corresponding line nunber in .c0 file, if can be resolved
    lineNumber: number  // The corresponding line number in .bc0 file    
}

type ReactUIHook = {
    print_update: (s: string) => void
}


type C0Native = {
    // Number of arguments the function will receive
    numArgs: number;
    // The enumeration type - C0 Native Functions' name
    readonly functionType: C0NativeFuncType;
    // The native function implementation - receive several C0 value and return a C0Value accordingly
    readonly async f: (hooks: ReactUIHook, mem: C0HeapAllocator, ...args: C0Value<C0TypeClass>[]) => 
        C0Value<C0TypeClass>;
};

type C0ByteCode = {
    version: number;
    /* Int Constant Pool */
    intCount: number;
    intPool: Int32Array;
    /* String Constant Pool */
    stringCount: number;
    stringPool: Uint8Array;
    /* Function Pool */
    functionCount: number;
    functionPool: C0Function[];
    /* Native Functions */
    nativeCount: number;
    nativePool: C0Native[];
};


/**
 * C0Pointer = ArrayBuffer(8)
 * C0Pointer = <addr: u32, offset: u16, size: u16>
 * 
 * The function to check NULL ptr is defined in ./utility/pointer_ops.ts
 */
type C0Pointer = DataView;


type C0Value<T extends C0TypeClass> = {
    type: C0Type<T>,
    value: DataView,
}

// use_official name instead of internal name.
type C0NativeFuncType =
    "NATIVE_NOT_RECOGNIZED"
    | "NATIVE_ARGS_FLAG"
    | "NATIVE_ARGS_INT"
    | "NATIVE_ARGS_PARSE"
    | "NATIVE_ARGS_STRING"
    /*conio*/
    | "NATIVE_EOF"
    | "NATIVE_FLUSH"
    | "NATIVE_PRINT"
    | "NATIVE_PRINTBOOL"
    | "NATIVE_PRINTCHAR"
    | "NATIVE_PRINTINT"
    | "NATIVE_PRINTLN"
    | "NATIVE_READLINE"
    /*curses*/
    | "NATIVE_C_ADDCH"
    | "NATIVE_C_CBREAK"
    | "NATIVE_C_CURS_SET"
    | "NATIVE_C_DELCH"
    | "NATIVE_C_ENDWIN"
    | "NATIVE_C_ERASE"
    | "NATIVE_C_GETCH"
    | "NATIVE_C_INITSCR"
    | "NATIVE_C_KEYPAD"
    | "NATIVE_C_MOVE"
    | "NATIVE_C_NOECHO"
    | "NATIVE_C_REFRESH"
    | "NATIVE_C_SUBWIN"
    | "NATIVE_C_WADDCH"
    | "NATIVE_C_WADDSTR"
    | "NATIVE_C_WCLEAR"
    | "NATIVE_C_WERASE"
    | "NATIVE_C_WMOVE"
    | "NATIVE_C_WREFRESH"
    | "NATIVE_C_WSTANDEND"
    | "NATIVE_C_WSTANDOUT"
    | "NATIVE_CC_GETBEGX"
    | "NATIVE_CC_GETBEGY"
    | "NATIVE_CC_GETMAXX"
    | "NATIVE_CC_GETMAXY"
    | "NATIVE_CC_GETX"
    | "NATIVE_CC_GETY"
    | "NATIVE_CC_HIGHLIGHT"
    | "NATIVE_CC_KEY_IS_BACKSPACE"
    | "NATIVE_CC_KEY_IS_DOWN"
    | "NATIVE_CC_KEY_IS_ENTER"
    | "NATIVE_CC_KEY_IS_LEFT"
    | "NATIVE_CC_KEY_IS_RIGHT"
    | "NATIVE_CC_KEY_IS_UP"
    | "NATIVE_CC_WBOLDOFF"
    | "NATIVE_CC_WBOLDON"
    | "NATIVE_CC_WDIMOFF"
    | "NATIVE_CC_WDIMON"
    | "NATIVE_CC_WREVERSEOFF"
    | "NATIVE_CC_WREVERSEON"
    | "NATIVE_CC_WUNDEROFF"
    | "NATIVE_CC_WUNDERON"
    /*dub*/
    | "NATIVE_DADD"
    | "NATIVE_DDIV"
    | "NATIVE_DLESS"
    | "NATIVE_DMUL"
    | "NATIVE_DSUB"
    | "NATIVE_DTOI"
    | "NATIVE_ITOD"
    | "NATIVE_PRINT_DUB"
    /*file*/
    | "NATIVE_FILE_CLOSE"
    | "NATIVE_FILE_CLOSED"
    | "NATIVE_FILE_EOF"
    | "NATIVE_FILE_READ"
    | "NATIVE_FILE_READLINE"
    /*fpt*/
    | "NATIVE_FADD"
    | "NATIVE_FDIV"
    | "NATIVE_FLESS"
    | "NATIVE_FMUL"
    | "NATIVE_FSUB"
    | "NATIVE_FTOI"
    | "NATIVE_ITOF"
    | "NATIVE_PRINT_FPT"
    | "NATIVE_PRINT_HEX"
    | "NATIVE_PRINT_INT"
    /*img*/
    | "NATIVE_IMAGE_CLONE"
    | "NATIVE_IMAGE_CREATE"
    | "NATIVE_IMAGE_DATA"
    | "NATIVE_IMAGE_HEIGHT"
    | "NATIVE_IMAGE_LOAD"
    | "NATIVE_IMAGE_SAVE"
    | "NATIVE_IMAGE_SUBIMAGE"
    | "NATIVE_IMAGE_WIDTH"
    /*parse*/
    | "NATIVE_INT_TOKENS"
    | "NATIVE_NUM_TOKENS"
    | "NATIVE_PARSE_BOOL"
    | "NATIVE_PARSE_INT"
    | "NATIVE_PARSE_INTS"
    | "NATIVE_PARSE_TOKENS"
    /*string*/
    | "NATIVE_CHAR_CHR"
    | "NATIVE_CHAR_ORD"
    | "NATIVE_STRING_CHARAT"
    | "NATIVE_STRING_COMPARE"
    | "NATIVE_STRING_EQUAL"
    | "NATIVE_STRING_FROM_CHARARRAY"
    | "NATIVE_STRING_FROMBOOL"
    | "NATIVE_STRING_FROMCHAR"
    | "NATIVE_STRING_FROMINT"
    | "NATIVE_STRING_JOIN"
    | "NATIVE_STRING_LENGTH"
    | "NATIVE_STRING_SUB"
    | "NATIVE_STRING_TERMINATED"
    | "NATIVE_STRING_TO_CHARARRAY"
    | "NATIVE_STRING_TOLOWER";

type VM_OperandStack = C0Value<C0TypeClass>[];
type VM_LocalVariables = (C0Value<C0TypeClass> | undefined)[];
type VM_Constants = {
    // The pointer that points to the start of string pool in heap allocator
    stringPoolPtr: C0Pointer
}
type VM_StackFrame = {
    PC: number,
    S: VM_OperandStack,
    V: VM_LocalVariables,
    P: C0Function
};

type Struct_Type_Record = {
    name ?: string,
    type ?: C0Type<C0TypeClass>
};

type VM_State = {
    // Bytecode file to be executed
    P: C0ByteCode,
    // Constants the VM will use
    C: VM_Constants,
    // The callstack of the virtual machine
    CallStack: VM_StackFrame[],
    // The function frame that is currently executed
    CurrFrame: VM_StackFrame,
    // The line number of .bc0 file that is currently executing
    CurrLineNumber: number,
    // The line number of .c0 file that is currently executing
    CurrC0RefLine: [string, number, boolean] | undefined,
    // The type pool (struct type information) hashmap
    TypeRecord: Map<string, Map<number, Struct_Type_Record>>
};


declare abstract class C0VM_RT {
    public raw_code : string;
    public code     : C0ByteCode;
    public state    : VM_State;
    public allocator: C0HeapAllocator;
    public heap_size: number | undefined;
    public step_cnt: number;

    abstract constructor(bytecode: string, c0source: C0EditorTab[], typedef: Map<string, TypeDefInfo>, heapSize?: number, parsed_result?: C0ByteCode)
    abstract async step_forward(UIHooks: ReactUIHook): Promise<boolean>;
    abstract clone(): C0VM_RT
    abstract debug(): any;
}

type C0StructJSEntry = {
    value: C0Value<C0TypeClass> | undefined,
    offset: number,
    name: string | undefined;
};
