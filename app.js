/* ============================================================
   ITCILO World Cup 2026 - Application Logic
   ============================================================ */

const STORAGE_KEY = 'itcilo_wc2026_v1';

// ============================================================
// State
// ============================================================
let currentUser = null;
let allUsers = [];
let activeTab = 'home';
let activeStagTab = 'groups';
let teamsFilter = 'ALL';
let teamsSearch = '';
let teamsSort = 'prob';
let openTeamModal = null;

// ============================================================
// Storage helpers
// ============================================================
function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { users: [], currentUserId: null };
    return JSON.parse(raw);
  } catch { return { users: [], currentUserId: null }; }
}

function saveStorage() {
  const data = { users: allUsers, currentUserId: currentUser ? currentUser.id : null };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function createEmptyPredictions() {
  return {
    champion: null,
    groups: {}, // { A: { first: teamId, second: teamId }, ... }
    third: [],  // up to 8 teamIds selected as 3rd-place qualifiers
    r32: {},    // { R32_1: teamId, ... }
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
  allUsers = data.users || [];
  currentUser = allUsers.find(u => u.id === data.currentUserId) || null;

  // Migrate old predictions if needed
  allUsers.forEach(u => {
    if (!u.predictions) u.predictions = createEmptyPredictions();
    if (!u.predictions.third) u.predictions.third = [];
  });

  if (currentUser) {
    showMainApp();
  } else {
    showLoginScreen();
  }
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
        <div class="existing-user-pick">${u.predictions.champion ? '🏆 ' + TEAMS[u.predictions.champion].flag + ' ' + TEAMS[u.predictions.champion].name : 'No champion picked yet'}</div>
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
          <strong>Who will win the 2026 World Cup?</strong>
          Click here to browse teams and place your champion bet
        </div>
      </div>
    `;
  }

  // My bracket summary
  const bracketSummary = document.getElementById('my-bracket-summary');
  bracketSummary.innerHTML = `
    <div class="bracket-progress-rings" style="margin-top:0.75rem">
      ${renderProgressRing('Groups', completedPredictions.groups, 12)}
      ${renderProgressRing('Round of 32', completedPredictions.r32, 16)}
      ${renderProgressRing('Round of 16', completedPredictions.r16, 8)}
      ${renderProgressRing('Quarter-finals', completedPredictions.qf, 4)}
      ${renderProgressRing('Semi-finals', completedPredictions.sf, 2)}
      ${renderProgressRing('Final', completedPredictions.final, 1)}
    </div>
    ${completedPredictions.total === 0 ? `
      <div style="margin-top:1rem">
        <button class="btn btn-secondary btn-sm" onclick="showTab('bracket')">Fill in my bracket →</button>
      </div>
    ` : completedPredictions.total < 44 ? `
      <div style="margin-top:1rem">
        <button class="btn btn-secondary btn-sm" onclick="showTab('bracket')">Continue filling bracket →</button>
      </div>
    ` : `
      <div class="alert alert-success" style="margin-top:1rem">
        <span class="alert-icon">✅</span>
        Your bracket is complete! Good luck!
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
    container.innerHTML = '<p class="text-muted text-sm">No predictions yet. Be the first!</p>';
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
        <span style="font-size:0.8rem;font-weight:700;color:var(--accent)">${count} pick${count>1?'s':''}</span>
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
  document.getElementById('modal-prob-context').textContent = `Ranked ${rank}${getOrdSuffix(rank)} favourite out of 48 teams`;

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
  pickBtn.textContent = isPick ? '✅ Your Current Champion Pick' : `🏆 Pick ${team.name} as Champion`;
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
  pickBtn.textContent = `✅ Your Current Champion Pick`;
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
  const stages = ['groups', 'r32', 'r16', 'qf', 'sf', 'thirdplace', 'final'];
  const totals = { groups: 12, r32: 16, r16: 8, qf: 4, sf: 2, thirdplace: 1, final: 1 };
  const done = {
    groups: Object.values(picks.groups).filter(g => g.first && g.second).length,
    r32: Object.keys(picks.r32).length,
    r16: Object.keys(picks.r16).length,
    qf: Object.keys(picks.qf).length,
    sf: Object.keys(picks.sf).length,
    thirdplace: picks.thirdplace ? 1 : 0,
    final: picks.final ? 1 : 0,
  };
  const labels = { groups: 'Groups', r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter-Finals', sf: 'Semi-Finals', thirdplace: '3rd Place', final: 'Final' };

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
    case 'groups': container.innerHTML = renderGroupsStage(); break;
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
        <h2 class="bracket-title">Group Stage Predictions</h2>
        <p class="bracket-desc">Click teams to select who you think will finish 1st (gold) and 2nd (green) in each group.<br>The top 2 from each group advance directly to the Round of 32. The best 8 third-placed teams also qualify.</p>
      </div>
      <div class="bracket-progress-rings">
        <div class="progress-ring-item">
          <div class="progress-ring-value">${complete}</div>
          <div class="progress-ring-total">/ 12</div>
          <div class="progress-ring-label">Groups done</div>
        </div>
      </div>
    </div>
    ${complete === 12 ? `<div class="alert alert-success"><span class="alert-icon">✅</span>All group predictions complete! Continue to Round of 32 →</div>` : ''}
    <div class="groups-grid">
      ${Object.keys(GROUPS).map(g => renderGroupCard(g, GROUPS[g], picks[g] || {})).join('')}
    </div>
    <div style="margin-top:1.5rem">
      <button class="btn btn-secondary" onclick="showStage('r32')">Continue to Round of 32 →</button>
    </div>
  `;
}

function renderGroupCard(groupId, teamIds, groupPicks) {
  const complete = groupPicks.first && groupPicks.second;
  return `
    <div class="group-card${complete ? ' complete' : ''}" id="group-card-${groupId}">
      <div class="group-card-header">
        <span class="group-name">Group ${groupId}</span>
        <span class="group-pick-hint">${complete ? '✅ Complete' : 'Click: 1st → 2nd'}</span>
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
    rankBadge = '<span class="group-rank-badge rank-badge-1">1st</span>';
  } else if (groupPicks.second === teamId) {
    rankClass = 'rank-2';
    rankBadge = '<span class="group-rank-badge rank-badge-2">2nd</span>';
  } else if (groupPicks.first && groupPicks.second) {
    rankClass = 'rank-3';
    rankBadge = '<span class="group-rank-badge rank-badge-3">Out</span>';
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
  const prevStages = { r32: 'groups', r16: 'r32', qf: 'r16', sf: 'qf', thirdplace: 'sf', final: 'thirdplace' };

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
    ${done === total ? `<div class="alert alert-success"><span class="alert-icon">✅</span>All ${title} predictions complete!</div>` : ''}
    <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;flex-wrap:wrap">
      ${prevStages[stageKey] ? `<button class="btn btn-ghost btn-sm" onclick="showStage('${prevStages[stageKey]}')">← Back</button>` : ''}
      ${nextStages[stageKey] ? `<button class="btn btn-secondary btn-sm" onclick="showStage('${nextStages[stageKey]}')">Continue to next round →</button>` : ''}
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
        ${isDone ? `<span style="color:var(--accent-green);font-size:0.7rem">✓ Decided</span>` : `<span>Pick winner</span>`}
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
          <div style="font-size:0.875rem">Pick ${sfId} winner first</div>
          <button class="btn btn-ghost btn-sm" style="margin-top:0.75rem" onclick="showStage('sf')">Go to Semi-Finals</button>
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
          ${isWinner ? `<div class="prob-pill">🏆 Your Champion!</div>` : `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.4rem">Click to pick as champion</div>`}
        </div>
        ${isWinner ? `<span style="font-size:2rem">🏆</span>` : ''}
      </div>
    `;
  };

  return `
    <div class="bracket-hero">
      <div>
        <h2 class="bracket-title">The Final</h2>
        <p class="bracket-desc">The ultimate match. Pick your World Cup 2026 Champion.</p>
      </div>
    </div>
    ${finalWinner ? `<div class="alert alert-success"><span class="alert-icon">🏆</span>You picked <strong>${TEAMS[finalWinner].flag} ${TEAMS[finalWinner].name}</strong> as your World Cup Champion!</div>` : ''}
    <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem">
      <button class="btn btn-ghost btn-sm" onclick="showStage('sf')">← Back to Semi-Finals</button>
    </div>
    <div style="text-align:center;font-size:0.875rem;color:var(--text-muted);margin-bottom:1rem">Click on a finalist to pick them as Champion</div>
    <div class="grid-2" style="max-width:700px;margin:0 auto">
      ${renderFinalist(sf1Winner, 'Semi-Final 1')}
      ${renderFinalist(sf2Winner, 'Semi-Final 2')}
    </div>
    ${sf1Winner && sf2Winner ? `
      <div style="text-align:center;margin:1.5rem 0;font-size:1.25rem;color:var(--text-dim)">VS</div>
    ` : ''}
  `;
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
          <div style="font-size:0.875rem">${label} — pick Semi-Final winners first</div>
          <button class="btn btn-ghost btn-sm" style="margin-top:0.75rem" onclick="showStage('sf')">Go to Semi-Finals</button>
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
          ${isWinner ? `<div class="prob-pill" style="background:rgba(46,125,50,0.15);color:var(--accent-green);border-color:rgba(46,125,50,0.3)">🥉 Your 3rd Place pick!</div>` : `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.4rem">Click to pick as 3rd place</div>`}
        </div>
        ${isWinner ? `<span style="font-size:2rem">🥉</span>` : ''}
      </div>
    `;
  };

  return `
    <div class="bracket-hero">
      <div>
        <h2 class="bracket-title">3rd Place Match</h2>
        <p class="bracket-desc">The two losing semi-finalists compete for bronze. Pick which team finishes third.</p>
      </div>
    </div>
    ${thirdWinner ? `<div class="alert alert-success"><span class="alert-icon">🥉</span>You picked <strong>${TEAMS[thirdWinner].flag} ${TEAMS[thirdWinner].name}</strong> to finish 3rd!</div>` : ''}
    <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem">
      <button class="btn btn-ghost btn-sm" onclick="showStage('sf')">← Back to Semi-Finals</button>
      <button class="btn btn-secondary btn-sm" onclick="showStage('final')">Continue to Final →</button>
    </div>
    <div style="text-align:center;font-size:0.875rem;color:var(--text-muted);margin-bottom:1rem">Click a team to pick them as 3rd place</div>
    <div class="grid-2" style="max-width:700px;margin:0 auto">
      ${renderContestant(loser1, 'SF1 loser')}
      ${renderContestant(loser2, 'SF2 loser')}
    </div>
  `;
}

function pickFinalWinner(teamId) {
  if (!currentUser.predictions.sf['SF_1'] || !currentUser.predictions.sf['SF_2']) {
    showToast('Please pick your semi-final winners first!', 'warning');
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
    showToast(`${TEAMS[teamId].flag} ${TEAMS[teamId].name} is your World Cup Champion!`);
  }
}

function pickThirdPlaceWinner(teamId) {
  currentUser.predictions.thirdplace = teamId;
  saveStorage();
  showStage('thirdplace');
  showToast(`🥉 ${TEAMS[teamId].name} picked for 3rd place!`, 'success');
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
    const idx = parseInt(slot.replace('3rd-', '')) - 1;
    return (picks.third || [])[idx] || null;
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
          <span class="lb-name">${escHtml(u.name)}${isCurrent ? '<span class="lb-you-tag">YOU</span>' : ''}</span>
        </div>
        <div class="lb-champion">
          ${champion ? `<span class="lb-champion-flag">${champion.flag}</span><span class="lb-champion-name">${escHtml(champion.name)}</span>` : '<span class="no-pick-text-sm">No pick yet</span>'}
        </div>
        <div class="lb-score-col">
          <div class="lb-score">—</div>
          <div class="lb-score-label">pts (TBD)</div>
        </div>
        <div class="lb-bracket">
          <span class="bracket-fill-badge">${done.total} picks</span>
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
  a.download = `itcilo-wc2026-picks-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Predictions exported!');
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
          showToast('Invalid file format', 'error');
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
        showToast(`Imported ${imported.users.length} users!`);
        renderTab(activeTab);
      } catch {
        showToast('Failed to parse file', 'error');
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
