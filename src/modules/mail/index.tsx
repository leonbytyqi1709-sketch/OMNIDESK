import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useMailAccounts,
  useMailMessage,
  useMailMessages,
  type MailMessageDto,
} from './api'
import { MailComposeDialog } from './components/MailComposeDialog'
import { MailDetail } from './components/MailDetail'
import { MailList, type MailCategoryType } from './components/MailList'
import { MailSidebar } from './components/MailSidebar'

export default function MailPage() {
  const { data: accounts = [] } = useMailAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [currentFolder, setCurrentFolder] = useState<
    'inbox' | 'sent' | 'starred' | 'trash'
  >('inbox')
  const [category, setCategory] = useState<MailCategoryType>('primary')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [selectedMessageBasic, setSelectedMessageBasic] = useState<MailMessageDto | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  // Automatische Auswahl: Bevorzuge das echte verknüpfte Google-Konto
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      const liveAccount = accounts.find((a) => a.hasToken)
      if (liveAccount) {
        setSelectedAccountId(liveAccount.id)
      } else {
        setSelectedAccountId(accounts[0].id)
      }
    }
  }, [accounts, selectedAccountId])

  // Aktive Account-ID ermitteln
  const activeAccountId =
    selectedAccountId ||
    accounts.find((a) => a.hasToken)?.id ||
    accounts[0]?.id ||
    ''

  const {
    data: messages = [],
    isLoading,
    isFetching,
    refetch,
  } = useMailMessages({
    folder: currentFolder,
    accountId: activeAccountId,
    category: currentFolder === 'inbox' ? category : undefined,
    query: searchQuery,
    limit: 50,
  })

  // Ausführliche E-Mail mit echtem HTML-Body laden
  const { data: fullMessage } = useMailMessage(selectedMessageId, activeAccountId)

  // Aktives Detail-Message-Objekt
  const activeMessage = fullMessage || selectedMessageBasic

  // Ungelesene Mails im Posteingang berechnen
  const unreadCount = messages.filter((m) => !m.isRead && m.folder === 'inbox').length

  const handleSelectMessage = (msg: MailMessageDto) => {
    setSelectedMessageId(msg.id)
    setSelectedMessageBasic(msg)
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
      {/* 1. Spalte: Ordner-Sidebar */}
      <div className="hidden lg:block h-full">
        <MailSidebar
          currentFolder={currentFolder}
          onFolderChange={(folder) => {
            setCurrentFolder(folder)
            setSelectedMessageId(null)
            setSelectedMessageBasic(null)
          }}
          onCompose={handleNewCompose}
          unreadCount={unreadCount}
          accounts={accounts}
          selectedAccountId={activeAccountId}
          onAccountChange={(id) => {
            setSelectedAccountId(id)
            setSelectedMessageId(null)
            setSelectedMessageBasic(null)
          }}
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
          selectedId={activeMessage?.id ?? null}
          onSelect={handleSelectMessage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentFolder={currentFolder}
          category={category}
          onCategoryChange={setCategory}
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
          accountId={activeAccountId}
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
          message={activeMessage}
          onReply={handleReply}
          onClose={() => {
            setSelectedMessageId(null)
            setSelectedMessageBasic(null)
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
