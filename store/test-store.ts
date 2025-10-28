import { getSectionStats, getTestStats } from "@testComponents/lib/test-utils";
import { QuestionPluginRegistry } from "@testComponents/lib/question-plugin-system";
import { scoringService } from "@testComponents/lib/scoring-service";
import { createDefaultUserAnswer, validateUserAnswer, ScoringErrorHandler } from "@testComponents/lib/scoring-utils";
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
  config?: TestConfig,
) => Promise<unknown>;

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
    },
  ) => void;
  startTest: () => void;
  submitAnswer: (
    questionId: string,
    answer: unknown,
    subQuestionId?: string,
  ) => Promise<void>;
  completeTest: () => Promise<void>;
  resetTest: () => void;
  updateTimeRemaining: (time: number) => void;
  handleTimeEnd: () => void;
  setSubmitResultFn: (fn: SubmitResultFn) => void;
  submitTestResults: (testId: number, classId?: number) => Promise<boolean>;
  updatePassageContent: (sectionId: string, content: string) => void;
  updateQuestionContent: (questionId: string, content: string, field?: string) => void;
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

// Answer management is handled inline now; scoring is deferred to completeTest.

export const useTestStore = create<TestState>()((set, get) => {
  // Helper function to update progress with a new answer
  const updateProgressWithAnswer = (
    userAnswer: UserAnswer,
    answerKey: string,
  ) => {
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
      },
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

    submitTestResults: async (testId: number, classId?: number): Promise<boolean> => {
      const { currentTest, progress, submitResultFn, customMode } = get();

      if (!currentTest || !progress || !progress.answers || !submitResultFn) {
        console.error(
          "Cannot submit test results: missing test data or submission function",
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
          },
        );




        let testResults: any = {
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

        if (classId) {
          testResults.classId = classId
          // testResults.curriculumSectionId = sessionId
        }

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
          },
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

    submitAnswer: async (
      questionId: string,
      answer: unknown,
      subQuestionId?: string,
    ) => {
      const { progress, currentTest } = get();
      if (!progress || !currentTest) return;

      const currentSection = get().currentSection();
      const question = get().questionById(questionId);

      if (!question || !currentSection) return;

      // Always save the answer on submit and defer scoring until completeTest.
      const plugin = QuestionPluginRegistry.getPlugin(question.type);

      if (
        plugin?.config.hasSubQuestions &&
        typeof answer === "object" &&
        answer !== null
      ) {
        // Store the whole sub-answers object under the main question ID
        const userAnswer: UserAnswer = {
          ...createDefaultUserAnswer(
            questionId,
            answer,
            currentSection.id,
            question.type,
            question.index || 0
          ),
          isCorrect: false,
          score: 0,
          maxScore: question.points || 0,
          feedback: "",
        };

        // Validate the answer structure
        const validation = validateUserAnswer(userAnswer);
        if (!validation.isValid) {
          console.warn(`Invalid UserAnswer structure for question ${questionId}:`, validation.errors);
        }

        updateProgressWithAnswer(userAnswer, questionId);
      } else {
        // Non-sub-question or individual sub-answer: store under subQuestionId or questionId
        const userAnswer: UserAnswer = {
          ...createDefaultUserAnswer(
            questionId,
            answer,
            currentSection.id,
            question.type,
            question.index || 0,
            subQuestionId,
            subQuestionId ? questionId : undefined
          ),
          isCorrect: false,
          score: 0,
          maxScore: question.points || 0,
          feedback: "",
        };

        // Validate the answer structure
        const validation = validateUserAnswer(userAnswer);
        if (!validation.isValid) {
          console.warn(`Invalid UserAnswer structure for question ${questionId}, sub ${subQuestionId}:`, validation.errors);
        }

        updateProgressWithAnswer(userAnswer, subQuestionId || questionId);
      }
    },

    completeTest: async () => {
      const { progress, currentTest, scoreEssayFn } = get();

      if (!progress || !currentTest) {
        return;
      }

      // Handle questions that need to be scored when test is completed
      const questionsToScore: {
        question: Question;
        section: Section;
        answerKey: string;
        answer: unknown;
        subQuestionId?: string;
      }[] = [];

      // Collect all questions that have saved answers (we defer scoring until now)
      for (const section of currentTest.sections) {
        for (const question of section.questions) {
          const plugin = QuestionPluginRegistry.getPlugin(question.type);

          // For questions with sub-questions, the main answer key stores a record of sub-answers
          if (plugin?.config.hasSubQuestions) {
            const mainAnswerKey = question.id;

            // 1) Check if the main answer entry contains a record of sub-answers
            if (progress.answers[mainAnswerKey]) {
              const mainAnswer = progress.answers[mainAnswerKey].answer;
              if (typeof mainAnswer === "object" && mainAnswer !== null) {
                const subAnswers = mainAnswer as Record<string, string>;

                if (question.scoringStrategy === "partial") {
                  // Partial: score each sub-question individually (from main record)
                  Object.keys(subAnswers).forEach((subQuestionId) => {
                    if (subAnswers[subQuestionId]) {
                      questionsToScore.push({
                        question,
                        section,
                        answerKey: mainAnswerKey,
                        answer: subAnswers,
                        subQuestionId,
                      });
                    }
                  });
                } else {
                  // All-or-nothing: score entire main answer as one unit
                  questionsToScore.push({
                    question,
                    section,
                    answerKey: mainAnswerKey,
                    answer: subAnswers,
                  });
                }
              }
            }

            // 2) Also handle the case where partial sub-answers were saved individually
            //    under their own keys (the renderer/store stores partial answers under
            //    subQuestionId keys with parentQuestionId set). Search progress.answers
            //    for entries that reference this question as parent and add them.
            if (question.scoringStrategy === "partial") {
              for (const [answerKey, stored] of Object.entries(progress.answers)) {
                if (
                  stored &&
                  stored.parentQuestionId === question.id &&
                  stored.subQuestionId !== undefined
                ) {
                  // Only include if there is an actual answer value
                  const ans = stored.answer as string | Record<string, string> | null;
                  if (ans !== undefined && ans !== null && String(ans).trim() !== "") {
                    questionsToScore.push({
                      question,
                      section,
                      answerKey,
                      answer: { [stored.subQuestionId || answerKey]: ans },
                      subQuestionId: stored.subQuestionId,
                    });
                  }
                }
              }
            }
          } else {
            // Non-sub-question: check for an answer under the main question key
            const mainAnswerKey = question.id;
            if (progress.answers[mainAnswerKey]) {
              questionsToScore.push({
                question,
                section,
                answerKey: mainAnswerKey,
                answer: progress.answers[mainAnswerKey].answer,
              });
            }
          }
        }
      }

      // Score all questions that need scoring on test completion
      const updatedAnswers = { ...progress.answers };

      for (const {
        question,
        answerKey,
        answer,
        subQuestionId,
        section,
      } of questionsToScore) {

        try {
          // Use the new scoring service
          const scoringResult = await scoringService.scoreQuestion({
            question,
            answer,
            subQuestionId,
            aiScoringFn: scoreEssayFn || undefined,
          });


          // Create properly structured UserAnswer using the scoring service
          const plugin = QuestionPluginRegistry.getPlugin(question.type);
          if (plugin?.config.hasSubQuestions) {
            // If partial scoring, create per-sub-answer entries. Otherwise update main answer.
            if (question.scoringStrategy === "partial" && subQuestionId) {
              // Prefer to update an existing stored sub-answer entry instead of creating new keys.
              // Possible existing locations:
              // - answerKey (if the stored entry is already the sub-entry)
              // - subQuestionId (renderer may have stored under the sub id)
              let targetKey: string | undefined;

              // If answerKey points to an existing sub-entry for this subQuestionId
              if (
                updatedAnswers[answerKey] &&
                (updatedAnswers[answerKey] as UserAnswer).subQuestionId === subQuestionId &&
                (updatedAnswers[answerKey] as UserAnswer).parentQuestionId === question.id
              ) {
                targetKey = answerKey;
              } else if (updatedAnswers[subQuestionId]) {
                // Direct sub-question key
                targetKey = subQuestionId;
              } else {
                // Fallback to main answer key (update the main record) to avoid creating a new key
                targetKey = answerKey;
              }

              const subAnswer = (answer as Record<string, string>)[subQuestionId];

              // Update the chosen target entry using scoring service
              updatedAnswers[targetKey] = scoringService.createUserAnswer(
                question.id,
                subAnswer,
                scoringResult,
                section.id,
                question.type,
                question.index || 0,
                subQuestionId,
                question.id
              );
            } else {
              // All-or-nothing: update the main stored answer
              updatedAnswers[answerKey] = scoringService.createUserAnswer(
                question.id,
                answer,
                scoringResult,
                section.id,
                question.type,
                question.index || 0
              );
            }
          } else {
            // Non-sub-question: update the main answer entry
            updatedAnswers[answerKey] = scoringService.createUserAnswer(
              question.id,
              answer,
              scoringResult,
              section.id,
              question.type,
              question.index || 0
            );
          }
        } catch (error) {
          ScoringErrorHandler.logScoringError(error as Error, {
            questionId: question.id,
            questionType: question.type,
            subQuestionId,
          });

          // Create error result using scoring utilities
          const errorResult = ScoringErrorHandler.createErrorResult(
            error as Error,
            question.points || 0,
            question.id
          );

          // Keep existing answer structure but add error information
          const plugin = QuestionPluginRegistry.getPlugin(question.type);
          if (plugin?.config.hasSubQuestions && subQuestionId) {
            let targetKey: string | undefined;

            if (
              updatedAnswers[answerKey] &&
              (updatedAnswers[answerKey] as UserAnswer).subQuestionId === subQuestionId &&
              (updatedAnswers[answerKey] as UserAnswer).parentQuestionId === question.id
            ) {
              targetKey = answerKey;
            } else if (updatedAnswers[subQuestionId]) {
              targetKey = subQuestionId;
            } else {
              targetKey = answerKey;
            }

            const subAnswer = (answer as Record<string, string>)[subQuestionId];

            updatedAnswers[targetKey] = {
              ...createDefaultUserAnswer(
                question.id,
                subAnswer,
                section.id,
                question.type,
                question.index || 0,
                subQuestionId,
                question.id
              ),
              isCorrect: errorResult.isCorrect,
              score: errorResult.score,
              maxScore: errorResult.maxScore,
              feedback: errorResult.feedback,
            };
          } else {
            updatedAnswers[answerKey] = {
              ...createDefaultUserAnswer(
                question.id,
                answer,
                section.id,
                question.type,
                question.index || 0
              ),
              isCorrect: errorResult.isCorrect,
              score: errorResult.score,
              maxScore: errorResult.maxScore,
              feedback: errorResult.feedback,
            };
          }
        }
      }

      // Calculate total score after scoring
      const totalScore = Object.values(updatedAnswers).reduce(
        (sum, answer) => sum + ((answer as UserAnswer).score || 0),
        0,
      );

      set({
        progress: {
          ...progress,
          answers: updatedAnswers,
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

    // updateQuestionContent: (questionId: string, content: string) => {
    //   const { currentTest } = get();
    //   if (!currentTest) return;

    //   const updatedSections = currentTest.sections.map((section) => ({
    //     ...section,
    //     questions: section.questions.map((question) => {
    //       if (question.id === questionId) {
    //         return {
    //           ...question,
    //           text: content,
    //         };
    //       }
    //       return question;
    //     }),
    //   }));

    //   set({
    //     currentTest: {
    //       ...currentTest,
    //       sections: updatedSections,
    //     },
    //   });
    // },
    updateQuestionContent: (questionId: string, content: string, field?: "text" | string) => {
      const { currentTest } = get();
      if (!currentTest) return;
      const updatedSections = currentTest.sections.map((section) => ({
        ...section,
        questions: section.questions.map((question) => {
          if (question.id === questionId) {

            if (!field || field === "text") {
              return {
                ...question,
                text: content,
              };
            }

            if ("options" in question && Array.isArray(question.options)) {
              const updatedOptions = question.options.map((option) => {
                if (option.id === field) {
                  return {
                    ...option,
                    text: content,
                  };
                }
                return option;
              });

              return {
                ...question,
                options: updatedOptions,
              };
            }

            if ((question.type == 'pick-from-list' || question.type == 'pick-from-a-list')  &&  ("items" in question && Array.isArray(question.items))) {
              const updatedOptions = question.items.map((item) => {
                if (item.id === field) {
                  return {
                    ...item,
                    text: content,
                  };
                }
                return item;
              });

              return {
                ...question,
                items: updatedOptions,
              };
            }


            if ("subQuestions" in question && Array.isArray(question.subQuestions)) {
              const updatedOptions = question.subQuestions.map((sub) => {
                if (sub.subId === field) {
                  return {
                    ...sub,
                    questionText: content,
                  };
                }
                return sub;
              });

              return {
                ...question,
                subQuestions: updatedOptions,
              };
            }
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
