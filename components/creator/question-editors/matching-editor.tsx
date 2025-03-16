"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MatchingQuestion } from "@/lib/types"

interface MatchingEditorProps {
  question: MatchingQuestion
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
}

export default function MatchingEditor({ question, sectionId, onUpdateQuestion }: MatchingEditorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Items</Label>
          {question.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newItems = [...question.items]
                  newItems[itemIndex] = e.target.value
                  onUpdateQuestion(sectionId, question.id, { items: newItems })
                }}
                placeholder={`Item ${itemIndex + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newItems = question.items.filter((_, i) => i !== itemIndex)
                  // Also update correctMatches
                  const newMatches = { ...question.correctMatches }
                  delete newMatches[itemIndex]
                  // Renumber keys
                  const updatedMatches: Record<number, number> = {}
                  Object.entries(newMatches).forEach(([key, value]) => {
                    const keyNum = Number.parseInt(key)
                    if (keyNum > itemIndex) {
                      updatedMatches[keyNum - 1] = value
                    } else {
                      updatedMatches[keyNum] = value
                    }
                  })

                  onUpdateQuestion(sectionId, question.id, {
                    items: newItems,
                    correctMatches: updatedMatches,
                  })
                }}
                disabled={question.items.length <= 2}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newItems = [...question.items, ""]
              const newIndex = question.items.length
              const newMatches = { ...question.correctMatches, [newIndex]: 0 }
              onUpdateQuestion(sectionId, question.id, {
                items: newItems,
                correctMatches: newMatches,
              })
            }}
          >
            Add Item
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          {question.options.map((option, optIndex) => (
            <div key={optIndex} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...question.options]
                  newOptions[optIndex] = e.target.value
                  onUpdateQuestion(sectionId, question.id, {
                    options: newOptions,
                  })
                }}
                placeholder={`Option ${optIndex + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newOptions = question.options.filter((_, i) => i !== optIndex)
                  onUpdateQuestion(sectionId, question.id, {
                    options: newOptions,
                  })
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
      </div>

      <div className="space-y-2">
        <Label>Correct Matches</Label>
        {question.items.map((item, itemIndex) => (
          <div key={itemIndex} className="flex items-center gap-2">
            <span className="w-1/3 truncate">{item || `Item ${itemIndex + 1}`}</span>
            <span>→</span>
            <Select
              value={(question.correctMatches[itemIndex] || 0).toString()}
              onValueChange={(value) => {
                const newMatches = { ...question.correctMatches }
                newMatches[itemIndex] = Number.parseInt(value)
                onUpdateQuestion(sectionId, question.id, {
                  correctMatches: newMatches,
                })
              }}
            >
              <SelectTrigger className="w-2/3">
                <SelectValue placeholder="Select matching option" />
              </SelectTrigger>
              <SelectContent>
                {question.options.map((option, optIndex) => (
                  <SelectItem key={optIndex} value={optIndex.toString()}>
                    {option || `Option ${optIndex + 1}`}
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

