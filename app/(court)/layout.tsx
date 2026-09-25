import { CourtNavbar } from "@/components/court/court-navbar"

export default function CourtLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto min-h-svh max-w-md bg-background flex flex-col">
      <CourtNavbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
