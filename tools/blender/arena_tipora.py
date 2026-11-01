"""
ILHA DE TIPORA (O Segredo na Ilha) — public/arenas/tipora.glb. O CENTRO DO VILAREJO à noite, a partir das artes da
abertura da campanha (wiki "Tipora", "Vilarejo de Tipora", "Farol", "Casa Pescador de Tipora", mapa da ilha) e das
plantas da Delegacia e da Casa dos Nemiera:
  - a PRAÇA DE TERRA batida no meio do vilarejo (a luta), cercada de grama e das CASAS DE TÁBUA gasta, com varanda,
    escadinha e as janelas acesas (sem eletricidade na ilha: LAMPIÕES nos postes de madeira);
  - ao fundo, no alto do MORRO, a IGREJA de madeira com a cruz, as janelas em arco acesas e a escada com corrimão; o
    CEMITÉRIO ao lado; a churrasqueira do Churrasco da Igreja ao pé do morro;
  - a DELEGACIA (telhado de telha com musgo), a CASA DOS NEMIERA (a escola, três águas), a LOJA DO BARNABÉ (as caixas
    da permuta), a CASA DE NÁVIA (as ervas na frente), a casa dos Aleno e a do Evandro;
  - a mata fechada em volta e, por uma abertura do lado esquerdo do fundo, o MAR verde e o FAROL listrado de vermelho e
    branco no rochedo, ao longe (o facho gira — `beacons` na config); a MANSÃO DOS MORETTI no alto do penhasco, à direita.
Feito à mão (sem kits). Coordenadas do jogo: praça r ≈ 15, luta r = 17; a câmera começa em +z olhando a igreja.
  node tools/blender/build.mjs tipora   → public/arenas/tipora.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import bmesh
from arena_lib import *
from arena_lib import _obj_from_bmesh, _move
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'tipora.glb'
random.seed(1962)  # Constantino e Noralma chegam à ilha
start()

M = {
    'grass': material('grass_lush', '#4a6a2a', 1),
    'dirt': material('dirt_cracked', '#b49a78', 1),  # a terra clara e rachada do mapa do RPG
    'apple': material('fruit_apple', '#b8302a', 0.5),
    'lime': material('fruit_lime', '#6ab838', 0.5),
    'banana': material('fruit_banana', '#e8c840', 0.6),
    'slope': material('grass_dry', '#6a6a3a', 1),
    'sea': material('sea_tipora', '#2a7a72', 0.2, emission='#0e3a36', strength=0.8),
    'sand': material('sand', '#c9a46a', 1),
    'rock': material('rock_coast', '#3a3c3c', 0.95),
    'wood': material('wood_plank', '#6a4a30', 0.9),
    'wood_d': material('wood_dark', '#3a2618', 0.75),
    'wood_g': material('wood_grey', '#5a5248', 0.9),   # tábua velha acinzentada (a igreja)
    'shingle': material('roof_shingle', '#4a3424', 0.9),
    'tile': material('roof_red', '#8a4430', 0.85),
    'moss': material('moss', '#3a6a2a', 1),
    'win': material('window_lamp', '#ffc070', 0.4, emission='#ff9a40', strength=2.6),
    'flame': material('lamp_flame', '#ffd080', 0.3, emission='#ffa040', strength=6),
    'iron': material('iron_dark', '#26242a', 0.5, metal=0.7),
    'stone': material('stone_trim', '#a8a092', 0.9),
    'grave': material('grave_stone', '#6a6a66', 0.95),
    'bark': material('bark', '#3a2c22', 1),
    'pine': material('foliage_pine', '#1e3a26', 1),
    'leaf': material('foliage_round', '#24402a', 1),
    'brick': material('brick_manor', '#7a4a38', 0.9),
    'manor_roof': material('manor_roof', '#2a2228', 0.8),
    'red': material('lighthouse_red', '#a8281e', 0.6),
    'white': material('lighthouse_white', '#e8e4da', 0.6),
    'lamp': material('lighthouse_lamp', '#fff4c0', 0.2, emission='#fff0b0', strength=8),
    'herb': material('herb_green', '#4a8a3a', 1),
    'cloth': material('sack_cloth', '#a8946a', 1),
    'ember': material('grill_ember', '#ff6a20', 0.4, emission='#ff4a10', strength=4),
}


def poly_prism(name, pts2, depth, mat, pos, rot_y=0.0):
    """prisma a partir de um contorno 2D (x, y) no plano vertical, com espessura `depth` (oitões dos telhados)"""
    bm = bmesh.new()
    front = [bm.verts.new((x, -depth / 2, y)) for x, y in pts2]
    back = [bm.verts.new((x, depth / 2, y)) for x, y in pts2]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    n = len(pts2)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new([front[i], front[j], back[j], back[i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = _obj_from_bmesh(name, bm, mat)
    return place(o, pos, rot_y)


def gable(name, w, d, h, rise, wall, roof, z0=0.0, over=0.35):
    """telhado de duas águas com a cumeeira ao longo de z (oitão na frente e atrás) sobre paredes de altura h"""
    parts = []
    half = w / 2 + over
    ang = math.atan2(rise, w / 2)
    slab = math.hypot(half, rise * half / (w / 2))
    for s in (-1, 1):
        parts.append(box(f'{name}_roof{s}', (s * half / 2, h + rise / 2 + 0.05, z0), (slab, 0.09, d + over * 2), roof, rot_z=-s * ang))
    for zz in (z0 + d / 2, z0 - d / 2):
        parts.append(poly_prism(f'{name}_gable{zz}', [(-w / 2, 0), (w / 2, 0), (0, rise)], 0.1, wall, (0, h, zz)))
    return parts


def house(name, pos, w, d, h, rot_y, roof='shingle', rise=1.3, porch=True, wall='wood'):
    """casa de tábua sobre um pequeno assoalho, com porta, janelas acesas, varanda e escadinha (frente em +z local)"""
    P = []
    base = 0.35
    P.append(box(f'{name}_floor', (0, base / 2, 0), (w + 0.2, base, d + 0.2), M['wood_d']))
    P.append(box(f'{name}_walls', (0, base + h / 2, 0), (w, h, d), M[wall]))
    for s in (-1, 1):  # os cantos de viga
        for zz in (-1, 1):
            P.append(box(f'{name}_beam{s}{zz}', (s * w / 2, base + h / 2, zz * d / 2), (0.16, h + 0.05, 0.16), M['wood_d']))
    P += gable(name, w, d, base + h, rise, M[wall], M[roof])
    P.append(box(f'{name}_door', (0.0 if w < 4 else -w / 4, base + 0.95, d / 2 + 0.03), (0.9, 1.9, 0.06), M['wood_d']))
    nx = max(1, int(w // 2.2))
    for i in range(nx):  # janelas da frente
        x = (i + 0.5) / nx * w - w / 2
        if abs(x - (0.0 if w < 4 else -w / 4)) < 0.9:
            continue
        P.append(box(f'{name}_wf{i}', (x, base + 1.35, d / 2 + 0.03), (0.75, 0.8, 0.05), M['win']))
        P.append(box(f'{name}_wfs{i}', (x, base + 0.9, d / 2 + 0.06), (0.9, 0.08, 0.1), M['wood_d']))
    for s in (-1, 1):  # janelas dos lados
        for k in range(max(1, int(d // 2.6))):
            z = (k + 0.5) / max(1, int(d // 2.6)) * d - d / 2
            P.append(box(f'{name}_ws{s}{k}', (s * (w / 2 + 0.03), base + 1.35, z), (0.05, 0.8, 0.7), M['win']))
    if porch:
        P.append(box(f'{name}_porch', (0, base - 0.05, d / 2 + 0.75), (w, 0.1, 1.5), M['wood']))
        for s in (-1, 1):
            P.append(box(f'{name}_post{s}', (s * (w / 2 - 0.1), base + 1.1, d / 2 + 1.4), (0.12, 2.2, 0.12), M['wood_d']))
            P.append(box(f'{name}_rail{s}', (s * (w / 2 - 0.1), base + 0.55, d / 2 + 0.8), (0.06, 0.06, 1.3), M['wood_d']))
        P.append(box(f'{name}_awning', (0, base + 2.25, d / 2 + 0.8), (w + 0.2, 0.08, 1.7), M[roof], rot_x=0.18))
        for k in range(2):
            P.append(box(f'{name}_step{k}', (0.0 if w < 4 else -w / 4, base - 0.12 - k * 0.12, d / 2 + 1.65 + k * 0.3), (1.1, 0.12, 0.3), M['wood_d']))
    o = join_objs(P, name)
    _move(o, pos, rot_y)
    col_box(name, pos, (w + 0.6, 3, d + 0.6) if abs(math.sin(rot_y * 2)) < 0.5 else (max(w, d) + 0.6, 3, max(w, d) + 0.6))
    return o


def face_center(x, z):
    return math.atan2(-x, -z)


def at(a, r):
    return math.sin(a) * r, math.cos(a) * r


# DISTÂNCIAS pelo MAPA DA ILHA (wiki "Mapa da ilha de Tipora"; escala pelas casas, ~0,35 m/px): o vilarejo fica no lado
# leste; o FAROL ~90 m a oeste (um pouco ao sul), no cabo de pedra; a MANSÃO ~115 m a oeste-noroeste no penhasco; a
# IGREJA ao norte da praça; o mar ao sul (~30 m) e a leste (~28 m). No jogo: oeste = -z (a câmera começa olhando para
# lá), norte = +x.
LIGHTHOUSE = (-27.0, -90.0)
MANOR = (22.0, -118.0)
CHURCH = (26.0, -6.0)
SEA_GAP = math.pi  # o setor sem mata nem casa: o oeste (o mar, o farol e a mansão)
LAND_C, LAND_R = (6.0, -12.0), 40.0  # o planalto do vilarejo (a ilha é estreita aqui)
# a ilha é UMA SÓ: o vilarejo no leste e, seguindo pela mata para oeste, o cabo do FAROL (sudoeste, na beira do mar)
# e o penhasco da MANSÃO (noroeste)
LANDS = [(LAND_C, LAND_R), ((8.0, -52.0), 32.0), ((2.0, -84.0), 27.0), ((16.0, -112.0), 26.0)]


def on_land(x, z, margin=3.0):
    return any((x - c[0]) ** 2 + (z - c[1]) ** 2 < (r - margin) ** 2 for c, r in LANDS)


def in_gap(a, half=0.5):
    d = math.atan2(math.sin(a - SEA_GAP), math.cos(a - SEA_GAP))
    return abs(d) < half


# ================================================================ chão: o planalto do vilarejo, a encosta e o mar
FOAM = material('sea_foam', '#cfe8e0', 0.6, emission='#6a9a92', strength=0.6)
for k, (c, r) in enumerate(LANDS):
    cyl(f'GROUND_grass{k}', (c[0], -0.4, c[1]), r, 0.4, M['grass'], seg=64)
    cyl(f'GROUND_slope{k}', (c[0], -2.6, c[1]), r + 7, 2.2, M['slope'], seg=64, r_top=r)
    cyl(f'GROUND_beach{k}', (c[0], -3.0, c[1]), r + 12, 0.55, M['sand'], seg=64, r_top=r + 7)
    # a ESPUMA das ondas batendo na praia
    cyl(f'GROUND_foam{k}', (c[0], -2.56, c[1]), r + 13.5, 0.04, FOAM, seg=64)
box('GROUND_sea', (0, -2.6, 0), (700, 0.1, 700), M['sea'])
# a praça de terra batida e as trilhas (para a igreja, para o mar, para o porto)
cyl('GROUND_square', (0, -0.02, 0), 15.5, 0.04, M['dirt'], seg=48)
for k, (a, L) in enumerate(((SEA_GAP - 0.15, 30), (0.0, 22), (math.atan2(*CHURCH), 8))):
    x, z = at(a, 15 + L / 2)
    box(f'GROUND_path{k}', (x, 0.0, z), (3.2, 0.04, L), M['dirt'], rot_y=a)

# ================================================================ a IGREJA no alto do morro, com o cemitério ao lado
# montada na origem com a frente em +z e depois levada ao norte da praça, de frente para ela
CZ = 0.0
HILL = 2.4
CR = face_center(*CHURCH)
sphere('GROUND_hill', (CHURCH[0], 0, CHURCH[1]), (11, HILL, 11), M['grass'], seg=24, rings=10)
col_cyl('hill', (CHURCH[0], 0, CHURCH[1]), 8.6, 3)
_before = set(bpy.data.objects.keys())
CW, CD, CH = 6.4, 10.0, 4.6
cb = HILL - 0.1
P = [box('church_walls', (0, cb + CH / 2, CZ), (CW, CH, CD), M['wood_g'])]
for s in (-1, 1):
    for zz in (-1, 1):
        P.append(box(f'church_beam{s}{zz}', (s * CW / 2, cb + CH / 2, CZ + zz * CD / 2), (0.2, CH, 0.2), M['wood_d']))
P += gable('church', CW, CD, cb + CH, 2.6, M['wood_g'], M['shingle'], z0=CZ, over=0.45)
join_objs(P, 'church')
# a cruz na ponta do oitão da frente e a janela redonda acesa
box('church_cross_v', (0, cb + CH + 3.4, CZ + CD / 2), (0.16, 1.6, 0.16), M['wood_d'])
box('church_cross_h', (0, cb + CH + 3.6, CZ + CD / 2), (0.9, 0.14, 0.14), M['wood_d'])
cyl('church_rose', (0, cb + CH + 0.9, CZ + CD / 2 + 0.06), 0.6, 0.06, M['win'], seg=16, rot_x=math.pi / 2)
box('church_door', (0, cb + 1.25, CZ + CD / 2 + 0.05), (1.5, 2.5, 0.08), M['wood_d'])
for s in (-1, 1):
    for k in range(4):  # janelas altas em arco nos lados
        z = CZ - CD / 2 + 1.4 + k * 2.4
        box(f'church_win{s}{k}', (s * (CW / 2 + 0.04), cb + 2.3, z), (0.05, 1.7, 0.75), M['win'])
        cyl(f'church_wtop{s}{k}', (s * (CW / 2 + 0.04), cb + 3.15, z), 0.375, 0.05, M['win'], seg=10, rot_z=math.pi / 2)
    box(f'church_fwin{s}', (s * 1.9, cb + 2.3, CZ + CD / 2 + 0.05), (0.7, 1.6, 0.05), M['win'])
# a escada que desce do morro até a praça, com o corrimão dos dois lados
N = 9
for k in range(N):
    y = cb - (k + 1) * (cb / N)
    z = CZ + CD / 2 + 0.6 + k * 0.42
    box(f'stair{k}', (0, y + 0.06, z), (2.0, 0.16, 0.44), M['wood'])
for s in (-1, 1):
    z0, z1 = CZ + CD / 2 + 0.6, CZ + CD / 2 + 0.6 + N * 0.42
    L = math.hypot(z1 - z0, cb)
    box(f'stair_rail{s}', (s * 1.05, cb / 2 + 0.95, (z0 + z1) / 2), (0.07, 0.07, L), M['wood_d'], rot_x=math.atan2(cb, z1 - z0))
    for k in range(0, N + 1, 3):
        z = z0 + k * 0.42
        y = cb - k * (cb / N)
        box(f'stair_post{s}{k}', (s * 1.05, y + 0.45, z), (0.08, 0.95, 0.08), M['wood_d'])
# o CEMITÉRIO ao lado da igreja (lápides e cruzes de madeira)
for k in range(16):
    x = -6.5 - (k % 4) * 1.6 + random.uniform(-0.3, 0.3)
    z = CZ - 3 + (k // 4) * 1.9 + random.uniform(-0.3, 0.3)
    y = HILL * 0.55 - (abs(x) - 6.5) * 0.25
    if k % 3 == 0:
        box(f'grave_x{k}', (x, y + 0.5, z), (0.1, 1.0, 0.1), M['wood_d'], rot_y=random.uniform(-0.2, 0.2))
        box(f'grave_xh{k}', (x, y + 0.75, z), (0.55, 0.09, 0.09), M['wood_d'], rot_y=random.uniform(-0.2, 0.2))
    else:
        box(f'grave{k}', (x, y + 0.35, z), (0.6, 0.8, 0.16), M['grave'], rot_y=random.uniform(-0.25, 0.25), rot_z=random.uniform(-0.12, 0.12), bevel=0.05)
_church = [bpy.data.objects[n] for n in bpy.data.objects.keys() if n not in _before]
_move(join_objs(_church, 'church_all'), (CHURCH[0], 0, CHURCH[1]), CR)
# a churrasqueira de tijolo do CHURRASCO DA IGREJA ao pé do morro, com as brasas acesas
GX, GZ = 15.5, 2.5
box('grill', (GX, 0.45, GZ), (2.2, 0.9, 0.9), M['brick'], rot_y=CR)
box('FLICKER_grill_coals', (GX, 0.92, GZ), (1.9, 0.06, 0.7), M['ember'], rot_y=CR)
col_box('grill', (GX, 0, GZ), (2.2, 1.2, 2.2))

# ================================================================ as CASAS em volta da praça (frente para o centro)
HOUSES = [
    # nome, ângulo, raio, largura, fundo, altura, telhado, varanda
    ('delegacia', 0.5, 23.0, 6.0, 5.0, 3.0, 'tile', True),
    ('loja_barnabe', 2.4, 21.5, 5.0, 4.2, 2.8, 'shingle', True),
    ('casa_nemiera', 1.05, 23.0, 7.5, 5.0, 2.8, 'shingle', True),
    ('casa_navia', -1.05, 22.5, 5.2, 4.4, 2.7, 'shingle', True),
    ('casa_aleno', -1.7, 21.0, 4.0, 3.6, 2.5, 'shingle', False),
    ('casa_evandro', -2.15, 22.5, 4.6, 4.0, 2.6, 'tile', True),
    ('casa_helena', -0.45, 23.0, 5.0, 4.2, 2.7, 'shingle', True),
]
for name, a, r, w, d, h, roof, porch in HOUSES:
    x, z = at(a, r)
    house(name, (x, 0, z), w, d, h, face_center(x, z), roof=roof, porch=porch)
# o MUSGO no telhado de telha da delegacia (manchas verdes, como na planta)
dx, dz = at(0.5, 23.0)
for k in range(10):
    sphere(f'moss{k}', (dx + random.uniform(-2.6, 2.6), 4.3 + random.uniform(-0.2, 0.5), dz + random.uniform(-2.2, 2.2)), (0.4, 0.08, 0.3), M['moss'], seg=6, rings=3)
# a Casa dos Nemiera (a escola) tem as três águas: mais dois telhados atrás do principal
nx, nz = at(1.05, 23.0)
ny = face_center(nx, nz)
for k, off in enumerate((-2.6, 2.6)):
    P = gable(f'nemiera_extra{k}', 2.4, 4.6, 3.15, 1.1, M['wood'], M['shingle'], over=0.2)
    o = join_objs(P, f'nemiera_extra{k}')
    ox, oz = off * math.cos(ny), -off * math.sin(ny)
    _move(o, (nx + ox - math.sin(ny) * 0.4, 0, nz + oz - math.cos(ny) * 0.4), ny)
# a LOJA DO BARNABÉ: as caixas e sacos da permuta na frente, e a placa
lx, lz = at(2.4, 21.5)
ly = face_center(lx, lz)
fx, fz = -math.sin(ly), -math.cos(ly)  # da loja para o centro
rx, rz = math.cos(ly), -math.sin(ly)
for k, (u, v, s) in enumerate(((2.4, 3.6, 0.7), (3.1, 3.4, 0.6), (2.7, 3.5, 0.55), (-2.6, 3.3, 0.7))):
    y = s / 2 + (0.6 if k == 2 else 0)
    cx, cz = lx + rx * u - fx * -v, lz + rz * u - fz * -v
    box(f'crate{k}', (cx, y, cz), (s, s, s), M['wood'], rot_y=ly + random.uniform(-0.3, 0.3))
    # as frutas da permuta por cima (maçã, limão, banana — como nas caixas da loja no RPG)
    fm = (M['apple'], M['lime'], M['banana'], M['apple'])[k]
    for j in range(5):
        sphere(f'fruit{k}_{j}', (cx + random.uniform(-0.2, 0.2), y + s / 2 + 0.06, cz + random.uniform(-0.2, 0.2)), (0.09, 0.08, 0.09) if k % 2 == 0 or k == 1 else (0.16, 0.05, 0.05), fm, seg=6, rings=4)
for k in range(3):
    sphere(f'sack{k}', (lx + rx * (-1.8 - k * 0.5) + fx * 3.1, 0.3, lz + rz * (-1.8 - k * 0.5) + fz * 3.1), (0.32, 0.32, 0.26), M['cloth'], seg=8, rings=6)
col_box('loja_goods', (lx + fx * 3.4, 0, lz + fz * 3.4), (2.2, 1.5, 2.2))
box('loja_sign', (lx + fx * 2.5, 3.2, lz + fz * 2.5), (2.4, 0.5, 0.08), M['wood_d'], rot_y=ly)
# a CASA DE NÁVIA: os canteiros de ervas na frente (a médica da ilha)
vx, vz = at(-1.05, 22.5)
vy = face_center(vx, vz)
for k in range(4):
    u = -1.8 + k * 1.2
    px, pz = vx + math.cos(vy) * u - math.sin(vy) * 3.6, vz - math.sin(vy) * u - math.cos(vy) * 3.6
    box(f'herb_box{k}', (px, 0.2, pz), (0.9, 0.4, 0.5), M['wood'], rot_y=vy)
    sphere(f'herb{k}', (px, 0.5, pz), (0.42, 0.3, 0.24), M['herb'], seg=8, rings=5)

# casas mais ao fundo (o resto do vilarejo, entre as árvores)
for k, a in enumerate((0.75, 0.25, 2.05, -1.4, -0.75, -1.85, 1.35)):
    r = 30 + (k % 2) * 2.5
    x, z = at(a, r)
    if not on_land(x, z, 4) or in_gap(a) or math.hypot(x - CHURCH[0], z - CHURCH[1]) < 12:
        continue
    house(f'far_house{k}', (x, 0, z), 4.0 + (k % 3) * 0.6, 3.6, 2.5, face_center(x, z), roof='tile' if k % 3 == 1 else 'shingle', porch=False)

# ================================================================ LAMPIÕES nos postes de madeira (a ilha não tem luz elétrica)
LAMPS = []
for k in range(7):
    a = (k + 0.5) / 7 * TAU
    if in_gap(a, 0.2):
        a += 0.35
    x, z = at(a, 14.2)
    LAMPS.append((x, z))
    box(f'lamp_post{k}', (x, 1.4, z), (0.16, 2.8, 0.16), M['wood_d'])
    box(f'lamp_arm{k}', (x * 0.985, 2.75, z * 0.985), (0.5, 0.08, 0.08), M['wood_d'], rot_y=face_center(x, z) + math.pi / 2)
    ix, iz = x * 0.97, z * 0.97
    box(f'lamp_cap{k}', (ix, 2.7, iz), (0.3, 0.06, 0.3), M['iron'])
    box(f'lamp_cage{k}', (ix, 2.45, iz), (0.26, 0.4, 0.26), M['iron'])
    sphere(f'FLICKER_lamp{k}', (ix, 2.43, iz), (0.1, 0.16, 0.1), M['flame'], seg=8, rings=5)
    col_cyl(f'lamp{k}', (x, 0, z), 0.22, 3)
# uma carroça com barris e um banco na beira da praça
box('cart_bed', (-9.5, 0.75, 8.5), (1.6, 0.12, 2.6), M['wood'], rot_y=0.5)
for s in (-1, 1):
    cyl(f'cart_wheel{s}', (-9.5 + s * 0.88 * math.cos(0.5), 0.5, 8.5 - s * 0.88 * math.sin(0.5)), 0.5, 0.1, M['wood_d'], seg=12, rot_z=math.pi / 2, rot_y=0.5)
for k in range(2):
    cyl(f'barrel{k}', (-9.6 + k * 0.5, 0.81, 8.3 + k * 0.6), 0.32, 0.8, M['wood'], seg=10)
box('cart_shaft', (-8.6, 0.6, 10.0), (0.08, 0.08, 1.8), M['wood_d'], rot_y=0.5, rot_x=-0.2)
col_box('cart', (-9.5, 0, 8.5), (2.4, 1.6, 2.6))
box('bench_seat', (9.8, 0.45, 7.6), (2.0, 0.08, 0.5), M['wood'], rot_y=-0.9)
for s in (-1, 1):
    box(f'bench_leg{s}', (9.8 + s * 0.8 * math.cos(-0.9), 0.22, 7.6 - s * 0.8 * math.sin(-0.9)), (0.08, 0.45, 0.45), M['wood_d'], rot_y=-0.9)
col_box('bench', (9.8, 0, 7.6), (1.6, 1, 1.6))

# ================================================================ a MATA fechada em volta (com a abertura para o mar e o farol)
k = 0
for ring_r, n in ((27, 30), (32, 36), (37, 40), (43, 44), (49, 46)):
    for i in range(n):
        a = (i + random.uniform(-0.3, 0.3)) / n * TAU
        if in_gap(a):
            continue
        r = ring_r + random.uniform(-2.5, 2.5)
        x, z = at(a, r)
        if not on_land(x, z, 2) or math.hypot(x - CHURCH[0], z - CHURCH[1]) < 11:
            continue
        if any((x - hx) ** 2 + (z - hz) ** 2 < 16 for hx, hz in [at(h[1], h[2]) for h in HOUSES]):
            continue
        hgt = random.uniform(6, 10)
        if random.random() < 0.55:
            cyl(f'trunk{k}', (x, 0, z), 0.3, hgt * 0.35, M['bark'], seg=6)
            cyl(f'pine{k}', (x, hgt * 0.25, z), random.uniform(1.8, 2.6), hgt * 0.8, M['pine'], seg=7, r_top=0.05)
        else:
            cyl(f'trunk{k}', (x, 0, z), 0.32, hgt * 0.5, M['bark'], seg=6)
            rr = random.uniform(2.0, 3.2)
            sphere(f'crown{k}', (x, hgt * 0.5 + rr * 0.6, z), (rr, rr * 0.85, rr), M['leaf'], seg=8, rings=6)
        k += 1
# arbustos na beira da praça
for i in range(26):
    a = random.uniform(0, TAU)
    x, z = at(a, random.uniform(17.5, 19.5))
    sphere(f'bush{i}', (x, 0.3, z), (random.uniform(0.6, 1.1), random.uniform(0.45, 0.7), random.uniform(0.6, 1.0)), M['leaf'], seg=7, rings=5)

# ================================================================ o FAROL no rochedo, ao longe (listras vermelhas e brancas)
LX, LZ = LIGHTHOUSE
for i in range(14):
    a = random.uniform(0, TAU)
    r = random.uniform(1.5, 6)
    s = random.uniform(1.6, 3.4)
    sphere(f'lh_rock{i}', (LX + math.sin(a) * r, -2.7 + s * 0.35, LZ + math.cos(a) * r), (s, s * 0.8, s * 0.9), M['rock'], seg=7, rings=5)
cyl('lh_base', (LX, -1.1, LZ), 3.0, 2.4, M['rock'], seg=16)
y = 1.3
for i in range(6):
    r0 = 2.1 - i * 0.12
    cyl(f'lh_band{i}', (LX, y, LZ), r0, 2.4, M['red'] if i % 2 == 0 else M['white'], seg=18, r_top=r0 - 0.12)
    y += 2.4
cyl('lh_gallery', (LX, y, LZ), 2.0, 0.25, M['iron'], seg=18)
for i in range(12):
    a = i / 12 * TAU
    box(f'lh_rail{i}', (LX + math.sin(a) * 1.85, y + 0.6, LZ + math.cos(a) * 1.85), (0.06, 0.8, 0.06), M['iron'])
cyl('lh_lantern', (LX, y + 0.25, LZ), 1.05, 1.6, M['lamp'], seg=14)
cyl('lh_roof', (LX, y + 1.85, LZ), 1.25, 1.1, M['iron'], seg=14, r_top=0.15)
# o porto: o píer de madeira e a casinha do pescador na praia, perto do farol
# a PRAIA do farol: a faixa de areia na beira do mar em volta do rochedo (como na abertura)
sphere('GROUND_lh_beach', (LX + 5, -0.32, LZ + 3), (13, 0.35, 15), M['sand'], seg=20, rings=6)
# o porto na COSTA SUL, perto do farol: o píer de madeira entrando no mar e a casinha do pescador na beira
PX, PZ = -31.0, -72.0
for i in range(11):
    box(f'pier_plank{i}', (PX - i * 1.0, -2.1, PZ), (0.95, 0.1, 2.0), M['wood_g'])
    if i % 2 == 0:
        for s in (-1, 1):
            cyl(f'pier_post{i}{s}', (PX - i * 1.0, -3.3, PZ + s * 1.0), 0.14, 1.6, M['wood_d'], seg=6)
house('casa_pescador', (-21.0, -0.4, -70.0), 3.4, 3.0, 2.2, -math.pi / 2, porch=True)
# a MATA do meio da ilha, entre o vilarejo e a mansão (o lado sul fica aberto: a costa, o mar e o farol)
for i in range(190):
    x, z = random.uniform(-16, 40), random.uniform(-108, -38)
    if not on_land(x, z, 3) or math.hypot(x - MANOR[0], z - MANOR[1]) < 15 or math.hypot(x - LX, z - LZ) < 16:
        continue
    if random.random() < 0.35:  # o mato baixo entre as árvores
        sphere(f'wbush{i}', (x, 0.4, z), (random.uniform(0.8, 1.6), random.uniform(0.5, 0.9), random.uniform(0.8, 1.5)), M['leaf'], seg=7, rings=5)
        continue
    hgt = random.uniform(5, 9)
    if random.random() < 0.6:
        cyl(f'wtrunk{i}', (x, 0, z), 0.3, hgt * 0.35, M['bark'], seg=6)
        cyl(f'wpine{i}', (x, hgt * 0.25, z), random.uniform(1.6, 2.4), hgt * 0.8, M['pine'], seg=7, r_top=0.05)
    else:
        rr = random.uniform(1.8, 2.8)
        cyl(f'wtrunk{i}', (x, 0, z), 0.3, hgt * 0.5, M['bark'], seg=6)
        sphere(f'wcrown{i}', (x, hgt * 0.5 + rr * 0.6, z), (rr, rr * 0.85, rr), M['leaf'], seg=8, rings=6)

# ================================================================ a MANSÃO DOS MORETTI no alto do penhasco, à direita do fundo
MX, MZ = MANOR
sphere('manor_cliff', (MX, -2, MZ), (22, 14, 18), M['rock'], seg=16, rings=9)  # o penhasco
sphere('manor_cliff_top', (MX, 9.5, MZ), (16, 2.2, 13), M['grass'], seg=16, rings=6)
for i in range(12):  # a mata do noroeste em volta da mansão
    a = random.uniform(0, TAU)
    x, z = MX + math.sin(a) * random.uniform(9, 13), MZ + math.cos(a) * random.uniform(8, 11)
    if z > MZ + 5:
        continue
    cyl(f'manor_pine{i}', (x, 9.5, z), random.uniform(1.6, 2.4), random.uniform(5, 8), M['pine'], seg=7, r_top=0.05)
MY = 11.0
box('manor_body', (MX, MY + 4, MZ), (14, 8, 8), M['brick'])
box('manor_wing', (MX - 8, MY + 3, MZ + 1), (5, 6, 6), M['brick'])
box('manor_tower', (MX + 6, MY + 5.5, MZ + 2), (3.4, 11, 3.4), M['brick'])
cyl('manor_tower_roof', (MX + 6, MY + 11, MZ + 2), 2.6, 2.6, M['manor_roof'], seg=4, r_top=0.05, rot_y=math.pi / 4)
P = gable('manor', 8, 14, 0, 2.8, M['brick'], M['manor_roof'], over=0.5)
o = join_objs(P, 'manor_roof')
_move(o, (MX, MY + 8, MZ), math.pi / 2)
for fl in range(3):
    for i in range(7):
        if random.random() < 0.55:
            box(f'manor_win{fl}_{i}', (MX - 6 + i * 2, MY + 1.6 + fl * 2.4, MZ + 4.05), (0.7, 1.1, 0.05), M['win'])

finalize(OUT)
