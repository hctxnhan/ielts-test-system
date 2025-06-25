"use client";
import React from "react";
import { cn } from "@testComponents/lib/utils";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  Redo,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./button";

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  readonly?: boolean;
}

// Floating Table Toolbar Component
const FloatingTableToolbar = ({ editor }: { editor: Editor | null }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const addColumnBefore = () => editor?.chain().focus().addColumnBefore().run();
  const addColumnAfter = () => editor?.chain().focus().addColumnAfter().run();
  const deleteColumn = () => editor?.chain().focus().deleteColumn().run();
  const addRowBefore = () => editor?.chain().focus().addRowBefore().run();
  const addRowAfter = () => editor?.chain().focus().addRowAfter().run();
  const deleteRow = () => editor?.chain().focus().deleteRow().run();
  const deleteTable = () => editor?.chain().focus().deleteTable().run();
  const updatePosition = useCallback(() => {
    if (!editor) return;

    const isTableActive = editor.isActive("table");

    if (!isTableActive) {
      setIsVisible(false);
      return;
    }

    // Find the table element in the DOM
    const editorElement = editor.view.dom;
    const tableElement = editorElement.querySelector("table");

    if (tableElement) {
      const editorRect = editorElement.getBoundingClientRect();
      const tableRect = tableElement.getBoundingClientRect();

      // Position the toolbar above the table
      const top = tableRect.top - editorRect.top - 40; // 40px above the table
      const left = tableRect.left - editorRect.left;

      setPosition({ top, left });
      setIsVisible(true);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      // Small delay to ensure DOM is updated
      setTimeout(updatePosition, 10);
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    editor.on("update", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
      editor.off("update", handleSelectionUpdate);
    };
  }, [editor, updatePosition]);

  if (!isVisible || !editor?.isActive("table")) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={addColumnBefore}
        title="Add Column Before"
        className="h-8 px-2"
      >
        <Plus className="w-3 h-3 mr-1" />
        Col
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={addColumnAfter}
        title="Add Column After"
        className="h-8 px-2"
      >
        Col
        <Plus className="w-3 h-3 ml-1" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={deleteColumn}
        title="Delete Column"
        className="h-8 px-2 text-red-600 hover:text-red-700"
      >
        <Minus className="w-3 h-3 mr-1" />
        Col
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <Button
        variant="ghost"
        size="sm"
        onClick={addRowBefore}
        title="Add Row Before"
        className="h-8 px-2"
      >
        <Plus className="w-3 h-3 mr-1" />
        Row
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={addRowAfter}
        title="Add Row After"
        className="h-8 px-2"
      >
        Row
        <Plus className="w-3 h-3 ml-1" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={deleteRow}
        title="Delete Row"
        className="h-8 px-2 text-red-600 hover:text-red-700"
      >
        <Minus className="w-3 h-3 mr-1" />
        Row
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />{" "}
      <Button
        variant="ghost"
        size="sm"
        onClick={deleteTable}
        title="Delete Table"
        className="h-8 px-2 text-red-600 hover:text-red-700"
      >
        <Minus className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Floating Highlight Toolbar Component
const FloatingHighlightToolbar = ({ editor }: { editor: Editor | null }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: "Yellow", value: "#fef08a", class: "bg-yellow-200" },
    { name: "Green", value: "#bbf7d0", class: "bg-green-200" },
    { name: "Blue", value: "#bfdbfe", class: "bg-blue-200" },
    { name: "Pink", value: "#fbcfe8", class: "bg-pink-200" },
    { name: "Purple", value: "#e9d5ff", class: "bg-purple-200" },
    { name: "Orange", value: "#fed7aa", class: "bg-orange-200" },
  ];

  const toggleHighlight = (color: string) => {
    // If the same color is already applied, remove the highlight
    const currentHighlight = editor?.getAttributes("highlight");
    if (currentHighlight?.color === color) {
      editor?.chain().focus().unsetHighlight().run();
    } else {
      editor?.chain().focus().toggleHighlight({ color }).run();
    }
  };

  const removeHighlight = () => {
    editor?.chain().focus().unsetHighlight().run();
  };

  const updatePosition = useCallback(() => {
    if (!editor) return;

    const { selection } = editor.state;
    const { from, to } = selection;

    // Only show if there's a text selection of more than 1 character
    if (from === to || to - from <= 1) {
      setIsVisible(false);
      return;
    }

    // Get the DOM representation of the selection
    const { view } = editor;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    if (start && end) {
      const editorElement = view.dom;
      const editorRect = editorElement.getBoundingClientRect();

      // Calculate initial position
      const centerX = (start.left + end.left) / 2;
      let top = start.top - editorRect.top - 50; // 50px above the selection
      let left = centerX - editorRect.left - 100; // Center the toolbar (approximate)

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Toolbar approximate dimensions (adjust based on actual toolbar size)
      const toolbarWidth = 200; // Approximate width of the toolbar
      const toolbarHeight = 40; // Approximate height of the toolbar

      // Adjust horizontal position to stay within viewport
      const absoluteLeft = editorRect.left + left;
      if (absoluteLeft < 10) {
        // Too far left, move right
        left = 10 - editorRect.left;
      } else if (absoluteLeft + toolbarWidth > viewportWidth - 10) {
        // Too far right, move left
        left = viewportWidth - toolbarWidth - 10 - editorRect.left;
      }

      // Adjust vertical position to stay within viewport
      const absoluteTop = editorRect.top + top;
      if (absoluteTop < 10) {
        // Too far up, position below the selection instead
        top = end.top - editorRect.top + 20;
      } else if (absoluteTop + toolbarHeight > viewportHeight - 10) {
        // Too far down, position above but closer to selection
        top = start.top - editorRect.top - toolbarHeight - 10;
      }

      setPosition({ top, left });
      setIsVisible(true);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleMouseUp = () => {
      // Small delay to ensure DOM is updated
      setTimeout(updatePosition, 10);
    };

    // Add mouseup event listener to the editor's DOM element
    const editorElement = editor.view.dom;
    editorElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      editorElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor, updatePosition]);

  if (!isVisible || !editor) {
    return null;
  }

  const { selection } = editor.state;
  const { from, to } = selection;

  // Don't show if no text is selected or selection is 1 character or less
  if (from === to || to - from <= 1) {
    return null;
  }

  const isHighlighted = editor.isActive("highlight");
  const currentColor = editor.getAttributes("highlight").color;
  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex gap-1">
        {colors.map((color) => (
          <button
            key={color.value}
            className={`w-6 h-6 rounded border hover:border-gray-400 ${color.class} ${
              currentColor === color.value
                ? "border-gray-800 ring-1 ring-gray-400"
                : "border-gray-300"
            }`}
            title={`${color.name}${currentColor === color.value ? " (current)" : ""}`}
            onClick={() => toggleHighlight(color.value)}
          />
        ))}
        {isHighlighted && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <button
              onClick={removeHighlight}
              className="flex items-center justify-center w-6 h-6 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
              title="Remove highlight"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
      <Button
        variant={editor.isActive("bold") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive("italic") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive("underline") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive("strike") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="w-4 h-4" />
      </Button>{" "}
      <Button
        variant={editor.isActive("code") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button
        variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button
        variant={editor.isActive("bulletList") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive("orderedList") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        variant={editor.isActive("blockquote") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button variant="ghost" size="sm" onClick={addTable} title="Insert Table">
        <TableIcon className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  );
};

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Enter text here...",
  className,
  minHeight = 200,
  readonly = false,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable most editing capabilities in readonly mode
        ...(readonly && {
          history: false,
          dropcursor: false,
        }),
      }),
      Table.configure({
        resizable: !readonly,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!readonly) {
        onChange(editor.getHTML());
      }
    },
    editable: !readonly,
    editorProps: {
      attributes: {
        class: cn(
          // Removed: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto"
          "min-h-[150px] p-3",
          readonly && "cursor-default select-text",
        ),
        style: `min-height: ${minHeight - (readonly ? 20 : 60)}px; overflow-y: auto;`,
      },
      ...(readonly && {
        handleKeyDown: () => true, // Block all keyboard input
        handleTextInput: () => true, // Block text input
        handlePaste: () => true, // Block paste
        handleDrop: () => true, // Block drop
      }),
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!isMounted || !editor) {
    return (
      <div
        className={cn("border rounded-md p-3 bg-background", className)}
        style={{ minHeight, maxHeight: "auto" }}
      >
        Loading editor...
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rich-text-editor border rounded-md bg-white relative",
        readonly && "border-none",
        className,
      )}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .rich-text-editor .ProseMirror {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
        }
        .rich-text-editor .ProseMirror h1 {
          font-size: 2em;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .rich-text-editor .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
        }
        .rich-text-editor .ProseMirror h3 {
          font-size: 1.2em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .rich-text-editor .ProseMirror p {
          margin-bottom: 0.75rem;
        }
        .rich-text-editor .ProseMirror ul,
        .rich-text-editor .ProseMirror ol {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }
        .rich-text-editor .ProseMirror blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
        }
        .rich-text-editor .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        .rich-text-editor .ProseMirror pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .rich-text-editor .ProseMirror table {
          border-collapse: collapse;
          margin: 15px 0;
          width: 100%;
          table-layout: fixed;
        }
        .rich-text-editor .ProseMirror table th,
        .rich-text-editor .ProseMirror table td {
          border: 1px solid #e2e8f0;
          padding: 8px 12px;
          text-align: left;
          vertical-align: top;
          position: relative;
        }
        .rich-text-editor .ProseMirror table th {
          background-color: #f8fafc;
          font-weight: 600;
        }
        .rich-text-editor .ProseMirror .selectedCell {
          background-color: #e0e7ff;
        }
        .rich-text-editor .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .rich-text-editor .ProseMirror .ProseMirror-focused {
          outline: none;
        }        .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .rich-text-editor .ProseMirror mark {
          border-radius: 0.125rem;
          padding: 0;
          margin: 0;
          box-decoration-break: clone;
        }
        .rich-text-editor .ProseMirror mark[data-color="#fef08a"] {
          background-color: #fef08a;
        }
        .rich-text-editor .ProseMirror mark[data-color="#bbf7d0"] {
          background-color: #bbf7d0;
        }
        .rich-text-editor .ProseMirror mark[data-color="#bfdbfe"] {
          background-color: #bfdbfe;
        }
        .rich-text-editor .ProseMirror mark[data-color="#fbcfe8"] {
          background-color: #fbcfe8;
        }
        .rich-text-editor .ProseMirror mark[data-color="#e9d5ff"] {
          background-color: #e9d5ff;
        }
        .rich-text-editor .ProseMirror mark[data-color="#fed7aa"] {
          background-color: #fed7aa;
        }        ${
          readonly
            ? `
        .rich-text-editor .ProseMirror {
          cursor: default !important;
          caret-color: transparent !important;
        }
        .rich-text-editor .ProseMirror * {
          cursor: default !important;
        }
        .rich-text-editor .ProseMirror::selection {
          background-color: rgba(59, 130, 246, 0.1);
        }
        .rich-text-editor .ProseMirror::-moz-selection {
          background-color: rgba(59, 130, 246, 0.1);
        }
        .rich-text-editor .ProseMirror .ProseMirror-focused {
          outline: none !important;
        }
        .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          display: none !important;
        }
        `
            : ""
        }
        `,
        }}
      />
      {!readonly && <Toolbar editor={editor} />}
      {!readonly && <FloatingTableToolbar editor={editor} />}
      <FloatingHighlightToolbar editor={editor} />
      <EditorContent editor={editor} placeholder={placeholder} id={id} />
    </div>
  );
}
