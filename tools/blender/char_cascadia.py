"""
CASCADIA (Ordo Calamitas, Calamidade) — public/models/cascadia.glb. Wiki "Cascadia" e miniaturas: guerreira antiga
da Ordo, mãe de Caesar, de aspecto CANSADO (textura face_cascadia), CABELO LOIRO LONGO, ARMADURA COM PANOS e o CACHECOL.
De cima a baixo: o cabelo longo solto, o cachecol, as ombreiras em lâminas, a couraça em faixas com o pano do Símbolo
(tabard_cascadia), a saia de pano azul-acinzentado com as pteruges por cima, a calça e as botas. O KHOPESH e a espada reta
e a aura azul ficam em código (ordoWeapons.js / ordoProps.js).
  node tools/blender/build.mjs cascadia   → public/models/cascadia.glb
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo, grid
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'cascadia.glb'

b = Builder(width=0.9, bulk=0.88, height=0.96)
sk = b.sk
H = sk.h
hz = sk['hips'].z
skin = material('skin_cascadia', '#d8ae94', 0.68)
M = {'skin': skin, 'face': material('face_cascadia', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': skin, 'feet': skin}
under = material('under_cascadia', '#22262c', 0.85)
armor = material('armor_cascadia', '#5e6068', 0.36, metal=0.7)
armor_d = material('armor_cascadia_dark', '#3a3c44', 0.42, metal=0.6)
cloth = material('cloth_cascadia', '#3c4a5e', 0.88)
cloth_d = material('cloth_cascadia_in', '#1e2632', 0.9)
leather = material('leather_cascadia', '#2e2218', 0.62)
scarf = material('scarf_cascadia', '#1c1e24', 0.95)
boots = material('boots_cascadia', '#1a1a1e', 0.55)
sole = material('sole_cascadia', '#101012', 0.8)
hairm = material('hair_cascadia', '#c8a868', 0.7)
tabard = material('tabard_cascadia', '#ffffff', 0.9)
for m in bpy.data.materials:
    for k, c in {'face_cascadia': '#d8ae94', 'tabard_cascadia': '#2c3644'}.items():
        if m.name.endswith(k):
            m['preview'] = c
TP = [(-0.115, 0.164), (0.0, 0.158), (0.17, 0.12), (0.36, 0.16), (0.47, 0.168), (0.57, 0.1), (0.63, 0.06)]
HR = (0.13, 0.14, 0.154)
M['legs'] = under
M['feet'] = boots
hc = b.body(M, TP, arm_r=(0.056, 0.046, 0.039), leg_r=(0.082, 0.064, 0.05), head_r=HR, feet='bare')
O = Ordo(b, hc, HR)
O.under(under, sleeves=under, sleeve_to='wrist', pants=under)
O.cuirass(armor, lo=0.06, bands=24)
BS = Sculpt()
for s in (1, -1):
    q = O.front('cuirass', s * 0.06 * H, O.top - 0.17 * H, -0.03 * H)
    if q:
        BS.ell(q, (0.06 * H, 0.05 * H, 0.055 * H))
b.add('bust', BS.mesh(res=0.004, smooth=2, target=700), armor, region='body', weight_fn=lambda p: {'chest': 1.0}, subdiv=0)
O.pauldrons(armor, 'plates', trim=armor_d, size=0.9)
O.bracers(armor_d, ridges=22)
O.skirt(cloth, cloth_d, length=0.55, r0=0.19, flare=0.08, gap=0.18, z0=0.03)
O.belt(leather, buckle=armor_d)
O.pteruges(leather, n=14, length=0.2, r=0.198, skip_front=0.3)
O.tabard(tabard, half=0.08, bottom=0.45)
O.scarf(scarf)
O.boots(boots, sole, greave=armor_d)
O.hair_long(hairm, length=0.6, bangs='middle', wave=0.008, seed=1702)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'cascadia.blend'), check_existing=False)
