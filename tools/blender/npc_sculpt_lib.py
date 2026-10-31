"""
ESCULTURA ORGÂNICA das INVOCAÇÕES (npc_*.py com peças em juntas J_*): cada peça é UMA forma contínua — vários
metaballs que se fundem (os negativos cavam), suavizados, com relevo por deslocamento ao longo da normal, decimados para
o orçamento e com a cor por VÉRTICE (COLOR_0). Nasceu no Carniçal (npc_carnical.py); os Zumbis de Sangue usam o mesmo.
Coordenadas no espaço do jogo (x = esquerda do boneco, y = cima, z = frente); a conversão para o Blender é T().
"""
import math

import bpy
import bmesh
from mathutils import Vector, noise

from lib import material
from npc_lib import T, parts

K = 0.575  # metaball (rigidez 2, limiar 0.6): a superfície isolada fica em 0.575 × raio


def g2b(p):
    return T(*p)


def b2g(v):
    return Vector((v.x, v.z, -v.y))


def ridge(x, sharp=3):
    """crista de fibra: 1 no topo, 0 no sulco"""
    return (0.5 + 0.5 * math.cos(x)) ** sharp


def n3(p, s=1.0):
    return noise.noise(Vector(p) * s)


def vcol_material(name, rough=0.55):
    """material cuja cor vem do atributo de vértice (o glTF exporta COLOR_0; o jogo usa vertexColors)"""
    m = material(name, '#ffffff', rough)
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    attr = nt.nodes.new('ShaderNodeVertexColor')
    attr.layer_name = 'Col'
    nt.links.new(attr.outputs['Color'], bsdf.inputs['Base Color'])
    return m


class Sculpt:
    """uma forma orgânica: elementos que se fundem; grupos dizem a cor (e negativos cavam)"""

    def __init__(self, name):
        self.name = name
        self.els = []  # (centro, raios(x,y,z jogo), dir ou None, negativo, grupo)

    def ell(self, c, r, group='lodo', dir=None, neg=False):
        if not isinstance(r, (tuple, list)):
            r = (r, r, r)
        self.els.append((Vector(c), tuple(r), Vector(dir).normalized() if dir else None, neg, group))

    def chain(self, pts, radii, group='lodo', step=0.45):
        """bolas ao longo de uma polilinha (membros, tendões, dedos), espaçadas para fundir lisas"""
        n = len(pts)
        rs = radii if isinstance(radii, (list, tuple)) else [radii] * n
        if len(rs) != n:
            rs = [rs[0] + (rs[-1] - rs[0]) * i / (n - 1) for i in range(n)]
        for i in range(n - 1):
            a, b = Vector(pts[i]), Vector(pts[i + 1])
            k = max(1, int((b - a).length / (min(rs[i], rs[i + 1]) * step)))
            for j in range(k):
                t = j / k
                self.ell(a.lerp(b, t), rs[i] + (rs[i + 1] - rs[i]) * t, group)
        self.ell(pts[-1], rs[-1], group)

    def field(self, p):
        """o campo de cada grupo em p (para colorir): soma das contribuições dos elementos"""
        out = {}
        for c, r, d, neg, g in self.els:
            q = p - c
            if d is None:
                x, y, z = q.x / r[0], q.y / r[1], q.z / r[2]
            else:  # elipsoide orientado: r[1] ao longo de d
                along = q.dot(d)
                perp = (q - d * along).length
                x, y, z = perp / r[0], along / r[1], 0
            dd = (x * x + y * y + z * z) * K * K
            if dd < 1:
                out[g] = out.get(g, 0) + 2 * (1 - dd) ** 3
        return out

    def build(self, jnt, mat, target, res=0.009, smooth=4, disp=None, color=None):
        mb = bpy.data.metaballs.new('MB' + self.name)
        mb.resolution = res
        mb.render_resolution = res
        mb.threshold = 0.6
        for c, r, d, neg, g in self.els:
            e = mb.elements.new(type='ELLIPSOID')
            e.co = g2b(c)
            e.radius = 1 / K
            e.stiffness = 8.0 if neg else 2.0  # o negativo forte cava de verdade (órbitas, topo rompido)
            e.use_negative = neg
            if d is None:
                e.size_x, e.size_y, e.size_z = r[0], r[2], r[1]
            else:
                e.size_x, e.size_y, e.size_z = r[0], r[0], r[1]
                e.rotation = Vector((0, 0, 1)).rotation_difference(g2b(d))
        mob = bpy.data.objects.new('MB' + self.name, mb)  # nome único = família de metaball própria
        bpy.context.scene.collection.objects.link(mob)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(mob.evaluated_get(dg))
        bpy.data.objects.remove(mob)
        bpy.data.metaballs.remove(mb)
        o = bpy.data.objects.new(self.name, me)
        bpy.context.scene.collection.objects.link(o)
        o.parent = jnt
        # limpa a malha do marching cubes (vértices duplicados) e suaviza
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=res * 0.25)
        bmesh.ops.triangulate(bm, faces=bm.faces)
        for _ in range(smooth):
            bmesh.ops.smooth_vert(bm, verts=bm.verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        bm.normal_update()
        # esculpe: as fibras (e rachaduras) por deslocamento ao longo da normal
        if disp:
            for v in bm.verts:
                v.co += v.normal * disp(b2g(v.co))
        bm.to_mesh(me)
        bm.free()
        # decima para o orçamento
        tris = len(me.polygons)
        if tris > target:
            m = o.modifiers.new('dec', 'DECIMATE')
            m.ratio = target / tris
            m.use_collapse_triangulate = True
            dg = bpy.context.evaluated_depsgraph_get()
            me2 = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
            o.modifiers.clear()
            o.data = me2
            bpy.data.meshes.remove(me)
            me = me2
        me.shade_smooth()
        me.materials.append(mat)
        # cor por vértice
        if color:
            ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
            for v in me.vertices:
                c = color(b2g(v.co), self)
                ca.data[v.index].color = (c.x, c.y, c.z, 1)
        parts.setdefault(jnt.name, []).append(o)
        print('SCULPT', self.name, len(me.polygons))
        return o


def limb_fibers(a, b, n, twist, amp, sharp=3):
    """deslocamento das estrias de um membro: n fibras em volta do eixo a→b, torcendo `twist` rad"""
    a, b = Vector(a), Vector(b)
    ax = (b - a)
    L = ax.length
    ax = ax / L

    def f(p):
        t = max(0.0, min(1.0, (p - a).dot(ax) / L))
        q = p - (a + ax * t * L)
        th = math.atan2(q.x, q.z)
        w = n3(p, 9) * 0.8
        return amp * (ridge(n * th + twist * t + w, sharp) - 0.35)
    return f


def white_vcols():
    """as peças sem cor por vértice (tendões, garras, dentes) ganham branco: ao juntar com as esculturas o atributo
    viria zerado (preto) e escureceria a cor do material"""
    for objs in parts.values():
        for o in objs:
            if 'Col' not in o.data.color_attributes:
                ca = o.data.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
                for d in ca.data:
                    d.color = (1, 1, 1, 1)
