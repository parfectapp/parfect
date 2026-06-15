/* ============ Avatar Stats, Parfect Trainer (+Tracker), Social ============ */

/* ---------- Avatar Stats ---------- */
function vStats() {
  const rounds = myRounds();
  const agg = Stats.aggregate(rounds);
  if (!agg) {
    return `<div class="sec-h"><h2>Avatar Stats</h2></div>
      <div class="card empty"><div class="e-ico">📊</div><h3>Sin datos todavía</h3>
      <p>Registra rondas para construir tu avatar de jugador.</p>
      <button class="btn primary" data-act="quick-round">Registrar ronda</button></div>`;
  }
  const radar = Stats.radarOf(agg);
  const mt = agg.missTee, ma = agg.missApp;
  const teeTot = mt.izq + mt.der + mt.penal || 1;
  const appTot = ma.corto + ma.largo + ma.izq + ma.der || 1;
  const bands = [['0-2', '0–2 m'], ['2-5', '2–5 m'], ['5-10', '5–10 m'], ['10+', '+10 m']];

  return `<div class="sec-h"><h2>Avatar Stats</h2><span class="small muted">${agg.rounds} rondas</span></div>

    <div class="grid2">
      ${statCard(agg.avgScore18.toFixed(1), 'Score promedio (18)', Stats.clamp(((110 - agg.avgScore18) / 40) * 100, 0, 100))}
      ${statCard(agg.bestScore != null ? String(agg.bestScore) : fmtToPar(agg.bestToPar), 'Mejor ronda', 100)}
    </div>

    <div class="card">
      <span class="label">Perfil de habilidades</span>
      <div class="radar-wrap">${radarSVG(radar.labels, radar.values)}</div>
    </div>

    <div class="card">
      <span class="label">Salida · ${agg.fwPct.toFixed(0)}% fairways</span>
      <div class="bar"><i style="width:${agg.fwPct}%"></i></div>
      <p class="note" style="margin-bottom:2px">Patrón de fallo del tee</p>
      ${mbar('← Izq', (mt.izq / teeTot) * 100, String(mt.izq))}
      ${mbar('Der →', (mt.der / teeTot) * 100, String(mt.der))}
      ${mbar('Penal', (mt.penal / teeTot) * 100, String(mt.penal))}
    </div>

    <div class="card">
      <span class="label">Approach · ${agg.girPct.toFixed(0)}% GIR</span>
      <div class="bar"><i style="width:${agg.girPct}%"></i></div>
      <p class="note" style="margin-bottom:2px">Dónde fallas los greens</p>
      ${mbar('Corto', (ma.corto / appTot) * 100, String(ma.corto))}
      ${mbar('Largo', (ma.largo / appTot) * 100, String(ma.largo))}
      ${mbar('← Izq', (ma.izq / appTot) * 100, String(ma.izq))}
      ${mbar('Der →', (ma.der / appTot) * 100, String(ma.der))}
    </div>

    <div class="card">
      <span class="label">Juego corto · ${agg.scrPct.toFixed(0)}% up/down</span>
      <div class="bar"><i style="width:${agg.scrPct}%"></i></div>
      <p class="note">% de veces que salvas el par cuando fallas el green.</p>
    </div>

    <div class="card">
      <span class="label">Putting · ${agg.putts18.toFixed(1)} putts/ronda</span>
      <div class="grid2" style="margin-top:4px">
        <div><div class="stat-num" style="font-size:24px">${agg.threePct.toFixed(0)}%</div><div class="stat-cap">3-putts</div></div>
        <div><div class="stat-num" style="font-size:24px">${agg.puttsPerGir.toFixed(2)}</div><div class="stat-cap">Putts por GIR</div></div>
      </div>
      <p class="note" style="margin-bottom:2px">1-putt % por distancia del primer putt</p>
      ${bands.map(([k, lab]) => {
        const b = agg.puttsByDist[k];
        const p = b.n ? (b.one / b.n) * 100 : 0;
        return mbar(lab, p, b.n ? p.toFixed(0) + '%' : '—');
      }).join('')}
    </div>`;
}

/* ---------- Parfect Trainer ---------- */
function vTrainer() {
  const tab = V.trainerTab || 'diag';
  const body = tab === 'diag' ? vDiag() : tab === 'drills' ? vDrillsLibrary() : vTracker();
  return `<div class="sec-h"><h2>Parfect Trainer</h2></div>
    <div class="tabs">
      <button class="tab ${tab === 'diag' ? 'on' : ''}" data-act="trainer-tab" data-t="diag">Diagnóstico</button>
      <button class="tab ${tab === 'drills' ? 'on' : ''}" data-act="trainer-tab" data-t="drills">Drills</button>
      <button class="tab ${tab === 'tracker' ? 'on' : ''}" data-act="trainer-tab" data-t="tracker">Tracker</button>
    </div>
    ${body}`;
}

