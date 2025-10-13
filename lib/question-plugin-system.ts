import React from "react";
import type { Question, QuestionType, TestType } from "./types";
import type { StandardQuestion } from "./standardized-types";

// Base interfaces for the plugin system
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ScoringContext {
  question: Question;
  answer: unknown;
  subQuestionId?: string;
  previousAnswers?: Record<string, unknown>;
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
  /** Additional context for enhanced scoring */
  scoringOptions?: {
    /** Unique identifier for this scoring attempt */
    scoringId?: string;
    /** Whether to prioritize speed over accuracy */
    fastScoring?: boolean;
    /** Whether to include detailed explanations */
    includeExplanations?: boolean;
    /** Custom scoring parameters */
    customParams?: Record<string, unknown>;
  };
}

export interface ScoringResult {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  feedback?: string;
  requiresManualReview?: boolean;
  aiScored?: boolean;
  /** Enhanced metadata for detailed feedback and analysis */
  metadata?: {
    selectedAnswer?: {
      id?: string;
      text?: string;
    };
    correctAnswer?: {
      id?: string;
      text?: string;
    };
    /** Confidence level of the scoring (0-1) */
    confidence?: number;
    /** Time taken to score in milliseconds */
    scoringTime?: number;
    /** Alternative valid answers that would also be correct */
    alternativeAnswers?: Array<{
      answer: string;
      explanation: string;
    }>;
    /** Detailed explanation of why the answer is correct/incorrect */
    explanation?: string;
    /** Partial credit breakdown for complex answers */
    partialCreditBreakdown?: Array<{
      component: string;
      score: number;
      maxScore: number;
      feedback: string;
    }>;
    [key: string]: unknown; // Allow additional metadata
  };
  /** Error information if scoring encountered issues */
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

export interface QuestionRendererProps<T extends Question = Question> {
  question: T;
  value: unknown;
  onChange: (value: unknown, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (questionId: string, content: string) => void;
}

export interface QuestionEditorProps<T extends Question = Question> {
  question: T;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<T>
  ) => void;
}

export interface QuestionPluginConfig {
  type: QuestionType;
  displayName: string;
  description: string;
  icon: string;
  category: TestType[];
  supportsPartialScoring: boolean;
  supportsAIScoring: boolean;
  defaultPoints: number;
  scoreOnCompletion?: boolean; // If true, scoring happens when test is completed instead of immediately after each answer is submitted
  hasSubQuestions?: boolean; // If true, the question has sub-questions with complex answer structure

  /** Enhanced scoring configuration */
  scoringConfig?: {
    /** Maximum time allowed for scoring in milliseconds */
    maxScoringTime?: number;
    /** Whether this question type supports confidence scoring */
    supportsConfidenceScoring?: boolean;
    /** Whether this question type can provide alternative correct answers */
    supportsAlternativeAnswers?: boolean;
    /** Whether this question type supports partial credit breakdown */
    supportsPartialCreditBreakdown?: boolean;
    /** Default confidence level for deterministic scoring */
    defaultConfidence?: number;
    /** Whether scoring results should be cached */
    cacheScoringResults?: boolean;
    /** Priority level for scoring (higher = process first) */
    scoringPriority?: number;
  };
}

export interface QuestionPlugin<T extends Question = Question> {
  config: QuestionPluginConfig;

  // Component factories
  createRenderer(): React.ComponentType<QuestionRendererProps<T>>;
  createEditor(): React.ComponentType<QuestionEditorProps<T>>;

  // Data management
  createDefault(index: number): T;
  transform(question: T): StandardQuestion;
  validate(question: T): ValidationResult;

  // Scoring
  score(context: ScoringContext): ScoringResult | Promise<ScoringResult>;

  // Type guard
  isQuestionOfType(question: Question): question is T;
}

// Plugin Registry
export class QuestionPluginRegistry {
  private static plugins = new Map<QuestionType, QuestionPlugin>();

  static register<T extends Question>(plugin: QuestionPlugin<T>): void {
    this.plugins.set(plugin.config.type, plugin as unknown as QuestionPlugin);
  }

  static getPlugin(type: QuestionType): QuestionPlugin | undefined {
    return this.plugins.get(type);
  }

