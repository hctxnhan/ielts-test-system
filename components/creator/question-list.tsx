"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Question, QuestionGroup } from "@/lib/types"
import QuestionEditor from "./question-editor"

interface QuestionListProps {
  questions: Question[]
  questionGroups?: QuestionGroup[]
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
  onRemoveQuestion: (sectionId: string, questionId: string) => void
}

export default function QuestionList({
  questions,
  questionGroups = [],
  sectionId,
  onUpdateQuestion,
  onRemoveQuestion,
}: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg">
        <p className="text-muted-foreground mb-2">No questions added yet</p>
      </div>
    )
  }

  // Group questions by their group ID
  const groupedQuestions: Record<string, Question[]> = {}
  const ungroupedQuestions: Question[] = []

  questions.forEach((question) => {
    if (question.isPartOfGroup && question.groupId) {
      if (!groupedQuestions[question.groupId]) {
        groupedQuestions[question.groupId] = []
      }
      groupedQuestions[question.groupId].push(question)
    } else {
      ungroupedQuestions.push(question)
    }
  })

  // Sort questions within each group by their position
  Object.keys(groupedQuestions).forEach((groupId) => {
    groupedQuestions[groupId].sort((a, b) => (a.groupPosition || 0) - (b.groupPosition || 0))
  })

  return (
    <div className="space-y-6">
      {/* Render grouped questions */}
      {questionGroups.map((group) => {
        const groupQuestions = groupedQuestions[group.id] || []
        if (groupQuestions.length === 0) return null

        return (
          <div key={group.id} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{group.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{group.instructions}</p>

            <div className="space-y-3">
              {groupQuestions.map((question, qIndex) => (
                <div key={question.id} className="border rounded-lg p-3 hover:bg-muted/50">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Q{question.groupPosition}</Badge>
                      <span className="text-xs px-2 py-1 bg-muted rounded-full capitalize">{question.type}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onRemoveQuestion(sectionId, question.id)}>
                      Delete
                    </Button>
                  </div>
                  <p className="line-clamp-1 text-sm">{question.text || "No question text yet"}</p>
                  <div className="flex justify-end mt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Edit Question
                        </Button>
                      </DialogTrigger>
                      <QuestionEditor question={question} sectionId={sectionId} onUpdateQuestion={onUpdateQuestion} />
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Render ungrouped questions */}
      {ungroupedQuestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Individual Questions</h3>
          {ungroupedQuestions.map((question, qIndex) => (
            <div key={question.id} className="border rounded-lg p-3 hover:bg-muted/50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Q{qIndex + 1}:</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full capitalize">{question.type}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemoveQuestion(sectionId, question.id)}>
                  Delete
                </Button>
              </div>
              <p className="line-clamp-1 text-sm">{question.text || "No question text yet"}</p>
              <div className="flex justify-end mt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Edit Question
                    </Button>
                  </DialogTrigger>
                  <QuestionEditor question={question} sectionId={sectionId} onUpdateQuestion={onUpdateQuestion} />
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

