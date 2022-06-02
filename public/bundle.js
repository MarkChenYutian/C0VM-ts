/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/exec/exec.ts":
/*!**************************!*\
  !*** ./src/exec/exec.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.step = void 0;
var arithmetic = __webpack_require__(/*! ../utility/arithmetic */ "./src/utility/arithmetic.ts");
var c0_value_1 = __webpack_require__(/*! ../utility/c0_value */ "./src/utility/c0_value.ts");
var errors_1 = __webpack_require__(/*! ../utility/errors */ "./src/utility/errors.ts");
var pointer_ops_1 = __webpack_require__(/*! ../utility/pointer_ops */ "./src/utility/pointer_ops.ts");
var string_utility_1 = __webpack_require__(/*! ../utility/string_utility */ "./src/utility/string_utility.ts");
var helpers_1 = __webpack_require__(/*! ./helpers */ "./src/exec/helpers.ts");
function step(state, allocator, msg_handle) {
    var F = state.CurrFrame.P;
    switch (F.code[state.CurrFrame.PC]) {
        case 89: {
            state.CurrFrame.PC += 1;
            var v = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var nv = v.vm_type === "ptr" ?
                {
                    value: new DataView(v.value.buffer.slice(v.value.byteOffset, v.value.byteLength)),
                    vm_type: v.vm_type,
                    type: v.type
                } :
                {
                    value: new DataView(v.value.buffer.slice(v.value.byteOffset, v.value.byteLength)),
                    vm_type: v.vm_type,
                    type: v.type
                };
            state.CurrFrame.S.push(v);
            state.CurrFrame.S.push(nv);
            break;
        }
        case 87: {
            state.CurrFrame.PC += 1;
            (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            break;
        }
        case 95: {
            state.CurrFrame.PC += 1;
            var v2 = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var v1 = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push(v2);
            state.CurrFrame.S.push(v1);
            break;
        }
        case 96: {
            state.CurrFrame.PC += 1;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(arithmetic.c_add(x.value, y.value), "int"));
            break;
        }
        case 126: {
            state.CurrFrame.PC += 1;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(arithmetic.c_and(x.value, y.value), "int"));
            break;
        }
        case 108: {
            state.CurrFrame.PC += 1;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(arithmetic.c_div(x.value, y.value), "int"));
            break;
        }
        case 104: {
            state.CurrFrame.PC += 1;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(arithmetic.c_mul(x.value, y.value, msg_handle), "int"));
            break;
        }
        case 128: {
            state.CurrFrame.PC += 1;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(arithmetic.c_or(x.value, y.value), "int"));
            break;
        }
        case 112: {
            state.CurrFrame.PC += 1;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(arithmetic.c_rem(x.value, y.value), "int"));
            break;
        }
        case 120: {
            state.CurrFrame.PC += 1;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(arithmetic.c_lsh(x.value, y.value), "int"));
            break;
        }
        case 122: {
            state.CurrFrame.PC += 1;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(arithmetic.c_rsh(x.value, y.value), "int"));
            break;
        }
        case 100: {
            state.CurrFrame.PC += 1;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(arithmetic.c_sub(x.value, y.value), "int"));
            break;
        }
        case 130: {
            state.CurrFrame.PC += 1;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(arithmetic.c_xor(x.value, y.value), "int"));
            break;
        }
        case 16: {
            var b = F.code[state.CurrFrame.PC + 1];
            var rebuild_type = F.comment.get(state.CurrFrame.PC).dataType;
            if (rebuild_type === undefined) {
                rebuild_type = "<unknown>";
            }
            state.CurrFrame.PC += 2;
            var v = new DataView(new ArrayBuffer(4));
            v.setInt32(0, b);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(v, rebuild_type));
            break;
        }
        case 19: {
            var c1 = F.code[state.CurrFrame.PC + 1];
            var c2 = F.code[state.CurrFrame.PC + 2];
            var idx = (c1 << 8) | c2;
            state.CurrFrame.PC += 3;
            state.CurrFrame.S.push((0, c0_value_1.js_cvt2_c0_value)(new DataView(state.P.intPool.buffer).getInt32(idx * 4, false)));
            break;
        }
        case 20: {
            var c1 = F.code[state.CurrFrame.PC + 1];
            var c2 = F.code[state.CurrFrame.PC + 2];
            var idx = (c1 << 8) | c2;
            state.CurrFrame.PC += 3;
            state.CurrFrame.S.push((0, c0_value_1.build_c0_ptrValue)((0, pointer_ops_1.shift_ptr)(state.C.stringPoolPtr, idx), "string"));
            break;
        }
        case 1: {
            state.CurrFrame.PC += 1;
            var null_ptr = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_ptrValue)(new DataView(null_ptr.buffer), "<unknown>"));
            break;
        }
        case 21: {
            var idx = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;
            if (state.CurrFrame.V[idx] === undefined) {
                throw new errors_1.vm_error("Unable to load undefined local variable.");
            }
            state.CurrFrame.S.push(state.CurrFrame.V[idx]);
            break;
        }
        case 54: {
            var idx = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;
            var val = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            state.CurrFrame.V[idx] = val;
            break;
        }
        case 176: {
            state.CurrFrame.PC += 1;
            var retval = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            console.log("return from <".concat(state.CurrFrame.P.name, "> with retval:"));
            console.log(retval);
            if (state.CallStack.length === 0) {
                return false;
            }
            else {
                var restore_frame = state.CallStack.pop();
                state.CurrFrame = restore_frame;
                state.CurrFrame.S.push(retval);
            }
            break;
        }
        case 191: {
            state.CurrFrame.PC += 1;
            var str_ptr = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (str_ptr.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch: expected a pointer in C0Value, received a ".concat(str_ptr.vm_type));
            }
            throw new errors_1.c0_user_error((0, string_utility_1.loadString)(str_ptr, allocator));
        }
        case 207: {
            state.CurrFrame.PC += 1;
            var str_ptr = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (str_ptr.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch: expected a pointer in C0Value, received a ".concat(str_ptr.vm_type));
            }
            var val = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (val.vm_type !== "value") {
                throw new errors_1.vm_error("Type unmatch: expected a value in C0Value, received a ".concat(str_ptr.vm_type));
            }
            if (val.value.getBigUint64(0) === BigInt(0)) {
                throw new errors_1.c0_user_error((0, string_utility_1.loadString)(str_ptr, allocator));
            }
            break;
        }
        case 0: {
            state.CurrFrame.PC += 1;
            break;
        }
        case 159: {
            var view = new DataView(F.code.buffer);
            var o1 = view.getInt8(state.CurrFrame.PC + 1);
            var o2 = view.getInt8(state.CurrFrame.PC + 2);
            var offset = o1 << 8 | o2;
            var v1 = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var v2 = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if ((0, c0_value_1.is_same_value)(v1.value, v2.value)) {
                state.CurrFrame.PC += offset;
            }
            else {
                state.CurrFrame.PC += 3;
            }
            break;
        }
        case 160: {
            var view = new DataView(F.code.buffer);
            var o1 = view.getInt8(state.CurrFrame.PC + 1);
            var o2 = view.getInt8(state.CurrFrame.PC + 2);
            var offset = o1 << 8 | o2;
            var v1 = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var v2 = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (!(0, c0_value_1.is_same_value)(v1.value, v2.value)) {
                state.CurrFrame.PC += offset;
            }
            else {
                state.CurrFrame.PC += 3;
            }
            break;
        }
        case 161: {
            var view = new DataView(F.code.buffer);
            var o1 = view.getInt8(state.CurrFrame.PC + 1);
            var o2 = view.getInt8(state.CurrFrame.PC + 2);
            var offset = o1 << 8 | o2;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (x.value.getInt32(0) < y.value.getInt32(0)) {
                state.CurrFrame.PC += offset;
            }
            else {
                state.CurrFrame.PC += 3;
            }
            break;
        }
        case 163: {
            var view = new DataView(F.code.buffer);
            var o1 = view.getInt8(state.CurrFrame.PC + 1);
            var o2 = view.getInt8(state.CurrFrame.PC + 2);
            var offset = o1 << 8 | o2;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (x.value.getInt32(0) > y.value.getInt32(0)) {
                state.CurrFrame.PC += offset;
            }
            else {
                state.CurrFrame.PC += 3;
            }
            break;
        }
        case 162: {
            var view = new DataView(F.code.buffer);
            var o1 = view.getInt8(state.CurrFrame.PC + 1);
            var o2 = view.getInt8(state.CurrFrame.PC + 2);
            var offset = o1 << 8 | o2;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (x.value.getInt32(0) >= y.value.getInt32(0)) {
                state.CurrFrame.PC += offset;
            }
            else {
                state.CurrFrame.PC += 3;
            }
            break;
        }
        case 164: {
            var view = new DataView(F.code.buffer);
            var o1 = view.getInt8(state.CurrFrame.PC + 1);
            var o2 = view.getInt8(state.CurrFrame.PC + 2);
            var offset = o1 << 8 | o2;
            var y = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (x.value.getInt32(0) <= y.value.getInt32(0)) {
                state.CurrFrame.PC += offset;
            }
            else {
                state.CurrFrame.PC += 3;
            }
            break;
        }
        case 167: {
            var view = new DataView(F.code.buffer);
            var o1 = view.getInt8(state.CurrFrame.PC + 1);
            var o2 = view.getInt8(state.CurrFrame.PC + 2);
            var offset = o1 << 8 | o2;
            state.CurrFrame.PC += offset;
            break;
        }
        case 183: {
            var c1 = F.code[state.CurrFrame.PC + 1];
            var c2 = F.code[state.CurrFrame.PC + 2];
            state.CurrFrame.PC += 3;
            var fidx = c1 << 8 | c2;
            var native_F = state.P.nativePool[fidx];
            var args = [];
            for (var i = 0; i < native_F.numArgs; i++) {
                args.unshift((0, helpers_1.safe_pop_stack)(state.CurrFrame.S));
            }
            var res = native_F.f.apply(native_F, __spreadArray([allocator], args, false));
            state.CurrFrame.S.push(res);
            break;
        }
        case 184: {
            var c1 = F.code[state.CurrFrame.PC + 1];
            var c2 = F.code[state.CurrFrame.PC + 2];
            state.CurrFrame.PC += 3;
            var fidx = c1 << 8 | c2;
            var called_F = state.P.functionPool[fidx];
            var called_F_vars = new Array(called_F.numVars).fill(undefined);
            for (var i = called_F.numArgs - 1; i >= 0; i--) {
                called_F_vars[i] = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            }
            state.CallStack.push(state.CurrFrame);
            state.CurrFrame = {
                PC: 0,
                S: [],
                V: called_F_vars,
                P: called_F
            };
            break;
        }
        case 187: {
            var s = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;
            var ptr = allocator.malloc(s);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_ptrValue)(ptr));
            break;
        }
        case 46: {
            state.CurrFrame.PC += 1;
            var a = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (a.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch, expect to receive a pointer");
            }
            var mem_block = allocator.imload(a.value);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(mem_block, (0, helpers_1.ptr2val_type_inference)(a.type)));
            break;
        }
        case 78: {
            state.CurrFrame.PC += 1;
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var a = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (x.vm_type !== "value" || a.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch, expected to have {ptr, value}");
            }
            allocator.imstore(a.value, x.value);
            break;
        }
        case 47: {
            state.CurrFrame.PC += 1;
            var a = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (a.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch, expect to receive a pointer");
            }
            var mem_block = allocator.amload(a.value);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_ptrValue)(mem_block, (0, helpers_1.ptr2ptr_type_inference)(a.type)));
            break;
        }
        case 79: {
            state.CurrFrame.PC += 1;
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var a = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (x.vm_type !== "value" || a.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch, expected to have {ptr, value}");
            }
            allocator.amstore(a.value, x.value);
            break;
        }
        case 52: {
            state.CurrFrame.PC += 1;
            var a = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (a.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch, expect to receive a pointer");
            }
            var mem_block = allocator.cmload(a.value);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_value)(mem_block, "char"));
            break;
        }
        case 85: {
            state.CurrFrame.PC += 1;
            var x = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var a = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (x.vm_type !== "value" || a.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch, expected to have {ptr, value}");
            }
            allocator.cmstore(a.value, x.value);
            break;
        }
        case 98: {
            var f = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;
            var a = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (a.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch, expect to receive a pointer");
            }
            var off_ptr = (0, pointer_ops_1.shift_ptr)(a.value, f);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_ptrValue)(off_ptr, a.type));
            break;
        }
        case 188: {
            var f = F.code[state.CurrFrame.PC + 1];
            state.CurrFrame.PC += 2;
            var a = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (a.vm_type !== "value") {
                throw new errors_1.vm_error("Type unmatch, expect to receive a value");
            }
            var ptr = allocator.malloc(f * a.value.getUint32(0) + 4);
            allocator.deref(ptr).setUint32(0, f);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_ptrValue)(ptr, "<unknown>[]"));
            break;
        }
        case 190: {
            state.CurrFrame.PC += 1;
            var a = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (a.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch, expected to have pointer");
            }
            var _a = (0, pointer_ops_1.read_ptr)(a.value), addr = _a[0], offset = _a[1], size = _a[2];
            var s = allocator.deref(a.value).getUint32(0);
            var length_1 = (size - 4) / s;
            state.CurrFrame.S.push((0, c0_value_1.js_cvt2_c0_value)(length_1));
            break;
        }
        case 99: {
            state.CurrFrame.PC += 1;
            var i = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            var a = (0, helpers_1.safe_pop_stack)(state.CurrFrame.S);
            if (i.vm_type !== "value" || a.vm_type !== "ptr") {
                throw new errors_1.vm_error("Type unmatch, expected to have {ptr, value}");
            }
            var s = allocator.deref(a.value).getUint32(0);
            state.CurrFrame.S.push((0, c0_value_1.build_c0_ptrValue)((0, pointer_ops_1.shift_ptr)(a.value, 4 + s * i.value.getUint32(0)), (0, helpers_1.ptr2ptr_type_inference)(a.type)));
            break;
        }
        default: {
            throw new errors_1.vm_error("Undefined instruction ".concat(F.code[state.CurrFrame.PC]));
        }
    }
    return true;
}
exports.step = step;


