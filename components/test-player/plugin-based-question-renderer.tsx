"use client";
import React, { useEffect, useRef, useState } from "react";
import type {
  AnswerType,
  Question,
  UserAnswer,
  WritingTaskAnswer,
} from "@testComponents/lib/types";
import { QuestionPluginRegistry } from "@testComponents/lib/question-plugin-system";
import { useTestStore } from "@testComponents/store/test-store";

interface PluginBasedQuestionRendererProps {
  question: Question;
  sectionId: string;
  isReviewMode?: boolean;
  answers: Record<string, UserAnswer>;
  onQuestionContentChange?: (questionId: string, content: string) => void;
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
  answers: Record<string, UserAnswer> | undefined
): AnswerType | WritingTaskAnswer {
  if (!answers) return null;

  // Handle questions supporting partial scoring with sub-questions
  if (
    QuestionPluginRegistry.supportsPartialScoring(question.type) &&
    hasSubQuestions(question) &&
    question.subQuestions
  ) {
    const subAnswers: Record<string, string> = {};
    for (const subQ of question.subQuestions) {
      const userAnswer = answers[subQ.subId];
      if (userAnswer?.answer) {
        subAnswers[subQ.subId] = userAnswer.answer;
      }
    }
    return Object.keys(subAnswers).length > 0 ? subAnswers : null;
  } else {
    // Single answer questions
    const userAnswer = answers[question.id];
    return userAnswer?.answer || null;
  }
}

// Function to submit an answer with proper typing
function submitQuestionAnswer(
  question: Question,
  newAnswer: AnswerType | WritingTaskAnswer,
  submitAnswer: (
    questionId: string,
    answer: unknown,
    subQuestionId?: string
  ) => Promise<void>,
  subId?: string
): void {
  if (subId) {
    submitAnswer(question.id, newAnswer, subId);
  } else {
    submitAnswer(question.id, newAnswer);
  }
}

export default function PluginBasedQuestionRenderer({
  question,
  sectionId: _sectionId,
  answers,
  isReviewMode = false,
  onQuestionContentChange = () => {},
}: PluginBasedQuestionRendererProps) {
  const { submitAnswer, currentTest } = useTestStore();
  const [localAnswer, setLocalAnswer] = useState<AnswerType | WritingTaskAnswer>(null);
  const questionIdRef = useRef(question.id);
  const hasInitializedRef = useRef(false);

  // Get updated question text from store
  const getUpdatedQuestion = () => {
    if (!currentTest) return question;
    
    // Find the question in the current test data (which contains updates)
    for (const section of currentTest.sections) {
      const foundQuestion = section.questions.find(q => q.id === question.id);
      if (foundQuestion) {
        return foundQuestion;
      }
    }
    return question; // fallback to original if not found
  };

  const updatedQuestion = getUpdatedQuestion();

  // Initialize local answer from store if available
  useEffect(() => {
    // Reset initialization when question changes
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
    subId?: string
  ) => {
    setLocalAnswer(newAnswer as AnswerType | WritingTaskAnswer);
    setTimeout(() => {
      submitQuestionAnswer(updatedQuestion, newAnswer as AnswerType | WritingTaskAnswer, submitAnswer, subId);
    }, 100);
  };

  // Get the plugin for this question type
  const plugin = QuestionPluginRegistry.getPlugin(question.type);
  
  if (!plugin) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <p className="text-red-600 font-medium">
          Unsupported question type: {question.type}
        </p>
        <p className="text-red-500 text-sm mt-1">
          No plugin is registered for this question type. Please check your plugin configuration.
        </p>
      </div>
    );
  }

  // Get the renderer component from the plugin
  const RendererComponent = plugin.createRenderer();

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
          style={{ maxHeight: '400px', objectFit: 'contain' }}
        />
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <QuestionImage />
      <RendererComponent
        question={updatedQuestion}
        value={localAnswer}
        onChange={handleChange}
        readOnly={isReviewMode}
        showCorrectAnswer={isReviewMode}
        onQuestionHighlighted={onQuestionContentChange}
      />
    </div>
  );
}