function vDiag() {
  const agg = Stats.aggregate(myRounds());
  if (!agg) {
    return `<div class="card empty"><div class="e-ico">🧠</div><h3>La IA necesita datos</h3>
      <p>Registra al menos una ronda y Parfect Trainer encontrará dónde se van tus golpes.</p>
      <button class="btn primary" data-act="quick-round">Registrar ronda</button></div>`;
  }
  if (V.diagBusy) {
    return `<div class="card empty"><div class="e-ico">🧠</div><h3>Analizando tus patrones…</h3>
      <p>Correlacionando ${agg.holesPlayed} hoyos, ${agg.rounds} rondas y 12+ métricas.</p></div>`;
  }
  if (!V.diag) {
    return `<div class="card empty"><div class="e-ico">🧠</div><h3>Diagnóstico de causa raíz</h3>
      <p>La IA cruza tus ${agg.rounds} rondas (${agg.holesPlayed} hoyos) para detectar exactamente dónde se van los golpes de más — y qué practicar.</p>
      <button class="btn primary" data-act="diagnose">Generar diagnóstico IA</button></div>`;
  }
  const d = V.diag;
  const warn = d.readiness === 'low'
    ? `<p class="note">⚠️ Con menos de 3 rondas el diagnóstico es preliminar. Cada ronda nueva lo afina.</p>` : '';
  return warn + d.focus.map((f, i) => `
    <div class="card">
      <span class="prio ${i > 0 ? 'p2' : ''}">${i === 0 ? 'Prioridad 1 · enfoque' : `Prioridad ${i + 1}`}</span>
      <h3 style="margin-top:12px;font-size:17px;font-weight:900">${esc(f.titulo)}</h3>
      <p class="small muted" style="margin-top:4px">~${f.lost.toFixed(1)} golpes/ronda en juego</p>
      <p style="font-size:14px;margin-top:10px">${esc(f.diag)}</p>
      ${i < 2 ? `
        <p class="label" style="margin-top:16px">Prescripción de drills</p>
        ${f.drills.map(dr => `<div class="drill"><b>${esc(dr.name)}</b>
          ${drillArt(f.key)}
          <p>${esc(dr.desc)}</p>
          <div class="d-meta"><span>📋 ${esc(dr.dose)}</span><span>🎯 ${esc(dr.metric)}</span></div></div>`).join('')}
      ` : ''}
      <p class="label" style="margin-top:14px">Estrategia de campo</p>
      ${f.tips.map(t => `<p class="tip">${esc(t)}</p>`).join('')}
    </div>`).join('') +
    `<button class="btn ghost" data-act="diagnose">↻ Recalcular diagnóstico</button>
     <p class="note">Registra los drills en Parfect Tracker para medir tu progreso real.</p>`;
}

/* ---------- Biblioteca de drills (50) ---------- */
function vDrillsLibrary() {
  const cat = V.drillCat || 'fw';
  const meta = DRILL_CATS.find(c => c.id === cat);
  const list = DRILL_LIBRARY.filter(d => d.cat === cat);
  const chips = DRILL_CATS.map(c => {
    const n = DRILL_LIBRARY.filter(d => d.cat === c.id).length;
    return `<button class="tab ${c.id === cat ? 'on' : ''}" data-act="drill-cat" data-c="${c.id}">${esc(c.label)} <span class="muted">${n}</span></button>`;
  }).join('');
  const cards = list.map(d => `<div class="drill">
    <b>${esc(d.name)}</b>
    <p>${esc(d.desc)}</p>
    <div class="d-meta"><span>📋 ${esc(d.dose)}</span><span>🎯 ${esc(d.metric)}</span></div>
  </div>`).join('');
  return `<p class="note" style="margin-top:14px">${DRILL_LIBRARY.length} ejercicios para cada parte de tu juego. Elige una categoría.</p>
    <div class="tabs" style="flex-wrap:wrap">${chips}</div>
    <div class="card" style="margin-top:14px">
      <span class="label">${esc(meta.label)} · ${list.length} drills</span>
      ${drillArt(meta.art)}
      ${cards}
    </div>`;
}

