import { C0Language } from "../components/editor_extension/syntax/c0";

/**
 * Given a C0 code string, return a list of Typedefs defined in the given code string
 * @param code C0 code
 * @returns a list of typedefs in format {source: T, alais: T'}
 */
function extract_typedef(code: string): TypeDefInfo[] {
    const syntaxTree = C0Language.parser.parse(code);
    const typedefs: TypeDefInfo[] = [];

    for (let ptr = syntaxTree.cursor(); ptr.next() !== false; ){
        if (ptr.type.is("TypeDefinition")){
            ptr.firstChild();       // ptr = typedef keyword itself
            ptr.nextSibling();      // ptr = Source Type
            const source_type = code.substring(ptr.from, ptr.to);
            ptr.nextSibling();      // ptr = Target Type
            const alias_type = code.substring(ptr.from, ptr.to);
            
            typedefs.push({ source: source_type, alias: alias_type });
        }
    }

    return typedefs
}

/**
 * Resolve the nested reference in map automatically
 * 
 * e.g. A -> B, D -> B, B -> C
 * will be flattened to:
 * A -> C, B -> C, D -> C
 * 
 * @returns A flattened type mapping
 */
function flatten_typedef(typedefs: TypeDefInfo[]): Map<string, string> {
    const original_map = new Map<string, string>(); // alias -> source
    for (const typedef of typedefs){
        original_map.set(typedef.alias, typedef.source);
    }
    const flattened = new Map<string, string>();
    original_map.forEach(
        (source, alias) => {
            let actual_source = source;
            while (original_map.has(actual_source)) {
                actual_source = original_map.get(actual_source) as string;
            }
            flattened.set(alias, actual_source);
        })
    return flattened;
}



export function extract_all_typedef(editors: C0EditorTab[]): Map<string, string>{
    const rawTypedefs = [];
    for (const editor of editors) {
        rawTypedefs.push(...extract_typedef(editor.content));
    }
    return flatten_typedef(rawTypedefs);
}
