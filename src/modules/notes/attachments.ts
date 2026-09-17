import { useEffect, useState } from 'react'

/**
 * Dateianhänge für Notizen – lokal in IndexedDB.
 * Anhänge bleiben client-seitig (keine Cloud), koppeln über noteId
 * und überleben Reloads. Dateien + Metadaten in einem Record.
 */

const DB_NAME = 'omnidesk-attachments'
const DB_VERSION = 1
const STORE = 'attachments'

export interface NoteAttachment {
  id: string
  noteId: string
  name: string
  size: number
  type: string
  addedAt: number
  file: Blob
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('noteId', 'noteId', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function requestAsPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** Hängt eine Datei an eine Notiz an. */
export async function addNoteAttachment(
  noteId: string,
  file: File,
): Promise<NoteAttachment> {
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  const store = tx.objectStore(STORE)
  const attachment: NoteAttachment = {
    id: crypto.randomUUID(),
    noteId,
    name: file.name,
    size: file.size,
    type: file.type,
    addedAt: Date.now(),
    file,
  }
  await requestAsPromise(store.add(attachment))
  return attachment
}

/** Alle Anhänge einer Notiz (älteste zuerst). */
export async function getNoteAttachments(
  noteId: string,
): Promise<NoteAttachment[]> {
  const db = await openDb()
  const tx = db.transaction(STORE, 'readonly')
  const index = tx.objectStore(STORE).index('noteId')
  const all = await requestAsPromise(index.getAll(noteId))
  return all.sort((a, b) => a.addedAt - b.addedAt)
}

/** Löscht einen einzelnen Anhang. */
export async function deleteNoteAttachment(id: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  await requestAsPromise(tx.objectStore(STORE).delete(id))
}

/** Löscht alle Anhänge einer Notiz (z. B. beim Notiz-Löschen). */
export async function deleteAllNoteAttachments(
  noteId: string,
): Promise<void> {
  const attachments = await getNoteAttachments(noteId)
  await Promise.all(attachments.map((a) => deleteNoteAttachment(a.id)))
}

/** Öffnet einen Anhang in einem neuen Browser-Tab. */
export function openNoteAttachment(attachment: NoteAttachment): void {
  const url = URL.createObjectURL(attachment.file)
  window.open(url, '_blank')
  // Blob-URL nach kurzer Zeit freigeben (Download/Anzeige startet sofort)
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** React-Hook: lädt die Anhänge einer Notiz und hält sie aktuell. */
export function useNoteAttachments(noteId: string | null) {
  const [attachments, setAttachments] = useState<NoteAttachment[]>([])
  const [isDropping, setIsDropping] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!noteId) {
      setAttachments([])
      return
    }
    void getNoteAttachments(noteId).then((list) => {
      if (!cancelled) setAttachments(list)
    })
    return () => {
      cancelled = true
    }
  }, [noteId])

  const addFiles = async (noteIdToAdd: string, files: FileList | File[]) => {
    const added: NoteAttachment[] = []
    for (const file of Array.from(files)) {
      added.push(await addNoteAttachment(noteIdToAdd, file))
    }
    setAttachments((prev) => [...prev, ...added])
  }

  const remove = async (id: string) => {
    await deleteNoteAttachment(id)
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  return { attachments, addFiles, remove, isDropping, setIsDropping, formatSize }
}
