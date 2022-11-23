import { Mark } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "./schema";
import { key } from "./plugins";
import { TooltipPosition, CursorPosition } from "./tooltip.types";

export class Tooltip {
  view: EditorView;
  tooltip: HTMLDivElement;
  bold: HTMLButtonElement;
  italic: HTMLButtonElement;
  strike: HTMLButtonElement;
  code: HTMLButtonElement;
  options: TooltipPosition;

  /// @internal
  constructor(view: EditorView, options: TooltipPosition) {
    this.options = options;
    this.view = view;
    this.tooltip = document.createElement("div");
    this.tooltip.className = "tooltip";
    this.bold = document.createElement("button");
    this.italic = document.createElement("button");
    this.strike = document.createElement("button");
    this.code = document.createElement("button");

    this.initButtons();

    if (view.dom.parentNode) view.dom.parentNode.appendChild(this.tooltip);

    this.update(view, null);
  }

  // initialize the tooltip
  initButtons() {
    const boldElem = document.createElement("strong");
    boldElem.textContent = "B";
    this.bold.setAttribute("type", "button");
    this.bold.append(boldElem);
    this.bold.addEventListener("mousedown", (event) =>
      this.setStyle(event, "strong")
    );

    const italicElem = document.createElement("em");
    italicElem.innerHTML = `<strong><em>I</em></strong>`;
    this.italic.setAttribute("type", "button");
    this.italic.append(italicElem);
    this.italic.addEventListener("mousedown", (event) =>
      this.setStyle(event, "em")
    );

    const strikeElem = document.createElement("s");
    strikeElem.innerHTML = `<strong><s>S</s></strong>`;
    this.strike.setAttribute("type", "button");
    this.strike.append(strikeElem);
    this.strike.addEventListener("mousedown", (event) =>
      this.setStyle(event, "s")
    );

    const codeElem = document.createElement("strong");
    codeElem.innerHTML = `<strong>&lt;/&gt;</strong>`;
    this.code.setAttribute("type", "button");
    this.code.append(codeElem);
    this.code.addEventListener("mousedown", (event) =>
      this.setStyle(event, "code")
    );

    this.tooltip.appendChild(this.bold);
    this.tooltip.appendChild(this.italic);
    this.tooltip.appendChild(this.strike);
    this.tooltip.appendChild(this.code);
  }

  // this method handles events on the tooltip buttons
  setStyle(event: MouseEvent, type: "strong" | "em" | "s" | "code") {
    event.preventDefault();
    const { from, to, $from } = this.view.state.selection;

    let setOfMarks: Set<keyof typeof schema["marks"]> | undefined;
    if ($from.nodeAfter?.marks)
      setOfMarks = this.getMarksInSelection($from.nodeAfter.marks);

    const tr = this.view.state.tr;
    if (setOfMarks && setOfMarks.has(type)) {
      const newTransaction = tr.removeMark(
        from,
        to,
        schema.marks[type].create()
      );
      this.view.dispatch(newTransaction);
      return;
    }
    const newTransaction = tr.addMark(from, to, schema.marks[type].create());
    this.view.dispatch(newTransaction);
  }

  // lists the currently active marks in the selected text (if any)
  getMarksInSelection(marks: readonly Mark[]) {
    const setOfMarks = new Set<keyof typeof schema["marks"]>();
    marks.forEach((mark) => {
      setOfMarks.add(mark.type.name);
    });
    return setOfMarks;
  }

  // toggle tooltip buttons active or inactive based on results from
  // getMarksInSelection
  toggleActiveButtonClass(state: EditorState) {
    if (state.selection.$from.nodeAfter?.marks) {
      const setOfMarks = this.getMarksInSelection(
        state.selection.$from.nodeAfter?.marks
      );

      // remove all ".active" classes
      this.bold.classList.remove("active");
      this.italic.classList.remove("active");
      this.strike.classList.remove("active");
      this.code.classList.remove("active");

      // re-apply active classes
      setOfMarks.forEach((name) => {
        switch (name) {
          case "strong":
            this.bold.classList.add("active");
            break;
          case "em":
            this.italic.classList.add("active");
            break;
          case "s":
            this.strike.classList.add("active");
            break;
          case "code":
            this.code.classList.add("active");
            break;
        }
      });
    }
  }

  // plugin update function runs when view updates
  update(view: EditorView, lastState: EditorState | null) {
    this.view = view; // update the view
    const state = view.state;
    const focused = key.getState(state);

    // Don't do anything if the document/selection didn't change
    if (
      lastState &&
      lastState.doc.eq(state.doc) &&
      lastState.selection.eq(state.selection) &&
      focused === key.getState(lastState)
    )
      return;

    // Hide the tooltip if the selection is empty
    if (state.selection.empty || !focused) {
      this.tooltip.style.display = "none";
      return;
    }

    this.toggleActiveButtonClass(state);

    // Otherwise, reposition it and update its content
    this.tooltip.style.display = "";
    const { from, to } = state.selection;
    // These are in screen coordinates
    const start = view.coordsAtPos(from),
      end = view.coordsAtPos(to);

    this.setPosition(this.options.position, this.options.distance, start, end);
  }

  // set the tooltip position based on configuration
  setPosition(
    position: TooltipPosition["position"],
    distance: TooltipPosition["distance"],
    start: CursorPosition,
    end: CursorPosition
  ) {
    // The box in which the tooltip is positioned, to use as base
    const box = this.tooltip.offsetParent!.getBoundingClientRect();

    if (position === "TOP") {
      const top = box.bottom + distance - start.top;
      this.tooltip.style.bottom = top + "px";
      const center =
        (start.left + end.right) / 2 - this.tooltip.offsetWidth / 2 - box.left;
      this.tooltip.style.left = center + "px";
    } else if (position === "BOTTOM") {
      this.tooltip.style.bottom =
        box.bottom -
        (start.bottom + this.tooltip.offsetHeight + distance) +
        "px";
      const center =
        (start.left + end.right) / 2 - this.tooltip.offsetWidth / 2 - box.left;
      this.tooltip.style.left = center + "px";
    } else if (position === "LEFT") {
      const left = start.left - this.tooltip.offsetWidth - box.left - distance;
      const verticalCenter =
        box.bottom -
        start.top -
        (start.bottom - start.top) / 2 -
        this.tooltip.offsetHeight / 2;

      this.tooltip.style.left = left + "px";
      this.tooltip.style.bottom = verticalCenter + "px";
    } else {
      const right = end.right + distance - box.left;
      const verticalCenter =
        box.bottom -
        start.top -
        (start.bottom - start.top) / 2 -
        this.tooltip.offsetHeight / 2;

      this.tooltip.style.left = right + "px";
      this.tooltip.style.bottom = verticalCenter + "px";
    }
  }

  // destroy tooltip when EditorState is refreshed due to reconfig
  // or when editor is destroyed
  destroy() {
    this.tooltip.remove();
  }
}
