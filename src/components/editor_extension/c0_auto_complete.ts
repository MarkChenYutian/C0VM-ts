import { Completion, CompletionContext } from "@codemirror/autocomplete";

export function C0ContractAutoComplete(context: CompletionContext): Completion[] {
    const word = context.matchBefore(/(\/\/@|\/\*@)/);
    if (word === null || word.from === word.to) { return []; }
    return [
            {label: "requires", type: "keyword"},
            {label: "ensures", type: "keyword"},
            {label: "assert", type: "keyword"},
            {label: "loop_invariant", type: "keyword"}
        ];
}
