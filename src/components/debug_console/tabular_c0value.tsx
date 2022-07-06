import React from "react";

import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { c0_cvt2_js_value } from "../../vm_core/utility/c0_value";
import { isNullPtr, read_ptr, shift_ptr } from "../../vm_core/utility/pointer_ops";
import { loadString } from "../../vm_core/utility/string_utility";

export default class C0ValueTabularDisplay extends React.Component<
    C0ValueTabularDisplayProps,
    {expand: boolean}
> {
    constructor(props: C0ValueTabularDisplayProps) {
        super(props);
        this.state = {expand: false}
    }

    render_array() {
        if (isNullPtr(this.props.value.value)) {
            return <p>NULL</p>
        }
        if (!this.state.expand) {
            return <p onClick={() => this.setState({expand: true})} className="clickable" >
                <button className="implicit-btn">
                    <FontAwesomeIcon icon={faCaretRight}/>
                </button>
                Array [...]
            </p>
        }
        const vals = expandArrayValue(this.props.mem, this.props.value as C0Value<"ptr">);
        const content = [];
        for (let i = 0; i < vals.length; i ++) {
            content.push(
                <li key={i + "-exp-value"}><C0ValueTabularDisplay mem={this.props.mem} value={vals[i]} typeRecord={this.props.typeRecord}/></li>
            );
        }
        return (
            <div>
                <button className="implicit-btn dbg-evaluate-tabular-btn" onClick={() => this.setState({expand: false})}>
                <FontAwesomeIcon icon={faCaretDown}/>
                </button>
                <div className="dbg-evaluate-tabular-content">
                    Array [
                    <ul>
                            {content}
                    </ul>
                    ]
                </div>
            </div>
        );
    }

    render_pointer() {
        if (isNullPtr(this.props.value.value)) {
            return <p className="dbg-evaluate-tabular-content">NULL</p>
        }
        if (!this.state.expand) {
            return (
                <p onClick={() => this.setState({expand: true})} className="clickable" >
                    <button className="implicit-btn">
                        <FontAwesomeIcon icon={faCaretRight}/>
                    </button>
                    Pointer (...)
                </p>
            );
        }

        if (this.props.value.type.type === "<unknown>") {
            return (
            <div>
                <button className="implicit-btn dbg-evaluate-tabular-btn" onClick={() => this.setState({expand: false})}>
                    <FontAwesomeIcon icon={faCaretDown}/>
                </button>
                <div className="dbg-evaluate-tabular-content">
                    Pointer (
                    <p>Can't expend &lt;unknown&gt; type</p>
                    )
                </div>
            </div>);
        }
        // Special cases above! Here's the actual rendering:

        const [addr, offset, ] = read_ptr(this.props.value.value);

        // Well... struct is really special here.
        /**
         * Since we will traverse over all the field with type information in a struct,
         * we need to be able to make pointer shift within the struct.
         * 
         * This means that we can't dereference the value and passed it right into the struct.
         * 
         * Instead, we will need to pass the pointer points to the start of struct and allow 
         * next level of C0ValueTabularDisplay component to perform pointer arithemtic on it.
         */
        if (this.props.value.type.type === "ptr") {
            const subType = this.props.value.type.value as C0Type<C0TypeClass>;
            if (subType.type === "ptr" && subType.kind === "struct") {
                return (
                    <div>
                        <button className="implicit-btn" onClick={() => this.setState({expand: false})}>
                            <FontAwesomeIcon icon={faCaretDown}/>
                        </button>
                        <div className="dbg-evaluate-tabular-content">
                            Pointer ( <span className="dbg-extra-information">0x{(addr + offset).toString(16).padStart(8, "0").toUpperCase()}</span>
                                <C0ValueTabularDisplay mem={this.props.mem} value={{type: subType, value: this.props.value.value}} typeRecord={this.props.typeRecord}/>
                            )
                        </div>
                    </div>
                );
            }
        }
        const deref_value = derefValue(this.props.mem, this.props.value as C0Value<"ptr">);
        return (
            <div>
                <button className="implicit-btn dbg-evaluate-tabular-btn" onClick={() => this.setState({expand: false})}>
                    <FontAwesomeIcon icon={faCaretDown}/>
                </button>
                <div className="dbg-evaluate-tabular-content">
                    Pointer ( <span className="dbg-extra-information">0x{(addr + offset).toString(16).padStart(8, "0").toUpperCase()}</span>
                        <ul>
                            <li>
                                <C0ValueTabularDisplay mem={this.props.mem} value={deref_value} typeRecord={this.props.typeRecord}/>
                            </li>
                        </ul>
                    )
                </div>
            </div>
        );
    }

    render_struct() {
        if (isNullPtr(this.props.value.value)) {
            return <p>NULL</p>;
        }

        const ValueType = this.props.value.type as C0Type<"ptr">;
        const ValueValue = this.props.value.value;
        if (ValueType.kind === "struct") {
            const StructInformation = this.props.typeRecord.get(ValueType.value);
            if (StructInformation === undefined) {
                return <p className="dbg-error-information">No Struct Information</p>;
            }

            const StructFields: JSX.Element[] = [];

            StructInformation.forEach(
                (value, key) => {
                    /**
                     * We shift the pointer to the field of struct we want to evaluate
                     * 
                     * Then we passed in the dereferenced value into <C0ValueTabularDisplay ... /> 
                     * component to evaluate it recursively.
                     */
                    let ptr_to_field: C0Value<Maybe<"ptr">> = {
                        value: shift_ptr(ValueValue, key),
                        type: value.type === undefined ? {type: "<unknown>"} : {type: "ptr", kind: "ptr", value: value.type}
                    };

                    const field_name = value.name === undefined ?
                        <p className="dbg-evaluate-field-name"> Offset @ {key} :&nbsp;</p> : 
                        <p className="dbg-evaluate-field-name"> {value.name} :&nbsp;</p>;

                    if (ptr_to_field.type.type === "ptr") {
                        StructFields.push(
                            <li key={key}>
                                {field_name}
                                <div className="dbg-evalute-tabular-content">
                                    <C0ValueTabularDisplay value={derefValue(this.props.mem, ptr_to_field as C0Value<"ptr">)} mem={this.props.mem} typeRecord={this.props.typeRecord}/>
                                </div>
                            </li>
                        );   
                    } else {
                        StructFields.push(
                            <li key={key}>
                                <p className="dbg-evaluate-tabular-btn"> {value.name} :&nbsp;</p>
                                <p className="dbg-evaluate-tabular-content dbg-error-information">No Type Information</p>
                            </li>
                        )
                    }
                }
            );

            return (
                <div style={{marginTop: "0.3rem"}}>
                    <>
                    <code>{(this.props.value.type as C0Type<"ptr">).value as string}</code>
                    <ul>
                        {StructFields}
                    </ul>
                    </>
                </div>
            );
        }
        return <p className="dbg-error-information">Failed to render value. (Internal Err)</p>
    }

    render(): React.ReactNode {
        if (this.props.value.type.type === "value") {
            switch (this.props.value.type.value) {
                case "bool":
                case "int":
                    return <p>{"" + c0_cvt2_js_value(this.props.value as C0Value<"value">)}</p>
                case "char":
                    return <p>'{c0_cvt2_js_value(this.props.value as C0Value<"value">)}'</p>
            }
        }
        if (this.props.value.type.type === "string") {
            return <p>"{loadString(this.props.value as C0Value<"string">, this.props.mem)}"</p>
        }
        if (this.props.value.type.type === "<unknown>") {
            return <p>Can't evaluate &lt;unknown&gt; type</p>
        }
        switch (this.props.value.type.kind) {
            case "arr":
                return this.render_array();
            case "ptr":
                return this.render_pointer();
            case "struct":
                return this.render_struct();
        }
    }
}


