import { useCallback, useEffect, useRef, useState } from 'react'
import { GripVertical, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'omnidesk:scratchpad'
const OPEN_KEY = 'omnidesk:scratchpad-open'
const POS_KEY = 'omnidesk:scratchpad-pos'
const SHORTCUT_LABEL = 'Strg + Shift + S'

/**
 * Floating Scratchpad – immer griffbereiter Schnellentwurf.
 *
 * - Global per Shortcut öffnen/schließen: Strg + Shift + S
 * - Inhalt wird automatisch (debounced) im localStorage gesichert
 * - Fenster ist per Header frei verschiebbar, Position wird gemerkt
 */
export function FloatingScratchpad() {
  const [open, setOpen] = useState(
    () => localStorage.getItem(OPEN_KEY) === '1',
  )
  const [text, setText] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [saved, setSaved] = useState(true)
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    const raw = localStorage.getItem(POS_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { x: number; y: number }
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed
      } catch {
        /* fällt auf Default zurück */
      }
    }
    // Default: unten rechts (wird beim ersten Rendern passend gesetzt)
    return {
      x: Math.max(window.innerWidth - 344, 8),
      y: Math.max(window.innerHeight - 300, 8),
    }
  })

  const dragging = useRef(false)
  const dragStart = useRef({ px: 0, py: 0, x: 0, y: 0 })
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Globaler Shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    localStorage.setItem(OPEN_KEY, open ? '1' : '0')
  }, [open])

  // Debounced Speichern des Texts
  useEffect(() => {
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, text)
      setSaved(true)
    }, 500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [text])

  useEffect(() => {
    localStorage.setItem(POS_KEY, JSON.stringify(pos))
  }, [pos])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    dragStart.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    e.preventDefault()
  }, [pos])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - dragStart.current.px
    const dy = e.clientY - dragStart.current.py
    const maxX = window.innerWidth - 160
    const maxY = window.innerHeight - 80
    setPos({
      x: Math.min(Math.max(dragStart.current.x + dx, 0), Math.max(maxX, 0)),
      y: Math.min(Math.max(dragStart.current.y + dy, 0), Math.max(maxY, 0)),
    })
  }, [])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed z-50 w-80 rounded-xl border border-border bg-card shadow-2xl shadow-black/40 backdrop-blur"
      style={{ left: pos.x, top: pos.y }}
      role="dialog"
      aria-label="Scratchpad"
    >
      {/* Header / Drag-Handle */}
      <div
        className="flex cursor-grab items-center gap-2 rounded-t-xl border-b border-border bg-muted/60 px-3 py-2 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Scratchpad
        </span>
        <span
          className={cn(
            'text-[10px] transition-opacity',
            saved ? 'text-muted-foreground/50' : 'text-primary',
          )}
          aria-live="polite"
        >
          {saved ? 'gespeichert' : 'speichert…'}
        </span>
        <button
          type="button"
          onClick={() => {
            setText('')
          }}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Leeren"
          aria-label="Scratchpad leeren"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Schließen"
          aria-label="Scratchpad schließen"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Textfläche */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Schnell notieren… (automatisch gespeichert)"
        className="h-44 w-full resize-none rounded-b-xl bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
        spellCheck={false}
      />

      <div className="px-3 pb-2 text-[10px] text-muted-foreground/50">
        {SHORTCUT_LABEL} zum Öffnen/Schließen
      </div>
    </div>
  )
}