"""
Peças para montar cenários no Blender usando as MESMAS coordenadas do jogo (three.js):
  x = direita, y = cima, z = em direção à câmera inicial.  (Blender: x, -z, y)
Convenções de nome lidas pelo jogo (src/arena/glbArena.js):
  COL_cyl_* / COL_box_*  obstáculos (removidos na hora de desenhar)
  OCC_*                  ficam transparentes quando tampam a luta
  FLICKER_*              lâmpadas que piscam
  SWAY_*                 balançam (balanços, estandartes)
  DECAL_*                mantêm o UV 0..1 (placas, pôsteres, quadro-negro)
  GROUND* / FLOOR*       chão (não projeta sombra)
"""
import bpy
import bmesh
import math
from mathutils import Vector, Matrix
from lib import reset, material, hex_rgb, TAU

COLL = None


def B(x, y, z):
    """coordenada do jogo → Blender"""
    return (x, -z, y)


def start():
    reset()


def _obj_from_bmesh(name, bm, mat):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if mat is not None:
        obj.data.materials.append(mat)
    return obj


def place(obj, pos, rot_y=0.0, rot_x=0.0, rot_z=0.0):
    obj.location = B(*pos)
    # rot_y do jogo = giro em torno do eixo vertical (Z do Blender)
    obj.rotation_euler = (rot_x, -rot_z, rot_y)
    return obj


def box(name, pos, size, mat, rot_y=0.0, bevel=0.0, rot_x=0.0, rot_z=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    w, h, d = size
    for v in bm.verts:
        v.co = Vector((v.co.x * w, v.co.y * d, v.co.z * h))
    if bevel:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=1, affect='EDGES')
    o = _obj_from_bmesh(name, bm, mat)
    return place(o, pos, rot_y, rot_x, rot_z)


def cyl(name, pos, r, h, mat, seg=12, r_top=None, rot_y=0.0, rot_x=0.0, rot_z=0.0, cap=True):
    """cilindro com a BASE em pos"""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, cap_tris=False, segments=seg, radius1=r, radius2=r if r_top is None else r_top, depth=h)
    for v in bm.verts:
        v.co.z += h / 2
    o = _obj_from_bmesh(name, bm, mat)
    for p in o.data.polygons:
        p.use_smooth = seg >= 10
    return place(o, pos, rot_y, rot_x, rot_z)


def sphere(name, pos, radii, mat, seg=12, rings=8):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    rx, ry, rz = radii
    for v in bm.verts:
        v.co = Vector((v.co.x * rx, v.co.y * rz, v.co.z * ry))
    o = _obj_from_bmesh(name, bm, mat)
    for p in o.data.polygons:
        p.use_smooth = True
    return place(o, pos)


