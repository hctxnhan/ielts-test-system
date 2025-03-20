"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CompletionQuestion } from "@/lib/types"

interface CompletionQuestionProps {
  question: CompletionQuestion
  value: string[] | null
  onChange: (value: string[]) => void
}

export default function CompletionQuestionRenderer({ question, value, onChange }: CompletionQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      <div className="space-y-2">
        {Array.from({ length: question.blanks }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Label htmlFor={`blank-${index}`} className="w-20">{
              question.scoringStrategy === 'partial' 
                ? `Blank ${question.index + index}:` 
                : `Blank ${index + 1}:`}</Label>
            <Input
              id={`blank-${index}`}
              value={value?.[index] || ""}
              onChange={(e) => {
                const newAnswers = Array.isArray(value) ? [...value] : Array(question.blanks).fill("")
                newAnswers[index] = e.target.value
                onChange(newAnswers)
              }}
              placeholder="Your answer"
              className="max-w-md"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

