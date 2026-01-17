import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ReadingItem } from "../types/research"

interface TrackerState {
  readings: ReadingItem[]
  toggleComplete: (id: string) => void
  updateNotes: (id: string, notes: string) => void
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      readings: [
        {
          id: "1",
          title: "Gelman (2006) – Variance Priors",
          description: "",
          month: 1,
          priority: 1,
          completed: false,
          notes: ""
        },
        {
          id: "2",
          title: "McElreath (2020) – Partial Pooling",
          description: "",
          month: 1,
          priority: 1,
          completed: false,
          notes: ""
        }
      ],
      toggleComplete: (id) =>
        set(state => ({
          readings: state.readings.map(r =>
            r.id === id ? { ...r, completed: !r.completed } : r
          )
        })),
      updateNotes: (id, notes) =>
        set(state => ({
          readings: state.readings.map(r =>
            r.id === id ? { ...r, notes } : r
          )
        })),
    }),
    { name: "research-tracker" }
  )
)