def plane(name, pos, size, mat, rot_y=0.0, facing='front'):
    """Plano com UV 0..1 (DECAL). facing: 'front' (vertical olhando +z) ou 'up'."""
    w, h = size
    bm = bmesh.new()
    if facing == 'up':
        vs = [bm.verts.new((x * w / 2, y * h / 2, 0)) for x, y in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    else:
        # vertical, normal para -Y do Blender (= +z do jogo)
        vs = [bm.verts.new((x * w / 2, 0, y * h / 2)) for x, y in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new('UVMap')
    for loop, (u, v) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        loop[uv].uv = (u, v)
    if facing != 'up':
        f.normal_flip() if f.normal.y > 0 else None
    o = _obj_from_bmesh(name, bm, mat)
    return place(o, pos, rot_y)


def arch_ring(name, pos, width, height, depth, thickness, mat, rot_y=0.0, seg=10):
    """Arco (meia-volta) apoiado em dois pilares: pórtico vazado."""
    bm = bmesh.new()
    r_out = width / 2 + thickness
    r_in = width / 2
    spring = height - width / 2  # altura onde começa a curva
    half = depth / 2
    rings_out, rings_in = [], []
    for i in range(seg + 1):
        a = math.pi * i / seg
        rings_out.append((math.cos(a) * r_out, spring + math.sin(a) * r_out))
        rings_in.append((math.cos(a) * r_in, spring + math.sin(a) * r_in))
    def quad(p):
        return bm.faces.new([bm.verts.new(v) for v in p])
    for i in range(seg):
        (ox0, oy0), (ox1, oy1) = rings_out[i], rings_out[i + 1]
        (ix0, iy0), (ix1, iy1) = rings_in[i], rings_in[i + 1]
        for y in (-half, half):
            quad([(ox0, y, oy0), (ox1, y, oy1), (ix1, y, iy1), (ix0, y, iy0)])
        quad([(ox0, -half, oy0), (ox0, half, oy0), (ox1, half, oy1), (ox1, -half, oy1)])
        quad([(ix0, -half, iy0), (ix1, -half, iy1), (ix1, half, iy1), (ix0, half, iy0)])
    o = _obj_from_bmesh(name, bm, mat)
    # pilares
    parts = [o]
    for s in (-1, 1):
        x = s * (r_in + thickness / 2)
        p = box(name + f'_pier{s}', (x, spring / 2, 0), (thickness, spring, depth), mat)
        parts.append(p)
    res = rebase(join_objs(parts, name))
    bmesh_recalc(res)
    return place(res, pos, rot_y)


def bmesh_recalc(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(obj.data)
    bm.free()


def join_objs(objs, name):
    for o in bpy.context.selected_objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    objs[0].name = name
    return objs[0]


def text(name, string, pos, size, mat, rot_y=0.0, depth=0.02):
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body = string
    cu.size = size
    cu.extrude = depth
    cu.align_x = 'CENTER'
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat)
    o.rotation_euler = (math.pi / 2, 0, rot_y)
    o.location = B(*pos)
    bpy.context.view_layer.objects.active = o
    for s in bpy.context.selected_objects:
        s.select_set(False)
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    return o


# ---------------------------------------------------------------- peças compostas
def swing(name, pos, height, mats, rot_y=0.0, width=0.7):
    """Balanço de corda e tábua (gira em torno do galho, objeto SWAY_)."""
    x, y, z = pos
    parts = []
    for s in (-1, 1):
        parts.append(cyl(f'{name}_rope{s}', (s * width / 2, -height, 0), 0.015, height, mats['rope'], seg=5))
    parts.append(box(f'{name}_seat', (0, -height, 0), (width + 0.1, 0.05, 0.25), mats['wood']))
    o = rebase(join_objs(parts, f'SWAY_{name}'))
    # origem no galho (topo), para balançar a partir dali
    o.location = B(x, y + height, z)
    o.rotation_euler = (0, 0, rot_y)
    return o


def plastic_chair(name, pos, mat, rot_y=0.0):
    x, y, z = pos
    parts = [box(f'{name}_s', (0, 0.45, 0), (0.46, 0.05, 0.44), mat)]
    parts.append(box(f'{name}_b', (0, 0.75, 0.2), (0.46, 0.55, 0.05), mat, rot_x=math.radians(-8)))
    for sx in (-1, 1):
        for sz in (-1, 1):
            parts.append(box(f'{name}_l{sx}{sz}', (sx * 0.2, 0.22, sz * 0.19), (0.05, 0.45, 0.05), mat))
    o = join_objs(parts, name)
    return _move(o, pos, rot_y)


def _seg(name, p, q, w, d, mat):
    """barra reta de p a q no plano vertical x-y do jogo (z = p[2]): w = largura, d = espessura em z"""
    dx, dy = q[0] - p[0], q[1] - p[1]
    L = math.hypot(dx, dy)
    return box(name, ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, p[2]), (L + w * 0.6, w, d), mat, rot_z=math.atan2(dy, dx))


def _shear_back(o, y0=0.45, k=0.2):
    """inclina o encosto para trás: z do jogo += (y - y0)·k (o Blender guarda o z do jogo como -y)"""
    rebase(o)
    for v in o.data.vertices:
        if v.co.z > y0:
            v.co.y -= (v.co.z - y0) * k
    return o


def bar_chair(name, pos, mat, rot_y=0.0, solid=False):
    """CADEIRA DE BAR brasileira (a de plástico inteiriça, referência do dono): encosto em arco com ripas em leque (ou
    inteiriço na de cervejaria, `solid`), braços em alça descendo até a frente do assento, pernas grossas abertas e a
    saia por baixo do assento. Encosto em +z local: rot_y = ângulo da direção mesa → cadeira (assento para a mesa)."""
    parts = [box(f'{name}_s', (0, 0.43, -0.01), (0.46, 0.035, 0.44), mat, bevel=0.015)]
    parts.append(box(f'{name}_kf', (0, 0.39, -0.22), (0.46, 0.07, 0.025), mat))
    for sx in (-1, 1):
        parts.append(box(f'{name}_ks{sx}', (sx * 0.225, 0.39, -0.01), (0.025, 0.07, 0.44), mat))
        # pernas: largas em cima, finas no pé, abertas
        for sz, tilt in ((-1, 6), (1, -8)):
            parts.append(cyl(f'{name}_l{sx}{sz}', (sx * 0.245, 0, sz * 0.235), 0.03, 0.42, mat, seg=4, r_top=0.055,
                             rot_y=math.radians(45), rot_x=math.radians(tilt), rot_z=sx * math.radians(-6)))
    # encosto (montado reto e inclinado depois): a moldura em arco e as ripas
    back = []
    arc = []
    for i in range(9):
        t = i / 8
        arc.append((-0.235 + 0.47 * t, 0.62 + 0.24 * math.sqrt(max(0.0, 1 - ((t - 0.5) / 0.5) ** 2)), 0.215))
    for i in range(8):
        back.append(_seg(f'{name}_arc{i}', arc[i], arc[i + 1], 0.045, 0.035, mat))
    for sx in (-1, 1):
        back.append(box(f'{name}_post{sx}', (sx * 0.228, 0.53, 0.215), (0.045, 0.2, 0.035), mat))
    if solid:
        # inteiriço (o da cervejaria): o painel enche o arco
        for i in range(8):
            x0, y0, _ = arc[i]
            x1, y1, _ = arc[i + 1]
            hgt = (y0 + y1) / 2 - 0.45
            back.append(box(f'{name}_pan{i}', ((x0 + x1) / 2, 0.45 + hgt / 2, 0.218), (abs(x1 - x0) + 0.004, hgt, 0.022), mat))
    else:
        # ripas em leque: juntas embaixo, abrindo até o arco
        n = 9
        for i in range(n):
            u = (i / (n - 1)) * 2 - 1
            top = arc[min(8, max(0, round((u * 0.85 * 0.5 + 0.5) * 8)))]
            back.append(_seg(f'{name}_rip{i}', (u * 0.11, 0.46, 0.215), (u * 0.19, top[1] - 0.02, 0.215), 0.026, 0.02, mat))
        back.append(box(f'{name}_base', (0, 0.465, 0.215), (0.44, 0.04, 0.03), mat))
    bk = join_objs(back, f'{name}_back')
    _shear_back(bk)
    parts.append(bk)
    # braços em alça: saem do encosto, vão para a frente e descem até o assento
    for sx in (-1, 1):
        parts.append(box(f'{name}_arm{sx}', (sx * 0.265, 0.64, 0.02), (0.04, 0.03, 0.42), mat, bevel=0.01))
        parts.append(box(f'{name}_armd{sx}', (sx * 0.262, 0.54, -0.19), (0.04, 0.22, 0.035), mat, rot_x=math.radians(-12)))
        parts.append(box(f'{name}_armb{sx}', (sx * 0.25, 0.66, 0.255), (0.04, 0.06, 0.06), mat))
    o = join_objs(parts, name)
    return _move(o, pos, rot_y)


def bar_table(name, pos, top_mat, art_mats=None, size=0.70):
    """MESA DE BAR de plástico (referência do dono): tampo quadrado com os cantos recortados, aba por baixo e as pernas
    em L afinando até o pé. `art_mats` (vermelho, laranja): a de cervejaria, com as faixas em redemoinho no tampo."""
    h = size / 2
    n = 0.045  # recorte dos cantos
    parts = [box(f'{name}_top', (0, 0.715, 0), (size, 0.03, size - 2 * n), top_mat, bevel=0.008),
             box(f'{name}_top2', (0, 0.715, 0), (size - 2 * n, 0.03, size), top_mat, bevel=0.008)]
    for k, (x, z, w, d) in enumerate(((0, h - 0.015, size - 2 * n, 0.03), (0, -h + 0.015, size - 2 * n, 0.03),
                                      (h - 0.015, 0, 0.03, size - 2 * n), (-h + 0.015, 0, 0.03, size - 2 * n))):
        parts.append(box(f'{name}_skirt{k}', (x, 0.665, z), (w, 0.07, d), top_mat))
    c = h - n - 0.005
    for sx in (-1, 1):
        for sz in (-1, 1):
            # perna em L (duas chapas) afinando: larga em cima, estreita no pé
            for j in range(4):
                y0 = 0.7 - j * 0.175
                wdt = 0.13 - j * 0.017
                parts.append(box(f'{name}_lx{sx}{sz}{j}', (sx * (c - wdt / 2 + 0.03), y0 - 0.0875, sz * c), (wdt, 0.176, 0.026), top_mat))
                parts.append(box(f'{name}_lz{sx}{sz}{j}', (sx * c, y0 - 0.0875, sz * (c - wdt / 2 + 0.03)), (0.026, 0.176, wdt), top_mat))
    if art_mats:
        # o redemoinho da cervejaria: faixas curvas (vermelha e laranja) no tampo, sem marca escrita
        for m, (r0, ph, mt) in enumerate(((0.22, 0.0, art_mats[0]), (0.15, 2.4, art_mats[1]), (0.29, 3.6, art_mats[0]))):
            for i in range(7):
                a0 = ph + i * 0.32
                a1 = a0 + 0.32
                p0 = (math.cos(a0) * r0, math.sin(a0) * r0)
                p1 = (math.cos(a1) * r0, math.sin(a1) * r0)
                if max(abs(p0[0]), abs(p0[1]), abs(p1[0]), abs(p1[1])) > h - 0.03:
                    continue
                L = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
                parts.append(box(f'{name}_art{m}{i}', ((p0[0] + p1[0]) / 2, 0.7315, (p0[1] + p1[1]) / 2), (L + 0.03, 0.003, 0.07 if m == 0 else 0.05), mt,
                                 rot_y=-math.atan2(p1[1] - p0[1], p1[0] - p0[0])))
    o = join_objs(parts, name)
    return _move(o, pos, 0)


def rebase(o):
    """Aplica a posição: a origem do objeto vira a origem do mundo (peças montadas em volta de 0,0,0)."""
    for s in bpy.context.selected_objects:
        s.select_set(False)
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return o


def _move(o, pos, rot_y):
    rebase(o)
    o.location = B(*pos)
    o.rotation_euler = (0, 0, rot_y)
    return o


def table_square(name, pos, top_mat, leg_mat, size=0.8):
    parts = [box(f'{name}_top', (0, 0.74, 0), (size, 0.05, size), top_mat)]
    for sx in (-1, 1):
        for sz in (-1, 1):
            parts.append(box(f'{name}_l{sx}{sz}', (sx * (size / 2 - 0.06), 0.36, sz * (size / 2 - 0.06)), (0.05, 0.72, 0.05), leg_mat))
    o = join_objs(parts, name)
    return _move(o, pos, 0)


# ---------------------------------------------------------------- colisão
_col_mat = None


def _cm():
    global _col_mat
    if _col_mat is None:
        _col_mat = material('collider', '#ff00ff')
    return _col_mat


def col_box(name, pos, size, rot_y=0.0):
    """Obstáculo retangular (alinhado aos eixos; use rot_y só múltiplo de 90°)."""
    return box(f'COL_box_{name}', pos, size, _cm(), rot_y)


def col_cyl(name, pos, r, h):
    return cyl(f'COL_cyl_{name}', pos, r, h, _cm(), seg=8)


# ---------------------------------------------------------------- finalização
def finalize(path, merge=True):
    """UV em cubo (1 unidade = 1 metro), junta por material e exporta."""
    # remove os modelos-base das peças prontas (kenney.py), se houver
    for o in [o for o in bpy.context.scene.objects if o.name.startswith('LIB_')]:
        bpy.data.objects.remove(o, do_unlink=True)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for o in meshes:
        if 'KEN_' in o.name:
            # peças prontas do Kenney: já têm UV (atlas colormap); só aplica giro/escala
            for sel in bpy.context.selected_objects:
                sel.select_set(False)
            o.select_set(True)
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
            continue
        if o.name.startswith('DECAL_') or o.name.startswith('COL_') or o.name.startswith('LIB_'):
            continue
        # aplica escala/rotação para o UV em metros ficar correto
        for s in bpy.context.selected_objects:
            s.select_set(False)
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.cube_project(cube_size=1.0, correct_aspect=False, scale_to_bounds=False)
        bpy.ops.object.mode_set(mode='OBJECT')
    if merge:
        # junta objetos estáticos com o mesmo material (menos chamadas de desenho)
        groups = {}
        for o in bpy.context.scene.objects:
            if o.type != 'MESH':
                continue
            n = o.name
            if n.startswith(('COL_', 'OCC_', 'FLICKER_', 'SWAY_', 'DECAL_', 'GROUND', 'FLOOR', 'CROWD_')):
                continue
            if len(o.data.materials) != 1:
                continue
            groups.setdefault(o.data.materials[0].name, []).append(o)
        for mname, objs in groups.items():
            if len(objs) > 1:
                for s in bpy.context.selected_objects:
                    s.select_set(False)
                for o in objs:
                    o.select_set(True)
                bpy.context.view_layer.objects.active = objs[0]
                bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
                bpy.ops.object.join()
                objs[0].name = f'static_{mname}'
    for s in bpy.context.selected_objects:
        s.select_set(False)
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True, export_yup=True,
                              export_materials='EXPORT', export_lights=False, export_cameras=False, export_animations=False)
    print('EXPORTADO', path)
