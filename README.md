# C0VM.ts Documentation

## Compile Project

```
$ npx webpack
```

## Memory Allocator

> See `./utility/memory.ts`

```typescript
interface VM_Memory {
    malloc(size: number): C0Pointer
    free(ptr: C0Pointer): void
    // Clean up the whole heap memory.
    clear(): void
    // Used for debug, will return the read-only memory pool ArrayBuffer
    debug_getMemPool(): ArrayBuffer
    // Operations on Heap Memory
    cmstore(ptr: C0Pointer, value: DataView): void
    cmload(ptr: C0Pointer): DataView

    imstore(ptr: C0Pointer, value: DataView): void
    imload(ptr: C0Pointer): DataView

    amstore(ptr: C0Pointer, stored_ptr: C0Pointer): void
    amload(ptr: C0Pointer): DataView
}
```

In C0VM.ts, we use a `ArrayBuffer` to simulate the heap memory of a C program.

Since we are following the C's convention (`0x0000000000000000` is a `NULL`pointer), the memory address at `0x00` is reserved and never touched. Allocator will start to allocate memory from `0x01`.

## Data Types

In `C0VM.ts`, **everything** is eventually a segment of `ArrayBuffer`.

### C0Pointer `*t`

`C0Pointer` is a `bytearray` with length `8` (64-bit). However, different from what C actually do to pointer, we only use the first `6` bytes to store the memory address. The remaining `2` bytes are used to annotate the size of allocated memory segment. This allow C0VM.ts to check memory-access out of bound and throw error when dereferencing such pointer.

| Start Index (include) | End Index (exclude) | Representation                                               |
| --------------------- | ------------------- | ------------------------------------------------------------ |
| `0`                   | `4`                 | `Uint32` - Address of Memory block this pointer is pointing to |
| `4`                   | `6`                 | `Uint16` - Offset of the pointer on the pointed memory block |
| `6`                   | `8`                 | `Uint16` - The size of memory block                          |



:warning: Note: By C convention, if a pointer is `0x0000000000000000` (64-bit zero), we say this pointer is a `NULL` Pointer.

A helper function `read_ptr` is defined in `utility/pointer_ops.ts`. Giving the function a `C0Pointer` (which is, in fact, only an alias of `DataView`), it will return the `address`, `offset` and `size` of pointer.

### Int, Boolean and Char `t`

`int`, `boolean` and `char` are all a sequence of `4` bytes. That is to say, they are all stored in a segment of `ArrayBuffer`.

In C0VM Writeup, these 4-bytes values are all annotated as `w32`.

### Array `t[]`

For any type `t` with size $s$, we can create an array of it. The array is described by structure like this

| Starting Bit Index | Ending Bit Index | Meaning                           |
| ------------------ | ---------------- | --------------------------------- |
| `0`                | `4`              | Size of each element of the array |
| `4`                | `4 + n * s`      | An `n`-element array              |

## Arithmetic Operations

> See `utility/arithmetic.ts`

Since the JavaScript only have `number` type, which is an abstraction of `float`/`int`. We use functions in `arithmetic.ts` to perform basic arithmetic operations like `+`, `-`, `*` or `/`.

These functions will *try its best* to mimic the overflow behavior of C program. However, **it is not perfect**. A specific example is shown below:

```
2147483647 * 25165823 = 2122317824 (JS)
2147483647 * 25165823 = 2122317825 (C)
```

This is due to the **precision lost** problem of `float`. When such precision lost is detected, C0VM.ts will issue a warning to the user interface *but will NOT interrupt the execution*.

## Native Functions

In original C0VM, a bunch of native functions are implemented in Standard ML and connected to C0VM to perform some basic functions that interact with system (e.g. receive user input, etc.).

The list of native functions are listed below:

> :white_check_mark: - Currently Support
>
> :hourglass: - Development in Progress
>
> :x: - No Recent Plan for implementation

### Command Line Arguments 

| Native Functions   | Support?    |
| ------------------ | ----------- |
| NATIVE_ARGS_FLAG   | :hourglass: |
| NATIVE_ARGS_INT    | :hourglass: |
| NATIVE_ARGS_PARSE  | :hourglass: |
| NATIVE_ARGS_STRING | :hourglass: |

#### Standard IO

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

#### Curses :x:

> There are no recent plans to implement native functions in this category (`INDEX = [12, 54]`)

#### Dub

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

#### File IO :x:

> There are no recent plans to implement native functions in this category (`INDEX=[62, 67)`)

#### Float Points

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

#### Image

| Native Functions      | Support?    |
| --------------------- | ----------- |
| NATIVE_IMAGE_CLONE    | :hourglass: |
| NATIVE_IMAGE_CREATE   | :hourglass: |
| NATIVE_IMAGE_DATA     | :hourglass: |
| NATIVE_IMAGE_HEIGHT   | :hourglass: |
| NATIVE_IMAGE_LOAD     | :hourglass: |
| NATIVE_IMAGE_SAVE     | :hourglass: |
| NATIVE_IMAGE_SUBIMAGE | :hourglass: |
| NATIVE_IMAGE_WIDTH    | :hourglass: |

#### Parse String

| Native Functions    | Support?    |
| ------------------- | ----------- |
| NATIVE_INT_TOKENS   | :hourglass: |
| NATIVE_NUM_TOKENS   | :hourglass: |
| NATIVE_PARSE_BOOL   | :hourglass: |
| NATIVE_PARSE_INT    | :hourglass: |
| NATIVE_PARSE_INTS   | :hourglass: |
| NATIVE_PARSE_TOKENS | :hourglass: |

#### String

| Native Functions             | Support?    |
| ---------------------------- | ----------- |
| NATIVE_CHAR_CHR              | :hourglass: |
| NATIVE_CHAR_ORD              | :hourglass: |
| NATIVE_STRING_CHARAT         | :hourglass: |
| NATIVE_STRING_COMPARE        | :hourglass: |
| NATIVE_STRING_EQUAL          | :hourglass: |
| NATIVE_STRING_FROM_CHARARRAY | :hourglass: |
| NATIVE_STRING_FROMBOOL       | :hourglass: |
| NATIVE_STRING_FROMCHAR       | :hourglass: |
| NATIVE_STRING_FROMINT        | :hourglass: |
| NATIVE_STRING_JOIN           | :hourglass: |
| NATIVE_STRING_LENGTH         | :hourglass: |
| NATIVE_STRING_SUB            | :hourglass: |
| NATIVE_STRING_TERMINATED     | :hourglass: |
| NATIVE_STRING_TO_CHARARRAY   | :hourglass: |
| NATIVE_STRING_TOLOWER        | :hourglass: |

