"""
INTERFLORADO AFLORADO — public/models/interflorado.glb (o NINHO DE INTERFLORADOS do Estrangeiro; fora da seleção)
Cânone (wiki "Interflorado", Sinais do Outro Lado ep. 1): um Alheio PARASITA de Transmissão — o mesmo grupo do
Estrangeiro — que se aloja no cérebro do hospedeiro; ameaçado, AFLORA: o corpo da pessoa se retorce, a pele fica
esverdeada, os DEDOS ficam LONGOS e a CABEÇA EXPLODE, revelando "vários dedos verdes com olhos amarelos pra todos os
lados". Pela arte de referência enviada pelo dono (2026-11-06): o corpo de um homem comum — camiseta clara, CAMISA
XADREZ MARROM aberta, calça JEANS —, os braços com VEIAS VERDES e as mãos em RAÍZES de dedos compridos; a cabeça é um
emaranhado de galhos/raízes cheio de OLHOS, com galhos compridos para todos os lados e o LIMO verde escorrendo pelo
pescoço e pela roupa. PROPOSTA: as proporções, o número de galhos e de olhos.
  node tools/blender/build.mjs interflorado   → public/models/interflorado.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'interflorado.glb'
random.seed(1101)

b = Builder(width=0.98, bulk=0.9, height=1.0)  # um homem comum, um pouco curvado pelo jogo
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_interflorado', '#a8a88a', 0.8)  # a pele esverdeada do hospedeiro
arms = material('arms_interflorado', '#ffffff', 0.8)  # antebraços com as veias verdes (textura)
tee = material('tee_interflorado', '#ffffff', 0.9)  # a camiseta clara manchada de limo (textura)
plaid = material('plaid_interflorado', '#ffffff', 0.9)  # a camisa xadrez marrom (textura)
jeans = material('jeans_interflorado', '#ffffff', 0.9)  # a calça jeans (textura)
shoe = material('shoe_interflorado', '#2a2018', 0.6)
root = material('root_interflorado', '#3e4a26', 0.7)  # os galhos/dedos verdes da cabeça e das mãos
root_d = material('root_interflorado_d', '#26301a', 0.75)
eye = material('fine_eye_interflorado', '#d8e050', 0.35, emission='#c8e040', strength=1.6)  # os olhos amarelo-esverdeados
pupil = material('fine_pupil_interflorado', '#050605', 0.3)
slime = material('fine_slime_interflorado', '#5a9a2a', 0.15, emission='#3a7a18', strength=0.6)  # o limo escorrendo
PREVIEW = {'arms_interflorado': '#a8a88a', 'tee_interflorado': '#d6d2c4', 'plaid_interflorado': '#6a4a30', 'jeans_interflorado': '#3a4a6a'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

M = {'skin': skin, 'face': skin, 'torso': tee, 'arm': arms, 'hand': root, 'legs': jeans, 'feet': shoe}
TP = [(-0.12, 0.17), (0.0, 0.172), (0.18, 0.17), (0.38, 0.206), (0.5, 0.216), (0.6, 0.12), (0.66, 0.066)]
hc = b.body(M, TP, arm_r=(0.064, 0.052, 0.044), leg_r=(0.09, 0.072, 0.056), neck_r=0.056, feet='shoe', head=False)
HCv = Vector((hc.x, hc.y, hc.z))


def part(name):
    return next(o for o in b.parts if o.name == name)


def W(reg):
    return lambda p: auto_weights(sk, p, reg)


HEAD = lambda p: {'hd': 1.0}
_bvh = {}


def bvh(name):
    if name not in _bvh:
        o = part(name)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        me.transform(o.matrix_world)
        bm = bmesh.new()
        bm.from_mesh(me)
        _bvh[name] = BVHTree.FromBMesh(bm)
        bm.free()
        bpy.data.meshes.remove(me)
    return _bvh[name]


def surf(name, origin, direction, off=0.0):
    hit = bvh(name).ray_cast(Vector(origin), Vector(direction).normalized())
    return None if hit[0] is None else hit[0] + hit[1] * off


def front(name, x, z, off=0.0):
    return surf(name, Vector((x, -0.6 * H, z)), Vector((0, 1, 0)), off)


def rnd_dir(up_bias=0.0):
    while True:
        d = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1)))
        if 0.2 < d.length <= 1:
            d.normalize()
            d.z += up_bias
            return d.normalized()


tor = part('torso')
relief(tor, lambda p: 0.002 * H * (ridge(p.z / H * 12 + n3(p, 8) * 1.4, 2) - 0.4))  # as dobras da camiseta

# ================================================================ a CAMISA XADREZ aberta por cima da camiseta: costas e lados, a frente aberta
shirt = clothe(tor, lambda p: p.z > hz - 0.1 * H and not (p.y < 0 and abs(p.x) < 0.075 * H + 0.04 * H * max(0.0, (top - p.z) / H)), 0.011 * H, cuts=1)
b.add('plaidBody', shirt, plaid, region='body', weight_fn=W('torso'), subdiv=0)
# as mangas da camisa até logo abaixo do cotovelo (os antebraços de fora, com as veias)
for side in ('L', 'R'):
    s_, e_ = sk['s' + side], sk['e' + side]
    ax = (e_ - s_)
    L = ax.length
    ax.normalize()
    sl = clothe(part('arm' + side), lambda p, s_=s_, ax=ax, L=L: (p - s_).dot(ax) < L * 1.12, 0.008 * H, cuts=1)
    b.add('plaidSleeve' + side, sl, plaid, region='body', weight_fn=W('arm' + side), subdiv=0)
    # o punho dobrado (manga arregaçada)
    c = s_ + ax * L * 1.12
    ring = []
    for i in range(25):
        a = i / 24 * TAU
        u = ax.orthogonal().normalized()
        v = ax.cross(u).normalized()
        q = surf('arm' + side, c + (u * math.cos(a) + v * math.sin(a)) * 0.4 * H, -(u * math.cos(a) + v * math.sin(a)), 0.02 * H)
        if q:
            ring.append(q)
    if len(ring) > 4:
        b.add('cuff' + side, rod(ring, 0.014 * H, 6, caps=False), plaid, region='body', weight_fn=W('arm' + side), subdiv=0)
# a gola da camisa aberta caindo nos ombros
for s in (1, -1):
    pts = [front('torso', s * x, z, 0.02 * H) for x, z in ((0.05 * H, top + 0.02 * H), (0.09 * H, top - 0.06 * H), (0.08 * H, top - 0.14 * H))]
    pts = [q for q in pts if q]
    if len(pts) > 2:
        b.add(f'collar{s}', rod(pts, [0.024 * H, 0.03 * H, 0.012 * H][:len(pts)], 6, flat=(lambda p: Vector((0, -1, 0)), 0.3)), plaid, region='body', weight_fn=W('torso'), subdiv=0)
for side in ('L', 'R'):
    relief(part('leg' + side), lambda p: 0.0025 * H * (ridge(p.z / H * 15 + n3(p, 9) * 1.4, 2) - 0.4))  # o jeans amassado

# ================================================================ as MÃOS em RAÍZES: dedos compridos e nodosos, verdes, com raízes finas
for side in ('L', 'R'):
    h_, e_ = sk['hand' + side], sk['e' + side]
    ax = (h_ - e_).normalized()
    sx = 1 if side == 'L' else -1
    Fg = Sculpt()
    for k in range(5):
        off = Vector((sx * (k - 2) * 0.013 * H, (k - 2) * 0.006 * H, 0))
        if k == 0:
            off += Vector((sx * -0.012 * H, -0.02 * H, 0.012 * H))
        base = h_ + ax * 0.035 * H + off
        ln = (0.13 + random.uniform(-0.015, 0.02)) * H * (0.7 if k == 0 else 1.0)
        pts = [base]
        d = ax.copy()
        for j in range(4):
            d = (d + Vector((random.uniform(-0.25, 0.25), random.uniform(-0.25, 0.25), random.uniform(-0.2, 0.1)))).normalized()
            pts.append(pts[-1] + d * ln / 4 + Vector((0, -0.004 * H * j, 0)))
        Fg.chain(pts, [0.009 * H, 0.0085 * H, 0.007 * H, 0.0055 * H, 0.003 * H], step=0.4)
        for j in (1, 2, 3):  # os nós dos dedos
            Fg.ell(pts[j], (0.0095 * H, 0.0095 * H, 0.0095 * H))
    b.add('rootFingers' + side, Fg.mesh(res=0.0026, smooth=2, disp=lambda p: 0.0012 * H * (n3(p, 40) - 0.5), target=1400), root, region='e' + side, subdiv=0)
    # raízes finas saindo dos dedos e do pulso
    hair = []
    for k in range(7):
        a = h_ + ax * random.uniform(0.0, 0.12) * H + Vector((random.uniform(-0.02, 0.02) * H, random.uniform(-0.02, 0.02) * H, random.uniform(-0.01, 0.01) * H))
        d = (ax + rnd_dir() * 0.7).normalized()
        hair.append(rod([a, a + d * 0.04 * H, a + d * 0.07 * H + Vector((0, 0, -0.02 * H))], [0.003 * H, 0.002 * H, 0.0006 * H], 4))
    b.add('rootHairs' + side, merge(*hair), root_d, region='e' + side, subdiv=0)

# ================================================================ a CABEÇA AFLORADA: o emaranhado de galhos/dedos cheio de olhos
core_c = HCv + Vector((0, 0.0, -0.01 * H))
Cr = Sculpt()
Cr.chain([Vector((0, 0, 1.68 * H)), core_c + Vector((0, 0, -0.04 * H))], [0.05 * H, 0.08 * H], step=0.4)  # o toco do pescoço que estourou
Cr.ell(core_c, (0.1 * H, 0.1 * H, 0.11 * H))
for i in range(14):  # os nós de raiz que formam o miolo
    d = rnd_dir(0.4)
    Cr.ell(core_c + d * 0.08 * H, (0.045 * H, 0.045 * H, 0.05 * H))
core = b.add('rootCore', Cr.mesh(res=0.004, smooth=2, disp=lambda p: 0.006 * H * (ridge(math.atan2(p.x, p.y) * 8 + p.z / H * 30 + n3(p, 10) * 2, 2) - 0.4), target=3600), root, region='body', weight_fn=HEAD, subdiv=0)

eyes, pupils = [], []


def add_eye(c, n, r):
    eyes.append(ellipsoid(tuple(c), (r, r, r), 10, 8))
    p = c + n * r * 0.82
    pupils.append(ellipsoid(tuple(p), (r * 0.42, r * 0.42, r * 0.42), 8, 6))


# os galhos/dedos compridos para todos os lados (mais para cima e para os lados), curvos e nodosos, com ramos
branches, twigs, knots = [], [], []
for i in range(32):
    d = rnd_dir(0.5)
    if d.z < -0.35:
        continue
    start = core_c + d * 0.085 * H
    ln = random.uniform(0.14, 0.4) * H
    pts = [start]
    dd = d.copy()
    bend = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-0.6, 0.2))).normalized()  # a curva do dedo
    for j in range(5):
        dd = (dd + bend * random.uniform(0.25, 0.45) + Vector((random.uniform(-0.2, 0.2), random.uniform(-0.2, 0.2), random.uniform(-0.1, 0.15)))).normalized()
        pts.append(pts[-1] + dd * ln / 5)
    r0 = random.uniform(0.013, 0.02) * H
    rs = [r0, r0 * 0.88, r0 * 0.78, r0 * 0.66, r0 * 0.55, r0 * 0.42]
    branches.append(rod(pts, rs, 7))
    for j in (1, 3):  # os NÓS: parecem juntas de dedos
        knots.append(ellipsoid(tuple(pts[j]), (rs[j] * 1.3,) * 3, 8, 6))
    knots.append(ellipsoid(tuple(pts[-1]), (rs[-1] * 1.05,) * 3, 8, 6))  # a ponta arredondada
    if random.random() < 0.6:  # um ramo lateral
        k = random.randint(2, 4)
        side_d = (dd + rnd_dir() * 0.9).normalized()
        a = pts[k]
        twigs.append(rod([a, a + side_d * ln * 0.18, a + side_d * ln * 0.3 + Vector((0, 0, 0.02 * H))], [r0 * 0.4, r0 * 0.25, 0.001 * H], 5))
    if random.random() < 0.55:  # um OLHO no galho
        k = random.randint(1, 3)
        n = (pts[k + 1] - pts[k]).cross(Vector((0, 0, 1)))
        if n.length < 1e-6:
            n = Vector((1, 0, 0))
        n.normalize()
        if n.dot(pts[k] - core_c) < 0:
            n = -n
        add_eye(pts[k] + n * r0 * 0.6, n, r0 * random.uniform(0.75, 1.0))
b.add('rootBranches', merge(*branches, *knots), root, region='body', weight_fn=HEAD, subdiv=0)
if twigs:
    b.add('rootTwigs', merge(*twigs), root_d, region='body', weight_fn=HEAD, subdiv=0)
# os OLHOS no miolo (a maioria virada para a frente e para os lados)
for i in range(16):
    d = rnd_dir(0.2)
    if d.y > 0.55:  # poucos atrás
        d.y = -d.y
    q = surf('rootCore', core_c + d * 0.4 * H, -d, -0.004 * H)
    if q:
        add_eye(q, d, random.uniform(0.016, 0.026) * H)
b.add('eyes', merge(*eyes), eye, region='body', weight_fn=HEAD, subdiv=0)
b.add('pupils', merge(*pupils), pupil, region='body', weight_fn=HEAD, subdiv=0)

# ================================================================ o LIMO verde escorrendo pelo pescoço, pelos ombros e pela roupa
drips = []
for i in range(16):
    a = random.uniform(-1.0, 1.0) * math.pi
    d = Vector((math.sin(a), -math.cos(a), 0))
    z0 = top + random.uniform(0.0, 0.06) * H
    q = surf('torso', Vector((0, 0, z0)) + d * 0.6 * H, -d, 0.02 * H) or surf('neck', Vector((0, 0, 1.64 * H)) + d * 0.6 * H, -d, 0.004 * H)
    if not q:
        continue
    ln = random.uniform(0.06, 0.22) * H
    pts = [q]
    for j in range(1, 5):
        z = q.z - ln * j / 4
        p = surf('torso', Vector((0, 0, z)) + d * 0.6 * H, -d, 0.02 * H) if z > hz else None
        pts.append(p if p else pts[-1] + Vector((0, 0, -ln / 4)))
    drips.append(rod(pts, [0.012 * H, 0.009 * H, 0.008 * H, 0.009 * H, 0.004 * H], 5))
for k in range(6):  # do pescoço estourado escorrendo para o peito
    d = rnd_dir()
    d.z = 0
    if d.length < 1e-3:
        continue
    d.normalize()
    q = Vector((0, 0, 1.7 * H)) + d * 0.05 * H
    drips.append(rod([q, q + d * 0.02 * H + Vector((0, 0, -0.05 * H)), q + d * 0.04 * H + Vector((0, 0, -0.1 * H))], [0.012 * H, 0.009 * H, 0.004 * H], 5))
b.add('slime', merge(*drips), slime, region='body', weight_fn=lambda p: {'hd': 0.3, 'chest': 0.7} if p.z > top else W('torso')(p), subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'interflorado.blend'), check_existing=False)