/***/ }),

/***/ "./src/exec/helpers.ts":
/*!*****************************!*\
  !*** ./src/exec/helpers.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.ptr2ptr_type_inference = exports.ptr2val_type_inference = exports.safe_pop_stack = void 0;
var errors_1 = __webpack_require__(/*! ../utility/errors */ "./src/utility/errors.ts");
function safe_pop_stack(S) {
    if (S.length < 1)
        throw new errors_1.vm_error("Unable to pop value out of an empty stack!");
    return S.pop();
}
exports.safe_pop_stack = safe_pop_stack;
function ptr2val_type_inference(T) {
    switch (T) {
        case "<unknown>":
        case "<unknown>[]":
        case "struct":
            return "<unknown>";
        case "boolean":
        case "boolean[]":
            return "boolean";
        case "char":
        case "char[]":
            return "char";
        case "int":
        case "int[]":
            return "int";
        default:
            throw new errors_1.vm_error("Unexpected pointer type ".concat(T));
    }
}
exports.ptr2val_type_inference = ptr2val_type_inference;
function ptr2ptr_type_inference(T) {
    switch (T) {
        case "<unknown>":
        case "<unknown>[]":
            return "<unknown>";
        case "boolean":
        case "boolean[]":
            return "boolean";
        case "char":
        case "char[]":
            return "char";
        case "int":
        case "int[]":
            return "int";
        case "string":
        case "string[]":
            return "string";
        case "struct":
        case "struct[]":
            return "struct";
    }
}
exports.ptr2ptr_type_inference = ptr2ptr_type_inference;


