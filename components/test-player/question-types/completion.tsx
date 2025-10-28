"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { CompletionQuestion } from "@testComponents/lib/types";
import {
  EditorContent,
  useEditor,
  Node,
  mergeAttributes,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import InputNodeComponent from "../input-node-component"; 

const colors = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Purple", value: "#e9d5ff" },
  { name: "Orange", value: "#fed7aa" },
];

export const InputNode = Node.create({
  name: "inputNode",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      subId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-sub-id"),
        renderHTML: (attributes) => ({
          "data-sub-id": attributes.subId,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-tiptap-input-node]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-tiptap-input-node": true }),
    ];
  },

  addStorage() {
    return {
      value: null as Record<string, string> | null,
      onChange: (() => {}) as (
        value: Record<string, string>,
        subQuestionId?: string
      ) => void,
      readOnly: false,
      showCorrectAnswer: false,
      question: null as CompletionQuestion | null,
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(InputNodeComponent);
  },
});

interface CompletionProps {
  question: CompletionQuestion;
  onQuestionHighlighted?: (id: string, html: string) => void;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
}

export default function Completion({
  question,
  onQuestionHighlighted,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
}: CompletionProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const content = useMemo(() => {
    let blankCounter = 0;
    return question.text.replaceAll(/_{3,}/g, () => {
      const subQuestion = question.subQuestions[blankCounter];
      const subId = subQuestion
        ? subQuestion.subId
        : `blank-${blankCounter}`;
      blankCounter++;
      return `<span data-tiptap-input-node="true" data-sub-id="${subId}"></span>`;
    });
  }, [question.text, question.subQuestions]);

  const editor = useEditor({
    editable: true, // Keep this true
    extensions: [
      StarterKit.configure({}),
      Highlight.configure({ multicolor: true }),
      InputNode,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content,

    editorProps: {
      attributes: { class: "select-text cursor-text" },
    },

    onSelectionUpdate: ({ editor }) => {
      if (readOnly) {
        setPopoverPos(null);
        return;
      }
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      if (!text) {
        setPopoverPos(null);
        return;
      }
      const { view } = editor;
      const start = view.coordsAtPos(from);
      const { left, top: selectionTop } = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      const rect = {
        left: Math.min(start.left, end.left),
        top: Math.min(start.top, end.top) - 10,
        width: Math.abs(end.left - start.left),
      };
      setPopoverPos({ x: left + rect.width / 2, y: selectionTop - 40 });
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

  
    editor.storage.inputNode = {
      value,
      onChange,
      readOnly,
      showCorrectAnswer,
      question,
    };

    editor.setOptions({
      editorProps: {
        attributes: { class: "select-text cursor-text" },
        
     
        handleKeyDown(view, event) {
          
          if (
            event.key.startsWith("Arrow") ||
            event.key === "Shift" ||
            event.key.startsWith("Meta") ||
            event.key.startsWith("Control") ||
            event.key === "Alt"
          ) {
            return false; 
          }

          if (readOnly) {
            return true; 
          }
          const targetNode = (event.target as HTMLElement).closest(
            "[data-tiptap-input-node]"
          );

          if (targetNode) {
            return false; 
          }

          return true;
        },
      },
    });
    
  }, [value, onChange, readOnly, showCorrectAnswer, question, editor]);


  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (
        !popoverRef.current ||
        !popoverRef.current.contains(e.target as Node)
      ) {
        setPopoverPos(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  
  const applyColor = (color?: string) => {
    if (!editor || readOnly) return;

    color
      ? editor.chain().focus().setHighlight({ color }).run()
      : editor.chain().focus().unsetHighlight().run();

    onQuestionHighlighted?.(question.id, editor.getHTML());
    setPopoverPos(null);
  };

  return (
    <div className="relative outline-none">
      <EditorContent editor={editor} />

      {popoverPos && !readOnly && (
        <div
          ref={popoverRef}
          style={{ top: popoverPos.y, left: popoverPos.x }}
          className="color-popover"
        >
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => applyColor(c.value)}
              style={{ background: c.value }}
              className="color-btn"
            />
          ))}
          <button onClick={() => applyColor(undefined)} className="remove-btn">
            Remove
          </button>
        </div>
      )}

      <style jsx>{`
        .color-popover {
          position: fixed;
          transform: translateX(-50%);
          z-index: 9999;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 4px 6px;
          display: flex;
          gap: 4px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
        .color-btn {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1px solid #aaa;
          cursor: pointer;
        }
        .remove-btn {
          font-size: 10px;
          padding: 0 4px;
          cursor: pointer;
        }
        .cursor-default .ProseMirror:focus,
        .cursor-default .ProseMirror:focus-visible {
          outline: none !important;
        }
      `}</style>
    </div>
  );
}