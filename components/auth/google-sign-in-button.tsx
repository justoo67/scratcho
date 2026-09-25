"use client"

import { useState } from "react"
import { authClient, signIn, signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { SparklesIcon, XIcon, HelpCircleIcon } from "lucide-react"

interface Props {
  callbackURL?: string
  className?: string
  label?: string
}

export function GoogleSignInButton({
  callbackURL,
  className,
  label = "Continue with Google",
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfigHelper, setShowConfigHelper] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)

  async function handleGoogleSignIn() {
    setIsLoading(true)

    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL:
          callbackURL || (typeof window !== "undefined" ? window.location.href : "/"),
      })

      if (res?.error) {
        setShowConfigHelper(true)
      }
    } catch {
      setShowConfigHelper(true)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleInstantDemoLogin() {
    setIsDemoLoading(true)
    const demoEmail = "player@scratcho.app"
    const demoPassword = "ScratchoPassword123!"

    try {
      // Try sign in first
      const inRes = await signIn.email({
        email: demoEmail,
        password: demoPassword,
      })

      if (inRes?.error) {
        // If account doesn't exist yet, sign up
        await signUp.email({
          email: demoEmail,
          password: demoPassword,
          name: "Pickup Player",
        })
      }

      setShowConfigHelper(false)
      if (typeof window !== "undefined") {
        if (callbackURL) {
          window.location.href = callbackURL
        } else {
          window.location.reload()
        }
      }
    } catch (e: unknown) {
      alert((e as Error).message || "Demo sign in failed")
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleGoogleSignIn}
        disabled={isLoading || isDemoLoading}
        className={`flex items-center justify-center gap-2.5 h-11 w-full font-medium text-xs bg-card hover:bg-muted text-foreground border-border shadow-sm active:scale-[0.99] transition-all ${
          className || ""
        }`}
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{isLoading ? "Connecting to Google…" : label}</span>
      </Button>

      {/* Setup helper modal shown when Google credentials are not yet configured */}
      {showConfigHelper && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-background border border-border p-5 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <HelpCircleIcon className="size-5 text-amber-500" />
                <h3 className="text-base font-bold">Google OAuth Setup</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigHelper(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Google Sign-In is ready in code. To connect with real Google accounts, create an OAuth 2.0 Client in Google Cloud Console and add these to your <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">.env.local</code>:
            </p>

            <div className="rounded-md bg-muted p-2.5 font-mono text-[11px] space-y-1 text-muted-foreground select-all overflow-x-auto">
              <div>GOOGLE_CLIENT_ID=your_client_id</div>
              <div>GOOGLE_CLIENT_SECRET=your_secret</div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Redirect URI in Google Console:
              <br />
              <code className="text-foreground font-semibold">
                http://localhost:3000/api/auth/callback/google
              </code>
            </p>

            <div className="border-t border-border pt-3 flex flex-col gap-2">
              <p className="text-[11px] font-medium text-foreground">
                Want to test 1-tap claim right now?
              </p>
              <Button
                type="button"
                size="sm"
                onClick={handleInstantDemoLogin}
                disabled={isDemoLoading}
                className="w-full h-9 text-xs font-semibold gap-1.5"
              >
                <SparklesIcon className="size-3.5" />
                {isDemoLoading ? "Signing in..." : "Instant 1-Tap Demo Sign-In"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
