import { C0Language } from "../components/code_editor/editor_extension/syntax/c0";
import { String2Type, Type2String } from "../utility/c0_type_utility";
import { internal_error } from "../utility/errors";


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
        if (typeof editor.content !== "string" && editor.ref_content !== undefined) {
            libraries.push(...extract_library(editor.ref_content));
        } else if (typeof editor.content === "string") {
            libraries.push(...extract_library(editor.content));
        }
    }
    return new Set(libraries);
}


/**
 * Given a C0 code string, return a list of Typedefs defined in the given code string
 * @param code C0 code
 * @returns a list of typedefs in format {source: T, alais: T'}
 */
function extract_typedef(code: string): [TypeDefInfo[], Set<string>] {
    const syntaxTree = C0Language.parser.parse(code);
    const typedefs: TypeDefInfo[] = [];
    const funcTypes = new Set<string> ();

    for (let ptr = syntaxTree.cursor(); ptr.next() !== false; ){
        if (ptr.type.is("TypeDefinition")){
            ptr.firstChild();               // ptr = typedef keyword itself
            next_real_sibling(ptr);         // ptr = Source Type
            if (!ptr.type.is("Type")) { continue; }
            const source_type = code.substring(ptr.from, ptr.to);
            next_real_sibling(ptr);         // ptr = Target Type
            if (ptr.type.is("Identifier")) { 
                // This is a function type definition!
                // typedef int retNum_fn();
                const function_type = code.substring(ptr.from, ptr.to);
                funcTypes.add(function_type);
            } else {
                // This is a normal type definition
                // typdef T T';
                const alias_type = code.substring(ptr.from, ptr.to);
                typedefs.push({ source: source_type, alias: alias_type });
            }
        }
    }

    return [typedefs, funcTypes];
}

/**
 * Try apply typedef to the type (recursively)
 * 
 * If the 
 * 
 * @param T The type to be apply typedef with
 * @param typedefs current typedefs in project
 */
function try_typedef_recursively(T: C0Type<C0TypeClass>, typedefs: Map<AliasType, SourceType>): [C0Type<C0TypeClass>, boolean] {
    if (T.type === "ptr" && T.kind === "struct") {
        if (typedefs.has(T.value)) {
            return [String2Type(typedefs.get(T.value) as SourceType), true]
        } else {
            return [T, false];
        }
    }

    switch (T.type) {
        case "<unknown>":
        case "tagptr":
        case "value":
        case "funcptr":
        case "string":
            return [T, false];
        case "ptr":
            if (T.kind === "arr" || T.kind === "ptr") {
                const [childType, hasChanged] = try_typedef_recursively(T.value, typedefs);
                T.value = childType;
                return [T, hasChanged];
            }
            throw new internal_error("Impossible case reached in apply_typdef")
    }
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
function flatten_typedef(typedefs: TypeDefInfo[]): Map<AliasType, SourceType> {
    const typedef_map = new Map<AliasType, SourceType>(); // alias -> source
    for (const typedef of typedefs){
        typedef_map.set(typedef.alias, typedef.source);
    }

    let isConverged = false;
    while (!isConverged) {
        isConverged = true;
        const aliases = Array.from(typedef_map.keys());
        for (const alias_typename of aliases) {
            const temp_source = typedef_map.get(alias_typename) as AliasType;
            const temp_src_type = String2Type(temp_source);
            const [new_source, hasChanged] = try_typedef_recursively(temp_src_type, typedef_map);
            isConverged = isConverged && (!hasChanged);
            typedef_map.set(alias_typename, Type2String(new_source));
        }
    }

    return typedef_map;
}

function next_real_sibling(ptr: any){
    let result = ptr.nextSibling();
    while (ptr.type.is("Comment") || ptr.type.is("CommentBlock")) {
        result = ptr.nextSibling();
    }
    return result
}

function extract_struct(code: string, typedef: Map<AliasType, SourceType>): Map<string, Struct_Type_Record[]> {
    const syntaxTree = C0Language.parser.parse(code);

    const structInfos: Map<string, Struct_Type_Record[]> = new Map();

    for (let ptr = syntaxTree.cursor(); ptr.next() !== false; ){
        if (ptr.type.is("StructDefinition")){
            ptr.firstChild();
            const structureType = code.substring(ptr.from, ptr.to);
            const fieldTypes: Struct_Type_Record[] = [];

            next_real_sibling(ptr);  // ptr is now StructScope
            ptr.firstChild();        // Moving into StructScope

            while (next_real_sibling(ptr) && ptr.type.is("Type")){
                const fieldType = String2Type(code.substring(ptr.from, ptr.to));
                next_real_sibling(ptr);
                const fieldName = code.substring(ptr.from, ptr.to);
                next_real_sibling(ptr);
                fieldTypes.push({type: try_typedef_recursively(fieldType, typedef)[0], name: fieldName});
            }
            structInfos.set(structureType, fieldTypes);
        }
    }
    return structInfos;
}


function extract_all_structs(editors: C0EditorTab[]): Map<string, Struct_Type_Record[]>{
    let all_structs: Map<string, Struct_Type_Record[]> = new Map();
    const typedefs = extract_all_typedef(editors)[0];

    for (const editor of editors){
        let new_structs;
        if (typeof editor.content !== "string" && editor.ref_content !== undefined) {
            new_structs = extract_struct(editor.ref_content, typedefs);
        } else if (typeof editor.content === "string") {
            new_structs = extract_struct(editor.content, typedefs);
        }
        if (new_structs === undefined) continue;

        all_structs = new Map([...Array.from(all_structs), ...Array.from(new_structs)]);
    }
    return all_structs;
}

export function extract_all_structType(editors: C0EditorTab[]){
    const structInformation = extract_all_structs(editors);
    const [typeAlias,]      = extract_all_typedef(editors);
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
                case "funcptr":
                case "tagptr":
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
                case "funcptr":
                case "tagptr":
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
// in format of {alias: source}
export function extract_all_typedef(editors: C0EditorTab[]): [Map<AliasType, SourceType>, Set<string>]{
    const rawTypedefs: TypeDefInfo[] = [];
    const functionTypes = [];
    for (const editor of editors) {
        let typedef, functype;
        if (typeof editor.content !== "string" && editor.ref_content !== undefined) {
            [typedef, functype] = extract_typedef(editor.ref_content);
        } else if (typeof editor.content === "string") {
            [typedef, functype] = extract_typedef(editor.content);
        }
        if (typedef === undefined || functype === undefined) {
            continue;
        }

        rawTypedefs.push(...typedef);
        functionTypes.push(...Array.from(functype));
    }
    const typedef = flatten_typedef(rawTypedefs);
    const funcTypes = new Set(functionTypes);

    return [typedef, funcTypes];
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
        libraries.has("cursor")
    );
}

