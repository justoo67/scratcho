"use client"

import { useSession, signOut } from "@/lib/auth-client"
import { GoogleSignInButton } from "./google-sign-in-button"
import { LogOutIcon } from "lucide-react"

export function UserAccountBadge() {
  const { data: session } = useSession()

  if (session?.user) {
    return (
      <div className="flex items-center justify-between rounded-full bg-black/40 backdrop-blur-md border border-white/15 px-3 py-1.5 text-xs text-white">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name}
                className="size-6 rounded-full object-cover"
              />
            ) : (
              session.user.name?.[0]?.toUpperCase() || "U"
            )}
          </div>
          <span className="font-medium text-white/90 truncate max-w-[120px]">
            {session.user.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="ml-3 text-white/60 hover:text-white p-1"
          title="Sign out"
        >
          <LogOutIcon className="size-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-auto">
      <GoogleSignInButton
        label="Google Sign In"
        className="h-8 px-3 text-[11px] bg-black/40 hover:bg-black/60 text-white border-white/20 backdrop-blur-md"
      />
    </div>
  )
}
