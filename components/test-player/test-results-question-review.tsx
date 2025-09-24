"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@testComponents/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@testComponents/components/ui/tabs";
import { Badge } from "@testComponents/components/ui/badge";
import { Award, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Question, UserAnswer } from "@testComponents/lib/types";
import QuestionRenderer from "./question-renderer";

// Simple display functions for answers
const displayFormattedAnswer = (question: Question, answer: UserAnswer | null) => {
  if (!answer?.answer) return "No answer provided";
  if (typeof answer.answer === "string") return answer.answer;
  if (typeof answer.answer === "object") return JSON.stringify(answer.answer);
  return String(answer.answer);
};

const displayCorrectAnswer = (question: Question) => {
  if (!question.correctAnswer) return "No correct answer available";
  if (typeof question.correctAnswer === "string") return question.correctAnswer;
  if (typeof question.correctAnswer === "object") return JSON.stringify(question.correctAnswer);
  return String(question.correctAnswer);
};

interface TestResultsQuestionReviewProps {
  question: Question & {
    sectionId: string;
    sectionTitle: string;
    originalQuestion?: Question; // Original parent question for sub-questions
  };
  answer: UserAnswer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sampleAnswer?: string;
  _isSubQuestion?: boolean;
  _subQuestionData?: Record<string, any>;
}

export default function TestResultsQuestionReview({
  question,
  answer,
  open,
  onOpenChange,
  sampleAnswer,
  _isSubQuestion,
  _subQuestionData,
}: TestResultsQuestionReviewProps) {
  // If this is a sub-question, we might need to reference the original question for some data
  const _originalQuestion = question.originalQuestion;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Question Review
            <Badge variant="outline" className="ml-2">
              {question.sectionTitle}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="question" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="question">Question</TabsTrigger>
            <TabsTrigger value="your-answer">Your Answer</TabsTrigger>
            <TabsTrigger value="correct-answer">Correct Answer</TabsTrigger>
          </TabsList>

          <TabsContent value="question" className="p-4 border rounded-md mt-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">{question.text}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{question.type}</Badge>
                <Badge variant="outline">{question.points} points</Badge>
                {answer && (
                  <Badge
                    variant={
                      answer.isCorrect
                        ? "default"
                        : (answer.score || 0) > 0 && (answer.score || 0) < (answer.maxScore || 0)
                        ? "secondary"
                        : "destructive"
                    }
                    className={`${
                      answer.isCorrect
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : (answer.score || 0) > 0 && (answer.score || 0) < (answer.maxScore || 0)
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }`}
                  >
                    {answer.isCorrect
                      ? "Correct"
                      : (answer.score || 0) > 0 && (answer.score || 0) < (answer.maxScore || 0)
                      ? "Partially Correct"
                      : "Incorrect"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="border p-4 rounded-md bg-muted/30">
              <QuestionRenderer
                question={question}
                sectionId={question.sectionId}
                answers={{}}
                isReviewMode={true}
              />
            </div>
          </TabsContent>

          <TabsContent
            value="your-answer"
            className="p-4 border rounded-md mt-4"
          >
            <h3 className="text-lg font-medium mb-4">Your Answer</h3>

            {answer ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/30">
                  {question.type === "writing-task1" ||
                  question.type === "writing-task2" ? (
                    <div className="whitespace-pre-line">{answer.answer}</div>
                  ) : (
                    <p>{displayFormattedAnswer(question, answer.answer)}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Score:</span>
                  <span>
                    {answer.score} / {answer.maxScore}
                  </span>
                </div>

                {/* Scoring Feedback for all question types */}
                {answer.feedback && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Award className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                      {question.type === "writing-task1" || question.type === "writing-task2" 
                        ? "AI Feedback" 
                        : "Answer Feedback"}
                    </h4>
                    <div className="whitespace-pre-line text-sm">
                      {answer.feedback}
                    </div>
                  </div>
                )}

                {/* Legacy AI Scoring Feedback for writing tasks (kept for backward compatibility) */}
                {(question.type === "writing-task1" ||
                  question.type === "writing-task2") &&
                  answer.answer &&
                  answer.feedback && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Award className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                        AI Feedback
                      </h4>
                      <div className="whitespace-pre-line text-sm">
                        {answer.feedback}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="p-4 border rounded-md bg-muted/30 text-muted-foreground">
                You did not answer this question.
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="correct-answer"
            className="p-4 border rounded-md mt-4"
          >
            <h3 className="text-lg font-medium mb-4">Correct Answer</h3>

            <div className="p-4 border rounded-md bg-muted/30">
              {question.type === "writing-task1" ||
              question.type === "writing-task2" ? (
                <div>
                  {sampleAnswer || question.sampleAnswer ? (
                    <div>
                      <h4 className="font-medium mb-2">Sample Answer:</h4>
                      <div className="whitespace-pre-line">
                        {sampleAnswer || question.sampleAnswer}
                      </div>
                    </div>
                  ) : (
                    <p>
                      Writing tasks are evaluated based on multiple criteria
                      including task achievement, coherence and cohesion,
                      lexical resource, and grammatical range and accuracy.
                    </p>
                  )}
                </div>
              ) : (
                <p>{displayCorrectAnswer(question)}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
