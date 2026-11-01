"""
CORPO BASE REALISTA (Blender Studio "Human Base Meshes", CC0) encaixado no esqueleto de lutador do jogo.
O arquivo do pacote fica em assets_src/blender-human-base-meshes/ (fora do git; ver assets_src/README.md).

  body, groups = load_fitted(sk, thick=..., hand_to=...)
    → o objeto já no esqueleto (A-pose → braços retos, escala, ombros e quadris nos ossos do jogo) e, por vértice, os
      pesos do 'bone heat' feito no corpo original, já com os nomes dos ossos do jogo (o skin fica bom nos clipes).

Como funciona: uma armadura temporária com as juntas do corpo base (medidas no Blender MCP) recebe os pesos
automáticos; cada osso é posto na cabeça/cauda do osso do jogo, com escala no comprimento e na espessura, e o
modificador é aplicado.
"""
import os
import bpy
from mathutils import Vector, Matrix

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
BUNDLE = os.path.join(ROOT, 'assets_src', 'blender-human-base-meshes', 'human_base_meshes_bundle.blend')

# juntas do 'GEO-body_male_realistic' (1,684 m, A-pose), lado esquerdo (+x); o direito é o espelho
BASE = {
    'hips': ((0, 0.0, 0.87), (0, 0.0, 1.10)),
    'chest': ((0, 0.0, 1.10), (0, 0.0, 1.42)),
    'neck': ((0, 0.0, 1.42), (0, -0.01, 1.56)),
    'claL': ((0.03, 0.0, 1.40), (0.17, 0.0, 1.38)),
    'sL': ((0.17, 0.0, 1.38), (0.29, 0.0, 1.07)),
    'eL': ((0.29, 0.0, 1.07), (0.37, -0.01, 0.82)),
    'handL': ((0.37, -0.01, 0.82), (0.42, -0.02, 0.64)),
    'lL': ((0.09, 0.0, 0.87), (0.12, 0.0, 0.48)),
    'kL': ((0.12, 0.0, 0.48), (0.17, 0.02, 0.08)),
    'footL': ((0.17, 0.02, 0.08), (0.18, -0.13, 0.01)),
}
PARENT = {'chest': 'hips', 'neck': 'chest', 'cla': 'chest', 's': 'cla', 'e': 's', 'hand': 'e', 'l': 'hips', 'k': 'l', 'foot': 'k'}
ORDER = ['hips', 'chest', 'neck', 'claL', 'claR', 'sL', 'sR', 'eL', 'eR', 'handL', 'handR', 'lL', 'lR', 'kL', 'kR', 'footL', 'footR']


def _mirror(d):
    out = {}
    for k, v in d.items():
        out[k] = v
        if k.endswith('L'):
            out[k[:-1] + 'R'] = tuple((-p[0], p[1], p[2]) for p in v)
    return out


def _kind(k):
    return k[:-1] if k[-1] in 'LR' and k != 'hips' else k


def targets(sk):
    """cabeça/cauda de cada osso temporário no esqueleto do jogo"""
    j = lambda n: tuple(sk[n])
    hips, neck, hd = sk['hips'], sk['neck'], sk['hd']
    sL, eL, hL = sk['sL'], sk['eL'], sk['handL']
    lL, kL = sk['lL'], sk['kL']
    ank = (kL.x, 0.02, 0.07)
    return {
        'hips': (j('hips'), tuple(hips.lerp(neck, 0.4))),
        'chest': (tuple(hips.lerp(neck, 0.4)), (0, 0, neck.z + 0.015)),
        'neck': ((0, 0, neck.z + 0.015), (0, -0.015, hd.z + 0.024)),
        'claL': ((0.04, 0, sL.z + 0.006), j('sL')),
        'sL': (j('sL'), j('eL')),
        'eL': (j('eL'), (hL.x, hL.y - 0.01, hL.z)),
        'handL': ((hL.x, hL.y - 0.01, hL.z), (hL.x + 0.002, hL.y - 0.04, hL.z - 0.37)),
        'lL': (j('lL'), j('kL')),
        'kL': (j('kL'), ank),
        'footL': (ank, (kL.x, -0.19, 0.01)),
    }


