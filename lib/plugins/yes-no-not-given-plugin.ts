import React from "react";
import { v4 as uuidv4 } from "uuid";
import type { TrueFalseNotGivenQuestion, YesNoNotGivenQuestion } from "../types";
import type { StandardTrueFalseNotGivenQuestion, StandardSubQuestionMeta, StandardQuestionItem, StandardYesNoNotGivenQuestion } from "../standardized-types";
import { BaseQuestionPlugin, ValidationResult, QuestionRendererProps, QuestionEditorProps, ScoringContext, ScoringResult } from "../question-plugin-system";

// Import the existing components
import YesNoNotGivenQuestionComponent from "../../components/test-player/question-types/yes-no-not-given-question";
import TrueFalseNotGivenEditor from "../../components/creator/question-editors/true-false-not-given-editor";

export class YesNoNotGivenPlugin extends BaseQuestionPlugin<YesNoNotGivenQuestion> {
  config = {
    type: "yes-no-not-given" as const,
    displayName: "Yes / No / Not Given",
    description: "Determine if statements are yes, no, or not given based on the passage",
    icon: "❓",
    category: ["reading" as const],
    supportsPartialScoring: true,
    supportsAIScoring: false,
    defaultPoints: 1,
    hasSubQuestions: true,
  };

  createRenderer(): React.ComponentType<QuestionRendererProps<YesNoNotGivenQuestion>> {
    return YesNoNotGivenQuestionComponent as unknown as React.ComponentType<QuestionRendererProps<YesNoNotGivenQuestion>>;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<YesNoNotGivenQuestion>> {
    return TrueFalseNotGivenEditor as unknown as React.ComponentType<QuestionEditorProps<YesNoNotGivenQuestion>>;
  }

  createDefault(index: number): YesNoNotGivenQuestion {
    const statementIds = [uuidv4(), uuidv4(), uuidv4()];
    
    return {
      id: uuidv4(),
      type: "yes-no-not-given",
      text: "",
      points: this.config.defaultPoints,
      scoringStrategy: "partial",
      index: index,
      partialEndingIndex: index,
      statements: [
        {
          id: statementIds[0],
          text: "Statement 1",
        },
        {
          id: statementIds[1],
          text: "Statement 2",
        },
        {
          id: statementIds[2],
          text: "Statement 3",
        },
      ],
      subQuestions: [
        {
          subId: uuidv4(),
          item: statementIds[0],
          correctAnswer: "yes",
          points: 1,
        },
        {
          subId: uuidv4(),
          item: statementIds[1],
          correctAnswer: "no",
          points: 1,
        },
        {
          subId: uuidv4(),
          item: statementIds[2],
          correctAnswer: "not-given",
          points: 1,
        },
      ],
    };
  }

  transform(question: YesNoNotGivenQuestion): StandardYesNoNotGivenQuestion {
    const standardItems: StandardQuestionItem[] = question.statements.map((stmt) => ({
      id: stmt.id,
      text: stmt.text,
    }));

    const standardSubQuestions: StandardSubQuestionMeta[] = question.subQuestions.map((subQ, index) => ({
      subId: subQ.subId,
      item: subQ.item,
      points: subQ.points,
      correctAnswer: subQ.correctAnswer,
      questionText: standardItems.find((item) => item.id === subQ.item)?.text,
      answerText: String(subQ.correctAnswer),
      subIndex: index,
    }));

    return {
      ...question,
      items: standardItems,
      subQuestions: standardSubQuestions,
    };
  }

  score(context: ScoringContext): ScoringResult {
    const question = context.question as YesNoNotGivenQuestion;
    const answer = context.answer;
    const subQuestionId = context.subQuestionId;
    
    const scoringStrategy = question.scoringStrategy || "partial";

    // Helper function to normalize answers for comparison
    const normalizeAnswer = (value: unknown): string => {
      if (!value) return "";
      const stringValue = (value || "").toString().trim().toLowerCase();
      
      // Normalize common variations to standard format
      if (stringValue === "yes" || stringValue === "t") return "yes";
      if (stringValue === "no" || stringValue === "f") return "no";
      if (stringValue === "not-given" || stringValue === "not_given" || stringValue === "ng" || stringValue === "n") return "not-given";
      
      return stringValue;
    };

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

      // Extract the actual answer value
      // If answer is an object, get the value for this subQuestionId
      // If answer is a string, use it directly
      let actualAnswer: unknown;
      if (typeof answer === 'object' && answer !== null) {
        const answerObj = answer as Record<string, unknown>;
        actualAnswer = answerObj[subQuestionId];
      } else {
        actualAnswer = answer;
      }

      const normalizedUserAnswer = normalizeAnswer(actualAnswer);
      const normalizedCorrectAnswer = normalizeAnswer(subQuestion.correctAnswer);
      const isCorrect = normalizedCorrectAnswer === normalizedUserAnswer;
      
      
      return {
        isCorrect,
        score: isCorrect ? subQuestion.points : 0,
        maxScore: subQuestion.points,
        feedback: isCorrect 
          ? "Correct!" 
          : `Incorrect. The correct answer was: ${subQuestion.correctAnswer}`
      };
    } else {
      // All-or-nothing scoring - score entire question
      const totalSubQuestions = question.subQuestions?.length || 0;
      const answers = answer as Record<string, string>;
      
      const correctCount = Object.entries(answers || {}).filter(([key, value]) => {
        const subQuestion = question.subQuestions?.find(sq => sq.subId === key);
        if (!subQuestion) return false;
        
        const normalizedUserAnswer = normalizeAnswer(value);
        const normalizedCorrectAnswer = normalizeAnswer(subQuestion.correctAnswer);
        return normalizedCorrectAnswer === normalizedUserAnswer;
      }).length;

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

  validate(question: YesNoNotGivenQuestion): ValidationResult {
    const baseValidation = super.validate(question);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // True/False/Not Given specific validation
    if (!question.statements || question.statements.length === 0) {
      errors.push("Yes/No/Not Given questions must have at least one statement");
    }

    if (!question.subQuestions || question.subQuestions.length === 0) {
      errors.push("Yes/No/Not Given questions must have at least one sub-question");
    }

    // Check for empty statement texts
    const emptyStatements = question.statements?.filter(statement => !statement.text?.trim()) || [];
    if (emptyStatements.length > 0) {
      errors.push("All statements must have text");
    }

    // Check for sub-questions without correct answers
    const invalidSubQuestions = question.subQuestions?.filter(subQ => 
      !subQ.correctAnswer?.trim()
    ) || [];
    if (invalidSubQuestions.length > 0) {
      errors.push("All sub-questions must have correct answers");
    }

    // Check for valid answer values (lowercase only)
    const validAnswers = ["yes", "no", "not-given"];
    const invalidAnswers = question.subQuestions?.filter(subQ => 
      subQ.correctAnswer && !validAnswers.includes(subQ.correctAnswer?.toLowerCase())
    ) || [];
    if (invalidAnswers.length > 0) {
      errors.push("All correct answers must be 'yes', 'no', or 'not-given' (lowercase)");
    }

    // Check if statement count matches sub-question count
    if (question.statements && question.subQuestions && 
        question.statements.length !== question.subQuestions.length) {
      warnings.push("Number of statements should match number of sub-questions");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
