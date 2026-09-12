import { useState } from 'react'
import { CheckCircle2, Cloud, HardDrive, Info, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AddAccountDialog } from '@/modules/cloud-monitor/components/AddAccountDialog'
import { useCloudOverview, useDeleteAccount } from '@/modules/cloud-monitor/api'

function formatBytes(bytesStr: string): string {
  const bytes = parseFloat(bytesStr || '0')
  if (isNaN(bytes) || bytes === 0) return '0 GB'
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1000) {
    return `${(gb / 1024).toFixed(1)} TB`
  }
  return `${gb.toFixed(1)} GB`
}

export function IntegrationsTab() {
  const { data, isLoading } = useCloudOverview()
  const deleteMutation = useDeleteAccount()
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const accounts = data?.accounts ?? []
  const googleAccounts = accounts.filter((a) => a.provider === 'google')
  const megaAccounts = accounts.filter((a) => a.provider === 'mega')

  return (
    <div className="space-y-6">
      {/* Hinweis zur Einrichtung */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4 text-primary" />
            OAuth2 & API-Schnittstellen (Phase 4)
          </CardTitle>
          <CardDescription>
            Verwalte deine externen Anbindungen für den Gmail-Klon, Google Drive und MEGA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs text-muted-foreground">
            <p className="max-w-xl">
              Konten können direkt hier oder im Cloud-Monitoring hinzugefügt werden. Für Live-Google-Tokens kann ein Google Cloud Projekt mit Gmail- & Drive-Scopes verwendet werden.
            </p>
            <Button
              size="sm"
              className="bg-gradient-accent glow text-white gap-1.5"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="size-4" />
              Konto verknüpfen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Google Integration */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="size-4 text-blue-400" />
              Google (Gmail & Google Drive)
            </CardTitle>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs"
            >
              {googleAccounts.length} Konten aktiv
            </Badge>
          </div>
          <CardDescription>
            Verbindung zu Gmail (E-Mails senden & empfangen) sowie Google Drive Speicherkapazität.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Konten werden geladen...</p>
          ) : googleAccounts.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Noch kein Google-Konto verknüpft.
            </p>
          ) : (
            <div className="space-y-2">
              {googleAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between rounded-md border border-border/50 bg-secondary/20 p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-foreground">
                        {acc.label || acc.email}
                      </span>
                      <span className="ml-2 text-muted-foreground">({acc.email})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {formatBytes(acc.storageUsedBytes)} / {formatBytes(acc.storageTotalBytes)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(acc.id)}
                      disabled={deleteMutation.isPending}
                      aria-label="Konto entfernen"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MEGA Integration */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cloud className="size-4 text-red-400" />
              MEGA Cloud
            </CardTitle>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs"
            >
              {megaAccounts.length} Konten aktiv
            </Badge>
          </div>
          <CardDescription>
            API-Anbindung für das Monitoring des MEGA-Cloud-Speicherplatzes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Konten werden geladen...</p>
          ) : megaAccounts.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Noch kein MEGA-Konto verknüpft.
            </p>
          ) : (
            <div className="space-y-2">
              {megaAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between rounded-md border border-border/50 bg-secondary/20 p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-foreground">
                        {acc.label || acc.email}
                      </span>
                      <span className="ml-2 text-muted-foreground">({acc.email})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {formatBytes(acc.storageUsedBytes)} / {formatBytes(acc.storageTotalBytes)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(acc.id)}
                      disabled={deleteMutation.isPending}
                      aria-label="Konto entfernen"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddAccountDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}
