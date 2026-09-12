import type { CommandInput } from './api'

/**
 * Umfangreiche IT-, DevOps-, SysAdmin- & Security-Befehlsbibliothek (über 160 kuratierte Befehle).
 * Speziell abgestimmt auf Linux/Ubuntu, Windows & PowerShell, Active Directory,
 * Git-Workflows, Docker & Compose, Kubernetes, Datenbanken, IT-Security/SSL und Netzwerk.
 */
export const STARTER_COMMANDS: CommandInput[] = [
  // =========================================================================
  // 🐧 LINUX & UBUNTU SERVER (Systemd, Logs, Performance, Rechte, Files)
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
    title: 'Schneller Dateiabgleich über SSH (Rsync mit Fortschritt & Kompression)',
    command: 'rsync -avzP -e ssh {{LOKALER_PFAD}} {{USER}}@{{HOST}}:{{REMOTE_PFAD}}',
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
  {
    category: 'Linux & Ubuntu Server',
    title: 'Prozesse nach CPU-Auslastung absteigend filtern (Top 10)',
    command: 'ps aux --sort=-%cpu | head -11',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Prozesse nach RAM-Auslastung absteigend filtern (Top 10)',
    command: 'ps aux --sort=-%mem | head -11',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Prozess anhand des Namens sauber beenden (pkill)',
    command: 'sudo pkill -f {{PROZESS_NAME}}',
  },
  {
    category: 'Linux & Ubuntu Server',
    title: 'Systemzeit mit NTP-Server synchronisieren',
    command: 'sudo timedatectl set-ntp true && timedatectl status',
  },

  // =========================================================================
  // 🪟 WINDOWS TERMINAL & POWERSHELL
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
    title: 'Aktive TCP-Verbindungen mit zugehöriger PID und Status',
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
    title: 'Netzwerk-Port auf Zielhost testen (Ping/Portcheck PowerShell)',
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
    title: 'Robocopy: Verzeichnisse spiegeln mit Wiederaufnahme & Multithreading',
    command: 'robocopy "{{QUELLE}}" "{{ZIEL}}" /MIR /R:2 /W:5 /MT:16 /LOG:"C:\\robocopy.log"',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Winget: Alle installierten Programme auflisten und aktualisieren',
    command: 'winget upgrade --all --include-unknown',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'BitLocker-Verschlüsselungsstatus aller Laufwerke prüfen',
    command: 'manage-bde -status',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Hardware-Informationen zu CPU, RAM und Mainboard abrufen',
    command: 'Get-CimInstance Win32_ComputerSystem; Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Firewall-Regel zum Öffnen eines eingehenden Ports hinzufügen',
    command: 'New-NetFirewallRule -DisplayName "{{REGEL_NAME}}" -Direction Inbound -LocalPort {{PORT}} -Protocol TCP -Action Allow',
  },
  {
    category: 'Windows Terminal & PowerShell',
    title: 'Öffentliche IP-Adresse über PowerShell abrufen',
    command: '(Invoke-WebRequest ifconfig.me/ip).Content.Trim()',
  },

  // =========================================================================
  // 🏢 ACTIVE DIRECTORY & WINDOWS SERVER
  // =========================================================================
  {
    category: 'Active Directory & Windows Server',
    title: 'Gruppenrichtlinien sofort erzwingen und aktualisieren',
    command: 'gpupdate /force',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'Angewendete Gruppenrichtlinien des angemeldeten Benutzers analysieren',
    command: 'gpresult /r',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'Eigene Kerberos-Rechte und Gruppenmitgliedschaften anzeigen',
    command: 'whoami /all',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'Domänenbenutzer-Konto auf Details und Sperrstatus prüfen',
    command: 'net user {{BENUTZERNAME}} /domain',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'Gesperrtes Active Directory Benutzerkonto entsperren (PowerShell)',
    command: 'Unlock-ADAccount -Identity "{{BENUTZERNAME}}"',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'AD-Benutzer nach Name suchen und Status anzeigen (PowerShell)',
    command: 'Get-ADUser -Filter "Name -like \'*{{NAME}}*\'" -Properties Enabled, LastLogonDate, mail | Select-Object Name, SamAccountName, Enabled, mail',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'Alle Mitglieder einer Active Directory Gruppe auflisten',
    command: 'Get-ADGroupMember -Identity "{{GRUPPENNAME}}" | Select-Object Name, SamAccountName',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'Domänencontroller-Diagnose durchführen (DCDiag)',
    command: 'dcdiag /v /c /d /e',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'Active Directory Replikationsstatus zwischen Domain Controllern prüfen',
    command: 'repadmin /showrepl * /csv > C:\\repl_status.csv',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'Sichere Verbindung zum Domänencontroller testen (Netlogon)',
    command: 'nltest /sc_query:{{DOMAIN_NAME}}',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'PDC-Emulator und FSMO-Rolleninhaber ermitteln',
    command: 'netdom query fsmo',
  },
  {
    category: 'Active Directory & Windows Server',
    title: 'DNS-Server-Dienst auf Domain Controller neu starten',
    command: 'Restart-Service -Name DNS -Force',
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
    command: 'git log --oneline --graph --decorate --all -n 25',
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
    command: 'git reflog -n 30',
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
  {
    category: 'Git Versionsverwaltung',
    title: 'Ungestagte Änderungen und nicht getrackte Dateien verwerfen (Clean)',
    command: 'git clean -fd',
  },
  {
    category: 'Git Versionsverwaltung',
    title: 'Unterschiede zum Hauptzweig (main) übersichtlich anzeigen',
    command: 'git diff main...HEAD',
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
    title: 'Interaktive Bash/Sh-Shell in einem laufenden Container öffnen',
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
    title: 'Docker Compose Stack neu bauen und ohne Cache starten',
    command: 'docker compose up -d --build --force-recreate',
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
  {
    category: 'Docker & Container',
    title: 'IP-Adresse eines laufenden Containers ermitteln',
    command: 'docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" {{CONTAINER_NAME}}',
  },
  {
    category: 'Docker & Container',
    title: 'Dateien aus einem Container auf den Host kopieren',
    command: 'docker cp {{CONTAINER_NAME}}:{{CONTAINER_PFAD}} {{HOST_PFAD}}',
  },
  {
    category: 'Docker & Container',
    title: 'Docker Volume-Speicherplatz anzeigen',
    command: 'docker system df -v',
  },
  {
    category: 'Docker & Container',
    title: 'Image bauen mit Tag aus dem aktuellen Verzeichnis',
    command: 'docker build -t {{IMAGE_NAME}}:{{TAG}} .',
  },

  // =========================================================================
  // ☸️ KUBERNETES & CLOUD-NATIVE
  // =========================================================================
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Alle Pods im aktuellen Namespace mit Status und Node auflisten',
    command: 'kubectl get pods -o wide',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Pods über alle Namespaces hinweg anzeigen',
    command: 'kubectl get pods -A',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Live-Logs eines Pods mit Zeitstempel mitverfolgen',
    command: 'kubectl logs -f --tail=100 --timestamps {{POD_NAME}} -n {{NAMESPACE}}',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Interaktive Shell in einem Pod ausführen',
    command: 'kubectl exec -it {{POD_NAME}} -n {{NAMESPACE}} -- /bin/sh',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Detaillierte Pod-Diagnose & Event-Historie einsehen (Describe)',
    command: 'kubectl describe pod {{POD_NAME}} -n {{NAMESPACE}}',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Port-Forwarding von lokalem Port auf Service/Pod einrichten',
    command: 'kubectl port-forward svc/{{SERVICE_NAME}} {{LOKALER_PORT}}:{{SERVICE_PORT}} -n {{NAMESPACE}}',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Rolling Restart eines Deployments durchführen',
    command: 'kubectl rollout restart deployment/{{DEPLOYMENT_NAME}} -n {{NAMESPACE}}',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Rollout-Status eines Deployments überwachen',
    command: 'kubectl rollout status deployment/{{DEPLOYMENT_NAME}} -n {{NAMESPACE}}',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Base64-kodierten Wert eines Kubernetes Secrets entschlüsseln',
    command: 'kubectl get secret {{SECRET_NAME}} -n {{NAMESPACE}} -o jsonpath="{.data.{{KEY}}}" | base64 --decode',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'CPU- und RAM-Auslastung aller Nodes anzeigen (Metrics Server)',
    command: 'kubectl top nodes',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'CPU- und RAM-Auslastung aller Pods anzeigen',
    command: 'kubectl top pods -n {{NAMESPACE}} --sort-by=memory',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Aktiven Kubernetes Kontext wechseln (Cluster wechseln)',
    command: 'kubectl config use-context {{KONTEXT_NAME}}',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Standard-Namespace für den aktuellen Kontext setzen',
    command: 'kubectl config set-context --current --namespace={{NAMESPACE}}',
  },
  {
    category: 'Kubernetes & Cloud-Native',
    title: 'Ingress-Routen und Hostnamen anzeigen',
    command: 'kubectl get ingress -A',
  },

  // =========================================================================
  // 🐘 DATENBANKEN & CACHES (PostgreSQL, MySQL, Redis)
  // =========================================================================
  {
    category: 'Datenbanken & Caches',
    title: 'PostgreSQL: Vollständigen Dump einer Datenbank erstellen (pg_dump)',
    command: 'pg_dump -U {{USER}} -h {{HOST}} -d {{DB_NAME}} -F c -b -v -f "{{DB_NAME}}_backup.dump"',
  },
  {
    category: 'Datenbanken & Caches',
    title: 'PostgreSQL: Dump in Ziel-Datenbank wiederherstellen (pg_restore)',
    command: 'pg_restore -U {{USER}} -h {{HOST}} -d {{DB_NAME}} -v "{{DB_NAME}}_backup.dump"',
  },
  {
    category: 'Datenbanken & Caches',
    title: 'PostgreSQL: Aktive Datenbankverbindungen und laufende Abfragen prüfen',
    command: 'psql -U {{USER}} -d {{DB_NAME}} -c "SELECT pid, usename, client_addr, state, query FROM pg_stat_activity WHERE state != \'idle\';"',
  },
  {
    category: 'Datenbanken & Caches',
    title: 'PostgreSQL: Datenbankgrößen aller Datenbanken abfragen',
    command: 'psql -U {{USER}} -c "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database ORDER BY pg_database_size(datname) DESC;"',
  },
  {
    category: 'Datenbanken & Caches',
    title: 'MySQL / MariaDB: Dump einer Datenbank mit Struktur & Daten (mysqldump)',
    command: 'mysqldump -u {{USER}} -p -h {{HOST}} {{DB_NAME}} > "{{DB_NAME}}_backup.sql"',
  },
  {
    category: 'Datenbanken & Caches',
    title: 'MySQL / MariaDB: SQL-Dump-Datei importieren',
    command: 'mysql -u {{USER}} -p -h {{HOST}} {{DB_NAME}} < "{{DUMP_DATEI}}.sql"',
  },
  {
    category: 'Datenbanken & Caches',
    title: 'MySQL: Laufende Threads und langsame Abfragen anzeigen',
    command: 'mysqladmin -u {{USER}} -p processlist',
  },
  {
    category: 'Datenbanken & Caches',
    title: 'Redis: Alle Befehle live in Echtzeit mitlesen (Monitor)',
    command: 'redis-cli -h {{HOST}} -p {{PORT}} monitor',
  },
  {
    category: 'Datenbanken & Caches',
    title: 'Redis: Speicherverbrauch und Server-Statistiken abrufen',
    command: 'redis-cli -h {{HOST}} -p {{PORT}} info memory',
  },
  {
    category: 'Datenbanken & Caches',
    title: 'Redis: Verbindung testen (Ping -> Pong)',
    command: 'redis-cli -h {{HOST}} -p {{PORT}} ping',
  },

  // =========================================================================
  // 🛡️ IT-SICHERHEIT, SSL & AUDITING
  // =========================================================================
  {
    category: 'IT-Sicherheit, SSL & Auditing',
    title: 'SSL/TLS-Zertifikat einer Remote-Domain und Ablaufdatum prüfen (OpenSSL)',
    command: 'openssl s_client -connect {{DOMAIN}}:443 -servername {{DOMAIN}} 2>/dev/null | openssl x509 -noout -dates -subject -issuer',
  },
  {
    category: 'IT-Sicherheit, SSL & Auditing',
    title: 'Lokale Zertifikatsdatei auf Gültigkeit und Inhalte untersuchen',
    command: 'openssl x509 -in {{ZERTIFIKAT_DATEI}}.crt -text -noout',
  },
  {
    category: 'IT-Sicherheit, SSL & Auditing',
    title: 'SHA-256 Fingerabdruck eines Zertifikats oder Public Keys berechnen',
    command: 'openssl x509 -in {{ZERTIFIKAT_DATEI}}.crt -noout -fingerprint -sha256',
  },
  {
    category: 'IT-Sicherheit, SSL & Auditing',
    title: 'CSR (Certificate Signing Request) dekodieren und prüfen',
    command: 'openssl req -in {{CSR_DATEI}}.csr -noout -text',
  },
  {
    category: 'IT-Sicherheit, SSL & Auditing',
    title: 'Neues modernes SSH-Schlüsselpaar generieren (Ed25519)',
    command: 'ssh-keygen -t ed25519 -C "{{EMAIL}}"',
  },
  {
    category: 'IT-Sicherheit, SSL & Auditing',
    title: 'Nmap: Schneller SYN-Scan auf offene Ports eines Zielhosts',
    command: 'sudo nmap -sS -T4 -p 1-65535 {{ZIEL_IP}}',
  },
  {
    category: 'IT-Sicherheit, SSL & Auditing',
    title: 'Nmap: Betriebssystem- und Versions-Erkennung durchführen',
    command: 'sudo nmap -sV -O -T4 {{ZIEL_IP}}',
  },
  {
    category: 'IT-Sicherheit, SSL & Auditing',
    title: 'Fail2ban Status und gebannte IP-Adressen anzeigen',
    command: 'sudo fail2ban-client status sshd',
  },
  {
    category: 'IT-Sicherheit, SSL & Auditing',
    title: 'IP-Adresse aus Fail2ban-Sperrliste manuell freigeben',
    command: 'sudo fail2ban-client set sshd unbanip {{IP_ADRESSE}}',
  },
  {
    category: 'IT-Sicherheit, SSL & Auditing',
    title: 'Sudo-Berechtigungen des aktuellen Benutzers überprüfen',
    command: 'sudo -l',
  },

  // =========================================================================
  // 🌐 NETZWERK & DEEP TROUBLESHOOTING
  // =========================================================================
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'Detaillierte DNS-Auflösung mit allen Nameservern verfolgen (Dig Trace)',
    command: 'dig +trace {{DOMAIN}}',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'DNS-Abfrage mit allen Records (A, MX, TXT, NS) durchführen',
    command: 'nslookup -type=any {{DOMAIN}}',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'Netzwerkroute zu einem Zielserver schrittweise verfolgen (Traceroute)',
    command: 'tracert {{ZIEL_HOST_ODER_IP}}',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'MTR: Interaktives kontinuierliches Traceroute mit Paketverlustrate',
    command: 'mtr --report --report-cycles 10 {{ZIEL_HOST_ODER_IP}}',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'Curl: Exakte Latenz-Aufschlüsselung (DNS, Connect, TLS, TTFB)',
    command: 'curl -w "DNS: %{time_namelookup}s | Connect: %{time_connect}s | TLS: %{time_appconnect}s | TTFB: %{time_starttransfer}s | Total: %{time_total}s\\n" -o /dev/null -s {{URL}}',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'Paketmitschnitt auf einem Interface für einen Port aufzeichnen (Tcpdump)',
    command: 'sudo tcpdump -i {{INTERFACE}} -nn -s0 -v port {{PORT}} -w capture.pcap',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'ARP-Tabelle des lokalen Systems anzeigen',
    command: 'arp -a',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'Cisco IOS: Interface-Status und IP-Adressen im kompakten Überblick',
    command: 'show ip interface brief',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'Cisco IOS: Aktuell aktive Konfiguration im RAM anzeigen',
    command: 'show running-config',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'Cisco IOS: Laufende Konfiguration im NVRAM persistent speichern',
    command: 'copy running-config startup-config',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'Cisco IOS: Routing-Tabelle mit allen Routen anzeigen',
    command: 'show ip route',
  },
  {
    category: 'Netzwerk & Deep Troubleshooting',
    title: 'Cisco IOS: VLAN-Übersicht und zugewiesene Switchports abfragen',
    command: 'show vlan brief',
  },
]
