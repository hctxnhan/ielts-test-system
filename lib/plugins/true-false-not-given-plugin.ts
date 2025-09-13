import React from "react";
import { v4 as uuidv4 } from "uuid";
import type { TrueFalseNotGivenQuestion } from "../types";
import type { StandardTrueFalseNotGivenQuestion, StandardSubQuestionMeta, StandardQuestionItem } from "../standardized-types";
import { BaseQuestionPlugin, ValidationResult, QuestionRendererProps, QuestionEditorProps, ScoringContext, ScoringResult } from "../question-plugin-system";

// Import the existing components
import TrueFalseNotGivenQuestionComponent from "../../components/test-player/question-types/true-false-not-given-question";
import TrueFalseNotGivenEditor from "../../components/creator/question-editors/true-false-not-given-editor";

export class TrueFalseNotGivenPlugin extends BaseQuestionPlugin<TrueFalseNotGivenQuestion> {
  config = {
    type: "true-false-not-given" as const,
    displayName: "True / False / Not Given",
    description: "Determine if statements are true, false, or not given based on the passage",
    icon: "❓",
    category: ["reading" as const],
    supportsPartialScoring: true,
    supportsAIScoring: false,
    defaultPoints: 1
  };

  createRenderer(): React.ComponentType<QuestionRendererProps<TrueFalseNotGivenQuestion>> {
    return TrueFalseNotGivenQuestionComponent as unknown as React.ComponentType<QuestionRendererProps<TrueFalseNotGivenQuestion>>;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<TrueFalseNotGivenQuestion>> {
    return TrueFalseNotGivenEditor as unknown as React.ComponentType<QuestionEditorProps<TrueFalseNotGivenQuestion>>;
  }

  createDefault(index: number): TrueFalseNotGivenQuestion {
    const statementIds = [uuidv4(), uuidv4(), uuidv4()];
    
    return {
      id: uuidv4(),
      type: "true-false-not-given",
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
          correctAnswer: "TRUE",
          points: this.config.defaultPoints / 3,
        },
        {
          subId: uuidv4(),
          item: statementIds[1],
          correctAnswer: "FALSE",
          points: this.config.defaultPoints / 3,
        },
        {
          subId: uuidv4(),
          item: statementIds[2],
          correctAnswer: "NOT_GIVEN",
          points: this.config.defaultPoints / 3,
        },
      ],
    };
  }

  transform(question: TrueFalseNotGivenQuestion): StandardTrueFalseNotGivenQuestion {
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
      scoringStrategy: "partial",
    };
  }

  score(context: ScoringContext): ScoringResult {
    const question = context.question as TrueFalseNotGivenQuestion;
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

      const isCorrect = subQuestion.correctAnswer === answer;
      
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
      
      const correctCount = Object.entries(answers || {}).filter(([key, value]) =>
        question.subQuestions?.some(sq => 
          sq.subId === key && sq.correctAnswer === value
        )
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

  validate(question: TrueFalseNotGivenQuestion): ValidationResult {
    const baseValidation = super.validate(question);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // True/False/Not Given specific validation
    if (!question.statements || question.statements.length === 0) {
      errors.push("True/False/Not Given questions must have at least one statement");
    }

    if (!question.subQuestions || question.subQuestions.length === 0) {
      errors.push("True/False/Not Given questions must have at least one sub-question");
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

    // Check for valid answer values
    const validAnswers = ["TRUE", "FALSE", "NOT_GIVEN"];
    const invalidAnswers = question.subQuestions?.filter(subQ => 
      subQ.correctAnswer && !validAnswers.includes(subQ.correctAnswer)
    ) || [];
    if (invalidAnswers.length > 0) {
      errors.push("All correct answers must be TRUE, FALSE, or NOT_GIVEN");
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
