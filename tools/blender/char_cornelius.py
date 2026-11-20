"""
CORNELIUS (Ordo Calamitas, Calamidade) — public/models/cornelius.glb. Wiki "Cornelius" e miniaturas: meia-idade,
pele clara, BIGODE castanho (textura face_cornelius e o bigode esculpido), ARMADURA MEDIEVAL e o ELMO COM CRISTA. De cima
a baixo: o elmo (calota, proteções das bochechas, aba da nuca e a crista de penas), o cachecol, as ombreiras em cúpula, a
couraça em faixas com o pano do Símbolo (tabard_cornelius), a SAIA DE MALHA, as grevas e as botas. A LANÇA, o ESCUDO e a
aura azul ficam em código (ordoWeapons.js / ordoProps.js).
  node tools/blender/build.mjs cornelius   → public/models/cornelius.glb
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo, grid
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'cornelius.glb'

b = Builder(width=1.04, bulk=1.06, height=1.0)
sk = b.sk
H = sk.h
hz = sk['hips'].z
skin = material('skin_cornelius', '#e0b49a', 0.68)
M = {'skin': skin, 'face': material('face_cornelius', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': skin, 'feet': skin}
under = material('under_cornelius', '#24262e', 0.85)
armor = material('armor_cornelius', '#62656e', 0.34, metal=0.72)
armor_d = material('armor_cornelius_dark', '#3a3d46', 0.42, metal=0.6)
mail = material('mail_cornelius', '#4a4c54', 0.5, metal=0.6)
mail_d = material('mail_cornelius_in', '#24252a', 0.6, metal=0.4)
plume = material('plume_cornelius', '#2a4a9a', 0.9)
leather = material('leather_cornelius', '#2e2218', 0.62)
scarf = material('scarf_cornelius', '#1c1e26', 0.95)
boots = material('boots_cornelius', '#1a1a1e', 0.55)
sole = material('sole_cornelius', '#101012', 0.8)
hairm = material('hair_cornelius', '#5a3a22', 0.75)
tabard = material('tabard_cornelius', '#ffffff', 0.9)
for m in bpy.data.materials:
    for k, c in {'face_cornelius': '#e0b49a', 'tabard_cornelius': '#2e3448'}.items():
        if m.name.endswith(k):
            m['preview'] = c
TP = [(-0.115, 0.172), (0.0, 0.166), (0.17, 0.156), (0.36, 0.196), (0.47, 0.208), (0.57, 0.114), (0.63, 0.066)]
HR = (0.13, 0.14, 0.154)
M['legs'] = under
M['feet'] = boots
hc = b.body(M, TP, arm_r=(0.066, 0.056, 0.046), leg_r=(0.092, 0.072, 0.056), head_r=HR, feet='bare')
O = Ordo(b, hc, HR)
O.under(under, sleeves=mail, sleeve_to='mid', pants=under)
O.cuirass(armor, lo=0.06, bands=18)
O.pauldrons(armor, 'round', trim=armor_d, size=1.0)
O.bracers(armor_d, ridges=20)
sk_ = O.skirt(mail, mail_d, length=0.34, r0=0.205, flare=0.05, gap=0.0, z0=0.04, nu=32)
relief(O.part('skirt'), lambda p: 0.003 * H * (math.sin(p.z / H * 260) * math.sin(math.atan2(p.x, p.y) * 60)))
O.belt(leather, buckle=armor_d)
O.tabard(tabard, half=0.085, bottom=0.36)
O.scarf(scarf)
O.boots(boots, sole, greave=armor)
O.hair_short(hairm)
O.beard(hairm, full=False, mustache=True)
O.helmet_galea(armor, armor_d, plume)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'cornelius.blend'), check_existing=False)
