import { createHeap, VM_Memory } from "./utility/memory";

const heap = createHeap(VM_Memory, 16);
const ptr: C0Pointer = heap.malloc(8);
console.log(`Address: ${ptr.getInt32(0)}, Offset: ${ptr.getUint16(4)}, BlockSize: ${ptr.getUint16(6)}`);
const ptr2: C0Pointer = heap.malloc(4);
console.log(`Address: ${ptr2.getInt32(0)}, Offset: ${ptr2.getUint16(4)}, BlockSize: ${ptr2.getUint16(6)}`);

const rawValue = new Uint8Array([0xCC, 0xC0, 0xFF, 0xEE, 0x00, 0x02, 0x03, 0xCC]);

heap.amstore(ptr, new DataView(rawValue.buffer));

heap.imstore(ptr2, new DataView(rawValue.buffer, 1));

console.log(heap.imload(ptr2));
console.log(heap.cmload(ptr2));
console.log(heap.amload(ptr));

console.log(heap.debug_getMemPool());

heap.free(ptr2);

console.log(heap.debug_getMemPool());
