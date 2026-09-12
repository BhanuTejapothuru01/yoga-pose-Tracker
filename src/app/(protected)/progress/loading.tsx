import { Loader2 } from 'lucide-react'

export default function ProgressLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-text-muted">Loading...</p>
    </div>
  )
}
