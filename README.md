# Klassenmomente · Unser Weihnachtskalender

Eine eigenständige, responsive Adventskalender-App mit 24 austauschbaren Inhalten,
Lehrereditor, barrierearmem Modal, optionalem Schnee und optionaler, lokal erzeugter
Wintermelodie. Keine Abhängigkeiten, kein Build, kein Tracking.

## Online

- [Weihnachtskalender öffnen](https://jubitwo.github.io/klassenmomente-adventskalender/)
- [Lehrerbereich öffnen](https://jubitwo.github.io/klassenmomente-adventskalender/admin.html)
- [GitHub-Repository](https://github.com/Jubitwo/klassenmomente-adventskalender)

Die veröffentlichte Version enthält Beispielinhalte und den unten dokumentierten
Demo-Zugang. Änderungen im Lehrerbereich bleiben lokal, bis die exportierte
Kalenderdatei im Repository veröffentlicht wird. GitHub Pages veröffentlicht
den Stand des Branches `main` aus dem Wurzelverzeichnis.

## Starten

Den Ordner über einen statischen Webserver öffnen, nicht per Doppelklick auf eine
HTML-Datei: ES-Module und das Laden der JSON-Datei benötigen HTTP/HTTPS.

```sh
cd weihnachtskalender
python3 -m http.server 8080 --bind 127.0.0.1
```

Danach `http://localhost:8080` aufrufen. Auf GitHub Pages funktioniert die App direkt.
Aktuelle Browser mit ES-Modulen, `<dialog>` und Web Crypto werden benötigt.
Web Crypto benötigt HTTPS oder localhost.

## Dateien

| Datei | Aufgabe |
| --- | --- |
| `index.html`, `app.js` | Schüleransicht, Verfügbarkeit, eigener Lesefortschritt |
| `admin.html`, `admin.js` | Anmeldung, Editor, Testmodus, Import/Export |
| `style.css` | Responsives Winterdesign, Animationen, reduzierte Bewegung |
| `calendar-data.json` | Zentrale, veröffentlichte Standarddaten; alle 24 Beispielinhalte |
| `storage.js` | Validierung und austauschbare, asynchrone Datenzugriffsschicht |
| `ui.js` | Gemeinsame Inhaltsanzeige, Modal und optionale Atmosphäre |
| `auth.js`, `auth-config.js` | PBKDF2-Passwortprüfung und zeitlich begrenzter UI-Sitzungsmarker |
| `assets/` | Bereitgestelltes Schullogo und eigene SVG-Motive, ohne externe Bild- oder Schriftanbieter |

## Schullogo

Das bereitgestellte Logo des Walter-Knoll-Schulverbunds steht in
`assets/wks-logo.png` und erscheint als gemeinsamer Absender in der Kopfzeile
von Kalender und Lehrerbereich. Es verlinkt jeweils zum Kalender.
Für die Webdatei wurden nur transparente Außenränder entfernt; Farben,
Proportionen und Bildinhalt bleiben unverändert. Eine weiße Hintergrundfläche
sichert die Lesbarkeit der dunklen Schrift im Winterdesign. Auf kleinen
Bildschirmen steht die Kalenderbezeichnung unter dem Logo.
Das Schullogo bleibt ein bereitgestelltes Markenbild; daraus ergibt sich keine
allgemeine Erlaubnis zur Weiterverwendung außerhalb dieses Schulkalenders.

## Lehrkraft: Inhalte bearbeiten

1. `admin.html` öffnen. **Demo-Passwort: `winterzauber-2026`**.
2. Für den eigenen Klasseneinsatz Demo-Passwort ändern; Hinweise unten beachten.
3. Kalenderjahr einstellen und speichern. Voreinstellung: **2026**.
4. Ein Türchen auswählen, Titel und Inhalte bearbeiten, dann speichern.
5. Bild per URL oder Datei (PNG/JPEG/WebP/GIF, maximal 1 MB) hinzufügen.
   Eine aussagekräftige Bildbeschreibung ergänzen. Mehrere große Bilder können
   die browserabhängige localStorage-Grenze erreichen; dann Bilddateien in
   `assets/` veröffentlichen und deren HTTPS-URLs verwenden.
6. Verfügbarkeit wählen: automatisch ab Datum, sofort freigegeben oder gesperrt.
   Eine Sperre hat Vorrang vor dem Datum.
7. „Vorschau-/Testmodus“ aktivieren und „Vorschau“ anklicken. Das zeigt auch
   ungespeicherte Inhalte an. Der Modus wirkt ausschließlich im Lehrerbereich,
   wird nicht exportiert und schaltet nicht den Schülerkalender frei.
8. „Alle Daten exportieren“ liefert `calendar-data.json`. Import überschreibt
   nach Bestätigung alle lokalen Inhalte; ungültige Daten werden abgewiesen.
9. „Zurücksetzen“ lädt den aktuell veröffentlichten Standardinhalt, nicht
   zwingend die ursprünglichen Beispiele. Vorher gegebenenfalls exportieren.

Text ist bewusst reiner Text, kein HTML/Markdown. Zeilenumbrüche bleiben erhalten.
Quiz und Rätsel können Aufgaben mit aufklappbarer Lösung sein; es gibt keine
automatische Bewertung oder Speicherung personenbezogener Antworten.
Links öffnen in einem neuen Tab. YouTube/Vimeo und MP4/WebM werden erst nach
einem ausdrücklichen Klick geladen; andere Video-URLs öffnen extern.
Externe Bilder werden beim Öffnen des Türchens geladen und können dabei die
IP-Adresse an den Bildanbieter übertragen. Für den Schuleinsatz bevorzugt
eigene, rechtmäßig verwendete Medien im Repository nutzen. Externe Videoanbieter
können Videos entfernen oder Einbettung blockieren; ihre Verfügbarkeit ist
nicht Teil der lokalen App.

## Was wird wo gespeichert?

**localStorage ist keine zentrale Datenbank.**

- Kalenderänderungen bleiben im Browserprofil auf derselben Website.
- Geöffnete Schüler- und Lehrertabs desselben Browsers synchronisieren
  gespeicherte Kalenderänderungen sofort über das `storage`-Ereignis.
- Andere Geräte bekommen Änderungen erst nach Veröffentlichung der exportierten
  Standarddatei. Export allein veröffentlicht noch nichts.
- Jeder Schüler zählt seine selbst angesehenen Türchen lokal. „Geöffnet“ in
  der Fortschrittsanzeige bedeutet **angesehen**, nicht lediglich freigegeben.
- Fortschritt gehört zum Kalenderjahr. Ein neues Jahr beginnt bei null.
- Lokale Editor-Daten haben Vorrang vor veröffentlichten Daten. Auf einem
  Bearbeitungsgerät kann deshalb ein alter lokaler Stand sichtbar bleiben:
  exportieren und dann zurücksetzen, um den veröffentlichten Stand zu laden.
- Private Browserfenster, Browserbereinigung oder ein anderes Profil können
  lokale Daten verlieren. Regelmäßig exportieren.
- Speicherfehler werden angezeigt; es wird kein erfolgreiches Speichern vorgetäuscht.

## Datum

Automatische Freigabe ab **00:00 Uhr des jeweiligen Tages im Dezember des
eingestellten Jahres**, in der lokalen Zeitzone des Geräts. Vergangene Türchen
bleiben auch nach Jahresende verfügbar. Vor Dezember sind nur explizit
freigegebene Türchen verfügbar. Ein auf 2026 eingestellter Kalender bleibt 2027
geöffnet, bis die Lehrkraft bewusst ein neues Jahr einstellt.

Die Darstellung wird minütlich und beim Zurückkehren zum Tab aktualisiert.
Beim Klick wird die Verfügbarkeit erneut geprüft. Die Geräteuhr ist manipulierbar;
zuverlässige Freigaben benötigen einen Server.

## Admin-Passwort ändern

Im angemeldeten Lehrerbereich „Admin-Passwort ändern“ öffnen, bisheriges Passwort
und zweimal ein neues Passwort (mindestens 12 Zeichen) eingeben.

- Es wird ein zufälliges 128-Bit-Salt erzeugt.
- PBKDF2-HMAC-SHA-256 mit 210.000 Iterationen berechnet einen 256-Bit-Prüfwert.
- Lokal wird die neue Konfiguration gespeichert, die Sitzung beendet und
  `auth-config.js` heruntergeladen.
- **Für andere Geräte diese Datei im Repository ersetzen und veröffentlichen.**
  Nur lokal ändern reicht nicht.
- Bestehende lokale Passwortkonfigurationen haben Vorrang. Bei Passwortverlust
  gezielt den localStorage-Schlüssel `klassenmomente.auth.v1` über die
  Entwicklerwerkzeuge entfernen; dann gilt wieder die veröffentlichte Konfiguration.
- Das Demo-Passwort aus dieser Dokumentation entfernen, wenn ihr die Anleitung
  mit veröffentlicht. Das Entfernen macht den Zugriff jedoch nicht sicher.

## Auf GitHub Pages veröffentlichen

1. Ein Repository anlegen und **den Inhalt dieses Ordners** hochladen, sodass
   `index.html` im Wurzelverzeichnis liegt. Alternativ einen `docs/`-Ordner verwenden.
2. Unter **Settings → Pages → Build and deployment** „Deploy from a branch“
   wählen, Branch und `/ (root)` beziehungsweise `/docs` auswählen, speichern.
3. Nach dem Deployment die dort angezeigte HTTPS-Adresse öffnen.
   Relative Pfade funktionieren auch unter `https://name.github.io/repository/`.
4. Nur den Kalenderlink an die Klasse weitergeben. Kein Adminzugang erforderlich.
5. Neue Inhalte: lokal speichern → exportieren → die veröffentlichte
   `calendar-data.json` ersetzen → committen/hochladen → Deployment abwarten.
6. Mit einem anderen Browserprofil oder Gerät den veröffentlichten Stand prüfen.
   Cache oder ein noch offener Tab können ein Neuladen erforderlich machen.

Nicht versehentlich Inhalte veröffentlichen, für die keine Nutzungsrechte vorliegen.
Keine personenbezogenen Schülerdaten, vertraulichen Aufgaben oder Geheimnisse ablegen.

## Sicherheitsgrenzen

**Der clientseitige Passwortschutz ist kein echter Zugriffsschutz.**
JavaScript, Passwort-Prüfwert und sämtliche veröffentlichten Kalenderdaten sind
öffentlich lesbar. Technisch versierte Personen können die UI-Sperre umgehen,
den Sitzungsmarker setzen, ihre lokalen Daten ändern, das Datum manipulieren
oder die JSON-Datei direkt lesen – auch Inhalte zukünftiger Türchen.

PBKDF2 vermeidet ein Klartextpasswort in den Anwendungsdateien und verteuert
Passwortraten, verhindert aber keine Umgehung des clientseitigen Codes.
Der einstündige Sitzungsmarker ist Komfort, kein Authentifizierungstoken.
Die App besitzt keine Schreibrechte für euer GitHub-Repository; Besucher können
die zentral veröffentlichte Datei über diese App nicht verändern.
Inhalte werden mit `textContent` ausgegeben; nur feste eigene SVG-Vorlagen
verwenden `innerHTML`. Importdateien werden strikt auf Schema, Größen und URLs
geprüft. `javascript:` und HTML/SVG-Daten-URLs sind nicht erlaubt.

## Später zentrale Speicherung ergänzen

`CalendarStorage` kapselt die Datenzugriffe:

```js
loadCalendar()
saveCalendar(calendar)
getDoor(day)
saveDoor(day, data)
resetCalendar()
exportCalendar()
importCalendar(jsonText)
```

Alle Methoden sind asynchron. Die UI kann damit später ohne grundsätzliches
Redesign eine API, Firebase oder Supabase verwenden:

1. Authentifizierung durch den Anbieter/Server ersetzen, keine geheimen API-
   Schlüssel in Frontend-Dateien hinterlegen.
2. Lese-/Schreibrechte serverseitig festlegen, z. B. Supabase RLS oder Firebase
   Security Rules: Schülerinnen und Schüler dürfen lesen, nur Lehrkräfte schreiben.
3. Für wirklich geheime zukünftige Inhalte nur freigegebene Türchen ausliefern;
   Freigabe mit Serverzeit prüfen, statt die gesamte JSON-Datei bereitzustellen.
4. `CalendarStorage` mit Netzwerkzugriffen implementieren; vorhandene
   Schema-Validierung zusätzlich serverseitig nutzen.
5. Änderungen über Realtime-Abos oder gezielte Aktualisierung synchronisieren
   und anschließend `calendar-updated` auslösen. Den aktuellen lokalen
   Synchronisierungsmechanismus dadurch ergänzen.
6. Konflikterkennung, z. B. Versionsnummern/ETags, Sicherungen und verständliche
   Netzwerkfehler einbauen. Lesefortschritt kann weiterhin anonym lokal bleiben.

## Prüfen

Der zusätzliche Test läuft ohne Installation mit einem aktuellen Node.js:

```sh
node tests/storage.test.mjs
```

Browser-Prüfung: 24 Türchen, vor Dezember verschlossen, Adminanmeldung,
Vorschau, Speichern mit zweitem Schülertab, Import/Export, mobile Darstellung,
Tastaturbedienung und Modal schließen. Musik startet niemals automatisch.
