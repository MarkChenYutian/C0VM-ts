/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @description The Root component of the Debug Console, provides switching between tabular
 * debug console and graphical debug console.
 */
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight, faList, faCodeMerge, faBug, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter, faTable } from "@fortawesome/free-solid-svg-icons";

import { Result, Segmented, Button, Space } from "antd";

import TabularDebugEvaluation from "./tabular_debugger";
import GraphicalDebugEvaluation from "./graphical_debugger";
import DetailDebugEvaluation from "./detail_debugger";

export default class DebugConsole extends React.Component
<
    DebugConsoleProps,
    DebugConsoleState
> {
    constructor(props: DebugConsoleProps) {
        super(props);
        this.state = {
            err: false,
            show: true,
            mode: "Graph"
        };
    }

    render_no_valid_state() {
        return (
            <Result
                status="info"
                subTitle="There is no currently executing program"
                className="debug-console-info"
            />
        )
    }

    resolve_render_view(typedef: Map<SourceType, AliasType>): React.ReactNode {
        if (this.state.show === false) return null;
        const S = this.props.state;
        if (S === undefined) return this.render_no_valid_state();
        switch (this.state.mode) {
            case "Table": return <TabularDebugEvaluation   state={S.state} mem={S.allocator} cnt={S.step_cnt} typedef={typedef}/>;
            /*
             * We add a key to this functional component since we want it to create a new component everytime the
             * VM is "stepped" (VM execution position changed).
             * 
             * Using useEffect React Hook cannot properly update the flow chart and will lead to missing edges.
             * This might be related to the issue:
             * 
             * https://github.com/wbkd/react-flow/issues/3171
             * 
             * case "Graph": return <GraphicalDebugEvaluation state={S.state} mem={S.allocator} cnt={S.step_cnt} typedef={typedef}/>;
             */
            case "Graph": return <GraphicalDebugEvaluation state={S.state} mem={S.allocator} cnt={S.step_cnt} typedef={typedef} key={S.step_cnt.toString()}/>;
            case "Detail": return <DetailDebugEvaluation   state={S.state} mem={S.allocator} cnt={S.step_cnt} typedef={typedef}/>;
        }
    }

    render() {
        if (this.state.err) {
            // Set tag for MS Clarity session for bug tracking purpose
            if (window.clarity !== undefined) {
                window.clarity("set", "VM Error", "Debugger Crashed");
            }
            return (
                <div id="c0vm-debug-console" className="debug-console-box">
                    <h3 onClick={() => this.setState((state) => { return { show: !state.show } })}>
                        <FontAwesomeIcon icon={faBug} />
                        {" Debug Console "}
                        {this.state.show ? <FontAwesomeIcon icon={faAngleDown} /> : <FontAwesomeIcon icon={faAngleRight} />}
                    </h3>
                    {this.state.show ?
                        <Result
                            className="debug-console-info"
                            status="error"
                            title="Debugger Crashed!"
                            extra={[
                                <Button key="reload" size="large" type="primary" onClick={() => this.setState({ err: false, mode: "Table" })}>
                                    Reload Debugger
                                </Button>,
                                <a key="report" href="https://docs.google.com/forms/d/e/1FAIpQLSezT1KhMgCNw0Uuk2nnqQnDtYlpXvbYnQW7VEef9xN759APYA/viewform?usp=sf_link" target="_blank" rel="noreferrer">
                                    <Button size="large">
                                        Report Problem
                                    </Button>
                                </a>
                            ]}
                        /> : null
                    }
                </div>);
        }

        const toggle_full_screen = <Button
            icon={<FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter}/>}
            type="default"
            onClick={() => {this.props.setFullScreen(true);}}
        />;

        const exit_full_screen = <Button
            icon={<FontAwesomeIcon icon={faDownLeftAndUpRightToCenter}/>}
            onClick={() => {this.props.setFullScreen(false);}}
        />

        const full_screen_btn = (this.props.isFullScreen) ? exit_full_screen : toggle_full_screen;

        const selector_option = this.props.c0_only ?  
                                    [{
                                        label: "Table", value: "Table",
                                        icon: <FontAwesomeIcon icon={faList} />
                                    }, {
                                        label: "Graph", value: "Graph",
                                        icon: <FontAwesomeIcon icon={faCodeMerge} />
                                    }] : 
                                    [{
                                        label: "Table", value: "Table",
                                        icon: <FontAwesomeIcon icon={faList} />
                                    }, {
                                        label: "Graph", value: "Graph",
                                        icon: <FontAwesomeIcon icon={faCodeMerge} />
                                    }, {
                                        label: "Detail", value: "Detail",
                                        icon: <FontAwesomeIcon icon={faTable} />
                                    }];
        
        const typedef = this.props.state?.typedef ?? new Map();
        const revTypedef = new Map<string, string>();
        typedef.forEach((source, alias) => {revTypedef.set(source, alias)});
        
        return (
            <div id="c0vm-debug-console" className={ this.state.show ? "debug-console-box" : "" }>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h3 onClick={() => this.setState((state) => { return { show: !state.show } })}>
                        <FontAwesomeIcon icon={faBug} />
                        {" Debug Console "}
                        {this.state.show ? <FontAwesomeIcon icon={faAngleDown} /> : <FontAwesomeIcon icon={faAngleRight} />}
                    </h3>
                    {
                        this.state.show ?
                            <Space>
                                {full_screen_btn}
                                <Segmented
                                    options={selector_option}
                                    defaultValue={this.state.mode}
                                    onChange={(value) => { this.setState({ mode: value as "Table" | "Graph" | "Detail" }) }}
                                />
                            </Space>
                            : null
                    }
                </div>
                {this.resolve_render_view(revTypedef)}
            </div>
        )
    }

    componentDidCatch(e: Error) {
        globalThis.MSG_EMITTER.err(
            "Debugger Crashed!",
            e.name + ": " + e.message
        );
        this.setState({ err: true });
    }
}

