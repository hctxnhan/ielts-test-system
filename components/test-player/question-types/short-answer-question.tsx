"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { ShortAnswerQuestion } from "@/lib/types"

interface ShortAnswerQuestionProps {
  question: ShortAnswerQuestion
  value: string[] | null
  onChange: (value: string[]) => void
}

export default function ShortAnswerQuestionRenderer({ question, value, onChange }: ShortAnswerQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      {question.wordLimit && (
        <p className="text-sm text-muted-foreground">Word limit: {question.wordLimit} words per answer</p>
      )}
      <div className="space-y-4">
        {question.questions.map((q, index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`short-answer-${index}`} className="font-medium">{
              question.scoringStrategy === 'partial' 
                ? `Question ${question.index + index}.` 
                : `${index + 1}.`} {q}</Label>
            <Textarea
              id={`short-answer-${index}`}
              value={value?.[index] || ""}
              onChange={(e) => {
                const newAnswers = Array.isArray(value) ? [...value] : Array(question.questions.length).fill("")
                newAnswers[index] = e.target.value
                onChange(newAnswers)
              }}
              placeholder="Your answer"
              className="resize-none"
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

