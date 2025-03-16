"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { TrueFalseNotGivenQuestion } from "@/lib/types"

interface TrueFalseNotGivenQuestionProps {
  question: TrueFalseNotGivenQuestion
  value: Record<number, string> | null
  onChange: (value: Record<number, string>) => void
}

export default function TrueFalseNotGivenQuestionRenderer({
  question,
  value,
  onChange,
}: TrueFalseNotGivenQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      <div className="space-y-4">
        {question.statements.map((statement, index) => (
          <div key={index} className="space-y-2">
            <p className="font-medium">
              {index + 1}. {statement}
            </p>
            <RadioGroup
              value={value && value[index] ? value[index] : undefined}
              onValueChange={(val) => {
                const newAnswers = { ...(value || {}) }
                newAnswers[index] = val
                onChange(newAnswers)
              }}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`true-${index}`} />
                <Label htmlFor={`true-${index}`}>True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`false-${index}`} />
                <Label htmlFor={`false-${index}`}>False</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-given" id={`not-given-${index}`} />
                <Label htmlFor={`not-given-${index}`}>Not Given</Label>
              </div>
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  )
}

