/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract Arithmetic operations like `+`, `-`, `<<`, etc.
 * @description In Javascript, all numbers are wrapped in a type called `numbers`. 
 * Therefore, it is hard to have C-like arithmetic behavior (e.g. overflow). In this
 * file, we define several functions to mimic such behavior.
 */

import { c0_arith_error, vm_error } from "./errors";

function read_i32_with_check(x: DataView): number {
    if (x.byteLength < 4) {
        throw new vm_error("Bad Addition: arguments passed in are less than 4 bytes long");
    }
    return x.getInt32(0);
}

/**
 * Computes `x + y` with C's behavior when -fwrap flag is on
 * @param x The first 4 bytes of `x` will be interpreted as an i32
 * @param y The first 4 bytes of `y` will be interpreted as an i32
 * @returns `A dataview with length 4 that stores x + y`, following C's overflow behavior with `-fwrap` flag on gcc.
 * @throws `vm_error` when `x` or `y` have a length < 4
 */
export function c_add(x: DataView, y: DataView): DataView {
    const res = new DataView(new ArrayBuffer(4));
    res.setInt32(
        0, read_i32_with_check(x) + read_i32_with_check(y)
    );
    return res;
}


/**
 * Computes `x - y` with C's behavior when -fwrap flag is on
 * @param x The first 4 bytes of `x` will be interpreted as an i32
 * @param y The first 4 bytes of `y` will be interpreted as an i32
 * @returns A dataview with length 4 that stores `x - y`, following C's overflow behavior with `-fwrap` flag on gcc.
 * @throws `vm_error` when `x` or `y` have a length < 4
 */
export function c_sub(x: DataView, y: DataView): DataView {
    const res = new DataView(new ArrayBuffer(4));
    res.setInt32(
        0, read_i32_with_check(x) - read_i32_with_check(y)
    );
    return res;
}

/**
 * Computes `x * y` with C's behavior when -fwrap flag is on
 * @param x The first 4 bytes of `x` will be interpreted as an i32
 * @param y The first 4 bytes of `y` will be interpreted as an i32
 * @returns A dataview with length 4 that stores `x * y`, following C's overflow behavior with `-fwrap` flag on gcc.
 * @throws `vm_error` when `x` or `y` have a length < 4
 * @emits `precision_warning` when the value of x * y is too big for JavaScript to handle and precision lost is inevitable. 
 * 
 * **Note** - this will NOT abort the execution. Instead, it will emit a warning through the Issue_Handler passed in.
 */
export function c_mul(x: DataView, y: DataView, Issue_Handler: MessageEmitter): DataView {
    const x_i32 = read_i32_with_check(x);
    const y_i32 = read_i32_with_check(y);
    const res = x_i32 * y_i32;
    if (res > Number.MAX_SAFE_INTEGER || res < Number.MIN_SAFE_INTEGER) {
        Issue_Handler.warn(
            "Inevitable Precision Lost Detected",
            `When calculating ${x} * ${y}, inevitable precison lost is very likely to happened since its value is too big for JavaScript to handle. The result might be inaccurate.`
        );
        // adding a fall-back here?
        // TODO: helper function here
    }
    const res_data = new DataView(new ArrayBuffer(4));
    res_data.setInt32(0, res);
    return res_data;
}


/**
 * Computes `x / y` with C's behavior when -fwrap flag is on
 * @param x The first 4 bytes of `x` will be interpreted as an i32
 * @param y The first 4 bytes of `y` will be interpreted as an i32
 * @returns A dataview with length 4 that stores `x / y`, following C's overflow behavior with `-fwrap` flag on gcc.
 * @throws `vm_error` when `x` or `y` have a length < 4
 * @throws `c0_arith_error` when `y == 0` or `x = INT_MIN && y = 0`.
 */
export function c_div(x: DataView, y: DataView): DataView {
    const x_i32 = read_i32_with_check(x);
    const y_i32 = read_i32_with_check(y);
    if (y_i32 === 0 || (x_i32 === 0x8000_0000 && y_i32 === -1)) {
        throw new c0_arith_error("Divide by zero.");
    }
    const res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, x_i32 / y_i32);
    return res;
}

