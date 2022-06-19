import { step } from "./exec";
import { createHeap, VM_Memory } from "../utility/memory";
import parse from "../parser/parse";
import { loadStringPool } from "../utility/string_utility";
import MaterialEmitter from "../gui/material_emitter";

export default class C0VM_RuntimeState implements C0VM_RT{
    public code: C0ByteCode;
    public state: VM_State;
    public allocator: C0HeapAllocator;
    public emitter: MessageEmitter;

    constructor(rawByteCode: string, heapSize?: number) {
        this.emitter = new MaterialEmitter();
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
            CurrLineNumber: this.code.functionPool[0].comment.get(0).lineNumber
        };
    }

    public step_forward(): boolean {
        return step(this.state, this.allocator, this.emitter);
    }

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
            CurrLineNumber: this.code.functionPool[0].comment.get(0).lineNumber
        };
    }

    public debug(): any {
        return this.allocator.debug_getMemPool();
    }
}
