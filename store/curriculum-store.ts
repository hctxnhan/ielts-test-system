import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  Curriculum,
  CurriculumContent,
  CurriculumSession,
  CurriculumTest,
  CurriculumEditorState,
  TestLibraryFilters,
} from "@testComponents/lib/curriculum-types";

interface CurriculumState extends CurriculumEditorState {
  // Current curriculum being edited
  currentCurriculum: Curriculum | null;
  
  // Available tests for the library
  availableTests: CurriculumTest[];
  
  // UI state
  testLibraryFilters: TestLibraryFilters;
  
  // Actions for curriculum management
  createNewCurriculum: (title: string, description?: string) => void;
  loadCurriculum: (curriculum: Curriculum) => void;
  updateCurriculumDetails: (updates: Partial<CurriculumContent>) => void;
  
  // Session management
  addSession: (title: string) => void;
  updateSession: (sessionId: string, updates: Partial<CurriculumSession>) => void;
  removeSession: (sessionId: string) => void;
  reorderSessions: (fromIndex: number, toIndex: number) => void;
  
  // Test management within sessions
  addTestToSession: (sessionId: string, testId: number) => void;
  removeTestFromSession: (sessionId: string, testId: number) => void;
  reorderTestsInSession: (sessionId: string, fromIndex: number, toIndex: number) => void;
  moveTestBetweenSessions: (testId: number, fromSessionId: string, toSessionId: string, toIndex?: number) => void;
  
  // UI state management
  toggleSessionExpanded: (sessionId: string) => void;
  setModified: (isModified: boolean) => void;
  
  // Test library management
  setAvailableTests: (tests: CurriculumTest[]) => void;
  updateTestLibraryFilters: (filters: Partial<TestLibraryFilters>) => void;
  getFilteredTests: () => CurriculumTest[];
  
  // Reset state
  resetEditor: () => void;
}

