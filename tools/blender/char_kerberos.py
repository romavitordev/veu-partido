"""
O KERBEROS (forma do Quibungo jogável: a Transformação) — public/models/kerberos.glb. Dono, 2026-11-21: "E a
transformação dele ser o kerberus, com uma cutscene como a do outro lado". Gera a MESMA escultura do NPC
(npc_kerberos_lib.build, o chefe da lua de sangue no Aniquilação) e prende cada peça a um ESQUELETO DE LUTADOR deitado
(as juntas do NPC não são ossos):
  - os BRAÇOS do esqueleto são as patas da FRENTE (sL/eL/handL = legFL/kneeFL/pata); as PERNAS, as de TRÁS;
  - as patas do MEIO vão rígidas com a coluna (sp) — nenhum clipe as mexe sem osso próprio;
  - o tronco: as ancas no quadril, o meio na coluna, o peito no peito;
  - a cabeça do MEIO (a canina) no osso da cabeça; as dos lados (o verme e a insetoide) no pescoço; a cauda no quadril.
Os clipes dele (src/anim/kerberosClips.js) partem desta pose deitada (a coluna quase parada).
  node tools/blender/build.mjs kerberos  → public/models/kerberos.glb (e o NPC em public/npcs)
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector, Matrix
from lib import Skeleton, build_armature, skin, Builder
import npc_kerberos_lib

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'kerberos.glb'
S = 0.85  # o NPC tem ~2,45 de altura e 5,5 de comprimento: no lutador, ~2,1 m de altura (a arena não comporta 7 m)

npc_kerberos_lib.build()
bpy.context.view_layer.update()


def J(name):
    o = bpy.data.objects.get('J_' + name)
    return o.matrix_world.translation * S


def G(x, y, z):  # espaço do jogo (y para cima, +z para a frente) → Blender, já na escala
    return Vector((x, -z, y)) * S


sk = Skeleton(1.0, 1.0, 1.0)
sk.h = 1.0 * S
torso = J('torso')
P = {
    'root': Vector((0, 0, 0)), 'rootTip': Vector((0, 0, 0.1 * S)),
    'hips': torso + G(0, -0.02, -0.7), 'sp': torso + G(0, 0, -0.05), 'chest': torso + G(0, 0.05, 0.55),
    'neck': J('neckC'), 'hd': J('neckC') + G(0, 0.3, 0.38), 'top': J('neckC') + G(0, 0.36, 0.95),
}
for s, front, back in (('L', 'FL', 'BL'), ('R', 'FR', 'BR')):
    leg, knee = J('leg' + front), J('knee' + front)
    P['s' + s], P['e' + s] = leg, knee
    P['hand' + s] = knee + G(0, -0.6, 0.02)
    P['handTip' + s] = P['hand' + s] + G(0, -0.04, 0.3)
    hp, kn = J('leg' + back), J('knee' + back)
    P['l' + s], P['k' + s] = hp, kn
    P['foot' + s] = kn + G(0, -0.6, -0.06)
    P['toe' + s] = P['foot' + s] + G(0, -0.04, 0.3)
sk.j = P

# as peças: a junta de cada uma decide o osso
BONE = {'body': 'hips', 'neckC': 'hd', 'jawC': 'hd', 'neckL': 'neck', 'jawL': 'neck', 'neckR': 'neck', 'jawR': 'neck',
        'tail': 'hips', 'tail2': 'hips', 'legML': 'sp', 'kneeML': 'sp', 'legMR': 'sp', 'kneeMR': 'sp'}
for s, front, back in (('L', 'FL', 'BL'), ('R', 'FR', 'BR')):
    BONE.update({'leg' + front: 's' + s, 'knee' + front: 'e' + s, 'leg' + back: 'l' + s, 'knee' + back: 'k' + s})

parts = []
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    par = o.parent
    key = par.name[2:] if par and par.name.startswith('J_') else 'torso'
    parts.append((o, key))
for o, key in parts:
    mw = o.matrix_world.copy()
    o.parent = None
    o.data.transform(Matrix.Scale(S, 4) @ mw)
    o.matrix_world = Matrix.Identity(4)
for e in [o for o in bpy.data.objects if o.type == 'EMPTY']:
    bpy.data.objects.remove(e, do_unlink=True)

arm = build_armature(sk)
b = Builder.__new__(Builder)
b.sk, b.arm, b.parts = sk, arm, []
yH, yS, yC = P['hips'].y, P['sp'].y, P['chest'].y  # Blender: a frente é -y


def torso_w(p):
    """o tronco ao longo do comprimento: as ancas no quadril, o meio na coluna, o peito (e a base dos pescoços) no peito"""
    y = p.y
    if y > yS:
        k = max(0.0, min(1.0, (y - yS) / (yH - yS)))
        return {'sp': 1 - k, 'hips': k}
    k = max(0.0, min(1.0, (yS - y) / (yS - yC)))
    return {'sp': 1 - k, 'chest': k}


for o, key in parts:
    bone = BONE.get(key)
    if key == 'torso':
        wf = torso_w
    else:
        wf = (lambda bn: lambda p: {bn: 1.0})(bone or 'sp')
    skin(o, arm, sk, weight_fn=wf)
    o.name = 'k_' + key + '_' + o.name.split('.')[0]
    b.parts.append(o)

b.export(OUT)
