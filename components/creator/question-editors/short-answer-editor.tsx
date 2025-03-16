"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ShortAnswerQuestion } from "@/lib/types"

interface ShortAnswerEditorProps {
  question: ShortAnswerQuestion
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
}

export default function ShortAnswerEditor({ question, sectionId, onUpdateQuestion }: ShortAnswerEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`word-limit-${question.id}`}>Word Limit (Optional)</Label>
        <Input
          id={`word-limit-${question.id}`}
          type="number"
          value={question.wordLimit || ""}
          onChange={(e) => {
            const wordLimit = e.target.value ? Number.parseInt(e.target.value) : undefined
            onUpdateQuestion(sectionId, question.id, { wordLimit })
          }}
          placeholder="Maximum words per answer"
          min="1"
        />
      </div>

      <div className="space-y-2">
        <Label>Questions</Label>
        {question.questions?.map((q, qIndex) => (
          <div key={qIndex} className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => {
                const newQuestions = [...(question.questions || [])]
                newQuestions[qIndex] = e.target.value
                onUpdateQuestion(sectionId, question.id, {
                  questions: newQuestions,
                })
              }}
              placeholder={`Question ${qIndex + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newQuestions = question.questions.filter((_, i) => i !== qIndex)
                const newCorrectAnswers = [...(question.correctAnswers || [])]
                newCorrectAnswers.splice(qIndex, 1)
                onUpdateQuestion(sectionId, question.id, {
                  questions: newQuestions,
                  correctAnswers: newCorrectAnswers,
                })
              }}
              disabled={question.questions.length <= 1}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newQuestions = [...(question.questions || []), ""]
            const newCorrectAnswers = [...(question.correctAnswers || []), [""]]
            onUpdateQuestion(sectionId, question.id, {
              questions: newQuestions,
              correctAnswers: newCorrectAnswers,
            })
          }}
        >
          Add Question
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Acceptable Answers</Label>
        {question.questions?.map((q, qIndex) => (
          <div key={qIndex} className="space-y-2 border p-3 rounded-md">
            <p className="font-medium">{q || `Question ${qIndex + 1}`}</p>

            {(question.correctAnswers?.[qIndex] || [""]).map((answer, ansIndex) => (
              <div key={ansIndex} className="flex gap-2">
                <Input
                  value={answer}
                  onChange={(e) => {
                    const newCorrectAnswers = [...(question.correctAnswers || [])]
                    if (!newCorrectAnswers[qIndex]) {
                      newCorrectAnswers[qIndex] = []
                    }
                    newCorrectAnswers[qIndex][ansIndex] = e.target.value
                    onUpdateQuestion(sectionId, question.id, {
                      correctAnswers: newCorrectAnswers,
                    })
                  }}
                  placeholder={`Acceptable answer ${ansIndex + 1}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newCorrectAnswers = [...(question.correctAnswers || [])]
                    newCorrectAnswers[qIndex] = newCorrectAnswers[qIndex].filter((_, i) => i !== ansIndex)
                    onUpdateQuestion(sectionId, question.id, {
                      correctAnswers: newCorrectAnswers,
                    })
                  }}
                  disabled={question.correctAnswers?.[qIndex]?.length <= 1}
                >
                  ✕
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newCorrectAnswers = [...(question.correctAnswers || [])]
                if (!newCorrectAnswers[qIndex]) {
                  newCorrectAnswers[qIndex] = [""]
                } else {
                  newCorrectAnswers[qIndex].push("")
                }
                onUpdateQuestion(sectionId, question.id, {
                  correctAnswers: newCorrectAnswers,
                })
              }}
            >
              Add Alternative Answer
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

