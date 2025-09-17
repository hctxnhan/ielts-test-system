"use client";

import { Button } from "@testComponents/components/ui/button";
import { Card } from "@testComponents/components/ui/card";
import { Input } from "@testComponents/components/ui/input";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type { WordFormQuestion, UserAnswer } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";
import { Award, Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface WordFormQuestionProps {
  question: WordFormQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (questionId: string, content: string) => void;
  answer?: UserAnswer;
}

export default function WordFormQuestionRenderer({
  question,
  value = {},
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => {},
  answer,
}: WordFormQuestionProps) {
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  // Extract AI scores from the answer prop
  const aiScores = React.useMemo(() => {
    const scores: Record<string, { score: number; feedback: string }> = {};
    
    // The answer prop is actually the entire answers object containing individual exercise results
    if (answer && typeof answer === 'object') {
      // Iterate through all answer entries to find ones belonging to this question
      Object.values(answer).forEach((answerEntry: {
        questionId?: string;
        subQuestionId?: string;
        score?: number;
        feedback?: string;
      }) => {
        if (answerEntry.questionId === question.id && answerEntry.subQuestionId) {
          scores[answerEntry.subQuestionId] = {
            score: answerEntry.score || 0, // Score is already in decimal format (0-1)
            feedback: answerEntry.feedback || ""
          };
        }
      });
    }
    
    return scores;
  }, [answer, question]);

  // Handle both question formats: single exercise and multiple exercises
  interface ExtendedQuestion extends WordFormQuestion {
    sentence?: string;
    baseWord?: string;
    correctForm?: string;
  }
  
  const questionData = question as ExtendedQuestion;
  const exercises = question.exercises || (questionData.sentence ? [{
    id: question.id,
    sentence: questionData.sentence,
    baseWord: questionData.baseWord || "",
    correctForm: questionData.correctForm || "",
    position: 0
  }] : []);

  // Initialize feedback visibility for exercises that have AI scores
  useEffect(() => {
    if (showCorrectAnswer) {
      const initialFeedback: Record<string, boolean> = {};
      exercises.forEach(exercise => {
        if (aiScores[exercise.id]) {
          initialFeedback[exercise.id] = true;
        }
      });
      setShowFeedback(initialFeedback);
    }
  }, [showCorrectAnswer, exercises, aiScores]);

  const handleChange = (exerciseId: string, newValue: string) => {
    if (readOnly) return;

    const newAnswers = { ...(value || {}) };
    newAnswers[exerciseId] = newValue;

    onChange(newAnswers, exerciseId);
  };

  // Function to render sentence with blank
  const renderSentenceWithBlank = (sentence: string, baseWord: string, exerciseId: string, isCorrect: boolean, isIncorrect: boolean) => {
    const userAnswer = value?.[exerciseId] || "";
    
    // Replace placeholder with input field
    const parts = sentence.split(/\[\[.*?\]\]|\b_+\b/);
    if (parts.length < 2) {
      // Fallback: add blank at the end if no placeholder found
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <span>{sentence}</span>
          <div className="inline-flex items-center gap-2">
            <Input
              value={userAnswer}
              onChange={(e) => handleChange(exerciseId, e.target.value)}
              placeholder="..."
              className={cn(
                "w-32 h-8 text-sm inline-block",
                isCorrect && "border-green-500 bg-green-50/50",
                isIncorrect && "border-red-500 bg-red-50/50"
              )}
              readOnly={readOnly}
            />
            <span className="text-xs text-muted-foreground">({baseWord})</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && (
              <div className="inline-flex items-center gap-2">
                <Input
                  value={userAnswer}
                  onChange={(e) => handleChange(exerciseId, e.target.value)}
                  placeholder="..."
                  className={cn(
                    "w-32 h-8 text-sm inline-block",
                    isCorrect && "border-green-500 bg-green-50/50",
                    isIncorrect && "border-red-500 bg-red-50/50"
                  )}
                  readOnly={readOnly}
                />
                <span className="text-xs text-muted-foreground">({baseWord})</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <RichTextEditor
          value={question.text || ""}
          onChange={(content) => onQuestionHighlighted(question.id, content)}
          readonly={true}
          className="leading-relaxed w-full h-full"
          minHeight={20}
        />
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="text-sm text-muted-foreground border-l-4 border-primary/20 pl-4 py-2">
          <strong>Instructions:</strong> Fill in the correct form of the word given in parentheses.
        </div>

        {/* Word form exercises */}
        <div className="space-y-6">
          {exercises.map((exercise, index) => {
            // Get user answer from value prop (during answering) or from answer prop (during review)
            let userAnswer = "";
            if (value && value[exercise.id]) {
              // During answering mode
              userAnswer = String(value[exercise.id]);
            } else if (answer && typeof answer === 'object') {
              // During review mode, find the answer entry for this exercise
              const answerEntry = Object.values(answer).find((entry: {
                questionId?: string;
                subQuestionId?: string;
                answer?: string;
              }) => entry.questionId === question.id && entry.subQuestionId === exercise.id);
              
              if (answerEntry && answerEntry.answer) {
                userAnswer = String(answerEntry.answer);
              }
            }
            
            const aiScore = aiScores[exercise.id];
            const { feedback, score } = aiScore || {};
            
            // Check if answer is correct based on exact match with correct form
            const isExactMatch = Boolean(showCorrectAnswer && userAnswer && 
              userAnswer.toLowerCase().trim() === exercise.correctForm.toLowerCase().trim());
            
            // Check if answer is correct based on AI score (80% or higher)
            const isAICorrect = Boolean(showCorrectAnswer && score && score >= 0.8);
            
            // Consider answer correct if either exact match or AI score is 80%+
            const isCorrect = isExactMatch || isAICorrect;
            const isIncorrect = Boolean(showCorrectAnswer && userAnswer && !isCorrect);

            return (
              <div key={exercise.id} className="border rounded-lg overflow-hidden">
                {/* Question number header */}
                <div className="bg-muted/30 px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">Exercise {index + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="text-sm leading-relaxed">
                      {renderSentenceWithBlank(exercise.sentence, exercise.baseWord, exercise.id, isCorrect, isIncorrect)}
                    </div>

                    {/* AI Score Display */}
                    {score !== undefined && (
                      <div className="mt-3">
                        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm flex items-center text-blue-900 dark:text-blue-100">
                                <Award className="mr-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                AI Score: {(score * 100).toFixed(0)}%
                              </h4>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => setShowFeedback(prev => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
                                className="p-0 h-auto text-blue-600 dark:text-blue-400 text-xs"
                              >
                                {showFeedback[exercise.id] ? (
                                  <>
                                    <EyeOff className="mr-1 h-3 w-3" /> Hide feedback
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-1 h-3 w-3" /> Show feedback
                                  </>
                                )}
                              </Button>
                            </div>

                            {showFeedback[exercise.id] && feedback && (
                              <div className="mt-2 p-3 bg-white dark:bg-gray-800/50 rounded border text-xs">
                                <div className="prose prose-sm max-w-none">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                                  >
                                    {feedback}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            )}

                            <p className="text-xs text-muted-foreground mt-2">
                              This is an AI-generated evaluation. In a real test, word forms would be scored by human experts.
                            </p>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Correct Answer for Review Mode */}
                    {showCorrectAnswer && isIncorrect && (
                      <div className="mt-3">
                        <div className="text-sm p-3 bg-green-50/50 rounded border border-green-200/50">
                          <div className="font-medium text-green-800 mb-1 flex items-center">
                            <span className="w-4 h-4 rounded-full bg-green-600 text-white text-xs flex items-center justify-center mr-2">✓</span>
                            Correct answer:
                          </div>
                          <div className="text-green-700 font-medium">
                            {exercise.correctForm}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
