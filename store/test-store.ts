import { getSectionStats, getTestStats } from "@testComponents/lib/test-utils";
import type {
  MultipleChoiceOption,
  SectionResult,
  SubQuestionMeta,
  Test,
  TestProgress,
  TestResult,
  UserAnswer,
} from "@testComponents/lib/types";
import { create } from "zustand";

export type TestConfig = {
  customMode?: boolean;
  selectedSections?: string[];
  selectedTypes?: string[];
}

// Type for the submission function
export type SubmitResultFn = (
  testId: number,
  results: TestResult,
  config?: TestConfig
) => Promise<any>;

type ScoreEssayFn = (param: {
  prompt: string;
  essay: string;
  scoringPrompt: string;
}) => Promise<{
  score: number;
  feedback: string;
  ok: boolean;
  error?: string;
}>;

interface TestState {
  currentTest: Test | null;
  progress: TestProgress | null;
  submitResultFn: SubmitResultFn | null;
  sectionResults: TestResult | null;
  loadTest: (
    test: Test,
    options?: {
      customMode?: boolean;
      selectedSections?: string[];
      selectedTypes?: string[];
      realTestMode?: boolean;
    }
  ) => void;
  startTest: () => void;
  submitAnswer: (
    questionId: string,
    answer: any,
    subQuestionId?: string
  ) => void;
  completeTest: () => void;
  resetTest: () => void;
  updateTimeRemaining: (time: number) => void;
  handleTimeEnd: () => void;
  setSubmitResultFn: (fn: SubmitResultFn) => void;
  submitTestResults: (testId: number) => Promise<boolean>;
  updatePassageContent: (sectionId: string, content: string) => void;
  updateQuestionContent: (questionId: string, content: string) => void;
  // Getters
  questionById: (id: string, subId?: string) => any;
  // Computed
  currentSection: () => any;

  scoreEssayFn: ScoreEssayFn | null;
  setScoreEssayFn: (fn: ScoreEssayFn) => void;
  // Real Test Mode
  realTestMode: boolean;
  setRealTestMode: (enabled: boolean) => void;
  // Custom Mode
  customMode: {
    enabled: boolean;
    includedSections: string[];
    includedQuestionTypes: string[];
  };
  setCustomMode: (mode: Partial<TestState["customMode"]>) => void;
  resetCustomMode: () => void;
}

