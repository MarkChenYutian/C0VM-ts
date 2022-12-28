import { StateField, StateEffect, RangeSet } from "@codemirror/state";
import { GutterMarker, gutter } from "@codemirror/view";
import { EditorView } from "@codemirror/view";

//ref: https://codemirror.net/examples/gutter/

const breakpointEffect = StateEffect.define<{ pos: number; on: boolean }>({
  map: (val, mapping) => {
    return { pos: mapping.mapPos(val.pos), on: val.on };
  },
});

function createBreakpointState(breakpoints: BreakPoint[], setBps: (ns: BreakPoint[]) => void) {
  return StateField.define<RangeSet<GutterMarker>>({
    create() {
      const currentBreakpoints = breakpoints.map(breakpoint => {
        return breakpointMarker.range(breakpoint.charPos);
      })

      return RangeSet.empty.update({ add: currentBreakpoints, sort: true })
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
      
      const newBps: BreakPoint[] = [];
      for (let p = set.iter(); p.value !== null; p.next()){
        newBps.push({charPos: p.from, line: transaction.state.doc.lineAt(p.from).number});
      }
      setBps(newBps);
      return set;
    }
  })
}



function toggleBreakpoint(
  view: EditorView,
  pos: number,
  internal_state: StateField<RangeSet<GutterMarker>>,
) {

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

const breakpointGutter: BreakpointExt = (props) => {
  const breakpointState = createBreakpointState(props.currBps, props.setBps);

  return [
    breakpointState,

    gutter({
      class: "cm-breakpoint-gutter",
      markers: (v) => v.state.field(breakpointState),
      initialSpacer: () => breakpointMarker,
      domEventHandlers: {
        mousedown(view, line) {
          toggleBreakpoint(view, line.from, breakpointState);
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
