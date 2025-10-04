/**
 * Comprehensive test and validation framework for the scoring system
 * This file contains utilities to test and validate that all question types
 * work correctly with the new scoring architecture
 */

import { scoringService } from "./scoring-service";
import { QuestionPluginRegistry } from "./question-plugin-system";
import type { 
  Question, 
  UserAnswer, 
  QuestionType,
  Test
} from "./types";
import type { 
  ServiceScoringContext,
  ScoringTestConfig,
  EnhancedTestResult 
} from "./scoring-types";

/**
 * Test case definition for scoring validation
 */
export interface ScoringTestCase {
  description: string;
  question: Question;
  answer: unknown;
  subQuestionId?: string;
  expectedScore: number;
  expectedMaxScore: number;
  expectedIsCorrect: boolean;
  expectedFeedback?: string;
  shouldRequireAi?: boolean;
  shouldRequireManualReview?: boolean;
}

/**
 * Validation result for a single test case
 */
export interface TestCaseResult {
  testCase: ScoringTestCase;
  passed: boolean;
  actualResult: {
    score: number;
    maxScore: number;
    isCorrect: boolean;
    feedback?: string;
    requiresManualReview?: boolean;
    aiScored?: boolean;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Overall scoring validation report
 */
export interface ScoringValidationReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testResults: TestCaseResult[];
  summary: {
    byQuestionType: Record<QuestionType, {
      total: number;
      passed: number;
      failed: number;
    }>;
    byScoringStrategy: {
      partial: { total: number; passed: number; failed: number };
      allOrNothing: { total: number; passed: number; failed: number };
    };
  };
  overallStatus: 'PASSED' | 'FAILED' | 'WARNING';
}

/**
 * Main scoring validation class
 */
export class ScoringValidator {
  private testCases: ScoringTestCase[] = [];
  private aiScoringFn?: ServiceScoringContext['aiScoringFn'];

  constructor(aiScoringFn?: ServiceScoringContext['aiScoringFn']) {
    this.aiScoringFn = aiScoringFn;
  }

  /**
   * Add a test case to the validation suite
   */
  addTestCase(testCase: ScoringTestCase): void {
    this.testCases.push(testCase);
  }

  /**
   * Add multiple test cases
   */
  addTestCases(testCases: ScoringTestCase[]): void {
    this.testCases.push(...testCases);
  }

  /**
   * Run all validation tests
   */
  async runValidation(): Promise<ScoringValidationReport> {
    const testResults: TestCaseResult[] = [];

    for (const testCase of this.testCases) {
      try {
        const result = await this.runSingleTest(testCase);
        testResults.push(result);
      } catch (error) {
        testResults.push({
          testCase,
          passed: false,
          actualResult: {
            score: 0,
            maxScore: 0,
            isCorrect: false,
            feedback: `Test execution error: ${error instanceof Error ? error.message : String(error)}`,
          },
          errors: [`Test execution error: ${error instanceof Error ? error.message : String(error)}`],
          warnings: [],
        });
      }
    }

    return this.generateReport(testResults);
  }

