"""
MANSÃO ENDIABRADA — public/arenas/mansao.glb (OUTRO LADO: a primeira dungeon, o território do Espreitador)
Referências: wiki "O Espreitador" (aparições na Mansão Endiabrada: os ARMÁRIOS e as FRESTAS por onde ele corre, o relógio
parado nas 2:11, o som de goteira) e o TODO §5.2 (corredores estreitos, salas ligadas, frestas, pouca visibilidade, um
espaço final para a luta).
Mapa EM LINHA, da esquerda (x −18) para a direita (x 76), para a câmera de exploração ficar legível:
  hall (x −18…−10) → corredor A → sala de estar (−6…6) → corredor B (a fresta que observa) → biblioteca (16…30) →
  corredor C → quarto principal (38…62, a sala do chefe) → porta de saída → corredor escuro (62…76).
Sem teto (o alto fica no breu da névoa): a câmera passa por cima das paredes, que ficam transparentes quando tampam a
luta (OCC_). Os ARMÁRIOS do quarto, a fresta do corredor B, as portas trancadas e a porta de saída são do jogo
(src/pve/Dungeon.js): abrem, fecham e mudam durante a fase.
Tudo feito aqui com primitivas (sem kit pronto): papel de parede, tacos, estantes, sofá, lareira, cama de dossel.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'mansao.glb'
random.seed(211)
start()

M = {
    'wall': material('wallpaper_mansao', '#4a3a34', 0.9),
    'wains': material('wood_dark', '#3a2618', 0.7),
    'floor': material('parquet_mansao', '#3e2a1c', 0.8),
    'rug': material('rug_mansao', '#4a1414', 1.0),
    'books': material('books_mansao', '#2a1a10', 0.9),
    'wood': material('wood_mansao', '#4a3020', 0.65),
    'woodlt': material('wood_light_mansao', '#6a4a30', 0.6),
    'velvet': material('velvet_mansao', '#4a1a22', 1.0),
    'velvet2': material('velvet_green_mansao', '#1e3226', 1.0),
    'linen': material('linen_mansao', '#a8a090', 0.9),
    'brass': material('brass_mansao', '#9a7a3a', 0.35, metal=0.7),
    'iron': material('iron_mansao', '#2a2a2c', 0.5, metal=0.6),
    'stone': material('stone_trim', '#8a8478', 0.85),
    'black': material('void_mansao', '#050405', 1.0),
    'candle': material('candle_mansao', '#f0e0c0', 0.5, emission='#ffb860', strength=3),
    'flame': material('flame_mansao', '#ffb040', 0.4, emission='#ff9a30', strength=8),
    'fire': material('fire_mansao', '#ff6a20', 0.4, emission='#ff5a10', strength=6),
    'moon': material('moon_window_mansao', '#4a5a8a', 0.2, emission='#6a80c0', strength=1.6),
    'glass': material('mirror_mansao', '#8a9aa0', 0.05, metal=0.9),
    'water': material('water_stain_mansao', '#1a1814', 0.08, metal=0.2),
    'eye': material('eye_yellow_mansao', '#f2c230', 0.3, emission='#f2c230', strength=4),
    'clock': material('clock_211', '#d8ccb0', 0.6),
    'portrait': material('portrait_mansao', '#3a2a1a', 0.8),
}

HH = 3.2   # altura das paredes
T = 0.22   # espessura
DOOR = 1.45  # meia largura das portas entre salas


def wall(name, x0, x1, z0, z1, mat=None):
    """parede de (x0,z0) a (x1,z1) alinhada a um eixo, com rodapé de madeira e o obstáculo"""
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    w = max(abs(x1 - x0), T)
    d = max(abs(z1 - z0), T)
    box(f'OCC_{name}', (cx, HH / 2, cz), (w, HH, d), mat or M['wall'])
    box(f'OCC_{name}_wains', (cx, 0.5, cz), (w + 0.04 if w > d else w, 1.0, d + 0.04 if d > w else d), M['wains'])
    col_box(name, (cx, HH / 2, cz), (w, HH, d))


def room(name, x0, x1, z0, z1, left_door=True, right_door=True, door=DOOR, floor='floor'):
    box(f'FLOOR_{name}', ((x0 + x1) / 2, -0.05, (z0 + z1) / 2), (x1 - x0, 0.1, z1 - z0), M[floor])
    wall(f'{name}_back', x0 - T / 2, x1 + T / 2, z0 - T / 2, z0 - T / 2)
    wall(f'{name}_front', x0 - T / 2, x1 + T / 2, z1 + T / 2, z1 + T / 2)
    for side, x, has in (('L', x0 - T / 2, left_door), ('R', x1 + T / 2, right_door)):
        if has:
            wall(f'{name}_{side}a', x, x, z0, -door)
            wall(f'{name}_{side}b', x, x, door, z1)
            box(f'{name}_{side}lintel', (x, HH - 0.25, 0), (T + 0.06, 0.5, door * 2), M['wains'])
            for s in (-1, 1):  # batentes
                box(f'{name}_{side}jamb{s}', (x, HH / 2 - 0.25, s * door), (T + 0.1, HH - 0.5, 0.12), M['wood'])
        else:
            wall(f'{name}_{side}', x, x, z0, z1)


def corridor(name, x0, x1, half):
    box(f'FLOOR_{name}', ((x0 + x1) / 2, -0.05, 0), (x1 - x0, 0.1, half * 2), M['floor'])
    wall(f'{name}_back', x0, x1, -half - T / 2, -half - T / 2)
    wall(f'{name}_front', x0, x1, half + T / 2, half + T / 2)
    # passadeira
    box(f'{name}_runner', ((x0 + x1) / 2, 0.006, 0), (x1 - x0 - 0.4, 0.012, half * 0.9), M['rug'])


def candle(name, pos, flicker=True):
    x, y, z = pos
    cyl(f'{name}_holder', (x, y, z), 0.06, 0.03, M['brass'], seg=10)
    cyl(f'{name}_wax', (x, y + 0.03, z), 0.025, 0.14, M['candle'], seg=8)
    sphere(f'{"FLICKER_" if flicker else ""}{name}_flame', (x, y + 0.2, z), (0.018, 0.04, 0.018), M['flame'], seg=6, rings=4)


def sconce(name, pos, rot_y=0.0):
    x, y, z = pos
    box(f'{name}_plate', (x, y, z), (0.18, 0.3, 0.05), M['brass'], rot_y=rot_y)
    fx, fz = math.sin(rot_y) * 0.14, math.cos(rot_y) * 0.14
    candle(name, (x + fx, y + 0.02, z + fz))


def wardrobe(name, pos, rot_y=0.0, w=1.2, h=2.3, d=0.62, ajar=0.25):
    """armário antigo: corpo, cornija, pés e duas portas — uma ENTREABERTA (a fresta escura)"""
    x, _, z = pos
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    rx, rz = math.cos(rot_y), -math.sin(rot_y)
    box(f'{name}_body', (x, h / 2 + 0.1, z), (w, h, d), M['wood'], rot_y=rot_y)
    box(f'{name}_cornice', (x, h + 0.16, z), (w + 0.12, 0.12, d + 0.08), M['wood'], rot_y=rot_y)
    for s in (-1, 1):
        for b in (-1, 1):
            box(f'{name}_foot{s}{b}', (x + rx * s * (w / 2 - 0.08) + fx * b * (d / 2 - 0.08), 0.05, z + rz * s * (w / 2 - 0.08) + fz * b * (d / 2 - 0.08)), (0.1, 0.1, 0.1), M['wood'], rot_y=rot_y)
    # o vão escuro atrás das portas
    box(f'{name}_dark', (x + fx * (d / 2 - 0.02), h / 2 + 0.1, z + fz * (d / 2 - 0.02)), (w - 0.1, h - 0.1, 0.02), M['black'], rot_y=rot_y)
    # porta esquerda fechada, direita entreaberta
    lx, lz = x - rx * w / 4 + fx * (d / 2 + 0.02), z - rz * w / 4 + fz * (d / 2 + 0.02)
    box(f'{name}_doorL', (lx, h / 2 + 0.1, lz), (w / 2 - 0.02, h - 0.12, 0.04), M['woodlt'], rot_y=rot_y)
    hx, hz = x + rx * (w / 2 - 0.01) + fx * (d / 2 + 0.02), z + rz * (w / 2 - 0.01) + fz * (d / 2 + 0.02)
    a = rot_y + ajar
    dx, dz = -math.cos(a) * (w / 4), math.sin(a) * (w / 4)
    box(f'{name}_doorR', (hx + dx, h / 2 + 0.1, hz + dz), (w / 2 - 0.02, h - 0.12, 0.04), M['woodlt'], rot_y=a)
    for k, (px, pz) in enumerate(((lx, lz), (hx + dx * 1.7, hz + dz * 1.7))):
        sphere(f'{name}_knob{k}', (px + fx * 0.03, h / 2 + 0.1, pz + fz * 0.03), (0.025, 0.025, 0.025), M['brass'], seg=6, rings=4)
    col_box(name, (x, h / 2, z), (w if abs(fz) > 0.5 else d, h, d if abs(fz) > 0.5 else w))


def frame(name, pos, size, rot_y=0.0, mat=None):
    x, y, z = pos
    w, h = size
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    box(f'{name}_frame', (x, y, z), (w + 0.12, h + 0.12, 0.05), M['brass'], rot_y=rot_y)
    plane(f'DECAL_{name}', (x + fx * 0.03, y, z + fz * 0.03), (w, h), mat or M['portrait'], rot_y=rot_y)


def chandelier(name, pos, n=6, r=0.55):
    x, y, z = pos
    cyl(f'{name}_chain', (x, y + 0.3, z), 0.015, HH - y - 0.3, M['iron'], seg=6)
    cyl(f'{name}_hub', (x, y, z), 0.12, 0.3, M['brass'], seg=10)
    cyl(f'{name}_ring', (x, y + 0.05, z), r, 0.04, M['brass'], seg=20)
    for i in range(n):
        a = i / n * TAU
        candle(f'{name}_c{i}', (x + math.cos(a) * r, y + 0.09, z + math.sin(a) * r))


def bookshelf(name, pos, rot_y=0.0, w=2.2, h=2.8, d=0.42):
    x, _, z = pos
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    box(f'{name}_case', (x, h / 2, z), (w, h, d), M['wood'], rot_y=rot_y)
    box(f'{name}_books', (x + fx * (d / 2 + 0.005), h / 2 + 0.05, z + fz * (d / 2 + 0.005)), (w - 0.14, h - 0.3, 0.01), M['books'], rot_y=rot_y)
    col_box(name, (x, h / 2, z), (w if abs(fz) > 0.5 else d, h, d if abs(fz) > 0.5 else w))


def table(name, pos, size, top=None, h=0.78, round_=False):
    x, _, z = pos
    w, d = size
    if round_:
        cyl(f'{name}_top', (x, h - 0.05, z), w / 2, 0.05, top or M['wood'], seg=18)
        cyl(f'{name}_leg', (x, 0, z), 0.07, h - 0.05, M['wood'], seg=8)
        cyl(f'{name}_base', (x, 0, z), 0.3, 0.05, M['wood'], seg=12)
        col_cyl(name, (x, 0, z), w / 2, h)
        return
    box(f'{name}_top', (x, h - 0.03, z), (w, 0.06, d), top or M['wood'])
    for sx in (-1, 1):
        for sz in (-1, 1):
            box(f'{name}_leg{sx}{sz}', (x + sx * (w / 2 - 0.07), (h - 0.06) / 2, z + sz * (d / 2 - 0.07)), (0.07, h - 0.06, 0.07), M['wood'])
    col_box(name, (x, h / 2, z), (w, h, d))


def chair(name, pos, rot_y=0.0, mat=None):
    x, _, z = pos
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    box(f'{name}_seat', (x, 0.46, z), (0.48, 0.08, 0.48), mat or M['velvet'], rot_y=rot_y)
    box(f'{name}_back', (x - fx * 0.22, 0.85, z - fz * 0.22), (0.48, 0.75, 0.06), M['wood'], rot_y=rot_y)
    for sx in (-1, 1):
        for sz in (-1, 1):
            rx, rz = math.cos(rot_y), -math.sin(rot_y)
            box(f'{name}_l{sx}{sz}', (x + rx * sx * 0.2 + fx * sz * 0.2, 0.21, z + rz * sx * 0.2 + fz * sz * 0.2), (0.05, 0.42, 0.05), M['wood'], rot_y=rot_y)
    col_cyl(name, (x, 0, z), 0.32, 1.0)


def armchair(name, pos, rot_y=0.0, mat=None):
    x, _, z = pos
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    rx, rz = math.cos(rot_y), -math.sin(rot_y)
    m = mat or M['velvet']
    box(f'{name}_seat', (x, 0.35, z), (0.9, 0.3, 0.85), m, rot_y=rot_y, bevel=0.05)
    box(f'{name}_back', (x - fx * 0.38, 0.8, z - fz * 0.38), (0.9, 0.95, 0.18), m, rot_y=rot_y, bevel=0.05)
    for s in (-1, 1):
        box(f'{name}_arm{s}', (x + rx * s * 0.42, 0.6, z + rz * s * 0.42), (0.16, 0.36, 0.85), m, rot_y=rot_y, bevel=0.04)
    col_box(name, (x, 0.5, z), (0.95, 1.0, 0.95))


def sofa(name, pos, rot_y=0.0, w=2.2, mat=None):
    x, _, z = pos
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    rx, rz = math.cos(rot_y), -math.sin(rot_y)
    m = mat or M['velvet']
    box(f'{name}_seat', (x, 0.35, z), (w, 0.3, 0.9), m, rot_y=rot_y, bevel=0.05)
    box(f'{name}_back', (x - fx * 0.4, 0.82, z - fz * 0.4), (w, 0.9, 0.2), m, rot_y=rot_y, bevel=0.05)
    for s in (-1, 1):
        box(f'{name}_arm{s}', (x + rx * s * (w / 2 - 0.08), 0.6, z + rz * s * (w / 2 - 0.08)), (0.18, 0.42, 0.9), m, rot_y=rot_y, bevel=0.04)
    col_box(name, (x, 0.5, z), (w if abs(fz) > 0.5 else 0.95, 1.0, 0.95 if abs(fz) > 0.5 else w))


# =============================================================== HALL DE ENTRADA (x −18…−10): onde a tentativa começa
room('hall', -18, -10, -5, 5, left_door=False)
box('hall_rug', (-14, 0.006, 0), (5, 0.012, 7), M['rug'])
# o RELÓGIO DE PÊNDULO parado nas 2:11
CX, CZ = -17.55, -3.2
box('clock_case', (CX, 1.1, CZ), (0.5, 2.2, 0.55), M['wood'])
box('clock_hood', (CX, 2.35, CZ), (0.6, 0.4, 0.62), M['wood'])
plane('DECAL_clock_face', (CX + 0.29, 2.32, CZ), (0.42, 0.42), M['clock'], rot_y=math.pi / 2)
box('clock_window', (CX + 0.28, 1.2, CZ), (0.02, 1.1, 0.3), M['black'])
cyl('clock_pendulum', (CX + 0.3, 0.75, CZ), 0.09, 0.02, M['brass'], seg=12, rot_z=math.pi / 2)
col_box('clock', (CX, 1.2, CZ), (0.6, 2.4, 0.6))
# escada que sobe para o escuro (decoração, não se sobe)
for k in range(8):
    box(f'hall_stair{k}', (-15.8 + k * 0.42, 0.11 + k * 0.22, 4.15), (0.42, 0.22 + k * 0.44, 1.5), M['wood'])
col_box('hall_stairs', (-14.3, 1.0, 4.15), (3.5, 2.0, 1.5))
box('hall_banister', (-14.3, 2.0, 3.35), (3.6, 0.08, 0.08), M['wood'], rot_z=-0.48)
for k, x in enumerate((-15.5, -12.8)):
    frame(f'hall_portrait{k}', (x, 1.9, -4.88), (0.9, 1.2))
box('hall_console', (-11.6, 0.42, -4.6), (1.4, 0.84, 0.5), M['wood'])
col_box('hall_console', (-11.6, 0.42, -4.6), (1.4, 0.84, 0.5))
candle('hall_console_candle', (-11.9, 0.85, -4.6))
box('hall_vase', (-11.2, 1.05, -4.6), (0.22, 0.42, 0.22), M['stone'])
chandelier('FLICKER_hall_chand', (-14, 2.4, 0))
# porta de entrada (fechada atrás de quem entrou)
box('hall_entry_door', (-17.9, 1.2, 0.5), (0.1, 2.4, 1.5), M['woodlt'])
sphere('hall_entry_knob', (-17.84, 1.1, 1.0), (0.03, 0.03, 0.03), M['brass'])

# =============================================================== CORREDOR A (x −10…−6)
corridor('corrA', -10, -6, 1.6)
wardrobe('corrA_wardrobe', (-8, 0, -1.25), 0.0, w=1.1, d=0.5, ajar=0.18)
sconce('corrA_sconce', (-8, 1.9, 1.67), math.pi)

# =============================================================== SALA DE ESTAR (x −6…6): 1º encontro
room('sala', -6, 6, -6, 6)
box('sala_rug', (0, 0.006, 0.4), (6.5, 0.012, 5), M['rug'])
# lareira no fundo, com fogo baixo
box('sala_fireplace', (0, 0.75, -5.65), (2.6, 1.5, 0.7), M['stone'])
box('sala_fireplace_hole', (0, 0.5, -5.29), (1.4, 0.9, 0.02), M['black'])
box('sala_mantel', (0, 1.55, -5.55), (2.9, 0.1, 0.9), M['wood'])
for k in range(5):
    sphere(f'FLICKER_sala_fire{k}', (-0.4 + k * 0.2, 0.15 + (k % 2) * 0.08, -5.45), (0.12, 0.2, 0.08), M['fire'], seg=6, rings=4)
col_box('sala_fireplace', (0, 0.8, -5.6), (2.9, 1.6, 0.9))
candle('sala_mantel_c1', (-1.1, 1.6, -5.55))
candle('sala_mantel_c2', (1.1, 1.6, -5.55))
frame('sala_portrait', (0, 2.45, -5.88), (1.1, 0.8))
sofa('sala_sofa', (0, 0, 2.6), math.pi, w=2.6)
armchair('sala_arm1', (-3.2, 0, 0.3), math.pi / 2)
armchair('sala_arm2', (3.2, 0, 0.3), -math.pi / 2, mat=M['velvet2'])
table('sala_coffee', (0, 0, 0.6), (1.4, 0.7), h=0.45)
candle('sala_coffee_candle', (0.3, 0.46, 0.6))
wardrobe('sala_wardrobe', (-5.3, 0, -4.4), math.pi / 2, w=1.2, d=0.6)
box('sala_cabinet', (5.55, 0.55, -3.8), (0.5, 1.1, 1.6), M['wood'])
col_box('sala_cabinet', (5.55, 0.55, -3.8), (0.5, 1.1, 1.6))
for k in range(4):
    box(f'sala_cab_book{k}', (5.5, 1.22 + 0.0, -4.3 + k * 0.28), (0.3, 0.24, 0.1), M['velvet'])
sconce('sala_sconce1', (-5.88, 1.9, 2.5), math.pi / 2)
sconce('sala_sconce2', (5.88, 1.9, 2.5), -math.pi / 2)
# um quadro torto e uma cadeira caída (algo passou aqui)
frame('sala_portrait2', (-5.88, 1.8, -1.2), (0.7, 0.9), math.pi / 2)
box('sala_fallen_chair', (2.3, 0.25, -3.0), (0.48, 0.5, 0.9), M['wood'], rot_y=0.6, rot_z=math.pi / 2)

# =============================================================== CORREDOR B (x 6…16): a fresta que observa (x 12, no fundo)
corridor('corrB', 6, 16, 1.8)
box('corrB_closet_frame', (12, 1.25, -2.0), (1.3, 2.5, 0.3), M['wood'])  # o armário embutido (a porta é do jogo)
box('corrB_closet_dark', (12, 1.2, -1.86), (1.0, 2.2, 0.02), M['black'])
table('corrB_side', (8.6, 0, 1.45), (0.9, 0.42))
candle('corrB_side_candle', (8.6, 0.79, 1.45))
frame('corrB_portrait', (14.6, 1.9, -1.88), (0.7, 0.9))
sconce('corrB_sconce', (10, 1.9, 1.87), math.pi)
# a goteira: mancha no chão
cyl('corrB_puddle', (13.6, 0.004, 0.6), 0.45, 0.008, M['water'], seg=16)

# =============================================================== BIBLIOTECA (x 16…30): 2º encontro
room('biblio', 16, 30, -6.5, 6.5)
for k, x in enumerate((18.2, 20.6, 23.0, 25.4, 27.8)):
    bookshelf(f'biblio_shelf_back{k}', (x, 0, -6.25), 0.0)
for k, z in enumerate((-4.2, 3.6)):
    bookshelf(f'biblio_shelf_L{k}', (16.25, 0, z), math.pi / 2, w=2.0)
    bookshelf(f'biblio_shelf_R{k}', (29.75, 0, z), -math.pi / 2, w=2.0)
table('biblio_table1', (21, 0, 0.3), (2.4, 1.1))
table('biblio_table2', (26.5, 0, 2.6), (1.2, 1.2), round_=True)
chair('biblio_chair1', (21, 0, 1.25), math.pi)
chair('biblio_chair2', (20.2, 0, -0.65), 0.0)
candle('biblio_t1_candle', (21.6, 0.79, 0.2))
for k in range(5):
    box(f'biblio_tbook{k}', (20.4 + k * 0.18, 0.8 + (k % 2) * 0.03, 0.4), (0.16, 0.05 + (k % 3) * 0.02, 0.24), M['velvet2' if k % 2 else 'velvet'], rot_y=random.uniform(-0.4, 0.4))
# globo e livros caídos
cyl('biblio_globe_stand', (24.2, 0, -3.6), 0.25, 0.9, M['wood'], seg=10, r_top=0.05)
sphere('biblio_globe', (24.2, 1.15, -3.6), (0.32, 0.32, 0.32), M['velvet2'], seg=14, rings=10)
col_cyl('biblio_globe', (24.2, 0, -3.6), 0.35, 1.4)
for k in range(9):
    box(f'biblio_floorbook{k}', (18 + random.uniform(-0.6, 0.6), 0.03 + k * 0.0, 4.2 + random.uniform(-0.6, 0.6)), (0.22, 0.05, 0.3), M['velvet' if k % 2 else 'wood'], rot_y=random.uniform(0, TAU))
chandelier('FLICKER_biblio_chand', (23, 2.4, 0), n=8, r=0.7)
armchair('biblio_arm', (27.6, 0, -1.4), -math.pi / 2 - 0.4, mat=M['velvet2'])
wardrobe('biblio_wardrobe', (17.0, 0, 5.85), math.pi, w=1.2, d=0.6)

# =============================================================== CORREDOR C (x 30…38)
corridor('corrC', 30, 38, 1.8)
for k, x in enumerate((32, 35.6)):
    frame(f'corrC_portrait{k}', (x, 1.9, -1.88), (0.7, 0.9))
sconce('corrC_sconce', (34, 1.9, 1.87), math.pi)
wardrobe('corrC_wardrobe', (36.4, 0, 1.45), math.pi, w=1.1, d=0.5, ajar=0.3)

# =============================================================== QUARTO PRINCIPAL (x 38…62): a luta contra o Espreitador
room('quarto', 38, 62, -10.5, 10.5, door=1.25)
box('quarto_rug', (50, 0.006, 0), (10, 0.012, 7), M['rug'])
# a cama de dossel no fundo, entre os armários (os 4 armários são do jogo: x 44 e 56 no fundo; um em cada lateral)
BX, BZ = 50, -8.6
box('quarto_bed', (BX, 0.35, BZ), (2.4, 0.5, 2.6), M['wood'])
box('quarto_mattress', (BX, 0.68, BZ + 0.05), (2.2, 0.22, 2.4), M['linen'])
box('quarto_pillow', (BX, 0.86, BZ - 0.95), (1.8, 0.16, 0.4), M['linen'])
box('quarto_blanket', (BX, 0.8, BZ + 0.45), (2.3, 0.08, 1.5), M['velvet'])
for sx in (-1, 1):
    for sz in (-1, 1):
        cyl(f'quarto_post{sx}{sz}', (BX + sx * 1.15, 0, BZ + sz * 1.25), 0.06, 2.6, M['wood'], seg=8)
box('quarto_canopy', (BX, 2.62, BZ), (2.5, 0.08, 2.7), M['velvet'])
box('quarto_curtain', (BX, 1.6, BZ - 1.3), (2.4, 2.0, 0.03), M['velvet'])
col_box('quarto_bed', (BX, 0.5, BZ), (2.5, 1.0, 2.7))
# janelas com a lua (a única luz fria)
for k, x in enumerate((41.2, 58.8)):
    box(f'quarto_window{k}', (x, 1.9, -10.42), (1.4, 1.8, 0.04), M['moon'])
    box(f'quarto_wframe{k}', (x, 1.9, -10.38), (1.55, 0.08, 0.06), M['wood'])
    box(f'quarto_wframev{k}', (x, 1.9, -10.38), (0.08, 1.9, 0.06), M['wood'])
# cômoda com espelho, mesas de cabeceira
box('quarto_dresser', (61.5, 0.5, 6.5), (0.7, 1.0, 2.0), M['wood'])
col_box('quarto_dresser', (61.5, 0.5, 6.5), (0.7, 1.0, 2.0))
box('quarto_mirror', (61.8, 1.8, 6.5), (0.05, 1.2, 0.9), M['glass'])
for s in (-1, 1):
    box(f'quarto_nightstand{s}', (BX + s * 1.75, 0.3, BZ - 0.9), (0.55, 0.6, 0.5), M['wood'])
    col_box(f'quarto_nightstand{s}', (BX + s * 1.75, 0.3, BZ - 0.9), (0.55, 0.6, 0.5))
    candle(f'quarto_ns_candle{s}', (BX + s * 1.75, 0.61, BZ - 0.9))
armchair('quarto_arm', (40.4, 0, 7.6), math.pi * 0.75)
table('quarto_table', (42.0, 0, 8.6), (0.8, 0.8), round_=True, h=0.7)
candle('quarto_t_candle', (42.0, 0.71, 8.6))
# a goteira do teto: a poça grande no meio do quarto
cyl('quarto_puddle', (49, 0.004, 1.5), 1.1, 0.008, M['water'], seg=20)
cyl('quarto_puddle2', (50.3, 0.004, 2.3), 0.6, 0.008, M['water'], seg=16)
chandelier('FLICKER_quarto_chand1', (45, 2.5, 0))
chandelier('FLICKER_quarto_chand2', (55, 2.5, 0))
sconce('quarto_sconce1', (38.12, 1.9, 6.0), math.pi / 2)
sconce('quarto_sconce2', (61.88, 1.9, -7.5), -math.pi / 2)
frame('quarto_portrait', (38.12, 1.9, 2.5), (1.0, 1.3), math.pi / 2)

# =============================================================== CORREDOR DE SAÍDA (x 62…76): a passagem escura
corridor('corrD', 62, 76, 1.5)
wall('corrD_end', 76.1, 76.1, -1.6, 1.6)
box('corrD_endglow', (75.95, 1.4, 0), (0.04, 2.4, 1.6), M['moon'])  # a luz lá no fim
for k, x in enumerate((66, 71)):
    sconce(f'corrD_sconce{k}', (x, 1.9, -1.57), 0.0)

finalize(OUT)
