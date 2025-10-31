import React from "react";
import { v4 as uuidv4 } from "uuid";
import type { CompletionQuestion } from "../types";
import type {
  StandardCompletionQuestion,
  StandardSubQuestionMeta,
} from "../standardized-types";
import {
  BaseQuestionPlugin,
  ValidationResult,
  QuestionRendererProps,
  QuestionEditorProps,
  ScoringContext,
  ScoringResult,
} from "../question-plugin-system";

// Import the existing components
import CompletionQuestionComponent from "../../components/test-player/question-types/completion-question";
import CompletionEditor from "../../components/creator/question-editors/completion-editor";


export class CompletionPlugin extends BaseQuestionPlugin<CompletionQuestion> {
  config = {
    type: "completion" as const,
    displayName: "Completion",
    description: "Fill in the blanks with appropriate words",
    icon: "▭",
    category: ["reading" as const, "listening" as const, "grammar" as const],
    supportsPartialScoring: true,
    supportsAIScoring: false,
    hasSubQuestions: true,
    defaultPoints: 1,
  };

  createRenderer(): React.ComponentType<
    QuestionRendererProps<CompletionQuestion>
  > {
    return CompletionQuestionComponent as unknown as React.ComponentType<
      QuestionRendererProps<CompletionQuestion>
    >;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<CompletionQuestion>> {
    return CompletionEditor as unknown as React.ComponentType<
      QuestionEditorProps<CompletionQuestion>
    >;
  }

  createDefault(index: number): CompletionQuestion {
    return {
      id: uuidv4(),
      type: "completion",
      text: "",
      points: this.config.defaultPoints,
      scoringStrategy: "partial",
      index: index,
      partialEndingIndex: index,
      subQuestions: [],
    };
  }

  transform(question: CompletionQuestion): StandardCompletionQuestion {
    const standardSubQuestions: StandardSubQuestionMeta[] =
      question.subQuestions.map((sub) => ({
        subId: sub.subId,
        points: sub.points,
        acceptableAnswers: sub.acceptableAnswers,
        questionText: question.text,
      }));

    return {
      ...question,
      subQuestions: standardSubQuestions,
    } as StandardCompletionQuestion;
  }

  score(context: ScoringContext): ScoringResult {
    const question = context.question as CompletionQuestion;
    const answer = context.answer;
    const subQuestionId = context.subQuestionId;

    const scoringStrategy = question.scoringStrategy || "partial";

    if (scoringStrategy === "partial" && subQuestionId) {
      // Partial scoring - score individual sub-question using its own points
      const subQuestion = question.subQuestions?.find(
        (sq) => sq.subId === subQuestionId,
      );

      if (!subQuestion) {
        return {
          isCorrect: false,
          score: 0,
          maxScore: 0,
          feedback: "Sub-question not found",
        };
      }

      // Handle different answer formats for partial scoring
      let userAnswer: string;
      if (typeof answer === 'string') {
        // Direct string answer
        userAnswer = answer;
      } else if (typeof answer === 'object' && answer !== null && subQuestionId) {
        // Object with sub-question answers
        userAnswer = (answer as Record<string, string>)[subQuestionId] || '';
      } else {
        userAnswer = '';
      }

      const normalizedAnswer = userAnswer?.toString().trim().toLowerCase().replace(/\s+/g, " ") || "";
      
      const isCorrect =
        subQuestion.acceptableAnswers?.some(
          (acceptableAnswer: string) => {
            const normalizedAcceptable = acceptableAnswer.trim().toLowerCase().replace(/\s+/g, " ");
            return normalizedAcceptable === normalizedAnswer;
          }
        ) || false;

      // Use subQuestion.points if defined, otherwise default to 1
      const points = subQuestion.points !== undefined ? subQuestion.points : 1;

      const result = {
        isCorrect,
        score: isCorrect ? points : 0,
        maxScore: points,
        feedback: isCorrect
          ? "Correct!"
          : `Incorrect. Acceptable answers: ${subQuestion.acceptableAnswers?.join(", ") || "None"}`,
      };

      return result;
    } else {
      // All-or-nothing scoring - use main question points
      const totalSubQuestions = question.subQuestions?.length || 0;
      const answers = answer as Record<string, string>;
      
      const correctCount = Object.entries(answers || {}).filter(
        ([key, value]) => {
          const foundSubQuestion = question.subQuestions?.some((sq) => {
            if (sq.subId !== key) return false;
            
            // Ensure value is a string before processing
            const stringValue = value?.toString() || '';
            const normalizedValue = stringValue
              .trim()
              .toLowerCase()
              .replace(/\s+/g, " ");
            
            const isAcceptable = sq.acceptableAnswers?.some((acceptableAnswer: string) => {
              const normalizedAcceptableAnswer = acceptableAnswer
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ");
              return normalizedAcceptableAnswer === normalizedValue;
            });
            
            return isAcceptable;
          });
          
          return foundSubQuestion;
        },
      ).length;

      const isCorrect = correctCount === totalSubQuestions && totalSubQuestions > 0;

      const result = {
        isCorrect,
        score: isCorrect ? question.points : 0,
        maxScore: question.points,
        feedback: isCorrect
          ? "All answers correct!"
          : `${correctCount}/${totalSubQuestions} answers correct`,
      };
      
      return result;
    }
  }

  validate(question: CompletionQuestion): ValidationResult {
    const baseValidation = super.validate(question);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Completion specific validation
    if (!question.subQuestions || question.subQuestions.length === 0) {
      errors.push("Completion questions must have at least one blank");
    }

    // Check for empty acceptable answers
    const emptyAnswers =
      question.subQuestions?.filter(
        (subQ) =>
          !subQ.acceptableAnswers ||
          subQ.acceptableAnswers.length === 0 ||
          subQ.acceptableAnswers.every((answer) => !answer.trim()),
      ) || [];

    if (emptyAnswers.length > 0) {
      errors.push("All blanks must have at least one acceptable answer");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
