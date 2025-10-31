"use client";

import React from "react";
import { createPortal } from "react-dom";
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
import { Extension, Node} from "@tiptap/core";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
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
  overflow?: boolean;
}



// Custom extension to allow style attributes on all nodes
const CustomTextAlign = Extension.create({
  name: 'customTextAlign',

  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {}
              }
              return {
                style: attributes.style,
              }
            },
          },
        },
      },
    ]
  },
})

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
      const _editorRect = editorElement.getBoundingClientRect();
      const tableRect = tableElement.getBoundingClientRect();

      // Wait for next frame to ensure toolbar ref is available
      requestAnimationFrame(() => {
        // Get actual toolbar dimensions if available
        const toolbarElement = toolbarRef.current;
        let toolbarWidth = 300; // Default fallback width for table toolbar
        let toolbarHeight = 50; // Default fallback height

        if (toolbarElement) {
          const rect = toolbarElement.getBoundingClientRect();
          toolbarWidth = rect.width || toolbarWidth;
          toolbarHeight = rect.height || toolbarHeight;
        }

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate initial position - above the table, aligned to left edge (viewport coordinates)
        let left = tableRect.left;
        let top = tableRect.top - toolbarHeight - 10; // 10px gap above table

        // Smart horizontal positioning
        const margin = 10;

        if (left < margin) {
          // Too far left - align to margin
          left = margin;
        } else if (left + toolbarWidth > viewportWidth - margin) {
          // Too far right - align to right margin
          left = viewportWidth - toolbarWidth - margin;
        }

        // Smart vertical positioning        
        if (top < margin) {
          // Not enough space above - position below table
          top = tableRect.bottom + 10;
          
          // Check if there's enough space below
          if (top + toolbarHeight > viewportHeight - margin) {
            // Not enough space below either - use best available position
            const availableSpaceAbove = tableRect.top - margin;
            const availableSpaceBelow = viewportHeight - tableRect.bottom - margin;
            
            if (availableSpaceAbove >= toolbarHeight) {
              // Use space above
              top = tableRect.top - toolbarHeight - 5;
            } else if (availableSpaceBelow >= toolbarHeight) {
              // Use space below
              top = tableRect.bottom + 5;
            } else {
              // Force position with best fit
              if (availableSpaceAbove > availableSpaceBelow) {
                top = tableRect.top - toolbarHeight - 5;
              } else {
                top = tableRect.bottom + 5;
              }
            }
          }
        }

        // Final boundary check
        if (left + toolbarWidth > viewportWidth) {
          left = viewportWidth - toolbarWidth;
        }
        if (left < 0) {
          left = 0;
        }
        if (top + toolbarHeight > viewportHeight) {
          top = viewportHeight - toolbarHeight;
        }
        if (top < 0) {
          top = 0;
        }

        setPosition({ top, left });
        setIsVisible(true);
      });
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      // Small delay to ensure DOM is updated
      setTimeout(updatePosition, 10);
    };

    const handleResize = () => {
      // Reposition on window resize
      setTimeout(updatePosition, 10);
    };

    const handleScroll = () => {
      // Reposition on scroll
      setTimeout(updatePosition, 10);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const toolbarElement = toolbarRef.current;
      const editorElement = editor.view.dom;
      
      // Don't close if clicking inside the toolbar or editor
      if (
        toolbarElement?.contains(target) || 
        editorElement?.contains(target)
      ) {
        return;
      }
      
      // Close the toolbar if clicking outside
      setIsVisible(false);
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    editor.on("update", handleSelectionUpdate);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
      }
    };

    // Add click outside and escape key listeners when toolbar is visible
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
      editor.off("update", handleSelectionUpdate);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [editor, updatePosition, isVisible]);

  if (!isVisible || !editor?.isActive("table")) {
    return null;
  }

  const toolbarContent = (
    <div
      ref={toolbarRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
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

  // Use portal to render outside of any overflow containers
  return typeof window !== 'undefined' 
    ? createPortal(toolbarContent, document.body)
    : null;
};

// Floating Highlight Toolbar Component
const FloatingHighlightToolbar = ({ editor, readonly = false }: { editor: Editor | null; readonly?: boolean }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);
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
    if (!editor) return;

    // In readonly mode, we need to temporarily enable editing for highlighting
    if (readonly) {
      const wasEditable = editor.isEditable;
      editor.setEditable(true);

      // If the same color is already applied, remove the highlight
      const currentHighlight = editor.getAttributes("highlight");
      if (currentHighlight?.color === color) {
        editor.chain().focus().unsetHighlight().run();
      } else {
        editor.chain().focus().toggleHighlight({ color }).run();
      }

      // Restore readonly state
      editor.setEditable(wasEditable);
    } else {
      // Normal mode
      const currentHighlight = editor.getAttributes("highlight");
      if (currentHighlight?.color === color) {
        editor.chain().focus().unsetHighlight().run();
      } else {
        editor.chain().focus().toggleHighlight({ color }).run();
      }
    }
  };

  const removeHighlight = () => {
    if (!editor) return;

    if (readonly) {
      const wasEditable = editor.isEditable;
      editor.setEditable(true);
      editor.chain().focus().unsetHighlight().run();
      editor.setEditable(wasEditable);
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
  };

  const updatePosition = useCallback(() => {
    if (!editor) return;

    const { selection } = editor.state;
    const { from, to } = selection;

    // Only show if there's a text selection of more than 1 character
    if (from === to || to - from <= 1) {
      setIsVisible(false);
      setUserDismissed(false); // Reset dismissal when no selection
      return;
    }

    // Don't show if user has dismissed the toolbar for this selection
    if (userDismissed) {
      return;
    }

    // Get the DOM representation of the selection
    const { view } = editor;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    if (start && end) {
      const editorElement = view.dom;
      const _editorRect = editorElement.getBoundingClientRect();

      // Wait for next frame to ensure toolbar ref is available
      requestAnimationFrame(() => {
        // Get actual toolbar dimensions if available
        const toolbarElement = toolbarRef.current;
        let toolbarWidth = 280; // Default fallback width
        let toolbarHeight = 50; // Default fallback height

        if (toolbarElement) {
          const toolbarRect = toolbarElement.getBoundingClientRect();
          toolbarWidth = toolbarRect.width || toolbarWidth;
          toolbarHeight = toolbarRect.height || toolbarHeight;
        }

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate initial position - center horizontally above selection (viewport coordinates)
        const selectionCenterX = (start.left + end.left) / 2;
        let left = selectionCenterX - (toolbarWidth / 2);
        let top = start.top - toolbarHeight - 10; // 10px gap above selection

        // Smart horizontal positioning
        const margin = 10; // Minimum margin from viewport edges

        if (left < margin) {
          // Too far left - align to left margin
          left = margin;
        } else if (left + toolbarWidth > viewportWidth - margin) {
          // Too far right - align to right margin  
          left = viewportWidth - toolbarWidth - margin;
        }

        // Smart vertical positioning
        const selectionBottom = end.top;

        if (top < margin) {
          // Not enough space above - position below selection
          top = selectionBottom + 10;
          
          // Check if there's enough space below
          if (top + toolbarHeight > viewportHeight - margin) {
            // Not enough space below either - position in viewport center or best available spot
            const availableSpaceAbove = start.top - margin;
            const availableSpaceBelow = viewportHeight - selectionBottom - margin;
            
            if (availableSpaceAbove > availableSpaceBelow && availableSpaceAbove >= toolbarHeight) {
              // Use space above
              top = start.top - toolbarHeight - 5;
            } else if (availableSpaceBelow >= toolbarHeight) {
              // Use space below
              top = selectionBottom + 5;
            } else {
              // Force position with best fit - favor above if possible
              if (availableSpaceAbove >= toolbarHeight / 2) {
                top = start.top - toolbarHeight - 5;
              } else {
                top = selectionBottom + 5;
              }
            }
          }
        }

        // Final boundary check - ensure toolbar is never completely outside viewport
        if (left + toolbarWidth > viewportWidth) {
          left = viewportWidth - toolbarWidth;
        }
        if (left < 0) {
          left = 0;
        }
        if (top + toolbarHeight > viewportHeight) {
          top = viewportHeight - toolbarHeight;
        }
        if (top < 0) {
          top = 0;
        }

        setPosition({ top, left });
        setIsVisible(true);
      });
    }
  }, [editor, userDismissed]);

  useEffect(() => {
    if (!editor) return;

    const handleMouseUp = () => {
      // Small delay to ensure DOM is updated and to distinguish between click and selection
      setTimeout(updatePosition, 100);
    };

    const handleResize = () => {
      // Reposition on window resize
      setTimeout(updatePosition, 10);
    };

    const handleScroll = () => {
      // Reposition on scroll
      setTimeout(updatePosition, 10);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const toolbarElement = toolbarRef.current;
      const editorElement = editor.view.dom;
      
      // Don't close if clicking inside the toolbar
      if (toolbarElement?.contains(target)) {
        return;
      }
      
      // For highlight toolbar, we need to be more careful about clicks in the editor
      // Only close if clicking outside both toolbar and editor, or if there's no selection
      if (!editorElement?.contains(target)) {
        // Clicking completely outside - close immediately and mark as user dismissed
        setIsVisible(false);
        setUserDismissed(true);
      } else {
        // Clicking inside editor - check if there will still be a selection after a short delay
        setTimeout(() => {
          const { selection } = editor.state;
          const { from, to } = selection;
          if (from === to || to - from <= 1) {
            setIsVisible(false);
            setUserDismissed(false); // Reset since selection changed naturally
          }
        }, 50);
      }
    };

    // Add event listeners
    const editorElement = editor.view.dom;
    editorElement.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
        setUserDismissed(true);
      }
    };

    // Add click outside and escape key listeners when toolbar is visible
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      editorElement.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [editor, updatePosition, isVisible, userDismissed]);

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
  
  const toolbarContent = (
    <div
      ref={toolbarRef}
      className="fixed bg-white border border-gray-200 rounded-md shadow-lg p-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
    >
      <div className="flex gap-1">
        {colors.map((color) => (
          <button
            key={color.value}
            className={`w-6 h-6 rounded border hover:border-gray-400 ${color.class} ${currentColor === color.value
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

  // Use portal to render outside of any overflow containers
  return typeof window !== 'undefined' 
    ? createPortal(toolbarContent, document.body)
    : null;
};

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  const [currentAlignment, setCurrentAlignment] = useState('left');

  if (!editor) return null;

  // Update current alignment when selection changes
  useEffect(() => {
    if (!editor) return;

    const updateAlignment = () => {
      const alignment = getCurrentAlignment();
      setCurrentAlignment(alignment);
    };

    // Update on selection change
    editor.on('selectionUpdate', updateAlignment);
    editor.on('update', updateAlignment);

    // Initial update
    updateAlignment();

    return () => {
      editor.off('selectionUpdate', updateAlignment);
      editor.off('update', updateAlignment);
    };
  }, [editor]);

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const setTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    // Focus the editor first
    editor.commands.focus();

    // Get the current selection
    const { from: _from, to: _to } = editor.state.selection;
    // Use a more direct approach to set node attributes
    const _success = editor.chain()
      .command(({ tr, state }) => {
        const { from, to } = state.selection;

        // Apply text-align style to all block nodes in selection
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === 'paragraph' || node.type.name.startsWith('heading')) {
            const currentStyle = node.attrs.style || '';
            // Remove existing text-align styles
            const cleanStyle = currentStyle.replace(/text-align:\s*[^;]+;?\s*/g, '').trim();
            // Add new text-align style
            const newStyle = cleanStyle
              ? `${cleanStyle}; text-align: ${alignment}`
              : `text-align: ${alignment}`;

            // Apply the new style
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              style: newStyle
            });

          }
        });

        return true;
      })
      .run();

    // Force a re-render to update the current alignment state
    setTimeout(() => {
      const alignment = getCurrentAlignment();
      setCurrentAlignment(alignment);
    }, 10);
  };

  const getCurrentAlignment = () => {
    const { state } = editor;
    const { $from } = state.selection;

    // Try to get the alignment from the current node
    let currentNode = $from.node($from.depth);

    // If we're in a text node, get the parent node
    if (currentNode.type.name === 'text') {
      currentNode = $from.node($from.depth - 1);
    }

    // Check for inline style
    if (currentNode && currentNode.attrs && currentNode.attrs.style) {
      const match = currentNode.attrs.style.match(/text-align:\s*([^;]+)/);
      if (match) {
        return match[1].trim();
      }
    }

    // Check for class-based alignment
    if (currentNode && currentNode.attrs && currentNode.attrs.class) {
      const classes = currentNode.attrs.class.split(' ');
      for (const cls of classes) {
        if (cls.startsWith('text-')) {
          const alignment = cls.replace('text-', '');
          if (['left', 'center', 'right', 'justify'].includes(alignment)) {
            return alignment;
          }
        }
      }
    }

    return 'left';
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
        variant={currentAlignment === "left" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTextAlign("left")}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        variant={currentAlignment === "center" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTextAlign("center")}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        variant={currentAlignment === "right" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTextAlign("right")}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </Button>
      <Button
        variant={currentAlignment === "justify" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTextAlign("justify")}
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
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
  overflow = false,
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
      CustomTextAlign,
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
      // Always invoke onChange, even in readonly mode (for highlights)
      onChange(editor.getHTML());
    },
    editable: !readonly,
    editorProps: {
      attributes: {
        class: cn(
          // Removed: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto"
          "min-h-[150px]",
          readonly && "cursor-default select-text",
        ),
        // style: `min-height: ${minHeight - (readonly ? 20 : 60)}px; overflow-y: auto;`,
        style: `min-height: ${minHeight - (readonly ? 20 : 60)}px; overflow-y: ${overflow ? "auto" : "hidden"};`,
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
        // readonly && "border-none",
        readonly ? "border-none cursor-default select-text" : "focus:outline-none focus:ring-0",
        overflow ? "overflow-y-auto" : "overflow-hidden",
        className,
      )}
      style={{ minHeight }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .rich-text-editor .ProseMirror {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
          padding: 12px 16px;
          caret-color: #111;
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
        .rich-text-editor .ProseMirror h1[style*="text-align"],
        .rich-text-editor .ProseMirror h2[style*="text-align"],
        .rich-text-editor .ProseMirror h3[style*="text-align"],
        .rich-text-editor .ProseMirror p[style*="text-align"] {
          /* Inline text-align styles will be preserved and applied */
        }
        /* Fallback text alignment utility classes */
        .rich-text-editor .ProseMirror .text-left {
          text-align: left !important;
        }
        .rich-text-editor .ProseMirror .text-center {
          text-align: center !important;
        }
        .rich-text-editor .ProseMirror .text-right {
          text-align: right !important;
        }
        .rich-text-editor .ProseMirror .text-justify {
          text-align: justify !important;
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
        }        ${readonly
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
        .rich-text-editor .ProseMirror:focus {
          outline: none !important; 
          box-shadow: none !important;
        }
        .rich-text-editor .ProseMirror {
  caret-color: #111 !important;
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
      <FloatingHighlightToolbar editor={editor} readonly={readonly} />
      <EditorContent editor={editor} placeholder={placeholder} id={id} />
    </div>
  );
}
