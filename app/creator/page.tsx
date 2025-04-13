"use client";

import { TestCreator } from "@/components/creator/test-creator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Test } from "@/lib/types";
import { useState } from "react";

export default function CreatorPage() {
  const [defaultTest, setDefaultTest] = useState<Test>();
  const [savedTest, setSavedTest] = useState<Test>();
  const [testType, setTestType] = useState<string>("reading");
  return (
    <>
      <TestCreator
        defaultTest={defaultTest}
        testType={testType}
        onTestCreateSubmit={(test) => {
          setSavedTest(test);
        }}
      />

      <Input
        type="text"
        placeholder="Test Type"
        className="mb-4  mt-40"
        value={testType}
        onChange={(e) => {
          setTestType(e.target.value);
        }}
      />

      <Textarea
        placeholder="Paste your test JSON here..."
        className="font-mono h-80"
        value={JSON.stringify(savedTest, null, 2)}
        onChange={(e) => {
          try {
            const parsedTest: Test = JSON.parse(e.target.value);
            setDefaultTest(parsedTest);
          } catch (error) {
            console.error("Invalid JSON:", error);
          }
        }}
      />

      <div
        className="mt-4"
        onClick={() => {
          // copy to clipboard
          navigator.clipboard.writeText(JSON.stringify(savedTest, null, 2));
        }}
      >
        <h2 className="text-lg font-semibold">Saved Test JSON</h2>
        <pre className="bg-gray-100 p-4 rounded-md">
          {JSON.stringify(savedTest, null, 2)}
        </pre>
      </div>
    </>
  );
}
