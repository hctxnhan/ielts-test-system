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

// Define the toolbar options
const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: ["center", "left", "right"] }],
        ["clean"],
    ],
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
          border-radius: 0rem;
          overflow: hidden;
        }
        .rich-text-editor .ql-container {
          min-height: ${minHeight}px;
          max-height: ${maxHeight}px;
          overflow-y: auto;
          font-size: 0.875rem;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight - 42}px; /* Subtract toolbar height */
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
