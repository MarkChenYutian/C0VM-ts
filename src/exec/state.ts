import { step } from "./exec";
import { createHeap, VM_Memory } from "../utility/memory";
import parse from "../parser/parse";
import { loadStringPool } from "../utility/string_utility";

/**
 * The C0 Virtual Machine Runtime with interface of operation
 */
export default class C0VM_RuntimeState implements C0VM_RT{
    public code: C0ByteCode;
    public state: VM_State;
    public allocator: C0HeapAllocator;

    /**
     * Creating a new C0VM Runtime
     * @param rawByteCode The bc0 bytecode string
     * @param heapSize Heap size (in bytes), optional, if not explicitly designated, then use the 
     * GlobalThis.MEM_POOL_DEFAULT_SIZE as the size.
     */
    constructor(rawByteCode: string, heapSize?: number) {
        this.code = parse(rawByteCode);
        this.allocator = createHeap(VM_Memory, heapSize);
        const str_ptr = loadStringPool(this.code.stringPool, this.allocator);
        this.state = {
            P: this.code,
            C: {
                stringPoolPtr: str_ptr
            },
            CallStack: [],
            CurrFrame: {
                PC: 0,
                S: [],
                V: new Array(this.code.functionPool[0].numVars).fill(undefined),
                P: this.code.functionPool[0]
            },
            CurrLineNumber: this.code.functionPool[0].comment.get(0).lineNumber,
            TypeRecord: new Map<string, Map<number, C0Type<C0TypeClass>>>()
        };
    }

    /**
     * Step forward for the C0VM Runtime State.
     * @returns If the runtime state is able to perform next "step forward"
     */
    public step_forward(): boolean {
        return step(this.state, this.allocator);
    }

    /**
     * Re-initialize the state **without passing in bytecode file**
     * The parsed bytecode is stored in the .code property of runtime and is 
     * loaded again when this function is called.
     */
    public restart(): void {
        this.allocator.clear();
        const str_ptr = loadStringPool(this.code.stringPool, this.allocator);
        this.state = {
            P: this.code,
            C: {
                stringPoolPtr: str_ptr
            },
            CallStack: [],
            CurrFrame: {
                PC: 0,
                S: [],
                V: new Array(this.code.functionPool[0].numVars).fill(undefined),
                P: this.code.functionPool[0]
            },
            CurrLineNumber: this.code.functionPool[0].comment.get(0).lineNumber,
            TypeRecord: new Map<string, Map<number, C0Type<C0TypeClass>>>()
        };
    }

    /**
     * A "peek hole" to help debug the VM
     * @returns The memory dump when DEBUG is activated
     */
    public debug(): any {
        if (globalThis.DEBUG) return this.allocator.debug_getMemPool();
    }
}