  /**
   * Run a single test case
   */
  private async runSingleTest(testCase: ScoringTestCase): Promise<TestCaseResult> {
    const context: ServiceScoringContext = {
      question: testCase.question,
      answer: testCase.answer,
      subQuestionId: testCase.subQuestionId,
      aiScoringFn: this.aiScoringFn,
      scoringId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const scoringResult = await scoringService.scoreQuestion(context);

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate scoring result
    if (scoringResult.score !== testCase.expectedScore) {
      errors.push(`Expected score ${testCase.expectedScore}, got ${scoringResult.score}`);
    }

    if (scoringResult.maxScore !== testCase.expectedMaxScore) {
      errors.push(`Expected maxScore ${testCase.expectedMaxScore}, got ${scoringResult.maxScore}`);
    }

    if (scoringResult.isCorrect !== testCase.expectedIsCorrect) {
      errors.push(`Expected isCorrect ${testCase.expectedIsCorrect}, got ${scoringResult.isCorrect}`);
    }

    if (testCase.expectedFeedback && !scoringResult.feedback?.includes(testCase.expectedFeedback)) {
      warnings.push(`Expected feedback to contain "${testCase.expectedFeedback}", got "${scoringResult.feedback}"`);
    }

    if (testCase.shouldRequireAi && !scoringResult.aiScored) {
      warnings.push(`Expected AI scoring to be used, but it wasn't`);
    }

    if (testCase.shouldRequireManualReview && !scoringResult.requiresManualReview) {
      warnings.push(`Expected manual review to be required, but it wasn't`);
    }

    return {
      testCase,
      passed: errors.length === 0,
      actualResult: {
        score: scoringResult.score,
        maxScore: scoringResult.maxScore,
        isCorrect: scoringResult.isCorrect,
        feedback: scoringResult.feedback,
        requiresManualReview: scoringResult.requiresManualReview,
        aiScored: scoringResult.aiScored,
      },
      errors,
      warnings,
    };
  }

  /**
   * Generate validation report
   */
  private generateReport(testResults: TestCaseResult[]): ScoringValidationReport {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    // Group by question type
    const byQuestionType: Record<string, { total: number; passed: number; failed: number }> = {};
    for (const result of testResults) {
      const type = result.testCase.question.type;
      if (!byQuestionType[type]) {
        byQuestionType[type] = { total: 0, passed: 0, failed: 0 };
      }
      byQuestionType[type].total++;
      if (result.passed) {
        byQuestionType[type].passed++;
      } else {
        byQuestionType[type].failed++;
      }
    }

    // Group by scoring strategy
    const byScoringStrategy = {
      partial: { total: 0, passed: 0, failed: 0 },
      allOrNothing: { total: 0, passed: 0, failed: 0 },
    };

    for (const result of testResults) {
      const strategy = result.testCase.question.scoringStrategy;
      if (strategy === 'partial') {
        byScoringStrategy.partial.total++;
        if (result.passed) byScoringStrategy.partial.passed++;
        else byScoringStrategy.partial.failed++;
      } else {
        byScoringStrategy.allOrNothing.total++;
        if (result.passed) byScoringStrategy.allOrNothing.passed++;
        else byScoringStrategy.allOrNothing.failed++;
      }
    }

    const overallStatus: ScoringValidationReport['overallStatus'] = 
      failedTests === 0 ? 'PASSED' : 
      failedTests / totalTests > 0.5 ? 'FAILED' : 'WARNING';

    return {
      totalTests,
      passedTests,
      failedTests,
      testResults,
      summary: {
        byQuestionType: byQuestionType as Record<QuestionType, { total: number; passed: number; failed: number }>,
        byScoringStrategy,
      },
      overallStatus,
    };
  }

  /**
   * Generate default test cases for all registered question types
   */
  static generateDefaultTestCases(): ScoringTestCase[] {
    const testCases: ScoringTestCase[] = [];
    const plugins = QuestionPluginRegistry.getAllPlugins();

    for (const plugin of plugins) {
      const type = plugin.config.type;
      
      // Create a default question for this type
      const defaultQuestion = plugin.createDefault(1);
      
      // Add basic test cases for each type
      testCases.push({
        description: `${type} - basic test with empty answer`,
        question: defaultQuestion,
        answer: type === 'multiple-choice' ? '' : {},
        expectedScore: 0,
        expectedMaxScore: defaultQuestion.points,
        expectedIsCorrect: false,
      });

      // Add AI scoring test cases for supported types
      if (plugin.config.supportsAIScoring) {
        testCases.push({
          description: `${type} - AI scoring test`,
          question: defaultQuestion,
          answer: 'Sample answer for AI scoring',
          expectedScore: 0, // Will depend on AI
          expectedMaxScore: defaultQuestion.points,
          expectedIsCorrect: false, // Default to false until AI scores
          shouldRequireAi: true,
        });
      }

      // Add partial scoring test cases for supported types
      if (plugin.config.supportsPartialScoring && plugin.config.hasSubQuestions) {
        testCases.push({
          description: `${type} - partial scoring test`,
          question: defaultQuestion,
          answer: {},
          expectedScore: 0, // Will depend on specific sub-question answers
          expectedMaxScore: defaultQuestion.points,
          expectedIsCorrect: false,
        });
      }
    }

    return testCases;
  }
}

/**
 * Integration test utilities for testing complete workflows
 */
export class ScoringIntegrationTester {
  /**
   * Test complete test scoring workflow
   */
  static async testCompleteWorkflow(
    test: Test,
    answerSets: Array<{ sectionId: string; answers: Record<string, unknown> }>,
    config?: ScoringTestConfig
  ): Promise<{
    success: boolean;
    results: EnhancedTestResult[];
    errors: string[];
  }> {
    const results: EnhancedTestResult[] = [];
    const errors: string[] = [];

    try {
      // Simulate the complete test workflow
      for (const answerSet of answerSets) {
        // Create mock answers in UserAnswer format
        const userAnswers: Record<string, UserAnswer> = {};
        
        const section = test.sections.find(s => s.id === answerSet.sectionId);
        if (!section) {
          errors.push(`Section ${answerSet.sectionId} not found`);
          continue;
        }

        // Convert raw answers to UserAnswer format
        for (const [questionId, answer] of Object.entries(answerSet.answers)) {
          const question = section.questions.find(q => q.id === questionId);
          if (question) {
            userAnswers[questionId] = {
              questionId,
              answer,
              sectionId: section.id,
              questionType: question.type,
              questionIndex: question.index,
              isCorrect: false, // Will be set by scoring
              score: 0, // Will be set by scoring
              maxScore: question.points || 0,
            };
          }
        }

        // Score all questions using the new scoring service
        for (const question of section.questions) {
          if (userAnswers[question.id]) {
            try {
              const scoringResult = await scoringService.scoreQuestion({
                question,
                answer: userAnswers[question.id].answer,
                aiScoringFn: config?.aiScoringFn,
              });

              // Update user answer with scoring results
              userAnswers[question.id] = {
                ...userAnswers[question.id],
                isCorrect: scoringResult.isCorrect,
                score: scoringResult.score,
                maxScore: scoringResult.maxScore,
                feedback: scoringResult.feedback,
              };
            } catch (error) {
              errors.push(`Error scoring question ${question.id}: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }

      return {
        success: errors.length === 0,
        results,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        errors: [`Workflow test failed: ${error instanceof Error ? error.message : String(error)}`],
      };
    }
  }
}

/**
 * Utility functions for testing specific scenarios
 */
export class ScoringTestUtils {
  /**
   * Create a mock AI scoring function for testing
   */
  static createMockAiScoringFn(
    mockResponses: Record<string, { score: number; feedback: string; ok: boolean }>
  ): ServiceScoringContext['aiScoringFn'] {
    return async (params) => {
      const key = `${params.text}_${params.prompt}`.substring(0, 50);
      const response = mockResponses[key] || mockResponses['default'];
      
      if (response) {
        return response;
      }
      
      // Default random response for testing
      return {
        score: Math.random(),
        feedback: 'Mock AI feedback',
        ok: true,
      };
    };
  }

  /**
   * Validate that the scoring system maintains consistency
   */
  static async validateScoringConsistency(
    question: Question,
    answer: unknown,
    iterations: number = 10
  ): Promise<{
    consistent: boolean;
    results: Array<{ score: number; maxScore: number; isCorrect: boolean }>;
    variations: number;
  }> {
    const results: Array<{ score: number; maxScore: number; isCorrect: boolean }> = [];

    for (let i = 0; i < iterations; i++) {
      const scoringResult = await scoringService.scoreQuestion({
        question,
        answer,
        scoringId: `consistency_test_${i}`,
      });

      results.push({
        score: scoringResult.score,
        maxScore: scoringResult.maxScore,
        isCorrect: scoringResult.isCorrect,
      });
    }

    // Check for variations in results
    const uniqueResults = new Set(
      results.map(r => `${r.score}_${r.maxScore}_${r.isCorrect}`)
    );

    return {
      consistent: uniqueResults.size === 1,
      results,
      variations: uniqueResults.size,
    };
  }
}

// Export the main validator for external use
export { ScoringValidator as default };