export type InfoRow = { icon: string; text: string }

/**
 * White rounded callout card: a bold title over icon + text rows.
 * Used for the Dress Code "Rules from the church" card and the Mga Ganap
 * parking cards.
 */
export default function InfoCard({
  title,
  rows,
}: {
  title: string
  rows: InfoRow[]
}) {
  return (
    <div className="rounded-2xl bg-white border border-forest/10 p-5 space-y-2.5">
      <p className="font-sans text-sm font-bold text-forest">{title}</p>
      {rows.map((r, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span aria-hidden className="flex-shrink-0 leading-6">
            {r.icon}
          </span>
          <span className="font-sans text-sm text-forest/80 leading-6">
            {r.text}
          </span>
        </div>
      ))}
    </div>
  )
}
