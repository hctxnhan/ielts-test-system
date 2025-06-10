"use client";
import React from "react";
import { useState } from "react";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";

export default function HighlightDemoPage() {
  const [content, setContent] = useState(`
    <h2>Text Highlighting Demo</h2>
    <p>Welcome to the rich text editor with highlighting functionality!</p>
    
    <h3>How to use highlighting:</h3>
    <ol>
      <li>Select any text you want to highlight</li>
      <li>Click the highlighter icon in the toolbar</li>
      <li>Choose a color from the dropdown menu</li>
      <li>To remove highlighting, select highlighted text and click "Remove Highlight"</li>
    </ol>
    
    <h3>Features:</h3>
    <ul>
      <li><strong>Multiple colors:</strong> Yellow, Green, Blue, Pink, Purple, and Orange</li>
      <li><strong>Smart toggling:</strong> Click the same color to remove highlighting</li>
      <li><strong>Visual feedback:</strong> Current highlight color is shown with a ring</li>
      <li><strong>Remove option:</strong> Dedicated button to remove all highlighting</li>
    </ul>
    
    <p>Try highlighting different parts of this text with different colors!</p>
    
    <blockquote>
      "The power of highlighting text helps readers focus on important information and improves comprehension."
    </blockquote>
    
    <p>You can also combine highlighting with other formatting like <strong>bold</strong>, <em>italic</em>, and <u>underline</u>.</p>
  `);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Rich Text Editor - Highlight Feature Demo
          </h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Instructions:
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-blue-800">
                <li>
                  • Select text and click the <strong>highlighter icon</strong>{" "}
                  in the toolbar
                </li>
                <li>
                  • Choose from <strong>6 different colors</strong> in the
                  dropdown
                </li>
                <li>
                  • Click the same color again to{" "}
                  <strong>remove highlighting</strong>
                </li>
                <li>
                  • Use the <strong>"Remove Highlight"</strong> button to clear
                  all highlighting
                </li>
                <li>
                  • The current highlight color is shown with a{" "}
                  <strong>dark border and ring</strong>
                </li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg">
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start typing or highlighting text..."
              minHeight={400}
              maxHeight={600}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Raw HTML Output:
            </h3>
            <pre className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-sm overflow-auto max-h-48">
              {content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
