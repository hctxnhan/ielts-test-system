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
  // subIndex: number;
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
  id: string;
  title: string;
  type: TestType;
  readingVariant?: ReadingVariant;
  description: string;
  sections: Section[];
  totalDuration: number;
  totalQuestions: number;
  instructions: string;
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
