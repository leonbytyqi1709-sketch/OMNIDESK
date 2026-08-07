import { useState } from 'react'
import { ExternalLink, Link2, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { LinkDto } from '../api'

function Favicon({ link }: { link: LinkDto }) {
  const [failed, setFailed] = useState(false)

  let src = link.icon
  if (!src) {
    try {
      const domain = new URL(link.url).hostname
      src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      src = null
    }
  }

  if (!src || failed) {
    return <Link2 className="size-5 text-muted-foreground" />
  }
  return (
    <img
      src={src}
      alt=""
      className="size-5 rounded-sm"
      onError={() => setFailed(true)}
    />
  )
}

interface LinkCardProps {
  link: LinkDto
  onEdit: (link: LinkDto) => void
  onDelete: (link: LinkDto) => void
}

export function LinkCard({ link, onEdit, onDelete }: LinkCardProps) {
  let hostname = link.url
  try {
    hostname = new URL(link.url).hostname
  } catch {
    // URL nicht parsebar – Rohwert anzeigen
  }

  return (
    <Card className="group flex flex-row items-center gap-3 p-3 transition-colors hover:border-muted-foreground/40">
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
          <Favicon link={link} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{link.title}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            {hostname}
            <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </p>
        </div>
      </a>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            aria-label="Link-Aktionen"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(link)}>
            <Pencil className="size-4" /> Bearbeiten
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(link)}>
            <Trash2 className="size-4" /> Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  )
}
