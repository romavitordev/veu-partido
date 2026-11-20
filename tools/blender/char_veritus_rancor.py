"""
VERITUS — O SACRIFÍCIO DO RANCOR (Hexatombe) — public/models/veritus_rancor.glb. Wiki "Veritus" (o flashback de
Hexatombe): o TRONCO EXPOSTO e o FÍSICO DEFINIDO; nas COSTAS a grande ferida no formato do ESTIGMA (em código, ordoProps.js:
o brilho vermelho); a CALÇA ARMADURADA; os BRAÇOS com FAIXAS ENSANGUENTADAS; o cabelo LOIRO e bagunçado (dono: o Veritus é loiro), a barba cheia e os olhos
amarelos (textura face_veritus_rancor). Luta com os punhos; a aura vermelha fica em código.
  node tools/blender/build.mjs veritus_rancor   → public/models/veritus_rancor.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo, grid
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'veritus_rancor.glb'

b = Builder(width=1.04, bulk=1.06, height=1.05)
sk = b.sk
H = sk.h
hz = sk['hips'].z
skin = material('skin_veritus_rancor', '#d8ac90', 0.68)
M = {'skin': skin, 'face': material('face_veritus_rancor', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': skin, 'feet': skin}
pants = material('pants_veritus_rancor', '#24222a', 0.85)
plate = material('plate_veritus_rancor', '#4e5058', 0.36, metal=0.7)
plate_d = material('plate_veritus_rancor_dark', '#2e3036', 0.42, metal=0.6)
bandage = material('bandage_veritus_rancor', '#cfc6b4', 0.92)
blood = material('blood_veritus_rancor', '#6a0a0e', 0.55)
leather = material('leather_veritus_rancor', '#2a1e16', 0.62)
boots = material('boots_veritus_rancor', '#18171a', 0.55)
sole = material('sole_veritus_rancor', '#0e0e10', 0.8)
hairm = material('hair_veritus_rancor', '#d0ac58', 0.72)  # loiro (dono, 2026-11-20)
beardm = material('beard_veritus_rancor', '#b88e44', 0.74)
for m in bpy.data.materials:
    for k, c in {'face_veritus_rancor': '#d8ac90'}.items():
        if m.name.endswith(k):
            m['preview'] = c
TP = [(-0.115, 0.17), (0.0, 0.164), (0.17, 0.142), (0.36, 0.196), (0.47, 0.21), (0.57, 0.114), (0.63, 0.066)]
HR = (0.13, 0.14, 0.155)
M['legs'] = pants
M['feet'] = boots
hc = b.body(M, TP, arm_r=(0.068, 0.058, 0.047), leg_r=(0.094, 0.073, 0.056), head_r=HR, feet='bare')
O = Ordo(b, hc, HR)
O.muscles(1.25)
for side in ('L', 'R'):
    f = sk['foot' + side]
    pl = b.add('pants' + side, clothe(O.part('leg' + side), lambda p, f=f: p.z > f.z + 0.18 * H, 0.018 * H, cuts=1), pants, region='body', weight_fn=O.W('leg' + side), subdiv=0)
    relief(pl, lambda p: 0.004 * H * (ridge(p.z / H * 14 + n3(p, 9) * 1.4, 2) - 0.4))
    # a CALÇA ARMADURADA: as placas da coxa (em faixas) e a joelheira
    k_ = sk['k' + side]
    tp = b.add('thigh' + side, clothe(O.part('leg' + side), lambda p, k_=k_: k_.z + 0.04 * H < p.z < hz - 0.04 * H and p.y < 0.02 * H, 0.03 * H, cuts=1), plate, region='body', weight_fn=O.W('leg' + side), subdiv=0)
    relief(tp, lambda p: 0.005 * H * (ridge(p.z / H * 22, 3) - 0.3))
    kq = O.front('leg' + side, f.x, k_.z, 0.03 * H)
    if kq:
        K = Sculpt()
        K.ell(kq, (0.05 * H, 0.025 * H, 0.05 * H))
        b.add('knee' + side, K.mesh(res=0.004, smooth=2, target=400), plate_d, region='body', weight_fn=O.W('k' + side), subdiv=0)
# a faixa de pano na cintura e o cinto
b.add('waist', clothe(O.part('torso'), lambda p: p.z < hz + 0.05 * H, 0.012 * H, cuts=1), pants, region='body', weight_fn=O.W('torso'), subdiv=0)
O.belt(leather, buckle=plate_d, z0=0.0, z1=0.04, thick=0.03)
O.bandages(bandage, blood=blood, seed=1666)
O.boots(boots, sole, greave=plate)
O.beard(beardm, full=False, mustache=True)
# o método da Cindy (char_cindy.py): a CALOTA contínua, as mechas que CAEM (não espetam), a nuca coberta e a franja
# desfiada; o mesmo loiro do Veritus de armadura, mais comprido e bagunçado (o Hexatombe, sem elmo)
import random
random.seed(66)
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
    ln = random.uniform(0.055, 0.1) * H
    fall = Vector((d.x * 0.8, d.y * 0.8, d.z * 0.4 - 0.55))  # bagunçado: abre mais para os lados
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


b.add('hair', Hr.mesh(res=0.005, smooth=2, disp=messy, target=5000), hairm, region='head', subdiv=0)
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

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'veritus_rancor.blend'), check_existing=False)
