import Header from '@/components/Header'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-forest">
      <Header />
      {children}
    </div>
  )
}
