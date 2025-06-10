"use client";

import React from "react";
import { cn } from "@testComponents/lib/utils";

interface RichTextContentProps {
  content: string;
  className?: string;
  fontSize?: "normal" | "large" | "larger";
}

export function RichTextContent({
  content,
  className,
  fontSize = "normal",
}: RichTextContentProps) {
  const fontSizeClass =
    fontSize === "normal"
      ? "text-base"
      : fontSize === "large"
      ? "text-lg"
      : "text-xl";

  const renderRichContent = () => {
    return { __html: content };
  };

  return (
    <>
      <div
        className={cn(
          `prose dark:prose-invert max-w-none ${fontSizeClass} rich-text-content`,
          className
        )}
        dangerouslySetInnerHTML={renderRichContent()}
      />
      
      {/* Styles for rich text content */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .rich-text-content {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #374151;
        }
        .rich-text-content h1 {
          font-size: 2em;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .rich-text-content h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
        }
        .rich-text-content h3 {
          font-size: 1.2em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .rich-text-content p {
          margin-bottom: 0.75rem;
        }
        .rich-text-content ul,
        .rich-text-content ol {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }
        .rich-text-content blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
        }
        .rich-text-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        .rich-text-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 1rem 0;
        }        .rich-text-content table {
          border-collapse: collapse;
          margin: 15px 0;
          width: 100%;
          table-layout: auto;
        }
        .rich-text-content table th,
        .rich-text-content table td {
          border: 1px solid #e2e8f0;
          padding: 8px 12px;
          text-align: left;
          vertical-align: top;
          position: relative;
        }
        .rich-text-content table th {
          background-color: #f8fafc;
          font-weight: 600;
        }
        .rich-text-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .rich-text-content strong {
          font-weight: 600;
        }
        .rich-text-content em {
          font-style: italic;
        }
        .rich-text-content u {
          text-decoration: underline;
        }
        .rich-text-content s {
          text-decoration: line-through;
        }
        /* Dark mode support */
        .dark .rich-text-content {
          color: #e5e7eb;
        }
        .dark .rich-text-content blockquote {
          border-left-color: #374151;
          color: #9ca3af;
        }
        .dark .rich-text-content code {
          background-color: #374151;
        }
        .dark .rich-text-content pre {
          background-color: #374151;
        }
        .dark .rich-text-content table th,
        .dark .rich-text-content table td {
          border-color: #374151;
        }
        .dark .rich-text-content table th {
          background-color: #1f2937;
        }
        `
      }} />
    </>
  );
}
