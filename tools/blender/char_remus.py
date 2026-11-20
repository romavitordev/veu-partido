"""
REMUS (Ordo Calamitas, Calamidade) — public/models/remus.glb. Wiki "Remus" e miniaturas: "O Cativante" — FÍSICO
DEFINIDO, pele clara, CABELO CASTANHO LONGO, um PANO da cintura ao ombro (a faixa diagonal), SAIA, SANDÁLIAS, a CAPA
BRANCA no ombro esquerdo e as CORDAS com LANTEJOULAS na cintura. Sem armadura nem o pano do Símbolo. As GARRAS e a aura
verde ficam em código (ordoWeapons.js / ordoProps.js).
  node tools/blender/build.mjs remus   → public/models/remus.glb
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo, grid
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'remus.glb'

b = Builder(width=0.98, bulk=0.96, height=1.02)
sk = b.sk
H = sk.h
hz = sk['hips'].z
skin = material('skin_remus', '#e2b898', 0.68)
M = {'skin': skin, 'face': material('face_remus', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': skin, 'feet': skin}
cloth = material('cloth_remus', '#d8d0c0', 0.88)
cloth_d = material('cloth_remus_in', '#a89e8c', 0.9)
skirt = material('skirt_remus', '#5a4a3a', 0.88)
skirt_d = material('skirt_remus_in', '#3a2e24', 0.9)
cape = material('cape_remus', '#eeeae2', 0.85)
cape_d = material('cape_remus_in', '#c8c2b6', 0.9)
rope = material('rope_remus', '#b89a5a', 0.8)
sequin = material('sequin_remus', '#e8d080', 0.25, metal=0.85)
leather = material('leather_remus', '#4a3220', 0.6)
sole = material('sole_remus', '#2a1c12', 0.8)
hairm = material('hair_remus', '#4a2e1c', 0.7)
clasp = material('clasp_remus', '#c8a858', 0.3, metal=0.85)
for m in bpy.data.materials:
    for k, c in {'face_remus': '#e2b898'}.items():
        if m.name.endswith(k):
            m['preview'] = c
TP = [(-0.115, 0.164), (0.0, 0.156), (0.17, 0.13), (0.36, 0.176), (0.47, 0.19), (0.57, 0.106), (0.63, 0.062)]
HR = (0.13, 0.14, 0.154)
hc = b.body(M, TP, arm_r=(0.062, 0.052, 0.043), leg_r=(0.088, 0.068, 0.052), head_r=HR, feet='bare')
O = Ordo(b, hc, HR)
O.muscles(1.0)
top = O.top
# o PANO da cintura ao ombro: a faixa diagonal, do quadril direito (−x) ao ombro esquerdo (+x)
z0 = hz + 0.16 * H
b.add('sash', clothe(O.part('torso'), lambda p: abs((p.z - z0) - 0.95 * p.x) < 0.07 * H and p.z > hz - 0.01 * H, 0.008 * H, cuts=2), cloth, region='body', weight_fn=O.W('torso'), subdiv=0)
# a SAIA (o pano em volta do quadril até o joelho) e as CORDAS com LANTEJOULAS na cintura
O.skirt(skirt, skirt_d, length=0.42, r0=0.19, flare=0.07, gap=0.0, z0=0.04, nu=32)
ropes, seq = [], Sculpt()
for k, (zz, tilt) in enumerate(((hz + 0.05 * H, 0.012), (hz + 0.025 * H, -0.015), (hz + 0.0 * H, 0.02))):
    pts = []
    for i in range(41):
        a = i / 40 * TAU
        d = Vector((math.sin(a), -math.cos(a), 0))
        z = zz + tilt * H * math.sin(a * 2)
        q = Vector((0, 0, z)) + Vector((math.sin(a) * 0.205 * H * 1.05, -math.cos(a) * 0.205 * H * 0.85, 0)) * (1.04 + 0.01 * k)
        pts.append(q)
        if i % 3 == k % 3:
            seq.ell(q + d * 0.006 * H, (0.007 * H, 0.007 * H, 0.007 * H))
    ropes.append(rod(pts, [0.006 * H] * len(pts), 5))
# as pontas das cordas caindo do lado esquerdo
for k in range(3):
    s0 = Vector((0.17 * H, -0.09 * H, hz + 0.03 * H - k * 0.01 * H))
    ropes.append(rod([s0, s0 + Vector((0.01 * H, -0.01 * H, -0.12 * H)), s0 + Vector((0.006 * H * k, -0.012 * H, -0.24 * H))], [0.006 * H] * 3, 5))
b.add('ropes', merge(*ropes), rope, region='body', weight_fn=O.hang_w(hz + 0.05 * H), subdiv=0)
b.add('sequins', seq.mesh(res=0.0025, smooth=1, target=1500), sequin, region='body', weight_fn=O.hang_w(hz + 0.05 * H), subdiv=0)
# a CAPA BRANCA no ombro esquerdo: presa por um broche dourado, cai pelas costas e pelo lado esquerdo
O.cape(cape, cape_d, length=0.86, arc=(0.1, 0.52), w0=0.24, d0=0.15, spread=0.08, nu=24, nv=20)
bq = O.front('torso', 0.1 * H, top - 0.04 * H, 0.03 * H)
if bq:
    B = Sculpt()
    B.ell(bq, (0.026 * H, 0.014 * H, 0.026 * H))
    b.add('brooch', B.mesh(res=0.003, smooth=1, target=300), clasp, region='body', weight_fn=O.W('torso'), subdiv=0)
# braçadeiras de couro e as SANDÁLIAS
O.bracers(leather, ridges=0, lo=0.03, hi=-0.06, thick=0.012)
O.sandals(leather, sole)
O.hair_long(hairm, length=0.36, bangs='middle', wave=0.006, seed=1701)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'remus.blend'), check_existing=False)
