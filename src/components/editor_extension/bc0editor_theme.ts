import {HighlightStyle, syntaxHighlighting} from "@codemirror/language";
import {tags as t} from "@lezer/highlight";
import { Extension } from "@codemirror/state";

import { C0LightStyle } from "./c0editor_theme";

const highlighter = {
    funcColor: "#4078F2",
    hiddenColor: "#EFEFEF",
    commentColor: "#AAAAAA",
    keyColor: "#A626AE",
    operatorColor: "#0084BC"
}


const BC0HighlightStyle = HighlightStyle.define([
    {
        tag: [t.comment],
        color: highlighter.funcColor
    },
    {
        tag: [t.keyword],
        color: highlighter.keyColor
    },
    {
        tag: [t.annotation],
        color: highlighter.hiddenColor
    },
    {
        tag: [t.operator],
        color: highlighter.operatorColor
    },
    {
        tag: [t.attributeName],
        color: highlighter.commentColor
    }
]);


const BC0LightTheme: Extension = [C0LightStyle, syntaxHighlighting(BC0HighlightStyle, {fallback: false})];

export default BC0LightTheme;
