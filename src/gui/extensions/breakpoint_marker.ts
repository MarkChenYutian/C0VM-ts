import { StateField, StateEffect, RangeSet } from "@codemirror/state";
import { GutterMarker, gutter } from "@codemirror/view";
import { EditorView } from "@codemirror/view";

//ref: https://codemirror.net/examples/gutter/

const breakpointEffect = StateEffect.define<{ pos: number; on: boolean }>({
  map: (val, mapping) => {
    return { pos: mapping.mapPos(val.pos), on: val.on };
  },
});

const breakpointState = StateField.define<RangeSet<GutterMarker>>({
  create() {
    return RangeSet.empty;
  },
  update(set, transaction) {
    set = set.map(transaction.changes);
    for (let e of transaction.effects) {
      if (e.is(breakpointEffect)) {
        if (e.value.on) {
          set = set.update({ add: [breakpointMarker.range(e.value.pos)] });
        } else {
          set = set.update({ filter: (from) => from != e.value.pos });
        }
      }
    }
    return set;
  },
});

function toggleBreakpoint(view: EditorView, pos: number) {
  // update breakpoint positions
  const lineNum = view.state.doc.lineAt(pos).number;
  if (globalThis.EDITOR_BREAKPOINTS.has(lineNum)) globalThis.EDITOR_BREAKPOINTS.delete(lineNum);
  else globalThis.EDITOR_BREAKPOINTS.add(lineNum);

  let breakpoints = view.state.field(breakpointState);
  let hasBreakpoint = false;
  breakpoints.between(pos, pos, () => {
    hasBreakpoint = true;
  });
  view.dispatch({
    effects: breakpointEffect.of({ pos, on: !hasBreakpoint }),
  });
}

const breakpointMarker = new (class extends GutterMarker {
  toDOM() {
    return document.createTextNode("🔴");
  }
})();

const breakpointGutter = [
  breakpointState,
  gutter({
    class: "cm-breakpoint-gutter",
    markers: (v) => v.state.field(breakpointState),
    initialSpacer: () => breakpointMarker,
    domEventHandlers: {
      mousedown(view, line) {
        toggleBreakpoint(view, line.from);
        return true;
      },
    },
  }),
  EditorView.baseTheme({
    ".cm-breakpoint-gutter .cm-gutterElement": {
      color: "red",
      paddingLeft: "1px",
      paddingTop: "1px",
      cursor: "pointer",
      "font-size": "0.7rem",
    },
  }),
];

export default breakpointGutter;
