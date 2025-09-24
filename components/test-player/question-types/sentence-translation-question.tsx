"use client";

import React from "react";
import { Button } from "@testComponents/components/ui/button";
import { Card } from "@testComponents/components/ui/card";
import { Textarea } from "@testComponents/components/ui/textarea";
import { Label } from "@testComponents/components/ui/label";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type { SentenceTranslationQuestion, UserAnswer } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";
import { Award, Eye, EyeOff } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface SentenceTranslationQuestionProps {
  question: SentenceTranslationQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (questionId: string, content: string) => void;
  answer?: UserAnswer;
}

export default function SentenceTranslationQuestionRenderer({
  question,
  value = {},
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => {},
  answer,
}: SentenceTranslationQuestionProps) {
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  
  // Extract AI scores from the answer prop
  const aiScores = useMemo(() => {
    const scores: Record<string, { score: number; feedback: string }> = {};
    
    // The answer prop is actually the entire answers object containing individual sentence results
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
  
  // Handle both question formats: single sentence and multiple sentences
  interface ExtendedQuestion extends SentenceTranslationQuestion {
    sourceText?: string;
    referenceTranslation?: string;
  }
  
  const questionData = question as ExtendedQuestion;
  
  // Memoize sentences to prevent unnecessary re-computations
  const sentences = useMemo(() => {
    return question.sentences || (questionData.sourceText ? [{
      id: question.id,
      sourceText: questionData.sourceText,
      referenceTranslations: questionData.referenceTranslation ? [questionData.referenceTranslation] : []
    }] : []);
  }, [question.sentences, question.id, questionData.sourceText, questionData.referenceTranslation]);

  // Initialize and manage feedback visibility
  useEffect(() => {
    if (showCorrectAnswer && Object.keys(aiScores).length > 0) {
      // In review mode, show feedback for sentences that have AI scores
      const initialFeedback: Record<string, boolean> = {};
      sentences.forEach(sentence => {
        if (aiScores[sentence.id]) {
          initialFeedback[sentence.id] = true;
        }
      });
      setShowFeedback(initialFeedback);
    } else {
      // Not in review mode or no AI scores, hide all feedback
      setShowFeedback({});
    }
  }, [showCorrectAnswer, aiScores, sentences]);

  const handleChange = (sentenceId: string, newValue: string) => {
    if (readOnly) return;

    const newAnswers = { ...(value || {}) };
    newAnswers[sentenceId] = newValue;

    if (question.scoringStrategy === "partial") {
      onChange(newAnswers, sentenceId);
    } else {
      onChange(newAnswers);
    }
  };

  const getLanguageLabel = (lang: string) => {
    return lang === "vietnamese" ? "Tiếng Việt" : "English";
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
        <div className="text-sm text-muted-foreground border-l-4 border-primary/20 pl-4 py-2">
          <strong>Translation Direction:</strong> {getLanguageLabel(question.sourceLanguage)} → {getLanguageLabel(question.targetLanguage)}
        </div>
      </div>

      <div className="space-y-6">
        {sentences.map((sentence, index) => {
          // Get user answer from value prop (during answering) or from answer prop (during review)
          let userAnswer = "";
          if (value && value[sentence.id]) {
            // During answering mode
            userAnswer = String(value[sentence.id]);
          } else if (answer && typeof answer === 'object') {
            // During review mode, find the answer entry for this sentence
            const answerEntry = Object.values(answer).find((entry: {
              questionId?: string;
              subQuestionId?: string;
              answer?: string;
            }) => entry.questionId === question.id && entry.subQuestionId === sentence.id);
            
            if (answerEntry && answerEntry.answer) {
              userAnswer = String(answerEntry.answer);
            }
          }
          
          const aiScore = aiScores[sentence.id];
          const { feedback, score } = aiScore || {};
          
          // Check if answer is correct based on exact match with reference translations
          const isExactMatch = showCorrectAnswer && userAnswer && 
            sentence.referenceTranslations?.some(ref => 
              ref.toLowerCase().trim() === userAnswer.toLowerCase().trim()
            );
          
          // Check if answer is correct based on AI score (80% or higher)
          const isAICorrect = showCorrectAnswer && score && score >= 0.8;
          
          // Consider answer correct if either exact match or AI score is 80%+
          const isCorrect = isExactMatch || isAICorrect;
          const isIncorrect = showCorrectAnswer && userAnswer && !isCorrect;

          return (
            <div key={sentence.id} className="border rounded-lg overflow-hidden">
              {/* Question number header */}
              <div className="bg-muted/30 px-4 py-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">Translation {index + 1}</span>
                </div>
              </div>

              {/* Content area */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Source text */}
                <div className="p-4 border-r lg:border-r border-b lg:border-b-0">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {getLanguageLabel(question.sourceLanguage)}
                    </Label>
                    <div className="text-sm leading-relaxed p-3 bg-muted/20 rounded border min-h-[80px] flex items-start">
                      {sentence.sourceText}
                    </div>
                  </div>
                </div>

                {/* Translation input */}
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {getLanguageLabel(question.targetLanguage)}
                      </Label>
                    </div>
                    <Textarea
                      value={userAnswer}
                      onChange={(e) => handleChange(sentence.id, e.target.value)}
                      placeholder={
                        showCorrectAnswer 
                          ? "Not answered" 
                          : `Enter your ${getLanguageLabel(question.targetLanguage).toLowerCase()} translation...`
                      }
                      className={cn(
                        "resize-none text-sm min-h-[80px] border",
                        isCorrect && "border-green-500 bg-green-50/50",
                        isIncorrect && "border-red-500 bg-red-50/50"
                      )}
                      readOnly={readOnly}
                    />
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
                              onClick={() => setShowFeedback(prev => ({ ...prev, [sentence.id]: !prev[sentence.id] }))}
                              className="p-0 h-auto text-blue-600 dark:text-blue-400 text-xs"
                            >
                              {showFeedback[sentence.id] ? (
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

                          {showFeedback[sentence.id] && feedback && (
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
                            This is an AI-generated evaluation. In a real test, translations would be scored by human experts.
                          </p>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Reference Translations for Review Mode */}
                  {showCorrectAnswer && isIncorrect && sentence.referenceTranslations && sentence.referenceTranslations.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm p-3 bg-green-50/50 rounded border border-green-200/50">
                        <div className="font-medium text-green-800 mb-1 flex items-center">
                          <span className="w-4 h-4 rounded-full bg-green-600 text-white text-xs flex items-center justify-center mr-2">✓</span>
                          Reference translation(s):
                        </div>
                        <ul className="space-y-1 text-green-700">
                          {sentence.referenceTranslations.map((ref, refIndex) => (
                            <li key={refIndex} className="pl-6">• {ref}</li>
                          ))}
                        </ul>
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
  );
}
