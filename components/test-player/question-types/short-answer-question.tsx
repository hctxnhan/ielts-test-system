"use client";

import { Textarea } from "@testComponents/components/ui/textarea";
import { Label } from "@testComponents/components/ui/label";
import type { ShortAnswerQuestion } from "@testComponents/lib/types";

interface ShortAnswerQuestionProps {
  question: ShortAnswerQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
}

export default function ShortAnswerQuestionRenderer({
  question,
  value = {},
  onChange,
}: ShortAnswerQuestionProps) {
  const handleChange = (subId: string, newValue: string) => {
    const newAnswers = { ...(value || {}) };
    newAnswers[subId] = newValue;

    if (question.scoringStrategy === "partial") {
      onChange(newAnswers, subId);
    } else {
      onChange(newAnswers);
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>

      {question.wordLimit && (
        <p className="text-sm text-muted-foreground">
          Word limit: {question.wordLimit} words per answer
        </p>
      )}

      <div className="space-y-4">
        {question.questions.map((q, index) => {
          const subQuestion = question.subQuestions?.find(
            (sq) => sq.item === q.id
          );

          if (!subQuestion) {
            console.error("No subQuestion found for question:", q.id);
            return null;
          }

          const questionNumber =
            question.scoringStrategy === "partial"
              ? `Question ${question.index + index + 1}.`
              : `${index + 1}.`;

          return (
            <div key={q.id} className="space-y-2">
              <Label htmlFor={`short-answer-${q.id}`} className="font-medium">
                {questionNumber} {q.text}
              </Label>
              <Textarea
                id={`short-answer-${q.id}`}
                value={value?.[subQuestion.subId] || ""}
                onChange={(e) =>
                  handleChange(subQuestion.subId, e.target.value)
                }
                placeholder="Your answer"
                className="resize-none"
                rows={2}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
