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
      subQuestions: [],
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
    
    // Get all correct item IDs from subQuestions
    const correctItems = question.subQuestions?.map(sq => sq.item) || [];
    const totalCorrectAnswers = correctItems.length;

    if (scoringStrategy === "partial") {
      // For partial scoring, each correct selection counts as points
      // If we select N correct answers out of M total correct answers,
      // we get (N / M) * totalPoints
      
      // Handle both single answer and multiple answers
      let selectedItems: string[] = [];
      
      if (typeof answer === "string") {
        // Single answer (item ID)
        selectedItems = [answer];
      } else if (Array.isArray(answer)) {
        // Array of answers
        selectedItems = answer;
      } else if (typeof answer === "object" && answer !== null) {
        // Object with answers (e.g., { "0": itemId1, "1": itemId2 })
        selectedItems = Object.values(answer as Record<string, string>);
      }
      
      // Count how many selected items are correct
      const correctSelectionsCount = selectedItems.filter(item => 
        correctItems.includes(item)
      ).length;
      
      // Calculate score based on ratio of correct selections
      const score = totalCorrectAnswers > 0 
        ? (correctSelectionsCount / totalCorrectAnswers) * question.points
        : 0;
      
      const isCorrect = correctSelectionsCount === totalCorrectAnswers && correctSelectionsCount > 0;
      
      return {
        isCorrect,
        score,
        maxScore: question.points,
        feedback: isCorrect 
          ? "All selections correct!" 
          : `${correctSelectionsCount}/${totalCorrectAnswers} selections correct`
      };
    } else {
      // All-or-nothing scoring
      // Must select ALL correct answers and NO incorrect answers
      
      let selectedItems: string[] = [];
      
      if (typeof answer === "string") {
        // Single answer (item ID)
        selectedItems = [answer];
      } else if (Array.isArray(answer)) {
        // Array of answers
        selectedItems = answer;
      } else if (typeof answer === "object" && answer !== null) {
        // Object with answers (e.g., { "0": itemId1, "1": itemId2 })
        selectedItems = Object.values(answer as Record<string, string>);
      }

      // Check if selected items match exactly the correct items
      const selectedItemsSet = new Set(selectedItems);
      const correctItemsSet = new Set(correctItems);

      // All correct items must be selected, and no extra items should be selected
      const allCorrectSelected = correctItems.every(item => selectedItemsSet.has(item));
      const noExtraSelected = selectedItems.every(item => correctItemsSet.has(item));
      const isCorrect = allCorrectSelected && noExtraSelected && totalCorrectAnswers > 0;

      return {
        isCorrect,
        score: isCorrect ? question.points : 0,
        maxScore: question.points,
        feedback: isCorrect 
          ? "All selections correct!" 
          : `Selected ${selectedItems.length} items, but ${totalCorrectAnswers} are required`
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
      errors.push("Pick from list questions must have at least one correct answer marked");
    }

    // Check for empty item texts
    const emptyItems = question.items?.filter(item => !item.text?.trim()) || [];
    if (emptyItems.length > 0) {
      errors.push("All list items must have text");
    }

    // Check if more sub-questions than items
    if (question.subQuestions && question.items && 
        question.subQuestions.length > question.items.length) {
      warnings.push("More correct answers than available items");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
