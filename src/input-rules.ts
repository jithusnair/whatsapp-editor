import { InputRule, inputRules } from "prosemirror-inputrules";
import { MarkType } from "prosemirror-model";
import { schema } from "./schema";

// this is largely from: https://discuss.prosemirror.net/t/input-rules-for-wrapping-marks/537/11
function markInputRule(regexp: RegExp, markType: MarkType) {
  return new InputRule(regexp, (state, match, start, end) => {
    const tr = state.tr;
    const textStart = start + 1;
    const textEnd = end;
    tr.addMark(textStart, textEnd, markType.create());
    tr.delete(start, textStart);
    tr.removeStoredMark(markType); // Do not continue with mark.
    return tr;
  });
}

// these regexes are probably not the best
// but works as a scrappy version ¯\_(ツ)_/¯
const boldRegex = /\*(.*?)\*$/;
const italicRegex = /_(.*?)_$/;
const strikeThrough = /~(.*?)~$/;
const monospace = /```(.*?)```$/;

const rules = [
  markInputRule(boldRegex, schema.marks["strong"]), // bold
  markInputRule(italicRegex, schema.marks["em"]), // italic
  markInputRule(strikeThrough, schema.marks["s"]), // strike-through
  markInputRule(monospace, schema.marks["code"]), // strike-through
];

const inputRulesPlungin = inputRules({ rules: rules });

export { inputRulesPlungin };
