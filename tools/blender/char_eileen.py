"""
EILEEN (Ailín) — A Vigília (Treb Ciach, Irlanda, 890), a apicultora — public/models/eileen.glb.
Referências (wiki "Eileen", artes de frente e de costas, normal, apicultora e fantasiada; notas em lore/A-VIGILIA.md):
  - ~1,62 m; branca, sardas, olhos verdes com o centro castanho (no rosto: face_eileen); cabelo RUIVO com FRANJA e
    DUAS TRANÇAS LONGAS jogadas para a frente, pontas soltas, uma MECHA LOIRA no meio da trança esquerda;
  - o CAPUZ AMARELO de "orelhas pontudas" com a CAPINHA curta até os cotovelos e as linhas marrons na borda; a BLUSA
    amarela de gola de amarrar e o pingente de TREVO; o AVENTAL branco gasto com a FLOR VERMELHA bordada na ponta, sobre a
    SAIA de jardinagem marrom-escura com as duas linhas amarelas na barra;
  - as LUVAS grossas marrom-claro até o meio do antebraço; as calças escuras atadas por FAIXAS na canela; sapatos simples;
  - o CINTO com a BOLSA do trevo, a FOICE, o frasco azul e o JARRO DE ABELHAS (a foice e a funda da mão vêm em código).
FANTASIADA (a Transformação): o MESMO modelo ligando prop_sackMask (a máscara de SACO costurada, os olhos fundos e a
boca de dentes pontudos costurada), prop_twigs (os GALHOS secos como chifres) e prop_blackHood (o capuz PRETO com a
capa esfarrapada até a cintura); o capuz amarelo some (prop_hood). As tranças continuam aparecendo.
  exec(open(r"E:/arena paranormal/tools/blender/mcp_build.py", encoding="utf-8").read()); mcp_build("eileen")
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'eileen.glb'
random.seed(1103)

b = Builder(width=0.88, bulk=0.88, height=0.91)  # ~1,62 m
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

SKIN = '#f0c8b0'
M = {
    'skin': material('skin_eileen', SKIN, 0.75),
    'face': material('face_eileen', '#ffffff', 0.75),
    'torso': material('blouse_eileen', '#d8a838', 0.9),   # a blusa amarela
    'arm': material('sleeve_eileen', '#d8a838', 0.9),
    'hand': material('glove_eileen', '#8a5a36', 0.85),     # as luvas grossas
    'legs': material('pants_eileen', '#2a2622', 0.9),
    'feet': material('shoe_eileen', '#5a3a24', 0.8),
}
glove = M['hand']
skirtm = material('skirt_eileen', '#3a2a1e', 0.9)
yellow = M['torso']
yellow_dk = material('yellow_dk_eileen', '#a87a24', 0.9)
brownline = material('line_eileen', '#6a4424', 0.9)
apron = material('apron_eileen', '#ffffff', 0.95)          # o avental branco gasto com a flor (textura)
leather = material('belt_eileen', '#5a3622', 0.65)
wrap = material('wrap_eileen', '#3e2c20', 0.85)
hairm = material('hair_eileen', '#c0501e', 0.65)
blond = material('blond_eileen', '#e0b060', 0.65)
green = material('clover_eileen', '#4a8a3a', 0.6)
glass = material('flask_eileen', '#5ab8d8', 0.2)
jar = material('jar_eileen', '#c89a4a', 0.5)               # o jarro de barro com as abelhas
bee = material('bee_eileen', '#e0b020', 0.5)
brass = material('brass_eileen', '#c8a050', 0.35, metal=0.7)
wood = material('wood_eileen', '#6a4a2a', 0.8)
sole = material('sole_eileen', '#2a1a10', 0.8)
black = material('blackhood_eileen', '#1a1818', 0.95)
sack = material('sack_eileen', '#ffffff', 0.95)            # a máscara de saco (textura)
twig = material('twig_eileen', '#3a2e26', 0.85)
stitch = material('stitch_eileen', '#2a1a12', 0.8)

PREVIEW = {'face_eileen': SKIN, 'apron_eileen': '#e0dccc', 'sack_eileen': '#b8a07a'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.11, 0.15), (0.0, 0.148), (0.17, 0.122), (0.36, 0.16), (0.47, 0.17), (0.57, 0.104), (0.63, 0.058)]
hc = b.body(M, TP, arm_r=(0.046, 0.04, 0.034), leg_r=(0.08, 0.064, 0.046), head_r=(0.128, 0.14, 0.154))
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))


def part(name):
    return next(o for o in b.parts if o.name == name)


def body_r(dz):
    pts = [(-0.11, 0.15, 0.128), (0.0, 0.148, 0.126), (0.17, 0.122, 0.11), (0.36, 0.16, 0.14), (0.47, 0.17, 0.14), (0.57, 0.104, 0.09)]
    for (z0, x0, y0), (z1, x1, y1) in zip(pts, pts[1:]):
        if z0 <= dz <= z1:
            t = (dz - z0) / (z1 - z0)
            return x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
    return (pts[0][1], pts[0][2]) if dz < pts[0][0] else (pts[-1][1], pts[-1][2])


def on_body(a, dz, off=0.0):
    rx, ry = body_r(dz)
    return Vector((math.sin(a) * (rx * H + off), -math.cos(a) * (ry * H + off), hz + dz * H))


# ================================================================ a SAIA marrom-escura até abaixo do joelho, com as duas
# linhas amarelas na barra, e o AVENTAL branco na frente com a flor vermelha bordada
kz = sk['kL'].z
SK = [(hz + 0.04 * H, 0.156, 0.132, 0.0), (hz - 0.06 * H, 0.178, 0.152, 0.004), (hz - 0.25 * H, 0.2, 0.17, 0.008),
      (kz - 0.08 * H, 0.218, 0.186, 0.012)]
so = b.add('skirt', tube([(0, cy * H, z, rx * H, ry * H) for z, rx, ry, cy in SK], 44, cap_start=False, cap_end=False), skirtm, region='skirt', subdiv=1)
relief(so, lambda p: (0.003 + 0.009 * max(0.0, min(1.0, (hz - p.z) / (0.6 * H)))) * H * ridge(math.atan2(p.x, -p.y) * 8 + n3(p, 4) * 1.4, 2))
b.add('skirtIn', tube([(0, cy * H, z, rx * H * 0.96, ry * H * 0.96) for z, rx, ry, cy in SK[2:]], 44, cap_start=False, cap_end=False), skirtm, region='skirt', subdiv=0)
for k, dzz in enumerate((0.03, 0.06)):
    z = SK[3][0] + dzz * H
    t = (SK[2][0] - z) / (SK[2][0] - SK[3][0])
    rx = (SK[2][1] + (SK[3][1] - SK[2][1]) * t + 0.002) * H
    ry = (SK[2][2] + (SK[3][2] - SK[2][2]) * t + 0.002) * H
    cy = (SK[2][3] + (SK[3][3] - SK[2][3]) * t) * H
    b.add(f'skirtLine{k}', rod([(math.sin(a) * rx, cy - math.cos(a) * ry, z) for a in [j / 44 * TAU for j in range(45)]], 0.004 * H, 4, caps=False), yellow, region='skirt', subdiv=0)
# o avental: um pano largo na frente, da cintura até o joelho, seguindo a saia por fora
arows = []
for v in range(10):
    z = hz + 0.02 * H - v * (hz + 0.02 * H - (kz + 0.0 * H)) / 9
    t = max(0.0, min(1.0, (SK[0][0] - z) / (SK[0][0] - SK[3][0])))
    rx = (0.16 + 0.06 * t + 0.008) * H
    ry = (0.136 + 0.052 * t + 0.008) * H
    row = []
    for j in range(15):
        a = (-0.5 + j / 14) * 1.5
        row.append(Vector((math.sin(a) * rx, -math.cos(a) * ry + 0.006 * H * math.sin(j * 1.7 + v), z)))
    arows.append(row)
ap = b.add('apron', shell_grid(arows, 0.004 * H), apron, region='skirt', subdiv=0)
relief(ap, lambda p: 0.003 * H * (ridge(math.atan2(p.x, -p.y) * 6 + n3(p, 5), 2) - 0.4))
b.add('apronTie', rod([on_body(a, 0.04, 0.012 * H) for a in [(-0.5 + j / 30) * TAU for j in range(31)]], 0.006 * H, 4, caps=False), apron, region='torso', subdiv=0)

# ================================================================ a BLUSA: a gola de amarrar com o cordão e o PINGENTE
# do trevo de quatro folhas
b.add('collarTie', rod([on_body(-0.15, 0.6, 0.0), on_body(0.0, 0.52, 0.006 * H), on_body(0.15, 0.6, 0.0)], 0.004 * H, 4), brownline, region='chest', subdiv=0)
pc = on_body(0.0, 0.44, 0.01 * H)
cl = []
for k in range(4):
    a = k / 4 * TAU + math.pi / 4
    cl.append(ellipsoid(tuple(pc + Vector((math.cos(a) * 0.01 * H, -0.003 * H, math.sin(a) * 0.01 * H))), (0.009 * H, 0.004 * H, 0.009 * H), 8, 5))
b.add('clover', merge(*cl), green, region='chest', subdiv=0)

# ================================================================ as LUVAS grossas até o meio do antebraço (o punho
# largo e dobrado)
for side in ('L', 'R'):
    e, w = sk['e' + side], sk['hand' + side]
    d = (w - e).normalized()
    b.add('glove' + side, rod([e.lerp(w, 0.35), e.lerp(w, 0.7), e.lerp(w, 0.98)], [0.05 * H, 0.045 * H, 0.04 * H], 10), glove, region='e' + side, subdiv=0)
    up = Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0))
    u1 = d.cross(up).normalized()
    u2 = d.cross(u1).normalized()
    c = e.lerp(w, 0.36)
    b.add('gloveCuff' + side, rod([c + (u1 * math.cos(a) + u2 * math.sin(a)) * 0.054 * H for a in [j / 16 * TAU for j in range(17)]], 0.012 * H, 6, caps=False), yellow_dk if False else glove, region='e' + side, subdiv=0)

# ================================================================ o CINTO com a BOLSA do trevo, a FOICE pendurada, o frasco
# azul e o JARRO DE ABELHAS
ring = []
for i in range(33):
    a = i / 32 * TAU
    rx, ry = body_r(0.06)
    ring.append((math.sin(a) * (rx + 0.03) * H, -math.cos(a) * (ry + 0.03) * H, hz + 0.06 * H + 0.03 * H * math.sin(a)))
b.add('belt', rod(ring, 0.014 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), leather, region='torso', subdiv=0)
# a bolsa do lado esquerdo dela, com o trevo na aba
bp = on_body(1.0, 0.02, 0.05 * H)
b.add('bag', box(tuple(bp), (0.09 * H, 0.05 * H, 0.1 * H), bevel=0.012), leather, region='torso', subdiv=1)
b.add('bagFlap', box(tuple(bp + Vector((0, -0.006 * H, 0.03 * H))), (0.094 * H, 0.054 * H, 0.04 * H), bevel=0.008), wrap, region='torso', subdiv=0)
# a FOICE pendurada na frente, do lado esquerdo: o cabo e a lâmina curva de latão
fs = on_body(0.55, 0.0, 0.05 * H)
b.add('prop_sickleBeltGrip', rod([fs, fs + Vector((0.0, -0.01 * H, -0.12 * H))], 0.011 * H, 6), wood, region='torso', subdiv=0)
arc = [fs + Vector((0.0, -0.015 * H, -0.12 * H)) + Vector((math.sin(t) * 0.1 * H, -0.004 * H, -0.06 * H - math.cos(t) * 0.06 * H + 0.06 * H)) for t in [j / 12 * 2.6 for j in range(13)]]
b.add('prop_sickleBeltBlade', rod(arc, [0.012 * H * (1 - j / 14) + 0.002 * H for j in range(13)], 5, flat=((lambda p: Vector((0, 1, 0))), 0.25)), brass, region='torso', subdiv=0)
# o frasco azul do lado direito dela
fl = on_body(-0.6, -0.02, 0.05 * H)
b.add('flask', ellipsoid(tuple(fl), (0.026 * H, 0.022 * H, 0.032 * H), 10, 8), glass, region='torso', subdiv=0)
b.add('flaskNeck', rod([fl + Vector((0, 0, 0.025 * H)), fl + Vector((0, 0, 0.05 * H))], 0.008 * H, 6), wood, region='torso', subdiv=0)
# o JARRO DE ABELHAS atrás no quadril direito, com as abelhinhas em volta
jp = on_body(-1.5, 0.0, 0.07 * H)
b.add('beeJar', ellipsoid(tuple(jp), (0.045 * H, 0.045 * H, 0.055 * H), 12, 8), jar, region='torso', subdiv=0)
b.add('beeJarLid', rod([jp + Vector((0, 0, 0.05 * H)), jp + Vector((0, 0, 0.065 * H))], 0.024 * H, 8), wood, region='torso', subdiv=0)
bees = [ellipsoid(tuple(jp + Vector((math.cos(a) * 0.07 * H, math.sin(a) * 0.07 * H, 0.03 * H * math.sin(3 * a)))), (0.008 * H, 0.012 * H, 0.008 * H), 6, 4) for a in [k / 5 * TAU for k in range(5)]]
b.add('bees', merge(*bees), bee, region='torso', subdiv=0)

# ================================================================ as CALÇAS escuras fofas abaixo da saia, presas nas FAIXAS
# de tecido da canela, e os sapatos simples amarronzados
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    Wr = Sculpt()
    Wr.chain([k.lerp(f, 0.12), k.lerp(f, 0.6), f + Vector((0, 0.005 * H, 0.06 * H))], [0.066 * H, 0.054 * H, 0.05 * H], step=0.4)
    b.add('legWrap' + side, Wr.mesh(res=0.007, smooth=3, target=900), wrap, region='k' + side, subdiv=0)
    for i in range(7):
        t = 0.16 + i * 0.1
        cc = k.lerp(f, t)
        r = 0.068 * H - i * 0.0022 * H
        tilt = 0.026 * H * (1 if i % 2 else -1)
        ring = [(cc.x + math.sin(a) * r, cc.y - math.cos(a) * r, cc.z + tilt * math.sin(a)) for a in [j / 18 * TAU for j in range(19)]]
        b.add(f'legBand{side}{i}', rod(ring, 0.006 * H, 4, caps=False), leather, region='k' + side, subdiv=0)
    B = Sculpt()
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.05 * H, 0.11 * H, 0.04 * H))
    B.ell(f + Vector((0, -0.12 * H, 0.022 * H)), (0.044 * H, 0.05 * H, 0.028 * H))
    B.ell(f + Vector((0, 0.035 * H, 0.04 * H)), (0.046 * H, 0.046 * H, 0.045 * H))
    b.add('shoe' + side, B.mesh(res=0.007, smooth=3, target=900), M['feet'], region='k' + side, subdiv=0)
    b.add('shoeSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.012 * H), (0.094 * H, 0.23 * H, 0.022 * H), bevel=0.006), sole, region='k' + side, subdiv=0)

# ================================================================ CABELO RUIVO: a calota com a FRANJA e as DUAS TRANÇAS
# longas jogadas para a frente (a esquerda dela com a mecha loira no meio)
_hd = part('head')
_dg = bpy.context.evaluated_depsgraph_get()
_bvh = BVHTree.FromObject(_hd, _dg)
_mw = _hd.matrix_world
_mwi = _mw.inverted()


def on_head(a, el, off):
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    o = _mwi @ (HC + d * 0.6 * H)
    hit = _bvh.ray_cast(o, (_mwi.to_3x3() @ -d).normalized())
    if hit[0] is None:
        return None
    return _mw @ hit[0] + (_mw.to_3x3() @ hit[1]).normalized() * off


Hr = Sculpt()
Hr.ell(Vh(0, 0.012, 0.03), (0.138 * H, 0.15 * H, 0.136 * H))
Hr.ell(Vh(0, 0.05, -0.03), (0.13 * H, 0.12 * H, 0.116 * H))
Hr.ell(Vh(0, -0.17, -0.06), (0.1 * H, 0.08 * H, 0.12 * H), neg=True)
# a FRANJA: mechas curtas caindo na testa, abertas no meio
for k in range(9):
    a = (k / 8 - 0.5) * 1.3
    q0 = on_head(a, 0.9, 0.01 * H)
    q1 = on_head(a * 1.1, 0.42, 0.014 * H)
    if q0 and q1:
        Hr.chain([q0, q1, q1 + Vector((0, -0.006 * H, -0.03 * H))], [0.016 * H, 0.014 * H, 0.004 * H], step=0.45)
# as mechas dos lados descendo até as tranças
for s in (1, -1):
    for k in range(4):
        q0 = on_head(s * (0.9 + 0.12 * k), 0.6, 0.012 * H)
        q1 = on_head(s * (1.2 + 0.1 * k), -0.1, 0.016 * H)
        if q0 and q1:
            Hr.chain([q0, q1, q1 + Vector((s * 0.004 * H, 0, -0.05 * H))], [0.016 * H, 0.017 * H, 0.012 * H], step=0.45)


def strands(p):
    a = math.atan2(p.x - HC.x, -(p.y - HC.y))
    return 0.0022 * H * (ridge(a * 24 + (p.z - HC.z) / H * 8 + n3(p, 30), 2) - 0.4)


b.add('prop_crownCap', Hr.mesh(res=0.0055, smooth=2, disp=strands, target=8000), hairm, region='head', subdiv=0)


def plait(path, r0, n=40):
    """trança grossa de três gomos torcidos (o método do Gwayne)"""
    S = Sculpt()
    for j in range(n + 1):
        t = j / n
        kk = min(int(t * (len(path) - 1)), len(path) - 2)
        c = path[kk].lerp(path[kk + 1], t * (len(path) - 1) - kk)
        for s3 in range(3):
            ang = t * 6 * math.tau + s3 * math.tau / 3
            S.ell(c + Vector((math.cos(ang) * 0.62 * r0, math.sin(ang) * 0.62 * r0, 0)), r0 * (0.85 - 0.25 * t))
    return S.mesh(res=0.004, smooth=1, target=2600)


for s in (1, -1):
    shoulder = sk['s' + ('L' if s > 0 else 'R')]
    # por FORA da capinha: saem do capuz ao lado do rosto e caem pela frente do peito
    root = Vh(s * 0.135, -0.08, -0.06)
    p1 = Vector((s * 0.15 * H, -0.19 * H, shoulder.z + 0.01 * H))
    p2 = Vector((s * 0.135 * H, -0.205 * H, shoulder.z - 0.13 * H))
    end = Vector((s * 0.125 * H, -0.195 * H, shoulder.z - 0.29 * H))
    b.add(f'prop_hairPlait{s}', plait([root, p1, p2, end], 0.0165 * H), hairm, region='chest', subdiv=0)
    # a ponta solta, o laço e (na esquerda dela) a mecha loira no meio da trança
    tip = []
    for k in range(6):
        a = k / 6 * TAU
        q = end + Vector((math.cos(a) * 0.01 * H, math.sin(a) * 0.01 * H, 0))
        tip.append(rod([q, q + Vector((math.cos(a) * 0.012 * H, math.sin(a) * 0.012 * H - 0.004 * H, -0.07 * H))], [0.007 * H, 0.002 * H], 4))
    b.add(f'prop_hairTip{s}', merge(*tip), hairm, region='chest', subdiv=0)
    b.add(f'prop_hairTie{s}', rod([end + Vector((math.cos(a) * 0.017 * H, math.sin(a) * 0.017 * H, 0.004 * H)) for a in [j / 10 * TAU for j in range(11)]], 0.005 * H, 4, caps=False), leather, region='chest', subdiv=0)
    if s > 0:
        b.add('prop_hairBlond', plait([p1.lerp(p2, 0.2) + Vector((0, -0.01 * H, 0)), p2 + Vector((0, -0.012 * H, -0.06 * H))], 0.0125 * H, n=18), blond, region='chest', subdiv=0)
b.group('prop_hair', 'prop_hair')
b.group('prop_crown', 'prop_crown')
b.group('prop_sickleBelt', 'prop_sickleBelt')  # a foice do cinto: some quando ela está com a foice na mão (vigiliaProps.js)  # a calota com a franja: some debaixo da máscara de saco

# ================================================================ o CAPUZ AMARELO de orelhas pontudas e a CAPINHA curta até
# os cotovelos, com as linhas marrons na borda (prop_hood: some na fantasia)
Hd = Sculpt()
Hd.ell(Vh(0, 0.02, 0.04), (0.165 * H, 0.18 * H, 0.17 * H))
for s in (1, -1):  # as "orelhas" pontudas do capuz
    Hd.chain([Vh(s * 0.1, 0.0, 0.14), Vh(s * 0.12, 0.02, 0.2), Vh(s * 0.12, 0.03, 0.235)], [0.05 * H, 0.03 * H, 0.008 * H], step=0.4)
Hd.ell(Vh(0, 0.03, -0.07), (0.15 * H, 0.15 * H, 0.12 * H))            # o capuz descendo atrás até a nuca
Hd.ell(Vh(0, -0.2, -0.03), (0.115 * H, 0.12 * H, 0.14 * H), neg=True)  # a abertura do rosto (a franja aparece)
b.add('prop_hoodHead', Hd.mesh(res=0.007, smooth=2, disp=lambda p: 0.003 * H * (ridge(n3(p, 6) * 5, 2) - 0.4), target=4500), yellow, region='head', subdiv=0)
# a capinha: um sino de pano dos ombros até o cotovelo, inteiro (fechado na frente)
cap_rows = []
for v in range(9):
    t = v / 8
    z = HC.z - 0.17 * H - t * 0.34 * H
    rx = (0.1 + 0.2 * math.sin(min(1.0, t * 1.6) * math.pi / 2)) * H
    ry = (0.09 + 0.08 * math.sin(min(1.0, t * 1.6) * math.pi / 2)) * H
    row = []
    for j in range(65):
        a = j / 64 * TAU
        fold = 1 + 0.05 * t * (ridge(a * 5 + n3(Vector((a, t, 0)), 3)) - 0.4)
        row.append(Vector((math.sin(a) * rx * fold / b.k_tx, -math.cos(a) * ry * fold / b.k_ty + 0.01 * H, z + 0.025 * H * t * math.cos(a) ** 2)))
    cap_rows.append(row)


def capelet_w(p):
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.1 * H, 0.26 * H, abs(p.x)) * 0.55
    return {'s' + side: w_arm, 'sp': 1 - w_arm}


b.add('prop_hoodCape', shell_grid(cap_rows, 0.006 * H), yellow, region='torso', weight_fn=capelet_w, subdiv=0)
lines = []
for k, dzz in enumerate((0.0, 0.025)):
    lines.append(rod([p + Vector((0, 0, dzz * H)) for p in cap_rows[-1]], 0.004 * H, 4, caps=False))
b.add('prop_hoodLines', merge(*lines), brownline, region='torso', weight_fn=capelet_w, subdiv=0)
b.group('prop_hood', 'prop_hood')

# ================================================================ FANTASIADA: prop_sackMask — a máscara de SACO amarrada
# no pescoço, os OLHOS fundos e escuros e a BOCA de dentes pontudos costurada
Sm = Sculpt()
Sm.ell(Vh(0, -0.01, 0.02), (0.145 * H, 0.16 * H, 0.16 * H))
Sm.ell(Vh(0, -0.05, -0.13), (0.11 * H, 0.11 * H, 0.06 * H))
Sm.ell(Vh(0, 0.0, 0.02), (0.13 * H, 0.145 * H, 0.145 * H), neg=True)
b.add('prop_sackMaskCloth', Sm.mesh(res=0.006, smooth=2, disp=lambda p: 0.003 * H * (n3(p, 40) + 0.5 * ridge(p.z / H * 80, 2)), target=4000), sack, region='head', subdiv=0)
ey, te = [], []
for s in (1, -1):
    ey.append(ellipsoid(tuple(Vh(s * 0.05, -0.15, 0.02)), (0.034 * H, 0.014 * H, 0.03 * H), 10, 6))
ey.append(ellipsoid(tuple(Vh(0, -0.14, -0.08)), (0.07 * H, 0.016 * H, 0.03 * H), 12, 6))  # a boca
for k in range(9):  # os dentes pontudos de pano, de cima e de baixo
    x = (k / 8 - 0.5) * 0.12
    te.append(rod([Vh(x, -0.155, -0.055), Vh(x, -0.158, -0.08)], [0.006 * H, 0.001 * H], 4))
    te.append(rod([Vh(x + 0.007, -0.155, -0.11), Vh(x + 0.007, -0.158, -0.085)], [0.006 * H, 0.001 * H], 4))
b.add('prop_sackMaskDark', merge(*ey), material('dark_eileen', '#120c0a', 0.9), region='head', subdiv=0)
b.add('prop_sackMaskTeeth', merge(*te), sack, region='head', subdiv=0)
st = []
for s in (1, -1):  # as costuras em volta dos olhos e o cordão do pescoço
    st.append(rod([Vh(s * 0.05 + math.cos(a) * 0.04, -0.152, 0.02 + math.sin(a) * 0.036) for a in [j / 14 * TAU for j in range(15)]], 0.0025 * H, 3, caps=False))
st.append(rod([Vh(math.sin(a) * 0.115, -math.cos(a) * 0.115, -0.14) for a in [j / 20 * TAU for j in range(21)]], 0.004 * H, 4, caps=False))
b.add('prop_sackMaskStitch', merge(*st), stitch, region='head', subdiv=0)
b.group('prop_sackMask', 'prop_sackMask')

# ================================================================ FANTASIADA: prop_twigs — os GALHOS secos saindo do capuz
tw = []
for s in (1, -1):
    root = Vh(s * 0.09, 0.0, 0.16)
    d0 = Vector((s * 0.55, 0.05, 1.0)).normalized()
    tip = root + d0 * 0.34 * H
    tw.append(rod([root, root.lerp(tip, 0.5) + Vector((s * 0.02 * H, 0, 0)), tip], [0.011 * H, 0.008 * H, 0.002 * H], 5))
    for t, dx in ((0.4, 0.9), (0.6, -0.5), (0.8, 0.8)):
        p = root.lerp(tip, t)
        nd = Vector((s * dx, 0.0, 0.7)).normalized()
        tw.append(rod([p, p + nd * 0.1 * H], [0.006 * H, 0.0015 * H], 4))
b.add('prop_twigsWood', merge(*tw), twig, region='head', subdiv=0)
b.group('prop_twigs', 'prop_twigs')

# ================================================================ FANTASIADA: prop_blackHood — o capuz PRETO e a capa
# esfarrapada até a cintura, em tiras compridas


def tatter(u, depth, n=40):
    k = u * n
    tooth = abs((k % 1.0) - 0.5) * 2
    seed = math.floor(k)
    ln = 0.4 + 0.6 * ((math.sin(seed * 12.9898) * 43758.5453) % 1.0)
    return depth * ln * (1 - tooth ** 2)


Bh = Sculpt()
Bh.ell(Vh(0, 0.03, 0.05), (0.18 * H, 0.2 * H, 0.19 * H))
Bh.ell(Vh(0, 0.04, -0.08), (0.16 * H, 0.16 * H, 0.12 * H))
Bh.ell(Vh(0, -0.21, -0.02), (0.12 * H, 0.12 * H, 0.15 * H), neg=True)  # a abertura (a máscara aparece)
b.add('prop_blackHoodHead', Bh.mesh(res=0.007, smooth=2, disp=lambda p: 0.004 * H * (ridge(n3(p, 6) * 5, 2) - 0.4), target=4500), black, region='head', subdiv=0)
crow = []
for v in range(12):
    t = v / 11
    z = HC.z - 0.16 * H - t * 0.62 * H
    rx = (0.11 + 0.22 * math.sin(min(1.0, t * 2.2) * math.pi / 2) + 0.04 * t) * H
    ry = (0.1 + 0.09 * math.sin(min(1.0, t * 2.2) * math.pi / 2) + 0.03 * t) * H
    row = []
    for j in range(81):
        u = j / 80
        a = u * TAU
        fold = 1 + 0.07 * t * (ridge(a * 6 + n3(Vector((a, t, 0)), 3)) - 0.4)
        zz = z - (tatter(u, 0.22 * H, 46) if v == 11 else 0.0)
        row.append(Vector((math.sin(a) * rx * fold / b.k_tx, -math.cos(a) * ry * fold / b.k_ty + 0.012 * H, zz)))
    crow.append(row)
b.add('prop_blackHoodCape', shell_grid(crow, 0.006 * H), black, region='torso', weight_fn=capelet_w, subdiv=0)
b.group('prop_blackHood', 'prop_blackHood')

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'eileen.blend'), check_existing=False)
