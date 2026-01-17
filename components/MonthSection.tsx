import ReadingItem from "./ReadingItem"
import { ReadingItem as Item } from "../types/research"

export default function MonthSection({
  month,
  items,
}: {
  month: number
  items: Item[]
}) {
  return (
    <section>
      <h2>Month {month}</h2>
      {items.map(item => (
        <ReadingItem key={item.id} item={item} />
      ))}
    </section>
  )
}
