"""
SERTÃO DO QUIBUNGO (Hexatombe) — public/arenas/sertao.glb. Pedido do dono 2026-11-20 ("prepare um novo mapa, o
sertão onde teve a luta contra o quimbungo, busque referências nos episódios"). Referências em
`Referencias visuais/Mapas/sertao-quibungo/episodios/` (HEX ep. 5, 2h05–2h48, youtu.be/zsOSZ_r9mhg):
  - canon (episódio + wiki "Hexatombe - Episódio 5"): a caatinga da Coroa de Espinhos à noite, mata seca de galhos
    retorcidos e capim alto, névoa azul densa e a LUA CHEIA grande; a TRILHA de terra clara que sobe o MORRO; a PLACA
    de madeira com setas e a LAMPARINA vermelha pendurada; Jae e Labirinto espalham LAMPARINAS no chão, em fila, e o
    Cristino junta outras num AMONTOADO ao lado dos BARRIS; o tiro acende a trilha de fogo, o Quibungo pula de lamparina
    em lamparina pegando fogo e os barris explodem; um CASEBRE de tábuas aparece na mata.
  - PROPOSTA: a clareira no alto do morro (r ≈ 18) como arena; a posição da placa, dos barris, do amontoado, dos troncos
    caídos e do casebre; mandacarus e xique-xiques (caatinga) em volta.
Feito à mão (sem kits). Coordenadas do jogo; a câmera começa em +z olhando a trilha que desce para -z (a lua).
  mcp_build("sertao", kind="arena")   → public/arenas/sertao.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import bmesh
from mathutils import Vector
from arena_lib import *
from arena_lib import _obj_from_bmesh, _move
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'sertao.glb'
random.seed(5)  # o 5º episódio
start()

M = {
    'earth': material('caatinga_earth', '#4a3a2c', 1),
    'trail': material('trail_sand', '#9a8468', 1),
    'deadwood': material('dead_wood', '#4a4038', 0.95),
    'darkwood': material('dark_wood', '#2e2620', 0.95),
    'plank': material('wood_plank', '#5a4430', 0.9),
    'iron': material('black_iron', '#1e1c1c', 0.55, metal=0.7),
    'lamp': material('lantern_glow', '#d02010', 0.3, emission='#ff1a0a', strength=2.5),
    'barrel': material('barrel_wood', '#5a3a24', 0.85),
    'hoop': material('barrel_hoop', '#3a3430', 0.5, metal=0.7),
    'cactus': material('cactus', '#4a5a44', 0.8),
    'grass': material('dry_grass', '#8a7a5a', 1),
    'grass_dark': material('dry_grass_dark', '#5a4a36', 1),
    'stone': material('field_stone', '#6a6460', 0.95),
    'burnt': material('burnt_ground', '#3a2e24', 1),
    'roof': material('roof_tin', '#4a4440', 0.6, metal=0.5),
    'moon': material('moon_full', '#e8ecff', 0.5, emission='#dce4ff', strength=2.2),  # só na variante de noite
}
R_FIGHT = 18.0


def at(a, r):
    return math.sin(a) * r, math.cos(a) * r


def trail_x(z):
    """o eixo da trilha: entra por +z, cruza a clareira e desce o morro serpenteando para -z"""
    return 3.0 * math.sin(z / 13.0) + (0.0 if z > -20 else (z + 20) * 0.12)


def hy(x, z):
    """altura do chão: o topo do morro é plano (a arena); fora dele desce, mais íngreme para -z (onde a trilha desce)"""
    r = math.hypot(x, z)
    if r < 21:
        return 0.0
    k = 0.1 if z > 0 else 0.15
    return -(r - 21) * k + 0.6 * math.sin(x * 0.21) * math.cos(z * 0.17) * min(1, (r - 21) / 10)


def strut(name, a, b, r, mat, seg=6, r2=None):
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
    def __init__(self):
        self.bm = bmesh.new()

    def tri2(self, a, b, c):
        for pts in ((a, b, c), (c, b, a)):
            self.bm.faces.new([self.bm.verts.new(B(*p)) for p in pts])

    def done(self, name, mat):
        return _obj_from_bmesh(name, self.bm, mat)


# ================================================================ o CHÃO: o morro com a clareira e a trilha de terra clara
N, SIZE = 96, 180.0
bm = bmesh.new()
V = [[bm.verts.new(B((i / N - 0.5) * SIZE, 0, (j / N - 0.5) * SIZE)) for j in range(N + 1)] for i in range(N + 1)]
for row in V:
    for v in row:
        x, z = v.co.x, -v.co.y
        v.co.z = hy(x, z)
for i in range(N):
    for j in range(N):
        f = bm.faces.new([V[i][j], V[i + 1][j], V[i + 1][j + 1], V[i][j + 1]])
        c = f.calc_center_median()
        x, z = c.x, -c.y
        r = math.hypot(x, z)
        on_trail = abs(x - trail_x(z)) < 1.9 and abs(z) < 85
        f.material_index = 1 if (r < 16.5 or on_trail) else 0
ground = _obj_from_bmesh('GROUND_hill', bm, M['earth'])
ground.data.materials.append(M['trail'])
# a terra clara da clareira com borda irregular (manchas por cima do chão de malha)
for k in range(26):
    a = k / 26 * TAU + random.uniform(-0.1, 0.1)
    x, z = at(a, random.uniform(15.5, 18.5))
    cyl(f'GROUND_sand{k}', (x, 0.006, z), random.uniform(1.4, 2.6), 0.01, M['trail'], seg=9)
# ================================================================ a PLACA de madeira com as setas e a lamparina vermelha
PX, PZ = -12.5, -9.0
P = [box('sign_post', (0, 1.4, 0), (0.22, 2.8, 0.22), M['darkwood'])]
for k, (y, ang, L) in enumerate(((2.35, 0.25, 1.9), (1.85, -0.3, 1.7), (1.4, 0.1, 1.4))):
    dx = math.cos(ang) * L / 2 * (1 if k % 2 == 0 else -1)
    P.append(box(f'sign_board{k}', (dx, y, 0.14), (L, 0.32, 0.06), M['plank'], rot_y=0, rot_z=0.05 * (k - 1)))
    tip = dx + (L / 2 + 0.15) * (1 if k % 2 == 0 else -1)
    P.append(box(f'sign_tip{k}', (tip, y, 0.14), (0.28, 0.28, 0.06), M['plank'], rot_z=math.pi / 4))
P.append(strut('sign_hook', (0, 2.7, 0.1), (0.45, 2.7, 0.1), 0.025, M['iron'], seg=4))
o = join_objs(P, 'signpost')
_move(o, (PX, 0, PZ), 0.5)
lx, lz = PX + math.cos(0.5) * 0.45, PZ - math.sin(0.5) * 0.45
strut('sign_chain', (lx, 2.7, lz), (lx, 2.35, lz), 0.01, M['iron'], seg=3)
P = [box('slamp_top', (lx, 2.33, lz), (0.2, 0.05, 0.2), M['iron']), cyl('slamp_glass', (lx, 2.04, lz), 0.08, 0.27, M['lamp'], seg=8),
     box('slamp_base', (lx, 2.02, lz), (0.2, 0.05, 0.2), M['iron'])]
join_objs(P, 'FLICKER_signLamp')
col_cyl('signpost', (PX, 0, PZ), 0.45, 2.8)


def lamp(name, x, z, y=None, s=1.4):
    """a lamparina vermelha de chão (as que Jae e Labirinto espalharam)"""
    y = hy(x, z) if y is None else y
    P = [box(f'{name}_base', (x, y + 0.03 * s, z), (0.18 * s, 0.06 * s, 0.18 * s), M['iron']),
         cyl(f'{name}_glass', (x, y + 0.06 * s, z), 0.07 * s, 0.2 * s, M['lamp'], seg=8),
         box(f'{name}_top', (x, y + 0.28 * s, z), (0.16 * s, 0.05 * s, 0.16 * s), M['iron']),
         strut(f'{name}_handle', (x - 0.06 * s, y + 0.3 * s, z), (x + 0.06 * s, y + 0.38 * s, z), 0.01, M['iron'], seg=3)]
    return join_objs(P, name)


# as LAMPARINAS em fila: na beira da clareira e descendo a trilha (o caminho que o Quibungo seguiu)
for k in range(7):
    z = -16 + k * 5.2
    lamp(f'lampRing{k}', trail_x(z) + (2.2 if k % 2 else -2.2), z)
for k in range(9):
    z = -22 - k * 6.0
    lamp(f'lampTrail{k}', trail_x(z) + (1.4 if k % 2 else -1.4), z)

# ================================================================ os BARRIS e o AMONTOADO de lamparinas (obstáculo)
def barrel(name, pos, h=1.0, r=0.38, tilt=0.0):
    x, y, z = pos
    P = [cyl(f'{name}_b', (0, 0, 0), r, h, M['barrel'], seg=12, r_top=r * 0.92)]
    for k, t in enumerate((0.18, 0.82)):
        P.append(cyl(f'{name}_h{k}', (0, h * t - 0.03, 0), r * (1.01 if t < 0.5 else 0.95), 0.06, M['hoop'], seg=12))
    o = join_objs(P, name)
    o.location = B(x, y, z)
    o.rotation_euler = (tilt, 0, random.uniform(0, TAU))
    return o


BX, BZ = 9.5, -5.5
barrel('bar1', (BX, 0, BZ))
barrel('bar2', (BX + 0.85, 0, BZ - 0.35))
barrel('bar3', (BX + 0.3, 0, BZ + 0.75))
barrel('bar4', (BX + 0.45, 1.0, BZ + 0.05), h=0.9, r=0.34)
barrel('bar5', (BX - 1.0, 0.36, BZ - 0.5), tilt=math.pi / 2)  # um deitado
for k in range(7):  # o amontoado de lamparinas juntadas pelo Cristino, ao pé dos barris
    a = random.uniform(-1.2, 1.2) + math.pi
    lamp(f'lampPile{k}', BX + math.sin(a) * 1.3 + random.uniform(-0.2, 0.2), BZ + math.cos(a) * 1.3, y=0.0 if k < 5 else 0.2)
col_cyl('barrels', (BX + 0.2, 0, BZ), 1.55, 1.9)

# ================================================================ os TRONCOS caídos (obstáculo do outro lado)
TX, TZ = -9.5, 6.5
strut('logA', (TX - 2.4, 0.38, TZ), (TX + 2.4, 0.4, TZ), 0.38, M['deadwood'], seg=8, r2=0.3)
strut('logB', (TX - 1.6, 1.0, TZ + 0.2), (TX + 1.9, 0.95, TZ - 0.1), 0.28, M['deadwood'], seg=7, r2=0.24)
for k, (dx, ang) in enumerate(((-1.8, 2.2), (0.6, 0.9), (2.0, -2.4))):  # galhos quebrados saindo do tronco
    x0 = TX + dx
    strut(f'logBranch{k}', (x0, 0.6, TZ), (x0 + math.sin(ang) * 1.2, 1.4, TZ + math.cos(ang) * 1.2), 0.07, M['deadwood'], seg=4, r2=0.02)
col_box('logs', (TX, 0.6, TZ), (5.2, 1.2, 1.4))

# pedras soltas na clareira
for k in range(10):
    a = random.uniform(0, TAU)
    x, z = at(a, random.uniform(6, 16))
    if abs(x - trail_x(z)) < 2.2:
        continue
    sphere(f'stone{k}', (x, 0, z), (random.uniform(0.25, 0.5), random.uniform(0.15, 0.3), random.uniform(0.25, 0.5)), M['stone'], seg=7, rings=5)

# ================================================================ o CASEBRE de tábuas ao longe, na descida do morro
def shack(name, x, z, rot):
    y = hy(x, z) - 0.2
    W, D, H = 4.2, 3.4, 2.6
    P = []
    for k in range(9):  # as tábuas verticais tortas das paredes da frente e de trás
        for sz in (-1, 1):
            px = -W / 2 + (k + 0.5) * W / 9
            P.append(box(f'{name}_pl{k}{sz}', (px, H / 2, sz * D / 2), (W / 9 * 0.92, H + random.uniform(-0.25, 0.1), 0.06), M['plank'], rot_z=random.uniform(-0.04, 0.04)))
    for sx in (-1, 1):
        for k in range(7):
            pz = -D / 2 + (k + 0.5) * D / 7
            P.append(box(f'{name}_ps{k}{sx}', (sx * W / 2, H / 2, pz), (0.06, H + random.uniform(-0.2, 0.1), D / 7 * 0.92), M['plank']))
    P.append(box(f'{name}_roof', (0, H + 0.3, 0), (W + 0.6, 0.06, D + 0.7), M['roof'], rot_x=0.18))
    P.append(box(f'{name}_door', (0.6, 0.95, D / 2 + 0.04), (0.9, 1.9, 0.05), M['darkwood']))
    o = join_objs(P, name)
    _move(o, (x, y, z), rot)
    lamp(f'{name}_lamp', x + 1.4, z + 2.2)


shack('shack', -27.0, -30.0, 0.7)

# ================================================================ a MATA SECA: árvores de galhos retorcidos, mandacarus e xique-xiques
def dead_tree(name, x, z, h, mat='deadwood'):
    y = hy(x, z)
    base = (x, y, z)
    top = (x + random.uniform(-0.9, 0.9), y + h, z + random.uniform(-0.9, 0.9))
    P = [strut(f'{name}_trunk', (x, y - 0.3, z), top, 0.2, M[mat], seg=5, r2=0.06)]
    for j in range(6):
        t = random.uniform(0.3, 0.95)
        p0 = (x + (top[0] - x) * t, y + h * t, z + (top[2] - z) * t)
        ang = random.uniform(0, TAU)
        L = random.uniform(1.2, 3.2)
        p1 = (p0[0] + math.sin(ang) * L, p0[1] + L * random.uniform(0.3, 0.9), p0[2] + math.cos(ang) * L)
        P.append(strut(f'{name}_br{j}', p0, p1, 0.07, M[mat], seg=4, r2=0.025))
        for i in range(2):  # os gravetos retorcidos (a silhueta dos prints)
            ang2 = ang + random.uniform(-1.2, 1.2)
            p2 = (p1[0] + math.sin(ang2) * random.uniform(0.6, 1.3), p1[1] + random.uniform(-0.2, 0.9), p1[2] + math.cos(ang2) * random.uniform(0.6, 1.3))
            P.append(strut(f'{name}_tw{j}{i}', p1, p2, 0.025, M[mat], seg=3, r2=0.006))
    join_objs(P, name)


def mandacaru(name, x, z, h):
    y = hy(x, z)
    P = [cyl(f'{name}_t', (x, y - 0.2, z), 0.2, h + 0.2, M['cactus'], seg=8, r_top=0.15)]
    for k in range(random.randint(2, 4)):
        ang = random.uniform(0, TAU)
        y0 = y + h * random.uniform(0.3, 0.6)
        L = random.uniform(0.6, 1.0)
        ex, ez = x + math.sin(ang) * L, z + math.cos(ang) * L
        P.append(strut(f'{name}_a{k}', (x, y0, z), (ex, y0 + 0.25, ez), 0.13, M['cactus'], seg=7))
        P.append(cyl(f'{name}_u{k}', (ex, y0 + 0.2, ez), 0.13, random.uniform(0.9, 1.8), M['cactus'], seg=7, r_top=0.1))
    join_objs(P, name)


def xiquexique(name, x, z):
    y = hy(x, z)
    P = []
    for k in range(random.randint(4, 7)):
        ang = random.uniform(0, TAU)
        L = random.uniform(0.4, 1.0)
        P.append(strut(f'{name}_s{k}', (x, y, z), (x + math.sin(ang) * L, y + random.uniform(0.3, 0.9), z + math.cos(ang) * L), 0.08, M['cactus'], seg=6, r2=0.06))
    join_objs(P, name)


def free(x, z, m=3.0):
    return abs(x - trail_x(z)) > m and math.hypot(x - (-27), z - (-30)) > 4.5


for k in range(190):  # a mata fechada em volta da clareira e descendo o morro (mais densa perto)
    a = random.uniform(0, TAU)
    x, z = at(a, 21 + random.random() ** 1.6 * 55)
    if free(x, z):
        dead_tree(f'dtree{k}', x, z, random.uniform(3.5, 8), 'deadwood' if k % 3 else 'darkwood')
# árvores grandes na borda (as que emolduram a luta e a lua)
for k, (x, z, h) in enumerate(((-19, -6, 9), (18.5, 8, 8.5), (16, -14, 10), (-17, 13, 8))):
    dead_tree(f'bigTree{k}', x, z, h, 'darkwood')
for k in range(40):
    a = random.uniform(0, TAU)
    x, z = at(a, random.uniform(19.5, 50))
    if free(x, z):
        mandacaru(f'manda{k}', x, z, random.uniform(2.2, 4.2))
for k in range(40):
    a = random.uniform(0, TAU)
    x, z = at(a, random.uniform(18.5, 45))
    if free(x, z, 2.2):
        xiquexique(f'xique{k}', x, z)

# o CAPIM SECO alto em volta, e tufos baixos dentro da clareira
GRASS, GRASS_D = Acc(), Acc()
for k in range(1300):
    a = random.uniform(0, TAU)
    r = random.uniform(17.5, 32) if random.random() < 0.7 else random.uniform(32, 55)
    x, z = at(a, r)
    if abs(x - trail_x(z)) < 1.7:
        continue
    acc = GRASS_D if random.random() < 0.4 else GRASS
    y = hy(x, z)
    for j in range(5):
        bx, bz = x + random.uniform(-0.4, 0.4), z + random.uniform(-0.4, 0.4)
        h = random.uniform(0.5, 1.4)
        ang = random.uniform(0, TAU)
        lean = random.uniform(-0.35, 0.35)
        acc.tri2((bx - math.cos(ang) * 0.05, y, bz + math.sin(ang) * 0.05), (bx + math.cos(ang) * 0.05, y, bz - math.sin(ang) * 0.05),
                 (bx + math.sin(ang) * lean, y + h, bz + math.cos(ang) * lean))
GRASS.done('dryGrass', M['grass'])
GRASS_D.done('dryGrassDark', M['grass_dark'])
TUFT = Acc()
for k in range(160):
    a = random.uniform(0, TAU)
    x, z = at(a, random.uniform(3, 17))
    if abs(x - trail_x(z)) < 1.6:
        continue
    for j in range(4):
        bx, bz = x + random.uniform(-0.2, 0.2), z + random.uniform(-0.2, 0.2)
        TUFT.tri2((bx - 0.04, 0, bz), (bx + 0.04, 0, bz), (bx + random.uniform(-0.15, 0.15), random.uniform(0.2, 0.5), bz + random.uniform(-0.15, 0.15)))
TUFT.done('tufts', M['grass'])

# ================================================================ a LUA CHEIA sobre a trilha que desce (o horizonte some na névoa)
sphere('moon', (14, 46, -120), (9, 9, 9), M['moon'], seg=20, rings=12)

finalize(OUT)
