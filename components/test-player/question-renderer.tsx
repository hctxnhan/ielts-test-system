"use client";
import React from "react";
import type {
  AnswerType,
  Question,
  UserAnswer,
  WritingTaskAnswer,
} from "@testComponents/lib/types"; // Import types
import { QuestionPluginRegistry } from "@testComponents/lib/question-plugin-system";
import WritingTask1QuestionRenderer from "./question-types/writing-task1-question"; // Fallback renderer for writing tasks
import SentenceTranslationQuestionComponent from "./question-types/sentence-translation-question";
import WordFormQuestionComponent from "./question-types/word-form-question";

import { useTestStore } from "@testComponents/store/test-store";
import { useEffect, useRef, useState } from "react";

interface QuestionRendererProps {
  question: Question;
  sectionId: string;
  isReviewMode?: boolean;
  answers: Record<string, UserAnswer> | undefined;
  onQuestionContentChange?: (questionId: string, content: string) => void;
}

// Function to get the local answer from progress
function getLocalAnswerFromProgress(
  question: Question,
  answers: Record<string, UserAnswer> | undefined,
): AnswerType | WritingTaskAnswer {
  if (!answers) return null;

  const plugin = QuestionPluginRegistry.getPlugin(question.type);
  const supportsPartialScoring = plugin?.config.supportsPartialScoring ?? false;
  const hasSubQuestionsConfig = plugin?.config.hasSubQuestions ?? false;

  // Handle questions supporting partial scoring with sub-questions
  if (supportsPartialScoring && hasSubQuestionsConfig && question.scoringStrategy === "partial") {
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
    (userAnswer.subQuestionId !== undefined &&
      userAnswer.subQuestionId !== null)
  ) {
    return null;
  }

  const answer = userAnswer.answer;

  // Handle questions that need Record format but don't have sub-questions
  // Currently only T/F/NG needs this special handling
  if (question.type === "true-false-not-given" && !hasSubQuestionsConfig) {
    if (typeof answer === "string") {
      // Use the main question ID as the key for the single answer
      return { [question.id]: answer };
    }
    console.warn(
      `Unexpected answer format for single ${question.type} question ${question.id}:`,
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
    answer: unknown,
    subQuestionId?: string,
  ) => Promise<void>,
  subId?: string,
): void {
  // Check if this question should be scored on test completion
  const plugin = QuestionPluginRegistry.getPlugin(question.type);
  const hasSubQuestionsConfig = plugin?.config.hasSubQuestions;

  if (
    hasSubQuestionsConfig &&
    typeof newAnswer === "object" &&
    newAnswer !== null &&
    question.scoringStrategy === "partial"
  ) {
    // For questions scored immediately (not on completion), store individual answers when partial scoring
    if (subId) {
      // Extract the specific sub-question answer from the complete answers object
      const answerForSubQuestion = (newAnswer as Record<string, string>)[subId];
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
  sectionId: _sectionId,
  answers,
  isReviewMode = false,
  onQuestionContentChange,
}: QuestionRendererProps) {
  const { submitAnswer, currentTest } = useTestStore();
  const [localAnswer, setLocalAnswer] = useState<
    AnswerType | WritingTaskAnswer
  >(null);
  const questionIdRef = useRef(question.id);
  const hasInitializedRef = useRef(false);

  // Get updated question text from store
  const getUpdatedQuestion = () => {
    if (!currentTest) return question;

    // Find the question in the current test data (which contains updates)
    for (const section of currentTest.sections) {
      const foundQuestion = section.questions.find((q) => q.id === question.id);
      if (foundQuestion) {
        return foundQuestion;
      }
    }
    return question; // fallback to original if not found
  };

  const updatedQuestion = getUpdatedQuestion();

  // Determine answer prop based on plugin config.
  // If the plugin supports partial scoring and has sub-questions, collect sub-answers from `answers` keyed by subQuestionId.
  const plugin = QuestionPluginRegistry.getPlugin(updatedQuestion.type);
  const supportsPartial = plugin?.config.supportsPartialScoring ?? false;
  const hasSubQuestions = plugin?.config.hasSubQuestions ?? false;

  const answer = supportsPartial && hasSubQuestions && updatedQuestion.scoringStrategy === 'partial'
    ? Object.keys(localAnswer || {}).reduce((acc, key) => {
        const val = answers?.[key];
          acc[key] = val;
        return acc;
      }, {} as Record<string, UserAnswer | undefined>)
    : answers?.[updatedQuestion.id];

  // Initialize local answer from store if available
  useEffect(() => {
    if (questionIdRef.current !== question.id) {
      questionIdRef.current = question.id;
      hasInitializedRef.current = false;
    }

    if (!hasInitializedRef.current) {
      setLocalAnswer(getLocalAnswerFromProgress(updatedQuestion, answers));

      hasInitializedRef.current = true;
    }
  }, [question.id, answers, updatedQuestion]);

  // Handle answer changes with debouncing
  const handleChange = (
    newAnswer: unknown,
    subId?: string,
  ) => {
    // store locally with expected types
    setLocalAnswer(newAnswer as AnswerType | WritingTaskAnswer);
    setTimeout(() => {
      submitQuestionAnswer(updatedQuestion, newAnswer as AnswerType | WritingTaskAnswer, submitAnswer, subId);
    }, 100);
  };

  // Render question based on type
  const isWritingTask =
    updatedQuestion.type === "writing-task1" ||
    updatedQuestion.type === "writing-task2";

  const containerStyle = isWritingTask
    ? { maxWidth: "none" }
    : { maxWidth: 900, margin: "0 auto" };

  // Component to render question image if it exists
  const QuestionImage = () => {
    if (!updatedQuestion.imageUrl) return null;

    return (
      <div className="my-4">
        <img
          src={updatedQuestion.imageUrl}
          alt="Question image"
          className="max-w-full mx-auto h-auto rounded-md border border-gray-200 shadow-sm"
          style={{ maxHeight: "400px", objectFit: "contain" }}
        />
      </div>
    );
  };

  // If a plugin provides a renderer, use it dynamically to reduce repetition.
  const Renderer = QuestionPluginRegistry.getRenderer(updatedQuestion.type);
  if (Renderer) {
    if (updatedQuestion.type && updatedQuestion.type == 'writing-task1' || updatedQuestion.type == 'writing-task2' ) {
      return (
      <div style={containerStyle}>
        <Renderer
          question={updatedQuestion}
          value={localAnswer as unknown}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
          onQuestionHighlighted={onQuestionContentChange}
          {...(answer !== undefined ? ({ answer: answer as unknown as UserAnswer }) : {})}
        />
      </div>
    );
    } else 
    return (
      <div style={containerStyle}>
        <QuestionImage />
        <Renderer
          question={updatedQuestion}
          value={localAnswer as unknown}
          onChange={handleChange}
          readOnly={isReviewMode}
          showCorrectAnswer={isReviewMode}
          onQuestionHighlighted={onQuestionContentChange}
          {...(answer !== undefined ? ({ answer: answer as unknown as UserAnswer }) : {})}
        />
      </div>
    );
  }

  // Fallback to the original switch for any types without a registered renderer.
  switch (updatedQuestion.type) {
    case "writing-task1":
    case "writing-task2":
      return (
        <div style={containerStyle}>
          {/* <QuestionImage /> */}
          <WritingTask1QuestionRenderer
            question={updatedQuestion}
            value={localAnswer as WritingTaskAnswer | null}
            onChange={handleChange}
            readOnly={isReviewMode}
            showCorrectAnswer={isReviewMode}
            onQuestionHighlighted={onQuestionContentChange}
            answer={answer as unknown as UserAnswer}
          />
        </div>
      );

    case "sentence-translation":
      return (
        <div style={containerStyle}>
          <QuestionImage />
          <SentenceTranslationQuestionComponent
            question={updatedQuestion}
            value={localAnswer as Record<string, string> | null}
            onChange={handleChange}
            readOnly={isReviewMode}
            showCorrectAnswer={isReviewMode}
            onQuestionHighlighted={onQuestionContentChange}
            answer={answer as unknown as UserAnswer}
          />
        </div>
      );

    case "word-form":
      return (
        <div style={containerStyle}>
          <QuestionImage />
          <WordFormQuestionComponent
            question={updatedQuestion}
            value={localAnswer as Record<string, string> | null}
            onChange={handleChange}
            readOnly={isReviewMode}
            showCorrectAnswer={isReviewMode}
            onQuestionHighlighted={onQuestionContentChange}
            answer={answer as unknown as UserAnswer}
          />
        </div>
      );

    default:
    //   return null;
  }
}
