import { getTestStats } from "@/lib/test-utils";
import type {
  MultipleChoiceOption,
  SubQuestionMeta,
  Test,
  TestProgress,
  UserAnswer,
} from "@/lib/types";
import { create } from "zustand";

// Type for the submission function
type SubmitResultFn = (
  testId: number,
  results: {
    totalScore: number;
    maxPossibleScore: number;
  }
) => Promise<any>;

interface TestState {
  currentTest: Test | null;
  progress: TestProgress | null;
  submitResultFn: SubmitResultFn | null;

  // Actions
  loadTest: (test: Test) => void;
  startTest: () => void;
  submitAnswer: (
    questionId: string,
    answer: any,
    subQuestionId?: string
  ) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeTest: () => void;
  resetTest: () => void;
  updateTimeRemaining: (time: number) => void;
  setSubmitResultFn: (fn: SubmitResultFn) => void;
  submitTestResults: (testId: number) => Promise<boolean>;
  // Getters
  questionById: (id: string, subId?: string) => any;
  // Computed
  currentSection: () => any;
  isLastQuestion: () => boolean;
}

export const useTestStore = create<TestState>()((set, get) => ({
  currentTest: null,
  progress: null,
  submitResultFn: null,

  loadTest: (test: Test) => {
    set({ currentTest: test });
  },

  startTest: () => {
    const { currentTest } = get();
    if (!currentTest) return;

    set({
      progress: {
        testId: currentTest.id,
        currentSectionIndex: 0,
        currentQuestionIndex: 0,
        timeRemaining: currentTest.totalDuration,
        answers: {},
        completed: false,
        startedAt: new Date().toISOString(),
      },
    });
  },

  setSubmitResultFn: (fn: SubmitResultFn) => {
    set({ submitResultFn: fn });
  },

  submitTestResults: async (testId: number): Promise<boolean> => {
    const { currentTest, progress, submitResultFn } = get();

    if (!currentTest || !progress || !progress.answers || !submitResultFn) {
      console.error(
        "Cannot submit test results: missing test data or submission function"
      );
      return false;
    }

    try {
      const testStats = getTestStats(currentTest, progress.answers);
      const totalScore = testStats.totalScore;
      const maxPossibleScore = testStats.maxPossibleScore;

      // Call the submission function
      await submitResultFn(testId, {
        totalScore,
        maxPossibleScore,
      });

      return true;
    } catch (error) {
      console.error("Error submitting test results:", error);
      return false;
    }
  },

  submitAnswer: (questionId: string, answer: any, subQuestionId?: string) => {
    const { progress, currentTest } = get();
    if (!progress || !currentTest) return;

    const currentSection = get().currentSection();
    const question = get().questionById(questionId);

    if (!question || !currentSection) return;

    // Determine the answer key - if a subQuestionId is provided, use that
    const answerKey = subQuestionId || questionId;

    // Find the relevant subQuestion if one exists
    const subQuestion = question.subQuestions?.find(
      (sq: { subId: string }) => sq.subId === subQuestionId
    );

    // Find the question index in the test
    let questionIndex = question.index !== undefined ? question.index : -1;
    if (questionIndex === -1) {
      // Try to determine the index by finding the question in all sections
      for (let i = 0; i < currentTest.sections.length; i++) {
        const section = currentTest.sections[i];
        const indexInSection = section.questions.findIndex(
          (q) => q.id === questionId
        );
        if (indexInSection !== -1) {
          questionIndex = indexInSection;
          break;
        }
      }
    }

    let isCorrect = false;
    let score = 0;
    const maxScore = subQuestion?.points || question.points;

    // If we have a subQuestion, use its correct answer, otherwise use the question's
    const correctAnswer = subQuestion?.correctAnswer;
    if (subQuestion && correctAnswer) {
      isCorrect = answer === correctAnswer;
      score = isCorrect ? subQuestion.points : 0;
    } else {
      // Handle main question scoring as before
      const scoringStrategy = question.scoringStrategy || "partial";

      switch (question.type) {
        case "multiple-choice":
          isCorrect = question.options.some(
            (option: MultipleChoiceOption) =>
              option.id === answer && option.isCorrect
          );

          score = isCorrect ? question.points : 0;
          break;

        case "completion":
          if (answer && typeof answer === "object") {
            // Calculate score based on scoring strategy
            if (scoringStrategy === "partial") {
              // Partial credit based on number of correct answers
              const subQuestion = question.subQuestions?.find(
                (sq: { subId: string }) => sq.subId === subQuestionId
              );

              isCorrect = subQuestion.correctAnswer === answer;

              score = isCorrect ? subQuestion.points : 0;
            } else {
              const totalSubQuestions = question.subQuestions?.length || 0;
              const correctCount = Object.entries(answer).filter(
                ([key, value]) =>
                  question.subQuestions?.some(
                    (sq: SubQuestionMeta) =>
                      sq.subId === key && sq.correctAnswer === value
                  )
              ).length;
              isCorrect = correctCount === totalSubQuestions;
              score = isCorrect ? question.points : 0;
            }
          }
          break;

        case "matching":
          // Check each match
          if (answer && typeof answer === "object") {
            // Calculate score based on scoring strategy
            if (scoringStrategy === "partial") {
              // Partial credit based on number of correct matches
              const subQuestion = question.subQuestions?.find(
                (sq: { subId: string }) => sq.subId === subQuestionId
              );

              isCorrect = subQuestion?.correctAnswer === answer;
              score = isCorrect ? subQuestion?.points || 0 : 0;
            } else {
              const totalSubQuestions = question.subQuestions?.length || 0;
              const correctCount = Object.entries(answer).filter(
                ([key, value]) =>
                  question.subQuestions?.some(
                    (sq: SubQuestionMeta) =>
                      sq.subId === key && sq.correctAnswer === value
                  )
              ).length;
              isCorrect = correctCount === totalSubQuestions;
              score = isCorrect ? question.points : 0;
            }
          }
          break;

        case "true-false-not-given":
          // Check each statement
          if (answer && typeof answer === "object") {
            const totalStatements = question.statements.length;
            const correctCount = Object.entries(answer).filter(
              ([key, value]) =>
                question.statements[Number.parseInt(key)].correctAnswer ===
                value
            ).length;

            // Calculate score based on scoring strategy
            if (scoringStrategy === "partial") {
              // Partial credit based on number of correct answers
              score = Math.round(
                (correctCount / totalStatements) * question.points
              );
              isCorrect = correctCount === totalStatements;
            } else {
              // All-or-nothing
              isCorrect = correctCount === totalStatements;
              score = isCorrect ? question.points : 0;
            }
          }

          break;

        case "matching-headings":
          // Check each heading
          if (answer && typeof answer === "object") {
            const totalHeadings = question.headings.length;
            const correctCount = Object.entries(answer).filter(
              ([key, value]) =>
                question.headings[Number.parseInt(key)].correctAnswer === value
            ).length;

            // Calculate score based on scoring strategy
            if (scoringStrategy === "partial") {
              // Partial credit based on number of correct answers
              score = Math.round(
                (correctCount / totalHeadings) * question.points
              );
              isCorrect = correctCount === totalHeadings;
            } else {
              // All-or-nothing
              isCorrect = correctCount === totalHeadings;
              score = isCorrect ? question.points : 0;
            }
          }
          break;

        case "short-answer":
          if (answer && typeof answer === "object") {
            const totalAnswers = Object.keys(question.questions).length;
            const correctCount = Object.entries(answer).filter(
              ([key, value]) =>
                question.correctAnswers[Number.parseInt(key)] === value
            ).length;

            // Calculate score based on scoring strategy
            if (scoringStrategy === "partial") {
              // Partial credit based on number of correct answers
              score = Math.round(
                (correctCount / totalAnswers) * question.points
              );
              isCorrect = correctCount === totalAnswers;
            } else {
              // All-or-nothing
              isCorrect = correctCount === totalAnswers;
              score = isCorrect ? question.points : 0;
            }
          }

        case "labeling":
          // Check each label
          if (answer && typeof answer === "object") {
            const totalLabels = question.labels.length;
            const correctCount = Object.entries(answer).filter(
              ([key, value]) =>
                question.labels[Number.parseInt(key)].correctAnswer === value
            ).length;

            // Calculate score based on scoring strategy
            if (scoringStrategy === "partial") {
              // Partial credit based on number of correct answers
              score = Math.round(
                (correctCount / totalLabels) * question.points
              );
              isCorrect = correctCount === totalLabels;
            } else {
              // All-or-nothing
              isCorrect = correctCount === totalLabels;
              score = isCorrect ? question.points : 0;
            }
          }
          break;

        case "pick-from-list":
          // Check each pick
          if (answer && typeof answer === "object") {
            const totalPicks = question.picks.length;
            const correctCount = Object.entries(answer).filter(
              ([key, value]) =>
                question.picks[Number.parseInt(key)].correctAnswer === value
            ).length;

            // Calculate score based on scoring strategy
            if (scoringStrategy === "partial") {
              // Partial credit based on number of correct answers
              score = Math.round((correctCount / totalPicks) * question.points);
              isCorrect = correctCount === totalPicks;
            } else {
              // All-or-nothing
              isCorrect = correctCount === totalPicks;
              score = isCorrect ? question.points : 0;
            }
          }
          break;

        case "writing-task1":
        case "writing-task2":
          // For writing tasks, we store the answer and any AI feedback
          if (typeof answer === "object" && answer.score !== undefined) {
            // This is an AI-scored submission
            score = answer.score;
            // Consider correct if score is above 70% of max points
            isCorrect = score >= maxScore * 0.7;
            // Use the text as the actual answer
            answer = answer.text;
          } else if (typeof answer === "object" && answer.text !== undefined) {
            // This is just the essay text without scoring
            answer = answer.text;
            isCorrect = false;
            score = 0;
          }
          break;

        default:
          isCorrect = false;
          score = 0;
      }
    }

    const userAnswer: UserAnswer = {
      questionId,
      answer,
      isCorrect,
      score,
      maxScore,
      subQuestionId,
      sectionId: currentSection.id,
      questionType: question.type,
      questionIndex,
      parentQuestionId: subQuestionId ? questionId : undefined,
    };

    // Create answer object with format { subquestionId: answerId }
    set({
      progress: {
        ...progress,
        answers: {
          ...progress.answers,
          [answerKey]: userAnswer,
        },
      },
    });
  },

  nextQuestion: () => {
    const { progress, currentTest } = get();
    if (!progress || !currentTest) return;

    const currentSection = currentTest.sections[progress.currentSectionIndex];
    const isLastQuestionInSection =
      progress.currentQuestionIndex === currentSection.questions.length - 1;
    const isLastSection =
      progress.currentSectionIndex === currentTest.sections.length - 1;

    if (isLastQuestionInSection) {
      if (isLastSection) {
        // End of test
        get().completeTest();
      } else {
        // Move to next section
        set({
          progress: {
            ...progress,
            currentSectionIndex: progress.currentSectionIndex + 1,
            currentQuestionIndex: 0,
          },
        });
      }
    } else {
      // Move to next question in current section
      set({
        progress: {
          ...progress,
          currentQuestionIndex: progress.currentQuestionIndex + 1,
        },
      });
    }
  },

  previousQuestion: () => {
    const { progress, currentTest } = get();
    if (!progress || !currentTest) return;

    const isFirstQuestionInSection = progress.currentQuestionIndex === 0;
    const isFirstSection = progress.currentSectionIndex === 0;

    if (isFirstQuestionInSection) {
      if (isFirstSection) {
        // Already at the beginning of the test
        return;
      } else {
        // Move to previous section
        const previousSection =
          currentTest.sections[progress.currentSectionIndex - 1];
        set({
          progress: {
            ...progress,
            currentSectionIndex: progress.currentSectionIndex - 1,
            currentQuestionIndex: previousSection.questions.length - 1,
          },
        });
      }
    } else {
      // Move to previous question in current section
      set({
        progress: {
          ...progress,
          currentQuestionIndex: progress.currentQuestionIndex - 1,
        },
      });
    }
  },

  completeTest: () => {
    const { progress, currentTest } = get();
    if (!progress || !currentTest) return;

    // Calculate total score using our utility function for consistency
    // This ensures we properly account for both main questions and sub-questions
    const totalScore = Object.values(progress.answers).reduce(
      (sum, answer) => sum + (answer.score || 0),
      0
    );

    set({
      progress: {
        ...progress,
        completed: true,
        completedAt: new Date().toISOString(),
        score: totalScore,
      },
    });
  },

  resetTest: () => {
    set({
      currentTest: null,
      progress: null,
    });
  },

  updateTimeRemaining: (time: number) => {
    const { progress } = get();
    if (!progress) return;

    set({
      progress: {
        ...progress,
        timeRemaining: time,
      },
    });
  },

  questionById(id, subId) {
    const { currentTest, progress } = get();
    if (!currentTest || !progress) return null;

    const currentSection = currentTest.sections[progress.currentSectionIndex];
    const question = currentSection.questions.find((q) => q.id === id);

    if (question && subId) {
      return question.subQuestions?.find((sq) => sq.subId === subId);
    }

    return question;
  },

  currentSection: () => {
    const { currentTest, progress } = get();
    if (!currentTest || !progress) return null;

    return currentTest.sections[progress.currentSectionIndex];
  },

  isLastQuestion: () => {
    const { currentTest, progress } = get();
    if (!currentTest || !progress) return false;

    const isLastSection =
      progress.currentSectionIndex === currentTest.sections.length - 1;
    const currentSection = currentTest.sections[progress.currentSectionIndex];
    const isLastQuestionInSection =
      progress.currentQuestionIndex === currentSection.questions.length - 1;

    return isLastSection && isLastQuestionInSection;
  },
}));
