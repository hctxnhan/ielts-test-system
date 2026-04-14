"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCreatorStore } from "@testComponents/store/creator-store";
import {
  loadDraft,
  removeDraft,
  saveDraft,
} from "@testComponents/lib/draft-manager";
import type { Test, TestType } from "@testComponents/lib/types";

/** Check if a draft has meaningful content beyond the default empty test. */
function isDraftMeaningful(draft: Test): boolean {
  // Has sections with questions
  if (draft.sections.length > 0 && draft.sections.some((s) => s.questions.length > 0)) {
    return true;
  }
  // Title was changed from default
  if (draft.title && draft.title !== "New Test") {
    return true;
  }
  // Description or instructions were added
  if (draft.description && draft.description.length > 0) {
    return true;
  }
  return false;
}

interface UseDraftAutosaveOptions {
  testType: TestType;
  isEditMode: boolean;
  debounceMs?: number;
}

interface UseDraftAutosaveReturn {
  /** True when a draft was restored on mount. */
  draftRestored: boolean;
  /** Whether the hook has finished initialization (draft check complete). */
  initialized: boolean;
  /** Whether there are unsaved changes. */
  hasUnsavedChanges: boolean;
  /** Discard the current draft and reset to empty test. */
  discardDraft: () => void;
  /** Dismiss the "draft restored" notification. */
  dismissNotification: () => void;
  /** Clear draft (called after successful save). */
  clearDraft: () => void;
}

export function useDraftAutosave({
  testType,
  isEditMode,
  debounceMs = 500,
}: UseDraftAutosaveOptions): UseDraftAutosaveReturn {
  const [draftRestored, setDraftRestored] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousTestType = useRef<TestType>(testType);
  const latestTestRef = useRef(useCreatorStore.getState().currentTest);
  const isSavedRef = useRef(false);

  const { loadTest, createNewTest } = useCreatorStore();

  // Keep a ref to the latest test for flush-on-unmount
  useEffect(() => {
    return useCreatorStore.subscribe((state) => {
      latestTestRef.current = state.currentTest;
    });
  }, []);

  // Restore draft on mount (create mode only)
  useEffect(() => {
    if (isEditMode) {
      setInitialized(true);
      return;
    }

    const draft = loadDraft(testType);
    if (draft) {
      loadTest(draft);
      if (isDraftMeaningful(draft)) {
        setDraftRestored(true);
      }
    } else {
      createNewTest(testType, "New Test");
    }
    setInitialized(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle test type switch: save current draft, load new type's draft
  useEffect(() => {
    if (isEditMode || !initialized) return;
    if (previousTestType.current === testType) return;

    // Save current draft under previous type
    const current = latestTestRef.current;
    if (current) {
      saveDraft(previousTestType.current, current);
    }

    // Load draft for new type
    const draft = loadDraft(testType);
    if (draft) {
      loadTest(draft);
      setDraftRestored(isDraftMeaningful(draft));
    } else {
      createNewTest(testType, "New Test");
      setDraftRestored(false);
    }

    previousTestType.current = testType;
  }, [testType, isEditMode, initialized, loadTest, createNewTest]);

  // Debounced autosave on store changes (create mode only)
  // Also flush immediately on unmount so draft is never lost
  useEffect(() => {
    if (isEditMode || !initialized) return;

    const unsubscribe = useCreatorStore.subscribe((state) => {
      if (!state.currentTest || isSavedRef.current) return;

      setHasUnsavedChanges(true);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        if (!isSavedRef.current) {
          saveDraft(testType, state.currentTest!);
        }
      }, debounceMs);
    });

    return () => {
      unsubscribe();
      // Flush: save immediately on unmount (only if not already saved)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      const current = latestTestRef.current;
      if (current && !isSavedRef.current) {
        saveDraft(testType, current);
      }
    };
  }, [testType, isEditMode, initialized, debounceMs]);

  const discardDraft = useCallback(() => {
    removeDraft(testType);
    createNewTest(testType, "New Test");
    setDraftRestored(false);
  }, [testType, createNewTest]);

  const dismissNotification = useCallback(() => {
    setDraftRestored(false);
  }, []);

  const clearDraft = useCallback(() => {
    isSavedRef.current = true;
    setHasUnsavedChanges(false);
    // Cancel any pending debounced save
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    removeDraft(testType);
  }, [testType]);

  return {
    draftRestored,
    initialized,
    hasUnsavedChanges,
    discardDraft,
    dismissNotification,
    clearDraft,
  };
}
