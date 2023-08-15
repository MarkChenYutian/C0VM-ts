import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch, Modal, Button, Select } from "antd";
import React from "react";

export default class SettingPopup extends React.Component<SettingMenuProps> {
    render() {
        return <Modal
                title={<h3 style={{margin: "0"}}><FontAwesomeIcon icon={faGear}/> Settings</h3>}
                open ={this.props.app_state.settingMenuOn}
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
                    defaultChecked={this.props.app_state.CompilerFlags['d']}
                    onChange={() => {
                    this.props.set_app_state((state) => {
                        return {CompilerFlags: {...state.CompilerFlags,
                                                d: !state.CompilerFlags["d"]}
                                }
                    });
                }}/>

                <p>Expose Bytecode</p>
                <Switch size="small" style={{justifySelf: "right"}} defaultChecked={!this.props.app_state.c0_only} onChange={() => {this.props.set_app_state((state) => {return {c0_only: !state.c0_only}})}}/>

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
            </div>
        </Modal>
    }
}

