"""
BAR SUVACO SECO (a base da Ordo Realitas, São Paulo) — public/arenas/suvaco.glb
REFEITO FIEL AO DE HEXATOMBE (dono, 2026-11-19: "busque referências em hexatombe e refaça esse mapa na mesma ideia de
jogar dentro e fora do bar, mas dessa vez fiel ao original"). Referências: o ep. 2 de Hexatombe (37:10–39:15, a chegada
na rua, a fachada e o salão) e os renders do modelo 3D oficial na wiki (Base da Ordo Realitas: exterior de dia e de
noite, interior, expositor, fliperama, sinuca, entrada secreta).

O que é do cânone:
  · SOBRADO DE ESQUINA: térreo de tijolo, andar de cima de reboco vermelho com janelas brancas e ar-condicionado,
    telhado de barro; a QUINA chanfrada com a placa de madeira SUVACO SECO, um painel branco e a floreira embaixo;
  · TRÊS PORTAS (Hexatombe abriu mais duas): uma de cada lado da quina e a da rua principal; TOLDOS nas duas fachadas com
    mesas amarelas e vermelhas na calçada; poste com fiação, placa com o nome das ruas (Henrique L. e Felipe L.,
    curiosidade da wiki), hidrante;
  · o SALÃO: teto de concreto com viga, ventiladores e lâmpadas fluorescentes; balcão de madeira com a vitrine de
    salgados e três prateleiras de garrafas na parede de AZULEJO, canos aparentes, alvo de dardos; a GELADEIRA AMARELA
    (a entrada secreta, com o teclado numérico) num nicho de azulejo entre pilares de tijolo; engradados vermelhos,
    azuis e amarelos, cadeiras amarelas empilhadas, bebedouro, lixeira; a parede de TIJOLO da sinuca com o quadro
    verde; a PILASTRA de concreto com a TV entre duas portas; o fliperama (Tetris) e a janela gradeada; paredes
    brancas com panfletos de bandas; mesas e cadeiras de plástico AMARELAS e VERMELHAS;
  · a VIELA ao lado (os cartazes da Construtora Opspor e o de "Desaparecido" do Caíto Rocha ficam no muro dela).
PROPOSTA (o que as imagens não mostram): a medida exata do salão, a viela do lado esquerdo, os prédios em volta.
Antes (v5.27): prédios do kit com a base maior que o terreno entravam no bar e uns nos outros — agora toda a vizinhança
é feita aqui, com a planta medida (nada se sobrepõe).
Coordenadas do jogo: salão x ∈ [-9, 9], z ∈ [-6, 6], pé-direito 3,6; quina chanfrada em (9, 6). Rua principal na
frente (z 10,5–20,5), rua lateral à direita (x 13,5–23,5), viela à esquerda (x -12,5 a -9,25).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from arena_lib import _seg
from lib import material, TAU
from kenney import put

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'suvaco.glb'
random.seed(7)
start()

M = {
    'tile': material('tile_white', '#dcdad2', 0.35),
    'brick': material('brick_bar', '#8c4030', 0.95),
    'paint': material('paint_wall', '#c8c4ba', 0.9),
    'floor': material('concrete_floor', '#4a4642', 0.9),
    'ceiling': material('ceiling', '#3a3836', 1),
    'concrete': material('concrete_pillar', '#6a6864', 0.95),
    'wood': material('wood_dark', '#3a2618', 0.7),
    'sidewalk': material('sidewalk', '#6a6862', 0.9),
    'asphalt': material('asphalt', '#2a2a2c', 0.95),
    'felt': material('felt_green', '#1e6a3a', 1),
    'fluor': material('fluorescent', '#f4f6ee', 0.3, emission='#f8faf0', strength=4),
    'lamp': material('street_lamp', '#ffd890', 0.3, emission='#ffc070', strength=5),
    'metal': material('metal_gray', '#6a6c70', 0.5, metal=0.6),
    'pipe': material('pipe_rust', '#7a5a48', 0.6, metal=0.3),
    'fridge': material('fridge_yellow', '#e0a020', 0.45),
    'fridge_glass': material('fridge_bottles', '#ffffff', 0.15, emission='#fff4d8', strength=0.9),
    'keypad': material('keypad', '#ffffff', 0.4),
    'black': material('plastic_black', '#141416', 0.5),
    'glass': material('display_glass', '#a8c8d0', 0.1, emission='#d8f0ff', strength=0.35),
    'red': material('plastic_red', '#c8221c', 0.55),
    'yellow': material('plastic_yellow_bar', '#e8b41c', 0.55),
    'crate_r': material('crate_red', '#b82a24', 0.7),
    'crate_b': material('crate_blue', '#2a4ab0', 0.7),
    'crate_y': material('crate_yellow', '#d8a624', 0.7),
    'cooler': material('cooler_blue', '#4a8ad8', 0.1, emission='#2a5aa0', strength=0.4),
    'white': material('plastic_white', '#eceae4', 0.55),
    'plant': material('plant_green', '#2a6a2a', 1),
    'plaster_red': material('plaster_red', '#9a2a24', 0.95),
    'frame': material('window_frame', '#e8e6de', 0.6),
    'roof': material('roof_red', '#8a3a24', 0.9),
    'awning': material('awning_canvas', '#d8b880', 0.8, emission='#ffcf8a', strength=0.12),
    'window_lit': material('window_lit_bar', '#ffd08a', 0.4, emission='#ffb860', strength=2),
    'window_dark': material('window_dark_bar', '#14181c', 0.2),
    'ac': material('ac_unit', '#c8c8c2', 0.6),
    'arcade': material('arcade_body', '#1a1a2a', 0.5),
    'arcade_screen': material('arcade_tetris', '#ffffff', 0.3, emission='#ffffff', strength=1.4),
    'tv': material('tv_screen', '#ffffff', 0.3, emission='#ffffff', strength=1.0),
    'flyers': material('flyers_bands', '#ffffff', 0.85),
    'flyers2': material('flyers_bands2', '#ffffff', 0.85),
    'opspor': material('poster_opspor', '#ffffff', 0.85),
    'missing': material('poster_missing', '#ffffff', 0.85),
    'street_blue': material('street_sign_blue', '#1e4a9a', 0.5),
    'street_text': material('street_sign_text', '#f4f4f0', 0.5),
    'bark': material('bark_street', '#3a2a1e', 1),
    'hydrant': material('hydrant', '#c02a24', 0.5),
    'trashbag': material('trash_bag', '#141416', 0.4),
    'wire': material('wire_black', '#0c0c0e', 0.6),
    'bone': material('bone_skull', '#e8dcc0', 0.7),
    'plaster_a': material('plaster_wall', '#7a6e62', 0.95),
    'plaster_b': material('plaster_wall2', '#5e6670', 0.95),
    'plaster_c': material('plaster_wall3', '#8a7a5a', 0.95),
    'shutter': material('shutter_metal', '#4a4c50', 0.6, metal=0.4),
}
bottle_mats = [material(f'bottle{i}', c, 0.15, emission=c, strength=0.35) for i, c in enumerate(['#e8302a', '#8a3ad8', '#3ad86a', '#e8a02a', '#2a8ae8', '#f0e0c0', '#a02040'])]

W0, W1, D0, D1, HH = -9.0, 9.0, -6.0, 6.0, 3.6
T = 0.25            # espessura das paredes
CH = 1.6            # o chanfro da quina (em x e em z)
H2 = 7.2            # topo do andar de cima
DOOR_A = (-2.6, 0.0)   # porta da rua principal (x)
DOOR_B = (4.0, 6.8)    # porta da rua principal ao lado da quina (x)
DOOR_C = (1.0, 3.8)    # porta da rua lateral ao lado da quina (z)


def wall_x(name, x0, x1, z, mat_out, mat_in, h=HH, inside=-1, col=True):
    """Parede ao longo de x (em z), com a face de dentro de outro material (lado `inside`: -1 = z menor)."""
    box(f'OCC_{name}', ((x0 + x1) / 2, h / 2, z), (x1 - x0, h, T), mat_out)
    box(f'OCC_{name}_in', ((x0 + x1) / 2, h / 2, z + inside * (T / 2 + 0.015)), (x1 - x0, h, 0.03), mat_in)
    if col:
        col_box(name, ((x0 + x1) / 2, h / 2, z), (x1 - x0, h, T))


def wall_z(name, z0, z1, x, mat_out, mat_in, h=HH, inside=-1, col=True):
    box(f'OCC_{name}', (x, h / 2, (z0 + z1) / 2), (T, h, z1 - z0), mat_out)
    box(f'OCC_{name}_in', (x + inside * (T / 2 + 0.015), h / 2, (z0 + z1) / 2), (0.03, h, z1 - z0), mat_in)
    if col:
        col_box(name, (x, h / 2, (z0 + z1) / 2), (T, h, z1 - z0))


def plastic_table(name, pos, mat, size=0.8):
    """A mesa de plástico quadrada de bar (a das referências), com o porta-guardanapo."""
    x, y, z = pos
    parts = [box(f'{name}_top', (x, 0.72, z), (size, 0.05, size), mat), box(f'{name}_apron', (x, 0.66, z), (size - 0.06, 0.08, size - 0.06), mat)]
    for sx in (-1, 1):
        for sz in (-1, 1):
            parts.append(box(f'{name}_l{sx}{sz}', (x + sx * (size / 2 - 0.07), 0.32, z + sz * (size / 2 - 0.07)), (0.07, 0.66, 0.07), mat))
    join_objs(parts, name)
    box(f'{name}_napkin', (x + 0.05, 0.82, z - 0.05), (0.1, 0.14, 0.07), M['white'])
    col_box(name, (x, 0.4, z), (size, 0.8, size))


def table_set(name, pos, mat, chairs=4, rng=0.62, turn=0.0, mixed=None):
    plastic_table(name, pos, mat)
    x, _, z = pos
    for j in range(chairs):
        a = turn + j * TAU / 4 + random.uniform(-0.25, 0.25)
        cm = (mixed or mat) if j % 2 else mat
        bar_chair(f'{name}_c{j}', (x + math.sin(a) * rng, 0, z + math.cos(a) * rng), cm, rot_y=a + random.uniform(-0.2, 0.2), solid=True)


# ===================================================================== O SALÃO
box('FLOOR_bar', (0, -0.05, 0), (W1 - W0, 0.1, D1 - D0), M['floor'])
box('OCC_ceiling', (0, HH + 0.05, 0), (W1 - W0 + 0.5, 0.1, D1 - D0 + 0.5), M['ceiling'])
# a viga de concreto que cruza o teto em cima da pilastra
box('OCC_beam', (2.0, HH - 0.25, 0), (0.45, 0.5, D1 - D0), M['concrete'])

# paredes: fundo (azulejo atrás do balcão e no nicho da geladeira; tijolo do lado da sinuca)
wall_x('wall_back_tile', W0 - T / 2, 4.5, D0 - T / 2, M['brick'], M['tile'], inside=1)
wall_x('wall_back_brick', 4.5, W1 + T / 2, D0 - T / 2, M['brick'], M['brick'], inside=1)
# esquerda (para a viela): pintada por dentro, com a janela gradeada
wall_z('wall_left', D0, D1, W0 - T / 2, M['brick'], M['paint'], inside=1)
# direita (rua lateral): tijolo na sinuca, pintada perto da porta lateral
wall_z('wall_right_brick', D0, DOOR_C[0], W1 + T / 2, M['brick'], M['brick'], inside=-1)
wall_z('wall_right_front', DOOR_C[1], D1 - CH, W1 + T / 2, M['brick'], M['paint'], inside=-1)
# frente (rua principal): três trechos entre as portas
wall_x('wall_front_l', W0 - T / 2, DOOR_A[0], D1 + T / 2, M['brick'], M['paint'], inside=-1)
wall_x('wall_front_m', DOOR_A[1], DOOR_B[0], D1 + T / 2, M['brick'], M['paint'], inside=-1)
wall_x('wall_front_r', DOOR_B[1], W1 - CH, D1 + T / 2, M['brick'], M['paint'], inside=-1)
# vergas das portas
for k, (a, b) in enumerate((DOOR_A, DOOR_B)):
    box(f'OCC_lintel{k}', ((a + b) / 2, HH - 0.3, D1 + T / 2), (b - a, 0.6, T), M['brick'])
box('OCC_lintelC', (W1 + T / 2, HH - 0.3, (DOOR_C[0] + DOOR_C[1]) / 2), (T, 0.6, DOOR_C[1] - DOOR_C[0]), M['brick'])
# a QUINA chanfrada: um pilar largo em diagonal (a placa fica do lado de fora)
cl = CH * math.sqrt(2)
box('OCC_corner', (W1 - CH / 2 + 0.05, HH / 2, D1 - CH / 2 + 0.05), (cl + 0.2, HH, T * 2), M['brick'], rot_y=math.pi / 4)
box('OCC_corner_in', (W1 - CH / 2 - 0.12, HH / 2, D1 - CH / 2 - 0.12), (cl, HH, 0.03), M['paint'], rot_y=math.pi / 4)
for k in range(4):  # o colisor do chanfro em degraus (os obstáculos são alinhados aos eixos)
    t = (k + 0.5) / 4
    col_box(f'corner{k}', (W1 - CH + CH * t + 0.1, HH / 2, D1 - CH * t + 0.1), (0.55, HH, 0.55))

# rodapé, canos aparentes, lâmpadas, ventiladores
box('baseboard', (-2.0, 0.08, D0 + 0.02), (13.5, 0.16, 0.04), M['wood'])
for k, x in enumerate((-0.75, -0.5)):
    cyl(f'pipe{k}', (x, 0, D0 + 0.08), 0.035, HH, M['pipe'], seg=8)
cyl('pipe_h', (W0 + 0.1, HH - 0.35, D0 + 0.08), 0.035, 8.5, M['pipe'], seg=8, rot_z=-math.pi / 2)
for k, (x, z) in enumerate([(-4.5, -3.3), (-4.5, 1.2), (5.5, -1.6), (5.0, 3.6)]):
    box(f'FLICKER_tube{k}' if k == 0 else f'tube{k}', (x, HH - 0.08, z), (1.5, 0.07, 0.14), M['fluor'])
    box(f'tubebase{k}', (x, HH - 0.02, z), (1.65, 0.05, 0.24), M['metal'])
for k, (x, z) in enumerate([(-6.0, -0.8), (-2.2, 2.4), (5.6, 1.0)]):
    put('furniture', 'ceilingFan', (x, HH - 0.55, z), random.uniform(0, 1), 2.4, center=True)

# ---------------- o BALCÃO (fundo à esquerda), as garrafas no azulejo e a vitrine de salgados
CX0, CX1, CZ = -8.4, -0.9, D0 + 1.45
box('counter', ((CX0 + CX1) / 2, 0.55, CZ), (CX1 - CX0, 1.1, 0.7), M['wood'])
box('counter_top', ((CX0 + CX1) / 2, 1.13, CZ), (CX1 - CX0 + 0.2, 0.07, 0.9), M['wood'])
col_box('counter', ((CX0 + CX1) / 2, 0.6, CZ), (CX1 - CX0 + 0.2, 1.2, 0.9))
# a vitrine de vidro em cima do balcão (ponta esquerda)
box('display_base', (-7.2, 1.22, CZ), (1.3, 0.1, 0.6), M['metal'])
box('display_glass', (-7.2, 1.48, CZ), (1.25, 0.42, 0.55), M['glass'])
box('display_top', (-7.2, 1.71, CZ), (1.3, 0.04, 0.6), M['metal'])
for row, y in enumerate((1.55, 2.15, 2.75)):
    box(f'shelf{row}', (-4.6, y, D0 + 0.17), (6.6, 0.05, 0.3), M['wood'])
    for k in range(16):
        x = -7.6 + k * 0.4 + random.uniform(-0.05, 0.05)
        h = random.uniform(0.26, 0.4)
        m = random.choice(bottle_mats)
        cyl(f'bottle{row}_{k}', (x, y + 0.03, D0 + 0.17), 0.045, h * 0.7, m, seg=8)
        cyl(f'bneck{row}_{k}', (x, y + 0.03 + h * 0.7, D0 + 0.17), 0.018, h * 0.3, m, seg=6)
# as duas geladeiras pequenas atrás do balcão (wiki, Desconjuração)
for k, x in enumerate((-1.9, -2.8)):
    box(f'minifridge{k}', (x, 0.45, D0 + 0.4), (0.8, 0.9, 0.6), M['white'])
    box(f'minifridge_glass{k}', (x, 0.5, D0 + 0.71), (0.66, 0.6, 0.02), M['fridge_glass'])
for k in range(5):
    put('furniture', 'stoolBar', (-7.6 + k * 1.55, 0, CZ + 0.85), math.pi, 1.8, center=True)
col_box('stools', (-4.5, 0.4, CZ + 0.85), (7.0, 0.8, 0.45))

# ---------------- o alvo de dardos e o NICHO DA GELADEIRA AMARELA (a entrada secreta)
plane('DECAL_dartboard', (0.25, 1.75, D0 + 0.03), (0.55, 0.55), material('dartboard', '#ffffff', 0.7))
for k, x in enumerate((1.0, 3.9)):
    box(f'OCC_alcove_pier{k}', (x, HH / 2, D0 + 0.35), (0.4, HH, 0.7), M['brick'])
    col_box(f'pier{k}', (x, HH / 2, D0 + 0.35), (0.4, HH, 0.7))
FX, FZ = 2.45, D0 + 0.45
box('fridge_body', (FX, 1.02, FZ), (0.95, 2.04, 0.78), M['fridge'])
box('fridge_door', (FX, 1.1, FZ + 0.4), (0.8, 1.55, 0.03), M['fridge_glass'])
box('fridge_grill', (FX, 0.16, FZ + 0.4), (0.8, 0.22, 0.02), M['black'])
box('fridge_handle', (FX + 0.33, 1.15, FZ + 0.44), (0.04, 0.5, 0.05), M['black'])
# o teclado numérico do lado (o código 0413)
plane('DECAL_keypad', (FX + 0.62, 1.25, FZ + 0.25), (0.14, 0.2), M['keypad'], rot_y=math.pi / 2)
box('keypad_box', (FX + 0.6, 1.25, FZ + 0.25), (0.04, 0.24, 0.17), M['black'])
col_box('fridge', (FX, 1.0, FZ), (1.0, 2.0, 0.85))
# engradados de cerveja no chão do nicho
for k in range(2):
    box(f'beercrate{k}', (FX - 0.9 + k * 0.05, 0.14 + k * 0.28, FZ + 0.3), (0.5, 0.28, 0.36), M['crate_y'])
    for b in range(6):
        cyl(f'beer{k}_{b}', (FX - 1.07 + (b % 3) * 0.17 + k * 0.05, 0.28 + k * 0.28, FZ + 0.22 + (b // 3) * 0.16), 0.03, 0.22, bottle_mats[3], seg=6)

# ---------------- os ENGRADADOS, as cadeiras empilhadas, o bebedouro, a lixeira (parede de tijolo)
for c in range(2):
    for r in range(6):
        m = [M['crate_r'], M['crate_b']][(c + r) % 2] if r < 5 else M['crate_y']
        box(f'crate{c}_{r}', (4.65 + c * 0.6, 0.17 + r * 0.33, D0 + 0.42), (0.55, 0.32, 0.42), m)
col_box('crates', (4.95, 1.0, D0 + 0.42), (1.2, 2.0, 0.5))
for k in range(10):
    bar_chair(f'stack{k}', (6.25, k * 0.09, D0 + 0.5), M['yellow'], rot_y=0, solid=True)
col_box('stack', (6.25, 0.9, D0 + 0.5), (0.65, 1.8, 0.65))
box('cooler_base', (7.25, 0.5, D0 + 0.35), (0.38, 1.0, 0.36), M['white'])
cyl('cooler_jug', (7.25, 1.0, D0 + 0.35), 0.15, 0.45, M['cooler'], seg=12)
col_box('cooler', (7.25, 0.7, D0 + 0.35), (0.45, 1.4, 0.45))
put('furniture', 'trashcan', (8.2, 0, D0 + 0.4), 0.0, 1.5, center=True)
plane('DECAL_poster_choro', (5.6, 2.55, D0 + 0.03), (1.1, 0.8), material('poster_choro', '#ffffff', 0.8))

# ---------------- a SINUCA e o quadro verde (parede de tijolo da direita)
PX, PZ = 5.6, -1.6
box('pool_body', (PX, 0.65, PZ), (2.7, 0.22, 1.5), M['wood'])
box('pool_felt', (PX, 0.77, PZ), (2.4, 0.02, 1.2), M['felt'])
for sx in (-1, 1):
    for sz in (-1, 1):
        box(f'pool_leg{sx}{sz}', (PX + sx * 1.15, 0.28, PZ + sz * 0.6), (0.16, 0.56, 0.16), M['wood'])
for k in range(10):
    sphere(f'ball{k}', (PX + 0.5 + (k % 4) * 0.1, 0.81, PZ - 0.15 + (k // 4) * 0.1), (0.04, 0.04, 0.04), random.choice(bottle_mats))
sphere('ball_white', (PX - 0.7, 0.81, PZ + 0.1), (0.04, 0.04, 0.04), M['white'])
cyl('cue', (PX - 0.2, 0.83, PZ + 0.3), 0.012, 1.4, M['wood'], seg=6, rot_z=-math.pi / 2 + 0.05)
col_box('pool', (PX, 0.6, PZ), (2.8, 1.0, 1.6))
plane('DECAL_chalk', (W1 - 0.03, 1.8, -3.4), (1.9, 1.1), material('chalkboard', '#ffffff', 0.9), rot_y=-math.pi / 2)
box('chalk_frame', (W1 - 0.02, 1.8, -3.4), (0.04, 1.2, 2.0), M['wood'])

# ---------------- a PILASTRA com a TV, entre as portas da frente
box('OCC_pillar', (2.0, HH / 2, 2.4), (0.6, HH, 0.6), M['concrete'])
col_box('pillar', (2.0, HH / 2, 2.4), (0.6, HH, 0.6))
box('tv_body', (1.62, 2.45, 2.4), (0.12, 0.62, 1.0), M['black'])
plane('DECAL_tv', (1.555, 2.45, 2.4), (0.92, 0.54), M['tv'], rot_y=-math.pi / 2)

# ---------------- o FLIPERAMA (Tetris), a janela gradeada e a pilha de cadeiras (lado esquerdo)
AX, AZ = W0 + 0.42, -2.7
box('arcade_body', (AX, 0.9, AZ), (0.75, 1.8, 0.7), M['arcade'], rot_y=math.pi / 2)
box('arcade_top', (AX + 0.05, 1.75, AZ), (0.65, 0.22, 0.72), M['red'])
plane('DECAL_arcade', (AX + 0.39, 1.35, AZ), (0.52, 0.42), M['arcade_screen'], rot_y=math.pi / 2)
box('arcade_panel', (AX + 0.42, 1.0, AZ), (0.25, 0.08, 0.62), M['black'])
col_box('arcade', (AX, 0.9, AZ), (0.8, 1.8, 0.8))
# janela gradeada para a viela
box('window_left', (W0 + 0.02, 1.85, 1.2), (0.03, 1.1, 1.4), M['window_dark'])
for k in range(7):
    cyl(f'bar_v{k}', (W0 + 0.06, 1.3, 0.6 + k * 0.2), 0.012, 1.1, M['metal'], seg=6)
for k in range(3):
    box(f'bar_h{k}', (W0 + 0.06, 1.4 + k * 0.45, 1.2), (0.02, 0.025, 1.4), M['metal'])
for k in range(8):
    bar_chair(f'pile{k}', (W0 + 0.55, k * 0.09, D1 - 0.55), M['red'] if k % 3 else M['yellow'], rot_y=math.pi / 2, solid=True)
col_box('pile', (W0 + 0.55, 0.8, D1 - 0.55), (0.7, 1.6, 0.7))

# ---------------- panfletos de bandas nas paredes brancas (Hexatombe)
plane('DECAL_flyers0', (W0 + 0.03, 2.1, -0.6), (1.3, 0.9), M['flyers'], rot_y=math.pi / 2)
plane('DECAL_flyers1', (-5.6, 2.2, D1 - 0.03), (1.6, 0.9), M['flyers2'], rot_y=math.pi)
plane('DECAL_flyers2', (W1 - 0.03, 2.1, DOOR_C[1] + 0.3), (0.5, 0.75), material('poster_flame', '#ffffff', 0.8), rot_y=-math.pi / 2)

# ---------------- as MESAS do salão: amarelas e vermelhas, cadeiras de plástico
table_set('t0', (-5.8, 0, -1.4), M['yellow'], turn=0.2)
table_set('t1', (-2.6, 0, -1.1), M['red'], turn=0.6, mixed=M['yellow'])
table_set('t2', (-5.6, 0, 2.6), M['red'], turn=0.1)
table_set('t3', (-1.4, 0, 2.9), M['yellow'], turn=0.9, mixed=M['red'])

# ===================================================================== O SOBRADO POR FORA
FT = D1 + T  # a face da fachada da frente
RT = W1 + T  # a face da fachada lateral
# o andar de cima: reboco vermelho, a mesma quina chanfrada
box('OCC_up_front', ((W0 - T) / 2 + (W1 - CH) / 2, (HH + H2) / 2, D1 + T / 2), (W1 - CH - W0 + T, H2 - HH, T), M['plaster_red'])
box('OCC_up_side', (W1 + T / 2, (HH + H2) / 2, (D0 - T + D1 - CH) / 2), (T, H2 - HH, D1 - CH - D0 + T), M['plaster_red'])
box('OCC_up_corner', (W1 - CH / 2 + 0.05, (HH + H2) / 2, D1 - CH / 2 + 0.05), (cl + 0.2, H2 - HH, T * 2), M['plaster_red'], rot_y=math.pi / 4)
box('OCC_up_left', (W0 - T / 2, (HH + H2) / 2, 0), (T, H2 - HH, D1 - D0 + T * 2), M['plaster_red'])
box('OCC_up_back', (0, (HH + H2) / 2, D0 - T / 2), (W1 - W0 + T * 2, H2 - HH, T), M['plaster_red'])
box('OCC_band', (0, HH + 0.1, D1 + T + 0.04), (W1 - W0 - CH + 0.4, 0.2, 0.1), M['frame'])
# janelas brancas com o ar-condicionado
lit = [True, False, True, False, False, True]
for k, x in enumerate((-6.6, -3.4, -0.2, 3.0)):
    box(f'OCC_upwin_f{k}', (x, HH + 1.95, FT + 0.01), (1.3, 1.5, 0.06), M['frame'])
    box(f'OCC_upwin_fg{k}', (x, HH + 1.95, FT + 0.04), (1.1, 1.3, 0.04), M['window_lit'] if lit[k] else M['window_dark'])
    if k in (0, 2):
        box(f'OCC_ac_f{k}', (x + 1.05, HH + 2.4, FT + 0.25), (0.75, 0.45, 0.45), M['ac'])
for k, z in enumerate((-4.0, -0.6, 2.6)):
    box(f'OCC_upwin_s{k}', (RT + 0.01, HH + 1.95, z), (0.06, 1.5, 1.3), M['frame'])
    box(f'OCC_upwin_sg{k}', (RT + 0.04, HH + 1.95, z), (0.04, 1.3, 1.1), M['window_lit'] if lit[k + 3] else M['window_dark'])
    if k == 1:
        box(f'OCC_ac_s{k}', (RT + 0.25, HH + 2.4, z - 1.05), (0.45, 0.45, 0.75), M['ac'])
# o telhado de barro (quatro águas com beiral)
RW, RD = (W1 - W0) / 2 + 0.7, (D1 - D0) / 2 + 0.7
for k, (pos, size, rx, rz) in enumerate([
    ((0, H2 + 0.55, RD / 2 - 0.2), (2 * RW, 0.14, RD + 0.2), math.radians(17), 0),
    ((0, H2 + 0.55, -RD / 2 + 0.2), (2 * RW, 0.14, RD + 0.2), math.radians(-17), 0),
]):
    box(f'OCC_roof{k}', pos, size, M['roof'], rot_x=rx, rot_z=rz)
box('OCC_roof_ridge', (0, H2 + 1.05, 0), (2 * RW - 1.0, 0.18, 0.3), M['roof'])
for s in (-1, 1):
    box(f'OCC_gable{s}', (s * (W1 + T / 2), H2 + 0.45, 0), (T, 0.9, D1 - D0), M['plaster_red'])

# ---------------- a QUINA por fora: a placa, o painel branco e a floreira
QX, QZ = W1 - CH / 2 + 0.32, D1 - CH / 2 + 0.32   # face de fora do chanfro
qa = math.pi / 4
box('sign_board', (QX + 0.08, 2.95, QZ + 0.08), (2.4, 0.9, 0.1), M['wood'], rot_y=qa)
plane('DECAL_sign', (QX + 0.15, 2.95, QZ + 0.15), (2.3, 0.8), material('sign_suvaco', '#ffffff', 0.7), rot_y=qa)
# o crânio com chifres em cima da placa
sphere('sign_skull', (QX + 0.12, 3.6, QZ + 0.12), (0.22, 0.2, 0.16), M['bone'])
for s in (-1, 1):
    hx, hz = math.cos(qa) * s, -math.sin(qa) * s
    cyl(f'sign_horn{s}', (QX + 0.12 + hx * 0.2, 3.66, QZ + 0.12 + hz * 0.2), 0.05, 0.42, M['bone'], seg=6, r_top=0.015, rot_y=qa, rot_z=-s * 1.2)
box('sign_lamp', (QX + 0.35, 3.45, QZ + 0.35), (0.3, 0.08, 0.2), M['lamp'], rot_y=qa)
box('corner_panel', (QX + 0.06, 1.15, QZ + 0.06), (1.6, 1.0, 0.06), M['white'], rot_y=qa)
box('planter', (QX + 0.3, 0.3, QZ + 0.3), (1.7, 0.6, 0.5), M['brick'], rot_y=qa)
for k in range(5):
    t = (k - 2) * 0.32
    sphere(f'planter_leaf{k}', (QX + 0.3 + t * math.cos(qa), 0.72 + random.uniform(0, 0.12), QZ + 0.3 - t * math.sin(qa)), (0.22, 0.28, 0.22), M['plant'])
col_box('planter', (QX + 0.35, 0.4, QZ + 0.35), (0.9, 0.8, 0.9))

# ---------------- os TOLDOS das duas fachadas (luz quente embaixo) e as mesas da calçada
box('awning_front', (-1.3, 2.75, FT + 1.25), (15.0, 0.06, 2.6), M['awning'], rot_x=math.radians(12))
box('awning_side', (RT + 1.25, 2.75, -1.6), (2.6, 0.06, 8.6), M['awning'], rot_z=math.radians(-12))
for k, x in enumerate((-8.6, -4.0, 1.4, 6.0)):
    box(f'awning_rod_f{k}', (x, 2.72, FT + 1.25), (0.04, 0.04, 2.6), M['metal'], rot_x=math.radians(12))
table_set('o0', (-6.6, 0, FT + 1.6), M['yellow'], turn=0.3)
table_set('o1', (2.0, 0, FT + 1.7), M['red'], turn=0.7)
table_set('o2', (RT + 1.6, 0, -3.8), M['yellow'], turn=0.2, mixed=M['red'])
table_set('o3', (RT + 1.7, 0, -0.6), M['red'], turn=0.5)
# vaso na calçada entre as portas
put('furniture', 'pottedPlant', (-4.2, 0, FT + 0.35), 0.4, 2.2, center=True)
col_box('pot', (-4.2, 0.3, FT + 0.35), (0.5, 0.6, 0.5))

# ===================================================================== AS RUAS DA ESQUINA
SW_F = 10.5     # fim da calçada da frente (meio-fio)
ST_F = 20.5     # fim da rua principal
SW_S = 13.5     # fim da calçada lateral
ST_S = 23.5     # fim da rua lateral
box('FLOOR_sidewalk_front', (-13.25, -0.045, (D1 + SW_F) / 2), (53.5, 0.08, SW_F - D1 + 0.5), M['sidewalk'])
box('FLOOR_sidewalk_side', ((W1 + SW_S) / 2, -0.045, (-32 + D1) / 2), (SW_S - W1 + 0.5, 0.08, D1 + 32), M['sidewalk'])
box('FLOOR_sidewalk_far', (2.5, -0.045, ST_F + 1.5), (85, 0.08, 3.0), M['sidewalk'])
box('FLOOR_sidewalk_farside', (ST_S + 1.5, -0.045, (-32 + SW_F) / 2), (3.0, 0.08, SW_F + 32), M['sidewalk'])
box('FLOOR_curb_f', (-13.25, 0.0, SW_F), (53.5, 0.12, 0.2), M['concrete'])
box('FLOOR_curb_s', (SW_S, 0.0, (-32 + SW_F) / 2), (0.2, 0.12, SW_F + 32), M['concrete'])
# o asfalto: peças do City Kit Roads (10 m), o cruzamento na esquina
RZ, RX = (SW_F + ST_F) / 2, (SW_S + ST_S) / 2
put('roads', 'road-crossroad', (RX, -0.07, RZ), 0.0, 10.0, up=2.0)
for k in range(1, 6):
    put('roads', 'road-crossing' if k == 2 else 'road-straight', (RX - k * 10.0, -0.07, RZ), 0.0, 10.0, up=2.0)
for k in range(1, 3):
    put('roads', 'road-straight', (RX + k * 10.0, -0.07, RZ), 0.0, 10.0, up=2.0)
for k in range(1, 5):
    put('roads', 'road-straight', (RX, -0.07, RZ - k * 10.0), math.pi / 2, 10.0, up=2.0)
box('GROUND_under', (0, -0.3, 0), (140, 0.1, 120), M['asphalt'])

# ---------------- a placa das ruas, o poste com a fiação, o hidrante
SX, SZ = W1 + 2.0, D1 + 2.2
cyl('OCC_streetsign_pole', (SX, 0, SZ), 0.04, 2.9, M['metal'], seg=8)
col_cyl('streetsign', (SX, 0, SZ), 0.12, 2.9)
for k, (name, rot, y) in enumerate((('R. HENRIQUE L.', 0.0, 2.75), ('R. FELIPE L.', math.pi / 2, 2.45))):
    box(f'streetsign_plate{k}', (SX, y, SZ), (1.3, 0.25, 0.04) if k == 0 else (0.04, 0.25, 1.3), M['street_blue'])
    for side in (1, -1):
        off = 0.03 * side
        text(f'streetsign_txt{k}{side}', name, (SX + (off if k else 0), y - 0.07, SZ + (0 if k else off)), 0.15, M['street_text'], rot_y=(rot if side == 1 else rot + math.pi))
PX2, PZ2 = W1 + 3.6, SW_F - 0.45
cyl('OCC_pole_main', (PX2, 0, PZ2), 0.16, 9.0, M['wood'], seg=10)
col_cyl('pole_main', (PX2, 0, PZ2), 0.25, 9)
box('OCC_pole_cross', (PX2, 8.2, PZ2), (1.8, 0.12, 0.12), M['wood'])
box('OCC_pole_transformer', (PX2 + 0.35, 6.6, PZ2), (0.5, 0.8, 0.5), M['metal'])
_seg('pole_arm', (PX2, 6.0, PZ2), (PX2 - 1.4, 6.3, PZ2 + 0.6), 0.06, 0.06, M['metal'])
box('pole_lamp', (PX2 - 1.45, 6.2, PZ2 + 0.62), (0.45, 0.12, 0.25), M['lamp'])
cyl('hydrant', (W1 - 3.4, 0, D1 + 3.5), 0.16, 0.7, M['hydrant'], seg=10)
col_cyl('hydrant', (W1 - 3.4, 0, D1 + 3.5), 0.25, 0.7)

# postes de madeira pelas ruas e a fiação entre eles (a "teia" de fios das referências)
poles = [(-26.0, SW_F - 0.45), (-14.0, SW_F - 0.45), (PX2, PZ2), (SW_S - 0.45, -6.0), (SW_S - 0.45, -20.0),
         (-20.0, ST_F + 0.6), (2.0, ST_F + 0.6), (ST_S + 0.6, 4.0), (ST_S + 0.6, -14.0)]
for k, (x, z) in enumerate(poles):
    if (x, z) != (PX2, PZ2):
        cyl(f'OCC_pole{k}', (x, 0, z), 0.15, 8.6, M['wood'], seg=8)
        col_cyl(f'pole{k}', (x, 0, z), 0.24, 8.6)
        box(f'pole_cross{k}', (x, 7.9, z), (1.6, 0.1, 0.1), M['wood'], rot_y=0 if abs(z - SW_F) < 2 or abs(z - ST_F) < 2 else math.pi / 2)
links = [(0, 1), (1, 2), (2, 3), (3, 4), (5, 6), (6, 7), (7, 8), (2, 6), (2, 7)]
for k, (a, b) in enumerate(links):
    (xa, za), (xb, zb) = poles[a], poles[b]
    for w in range(3):
        o = (w - 1) * 0.5
        ya, yb = 7.9 - w * 0.05, 7.8 - w * 0.08
        mx, mz = (xa + xb) / 2, (za + zb) / 2
        sag = 0.9 + w * 0.2
        _seg(f'wire{k}_{w}a', (xa + o * 0.2, ya, za + o), (mx + o * 0.2, (ya + yb) / 2 - sag, mz + o), 0.025, 0.025, M['wire'])
        _seg(f'wire{k}_{w}b', (mx + o * 0.2, (ya + yb) / 2 - sag, mz + o), (xb + o * 0.2, yb, zb + o), 0.025, 0.025, M['wire'])
# postes de luz curvos do kit do outro lado das ruas
for k, (x, z, r) in enumerate(((-30, ST_F + 0.9, math.pi), (-8, ST_F + 0.9, math.pi), (12, ST_F + 0.9, math.pi), (ST_S + 0.9, -8, -math.pi / 2), (ST_S + 0.9, -24, -math.pi / 2))):
    put('roads', 'light-curved', (x, 0, z), r, 7.8)
    col_cyl(f'light{k}', (x, 0, z), 0.2, 5)


def car(name, model, x, z, rot):
    put('cars', model, (x, 0, z), rot, 1.75)
    col_box(name, (x, 0.6, z), (4.6, 1.4, 2.2) if abs(math.sin(rot)) > 0.5 else (2.2, 1.4, 4.6))


car('car1', 'sedan', -12.0, SW_F + 1.4, math.pi / 2)
car('car2', 'hatchback-sports', SW_S + 1.4, -12.0, math.pi)
car('car3', 'van', 6.0, ST_F - 1.4, -math.pi / 2)
car('car4', 'taxi', -30.0, ST_F - 1.4, -math.pi / 2)
for k, x in enumerate((-17.5, -16.7)):
    put('roads', 'construction-cone', (x, 0, SW_F - 0.6), 0.3 * k, 8.0)

# ---------------- a VIELA (à esquerda do bar): o muro com os cartazes, caçamba e sacos de lixo
VX0, VX1, VZ0 = -12.5, W0 - T, -12.0
box('FLOOR_alley', ((VX0 + VX1) / 2, -0.045, (VZ0 + D1) / 2 + 0.2), (VX1 - VX0 + 0.2, 0.08, D1 - VZ0 + 0.6), M['floor'])
box('OCC_alley_end', ((VX0 + VX1) / 2, 1.6, VZ0 - 0.15), (VX1 - VX0 + 0.4, 3.2, 0.3), M['brick'])
col_box('alley_end', ((VX0 + VX1) / 2, 1.6, VZ0 - 0.15), (VX1 - VX0 + 0.4, 3.2, 0.3))
# o fundo do bar continua em muro até o fim da viela
box('OCC_alley_wall_r', (W0 - T / 2, 1.6, (VZ0 + D0) / 2 - 0.12), (T, 3.2, D0 - VZ0 - 0.25), M['brick'])
col_box('alley_wall_r', (W0 - T / 2, 1.6, (VZ0 + D0) / 2 - 0.12), (T, 3.2, D0 - VZ0 - 0.25))
plane('DECAL_opspor', (VX0 + 0.03, 1.8, -2.5), (2.2, 1.4), M['opspor'], rot_y=math.pi / 2)
plane('DECAL_missing', (VX0 + 0.03, 1.6, 0.4), (0.7, 0.95), M['missing'], rot_y=math.pi / 2)
plane('DECAL_missing2', (VX0 + 0.03, 1.55, -5.6), (0.7, 0.95), M['missing'], rot_y=math.pi / 2)
put('roads', 'dumpster', (VX0 + 1.0, 0, -8.5), math.pi / 2, 6.0, center=True)
col_box('dumpster', (VX0 + 1.0, 0.65, -8.5), (1.2, 1.3, 1.7))
for k in range(5):
    sphere(f'bag{k}', (VX1 - 0.55 + random.uniform(-0.15, 0.15), 0.28, -10.8 + k * 0.45), (0.32, 0.3, 0.3), M['trashbag'])
col_box('bags', (VX1 - 0.55, 0.3, -9.9), (0.8, 0.6, 2.4))
box('alley_lamp', (VX1 - 0.1, 3.0, -4.0), (0.2, 0.25, 0.4), M['lamp'])

# ===================================================================== A VIZINHANÇA (medida: nada entra no bar)
def bldg(name, x0, x1, z0, z1, h, wall, faces, shop=None):
    """Prédio de x0..x1, z0..z1 (altura h), janelas nas faces viradas para a rua (faces: '+z', '-z', '+x', '-x')."""
    box(f'OCC_{name}', ((x0 + x1) / 2, h / 2, (z0 + z1) / 2), (x1 - x0, h, z1 - z0), wall)
    col_box(name, ((x0 + x1) / 2, min(h, 4) / 2, (z0 + z1) / 2), (x1 - x0, min(h, 4), z1 - z0))
    box(f'OCC_{name}_cap', ((x0 + x1) / 2, h + 0.15, (z0 + z1) / 2), (x1 - x0 + 0.2, 0.3, z1 - z0 + 0.2), M['concrete'])
    for f in faces:
        along = (x0, x1) if f in ('+z', '-z') else (z0, z1)
        n = max(1, int((along[1] - along[0]) // 2.6))
        for row in range(1, int(h // 3)):
            y = row * 3.0 + 1.5
            if y > h - 1:
                break
            for i in range(n):
                t = along[0] + (i + 0.5) * (along[1] - along[0]) / n
                m = M['window_lit'] if random.random() < 0.3 else M['window_dark']
                if f == '+z':
                    box(f'OCC_{name}_w{row}_{i}', (t, y, z1 + 0.03), (1.1, 1.3, 0.05), m)
                elif f == '-z':
                    box(f'OCC_{name}_w{row}_{i}', (t, y, z0 - 0.03), (1.1, 1.3, 0.05), m)
                elif f == '+x':
                    box(f'OCC_{name}_w{row}_{i}', (x1 + 0.03, y, t), (0.05, 1.3, 1.1), m)
                else:
                    box(f'OCC_{name}_w{row}_{i}', (x0 - 0.03, y, t), (0.05, 1.3, 1.1), m)
        if shop:
            # o térreo: porta de aço (fechada) ou vitrine acesa
            mm = M['shutter'] if shop == 'shutter' else M['window_lit']
            if f == '+z':
                box(f'OCC_{name}_shop', ((x0 + x1) / 2, 1.3, z1 + 0.04), (min(6, x1 - x0 - 1), 2.5, 0.05), mm)
            elif f == '-z':
                box(f'OCC_{name}_shop', ((x0 + x1) / 2, 1.3, z0 - 0.04), (min(6, x1 - x0 - 1), 2.5, 0.05), mm)
            elif f == '-x':
                box(f'OCC_{name}_shop', (x0 - 0.04, 1.3, (z0 + z1) / 2), (0.05, 2.5, min(6, z1 - z0 - 1)), mm)
            elif f == '+x':
                box(f'OCC_{name}_shop', (x1 + 0.04, 1.3, (z0 + z1) / 2), (0.05, 2.5, min(6, z1 - z0 - 1)), mm)


walls = [M['plaster_a'], M['plaster_b'], M['plaster_c'], M['brick']]
# o mesmo quarteirão do bar: à esquerda da viela (fachada na rua principal) e atrás do bar (fachada na rua lateral)
bldg('nb_left1', -24.0, VX0, -16.0, D1 + T, 9.0, M['plaster_a'], ['+z'], shop='lit')
bldg('nb_left2', -40.0, -24.0, -16.0, D1 + T, 13.0, M['plaster_b'], ['+z'], shop='shutter')
bldg('nb_back', VX1 + 0.25, W1 + T, -26.0, VZ0 - 0.3, 11.0, M['plaster_c'], ['+x'], shop='shutter')
bldg('nb_back2', VX0, VX1 + 0.25, -26.0, VZ0 - 0.3, 11.0, M['plaster_c'], [])
# do outro lado da rua principal (fachada virada para o bar)
xs = [-40.0, -29.0, -19.0, -9.0, 0.5, 13.5]
for k in range(len(xs) - 1):
    bldg(f'far{k}', xs[k] + 0.15, xs[k + 1] - 0.15, ST_F + 3.0, ST_F + 14.0, random.choice([9, 12, 15, 18]), walls[k % 4], ['-z'], shop=random.choice(['lit', 'shutter']))
bldg('far_corner', ST_S + 3.0, 45.0, ST_F + 3.0, ST_F + 14.0, 14.0, M['plaster_b'], ['-z', '-x'], shop='lit')
# do outro lado da rua lateral
zs = [-30.0, -16.0, -4.0, SW_F]
for k in range(len(zs) - 1):
    bldg(f'side{k}', ST_S + 3.0, ST_S + 14.0, zs[k] + 0.15, zs[k + 1] - 0.15, random.choice([10, 13, 16]), walls[(k + 1) % 4], ['-x'], shop=random.choice(['lit', 'shutter']))
# os prédios altos ao fundo (a São Paulo da referência)
for k, (x, z, w, d, h) in enumerate([(-30, -36, 12, 10, 34), (-6, -42, 14, 12, 42), (16, -38, 10, 10, 30), (40, -20, 12, 14, 38),
                                       (-50, 2, 10, 14, 28), (-26, 46, 14, 10, 36), (8, 48, 12, 12, 44), (40, 40, 12, 12, 32)]):
    box(f'OCC_tower{k}', (x, h / 2, z), (w, h, d), M['plaster_b'] if k % 2 else M['concrete'])
    for r in range(4, int(h // 3)):
        for i in range(3):
            if random.random() < 0.22:
                fz = z + d / 2 + 0.03 if z < 0 or abs(z) < 10 else z - d / 2 - 0.03
                box(f'OCC_tower{k}_w{r}_{i}', (x - w / 3 + i * w / 3, r * 3.0, fz), (1.4, 1.4, 0.05), M['window_lit'])

finalize(OUT)
