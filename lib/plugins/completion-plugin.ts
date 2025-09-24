import React from "react";
import { v4 as uuidv4 } from "uuid";
import type { CompletionQuestion } from "../types";
import type { StandardCompletionQuestion, StandardSubQuestionMeta } from "../standardized-types";
import { BaseQuestionPlugin, ValidationResult, QuestionRendererProps, QuestionEditorProps, ScoringContext, ScoringResult } from "../question-plugin-system";

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
    defaultPoints: 1
  };

  createRenderer(): React.ComponentType<QuestionRendererProps<CompletionQuestion>> {
    return CompletionQuestionComponent as unknown as React.ComponentType<QuestionRendererProps<CompletionQuestion>>;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<CompletionQuestion>> {
    return CompletionEditor as unknown as React.ComponentType<QuestionEditorProps<CompletionQuestion>>;
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
      blanks: 3,
      subQuestions: [
        {
          subId: uuidv4(),
          acceptableAnswers: [""],
          points: this.config.defaultPoints / 3,
        },
        {
          subId: uuidv4(),
          acceptableAnswers: [""],
          points: this.config.defaultPoints / 3,
        },
        {
          subId: uuidv4(),
          acceptableAnswers: [""],
          points: this.config.defaultPoints / 3,
        },
      ],
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
      // Partial scoring - score individual sub-question
      const subQuestion = question.subQuestions?.find(sq => sq.subId === subQuestionId);
      
      if (!subQuestion) {
        return {
          isCorrect: false,
          score: 0,
          maxScore: 0,
          feedback: "Sub-question not found"
        };
      }

      const normalizedAnswer = (answer as string)?.trim().toLowerCase().replace(/\s+/g, " ") || "";
      const isCorrect = subQuestion.acceptableAnswers?.some(
        (acceptableAnswer: string) =>
          acceptableAnswer.trim().toLowerCase().replace(/\s+/g, " ") === normalizedAnswer
      ) || false;

      return {
        isCorrect,
        score: isCorrect ? subQuestion.points : 0,
        maxScore: subQuestion.points,
        feedback: isCorrect 
          ? "Correct!" 
          : `Incorrect. Acceptable answers: ${subQuestion.acceptableAnswers?.join(", ") || "None"}`
      };
    } else {
      // All-or-nothing scoring - score entire question
      const totalSubQuestions = question.subQuestions?.length || 0;
      const answers = answer as Record<string, string>;
      
      const correctCount = Object.entries(answers || {}).filter(([key, value]) =>
        question.subQuestions?.some(sq => {
          if (sq.subId !== key) return false;
          const normalizedValue = value.trim().toLowerCase().replace(/\s+/g, " ");
          return sq.acceptableAnswers?.some((acceptableAnswer: string) => {
            const normalizedAcceptableAnswer = acceptableAnswer.trim().toLowerCase().replace(/\s+/g, " ");
            return normalizedAcceptableAnswer === normalizedValue;
          });
        })
      ).length;

      const isCorrect = correctCount === totalSubQuestions;
      
      return {
        isCorrect,
        score: isCorrect ? question.points : 0,
        maxScore: question.points,
        feedback: isCorrect 
          ? "All answers correct!" 
          : `${correctCount}/${totalSubQuestions} answers correct`
      };
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

    if (question.blanks <= 0) {
      errors.push("Number of blanks must be greater than 0");
    }

    if (question.subQuestions && question.blanks !== question.subQuestions.length) {
      warnings.push("Number of blanks doesn't match number of sub-questions");
    }

    // Check for empty acceptable answers
    const emptyAnswers = question.subQuestions?.filter(subQ => 
      !subQ.acceptableAnswers || subQ.acceptableAnswers.length === 0 || 
      subQ.acceptableAnswers.every(answer => !answer.trim())
    ) || [];
    
    if (emptyAnswers.length > 0) {
      errors.push("All blanks must have at least one acceptable answer");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
