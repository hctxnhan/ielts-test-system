"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MatchingHeadingsQuestion } from "@/lib/types"

interface MatchingHeadingsEditorProps {
  question: MatchingHeadingsQuestion
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
}

export default function MatchingHeadingsEditor({ question, sectionId, onUpdateQuestion }: MatchingHeadingsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Paragraphs</Label>
          {question.paragraphs?.map((paragraph, paraIndex) => (
            <div key={paraIndex} className="flex gap-2">
              <Input
                value={paragraph}
                onChange={(e) => {
                  const newParagraphs = [...(question.paragraphs || [])]
                  newParagraphs[paraIndex] = e.target.value
                  onUpdateQuestion(sectionId, question.id, {
                    paragraphs: newParagraphs,
                  })
                }}
                placeholder={`Paragraph ${paraIndex + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newParagraphs = question.paragraphs.filter((_, i) => i !== paraIndex)
                  // Also update correctMatches
                  const newMatches = { ...question.correctMatches }
                  delete newMatches[paraIndex]
                  // Renumber keys
                  const updatedMatches: Record<number, number> = {}
                  Object.entries(newMatches).forEach(([key, value]) => {
                    const keyNum = Number.parseInt(key)
                    if (keyNum > paraIndex) {
                      updatedMatches[keyNum - 1] = value
                    } else {
                      updatedMatches[keyNum] = value
                    }
                  })

                  onUpdateQuestion(sectionId, question.id, {
                    paragraphs: newParagraphs,
                    correctMatches: updatedMatches,
                  })
                }}
                disabled={question.paragraphs.length <= 1}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newParagraphs = [...(question.paragraphs || []), ""]
              const newIndex = (question.paragraphs || []).length
              const newMatches = {
                ...(question.correctMatches || {}),
                [newIndex]: 0,
              }
              onUpdateQuestion(sectionId, question.id, {
                paragraphs: newParagraphs,
                correctMatches: newMatches,
              })
            }}
          >
            Add Paragraph
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Headings</Label>
          {question.headings?.map((heading, headingIndex) => (
            <div key={headingIndex} className="flex gap-2">
              <Input
                value={heading}
                onChange={(e) => {
                  const newHeadings = [...(question.headings || [])]
                  newHeadings[headingIndex] = e.target.value
                  onUpdateQuestion(sectionId, question.id, {
                    headings: newHeadings,
                  })
                }}
                placeholder={`Heading ${headingIndex + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newHeadings = question.headings.filter((_, i) => i !== headingIndex)
                  onUpdateQuestion(sectionId, question.id, {
                    headings: newHeadings,
                  })
                }}
                disabled={question.headings.length <= 1}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newHeadings = [...(question.headings || []), ""]
              onUpdateQuestion(sectionId, question.id, { headings: newHeadings })
            }}
          >
            Add Heading
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Correct Matches</Label>
        {question.paragraphs?.map((paragraph, paraIndex) => (
          <div key={paraIndex} className="flex items-center gap-2">
            <span className="w-1/3 truncate">{paragraph || `Paragraph ${paraIndex + 1}`}</span>
            <span>→</span>
            <Select
              value={(question.correctMatches?.[paraIndex] || 0).toString()}
              onValueChange={(value) => {
                const newMatches = { ...(question.correctMatches || {}) }
                newMatches[paraIndex] = Number.parseInt(value)
                onUpdateQuestion(sectionId, question.id, {
                  correctMatches: newMatches,
                })
              }}
            >
              <SelectTrigger className="w-2/3">
                <SelectValue placeholder="Select matching heading" />
              </SelectTrigger>
              <SelectContent>
                {question.headings?.map((heading, headingIndex) => (
                  <SelectItem key={headingIndex} value={headingIndex.toString()}>
                    {heading || `Heading ${headingIndex + 1}`}
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

