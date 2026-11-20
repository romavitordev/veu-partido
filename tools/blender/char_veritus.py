"""
VERITUS (Ordo Calamitas, líder; Calamidade) — public/models/veritus.glb. Remodel (v5.32.1) pela arte do Livro de Regras
e pelas miniaturas: ~50 anos, pele clara, CABELO E BARBA LOIROS (o cabelo até a nuca com franja, a barba cheia), a
ARMADURA DE PLACAS COMPLETA com DETALHES DOURADOS, o grande MANTO-CAPUZ CINZA caído sobre os ombros e o peito, o PANO
CINZA longo até os joelhos com o Símbolo (tabard_veritus) e o ELMO FECHADO de ponta dourada (prop_helmet: sai no
especial, quando ele se revela). De cima a baixo: elmo, manto-capuz, ombreiras em lâminas com friso dourado, couraça,
braços em placas (cotoveleiras e manoplas), o fauld em lâminas, coxotes, joelheiras douradas, grevas e escarpes.
A ESPADA LONGA e a aura azul (dourada no despertar) ficam em código (ordoWeapons.js / ordoProps.js).
  node tools/blender/build.mjs veritus   → public/models/veritus.glb
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo, grid
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'veritus.glb'

b = Builder(width=1.06, bulk=1.08, height=1.05)
sk = b.sk
H = sk.h
hz = sk['hips'].z
skin = material('skin_veritus', '#e2b69a', 0.68)
M = {'skin': skin, 'face': material('face_veritus', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': skin, 'feet': skin}
under = material('under_veritus', '#26262c', 0.85)
armor = material('armor_veritus', '#868b96', 0.28, metal=0.8)
armor_d = material('armor_veritus_dark', '#4a4e58', 0.34, metal=0.75)
gold = material('gold_veritus', '#d0a640', 0.28, metal=0.92)
slit = material('slit_veritus', '#08080a', 0.9)
leather = material('leather_veritus', '#2e2218', 0.62)
cloth = material('cloth_veritus', '#6a6c72', 0.95)  # o manto-capuz cinza
cloth_in = material('cloth_veritus_in', '#3e4046', 0.95)
sole = material('sole_veritus', '#101012', 0.8)
hairm = material('hair_veritus', '#d8b45e', 0.7)  # loiro
beardm = material('beard_veritus', '#c49a48', 0.72)
tabard = material('tabard_veritus', '#ffffff', 0.9)
for m in bpy.data.materials:
    for k, c in {'face_veritus': '#e2b69a', 'tabard_veritus': '#5c5e64'}.items():
        if m.name.endswith(k):
            m['preview'] = c
TP = [(-0.115, 0.178), (0.0, 0.172), (0.17, 0.164), (0.36, 0.206), (0.47, 0.22), (0.57, 0.118), (0.63, 0.068)]
HR = (0.13, 0.14, 0.155)
M['legs'] = under
M['feet'] = under
hc = b.body(M, TP, arm_r=(0.068, 0.058, 0.048), leg_r=(0.094, 0.074, 0.057), head_r=HR, feet='bare')
O = Ordo(b, hc, HR)
O.under(under, sleeves=armor_d, sleeve_to='wrist', pants=under)

# ---- o tronco: a couraça lisa de peito cheio, com o fauld em lâminas e as tassets
O.cuirass(armor, lo=0.06, bands=0, chest_relief=0.01, thick=0.034)
O.skirt(armor, armor_d, length=0.17, r0=0.215, flare=0.03, gap=0.0, z0=0.06, nu=36)
relief(O.part('skirt'), lambda p: 0.006 * H * (ridge((hz - p.z) / H * 26, 3) - 0.3))
O.belt(leather, buckle=gold, z0=0.04, z1=0.08, thick=0.042)

# ---- os braços em placas: o braço de cima, a cotoveleira, o antebraço e a manopla
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh, e_, h_ = sk['s' + side], sk['e' + side], sk['hand' + side]
    arm = O.part('arm' + side)
    up = b.add('rerebrace' + side, clothe(arm, lambda p, e_=e_, sh=sh: e_.z - 0.01 * H < p.z < sh.z - 0.03 * H, 0.022 * H, cuts=1), armor, region='body', weight_fn=O.W('arm' + side), subdiv=0)
    relief(up, lambda p: 0.004 * H * (ridge(p.z / H * 30, 3) - 0.3))
    vb = b.add('vambrace' + side, clothe(arm, lambda p, e_=e_, h_=h_: h_.z + 0.03 * H < p.z < e_.z + 0.01 * H, 0.024 * H, cuts=1), armor, region='body', weight_fn=O.W('arm' + side), subdiv=0)
    relief(vb, lambda p: 0.003 * H * (ridge(p.z / H * 18, 3) - 0.3))
    E = Sculpt()  # a cotoveleira com a asa
    E.ell(e_ + Vector((0, 0.03 * H, 0)), (0.05 * H, 0.04 * H, 0.05 * H))
    E.ell(e_ + Vector((s * 0.035 * H, 0.02 * H, 0)), (0.02 * H, 0.04 * H, 0.045 * H))
    b.add('couter' + side, E.mesh(res=0.004, smooth=2, target=500), armor_d, region='body', weight_fn=O.W('arm' + side), subdiv=0)
    G = Sculpt()  # a manopla: o punho largo e as placas dos dedos
    G.ell(h_ + Vector((0, 0, 0.02 * H)), (0.056 * H, 0.052 * H, 0.045 * H))
    G.ell(h_ + Vector((0, 0, -0.035 * H)), (0.042 * H, 0.04 * H, 0.05 * H))
    b.add('gauntlet' + side, G.mesh(res=0.004, smooth=2, target=600), armor_d, region='body', weight_fn=O.W('arm' + side), subdiv=0)
    # o friso dourado na boca da manopla
    ring = [h_ + Vector((math.sin(a) * 0.052 * H, math.cos(a) * 0.048 * H, 0.04 * H)) for a in [i / 16 * math.tau for i in range(17)]]
    b.add('gauntletTrim' + side, rod(ring, [0.007 * H] * len(ring), 5), gold, region='body', weight_fn=O.W('arm' + side), subdiv=0)

# ---- as pernas em placas: coxote, joelheira dourada com asa, greva e o escarpe
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    f, k_ = sk['foot' + side], sk['k' + side]
    leg = O.part('leg' + side)
    th = b.add('cuisse' + side, clothe(leg, lambda p, k_=k_: k_.z - 0.01 * H < p.z < hz - 0.04 * H, 0.026 * H, cuts=1), armor, region='body', weight_fn=O.W('leg' + side), subdiv=0)
    relief(th, lambda p: 0.004 * H * (ridge(p.z / H * 16, 3) - 0.3))
    gr = b.add('greave' + side, clothe(leg, lambda p, k_=k_, f=f: f.z + 0.07 * H < p.z < k_.z + 0.01 * H, 0.026 * H, cuts=1), armor, region='body', weight_fn=O.W('k' + side), subdiv=0)
    relief(gr, lambda p: 0.003 * H * (ridge(p.x / H * 40, 3) - 0.3) if p.y < 0 else 0.0)
    kq = O.front('leg' + side, f.x, k_.z, 0.03 * H)
    if kq:
        K = Sculpt()
        K.ell(kq, (0.052 * H, 0.03 * H, 0.055 * H))
        K.ell(kq + Vector((s * 0.04 * H, 0.012 * H, 0)), (0.02 * H, 0.03 * H, 0.04 * H))  # a asa de fora
        b.add('poleyn' + side, K.mesh(res=0.004, smooth=2, target=500), gold, region='body', weight_fn=O.W('k' + side), subdiv=0)
O.boots(armor_d, sole, high=0.1)

# ---- o PANO CINZA longo com o Símbolo (até os joelhos) e o MANTO-CAPUZ sobre os ombros
O.tabard(tabard, half=0.1, bottom=0.42, flare=0.5, over=('cuirass', 'belt'))
O.pauldrons(armor, 'plates', trim=gold, size=1.25)
O.scarf(cloth, thick=1.35, tail=False)  # o capuz caído, enrolado no pescoço
# o MANTO-CAPUZ: dobras assentadas por cima da couraça e das ombreiras (raio de cima para baixo), descendo em V na frente
nk = sk['neck']
top = O.top
Cw = Sculpt()
for i in range(40):
    a = i / 40 * math.tau
    d = Vector((math.sin(a), -math.cos(a), 0))
    front = max(0.0, math.cos(a)) ** 2
    for t in (0.0, 0.2, 0.4, 0.6, 0.8, 1.0):
        rr = (0.1 + 0.15 * t - 0.04 * front * t) * H
        o = Vector((nk.x, nk.y, 0)) + Vector((d.x * rr, d.y * rr * 0.92, top + 0.4 * H))
        best = None
        for nm in ('cuirass', 'pauldronL', 'pauldronR', 'scarf'):
            q = O.surf(nm, o, Vector((0, 0, -1)), 0.012 * H)
            if q and (best is None or q.z > best.z):
                best = q
        if best is None:
            continue
        best.z -= front * t * 0.14 * H  # o V da frente desce pelo peito
        Cw.ell(best, (0.034 * H, 0.034 * H, 0.03 * H))
b.add('mantle', Cw.mesh(res=0.005, smooth=2, disp=lambda p: 0.005 * H * (ridge(math.atan2(p.x, -p.y) * 8 + n3(p, 7), 2) - 0.4), target=3000),
      cloth, region='body', weight_fn=lambda p: {'chest': 0.7, 'neck': 0.3}, subdiv=0)

# ---- a cabeça: o cabelo loiro até a nuca com franja e a barba cheia
# o método da Cindy (char_cindy.py): a CALOTA contínua, as mechas que CAEM (não espetam), a nuca coberta e a franja
# desfiada. É a peça prop_hair: escondida com o elmo posto (não cabe nele) e mostrada quando ele tira o elmo (veritus.js)
import random
random.seed(50)
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
Hr = Sculpt()
Hr.ell(Vh(0, 0.012, 0.04), (0.136 * H, 0.148 * H, 0.14 * H))
Hr.ell(Vh(0, 0.045, -0.02), (0.124 * H, 0.118 * H, 0.12 * H))  # a nuca coberta
Hr.ell(Vh(0, 0.07, -0.07), (0.1 * H, 0.085 * H, 0.08 * H))
for i in range(140):
    th = random.uniform(-math.pi, math.pi)
    ph = random.uniform(0.2, 2.0 if abs(th) > 2.2 else 1.65)
    d = Vector((math.sin(th) * math.sin(ph), -math.cos(th) * math.sin(ph), math.cos(ph)))
    if d.y < -0.5 and d.z < 0.6:  # o rosto livre
        continue
    base = HC + Vector((d.x * 0.128 * H, d.y * 0.138 * H + 0.01 * H, d.z * 0.128 * H + 0.035 * H))
    ln = random.uniform(0.04, 0.075) * H
    fall = Vector((d.x * 0.6, d.y * 0.6, d.z * 0.3 - 0.7))
    tp = base + (fall + Vector((random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3), random.uniform(-0.15, 0.2)))).normalized() * ln
    Hr.chain([base, base.lerp(tp, 0.5) + d * 0.008 * H, tp], [0.024 * H, 0.017 * H, 0.005 * H], step=0.45)
for i in range(11):  # a franja desfiada, rente à testa e penteada de lado (a miniatura), até acima das sobrancelhas
    a = -0.75 + 1.5 * i / 10
    pts = [O.on_head(a, el, off * H) for a, el, off in ((a, 1.0, 0.016), (a + 0.08, 0.72, 0.012), (a + 0.15, 0.48, 0.007))]
    pts = [q for q in pts if q]
    if len(pts) == 3:
        Hr.chain(pts, [0.019 * H, 0.013 * H, 0.004 * H], step=0.45)
Hr.ell(Vh(0, -0.125, -0.06), (0.1 * H, 0.09 * H, 0.12 * H), neg=True)


def messy(p):
    return 0.0035 * H * (ridge(math.atan2(p.x - HC.x, p.y - HC.y) * 14 + p.z / H * 30 + n3(p, 30) * 2, 2) - 0.4)


b.add('prop_hair', Hr.mesh(res=0.005, smooth=2, disp=messy, target=5000), hairm, region='head', subdiv=0)
# a BARBA CHEIA loira (a da miniatura): o bigode do O.beard e o volume pelo queixo e pelas bochechas
Bd = Sculpt()
for i in range(13):
    a = -1.15 + i / 12 * 2.3
    for el, off, rr in ((-0.42, 0.006, 0.02), (-0.68, 0.01, 0.026), (-0.9, 0.012, 0.03)):
        if el > -0.5 and abs(a) < 0.45:
            continue  # a boca livre
        q = O.on_head(a, el, off * H)
        if q:
            Bd.ell(q, (rr * H, rr * 0.9 * H, rr * 1.1 * H))
mq = O.on_head(0.0, -1.05, 0.012 * H)
if mq:
    Bd.ell(mq + Vector((0, -0.01 * H, -0.015 * H)), (0.05 * H, 0.035 * H, 0.04 * H))
b.add('beardFull', Bd.mesh(res=0.004, smooth=2, disp=lambda p: 0.0025 * H * (ridge(p.x / H * 70 + p.z / H * 90, 2) - 0.4), target=2400),
      beardm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
O.beard(beardm, full=True, mustache=True)

# ---- o ELMO FECHADO: o vinco dourado, a fenda, os respiros e a PONTA dourada no topo (a da arte do Livro de Regras)
sc = 1.2
c = hc + Vector((0, -0.012 * H, -0.006 * H))
top_ = c + Vector((0, 0, HR[2] * H * sc))
F = Sculpt()
F.chain([top_ - Vector((0, 0, 0.01 * H)), top_ + Vector((0, 0.004 * H, 0.04 * H)), top_ + Vector((0, 0.01 * H, 0.085 * H))],
        [0.026 * H, 0.016 * H, 0.004 * H], step=0.35)
fr = c + Vector((0, -HR[1] * H * sc * 1.05, HR[2] * H * sc * 0.35))  # o losango dourado da testa
F.ell(fr, (0.022 * H, 0.012 * H, 0.03 * H))
b.add('prop_helmetFinial', F.mesh(res=0.003, smooth=2, target=700), gold, region='head', subdiv=0)
O.helmet_closed(armor, slit, trim=gold, scale=sc)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'veritus.blend'), check_existing=False)
