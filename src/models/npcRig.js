import * as THREE from 'three';
import { loadGLBRetry } from './glbRig.js';
import { toon } from './rig.js';

// Modelos de INVOCAÇÕES feitos no Blender em peças rígidas (tools/blender/npc_*.py → public/npcs/*.glb):
// a Marionete do Dante e os Zumbis de Sangue do Diabo. Não têm esqueleto: cada peça está presa numa junta (empty
// "J_<nome>") que o jogo gira em código. Carregados junto com os personagens; se faltar o arquivo, quem chama usa o
// modelo provisório feito em código.
export const NPC_MODELS = {
  marionette: 'npcs/marionette.glb',
  zumbi_sangue: 'npcs/zumbi_sangue.glb',
  zumbi_sangue_forte: 'npcs/zumbi_sangue_forte.glb',
  existido_morte: 'npcs/existido_morte.glb', // o Existido de Morte (invocação do Deus da Morte)
  existido: 'npcs/existido.glb', // o Existido de Conhecimento (os que vagam pelo Orfanato à noite; tools/blender/npc_existido.py)
  javali_tinta: 'npcs/javali_tinta.glb', // os animais infectados pela Tinta (invocação do Amigo Imaginário)
  cao_tinta: 'npcs/cao_tinta.glb',
  cobra_tinta: 'npcs/cobra_tinta.glb', // a Cobra Infectada (as ondas de Tipora e a fúria do Amigo)
  zumbi_tinta: 'npcs/zumbi_tinta.glb', // o Zumbi de Tinta (O Segredo na Ilha)
  assombracao: 'npcs/assombracao.glb', // a Assombração fantasiada (A Vigília; tools/blender/npc_assombracao.py)
  esfinge: 'npcs/esfinge.glb', // o Carniçal da Esfinge (especial da Nubi)
  rastropoda: 'npcs/rastropoda.glb', // o Rastropoda (miniboss da Torre; tools/blender/npc_rastropoda.py)
  bilu: 'npcs/bilu.glb', // o Bilu (o quarto escuro da Torre; tools/blender/npc_bilu.py)
  // o bestiário do Sertão do Quibungo (tools/blender/npc_arara_*.py, npc_felino_*.py, npc_quibungo.py)
  arara_devorada: 'npcs/arara_devorada.glb',
  arara_infernal: 'npcs/arara_infernal.glb',
  felino_devorado: 'npcs/felino_devorado.glb', // sobre o cão da tinta (as juntas do InkBeast)
  felino_infernal: 'npcs/felino_infernal.glb', // sobre o Zumbi de Sangue fraco (de pé), mais o rabo
  quibungo: 'npcs/quibungo.glb', // sobre o Zumbi de Sangue gigante: 4 braços, mandíbulas, bocarra e língua nas costas
  kerberos: 'npcs/kerberos.glb', // a 2ª forma do Quibungo no Aniquilação: 6 patas e 3 cabeças (tools/blender/npc_kerberos.py)
  // ARMAS feitas no Blender (peças rígidas, mesmo carregador): models/weapons.js usa o .glb e, sem ele, a versão em código
  xande_bat: 'npcs/xande_bat.glb', // o taco com arame farpado do Xande
  leonora: 'npcs/leonora.glb', // a Leonora, a marreta do Lírio (tools/blender/npc_leonora.py)
  xande_skate: 'npcs/xande_skate.glb', // o Skate Caótico (escudo) do Xande
  aguiar_axe: 'npcs/aguiar_axe.glb', // o machado do Mutilador Noturno
  gal_blade: 'npcs/gal_blade.glb', // a Ereškigal, as lâminas em meia-lua do Gal
  // as armas da Carina pelas artes oficiais (tools/blender/npc_carina_*.py): a corrente do mangual e do nunchaku em juntas
  carina_flail: 'npcs/carina_flail.glb',
  carina_nunchaku: 'npcs/carina_nunchaku.glb',
  carina_glock: 'npcs/carina_glock.glb',
  carina_knife: 'npcs/carina_knife.glb',
};
const loaded = {};

// só os ids pedidos (a página Sobre precisa só das Assombrações, não das armas e invocações todas)
export async function ensureNpcModels(ids) {
  await Promise.all(ids.filter((id) => NPC_MODELS[id] && !loaded[id]).map(async (id) => {
    loaded[id] = await loadGLBRetry(import.meta.env.BASE_URL + NPC_MODELS[id]);
  }));
}

export async function preloadNpcModels() {
  await Promise.all(Object.entries(NPC_MODELS).map(async ([id, url]) => {
    try {
      loaded[id] = await loadGLBRetry(import.meta.env.BASE_URL + url);
    } catch (e) {
      console.warn(`Modelo de invocação indisponível (${id}), usando o provisório.`, e);
    }
  }));
}

// contorno: casca de trás empurrada pela normal (as peças ficam longe da origem da junta, então escala não serve)
function outlineMat(thickness) {
  const m = new THREE.MeshBasicMaterial({ color: 0x0a0a0c, side: THREE.BackSide });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n  transformed += normal * ${thickness.toFixed(4)};`);
  };
  return m;
}

// instância nova do modelo `id` (ou null): { root, joint(name), meshes }
// noOutline: trechos do nome do material sem contorno (fitas finas: cabelo, pano, cordas, brilho)
export function buildNpcModel(id, { outline = 0.012, noOutline = ['hair', 'cloth', 'rope', 'glow'] } = {}) {
  const gltf = loaded[id];
  if (!gltf) return null;
  const scene = gltf.scene.clone(true);
  const root = new THREE.Group();
  root.add(scene);
  const oMat = outlineMat(outline);
  const meshes = [];
  // junta a lista antes: o contorno é filho da malha e o traverse o visitaria de novo (recursão sem fim)
  const found = [];
  scene.traverse((o) => { if (o.isMesh) found.push(o); });
  found.forEach((o) => {
    const src = o.material;
    const name = src.name || '';
    const glow = src.emissive && src.emissive.r + src.emissive.g + src.emissive.b > 0.01;
    // cada instância tem os próprios materiais (o Zumbi recolore, o dano pisca)
    o.material = toon(src.color.clone(), {
      emissive: glow ? src.emissive.clone() : new THREE.Color(0),
      emissiveIntensity: glow ? 1.4 : 0,
      side: THREE.DoubleSide,
      transparent: src.transparent,
      opacity: src.opacity,
      vertexColors: !!o.geometry.attributes.color, // cor por vértice (sombras e manchas de Lodo; multiplica a textura)
      map: src.map || null, // textura do .glb (o Existido de Morte: a pele toda coberta de escrita)
    });
    o.material.name = name;
    o.material.userData.glow = glow;
    o.castShadow = true;
    meshes.push(o);
    if (outline > 0 && !glow && !noOutline.some((k) => name.includes(k))) {
      const ol = new THREE.Mesh(o.geometry, oMat);
      ol.userData.isOutline = true;
      ol.raycast = () => {};
      o.add(ol);
    }
  });
  return { root, scene, meshes, joint: (n) => scene.getObjectByName('J_' + n) };
}
