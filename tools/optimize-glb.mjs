// Comprime os .glb do jogo (public/models, public/arenas, public/npcs) com glTF-Transform + meshoptimizer
// (EXT_meshopt_compression). O jogo descompacta no GLTFLoader com o MeshoptDecoder (src/models/glbRig.js).
//   node tools/optimize-glb.mjs                → todos (pula os que já estão comprimidos)
//   node tools/optimize-glb.mjs public/models/joui.glb   → só os arquivos passados
//   node tools/optimize-glb.mjs --out pasta    → grava numa pasta em vez de sobrescrever (para comparar)
// O build do Blender (tools/blender/build.mjs) chama otimizar() em cada .glb que gera.
//
// O QUE NÃO É MEXIDO, de propósito:
// - POSIÇÕES ficam em float: quantizar posição muda a matriz dos nós (o glTF-Transform põe a escala/deslocamento de
//   volta no nó, ou cria um nó filho sem nome) — o jogo procura nós pelo nome e usa posição/escala deles (CROWD_,
//   colisores COL_, FLICKER_, soquetes).
// - UVs ficam em float: quantizar UV põe KHR_texture_transform no material, e o jogo troca as texturas pelo nome do
//   material em tempo de execução (MATERIAL_TEXTURES), o que perderia a transformação.
// - Nada de prune/join/flatten/instance: removeriam ou fundiriam nós vazios e malhas que o código acha pelo nome.
// Só normais, cores de vértice e pesos de osso são quantizados; o resto é compressão sem perda do meshopt.
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, reorder, quantize } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['public/models', 'public/arenas', 'public/npcs'];

let io = null;
async function getIO() {
  if (io) return io;
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;
  io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'meshopt.encoder': MeshoptEncoder,
    'meshopt.decoder': MeshoptDecoder,
  });
  return io;
}

/** Comprime um .glb. Devolve { antes, depois, pulado }. */
export async function otimizar(file, out = file) {
  const io = await getIO();
  const antes = statSync(file).size;
  const doc = await io.read(file);
  if (doc.getRoot().listExtensionsUsed().some((e) => e.extensionName === 'EXT_meshopt_compression')) {
    if (out !== file) await io.write(out, doc);
    return { antes, depois: antes, pulado: true };
  }
  await doc.transform(
    dedup({ propertyTypes: [PropertyType.ACCESSOR] }),
    reorder({ encoder: MeshoptEncoder, target: 'size' }),
    quantize({ pattern: /^(NORMAL|TANGENT|COLOR_\d+|WEIGHTS_\d+)$/, quantizeNormal: 10, quantizeColor: 8, quantizeWeight: 8 }),
  );
  doc.createExtension(EXTMeshoptCompression).setRequired(true)
    .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  await io.write(out, doc);
  return { antes, depois: statSync(out).size, pulado: false };
}

/** Grava uma cópia SEM a compressão meshopt (para o Blender, que não lê EXT_meshopt_compression). */
export async function descompactar(file, out) {
  const io = await getIO();
  const doc = await io.read(file);
  for (const e of doc.getRoot().listExtensionsUsed()) if (e.extensionName === 'EXT_meshopt_compression') e.dispose();
  await io.write(out, doc);
}

const mb = (n) => (n / 1048576).toFixed(2) + ' MB';

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const oi = args.indexOf('--out');
  const outDir = oi >= 0 ? args.splice(oi, 2)[1] : null;
  const files = args.length ? args : DIRS.flatMap((d) => readdirSync(join(root, d)).filter((f) => f.endsWith('.glb')).map((f) => join(root, d, f)));
  if (outDir) mkdirSync(outDir, { recursive: true });
  let A = 0, B = 0;
  for (const f of files) {
    const out = outDir ? join(outDir, basename(dirname(f)) + '__' + basename(f)) : f;
    const r = await otimizar(f, out);
    A += r.antes; B += r.depois;
    console.log(`${r.pulado ? '=' : '✓'} ${basename(f).padEnd(28)} ${mb(r.antes).padStart(9)} → ${mb(r.depois).padStart(9)}`);
  }
  console.log(`total: ${mb(A)} → ${mb(B)} (${((1 - B / A) * 100).toFixed(0)}% menor)`);
}
