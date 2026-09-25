import { CreateRunForm } from "@/components/runs/create-run-form"

export default function NewRunPage() {
  return (
    <div className="flex flex-col gap-6 px-4 pt-12 pb-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          New Run
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Create a recurring run</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A run is your group's recurring session — Friday Night, Sunday Morning, etc.
        </p>
      </div>
      <CreateRunForm />
    </div>
  )
}
