"""
ACAMPAMENTO DOS PÁSSAROS (Hexatombe) — public/arenas/passaros.glb. Pedido do dono 2026-11-14 (TODO "Mapas que ainda
faltam do repertório": Acampamento dos Pássaros, já com dia e noite). Referências em
`Referencias visuais/Mapas/acampamento-dos-passaros/` (wiki: o modelo 3D do próprio RPG, as barracas de cada Pássaro;
episódios: HEX ep. 4, 4h14–4h23) e o texto da wiki ("Acampamento dos Pássaros"):
  - canon: o abrigo da equipe Pássaros na BEIRA DE UM GRANDE LAGO, na Coroa de Espinhos; uma BARRACA para cada membro
    (Corvo, Coruja, Harpia, Papagaio e Pomba); a FOGUEIRA CENTRAL de troncos e pedaços de corpos ao lado do CALDEIRÃO,
    com bancos de madeira em volta e restos do jantar; depois do massacre dos Vampiros, CABEÇAS cravadas em ESTACAS na
    frente das barracas (Corvo, Coruja, Papagaio; na da Harpia, o braço dele cravado na própria garra e a cabeça da
    Suellen), tudo banhado em sangue sob a névoa espessa;
  - Corvo: o símbolo de Sangue de madeira; Coruja: barris com a estátua do Serafim Vermelho e a lamparina; Harpia: a
    caixa usada de mesa; Papagaio: a barraca mais espaçosa, panfletos da PSIKOLERA; Pomba: a mais distante da porteira,
    a única sem sangue e sem cabeça, com a mesinha, a garrafa térmica e a lamparina;
  - o modelo 3D: barracas de pano vermelho trançado sobre varas tortas, estruturas de cano de ferro, barris, caixotes,
    lanternas, capim alto e árvores secas, a PORTEIRA de madeira na entrada.
  - PROPOSTA: a disposição exata das barracas e das estruturas de ferro; o pátio em volta da fogueira (r ≈ 18) é a arena.
Feito à mão (sem kits). Coordenadas do jogo; a câmera começa em +z (a porteira) olhando o lago (-z).
  node tools/blender/build.mjs passaros   → public/arenas/passaros.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import bmesh
from mathutils import Vector
from arena_lib import *
from arena_lib import _obj_from_bmesh, _move
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'passaros.glb'
random.seed(9)  # Hexatombe, a 9ª temporada
start()

M = {
    'ground': material('bird_earth', '#5a4030', 1),
    'tent': material('bird_tent_red', '#8a2a20', 0.95),
    'tent_grey': material('bird_tent_grey', '#4a4440', 0.95),
    'pole': material('bird_pole', '#4a3826', 0.95),
    'deadwood': material('dead_wood', '#3a3028', 0.95),
    'log': material('charred_log', '#2a1e16', 1),
    'ember': material('ember_bed', '#ff6a1a', 0.9, emission='#ff4a10', strength=2.2),
    'iron': material('black_iron', '#1e1c1c', 0.55, metal=0.7),
    'pipe': material('rust_pipe', '#5a4a40', 0.6, metal=0.6),
    'barrel': material('barrel_wood', '#6a4a30', 0.85),
    'hoop': material('barrel_hoop', '#3a3430', 0.5, metal=0.7),
    'crate': material('crate_wood', '#7a5a3a', 0.9),
    'plank': material('wood_plank', '#6a4a30', 0.85),
    'rope': material('rope', '#8a7050', 0.95),
    'lamp': material('lantern_glow', '#ffd8a0', 0.3, emission='#ffb060', strength=2.0),
    'skin': material('pale_skin', '#b89480', 0.7),
    'hair': material('hair_dark', '#1a1210', 0.9),
    'blood': material('blood_stain', '#3a0806', 0.9),
    'blood_wet': material('blood_wet', '#5a0a08', 0.45),
    'seraph': material('seraph_stone', '#6a1a18', 0.8),
    'flyer': material('flyer_psikolera', '#c8d040', 0.8),
    'paper': material('paper_notes', '#d8ccb0', 0.9),
    'thermos': material('thermos_green', '#2a5a3a', 0.4, metal=0.3),
    'cauldron': material('cauldron_iron', '#141212', 0.5, metal=0.6),
    'stew': material('stew', '#4a2a14', 0.3),
    'water': material('lake_water', '#1a1612', 0.08, metal=0.3),
    'reed': material('reed', '#6a5a3a', 1),
    'grass': material('dry_grass', '#8a6a44', 1),
    'grass_red': material('grass_blood', '#6a2a1e', 1),
    'stone': material('field_stone', '#5a5450', 0.95),
    'moon': material('moon_blood', '#ff7a5a', 0.5, emission='#ff2a10', strength=2.5),  # só na variante de noite
}
R_FIGHT = 18.0


def at(a, r):
    return math.sin(a) * r, math.cos(a) * r


def face_center(x, z):
    return math.atan2(-x, -z)


def strut(name, a, b, r, mat, seg=6, r2=None):
    """cilindro de a até b (coordenadas do jogo): varas, canos, galhos"""
    pa, pb = Vector(B(*a)), Vector(B(*b))
    d = pb - pa
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d.length)
    o = _obj_from_bmesh(name, bm, mat)
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    o.location = (pa + pb) / 2
    return o


class Acc:
    """malha acumulada (capim, juncos): um objeto só"""
    def __init__(self):
        self.bm = bmesh.new()

    def tri2(self, a, b, c):
        va = [self.bm.verts.new(B(*p)) for p in (a, b, c)]
        self.bm.faces.new(va)
        vb = [self.bm.verts.new(B(*p)) for p in (c, b, a)]
        self.bm.faces.new(vb)

    def done(self, name, mat):
        return _obj_from_bmesh(name, self.bm, mat)


def cloth(name, W, D, H, mat, side_drop=0.7, sag=0.3, nx=8, ny=8):
    """o PANO jogado sobre a cumeeira (eixo z local, de frente para trás, altura H): cai dos dois lados (x) até
    side_drop, ondulando e cedendo entre as varas; as pontas (frente +z, para a fogueira, e fundo) ficam abertas.
    Faces dos dois lados."""
    bm = bmesh.new()
    grid = []
    for i in range(nx + 1):
        u = i / nx
        z = (u - 0.5) * D
        row = []
        for j in range(ny + 1):
            v = j / ny * 2 - 1  # -1 = lado esquerdo, +1 = direito
            y = H - (H - side_drop) * abs(v) ** 1.1
            y -= sag * math.sin(math.pi * u) * (1 - abs(v) * 0.5) + random.uniform(-0.05, 0.05)
            x = v * W / 2 * (1 + 0.06 * math.sin(u * 6 + j))
            # a barra do pano descai e ondula
            if abs(v) > 0.85:
                y -= 0.25 * math.sin(u * 9 + v * 3) ** 2
            row.append((x, y, z))
        grid.append(row)
    for side in (0, 1):
        V = [[bm.verts.new(B(*grid[i][j])) for j in range(ny + 1)] for i in range(nx + 1)]
        for i in range(nx):
            for j in range(ny):
                q = [V[i][j], V[i + 1][j], V[i + 1][j + 1], V[i][j + 1]]
                bm.faces.new(q if side == 0 else list(reversed(q)))
    return _obj_from_bmesh(name, bm, mat)


def tent(name, W=4.0, D=4.6, H=2.9, mat='tent', big=False):
    """barraca dos Pássaros (o modelo 3D da wiki): o pano vermelho trançado jogado sobre a cumeeira, que vai da frente
    (+z, a entrada virada para a fogueira) ao fundo, apoiada em varas tortas cruzadas em X nas duas pontas; cordas e
    estacas nos lados."""
    P = [cloth(f'{name}_cloth', W, D, H, M[mat])]
    for sz in (-1, 1):
        z = sz * D / 2
        for sx in (-1, 1):  # o X das varas na ponta
            P.append(strut(f'{name}_pole{sz}{sx}', (sx * W * 0.4, 0, z + random.uniform(-0.1, 0.1)), (-sx * 0.15, H + 0.4, z), 0.06, M['pole'], seg=5))
        P.append(strut(f'{name}_guy{sz}', (0, H, z), (0, 0.05, z + sz * 1.8), 0.015, M['rope'], seg=3))
    for sx in (-1, 1):  # as cordas dos lados até as estacas
        for sz in (-1, 1):
            P.append(strut(f'{name}_side{sx}{sz}', (sx * W / 2, 0.7, sz * D * 0.3), (sx * (W / 2 + 1.0), 0.05, sz * D * 0.35), 0.012, M['rope'], seg=3))
    P.append(strut(f'{name}_ridge', (0, H + 0.05, -D / 2 - 0.35), (0, H + 0.05, D / 2 + 0.35), 0.065, M['pole'], seg=5))
    if big:  # a do Papagaio: uma vara no meio e as duas camas
        P.append(strut(f'{name}_mid', (0, 0, 0), (0, H, 0), 0.06, M['pole'], seg=5))
        for k, x in enumerate((-1.3, 1.3)):
            P.append(box(f'{name}_bed{k}', (x, 0.18, -0.4), (0.9, 0.3, 1.9), M['crate']))
            P.append(box(f'{name}_mat{k}', (x, 0.36, -0.4), (0.8, 0.08, 1.8), M['tent_grey']))
    else:
        P.append(box(f'{name}_bed', (-0.8, 0.16, -0.6), (0.85, 0.28, 1.8), M['crate']))
    o = join_objs(P, name)
    return rebase(o)


def head_on_stake(name, pos, h=2.2, hair=True):
    """a cabeça cravada na estaca (aviso dos Vampiros), com o sangue escorrido pela vara"""
    x, y, z = pos
    P = [strut(f'{name}_stake', (x, y, z), (x + random.uniform(-0.12, 0.12), y + h, z + random.uniform(-0.12, 0.12)), 0.04, M['pole'], seg=5, r2=0.01)]
    P.append(sphere(f'{name}_head', (x, y + h - 0.12, z), (0.13, 0.17, 0.15), M['skin'], seg=10, rings=7))
    if hair:  # o cabelo empapado caindo pelos lados
        P.append(sphere(f'{name}_hair', (x, y + h - 0.02, z - 0.04), (0.15, 0.13, 0.16), M['hair'], seg=10, rings=6))
        for sx in (-1, 1):
            P.append(box(f'{name}_lock{sx}', (x + sx * 0.12, y + h - 0.2, z - 0.03), (0.04, 0.3, 0.14), M['hair'], rot_z=sx * 0.15))
    P.append(cyl(f'{name}_neck', (x, y + h - 0.36, z), 0.09, 0.14, M['blood_wet'], seg=8))
    P.append(strut(f'{name}_drip', (x, y + h - 0.4, z), (x, y + 0.2, z), 0.045, M['blood_wet'], seg=5, r2=0.03))
    return join_objs(P, name)


def blood(name, x, z, r):
    cyl(f'GROUND_{name}', (x, 0.012, z), r, 0.01, M['blood'], seg=10)
    for k in range(3):
        a = random.uniform(0, TAU)
        d = r * random.uniform(0.9, 1.6)
        cyl(f'GROUND_{name}_s{k}', (x + math.sin(a) * d, 0.013, z + math.cos(a) * d), r * random.uniform(0.15, 0.35), 0.01, M['blood'], seg=7)


def barrel(name, pos, h=1.0, r=0.38):
    x, y, z = pos
    P = [cyl(f'{name}_b', pos, r, h, M['barrel'], seg=12, r_top=r * 0.92)]
    for k, t in enumerate((0.18, 0.82)):
        P.append(cyl(f'{name}_h{k}', (x, y + h * t - 0.03, z), r * (1.01 if t < 0.5 else 0.95), 0.06, M['hoop'], seg=12))
    return join_objs(P, name)


def lantern(name, pos):
    x, y, z = pos
    P = [box(f'{name}_base', (x, y + 0.03, z), (0.2, 0.06, 0.2), M['iron']), cyl(f'{name}_glass', (x, y + 0.06, z), 0.08, 0.2, M['lamp'], seg=8),
         box(f'{name}_top', (x, y + 0.29, z), (0.18, 0.05, 0.18), M['iron']), cyl(f'{name}_ring', (x, y + 0.32, z), 0.04, 0.06, M['iron'], seg=6)]
    return join_objs(P, name)


def seraph(name, pos, s=0.5):
    """a estatueta do Serafim Vermelho: a figura encapuzada"""
    x, y, z = pos
    P = [cyl(f'{name}_robe', (x, y, z), 0.3 * s, 1.1 * s, M['seraph'], seg=8, r_top=0.12 * s),
         sphere(f'{name}_hood', (x, y + 1.15 * s, z), (0.17 * s, 0.22 * s, 0.17 * s), M['seraph'], seg=8, rings=6)]
    for sx in (-1, 1):  # as asas fechadas
        P.append(box(f'{name}_wing{sx}', (x + sx * 0.2 * s, y + 0.75 * s, z - 0.05 * s), (0.08 * s, 0.8 * s, 0.35 * s), M['seraph'], rot_z=sx * 0.25))
    return join_objs(P, name)


# ================================================================ o chão: terra batida avermelhada, a margem do lago
cyl('GROUND_earth', (0, -0.3, -10), 130, 0.3, M['ground'], seg=64)
# o LAGO no fundo (-z), escuro e parado, com a margem de pedra e juncos
LAKE_C, LAKE_R = (4.0, -60.0), 30.0
cyl('GROUND_lake', (LAKE_C[0], 0.02, LAKE_C[1]), LAKE_R, 0.02, M['water'], seg=48)
REEDS = Acc()
for k in range(160):
    a = random.uniform(0, TAU)
    x, z = LAKE_C[0] + math.sin(a) * (LAKE_R + random.uniform(-1.5, 1.2)), LAKE_C[1] + math.cos(a) * (LAKE_R + random.uniform(-1.5, 1.2))
    if z > -25:
        continue
    for j in range(4):
        bx, bz = x + random.uniform(-0.3, 0.3), z + random.uniform(-0.3, 0.3)
        h = random.uniform(1.0, 2.2)
        REEDS.tri2((bx - 0.04, 0, bz), (bx + 0.04, 0, bz), (bx + random.uniform(-0.2, 0.2), h, bz + random.uniform(-0.2, 0.2)))
REEDS.done('reeds', M['reed'])
for k in range(22):
    a = random.uniform(-1.1, 1.1) + math.pi
    x, z = LAKE_C[0] + math.sin(a) * (LAKE_R + random.uniform(-0.5, 1.5)), LAKE_C[1] + math.cos(a) * (LAKE_R + random.uniform(-0.5, 1.5))
    sphere(f'shore{k}', (x, 0, z), (random.uniform(0.4, 1.0), random.uniform(0.25, 0.5), random.uniform(0.4, 1.0)), M['stone'], seg=7, rings=5)

# ================================================================ a FOGUEIRA CENTRAL: troncos e pedaços de corpos, o caldeirão e os bancos
FIRE_R = 1.7
for k in range(12):  # o anel de pedras
    a = k / 12 * TAU
    x, z = at(a, FIRE_R + 0.15)
    sphere(f'fireStone{k}', (x, 0.05, z), (0.32, 0.22, 0.28), M['stone'], seg=7, rings=5)
cyl('GROUND_embers', (0, 0.02, 0), FIRE_R - 0.1, 0.08, M['ember'], seg=18)
for k in range(9):  # os troncos em cone
    a = k / 9 * TAU + random.uniform(-0.15, 0.15)
    x, z = at(a, FIRE_R - 0.2)
    strut(f'fireLog{k}', (x, 0.1, z), (x * 0.15, 1.6 + random.uniform(-0.2, 0.3), z * 0.15), 0.13, M['log'], seg=6)
for k in range(5):  # toras atravessadas
    a = random.uniform(0, TAU)
    x, z = at(a, 0.7)
    x2, z2 = at(a + math.pi * 0.8, 0.9)
    strut(f'fireCross{k}', (x, 0.25, z), (x2, 0.35, z2), 0.12, M['log'], seg=6)
for k in range(4):  # os pedaços de corpos (membros pálidos, chamuscados na ponta)
    a = random.uniform(0, TAU)
    x, z = at(a, 1.0)
    x2, z2 = at(a + random.uniform(-0.6, 0.6), 1.9)
    strut(f'limb{k}', (x, 0.35, z), (x2, 0.15, z2), 0.075, M['skin'], seg=6, r2=0.06)
    strut(f'limbBurn{k}', (x, 0.35, z), (x * 0.8, 0.45, z * 0.8), 0.08, M['log'], seg=6)
col_cyl('fire', (0, 0, 0), FIRE_R + 0.35, 1.8)
# o CALDEIRÃO no tripé ao lado, com o ensopado e os restos do jantar
CX, CZ = 3.4, -1.0
for k in range(3):
    a = k / 3 * TAU + 0.3
    strut(f'tripod{k}', (CX + math.sin(a) * 1.0, 0, CZ + math.cos(a) * 1.0), (CX, 1.9, CZ), 0.04, M['iron'], seg=5)
strut('chain', (CX, 1.9, CZ), (CX, 1.05, CZ), 0.015, M['iron'], seg=4)
sphere('cauldron', (CX, 0.68, CZ), (0.55, 0.45, 0.55), M['cauldron'], seg=14, rings=8)
cyl('stew', (CX, 0.98, CZ), 0.46, 0.04, M['stew'], seg=14)
cyl('cauldronRim', (CX, 0.98, CZ), 0.52, 0.06, M['cauldron'], seg=14)
col_cyl('cauldron', (CX, 0, CZ), 0.85, 1.4)
for k in range(5):  # tigelas e pratos largados
    a = random.uniform(-0.8, 0.8)
    x, z = CX + math.sin(a) * 1.4 + random.uniform(-0.3, 0.3), CZ + math.cos(a) * 1.4
    cyl(f'bowl{k}', (x, 0, z), 0.13, 0.07, M['plank'], seg=8, r_top=0.16)
# os BANCOS de madeira em volta (toras e tábuas)
for k in range(6):
    a = k / 6 * TAU + 0.5
    x, z = at(a, 4.6)
    if abs(x - CX) < 1.8 and abs(z - CZ) < 1.8:
        continue
    o = join_objs([box(f'bench{k}_top', (0, 0.42, 0), (1.7, 0.08, 0.38), M['plank']),
                   box(f'bench{k}_l', (-0.65, 0.2, 0), (0.12, 0.4, 0.32), M['plank']),
                   box(f'bench{k}_r', (0.65, 0.2, 0), (0.12, 0.4, 0.32), M['plank'])], f'bench{k}')
    _move(o, (x, 0, z), a + math.pi / 2)
blood('fireA', -2.6, 2.4, 0.9)
blood('fireB', 2.0, 3.2, 0.6)
blood('fireC', -3.4, -2.2, 0.7)

# ================================================================ as BARRACAS de cada Pássaro (PROPOSTA a disposição)
# (ângulo, raio, nome, tamanho): o pátio vai até r 18, as barracas ficam logo depois, viradas para a fogueira
TENTS = {
    'coruja': (math.pi - 0.42, 21.0),      # "bem próxima ao centro"
    'corvo': (math.pi + 0.7, 22.5),
    'harpia': (-math.pi / 2 - 0.15, 22.0),
    'papagaio': (math.pi / 2 + 0.05, 23.5),  # a mais espaçosa
    'pomba': (math.pi - 1.25, 33.0),       # a mais distante da porteira, sem sangue
}
FRONT = {}
for nm, (a, r) in TENTS.items():
    x, z = at(a, r)
    big = nm == 'papagaio'
    o = tent(f'tent_{nm}', W=5.6 if big else 4.0, D=6.0 if big else 4.6, H=3.4 if big else 2.9, mat='tent_grey' if nm == 'pomba' else 'tent', big=big)
    _move(o, (x, 0, z), face_center(x, z) + math.pi)
    FRONT[nm] = at(a, r - 3.4)  # o chão na frente da barraca
    if nm != 'pomba':
        blood(f'tent_{nm}', *at(a + random.uniform(-0.05, 0.05), r - 3.4), random.uniform(0.6, 1.0))

# CORVO: a cabeça na estaca e o grande SÍMBOLO DE SANGUE de madeira encostado na barraca
fx, fz = FRONT['corvo']
head_on_stake('head_corvo', (fx + 0.8, 0, fz))
a = TENTS['corvo'][0]
sx_, sz_ = at(a, TENTS['corvo'][1] - 1.9)
P = [box('sym_v', (0, 1.25, 0), (0.16, 2.5, 0.1), M['plank']), box('sym_mid', (0, 1.25, 0), (1.9, 0.18, 0.1), M['plank']),
     box('sym_low', (0, 0.25, 0), (1.6, 0.16, 0.1), M['plank'])]
_move(join_objs(P, 'corvoSymbol'), (sx_ - 1.4, 0, sz_), face_center(sx_, sz_) + math.pi)
for k in range(4):  # as anotações espalhadas
    box(f'corvoNote{k}', (fx + random.uniform(-1.2, 1.2), 0.012, fz + random.uniform(-0.8, 0.8)), (0.22, 0.004, 0.3), M['paper'], rot_y=random.uniform(0, TAU))

# CORUJA: a cabeça, a lamparina e os barris com a estátua do Serafim em cima
fx, fz = FRONT['coruja']
head_on_stake('head_coruja', (fx - 0.9, 0, fz), hair=True)
lantern('lamp_coruja', (fx - 0.3, 0, fz + 0.3))
bx, bz = at(TENTS['coruja'][0] + 0.12, TENTS['coruja'][1] - 1.6)
barrel('barrel_cor1', (bx, 0, bz))
barrel('barrel_cor2', (bx + 0.75, 0, bz + 0.2))
seraph('seraph_cor', (bx, 1.0, bz), s=0.55)
for k in range(3):
    box(f'corujaSeal{k}', (fx + random.uniform(-1, 1), 0.012, fz + random.uniform(-0.6, 0.6)), (0.3, 0.004, 0.3), M['blood'], rot_y=random.uniform(0, TAU))

# HARPIA: o braço cravado na própria garra (o tridente), a cabeça da Suellen e o caixote de mesa com os papéis
fx, fz = FRONT['harpia']
P = [strut('harpia_shaft', (fx, 0, fz), (fx, 2.1, fz), 0.035, M['iron'], seg=5)]
for k, dx in enumerate((-0.16, 0, 0.16)):
    P.append(strut(f'harpia_prong{k}', (fx + dx * 0.4, 2.05, fz), (fx + dx, 2.5, fz), 0.02, M['iron'], seg=4, r2=0.005))
P.append(strut('harpia_arm', (fx, 2.0, fz), (fx + 0.05, 1.3, fz + 0.04), 0.07, M['skin'], seg=7, r2=0.06))
P.append(sphere('harpia_hand', (fx + 0.05, 1.22, fz + 0.04), (0.08, 0.1, 0.06), M['skin'], seg=7, rings=5))
P.append(strut('harpia_drip', (fx, 1.95, fz), (fx, 0.1, fz), 0.03, M['blood_wet'], seg=4))
join_objs(P, 'harpiaClaw')
head_on_stake('head_suellen', (fx + 1.0, 0, fz + 0.3))
cx_, cz_ = fx - 1.2, fz - 0.2
box('harpiaCrate', (cx_, 0.35, cz_), (0.8, 0.7, 0.6), M['crate'], rot_y=0.4)
for k in range(3):
    box(f'harpiaDoc{k}', (cx_ + random.uniform(-0.2, 0.2), 0.71 + k * 0.003, cz_ + random.uniform(-0.15, 0.15)), (0.22, 0.003, 0.3), M['paper'], rot_y=random.uniform(0, TAU))

# PAPAGAIO: a cabeça e os panfletos da PSIKOLERA espalhados dentro e fora
fx, fz = FRONT['papagaio']
head_on_stake('head_papagaio', (fx + 0.4, 0, fz - 0.9))
for k in range(12):
    box(f'flyer{k}', (fx + random.uniform(-2.4, 2.4), 0.012, fz + random.uniform(-2.0, 1.4)), (0.21, 0.004, 0.3), M['flyer'], rot_y=random.uniform(0, TAU))
barrel('barrel_pap', (fx - 2.4, 0, fz - 0.6))

# POMBA: a mesinha com as anotações, a garrafa térmica e a lamparina; sem sangue
fx, fz = FRONT['pomba']
P = [box('pombaTable', (0, 0.7, 0), (1.1, 0.06, 0.7), M['plank'])]
for sx in (-1, 1):
    for sz in (-1, 1):
        P.append(box(f'pombaLeg{sx}{sz}', (sx * 0.48, 0.35, sz * 0.28), (0.06, 0.7, 0.06), M['plank']))
P.append(cyl('thermos', (-0.3, 0.73, 0.05), 0.07, 0.34, M['thermos'], seg=10))
P.append(box('pombaNotes', (0.15, 0.735, 0), (0.3, 0.01, 0.4), M['paper']))
_move(join_objs(P, 'pombaTable'), (fx, 0, fz), face_center(fx, fz) + math.pi)
lantern('lamp_pomba', (fx + 0.35, 0.73, fz))

# ================================================================ as ESTRUTURAS DE CANO DE FERRO (varais/secadores), barris e caixotes
def frame(name, x, z, rot, w=3.2, h=2.4):
    P = []
    for sx in (-1, 1):
        P.append(cyl(f'{name}_leg{sx}', (sx * w / 2, 0, 0), 0.05, h, M['pipe'], seg=6))
    P.append(cyl(f'{name}_bar', (0, h, 0), 0.05, w, M['pipe'], seg=6, rot_z=math.pi / 2))
    P.append(strut(f'{name}_line', (-w / 2, h - 0.05, 0.02), (w / 2, h - 0.05, 0.02), 0.012, M['rope'], seg=3))
    for k in range(3):  # panos e peles penduradas
        P.append(box(f'{name}_rag{k}', (-0.9 + k * 0.9 + random.uniform(-0.2, 0.2), h - 0.45, 0), (0.45, 0.8, 0.02), M['tent' if k % 2 else 'tent_grey']))
    o = join_objs(P, name)
    _move(o, (x, 0, z), rot)


for k, (a, r) in enumerate(((math.pi - 1.0, 20.0), (math.pi + 1.25, 20.5), (math.pi / 2 - 0.6, 20.5), (-math.pi / 2 + 0.55, 20.0))):
    x, z = at(a, r)
    frame(f'frame{k}', x, z, face_center(x, z) + math.pi / 2)
# OBSTÁCULO dentro do pátio: a pilha de barris e caixotes (os mantimentos)
OX, OZ = -10.5, 6.5
barrel('supB1', (OX, 0, OZ))
barrel('supB2', (OX + 0.85, 0, OZ - 0.3))
barrel('supB3', (OX + 0.4, 1.0, OZ - 0.15), h=0.9, r=0.34)
box('supC1', (OX - 0.9, 0.4, OZ + 0.5), (0.85, 0.8, 0.85), M['crate'], rot_y=0.3)
box('supC2', (OX - 0.8, 1.15, OZ + 0.45), (0.7, 0.7, 0.7), M['crate'], rot_y=0.7)
col_cyl('supplies', (OX, 0, OZ), 1.5, 1.9)
# outro obstáculo: a carroça de mão tombada com as tábuas (o outro lado)
WX, WZ = 11.0, -6.5
P = [box('cart_bed', (0, 0.55, 0), (1.4, 0.12, 2.2), M['plank']), box('cart_sideL', (-0.68, 0.8, 0), (0.06, 0.5, 2.2), M['plank']),
     box('cart_sideR', (0.68, 0.8, 0), (0.06, 0.5, 2.2), M['plank']), cyl('cart_wheel', (0.85, 0.5, 0.4), 0.5, 0.08, M['plank'], seg=12, rot_z=math.pi / 2),
     box('cart_handle', (0, 0.45, 1.6), (0.9, 0.06, 1.2), M['plank'], rot_x=-0.3)]
_move(join_objs(P, 'cart'), (WX, 0, WZ), 0.6)
col_box('cart', (WX, 0.6, WZ), (2.0, 1.2, 2.8), rot_y=0.6)
blood('cart', WX - 1.2, WZ + 1.6, 0.7)
# lanternas pelo pátio e caixotes soltos
for k, (a, r) in enumerate(((0.9, 16.5), (-1.1, 17.0), (2.4, 17.2), (-2.6, 16.8))):
    lx, lz = at(a, r)
    lantern(f'lamp{k}', (lx, 0, lz))
for k in range(6):
    a = random.uniform(0, TAU)
    x, z = at(a, random.uniform(19, 25))
    box(f'crate{k}', (x, 0.35, z), (0.7, 0.7, 0.7), M['crate'], rot_y=random.uniform(0, TAU))

# ================================================================ a PORTEIRA de madeira na entrada (+z) e a cerca
GZ = 27.5
P = []
for sx in (-1, 1):
    P.append(box(f'gatePost{sx}', (sx * 2.4, 1.0, 0), (0.25, 2.0, 0.25), M['deadwood']))
for k in range(4):
    P.append(box(f'gateRail{k}', (-0.9, 0.35 + k * 0.38, 0.1), (2.8, 0.12, 0.06), M['deadwood']))
P.append(box('gateBrace', (-0.9, 0.95, 0.12), (3.0, 0.1, 0.06), M['deadwood'], rot_z=0.42))
_move(join_objs(P, 'gate'), (0, 0, GZ), math.pi)
for sx in (-1, 1):  # a cerca de mourões e arame dos dois lados
    for k in range(9):
        x = sx * (2.4 + 2.2 * (k + 1))
        z = GZ - k * 0.35 + random.uniform(-0.2, 0.2)
        cyl(f'fencePost{sx}_{k}', (x, 0, z), 0.08, random.uniform(1.2, 1.5), M['deadwood'], seg=5, rot_z=random.uniform(-0.1, 0.1))
        if k:
            px = sx * (2.4 + 2.2 * k)
            for h in (0.6, 1.0):
                strut(f'fenceWire{sx}_{k}_{h}', (px, h, GZ - (k - 1) * 0.35), (x, h, z), 0.01, M['iron'], seg=3)

# ================================================================ as ÁRVORES SECAS, o capim alto (avermelhado de sangue perto do acampamento)
def dead_tree(name, x, z, h):
    base = (x, 0, z)
    top = (x + random.uniform(-0.8, 0.8), h, z + random.uniform(-0.8, 0.8))
    P = [strut(f'{name}_trunk', base, top, 0.24, M['deadwood'], seg=5, r2=0.08)]
    for j in range(6):
        y0 = h * random.uniform(0.35, 0.95)
        t = y0 / h
        p0 = (x + (top[0] - x) * t, y0, z + (top[2] - z) * t)
        ang = random.uniform(0, TAU)
        L = random.uniform(1.5, 3.6)
        p1 = (p0[0] + math.sin(ang) * L, y0 + L * random.uniform(0.5, 1.1), p0[2] + math.cos(ang) * L)
        P.append(strut(f'{name}_br{j}', p0, p1, 0.09, M['deadwood'], seg=4, r2=0.03))
        for i in range(2):
            ang2 = ang + random.uniform(-0.9, 0.9)
            p2 = (p1[0] + math.sin(ang2) * 1.1, p1[1] + random.uniform(0.3, 1.0), p1[2] + math.cos(ang2) * 1.1)
            P.append(strut(f'{name}_tw{j}{i}', p1, p2, 0.035, M['deadwood'], seg=3, r2=0.01))
    join_objs(P, name)


for k in range(46):
    a = random.uniform(0, TAU)
    r = random.uniform(28, 60)
    x, z = at(a, r)
    if math.hypot(x - LAKE_C[0], z - LAKE_C[1]) < LAKE_R + 2:
        continue
    if abs(x) < 4 and z > 20:  # a porteira livre
        continue
    dead_tree(f'dtree{k}', x, z, random.uniform(5, 10))
# duas árvores grandes perto das barracas (a silhueta dos prints)
dead_tree('bigTreeL', -26, -12, 12)
dead_tree('bigTreeR', 25, 4, 11)

GRASS, GRASS_R = Acc(), Acc()
for k in range(620):
    a = random.uniform(0, TAU)
    r = random.uniform(18.6, 30) if random.random() < 0.75 else random.uniform(30, 48)
    x, z = at(a, r)
    if math.hypot(x - LAKE_C[0], z - LAKE_C[1]) < LAKE_R:
        continue
    if abs(x) < 2.6 and z > 24:
        continue
    acc = GRASS_R if (r < 26 and random.random() < 0.35) else GRASS
    for j in range(5):
        bx_, bz_ = x + random.uniform(-0.4, 0.4), z + random.uniform(-0.4, 0.4)
        h = random.uniform(0.6, 1.6)
        ang = random.uniform(0, TAU)
        lean = random.uniform(-0.35, 0.35)
        acc.tri2((bx_ - math.cos(ang) * 0.06, 0, bz_ + math.sin(ang) * 0.06), (bx_ + math.cos(ang) * 0.06, 0, bz_ - math.sin(ang) * 0.06),
                 (bx_ + math.sin(ang) * lean, h, bz_ + math.cos(ang) * lean))
GRASS.done('dryGrass', M['grass'])
GRASS_R.done('bloodGrass', M['grass_red'])
# tufos baixos dentro do pátio (não atrapalham)
TUFT = Acc()
for k in range(140):
    a = random.uniform(0, TAU)
    x, z = at(a, random.uniform(3.2, 17.5))
    for j in range(4):
        bx_, bz_ = x + random.uniform(-0.2, 0.2), z + random.uniform(-0.2, 0.2)
        TUFT.tri2((bx_ - 0.04, 0, bz_), (bx_ + 0.04, 0, bz_), (bx_ + random.uniform(-0.15, 0.15), random.uniform(0.2, 0.45), bz_ + random.uniform(-0.15, 0.15)))
TUFT.done('tufts', M['grass'])

# a LUA DE SANGUE sobre o lago (a variante de noite; a de dia esconde pelo material — cfg.materials)
sphere('moon', (-18, 40, -110), (8, 8, 8), M['moon'], seg=20, rings=12)

finalize(OUT)
