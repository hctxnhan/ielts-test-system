# Curriculum Creation System

A modular, drag-and-drop curriculum creation system built with React, TypeScript, and Zustand for managing IELTS course curricula with versioning support.

## Features

- **Drag-and-Drop Interface**: Intuitive UI for organizing sessions and tests using `react-dnd`
- **Version Management**: Creates new versions when curricula are modified
- **Modular Components**: Split into manageable, reusable components
- **State Management**: Uses Zustand for efficient state handling
- **TypeScript Support**: Fully typed for better development experience

## Architecture

### Core Components

1. **CurriculumEditor** - Main editor interface with two-panel layout
2. **SessionList** - Left panel showing curriculum structure
3. **SessionItem** - Individual session with expandable test list
4. **TestLibrary** - Right panel with searchable test collection
5. **TestItem** - Individual test within sessions
6. **SaveConfirmationModal** - Version creation confirmation

### Drag & Drop Components

- **DragDropProvider** - Provides drag-and-drop context using `react-dnd`
- **DraggableTestItem** - Draggable test component for library
- **DroppableSession** - Droppable session wrapper for accepting tests

### State Management

- **curriculum-store.ts** - Zustand store managing curriculum state
- **curriculum-types.ts** - TypeScript type definitions

## Usage

### Basic Implementation

```tsx
import { CurriculumEditor } from "@testComponents/components/curriculum";
import { useCurriculumStore } from "@testComponents/store/curriculum-store";

function MyApp() {
  const { createNewCurriculum, setAvailableTests } = useCurriculumStore();

  useEffect(() => {
    // Set available tests
    setAvailableTests(sampleTests);
    
    // Create initial curriculum
    createNewCurriculum("Course Title", "Course description");
  }, []);

  return (
    <CurriculumEditor 
      courseId={1}
      courseName="My Course"
    />
  );
}
```

### Store Actions

```tsx
const {
  // Curriculum management
  createNewCurriculum,
  loadCurriculum,
  updateCurriculumDetails,
  
  // Session management
  addSession,
  updateSession,
  removeSession,
  reorderSessions,
  
  // Test management
  addTestToSession,
  removeTestFromSession,
  reorderTestsInSession,
  moveTestBetweenSessions,
  
  // UI state
  toggleSessionExpanded,
  setModified,
  
  // Test library
  setAvailableTests,
  updateTestLibraryFilters,
  getFilteredTests,
} = useCurriculumStore();
```

## Data Structure

### Curriculum Content (JSON stored in database)

```json
{
  "title": "IELTS Comprehensive Course",
  "description": "Complete IELTS preparation",
  "sessions": [
    {
      "id": "session-1",
      "title": "Introduction to IELTS",
      "description": "Overview of IELTS test structure",
      "order": 0,
      "testIds": ["test-001", "test-002"]
    }
  ]
}
```

### Database Schema Compatibility

The system is designed to work with the provided database schema:

- `curriculums` table with JSONB content field
- Automatic versioning via database triggers
- `course_curriculums` junction table for course relationships

## Key Features

### Drag-and-Drop Capabilities

- **Add tests to sessions** - Drag tests from library to session drop zones
- **Visual feedback** - Clear visual indicators during drag operations
- **Drop validation** - Only valid drop targets are highlighted

*Note: Session reordering and test reordering within sessions can be enhanced in the future with additional drag-and-drop handlers.*

### Version Management

- Creates new versions automatically when content changes
- Preserves existing curricula for ongoing classes
- New classes automatically use latest version
- Confirmation modal explains versioning impact

### Search and Filtering

Test library includes powerful filtering:
- Search by title, ID, or description
- Filter by test type (listening, reading, writing, speaking, grammar)
- Filter by difficulty level (beginner, intermediate, advanced)
- Filter by skills

## Component Props

### CurriculumEditor

```tsx
interface CurriculumEditorProps {
  courseId?: number;      // Associated course ID
  courseName?: string;    // Course name for display
}
```

### Sample Test Data

```tsx
const sampleTest: CurriculumTest = {
  id: "test-001",
  title: "IELTS Reading Practice",
  type: "reading",
  description: "Academic reading passages",
  duration: 60,
  difficulty: "intermediate",
  skills: ["reading comprehension", "vocabulary"]
};
```

## Styling

Components use Tailwind CSS with shadcn/ui design system:
- Consistent spacing and typography
- Responsive design
- Dark/light mode support
- Accessible color contrasts

## File Structure

```
components/curriculum/
├── curriculum-editor.tsx      # Main editor interface
├── session-list.tsx          # Session container
├── session-item.tsx          # Individual session
├── test-item.tsx            # Individual test display
├── test-library.tsx         # Test browser/search
├── save-confirmation-modal.tsx # Version save modal
├── drag-drop-provider.tsx   # DnD context provider
├── draggable-test-item.tsx  # Draggable test component
├── droppable-session.tsx    # Droppable session wrapper
├── curriculum-demo.tsx      # Demo component
└── index.ts                 # Export barrel

store/
├── curriculum-store.ts      # Zustand state management

lib/
├── curriculum-types.ts      # TypeScript definitions

app/curriculum/
├── page.tsx                # Example page implementation
```

## Performance Considerations

- Uses `react-dnd` for efficient drag-and-drop with HTML5 backend
- Zustand provides minimal re-renders
- Components are split for optimal bundle size
- Virtualization could be added for large test libraries

## Future Enhancements

- [ ] Test previews on hover
- [ ] Bulk operations for tests
- [ ] Session templates
- [ ] Import/export functionality
- [ ] Collaborative editing
- [ ] Integration with test API endpoints