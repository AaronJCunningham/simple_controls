import create from "zustand";

export const useCollider = create((set) => ({
  collider: null,
  setCollider: (collider) => set({ collider }),
}));
