import React from "react";
import { v4 as uuidv4 } from "uuid";
import type { MatchingHeadingsQuestion } from "../types";
import type { StandardMatchingHeadingsQuestion, StandardQuestionItem, StandardQuestionOption, StandardSubQuestionMeta } from "../standardized-types";
import { BaseQuestionPlugin, ValidationResult, QuestionRendererProps, QuestionEditorProps, ScoringContext, ScoringResult } from "../question-plugin-system";

// Import the existing components
import MatchingHeadingsQuestionComponent from "../../components/test-player/question-types/matching-headings-question";
import MatchingHeadingsEditor from "../../components/creator/question-editors/matching-headings-editor";

export class MatchingHeadingsPlugin extends BaseQuestionPlugin<MatchingHeadingsQuestion> {
  config = {
    type: "matching-headings" as const,
    displayName: "Matching Headings",
    description: "Match headings to paragraphs in a passage",
    icon: "🔗",
    category: ["reading" as const],
    supportsPartialScoring: true,
    supportsAIScoring: false,
    defaultPoints: 1
  };

  createRenderer(): React.ComponentType<QuestionRendererProps<MatchingHeadingsQuestion>> {
    return MatchingHeadingsQuestionComponent as unknown as React.ComponentType<QuestionRendererProps<MatchingHeadingsQuestion>>;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<MatchingHeadingsQuestion>> {
    return MatchingHeadingsEditor as unknown as React.ComponentType<QuestionEditorProps<MatchingHeadingsQuestion>>;
  }

  createDefault(index: number): MatchingHeadingsQuestion {
    const paragraphIds = [uuidv4(), uuidv4(), uuidv4()];
    
    return {
      id: uuidv4(),
      type: "matching-headings",
      text: "",
      points: this.config.defaultPoints,
      scoringStrategy: "partial",
      index: index,
      partialEndingIndex: index,
      paragraphs: [
        {
          id: paragraphIds[0],
          text: "Paragraph 1 content",
        },
        {
          id: paragraphIds[1],
          text: "Paragraph 2 content",
        },
        {
          id: paragraphIds[2],
          text: "Paragraph 3 content",
        },
      ],
      headings: [
        {
          id: uuidv4(),
          text: "Heading A",
        },
        {
          id: uuidv4(),
          text: "Heading B",
        },
        {
          id: uuidv4(),
          text: "Heading C",
        },
        {
          id: uuidv4(),
          text: "Heading D",
        },
        {
          id: uuidv4(),
          text: "Heading E",
        },
      ],
      subQuestions: [
        {
          subId: uuidv4(),
          item: paragraphIds[0],
          correctAnswer: "",
          points: this.config.defaultPoints / 3,
        },
        {
          subId: uuidv4(),
          item: paragraphIds[1],
          correctAnswer: "",
          points: this.config.defaultPoints / 3,
        },
        {
          subId: uuidv4(),
          item: paragraphIds[2],
          correctAnswer: "",
          points: this.config.defaultPoints / 3,
        },
      ],
    };
  }

  transform(question: MatchingHeadingsQuestion): StandardMatchingHeadingsQuestion {
    const standardItems: StandardQuestionItem[] = question.paragraphs.map((paragraph) => ({
      id: paragraph.id,
      text: paragraph.text,
    }));

    const standardOptions: StandardQuestionOption[] = question.headings.map((heading) => ({
      id: heading.id,
      text: heading.text,
    }));

    const standardSubQuestions: StandardSubQuestionMeta[] = question.subQuestions.map((subQ, index) => ({
      subId: subQ.subId,
      item: subQ.item,
      points: subQ.points,
      correctAnswer: subQ.correctAnswer,
      questionText: standardItems.find((item) => item.id === subQ.item)?.text,
      answerText: standardOptions.find((opt) => opt.id === subQ.correctAnswer)?.text,
      subIndex: index,
    }));

    return {
      ...question,
      items: standardItems,
      options: standardOptions,
      subQuestions: standardSubQuestions,
      scoringStrategy: "partial",
    };
  }

  score(context: ScoringContext): ScoringResult {
    const question = context.question as MatchingHeadingsQuestion;
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
          ? "Correct heading match!" 
          : "Incorrect heading match"
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
          ? "All heading matches correct!" 
          : `${correctCount}/${totalSubQuestions} heading matches correct`
      };
    }
  }

  validate(question: MatchingHeadingsQuestion): ValidationResult {
    const baseValidation = super.validate(question);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Matching headings specific validation
    if (!question.paragraphs || question.paragraphs.length === 0) {
      errors.push("Matching headings questions must have at least one paragraph");
    }

    if (!question.headings || question.headings.length === 0) {
      errors.push("Matching headings questions must have at least one heading");
    }

    if (!question.subQuestions || question.subQuestions.length === 0) {
      errors.push("Matching headings questions must have at least one sub-question");
    }

    // Check for empty paragraph texts
    const emptyParagraphs = question.paragraphs?.filter(paragraph => !paragraph.text?.trim()) || [];
    if (emptyParagraphs.length > 0) {
      errors.push("All paragraphs must have text");
    }

    // Check for empty heading texts
    const emptyHeadings = question.headings?.filter(heading => !heading.text?.trim()) || [];
    if (emptyHeadings.length > 0) {
      errors.push("All headings must have text");
    }

    // Check for sub-questions without correct answers
    const invalidSubQuestions = question.subQuestions?.filter(subQ => 
      !subQ.correctAnswer?.trim()
    ) || [];
    if (invalidSubQuestions.length > 0) {
      errors.push("All sub-questions must have correct answers");
    }

    // Check if more sub-questions than paragraphs
    if (question.subQuestions && question.paragraphs && 
        question.subQuestions.length > question.paragraphs.length) {
      warnings.push("More sub-questions than available paragraphs");
    }

    // Check if fewer headings than paragraphs
    if (question.headings && question.paragraphs && 
        question.headings.length < question.paragraphs.length) {
      warnings.push("Consider having more headings than paragraphs to avoid guessing");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
