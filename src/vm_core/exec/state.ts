import { step } from "./exec";
import { createHeap, VM_Memory } from "../utility/memory";
import parse from "../parser/parse";
import { loadStringPool } from "../../utility/string_utility";

/**
 * The C0 Virtual Machine Runtime with interface of operation
 */
export default class C0VM_RuntimeState implements C0VM_RT{
    public raw_code: string;
    public code: C0ByteCode;
    public state: VM_State;
    public allocator: C0HeapAllocator;
    public heap_size: undefined | number
    public step_cnt: number

    /**
     * Creating a new C0VM Runtime
     * @param rawByteCode The bc0 bytecode string
     * @param heapSize Heap size (in bytes), optional, if not explicitly designated, then use the 
     * GlobalThis.MEM_POOL_DEFAULT_SIZE as the size.
     */
    constructor(rawByteCode: string, heapSize?: number) {
        this.raw_code = rawByteCode;
        this.code = parse(rawByteCode);
        this.heap_size = heapSize;
        this.allocator = createHeap(VM_Memory, heapSize);
        this.step_cnt = 0;
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
            CurrLineNumber: 0,
            TypeRecord: new Map<string, Map<number, Struct_Type_Record>>(),
        };
    }

    /**
     * Step forward for the C0VM Runtime State.
     * @returns If the runtime state is able to perform next "step forward"
     */
    public async step_forward(UIHooks: ReactUIHook): Promise<boolean> {
        this.step_cnt ++;
        return step(this.state, this.allocator, UIHooks);
    }

    public clone(): C0VM_RuntimeState {
        const C = new C0VM_RuntimeState(this.raw_code, this.heap_size);
        C.state = this.state;
        C.allocator = this.allocator;
        C.step_cnt = this.step_cnt;
        return C;
    }

    /**
     * A "peek hole" to help debug the VM
     * @returns The memory dump when DEBUG is activated
     */
    public debug(): any {
        if (globalThis.DEBUG) return this.allocator.debug_getMemPool();
    }
}
