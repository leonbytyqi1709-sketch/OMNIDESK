# OmniDesk – Gesamt-Testliste (Smoke-Test über die ganze App)

**Start:** http://localhost:5173 · Konsole offen lassen (F12) · Am Ende: keine roten Fehler (Punkt 17)

---

## 1. App-Start & Login
- [ ] Seite lädt, Login/Passkey funktioniert
- [ ] Dashboard erscheint, keine Ladefehler

## 2. Dashboard (Einsatzzentrale)
- [ ] Widgets anzeigen Daten (Tasks, Termine, Notizen …)
- [ ] Widget per Drag & Drop umsortieren → bleibt nach Reload
- [ ] Widget-Manager (Widgets an/aus) → Änderung bleibt nach Reload

## 3. Einstellungen
- [ ] **Darstellung:** Theme-Mockups (Dunkel/Hell/System) → Klick wechselt sofort, Häkchen wandert, bleibt nach F5
- [ ] Kompakt-Modus umschalten → Abstände ändern sich sichtbar
- [ ] Module-Tab: ein Modul deaktivieren → verschwindet aus Sidebar, wieder aktivieren
- [ ] Allgemein/Integrationen: öffnen, nichts kaputt

## 4. Notizen ⭐ NEU
- [ ] Notiz anlegen, tippen → Autosave zeigt „Gespeichert"
- [ ] Markdown-Vorschau-Tab funktioniert
- [ ] **Datei in den Editor ziehen** → Overlay, Toast, Chip entsteht
- [ ] Chip-Klick öffnet Datei im neuen Tab · X entfernt Anhang
- [ ] **F5 → Anhänge sind noch da**
- [ ] Notiz löschen → Weg, ohne Fehler

## 5. Command-Palette (Strg+K) ⭐ NEU
- [ ] Wort aus einer Notiz suchen → Gruppe „Notizen – Volltextsuche" mit Snippet
- [ ] Enter → Notes öffnet mit genau dieser Notiz
- [ ] „Neue Notiz"-Schnellaktion → legt an und öffnet Notes
- [ ] Dark/Light-Umschalter + Pomodoro-Start aus der Palette
- [ ] CLI-Befehl kopieren (Klick → Toast)
- [ ] Esc → Palette zu, beim nächsten Öffnen ist das Suchfeld leer

## 6. Aufgaben
- [ ] Task anlegen (Titel, Fälligkeit, Status)
- [ ] Status ändern (offen → erledigt), Filter/Sortierung
- [ ] Überfälligen Task anlegen → F5 → **eine** Notification, erneutes F5 → keine zweite

## 7. Kalender & Booking
- [ ] Termin anlegen/verschieben/löschen
- [ ] Ansichten (Woche/Monat) wechseln ohne Fehler

## 8. Pomodoro ⭐ NEU (Notifications)
- [ ] Timer starten (Fokusdauer testhalber auf 1 Min stellen) → beim 1. Start Notification-Berechtigung erteilen
- [ ] Phasenende → Toast UND Browser-Notification
- [ ] Tab im Hintergrund → Notification kommt trotzdem
- [ ] Pausieren, Zurücksetzen, Phase überspringen

## 9. Omni (KI-Assistent) ⭐ NEU
- [ ] Sidebar zeigt „Omni", Strg+K → „omni" findet „Omni öffnen"
- [ ] Neue Konversation → Begrüßung „Hi, ich bin Omni 👋"
- [ ] „Omni, hallo!" → er antwortet auf seinen Namen
- [ ] Normale Frage stellen → sinnvolle Antwort, Verlauf bleibt nach Reload

## 10. Projektmanagement
- [ ] Projekt anlegen, Aufgaben/Todos im Projekt verwalten
- [ ] Projektstatus/Fortschritt passt sich an

## 11. Befehlsbibliothek
- [ ] Eigenen Befehl anlegen (mit Parameter) → in Palette sichtbar, Abfrage kommt
- [ ] Befehl aus Starter-Bibliothek kopieren

## 12. Link-Manager
- [ ] Link speichern, Kategorie, öffnen, löschen

## 13. Uptime-Monitor
- [ ] Monitor anlegen (z. B. http://localhost:8787) → Prüfung läuft, Status grün/rot
- [ ] Verlauf wird angezeigt

## 14. Mail
- [ ] Mail-Verbindung/Entwurf-Ansicht öffnet ohne Fehler

## 15. Passwort-Manager & Kontakte
- [ ] Passwort-Eintrag anlegen/öffnen/kopieren (Master-Passwort-Flow)
- [ ] Kontakt anlegen/bearbeiten/löschen

## 16. Cloud-Monitoring
- [ ] Modul lädt, leere Daten werden sauber angezeigt (keine Fehler)

## 17. PWA & Abschluss
- [ ] Installierbar: Adressleiste → „App installieren" (oder über Chrome-Menü)
- [ ] Installierte App startet im eigenen Fenster
- [ ] Konsole: KEINE roten Fehler im gesamten Durchlauf

---

**Ergebnis:** ✔/✘ pro Punkt, Fehler mit Modul + Punkt notieren → danach Commits.
