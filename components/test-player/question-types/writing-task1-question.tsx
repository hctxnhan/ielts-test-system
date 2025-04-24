"use client";

import type React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import { Textarea } from "@testComponents/components/ui/textarea";
import { Button } from "@testComponents/components/ui/button";
import { Card } from "@testComponents/components/ui/card";
import { Clock, Eye, EyeOff, Award } from "lucide-react";
import type {
  WritingTask1Question,
  WritingTaskAnswer,
} from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";

interface WritingTask1QuestionProps {
  question: WritingTask1Question;
  value: WritingTaskAnswer | null;
  onChange: (value: WritingTaskAnswer) => void;
}

interface ScoringResult {
  score: number;
  feedback: string;
  ok?: boolean;
  error?: string;
}

export default function WritingTask1QuestionRenderer({
  question,
  value,
  onChange,
}: WritingTask1QuestionProps) {
  const [currentEssay, setCurrentEssay] = useState<string | null>(
    value?.text ?? null
  );
  const [aiScore, setAiScore] = useState<ScoringResult | null>(
    value?.score !== undefined && value?.feedback !== undefined
      ? { score: value.score, feedback: value.feedback }
      : null
  );
  const [isScoring, setIsScoring] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  const getEssayScore = useTestStore.getState().scoreEssayFn;

  // Update local state if the external value changes (e.g., loading from progress)
  useEffect(() => {
    setCurrentEssay(value?.text ?? null);
    setAiScore(
      value?.score !== undefined && value?.feedback !== undefined
        ? { score: value.score, feedback: value.feedback }
        : null
    );
    // Reset feedback visibility if score/feedback is cleared
    if (value?.score === undefined || value?.feedback === undefined) {
      setShowFeedback(false);
    }
  }, [value]);

  const wordCount = currentEssay
    ? (currentEssay.match(/\b\w+\b/g) || []).length
    : 0;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Function to score the essay using OpenRouter and save the essay content
  const scoreEssay = async () => {
    if (isScoring) {
      return;
    }

    if (getEssayScore === null) {
      alert("Essay scoring function is not available.");
      return;
    }

    if (!currentEssay || currentEssay.trim().length < 50) {
      alert("Please write more content before scoring.");
      return;
    }

    setIsScoring(true);

    try {
      const response = await getEssayScore({
        prompt: question.text,
        essay: currentEssay || "",
        scoringPrompt: question?.prompt || "",
      });

      if (!response.ok) {
        throw new Error("Failed to score essay");
      }

      const result = {
        score: response.score,
        feedback: response.feedback,
      };

      setAiScore(result);

      // Call onChange with the full WritingTaskAnswer object including the score and feedback
      onChange({
        text: currentEssay,
        score: result.score,
        feedback: result.feedback,
      });

      setIsScoring(false);
      setShowFeedback(true); // Automatically show feedback after scoring
    } catch (error) {
      console.error("Error scoring essay:", error);
      setIsScoring(false);
      alert("There was an error scoring your essay. Please try again later.");
    }
  };

  // Handle changes in the textarea - only update local state, don't save
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCurrentEssay(newText);
    // No auto-save - only update local state
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Writing Task 1</h3>
      </div>

      <Card className="p-4">
        <p className="font-medium mb-4">{question.text}</p>

        {question.imageUrl && (
          <div className="my-4 flex justify-center">
            <img
              src={question.imageUrl || "/placeholder.svg"}
              alt="Task visual"
              className="max-w-full max-h-[400px] object-contain border rounded-md"
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          Write at least {question.wordLimit || 150} words.
        </p>
      </Card>

      <Textarea
        value={currentEssay || ""}
        onChange={handleTextChange}
        placeholder="Write your answer here..."
        className="min-h-[300px]"
      />

      {/* Updated save notification message */}
      <div className="text-sm text-muted-foreground italic flex items-center">
        <span>
          Click &quot;Get AI Score&quot; button to save your answer and receive
          feedback. Changes are not saved automatically.
        </span>
      </div>

      <div className="flex justify-between items-center">
        <p
          className={`text-sm ${
            wordCount < (question.wordLimit || 150)
              ? "text-amber-600"
              : "text-green-600"
          }`}
        >
          Word count: {wordCount} / {question.wordLimit || 150} minimum
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scoreEssay}
            disabled={
              isScoring || !currentEssay || currentEssay.trim().length < 50
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
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  >
                    {aiScore.feedback}
                  </ReactMarkdown>
                </div>
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