function expandArrayValue(
    mem: C0HeapAllocator,
    V: C0Value<"ptr">
): C0Value<C0TypeClass>[] {
    const [addr, , block_size] = read_ptr(V.value);
    const block = mem.deref(V.value);
    const elem_size = block.getInt32(0);
    const result = [];
    const childType = V.type.value as C0Type<C0TypeClass>
    if (childType.type === "value") {
        for (let offset = 4; offset < block_size; offset += elem_size) {
            switch (childType.value) {
                case "bool":
                case "char":
                    result.push({
                        value: new DataView(
                            new Uint8Array([0, 0, 0, block.getUint8(offset)]).buffer
                        ),
                        type: childType,
                    });
                    break;
                case "int":
                    result.push({
                        value: new DataView(
                            new Uint8Array([
                                block.getUint8(offset), block.getUint8(offset + 1), block.getUint8(offset + 2), block.getUint8(offset + 3)
                            ]).buffer
                        ),
                        type: childType,
                    });
                    break;
            }
        }
    } else {
        for (let offset = 4; offset < block_size; offset += elem_size) {
            result.push({
                value: new DataView(block.buffer.slice(
                    addr + offset,
                    addr + offset + elem_size
                )),
                type: childType,
            });
        }
    }
    return result;
}

function derefValue(mem: C0HeapAllocator, V: C0Value<"ptr">): C0Value<C0TypeClass> 
{
    const block = mem.deref(V.value);
    const childType = V.type.value as C0Type<C0TypeClass>;
    if (childType.type === "value") {
        switch (childType.value) {
            case "bool":
            case "char":
                return {
                    type: childType,
                    value: new DataView(
                        new Uint8Array([0, 0, 0, block.getUint8(0)]).buffer
                    ),
                };
            case "int":
                return {
                    type: childType,
                    value: block,
                };
        }
    }
    if (childType.type === "string" || childType.type === "ptr") {
        return {
            type: childType,
            value: new DataView(
                block.buffer.slice(block.byteOffset, block.byteOffset + 8)
            ),
        };
    }
    return {
        type: childType,
        value: new DataView(
            block.buffer.slice(
                block.byteOffset,
                block.byteOffset + block.byteLength
            )
        ),
    };
}
