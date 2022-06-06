# C0VM.ts Documentation

## Demo

Visit [C0VM.ts Alpha Version (markchenyutian.github.io)](https://markchenyutian.github.io/C0VM-ts/public/) here for the demo of this project!

## Compile & Execute Project

There are two entry points / compile target for this project. One entry point, `console_main.ts` will compile the project to a node.js application for local execution. The other entry point `web_main.ts` will compile the project to a webpack library that loaded on the `globalThis` (which is `window` in browser) and allows program to be loaded & executed in modern browsers.

To compile the project, use command

```bash
$ npx webpack
```

This command will also `watch` the directory and automatically rebuild the project when changes are detected.

### Node.js Compile Target

The `node.js` compile target uses `console_main.ts` as entry point and will save the output to `./public/console_bundle.js`.

To execute the `hello.bc0` file in `./src/test/` folder, use 

```
$ node ./public/console_bundle.js hello.bc0
```

### Browser Compile Target

The `browser` compile target uses `web_main.ts` as entry point and will save the output to `./public/bundle.js`.

To open the project, visit [C0VM.ts Alpha Version (markchenyutian.github.io)](https://markchenyutian.github.io/C0VM-ts/public/) or open a server on your computer and access the `public/index.html`.

## Configurations

Configurations are generally set up using global variables declared under `options.d.ts`. To change the configuration, change the assignment of global variables in `web_main.ts` or `console_main.ts`.

| Option                   | Explanation                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `DEBUG`                  | `boolean` value, `true` to turn on debug features            |
| `DEBUG_DUMP_MEM`         | `boolean` value, `true` to dump the heap memory to console on the beginning of every execution. |
| `DEBUG_DUMP_STEP`        | `boolean` value, `true` to log the `currFrame` and `PC` of each step |
| `MEM_BLOCK_MAX_SIZE`     | `number`, the maximum size of heap memory                    |
| `MEM_POOL_SIZE`          | `number`, the current size of heap memory                    |
| `MEM_POOL_MIN_SIZE`      | `number`, the minimum allowed size of heap memory            |
| `MEM_POOL_MAX_SIZE`      | `number`, the maximum allowed size of heap memory            |
| `MEM_POOL_DEFAULT_SIZE`  | `number`, the default (fallback value for) the size of heap memory |
| `UI_INPUT_ID`            | `string`, used by `browser` compile target only, the ID of HTMLElement that provides bytecode input. |
| `UI_PRINTOUT_ID`         | `string`, used by `browser` compile target only, the ID of HTMLElement that act as standard output. |
| `UI_MSG_ID`              | `string`, used by `browser` compile target only, the ID of HTMLElement that shows all the output messages (ok, warn and error). |
| `C0_BYTECODE_MAX_LENGTH` | `number`, used by `browser` compile target only, the maximum allowed size of byte code input when using drag&drop upload method. |
| `C0_ENVIR_MODE`          | `"nodejs" | "web"`, used by some native functions to deploy different implementations based on different compile target. |
| `MSG_EMITTER`            | `MessageEmitter`, determine the way that C0VM.ts emit message to user. |

## VM Structure

The C0VM's "state" is defined as follow in `types.d.ts`

```typescript
type VM_State = {
    P: C0ByteCode,
    C: VM_Constants, // Constants the VM will use
    CallStack: VM_StackFrame[],
    CurrFrame: VM_StackFrame,
};
```

| Field       | Explanation/Representation                                   |
| ----------- | ------------------------------------------------------------ |
| `P`         | The program that C0VM is currently exeucting                 |
| `C`         | The constants that the VM will use. Currently, there's only `string_pool_ptr` that marks the position of string pool in heap memory. |
| `CallStack` | The stack of function stack frames of C0VM                   |
| `CurrFrame` | The function frame that is currently executed by the C0VM    |

Where each `VM_StackFrame` is defined as

```typescript
type VM_StackFrame = {
    PC: number,
    S: C0Value[],
    V: (C0Value | undefined)[],
    P: C0Function
};
```

| Field | Explanation/Representation                                   |
| ----- | ------------------------------------------------------------ |
| `PC`  | Program Counter                                              |
| `S`   | Operand Stack                                                |
| `V`   | Array that stores the Local Variables. When a local variable is not initialized, its value will be `undefined`. |
| `P`   | The function that is currently executing                     |

When returned, the function will push its return value back to the operand stack of previous stack frame.

## Heap Allocator

> See `./utility/memory.ts`

```typescript
interface C0HeapAllocator {
		// Basic Operations
    malloc(size: number): C0Pointer
    free(ptr: C0Pointer): void
  	// Clear the whole heap memory, called when C0VM restarts
    clear(): void

  	// Return the memory pool as ArrayBuffer - used for debug only
  	// Should not change the memory by altering the ArrayBuffer here
    debug_getMemPool(): ArrayBuffer | undefined
    // Operations on Heap Memory
    cmstore(ptr: C0Pointer, value: DataView): void
    cmload(ptr: C0Pointer): DataView

    imstore(ptr: C0Pointer, value: DataView): void
    imload(ptr: C0Pointer): DataView

    amstore(ptr: C0Pointer, stored_ptr: C0Pointer): void
    amload(ptr: C0Pointer): DataView

    deref(ptr: C0Pointer, block_size: number): DataView
}

// Factory Function for HeapAllocator
export function createHeap(allocator: C0HeapAllocatorConstructor, size ?: number): C0HeapAllocator
```

In C0VM.ts, we use a `ArrayBuffer` to simulate the heap memory of a C program.

Since we are following the C's convention (`0x0000000000000000` is a `NULL`pointer), the memory address at `0x00` is reserved and never touched. 

### `malloc` & `free` Functions

A `C0HeapAllocator` is able to manage its own memory pool and encapsulate the details with `malloc` and `free` interface.

`malloc` will allocate a block of memory and return a `C0Pointer` that referes to the starting position of the allocated memory segment.

`free` will free/release a block of memory. When the pointer given to `free` does not points to the start of memory segment, `c0_memory_error` should be throw to caller. (since free a memory with result of pointer arithmetic will lead to undefined behavior in C)

### `deref` Function

The `deref` function is a simulation of the `*` operator in C.

Given a `C0Pointer`, the `deref` function will return a `DataView` that is an alias of the `ArrayBuffer` of the memory block that pointer is pointing to.

> Example: For some pointer `0x0000_0000_0070_00FF`, passing it to `deref` will return you a `DataView` of the segment `[0x0000_0070, 0x0000_00FF)`.
>
> ```
> 0x0000_0000                            0x0000_00FF
> |=====================^================|
> ^- addr = 0x0000_0000 ^- offset = 0x0070
> ```

### VM_Memory

```typescript
export class VM_Memory implements C0HeapAllocator {
    private memory_pool: ArrayBuffer;
    private heap_top_address: number;
    private memory_size: number;

    constructor(size?: number);

    malloc(size: number): C0Pointer;
    free(ptr: C0Pointer): void;
    clear(): void;

    debug_getMemPool(): ArrayBuffer;

    cmstore(ptr: C0Pointer, value: DataView): void;
    cmload(ptr: C0Pointer): DataView;
    imstore(ptr: C0Pointer, value: DataView): void;
    imload(ptr: C0Pointer): DataView;
    amstore(ptr: C0Pointer, stored_ptr: DataView): void;
    amload(ptr: C0Pointer): DataView;

    deref(ptr: DataView, block_size: number): DataView
}
```

Written in `./utility/memory.ts`, the `VM_Memory` class is a naïve implementation to the `C0HeapAllocator` interface.

The private property `heap_top_address` will keep track of the boundary between allocated and unallocated parts of the memory pool. Whenever a `malloc` is called to allocate `n` bytes of heap memory, the allocator will give the memory segment `[heap_top, heap_top + n)`  to the caller and make `heap_top += n`.

Since `0x00` is reserved for `NULL`, allocator will start to allocate memory from `0x01`.

>  :construction: `free` is not implemented in this naive implementation! Currently, calling the `free` will only write zero to the memory block the pointer is pointing at. Memory will NOT be re-claimed or re-allocated anyway.
>
> In the future, we may implement a fancy allocator which will re-claim the freed memory.

## Data Types

In `C0VM.ts`, **everything** is eventually a segment of `ArrayBuffer`. We use `DataView` to wrap up the `ArrayBuffer` with two benefits:

* `DataView` provides an interface that allow us to manipulate the `ArrayBuffer` without difficulty
* `DataView` allow us to create alias to a specific segment of `ArrayBuffer`.

### C0Pointer `*t`

`C0Pointer` is a `DataView` with byte-length of `8` (64-bit). However, different from what C actually do to pointer, we only use the first `6` bytes to store the memory address. The remaining `2` bytes are used to annotate the size of allocated memory segment. This allow C0VM.ts to check memory-access out of bound and throw error when dereferencing (or even creating!) such pointer.

| Start Index (include) | End Index (exclude) | Representation                                               |
| --------------------- | ------------------- | ------------------------------------------------------------ |
| `0`                   | `4`                 | `Uint32` - (address) Address of Memory block this pointer is pointing to |
| `4`                   | `6`                 | `Uint16` - (offset) Offset of the pointer on the pointed memory block |
| `6`                   | `8`                 | `Uint16` - (size) The size of memory block                   |

> :spiral_notepad: *Explanation:* A pointer points at allocated memory segment `[address, address + size)` with precise address as `address + offset`.

#### NULL Pointer

:warning: By C convention, if a pointer is `0x0000000000000000` (64-bit zero), we say this pointer is a `NULL` Poiner.

Since the definition of NULL pointer is subject to chnage in the future, it is **highly recommended** to use the function 

```typescript
export function isNullPtr(ptr: C0Pointer): boolean;
```

to verify whether a pointer is `NULL` or not.

#### Read Pointer

A helper function 

```typescript
export function read_ptr(ptr: C0Pointer): [number, number, number];
```

is defined in `utility/pointer_ops.ts`. Giving the function a `C0Pointer` (which is, in fact, only an alias of `DataView`), it will return the `address`, `offset` of pointer and `size` of memory segment.

#### Function Pointer (Implement in future, C1 Standard)

> Currently, I planned to use functions with 
>
> | Field   | Value                |
> | ------- | -------------------- |
> | Address | `0x0000_0000`        |
> | Offset  | `0x0000` to `0xFFFF` |
> | Size    | `0x0000`             |
>
> to represent a function pointer. This will present one more constraint on the C1 Functions - there can have at most `65535` functions in a C1 program.

### Int, Boolean and Char `t`

`int`, `boolean` and `char` are all a sequence of `4` bytes. That is to say, they are all stored in a segment of `ArrayBuffer`.

In C0VM Writeup, these 4-bytes values are all annotated as `w32`.

For types of `boolean` and `char`, their value will be stored in the **first byte** of the 4-byte `ArrayBuffer`.

### Array `t[]`

For any type `t` with size $s$, we can create an array of it. The array is described by structure like this

| Starting Index (Include) | Ending Byte Index (Exclude) | Meaning                           |
| ------------------------ | -------------------------- | --------------------------------- |
| `0`                      | `4`                        | Size of each element of the array |
| `4`                      | `4 + n * s`                | An `n`-element array              |

## C0Value

`C0Value` is a wrapper for the actual values in C0VM with fancy type declaration that allow us to put more constrint on value of its fields.

```typescript
declare const enum C0ValueVMType {
    "value" = 0,
    "ptr" = 1
}
type C0ValueType = "<unknown>" | "int" | "char" | "boolean";
type C0PointerType = "<unknown>" | "<unknown>[]" | "string"| "struct" | "int[]" | "string[]" | "char[]" | "boolean[]" | "struct[]";

type C0Value<T extends C0ValueVMType> = 
    T extends C0ValueVMType.value ? {
        vm_type: T;
        type: C0ValueType;
        value: DataView
    } : 
    T extends C0ValueVMType.ptr ? {
        vm_type: T;
        type: C0PointerType;
        value: C0Pointer
    } : 
    never;
```

The `vm_type` property is a reflection to the `w32`/`*` type in original C0VM.

The `type` is the inferenced data type that can be used for visualization and type constraint propagation. By default, the `type` will be `<unknown>`. But when additional information are available, the `type` property will be assigned.

| Value of `vm_type`    | Allowed value for `type`                          |
| --------------------- | ------------------------------------------------- |
| `C0ValueVMType.value` | `"<unknown>" `, `"int"`, `"char"`, or `"boolean"` |
| `C0ValueVMType.ptr`   | `C0PointerType` or `C0ValueType`                  |

> :construction: In the future, some more options will be added to the `vm_type` to make it compatible with `tagged_pointer` and `func_pointer`.

The `value` is the `DataView` of actual data

> :warning: There is no guarantee on the length of `ArrayBuffer` (since TypeScript does not support type constraint on length of array and it's impossible to be checked at compile type). So every time one need to read a pointer or value, it's recommended to use `read_ptr` (in `utility/pointer_ops.ts`) or `read_i32_with_check` (in `utility/arithmetic.ts`) since they will check the length of array buffer passed in internally.

| `vm_type` | Length of `ArrayBuffer` in `value` |
| --------- | ---------------------------------- |
| `value`   | 4                                  |
| `ptr`     | 8                                  |

## Arithmetic Operations

> See `utility/arithmetic.ts`

Since the JavaScript only have `number` type, which is an abstraction of `float`/`int`. We use functions in `arithmetic.ts` to perform basic arithmetic operations like `+`, `-`, `*` or `/`.

```typescript
export function c_add(x: DataView, y: DataView): DataView;	// x + y
export function c_sub(x: DataView, y: DataView): DataView;	// x - y
export function c_mul(x: DataView, y: DataView, Issue_Handler: MessageEmitter): DataView;	// x * y
export function c_div(x: DataView, y: DataView): DataView;	// x / y
export function c_rem(x: DataView, y: DataView): DataView;  // x % y
export function c_lsh(x: DataView, y: DataView): DataView;	// x << y
export function c_rsh(x: DataView, y: DataView): DataView;	// x >> y

export function c_and(x: DataView, y: DataView): DataView; 	// x & y
export function c_or(x: DataView, y: DataView): DataView;   // x | y
export function c_xor(x: DataView, y: DataView): DataView;  // x ^ y
```

These functions will *try its best* to mimic the overflow behavior of C program. 

> **What is `Issue_Handler` in `c_mul`'s header'?**
>
> These functions are not perfect. A specific example is shown below:
>
> ```
> cmul(2147483647, 25165823) = 2122317824 (JS)
> 2147483647 * 25165823 = 2122317825 (C)
> ```
>
> This is due to the **precision lost** problem of `float`. When such precision lost is detected, C0VM.ts *will NOT interrupt the execution.* However, we do want the user to realize such imprecise calculation. Therefore, we will use `IssueHandler` to emit a **warning** to user. The `IssueHandler` is an object that follows the `MessageEmitter` interface.
>
> By passing in different implementation of `MessageEmitter`, we may have one of the following behaviors: 1) log a warning in the console, 2) popup a warning in the GUI, etc.

## Native Functions

In original C0VM, a bunch of native functions are implemented in C and connected to C0VM to support the system calls (e.g. receive user input, etc.).

The list of native functions is listed below:

> :white_check_mark: - Currently Support
>
> :hourglass: - Development in Progress, will be supported
>
> :x: - No Recent Plan for implementation

### Command Line Arguments 

| Native Functions   | Support?    |
| ------------------ | ----------- |
| NATIVE_ARGS_FLAG   | :hourglass: |
| NATIVE_ARGS_INT    | :hourglass: |
| NATIVE_ARGS_PARSE  | :hourglass: |
| NATIVE_ARGS_STRING | :hourglass: |

### Standard I/O

| Native Functions | Support?           |
| ---------------- | ------------------ |
| NATIVE_EOF       | :x:                |
| NATIVE_FLUSH     | :hourglass:        |
| NATIVE_PRINT     | :white_check_mark: |
| NATIVE_PRINTBOOL | :white_check_mark: |
| NATIVE_PRINTCHAR | :white_check_mark: |
| NATIVE_PRINTINT  | :white_check_mark: |
| NATIVE_PRINTLN   | :white_check_mark: |
| NATIVE_READLINE  | :hourglass:        |

### Cursor :x:

> There are no recent plans to implement native functions in this category (`NATIVE_INDEX = [12, 54]`)

### Double Arithmetic

| Native Functions | Support?    |
| ---------------- | ----------- |
| NATIVE_DADD      | :hourglass: |
| NATIVE_DDIV      | :hourglass: |
| NATIVE_DLESS     | :hourglass: |
| NATIVE_DMUL      | :hourglass: |
| NATIVE_DSUB      | :hourglass: |
| NATIVE_DTOI      | :hourglass: |
| NATIVE_ITOD      | :hourglass: |
| NATIVE_PRINT_DUB | :hourglass: |

### File I/O :x:

> There are no recent plans to implement native functions in this category (`NATIVE_INDEX=[62, 67)`)

### Float Arithmetic

| Native Functions | Support?    |
| ---------------- | ----------- |
| NATIVE_FADD      | :hourglass: |
| NATIVE_FDIV      | :hourglass: |
| NATIVE_FLESS     | :hourglass: |
| NATIVE_FMUL      | :hourglass: |
| NATIVE_FSUB      | :hourglass: |
| NATIVE_FTOI      | :hourglass: |
| NATIVE_ITOF      | :hourglass: |
| NATIVE_PRINT_FPT | :hourglass: |
| NATIVE_PRINT_HEX | :hourglass: |
| NATIVE_PRINT_INT | :hourglass: |

### Image :x:

> There are no recent plans to implement native functions in this category (`NATIVE_INDEX = [77, 85)`)

### Parse String

| Native Functions    | Support?    |
| ------------------- | ----------- |
| NATIVE_INT_TOKENS   | :hourglass: |
| NATIVE_NUM_TOKENS   | :hourglass: |
| NATIVE_PARSE_BOOL   | :hourglass: |
| NATIVE_PARSE_INT    | :hourglass: |
| NATIVE_PARSE_INTS   | :hourglass: |
| NATIVE_PARSE_TOKENS | :hourglass: |

### String Operations

| Native Functions             | Support?           |
| ---------------------------- | ------------------ |
| NATIVE_CHAR_CHR              | :hourglass:        |
| NATIVE_CHAR_ORD              | :hourglass:        |
| NATIVE_STRING_CHARAT         | :hourglass:        |
| NATIVE_STRING_COMPARE        | :white_check_mark: |
| NATIVE_STRING_EQUAL          | :white_check_mark: |
| NATIVE_STRING_FROM_CHARARRAY | :white_check_mark: |
| NATIVE_STRING_FROMBOOL       | :white_check_mark: |
| NATIVE_STRING_FROMCHAR       | :white_check_mark: |
| NATIVE_STRING_FROMINT        | :white_check_mark: |
| NATIVE_STRING_JOIN           | :white_check_mark: |
| NATIVE_STRING_LENGTH         | :white_check_mark: |
| NATIVE_STRING_SUB            | :hourglass:        |
| NATIVE_STRING_TERMINATED     | :hourglass:        |
| NATIVE_STRING_TO_CHARARRAY   | :white_check_mark: |
| NATIVE_STRING_TOLOWER        | :hourglass:        |

## Project Progress

* Currently, the C0VM.ts has implemented all the features required for `C0` language.
* We are working on type inference part of the C0VM.ts
    * Specifically, we are working on type inference of `struct` and `array`.
* In the future, we will support the `C1` language standard.
