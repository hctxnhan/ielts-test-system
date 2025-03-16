"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { MatchingHeadingsQuestion } from "@/lib/types"

interface MatchingHeadingsQuestionProps {
  question: MatchingHeadingsQuestion
  value: Record<number, number> | null
  onChange: (value: Record<number, number>) => void
}

export default function MatchingHeadingsQuestionRenderer({ question, value, onChange }: MatchingHeadingsQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>

      <div className="space-y-2">
        <p className="font-medium">Headings:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {question.headings.map((heading, headingIndex) => (
            <Card key={headingIndex} className="p-3">
              <p>
                <span className="font-bold">{String.fromCharCode(65 + headingIndex)}.</span> {heading}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="font-medium">Paragraphs:</p>
        {question.paragraphs.map((paragraph, paraIndex) => (
          <div key={paraIndex} className="space-y-2">
            <Card className="p-4">
              <p className="text-sm whitespace-pre-line">{paragraph}</p>
            </Card>

            <div className="flex items-center space-x-2">
              <Label htmlFor={`heading-${paraIndex}`} className="w-20">
                Paragraph {paraIndex + 1}:
              </Label>
              <RadioGroup
                value={value && value[paraIndex] !== undefined ? value[paraIndex].toString() : undefined}
                onValueChange={(val) => {
                  const newAnswers = { ...(value || {}) }
                  newAnswers[paraIndex] = Number.parseInt(val)
                  onChange(newAnswers)
                }}
                className="flex flex-wrap gap-2"
              >
                {question.headings.map((_, headingIndex) => (
                  <div key={headingIndex} className="flex items-center space-x-1 border rounded-md p-1">
                    <RadioGroupItem value={headingIndex.toString()} id={`heading-${paraIndex}-${headingIndex}`} />
                    <Label htmlFor={`heading-${paraIndex}-${headingIndex}`}>
                      {String.fromCharCode(65 + headingIndex)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

