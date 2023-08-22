import { Type2String } from "./c0_type_utility";

export function replacer(key: any, value: any) {
    if (value instanceof Map) {
        return Array.from(value.entries()).map(([key, value]) => {return {k: key, v: value}});
    }
    if (value instanceof Set) {
        return Array.from(value.entries()).map(([key,]) => key);
    }
    if (value instanceof Object && value.type !== undefined) {
        return Type2String(value.type as C0Type<C0TypeClass>)
    }
    else {
        return value;
    }
}

export function stdout(type: "info" | "normal" | "error", update_print: (s: string) => void): (s: string) => void {
    switch (type) {
        case "error": 
            return (s) => update_print(`<span class="stdout-error">${s.replaceAll(" ", "&nbsp;")}</span>`)
        case "normal":
            return (s) => update_print(s.replaceAll(" ", "&nbsp;"))
        case "info":
            return (s) => update_print(`<span class='stdout-info'>${s.replaceAll(" ", "&nbsp;")}</span>`)
    }
}

export const toBase64: (f: File) => Promise<string> = 
(file: File) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        let encoded = (reader.result as string).toString().replace(/^data:(.*,)?/, '');
        if ((encoded.length % 4) > 0) {
            encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
    }
    reader.onerror = reject;
});
