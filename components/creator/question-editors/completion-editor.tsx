"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CompletionQuestion } from "@/lib/types"

interface CompletionEditorProps {
  question: CompletionQuestion
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
}

export default function CompletionEditor({ question, sectionId, onUpdateQuestion }: CompletionEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`blanks-${question.id}`}>Number of Blanks</Label>
        <Input
          id={`blanks-${question.id}`}
          type="number"
          value={question.blanks}
          onChange={(e) => {
            const newBlanks = Number.parseInt(e.target.value) || 1
            const newCorrectAnswers = [...question.correctAnswers]

            // Adjust the correctAnswers array size
            while (newCorrectAnswers.length < newBlanks) {
              newCorrectAnswers.push("")
            }
            while (newCorrectAnswers.length > newBlanks) {
              newCorrectAnswers.pop()
            }

            onUpdateQuestion(sectionId, question.id, {
              blanks: newBlanks,
              correctAnswers: newCorrectAnswers,
            })
          }}
          min="1"
          max="10"
        />
      </div>

      <div className="space-y-2">
        <Label>Correct Answers</Label>
        {Array.from({ length: question.blanks }).map((_, blankIndex) => (
          <div key={blankIndex} className="flex gap-2">
            <Input
              value={question.correctAnswers[blankIndex] || ""}
              onChange={(e) => {
                const newAnswers = [...question.correctAnswers]
                newAnswers[blankIndex] = e.target.value
                onUpdateQuestion(sectionId, question.id, {
                  correctAnswers: newAnswers,
                })
              }}
              placeholder={`Answer for blank ${blankIndex + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

