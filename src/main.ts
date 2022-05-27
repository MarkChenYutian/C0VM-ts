import fs = require('fs');
require('util').inspect.defaultOptions.depth = null;

import { step } from './exec/exec';
import ConsoleEmitter from './gui/console_emitter';
import { VM_Memory, createHeap } from './utility/memory';
import parse from './parser/parse';


// Initialize global variables
globalThis.DEBUG = true;
///////////////////////////////

const data = fs.readFileSync("./src/test/task1.bc0", 'utf8');
const code = parse(data);

const heap = createHeap(VM_Memory);
const handle = new ConsoleEmitter();

const func = code.functionPool[0];
const state: VM_State = {
    F: func,
    PC: 0,
    S: [],
    V: new Array(func.numVars).fill(undefined)
};

step(state, heap, handle);

console.log(state);