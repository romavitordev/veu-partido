"""
ESCOLA NOSTRADAMUS DE ENSINO MÉDIO — public/arenas/escola.glb (OUTRO LADO: a 2ª dungeon, o território da Degolificada)
Pedido do dono (2026-11-06): uma escola, a Escola Nostradamus, com corredor e salas de aula.
Cânone (wiki "Escola Nostradamus de Ensino Médio", A Ordem Paranormal): antigo MOSTEIRO virado escola particular em São
Paulo; o INCÊNDIO (a bomba no LABORATÓRIO na noite de 29 de fevereiro); a SALA DE ARQUIVOS (onde a equipe achou a ficha do
Gabriel); a BIBLIOTECA (onde a Degolificada atacou) e a passagem secreta para o BUNKER escondido (wiki "Gabriel Opspor": a
maior sala do bunker, o livro aberto no Ritual de Passagem, os restos mortais queimados — a luta final de Iniciação); os professores
de História (Alexsander Kothe), Matemática (Matias Dennis) e Geografia (Olavo Costa); o bombeiro Jorge morto no corredor.
PROPOSTA (não descrito na wiki): a disposição das salas, os móveis, o corredor dos fundos e as cores.

Cada sala é um MÓDULO solto (como as salas soltas da Mansão): o jogo leva o jogador de uma para a outra pelas portas
(src/pve/Dungeon.js; as portas, as gavetas e a porta de saída são do jogo). Sem teto: a câmera passa por cima das paredes,
que ficam transparentes quando tampam a luta (OCC_). Coordenadas iguais às de src/pve/dungeons.js (DUNGEONS.degolificada).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'escola.glb'
random.seed(229)  # 29/02
start()

M = {
    'wall': material('wall_escola', '#7c8a70', 0.9),
    'wall_lab': material('wall_escola_queimada', '#3a3632', 0.95),
    'floor': material('floor_escola', '#6a645a', 0.6),
    'tile': material('tile_white', '#c8c8c0', 0.4),
    'wood': material('wood_escola', '#6a4a30', 0.7),
    'woodlt': material('wood_light_escola', '#9a7a52', 0.65),
    'metal': material('locker_escola', '#3e5a6a', 0.5, metal=0.4),
    'steel': material('steel_escola', '#6a6e72', 0.4, metal=0.7),
    'board': material('chalkboard', '#1e3a2a', 0.8),
    'chalk': material('chalk_escola', '#e0e0d8', 0.9),
    'black': material('void_escola', '#050405', 1.0),
    'soot': material('soot_escola', '#121010', 1.0),
    'lamp': material('lamp_escola', '#e8f0ff', 0.3, emission='#d8e8ff', strength=4),
    'exit': material('exit_sign_escola', '#20a050', 0.4, emission='#30ff70', strength=3),
    'moon': material('moon_window_escola', '#4a5a8a', 0.2, emission='#6a80c0', strength=1.5),
    'glass': material('glass_escola', '#8a9aa0', 0.05, metal=0.8),
    'paper': material('paper_escola', '#d8d0bc', 0.9),
    'books': material('books_mansao', '#2a1a10', 0.9),
    'blood': material('blood_escola', '#4a0a0e', 0.3),
    'fire': material('fire_escola', '#ff6a20', 0.4, emission='#ff5a10', strength=6),
    'ember': material('ember_escola', '#a03010', 0.6, emission='#ff4010', strength=1.6),
    'green': material('felt_green', '#2a5a3a', 1.0),
    'map': material('map_escola', '#5a7a8a', 0.8),
    'red': material('red_escola', '#7a1a1a', 0.8),
    'stone': material('stone_trim', '#8a8478', 0.85),
    'concrete': material('concrete_floor', '#5a5a56', 0.9),
    'bunker': material('wall_bunker', '#4e4e4a', 0.95),
    'rust': material('rust_bunker', '#5a3a26', 0.7, metal=0.5),
    'shroud': material('shroud_bunker', '#7a7262', 1.0),
    'bulb': material('bulb_bunker', '#ffd8a0', 0.3, emission='#ffc880', strength=5),
}

HH = 3.2   # altura das paredes
T = 0.22   # espessura


def wall(name, x0, x1, z0, z1, mat=None):
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    w = max(abs(x1 - x0), T)
    d = max(abs(z1 - z0), T)
    box(f'OCC_{name}', (cx, HH / 2, cz), (w, HH, d), mat or M['wall'])
    # o rodapé de azulejo (a parede de escola: a barra de baixo mais escura e lavável)
    box(f'OCC_{name}_barra', (cx, 0.6, cz), (w + 0.04 if w > d else w, 1.2, d + 0.04 if d > w else d), M['metal'] if mat is None else mat)
    col_box(name, (cx, HH / 2, cz), (w, HH, d))


def closed_room(name, x0, x1, z0, z1, floor='floor', wmat=None, gaps=()):
    """sala fechada; gaps = vãos nas paredes laterais: (lado 'L'|'R', meia largura) centrados em z=0 (a biblioteca)"""
    box(f'FLOOR_{name}', ((x0 + x1) / 2, -0.05, (z0 + z1) / 2), (x1 - x0, 0.1, z1 - z0), M[floor])
    wall(f'{name}_back', x0 - T / 2, x1 + T / 2, z0 - T / 2, z0 - T / 2, wmat)
    wall(f'{name}_front', x0 - T / 2, x1 + T / 2, z1 + T / 2, z1 + T / 2, wmat)
    g = dict(gaps)
    for side, x in (('L', x0 - T / 2), ('R', x1 + T / 2)):
        if side in g:
            h = g[side]
            wall(f'{name}_{side}a', x, x, z0, -h, wmat)
            wall(f'{name}_{side}b', x, x, h, z1, wmat)
            box(f'{name}_{side}lintel', (x, HH - 0.25, 0), (T + 0.06, 0.5, h * 2), M['wood'])
        else:
            wall(f'{name}_{side}', x, x, z0, z1, wmat)


def lamp(name, x, z, flicker=False, w=1.3):
    """a luminária fluorescente pendurada (sem teto: presa por dois fios no escuro)"""
    box(f'{name}_housing', (x, 2.95, z), (w + 0.1, 0.06, 0.32), M['steel'])
    box(f'{"FLICKER_" if flicker else ""}{name}_tube', (x, 2.9, z), (w, 0.05, 0.12), M['lamp'])
    for s in (-1, 1):
        cyl(f'{name}_wire{s}', (x + s * w * 0.4, 2.98, z), 0.006, 0.3, M['steel'], seg=4)


def window(name, x, z, rot_y=0.0, w=1.5):
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    box(f'{name}_glass', (x, 1.95, z), (w, 1.4, 0.04), M['moon'], rot_y=rot_y)
    box(f'{name}_sill', (x + fx * 0.08, 1.22, z + fz * 0.08), (w + 0.15, 0.06, 0.18), M['stone'], rot_y=rot_y)
    box(f'{name}_mullion', (x + fx * 0.03, 1.95, z + fz * 0.03), (0.06, 1.45, 0.05), M['steel'], rot_y=rot_y)
    box(f'{name}_transom', (x + fx * 0.03, 2.2, z + fz * 0.03), (w, 0.05, 0.05), M['steel'], rot_y=rot_y)


def desk(name, x, z, rot_y=math.pi / 2, fallen=False):
    """a CARTEIRA escolar: tampo de madeira clara, estrutura de metal e a cadeira junto (rot_y = para onde o aluno olha)"""
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    if fallen:
        box(f'{name}_top', (x, 0.3, z), (0.62, 0.04, 0.48), M['woodlt'], rot_y=rot_y + 0.6, rot_z=1.2)
        box(f'{name}_frame', (x - 0.2, 0.2, z + 0.1), (0.5, 0.04, 0.4), M['steel'], rot_y=rot_y + 0.6, rot_z=1.2)
        box(f'{name}_seat', (x + fx * 0.7, 0.1, z + fz * 0.7), (0.42, 0.04, 0.42), M['woodlt'], rot_y=rot_y - 0.4, rot_z=1.5)
        col_box(name, (x, 0.35, z), (0.7, 0.7, 0.7))
        return
    box(f'{name}_top', (x, 0.74, z), (0.62, 0.04, 0.48), M['woodlt'], rot_y=rot_y)
    rx, rz = math.cos(rot_y), -math.sin(rot_y)
    for s in (-1, 1):
        for t in (-1, 1):
            cyl(f'{name}_leg{s}{t}', (x + rx * s * 0.26 + fx * t * 0.18, 0, z + rz * s * 0.26 + fz * t * 0.18), 0.015, 0.72, M['steel'], seg=5)
    box(f'{name}_shelf', (x, 0.6, z), (0.56, 0.02, 0.4), M['steel'], rot_y=rot_y)
    # a cadeira atrás (de onde o aluno olha)
    cx, cz = x - fx * 0.52, z - fz * 0.52
    box(f'{name}_seat', (cx, 0.44, cz), (0.4, 0.04, 0.4), M['woodlt'], rot_y=rot_y)
    box(f'{name}_back', (cx - fx * 0.2, 0.7, cz - fz * 0.2), (0.4, 0.3, 0.03), M['woodlt'], rot_y=rot_y)
    for s in (-1, 1):
        for t in (-1, 1):
            cyl(f'{name}_cleg{s}{t}', (cx + rx * s * 0.17 + fx * t * 0.17, 0, cz + rz * s * 0.17 + fz * t * 0.17), 0.012, 0.43, M['steel'], seg=5)
    col_box(name, (x - fx * 0.25, 0.4, z - fz * 0.25), (0.7 if abs(fx) < 0.5 else 1.2, 0.8, 1.2 if abs(fx) < 0.5 else 0.7))


def teacher_desk(name, x, z, rot_y=math.pi / 2):
    box(f'{name}_top', (x, 0.78, z), (0.8, 0.05, 1.5), M['wood'], rot_y=rot_y - math.pi / 2)
    box(f'{name}_body', (x, 0.38, z), (0.74, 0.76, 1.44), M['wood'], rot_y=rot_y - math.pi / 2)
    col_box(name, (x, 0.4, z), (0.8, 0.8, 1.5) if abs(math.sin(rot_y)) > 0.5 else (1.5, 0.8, 0.8))


def chalkboard(name, x, z, rot_y, w=3.2, text=None):
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    box(f'{name}_frame', (x, 1.7, z), (w + 0.14, 1.34, 0.05), M['wood'], rot_y=rot_y)
    plane(f'DECAL_{name}', (x + fx * 0.03, 1.7, z + fz * 0.03), (w, 1.2), M['board'], rot_y=rot_y)
    box(f'{name}_tray', (x + fx * 0.07, 1.06, z + fz * 0.07), (w, 0.03, 0.08), M['wood'], rot_y=rot_y)
    for k in range(3):
        box(f'{name}_chalk{k}', (x + fx * 0.08 + math.cos(rot_y) * (k * 0.12 - 0.8), 1.09, z + fz * 0.08 - math.sin(rot_y) * (k * 0.12 - 0.8)), (0.07, 0.015, 0.015), M['chalk'], rot_y=rot_y + 0.2 * k)


def locker_row(name, x0, x1, z, rot_y, skip=()):
    """os ARMÁRIOS de aço (escaninhos) de x0 a x1 encostados na parede; skip = trechos (a, b) sem armário (as portas)"""
    n = int((x1 - x0) / 0.42)
    for i in range(n):
        x = x0 + 0.21 + i * 0.42
        if any(a <= x <= b for a, b in skip):
            continue
        box(f'{name}_{i}', (x, 0.95, z), (0.4, 1.9, 0.45), M['metal'], rot_y=rot_y)
        fz = math.cos(rot_y)
        for k in range(3):
            box(f'{name}_{i}_vent{k}', (x, 1.6 + k * 0.05, z + fz * 0.228), (0.24, 0.015, 0.01), M['black'], rot_y=rot_y)
        if random.random() < 0.12:  # uma porta entreaberta
            box(f'{name}_{i}_open', (x + 0.16, 0.95, z + fz * 0.36), (0.02, 1.8, 0.38), M['metal'], rot_y=rot_y + 0.9)
    # a colisão em blocos contínuos entre os vãos
    segs = []
    cur = x0
    for a, b in sorted(skip) + [(x1, x1)]:
        if a > cur:
            segs.append((cur, a))
        cur = max(cur, b)
    for k, (a, b) in enumerate(segs):
        col_box(f'{name}_col{k}', ((a + b) / 2, 0.95, z), (b - a, 1.9, 0.45))


def bookshelf(name, pos, rot_y=0.0, w=2.2, h=2.6, d=0.42):
    x, _, z = pos
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    box(f'{name}_case', (x, h / 2, z), (w, h, d), M['wood'], rot_y=rot_y)
    box(f'{name}_books', (x + fx * (d / 2 + 0.005), h / 2 + 0.05, z + fz * (d / 2 + 0.005)), (w - 0.14, h - 0.3, 0.01), M['books'], rot_y=rot_y)
    col_box(name, (x, h / 2, z), (w if abs(fz) > 0.5 else d, h, d if abs(fz) > 0.5 else w))


def double_shelf(name, x, z, length=4.0, h=2.3):
    """estante de dois lados no meio da biblioteca (corredores de livros), comprida em x"""
    box(f'{name}_case', (x, h / 2, z), (length, h, 0.7), M['wood'])
    for s in (-1, 1):
        box(f'{name}_books{s}', (x, h / 2 + 0.04, z + s * 0.355), (length - 0.14, h - 0.28, 0.01), M['books'])
    col_box(name, (x, h / 2, z), (length, h, 0.7))


def scatter_papers(name, cx, cz, n, spread):
    for k in range(n):
        box(f'{name}{k}', (cx + random.uniform(-spread, spread), 0.004 + k * 0.0004, cz + random.uniform(-spread, spread)), (0.21, 0.004, 0.29), M['paper'], rot_y=random.uniform(0, TAU))


def classroom(name, x0, z0, subject):
    """sala de aula 12 × 10: porta de entrada no oeste (z0+2,5), quadro no oeste, carteiras em dois blocos (norte e sul)
    com o meio livre para a luta; saídas do jogo: norte (x0+6,6), leste (z0+5) e sul (x0+5,4)"""
    x1, z1 = x0 + 12, z0 + 10
    closed_room(name, x0, x1, z0, z1)
    chalkboard(f'{name}_board', x0 + 0.13, z0 + 6.8, math.pi / 2)
    teacher_desk(f'{name}_tdesk', x0 + 1.7, z0 + 6.8)
    # as carteiras olhando para o quadro (−x): dois blocos, o meio (z0+3,8…6,2) livre
    rows_n = (z0 + 1.4, z0 + 2.7)
    rows_s = (z1 - 1.4, z1 - 2.7)
    k = 0
    for zs, door_x in ((rows_n, x0 + 6.6), (rows_s, x0 + 5.4)):
        for z in zs:
            for x in (x0 + 4.2, x0 + 5.6, x0 + 7.6, x0 + 9.0, x0 + 10.4):
                if abs(x - door_x) < 1.0 and (z == zs[0]):
                    continue
                fallen = random.random() < 0.18
                desk(f'{name}_desk{k}', x, z, -math.pi / 2, fallen=fallen)
                k += 1
    for i, x in enumerate((x0 + 3.0, x0 + 9.6)):
        window(f'{name}_win{i}', x, z0 + 0.13, 0.0)
    lamp(f'{name}_lamp1', x0 + 4, z0 + 5, flicker=True)
    lamp(f'{name}_lamp2', x0 + 8.5, z0 + 5)
    # o relógio de parede parado e a lixeira
    cyl(f'{name}_clock', (x1 - 0.13, 2.5, z0 + 7.5), 0.22, 0.04, M['paper'], seg=16, rot_z=math.pi / 2)
    cyl(f'{name}_bin', (x0 + 0.5, 0, z1 - 0.5), 0.18, 0.42, M['steel'], seg=10, r_top=0.21)
    col_cyl(f'{name}_bin', (x0 + 0.5, 0, z1 - 0.5), 0.22, 0.45)
    scatter_papers(f'{name}_paper', x0 + 7, z0 + 5, 7, 2.2)
    # o que é de cada matéria
    if subject == 'historia':
        # Alexsander Kothe (o professor de História): a linha do tempo e os mapas antigos na parede leste
        plane(f'DECAL_{name}_timeline', (x1 - 0.13, 1.8, z0 + 2.6), (3.0, 0.6), M['paper'], rot_y=-math.pi / 2)
        for j in range(6):
            box(f'{name}_tl{j}', (x1 - 0.14, 1.8, z0 + 1.4 + j * 0.48), (0.01, 0.4, 0.04), M['red'])
        plane(f'DECAL_{name}_oldmap', (x1 - 0.13, 1.7, z0 + 8.3), (1.4, 1.0), M['map'], rot_y=-math.pi / 2)
        box(f'{name}_bust', (x0 + 1.7, 1.0, z0 + 7.3), (0.18, 0.4, 0.18), M['stone'])
    elif subject == 'matematica':
        # Matias Dennis (Matemática): o esquadro e o compasso gigantes; a régua no chão
        box(f'{name}_ruler', (x0 + 0.2, 2.45, z0 + 6.8), (0.03, 0.06, 2.0), M['woodlt'])
        box(f'{name}_square', (x0 + 0.2, 2.1, z0 + 8.6), (0.03, 0.6, 0.06), M['woodlt'], rot_x=0.6)
        box(f'{name}_ruler_floor', (x0 + 6.0, 0.01, z0 + 4.8), (1.0, 0.02, 0.06), M['woodlt'], rot_y=0.7)
        for j in range(4):
            box(f'{name}_formula{j}', (x0 + 0.17, 1.95 - j * 0.22, z0 + 6.3 + (j % 2) * 0.4), (0.005, 0.03, 0.9 - j * 0.12), M['chalk'])
    elif subject == 'geografia':
        # Olavo Costa (Geografia): o globo e o mapa-múndi
        cyl(f'{name}_globe_stand', (x0 + 1.7, 0.8, z0 + 6.2), 0.08, 0.18, M['steel'], seg=8)
        sphere(f'{name}_globe', (x0 + 1.7, 1.2, z0 + 6.2), (0.22, 0.22, 0.22), M['map'], seg=14, rings=10)
        plane(f'DECAL_{name}_worldmap', (x1 - 0.13, 1.7, z0 + 2.6), (2.6, 1.4), M['map'], rot_y=-math.pi / 2)
        box(f'{name}_rocks', (x1 - 0.5, 0.9, z0 + 8.4), (0.4, 1.8, 1.2), M['wood'])
        col_box(f'{name}_rocks', (x1 - 0.5, 0.9, z0 + 8.4), (0.4, 1.8, 1.2))


# =============================================================== O CORREDOR (x −22…0): onde a tentativa começa
# LARGO como corredor de escola (pedido do dono, 2026-11-08: "muito apertados"): 9 m de parede a parede (antes 5)
closed_room('corredor', -22, 0, -4.5, 4.5)
# a porta principal (a entrada do antigo mosteiro), fechada atrás de quem entrou
box('corredor_main_door', (-21.9, 1.3, 0), (0.1, 2.6, 3.2), M['wood'])
box('corredor_main_arch', (-21.92, 2.75, 0), (0.12, 0.3, 3.5), M['stone'])
# os armários de aço dos dois lados (os vãos: as portas do jogo em x −8 no norte e −14 no sul, e as gavetas)
locker_row('corredor_lockN', -21.5, -0.5, -4.27, 0.0, skip=((-9.0, -7.0), (-11.4, -10.6)))
locker_row('corredor_lockS', -21.5, -0.5, 4.27, math.pi, skip=((-15.0, -13.0), (-6.4, -5.6)))
for i, x in enumerate((-19, -12.5, -5)):
    lamp(f'corredor_lamp{i}', x, -1.6, flicker=(i == 1))
    lamp(f'corredor_lampS{i}', x, 1.6)
# o quadro de avisos, o extintor e a placa de SAÍDA (verde)
plane('DECAL_corredor_avisos', (-17.0, 2.35, -4.02), (1.4, 0.5), M['paper'])
cyl('corredor_extintor', (-3.2, 0.35, 4.0), 0.08, 0.5, M['red'], seg=10)
box('corredor_exitsign', (-21.8, 2.95, 0), (0.06, 0.18, 0.5), M['exit'])
# o INCÊNDIO passou por aqui: a fuligem nas paredes e no chão, e o sangue onde o bombeiro (Jorge) caiu
for k in range(6):
    box(f'corredor_soot{k}', (-3.5 + random.uniform(-2.5, 1.5), 1.4 + random.uniform(0, 1.2), -4.03 if k % 2 else 4.03), (random.uniform(0.8, 1.8), random.uniform(0.6, 1.4), 0.01), M['soot'])
cyl('corredor_scorch', (-2.4, 0.004, 0.4), 1.4, 0.008, M['soot'], seg=18)
cyl('corredor_blood', (-10.6, 0.005, 0.6), 0.7, 0.008, M['blood'], seg=16)
cyl('corredor_blood2', (-10.0, 0.005, 1.1), 0.35, 0.008, M['blood'], seg=12)
box('corredor_tape', (-10.3, 0.006, 0.8), (2.2, 0.004, 1.8), M['chalk'])  # a marcação da perícia
box('corredor_tape_in', (-10.3, 0.0065, 0.8), (2.1, 0.004, 1.7), M['floor'])
box('corredor_bench', (-16.5, 0.22, 3.9), (1.6, 0.44, 0.36), M['wood'])
col_box('corredor_bench', (-16.5, 0.22, 3.9), (1.6, 0.44, 0.4))

# =============================================================== AS SALAS DE AULA
classroom('historia', 0, 30, 'historia')
classroom('matematica', 20, 30, 'matematica')
classroom('geografia', 40, 30, 'geografia')

# =============================================================== O LABORATÓRIO (x 0…12, z 50…60): onde a bomba explodiu
closed_room('lab', 0, 12, 50, 60, floor='tile', wmat=M['wall_lab'])
for i, z in enumerate((52.2, 57.8)):
    box(f'lab_bench{i}', (6.5, 0.45, z), (6.0, 0.9, 1.0), M['stone'])
    box(f'lab_bench_top{i}', (6.5, 0.92, z), (6.1, 0.05, 1.08), M['black'])
    col_box(f'lab_bench{i}', (6.5, 0.45, z), (6.0, 0.9, 1.0))
    for j in range(3):
        box(f'lab_sink{i}{j}', (4.3 + j * 2.2, 0.95, z), (0.4, 0.02, 0.3), M['steel'])
        cyl(f'lab_tap{i}{j}', (4.3 + j * 2.2, 0.95, z - 0.2), 0.012, 0.3, M['steel'], seg=6)
# a explosão: o chão queimado, a bancada partida, o vidro e as brasas
cyl('lab_crater', (7.5, 0.004, 55.0), 2.2, 0.008, M['soot'], seg=22)
for k in range(8):
    box(f'lab_debris{k}', (7.5 + random.uniform(-2, 2), 0.08, 55 + random.uniform(-1.6, 1.6)), (random.uniform(0.2, 0.6), 0.12, random.uniform(0.1, 0.4)), M['black' if k % 2 else 'stone'], rot_y=random.uniform(0, TAU))
for k in range(14):
    box(f'lab_glass{k}', (7.5 + random.uniform(-3, 3), 0.01, 55 + random.uniform(-2.5, 2.5)), (0.08, 0.005, 0.05), M['glass'], rot_y=random.uniform(0, TAU))
for k in range(5):
    sphere(f'FLICKER_lab_ember{k}', (5.6 + k * 0.9, 0.06, 54.4 + (k % 2) * 1.2), (0.12, 0.05, 0.1), M['ember'], seg=6, rings=4)
for k in range(4):
    sphere(f'FLICKER_lab_fire{k}', (11.3, 0.25 + (k % 2) * 0.15, 52.4 + k * 0.2), (0.12, 0.25, 0.08), M['fire'], seg=6, rings=4)
box('lab_cabinet', (11.65, 1.1, 52.6), (0.5, 2.2, 1.6), M['wood'])
box('lab_cabinet_glass', (11.39, 1.3, 52.6), (0.02, 1.4, 1.4), M['glass'])
col_box('lab_cabinet', (11.65, 1.1, 52.6), (0.5, 2.2, 1.6))
for k in range(6):
    cyl(f'lab_flask{k}', (11.5, 1.4 + (k // 3) * 0.5, 52.0 + (k % 3) * 0.5), 0.05, 0.18, M['glass'], seg=8, r_top=0.02)
box('lab_skeleton_stand', (0.6, 0.9, 58.6), (0.3, 1.8, 0.3), M['steel'])
sphere('lab_skull', (0.6, 1.9, 58.6), (0.11, 0.13, 0.12), M['paper'], seg=10, rings=8)
col_box('lab_skeleton', (0.6, 0.9, 58.6), (0.4, 1.8, 0.4))
for k in range(5):
    box(f'lab_soot{k}', (random.uniform(1, 11), 1.6 + random.uniform(0, 1), 50.03 if k % 2 else 59.97), (random.uniform(1, 2.5), random.uniform(0.8, 1.6), 0.01), M['soot'])
window('lab_win', 3.0, 50.13, 0.0)
chalkboard('lab_board', 0.13, 56.8, math.pi / 2, w=2.4)
lamp('lab_lamp', 5, 55, flicker=True)

# =============================================================== A SALA DE ARQUIVOS (x 20…30, z 50…58): as fichas dos alunos
closed_room('arquivos', 20, 30, 50, 58)
for i in range(6):  # os arquivos de aço encostados na parede norte (o vão da porta do jogo em x 25,5)
    x = 21.0 + i * 0.75 + (1.5 if i >= 4 else 0)
    if abs(x - 25.5) < 0.9:
        continue
    box(f'arq_cab{i}', (x, 0.7, 50.45), (0.7, 1.4, 0.65), M['steel'])
    for k in range(4):
        box(f'arq_cab{i}_d{k}', (x, 0.2 + k * 0.34, 50.79), (0.6, 0.28, 0.02), M['metal'])
    col_box(f'arq_cab{i}', (x, 0.7, 50.45), (0.7, 1.4, 0.65))
for i in range(4):
    x = 21.3 + i * 0.75 + (2.4 if i >= 2 else 0)
    box(f'arq_shelf{i}', (x, 1.1, 57.6), (0.7, 2.2, 0.5), M['steel'])
    for k in range(4):
        box(f'arq_box{i}{k}', (x, 0.35 + k * 0.5, 57.55), (0.6, 0.3, 0.4), M['paper'])
    col_box(f'arq_shelf{i}', (x, 1.1, 57.6), (0.7, 2.2, 0.5))
box('arq_desk', (22.5, 0.38, 54.0), (1.4, 0.76, 0.8), M['wood'])
col_box('arq_desk', (22.5, 0.38, 54.0), (1.4, 0.76, 0.8))
cyl('arq_desklamp', (22.1, 0.76, 53.8), 0.08, 0.35, M['steel'], seg=8, r_top=0.12)
scatter_papers('arq_paper', 25.5, 54.2, 18, 2.4)
for k in range(5):  # caixas de papel caídas
    box(f'arq_floorbox{k}', (27.5 + random.uniform(-1, 1), 0.15, 54 + random.uniform(-2, 2)), (0.5, 0.3, 0.38), M['paper'], rot_y=random.uniform(0, 1.5))
lamp('arq_lamp', 25, 54, flicker=True, w=1.0)

# =============================================================== O CORREDOR DOS FUNDOS (x 40…56, z 50,5…57,5) — PROPOSTA
# largo (2026-11-08): 7 m (antes 4)
closed_room('fundos', 40, 56, 50.5, 57.5)
locker_row('fundos_lockN', 40.5, 55.5, 50.77, 0.0, skip=((47.0, 49.0),))
locker_row('fundos_lockS', 40.5, 55.5, 57.23, math.pi, skip=((43.0, 45.0), (50.6, 51.4)))
box('fundos_fountain', (53.0, 0.5, 57.1), (0.5, 1.0, 0.35), M['steel'])
box('fundos_exitsign', (55.8, 2.9, 54), (0.06, 0.18, 0.5), M['exit'])
for i, x in enumerate((43, 51)):
    lamp(f'fundos_lamp{i}', x, 54, flicker=(i == 0))
cyl('fundos_blood', (49.5, 0.005, 54.4), 0.5, 0.008, M['blood'], seg=14)
for k in range(5):  # o rastro arrastado
    box(f'fundos_drag{k}', (49.9 + k * 0.45, 0.005, 54.5 - k * 0.05), (0.4, 0.004, 0.12), M['blood'], rot_y=0.1)

# =============================================================== A BIBLIOTECA (x 38…62): onde ela atacou; a passagem secreta
closed_room('biblio', 38, 62, -10.5, 10.5, gaps=(('L', 1.25), ('R', 1.25)))
# as estantes nas paredes (sem tapar a porta de entrada nem a de saída)
for k, x in enumerate((41.5, 44.2, 46.9, 53.1, 55.8, 58.5)):
    bookshelf(f'biblio_back{k}', (x, 0, -10.25), 0.0, w=2.5)
    bookshelf(f'biblio_front{k}', (x, 0, 10.25), math.pi, w=2.5)
for k, z in enumerate((-7.5, -4.5, 4.5, 7.5)):
    bookshelf(f'biblio_L{k}', (38.25, 0, z), math.pi / 2, w=2.4)
# os corredores de livros (estantes duplas) nos dois lados, o meio livre para a luta
for k, (x, z) in enumerate(((43.5, -6.0), (43.5, 6.0), (56.5, -6.0), (56.5, 6.0))):
    double_shelf(f'biblio_row{k}', x, z, length=3.6)
# o balcão de empréstimos (a Agatha trabalhava na biblioteca) e o fichário (as gavetas são do jogo)
box('biblio_counter', (40.6, 0.55, -2.8), (0.7, 1.1, 2.4), M['wood'])
box('biblio_counter_top', (40.6, 1.12, -2.8), (0.8, 0.05, 2.5), M['woodlt'])
col_box('biblio_counter', (40.6, 0.55, -2.8), (0.8, 1.1, 2.5))
box('biblio_catalog', (50.0, 0.6, -9.6), (1.6, 1.2, 0.6), M['wood'])
col_box('biblio_catalog', (50.0, 0.6, -9.6), (1.6, 1.2, 0.6))
for i in range(3):
    for j in range(4):
        box(f'biblio_catalog_d{i}{j}', (49.4 + j * 0.4, 0.3 + i * 0.32, -9.29), (0.32, 0.22, 0.02), M['woodlt'])
# mesas de leitura
for k, (x, z) in enumerate(((47.0, 2.6), (53.0, 2.6))):
    box(f'biblio_table{k}', (x, 0.76, z), (2.2, 0.06, 1.0), M['wood'])
    for sx in (-1, 1):
        for sz in (-1, 1):
            box(f'biblio_tleg{k}{sx}{sz}', (x + sx * 1.0, 0.37, z + sz * 0.42), (0.07, 0.74, 0.07), M['wood'])
    col_box(f'biblio_table{k}', (x, 0.4, z), (2.2, 0.8, 1.0))
    cyl(f'biblio_tlamp{k}', (x, 0.79, z), 0.06, 0.3, M['green'], seg=8, r_top=0.12)
# livros caídos, papéis e a névoa (a névoa é do jogo)
for k in range(16):
    box(f'biblio_floorbook{k}', (50 + random.uniform(-7, 7), 0.03, random.uniform(-4, 4)), (0.22, 0.05, 0.3), M['red' if k % 3 == 0 else 'books' if k % 3 == 1 else 'wood'], rot_y=random.uniform(0, TAU))
scatter_papers('biblio_paper', 50, 0, 12, 4.0)
for i, x in enumerate((44, 50, 56)):
    for j, z in enumerate((-4, 4)):
        lamp(f'biblio_lamp{i}{j}', x, z, flicker=(i + j) % 2 == 0)
# a VITRAL do antigo mosteiro no fundo (a única luz fria)
box('biblio_stained', (61.9, 2.2, -6.5), (0.04, 1.6, 0.9), M['moon'])
box('biblio_stained2', (61.9, 2.2, 6.5), (0.04, 1.6, 0.9), M['moon'])

# =============================================================== A PASSAGEM SECRETA (x 62…70): a estante arrastada
# cânone ("Gabriel Opspor"): a Agatha conhecia uma passagem muito suspeita na biblioteca, que leva ao BUNKER escondido
bookshelf('biblio_secret_shelf', (61.4, 0, 2.6), -math.pi / 2 + 0.35, w=2.0)  # a estante que tampava, arrastada
box('FLOOR_passagem', (66, -0.05, 0), (8, 0.1, 3.0), M['concrete'])
wall('passagem_back', 62, 70, -1.5 - T / 2, -1.5 - T / 2, M['bunker'])
wall('passagem_front', 62, 70, 1.5 + T / 2, 1.5 + T / 2, M['bunker'])
for k in range(7):  # os degraus pintados no chão (a descida; o chão do jogo é plano)
    box(f'passagem_step{k}', (63.2 + k * 0.95, 0.005, 0), (0.08, 0.006, 2.8), M['stone'])
for k, x in enumerate((64.0, 68.0)):
    cyl(f'passagem_bulb{k}', (x, 2.7, 0), 0.06, 0.12, M['bulb'], seg=8)
    cyl(f'passagem_bulbwire{k}', (x, 2.95, 0), 0.006, 0.4, M['steel'], seg=4)

# =============================================================== O BUNKER (x 70…92): a luta contra a Degolificada
# cânone: a MAIOR SALA DO BUNKER; atrás da criatura, o livro aberto no RITUAL DE PASSAGEM; os restos mortais queimados
# no ritual (o fogo fica azul). PROPOSTA: os móveis, os beliches, as caixas e a disposição.
closed_room('bunker', 70, 92, -9, 9, floor='concrete', wmat=M['bunker'], gaps=(('L', 1.25), ('R', 1.25)))
box('bunker_irondoor', (70.4, 1.15, -1.9), (0.1, 2.3, 1.2), M['rust'], rot_y=0.5)  # a porta de ferro, aberta
# o CÍRCULO DO RITUAL no chão (a troca de corpos), com velas
for k in range(40):
    a = k / 40 * TAU
    box(f'DECAL_bunker_circle{k}', (81 + math.cos(a) * 4.2, 0.006, math.sin(a) * 4.2), (0.7, 0.004, 0.1), M['blood'], rot_y=-a)
for k in range(6):
    a = k / 6 * TAU + 0.3
    box(f'DECAL_bunker_sigil{k}', (81 + math.cos(a) * 2.4, 0.007, math.sin(a) * 2.4), (1.6, 0.004, 0.08), M['blood'], rot_y=-a + 1.2)
for k in range(8):
    a = k / 8 * TAU
    x, z = 81 + math.cos(a) * 4.7, math.sin(a) * 4.7
    cyl(f'bunker_candle{k}', (x, 0, z), 0.05, 0.22 + 0.1 * (k % 3), M['paper'], seg=8)
    sphere(f'FLICKER_bunker_flame{k}', (x, 0.28 + 0.1 * (k % 3), z), (0.035, 0.05, 0.035), M['fire'])
# o PÚLPITO com o livro aberto (o Ritual de Passagem), no fundo — atrás de onde ela fica
box('bunker_lectern', (90.4, 0.55, 3.6), (0.5, 1.1, 0.7), M['wood'])
col_box('bunker_lectern', (90.4, 0.55, 3.6), (0.6, 1.1, 0.8))
box('bunker_book_l', (90.35, 1.16, 3.42), (0.42, 0.03, 0.34), M['paper'], rot_x=0.12, rot_z=0.25)
box('bunker_book_r', (90.35, 1.16, 3.78), (0.42, 0.03, 0.34), M['paper'], rot_x=-0.12, rot_z=0.25)
box('DECAL_bunker_book_sigil', (90.37, 1.185, 3.42), (0.2, 0.004, 0.2), M['blood'], rot_z=0.25)
# os RESTOS MORTAIS (o corpo enrolado num pano sobre a lenha) — onde se queima e diz o nome
box('bunker_pyre', (89.0, 0.15, -4.5), (1.6, 0.3, 1.0), M['soot'])
for k in range(5):
    cyl(f'bunker_log{k}', (88.3 + k * 0.35, 0.32, -4.5 + random.uniform(-0.2, 0.2)), 0.07, 1.1, M['wood'], seg=6, rot_x=math.pi / 2, rot_y=random.uniform(-0.3, 0.3))
box('bunker_remains', (89.0, 0.5, -4.5), (1.2, 0.22, 0.36), M['shroud'], bevel=0.08)
sphere('bunker_remains_head', (89.7, 0.55, -4.5), (0.13, 0.12, 0.13), M['shroud'])
box('bunker_pyre_embers', (89.0, 0.31, -4.5), (1.4, 0.02, 0.8), M['ember'])
col_box('bunker_pyre', (89.0, 0.35, -4.5), (1.7, 0.7, 1.1))
# o abrigo: beliches de ferro, as caixas de mantimentos, a estante de latas
for k, z in enumerate((-7.7, 7.7)):
    for j, x in enumerate((73.5, 77.0)):
        n = f'bunker_bunk{k}{j}'
        for i, y in enumerate((0.4, 1.3)):
            box(f'{n}_bed{i}', (x, y, z), (1.9, 0.08, 0.85), M['rust'])
            box(f'{n}_mat{i}', (x, y + 0.08, z), (1.8, 0.08, 0.8), M['shroud'])
        for sx in (-1, 1):
            box(f'{n}_post{sx}', (x + sx * 0.92, 0.85, z), (0.05, 1.7, 0.85), M['rust'])
        col_box(n, (x, 0.85, z), (1.95, 1.7, 0.9))
for k, (x, z) in enumerate(((84.5, -8.0), (85.4, -8.1), (84.9, -7.9), (90.8, 7.6), (90.8, 6.8))):
    h = 0.5 + 0.1 * (k % 2)
    box(f'bunker_crate{k}', (x, h / 2 + (0.5 if k == 2 else 0), z), (0.8, h, 0.7), M['wood'], rot_y=random.uniform(-0.2, 0.2))
    if k != 2:
        col_box(f'bunker_crate{k}', (x, h / 2, z), (0.85, h, 0.75))
box('bunker_cans', (79.0, 1.0, -8.65), (2.4, 2.0, 0.4), M['steel'])
col_box('bunker_cans', (79.0, 1.0, -8.65), (2.4, 2.0, 0.45))
# riscos na parede do fundo (PROPOSTA)
for k in range(4):
    box(f'DECAL_bunker_scratch{k}', (91.88, 1.5 + k * 0.25, -1.9 - k * 0.3), (0.004, 0.06, 0.6), M['blood'], rot_x=0.1 * k)
# a luz: lâmpadas nuas penduradas
for k, (x, z) in enumerate(((75, -4), (75, 4), (81, 0), (87, -4), (87, 4))):
    cyl(f'{"FLICKER_" if k % 2 else ""}bunker_bulb{k}', (x, 2.7, z), 0.06, 0.12, M['bulb'], seg=8)
    cyl(f'bunker_bulbwire{k}', (x, 2.95, z), 0.006, 0.4, M['steel'], seg=4)

# =============================================================== A SAÍDA DO BUNKER (x 92…104)
box('FLOOR_saida', (98, -0.05, 0), (12, 0.1, 3.0), M['concrete'])
wall('saida_back', 92, 104, -1.5 - T / 2, -1.5 - T / 2, M['bunker'])
wall('saida_front', 92, 104, 1.5 + T / 2, 1.5 + T / 2, M['bunker'])
wall('saida_end', 104.1, 104.1, -1.6, 1.6, M['bunker'])
box('saida_endglow', (103.95, 1.4, 0), (0.04, 2.4, 1.6), M['moon'])
box('saida_exitsign', (103.9, 2.85, 0), (0.06, 0.2, 0.6), M['exit'])
cyl('saida_bulb', (98, 2.7, 0), 0.06, 0.12, M['bulb'], seg=8)

finalize(OUT)
