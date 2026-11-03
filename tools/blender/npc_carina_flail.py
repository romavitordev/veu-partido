"""
MANGUAL DE MARCO LEONE (a arma da Carina) — pela arte oficial "Mangual de Marco Leone em Calamidade" (wiki "Carina
Leone", Arsenal: "um mangual decorado, utilizado por Marco Leone em sua juventude"): o CABO de metal verde-acinzentado
com os colares de bronze trabalhados nas duas pontas e o olhal no alto, a CORRENTE preta longa (quase do tamanho do
cabo) e a bola de espinhos que é uma CABEÇA DE LEÃO de bronze, a juba em pontas.

Orientação (a mesma do mangual antigo feito em código): o punho na origem, o cabo descendo em -Y, a corrente pendendo
em -Y. Cada elo é uma junta (J_c0..J_c11) e a cabeça de leão vai na J_ball: o jogo balança a corrente em código.
  node tools/blender/build.mjs carina_flail   → public/npcs/carina_flail.glb (models/weapons.js → mangual())
"""
import sys
import os
import math

import bpy

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb
from npc_lib import rod, blob, ring, joint, add, parts, finish
from npc_carina_lib import lion_head, chain

reset()
M = {
    'shaft': material('flail_shaft', '#465244', 0.5, metal=0.6),
    'collar': material('flail_bronze', '#8a5a34', 0.45, metal=0.7),
    'chain': material('flail_chain', '#1c1c20', 0.5, metal=0.7),
    'metal': material('flail_lion', '#b08a5c', 0.4, metal=0.75),
    'dark': material('flail_lion_dark', '#2a1c12', 0.7),
    'bone': material('flail_lion_fang', '#e8dcc0', 0.5),
}
J = joint('J_flail', (0, 0, 0))

TOP, TIP = 0.09, -0.29  # o pomo (acima da mão) e a ponta de onde sai a corrente
add(J, 'shaft', rod([(0, TOP - 0.03, 0), (0, TIP + 0.03, 0)], 0.016, seg=10), M['shaft'])
# os COLARES de bronze: o de baixo (pomo, com os rebites) e o de cima (com os anéis e o olhal)
for (y0, y1, r) in ((TOP, TOP - 0.05, 0.021), (TIP + 0.055, TIP, 0.021)):
    add(J, f'collar{y0}', rod([(0, y0, 0), (0, y1, 0)], r, seg=10), M['collar'])
    for k in range(3):
        y = y0 + (y1 - y0) * (0.2 + 0.3 * k)
        add(J, f'collarRing{y0}{k}', ring((0, y, 0), (0, 1, 0), r + 0.002, 0.0028, 12), M['collar'])
add(J, 'pommel', blob((0, TOP + 0.006, 0), (0.019, 0.012, 0.019), 10, 6), M['collar'])
for sx in (-1, 1):
    add(J, f'rivet{sx}', blob((sx * 0.021, TOP - 0.025, 0), (0.004, 0.005, 0.005), 6, 4), M['dark'])
add(J, 'eye', ring((0, TIP - 0.012, 0), (1, 0, 0), 0.011, 0.0035, 12), M['collar'])

# a CORRENTE longa: 12 elos de 2,6 cm, presos no olhal
last = chain(J, (0, TIP - 0.024, 0), 'c', 12, 0.026, 0.0085, 0.0028, M['chain'])
# a CABEÇA DE LEÃO pendurada no último elo pelo topo da juba (a argola na nuca)
B = joint('J_ball', (0, -0.026, 0), last)
add(B, 'ballRing', ring((0, -0.006, 0), (1, 0, 0), 0.009, 0.003, 10), M['chain'])
lion_head(B, (0, -0.078, 0), 1.15, M, 'lion')

for objs in parts.values():
    for o in objs:
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()
out = sys.argv[sys.argv.index('--') + 1]
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'carina_flail.blend'), check_existing=False)
export_glb(out)
