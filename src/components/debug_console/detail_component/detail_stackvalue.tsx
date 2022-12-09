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

import { isNullPtr, read_ptr, render_address } from "../../../utility/pointer_utility";
import { loadString } from "../../../utility/string_utility";

import { c0_value_cvt2_js_string } from "../../../utility/c0_value_utility";
import { isPointerType, isStringType, isUnknownType, isValueType, getType, castToType } from "../../../utility/c0_type_utility";


export default class C0ValueStackDisplay extends React.Component<
    C0ValueTabularDisplayProps,
    {expand: boolean}
> {
    constructor(props: C0ValueTabularDisplayProps) {
        super(props);
        this.state = {expand: props.default_expand}
    }

    /**
     * Render a C0Value by expanding the values in array in heap memory space and 
     * return a list of <C0ValueTabularDisplay/> components.
     * 
     * @returns The rendering of array value in C0 Value
     */
    render_array(v : C0Value<C0TypeClass>) {
    if (isNullPtr(v.value)) {
        // In C0 language, the uninitialized array is recognized as an empty array.
        return <p>[]</p>
    }

    const [addr, offset, ] = read_ptr(v.value);
    return <p>
        Array [...] <span className="dbg-extra-information">0x{render_address(addr + offset, 8)} = 0x{render_address(addr, 4)} + 0x{render_address(offset, 4)}</span>
    </p>
    }

    /**
     * Evaluate and render a pointer value by tracing into the heap memory
     * space and return a <C0ValueTabularDisplay/>.
     * 
     * @returns The rendered GUI of the Pointer value
     */
    render_pointer(v : C0Value<C0TypeClass>) {
    // We can't expand pointer in stack value
    if (isNullPtr(v.value)) {
        return <p className="dbg-evaluate-tabular-content">NULL</p>
    }
    
    const [addr, offset, ] = read_ptr(v.value);
    return (
        <p>
            Pointer <span className="dbg-extra-information">0x{render_address(addr + offset, 8)} = 0x{render_address(addr, 4)} + 0x{render_address(offset, 4)}</span>
        </p>
    );
    }

    /**
     * Render the struct value by reading global TypeRecord in state and go to
     * the heap memory to evaluate each field.
     * 
     * @returns A rendered struct C0Value Component
     */
    render_struct(v : C0Value<C0TypeClass>) {
        console.log(v);
        console.log(getType(v.type, this.props.typeRecord));

        // Unpack v
        const v_deref = castToType<C0TypeClass>(v, getType(v.type, this.props.typeRecord))

        return this.render_base(v_deref)
    }

    /**
     * Render a specific C0Value v (with value & type)
     * @param v The value to be rendered
     * @returns Render Result
     */
    render_base(v : C0Value<C0TypeClass>) : React.ReactNode {
        if (isValueType(v)) {
            return <p>{c0_value_cvt2_js_string(v)}</p>
        } else if (isStringType(v)) {
            return <p>"{loadString(v, this.props.mem)}"</p>
        } else if (isUnknownType(v)) {
            return <p>Can't evaluate &lt;unknown&gt; type</p>
        } else if (isPointerType(v)) {
            switch (v.type.kind) {
                case "arr":
                    return this.render_array(v);
                case "ptr":
                    return this.render_pointer(v);
                case "struct":
                    return this.render_struct(v);
            }
        }
    }

    render(): React.ReactNode {
        return this.render_base(this.props.value);
    }
}