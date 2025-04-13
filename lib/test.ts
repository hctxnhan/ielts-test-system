import { Question, Test } from "./types";

// give me function to update start and end index for each question in each section in whole test
// start question index is the index of the first sub question in the question, after last sub question of previous question in the section

// if question is partial
// end question index is the index of the last sub question in the question, after last sub question of previous question in the section
// if question is not partial - all_or-nothing
// end question index is equal to start question index

// if section 1 end question index is 5, section 2 start question index is 6 and continue
export function updateQuestionIndexes(test: Test): Test {
  let currentIndex = 0;

  const updatedSections = test.sections.map((section) => {
    const updatedQuestions = section.questions.map((question) => {
      const startQuestionIndex = currentIndex;

      // Calculate the endQuestionIndex based on scoring strategy
      let endQuestionIndex: number;

      if (question.scoringStrategy === "partial") {
        // For partial scoring, end index is the last sub-question index
        endQuestionIndex =
          startQuestionIndex + (question.subQuestions?.length || 1) - 1;
      } else {
        // For all-or-nothing, end index equals start index
        endQuestionIndex = startQuestionIndex;
      }

      // Update currentIndex to the position after this question
      currentIndex = endQuestionIndex + 1;

      return {
        ...question,
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
