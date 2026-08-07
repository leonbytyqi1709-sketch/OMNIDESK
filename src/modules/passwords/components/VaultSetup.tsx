import { useState, type FormEvent } from 'react'
import { KeyRound, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { deriveKey, randomSaltB64 } from '@/lib/crypto'
import { useCreateVaultMeta } from '../api'
import { createVerifier } from '../crypto/verifier'
import { useVaultStore } from '../hooks/use-vault-store'

/** Erst-Einrichtung: Master-Passwort setzen, Salt + Verifier hochladen. */
export function VaultSetup() {
  const createMeta = useCreateVaultMeta()
  const unlock = useVaultStore((s) => s.unlock)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [deriving, setDeriving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Das Master-Passwort muss mindestens 8 Zeichen haben.')
      return
    }
    if (password !== confirm) {
      toast.error('Die Passwörter stimmen nicht überein.')
      return
    }
    setDeriving(true)
    try {
      const salt = randomSaltB64()
      const key = await deriveKey(password, salt)
      const verifier = await createVerifier(key)
      await createMeta.mutateAsync({ salt, verifier })
      unlock(key)
      toast.success('Vault eingerichtet und entsperrt')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Einrichtung fehlgeschlagen',
      )
    } finally {
      setDeriving(false)
    }
  }

  const isPending = deriving || createMeta.isPending

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="bg-gradient-accent glow mx-auto flex size-12 items-center justify-center rounded-full">
            <KeyRound className="size-6 text-white" />
          </div>
          <CardTitle className="text-center">Vault einrichten</CardTitle>
          <CardDescription className="text-center">
            Wähle ein Master-Passwort. Alle Einträge werden damit direkt im
            Browser ver- und entschlüsselt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="vault-password">Master-Passwort</Label>
              <Input
                id="vault-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="vault-confirm">Master-Passwort wiederholen</Label>
              <Input
                id="vault-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-muted-foreground">
                Das Master-Passwort ist <strong>nicht wiederherstellbar</strong>.
                Geht es verloren, sind alle Einträge unwiderruflich
                unlesbar – es wird nirgends gespeichert.
              </p>
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-accent glow text-white"
            >
              {isPending ? 'Richte ein…' : 'Vault erstellen'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
