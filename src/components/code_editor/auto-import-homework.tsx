import type CodeEditor from "../code-editor";

export default function LoadAsHomeworkIfPossible(comp: CodeEditor) {
    let key = -1;
    let tabs = [...comp.props.app_state.C0Editors].filter(
        (tab) => tab.content.length !== 0
    );

    for (const tab of comp.props.app_state.C0Editors) {
        if (tab.title.endsWith("txt")) {
            key = tab.key;
        }
    }

    if (key !== -1) {
        comp.props.set_app_state({ActiveEditor: key, C0Editors: tabs});
    }
}
