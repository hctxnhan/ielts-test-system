"use client";

import { useState } from "react";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import { Button } from "@testComponents/components/ui/button";

export default function ReadOnlyDemo() {
  const [content, setContent] = useState(`
    <h1>Reading Passage: The History of Coffee</h1>
    <p>Coffee is one of the world's most beloved beverages, with a rich history spanning centuries. The story of coffee begins in the ancient highlands of Ethiopia, where legend has it that a goat herder named Kaldi discovered the energizing effects of coffee beans.</p>
    
    <h2>Origins and Early Spread</h2>
    <p>From Ethiopia, coffee cultivation spread to Yemen in the 15th century, where it became an important trade commodity. The port city of Mocha became a major center for coffee trade, giving its name to the famous variety of coffee we know today.</p>
    
    <blockquote>
      "Coffee has always been more than just a beverage; it has been a catalyst for social interaction and intellectual discourse throughout history."
    </blockquote>
    
    <h3>The Coffee House Culture</h3>
    <p>In the 17th century, coffee houses began appearing in major European cities. These establishments quickly became known as "penny universities" because for the price of a cup of coffee, one could engage in stimulating conversation and debate with scholars, merchants, and artists.</p>
    
    <p>The <strong>social impact</strong> of coffee houses cannot be overstated. They served as:</p>
    <ul>
      <li>Meeting places for intellectuals and revolutionaries</li>
      <li>Centers for business transactions</li>
      <li>Venues for political discussions</li>
      <li>Hubs for the exchange of news and ideas</li>
    </ul>
    
    <h2>Modern Coffee Culture</h2>
    <p>Today, coffee culture continues to evolve. From the <em>third wave coffee movement</em> that treats coffee as an artisanal craft, to the rise of sustainable and fair-trade practices, the world of coffee remains dynamic and ever-changing.</p>
    
    <p>Whether you prefer a simple black coffee or an elaborate specialty drink, coffee continues to bring people together and fuel our daily lives in ways that Kaldi the goat herder could never have imagined.</p>
  `);

  const [isReadonly, setIsReadonly] = useState(true);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">
          Rich Text Editor - Readonly Mode Demo
        </h1>
        <p className="text-gray-600 mb-4">
          This demo shows the rich text editor in readonly mode. In this mode,
          users can only read and highlight text - no editing cursor, no
          toolbar, just clean text with highlighting capability.
        </p>

        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setIsReadonly(true)}
            variant={isReadonly ? "default" : "outline"}
          >
            Readonly Mode
          </Button>
          <Button
            onClick={() => setIsReadonly(false)}
            variant={!isReadonly ? "default" : "outline"}
          >
            Edit Mode
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {isReadonly ? "Readonly Mode" : "Edit Mode"}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {isReadonly
              ? "Select text to highlight it. No editing cursor or toolbar visible."
              : "Full editing capabilities with toolbar and formatting options."}
          </p>
          <RichTextEditor
            value={content}
            onChange={setContent}
            readonly={isReadonly}
            minHeight={400}
            className="border-2"
          />
        </div>

        {isReadonly && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Readonly Mode Features:
            </h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• No editing cursor or text insertion</li>
              <li>• No toolbar for formatting</li>
              <li>• Text selection works for highlighting</li>
              <li>• Floating highlight toolbar appears on text selection</li>
              <li>• Clean, document-like appearance</li>
              <li>• Perfect for reading comprehension tasks</li>
            </ul>
          </div>
        )}

        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">HTML Output:</h3>
          <pre className="bg-white border rounded p-3 text-xs overflow-auto max-h-40">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
