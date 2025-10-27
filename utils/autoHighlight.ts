import { Extension } from "@tiptap/core";
import Highlight from "@tiptap/extension-highlight";

export const AutoHighlight = Extension.create({
  name: "autoHighlight",

  addOptions() {
    return {
      onColorPicker: (range: { from: number; to: number }) => {},
    };
  },

  addExtensions() {
    return [
      Highlight.configure({ multicolor: true }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      new this.editor.view.plugin({
        props: {
          handleDOMEvents: {
            mouseup: (view) => {
              const { from, to } = view.state.selection;
              if (from === to) return false;
              this.options.onColorPicker({ from, to });
              return false;
            },
          },
        },
      }),
    ];
  },
});
