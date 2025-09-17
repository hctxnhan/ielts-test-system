import React from "react";
import { v4 as uuidv4 } from "uuid";
import type { PickFromAListQuestion } from "../types";
import type { StandardPickFromListQuestion, StandardQuestionItem, StandardSubQuestionMeta } from "../standardized-types";
import { BaseQuestionPlugin, ValidationResult, QuestionRendererProps, QuestionEditorProps, ScoringContext, ScoringResult } from "../question-plugin-system";

// Import the existing components
import PickFromListQuestionComponent from "../../components/test-player/question-types/pick-from-list-question";
import PickFromListEditor from "../../components/creator/question-editors/pick-from-list-editor";

export class PickFromListPlugin extends BaseQuestionPlugin<PickFromAListQuestion> {
  config = {
    type: "pick-from-a-list" as const,
    displayName: "Pick from a List",
    description: "Select multiple options from a provided list",
    icon: "☑",
    category: ["reading" as const, "listening" as const],
    supportsPartialScoring: true,
    supportsAIScoring: false,
    defaultPoints: 1,
    hasSubQuestions: true,
  };

  createRenderer(): React.ComponentType<QuestionRendererProps<PickFromAListQuestion>> {
    return PickFromListQuestionComponent as unknown as React.ComponentType<QuestionRendererProps<PickFromAListQuestion>>;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<PickFromAListQuestion>> {
    return PickFromListEditor as unknown as React.ComponentType<QuestionEditorProps<PickFromAListQuestion>>;
  }

  createDefault(index: number): PickFromAListQuestion {
    return {
      id: uuidv4(),
      type: "pick-from-a-list",
      text: "",
      points: this.config.defaultPoints,
      scoringStrategy: "partial",
      index: index,
      partialEndingIndex: index,
      items: [
        {
          id: uuidv4(),
          text: "Option 1",
        },
        {
          id: uuidv4(),
          text: "Option 2",
        },
        {
          id: uuidv4(),
          text: "Option 3",
        },
        {
          id: uuidv4(),
          text: "Option 4",
        },
        {
          id: uuidv4(),
          text: "Option 5",
        },
      ],
      subQuestions: [
        {
          subId: uuidv4(),
          correctAnswer: "",
          points: this.config.defaultPoints / 3,
        },
        {
          subId: uuidv4(),
          correctAnswer: "",
          points: this.config.defaultPoints / 3,
        },
        {
          subId: uuidv4(),
          correctAnswer: "",
          points: this.config.defaultPoints / 3,
        },
      ],
    };
  }

  transform(question: PickFromAListQuestion): StandardPickFromListQuestion {
    const standardItems: StandardQuestionItem[] = question.items.map((item) => ({
      id: item.id,
      text: item.text,
    }));

    const standardSubQuestions: StandardSubQuestionMeta[] = [];

    if (question.subQuestions && question.subQuestions.length > 0) {
      for (const sub of question.subQuestions) {
        const itemId = sub.item || "";
        const itemData = standardItems.find((item) => item.id === itemId);

        standardSubQuestions.push({
          subId: sub.subId,
          item: itemId,
          points: sub.points,
          correctAnswer: "true",
          questionText: itemData?.text || "",
          answerText: itemData?.text || "",
        });
      }
    }

    return {
      ...question,
      items: standardItems,
      subQuestions: standardSubQuestions,
    } as StandardPickFromListQuestion;
  }

  score(context: ScoringContext): ScoringResult {
    const question = context.question as PickFromAListQuestion;
    const answer = context.answer;
    
    const scoringStrategy = question.scoringStrategy || "partial";

    if (scoringStrategy === "partial") {
      // For partial scoring, check if the current answer (item) is correct
      // The answer parameter here is the item ID being selected
      const isCorrect = question.subQuestions?.some(sq => sq.item === answer) || false;
      
      return {
        isCorrect,
        score: isCorrect ? question.points : 0,
        maxScore: question.points,
        feedback: isCorrect 
          ? "Correct selection!" 
          : "Incorrect selection"
      };
    } else {
      // All-or-nothing scoring
      const totalSubQuestions = question.subQuestions?.length || 0;
      const answers = answer as Record<string, string>;
      const totalAnswers = Object.entries(answers || {})?.length || 0;

      if (totalAnswers !== totalSubQuestions) {
        return {
          isCorrect: false,
          score: 0,
          maxScore: question.points,
          feedback: `Need exactly ${totalSubQuestions} selections, got ${totalAnswers}`
        };
      }

      // Get all selected items (values from the answer object)
      const selectedItems = Object.values(answers || {});

      // Get all correct items from subQuestions
      const correctItems = question.subQuestions?.map(sq => sq.item) || [];

      // Check if all selected items are correct (regardless of order)
      const allItemsCorrect = selectedItems.every(item => correctItems.includes(item));

      // Check if we have the right number of correct items
      const correctCount = selectedItems.filter(item => correctItems.includes(item)).length;
      const isCorrect = allItemsCorrect && correctCount === totalSubQuestions;
      
      return {
        isCorrect,
        score: isCorrect ? question.points : 0,
        maxScore: question.points,
        feedback: isCorrect 
          ? "All selections correct!" 
          : `${correctCount}/${totalSubQuestions} selections correct`
      };
    }
  }

  validate(question: PickFromAListQuestion): ValidationResult {
    const baseValidation = super.validate(question);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Pick from list specific validation
    if (!question.items || question.items.length < 3) {
      errors.push("Pick from list questions must have at least 3 options");
    }

    if (!question.subQuestions || question.subQuestions.length === 0) {
      errors.push("Pick from list questions must have at least one sub-question");
    }

    // Check for empty item texts
    const emptyItems = question.items?.filter(item => !item.text?.trim()) || [];
    if (emptyItems.length > 0) {
      errors.push("All list items must have text");
    }

    // Check for sub-questions without correct answers
    const invalidSubQuestions = question.subQuestions?.filter(subQ => 
      !subQ.correctAnswer?.trim()
    ) || [];
    if (invalidSubQuestions.length > 0) {
      errors.push("All sub-questions must have correct answers");
    }

    // Check if more sub-questions than items
    if (question.subQuestions && question.items && 
        question.subQuestions.length > question.items.length) {
      warnings.push("More sub-questions than available items");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
