import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import C0VM_RuntimeState from "../vm_core/exec/state";

export default class C0VMApplicationFooter extends React.PureComponent<{state: C0VMApplicationState}> {
    render() {
        const s = this.props.state.C0Runtime as (C0VM_RuntimeState | undefined);
        if (s === undefined) {
            return (
                <footer>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap"}}>
                        <p>V{globalThis.C0VM_VERSION} {globalThis.DEBUG ? "(Debug)" : ""}</p>
                        <p><FontAwesomeIcon icon={faXmark}/> Not Loaded</p>
                    </div>
                </footer>
            );
        } else if (s.state.CurrLineNumber === 0) {
            return (
                <footer>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap"}}>
                        <p>V{globalThis.C0VM_VERSION} {globalThis.DEBUG ? "(Debug)" : ""}</p>
                        <p><FontAwesomeIcon icon={faCheck}/> Loaded</p>
                    </div>
                </footer>
            );
        } else {
            return (
                <footer>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap"}}>
                        <p>V{globalThis.C0VM_VERSION} {globalThis.DEBUG ? "(Debug)" : ""}</p>
                        <p><FontAwesomeIcon icon={faCheck}/> Running: Line{s.state.CurrLineNumber} </p>
                    </div>
                </footer>
            );
        }
    }
}
