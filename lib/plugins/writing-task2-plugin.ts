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
    scoreOnCompletion: true,
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
    const standardSubQuestions = [
      {
        subId: question.id,
        points: question.points,
        questionText: question.text,
        answerText: question.sampleAnswer,
      },
    ];

    return {
      ...question,
      subQuestions: standardSubQuestions,
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
    const { question, answer, aiScoringFn } = context;
    const writingQuestion = question as WritingTask1Question;
    const userAnswer = answer as WritingTaskAnswer;

    // Safely check if userAnswer.text exists and convert to string before trim()
    const userText = userAnswer?.text?.toString() || "";
    if (!userText || userText.trim().length < 20) {
      return { isCorrect: false, score: 0, maxScore: writingQuestion.points, feedback: "Answer is too short to be scored." };
    }

    if (!aiScoringFn) {
      console.error("aiScoringFn is not provided in the scoring context for a writing task.");
      return { isCorrect: false, score: 0, maxScore: writingQuestion.points, feedback: "Scoring function not available." };
    }

    try {
      const aiResult = await aiScoringFn({
        text: writingQuestion.text,
        prompt: writingQuestion.prompt,
        essay: userText,
        scoringPrompt: writingQuestion.scoringPrompt || `You are an expert Vietnamese IELTS examiner. Your task is to evaluate this IELTS Writing Task 1 response based on the official scoring criteria.

Provide a score between 1 and 9 (can include decimals like 7.5) and detailed feedback in Vietnamese.

**Scoring Criteria Details (Evaluate based on these):**

*   **Task Achievement/Response (Mức độ hoàn thành yêu cầu):** Assess how well the essay addresses all parts of the task prompt, develops a clear position, and presents relevant, extended, and supported ideas.
*   **Coherence and Cohesion (Tính mạch lạc và liên kết):** Evaluate the organization of information and ideas, the clarity of progression throughout the response, and the effective use of cohesive devices (linking words, pronouns, etc.). Check paragraphing.
*   **Lexical Resource (Vốn từ vựng):** Assess the range of vocabulary used, its accuracy, appropriateness for the task, and the control of features like collocation and word formation.
*   **Grammatical Range and Accuracy (Độ đa dạng và chính xác của ngữ pháp):** Evaluate the range and accuracy of grammatical structures used, including sentence complexity and control over errors.

Provide specific, constructive feedback in Vietnamese focusing on:
- Strengths and areas for improvement in each criterion
- Specific examples from the text
- Suggestions for improvement
- Overall band score justification`,
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
