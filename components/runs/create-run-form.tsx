"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createRun } from "@/lib/runs/actions"
import { createPlayer } from "@/lib/players/actions"
import { ulid } from "@/lib/ulid"

type State =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; runId: string }

async function createRunAction(_prev: State, formData: FormData): Promise<State> {
  try {
    // Create a guest player as the owner for now
    const ownerName = (formData.get("ownerName") as string | null)?.trim()
    if (!ownerName) return { status: "error", message: "Your name is required." }

    const name = (formData.get("name") as string | null)?.trim()
    if (!name) return { status: "error", message: "Run name is required." }

    const location = (formData.get("location") as string | null)?.trim() || undefined

    const owner = await createPlayer({ name: ownerName })
    const run = await createRun({ name, location, ownerPlayerId: owner.id })

    return { status: "success", runId: run.id }
  } catch (e) {
    return { status: "error", message: "Something went wrong. Try again." }
  }
}

export function CreateRunForm() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(createRunAction, { status: "idle" })

  useEffect(() => {
    if (state.status === "success") {
      router.push(`/runs/${state.runId}`)
    }
  }, [state, router])

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ownerName">Your name</Label>
        <Input
          id="ownerName"
          name="ownerName"
          placeholder="e.g. Brian"
          autoComplete="given-name"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Run name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Friday Night Run"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">
          Location <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="location"
          name="location"
          placeholder="e.g. Riverside Courts"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-sm"
        disabled={isPending}
      >
        {isPending ? "Creating…" : "Create Run"}
      </Button>
    </form>
  )
}
