import { transformToStandardQuestion } from "./question-transformers";
import { Question, Test } from "./types";

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

/**
 * Utility function to retrieve question text and answer text for a given question
 *
 * @param test The test object containing all sections and questions
 * @param questionId The ID of the question to retrieve text for
 * @param subQuestionId Optional subquestion ID for partial-scoring questions
 * @returns An object containing questionText and answerText, or undefined if not found
 */
export function getQuestionText(
  test: Test,
  questionId: string,
  subQuestionId?: string
): { questionText: string | undefined; answerText: string | undefined } {
  // Default return value
  let defaultReturn: {
    questionText: string | undefined;
    answerText: string | undefined;
  } = { questionText: undefined, answerText: undefined };

  // Find the question in any section
  for (const section of test.sections) {
    const question = section.questions.find((q) => q.id === questionId);

    if (question) {
      // Transform to standardized format
      const standardized = question;
      // const standardized = transformToStandardQuestion(question);

      if (!subQuestionId) {
        if (standardized.type.startsWith("writing-task")) {
          defaultReturn = {
            questionText: standardized.text,
            answerText: standardized.answer.text,
          };
        }
        // For questions without subquestion ID, return main question text
        // For writing tasks, also include sample answer
        defaultReturn = {
          questionText: standardized.text,
          answerText: "",
        };

        // For questions that have items property, append the items text
        if ("subQuestions" in standardized && standardized.subQuestions) {
          defaultReturn.answerText +=
            "\n" +
            standardized.subQuestions.map((sub) => sub.answerText).join("\n");
        }

        if (standardized.type === "completion") {
          defaultReturn.answerText = standardized.subQuestions
            ?.map((sub) => sub.correctAnswer)
            .join("\n");
        }

        if (standardized.type === "short-answer") {
          defaultReturn.answerText = standardized.subQuestions
            ?.map((sub) => sub.acceptableAnswers?.join(" / "))
            .join("\n");
        }
      } else if (
        standardized.subQuestions &&
        standardized.subQuestions.length > 0
      ) {
        // If subQuestionId is provided, find the subquestion
        const subQuestion = standardized.subQuestions.find(
          (sub) => sub.subId === subQuestionId
        );

        if (subQuestion) {
          let answerText = subQuestion.answerText;

          // For completion questions, use correctAnswer
          if (
            standardized.type === "completion" &&
            "correctAnswer" in subQuestion
          ) {
            answerText = subQuestion.correctAnswer;
          }

          // For short answer questions, use acceptable answers
          if (
            standardized.type === "short-answer" &&
            "acceptableAnswers" in subQuestion
          ) {
            answerText = subQuestion.acceptableAnswers?.join("\n");
          }

          defaultReturn = {
            questionText: subQuestion.questionText,
            answerText: answerText,
          };
        }
      }
    }
  }

  return defaultReturn;
}

/**
 * Utility function to find a question by its index
 *
 * @param test The test object containing all sections and questions
 * @param index The index of the question to find
 * @returns The found question or undefined if not found
 */
export function findQuestionByIndex(
  test: Test,
  index: number
): Question | undefined {
  for (const section of test.sections) {
    for (const question of section.questions) {
      // Check if the index is within this question's range
      if (question.index <= index && index <= question.partialEndingIndex) {
        return question;
      }
    }
  }

  return undefined;
}

/**
 * Utility function to find a subquestion by question index and subindex
 *
 * @param test The test object containing all sections and questions
 * @param index The main question index
 * @param subIndex The relative index of the subquestion (0-based)
 * @returns The subquestion ID and its parent question ID, or undefined if not found
 */
export function findSubQuestionByIndex(
  test: Test,
  index: number
): { questionId: string; subQuestionId: string } | undefined {
  for (const section of test.sections) {
    for (const question of section.questions) {
      // Check if the index is within this question's range
      if (question.index <= index && index <= question.partialEndingIndex) {
        // If this question has subquestions
        if (question.subQuestions && question.subQuestions.length > 0) {
          // Calculate the relative index within this question's subquestions
          const subIndex = index - question.index;

          // Get the subquestion at this index if it exists
          if (subIndex < question.subQuestions.length) {
            const subQuestion = question.subQuestions[subIndex];
            return {
              questionId: question.id,
              subQuestionId: subQuestion.subId,
            };
          }
        }

        // Found the question but no matching subquestion
        return undefined;
      }
    }
  }

  // Question not found
  return undefined;
}
