// OUTRO LADO — o fluxo de telas do modo (TODO §8 e §12): o hub (continuar / nova tentativa / melhorias permanentes /
// apagar dados), a escolha do personagem e da dificuldade, a árvore permanente, o carregamento da dungeon, o resultado
// (limpou → a próxima, mais funda; morreu → a tentativa acaba) e o "abandonar" da pausa.
// O main.js entrega as peças dele (telas, estado do jogo) e chama update(state) nos estados 'pve*'.
import { MenuScreen, LoadingScreen } from '../ui/Screens.js';
import { ROSTER } from '../characters/index.js';
import { ARENAS, preloadPveArena } from '../arena/index.js';
import { ensureModels } from '../models/index.js';
import { Dungeon } from './Dungeon.js';
import { DUNGEONS, PVE_DIFFICULTIES, pickNextDungeon, isAllowed } from './dungeons.js';
import { PveTreeScreen } from './treeScreen.js';
import { lockedMap, isUnlocked, buyChar } from './unlocks.js';
import { PveUnlockScreen } from './unlockScreen.js';
import { fmtTime } from './pveHud.js';
import { emptyData, loadPve, savePve, clearPve, profileOf, buyRank, refundTree, newAttempt, rewardBoss, endAttemptByDeath } from './save.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = (id) => ROSTER.find((c) => c.id === id);

