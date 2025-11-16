import React from "react";
import { v4 as uuidv4 } from "uuid";
import type { LabelingQuestion } from "../types";
import type { StandardLabelingQuestion, StandardQuestionItem, StandardSubQuestionMeta, StandardQuestionOption } from "../standardized-types";
import { BaseQuestionPlugin, ValidationResult, QuestionRendererProps, QuestionEditorProps, ScoringContext, ScoringResult } from "../question-plugin-system";

// Import the existing components
import LabelingQuestionComponent from "../../components/test-player/question-types/labeling-question";
import LabelingEditor from "../../components/creator/question-editors/labeling-editor";

export class LabelingPlugin extends BaseQuestionPlugin<LabelingQuestion> {
  config = {
    type: "labeling" as const,
    displayName: "Labeling",
    description: "Label parts of a diagram or image",
    icon: "🏷️",
    category: ["reading" as const, "listening" as const],
    supportsPartialScoring: true,
    supportsAIScoring: false,
    defaultPoints: 1,
    hasSubQuestions: true,
  };

  createRenderer(): React.ComponentType<QuestionRendererProps<LabelingQuestion>> {
    return LabelingQuestionComponent as unknown as React.ComponentType<QuestionRendererProps<LabelingQuestion>>;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<LabelingQuestion>> {
    return LabelingEditor as unknown as React.ComponentType<QuestionEditorProps<LabelingQuestion>>;
  }

  createDefault(index: number): LabelingQuestion {
    return {
      id: uuidv4(),
      type: "labeling",
      text: "",
      points: this.config.defaultPoints,
      scoringStrategy: "partial",
      index: index,
      partialEndingIndex: index,
      imageUrl: "",
      labels: [
        {
          id: uuidv4(),
          text: "Label 1",
        },
        {
          id: uuidv4(),
          text: "Label 2",
        },
        {
          id: uuidv4(),
          text: "Label 3",
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
        {
          id: uuidv4(),
          text: "Option D",
        },
        {
          id: uuidv4(),
          text: "Option E",
        },
      ],
      subQuestions: [],
    };
  }

  transform(question: LabelingQuestion): StandardLabelingQuestion {
    const standardItems: StandardQuestionItem[] = question.labels.map(
      (label) => ({
        id: label.id,
        text: label.text,
      }),
    );

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
        explanation: sub.explanation || ''
      }));

    return {
      ...question,
      items: standardItems,
      options: standardOptions,
      subQuestions: standardSubQuestions,
    } as StandardLabelingQuestion;
  }

  score(context: ScoringContext): ScoringResult {
    const question = context.question as LabelingQuestion;
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

      // Use subQuestion.points if defined, otherwise default to 1
      const points = subQuestion.points !== undefined ? subQuestion.points : 1;

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

      const isCorrect = subQuestion.correctAnswer === actualAnswer;
      
      return {
        isCorrect,
        score: isCorrect ? points : 0,
        maxScore: points,
        feedback: isCorrect 
          ? "Correct label!" 
          : "Incorrect label"
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
          ? "All labels correct!" 
          : `${correctCount}/${totalSubQuestions} labels correct`
      };
    }
  }

  validate(question: LabelingQuestion): ValidationResult {
    const baseValidation = super.validate(question);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Labeling specific validation
    if (!question.labels || question.labels.length === 0) {
      errors.push("Labeling questions must have at least one label");
    }

    if (!question.options || question.options.length === 0) {
      errors.push("Labeling questions must have at least one option");
    }

    if (!question.subQuestions || question.subQuestions.length === 0) {
      errors.push("Labeling questions must have at least one sub-question");
    }

    // Check for empty label texts
    const emptyLabels = question.labels?.filter(label => !label.text?.trim()) || [];
    if (emptyLabels.length > 0) {
      errors.push("All labels must have text");
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

    // Check for missing image URL
    if (!question.imageUrl?.trim()) {
      warnings.push("Consider adding an image URL for the labeling diagram");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
