/* ============================================================
   Les Boys - Coupe du Monde 2026 - Logique de l'application
   ============================================================ */

const STORAGE_KEY = 'lesboys_cdm2026_v2';

// ============================================================
// State
// ============================================================
let currentUser = null;
let allUsers    = [];
let watchParties = createEmptyWatchParties();
let activeTab    = 'home';
let activeStagTab = 'groups';
let teamsFilter  = 'ALL';
let teamsSearch  = '';
let teamsSort    = 'prob';
let openTeamModal = null;

// ============================================================
// Watch Party data structure
// ============================================================
function createEmptyWatchParties() {
  return {
    game1: { host: null, attendees: [] },  // Uruguay vs Espagne  27 juin 15h
    game2: { host: null, attendees: [] },  // Croatie vs Ghana    27 juin 18h
    game3: { host: null, attendees: [] },  // Colombie vs Portugal 28 juin 15h
  };
}

// ============================================================
// Storage helpers
// ============================================================
function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { users: [], currentUserId: null, watchParties: createEmptyWatchParties() };
    const d = JSON.parse(raw);
    if (!d.watchParties) d.watchParties = createEmptyWatchParties();
    return d;
  } catch { return { users: [], currentUserId: null, watchParties: createEmptyWatchParties() }; }
}

