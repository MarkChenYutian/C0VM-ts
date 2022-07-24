/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract All the error types used in the project.
 */


/**
 * c0_user_error should be used only when user explicitly 
 * calls error() in their C0 source code (a.k.a. ATHROW 
 * instruction in bytecode)
 */
export class c0_user_error extends Error {
    public readonly name = "C0UserError";
    constructor(msg: string) {
        super("C0 User Error: " + msg);
    }
}

/**
 * c0_assertion_error should be used only when there is an
 * assert(cond) has <cond> evaluated to be false.
 */
export class c0_assertion_error extends Error {
    public readonly name = "C0AssertionError";
    constructor(msg: string) {
        super("C0 Assertion Error: " + msg);
    }
}

/**
 * c0_memory_error refers to several situations:
 * 1. Not enough memory (OOM error)
 * 2. Dereferencing a NULL Pointer
 * 3. Invalid pointer shift (shift a pointer out of the block
 *    it is defined in)
 */
export class c0_memory_error extends Error {
    public readonly name = "C0MemoryError";
    constructor(msg: string) {
        super("C0 Memory Error: " + msg);
    }
}

/**
 * c0_value_error should be used when the native 
 * function call does not match precondition (for instance,
 * the string_sub(str, start, end) have start > end).
 */
export class c0_value_error extends Error {
    public readonly name = "C0ValueError";
    constructor(msg: string) {
        super("C0 Value Error: " + msg);
    }
}

/**
 * c0_arith_error should be used when there is divided by zero,
 * int_min divided by -1 etc.
 */
export class c0_arith_error extends Error {
    public readonly name = "C0ArithError";
    constructor(msg: string) {
        super("C0 Arithmetic Error: " + msg);
    }
}

/**
 * General error for codes in vm_core directory.
 */
export class vm_error extends Error {
    public readonly name = "VMError";
    constructor(msg: string) {
        super("VM Error: " + msg);
    }
}

/**
 * Undefined instruction for virtual machine
 */
export class vm_instruct_error extends Error {
    public readonly name = "VMInstructError";
    constructor(msg: string) {
        super("VM Instruction Error: " + msg);
    }
}

/**
 * Unexpected bytecode contend during parsing
 */
export class bc0_format_error extends Error {
    public readonly name = "BC0FormatError";
    constructor() {
        super("Invalid BC0 File Input.");
    }
}

/**
 * General error for all other parts of the project
 */
export class internal_error extends Error {
    public readonly name = "Internal Exception";
}