export function createPveFlow(ctx) {
  const { game, screens, audio, input, hud, renderer, portraits, setScreen, setOverlay, endMatch, toMainMenu, toSelect } = ctx;
  let data = loadPve();
  const save = () => savePve(data);

  const extraBox = (html) => `<div class="pve-box">${html}</div>`;

  function summary() {
    const c = data.campaign;
    const a = data.attempt;
    const lines = [];
    if (a) {
      const d = byId(a.charId);
      lines.push(`<b>Tentativa atual:</b> ${esc(d ? d.name : a.charId)} · profundidade ${a.depth} · nível ${a.level} · ${esc(PVE_DIFFICULTIES[a.difficulty]?.label || a.difficulty)}`);
    } else lines.push('Nenhuma tentativa em andamento.');
    lines.push(`Maior profundidade: ${c.bestDepth} · chefes derrotados: ${c.bossKills} · mortes: ${c.deaths}`);
    const free = ROSTER.length - lockedMap(data, ROSTER).size;
    lines.push(`Moedas: <b>● ${data.coins || 0}</b> · personagens liberados: <b>${free}/${ROSTER.length}</b> (as moedas saem dos baús do mapa)`);
    return lines.join('<br>');
  }

  function menu(state, title, options, { subtitle = '', extra = '' } = {}) {
    endMatch();
    setOverlay(null, null);
    setScreen(state, new MenuScreen(screens, { title, subtitle, options, audio, extra, clear: false }));
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
      { id: 'wipe', label: 'APAGAR DADOS DO OUTRO LADO' },
      { id: 'back', label: 'VOLTAR' },
    ], { subtitle: 'Masmorras do Outro Lado: entre, sobreviva, derrote o chefe e vá mais fundo.', extra: extraBox(summary()) });
    if (!data.attempt) game.screen.index = 1;
    game.screen.render();
  }

  function confirmBox(state, title, text, yes) {
    menu(state, title, [{ id: 'no', label: 'NÃO' }, { id: 'yes', label: yes }], { extra: extraBox(text) });
  }

  // ------------------------------------------------ escolha do personagem (só o P1) → dificuldade
  function pickCharacter(purpose) {
    game.pvePurpose = purpose; // 'new' | 'tree'
    game.mode = { kind: 'pve', cpu: true, team: false };
    game.lastSelect = null;
    toSelect();
  }

  // o main.js chama quando a seleção devolve um lutador no modo pve
  function onSelect(pick) {
    const def = pick.p1;
    if (game.pvePurpose === 'tree') { toTree(def.id); return; }
    if (!isAllowed('espreitador', def.id) || !isUnlocked(data, def.id)) { audio.play('denied'); return; }
    game.pveChar = def.id;
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
    setScreen('pvetree', new PveTreeScreen(screens, { audio, charName: d ? d.name : charId, profile: p, index }));
  }

  // ------------------------------------------------ a loja de personagens (moedas dos baús)
  function toUnlock() {
    endMatch();
    setOverlay(null, null);
    setScreen('pveunlock', new PveUnlockScreen(screens, { audio, data, roster: ROSTER, portraits }));
  }

  // ------------------------------------------------ a dungeon
  async function startDungeon() {
    const a = data.attempt;
    if (!a) { toHub(); return; }
    const def = byId(a.charId);
    if (!def) { data.attempt = null; save(); toHub(); return; }
    const D = DUNGEONS[a.dungeon] || DUNGEONS.espreitador;
    a.dungeon = D.id;
    data.campaign.lastDungeon = D.id;
    save();
    endMatch();
    setOverlay(null, null);
    const loading = new LoadingScreen(screens, { p1: def, p2: { id: def.id, name: 'O ESPREITADOR', color: D.color }, arena: { name: `${D.name} — profundidade ${a.depth}` }, cpu: true, mode: 'pve', portraits });
    loading.el.classList.add('pve-loading');
    setScreen('loading', loading);
    loading.progress(0.1);
    try { await preloadPveArena(D.arena); } catch (e) { console.warn('Outro Lado: cenário', e); }
    loading.progress(0.5);
    try { await ensureModels([D.boss]); } catch (e) { console.warn('Outro Lado: modelo do chefe', e); }
    loading.progress(0.8);
    if (game.state !== 'loading' || game.screen !== loading) return;
    const dungeon = new Dungeon({
      renderer, audio, input, hud, playerDef: def, run: a, profile: profileOf(data, def.id), dungeonId: D.id,
      onEnd: (r) => onDungeonEnd(dungeon, r),
    });
    dungeon.onReward = () => {
      rewardBoss(data, def.id, `${a.startedAt}:${a.depth}`);
      save();
    };
    // moedas dos baús: entram no save na hora (a morte não leva)
    dungeon.coinsTotal = () => data.coins || 0;
    dungeon.onCoins = (n) => { data.coins = (data.coins || 0) + n; save(); };
    renderer.compile(dungeon.world.scene, dungeon.world.camera);
    loading.progress(1);
    await new Promise((r) => setTimeout(r, 350));
    if (game.state !== 'loading' || game.screen !== loading) { dungeon.dispose(); return; }
    input.players[0].cpu = null;
    input.players[0].setVirtual(null);
    game.match = dungeon;
    setScreen('fight', null);
    dungeon.beginIntro();
  }

  function onDungeonEnd(dungeon, { result, stats }) {
    if (game.match !== dungeon) return;
    const a = data.attempt;
    const s = stats || {};
    const time = fmtTime(s.time);
    const statLine = `Tempo ${time} · Devorados ${s.kills || 0} · cópias ${s.copias || 0} · baús ${s.chests || 0} · moedas +${s.coins || 0} · dano causado ${Math.round(s.damage || 0)}`;
    if (result === 'death') {
      const depth = a ? a.depth : 1;
      endAttemptByDeath(data);
      save();
      menu('pveresult', 'VOCÊ FOI DEVORADO', [{ id: 'new', label: 'NOVA TENTATIVA' }, { id: 'hub', label: 'VOLTAR AO OUTRO LADO' }, { id: 'main', label: 'MENU PRINCIPAL' }], {
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
      a.dungeon = pickNextDungeon({ depth: a.depth, previous: a.dungeon }) || a.dungeon;
      save();
      const p = profileOf(data, a.charId);
      const unlockLine = `<br>Moedas: +${s.coins || 0} nesta dungeon · ${data.coins} no total`;
      menu('pveresult', 'TERRITÓRIO LIMPO', [{ id: 'next', label: `DESCER (PROFUNDIDADE ${a.depth})` }, { id: 'hub', label: 'VOLTAR AO OUTRO LADO' }], {
        subtitle: `O Espreitador caiu. Personagem: nível ${p.level} do Outro Lado, ${p.points} ponto(s) para gastar nas melhorias permanentes.`,
        extra: extraBox(`${statLine}${recordLine}${unlockLine}<br>A próxima dungeon é mais forte (+12% de vida e dano dos inimigos por profundidade). As melhorias da tentativa continuam.`),
      });
      return;
    }
    toHub(); // abandonou pela pausa: a tentativa fica salva no começo desta dungeon
  }

  // ------------------------------------------------ estados das telas
  function update(state) {
    if (!state || !state.startsWith('pve')) return false;
    const c = game.screen && game.screen.update(input);
    if (!c) return true;
    if (state === 'pvehub') {
      if (c === 'continue') startDungeon();
      else if (c === 'new') {
        if (data.attempt) confirmBox('pveconfirm', 'NOVA TENTATIVA?', 'A tentativa atual será perdida (o nível e os pontos dos personagens ficam).', 'SIM, COMEÇAR OUTRA');
        else pickCharacter('new');
      } else if (c === 'tree') pickCharacter('tree');
      else if (c === 'unlock') toUnlock();
      else if (c === 'restart') confirmBox('pverestart', 'REINICIAR CAMPANHA?', 'Zera a campanha (profundidade, chefes, mortes) e a tentativa atual. O nível, os pontos e a árvore de cada personagem ficam.', 'SIM, REINICIAR');
      else if (c === 'wipe') confirmBox('pvewipe', 'APAGAR DADOS?', 'Apaga TODO o progresso do Outro Lado: níveis, pontos, a campanha e a tentativa. O resto do jogo não muda.', 'SIM, APAGAR');
      else if (c === 'back') toMainMenu();
    } else if (state === 'pveconfirm') {
      if (c === 'yes') pickCharacter('new');
      else toHub();
    } else if (state === 'pverestart') {
      if (c === 'yes') { data.campaign = emptyData().campaign; data.attempt = null; save(); }
      toHub();
    } else if (state === 'pvewipe') {
      if (c === 'yes') { clearPve(); data = loadPve(); audio.play('ko', { volume: 0.5 }); }
      toHub();
    } else if (state === 'pvediff') {
      if (c === 'back') pickCharacter('new');
      else if (c.startsWith('diff:')) {
        const difficulty = c.slice(5);
        data.attempt = newAttempt({ charId: game.pveChar, difficulty, dungeon: pickNextDungeon({ depth: 1 }) || 'espreitador' });
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
    } else if (state === 'pveresult') {
      if (c === 'next') startDungeon();
      else if (c === 'new') pickCharacter('new');
      else if (c === 'main') toMainMenu();
      else toHub();
    }
    return true;
  }

  // a pausa da dungeon: abandonar volta ao hub (a tentativa fica salva no começo desta dungeon)
  function quit() {
    const m = game.match;
    if (m && m.isDungeon) m.quit();
    else toHub();
  }

  return { toHub, onSelect, update, quit, startDungeon, lockedChars: () => lockedMap(data, ROSTER), get data() { return data; }, arenaName: () => ARENAS.mansao?.name };
}
