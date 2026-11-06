// OUTRO LADO — o fluxo de telas do modo (TODO §8 e §12): o hub (continuar / nova tentativa / melhorias permanentes /
// apagar dados), a escolha do personagem e da dificuldade, a árvore permanente, o carregamento da dungeon, o resultado
// (limpou → a próxima, mais funda; morreu → a tentativa acaba) e o "abandonar" da pausa.
// O main.js entrega as peças dele (telas, estado do jogo) e chama update(state) nos estados 'pve*'.
import { MenuScreen, LoadingScreen } from '../ui/Screens.js';
import { seededRandom } from '../net/NetSession.js';
import { ROSTER } from '../characters/index.js';
import espreitadorDef from '../characters/bosses/espreitador.js';
import degolificadaDef from '../characters/bosses/degolificada.js';
import { ARENAS, preloadPveArena } from '../arena/index.js';
import { ensureModels, isModelLoaded } from '../models/index.js';
import { renderPortraits } from '../ui/portraits.js';
import { Dungeon } from './Dungeon.js';
import { DUNGEONS, DUNGEON_ORDER, PVE_DIFFICULTIES, pickNextDungeon, isAllowed, advanceAfterClear, diffLabel } from './dungeons.js';

// o personagem pode entrar em TODAS as dungeons (nenhum chefe contra ele mesmo)
const allowedEverywhere = (id) => DUNGEON_ORDER.every((d) => isAllowed(d, id));
import { PveTreeScreen } from './treeScreen.js';
import { lockedMap, isUnlocked, buyChar } from './unlocks.js';
import { PveUnlockScreen } from './unlockScreen.js';
import { fmtTime } from './pveHud.js';
import { emptyData, loadPve, savePve, clearPve, profileOf, buyRank, refundTree, newAttempt, rewardBoss, endAttemptByDeath, exportPve, parseBackup, describePve } from './save.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = (id) => ROSTER.find((c) => c.id === id);
const BOSS_DEFS = { espreitador: espreitadorDef, degolificada: degolificadaDef };

