"""
CONSERTO DA ESCADA DO ORFANATO (dono, 2026-11-13: "a escada dele está bugada na porta", nas duas versões — dia e
noite usam o mesmo public/arenas/orfanato.glb). A peça 'stairs-wide-stone' do kit do Kenney entrou girada: subia de
lado, encostada na fachada, até a parede do 1º andar, e tampava metade da porta. Os kits não estão na máquina
(assets_src/kenney), então o arena_orfanato.py não roda: este script abre o .glb pronto, apaga só os degraus (que
foram fundidos no objeto 'static_colormap_town'), põe uma escadinha de entrada de pedra DE FRENTE para o pátio e
ajusta o obstáculo da entrada. Quando os kits voltarem, o arena_orfanato.py já tem a mesma escadinha.
  blender -b -P tools/blender/fix_orfanato_escada.py -- public/arenas/orfanato.glb
"""
import sys, bpy, bmesh
from mathutils import Vector

path = sys.argv[sys.argv.index('--') + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)

# Blender (z para cima) ← jogo: x = x, y = -z, z = y. Os degraus: x 19–22, z do jogo ±2,3, altura até 6,6 m
town = bpy.data.objects['static_colormap_town']
mw = town.matrix_world
bm = bmesh.new()
bm.from_mesh(town.data)
gone = [v for v in bm.verts if (lambda p: 18.9 < p.x < 21.85 and -2.4 < p.y < 2.4 and 0.02 < p.z < 6.8)(mw @ v.co)]
bmesh.ops.delete(bm, geom=gone, context='VERTS')
bm.to_mesh(town.data)
bm.free()
print('vértices dos degraus apagados:', len(gone))

# a escadinha: patamar junto da porta (x 21–22) e dois degraus descendo para o pátio, 3,4 m de largura
stone = bpy.data.materials.new('entry_stone')  # pedra clara, como a escadaria do kit
stone.use_nodes = True
next(n for n in stone.node_tree.nodes if n.type == 'BSDF_PRINCIPLED').inputs['Base Color'].default_value = (0.62, 0.6, 0.56, 1)
next(n for n in stone.node_tree.nodes if n.type == 'BSDF_PRINCIPLED').inputs['Roughness'].default_value = 0.95

def slab(name, x0, x1, h, w=3.4):
    me = bpy.data.meshes.new(name)
    hw = w / 2
    vs = [(x0, -hw, 0), (x1, -hw, 0), (x1, hw, 0), (x0, hw, 0), (x0, -hw, h), (x1, -hw, h), (x1, hw, h), (x0, hw, h)]
    fs = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    me.from_pydata(vs, [], fs)
    me.materials.append(stone)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob

slab('entry_step_landing', 20.95, 22.0, 0.36)
slab('entry_step_2', 20.55, 20.95, 0.24, 3.0)
slab('entry_step_1', 20.15, 20.55, 0.12, 2.6)

# o PAINEL DA PORTA: a porta do kit tem dois triângulos faltando embaixo (a escada antiga escondia o buraco)
wood = bpy.data.materials.new('entry_door_wood')
wood.use_nodes = True
next(n for n in wood.node_tree.nodes if n.type == 'BSDF_PRINCIPLED').inputs['Base Color'].default_value = (0.16, 0.08, 0.05, 1)
door = slab('entry_door_panel', 21.99, 22.03, 2.15, 1.05)
door.data.materials[0] = wood

# o obstáculo da entrada acompanha a escadinha (antes 2,4 × 3,4 m em x 19,4–21,8)
col = bpy.data.objects.get('COL_box_entry')
if col:
    cm = col.data.materials[0] if col.data.materials else None
    bpy.data.objects.remove(col)
    me = bpy.data.meshes.new('COL_box_entry')
    x0, x1, hw, h = 20.15, 22.0, 1.7, 2.0
    vs = [(x0, -hw, 0), (x1, -hw, 0), (x1, hw, 0), (x0, hw, 0), (x0, -hw, h), (x1, -hw, h), (x1, hw, h), (x0, hw, h)]
    me.from_pydata(vs, [], [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
    if cm: me.materials.append(cm)
    ob = bpy.data.objects.new('COL_box_entry', me)
    bpy.context.scene.collection.objects.link(ob)

bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True, export_yup=True,
                          export_materials='EXPORT', export_lights=False, export_cameras=False, export_animations=False)
print('EXPORTADO', path)
