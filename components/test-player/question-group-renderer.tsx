"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTestStore } from "@/store/test-store"
import type { Question, QuestionGroup } from "@/lib/types"
import QuestionRenderer from "./question-renderer"

interface QuestionGroupRendererProps {
  group: QuestionGroup
  questions: Question[]
  sectionId: string
}

export default function QuestionGroupRenderer({ group, questions, sectionId }: QuestionGroupRendererProps) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const { progress } = useTestStore()

  // Sort questions by their position in the group
  const sortedQuestions = [...questions].sort((a, b) => (a.groupPosition || 0) - (b.groupPosition || 0))

  // Check if all questions in the group have been answered
  const allAnswered = sortedQuestions.every((question) => progress?.answers[question.id] !== undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{group.instructions}</p>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeQuestionIndex.toString()}
          onValueChange={(value) => setActiveQuestionIndex(Number.parseInt(value))}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 sm:grid-cols-10 mb-4">
            {sortedQuestions.map((question, index) => {
              const isAnswered = progress?.answers[question.id] !== undefined
              return (
                <TabsTrigger
                  key={question.id}
                  value={index.toString()}
                  className={isAnswered ? "bg-green-100 dark:bg-green-900/20" : ""}
                >
                  {question.groupPosition || index + 1}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {sortedQuestions.map((question, index) => (
            <TabsContent key={question.id} value={index.toString()}>
              <QuestionRenderer question={question} sectionId={sectionId} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

