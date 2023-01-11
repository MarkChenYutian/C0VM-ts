/**
 * @author Yutian Chen <yutianch@andrew.cmu.edu>
 * @description Warning! This is a very very lengthy and verbose file that is written in several 
 * days so it will be hard to get it in a simple glimpse. (And there are also some edge cases 
 * we must handle specifically, making it even more lengthy)
 * 
 * @abstract The file implements a React component called C0ValueTabularDisplay which **recursively** 
 * renders the C0Value passed in in the props as "value" using lazy-evaluation.
 */

import React from "react";

import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { isNullPtr, read_ptr, render_address } from "../../../utility/pointer_utility";
import { loadString } from "../../../utility/string_utility";

import { deref_C0Value, expand_C0Array, expand_C0Struct, c0_value_cvt2_js_string } from "../../../utility/c0_value_utility";
import { isPointerType, isStringType, isTagPointerType, isUnknownType, isValueType, is_struct_pointer, Type2String } from "../../../utility/c0_type_utility";
import { read_tagptr, remove_tag } from "../../../utility/tag_ptr_utility";

export default class C0ValueTabularDisplay extends React.Component<
    C0ValueTabularDisplayProps,
    { expand: boolean }
> {
    constructor(props: C0ValueTabularDisplayProps) {
        super(props);
        this.state = { expand: props.default_expand }
    }

    /**
     * Render a C0Value by expanding the values in array in heap memory space and 
     * return a list of <C0ValueTabularDisplay/> components.
     * 
     * @returns The rendering of array value in C0 Value
     */
    render_array(value_to_render: C0Value<"ptr">) {
        if (isNullPtr(value_to_render.value)) {
            // In C0 language, the uninitialized array is recognized as an empty array.
            return <p>[]</p>
        }
        if (!this.state.expand) {
            return <p onClick={() => this.setState({ expand: true })} className="clickable" >
                <button className="implicit-btn">
                    <FontAwesomeIcon icon={faCaretRight} />
                </button>
                Array [...]
            </p>
        }
        const vals = expand_C0Array(this.props.mem, value_to_render);
        const content = [];

        for (let i = 0; i < vals.length; i++) {
            content.push(
                <li key={i + "-exp-value"}>
                    <C0ValueTabularDisplay
                        mem={this.props.mem}
                        value={vals[i]}
                        typeRecord={this.props.typeRecord}
                        typedef={this.props.typedef}
                        tagRecord={this.props.tagRecord}
                        default_expand={false}
                    />
                </li>
            );
        }

        const [addr, offset,] = read_ptr(value_to_render.value);

        return (
            <div>
                <button className="implicit-btn dbg-evaluate-tabular-btn" onClick={() => this.setState({ expand: false })}>
                    <FontAwesomeIcon icon={faCaretDown} />
                </button>
                <div className="dbg-evaluate-tabular-content">
                    Array [ <span className="dbg-extra-information">0x{render_address(addr + offset, 8)}</span>
                    <ul>
                        {content}
                    </ul>
                    ]
                </div>
            </div>
        );
    }

    /**
     * Evaluate and render a pointer value by tracing into the heap memory
     * space and return a <C0ValueTabularDisplay/>.
     * 
     * @returns The rendered GUI of the Pointer value
     */
    render_pointer(value_to_render: C0Value<"ptr">, is_tagged: boolean) {
        if (isNullPtr(value_to_render.value)) {
            return <p className="dbg-evaluate-tabular-content">NULL</p>
        }

        let descriptor = <span>Pointer</span>
        if (is_tagged) {
            descriptor = <span>Tagged Pointer <code>{ Type2String(value_to_render.type, this.props.typedef) }</code></span>;
        }

        // When the component is not expended, show Pointer(...)
        if (!this.state.expand) {
            return (
                <p onClick={() => this.setState({ expand: true })} className="clickable" >
                    <button className="implicit-btn">
                        <FontAwesomeIcon icon={faCaretRight} />
                    </button>
                    {descriptor} (...)
                </p>
            );
        }

        const [addr, offset,] = read_ptr(value_to_render.value);

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
        if (isPointerType(value_to_render) && is_struct_pointer(value_to_render)) {
            return (
                <div>
                    <button className="implicit-btn" onClick={() => this.setState({ expand: false })}>
                        <FontAwesomeIcon icon={faCaretDown} />
                    </button>
                    <div className="dbg-evaluate-tabular-content">
                        {descriptor} ( <span className="dbg-extra-information">0x{render_address(addr + offset, 8)}</span>
                        <C0ValueTabularDisplay
                            mem={this.props.mem}
                            value={{ type: value_to_render.type.value, value: value_to_render.value }}
                            typeRecord={this.props.typeRecord}
                            typedef={this.props.typedef}
                            tagRecord={this.props.tagRecord}
                            default_expand={false}
                        />
                        )
                    </div>
                </div>
            );
        }

        /** 
         * Otherwise, we only dereference the value and send it into a child <C0ValueTabularDisplay/>
         * so that values are rendered recursively.
         */
        const deref_value = deref_C0Value(this.props.mem, value_to_render);
        return (
            <div>
                <button className="implicit-btn dbg-evaluate-tabular-btn" onClick={() => this.setState({ expand: false })}>
                    <FontAwesomeIcon icon={faCaretDown} />
                </button>
                <div className="dbg-evaluate-tabular-content">
                    {descriptor} ( <span className="dbg-extra-information">0x{render_address(addr + offset, 8)}</span>
                    <ul>
                        <li>
                            <C0ValueTabularDisplay
                                mem={this.props.mem}
                                value={deref_value}
                                typedef={this.props.typedef}
                                typeRecord={this.props.typeRecord}
                                tagRecord={this.props.tagRecord}
                                default_expand={false}
                            />
                        </li>
                    </ul>
                    )
                </div>
            </div>
        );
    }

    /**
     * Render the struct value by reading global TypeRecord in state and go to
     * the heap memory to evaluate each field.
     * 
     * @returns A rendered struct C0Value Component
     */
    render_struct(value_to_render: C0Value<"ptr">) {
        if (isNullPtr(value_to_render.value)) {
            return <p>NULL</p>;
        }

        const fields = expand_C0Struct(
            this.props.mem,
            this.props.typeRecord,
            {
                value: value_to_render.value,
                type: { type: "ptr", kind: "ptr", value: value_to_render.type }
            }
        );

        if (fields.length === 0) {
            return <p className="dbg-error-information">No Struct Information</p>;
        }

        const StructFields: JSX.Element[] = [];

        for (let i = 0; i < fields.length; i++) {
            const entry = fields[i];
            const field_name = <p className="dbg-evaluate-field-name"> {entry.name ?? `Offset @ ${entry.offset}`}:&nbsp;</p>;
            if (entry.value === undefined) {
                StructFields.push(
                    <li key={entry.offset}>
                        {field_name}
                        <p className="dbg-evaluate-tabular-content dbg-error-information">No Type Info</p>
                    </li>
                )
            } else {
                StructFields.push(
                    <li key={entry.offset}>
                        {field_name}
                        <div className="dbg-evaluate-tabular-content">
                            <C0ValueTabularDisplay
                                value={entry.value}
                                mem={this.props.mem}
                                typedef={this.props.typedef}
                                typeRecord={this.props.typeRecord}
                                tagRecord={this.props.tagRecord}
                                default_expand={false}
                            />
                        </div>
                    </li>
                );
            }
        }

        return (
            <div style={{ marginTop: "0.3rem" }}>
                <code>{Type2String((value_to_render.type).value, this.props.typedef)}</code>
                <ul>
                    {StructFields}
                </ul>
            </div>
        );
    }

    /**
     * Render the tagged pointer value by showing tag and the contained actual
     * pointer.
     * 
     * @returns A rendered tagged pointer component
     */
    render_tagptr(value_to_render: C0Value<"tagptr">){
        if (isNullPtr(value_to_render.value)) {
            return <p className="dbg-evaluate-tabular-content">NULL</p>;
        }
        const real_ptr = remove_tag(value_to_render, this.props.mem, this.props.tagRecord);
        return this.render_pointer(real_ptr, true);
    }

    render(): React.ReactNode {
        if (isValueType(this.props.value)) {
            return <p>{c0_value_cvt2_js_string(this.props.value)}</p>
        }
        else if (isStringType(this.props.value)) {
            return <p>"{loadString(this.props.value, this.props.mem)}"</p>
        }
        else if (isUnknownType(this.props.value)) {
            return <p className="dbg-error-information">Can't evaluate &lt;unknown&gt; type</p>
        }
        else if (isTagPointerType(this.props.value)) {
            return this.render_tagptr(this.props.value);
        } 
        else if (isPointerType(this.props.value)) {
            switch (this.props.value.type.kind) {
                case "arr":
                    return this.render_array(this.props.value);
                case "ptr":
                    return this.render_pointer(this.props.value, false);
                case "struct":
                    return this.render_struct(this.props.value);
            }
        }
    }
}

