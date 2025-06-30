"use client";

import { AutoResizeTextarea } from "@testComponents/components/ui/auto-resize-textarea";
import { Button } from "@testComponents/components/ui/button";
import { Card } from "@testComponents/components/ui/card";
import { RichTextContent } from "@testComponents/components/ui/rich-text-content";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type {
  WritingTask1Question,
  WritingTask2Question,
  WritingTaskAnswer,
} from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";
import { Award, Eye, EyeOff } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface WritingTask1QuestionProps {
  question: WritingTask1Question | WritingTask2Question;
  value: WritingTaskAnswer | null;
  onChange: (value: WritingTaskAnswer) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (questionId: string, content: string) => void;
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
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => {},
}: WritingTask1QuestionProps) {
  const [currentEssay, setCurrentEssay] = useState<string | null>(
    value?.text ?? null,
  );
  const [aiScore, setAiScore] = useState<ScoringResult | null>(
    value?.score !== undefined && value?.feedback !== undefined
      ? { score: value.score, feedback: value.feedback }
      : null,
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  // Update local state if the external value changes (e.g., loading from progress)
  useEffect(() => {
    setCurrentEssay(value?.text ?? null);
    setAiScore(
      value?.score !== undefined && value?.feedback !== undefined
        ? { score: value.score, feedback: value.feedback }
        : null,
    );
    // Reset feedback visibility if score/feedback is cleared
    if (value?.score === undefined || value?.feedback === undefined) {
      setShowFeedback(false);
    }
  }, [value]);

  // Show sample answer automatically in review mode
  useEffect(() => {
    if (showCorrectAnswer && question.sampleAnswer) {
      setShowSampleAnswer(true);
    }
  }, [showCorrectAnswer, question.sampleAnswer]);

  const wordCount = currentEssay
    ? (currentEssay.match(/\b\w+\b/g) || []).length
    : 0;

  // Handle changes in the textarea - only update local state, don't save
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCurrentEssay(newText);
    // No auto-save - only update local state
    // onChange({ text: newText, score: aiScore?.score, feedback: aiScore?.feedback });
    onChange({ text: newText });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Writing Task 1</h3>
      </div>{" "}
      <Card className="p-4">
        <RichTextEditor
          value={question.text || ""}
          onChange={(content) => onQuestionHighlighted(question.id, content)}
          readonly={true}
          className={cn(
            "leading-relaxed w-full h-full",
          )}
          minHeight={100}
        />{" "}
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
      <AutoResizeTextarea
        value={currentEssay || ""}
        onChange={handleTextChange}
        placeholder="Write your answer here..."
        className="min-h-[300px]"
        disabled={readOnly}
        minRows={20}
        maxRows={40}
      />
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
          {question.sampleAnswer && (showCorrectAnswer || !readOnly) && (
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
            AI Score: {aiScore.score.toFixed(1)} / {question.points}
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
