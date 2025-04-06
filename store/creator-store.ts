import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Test,
  Section,
  Question,
  TestType,
  QuestionType,
  ReadingVariant,
} from "@/lib/types";
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
  saveTest: () => void;
  loadTest: (testId: string) => void;
  deleteTest: (testId: string) => void;

  // Computed
  getSection: (sectionId: string) => Section | undefined;
  getQuestion: (sectionId: string, questionId: string) => Question | undefined;
  calculateTotalDuration: () => number;
  calculateTotalQuestions: () => number;
}

export const useCreatorStore = create<CreatorState>()(
  persist(
    (set, get) => ({
      currentTest: null,
      savedTests: [],

      createNewTest: (
        type: TestType,
        title: string,
        readingVariant?: ReadingVariant
      ) => {
        const newTest: Test = {
          id: uuidv4(),
          title,
          type,
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
          title: `Section ${currentTest.sections.length + 1}`,
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

        set({
          currentTest: {
            ...currentTest,
            sections: updatedSections,
            totalDuration: get().calculateTotalDuration(),
          },
        });
      },

      removeSection: (sectionId: string) => {
        const { currentTest } = get();
        if (!currentTest) return;

        const updatedSections = currentTest.sections.filter(
          (section) => section.id !== sectionId
        );

        set({
          currentTest: {
            ...currentTest,
            sections: updatedSections,
            totalDuration: get().calculateTotalDuration(),
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

        let newQuestion: Question;

        // Create a new question based on the type
        switch (type) {
          case "multiple-choice":
            newQuestion = {
              id: uuidv4(),
              type: "multiple-choice",
              text: "",
              points: 1,
              scoringStrategy: "all-or-nothing", // Default for multiple choice
              options: ["", "", "", ""],
              correctAnswer: 0,
            };
            break;
          case "completion":
            newQuestion = {
              id: uuidv4(),
              type: "completion",
              text: "",
              points: 1,
              scoringStrategy: "partial", // Default for completion
              blanks: 1,
              correctAnswers: [""],
            };
            break;
          case "matching":
            newQuestion = {
              id: uuidv4(),
              type: "matching",
              text: "",
              points: 1,
              scoringStrategy: "partial", // Default for matching
              items: ["", ""],
              options: ["", ""],
              correctMatches: { 0: 0, 1: 1 },
            };
            break;
          case "labeling":
            newQuestion = {
              id: uuidv4(),
              type: "labeling",
              text: "",
              points: 1,
              scoringStrategy: "partial", // Default for labeling
              imageUrl: "",
              labels: ["", ""],
              options: ["", ""],
              correctLabels: { 0: 0, 1: 1 },
            };
            break;
          case "pick-from-list":
            newQuestion = {
              id: uuidv4(),
              type: "pick-from-list",
              text: "",
              points: 1,
              scoringStrategy: "partial", // Default for pick-from-list
              items: ["", ""],
              options: ["", "", ""],
              correctAnswers: { 0: 0, 1: 1 },
            };
            break;
          case "true-false-not-given":
            newQuestion = {
              id: uuidv4(),
              type: "true-false-not-given",
              text: "",
              points: 1,
              scoringStrategy: "partial", // Default for true-false-not-given
              statements: [""],
              correctAnswers: ["true"],
            };
            break;
          case "matching-headings":
            newQuestion = {
              id: uuidv4(),
              type: "matching-headings",
              text: "",
              points: 1,
              scoringStrategy: "partial", // Default for matching-headings
              paragraphs: [""],
              headings: [""],
              correctMatches: { 0: 0 },
            };
            break;
          case "short-answer":
            newQuestion = {
              id: uuidv4(),
              type: "short-answer",
              text: "",
              points: 1,
              scoringStrategy: "partial", // Default for short-answer
              questions: [""],
              correctAnswers: [[""]],
              wordLimit: 3,
            };
            break;
          case "writing-task1":
            newQuestion = {
              id: uuidv4(),
              type: "writing-task1",
              text: "Task 1",
              points: 8,
              scoringStrategy: "all-or-nothing", // Default for writing tasks
              prompt: "",
              wordLimit: 150,
              imageUrl: "",
            };
            break;
          case "writing-task2":
            newQuestion = {
              id: uuidv4(),
              type: "writing-task2",
              text: "Task 2",
              points: 12,
              scoringStrategy: "all-or-nothing", // Default for writing tasks
              prompt: "",
              wordLimit: 250,
            };
            break;
          default:
            return;
        }

        const updatedSections = [...currentTest.sections];
        updatedSections[sectionIndex].questions.push(newQuestion);

        set({
          currentTest: {
            ...currentTest,
            sections: updatedSections,
            totalQuestions: get().calculateTotalQuestions(),
          },
        });
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

      saveTest: () => {
        const { currentTest, savedTests } = get();
        if (!currentTest) return;

        // Update total duration and questions
        const testToSave = {
          ...currentTest,
          totalDuration: get().calculateTotalDuration(),
          totalQuestions: get().calculateTotalQuestions(),
        };

        // Check if test already exists
        const existingIndex = savedTests.findIndex(
          (test) => test.id === currentTest.id
        );

        // Create a new array to ensure state update is detected
        let updatedTests = [...savedTests];

        if (existingIndex !== -1) {
          // Update existing test
          updatedTests[existingIndex] = testToSave;
        } else {
          // Add new test
          updatedTests = [...updatedTests, testToSave];
        }

        // Set the state with the new array
        set({
          savedTests: updatedTests,
          currentTest: testToSave, // Update current test with calculated values
        });
      },

      loadTest: (testId: string) => {
        const { savedTests } = get();
        const testToLoad = savedTests.find((test) => test.id === testId);
        if (testToLoad) {
          set({ currentTest: testToLoad });
        }
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
    }),
    {
      name: "ielts-creator-storage",
    }
  )
);
