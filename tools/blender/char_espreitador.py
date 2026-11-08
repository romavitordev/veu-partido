"""
O ESPREITADOR (chefe da 1ª dungeon do Outro Lado) — public/models/espreitador.glb.
Cânone (wiki "O Espreitador"): criatura de Medo de PELE CINZA ENRUGADA; MUITOS OLHOS AMARELOS cujas pupilas se
multiplicam; LÁGRIMAS; um OLHO GRANDE DENTRO DA BOCA (onde o Kaiser o matou); DENTES TORTOS; PERNAS CURTAS; BRAÇOS E
DEDOS LONGOS.
Versão 3 (2026-11-06), pela REFERÊNCIA DO DONO (o modelo da Tripo AI, 6 vistas): um saco de carne em forma de PERA,
agachado sobre pernas curtíssimas, a pele em DOBRAS GRANDES e saltadas (preto nas dobras, cinza-claro no alto), a
cabeça na frente do alto com um FOCINHO e a BOCA REDONDA de lábio grosso, dentes em anel e o OLHO dentro dela; o alto da
cabeça é um CACHO DE OLHOS, cada um numa ÓRBITA (um montinho de pele com o olho afundado). Olhos grandes de órbita nos
OMBROS e nas COXAS, olhos pequenos nas costas. Mãos enormes de DEDOS MUITO LONGOS e grossos, de ponta clara.
Os olhos: brancos como na referência, com a ÍRIS AMARELA do cânone (PROPOSTA de meio-termo).

TÉCNICA: metaballs (sculpt_lib) num ESQUELETO PRÓPRIO agachado (os mesmos ossos do lutador: as animações são as de
todos). Duas passadas: a 1ª malha (grossa) só serve para achar a superfície onde vão as órbitas; a 2ª já leva os
montinhos e as covas. A cor da pele é uma OCLUSÃO por raios (as dobras escuras) + o relevo.
  node tools/blender/build.mjs espreitador   → public/models/espreitador.glb (+ fonte/espreitador.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from lib import BONES, build_armature
from sculpt_lib import Sculpt, ridge, n3, rod, vcol_material
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'espreitador.glb'
random.seed(211)  # 2:11, a hora do relógio da Mansão

b = Builder(thick=(1, 1, 1, 1))
sk = b.sk


def V(x, y, z):
    return Vector((x, y, z))


# ================================================================ O ESQUELETO AGACHADO (frente = -y)
J = {
    'root': V(0, 0, 0), 'rootTip': V(0, 0, 0.1),
    'hips': V(0, 0.06, 0.58), 'sp': V(0, 0.04, 0.76), 'chest': V(0, -0.08, 1.06),
    'neck': V(0, -0.34, 1.2), 'hd': V(0, -0.48, 1.18), 'top': V(0, -0.56, 1.46),
    'lL': V(0.22, 0.02, 0.5), 'kL': V(0.32, -0.16, 0.28), 'footL': V(0.28, -0.04, 0.07), 'toeL': V(0.29, -0.22, 0.03),
    'sL': V(0.46, -0.2, 1.08), 'eL': V(0.66, -0.36, 0.76), 'handL': V(0.7, -0.56, 0.36), 'handTipL': V(0.72, -0.74, 0.12),
}
for k in list(J):
    if k.endswith('L') and k[:-1] + 'R' not in J:
        q = J[k]
        J[k[:-1] + 'R'] = V(-q.x, q.y, q.z)
sk.j.update(J)
bpy.data.objects.remove(b.arm)
b.arm = build_armature(sk)

# ---------------------------------------------------------------- pesos por distância aos ossos
SEG = {n: (sk[h], sk[t]) for n, h, t, _ in BONES if n != 'root'}


def seg_dist(p, a, c):
    ab = c - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / max(1e-9, ab.length_squared)))
    return (p - (a + ab * t)).length


def bone_w(p, allow, k=3):
    p = Vector(p)
    sc = []
    for n in allow:
        d = seg_dist(p, *SEG[n])
        if n[0] in 'lkf' and p.z > 0.46 and abs(p.x) < 0.2:
            d *= 1.8  # a barriga não segue as coxas
        sc.append((1.0 / (d ** 4 + 1e-7), n))
    sc.sort(reverse=True)
    sc = sc[:k]
    s = sum(w for w, _ in sc)
    return {n: w / s for w, n in sc}


BODY_B = ['hips', 'sp', 'chest', 'neck', 'hd', 'lL', 'kL', 'footL', 'lR', 'kR', 'footR', 'sL', 'sR']
ARM_B = {s: ['chest', 's' + s, 'e' + s, 'hand' + s] for s in 'LR'}

# ---------------------------------------------------------------- materiais
skin = vcol_material('pele_espreitador', rough=0.72)
sclera = material('olho_espreitador', '#e9e4d2', 0.25, emission='#f4ecd0', strength=0.45)
iris = material('glow_iris_espreitador', '#e2ad22', 0.3, emission='#f2c230', strength=1.6)
pupil = material('fine_pupila_espreitador', '#050404', 0.2)
tear = material('lagrima_espreitador', '#a9bcc8', 0.15)
mouth_in = material('boca_espreitador', '#120707', 0.8)
tooth = material('dente_espreitador', '#d2cbb4', 0.5)
nail = material('unha_espreitador', '#141210', 0.45)
COL = {k: Vector(hex_rgb(v)) for k, v in {'fundo': '#151413', 'pele': '#363431', 'alto': '#8f8b83', 'ponta': '#d6d2c8'}.items()}
MB = 1 / 0.575  # o metaball sozinho aparece em 0,575 × o raio: os raios abaixo são os da superfície


def r3(x, y=None, z=None):
    return (x * MB, (y if y is not None else x) * MB, (z if z is not None else x) * MB)


def lim(t):
    return max(0.0, min(1.0, t))


def fine(p):
    """o enrugado fino por cima das dobras grandes"""
    return 0.0035 * (ridge(p.z * 55 + n3(p, 2.4) * 7 + n3(p, 8) * 2, 3) - 0.3)


# ================================================================ O CORPO (a pera de carne)
HC = V(0, -0.47, 1.22)  # o centro da cabeça
FWD = V(0, -1, -0.32).normalized()  # para onde o focinho aponta
SNOUT = HC + FWD * 0.17
MOUTH = HC + FWD * 0.3  # o centro da boca redonda
MUP = V(0, 0.32, 1).normalized()  # o "cima" da boca (perpendicular ao focinho)
MSIDE = V(1, 0, 0)


def body_sculpt():
    S = Sculpt()
    S.ell(V(0, -0.08, 0.6), r3(0.4, 0.36, 0.38))  # a barriga enorme
    S.ell(V(0, -0.18, 0.44), r3(0.3, 0.22, 0.2))  # caída na frente
    S.ell(V(0, 0.14, 0.56), r3(0.36, 0.28, 0.3))  # o traseiro largo
    S.chain([V(0, 0.1, 0.74), V(0, 0.1, 1.0), V(0, -0.04, 1.2), V(0, -0.24, 1.3)], [0.3 * MB, 0.29 * MB, 0.25 * MB, 0.2 * MB])  # a corcunda
    for s in (1, -1):
        side = 'L' if s > 0 else 'R'
        S.chain([V(0.14 * s, -0.08, 1.16), V(0.44 * s, -0.2, 1.08)], [0.17 * MB, 0.15 * MB])  # os ombros
        S.chain([V(0.2 * s, 0.0, 0.52), sk['k' + side]], [0.2 * MB, 0.15 * MB])  # as coxas
        kk, ff = sk['k' + side], sk['foot' + side]
        S.chain([kk, ff + V(0, 0, 0.02)], [0.1 * MB, 0.07 * MB])  # canela curtíssima
        S.ell(ff + V(0, -0.07, -0.03), r3(0.09, 0.13, 0.045))  # o pé
    # AS DOBRAS GRANDES: fileiras de bolsas de carne em volta do corpo (a barriga em faixas, as costas em placas)
    for row, z in enumerate((0.34, 0.47, 0.6, 0.73, 0.86, 0.99)):
        rx = 0.4 - abs(z - 0.62) * 0.35
        ry = 0.36 - abs(z - 0.62) * 0.3
        n = 9
        for i in range(n):
            a = -math.pi + (i + 0.5 + (row % 2) * 0.5) * 2 * math.pi / n + random.uniform(-0.12, 0.12)
            cy = -0.04 + (0.06 if math.cos(a) < 0 else -0.02)
            c = V(math.sin(a) * rx * 0.86, -math.cos(a) * ry * 0.86 + cy, z + random.uniform(-0.02, 0.02))
            front = math.cos(a) > 0.3
            S.ell(c, r3(0.11 if front else 0.12, 0.08, 0.06 if front else 0.075))
    # placas na corcunda
    for i in range(7):
        t = i / 6
        c = V(0, 0.27, 0.78).lerp(V(0, 0.1, 1.22), t) + V(0, 0.04 * math.sin(t * 3), 0)
        for s in (-1, 1):
            S.ell(c + V(s * 0.1, 0, 0), r3(0.1, 0.06, 0.06))
    # A CABEÇA: o crânio, o focinho para a frente e a boca redonda (o buraco + o lábio grosso em anel)
    S.ell(HC, r3(0.19, 0.19, 0.2))
    S.chain([V(0, -0.2, 1.18), HC], [0.17 * MB, 0.18 * MB])
    S.ell(SNOUT, r3(0.15, 0.15, 0.15))
    for i in range(16):
        a = i / 16 * math.pi * 2
        q = MOUTH + MSIDE * math.sin(a) * 0.1 + MUP * math.cos(a) * 0.12 - FWD * 0.02
        S.ell(q, r3(0.045))
    S.ell(MOUTH + FWD * 0.03, r3(0.07, 0.07, 0.085), neg=True)
    S.ell(MOUTH - FWD * 0.05, r3(0.05, 0.05, 0.06), neg=True)
    return S


# 1ª passada: a casca grossa, só para achar onde ficam as órbitas
S0 = body_sculpt()
m0 = S0.mesh(res=0.02, smooth=2)
T0 = BVHTree.FromPolygons([Vector(v) for v in m0[0]], m0[1])


def surf(tree, origin, d):
    d = d.normalized()
    hit = tree.ray_cast(origin + d * 1.2, -d)
    return (hit[0], hit[1].normalized()) if hit[0] is not None else (None, None)


# AS ÓRBITAS: (origem, direção, raio do olho, ossos, lágrima)
SPOTS = []
# o CACHO de olhos no alto da cabeça (de muitos tamanhos)
placed = []
for _ in range(4000):
    if len(placed) >= 34:
        break
    th = random.uniform(-2.0, 2.0)
    ph = random.uniform(0.2, 1.5)
    d = V(math.sin(th) * math.cos(ph), -math.cos(th) * math.cos(ph), math.sin(ph))
    if d.dot(FWD) > 0.55:
        continue  # a frente-baixo é o focinho
    R = random.uniform(0.022, 0.04) * (1.25 if ph < 0.7 else 1.0)
    p, n = surf(T0, HC, d)
    if p is None or any((p - q).length < (R + r) * 1.5 for q, r in placed):
        continue
    placed.append((p, R))
    SPOTS.append((HC, d, R, ['hd'], 0.25 if ph < 0.6 else 0.0))
for s in (1, -1):
    side = 'L' if s > 0 else 'R'
    SPOTS.append((V(0.4 * s, -0.16, 1.08), V(0.85 * s, -0.4, 0.3), 0.07, BODY_B, 1))  # o OLHÃO do ombro
    SPOTS.append((sk['k' + side] + V(0, 0.05, 0.05), V(0.45 * s, -1, 0.05), 0.06, BODY_B, 1))  # o da coxa/joelho
    SPOTS.append((V(0.2 * s, -0.1, 0.95), V(0.5 * s, -0.8, 0.2), 0.035, BODY_B, 0.5))
    SPOTS.append((V(0.3 * s, 0.0, 0.7), V(0.95 * s, -0.25, 0.1), 0.03, BODY_B, 0))
for i in range(5):  # os olhinhos das costas, ao longo da corcunda
    z = 0.62 + i * 0.12
    SPOTS.append((V(random.uniform(-0.12, 0.12), 0.05, z), V(random.uniform(-0.25, 0.25), 1, 0.15), random.uniform(0.022, 0.03), BODY_B, 0))

EYES = []  # (centro do olho, normal, R, ossos, lágrima)
for o, d, R, bones, drip in SPOTS:
    p, n = surf(T0, o, d)
    if p is None:
        continue
    EYES.append((p, n, R, bones, drip))

# 2ª passada: o corpo com as órbitas (o montinho de pele + a cova onde o olho afunda)
S = body_sculpt()
for p, n, R, _, _ in EYES:
    S.ell(p - n * R * 0.3, r3(R * 1.5))
    S.ell(p + n * R * 0.9, r3(R * 0.9), neg=True)
body_mesh = S.mesh(res=0.0085, smooth=3, disp=fine, target=22000)
bo = b.add('body', body_mesh, skin, region='torso', weight_fn=lambda p: bone_w(p, BODY_B), subdiv=0)
for pl in bo.data.polygons:
    pl.use_smooth = True
TB = BVHTree.FromPolygons([Vector(v) for v in body_mesh[0]], body_mesh[1])


# ---------------------------------------------------------------- a cor: OCLUSÃO por raios (dobras pretas, alto claro)
DIRS = []
for i in range(14):  # direções espalhadas na esfera (espiral de Fibonacci)
    y = 1 - 2 * (i + 0.5) / 14
    r = math.sqrt(1 - y * y)
    a = i * 2.39996
    DIRS.append(V(math.cos(a) * r, math.sin(a) * r, y))


def paint_ao(obj, trees, reach=0.14, tip=None):
    me = obj.data
    ca = me.color_attributes.get('Col') or me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    mw = obj.matrix_world
    nm = mw.to_3x3()
    for v in me.vertices:
        p = mw @ v.co
        n = (nm @ v.normal).normalized()
        occ, tot = 0.0, 0
        for d in DIRS:
            k = d.dot(n)
            if k <= 0.05:
                continue
            tot += k
            o = p + n * 0.004
            for t in trees:
                hit = t.ray_cast(o, d, reach)
                if hit[0] is not None:
                    occ += k * (1 - hit[3] / reach)
                    break
        a = lim(occ / max(tot, 1e-6) * 1.9)
        hi = lim(1 - a * 1.6) * (0.55 + 0.45 * lim(n3(p, 3.2) * 0.8 + 0.5))
        c = COL['pele'].lerp(COL['alto'], hi * 0.85).lerp(COL['fundo'], a)
        if p.z < 0.3 and abs(p.x) < 0.25:
            c = c.lerp(COL['fundo'], 0.35)  # por baixo, na sombra
        if tip:
            c = c.lerp(COL['ponta'], tip(p))
        ca.data[v.index].color = (c[0], c[1], c[2], 1)


# ================================================================ OS BRAÇOS grossos e as MÃOS de dedos muito longos
ARMS = {}
for s in 'LR':
    A = Sculpt()
    A.chain([sk['s' + s] + V(0, 0, 0.03), sk['e' + s]], [0.12 * MB, 0.095 * MB])
    A.ell(sk['e' + s], r3(0.1, 0.095, 0.095))
    A.chain([sk['e' + s], sk['hand' + s] + V(0, 0, 0.05)], [0.095 * MB, 0.075 * MB])
    for k in range(3):  # dobras no braço
        q = sk['s' + s].lerp(sk['e' + s], 0.25 + k * 0.25)
        A.ell(q + V(0, -0.02, 0), r3(0.11, 0.1, 0.05))
    pc = sk['hand' + s] + V(0, -0.05, -0.06)
    A.ell(pc, r3(0.15, 0.1, 0.12))  # a palma grande
    am = A.mesh(res=0.0095, smooth=3, disp=fine, target=6000)
    ao = b.add('arm' + s, am, skin, region='torso', weight_fn=lambda p, s=s: bone_w(p, ARM_B[s], 2), subdiv=0)
    for pl in ao.data.polygons:
        pl.use_smooth = True
    ARMS[s] = (ao, BVHTree.FromPolygons([Vector(v) for v in am[0]], am[1]), pc)

paint_ao(bo, [TB] + [ARMS[s][1] for s in 'LR'])
for s in 'LR':
    paint_ao(ARMS[s][0], [ARMS[s][1], TB])

# OS DEDOS (6 por mão, como a referência): longos, grossos na base, com nós, as pontas claras se curvando para baixo
for s in 'LR':
    sx = 1 if s == 'L' else -1
    pc = ARMS[s][2]
    fingers, nails_ = [], []
    for i in range(6):
        thumb = i == 5
        t = (i - 2) / 2 if not thumb else 0
        base = pc + V(sx * (t * 0.11 if not thumb else -0.12), -0.07, -0.05 + (0.06 if thumb else 0))
        d = V(sx * t * 0.45 + (sx * -0.9 if thumb else 0), -1, -0.35).normalized()
        L = [0.2, 0.17, 0.14, 0.1] if not thumb else [0.13, 0.11, 0.08]
        L = [x * (1 - abs(t) * 0.1) * random.uniform(0.92, 1.08) for x in L]
        pts = [base]
        for k, l in enumerate(L):
            d = (d + V(sx * random.uniform(-0.15, 0.15), -0.05, -0.28 - 0.1 * k)).normalized()
            pts.append(pts[-1] + d * l)
        for j, q in enumerate(pts):  # nada abaixo do chão: a ponta encosta e se arrasta para a frente
            if q.z < 0.03:
                pts[j] = V(q.x, q.y - (0.03 - q.z) * 0.6, 0.03)
        rad = [0.045, 0.04, 0.034, 0.026, 0.016][:len(pts)]
        fpts, frad = [], []
        for j in range(len(pts) - 1):
            a, c = pts[j], pts[j + 1]
            fpts += [a, a.lerp(c, 0.5)]
            frad += [rad[j] * 1.18, rad[j] * 0.86]
        fpts.append(pts[-1])
        frad.append(rad[len(pts) - 1])
        fingers.append(rod(fpts, frad, 8))
        tip_ = pts[-1]
        nails_.append(cone(tuple(tip_), tuple(tip_ + (pts[-1] - pts[-2]).normalized() * 0.05 + V(0, 0, -0.01)), 0.014, 6))
    fo = b.add('fingers' + s, merge(*fingers), skin, region='torso', weight_fn=lambda p, s=s: {'hand' + s: 1.0}, subdiv=0)
    FT = BVHTree.FromObject(fo, bpy.context.evaluated_depsgraph_get())
    paint_ao(fo, [FT], reach=0.06, tip=lambda p, pc=pc: lim(((p - pc).length - 0.3) / 0.3) * 0.8)
    b.add('nails' + s, merge(*nails_), nail, region='torso', weight_fn=lambda p, s=s: {'hand' + s: 1.0}, subdiv=0)

# o PÉ: dedinhos tortos com unhas escuras
for s_ in 'LR':
    ff = sk['foot' + s_]
    toes, tnails = [], []
    for i in range(4):
        a = (i - 1.5) * 0.4 + random.uniform(-0.12, 0.12)
        L = random.uniform(0.06, 0.1)
        base = ff + V(math.sin(a) * 0.06, -0.15, -0.04)
        tip_ = base + V(math.sin(a) * L * 0.6, -L, -0.02)
        toes.append(rod([base, base.lerp(tip_, 0.5) + V(0, 0, 0.012), tip_], [0.022, 0.018, 0.012], 6))
        tnails.append(cone(tuple(tip_), tuple(tip_ + V(0, -0.03, -0.01)), 0.011, 6))
    fo = b.add('toes' + s_, merge(*toes), skin, region='torso', weight_fn=lambda p, s_=s_: {'foot' + s_: 1.0}, subdiv=0)
    paint_ao(fo, [TB], reach=0.05)
    b.add('toenails' + s_, merge(*tnails), nail, region='torso', weight_fn=lambda p, s_=s_: {'foot' + s_: 1.0}, subdiv=0)

# ================================================================ A BOCA: o fundo escuro, os dentes em anel e o OLHO dentro
b.add('mouthIn', ellipsoid(tuple(MOUTH - FWD * 0.1), (0.09, 0.09, 0.1), 16, 12), mouth_in, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
teeth = []
for ring, (rad, n) in enumerate(((0.072, 18), (0.058, 14))):
    for i in range(n):
        a = (i + 0.5 * ring) / n * math.pi * 2 + random.uniform(-0.08, 0.08)
        out = MSIDE * math.sin(a) + MUP * math.cos(a)
        base = MOUTH + out * rad * (1.12 if ring == 0 else 1.0) - FWD * (0.0 + 0.03 * ring)
        L = random.uniform(0.03, 0.055)
        tip_ = base - out * L * 0.9 - FWD * random.uniform(0.0, 0.02) + V(random.uniform(-0.008, 0.008), 0, random.uniform(-0.008, 0.008))
        teeth.append(cone(tuple(base), tuple(tip_), 0.008 + random.random() * 0.005, 6))
b.add('teeth', merge(*teeth), tooth, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
me_c = MOUTH - FWD * 0.05
b.add('mouthEye', ellipsoid(tuple(me_c), (0.05, 0.048, 0.05), 18, 14), sclera, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
b.add('mouthIris', ellipsoid(tuple(me_c + FWD * 0.05), (0.03, 0.012, 0.03), 14, 8), iris, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
# o olho da boca: as duas pupilas em 8 (wiki: "o olho de duas pupilas" na fresta do armário)
for k in (1, -1):
    b.add(f'mouthPupil{k}', ellipsoid(tuple(me_c + FWD * 0.058 + MUP * 0.0125 * k), (0.012, 0.006, 0.0125), 10, 8), pupil, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
# a SALIVA escorrendo (wiki: confundida com as lágrimas)
drool = []
for i in range(4):
    a = math.pi + random.uniform(-0.6, 0.6)
    top = MOUTH + MSIDE * math.sin(a) * 0.09 + MUP * math.cos(a) * 0.11 + FWD * 0.03
    L = random.uniform(0.08, 0.18)
    drool.append(rod([top + V(random.uniform(-0.004, 0.004), -0.003 * k, -L * k / 3) for k in range(4)], [0.006, 0.004, 0.003, 0.007], 5))
b.add('drool', merge(*drool), tear, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

# ================================================================ OS OLHOS nas órbitas (brancos, íris amarela, pupilas que se multiplicam)
eyes, irises, pups, more, tears = [], [], [], [], []
for p0, n0, R, bones, drip in EYES:
    p, n = surf(TB, p0, n0)  # o fundo da órbita na malha final
    if p is None or (p - p0).length > R * 3:
        p, n = p0, n0
    n = n0
    c = p + n * R * 0.6  # o olho saltado de dentro da órbita
    w = bone_w(c, bones, 1)
    eyes.append((ellipsoid(tuple(c), (R * 1.05, R * 1.05, R * 1.05), 14, 10), w))
    side = n.cross(V(0, 0, 1))
    side = side.normalized() if side.length > 1e-3 else V(1, 0, 0)
    up = side.cross(n).normalized()
    look = (n + V(random.uniform(-0.25, 0.25), random.uniform(-0.25, 0.25), random.uniform(-0.2, 0.2))).normalized()
    irises.append((ellipsoid(tuple(c + look * R * 0.98), (R * 0.5, R * 0.5, R * 0.5), 10, 8), w))
    # PUPILAS EM 8 (wiki: "o olho de duas pupilas"; "pupilas que se multiplicam com o passar do tempo"): as duplas
    # nascem COLADAS uma em cima da outra, como um 8, e não espalhadas. Um terço dos olhos já tem o 8; os outros ganham
    # a 2ª pupila (e alguns a 3ª, emendada no 8) na peça `morePupils`, que só aparece quando elas se multiplicam
    # (transformação e Fortalecer sem Devorado). PROPOSTA: a proporção e o tamanho.
    tilt = random.uniform(-0.35, 0.35)
    axis = (up * math.cos(tilt) + side * math.sin(tilt)).normalized()
    pr = R * 0.25
    front = c + look * R * 1.36  # para fora da íris (antes a pupila ficava enterrada nela e não aparecia)
    eight = random.random() < 0.35
    chain = [front + axis * pr * 0.82, front - axis * pr * 0.82] if eight else [front]
    for q in chain:
        pups.append((ellipsoid(tuple(q), (pr, pr, pr), 8, 6), w))
    if eight:
        if random.random() < 0.4:  # o 8 vira um 3 em fila
            more.append((ellipsoid(tuple(front - axis * pr * 2.4 - look * R * 0.06), (pr * 0.85, pr * 0.85, pr * 0.85), 8, 6), w))
    else:
        more.append((ellipsoid(tuple(front - axis * pr * 1.64), (pr, pr, pr), 8, 6), w))
    if random.random() < drip:  # as LÁGRIMAS escorrendo pela pele
        L = random.uniform(0.05, 0.11)
        pts = []
        for i in range(5):
            q = c + up * -R * 0.2 + V(random.uniform(-0.003, 0.003), 0, -R * 0.9 - L * i / 4)
            loc, nn, _, _ = TB.find_nearest(q)
            pts.append(loc + nn.normalized() * 0.004 if loc is not None else q)
        tears.append((rod(pts, [R * 0.09, R * 0.075, R * 0.07, R * 0.06, R * 0.1], 5), w))

for nm, lst, mat in (('eyes', eyes, sclera), ('irises', irises, iris), ('pupils', pups, pupil), ('tears', tears, tear)):
    for i, (part, w) in enumerate(lst):
        b.add(f'{nm}{i}', part, mat, region='torso', weight_fn=lambda p, w=w: w, subdiv=0)
# as pupilas que se multiplicam: uma peça só (prop), escondida no jogo até a transformação (models/props.js)
for i, (part, w) in enumerate(more):
    b.add(f'morePupils{i}', part, pupil, region='torso', weight_fn=lambda p, w=w: w, subdiv=0)
b.group('morePupils', 'prop_morePupils')

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'espreitador.blend'), check_existing=False)
