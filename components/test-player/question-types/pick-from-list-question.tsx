"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { PickFromListQuestion } from "@/lib/types"

interface PickFromListQuestionProps {
  question: PickFromListQuestion
  value: Record<number, number> | null
  onChange: (value: Record<number, number>) => void
}

export default function PickFromListQuestionRenderer({ question, value, onChange }: PickFromListQuestionProps) {
  // Ensure value is always an object
  const safeValue = value || {}

  // Ensure options and items are always arrays
  const options = question.options || []
  const items = question.items || []

  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="font-medium">Possible Options:</p>
          {options.map((option, index) => (
            <Card key={index} className="p-3">
              <p>{option}</p>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          <p className="font-medium">Items:</p>
          {items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex items-center space-x-2 p-2 border rounded-md">
              <span className="w-1/3">{item}</span>
              <RadioGroup
                value={safeValue[itemIndex]?.toString()}
                onValueChange={(val) => {
                  const newAnswers = { ...safeValue }
                  newAnswers[itemIndex] = Number.parseInt(val)
                  onChange(newAnswers)
                }}
                className="flex flex-wrap gap-2"
              >
                {options.map((_, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-1">
                    <RadioGroupItem value={optionIndex.toString()} id={`item-${itemIndex}-option-${optionIndex}`} />
                    <Label htmlFor={`item-${itemIndex}-option-${optionIndex}`}>
                      {String.fromCharCode(65 + optionIndex)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

