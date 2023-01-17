import React from "react";
import AutosizeInput from 'react-18-input-autosize';

export default class EditableTab extends React.Component<EditableTabProps, EditableTabState> {

    constructor(props: EditableTabProps) {
        super(props);
        this.state = {
            title: props.title,
            being_edited: false,
            wip_title: "",
        };
        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.startEditing = this.startEditing.bind(this);
        this.stopEditing = this.stopEditing.bind(this);    
    }

    componentDidUpdate(prevProps: EditableTabProps) {
        if (this.props.title !== prevProps.title) {
            this.setState({title: this.props.title})
        }
    }
    
    onChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        this.setState({wip_title: e.target.value});
    }

    onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            this.stopEditing();
        }
    }

    startEditing() {
        this.setState({wip_title: this.state.title});
        this.setState({being_edited: true});
    }

    async stopEditing() {
        await this.props.updateName(this.props.editor_key, this.state.wip_title);
        this.setState({
            being_edited: false,
            title: this.props.title,    // update display title
            wip_title: this.state.title // resets title if updateName fails
        });
    }

    render() {
        if (!this.state.being_edited) {
            return (
                <span onDoubleClick={this.startEditing}>{this.state.title}</span>
            );
        } else {
            return (
                    <AutosizeInput 
                        className="tab-name"
                        type="text" 
                        value={this.state.wip_title}
                        onChange={this.onChange} 
                        onKeyDown={this.onKeyDown}
                        onBlur={this.stopEditing}
                        autoFocus
                    ></AutosizeInput>
            );
        }
    }
}