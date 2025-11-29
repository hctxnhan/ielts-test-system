import { create } from "zustand";
import type {
  Test,
  Section,
  Question,
  TestType,
  QuestionType,
  ReadingVariant,
} from "@testComponents/lib/types";
import { QuestionPluginRegistry } from "@testComponents/lib/question-plugin-system";
import { v4 as uuidv4 } from "uuid";

interface CreatorState {
  // Current test being created
  currentTest: Test | null;
  savedTests: Test[];

  // Actions
  createNewTest: (
    type: TestType,
    title: string,
    readingVariant?: ReadingVariant
  ) => void;
  updateTestDetails: (details: Partial<Test>) => void;
  addSection: () => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  removeSection: (sectionId: string) => void;
  addQuestion: (sectionId: string, type: QuestionType) => void;
  updateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>
  ) => void;
  removeQuestion: (sectionId: string, questionId: string) => void;
  reorderQuestion: (
    sectionId: string,
    questionId: string,
    direction: "up" | "down"
  ) => void;
  // saveTest: () => void;
  loadTest: (test: Test) => void;
  deleteTest: (testId: string) => void;

  // Computed
  getSection: (sectionId: string) => Section | undefined;
  getQuestion: (sectionId: string, questionId: string) => Question | undefined;
  calculateTotalDuration: () => number;
  calculateTotalQuestions: () => number;
}

