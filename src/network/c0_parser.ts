import { C0Language } from "../components/editor_extension/syntax/c0";


export function extract_typedef(code: string){
    const syntaxTree = C0Language.parser.parse(code);

    for (let ptr = syntaxTree.cursor(); ptr.next() !== false; ){
        if (ptr.type.is("TypeDefinition")){
            ptr.firstChild();       // ptr = typedef keyword itself
            ptr.nextSibling();      // ptr = Source Type
            const source_type = code.substring(ptr.from, ptr.to);
            ptr.nextSibling();      // ptr = Target Type
            const alias_type = code.substring(ptr.from, ptr.to);
            console.log(source_type, " |> ", alias_type);
        }
    }
}
