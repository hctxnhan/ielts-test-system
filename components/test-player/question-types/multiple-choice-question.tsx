"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { MultipleChoiceQuestion } from "@/lib/types"

interface MultipleChoiceQuestionProps {
  question: MultipleChoiceQuestion
  value: number | null
  onChange: (value: number) => void
}

export default function MultipleChoiceQuestionRenderer({ question, value, onChange }: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      <RadioGroup value={value?.toString()} onValueChange={(value) => onChange(Number.parseInt(value))}>
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

