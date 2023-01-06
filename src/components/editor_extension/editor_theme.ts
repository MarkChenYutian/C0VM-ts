import {EditorView} from "@codemirror/view";
import {HighlightStyle, syntaxHighlighting} from "@codemirror/language";
import {tags as t} from "@lezer/highlight";
import { Extension } from "@codemirror/state";

const backgroundColor = "#FFFFFF",
    textColor = "#333333",
    activeColor = "#F7F7F7",
    selection = "#F3F3F3",
    selectText = "#526FFF",
    textBackground = "#BBDEE3",
    execLineBackground = "#FFFF90"


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


const C0LightStyle = EditorView.theme({
    "&": {
        color: textColor,
        backgroundColor: backgroundColor,
        fontSize: "15px",
        FontFace: "cascadia-code"
    },
    ".cm-content": {
        caretColor: "#526FFF",
    },
    ".cm-gutters": {
        backgroundColor: backgroundColor,
    },
    ".cm-activeLine": {
        backgroundColor: activeColor
    },
    ".cm-activeLineGutter": {
        backgroundColor: activeColor
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: selection,
        color: selectText
    },
    ".cm-selectionMatch": {
        backgroundColor: textBackground
    },
    ".cm-foldPlaceholder": {
        backgroundColor: backgroundColor,
        FontFace: "cascadic-code",
        padding: "0 1rem",
        border: "none"
    },
    ".cm-execLine-light": {
        backgroundColor: execLineBackground
    }
}, {dark: false});


const C0HighlightStyle = HighlightStyle.define([
    {
        tag: [t.comment, t.docComment, t.lineComment, t.blockComment],
        color: highlighter.commentColor
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
        color: highlighter.fieldColor
    },
    {
        tag: [t.variableName],
        color: textColor
    }
]);


const C0LightTheme: Extension = [C0LightStyle, syntaxHighlighting(C0HighlightStyle, {fallback: false})];

export default C0LightTheme;
