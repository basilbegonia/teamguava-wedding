export default function MapsLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-full border border-forest/15 bg-white px-4 py-3 font-sans text-sm text-forest transition-colors hover:border-forest/40"
    >
      <svg className="w-4 h-4 flex-shrink-0 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-xs text-forest/50">Open in Maps →</span>
    </a>
  )
}
