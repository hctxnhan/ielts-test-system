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
import type { WordFormQuestion, Question } from "@testComponents/lib/types";
import { StandardQuestion, StandardSubQuestionMeta } from "@testComponents/lib/standardized-types";
import { v4 as uuidv4 } from "uuid";

// Reusing existing components
import WordFormEditor from "@testComponents/components/creator/question-editors/word-form-editor";
import WordFormQuestionRenderer from "@testComponents/components/test-player/question-types/word-form-question";

class WordFormPlugin extends BaseQuestionPlugin<WordFormQuestion> {
  config: QuestionPlugin<WordFormQuestion>["config"] = {
    type: "word-form",
    displayName: "Word Formation",
    description:
      "Users provide the correct form of a given word in a sentence.",
    icon: "type",
    category: ["grammar", "reading"],
    supportsPartialScoring: true,
    supportsAIScoring: true,
    defaultPoints: 1,
    scoreOnCompletion: true,
    hasSubQuestions: true,
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

  createRenderer(): React.ComponentType<
    QuestionRendererProps<WordFormQuestion>
  > {
    return WordFormQuestionRenderer as unknown as React.ComponentType<
      QuestionRendererProps<WordFormQuestion>
    >;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<WordFormQuestion>> {
    return WordFormEditor as unknown as React.ComponentType<
      QuestionEditorProps<WordFormQuestion>
    >;
  }

  transform(question: WordFormQuestion): StandardQuestion {
    const exercises = question.exercises.map((ex) => ({
      id: ex.id,
      sentence: ex.sentence,
      baseWord: ex.baseWord,
      correctForm: ex.correctForm,
    }));

    const standardSubQuestions: StandardSubQuestionMeta[] = question.exercises.map((ex) => ({
      subId: ex.id,
      questionText: ex.sentence,
      correctAnswer: ex.correctForm,
      item: ex.baseWord,
      points: question.points / (question.exercises.length || 1),
    }));

    return {
      ...question,
      exercises,
      subQuestions: standardSubQuestions,
      prompt: question.scoringPrompt,
    } as unknown as StandardQuestion;
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
          result.errors.push(
            `Correct form for exercise #${index + 1} is empty.`,
          );
        }
      });
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  async score(context: ScoringContext): Promise<ScoringResult> {
    const { question, answer, subQuestionId, aiScoringFn } = context;
    const wordFormQuestion = question as WordFormQuestion;
    
    // Expect answers in object format: Record<string, string>
    const userAnswers = (answer as Record<string, string>) || {};

    // Find the specific exercise being scored
    const exercise = wordFormQuestion.exercises.find(
      (ex) => ex.id === subQuestionId,
    );
    
    if (!exercise) {
      return {
        isCorrect: false,
        score: 0,
        maxScore: 0,
        feedback: "Exercise not found.",
      };
    }

    const userAnswer = userAnswers[exercise.id] || "";
    const maxScore = wordFormQuestion.points / (wordFormQuestion.exercises.length || 1);


    // 1. Simple string comparison scoring
    // Safely convert to string before calling trim()
    const userAnswerString = (userAnswer || "").toString();
    const isCorrectSimple = userAnswerString.trim().toLowerCase() === exercise.correctForm.trim().toLowerCase();

    if (!aiScoringFn) {
      return {
        isCorrect: isCorrectSimple,
        score: isCorrectSimple ? maxScore : 0,
        maxScore,
        feedback: isCorrectSimple ? "Correct!" : `Incorrect. Expected: ${exercise.correctForm}`,
      };
    }

    // 2. AI-based scoring (if available) for more nuanced feedback
    if (!userAnswerString.trim()) {
      return {
        isCorrect: false,
        score: 0,
        maxScore,
        feedback: "No answer provided.",
      };
    }

    
    try {
      const prompt = wordFormQuestion.scoringPrompt || `You are an expert grammar teacher specializing in word formation. Evaluate this word form transformation exercise:

Base word: "${exercise.baseWord}"
Student answer: "${userAnswer}"
Correct form: "${exercise.correctForm}"

Context sentence: "${exercise.sentence}"

Please evaluate on a scale of 0-1 (where 1 is completely correct) considering:
- Accuracy of the word transformation
- Grammatical correctness in context
- Spelling accuracy
- Appropriate word form for the context

Provide specific, constructive feedback focusing on:
- Whether the transformation is correct
- Any grammatical issues
- Spelling corrections if needed
- Explanation of the correct word formation rule

Be encouraging but precise in your feedback.`;

      const aiResult = await aiScoringFn({
        text: userAnswer,
        prompt: exercise.sentence,
        essay: userAnswer,
        scoringPrompt: prompt,
      });


      if (aiResult.ok) {
        const scaledScore = aiResult.score * maxScore / 9;
        const result = {
          isCorrect: scaledScore >= maxScore * 0.8, // High threshold for correctness
          score: scaledScore,
          maxScore,
          feedback: aiResult.feedback,
        };
        
        return result;
      } else {
        throw new Error(aiResult.error || "Unknown AI scoring error");
      }
    } catch (error) {
      // Fallback to simple scoring if AI fails
      return {
        isCorrect: isCorrectSimple,
        score: isCorrectSimple ? maxScore : 0,
        maxScore,
        feedback: `AI scoring failed. Simple check result: ${isCorrectSimple ? "Correct" : "Incorrect"}. Expected: ${exercise.correctForm}`,
      };
    }
  }

  isQuestionOfType(question: Question): question is WordFormQuestion {
    return question.type === "word-form";
  }
}

export const wordFormPlugin = new WordFormPlugin();
