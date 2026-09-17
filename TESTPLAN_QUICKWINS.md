# OmniDesk – Testplan Quick Wins + Notifications (16.09.2026)

**Vorbereitung:** Dev-Server läuft (http://localhost:5173). Test am besten im
Chrome/Edge als auch einmal als installierte PWA. Vor Start: Browser-Konsole
offen lassen (F12), um Fehler sofort zu sehen.

---

## A. Browser-Notifications (Pomodoro)

- [ ] A1: Einstellungen → einen Pomodoro **starten** → beim ersten Start muss
      der Browser nach der **Notification-Berechtigung** fragen → „Zulassen"
- [ ] A2: Fokus-Phase **abwarten** (oder in den Settings die Fokusdauer testhalber
      auf 1 Minute stellen) → bei Phasenende: **Toast** UND **Browser-Notification**
      erscheinen (auch wenn der Tab im Hintergrund liegt)
- [ ] A3: Tab in den Hintergrund legen (anderes Fenster fokussieren) → Timer
      endet → Notification kommt trotzdem (Service Worker)
- [ ] A4: Kein Dauer-Nerv-Faktor: Timer pausieren/neu starten → keine
      Mehrfach-Berechtigungsanfragen

## B. Browser-Notifications (überfällige Tasks)

- [ ] B1: Einen Task anlegen mit **Fälligkeitsdatum in der Vergangenheit**,
      Status nicht „erledigt"
- [ ] B2: App neu laden (F5) → **eine** Notification „überfällige Tasks" kommt
- [ ] B3: Sofort nochmal F5 → **keine** zweite Notification (Marker „1x pro Tag")
- [ ] B4: Task als „erledigt" markieren → nach Datum-Änderung auf morgen und
      Reload kommt keine Meldung mehr

## C. Omni (KI-Assistent)

- [ ] C1: Modul in der Sidebar heißt **„Omni"**
- [ ] C2: Strg+K → „omni" tippen → Schnellaktion **„Omni öffnen"** erscheint
- [ ] C3: Chat ohne API-Key bzw. beim ersten Öffnen: Begrüßung „Hi, ich bin Omni 👋"
- [ ] C4: „Omni, wie geht's?" schreiben → er **antwortet auf seinen Namen**
      (nimmt Bezug, stellt sich nicht fälschlich vor)

## D. Live-Theme-Vorschau

- [ ] D1: Einstellungen → Darstellung → drei Mini-Mockups (Dunkel/Hell/System)
      sichtbar
- [ ] D2: Klick auf **„Hell"** → komplette App wechselt **sofort**, Häkchen im
      Mockup wandert mit
- [ ] D3: Klick auf „Dunkel" → zurück, Häkchen korrekt
- [ ] D4: Reload (F5) → Theme-Einstellung **geblieben** (persistiert)
- [ ] D5: „System"-Mockup sieht aus wie eine Mischung (Gradient), klickbar
      und folgt der OS-Einstellung

## E. Drag & Drop Dateianhänge in Notizen

- [ ] E1: Notizen öffnen, Notiz auswählen → unten Hinweis „Dateien hierher ziehen…"
- [ ] E2: Datei aus dem Explorer **in den Editor ziehen** → Overlay „Loslassen zum
      Anhängen" erscheint, Loslassen → Toast „angehängt", Chip unter dem Editor
- [ ] E3: Mehrere Dateien gleichzeitig ziehen → alle erscheinen als Chips
- [ ] E4: Chip-Klick → Datei öffnet sich in neuem Tab (Bild zeigt an, PDF lädt)
- [ ] E5: **Reload (F5)** → Anhänge sind **noch da** (IndexedDB!)
- [ ] E6: X am Chip → Anhang weg (nach Reload weiterhin weg)
- [ ] E7: Andere Notiz auswählen → deren (leere) Anhänge-Liste; zurück → Anhänge
      der ersten Notiz wieder da
- [ ] E8: Notiz **löschen** → keine Fehler; (Konsole frei von Fehlern, Aufräumen
      der Anhänge läuft still)

## F. Volltextsuche in der Command-Palette

- [ ] F1: Strg+K → ein Wort tippen, das **in einer Notiz** vorkommt → neue Gruppe
      „Notizen – Volltextsuche (n Treffer)"
- [ ] F2: Treffer zeigen **Notiztitel + Kontext-Snippet** mit dem Suchwort
- [ ] F3: Wort, das nur im **Titel** steht, rankt vor Treffern nur im Inhalt
- [ ] F4: Enter auf Treffer → Notes-Modul öffnet sich mit **genau dieser Notiz**
      ausgewählt
- [ ] F5: Palette schließen (Esc) und neu öffnen → Suchfeld ist **leer**
- [ ] F6: Suchbegriff ohne Treffer → Gruppe erscheint nicht, normale Befehle
      weiterhin nutzbar

## G. Regression (nichts kaputt)

- [ ] G1: Notizen normal schreiben/speichern (Autosave „Gespeichert") – das
      Tippen wird nicht durch die Anhänge-Leiste gestört
- [ ] G2: Alle anderen Palette-Aktionen weiter funktionsfähig (Dark/Light,
      Pomodoro, „Neue Notiz", CLI-Befehle kopieren)
- [ ] G3: Mobile/Schmal-Fenster: Notiz-Editor nutzbar, Chips umbrechen sauber
- [ ] G4: Browser-Konsole: **keine roten Fehler** während aller Tests

---

**Ergebnis notieren:** ✔ / ✘ pro Punkt – Fehler mit Modul + Schrittnummer.
Danach: Commits machen (1. Omni + Notifications, 2. Quick Wins, 3. Planung).
