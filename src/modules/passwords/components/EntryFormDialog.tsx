import { useEffect, useState, type FormEvent } from 'react'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { encryptJson } from '@/lib/crypto'
import {
  useCreateVaultEntry,
  useUpdateVaultEntry,
  type DecryptedEntry,
} from '../api'
import {
  CATEGORY_LABELS,
  VAULT_CATEGORIES,
  type VaultCategory,
  type VaultEntryData,
} from '../constants'

/** Zufälliges Passwort (20 Zeichen) aus kryptographisch sicherer Quelle. */
function generatePassword(): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&*+-_=?'
  const random = crypto.getRandomValues(new Uint32Array(20))
  return [...random].map((n) => charset[n % charset.length]).join('')
}

interface EntryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Vault-Schlüssel des entsperrten Vaults */
  vaultKey: CryptoKey
  editEntry: DecryptedEntry | null
}

export function EntryFormDialog({
  open,
  onOpenChange,
  vaultKey,
  editEntry,
}: EntryFormDialogProps) {
  const createEntry = useCreateVaultEntry()
  const updateEntry = useUpdateVaultEntry()
  const isPending = createEntry.isPending || updateEntry.isPending

  const [title, setTitle] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState<VaultCategory>('privat')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(editEntry?.data.title ?? '')
      setUsername(editEntry?.data.username ?? '')
      setPassword(editEntry?.data.password ?? '')
      setUrl(editEntry?.data.url ?? '')
      setNotes(editEntry?.data.notes ?? '')
      setCategory(editEntry?.row.category ?? 'privat')
      setShowPassword(false)
    }
  }, [open, editEntry])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const data: VaultEntryData = { title, username, password, url, notes }
    try {
      const { ciphertext, iv } = await encryptJson(vaultKey, data)
      if (editEntry) {
        await updateEntry.mutateAsync({
          id: editEntry.row.id,
          category,
          ciphertext,
          iv,
        })
        toast.success('Eintrag aktualisiert')
      } else {
        await createEntry.mutateAsync({ category, ciphertext, iv })
        toast.success('Eintrag gespeichert')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Speichern fehlgeschlagen')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editEntry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
          </DialogTitle>
          <DialogDescription>
            Wird vor dem Speichern im Browser AES-256-verschlüsselt.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="entry-title">Titel</Label>
            <Input
              id="entry-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Router-Admin, GitHub, NAS"
              required
              maxLength={200}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="entry-username">Benutzername</Label>
            <Input
              id="entry-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              maxLength={200}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="entry-password">Passwort</Label>
            <div className="flex gap-2">
              <Input
                id="entry-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="font-mono"
                maxLength={500}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'
                }
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setPassword(generatePassword())
                  setShowPassword(true)
                }}
                aria-label="Passwort generieren"
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="entry-url">URL</Label>
              <Input
                id="entry-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                maxLength={500}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Kategorie</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as VaultCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VAULT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="entry-notes">Notizen</Label>
            <Textarea
              id="entry-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={5000}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-accent glow text-white"
            >
              {isPending ? 'Speichert…' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
