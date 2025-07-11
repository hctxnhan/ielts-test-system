"use client";

import React, { useState } from "react";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import { RichTextContent } from "@testComponents/components/ui/rich-text-content";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@testComponents/components/ui/card";

export default function TextAlignmentTestPage() {
  const [content, setContent] = useState(`
    <h1>This is a Heading 1</h1>
    <p>This is a paragraph. You can use the alignment buttons in the toolbar to align this text left, center, right, or justify.</p>
    <h2>This is a Heading 2</h2>
    <p>Try selecting different paragraphs and headings, then click the alignment buttons to see the text alignment change.</p>
    <h3>This is a Heading 3</h3>
    <p>The alignment should work for all paragraph and heading elements. The changes will be reflected both in the editor and in the content display below.</p>
  `);

  return (
    <main className="container mx-auto py-10 px-4 max-w-6xl">
      <h1 className="text-4xl font-bold text-center mb-8">
        Text Alignment Test
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Rich Text Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Type something and test the alignment buttons..."
              minHeight={400}
            />
          </CardContent>
        </Card>

        {/* Content Display */}
        <Card>
          <CardHeader>
            <CardTitle>Content Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextContent content={content} />
          </CardContent>
        </Card>
      </div>

      {/* Raw HTML Display */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Raw HTML Output</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap">
            {content}
          </pre>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm">
            <ol>
              <li>Click inside a paragraph or heading in the editor above</li>
              <li>Look for the alignment buttons in the toolbar: 
                <span className="font-mono bg-gray-100 px-2 py-1 rounded mx-1">
                  ⫷ ≡ ⫸ ≡≡
                </span>
              </li>
              <li>Click on different alignment buttons (Left, Center, Right, Justify)</li>
              <li>Watch how the text alignment changes in both the editor and the preview</li>
              <li>Check the raw HTML output to see the inline styles being applied</li>
            </ol>
            <p className="text-sm text-gray-600 mt-4">
              <strong>Note:</strong> The alignment will be applied as inline CSS styles 
              (e.g., <code>style="text-align: center"</code>) which ensures compatibility 
              and proper rendering in both the editor and content display.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
