import { LRParser } from '@lezer/lr';
import { LRLanguage, foldNodeProp, foldInside, LanguageSupport } from '@codemirror/language';
import { styleTags, tags } from '@lezer/highlight';

// This file was generated by lezer-generator. You probably shouldn't edit it.
const spec_Comment = {__proto__:null,"# int pool":38, "# string pool":38, "# function_pool":38, "# native pool":38};
const parser = LRParser.deserialize({
  version: 14,
  states: "#xQVQPOOOOQO'#Ci'#CiOeQQO'#C_OOQO'#Cc'#CcOmQSO'#CfOrQPO'#CeOOQO'#C^'#C^OOQO'#Ch'#ChQVQPOOOOQO-E6g-E6gOzQPO,58yO!`QPO,59QOOQO'#Ck'#CkO!eQPO,59POOQO,59P,59POOQO-E6f-E6fOOQO'#Cj'#CjO!mQPO1G.eOOQO1G.l1G.lOOQO-E6i-E6iOOQO1G.k1G.kOOQO-E6h-E6h",
  stateData: "#R~ObOS~OSPOWUOcROdSO~OSPOTYO~OZZO~OSPOW^O~OU`OSRaWRa`RacRadRa~OebO~OSPOWdO~OU`OSRiWRi`RicRidRi~O",
  goto: "!b`PPaePPPmPmqPu{!U![TVOWSUOWT[T]TUOWTTOWQWOR_WWQOTW]RXQQaYReaQ]TRc]",
  nodeNames: "⚠ Program Expression Line Byte Instruction Comment BlockHeader BlockEnder Function FuncHeader Identifier",
  maxTerm: 21,
  skippedNodes: [0],
  repeatNodeCount: 4,
  tokenData: "%V~R[XYwYZ|pqwst!Z}!O#j!Q![$O!`!a%Q!c!i$O!i!}#j#R#S#j#T#Z$O#Z#o#j~|Ob~~!RPb~YZ!U~!ZOW~~!^Qpq!d!^!_#eR!iSUPOY!uZs!ust#Yt~!uR!|SUPTQOY!uZs!ust#Yt~!uP#_QUPOY#YZ~#Y~#jOd~S#oTZS}!O#j!Q![#j!c!}#j#R#S#j#T#o#jV$TVZS}!O#j!Q![$j!c!i$j!i!}#j#R#S#j#T#Z$j#Z#o#jV$qTSRZS}!O#j!Q![#j!c!}#j#R#S#j#T#o#j~%VOe~",
  tokenizers: [0, 1, 2],
  topRules: {"Program":[0,1]},
  specialized: [{term: 6, get: value => spec_Comment[value] || -1}],
  tokenPrec: 0
});

const BC0Language = LRLanguage.define({
    parser: parser.configure({
        props: [
            foldNodeProp.add({
                Function: foldInside,
            }),
            styleTags({
                Byte: tags.integer,
                Comment: tags.comment,
                FuncHeader: tags.definitionKeyword,
                Identifier: tags.definitionKeyword,
                BlockHeader: tags.definitionKeyword,
                Commands: tags.className,
                Instruction: tags.className
            })
        ]
    }),
    languageData: {
        commentTokens: { line: "# " }
    },
});
function BC0() {
    return new LanguageSupport(BC0Language);
}

export { BC0, BC0Language };
