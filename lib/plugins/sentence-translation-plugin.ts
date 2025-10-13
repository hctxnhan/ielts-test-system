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
import {
  StandardQuestion,
  StandardSubQuestionMeta,
} from "@testComponents/lib/standardized-types";
import { v4 as uuidv4 } from "uuid";

// Reusing existing components
import SentenceTranslationEditor from "@testComponents/components/creator/question-editors/sentence-translation-editor";
import SentenceTranslationQuestionRenderer from "@testComponents/components/test-player/question-types/sentence-translation-question";

class SentenceTranslationPlugin extends BaseQuestionPlugin<SentenceTranslationQuestion> {
  config: QuestionPlugin<SentenceTranslationQuestion>["config"] = {
    type: "sentence-translation",
    displayName: "Sentence Translation",
    description:
      "Users translate sentences from a source to a target language.",
    icon: "languages",
    category: ["grammar", "writing"],
    supportsPartialScoring: true,
    supportsAIScoring: true,
    defaultPoints: 1,
    scoreOnCompletion: true,
    hasSubQuestions: true,
  };

  createDefault(index: number): SentenceTranslationQuestion {
    const sentenceId = uuidv4();
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
          id: sentenceId,
          sourceText: "",
          referenceTranslations: [""],
        },
      ],
      subQuestions: [
        {
          subId: sentenceId,
          points: 1,
        },
      ],
      sourceLanguage: "vietnamese",
      targetLanguage: "english",
      scoringPrompt: "",
    };
  }

  createRenderer(): React.ComponentType<
    QuestionRendererProps<SentenceTranslationQuestion>
  > {
    return SentenceTranslationQuestionRenderer as unknown as React.ComponentType<
      QuestionRendererProps<SentenceTranslationQuestion>
    >;
  }

  createEditor(): React.ComponentType<
    QuestionEditorProps<SentenceTranslationQuestion>
  > {
    return SentenceTranslationEditor as unknown as React.ComponentType<
      QuestionEditorProps<SentenceTranslationQuestion>
    >;
  }

  transform(question: SentenceTranslationQuestion): StandardQuestion {
    const sentences = question.sentences || [];
    const sentencesCount = sentences.length || 1;

    const standardSubQuestions: StandardSubQuestionMeta[] = sentences.map(
      (s) => ({
        subId: s.id,
        questionText: s.sourceText,
        acceptableAnswers: s.referenceTranslations,
        points: question.points / sentencesCount,
      }),
    );

    // Provide legacy-compatible fields (sourceText/referenceTranslation) using the first sentence
    const legacySourceText =
      sentences.length > 0 ? sentences[0].sourceText : "";
    const legacyReference =
      sentences.length > 0
        ? (sentences[0].referenceTranslations || [])[0]
        : undefined;

    return {
      ...question,
      subQuestions: standardSubQuestions,
      prompt: question.scoringPrompt,
      sourceText: legacySourceText,
      referenceTranslation: legacyReference,
      sourceLanguage: question.sourceLanguage,
      targetLanguage: question.targetLanguage,
    } as unknown as StandardQuestion;
  }

  validate(question: SentenceTranslationQuestion): ValidationResult {
    const result = super.validate(question);

    if (!question.sentences || question.sentences.length === 0) {
      result.errors.push("At least one sentence is required for translation.");
    } else {
      question.sentences.forEach((s, index) => {
        if (!s.sourceText.trim()) {
          result.errors.push(
            `Source text for sentence #${index + 1} is empty.`,
          );
        }
        // It's okay for referenceTranslations to be empty if AI scoring is used
      });
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  async score(context: ScoringContext): Promise<ScoringResult> {
    const { question, answer, subQuestionId, aiScoringFn } = context;
    const translationQuestion = question as SentenceTranslationQuestion;

    // Expect answers in object format: Record<string, string>
    const userAnswers = (answer as Record<string, string>) || {};

    const scoringStrategy = translationQuestion.scoringStrategy || "partial";

    // Check if sentences array exists (new format)
    if (
      translationQuestion.sentences &&
      Array.isArray(translationQuestion.sentences) &&
      translationQuestion.sentences.length > 0
    ) {
      if (scoringStrategy === "partial" && subQuestionId) {
        // Partial scoring - score individual sentence
        const sentence = translationQuestion.sentences.find(
          (s) => s.id === subQuestionId,
        );

        if (!sentence) {
          return {
            isCorrect: false,
            score: 0,
            maxScore: 0,
            feedback: "Sentence not found.",
          };
        }

        const userAnswer = userAnswers[sentence.id] || "";
        const sentencesCount = translationQuestion.sentences.length;
        const maxScore = translationQuestion.points / sentencesCount;

        return await this.scoreTranslation({
          sourceText: sentence.sourceText,
          userAnswer,
          referenceTranslations: sentence.referenceTranslations || [],
          maxScore,
          sourceLanguage: translationQuestion.sourceLanguage,
          targetLanguage: translationQuestion.targetLanguage,
          scoringPrompt: translationQuestion.scoringPrompt,
          aiScoringFn,
        });
      } else {
        // All-or-nothing scoring - score entire question

        const sentences = translationQuestion.sentences;
        const totalSentences = sentences.length;
        let allCorrect = true;
        const feedbacks: string[] = [];

        // Score all sentences
        for (const sentence of sentences) {
          const userAnswer = userAnswers[sentence.id] || "";
          const sentenceMaxScore = translationQuestion.points / totalSentences;

          const result = await this.scoreTranslation({
            sourceText: sentence.sourceText,
            userAnswer,
            referenceTranslations: sentence.referenceTranslations || [],
            maxScore: sentenceMaxScore,
            sourceLanguage: translationQuestion.sourceLanguage,
            targetLanguage: translationQuestion.targetLanguage,
            scoringPrompt: translationQuestion.scoringPrompt,
            aiScoringFn,
          });

          if (!result.isCorrect) {
            allCorrect = false;
          }
          if (result.feedback) {
            feedbacks.push(
              `Sentence ${sentences.indexOf(sentence) + 1}: ${result.feedback}`,
            );
          }
        }

        return {
          isCorrect: allCorrect,
          score: allCorrect ? translationQuestion.points : 0,
          maxScore: translationQuestion.points,
          feedback: allCorrect
            ? "All translations correct!"
            : `Some translations need improvement. ${feedbacks.join(" ")}`,
        };
      }
    }

    // Handle legacy format with sourceText (single translation)
    interface ExtendedQuestion extends SentenceTranslationQuestion {
      sourceText?: string;
      referenceTranslation?: string;
    }
    const questionData = translationQuestion as ExtendedQuestion;
    if (questionData.sourceText) {
      // For legacy format, use the question ID as the answer key
      const userAnswer = userAnswers[translationQuestion.id] || "";
      const maxScore = translationQuestion.points || 0;

      return await this.scoreTranslation({
        sourceText: questionData.sourceText,
        userAnswer,
        referenceTranslations: questionData.referenceTranslation
          ? [questionData.referenceTranslation]
          : [],
        maxScore,
        sourceLanguage: translationQuestion.sourceLanguage,
        targetLanguage: translationQuestion.targetLanguage,
        scoringPrompt: translationQuestion.scoringPrompt,
        aiScoringFn,
      });
    }

    return {
      isCorrect: false,
      score: 0,
      maxScore: 0,
      feedback: "Invalid question format.",
    };
  }

  private async scoreTranslation(params: {
    sourceText: string;
    userAnswer: string;
    referenceTranslations: string[];
    maxScore: number;
    sourceLanguage: string;
    targetLanguage: string;
    scoringPrompt?: string;
    aiScoringFn?: (params: {
      text: string;
      prompt: string;
      essay: string;
      scoringPrompt: string;
    }) => Promise<{
      score: number;
      feedback: string;
      ok: boolean;
      error?: string;
    }>;
  }): Promise<ScoringResult> {
    const {
      sourceText,
      userAnswer,
      referenceTranslations,
      maxScore,
      sourceLanguage,
      targetLanguage,
      scoringPrompt,
      aiScoringFn,
    } = params;

    // Safely convert to string before calling trim()
    const userAnswerString = (userAnswer || "").toString();
    if (!userAnswerString.trim()) {
      return {
        isCorrect: false,
        score: 0,
        maxScore,
        feedback: "No answer provided.",
      };
    }

    if (referenceTranslations.length > 0 && !aiScoringFn) {
      const isCorrect = referenceTranslations.some(
        (ref) => ref.trim().toLowerCase() === userAnswerString.trim().toLowerCase(),
      );

      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        feedback: isCorrect
          ? "Correct translation!"
          : "Translation does not match reference answers.",
      };
    }

    // 2. AI-based scoring
    if (aiScoringFn) {
      try {
        const prompt =
          scoringPrompt ||
          `You are an expert language teacher specializing in translation evaluation. Your task is to evaluate the translation quality.

Evaluate this translation from ${sourceLanguage} to ${targetLanguage}:

Source: "${sourceText}"
Student Translation: "${userAnswerString}"

${referenceTranslations.length > 0 ? `Reference translations:\n${referenceTranslations.join("\n")}\n` : ""}

Please evaluate on a scale of 0-1 (where 1 is perfect translation) considering:
- Accuracy of meaning (40%)
- Grammar and syntax (30%) 
- Natural expression (20%)
- Cultural appropriateness (10%)

Provide specific, constructive feedback focusing on:
- What was done well
- Areas for improvement
- Specific grammar or vocabulary suggestions
- Cultural context if relevant

Be encouraging but precise in your feedback.`;

        const aiResult = await aiScoringFn({
          text: userAnswerString,
          prompt: sourceText,
          essay: userAnswerString,
          scoringPrompt: prompt,
        });

        if (aiResult.ok) {
          const scaledScore = aiResult.score * maxScore / 9;
          console.log("💡 AI scoring result:", {aiResult, maxScore, scaledScore});
          return {
            isCorrect: scaledScore >= maxScore * 0.5,
            score: scaledScore,
            maxScore,
            feedback: aiResult.feedback,
          };
        } else {
          throw new Error(aiResult.error || "Unknown AI scoring error");
        }
      } catch (error) {
        console.error(
          "💥 sentence-translation-plugin: AI scoring failed:",
          error,
        );
        return {
          isCorrect: false,
          score: 0,
          maxScore,
          feedback: `AI scoring failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }

    // 3. Fallback
    return {
      isCorrect: false,
      score: 0,
      maxScore,
      feedback: "No scoring method available.",
    };
  }

  isQuestionOfType(
    question: Question,
  ): question is SentenceTranslationQuestion {
    return question.type === "sentence-translation";
  }
}

export const sentenceTranslationPlugin = new SentenceTranslationPlugin();
