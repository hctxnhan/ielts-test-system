"use client";

import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import type { CompletionQuestion } from "@testComponents/lib/types";

interface CompletionQuestionProps {
  question: CompletionQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
}

export default function CompletionQuestionRenderer({
  question,
  value,
  onChange,
}: CompletionQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      <div className="space-y-2">
        {question.subQuestions.map((subQuestion, index) => (
          <div key={subQuestion.subId} className="flex items-center space-x-2">
            <Label htmlFor={`blank-${subQuestion.subId}`} className="w-20">
              {question.scoringStrategy === "partial"
                ? `Question ${question.index + index + 1}:`
                : `Blank ${index + 1}:`}
            </Label>
            <Input
              id={`blank-${subQuestion.subId}`}
              value={value?.[subQuestion.subId] || ""}
              onChange={(e) => {
                const newAnswers = { ...(value || {}) };
                newAnswers[subQuestion.subId] = e.target.value;
                if (question.scoringStrategy === "partial") {
                  onChange(newAnswers, subQuestion.subId);
                } else {
                  onChange(newAnswers);
                }
              }}
              placeholder="Your answer"
              className="max-w-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
