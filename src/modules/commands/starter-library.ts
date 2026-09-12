import type { CommandInput } from './api'

/**
 * Umfangreiche IT- & DevOps-Befehlsbibliothek (über 80 kuratierte Befehle).
 * Speziell abgestimmt auf Windows (CMD & PowerShell), Git-Workflows,
 * Ubuntu / Linux Server-Administration, Netzwerk / Cisco und Docker.
 */
export const STARTER_COMMANDS: CommandInput[] = [
  // =========================================================================
  // 🐧 LINUX & UBUNTU SERVER (Server-Betrieb, Systemd, Logs, Rechte, Netzwerk)
  // =========================================================================
  {
    category: 'Linux & Ubuntu Server',
    title: 'Paketquellen aktualisieren & alle Upgrades installieren',
    command: 'sudo apt update && sudo apt upgrade -y',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Nicht mehr benötigte Abhängigkeiten und alte Kernel bereinigen',
    command: 'sudo apt autoremove --purge -y && sudo apt clean',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Systemd Dienst-Status prüfen (z. B. nginx, ssh, docker)',
    command: 'sudo systemctl status {{DIENSTNAME}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Systemd Dienst neu starten',
    command: 'sudo systemctl restart {{DIENSTNAME}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Systemd Dienst für automatischen Systemstart aktivieren und sofort starten',
    command: 'sudo systemctl enable --now {{DIENSTNAME}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Dienst-Logs in Echtzeit live mitverfolgen (Journalctl Follow)',
    command: 'sudo journalctl -u {{DIENSTNAME}} -f',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'System-Fehlerlogs der aktuellen Boot-Sitzung anzeigen',
    command: 'sudo journalctl -p 3 -xb',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Fehlgeschlagene SSH-Loginversuche live überwachen (Brute-Force Monitor)',
    command: "sudo journalctl -u ssh -f | grep 'Failed password'",
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Alle lauschenden TCP/UDP-Ports mit zugehörigen Prozessen auflisten',
    command: 'sudo ss -tulpn',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Welcher Prozess belegt einen bestimmten Port? (lsof)',
    command: 'sudo lsof -i :{{PORT}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'UFW Firewall Status mit Port-Regeln anzeigen',
    command: 'sudo ufw status verbose',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Port in der UFW Firewall freigeben (z. B. 22/tcp, 443/tcp)',
    command: 'sudo ufw allow {{PORT_PROTOKOLL}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Speicherplatz aller gemounteten Dateisysteme human-readable anzeigen',
    command: 'df -h -T',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Top 15 speicherhungrigste Verzeichnisse im Root finden',
    command: 'sudo du -h --max-depth=1 / 2>/dev/null | sort -hr | head -15',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Dateien größer als 100 MB im gesamten System aufspüren',
    command: 'sudo find / -type f -size +100M -exec ls -lh {} + 2>/dev/null | awk \'{ print $9 ": " $5 }\'',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'RAM- und Swap-Auslastung übersichtlich darstellen',
    command: 'free -h',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Echtzeit-Systemmonitoring (CPU, RAM, Tasks)',
    command: 'htop',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Dateiberechtigungen rekursiv setzen (Standard Web: Verzeichnisse 755)',
    command: 'find {{PFAD}} -type d -exec chmod 755 {} +',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Dateiberechtigungen rekursiv setzen (Standard Web: Dateien 644)',
    command: 'find {{PFAD}} -type f -exec chmod 644 {} +',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Besitzer und Gruppe rekursiv ändern (z. B. www-data:www-data)',
    command: 'sudo chown -R {{USER}}:{{GROUP}} {{PFAD}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Tar-GZ Archiv erstellen mit Kompression',
    command: 'tar -czvf {{ARCHIV_NAME}}.tar.gz {{QUELL_VERZEICHNIS}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Tar-GZ Archiv entpacken',
    command: 'tar -xzvf {{ARCHIV_NAME}}.tar.gz -C {{ZIEL_VERZEICHNIS}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Schneller, robuster Dateiabgleich über SSH (Rsync mit Fortschritt)',
    command: 'rsync -avzP -e ssh {{LOKALER_PFAD}} {{USER}}@{{HOST}}:{{REMOTE_PFAD}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Neues modernes SSH-Schlüsselpaar generieren (Ed25519)',
    command: 'ssh-keygen -t ed25519 -C "{{EMAIL}}"',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'SSH Public Key auf entfernten Server übertragen (Passwortloser Login)',
    command: 'ssh-copy-id -i ~/.ssh/id_ed25519.pub {{USER}}@{{SERVER_IP}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'HTTP-Header und Statuscode einer URL abrufen (Curl)',
    command: 'curl -IL {{URL}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Cronjobs des aktuellen Benutzers bearbeiten',
    command: 'crontab -e',
  },

  // =========================================================================
  // 🪟 WINDOWS (CMD & POWERSHELL)
  // =========================================================================
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Detaillierte IP-Konfiguration aller Netzwerkadapter anzeigen',
    command: 'ipconfig /all',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'DNS-Auflösungscache leeren (DNS-Probleme beheben)',
    command: 'ipconfig /flushdns',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Aktive TCP-Verbindungen mit zugehöriger PID und Prozessname',
    command: 'netstat -ano | findstr LISTENING',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Systemdateien auf Beschädigungen prüfen und reparieren (SFC)',
    command: 'sfc /scannow',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Windows Komponenten-Image reparieren (DISM)',
    command: 'dism /online /cleanup-image /restorehealth',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Festplatte auf Dateisystemfehler untersuchen',
    command: 'chkdsk C: /f /r',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Prozesse nach RAM-Verbrauch absteigend auflisten (PowerShell)',
    command: 'Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 15 Name, Id, @{n="RAM (MB)";e={[math]::Round($_.WorkingSet64/1MB)}}',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Windows-Dienste nach Status sortiert anzeigen (PowerShell)',
    command: 'Get-Service | Sort-Object Status -Descending | Format-Table Name, DisplayName, Status -AutoSize',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Windows-Dienst neu starten (PowerShell)',
    command: 'Restart-Service -Name "{{DIENSTNAME}}" -Force',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Netzwerk-Port auf Zielhost testen (Ping/Portcheck)',
    command: 'Test-NetConnection -ComputerName {{HOST_ODER_IP}} -Port {{PORT}}',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Prozess erzwingend nach Prozessname beenden',
    command: 'taskkill /IM "{{PROZESS_NAME}}.exe" /F',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Prozess erzwingend nach PID beenden',
    command: 'taskkill /PID {{PID}} /F',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Letzte Windows-Updates der vergangenen 30 Tage anzeigen',
    command: 'Get-HotFix | Where-Object InstalledOn -gt (Get-Date).AddDays(-30) | Sort-Object InstalledOn -Descending',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'PowerShell Skript-Ausführungsrichtlinie auf RemoteSigned setzen',
    command: 'Set-ExecutionPolicy RemoteSigned -Scope CurrentUser',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Robocopy: Verzeichnisse spiegeln mit Wiederaufnahme & Berechtigung',
    command: 'robocopy "{{QUELLE}}" "{{ZIEL}}" /MIR /R:2 /W:5 /MT:16 /LOG:"C:\\robocopy.log"',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Lokale Benutzerkonten anzeigen',
    command: 'net user',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Öffentliche IP-Adresse über PowerShell abrufen',
    command: '(Invoke-WebRequest ifconfig.me/ip).Content.Trim()',
  },

  // =========================================================================
  // 🌿 GIT VERSIONSVERWALTUNG
  // =========================================================================
  {
    category: 'Git Versionsverwaltung',
    title: 'Arbeitsbereich-Status mit Branch und uncommitted Änderungen',
    command: 'git status -sb',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Kompaktes Commit-Log mit grafischer Verzweigung anzeigen',
    command: 'git log --oneline --graph --decorate --all -n 20',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Neuen Branch erstellen und sofort dorthin wechseln',
    command: 'git switch -c {{BRANCH_NAME}}',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Zu existierendem Branch wechseln',
    command: 'git switch {{BRANCH_NAME}}',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Alle Änderungen stagen und mit Nachricht committen',
    command: 'git add -A && git commit -m "{{COMMIT_NACHRICHT}}"',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Letzten Commit nachträglich anpassen (Nachricht oder Dateien ändern)',
    command: 'git commit --amend --no-edit',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Aktuellen Branch auf Remote veröffentlichen (Upstream setzen)',
    command: 'git push -u origin {{BRANCH_NAME}}',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Alle Branches und Tags vom Remote holen und gelöschte bereinigen',
    command: 'git fetch --all --prune',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Aktuellen Branch sauber per Rebase vom Remote aktualisieren',
    command: 'git pull --rebase origin {{BRANCH_NAME}}',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Ungespeicherte Änderungen temporär auf den Stash-Stapel legen',
    command: 'git stash push -m "{{BESCHREIBUNG}}"',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Zuletzt gestashte Änderungen wieder anwenden und vom Stapel löschen',
    command: 'git stash pop',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Letzten Commit rückgängig machen (Dateien bleiben geändert erhalten)',
    command: 'git reset --soft HEAD~1',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Hard Reset: Arbeitsbereich unwiderruflich auf Commit-Stand zurücksetzen',
    command: 'git reset --hard HEAD',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Einen bestimmten Commit aus einem anderen Branch übernehmen (Cherry-Pick)',
    command: 'git cherry-pick {{COMMIT_HASH}}',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Git Reflog: Sicherheitsnetz für verloren geglaubte Commits einsehen',
    command: 'git reflog -n 25',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Annotiertes Versions-Tag erstellen',
    command: 'git tag -a {{VERSION_TAG}} -m "{{TAG_NACHRICHT}}"',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Alle lokalen Tags zum Remote übertragen',
    command: 'git push origin --tags',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Bereits gemergte lokale Branches auf einen Schlag löschen',
    command: 'git branch --merged | grep -v "\\*" | xargs -n 1 git branch -d',
  },

  // =========================================================================
  // 🐳 DOCKER & CONTAINER OPS
  // =========================================================================
  {
    category: 'Docker & Container',
    title: 'Laufende Container mit Namen, Status und Port-Mappings auflisten',
    command: 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
  },
  {
    category: 'Docker & Container',
    title: 'Alle Container (auch gestoppte) übersichtlich anzeigen',
    command: 'docker ps -a',
  },
  {
    category: 'Docker & Container',
    title: 'Interaktive Shell in einem laufenden Container öffnen',
    command: 'docker exec -it {{CONTAINER_NAME}} /bin/sh',
  },
  {
    category: 'Docker & Container',
    title: 'Container-Logs live in Echtzeit verfolgen (letzte 100 Zeilen)',
    command: 'docker logs -f --tail 100 {{CONTAINER_NAME}}',
  },
  {
    category: 'Docker & Container',
    title: 'Docker Compose Stack im Hintergrund starten (Detached)',
    command: 'docker compose up -d',
  },
  {
    category: 'Docker & Container',
    title: 'Docker Compose Stack stoppen und Netzwerke abbauen',
    command: 'docker compose down',
  },
  {
    category: 'Docker & Container',
    title: 'Ungenutzte Images, Container, Netzwerke und Build-Caches bereinigen',
    command: 'docker system prune -af --volumes',
  },
  {
    category: 'Docker & Container',
    title: 'Ressourcenverbrauch aller laufenden Container live anzeigen (CPU/RAM)',
    command: 'docker stats --no-stream',
  },

  // =========================================================================
  // 🌐 NETZWERK & CISCO
  // =========================================================================
  {
    category: 'Netzwerk & Cisco',
    title: 'DNS-Abfrage mit allen Records (A, MX, TXT, NS) durchführen',
    command: 'nslookup -type=any {{DOMAIN}}',
  },
  {
    category: 'Netzwerk & Cisco',
    title: 'Detaillierte DNS-Auflösung mit Dig (Linux/macOS)',
    command: 'dig +trace {{DOMAIN}}',
  },
  {
    category: 'Netzwerk & Cisco',
    title: 'Netzwerkroute zu einem Zielserver schrittweise verfolgen (Traceroute)',
    command: 'tracert {{ZIEL_HOST_ODER_IP}}',
  },
  {
    category: 'Netzwerk & Cisco',
    title: 'Cisco IOS: Interface-Status und IP-Adressen im kompakten Überblick',
    command: 'show ip interface brief',
  },
  {
    category: 'Netzwerk & Cisco',
    title: 'Cisco IOS: Aktuell aktive Konfiguration im RAM anzeigen',
    command: 'show running-config',
  },
  {
    category: 'Cisco',
    title: 'Cisco IOS: Laufende Konfiguration im NVRAM persistent speichern',
    command: 'copy running-config startup-config',
  },
  {
    category: 'Netzwerk & Cisco',
    title: 'Cisco IOS: Routing-Tabelle mit allen Routen anzeigen',
    command: 'show ip route',
  },
  {
    category: 'Netzwerk & Cisco',
    title: 'Cisco IOS: VLAN-Übersicht und zugewiesene Switchports abfragen',
    command: 'show vlan brief',
  },
]
