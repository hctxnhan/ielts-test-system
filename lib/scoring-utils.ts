import type { 
  Question, 
  UserAnswer
} from "./types";

/**
 * Normalizes a score to ensure it's within valid bounds
 */
export function normalizeScore(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  
  // Ensure score is not negative
  const normalizedScore = Math.max(0, score);
  
  // Ensure score doesn't exceed max
  return Math.min(normalizedScore, maxScore);
}

/**
 * Calculates the percentage score from a raw score and max score
 */
export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  
  const normalizedScore = normalizeScore(score, maxScore);
  return Math.round((normalizedScore / maxScore) * 100);
}

/**
 * Validates if an answer has meaningful content
 */
export function hasValidAnswer(answer: unknown): boolean {
  if (answer === null || answer === undefined) {
    return false;
  }

  if (typeof answer === 'string') {
    return answer.trim() !== '';
  }

  if (typeof answer === 'number') {
    return !isNaN(answer);
  }

  if (typeof answer === 'boolean') {
    return true;
  }

  if (Array.isArray(answer)) {
    return answer.length > 0 && answer.some(item => hasValidAnswer(item));
  }

  if (typeof answer === 'object') {
    const obj = answer as Record<string, unknown>;
    return Object.values(obj).some(value => hasValidAnswer(value));
  }

  return false;
}

/**
 * Validates the structure of a UserAnswer object
 */
export function validateUserAnswer(userAnswer: UserAnswer): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!userAnswer.questionId) {
    errors.push('Missing questionId');
  }

  if (!userAnswer.sectionId) {
    errors.push('Missing sectionId');
  }

  if (!userAnswer.questionType) {
    errors.push('Missing questionType');
  }

  if (typeof userAnswer.questionIndex !== 'number') {
    errors.push('Missing or invalid questionIndex');
  }

  if (typeof userAnswer.score === 'number' && userAnswer.score < 0) {
    errors.push('Score cannot be negative');
  }

  if (typeof userAnswer.maxScore === 'number' && userAnswer.maxScore < 0) {
    errors.push('MaxScore cannot be negative');
  }

  if (
    typeof userAnswer.score === 'number' && 
    typeof userAnswer.maxScore === 'number' && 
    userAnswer.score > userAnswer.maxScore
  ) {
    errors.push('Score cannot exceed maxScore');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Determines the status of a question based on scoring strategy and answers
 */
export function determineQuestionStatus(
  question: Question,
  answers: Record<string, UserAnswer>
): 'completed' | 'partial' | 'untouched' {
  const mainAnswer = answers[question.id];

  // For questions without sub-questions, check the main answer
  if (!question.subQuestions || question.subQuestions.length === 0) {
    if (!mainAnswer || !hasValidAnswer(mainAnswer.answer)) {
      return 'untouched';
    }
    return 'completed';
  }

  // For questions with sub-questions
  if (question.scoringStrategy === 'partial') {
    let answeredSubQuestions = 0;
    const totalSubQuestions = question.subQuestions.length;

    // Check answers for each sub-question
    for (const subQ of question.subQuestions) {
      const subAnswer = answers[subQ.subId];
      if (subAnswer && hasValidAnswer(subAnswer.answer)) {
        answeredSubQuestions++;
      }
    }

    // Also check if answers are stored in the main answer object
    if (mainAnswer && typeof mainAnswer.answer === 'object' && mainAnswer.answer !== null) {
      const subAnswers = mainAnswer.answer as Record<string, unknown>;
      for (const subQ of question.subQuestions) {
        if (hasValidAnswer(subAnswers[subQ.subId])) {
          answeredSubQuestions++;
        }
      }
    }

    if (answeredSubQuestions === 0) {
      return 'untouched';
    } else if (answeredSubQuestions >= totalSubQuestions) {
      return 'completed';
    } else {
      return 'partial';
    }
  } else {
    // All-or-nothing strategy
    if (!mainAnswer || !hasValidAnswer(mainAnswer.answer)) {
      return 'untouched';
    }
    return 'completed';
  }
}

/**
 * Creates a default UserAnswer with proper defaults
 */
export function createDefaultUserAnswer(
  questionId: string,
  answer: unknown,
  sectionId: string,
  questionType: string,
  questionIndex: number,
  subQuestionId?: string,
  parentQuestionId?: string
): Omit<UserAnswer, 'isCorrect' | 'score' | 'maxScore' | 'feedback'> {
  return {
    questionId,
    answer,
    sectionId,
    questionType: questionType as UserAnswer['questionType'],
    questionIndex,
    subQuestionId,
    parentQuestionId,
  };
}

/**
 * Handles scoring strategy for different question types
 */
export class ScoringStrategyHandler {
  /**
   * Determines if a question should be scored immediately or deferred
   */
  static shouldScoreImmediately(question: Question): boolean {
    // Questions that don't require AI scoring can be scored immediately
    const immediateTypes = [
      'multiple-choice',
      'completion',
      'matching',
      'labeling',
      'pick-from-list',
      'pick-from-a-list',
      'true-false-not-given',
      'matching-headings',
      'short-answer'
    ];

    return immediateTypes.includes(question.type);
  }

  /**
   * Determines if a question requires AI scoring
   */
  static requiresAiScoring(question: Question): boolean {
    const aiTypes = [
      'writing-task1',
      'writing-task2',
      'sentence-translation',
      'word-form'
    ];

    return aiTypes.includes(question.type);
  }

  /**
   * Determines if a question might require manual review
   */
  static mightRequireManualReview(question: Question): boolean {
    const manualReviewTypes = [
      'writing-task1',
      'writing-task2',
      'sentence-translation'
    ];

    return manualReviewTypes.includes(question.type);
  }
}

/**
 * Error handling utilities for scoring
 */
export class ScoringErrorHandler {
  /**
   * Creates a standardized error result for scoring failures
   */
  static createErrorResult(
    error: Error | string,
    maxScore: number = 0,
    _questionId?: string
  ): {
    isCorrect: false;
    score: 0;
    maxScore: number;
    feedback: string;
    error: {
      code: string;
      message: string;
    };
  } {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    return {
      isCorrect: false,
      score: 0,
      maxScore,
      feedback: `Scoring failed: ${errorMessage}`,
      error: {
        code: 'SCORING_ERROR',
        message: errorMessage,
      },
    };
  }

  /**
   * Logs scoring errors in a consistent format
   */
  static logScoringError(
    error: Error | string,
    context: {
      questionId?: string;
      questionType?: string;
      subQuestionId?: string;
    }
  ): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const contextStr = Object.entries(context)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    console.error(`Scoring error [${contextStr}]: ${errorMessage}`, error);
  }
}