/***/ }),

/***/ "./src/exec/state.ts":
/*!***************************!*\
  !*** ./src/exec/state.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
var exec_1 = __webpack_require__(/*! ./exec */ "./src/exec/exec.ts");
var memory_1 = __webpack_require__(/*! ../utility/memory */ "./src/utility/memory.ts");
var parse_1 = __webpack_require__(/*! ../parser/parse */ "./src/parser/parse.ts");
var string_utility_1 = __webpack_require__(/*! ../utility/string_utility */ "./src/utility/string_utility.ts");
var material_emitter_1 = __webpack_require__(/*! ../gui/material_emitter */ "./src/gui/material_emitter.ts");
var C0VM_RuntimeState = (function () {
    function C0VM_RuntimeState(rawByteCode, heapSize) {
        this.emitter = new material_emitter_1["default"]();
        this.code = (0, parse_1["default"])(rawByteCode);
        this.allocator = (0, memory_1.createHeap)(memory_1.VM_Memory, heapSize);
        var str_ptr = (0, string_utility_1.loadStringPool)(this.code.stringPool, this.allocator);
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
            }
        };
    }
    C0VM_RuntimeState.prototype.step_forward = function () {
        return (0, exec_1.step)(this.state, this.allocator, this.emitter);
    };
    C0VM_RuntimeState.prototype.restart = function () {
        this.allocator.clear();
        var str_ptr = (0, string_utility_1.loadStringPool)(this.code.stringPool, this.allocator);
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
            }
        };
    };
    C0VM_RuntimeState.prototype.debug = function () {
        return this.allocator.debug_getMemPool();
    };
    return C0VM_RuntimeState;
}());
exports["default"] = C0VM_RuntimeState;


/***/ }),

/***/ "./src/gui/material_emitter.ts":
/*!*************************************!*\
  !*** ./src/gui/material_emitter.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
var MaterialEmitter = (function () {
    function MaterialEmitter() {
        this.msg_counter = 0;
        this.msg_root = document.getElementById(globalThis.UI_MSG_ID);
    }
    MaterialEmitter.prototype.createElement = function (tagName, attrs) {
        if (attrs === void 0) { attrs = {}; }
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        var elem = Object.assign(document.createElement(tagName), attrs);
        for (var _a = 0, children_1 = children; _a < children_1.length; _a++) {
            var child = children_1[_a];
            if (Array.isArray(child))
                elem.append.apply(elem, child);
            else
                elem.append(child);
        }
        return elem;
    };
    MaterialEmitter.prototype.err = function (msg, detail) {
        var tobe_removed_id = "message-id-" + this.msg_counter;
        var new_msg = this.createElement("div", {
            id: tobe_removed_id,
            className: "err-msg"
        }, detail === undefined
            ? [
                this.createElement("h4", {}, [
                    this.createElement("i", {
                        className: "fas fa-exclamation-circle",
                        style: "color: rgb(239, 83, 80);"
                    }), "   ",
                    msg
                ])
            ]
            : [
                this.createElement("h4", {}, [
                    this.createElement("i", {
                        className: "fas fa-exclamation-circle",
                        style: "color: rgb(239, 83, 80);"
                    }), "   ",
                    msg
                ]),
                this.createElement("p", {}, detail),
            ]);
        this.msg_root.appendChild(new_msg);
        setTimeout(function () {
            var pending_remove = document.querySelector("div#" + tobe_removed_id);
            pending_remove.parentNode.removeChild(pending_remove);
        }, 4000);
        this.msg_counter++;
    };
    MaterialEmitter.prototype.warn = function (msg, detail) {
        var tobe_removed_id = "message-id-" + this.msg_counter;
        var new_msg = this.createElement("div", {
            id: tobe_removed_id,
            className: "warn-msg"
        }, detail === undefined
            ? [
                this.createElement("h4", {}, [
                    this.createElement("i", {
                        className: "fas fa-exclamation-triangle",
                        style: "color: rgb(255, 152, 0);"
                    }), "   ",
                    msg
                ])
            ]
            : [
                this.createElement("h4", {}, [
                    this.createElement("i", {
                        className: "fas fa-exclamation-triangle",
                        style: "color: rgb(255, 152, 0);"
                    }), "   ",
                    msg
                ]),
                this.createElement("p", {}, detail),
            ]);
        this.msg_root.appendChild(new_msg);
        setTimeout(function () {
            var pending_remove = document.querySelector("div#" + tobe_removed_id);
            pending_remove.parentNode.removeChild(pending_remove);
        }, 4000);
        this.msg_counter++;
    };
    MaterialEmitter.prototype.ok = function (msg, detail) {
        var tobe_removed_id = "message-id-" + this.msg_counter;
        var new_msg = this.createElement("div", {
            id: tobe_removed_id,
            className: "ok-msg"
        }, detail === undefined
            ? [
                this.createElement("h4", {}, [
                    this.createElement("i", {
                        className: "fas fa-check-circle",
                        style: "color: rgb(76, 175, 80);"
                    }), "   ",
                    msg
                ])
            ]
            : [
                this.createElement("h4", {}, [
                    this.createElement("i", {
                        className: "fas fa-check-circle",
                        style: "color: rgb(76, 175, 80);"
                    }), "   ",
                    msg
                ]),
                this.createElement("p", {}, detail),
            ]);
        this.msg_root.appendChild(new_msg);
        setTimeout(function () {
            var pending_remove = document.querySelector("div#" + tobe_removed_id);
            pending_remove.parentNode.removeChild(pending_remove);
        }, 4000);
        this.msg_counter++;
    };
    return MaterialEmitter;
}());
exports["default"] = MaterialEmitter;


/***/ }),

