"""
CIRCO DOS PSIKOLERA (o antigo Circo dos Irmãos Davo, Hexatombe) — public/arenas/circo.glb. Pedido do dono 2026-11-09
(TODO "Cenários de luta"); referências em docs/REFERENCIAS-MAPAS.md §2 (wiki "Circo dos Irmãos Davo"/"PSIKOLERA" e os
prints de HEX ep. 4, 3h18–3h55):
  - canon: circo itinerante "Show do Diabo" parado na Coroa de Espinhos, virado base da banda; a LONA listrada com a
    ENTRADA em CARA DE DEMÔNIO (chifres vermelhos, olhos amarelos, nariz xadrez, a boca com presas é a porta); as
    BARRACAS DE JOGOS em fila (dardos, tiro aos patos, basquete) e a tenda da LEITURA DE MÃO; os CANHÕES coloridos,
    o MEDIDOR DE FORÇA, o muro com arame farpado; o letreiro azul quebrado "CIRCO DOS IÃS D"; bandeirolas e cordões de
    lâmpadas entre os postes; caatinga seca, árvores mortas e paredões de arenito no horizonte;
  - luz: dia de sol, céu azul — a única arena de dia (config CIRCO).
  - PROPOSTA: o PÁTIO entre a lona, as barracas e os canhões é a arena (r ≈ 18); um canhão e uma pilha de pedestais de
    picadeiro são os obstáculos.
Feito à mão (sem kits). Coordenadas do jogo; a câmera começa em +z olhando a lona (-z).
  node tools/blender/build.mjs circo   → public/arenas/circo.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import bmesh
from mathutils import Vector
from arena_lib import *
from arena_lib import _obj_from_bmesh, _move
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'circo.glb'
random.seed(1960)  # o Show do Diabo, anos 60
start()

M = {
    'sand': material('circus_sand', '#c8a878', 1),
    'sandstone': material('sandstone', '#b48a62', 1),
    'sandstone2': material('sandstone_dark', '#8a6448', 1),
    'tent_a': material('tent_red', '#7a2a1e', 0.9),
    'tent_b': material('tent_cream', '#c2ad86', 0.9),
    'facade': material('facade_planks', '#8a2418', 0.85),
    'horn': material('horn_red', '#c4301c', 0.7),
    'eye': material('eye_yellow', '#d8a830', 0.6),
    'dark': material('paint_black', '#16100c', 0.8),
    'fang': material('fang_white', '#e8e0cc', 0.5),
    'checker': material('checker_board', '#d8c890', 0.6),
    'mouth': material('mouth_glow', '#c86a28', 0.8, emission='#a04010', strength=0.9),
    'star': material('star_yellow', '#e0b030', 0.6),
    'red': material('stall_red', '#a82a1e', 0.75),
    'blue': material('stall_blue', '#2a4ab0', 0.75),
    'yellow': material('stall_yellow', '#d8a028', 0.75),
    'green': material('stall_green', '#3a6a3a', 0.8),
    'curtain': material('curtain_stripes', '#2e2620', 0.95),
    'wood': material('wood_plank', '#6a4a30', 0.85),
    'deadwood': material('dead_wood', '#3a3028', 0.95),
    'pole': material('pole_metal', '#7a7a76', 0.5, metal=0.6),
    'rope': material('rope', '#8a7050', 0.95),
    'flag_a': material('flag_dark', '#1c1418', 0.9),
    'flag_b': material('flag_red', '#8a1a14', 0.9),
    'flag_c': material('flag_cream', '#c8b890', 0.9),
    'bulb': material('bulb_warm', '#fff0c0', 0.3, emission='#ffd890', strength=1.5),
    'cannon': material('cannon_stars', '#8a2a1e', 0.6, metal=0.2),
    'cyellow': material('cannon_yellow', '#d8b020', 0.55, metal=0.2),
    'cblue': material('cannon_blue', '#2a3a8a', 0.6),
    'white': material('drum_white', '#d8d0c0', 0.7),
    'brick': material('brick_red', '#8a3a2a', 0.9),
    'wire': material('barbed_wire', '#4a4a48', 0.5, metal=0.7),
    'grass': material('dry_grass', '#9a8a60', 1),
    'leaf': material('caatinga_leaf', '#4a5a30', 0.95),
    'concrete': material('concrete', '#7a7a74', 0.95),
    'sign': material('sign_blue', '#2a50c0', 0.8),
    'gold': material('sign_gold', '#e0a838', 0.6),
    'ball': material('ball_yellow', '#e0c040', 0.6),
    'moon': material('moon_blood', '#ff7a5a', 0.5, emission='#ff2a10', strength=2.5),  # só na variante de noite (some de dia)
    'crystal': material('crystal_ball', '#b080ff', 0.2, emission='#8040ff', strength=1.5),
}
R_FIGHT = 18.0
FAC_Z = -24.0             # a frente da fachada de demônio
TENT_C, TENT_R = (0.0, -38.0), 14.0


def at(a, r):
    return math.sin(a) * r, math.cos(a) * r


def face_center(x, z):
    return math.atan2(-x, -z)


def adiff(a, b):
    return abs(math.atan2(math.sin(a - b), math.cos(a - b)))


def strut(name, a, b, r, mat, seg=6):
    """cilindro de a até b (coordenadas do jogo): cabos, galhos, mastros"""
    pa, pb = Vector(B(*a)), Vector(B(*b))
    d = pb - pa
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r, depth=d.length)
    o = _obj_from_bmesh(name, bm, mat)
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    o.location = (pa + pb) / 2
    return o


def front_prism(name, prof, depth, mat, z=0.0):
    """prisma pelo PERFIL frontal [(x, y), ...] extrudado em z (de z - depth até z): placas, chifres, estrelas"""
    bm = bmesh.new()
    F = [bm.verts.new((x, -z, y)) for x, y in prof]
    Bk = [bm.verts.new((x, -(z - depth), y)) for x, y in prof]
    bm.faces.new(F)
    bm.faces.new(list(reversed(Bk)))
    for i in range(len(prof)):
        j = (i + 1) % len(prof)
        bm.faces.new([F[i], F[j], Bk[j], Bk[i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _obj_from_bmesh(name, bm, mat)


def ellipse(c, rx, ry, tilt, n=16):
    cx, cy = c
    pts = []
    for i in range(n):
        t = i / n * TAU
        x, y = rx * math.cos(t), ry * math.sin(t)
        pts.append((cx + x * math.cos(tilt) - y * math.sin(tilt), cy + x * math.sin(tilt) + y * math.cos(tilt)))
    return pts


def star_prof(c, r, k=0.45):
    return [(c[0] + math.sin(i * math.pi / 5) * (r if i % 2 == 0 else r * k), c[1] + math.cos(i * math.pi / 5) * (r if i % 2 == 0 else r * k)) for i in range(10)]


def rock(name, pos, size, mat, rot_y=0.0, jit=0.18, layers=1, taper=0.25):
    """bloco de pedra em estratos (os paredões de arenito do horizonte)"""
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
        top = 1 - taper * (v.co.z + 0.5)
        v.co = Vector((v.co.x * w * k * top + sx, v.co.y * d * k * top + sy, (v.co.z + 0.5) * h))
    o = _obj_from_bmesh(name, bm, mat)
    return place(o, pos, rot_y)


# ---------------------------------------------------------------- malhas acumuladas (bandeirolas, capim): um objeto só
class Acc:
    def __init__(self):
        self.bm = bmesh.new()

    def tri2(self, a, b, c):
        """triângulo com as duas faces (bandeirola, folha de capim)"""
        va = [self.bm.verts.new(B(*p)) for p in (a, b, c)]
        self.bm.faces.new(va)
        vb = [self.bm.verts.new(B(*p)) for p in (c, b, a)]
        self.bm.faces.new(vb)

    def done(self, name, mat):
        return _obj_from_bmesh(name, self.bm, mat)


FLAGS = [Acc(), Acc(), Acc()]
FLAG_MATS = ['flag_a', 'flag_b', 'flag_c']


def catenary(a, b, sag, n):
    pts = []
    for i in range(n + 1):
        t = i / n
        pts.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t))
    return pts


def bunting(name, a, b, sag=1.0, flags=True, bulbs=False, palette=(0, 1)):
    """cordão entre dois pontos: bandeirolas triangulares e/ou lâmpadas"""
    L = math.dist(a, b)
    n = max(4, int(L / 1.2))
    pts = catenary(a, b, sag, n)
    for i in range(n):
        strut(f'{name}_w{i}', pts[i], pts[i + 1], 0.02, M['rope'], seg=4)
    if flags:
        m = max(6, int(L / 0.75))
        fp = catenary(a, b, sag, m)
        for i in range(m):
            p, q = fp[i], fp[i + 1]
            mid = ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 0.5, (p[2] + q[2]) / 2)
            FLAGS[palette[i % len(palette)]].tri2(p, q, mid)
    if bulbs:
        for i in range(1, n, 2):
            p = pts[i]
            sphere(f'{name}_b{i}', (p[0], p[1] - 0.14, p[2]), (0.08, 0.11, 0.08), M['bulb'], seg=6, rings=4)


# ================================================================ chão de terra clara
cyl('GROUND_sand', (0, -0.3, -10), 120, 0.3, M['sand'], seg=64)

# ================================================================ a LONA listrada (fundo, -z)
def tent_ring(name, c, r0, y0, r1, y1, n, parity, mat):
    bm = bmesh.new()
    for i in range(n):
        if i % 2 != parity:
            continue
        a0, a1 = i / n * TAU, (i + 1) / n * TAU
        vs = [bm.verts.new(B(c[0] + math.sin(a) * r, y, c[1] + math.cos(a) * r)) for a, r, y in ((a0, r0, y0), (a1, r0, y0), (a1, r1, y1), (a0, r1, y1))]
        bm.faces.new(vs)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _obj_from_bmesh(name, bm, mat)


NT = 32
for par, mk in ((0, 'tent_a'), (1, 'tent_b')):
    tent_ring(f'tentWall{par}', TENT_C, TENT_R, 0, TENT_R, 6.5, NT, par, M[mk])
    tent_ring(f'tentRoof{par}', TENT_C, TENT_R + 0.6, 6.3, 3.0, 13.5, NT, par, M[mk])
    tent_ring(f'tentCap{par}', TENT_C, 3.0, 13.5, 0.4, 15.8, NT, par, M[mk])
# a saia recortada na borda do telhado
for i in range(NT):
    a = (i + 0.5) / NT * TAU
    x, z = TENT_C[0] + math.sin(a) * (TENT_R + 0.65), TENT_C[1] + math.cos(a) * (TENT_R + 0.65)
    FLAGS[2 if i % 2 else 1].tri2((x - math.cos(a) * 1.4, 6.3, z + math.sin(a) * 1.4), (x + math.cos(a) * 1.4, 6.3, z - math.sin(a) * 1.4), (x, 5.4, z))
cyl('tentMast', (TENT_C[0], 0, TENT_C[1]), 0.25, 20, M['pole'], seg=8)
MAST_TOP = (TENT_C[0], 19.5, TENT_C[1])
box('tentFlag', (TENT_C[0] + 1.1, 19.3, TENT_C[1]), (2.0, 1.2, 0.05), M['green'])
# o pórtico de ferro em volta do topo (os quatro mastros com os cabos)
for k, (sx, sz) in enumerate(((-1, -1), (1, -1), (-1, 1), (1, 1))):
    px, pz = TENT_C[0] + sx * 9, TENT_C[1] + sz * 9
    cyl(f'tentPost{k}', (px, 0, pz), 0.18, 17, M['pole'], seg=6)
    strut(f'tentStay{k}', (px, 17, pz), MAST_TOP, 0.04, M['rope'], seg=4)
strut('tentFrameA', (TENT_C[0] - 9, 17, TENT_C[1] + 9), (TENT_C[0] + 9, 17, TENT_C[1] + 9), 0.1, M['pole'])
strut('tentFrameB', (TENT_C[0] - 9, 17, TENT_C[1] - 9), (TENT_C[0] + 9, 17, TENT_C[1] - 9), 0.1, M['pole'])

# ================================================================ a ENTRADA: a CARA DE DEMÔNIO (o tapume pintado na frente da lona)
FW, FH = 13.0, 10.0
FZ = FAC_Z
box('facadeBoard', (0, FH / 2, FZ - 0.35), (FW, FH, 0.7), M['facade'])
for s in (-1, 1):  # os escoramentos de trás
    strut(f'facadeBrace{s}', (s * 5, FH - 1, FZ - 0.7), (s * 5, 0, FZ - 6), 0.15, M['wood'])
    # os CHIFRES vermelhos (de tábua), abrindo para fora
    front_prism(f'horn{s}', [(s * 6.5, FH - 1.2), (s * 3.4, FH - 1.2), (s * 5.2, FH + 2.5), (s * 6.9, FH + 6.2)], 0.35, M['horn'], z=FZ - 0.5)
    # os OLHOS amarelos inclinados e as pupilas pretas
    tilt = 0.45 if s < 0 else -0.45
    front_prism(f'eye{s}', ellipse((s * 2.75, 7.0), 1.25, 2.0, tilt), 0.06, M['eye'], z=FZ + 0.06)
    front_prism(f'pupil{s}', ellipse((s * 2.45, 6.55), 0.55, 1.05, tilt), 0.04, M['dark'], z=FZ + 0.1)
# o NARIZ xadrez
front_prism('nose', [(0, 6.5), (0.85, 5.75), (0, 5.0), (-0.85, 5.75)], 0.06, M['checker'], z=FZ + 0.08)
# a BOCA é a porta: o vão escuro com o fundo aceso (o picadeiro lá dentro), as PRESAS brancas em cima
front_prism('mouthFrame', [(-2.6, 0), (2.6, 0), (2.6, 4.2), (1.2, 4.6), (-1.2, 4.6), (-2.6, 4.2)], 0.05, M['dark'], z=FZ + 0.06)
front_prism('mouthInside', [(-1.9, 0), (1.9, 0), (1.9, 3.2), (-1.9, 3.2)], 0.04, M['mouth'], z=FZ + 0.1)
fangs = [(-3.5, 0.75, 2.4), (-2.3, 0.55, 1.1), (-1.25, 0.5, 0.85), (-0.3, 0.45, 0.7), (0.65, 0.5, 0.85), (1.7, 0.55, 1.1), (3.0, 0.75, 2.4)]
for j, (x, w, h) in enumerate(fangs):
    top = 4.9 - abs(x) * 0.08
    front_prism(f'fang{j}', [(x - w, top), (x + w, top), (x + w * 0.25, top - h)], 0.08, M['fang'], z=FZ + 0.14)
# estrelas amarelas espalhadas no tapume
for j, (x, y, r) in enumerate(((-5.2, 3.6, 0.32), (-4.4, 1.6, 0.38), (-5.6, 0.9, 0.28), (4.5, 3.3, 0.36), (5.4, 1.4, 0.3), (3.9, 0.7, 0.25), (-3.4, 4.6, 0.25), (4.1, 4.9, 0.26))):
    front_prism(f'star{j}', star_prof((x, y), r), 0.03, M['star'], z=FZ + 0.05)
col_box('facade', (0, FH / 2, FZ - 1.5), (FW + 1, FH, 3.2))

# a cerca de estacas e o capim alto dos dois lados da fachada, até os muros
for s in (-1, 1):
    for j in range(26):
        x = s * (FW / 2 + 0.4 + j * 0.55)
        z = FZ - 0.6 - j * 0.12 + random.uniform(-0.15, 0.15)
        h = random.uniform(2.0, 3.4)
        cyl(f'stake{s}_{j}', (x, 0, z), 0.08, h, M['deadwood'], seg=5, r_top=0.02, rot_z=s * random.uniform(0.0, 0.25))
    strut(f'fenceRope{s}', (s * FW / 2, 2.0, FZ - 0.6), (s * (FW / 2 + 14.5), 1.8, FZ - 3.7), 0.04, M['rope'], seg=4)
    # as cordas que descem do topo do tapume até o chão (como na imagem)
    for j in range(3):
        strut(f'guy{s}_{j}', (s * (FW / 2 - 0.3), FH - 0.6 - j * 2.6, FZ - 0.4), (s * (FW / 2 + 6 + j * 3.5), 0.1, FZ - 1.2 - j * 0.8), 0.05, M['rope'], seg=4)

# ================================================================ os POSTES dos cordões (lâmpadas e bandeirolas)
POLES = []
for k in range(8):
    a = (k + 0.5) / 8 * TAU
    x, z = at(a, 20.5)
    cyl(f'pole{k}', (x, 0, z), 0.12, 9.0, M['pole'], seg=6)
    box(f'poleCross{k}', (x, 8.6, z), (0.9, 0.1, 0.1), M['pole'], rot_y=a)
    col_cyl(f'pole{k}', (x, 0, z), 0.3, 9)
    POLES.append((x, 8.6, z))
for k in range(8):  # um cordão de lâmpadas de poste a poste, bandeirolas por baixo
    a, b = POLES[k], POLES[(k + 1) % 8]
    bunting(f'ring{k}', a, b, sag=1.4, flags=False, bulbs=True)
    bunting(f'ringF{k}', (a[0], a[1] - 1.2, a[2]), (b[0], b[1] - 1.2, b[2]), sag=1.1, palette=(0, 1))
# do topo da lona até os postes do fundo e os chifres (como no print da fachada)
for k in (3, 4, 2, 5):
    bunting(f'mast{k}', MAST_TOP, POLES[k], sag=1.6, palette=(0, 2) if k % 2 else (0, 1))
for s in (-1, 1):
    bunting(f'horn{s}', (s * 6.9, FH + 6.0, FZ - 0.6), (s * 13, 14.5, TENT_C[1] + 3), sag=0.8, palette=(0,))
# dois cordões altos cruzando o pátio
bunting('crossA', POLES[1], POLES[5], sag=1.8, palette=(1, 2))
bunting('crossB', POLES[2], POLES[6], sag=1.8, flags=False, bulbs=True)


# ================================================================ as BARRACAS DE JOGOS (esquerda) e a LEITURA DE MÃO
def stall(name, kind, frame, sign, inner):
    P = []
    W, D, H = 4.4, 2.6, 3.2
    for sx in (-1, 1):
        for zz in (1.0, -1.5):
            P.append(box(f'{name}_post{sx}{zz}', (sx * W / 2, H / 2, zz), (0.18, H, 0.18), M[frame]))
        P.append(box(f'{name}_side{sx}', (sx * W / 2, H / 2 + 0.2, -0.25), (0.06, H - 0.4, 2.4), M['curtain']))
    P.append(box(f'{name}_back', (0, H / 2, -1.5), (W, H, 0.1), M['curtain']))
    P.append(box(f'{name}_roof', (0, H + 0.1, -0.25), (W + 0.4, 0.15, D + 0.4), M['wood']))
    P.append(box(f'{name}_counter', (0, 0.5, 1.05), (W, 1.0, 0.45), M[frame]))
    P.append(box(f'{name}_counterTop', (0, 1.03, 1.05), (W + 0.2, 0.08, 0.7), M['wood']))
    for j in range(4):  # a treliça do balcão
        P.append(box(f'{name}_rail{j}', (-1.5 + j, 0.5, 1.29), (0.08, 0.8, 0.04), M['wood']))
    # a placa de cima, de tábua, com o recorte em pico
    prof = [(-W / 2 - 0.2, H), (W / 2 + 0.2, H), (W / 2 + 0.2, H + 0.9), (1.5, H + 1.1), (0.7, H + 1.5), (0, H + 1.7), (-0.7, H + 1.5), (-1.5, H + 1.1), (-W / 2 - 0.2, H + 0.9)]
    P.append(front_prism(f'{name}_sign', prof, 0.15, M[sign], z=1.15))
    P.append(front_prism(f'{name}_signIn', [(-1.6, H + 0.2), (1.6, H + 0.2), (1.6, H + 0.85), (-1.6, H + 0.85)], 0.04, M[inner], z=1.2))
    if kind == 'dardos':  # os alvos e os balões
        for j, x in enumerate((-1.3, 0.0, 1.3)):
            for k, (r, mk) in enumerate(((0.42, 'white'), (0.3, 'red'), (0.17, 'white'), (0.07, 'red'))):
                P.append(cyl(f'{name}_tgt{j}{k}', (x, 2.0, -1.44 + k * 0.012), r, 0.012, M[mk], seg=16, rot_x=math.pi / 2))
        for j in range(7):
            P.append(sphere(f'{name}_bal{j}', (-1.8 + j * 0.6, 2.9, -1.38), (0.14, 0.17, 0.12), M[('red', 'blue', 'yellow')[j % 3]], seg=8, rings=6))
    elif kind == 'patos':  # a fileira de patinhos amarelos na prateleira
        P.append(box(f'{name}_shelf', (0, 1.7, -1.1), (W - 0.4, 0.08, 0.5), M['wood']))
        for j in range(7):
            x = -1.8 + j * 0.6
            P.append(sphere(f'{name}_duck{j}', (x, 1.88, -1.1), (0.18, 0.13, 0.13), M['ball'], seg=8, rings=6))
            P.append(sphere(f'{name}_duckH{j}', (x + 0.1, 2.06, -1.1), (0.09, 0.09, 0.09), M['ball'], seg=8, rings=6))
            P.append(box(f'{name}_beak{j}', (x + 0.2, 2.05, -1.1), (0.08, 0.04, 0.06), M['horn']))
    elif kind == 'basquete':  # tabela, aro e as bolas no balcão
        P.append(box(f'{name}_board', (0, 2.4, -1.35), (1.4, 0.9, 0.06), M['white']))
        for j in range(10):
            a = j / 10 * TAU
            P.append(box(f'{name}_hoop{j}', (math.sin(a) * 0.28, 2.05, -1.0 + math.cos(a) * 0.28), (0.18, 0.03, 0.03), M['horn'], rot_y=a + math.pi / 2))
        for j, x in enumerate((-0.5, 0.1)):
            P.append(sphere(f'{name}_ball{j}', (x, 1.27, 1.05), (0.22, 0.22, 0.22), M['ball'], seg=10, rings=7))
    o = join_objs(P, name)
    return rebase(o)


def palm_tent(name):
    """a tenda da LEITURA DE MÃO: pórtico amarelo de tábua, cortinas listradas abertas, a mesa com a bola de cristal"""
    P = []
    W, H = 4.0, 3.6
    for sx in (-1, 1):
        P.append(box(f'{name}_post{sx}', (sx * W / 2, H / 2, 0.8), (0.3, H, 0.3), M['yellow']))
        P.append(front_prism(f'{name}_drape{sx}', [(sx * W / 2, 0), (sx * 0.5, 0), (sx * W / 2, H - 0.2)], 0.06, M['curtain'], z=0.7))
    P.append(front_prism(f'{name}_top', [(-W / 2 - 0.4, H - 0.2), (W / 2 + 0.4, H - 0.2), (W / 2 + 0.4, H + 0.7), (1.0, H + 0.9), (0.5, H + 1.3), (-0.5, H + 1.3), (-1.0, H + 0.9), (-W / 2 - 0.4, H + 0.7)], 0.3, M['yellow'], z=0.95))
    # a tenda de trás (pirâmide listrada escura)
    P.append(cyl(f'{name}_tent', (0, 0, -1.4), 2.9, 4.6, M['curtain'], seg=4, r_top=0.15, rot_y=math.pi / 4))
    P.append(cyl(f'{name}_table', (0, 0, -0.6), 0.5, 0.75, M['red'], seg=10))
    P.append(sphere(f'{name}_crystal', (0, 0.98, -0.6), (0.22, 0.22, 0.22), M['crystal'], seg=10, rings=7))
    P.append(cyl(f'{name}_vase', (1.6, 0, 1.4), 0.4, 0.55, M['yellow'], seg=10))
    o = join_objs(P, name)
    return rebase(o)


STALLS = [('dardos', 'red', 'yellow', 'red'), ('patos', 'red', 'blue', 'yellow'), ('basquete', 'blue', 'red', 'yellow'), ('mao', None, None, None)]
for k, (kind, frame, sign, inner) in enumerate(STALLS):
    a = -math.pi / 2 - 0.62 + k * 0.38
    x, z = at(a, 22.8)
    o = palm_tent(f'stall{k}') if kind == 'mao' else stall(f'stall{k}', kind, frame, sign, inner)
    _move(o, (x, 0, z), face_center(x, z) + math.pi)
    # um banco vermelho na frente de algumas
    if kind in ('dardos', 'basquete'):
        bx, bz = at(a + 0.06, 20.6)
        P = [box('bench_seat', (0, 0.45, 0), (1.8, 0.08, 0.45), M['red']), box('bench_back', (0, 0.8, -0.22), (1.8, 0.5, 0.06), M['red'])]
        for sx in (-1, 1):
            P.append(box(f'bench_leg{sx}', (sx * 0.8, 0.22, 0), (0.08, 0.45, 0.4), M['red']))
        _move(join_objs(P, f'bench{k}'), (bx, 0, bz), face_center(bx, bz) + math.pi)
# panos escuros entre as barracas (o fundo da fileira)
for k in range(5):
    a = -math.pi / 2 - 0.81 + k * 0.38
    x, z = at(a, 24.2)
    o = box(f'curtainWall{k}', (0, 1.7, 0), (3.6, 3.4, 0.1), M['curtain'])
    _move(o, (x, 0, z), face_center(x, z))


# ================================================================ os CANHÕES (direita), os pedestais e o MEDIDOR DE FORÇA
def cannon(name, barrel, wheel, tilt=0.6):
    P = []
    for sx in (-1, 1):
        P.append(cyl(f'{name}_wheel{sx}', (sx * 0.85, 0.95, 0), 0.95, 0.16, M[wheel], seg=16, rot_z=math.pi / 2))
        P.append(cyl(f'{name}_hub{sx}', (sx * 0.95, 0.95, 0), 0.25, 0.1, M['cyellow'], seg=8, rot_z=math.pi / 2))
        for j in range(4):
            P.append(box(f'{name}_spoke{sx}{j}', (sx * 0.86, 0.95, 0), (0.05, 1.7, 0.08), M['cyellow'], rot_x=j * math.pi / 4))
    P.append(box(f'{name}_carriage', (0, 0.75, -0.6), (1.4, 0.5, 2.0), M['cblue']))
    L = 3.2
    # o cano: base em (0, 1.1, -1.2), apontando para cima e para a frente
    dy, dz = math.sin(tilt), math.cos(tilt)
    P.append(cyl(f'{name}_barrel', (0, 1.0, -1.0), 0.6, L, M[barrel], seg=16, r_top=0.55, rot_x=(math.pi / 2 - tilt)))
    mx, my, mz = 0, 1.0 + dy * L, -1.0 + dz * L
    P.append(cyl(f'{name}_rim', (mx, my - dy * 0.25, mz - dz * 0.25), 0.72, 0.45, M['cyellow'], seg=16, rot_x=(math.pi / 2 - tilt)))
    P.append(cyl(f'{name}_bore', (mx, my + dy * 0.21, mz + dz * 0.21), 0.48, 0.02, M['dark'], seg=14, rot_x=(math.pi / 2 - tilt)))
    P.append(sphere(f'{name}_back', (0, 1.0, -1.0), (0.62, 0.62, 0.62), M[barrel], seg=12, rings=8))
    o = join_objs(P, name)
    return rebase(o)


def pedestal(name, pos, mat, h=0.75, r=0.55):
    cyl(f'{name}', pos, r, h, M[mat], seg=14)
    cyl(f'{name}_band', (pos[0], pos[1] + h * 0.4, pos[2]), r + 0.02, h * 0.22, M['cyellow'], seg=14)


CANNONS = [(math.pi / 2 - 0.55, 22.0, 'cannon', 'cblue'), (math.pi / 2 - 0.15, 23.0, 'cannon', 'cyellow'), (math.pi / 2 + 0.3, 22.4, 'white', 'cblue')]
for k, (a, r, bar, wh) in enumerate(CANNONS):
    x, z = at(a, r)
    o = cannon(f'cannon{k}', bar, wh, tilt=random.uniform(0.45, 0.7))
    _move(o, (x, 0, z), face_center(x, z) + random.uniform(-0.6, 0.6))  # de costas para o pátio, mirando o céu
    px, pz = at(a + 0.12, r - 1.6)
    pedestal(f'ped{k}', (px, 0, pz), ('cblue', 'white', 'red')[k])
# um canhão DENTRO do pátio (obstáculo), mirando o fundo
o = cannon('cannonYard', 'cannon', 'cyellow', tilt=0.5)
_move(o, (12.6, 0, -7.5), math.pi * 0.85)
col_box('cannonYard', (12.6, 1, -7.5), (2.6, 2, 3.0))
# a pilha de pedestais de picadeiro (obstáculo do outro lado)
for j, (dx, dz, y, mk, r) in enumerate(((0, 0, 0, 'cblue', 0.75), (1.4, 0.5, 0, 'white', 0.6), (0.6, -1.1, 0, 'red', 0.6), (0.3, 0.0, 0.75, 'white', 0.55))):
    pedestal(f'podium{j}', (-11.8 + dx, y, 7.5 + dz), mk, h=0.75, r=r)
col_cyl('podiums', (-11.2, 0, 7.4), 1.6, 1.5)

# o MEDIDOR DE FORÇA (direita, mais para a frente)
P = [box('mf_base', (0, 0.15, 0), (2.2, 0.3, 1.5), M['concrete'])]
P.append(front_prism('mf_tower', [(-0.95, 0.3), (0.95, 0.3), (0.35, 2.2), (0.3, 6.4), (-0.3, 6.4), (-0.35, 2.2)], 0.35, M['cyellow'], z=-0.1))
P.append(box('mf_slot', (0, 4.0, 0.08), (0.06, 4.6, 0.03), M['dark']))
P.append(sphere('mf_bell', (0, 6.55, -0.27), (0.35, 0.25, 0.35), M['dark'], seg=10, rings=6))
P.append(cyl('mf_pad', (0, 1.55, 0.25), 0.95, 0.3, M['dark'], seg=18, rot_x=math.pi / 2))
for sx in (-1, 1):
    P.append(box(f'mf_side{sx}', (sx * 0.85, 0.85, 0.1), (0.25, 1.1, 0.3), M['wood']))
mf = join_objs(P, 'medidor')
mx_, mz_ = at(math.pi / 2 + 0.75, 21.5)
_move(mf, (mx_, 0, mz_), face_center(mx_, mz_) + math.pi)
cyl('mf_pole', (mx_ + 1.3, 0, mz_ + 0.6), 0.1, 7.5, M['pole'], seg=6)

# o MURO vermelho com arame farpado atrás dos canhões
for k in range(14):
    a = math.pi / 2 - 0.95 + k * 0.14
    x, z = at(a, 27.0)
    o = box(f'wall{k}', (0, 1.8, 0), (3.85, 3.6, 0.35), M['brick'])
    _move(o, (x, 0, z), face_center(x, z))
    x2, z2 = at(a + 0.14, 27.0)
    for h in (3.75, 4.05):  # dois fios em zigue-zague
        mid = at(a + 0.07, 26.85)
        strut(f'wire{k}_{h}a', (x, h, z), (mid[0], h + 0.25, mid[1]), 0.02, M['wire'], seg=3)
        strut(f'wire{k}_{h}b', (mid[0], h + 0.25, mid[1]), (x2, h, z2), 0.02, M['wire'], seg=3)
    if k % 3 == 1:  # um pôster da banda colado
        px, pz = at(a, 26.75)
        o = box(f'poster{k}', (0, 2.0, 0), (1.0, 1.4, 0.03), M['green' if k % 2 else 'blue'])
        _move(o, (px, 0, pz), face_center(px, pz) + math.pi)

# ================================================================ a FRENTE (+z, atrás da câmera): o LETREIRO AZUL quebrado e a bilheteria
P = []
for sx in (-1, 1):
    P.append(box(f'sign_post{sx}', (sx * 5.0, 3.5, 0), (0.3, 7.0, 0.3), M['wood']))
P.append(front_prism('sign_board', [(-6.6, 6.0), (6.4, 6.0), (6.9, 8.5), (6.2, 9.6), (5.6, 10.8), (3.0, 11.3), (1.0, 10.6), (-1.5, 11.4), (-4.5, 10.9), (-6.2, 10.1), (-7.0, 8.0)], 0.2, M['sign'], z=0.15))
# o escudo vermelho em forma de cabeça de diabo, com as letras douradas
P.append(front_prism('sign_shield', [(-2.3, 5.4), (2.3, 5.4), (2.6, 9.4), (2.9, 11.6), (1.6, 10.5), (-1.6, 10.5), (-2.9, 11.6), (-2.6, 9.4)], 0.12, M['facade'], z=0.3))
P.append(text('sign_txt1', 'CIRCO', (0, 8.9, 0.33), 1.1, M['gold']))
P.append(text('sign_txt2', 'I   Ã S   D', (0, 6.3, 0.33), 0.75, M['gold']))
sign = join_objs(P, 'entranceSign')
_move(sign, (0, 0, 27.5), math.pi)  # de frente para o pátio
P = [box('booth_body', (0, 1.3, 0), (1.8, 2.6, 1.6), M['yellow']), box('booth_win', (0, 1.5, 0.81), (1.0, 0.9, 0.04), M['dark']),
     box('booth_roof', (0, 2.75, 0), (2.2, 0.3, 2.0), M['red'])]
booth = join_objs(P, 'booth')
bx, bz = -8.5, 25.5
_move(booth, (bx, 0, bz), face_center(bx, bz) + math.pi)

# ================================================================ a CAATINGA: árvores secas, algumas verdes, capim e tábuas no chão
def dead_tree(name, x, z, h):
    base = (x, 0, z)
    top = (x + random.uniform(-0.6, 0.6), h, z + random.uniform(-0.6, 0.6))
    strut(f'{name}_trunk', base, top, 0.22, M['deadwood'], seg=5)
    for j in range(5):
        y0 = h * random.uniform(0.45, 0.95)
        t = y0 / h
        p0 = (x + (top[0] - x) * t, y0, z + (top[2] - z) * t)
        ang = random.uniform(0, TAU)
        L = random.uniform(1.5, 3.2)
        p1 = (p0[0] + math.sin(ang) * L, y0 + L * random.uniform(0.6, 1.1), p0[2] + math.cos(ang) * L)
        strut(f'{name}_br{j}', p0, p1, 0.09, M['deadwood'], seg=4)
        for i in range(2):
            ang2 = ang + random.uniform(-0.9, 0.9)
            p2 = (p1[0] + math.sin(ang2) * 1.0, p1[1] + random.uniform(0.4, 1.0), p1[2] + math.cos(ang2) * 1.0)
            strut(f'{name}_tw{j}{i}', p1, p2, 0.04, M['deadwood'], seg=3)


def green_tree(name, x, z, h):
    strut(f'{name}_trunk', (x, 0, z), (x, h * 0.55, z), 0.25, M['deadwood'], seg=5)
    for j in range(4):
        sphere(f'{name}_crown{j}', (x + random.uniform(-1.2, 1.2), h * random.uniform(0.6, 0.85), z + random.uniform(-1.2, 1.2)),
               (random.uniform(1.6, 2.4), random.uniform(1.3, 1.8), random.uniform(1.6, 2.4)), M['leaf'], seg=8, rings=6)


for k in range(34):
    a = random.uniform(0, TAU)
    r = random.uniform(29, 48)
    x, z = at(a, r)
    if abs(x) < 16 and z < -20 and z > -56:  # a lona
        continue
    if random.random() < 0.28:
        green_tree(f'gtree{k}', x, z, random.uniform(5, 8))
    else:
        dead_tree(f'dtree{k}', x, z, random.uniform(4.5, 8.5))

GRASS = Acc()
for k in range(520):
    a = random.uniform(0, TAU)
    r = random.uniform(19.2, 30) if random.random() < 0.8 else random.uniform(30, 45)
    x, z = at(a, r)
    if abs(x) < 3.2 and FAC_Z - 1 < z < FAC_Z + 3:  # a porta da lona fica livre
        continue
    for j in range(5):
        bx_, bz_ = x + random.uniform(-0.35, 0.35), z + random.uniform(-0.35, 0.35)
        h = random.uniform(0.4, 1.3)
        ang = random.uniform(0, TAU)
        lean = random.uniform(-0.3, 0.3)
        GRASS.tri2((bx_ - math.cos(ang) * 0.06, 0, bz_ + math.sin(ang) * 0.06), (bx_ + math.cos(ang) * 0.06, 0, bz_ - math.sin(ang) * 0.06),
                   (bx_ + math.sin(ang) * lean, h, bz_ + math.cos(ang) * lean))
GRASS.done('dryGrass', M['grass'])
for k in range(9):  # tábuas soltas no chão
    a = random.uniform(0, TAU)
    x, z = at(a, random.uniform(13, 19))
    box(f'plank{k}', (x, 0.04, z), (0.3, 0.06, random.uniform(1.5, 3.0)), M['wood'], rot_y=random.uniform(0, TAU))

# ================================================================ os PAREDÕES DE ARENITO no horizonte (mesas de topo chato)
for k in range(26):
    a = (k + 0.5) / 26 * TAU + random.uniform(-0.08, 0.08)
    r = random.uniform(78, 96)
    x, z = at(a, r)
    rock(f'mesa{k}', (x, -1, z), (random.uniform(18, 30), random.uniform(14, 30), random.uniform(14, 22)), M['sandstone' if k % 3 else 'sandstone2'],
         rot_y=face_center(x, z) + random.uniform(-0.3, 0.3), jit=0.08, layers=random.randint(3, 6), taper=0.12)

# a LUA DE SANGUE (a variante de noite; a de dia esconde pelo material — cfg.materials)
sphere('moon', (-24, 44, -96), (7, 7, 7), M['moon'], seg=20, rings=12)

for i, acc in enumerate(FLAGS):
    acc.done(f'bunting{i}', M[FLAG_MATS[i]])

finalize(OUT)
