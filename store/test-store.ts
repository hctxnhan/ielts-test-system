import { getSectionStats, getTestStats } from "@testComponents/lib/test-utils";
import { QuestionPluginRegistry } from "@testComponents/lib/question-plugin-system";
import type {
  Question,
  Section, 
  SectionResult,
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
};

// Type for the submission function
export type SubmitResultFn = (
  testId: number,
  results: TestResult,
  config?: TestConfig
) => Promise<any>;

type ScoreEssayFn = (param: {
  text: string;
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
    answer: unknown,
    subQuestionId?: string
  ) => Promise<void>;
  completeTest: () => void;
  resetTest: () => void;
  updateTimeRemaining: (time: number) => void;
  handleTimeEnd: () => void;
  setSubmitResultFn: (fn: SubmitResultFn) => void;
  submitTestResults: (testId: number) => Promise<boolean>;
  updatePassageContent: (sectionId: string, content: string) => void;
  updateQuestionContent: (questionId: string, content: string) => void;
  // Getters
  questionById: (id: string, subId?: string) => Question | null;
  // Computed
  currentSection: () => Section | null;

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

// Helper functions for answer management
function createUserAnswer(params: {
  questionId: string;
  answer: unknown;
  subQuestionId?: string;
  question: Question;
  currentSection: Section;
  scoringResult: {
    isCorrect: boolean;
    score: number;
    maxScore: number;
    feedback?: string;
  };
}): UserAnswer {
  const { questionId, answer, subQuestionId, question, currentSection, scoringResult } = params;
  
  return {
    questionId,
    answer,
    isCorrect: scoringResult.isCorrect,
    score: scoringResult.score,
    maxScore: scoringResult.maxScore,
    subQuestionId,
    sectionId: currentSection.id,
    questionType: question.type,
    questionIndex: question.index || 0,
    parentQuestionId: subQuestionId ? questionId : undefined,
    feedback: scoringResult.feedback || "",
  };
}

function createFallbackUserAnswer(params: {
  questionId: string;
  answer: unknown;
  subQuestionId?: string;
  question: Question;
  currentSection: Section;
  error: string;
}): UserAnswer {
  const { questionId, answer, subQuestionId, question, currentSection, error } = params;
  
  return {
    questionId,
    answer,
    isCorrect: false,
    score: 0,
    maxScore: question.points || 0,
    subQuestionId,
    sectionId: currentSection.id,
    questionType: question.type,
    questionIndex: question.index || 0,
    parentQuestionId: subQuestionId ? questionId : undefined,
    feedback: `Scoring error: ${error}`,
  };
}

export const useTestStore = create<TestState>()((set, get) => {
  // Helper function to update progress with a new answer
  const updateProgressWithAnswer = (userAnswer: UserAnswer, answerKey: string) => {
    const { progress } = get();
    if (!progress) return;

    set({
      progress: {
        ...progress,
        answers: {
          ...progress.answers,
          [answerKey]: userAnswer,
        },
      },
    });
  };

  return {
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

  submitAnswer: async (questionId: string, answer: any, subQuestionId?: string) => {
    const { progress, currentTest, scoreEssayFn } = get();
    if (!progress || !currentTest) return;

    const currentSection = get().currentSection();
    const question = get().questionById(questionId);

    if (!question || !currentSection) return;

    try {
      // Use plugin system for scoring
      const scoringResult = await QuestionPluginRegistry.scoreQuestion({
        question,
        answer,
        subQuestionId,
        aiScoringFn: scoreEssayFn || undefined,
      });

      // Create user answer with plugin scoring results
      const userAnswer = createUserAnswer({
        questionId,
        answer,
        subQuestionId,
        question,
        currentSection,
        scoringResult,
      });

      // Update progress with the new answer
      updateProgressWithAnswer(userAnswer, subQuestionId || questionId);
      
    } catch (error) {
      console.error("Plugin scoring failed:", error);
      
      // Fallback: create basic user answer with zero score
      const fallbackAnswer = createFallbackUserAnswer({
        questionId,
        answer,
        subQuestionId,
        question,
        currentSection,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      updateProgressWithAnswer(fallbackAnswer, subQuestionId || questionId);
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
      sectionResults: null,
      realTestMode: false,
      customMode: {
        enabled: false,
        includedSections: [],
        includedQuestionTypes: [],
      },
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

  questionById(id: string, subId?: string): Question | null {
    const { currentTest, progress } = get();
    if (!currentTest || !progress) return null;

    const currentSection = currentTest.sections[progress.currentSectionIndex];
    const question = currentSection.questions.find((q) => q.id === id);

    if (question && subId) {
      // For sub-questions, we still return the main question
      // The plugin system will handle sub-question logic
      return question;
    }

    return question || null;
  },

  currentSection: () => {
    const { currentTest, progress } = get();
    if (!currentTest || !progress) return null;

    return currentTest.sections[progress.currentSectionIndex];
  },
  };
});
