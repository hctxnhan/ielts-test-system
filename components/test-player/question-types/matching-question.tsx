"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { MatchingQuestion } from "@/lib/types"

interface MatchingQuestionProps {
  question: MatchingQuestion
  value: Record<number, number> | null
  onChange: (value: Record<number, number>) => void
}

export default function MatchingQuestionRenderer({ question, value, onChange }: MatchingQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="font-medium">Items</p>
          {question.items.map((item, index) => (
            <Card key={index} className="p-3">
              <p>
                {index + 1}. {item}
              </p>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          <p className="font-medium">Options</p>
          {question.options.map((option, optionIndex) => (
            <Card key={optionIndex} className="p-3">
              <p>
                {String.fromCharCode(65 + optionIndex)}. {option}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <p className="font-medium">Your Answers</p>
        {question.items.map((_, itemIndex) => (
          <div key={itemIndex} className="flex items-center space-x-2">
            <Label htmlFor={`match-${itemIndex}`} className="w-20">
              {itemIndex + 1} →
            </Label>
            <RadioGroup
              value={value && value[itemIndex] !== undefined ? value[itemIndex].toString() : undefined}
              onValueChange={(val) => {
                const newAnswers = { ...(value || {}) }
                newAnswers[itemIndex] = Number.parseInt(val)
                onChange(newAnswers)
              }}
              className="flex space-x-2"
            >
              {question.options.map((_, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-1">
                  <RadioGroupItem value={optionIndex.toString()} id={`match-${itemIndex}-${optionIndex}`} />
                  <Label htmlFor={`match-${itemIndex}-${optionIndex}`}>{String.fromCharCode(65 + optionIndex)}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  )
}

