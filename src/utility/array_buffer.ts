
export function copy_dataview(x: DataView): DataView {
    const nbuf = x.buffer.slice(x.byteOffset, x.byteOffset + x.byteLength);
    return new DataView(nbuf);
}
