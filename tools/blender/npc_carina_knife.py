"""
FACA DE ARREMESSO DA CARINA — wiki "Carina Leone", Arsenal: "pequenas lâminas afiadas, sendo algumas decoradas com o
símbolo dos Leone". Sem arte própria na wiki: a forma é PROPOSTA (faca de arremesso de peça única, lâmina em folha, o
cabo enrolado em couro preto, a argola no pomo e o medalhão dourado com a cabeça de leão no meio do cabo).

Orientação: o punho na origem, a lâmina para -Y, o fio para os lados (x).
  node tools/blender/build.mjs carina_knife   → public/npcs/carina_knife.glb (models/props.js: a faca na mão no arremesso)
"""
import sys
import os

import bpy

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb
from npc_lib import rod, ring, joint, add, parts, finish
from npc_carina_lib import lion_head

reset()
M = {
    'steel': material('knife_steel', '#c8ccd2', 0.25, metal=0.9),
    'wrap': material('knife_wrap', '#18181a', 0.8),
    'metal': material('knife_lion', '#d4a838', 0.3, metal=0.85),
    'dark': material('knife_lion_dark', '#3a2410', 0.7),
    'bone': material('knife_lion_fang', '#fff0c8', 0.4),
}
J = joint('J_knife', (0, 0, 0))
# a lâmina em folha: larga no meio, achatada (flat) e afinando até a ponta
n = 14
pts = [(0, -0.045 - 0.12 * k / n, 0) for k in range(n + 1)]
rs = [0.004 + 0.014 * max(0.0, 1 - abs(2 * k / n - 0.7) / 1.3) ** 1.2 if k < n else 0.0008 for k in range(n + 1)]
add(J, 'blade', rod(pts, rs, seg=8, flat=0.18), M['steel'])
add(J, 'grip', rod([(0, 0.05, 0), (0, -0.045, 0)], 0.0075, seg=8), M['wrap'])
for k in range(6):
    add(J, f'wrap{k}', ring((0, 0.04 - k * 0.016, 0), (0, 1, 0), 0.0082, 0.0018, 10), M['wrap'])
add(J, 'pommelRing', ring((0, 0.064, 0), (0, 0, 1), 0.012, 0.0028, 12), M['steel'])
lion_head(J, (0, 0.0, 0.007), 0.16, M, 'lion')

for objs in parts.values():
    for o in objs:
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()
out = sys.argv[sys.argv.index('--') + 1]
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'carina_knife.blend'), check_existing=False)
export_glb(out)
