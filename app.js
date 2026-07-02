// ---------- Storage (everything lives only in this browser) ----------
const STORAGE_KEY = 'badmintonTournamentState';

function defaultState() {
  return {
    tournamentName: t('defaultTournamentName'),
    players: [],
    settings: { numCourts: 2, numRounds: 3 },
    rounds: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch (e) {
    console.error('Could not read saved data, starting fresh.', e);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  return Math.random().toString(16).slice(2, 14);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Schedule generation (same logic as the original app) ----------
function pairKey(a, b) {
  return [a, b].sort().join('|');
}

function buildLevelBalancedTeams(playing) {
  const byLevel = shuffle(playing).sort((a, b) => a.level - b.level);
  const teams = [];
  let i = 0, j = byLevel.length - 1;
  while (i < j) {
    teams.push([byLevel[i].id, byLevel[j].id]);
    i++; j--;
  }
  return teams;
}

function buildSameLevelTeams(playing) {
  const teams = [];
  const numTeams = playing.length / 2;
  const byLevel = {
    1: shuffle(playing.filter(p => p.level === 1)),
    2: shuffle(playing.filter(p => p.level === 2)),
    3: shuffle(playing.filter(p => p.level === 3))
  };
  const used = new Set();

  for (const level of [1, 2, 3]) {
    const group = byLevel[level];
    for (let i = 0; i + 1 < group.length && teams.length < numTeams; i += 2) {
      teams.push([group[i].id, group[i + 1].id]);
      used.add(group[i].id);
      used.add(group[i + 1].id);
    }
  }

  // Leftover players (one per level at most) — pair by closest level
  const remaining = shuffle(playing.filter(p => !used.has(p.id)))
    .sort((a, b) => a.level - b.level);
  let ri = 0;
  while (ri + 1 < remaining.length && teams.length < numTeams) {
    teams.push([remaining[ri].id, remaining[ri + 1].id]);
    ri += 2;
  }

  return teams;
}

function generateSchedule(players, numCourts, numRounds) {
  const restCounts = {};
  players.forEach(p => { restCounts[p.id] = 0; });
  const partnerHistory = new Set();
  const opponentHistory = new Set();
  const rounds = [];
  const MAX_ATTEMPTS = 300;

  for (let r = 1; r <= numRounds; r++) {
    const totalPlayers = players.length;
    const numGames = Math.floor(totalPlayers / 4);
    const numPlaying = numGames * 4;
    const numResting = totalPlayers - numPlaying;

    const restCandidates = shuffle(players).sort(
      (a, b) => restCounts[a.id] - restCounts[b.id]
    );
    const resting = restCandidates.slice(0, numResting).map(p => p.id);
    resting.forEach(id => { restCounts[id]++; });

    const playing = players.filter(p => !resting.includes(p.id));

    const sameLevelRound = r === 2;
    const buildTeams = sameLevelRound ? buildSameLevelTeams : buildLevelBalancedTeams;

    let bestTeams = null;
    let bestPartnerRepeats = 5;
    for (let attempt = 0; attempt < MAX_ATTEMPTS && bestPartnerRepeats > 0; attempt++) {
      const candidate = buildTeams(playing);
      const repeats = candidate.reduce(
        (acc, team) => acc + (partnerHistory.has(pairKey(team[0], team[1])) ? 1 : 0),
        0
      );
      if (repeats < bestPartnerRepeats) {
        bestPartnerRepeats = repeats;
        bestTeams = candidate;
      }
    }
    const teams = bestTeams;
    teams.forEach(team => partnerHistory.add(pairKey(team[0], team[1])));

    const getTeamLevel = (team) => {
      return team.map(id => players.find(p => p.id === id).level).reduce((a, b) => a + b);
    };

    let bestOrder = null;
    let bestOpponentPairs = null;
    let bestScore = 5;
    for (let attempt = 0; attempt < MAX_ATTEMPTS && bestScore > 0; attempt++) {
      let candidateOrder;

      if (sameLevelRound && attempt < MAX_ATTEMPTS / 2) {
        const sorted = shuffle(teams).sort((a, b) => getTeamLevel(a) - getTeamLevel(b));
        candidateOrder = [];
        for (let i = 0; i + 1 < sorted.length; i += 2) {
          candidateOrder.push(sorted[i], sorted[i + 1]);
        }
      } else {
        candidateOrder = shuffle(teams);
      }

      const pairsThisArrangement = [];
      let repeats = 0;
      let levelGap = 0;
      for (let g = 0; g < numGames; g++) {
        const t1 = candidateOrder[g * 2];
        const t2 = candidateOrder[g * 2 + 1];
        if (sameLevelRound) levelGap += Math.abs(getTeamLevel(t1) - getTeamLevel(t2));
        for (const p1 of t1) {
          for (const p2 of t2) {
            const key = pairKey(p1, p2);
            pairsThisArrangement.push(key);
            if (opponentHistory.has(key)) repeats++;
          }
        }
      }
      const score = repeats * 10 + levelGap;
      if (score < bestScore) {
        bestScore = score;
        bestOrder = candidateOrder;
        bestOpponentPairs = pairsThisArrangement;
      }
    }
    bestOpponentPairs.forEach(key => opponentHistory.add(key));

    // Rebalance matches where the level gap is too big (>2) by swapping players
    if (sameLevelRound) {
      for (let g = 0; g < numGames; g++) {
        const t1 = bestOrder[g * 2];
        const t2 = bestOrder[g * 2 + 1];
        const gap = Math.abs(getTeamLevel(t1) - getTeamLevel(t2));
        if (gap > 2) {
          // Try all swaps between the two teams, pick the one with smallest gap
          let bestGap = gap;
          let bestSwap = null;
          for (let a = 0; a < 2; a++) {
            for (let b = 0; b < 2; b++) {
              const newT1 = [t1[1 - a], t2[b]];
              const newT2 = [t1[a], t2[1 - b]];
              const newGap = Math.abs(getTeamLevel(newT1) - getTeamLevel(newT2));
              if (newGap < bestGap) {
                bestGap = newGap;
                bestSwap = [newT1, newT2];
              }
            }
          }
          if (bestSwap) {
            bestOrder[g * 2] = bestSwap[0];
            bestOrder[g * 2 + 1] = bestSwap[1];
          }
        }
      }
    }

    const games = [];
    for (let g = 0; g < numGames; g++) {
      games.push({
        id: uid(),
        court: (g % numCourts) + 1,
        order: Math.floor(g / numCourts) + 1,
        team1: bestOrder[g * 2],
        team2: bestOrder[g * 2 + 1],
        sets: []
      });
    }

    rounds.push({ roundNumber: r, resting, games });
  }

  return rounds;
}

// ---------- Rankings ----------
function computeRankings() {
  const stats = {};
  state.players.forEach(p => {
    stats[p.id] = {
      id: p.id, name: p.name, level: p.level,
      gamesPlayed: 0, setsWon: 0, setsLost: 0, pointsFor: 0, pointsAgainst: 0
    };
  });

  state.rounds.forEach(round => {
    round.games.forEach(game => {
      if (!game.sets || game.sets.length === 0) return;
      let team1Sets = 0, team2Sets = 0, team1Points = 0, team2Points = 0;
      game.sets.forEach(s => {
        team1Points += s.team1;
        team2Points += s.team2;
        if (s.team1 > s.team2) team1Sets++;
        else if (s.team2 > s.team1) team2Sets++;
      });

      [game.team1, game.team2].forEach((team, idx) => {
        const isTeam1 = idx === 0;
        const setsWon = isTeam1 ? team1Sets : team2Sets;
        const setsLost = isTeam1 ? team2Sets : team1Sets;
        const pointsFor = isTeam1 ? team1Points : team2Points;
        const pointsAgainst = isTeam1 ? team2Points : team1Points;
        team.forEach(pid => {
          if (!stats[pid]) return;
          stats[pid].gamesPlayed++;
          stats[pid].setsWon += setsWon;
          stats[pid].setsLost += setsLost;
          stats[pid].pointsFor += pointsFor;
          stats[pid].pointsAgainst += pointsAgainst;
        });
      });
    });
  });

  const list = Object.values(stats).map(s => ({
    ...s,
    setsDiff: s.setsWon - s.setsLost,
    pointsDiff: s.pointsFor - s.pointsAgainst
  }));

  list.sort((a, b) =>
    b.setsDiff - a.setsDiff ||
    b.pointsDiff - a.pointsDiff ||
    a.name.localeCompare(b.name)
  );

  return list;
}

// ---------- Tabs ----------
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'rankings') renderRankings();
  });
});

