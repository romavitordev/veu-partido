"""
O QUIBUNGO (lutador jogável, equipe Outro Lado) — public/models/quibungo.glb. Pedido do dono (2026-11-20): "assim que
finalizar o quimbungo quero que lance ele como personagem jogavel do time do 'Outro Lado'"; e: "O modelo do quimbungo
atual já não é utilizavel como personagem jogavel?" — é: este script NÃO remodela. Gera a MESMA escultura do chefe do
Sertão (npc_zumbi_lib.build(strong=True, quibungo=True), o NPC de public/npcs/quibungo.glb) e prende cada peça a um
ESQUELETO DE LUTADOR com as proporções dele (as animações dos lutadores giram os ossos do rig padrão; as juntas do NPC
não são ossos). O esqueleto segue as juntas do NPC: braços longos até os joelhos, a cabeça baixa e à frente.
  - o 2º par de braços acompanha o 1º (os mesmos ossos do lado), mais baixo e por dentro;
  - as mandíbulas vão com a cabeça; os espinhos, a bocarra e a língua das costas, com o peito.
  mcp_build("quibungo")  → public/models/quibungo.glb
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector, Matrix
import lib
from lib import Skeleton, build_armature, skin, Builder
import npc_zumbi_lib

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'quibungo.glb'
S = 1.25  # o Quibungo é um gigante (dono, 2026-11-21: "Ele deve ser um pouco maior"; o do Outro Lado, 1,6×, continua maior)

# 1) a escultura do NPC, sem exportar
_exp = npc_zumbi_lib.export_glb
npc_zumbi_lib.export_glb = lambda path: None
try:
    npc_zumbi_lib.build(strong=True, quibungo=True)
finally:
    npc_zumbi_lib.export_glb = _exp
bpy.context.view_layer.update()


def T(x, y, z):  # espaço do jogo (y para cima, +z para a frente) → Blender, já na escala
    return Vector((x, -z, y)) * S


def J(name):
    o = bpy.data.objects.get('J_' + name)
    return o.matrix_world.translation / 1.0 * S if o else None


# 2) o esqueleto de lutador nas juntas do NPC
sk = Skeleton(1.0, 1.0, 1.0)
sk.h = 1.0 * S
hip = J('body') + Vector((0, 0, 0.95 * S))
chest = J('chest')
neck = J('neck')
P = {
    'root': Vector((0, 0, 0)), 'rootTip': Vector((0, 0, 0.1 * S)),
    'hips': chest.copy(), 'sp': chest + Vector((0, 0, 0.22 * S)), 'chest': chest + Vector((0, 0, 0.5 * S)),
    'neck': neck + Vector((0, 0.12 * S, -0.06 * S)), 'hd': neck.copy(), 'top': neck + Vector((0, -0.3 * S, 0.12 * S)),
}
for s in ('L', 'R'):
    sh, el, hd = J('sh' + s), J('el' + s), J('hand' + s)
    P['s' + s], P['e' + s], P['hand' + s] = sh, el, hd
    P['handTip' + s] = hd + Vector((0, -0.06 * S, -0.4 * S))
    hp, kn = J('hip' + s), J('knee' + s)
    P['l' + s], P['k' + s] = hp, kn
    P['foot' + s] = kn + Vector((0, 0, -0.4 * S))
    P['toe' + s] = P['foot' + s] + Vector((0, -0.28 * S, -0.02 * S))
sk.j = P

# 3) cada peça do NPC vira malha do lutador, presa aos ossos (a escala vai para os vértices)
BONE = {
    'body': 'hips', 'chest': 'chest', 'neck': 'hd', 'jaw': 'hd', 'mandL': 'hd', 'mandR': 'hd',
    'tongue': 'chest', 'tongue2': 'chest', 'tongue3': 'chest',
}
for s in ('L', 'R'):
    BONE.update({'sh' + s: 's' + s, 'el' + s: 'e' + s, 'hand' + s: 'hand' + s, 'hip' + s: 'l' + s, 'knee' + s: 'k' + s,
                 'sh' + s + '2': 's' + s, 'el' + s + '2': 'e' + s, 'hand' + s + '2': 'hand' + s})

# a LÍNGUA foi feita para o tronco curvado do chefe: de pé, virava um rabo de 2 m para trás. No lutador ela sobe da
# bocarra das costas como um RABO CURVADO PARA CIMA, em S (dono, 2026-11-20, com a arte: "sua lingua como um rabo
# curvado pra cima"): sai para trás, sobe, faz a volta por cima e a ponta enrola
tmat = None
for nm in ('P_tongue', 'P_tongue2', 'P_tongue3'):
    o = bpy.data.objects.get(nm)
    if o:
        tmat = tmat or o.data.materials[0]
        bpy.data.objects.remove(o, do_unlink=True)
from npc_lib import rod
from lib import make_obj
r0 = bpy.data.objects['J_tongue'].matrix_world.translation.copy()
ctrl = [(0, 0, 0), (0, 0.1, 0.12), (0, 0.24, 0.4), (0, 0.28, 0.72), (0, 0.18, 1.0), (0, 0.0, 1.14), (0, -0.16, 1.1),
        (0, -0.22, 0.96), (0, -0.14, 0.86), (0, -0.04, 0.9)]
pts = []
for i in range(len(ctrl) - 1):  # amacia o caminho (Catmull-Rom)
    p0, p1, p2, p3 = (Vector(ctrl[max(0, i - 1)]), Vector(ctrl[i]), Vector(ctrl[i + 1]), Vector(ctrl[min(len(ctrl) - 1, i + 2)]))
    for k in range(4):
        t = k / 4
        pts.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
pts.append(Vector(ctrl[-1]))
n = len(pts)
rads = [0.075 - 0.062 * (i / (n - 1)) ** 1.3 for i in range(n)]
rads[-1] = 0.004
G = lambda v: (v.x, v.z, -v.y)  # o rod do npc_lib recebe o espaço do jogo (y para cima, +z para a frente)
tv, tf, tu = rod([G(r0 + p) for p in pts], rads, seg=10)
make_obj('P_tongue', tv, tf, tu, mat=tmat)

meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith('P_')]
for o in meshes:
    mw = o.matrix_world.copy()
    o.parent = None
    o.data.transform(Matrix.Scale(S, 4) @ mw)
    o.matrix_world = Matrix.Identity(4)
for e in [o for o in bpy.data.objects if o.type == 'EMPTY']:
    bpy.data.objects.remove(e, do_unlink=True)

arm = build_armature(sk)
b = Builder.__new__(Builder)
b.sk, b.arm, b.parts = sk, arm, []


def torso_w(p):
    """o tronco: o quadril embaixo, a coluna no meio, o peito em cima (a bocarra e a corcova vão com o peito)"""
    z = p.z
    if z < P['sp'].z:
        k = max(0.0, min(1.0, (z - P['hips'].z) / (P['sp'].z - P['hips'].z)))
        return {'hips': 1 - k * 0.5, 'sp': k * 0.5}
    k = max(0.0, min(1.0, (z - P['sp'].z) / (P['chest'].z - P['sp'].z)))
    return {'sp': 1 - k, 'chest': k}


for o in meshes:
    key = o.name[2:].split('.')[0]
    bone = BONE.get(key, 'chest')
    if key == 'chest':
        wf = torso_w
    elif bone in ('lL', 'lR'):  # a coxa encosta no quadril
        wf = (lambda bn: lambda p: {bn: 1.0} if p.z < P['hips'].z - 0.08 * S else {bn: 0.6, 'hips': 0.4})(bone)
    else:
        wf = (lambda bn: lambda p: {bn: 1.0})(bone)
    skin(o, arm, sk, weight_fn=wf)
    # a LÍNGUA fica separada (prop_tongue): no jogo ela some enquanto estica até a presa (a corda É ela) e volta depois
    o.name = 'prop_tongue' if key == 'tongue' else 'q_' + key
    b.parts.append(o)

b.export(OUT)
