import fs = require('fs');
require('util').inspect.defaultOptions.depth = null;

import { step } from './exec/exec';
import ConsoleEmitter from './gui/console_emitter';
import { VM_Memory, createHeap } from './utility/memory';
import parse from './parser/parse';
import { loadStringPool } from './utility/string_utility';


// Initialize global variables
globalThis.DEBUG = true;
globalThis.DEBUG_DUMP_MEM = true;
globalThis.DEBUG_DUMP_STEP = true;

globalThis.MEM_POOL_SIZE = 64;
globalThis.MEM_POOL_DEFAULT_SIZE = 1024 * 50;
globalThis.MEM_POOL_MAX_SIZE = 0xFFFF_FFFE;
globalThis.MEM_POOL_MIN_SIZE = 0x0000_0001;

globalThis.MEM_BLOCK_MAX_SIZE = 0xFFFF;

globalThis.UI_INPUT_ID = "c0-code-input";
globalThis.UI_PRINTOUT_ID = "c0-output";
globalThis.UI_MSG_ID = "message-terminal";

globalThis.UI_ERR_DISPLAY_TIME_MS = 10000;
globalThis.UI_WARN_DISPLAY_TIME_MS = 7000;
globalThis.UI_OK_DISPLAY_TIME_MS = 4000;

globalThis.COMPILER_BACKEND_URL = "";

globalThis.C0_BYTECODE_MAX_LENGTH = 20000;
globalThis.C0_ENVIR_MODE = "nodejs";

globalThis.C0_RUNTIME = undefined;
globalThis.MSG_EMITTER = new ConsoleEmitter();
///////////////////////////////

const fileName = process.argv[2];
const data = fs.readFileSync("./src/test/" + fileName, 'utf8');
const code = parse(data);


// Miniature, 64-byte heap memory for debug
const heap = createHeap(VM_Memory, 64);

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
    cont = step(state, heap, globalThis.MSG_EMITTER);
}

if (global.DEBUG) {
    console.log("\n\n==========\nDEBUG - Heap Memory Dump:");
    console.log(heap.debug_getMemPool());
}
