"use client"

import { useState, useEffect, useRef } from "react"
import { useTestStore } from "@/store/test-store"
import type { Question } from "@/lib/types"
import MultipleChoiceQuestion from "./question-types/multiple-choice-question"
import CompletionQuestion from "./question-types/completion-question"
import MatchingQuestion from "./question-types/matching-question"
import LabelingQuestion from "./question-types/labeling-question"
import PickFromListQuestion from "./question-types/pick-from-list-question"
import TrueFalseNotGivenQuestion from "./question-types/true-false-not-given-question"
import MatchingHeadingsQuestion from "./question-types/matching-headings-question"
import ShortAnswerQuestion from "./question-types/short-answer-question"
import WritingTask1Question from "./question-types/writing-task1-question"
import WritingTask2Question from "./question-types/writing-task2-question"

interface QuestionRendererProps {
  question: Question
  sectionId: string
}

export default function QuestionRenderer({ question, sectionId }: QuestionRendererProps) {
  const { submitAnswer, progress } = useTestStore()
  const [localAnswer, setLocalAnswer] = useState<any>(null)
  const questionIdRef = useRef(question.id)
  const hasInitializedRef = useRef(false)

  // Initialize local answer from store if available - only once when question changes
  useEffect(() => {
    // Reset initialization flag when question changes
    if (questionIdRef.current !== question.id) {
      questionIdRef.current = question.id
      hasInitializedRef.current = false
    }

    // Only initialize if not already done for this question
    if (!hasInitializedRef.current) {
      const storedAnswer = progress?.answers[question.id]?.answer || null

      // For writing tasks, we need to format the answer properly
      if (question.type === "writing-task1" || question.type === "writing-task2") {
        const answer = storedAnswer ? { text: storedAnswer } : null
        setLocalAnswer(answer)
      } else {
        setLocalAnswer(storedAnswer)
      }

      hasInitializedRef.current = true
    }
  }, [question.id, progress?.answers])

  // Manual submission function - no auto-submission
  const handleChange = (newAnswer: any) => {
    setLocalAnswer(newAnswer)

    // Submit after a short delay to prevent rapid consecutive submissions
    setTimeout(() => {
      submitAnswer(question.id, newAnswer)
    }, 100)
  }

  // Render different question types
  switch (question.type) {
    case "multiple-choice":
      return <MultipleChoiceQuestion question={question} value={localAnswer} onChange={handleChange} />

    case "completion":
      return <CompletionQuestion question={question} value={localAnswer} onChange={handleChange} />

    case "matching":
      return <MatchingQuestion question={question} value={localAnswer} onChange={handleChange} />

    case "labeling":
      return <LabelingQuestion question={question} value={localAnswer} onChange={handleChange} />

    case "pick-from-list":
      return <PickFromListQuestion question={question} value={localAnswer} onChange={handleChange} />

    case "true-false-not-given":
      return <TrueFalseNotGivenQuestion question={question} value={localAnswer} onChange={handleChange} />

    case "matching-headings":
      return <MatchingHeadingsQuestion question={question} value={localAnswer} onChange={handleChange} />

    case "short-answer":
      return <ShortAnswerQuestion question={question} value={localAnswer} onChange={handleChange} />

    case "writing-task1":
      return <WritingTask1Question question={question} value={localAnswer} onChange={handleChange} />

    case "writing-task2":
      return <WritingTask2Question question={question} value={localAnswer} onChange={handleChange} />

    default:
      return <p>Unsupported question type: {question.type}</p>
  }
}

