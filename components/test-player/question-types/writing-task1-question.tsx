"use client";

import { Button } from "@testComponents/components/ui/button";
import { Card } from "@testComponents/components/ui/card";
import { RichTextContent } from "@testComponents/components/ui/rich-text-content";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type {
  WritingTask1Question,
  WritingTask2Question,
  WritingTaskAnswer,
  UserAnswer,
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
  answer?: UserAnswer;
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
  answer,
}: WritingTask1QuestionProps) {

  const [currentEssay, setCurrentEssay] = useState<string | null>(
    value?.text ?? null
  );
  
  // Extract AI score from value prop (during answering) or answer prop (during review)
  const getAIScore = (): ScoringResult | null => {
    // First try to get from value prop (during answering mode)
    if (value?.score !== undefined && value?.feedback !== undefined) {
      return { score: value.score, feedback: value.feedback };
    }
    // Then try to get from answer prop (during review mode)
    if (answer?.score !== undefined && answer?.feedback !== undefined) {
      return { score: answer.score, feedback: answer.feedback };
    }
    return null;
  };
  
  const [aiScore, setAiScore] = useState<ScoringResult | null>(getAIScore());
  const [showFeedback, setShowFeedback] = useState(true);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  // Update local state if the external value or answer changes
  useEffect(() => {
    // Update essay text from value prop (current input) or answer prop (review mode)
    if (value?.text !== undefined) {
      setCurrentEssay(value.text);
    } else if (answer?.answer && typeof answer.answer === 'object' && (answer.answer as WritingTaskAnswer)?.text) {
      setCurrentEssay((answer.answer as WritingTaskAnswer).text);
    }
    
    // Update AI score
    const newAiScore = getAIScore();
    setAiScore(newAiScore);
    
    // Reset feedback visibility if no score/feedback
    if (!newAiScore) {
      setShowFeedback(false);
    }
  }, [value, answer]);

  // Show sample answer automatically in review mode
  useEffect(() => {
    if (showCorrectAnswer && question.sampleAnswer) {
      setShowSampleAnswer(true);
    }
  }, [showCorrectAnswer, question.sampleAnswer]);

  const wordCount = currentEssay
    ? (currentEssay.replace(/<[^>]*>/g, '').match(/\b\w+\b/g) || []).length
    : 0;

  // Handle changes in the rich text editor
  const handleTextChange = (content: string) => {
    setCurrentEssay(content);
    onChange({ text: content });
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="p-4 flex-1 max-h-[600px] overflow-auto bg-white border-gray-100 rounded-md border">
          <RichTextEditor
            value={question.text || ""}
            onChange={(content) => onQuestionHighlighted(question.id, content)}
            readonly={true}
            className={cn("leading-relaxed")}
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
        </div>
        <div className="flex-1">
          <RichTextEditor
            value={currentEssay || ""}
            onChange={handleTextChange}
            placeholder="Write your answer here..."
            className="max-h-[600px]"
            readonly={readOnly}
            minHeight={600}
            overflow={true}
          />
          <div className="flex justify-between items-center mt-2">
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
                      <EyeOff className="mr-2 h-4 w-4" /> Ẩn gợi ý
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" /> Xem gợi ý
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {aiScore !== null && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <h4 className="font-medium mb-2 flex items-center">
            <Award className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
           
            {/* AI Score: {aiScore.score.toFixed(1)} / {question.points} */}
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
          <h4 className="font-medium mb-2">Gợi ý:</h4>
          <RichTextContent
            content={question.sampleAnswer}
            className="leading-relaxed"
          />
        </Card>
      )}
    </div>
  );
}
