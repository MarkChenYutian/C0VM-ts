'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lr = require('@lezer/lr');
var language = require('@codemirror/language');
var highlight = require('@lezer/highlight');

// This file was generated by lezer-generator. You probably shouldn't edit it.
const spec_Comment = {__proto__:null,"# int pool":40, "# string pool":40, "# function_pool":40, "# native pool":40};
const parser = lr.LRParser.deserialize({
  version: 14,
  states: "$bQVQPOOOOQO'#Ck'#CkOeQQO'#C_OOQO'#Cd'#CdOmQSO'#CgOrQWO'#CfOOQO'#C^'#C^OOQO'#Cj'#CjQVQPOOOOQO-E6i-E6iO}QPO,58yO!SQPO,59RO!XQSO'#CiOOQO'#Cl'#ClO!^QWO,59QOOQO,59Q,59QOOQO-E6h-E6hO!iQSO1G.eOOQO1G.m1G.mO!nQPO,59TOOQO-E6j-E6jOOQO1G.l1G.lOOQO7+$P7+$PO!sQSO1G.oO!xQPO7+$ZOOQO<<Gu<<Gu",
  stateData: "!}~OcOS~OSPOXUOdROeSO~OSPOTYO~O[ZO~OSPOX_Og[O~OUaO~OfbO~O[cO~OSPOXeOg[O~OVfO~OhgO~O[hO~OfiO~O",
  goto: "!]aPPbfPPPPnPnrPjv|!VTVOWSUOWT]T^TUOWTTOWQWOR`WWQOTW^RXQQ^TRd^",
  nodeNames: "⚠ Program Expression Line Byte Instruction Comment Source BlockHeader BlockEnder Function FuncHeader Identifier Jump",
  maxTerm: 24,
  skippedNodes: [0],
  repeatNodeCount: 3,
  tokenData: "%l~R]XYzYZ!Ppqzst!^}!O#z!Q![$`![!]%b!`!a%g!c!i$`!i!}#z#R#S#z#T#Z$`#Z#o#z~!POc~~!UPc~YZ!X~!^OX~~!aQpq!g!^!_#u_!nTUPVSOY!}Zs!}t!^!}!^!_#a!_~!}V#WRUPTQVSOY!}Zs!}t~!}_#lRgWUPTQVSOY!}Zs!}t~!}~#zOe~S$PT[S}!O#z!Q![#z!c!}#z#R#S#z#T#o#z_$eV[S}!O#z!Q![$z!c!i$z!i!}#z#R#S#z#T#Z$z#Z#o#z_%RTSZ[S}!O#z!Q![#z!c!}#z#R#S#z#T#o#z~%gOh~~%lOf~",
  tokenizers: [0, 1, 2, 3],
  topRules: {"Program":[0,1]},
  specialized: [{term: 6, get: value => spec_Comment[value] || -1}],
  tokenPrec: 0
});

const BC0Language = language.LRLanguage.define({
    parser: parser.configure({
        props: [
            language.foldNodeProp.add({
                Function: language.foldInside,
            }),
            highlight.styleTags({
                Byte: highlight.tags.content,
                Comment: highlight.tags.comment,
                Instruction: highlight.tags.attributeName,
                Source: highlight.tags.annotation,
                "Jump/...": highlight.tags.controlOperator,
                "FuncHeader/...": highlight.tags.definitionKeyword,
                Identifier: highlight.tags.definitionKeyword,
                BlockHeader: highlight.tags.definitionKeyword
            })
        ]
    }),
    languageData: {
        commentTokens: { line: "# " }
    },
});
function BC0() {
    return new language.LanguageSupport(BC0Language);
}

exports.BC0 = BC0;
exports.BC0Language = BC0Language;