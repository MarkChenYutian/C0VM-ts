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
    dataType: C0Type,
    lineNumber: number
}


type C0Native = {
    numArgs: number;
    // functionIndex: number;
    readonly functionType: C0NativeFuncType;
    // name: number;
    readonly f: (mem: C0HeapAllocator, ...args: C0Value<C0ValueVMType>[]) => 
        C0Value<C0ValueVMType>;
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


declare const enum C0ValueVMType {
    "value" = "value",
    "ptr" = "ptr"
}

//TODO: 
// type C0Type<T> = {
//     type: "ptr" | "arr" | "int" | "char" | "boolean" | "string" | "NULL",
//     value: C0Type;
// }

type C0ValueType = "<unknown>" | "int" | "char" | "boolean" | "string" | "void";

type C0PointerNames = "arr" | "ptr" | "struct";

type C0PointerType<T extends C0PointerNames> = 
    T extends "arr" | "ptr" ? {
        val: C0ValueType | C0PointerType<C0PointerNames>,
        type: "pointer",
        name: T
    } : 
    T extends "struct" ? {
        type: "struct",
        name: string,
        offset: number
    } : never
;

type C0Type = C0ValueType | C0PointerType<C0PointerNames>;

// C0Value type with some stronger constraints
/**
 * If 
 * vm_type = value, then 
 *      type must be "int", "char" or "boolean"
 * Else if
 * vm_type = ptr, then
 *      type must be "<unknown>", ..., "<unknown>[]", ...
 * Else if
 * never happens (in future, tagged ptr / func ptr)
 */
type C0Value<T extends C0ValueVMType> = 
    T extends C0ValueVMType.value ? {
        vm_type: T;
        type: C0ValueType;// Some types can't fit in C0Value directly
        value: DataView
    } : 
    T extends C0ValueVMType.ptr ? {
        vm_type: T;
        type: C0PointerType<C0PointerNames>;// Everything can have a corresponding pointer type
        value: C0Pointer
    } : 
    never;

// Enum Types for C0VM Instructions
declare const enum OpCode {
    IADD = 0x60,
    IAND = 0x7e,
    IDIV = 0x6c,
    IMUL = 0x68,
    IOR = 0x80,
    IREM = 0x70,
    ISHL = 0x78,
    ISHR = 0x7a,
    ISUB = 0x64,
    IXOR = 0x82,
    DUP = 0x59,
    POP = 0x57,
    SWAP = 0x5f,
    NEWARRAY = 0xbc,
    ARRAYLENGTH = 0xbe,
    NEW = 0xbb,
    AADDF = 0x62,
    AADDS = 0x63,
    IMLOAD = 0x2e,
    AMLOAD = 0x2f,
    IMSTORE = 0x4e,
    AMSTORE = 0x4f,
    CMLOAD = 0x34,
    CMSTORE = 0x55,
    VLOAD = 0x15,
    VSTORE = 0x36,
    ACONST = 0x01,
    BIPUSH = 0x10,
    ILDC = 0x13,
    ALDC = 0x14,
    NOP = 0x00,
    IF_CMPEQ = 0x9f,
    IF_CMPNE = 0xa0,
    IF_ICMPLT = 0xa1,
    IF_ICMPGE = 0xa2,
    IF_ICMPGT = 0xa3,
    IF_ICMPLE = 0xa4,
    GOTO = 0xa7,
    ATHROW = 0xbf,
    ASSERT = 0xcf,
    INVOKESTATIC = 0xb8,
    INVOKENATIVE = 0xb7,
    RETURN = 0xb0,
}

// use_official name instead of internal name.
type C0NativeFuncType =
    "NATIVE_ARGS_FLAG"
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

type VM_OperandStack = C0Value<C0ValueVMType>[];
type VM_LocalVariables = (C0Value<C0ValueVMType> | undefined)[];
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

type VM_State = {
    P: C0ByteCode,
    C: VM_Constants, // Constants the VM will use
    CallStack: VM_StackFrame[],
    CurrFrame: VM_StackFrame,
    CurrLineNumber: number
};


declare abstract class C0VM_RT {
    public emitter: MessageEmitter;
    
    abstract step_forward(): boolean;
    abstract restart(): void;
    abstract debug(): any;
}

