"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { QuestionGroup, Question } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

interface QuestionGroupEditorProps {
  group?: QuestionGroup
  sectionId: string
  availableQuestions: Question[]
  onSave: (sectionId: string, group: QuestionGroup) => void
  onCancel: () => void
}

export default function QuestionGroupEditor({
  group,
  sectionId,
  availableQuestions,
  onSave,
  onCancel,
}: QuestionGroupEditorProps) {
  const [title, setTitle] = useState(group?.title || "")
  const [instructions, setInstructions] = useState(group?.instructions || "")
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(group?.questionIds || [])

  const handleSave = () => {
    const newGroup: QuestionGroup = {
      id: group?.id || uuidv4(),
      title,
      instructions,
      questionIds: selectedQuestionIds,
    }
    onSave(sectionId, newGroup)
  }

  const toggleQuestionSelection = (questionId: string) => {
    if (selectedQuestionIds.includes(questionId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== questionId))
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, questionId])
    }
  }

  // Filter out questions that are already part of other groups
  const eligibleQuestions = availableQuestions.filter(
    (q) => !q.isPartOfGroup || (group && group.questionIds.includes(q.id)),
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{group ? "Edit Question Group" : "Create Question Group"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="group-title">Group Title</Label>
          <Input
            id="group-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Questions 1-5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="group-instructions">Instructions</Label>
          <Textarea
            id="group-instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., Complete the sentences below with NO MORE THAN THREE WORDS from the passage."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Select Questions for this Group</Label>
          <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
            {eligibleQuestions.length > 0 ? (
              eligibleQuestions.map((question) => (
                <div key={question.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`question-${question.id}`}
                    checked={selectedQuestionIds.includes(question.id)}
                    onCheckedChange={() => toggleQuestionSelection(question.id)}
                  />
                  <Label htmlFor={`question-${question.id}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{question.type}</span>: {question.text.substring(0, 50)}
                    {question.text.length > 50 ? "..." : ""}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-2">No eligible questions available</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title || selectedQuestionIds.length === 0}>
            {group ? "Update Group" : "Create Group"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