export const useCurriculumStore = create<CurriculumState>((set, get) => ({
  // Initial state
  currentCurriculum: null,
  availableTests: [],
  testLibraryFilters: {
    searchQuery: "",
    type: undefined,
    difficulty: undefined,
    skills: [],
  },
  isModified: false,
  expandedSessions: new Set(),
  
  // Curriculum management actions
  createNewCurriculum: (title: string, description?: string) => {
    const newCurriculum: Curriculum = {
      id: uuidv4(),
      version: 1,
      content: {
        title,
        description,
        sessions: [],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    };
    
    set({
      currentCurriculum: newCurriculum,
      isModified: false,
      expandedSessions: new Set(),
    });
  },
  
  loadCurriculum: (curriculum: Curriculum) => {
    set({
      currentCurriculum: curriculum,
      isModified: false,
      expandedSessions: new Set(),
    });
  },
  
  updateCurriculumDetails: (updates: Partial<CurriculumContent>) => {
    const { currentCurriculum } = get();
    if (!currentCurriculum) return;
    
    set({
      currentCurriculum: {
        ...currentCurriculum,
        content: {
          ...currentCurriculum.content,
          ...updates,
        },
      },
      isModified: true,
    });
  },
  
  // Session management
  addSession: (title: string) => {
    const { currentCurriculum } = get();
    if (!currentCurriculum) return;
    
    const newSession: CurriculumSession = {
      id: uuidv4(),
      title,
      order: currentCurriculum.content.sessions.length,
      testIds: [],
    };
    
    set({
      currentCurriculum: {
        ...currentCurriculum,
        content: {
          ...currentCurriculum.content,
          sessions: [...currentCurriculum.content.sessions, newSession],
        },
      },
      isModified: true,
    });
  },
  
  updateSession: (sessionId: string, updates: Partial<CurriculumSession>) => {
    const { currentCurriculum } = get();
    if (!currentCurriculum) return;
    
    const updatedSessions = currentCurriculum.content.sessions.map(session =>
      session.id === sessionId ? { ...session, ...updates } : session
    );
    
    set({
      currentCurriculum: {
        ...currentCurriculum,
        content: {
          ...currentCurriculum.content,
          sessions: updatedSessions,
        },
      },
      isModified: true,
    });
  },
  
  removeSession: (sessionId: string) => {
    const { currentCurriculum } = get();
    if (!currentCurriculum) return;
    
    const filteredSessions = currentCurriculum.content.sessions.filter(
      session => session.id !== sessionId
    );
    
    // Reorder remaining sessions
    const reorderedSessions = filteredSessions.map((session, index) => ({
      ...session,
      order: index,
    }));
    
    set({
      currentCurriculum: {
        ...currentCurriculum,
        content: {
          ...currentCurriculum.content,
          sessions: reorderedSessions,
        },
      },
      isModified: true,
    });
  },
  
  reorderSessions: (fromIndex: number, toIndex: number) => {
    const { currentCurriculum } = get();
    if (!currentCurriculum) return;
    
    const sessions = [...currentCurriculum.content.sessions];
    const [movedSession] = sessions.splice(fromIndex, 1);
    sessions.splice(toIndex, 0, movedSession);
    
    // Update order property
    const reorderedSessions = sessions.map((session, index) => ({
      ...session,
      order: index,
    }));
    
    set({
      currentCurriculum: {
        ...currentCurriculum,
        content: {
          ...currentCurriculum.content,
          sessions: reorderedSessions,
        },
      },
      isModified: true,
    });
  },
  
  // Test management
  addTestToSession: (sessionId: string, testId: number) => {
    const { currentCurriculum } = get();
    if (!currentCurriculum) return;
    
    const updatedSessions = currentCurriculum.content.sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          testIds: [...session.testIds, testId],
        };
      }
      return session;
    });
    
    set({
      currentCurriculum: {
        ...currentCurriculum,
        content: {
          ...currentCurriculum.content,
          sessions: updatedSessions,
        },
      },
      isModified: true,
    });
  },
  
  removeTestFromSession: (sessionId: string, testId: number) => {
    const { currentCurriculum } = get();
    if (!currentCurriculum) return;
    
    const updatedSessions = currentCurriculum.content.sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          testIds: session.testIds.filter(id => id !== testId),
        };
      }
      return session;
    });
    
    set({
      currentCurriculum: {
        ...currentCurriculum,
        content: {
          ...currentCurriculum.content,
          sessions: updatedSessions,
        },
      },
      isModified: true,
    });
  },
  
  reorderTestsInSession: (sessionId: string, fromIndex: number, toIndex: number) => {
    const { currentCurriculum } = get();
    if (!currentCurriculum) return;
    
    const updatedSessions = currentCurriculum.content.sessions.map(session => {
      if (session.id === sessionId) {
        const testIds = [...session.testIds];
        const [movedTestId] = testIds.splice(fromIndex, 1);
        testIds.splice(toIndex, 0, movedTestId);
        
        return {
          ...session,
          testIds,
        };
      }
      return session;
    });
    
    set({
      currentCurriculum: {
        ...currentCurriculum,
        content: {
          ...currentCurriculum.content,
          sessions: updatedSessions,
        },
      },
      isModified: true,
    });
  },
  
  moveTestBetweenSessions: (testId: number, fromSessionId: string, toSessionId: string, toIndex?: number) => {
    const { currentCurriculum } = get();
    if (!currentCurriculum) return;
    
    const updatedSessions = currentCurriculum.content.sessions.map(session => {
      if (session.id === fromSessionId) {
        // Remove from source session
        return {
          ...session,
          testIds: session.testIds.filter(id => id !== testId),
        };
      }
      if (session.id === toSessionId) {
        // Add to destination session
        const newTestIds = [...session.testIds];
        const insertIndex = toIndex !== undefined ? toIndex : newTestIds.length;
        newTestIds.splice(insertIndex, 0, testId);
        
        return {
          ...session,
          testIds: newTestIds,
        };
      }
      return session;
    });
    
    set({
      currentCurriculum: {
        ...currentCurriculum,
        content: {
          ...currentCurriculum.content,
          sessions: updatedSessions,
        },
      },
      isModified: true,
    });
  },
  
  // UI state management
  toggleSessionExpanded: (sessionId: string) => {
    const { expandedSessions } = get();
    const newExpandedSessions = new Set(expandedSessions);
    
    if (newExpandedSessions.has(sessionId)) {
      newExpandedSessions.delete(sessionId);
    } else {
      newExpandedSessions.add(sessionId);
    }
    
    set({ expandedSessions: newExpandedSessions });
  },
  
  setModified: (isModified: boolean) => {
    set({ isModified });
  },
  
  // Test library management
  setAvailableTests: (tests: CurriculumTest[]) => {
    set({ availableTests: tests });
  },
  
  updateTestLibraryFilters: (filters: Partial<TestLibraryFilters>) => {
    const { testLibraryFilters } = get();
    set({
      testLibraryFilters: {
        ...testLibraryFilters,
        ...filters,
      },
    });
  },
  
  getFilteredTests: () => {
    const { availableTests, testLibraryFilters } = get();
    const { searchQuery, type, difficulty, skills } = testLibraryFilters;
    
    return availableTests.filter(test => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          test.title.toLowerCase().includes(query) ||
          test.id.toString().includes(query) ||
          (test.description && test.description.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }
      
      // Type filter - support both 'skill' (new format) and 'type' (legacy)
      if (type) {
        const testType = test.skill || test.type;
        if (testType !== type) return false;
      }
      
      // Difficulty filter - support both 'level' (new format) and 'difficulty' (legacy)
      if (difficulty) {
        const testDifficulty = test.level || test.difficulty;
        if (testDifficulty !== difficulty) return false;
      }
      
      // Skills filter
      if (skills && skills.length > 0) {
        if (!test.skills || !skills.some(skill => test.skills!.includes(skill))) {
          return false;
        }
      }
      
      return true;
    });
  },
  
  // Reset state
  resetEditor: () => {
    set({
      currentCurriculum: null,
      isModified: false,
      expandedSessions: new Set(),
      testLibraryFilters: {
        searchQuery: "",
        type: undefined,
        difficulty: undefined,
        skills: [],
      },
    });
  },
}));