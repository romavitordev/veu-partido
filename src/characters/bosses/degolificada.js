// A DEGOLIFICADA DE GABRIEL (id: degolificada) — CHEFE do OUTRO LADO (a 2ª dungeon, a Escola Nostradamus). NÃO é
// selecionável. A de INICIAÇÃO (A Ordem Paranormal): o corpo da Agatha Volkomenn com a mente do Gabriel Opspor (wiki
// "Degolificada" e "Gabriel Opspor"). Criatura de MEDO com todos os Elementos; flutua com os membros pendurados e ataca
// com os longos fios de cabelo.
// Habilidades do cânone (controladas pela IA da chefe em src/pve/degolificada.js, por cima da CPU de luta): Pancada,
// Voo, Criatura de Medo, Grito Rasgado, Agarrar e Estrangular, Desfiguramento Capilar e a metamorfose DEVORADORA.
// Enigma de Medo: dizer o nome (GABRIEL) queimando os restos mortais — o Ritual de Passagem.
// A Pancada (wiki: "usando seus cabelos flutuantes ou, até mesmo, seus braços pendentes"): os golpes do Amigo Imaginário
// (clipes ai_*), com os TENTÁCULOS que saem do chão virando o CABELO preto; sem a tinta.
import amigo from '../amigo.js';

const HAIR = 0x0a0909;
const PALE = 0xc8d0c0;
const hair = (s, name) => ({ ...s, name, element: 'medo', impactFx: undefined, trail: s.trail ? { ...s.trail, color: HAIR } : undefined });

export default {
  id: 'degolificada',
  name: 'A DEGOLIFICADA',
  model: 'degolificada',
  color: '#c8d0c0',
  origin: 'Outro Lado',
  element: 'medo', // wiki: o Elemento principal é o Medo (tem todos)
  energyColor: PALE,
  boss: true,
  tentacle: { color: HAIR, emissive: 0x050505, radius: 0.06 },
  info: {
    weapon: 'Os longos fios de cabelo e os braços pendentes',
    style: 'Flutua até a vítima, estrangula com o cabelo e grita; não morre por dano',
    identity: 'O corpo da Agatha com a mente do Gabriel',
    tagline: 'Se você vir longos cabelos pretos flutuando em sua direção… CORRA.',
  },
  stats: { moveSpeed: 7.0, attackSpeed: 0.95, size: 1.12, maxHealth: 1900 },
  poise: { hits: 5 },
  anims: { ...amigo.anims, victory: 'taunt_roar' },
  dodge: { style: 'default', distance: 4.0 },
  defense: { perfectBlock: null },
  ai: { style: 'rush' },

  melee: {
    name: 'Pancada',
    strikes: amigo.melee.strikes.map((s, i) => hair(s, ['Braço pendente', 'Braço pendente', 'Chicote de cabelo', 'Fios cortantes', 'Esmagar a cabeça'][i] || 'Pancada')),
    up: hair(amigo.melee.up, 'Erguer pelos cabelos'),
    down: hair(amigo.melee.down, 'Esmagar'),
    forward: hair(amigo.melee.forward, 'Flutuar e golpear'),
    back: hair(amigo.melee.back, 'Recua e chicoteia'),
    side: hair(amigo.melee.side, 'Varredura de cabelo'),
    air: hair(amigo.melee.air, 'Desabar'),
  },
  abilities: [],
  passives: [],
};
