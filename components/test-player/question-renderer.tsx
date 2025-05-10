"use client";
import React from "react";
import type {
  AnswerType,
  Question,
  UserAnswer,
  WritingTaskAnswer,
} from "@testComponents/lib/types"; // Import types
// Import actual components
import CompletionQuestionComponent from "./question-types/completion-question";
import LabelingQuestionComponent from "./question-types/labeling-question";
import MatchingHeadingsQuestionComponent from "./question-types/matching-headings-question";
import MatchingQuestionComponent from "./question-types/matching-question";
import MultipleChoiceQuestionComponent from "./question-types/multiple-choice-question";
import PickFromListQuestionComponent from "./question-types/pick-from-list-question";
import ShortAnswerQuestionComponent from "./question-types/short-answer-question";
import TrueFalseNotGivenQuestionComponent from "./question-types/true-false-not-given-question";
import WritingTask1QuestionRenderer from "./question-types/writing-task1-question"; // Correct component import
import WritingTask2QuestionRenderer from "./question-types/writing-task2-question"; // Correct component import

import { supportsPartialScoring } from "@testComponents/lib/test-utils";
import { useTestStore } from "@testComponents/store/test-store";
import { useEffect, useRef, useState } from "react";

interface QuestionRendererProps {
  question: Question;
  sectionId: string;
  isReviewMode?: boolean;
}

// Type guard for questions with subQuestions
function hasSubQuestions(question: Question): boolean {
  return (
    question.subQuestions !== undefined && question.subQuestions.length > 0
  );
}

// Function to get the local answer from progress
function getLocalAnswerFromProgress(
  question: Question,
  answers: Record<string, UserAnswer> | undefined,
): AnswerType | WritingTaskAnswer {
  if (!answers) return null;

  // Handle questions supporting partial scoring with sub-questions
  if (
    supportsPartialScoring.includes(question.type) &&
    hasSubQuestions(question) &&
    question.scoringStrategy === "partial"
  ) {
    const subAnswers: Record<string, string> = {};
    const questionAnswers = Object.values(answers).filter(
      (answer) =>
        answer.parentQuestionId === question.id ||
        (answer.questionId === question.id &&
          answer.subQuestionId !== undefined),
    );

    questionAnswers.forEach((answer) => {
      if (
        answer.subQuestionId !== undefined &&
        answer.answer !== undefined &&
        typeof answer.answer === "string"
      ) {
        subAnswers[answer.subQuestionId] = answer.answer;
      }
    });

    return Object.keys(subAnswers).length > 0 ? subAnswers : null;
  }

  // Handle regular questions or those without partial scoring strategy for sub-questions
  const userAnswer = answers[question.id];
  if (
    !userAnswer ||
    userAnswer.answer === undefined ||
    userAnswer.answer === null ||
    userAnswer.subQuestionId !== undefined
  ) {
    return null;
  }

  const answer = userAnswer.answer;

  // Handle T/F/NG specifically if it's NOT partial scoring / has no sub-questions
  // to ensure it returns a Record, matching the component's expected prop type
  if (question.type === "true-false-not-given" && !hasSubQuestions(question)) {
    if (typeof answer === "string") {
      // Use the main question ID as the key for the single answer
      return { [question.id]: answer };
    }
    console.warn(
      `Unexpected answer format for single T/F/NG question ${question.id}:`,
      answer,
    );
    return null;
  }

  return answer;
}

// Function to submit an answer with proper typing
function submitQuestionAnswer(
  question: Question,
  newAnswer: AnswerType | WritingTaskAnswer,
  submitAnswer: (
    questionId: string,
    answer: any,
    subQuestionId?: string,
  ) => void,
  subId?: string,
): void {
  if (
    hasSubQuestions(question) &&
    typeof newAnswer === "object" &&
    newAnswer !== null &&
    supportsPartialScoring.includes(question.type)
  ) {
    if (subId) {
      const answerForSubQuestion =
        question.type === "matching" ||
        question.type === "labeling" ||
        question.type === "pick-from-a-list" ||
        question.type === "matching-headings" ||
        question.type === "short-answer" ||
        question.type === "true-false-not-given" ||
        question.type === "completion"
          ? (newAnswer as Record<string, string>)[subId]
          : newAnswer;

      submitAnswer(question.id, answerForSubQuestion, subId);
    } else {
      submitAnswer(question.id, newAnswer);
    }
  } else {
    submitAnswer(question.id, newAnswer);
  }
}

export default function QuestionRenderer({
  question,
  sectionId,
  isReviewMode = false,
}: QuestionRendererProps) {
  const { submitAnswer, progress } = useTestStore();
  const [localAnswer, setLocalAnswer] = useState<
    AnswerType | WritingTaskAnswer
  >(null);
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
  const handleChange = (
    newAnswer: AnswerType | WritingTaskAnswer,
    subId?: string,
  ) => {
    setLocalAnswer(newAnswer);
    setTimeout(() => {
      submitQuestionAnswer(question, newAnswer, submitAnswer, subId);
    }, 100);
  };

  // Render question based on type
  switch (question.type) {
    case "multiple-choice":
      return (
        <MultipleChoiceQuestionComponent
          question={question}
          // Adjust cast: if null, pass undefined
          value={(localAnswer as string | null) ?? undefined}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
        />
      );

    case "completion":
      return (
        <CompletionQuestionComponent
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
        />
      );

    case "matching":
      return (
        <MatchingQuestionComponent
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
        />
      );

    case "labeling":
      return (
        <LabelingQuestionComponent
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
        />
      );

    case "pick-from-a-list":
      return (
        <PickFromListQuestionComponent
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
        />
      );

    case "true-false-not-given":
      return (
        <TrueFalseNotGivenQuestionComponent
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
        />
      );

    case "matching-headings":
      return (
        <MatchingHeadingsQuestionComponent
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
        />
      );

    case "short-answer":
      return (
        <ShortAnswerQuestionComponent
          question={question}
          value={localAnswer as Record<string, string> | null}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
        />
      );

    case "writing-task1":
      return (
        // Use the correct component name
        <WritingTask1QuestionRenderer
          question={question}
          value={localAnswer as WritingTaskAnswer | null}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
        />
      );

    case "writing-task2":
      return (
        // Use the correct component name
        <WritingTask2QuestionRenderer
          question={question}
          value={localAnswer as WritingTaskAnswer | null}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
        />
      );

    // No default case needed if the union is exhaustive
  }
}
