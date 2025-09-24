import React from "react";
import {
  BaseQuestionPlugin,
  QuestionEditorProps,
  QuestionPlugin,
  QuestionRendererProps,
  ScoringContext,
  ScoringResult,
  ValidationResult,
} from "../question-plugin-system";
import type {
  ShortAnswerQuestion,
  Question,
} from "@testComponents/lib/types";
import { StandardQuestion, StandardQuestionItem, StandardSubQuestionMeta } from "@testComponents/lib/standardized-types";
import { v4 as uuidv4 } from "uuid";

// Using 'as unknown as' to bypass strict type checking for component props,
// allowing reuse of existing components without major refactoring.
import ShortAnswerEditor from "@testComponents/components/creator/question-editors/short-answer-editor";
import ShortAnswerQuestionRenderer from "@testComponents/components/test-player/question-types/short-answer-question";

class ShortAnswerPlugin extends BaseQuestionPlugin<ShortAnswerQuestion> {
  config: QuestionPlugin<ShortAnswerQuestion>["config"] = {
    type: "short-answer",
    displayName: "Short Answer",
    description: "Users provide a short text-based answer.",
    icon: "pilcrow",
    category: ["reading", "listening", "grammar"],
    supportsPartialScoring: true,
    supportsAIScoring: false,
    defaultPoints: 1,
  };

  createDefault(index: number): ShortAnswerQuestion {
    const questions = [
      { id: uuidv4(), text: "" },
      { id: uuidv4(), text: "" },
    ];
    return {
      id: uuidv4(),
      type: "short-answer",
      text: "Answer the questions below.",
      points: questions.length,
      scoringStrategy: "partial",
      index,
      partialEndingIndex: 0,
      questions: questions,
      subQuestions: questions.map((q) => ({
        subId: uuidv4(),
        item: q.id,
        acceptableAnswers: [""],
        points: 1,
      })),
      wordLimit: 3,
    };
  }

  createRenderer(): React.ComponentType<QuestionRendererProps<ShortAnswerQuestion>> {
    return ShortAnswerQuestionRenderer as unknown as React.ComponentType<
      QuestionRendererProps<ShortAnswerQuestion>
    >;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<ShortAnswerQuestion>> {
    return ShortAnswerEditor as unknown as React.ComponentType<
      QuestionEditorProps<ShortAnswerQuestion>
    >;
  }

  transform(question: ShortAnswerQuestion): StandardQuestion {
    const standardItems: StandardQuestionItem[] = question.questions.map((q) => ({
      id: q.id,
      text: q.text,
    }));

    const standardSubQuestions: StandardSubQuestionMeta[] =
      question.subQuestions.map((sub) => {
        const shortAnswerSub = sub as any;
        return {
          subId: sub.subId,
          item: sub.item,
          points: sub.points,
          correctAnswer: shortAnswerSub.acceptableAnswers,
          questionText: standardItems.find((item) => item.id === sub.item)?.text,
          answerText: shortAnswerSub.acceptableAnswers?.join(", "),
          acceptableAnswers: shortAnswerSub.acceptableAnswers,
        };
      });

    return {
      ...question,
      items: standardItems,
      subQuestions: standardSubQuestions,
      wordLimit: question.wordLimit,
    } as StandardQuestion;
  }

  validate(question: ShortAnswerQuestion): ValidationResult {
    const result = super.validate(question);

    if (!question.questions || question.questions.length === 0) {
      result.errors.push("At least one question is required.");
    } else {
      question.questions.forEach((q, index) => {
        if (!q.text.trim()) {
          result.errors.push(`Question #${index + 1} text is empty.`);
        }
      });
    }

    if (!question.subQuestions || question.subQuestions.length === 0) {
      result.errors.push("Sub-questions for scoring are missing.");
    } else if (question.subQuestions.length !== question.questions.length) {
      result.errors.push(
        "The number of questions and sub-questions for scoring must match."
      );
    } else {
      question.subQuestions.forEach((sq, index) => {
        if (
          !sq.acceptableAnswers ||
          sq.acceptableAnswers.length === 0 ||
          sq.acceptableAnswers.every((a) => !a.trim())
        ) {
          result.errors.push(
            `At least one acceptable answer is required for question #${
              index + 1
            }.`
          );
        }
      });
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  score(context: ScoringContext): ScoringResult {
    const { question, answer, subQuestionId } = context;
    const shortAnswerQuestion = question as ShortAnswerQuestion;

    if (shortAnswerQuestion.scoringStrategy === "partial") {
      const subQuestion = shortAnswerQuestion.subQuestions.find(
        (sq) => sq.subId === subQuestionId
      );
      if (!subQuestion) {
        return { isCorrect: false, score: 0, maxScore: 0 };
      }

      const userAnswer =
        typeof answer === "object" && answer && subQuestionId
          ? (answer as Record<string, string>)[subQuestionId]
          : "";
      const normalizedAnswer = (userAnswer || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      const isCorrect =
        subQuestion.acceptableAnswers?.some(
          (acceptable) =>
            acceptable.trim().toLowerCase().replace(/\s+/g, " ") ===
            normalizedAnswer
        ) || false;

      return {
        isCorrect,
        score: isCorrect ? subQuestion.points : 0,
        maxScore: subQuestion.points,
      };
    } else {
      // All-or-nothing scoring
      const userAnswers = (answer as Record<string, string>) || {};
      let correctCount = 0;

      shortAnswerQuestion.subQuestions.forEach((sq) => {
        const userAnswer = userAnswers[sq.subId] || "";
        const normalizedAnswer = userAnswer
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");
        const isSubQCorrect =
          sq.acceptableAnswers?.some(
            (acceptable) =>
              acceptable.trim().toLowerCase().replace(/\s+/g, " ") ===
              normalizedAnswer
          ) || false;
        if (isSubQCorrect) {
          correctCount++;
        }
      });

      const isCorrect =
        correctCount === shortAnswerQuestion.subQuestions.length;
      return {
        isCorrect,
        score: isCorrect ? shortAnswerQuestion.points : 0,
        maxScore: shortAnswerQuestion.points,
      };
    }
  }

  isQuestionOfType(question: Question): question is ShortAnswerQuestion {
    return question.type === "short-answer";
  }
}

export const shortAnswerPlugin = new ShortAnswerPlugin();
