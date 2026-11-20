"""
NERO (Ordo Calamitas, Calamidade) — public/models/nero.glb. Wiki "Nero" e miniaturas: o IMPERADOR de Roma,
meia-idade, pele clara, CABELO RUIVO, ARMADURA MEDIEVAL COM PANOS CINZAS. De cima a baixo: o cabelo ruivo curto, a gola
e a CAPA cinza (o manto do imperador, com o broche dourado), as ombreiras pontudas com friso dourado, a couraça
musculosa com os frisos, o pano cinza do Símbolo (tabard_nero), as pteruges, a calça e as botas com grevas. A ESPADA
CURVA, o ESCUDO REDONDO, a COROA DE LOUROS (PROPOSTA) e a aura azul ficam em código (ordoWeapons.js / ordoProps.js).
  node tools/blender/build.mjs nero   → public/models/nero.glb
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo, grid
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'nero.glb'

b = Builder(width=1.0, bulk=1.02, height=1.0)
sk = b.sk
H = sk.h
hz = sk['hips'].z
skin = material('skin_nero', '#e4b89c', 0.68)
M = {'skin': skin, 'face': material('face_nero', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': skin, 'feet': skin}
under = material('under_nero', '#2a2a30', 0.85)
armor = material('armor_nero', '#6e7078', 0.3, metal=0.75)
gold = material('gold_nero', '#c8a040', 0.3, metal=0.9)
grey = material('cloth_nero', '#6a6a72', 0.88)
grey_d = material('cloth_nero_in', '#38383e', 0.9)
leather = material('leather_nero', '#3a2618', 0.6)
boots = material('boots_nero', '#1c1a1e', 0.55)
sole = material('sole_nero', '#121014', 0.8)
hairm = material('hair_nero', '#a8401c', 0.7)
tabard = material('tabard_nero', '#ffffff', 0.9)
for m in bpy.data.materials:
    for k, c in {'face_nero': '#e4b89c', 'tabard_nero': '#5a5a62'}.items():
        if m.name.endswith(k):
            m['preview'] = c
TP = [(-0.115, 0.172), (0.0, 0.168), (0.17, 0.158), (0.36, 0.19), (0.47, 0.2), (0.57, 0.11), (0.63, 0.064)]
HR = (0.13, 0.14, 0.154)
M['legs'] = under
M['feet'] = boots
hc = b.body(M, TP, arm_r=(0.062, 0.052, 0.043), leg_r=(0.09, 0.07, 0.054), head_r=HR, feet='bare')
O = Ordo(b, hc, HR)
O.under(under, sleeves=under, sleeve_to='wrist', pants=under)
O.cuirass(armor, lo=0.06, bands=0, chest_relief=0.014)
# os FRISOS dourados da couraça (a gola e a barra)
fr = []
for zz in (O.top - 0.03 * H, hz + 0.075 * H):
    pts = []
    for i in range(41):
        a = i / 40 * TAU
        d = Vector((math.sin(a), -math.cos(a), 0))
        q = O.surf('cuirass', Vector((0, 0, zz)) + d * 0.6 * H, -d, 0.004 * H)
        if q:
            pts.append(q)
    if len(pts) > 6:
        fr.append(rod(pts, [0.008 * H] * len(pts), 5))
b.add('trim', merge(*fr), gold, region='body', weight_fn=O.W('torso'), subdiv=0)
O.pauldrons(armor, 'pointed', trim=gold, size=0.95)
O.bracers(armor, ridges=20)
O.belt(leather, buckle=gold)
O.pteruges(leather, n=18, length=0.27, skip_front=0.3)
O.tabard(tabard, half=0.085, bottom=0.48)
O.cape(grey, grey_d, length=0.96, gap=0.34, w0=0.29, d0=0.17, spread=0.14)
O.collar(grey, r=0.12)
for s in (1, -1):
    bq = O.front('cuirass', s * 0.14 * H, O.top - 0.03 * H, 0.02 * H)
    if bq:
        B = Sculpt()
        B.ell(bq, (0.03 * H, 0.014 * H, 0.03 * H))
        b.add('brooch' + ('L' if s > 0 else 'R'), B.mesh(res=0.003, smooth=1, target=300), gold, region='body', weight_fn=O.W('torso'), subdiv=0)
O.boots(boots, sole, greave=armor)
O.hair_short(hairm, curly=0.35, thick=1.05)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'nero.blend'), check_existing=False)
