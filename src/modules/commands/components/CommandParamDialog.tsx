import { useEffect, useState } from 'react'
import { Check, Copy, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CommandDto } from '../api'

interface CommandParamDialogProps {
  command: CommandDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function extractPlaceholders(cmdText: string): string[] {
  const matches = cmdText.match(/{{\s*([^}]+)\s*}}/g)
  if (!matches) return []
  const unique = Array.from(
    new Set(matches.map((m) => m.replace(/^{{\s*|\s*}}$/g, ''))),
  )
  return unique
}

export function replacePlaceholders(
  cmdText: string,
  params: Record<string, string>,
): string {
  let result = cmdText
  for (const [key, val] of Object.entries(params)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    result = result.replace(regex, val.trim() || `{{${key}}}`)
  }
  return result
}

export function CommandParamDialog({
  command,
  open,
  onOpenChange,
}: CommandParamDialogProps) {
  const [params, setParams] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const placeholders = command ? extractPlaceholders(command.command) : []

  useEffect(() => {
    if (open && command) {
      const list = extractPlaceholders(command.command)
      const initial: Record<string, string> = {}
      for (const p of list) {
        initial[p] = ''
      }
      setParams(initial)
      setCopied(false)
    }
  }, [open, command])

  if (!command) return null

  const resolvedCommand = replacePlaceholders(command.command, params)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(resolvedCommand)
    setCopied(true)
    toast.success('Befehl mit Parametern kopiert!')
    setTimeout(() => {
      setCopied(false)
      onOpenChange(false)
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="size-5 text-primary" />
            Parameter für Befehl ausfüllen
          </DialogTitle>
          <DialogDescription>{command.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Eingabefelder für jeden Platzhalter */}
          <div className="space-y-3">
            {placeholders.map((p) => (
              <div key={p} className="space-y-1.5">
                <Label htmlFor={`param-${p}`} className="font-mono text-xs text-primary">
                  {p}
                </Label>
                <Input
                  id={`param-${p}`}
                  placeholder={`Wert für ${p} eingeben...`}
                  value={params[p] ?? ''}
                  onChange={(e) =>
                    setParams((prev) => ({ ...prev, [p]: e.target.value }))
                  }
                  autoFocus={placeholders[0] === p}
                />
              </div>
            ))}
          </div>

          {/* Live-Vorschau des fertig ersetzten Befehls */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Vorschau des Befehls:</Label>
            <div className="rounded-md border border-border bg-secondary/50 p-3 font-mono text-xs break-all text-foreground">
              {resolvedCommand}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            type="button"
            className="bg-gradient-accent glow text-white gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="size-4 text-green-300" /> Kopiert!
              </>
            ) : (
              <>
                <Copy className="size-4" /> Fertigen Befehl kopieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
