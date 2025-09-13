"use client";

import React from "react";
import { Button } from "@testComponents/components/ui/button";
import { Card } from "@testComponents/components/ui/card";
import { Textarea } from "@testComponents/components/ui/textarea";
import { Label } from "@testComponents/components/ui/label";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type { SentenceTranslationQuestion } from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";
import { cn } from "@testComponents/lib/utils";
import { Award, Bot, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
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
}

interface ScoringResult {
  score: number;
  feedback: string;
  ok?: boolean;
  error?: string;
}

export default function SentenceTranslationQuestionRenderer({
  question,
  value = {},
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => {},
}: SentenceTranslationQuestionProps) {
  const { scoreEssayFn } = useTestStore();
  const [aiScores, setAiScores] = useState<Record<string, ScoringResult>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [isScoring, setIsScoring] = useState<Record<string, boolean>>({});

  // Handle both question formats: single sentence and multiple sentences
  interface ExtendedQuestion extends SentenceTranslationQuestion {
    sourceText?: string;
    referenceTranslation?: string;
  }
  
  const questionData = question as ExtendedQuestion;
  const sentences = question.sentences || (questionData.sourceText ? [{
    id: question.id,
    sourceText: questionData.sourceText,
    referenceTranslations: questionData.referenceTranslation ? [questionData.referenceTranslation] : []
  }] : []);

  // Initialize feedback visibility for sentences that have AI scores
  useEffect(() => {
    if (showCorrectAnswer) {
      // In review mode, show all feedback by default
      const initialFeedback: Record<string, boolean> = {};
      sentences.forEach(sentence => {
        if (aiScores[sentence.id]) {
          initialFeedback[sentence.id] = true;
        }
      });
      setShowFeedback(initialFeedback);
    }
  }, [showCorrectAnswer, sentences, aiScores]);

  const handleChange = (sentenceId: string, newValue: string) => {
    if (readOnly) return;

    const newAnswers = { ...(value || {}) };
    newAnswers[sentenceId] = newValue;

    onChange(newAnswers, sentenceId);
  };

  const scoreTranslation = async (sentenceId: string, userTranslation: string, sourceText: string) => {
    if (!scoreEssayFn || !userTranslation.trim()) return;

    setIsScoring(prev => ({ ...prev, [sentenceId]: true }));

    try {
      const sentence = sentences.find(s => s.id === sentenceId);
      const referenceTranslations = sentence?.referenceTranslations?.join("\n") || "";
      
      // Use custom scoring prompt if provided, otherwise use default
      const prompt = question.scoringPrompt || `Evaluate this translation from ${question.sourceLanguage} to ${question.targetLanguage}:

Source: "${sourceText}"
Student Translation: "${userTranslation}"

${referenceTranslations ? `Reference translations:\n${referenceTranslations}\n` : ""}

Please evaluate on a scale of 0-1 (where 1 is perfect translation) considering:
- Accuracy of meaning (40%)
- Grammar and syntax (30%) 
- Natural expression (20%)
- Cultural appropriateness (10%)

Provide specific, constructive feedback focusing on:
- What was done well
- Areas for improvement
- Specific grammar or vocabulary suggestions
- Cultural context if relevant

Be encouraging but precise in your feedback.`;

      const result = await scoreEssayFn({
        text: userTranslation,
        prompt: sourceText,
        essay: userTranslation,
        scoringPrompt: prompt,
      });

      if (result.ok) {
        setAiScores(prev => ({ ...prev, [sentenceId]: result }));
        setShowFeedback(prev => ({ ...prev, [sentenceId]: true }));
        
        // Submit just the translation text - AI scores are stored separately in component state
        onChange({ 
          ...value, 
          [sentenceId]: userTranslation
        }, sentenceId);
      } else {
        console.error("AI scoring failed:", result.error);
      }
    } catch (error) {
      console.error("Error scoring translation:", error);
    } finally {
      setIsScoring(prev => ({ ...prev, [sentenceId]: false }));
    }
  };

  const scoreAllTranslations = async () => {
    if (!scoreEssayFn || !value) return;

    const sentencesToScore = sentences.filter(sentence => {
      const userAnswer = value[sentence.id];
      return userAnswer && userAnswer.trim() && !aiScores[sentence.id];
    });

    for (const sentence of sentencesToScore) {
      const userAnswer = value[sentence.id];
      if (userAnswer && userAnswer.trim()) {
        await scoreTranslation(sentence.id, userAnswer, sentence.sourceText);
        // Add a small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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
          const userAnswer = value?.[sentence.id] || "";
          const aiScore = aiScores[sentence.id];
          const isCorrect = showCorrectAnswer && userAnswer && 
            sentence.referenceTranslations?.some(ref => 
              ref.toLowerCase().trim() === userAnswer.toLowerCase().trim()
            );
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
                      {/* AI Scoring Button */}
                      {!readOnly && !showCorrectAnswer && scoreEssayFn && userAnswer.trim() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => scoreTranslation(sentence.id, userAnswer, sentence.sourceText)}
                          disabled={isScoring[sentence.id]}
                          className="text-xs h-7"
                        >
                          {isScoring[sentence.id] ? (
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

                          {showFeedback[sentence.id] && (
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

        {/* Score All Button - moved to bottom for better flow */}
        {!readOnly && !showCorrectAnswer && scoreEssayFn && value && Object.values(value).some(v => v && v.trim()) && (
          <div className="flex justify-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={scoreAllTranslations}
              disabled={Object.values(isScoring).some(Boolean)}
              className="px-6"
            >
              {Object.values(isScoring).some(Boolean) ? (
                <>
                  <Bot className="mr-2 h-4 w-4 animate-spin" /> Scoring All Translations...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" /> Score All Translations
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
