/* ============ Shell (header + nav), Dashboard, Perfil ============ */

function navKeyOf(view) {
  if (['ronda', 'nueva', 'detalle'].includes(view)) return 'ronda';
  if (['trainer', 'clubs'].includes(view)) return 'trainer';
  if (['social', 'friend'].includes(view)) return 'social';
  if (view === 'strategy') return 'inicio';
  return 'inicio';
}

function vShell(content) {
  const u = cur();
  const k = navKeyOf(V.view);
  const item = (key, label) =>
    `<button class="nav-item ${k === key ? 'on' : ''}" data-act="nav" data-view="${key}">${ICONS[key]}<span>${label}</span></button>`;
  return `<div class="shell">
    <div class="hdr">
      <span style="width:40px"></span>
      <span class="logo-word">${logoMark(16)} PARFECT</span>
      <button class="avatar-btn" data-act="profile-open" aria-label="Perfil">${esc(initials(u.name))}</button>
    </div>
    <div class="fade-in">${content}</div>
    <nav class="nav">
      ${item('inicio', 'Inicio')}
      ${item('ronda', 'Ronda')}
      <button class="nav-p" data-act="quick-round" aria-label="Iniciar ronda">P</button>
      ${item('trainer', 'Trainer')}
      ${item('social', 'Social')}
    </nav>
    ${V.profileOpen ? vProfile() : ''}
  </div>`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

/* Anillo animado de una métrica (estilo Apple Fitness) */
function ringStat(value, label, pct, act) {
  const C = 264, p = Math.max(0, Math.min(100, pct)), off = (C * (1 - p / 100)).toFixed(1);
  return `<button class="ring-card"${act ? ` data-act="${act}"` : ''} aria-label="${esc(label)} ${esc(value)}">
    <svg viewBox="0 0 104 104" class="ring-svg" aria-hidden="true">
      <circle cx="52" cy="52" r="42" fill="none" stroke="var(--lime-dim)" stroke-width="9"/>
      <circle cx="52" cy="52" r="42" fill="none" stroke="var(--lime)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 52 52)">
        <animate attributeName="stroke-dashoffset" values="${C};${off}" dur="1.1s" begin="0.1s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1"/>
      </circle>
      <text x="52" y="50" text-anchor="middle" class="ring-val">${esc(value)}</text>
      <text x="52" y="68" text-anchor="middle" class="ring-lab">${esc(label)}</text>
    </svg>
  </button>`;
}

function vDashboard() {
  const u = cur();
  const rounds = myRounds();
  const agg = Stats.aggregate(rounds);
  const head = `<div class="greet">
    <p class="hi">${greeting()}</p>
    <h1>Hola, ${esc(u.name.split(' ')[0])}!</h1>
    <p class="hcp">HCP: ${fmtHcp(u.hcp)} · Meta ${fmtHcp(u.goal)}</p>
  </div>`;

  if (!agg) {
    return head + `<div class="card empty">
      <div class="e-ico">⛳</div>
      <h3>Tu perfil de jugador empieza aquí</h3>
      <p>Registra tu primera ronda — o carga datos de ejemplo para ver PARFECT en acción.</p>
      <button class="btn primary" data-act="quick-round">${logoMark(15)} Registrar mi primera ronda</button>
      <button class="btn ghost" data-act="seed-demo">Cargar datos de ejemplo</button>
    </div>`;
  }

  const cont = S.active && S.active.userId === u.id;
  const startBtn = `<button class="btn primary" data-act="quick-round">${logoMark(15)} ${cont ? `Continuar ronda · hoyo ${S.active.idx + 1}` : 'Iniciar ronda'}</button>`;

  const puttQ = Stats.clamp((38 - agg.putts18) / 11 * 100, 0, 100);
  const rings = `<div class="ring-grid">
    ${ringStat(agg.fwPct.toFixed(0) + '%', 'Fairways', agg.fwPct, 'go-stats')}
    ${ringStat(agg.girPct.toFixed(0) + '%', 'GIR', agg.girPct, 'go-stats')}
    ${ringStat(agg.scrPct.toFixed(0) + '%', 'Up & down', agg.scrPct, 'go-stats')}
    ${ringStat(agg.putts18.toFixed(0), 'Putts', puttQ, 'go-stats')}
  </div>`;

  const recent = rounds.slice(0, 5).map(r => {
    const s = Stats.roundStats(r);
    const cls = s.toPar <= 0 ? 'good' : s.toPar <= 5 ? 'ok' : 'bad';
    return `<span class="form-pill ${cls}">${fmtToPar(s.toPar)}</span>`;
  }).join('');
  const forma = `<div class="card">
    <span class="label">Forma reciente</span>
    <div class="form-row">${recent}</div>
    <p class="note" style="margin-bottom:0">Tus últimas ${Math.min(5, rounds.length)} rondas (vs par). Toca un anillo para ver tu avatar de stats.</p>
  </div>`;

  const f = (Trainer.analyze(agg, u).focus || [])[0];
  const tip = f ? `<button class="card tip-card" data-act="go-diag">
    <span class="label">🧠 Tu prioridad ahora</span>
    <h3 class="tip-h">${esc(f.titulo)}</h3>
    <p class="note" style="margin-bottom:0">~${f.lost.toFixed(1)} golpes/ronda en juego · toca para tu diagnóstico y drills →</p>
  </button>` : '';

  return head + startBtn + rings + forma + tip;
}

/* ============ Perfil (sheet) ============ */
function vProfile() {
  const u = cur();
  return `<div class="overlay" data-act="profile-close">
    <div class="sheet" data-act="noop">
      <div class="grab"></div>
      <h2>Tu perfil</h2>
      <div class="field"><label>Nombre</label><input id="p-name" value="${esc(u.name)}"></div>
      <div class="field-row">
        <div class="field"><label>Hándicap</label><input id="p-hcp" type="number" step="1" value="${esc(u.hcp)}"></div>
        <div class="field"><label>Meta</label><input id="p-goal" type="number" step="1" value="${esc(u.goal)}"></div>
      </div>
      <button class="btn primary" data-act="profile-save">Guardar cambios</button>
      <button class="btn" data-act="go-clubs">🎒 Mis palos y distancias</button>
      <button class="btn" data-act="go-trofeos">🏆 Ver mis trofeos</button>
      <button class="btn ghost" data-act="seed-demo">Cargar datos de ejemplo</button>
      <button class="btn danger" data-act="wipe-mine">${V.wipeArm ? '¿Seguro? Toca otra vez para borrar tus rondas' : 'Borrar mis rondas y prácticas'}</button>
      <button class="btn" data-act="logout">Cerrar sesión</button>
      <p class="note">Cuenta local: ${esc(u.email)} · Tus datos viven solo en este dispositivo.</p>
    </div>
  </div>`;
}
