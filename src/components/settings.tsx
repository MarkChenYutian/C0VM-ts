import { faAngleDown, faAngleRight, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch, Modal, Button, Select } from "antd";
import React from "react";

export default class SettingPopup extends React.Component<SettingMenuProps> {
    render() {
        return <Modal
                title={<h3 style={{margin: "0"}}><FontAwesomeIcon icon={faGear}/> Settings</h3>}
                open ={this.props.state.settingMenuOn}
                closable={false}
                centered
                footer  ={[
                    <Button
                        type="primary"
                        onClick={() => this.props.set_app_state({settingMenuOn: false})}
                    >Apply</Button>
                ]}
                style={{maxHeight: "80vh", overflowY: "auto"}}
                >
            <div className="settings-grid">
                <p>Contract Check (<code>-d</code> Flag)</p>
                <Switch
                    size="small"
                    style={{justifySelf: "right"}} 
                    defaultChecked={this.props.state.CompilerFlags['d']}
                    onChange={() => {
                    this.props.set_app_state((state) => {
                        return {CompilerFlags: {...state.CompilerFlags,
                                                d: !state.CompilerFlags["d"]}
                                }
                    });
                }}/>

                <p>Expose Bytecode</p>
                <Switch size="small" style={{justifySelf: "right"}} defaultChecked={!this.props.state.c0_only} onChange={() => {this.props.set_app_state((state) => {return {c0_only: !state.c0_only}})}}/>

                <p>AutoStep Speed</p>
                <Select
                    size="small"
                    defaultValue={globalThis.AUTOSTEP_INTERVAL}
                    options={[
                        {value: "Fast", label: "Fast (0.5 s)"},
                        {value: "Slow", label: "Slow (1.5 s)"}
                    ]}
                    onChange={
                        (value: string) => {
                            if (value === "Fast" || value === "Slow") globalThis.AUTOSTEP_INTERVAL = value;
                        }
                    }
                />

                <p>Reset Tutorial Page</p>
                <Button 
                    size="middle"
                    onClick={() => {
                        localStorage.clear();
                        globalThis.MSG_EMITTER.ok("Tutorial Page Reset Success", "Refresh this webpage and the tutorial will pop up!")
                    }}
                >Reset Tutorial</Button>

                <AdvancedSetting {...this.props}/>
            </div>
        </Modal>
    }
}


class AdvancedSetting extends React.Component<
    SettingMenuProps,
    {expand: boolean}
> {
    constructor(props: SettingMenuProps){
        super(props);
        this.state = {expand: false};
    }
    render(): React.ReactNode {
        if (this.state.expand) {
            return <>
            <h3 onClick={() => {this.setState({expand: false})}} className="dbg-entire-row">
                <FontAwesomeIcon icon={faAngleDown}/> Advanced Settings
            </h3>
            <p>Debug Mode</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={DEBUG} onChange={() => {DEBUG = !DEBUG}}/>
            <p>Debug - Dump Step</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={DEBUG_DUMP_STEP} onChange={() => {DEBUG_DUMP_STEP = !DEBUG_DUMP_STEP}}/>
            <p>Debug - Dump Heap</p> <Switch size="small" style={{justifySelf: "right"}} defaultChecked={DEBUG_DUMP_MEM} onChange={() => {DEBUG_DUMP_MEM = !DEBUG_DUMP_MEM}}/>
            </>;
        } else {
            return <h3 onClick={() => {this.setState({expand: true})}}>
                <FontAwesomeIcon icon={faAngleRight}/> Advanced Settings
            </h3>;
        }
    }
}
