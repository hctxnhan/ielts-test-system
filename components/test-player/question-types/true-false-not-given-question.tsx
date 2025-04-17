"use client";

import {
  RadioGroup,
  RadioGroupItem,
} from "@testComponents/components/ui/radio-group";
import { Label } from "@testComponents/components/ui/label";
import type { TrueFalseNotGivenQuestion } from "@testComponents/lib/types";

interface TrueFalseNotGivenQuestionProps {
  question: TrueFalseNotGivenQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subId?: string) => void;
}

export default function TrueFalseNotGivenQuestion({
  question,
  value,
  onChange,
}: TrueFalseNotGivenQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      <div className="space-y-4">
        {question.statements.map((statement, index) => {
          // Find the corresponding subQuestion
          const subQuestion = question.subQuestions?.find(
            (sq) => sq.item === statement.id
          );

          return (
            <div key={statement.id} className="space-y-2">
              <p className="font-medium">
                {question.scoringStrategy === "partial" && subQuestion
                  ? `Question ${question.index + index + 1}.`
                  : `Statement ${index + 1}.`}{" "}
                {statement.text}
              </p>
              <RadioGroup
                value={
                  value && value[subQuestion?.subId]
                    ? value[subQuestion?.subId]
                    : undefined
                }
                onValueChange={(val) => {
                  const newAnswers = { ...(value || {}) };
                  newAnswers[subQuestion?.subId] = val;

                  if (question.scoringStrategy === "partial" && subQuestion) {
                    onChange(newAnswers, subQuestion.subId);
                  } else {
                    onChange(newAnswers);
                  }
                }}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`true-${statement.id}`} />
                  <Label htmlFor={`true-${statement.id}`}>True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`false-${statement.id}`} />
                  <Label htmlFor={`false-${statement.id}`}>False</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="not-given"
                    id={`not-given-${statement.id}`}
                  />
                  <Label htmlFor={`not-given-${statement.id}`}>Not Given</Label>
                </div>
              </RadioGroup>
            </div>
          );
        })}
      </div>
    </div>
  );
}
