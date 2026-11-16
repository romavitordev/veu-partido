import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { gfxProfile, SETTINGS } from '../config/settings.js';

// PÓS-PROCESSAMENTO DA LUTA (seção 10 do GUIA_TECNOLOGIAS_GAME_DEV.txt). Só o EffectComposer do próprio Three.js:
//   1) a cena, JÁ com o tom ACES e o sRGB aplicados no próprio material — igual ao desenho direto na tela
//   2) BLOOM — só o que é mais claro que a luz comum brilha (olhos, runas, sigilos, chamas)
//   3) TELA — vinheta e aberração cromática, com força conforme o momento (MOOD), direto na tela.
// Por que a cena sai pronta (v4.48.1): com o alvo linear + OutputPass no fim, a NÉVOA (que o Three mistura depois do
// tom e do sRGB no desenho direto) passava a ser misturada antes deles — o Santo Berço e os mapas de névoa densa
// ficavam lavados (+35% de brilho médio). O alvo é marcado como `isXRRenderTarget` com `colorSpace` sRGB, o único
// jeito do WebGLRenderer aplicar tom e sRGB nos materiais fora da tela; os passes depois só leem e escrevem os valores.
// 1b) SOMBRA DE CONTATO (GTAO, só na qualidade alta; pedido do dono 2026-11-15 "gráficos primeiro"): escurece os cantos
//     e onde as coisas se encostam (pés no chão, caixas na parede), o que dá volume aos modelos low-poly. Roda em meia
//     resolução; efeitos transparentes, céu e partículas ficam fora (senão ganhavam um halo escuro).
// Qualidade (OPÇÕES › gráficos): alta = tudo; média = bloom em meia resolução; baixa = desligado (desenha direto).
// EFEITOS DE TELA REDUZIDOS (SETTINGS.reduceFx) corta a aberração e os pulsos.

