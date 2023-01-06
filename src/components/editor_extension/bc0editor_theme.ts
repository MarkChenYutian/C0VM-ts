import {HighlightStyle, syntaxHighlighting} from "@codemirror/language";
import {tags as t} from "@lezer/highlight";
import { Extension } from "@codemirror/state";

import { C0LightStyle } from "./c0editor_theme";

const textColor = "#333333";
const highlighter = {
    typeColor: "#C18401",
    funcColor: "#4078F2",
    commentColor: "#AAAAAA",
    keyColor: "#A626AE",
    operatorColor: "#0084BC",
    fieldColor: "#E35749",
    boolColor: "#986802",
    stringColor: "#51A14F",
    nullColor: "#986802"
}


const BC0HighlightStyle = HighlightStyle.define([
    {
        tag: [t.comment, t.docComment, t.lineComment, t.blockComment],
        color: highlighter.funcColor
    },
    {
        tag: [t.typeName, t.typeOperator],
        color: highlighter.typeColor
    },
    {
        tag: [t.controlKeyword, t.moduleKeyword, t.keyword, t.annotation],
        color: highlighter.keyColor
    },
    {
        tag: [t.operator, t.logicOperator, t.bitwiseOperator, t.compareOperator, t.arithmeticOperator, t.derefOperator],
        color: highlighter.operatorColor
    },
    {
        tag: [t.bool, t.number],
        color: highlighter.boolColor
    },
    {
        tag: [t.string, t.character],
        color: highlighter.stringColor
    },
    {
        tag: [t.name],
        color: highlighter.funcColor
    },
    {
        tag: [t.null],
        color: highlighter.nullColor
    },
    {
        tag: [t.attributeName],
        color: highlighter.commentColor
    },
    {
        tag: [t.variableName],
        color: textColor
    }
]);


const BC0LightTheme: Extension = [C0LightStyle, syntaxHighlighting(BC0HighlightStyle, {fallback: false})];

export default BC0LightTheme;
