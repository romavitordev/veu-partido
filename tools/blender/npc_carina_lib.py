"""
Peças em comum das armas da CARINA (npc_carina_*.py; o build.mjs pula os *_lib.py): a CABEÇA DE LEÃO dos Leone — a
bola do mangual de Marco Leone ("Mangual de Marco Leone em Calamidade", wiki "Carina Leone": a bola de espinhos é uma
cabeça de leão com a JUBA em pontas) e o brasão nas pontas do nunchaku dourado — e a CORRENTE em juntas encadeadas
(cada elo é uma junta J_<prefixo><i> filha da anterior, para o jogo dobrar a corrente em código: models/weapons.js).
Coordenadas no espaço do jogo (x = esquerda, y = cima, z = frente), como o npc_lib.
"""
import math

import bpy
from mathutils import Vector, Matrix

from lib import make_obj
from npc_lib import T, rod, blob, spike, ring, joint, add, parts


def lion_head(jnt, c, s, mats, tag='lion', mane_rings=3, per_ring=14):
    """cabeça de leão com a juba em pontas, o rosto virado para +Z. c: centro; s: escala (1 ≈ 9 cm de juba a juba)"""
    cx, cy, cz = c
    add(jnt, f'{tag}Core', blob((cx, cy, cz), (0.046 * s, 0.046 * s, 0.042 * s), 14, 10), mats['metal'])
    # a JUBA: anéis de pontas em volta do rosto, cada anel mais para trás e mais aberto; a última leva fecha a nuca
    for r in range(mane_rings):
        back = -0.15 - r * 0.45
        n = per_ring - r * 2
        for i in range(n):
            a = (i + (0.5 if r % 2 else 0)) / n * math.tau
            d = Vector((math.cos(a), math.sin(a), back)).normalized()
            base = Vector(c) + d * 0.036 * s
            ln = (0.055 + 0.02 * ((i * 7 + r * 3) % 3) / 2) * s
            tip = Vector(c) + d * (0.036 * s + ln)
            add(jnt, f'{tag}Mane{r}_{i}', spike(tuple(base), tuple(tip), 0.016 * s, 5), mats['metal'])
    for i in range(6):  # a nuca
        a = i / 6 * math.tau
        d = Vector((math.cos(a) * 0.5, math.sin(a) * 0.5, -1)).normalized()
        add(jnt, f'{tag}Nape{i}', spike(tuple(Vector(c) + d * 0.03 * s), tuple(Vector(c) + d * 0.075 * s), 0.016 * s, 5), mats['metal'])
    # o ROSTO: a testa, o focinho largo, o nariz, os olhos fundos e a BOCA ABERTA com as presas
    add(jnt, f'{tag}Brow', blob((cx, cy + 0.016 * s, cz + 0.03 * s), (0.032 * s, 0.012 * s, 0.016 * s), 10, 6), mats['metal'])
    add(jnt, f'{tag}Muzzle', blob((cx, cy - 0.008 * s, cz + 0.04 * s), (0.024 * s, 0.017 * s, 0.018 * s), 10, 6), mats['metal'])
    add(jnt, f'{tag}Nose', blob((cx, cy + 0.0 * s, cz + 0.056 * s), (0.01 * s, 0.006 * s, 0.006 * s), 8, 5), mats['dark'])
    for sx in (-1, 1):
        add(jnt, f'{tag}Eye{sx}', blob((cx + sx * 0.016 * s, cy + 0.01 * s, cz + 0.04 * s), (0.006 * s, 0.004 * s, 0.004 * s), 8, 5), mats['dark'])
    add(jnt, f'{tag}Mouth', blob((cx, cy - 0.026 * s, cz + 0.036 * s), (0.018 * s, 0.011 * s, 0.012 * s), 10, 6), mats['dark'])
    for sx in (-1, 1):
        for up in (1, -1):
            b = (cx + sx * 0.011 * s, cy - 0.026 * s + up * 0.01 * s, cz + 0.044 * s)
            add(jnt, f'{tag}Fang{sx}{up}', spike(b, (b[0], b[1] - up * 0.012 * s, b[2] + 0.002 * s), 0.0035 * s, 5), mats['bone'])


def chain(parent, start, prefix, n, step, link_r, wire, mat, rest_dir=(0, -1, 0)):
    """a corrente: n elos, um por junta, cada junta filha da anterior. start: posição da 1ª junta (local ao pai).
    Devolve a última junta (o que pende na ponta vai nela)"""
    j = parent
    d = Vector(rest_dir).normalized()
    for i in range(n):
        pos = start if i == 0 else tuple(d * step)
        j = joint(f'J_{prefix}{i}', pos, j)
        # o elo alongado ao longo da corrente, alternando 90° em volta do eixo (como corrente de verdade)
        k = Vector((1, 0, 0)) if i % 2 == 0 else Vector((0, 0, 1))
        pts = []
        for t in range(17):
            a = t / 16 * math.tau
            p = d * (step * 0.5 + math.cos(a) * step * 0.55) + k * math.sin(a) * link_r
            pts.append(tuple(p))
        add(j, f'{prefix}Link{i}', rod(pts, wire, seg=5, caps=False), mat)
    return j


def text_on_rod(jnt, body, y_mid, radius, size, mat, name, faces=(1, -1)):
    """letras em relevo ao longo de um bastão vertical (o "LEONE" do nunchaku), na frente (+Z) e atrás (-Z)"""
    for f in faces:
        cu = bpy.data.curves.new(f'{name}{f}', 'FONT')
        cu.body = body
        cu.size = size
        cu.extrude = 0.0012
        cu.align_x = 'CENTER'
        cu.align_y = 'CENTER'
        ob = bpy.data.objects.new(f'{name}{f}', cu)
        bpy.context.scene.collection.objects.link(ob)
        bpy.context.view_layer.update()
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
        bpy.data.objects.remove(ob)
        bpy.data.curves.remove(cu)
        # o texto nasce no plano XY do Blender lendo em +X, virado para +Z; na frente lê de cima para baixo (como na arte)
        # (o eixo do bastão é o y do jogo = z do Blender) e encosta na face f do bastão (z do jogo = -y do Blender)
        m = (Matrix.Translation(T(0, y_mid, f * (radius + 0.0006)))
             @ Matrix.Rotation(math.radians(90 * f), 4, 'X')
             @ Matrix.Rotation(math.radians(-90), 4, 'Z'))
        me.transform(m)
        o = bpy.data.objects.new(f'{name}{f}', me)
        bpy.context.scene.collection.objects.link(o)
        o.data.materials.append(mat)
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
        o.parent = jnt
        parts.setdefault(jnt.name, []).append(o)
