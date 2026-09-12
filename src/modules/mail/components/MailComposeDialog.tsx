import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { useSendMail } from '../api'

interface MailComposeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTo?: string
  initialSubject?: string
  initialBody?: string
  accountId?: string
}

export function MailComposeDialog({
  open,
  onOpenChange,
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  accountId,
}: MailComposeDialogProps) {
  const [toEmail, setToEmail] = useState(initialTo)
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)
  const [error, setError] = useState<string | null>(null)

  const sendMutation = useSendMail()

  useEffect(() => {
    if (open) {
      setToEmail(initialTo)
      setSubject(initialSubject)
      setBody(initialBody)
      setError(null)
    }
  }, [open, initialTo, initialSubject, initialBody])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!toEmail.trim() || !toEmail.includes('@')) {
      setError('Bitte eine gültige Empfänger-E-Mail-Adresse eingeben.')
      return
    }

    if (!subject.trim()) {
      setError('Bitte einen Betreff angeben.')
      return
    }

    if (!body.trim()) {
      setError('Bitte einen Nachrichtentext verfassen.')
      return
    }

    try {
      await sendMutation.mutateAsync({
        accountId,
        toEmail: toEmail.trim(),
        subject: subject.trim(),
        body: body.trim(),
      })
      toast.success('E-Mail erfolgreich gesendet')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'E-Mail konnte nicht gesendet werden.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-4 text-primary" />
            E-Mail verfassen
          </DialogTitle>
          <DialogDescription>
            Sende eine E-Mail über dein verknüpftes Google-Konto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-3.5 py-2">
          {error && (
            <div className="rounded-md bg-destructive/15 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="toEmail" className="text-xs">
              An (Empfänger)
            </Label>
            <Input
              id="toEmail"
              type="email"
              placeholder="empfaenger@beispiel.de"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="subject" className="text-xs">
              Betreff
            </Label>
            <Input
              id="subject"
              placeholder="Betreff der Nachricht"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="body" className="text-xs">
              Nachricht
            </Label>
            <Textarea
              id="body"
              rows={8}
              placeholder="Schreibe deine Nachricht..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="resize-none font-sans"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sendMutation.isPending}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-gradient-accent glow text-white gap-2"
              disabled={sendMutation.isPending}
            >
              <Send className="size-3.5" />
              {sendMutation.isPending ? 'Wird gesendet...' : 'Senden'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
