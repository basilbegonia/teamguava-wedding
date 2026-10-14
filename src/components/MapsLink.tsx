export default function MapsLink({
  label,
  href,
  compact = false,
}: {
  label: string
  href: string
  compact?: boolean
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 rounded-full border border-forest/15 text-forest transition-colors hover:border-forest/40 ${
        compact ? 'bg-cream px-3.5 py-2 font-sans text-xs' : 'bg-white px-4 py-3 font-sans text-sm'
      }`}
    >
      <svg
        className={`flex-shrink-0 text-terracotta ${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
      <span className="font-medium">{label}</span>
      {compact ? (
        <span className="ml-auto flex-shrink-0 text-forest/40" aria-hidden>→</span>
      ) : (
        <span className="ml-auto text-xs text-forest/50">Open in Maps →</span>
      )}
    </a>
  )
}
