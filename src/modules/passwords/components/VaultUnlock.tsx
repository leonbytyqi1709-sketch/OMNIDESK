import { useState, type FormEvent } from 'react'
import { LockKeyhole } from 'lucide-react'
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
import { deriveKey } from '@/lib/crypto'
import type { VaultMetaDto } from '../api'
import { verifyKey } from '../crypto/verifier'
import { useVaultStore } from '../hooks/use-vault-store'

/** Entsperr-Screen: Schlüssel ableiten und gegen den Verifier prüfen. */
export function VaultUnlock({ meta }: { meta: VaultMetaDto }) {
  const unlock = useVaultStore((s) => s.unlock)

  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setChecking(true)
    setError(null)
    try {
      const key = await deriveKey(password, meta.salt)
      if (await verifyKey(key, meta.verifier)) {
        unlock(key)
      } else {
        setError('Falsches Master-Passwort')
      }
    } catch {
      setError('Entsperren fehlgeschlagen')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="bg-gradient-accent glow mx-auto flex size-12 items-center justify-center rounded-full">
            <LockKeyhole className="size-6 text-white" />
          </div>
          <CardTitle className="text-center">Vault gesperrt</CardTitle>
          <CardDescription className="text-center">
            Gib dein Master-Passwort ein, um die Einträge zu entschlüsseln.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="unlock-password">Master-Passwort</Label>
              <Input
                id="unlock-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={checking || password === ''}
              className="bg-gradient-accent glow text-white"
            >
              {checking ? 'Prüfe…' : 'Entsperren'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
