import { transformToStandardQuestion } from "./question-transformers";
import { Test } from './types';

export interface TestFilterConfig {
  customMode?: boolean;
  selectedSections?: string[];
  selectedTypes?: string[];
}

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

export function processTestWithFilters(test: Test, config?: TestFilterConfig): Test {
  let processedTest = test;

  // Apply filtering if custom mode is enabled
  if (config?.customMode) {
    // Filter sections
    processedTest = {
      ...processedTest,
      sections: processedTest.sections
        .filter(
          (section) =>
            !config.selectedSections?.length || config.selectedSections.includes(section.id),
        )
        .map((section) => ({
          ...section,
          questions: section.questions.filter((q) =>
            !config.selectedTypes?.length || config.selectedTypes.includes(q.type),
          ),
        }))
        .filter((section) => section.questions.length > 0), // Remove sections with no questions
    };
  }

  // Process question indexes after filtering
  processedTest = updateQuestionIndexes(processedTest);

  return processedTest;
}

