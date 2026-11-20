"""
MARIUS (Ordo Calamitas, Calamidade) — public/models/marius.glb. Wiki "Marius" e miniaturas: "O Guerreiro"/"Grandão",
~2 m, PARRUDO, ARMADURA GRANDE com o Símbolo da Ordo GRAVADO no peitoral (aqui, o pano tabard_marius curto sobre o peito),
ELMO FECHADO e as cicatrizes de queimadura do incêndio de Roma (textura face_marius, por baixo do elmo). De cima a baixo:
o elmo fechado com a fenda e os respiros, as OMBREIRAS em cúpula, a couraça pesada em faixas, o cachecol, o cinto largo,
as pteruges, as grevas e as botas. As MANOPLAS escuras e a aura vermelha ficam em código (ordoWeapons.js / ordoProps.js).
  node tools/blender/build.mjs marius   → public/models/marius.glb
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
import lib
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo, grid
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'marius.glb'

b = Builder(width=1.22, bulk=1.25, height=1.12)
sk = b.sk
H = sk.h
hz = sk['hips'].z
skin = material('skin_marius', '#c89478', 0.68)
M = {'skin': skin, 'face': material('face_marius', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': skin, 'feet': skin}
under = material('under_marius', '#221e20', 0.85)
armor = material('armor_marius', '#55575e', 0.36, metal=0.7)
armor_d = material('armor_marius_dark', '#33343a', 0.42, metal=0.6)
slit = material('slit_marius', '#08080a', 0.9)
leather = material('leather_marius', '#2e2018', 0.62)
scarf = material('scarf_marius', '#3a1614', 0.95)
boots = material('boots_marius', '#1a1618', 0.55)
sole = material('sole_marius', '#100e10', 0.8)
tabard = material('tabard_marius', '#ffffff', 0.9)
for m in bpy.data.materials:
    for k, c in {'face_marius': '#c89478', 'tabard_marius': '#3a2422'}.items():
        if m.name.endswith(k):
            m['preview'] = c
TP = [(-0.115, 0.19), (0.0, 0.184), (0.17, 0.176), (0.36, 0.22), (0.47, 0.232), (0.57, 0.128), (0.63, 0.074)]
HR = (0.13, 0.14, 0.155)
M['legs'] = under
M['feet'] = boots
# 2026-11-20 (dono: "Marius deveria ser um personagem grande como o dalmo"): o tronco em barril do Dalmo — fundo na
# frente (peitoral e barriga de lutador de rua) e nas costas (dorsais), em vez do tubo achatado; braços e pernas grossos.
# (z relativo ao quadril, meia-largura, profundidade da FRENTE, profundidade das COSTAS) — em frações de H
TT = [
    (-0.115, 0.2, 0.165, 0.155),
    (0.0, 0.198, 0.175, 0.16),
    (0.12, 0.205, 0.2, 0.162),     # barriga
    (0.24, 0.225, 0.215, 0.168),
    (0.34, 0.248, 0.225, 0.178),   # peitoral
    (0.43, 0.262, 0.215, 0.185),   # dorsais largos
    (0.5, 0.25, 0.19, 0.18),
    (0.56, 0.205, 0.15, 0.155),    # trapézio
    (0.6, 0.15, 0.11, 0.118),
    (0.635, 0.085, 0.075, 0.08),
]


def _lerp(z):
    if z <= TT[0][0]:
        return TT[0][1:]
    for a, c in zip(TT, TT[1:]):
        if z <= c[0]:
            t = (z - a[0]) / (c[0] - a[0])
            return tuple(p + (q - p) * t for p, q in zip(a[1:], c[1:]))
    return TT[-1][1:]


def marius_torso(sk_, profile, seg=18, depth=0.62):
    v, f, u = tube([(0, 0, hz + z * H, w * H, 1.0) for z, w, fd, bd in TT], 32)
    out = []
    for x, y, z in v:
        _, fd, bd = _lerp((z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = marius_torso
hc = b.body(M, TP, arm_r=(0.096, 0.083, 0.066), leg_r=(0.13, 0.102, 0.076), head_r=HR, feet='bare')
O = Ordo(b, hc, HR)
O.under(under, sleeves=under, sleeve_to='wrist', pants=under)
O.cuirass(armor, lo=0.06, bands=16, depth=0.008, thick=0.038, chest_relief=0.012)
O.pauldrons(armor, 'round', trim=armor_d, size=1.15)
O.bracers(armor_d, ridges=18, thick=0.026)
O.belt(leather, buckle=armor_d, z1=0.07, thick=0.045)
O.pteruges(leather, n=20, length=0.25, r=0.245, skip_front=0.0)
O.tabard(tabard, half=0.1, bottom=-0.18, flare=0.0)
O.scarf(scarf, thick=1.2, tail=False)
O.boots(boots, sole, greave=armor)
O.helmet_closed(armor, slit, trim=armor_d, scale=1.22)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'marius.blend'), check_existing=False)
