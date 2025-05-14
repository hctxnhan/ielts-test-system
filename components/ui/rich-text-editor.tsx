"use client";

import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { cn } from "@testComponents/lib/utils";

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
}

// Define the toolbar options to match the image exactly
const modules = {
  toolbar: [
    [{ header: [false, 1, 2, 3] }], // Normal, h1, h2, h3
    [{ font: [] }],                 // Font dropdown
    ["bold", "italic", "underline"], // Basic formatting
    [{ list: "ordered" }, { list: "bullet" }, { align: [] }], // Lists and alignment
    ["clean"],                      // Remove formatting
  ],
  clipboard: {
    matchVisual: false,
  },
};

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Enter text here...",
  className,
  minHeight = 200,
  maxHeight = 500,
}: RichTextEditorProps) {
  // Need to ensure we're client-side before rendering ReactQuill
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder while we wait for client-side rendering
    return (
      <div 
        className={cn(
          "border rounded-md p-3 bg-background", 
          className
        )}
        style={{ minHeight, maxHeight: "auto" }}
      >
        Loading editor...
      </div>
    );
  }
  return (
    <div className={cn("rich-text-editor", className)}>
      <style jsx global>{`
        .rich-text-editor .quill {
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background-color: #ffffff;
          border-color: #e2e8f0;
          padding: 8px;
        }
        .rich-text-editor .ql-container {
          min-height: ${minHeight}px;
          max-height: ${maxHeight}px;
          overflow-y: auto;
          font-size: 1rem;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          border-color: #e2e8f0;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight - 42}px; /* Subtract toolbar height */
          line-height: 1.5;
          padding: 12px 15px;
        }
        .rich-text-editor .ql-editor p {
          margin-bottom: 0.75rem;
        }
        .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-label::before,
        .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-item::before {
          content: "Normal";
        }
        .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
        .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
          content: "Heading 1";
        }
        .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
        .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
          content: "Heading 2";
        }
        .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
        .rich-text-editor .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
          content: "Heading 3";
        }
        /* Improve button and picker styling */
        .rich-text-editor .ql-snow .ql-picker {
          font-size: 14px;
        }
        .rich-text-editor .ql-snow .ql-stroke {
          stroke-width: 1.5px;
        }
        .rich-text-editor .ql-snow .ql-picker-options {
          border-color: #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        /* Adjust icon and button sizes */
        .rich-text-editor .ql-snow .ql-formats button {
          height: 24px;
          width: 24px;
          padding: 2px;
          margin: 0 1px;
        }        /* Add hover effect for better UX */
        .rich-text-editor .ql-snow .ql-formats button:hover,
        .rich-text-editor .ql-snow .ql-picker:hover {
          color: #3182ce;
        }
        /* Style the editor content like the screenshot */
        .rich-text-editor .ql-editor h1, 
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3 {
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .rich-text-editor .ql-editor h1 {
          font-size: 2em;
        }
        .rich-text-editor .ql-editor h2 {
          font-size: 1.5em;
        }
        .rich-text-editor .ql-editor h3 {
          font-size: 1.2em;
        }
      `}</style>
      <ReactQuill
        id={id}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
}
