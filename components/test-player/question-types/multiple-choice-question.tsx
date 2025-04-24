"use client";
import {
  RadioGroup,
  RadioGroupItem,
} from "@testComponents/components/ui/radio-group";
import { Label } from "@testComponents/components/ui/label";
import type { MultipleChoiceQuestion } from "@testComponents/lib/types";

interface MultipleChoiceQuestionProps {
  question: MultipleChoiceQuestion;
  value?: string;
  onChange: (value: string, subId: string) => void;
}

export default function MultipleChoiceQuestion({
  question,
  value,
  onChange,
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      <RadioGroup
        value={value}
        onValueChange={(value) => {
          onChange(value, question.id);
        }}
      >
        {question.options.map((option, index) => (
          <div
            key={option.id}
            className="flex items-center space-x-2 p-2 rounded hover:bg-muted"
          >
            <RadioGroupItem value={option.id} id={`option-${option.id}`} />
            <Label
              htmlFor={`option-${option.id}`}
              className="flex-grow cursor-pointer"
            >
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
