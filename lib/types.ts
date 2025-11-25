// Test Types
export type TestType = "listening" | "reading" | "writing" | "speaking" | "grammar";
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
  | "pick-from-a-list"
  | "true-false-not-given"
  | "yes-no-not-given"
  | "matching-headings"
  | "short-answer"
  | "writing-task1"
  | "writing-task2"
  | "sentence-translation"
  | "word-form";

export interface SubQuestionMeta {
  subId: string;
  item?: string;
  correctAnswer?: string;
  acceptableAnswers?: string[];
  points: number;
  subIndex?: number;
  questionText?: string; // The actual text of the question (item, statement, etc.)
  answerText?: string; // The actual text of the answer (option, heading, etc.)
  explanation?: string
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
  imageUrl?: string;
  index: number;
  partialEndingIndex: number;
  explanation?: string
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice";
  options: MultipleChoiceOption[];
}

export interface CompletionQuestion extends BaseQuestion {
  type: "completion";
  subQuestions: (Omit<SubQuestionMeta, "correctAnswer"> & {
    acceptableAnswers: string[];
  })[];
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

export interface PickFromAListQuestion extends BaseQuestion {
  type: "pick-from-a-list";
  items: { id: string; text: string }[];
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

export interface YesNoNotGivenQuestion extends BaseQuestion {
  type: "yes-no-not-given";
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

export interface SentenceTranslationQuestion extends BaseQuestion {
  type: "sentence-translation";
  sentences: { id: string; sourceText: string; referenceTranslations?: string[] }[];
  sourceLanguage: "vietnamese" | "english";
  targetLanguage: "english" | "vietnamese";
  scoringPrompt?: string;
  subQuestions: SubQuestionMeta[];
}

export interface WordFormQuestion extends BaseQuestion {
  type: "word-form";
  exercises: { 
    id: string; 
    sentence: string; 
    baseWord: string; 
    correctForm: string; 
    position: number; // position of the blank in the sentence
  }[];
  scoringPrompt?: string;
}

export type Question =
  | MultipleChoiceQuestion
  | CompletionQuestion
  | MatchingQuestion
  | LabelingQuestion
  | PickFromListQuestion
  | PickFromAListQuestion
  | TrueFalseNotGivenQuestion
  | YesNoNotGivenQuestion
  | MatchingHeadingsQuestion
  | ShortAnswerQuestion
  | WritingTask1Question
  | WritingTask2Question
  | SentenceTranslationQuestion
  | WordFormQuestion;

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
  transcript?: string;
  questions: Question[];
  duration: number;
}

export interface Test {
  id?: number;
  title: string;
  type: TestType;
  skill: TestType;
  readingVariant?: ReadingVariant;
  description: string;
  sections: Section[];
  totalDuration: number;
  totalQuestions: number;
  instructions: string;
  skillLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  audioUrl?: string; // Added for listening tests
  tips?: string; // Tips for test takers
  vocabulary?: string; // Vocabulary help for test takers,
  isFree: boolean,
  isExercise: boolean
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
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  score?: number;
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
}

export interface TestResult {
  totalScore: number;
  maxPossibleScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  percentageScore: number;
  sectionResults: SectionResult[];
  startedAt: string;
  completedAt: string;
  answers?: Record<string, UserAnswer>;
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
