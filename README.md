# WKSV · Unser Weihnachtskalender

Eine eigenständige, responsive Adventskalender-App mit 24 austauschbaren Inhalten,
Lehrereditor, barrierearmem Modal, optionalem Schnee und optionaler, lokal erzeugter
Wintermelodie. Keine Abhängigkeiten, kein Build, kein Tracking.

Die Hauptseite ist für die Schulgemeinschaft des **WKSV –
Walter Knoll Schulverbund (Realschule & Werkrealschule)** gestaltet. Schullogo,
Kopfzeile, Begrüßung, Browser-Titel und Abschlussgruß benennen den Schulverbund.
Das technische Repository behält seinen bisherigen Namen. Die Gestaltung
ändert keine lokal bearbeiteten oder bereits veröffentlichten Türcheninhalte.

## Online

- [Weihnachtskalender öffnen](https://jubitwo.github.io/klassenmomente-adventskalender/)
- [Lehrerbereich öffnen](https://jubitwo.github.io/klassenmomente-adventskalender/admin.html)
- [GitHub-Repository](https://github.com/Jubitwo/klassenmomente-adventskalender)

Die veröffentlichte Version enthält Beispielinhalte und den unten dokumentierten
Demo-Zugang. Änderungen im Lehrerbereich bleiben lokal, bis sie über die
GitHub-Verbindung veröffentlicht oder manuell exportiert und hochgeladen werden. GitHub Pages veröffentlicht
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
| `github.js` | Optionale direkte GitHub-Veröffentlichung, temporäres Token und Konfliktprüfung |
| `assets/` | Bereitgestelltes Schullogo und eigene SVG-Motive, ohne externe Bild- oder Schriftanbieter |

## Schullogo

Das bereitgestellte Logo des Walter Knoll Schulverbunds steht in
`assets/wks-logo.png` und erscheint als gemeinsamer Absender in der Kopfzeile
von Kalender und Lehrerbereich. Es verlinkt jeweils zum Kalender.
Für die Webdatei wurden nur transparente Außenränder entfernt; Farben,
Proportionen und Bildinhalt bleiben unverändert. Das Logo steht hervorgehoben
oben rechts auf einer milchig-transparenten, weichgezeichneten weißen Fläche mit 50 % Deckkraft,
die die Lesbarkeit der dunklen Schrift im Winterdesign sichert.
Kalenderbezeichnung und Bedienelemente stehen links; das Logo passt sich
auf kleinen Bildschirmen proportional an.
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

### Türchenanordnung mischen

In den Kalendereinstellungen „Türchen mischen“ anklicken. Die Übersicht darunter
zeigt die gespeicherte Reihenfolge für die Schüleransicht. Nur die Positionen
ändern sich: Nummer, Inhalt, Farbe, Freigabedatum und Lesefortschritt bleiben
beim jeweiligen Türchen. Der Lehrereditor bleibt zur Orientierung nach Tagen
sortiert. „Nach Datum sortieren“ stellt die Reihenfolge 1–24 wieder her.

Beide Aktionen speichern die Anordnung sofort lokal, ohne ungespeicherte
Editorinhalte zu speichern oder zu verwerfen. Für die Klasse anschließend
veröffentlichen (oder exportieren und manuell hochladen). Die JSON-Datei enthält dafür das Feld `order`
mit allen 24 Tagesnummern. Ältere Dateien ohne dieses Feld laden weiterhin
in der Reihenfolge 1–24. Die Anordnung bleibt bei Import/Export erhalten.

### PNG und PDF verwenden

PNG (auch JPEG, WebP und GIF) kann direkt über „Bild auswählen“ mit maximal
1 MB pro Bild hinzugefügt werden. Das Bild wird nach dem Speichern mit den
Kalenderdaten exportiert. Der Browserspeicher ist begrenzt; für viele oder
große Bilder besser veröffentlichte Bild-URLs nutzen.

PDFs werden nicht direkt im Lehrereditor hochgeladen. Die PDF-Datei beispielsweise
über GitHub in `assets/` hochladen und ihre öffentliche HTTPS-Adresse im Feld
„Link-URL“ eintragen. Als Button-Text etwa „Arbeitsblatt öffnen“ wählen.
Die Schülerinnen und Schüler öffnen die PDF dann über diesen Button in einem
neuen Tab. Ein lokaler Dateipfad vom eigenen Computer funktioniert für die
Klasse nicht.

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
- Andere Geräte bekommen Änderungen erst nach GitHub-Veröffentlichung und
  erfolgreichem Pages-Deployment. Export allein veröffentlicht noch nichts.
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
5. Neue Inhalte: lokal speichern → mit GitHub verbinden → „Für die Klasse
   veröffentlichen“ → Deployment abwarten. Alternativ exportieren und die
   veröffentlichte `calendar-data.json` manuell ersetzen.
6. Mit einem anderen Browserprofil oder Gerät den veröffentlichten Stand prüfen.
   Cache oder ein noch offener Tab können ein Neuladen erforderlich machen.

Nicht versehentlich Inhalte veröffentlichen, für die keine Nutzungsrechte vorliegen.
Keine personenbezogenen Schülerdaten, vertraulichen Aufgaben oder Geheimnisse ablegen.

## Direkt im Lehrerbereich auf GitHub veröffentlichen

Das Repository ist die zentrale Quelle für veröffentlichte Kalenderdaten.
`Speichern` sichert weiterhin nur einen lokalen Entwurf. Erst die getrennte
Aktion **„Für die Klasse veröffentlichen“** schreibt `calendar-data.json` als
Commit auf `main`. GitHub Pages übernimmt danach die Veröffentlichung.
Ein erfolgreicher Commit ist noch kein erfolgreiches Pages-Deployment.
Den verlinkten Actions-Status prüfen und den Schülerkalender anschließend
neu laden. Ein offener Schülerkalender lädt beim Zurückkehren zum Tab erneut.

### Einmalige Einrichtung des persönlichen Tokens

1. Im eigenen GitHub-Konto unter **Settings → Developer settings → Personal
   access tokens → Fine-grained tokens** ein Token erstellen.
2. **Resource owner: Jubitwo**, **Only select repositories** und ausschließlich
   **klassenmomente-adventskalender** auswählen.
3. **Repository permissions → Contents: Read and write** erlauben. Metadata
   wird von GitHub automatisch mitgeführt. Keine Workflow-, Admin- oder
   sonstigen Schreibrechte erforderlich; ein kurzes Ablaufdatum wählen.
4. Falls mehrere Lehrkräfte veröffentlichen sollen, benötigen sie eigene
   GitHub-Konten mit Schreibzugriff auf dieses Repository und jeweils eigene
   passende Tokens. Organisationsrichtlinien können zusätzliche Freigaben
   erfordern. Ein Token allein erteilt keine über das Konto hinausgehenden Rechte.
5. Das Token ausschließlich im Passwortfeld „GitHub-Zugriffstoken“ im
   Lehrerbereich eingeben, dann **„Mit GitHub verbinden“** wählen.

Token nicht im Chat teilen, nicht als Kalenderinhalt einfügen und nicht ins
Repository committen. Die App hält es nur im Arbeitsspeicher und sendet es
ausschließlich an `https://api.github.com`. Sie legt es nicht in Cookies,
localStorage, sessionStorage, URLs oder Exporten ab. Nach Neuladen,
Verbindungstrennung, Abmelden oder Ablauf der Adminsitzung ist neu zu verbinden.

**Wichtig:** Das Token hat Schreibrechte für die Inhalte des ganzen ausgewählten
Repositories, nicht nur für die Kalenderdatei. Die App verwendet es ausschließlich
für diese Datei. Nur vertrauenswürdige Geräte und Browser verwenden; Tokens können
durch schädliche Erweiterungen oder manipulierten Frontend-Code ausgelesen werden.
Bei Verdacht sofort in GitHub widerrufen. Das Kalenderpasswort ist keine
GitHub-Authentifizierung; ohne eigenes Token können Besucher keine zentralen
Änderungen vornehmen.

### Empfohlener Arbeitsablauf

1. Mit GitHub verbinden und **„GitHub-Stand laden“**, bevor du bearbeitest.
   Dies ersetzt nach Rückfrage den lokalen Kalender einschließlich ungespeicherter
   Türchenänderungen. Vorher bei Bedarf exportieren.
2. Bearbeiten und lokal speichern, bei Bedarf Türchenanordnung mischen.
3. **„Für die Klasse veröffentlichen“** wählen und bestätigen. Ungespeicherte
   Türchenänderungen oder ein ungespeichertes Kalenderjahr blockieren die Aktion.
4. Commit-Link und Pages-Status prüfen; auf einem Schülergerät neu laden.
5. Verbindung trennen, wenn du fertig bist.

Beim Verbinden wird der GitHub-Dateistand vermerkt, aber nicht automatisch
dein lokaler Entwurf ersetzt. Bei der Veröffentlichung wird der lokale Kalender
als Ganzes übertragen. Er kann ältere Inhalte enthalten; deshalb vorher bewusst
den aktuellen GitHub-Stand laden oder einen vorhandenen Entwurf prüfen.

Ändert eine andere Person die Kalenderdatei nach dem Verbinden oder Laden,
verhindern Dateiprüfwert und GitHubs atomare SHA-Prüfung ein stilles Überschreiben.
Bei Konflikt: lokal exportieren, GitHub-Stand laden, eigene Änderungen erneut
einarbeiten. Es gibt keine automatische Zusammenführung. Eine reine Änderung
anderer Repository-Dateien blockiert die Kalenderveröffentlichung nicht.

Einlesen aus GitHub verwendet bei größeren Dateien die Blob-API; Kalenderdaten
sind auf 8 MB begrenzt. Branch-Schutz kann direkte Commits verhindern; dann
die Repository-Regeln nutzen statt sie zu umgehen. Bei Netzwerkabbruch während
eines Commits zuerst auf GitHub nachsehen: Die Anfrage könnte dort bereits
erfolgreich gewesen sein. Ein leseberechtigtes Token lässt sich verbinden,
aber GitHub lehnt die Veröffentlichung ohne Schreibrechte ausdrücklich ab.

## Sicherheitsgrenzen

**Der clientseitige Passwortschutz ist kein echter Zugriffsschutz.**
JavaScript, Passwort-Prüfwert und sämtliche veröffentlichten Kalenderdaten sind
öffentlich lesbar. Technisch versierte Personen können die UI-Sperre umgehen,
den Sitzungsmarker setzen, ihre lokalen Daten ändern, das Datum manipulieren
oder die JSON-Datei direkt lesen – auch Inhalte zukünftiger Türchen.

PBKDF2 vermeidet ein Klartextpasswort in den Anwendungsdateien und verteuert
Passwortraten, verhindert aber keine Umgehung des clientseitigen Codes.
Der einstündige Sitzungsmarker ist Komfort, kein Authentifizierungstoken.
Ohne ein individuell eingegebenes, schreibberechtigtes GitHub-Token besitzt
die App keine Schreibrechte für das Repository. Die tatsächliche Schreibprüfung
übernimmt GitHub, nicht die clientseitige Passwortsperre.
Inhalte werden mit `textContent` ausgegeben; nur feste eigene SVG-Vorlagen
verwenden `innerHTML`. Importdateien werden strikt auf Schema, Größen und URLs
geprüft. `javascript:` und HTML/SVG-Daten-URLs sind nicht erlaubt.

## Später eine Echtzeit-Datenbank ergänzen

GitHub dient bereits als zentrale, versionierte Veröffentlichungsquelle.
Für sofortige Live-Updates, echte Benutzeranmeldung ohne persönliche Tokens
oder geheime zukünftige Türchen kann zusätzlich eine Backend-Lösung sinnvoll sein.

`CalendarStorage` kapselt die Datenzugriffe:

```js
loadCalendar()
saveCalendar(calendar)
getDoor(day)
saveDoor(day, data)
shuffleDoorOrder()
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
node tests/github.test.mjs
```

Browser-Prüfung: 24 Türchen, vor Dezember verschlossen, Adminanmeldung,
Vorschau, Speichern mit zweitem Schülertab, Import/Export, mobile Darstellung,
Tastaturbedienung und Modal schließen. Die GitHub-Tests simulieren API-Antworten,
ohne echte Tokens oder Schreibzugriffe. Eine echte Veröffentlichung erfordert
das persönlich eingerichtete Token. Musik startet niemals automatisch.
