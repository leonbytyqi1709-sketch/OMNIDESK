import { useState } from 'react'
import { Cloud, HardDrive } from 'lucide-react'
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
import { useConnectAccount } from '../api'

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddAccountDialog({ open, onOpenChange }: AddAccountDialogProps) {
  const [provider, setProvider] = useState<'google' | 'mega'>('google')
  const [email, setEmail] = useState('')
  const [label, setLabel] = useState('')
  const [capacityGb, setCapacityGb] = useState('15')
  const [error, setError] = useState<string | null>(null)

  const connectMutation = useConnectAccount()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes('@')) {
      setError('Bitte eine gültige E-Mail-Adresse eingeben.')
      return
    }

    const totalBytes = (parseFloat(capacityGb || '15') * 1024 * 1024 * 1024).toString()

    try {
      await connectMutation.mutateAsync({
        provider,
        email: email.trim(),
        label: label.trim() || (provider === 'google' ? 'Google Drive' : 'MEGA Cloud'),
        storageTotalBytes: totalBytes,
      })
      setEmail('')
      setLabel('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konto konnte nicht hinzugefügt werden.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {provider === 'google' ? (
              <HardDrive className="size-5 text-blue-500" />
            ) : (
              <Cloud className="size-5 text-red-500" />
            )}
            Cloud-Konto verknüpfen
          </DialogTitle>
          <DialogDescription>
            Füge ein Google Drive oder MEGA Konto für das Speicherkapazitäts-Monitoring hinzu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="provider">Anbieter</Label>
            <Select
              value={provider}
              onValueChange={(val) => {
                const nextProvider = val as 'google' | 'mega'
                setProvider(nextProvider)
                setCapacityGb(nextProvider === 'google' ? '15' : '20')
              }}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Anbieter wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Drive (15 GB Standard)</SelectItem>
                <SelectItem value="mega">MEGA Cloud (20 GB Standard)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account-email">Account-E-Mail</Label>
            <Input
              id="account-email"
              type="email"
              placeholder={provider === 'google' ? 'dein.name@gmail.com' : 'dein.name@mega.nz'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account-label">Bezeichnung / Label (optional)</Label>
            <Input
              id="account-label"
              placeholder={provider === 'google' ? 'z. B. Google Drive #3 (Backups)' : 'z. B. MEGA Offsite'}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account-capacity">Gesamtspeicherplatz (GB)</Label>
            <Input
              id="account-capacity"
              type="number"
              min="1"
              max="100000"
              value={capacityGb}
              onChange={(e) => setCapacityGb(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={connectMutation.isPending}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-gradient-accent glow text-white"
              disabled={connectMutation.isPending}
            >
              {connectMutation.isPending ? 'Wird gespeichert...' : 'Konto hinzufügen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