def load_fitted(sk, thick, obj='GEO-body_male_realistic', level=1):
    if not os.path.exists(BUNDLE):
        raise SystemExit(f'Falta o pacote CC0 da Blender Studio: {BUNDLE} (ver assets_src/README.md)')
    with bpy.data.libraries.load(BUNDLE) as (src, dst):
        dst.objects = [obj]
    body = dst.objects[0]
    body.data = body.data.copy()
    sc = bpy.context.scene
    sc.collection.objects.link(body)
    body.parent = None
    body.matrix_world = Matrix.Identity(4)
    body.vertex_groups.clear()
    bpy.context.view_layer.objects.active = body
    for m in list(body.modifiers):
        if m.type == 'MULTIRES':
            m.levels = level
            bpy.ops.object.modifier_apply(modifier=m.name)
        else:
            body.modifiers.remove(m)
    full, tgt = _mirror(BASE), _mirror(targets(sk))
    ad = bpy.data.armatures.new('fit')
    arm = bpy.data.objects.new('fit', ad)
    sc.collection.objects.link(arm)
    for o in sc.objects:
        o.select_set(False)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    for k, (h, t) in full.items():
        eb = ad.edit_bones.new(k)
        eb.head, eb.tail, eb.roll = Vector(h), Vector(t), 0
    for k in full:
        p = PARENT.get(_kind(k))
        if p:
            side = k[-1] if k[-1] in 'LR' else ''
            ad.edit_bones[k].parent = ad.edit_bones[p + side if (p + side) in ad.edit_bones else p]
    bpy.ops.object.mode_set(mode='OBJECT')
    body.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    # os pesos do corpo original (antes de deformar), por índice de vértice
    me = body.data
    names = {g.index: g.name for g in body.vertex_groups}
    heat = [{names[g.group]: g.weight for g in v.groups if g.weight > 1e-3} for v in me.vertices]
    bpy.ops.object.mode_set(mode='POSE')
    for k in ORDER:
        pb = arm.pose.bones[k]
        bh, bt = Vector(full[k][0]), Vector(full[k][1])
        th, tt = Vector(tgt[k][0]), Vector(tgt[k][1])
        q = (bt - bh).normalized().rotation_difference((tt - th).normalized())
        sy = (tt - th).length / (bt - bh).length
        f = thick.get(_kind(k), 1.0)
        pb.matrix = Matrix.Translation(th) @ q.to_matrix().to_4x4() @ pb.bone.matrix_local.to_3x3().to_4x4() @ Matrix.Diagonal((f, sy, f, 1))
        bpy.context.view_layer.update()
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.modifier_apply(modifier=next(m for m in body.modifiers if m.type == 'ARMATURE').name)
    body.parent = None
    body.matrix_world = Matrix.Identity(4)
    bpy.data.objects.remove(arm)
    body.vertex_groups.clear()
    # nomes dos ossos do jogo: o peito temporário se divide entre sp e chest pela altura; a clavícula vai para o peito
    cz = sk['chest'].z
    game = []
    for v, w in zip(me.vertices, heat):
        out = {}
        for n, a in w.items():
            k = _kind(n)
            if k == 'chest':
                t = max(0.0, min(1.0, (v.co.z - (cz - 0.12)) / 0.24))
                out['sp'] = out.get('sp', 0) + a * (1 - t)
                out['chest'] = out.get('chest', 0) + a * t
            elif k == 'cla':
                out['chest'] = out.get('chest', 0) + a
            else:
                out[n] = out.get(n, 0) + a
        game.append(out or {'hips': 1.0})
    return body, game


def store_weights(obj, weights):
    """guarda os pesos como grupos de vértices (a decimação interpola) para ler de volta depois"""
    groups = {}
    for i, w in enumerate(weights):
        for n, a in w.items():
            g = groups.get(n) or groups.setdefault(n, obj.vertex_groups.new(name=n))
            g.add([i], a, 'REPLACE')


def read_weights(obj):
    names = {g.index: g.name for g in obj.vertex_groups}
    return [{names[g.group]: g.weight for g in v.groups if g.weight > 1e-3} or {'hips': 1.0} for v in obj.data.vertices]


def load_mesh(obj):
    """(verts no mundo, faces) de um objeto do pacote, sem os modificadores (o crânio e a mandíbula)"""
    with bpy.data.libraries.load(BUNDLE) as (src, dst):
        dst.objects = [obj]
    o = dst.objects[0]
    mw = o.matrix_world.copy()
    verts = [tuple(mw @ v.co) for v in o.data.vertices]
    faces = [tuple(p.vertices) for p in o.data.polygons]
    me = o.data
    bpy.data.objects.remove(o)
    bpy.data.meshes.remove(me)
    return verts, faces
