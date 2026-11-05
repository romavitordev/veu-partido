"""
O ESPREITADOR (chefe da 1ª dungeon do Outro Lado) — public/models/espreitador.glb, no ESQUELETO DE LUTADOR (usa os clipes
de garra do Raziel, como o Carniçal).
Cânone (wiki "O Espreitador"): criatura de Medo de PELE CINZA ENRUGADA; MUITOS OLHOS AMARELOS cujas pupilas se
multiplicam; LÁGRIMAS; um OLHO GRANDE DENTRO DA BOCA (onde o Kaiser o matou); DENTES TORTOS; PERNAS CURTAS; BRAÇOS E
DEDOS LONGOS.
PROPOSTA (não está no cânone): o tronco um pouco curvado para a frente e a cabeça baixa, de quem espia por uma fresta.

TÉCNICA: a do Carniçal — o corpo é a base realista CC0 da Blender Studio (base_body.py) encaixada no esqueleto, com as
rugas por deslocamento e a cor por vértice; a cabeça é UMA forma de metaballs (sculpt_lib) com a boca cavada.
As pernas curtas: o esqueleto é o padrão (as animações são as mesmas de todos), então as coxas e canelas ficam GROSSAS
e o quadril baixo e largo, e os braços passam dos joelhos — a proporção lê como "pernas curtas, braços longos".
  node tools/blender/build.mjs espreitador   → public/models/espreitador.glb (+ fonte/espreitador.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, vcol_material, paint
from mathutils import Vector
import numpy as np
import bmesh
from base_body import load_fitted, store_weights, read_weights

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'espreitador.glb'
random.seed(211)  # 2:11, a hora do relógio da Mansão

b = Builder(width=1.08, bulk=1.12, height=1.0)
sk = b.sk
H = sk.h

skin = vcol_material('pele_espreitador', rough=0.8)
eye_y = material('glow_olho_espreitador', '#ffd23a', 0.35, emission='#f2c230', strength=2.2)
pupil = material('pupila_espreitador', '#0a0806', 0.3)
tear = material('lagrima_espreitador', '#a9bcc8', 0.15)
mouth_in = material('boca_espreitador', '#24090a', 0.7)
tooth = material('dente_espreitador', '#cbbf98', 0.55)
gum = material('gengiva_espreitador', '#5a2a28', 0.65)

C = {k: Vector(hex_rgb(v)) for k, v in {'pele': '#7f7b74', 'dobra': '#46423d', 'alto': '#a19c93', 'olheira': '#3a3530'}.items()}
AMP = 0.0032 * H


def V(x, y, z):
    return Vector((x * H, y * H, z * H))


def lim(t):
    return max(0.0, min(1.0, t))


def wrinkle(p, dense=1.0):
    """as rugas: dobras horizontais tortas (pele velha caída), mais fundas na barriga e nas juntas"""
    # a fase torcida pelo ruído (forte) quebra as listras em dobras curtas e tortas; a amplitude some aos poucos
    w = n3(p, 2.2) * 6.0 + n3(p, 7.0) * 2.0
    fade = 0.35 + 0.65 * max(0.0, n3(p + Vector((3.1, 0.7, 1.9)), 4.0) + 0.25)
    return AMP * fade * (ridge(p.z / H * 110 * dense + w, 4) - 0.25)


# ================================================================ O CORPO
body, heat = load_fitted(sk, thick={'hips': 1.32, 'chest': 1.2, 'neck': 1.25, 'cla': 1.15, 's': 0.95, 'e': 0.92, 'hand': 1.1, 'l': 1.45, 'k': 1.4, 'foot': 1.35})
store_weights(body, heat)
me = body.data
co = np.array([v.co[:] for v in me.vertices])
ax = np.abs(co[:, 0])
# a barriga caída e o quadril largo e baixo
belly = np.exp(-((co[:, 2] - 1.02 * H) / (0.12 * H)) ** 2) * (ax < 0.2 * H) * (co[:, 1] < 0)
co[:, 1] -= 0.035 * H * belly
hipw = np.exp(-((co[:, 2] - 0.9 * H) / (0.1 * H)) ** 2) * (ax < 0.24 * H)
co[:, 0] *= 1 + 0.12 * hipw
# PROPOSTA: curvado para a frente (só o tronco central; os ombros acompanham pela metade)
cz = sk['chest'].z
up = np.clip((co[:, 2] - cz) / (0.4 * H), 0, None)
cen = np.clip(1 - (ax - 0.12 * H) / (0.14 * H), 0.5, 1)
co[:, 1] -= 0.16 * H * up * up * cen
co[:, 2] -= 0.05 * H * up * up * cen
# os BRAÇOS e DEDOS LONGOS: o antebraço e a mão esticados para baixo (as pontas passam dos joelhos)
EZ = sk['eL'].z
WR = sk['handL'].z
ARMB = ('eL', 'eR', 'handL', 'handR')
arm = np.array([max(h_, key=h_.get) in ARMB if h_ else False for h_ in heat])  # só o que é do braço (o quadril largo também passa do x do ombro)
m = arm & (co[:, 2] < EZ)
d = EZ - co[m, 2]
span = EZ - WR
co[m, 2] = EZ - d * (1.16 + 0.3 * np.clip((d - span) / (0.18 * H), 0, 1) * np.clip(d / span, 0, 2))
cx = np.sign(co[m, 0]) * sk['sL'].x
co[m, 0] = cx + (co[m, 0] - cx) * (1 - 0.18 * np.clip((d - span) / (0.2 * H), 0, 1))  # dedos finos
me.vertices.foreach_set('co', co.ravel())
me.update()
# fora a cabeça humana
NECK_TOP = sk['neck'].z + 0.04 * H
bm = bmesh.new()
bm.from_mesh(me)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > NECK_TOP - 0.02 * H and abs(v.co.x) < 0.12 * H and v.co.z > cz + 0.2 * H], context='VERTS')
bm.to_mesh(me)
bm.free()
me.update()
for v in me.vertices:
    v.co = v.co + v.normal * wrinkle(v.co, 1.3 if abs(v.co.x) < 0.2 * H else 1.0)
me.update()
dec = body.modifiers.new('dec', 'DECIMATE')
dec.ratio = 0.6
bpy.context.view_layer.objects.active = body
bpy.ops.object.modifier_apply(modifier=dec.name)
wts = read_weights(body)
verts = [tuple(v.co) for v in me.vertices]
faces = [tuple(pl.vertices) for pl in me.polygons]
bpy.data.objects.remove(body)


def key(p):
    return (round(p[0], 4), round(p[1], 4), round(p[2], 4))


WT = {key(v): w_ for v, w_ in zip(verts, wts)}
bo = b.add('body', (verts, faces, None), skin, region='body', weight_fn=lambda p: WT.get(key(p), {'hips': 1.0}), subdiv=0)
for pl in bo.data.polygons:
    pl.use_smooth = True


def skin_col(p):
    k = lim(wrinkle(p) / AMP + 0.25)
    c = C['pele'].lerp(C['dobra'], (1 - k) * 0.35)  # a dobra só um pouco mais escura (o contraste forte virava listra)
    c = c.lerp(C['alto'], lim(n3(p, 3.0) * 0.5 + 0.2) * 0.3)
    return c


paint(bo, skin_col)
# as unhas compridas e escuras nas pontas dos dedos
for side in ('L', 'R'):
    tips = sorted((Vector(v) for v, w_ in zip(verts, wts) if max(w_, key=w_.get) == 'hand' + side), key=lambda q: q.z)
    pts = []
    for q in tips:
        if all(math.hypot(q.x - t.x, q.y - t.y) > 0.026 for t in pts):
            pts.append(q)
        if len(pts) == 5:
            break
    nails = [rod([t, t + V(0, -0.012, -0.03), t + V(0, -0.004, -0.055)], [0.007 * H, 0.004 * H, 0.0008 * H], 5) for t in pts]
    if nails:
        b.add('nails' + side, merge(*nails), pupil, region='hand' + side, subdiv=0)

# ================================================================ A CABEÇA: baixa e projetada (acompanha a curvatura)
hc = head_center(sk) + V(0, -0.15, -0.09)
HR = (0.158 * H, 0.15 * H, 0.165 * H)  # cabeça grande (os muitos olhos precisam de lugar)
MB = 1 / 0.575  # o metaball sozinho aparece em 0,575 × o raio: os raios abaixo são os da superfície
Hd = Sculpt()
Hd.ell(hc, tuple(r * MB for r in HR))
Hd.ell(hc + V(0, -0.03, -0.095), (0.12 * H * MB, 0.1 * H * MB, 0.075 * H * MB))  # a mandíbula larga
Hd.chain([V(0, 0.0, sk['neck'].z / H - 0.04), hc + V(0, 0.045, -0.06)], [0.075 * H * MB, 0.08 * H * MB], step=0.45)  # o pescoço grosso
Hd.ell(hc + V(0, -0.15, -0.085), (0.085 * H * MB, 0.05 * H * MB, 0.048 * H * MB), neg=True)  # a boca cavada
mouth_c = hc + V(0, -0.115, -0.085)


def head_fn(p):
    return wrinkle(p, 1.6) * 0.7


ho = b.add('head', Hd.mesh(res=0.007, smooth=3, disp=head_fn, target=2600), skin, region='head', subdiv=0)
paint(ho, lambda p: skin_col(p).lerp(C['olheira'], lim(1 - (p - hc).length / (0.06 * H)) * 0.0))

# o fundo da boca (escuro), a gengiva e os DENTES TORTOS em duas fileiras
b.add('mouthIn', ellipsoid(tuple(mouth_c + V(0, 0.03, 0)), (0.075 * H, 0.04 * H, 0.042 * H), 16, 10), mouth_in, region='head', subdiv=0)
teeth = []
for row, zs, dz in ((0, 0.028, -1), (1, -0.03, 1)):
    n = 11 if row == 0 else 10
    for i in range(n):
        t = (i + 0.5) / n
        a = (t - 0.5) * 2.3
        base = mouth_c + Vector((math.sin(a) * 0.068 * H, -math.cos(a) * 0.035 * H + 0.012 * H, zs * H))
        L = (0.018 + random.random() * 0.02) * H
        tip = base + Vector((random.uniform(-0.008, 0.008) * H, random.uniform(-0.01, 0.004) * H, dz * L))
        teeth.append(cone(tuple(base), tuple(tip), (0.006 + random.random() * 0.004) * H, 6))
b.add('teeth', merge(*teeth), tooth, region='head', subdiv=0)
b.add('gums', merge(
    rod([mouth_c + Vector((math.sin((t - 0.5) * 2.3) * 0.07 * H, -math.cos((t - 0.5) * 2.3) * 0.036 * H + 0.012 * H, 0.03 * H)) for t in [i / 10 for i in range(11)]], [0.008 * H] * 11, 5),
    rod([mouth_c + Vector((math.sin((t - 0.5) * 2.3) * 0.066 * H, -math.cos((t - 0.5) * 2.3) * 0.034 * H + 0.012 * H, -0.032 * H)) for t in [i / 10 for i in range(11)]], [0.008 * H] * 11, 5),
), gum, region='head', subdiv=0)
# O OLHO DENTRO DA BOCA (o grande, amarelo, com a pupila)
me_c = mouth_c + V(0, 0.012, 0)
b.add('mouthEye', ellipsoid(tuple(me_c), (0.03 * H, 0.026 * H, 0.03 * H), 16, 12), eye_y, region='head', subdiv=0)
b.add('mouthPupil', ellipsoid(tuple(me_c + V(0, -0.026, 0)), (0.009 * H, 0.004 * H, 0.016 * H), 10, 8), pupil, region='head', subdiv=0)

# OS MUITOS OLHOS amarelos pela cara e pelo alto da cabeça — cada um com 1 a 3 PUPILAS (elas se multiplicam)
from mathutils.bvhtree import BVHTree
_mw = ho.matrix_world
HEAD_BVH = BVHTree.FromPolygons([_mw @ v.co for v in ho.data.vertices], [tuple(pl.vertices) for pl in ho.data.polygons])


def on_head(origin, d):
    """o ponto da superfície de verdade da cabeça na direção d (e a normal ali)"""
    hit = HEAD_BVH.ray_cast(origin + d * 0.5 * H, -d)  # de fora para dentro: pega a casca de fora
    if hit[0] is None:
        return origin + d * HR[0], d
    return hit[0], hit[1]


eyes, pups, tears = [], [], []
spots = [(-0.42, 0.18, 0.042), (0.42, 0.18, 0.042), (-0.15, 0.32, 0.03), (0.17, 0.33, 0.032), (0.0, 0.52, 0.026),
         (-0.62, 0.42, 0.022), (0.6, 0.45, 0.024), (-0.3, 0.6, 0.02), (0.32, 0.62, 0.021), (-0.75, 0.08, 0.018),
         (0.76, 0.1, 0.019), (0.0, 0.18, 0.02), (-0.5, 0.72, 0.016)]
for (u, v, r) in spots:
    th = u * 1.25  # em volta da cara (radianos a partir da frente)
    ph = v * 1.2  # para cima
    dirv = Vector((math.sin(th) * math.cos(ph), -math.cos(th) * math.cos(ph), math.sin(ph))).normalized()
    surf, nrm = on_head(hc, dirv)
    dirv = nrm.normalized()
    R = r * H * 1.3
    surf = surf + dirv * R * 0.25  # meio enterrado na pele
    eyes.append(ellipsoid(tuple(surf), (R, R, R * 0.85), 12, 8))
    n_p = 1 + (random.random() < 0.45) + (random.random() < 0.2)
    for k in range(n_p):
        off = Vector((random.uniform(-0.45, 0.45) * R, 0, random.uniform(-0.35, 0.35) * R)) if n_p > 1 else Vector()
        pc = surf + dirv * R * 0.86 + off
        pups.append(ellipsoid(tuple(pc), (R * 0.28, R * 0.28, R * 0.28), 8, 6))
    if v < 0.4 or random.random() < 0.4:  # as LÁGRIMAS escorrendo
        L = random.uniform(0.05, 0.1) * H
        pts = []
        for i in range(5):  # cada ponto da lágrima colado na pele, descendo
            q = surf + Vector((random.uniform(-0.002, 0.002) * H, 0, -R * 0.85 - L * i / 4))
            loc, n_, _, _ = HEAD_BVH.find_nearest(q)
            pts.append(loc + n_.normalized() * 0.003 * H if loc is not None else q)
        tears.append(rod(pts, [R * 0.1, R * 0.09, R * 0.08, R * 0.07, R * 0.11], 5))
b.add('eyes', merge(*eyes), eye_y, region='head', subdiv=0)
b.add('pupils', merge(*pups), pupil, region='head', subdiv=0)
b.add('tears', merge(*tears), tear, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'espreitador.blend'), check_existing=False)