export const useTestStore = create<TestState>()((set, get) => ({
  currentTest: null,
  progress: null,
  submitResultFn: null,
  scoreEssayFn: null,
  sectionResults: null,
  realTestMode: false,
  customMode: {
    enabled: false,
    includedSections: [],
    includedQuestionTypes: [],
  },

  setRealTestMode: (enabled: boolean) => set({ realTestMode: enabled }),

  setCustomMode: (mode) =>
    set((state) => ({ customMode: { ...state.customMode, ...mode } })),
  resetCustomMode: () =>
    set({
      customMode: {
        enabled: false,
        includedSections: [],
        includedQuestionTypes: [],
      },
    }),

  loadTest: (
    test: Test,
    options?: {
      customMode?: boolean;
      selectedSections?: string[];
      selectedTypes?: string[];
      realTestMode?: boolean;
    }
  ) => {
    // Update states based on options if provided
    if (options) {
      if (options.realTestMode !== undefined) {
        set({ realTestMode: options.realTestMode });
      }

      if (options.customMode !== undefined) {
        const newCustomMode = {
          enabled: options.customMode,
          includedSections: options.selectedSections || [],
          includedQuestionTypes: options.selectedTypes || [],
        };
        set({ customMode: newCustomMode });
      }
    }

    // Just load the test as-is, no filtering
    set({ currentTest: test });
  },

  startTest: () => {
    const { currentTest } = get();
    if (!currentTest) return;

    set({
      progress: {
        testId: currentTest.id?.toString() || "",
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
    const { currentTest, progress, submitResultFn, customMode } = get();

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

      // Calculate section results for display
      const sectionResults: SectionResult[] = currentTest.sections.map(
        (section) => {
          const sectionStats = getSectionStats(section, progress.answers);

          return {
            title: section.title,
            id: section.id,
            correctCount: sectionStats.sectionCorrectAnswers,
            incorrectCount: sectionStats.sectionIncorrectAnswers,
            unansweredCount: sectionStats.sectionUnansweredQuestions,
            totalCount: sectionStats.sectionTotalQuestions,
            totalScore: sectionStats.sectionScore,
            maxScore: sectionStats.sectionTotalScore,
            percentageScore: sectionStats.sectionPercentage,
          };
        }
      );

      const testResults = {
        totalScore,
        maxPossibleScore,
        totalQuestions: testStats.totalQuestions,
        answeredQuestions: testStats.answeredQuestions,
        correctAnswers: testStats.correctAnswers,
        percentageScore: testStats.percentageScore,
        sectionResults,
        answers: progress.answers,
        startedAt: progress.startedAt,
        completedAt: new Date().toISOString(),
      };

      set({
        sectionResults: testResults,
      });

      await submitResultFn(
        testId,
        {
          ...testResults,
          sectionResults,
        },
        {
          customMode: customMode.enabled,
          selectedSections: customMode.includedSections,
          selectedTypes: customMode.includedQuestionTypes,
        }
      );

      return true;
    } catch (error) {
      console.error("Error submitting test results:", error);
      return false;
    }
  },

  setScoreEssayFn: (fn: ScoreEssayFn) => {
    set({ scoreEssayFn: fn });
  },

  submitAnswer: (questionId: string, answer: any, subQuestionId?: string) => {
    const { progress, currentTest } = get();
    if (!progress || !currentTest) return;

    const currentSection = get().currentSection();
    const question = get().questionById(questionId);

    if (!question || !currentSection) return;

    // Determine the answer key - if a subQuestionId is provided, use that
    const answerKey = subQuestionId || questionId;
    let feedback = "";

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
    }

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
        if (scoringStrategy === "partial") {
          const subQuestion = question.subQuestions?.find(
            (sq: SubQuestionMeta) => sq.subId === subQuestionId
          );

          if (subQuestion) {
            const normalizedAnswer = answer
              ?.trim()
              .toLowerCase()
              .replace(/\s+/g, " ");
            isCorrect =
              subQuestion.acceptableAnswers?.some(
                (acceptableAnswer: string) =>
                  acceptableAnswer.trim().toLowerCase().replace(/\s+/g, " ") ===
                  normalizedAnswer
              ) || false;

            score = isCorrect ? subQuestion.points : 0;
          }
        } else {
          const totalSubQuestions = question.subQuestions?.length || 0;
          const correctCount = Object.entries(answer).filter(([key, value]) =>
            question.subQuestions?.some(
              (sq: SubQuestionMeta) =>
                sq.subId === key &&
                sq.acceptableAnswers?.some((acceptableAnswer: string) => {
                  const normalizedAcceptableAnswer = acceptableAnswer
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, " ");
                  const normalizedValue = (value as string)
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, " ");
                  return normalizedAcceptableAnswer === normalizedValue;
                })
            )
          ).length;

          isCorrect = correctCount === totalSubQuestions;
          score = isCorrect ? question.points : 0;
        }
        break;

      case "matching":
      case "matching-headings":
      case "labeling":
        if (scoringStrategy === "partial") {
          const subQuestion = question.subQuestions?.find(
            (sq: { subId: string }) => sq.subId === subQuestionId
          );

          isCorrect = subQuestion?.correctAnswer === answer;
          score = isCorrect ? subQuestion?.points || 0 : 0;
        } else {
          const totalSubQuestions = question.subQuestions?.length || 0;
          const correctCount = Object.entries(answer).filter(([key, value]) =>
            question.subQuestions?.some(
              (sq: SubQuestionMeta) =>
                sq.subId === key && sq.correctAnswer === value
            )
          ).length;

          isCorrect = correctCount === totalSubQuestions;
          score = isCorrect ? question.points : 0;
        }
        break;

      case "pick-from-a-list":
        if (scoringStrategy === "partial") {
          // For partial scoring, check if the current answer (item) is correct
          // The answer parameter here is the item ID being selected
          isCorrect = question.subQuestions?.some(
            (sq: SubQuestionMeta) => sq.item === answer
          );

          score = isCorrect ? question.points : 0;
        } else {
          // For all-or-nothing scoring
          const totalSubQuestions = question.subQuestions?.length || 0;
          const totalAnswers = Object.entries(answer)?.length || 0;

          if (totalAnswers !== totalSubQuestions) {
            isCorrect = false;
            score = 0;
            break;
          }

          // Get all selected items (values from the answer object)
          const selectedItems = Object.values(answer);
          
          // Get all correct items from subQuestions
          const correctItems = question.subQuestions?.map((sq: SubQuestionMeta) => sq.item) || [];
          
          // Check if all selected items are correct (regardless of order)
          const allItemsCorrect = selectedItems.every(item => correctItems.includes(item));
          
          // Check if we have the right number of correct items
          const correctCount = selectedItems.filter(item => correctItems.includes(item)).length;
          
          isCorrect = allItemsCorrect && correctCount === totalSubQuestions;
          score = isCorrect ? question.points : 0;
        }
        break;

      case "true-false-not-given":
        if (scoringStrategy === "partial") {
        } else {
          const totalSubQuestions = question.subQuestions?.length || 0;
          const correctCount = Object.entries(answer).filter(([key, value]) =>
            question.subQuestions?.some(
              (sq: SubQuestionMeta) =>
                sq.subId === key && sq.correctAnswer === value
            )
          ).length;

          isCorrect = correctCount === totalSubQuestions;
          score = isCorrect ? question.points : 0;
        }

        break;

      case "short-answer":
        if (scoringStrategy === "partial") {
          const subQuestion = question.subQuestions?.find(
            (sq: { subId: string }) => sq.subId === subQuestionId
          );

          if (subQuestion) {
            const acceptableAnswers =
              (subQuestion as any).acceptableAnswers || [];
            const normalizedAnswer = answer
              .trim()
              .toLowerCase()
              .replace(/\s+/g, " ");
            isCorrect = acceptableAnswers.some(
              (acceptableAnswer: string) =>
                acceptableAnswer.trim().toLowerCase().replace(/\s+/g, " ") ===
                normalizedAnswer
            );
            score = isCorrect ? subQuestion.points : 0;
          }
        } else {
          const totalQuestions = question.questions?.length || 0;
          const correctCount = Object.entries(answer).filter(([key, value]) => {
            const sq = question.subQuestions?.find(
              (sq: SubQuestionMeta & { acceptableAnswers?: string[] }) =>
                sq.subId === key &&
                sq.acceptableAnswers?.some((acceptableAnswer: string) => {
                  const normalizedAcceptableAnswer = acceptableAnswer
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, " ");
                  const normalizedValue = (value as string)
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, " ");
                  return normalizedAcceptableAnswer === normalizedValue;
                })
            );
            return !!sq;
          }).length;

          isCorrect = correctCount === totalQuestions;
          score = isCorrect ? question.points : 0;
        }
        break;

      case "writing-task1":
      case "writing-task2":
        if (typeof answer === "object" && answer !== null && "text" in answer) {
          const aiScore = answer.score as number | undefined;
          score = aiScore ?? 0;
          isCorrect = true;
        } else {
          console.warn(
            "Invalid answer format received for writing task:",
            answer
          );
          score = 0;
          feedback = "";
          isCorrect = false;
        }
        break;

      default:
        isCorrect = false;
        score = 0;
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
      feedback,
    };

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

  handleTimeEnd: () => {
    const { progress } = get();
    if (!progress || progress.completed) return;

    // Update time to 0 and complete the test
    set({
      progress: {
        ...progress,
        timeRemaining: 0,
        completed: true,
        completedAt: new Date().toISOString(),
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
  updatePassageContent: (sectionId: string, content: string) => {
    const { currentTest } = get();
    if (!currentTest) return;

    const updatedSections = currentTest.sections.map((section) => {
      if (section.id === sectionId && section.readingPassage) {
        return {
          ...section,
          readingPassage: {
            ...section.readingPassage,
            content: content,
          },
        };
      }
      return section;
    });

    set({
      currentTest: {
        ...currentTest,
        sections: updatedSections,
      },
    });
  },

  updateQuestionContent: (questionId: string, content: string) => {
    const { currentTest } = get();
    if (!currentTest) return;

    const updatedSections = currentTest.sections.map((section) => ({
      ...section,
      questions: section.questions.map((question) => {
        if (question.id === questionId) {
          return {
            ...question,
            text: content,
          };
        }
        return question;
      }),
    }));

    set({
      currentTest: {
        ...currentTest,
        sections: updatedSections,
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
}));
