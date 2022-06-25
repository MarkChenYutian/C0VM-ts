/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @Description TypeScript implementation of native I/O functions in C0VM.
 */
import { allocate_js_string, loadString } from "../utility/string_utility";

/**
 * Print string to terminal/HTML GUI according to the C0_ENVIR_MODE setting
 * @param s The string to be printed
 * @returns Whether the print is success or not
 */
function internal_print(s: string): boolean {
    if (globalThis.C0_ENVIR_MODE === "nodejs") {
        return process.stdout.write(s);
    } else {
        document.getElementById(globalThis.UI_PRINTOUT_ID).innerHTML += s;
        return true;
    }
}

/**
 * Print a C0 string
 * @param mem Allocator whose heap memory stores the string arg1 points to
 * @param arg1 The pointer to the actual string in heap
 * @returns Whether the print is successful
 */
export function c0_print(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.string>>
): boolean {
    return internal_print(loadString(arg1, mem));
}

/**
 * Print a C0 String with a change line ("\n" or "<br>") appended
 * @param mem Allocator whose heap memory stores the string arg1 points to
 * @param arg1 The pointer to the actual string in heap
 * @returns Whether the print is successful
 */
export function c0_println(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.string>>
): boolean {
    c0_print(mem, arg1);
    return internal_print(
        globalThis.C0_ENVIR_MODE === "nodejs" ? "\n" : "<br>"
    );
}

/**
 * Print a C0 integer value
 * @param mem This argument is a place holder to satisfy the type declaration (mem, args...)
 * @param arg1 The C0Value stores the int to be printed
 * @returns Whether the print is successful
 */
export function c0_print_int(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.value>>
): boolean {
    return internal_print("" + arg1.value.getInt32(0));
}

/**
 * Print a C0 bool value
 * @param mem This argument is a place holder to satisfy the type declaration (mem, args...)
 * @param arg1 The C0Value stores the bool to be printed
 * @returns Whether the print is successful
 */
export function c0_print_bool(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.value>>
): boolean {
    return internal_print(arg1.value.getUint32(0) === 0 ? "false" : "true");
}


/**
 * Print a C0 char value
 * @param mem This argument is a place holder to satisfy the type declaration (mem, args...)
 * @param arg1 The C0Value stores the char to be printed
 * @returns Whether the print is successful
 */
export function c0_print_char(
    mem: C0HeapAllocator,
    arg1: C0Value<Maybe<C0TypeClass.value>>
): boolean {
    return internal_print(String.fromCharCode(arg1.value.getUint8(3)));
}

/**
 * Obtain user input synchronously
 * 
 * TODO: In the future, a more elegant way is to convert this into some 
 * kind of `async` function call. 
 * @param mem The heap memory to store the user input string
 * @returns A pointer points to the string user input
 */
export function c0_readline(mem: C0HeapAllocator): C0Pointer {
    return allocate_js_string(mem, prompt("C0VM.ts Input:"));
}
