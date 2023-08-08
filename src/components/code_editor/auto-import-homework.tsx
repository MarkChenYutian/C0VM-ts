import type CodeEditor from "../code-editor";

const cc0_compile_line_regex = /^\s*%\s*cc0/;

function getCompilerLineNumber(s: string) {
    const lines = s.split("\n");
    let result: undefined | string = undefined;

    let triggered = false;
    for (const line of lines) {
        if (! cc0_compile_line_regex.test(line)) continue;
        if (line.includes("-i") || line.includes("--interface")) continue;
        
        const files = line.split(" ").filter(f => f.endsWith(".c0") || f.endsWith(".c1") || f.endsWith(".o0") || f.endsWith(".o1"));

        let notSupportFlag = false;
        for (let file of files) notSupportFlag = notSupportFlag || file.endsWith(".o0") || file.endsWith(".o1");

        if (notSupportFlag) continue;
        if (triggered) continue;

        triggered = true;
        result = line
    }
    return result;
}


export default function LoadAsHomeworkIfPossible(comp: CodeEditor) {
    //@ts-ignore
    comp.props.set_app_state((s) => 
    {   
        let key: number = -1;
        let tabs = [...s.C0Editors].filter(
            (tab) => tab.content.length !== 0
        );
        let compiler_line = undefined
    
        for (const tab of s.C0Editors) {
            if (!tab.title.endsWith("txt")) continue;
            const line = getCompilerLineNumber(tab.content);
            if (line === undefined) continue;
            key = tab.key;
            compiler_line = line;
        }

        if (compiler_line !== undefined) {
            return {
                ActiveEditor: key, 
                C0Editors: tabs,
                PrintoutValue: s.PrintoutValue
            }
        }
        return {
            C0Editors: tabs
        }
    }
    );
}
