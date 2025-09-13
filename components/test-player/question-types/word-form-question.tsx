"use client";

import React from "react";
import { Button } from "@testComponents/components/ui/button";
import { Card } from "@testComponents/components/ui/card";
import { Input } from "@testComponents/components/ui/input";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type { WordFormQuestion } from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";
import { cn } from "@testComponents/lib/utils";
import { Award, Bot, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
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
}

interface ScoringResult {
  score: number;
  feedback: string;
  ok?: boolean;
  error?: string;
}

export default function WordFormQuestionRenderer({
  question,
  value = {},
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => {},
}: WordFormQuestionProps) {
  const { scoreEssayFn } = useTestStore();
  const [aiScores, setAiScores] = useState<Record<string, ScoringResult>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [isScoring, setIsScoring] = useState<Record<string, boolean>>({});

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

  const scoreWordForm = async (exerciseId: string, userAnswer: string, exercise: { id: string; sentence: string; baseWord: string; correctForm: string; position: number }) => {
    if (!scoreEssayFn || !userAnswer.trim()) return;

    setIsScoring(prev => ({ ...prev, [exerciseId]: true }));

    try {
      // Use custom scoring prompt if provided, otherwise use default
      const prompt = question.scoringPrompt || `Evaluate this word form transformation exercise:

Base word: "${exercise.baseWord}"
Student answer: "${userAnswer}"
Correct form: "${exercise.correctForm}"

Context sentence: "${exercise.sentence}"

Please evaluate on a scale of 0-1 (where 1 is correct) considering:
- Grammatical correctness (50%)
- Appropriate word form transformation (30%)
- Spelling accuracy (20%)

Provide specific, constructive feedback focusing on:
- Whether the word form is correct for the context
- Grammar rule explanation if applicable
- Spelling corrections if needed
- Alternative correct forms if any exist

Be encouraging but precise in your feedback.`;

      const result = await scoreEssayFn({
        text: userAnswer,
        prompt: exercise.sentence,
        essay: userAnswer,
        scoringPrompt: prompt,
      });

      if (result.ok) {
        setAiScores(prev => ({ ...prev, [exerciseId]: result }));
        setShowFeedback(prev => ({ ...prev, [exerciseId]: true }));
        
        onChange({ 
          ...value, 
          [exerciseId]: userAnswer
        }, exerciseId);
      } else {
        console.error("AI scoring failed:", result.error);
      }
    } catch (error) {
      console.error("Error scoring word form:", error);
    } finally {
      setIsScoring(prev => ({ ...prev, [exerciseId]: false }));
    }
  };

  const scoreAllExercises = async () => {
    if (!scoreEssayFn || !value) return;

    const exercisesToScore = exercises.filter(exercise => {
      const userAnswer = value[exercise.id];
      return userAnswer && userAnswer.trim() && !aiScores[exercise.id];
    });

    for (const exercise of exercisesToScore) {
      const userAnswer = value[exercise.id];
      if (userAnswer && userAnswer.trim()) {
        await scoreWordForm(exercise.id, userAnswer, exercise);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
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
            const userAnswer = value?.[exercise.id] || "";
            const aiScore = aiScores[exercise.id];
            const isCorrect = Boolean(showCorrectAnswer && userAnswer && 
              userAnswer.toLowerCase().trim() === exercise.correctForm.toLowerCase().trim());
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
                    {/* AI Scoring Button */}
                    {!readOnly && !showCorrectAnswer && scoreEssayFn && userAnswer.trim() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => scoreWordForm(exercise.id, userAnswer, exercise)}
                        disabled={isScoring[exercise.id]}
                        className="text-xs h-7"
                      >
                        {isScoring[exercise.id] ? (
                          <>
                            <Bot className="mr-1 h-3 w-3 animate-spin" /> Scoring...
                          </>
                        ) : (
                          <>
                            <Bot className="mr-1 h-3 w-3" /> Get AI Score
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content area */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="text-sm leading-relaxed">
                      {renderSentenceWithBlank(exercise.sentence, exercise.baseWord, exercise.id, isCorrect, isIncorrect)}
                    </div>

                    {/* AI Score Display */}
                    {aiScore && (
                      <div className="mt-3">
                        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm flex items-center text-blue-900 dark:text-blue-100">
                                <Award className="mr-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                AI Score: {(aiScore.score * 100).toFixed(0)}%
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

                            {showFeedback[exercise.id] && (
                              <div className="mt-2 p-3 bg-white dark:bg-gray-800/50 rounded border text-xs">
                                <div className="prose prose-sm max-w-none">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                                  >
                                    {aiScore.feedback}
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

        {/* Score All Button */}
        {!readOnly && !showCorrectAnswer && scoreEssayFn && value && Object.values(value).some(v => v && v.trim()) && (
          <div className="flex justify-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={scoreAllExercises}
              disabled={Object.values(isScoring).some(Boolean)}
              className="px-6"
            >
              {Object.values(isScoring).some(Boolean) ? (
                <>
                  <Bot className="mr-2 h-4 w-4 animate-spin" /> Scoring All Exercises...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" /> Score All Exercises
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