  static getAllPlugins(): QuestionPlugin[] {
    return Array.from(this.plugins.values());
  }

  static getPluginsByCategory(category: TestType): QuestionPlugin[] {
    return Array.from(this.plugins.values()).filter((plugin) =>
      plugin.config.category.includes(category)
    );
  }

  static hasPlugin(type: QuestionType): boolean {
    return this.plugins.has(type);
  }

  // Factory methods
  static createQuestion(type: QuestionType, index: number = 0): Question {
    const plugin = this.getPlugin(type);
    if (!plugin) {
      throw new Error(`No plugin registered for question type: ${type}`);
    }
    return plugin.createDefault(index);
  }

  static getRenderer(
    type: QuestionType
  ): React.ComponentType<QuestionRendererProps> | undefined {
    const plugin = this.getPlugin(type);
    return plugin?.createRenderer();
  }

  static getEditor(
    type: QuestionType
  ): React.ComponentType<QuestionEditorProps> | undefined {
    const plugin = this.getPlugin(type);
    return plugin?.createEditor();
  }

  static transformQuestion(question: Question): StandardQuestion {
    const plugin = this.getPlugin(question.type);
    if (!plugin) {
      throw new Error(
        `No plugin registered for question type: ${question.type}`
      );
    }
    return plugin.transform(question);
  }

  static validateQuestion(question: Question): ValidationResult {
    const plugin = this.getPlugin(question.type);
    if (!plugin) {
      return {
        isValid: false,
        errors: [`No plugin registered for question type: ${question.type}`],
        warnings: [],
      };
    }
    return plugin.validate(question);
  }