export const useCreatorStore = create<CreatorState>()((set, get) => ({
  currentTest: null,
  savedTests: [],

  createNewTest: (
    type: TestType,
    title: string,
    readingVariant?: ReadingVariant
  ) => {
    const newTest: Test = {
      title,
      type,
      skill: type, // Set skill to be the same as type
      description: "",
      sections: [],
      totalDuration: 0,
      totalQuestions: 0,
      instructions: "",
    };

    // Add reading variant if provided
    if (type === "reading" && readingVariant) {
      newTest.readingVariant = readingVariant;
    }

    // Set default instructions based on test type
    if (type === "listening") {
      newTest.instructions =
        "You will hear a series of recordings and you will have to answer questions based on what you hear. There will be time for you to read the instructions and questions, and you will have a chance to check your answers. The test is in 4 sections. You will hear each section only once.";
    } else if (type === "reading") {
      newTest.instructions =
        "You should spend about 20 minutes on each section. Read the passages and answer the questions. There is no extra time to transfer your answers, so write your answers directly on the answer sheet.";
    } else if (type === "grammar") {
      newTest.instructions =
        "Complete the grammar exercises below. Pay attention to sentence structure, tenses, and language patterns. For translation questions, provide accurate and natural-sounding translations.";
    }

    set({ currentTest: newTest });
  },

  updateTestDetails: (details: Partial<Test>) => {
    const { currentTest } = get();
    if (!currentTest) return;

    set({
      currentTest: {
        ...currentTest,
        ...details,
        totalDuration: get().calculateTotalDuration(),
        totalQuestions: get().calculateTotalQuestions(),
      },
    });
  },

  addSection: () => {
    const { currentTest } = get();
    if (!currentTest) return;

    const newSection: Section = {
      id: uuidv4(),
      title: `Part ${currentTest.sections.length + 1}`,
      description: "",
      questions: [],
      duration: 600, // Default 10 minutes
    };

    // Add type-specific properties
    if (currentTest.type === "listening") {
      newSection.audioUrl = ""; // Add empty audio URL for listening tests
    } else if (currentTest.type === "reading") {
      // Add empty reading passage for reading tests
      newSection.readingPassage = {
        id: uuidv4(),
        title: "",
        content: "",
        hasImages: false,
        imageUrls: [],
      };
    } else if (currentTest.type === "grammar") {
      // Grammar tests don't need special section properties
      // Questions will handle their own specific properties
    }

    set({
      currentTest: {
        ...currentTest,
        sections: [...currentTest.sections, newSection],
        totalDuration: get().calculateTotalDuration() + newSection.duration,
      },
    });
  },

  updateSection: (sectionId: string, updates: Partial<Section>) => {
    const { currentTest } = get();
    if (!currentTest) return;

    const updatedSections = currentTest.sections.map((section) =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    const totalDuration = updatedSections.reduce(
      (sum, section) => sum + (section.duration || 0),
      0
    );
     
    set({
      currentTest: {
        ...currentTest,
        sections: updatedSections,
        totalDuration: totalDuration,
      },
    });
  },

  removeSection: (sectionId: string) => {
    const { currentTest } = get();
    if (!currentTest) return;

    const updatedSections = currentTest.sections.filter(
      (section) => section.id !== sectionId
    );

    const totalDuration = updatedSections.reduce(
      (sum, section) => sum + (section.duration || 0),
      0
    );

    set({
      currentTest: {
        ...currentTest,
        sections: updatedSections,
        totalDuration: totalDuration,
        totalQuestions: get().calculateTotalQuestions(),
      },
    });
  },

  addQuestion: (sectionId: string, type: QuestionType) => {
    const { currentTest } = get();
    if (!currentTest) return;

    const sectionIndex = currentTest.sections.findIndex(
      (section) => section.id === sectionId
    );

    if (sectionIndex === -1) return;

    // Use plugin system to create question
    try {
      const newQuestion = QuestionPluginRegistry.createQuestion(
        type, 
        currentTest.sections[sectionIndex].questions.length
      );
      
      const updatedSections = [...currentTest.sections];
      updatedSections[sectionIndex].questions.push(newQuestion);

      set({
        currentTest: {
          ...currentTest,
          sections: updatedSections,
          totalQuestions: get().calculateTotalQuestions(),
        },
      });
    } catch (error) {
      console.error(`Failed to create question of type ${type}:`, error);
    }
  },

  updateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>
  ) => {
    const { currentTest } = get();
    if (!currentTest) return;

    const updatedSections = currentTest.sections.map((section) => {
      if (section.id !== sectionId) return section;

      const updatedQuestions = section.questions.map((question) =>
        question.id === questionId ? { ...question, ...updates } : question
      );

      return {
        ...section,
        questions: updatedQuestions,
      };
    });

    set({
      currentTest: {
        ...currentTest,
        sections: updatedSections,
      },
    });
  },

  removeQuestion: (sectionId: string, questionId: string) => {
    const { currentTest } = get();
    if (!currentTest) return;

    const updatedSections = currentTest.sections.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        questions: section.questions.filter((q) => q.id !== questionId),
      };
    });

    set({
      currentTest: {
        ...currentTest,
        sections: updatedSections,
        totalQuestions: get().calculateTotalQuestions(),
      },
    });
  },

  reorderQuestion: (
    sectionId: string,
    questionId: string,
    direction: "up" | "down"
  ) => {
    const { currentTest } = get();
    if (!currentTest) return;

    const updatedSections = currentTest.sections.map((section) => {
      if (section.id !== sectionId) return section;

      const questions = [...section.questions];
      const currentIndex = questions.findIndex((q) => q.id === questionId);

      if (currentIndex === -1) return section;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      // Check bounds
      if (newIndex < 0 || newIndex >= questions.length) return section;

      // Swap questions
      [questions[currentIndex], questions[newIndex]] = [
        questions[newIndex],
        questions[currentIndex],
      ];

      // Update the index property of questions to reflect their new positions
      questions.forEach((question, index) => {
        question.index = index + 1;
      });

      return {
        ...section,
        questions,
      };
    });

    set({
      currentTest: {
        ...currentTest,
        sections: updatedSections,
      },
    });
  },

  loadTest: (test: Test) => {
    set({ currentTest: test });
  },

  deleteTest: (testId: string) => {
    const { savedTests, currentTest } = get();
    const updatedTests = savedTests.filter((test) => test.id !== testId);

    set({
      savedTests: updatedTests,
      // If the current test is being deleted, clear it
      currentTest: currentTest?.id === testId ? null : currentTest,
    });
  },

  getSection: (sectionId: string) => {
    const { currentTest } = get();
    if (!currentTest) return undefined;
    return currentTest.sections.find((section) => section.id === sectionId);
  },

  getQuestion: (sectionId: string, questionId: string) => {
    const section = get().getSection(sectionId);
    if (!section) return undefined;
    return section.questions.find((question) => question.id === questionId);
  },

  calculateTotalDuration: () => {
    const { currentTest } = get();
    if (!currentTest) return 0;
    console.log("==> calculateTotalDuration", currentTest)
    return currentTest.sections.reduce(
      (total, section) => total + section.duration,
      0
    );
  },

  calculateTotalQuestions: () => {
    const { currentTest } = get();
    if (!currentTest) return 0;
    return currentTest.sections.reduce(
      (total, section) => total + section.questions.length,
      0
    );
  },
}));
