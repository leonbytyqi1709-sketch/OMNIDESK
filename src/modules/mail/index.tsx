import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useMailAccounts,
  useMailMessages,
  type MailMessageDto,
} from './api'
import { MailComposeDialog } from './components/MailComposeDialog'
import { MailDetail } from './components/MailDetail'
import { MailList } from './components/MailList'
import { MailSidebar } from './components/MailSidebar'

export default function MailPage() {
  const { data: accounts = [] } = useMailAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [currentFolder, setCurrentFolder] = useState<
    'inbox' | 'sent' | 'starred' | 'trash'
  >('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<MailMessageDto | null>(
    null,
  )
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  // Aktive Account-ID ermitteln
  const activeAccountId = selectedAccountId || accounts[0]?.id || ''

  const { data: messages = [], isLoading } = useMailMessages({
    folder: currentFolder,
    accountId: activeAccountId,
    query: searchQuery,
  })

  // Ungelesene Mails im Posteingang berechnen
  const unreadCount = messages.filter((m) => !m.isRead && m.folder === 'inbox').length

  const handleSelectMessage = (msg: MailMessageDto) => {
    setSelectedMessage(msg)
    setMobileDetailOpen(true)
  }

  const handleReply = (msg: MailMessageDto) => {
    setComposeTo(msg.fromEmail)
    setComposeSubject(
      msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
    )
    setComposeOpen(true)
  }

  const handleNewCompose = () => {
    setComposeTo('')
    setComposeSubject('')
    setComposeOpen(true)
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen w-full overflow-hidden bg-background">
      {/* 1. Spalte: Ordner-Sidebar (Desktop sichtbar, unter md verborgen oder als Menü) */}
      <div className="hidden lg:block h-full">
        <MailSidebar
          currentFolder={currentFolder}
          onFolderChange={(folder) => {
            setCurrentFolder(folder)
            setSelectedMessage(null)
          }}
          onCompose={handleNewCompose}
          unreadCount={unreadCount}
          accounts={accounts}
          selectedAccountId={activeAccountId}
          onAccountChange={setSelectedAccountId}
        />
      </div>

      {/* 2. Spalte: E-Mail-Liste */}
      <div
        className={`w-full md:w-80 lg:w-96 shrink-0 h-full flex flex-col ${
          mobileDetailOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        <MailList
          messages={messages}
          isLoading={isLoading}
          selectedId={selectedMessage?.id ?? null}
          onSelect={handleSelectMessage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* 3. Spalte: E-Mail-Detailansicht */}
      <div
        className={`flex-1 h-full overflow-hidden flex-col ${
          mobileDetailOpen ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Mobiler Zurück-Button */}
        {mobileDetailOpen && (
          <div className="flex items-center gap-2 border-b p-2 md:hidden bg-card/60">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setMobileDetailOpen(false)}
            >
              <ArrowLeft className="size-3.5" /> Zurück zur Liste
            </Button>
          </div>
        )}

        <MailDetail
          message={selectedMessage}
          onReply={handleReply}
          onClose={() => {
            setSelectedMessage(null)
            setMobileDetailOpen(false)
          }}
        />
      </div>

      {/* E-Mail verfassen Modal */}
      <MailComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        initialTo={composeTo}
        initialSubject={composeSubject}
        accountId={activeAccountId}
      />
    </div>
  )
}
