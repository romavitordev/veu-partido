import test from 'node:test';
import assert from 'node:assert/strict';
import { getTeamLink, TEAM_LINKS, recommendNext } from '../src/config/teamLinks.js';
import xande from '../src/characters/xande.js';

test('team links identify Mascarados group', () => {
  const team = ['dalmo', 'aguiar', 'juan'];
  const link = getTeamLink(team);
  assert.ok(link);
  assert.equal(link.id, 'mascarados');
  assert.equal(link.banner, 'Execução dos Mascarados!');
});

test('team links identify Força D trio', () => {
  const team = ['arthur', 'kaiser', 'joui'];
  const link = getTeamLink(team);
  assert.ok(link);
  assert.equal(link.id, 'forca_d');
  assert.equal(link.banner, 'Força D!');
  assert.equal(getTeamLink(['erin', 'kaiser', 'dante']).id, 'forca_d');
  assert.equal(getTeamLink(['erin', 'beatrice', 'joui']).id, 'forca_d');
});

test('team links identify Os Cinco and the available Abutres group', () => {
  const five = getTeamLink(['morato', 'chico', 'xande']);
  assert.equal(five.id, 'os_cinco');
  assert.equal(five.choreo, 'os_cinco');

  const abutres = getTeamLink(['dante', 'arthur', 'joui']);
  assert.equal(abutres.id, 'abutres');
  assert.equal(abutres.choreo, 'abutres');
  assert.deepEqual(abutres.group, ['dante', 'carina', 'arthur', 'joui', 'balu', 'rubens']);
});

test('team links identify Cristopher and Kaiser duo', () => {
  const team = ['cristopher', 'kaiser', 'dante'];
  const link = getTeamLink(team);
  assert.ok(link);
  assert.equal(link.id, 'cristopher_kaiser');
  assert.equal(link.banner, 'A Muralha e o Disparo!');
});

test('team links identify Ordo Calamitas group', () => {
  const link = getTeamLink(['amalia', 'celestine', 'gaius']);
  assert.ok(link);
  assert.equal(link.id, 'ordo_calamitas');
  assert.equal(link.banner, 'Ordo Calamitas!');
  assert.equal(getTeamLink(['amalia', 'celestine', 'dante']), null); // grupo pede 3
});

test('team links identify Arnaldo and Veríssimo duo', () => {
  const link = getTeamLink(['arnaldo', 'verissimo', 'erin']);
  assert.ok(link);
  assert.equal(link.id, 'arnaldo_verissimo');
  assert.deepEqual(link.order, ['verissimo', 'arnaldo']);
});

test('Xande ranged attack uses Skate Caotico with hideProp and returnsProp', () => {
  assert.equal(xande.ranged.name, 'Skate Caótico');
  assert.equal(xande.ranged.visual, 'skate');
  assert.equal(xande.ranged.hideProp, 'skate');
  assert.equal(xande.ranged.returnsProp, 'skate');
  assert.equal(xande.ranged.boomerang, true);
});

test('team select recommends the next member of the linked team (Storm 4)', () => {
  const roster = new Set(['arthur', 'kaiser', 'joui', 'cristopher', 'verissimo', 'arnaldo', 'celestine', 'gaius', 'amalia', 'dalmo', 'aguiar', 'jae']);
  const has = (e) => roster.has(e);
  // Kaiser está na Força D (3) e na dupla com o Cristopher: a equipe de 3 ganha
  assert.equal(recommendNext(['kaiser'], has), 'arthur');
  assert.equal(recommendNext(['kaiser', 'arthur'], has), 'joui');
  // Kaiser + Cristopher já fecha a dupla: ninguém mais a recomendar (o cursor fica no Cristopher)
  assert.equal(recommendNext(['kaiser', 'cristopher'], has), null);
  // dupla com ordem: Arnaldo → Veríssimo
  assert.equal(recommendNext(['arnaldo'], has), 'verissimo');
  assert.equal(recommendNext(['amalia'], has), 'celestine');
  // quem não está em nenhuma ligação e a equipe já cheia
  assert.equal(recommendNext(['xande'], has), null);
  assert.equal(recommendNext(['dalmo', 'aguiar', 'jae'], has), null);
});

test('team links identify Balu and Rubens duo', () => {
  const link = getTeamLink(['balu', 'rubens', 'kemi']);
  assert.ok(link);
  assert.equal(link.id, 'balu_rubens');
  assert.equal(link.choreo, 'balu_rubens');
  assert.deepEqual(link.order, ['balu', 'rubens']);
});
