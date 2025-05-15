import { transformToStandardQuestion } from "./question-transformers";
import { Test } from './types';

export function updateQuestionIndexes(test: Test): Test {
  let currentIndex = 0;

  const updatedSections = test.sections.map((section) => {
    const updatedQuestions = section.questions.map((question) => {
      const startQuestionIndex = currentIndex;

      // Calculate the endQuestionIndex based on scoring strategy
      let endQuestionIndex: number;

      if (question.scoringStrategy === "partial") {
        endQuestionIndex =
          startQuestionIndex + (question.subQuestions?.length || 1) - 1;
      } else {
        endQuestionIndex = startQuestionIndex;
      }

      currentIndex = endQuestionIndex + 1;

      // Transform the question to standardized format and back
      const standardizedQuestion = transformToStandardQuestion(question);

      return {
        ...standardizedQuestion,
        index: startQuestionIndex,
        partialEndingIndex: endQuestionIndex,
      };
    });

    return {
      ...section,
      questions: updatedQuestions,
    };
  });

  return {
    ...test,
    sections: updatedSections,
  };
}

