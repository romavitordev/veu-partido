"""
VERITUS — O SACRIFÍCIO DO RANCOR (Hexatombe) — public/models/veritus_rancor.glb. Wiki "Veritus" (o flashback de
Hexatombe): o TRONCO EXPOSTO e o FÍSICO DEFINIDO; nas COSTAS a grande ferida no formato do ESTIGMA (em código, ordoProps.js:
o brilho vermelho); a CALÇA ARMADURADA; os BRAÇOS com FAIXAS ENSANGUENTADAS; o cabelo escuro e bagunçado, a barba e os olhos
amarelos (textura face_veritus_rancor). Luta com os punhos; a aura vermelha fica em código.
  node tools/blender/build.mjs veritus_rancor   → public/models/veritus_rancor.glb
"""
import sys, os, math
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
hairm = material('hair_veritus_rancor', '#2a2018', 0.75)
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
O.hair_short(hairm, curly=0.55, thick=1.2, forehead=0.5)
O.beard(hairm, full=True, mustache=True)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'veritus_rancor.blend'), check_existing=False)
