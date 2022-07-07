import { faPlay, faScrewdriverWrench, faStepForward, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import tsLogo from "../assets/ts-logo-128.svg";
import * as VM from "../vm_core/vm_interface";



export default class MainControlBar extends React.Component<MainControlProps, {}>{
    render() {

        const step_c0runtime = () => {
            const [new_runtime, can_continue] = VM.step(
                (this.props.curr_state === undefined ?
                VM.initialize(this.props.curr_content, this.props.clear_print) : this.props.curr_state),
                this.props.update_print
            );
    
            if (!can_continue) this.props.update_state(undefined);
            else this.props.update_state(new_runtime);
        }

        const run_c0runtime = () => {
            const [new_runtime, can_continue] = VM.run(
                (this.props.curr_state === undefined ? 
                VM.initialize(this.props.curr_content, this.props.clear_print) : this.props.curr_state),
                this.props.update_print
            );
    
            if (!can_continue) this.props.update_state(undefined);
            else this.props.update_state(new_runtime);
        }

        const restart_c0runtime = () => {
            this.props.clear_print();
            this.props.update_state(VM.initialize(this.props.curr_content, this.props.clear_print));
        };

        const remote_compile = () => {
            globalThis.MSG_EMITTER.warn("Not Implemented Yet", "We haven't implement this feature yet.");
        };


        return (
            <div className="main-control">
                <h3 className="unselectable">C0VM.<img src={tsLogo} style={{display: "inline-block", height: "1.2rem", marginBottom: "-0.1rem"}} alt="ts"/></h3>
                <div className="control-btn-group">
                    <button
                        className={"base-btn main-btn unselectable " + (this.props.isbc0 ? "disable-btn" : "")}
                        id="ctr-btn-compile"
                        onClick={remote_compile}
                    >
                        <FontAwesomeIcon icon={faScrewdriverWrench} className="hide-in-mobile"/> {" Compile "}
                    </button>
                    <button
                        className={"base-btn success-btn unselectable " + (this.props.isbc0 ? "" : "disable-btn")}
                        id="ctr-btn-step"
                        onClick={step_c0runtime}
                    >
                        <FontAwesomeIcon icon={faStepForward} className="hide-in-mobile"/>{" Step "}
                    </button>
                    <button
                        className={"base-btn success-btn unselectable " + (this.props.isbc0 ? "" : "disable-btn")}
                        id="ctr-btn-run"
                        onClick={run_c0runtime}
                    >
                        <FontAwesomeIcon icon={faPlay} className="hide-in-mobile"/>{" Run "}
                    </button>
                    <button
                        className="base-btn danger-btn unselectable"
                        id="ctr-btn-restart"
                        onClick={restart_c0runtime}
                    >
                        <FontAwesomeIcon icon={faUndo} className="hide-in-mobile"/>{" Restart "}
                    </button>
                </div>
            </div>
        );
    }
}
