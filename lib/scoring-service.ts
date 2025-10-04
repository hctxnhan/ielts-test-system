import { QuestionPluginRegistry } from "./question-plugin-system";
import type { 
  Question, 
  UserAnswer, 
  ScoringStrategy,
  QuestionType 
} from "./types";
import type { 
  ScoringContext, 
  ScoringResult 
} from "./question-plugin-system";

/**
 * Enhanced scoring context for the service layer
 */
export interface ServiceScoringContext extends ScoringContext {
  /** Unique identifier for this scoring attempt */
  scoringId?: string;
  /** Timestamp when scoring was initiated */
  timestamp?: number;
  /** Additional context for manual scoring */
  manualScoringContext?: {
    reviewerId?: string;
    notes?: string;
  };
}

/**
 * Enhanced scoring result with service-level metadata
 */
export interface ServiceScoringResult extends ScoringResult {
  /** Unique identifier for this scoring result */
  scoringId?: string;
  /** Timestamp when scoring was completed */
  timestamp: number;
  /** Indicates if this result needs manual review */
  requiresManualReview?: boolean;
  /** Indicates if this was scored using AI */
  aiScored?: boolean;
  /** Indicates if this was manually scored */
  manualScored?: boolean;
  /** Error information if scoring failed */
  error?: {
    code: string;
    message: string;
    details?: unknown;
    recoverable: boolean;
  };
}

/**
 * Score calculation options
 */
export interface ScoreCalculationOptions {
  /** Whether to recalculate scores from plugins or use cached values */
  recalculate?: boolean;
  /** AI scoring function if available */
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
  /** Whether to include detailed breakdown information */
  includeBreakdown?: boolean;
}

/**
 * Scoring breakdown for detailed analysis
 */
export interface ScoringBreakdown {
  questionId: string;
  questionType: string;
  scoringStrategy: ScoringStrategy;
  totalScore: number;
  maxPossibleScore: number;
  subQuestions?: {
    subId: string;
    score: number;
    maxScore: number;
    isCorrect: boolean;
    feedback?: string;
  }[];
  metadata?: {
    scoringMethod: 'plugin' | 'cached' | 'fallback';
    hasErrors: boolean;
    requiresReview: boolean;
  };
}

/**
 * Centralized scoring service that orchestrates between plugins and utilities
 */
export class ScoringService {
  private static instance: ScoringService | null = null;

  private constructor() {}

  static getInstance(): ScoringService {
    if (!ScoringService.instance) {
      ScoringService.instance = new ScoringService();
    }
    return ScoringService.instance;
  }

