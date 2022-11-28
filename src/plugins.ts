import { Plugin, PluginKey } from "prosemirror-state";
import { baseKeymap, toggleMark } from "prosemirror-commands";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { Tooltip } from "./tooltip";
import { schema } from "./schema";
import { TooltipPosition } from "./tooltip.types";
import { inputRulesPlungin } from "./input-rules";

export const key = new PluginKey("tooltip");

// FOCUS ISSUE SOLUTION OBTAINED FROM: https://discuss.prosemirror.net/t/handling-focus-in-plugins/1981/4
export const initTooltipPlugin = (tooltipOptions: TooltipPosition) => {
  const tooltipPlugin = new Plugin({
    state: {
      init() {
        return false; // assume the view starts out without focus
      },
      apply(transaction, prevFocused) {
        // update plugin state when transaction contains the meta property
        // set by the focus/blur DOM event handlers
        const focused = transaction.getMeta(key);
        return typeof focused === "boolean" ? focused : prevFocused;
      },
    },
    view(editorView) {
      return new Tooltip(editorView, tooltipOptions);
    },
    props: {
      handleDOMEvents: {
        blur(view) {
          view.dispatch(view.state.tr.setMeta(key, false));
        },
        focus(view) {
          view.dispatch(view.state.tr.setMeta(key, true));
        },
      },
    },
    key,
  });

  return tooltipPlugin;
};

// default plugins and shortcuts
export const defaultPlugins = [
  keymap(baseKeymap),
  history({ newGroupDelay: 300 }),
  keymap({
    "Mod-z": undo,
    "Mod-y": redo,
    "Mod-b": toggleMark(schema.marks.strong),
    "Mod-i": toggleMark(schema.marks.em),
    "Alt-s": toggleMark(schema.marks.s),
    "Mod-m": toggleMark(schema.marks.code),
  }),
  inputRulesPlungin,
];
