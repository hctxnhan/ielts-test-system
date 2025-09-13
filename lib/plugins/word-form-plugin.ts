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
  WordFormQuestion,
  Question,
} from "@testComponents/lib/types";
import { StandardQuestion } from "@testComponents/lib/standardized-types";
import { v4 as uuidv4 } from "uuid";

// Reusing existing components
import WordFormEditor from "@testComponents/components/creator/question-editors/word-form-editor";
import WordFormQuestionRenderer from "@testComponents/components/test-player/question-types/word-form-question";

class WordFormPlugin extends BaseQuestionPlugin<WordFormQuestion> {
  config: QuestionPlugin<WordFormQuestion>["config"] = {
    type: "word-form",
    displayName: "Word Formation",
    description: "Users provide the correct form of a given word in a sentence.",
    icon: "type",
    category: ["grammar", "reading"],
    supportsPartialScoring: true,
    supportsAIScoring: true,
    defaultPoints: 1,
  };

  createDefault(index: number): WordFormQuestion {
    return {
      id: uuidv4(),
      type: "word-form",
      text: "Fill in the correct form of the word given in parentheses.",
      points: 1,
      scoringStrategy: "partial",
      index,
      partialEndingIndex: 0,
      exercises: [
        {
          id: uuidv4(),
          sentence: "He _____ to work every day. (drive)",
          baseWord: "drive",
          correctForm: "drives",
          position: 0,
        },
      ],
      scoringPrompt: "",
    };
  }

  createRenderer(): React.ComponentType<QuestionRendererProps<WordFormQuestion>> {
    return WordFormQuestionRenderer as unknown as React.ComponentType<
      QuestionRendererProps<WordFormQuestion>
    >;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<WordFormQuestion>> {
    const EditorWrapper: React.FC<QuestionEditorProps<WordFormQuestion>> = ({ question, onUpdateQuestion, sectionId }) => {
      const adaptedOnChange = (updatedQuestion: WordFormQuestion) => {
        onUpdateQuestion(sectionId, question.id, updatedQuestion);
      };

      // Use React.createElement to avoid JSX syntax issues in this context.
      return React.createElement(WordFormEditor, { value: question, onChange: adaptedOnChange });
    };
    return EditorWrapper;
  }

  transform(question: WordFormQuestion): StandardQuestion {
    return {
      id: question.id,
      type: question.type,
      text: question.text,
      points: question.points,
      scoringStrategy: question.scoringStrategy,
      index: question.index,
      partialEndingIndex: question.partialEndingIndex,
      subQuestions: question.exercises.map(ex => ({
        subId: ex.id,
        questionText: ex.sentence,
        // For word form, the "correct answer" is the correct form of the word
        correctAnswer: ex.correctForm,
        // We can store the base word in a custom field if needed, e.g., in `item`
        item: ex.baseWord,
        points: question.points / (question.exercises.length || 1),
      })),
      prompt: question.scoringPrompt,
    } as StandardQuestion;
  }

  validate(question: WordFormQuestion): ValidationResult {
    const result = super.validate(question);

    if (!question.exercises || question.exercises.length === 0) {
      result.errors.push("At least one word formation exercise is required.");
    } else {
      question.exercises.forEach((ex, index) => {
        if (!ex.sentence?.trim()) {
          result.errors.push(`Sentence for exercise #${index + 1} is empty.`);
        }
        if (!ex.baseWord?.trim()) {
          result.errors.push(`Base word for exercise #${index + 1} is empty.`);
        }
        if (!ex.correctForm?.trim()) {
          result.errors.push(`Correct form for exercise #${index + 1} is empty.`);
        }
      });
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  async score(context: ScoringContext): Promise<ScoringResult> {
    const { question, answer, subQuestionId, scoreEssayFn } = context;
    const wordFormQuestion = question as WordFormQuestion;
    const userAnswers = (answer as Record<string, string>) || {};

    const exercise = wordFormQuestion.exercises.find(ex => ex.id === subQuestionId);
    if (!exercise) {
      return { isCorrect: false, score: 0, maxScore: 0, feedback: "Exercise not found." };
    }

    const userAnswer = userAnswers[exercise.id] || "";
    const maxScore = wordFormQuestion.points / (wordFormQuestion.exercises.length || 1);

    // 1. Simple string comparison scoring
    const isCorrectSimple = userAnswer.trim().toLowerCase() === exercise.correctForm.trim().toLowerCase();

    if (!scoreEssayFn) {
      return {
        isCorrect: isCorrectSimple,
        score: isCorrectSimple ? maxScore : 0,
        maxScore,
      };
    }

    // 2. AI-based scoring (if available) for more nuanced feedback
    if (!userAnswer.trim()) {
      return { isCorrect: false, score: 0, maxScore, feedback: "No answer provided." };
    }
    try {
      const prompt = wordFormQuestion.scoringPrompt || `Evaluate if the student used the correct form of the base word "${exercise.baseWord}" in the context of the sentence. The expected answer is "${exercise.correctForm}". The student's answer is "${userAnswer}". Sentence: "${exercise.sentence}". Provide a score of 1 for correct and 0 for incorrect, with brief feedback.`;
      const aiResult = await scoreEssayFn({
        text: userAnswer,
        prompt: exercise.sentence,
        essay: userAnswer,
        scoringPrompt: prompt,
      });

      if (aiResult.ok) {
        const scaledScore = aiResult.score * maxScore;
        return {
          isCorrect: scaledScore >= maxScore * 0.8, // High threshold for correctness
          score: scaledScore,
          maxScore,
          feedback: aiResult.feedback,
        };
      } else {
        throw new Error(aiResult.error || "Unknown AI scoring error");
      }
    } catch (error) {
      // Fallback to simple scoring if AI fails
      return {
        isCorrect: isCorrectSimple,
        score: isCorrectSimple ? maxScore : 0,
        maxScore,
        feedback: `AI scoring failed. Simple check result: ${isCorrectSimple ? 'Correct' : 'Incorrect'}.`,
      };
    }
  }

  isQuestionOfType(question: Question): question is WordFormQuestion {
    return question.type === "word-form";
  }
}

export const wordFormPlugin = new WordFormPlugin();
