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

// Generate a uuid4 for debug console to indicate which one is the full screened one
// when multiple C0VM instances exists.
// Source: https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
export function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
    });
}

