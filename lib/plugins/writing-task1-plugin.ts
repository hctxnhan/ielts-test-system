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
  WritingTask1Question,
  Question,
  WritingTaskAnswer,
} from "@testComponents/lib/types";
import { StandardQuestion } from "@testComponents/lib/standardized-types";
import { v4 as uuidv4 } from "uuid";

// Using 'as unknown as' to bypass strict type checking for component props,
// allowing reuse of existing components without major refactoring.
import WritingTask1Editor from "@testComponents/components/creator/question-editors/writing-task1-editor";
import WritingTask1QuestionRenderer from "@testComponents/components/test-player/question-types/writing-task1-question";

class WritingTask1Plugin extends BaseQuestionPlugin<WritingTask1Question> {
  config: QuestionPlugin<WritingTask1Question>["config"] = {
    type: "writing-task1",
    displayName: "Writing Task 1",
    description: "Users write a response to a visual prompt (graph, chart, etc.).",
    icon: "bar-chart-2",
    category: ["writing"],
    supportsPartialScoring: false,
    supportsAIScoring: true,
    defaultPoints: 9,
  };

  createDefault(index: number): WritingTask1Question {
    return {
      id: uuidv4(),
      type: "writing-task1",
      text: "You should spend about 20 minutes on this task. The chart below shows information about...",
      points: 9,
      scoringStrategy: "all-or-nothing",
      index,
      partialEndingIndex: 0,
      prompt: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      wordLimit: 150,
      imageUrl: "",
      sampleAnswer: "",
      scoringPrompt: "",
    };
  }

  createRenderer(): React.ComponentType<QuestionRendererProps<WritingTask1Question>> {
    return WritingTask1QuestionRenderer as unknown as React.ComponentType<
      QuestionRendererProps<WritingTask1Question>
    >;
  }

  createEditor(): React.ComponentType<QuestionEditorProps<WritingTask1Question>> {
    return WritingTask1Editor as unknown as React.ComponentType<
      QuestionEditorProps<WritingTask1Question>
    >;
  }

  transform(question: WritingTask1Question): StandardQuestion {
    return {
      id: question.id,
      type: question.type,
      text: question.text,
      points: question.points,
      scoringStrategy: question.scoringStrategy,
      index: question.index,
      partialEndingIndex: question.partialEndingIndex,
      prompt: question.prompt,
      imageUrl: question.imageUrl,
      wordLimit: question.wordLimit,
      sampleAnswer: question.sampleAnswer,
      scoringPrompt: question.scoringPrompt,
    } as StandardQuestion;
  }

  validate(question: WritingTask1Question): ValidationResult {
    const result = super.validate(question);

    if (!question.text?.trim()) {
      result.errors.push("Task description text is required.");
    }
    if (!question.imageUrl) {
      result.warnings.push("No image has been uploaded for the task. This is highly recommended.");
    }
    if (question.wordLimit < 100) {
      result.warnings.push("The word limit is below the recommended 150 words for Task 1.");
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  async score(context: ScoringContext): Promise<ScoringResult> {
    const { question, answer, scoreEssayFn } = context;
    const writingQuestion = question as WritingTask1Question;
    const userAnswer = answer as WritingTaskAnswer;

    if (!userAnswer?.text || userAnswer.text.trim().length < 20) {
      return { isCorrect: false, score: 0, maxScore: writingQuestion.points, feedback: "Answer is too short to be scored." };
    }

    if (!scoreEssayFn) {
      console.error("scoreEssayFn is not provided in the scoring context for a writing task.");
      return { isCorrect: false, score: 0, maxScore: writingQuestion.points, feedback: "Scoring function not available." };
    }

    try {
      const aiResult = await scoreEssayFn({
        text: writingQuestion.text,
        prompt: writingQuestion.prompt,
        essay: userAnswer.text,
        scoringPrompt: writingQuestion.scoringPrompt || "Score this IELTS Writing Task 1 response based on standard criteria.",
      });

      if (aiResult.ok) {
        return {
          isCorrect: true, // For writing, "correct" means it was successfully scored
          score: aiResult.score,
          maxScore: writingQuestion.points,
          feedback: aiResult.feedback,
        };
      } else {
        throw new Error(aiResult.error || "Unknown AI scoring error");
      }
    } catch (error) {
      console.error("Error during AI scoring:", error);
      return {
        isCorrect: false,
        score: 0,
        maxScore: writingQuestion.points,
        feedback: `An error occurred while scoring: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  isQuestionOfType(question: Question): question is WritingTask1Question {
    return question.type === "writing-task1";
  }
}

export const writingTask1Plugin = new WritingTask1Plugin();
