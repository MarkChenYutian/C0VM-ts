import { gutter, GutterMarker, EditorView } from "@codemirror/view";

const func_regex = /(int|string|boolean|char|void)(\*|\[\])* [^(=|+|-|*|/)]+\s*\(.*\).*/;
const contract_regex = /^\s*(\/\/@|\/\*@)\s*(requires|ensures|assert|loop_invariant)/;
const bc0_func_regex = /^#<[^\s]+>$/;
const bc0_label_regex = /^#\s+<\d+:[^\s]+>$/;

class funcHeadMarker extends GutterMarker {
  toDOM() {
    const elem = document.createElement("i");
    elem.textContent = "f";
    return elem;
  }
}

class annotationMarker extends GutterMarker {
  toDOM(view: EditorView): Node {
    const elem = document.createTextNode("@");
    return elem;
  }
}

class labelMarker extends GutterMarker {
  toDOM() {
    const elem = document.createElement("b");
    elem.textContent = "↪";
    return elem;
  }
}

const funcHeadGutter = [
  gutter({
    class: "cm-func-gutter",
    lineMarker(view, line) {
      const s = view.state.doc.toString().slice(line.from, line.to);
      if (bc0_label_regex.test(s)) return new labelMarker();
      if (contract_regex.test(s)) return new annotationMarker();
      if (func_regex.test(s) || bc0_func_regex.test(s)) return new funcHeadMarker();
      return null;
    },
    initialSpacer: () => new funcHeadMarker(),
  }),
  EditorView.baseTheme({
    ".cm-func-gutter .cm-gutterElement": {
      color: "blue",
      paddingRight: "1px",
      cursor: "normal"
    },
  }),
];

export default funcHeadGutter;
