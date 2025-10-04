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

    // Console logging for testing completion question scoring
    console.log('🔍 COMPLETION QUESTION SCORING DEBUG:');
    console.log('├─ Question ID:', question.id);
    console.log('├─ Question Type:', question.type);
    console.log('├─ Answer provided:', answer);
    console.log('├─ Answer type:', typeof answer);
    console.log('├─ Answer is array:', Array.isArray(answer));
    console.log('├─ Answer is null/undefined:', answer == null);
    console.log('├─ Sub-question ID:', subQuestionId);
    console.log('├─ Question points:', question.points);
    console.log('├─ Sub-questions count:', question.subQuestions?.length || 0);

    const scoringStrategy = question.scoringStrategy || "partial";
    console.log('├─ Scoring strategy:', scoringStrategy);

    if (scoringStrategy === "partial" && subQuestionId) {
      console.log('📝 PARTIAL SCORING MODE:');
      console.log('├─ Looking for sub-question:', subQuestionId);
      
      // Partial scoring - score individual sub-question
      const subQuestion = question.subQuestions?.find(
        (sq) => sq.subId === subQuestionId,
      );

      console.log('├─ Found sub-question:', subQuestion ? 'Yes' : 'No');
      if (subQuestion) {
        console.log('├─ Sub-question points:', subQuestion.points);
        console.log('├─ Acceptable answers:', subQuestion.acceptableAnswers);
      }

      if (!subQuestion) {
        console.log('❌ Sub-question not found - returning error result');
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

      console.log('├─ Raw user answer:', userAnswer, '(type:', typeof userAnswer, ')');

      const normalizedAnswer = userAnswer?.toString().trim().toLowerCase().replace(/\s+/g, " ") || "";
      console.log('├─ Normalized user answer:', `"${normalizedAnswer}"`);
      
      const isCorrect =
        subQuestion.acceptableAnswers?.some(
          (acceptableAnswer: string) => {
            const normalizedAcceptable = acceptableAnswer.trim().toLowerCase().replace(/\s+/g, " ");
            console.log('├─ Comparing with acceptable answer:', `"${normalizedAcceptable}"`);
            return normalizedAcceptable === normalizedAnswer;
          }
        ) || false;

      console.log('├─ Answer is correct:', isCorrect);
      const result = {
        isCorrect,
        score: isCorrect ? subQuestion.points : 0,
        maxScore: subQuestion.points,
        feedback: isCorrect
          ? "Correct!"
          : `Incorrect. Acceptable answers: ${subQuestion.acceptableAnswers?.join(", ") || "None"}`,
      };
      console.log('├─ Partial scoring result:', result);
      console.log('└─ End partial scoring\n');

      return result;
    } else {
      console.log('📋 ALL-OR-NOTHING SCORING MODE:');
      
      // All-or-nothing scoring - score entire question
      const totalSubQuestions = question.subQuestions?.length || 0;
      const answers = answer as Record<string, string>;
      
      console.log('├─ Total sub-questions:', totalSubQuestions);
      console.log('├─ User answers object:', answers);

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
            
            console.log(`├─ Checking answer for ${key}: "${normalizedValue}" (original type: ${typeof value})`);
            console.log(`├─ Against acceptable answers:`, sq.acceptableAnswers);
            
            const isAcceptable = sq.acceptableAnswers?.some((acceptableAnswer: string) => {
              const normalizedAcceptableAnswer = acceptableAnswer
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ");
              console.log(`  ├─ Comparing with: "${normalizedAcceptableAnswer}"`);
              return normalizedAcceptableAnswer === normalizedValue;
            });
            
            console.log(`  └─ Is acceptable: ${isAcceptable}`);
            return isAcceptable;
          });
          
          return foundSubQuestion;
        },
      ).length;

      console.log('├─ Correct answers count:', correctCount);
      const isCorrect = correctCount === totalSubQuestions;
      console.log('├─ All answers correct:', isCorrect);

      const result = {
        isCorrect,
        score: isCorrect ? question.points : 0,
        maxScore: question.points,
        feedback: isCorrect
          ? "All answers correct!"
          : `${correctCount}/${totalSubQuestions} answers correct`,
      };
      
      console.log('├─ All-or-nothing result:', result);
      console.log('└─ End all-or-nothing scoring\n');

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

    if (question.blanks <= 0) {
      errors.push("Number of blanks must be greater than 0");
    }

    if (
      question.subQuestions &&
      question.blanks !== question.subQuestions.length
    ) {
      warnings.push("Number of blanks doesn't match number of sub-questions");
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
