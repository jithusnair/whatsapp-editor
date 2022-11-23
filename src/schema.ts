import { Schema, type DOMOutputSpec, type MarkSpec } from "prosemirror-model";

const emDOM: DOMOutputSpec = ["em", 0],
  strongDOM: DOMOutputSpec = ["strong", 0],
  strikeThroughDOM: DOMOutputSpec = ["s", 0],
  codeDOM: DOMOutputSpec = ["code", 0];

// WhatsApp markdown schema
export const schema = new Schema({
  nodes: {
    doc: {
      content: "block+",
    },
    paragraph: {
      content: "inline*",
      group: "block",
      toDOM() {
        return ["p", 0];
      },
      parseDOM: [{ tag: "p" }],
      marks: "_",
    },
    text: {
      group: "inline",
    },
  },
  marks: {
    em: {
      parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
      toDOM() {
        return emDOM;
      },
    } as MarkSpec,
    strong: {
      parseDOM: [
        { tag: "strong" },
        {
          tag: "b",
          getAttrs: (node: HTMLElement) =>
            node.style.fontWeight != "normal" && null,
        },
        {
          style: "font-weight",
          getAttrs: (value: string) =>
            /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
        },
      ],
      toDOM() {
        return strongDOM;
      },
    } as MarkSpec,
    s: {
      parseDOM: [{ tag: "s" }],
      toDOM() {
        return strikeThroughDOM;
      },
    } as MarkSpec,
    code: {
      parseDOM: [{ tag: "code" }],
      toDOM() {
        return codeDOM;
      },
    } as MarkSpec,
  },
});