/***/ "./src/native/native_interface.ts":
/*!****************************************!*\
  !*** ./src/native/native_interface.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.nativeFuncLoader = void 0;
var c0_value_1 = __webpack_require__(/*! ../utility/c0_value */ "./src/utility/c0_value.ts");
var errors_1 = __webpack_require__(/*! ../utility/errors */ "./src/utility/errors.ts");
var StringNative = __webpack_require__(/*! ./native_strings */ "./src/native/native_strings.ts");
var IONative = __webpack_require__(/*! ./native_io */ "./src/native/native_io.ts");
function nativeFuncLoader(index, numArgs) {
    var native = nativeFuncMapping(index);
    if (native === undefined)
        return native;
    native.numArgs = numArgs;
    return native;
}
exports.nativeFuncLoader = nativeFuncLoader;
function nativeFuncMapping(index) {
    switch (index) {
        case 0:
            return {
                functionType: "NATIVE_ARGS_FLAG",
                numArgs: 0,
                f: nativeNotImplemented
            };
        case 1:
            return {
                functionType: "NATIVE_ARGS_INT",
                numArgs: 0,
                f: nativeNotImplemented
            };
        case 2:
            return {
                functionType: "NATIVE_ARGS_PARSE",
                numArgs: 0,
                f: nativeNotImplemented
            };
        case 3:
            return {
                functionType: "NATIVE_ARGS_STRING",
                numArgs: 0,
                f: nativeNotImplemented
            };
        case 5:
            return {
                functionType: "NATIVE_FLUSH",
                numArgs: 0,
                f: nativeNotImplemented
            };
        case 6:
            return {
                functionType: "NATIVE_PRINT",
                numArgs: 0,
                f: function (mem, arg1) {
                    if (arg1.vm_type !== "ptr") {
                        throw new errors_1.vm_error("Print can only receive a pointer argument");
                    }
                    return (0, c0_value_1.js_cvt2_c0_value)(IONative.c0_print(mem, arg1));
                }
            };
        case 7:
            return {
                functionType: "NATIVE_PRINTBOOL",
                numArgs: 0,
                f: function (mem, arg1) {
                    if (arg1.vm_type !== "value") {
                        throw new errors_1.vm_error("PrintBool can only receive a value argument");
                    }
                    return (0, c0_value_1.js_cvt2_c0_value)(IONative.c0_print_bool(mem, arg1));
                }
            };
        case 8:
            return {
                functionType: "NATIVE_PRINTCHAR",
                numArgs: 0,
                f: function (mem, arg1) {
                    if (arg1.vm_type !== "value") {
                        throw new errors_1.vm_error("PrintChar can only receive a value argument");
                    }
                    return (0, c0_value_1.js_cvt2_c0_value)(IONative.c0_print_char(mem, arg1));
                }
            };
        case 9:
            return {
                functionType: "NATIVE_PRINTINT",
                numArgs: 0,
                f: function (mem, arg1) {
                    if (arg1.vm_type !== "value") {
                        throw new errors_1.vm_error("PrintInt can only receive a value argument");
                    }
                    return (0, c0_value_1.js_cvt2_c0_value)(IONative.c0_print_int(mem, arg1));
                }
            };
        case 10:
            return {
                functionType: "NATIVE_PRINTLN",
                numArgs: 0,
                f: function (mem, arg1) {
                    if (arg1.vm_type !== "ptr") {
                        throw new errors_1.vm_error("PrintLn can only receive a pointer argument");
                    }
                    return (0, c0_value_1.js_cvt2_c0_value)(IONative.c0_println(mem, arg1));
                }
            };
        case 11:
            return {
                functionType: "NATIVE_READLINE",
                numArgs: 0,
                f: nativeNotImplemented
            };
        case 54: {
            return {
                functionType: "NATIVE_DADD",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 55: {
            return {
                functionType: "NATIVE_DDIV",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 56: {
            return {
                functionType: "NATIVE_DLESS",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 57: {
            return {
                functionType: "NATIVE_DMUL",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 59: {
            return {
                functionType: "NATIVE_DSUB",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 60: {
            return {
                functionType: "NATIVE_DTOI",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 61: {
            return {
                functionType: "NATIVE_ITOD",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 62: {
            return {
                functionType: "NATIVE_PRINT_DUB",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 67: {
            return {
                functionType: "NATIVE_FADD",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 68: {
            return {
                functionType: "NATIVE_FDIV",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 69: {
            return {
                functionType: "NATIVE_FLESS",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 70: {
            return {
                functionType: "NATIVE_FMUL",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 71: {
            return {
                functionType: "NATIVE_FSUB",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 72: {
            return {
                functionType: "NATIVE_FTOI",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 73: {
            return {
                functionType: "NATIVE_ITOF",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 74: {
            return {
                functionType: "NATIVE_PRINT_FPT",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 75: {
            return {
                functionType: "NATIVE_PRINT_HEX",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 76: {
            return {
                functionType: "NATIVE_PRINT_INT",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 85: {
            return {
                functionType: "NATIVE_INT_TOKENS",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 86: {
            return {
                functionType: "NATIVE_NUM_TOKENS",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 87: {
            return {
                functionType: "NATIVE_PARSE_BOOL",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 88: {
            return {
                functionType: "NATIVE_PARSE_INT",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 89: {
            return {
                functionType: "NATIVE_PARSE_INTS",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 90: {
            return {
                functionType: "NATIVE_PARSE_TOKENS",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 91: {
            return {
                functionType: "NATIVE_CHAR_CHR",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 92: {
            return {
                functionType: "NATIVE_CHAR_ORD",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 93: {
            return {
                functionType: "NATIVE_STRING_CHARAT",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 94: {
            return {
                functionType: "NATIVE_STRING_COMPARE",
                numArgs: 0,
                f: function (mem, arg1, arg2) {
                    if (arg1.vm_type !== "ptr" || arg2.vm_type !== "ptr") {
                        throw new errors_1.vm_error("NATIVE_STRING_COMPARE only accepts C0Pointer input");
                    }
                    return (0, c0_value_1.js_cvt2_c0_value)(StringNative.c0_string_compare(mem, arg1, arg2));
                }
            };
        }
        case 95: {
            return {
                functionType: "NATIVE_STRING_EQUAL",
                numArgs: 0,
                f: function (mem, arg1, arg2) {
                    if (arg1.vm_type !== "ptr" || arg2.vm_type !== "ptr") {
                        throw new errors_1.vm_error("NATIVE_STRING_EQUAL only accepts C0Pointer input");
                    }
                    return (0, c0_value_1.js_cvt2_c0_value)(StringNative.c0_string_equal(mem, arg1, arg2));
                }
            };
        }
        case 96: {
            return {
                functionType: "NATIVE_STRING_FROM_CHARARRAY",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 97: {
            return {
                functionType: "NATIVE_STRING_FROMBOOL",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 98: {
            return {
                functionType: "NATIVE_STRING_FROMCHAR",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 99: {
            return {
                functionType: "NATIVE_STRING_FROMINT",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 100: {
            return {
                functionType: "NATIVE_STRING_JOIN",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 101: {
            return {
                functionType: "NATIVE_STRING_LENGTH",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 102: {
            return {
                functionType: "NATIVE_STRING_SUB",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 103: {
            return {
                functionType: "NATIVE_STRING_TERMINATED",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 104: {
            return {
                functionType: "NATIVE_STRING_TO_CHARARRAY",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        case 105: {
            return {
                functionType: "NATIVE_STRING_TOLOWER",
                numArgs: 0,
                f: nativeNotImplemented
            };
        }
        default:
            return undefined;
    }
}
function nativeNotImplemented() {
    throw new errors_1.vm_instruct_error("Native function not support yet.");
}


/***/ }),

/***/ "./src/native/native_io.ts":
/*!*********************************!*\
  !*** ./src/native/native_io.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.c0_print_char = exports.c0_print_bool = exports.c0_print_int = exports.c0_println = exports.c0_print = void 0;
var string_utility_1 = __webpack_require__(/*! ../utility/string_utility */ "./src/utility/string_utility.ts");
function internal_print(s) {
    document.getElementById(globalThis.UI_PRINTOUT_ID).innerHTML += s;
    return true;
}
function c0_print(mem, arg1) {
    return internal_print((0, string_utility_1.loadString)(arg1, mem));
}
exports.c0_print = c0_print;
function c0_println(mem, arg1) {
    c0_print(mem, arg1);
    return internal_print("<br>");
}
exports.c0_println = c0_println;
function c0_print_int(mem, arg1) {
    return internal_print("" + arg1.value.getInt32(0));
}
exports.c0_print_int = c0_print_int;
function c0_print_bool(mem, arg1) {
    return internal_print(arg1.value.getUint32(0) === 0 ? "false" : "true");
}
exports.c0_print_bool = c0_print_bool;
function c0_print_char(mem, arg1) {
    return internal_print(String.fromCharCode(arg1.value.getUint8(3)));
}
exports.c0_print_char = c0_print_char;


/***/ }),

/***/ "./src/native/native_strings.ts":
/*!**************************************!*\
  !*** ./src/native/native_strings.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.c0_string_equal = exports.c0_string_compare = void 0;
var pointer_ops_1 = __webpack_require__(/*! ../utility/pointer_ops */ "./src/utility/pointer_ops.ts");
function c0_string_compare(mem, arg1, arg2) {
    var byte_arr_1 = (0, pointer_ops_1.isNullPtr)(arg1.value) ? new DataView(new ArrayBuffer(0)) : mem.deref(arg1.value);
    var byte_arr_2 = (0, pointer_ops_1.isNullPtr)(arg1.value) ? new DataView(new ArrayBuffer(0)) : mem.deref(arg2.value);
    var dec = new TextDecoder();
    var str_1 = dec.decode(byte_arr_1);
    var str_2 = dec.decode(byte_arr_2);
    return str_1 < str_2 ? -1 : (str_1 > str_2 ? 1 : 0);
}
exports.c0_string_compare = c0_string_compare;
function c0_string_equal(mem, arg1, arg2) {
    return c0_string_compare(mem, arg1, arg2) === 0;
}
exports.c0_string_equal = c0_string_equal;


/***/ }),

/***/ "./src/parser/parse.ts":
/*!*****************************!*\
  !*** ./src/parser/parse.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
var errors_1 = __webpack_require__(/*! ../utility/errors */ "./src/utility/errors.ts");
var native_interface_1 = __webpack_require__(/*! ../native/native_interface */ "./src/native/native_interface.ts");
function parse(raw_file) {
    var blocks = raw_file.trim().split("\n\n");
    if (blocks.length < 6) {
        throw new errors_1.bc0_format_error();
    }
    var header = blocks[0].split("\n");
    if (header.length != 2 || !header[0].startsWith("C0 C0 FF EE")) {
        throw new errors_1.bc0_format_error();
    }
    var intpool = blocks[1].split("\n");
    var intpoolSize = parseInt((intpool[0].split("#")[0]).trim().replace(" ", ""), 16);
    if (intpool.length != intpoolSize + 2) {
        throw new errors_1.bc0_format_error();
    }
    var intpoolVal = new Int32Array(new Uint8Array([].concat.apply([], (intpool.slice(2)
        .map(function (row) { return row.split(" "); }))).map(function (elem) { return parseInt(elem, 16); })).buffer);
    var strpool = blocks[2].split("\n");
    var strpoolSize = parseInt((strpool[0].split("#")[0]).trim().replace(" ", ""), 16);
    var strpoolVal = new Uint8Array([].concat.apply([], strpool.slice(2)
        .map(function (row) { return row.split("#")[0].trim(); })
        .map(function (row) { return row.length <= 1 ? [] : row.split(" ").map(function (elem) { return parseInt(elem, 16); }); })));
    var functionNumber = parseInt(blocks[3].split("#")[0].replace(" ", ""), 16);
    if (blocks.length != 5 + functionNumber) {
        throw new errors_1.bc0_format_error();
    }
    var functionPool = [];
    for (var i = 4; i < 4 + functionNumber; i++) {
        var funcLines = blocks[i].split("\n");
        if (funcLines[0] == "")
            funcLines = funcLines.slice(1);
        var funcName = funcLines[0].slice(2, -1);
        var funcNumArgs = parseInt(funcLines[1].split("#")[0].trim(), 16);
        var funcNumVars = parseInt(funcLines[2].split("#")[0].trim(), 16);
        var funcSize = parseInt(funcLines[3].split("#")[0].trim().replace(" ", ""), 16);
        var varNames = Array(funcNumVars).fill("<anonymous>");
        var funcCode = [];
        for (var lineNum = 4; lineNum < funcLines.length; lineNum++) {
            var _a = funcLines[lineNum].split("#")
                .map(function (elem) { return elem.trim(); }), lineBytes = _a[0], opcodeName = _a[1], comment = _a[2];
            if (lineBytes !== "") {
                funcCode = funcCode.concat(lineBytes.split(" ")
                    .map(function (elem) { return parseInt(elem, 16); }));
            }
            if (opcodeName !== undefined) {
                if (opcodeName.startsWith("vload")) {
                    varNames[parseInt(opcodeName.split(" ")[1])] = comment;
                }
                else if (opcodeName.startsWith("vstore")) {
                    varNames[parseInt(opcodeName.split(" ")[1])] =
                        comment.split(" ")[0].trim();
                }
            }
        }
        var code_byte_counter = 0;
        var comment_mapping = new Map();
        var int_comment_regex = /\d+/;
        var bool_comment_regex = /(true)|(false)/;
        var char_comment_regex = /'.*'/;
        for (var lineNum = 4; lineNum < funcLines.length; lineNum++) {
            var _b = funcLines[lineNum].split("#")
                .map(function (elem) { return elem.trim(); }), lineBytes = _b[0], opcodeName = _b[1], comment = _b[2];
            if (lineBytes === "")
                continue;
            if (opcodeName.startsWith("bipush")) {
                var type = void 0;
                if (int_comment_regex.test(comment)) {
                    type = "int";
                }
                else if (bool_comment_regex.test(comment)) {
                    type = "boolean";
                }
                else if (char_comment_regex.test(comment)) {
                    type = "char";
                }
                else {
                    throw new errors_1.vm_error("Failed to inference value type from bipush comment:\n" + comment);
                }
                comment_mapping.set(code_byte_counter, {
                    dataType: type
                });
            }
            code_byte_counter += lineBytes.split(" ").length;
        }
        functionPool.push({
            name: funcName,
            size: funcSize,
            numArgs: funcNumArgs,
            numVars: funcNumVars,
            varName: varNames,
            code: new Uint8Array(funcCode),
            comment: comment_mapping
        });
    }
    var nativePool = blocks[blocks.length - 1].split("\n");
    var nativeCount = parseInt(nativePool[0].split("#")[0].trim().replace(" ", ""), 16);
    var nativeFuncs = nativePool.slice(2).map(function (row) { return row.split("#")[0].trim().split(" "); }).map(function (row) { return [
        parseInt(row[0] + row[1], 16),
        parseInt(row[2] + row[3], 16)
    ]; }).map(function (row) { return (0, native_interface_1.nativeFuncLoader)(row[1], row[0]); });
    if (nativeFuncs.length != nativeCount) {
        throw new errors_1.bc0_format_error();
    }
    return {
        version: parseInt(header[1].split("#")[0].trim().replace(" ", ""), 16),
        intCount: intpoolSize,
        intPool: intpoolVal,
        stringCount: strpoolSize,
        stringPool: strpoolVal,
        functionCount: functionNumber,
        functionPool: functionPool,
        nativeCount: nativeCount,
        nativePool: nativeFuncs
    };
}
exports["default"] = parse;


/***/ }),

/***/ "./src/utility/arithmetic.ts":
/*!***********************************!*\
  !*** ./src/utility/arithmetic.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.c_xor = exports.c_or = exports.c_and = exports.c_rsh = exports.c_lsh = exports.c_rem = exports.c_div = exports.c_mul = exports.c_sub = exports.c_add = exports.read_i32_with_check = void 0;
var errors_1 = __webpack_require__(/*! ./errors */ "./src/utility/errors.ts");
function read_i32_with_check(x) {
    if (x.byteLength < 4) {
        throw new errors_1.vm_error("Bad Addition: arguments passed in are less than 4 bytes long");
    }
    return x.getInt32(0);
}
exports.read_i32_with_check = read_i32_with_check;
function c_add(x, y) {
    var res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, read_i32_with_check(x) + read_i32_with_check(y));
    return res;
}
exports.c_add = c_add;
function c_sub(x, y) {
    var res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, read_i32_with_check(x) - read_i32_with_check(y));
    return res;
}
exports.c_sub = c_sub;
function c_mul(x, y, Issue_Handler) {
    var x_i32 = read_i32_with_check(x);
    var y_i32 = read_i32_with_check(y);
    var res = x_i32 * y_i32;
    if (res > Number.MAX_SAFE_INTEGER || res < Number.MIN_SAFE_INTEGER) {
        Issue_Handler.warn("Inevitable Precision Lost Detected", "When calculating ".concat(x_i32, " * ").concat(y_i32, ", inevitable precison lost is very likely to happened since its value is too big for JavaScript to handle. The result might be inaccurate."));
    }
    var res_data = new DataView(new ArrayBuffer(4));
    res_data.setInt32(0, res);
    return res_data;
}
exports.c_mul = c_mul;
function c_div(x, y) {
    var x_i32 = read_i32_with_check(x);
    var y_i32 = read_i32_with_check(y);
    if (y_i32 === 0 || (x_i32 === 2147483648 && y_i32 === -1)) {
        throw new errors_1.c0_arith_error("Divide by zero.");
    }
    var res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, x_i32 / y_i32);
    return res;
}
exports.c_div = c_div;
function c_rem(x, y) {
    var x_i32 = read_i32_with_check(x);
    var y_i32 = read_i32_with_check(y);
    if (y_i32 === 0 || (x_i32 === 2147483648 && y_i32 === -1)) {
        throw new errors_1.c0_arith_error("Divide by zero.");
    }
    var res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, x_i32 % y_i32);
    return res;
}
exports.c_rem = c_rem;
function c_lsh(x, y) {
    var x_i32 = read_i32_with_check(x);
    var y_i32 = read_i32_with_check(y);
    if (y_i32 < 0 || y_i32 > 31) {
        throw new errors_1.c0_arith_error("lshift should in range of [0, 32).");
    }
    var res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, x_i32 << y_i32);
    return res;
}
exports.c_lsh = c_lsh;
function c_rsh(x, y) {
    var x_i32 = read_i32_with_check(x);
    var y_i32 = read_i32_with_check(y);
    if (y_i32 < 0 || y_i32 > 31) {
        throw new errors_1.c0_arith_error("rshift should in range of [0, 32).");
    }
    var res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, x_i32 >> y_i32);
    return res;
}
exports.c_rsh = c_rsh;
function c_and(x, y) {
    var res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, read_i32_with_check(x) & read_i32_with_check(y));
    return res;
}
exports.c_and = c_and;
function c_or(x, y) {
    var res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, read_i32_with_check(x) | read_i32_with_check(y));
    return res;
}
exports.c_or = c_or;
function c_xor(x, y) {
    var res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, read_i32_with_check(x) ^ read_i32_with_check(y));
    return res;
}
exports.c_xor = c_xor;


/***/ }),

/***/ "./src/utility/c0_value.ts":
/*!*********************************!*\
  !*** ./src/utility/c0_value.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.is_same_value = exports.build_c0_value = exports.build_c0_ptrValue = exports.c0_cvt2_js_value = exports.js_cvt2_c0_value = void 0;
var errors_1 = __webpack_require__(/*! ./errors */ "./src/utility/errors.ts");
var pointer_ops_1 = __webpack_require__(/*! ./pointer_ops */ "./src/utility/pointer_ops.ts");
function js_cvt2_c0_value(value) {
    var view = new DataView(new ArrayBuffer(4));
    switch (typeof value) {
        case "boolean":
            view.setUint32(0, value ? 1 : 0);
            return ({
                vm_type: "value",
                type: "boolean",
                value: view
            });
        case "number":
            view.setUint32(0, value);
            return ({
                vm_type: "value",
                type: "int",
                value: view
            });
        case "string":
            var ascii_code = value.charCodeAt(0);
            ascii_code = ascii_code === NaN ? 0 : ascii_code;
            if (ascii_code < 0 || ascii_code > 127) {
                throw new errors_1.vm_error("C0 standard only accepts ascii string (in range [0, 128))");
            }
            view.setUint8(3, ascii_code);
            return ({
                vm_type: "value",
                type: "char",
                value: view
            });
    }
}
exports.js_cvt2_c0_value = js_cvt2_c0_value;
function c0_cvt2_js_value(value) {
    if (value.vm_type === "ptr") {
        var _a = (0, pointer_ops_1.read_ptr)(value.value), addr = _a[0], offset = _a[1], size = _a[2];
        return addr + offset;
    }
    else {
        switch (value.type) {
            case "int": {
                return value.value.getInt32(0);
            }
            case "char": {
                var dec = new TextDecoder();
                var str = dec.decode(value.value.buffer.slice(3));
                return str;
            }
            case "boolean": {
                return value.value.getUint32(0) !== 0;
            }
            case "<unknown>": {
                return value.value.getInt32(0);
            }
        }
    }
}
exports.c0_cvt2_js_value = c0_cvt2_js_value;
function build_c0_ptrValue(value, t) {
    return {
        value: value,
        type: t ? t : "<unknown>",
        vm_type: "ptr"
    };
}
exports.build_c0_ptrValue = build_c0_ptrValue;
function build_c0_value(value, t) {
    return {
        value: value,
        type: t ? t : "<unknown>",
        vm_type: "value"
    };
}
exports.build_c0_value = build_c0_value;
function is_same_value(x, y) {
    if (x.byteLength !== y.byteLength)
        return false;
    for (var i = 0; i < x.byteLength; i++) {
        if (x.getUint8(i) !== y.getUint8(i))
            return false;
    }
    return true;
}
exports.is_same_value = is_same_value;


/***/ }),

/***/ "./src/utility/errors.ts":
/*!*******************************!*\
  !*** ./src/utility/errors.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.bc0_format_error = exports.vm_instruct_error = exports.vm_error = exports.c0_arith_error = exports.c0_value_error = exports.c0_memory_error = exports.c0_assertion_error = exports.c0_user_error = void 0;
var c0_user_error = (function (_super) {
    __extends(c0_user_error, _super);
    function c0_user_error(msg) {
        var _this = _super.call(this, "C0 User Error: " + msg) || this;
        _this.name = "C0UserError";
        return _this;
    }
    return c0_user_error;
}(Error));
exports.c0_user_error = c0_user_error;
var c0_assertion_error = (function (_super) {
    __extends(c0_assertion_error, _super);
    function c0_assertion_error(msg) {
        var _this = _super.call(this, "C0 Assertion Error: " + msg) || this;
        _this.name = "C0AssertionError";
        return _this;
    }
    return c0_assertion_error;
}(Error));
exports.c0_assertion_error = c0_assertion_error;
var c0_memory_error = (function (_super) {
    __extends(c0_memory_error, _super);
    function c0_memory_error(msg) {
        var _this = _super.call(this, "C0 Memory Error: " + msg) || this;
        _this.name = "C0MemoryError";
        return _this;
    }
    return c0_memory_error;
}(Error));
exports.c0_memory_error = c0_memory_error;
var c0_value_error = (function (_super) {
    __extends(c0_value_error, _super);
    function c0_value_error(msg) {
        var _this = _super.call(this, "C0 Value Error: " + msg) || this;
        _this.name = "C0ValueError";
        return _this;
    }
    return c0_value_error;
}(Error));
exports.c0_value_error = c0_value_error;
var c0_arith_error = (function (_super) {
    __extends(c0_arith_error, _super);
    function c0_arith_error(msg) {
        var _this = _super.call(this, "C0 Arithmetic Error: " + msg) || this;
        _this.name = "C0ArithError";
        return _this;
    }
    return c0_arith_error;
}(Error));
exports.c0_arith_error = c0_arith_error;
var vm_error = (function (_super) {
    __extends(vm_error, _super);
    function vm_error(msg) {
        var _this = _super.call(this, "VM Error: " + msg) || this;
        _this.name = "VMError";
        return _this;
    }
    return vm_error;
}(Error));
exports.vm_error = vm_error;
var vm_instruct_error = (function (_super) {
    __extends(vm_instruct_error, _super);
    function vm_instruct_error(msg) {
        var _this = _super.call(this, "VM Instruction Error: " + msg) || this;
        _this.name = "VMInstructError";
        return _this;
    }
    return vm_instruct_error;
}(Error));
exports.vm_instruct_error = vm_instruct_error;
var bc0_format_error = (function (_super) {
    __extends(bc0_format_error, _super);
    function bc0_format_error() {
        var _this = _super.call(this, "Invalid BC0 File Input.") || this;
        _this.name = "BC0FormatError";
        return _this;
    }
    return bc0_format_error;
}(Error));
exports.bc0_format_error = bc0_format_error;


/***/ }),

/***/ "./src/utility/memory.ts":
/*!*******************************!*\
  !*** ./src/utility/memory.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.createHeap = exports.VM_Memory = void 0;
var errors_1 = __webpack_require__(/*! ./errors */ "./src/utility/errors.ts");
var pointer_ops_1 = __webpack_require__(/*! ./pointer_ops */ "./src/utility/pointer_ops.ts");
var VM_Memory = (function () {
    function VM_Memory(size) {
        if (size >= globalThis.MEM_POOL_MAX_SIZE) {
            throw new errors_1.vm_error("Unable to initialize memory greater than ".concat(globalThis.MEM_POOL_MAX_SIZE, " bytes"));
        }
        if (size <= globalThis.MEM_POOL_MIN_SIZE) {
            throw new errors_1.vm_error("Unable to initialize memory smaller than ".concat(globalThis.MEM_POOL_MIN_SIZE, " byte"));
        }
        this.memory_size = (size === undefined ? globalThis.MEM_POOL_DEFAULT_SIZE + 1 : size);
        this.memory_pool = new ArrayBuffer(this.memory_size);
        this.heap_top_address = 0x01;
    }
    VM_Memory.prototype.malloc = function (size) {
        if (size < 0 || this.heap_top_address + size > this.memory_size) {
            throw new errors_1.c0_memory_error("Unable to allocate ".concat(size, " bytes of memory."));
        }
        if (size > globalThis.MEM_BLOCK_MAX_SIZE) {
            throw new errors_1.c0_memory_error("Unable to allocate memory block bigger than ".concat(globalThis.MEM_BLOCK_MAX_SIZE));
        }
        var ptr = new DataView(new ArrayBuffer(8));
        ptr.setUint32(0, this.heap_top_address);
        ptr.setUint16(4, 0);
        ptr.setUint16(6, size);
        this.heap_top_address += size;
        return ptr;
    };
    VM_Memory.prototype.free = function (ptr) {
        var addr = ptr.getUint32(0);
        var offset = ptr.getUint16(4);
        var size = ptr.getInt16(6);
        if (offset !== 0) {
            throw new errors_1.vm_error("Freeing a memory that is not pointing at the start of memory block");
        }
        new Uint8Array(this.memory_pool, addr).fill(0, 0, size);
    };
    VM_Memory.prototype.clear = function () {
        this.memory_pool = new ArrayBuffer(this.memory_size);
    };
    VM_Memory.prototype.debug_getMemPool = function () {
        return this.memory_pool;
    };
    VM_Memory.prototype.cmstore = function (ptr, value) {
        var _a = (0, pointer_ops_1.read_ptr)(ptr), address = _a[0], offset = _a[1], size = _a[2];
        if ((0, pointer_ops_1.isNullPtr)(ptr)) {
            throw new errors_1.c0_memory_error("Dereferencing NULL Pointer");
        }
        if (value.byteLength < 1) {
            throw new errors_1.vm_error("Not enough value to store!");
        }
        if (size - offset < 1) {
            throw new errors_1.c0_memory_error("Tried to write 1 byte @".concat(address + offset, ", but segment is only allocated as [").concat(address, ", ").concat(address + size, ")"));
        }
        new DataView(this.memory_pool).setUint8(address + offset, value.getUint8(3));
    };
    VM_Memory.prototype.cmload = function (ptr) {
        var _a = (0, pointer_ops_1.read_ptr)(ptr), address = _a[0], offset = _a[1], size = _a[2];
        if ((0, pointer_ops_1.isNullPtr)(ptr)) {
            throw new errors_1.c0_memory_error("Dereferencing NULL Pointer");
        }
        if (size - offset < 1) {
            throw new errors_1.c0_memory_error("Tried to read 1 byte @".concat(address + offset, ", but the segment is only allocated as [").concat(address, ", ").concat(address + size, ")"));
        }
        var result = new Uint8Array([0, 0, 0, new DataView(this.memory_pool).getUint8(address + offset)]);
        return new DataView(result.buffer);
    };
    VM_Memory.prototype.imstore = function (ptr, value) {
        var _a = (0, pointer_ops_1.read_ptr)(ptr), address = _a[0], offset = _a[1], size = _a[2];
        if ((0, pointer_ops_1.isNullPtr)(ptr)) {
            throw new errors_1.c0_memory_error("Dereferencing NULL Pointer");
        }
        if (value.byteLength < 4) {
            throw new errors_1.vm_error("Not enough value to store!");
        }
        if (size - offset < 4) {
            throw new errors_1.c0_memory_error("Tried to write 4 bytes @".concat(address + offset, ", but segment is only allocated as [").concat(address, ", ").concat(address + size, ")"));
        }
        new DataView(this.memory_pool).setUint32(address + offset, value.getUint32(0));
    };
    VM_Memory.prototype.imload = function (ptr) {
        var _a = (0, pointer_ops_1.read_ptr)(ptr), address = _a[0], offset = _a[1], size = _a[2];
        if ((0, pointer_ops_1.isNullPtr)(ptr)) {
            throw new errors_1.c0_memory_error("Dereferencing NULL Pointer");
        }
        if (size - offset < 4) {
            throw new errors_1.c0_memory_error("Tried to read 4 bytes @".concat(address + offset, ", but the segment is only allocated as [").concat(address, ", ").concat(address + size, ")"));
        }
        var result = new DataView(new Uint8Array(4).buffer);
        result.setUint32(0, new DataView(this.memory_pool).getUint32(address + offset));
        return result;
    };
    VM_Memory.prototype.amstore = function (ptr, stored_ptr) {
        var _a = (0, pointer_ops_1.read_ptr)(ptr), address = _a[0], offset = _a[1], size = _a[2];
        if ((0, pointer_ops_1.isNullPtr)(ptr)) {
            throw new errors_1.c0_memory_error("Dereferencing NULL Pointer");
        }
        if (stored_ptr.byteLength < 8) {
            throw new errors_1.vm_error("Not enough value to store!");
        }
        if (size - offset < 8) {
            throw new errors_1.c0_memory_error("Tried to write 8 bytes @".concat(address + offset, ", but segment is only allocated as [").concat(address, ", ").concat(address + size, ")"));
        }
        new DataView(this.memory_pool).setBigUint64(address + offset, stored_ptr.getBigUint64(0));
    };
    VM_Memory.prototype.amload = function (ptr) {
        var _a = (0, pointer_ops_1.read_ptr)(ptr), address = _a[0], offset = _a[1], size = _a[2];
        if ((0, pointer_ops_1.isNullPtr)(ptr)) {
            throw new errors_1.c0_memory_error("Dereferencing NULL Pointer");
        }
        if (size - offset < 8) {
            throw new errors_1.c0_memory_error("Tried to load 8 bytes @".concat(address + offset, ", but segment is only allocated as [").concat(address, ", ").concat(address + size, ")"));
        }
        var result = new DataView(new Uint8Array(8).buffer);
        result.setBigUint64(0, new DataView(this.memory_pool).getBigUint64(address + offset));
        return result;
    };
    VM_Memory.prototype.deref = function (ptr, block_size) {
        var _a = (0, pointer_ops_1.read_ptr)(ptr), address = _a[0], offset = _a[1], size = _a[2];
        if ((0, pointer_ops_1.isNullPtr)(ptr)) {
            throw new errors_1.c0_memory_error("Dereferencing NULL Pointer");
        }
        if (block_size === undefined) {
            block_size = size - offset;
        }
        if (offset + block_size > size) {
            throw new errors_1.c0_memory_error("Memory access out of bound");
        }
        return new DataView(this.memory_pool, address + offset, block_size);
    };
    return VM_Memory;
}());
exports.VM_Memory = VM_Memory;
function createHeap(allocator, size) {
    return new allocator(size);
}
exports.createHeap = createHeap;


/***/ }),

/***/ "./src/utility/pointer_ops.ts":
/*!************************************!*\
  !*** ./src/utility/pointer_ops.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.build_ptr = exports.isNullPtr = exports.shift_ptr = exports.read_ptr = void 0;
var errors_1 = __webpack_require__(/*! ./errors */ "./src/utility/errors.ts");
function read_ptr(ptr) {
    if (ptr.byteLength < 8) {
        throw new errors_1.vm_error("Invalid Pointer ".concat(ptr, " is dereferenced."));
    }
    var address = ptr.getUint32(0);
    var offset = ptr.getUint16(4);
    var block_size = ptr.getUint16(6);
    if (offset > block_size) {
        throw new errors_1.c0_memory_error("Pointer points to ".concat(address + offset, ", but the memory segment is only allocated at [").concat(address, ", ").concat(address + block_size, ")."));
    }
    return [address, offset, block_size];
}
exports.read_ptr = read_ptr;
function shift_ptr(ptr, offset) {
    var _a = read_ptr(ptr), address = _a[0], original_offset = _a[1], size = _a[2];
    var new_offset = original_offset + offset;
    if (offset < 0 || new_offset > size || new_offset < 0) {
        throw new errors_1.c0_memory_error("Tried to perform ".concat(offset, " shift on pointer @").concat(address, "+").concat(original_offset, ". However, the allocated segment is only [").concat(address, ", ").concat(address + size, ")"));
    }
    var new_ptr = new DataView(new ArrayBuffer(8));
    new_ptr.setUint32(0, address);
    new_ptr.setUint16(4, new_offset);
    new_ptr.setUint16(6, size);
    return new_ptr;
}
exports.shift_ptr = shift_ptr;
function isNullPtr(ptr) {
    return ptr.getBigUint64(0) === BigInt(0);
}
exports.isNullPtr = isNullPtr;
function build_ptr(addr, offset, size) {
    var p_buf = new Uint8Array(8).buffer;
    var p = new DataView(p_buf);
    p.setUint32(0, addr);
    p.setUint16(4, offset);
    p.setUint16(4, size);
    return p;
}
exports.build_ptr = build_ptr;


/***/ }),

/***/ "./src/utility/string_utility.ts":
/*!***************************************!*\
  !*** ./src/utility/string_utility.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.loadString = exports.loadStringPool = void 0;
var errors_1 = __webpack_require__(/*! ./errors */ "./src/utility/errors.ts");
function loadStringPool(stringPool, allocator) {
    var ptr = allocator.malloc(stringPool.length);
    var mem_block = allocator.deref(ptr);
    for (var i = 0; i < stringPool.byteLength; i++) {
        mem_block.setUint8(i, stringPool[i]);
    }
    return ptr;
}
exports.loadStringPool = loadStringPool;
function loadString(ptr, allocator) {
    if (ptr.type !== "<unknown>" && ptr.type !== "string") {
        throw new errors_1.vm_error("Type error. Unable to extract string from type" + ptr.type);
    }
    var mem_block = allocator.deref(ptr.value);
    var i = 0;
    while (i < mem_block.byteLength && mem_block.getUint8(i) !== 0) {
        i++;
    }
    var dec = new TextDecoder();
    return dec.decode(mem_block.buffer.slice(mem_block.byteOffset, mem_block.byteOffset + i + 1));
}
exports.loadString = loadString;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

exports.__esModule = true;
var state_1 = __webpack_require__(/*! ./exec/state */ "./src/exec/state.ts");
var material_emitter_1 = __webpack_require__(/*! ./gui/material_emitter */ "./src/gui/material_emitter.ts");
function init_env() {
    globalThis.DEBUG = true;
    globalThis.DEBUG_DUMP_MEM = true;
    globalThis.MEM_POOL_SIZE = 64;
    globalThis.MEM_POOL_DEFAULT_SIZE = 1024 * 50;
    globalThis.MEM_POOL_MAX_SIZE = 4294967294;
    globalThis.MEM_POOL_MIN_SIZE = 1;
    globalThis.MEM_BLOCK_MAX_SIZE = 0xFFFF;
    globalThis.UI_INPUT_ID = "c0-code-input";
    globalThis.UI_PRINTOUT_ID = "c0-output";
    globalThis.UI_MSG_ID = "message-terminal";
    globalThis.C0_RUNTIME = undefined;
    globalThis.MSG_EMITTER = new material_emitter_1["default"]();
    console.log("[C0VM.ts] Environment initialized.");
    if (globalThis.DEBUG) {
        console.log("\nC0VM.ts Configuration Report:\n    Supported Language Level: C0-language-level\n    Supported Native Group: standard I/O, string operation\n\n    Debug Configuration:\n        Debug Mode: ".concat(globalThis.DEBUG, "\n        Dump heap memory: ").concat(globalThis.DEBUG_DUMP_MEM, "\n\n    Heap Memory Configuration:\n        Heap memory current size: ").concat(globalThis.MEM_POOL_SIZE, "\n        Heap memory default size: ").concat(globalThis.MEM_POOL_DEFAULT_SIZE, "\n        Heap memory max size: ").concat(globalThis.MEM_POOL_MAX_SIZE, "\n        Heap memory min size: ").concat(globalThis.MEM_POOL_MIN_SIZE, "\n        Heap memory block max size: ").concat(globalThis.MEM_BLOCK_MAX_SIZE, "\n"));
    }
}
function initialize_runtime() {
    console.log(document.getElementById(globalThis.UI_INPUT_ID));
    globalThis.C0_RUNTIME = new state_1["default"](document.getElementById(globalThis.UI_INPUT_ID).value, globalThis.MEM_POOL_SIZE);
    if (globalThis.DEBUG_DUMP_MEM) {
        console.log("[DEBUG] Memory dump:");
        console.log(globalThis.C0_RUNTIME.debug());
    }
    globalThis.MSG_EMITTER.ok("Program is loaded into C0VM", "Press STEP or RUN to execute the program.");
}
function step_runtime() {
    if (globalThis.C0_RUNTIME === undefined) {
        globalThis.MSG_EMITTER.err("C0VM has not load any bytecode yet!", "After input bytecode, press Load to load the bytecode before executing.");
        return;
    }
    if (!globalThis.C0_RUNTIME.step_forward()) {
        globalThis.MSG_EMITTER.ok("Program Execution Finished!", "Load the program again if you want to rerun the program.");
        globalThis.C0_RUNTIME = undefined;
    }
}
function run_runtime() {
    if (globalThis.C0_RUNTIME === undefined) {
        globalThis.MSG_EMITTER.err("C0VM has not load any bytecode yet!", "After input bytecode, press Load to load the bytecode before executing.");
        return;
    }
    var res = true;
    while (res) {
        res = globalThis.C0_RUNTIME.step_forward();
    }
    globalThis.MSG_EMITTER.ok("Program Execution Finished!", "Load the program again if you want to rerun the program.");
    globalThis.C0_RUNTIME = undefined;
}
function reset_runtime() {
    if (globalThis.C0_RUNTIME === undefined) {
        return;
    }
    globalThis.C0_RUNTIME.restart();
    document.getElementById(globalThis.UI_PRINTOUT_ID).textContent = "";
    globalThis.MSG_EMITTER.ok("C0VM Restart Successfully", "Your program will be executed again from the beginning.");
}
exports["default"] = {
    init_env: init_env,
    initialize_runtime: initialize_runtime,
    step_runtime: step_runtime,
    run_runtime: run_runtime,
    reset_runtime: reset_runtime
};

})();

window.c0vm_ts = __webpack_exports__["default"];
/******/ })()
;