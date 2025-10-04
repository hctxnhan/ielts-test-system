/**
 * Enhanced type definitions for the scoring system
 * This file extends the base types to ensure compatibility between
 * the standardized types, plugin system, and scoring service
 */

import type {
  StandardQuestion,
  StandardSubQuestionMeta,
  StandardTest,
  StandardSection,
} from "./standardized-types";

import type {
  Question,
  UserAnswer,
  Test,
  Section,
  QuestionType,
  ScoringStrategy,
} from "./types";

import type {
  ScoringResult,
  ScoringContext,
} from "./question-plugin-system";

import type {
  ServiceScoringResult,
  ServiceScoringContext,
  ScoreCalculationOptions,
  ScoringBreakdown,
} from "./scoring-service";

/**
 * Extended UserAnswer interface for enhanced scoring capabilities
 */
export interface EnhancedUserAnswer extends UserAnswer {
  /** Unique identifier for the scoring attempt */
  scoringId?: string;
  /** Timestamp when the answer was scored */
  scoringTimestamp?: number;
  /** Whether this answer requires manual review */
  requiresManualReview?: boolean;
  /** Whether this answer was scored using AI */
  aiScored?: boolean;
  /** Whether this answer was manually scored */
  manualScored?: boolean;
  /** Additional metadata from scoring */
  scoringMetadata?: {
    selectedAnswer?: {
      id?: string;
      text?: string;
    };
    correctAnswer?: {
      id?: string;
      text?: string;
    };
    [key: string]: unknown;
  };
  /** Error information if scoring failed */
  scoringError?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Test configuration for scoring
 */
export interface ScoringTestConfig {
  /** Whether to use AI scoring when available */
  enableAiScoring?: boolean;
  /** Whether to require manual review for certain question types */
  requireManualReview?: boolean;
  /** Custom AI scoring function */
  aiScoringFn?: (params: {
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
  /** Whether to recalculate all scores */
  recalculateScores?: boolean;
  /** Whether to include detailed breakdowns */
  includeBreakdowns?: boolean;
}

/**
 * Enhanced test result with detailed scoring information
 */
export interface EnhancedTestResult {
  /** Basic test statistics */
  totalScore: number;
  maxPossibleScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  percentageScore: number;
  /** Detailed section results */
  sectionResults: EnhancedSectionResult[];
  /** Timing information */
  startedAt: string;
  completedAt: string;
  /** Enhanced answers with scoring metadata */
  answers?: Record<string, EnhancedUserAnswer>;
  /** Scoring configuration used */
  scoringConfig?: ScoringTestConfig;
  /** Overall scoring breakdown */
  scoringBreakdown?: {
    questionBreakdowns: Record<string, ScoringBreakdown>;
    totalsByStrategy: {
      partial: { score: number; maxScore: number; questionCount: number };
      allOrNothing: { score: number; maxScore: number; questionCount: number };
    };
    totalsByType: Record<QuestionType, { score: number; maxScore: number; questionCount: number }>;
    scoringMethods: {
      plugin: number;
      cached: number;
      fallback: number;
    };
  };
}

/**
 * Enhanced section result with detailed scoring information
 */
export interface EnhancedSectionResult {
  title: string;
  id: string;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalCount: number;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  /** Question-level breakdowns */
  questionBreakdowns?: Record<string, ScoringBreakdown>;
  /** Scoring summary by strategy */
  scoringByStrategy: {
    partial: { score: number; maxScore: number; questionCount: number };
    allOrNothing: { score: number; maxScore: number; questionCount: number };
  };
  /** Scoring summary by question type */
  scoringByType: Record<string, { score: number; maxScore: number; questionCount: number }>;
}

/**
 * Question transformation context for converting between formats
 */
export interface QuestionTransformContext {
  /** The original question */
  originalQuestion: Question;
  /** Target standardized format */
  targetFormat: 'standardized';
  /** Transformation options */
  options?: {
    includeMetadata?: boolean;
    validateResult?: boolean;
    preserveIds?: boolean;
  };
}

/**
 * Answer submission context for enhanced tracking
 */
export interface AnswerSubmissionContext {
  /** The question being answered */
  question: Question;
  /** The submitted answer */
  answer: unknown;
  /** Sub-question ID if applicable */
  subQuestionId?: string;
  /** Section context */
  sectionId: string;
  /** User context */
  userId?: string;
  /** Submission timestamp */
  timestamp: number;
  /** Whether this is an auto-save or explicit submission */
  isAutoSave?: boolean;
}

/**
 * Scoring validation result
 */
export interface ScoringValidationResult {
  /** Whether the scoring result is valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Suggested corrections */
  suggestions?: string[];
}

/**
 * Type guards for scoring system
 */
export function isEnhancedUserAnswer(answer: UserAnswer): answer is EnhancedUserAnswer {
  return 'scoringId' in answer || 'scoringTimestamp' in answer || 'scoringMetadata' in answer;
}

export function isServiceScoringResult(result: ScoringResult): result is ServiceScoringResult {
  return 'timestamp' in result;
}

export function isServiceScoringContext(context: ScoringContext): context is ServiceScoringContext {
  return 'scoringId' in context || 'timestamp' in context;
}

export function hasSubQuestions(question: Question): boolean {
  return Boolean(question.subQuestions && question.subQuestions.length > 0);
}

export function requiresAiScoring(question: Question): boolean {
  const aiTypes: QuestionType[] = [
    'writing-task1',
    'writing-task2',
    'sentence-translation',
    'word-form'
  ];
  return aiTypes.includes(question.type);
}

export function supportsPartialScoring(question: Question): boolean {
  return question.scoringStrategy === 'partial' && hasSubQuestions(question);
}

/**
 * Utility type for extracting answer values from different formats
 */
export type ExtractedAnswer<T> = T extends Record<string, infer U> ? U : T;

/**
 * Utility type for question-specific answer formats
 */
export type QuestionAnswerFormat<Q extends Question> = 
  Q extends { type: 'multiple-choice' } ? string :
  Q extends { type: 'completion' } ? Record<string, string> :
  Q extends { type: 'matching' } ? Record<string, string> :
  Q extends { type: 'labeling' } ? Record<string, string> :
  Q extends { type: 'writing-task1' | 'writing-task2' } ? string :
  Q extends { type: 'sentence-translation' } ? Record<string, string> :
  Q extends { type: 'word-form' } ? Record<string, string> :
  unknown;

/**
 * Compatibility layer between legacy and new scoring systems
 */
export interface ScoringCompatibilityLayer {
  /** Convert legacy UserAnswer to EnhancedUserAnswer */
  upgradeUserAnswer(answer: UserAnswer): EnhancedUserAnswer;
  /** Convert EnhancedUserAnswer to legacy UserAnswer */
  downgradeUserAnswer(answer: EnhancedUserAnswer): UserAnswer;
  /** Convert Question to StandardQuestion */
  standardizeQuestion(question: Question): StandardQuestion;
  /** Convert StandardQuestion to Question */
  denormalizeQuestion(question: StandardQuestion): Question;
}

/**
 * Export all relevant types for external use
 */
export type {
  // Core interfaces
  ScoringResult,
  ScoringContext,
  ServiceScoringResult,
  ServiceScoringContext,
  ScoreCalculationOptions,
  ScoringBreakdown,
  
  // Base types
  Question,
  UserAnswer,
  Test,
  Section,
  QuestionType,
  ScoringStrategy,
  
  // Standard types
  StandardQuestion,
  StandardSubQuestionMeta,
  StandardTest,
  StandardSection,
};