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
}

export interface ScoringResult {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  feedback?: string;
  requiresManualReview?: boolean;
  aiScored?: boolean;
  metadata?: {
    selectedAnswer?: {
      id?: string;
      text?: string;
    };
    correctAnswer?: {
      id?: string;
      text?: string;
    };
    [key: string]: unknown; // Allow additional metadata
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
  onUpdateQuestion: (sectionId: string, questionId: string, updates: Partial<T>) => void;
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
    return Array.from(this.plugins.values()).filter(plugin => 
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
  
  static getRenderer(type: QuestionType): React.ComponentType<QuestionRendererProps> | undefined {
    const plugin = this.getPlugin(type);
    return plugin?.createRenderer();
  }
  
  static getEditor(type: QuestionType): React.ComponentType<QuestionEditorProps> | undefined {
    const plugin = this.getPlugin(type);
    return plugin?.createEditor();
  }
  
  static transformQuestion(question: Question): StandardQuestion {
    const plugin = this.getPlugin(question.type);
    if (!plugin) {
      throw new Error(`No plugin registered for question type: ${question.type}`);
    }
    return plugin.transform(question);
  }
  
  static validateQuestion(question: Question): ValidationResult {
    const plugin = this.getPlugin(question.type);
    if (!plugin) {
      return {
        isValid: false,
        errors: [`No plugin registered for question type: ${question.type}`],
        warnings: []
      };
    }
    return plugin.validate(question);
  }
  
  static async scoreQuestion(context: ScoringContext): Promise<ScoringResult> {
    const plugin = this.getPlugin(context.question.type);
    if (!plugin) {
      return {
        isCorrect: false,
        score: 0,
        maxScore: context.question.points,
        feedback: `No plugin registered for question type: ${context.question.type}`,
      };
    }
    
    try {
      const result = plugin.score(context);
      return result instanceof Promise ? await result : result;
    } catch (error) {
      console.error(`Error scoring question ${context.question.type}:`, error);
      return {
        isCorrect: false,
        score: 0,
        maxScore: context.question.points,
        feedback: `Error occurred while scoring: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
  
  // Helper function to check if a question type supports partial scoring
  static supportsPartialScoring(type: QuestionType): boolean {
    const plugin = this.getPlugin(type);
    return plugin?.config.supportsPartialScoring ?? false;
  }
  

}

// Base plugin class to reduce boilerplate
export abstract class BaseQuestionPlugin<T extends Question> implements QuestionPlugin<T> {
  abstract config: QuestionPluginConfig;
  
  abstract createRenderer(): React.ComponentType<QuestionRendererProps<T>>;
  abstract createEditor(): React.ComponentType<QuestionEditorProps<T>>;
  abstract createDefault(index: number): T;
  abstract transform(question: T): StandardQuestion;
  
  // Abstract scoring method - must be implemented by each plugin
  abstract score(context: ScoringContext): ScoringResult | Promise<ScoringResult>;
  
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
      warnings
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
  import("./plugins/multiple-choice-plugin").then(({ MultipleChoicePlugin }) => {
    QuestionPluginRegistry.register(new MultipleChoicePlugin());
  }).catch(console.error);
  
  import("./plugins/completion-plugin").then(({ CompletionPlugin }) => {
    QuestionPluginRegistry.register(new CompletionPlugin());
  }).catch(console.error);
  
  import("./plugins/matching-plugin").then(({ MatchingPlugin }) => {
    QuestionPluginRegistry.register(new MatchingPlugin());
  }).catch(console.error);
  
  import("./plugins/pick-from-list-plugin").then(({ PickFromListPlugin }) => {
    QuestionPluginRegistry.register(new PickFromListPlugin());
  }).catch(console.error);
  
  import("./plugins/true-false-not-given-plugin").then(({ TrueFalseNotGivenPlugin }) => {
    QuestionPluginRegistry.register(new TrueFalseNotGivenPlugin());
  }).catch(console.error);
  
  import("./plugins/labeling-plugin").then(({ LabelingPlugin }) => {
    QuestionPluginRegistry.register(new LabelingPlugin());
  }).catch(console.error);
  
  import("./plugins/matching-headings-plugin").then(({ MatchingHeadingsPlugin }) => {
    QuestionPluginRegistry.register(new MatchingHeadingsPlugin());
  }).catch(console.error);
  
  import("./plugins/short-answer-plugin").then(({ shortAnswerPlugin }) => {
    QuestionPluginRegistry.register(shortAnswerPlugin);
  }).catch(console.error);
  
  import("./plugins/writing-task1-plugin").then(({ writingTask1Plugin }) => {
    QuestionPluginRegistry.register(writingTask1Plugin);
  }).catch(console.error);
  
  import("./plugins/sentence-translation-plugin").then(({ sentenceTranslationPlugin }) => {
    QuestionPluginRegistry.register(sentenceTranslationPlugin);
  }).catch(console.error);
  
  import("./plugins/word-form-plugin").then(({ wordFormPlugin }) => {
    QuestionPluginRegistry.register(wordFormPlugin);
  }).catch(console.error);
}

// Auto-initialize plugins when this module is imported
initializeQuestionPlugins();
