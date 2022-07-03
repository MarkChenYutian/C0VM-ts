export class c0_user_error extends Error {
    public readonly name: "C0UserError" = "C0UserError";
    constructor(msg: string) {
        super("C0 User Error: " + msg);
    }
}

export class c0_assertion_error extends Error {
    public readonly name: "C0AssertionError" = "C0AssertionError";
    constructor(msg: string) {
        super("C0 Assertion Error: " + msg);
    }
}

export class c0_memory_error extends Error {
    public readonly name: "C0MemoryError" = "C0MemoryError";
    constructor(msg: string) {
        super("C0 Memory Error: " + msg);
    }
}

export class c0_value_error extends Error {
    public readonly name: "C0ValueError" = "C0ValueError";
    constructor(msg: string) {
        super("C0 Value Error: " + msg);
    }
}

export class c0_arith_error extends Error {
    public readonly name: "C0ArithError" = "C0ArithError";
    constructor(msg: string) {
        super("C0 Arithmetic Error: " + msg);
    }
}

export class vm_error extends Error {
    public readonly name: "VMError" = "VMError";
    constructor(msg: string) {
        super("VM Error: " + msg);
    }
}

export class vm_instruct_error extends Error {
    public readonly name: "VMInstructError" = "VMInstructError";
    constructor(msg: string) {
        super("VM Instruction Error: " + msg);
    }
}

export class bc0_format_error extends Error {
    public readonly name: "BC0FormatError" = "BC0FormatError";
    constructor() {
        super("Invalid BC0 File Input.");
    }
}

export class internal_error extends Error {
    public readonly name: "Internal Exception" = "Internal Exception";
}
