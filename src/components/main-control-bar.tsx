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


        return (
            <div className="main-control">
                <h3 className="unselectable">C0VM.<img src={tsLogo} style={{display: "inline-block", height: "1.2rem", marginBottom: "-0.1rem"}} alt="ts"/></h3>
                <div className="control-btn-group">
                    <button
                        className={"base-btn main-btn unselectable " + (this.props.isbc0 ? "disable-btn" : "")}
                        id="ctr-btn-compile"
                    >
                        <i className="fa-solid fa-screwdriver-wrench hide-in-mobile "></i> Compile
                    </button>
                    <button
                        className={"base-btn success-btn unselectable " + (this.props.isbc0 ? "" : "disable-btn")}
                        id="ctr-btn-step"
                        onClick={step_c0runtime}
                    >
                        <i className="fas fa-step-forward hide-in-mobile"></i> Step
                    </button>
                    <button
                        className={"base-btn success-btn unselectable " + (this.props.isbc0 ? "" : "disable-btn")}
                        id="ctr-btn-run"
                        onClick={run_c0runtime}
                    >
                        <i className="fas fa-fast-forward hide-in-mobile"></i> Run
                    </button>
                    <button
                        className="base-btn danger-btn unselectable"
                        id="ctr-btn-restart"
                        onClick={restart_c0runtime}
                    >
                        <i className="fas fa-undo hide-in-mobile"> </i> Restart
                    </button>
                </div>
            </div>
        );
    }
}
