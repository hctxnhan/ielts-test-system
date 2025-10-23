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
    const answer = context.answer as Record<string, string> | null;
    const subQuestionId = context.subQuestionId;
    
    const scoringStrategy = question.scoringStrategy || "partial";
    const totalSubQuestions = question.subQuestions?.length || 0;

    if (scoringStrategy === "partial" && subQuestionId) {
      // For partial scoring with subQuestionId, score individual subquestion
      const subQuestion = question.subQuestions?.find(sq => sq.subId === subQuestionId);
      if (!subQuestion) {
        return {
          isCorrect: false,
          score: 0,
          maxScore: 1,
          feedback: "Subquestion not found"
        };
      }
      
      const points = subQuestion.points !== undefined ? subQuestion.points : 1;
      const answerValue = answer ? (typeof answer === 'string' ? answer : answer[subQuestionId]) : null;
      
      // The answer is one of the correct choices for this question
      const correctItems = question.subQuestions?.map(sq => sq.item) || [];
      const isCorrect = answerValue !== null && correctItems.includes(answerValue);
      
      return {
        isCorrect,
        score: isCorrect ? points : 0,
        maxScore: points,
        feedback: isCorrect ? "Correct!" : "Incorrect"
      };
    } else {
      // All-or-nothing scoring: must select all correct answers and only correct answers
      const selectedItems = answer ? Object.values(answer) : [];
      const correctItems = question.subQuestions?.map(sq => sq.item) || [];
      
      // Check if the selected items match exactly with correct items (ignoring order)
      const selectedSet = new Set(selectedItems);
      const correctSet = new Set(correctItems);
      
      // Check if sets are equal
      const setsEqual = 
        selectedSet.size === correctSet.size &&
        Array.from(selectedSet).every(item => correctSet.has(item));
      
      const isCorrect = setsEqual && selectedItems.length === totalSubQuestions && totalSubQuestions > 0;
      
      return {
        isCorrect,
        score: isCorrect ? question.points : 0,
        maxScore: question.points,
        feedback: isCorrect 
          ? "All selections correct!" 
          : `Selected ${selectedItems.length}, need exactly ${totalSubQuestions} correct selections`
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
