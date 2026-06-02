(() => {
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function scoreLabel(score) {
    if (typeof scoreText === 'function') return scoreText(score ?? 0);
    if ((score ?? 0) >= 80) return 'starke Repository Health';
    if ((score ?? 0) >= 60) return 'solide Repository Health';
    if ((score ?? 0) >= 40) return 'eingeschränkte Repository Health';
    return 'kritische Repository Health';
  }

  function interpretation(score) {
    if (score == null) return 'Für diesen Bereich konnten nicht genügend Daten berechnet werden.';
    if (score >= 80) return 'Der Wert liegt im starken Bereich. Die öffentlich sichtbaren GitHub-Signale sprechen hier für eine robuste Repository Health.';
    if (score >= 60) return 'Der Wert liegt im soliden Bereich. Es gibt positive Signale, einzelne Aspekte können jedoch weiter verbessert werden.';
    if (score >= 40) return 'Der Wert liegt im eingeschränkten Bereich. Mehrere Signale deuten auf Verbesserungsbedarf hin.';
    return 'Der Wert liegt im kritischen Bereich. Die sichtbaren Signale sprechen für deutliche Lücken oder fehlende Daten.';
  }

  function allReportKpis() {
    return typeof allKpis === 'function' ? allKpis() : PILLARS.flatMap(pillar => pillar.kpis);
  }

  function kpiScore(kpi) {
    return typeof scoreKpi === 'function' ? scoreKpi(kpi.id, state.kpis[kpi.id]) : null;
  }

  function formatDirection(kpi) {
    const text = KPI_DIRECTION?.[kpi.id] || '';
    if (text.includes('niedriger')) return '↓ niedriger ist besser';
    return '↑ höher ist besser';
  }

  function calculationText(kpi, current, median, score) {
    if (current == null || score == null) return 'Nicht berechenbar.';
    if (kpi.dir === 'less') return `${kpi.fmt(median)} / ${kpi.fmt(current)} × 100 = ${score}`;
    if (kpi.dir === 'bool') return `README vorhanden + CONTRIBUTING ${state.meta.contribOk ? 'vorhanden' : 'fehlt'} = ${score}`;
    if (kpi.dir === 'log') return `Logarithmische Normalisierung gegen Median ${kpi.fmt(median)} = ${score}`;
    return `${kpi.fmt(current)} / ${kpi.fmt(median)} × 100 = ${score}`;
  }

  function recommendationFor(kpi, score) {
    if (score == null) return 'Datenlage prüfen und sicherstellen, dass die Kennzahl öffentlich ermittelbar ist.';
    if (score >= 80) return 'Der Bereich ist stark. Weiter beobachten und den aktuellen Standard beibehalten.';
    if (score >= 60) return 'Der Bereich ist solide. Einzelne Verbesserungen können die Außenwirkung weiter stärken.';

    const map = {
      commits30: 'Entwicklungsaktivität stabilisieren: regelmäßige Maintenance-Commits und eine sichtbare Roadmap unterstützen die Wahrnehmung aktiver Pflege.',
      daysInactive: 'Aktualität verbessern: lange Inaktivitätsphasen reduzieren und kleinere Pflege-Updates sichtbarer machen.',
      contributors: 'Community-Beteiligung stärken: Contribution-Guidelines, Good-First-Issues und klare Setup-Schritte ergänzen.',
      closeRate: 'Issue-Reaktionszeit verbessern: regelmäßige Triage mit klaren Prioritäten erhöht die Wartungstransparenz.',
      relFreq: 'Release-Prozess strukturieren: kleinere, dokumentierte Releases verbessern Planbarkeit und Vertrauen.',
      avgClose: 'Issue-Bearbeitung beschleunigen: Labels, Zuständigkeiten und Priorisierung nutzen.',
      avgComments: 'Issue-Kommunikation verbessern: Entscheidungen und Lösungswege nachvollziehbar dokumentieren.',
      fehlerProd: 'Fehlerbehebungen sichtbarer machen: geschlossene Issues mit Commits und Releases verknüpfen.',
      forkRatio: 'Wiederverwendbarkeit erhöhen: Beispiele, Lizenzinformationen und verständliche Projektstruktur ausbauen.',
      doku: 'Dokumentation ausbauen: README, Quickstart, Beispiele und Contribution-Hinweise reduzieren Einstiegshürden.',
      starsTage: 'Reichweite verbessern: Projektbeschreibung, README, Beispiele und Auffindbarkeit optimieren.'
    };
    return map[kpi.id] || 'Kennzahl gezielt verbessern und gegen den Benchmark prüfen.';
  }

  function pillarCards() {
    return PILLARS.map(pillar => {
      const score = state.scores[pillar.id];
      return `
        <article class="pillar-card">
          <h3>${esc(pillar.label)}</h3>
          <div class="pillar-score">${score ?? 'Nicht verfügbar'}</div>
          <p>${Math.round(pillar.weight * 100)}% Gewichtung</p>
          <p>${esc(pillar.text)}</p>
          <p><b>Interpretation:</b> ${esc(interpretation(score))}</p>
        </article>
      `;
    }).join('');
  }

  function benchmarkLegend() {
    return `
      <div class="benchmark-legend">
        <span><i class="legend-current"></i> Ist-Wert</span>
        <span><i class="legend-median"></i> Median</span>
      </div>
    `;
  }

  function benchmarkRows() {
    const selected = ['daysInactive', 'contributors', 'closeRate', 'avgClose', 'doku', 'starsTage']
      .map(id => allReportKpis().find(kpi => kpi.id === id))
      .filter(Boolean);

    return selected.map(kpi => {
      const current = state.kpis[kpi.id];
      const median = MEDIANS[kpi.id];
      const score = kpiScore(kpi);
      const percentile = clamp(score);
      const currentPos = clamp(score == null ? 0 : score);
      const medianPos = 50;
      return `
        <tr>
          <td><b>${esc(kpi.label)}</b></td>
          <td>
            <div class="range-line" aria-label="Ist-Wert und Median">
              <i class="median" style="left:${medianPos}%"></i>
              <i class="current" style="left:${currentPos}%"></i>
            </div>
            <div class="range-values">
              <span>Ist-Wert: <b>${esc(kpi.fmt(current))}</b></span>
              <span>Median: <b>${esc(kpi.fmt(median))}</b></span>
            </div>
          </td>
          <td>${score == null ? 'Nicht verfügbar' : `${Math.round(percentile)}%`}</td>
          <td>${score == null ? 'Für diese Kennzahl konnten nicht genügend Daten berechnet werden.' : `Das Repository liegt bei dieser Kennzahl besser oder gleich als ca. ${Math.round(percentile)}% der Benchmark-Vergleichsgruppe.`}</td>
        </tr>
      `;
    }).join('');
  }

  function documentationRows() {
    const docs = [
      ['README', state.meta.readmeOk, 'Basisdokumentation, Quickstart und Projektüberblick'],
      ['CONTRIBUTING', state.meta.contribOk, 'Hinweise für Mitwirkung, Standards und Einstieg für Contributors']
    ];

    return docs.map(([name, present, meaning]) => `
      <tr>
        <td>${name}</td>
        <td><span class="doc-status ${present ? 'ok' : 'missing'}">${present ? 'vorhanden' : 'fehlt'}</span></td>
        <td>${meaning}</td>
      </tr>
    `).join('');
  }

  function languageItems() {
    return window.OpenGitHealthLanguageChart?.getItems?.() || [];
  }

  function languageSegments(items) {
    if (window.OpenGitHealthLanguageChart?.segments) return window.OpenGitHealthLanguageChart.segments(items);
    let start = 0;
    return items.map(item => { const end = start + item.pct; const part = `${item.color} ${start}% ${end}%`; start = end; return part; }).join(', ');
  }

  function languagePercent(value) {
    if (window.OpenGitHealthLanguageChart?.percent) return window.OpenGitHealthLanguageChart.percent(value);
    return value >= 10 ? value.toFixed(1).replace('.0', '') + '%' : value.toFixed(1) + '%';
  }

  function languageSection() {
    const items = languageItems();
    if (!items.length) {
      return `
        <h2>Language Distribution</h2>
        <div class="note">Für diesen Report konnte keine Sprachverteilung geladen werden. Die Analyse selbst bleibt davon unberührt, weil Software natürlich nie alle Wünsche gleichzeitig erfüllt.</div>
      `;
    }

    const top = items[0];
    return `
      <h2>Language Distribution</h2>
      <div class="language-report">
        <div class="language-donut-report" style="--segments:${languageSegments(items)}">
          <div><b>${esc(top.name)}</b><span>${languagePercent(top.pct)}</span></div>
        </div>
        <div>
          <p class="muted">Die Sprachverteilung basiert auf der GitHub-Languages-API und zeigt die relativen Code-Anteile im Repository.</p>
          <table>
            <tr><th>Sprache</th><th>Anteil</th><th>Visualisierung</th></tr>
            ${items.map(item => `<tr><td><span class="language-dot" style="background:${item.color}"></span>${esc(item.name)}</td><td>${languagePercent(item.pct)}</td><td><div class="language-bar-report"><i style="width:${item.pct}%;background:${item.color}"></i></div></td></tr>`).join('')}
          </table>
        </div>
      </div>
    `;
  }

  function kpiRows() {
    return allReportKpis().map(kpi => {
      const current = state.kpis[kpi.id];
      const median = MEDIANS[kpi.id];
      const score = kpiScore(kpi);
      return `
        <tr>
          <td><b>${esc(kpi.label)}</b><br><span>${esc(KPI_INFO?.[kpi.id] || '')}</span></td>
          <td>${esc(formatDirection(kpi))}</td>
          <td>${esc(kpi.fmt(median))}</td>
          <td>${esc(kpi.fmt(current))}</td>
          <td>${score ?? 'Nicht verfügbar'}</td>
          <td>${esc(calculationText(kpi, current, median, score))}</td>
          <td>${esc(interpretation(score))}</td>
        </tr>
      `;
    }).join('');
  }

  function recommendationList() {
    const weak = allReportKpis()
      .map(kpi => ({ kpi, score: kpiScore(kpi) }))
      .filter(item => item.score == null || item.score < 70)
      .sort((a, b) => (a.score ?? -1) - (b.score ?? -1))
      .slice(0, 5);

    if (!weak.length) {
      return '<li><b>Stabil halten:</b> Die sichtbaren Signale liegen weitgehend im soliden bis starken Bereich. Fokus auf kontinuierliche Pflege, aktuelle Dokumentation und regelmäßige Releases.</li>';
    }

    return weak.map(({ kpi, score }) => `<li><b>${esc(kpi.label)}:</b> ${esc(recommendationFor(kpi, score))}</li>`).join('');
  }

  function endpointList() {
    return [...new Set(state.apiLog || [])]
      .map(endpoint => `<li><code>GET ${esc(endpoint)}</code></li>`)
      .join('');
  }

  function buildReportHtml() {
    const meta = state.meta;
    const overall = state.scores.overall;
    const createdAt = new Date().toLocaleString('de-DE');

    return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>OpenGitHealth Repository Health Report</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 28px; font-family: Arial, sans-serif; color: #1E293B; line-height: 1.45; background: #fff; }
    h1 { margin: 0 0 10px; font-size: 30px; letter-spacing: -.02em; }
    h2 { margin: 28px 0 12px; font-size: 22px; letter-spacing: .02em; page-break-after: avoid; }
    h3 { margin: 0 0 14px; font-size: 15px; }
    p { margin: 8px 0; }
    .muted { color: #475569; }
    .score { margin: 26px 0 22px; font-size: 56px; font-weight: 700; color: #3F2E8C; }
    .note { border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; margin: 16px 0; background: #fff; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    tr { page-break-inside: avoid; }
    th, td { border: 1px solid #E2E8F0; padding: 9px 10px; text-align: left; vertical-align: top; font-size: 12px; }
    th { background: #F8FAFC; color: #1E293B; font-size: 11px; font-weight: 700; }
    td span { color: #475569; }
    .pillar-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
    .pillar-card { border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; min-height: 170px; page-break-inside: avoid; }
    .pillar-score { font-size: 32px; color: #3F2E8C; font-weight: 700; margin-bottom: 14px; }
    .benchmark-legend { display: flex; gap: 18px; align-items: center; justify-content: flex-end; margin: 6px 0 8px; font-size: 11px; color: #475569; }
    .benchmark-legend span { display: inline-flex; align-items: center; gap: 6px; }
    .benchmark-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
    .legend-current { background: #5B50D6; }
    .legend-median { background: #F59E0B; }
    .range-line { position: relative; height: 22px; margin: 4px 8px 8px; border-bottom: 2px solid #E2E8F0; }
    .range-line i { position: absolute; bottom: -7px; width: 3px; height: 18px; border-radius: 999px; transform: translateX(-50%); }
    .range-line i.current { background: #5B50D6; }
    .range-line i.median { background: #F59E0B; }
    .range-values { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; }
    .doc-status { font-weight: 700; }
    .doc-status.ok { color: #166534; }
    .doc-status.missing { color: #9F1239; }
    .language-report { display: grid; grid-template-columns: 240px 1fr; gap: 18px; align-items: center; }
    .language-donut-report { width: 210px; height: 210px; border-radius: 50%; background: conic-gradient(var(--segments)); position: relative; display: grid; place-items: center; margin: auto; }
    .language-donut-report:after { content: ''; position: absolute; inset: 46px; border-radius: 50%; background: white; }
    .language-donut-report div { position: relative; z-index: 1; text-align: center; }
    .language-donut-report b { display: block; font-size: 20px; }
    .language-donut-report span { display: block; font-size: 12px; color: #475569; }
    .language-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 7px; vertical-align: middle; }
    .language-bar-report { height: 7px; background: #E2E8F0; border-radius: 999px; overflow: hidden; }
    .language-bar-report i { display: block; height: 100%; border-radius: 999px; }
    code { background: #F1F5F9; border-radius: 4px; padding: 2px 4px; }
    ul { margin-top: 8px; }
    li { margin-bottom: 8px; }
    .actions { display: flex; gap: 10px; margin: 18px 0 24px; }
    .actions button { border: 0; border-radius: 12px; padding: 11px 16px; background: #5B50D6; color: white; font-weight: 700; cursor: pointer; }
    .actions button.secondary { background: #E2E8F0; color: #1E293B; }
    @media print { body { margin: 14mm; } .actions { display: none; } h2 { page-break-after: avoid; } .pillar-card, .note, .language-report { page-break-inside: avoid; } }
    @media(max-width:800px){.language-report{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="actions">
    <button type="button" onclick="window.print()">PDF speichern / drucken</button>
    <button class="secondary" type="button" onclick="window.close()">Fenster schließen</button>
  </div>

  <h1>OpenGitHealth Repository Health Report</h1>
  <p class="muted">${esc(meta.fullName)} · erstellt am ${esc(createdAt)} · erstellt auf Basis öffentlich verfügbarer GitHub-Daten</p>

  <div class="score">${overall ?? '—'} / 100</div>
  <p><b>Status:</b> ${esc(scoreLabel(overall ?? 0))}</p>

  <div class="note"><b>Methodischer Hinweis:</b> Der Score ist eine indikative, vergleichende Repository-Health-Einordnung. Er ersetzt keine Code-, Security-, Architektur- oder Governance-Prüfung.</div>

  <h2>Repository-Profil</h2>
  <table>
    <tr><th>Stars</th><th>Forks</th><th>Offene Issues</th><th>Projekttage</th><th>Sprache</th><th>Lizenz</th></tr>
    <tr><td>${fmt(meta.stars)}</td><td>${fmt(meta.forks)}</td><td>${fmt(meta.openIssues)}</td><td>${fmt(meta.age)}</td><td>${esc(meta.language || 'Nicht verfügbar')}</td><td>${esc(meta.license || 'Nicht verfügbar')}</td></tr>
  </table>

  ${languageSection()}

  <h2>Bewertungssäulen</h2>
  <div class="pillar-grid">${pillarCards()}</div>

  <h2>Benchmark-Kontext</h2>
  <div class="note">Die Benchmark-Werte basieren auf der täglich aktualisierten Top-100-Vergleichsgruppe öffentlicher GitHub-Repositories. Sie dienen der relativen Einordnung und bilden nicht die gesamte GitHub-Plattform ab.</div>
  ${benchmarkLegend()}
  <table>
    <tr><th>KPI</th><th>Ist-Wert und Median</th><th>Perzentil</th><th>Einordnung</th></tr>
    ${benchmarkRows()}
  </table>

  <h2>Dokumentationsstatus</h2>
  <table>
    <tr><th>Dokument</th><th>Status</th><th>Bedeutung</th></tr>
    ${documentationRows()}
  </table>
  <div class="note"><b>Dokumentationsscore:</b> README zählt mit 60 Punkten, CONTRIBUTING mit 40 Punkten. Fehlende Dokumente senken den Dokumentationswert und werden im Report transparent ausgewiesen.</div>

  <h2>KPI-Erläuterungen und Score-Berechnung</h2>
  <table>
    <tr><th>KPI</th><th>Richtung</th><th>Median</th><th>Ist-Wert</th><th>Score</th><th>Berechnung</th><th>Interpretation</th></tr>
    ${kpiRows()}
  </table>

  <h2>Handlungsempfehlungen</h2>
  <ul>${recommendationList()}</ul>

  <h2>Genutzte GitHub-API-Endpunkte</h2>
  <ul>${endpointList()}</ul>

  <h2>Interpretationsskala</h2>
  <div class="note"><p><b>80–100:</b> starke Repository Health. <b>60–79:</b> solide Repository Health. <b>40–59:</b> eingeschränkte Repository Health. <b>0–39:</b> kritische Repository Health.</p><p class="muted">Der Report bewertet sichtbare GitHub-Signale wie Aktivität, Wartung, Reichweite und Dokumentation.</p></div>
</body>
</html>`;
  }

  window.openReportForPdf = function openReportForPdf() {
    if (!state || !state.meta) {
      alert('Bitte führen Sie zuerst eine Repository-Analyse aus.');
      return;
    }

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      alert('Der Bericht konnte nicht geöffnet werden. Bitte Popup-Blocker prüfen.');
      return;
    }

    reportWindow.document.write(buildReportHtml());
    reportWindow.document.close();
  };
})();
