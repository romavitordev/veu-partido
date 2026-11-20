"""
MARCELLUS (Ordo Calamitas, Calamidade) — public/models/marcellus.glb. Wiki "Marcellus" e miniaturas: ~35 anos,
MAGRO, pele negra, CABELO CASTANHO CACHEADO (miniaturas), ARMADURA MEDIEVAL. De cima a baixo: os cachos, o cachecol, as
ombreiras em lâminas, a couraça em faixas com o pano do Símbolo (tabard_marcellus), a saia de malha curta, a calça e as
botas com grevas. A RAPIEIRA de cabo dourado e a aura azul ficam em código (ordoWeapons.js / ordoProps.js).
  node tools/blender/build.mjs marcellus   → public/models/marcellus.glb
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo, grid
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'marcellus.glb'

b = Builder(width=0.92, bulk=0.86, height=1.0)
sk = b.sk
H = sk.h
hz = sk['hips'].z
skin = material('skin_marcellus', '#5a3626', 0.68)
M = {'skin': skin, 'face': material('face_marcellus', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': skin, 'feet': skin}
under = material('under_marcellus', '#262830', 0.85)
armor = material('armor_marcellus', '#686b74', 0.34, metal=0.72)
armor_d = material('armor_marcellus_dark', '#3c3f48', 0.42, metal=0.6)
mail = material('mail_marcellus', '#4c4e56', 0.5, metal=0.6)
mail_d = material('mail_marcellus_in', '#24252a', 0.6, metal=0.4)
leather = material('leather_marcellus', '#2e2218', 0.62)
scarf = material('scarf_marcellus', '#202430', 0.95)
boots = material('boots_marcellus', '#1a1a1e', 0.55)
sole = material('sole_marcellus', '#101012', 0.8)
hairm = material('hair_marcellus', '#2e1c12', 0.82)
tabard = material('tabard_marcellus', '#ffffff', 0.9)
for m in bpy.data.materials:
    for k, c in {'face_marcellus': '#5a3626', 'tabard_marcellus': '#383a44'}.items():
        if m.name.endswith(k):
            m['preview'] = c
TP = [(-0.115, 0.158), (0.0, 0.152), (0.17, 0.132), (0.36, 0.17), (0.47, 0.182), (0.57, 0.102), (0.63, 0.06)]
HR = (0.126, 0.138, 0.152)
M['legs'] = under
M['feet'] = boots
hc = b.body(M, TP, arm_r=(0.056, 0.047, 0.04), leg_r=(0.082, 0.064, 0.05), head_r=HR, feet='bare')
O = Ordo(b, hc, HR)
O.under(under, sleeves=under, sleeve_to='wrist', pants=under)
O.cuirass(armor, lo=0.06, bands=22, thick=0.026)
O.pauldrons(armor, 'plates', trim=armor_d, size=0.85)
O.bracers(armor_d, ridges=20, thick=0.016)
O.skirt(mail, mail_d, length=0.3, r0=0.19, flare=0.05, gap=0.0, z0=0.04, nu=30)
relief(O.part('skirt'), lambda p: 0.003 * H * (math.sin(p.z / H * 260) * math.sin(math.atan2(p.x, p.y) * 60)))
O.belt(leather, buckle=armor_d)
O.tabard(tabard, half=0.08, bottom=0.36)
O.scarf(scarf)
O.boots(boots, sole, greave=armor)
O.hair_short(hairm, curly=1.0, thick=1.05)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'marcellus.blend'), check_existing=False)
