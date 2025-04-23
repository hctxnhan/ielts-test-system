import { getSectionStats, getTestStats } from "@testComponents/lib/test-utils";
import { getQuestionText } from "@testComponents/lib/test";
import type {
  MultipleChoiceOption,
  SubQuestionMeta,
  Test,
  TestProgress,
  UserAnswer,
} from "@testComponents/lib/types";
import { create } from "zustand";

// Type for the submission function
export type SubmitResultFn = (
  testId: number,
  results: TestResult
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

// Define a structure for the section results
interface QuestionResult {
  questionNumber: number;
  questionText?: string;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  isAnswered: boolean;
}

export interface SectionResult {
  title: string;
  id: string;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalCount: number;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  questions: QuestionResult[];
}

export interface TestResult {
  totalScore: number;
  maxPossibleScore: number;
  sectionResults: SectionResult[];
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  percentageScore: number;
  startedAt: string;
  completedAt: string;
}

interface TestState {
  currentTest: Test | null;
  progress: TestProgress | null;
  submitResultFn: SubmitResultFn | null;
  sectionResults: TestResult | null;
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

  scoreEssayFn: ScoreEssayFn | null;
  setScoreEssayFn: (fn: ScoreEssayFn) => void;
}

export const useTestStore = create<TestState>()((set, get) => ({
  currentTest: null,
  progress: null,
  submitResultFn: null,
  scoreEssayFn: null,
  sectionResults: null,

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

      // Calculate section results for display
      const sectionResults: SectionResult[] = currentTest.sections.map(
        (section) => {
          const sectionQuestions: QuestionResult[] = [];

          const sectionStats = getSectionStats(section, progress.answers);

          // Process each question in the section
          section.questions.forEach((question, qIndex) => {
            // Handle questions with subquestions
            if (
              question.scoringStrategy === "partial" &&
              question.partialEndingIndex !== undefined &&
              question.subQuestions?.length
            ) {
              // Handle partial questions with subquestions
              question.subQuestions.forEach((subQuestion, subIndex) => {
                const displayNumber = (question.index || 0) + subIndex + 1;
                const subId = subQuestion.subId;
                const answer = subId ? progress.answers[subId] : null;

                // Get the correct answer text
                const { questionText, answerText } = currentTest
                  ? getQuestionText(currentTest, question.id, subQuestion.subId)
                  : { questionText: undefined, answerText: undefined };

                sectionQuestions.push({
                  questionNumber: displayNumber,
                  questionText,
                  userAnswer: answer ? answer.answerReadable : null,
                  correctAnswer: answerText || "No correct answer provided",
                  isCorrect: answer ? !!answer.isCorrect : false,
                  isAnswered: !!answer,
                });
              });
            } else {
              // Handle standard questions
              const answer = progress.answers[question.id];
              const displayNumber =
                (question.index !== undefined ? question.index : 0) + 1;

              // Get the correct answer text for main questions
              const { questionText, answerText } = currentTest
                ? getQuestionText(currentTest, question.id)
                : { questionText: undefined, answerText: undefined };

              sectionQuestions.push({
                questionNumber: displayNumber,
                questionText,
                userAnswer: answer ? answer.answerReadable : null,
                correctAnswer: answerText,
                isCorrect: answer ? !!answer.isCorrect : false,
                isAnswered: !!answer,
              });
            }
          });

          return {
            title: section.title,
            id: section.id,
            correctCount: sectionStats.sectionCorrectAnswers,
            incorrectCount: sectionStats.sectionIncorrectAnswers,
            unansweredCount: sectionStats.sectionUnansweredQuestions,
            totalCount: sectionStats.sectionTotalQuestions,
            totalScore: sectionStats.sectionTotalScore,
            maxScore: sectionStats.sectionTotalScore,
            questions: sectionQuestions,
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
        startedAt: progress.startedAt,
        completedAt: new Date().toISOString(),
      };

      set({
        sectionResults: testResults,
      });

      await submitResultFn(testId, {
        ...testResults,
        sectionResults: sectionResults.map((section) => ({
          ...section,
          questions: section.questions.filter((q) => q.isAnswered),
        })),
      });

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
    let answerReadable = [];

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

        const selected = question.items.find(
          (option: MultipleChoiceOption) => option.id === answer
        );
        answerReadable = [["", selected?.text]];

        score = isCorrect ? question.points : 0;
        break;

      case "completion":
        if (scoringStrategy === "partial") {
          const subQuestion = question.subQuestions?.find(
            (sq: { subId: string }) => sq.subId === subQuestionId
          );

          isCorrect = subQuestion.correctAnswer === answer;

          answerReadable = [["", answer]];

          score = isCorrect ? subQuestion.points : 0;
        } else {
          const totalSubQuestions = question.subQuestions?.length || 0;
          const correctCount = Object.entries(answer).filter(([key, value]) =>
            question.subQuestions?.some(
              (sq: SubQuestionMeta) =>
                sq.subId === key && sq.correctAnswer === value
            )
          ).length;

          question.subQuestions?.forEach(
            (sq: SubQuestionMeta, index: number) => {
              const subAnswer = answer[sq.subId];

              answerReadable.push([`${index + 1}`, subAnswer]);
            }
          );

          isCorrect = correctCount === totalSubQuestions;
          score = isCorrect ? question.points : 0;
        }
        break;

      case "matching":
      case "matching-headings":
      case "labeling":
      case "pick-from-list":
        if (scoringStrategy === "partial") {
          const subQuestion = question.subQuestions?.find(
            (sq: { subId: string }) => sq.subId === subQuestionId
          );

          isCorrect = subQuestion?.correctAnswer === answer;
          score = isCorrect ? subQuestion?.points || 0 : 0;

          const selectedOption = question.options?.find(
            (option: { id: string }) => option.id === answer
          );

          answerReadable = [["", selectedOption?.text || answer]];
        } else {
          const totalSubQuestions = question.subQuestions?.length || 0;
          const correctCount = Object.entries(answer).filter(([key, value]) =>
            question.subQuestions?.some(
              (sq: SubQuestionMeta) =>
                sq.subId === key && sq.correctAnswer === value
            )
          ).length;

          question.subQuestions?.forEach(
            (sq: SubQuestionMeta, index: number) => {
              const subAnswer = answer[sq.subId];

              // Find the matching item and options
              const item = question.items?.find(
                (item: { id: string }) => item.id === sq.subId
              );
              const selectedOption = question.options?.find(
                (option: { id: string }) => option.id === subAnswer
              );

              answerReadable.push([
                item?.text || `${index + 1}`,
                selectedOption?.text || subAnswer,
              ]);
            }
          );

          isCorrect = correctCount === totalSubQuestions;
          score = isCorrect ? question.points : 0;
        }
        break;

      case "true-false-not-given":
        if (scoringStrategy === "partial") {
          answerReadable = [["", answer]];
        } else {
          const totalSubQuestions = question.subQuestions?.length || 0;
          const correctCount = Object.entries(answer).filter(([key, value]) =>
            question.subQuestions?.some(
              (sq: SubQuestionMeta) =>
                sq.subId === key && sq.correctAnswer === value
            )
          ).length;

          question.subQuestions?.forEach(
            (sq: SubQuestionMeta, index: number) => {
              const subAnswer = answer[sq.subId];

              const statement = question.statements?.find(
                (stmt: { id: string }) => stmt.id === sq.subId
              );

              answerReadable.push([
                statement?.text || `${index + 1}`,
                subAnswer,
              ]);
            }
          );

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
            isCorrect = acceptableAnswers.includes(answer);
            score = isCorrect ? subQuestion.points : 0;

            answerReadable = [["", answer]];
          }
        } else {
          const totalQuestions = question.questions?.length || 0;
          const correctCount = Object.entries(answer).filter(([key, value]) => {
            const sq = question.subQuestions?.find(
              (sq: SubQuestionMeta & { acceptableAnswers?: string[] }) =>
                sq.subId === key &&
                sq.acceptableAnswers?.includes((value as string).toString())
            );
            return !!sq;
          }).length;

          question.subQuestions?.forEach(
            (
              sq: SubQuestionMeta & { acceptableAnswers?: string[] },
              index: number
            ) => {
              const subAnswer = answer[sq.subId];

              const questionItem = question.questions?.find(
                (q: { id: string }) => q.id === sq.subId
              );

              answerReadable.push([
                questionItem?.text || `${index + 1}`,
                subAnswer || "",
              ]);
            }
          );

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
      answerReadable,
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
