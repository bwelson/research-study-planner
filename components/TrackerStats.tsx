"use client"

import { useTrackerStore } from "../store/trackerStore"

export default function TrackerStats() {
  const readings = useTrackerStore(s => s.readings)
  const completed = readings.filter(r => r.completed).length
  const total = readings.length

  return (
    <div style={{ marginBottom: 20 }}>
      <strong>Progress:</strong> {completed}/{total}
    </div>
  )
}