/* ---------- Parfect Tracker (personalizado por palos) ---------- */
const CLUBS = [
  { id: 'dr', name: 'Driver', group: 'largo', gap: 40 },
  { id: 'w3', name: 'Madera 3', group: 'largo', gap: 40 },
  { id: 'w5', name: 'Madera 5', group: 'largo', gap: 40 },
  { id: 'w7', name: 'Madera 7', group: 'largo', gap: 40 },
  { id: 'h4', name: 'Híbrido 4', group: 'largo', gap: 40 },
  { id: 'h5', name: 'Híbrido 5', group: 'largo', gap: 40 },
  { id: 'h6', name: 'Híbrido 6', group: 'largo', gap: 40 },
  { id: 'i3', name: 'Fierro 3', group: 'hierros', gap: 40 },
  { id: 'i4', name: 'Fierro 4', group: 'hierros', gap: 40 },
  { id: 'i5', name: 'Fierro 5', group: 'hierros', gap: 40 },
  { id: 'i6', name: 'Fierro 6', group: 'hierros', gap: 40 },
  { id: 'i7', name: 'Fierro 7', group: 'hierros', gap: 40 },
  { id: 'i8', name: 'Fierro 8', group: 'hierros', gap: 40 },
  { id: 'i9', name: 'Fierro 9', group: 'hierros', gap: 40 },
  { id: 'pw', name: 'Pitching Wedge', group: 'wedges', gap: 20 },
  { id: 'w50', name: 'Wedge 50', group: 'wedges', gap: 20 },
  { id: 'w52', name: 'Wedge 52', group: 'wedges', gap: 20 },
  { id: 'w54', name: 'Wedge 54', group: 'wedges', gap: 20 },
  { id: 'w56', name: 'Wedge 56', group: 'wedges', gap: 20 },
  { id: 'w58', name: 'Wedge 58', group: 'wedges', gap: 20 },
  { id: 'w60', name: 'Wedge 60', group: 'wedges', gap: 20 },
];
const CLUB_DEFAULT = { dr: 250, w3: 230, w5: 215, w7: 200, h4: 210, h5: 200, h6: 190, i3: 200, i4: 190, i5: 180, i6: 170, i7: 160, i8: 150, i9: 140, pw: 130, w50: 115, w52: 105, w54: 95, w56: 85, w58: 78, w60: 70 };
const DEFAULT_BAG = ['dr', 'w3', 'h4', 'i5', 'i6', 'i7', 'i8', 'i9', 'pw', 'w52', 'w56', 'w60'];
const GROUP_META = { largo: { cat: 'Juego largo', icon: '🏌️' }, hierros: { cat: 'Hierros', icon: '🎯' }, wedges: { cat: 'Wedges', icon: '⛳' } };

const APPROACH_GROUP = { cat: 'Approach', icon: '🟢', drills: [
  { name: 'Up & down 40 yds', area: 'Approach', goal: 'up & downs aleatorios', target: 7, timer: 20 },
  { name: 'Up & down 30 yds', area: 'Approach', goal: 'up & downs aleatorios', target: 7, timer: 20 },
  { name: 'Up & down 10 yds', area: 'Approach', goal: 'up & downs aleatorios', target: 7, timer: 20 },
] };
const PUTT_GROUP = { cat: 'Putt', icon: '🥅', drills: [
  { name: 'Putt 3 ft', area: 'Putt', goal: 'seguidos', target: 10, timer: 20 },
  { name: 'Putt 5 ft', area: 'Putt', goal: 'seguidos', target: 10, timer: 20 },
  { name: 'Putt 7 ft', area: 'Putt', goal: '', target: 10, timer: 20 },
  { name: 'Putt 10 ft', area: 'Putt', goal: '', target: 10, timer: 20 },
  { name: 'Putt 15 ft', area: 'Putt', goal: 'dejándola a 3 ft (gimme)', target: 10, timer: 20 },
  { name: 'Putt 20 ft', area: 'Putt', goal: 'a distancia de dada', target: 10, timer: 20 },
  { name: 'Putt 30 ft', area: 'Putt', goal: 'a distancia de dada', target: 10, timer: 20 },
] };

/* Construye el plan del jugador según los palos que tenga (o una bolsa por defecto) */
function trackerPlan(u) {
  const clubs = (u && u.clubs) || {};
  const personalized = Object.keys(clubs).some(k => clubs[k] != null);
  const inBag = c => personalized ? clubs[c.id] != null : DEFAULT_BAG.includes(c.id);
  const carry = c => (clubs[c.id] != null ? clubs[c.id] : CLUB_DEFAULT[c.id]);
  const drillFor = c => ({ name: c.name, area: GROUP_META[c.group].cat, goal: `${carry(c)} yds, hueco de ${c.gap} yds`, target: 7, timer: 20 });
  const groups = [];
  for (const g of ['largo', 'hierros', 'wedges']) {
    const cs = CLUBS.filter(c => c.group === g && inBag(c));
    if (cs.length) groups.push({ ...GROUP_META[g], drills: cs.map(drillFor) });
  }
  groups.push(APPROACH_GROUP, PUTT_GROUP);
  return { groups, personalized };
}