// ---------- Title ----------
document.getElementById('editTitleBtn').addEventListener('click', () => {
  const name = prompt(t('promptTournamentName'), state.tournamentName);
  if (name && name.trim()) {
    state.tournamentName = name.trim();
    saveState();
    render();
  }
});

// ---------- Reset ----------
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm(t('confirmReset'))) return;
  state = defaultState();
  saveState();
  render();
});

// ---------- Players ----------
document.getElementById('addPlayerForm').addEventListener('submit', e => {
  e.preventDefault();
  const nameInput = document.getElementById('playerName');
  const name = nameInput.value.trim();
  const level = Number(document.getElementById('playerLevel').value);
  if (!name) return;
  state.players.push({ id: uid(), name, level });
  saveState();
  nameInput.value = '';
  nameInput.focus();
  render();
});

function renderPlayers() {
  document.getElementById('playerCount').textContent = state.players.length;
  const tbody = document.querySelector('#playersTable tbody');
  tbody.innerHTML = '';
  const sorted = state.players.slice().sort((a, b) => a.name.localeCompare(b.name));
  sorted.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = 'player-row';
    tr.innerHTML = `
      <td>${escapeHtml(p.name)}</td>
      <td>
        <select data-id="${p.id}" class="level-select">
          <option value="1" ${p.level === 1 ? 'selected' : ''}>${escapeHtml(t('rowLevel1'))}</option>
          <option value="2" ${p.level === 2 ? 'selected' : ''}>${escapeHtml(t('rowLevel2'))}</option>
          <option value="3" ${p.level === 3 ? 'selected' : ''}>${escapeHtml(t('rowLevel3'))}</option>
        </select>
      </td>
      <td><button class="danger" data-id="${p.id}" data-action="delete">${escapeHtml(t('removeBtn'))}</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.level-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const p = state.players.find(p => p.id === sel.dataset.id);
      if (p) p.level = Number(sel.value);
      saveState();
      render();
    });
  });

  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm(t('confirmRemovePlayer'))) return;
      state.players = state.players.filter(p => p.id !== btn.dataset.id);
      saveState();
      render();
    });
  });
}

// ---------- Generate schedule ----------
document.getElementById('generateForm').addEventListener('submit', e => {
  e.preventDefault();
  const numCourts = Math.max(1, Number(document.getElementById('numCourts').value) || 2);
  const numRounds = Math.max(1, Number(document.getElementById('numRounds').value) || 3);
  if (state.players.length < 4) {
    alert(t('needFourPlayers'));
    return;
  }
  if (state.rounds.length > 0 && !confirm(t('confirmRegenerate'))) return;
  state.settings = { numCourts, numRounds };
  state.rounds = generateSchedule(state.players, numCourts, numRounds);
  saveState();
  render();
  document.querySelector('.tab-btn[data-tab="schedule"]').click();
});

// ---------- Schedule ----------
function playerName(id) {
  const p = state.players.find(p => p.id === id);
  return p ? p.name : t('removedPlayer');
}

function renderSchedule() {
  const container = document.getElementById('scheduleContent');
  container.innerHTML = '';

  if (!state.rounds || state.rounds.length === 0) {
    container.innerHTML = `<div class="empty-state">${escapeHtml(t('noScheduleYet'))}</div>`;
    return;
  }

  state.rounds.forEach(round => {
    const block = document.createElement('div');
    block.className = 'round-block';

    const restingNames = round.resting.map(playerName).join(', ');
    block.innerHTML = `
      <h3>${escapeHtml(t('round'))} ${round.roundNumber}</h3>
      ${round.resting.length ? `<div class="resting-note">${escapeHtml(t('restingLabel'))}: ${escapeHtml(restingNames)}</div>` : ''}
      <div class="courts-grid"></div>
    `;

    const grid = block.querySelector('.courts-grid');
    const courts = [...new Set(round.games.map(g => g.court))].sort((a, b) => a - b);

    courts.forEach(court => {
      const col = document.createElement('div');
      col.className = 'court-column';
      col.innerHTML = `<h4>${escapeHtml(t('court'))} ${court}</h4>`;

      const games = round.games.filter(g => g.court === court).sort((a, b) => a.order - b.order);
      games.forEach(game => {
        col.appendChild(renderGameCard(round.roundNumber, game));
      });

      grid.appendChild(col);
    });

    container.appendChild(block);
  });
}

function renderGameCard(roundNumber, game) {
  const card = document.createElement('div');
  card.className = 'game-card';

  const team1 = `${playerName(game.team1[0])} & ${playerName(game.team1[1])}`;
  const team2 = `${playerName(game.team2[0])} & ${playerName(game.team2[1])}`;

  const existingSets = [0, 1, 2].map(i => game.sets[i] || { team1: '', team2: '' });

  card.innerHTML = `
    <div class="game-teams"><strong>${escapeHtml(team1)}</strong><span class="vs">vs</span><strong>${escapeHtml(team2)}</strong></div>
    ${existingSets.map((s, i) => `
      <div class="sets-row">
        <span>${escapeHtml(t('setLabel'))} ${i + 1}</span>
        <input type="number" min="0" class="set-input" data-set="${i}" data-side="team1" value="${s.team1}">
        <span>-</span>
        <input type="number" min="0" class="set-input" data-set="${i}" data-side="team2" value="${s.team2}">
      </div>
    `).join('')}
    <button class="secondary save-btn">${escapeHtml(t('saveScoreBtn'))}</button>
    <span class="save-status"></span>
  `;

  card.querySelector('.save-btn').addEventListener('click', () => {
    const sets = [0, 1, 2]
      .map(i => ({
        team1: card.querySelector(`[data-set="${i}"][data-side="team1"]`).value,
        team2: card.querySelector(`[data-set="${i}"][data-side="team2"]`).value
      }))
      .filter(s => s.team1 !== '' && s.team2 !== '' && !Number.isNaN(Number(s.team1)) && !Number.isNaN(Number(s.team2)))
      .map(s => ({ team1: Number(s.team1), team2: Number(s.team2) }));

    const round = state.rounds.find(r => r.roundNumber === roundNumber);
    const g = round.games.find(g => g.id === game.id);
    g.sets = sets;
    saveState();

    const status = card.querySelector('.save-status');
    status.textContent = t('savedLabel');
    setTimeout(() => { status.textContent = ''; }, 2000);
    renderRankings();
  });

  return card;
}

// ---------- Rankings ----------
function renderRankings() {
  const rankings = computeRankings();
  const tbody = document.querySelector('#rankingsTable tbody');
  tbody.innerHTML = '';
  if (rankings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${escapeHtml(t('noPlayersYet'))}</td></tr>`;
    return;
  }
  rankings.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${escapeHtml(r.name)}</td>
      <td>${r.gamesPlayed}</td>
      <td>${r.setsDiff > 0 ? '+' : ''}${r.setsDiff}</td>
      <td>${r.pointsDiff > 0 ? '+' : ''}${r.pointsDiff}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------- Excel export (built entirely in the browser) ----------
