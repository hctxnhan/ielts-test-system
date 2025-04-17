"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Textarea } from "@testComponents/components/ui/textarea";
import { Button } from "@testComponents/components/ui/button";
import { Card } from "@testComponents/components/ui/card";
import { Clock, Eye, EyeOff, Award } from "lucide-react";
import type { WritingTask2Question } from "@testComponents/lib/types";

interface WritingTask2QuestionProps {
  question: WritingTask2Question;
  value: string | null;
  onChange: (value: {
    text: string | null;
    score?: number;
    feedback?: string;
  }) => void;
}

interface ScoringResult {
  score: number;
  feedback: string;
}

export default function WritingTask2QuestionRenderer({
  question,
  value,
  onChange,
}: WritingTask2QuestionProps) {
  const [wordCount, setWordCount] = useState(0);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(40 * 60); // 40 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [aiScore, setAiScore] = useState<ScoringResult | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Calculate word count when answer changes
  useEffect(() => {
    if (value?.text) {
      const words = value.text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [value?.text]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Function to score the essay using OpenRouter
  const scoreEssay = async () => {
    if (!value?.text || value.text.trim().length < 100) {
      alert("Please write more content before scoring.");
      return;
    }

    setIsScoring(true);

    try {
      const response = await fetch("/api/score-essay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: question.prompt,
          essay: value.text,
          scoringPrompt: question.scoringPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to score essay");
      }

      const result = await response.json();
      setAiScore(result);

      // Store the score and feedback in the test store
      onChange({
        text: value.text,
        score: result.score,
        feedback: result.feedback,
      });

      setIsScoring(false);
    } catch (error) {
      console.error("Error scoring essay:", error);
      setIsScoring(false);
      alert("There was an error scoring your essay. Please try again later.");
    }
  };

  // Update the onChange handler to properly handle the text value
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      text: e.target.value,
      ...(value && typeof value === "object" && "score" in value
        ? { score: value.score, feedback: value.feedback }
        : {}),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Writing Task 2</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={timerActive ? "default" : "outline"}
            size="sm"
            onClick={() => setTimerActive(!timerActive)}
          >
            <Clock className="mr-2 h-4 w-4" />
            {formatTime(timeRemaining)}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <p className="font-medium mb-4">{question.prompt}</p>

        <p className="text-sm text-muted-foreground mb-4">
          Write at least {question.wordLimit} words. You should spend about 40
          minutes on this task.
        </p>
      </Card>

      <Textarea
        value={
          typeof value === "object" && value !== null ? value.text || "" : ""
        }
        onChange={handleTextChange}
        placeholder="Write your essay here..."
        className="min-h-[400px]"
      />

      <div className="flex justify-between items-center">
        <p
          className={`text-sm ${
            wordCount < question.wordLimit ? "text-amber-600" : "text-green-600"
          }`}
        >
          Word count: {wordCount} / {question.wordLimit} minimum
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scoreEssay}
            disabled={
              isScoring || !value?.text || value.text.trim().length < 100
            }
          >
            <Award className="mr-2 h-4 w-4" />
            {isScoring ? "Scoring..." : "Get AI Score"}
          </Button>

          {question.sampleAnswer && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSampleAnswer(!showSampleAnswer)}
            >
              {showSampleAnswer ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" /> Hide Sample Answer
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" /> View Sample Answer
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {aiScore !== null && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <h4 className="font-medium mb-2 flex items-center">
            <Award className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
            AI Score: {aiScore.score.toFixed(1)} / 9.0
          </h4>

          <div className="mt-2">
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowFeedback(!showFeedback)}
              className="p-0 h-auto text-green-600 dark:text-green-400"
            >
              {showFeedback ? "Hide feedback" : "Show feedback"}
            </Button>

            {showFeedback && (
              <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-md text-sm">
                <p className="whitespace-pre-line">{aiScore.feedback}</p>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            This is an automated score generated by AI. In a real IELTS test,
            your writing would be scored by human examiners.
          </p>
        </Card>
      )}

      {showSampleAnswer && question.sampleAnswer && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-2">Sample Answer:</h4>
          <p className="whitespace-pre-line">{question.sampleAnswer}</p>
        </Card>
      )}
    </div>
  );
}
