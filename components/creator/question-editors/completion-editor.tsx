"use client";

import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import type { CompletionQuestion } from "@testComponents/lib/types";
import { CheckCircle, Hash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface CompletionEditorProps {
  question: CompletionQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<CompletionQuestion>
  ) => void;
}

export default function CompletionEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: CompletionEditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label
          htmlFor={`blanks-${question.id}`}
          className="text-xs font-medium flex items-center gap-1.5"
        >
          <Hash className="w-3 h-3" />
          Number of Blanks
        </Label>
        <Input
          id={`blanks-${question.id}`}
          type="number"
          value={question.blanks}
          onChange={(e) => {
            const newBlanks = Number.parseInt(e.target.value) || 1;
            const currentSubQuestions = [...(question.subQuestions || [])];

            // Adjust the subQuestions array size
            while (currentSubQuestions.length < newBlanks) {
              const newIndex = currentSubQuestions.length + 1;
              currentSubQuestions.push({
                subIndex: newIndex,
                subId: uuidv4(),
                points: 1,
                correctAnswer: "",
              });
            }
            while (currentSubQuestions.length > newBlanks) {
              currentSubQuestions.pop();
            }

            onUpdateQuestion(sectionId, question.id, {
              blanks: newBlanks,
              subQuestions: currentSubQuestions,
            });
          }}
          min="1"
          max="10"
          className="h-7 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3" />
          Answers
        </Label>
        <div className="space-y-2">
          {Array.from({ length: question.blanks || 0 }).map((_, blankIndex) => {
            const subQuestion = question.subQuestions?.[blankIndex] || {
              subIndex: blankIndex + 1,
              subId: uuidv4(),
              points: 1,
              correctAnswer: "",
            };

            return (
              <div key={blankIndex} className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                    {blankIndex + 1}
                  </div>
                  <span>Blank {blankIndex + 1}</span>
                </div>

                <div className="flex gap-1.5 items-center pl-6">
                  <Input
                    value={subQuestion.correctAnswer || ""}
                    onChange={(e) => {
                      const newSubQuestions = [
                        ...(question.subQuestions || []),
                      ];
                      if (!newSubQuestions[blankIndex]) {
                        newSubQuestions[blankIndex] = { ...subQuestion };
                      }
                      newSubQuestions[blankIndex].correctAnswer =
                        e.target.value;
                      onUpdateQuestion(sectionId, question.id, {
                        subQuestions: newSubQuestions,
                      });
                    }}
                    placeholder={`Answer for blank ${blankIndex + 1}`}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
