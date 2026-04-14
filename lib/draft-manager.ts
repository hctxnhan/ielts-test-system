import type { Test, TestType } from "@testComponents/lib/types";

const DRAFT_KEY_PREFIX = "test-draft:";

/**
 * Build the localStorage key for a given test type.
 */
export function getDraftStorageKey(testType: TestType): string {
  return `${DRAFT_KEY_PREFIX}${testType}`;
}

/**
 * Serialize a Test object to a JSON string.
 */
export function serializeDraft(test: Test): string {
  return JSON.stringify(test);
}

/**
 * Minimal structural check: object has required Test fields with correct types.
 */
export function isValidTestStructure(obj: unknown): obj is Test {
  if (obj === null || typeof obj !== "object") return false;

  const candidate = obj as Record<string, unknown>;

  return (
    typeof candidate.title === "string" &&
    typeof candidate.type === "string" &&
    ["listening", "reading", "writing", "speaking", "grammar"].includes(
      candidate.type as string
    ) &&
    typeof candidate.description === "string" &&
    Array.isArray(candidate.sections) &&
    typeof candidate.totalDuration === "number" &&
    typeof candidate.totalQuestions === "number" &&
    typeof candidate.instructions === "string"
  );
}

/**
 * Deserialize a JSON string back to a Test object.
 * Returns null if parsing fails or the result doesn't look like a valid Test.
 */
export function deserializeDraft(json: string): Test | null {
  try {
    const parsed = JSON.parse(json);
    if (isValidTestStructure(parsed)) {
      return parsed;
    }
    console.warn("[DraftManager] Stored draft has invalid structure, discarding.");
    return null;
  } catch {
    console.warn("[DraftManager] Failed to parse draft JSON, discarding.");
    return null;
  }
}

/**
 * Write a Test draft to localStorage. Returns true on success.
 */
export function saveDraft(testType: TestType, test: Test): boolean {
  try {
    const key = getDraftStorageKey(testType);
    const data = serializeDraft(test);
    localStorage.setItem(key, data);
    return true;
  } catch (error) {
    console.error("[DraftManager] Failed to save draft:", error);
    return false;
  }
}

/**
 * Read a Test draft from localStorage. Returns null when absent or invalid.
 */
export function loadDraft(testType: TestType): Test | null {
  try {
    const key = getDraftStorageKey(testType);
    const data = localStorage.getItem(key);
    if (data === null) return null;
    return deserializeDraft(data);
  } catch (error) {
    console.error("[DraftManager] Failed to load draft:", error);
    return null;
  }
}

/**
 * Remove the draft for a given test type from localStorage.
 */
export function removeDraft(testType: TestType): void {
  try {
    const key = getDraftStorageKey(testType);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("[DraftManager] Failed to remove draft:", error);
  }
}
