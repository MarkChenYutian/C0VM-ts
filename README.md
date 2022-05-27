# C0VM.ts Documentation

## Compile Project

The entry point of this projcet is at `/src/main.ts`.

The project is setup to be compiled to `CommonJS` using `webpack`.

```bash
$ npx webpack
```

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
    debug_getMemPool(): ArrayBuffer
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

Written in `./utility/memory.ts`, the `VM_Memory` class is a naive implementation to the `C0HeapAllocator` interface.

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

>  :warning: Note: By C convention, if a pointer is `0x0000000000000000` (64-bit zero), we say this pointer is a `NULL` Pointer. In C0VM.ts, if the first 32-bits of a pointer are all zero, we can assert it is `NULL`.

A helper function `read_ptr` is defined in `utility/pointer_ops.ts`. Giving the function a `C0Pointer` (which is, in fact, only an alias of `DataView`), it will return the `address`, `offset` and `size` of pointer.

### Int, Boolean and Char `t`

`int`, `boolean` and `char` are all a sequence of `4` bytes. That is to say, they are all stored in a segment of `ArrayBuffer`.

In C0VM Writeup, these 4-bytes values are all annotated as `w32`.

### Array `t[]`

For any type `t` with size $s$, we can create an array of it. The array is described by structure like this

| Starting Index (Include) | Ending Byte Index (Exclude) | Meaning                           |
| ------------------------ | -------------------------- | --------------------------------- |
| `0`                      | `4`                        | Size of each element of the array |
| `4`                      | `4 + n * s`                | An `n`-element array              |

## Arithmetic Operations

> See `utility/arithmetic.ts`

Since the JavaScript only have `number` type, which is an abstraction of `float`/`int`. We use functions in `arithmetic.ts` to perform basic arithmetic operations like `+`, `-`, `*` or `/`.

```typescript
export function c_add(x: DataView, y: DataView): DataView;	// x + y
export function c_sub(x: DataView, y: DataView): DataView;	// x - y
export function c_mul(x: DataView, y: DataView, Issue_Handler: MessageEmitter): DataView;	// x * y
export function c_div(x: DataView, y: DataView): DataView;	// x / y
export function c_lsh(x: DataView, y: DataView): DataView;	// x << y
export function c_rsh(x: DataView, y: DataView): DataView;	// x >> y
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
> This is due to the **precision lost** problem of `float`. When such precision lost is detected, C0VM.ts will issue a warning to the user interface *but will NOT interrupt the execution*.
>
> However, we do want the user to realize such imprecise calculation. Therefore, we will use `IssueHandler` to emit a **warning** to user. The `IssueHandler` is an object that follows the `MessageEmitter` interface.
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

### Standard IO

| Native Functions | Support?    |
| ---------------- | ----------- |
| NATIVE_EOF       | :hourglass: |
| NATIVE_FLUSH     | :hourglass: |
| NATIVE_PRINT     | :hourglass: |
| NATIVE_PRINTBOOL | :hourglass: |
| NATIVE_PRINTCHAR | :hourglass: |
| NATIVE_PRINTINT  | :hourglass: |
| NATIVE_PRINTLN   | :hourglass: |
| NATIVE_READLINE  | :hourglass: |

### Curses :x:

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

### File IO :x:

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
| NATIVE_STRING_FROM_CHARARRAY | :hourglass:        |
| NATIVE_STRING_FROMBOOL       | :hourglass:        |
| NATIVE_STRING_FROMCHAR       | :hourglass:        |
| NATIVE_STRING_FROMINT        | :hourglass:        |
| NATIVE_STRING_JOIN           | :hourglass:        |
| NATIVE_STRING_LENGTH         | :hourglass:        |
| NATIVE_STRING_SUB            | :hourglass:        |
| NATIVE_STRING_TERMINATED     | :hourglass:        |
| NATIVE_STRING_TO_CHARARRAY   | :hourglass:        |
| NATIVE_STRING_TOLOWER        | :hourglass:        |

