import { Node, mergeAttributes } from "@tiptap/core";

export const InputNode = Node.create({
  name: "inputNode",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      value: { default: "" },
      placeholder: { default: "Type here..." },
    };
  },

  parseHTML() {
    return [{ tag: "input" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["input", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ({ node, editor }) => {
      const dom = document.createElement("input");
      dom.type = "text";
      dom.value = node.attrs.value || "";
      dom.placeholder = node.attrs.placeholder;
      dom.classList.add("tiptap-input");

      dom.addEventListener("input", (event) => {
        editor
          .chain()
          .focus()
          .updateAttributes("inputNode", {
            value: (event.target as HTMLInputElement).value,
          })
          .run();
      });

      return { dom };
    };
  },
});
