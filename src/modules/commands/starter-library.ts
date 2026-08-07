import type { CommandInput } from './api'

/** Kuratiertes Starter-Set für den FiSi-Alltag – per Klick importierbar. */
export const STARTER_COMMANDS: CommandInput[] = [
  // Linux
  { category: 'Linux', title: 'Offene Ports mit Prozessen anzeigen', command: 'ss -tulpn' },
  { category: 'Linux', title: 'Speicherplatz aller Dateisysteme', command: 'df -h' },
  { category: 'Linux', title: 'Größte Verzeichnisse finden', command: 'du -h --max-depth=1 / 2>/dev/null | sort -hr | head -20' },
  { category: 'Linux', title: 'Systemlog live verfolgen', command: 'journalctl -f' },
  { category: 'Linux', title: 'Fehlgeschlagene SSH-Logins zeigen', command: "journalctl -u ssh | grep 'Failed password'" },
  // PowerShell
  { category: 'PowerShell', title: 'Windows-Dienste mit Status', command: 'Get-Service | Sort-Object Status | Format-Table -AutoSize' },
  { category: 'PowerShell', title: 'Top-10 Prozesse nach RAM', command: 'Get-Process | Sort-Object WS -Descending | Select-Object -First 10 Name, @{n="RAM(MB)";e={[math]::Round($_.WS/1MB)}}' },
  { category: 'PowerShell', title: 'Netzwerkkonfiguration aller Adapter', command: 'Get-NetIPConfiguration' },
  { category: 'PowerShell', title: 'Installierte Updates der letzten 30 Tage', command: 'Get-HotFix | Where-Object InstalledOn -gt (Get-Date).AddDays(-30)' },
  // Netzwerk
  { category: 'Netzwerk', title: 'Route zu einem Host verfolgen', command: 'tracert 8.8.8.8' },
  { category: 'Netzwerk', title: 'DNS-Eintrag abfragen (A + MX)', command: 'nslookup -type=any example.com' },
  { category: 'Netzwerk', title: 'DNS-Cache leeren (Windows)', command: 'ipconfig /flushdns' },
  // Cisco
  { category: 'Cisco', title: 'Interface-Status im Überblick', command: 'show ip interface brief' },
  { category: 'Cisco', title: 'Laufende Konfiguration anzeigen', command: 'show running-config' },
  { category: 'Cisco', title: 'Konfiguration speichern', command: 'copy running-config startup-config' },
  // Docker
  { category: 'Docker', title: 'Laufende Container mit Ports', command: 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"' },
  { category: 'Docker', title: 'Ungenutzte Images/Container aufräumen', command: 'docker system prune -af' },
  { category: 'Docker', title: 'Logs eines Containers verfolgen', command: 'docker logs -f --tail 100 <container>' },
]
