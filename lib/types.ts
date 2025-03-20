// Test Types
export type TestType = "listening" | "reading" | "writing" | "speaking"
export type ReadingVariant = "academic" | "general"

// Add scoring strategy type
export type ScoringStrategy = "partial" | "all-or-nothing"

// Add writing-specific question types
export type QuestionType =
  | "multiple-choice"
  | "completion"
  | "matching"
  | "labeling"
  | "pick-from-list"
  | "true-false-not-given"
  | "matching-headings"
  | "short-answer"
  | "writing-task1"
  | "writing-task2"

// Base interfaces
export interface BaseQuestion {
  id: string
  type: QuestionType
  text: string
  points: number
  // Add scoring strategy
  scoringStrategy: ScoringStrategy
  index: number
  partialEndingIndex?: number // For partial scoring
}

export interface QuestionGroup {
  id: string
  title: string // e.g., "Questions 1-5"
  instructions: string
  questionIds: string[] // References to the questions in this group
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice"
  options: string[]
  correctAnswer: number
}

export interface CompletionQuestion extends BaseQuestion {
  type: "completion"
  blanks: number
  correctAnswers: string[]
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching"
  items: string[]
  options: string[]
  correctMatches: Record<number, number> // index of item -> index of option
}

// Updated Labeling Question
export interface LabelingQuestion extends BaseQuestion {
  type: "labeling"
  imageUrl: string
  labels: string[] // Labels that are already on the image
  options: string[] // Options to choose from
  correctLabels: Record<number, number> // label index -> option index
}

// Updated Pick From List Question
export interface PickFromListQuestion extends BaseQuestion {
  type: "pick-from-list"
  items: string[] // Items to match (e.g., "Local shop", "Restaurant")
  options: string[] // Options to choose from (e.g., "A The shop will move...")
  correctAnswers: Record<number, number> // item index -> option index
}

export interface TrueFalseNotGivenQuestion extends BaseQuestion {
  type: "true-false-not-given"
  statements: string[]
  correctAnswers: ("true" | "false" | "not-given")[]
}

export interface MatchingHeadingsQuestion extends BaseQuestion {
  type: "matching-headings"
  paragraphs: string[]
  headings: string[]
  correctMatches: Record<number, number> // paragraph index -> heading index
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short-answer"
  questions: string[]
  correctAnswers: string[][] // Array of acceptable answers for each question
  wordLimit?: number
}

// Add writing task interfaces
export interface WritingTask1Question extends BaseQuestion {
  type: "writing-task1"
  prompt: string
  imageUrl?: string
  wordLimit: number
  sampleAnswer?: string
  scoringPrompt?: string // Prompt for AI scoring
}

export interface WritingTask2Question extends BaseQuestion {
  type: "writing-task2"
  prompt: string
  wordLimit: number
  sampleAnswer?: string
  scoringPrompt?: string // Prompt for AI scoring
}

// Update Question type union
export type Question =
  | MultipleChoiceQuestion
  | CompletionQuestion
  | MatchingQuestion
  | LabelingQuestion
  | PickFromListQuestion
  | TrueFalseNotGivenQuestion
  | MatchingHeadingsQuestion
  | ShortAnswerQuestion
  | WritingTask1Question
  | WritingTask2Question

export interface ReadingPassage {
  id: string
  title: string
  content: string
  source?: string
  hasImages?: boolean
  imageUrls?: string[]
}

export interface Section {
  id: string
  title: string
  description: string
  audioUrl?: string // For listening tests
  readingPassage?: ReadingPassage // For reading tests
  questions: Question[]
  questionGroups?: QuestionGroup[] // Add question groups
  duration: number // in seconds
}

export interface Test {
  id: string
  title: string
  type: TestType
  readingVariant?: ReadingVariant // For reading tests
  description: string
  sections: Section[]
  totalDuration: number // in seconds
  totalQuestions: number
  instructions: string
}

// User progress and answers
export interface UserAnswer {
  questionId: string
  answer: any // Type depends on question type
  isCorrect?: boolean
  score?: number
  maxScore?: number // Add maximum possible score
  partiallyCorrect?: boolean // Add flag for partially correct answers
  feedback?: string // Add feedback field for AI-scored questions
}

export interface TestProgress {
  testId: string
  currentSectionIndex: number
  currentQuestionIndex: number
  timeRemaining: number
  answers: Record<string, UserAnswer>
  completed: boolean
  startedAt: string
  completedAt?: string
  score?: number
}

// Test creator types
export interface TestTemplate {
  id: string
  title: string
  type: TestType
  sections: SectionTemplate[]
}

export interface SectionTemplate {
  id: string
  title: string
  questionTypes: QuestionType[]
  duration: number
}