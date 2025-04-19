// Test Types
export type TestType = "listening" | "reading" | "writing" | "speaking";
export type ReadingVariant = "academic" | "general";

// Add scoring strategy type
export type ScoringStrategy = "partial" | "all-or-nothing";

// Question types
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
  | "writing-task2";

export interface SubQuestionMeta {
  subId: string;
  item?: string;
  correctAnswer?: any;
  points: number;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  scoringStrategy: ScoringStrategy;
  subQuestions?: SubQuestionMeta[];

  index: number;
  partialEndingIndex: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice";
  options: MultipleChoiceOption[];
}

export interface CompletionQuestion extends BaseQuestion {
  type: "completion";
  blanks: number;
  subQuestions: SubQuestionMeta[];
}

export interface MatchingItem {
  id: string;
  text: string;
}

export interface MatchingOption {
  id: string;
  text: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  items: MatchingItem[];
  options: MatchingOption[];
  subQuestions: SubQuestionMeta[];
}

export interface LabelingQuestion extends BaseQuestion {
  type: "labeling";
  imageUrl: string;
  labels: { id: string; text: string }[];
  options: { id: string; text: string }[];
  subQuestions: SubQuestionMeta[];
}

export interface PickFromListQuestion extends BaseQuestion {
  type: "pick-from-list";
  items: { id: string; text: string }[];
  options: { id: string; text: string }[];
  subQuestions: SubQuestionMeta[];
}

export interface TFNGStatement {
  id: string;
  text: string;
}

export interface TrueFalseNotGivenQuestion extends BaseQuestion {
  type: "true-false-not-given";
  statements: TFNGStatement[];
  subQuestions: SubQuestionMeta[];
}

export interface MatchingHeadingsQuestion extends BaseQuestion {
  type: "matching-headings";
  paragraphs: { id: string; text: string }[];
  headings: { id: string; text: string }[];
  subQuestions: SubQuestionMeta[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short-answer";
  questions: { id: string; text: string }[];
  subQuestions: (Omit<SubQuestionMeta, "correctAnswer"> & {
    acceptableAnswers: string[];
  })[];
  wordLimit?: number;
}

// Add writing task interfaces
export interface WritingTask1Question extends BaseQuestion {
  type: "writing-task1";
  prompt: string;
  imageUrl?: string;
  wordLimit: number;
  sampleAnswer?: string;
  scoringPrompt?: string;
}

export interface WritingTask2Question extends BaseQuestion {
  type: "writing-task2";
  prompt: string;
  wordLimit: number;
  sampleAnswer?: string;
  scoringPrompt?: string;
  imageUrl?: string;
}

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
  | WritingTask2Question;

export interface ReadingPassage {
  id: string;
  title: string;
  content: string;
  source?: string;
  hasImages?: boolean;
  imageUrls?: string[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  audioUrl?: string;
  readingPassage?: ReadingPassage;
  questions: Question[];
  duration: number;
}

export interface Test {
  id?: number;
  title: string;
  type: TestType;
  readingVariant?: ReadingVariant;
  description: string;
  sections: Section[];
  totalDuration: number;
  totalQuestions: number;
  instructions: string;
  skillLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
}

export interface UserAnswer {
  questionId: string;
  answer: any;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
  feedback?: string;
  subQuestionId?: string;
  sectionId: string;
  questionType: QuestionType;
  questionIndex: number;
  parentQuestionId?: string; // For subquestions, to link back to the parent
}

export interface TestProgress {
  testId: string;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  timeRemaining: number;
  answers: Record<string, UserAnswer>;
  answerMap?: Record<string, any>; // New field for { subquestionId: answerId } format
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  score?: number;
}

export interface TestTemplate {
  id: string;
  title: string;
  type: TestType;
  sections: SectionTemplate[];
}

export interface SectionTemplate {
  id: string;
  title: string;
  questionTypes: QuestionType[];
  duration: number;
}

// Basic answer types
export type BasicAnswerType = Record<string, string> | string | number | null;

// Writing Task specific answer type
export interface WritingTaskAnswer {
  text: string | null;
  score?: number;
  feedback?: string;
}

// Combined answer type
export type AnswerType = BasicAnswerType | WritingTaskAnswer;

// Define other types like Question, UserAnswer etc. if they are not already defined elsewhere
// Example placeholder for specific question types if needed
export interface WritingTask1Question extends BaseQuestion {
  type: "writing-task1";
  // Add specific properties for WritingTask1Question
}

export interface WritingTask2Question extends BaseQuestion {
  type: "writing-task2";
  // Add specific properties for WritingTask2Question
}

// Define specific interfaces for each question type extending BaseQuestion
interface MultipleChoiceQuestionType extends BaseQuestion {
  type: "multiple-choice";
  options: string[];
  correctAnswer: string;
} // Example specific props
interface CompletionQuestionType extends BaseQuestion {
  type: "completion" /* specific props */;
}
interface MatchingQuestionType extends BaseQuestion {
  type: "matching" /* specific props */;
}
interface LabelingQuestionType extends BaseQuestion {
  type: "labeling" /* specific props */;
}
interface PickFromListQuestionType extends BaseQuestion {
  type: "pick-from-list" /* specific props */;
}
interface TrueFalseNotGivenQuestionType extends BaseQuestion {
  type: "true-false-not-given" /* specific props */;
}
interface MatchingHeadingsQuestionType extends BaseQuestion {
  type: "matching-headings" /* specific props */;
}
interface ShortAnswerQuestionType extends BaseQuestion {
  type: "short-answer" /* specific props */;
}

// Keep WritingTask interfaces as previously defined
export interface WritingTask1Question extends BaseQuestion {
  type: "writing-task1";
  // Add specific properties for WritingTask1Question
}

export interface WritingTask2Question extends BaseQuestion {
  type: "writing-task2";
  // Add specific properties for WritingTask2Question
}

// Example placeholder for UserAnswer type
export interface UserAnswer {
  questionId: string;
  parentQuestionId?: string; // For sub-questions linked to a parent
  subQuestionId?: string;
  answer: any; // Can be string, number, Record<string, string>, WritingTaskAnswer, etc.
}
