import { create } from "zustand";
import type { WhiteboardPage } from "@/app/whiteboard/page";

interface HistoryState {
  past: WhiteboardPage[][];
  future: WhiteboardPage[][];
  canUndo: boolean;
  canRedo: boolean;
  saveState: (pages: WhiteboardPage[]) => void;
  undo: () => WhiteboardPage[] | undefined;
  redo: () => WhiteboardPage[] | undefined;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  saveState: (pages) => {
    set((state) => {
      // Create a deep copy of the current pages
      const pagesCopy = JSON.parse(JSON.stringify(pages));

      return {
        past: [...state.past, pagesCopy],
        future: [],
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const { past } = get();

    if (past.length === 0) return undefined;

    const newPast = [...past];
    const previousState = newPast.pop();

    if (!previousState) return undefined;

    set((state) => ({
      past: newPast,
      future: [JSON.parse(JSON.stringify(previousState)), ...state.future],
      canUndo: newPast.length > 0,
      canRedo: true,
    }));

    return previousState;
  },

  redo: () => {
    const { future } = get();

    if (future.length === 0) return undefined;

    const newFuture = [...future];
    const nextState = newFuture.shift();

    if (!nextState) return undefined;

    set((state) => ({
      past: [...state.past, JSON.parse(JSON.stringify(nextState))],
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    }));

    return nextState;
  },

  clear: () => {
    set({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },
}));
