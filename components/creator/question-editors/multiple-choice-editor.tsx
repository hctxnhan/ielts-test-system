"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MultipleChoiceQuestion } from "@/lib/types"

interface MultipleChoiceEditorProps {
  question: MultipleChoiceQuestion
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
}

export default function MultipleChoiceEditor({ question, sectionId, onUpdateQuestion }: MultipleChoiceEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Options</Label>
        {question.options.map((option, optIndex) => (
          <div key={optIndex} className="flex gap-2">
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...question.options]
                newOptions[optIndex] = e.target.value
                onUpdateQuestion(sectionId, question.id, { options: newOptions })
              }}
              placeholder={`Option ${optIndex + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newOptions = question.options.filter((_, i) => i !== optIndex)
                onUpdateQuestion(sectionId, question.id, { options: newOptions })
              }}
              disabled={question.options.length <= 2}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newOptions = [...question.options, ""]
            onUpdateQuestion(sectionId, question.id, { options: newOptions })
          }}
        >
          Add Option
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`correct-answer-${question.id}`}>Correct Answer</Label>
        <Select
          value={question.correctAnswer.toString()}
          onValueChange={(value) =>
            onUpdateQuestion(sectionId, question.id, {
              correctAnswer: Number.parseInt(value),
            })
          }
        >
          <SelectTrigger id={`correct-answer-${question.id}`}>
            <SelectValue placeholder="Select correct option" />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((option, optIndex) => (
              <SelectItem key={optIndex} value={optIndex.toString()}>
                Option {optIndex + 1}: {option.substring(0, 20)}
                {option.length > 20 ? "..." : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

