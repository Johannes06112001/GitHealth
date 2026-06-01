# GitSuccess

**GitSuccess** ist ein webbasiertes Tool zur Analyse und Einordnung öffentlicher GitHub-Repositories. Das Projekt bewertet sichtbare Repository-Signale wie Aktivität, Wartung, Reichweite und Dokumentation und erstellt daraus einen nachvollziehbaren Repository Health Score.

Das Tool entstand im Rahmen eines studentischen Softwareprojekts und kombiniert GitHub REST API, Benchmark-Daten, KPI-Scoring und eine visuelle Ergebnisdarstellung.

## Ziel des Projekts

Viele GitHub-Repositories wirken auf den ersten Blick aktiv oder relevant, lassen sich aber nur schwer objektiv vergleichen. GitSuccess soll dabei helfen, öffentliche Repository-Daten strukturiert auszuwerten und verständlich darzustellen.

Das Ziel ist keine vollständige Code-, Security- oder Architekturprüfung. Stattdessen liefert GitSuccess eine indikative Bewertung auf Basis öffentlich verfügbarer GitHub-Daten.

## Kernfunktionen

- Analyse einzelner öffentlicher GitHub-Repositories
- Vergleich mehrerer Repositories über eine direkte Eingabe
- Top-100-Vergleichsgruppe öffentlicher GitHub-Repositories
- Repository Health Score auf Basis von drei Bewertungssäulen
- Benchmark-Kontext mit Median- und Perzentil-Einordnung
- PDF-Report mit Profil, Bewertung, KPI-Erklärung und Handlungsempfehlungen
- Lokale Token-Nutzung für höhere GitHub API-Limits
- Dark Mode und responsive Benutzeroberfläche
- Teamseite mit Steckbriefen der Projektmitglieder

## Seitenübersicht

| Datei | Beschreibung |
|---|---|
| `index.html` | Hauptseite für die Repository-Analyse |
| `top100.html` | Top-100-Vergleichsgruppe und Einstieg in Analysen |
| `docs.html` | Dokumentation der Metriken und Bewertungslogik |
| `api-guide.html` | Anleitung zur Nutzung der GitHub REST API und Tokens |
| `about.html` | Teamübersicht mit Rollenverteilung |
| `team/*.html` | Steckbriefe der einzelnen Projektmitglieder |
| `collect_data.py` | Datensammlung für Benchmark- und Top-100-Daten |
| `.github/workflows/collect.yml` | GitHub Action zur automatischen Datenerhebung |

## Projektstruktur

```text
GitSuccess_/
├── index.html
├── top100.html
├── docs.html
├── api-guide.html
├── about.html
├── analysis.html
├── collect_data.py
├── requirements.txt
├── data/
│   ├── benchmarks.json
│   └── top100_repos.json
├── team/
│   ├── lilly-langenbahn.html
│   ├── johannes-thoma.html
│   ├── valentina-gyan.html
│   ├── marius-courret.html
│   └── christopher-fernandez-ramos.html
└── .github/
    └── workflows/
        └── collect.yml
```

## Bewertungssystem

Der Repository Health Score basiert auf drei Säulen. Jede Säule wird aus mehreren Kennzahlen berechnet und anschließend gewichtet.

| Säule | Gewichtung | Beispielhafte Kennzahlen |
|---|---:|---|
| Aktivität & Community | 40% | Commit-Aktivität, Tage seit letztem Push, Contributors |
| Reaktionsfähigkeit & Wartung | 35% | Issue-Schließungsrate, Release-Frequenz, durchschnittliche Schließzeit |
| Reichweite & Dokumentation | 25% | Fork-Ratio, README/CONTRIBUTING, Stars pro Alterstag |

Die einzelnen KPIs werden auf eine Skala von 0 bis 100 normalisiert. Fehlende Werte werden nicht automatisch negativ bewertet, sondern aus der jeweiligen Gewichtung herausgerechnet.

### Beispielhafte Normalisierung

