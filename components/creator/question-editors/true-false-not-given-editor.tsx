"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TrueFalseNotGivenQuestion } from "@/lib/types"

interface TrueFalseNotGivenEditorProps {
  question: TrueFalseNotGivenQuestion
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
}

export default function TrueFalseNotGivenEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: TrueFalseNotGivenEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Statements</Label>
        {question.statements?.map((statement, stmtIndex) => (
          <div key={stmtIndex} className="flex gap-2">
            <Input
              value={statement}
              onChange={(e) => {
                const newStatements = [...(question.statements || [])]
                newStatements[stmtIndex] = e.target.value
                onUpdateQuestion(sectionId, question.id, {
                  statements: newStatements,
                })
              }}
              placeholder={`Statement ${stmtIndex + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newStatements = question.statements.filter((_, i) => i !== stmtIndex)
                const newCorrectAnswers = [...(question.correctAnswers || [])]
                newCorrectAnswers.splice(stmtIndex, 1)
                onUpdateQuestion(sectionId, question.id, {
                  statements: newStatements,
                  correctAnswers: newCorrectAnswers,
                })
              }}
              disabled={question.statements.length <= 1}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newStatements = [...(question.statements || []), ""]
            const newCorrectAnswers = [...(question.correctAnswers || []), "true"]
            onUpdateQuestion(sectionId, question.id, {
              statements: newStatements,
              correctAnswers: newCorrectAnswers,
            })
          }}
        >
          Add Statement
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Correct Answers</Label>
        {question.statements?.map((statement, stmtIndex) => (
          <div key={stmtIndex} className="flex items-center gap-2">
            <span className="w-1/3 truncate">{statement || `Statement ${stmtIndex + 1}`}</span>
            <span>→</span>
            <Select
              value={question.correctAnswers?.[stmtIndex] || "true"}
              onValueChange={(value) => {
                const newAnswers = [...(question.correctAnswers || [])]
                newAnswers[stmtIndex] = value as "true" | "false" | "not-given"
                onUpdateQuestion(sectionId, question.id, {
                  correctAnswers: newAnswers,
                })
              }}
            >
              <SelectTrigger className="w-2/3">
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
                <SelectItem value="not-given">Not Given</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  )
}

