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
  SentenceTranslationQuestion,
  Question,
} from "@testComponents/lib/types";
import { StandardQuestion } from "@testComponents/lib/standardized-types";
import { v4 as uuidv4 } from "uuid";

// Reusing existing components
import SentenceTranslationEditor from "@testComponents/components/creator/question-editors/sentence-translation-editor";
import SentenceTranslationQuestionRenderer from "@testComponents/components/test-player/question-types/sentence-translation-question";

class SentenceTranslationPlugin extends BaseQuestionPlugin<SentenceTranslationQuestion> {
  config: QuestionPlugin<SentenceTranslationQuestion>["config"] = {
    type: "sentence-translation",
    displayName: "Sentence Translation",
    description: "Users translate sentences from a source to a target language.",
    icon: "languages",
    category: ["grammar", "writing"],
    supportsPartialScoring: true,
    supportsAIScoring: true,
    defaultPoints: 1,
  };

  createDefault(index: number): SentenceTranslationQuestion {
    return {
      id: uuidv4(),
      type: "sentence-translation",
      text: "Translate the following sentences.",
      points: 1,
      scoringStrategy: "partial",
      index,
      partialEndingIndex: 0,
      sentences: [
        {
          id: uuidv4(),
          sourceText: "",
          referenceTranslations: [""],
        },
      ],
      sourceLanguage: "vietnamese",
      targetLanguage: "english",
      scoringPrompt: "",
    };
  }

  createRenderer(): React.ComponentType<QuestionRendererProps<SentenceTranslationQuestion>> {
    return SentenceTranslationQuestionRenderer as unknown as React.ComponentType<
      QuestionRendererProps<SentenceTranslationQuestion>
    >;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<SentenceTranslationQuestion>> {
    return SentenceTranslationEditor as unknown as React.ComponentType<
      QuestionEditorProps<SentenceTranslationQuestion>
    >;
  }

  transform(question: SentenceTranslationQuestion): StandardQuestion {
    return {
      id: question.id,
      type: question.type,
      text: question.text,
      points: question.points,
      scoringStrategy: question.scoringStrategy,
      index: question.index,
      partialEndingIndex: question.partialEndingIndex,
      // Custom transformation for this question type
      subQuestions: question.sentences.map(s => ({
        subId: s.id,
        questionText: s.sourceText,
        acceptableAnswers: s.referenceTranslations,
        points: question.points / (question.sentences.length || 1),
      })),
      prompt: question.scoringPrompt,
    } as StandardQuestion;
  }

  validate(question: SentenceTranslationQuestion): ValidationResult {
    const result = super.validate(question);

    if (!question.sentences || question.sentences.length === 0) {
      result.errors.push("At least one sentence is required for translation.");
    } else {
      question.sentences.forEach((s, index) => {
        if (!s.sourceText.trim()) {
          result.errors.push(`Source text for sentence #${index + 1} is empty.`);
        }
        // It's okay for referenceTranslations to be empty if AI scoring is used
      });
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  async score(context: ScoringContext): Promise<ScoringResult> {
    const { question, answer, subQuestionId, scoreEssayFn } = context;
    const translationQuestion = question as SentenceTranslationQuestion;
    const userAnswers = (answer as Record<string, string>) || {};

    const sentence = translationQuestion.sentences.find(s => s.id === subQuestionId);
    if (!sentence) {
      return { isCorrect: false, score: 0, maxScore: 0, feedback: "Sentence not found." };
    }

    const userAnswer = userAnswers[sentence.id] || "";
    const maxScore = translationQuestion.points / (translationQuestion.sentences.length || 1);

    // 1. Reference-based scoring (if available and AI scorer is not)
    if (sentence.referenceTranslations && sentence.referenceTranslations.length > 0 && !scoreEssayFn) {
      const isCorrect = sentence.referenceTranslations.some(
        ref => ref.trim().toLowerCase() === userAnswer.trim().toLowerCase()
      );
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
      };
    }

    // 2. AI-based scoring (if scorer function is provided)
    if (scoreEssayFn) {
      if (!userAnswer.trim()) {
        return { isCorrect: false, score: 0, maxScore, feedback: "No answer provided." };
      }
      try {
        const prompt = translationQuestion.scoringPrompt || `Evaluate this translation from ${translationQuestion.sourceLanguage} to ${translationQuestion.targetLanguage} on a scale of 0-1. Source: "${sentence.sourceText}". Translation: "${userAnswer}".`;
        const aiResult = await scoreEssayFn({
          text: userAnswer,
          prompt: sentence.sourceText,
          essay: userAnswer,
          scoringPrompt: prompt,
        });

        if (aiResult.ok) {
          // Scale AI score (0-1) to the max points for this sub-question
          const scaledScore = aiResult.score * maxScore;
          return {
            isCorrect: scaledScore >= maxScore * 0.5, // Consider >50% as "correct"
            score: scaledScore,
            maxScore,
            feedback: aiResult.feedback,
          };
        } else {
          throw new Error(aiResult.error || "Unknown AI scoring error");
        }
      } catch (error) {
        return {
          isCorrect: false,
          score: 0,
          maxScore,
          feedback: `AI scoring failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }

    // 3. Fallback if no scoring method is available
    return {
      isCorrect: false,
      score: 0,
      maxScore,
      feedback: "No scoring method available (no reference translations or AI scorer).",
    };
  }

  isQuestionOfType(question: Question): question is SentenceTranslationQuestion {
    return question.type === "sentence-translation";
  }
}

export const sentenceTranslationPlugin = new SentenceTranslationPlugin();
