// ECO POR CENÁRIO (seção 10 do GUIA_TECNOLOGIAS_GAME_DEV.txt): quanto tempo o som fica soando (time, em s) e quanto do
// eco se mistura (wet, 0..1). damp escurece a cauda (pedra e madeira abafam o agudo). O eco é gerado na hora
// (ruído com queda exponencial — AudioManager.setAcoustics), sem arquivo baixado.
// Lugares fechados ecoam mais; ao ar livre quase nada (só as muralhas e casas devolvem um pouco).
const OUTDOOR = { time: 0.6, wet: 0.07, damp: 0.5 };

export const ACOUSTICS = {
  // fechados
  igreja: { time: 3.2, wet: 0.3, damp: 0.35 }, // nave de pedra
  igreja_dia: { time: 3.2, wet: 0.3, damp: 0.35 },
  mansao: { time: 1.6, wet: 0.22, damp: 0.55 }, // quartos de madeira, cortinas
  mansao_luta: { time: 1.6, wet: 0.22, damp: 0.55 },
  escola: { time: 1.4, wet: 0.24, damp: 0.4 }, // corredores e o bunker de concreto
  escola_luta: { time: 1.4, wet: 0.26, damp: 0.35 },
  torre: { time: 2.2, wet: 0.24, damp: 0.25 }, // a torre de metal e concreto
  suvaco: { time: 0.9, wet: 0.16, damp: 0.6 }, // bar pequeno, cheio de gente e madeira
  circo: { time: 1.1, wet: 0.12, damp: 0.6 }, // a lona
  circo_noite: { time: 1.1, wet: 0.12, damp: 0.6 },
  // cercados (muros, plateia)
  coliseu: { time: 1.4, wet: 0.13, damp: 0.4 },
  palco: { time: 1.6, wet: 0.15, damp: 0.4 },
  orfanato: { time: 0.9, wet: 0.09, damp: 0.5 }, // o pátio na frente do casarão
  orfanato_noite: { time: 0.9, wet: 0.09, damp: 0.5 },
  // ao ar livre
  santo_berco: OUTDOOR,
  tipora: OUTDOOR,
  treb_ciach: OUTDOOR,
  treb_ciach_tempestade: OUTDOOR,
  ferro_velho: { time: 0.8, wet: 0.09, damp: 0.3 }, // fundo de cânion, sucata de metal
  ferro_velho_dia: { time: 0.8, wet: 0.09, damp: 0.3 },
  acampamento: { time: 0.5, wet: 0.05, damp: 0.6 },
  passaros: { time: 0.5, wet: 0.05, damp: 0.6 },
  passaros_noite: { time: 0.5, wet: 0.05, damp: 0.6 },
  sertao: OUTDOOR,
  sertao_dia: OUTDOOR,
};

export const acousticsFor = (arenaId) => ACOUSTICS[arenaId] || OUTDOOR;

// SOM 3D: de onde o som vem em relação à câmera. Devolve { pan -1..1, gain 0..1 } — barato (StereoPanner, sem HRTF),
// para a luta continuar clara: o lado conta, a distância só abafa quem está longe (Outro Lado, monstros fora da tela).
export const SPATIAL = { panMax: 0.8, near: 12, minGain: 0.35 };

export function spatialize(cam, pos) {
  if (!cam || !pos || !cam.matrixWorldInverse) return null;
  const e = cam.matrixWorldInverse.elements;
  const x = e[0] * pos.x + e[4] * pos.y + e[8] * pos.z + e[12];
  const y = e[1] * pos.x + e[5] * pos.y + e[9] * pos.z + e[13];
  const z = e[2] * pos.x + e[6] * pos.y + e[10] * pos.z + e[14];
  const dist = Math.hypot(x, y, z);
  const ahead = Math.max(3, -z); // a câmera olha para -z; perto dela o lado vale menos
  const pan = Math.max(-SPATIAL.panMax, Math.min(SPATIAL.panMax, (x / ahead) * 0.9));
  const gain = dist <= SPATIAL.near ? 1 : Math.max(SPATIAL.minGain, SPATIAL.near / dist);
  return { pan, gain };
}
