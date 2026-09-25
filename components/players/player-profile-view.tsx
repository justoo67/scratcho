"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signUp, signOut } from "@/lib/auth-client"
import { claimPlayer, updatePlayerProfile } from "@/lib/players/actions"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CheckCircle2Icon,
  Share2Icon,
  Edit2Icon,
  CopyIcon,
  CheckIcon,
} from "lucide-react"
import type { Player } from "@/db/schema"
import { PlayerStatsCard } from "./player-stats-card"

interface StatItem {
  id: string
  code: string
  name: string
  total: number
  perGame: string
  label: string
}

interface Props {
  player: Player
  career: {
    totalGames: number
    stats: StatItem[]
  }
}

export function PlayerProfileView({ player: initialPlayer, career }: Props) {
  const { data: session } = useSession()
  const [player, setPlayer] = useState<Player>(initialPlayer)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [copied, setCopied] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)

  // Edit form state
  const [nickname, setNickname] = useState(player.nickname || "")
  const [jerseyNumber, setJerseyNumber] = useState(player.jerseyNumber || "")

  const isOwner = session?.user?.id === player.claimedByUserId
  const isUnclaimed = !player.claimedByUserId

  // Auto-claim if returning from Google OAuth sign-in
  useEffect(() => {
    if (session?.user?.id && isUnclaimed && !isClaiming) {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search)
        if (params.get("autoClaim") === "1" || showClaimModal) {
          setIsClaiming(true)
          claimPlayer(player.id, session.user.id)
            .then((updated) => {
              setPlayer(updated)
              setShowClaimModal(false)
            })
            .catch(console.error)
            .finally(() => setIsClaiming(false))
        }
      }
    }
  }, [session, isUnclaimed, isClaiming, player.id, showClaimModal])

  async function handleClaimNow() {
    if (!session?.user) {
      setShowClaimModal(true)
      return
    }

    setIsClaiming(true)
    try {
      const updated = await claimPlayer(player.id, session.user.id)
      setPlayer(updated)
      setShowClaimModal(false)
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to claim profile")
    } finally {
      setIsClaiming(false)
    }
  }

  async function handleAuthAndClaim(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    setIsClaiming(true)

    try {
      if (authMode === "signup") {
        const res = await signUp.email({
          email,
          password,
          name: player.name,
        })
        if (res.error) {
          setAuthError(res.error.message || "Failed to sign up")
          setIsClaiming(false)
          return
        }
        if (res.data?.user?.id) {
          const updated = await claimPlayer(player.id, res.data.user.id)
          setPlayer(updated)
          setShowClaimModal(false)
        }
      } else {
        const res = await signIn.email({
          email,
          password,
        })
        if (res.error) {
          setAuthError(res.error.message || "Failed to sign in")
          setIsClaiming(false)
          return
        }
        if (res.data?.user?.id) {
          const updated = await claimPlayer(player.id, res.data.user.id)
          setPlayer(updated)
          setShowClaimModal(false)
        }
      }
    } catch (err: unknown) {
      setAuthError((err as Error).message || "Authentication error")
    } finally {
      setIsClaiming(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!session?.user?.id) return

    try {
      const updated = await updatePlayerProfile(player.id, session.user.id, {
        nickname: nickname.trim() || undefined,
        jerseyNumber: jerseyNumber.trim() || undefined,
      })
      setPlayer(updated)
      setShowEditModal(false)
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to update profile")
    }
  }

  function handleCopyShareLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-4 pb-12">
      {/* High-impact Player Stats Card */}
      <PlayerStatsCard
        player={player}
        career={career}
        backgroundImage="/basketball_court.webp"
        priority
      />

      {/* Claim Banner (Docs Section 3 & 37) */}
      {isUnclaimed && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2Icon className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Is this you?</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Claim this player profile to save your stats, add your nickname and jersey number, and keep your history across games.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full h-9 text-xs font-semibold"
            onClick={handleClaimNow}
            disabled={isClaiming}
          >
            {isClaiming ? "Claiming..." : "Claim Your Player Profile"}
          </Button>
        </div>
      )}

      {/* Owner controls */}
      {isOwner && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs gap-1.5"
            onClick={() => setShowEditModal(true)}
          >
            <Edit2Icon className="size-3.5" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs gap-1.5"
            onClick={handleCopyShareLink}
          >
            {copied ? <CheckIcon className="size-3.5" /> : <Share2Icon className="size-3.5" />}
            {copied ? "Copied" : "Share"}
          </Button>
        </div>
      )}

      {/* Career summary stats (Docs Section 27) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Career Overview
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            {career.totalGames} {career.totalGames === 1 ? "Game" : "Games"} Played
          </span>
        </div>

        {career.totalGames === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No games recorded yet for this player.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {career.stats.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-3"
              >
                <span className="text-xl font-bold tabular-nums">
                  {s.perGame}
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                  {s.label}
                </span>
                <span className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {s.total} total
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Claim / Auth Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-background border border-border p-6 shadow-xl flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold">
                {authMode === "signup" ? "Create Account & Claim" : "Sign In & Claim"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Link this basketball player profile to your account.
              </p>
            </div>

            {/* 1-Tap Google Sign-In */}
            <div className="flex flex-col gap-2">
              <GoogleSignInButton
                label="Continue with Google & Claim"
                callbackURL={
                  typeof window !== "undefined"
                    ? `${window.location.pathname}?autoClaim=1`
                    : undefined
                }
              />

              <div className="relative flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <span className="relative bg-background px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  or with email
                </span>
              </div>
            </div>

            <form onSubmit={handleAuthAndClaim} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="password" className="text-xs">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {authError && (
                <p className="text-xs text-destructive">{authError}</p>
              )}

              <Button type="submit" size="sm" className="h-9 text-xs font-semibold mt-1" disabled={isClaiming}>
                {isClaiming
                  ? "Processing..."
                  : authMode === "signup"
                  ? "Create Account & Claim"
                  : "Sign In & Claim"}
              </Button>
            </form>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
              <button
                type="button"
                className="hover:underline"
                onClick={() => {
                  setAuthMode(authMode === "signup" ? "signin" : "signup")
                  setAuthError(null)
                }}
              >
                {authMode === "signup"
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
              <button
                type="button"
                className="hover:text-foreground font-medium"
                onClick={() => setShowClaimModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-background border border-border p-6 shadow-xl flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold">Edit Player Profile</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Customize how your profile appears courtside and in score sheets.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="nickname" className="text-xs">
                  Nickname
                </Label>
                <Input
                  id="nickname"
                  placeholder="e.g. The Microwave"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="jerseyNumber" className="text-xs">
                  Jersey Number
                </Label>
                <Input
                  id="jerseyNumber"
                  placeholder="e.g. 23"
                  maxLength={4}
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="flex-1 h-9 text-xs font-semibold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