  static async scoreQuestion(context: ScoringContext): Promise<ScoringResult> {
    const startTime = Date.now();
    const plugin = this.getPlugin(context.question.type);

    if (!plugin) {
      return {
        isCorrect: false,
        score: 0,
        maxScore: context.question.points,
        feedback: `No plugin registered for question type: ${context.question.type}`,
        error: {
          code: "PLUGIN_NOT_FOUND",
          message: `No plugin registered for question type: ${context.question.type}`,
          recoverable: false,
        },
      };
    }

    try {
      // Check if scoring should be limited by time
      const maxScoringTime = plugin.config.scoringConfig?.maxScoringTime;
      let scoringPromise = plugin.score(context);

      if (!(scoringPromise instanceof Promise)) {
        scoringPromise = Promise.resolve(scoringPromise);
      }

      // Apply timeout if configured
      if (maxScoringTime) {
        scoringPromise = Promise.race([
          scoringPromise,
          new Promise<ScoringResult>((_, reject) =>
            setTimeout(
              () => reject(new Error("Scoring timeout")),
              maxScoringTime
            )
          ),
        ]);
      }

      const result = await scoringPromise;
      const scoringTime = Date.now() - startTime;

      // Enhance result with timing and confidence information
      return {
        ...result,
        metadata: {
          ...result.metadata,
          scoringTime,
          confidence:
            result.metadata?.confidence ??
            plugin.config.scoringConfig?.defaultConfidence ??
            1.0,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Error scoring question ${context.question.type}:`, error);

      return {
        isCorrect: false,
        score: 0,
        maxScore: context.question.points || 0,
        feedback: `Error occurred while scoring: ${errorMessage}`,
        error: {
          code:
            error instanceof Error && error.message === "Scoring timeout"
              ? "SCORING_TIMEOUT"
              : "SCORING_ERROR",
          message: errorMessage,
          recoverable: true,
        },
        metadata: {
          scoringTime: Date.now() - startTime,
        },
      };
    }
  }

  // Enhanced helper functions
  static supportsPartialScoring(type: QuestionType): boolean {
    const plugin = this.getPlugin(type);
    return plugin?.config.supportsPartialScoring ?? false;
  }

  static hasSubQuestions(type: QuestionType): boolean {
    const plugin = this.getPlugin(type);
    return plugin?.config.hasSubQuestions ?? false;
  }

  static supportsAIScoring(type: QuestionType): boolean {
    const plugin = this.getPlugin(type);
    return plugin?.config.supportsAIScoring ?? false;
  }

  static getScoringPriority(type: QuestionType): number {
    const plugin = this.getPlugin(type);
    return plugin?.config.scoringConfig?.scoringPriority ?? 0;
  }

  static getMaxScoringTime(type: QuestionType): number | undefined {
    const plugin = this.getPlugin(type);
    return plugin?.config.scoringConfig?.maxScoringTime;
  }

  // Get plugins sorted by scoring priority
  static getPluginsByPriority(): Array<{
    type: QuestionType;
    plugin: QuestionPlugin;
    priority: number;
  }> {
    return Array.from(this.plugins.entries())
      .map(([type, plugin]) => ({
        type,
        plugin,
        priority: plugin.config.scoringConfig?.scoringPriority ?? 0,
      }))
      .sort((a, b) => b.priority - a.priority);
  }
}

// Base plugin class to reduce boilerplate
export abstract class BaseQuestionPlugin<T extends Question>
  implements QuestionPlugin<T>
{
  abstract config: QuestionPluginConfig;

  abstract createRenderer(): React.ComponentType<QuestionRendererProps<T>>;
  abstract createEditor(): React.ComponentType<QuestionEditorProps<T>>;
  abstract createDefault(index: number): T;
  abstract transform(question: T): StandardQuestion;

  // Abstract scoring method - must be implemented by each plugin
  abstract score(
    context: ScoringContext
  ): ScoringResult | Promise<ScoringResult>;

  // Default validation - can be overridden
  validate(question: T): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!question.text?.trim()) {
      errors.push("Question text is required");
    }

    if (question.points <= 0) {
      errors.push("Question points must be greater than 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Default type guard
  isQuestionOfType(question: Question): question is T {
    return question.type === this.config.type;
  }
}

// Plugin initialization helper
export function initializeQuestionPlugins(): void {
  // This will be called to register all plugins
  // Import and register plugins
  import("./plugins/multiple-choice-plugin")
    .then(({ MultipleChoicePlugin }) => {
      QuestionPluginRegistry.register(new MultipleChoicePlugin());
    })
    .catch(console.error);

  import("./plugins/completion-plugin")
    .then(({ CompletionPlugin }) => {
      QuestionPluginRegistry.register(new CompletionPlugin());
    })
    .catch(console.error);

  import("./plugins/matching-plugin")
    .then(({ MatchingPlugin }) => {
      QuestionPluginRegistry.register(new MatchingPlugin());
    })
    .catch(console.error);

  import("./plugins/pick-from-list-plugin")
    .then(({ PickFromListPlugin }) => {
      QuestionPluginRegistry.register(new PickFromListPlugin());
    })
    .catch(console.error);

  import("./plugins/true-false-not-given-plugin")
    .then(({ TrueFalseNotGivenPlugin }) => {
      QuestionPluginRegistry.register(new TrueFalseNotGivenPlugin());
    })
    .catch(console.error);

  import("./plugins/labeling-plugin")
    .then(({ LabelingPlugin }) => {
      QuestionPluginRegistry.register(new LabelingPlugin());
    })
    .catch(console.error);

  import("./plugins/matching-headings-plugin")
    .then(({ MatchingHeadingsPlugin }) => {
      QuestionPluginRegistry.register(new MatchingHeadingsPlugin());
    })
    .catch(console.error);

  import("./plugins/short-answer-plugin")
    .then(({ shortAnswerPlugin }) => {
      QuestionPluginRegistry.register(shortAnswerPlugin);
    })
    .catch(console.error);

  import("./plugins/writing-task1-plugin")
    .then(({ writingTask1Plugin }) => {
      QuestionPluginRegistry.register(writingTask1Plugin);
    })
    .catch(console.error);

  import("./plugins/writing-task2-plugin")
    .then(({ writingTask2Plugin }) => {
      QuestionPluginRegistry.register(writingTask2Plugin);
    })
    .catch(console.error);

  import("./plugins/sentence-translation-plugin")
    .then(({ sentenceTranslationPlugin }) => {
      QuestionPluginRegistry.register(sentenceTranslationPlugin);
    })
    .catch(console.error);

  import("./plugins/word-form-plugin")
    .then(({ wordFormPlugin }) => {
      QuestionPluginRegistry.register(wordFormPlugin);
    })
    .catch(console.error);
}

// Auto-initialize plugins when this module is imported
initializeQuestionPlugins();
