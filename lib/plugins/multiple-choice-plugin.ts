import React from "react";
import { v4 as uuidv4 } from "uuid";
import type { MultipleChoiceQuestion } from "../types";
import type { StandardMultipleChoiceQuestion, StandardQuestionOption } from "../standardized-types";
import { BaseQuestionPlugin, ValidationResult, QuestionRendererProps, QuestionEditorProps, ScoringContext, ScoringResult } from "../question-plugin-system";

// Import the existing components
import MultipleChoiceQuestionComponent from "../../components/test-player/question-types/multiple-choice-question";
import MultipleChoiceEditor from "../../components/creator/question-editors/multiple-choice-editor";

export class MultipleChoicePlugin extends BaseQuestionPlugin<MultipleChoiceQuestion> {
  config = {
    type: "multiple-choice" as const,
    displayName: "Multiple Choice",
    description: "Choose one correct option from multiple choices",
    icon: "●",
    category: ["reading" as const, "listening" as const],
    supportsPartialScoring: false,
    supportsAIScoring: false,
    defaultPoints: 1
  };

  createRenderer(): React.ComponentType<QuestionRendererProps<MultipleChoiceQuestion>> {
    return MultipleChoiceQuestionComponent as unknown as React.ComponentType<QuestionRendererProps<MultipleChoiceQuestion>>;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<MultipleChoiceQuestion>> {
    return MultipleChoiceEditor as unknown as React.ComponentType<QuestionEditorProps<MultipleChoiceQuestion>>;
  }

  createDefault(index: number): MultipleChoiceQuestion {
    return {
      id: uuidv4(),
      type: "multiple-choice",
      text: "",
      points: this.config.defaultPoints,
      scoringStrategy: "all-or-nothing",
      index: index,
      partialEndingIndex: index,
      options: [
        {
          id: uuidv4(),
          text: "Option A",
          isCorrect: true,
        },
        {
          id: uuidv4(),
          text: "Option B",
          isCorrect: false,
        },
        {
          id: uuidv4(),
          text: "Option C",
          isCorrect: false,
        },
        {
          id: uuidv4(),
          text: "Option D",
          isCorrect: false,
        },
      ],
    };
  }

  transform(question: MultipleChoiceQuestion): StandardMultipleChoiceQuestion {
    const standardItems: StandardQuestionOption[] = question.options.map(
      (opt) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
      }),
    );

    const correctOption = standardItems.find((opt) => opt.isCorrect);
    const subQuestion = {
      subId: question.id,
      points: question.points,
      item: question.id,
      questionText: question.text,
      answerText: correctOption?.text,
      correctAnswer: correctOption?.id,
    };

    return {
      ...question,
      scoringStrategy: "partial",
      items: standardItems,
      subQuestions: [subQuestion],
    } as StandardMultipleChoiceQuestion;
  }

  score(context: ScoringContext): ScoringResult {
    const question = context.question as MultipleChoiceQuestion;
    const answer = context.answer as string;
    
    // Find the selected option and correct option
    const selectedOption = question.options.find(option => option.id === answer);
    const correctOption = question.options.find(option => option.isCorrect);
    const isCorrect = selectedOption?.isCorrect || false;
    const score = isCorrect ? question.points : 0;

    // Generate feedback that includes both selected and correct answers
    let feedback = "";
    if (isCorrect) {
      feedback = `Correct! You selected: ${selectedOption?.text || "Unknown"}`;
    } else {
      const selectedText = selectedOption?.text || "None selected";
      const correctText = correctOption?.text || "Unknown";
      feedback = `Incorrect. You selected: ${selectedText}. The correct answer was: ${correctText}`;
    }

    return {
      isCorrect,
      score,
      maxScore: question.points,
      feedback,
      // Add metadata about the user's choice and correct answer
      metadata: {
        selectedAnswer: {
          id: selectedOption?.id,
          text: selectedOption?.text
        },
        correctAnswer: {
          id: correctOption?.id,
          text: correctOption?.text
        }
      }
    };
  }

  validate(question: MultipleChoiceQuestion): ValidationResult {
    const baseValidation = super.validate(question);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Multiple choice specific validation
    if (!question.options || question.options.length < 2) {
      errors.push("Multiple choice questions must have at least 2 options");
    }

    const correctOptions = question.options?.filter(option => option.isCorrect) || [];
    if (correctOptions.length === 0) {
      errors.push("Multiple choice questions must have at least one correct option");
    }

    if (correctOptions.length > 1) {
      warnings.push("Multiple choice questions typically have only one correct option");
    }

    // Check for empty option texts
    const emptyOptions = question.options?.filter(option => !option.text?.trim()) || [];
    if (emptyOptions.length > 0) {
      errors.push("All options must have text");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
