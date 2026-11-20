"""
KARISE (Ordo Calamitas, Calamidade) — public/models/karise.glb. Wiki "Karise" e miniaturas: a ESPIÃ — mulher negra,
cabelo preto, a MASCARILHA metálica (em código: ordoWeapons.js mascarilha), o CAPUZ, a ARMADURA COM PANOS e o CACHECOL.
De cima a baixo: o capuz escuro (aberto na frente), o cabelo curto por baixo, o cachecol, as ombreiras pequenas, a couraça
em faixas com o pano do Símbolo (tabard_karise), a saia de pano longa aberta na frente, as correias, a calça e as botas.
As ADAGAS DE PONTA DUPLA e a aura azul ficam em código.
  node tools/blender/build.mjs karise   → public/models/karise.glb
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo, grid
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'karise.glb'

b = Builder(width=0.88, bulk=0.86, height=0.95)
sk = b.sk
H = sk.h
hz = sk['hips'].z
skin = material('skin_karise', '#4e3022', 0.68)
M = {'skin': skin, 'face': material('face_karise', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': skin, 'feet': skin}
under = material('under_karise', '#1c1e22', 0.85)
armor = material('armor_karise', '#4a4e56', 0.38, metal=0.68)
armor_d = material('armor_karise_dark', '#2c2f36', 0.44, metal=0.6)
cloth = material('cloth_karise', '#262c34', 0.9)
cloth_d = material('cloth_karise_in', '#121418', 0.92)
leather = material('leather_karise', '#24180f', 0.62)
scarf = material('scarf_karise', '#14161a', 0.95)
boots = material('boots_karise', '#151517', 0.55)
sole = material('sole_karise', '#0c0c0e', 0.8)
hairm = material('hair_karise', '#0e0a0a', 0.6)
tabard = material('tabard_karise', '#ffffff', 0.9)
for m in bpy.data.materials:
    for k, c in {'face_karise': '#4e3022', 'tabard_karise': '#22282e'}.items():
        if m.name.endswith(k):
            m['preview'] = c
TP = [(-0.115, 0.16), (0.0, 0.154), (0.17, 0.116), (0.36, 0.156), (0.47, 0.164), (0.57, 0.098), (0.63, 0.058)]
HR = (0.128, 0.138, 0.152)
M['legs'] = under
M['feet'] = boots
hc = b.body(M, TP, arm_r=(0.054, 0.045, 0.038), leg_r=(0.08, 0.062, 0.049), head_r=HR, feet='bare')
O = Ordo(b, hc, HR)
O.under(under, sleeves=under, sleeve_to='wrist', pants=under)
O.cuirass(armor, lo=0.08, bands=24, thick=0.024)
BS = Sculpt()
for s in (1, -1):
    q = O.front('cuirass', s * 0.058 * H, O.top - 0.17 * H, -0.03 * H)
    if q:
        BS.ell(q, (0.055 * H, 0.046 * H, 0.05 * H))
b.add('bust', BS.mesh(res=0.004, smooth=2, target=700), armor, region='body', weight_fn=lambda p: {'chest': 1.0}, subdiv=0)
O.pauldrons(armor, 'plates', trim=armor_d, size=0.75)
O.bracers(leather, ridges=0, thick=0.014)
O.skirt(cloth, cloth_d, length=0.62, r0=0.185, flare=0.1, gap=0.3, z0=0.02)
O.belt(leather, buckle=armor_d)
O.tabard(tabard, half=0.075, bottom=0.3)
# as CORREIAS cruzadas nas costas (as bainhas das adagas)
st = []
for s in (1, -1):
    pts = []
    for i in range(9):
        t = i / 8
        z = O.top - 0.04 * H - t * 0.36 * H
        x = s * (0.12 - 0.24 * t) * H
        q = O.surf('cuirass', Vector((x, 0.6 * H, z)), Vector((0, -1, 0)), 0.008 * H)
        if q:
            pts.append(q)
    if len(pts) > 3:
        st.append(rod(pts, [0.012 * H] * len(pts), 5))
b.add('straps', merge(*st), leather, region='body', weight_fn=O.W('torso'), subdiv=0)
O.scarf(scarf, tail=True)
O.boots(boots, sole, greave=None, high=0.28)
O.hair_short(hairm, thick=0.9)
O.hood(cloth, cloth_d, open_=0.3, r=(0.19, 0.2, 0.21), drop=0.08)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'karise.blend'), check_existing=False)