/**
 * Computes `x % y` with C's behavior when -fwrap flag is on
 * @param x The first 4 bytes of `x` will be interpreted as an i32
 * @param y The first 4 bytes of `y` will be interpreted as an i32
 * @returns A dataview with length 4 that stores `x % y`, following C's overflow behavior with `-fwrap` flag on gcc.
 * @throws `vm_error` when `x` or `y` have a length < 4
 * @throws `c0_arith_error` when `y == 0` or `x = INT_MIN && y = 0`.
 */
 export function c_rem(x: DataView, y: DataView): DataView {
    const x_i32 = read_i32_with_check(x);
    const y_i32 = read_i32_with_check(y);
    if (y_i32 === 0 || (x_i32 === 0x8000_0000 && y_i32 === -1)) {
        throw new c0_arith_error("Divide by zero.");
    }
    const res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, x_i32 % y_i32);
    return res;
}

/**
 * Computes `x << y` with C's behavior when -fwrap flag is on
 * @param x The first 4 bytes of `x` will be interpreted as an i32
 * @param y The first 4 bytes of `y` will be interpreted as an i32
 * @returns A dataview with length 4 that stores `x << y`, following C's overflow behavior with `-fwrap` flag on gcc.
 * @throws `vm_error` when `x` or `y` have a length < 4
 * @throws `c0_arith_error` when `y < 0` or `31 < y`.
 */
export function c_lsh(x: DataView, y: DataView): DataView {
    const x_i32 = read_i32_with_check(x);
    const y_i32 = read_i32_with_check(y);
    if (y_i32 < 0 || y_i32 > 31) {
        throw new c0_arith_error("lshift should in range of [0, 32).");
    }
    const res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, x_i32 << y_i32);
    return res;
}


/**
 * Computes `x >> y` with C's behavior when -fwrap flag is on
 * @param x The first 4 bytes of `x` will be interpreted as an i32
 * @param y The first 4 bytes of `y` will be interpreted as an i32
 * @returns A dataview with length 4 that stores `x >> y`, following C's overflow behavior with `-fwrap` flag on gcc.
 * @throws `vm_error` when `x` or `y` have a length < 4
 * @throws `c0_arith_error` when `y < 0` or `31 < y`.
 */
export function c_rsh(x: DataView, y: DataView): DataView {
    const x_i32 = read_i32_with_check(x);
    const y_i32 = read_i32_with_check(y);
    if (y_i32 < 0 || y_i32 > 31) {
        throw new c0_arith_error("rshift should in range of [0, 32).");
    }
    const res = new DataView(new ArrayBuffer(4));
    res.setInt32(0, x_i32 >> y_i32);
    return res;
}

/**
 * Computes `x & y`
 * @param x The first 4 bytes of `x` will be interpreted as an i32
 * @param y The first 4 bytes of `y` will be interpreted as an i32
 * @returns A dataview with length 4 that stores `x & y`
 */
export function c_and(x: DataView, y: DataView): DataView {
    const res = new DataView(new ArrayBuffer(4));
    res.setInt32(
        0, read_i32_with_check(x) & read_i32_with_check(y)
    );
    return res;
}

/**
 * Computes `x | y`
 * @param x The first 4 bytes of `x` will be interpreted as an i32
 * @param y The first 4 bytes of `y` will be interpreted as an i32
 * @returns A dataview with length 4 that stores `x | y`
 */
export function c_or(x: DataView, y: DataView): DataView {
    const res = new DataView(new ArrayBuffer(4));
    res.setInt32(
        0, read_i32_with_check(x) | read_i32_with_check(y)
    );
    return res;
}


/**
 * Computes `x ^ y`
 * @param x The first 4 bytes of `x` will be interpreted as an i32
 * @param y The first 4 bytes of `y` will be interpreted as an i32
 * @returns A dataview with length 4 that stores `x ^ y`
 */
export function c_xor(x: DataView, y: DataView): DataView {
    const res = new DataView(new ArrayBuffer(4));
    res.setInt32(
        0, read_i32_with_check(x) ^ read_i32_with_check(y)
    );
    return res;
}
