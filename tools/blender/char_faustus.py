"""
FAUSTUS (Ordo Calamitas, Calamidade) — public/models/faustus.glb. Pela wiki "Faustus" e as miniaturas de Calamidade:
"O General" — homem negro, CABELO CRESPO castanho, CICATRIZES no rosto (textura face_faustus), ARMADURA CINZA e o GRANDE
ELMO DE GLADIADOR (aba larga e grade no rosto). De cima a baixo: o elmo (prop_helmet: sai no Tirar Capacete e no Arriscar
Tudo), o cachecol escuro, as ombreiras em lâminas, a couraça cinza em faixas com o PANO do Símbolo (tabard_faustus), a
MANICA (a proteção de gladiador em placas) no braço do gládio, as pteruges de couro, a calça escura e as botas com grevas.
O GLÁDIO com o colar de cruz e as chamas rosa/azuis da aura ficam em código (models/ordoWeapons.js, models/ordoProps.js).
  node tools/blender/build.mjs faustus   → public/models/faustus.glb
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, relief, clothe
from ordo_lib import Ordo
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'faustus.glb'

b = Builder(width=1.0, bulk=1.0, height=1.02)
sk = b.sk
H = sk.h
skin = material('skin_faustus', '#4a2e22', 0.68)
under = material('under_faustus', '#25232a', 0.85)
armor = material('armor_faustus', '#6c6e74', 0.36, metal=0.7)
armor_d = material('armor_faustus_dark', '#4a4c52', 0.4, metal=0.6)
grille = material('grille_faustus', '#2a2a2e', 0.4, metal=0.7)
leather = material('leather_faustus', '#3a2a1e', 0.62)
scarf = material('scarf_faustus', '#1e1c22', 0.95)
boots = material('boots_faustus', '#1c1a1e', 0.55)
sole = material('sole_faustus', '#121014', 0.8)
hairm = material('hair_faustus', '#2a1a12', 0.85)
crest = material('crest_faustus', '#8a2a4a', 0.85)  # a crista do elmo (PROPOSTA: o rosa da aura, escurecido)
tabard = material('tabard_faustus', '#ffffff', 0.9)
M = {'skin': skin, 'face': material('face_faustus', '#ffffff', 0.75), 'torso': skin, 'arm': skin, 'hand': skin, 'legs': under, 'feet': boots}
for m in bpy.data.materials:
    for k, c in {'face_faustus': '#4a2e22', 'tabard_faustus': '#3e3a42'}.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.115, 0.168), (0.0, 0.162), (0.17, 0.148), (0.36, 0.188), (0.47, 0.2), (0.57, 0.11), (0.63, 0.064)]
HEAD = (0.128, 0.138, 0.152)
hc = b.body(M, TP, arm_r=(0.064, 0.054, 0.044), leg_r=(0.09, 0.07, 0.056), head_r=HEAD, feet='bare')
O = Ordo(b, hc, HEAD)

O.under(under, sleeves=under, sleeve_to='short', pants=under)
O.cuirass(armor, lo=0.08, bands=20)
O.pauldrons(armor, 'plates', trim=armor_d)
O.belt(leather, buckle=armor)
O.pteruges(leather, n=16, length=0.26, skip_front=0.32)
O.tabard(tabard, half=0.085, bottom=0.42)
O.scarf(scarf)
# a MANICA (direita, o braço do gládio): placas sobrepostas do ombro ao pulso; na esquerda, só a braçadeira de couro
sR, hR = sk['sR'], sk['handR']
man = b.add('manica', clothe(O.part('armR'), lambda p: hR.z + 0.03 * H < p.z < sR.z - 0.04 * H, 0.022 * H, cuts=1), armor, region='body', weight_fn=O.W('armR'), subdiv=0)
relief(man, lambda p: 0.006 * H * (ridge(p.z / H * 34, 3) - 0.3))
eL, hL = sk['eL'], sk['handL']
b.add('bracerL', clothe(O.part('armL'), lambda p: hL.z + 0.03 * H < p.z < eL.z - 0.02 * H, 0.016 * H, cuts=1), leather, region='body', weight_fn=O.W('armL'), subdiv=0)
O.boots(boots, sole, greave=armor)
O.hair_short(hairm, curly=0.8, thick=1.0)
O.helmet_gladiator(armor, grille, trim=grille, crest=crest)

b.export(OUT)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'faustus.blend'), check_existing=False)
