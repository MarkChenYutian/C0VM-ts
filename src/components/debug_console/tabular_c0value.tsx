import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Type2String } from "../../vm_core/types/c0type_utility";
import { c0_cvt2_js_value } from "../../vm_core/utility/c0_value";
import { isNullPtr, read_ptr } from "../../vm_core/utility/pointer_ops";
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
                <span onClick={() => this.setState({expand: false})} className="clickable">
                    <button className="implicit-btn">
                    <FontAwesomeIcon icon={faCaretDown}/>
                    </button>
                    Array [
                </span>
                <ul>
                        {content}
                </ul>]
            </div>
        );
    }

    render_pointer() {
        if (isNullPtr(this.props.value.value)) {
            return <p>NULL</p>
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
        const deref_value = derefValue(this.props.mem, this.props.value as C0Value<"ptr">);

        return (
            <div>
                <span onClick={() => this.setState({expand: false})} className="clickable">
                    <button className="implicit-btn">
                    <FontAwesomeIcon icon={faCaretDown}/>
                    </button>
                    Pointer (
                </span>
                    <ul>
                        <li><C0ValueTabularDisplay mem={this.props.mem} value={deref_value} typeRecord={this.props.typeRecord}/></li>
                    </ul>
                )
            </div>
        );
    }

    render_struct() {
        const ValueType = this.props.value.type as C0Type<"ptr">;
        if (ValueType.kind === "struct") {
            const StructInformation = this.props.typeRecord.get(ValueType.value);
            if (StructInformation === undefined) return <p>No Struct Information</p>
            const StructFields: JSX.Element[] = [];
            StructInformation.forEach(
                (value, key) => {
                    StructFields.push(<li key={key}>Offset {key} : {Type2String(value)}</li>)
                }
            );
            return <ul>
                {StructFields}
            </ul>
        }
        return <p>No Sutrct Information</p>
    }

    render(): React.ReactNode {
        if (this.props.value.type.type === "value") {
            switch (this.props.value.type.value) {
                case "bool":
                case "int":
                    return <p>{c0_cvt2_js_value(this.props.value as C0Value<"value">)}</p>
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
