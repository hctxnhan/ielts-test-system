import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Test, TestProgress, UserAnswer } from "@/lib/types"

interface TestState {
  currentTest: Test | null
  progress: TestProgress | null

  // Actions
  loadTest: (test: Test) => void
  startTest: () => void
  submitAnswer: (questionId: string, answer: any) => void
  nextQuestion: () => void
  previousQuestion: () => void
  completeTest: () => void
  resetTest: () => void
  updateTimeRemaining: (time: number) => void

  // Computed
  currentSection: () => any
  currentQuestion: () => any
  isLastQuestion: () => boolean
}

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      currentTest: null,
      progress: null,

      loadTest: (test: Test) => {
        set({ currentTest: test })
      },

      startTest: () => {
        const { currentTest } = get()
        if (!currentTest) return

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
        })
      },

      submitAnswer: (questionId: string, answer: any) => {
        const { progress, currentTest } = get()
        if (!progress || !currentTest) return

        const currentSection = get().currentSection()
        const question = get().currentQuestion()
        if (!question) return

        let isCorrect = false
        let score = 0
        const maxScore = question.points
        let partiallyCorrect = false
        let feedback = undefined

        // Determine if answer is correct based on question type
        if (question) {
          const scoringStrategy = question.scoringStrategy || "partial"

          switch (question.type) {
            case "multiple-choice":
              isCorrect = answer === question.correctAnswer
              score = isCorrect ? question.points : 0
              break

            case "completion":
              // Check each blank
              if (Array.isArray(answer) && Array.isArray(question.correctAnswers)) {
                const correctCount = answer.filter(
                  (ans, index) =>
                    question.correctAnswers[index] &&
                    question.correctAnswers[index].toLowerCase() === ans.toLowerCase(),
                ).length

                // Calculate score based on scoring strategy
                if (scoringStrategy === "partial") {
                  // Partial credit based on number of correct answers
                  score = Math.round((correctCount / question.correctAnswers.length) * question.points)
                  isCorrect = correctCount === question.correctAnswers.length
                  partiallyCorrect = correctCount > 0 && correctCount < question.correctAnswers.length
                } else {
                  // All-or-nothing
                  isCorrect = correctCount === question.correctAnswers.length
                  score = isCorrect ? question.points : 0
                }
              }
              break

            case "matching":
              // Check each match
              if (answer && typeof answer === "object") {
                const totalMatches = Object.keys(question.correctMatches).length
                const correctCount = Object.entries(answer).filter(
                  ([key, value]) => question.correctMatches[Number.parseInt(key)] === value,
                ).length

                // Calculate score based on scoring strategy
                if (scoringStrategy === "partial") {
                  // Partial credit based on number of correct matches
                  score = Math.round((correctCount / totalMatches) * question.points)
                  isCorrect = correctCount === totalMatches
                  partiallyCorrect = correctCount > 0 && correctCount < totalMatches
                } else {
                  // All-or-nothing
                  isCorrect = correctCount === totalMatches
                  score = isCorrect ? question.points : 0
                }
              }
              break

            case "true-false-not-given":
              // Check each statement
              if (answer && typeof answer === "object") {
                const totalStatements = question.correctAnswers.length
                const correctCount = Object.entries(answer).filter(
                  ([key, value]) => question.correctAnswers[Number.parseInt(key)] === value,
                ).length

                // Calculate score based on scoring strategy
                if (scoringStrategy === "partial") {
                  // Partial credit based on number of correct statements
                  score = Math.round((correctCount / totalStatements) * question.points)
                  isCorrect = correctCount === totalStatements
                  partiallyCorrect = correctCount > 0 && correctCount < totalStatements
                } else {
                  // All-or-nothing
                  isCorrect = correctCount === totalStatements
                  score = isCorrect ? question.points : 0
                }
              }
              break

            case "matching-headings":
              // Check each paragraph-heading match
              if (answer && typeof answer === "object") {
                const totalMatches = Object.keys(question.correctMatches).length
                const correctCount = Object.entries(answer).filter(
                  ([key, value]) => question.correctMatches[Number.parseInt(key)] === value,
                ).length

                // Calculate score based on scoring strategy
                if (scoringStrategy === "partial") {
                  // Partial credit based on number of correct matches
                  score = Math.round((correctCount / totalMatches) * question.points)
                  isCorrect = correctCount === totalMatches
                  partiallyCorrect = correctCount > 0 && correctCount < totalMatches
                } else {
                  // All-or-nothing
                  isCorrect = correctCount === totalMatches
                  score = isCorrect ? question.points : 0
                }
              }
              break

            case "short-answer":
              // Check each short answer against acceptable answers
              if (Array.isArray(answer) && Array.isArray(question.questions)) {
                const totalAnswers = question.questions.length
                let correctCount = 0

                answer.forEach((ans, index) => {
                  if (question.correctAnswers[index]) {
                    // Check if answer matches any of the acceptable answers
                    const isAnswerCorrect = question.correctAnswers[index].some((correctAns) =>
                      ans.toLowerCase().includes(correctAns.toLowerCase()),
                    )

                    if (isAnswerCorrect) correctCount++
                  }
                })

                // Calculate score based on scoring strategy
                if (scoringStrategy === "partial") {
                  // Partial credit based on number of correct answers
                  score = Math.round((correctCount / totalAnswers) * question.points)
                  isCorrect = correctCount === totalAnswers
                  partiallyCorrect = correctCount > 0 && correctCount < totalAnswers
                } else {
                  // All-or-nothing
                  isCorrect = correctCount === totalAnswers
                  score = isCorrect ? question.points : 0
                }
              }
              break

            case "labeling":
              // Check each label
              if (answer && typeof answer === "object") {
                const totalLabels = Object.keys(question.correctLabels).length
                const correctCount = Object.entries(answer).filter(
                  ([key, value]) => question.correctLabels[Number.parseInt(key)] === value,
                ).length

                // Calculate score based on scoring strategy
                if (scoringStrategy === "partial") {
                  // Partial credit based on number of correct labels
                  score = Math.round((correctCount / totalLabels) * question.points)
                  isCorrect = correctCount === totalLabels
                  partiallyCorrect = correctCount > 0 && correctCount < totalLabels
                } else {
                  // All-or-nothing
                  isCorrect = correctCount === totalLabels
                  score = isCorrect ? question.points : 0
                }
              }
              break

            case "pick-from-list":
              // Check each item
              if (answer && typeof answer === "object") {
                const totalItems = Object.keys(question.correctAnswers).length
                const correctCount = Object.entries(answer).filter(
                  ([key, value]) => question.correctAnswers[Number.parseInt(key)] === value,
                ).length

                // Calculate score based on scoring strategy
                if (scoringStrategy === "partial") {
                  // Partial credit based on number of correct items
                  score = Math.round((correctCount / totalItems) * question.points)
                  isCorrect = correctCount === totalItems
                  partiallyCorrect = correctCount > 0 && correctCount < totalItems
                } else {
                  // All-or-nothing
                  isCorrect = correctCount === totalItems
                  score = isCorrect ? question.points : 0
                }
              }
              break

            case "writing-task1":
            case "writing-task2":
              // For writing tasks, we store the answer and any AI feedback
              if (typeof answer === "object" && answer.score !== undefined) {
                // This is an AI-scored submission
                score = answer.score
                feedback = answer.feedback
                // Consider correct if score is above 70% of max points
                isCorrect = score >= maxScore * 0.7
                // Consider partially correct if score is positive but below 70%
                partiallyCorrect = !isCorrect && score > 0
                // Use the text as the actual answer
                answer = answer.text
              } else if (typeof answer === "object" && answer.text !== undefined) {
                // This is just the essay text without scoring
                answer = answer.text
                isCorrect = false
                score = 0
              }
              break

            default:
              isCorrect = false
              score = 0
          }
        }

        const userAnswer: UserAnswer = {
          questionId,
          answer,
          isCorrect,
          score,
          maxScore,
          partiallyCorrect,
          feedback,
        }

        set({
          progress: {
            ...progress,
            answers: {
              ...progress.answers,
              [questionId]: userAnswer,
            },
          },
        })
      },

      nextQuestion: () => {
        const { progress, currentTest } = get()
        if (!progress || !currentTest) return

        const currentSection = currentTest.sections[progress.currentSectionIndex]
        const isLastQuestionInSection = progress.currentQuestionIndex === currentSection.questions.length - 1
        const isLastSection = progress.currentSectionIndex === currentTest.sections.length - 1

        if (isLastQuestionInSection) {
          if (isLastSection) {
            // End of test
            get().completeTest()
          } else {
            // Move to next section
            set({
              progress: {
                ...progress,
                currentSectionIndex: progress.currentSectionIndex + 1,
                currentQuestionIndex: 0,
              },
            })
          }
        } else {
          // Move to next question in current section
          set({
            progress: {
              ...progress,
              currentQuestionIndex: progress.currentQuestionIndex + 1,
            },
          })
        }
      },

      previousQuestion: () => {
        const { progress, currentTest } = get()
        if (!progress || !currentTest) return

        const isFirstQuestionInSection = progress.currentQuestionIndex === 0
        const isFirstSection = progress.currentSectionIndex === 0

        if (isFirstQuestionInSection) {
          if (isFirstSection) {
            // Already at the beginning of the test
            return
          } else {
            // Move to previous section
            const previousSection = currentTest.sections[progress.currentSectionIndex - 1]
            set({
              progress: {
                ...progress,
                currentSectionIndex: progress.currentSectionIndex - 1,
                currentQuestionIndex: previousSection.questions.length - 1,
              },
            })
          }
        } else {
          // Move to previous question in current section
          set({
            progress: {
              ...progress,
              currentQuestionIndex: progress.currentQuestionIndex - 1,
            },
          })
        }
      },

      completeTest: () => {
        const { progress, currentTest } = get()
        if (!progress || !currentTest) return

        // Calculate total score
        const totalScore = Object.values(progress.answers).reduce((sum, answer) => sum + (answer.score || 0), 0)

        set({
          progress: {
            ...progress,
            completed: true,
            completedAt: new Date().toISOString(),
            score: totalScore,
          },
        })
      },

      resetTest: () => {
        set({
          currentTest: null,
          progress: null,
        })
      },

      updateTimeRemaining: (time: number) => {
        const { progress } = get()
        if (!progress) return

        set({
          progress: {
            ...progress,
            timeRemaining: time,
          },
        })
      },

      currentSection: () => {
        const { currentTest, progress } = get()
        if (!currentTest || !progress) return null

        return currentTest.sections[progress.currentSectionIndex]
      },

      currentQuestion: () => {
        const { progress } = get()
        const section = get().currentSection()
        if (!progress || !section) return null

        return section.questions[progress.currentQuestionIndex]
      },

      isLastQuestion: () => {
        const { currentTest, progress } = get()
        if (!currentTest || !progress) return false

        const isLastSection = progress.currentSectionIndex === currentTest.sections.length - 1
        const currentSection = currentTest.sections[progress.currentSectionIndex]
        const isLastQuestionInSection = progress.currentQuestionIndex === currentSection.questions.length - 1

        return isLastSection && isLastQuestionInSection
      },
    }),
    {
      name: "ielts-test-storage",
    },
  ),
)