  /**
   * Score a single question using the appropriate plugin
   */
  async scoreQuestion(
    context: ServiceScoringContext
  ): Promise<ServiceScoringResult> {
    const timestamp = Date.now();
    const scoringId = context.scoringId || `score_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Validate inputs
      this.validateScoringContext(context);

      // Use plugin system to score
      const pluginResult = await QuestionPluginRegistry.scoreQuestion(context);

      // Enhance result with service metadata
      const serviceResult: ServiceScoringResult = {
        ...pluginResult,
        scoringId,
        timestamp,
        aiScored: pluginResult.aiScored || false,
        manualScored: context.manualScoringContext ? true : false,
      };

      return serviceResult;
    } catch (error) {
      console.error(`Scoring error for question ${context.question.id}:`, error);
      
      return {
        isCorrect: false,
        score: 0,
        maxScore: context.question.points || 0,
        feedback: 'Scoring failed due to an error',
        scoringId,
        timestamp,
        error: {
          code: 'SCORING_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: error,
          recoverable: false,
        },
      };
    }
  }

  /**
   * Calculate the score for a question based on existing answers
   * This replaces the logic currently in test-utils.ts
   */
  async calculateQuestionScore(
    question: Question,
    answers: Record<string, UserAnswer>,
    options: ScoreCalculationOptions = {}
  ): Promise<{
    score: number;
    maxScore: number;
    breakdown?: ScoringBreakdown;
  }> {
    const plugin = QuestionPluginRegistry.getPlugin(question.type);
    
    if (!plugin) {
      return {
        score: 0,
        maxScore: question.points || 0,
        breakdown: {
          questionId: question.id,
          questionType: question.type,
          scoringStrategy: question.scoringStrategy,
          totalScore: 0,
          maxPossibleScore: question.points || 0,
          metadata: {
            scoringMethod: 'fallback',
            hasErrors: true,
            requiresReview: false,
          },
        },
      };
    }

    // For questions with sub-questions and partial scoring
    if (question.subQuestions?.length && question.scoringStrategy === "partial") {
      return this.calculatePartialScore(question, answers, options);
    } else {
      return this.calculateAllOrNothingScore(question, answers, options);
    }
  }

  /**
   * Calculate partial score for questions with sub-questions
   */
  private async calculatePartialScore(
    question: Question,
    answers: Record<string, UserAnswer>,
    options: ScoreCalculationOptions
  ): Promise<{
    score: number;
    maxScore: number;
    breakdown?: ScoringBreakdown;
  }> {
    let totalScore = 0;
    let totalMaxScore = 0;
    const subQuestionBreakdown: ScoringBreakdown['subQuestions'] = [];

    if (!question.subQuestions) {
      return { score: 0, maxScore: 0 };
    }

    for (const subQ of question.subQuestions) {
      const answer = answers[subQ.subId];
      let subScore = 0;
      let subMaxScore = subQ.points || 0;
      let isCorrect = false;
      let feedback = '';

      if (answer) {
        if (options.recalculate && options.aiScoringFn) {
          // Recalculate using plugin
          try {
            const scoringResult = await this.scoreQuestion({
              question,
              answer: answer.answer,
              subQuestionId: subQ.subId,
              aiScoringFn: options.aiScoringFn,
            });
            
            subScore = scoringResult.score;
            subMaxScore = scoringResult.maxScore;
            isCorrect = scoringResult.isCorrect;
            feedback = scoringResult.feedback || '';
          } catch (error) {
            console.error(`Error recalculating score for sub-question ${subQ.subId}:`, error);
            // Fall back to cached values
            subScore = answer.score || 0;
            subMaxScore = answer.maxScore || subQ.points || 0;
            isCorrect = answer.isCorrect || false;
            feedback = answer.feedback || '';
          }
        } else {
          // Use cached values
          subScore = answer.score || 0;
          subMaxScore = answer.maxScore || subQ.points || 0;
          isCorrect = answer.isCorrect || false;
          feedback = answer.feedback || '';
        }
      } else {
        // No answer submitted for this sub-question
        subMaxScore = subQ.points || 0;
      }

      totalScore += subScore;
      totalMaxScore += subMaxScore;

      if (options.includeBreakdown) {
        subQuestionBreakdown.push({
          subId: subQ.subId,
          score: subScore,
          maxScore: subMaxScore,
          isCorrect,
          feedback,
        });
      }
    }

    const result = {
      score: totalScore,
      maxScore: totalMaxScore,
    };

    if (options.includeBreakdown) {
      return {
        ...result,
        breakdown: {
          questionId: question.id,
          questionType: question.type,
          scoringStrategy: question.scoringStrategy,
          totalScore,
          maxPossibleScore: totalMaxScore,
          subQuestions: subQuestionBreakdown,
          metadata: {
            scoringMethod: options.recalculate ? 'plugin' : 'cached',
            hasErrors: false,
            requiresReview: false,
          },
        },
      };
    }

    return result;
  }

  /**
   * Calculate all-or-nothing score for single questions or composite questions
   */
  private async calculateAllOrNothingScore(
    question: Question,
    answers: Record<string, UserAnswer>,
    options: ScoreCalculationOptions
  ): Promise<{
    score: number;
    maxScore: number;
    breakdown?: ScoringBreakdown;
  }> {
    const answer = answers[question.id];
    let score = 0;
    let maxScore = question.points || 0;
    let scoringMethod: 'plugin' | 'cached' | 'fallback' = 'fallback';

    if (answer) {
      if (options.recalculate && options.aiScoringFn) {
        // Recalculate using plugin
        try {
          const scoringResult = await this.scoreQuestion({
            question,
            answer: answer.answer,
            aiScoringFn: options.aiScoringFn,
          });
          
          score = scoringResult.score;
          maxScore = scoringResult.maxScore;
          scoringMethod = 'plugin';
        } catch (error) {
          console.error(`Error recalculating score for question ${question.id}:`, error);
          // Fall back to cached values
          score = answer.score || 0;
          maxScore = answer.maxScore || question.points || 0;
          scoringMethod = 'cached';
        }
    } else {
      // Use cached values
      score = answer.score || 0;
      maxScore = answer.maxScore || question.points || 0;
      scoringMethod = 'cached';
    }
    } else {
      // No answer submitted
      maxScore = question.points || 0;
      scoringMethod = 'fallback';
    }

    const result = {
      score,
      maxScore,
    };

    if (options.includeBreakdown) {
      return {
        ...result,
        breakdown: {
          questionId: question.id,
          questionType: question.type,
          scoringStrategy: question.scoringStrategy,
          totalScore: score,
          maxPossibleScore: maxScore,
          metadata: {
            scoringMethod,
            hasErrors: false,
            requiresReview: answer?.feedback?.includes('manual review') || false,
          },
        },
      };
    }

    return result;
  }

  /**
   * Validate scoring context before processing
   */
  private validateScoringContext(context: ServiceScoringContext): void {
    if (!context.question) {
      throw new Error('Question is required in scoring context');
    }

    if (!context.question.id) {
      throw new Error('Question ID is required');
    }

    if (!context.question.type) {
      throw new Error('Question type is required');
    }

    // Validate that plugin exists for this question type
    const plugin = QuestionPluginRegistry.getPlugin(context.question.type);
    if (!plugin) {
      throw new Error(`No plugin found for question type: ${context.question.type}`);
    }
  }

  /**
   * Create a UserAnswer from a scoring result
   */
  createUserAnswer(
    questionId: string,
    answer: unknown,
    scoringResult: ServiceScoringResult,
    sectionId: string,
    questionType: string,
    questionIndex: number,
    subQuestionId?: string,
    parentQuestionId?: string
  ): UserAnswer {
    return {
      questionId,
      answer,
      isCorrect: scoringResult.isCorrect,
      score: scoringResult.score,
      maxScore: scoringResult.maxScore,
      feedback: scoringResult.feedback || '',
      subQuestionId,
      sectionId,
      questionType: questionType as QuestionType,
      questionIndex,
      parentQuestionId,
    };
  }
}

// Export singleton instance
export const scoringService = ScoringService.getInstance();