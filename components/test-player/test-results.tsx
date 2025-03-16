"use client"

import { useState } from "react"
import { useTestStore } from "@/store/test-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, BarChart3, ArrowLeft, AlertCircle, X, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import TestResultsQuestionReview from "./test-results-question-review"

export default function TestResults() {
  const { currentTest, progress, resetTest } = useTestStore()
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  if (!currentTest || !progress) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>No test results available.</p>
      </div>
    )
  }

  const score = progress.score || 0
  const totalPossibleScore = currentTest.sections.reduce(
    (total, section) => total + section.questions.reduce((sum, q) => sum + q.points, 0),
    0,
  )

  const scorePercentage = Math.round((score / totalPossibleScore) * 100)

  // Calculate time taken
  const startTime = new Date(progress.startedAt).getTime()
  const endTime = progress.completedAt ? new Date(progress.completedAt).getTime() : new Date().getTime()

  const timeTakenSeconds = Math.floor((endTime - startTime) / 1000)
  const timeTakenMinutes = Math.floor(timeTakenSeconds / 60)
  const remainingSeconds = timeTakenSeconds % 60

  // Calculate questions answered
  const totalQuestions = currentTest.totalQuestions
  const answeredQuestions = Object.keys(progress.answers).length

  // Calculate correct answers
  const correctAnswers = Object.values(progress.answers).filter((answer) => answer.isCorrect).length

  // Calculate partially correct answers
  const partiallyCorrectAnswers = Object.values(progress.answers).filter((answer) => answer.partiallyCorrect).length

  // Get all questions from all sections
  const allQuestions = currentTest.sections.flatMap((section) =>
    section.questions.map((question) => ({
      ...question,
      sectionId: section.id,
      sectionTitle: section.title,
    })),
  )

  // Find the selected question for review
  const selectedQuestion = selectedQuestionId ? allQuestions.find((q) => q.id === selectedQuestionId) : null

  const selectedQuestionAnswer =
    selectedQuestionId && progress.answers[selectedQuestionId] ? progress.answers[selectedQuestionId] : null

  // Handle opening the review dialog
  const handleReviewQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId)
    setReviewDialogOpen(true)
  }

  // Get answer status for a question
  const getAnswerStatus = (questionId: string) => {
    if (!progress.answers[questionId]) return "unanswered"
    if (progress.answers[questionId].isCorrect) return "correct"
    if (progress.answers[questionId].partiallyCorrect) return "partial"
    return "incorrect"
  }

  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "correct":
        return "bg-green-500"
      case "partial":
        return "bg-amber-500"
      case "incorrect":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "correct":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "partial":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "incorrect":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <HelpCircle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Test Results</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{scorePercentage}%</span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="10"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-primary stroke-current"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - scorePercentage / 100)}`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold mb-1">
              {score} / {totalPossibleScore} points
            </h2>
            <p className="text-muted-foreground">
              {currentTest.title} - {currentTest.type.toUpperCase()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <Clock className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Time Taken</h3>
              <p>
                {timeTakenMinutes}m {remainingSeconds}s
              </p>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
              <h3 className="font-medium">Correct Answers</h3>
              <p>
                {correctAnswers} / {answeredQuestions}
              </p>
              {partiallyCorrectAnswers > 0 && (
                <span className="text-xs text-amber-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {partiallyCorrectAnswers} partially correct
                </span>
              )}
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <BarChart3 className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Completion</h3>
              <p>
                {answeredQuestions} / {totalQuestions} questions
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Section Breakdown</h3>
            <div className="space-y-4">
              {currentTest.sections.map((section, index) => {
                // Calculate section score
                const sectionQuestionIds = section.questions.map((q) => q.id)
                const sectionAnswers = Object.values(progress.answers).filter((answer) =>
                  sectionQuestionIds.includes(answer.questionId),
                )

                const sectionScore = sectionAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0)

                const sectionTotalScore = section.questions.reduce((sum, q) => sum + q.points, 0)

                const sectionPercentage = Math.round((sectionScore / sectionTotalScore) * 100) || 0

                return (
                  <div key={section.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">{section.title}</h4>
                      <span className="font-medium">
                        {sectionScore} / {sectionTotalScore}
                      </span>
                    </div>
                    <Progress value={sectionPercentage} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {sectionAnswers.length} / {section.questions.length} questions answered
                      </span>
                      <span>{sectionPercentage}% correct</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Question List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Question Review</h3>
            <Accordion type="single" collapsible className="w-full">
              {currentTest.sections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="hover:bg-muted px-4 rounded-md">{section.title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2">
                      {section.questions.map((question, qIndex) => {
                        const status = getAnswerStatus(question.id)
                        const statusColor = getStatusColorClass(status)

                        return (
                          <Button
                            key={question.id}
                            variant="outline"
                            size="sm"
                            className="relative p-0 h-10 w-10 flex items-center justify-center"
                            onClick={() => handleReviewQuestion(question.id)}
                          >
                            <span className="text-sm">{qIndex + 1}</span>
                            <span className={`absolute bottom-0 left-0 right-0 h-1.5 ${statusColor}`}></span>
                          </Button>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between text-sm mt-3 px-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                          <span>Correct</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span>
                          <span>Partially Correct</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                          <span>Incorrect</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 bg-gray-300 rounded-full"></span>
                          <span>Not Answered</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-2">Performance Analysis</h3>
            <p>
              {scorePercentage >= 70
                ? "Great job! You've demonstrated a good understanding of the material."
                : scorePercentage >= 50
                  ? "You're on the right track. With more practice, you can improve your score."
                  : "This test identified some areas where you need more practice. Don't worry, keep studying!"}
            </p>

            <div className="mt-4">
              <h4 className="font-medium mb-1">Suggested Next Steps:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Review your incorrect answers to identify knowledge gaps</li>
                <li>Practice with more {currentTest.type} tests</li>
                <li>Focus on time management during the test</li>
              </ul>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="w-full sm:w-auto" onClick={resetTest}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Try Again
          </Button>

          <Link href="/tests" className="w-full sm:w-auto">
            <Button className="w-full">Back to Tests</Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Question Review Dialog */}
      {selectedQuestion && (
        <TestResultsQuestionReview
          question={selectedQuestion}
          answer={selectedQuestionAnswer}
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
        />
      )}
    </div>
  )
}

