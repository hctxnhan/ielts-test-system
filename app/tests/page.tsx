"use client";
import React, { useEffect } from "react";
import TestPlayer from "@testComponents/components/test-player/test-player";
import { Button } from "@testComponents/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@testComponents/components/ui/card";
import { Textarea } from "@testComponents/components/ui/textarea";
import { updateQuestionIndexes } from "@testComponents/lib/test";
import type { Test } from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";
import { useState } from "react";
import { scoreEssay } from "../actions/score-essay";

export default function TestsPage() {
  const [testJson, setTestJson] = useState("");
  const [currentTest, setCurrentTest] = useState<Test>();

  const { progress, setSubmitResultFn, setScoreEssayFn } = useTestStore();

  useEffect(() => {
    // Set the function to handle test submission
    setSubmitResultFn((result) => {
      console.log("Test submitted with result:", result);
      alert("Test submitted successfully!");
    });

    setScoreEssayFn(scoreEssay);

    return () => {
      // Cleanup function to reset the submit result function
      setSubmitResultFn(null);
      setScoreEssayFn(null);
    };
  }, [setSubmitResultFn]);

  const handleStartTest = () => {
    try {
      // Parse the JSON test object
      const testObject: Test = JSON.parse(testJson);

      const test = updateQuestionIndexes(testObject);

      setCurrentTest(test);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      alert("Invalid JSON format. Please check your input.");
    }
  };

  return (
    <main className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Test Player</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your test JSON here..."
              className="font-mono h-80"
              value={testJson}
              onChange={(e) => setTestJson(e.target.value)}
            />
            <Button className="w-full" size="lg" onClick={handleStartTest}>
              Start Test
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="h-10" />
      {progress && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {JSON.stringify(progress.answers, null, 2)}
          </p>
        </div>
      )}
      <div className="h-10" />

      {currentTest && <TestPlayer loading={false} test={currentTest} />}
    </main>
  );
}
