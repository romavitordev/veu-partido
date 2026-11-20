// METAL das armaduras da Ordo Calamitas (dono, 2026-11-20: "veja se é possivel adicionar textura de metal nessas
// armaduras"). O material toon não tem reflexo, e as placas esculpidas no Blender não têm UV — então tudo é procedural
// no shader, preso à posição LOCAL do vértice (acompanha o esqueleto): o metal ESCOVADO (fios verticais), os RISCOS de
// batalha, a mancha de desgaste e um BRILHO que corre pela placa quando a câmera ou o lutador se movem (a faixa de
// horizonte do reflexo, o jeito clássico de ler metal) com o contorno claro na borda.
export const ORDO_METAL = /^armor_(veritus|nero|faustus|marius|cornelius|karise|marcellus|cascadia|celestine|amalia|amphitruo)(_dark)?$/;

const NOISE = /* glsl */ `
varying vec3 vMetalP;
float mHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float mNoise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(mHash(i), mHash(i + vec3(1,0,0)), f.x), mix(mHash(i + vec3(0,1,0)), mHash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(mHash(i + vec3(0,0,1)), mHash(i + vec3(1,0,1)), f.x), mix(mHash(i + vec3(0,1,1)), mHash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float mScratch(vec3 p, float a, float s) {
  // linhas finas e curtas em uma direção: o fio do risco e um ruído que corta em pedaços
  vec2 q = vec2(cos(a) * p.x + sin(a) * p.z + 0.35 * p.y, p.y * cos(a) - sin(a) * p.x);
  float line = 1.0 - smoothstep(0.0, 0.05, abs(fract(q.y * s) - 0.5));
  return line * step(0.8, mNoise(vec3(q.x * 9.0, floor(q.y * s), p.z * 3.0)));
}
`;

export function applyOrdoMetal(m, { dark = false } = {}) {
  m.userData.ordoMetal = true;
  m.customProgramCacheKey = () => 'ordoMetal' + (dark ? 'D' : '');
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = 'varying vec3 vMetalP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vMetalP = position;');
    sh.fragmentShader = NOISE + sh.fragmentShader.replace('#include <opaque_fragment>', /* glsl */ `
      {
        vec3 P = vMetalP * 4.0;
        float brushed = mNoise(vec3(P.x * 14.0, P.y * 0.6, P.z * 14.0)) * 0.6 + mNoise(vec3(P.x * 40.0, P.y * 1.5, P.z * 40.0)) * 0.4;
        float wear = smoothstep(0.35, 0.8, mNoise(P * 1.3));
        float scr = max(mScratch(P, 0.6, 7.0), mScratch(P + 3.1, -0.9, 5.0));
        vec3 N = normalize(normal);
        vec3 V = normalize(vViewPosition);
        vec3 R = reflect(-V, N);
        // a faixa do horizonte no reflexo (clara em cima, escura logo abaixo) + o brilho de frente + a borda
        float band = smoothstep(0.05, 0.25, R.y) - smoothstep(0.35, 0.7, R.y);
        float sky = smoothstep(0.4, 0.95, R.y);
        float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
        float k = ${dark ? '0.55' : '1.0'};
        outgoingLight *= 0.8 + 0.26 * brushed - 0.14 * wear;
        outgoingLight += (diffuseColor.rgb * 0.9 + 0.12) * band * 0.38 * k + vec3(0.04) * sky * k;
        outgoingLight += vec3(0.75, 0.78, 0.85) * scr * 0.2 * k + vec3(0.6, 0.65, 0.75) * rim * 0.16 * k;
      }
      #include <opaque_fragment>`);
  };
  m.needsUpdate = true;
  return m;
}
