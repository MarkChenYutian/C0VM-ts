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
      // Enforce synchronous between breakpointState and global var
      return RangeSet.empty;
    },

    update(set, transaction) {
      set = set.map(transaction.changes);

      for (let e of transaction.effects) {
        if (e.is(breakpointEffect)) {
          if (e.value.on) {
            // Add the breakpoint effect on specific line gutter
            set = set.update({ add: [breakpointMarker.range(e.value.pos)] });
          } else {
            // Remove the breakpoint effect on specific line gutter
            set = set.update({ filter: (from) => from !== e.value.pos });
          }    
        }
      }

      set.update({ filter: (from) => from <= transaction.state.doc.lines });
      return set;
    },
  });

function toggleBreakpoint(
  view: EditorView,
  pos: number,
  internal_state: StateField<RangeSet<GutterMarker>>,
  set_brkpnt: (n: number) => void
) {
  // update breakpoint positions
  set_brkpnt(view.state.doc.lineAt(pos).number);  // line number = pos + 1

  let breakpoints = view.state.field(internal_state);
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

const breakpointGutter = (set_breakpoint: (n: number) => void) => {
    return [
      breakpointState,

      gutter({
        class: "cm-breakpoint-gutter",
        markers: (v) => v.state.field(breakpointState),
        initialSpacer: () => breakpointMarker,
        domEventHandlers: {
          mousedown(view, line) {
            toggleBreakpoint(view, line.from, breakpointState, set_breakpoint);
            return true;
          }
        },
      }),

      EditorView.baseTheme({
        ".cm-breakpoint-gutter .cm-gutterElement": {
          paddingLeft: "1px",
          paddingTop: "1.5px",
          cursor: "pointer",
          fontSize: "0.6rem",
        },
      }),
  ];
}

export default breakpointGutter;
