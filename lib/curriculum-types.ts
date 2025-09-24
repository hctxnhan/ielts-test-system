// Curriculum Types
export interface CurriculumSession {
  id: string;
  title: string;
  description?: string;
  order: number;
  testIds: number[]; // Array of test IDs in this session
}

export interface CurriculumContent {
  title: string;
  description?: string;
  sessions: CurriculumSession[];
}

export interface Curriculum {
  id: string;
  version: number;
  content: CurriculumContent;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  is_active: boolean;
  prev_version_id?: string;
}

export interface CourseCurriculum {
  course_id: number;
  curriculum_id: string;
}

// For the test library - simplified test interface for curriculum creation
export interface CurriculumTest {
  id: number;
  title: string;
  skill: string; // "listening" | "reading" | "writing" | "speaking" | "grammar"
  level: string; // "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  updated_at: string;
  description?: string;
  duration?: number; // in minutes
  // Legacy fields for backward compatibility
  type?: string; 
  difficulty?: string;
  skills?: string[];
}

// UI State types for curriculum editor
export interface DragDropResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}

export interface CurriculumEditorState {
  isModified: boolean;
  expandedSessions: Set<string>;
}

// Search and filter types for test library
export interface TestLibraryFilters {
  searchQuery: string;
  type?: string;
  difficulty?: string;
  skills?: string[];
}