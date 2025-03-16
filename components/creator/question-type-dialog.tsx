"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { TestType, QuestionType } from "@/lib/types"

interface QuestionTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  testType: TestType
  onSelectQuestionType: (type: QuestionType) => void
}

export default function QuestionTypeDialog({
  open,
  onOpenChange,
  testType,
  onSelectQuestionType,
}: QuestionTypeDialogProps) {
  // Common question types for all test types
  const commonQuestionTypes = [
    {
      type: "multiple-choice" as QuestionType,
      title: "Multiple Choice",
      description: "Select one correct answer",
    },
    {
      type: "completion" as QuestionType,
      title: "Completion",
      description: "Fill in the blanks",
    },
    {
      type: "matching" as QuestionType,
      title: "Matching",
      description: "Match items with options",
    },
    {
      type: "pick-from-list" as QuestionType,
      title: "Pick from List",
      description: "Select options from a list",
    },
  ]

  // Listening-specific question types
  const listeningQuestionTypes = [
    {
      type: "labeling" as QuestionType,
      title: "Labeling",
      description: "Label diagrams or maps",
    },
  ]

  // Reading-specific question types
  const readingQuestionTypes = [
    {
      type: "true-false-not-given" as QuestionType,
      title: "True/False/Not Given",
      description: "Evaluate statements",
    },
    {
      type: "matching-headings" as QuestionType,
      title: "Matching Headings",
      description: "Match paragraphs with headings",
    },
    {
      type: "short-answer" as QuestionType,
      title: "Short Answer",
      description: "Brief written responses",
    },
  ]

  // Add writing-specific question types
  const writingQuestionTypes = [
    {
      type: "writing-task1" as QuestionType,
      title: "Writing Task 1",
      description: "Describe visual information (graph, chart, diagram, etc.)",
    },
    {
      type: "writing-task2" as QuestionType,
      title: "Writing Task 2",
      description: "Write an essay on a given topic",
    },
  ]

  // Update the questionTypes array to include writing types
  let questionTypes = [...commonQuestionTypes]

  if (testType === "listening") {
    questionTypes = [...questionTypes, ...listeningQuestionTypes]
  } else if (testType === "reading") {
    questionTypes = [...questionTypes, ...readingQuestionTypes]
  } else if (testType === "writing") {
    questionTypes = [...writingQuestionTypes]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>Select the type of question you want to add.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {questionTypes.map((questionType) => (
            <Button
              key={questionType.type}
              variant="outline"
              className="h-24 flex flex-col"
              onClick={() => onSelectQuestionType(questionType.type)}
            >
              <span className="text-lg mb-1">{questionType.title}</span>
              <span className="text-xs text-muted-foreground">{questionType.description}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

