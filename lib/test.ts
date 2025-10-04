import { QuestionPluginRegistry } from "./question-plugin-system";
import { Test, Question } from "./types";

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

      const standardizedQuestion =
        QuestionPluginRegistry.transformQuestion(question);

      // Calculate the endQuestionIndex based on scoring strategy
      let endQuestionIndex: number;

      if (standardizedQuestion.scoringStrategy === "partial") {
     
        endQuestionIndex =
          startQuestionIndex +
          (standardizedQuestion.subQuestions?.length || 1) -
          1;
      } else {
       
        endQuestionIndex = startQuestionIndex;
      }

      currentIndex = endQuestionIndex + 1;

      return {
        ...(standardizedQuestion as unknown as Question),
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

export function processTestWithFilters(
  test: Test,
  config?: TestFilterConfig,
): Test {
  let processedTest = test;

  // Apply filtering if custom mode is enabled
  if (config?.customMode) {
    // Filter sections
    processedTest = {
      ...processedTest,
      sections: processedTest.sections
        .filter(
          (section) =>
            !config.selectedSections?.length ||
            config.selectedSections.includes(section.id),
        )
        .map((section) => ({
          ...section,
          questions: section.questions.filter(
            (q) =>
              !config.selectedTypes?.length ||
              config.selectedTypes.includes(q.type),
          ),
        }))
        .filter((section) => section.questions.length > 0), // Remove sections with no questions
    };
  }

  // Process question indexes after filtering
  processedTest = updateQuestionIndexes(processedTest);

  return processedTest;
}
