import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import { schema } from "./schema";
import { defaultPlugins, initTooltipPlugin } from "./plugins";
import { setMarksOnText } from "./helper";
import { TooltipPosition } from "./tooltip.types";

export class WhatsAppEditor extends EditorView {
  private isCustomEditor: boolean;
  /// @internal
  constructor(
    tooltipOptions: TooltipPosition,
    ...args: ConstructorParameters<typeof EditorView>
  ) {
    // if configuration is provided tooltip will be ignored
    if (args[1]) {
      super(...args);
      this.isCustomEditor = true;
    } else {
      const tooltipConfig = tooltipOptions ?? {
        position: "BOTTOM",
        distance: 10,
      };
      const state = EditorState.create({
        schema,
        plugins: [initTooltipPlugin(tooltipConfig), ...defaultPlugins],
      });
      super(args[0], { state });
      this.isCustomEditor = false;
    }
  }

  // get whatsapp-style-markdown string
  getWhatsappMarkdown() {
    if (this.isCustomEditor) {
      const error = new Error("Method is forbidden for custom editor");
      error.name = "FORBIDDEN";
      throw error;
    }

    const documentContent = this.state.toJSON().doc.content;

    if (!documentContent.length) return null;

    // array of whatsapp-formatted paras.
    // this will eventually be merged to a single string
    const paragraphs: string[] = [];

    // loop over each paragraph
    for (let index = 0; index < documentContent.length; index++) {
      let paragraph = "";
      const paragraphContent = documentContent[index].content;

      paragraphContent.forEach((element: any) => {
        if (element.marks) {
          paragraph += setMarksOnText(element.marks, element.text);
        } else paragraph += element.text;
      });
      paragraphs.push(paragraph);
    }
    const whatsappFormattedText = paragraphs.join("\n");

    return whatsappFormattedText;
  }
}
