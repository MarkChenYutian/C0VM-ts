export function merge_typedef(original: Map<string, TypeDefInfo>, editor_key: number, newSet: Map<string, string>): Map<string, TypeDefInfo> {
    const newTypedef = new Map<string, TypeDefInfo>();
    original.forEach(
        (value, key) => {
            if (value.key !== editor_key) {
                newTypedef.set(key, value);
            }
        }
    )
    newSet.forEach(
        (value, key) => {
            newTypedef.set(key, {source: value, key: editor_key});
        }
    );
    return newTypedef;
}
