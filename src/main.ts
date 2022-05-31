import fs = require('fs');
require('util').inspect.defaultOptions.depth = null;

import { step } from './exec/exec';
import ConsoleEmitter from './gui/console_emitter';
import { VM_Memory, createHeap } from './utility/memory';
import parse from './parser/parse';
import { loadStringPool } from './utility/string_utility';


// Initialize global variables
globalThis.DEBUG = true;

globalThis.MEM_POOL_DEFAULT_SIZE = 1024 * 50;
globalThis.MEM_POOL_MAX_SIZE = 0xFFFF_FFFE;
globalThis.MEM_POOL_MIN_SIZE = 0x0000_0001;

globalThis.MEM_BLOCK_MAX_SIZE = 0xFFFF;
///////////////////////////////

const data = fs.readFileSync("./src/test/rec.bc0", 'utf8');
const code = parse(data);


const heap = createHeap(VM_Memory);
const handle = new ConsoleEmitter();

const constant: VM_Constants = {
    stringPoolPtr: loadStringPool(code.stringPool, heap)
} ;

const state: VM_State = {
    P: code,
    C: constant,
    CallStack: [],
    CurrFrame: {
        PC: 0,
        S: [],
        V: new Array(code.functionPool[0].numVars).fill(undefined),
        P: code.functionPool[0]
    }
};

let cont = true;
while (cont) {
    cont = step(state, heap, handle);
}
