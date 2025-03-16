"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PickFromListQuestion } from "@/lib/types"

interface PickFromListEditorProps {
  question: PickFromListQuestion
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
}

export default function PickFromListEditor({ question, sectionId, onUpdateQuestion }: PickFromListEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Options (e.g., "A The shop will move...")</Label>
        {(question.options || []).map((option, optIndex) => (
          <div key={optIndex} className="flex gap-2">
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...(question.options || [])]
                newOptions[optIndex] = e.target.value
                onUpdateQuestion(sectionId, question.id, { options: newOptions })
              }}
              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newOptions = (question.options || []).filter((_, i) => i !== optIndex)
                // Update correctAnswers if needed
                const newCorrectAnswers = { ...(question.correctAnswers || {}) }

                // Remove any answers that used this option
                Object.entries(newCorrectAnswers).forEach(([key, value]) => {
                  if (value === optIndex) {
                    delete newCorrectAnswers[Number(key)]
                  } else if (value > optIndex) {
                    // Adjust indices for options that come after the deleted one
                    newCorrectAnswers[Number(key)] = value - 1
                  }
                })

                onUpdateQuestion(sectionId, question.id, {
                  options: newOptions,
                  correctAnswers: newCorrectAnswers,
                })
              }}
              disabled={(question.options || []).length <= 2}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newOptions = [...(question.options || []), ""]
            onUpdateQuestion(sectionId, question.id, { options: newOptions })
          }}
        >
          Add Option
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Items (e.g., "Local shop", "Restaurant")</Label>
        {(question.items || []).map((item, itemIndex) => (
          <div key={itemIndex} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const newItems = [...(question.items || [])]
                newItems[itemIndex] = e.target.value
                onUpdateQuestion(sectionId, question.id, { items: newItems })
              }}
              placeholder={`Item ${itemIndex + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newItems = (question.items || []).filter((_, i) => i !== itemIndex)

                // Update correctAnswers
                const newCorrectAnswers = { ...(question.correctAnswers || {}) }
                delete newCorrectAnswers[itemIndex]

                // Renumber keys for items after the deleted one
                Object.entries(newCorrectAnswers).forEach(([key, value]) => {
                  const keyNum = Number(key)
                  if (keyNum > itemIndex) {
                    newCorrectAnswers[keyNum - 1] = value
                    delete newCorrectAnswers[keyNum]
                  }
                })

                onUpdateQuestion(sectionId, question.id, {
                  items: newItems,
                  correctAnswers: newCorrectAnswers,
                })
              }}
              disabled={(question.items || []).length <= 2}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newItems = [...(question.items || []), ""]
            onUpdateQuestion(sectionId, question.id, { items: newItems })
          }}
        >
          Add Item
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Correct Answers</Label>
        {(question.items || []).map((item, itemIndex) => (
          <div key={itemIndex} className="flex items-center gap-2">
            <span>{item || `Item ${itemIndex + 1}`}:</span>
            <Select
              value={(question.correctAnswers?.[itemIndex] || 0).toString()}
              onValueChange={(value) => {
                const newCorrectAnswers = { ...(question.correctAnswers || {}) }
                newCorrectAnswers[itemIndex] = Number.parseInt(value)
                onUpdateQuestion(sectionId, question.id, {
                  correctAnswers: newCorrectAnswers,
                })
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
              <SelectContent>
                {(question.options || []).map((_, optIndex) => (
                  <SelectItem key={optIndex} value={optIndex.toString()}>
                    {String.fromCharCode(65 + optIndex)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  )
}