function vTracker() {
  return `<div class="sec-h"><h2>Parfect Tracker</h2><span class="small muted">tu práctica, medida</span></div>
    ${vTrackerPlan()}
    ${V.drillLog ? vDrillSheet() : ''}`;
}

function vTrackerPlan() {
  const u = cur();
  const plan = trackerPlan(u);
  const list = myPractices();
  const lastOf = name => [...list].reverse().find(p => p.drill === name);
  const banner = plan.personalized
    ? `<p class="note" style="margin-top:14px">Plan basado en tus palos. <button class="lk" data-act="go-clubs">Editar palos →</button></p>`
    : `<div class="card" style="margin-top:14px"><span class="label">Personaliza tu plan 🎒</span>
        <p class="note" style="margin-top:2px">Carga tus palos y distancias (carry) y el plan se arma a tu medida.</p>
        <button class="btn primary" data-act="go-clubs">Cargar mis palos</button></div>`;
  const cats = plan.groups.map(c => {
    const rows = c.drills.map(d => {
      const last = lastOf(d.name);
      const pct = last ? Math.round((last.hits / last.attempts) * 100) : 0;
      const hit = last && last.hits >= d.target;
      return `<button class="row" data-act="drill-open" data-name="${esc(d.name)}" data-target="${d.target}" data-area="${esc(d.area || c.cat)}" data-goal="${esc(d.goal || '')}" data-timer="${d.timer}">
        <div class="r-main"><b>${esc(d.name)}${hit ? ' ✓' : ''}</b><span>${d.target}/${d.target}${d.goal ? ' · ' + esc(d.goal) : ''} · ${d.timer} min</span></div>
        <div class="r-side">${last ? `<b>${last.hits}/${last.attempts}</b><span>${pct}%</span>` : `<span class="muted small">registrar →</span>`}</div>
      </button>`;
    }).join('');
    return `<div class="sec-h" style="margin-top:20px"><h2 style="font-size:16px">${c.icon} ${esc(c.cat)}</h2></div>${rows}`;
  }).join('');
  return `${banner}<p class="note">Toca un drill para registrar tu resultado. La meta es completar la cuenta en 20 min.</p>${cats}`;
}

function vDrillSheet() {
  const d = V.drillLog;
  return `<div class="overlay" data-act="drill-close"><div class="sheet" data-act="noop">
    <div class="grab"></div>
    <h2>${esc(d.name)}</h2>
    <p class="auth-sub">${d.goal ? esc(d.goal) + ' · ' : ''}${d.timer} min · meta ${d.target}/${d.target}</p>
    <div class="score-row" style="margin-top:20px">
      <div class="sc-val"><span class="sc-num">${d.hits}</span><span class="sc-rel">/ ${d.target} aciertos</span></div>
      <div class="stepper">
        <button data-act="drill-hit" data-d="-1">−</button>
        <button data-act="drill-hit" data-d="1">+</button>
      </div>
    </div>
    <button class="btn primary" data-act="drill-save">Guardar resultado</button>
    <button class="btn" data-act="drill-close">Cancelar</button>
  </div></div>`;
}

/* ---------- Editor de palos (perfil) ---------- */
function vClubs() {
  const u = cur();
  const clubs = u.clubs || {};
  const groupName = { largo: 'Maderas e híbridos', hierros: 'Hierros', wedges: 'Wedges' };
  const sections = ['largo', 'hierros', 'wedges'].map(g => {
    const rows = CLUBS.filter(c => c.group === g).map(c => `
      <div class="club-row">
        <label>${esc(c.name)}</label>
        <div class="club-in">
          <input id="club-${c.id}" type="number" inputmode="numeric" placeholder="${CLUB_DEFAULT[c.id]}" value="${clubs[c.id] != null ? clubs[c.id] : ''}">
          <span>yds</span>
        </div>
      </div>`).join('');
    return `<div class="card"><span class="label">${groupName[g]}</span>${rows}</div>`;
  }).join('');
  return `<button class="auth-back" data-act="nav" data-view="trainer">← Trainer</button>
    <h1 class="auth-h">Mis palos</h1>
    <p class="auth-sub">Escribe el carry (cuánto vuela) de cada palo que tengas. Deja en blanco los que no uses. Tu plan de práctica se arma con estos números.</p>
    ${sections}
    <button class="btn primary" data-act="save-clubs">Guardar mis palos</button>
    <button class="btn" data-act="nav" data-view="trainer">Cancelar</button>`;
}

