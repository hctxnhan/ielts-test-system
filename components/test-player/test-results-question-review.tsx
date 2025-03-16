"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"
import type { Question, UserAnswer } from "@/lib/types"
import QuestionRenderer from "./question-renderer"

interface TestResultsQuestionReviewProps {
  question: Question & { sectionId: string; sectionTitle: string }
  answer: UserAnswer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  sampleAnswer?: string
}

export default function TestResultsQuestionReview({
  question,
  answer,
  open,
  onOpenChange,
  sampleAnswer,
}: TestResultsQuestionReviewProps) {
  // Format answer for display
  const formatAnswer = (question: Question, answer: any) => {
    if (!answer) return "No answer provided"

    switch (question.type) {
      case "multiple-choice":
        return `Option ${answer + 1}: ${question.options[answer]}`

      case "completion":
        if (Array.isArray(answer)) {
          return answer.map((ans, i) => `Blank ${i + 1}: ${ans || "No answer"}`).join(", ")
        }
        return String(answer)

      case "matching":
      case "matching-headings":
      case "labeling":
      case "pick-from-list":
        if (typeof answer === "object") {
          return Object.entries(answer)
            .map(([key, value]) => `Item ${Number(key) + 1} → Option ${Number(value) + 1}`)
            .join(", ")
        }
        return String(answer)

      case "true-false-not-given":
        if (typeof answer === "object") {
          return Object.entries(answer)
            .map(([key, value]) => `Statement ${Number(key) + 1}: ${value}`)
            .join(", ")
        }
        return String(answer)

      case "short-answer":
        if (Array.isArray(answer)) {
          return answer.map((ans, i) => `Question ${i + 1}: ${ans || "No answer"}`).join(", ")
        }
        return String(answer)

      case "writing-task1":
      case "writing-task2":
        return answer.length > 100 ? `${answer.substring(0, 100)}...` : answer

      default:
        return String(answer)
    }
  }

  // Format correct answer for display
  const formatCorrectAnswer = (question: Question) => {
    switch (question.type) {
      case "multiple-choice":
        return `Option ${question.correctAnswer + 1}: ${question.options[question.correctAnswer]}`

      case "completion":
        return question.correctAnswers.map((ans, i) => `Blank ${i + 1}: ${ans}`).join(", ")

      case "matching":
        return Object.entries(question.correctMatches)
          .map(
            ([key, value]) =>
              `Item ${Number(key) + 1} (${question.items[Number(key)]}) → Option ${Number(value) + 1} (${question.options[Number(value)]})`,
          )
          .join(", ")

      case "matching-headings":
        return Object.entries(question.correctMatches)
          .map(
            ([key, value]) =>
              `Paragraph ${Number(key) + 1} → Heading ${Number(value) + 1} (${question.headings[Number(value)]})`,
          )
          .join(", ")

      case "labeling":
        return Object.entries(question.correctLabels)
          .map(
            ([key, value]) =>
              `Label ${Number(key) + 1} (${question.labels[Number(key)]}) → Option ${Number(value) + 1} (${question.options[Number(value)]})`,
          )
          .join(", ")

      case "pick-from-list":
        return Object.entries(question.correctAnswers)
          .map(
            ([key, value]) => `Item ${Number(key) + 1} (${question.items[Number(key)]}) → Option ${Number(value) + 1}`,
          )
          .join(", ")

      case "true-false-not-given":
        return question.statements.map((statement, i) => `Statement ${i + 1}: ${question.correctAnswers[i]}`).join(", ")

      case "short-answer":
        return question.questions
          .map((q, i) => `Question ${i + 1}: ${question.correctAnswers[i].join(" OR ")}`)
          .join(", ")

      case "writing-task1":
      case "writing-task2":
        return "Writing tasks are scored based on multiple criteria."

      default:
        return "No correct answer available"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Question Review
            <Badge variant="outline" className="ml-2">
              {question.sectionTitle}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="question" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="question">Question</TabsTrigger>
            <TabsTrigger value="your-answer">Your Answer</TabsTrigger>
            <TabsTrigger value="correct-answer">Correct Answer</TabsTrigger>
          </TabsList>

          <TabsContent value="question" className="p-4 border rounded-md mt-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">{question.text}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{question.type}</Badge>
                <Badge variant="outline">{question.points} points</Badge>
                {answer && (
                  <Badge
                    variant={answer.isCorrect ? "success" : answer.partiallyCorrect ? "warning" : "destructive"}
                    className={`${
                      answer.isCorrect
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : answer.partiallyCorrect
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                    }`}
                  >
                    {answer.isCorrect ? "Correct" : answer.partiallyCorrect ? "Partially Correct" : "Incorrect"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="border p-4 rounded-md bg-muted/30">
              <QuestionRenderer question={question} sectionId={question.sectionId} />
            </div>
          </TabsContent>

          <TabsContent value="your-answer" className="p-4 border rounded-md mt-4">
            <h3 className="text-lg font-medium mb-4">Your Answer</h3>

            {answer ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/30">
                  {question.type === "writing-task1" || question.type === "writing-task2" ? (
                    <div className="whitespace-pre-line">{answer.answer}</div>
                  ) : (
                    <p>{formatAnswer(question, answer.answer)}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Score:</span>
                  <span>
                    {answer.score} / {answer.maxScore}
                  </span>
                </div>

                {/* AI Scoring Feedback for writing tasks */}
                {(question.type === "writing-task1" || question.type === "writing-task2") &&
                  answer.answer &&
                  answer.feedback && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Award className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                        AI Feedback
                      </h4>
                      <div className="whitespace-pre-line text-sm">{answer.feedback}</div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="p-4 border rounded-md bg-muted/30 text-muted-foreground">
                You did not answer this question.
              </div>
            )}
          </TabsContent>

          <TabsContent value="correct-answer" className="p-4 border rounded-md mt-4">
            <h3 className="text-lg font-medium mb-4">Correct Answer</h3>

            <div className="p-4 border rounded-md bg-muted/30">
              {question.type === "writing-task1" || question.type === "writing-task2" ? (
                <div>
                  {sampleAnswer || question.sampleAnswer ? (
                    <div>
                      <h4 className="font-medium mb-2">Sample Answer:</h4>
                      <div className="whitespace-pre-line">{sampleAnswer || question.sampleAnswer}</div>
                    </div>
                  ) : (
                    <p>
                      Writing tasks are evaluated based on multiple criteria including task achievement, coherence and
                      cohesion, lexical resource, and grammatical range and accuracy.
                    </p>
                  )}
                </div>
              ) : (
                <p>{formatCorrectAnswer(question)}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