export function createPveFlow(ctx) {
  const { game, screens, audio, input, hud, renderer, portraits, setScreen, setOverlay, endMatch, toMainMenu, toSelect } = ctx;
  let data = loadPve();
  const save = () => savePve(data);
  // EXPEDIÇÃO ONLINE (pedido do dono, 2026-11-06): os dados que cada computador mandou na sala ([anfitrião, convidado]:
  // personagens liberados e a árvore de cada um) e a tentativa da expedição — só na memória, o save local não muda
  let net = null;
  const online = () => !!(game.net && net);
  const attempt = () => (online() ? net.attempt : data.attempt);
  const snapshot = () => JSON.parse(JSON.stringify({ unlocked: data.unlocked || [], profiles: data.profiles || {}, coins: data.coins || 0 }));

  const extraBox = (html) => `<div class="pve-box">${html}</div>`;

  function summary() {
    const c = data.campaign;
    const a = data.attempt;
    const lines = [];
    if (a) {
      const d = byId(a.charId);
      const d2 = a.coop ? byId(a.coop.charId) : null;
      lines.push(`<b>Tentativa atual:</b> ${esc(d ? d.name : a.charId)}${a.team && a.team.length ? ` + ${a.team.map((id) => esc(byId(id)?.name || id)).join(' e ')} (assistências)` : ''}${d2 ? ` · <b>P2:</b> ${esc(d2.name)}` : ''} · profundidade ${a.depth} · nível ${a.level} · ${esc(diffLabel(a))}`);
    } else lines.push('Nenhuma tentativa em andamento.');
    lines.push(`Maior profundidade: ${c.bestDepth} · chefes derrotados: ${c.bossKills} · mortes: ${c.deaths}`);
    const free = ROSTER.length - lockedMap(data, ROSTER).size;
    lines.push(`Moedas: <b>● ${data.coins || 0}</b> · personagens liberados: <b>${free}/${ROSTER.length}</b> (as moedas saem dos baús do mapa)`);
    if (data.loadedFrom === 'prev') lines.push('<b>⚠ O save do Outro Lado estava corrompido: o jogo voltou para a cópia automática (o save de antes da última gravação). O arquivo quebrado ficou guardado.</b>');
    else if (data.loadedFrom === 'broken') lines.push('<b>⚠ O save do Outro Lado estava corrompido (ou é de outra versão) e não havia cópia automática: o jogo começou do zero. O arquivo antigo ficou guardado à parte; se tiver um BACKUP, importe-o.</b>');
    return lines.join('<br>');
  }

  function menu(state, title, options, { subtitle = '', extra = '' } = {}) {
    endMatch();
    setOverlay(null, null);
    setScreen(state, new MenuScreen(screens, { title, subtitle, options, audio, extra, clear: false }));
  }

  // ------------------------------------------------ ENTRADA (pedido do dono, 2026-11-06): LOCAL ou ONLINE
  function toEntry() {
    data = loadPve();
    game.mode = { kind: 'pve', cpu: true, team: false };
    menu('pveentry', 'OUTRO LADO', [
      { id: 'local', label: 'LOCAL' },
      { id: 'online', label: 'ONLINE' },
      { id: 'back', label: 'VOLTAR' },
    ], { subtitle: 'LOCAL: sozinho ou com mais um jogador neste computador (tela dividida). ONLINE: crie uma sala ou entre na de um amigo.', extra: extraBox(summary()) });
  }

  // ------------------------------------------------ quantos jogadores (local)
  function toPlayers() {
    menu('pveplayers', 'QUANTOS JOGADORES?', [
      { id: 'solo', label: 'SOLO' },
      { id: 'multi', label: 'MULTIPLAYER (2 JOGADORES, TELA DIVIDIDA)' },
      { id: 'back', label: 'VOLTAR' },
    ], { subtitle: 'No multiplayer cada um tem a própria câmera, metade da tela. O P2 joga no 2º controle (ou no lado direito do teclado). A tentativa, o nível e as melhorias são do grupo.' });
  }

  // ------------------------------------------------ HUB
  function toHub() {
    data = loadPve();
    game.mode = { kind: 'pve', cpu: true, team: false };
    menu('pvehub', 'OUTRO LADO', [
      { id: 'continue', label: 'CONTINUAR', disabled: !data.attempt },
      { id: 'new', label: 'NOVA TENTATIVA' },
      { id: 'tree', label: 'MELHORIAS PERMANENTES' },
      { id: 'unlock', label: 'DESBLOQUEAR PERSONAGENS' },
      { id: 'restart', label: 'REINICIAR CAMPANHA', disabled: !data.attempt && !data.campaign.runs },
      { id: 'backup', label: 'BACKUP (EXPORTAR / IMPORTAR)' },
      { id: 'wipe', label: 'APAGAR DADOS DO OUTRO LADO' },
      { id: 'back', label: 'VOLTAR' },
    ], { subtitle: 'Masmorras do Outro Lado: entre, sobreviva, derrote o chefe e vá mais fundo. (LOCAL)', extra: extraBox(summary()) });
    if (!data.attempt) game.screen.index = 1;
    game.screen.render();
  }

  function confirmBox(state, title, text, yes) {
    menu(state, title, [{ id: 'no', label: 'NÃO' }, { id: 'yes', label: yes }], { extra: extraBox(text) });
  }

  // ------------------------------------------------ sozinho ou em equipe (o time entra só como ASSISTÊNCIA)
  function toFormat() {
    menu('pveformat', 'COMO VAI ENTRAR?', [
      { id: 'solo', label: 'SOZINHO' },
      { id: 'team', label: 'EM EQUIPE (LÍDER + 2 ASSISTÊNCIAS)' },
      { id: 'back', label: 'VOLTAR' },
    ], { subtitle: online() ? 'EXPEDIÇÃO ONLINE: cada um escolhe o próprio personagem e joga com a própria câmera. Em equipe, os outros dois são assistência.' : 'Em equipe, só o líder luta: os outros dois são chamados como assistência (não dá para trocar). O Espreitador copia o time inteiro.' });
  }

  // ------------------------------------------------ escolha do personagem (só o P1) → dificuldade
  function pickCharacter(purpose, team = false) {
    game.pvePurpose = purpose; // 'new' | 'tree'
    const coop = purpose === 'new' && !!game.pveCoop;
    game.mode = { kind: 'pve', cpu: !coop, team, coop, net: online() };
    game.lastSelect = null;
    toSelect();
  }

  // o main.js chama quando a seleção devolve um lutador no modo pve
  function onSelect(pick) {
    const def = pick.p1;
    if (game.pvePurpose === 'tree') { toTree(def.id); return; }
    const team = pick.teams ? pick.teams[0].slice(1).map((d) => d.id) : [];
    // coop: o P2 e as assistências dele
    const coop = game.pveCoop && pick.p2 ? { charId: pick.p2.id, team: pick.teams && pick.teams[1] ? pick.teams[1].slice(1).map((d) => d.id) : [] } : null;
    const ids = [def.id, ...team, ...(coop ? [coop.charId, ...coop.team] : [])];
    // online: o lado do P1 confere os dados do anfitrião, o do P2 os do convidado
    const ok = online()
      ? [def.id, ...team].every((id) => allowedEverywhere(id) && isUnlocked(net.data[0], id)) && (!coop || [coop.charId, ...coop.team].every((id) => allowedEverywhere(id) && isUnlocked(net.data[1], id)))
      : ids.every((id) => allowedEverywhere(id) && isUnlocked(data, id));
    if (!ok) { audio.play('denied'); return; }
    game.pveChar = def.id;
    game.pveTeam = team;
    game.pveCoopPick = coop;
    toDifficulty();
  }

  function toDifficulty() {
    menu('pvediff', 'DIFICULDADE', Object.entries(PVE_DIFFICULTIES).map(([id, d]) => ({ id: `diff:${id}`, label: d.label.toUpperCase() })).concat([{ id: 'back', label: 'VOLTAR' }]), {
      subtitle: 'Muda a força dos inimigos e do chefe e a chance de cura. O chefe desafia mesmo no Fácil.',
    });
    game.screen.index = 1;
    game.screen.render();
  }

  // ------------------------------------------------ árvore permanente (por personagem)
  function toTree(charId, index = 0) {
    game.pveTreeChar = charId;
    const p = profileOf(data, charId);
    const d = byId(charId);
    endMatch();
    setOverlay(null, null);
    setScreen('pvetree', new PveTreeScreen(screens, { audio, charName: d ? d.name : charId, profile: p, index, data }));
  }

  // ------------------------------------------------ a loja de personagens (moedas dos baús)
  function toUnlock() {
    endMatch();
    setOverlay(null, null);
    setScreen('pveunlock', new PveUnlockScreen(screens, { audio, data, roster: ROSTER, portraits }));
  }

  // ------------------------------------------------ a dungeon
  async function startDungeon() {
    const net0 = online();
    const a = attempt();
    if (!a) { if (net0) toFormat(); else toHub(); return; }
    const def = byId(a.charId);
    if (!def) { if (!net0) { data.attempt = null; save(); } toHub(); return; }
    const D = DUNGEONS[a.dungeon] || DUNGEONS.espreitador;
    a.dungeon = D.id;
    if (!net0) { data.campaign.lastDungeon = D.id; save(); }
    const coopDef = a.coop ? byId(a.coop.charId) : null;
    endMatch();
    setOverlay(null, null);
    const loading = new LoadingScreen(screens, {
      p1: def,
      p2: { id: D.boss, name: D.bossName || 'O ESPREITADOR', color: D.color },
      pvePlayers: coopDef ? [{ def, slot: 'P1' }, { def: coopDef, slot: 'P2' }] : null,
      arena: { name: `${D.name} — profundidade ${a.depth}` },
      cpu: true, mode: 'pve', portraits,
    });
    loading.el.classList.add('pve-loading');
    setScreen('loading', loading);
    loading.progress(0.1);
    try { await preloadPveArena(D.arena); } catch (e) { console.warn('Outro Lado: cenário', e); }
    loading.progress(0.5);
    try { await ensureModels([D.boss]); } catch (e) { console.warn('Outro Lado: modelo do chefe', e); }
    if (!portraits[D.boss]) {
      try {
        const bossDef = BOSS_DEFS[D.boss];
        if (bossDef) {
          const portraitDef = isModelLoaded(bossDef.model) ? bossDef : { ...bossDef, model: 'carnical' };
          Object.assign(portraits, renderPortraits([portraitDef], renderer, { turn: 0.35 }));
        }
      } catch (e) {
        console.warn('Outro Lado: retrato do chefe', e);
      }
    }
    loading.setOpponentPortrait(portraits[D.boss]);
    loading.progress(0.8);
    if (game.state !== 'loading' || game.screen !== loading) return;
    if (net0 && !online()) return; // a conexão caiu durante o carregamento
    const teamDefs = (a.team || []).map(byId).filter(Boolean);
    // online: a árvore de cada um vem dos dados que ele mandou; a montagem da dungeon (rotas, gavetas, baús) usa um
    // sorteio com semente, igual nos dois computadores
    const d1 = net0 ? net.data[0] : data;
    const d2 = net0 ? net.data[1] : data;
    const nativeRandom = Math.random;
    if (net0) Math.random = seededRandom((game.net.seed ^ (a.depth * 7919) ^ (net.runs * 104729)) >>> 0);
    let dungeon;
    let failed = null;
    try {
      dungeon = new Dungeon({
        renderer, audio, input, hud, playerDef: def, teamDefs, run: a, profile: profileOf(d1, def.id), dungeonId: D.id,
        coopDef, coopTeam: coopDef ? (a.coop.team || []).map(byId).filter(Boolean) : [], coopProfile: coopDef ? profileOf(d2, coopDef.id) : null,
        net: net0 ? { slot: game.net.slot } : null,
        onEnd: (r) => onDungeonEnd(dungeon, r),
      });
    } catch (e) { failed = e; } finally { Math.random = nativeRandom; }
    // TODO §9: se o carregamento falhar, volta ao menu do modo com a tentativa salva (online: sai da sala)
    if (failed) {
      console.error('Outro Lado: a dungeon não montou', failed);
      audio.play('denied');
      menu('pveloadfail', 'NÃO FOI POSSÍVEL CARREGAR', [{ id: 'back', label: online() ? 'SAIR DA SALA' : 'VOLTAR AO OUTRO LADO' }], {
        subtitle: online() ? 'A dungeon não montou neste computador. A expedição online vai fechar para os dois.' : 'A dungeon não montou. A tentativa continua salva no começo desta dungeon: tente CONTINUAR de novo.',
        extra: extraBox(esc(String(failed && failed.message || failed)).slice(0, 300)),
      });
      return;
    }
    dungeon.onReward = () => {
      // online: cada computador guarda a recompensa do PRÓPRIO personagem
      if (net0) { const mine = game.net && game.net.slot === 1 ? coopDef : def; if (mine) rewardBoss(data, mine.id, `${a.startedAt}:${a.depth}`); }
      else {
        rewardBoss(data, def.id, `${a.startedAt}:${a.depth}`);
        if (coopDef && coopDef.id !== def.id) rewardBoss(data, coopDef.id, `${a.startedAt}:${a.depth}`);
      }
      save();
    };
    // moedas dos baús: entram no save na hora (a morte não leva)
    // moedas: online, as de cada um andam igual nos dois computadores (net.coins); o save local recebe só as dele
    if (net0) {
      const me = game.net.slot;
      dungeon.coinsTotal = () => net.coins[me];
      dungeon.onCoins = (n) => { net.coins[0] += n; net.coins[1] += n; data.coins = (data.coins || 0) + n; save(); };
      dungeon.wallet = { coins: (i) => net.coins[i] || 0, spend: (i, n) => { net.coins[i] -= n; if (i === me) { data.coins = Math.max(0, (data.coins || 0) - n); save(); } } };
    } else {
      dungeon.coinsTotal = () => data.coins || 0;
      dungeon.onCoins = (n) => { data.coins = (data.coins || 0) + n; save(); };
      // no mesmo computador as moedas são uma bolsa só
      dungeon.wallet = { coins: () => data.coins || 0, spend: (i, n) => { data.coins = Math.max(0, (data.coins || 0) - n); save(); } };
    }
    renderer.compile(dungeon.world.scene, dungeon.world.camera);
    loading.progress(1);
    await new Promise((r) => setTimeout(r, 350));
    if (game.state !== 'loading' || game.screen !== loading || (net0 && !online())) { dungeon.dispose(); return; }
    const begin = () => {
      input.players[0].cpu = null;
      input.players[0].setVirtual(null);
      if (coopDef) { input.players[1].cpu = null; input.players[1].setVirtual(null); }
      game.match = dungeon;
      setScreen('fight', null);
      dungeon.beginIntro();
    };
    // online: começa no MESMO quadro nos dois (o main.js espera os dois avisarem que carregaram)
    if (net0) { game.netLoaded = { pveStart: begin, dispose: () => dungeon.dispose() }; return; }
    begin();
  }

  function onDungeonEnd(dungeon, { result, stats }) {
    if (game.match !== dungeon) return;
    const a = attempt();
    const s = stats || {};
    const time = fmtTime(s.time);
    const D = DUNGEONS[a?.dungeon] || DUNGEONS.espreitador;
    const titles = D.endTitle || ['VOCÊ FOI DEVORADO', 'VOCÊS FORAM DEVORADOS'];
    const statLine = `Tempo ${time} · ${D.killsLabel || 'Devorados'} ${s.kills || 0}${D.killsLabel ? '' : ` · cópias ${s.copias || 0}`} · baús ${s.chests || 0} · moedas +${s.coins || 0} · dano causado ${Math.round(s.damage || 0)}`;
    if (online()) { onlineEnd(result, a, statLine, titles[1]); return; }
    if (result === 'death') {
      const depth = a ? a.depth : 1;
      endAttemptByDeath(data);
      save();
      menu('pveresult', titles[0], [{ id: 'new', label: 'NOVA TENTATIVA' }, { id: 'hub', label: 'VOLTAR AO OUTRO LADO' }, { id: 'main', label: 'MENU PRINCIPAL' }], {
        subtitle: `A tentativa acabou na profundidade ${depth}. As melhorias da tentativa se perderam; o nível e os pontos do personagem ficam.`,
        extra: extraBox(statLine),
      });
      return;
    }
    if (result === 'clear' && a) {
      // SPEEDRUN: o melhor tempo de cada dungeon (da entrada até a porta de saída)
      const times = data.campaign.bestTimes || (data.campaign.bestTimes = {});
      const prev = times[a.dungeon];
      const record = !prev || s.time < prev;
      if (record) times[a.dungeon] = s.time;
      const recordLine = record ? `<br><b>NOVO RECORDE: ${fmtTime(s.time)}</b>${prev ? ` (antes ${fmtTime(prev)})` : ''}` : `<br>Recorde: ${fmtTime(prev)}`;
      a.cleared++;
      data.campaign.bestDepth = Math.max(data.campaign.bestDepth, a.depth);
      a.depth++;
      const adv = advanceAfterClear(a, a.dungeon);
      a.dungeon = adv.dungeon;
      save();
      const p = profileOf(data, a.charId);
      const unlockLine = `<br>Moedas: +${s.coins || 0} nesta dungeon · ${data.coins} no total`;
      menu('pveresult', 'TERRITÓRIO LIMPO', [{ id: 'next', label: `DESCER (PROFUNDIDADE ${a.depth})` }, { id: 'hub', label: 'VOLTAR AO OUTRO LADO' }], {
        subtitle: `O Espreitador caiu. Personagem: nível ${p.level} do Outro Lado, ${p.points} ponto(s) para gastar nas melhorias permanentes.`,
        extra: extraBox(`${statLine}${recordLine}${unlockLine}${adv.looped ? `<br><b>Não há território novo: você volta ao primeiro, agora no ${esc(diffLabel(a))}.</b>` : ''}<br>A próxima dungeon é mais forte (+12% de vida e dano dos inimigos por profundidade). As melhorias da tentativa continuam.`),
      });
      return;
    }
    toHub(); // abandonou pela pausa: a tentativa fica salva no começo desta dungeon
  }

  // ------------------------------------------------ estados das telas
  function update(state) {
    if (!state || !state.startsWith('pve')) return false;
    if (state === 'pveonline') pollRoom();
    if (game.state !== state) return true;
    const c = game.screen && game.screen.update(input);
    if (!c) return true;
    if (state === 'pveentry') {
      if (c === 'local') toHub();
      else if (c === 'online') ctx.openOnline && ctx.openOnline('pve');
      else toMainMenu();
    } else if (state === 'pveplayers') {
      if (c === 'solo') { game.pveCoop = false; toFormat(); }
      else if (c === 'multi') { game.pveCoop = true; toFormat(); }
      else toHub();
    } else if (state === 'pveonline') {
      if (c === 'start' && game.pveNet && game.pveNet.peerData) startOnline(true);
      else if (c === 'start') audio.play('denied');
      else { ctx.leaveOnlinePve && ctx.leaveOnlinePve(); toEntry(); }
    } else if (state === 'pvehub') {
      if (c === 'continue') startDungeon();
      else if (c === 'new') {
        if (data.attempt) confirmBox('pveconfirm', 'NOVA TENTATIVA?', 'A tentativa atual será perdida (o nível e os pontos dos personagens ficam).', 'SIM, COMEÇAR OUTRA');
        else toPlayers();
      } else if (c === 'tree') pickCharacter('tree');
      else if (c === 'unlock') toUnlock();
      else if (c === 'backup') toBackup();
      else if (c === 'restart') confirmBox('pverestart', 'REINICIAR CAMPANHA?', 'Zera a campanha (profundidade, chefes, mortes) e a tentativa atual. O nível, os pontos e a árvore de cada personagem ficam.', 'SIM, REINICIAR');
      else if (c === 'wipe') confirmBox('pvewipe', 'APAGAR DADOS?', 'Apaga TODO o progresso do Outro Lado: níveis, pontos, a campanha e a tentativa. O resto do jogo não muda.', 'SIM, APAGAR');
      else if (c === 'back') toEntry();
    } else if (state === 'pveconfirm') {
      if (c === 'yes') toPlayers();
      else toHub();
    } else if (state === 'pveformat') {
      if (c === 'solo') pickCharacter('new');
      else if (c === 'team') pickCharacter('new', true);
      else if (online()) toMainMenu(); // sai da expedição online (o main.js fecha a conexão)
      else toPlayers();
    } else if (state === 'pverestart') {
      if (c === 'yes') { data.campaign = emptyData().campaign; data.attempt = null; save(); }
      toHub();
    } else if (state === 'pvebackup') {
      if (c === 'export') exportBackup();
      else if (c === 'import') pickBackupFile();
      else toHub();
    } else if (state === 'pveimport') {
      if (c === 'yes' && pendingImport) {
        data = pendingImport.data;
        pendingImport = null;
        save();
        data = loadPve();
        audio.play('levelUp', { volume: 0.7 });
        toBackup('Backup importado. O progresso de antes ficou como cópia automática.');
      } else { pendingImport = null; toBackup('Importação cancelada.'); }
    } else if (state === 'pveloadfail') {
      if (online()) toMainMenu();
      else toHub();
    } else if (state === 'pvewipe') {
      if (c === 'yes') { clearPve(); data = loadPve(); audio.play('ko', { volume: 0.5 }); }
      toHub();
    } else if (state === 'pvediff') {
      if (c === 'back') toFormat();
      else if (c.startsWith('diff:') && online()) {
        // online: a tentativa é da expedição (na memória); o save local de cada um não muda
        net.attempt = newAttempt({ charId: game.pveChar, team: game.pveTeam || [], coop: game.pveCoopPick, difficulty: c.slice(5), dungeon: pickNextDungeon({ depth: 1 }) || 'espreitador' });
        net.attempt.startedAt = game.net.seed + net.runs;
        net.runs++;
        startDungeon();
      } else if (c.startsWith('diff:')) {
        const difficulty = c.slice(5);
        data.attempt = newAttempt({ charId: game.pveChar, team: game.pveTeam || [], coop: game.pveCoop ? game.pveCoopPick : null, difficulty, dungeon: pickNextDungeon({ depth: 1 }) || 'espreitador' });
        data.campaign.runs++;
        save();
        startDungeon();
      }
    } else if (state === 'pvetree') {
      const charId = game.pveTreeChar;
      if (c === 'back') toHub();
      else if (c === 'refund') { refundTree(data, charId); save(); audio.play('confirm'); game.screen.render(); }
      else if (c.startsWith('buy:')) {
        if (buyRank(data, charId, c.slice(4))) { save(); audio.play('levelUp', { volume: 0.6 }); }
        else audio.play('denied');
        game.screen.render();
      }
    } else if (state === 'pveunlock') {
      if (c === 'back') toHub();
      else if (c.startsWith('buy:')) {
        if (buyChar(data, c.slice(4))) { save(); audio.play('levelUp', { volume: 0.7 }); }
        else audio.play('denied');
        game.screen.render();
      }
    } else if (state === 'pveresult' && online()) {
      if (c === 'next') startDungeon();
      else if (c === 'new') toFormat();
      else toMainMenu();
    } else if (state === 'pveresult') {
      if (c === 'next') startDungeon();
      else if (c === 'new') toPlayers();
      else if (c === 'main') toMainMenu();
      else toHub();
    }
    return true;
  }

  // ------------------------------------------------ BACKUP (TODO §8): exportar e importar o save do Outro Lado
  let pendingImport = null;
  function toBackup(msg = '') {
    const d = describePve(data);
    menu('pvebackup', 'BACKUP DO OUTRO LADO', [
      { id: 'export', label: 'EXPORTAR (BAIXAR UM ARQUIVO)' },
      { id: 'import', label: 'IMPORTAR DE UM ARQUIVO' },
      { id: 'back', label: 'VOLTAR' },
    ], {
      subtitle: 'Guarde o seu progresso do Outro Lado num arquivo (moedas, personagens comprados, níveis, árvore e a tentativa) e traga de volta neste ou em outro computador.',
      extra: extraBox(`${msg ? `<b>${esc(msg)}</b><br>` : ''}Agora: ● ${d.coins} moedas · ${d.unlocked} personagens comprados · ${d.levels} nível(is) ganhos · maior profundidade ${d.bestDepth} · ${d.attempt ? 'com tentativa salva' : 'sem tentativa'}<br><label class="pve-file">Ou escolha o arquivo aqui: <input type="file" accept=".json,application/json"></label>`),
    });
    const inp = game.screen && game.screen.el && game.screen.el.querySelector('.pve-file input');
    if (inp) inp.addEventListener('change', () => readBackupFile(inp.files && inp.files[0]));
  }

  function exportBackup() {
    try {
      const blob = new Blob([exportPve(data)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `veu-partido-outro-lado-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      audio.play('confirm');
      toBackup(`Arquivo ${a.download} baixado. Guarde-o: é ele que traz o progresso de volta.`);
    } catch (e) {
      audio.play('denied');
      toBackup('Não foi possível gerar o arquivo neste navegador.');
    }
  }

  // o seletor de arquivo do navegador (com o controle pode não abrir: aí vale o campo na própria tela)
  function pickBackupFile() {
    const inp = game.screen && game.screen.el && game.screen.el.querySelector('.pve-file input');
    try { if (inp) inp.click(); } catch { /* o navegador pediu um clique de verdade */ }
  }

  async function readBackupFile(file) {
    if (!file) return;
    if (game.state !== 'pvebackup') return;
    if (file.size > 2 * 1024 * 1024) { audio.play('denied'); toBackup('Esse arquivo é grande demais para ser um backup do Outro Lado.'); return; }
    try {
      const text = await file.text();
      pendingImport = parseBackup(text);
    } catch (e) {
      audio.play('denied');
      toBackup(e.message || 'Não foi possível ler o arquivo.');
      return;
    }
    if (game.state !== 'pvebackup') { pendingImport = null; return; }
    const n = describePve(pendingImport.data);
    const when = pendingImport.exportedAt ? new Date(pendingImport.exportedAt).toLocaleString() : 'data desconhecida';
    confirmBox('pveimport', 'IMPORTAR ESTE BACKUP?', `Backup de ${esc(when)}: ● ${n.coins} moedas · ${n.unlocked} personagens comprados · ${n.levels} nível(is) · maior profundidade ${n.bestDepth} · ${n.attempt ? 'com tentativa' : 'sem tentativa'}.<br>Ele SUBSTITUI todo o progresso do Outro Lado deste computador. O progresso atual fica como cópia automática.`, 'SIM, IMPORTAR');
  }

  // ------------------------------------------------ ONLINE: a sala de espera e a EXPEDIÇÃO ONLINE
  // Conectados, cada computador manda os próprios dados (liberados + árvore). O anfitrião (P1) começa; daí os dois entram
  // no lockstep da partida online (main.js startNet): a mesma simulação nos dois, só os comandos viajam — a câmera de
  // cada um inclusive. O anfitrião é o P1, quem entrou é o P2.
  function onlineRoom(session) {
    data = loadPve();
    session.myData = snapshot();
    session.send({ t: 'pd', d: session.myData });
    session.onPeerData = () => { if (game.state === 'pveonline') renderRoom(session); };
    renderRoom(session);
  }

  function renderRoom(session) {
    const names = (session.names || []).map((n) => esc(n || '?'));
    const host = session.role === 'host';
    const ready = !!session.peerData;
    const opts = host ? [{ id: 'start', label: ready ? 'COMEÇAR A EXPEDIÇÃO' : 'ESPERANDO O OUTRO JOGADOR…', disabled: !ready }, { id: 'leave', label: 'SAIR DA SALA' }] : [{ id: 'leave', label: 'SAIR DA SALA' }];
    menu('pveonline', 'SALA DO OUTRO LADO', opts, {
      subtitle: `Sala ${esc(session.code || '')} · ${names.join(' e ') || 'conectados'}`,
      extra: extraBox(`${host ? 'Você é o <b>P1</b>: quando os dois estiverem prontos, comece a expedição.' : 'Você é o <b>P2</b>: esperando o anfitrião começar a expedição.'}<br>Cada um joga no próprio monitor, com a própria câmera, e escolhe o próprio personagem (os liberados e as melhorias permanentes de cada um valem). A tentativa online não mexe na tentativa salva de cada um.`),
    });
  }

  // a sala, a cada quadro: o outro saiu? o anfitrião começou?
  function pollRoom() {
    const s = game.pveNet;
    if (!s) { toEntry(); return; }
    if (s.closed) { game.pveNet = null; toEntry(); return; }
    if (s.role !== 'host' && s.go && s.peerData) startOnline(false);
  }

  function startOnline(isHost) {
    const s = game.pveNet;
    if (!s) return;
    if (isHost) s.send({ t: 'pgo' });
    audio.play('confirm');
    ctx.startNetPve(s);
  }

  // já no lockstep (main.js startNet): os dados dos dois, na ordem [P1 (anfitrião), P2]
  function beginOnline(session) {
    const mine = session.myData || snapshot();
    const theirs = session.peerData || { unlocked: [], profiles: {} };
    net = { data: session.slot === 0 ? [mine, theirs] : [theirs, mine], attempt: null, runs: 0 };
    net.coins = net.data.map((d) => d.coins || 0);
    game.pveCoop = true;
    toFormat();
  }

  // fim de uma dungeon da expedição online (as telas são iguais nos dois computadores)
  function onlineEnd(result, a, statLine, title = 'VOCÊS FORAM DEVORADOS') {
    if (result === 'death') {
      const depth = a ? a.depth : 1;
      net.attempt = null;
      menu('pveresult', title, [{ id: 'new', label: 'NOVA EXPEDIÇÃO' }, { id: 'main', label: 'SAIR DA SALA' }], {
        subtitle: `A expedição acabou na profundidade ${depth}. O nível e os pontos de cada personagem ficam.`,
        extra: extraBox(statLine),
      });
      return;
    }
    if (result === 'clear' && a) {
      a.cleared++;
      a.depth++;
      const adv = advanceAfterClear(a, a.dungeon);
      a.dungeon = adv.dungeon;
      menu('pveresult', 'TERRITÓRIO LIMPO', [{ id: 'next', label: `DESCER (PROFUNDIDADE ${a.depth})` }, { id: 'main', label: 'SAIR DA SALA' }], {
        subtitle: 'O Espreitador caiu. Cada um ganhou nível e ponto no próprio personagem.',
        extra: extraBox(`${statLine}<br>A próxima dungeon é mais forte. As melhorias da expedição continuam.`),
      });
      return;
    }
    toMainMenu(); // saiu pela pausa: fecha a expedição online
  }

  // a pausa da dungeon: abandonar volta ao hub (a tentativa fica salva no começo desta dungeon)
  function quit() {
    const m = game.match;
    if (m && m.isDungeon) m.quit();
    else toHub();
  }

  // a seleção: VOLTAR (online volta ao formato; local, ao hub)
  const selectBack = () => (online() ? toFormat() : toHub());
  // online: os bloqueados de cada lado (P1 pelos dados do anfitrião, P2 pelos do convidado)
  const lockedChars = () => (online() ? [lockedMap(net.data[0], ROSTER), lockedMap(net.data[1], ROSTER)] : lockedMap(data, ROSTER));

  return { toHub, toEntry, onlineRoom, beginOnline, selectBack, onSelect, update, quit, startDungeon, lockedChars, get data() { return data; }, arenaName: () => ARENAS[(DUNGEONS[attempt()?.dungeon] || DUNGEONS.espreitador).arena]?.name };
}