const ScreenShader = {
  uniforms: {
    tDiffuse: { value: null },
    vignette: { value: 0.25 }, // força da vinheta (0 = nada)
    tint: { value: new THREE.Color(0, 0, 0) }, // cor que a borda puxa (vermelho no despertar, roxo no Outro Lado)
    aberration: { value: 0 }, // deslocamento das cores (fração da tela)
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float vignette;
    uniform vec3 tint;
    uniform float aberration;
    varying vec2 vUv;
    void main() {
      vec2 d = vUv - 0.5;
      float r2 = dot(d, d);
      vec4 c = texture2D(tDiffuse, vUv);
      if (aberration > 0.0) {
        // mais forte na borda, nada no centro (o lutador continua nítido)
        vec2 off = d * aberration * r2 * 4.0;
        c.r = texture2D(tDiffuse, vUv + off).r;
        c.b = texture2D(tDiffuse, vUv - off).b;
      }
      float v = smoothstep(0.12, 0.62, r2 * 1.6) * vignette;
      // a borda escurece e puxa para a cor do clima (vermelho no despertar, roxo no Outro Lado)
      c.rgb = c.rgb * (1.0 - v * 0.7) + tint * v * 0.9;
      gl_FragColor = c;
    }`,
};

// O CLIMA da tela em cada situação (o mais forte vence; muda suave)
export const MOOD = {
  base: { vignette: 0.22, aberration: 0, tint: 0x000000, bloom: 0.32 },
  lowHealth: { vignette: 0.55, aberration: 0.002, tint: 0x9a0a0a, bloom: 0.32 },
  awakened: { vignette: 0.6, aberration: 0.0025, tint: 0x8a0c22, bloom: 0.5 },
  outroLado: { vignette: 0.5, aberration: 0.0015, tint: 0x40146a, bloom: 0.42 },
  cinematic: { vignette: 0.55, aberration: 0.004, tint: 0x000000, bloom: 0.55 },
};

const TMP = new THREE.Color();

// parâmetros da sombra de contato (metros do mundo; a escala do jogo é 1 = 1 m)
export const AO = { radius: 0.55, thickness: 1.2, distanceExponent: 1.4, distanceFallOff: 1, scale: 1, samples: 12, intensity: 0.75, resolution: 0.5 };

// o GTAO só olha o que é sólido: some com o transparente que não escreve profundidade (efeitos), o céu (lado de dentro)
// e os sprites, além dos pontos e linhas que ele já tira
class ContactAO extends GTAOPass {
  _overrideVisibility() {
    const cache = this._visibilityCache;
    this.scene.traverse((o) => {
      if (!o.visible) return;
      let hide = o.isPoints || o.isLine || o.isLine2 || o.isSprite;
      if (!hide && o.isMesh && o.material) {
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        hide = !!m && ((m.transparent && (m.depthWrite === false || m.opacity < 0.6)) || m.side === THREE.BackSide || o.userData.noAO);
      }
      if (hide) { o.visible = false; cache.push(o); }
    });
  }
}

export class PostFX {
  constructor(renderer) {
    this.renderer = renderer;
    this.composer = null;
    this.level = null;
    this.cur = { vignette: MOOD.base.vignette, aberration: 0, bloom: MOOD.base.bloom, tint: new THREE.Color(0) };
  }

  // liga/desliga e ajusta à qualidade atual; devolve se está ativo
  sync() {
    const G = gfxProfile();
    const level = G.post || 'off';
    if (level === this.level && this.composer) return level !== 'off';
    this.dispose();
    this.level = level;
    if (level === 'off') return false;
    const r = this.renderer;
    const size = r.getSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: G.antialias ? 4 : 0 });
    this.composer = new EffectComposer(r, rt);
    // a cena sai com tom e sRGB como na tela (ver o topo do arquivo)
    for (const t of [this.composer.renderTarget1, this.composer.renderTarget2]) {
      t.isXRRenderTarget = true;
      t.texture.colorSpace = THREE.SRGBColorSpace;
    }
    this.renderPass = new RenderPass(null, null);
    const res = level === 'full' ? size.clone() : size.clone().multiplyScalar(0.5);
    this.bloom = new UnrealBloomPass(res, MOOD.base.bloom, 0.45, 0.82);
    this.screen = new ShaderPass(ScreenShader);
    this.composer.addPass(this.renderPass);
    this.ao = null;
    this.wantAO = !!G.ao; // o GTAO precisa da câmera para nascer: é criado no primeiro render (ensureAO)
    this.composer.addPass(this.bloom);
    this.composer.addPass(this.screen); // o último: escreve na tela
    this.setSize(size.x, size.y);
    return true;
  }

  setSize(w, h) {
    if (!this.composer) return;
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(w, h);
    if (this.level === 'light') this.bloom.setSize(w * 0.5, h * 0.5);
    if (this.ao) { const pr = this.renderer.getPixelRatio(); this.ao.setSize(Math.round(w * pr * AO.resolution), Math.round(h * pr * AO.resolution)); }
  }

  // cria a sombra de contato com a cena e a câmera de agora (e refaz quando a câmera muda: luta nova, modo Explorar)
  ensureAO(scene, camera) {
    if (this.ao && this.ao.camera === camera) { this.ao.scene = scene; return; }
    if (this.ao) { this.composer.removePass(this.ao); this.ao.dispose(); }
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    this.ao = new ContactAO(scene, camera, Math.round(size.x * AO.resolution), Math.round(size.y * AO.resolution), undefined, {
      radius: AO.radius, thickness: AO.thickness, distanceExponent: AO.distanceExponent, distanceFallOff: AO.distanceFallOff, scale: AO.scale, samples: AO.samples, screenSpaceRadius: false,
    }, { lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 8 });
    this.ao.blendIntensity = AO.intensity;
    this.composer.insertPass(this.ao, 1); // logo depois da cena, antes do bloom
  }

  // mood: um dos MOOD (ou mistura já calculada); kick: 0..1 de pulso de impacto (o tremor da câmera)
  render(scene, camera, dt, mood = MOOD.base, kick = 0) {
    if (!this.sync()) { this.renderer.render(scene, camera); return; }
    const k = Math.min(1, dt * 4);
    const reduce = SETTINGS.reduceFx;
    const c = this.cur;
    c.vignette += (mood.vignette - c.vignette) * k;
    c.bloom += (mood.bloom - c.bloom) * k;
    c.aberration += ((reduce ? 0 : mood.aberration) - c.aberration) * k;
    c.tint.lerp(TMP.set(mood.tint), k);
    this.renderPass.scene = scene;
    this.renderPass.camera = camera;
    if (this.wantAO) this.ensureAO(scene, camera);
    this.bloom.strength = c.bloom;
    const u = this.screen.uniforms;
    u.vignette.value = c.vignette;
    u.tint.value.copy(c.tint).convertLinearToSRGB(); // a imagem já está em sRGB
    u.aberration.value = c.aberration + (reduce ? 0 : Math.min(kick, 1) * 0.006);
    this.composer.render(dt);
  }

  dispose() {
    if (!this.composer) return;
    this.bloom.dispose();
    if (this.ao) { this.ao.dispose(); this.ao = null; }
    this.composer.renderTarget1.dispose();
    this.composer.renderTarget2.dispose();
    this.composer = null;
  }
}

let shared = null;
export const postFX = (renderer) => shared || (shared = new PostFX(renderer));
