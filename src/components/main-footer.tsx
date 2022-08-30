import { faCheck, faGear, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import C0VM_RuntimeState from "../vm_core/exec/state";

export default class C0VMApplicationFooter extends React.PureComponent<{state: C0VMApplicationState, open_setting: () => void}> {
    render() {
        const s = this.props.state.C0Runtime as (C0VM_RuntimeState | undefined);
        let vm_indicator;
        if (s === undefined) {
            vm_indicator = <p><FontAwesomeIcon icon={faXmark}/> Not Loaded</p>
        } else if (s.state.CurrLineNumber === 0) {
            vm_indicator = <p><FontAwesomeIcon icon={faCheck}/> Loaded</p>
        } else if (this.props.state.C0Running) {
            vm_indicator = <p><FontAwesomeIcon icon={faSpinner} spin/> Executing</p>
        } else {
            vm_indicator = <p><FontAwesomeIcon icon={faCheck}/> Running: Line{s.state.CurrLineNumber}</p>;
        }

        return (
            <footer>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap"}}>
                    <div style={{display: "flex", gap: ".3rem", alignItems: "center"}}>
                        <span>V{globalThis.C0VM_VERSION} {globalThis.DEBUG ? "(Debug)" : ""}</span>
                        <button className="implicit-btn" onClick={this.props.open_setting}><FontAwesomeIcon icon={faGear}/></button>
                    </div>
                    {vm_indicator}
                </div>
            </footer>
        );
    }
}
