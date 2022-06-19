/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @abstract Interfaces used in the C0VM.ts
 */

interface MessageEmitter {
    /**
     * Emit an error to the UI Interface
     * (or console, depends on implementation)
     * @param msg Title of Error Message
     * @param detail Detail of the error (optional)
     */
    err(msg: string, detail?: string): void
    /**
     * Emit a warning to the UI Interface 
     * (or console, depends on implementation)
     * @param msg Title of warning message
     * @param detail Detail of the warning (optional)
     */
    warn(msg: string, detail?: string): void
    /**
     * Emit a OK Signal to either UI Interface or console
     * @param msg Title of confirmation message
     * @param detail Detail of the confirmation
     */
    ok(msg: string, detail?: string): void
}

interface C0HeapAllocatorConstructor {
    /**
     * Initialize the heap memory for C0VM
     * @param size The size of heap memory size (optional)
     */
    new (size ?: number) : C0HeapAllocator;
}

interface C0HeapAllocator {
    /**
     * Allocate heap memory **with initialization**.
     * @param size The size to be allocated in the heap memory
     * @throws `c0_memory_error` if there does not have enough memory to be allocated
     */
    malloc(size: number): C0Pointer
    /**
     * Free heap memory. 
     * @param ptr The pointer to be freed
     */
    free(ptr: C0Pointer): void
    /**
     * Clean up the whole heap memory.
     * 
     * Usually called when the C0VM need to be destroyed (e.g. when restart)
     */
    clear(): void
    /**
     * Used for debug, will return the read-only memory pool ArrayBuffer
     */
    debug_getMemPool(): ArrayBuffer | undefined
    // Operations on Heap Memory
    /**
     * Write 1 byte of data into the heap memory.
     * @param ptr Pointer to the position that you want to write data in
     * @param value The first byte of value will be written to the position that pointer is pointing at
     * @throws `c0_memory_error` When the `ptr` is NULL.
     * @throws `c0_memory_error` when the memory [ptr, ptr + 1) is not in allocated segment
     * @throws `vm_error` When `value`'s byte length is smaller than 1.
     */
    cmstore(ptr: C0Pointer, value: DataView): void

    /**
     * Load 1 byte from the heap memory
     * @param ptr Pointer where [ptr, ptr + 1) will be loaded
     * @throws `c0_memory_error` when loading such byte will lead to memory access out-of-bound
     * @throws `c0_memory_error` when `ptr` is `NULL`
     * @returns A DataView that has byte length of 1.
     */
    cmload(ptr: C0Pointer): DataView

    /**
     * Write 4 bytes of data (w32) into the heap memory
     * @param ptr Pointer to the position that you want to write data in
     * @param value The first four bytes of value will be written in heap.
     * @throws `c0_memory_error` when `ptr` is `NULL`
     * @throws `c0_memory_error` when the memory `[ptr, ptr + 4)` is not in allocated segment
     * @throws `vm_error` when the `value`'s byte length is smaller than 4.
     */
    imstore(ptr: C0Pointer, value: DataView): void

    /**
     * Load 4 bytes from the heap memory
     * @param ptr Pointer where [ptr, ptr + 4) will be loaded
     * @throws `c0_memory_error` when loading such 4 bytes will lead to memory access out-of-bound
     * @throws `c0_memory_error` when `ptr` is `NULL`
     * @returns A DataView that has byte length of 4.
     */
    imload(ptr: C0Pointer): DataView

    /**
     * Write 8 bytes of data (a pointer) into the heap memory
     * @param ptr Pointer to the position that you want to write data in
     * @param stored_ptr The first 8 bytes of value will be written in heap
     * @throws `c0_memory_error` when `ptr` is `NULL`
     * @throws `c0_memory_error` when the memory `[ptr, ptr + 8)` is not in allocated segment
     * @throws `vm_error` when the `value`'s byte length is smaller than 8.
     */
    amstore(ptr: C0Pointer, stored_ptr: C0Pointer): void

    /**
     * Load 8 bytes from the heap memory
     * @param ptr Pointer where [ptr, ptr + 8) will be loaded
     * @throws `c0_memory_error` when loading such 8 bytes will lead to memory access out-of-bound
     * @throws `c0_memory_error` when `ptr` is `NULL`
     * @returns A DataView that has byte length of 8.
     */
    amload(ptr: C0Pointer): DataView

    /**
     * Returns the memory segment [ptr, end_of_segment)
     * @param ptr The pointer points to the memory location
     * @param block_size The size to be returned
     * @returns A **reference/alias** of the specific segment of the memory pool.
     */
    deref(ptr: C0Pointer, block_size?: number): DataView
}

