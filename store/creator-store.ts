import { create } from "zustand";
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

    switch (type) {
      case "multiple-choice":
        newQuestion = {
          id: uuidv4(),
          type: "multiple-choice" as const,
          text: "",
          points: 1,
          scoringStrategy: "all-or-nothing",
          index: currentTest.sections[sectionIndex].questions.length + 1,
          options: [
            { id: uuidv4(), text: "", isCorrect: true },
            { id: uuidv4(), text: "", isCorrect: false },
            { id: uuidv4(), text: "", isCorrect: false },
            { id: uuidv4(), text: "", isCorrect: false },
          ],
        };
        break;
      case "completion":
        newQuestion = {
          id: uuidv4(),
          type: "completion" as const,
          text: "",
          points: 1,
          scoringStrategy: "partial",
          index: currentTest.sections[sectionIndex].questions.length + 1,
          blanks: 1,
          subQuestions: [
            {
              subId: uuidv4(),
              correctAnswer: "",
              points: 1,
            },
          ],
        };
        break;
      case "matching":
        const itemIds = [uuidv4(), uuidv4()];
        const optionIds = [uuidv4(), uuidv4()];
        newQuestion = {
          id: uuidv4(),
          type: "matching" as const,
          text: "",
          points: 1,
          scoringStrategy: "partial",
          index: currentTest.sections[sectionIndex].questions.length + 1,
          items: itemIds.map((id) => ({ id, text: "" })),
          options: optionIds.map((id) => ({ id, text: "" })),
          subQuestions: [
            {
              subId: uuidv4(),
              item: itemIds[0],
              correctAnswer: optionIds[0],
              points: 1,
            },
            {
              subId: uuidv4(),
              item: itemIds[1],
              correctAnswer: optionIds[1],
              points: 1,
            },
          ],
        };
        break;
      case "labeling":
        const labelIds = [uuidv4(), uuidv4()];
        const optionIdsForLabeling = [uuidv4(), uuidv4()];

        newQuestion = {
          id: uuidv4(),
          type: "labeling" as const,
          text: "",
          points: 1,
          scoringStrategy: "partial",
          index: currentTest.sections[sectionIndex].questions.length + 1,
          imageUrl: "",
          labels: labelIds.map((id) => ({ id, text: "" })),
          options: optionIdsForLabeling.map((id) => ({
            id,
            text: "",
          })),
          subQuestions: labelIds.map((id, index) => ({
            subId: uuidv4(),
            item: id,
            correctAnswer: optionIdsForLabeling[index],
            points: 1,
          })),
        };
        break;
      case "pick-from-list":
        const itemIdsForPick = [uuidv4(), uuidv4()];
        const optionIdsForPick = [uuidv4(), uuidv4(), uuidv4()];

        newQuestion = {
          id: uuidv4(),
          type: "pick-from-list",
          text: "",
          points: 1,
          scoringStrategy: "partial",
          index: currentTest.sections[sectionIndex].questions.length + 1,
          items: itemIdsForPick.map((id) => ({ id, text: "" })),
          options: optionIdsForPick.map((id) => ({ id, text: "" })),
          subQuestions: itemIdsForPick.map((id, index) => ({
            subId: uuidv4(),
            item: id,
            correctAnswer: optionIdsForPick[index],
            points: 1,
          })),
        };
        break;
      case "true-false-not-given":
        const stmtIds = [uuidv4(), uuidv4(), uuidv4()];

        newQuestion = {
          id: uuidv4(),
          type: "true-false-not-given",
          text: "",
          points: 1,
          scoringStrategy: "partial",
          index: currentTest.sections[sectionIndex].questions.length + 1,
          statements: stmtIds.map((id) => ({ id, text: "" })),
          subQuestions: stmtIds.map((id, index) => ({
            subId: uuidv4(),
            item: id,
            correctAnswer: "true",
            points: 1,
          })),
        };
        break;
      case "matching-headings":
        const headingIds = [uuidv4(), uuidv4()];
        const paraIds = [uuidv4(), uuidv4()];

        newQuestion = {
          id: uuidv4(),
          type: "matching-headings",
          text: "",
          points: 1,
          scoringStrategy: "partial",
          index: currentTest.sections[sectionIndex].questions.length + 1,
          paragraphs: paraIds.map((id) => ({ id, text: "" })),
          headings: headingIds.map((id) => ({ id, text: "" })),
          subQuestions: paraIds.map((id, index) => ({
            subId: uuidv4(),
            item: id,
            correctAnswer: headingIds[index],
            points: 1,
          })),
        };
        break;
      case "short-answer":
        const questionIds = [uuidv4(), uuidv4()];
        newQuestion = {
          id: uuidv4(),
          type: "short-answer",
          text: "",
          points: 1,
          scoringStrategy: "partial",
          index: currentTest.sections[sectionIndex].questions.length + 1,
          questions: questionIds.map((id) => ({ id, text: "" })),
          subQuestions: questionIds.map((_, index) => ({
            subId: uuidv4(),
            item: questionIds[index],
            acceptableAnswers: [],
            points: 1,
          })),
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
          index: currentTest.sections[sectionIndex].questions.length + 1,
          prompt: "",
          wordLimit: 150,
          imageUrl: "",
          sampleAnswer: "",
          scoringPrompt: "",
        };
        break;
      case "writing-task2":
        newQuestion = {
          id: uuidv4(),
          type: "writing-task2",
          text: "Task 2",
          points: 12,
          scoringStrategy: "all-or-nothing", // Default for writing tasks
          index: currentTest.sections[sectionIndex].questions.length + 1,
          prompt: "",
          wordLimit: 250,
          sampleAnswer: "",
          scoringPrompt: "",
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
