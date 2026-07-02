const LANG_STORAGE_KEY = 'badmintonTournamentLang';

const translations = {
  ca: {
    pageTitle: 'Torneig de Bàdminton',
    defaultTournamentName: 'Torneig de Bàdminton del Club',
    rename: 'canvia el nom',
    exportBtn: 'Exporta a Excel',
    privacyNote: 'Tot el que introdueixis aquí (jugadors, resultats) es desa només en aquest navegador, en aquest dispositiu. No s\'envia enlloc. Fes servir "Exporta a Excel" per compartir els resultats.',
    tabPlayers: 'Jugadors',
    tabSchedule: 'Calendari',
    tabRankings: 'Classificació',

    addPlayerHeading: 'Afegeix un jugador',
    namePlaceholder: 'Nom complet',
    addLevel1: 'Nivell 1 (el més fort)',
    addLevel2: 'Nivell 2',
    addLevel3: 'Nivell 3',
    addPlayerBtn: 'Afegeix jugador',

    playersHeading: 'Jugadors',
    thName: 'Nom',
    thLevel: 'Nivell',
    rowLevel1: '1 (el més fort)',
    rowLevel2: '2',
    rowLevel3: '3',
    removeBtn: 'Elimina',

    generateHeading: 'Genera el calendari',
    generateHint: 'Els jugadors es reparteixen automàticament en parelles equilibrades per nivell (el més fort amb el més fluix) a cada ronda, i mai es repeteix la mateixa parella. Tornar a generar substituirà el calendari actual i els resultats introduïts.',
    courtsLabel: 'Pistes',
    roundsLabel: 'Rondes',
    generateBtn: 'Genera el calendari',

    saveLoadHeading: 'Desa o carrega el torneig',
    saveLoadHint: 'Descarrega el torneig com a fitxer per obrir-lo en un altre navegador o dispositiu.',
    saveJsonBtn: 'Descarrega torneig',
    loadJsonBtn: 'Carrega torneig',
    confirmLoad: 'Això substituirà totes les dades actuals (jugadors, calendari i resultats). Vols continuar?',
    loadError: 'El fitxer no és vàlid. Assegura\'t que és un fitxer descarregat des d\'aquesta aplicació.',
    loadSuccess: 'Torneig carregat correctament!',

    resetHeading: 'Reinicia les dades',
    resetHint: 'Elimina permanentment els jugadors, el calendari i els resultats desats en aquest navegador.',
    resetBtn: 'Reinicia-ho tot',

    noScheduleYet: 'Encara no hi ha cap calendari. Afegeix jugadors i genera\'n un des de la pestanya Jugadors.',
    round: 'Ronda',
    restingLabel: 'Descansen aquesta ronda',
    court: 'Pista',
    setLabel: 'Set',
    saveScoreBtn: 'Desa el resultat',
    savedLabel: 'Desat ✓',
    removedPlayer: '(jugador eliminat)',

    rankName: 'Nom',
    rankGames: 'Partits',
    rankSetsDiff: 'Dif. sets',
    rankPointsDiff: 'Dif. punts',
    noPlayersYet: 'Encara no hi ha jugadors',

    promptTournamentName: 'Nom del torneig',
    needFourPlayers: 'Afegeix almenys 4 jugadors abans de generar un calendari',
    confirmRegenerate: 'Això substituirà el calendari actual i qualsevol resultat introduït. Vols continuar?',
    confirmRemovePlayer: 'Vols eliminar aquest jugador? Si ja havies generat un calendari, torna\'l a generar després.',
    confirmReset: 'Això elimina permanentment tots els jugadors, el calendari i els resultats d\'aquest navegador. Vols continuar?',

    xlsTournamentPrefix: 'Torneig:',
    xlsPlayersSheet: 'Jugadors',
    xlsScheduleSheet: 'Calendari',
    xlsRestingSheet: 'Descansos per ronda',
    xlsRankingsSheet: 'Classificació',
    xlsColName: 'Nom',
    xlsColLevel: 'Nivell',
    xlsColRound: 'Ronda',
    xlsColCourt: 'Pista',
    xlsColOrder: 'Ordre',
    xlsColTeam1A: 'Equip 1 - Jugador A',
    xlsColTeam1B: 'Equip 1 - Jugador B',
    xlsColTeam2A: 'Equip 2 - Jugador A',
    xlsColTeam2B: 'Equip 2 - Jugador B',
    xlsColSet1: 'Set 1 (E1-E2)',
    xlsColSet2: 'Set 2 (E1-E2)',
    xlsColSet3: 'Set 3 (E1-E2)',
    xlsColSetsWonT1: 'Sets guanyats E1',
    xlsColSetsWonT2: 'Sets guanyats E2',
    xlsColPointsT1: 'Punts E1',
    xlsColPointsT2: 'Punts E2',
    xlsColRestingPlayer: 'Jugador que descansa',
    xlsEveryonePlays: '(tothom juga)',
    xlsColRank: 'Posició',
    xlsColGamesPlayed: 'Partits jugats',
    xlsColSetsWon: 'Sets guanyats',
    xlsColSetsLost: 'Sets perduts',
    xlsColSetsDiff: 'Dif. sets',
    xlsColPointsFor: 'Punts a favor',
    xlsColPointsAgainst: 'Punts en contra',
    xlsColPointsDiff: 'Dif. punts'
  },

  es: {
    pageTitle: 'Torneo de Bádminton',
    defaultTournamentName: 'Torneo de Bádminton del Club',
    rename: 'cambiar nombre',
    exportBtn: 'Exportar a Excel',
    privacyNote: 'Todo lo que introduzcas aquí (jugadores, resultados) se guarda solo en este navegador, en este dispositivo. No se envía a ningún sitio. Usa "Exportar a Excel" para compartir los resultados.',
    tabPlayers: 'Jugadores',
    tabSchedule: 'Calendario',
    tabRankings: 'Clasificación',

    addPlayerHeading: 'Añadir un jugador',
    namePlaceholder: 'Nombre completo',
    addLevel1: 'Nivel 1 (el más fuerte)',
    addLevel2: 'Nivel 2',
    addLevel3: 'Nivel 3',
    addPlayerBtn: 'Añadir jugador',

    playersHeading: 'Jugadores',
    thName: 'Nombre',
    thLevel: 'Nivel',
    rowLevel1: '1 (el más fuerte)',
    rowLevel2: '2',
    rowLevel3: '3',
    removeBtn: 'Eliminar',

    generateHeading: 'Generar el calendario',
    generateHint: 'Los jugadores se reparten automáticamente en parejas equilibradas por nivel (el más fuerte con el más flojo) en cada ronda, y nunca se repite la misma pareja. Volver a generar sustituirá el calendario actual y los resultados introducidos.',
    courtsLabel: 'Pistas',
    roundsLabel: 'Rondas',
    generateBtn: 'Generar el calendario',

    saveLoadHeading: 'Guardar o cargar el torneo',
    saveLoadHint: 'Descarga el torneo como archivo para abrirlo en otro navegador o dispositivo.',
    saveJsonBtn: 'Descargar torneo',
    loadJsonBtn: 'Cargar torneo',
    confirmLoad: 'Esto sustituirá todos los datos actuales (jugadores, calendario y resultados). ¿Quieres continuar?',
    loadError: 'El archivo no es válido. Asegúrate de que es un archivo descargado desde esta aplicación.',
    loadSuccess: '¡Torneo cargado correctamente!',

    resetHeading: 'Reiniciar los datos',
    resetHint: 'Elimina permanentemente los jugadores, el calendario y los resultados guardados en este navegador.',
    resetBtn: 'Reiniciar todo',

    noScheduleYet: 'Todavía no hay ningún calendario. Añade jugadores y genera uno desde la pestaña Jugadores.',
    round: 'Ronda',
    restingLabel: 'Descansan esta ronda',
    court: 'Pista',
    setLabel: 'Set',
    saveScoreBtn: 'Guardar resultado',
    savedLabel: 'Guardado ✓',
    removedPlayer: '(jugador eliminado)',

    rankName: 'Nombre',
    rankGames: 'Partidos',
    rankSetsDiff: 'Dif. sets',
    rankPointsDiff: 'Dif. puntos',
    noPlayersYet: 'Todavía no hay jugadores',

    promptTournamentName: 'Nombre del torneo',
    needFourPlayers: 'Añade al menos 4 jugadores antes de generar un calendario',
    confirmRegenerate: 'Esto sustituirá el calendario actual y cualquier resultado introducido. ¿Quieres continuar?',
    confirmRemovePlayer: 'Quieres eliminar a este jugador? Si ya habías generado un calendario, vuelve a generarlo después.',
    confirmReset: 'Esto elimina permanentemente todos los jugadores, el calendario y los resultados de este navegador. ¿Quieres continuar?',

    xlsTournamentPrefix: 'Torneo:',
    xlsPlayersSheet: 'Jugadores',
    xlsScheduleSheet: 'Calendario',
    xlsRestingSheet: 'Descansos por ronda',
    xlsRankingsSheet: 'Clasificación',
    xlsColName: 'Nombre',
    xlsColLevel: 'Nivel',
    xlsColRound: 'Ronda',
    xlsColCourt: 'Pista',
    xlsColOrder: 'Orden',
    xlsColTeam1A: 'Equipo 1 - Jugador A',
    xlsColTeam1B: 'Equipo 1 - Jugador B',
    xlsColTeam2A: 'Equipo 2 - Jugador A',
    xlsColTeam2B: 'Equipo 2 - Jugador B',
    xlsColSet1: 'Set 1 (E1-E2)',
    xlsColSet2: 'Set 2 (E1-E2)',
    xlsColSet3: 'Set 3 (E1-E2)',
    xlsColSetsWonT1: 'Sets ganados E1',
    xlsColSetsWonT2: 'Sets ganados E2',
    xlsColPointsT1: 'Puntos E1',
    xlsColPointsT2: 'Puntos E2',
    xlsColRestingPlayer: 'Jugador que descansa',
    xlsEveryonePlays: '(todos juegan)',
    xlsColRank: 'Posición',
    xlsColGamesPlayed: 'Partidos jugados',
    xlsColSetsWon: 'Sets ganados',
    xlsColSetsLost: 'Sets perdidos',
    xlsColSetsDiff: 'Dif. sets',
    xlsColPointsFor: 'Puntos a favor',
    xlsColPointsAgainst: 'Puntos en contra',
    xlsColPointsDiff: 'Dif. puntos'
  }
};