/* ---------- Social ---------- */
function vSocial() {
  const u = cur();
  const players = S.users.map(p => {
    const agg = Stats.aggregate(S.rounds.filter(r => r.userId === p.id));
    return { p, agg };
  }).sort((a, b) => (a.agg ? a.agg.avgToPar : 99) - (b.agg ? b.agg.avgToPar : 99));

  const roundFeed = S.rounds.filter(r => !r.partyId).map(r => {
    const owner = S.users.find(x => x.id === r.userId);
    const s = Stats.roundStats(r);
    const fwP = s.fwTot ? Math.round((s.fw / s.fwTot) * 100) : 0;
    return { date: r.date, html: `<div class="row">
      <div class="r-main"><b>${esc(owner ? owner.name : '—')}${owner && owner.id === u.id ? ' (tú)' : ''} jugó ${esc(r.course)}</b>
      <span>${fmtDate(r.date)} · FW ${fwP}% · ${s.putts} putts</span></div>
      <div class="r-side"><b>${s.score}</b><span>${fmtToPar(s.toPar)}</span></div>
    </div>` };
  });

  const act = activeParty();
  const myActive = act && (act.hostUserId === u.id || act.players.some(x => x.userId === u.id));
  const partyFeed = S.parties.filter(p => p.status === 'done').map(p => {
    const ms = p.games && p.games.match ? Party.matchStatus(p) : null;
    let winName = '—';
    if (ms) { winName = ms.leaderWon > ms.runnerWon ? plName(p, ms.leader).split(' ')[0] : 'Empate'; }
    else { const st = Party.standings(p).filter(r => r.holes); winName = st.length ? st[0].name.split(' ')[0] : '—'; }
    return { date: p.date, html: `<button class="row" data-act="party-open" data-id="${p.id}">
      <div class="r-main"><b>🎉 Party en ${esc(p.course)}</b>
      <span>${fmtDate(p.date)} · ${p.players.length} jugadores · código ${esc(p.code)}</span></div>
      <div class="r-side"><b>${esc(winName)}</b><span>ganador</span></div>
    </button>` };
  });
  const feed = [...partyFeed, ...roundFeed].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14).map(x => x.html).join('');

  return `<div class="sec-h"><h2>Social</h2></div>
    <div class="card">
      <span class="label">🎉 Parfect Party · juega con amigos</span>
      <p class="small muted" style="margin-top:2px">Medal o Match play. Crea la party, comparte el código y cada quien anota desde su celular.</p>
      ${myActive ? `<button class="btn primary" data-act="party-resume">Continuar party ${esc(act.code)} ${act.status === 'live' ? `· hoyo ${act.idx + 1}` : '· lobby'}</button>`
        : `<button class="btn primary" data-act="party-new">Crear party</button>`}
      <div class="join-row" style="margin-top:12px">
        <input id="join-code" placeholder="Código (ej. K7M2)" maxlength="4" style="text-transform:uppercase">
        <button class="btn sm ghost" data-act="party-join" ${V.joining ? 'disabled' : ''}>${V.joining ? 'Buscando…' : 'Unirse'}</button>
      </div>
      ${V.err ? `<p class="form-err">${esc(V.err)}</p>` : ''}
    </div>
    <div class="card">
      <span class="label">Leaderboard · este dispositivo</span>
      ${players.map((x, i) => `<div class="row" style="border:none;background:transparent;padding:10px 0;margin-top:0">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="rank">${i + 1}</span>
          <div class="r-main"><b>${esc(x.p.name)}${x.p.id === u.id ? ' (tú)' : ''}</b>
          <span>HCP ${fmtHcp(x.p.hcp)} · ${x.agg ? x.agg.rounds + ' rondas' : 'sin rondas'}</span></div>
        </div>
        <div class="r-side"><b>${x.agg ? fmtToPar(Math.round(x.agg.avgToPar)) : '—'}</b><span>prom/18</span></div>
      </div>`).join('')}
      <p class="note">Crea más cuentas en este dispositivo para competir cara a cara.</p>
    </div>
    <div class="sec-h"><h2>Actividad</h2></div>
    ${feed || `<div class="card empty"><div class="e-ico">🏆</div><h3>Nada por aquí aún</h3><p>Las rondas guardadas aparecen en este feed.</p></div>`}`;
}
