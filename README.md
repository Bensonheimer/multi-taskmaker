# Multi TaskMaker – iPhone Web-App

Dies ist eine eigenständige, mobile Web-App mit dunkelblau-lila Design.

## Enthaltene Funktionen
- Quick Tools: Roblox/Minecraft-Webseiten öffnen und eigene HTTP(S)-Schnellzugriffe speichern
- Gaming Tools: Roblox- und Minecraft-Notizen lokal speichern
- Multi Timer: mehrere Timer hinzufügen, starten, pausieren, zurücksetzen und löschen
- Automation Center: unterstützte Schnellaktionen und eigene Ablauf-Notizen
- Design Studio: Akzentfarben und kompakte Darstellung
- Favoriten: Bereiche hinzufügen und entfernen
- Einstellungen: JSON-Export und Zurücksetzen lokaler Daten
- Web-App-Manifest, Icon und Service Worker für Offline-Caching nach erstmaligem Laden

## Wichtige technische Grenzen
Eine Web-App auf iOS kann nicht beliebige andere Apps steuern, keine Touch-Eingaben in Roblox simulieren und keine Systemaktionen ohne ausdrückliche iOS-Unterstützung ausführen. Timer können im Hintergrund durch iOS eingeschränkt werden. Diese App ist kein nativer iOS-App-Store-Build.

## Lokal testen
`index.html` in einem modernen Browser öffnen. Lokale Speicherung hängt von den Browserregeln für lokale Dateien ab. Für zuverlässige Speicherung und Offline-Caching muss die App über HTTPS oder einen lokalen Webserver laufen.

## Auf dem iPhone installieren
1. Veröffentliche den gesamten Inhalt dieses Ordners auf einem HTTPS-Webhost.
2. Öffne die HTTPS-Adresse in Safari auf dem iPhone.
3. Tippe auf Teilen und dann auf „Zum Home-Bildschirm“.
4. Starte Multi TaskMaker über das neue Icon.

Die Veröffentlichung wird von dieser ZIP-Datei nicht automatisch erledigt. Der Service Worker funktioniert nur über HTTPS (oder localhost).

## Datenschutz
Die App sendet ihre Notizen, Favoriten und Timer nicht an einen Server. Sie speichert diese Daten in `localStorage` des Browsers. Ein selbst hinzugefügter Link kann beim Öffnen natürlich eine externe Website aufrufen. Google Fonts ist nur für optionale Schriftgestaltung eingebunden; bei Offline-Nutzung wird eine Systemschrift verwendet.