function saveStorage(pushCloud = true) {
  const data = {
    users: allUsers,
    currentUserId: currentUser ? currentUser.id : null,
    watchParties,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (pushCloud) cloudPush();
}

// ============================================================
// Cloud Sync (JSONBin.io)
// ============================================================
const CLOUD_ENABLED = typeof CLOUD_BIN_ID !== 'undefined' && CLOUD_BIN_ID !== '';
const CLOUD_BASE    = 'https://api.jsonbin.io/v3/b';
let   _syncBusy     = false;

async function _cloudFetch() {
  const r = await fetch(`${CLOUD_BASE}/${CLOUD_BIN_ID}/latest`, {
    headers: { 'X-Master-Key': CLOUD_API_KEY }
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const rec = (await r.json()).record ?? {};
  return { users: rec.users ?? [], watchParties: rec.watchParties ?? createEmptyWatchParties() };
}

async function cloudPull() {
  if (!CLOUD_ENABLED) return;
  try {
    const { users: remoteUsers, watchParties: remoteWP } = await _cloudFetch();
    let changed = false;

    // --- merge users ---
    for (const ru of remoteUsers) {
      if (!ru.predictions) ru.predictions = createEmptyPredictions();
      if (!ru.predictions.third) ru.predictions.third = [];
      const idx = allUsers.findIndex(u => u.id === ru.id);
      if (idx < 0) { allUsers.push(ru); changed = true; }
      else if (ru.id !== currentUser?.id) { allUsers[idx] = ru; changed = true; }
    }

    // --- merge watchParties (remote wins unless nothing changed remotely) ---
    for (const gId of Object.keys(createEmptyWatchParties())) {
      const r = remoteWP[gId] || { host: null, attendees: [] };
      const l = watchParties[gId] || { host: null, attendees: [] };
      if (JSON.stringify(r) !== JSON.stringify(l)) {
        watchParties[gId] = r;
        changed = true;
      }
    }

    if (changed) {
      saveStorage(false);
      const loginList = document.getElementById('existing-users-list');
      if (loginList) renderExistingUsers();
      if (activeTab) renderTab(activeTab);
    }
    setSyncBadge('ok');
  } catch { setSyncBadge('error'); }
}

async function cloudPush() {
  if (!CLOUD_ENABLED || _syncBusy) return;
  _syncBusy = true;
  setSyncBadge('syncing');
  try {
    const { users: remoteUsers, watchParties: remoteWP } = await _cloudFetch();

    // merge users
    const mergedUsers = [...remoteUsers];
    for (const u of allUsers) {
      const i = mergedUsers.findIndex(x => x.id === u.id);
      i >= 0 ? (mergedUsers[i] = u) : mergedUsers.push(u);
    }

    // merge watchParties: union of attendees, non-null host wins (local takes priority)
    const mergedWP = {};
    for (const gId of Object.keys(createEmptyWatchParties())) {
      const rem = remoteWP[gId] || { host: null, attendees: [] };
      const loc = watchParties[gId] || { host: null, attendees: [] };
      mergedWP[gId] = {
        host: loc.host ?? rem.host,
        attendees: [...new Set([...rem.attendees, ...loc.attendees])],
      };
    }

    const r = await fetch(`${CLOUD_BASE}/${CLOUD_BIN_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': CLOUD_API_KEY },
      body: JSON.stringify({ users: mergedUsers, watchParties: mergedWP }),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    setSyncBadge('ok');
  } catch { setSyncBadge('error'); }
  finally { _syncBusy = false; }
}

function setSyncBadge(state) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  if (!CLOUD_ENABLED) return;
  const map = {
    syncing: ['sync-ing', '⟳', 'Synchronisation en cours…'],
    ok:      ['sync-ok', '✓', 'Tous les pronostics synchronisés'],
    error:   ['sync-err', '!', 'Échec de la synchro — modifications sauvegardées localement'],
  };
  const [cls, icon, tip] = map[state];
  el.className = `sync-badge ${cls}`;
  el.textContent = icon;
  el.title = tip;
  if (state === 'ok') {
    setTimeout(() => {
      if (el.textContent === '✓') {
        el.className = 'sync-badge sync-idle';
        el.textContent = '☁';
        el.title = 'Synchronisation nuage active';
      }
    }, 2500);
  }
}

// Pull on window focus and every 60 s
document.addEventListener('visibilitychange', () => { if (!document.hidden) cloudPull(); });
setInterval(() => { if (!document.hidden) cloudPull(); }, 60000);

function createEmptyPredictions() {
  return {
    champion: null,
    groups: {},      // { A: { first: teamId, second: teamId }, ... }
    thirdSlots: {},  // { '3rd-1': teamId, ..., '3rd-8': teamId }
    r32: {},         // { R32_1: teamId, ... }
    r16: {},
    qf: {},
    sf: {},
    thirdplace: null,
    final: null,
  };
}

function newUser(name) {
  const colorIdx = allUsers.length % AVATAR_COLORS.length;
  return {
    id: Date.now().toString(),
    name,
    color1: AVATAR_COLORS[colorIdx][0],
    color2: AVATAR_COLORS[colorIdx][1],
    predictions: createEmptyPredictions(),
    createdAt: Date.now(),
  };
}

// ============================================================
// Initialisation
// ============================================================
document.addEventListener('DOMContentLoaded', init);

function init() {
  const data = loadStorage();
  allUsers    = data.users || [];
  watchParties = data.watchParties || createEmptyWatchParties();
  currentUser = allUsers.find(u => u.id === data.currentUserId) || null;

  // Migrate predictions
  allUsers.forEach(u => {
    if (!u.predictions) u.predictions = createEmptyPredictions();
    if (!u.predictions.thirdSlots) u.predictions.thirdSlots = {};
    if (u.predictions.thirdplace === undefined) u.predictions.thirdplace = null;
    if (u.predictions.final === undefined) u.predictions.final = null;
  });

  if (currentUser) {
    showMainApp();
  } else {
    showLoginScreen();
  }
  cloudPull(); // merge remote users in background (updates login list & leaderboard)
}

// ============================================================
// Login / Register
// ============================================================
function showLoginScreen() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('main-app').classList.add('hidden');
  renderExistingUsers();
}

function showMainApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  updateHeaderUser();
  showTab('home');
}

function renderExistingUsers() {
  const container = document.getElementById('existing-users-list');
  if (!allUsers.length) {
    container.closest('.login-divider-section').classList.add('hidden');
    return;
  }
  container.closest('.login-divider-section').classList.remove('hidden');
  container.innerHTML = allUsers.map(u => `
    <button class="existing-user-btn" onclick="loginAsUser('${u.id}')">
      <div class="existing-user-avatar" style="background:linear-gradient(135deg,${u.color1},${u.color2})">
        ${u.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <div class="existing-user-name">${escHtml(u.name)}</div>
        <div class="existing-user-pick">${u.predictions.champion ? '🏆 ' + TEAMS[u.predictions.champion].flag + ' ' + TEAMS[u.predictions.champion].name : 'Aucun champion choisi'}</div>
      </div>
    </button>
  `).join('');
}

function loginAsUser(userId) {
  currentUser = allUsers.find(u => u.id === userId);
  if (!currentUser) return;
  saveStorage();
  showMainApp();
}

function handleRegister(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('register-name');
  const name = (nameInput ? nameInput.value : '').trim();
  if (!name) return;

  const existing = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    loginAsUser(existing.id);
    return;
  }

  currentUser = newUser(name);
  allUsers.push(currentUser);
  saveStorage();
  showMainApp();
}

// ============================================================
// Navigation
// ============================================================
function showTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  window.scrollTo(0, 0);
  renderTab(tab);
}

function renderTab(tab) {
  switch(tab) {
    case 'home': renderHome(); break;
    case 'teams': renderTeams(); break;
    case 'bracket': renderBracket(); break;
    case 'leaderboard': renderLeaderboard(); break;
    case 'coaches':    /* contenu statique dans le HTML */ break;
    case 'watchparty': renderWatchParties(); break;
  }
}

function updateHeaderUser() {
  if (!currentUser) return;
  document.getElementById('header-avatar').style.background = `linear-gradient(135deg,${currentUser.color1},${currentUser.color2})`;
  document.getElementById('header-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('header-user-name').textContent = currentUser.name;
}

// ============================================================
// Home Tab
// ============================================================
function renderHome() {
  const picks = currentUser.predictions;

  // Stats
  const completedPredictions = countCompletedPredictions(picks);
  document.getElementById('stat-participants').textContent = allUsers.length;
  document.getElementById('stat-teams').textContent = Object.keys(TEAMS).length;
  document.getElementById('stat-days').textContent = daysUntilKickoff();
  document.getElementById('stat-my-picks').textContent = completedPredictions.total;

  // My champion pick
  const pickSection = document.getElementById('my-champion-pick');
  if (picks.champion && TEAMS[picks.champion]) {
    const team = TEAMS[picks.champion];
    pickSection.innerHTML = `
      <div class="pick-display">
        <span class="pick-flag">${team.flag}</span>
        <div class="pick-info">
          <h3>${escHtml(team.name)}</h3>
          <div class="conf">${team.confederation} · FIFA Rank #${team.fifaRank}</div>
          <div class="prob-pill">🏆 ${team.probability}% win probability</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <button class="btn btn-ghost btn-sm" onclick="showTab('teams')">Change pick</button>
        </div>
      </div>
    `;
  } else {
    pickSection.innerHTML = `
      <div class="no-pick-placeholder" onclick="showTab('teams')">
        <span class="no-pick-icon">🤔</span>
        <div class="no-pick-text">
          <strong>Qui va gagner la Coupe du Monde 2026 ?</strong>
          Clique ici pour parcourir les équipes et placer ton pronostic de champion
        </div>
      </div>
    `;
  }

  // My bracket summary
  const bracketSummary = document.getElementById('my-bracket-summary');
  bracketSummary.innerHTML = `
    <div class="bracket-progress-rings" style="margin-top:0.75rem">
      ${renderProgressRing('Groupes', completedPredictions.groups, 12)}
      ${renderProgressRing('1/32 de finale', completedPredictions.r32, 16)}
      ${renderProgressRing('Huitièmes', completedPredictions.r16, 8)}
      ${renderProgressRing('Quarts', completedPredictions.qf, 4)}
      ${renderProgressRing('Demies', completedPredictions.sf, 2)}
      ${renderProgressRing('Finale', completedPredictions.final, 1)}
    </div>
    ${completedPredictions.total === 0 ? `
      <div style="margin-top:1rem">
        <button class="btn btn-secondary btn-sm" onclick="showTab('bracket')">Remplir mon tableau →</button>
      </div>
    ` : completedPredictions.total < 44 ? `
      <div style="margin-top:1rem">
        <button class="btn btn-secondary btn-sm" onclick="showTab('bracket')">Continuer à remplir le tableau →</button>
      </div>
    ` : `
      <div class="alert alert-success" style="margin-top:1rem">
        <span class="alert-icon">✅</span>
        Ton tableau est complet ! Bonne chance !
      </div>
    `}
  `;

  // Top picks leaderboard preview
  renderTopPicks();
}

function renderProgressRing(label, done, total) {
  return `
    <div class="progress-ring-item">
      <div class="progress-ring-value">${done}</div>
      <div class="progress-ring-total">/ ${total}</div>
      <div class="progress-ring-label">${label}</div>
    </div>
  `;
}

function renderTopPicks() {
  const container = document.getElementById('top-picks-container');
  const pickerCounts = {};
  allUsers.forEach(u => {
    if (u.predictions.champion) {
      pickerCounts[u.predictions.champion] = (pickerCounts[u.predictions.champion] || 0) + 1;
    }
  });
  const sorted = Object.entries(pickerCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);
  if (!sorted.length) {
    container.innerHTML = '<p class="text-muted text-sm">Aucun pronostic pour l\'instant. Sois le premier !</p>';
    return;
  }
  const max = sorted[0][1];
  container.innerHTML = sorted.map(([teamId, count], i) => {
    const team = TEAMS[teamId];
    const pct = Math.round(count / allUsers.length * 100);
    return `
      <div style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem 0;border-bottom:1px solid var(--border)">
        <span style="font-size:0.8rem;color:var(--text-dim);min-width:20px">${i+1}.</span>
        <span style="font-size:1.5rem">${team.flag}</span>
        <div style="flex:1">
          <div style="font-size:0.875rem;font-weight:600">${team.name}</div>
          <div style="height:4px;background:var(--bg);border-radius:2px;margin-top:0.3rem">
            <div style="height:100%;width:${(count/max)*100}%;background:linear-gradient(90deg,var(--accent),var(--accent-orange));border-radius:2px"></div>
          </div>
        </div>
        <span style="font-size:0.8rem;font-weight:700;color:var(--accent)">${count} pronostic${count>1?'s':''}</span>
      </div>
    `;
  }).join('');
}

function countCompletedPredictions(picks) {
  return {
    groups: Object.values(picks.groups || {}).filter(g => g.first && g.second).length,
    r32: Object.keys(picks.r32 || {}).length,
    r16: Object.keys(picks.r16 || {}).length,
    qf: Object.keys(picks.qf || {}).length,
    sf: Object.keys(picks.sf || {}).length,
    final: picks.final ? 1 : 0,
    get total() { return this.groups + this.r32 + this.r16 + this.qf + this.sf + this.final; }
  };
}

function daysUntilKickoff() {
  const kickoff = new Date('2026-06-11');
  const today = new Date();
  const diff = Math.ceil((kickoff - today) / (1000*60*60*24));
  return diff > 0 ? diff : 0;
}

// ============================================================
// Teams Tab
// ============================================================
function renderTeams() {
  renderTeamGrid();
}

function renderTeamGrid() {
  const container = document.getElementById('teams-grid-container');
  let teams = Object.values(TEAMS);

  // Filter by confederation
  if (teamsFilter !== 'ALL') {
    teams = teams.filter(t => t.confederation === teamsFilter);
  }

  // Search
  if (teamsSearch) {
    const q = teamsSearch.toLowerCase();
    teams = teams.filter(t => t.name.toLowerCase().includes(q));
  }

  // Sort
  if (teamsSort === 'prob') {
    teams.sort((a,b) => b.probability - a.probability);
  } else if (teamsSort === 'rank') {
    teams.sort((a,b) => a.fifaRank - b.fifaRank);
  } else {
    teams.sort((a,b) => a.name.localeCompare(b.name));
  }

  const pickedId = currentUser.predictions.champion;
  document.getElementById('teams-count').textContent = teams.length;

  container.innerHTML = teams.map(team => {
    const isPick = team.id === pickedId;
    const probClass = team.probability >= 10 ? 'prob-t1' : team.probability >= 3 ? 'prob-t2' : team.probability >= 1 ? 'prob-t3' : 'prob-t4';
    const fillWidth = Math.max(5, Math.min(100, team.probability * 5));
    return `
      <div class="team-card${isPick ? ' is-pick' : ''}" onclick="openTeamDetail('${team.id}')">
        ${isPick ? '<div class="team-card-pick-badge">🏆 MY PICK</div>' : ''}
        <span class="team-flag">${team.flag}</span>
        <div class="team-card-name">${escHtml(team.name)}</div>
        <div class="team-card-conf">${team.confederation}</div>
        <div class="team-prob-bar">
          <div class="team-prob-fill" style="width:${fillWidth}%"></div>
        </div>
        <div class="team-card-prob ${probClass}">${team.probability}% chance</div>
      </div>
    `;
  }).join('');
}

function setTeamsFilter(conf) {
  teamsFilter = conf;
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-filter="${conf}"]`).classList.add('active');
  renderTeamGrid();
}

function setTeamsSort(val) {
  teamsSort = val;
  renderTeamGrid();
}

// ============================================================
// Team Modal
// ============================================================
function openTeamDetail(teamId) {
  const team = TEAMS[teamId];
  openTeamModal = teamId;

  const isPick = currentUser.predictions.champion === teamId;
  const probFill = Math.min(100, team.probability * 5);

  document.getElementById('modal-flag').textContent = team.flag;
  document.getElementById('modal-team-name').textContent = team.name;
  document.getElementById('modal-team-sub').textContent = `${team.confederation} · FIFA Rank #${team.fifaRank}`;

  document.getElementById('modal-description').innerHTML = escHtml(team.description).replace(/\n/g, '<br>');

  document.getElementById('modal-prob-fill').style.width = `${probFill}%`;
  document.getElementById('modal-prob-value').textContent = `${team.probability}%`;

  // Probability context
  const allProbs = Object.values(TEAMS).sort((a,b) => b.probability - a.probability);
  const rank = allProbs.findIndex(t => t.id === teamId) + 1;
  document.getElementById('modal-prob-context').textContent = `${rank}e favori sur 48 équipes`;

  // Players
  document.getElementById('modal-players').innerHTML = team.players.map((p, i) => `
    <div class="player-card">
      <div class="player-medal medal-${i+1}">${i+1}</div>
      <div class="player-info">
        <div class="player-name">${escHtml(p.name)}</div>
        <div class="player-meta">
          <span class="player-pos">${escHtml(p.position)}</span>
          <span class="player-club"> · ${escHtml(p.club)}</span>
        </div>
        <div class="player-desc">${escHtml(p.description)}</div>
      </div>
    </div>
  `).join('');

  // Group info
  const groupId = Object.keys(GROUPS).find(g => GROUPS[g].includes(teamId));
  if (groupId) {
    const groupTeams = GROUPS[groupId].map(id => TEAMS[id]);
    document.getElementById('modal-group').innerHTML = `
      <div class="badge badge-blue" style="margin-bottom:0.75rem">Group ${groupId}</div>
      <div style="display:flex;flex-direction:column;gap:0.4rem">
        ${groupTeams.map(t => `
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.75rem;background:${t.id === teamId ? 'rgba(245,158,11,0.1)' : 'var(--surface-2)'};border-radius:8px;${t.id === teamId ? 'border:1px solid rgba(245,158,11,0.3)' : ''}">
            <span style="font-size:1.25rem">${t.flag}</span>
            <span style="font-size:0.875rem;font-weight:${t.id === teamId ? '700' : '500'}">${escHtml(t.name)}</span>
            <span style="margin-left:auto;font-size:0.75rem;color:var(--text-dim)">${t.probability}%</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Pick button
  const pickBtn = document.getElementById('modal-pick-btn');
  pickBtn.textContent = isPick ? '✅ Ton champion actuel' : `🏆 Choisir ${team.name} comme Champion`;
  pickBtn.className = `pick-champion-btn${isPick ? ' already-picked' : ''}`;

  document.getElementById('team-modal-overlay').classList.add('open');
}

function closeTeamModal() {
  document.getElementById('team-modal-overlay').classList.remove('open');
  openTeamModal = null;
}

function pickChampionFromModal() {
  if (!openTeamModal) return;
  currentUser.predictions.champion = openTeamModal;
  saveStorage();

  // Update button
  const pickBtn = document.getElementById('modal-pick-btn');
  pickBtn.textContent = `✅ Ton champion actuel`;
  pickBtn.className = 'pick-champion-btn already-picked';

  // Refresh teams if visible
  if (activeTab === 'teams') renderTeamGrid();
  if (activeTab === 'home') renderHome();

  showToast(`${TEAMS[openTeamModal].flag} ${TEAMS[openTeamModal].name} set as your champion pick!`);
}

// ============================================================
// Bracket Tab
// ============================================================
function renderBracket() {
  renderStageTabsProgress();
  showStage(activeStagTab);
}

function renderStageTabsProgress() {
  const picks = currentUser.predictions;
  const stages = ['groups', 'thirdslots', 'r32', 'r16', 'qf', 'sf', 'thirdplace', 'final'];
  const totals = { groups: 12, thirdslots: 8, r32: 16, r16: 8, qf: 4, sf: 2, thirdplace: 1, final: 1 };
  const done = {
    groups:     Object.values(picks.groups).filter(g => g.first && g.second).length,
    thirdslots: Object.keys(picks.thirdSlots || {}).length,
    r32:        Object.keys(picks.r32).length,
    r16:        Object.keys(picks.r16).length,
    qf:         Object.keys(picks.qf).length,
    sf:         Object.keys(picks.sf).length,
    thirdplace: picks.thirdplace ? 1 : 0,
    final:      picks.final ? 1 : 0,
  };
  const labels = { groups: 'Groupes', thirdslots: 'Meilleurs 3es', r32: '1/32 de finale', r16: 'Huitièmes', qf: 'Quarts de finale', sf: 'Demi-finales', thirdplace: '3e Place', final: 'Finale' };

  document.getElementById('stage-tabs').innerHTML = stages.map(s => {
    const isComplete = done[s] >= totals[s];
    const isActive = s === activeStagTab;
    return `
      <button class="stage-tab${isActive ? ' active' : ''}" onclick="showStage('${s}')">
        ${isComplete ? '<span class="stage-complete-dot"></span>' : ''}
        ${labels[s]}
        <span style="font-size:0.7rem;opacity:0.7">(${done[s]}/${totals[s]})</span>
      </button>
    `;
  }).join('');
}

function showStage(stage) {
  activeStagTab = stage;
  renderStageTabsProgress();
  const container = document.getElementById('bracket-stage-content');
  switch(stage) {
    case 'groups':     container.innerHTML = renderGroupsStage(); break;
    case 'thirdslots': container.innerHTML = renderThirdSlotsStage(); break;
    case 'r32': container.innerHTML = renderKnockoutStage('r32', R32_BRACKET, 'Round of 32', 'Pick the winner of each Round of 32 match'); break;
    case 'r16': container.innerHTML = renderKnockoutStage('r16', R16_BRACKET, 'Round of 16', 'Pick the winner of each Round of 16 match'); break;
    case 'qf': container.innerHTML = renderKnockoutStage('qf', QF_BRACKET, 'Quarter-Finals', 'Pick your quarter-final winners'); break;
    case 'sf': container.innerHTML = renderKnockoutStage('sf', SF_BRACKET, 'Semi-Finals', 'Pick your semi-final winners'); break;
    case 'thirdplace': container.innerHTML = renderThirdPlaceStage(); break;
    case 'final': container.innerHTML = renderFinalStage(); break;
  }
}

// ---- GROUPS ----
function renderGroupsStage() {
  const picks = currentUser.predictions.groups;
  const complete = Object.values(picks).filter(g => g.first && g.second).length;

  return `
    <div class="bracket-hero">
      <div>
        <h2 class="bracket-title">Pronostics de la Phase de Groupes</h2>
        <p class="bracket-desc">Dans chaque groupe, clique une fois sur une équipe pour la choisir <strong>1re</strong>, puis sur une autre pour la choisir <strong>2e</strong>. Reclique sur une équipe sélectionnée pour l'enlever. Les 2 premières avancent au 1/32 de finale ; les 8 meilleurs 3es se qualifient aussi.</p>
      </div>
      <div class="bracket-progress-rings">
        <div class="progress-ring-item">
          <div class="progress-ring-value">${complete}</div>
          <div class="progress-ring-total">/ 12</div>
          <div class="progress-ring-label">Groupes complétés</div>
        </div>
      </div>
    </div>
    ${complete === 12 ? `<div class="alert alert-success"><span class="alert-icon">✅</span>Tous les pronostics de groupes sont complétés ! Continue pour choisir les 8 meilleurs 3es →</div>` : ''}
    <div class="groups-grid">
      ${Object.keys(GROUPS).map(g => renderGroupCard(g, GROUPS[g], picks[g] || {})).join('')}
    </div>
    <div style="margin-top:1.5rem">
      <button class="btn btn-secondary" onclick="showStage('thirdslots')">Continuer : Choisir les 8 meilleurs 3es →</button>
    </div>
  `;
}

function renderGroupCard(groupId, teamIds, groupPicks) {
  const complete = groupPicks.first && groupPicks.second;
  return `
    <div class="group-card${complete ? ' complete' : ''}" id="group-card-${groupId}">
      <div class="group-card-header">
        <span class="group-name">Group ${groupId}</span>
        <span class="group-pick-hint">${complete ? '✅ Complété' : groupPicks.first ? 'Choisis maintenant le 2e' : 'Clique pour choisir le 1er'}</span>
      </div>
      <div class="group-card-body">
        ${teamIds.map(teamId => renderGroupTeamRow(groupId, teamId, groupPicks)).join('')}
      </div>
    </div>
  `;
}

function renderGroupTeamRow(groupId, teamId, groupPicks) {
  const team = TEAMS[teamId];
  let rankClass = '';
  let rankBadge = '';
  if (groupPicks.first === teamId) {
    rankClass = 'rank-1';
    rankBadge = '<span class="group-rank-badge rank-badge-1">1er</span>';
  } else if (groupPicks.second === teamId) {
    rankClass = 'rank-2';
    rankBadge = '<span class="group-rank-badge rank-badge-2">2e</span>';
  } else if (groupPicks.first && groupPicks.second) {
    rankClass = 'rank-3';
    rankBadge = '<span class="group-rank-badge rank-badge-3">Éliminé</span>';
  }
  return `
    <div class="group-team-row ${rankClass}" onclick="pickGroupTeam('${groupId}','${teamId}')">
      <span class="group-team-flag">${team.flag}</span>
      <span class="group-team-name">${escHtml(team.name)}</span>
      <span class="group-team-prob">${team.probability}%</span>
      ${rankBadge}
    </div>
  `;
}

function pickGroupTeam(groupId, teamId) {
  if (!currentUser.predictions.groups[groupId]) {
    currentUser.predictions.groups[groupId] = {};
  }
  const gp = currentUser.predictions.groups[groupId];

  if (gp.first === teamId) {
    // Deselect first, promote second
    gp.first = gp.second || null;
    gp.second = null;
  } else if (gp.second === teamId) {
    gp.second = null;
  } else if (!gp.first) {
    gp.first = teamId;
  } else if (!gp.second) {
    gp.second = teamId;
  } else {
    // Both slots full, replace second
    gp.second = teamId;
  }

  saveStorage();

  // Re-render just this group card
  const card = document.getElementById(`group-card-${groupId}`);
  if (card) {
    card.outerHTML = renderGroupCard(groupId, GROUPS[groupId], gp);
  }
  renderStageTabsProgress();

  // Update home if needed
  if (activeTab === 'home') renderHome();
}

// ---- KNOCKOUT STAGES ----
function renderKnockoutStage(stageKey, bracketDef, title, desc) {
  const picks = currentUser.predictions;
  const stagePicks = picks[stageKey] || {};
  const done = Object.keys(stagePicks).length;
  const total = bracketDef.length;

  const matchesHtml = bracketDef.map(match => {
    const team1 = resolveSlot(match.from ? `winner_${match.from[0]}` : match.slot1, picks);
    const team2 = resolveSlot(match.from ? `winner_${match.from[1]}` : match.slot2, picks);
    const winner = stagePicks[match.id];
    return renderMatchCard(stageKey, match.id, team1, team2, winner, match.from ? match.from : [match.slot1, match.slot2], match.thirdLabel);
  }).join('');

  // Determine next stage button
  const nextStages = { r32: 'r16', r16: 'qf', qf: 'sf', sf: 'thirdplace', thirdplace: 'final' };
  const prevStages = { r32: 'thirdslots', r16: 'r32', qf: 'r16', sf: 'qf', thirdplace: 'sf', final: 'thirdplace' };

  return `
    <div class="bracket-hero">
      <div>
        <h2 class="bracket-title">${title}</h2>
        <p class="bracket-desc">${desc}</p>
      </div>
      <div class="bracket-progress-rings">
        <div class="progress-ring-item">
          <div class="progress-ring-value">${done}</div>
          <div class="progress-ring-total">/ ${total}</div>
          <div class="progress-ring-label">Matches decided</div>
        </div>
      </div>
    </div>
    ${done === total ? `<div class="alert alert-success"><span class="alert-icon">✅</span>Tous les pronostics de ${title} sont complétés !</div>` : ''}
    <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;flex-wrap:wrap">
      ${prevStages[stageKey] ? `<button class="btn btn-ghost btn-sm" onclick="showStage('${prevStages[stageKey]}')">← Retour</button>` : ''}
      ${nextStages[stageKey] ? `<button class="btn btn-secondary btn-sm" onclick="showStage('${nextStages[stageKey]}')">Continuer au tour suivant →</button>` : ''}
    </div>
    <div class="knockout-matches" id="knockout-matches-${stageKey}">
      ${matchesHtml}
    </div>
  `;
}

function renderMatchCard(stageKey, matchId, team1Id, team2Id, winnerId, slots, thirdLabel) {
  const t1 = team1Id ? TEAMS[team1Id] : null;
  const t2 = team2Id ? TEAMS[team2Id] : null;
  const isDone = !!winnerId;

  const renderTeamSlot = (teamId, slotLabel, isWinner) => {
    if (!teamId) {
      return `<div class="match-team tbd"><span class="match-team-flag">❓</span><span class="match-team-name">${escHtml(slotLabel)}</span></div>`;
    }
    const team = TEAMS[teamId];
    return `
      <div class="match-team${isWinner ? ' winner' : ''}" onclick="pickMatchWinner('${stageKey}','${matchId}','${teamId}')">
        <span class="match-team-flag">${team.flag}</span>
        <span class="match-team-name">${escHtml(team.name)}</span>
        ${isWinner ? '<span class="match-winner-check">✓</span>' : ''}
      </div>
    `;
  };

  return `
    <div class="match-card${isDone ? ' decided' : ''}" id="match-card-${stageKey}-${matchId}">
      <div class="match-card-header">
        <span>${matchId.replace('_',' ')}</span>
        ${isDone ? `<span style="color:var(--accent-green);font-size:0.7rem">✓ Décidé</span>` : `<span>Choisir le vainqueur</span>`}
      </div>
      <div class="match-card-body">
        ${renderTeamSlot(team1Id, Array.isArray(slots) ? slots[0] : 'TBD', team1Id === winnerId)}
        <div class="match-vs-divider">VS</div>
        ${renderTeamSlot(team2Id, team2Id ? (Array.isArray(slots) ? slots[1] : 'TBD') : (thirdLabel || (Array.isArray(slots) ? slots[1] : 'TBD')), team2Id === winnerId)}
      </div>
    </div>
  `;
}

function pickMatchWinner(stageKey, matchId, teamId) {
  const stagePicks = currentUser.predictions[stageKey];
  if (stagePicks[matchId] === teamId) {
    delete stagePicks[matchId]; // deselect
  } else {
    stagePicks[matchId] = teamId;
  }

  saveStorage();
  renderStageTabsProgress();

  // Re-render this match card
  const card = document.getElementById(`match-card-${stageKey}-${matchId}`);
  if (card) {
    // Find the match definition
    const allBrackets = { r32: R32_BRACKET, r16: R16_BRACKET, qf: QF_BRACKET, sf: SF_BRACKET };
    const bracket = allBrackets[stageKey];
    const match = bracket.find(m => m.id === matchId);
    const picks = currentUser.predictions;
    const team1 = resolveSlot(match.from ? `winner_${match.from[0]}` : match.slot1, picks);
    const team2 = resolveSlot(match.from ? `winner_${match.from[1]}` : match.slot2, picks);
    const winner = picks[stageKey][matchId];
    card.outerHTML = renderMatchCard(stageKey, matchId, team1, team2, winner, match.from || [match.slot1, match.slot2]);
  }

  if (activeTab === 'home') renderHome();
}

// ---- FINAL ----
function renderFinalStage() {
  const picks = currentUser.predictions;
  const sf1Winner = picks.sf['SF_1'];
  const sf2Winner = picks.sf['SF_2'];
  const finalWinner = picks.final;

  const renderFinalist = (teamId, sfId) => {
    if (!teamId) {
      return `
        <div style="background:var(--surface-2);border:2px dashed var(--border);border-radius:12px;padding:1.5rem;text-align:center;color:var(--text-dim)">
          <div style="font-size:2rem;margin-bottom:0.5rem">❓</div>
          <div style="font-size:0.875rem">Choisis d'abord le vainqueur de ${sfId}</div>
          <button class="btn btn-ghost btn-sm" style="margin-top:0.75rem" onclick="showStage('sf')">Aller aux Demi-finales</button>
        </div>
      `;
    }
    const team = TEAMS[teamId];
    const isWinner = finalWinner === teamId;
    return `
      <div class="pick-display${isWinner ? '' : ''}"
           style="${isWinner ? 'background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(249,115,22,0.1));border-color:rgba(245,158,11,0.5)' : ''};cursor:pointer"
           onclick="pickFinalWinner('${teamId}')">
        <span class="pick-flag">${team.flag}</span>
        <div class="pick-info">
          <h3>${escHtml(team.name)}</h3>
          <div class="conf">${team.confederation}</div>
          ${isWinner ? `<div class="prob-pill">🏆 Ton Champion !</div>` : `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.4rem">Clique pour choisir comme champion</div>`}
        </div>
        ${isWinner ? `<span style="font-size:2rem">🏆</span>` : ''}
      </div>
    `;
  };

  return `
    <div class="bracket-hero">
      <div>
        <h2 class="bracket-title">La Finale</h2>
        <p class="bracket-desc">Le match ultime. Choisis ton champion de la Coupe du Monde 2026.</p>
      </div>
    </div>
    ${finalWinner ? `<div class="alert alert-success"><span class="alert-icon">🏆</span>Tu as choisi <strong>${TEAMS[finalWinner].flag} ${TEAMS[finalWinner].name}</strong> comme ton champion de la Coupe du Monde !</div>` : ''}
    <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem">
      <button class="btn btn-ghost btn-sm" onclick="showStage('sf')">← Retour aux Demi-finales</button>
    </div>
    <div style="text-align:center;font-size:0.875rem;color:var(--text-muted);margin-bottom:1rem">Clique sur un finaliste pour le choisir comme Champion</div>
    <div class="grid-2" style="max-width:700px;margin:0 auto">
      ${renderFinalist(sf1Winner, 'Semi-Final 1')}
      ${renderFinalist(sf2Winner, 'Semi-Final 2')}
    </div>
    ${sf1Winner && sf2Winner ? `
      <div style="text-align:center;margin:1.5rem 0;font-size:1.25rem;color:var(--text-dim)">VS</div>
    ` : ''}
  `;
}

// ---- BEST 8 THIRD-PLACED TEAMS ----
function parseEligibleGroups(thirdLabel) {
  const m = thirdLabel && thirdLabel.match(/\(([^)]+)\)/);
  return m ? m[1].split('/') : [];
}

function renderThirdSlotsStage() {
  const picks = currentUser.predictions;
  const thirdMatches = R32_BRACKET.filter(m =>
    (m.slot1 && m.slot1.startsWith('3rd-')) || (m.slot2 && m.slot2.startsWith('3rd-'))
  );
  const done = thirdMatches.filter(m => {
    const slot = (m.slot1 && m.slot1.startsWith('3rd-')) ? m.slot1 : m.slot2;
    return !!(picks.thirdSlots || {})[slot];
  }).length;
  const groupsDone = Object.values(picks.groups).filter(g => g.first && g.second).length;

  return `
    <div class="bracket-hero">
      <div>
        <h2 class="bracket-title">Les 8 Meilleurs 3es</h2>
        <p class="bracket-desc">Après la phase de groupes, les 8 meilleurs 3es rejoignent les 24 qualifiés de groupe au 1/32 de finale. Chaque place a un pool de groupes éligibles — choisis l'équipe que tu penses qualifiée dans chaque pool.</p>
      </div>
      <div class="bracket-progress-rings">
        <div class="progress-ring-item">
          <div class="progress-ring-value">${done}</div>
          <div class="progress-ring-total">/ 8</div>
          <div class="progress-ring-label">Places remplies</div>
        </div>
      </div>
    </div>
    ${groupsDone < 12 ? `<div class="alert alert-warning"><span class="alert-icon">⚠️</span>Complète les 12 pronostics de groupes pour voir tous les candidats. <button class="btn btn-ghost btn-sm" onclick="showStage('groups')">Retour aux Groupes</button></div>` : ''}
    ${done === 8 ? `<div class="alert alert-success"><span class="alert-icon">✅</span>Les 8 places de 3es sont remplies ! Continue vers le 1/32 de finale →</div>` : ''}
    <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="showStage('groups')">← Retour aux Groupes</button>
      <button class="btn btn-secondary btn-sm" onclick="showStage('r32')">Continuer vers le 1/32 de finale →</button>
    </div>
    <div class="third-slots-grid">
      ${thirdMatches.map(m => {
        const slot = (m.slot1 && m.slot1.startsWith('3rd-')) ? m.slot1 : m.slot2;
        const otherSlot = slot === m.slot1 ? m.slot2 : m.slot1;
        const label = m.thirdLabel || '';
        const eligibleGroups = parseEligibleGroups(label);
        const candidates = eligibleGroups.flatMap(g => {
          if (!GROUPS[g]) return [];
          const gp = picks.groups[g] || {};
          return GROUPS[g]
            .filter(t => t !== gp.first && t !== gp.second)
            .map(t => ({ teamId: t, group: g }));
        });
        const selected = (picks.thirdSlots || {})[slot] || null;
        const otherTeam = resolveSlot(otherSlot, picks);
        return renderThirdSlotCard(slot, label, candidates, selected, otherTeam, otherSlot, m.id);
      }).join('')}
    </div>
  `;
}

function renderThirdSlotCard(slot, label, candidates, selected, otherTeam, otherSlot, matchId) {
  const slotNum = slot.replace('3rd-', '');
  const vsHtml = otherTeam
    ? `<div class="third-slot-vs">Will face <strong>${TEAMS[otherTeam].flag} ${TEAMS[otherTeam].name}</strong> in ${matchId.replace('_',' ')}</div>`
    : `<div class="third-slot-vs">Adversaire (${otherSlot}) — remplis les groupes d'abord</div>`;

  return `
    <div class="third-slot-card" id="third-slot-${slot}">
      <div class="third-slot-header">
        <div>
          <span class="third-slot-num">Place ${slotNum} sur 8</span>
          <span class="third-slot-label">${label}</span>
        </div>
        ${selected
          ? `<span class="badge badge-green">${TEAMS[selected].flag} ${TEAMS[selected].name} ✓</span>`
          : '<span class="badge">Non choisi</span>'}
      </div>
      ${vsHtml}
      <div class="third-candidates">
        ${candidates.length === 0
          ? `<p class="third-no-candidates">Remplis les pronostics des groupes ${parseEligibleGroups(label).join(', ')} d'abord</p>`
          : candidates.map(({ teamId, group }) => {
              const team = TEAMS[teamId];
              const isSel = selected === teamId;
              return `
                <button class="third-candidate${isSel ? ' selected' : ''}" onclick="pickThirdSlot('${slot}','${teamId}')">
                  <span class="tc-flag">${team.flag}</span>
                  <div class="tc-info">
                    <div class="tc-name">${escHtml(team.name)}</div>
                    <div class="tc-group">Groupe ${group} · 3e place</div>
                  </div>
                  ${isSel ? '<span class="tc-check">✓</span>' : ''}
                </button>`;
            }).join('')
        }
      </div>
    </div>
  `;
}

function pickThirdSlot(slot, teamId) {
  if (!currentUser.predictions.thirdSlots) currentUser.predictions.thirdSlots = {};
  if (currentUser.predictions.thirdSlots[slot] === teamId) {
    delete currentUser.predictions.thirdSlots[slot];
  } else {
    currentUser.predictions.thirdSlots[slot] = teamId;
  }
  saveStorage();
  showStage('thirdslots');
}

function renderThirdPlaceStage() {
  const picks = currentUser.predictions;

  // Derive SF losers: each SF has two participants from QF; loser = participant who isn't the winner
  function getSFLoser(sfId, qf1Id, qf2Id) {
    const sfWinner = picks.sf[sfId];
    if (!sfWinner) return null;
    const p1 = picks.qf[qf1Id] || null;
    const p2 = picks.qf[qf2Id] || null;
    return [p1, p2].find(t => t && t !== sfWinner) || null;
  }

  const loser1 = getSFLoser('SF_1', 'QF_1', 'QF_2');
  const loser2 = getSFLoser('SF_2', 'QF_3', 'QF_4');
  const thirdWinner = picks.thirdplace;

  const renderContestant = (teamId, label) => {
    if (!teamId) {
      return `
        <div style="background:var(--surface-2);border:2px dashed var(--border);border-radius:12px;padding:1.5rem;text-align:center;color:var(--text-dim)">
          <div style="font-size:2rem;margin-bottom:0.5rem">❓</div>
          <div style="font-size:0.875rem">${label} — choisis d'abord les vainqueurs des demi-finales</div>
          <button class="btn btn-ghost btn-sm" style="margin-top:0.75rem" onclick="showStage('sf')">Aller aux Demi-finales</button>
        </div>
      `;
    }
    const team = TEAMS[teamId];
    const isWinner = thirdWinner === teamId;
    return `
      <div class="pick-display" style="${isWinner ? 'border-color:var(--accent-green);background:rgba(46,125,50,0.08)' : ''};cursor:pointer"
           onclick="pickThirdPlaceWinner('${teamId}')">
        <span class="pick-flag">${team.flag}</span>
        <div class="pick-info">
          <h3>${escHtml(team.name)}</h3>
          <div class="conf">${team.confederation}</div>
          ${isWinner ? `<div class="prob-pill" style="background:rgba(46,125,50,0.15);color:var(--accent-green);border-color:rgba(46,125,50,0.3)">🥉 Ton choix pour la 3e place !</div>` : `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.4rem">Clique pour choisir à la 3e place</div>`}
        </div>
        ${isWinner ? `<span style="font-size:2rem">🥉</span>` : ''}
      </div>
    `;
  };

  return `
    <div class="bracket-hero">
      <div>
        <h2 class="bracket-title">Match pour la 3e Place</h2>
        <p class="bracket-desc">Les deux perdants des demi-finales s'affrontent pour le bronze. Choisis quelle équipe finit troisième.</p>
      </div>
    </div>
    ${thirdWinner ? `<div class="alert alert-success"><span class="alert-icon">🥉</span>Tu as choisi <strong>${TEAMS[thirdWinner].flag} ${TEAMS[thirdWinner].name}</strong> pour la 3e place !</div>` : ''}
    <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem">
      <button class="btn btn-ghost btn-sm" onclick="showStage('sf')">← Retour aux Demi-finales</button>
      <button class="btn btn-secondary btn-sm" onclick="showStage('final')">Continuer vers la Finale →</button>
    </div>
    <div style="text-align:center;font-size:0.875rem;color:var(--text-muted);margin-bottom:1rem">Clique sur une équipe pour la choisir à la 3e place</div>
    <div class="grid-2" style="max-width:700px;margin:0 auto">
      ${renderContestant(loser1, 'SF1 loser')}
      ${renderContestant(loser2, 'SF2 loser')}
    </div>
  `;
}

function pickFinalWinner(teamId) {
  if (!currentUser.predictions.sf['SF_1'] || !currentUser.predictions.sf['SF_2']) {
    showToast('Choisis d\'abord tes vainqueurs des demi-finales !', 'warning');
    return;
  }
  if (currentUser.predictions.final === teamId) {
    currentUser.predictions.final = null;
    currentUser.predictions.champion = currentUser.predictions.champion === teamId ? null : currentUser.predictions.champion;
  } else {
    currentUser.predictions.final = teamId;
    // Also set as champion pick
    currentUser.predictions.champion = teamId;
  }
  saveStorage();
  showStage('final');
  if (activeTab === 'home') renderHome();
  if (teamId && currentUser.predictions.final === teamId) {
    showToast(`${TEAMS[teamId].flag} ${TEAMS[teamId].name} est ton Champion de la Coupe du Monde !`);
  }
}

function pickThirdPlaceWinner(teamId) {
  currentUser.predictions.thirdplace = teamId;
  saveStorage();
  showStage('thirdplace');
  showToast(`🥉 ${TEAMS[teamId].name} choisi pour la 3e place !`, 'success');
}

// ---- RESOLVE SLOT ----
// Resolves a slot label (e.g. "1A", "2B", "winner_R32_1") to a teamId
function resolveSlot(slot, picks) {
  if (!slot) return null;

  // winner_R32_X etc.
  if (slot.startsWith('winner_')) {
    const matchId = slot.replace('winner_', '');
    const allBrackets = {
      ...picks.r32, ...picks.r16, ...picks.qf, ...picks.sf,
      FINAL: picks.final,
    };
    return allBrackets[matchId] || null;
  }

  // Group position: 1A, 2B, etc.
  const match = slot.match(/^([12])([A-L])$/);
  if (match) {
    const pos = match[1]; // '1' or '2'
    const groupId = match[2];
    const gp = picks.groups[groupId];
    if (!gp) return null;
    return pos === '1' ? gp.first : gp.second;
  }

  // 3rd place qualifier slots
  if (slot.startsWith('3rd-')) {
    return (picks.thirdSlots || {})[slot] || null;
  }

  return null;
}

// ============================================================
// Leaderboard Tab
// ============================================================
function renderLeaderboard() {
  const container = document.getElementById('leaderboard-container');
  const sorted = [...allUsers].sort((a, b) => {
    // Sort by: has champion pick first, then by name
    if (a.predictions.champion && !b.predictions.champion) return -1;
    if (!a.predictions.champion && b.predictions.champion) return 1;
    return a.name.localeCompare(b.name);
  });

  const rows = sorted.map((u, i) => {
    const rankClass = i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : 'other';
    const isCurrent = u.id === currentUser.id;
    const cp = u.predictions.champion;
    const champion = cp && TEAMS[cp];
    const done = countCompletedPredictions(u.predictions);

    return `
      <div class="lb-row${isCurrent ? ' is-current' : ''}">
        <div><div class="rank-num ${rankClass}">${i + 1}</div></div>
        <div class="lb-user">
          <div class="lb-avatar" style="background:linear-gradient(135deg,${u.color1},${u.color2})">${u.name.charAt(0).toUpperCase()}</div>
          <span class="lb-name">${escHtml(u.name)}${isCurrent ? '<span class="lb-you-tag">TOI</span>' : ''}</span>
        </div>
        <div class="lb-champion">
          ${champion ? `<span class="lb-champion-flag">${champion.flag}</span><span class="lb-champion-name">${escHtml(champion.name)}</span>` : '<span class="no-pick-text-sm">Pas encore de choix</span>'}
        </div>
        <div class="lb-score-col">
          <div class="lb-score">—</div>
          <div class="lb-score-label">pts (à venir)</div>
        </div>
        <div class="lb-bracket">
          <span class="bracket-fill-badge">${done.total} pronostics</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = rows.join('');
  document.getElementById('lb-count').textContent = allUsers.length;
}

// ============================================================
// Logout / Switch user
// ============================================================
function switchUser() {
  currentUser = null;
  saveStorage();
  showLoginScreen();
}

// ============================================================
// Export / Import
// ============================================================
function exportData() {
  const data = JSON.stringify({ users: allUsers }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lesboys-cdm2026-pronostics-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Pronostics exportés !');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!imported.users || !Array.isArray(imported.users)) {
          showToast('Format de fichier invalide', 'error');
          return;
        }
        // Merge users: add new ones, update existing
        imported.users.forEach(importedUser => {
          const existing = allUsers.find(u => u.name.toLowerCase() === importedUser.name.toLowerCase());
          if (!existing) {
            allUsers.push(importedUser);
          }
        });
        saveStorage();
        showToast(`${imported.users.length} utilisateur(s) importé(s) !`);
        renderTab(activeTab);
      } catch {
        showToast('Impossible de lire le fichier', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ============================================================
// Toast notifications
// ============================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${type === 'success' ? 'rgba(16,185,129,0.9)' : type === 'warning' ? 'rgba(245,158,11,0.9)' : 'rgba(239,68,68,0.9)'};
    color: #000;
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 320px;
    backdrop-filter: blur(4px);
  `;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.style.transform = 'translateX(0)', 10);
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => container.removeChild(toast), 300);
  }, 3000);
}

// ============================================================
// Helpers
// ============================================================
function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getOrdSuffix(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return s[(v-20)%10] || s[v] || s[0];
}

// Wire up event listeners once the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('team-modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeTeamModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeTeamModal();
  });

  document.getElementById('teams-search-input').addEventListener('input', function() {
    teamsSearch = this.value;
    renderTeamGrid();
  });

  document.getElementById('teams-sort').addEventListener('change', function() {
    setTeamsSort(this.value);
  });
});

// ============================================================
// Watch Party — Visionnement Stratégique
// ============================================================

const WATCH_GAMES = [
  {
    id: 'game1',
    date: '27 juin · 15h00',
    teams: 'Uruguay 🇺🇾 vs 🇪🇸 Espagne',
    emoji: '🛋️',
    coachAlert: '⚠️ Lowis — ton Espagne joue. T\'as plus d\'excuse pour pas organiser.',
    context: `L'ENJEU : Lowis doit <em>obligatoirement</em> regarder ce match. Son Espagne tient le ballon 70% du temps, ce qui lui ressemble pas mal — sauf que Lowis, lui, tient son beer 70% du temps. Darwin Núñez d'Uruguay court dans tous les sens comme Lowis quand l'internet lag pendant un gros push en prod. Match à 15h : parfait pour un apéro qui commence tôt avec une bonne excuse. <strong>Lowis, c'est ton match. Lève-toi du sofa. Pas pour jouer — pour organiser.</strong>`,
    stakeEmoji: '🍺',
  },
  {
    id: 'game2',
    date: '27 juin · 18h00',
    teams: 'Croatie 🇭🇷 vs 🇬🇭 Ghana',
    emoji: '🎭',
    coachAlert: null,
    context: `L'ENJEU : Modrić à 40 ans qui essaie encore de contrôler le jeu comme Killer essaie encore de raconter la même histoire de chasse de 1997. Contre le Ghana de Kudus, qui dribble comme Rod improvise à la guitare — on sait jamais trop où ça s'en va mais c'est enthousiasmant. Match à 18h : soit pile l'heure du souper. <strong>L'hôte devra donc nourrir tout le monde.</strong> Bonne chance pour convaincre quelqu'un de lever la main.`,
    stakeEmoji: '🍖',
  },
  {
    id: 'game3',
    date: '28 juin · 15h00',
    teams: 'Colombie 🇨🇴 vs 🇵🇹 Portugal',
    emoji: '🏦',
    coachAlert: '⚠️ Bloke — ton Portugal joue. Ta blonde sud-africaine est déjà en train de préparer des sandwichs.',
    context: `L'ENJEU : LA game des coachs. Bloke <em>DOIT</em> organiser — son Portugal joue et sa blonde sud-africaine supportera le Portugal par loyauté conjugale. Rod supporte techniquement la Colombie parce qu'il est passé à Bogotá en 2019 pour un festival de musique dont il parle encore. <strong>James Rodríguez vs Bruno Fernandes = Rod vs Bloke.</strong> C'est personnel. On mérite du spectacle dans une grosse maison de banquier.`,
    stakeEmoji: '🏆',
  },
];

function renderWatchParties() {
  const container = document.getElementById('watchparty-content');
  if (!container) return;
  renderWatchPartySummary();
  const name = currentUser ? currentUser.name : null;

  container.innerHTML = WATCH_GAMES.map(g => {
    const wp      = watchParties[g.id] || { host: null, attendees: [] };
    const isHost  = name && wp.host === name;
    const isGoing = name && wp.attendees.includes(name);
    const hasHost = !!wp.host;
    const goingList = [
      ...(wp.host ? [`🏠 <strong>${escHtml(wp.host)}</strong> <span style="font-size:0.75rem;opacity:0.7">(hôte)</span>`] : []),
      ...wp.attendees.filter(a => a !== wp.host).map(a => `🍺 ${escHtml(a)}`),
    ];

    return `
    <div class="card" style="border-left:4px solid var(--accent);margin-bottom:1.5rem" id="wp-card-${g.id}">

      <!-- Header du match -->
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem;flex-wrap:wrap">
        <span style="font-size:2.5rem">${g.emoji}</span>
        <div style="flex:1">
          <div style="font-size:1.1rem;font-weight:800">${g.teams}</div>
          <div style="font-size:0.82rem;color:var(--text-dim);margin-top:0.2rem">📅 ${g.date}</div>
        </div>
        <span style="font-size:1.75rem">${g.stakeEmoji}</span>
      </div>

      ${g.coachAlert ? `<div class="alert alert-warning" style="margin-bottom:0.75rem;padding:0.5rem 0.75rem;font-size:0.82rem"><span class="alert-icon">🚨</span>${g.coachAlert}</div>` : ''}

      <!-- Contexte stratégique -->
      <div style="font-size:0.875rem;line-height:1.7;color:var(--text);background:var(--surface-2);border-radius:10px;padding:0.875rem;margin-bottom:1rem">
        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-dim);margin-bottom:0.4rem">📋 Contexte stratégique</div>
        ${g.context}
      </div>

      <!-- Qui est là -->
      <div style="margin-bottom:1rem">
        <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-dim);margin-bottom:0.5rem">
          Qui est dans le coup ?
          <span style="font-weight:400;text-transform:none;letter-spacing:0">(${goingList.length} confirmé${goingList.length > 1 ? 's' : ''})</span>
        </div>
        ${goingList.length > 0
          ? `<div style="display:flex;flex-wrap:wrap;gap:0.4rem">${
              goingList.map(item => `<span style="background:var(--surface-2);border:1px solid var(--border);border-radius:20px;padding:0.3rem 0.75rem;font-size:0.82rem">${item}</span>`).join('')
            }</div>`
          : `<p style="font-size:0.82rem;color:var(--text-dim);font-style:italic">Personne encore... les boys dorment encore deboutte. 😴</p>`
        }
      </div>

      <!-- Boutons d'action -->
      ${name ? `
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:0.75rem">
        <button
          class="btn ${isHost ? 'btn-primary' : 'btn-secondary'}"
          style="flex:1;min-width:140px"
          onclick="toggleHost('${g.id}')">
          ${isHost ? '🏠 T\'héberges déjà ✓' : hasHost ? `🏠 Hébergé par ${escHtml(wp.host)}` : '🏠 J\'héberge ça !'}
        </button>
        <button
          class="btn ${isGoing ? 'btn-primary' : 'btn-ghost'}"
          style="flex:1;min-width:140px"
          onclick="toggleAttend('${g.id}')">
          ${isGoing ? '🍺 Je serai là ✓' : '🍺 J\'y serai !'}
        </button>
      </div>
      ${isHost && !isGoing ? `<p style="font-size:0.75rem;color:var(--text-dim);margin-top:0.4rem;font-style:italic">💡 T\'es l\'hôte — clique "J\'y serai" pour confirmer ta présence aussi.</p>` : ''}
      ` : `<p style="font-size:0.82rem;color:var(--text-dim);font-style:italic">Connecte-toi pour indiquer ta présence.</p>`}
    </div>`;
  }).join('');
}

function toggleHost(gameId) {
  if (!currentUser) return;
  const wp = watchParties[gameId];
  if (wp.host === currentUser.name) {
    wp.host = null; // annuler
  } else {
    wp.host = currentUser.name;
  }
  saveStorage();
  renderWatchParties();
  showToast(wp.host ? `🏠 ${currentUser.name} héberge le ${WATCH_GAMES.find(g=>g.id===gameId).date} !` : '🏠 Hébergement annulé.', wp.host ? 'success' : 'warning');
}

function toggleAttend(gameId) {
  if (!currentUser) return;
  const wp = watchParties[gameId];
  const idx = wp.attendees.indexOf(currentUser.name);
  if (idx >= 0) {
    wp.attendees.splice(idx, 1);
    showToast('Présence annulée.', 'warning');
  } else {
    wp.attendees.push(currentUser.name);
    showToast(`🍺 ${currentUser.name} sera là !`, 'success');
  }
  saveStorage();
  renderWatchParties();
}

function renderWatchPartySummary() {
  const el = document.getElementById('watchparty-summary');
  if (!el) return;

  // Build per-coach engagement stats
  const KNOWN_COACHES = ['Foug','Killer','Stich','Rod','Lowis','Jo','Bloke','Begood'];
  const allNames = new Set([
    ...KNOWN_COACHES,
    ...Object.values(watchParties).flatMap(wp => [wp.host, ...wp.attendees].filter(Boolean))
  ]);

  const rows = [...allNames].map(name => {
    const hosted   = WATCH_GAMES.filter(g => watchParties[g.id]?.host === name).length;
    const attending = WATCH_GAMES.filter(g => watchParties[g.id]?.attendees.includes(name)).length;
    const total = hosted + attending;
    let medal = '😴';
    let label = 'En mode grotte';
    if (hosted >= 1 && attending >= 1) { medal = '🏆'; label = 'Coach de l\'année'; }
    else if (hosted >= 1)  { medal = '🏠'; label = 'Hôte dévoué'; }
    else if (attending >= 2){ medal = '🍺🍺'; label = 'Participant assidu'; }
    else if (attending >= 1){ medal = '🍺'; label = 'Montre des signes de vie'; }
    return { name, hosted, attending, total, medal, label };
  }).sort((a,b) => b.total - a.total);

  el.innerHTML = `<div style="display:flex;flex-direction:column;gap:0.4rem">` +
    rows.map((r, i) => `
      <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.75rem;background:var(--surface-2);border-radius:10px;${r.name === currentUser?.name ? 'border:1px solid var(--accent)' : ''}">
        <span style="font-size:1.1rem;min-width:24px;text-align:center">${r.medal}</span>
        <span style="font-weight:700;flex:1">${escHtml(r.name)}${r.name === currentUser?.name ? ' <span style="font-size:0.7rem;color:var(--accent)">(toi)</span>' : ''}</span>
        ${r.hosted   ? `<span style="font-size:0.75rem;background:rgba(245,158,11,0.15);color:#d97706;border-radius:12px;padding:0.2rem 0.5rem">🏠 ×${r.hosted}</span>` : ''}
        ${r.attending ? `<span style="font-size:0.75rem;background:rgba(16,185,129,0.15);color:#059669;border-radius:12px;padding:0.2rem 0.5rem">🍺 ×${r.attending}</span>` : ''}
        <span style="font-size:0.75rem;color:var(--text-dim)">${escHtml(r.label)}</span>
      </div>`
    ).join('') +
  `</div>`;
}

// ============================================================
// Twemoji — rendu uniforme des drapeaux sur tous les appareils
// S'applique automatiquement à chaque mise à jour du DOM
// ============================================================
(function () {
  var _twTimer = null;

  function applyTwemoji() {
    if (typeof twemoji === 'undefined') return;
    twemoji.parse(document.body, {
      folder: 'svg',
      ext: '.svg'
    });
  }

  // Ré-applique twemoji 120ms après chaque modification du DOM (debounce)
  var twObserver = new MutationObserver(function () {
    clearTimeout(_twTimer);
    _twTimer = setTimeout(applyTwemoji, 120);
  });

  document.addEventListener('DOMContentLoaded', function () {
    twObserver.observe(document.body, { childList: true, subtree: true });
    applyTwemoji();
  });
}());