/**
 * Utility functions for working with answer formats
 */
export class AnswerFormatUtils {
  /**
   * Normalizes string answers for comparison
   */
  static normalizeStringAnswer(answer: string): string {
    return answer.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /**
   * Checks if two string answers are equivalent
   */
  static areStringAnswersEqual(answer1: string, answer2: string): boolean {
    return this.normalizeStringAnswer(answer1) === this.normalizeStringAnswer(answer2);
  }

  /**
   * Extracts sub-answers from a composite answer object
   */
  static extractSubAnswers(answer: unknown): Record<string, unknown> {
    if (typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
      return answer as Record<string, unknown>;
    }
    return {};
  }

  /**
   * Checks if an answer matches any of the acceptable answers
   */
  static matchesAcceptableAnswer(
    userAnswer: string,
    acceptableAnswers: string[]
  ): boolean {
    const normalizedUserAnswer = this.normalizeStringAnswer(userAnswer);
    
    return acceptableAnswers.some(acceptable => 
      this.normalizeStringAnswer(acceptable) === normalizedUserAnswer
    );
  }
}

/**
 * Utility functions for score aggregation
 */
export class ScoreAggregationUtils {
  /**
   * Safely adds two scores, handling undefined/null values
   */
  static addScores(score1: number | undefined, score2: number | undefined): number {
    return (score1 || 0) + (score2 || 0);
  }

  /**
   * Calculates the total score for a collection of answers
   */
  static calculateTotalScore(answers: UserAnswer[]): {
    totalScore: number;
    maxPossibleScore: number;
  } {
    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const answer of answers) {
      totalScore = this.addScores(totalScore, answer.score);
      maxPossibleScore = this.addScores(maxPossibleScore, answer.maxScore);
    }

    return {
      totalScore: normalizeScore(totalScore, maxPossibleScore),
      maxPossibleScore,
    };
  }

  /**
   * Groups answers by their parent question for aggregation
   */
  static groupAnswersByQuestion(answers: Record<string, UserAnswer>): Record<string, UserAnswer[]> {
    const grouped: Record<string, UserAnswer[]> = {};

    for (const [_key, answer] of Object.entries(answers)) {
      const questionId = answer.parentQuestionId || answer.questionId;
      
      if (!grouped[questionId]) {
        grouped[questionId] = [];
      }
      
      grouped[questionId].push(answer);
    }

    return grouped;
  }
}