import { CompletionContext } from "@codemirror/autocomplete";
import {syntaxTree} from "@codemirror/language"

const completePropertyAfter = ["ContractLine"];

function completeContract(context: CompletionContext) {
    let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
    if (DEBUG) console.log(completePropertyAfter.includes(nodeBefore.name), nodeBefore.parent?.name);
    if (completePropertyAfter.includes(nodeBefore.name) &&
        nodeBefore.parent?.name === "Contract"){
            console.log("Autocomplete Toggled");
            return {from : 0, options: [
                {label: "requires", type: "keyword"}, 
                {label: "ensures", type: "keyword"}, 
                {label: "loop_invariant", type: "keyword"}]
                , validFor: /^[\w$]*$/
            }
    }
    
    return null;
}

export {completeContract}
