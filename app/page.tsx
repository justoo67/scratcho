import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <div className="relative mx-auto flex min-h-svh max-w-md flex-col overflow-hidden">
      {/* Full-bleed background — grayscale via CSS filter */}
      <Image
        src="/basketball_court.webp"
        alt="Basketball court"
        fill
        priority
        className="object-cover grayscale"
        sizes="(max-width: 448px) 100vw, 448px"
      />

      {/* Dark gradient scrim — bottom-heavy so text is legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

      {/* Content pinned to bottom */}
      <div className="relative mt-auto flex flex-col gap-6 px-6 pb-14 pt-24">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Scratcho
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Pickup basketball stats, courtside.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/runs/new"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 w-full bg-white text-black text-sm hover:bg-white/90"
            )}
          >
            Start a New Run
          </Link>
          <Link
            href="/games/new"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 w-full border-white/30 text-white text-sm hover:bg-white/10 hover:text-white"
            )}
          >
            Quick Game (no run)
          </Link>
        </div>

        <p className="text-center text-xs text-white/40">
          No sign-up needed. Add players and start scoring in seconds.
        </p>
      </div>
    </div>
  )
}
