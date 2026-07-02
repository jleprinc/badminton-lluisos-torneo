// ---------- Storage (everything lives only in this browser) ----------
const STORAGE_KEY = 'badmintonTournamentState';

function defaultState() {
  return {
    tournamentName: 'Club Badminton Tournament',
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

    let bestTeams = null;
    let bestPartnerRepeats = Infinity;
    for (let attempt = 0; attempt < MAX_ATTEMPTS && bestPartnerRepeats > 0; attempt++) {
      const candidate = buildLevelBalancedTeams(playing);
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
    teams.forEach(t => partnerHistory.add(pairKey(t[0], t[1])));

    let bestOrder = null;
    let bestOpponentPairs = null;
    let bestOpponentRepeats = Infinity;
    for (let attempt = 0; attempt < MAX_ATTEMPTS && bestOpponentRepeats > 0; attempt++) {
      const candidateOrder = shuffle(teams);
      const pairsThisArrangement = [];
      let repeats = 0;
      for (let g = 0; g < numGames; g++) {
        const t1 = candidateOrder[g * 2];
        const t2 = candidateOrder[g * 2 + 1];
        for (const p1 of t1) {
          for (const p2 of t2) {
            const key = pairKey(p1, p2);
            pairsThisArrangement.push(key);
            if (opponentHistory.has(key)) repeats++;
          }
        }
      }
      if (repeats < bestOpponentRepeats) {
        bestOpponentRepeats = repeats;
        bestOrder = candidateOrder;
        bestOpponentPairs = pairsThisArrangement;
      }
    }
    bestOpponentPairs.forEach(key => opponentHistory.add(key));

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
  const name = prompt('Tournament name', state.tournamentName);
  if (name && name.trim()) {
    state.tournamentName = name.trim();
    saveState();
    render();
  }
});

// ---------- Reset ----------
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('This permanently deletes all players, the schedule and scores from this browser. Continue?')) return;
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
          <option value="1" ${p.level === 1 ? 'selected' : ''}>1 (strongest)</option>
          <option value="2" ${p.level === 2 ? 'selected' : ''}>2</option>
          <option value="3" ${p.level === 3 ? 'selected' : ''}>3</option>
        </select>
      </td>
      <td><button class="danger" data-id="${p.id}" data-action="delete">Remove</button></td>
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
      if (!confirm('Remove this player? If a schedule was already generated, regenerate it afterwards.')) return;
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
    alert('Add at least 4 players before generating a schedule');
    return;
  }
  if (state.rounds.length > 0 && !confirm('This replaces the current schedule and any scores entered. Continue?')) return;
  state.settings = { numCourts, numRounds };
  state.rounds = generateSchedule(state.players, numCourts, numRounds);
  saveState();
  render();
  document.querySelector('.tab-btn[data-tab="schedule"]').click();
});

// ---------- Schedule ----------
function playerName(id) {
  const p = state.players.find(p => p.id === id);
  return p ? p.name : '(removed player)';
}

function renderSchedule() {
  const container = document.getElementById('scheduleContent');
  container.innerHTML = '';

  if (!state.rounds || state.rounds.length === 0) {
    container.innerHTML = '<div class="empty-state">No schedule yet. Add players and generate one from the Players tab.</div>';
    return;
  }

  state.rounds.forEach(round => {
    const block = document.createElement('div');
    block.className = 'round-block';

    const restingNames = round.resting.map(playerName).join(', ');
    block.innerHTML = `
      <h3>Round ${round.roundNumber}</h3>
      ${round.resting.length ? `<div class="resting-note">Resting this round: ${escapeHtml(restingNames)}</div>` : ''}
      <div class="courts-grid"></div>
    `;

    const grid = block.querySelector('.courts-grid');
    const courts = [...new Set(round.games.map(g => g.court))].sort((a, b) => a - b);

    courts.forEach(court => {
      const col = document.createElement('div');
      col.className = 'court-column';
      col.innerHTML = `<h4>Court ${court}</h4>`;

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
        <span>Set ${i + 1}</span>
        <input type="number" min="0" class="set-input" data-set="${i}" data-side="team1" value="${s.team1}">
        <span>-</span>
        <input type="number" min="0" class="set-input" data-set="${i}" data-side="team2" value="${s.team2}">
      </div>
    `).join('')}
    <button class="secondary save-btn">Save score</button>
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
    status.textContent = 'Saved ✓';
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
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No players yet</td></tr>';
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

  // Players sheet
  const playersRows = [
    [`Tournament: ${state.tournamentName}`],
    [],
    ['Name', 'Level'],
    ...state.players.slice().sort((a, b) => a.name.localeCompare(b.name)).map(p => [p.name, p.level])
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(playersRows), 'Players');

  // Schedule sheet
  const scheduleRows = [
    [`Tournament: ${state.tournamentName}`],
    [],
    ['Round', 'Court', 'Order', 'Team 1 - Player A', 'Team 1 - Player B', 'Team 2 - Player A', 'Team 2 - Player B',
      'Set 1 (T1-T2)', 'Set 2 (T1-T2)', 'Set 3 (T1-T2)', 'Sets Won T1', 'Sets Won T2', 'Points T1', 'Points T2']
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
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(scheduleRows), 'Schedule');

  // Resting per round sheet
  const restingRows = [['Round', 'Resting player']];
  state.rounds.forEach(round => {
    if (round.resting.length === 0) {
      restingRows.push([round.roundNumber, '(everyone plays)']);
    } else {
      round.resting.forEach(id => restingRows.push([round.roundNumber, playerName(id)]));
    }
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(restingRows), 'Resting per round');

  // Rankings sheet
  const rankings = computeRankings();
  const rankingsRows = [
    [`Tournament: ${state.tournamentName}`],
    [],
    ['Rank', 'Name', 'Games Played', 'Sets Won', 'Sets Lost', 'Sets Diff', 'Points For', 'Points Against', 'Points Diff'],
    ...rankings.map((r, i) => [i + 1, r.name, r.gamesPlayed, r.setsWon, r.setsLost, r.setsDiff, r.pointsFor, r.pointsAgainst, r.pointsDiff])
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rankingsRows), 'Rankings');

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
