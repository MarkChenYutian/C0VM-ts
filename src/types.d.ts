type C0Function = {
    numVars: number;
    varName: string[];
    numArgs: number;
    size: number;
    name: string;
    code: Uint8Array;
};

type C0Native = {
    numArgs: number;
    // functionIndex: number;
    readonly functionType: C0NativeFuncType;
    // name: number;
    readonly f: Function;
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

// Memory System that allows c-like ptr
type C0HeapMemory = ArrayBuffer;

// C0Pointer = [addr: u32, offset: u32]
type C0Pointer = DataView;
// Note: a C0 Pointer is NULL when ptr.getBigUint64() === 0n is true

type C0Value = {
    class: "value" | "ptr";
    type: "<unknown>" | "int" | "char" | "boolean"; // Preserved for future use
    value: DataView;
}

// Enum Types for C0VM
type OpCode =
    | 0x60 // IADD
    | 0x7e // IAND
    | 0x6c // IDIV
    | 0x68 // IMUL
    | 0x80 // IOR
    | 0x70 // IREM
    | 0x78 // ISHL
    | 0x7a // ISHR
    | 0x64 // ISUB
    | 0x82 // IXOR
    | 0x59 // DUP
    | 0x57 // POP
    | 0x5f // SWAP
    | 0xbc // NEWARRAY
    | 0xbe // ARRAYLENGTH
    | 0xbb // NEW
    | 0x62 // AADDF
    | 0x63 // AADDS
    | 0x2e // IMLOAD
    | 0x2f // AMLOAD
    | 0x4e // IMSTORE
    | 0x4f // AMSTORE
    | 0x34 // CMLOAD
    | 0x55 // CMSTORE
    | 0x15 // VLOAD
    | 0x36 // VSTORE
    | 0x01 // ACONST
    | 0x10 // BIPUSH
    | 0x13 // ILDC
    | 0x14 // ALDC
    | 0x00 // NOP
    | 0x9f // IF_CMPEQ
    | 0xa0 // IF_CMPNE
    | 0xa1 // IF_ICMPLT
    | 0xa2 // IF_ICMPGE
    | 0xa3 // IF_ICMPGT
    | 0xa4 // IF_ICMPLE
    | 0xa7 // GOTO
    | 0xbf // ATHROW
    | 0xcf // ASSERT
    | 0xb8 // INVOKESTATIC
    | 0xb7 // INVOKENATIVE
    | 0xb0; // RETURN

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
