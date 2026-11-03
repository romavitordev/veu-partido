"""
GLOCK SILENCIADA DA CARINA — wiki "Carina Leone", Arsenal: "uma pistola semiautomática com silenciador toda dourada e
com uma cabeça de leão em seu cabo"; a arte oficial ("Glock Silenciada de Carina Leone") dá a forma: o ferrolho reto e
longo com as ranhuras atrás, a armação com o trilho embaixo, o cabo inclinado e o SILENCIADOR comprido, quase do
tamanho da pistola. Dourada pelo texto da wiki; o silenciador escuro.

Orientação (a mesma da Glock antiga feita em código): o punho na origem, o cano para -Y, o topo em +Z. A junta
J_muzzle marca a boca do silenciador (o tiro sai dali).
  node tools/blender/build.mjs carina_glock   → public/npcs/carina_glock.glb (models/weapons.js → glockLeone())
"""
import sys
import os

import bpy

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb, box
from npc_lib import T, rod, blob, ring, joint, add, parts, finish
from npc_carina_lib import lion_head


def bx(center, size, bevel=0.002):
    """caixa no espaço do jogo (x, y, z) → Blender"""
    x, y, z = center
    sx, sy, sz = size
    return box(tuple(T(x, y, z)), (sx, sz, sy), bevel=bevel)


reset()
M = {
    'gold': material('glock_gold', '#d4a838', 0.3, metal=0.85),
    'goldDk': material('glock_gold_dark', '#9a7420', 0.45, metal=0.8),
    'sil': material('glock_silencer', '#1c1c20', 0.45, metal=0.7),
    'metal': material('glock_lion', '#e8c058', 0.3, metal=0.85),
    'dark': material('glock_lion_dark', '#3a2410', 0.7),
    'bone': material('glock_lion_fang', '#fff0c8', 0.4),
}
J = joint('J_glock', (0, 0, 0))
add(J, 'slide', bx((0, -0.065, 0.032), (0.028, 0.2, 0.034)), M['gold'])
for k in range(5):  # as ranhuras do ferrolho, atrás
    add(J, f'serr{k}', bx((0, 0.012 - k * 0.008, 0.032), (0.03, 0.0025, 0.03), 0.0004), M['goldDk'])
add(J, 'frame', bx((0, -0.055, 0.006), (0.026, 0.16, 0.022)), M['gold'])
add(J, 'rail', bx((0, -0.1, -0.006), (0.02, 0.06, 0.008)), M['goldDk'])
add(J, 'grip', bx((0, 0.004, -0.04), (0.027, 0.05, 0.095)), M['gold'])
for k in range(4):  # o pontilhado do cabo
    add(J, f'gripTex{k}', bx((0, 0.004, -0.02 - k * 0.018), (0.029, 0.04, 0.006), 0.0006), M['goldDk'])
add(J, 'guard', rod([(0, -0.012, -0.005), (0, -0.03, -0.022), (0, -0.05, -0.018), (0, -0.058, -0.004)], 0.0035, seg=6), M['goldDk'])
add(J, 'trigger', rod([(0, -0.03, -0.004), (0, -0.034, -0.016)], 0.003, seg=5), M['goldDk'])
# a CABEÇA DE LEÃO no pé do cabo, olhando para trás (o brasão dos Leone)
lion_head(J, (0, 0.012, -0.092), 0.32, M, 'lion')
# o SILENCIADOR comprido
add(J, 'silencer', rod([(0, -0.16, 0.032), (0, -0.32, 0.032)], 0.016, seg=12), M['sil'])
for y in (-0.165, -0.315):
    add(J, f'silRing{y}', ring((0, y, 0.032), (0, 1, 0), 0.0165, 0.0022, 12), M['goldDk'])
joint('J_muzzle', (0, -0.325, 0.032), J)

for objs in parts.values():
    for o in objs:
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()
out = sys.argv[sys.argv.index('--') + 1]
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'carina_glock.blend'), check_existing=False)
export_glb(out)