```text
Score = min(100, Ist-Wert / Benchmark-Median × 100)
```

Bei Kennzahlen, bei denen niedrigere Werte besser sind, wird die Richtung entsprechend umgedreht:

```text
Score = min(100, Benchmark-Median / Ist-Wert × 100)
```

## Benchmark-Daten

Die Benchmark-Daten basieren auf einer Top-100-Vergleichsgruppe öffentlicher GitHub-Repositories. Diese Daten werden über `collect_data.py` erhoben und in `data/` gespeichert.

Generierte Dateien:

- `data/benchmarks.json`: Medianwerte und weitere Benchmark-Grundlagen
- `data/top100_repos.json`: Top-100-Repositories mit erhobenen Kennzahlen

Die Datenerhebung kann lokal oder automatisiert per GitHub Action ausgeführt werden.

## Lokales Setup

### 1. Repository klonen

```bash
git clone https://github.com/Johannes06112001/GitSuccess_.git
cd GitSuccess_
```

### 2. Python-Abhängigkeiten installieren

```bash
pip install -r requirements.txt
```

### 3. Benchmark-Daten erzeugen

```bash
python collect_data.py
```

Danach sollten die Dateien im Ordner `data/` aktualisiert sein.

### 4. Anwendung öffnen

Die Anwendung besteht aus statischen HTML-Dateien. Zum Testen kann ein lokaler Server genutzt werden:

```bash
python -m http.server 8000
```

Danach im Browser öffnen:

```text
http://localhost:8000/index.html
```

## GitHub Pages

Wenn GitHub Pages aktiviert ist, kann die Anwendung über die Pages-URL des Repositories bereitgestellt werden.

Empfohlene Einstellung:

```text
Settings → Pages → Branch: main → Save
```

Danach sind die Seiten typischerweise unter folgendem Schema erreichbar:

```text
https://johannes06112001.github.io/GitSuccess_/index.html
```

## GitHub Token und Rate Limits

Die Anwendung kann öffentliche Repositories grundsätzlich ohne Token analysieren. GitHub begrenzt nicht authentifizierte REST-API-Anfragen jedoch stark.

| Nutzung | Limit |
|---|---:|
| Ohne Token | ca. 60 Requests pro Stunde |
| Mit Personal Access Token | ca. 5.000 Requests pro Stunde |
| GitHub Action | Nutzung über `GITHUB_TOKEN` |

Der Token wird im Browser nur lokal gespeichert und nicht in das Repository geschrieben.

## Team

| Person | Rolle |
|---|---|
| Lilly Langenbahn | Strategische Projektleitung |
| Johannes Thoma | Operative und technische Leitung |
| Valentina Gyan | Data Science und Analyse |
| Marius Courret | Entwicklung und Design |
| Christopher Fernandez-Ramos | Research und Literatur |

Weitere Informationen stehen auf der Teamseite `about.html` und den einzelnen Steckbriefseiten im Ordner `team/`.

## Methodischer Hinweis

GitSuccess bewertet sichtbare GitHub-Signale. Die Bewertung ist damit ein strukturierter Indikator, aber kein vollständiger Qualitätsnachweis. Nicht vollständig abgedeckt sind unter anderem:

- Codequalität
- Security-Prüfungen
- Architekturentscheidungen
- Governance-Prozesse
- externe Kommunikation außerhalb von GitHub
- tatsächliche Nutzung in produktiven Umgebungen

## Nächste mögliche Verbesserungen

- Gemeinsame CSS- und JavaScript-Dateien auslagern
- Navigation als wiederverwendbare Komponente aufbauen
- Mobile Darstellung der Analyseergebnisse weiter optimieren
- PDF-Layout weiter verfeinern
- zusätzliche Benchmarks und Vergleichsgruppen ergänzen
- echte Teamfotos statt Platzhalter verwenden

## Lizenz und Kontext

Dieses Repository ist Teil eines studentischen Softwareprojekts. Die Anwendung nutzt öffentlich verfügbare GitHub-Daten und die GitHub REST API.
