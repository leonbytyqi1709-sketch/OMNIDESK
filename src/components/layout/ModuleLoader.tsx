import { Loader2 } from 'lucide-react'

/** Suspense-Fallback, während der Chunk eines Moduls nachgeladen wird. */
export function ModuleLoader() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <Loader2 className="glow size-8 animate-spin text-muted-foreground" />
    </div>
  )
}
