import { Cloud, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const INTEGRATIONS = [
  {
    icon: Mail,
    name: 'Google (Gmail & Drive)',
    description:
      'OAuth2-Anbindung für den Gmail-Klon und das Google-Drive-Monitoring.',
  },
  {
    icon: Cloud,
    name: 'MEGA',
    description: 'API-Anbindung für das MEGA-Speicher-Monitoring.',
  },
]

export function IntegrationsTab() {
  return (
    <div className="space-y-4">
      {INTEGRATIONS.map((integration) => (
        <Card key={integration.name}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <integration.icon className="size-4" /> {integration.name}
              <Badge variant="outline" className="ml-2 text-muted-foreground">
                Phase 4
              </Badge>
            </CardTitle>
            <CardDescription>{integration.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Verbinden (bald verfügbar)
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
