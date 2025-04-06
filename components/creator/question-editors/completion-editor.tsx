"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompletionQuestion } from "@/lib/types";

interface CompletionEditorProps {
  question: CompletionQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="9" x2="20" y2="9"></line>
            <line x1="4" y1="15" x2="20" y2="15"></line>
            <line x1="10" y1="3" x2="8" y2="21"></line>
            <line x1="16" y1="3" x2="14" y2="21"></line>
          </svg>
          Number of Blanks
        </Label>
        <Input
          id={`blanks-${question.id}`}
          type="number"
          value={question.blanks}
          onChange={(e) => {
            const newBlanks = Number.parseInt(e.target.value) || 1;
            const newCorrectAnswers = [...question.correctAnswers];

            // Adjust the correctAnswers array size
            while (newCorrectAnswers.length < newBlanks) {
              newCorrectAnswers.push("");
            }
            while (newCorrectAnswers.length > newBlanks) {
              newCorrectAnswers.pop();
            }

            onUpdateQuestion(sectionId, question.id, {
              blanks: newBlanks,
              correctAnswers: newCorrectAnswers,
            });
          }}
          min="1"
          max="10"
          className="h-7 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Correct Answers
        </Label>
        <div className="space-y-1">
          {Array.from({ length: question.blanks }).map((_, blankIndex) => (
            <div key={blankIndex} className="flex gap-1.5 items-center">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                {blankIndex + 1}
              </div>
              <Input
                value={question.correctAnswers[blankIndex] || ""}
                onChange={(e) => {
                  const newAnswers = [...question.correctAnswers];
                  newAnswers[blankIndex] = e.target.value;
                  onUpdateQuestion(sectionId, question.id, {
                    correctAnswers: newAnswers,
                  });
                }}
                placeholder={`Answer for blank ${blankIndex + 1}`}
                className="h-7 text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
