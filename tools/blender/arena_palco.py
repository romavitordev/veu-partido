"""
O PALCO DO ANFITRIÃO — public/arenas/palco.glb (pedido de 2026-10-31, TODO "ATUALIZAÇÃO FUTURA — CENÁRIO").
Inspirado nos JOGOS do Anfitrião (Calamidade): um COLISEU todo em ROXO — o chão de pedra com o círculo do jogo, o muro
do pódio, as arquibancadas em anel e os estandartes — iluminado por TOCHAS com chamas de ENERGIA, e as arquibancadas
cheias de ANFITRIÕES (silhuetas de casacão com a máscara de gás e os olhos roxos acesos) em poses variadas: braços para
cima, aplaudindo, apontando, de pé. A plateia vai em grupos CROWD_* que o jogo faz pular conforme a luta
(src/arena/palco.js). O lado da câmera inicial (+z) fica sem arquibancada (só o muro baixo).
Feito todo aqui (sem o Kenney: as peças dele usam um atlas de cores que não fica roxo).
Coordenadas do jogo: chão redondo, raio andável ~20 m.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'palco.glb'
random.seed(1971)
start()

M = {
    'floor': material('palco_floor', '#3a2450', 0.85),
    'ring': material('palco_ring', '#b48cff', 0.4, emission='#7a3aff', strength=1.4),
    'stone': material('palco_stone', '#4a2e66', 0.9),
    'stone2': material('palco_stone_dark', '#2a1a3c', 0.9),
    'gold': material('palco_gold', '#d8b060', 0.35, metal=0.8),
    'banner': material('palco_banner', '#6a1aa0', 0.7),
    'fire': material('palco_flame', '#e0b0ff', 0.3, emission='#a050ff', strength=3.0),
    'coat': material('crowd_coat', '#1c1824', 0.85),
    'mask': material('crowd_mask', '#2c2a30', 0.6),
    'eyes': material('crowd_eyes', '#c080ff', 0.3, emission='#b060ff', strength=3.0),
}
R_FLOOR = 21.0
R_WALL = 22.0
OPEN = 0.62  # meia-abertura (rad) do lado da câmera (+z) sem arquibancada

# ---------------- chão: pedra roxa e o círculo do jogo aceso
cyl('GROUND_floor', (0, -0.2, 0), 60, 0.2, M['floor'], seg=64)
for r, w in ((6.0, 0.18), (12.5, 0.14), (19.0, 0.22)):
    ring = []
    n = 72
    for k in range(n):
        a = k / n * TAU
        ring.append(box(f'ring{r}_{k}', (math.sin(a) * r, 0.01, math.cos(a) * r), (r * TAU / n * 1.02, 0.02, w), M['ring'], rot_y=a))
    join_objs(ring, f'DECAL_ring{int(r)}')
# o Símbolo do Anfitrião no centro: losango com os quatro raios
for k in range(4):
    a = k * math.pi / 2 + math.pi / 4
    box(f'DECAL_ray{k}', (math.sin(a) * 2.6, 0.012, math.cos(a) * 2.6), (0.22, 0.02, 4.4), M['ring'], rot_y=a)
box('DECAL_diamond', (0, 0.013, 0), (1.6, 0.02, 1.6), M['ring'], rot_y=math.pi / 4)


def open_side(a):
    """o lado da câmera inicial (+z), sem arquibancada"""
    return abs(math.atan2(math.sin(a), math.cos(a))) < OPEN


# ---------------- o muro do pódio, com friso dourado
n = 48
for k in range(n):
    a = (k + 0.5) / n * TAU
    x, z = math.sin(a) * R_WALL, math.cos(a) * R_WALL
    low = open_side(a)
    h = 1.2 if low else 3.2
    box(f'{"OCC_" if low else ""}wall{k}', (x, h / 2, z), (R_WALL * TAU / n * 1.03, h, 0.8), M['stone'], rot_y=a)
    box(f'{"OCC_" if low else ""}trim{k}', (x * 0.985, h, z * 0.985), (R_WALL * TAU / n * 1.03, 0.16, 0.5), M['gold'], rot_y=a)
    col_box(f'wall{k}', (x, 1.5, z), (2.2, 3.0, 2.2))

# ---------------- arquibancadas em anel (5 degraus) com a PLATEIA de Anfitriões
STEPS = 4
STEP_D, STEP_H = 2.0, 1.25
SECT = 14  # grupos CROWD_ (cada um pula com a sua fase)
crowd = {k: [] for k in range(SECT)}


def host_fig(pos, rot_y, pose, s=1.0):
    """um Anfitrião da plateia: casacão, máscara de gás com os olhos roxos e os braços na pose"""
    parts = []
    parts.append(cyl('f_coat', (0, 0, 0), 0.28 * s, 1.15 * s, M['coat'], seg=5, r_top=0.22 * s))
    parts.append(cyl('f_chest', (0, 1.0 * s, 0), 0.24 * s, 0.4 * s, M['coat'], seg=5, r_top=0.2 * s))
    parts.append(sphere('f_head', (0, 1.6 * s, 0), (0.17 * s, 0.19 * s, 0.17 * s), M['mask'], seg=6, rings=4))
    parts.append(cyl('f_filter', (0, 1.5 * s, 0.13 * s), 0.07 * s, 0.12 * s, M['mask'], seg=4, rot_x=math.pi / 2))
    for e in (-1, 1):
        parts.append(box('f_eye', (e * 0.07 * s, 1.65 * s, 0.15 * s), (0.08 * s, 0.05 * s, 0.03 * s), M['eyes']))
    for side in (-1, 1):
        if pose == 'up':
            rz, rx = side * -0.35, 0.0
        elif pose == 'clap':
            rz, rx = side * 0.25, -1.35
        elif pose == 'point':
            rz, rx = (side * -0.1, -1.6) if side == 1 else (side * 2.9, 0.0)
        else:  # 'cheer': um braço para cima, o outro para baixo
            rz, rx = (side * -0.5, 0.0) if side == 1 else (side * 2.9, 0.0)
        # o cilindro nasce no ombro e cresce em +y: rot_z gira para os lados, rot_x para a frente
        parts.append(cyl('f_arm', (side * 0.27 * s, 1.32 * s, 0), 0.07 * s, 0.62 * s, M['coat'], seg=4, rot_x=rx, rot_z=rz))
    fig = join_objs(parts, 'fig')
    place(fig, pos, rot_y)
    return fig


POSES = ('up', 'clap', 'point', 'cheer', 'clap', 'up')
for st in range(STEPS):
    r0 = R_WALL + 1.0 + st * STEP_D
    y0 = 1.6 + st * STEP_H
    nseg = int(r0 * TAU / 2.4)
    for k in range(nseg):
        a = (k + 0.5) / nseg * TAU
        x, z = math.sin(a) * r0, math.cos(a) * r0
        if open_side(a):
            continue
        box(f'step{st}_{k}', (x, y0 / 2, z), (r0 * TAU / nseg * 1.04, y0, STEP_D * 1.02), M['stone2' if st % 2 else 'stone'], rot_y=a)
        # 2 Anfitriões por bloco (alguns lugares vazios)
        for j in (-0.5, 0.5):
            if random.random() < 0.12:
                continue
            aa = a + j * (2.4 / r0) * 0.5
            p = (math.sin(aa) * (r0 + 0.2), y0, math.cos(aa) * (r0 + 0.2))
            sec = int(((aa % TAU) / TAU) * SECT) % SECT
            crowd[sec].append(host_fig(p, aa + math.pi + random.uniform(-0.15, 0.15), random.choice(POSES), random.uniform(0.92, 1.06)))
for sec, figs in crowd.items():
    if figs:
        join_objs(figs, f'CROWD_{sec}')

# ---------------- o muro do fundo das arquibancadas e os ESTANDARTES roxos com o losango dourado
rb = R_WALL + 1.0 + STEPS * STEP_D + 0.6
nb = 40
for k in range(nb):
    a = (k + 0.5) / nb * TAU
    if open_side(a):
        continue
    x, z = math.sin(a) * rb, math.cos(a) * rb
    box(f'back{k}', (x, 5.5, z), (rb * TAU / nb * 1.03, 11, 1.0), M['stone2'], rot_y=a)
    if k % 3 == 0:
        bx, bz = math.sin(a) * (rb - 0.6), math.cos(a) * (rb - 0.6)
        box(f'SWAY_banner{k}', (bx, 12.5, bz), (2.2, 5.5, 0.08), M['banner'], rot_y=a)
        box(f'bannerMark{k}', (bx * 0.995, 12.8, bz * 0.995), (0.8, 0.8, 0.1), M['gold'], rot_y=a, rot_z=math.pi / 4)
        box(f'pole{k}', (bx, 15.3, bz), (2.6, 0.12, 0.12), M['gold'], rot_y=a)

# ---------------- TOCHAS de chama de Energia em volta do chão (a luz vem dos pontos de luz em configs.js)
TORCHES = 8
for k in range(TORCHES):
    a = (k + 0.5) / TORCHES * TAU
    x, z = math.sin(a) * (R_FLOOR - 1.2), math.cos(a) * (R_FLOOR - 1.2)
    cyl(f'torchPole{k}', (x, 0, z), 0.22, 2.6, M['stone2'], seg=8, r_top=0.16)
    cyl(f'torchCup{k}', (x, 2.6, z), 0.24, 0.4, M['gold'], seg=10, r_top=0.42)
    cyl(f'FLICKER_flame{k}', (x, 3.0, z), 0.34, 1.0, M['fire'], seg=8, r_top=0.03)
    col_cyl(f'torch{k}', (x, 0, z), 0.6, 3.0)

# ---------------- dois pódios de pedra no chão (obstáculos baixos)
for k, (x, z) in enumerate(((-11, -5), (11, -5))):
    cyl(f'podium{k}', (x, 0, z), 1.6, 0.9, M['stone'], seg=16)
    cyl(f'podiumTrim{k}', (x, 0.9, z), 1.65, 0.08, M['gold'], seg=16)
    col_cyl(f'podium{k}', (x, 0, z), 1.7, 0.9)

finalize(OUT)
