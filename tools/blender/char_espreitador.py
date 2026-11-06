"""
O ESPREITADOR (chefe da 1ª dungeon do Outro Lado) — public/models/espreitador.glb.
Cânone (wiki "O Espreitador"): criatura de Medo de PELE CINZA ENRUGADA; MUITOS OLHOS AMARELOS cujas pupilas se
multiplicam; LÁGRIMAS; um OLHO GRANDE DENTRO DA BOCA (onde o Kaiser o matou); DENTES TORTOS; PERNAS CURTAS; BRAÇOS E
DEDOS LONGOS.
Pelas artes de referência do dono (2026-11-05): NADA de corpo humano. É um bicho grande e AGACHADO: corcunda alta, a
cabeça afundada na frente da corcunda com uma MASSA DE OLHOS no alto, barriga grande e caída, coxas grossas e pernas
curtas dobradas, braços que chegam no chão e MÃOS GRANDES de dedos compridos como galhos (com nós). Olhos também no
ombro, no braço e na coxa.

TÉCNICA: tudo esculpido do zero com metaballs (sculpt_lib) num ESQUELETO PRÓPRIO — os mesmos ossos e nomes do lutador
(as animações são as de todos), mas com o repouso já agachado: quadril baixo, joelhos para a frente, o peito e a
cabeça projetados e as mãos no chão. As rotações das poses são aplicadas no espaço do personagem (glbRig A·q·B),
então o corpo dobrado continua animando certo.
Pesos: por distância aos ossos (sem o corpo base), e cada olho preso inteiro ao osso do lugar onde está.
  node tools/blender/build.mjs espreitador   → public/models/espreitador.glb (+ fonte/espreitador.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from lib import BONES, build_armature
from sculpt_lib import Sculpt, ridge, n3, rod, vcol_material, paint
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'espreitador.glb'
random.seed(211)  # 2:11, a hora do relógio da Mansão

b = Builder(thick=(1, 1, 1, 1))  # sem o "engrossar" do lutador: as formas abaixo já são as finais
sk = b.sk
H = sk.h  # 1.0


def V(x, y, z):
    return Vector((x, y, z))


# ================================================================ O ESQUELETO AGACHADO (frente = -y)
J = {
    'root': V(0, 0, 0), 'rootTip': V(0, 0, 0.1),
    'hips': V(0, 0.06, 0.6), 'sp': V(0, 0.04, 0.76), 'chest': V(0, -0.1, 1.06),
    'neck': V(0, -0.36, 1.18), 'hd': V(0, -0.5, 1.14), 'top': V(0, -0.62, 1.44),
    'lL': V(0.2, 0.05, 0.56), 'kL': V(0.28, -0.14, 0.32), 'footL': V(0.26, 0.0, 0.08), 'toeL': V(0.27, -0.2, 0.03),
    'sL': V(0.44, -0.22, 1.12), 'eL': V(0.68, -0.34, 0.74), 'handL': V(0.74, -0.5, 0.32), 'handTipL': V(0.78, -0.62, 0.08),
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
        if n[0] in 'lkf' and n not in ('chest',) and p.z > 0.5 and abs(p.x) < 0.16:
            d *= 1.8  # a barriga não segue as coxas
        sc.append((1.0 / (d ** 4 + 1e-7), n))
    sc.sort(reverse=True)
    sc = sc[:k]
    s = sum(w for w, _ in sc)
    return {n: w / s for w, n in sc}


BODY_B = ['hips', 'sp', 'chest', 'neck', 'hd', 'lL', 'kL', 'footL', 'lR', 'kR', 'footR', 'sL', 'sR']
ARM_B = {s: ['chest', 's' + s, 'e' + s, 'hand' + s] for s in 'LR'}

# ---------------------------------------------------------------- materiais e pele
skin = vcol_material('pele_espreitador', rough=0.8)
eye_y = material('glow_olho_espreitador', '#ffd23a', 0.35, emission='#f2c230', strength=2.2)
pupil = material('pupila_espreitador', '#0a0806', 0.3)
tear = material('lagrima_espreitador', '#a9bcc8', 0.15)
mouth_in = material('boca_espreitador', '#24090a', 0.7)
tooth = material('dente_espreitador', '#cbbf98', 0.55)
gum = material('gengiva_espreitador', '#5a2a28', 0.65)
nail = material('unha_espreitador', '#1c1814', 0.5)
C = {k: Vector(hex_rgb(v)) for k, v in {'pele': '#86817a', 'dobra': '#47433e', 'alto': '#a8a399', 'barriga': '#958f84'}.items()}
AMP = 0.006
MB = 1 / 0.575  # o metaball sozinho aparece em 0,575 × o raio: os raios abaixo são os da superfície


def lim(t):
    return max(0.0, min(1.0, t))


def wrinkle(p, dense=1.0):
    """as rugas: dobras tortas de pele velha caída"""
    w = n3(p, 2.2) * 6.0 + n3(p, 7.0) * 2.0
    fade = 0.35 + 0.65 * max(0.0, n3(p + V(3.1, 0.7, 1.9), 4.0) + 0.25)
    return AMP * fade * (ridge(p.z * 60 * dense + w, 4) - 0.25)


def skin_col(p):
    k = lim(wrinkle(p) / AMP + 0.25)
    c = C['pele'].lerp(C['dobra'], (1 - k) * 0.4)
    c = c.lerp(C['alto'], lim(n3(p, 3.0) * 0.5 + 0.2) * 0.3)
    if p.y < -0.1 and p.z < 0.85:  # a barriga um pouco mais clara
        c = c.lerp(C['barriga'], 0.4)
    return c


def r3(x, y, z):
    return (x * MB, y * MB, z * MB)


# ================================================================ O CORPO: corcunda, barriga, coxas e a cabeça
S = Sculpt()
S.ell(V(0, -0.1, 0.66), r3(0.33, 0.3, 0.29))  # a barriga grande
S.ell(V(0, -0.2, 0.5), r3(0.24, 0.18, 0.16))  # caída na frente
S.ell(V(0, 0.08, 0.62), r3(0.3, 0.24, 0.24))  # o traseiro
S.chain([V(0, 0.12, 0.74), V(0, 0.12, 1.0), V(0, 0.0, 1.24), V(0, -0.2, 1.32)], [0.28 * MB, 0.27 * MB, 0.24 * MB, 0.19 * MB])  # a corcunda
for s in (1, -1):
    S.chain([V(0.12 * s, -0.06, 1.2), V(0.42 * s, -0.21, 1.13)], [0.16 * MB, 0.13 * MB])  # os ombros caídos
    S.chain([V(0.2 * s, 0.04, 0.62), sk['k' + ('L' if s > 0 else 'R')]], [0.19 * MB, 0.13 * MB])  # as coxas grossas
    kk = sk['k' + ('L' if s > 0 else 'R')]
    ff = sk['foot' + ('L' if s > 0 else 'R')]
    S.chain([kk, ff + V(0, 0, 0.02)], [0.11 * MB, 0.08 * MB])  # canela curta
    S.ell(ff + V(0, -0.08, -0.03), r3(0.1, 0.15, 0.05))  # o pé largo
# as VÉRTEBRAS saltando na corcunda (a pele esticada por cima)
for i in range(9):
    t = i / 8
    q = V(0, 0.12, 0.7).lerp(V(0, 0.12, 1.02), min(1, t * 1.6)) if t < 0.62 else V(0, 0.12, 1.02).lerp(V(0, -0.16, 1.36), (t - 0.62) / 0.38)
    q = q + V(0, 0.27, 0) if t < 0.62 else q + V(0, 0.2 * (1 - (t - 0.62) / 0.38) + 0.12, 0.12)
    S.ell(q, r3(0.05, 0.035, 0.035))
# a cabeça afundada na frente da corcunda (sem pescoço), a mandíbula larga e a boca cavada
HC = V(0, -0.54, 1.18)
S.ell(HC, r3(0.21, 0.2, 0.18))
S.chain([V(0, -0.2, 1.16), HC], [0.16 * MB, 0.17 * MB])  # o 'pescoço' é só a corcunda descendo para a cabeça
S.ell(V(0, -0.6, 1.05), r3(0.19, 0.15, 0.1))
S.ell(V(0, -0.77, 1.05), r3(0.22, 0.1, 0.085), neg=True)  # a boca aberta (dentes e o olho à mostra)
MOUTH = V(0, -0.7, 1.05)
body_mesh = S.mesh(res=0.012, smooth=3, disp=lambda p: wrinkle(p, 1.2), target=9000)
bo = b.add('body', body_mesh, skin, region='torso', weight_fn=lambda p: bone_w(p, BODY_B), subdiv=0)
for pl in bo.data.polygons:
    pl.use_smooth = True
paint(bo, skin_col)
BVH = {'body': BVHTree.FromPolygons([Vector(v) for v in body_mesh[0]], body_mesh[1])}

# ================================================================ OS BRAÇOS LONGOS (finos, com o cotovelo nodoso)
for s in 'LR':
    A = Sculpt()
    A.chain([sk['s' + s] + V(0, 0, 0.02), sk['e' + s]], [0.11 * MB, 0.08 * MB])
    A.ell(sk['e' + s], r3(0.09, 0.085, 0.085))  # o cotovelo nodoso
    A.chain([sk['e' + s], sk['hand' + s] + V(0, 0, 0.04)], [0.08 * MB, 0.065 * MB])
    # a palma grande, um pouco achatada
    pc = sk['hand' + s] + V(0, -0.04, -0.05)
    A.ell(pc, r3(0.13, 0.08, 0.12))  # a MÃO GRANDE
    am = A.mesh(res=0.01, smooth=3, disp=lambda p: wrinkle(p, 1.6) * 0.6, target=4000)
    ao = b.add('arm' + s, am, skin, region='torso', weight_fn=lambda p, s=s: bone_w(p, ARM_B[s], 2), subdiv=0)
    for pl in ao.data.polygons:
        pl.use_smooth = True
    paint(ao, skin_col)
    BVH['arm' + s] = BVHTree.FromPolygons([Vector(v) for v in am[0]], am[1])
    # OS DEDOS COMPRIDOS como galhos: 4 + o polegar, três falanges com nós, as pontas tocando o chão à frente
    sx = 1 if s == 'L' else -1
    fingers, nails_ = [], []
    for i in range(5):
        thumb = i == 4
        t = (i - 1.5) / 1.5 if not thumb else 0
        base = pc + V(sx * (t * 0.1 if not thumb else -0.11), -0.05 - (0.02 if thumb else 0), -0.08 + (0.05 if thumb else 0))
        spread = V(sx * t * 0.55 + (sx * -0.8 if thumb else 0), -0.35, -1).normalized()
        L = (0.2, 0.18, 0.16) if not thumb else (0.14, 0.12, 0.1)
        L = tuple(x * (1 - abs(t) * 0.12) for x in L)
        pts = [base]
        d = spread
        for k, l in enumerate(L):
            # cada falange dobra mais para a frente (as pontas viram para o chão à frente, como garras de galho)
            d = (d + V(sx * random.uniform(-0.12, 0.12), -0.35 - 0.15 * k, 0.12 * k)).normalized()
            pts.append(pts[-1] + d * l)
        if pts[-1].z < 0.02:  # nada abaixo do chão
            dz = 0.02 - pts[-1].z
            pts = [q + V(0, 0, dz * (j / 3)) for j, q in enumerate(pts)]
        rad = [0.036, 0.032, 0.026, 0.015]
        fpts, frad = [], []
        for j in range(3):  # os nós: o raio incha em cada junta
            a, c = pts[j], pts[j + 1]
            fpts += [a, a.lerp(c, 0.5)]
            frad += [rad[j] * 1.15, rad[j] * 0.8]
        fpts.append(pts[3])
        frad.append(rad[3])
        fingers.append(rod(fpts, frad, 7))
        tip = pts[3]
        nails_.append(cone(tuple(tip), tuple(tip + d * 0.08 + V(0, 0, -0.015)), 0.014, 6))
    fo = b.add('fingers' + s, merge(*fingers), skin, region='torso', weight_fn=lambda p, s=s: {'hand' + s: 1.0}, subdiv=0)
    paint(fo, skin_col)
    b.add('nails' + s, merge(*nails_), nail, region='torso', weight_fn=lambda p, s=s: {'hand' + s: 1.0}, subdiv=0)

# ================================================================ A BOCA: dentes tortos e o OLHO GRANDE dentro dela
b.add('mouthIn', ellipsoid(tuple(MOUTH + V(0, 0.03, 0)), (0.17, 0.05, 0.07), 16, 10), mouth_in, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
teeth, gums = [], []
for row, zs, dz in ((0, 0.05, -1), (1, -0.052, 1)):
    n = 17 if row == 0 else 15
    arc = []
    for i in range(n):
        t = (i + 0.5) / n
        a = (t - 0.5) * 2.4
        base = MOUTH + V(math.sin(a) * 0.15, -math.cos(a) * 0.05 - 0.01, zs)
        arc.append(base)
        L = 0.04 + random.random() * 0.045  # wiki: dentes tortos e COMPRIDOS
        tip = base + V(random.uniform(-0.02, 0.02), random.uniform(-0.02, 0.006), dz * L)
        teeth.append(cone(tuple(base), tuple(tip), 0.007 + random.random() * 0.005, 6))
    gums.append(rod(arc, [0.01] * len(arc), 5))
b.add('teeth', merge(*teeth), tooth, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
b.add('gums', merge(*gums), gum, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
me_c = MOUTH + V(0, -0.02, 0)
b.add('mouthEye', ellipsoid(tuple(me_c), (0.045, 0.036, 0.042), 16, 12), eye_y, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
b.add('mouthPupil', ellipsoid(tuple(me_c + V(0, -0.032, 0)), (0.011, 0.005, 0.02), 10, 8), pupil, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)


# a SALIVA escorrendo da boca (wiki: "sai saliva que pode ser confundida com as lágrimas")
drool = []
for i in range(5):
    x = random.uniform(-0.08, 0.08)
    top = MOUTH + V(x, -0.03, -0.04)
    L = random.uniform(0.08, 0.2)
    pts = [top + V(random.uniform(-0.005, 0.005), -0.004 * k, -L * k / 3) for k in range(4)]
    drool.append(rod(pts, [0.006, 0.004, 0.003, 0.007], 5))
b.add('drool', merge(*drool), tear, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
# o PÉ DEFORMADO (wiki): dedos tortos e desiguais, com unhas escuras
for s_ in 'LR':
    ff = sk['foot' + s_]
    toes, tnails = [], []
    for i in range(4):
        a = (i - 1.5) * 0.38 + random.uniform(-0.15, 0.15)
        L = random.uniform(0.06, 0.12)
        base = ff + V(math.sin(a) * 0.07, -0.16, -0.04)
        tip = base + V(math.sin(a) * L * 0.6, -L, -0.02)
        toes.append(rod([base, base.lerp(tip, 0.5) + V(0, 0, 0.015), tip], [0.026, 0.022, 0.014], 6))
        tnails.append(cone(tuple(tip), tuple(tip + V(0, -0.03, -0.01)), 0.012, 6))
    fo = b.add('toes' + s_, merge(*toes), skin, region='torso', weight_fn=lambda p, s_=s_: {'foot' + s_: 1.0}, subdiv=0)
    paint(fo, skin_col)
    b.add('toenails' + s_, merge(*tnails), nail, region='torso', weight_fn=lambda p, s_=s_: {'foot' + s_: 1.0}, subdiv=0)

# ================================================================ OS OLHOS: a massa no alto da cabeça + ombro, braço, coxa
def on_surf(tree, origin, d):
    hit = tree.ray_cast(origin + d * 1.0, -d)  # de fora para dentro: a casca de fora
    if hit[0] is None:
        return None, None
    return hit[0], hit[1]


eyes, pups, tears = [], [], []


def eye_at(tree, origin, d, R, bones, drip=0.5):
    surf, nrm = on_surf(tree, origin, d.normalized())
    if surf is None:
        return
    n = nrm.normalized()
    c = surf + n * R * 0.5  # saltado da pele (os olhos se amontoam como bolhas)
    w = bone_w(c, bones, 1)
    eyes.append((ellipsoid(tuple(c), (R, R, R * 0.9), 14, 10), w))
    n_p = 1 + (random.random() < 0.45) + (random.random() < 0.2)  # as pupilas que se multiplicam
    side = n.cross(V(0, 0, 1))
    if side.length < 1e-3:
        side = V(1, 0, 0)
    side.normalize()
    up = side.cross(n).normalized()
    for k in range(n_p):
        off = (side * random.uniform(-0.42, 0.42) + up * random.uniform(-0.3, 0.3)) * R if n_p > 1 else Vector()
        pups.append((ellipsoid(tuple(c + n * R * 0.86 + off), (R * 0.27, R * 0.27, R * 0.27), 8, 6), w))
    if random.random() < drip:  # as LÁGRIMAS escorrendo pela pele
        L = random.uniform(0.04, 0.09)
        pts = []
        for i in range(5):
            q = c + V(random.uniform(-0.003, 0.003), 0, -R * 0.9 - L * i / 4)
            loc, n_, _, _ = tree.find_nearest(q)
            pts.append(loc + n_.normalized() * 0.004 if loc is not None else q)
        tears.append((rod(pts, [R * 0.09, R * 0.075, R * 0.07, R * 0.06, R * 0.1], 5), w))


# a MASSA DE OLHOS: amontoados no alto e na frente da cabeça, grandes e pequenos
placed = []
for _ in range(3000):
    if len(placed) >= 70:
        break
    th = random.uniform(-1.7, 1.7)  # em volta (0 = de frente)
    ph = random.uniform(0.0, 1.45)  # da testa até o topo (a massa fica em cima)
    if ph < 0.35 and abs(th) < 0.6:
        continue  # a cara de baixo é da boca
    d = V(math.sin(th) * math.cos(ph), -math.cos(th) * math.cos(ph), math.sin(ph))
    R = random.uniform(0.022, 0.055) * (1.0 if ph > 0.45 else 0.75)  # wiki: no topo, a maior concentração de olhos MENORES
    if random.random() < 0.08:
        R *= 1.8  # alguns maiores no meio (tamanhos diferentes)
    q = HC + d * 0.22
    if any((q - p).length < (R + r) * 0.72 for p, r in placed):
        continue
    placed.append((q, R))
    eye_at(BVH['body'], HC, d, R, ['hd'], drip=0.3 if ph < 0.6 else 0.05)
# e pelo corpo, como nas artes: o ombro, o braço e a coxa (e um na corcunda)
eye_at(BVH['body'], V(0.38, -0.19, 1.15), V(0.3, -0.2, 1), 0.055, BODY_B, drip=1)
eye_at(BVH['body'], V(0.36, -0.18, 1.12), V(0.4, -0.6, 0.5), 0.04, BODY_B)
eye_at(BVH['body'], V(-0.34, -0.16, 1.15), V(-0.2, -0.4, 1), 0.045, BODY_B)
eye_at(BVH['armR'], sk['eR'].lerp(sk['sR'], 0.45), V(-0.6, -0.8, 0.1), 0.04, ARM_B['R'])
eye_at(BVH['armL'], sk['eL'].lerp(sk['handL'], 0.4), V(0.5, -0.8, 0), 0.032, ARM_B['L'])
eye_at(BVH['body'], V(0.24, -0.05, 0.48), V(0.6, -0.8, 0.1), 0.055, BODY_B, drip=1)
eye_at(BVH['body'], V(-0.26, -0.08, 0.42), V(-0.5, -0.85, -0.1), 0.035, BODY_B)
eye_at(BVH['body'], V(0, 0.1, 1.05), V(0.15, 0.6, 0.8), 0.045, BODY_B, drip=0)
eye_at(BVH['body'], V(0, -0.15, 0.62), V(-0.2, -1, -0.1), 0.03, BODY_B)

for nm, lst, mat in (('eyes', eyes, eye_y), ('pupils', pups, pupil), ('tears', tears, tear)):
    for i, (part, w) in enumerate(lst):
        b.add(f'{nm}{i}', part, mat, region='torso', weight_fn=lambda p, w=w: w, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'espreitador.blend'), check_existing=False)
