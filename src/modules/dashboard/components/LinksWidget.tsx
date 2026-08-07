import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useLinks, type LinkDto } from '@/modules/links/api'
import { WidgetCard } from './WidgetCard'

function LinkTile({ link }: { link: LinkDto }) {
  const [failed, setFailed] = useState(false)

  let favicon: string | null = link.icon
  if (!favicon) {
    try {
      favicon = `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`
    } catch {
      favicon = null
    }
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      title={link.title}
      className="flex flex-col items-center gap-1.5 rounded-md p-2 transition-colors hover:bg-accent"
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-secondary">
        {favicon && !failed ? (
          <img
            src={favicon}
            alt=""
            className="size-5 rounded-sm"
            onError={() => setFailed(true)}
          />
        ) : (
          <Link2 className="size-4 text-muted-foreground" />
        )}
      </span>
      <span className="w-full truncate text-center text-xs text-muted-foreground">
        {link.title}
      </span>
    </a>
  )
}

/** Schnellzugriff auf die gespeicherten Web-Interfaces. */
export function LinksWidget() {
  const { data: links, isLoading } = useLinks()

  return (
    <WidgetCard title="Schnellzugriff" icon={Link2} to="/links">
      {isLoading ? (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      ) : !links || links.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Links.</p>
      ) : (
        <div className="grid grid-cols-4 gap-1">
          {links.slice(0, 8).map((link) => (
            <LinkTile key={link.id} link={link} />
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
