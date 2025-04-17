"use client";

import type {
  Question,
  UserAnswer,
  QuestionType,
  TFNGStatement,
} from "@testComponents/lib/types";
import { useTestStore } from "@testComponents/store/test-store";
import { useEffect, useRef, useState } from "react";
import CompletionQuestion from "./question-types/completion-question";
import LabelingQuestion from "./question-types/labeling-question";
import MatchingHeadingsQuestion from "./question-types/matching-headings-question";
import MatchingQuestion from "./question-types/matching-question";
import MultipleChoiceQuestion from "./question-types/multiple-choice-question";
import PickFromListQuestion from "./question-types/pick-from-list-question";
import ShortAnswerQuestion from "./question-types/short-answer-question";
import TrueFalseNotGivenQuestion from "./question-types/true-false-not-given-question";
import WritingTask1Question from "./question-types/writing-task1-question";
import WritingTask2Question from "./question-types/writing-task2-question";

interface QuestionRendererProps {
  question: Question;
  sectionId: string;
}

type AnswerType = Record<string, string> | string | number | null;

// Type guard for questions with subQuestions
function hasSubQuestions(question: Question): boolean {
  return (
    question.subQuestions !== undefined && question.subQuestions.length > 0
  );
}

// Function to get the local answer from progress
function getLocalAnswerFromProgress(
  question: Question,
  answers: Record<string, UserAnswer> | undefined
): AnswerType {
  if (!answers) return null;

  if (hasSubQuestions(question) && question.scoringStrategy === "partial") {
    // For questions with sub-questions, collect answers for all sub-questions
    const subAnswers: Record<string, string> = {};

    // Use enhanced UserAnswer structure to find answers related to this question
    const questionAnswers = Object.values(answers).filter(
      (answer) =>
        answer.parentQuestionId === question.id ||
        answer.questionId === question.id
    );

    questionAnswers.forEach((answer) => {
      if (answer.subQuestionId !== undefined && answer.answer !== undefined) {
        subAnswers[answer.subQuestionId] = answer.answer;
      }
    });

    return Object.keys(subAnswers).length > 0 ? subAnswers : null;
  }

  // Regular question without sub-questions
  const answer = answers[question.id]?.answer;
  if (!answer) return null;

  // Special handling for writing tasks
  if (question.type === "writing-task1" || question.type === "writing-task2") {
    return answer as string;
  }

  return answer;
}

// Function to submit an answer with proper typing
function submitQuestionAnswer(
  question: Question,
  newAnswer: AnswerType,
  submitAnswer: (
    questionId: string,
    answer: any,
    subQuestionId?: string
  ) => void,
  subId?: string
): void {
  if (
    hasSubQuestions(question) &&
    typeof newAnswer === "object" &&
    newAnswer !== null
  ) {
    if (subId) {
      const answerForSubQuestion =
        question.type === "matching" ||
        question.type === "labeling" ||
        question.type === "pick-from-list" ||
        question.type === "matching-headings" ||
        question.type === "short-answer" ||
        question.type === "true-false-not-given" ||
        question.type === "completion"
          ? newAnswer[subId]
          : newAnswer;

      submitAnswer(question.id, answerForSubQuestion, subId);
    } else {
      submitAnswer(question.id, newAnswer);
    }
  } else {
    submitAnswer(question.id, newAnswer);
  }
  return;
}

export default function QuestionRenderer({
  question,
  sectionId,
}: QuestionRendererProps) {
  const { submitAnswer, progress } = useTestStore();
  const [localAnswer, setLocalAnswer] = useState<AnswerType>(null);
  const questionIdRef = useRef(question.id);
  const hasInitializedRef = useRef(false);

  // Initialize local answer from store if available
  useEffect(() => {
    if (questionIdRef.current !== question.id) {
      questionIdRef.current = question.id;
      hasInitializedRef.current = false;
    }

    if (!hasInitializedRef.current) {
      setLocalAnswer(getLocalAnswerFromProgress(question, progress?.answers));
      hasInitializedRef.current = true;
    }
  }, [question.id, progress?.answers]);

  // Handle answer changes with debouncing
  const handleChange = (newAnswer: AnswerType, subId?: string) => {
    setLocalAnswer(newAnswer);

    // Debounce submission to prevent rapid consecutive calls
    setTimeout(() => {
      submitQuestionAnswer(question, newAnswer, submitAnswer, subId);
    }, 100);
  };

  // Render question based on type with proper type assertions
  switch (question.type) {
    case "multiple-choice":
      return (
        <MultipleChoiceQuestion
          question={question}
          value={localAnswer as string}
          onChange={handleChange}
        />
      );

    case "completion":
      return (
        <CompletionQuestion
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
        />
      );

    case "matching":
      return (
        <MatchingQuestion
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
        />
      );

    case "labeling":
      return (
        <LabelingQuestion
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
        />
      );

    case "pick-from-list":
      return (
        <PickFromListQuestion
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
        />
      );

    case "true-false-not-given":
      return (
        <TrueFalseNotGivenQuestion
          question={question}
          value={localAnswer as Record<string, string> | string | null}
          onChange={handleChange}
        />
      );

    case "matching-headings":
      return (
        <MatchingHeadingsQuestion
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
        />
      );

    case "short-answer":
      return (
        <ShortAnswerQuestion
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
        />
      );

    case "writing-task1":
      return (
        <WritingTask1Question
          question={question}
          value={localAnswer as string | null}
          onChange={handleChange}
        />
      );

    case "writing-task2":
      return (
        <WritingTask2Question
          question={question}
          value={localAnswer as string | null}
          onChange={handleChange}
        />
      );

    default: {
      // This helps TypeScript verify we've handled all cases
      const _exhaustiveCheck: never = question;
      return null;
    }
  }
}
