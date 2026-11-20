"""
VERITUS (Ordo Calamitas, líder; Calamidade) — public/models/veritus.glb. Wiki "Veritus" e miniaturas: ~50 anos,
pele clara, CABELO E BARBA LOIROS, ARMADURA DE METAL COM DETALHES DOURADOS, o PANO CINZA no peito com o Símbolo
(tabard_veritus) e o ELMO FECHADO (prop_helmet: sai no especial, quando ele se revela). De cima a baixo: o elmo fechado com
o vinco e a fenda dourados, o cachecol, as ombreiras em cúpula com friso dourado, a couraça em faixas, as braçadeiras, a
saia de malha, as grevas douradas e as botas. A ESPADA LONGA (pomo e ponta de diamante, guarda longa) e a aura azul (dourada
no despertar) ficam em código (ordoWeapons.js / ordoProps.js).
  node tools/blender/build.mjs veritus   → public/models/veritus.glb
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo, grid
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'veritus.glb'

b = Builder(width=1.04, bulk=1.05, height=1.05)
sk = b.sk
H = sk.h
hz = sk['hips'].z
skin = material('skin_veritus', '#e2b69a', 0.68)
M = {'skin': skin, 'face': material('face_veritus', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': skin, 'feet': skin}
under = material('under_veritus', '#26262c', 0.85)
armor = material('armor_veritus', '#7a7e88', 0.3, metal=0.78)
gold = material('gold_veritus', '#c8a040', 0.3, metal=0.9)
slit = material('slit_veritus', '#08080a', 0.9)
mail = material('mail_veritus', '#50535c', 0.5, metal=0.6)
mail_d = material('mail_veritus_in', '#26272c', 0.6, metal=0.4)
leather = material('leather_veritus', '#2e2218', 0.62)
scarf = material('scarf_veritus', '#2a2c34', 0.95)
boots = material('boots_veritus', '#1a1a1e', 0.55)
sole = material('sole_veritus', '#101012', 0.8)
hairm = material('hair_veritus', '#c8a868', 0.72)
tabard = material('tabard_veritus', '#ffffff', 0.9)
for m in bpy.data.materials:
    for k, c in {'face_veritus': '#e2b69a', 'tabard_veritus': '#56585e'}.items():
        if m.name.endswith(k):
            m['preview'] = c
TP = [(-0.115, 0.174), (0.0, 0.168), (0.17, 0.16), (0.36, 0.2), (0.47, 0.212), (0.57, 0.116), (0.63, 0.066)]
HR = (0.13, 0.14, 0.155)
M['legs'] = under
M['feet'] = boots
hc = b.body(M, TP, arm_r=(0.066, 0.056, 0.046), leg_r=(0.092, 0.072, 0.056), head_r=HR, feet='bare')
O = Ordo(b, hc, HR)
O.under(under, sleeves=mail, sleeve_to='mid', pants=under)
O.cuirass(armor, lo=0.06, bands=18, chest_relief=0.008)
O.pauldrons(armor, 'round', trim=gold, size=1.05)
O.bracers(armor, ridges=20)
O.skirt(mail, mail_d, length=0.36, r0=0.205, flare=0.05, gap=0.0, z0=0.04, nu=32)
relief(O.part('skirt'), lambda p: 0.003 * H * (math.sin(p.z / H * 260) * math.sin(math.atan2(p.x, p.y) * 60)))
O.belt(leather, buckle=gold)
O.tabard(tabard, half=0.09, bottom=0.42)
O.scarf(scarf)
O.boots(boots, sole, greave=gold)
O.hair_short(hairm, thick=1.0)
O.beard(hairm, full=True, mustache=True)
O.helmet_closed(armor, slit, trim=gold, scale=1.2)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'veritus.blend'), check_existing=False)
