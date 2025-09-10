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
    setSubmitResultFn(async (testId, results, config) => {
      return { success: true };
    });

    setScoreEssayFn(scoreEssay);

    return () => {
      // Cleanup function - we can't pass null, so we create a no-op function
      setSubmitResultFn(async () => ({ success: false }));
      setScoreEssayFn(async () => ({ feedback: "", score: 0, ok: false }));
    };
  }, [setSubmitResultFn, setScoreEssayFn]);

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

  const loadSampleWithTipsAndVocab = () => {
    const sampleTest = {
      id: 1,
      title: "IELTS Reading Practice Test with Tips & Vocabulary",
      type: "reading",
      skill: "reading",
      description:
        "A practice reading test with helpful tips and vocabulary support.",
      instructions:
        "<p>Read the passage below and answer the questions that follow. You have 60 minutes to complete all sections.</p>",
      tips: "<h3>📚 Reading Tips</h3><ul><li><strong>Skim first:</strong> Quickly read through the passage to get the general idea before attempting questions</li><li><strong>Keywords:</strong> Identify keywords in questions and locate them in the passage</li><li><strong>Time management:</strong> Spend about 20 minutes per section</li><li><strong>Don't panic:</strong> If you can't find an answer, move on and come back later</li></ul>",
      vocabulary:
        "<h3>📖 Key Vocabulary</h3><dl><dt><strong>Biodiversity</strong></dt><dd>The variety of plant and animal life in the world or in a particular habitat</dd><dt><strong>Ecosystem</strong></dt><dd>A biological community of interacting organisms and their physical environment</dd><dt><strong>Conservation</strong></dt><dd>The protection of plants, animals, and natural areas</dd><dt><strong>Sustainable</strong></dt><dd>Able to be maintained at a certain rate or level without depleting natural resources</dd></dl>",
      sections: [
        {
          id: "bbe0906d-59ed-46be-a8a6-673bcbd83d2e",
          title: "Part 1",
          description: "",
          questions: [
            {
              id: "ae5f0453-87c3-449b-ab91-b1b34f017163",
              type: "multiple-choice",
              text: "<p>asdf</p>",
              points: 1,
              scoringStrategy: "all-or-nothing",
              index: 1,
              options: [
                {
                  id: "d8256ae6-6118-480f-97a3-8be4601f16bb",
                  text: "asdf",
                  isCorrect: true,
                },
                {
                  id: "fcc5a147-5276-4841-86c8-d86c79c0dcd0",
                  text: "asdf",
                  isCorrect: false,
                },
                {
                  id: "d59d8e11-dcac-46ba-b58c-cf6f47b8a47a",
                  text: "asdf",
                  isCorrect: false,
                },
                {
                  id: "b1f064f3-8d2a-4bbf-8571-02a60a1e131a",
                  text: "asdf",
                  isCorrect: false,
                },
              ],
              imageUrl:
                "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/image_image-1749889654261.png",
            },
            {
              id: "646dbac1-11cf-422f-b9ff-e9716711ea75",
              type: "completion",
              text: "<p>asdfasdf ___</p>",
              points: 1,
              scoringStrategy: "partial",
              index: 2,
              blanks: 1,
              subQuestions: [
                {
                  subId: "747988a5-c06a-443a-9d95-b9c18db5d054",
                  correctAnswer: "",
                  points: 1,
                  acceptableAnswers: ["asdfasdf"],
                },
              ],
              imageUrl:
                "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/image_iScreen%20Shoter%20-%20Google%20Chrome%20-%20250614152326-1749889698298.jpg",
            },
            {
              id: "99a357b4-1442-411b-b2b5-9e681d7a0858",
              type: "matching",
              text: "<p>asdfasdf</p>",
              points: 1,
              scoringStrategy: "partial",
              index: 3,
              items: [
                {
                  id: "7f32be36-f85c-4c19-8531-0c66ca16cc44",
                  text: "asdf",
                },
                {
                  id: "5dfe06e8-827e-4558-806b-9ca847c02156",
                  text: "asdf",
                },
              ],
              options: [
                {
                  id: "46f9e5a0-1e84-4d9c-8804-fc6175bb9176",
                  text: "asfd",
                },
                {
                  id: "95ca2e1a-7c07-4c82-8af2-e37a50c6e875",
                  text: "asdf",
                },
              ],
              subQuestions: [
                {
                  subId: "7a856197-a8bc-409f-9f62-ed75bbb6fe5c",
                  subIndex: 1,
                  item: "7f32be36-f85c-4c19-8531-0c66ca16cc44",
                  correctAnswer: "46f9e5a0-1e84-4d9c-8804-fc6175bb9176",
                  points: 1,
                },
                {
                  subId: "5443463d-8fb4-466d-8ce0-a5bfb9ba2235",
                  subIndex: 2,
                  item: "5dfe06e8-827e-4558-806b-9ca847c02156",
                  correctAnswer: "95ca2e1a-7c07-4c82-8af2-e37a50c6e875",
                  points: 1,
                },
              ],
              imageUrl:
                "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/image_Screenshot%202025-03-03%20at%2015.25.58-1744646016805.png",
            },
            {
              id: "53a9da8c-aa39-4de0-b4f5-ac1c38ac01e5",
              type: "pick-from-a-list",
              text: "<p>asdfasdf</p>",
              points: 1,
              scoringStrategy: "partial",
              index: 4,
              partialEndingIndex: 0,
              items: [
                {
                  id: "e610c5bb-829e-4f95-b213-0151b0671df3",
                  text: "asdfa",
                },
                {
                  id: "13b0e2e2-540a-4d3e-85f4-245e9b4cb9ee",
                  text: "asd",
                },
                {
                  id: "c88d9ef5-973c-4e62-8d8e-b54156e1ed29",
                  text: "fa",
                },
                {
                  id: "3bf68c43-d037-412b-a6e9-3648835fa456",
                  text: "sdfasdf",
                },
              ],
              subQuestions: [
                {
                  subId: "49d47559-c316-4557-bd56-54ea0728ebfc",
                  item: "e610c5bb-829e-4f95-b213-0151b0671df3",
                  correctAnswer: "true",
                  points: 1,
                },
                {
                  subId: "104f1ae7-bb9d-497a-ab27-ee9196a77a82",
                  item: "c88d9ef5-973c-4e62-8d8e-b54156e1ed29",
                  correctAnswer: "true",
                  points: 1,
                  subIndex: 1,
                },
              ],
              imageUrl:
                "https://cyjkrezxpbjoqaijhdzz.supabase.co/storage/v1/object/public/test-resources/image_listen-1747462225481.png",
            },
          ],
          duration: 600,
          readingPassage: {
            id: "e3ee3ec2-c09d-458b-ab1f-16a5ab981245",
            title: "",
            content: "",
            hasImages: false,
            imageUrls: [],
          },
        },
      ],
      totalDuration: 3600,
      totalQuestions: 1,
      skillLevel: "B2",
    };

    setTestJson(JSON.stringify(sampleTest, null, 2));
  };

  return (
    <main className="mx-auto py-10 px-4">
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
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={loadSampleWithTipsAndVocab}>
                Load Sample with Tips & Vocabulary
              </Button>
              <Button onClick={handleStartTest}>Start Test</Button>
            </div>
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

      {currentTest && <TestPlayer test={currentTest} />}
    </main>
  );
}
