export default function CourtLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto min-h-svh max-w-md bg-background">
      {children}
    </div>
  )
}
