"""
FERRO VELHO — a base dos Couraças (Hexatombe) — public/arenas/ferro_velho.glb. Pedido do dono 2026-11-09 (TODO
"Cenários de luta"); referências em docs/REFERENCIAS-MAPAS.md §1 (wiki "Ferro Velho"/"Couraças"/"Coroa de Espinhos",
os 21 renders "Modelo 3D - Ferro Velho" e os prints de HEX ep. 5, 3h49–4h10):
  - canon: desmanche antigo no FUNDO DE UM CÂNION, descida em ZIGUE-ZAGUE pelo paredão; PORTÃO enorme entre DUAS TORRES
    de observação, protegido por ESTACAS de madeira; dentro, PILHAS DE CARCAÇAS, a GRUA de treliça amarela sempre em
    movimento com a CABINE BLINDADA no alto (onde ficava o Miasma), a OFICINA/GARAGEM e o ABRIGO (quarto de motel
    vermelho com correntes); o F4000 dos Couraças (caminhão com lâmina e espinhos); o grande símbolo de garras pintado
    de vermelho no paredão (arte do ep.); as marcas em X verde-neon nas carcaças (o ritual do X, ep. 5);
  - luz (renders): noite azul de lua cheia sobre o cânion, janelas e lâmpadas vermelhas/âmbar — config FERRO_VELHO.
  - PROPOSTA: o PÁTIO circular entre as pilhas é a arena (r ≈ 18); o tambor de fogo e a pilha de pneus são obstáculos.
Feito à mão (sem kits). Coordenadas do jogo; a câmera começa em +z olhando o portão (-z).
  node tools/blender/build.mjs ferro_velho   → public/arenas/ferro_velho.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import bmesh
from mathutils import Vector
from arena_lib import *
from arena_lib import _obj_from_bmesh, _move
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'ferro_velho.glb'
random.seed(2025)  # Hexatombe
start()

M = {
    'dirt': material('junk_dirt', '#6a4a34', 1),
    'oil': material('oil_stain', '#1a1410', 0.3),
    'rock': material('canyon_rock', '#7a6458', 1),
    'rock2': material('canyon_rock_dark', '#54463f', 1),
    'rust': material('rust_metal', '#6a3a22', 0.85, metal=0.3),
    'sheet': material('corrugated_rust', '#5a4030', 0.85, metal=0.3),
    'red': material('car_red_faded', '#7a2a22', 0.7),
    'blue': material('car_blue_faded', '#2e3e5a', 0.7),
    'white': material('car_white_faded', '#a8a49a', 0.75),
    'olive': material('car_olive', '#4a4a2e', 0.75),
    'tire': material('tire_rubber', '#141414', 0.9),
    'glass': material('glass_dark', '#10141a', 0.2),
    'xneon': material('x_neon', '#7dff5a', 0.4, emission='#5aff3a', strength=3.0),
    'wood': material('wood_dark', '#3a2618', 0.8),
    'stake': material('stake_wood', '#5a4430', 0.9),
    'win_red': material('window_red', '#ff4030', 0.4, emission='#ff2a1a', strength=4.0),
    'bulb': material('bulb_amber', '#ffd090', 0.3, emission='#ffa040', strength=6.0),
    'garage_light': material('garage_glow', '#ffb870', 0.5, emission='#ff9a40', strength=2.2),
    'yellow': material('crane_yellow', '#c89a20', 0.6, metal=0.4),
    'steel': material('steel_dark', '#2a2a2e', 0.5, metal=0.6),
    'chain': material('chain_iron', '#3a3430', 0.5, metal=0.6),
    'claw': material('claw_paint', '#a01810', 0.8, emission='#6a0a06', strength=1.6),
    'moon': material('moon_blue', '#dfe8ff', 0.5, emission='#b8c8ff', strength=2.5),
    'fire': material('barrel_flame', '#ffb060', 0.3, emission='#ff7a20', strength=5.0),
    'bone': material('skull_bone', '#c8bca0', 0.8),
}
R_FIGHT = 18.0
R_WALL = 24.0
GATE = math.pi            # o portão (fundo, -z)
GARAGE = math.pi / 2 + 0.3  # a oficina (direita, um pouco para o fundo)
ABRIGO = -math.pi / 2 - 0.35  # o abrigo vermelho (esquerda)


def at(a, r):
    return math.sin(a) * r, math.cos(a) * r


def face_center(x, z):
    return math.atan2(-x, -z)


def adiff(a, b):
    return abs(math.atan2(math.sin(a - b), math.cos(a - b)))


def strut(name, a, b, r, mat, seg=6):
    """cilindro de a até b (coordenadas do jogo): treliça, cabos, correntes"""
    pa, pb = Vector(B(*a)), Vector(B(*b))
    d = pb - pa
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r, depth=d.length)
    o = _obj_from_bmesh(name, bm, mat)
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    o.location = (pa + pb) / 2
    return o


def rock(name, pos, size, mat, rot_y=0.0, jit=0.18, layers=1):
    """bloco de pedra: caixa subdividida em `layers` estratos, cada anel de vértices deslocado (paredão em camadas)"""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    if layers > 1:
        bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) > 0.5], cuts=layers - 1, use_grid_fill=True)
    w, h, d = size
    shift = {}
    for v in bm.verts:
        lv = round((v.co.z + 0.5) * layers)
        if lv not in shift:
            shift[lv] = (random.uniform(-jit, jit) * w, random.uniform(-jit, jit) * d, 1 + random.uniform(-jit, jit) * 0.6)
        sx, sy, k = shift[lv]
        top = 1 - 0.25 * (v.co.z + 0.5)  # afina para cima
        v.co = Vector((v.co.x * w * k * top + sx, v.co.y * d * k * top + sy, (v.co.z + 0.5) * h))
    o = _obj_from_bmesh(name, bm, mat)
    return place(o, pos, rot_y)


# ================================================================ chão do cânion
cyl('GROUND_dirt', (0, -0.3, -10), 80, 0.3, M['dirt'], seg=64)

# ================================================================ o CÂNION: paredões dos dois lados, fechando lá no fundo
CC, RX, RZ = (0.0, -16.0), 37.0, 60.0
n = 64
for k in range(n):
    t = (k + 0.5) / n * TAU
    x, z = CC[0] + math.sin(t) * RX, CC[1] + math.cos(t) * RZ
    a_in = math.atan2(-(x - CC[0]) / RX ** 2, -(z - CC[1]) / RZ ** 2)
    h = random.uniform(22, 34) if z < 10 else random.uniform(12, 18)  # mais baixo atrás da câmera
    rock(f'cliff{k}', (x, -1, z), (random.uniform(9, 12), h, random.uniform(8, 11)), M['rock' if k % 3 else 'rock2'], rot_y=a_in + random.uniform(-0.15, 0.15), jit=0.12, layers=random.randint(4, 7))
    # estratos: blocos menores na frente, no pé do paredão
    if random.random() < 0.7:
        xi, zi = x + math.sin(a_in) * 4, z + math.cos(a_in) * 4
        rock(f'cliffFoot{k}', (xi, -0.5, zi), (random.uniform(4, 7), random.uniform(2.5, 6), random.uniform(3, 5)), M['rock2' if k % 2 else 'rock'], rot_y=random.uniform(0, TAU), jit=0.2, layers=2)

# a DESCIDA EM ZIGUE-ZAGUE pelo paredão da direita (a estrada de terra que leva ao portão)
ZX = 29.0
for k in range(4):
    y0 = 3.5 + k * 5.0
    dirz = 1 if k % 2 == 0 else -1
    L = 16.0
    zc = -22.0
    ang = math.atan2(5.0, L) * dirz
    box(f'ramp{k}', (ZX - k * 0.15, y0 + 2.5, zc), (3.4, 0.6, L), M['rock2'], rot_x=ang)
    for j in range(5):  # mourões de madeira na beira
        zz = zc - L / 2 + j * L / 4
        cyl(f'rampPost{k}_{j}', (ZX - 1.6, y0 + 2.5 - (zz - zc) * 5.0 / L * dirz, zz), 0.07, 1.1, M['stake'], seg=5)
    box(f'rampRock{k}', (ZX + 2.2, y0, zc), (2.5, 5.5, L + 2), M['rock'])

# o SÍMBOLO DE GARRAS pintado de vermelho no paredão do fundo, acima do portão (arte do HEX ep. 7 / renders 3 e 12)
SZ = -72.0
SY = 19.0
nseg = 28
for k in range(nseg):  # o círculo
    a = k / nseg * TAU
    box(f'clawRing{k}', (math.sin(a) * 7.0, SY + math.cos(a) * 7.0, SZ + 4.6), (1.65, 1.0, 0.2), M['claw'], rot_z=-a)
# as três GARRADAS: arcos curvos em diagonal, grossos em cima e finos na ponta (como um rasgo de unha)
for s, off in enumerate((-3.2, 0.0, 3.2)):
    pts = []
    for j in range(9):
        u = j / 8
        t = math.radians(200 + u * 70)  # arco de um círculo grande, centro acima e à direita
        pts.append((off + 9 * math.cos(t) + 6.5, SY + 9 * math.sin(t) + 5.0))
    for j in range(8):
        (xa, ya), (xb, yb) = pts[j], pts[j + 1]
        w = 1.7 * (1 - j / 9) + 0.15
        box(f'claw{s}_{j}', ((xa + xb) / 2, (ya + yb) / 2, SZ + 4.7), (w, math.hypot(xb - xa, yb - ya) + 0.35, 0.2), M['claw'], rot_z=-math.atan2(xb - xa, yb - ya))
# a LUA cheia sobre o cânion (perto o bastante para a névoa deixar ver)
sphere('moon', (-18, 52, -88), (7, 7, 7), M['moon'], seg=24, rings=14)

# ================================================================ a MURALHA de chapas e as ESTACAS
nw = 44
for k in range(nw):
    a = (k + 0.5) / nw * TAU
    if adiff(a, GATE) < 0.2 or adiff(a, GARAGE) < 0.24 or adiff(a, ABRIGO) < 0.2:
        continue
    x, z = at(a, R_WALL)
    h = random.uniform(3.4, 4.6)
    box(f'sheet{k}', (x, h / 2, z), (R_WALL * TAU / nw * 1.08, h, 0.14), M['sheet'], rot_y=a, rot_z=random.uniform(-0.05, 0.05))
    box(f'sheetPost{k}', (x * 1.01, h / 2 + 0.2, z * 1.01), (0.16, h + 0.4, 0.16), M['wood'], rot_y=a)
    # as estacas para fora/para cima, na frente da chapa
    for j in (-0.33, 0.33):
        aa = a + j * (TAU / nw)
        sx, sz = at(aa, R_WALL - 0.9)
        cyl(f'stake{k}{j}', (sx, 0, sz), 0.12, 2.6, M['stake'], seg=5, r_top=0.0, rot_y=aa, rot_x=-0.55)

# ================================================================ o PORTÃO entre as DUAS TORRES de observação
gz = -R_WALL
for s in (-1, 1):
    tx = s * 5.6
    for lx in (-1, 1):
        for lz in (-1, 1):
            box(f'towerLeg{s}{lx}{lz}', (tx + lx * 1.3, 4.2, gz + lz * 1.3), (0.28, 8.4, 0.28), M['wood'], rot_x=-lz * 0.04, rot_z=lx * 0.04)
    for yy in (2.8, 5.6):  # travessas em X
        box(f'towerBrace{s}{yy}', (tx, yy, gz + 1.3), (2.8, 0.14, 0.14), M['wood'], rot_z=0.6)
        box(f'towerBraceB{s}{yy}', (tx, yy, gz - 1.3), (2.8, 0.14, 0.14), M['wood'], rot_z=-0.6)
    box(f'towerFloor{s}', (tx, 8.4, gz), (3.4, 0.25, 3.4), M['wood'])
    box(f'towerCabin{s}', (tx, 9.8, gz), (3.0, 2.6, 3.0), M['sheet'])
    for face in range(4):
        fa = face * math.pi / 2
        wx, wz = at(fa, 1.52)
        box(f'towerWin{s}{face}', (tx + wx, 10.1, gz + wz), (1.6, 0.7, 0.06), M['win_red'], rot_y=fa)
    box(f'towerRoof{s}', (tx, 11.25, gz), (3.8, 0.18, 3.8), M['rust'], rot_x=0.08)
    for j in range(8):  # a escada
        box(f'towerLadder{s}{j}', (tx - s * 1.6, 0.5 + j * 1.0, gz + 1.0), (0.06, 0.06, 0.7), M['wood'])
    for lz in (0.7, 1.3):
        box(f'towerLadderRail{s}{lz}', (tx - s * 1.6, 4.0, gz + lz), (0.08, 8.2, 0.08), M['wood'])
    # as folhas do portão: chapas rebitadas, entreabertas
    box(f'gateLeaf{s}', (s * 2.25, 2.6, gz + 0.4 + 0.5), (4.3, 5.2, 0.2), M['rust'], rot_y=s * 0.22)
    for j in range(4):
        box(f'gateBar{s}{j}', (s * 2.25, 0.8 + j * 1.3, gz + 0.62 + 0.5), (4.2, 0.18, 0.08), M['steel'], rot_y=s * 0.22)
    col_box(f'tower{s}', (tx, 2, gz), (3.2, 4, 3.2))
# a viga em cima do portão com a caveira e as correntes
box('gateBeam', (0, 8.6, gz), (14.6, 0.5, 0.5), M['wood'])
sphere('gateSkull', (0, 9.4, gz + 0.3), (0.55, 0.6, 0.55), M['bone'], seg=10, rings=6)
for s in (-1, 1):
    box(f'gateSkullEye{s}', (s * 0.2, 9.5, gz + 0.8), (0.18, 0.16, 0.05), M['win_red'])

# ================================================================ a OFICINA / GARAGEM (direita): galpão aberto, luz quente
GW, GD, GH = 9.0, 7.0, 5.2
P = []
P.append(box('gar_back', (0, GH / 2, -GD / 2), (GW, GH, 0.2), M['sheet']))
for s in (-1, 1):
    P.append(box(f'gar_side{s}', (s * GW / 2, GH / 2, 0), (0.2, GH, GD), M['sheet']))
P.append(box('gar_roof', (0, GH + 0.25, 0), (GW + 0.6, 0.15, GD + 0.8), M['rust'], rot_x=-0.1))
P.append(box('gar_lintel', (0, GH - 0.4, GD / 2), (GW, 0.8, 0.25), M['wood']))
P.append(box('gar_inner', (0, GH / 2, -GD / 2 + 0.15), (GW - 0.4, GH - 0.6, 0.05), M['garage_light']))  # o fundo aceso
P.append(box('gar_bench', (2.6, 0.5, -GD / 2 + 0.8), (3.0, 1.0, 1.0), M['wood']))
P.append(box('gar_engine', (-1.8, 0.6, -1.0), (1.4, 1.1, 1.0), M['steel']))  # o motor novo do Chispa
P.append(cyl('gar_hoist', (-1.8, 0, -1.6), 0.08, GH - 0.3, M['chain'], seg=5))
for j in range(3):
    P.append(cyl(f'gar_tire{j}', (3.6, j * 0.32, 1.5), 0.42, 0.3, M['tire'], seg=12))
garage = join_objs(P, 'garage')
gx, gz2 = at(GARAGE, R_WALL + 1.6)
_move(garage, (gx, 0, gz2), face_center(gx, gz2) + math.pi)
cyl('FLICKER_garageBulb', (gx * 0.93, 4.3, gz2 * 0.93), 0.16, 0.3, M['bulb'], seg=8)

# ================================================================ o ABRIGO (esquerda): o quarto de motel vermelho da Escarlata
P = []
AW, AD, AH = 7.0, 5.5, 4.2
P.append(box('ab_walls', (0, AH / 2, 0), (AW, AH, AD), M['sheet']))
P.append(box('ab_roof', (0, AH + 0.2, 0), (AW + 0.5, 0.2, AD + 0.5), M['rust']))
P.append(box('ab_door', (-1.6, 1.15, AD / 2 + 0.03), (1.1, 2.3, 0.06), M['wood']))
for j, x in enumerate((0.6, 2.3)):
    P.append(box(f'ab_win{j}', (x, 2.1, AD / 2 + 0.03), (1.2, 1.1, 0.05), M['win_red']))
P.append(box('ab_sign', (0, AH + 0.9, AD / 2 - 0.4), (3.4, 0.9, 0.12), M['win_red']))  # o letreiro de motel aceso
abrigo = join_objs(P, 'abrigo')
ax, az = at(ABRIGO, R_WALL + 2.0)
_move(abrigo, (ax, 0, az), face_center(ax, az) + math.pi)
# correntes penduradas na frente
for j in range(4):
    cx, cz = at(ABRIGO + (j - 1.5) * 0.06, R_WALL - 0.3)
    strut(f'abChain{j}', (cx, 4.4, cz), (cx, 2.4 + random.uniform(0, 0.8), cz), 0.05, M['chain'], seg=4)

# ================================================================ a GRUA de treliça (esquerda, ao fundo) e a CABINE BLINDADA pendurada
CR = (-15.0, -34.0)
for s in (-1, 1):  # as esteiras
    box(f'craneTrack{s}', (CR[0] + s * 1.6, 0.6, CR[1]), (1.0, 1.2, 6.0), M['steel'], bevel=0.2)
box('craneBody', (CR[0], 2.2, CR[1]), (3.6, 2.2, 4.4), M['yellow'])
box('craneCab', (CR[0] + 1.2, 3.8, CR[1] + 1.6), (1.4, 1.6, 1.6), M['yellow'])
box('craneCabWin', (CR[0] + 1.2, 3.9, CR[1] + 2.42), (1.1, 0.9, 0.04), M['glass'])
box('craneCounter', (CR[0], 2.6, CR[1] - 2.6), (3.4, 1.6, 1.2), M['steel'])
# a lança: 4 cordas + o zigue-zague, de (base) até a ponta, inclinada para o pátio
L = 24.0
base = Vector((CR[0], 3.4, CR[1] + 1.0))
dirv = Vector((0.42, 0.62, 0.66)).normalized()
side = Vector((1, 0, -0.8)).normalized()
side = (side - dirv * side.dot(dirv)).normalized()
up = dirv.cross(side).normalized()
corners = [side * 0.6 + up * 0.6, side * -0.6 + up * 0.6, side * -0.6 + up * -0.6, side * 0.6 + up * -0.6]
for i, c in enumerate(corners):
    a, b = base + c, base + dirv * L + c * 0.4
    strut(f'boomChord{i}', tuple(a), tuple(b), 0.09, M['yellow'])
NS = 14
for j in range(NS):
    t0, t1 = j / NS, (j + 1) / NS
    for i in range(4):
        c0, c1 = corners[i], corners[(i + 1) % 4]
        k0, k1 = 1 - 0.6 * t0, 1 - 0.6 * t1
        p0 = base + dirv * L * t0 + c0 * k0
        p1 = base + dirv * L * t1 + c1 * k1
        strut(f'boomLace{j}_{i}', tuple(p0), tuple(p1), 0.05, M['yellow'], seg=4)
tip = base + dirv * L
# o cabo de sustentação até a traseira
strut('craneStay', tuple(tip), (CR[0], 6.0, CR[1] - 2.6), 0.05, M['chain'], seg=4)
# a cabine blindada do Miasma, pendurada na ponta (SWAY_: balança devagar)
CH = 6.0
P = []
P.append(strut('cage_cable', (0, 0, 0), (0, -CH + 1.6, 0), 0.06, M['chain'], seg=4))
P.append(box('cage_box', (0, -CH, 0), (2.4, 3.0, 2.4), M['rust'], bevel=0.08))
for face in range(4):
    fa = face * math.pi / 2
    wx, wz = at(fa, 1.22)
    P.append(box(f'cage_slit{face}', (wx, -CH + 0.6, wz), (1.4, 0.18, 0.05), M['win_red'], rot_y=fa))
    P.append(box(f'cage_plate{face}', (wx * 1.02, -CH - 0.5, wz * 1.02), (2.2, 1.0, 0.06), M['steel'], rot_y=fa))
cage = rebase(join_objs(P, 'SWAY_cage'))
cage.location = tuple(tip)

# ================================================================ o F4000 dos Couraças (estacionado no pátio, à direita do portão)
P = []
P.append(box('f4_chassis', (0, 0.75, 0), (2.0, 0.4, 6.2), M['steel']))
P.append(box('f4_cab', (0, 1.75, 1.7), (2.2, 1.6, 1.8), M['olive'], bevel=0.06))
P.append(box('f4_wind', (0, 2.1, 2.62), (1.9, 0.7, 0.05), M['glass']))
P.append(box('f4_hood', (0, 1.25, 3.0), (2.0, 0.7, 1.0), M['olive']))
P.append(box('f4_bed', (0, 1.25, -1.2), (2.3, 0.15, 3.8), M['wood']))
for s in (-1, 1):
    P.append(box(f'f4_bedSide{s}', (s * 1.12, 1.65, -1.2), (0.08, 0.7, 3.8), M['rust']))
P.append(box('f4_plow', (0, 0.9, 3.9), (2.8, 1.1, 0.18), M['rust'], rot_x=-0.25))  # a lâmina
for j in range(5):  # espinhos na lâmina, no capô e na caçamba
    x = -1.1 + j * 0.55
    P.append(cyl(f'f4_spikeP{j}', (x, 0.9, 4.0), 0.07, 0.6, M['steel'], seg=5, r_top=0.0, rot_x=math.pi / 2))
    P.append(cyl(f'f4_spikeB{j}', (x * 0.9, 2.0, -3.0 + j * 0.0), 0.06, 0.7, M['steel'], seg=5, r_top=0.0))
for s in (-1, 1):
    for wz in (2.1, -0.9, -2.3):
        P.append(cyl(f'f4_wheel{s}{wz}', (s * 1.0, 0.55, wz), 0.55, 0.42, M['tire'], seg=14, rot_z=s * math.pi / 2))
    P.append(box(f'f4_light{s}', (s * 0.75, 1.35, 3.52), (0.3, 0.2, 0.05), M['bulb']))
truck = join_objs(P, 'f4000')
_move(truck, (15.2, 0, -11.0), 0.0)
col_box('f4000', (15.2, 1.5, -10.6), (2.8, 3, 8.2))


# ================================================================ CARCAÇAS DE CARRO empilhadas
def side_prism(name, prof, width, mat):
    """prisma pelo PERFIL lateral [(z, y), ...] extrudado na largura (x): a lataria e a cabine dos carros"""
    bm = bmesh.new()
    L = [bm.verts.new((-width / 2, -z, y)) for z, y in prof]
    R = [bm.verts.new((width / 2, -z, y)) for z, y in prof]
    bm.faces.new(L)
    bm.faces.new(list(reversed(R)))
    for i in range(len(prof)):
        j = (i + 1) % len(prof)
        bm.faces.new([L[i], L[j], R[j], R[i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _obj_from_bmesh(name, bm, mat)


def car(name, paint, crushed=1.0, wheels=True, xmark=False):
    """sedã velho: lataria com capô e porta-malas mais baixos, cabine trapezoidal com vidros escuros, para-choques,
    faróis; `crushed` amassa a altura (as carcaças de baixo da pilha); frente em +z"""
    P = []
    k = crushed
    yb, hb = 0.32, 0.5 * k          # soleira e altura da lataria
    P.append(side_prism(f'{name}_body', [(-2.15, yb), (2.15, yb), (2.2, yb + hb * 0.8), (1.0, yb + hb), (-1.9, yb + hb), (-2.2, yb + hb * 0.75)], 1.8, paint))
    yc = yb + hb
    hc = 0.55 * k
    cab = [(-1.35, yc), (0.95, yc), (0.35, yc + hc), (-0.95, yc + hc)]
    P.append(side_prism(f'{name}_cab', cab, 1.56, paint))
    if k > 0.6:  # os vidros (um pouco para fora da cabine)
        P.append(side_prism(f'{name}_win', [(-1.25, yc + 0.06), (0.85, yc + 0.06), (0.33, yc + hc - 0.07), (-0.9, yc + hc - 0.07)], 1.6, M['glass']))
    for zz in (2.2, -2.22):
        P.append(box(f'{name}_bumper{zz}', (0, yb + 0.12, zz), (1.85, 0.16, 0.12), M['steel']))
    for sx in (-1, 1):
        P.append(box(f'{name}_head{sx}', (sx * 0.65, yb + hb * 0.62, 2.21), (0.34, 0.16, 0.04), M['white']))
        P.append(box(f'{name}_tail{sx}', (sx * 0.7, yb + hb * 0.62, -2.23), (0.3, 0.12, 0.04), M['red']))
        for wz in (1.35, -1.35):  # a caixa de roda escura
            P.append(box(f'{name}_arch{sx}{wz}', (sx * 0.9, yb + 0.12, wz), (0.03, 0.42, 0.95), M['tire']))
    if random.random() < 0.6:  # uma mancha de ferrugem no capô ou na porta
        P.append(box(f'{name}_rust', (0.91 if random.random() < 0.5 else -0.91, yb + hb * 0.5, random.uniform(-1, 1)), (0.03, hb * 0.6, 0.9), M['rust']))
    if wheels:
        for sx in (-1, 1):
            for wz in (1.35, -1.35):
                if random.random() < 0.8:
                    P.append(cyl(f'{name}_w{sx}{wz}', (sx * 0.72, 0.33, wz), 0.33, 0.2, M['tire'], seg=12, rot_z=sx * math.pi / 2))
    if xmark:  # o X verde-neon do ritual (HEX ep. 5), pintado na porta
        for d in (-1, 1):
            P.append(box(f'{name}_x{d}', (0.915, yb + hb * 0.55, -0.2), (0.02, 0.08, 1.0), M['xneon'], rot_x=d * 0.5))
    o = join_objs(P, name)
    return rebase(o)


PAINTS = ['red', 'blue', 'white', 'olive', 'rust', 'red', 'white']


def pile(name, x, z, n, yaw):
    y = 0.0
    for i in range(n):
        crushed = random.uniform(0.45, 0.75) if i < n - 1 else random.uniform(0.6, 1.0)
        c = car(f'{name}_{i}', M[random.choice(PAINTS)], crushed, wheels=i == n - 1 or random.random() < 0.3, xmark=random.random() < 0.18)
        c.location = B(x + random.uniform(-0.4, 0.4), y, z + random.uniform(-0.4, 0.4))
        c.rotation_euler = (random.uniform(-0.06, 0.06), random.uniform(-0.06, 0.06), yaw + random.uniform(-0.5, 0.5))
        y += 0.35 + 0.7 * crushed + 0.2
    return y


np_ = 26
for k in range(np_):
    a = (k + 0.5) / np_ * TAU + random.uniform(-0.05, 0.05)
    if adiff(a, GATE) < 0.32 or adiff(a, GARAGE) < 0.3 or adiff(a, ABRIGO) < 0.24:
        continue
    near_cam = adiff(a, 0.0) < 0.9
    r = random.uniform(20.3, 22.0)
    x, z = at(a, r)
    n = random.randint(1, 2) if near_cam else random.randint(2, 4)
    pile(f'pile{k}', x, z, n, a + math.pi / 2)
# uma segunda fileira mais alta, atrás da muralha (a fortaleza de sucata)
for k in range(30):
    a = (k + 0.5) / 30 * TAU
    if adiff(a, GATE) < 0.4 or adiff(a, 0.0) < 1.0:
        continue
    x, z = at(a, random.uniform(26.5, 30))
    pile(f'back{k}', x, z, random.randint(3, 5), a + random.uniform(0, 1))

# ================================================================ dentro do pátio: um carro tombado, a pilha de pneus, tambores
wreck = car('wreck', M['blue'], 0.8, wheels=True, xmark=True)
wreck.location = B(-15.3, 0.9, 5.2)
wreck.rotation_euler = (0, math.pi / 2, 0)  # de lado (no jogo: tombado sobre o lado esquerdo), comprido em z
col_box('wreck', (-15.3, 1, 5.2), (1.9, 2, 4.4))
for j in range(5):  # pneus empilhados
    cyl(f'tireStack{j}', (-12.6, j * 0.3, -9.0), 0.48, 0.28, M['tire'], seg=14)
for j in range(2):
    cyl(f'tireStackB{j}', (-11.6, j * 0.3, -9.7), 0.48, 0.28, M['tire'], seg=14)
col_cyl('tires', (-12.2, 0, -9.3), 1.15, 1.5)
for j, (x, z) in enumerate(((9.5, -16.2), (10.4, -16.6), (9.9, -17.3), (-7.6, 16.8), (-8.4, 16.4))):
    cyl(f'drum{j}', (x, 0, z), 0.32, 0.9, M['rust' if j % 2 else 'red'], seg=12)
col_cyl('drumsA', (10.0, 0, -16.7), 1.1, 1)
# o tambor de fogo (aquece a noite no cânion) — o fogo é do jogo (cfg.fires)
FB = (11.0, 11.5)
cyl('fireBarrel', (FB[0], 0, FB[1]), 0.36, 0.95, M['rust'], seg=12)
col_cyl('fireBarrel', (FB[0], 0, FB[1]), 0.55, 1.2)

# ================================================================ os POSTES com as lâmpadas penduradas
LAMPS = []
for k in range(7):
    a = (k + 0.5) / 7 * TAU + 0.2
    if adiff(a, GATE) < 0.3:
        continue
    x, z = at(a, 19.6)
    cyl(f'lampPole{k}', (x, 0, z), 0.13, 5.2, M['wood'], seg=6)
    ix, iz = at(a, 18.8)
    box(f'lampArm{k}', ((x + ix) / 2, 5.0, (z + iz) / 2), (0.1, 0.1, 1.0), M['wood'], rot_y=a)
    strut(f'lampWire{k}', (ix, 5.0, iz), (ix, 4.35, iz), 0.015, M['chain'], seg=4)
    sphere(f'FLICKER_lamp{k}', (ix, 4.2, iz), (0.17, 0.2, 0.17), M['bulb'], seg=8, rings=6)
    col_cyl(f'lampPole{k}', (x, 0, z), 0.3, 5)
    LAMPS.append((round(ix, 2), 4.1, round(iz, 2)))
print('LAMPS', LAMPS)

finalize(OUT)
