"""
O CARNIÇAL (lutador jogável) — public/models/carnical.glb. Irmão do NPC de tools/blender/npc_carnical.py (que fica para a
invocação), agora no ESQUELETO DE LUTADOR para usar os clipes de garra do Raziel.
Referências: wiki "Carniçal Preto da Morte" (arte do Livro de Regras e miniatura de O Segredo na Floresta).
Humanoide de ~2,1 m, MAGRO e MUSCULOSO, de LODO PRETO-ACINZENTADO todo ESTRIADO; ombros largos com BRILHO VERMELHO por
baixo (e nos flancos), cintura fina, pescoço longo de tendões, TENDÕES PÁLIDOS soltos pelos braços. A cabeça é uma
CAVEIRA bege rachada TOMADA PELO LODO (o Lodo sai de trás e escorre pelas costas), o topo rompido mostra o CÉREBRO
VERMELHO e o SÍMBOLO ESPIRAL brilha na testa (textura face_skull_carnical). Mãos grandes com GARRAS curvas.

TÉCNICA: a mesma do Deus da Morte — cada parte é UMA forma de metaballs fundidos (sculpt_lib) com as estrias por
deslocamento e a cor por vértice; o crânio usa a cabeça do Builder com a textura.
  node tools/blender/build.mjs carnical   → public/models/carnical.glb (+ fonte/carnical_lutador.blend; o build também refaz o NPC de mesmo id)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, vcol_material, paint
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'carnical.glb'
random.seed(13)

b = Builder(width=1.05, bulk=1.1, height=1.17)  # ~2,1 m; ombros largos mas na proporção da arte do Livro de Regras (polido no Blender MCP)
sk = b.sk
H = sk.h
hz = sk['hips'].z

lodo = vcol_material('lodo_carnical')
bone = material('face_skull_carnical', '#ffffff', 0.6)  # a caveira rachada com o Símbolo Espiral (textura)
tendon = material('tendon_carnical', '#b8ab94', 0.7)  # os tendões pálidos soltos
claw = material('claw_carnical', '#0c0a0e', 0.35)
brain = material('glow_brain_carnical', '#c27472', 0.55, emission='#3a0a0a', strength=0.5)  # rosado como na arte
ember = material('glow_ombro_carnical', '#7a1410', 0.5, emission='#9a1a12', strength=1.6)
bone['preview'] = '#cbb68f'

C = {k: Vector(hex_rgb(v)) for k, v in {'lodo': '#17161a', 'crest': '#5e5a64', 'ember': '#8a1a16'}.items()}  # cristas pálidas e o vermelho da referência
AMP = 0.007 * H


def V(x, y, z):
    return Vector((x * H, y * H, z * H))


def lim(t):
    return max(0.0, min(1.0, t))


def fibers(a, b_, n, twist, amp=AMP):
    a, b_ = Vector(a), Vector(b_)
    ax = b_ - a
    L = ax.length
    ax = ax / L

    def f(p):
        t = lim((p - a).dot(ax) / L)
        q = p - (a + ax * t * L)
        th = math.atan2(q.x, q.y)
        k = 0.55 + 0.45 * (n3(p, 1.1) * 0.5 + 0.5)
        return amp * k * (ridge(n * th + twist * t + n3(p, 1.8) * 1.6, 2) - 0.35)
    return f


def glow_zone(p):
    """o brilho vermelho por baixo dos ombros e nos flancos (miniatura)"""
    ax = abs(p.x)
    sh = max(0.0, 1 - math.hypot(ax - 0.27 * H, p.z - 1.45 * H) / (0.07 * H))
    fl = max(0.0, 1 - abs(ax - 0.17 * H) / (0.03 * H)) * max(0.0, 1 - abs(p.z - 1.25 * H) / (0.1 * H)) if abs(p.y) < 0.07 * H else 0.0
    return max(sh, fl)


def shade_by(fn, amp=AMP):
    def f(p):
        k = lim(fn(p) / amp + 0.35) ** 1.5
        c = C['lodo'].lerp(C['crest'], k * 0.75)
        e = glow_zone(p) * (1 - k * 0.6)
        return c.lerp(C['ember'], min(1.0, e)) if e > 0 else c
    return f


def weights(region):
    return lambda p: auto_weights(sk, p, region)


def add_sculpt(name, S, fn, target, region, res=0.016, smooth=3):
    o = b.add(name, S.mesh(res=res, smooth=smooth, disp=fn, target=target), lodo, region='body', weight_fn=weights(region), subdiv=0)
    paint(o, shade_by(fn))
    return o


# ================================================================ O CORPO: a base realista CC0 da Blender Studio ("Human Base
# Meshes", tools/blender/base_body.py) encaixada no esqueleto de lutador — anatomia de verdade por baixo do lodo. Por
# cima: as fibras por deslocamento seguindo cada músculo e a cor por vértice (cristas pálidas, vermelho no trapézio,
# nas costas e nas dorsais), como na arte do Livro de Regras e na referência do dono (2026-11-01).
import numpy as np
import bmesh
from base_body import load_fitted, store_weights, read_weights

body, heat = load_fitted(sk, thick={'hips': 1.2, 'chest': 1.28, 'neck': 1.05, 'cla': 1.2, 's': 1.1, 'e': 1.05, 'hand': 1.25, 'l': 1.08, 'k': 1.1, 'foot': 1.25})
store_weights(body, heat)
me = body.data
co = np.array([v.co[:] for v in me.vertices])
# a cintura FINA (o V do tronco)
w = np.exp(-((co[:, 2] - 1.11 * H) / (0.094 * H)) ** 2) * (np.abs(co[:, 0]) < 0.205 * H)
co[:, 0] *= 1 - 0.18 * w
co[:, 1] *= 1 - 0.10 * w
# os dedos LONGOS de criatura (até o meio da coxa)
WR = sk['handL'].z
D = WR - 0.9
m = (np.abs(co[:, 0]) > 0.222 * H) & (co[:, 2] < WR)
d = WR - co[m, 2]
co[m, 2] = WR - d * (1 + 0.75 * d / D)
cx = np.sign(co[m, 0]) * sk['sL'].x
co[m, 0] = cx + (co[m, 0] - cx) * (1 - 0.15 * np.clip(d / D, 0, 1))
me.vertices.foreach_set('co', co.ravel())
me.update()
# fora a cabeça humana: a caveira entra no lugar
bm = bmesh.new()
bm.from_mesh(me)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > sk['neck'].z + 0.05], context='VERTS')  # do pescoço para cima: o pescoço de tendões e a caveira
bm.to_mesh(me)
bm.free()

ARM = {'sL', 'eL', 'handL', 'sR', 'eR', 'handR'}
LEG = {'lL', 'kL', 'footL', 'lR', 'kR', 'footR'}


def red_zone(p):
    """o vermelho por baixo do lodo: trapézio e costas altas, a parte de trás dos ombros e as dorsais (referência)"""
    ax, z = abs(p.x), p.z / H
    back = lim((p.y + 0.01 * H) / (0.05 * H))
    trap = lim(1 - abs(z - 1.53) / 0.09) * lim(1 - ax / (0.25 * H)) * (0.15 + 0.85 * back)
    delt = lim(1 - math.hypot(ax - 0.27 * H, p.z - 1.5 * H) / (0.08 * H)) * (0.25 + 0.75 * back)
    lat = lim(1 - abs(ax - 0.165 * H) / (0.05 * H)) * lim(1 - abs(z - 1.3) / 0.13) * (0.3 + 0.7 * back)
    return min(1.0, max(trap, delt, lat))


def torso_fn(p):
    ax = abs(p.x)
    z = p.z / H
    w = n3(p, 2.4) * 0.8
    if z > 1.52 and ax < 0.08 * H:  # pescoço: tendões verticais
        v = ridge(math.atan2(p.x, p.y) * 9 + w)
    elif p.y < -0.05 * H and z > 1.36 and ax < 0.24 * H:  # peitorais em leque
        # PROPOSTA visual: estrias mais discretas sob a luz roxa das arenas
        v = ridge(math.atan2(p.z - 1.54 * H, ax + 0.02 * H) * 40 + w) * 0.55
    elif p.y < -0.05 * H and z <= 1.36 and ax < 0.09 * H:  # o abdômen (a forma vem da base): fibras verticais finas
        v = ridge(p.x / H * 120 + w) * 0.7
    elif p.y > 0.0 and ax < 0.03 * H:  # o sulco da coluna
        return -AMP * 0.8
    else:  # flancos e costas: diagonais subindo aos ombros (as costelas aparecem)
        v = ridge((p.z + ax * (0.8 if p.y < 0 else -0.6)) / H * 90 + w)
    return AMP * (v - 0.35)


FIB = {}
for s_, sg in (('L', 1), ('R', -1)):
    sh_, e_, h_ = sk['s' + s_], sk['e' + s_], sk['hand' + s_]
    l_, k_, f_ = sk['l' + s_], sk['k' + s_], sk['foot' + s_]
    FIB['up' + s_] = fibers(sh_ + V(0, 0, 0.06), e_, 9, 1.6 * sg)
    FIB['lo' + s_] = fibers(e_, h_, 8, -1.4 * sg)
    FIB['th' + s_] = fibers(l_ + V(0, 0, 0.06), k_, 10, 1.8 * sg)
    FIB['sh' + s_] = fibers(k_, f_ + V(0, 0, 0.07), 8, -1.4 * sg)


def body_fn(p, bone):
    """as fibras de cada região, pelo osso que manda no vértice"""
    if bone in ARM:
        s = bone[-1]
        if p.z > sk['e' + s].z:
            return FIB['up' + s](p)
        if p.z > sk['hand' + s].z + 0.02 * H:
            return FIB['lo' + s](p)
        return AMP * 0.3 * (ridge(p.z / H * 140) - 0.35)
    if bone in LEG:
        s = bone[-1]
        if p.z > sk['k' + s].z:
            return FIB['th' + s](p)
        if p.z > sk['foot' + s].z + 0.08 * H:
            return FIB['sh' + s](p)
        return AMP * 0.3 * (ridge(p.y / H * 120) - 0.35)
    return torso_fn(p)


# deslocamento ao longo da normal, depois a decimação (os pesos vão juntos nos grupos de vértices)
me.update()
wts = read_weights(body)
dom = [max(w_, key=w_.get) for w_ in wts]
disp = [body_fn(v.co, dom[i]) for i, v in enumerate(me.vertices)]
for v, dd in zip(me.vertices, disp):
    v.co = v.co + v.normal * dd
me.update()
dec = body.modifiers.new('dec', 'DECIMATE')
dec.ratio = 0.62
bpy.context.view_layer.objects.active = body
bpy.ops.object.modifier_apply(modifier=dec.name)
wts = read_weights(body)
dom = [max(w_, key=w_.get) for w_ in wts]
verts = [tuple(v.co) for v in me.vertices]
faces = [tuple(pl.vertices) for pl in me.polygons]
bpy.data.objects.remove(body)


def key(p):
    return (round(p[0], 4), round(p[1], 4), round(p[2], 4))


WT = {key(v): w_ for v, w_ in zip(verts, wts)}
DOM = {key(v): d_ for v, d_ in zip(verts, dom)}
bo = b.add('body', (verts, faces, None), lodo, region='body', weight_fn=lambda p: WT.get(key(p), {'hips': 1.0}), subdiv=0)
for pl in bo.data.polygons:
    pl.use_smooth = True


def body_col(p):
    fn = body_fn(p, DOM.get(key(p), 'hips'))
    k = lim(fn / AMP + 0.35) ** 2
    # PROPOSTA visual: reduzir o contraste das cristas no jogo
    c = C['lodo'].lerp(C['crest'], k * 0.4)
    r = red_zone(p)
    return c.lerp(C['ember'].lerp(C['crest'], k * 0.3), r * 0.6) if r > 0 else c


paint(bo, body_col)


# as GARRAS curvas nas pontas dos dedos (achadas na malha: os pontos mais baixos de cada mão) e os TENDÕES PÁLIDOS
def finger_tips(side):
    pts = sorted((Vector(v) for v, d_ in zip(verts, dom) if d_ == 'hand' + side and v[2] < WR - 0.12), key=lambda q: q.z)
    tips = []
    for q in pts:
        if all(math.hypot(q.x - t.x, q.y - t.y) > 0.028 for t in tips):
            tips.append(q)
        if len(tips) == 5:
            break
    return tips


def arm_r(side, z):
    """raio do braço na altura z (para os tendões enrolarem rente)"""
    ax = sk['s' + side]
    rs = sorted(math.hypot(v[0] - ax.x, v[1] - ax.y) for v, d_ in zip(verts, dom) if d_ in ('s' + side, 'e' + side) and abs(v[2] - z) < 0.02 and abs(v[0] - ax.x) < 0.1)
    return rs[int(len(rs) * 0.7)] if rs else 0.05


for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    cl = [rod([t, t + V(0, -0.02, -0.04), t + V(0, 0.0, -0.075)], [0.009 * H, 0.0055 * H, 0.001 * H], 5) for t in finger_tips(side)]
    b.add('claws' + side, merge(*cl), claw, region='hand' + side, subdiv=0)
    td = []
    for (p0, p1, a0, turn, n) in ((sh + V(0, 0, -0.05), e, 0.4, 2.2, 3), (e, h + V(0, 0, 0.04), 1.2, -2.0, 2)):
        for k in range(n):
            pts, rr = [], []
            for i in range(9):
                t = i / 8
                c = p0.lerp(p1, t)
                ang = a0 + k * 2.1 + turn * t
                rad = arm_r(side, c.z) * (0.9 + 0.12 * math.sin(t * math.pi))  # solto no meio
                pts.append(c + Vector((s * math.cos(ang) * rad, math.sin(ang) * rad, 0)))
                rr.append((0.003 + 0.0025 * math.sin(t * math.pi)) * H)
            td.append(rod(pts, rr, 5))
    b.add('tendons' + side, merge(*td), tendon, region='body', weight_fn=weights('arm' + side), subdiv=0)

# ================================================================ a CAVEIRA: o crânio realista do mesmo pacote CC0 ("Skull - Realistic";
# pedido do dono em 2026-11-01: a caveira esculpida estava fraca). Ele NÃO TEM MANDÍBULA de osso: a "mandíbula" é de
# LODO, fios escuros que escorrem dos dentes de cima e das maçãs até o pescoço (referência do dono). O topo rompido
# mostra o CÉREBRO.
from base_body import load_mesh
VS = lambda x, y, z: Vector((x * HS, y * HS, z * HS))
HS = H * 1.06
hc = head_center(sk) + V(0, -0.012, -0.05)
sv, sf = load_mesh('Skull - Realistic')
lo = Vector([min(v[i] for v in sv) for i in range(3)])
hi = Vector([max(v[i] for v in sv) for i in range(3)])
k = (0.136 * HS) / (hi.x - lo.x)  # a largura do crânio
top = hc.z + 0.102 * HS
cy = hc.y + 0.01 * HS
sv = [Vector(((v[0] - (lo.x + hi.x) / 2) * k, (v[1] - (lo.y + hi.y) / 2) * k + cy, (v[2] - hi.z) * k + top)) for v in sv]
SW, SH = (hi.x - lo.x) * k, (hi.z - lo.z) * k
front = min(v.y for v in sv)
bottom = min(v.z for v in sv)
teeth_z = min(v.z for v in sv if v.y < front + 0.25 * SW)  # a ponta dos dentes de cima
CEN = Vector((0, cy, top - SH * 0.5))
# o topo ROMPIDO: a calota rachada aberta na frente do alto (borda irregular), o cérebro aparece
cap = lambda v: v.z > top - 0.032 * HS + 0.012 * HS * n3(v * 9, 1) and v.y < cy + 0.045 * HS
keep = [not cap(v) for v in sv]
idx = {}
for i, v in enumerate(sv):
    if keep[i]:
        idx[i] = len(idx)
sf = [tuple(idx[i] for i in f_) for f_ in sf if all(keep[i] for i in f_)]
sv = [v for i, v in enumerate(sv) if keep[i]]


def skull_paint(o, dark_back=True):
    """osso sujo: cavidades (normal para dentro) escuras, mais sujo atrás e no alto (onde o Lodo agarra)"""
    me = o.data
    ca = me.color_attributes.get('Col') or me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    base, dirt, hole = Vector(hex_rgb('#a2977f')), Vector(hex_rgb('#5e5040')), Vector(hex_rgb('#140d0c'))
    for v in me.vertices:
        out = (v.co - CEN).normalized()
        cav = lim(0.35 - v.normal.dot(out)) ** 1.4  # dentro das órbitas, do nariz e entre os dentes
        back = lim((v.co.y - cy) / (0.06 * HS)) * 0.7 + n3(v.co, 30) * 0.15
        c = base.lerp(dirt, lim(back))
        ca.data[v.index].color = (*c.lerp(hole, cav), 1)


bone_mat = vcol_material('bone_carnical')
sko = b.add('skull', (sv, sf, None), bone_mat, region='head', subdiv=0)
dm = sko.modifiers.new('dec', 'DECIMATE')
dm.ratio = 0.4  # 11,7 mil → ~4,7 mil vértices (o arquivo do jogo)
bpy.context.view_layer.objects.active = sko
bpy.ops.object.modifier_move_to_index(modifier='dec', index=0)
bpy.ops.object.modifier_apply(modifier='dec')
for o in (sko,):
    for pl in o.data.polygons:
        pl.use_smooth = True
    skull_paint(o)
# os OLHOS vermelhos acesos no fundo das órbitas (arte de O Segredo na Floresta) e o SÍMBOLO ESPIRAL na testa
eye_z = top - SH * 0.45
eye_y = front + 0.2 * SW  # no fundo das órbitas
b.add('eyes', merge(*[ellipsoid((s * 0.22 * SW, eye_y, eye_z), (0.05 * SW, 0.035 * SW, 0.042 * SW), 8, 6) for s in (1, -1)]), ember, region='head', subdiv=0)
fz = top - SH * 0.2
fy = min(v.y for v in sv if abs(v.x) < 0.02 and abs(v.z - fz) < 0.01) - 0.002
sp = [Vector((math.cos(t * 4.2 * math.pi) * (0.003 + t * 0.016) * HS, fy, fz + math.sin(t * 4.2 * math.pi) * (0.003 + t * 0.016) * HS)) for t in [i / 30 for i in range(31)]]
sp = [p + Vector((0, (p.x / (0.5 * SW)) ** 2 * 0.5 * SW * 0.35, 0)) for p in sp]  # acompanha a curva da testa
b.add('spiral', rod(sp, [0.0022 * HS] * len(sp), 4), brain, region='head', subdiv=0)
hc = Vector((0, cy - 0.01 * HS, top - 0.102 * HS))  # o Lodo e o cérebro abaixo se apoiam no crânio novo
# o PESCOÇO LONGO de tendões, do tronco até a base do crânio (atrás da mandíbula)
Nk = Sculpt()
Nk.chain([V(0, 0.01, 1.53), V(0, 0.012, 1.62), Vector((0, cy + 0.02 * HS, bottom + 0.03 * HS))], [0.052 * H, 0.04 * H, 0.034 * H], step=0.45)
for s in (1, -1):  # os tendões soltos dos lados (esternocleidomastoide)
    Nk.chain([V(s * 0.05, -0.04, 1.54), Vector((s * 0.035 * HS, cy - 0.01 * HS, bottom + 0.035 * HS))], [0.016 * H, 0.012 * H], step=0.45)
neck_fn = lambda p: AMP * (ridge(math.atan2(p.x, p.y - cy) * 9 + n3(p, 2.4) * 0.8) - 0.35)
add_sculpt('neckTendons', Nk, neck_fn, 1400, 'neck', res=0.009)
# a MANDÍBULA DE LODO: fios grossos saindo de baixo da arcada e das maçãs, descendo em V até o pescoço
Jw = Sculpt()
jaw_lo = bottom - 0.11 * HS
Jw.chain([Vector((0, front + 0.02 * HS, teeth_z + 0.004 * HS)), Vector((0, front + 0.035 * HS, teeth_z - 0.06 * HS)), Vector((0, cy - 0.03 * HS, jaw_lo))], [0.022 * HS, 0.02 * HS, 0.026 * HS], step=0.45)
for s in (1, -1):
    for xo, yo, r in ((0.17, 0.03, 0.012), (0.33, 0.07, 0.014), (0.45, 0.12, 0.013)):
        Jw.chain([Vector((s * xo * SW, front + yo * HS, teeth_z + (0.006 + xo * 0.05) * HS)),
                  Vector((s * xo * SW * 0.75, front + (yo + 0.02) * HS, teeth_z - 0.065 * HS)),
                  Vector((s * 0.04 * HS, cy - 0.025 * HS, jaw_lo + 0.01 * HS))], [r * HS, r * 0.9 * HS, r * 1.1 * HS], step=0.45)
jaw_fn = lambda p: AMP * 0.9 * (ridge(math.atan2(p.x, p.y - cy) * 14 + n3(p, 5) * 1.2) - 0.35)
add_sculpt('lodoJaw', Jw, jaw_fn, 1600, 'neck', res=0.006)
# o Lodo agarrado atrás do crânio, escorrendo pelo trapézio
Hd = Sculpt()
Hd.ell(hc + VS(0, 0.065, 0.01), (0.055 * HS, 0.045 * HS, 0.065 * HS))
Hd.chain([hc + VS(0, 0.07, -0.03), hc + VS(0, 0.06, -0.1), hc + VS(0, 0.04, -0.17)], [0.04 * HS, 0.034 * HS, 0.028 * HS], step=0.5)
hood_fn = lambda p: AMP * 0.8 * (ridge(math.atan2(p.x - hc.x, p.z - hc.z) * 16 + n3(p, 4)) - 0.35)
add_sculpt('lodoHead', Hd, hood_fn, 1200, 'head', res=0.011)
Br = Sculpt()  # o topo rompido: o cérebro vermelho aparecendo
Br.ell(hc + VS(0, -0.005, 0.078), (0.044 * HS, 0.055 * HS, 0.024 * HS))  # rente ao crânio (a calota rachada, não um chapéu)
for i in range(4):
    Br.ell(hc + VS((i - 1.5) * 0.018, 0.005, 0.082), (0.011 * HS, 0.038 * HS, 0.01 * HS))
brain_fn = lambda p: 0.004 * HS * (ridge((p.x - hc.x) / H * 160 + n3(p, 22) * 5, 2) - 0.4)  # giros sinuosos
b.add('brain', Br.mesh(res=0.008, smooth=2, disp=brain_fn, target=600), brain, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'carnical_lutador.blend'), check_existing=False)
