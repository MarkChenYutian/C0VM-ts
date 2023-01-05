import { C0Language } from "../components/editor_extension/syntax/c0";
import { String2Type } from "../utility/c0_type_utility";


function extract_library(code: string) {
    const syntaxTree = C0Language.parser.parse(code);
    const libraries = [];

    for (let ptr = syntaxTree.cursor(); ptr.next() !== false; ){
        if (ptr.type.is("LibraryImport")){
            ptr.firstChild();
            ptr.nextSibling();
            const library_name = code.substring(ptr.from, ptr.to);
            libraries.push(library_name)
        }
    }
    return libraries;
}

function extract_all_libraries(editors: C0EditorTab[]): Set<string>{
    const libraries = [];
    for (const editor of editors){
        libraries.push(...extract_library(editor.content));
    }
    return new Set(libraries);
}


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

function next_real_sibling(ptr: any){
    let result = ptr.nextSibling();
    while (ptr.type.is("Comment") || ptr.type.is("CommentBlock")) {
        result = ptr.nextSibling();
    }
    return result
}

function extract_struct(code: string): Map<string, Struct_Type_Record[]> {
    const syntaxTree = C0Language.parser.parse(code);

    const structInfos: Map<string, Struct_Type_Record[]> = new Map();

    for (let ptr = syntaxTree.cursor(); ptr.next() !== false; ){
        if (ptr.type.is("StructDefinition")){
            ptr.firstChild();
            const structureType = code.substring(ptr.from, ptr.to);
            const fieldTypes: Struct_Type_Record[] = [];

            next_real_sibling(ptr);  // ptr is now StructScope
            ptr.firstChild();   // Moving into StructScope

            while (next_real_sibling(ptr) && ptr.type.is("Type")){
                const fieldType = String2Type(code.substring(ptr.from, ptr.to));
                next_real_sibling(ptr);
                const fieldName = code.substring(ptr.from, ptr.to);
                next_real_sibling(ptr);
                fieldTypes.push({type: fieldType, name: fieldName});
            }
            structInfos.set(structureType, fieldTypes);
        }
    }
    return structInfos;
}


function extract_all_structs(editors: C0EditorTab[]): Map<string, Struct_Type_Record[]>{
    let all_structs: Map<string, Struct_Type_Record[]> = new Map();
    for (const editor of editors){
        const new_structs = extract_struct(editor.content);
        all_structs = new Map([...Array.from(all_structs), ...Array.from(new_structs)]);
    }
    return all_structs;
}

export function extract_all_structType(editors: C0EditorTab[]){
    const structInformation = extract_all_structs(editors);
    const typeAlias         = extract_all_typedef(editors);
    const structTypeRecords = new Map<string, Map<number, Struct_Type_Record>>();
    
    for (let [structName, structFields] of Array.from(structInformation)){
        let structTypeRecord = new Map<number, Struct_Type_Record>();
        let offset = 0;
        let continueParsingFlag = true;

        for (const structField of structFields){
            if (!continueParsingFlag) break;

            if (structField.type === undefined) {
                continueParsingFlag = false;
                break;
            }
            
            // Some manually crafted memory alignment rules...
            switch (structField.type.type) {
                case "ptr": 
                case "string":
                    offset = Math.ceil(offset / 8) * 8;
                    break;
                case "value":
                    if (structField.type.value === "int"){
                        offset = Math.ceil(offset / 4) * 4;
                    } else {
                        offset = offset + 0;    // (No memory alignment rule for char and bool)
                    }
                    break;
                case "<unknown>":
                    continueParsingFlag = false;
                    break;
            }

            structTypeRecord.set(offset, structField);

            switch (structField.type.type) {
                case "ptr":
                case "string":
                    offset += 8;
                    break;
                case "value":
                    if (structField.type.value === "int") {
                        offset += 4;
                    } else {
                        offset += 1;
                    }
                    break;
                case "<unknown>":
                    continueParsingFlag = false;
                    break;
            }
        }

        if (!continueParsingFlag) { 
            if (DEBUG) {console.warn(`Failed to extract type information for ${structName}`);}
            continue;
        }

        let recordName = structName;
        if (typeAlias.has(structName)){
            recordName = typeAlias.get(structName) as string;
        }
        structTypeRecords.set(recordName, structTypeRecord);
    }
    return structTypeRecords;
}

// Extract all typedefs in current editor
// in format of {source: alias}
export function extract_all_typedef(editors: C0EditorTab[]): Map<string, string>{
    const rawTypedefs = [];
    for (const editor of editors) {
        rawTypedefs.push(...extract_typedef(editor.content));
    }
    const typedef = flatten_typedef(rawTypedefs);
    const revTypedef = new Map<string, string>();
    typedef.forEach((source, alias) => {revTypedef.set(source, alias)});

    return revTypedef;
}

// Check if all libraries used in program is supported by C0VM.ts
// reject if contains
//
// args - argument from CLI
// img  - image interface
// file - file I/O
// curses - interaction on stdout
export function is_all_library_supported(editors: C0EditorTab[]){
    const libraries = extract_all_libraries(editors);
    return !(
        libraries.has("args")  ||
        libraries.has("img")   ||
        libraries.has("file")  ||
        libraries.has("curses")
    );
}

