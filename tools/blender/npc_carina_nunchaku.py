"""
NUNCHAKU DOURADO DA CARINA (a forma Todos os Leone) — pela arte oficial "Nunchaku de Carina Leone" (wiki, Arsenal: no
ep. 4 de Calamidade ela aprimora a arma, "deixando-a dourada tanto nas correntes quanto nos bastões, além de colocar
'Leone' escrito neles" e "o símbolo dos Leone em cada extremidade dos bastões"): os dois bastões dourados com as
FAIXAS escuras perto das pontas, o "LEONE" gravado ao longo de cada um, a CABEÇA DE LEÃO com a juba nas pontas de fora
e a corrente curta ligando as pontas de dentro.

Orientação: o punho segura o bastão A logo abaixo da cabeça de leão (origem), o bastão desce em -Y até a corrente; os
elos são juntas (J_n0..J_n3) e o bastão B fica na J_stickB, pendurado: o jogo balança os dois em código.
  node tools/blender/build.mjs carina_nunchaku   → public/npcs/carina_nunchaku.glb (models/weapons.js → nunchaku())
"""
import sys
import os

import bpy

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb
from npc_lib import rod, ring, joint, add, parts, finish
from npc_carina_lib import lion_head, chain, text_on_rod

reset()
M = {
    'gold': material('nun_gold', '#d9a83a', 0.3, metal=0.85),
    'band': material('nun_band', '#3a2410', 0.6),
    'metal': material('nun_lion', '#e0b448', 0.3, metal=0.85),
    'dark': material('nun_lion_dark', '#3a2410', 0.7),
    'bone': material('nun_lion_fang', '#fff0c8', 0.4),
    'text': material('nun_text', '#5a3212', 0.6),
}
L, R = 0.32, 0.017


def stick(j, y_lion, y_chain, tag):
    """um bastão entre a ponta da cabeça de leão (y_lion) e a ponta da corrente (y_chain)"""
    sgn = 1 if y_chain < y_lion else -1  # para onde fica a corrente
    add(j, f'{tag}Body', rod([(0, y_lion - sgn * 0.012, 0), (0, y_chain, 0)], [R * 0.95, R], seg=10), M['gold'])
    for k, y in enumerate((y_lion - sgn * 0.03, y_lion - sgn * 0.05, y_chain + sgn * 0.02, y_chain + sgn * 0.038)):
        add(j, f'{tag}Band{k}', ring((0, y, 0), (0, 1, 0), R + 0.0015, 0.0042, 12), M['band'])
    text_on_rod(j, 'LEONE', (y_lion + y_chain) / 2, R, 0.042, M['text'], f'{tag}Text')
    lion_head(j, (0, y_lion + sgn * 0.012, 0), 0.5, M, f'{tag}Lion')
    add(j, f'{tag}Eye', ring((0, y_chain - sgn * 0.006, 0), (1, 0, 0), 0.008, 0.0028, 10), M['gold'])


A = joint('J_nunchaku', (0, 0, 0))
stick(A, 0.05, 0.05 - L, 'a')
last = chain(A, (0, 0.05 - L - 0.016, 0), 'n', 4, 0.02, 0.0065, 0.0024, M['gold'])
B = joint('J_stickB', (0, -0.02, 0), last)
stick(B, -0.006 - L, -0.006, 'b')

for objs in parts.values():
    for o in objs:
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()
out = sys.argv[sys.argv.index('--') + 1]
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'carina_nunchaku.blend'), check_existing=False)
export_glb(out)
