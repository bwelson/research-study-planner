"use client"

import { ReadingItem } from "../types/research"
import { useTrackerStore } from "../store/trackerStore"

export default function ReadingCard({ item }: { item: ReadingItem }) {
  const toggle = useTrackerStore(s => s.toggleComplete)
  const updateNotes = useTrackerStore(s => s.updateNotes)

  return (
    <div style={{ border: "1px solid #555", padding: 10, marginBottom: 10 }}>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => toggle(item.id)}
      />{" "}
      {item.title}

      <br />

      <textarea
        placeholder="Notes"
        value={item.notes}
        onChange={e => updateNotes(item.id, e.target.value)}
        style={{ width: "100%", marginTop: 8 }}
      />
    </div>
  )
}
