import React from "react";
import { v4 as uuidv4 } from "uuid";
import type { MatchingQuestion } from "../types";
import type { StandardMatchingQuestion, StandardQuestionItem, StandardQuestionOption, StandardSubQuestionMeta } from "../standardized-types";
import { BaseQuestionPlugin, ValidationResult, QuestionRendererProps, QuestionEditorProps, ScoringContext, ScoringResult } from "../question-plugin-system";

// Import the existing components
import MatchingQuestionComponent from "../../components/test-player/question-types/matching-question";
import MatchingEditor from "../../components/creator/question-editors/matching-editor";

export class MatchingPlugin extends BaseQuestionPlugin<MatchingQuestion> {
  config = {
    type: "matching" as const,
    displayName: "Matching",
    description: "Match items with corresponding options",
    icon: "⇄",
    category: ["reading" as const, "listening" as const, "grammar" as const],
    supportsPartialScoring: true,
    supportsAIScoring: false,
    defaultPoints: 1,
    hasSubQuestions: true,
  };

  createRenderer(): React.ComponentType<QuestionRendererProps<MatchingQuestion>> {
    return MatchingQuestionComponent as unknown as React.ComponentType<QuestionRendererProps<MatchingQuestion>>;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<MatchingQuestion>> {
    return MatchingEditor as unknown as React.ComponentType<QuestionEditorProps<MatchingQuestion>>;
  }

  createDefault(index: number): MatchingQuestion {
    return {
      id: uuidv4(),
      type: "matching",
      text: "",
      points: this.config.defaultPoints,
      scoringStrategy: "partial",
      index: index,
      partialEndingIndex: index,
      items: [
        {
          id: uuidv4(),
          text: "Item 1",
        },
        {
          id: uuidv4(),
          text: "Item 2",
        },
        {
          id: uuidv4(),
          text: "Item 3",
        },
      ],
      options: [
        {
          id: uuidv4(),
          text: "Option A",
        },
        {
          id: uuidv4(),
          text: "Option B",
        },
        {
          id: uuidv4(),
          text: "Option C",
        },
      ],
      subQuestions: [],
    };
  }

  transform(question: MatchingQuestion): StandardMatchingQuestion {
    const standardItems: StandardQuestionItem[] = question.items.map((item) => ({
      id: item.id,
      text: item.text,
    }));

    const standardOptions: StandardQuestionOption[] = question.options.map(
      (opt) => ({
        id: opt.id,
        text: opt.text,
      }),
    );

    const standardSubQuestions: StandardSubQuestionMeta[] =
      question.subQuestions.map((sub) => ({
        subId: sub.subId,
        item: sub.item,
        points: sub.points,
        correctAnswer: sub.correctAnswer,
        questionText: standardItems.find((item) => item.id === sub.item)?.text,
        answerText: standardOptions.find((opt) => opt.id === sub.correctAnswer)
          ?.text,
      }));

    return {
      ...question,
      items: standardItems,
      options: standardOptions,
      subQuestions: standardSubQuestions,
    } as StandardMatchingQuestion;
  }

  score(context: ScoringContext): ScoringResult {
    const question = context.question as MatchingQuestion;
    const answer = context.answer;
    const subQuestionId = context.subQuestionId;
    
    const scoringStrategy = question.scoringStrategy || "partial";

    if (scoringStrategy === "partial" && subQuestionId) {
      // Partial scoring - score individual sub-question using its own points
      const subQuestion = question.subQuestions?.find(sq => sq.subId === subQuestionId);
      
      if (!subQuestion) {
        return {
          isCorrect: false,
          score: 0,
          maxScore: 0,
          feedback: "Sub-question not found"
        };
      }

      // Extract the actual answer value
      // If answer is an object, get the value for this subQuestionId
      // If answer is a string, use it directly
      let actualAnswer: string;
      if (typeof answer === 'object' && answer !== null) {
        const answerObj = answer as Record<string, string>;
        actualAnswer = answerObj[subQuestionId] || '';
      } else {
        actualAnswer = answer as string;
      }

      // Use subQuestion.points if defined, otherwise default to 1
      const points = subQuestion.points !== undefined ? subQuestion.points : 1;

      const isCorrect = subQuestion.correctAnswer === actualAnswer;
      
      return {
        isCorrect,
        score: isCorrect ? points : 0,
        maxScore: points,
        feedback: isCorrect 
          ? "Correct match!" 
          : `Incorrect match. Expected: ${subQuestion.correctAnswer}, Got: ${actualAnswer}`
      };
    } else {
      // All-or-nothing scoring - use main question points
      const totalSubQuestions = question.subQuestions?.length || 0;
      const answers = answer as Record<string, string>;
      
      const correctCount = Object.entries(answers || {}).filter(([key, value]) =>
        question.subQuestions?.some(sq => 
          sq.subId === key && sq.correctAnswer === value
        )
      ).length;

      const isCorrect = correctCount === totalSubQuestions && totalSubQuestions > 0;
      
      return {
        isCorrect,
        score: isCorrect ? question.points : 0,
        maxScore: question.points,
        feedback: isCorrect 
          ? "All matches correct!" 
          : `${correctCount}/${totalSubQuestions} matches correct`
      };
    }
  }

  validate(question: MatchingQuestion): ValidationResult {
    const baseValidation = super.validate(question);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Matching specific validation
    if (!question.items || question.items.length < 2) {
      errors.push("Matching questions must have at least 2 items");
    }

    if (!question.options || question.options.length < 2) {
      errors.push("Matching questions must have at least 2 options");
    }

    if (!question.subQuestions || question.subQuestions.length === 0) {
      errors.push("Matching questions must have at least one sub-question");
    }

    // Check for empty item texts
    const emptyItems = question.items?.filter(item => !item.text?.trim()) || [];
    if (emptyItems.length > 0) {
      errors.push("All items must have text");
    }

    // Check for empty option texts
    const emptyOptions = question.options?.filter(option => !option.text?.trim()) || [];
    if (emptyOptions.length > 0) {
      errors.push("All options must have text");
    }

    // Check for sub-questions without correct answers
    const invalidSubQuestions = question.subQuestions?.filter(subQ => 
      !subQ.correctAnswer?.trim()
    ) || [];
    if (invalidSubQuestions.length > 0) {
      errors.push("All sub-questions must have correct answers");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
