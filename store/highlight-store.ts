// highlight-store.ts
import { create } from "zustand";

interface HighlightState {
  highlights: Record<string, string>;
  setHighlight: (id: string, html: string) => void;
  removeHighlight: (id: string) => void;
}

export const highlightStore = create<HighlightState>((set) => ({
  highlights: {},
  setHighlight: (id, html) =>
    set((state) => ({
      highlights: {
        ...state.highlights,
        [id]: html,
      },
    })),
  removeHighlight: (id) =>
    set((state) => {
      const newHighlights = { ...state.highlights };
      delete newHighlights[id];
      return { highlights: newHighlights };
    }),
}));