document.getElementById('exportBtn').addEventListener('click', () => {
  const wb = XLSX.utils.book_new();
  const tPrefix = t('xlsTournamentPrefix');

  // Players sheet
  const playersRows = [
    [`${tPrefix} ${state.tournamentName}`],
    [],
    [t('xlsColName'), t('xlsColLevel')],
    ...state.players.slice().sort((a, b) => a.name.localeCompare(b.name)).map(p => [p.name, p.level])
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(playersRows), t('xlsPlayersSheet'));

  // Schedule sheet
  const scheduleRows = [
    [`${tPrefix} ${state.tournamentName}`],
    [],
    [t('xlsColRound'), t('xlsColCourt'), t('xlsColOrder'), t('xlsColTeam1A'), t('xlsColTeam1B'), t('xlsColTeam2A'), t('xlsColTeam2B'),
      t('xlsColSet1'), t('xlsColSet2'), t('xlsColSet3'), t('xlsColSetsWonT1'), t('xlsColSetsWonT2'), t('xlsColPointsT1'), t('xlsColPointsT2')]
  ];
  state.rounds.forEach(round => {
    const games = round.games.slice().sort((a, b) => a.court - b.court || a.order - b.order);
    games.forEach(game => {
      let t1Sets = 0, t2Sets = 0, t1Points = 0, t2Points = 0;
      const setStrings = [0, 1, 2].map(i => {
        const s = game.sets[i];
        if (!s) return '';
        t1Points += s.team1;
        t2Points += s.team2;
        if (s.team1 > s.team2) t1Sets++;
        else if (s.team2 > s.team1) t2Sets++;
        return `${s.team1}-${s.team2}`;
      });
      scheduleRows.push([
        round.roundNumber, game.court, game.order,
        playerName(game.team1[0]), playerName(game.team1[1]),
        playerName(game.team2[0]), playerName(game.team2[1]),
        setStrings[0], setStrings[1], setStrings[2],
        game.sets.length ? t1Sets : '', game.sets.length ? t2Sets : '',
        game.sets.length ? t1Points : '', game.sets.length ? t2Points : ''
      ]);
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(scheduleRows), t('xlsScheduleSheet'));

  // Resting per round sheet
  const restingRows = [[t('xlsColRound'), t('xlsColRestingPlayer')]];
  state.rounds.forEach(round => {
    if (round.resting.length === 0) {
      restingRows.push([round.roundNumber, t('xlsEveryonePlays')]);
    } else {
      round.resting.forEach(id => restingRows.push([round.roundNumber, playerName(id)]));
    }
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(restingRows), t('xlsRestingSheet'));

  // Rankings sheet
  const rankings = computeRankings();
  const rankingsRows = [
    [`${tPrefix} ${state.tournamentName}`],
    [],
    [t('xlsColRank'), t('xlsColName'), t('xlsColGamesPlayed'), t('xlsColSetsWon'), t('xlsColSetsLost'), t('xlsColSetsDiff'), t('xlsColPointsFor'), t('xlsColPointsAgainst'), t('xlsColPointsDiff')],
    ...rankings.map((r, i) => [i + 1, r.name, r.gamesPlayed, r.setsWon, r.setsLost, r.setsDiff, r.pointsFor, r.pointsAgainst, r.pointsDiff])
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rankingsRows), t('xlsRankingsSheet'));

  const safeName = (state.tournamentName || 'tournament').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${safeName}-${dateStr}.xlsx`);
});

// ---------- Render all ----------
function render() {
  document.getElementById('tournamentTitle').textContent = state.tournamentName;
  document.getElementById('numCourts').value = state.settings.numCourts;
  document.getElementById('numRounds').value = state.settings.numRounds;
  renderPlayers();
  renderSchedule();
  renderRankings();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

render();
