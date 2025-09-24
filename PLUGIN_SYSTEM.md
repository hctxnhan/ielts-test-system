# Question Plugin System

This is a plugin-based architecture for managing question types in the IELTS test system. It provides a clean, extensible way to add new question types without modifying core system files.

## Architecture Overview

### Core Components

1. **QuestionPlugin Interface** - Defines the contract for all question plugins
2. **QuestionPluginRegistry** - Central registry for all plugins
3. **BaseQuestionPlugin** - Abstract base class to reduce boilerplate
4. **Plugin-based Components** - New renderers and editors that use the plugin system

### Benefits

- ✅ **Self-contained logic** - Each question type is a complete module
- ✅ **Easy extensibility** - Add new question types by creating one plugin file
- ✅ **Better type safety** - Generic interfaces for each question type
- ✅ **Consistent APIs** - Standardized interfaces across all question types
- ✅ **No more switch statements** - Dynamic plugin lookup
- ✅ **Easier testing** - Test each plugin independently
- ✅ **Maintainability** - Clear separation of concerns

## How to Create a New Question Plugin

### 1. Create the Plugin Class

```typescript
// lib/plugins/my-question-plugin.ts
import { BaseQuestionPlugin } from "../question-plugin-system";
import type { MyQuestionType } from "../types";

export class MyQuestionPlugin extends BaseQuestionPlugin<MyQuestionType> {
  config = {
    type: "my-question" as const,
    displayName: "My Question",
    description: "A custom question type",
    icon: "🔥",
    category: ["reading", "grammar"],
    supportsPartialScoring: true,
    supportsAIScoring: false,
    defaultPoints: 1
  };

  createRenderer() {
    return MyQuestionRenderer;
  }

  createEditor() {
    return MyQuestionEditor;
  }

  createDefault(index: number): MyQuestionType {
    return {
      id: uuidv4(),
      type: "my-question",
      text: "",
      points: this.config.defaultPoints,
      index,
      partialEndingIndex: index,
      // ... other default properties
    };
  }

  transform(question: MyQuestionType): StandardMyQuestion {
    // Transform to standardized format
    return {
      ...question,
      // ... standardization logic
    };
  }

  validate(question: MyQuestionType): ValidationResult {
    const baseValidation = super.validate(question);
    // Add custom validation logic
    return baseValidation;
  }
}
```

### 2. Register the Plugin

```typescript
// lib/question-plugin-system.ts
export function initializeQuestionPlugins(): void {
  // Register existing plugins
  import("./plugins/multiple-choice-plugin").then(({ MultipleChoicePlugin }) => {
    QuestionPluginRegistry.register(new MultipleChoicePlugin());
  }).catch(console.error);

  // Register your new plugin
  import("./plugins/my-question-plugin").then(({ MyQuestionPlugin }) => {
    QuestionPluginRegistry.register(new MyQuestionPlugin());
  }).catch(console.error);
}
```

### 3. Add Type Definitions

```typescript
// types.ts
export interface MyQuestionType extends BaseQuestion {
  type: "my-question";
  // ... specific properties
}

export type QuestionType = 
  | "multiple-choice"
  | "my-question"  // Add your new type
  | ... // other types
```

## Migration Strategy

### Phase 1: Foundation ✅
- [x] Core plugin interfaces
- [x] Plugin registry system
- [x] Base plugin class
- [x] Multiple choice plugin (proof of concept)

### Phase 2: Component Integration ✅
- [x] Plugin-based question renderer
- [x] Plugin-based question editor
- [x] Plugin-based question type dialog
- [x] Demo page

### Phase 3: Gradual Migration
- [ ] Convert existing question types to plugins
- [ ] Update creator store to use plugins
- [ ] Migrate question transformers to plugins
- [ ] Update test utilities

### Phase 4: Enhanced Features
- [ ] Plugin validation system
- [ ] Plugin-based AI scoring
- [ ] Hot-reloadable plugins
- [ ] Plugin developer tools

## Usage Examples

### Using the Plugin System

```typescript
// Create a question using plugins
const question = QuestionPluginRegistry.createQuestion("multiple-choice", 1);

// Get a renderer component
const RendererComponent = QuestionPluginRegistry.getRenderer("multiple-choice");

// Get an editor component
const EditorComponent = QuestionPluginRegistry.getEditor("multiple-choice");

// Transform a question
const standardQuestion = QuestionPluginRegistry.transformQuestion(question);

// Validate a question
const validation = QuestionPluginRegistry.validateQuestion(question);
```

### Plugin-Based Components

```tsx
// Use the new plugin-based renderer
<PluginBasedQuestionRenderer
  question={question}
  sectionId="section-1"
  answers={answers}
  isReviewMode={false}
  onQuestionContentChange={handleContentChange}
/>

// Use the new plugin-based editor
<PluginBasedQuestionEditor
  question={question}
  sectionId="section-1"
  onUpdateQuestion={handleUpdateQuestion}
/>
```

## File Structure

```
lib/
├── question-plugin-system.ts    # Core plugin interfaces and registry
├── plugins/
│   ├── multiple-choice-plugin.ts    # Example plugin implementation
│   └── my-question-plugin.ts        # Your custom plugin
└── types.ts                         # Question type definitions

components/
├── test-player/
│   └── plugin-based-question-renderer.tsx    # New renderer
└── creator/
    ├── plugin-based-question-editor.tsx      # New editor
    └── plugin-based-question-type-dialog.tsx # New type dialog

app/
└── plugin-demo/
    └── page.tsx                     # Demo page
```

## Demo

Visit `/plugin-demo` to see the plugin system in action:
- View registered plugins
- Test plugin-based question creation
- See side-by-side editor and renderer
- Test question type dialog

## Benefits in Practice

### Before (Switch-based)
```typescript
// Need to update 6+ files for a new question type:
// 1. types.ts
// 2. question-renderer.tsx (switch statement)
// 3. question-editor-inline.tsx (switch statement)
// 4. question-type-dialog.tsx (array)
// 5. creator-store.ts (switch statement)
// 6. question-transformers.ts (switch statement)
// 7. test-utils.ts (array)
```

### After (Plugin-based)
```typescript
// Only need to create 1 plugin file:
// 1. my-question-plugin.ts (everything in one place)
// 2. Register it in initializeQuestionPlugins()
```

This represents a **6x reduction** in files to modify when adding new question types!
