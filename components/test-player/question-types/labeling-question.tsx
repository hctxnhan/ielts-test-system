"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { LabelingQuestion } from "@/lib/types"

interface LabelingQuestionProps {
  question: LabelingQuestion
  value: Record<number, number> | null
  onChange: (value: Record<number, number>) => void
}

export default function LabelingQuestionRenderer({ question, value, onChange }: LabelingQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      <div className="relative border rounded-lg overflow-hidden" style={{ height: "300px" }}>
        <img
          src={question.imageUrl || "/placeholder.svg"}
          alt="Diagram to label"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="space-y-2 pt-4">
        <p className="font-medium">Your Answers</p>
        {question.labels.map((label, labelIndex) => (
          <div key={labelIndex} className="flex items-center space-x-2">
            <Label htmlFor={`label-${labelIndex}`} className="w-1/3">
              {label}:
            </Label>
            <RadioGroup
              value={value && value[labelIndex] !== undefined ? value[labelIndex].toString() : undefined}
              onValueChange={(val) => {
                const newAnswers = { ...(value || {}) }
                newAnswers[labelIndex] = Number.parseInt(val)
                onChange(newAnswers)
              }}
              className="flex flex-wrap gap-2"
            >
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-1 border rounded-md p-1">
                  <RadioGroupItem value={optionIndex.toString()} id={`label-${labelIndex}-${optionIndex}`} />
                  <Label htmlFor={`label-${labelIndex}-${optionIndex}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  )
}

