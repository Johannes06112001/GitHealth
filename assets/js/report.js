(() => {
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function readGlobal(name, fallback) {
    return typeof window[name] !== 'undefined' ? window[name] : fallback;
  }

  function getScoreColor(score) {
    if (typeof color === 'function') return color(score ?? 0);
    if ((score ?? 0) >= 70) return '#34D399';
    if ((score ?? 0) >= 45) return '#FBBF24';
    return '#FB7185';
  }

  function getScoreLabel(score) {
    if (typeof scoreText === 'function') return scoreText(score ?? 0);
    if ((score ?? 0) >= 80) return 'starke Repository Health';
    if ((score ?? 0) >= 60) return 'solide Repository Health';
    if ((score ?? 0) >= 40) return 'eingeschränkte Repository Health';
    return 'kritische Repository Health';
  }

  function getKpiScore(kpi) {
    if (typeof scoreKpi === 'function') return scoreKpi(kpi.id, state.kpis[kpi.id]);
    return null;
  }

  function getAllKpis() {
    if (typeof allKpis === 'function') return allKpis();
    return (readGlobal('PILLARS', []) || []).flatMap(pillar => pillar.kpis || []);
  }

  function statusClass(score) {
    if (score == null) return 'neutral';
    if (score >= 70) return 'good';
    if (score >= 45) return 'warn';
    return 'bad';
  }

  function statusText(score) {
    if (score == null) return 'Für diesen Bereich fehlen ausreichend belastbare Daten.';
    if (score >= 80) return 'Sehr starke Signale. Der Bereich wirkt sichtbar gut gepflegt.';
    if (score >= 60) return 'Solide Signale. Der Bereich ist grundsätzlich gut aufgestellt.';
    if (score >= 40) return 'Gemischte Signale. Hier gibt es nachvollziehbaren Verbesserungsbedarf.';
    return 'Schwache Signale. Dieser Bereich sollte priorisiert verbessert werden.';
  }

  function recommendationFor(kpi, score) {
    const suggestions = {
      commits30: 'Regelmäßige Maintenance-Commits, sichtbare Roadmap-Arbeit oder kleinere Verbesserungen einplanen.',
      daysInactive: 'Lange Phasen ohne Pushes vermeiden und Pflegeaktivität sichtbarer machen.',
      contributors: 'Contribution-Guidelines, Good-First-Issues und klare lokale Setup-Schritte ergänzen.',
      closeRate: 'Regelmäßige Issue-Triage durchführen und erledigte, doppelte oder veraltete Issues schließen.',
      relFreq: 'Releases regelmäßiger veröffentlichen und Änderungen über Release Notes dokumentieren.',
      avgClose: 'Bearbeitungszeiten durch Labels, Priorisierung und klare Verantwortlichkeiten reduzieren.',
      avgComments: 'Entscheidungen und Lösungswege in Issues besser kommentieren und nachvollziehbar machen.',
      fehlerProd: 'Abgeschlossene Issues und Wartungsarbeit sichtbarer mit Commits und Releases verknüpfen.',
      forkRatio: 'Wiederverwendbarkeit durch Beispiele, klare Lizenzinformationen und verständliche Struktur erhöhen.',
      doku: 'README und CONTRIBUTING vollständig ergänzen, inklusive Quickstart, Nutzung und Beitragsprozess.',
      starsTage: 'Projektpräsentation, Dokumentation und Auffindbarkeit verbessern.'
    };

    if (score == null) return 'Datenlage prüfen und sicherstellen, dass relevante Repository-Informationen öffentlich verfügbar sind.';
    if (score >= 70) return 'Aktuell stabil. Beibehalten, regelmäßig prüfen und nicht verrotten lassen, wie es Software leider gern tut.';
    return suggestions[kpi.id] || 'Kennzahl genauer analysieren und Maßnahmen zur Verbesserung ableiten.';
  }

  function calculationFor(kpi, current, median, score) {
    if (current == null || score == null) return 'Nicht berechenbar, weil ein notwendiger Wert fehlt.';
    if (kpi.dir === 'less') return `${kpi.fmt(median)} / ${kpi.fmt(current)} × 100 = ${score}`;
    if (kpi.dir === 'bool') return `Dokumentationspunkte aus README und CONTRIBUTING = ${score}`;
    if (kpi.dir === 'log') return `log(${kpi.fmt(current)} + 1) / log(${kpi.fmt(median)} + 1) × 100 = ${score}`;
    return `${kpi.fmt(current)} / ${kpi.fmt(median)} × 100 = ${score}`;
  }

  function renderRepoCard(meta) {
    const description = meta.description || 'Keine Repository-Beschreibung hinterlegt.';
    return `
      <section class="report-card repo-card">
        <div>
          <span class="eyebrow">Repository-Profil</span>
          <h2>${escapeHtml(meta.fullName)}</h2>
          <p>${escapeHtml(description)}</p>
          <div class="chips">
            ${meta.language ? `<span>${escapeHtml(meta.language)}</span>` : ''}
            ${meta.license ? `<span>${escapeHtml(meta.license)}</span>` : ''}
            <span>${meta.readmeOk ? 'README vorhanden' : 'README fehlt'}</span>
            <span>${meta.contribOk ? 'CONTRIBUTING vorhanden' : 'CONTRIBUTING fehlt'}</span>
          </div>
        </div>
        <div class="stats">
          <div><b>${fmt(meta.stars)}</b><span>Stars</span></div>
          <div><b>${fmt(meta.forks)}</b><span>Forks</span></div>
          <div><b>${fmt(meta.openIssues)}</b><span>Offene Issues</span></div>
          <div><b>${fmt(meta.age)}</b><span>Projekttage</span></div>
        </div>
      </section>
    `;
  }

  function renderScoreBlock(overall) {
    const score = overall ?? 0;
    return `
      <section class="score-layout">
        <article class="report-card overall-card">
          <span class="eyebrow">Repository Health Score</span>
          <div class="ring" style="--s:${score};--c:${getScoreColor(score)}">
            <div class="ring-inner">
              <div class="ring-num" style="color:${getScoreColor(score)}">${overall ?? '—'}</div>
            </div>
          </div>
          <h3>${getScoreLabel(score)}</h3>
          <p>Der Gesamtscore ist ein gewichteter Indikator aus Aktivität, Wartung, Reichweite und Dokumentation.</p>
          <div class="weight-list">
            <div><b>Aktivität & Community</b><span>40%</span></div>
            <div><b>Reaktionsfähigkeit & Wartung</b><span>35%</span></div>
            <div><b>Reichweite & Dokumentation</b><span>25%</span></div>
          </div>
        </article>
        <div class="pillar-grid">
          ${renderPillarCards()}
        </div>
      </section>
    `;
  }

  function renderPillarCards() {
    return PILLARS.map(pillar => {
      const score = state.scores[pillar.id];
      const colorValue = getScoreColor(score ?? 0);
      const kpiPreview = pillar.kpis.map(kpi => `
        <div class="mini-kpi">
          <span>${escapeHtml(kpi.label)}</span>
          <b>${escapeHtml(kpi.fmt(state.kpis[kpi.id]))}</b>
        </div>
      `).join('');

      return `
        <article class="report-card pillar-card">
          <div class="pillar-head">
            <h3>${escapeHtml(pillar.label)}</h3>
            <span>${Math.round(pillar.weight * 100)}%</span>
          </div>
          <div class="pillar-score" style="color:${colorValue}">${score ?? '—'}</div>
          <p>${escapeHtml(pillar.text)}</p>
          <div class="progress"><i style="--w:${score ?? 0}%;--c:${colorValue}"></i></div>
          <div class="mini-grid">${kpiPreview}</div>
          <small>${statusText(score)}</small>
        </article>
      `;
    }).join('');
  }

  function renderDocumentationSection(meta) {
    const docs = [
      {
        name: 'README',
        present: meta.readmeOk,
        meaning: 'Erklärt Zweck, Installation, Nutzung und Einstieg in das Repository.',
        missing: 'README mit Kurzbeschreibung, Installationsschritten, Usage-Beispielen, Screenshots und Links ergänzen.'
      },
      {
        name: 'CONTRIBUTING',
        present: meta.contribOk,
        meaning: 'Beschreibt Beitragsprozess, Standards, Pull Requests und Zusammenarbeit.',
        missing: 'CONTRIBUTING-Datei mit Branching-Regeln, PR-Prozess, Code-Standards und Issue-Triage ergänzen.'
      }
    ];

    return `
      <section class="report-card">
        <span class="eyebrow">Dokumentation</span>
        <h2>Dokumentationsstatus</h2>
        <p>Dokumentation ist ein zentraler Hebel, damit Nutzer und Contributors schnell verstehen, wie das Repository genutzt und weiterentwickelt werden kann.</p>
        <table>
          <thead><tr><th>Dokument</th><th>Status</th><th>Bedeutung</th><th>Empfehlung</th></tr></thead>
          <tbody>
            ${docs.map(doc => `
              <tr>
                <td><b>${doc.name}</b></td>
                <td><span class="badge ${doc.present ? 'good' : 'bad'}">${doc.present ? 'vorhanden' : 'fehlt'}</span></td>
                <td>${doc.meaning}</td>
                <td>${doc.present ? 'Beibehalten und regelmäßig aktualisieren.' : doc.missing}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>
    `;
  }

  function renderKpiSection() {
    const rows = getAllKpis().map(kpi => {
      const current = state.kpis[kpi.id];
      const median = MEDIANS[kpi.id];
      const score = getKpiScore(kpi);
      return `
        <tr>
          <td><b>${escapeHtml(kpi.label)}</b><br><span>${escapeHtml(KPI_INFO[kpi.id] || '')}</span></td>
          <td>${escapeHtml(kpi.fmt(current))}</td>
          <td>${escapeHtml(kpi.fmt(median))}</td>
          <td><span class="badge ${statusClass(score)}">${score ?? '—'}</span></td>
          <td>${escapeHtml(KPI_DIRECTION[kpi.id] || '')}</td>
          <td>${escapeHtml(calculationFor(kpi, current, median, score))}</td>
          <td>${escapeHtml(recommendationFor(kpi, score))}</td>
        </tr>
      `;
    }).join('');

    return `
      <section class="report-card">
        <span class="eyebrow">KPI-Details</span>
        <h2>KPI-Analyse und Maßnahmen</h2>
        <p>Die Tabelle zeigt wie im Dashboard Ist-Wert, Median und Score. Ergänzt wird sie um konkrete Maßnahmen für Repository-Besitzer.</p>
        <table>
          <thead><tr><th>KPI</th><th>Ist-Wert</th><th>Median</th><th>Score</th><th>Richtung</th><th>Berechnung</th><th>Empfehlung</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    `;
  }

  function renderPrioritySection() {
    const weak = getAllKpis()
      .map(kpi => ({ kpi, score: getKpiScore(kpi) }))
      .filter(item => item.score == null || item.score < 70)
      .sort((a, b) => (a.score ?? -1) - (b.score ?? -1))
      .slice(0, 6);

    const items = weak.length
      ? weak.map(({ kpi, score }) => `<li><b>${escapeHtml(kpi.label)}:</b> ${escapeHtml(recommendationFor(kpi, score))}</li>`).join('')
      : '<li>Die wichtigsten sichtbaren Signale liegen im stabilen Bereich. Fokus: Dokumentation aktuell halten, Releases sauber dokumentieren und Issues weiterhin aktiv pflegen.</li>';

    return `
      <section class="report-card action-card">
        <span class="eyebrow">Priorisierung</span>
        <h2>Empfohlene nächste Schritte</h2>
        <ul>${items}</ul>
      </section>
    `;
  }

  function renderApiSection() {
    const endpoints = [...new Set(state.apiLog || [])]
      .map(endpoint => `<li><code>GET ${escapeHtml(endpoint)}</code></li>`)
      .join('');

    return `
      <section class="report-card">
        <span class="eyebrow">Transparenz</span>
        <h2>Genutzte GitHub-API-Endpunkte</h2>
        <p>Folgende Endpunkte wurden für die Analyse verwendet:</p>
        <ul>${endpoints}</ul>
      </section>
    `;
  }

  function buildReportHtml() {
    const meta = state.meta;
    const createdAt = new Date().toLocaleString('de-DE');

    return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>GitSuccess Repository Health Report</title>
  <style>
    :root { --primary:#5B50D6; --positive:#34D399; --neutral:#FBBF24; --negative:#FB7185; --border:#E2E8F0; --soft:#F8FAFC; --muted:#64748B; --text:#1E293B; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; font-family: Arial, sans-serif; color: var(--text); background: #EEF2F7; line-height: 1.45; }
    .page { max-width: 1120px; margin: 0 auto; display: grid; gap: 16px; }
    .report-card { background: white; border: 1px solid var(--border); border-radius: 22px; padding: 20px; box-shadow: 0 14px 36px rgba(15,23,42,.06); page-break-inside: avoid; }
    .cover { background: linear-gradient(135deg, #fff, #F8FAFC); }
    .eyebrow { display: inline-block; margin-bottom: 8px; color: var(--primary); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 0 0 8px; font-size: 34px; letter-spacing: -.03em; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    h3 { margin: 0; font-size: 15px; }
    p { margin: 6px 0; color: #475569; }
    .toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
    button { border: 0; border-radius: 13px; padding: 11px 16px; background: var(--primary); color: white; font-weight: 700; cursor: pointer; }
    button.secondary { background: #E2E8F0; color: var(--text); }
    .repo-card { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 18px; align-items: center; }
    .chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; }
    .chips span { border: 1px solid var(--border); border-radius: 999px; padding: 5px 9px; color: #64748B; background: #F8FAFC; font-size: 12px; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .stats div { background: #F8FAFC; border: 1px solid var(--border); border-radius: 15px; padding: 12px; }
    .stats b { display: block; font-size: 20px; }
    .stats span { display: block; color: #64748B; font-size: 11px; }
    .score-layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 16px; }
    .overall-card { text-align: center; }
    .ring { position: relative; display: grid; place-items: center; width: 150px; height: 150px; margin: 10px auto; border-radius: 50%; background: conic-gradient(var(--c) calc(var(--s)*1%), #E2E8F0 0); }
    .ring:after { content: ''; position: absolute; inset: 14px; background: white; border-radius: 50%; }
    .ring-inner { position: relative; z-index: 1; }
    .ring-num { font-size: 42px; font-weight: 700; }
    .weight-list { display: grid; gap: 8px; margin-top: 14px; }
    .weight-list div { display: flex; justify-content: space-between; gap: 10px; background: #F8FAFC; border: 1px solid var(--border); border-radius: 12px; padding: 9px; font-size: 12px; }
    .pillar-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .pillar-card { box-shadow: none; }
    .pillar-head { display: flex; justify-content: space-between; gap: 10px; }
    .pillar-head span { color: #64748B; font-size: 12px; font-weight: 700; }
    .pillar-score { margin: 10px 0; font-size: 32px; font-weight: 700; }
    .progress { height: 8px; background: #E2E8F0; border-radius: 999px; overflow: hidden; margin: 12px 0; }
    .progress i { display: block; height: 100%; width: var(--w); background: var(--c); }
    .mini-grid { display: grid; gap: 7px; margin: 12px 0; }
    .mini-kpi { background: #F8FAFC; border: 1px solid var(--border); border-radius: 12px; padding: 8px; }
    .mini-kpi span { display: block; color: #64748B; font-size: 10px; font-weight: 700; }
    .mini-kpi b { display: block; margin-top: 3px; font-size: 12px; }
    small { color: #64748B; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid var(--border); padding: 8px; text-align: left; vertical-align: top; font-size: 11px; }
    th { background: #F1F5F9; color: #475569; font-size: 10px; text-transform: uppercase; }
    td span { color: #64748B; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #F1F5F9; font-weight: 700; white-space: nowrap; }
    .badge.good { color: #166534; background: #DCFCE7; }
    .badge.warn { color: #92400E; background: #FEF3C7; }
    .badge.bad { color: #9F1239; background: #FFE4E6; }
    .badge.neutral { color: #475569; }
    .action-card { border-left: 5px solid var(--primary); }
    li { margin-bottom: 8px; }
    code { background: #F1F5F9; border-radius: 4px; padding: 2px 4px; }
    @media (max-width: 900px) { .repo-card, .score-layout, .pillar-grid { grid-template-columns: 1fr; } body { padding: 14px; } }
    @media print { body { padding: 0; background: white; } .page { max-width: none; } .toolbar { display: none; } .report-card { box-shadow: none; } }
  </style>
</head>
<body>
  <main class="page">
    <section class="report-card cover">
      <span class="eyebrow">GitSuccess Report</span>
      <h1>Repository Health Report</h1>
      <p>${escapeHtml(meta.fullName)} · erstellt am ${escapeHtml(createdAt)}</p>
      <p>Dieser Bericht übernimmt die Struktur des Dashboards und ergänzt sie um konkrete Handlungsempfehlungen für Repository-Besitzer.</p>
      <div class="toolbar">
        <button type="button" onclick="window.print()">PDF speichern / drucken</button>
        <button class="secondary" type="button" onclick="window.close()">Fenster schließen</button>
      </div>
    </section>
    ${renderRepoCard(meta)}
    ${renderScoreBlock(state.scores.overall)}
    ${renderDocumentationSection(meta)}
    ${renderKpiSection()}
    ${renderPrioritySection()}
    ${renderApiSection()}
  </main>
</body>
</html>`;
  }

  window.openReportForPdf = function openReportForPdf() {
    if (!window.state || !state.meta) {
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
