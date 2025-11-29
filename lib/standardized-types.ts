// Common interfaces for standardized format
export interface StandardQuestionItem {
  id: string;
  text: string;
}

export interface StandardQuestionOption extends StandardQuestionItem {
  isCorrect?: boolean;
}

export interface StandardSubQuestionMeta {
  subId: string;
  item?: string;
  correctAnswer?: any;
  points: number;
  subIndex?: number;
  questionText?: string;
  answerText?: string;
  acceptableAnswers?: string[];
  explanation?: string
   // For short answer questions
}

// Base interface for standardized questions
export interface StandardBaseQuestion {
  id: string;
  type: string;
  text: string;
  points: number;
  scoringStrategy: "partial" | "all-or-nothing";
  index: number;
  partialEndingIndex: number;
  items?: StandardQuestionItem[];
  options?: StandardQuestionOption[];
  subQuestions?: StandardSubQuestionMeta[];
  imageUrl?: string;
  prompt?: string;
  wordLimit?: number;
  sampleAnswer?: string;
  scoringPrompt?: string;
}

// Standardized question types
export interface StandardMultipleChoiceQuestion extends StandardBaseQuestion {
  type: "multiple-choice";
  options: StandardQuestionOption[];
  subQuestions: StandardSubQuestionMeta[];
}

export interface StandardCompletionQuestion extends StandardBaseQuestion {
  type: "completion";
  subQuestions: StandardSubQuestionMeta[];
}

export interface StandardMatchingQuestion extends StandardBaseQuestion {
  type: "matching";
  items: StandardQuestionItem[];
  options: StandardQuestionOption[];
  subQuestions: StandardSubQuestionMeta[];
}

export interface StandardLabelingQuestion extends StandardBaseQuestion {
  type: "labeling";
  imageUrl: string;
  items: StandardQuestionItem[];
  options: StandardQuestionOption[];
  subQuestions: StandardSubQuestionMeta[];
}

export interface StandardPickFromListQuestion extends StandardBaseQuestion {
  type: "pick-from-a-list";
  items: StandardQuestionItem[];
  subQuestions: StandardSubQuestionMeta[];
}

export interface StandardTrueFalseNotGivenQuestion
  extends StandardBaseQuestion {
  type: "true-false-not-given";
  items: StandardQuestionItem[];
  subQuestions: StandardSubQuestionMeta[];
}

export interface StandardYesNoNotGivenQuestion
  extends StandardBaseQuestion {
  type: "yes-no-not-given";
  items: StandardQuestionItem[];
  subQuestions: StandardSubQuestionMeta[];
}

export interface StandardMatchingHeadingsQuestion extends StandardBaseQuestion {
  type: "matching-headings";
  items: StandardQuestionItem[];
  options: StandardQuestionOption[];
  subQuestions: StandardSubQuestionMeta[];
}

export interface StandardShortAnswerQuestion extends StandardBaseQuestion {
  type: "short-answer";
  items: StandardQuestionItem[];
  subQuestions: StandardSubQuestionMeta[];
  wordLimit?: number;
}

export interface StandardWritingTask1Question extends StandardBaseQuestion {
  type: "writing-task1";
  prompt: string;
  imageUrl?: string;
  wordLimit: number;
  sampleAnswer?: string;
  scoringPrompt?: string;
  subQuestions: StandardSubQuestionMeta[];
}

export interface StandardWritingTask2Question extends StandardBaseQuestion {
  type: "writing-task2";
  prompt: string;
  wordLimit: number;
  sampleAnswer?: string;
  scoringPrompt?: string;
  imageUrl?: string;
  subQuestions: StandardSubQuestionMeta[];
}

export interface StandardSentenceTranslationQuestion extends StandardBaseQuestion {
  type: "sentence-translation";
  sourceText: string;
  referenceTranslation?: string;
  sourceLanguage: "vietnamese" | "english";
  targetLanguage: "english" | "vietnamese";
  scoringPrompt?: string;
}

export interface StandardWordFormQuestion extends StandardBaseQuestion {
  type: "word-form";
  exercises: {
    id: string;
    sentence: string;
    baseWord: string;
    correctForm: string;
  }[];
  scoringPrompt?: string;
  subQuestions: StandardSubQuestionMeta[];
}

export type StandardQuestion =
  | StandardMultipleChoiceQuestion
  | StandardCompletionQuestion
  | StandardMatchingQuestion
  | StandardLabelingQuestion
  | StandardPickFromListQuestion
  | StandardTrueFalseNotGivenQuestion
  | StandardYesNoNotGivenQuestion
  | StandardMatchingHeadingsQuestion
  | StandardShortAnswerQuestion
  | StandardWritingTask1Question
  | StandardWritingTask2Question
  | StandardSentenceTranslationQuestion
  | StandardWordFormQuestion;

// Test interface with standardized questions
export interface StandardTest {
  id: string;
  title: string;
  description?: string;
  sections: StandardSection[];
}

export interface StandardSection {
  id: string;
  title: string;
  questions: StandardQuestion[];
}
