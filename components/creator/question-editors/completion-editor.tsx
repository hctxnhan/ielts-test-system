"use client";
import React, { useEffect } from "react";
import { Button } from "@testComponents/components/ui/button";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import type { CompletionQuestion } from "@testComponents/lib/types";
import { CheckCircle, PlusCircle, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface CompletionEditorProps {
  question: CompletionQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<CompletionQuestion>,
  ) => void;
}

export default function CompletionEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: CompletionEditorProps) {
  const length = question.text?.match(/_{3,}/g)?.length || 0;

  // Detect when blanks are removed and remove corresponding subquestions
  useEffect(() => {
    const currentSubQuestionsCount = question.subQuestions?.length || 0;
    
    // If current blanks are fewer than subquestions, some blanks were removed
    if (length < currentSubQuestionsCount) {
      // Keep only subquestions that correspond to remaining blanks
      const updatedSubQuestions = (question.subQuestions || []).slice(0, length);
      onUpdateQuestion(sectionId, question.id, {
        subQuestions: updatedSubQuestions,
      });
    } else if (length > currentSubQuestionsCount) {
      // Blanks were added - create new subquestions for them
      const newSubQuestions = [...(question.subQuestions || [])];
      for (let i = currentSubQuestionsCount; i < length; i++) {
        newSubQuestions.push({
          subId: uuidv4(),
          acceptableAnswers: ["Example"],
          points: 1,
        });
      }
      onUpdateQuestion(sectionId, question.id, {
        subQuestions: newSubQuestions,
      });
    }
  }, [length, question, sectionId, onUpdateQuestion]);

  if (length === 0) {
    return (
      // please use ___ to create blanks
      <p className="text-sm text-muted-foreground">
        Please include <strong>___</strong> (3 or more underscores) to create
        blanks in question text.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3" />
          Answers
        </Label>
        <div className="space-y-2">
          {Array.from({ length }).map((_, blankIndex) => {
            const subQuestion = question.subQuestions?.[blankIndex] || {
              subIndex: blankIndex + 1,
              subId: uuidv4(),
              points: 1,
              acceptableAnswers: [""],
            };

            return (
              <div key={blankIndex} className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                    {blankIndex + 1}
                  </div>
                  <span>Blank {blankIndex + 1}</span>
                </div>

                <div className="pl-6 space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Acceptable Answers
                  </Label>

                  {(subQuestion.acceptableAnswers || [""]).map(
                    (answer: string, ansIndex: number) => (
                      <div key={ansIndex} className="flex gap-1.5 items-center">
                        <Input
                          value={answer}
                          onChange={(e) => {
                            const newSubQuestions = [
                              ...(question.subQuestions || []),
                            ];
                            if (!newSubQuestions[blankIndex]) {
                              newSubQuestions[blankIndex] = { ...subQuestion };
                            }
                            const answers = [
                              ...(newSubQuestions[blankIndex]
                                .acceptableAnswers || []),
                            ];
                            answers[ansIndex] = e.target.value;
                            newSubQuestions[blankIndex].acceptableAnswers =
                              answers;
                            onUpdateQuestion(sectionId, question.id, {
                              subQuestions: newSubQuestions,
                            });
                          }}
                          placeholder={`Acceptable answer ${ansIndex + 1}`}
                          className="h-7 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => {
                            const newSubQuestions = [
                              ...(question.subQuestions || []),
                            ];
                            if (!newSubQuestions[blankIndex]) {
                              newSubQuestions[blankIndex] = { ...subQuestion };
                            }
                            const answers =
                              newSubQuestions[
                                blankIndex
                              ].acceptableAnswers?.filter(
                                (_: string, i: number) => i !== ansIndex,
                              ) || [];
                            newSubQuestions[blankIndex].acceptableAnswers =
                              answers;
                            onUpdateQuestion(sectionId, question.id, {
                              subQuestions: newSubQuestions,
                            });
                          }}
                          disabled={subQuestion.acceptableAnswers?.length <= 1}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ),
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50"
                    onClick={() => {
                      const newSubQuestions = [
                        ...(question.subQuestions || []),
                      ];
                      if (!newSubQuestions[blankIndex]) {
                        newSubQuestions[blankIndex] = { ...subQuestion };
                      }
                      const answers = [
                        ...(newSubQuestions[blankIndex].acceptableAnswers ||
                          []),
                        "",
                      ];
                      newSubQuestions[blankIndex].acceptableAnswers = answers;
                      onUpdateQuestion(sectionId, question.id, {
                        subQuestions: newSubQuestions,
                      });
                    }}
                  >
                    <PlusCircle className="mr-1.5 h-3 w-3" /> Add Alternative
                    Answer
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