let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || 'ca';
if (!translations[currentLang]) currentLang = 'ca';

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || key;
}

function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  applyStaticTranslations();
  if (typeof render === 'function') render();
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLang;
  document.title = t('pageTitle');

  document.getElementById('editTitleBtn').textContent = t('rename');
  document.getElementById('exportBtn').textContent = '⬇ ' + t('exportBtn');
  document.getElementById('privacyNote').textContent = '🔒 ' + t('privacyNote');

  document.getElementById('tabPlayersBtn').textContent = t('tabPlayers');
  document.getElementById('tabScheduleBtn').textContent = t('tabSchedule');
  document.getElementById('tabRankingsBtn').textContent = t('tabRankings');

  document.getElementById('addPlayerHeading').textContent = t('addPlayerHeading');
  document.getElementById('playerName').placeholder = t('namePlaceholder');
  document.getElementById('addLevelOpt1').textContent = t('addLevel1');
  document.getElementById('addLevelOpt2').textContent = t('addLevel2');
  document.getElementById('addLevelOpt3').textContent = t('addLevel3');
  document.getElementById('addPlayerBtn').textContent = t('addPlayerBtn');

  document.getElementById('playersHeadingText').textContent = t('playersHeading');
  document.getElementById('thName').textContent = t('thName');
  document.getElementById('thLevel').textContent = t('thLevel');

  document.getElementById('generateHeading').textContent = t('generateHeading');
  document.getElementById('generateHint').textContent = t('generateHint');
  document.getElementById('courtsLabelText').textContent = t('courtsLabel');
  document.getElementById('roundsLabelText').textContent = t('roundsLabel');
  document.getElementById('generateBtn').textContent = t('generateBtn');

  document.getElementById('saveLoadHeading').textContent = t('saveLoadHeading');
  document.getElementById('saveLoadHint').textContent = t('saveLoadHint');
  document.getElementById('saveJsonBtn').textContent = '💾 ' + t('saveJsonBtn');
  document.getElementById('loadJsonBtn').textContent = '📂 ' + t('loadJsonBtn');

  document.getElementById('resetHeading').textContent = t('resetHeading');
  document.getElementById('resetHint').textContent = t('resetHint');
  document.getElementById('resetBtn').textContent = t('resetBtn');

  document.getElementById('rankName').textContent = t('rankName');
  document.getElementById('rankGames').textContent = t('rankGames');
  document.getElementById('rankSetsDiff').textContent = t('rankSetsDiff');
  document.getElementById('rankPointsDiff').textContent = t('rankPointsDiff');

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

applyStaticTranslations();
