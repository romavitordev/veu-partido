"""
ZURI — A Vigília (Treb Ciach, Irlanda, 890), a curandeira — public/models/zuri.glb.
Referências (wiki "Zuri", artes de frente e de costas, normal e fantasiada; notas em lore/A-VIGILIA.md):
  - estatura média (~1,65 m); pele escura de tons quentes, olhos cor de mel, sardas (no rosto: face_zuri); cabelos
    PRETOS TRANÇADOS pela metade — trancinhas rentes no alto, presas atrás por uma PRESILHA CIRCULAR prateada, e as
    tranças longas soltas caindo pelas costas e por cima do ombro esquerdo dela;
  - MANTO marrom-castanho de capuz (abaixado) com FRANJAS na borda; TÚNICA verde-oliva de gola em V e mangas
    arregaçadas sobre a CAMISA bege; a SAIA longa da mesma cor com duas faixas na barra;
  - na cintura o acessório GROSSO e FELPUDO, os cintos de couro, o pano xadrez caído na frente, o MAÇO DE ERVAS
    (lavanda e folhas), a BOLSA redonda e a faca no coldre; o colar de metal com pingente e as pulseiras no pulso
    esquerdo; as BOTAS marrons baixas com o cano dobrado.
FANTASIADA (a Transformação): o MESMO modelo ligando prop_deerMask (o CRÂNIO DE CERVO coberto de musgo, com as
GALHADAS amarradas com fio), prop_cowl (o capuz enorme verde-oliva enrolado no pescoço e nos ombros) e prop_robe (a capa
verde-oliva longa e ESFARRAPADA até os tornozelos); somem o cabelo e o manto marrom (prop_hair, prop_mantle).
  exec(open(r"E:/arena paranormal/tools/blender/mcp_build.py", encoding="utf-8").read()); mcp_build("zuri")
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'zuri.glb'
random.seed(890)

b = Builder(width=0.9, bulk=0.9, height=0.93)  # ~1,65 m
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

SKIN = '#7a4a30'
M = {
    'skin': material('skin_zuri', SKIN, 0.75),
    'face': material('face_zuri', '#ffffff', 0.75),
    'torso': material('tunic_zuri', '#5a6440', 0.9),   # a túnica verde-oliva
    'arm': material('shirt_zuri', '#d2c2a0', 0.9),     # as mangas da camisa bege
    'hand': material('hand_zuri', SKIN, 0.75),
    'legs': material('legs_zuri', '#2a2420', 0.9),     # a meia escura que aparece entre a saia e a bota
    'feet': material('boot_zuri', '#6a4428', 0.75),
}
tunic = M['torso']
tunic_dk = material('tunic_dk_zuri', '#3e4630', 0.9)
shirt = M['arm']
leather = material('belt_zuri', '#4a2e1e', 0.6)
leather_lt = material('boot_lt_zuri', '#8a6040', 0.8)
fur = material('fur_zuri', '#8a7258', 0.95)               # o acessório felpudo da cintura
plaid = material('plaid_zuri', '#ffffff', 0.9)            # o pano xadrez (textura)
mantle = material('mantle_zuri', '#7a5430', 0.95)         # o manto marrom-castanho
silver = material('silver_zuri', '#c8ccd0', 0.3, metal=0.85)
hairm = material('hair_zuri', '#16100e', 0.6)
herb = material('herb_zuri', '#5a7a3a', 0.85)
lav = material('lavender_zuri', '#8a6ab0', 0.8)
sole = material('sole_zuri', '#2a1a10', 0.8)
bone = material('bone_zuri', '#a8a48a', 0.85)             # o crânio de cervo, esverdeado de musgo
moss = material('moss_zuri', '#4e5a2e', 0.95)
antler = material('antler_zuri', '#3a3634', 0.7)
twine = material('twine_zuri', '#a08a5a', 0.9)
paint = material('paint_zuri', '#8a2a24', 0.8)            # as marcas vermelhas pintadas no crânio
robe = material('robe_zuri', '#ffffff', 0.95)             # a capa oliva esfarrapada (textura)

PREVIEW = {'face_zuri': SKIN, 'plaid_zuri': '#a08a60', 'robe_zuri': '#4e5434'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.11, 0.152), (0.0, 0.15), (0.17, 0.124), (0.36, 0.162), (0.47, 0.172), (0.57, 0.106), (0.63, 0.058)]
hc = b.body(M, TP, arm_r=(0.046, 0.04, 0.034), leg_r=(0.076, 0.06, 0.044), head_r=(0.128, 0.14, 0.154))
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))


def part(name):
    return next(o for o in b.parts if o.name == name)


def body_r(dz):
    pts = [(-0.11, 0.152, 0.13), (0.0, 0.15, 0.128), (0.17, 0.124, 0.112), (0.36, 0.162, 0.14), (0.47, 0.172, 0.142), (0.57, 0.106, 0.09)]
    for (z0, x0, y0), (z1, x1, y1) in zip(pts, pts[1:]):
        if z0 <= dz <= z1:
            t = (dz - z0) / (z1 - z0)
            return x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
    return (pts[0][1], pts[0][2]) if dz < pts[0][0] else (pts[-1][1], pts[-1][2])


def on_body(a, dz, off=0.0):
    rx, ry = body_r(dz)
    return Vector((math.sin(a) * (rx * H + off), -math.cos(a) * (ry * H + off), hz + dz * H))


# ================================================================ a SAIA longa verde-oliva até os tornozelos, as duas
# faixas escuras na barra, e a gola em V da camisa bege por baixo da túnica
SK = [(hz + 0.04 * H, 0.158, 0.134, 0.0), (hz - 0.06 * H, 0.18, 0.154, 0.004), (hz - 0.3 * H, 0.215, 0.185, 0.01),
      (hz - 0.55 * H, 0.245, 0.215, 0.016), (0.14 * H, 0.27, 0.24, 0.022)]
so = b.add('skirt', tube([(0, cy * H, z, rx * H, ry * H) for z, rx, ry, cy in SK], 48, cap_start=False, cap_end=False), tunic, region='skirt', subdiv=1)
relief(so, lambda p: (0.003 + 0.01 * max(0.0, min(1.0, (hz - p.z) / (0.9 * H)))) * H * ridge(math.atan2(p.x, -p.y) * 8 + n3(p, 4) * 1.4, 2))
b.add('skirtIn', tube([(0, cy * H, z, rx * H * 0.96, ry * H * 0.96) for z, rx, ry, cy in SK[2:]], 48, cap_start=False, cap_end=False), tunic_dk, region='skirt', subdiv=0)
for k, z in enumerate((0.2 * H, 0.235 * H)):
    t = (SK[3][0] - z) / (SK[3][0] - SK[4][0])
    rx = (SK[3][1] + (SK[4][1] - SK[3][1]) * t + 0.002) * H
    ry = (SK[3][2] + (SK[4][2] - SK[3][2]) * t + 0.002) * H
    cy = (SK[3][3] + (SK[4][3] - SK[3][3]) * t) * H
    b.add(f'skirtStripe{k}', rod([(math.sin(a) * rx, cy - math.cos(a) * ry, z) for a in [j / 48 * TAU for j in range(49)]], 0.0045 * H, 4, caps=False), tunic_dk, region='skirt', subdiv=0)
# a gola em V: o pano bege aparecendo e a borda da túnica
vneck = [on_body(a, 0.56 - abs(a) * 0.2, 0.003 * H) for a in [(-0.5 + j / 16) * 0.9 for j in range(17)]]
b.add('shirtV', rod(vneck, 0.01 * H, 5), shirt, region='chest', subdiv=0)
# o bordado prateado no peito (a arte: o enfeite claro na gola)
b.add('neckChain', rod([on_body(a, 0.6, 0.006 * H) + Vector((0, 0, -0.06 * H * math.cos(a) ** 6)) for a in [(-0.5 + j / 20) * 1.6 for j in range(21)]], 0.003 * H, 4), silver, region='chest', subdiv=0)
b.add('pendant', ellipsoid(tuple(on_body(0.0, 0.5, 0.012 * H)), (0.016 * H, 0.006 * H, 0.02 * H), 8, 6), silver, region='chest', subdiv=0)

# ================================================================ as MANGAS ARREGAÇADAS: a camisa bege até o cotovelo, o
# rolo do pano e o antebraço de fora; as PULSEIRAS no pulso esquerdo dela
for side in ('L', 'R'):
    e, w = sk['e' + side], sk['hand' + side]
    d = (w - e).normalized()
    b.add('forearm' + side, rod([e.lerp(w, 0.05), e.lerp(w, 0.5), e.lerp(w, 0.95)], [0.05 * H, 0.046 * H, 0.04 * H], 10), M['skin'], region='e' + side, subdiv=0)
    up = Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0))
    u1 = d.cross(up).normalized()
    u2 = d.cross(u1).normalized()
    c = e.lerp(w, 0.06)
    b.add('cuff' + side, rod([c + (u1 * math.cos(a) + u2 * math.sin(a)) * 0.05 * H for a in [j / 16 * TAU for j in range(17)]], 0.014 * H, 6, caps=False), shirt, region='e' + side, subdiv=0)
    if side == 'L':
        for i in range(3):
            cc = e.lerp(w, 0.84 - i * 0.05)
            b.add(f'bracelet{i}', rod([cc + (u1 * math.cos(a) + u2 * math.sin(a)) * (0.038 + 0.002 * i) * H for a in [j / 14 * TAU for j in range(15)]], 0.0035 * H, 4, caps=False), silver if i != 1 else leather, region='e' + side, subdiv=0)

# ================================================================ a CINTURA: o acessório felpudo, os dois cintos largos,
# o pano xadrez caído na frente, o MAÇO DE ERVAS, a BOLSA redonda e a faca no coldre
Fz = Sculpt()
for j in range(26):
    a = j / 26 * TAU
    Fz.ell(on_body(a, 0.035, 0.02 * H), (0.036 * H, 0.03 * H, 0.04 * H))
b.add('furSash', Fz.mesh(res=0.007, smooth=2, disp=lambda p: 0.004 * H * (n3(p, 40) + 0.5 * n3(p, 90)), target=2600), fur, region='torso', subdiv=0)
for k, (dz, tilt) in enumerate(((0.07, 0.0), (0.0, 0.025))):
    ring = []
    for i in range(33):
        a = i / 32 * TAU
        rx, ry = body_r(dz)
        ring.append((math.sin(a) * (rx + 0.03) * H, -math.cos(a) * (ry + 0.03) * H, hz + dz * H + tilt * H * math.sin(a)))
    b.add(f'belt{k}', rod(ring, 0.017 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), leather, region='torso', subdiv=0)
    b.add(f'buckle{k}', box(tuple(on_body(-0.15 + 0.3 * k, dz, 0.035 * H)), (0.034 * H, 0.012 * H, 0.03 * H), bevel=0.003), silver, region='torso', subdiv=0)
# o pano xadrez: uma aba caída na frente, do lado direito dela (-x), até a coxa
prow = []
for v in range(8):
    dz = 0.02 - v * 0.05
    row = []
    for j in range(9):
        a = -0.66 + j * 0.05
        p = on_body(a, 0.0, 0.024 * H + 0.006 * H * v)
        p.z = hz + dz * H
        p.x += 0.006 * H * math.sin(v * 1.3 + j)
        row.append(p)
    prow.append(row)
b.add('plaidFlap', shell_grid(prow, 0.005 * H), plaid, region='torso', subdiv=0)
# o MAÇO DE ERVAS pendurado do lado direito dela: os talos, as folhas largas e os cachos de lavanda
hb = on_body(-0.75, -0.04, 0.05 * H)
stems, leaves, flowers = [], [], []
for k in range(9):
    ang = (k / 8 - 0.5) * 0.7
    tip = hb + Vector((math.sin(ang) * 0.06 * H, -0.02 * H, -(0.24 + 0.06 * random.random()) * H))
    stems.append(rod([hb, hb.lerp(tip, 0.5), tip], 0.003 * H, 4))
    for t in (0.35, 0.55, 0.75):
        c = hb.lerp(tip, t)
        for s in (1, -1):
            leaves.append(ellipsoid(tuple(c + Vector((s * 0.016 * H, -0.004 * H, -0.012 * H))), (0.008 * H, 0.003 * H, 0.036 * H), 6, 4))
    if k % 2 == 0:
        for t in (0.8, 0.88, 0.96):
            flowers.append(ellipsoid(tuple(hb.lerp(tip, t) + Vector((0, -0.006 * H, 0))), (0.009 * H, 0.009 * H, 0.014 * H), 6, 4))
b.add('herbStems', merge(*stems), herb, region='torso', subdiv=0)
b.add('herbLeaves', merge(*leaves), herb, region='torso', subdiv=0)
b.add('herbFlowers', merge(*flowers), lav, region='torso', subdiv=0)
b.add('herbTie', rod([hb + Vector((math.cos(a) * 0.018 * H, math.sin(a) * 0.018 * H, -0.03 * H)) for a in [j / 10 * TAU for j in range(11)]], 0.004 * H, 4, caps=False), twine, region='torso', subdiv=0)
# a BOLSA redonda de couro do lado esquerdo dela, numa tira comprida, com o botão de cobre no meio
pc = on_body(0.55, -0.24, 0.05 * H)
b.add('pouchStrap', rod([on_body(0.3, 0.0, 0.04 * H), on_body(0.45, -0.12, 0.05 * H), pc + Vector((0, 0, 0.04 * H))], 0.004 * H, 4), leather, region='torso', subdiv=0)
pouch = cylinder_y(tuple(pc), 0.042 * H, 0.022 * H, 18) if 'cylinder_y' in globals() else ellipsoid(tuple(pc), (0.045 * H, 0.016 * H, 0.045 * H), 16, 8)
b.add('pouch', pouch, leather, region='torso', subdiv=0)
b.add('pouchBoss', ellipsoid(tuple(pc + Vector((0, -0.017 * H, 0))), (0.022 * H, 0.008 * H, 0.022 * H), 12, 6), material('copper_zuri', '#c07a3a', 0.4, metal=0.6), region='torso', subdiv=0)
# a faca no coldre, atrás no quadril esquerdo dela
k0 = on_body(1.6, 0.0, 0.035 * H)
b.add('knifeSheath', rod([k0, k0 + Vector((0.01 * H, 0.004 * H, -0.14 * H))], [0.016 * H, 0.008 * H], 6), leather, region='torso', subdiv=0)
b.add('knifeGrip', rod([k0, k0 + Vector((0, 0, 0.06 * H))], 0.009 * H, 6), material('wood_zuri', '#5a3e26', 0.8), region='torso', subdiv=0)

# ================================================================ as BOTAS marrons baixas com o CANO DOBRADO
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    B = Sculpt()
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.05 * H, 0.11 * H, 0.04 * H))
    B.ell(f + Vector((0, -0.12 * H, 0.024 * H)), (0.044 * H, 0.05 * H, 0.028 * H))
    B.chain([f + Vector((0, 0.01 * H, 0.03 * H)), k.lerp(f, 0.62)], [0.05 * H, 0.046 * H], step=0.4)
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, target=1100), M['feet'], region='k' + side, subdiv=0)
    c = k.lerp(f, 0.6)
    Cf = Sculpt()  # o cano dobrado, largo e claro
    Cf.chain([c + Vector((0, 0, -0.02 * H)), c + Vector((0, 0, 0.05 * H))], [0.064 * H, 0.068 * H], step=0.3)
    Cf.ell(c + Vector((0, 0, 0.02 * H)), (0.052 * H, 0.052 * H, 0.08 * H), neg=True)
    b.add('bootCuff' + side, Cf.mesh(res=0.006, smooth=2, target=900), leather_lt, region='k' + side, subdiv=0)
    # a costura em X no peito do pé
    st = [f + Vector((0, -0.12 * H + 0.03 * H * i, 0.05 * H + 0.006 * H * i)) for i in range(3)]
    b.add('bootStitch' + side, merge(*[rod([p + Vector((-0.014 * H, 0, 0)), p + Vector((0.014 * H, 0, 0.004 * H))], 0.002 * H, 3) for p in st]), leather, region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.012 * H), (0.096 * H, 0.23 * H, 0.022 * H), bevel=0.006), sole, region='k' + side, subdiv=0)

# ================================================================ o MANTO marrom-castanho dos ombros até a canela, aberto
# na frente, com FRANJAS na borda e o CAPUZ abaixado nas costas (prop_mantle: some na fantasia)


def cape_pt(a, v, out=1.0, low=0.3 * H, width=1.0):
    V0 = 0.22
    th = min(1.0, v / V0) * math.pi / 2
    side = abs(math.sin(a))
    kk = 0.55 + 0.45 * side
    dv = max(0.0, v - V0) / (1 - V0)
    rx = (0.11 * H + 0.23 * H * math.sin(th) * kk + dv * 0.15 * H) * width
    ry = 0.1 * H + 0.1 * H * math.sin(th) + dv * 0.1 * H
    fold = 1 + 0.08 * min(1.0, v * 2.5) * (ridge(a * 4.5 + v * 1.2 + n3(Vector((a, v, 0)), 3)) - 0.4)
    z0 = top + 0.1 * H - 0.17 * H * (1 - math.cos(th)) * kk
    z = z0 - dv * (z0 - low)
    return Vector((math.sin(a) * rx * fold * out / b.k_tx, -math.cos(a) * ry * fold * out / b.k_ty, z))


def tatter(u, depth, n=40):
    k = u * n
    tooth = abs((k % 1.0) - 0.5) * 2
    seed = math.floor(k)
    ln = 0.4 + 0.6 * ((math.sin(seed * 12.9898) * 43758.5453) % 1.0)
    return depth * ln * (1 - tooth ** 2)


def cape_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.15 * H, 0.3 * H, abs(p.x)) * smoothstep(top - 0.55 * H, top - 0.12 * H, p.z) * 0.5
    w_hip = smoothstep(hz + 0.12 * H, hz - 0.35 * H, p.z) * (1 - w_arm) * 0.75
    return {'s' + side: w_arm, 'hips': w_hip, 'sp': max(0.0, 1 - w_arm - w_hip)}


GAP = 0.12
VS = [0.22 * k / 8 for k in range(8)] + [0.22 + 0.78 * k / 18 for k in range(0, 19)]
rows = []
for v in VS:
    row = []
    for j in range(73):
        u = GAP + (1 - 2 * GAP) * j / 72
        row.append(cape_pt(u * TAU, v, 1.0, 0.34 * H))
    rows.append(row)
cp = b.add('prop_mantleCloth', shell_grid(rows, 0.007 * H), mantle, region='torso', weight_fn=cape_weights, subdiv=0)
relief(cp, lambda p: 0.005 * H * (ridge(math.atan2(p.x, p.y) * 8 + n3(p, 9) * 1.5, 2) - 0.35) * smoothstep(top, top - 0.4 * H, p.z))
# as FRANJAS: tirinhas finas penduradas na barra e subindo pelas bordas da frente
fr = []
for j in range(120):
    u = GAP + (1 - 2 * GAP) * j / 119
    p = cape_pt(u * TAU, 1.0, 1.0, 0.34 * H)
    L = (0.035 + 0.02 * ((j * 7) % 3) / 2) * H
    fr.append(rod([p, p + Vector((0, 0, -L))], [0.0028 * H, 0.0015 * H], 3))
for s in (1, -1):
    for k in range(26):
        v = 0.25 + 0.75 * k / 25
        p = cape_pt(s * GAP * TAU if s > 0 else (1 - GAP) * TAU, v, 1.0, 0.34 * H)
        out = Vector((-s * 0.03, -1, 0)).normalized()
        fr.append(rod([p, p + out * 0.03 * H + Vector((0, 0, -0.012 * H))], [0.0026 * H, 0.0014 * H], 3))
b.add('prop_mantleFringe', merge(*fr), mantle, region='torso', weight_fn=cape_weights, subdiv=0)
# o capuz abaixado: o pano grosso em volta do pescoço e dobrado nas costas
Hd = Sculpt()
Hd.chain([cape_pt(a * TAU, 0.05, 1.0) for a in [GAP + (1 - 2 * GAP) * i / 24 for i in range(25)]], 0.03 * H, step=0.5)
for i in range(7):
    a = math.pi + (i / 6 - 0.5) * 1.5
    Hd.ell(cape_pt(a, 0.12, 1.06) + Vector((0, 0.02 * H, -0.03 * H)), (0.055 * H, 0.035 * H, 0.06 * H))
b.add('prop_mantleHood', Hd.mesh(res=0.009, smooth=2, disp=lambda p: 0.004 * H * (ridge(n3(p, 6) * 6, 2) - 0.4), target=3200), mantle, region='torso', weight_fn=cape_weights, subdiv=0)
b.group('prop_mantle', 'prop_mantle')

# ================================================================ CABELO: PRETO, trançado pela metade — as trancinhas
# rentes no alto (do rosto para trás), a PRESILHA CIRCULAR prateada atrás e as tranças longas soltas
_hd = part('head')
_dg = bpy.context.evaluated_depsgraph_get()
_bvh = BVHTree.FromObject(_hd, _dg)
_mw = _hd.matrix_world
_mwi = _mw.inverted()


def on_head(a, el, off):
    """a = ângulo a partir da frente (+ = lado esquerdo dela, +x), el = elevação a partir do equador da cabeça"""
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    o = _mwi @ (HC + d * 0.6 * H)
    hit = _bvh.ray_cast(o, (_mwi.to_3x3() @ -d).normalized())
    if hit[0] is None:
        return None
    return _mw @ hit[0] + (_mw.to_3x3() @ hit[1]).normalized() * off


Hr = Sculpt()
Hr.ell(Vh(0, 0.014, 0.03), (0.136 * H, 0.15 * H, 0.134 * H))
Hr.ell(Vh(0, 0.05, -0.03), (0.13 * H, 0.12 * H, 0.116 * H))
Hr.ell(Vh(0, 0.06, -0.08), (0.11 * H, 0.096 * H, 0.08 * H))
Hr.ell(Vh(0, -0.17, -0.05), (0.1 * H, 0.08 * H, 0.12 * H), neg=True)  # o rosto livre


def cornrows(p):
    # as trancinhas rentes: sulcos do rosto para trás, com o "trançado" marcado ao longo de cada uma
    a = math.atan2(p.x - HC.x, p.z - HC.z + 0.05 * H)
    along = (HC.y - p.y) / H
    return 0.0035 * H * (ridge(a * 18, 2) - 0.4) + 0.0012 * H * ridge(along * 90 + a * 18, 2)


b.add('prop_hairCap', Hr.mesh(res=0.0055, smooth=2, disp=cornrows, target=8000), hairm, region='head', subdiv=0)
# a PRESILHA CIRCULAR prateada na nuca, juntando as trancinhas
clip_c = on_head(math.pi, 0.15, 0.012 * H)
b.add('prop_hairClip', rod([clip_c + Vector((math.cos(a) * 0.03 * H, 0.0, math.sin(a) * 0.03 * H)) for a in [j / 20 * TAU for j in range(21)]], 0.006 * H, 6, caps=False), silver, region='head', subdiv=0)


def braid(path, r0, n=26):
    """trança: um tubo com gomos (o raio sobe e desce), afinando para a ponta"""
    pts, rr = [], []
    for j in range(n + 1):
        t = j / n
        kk = min(int(t * (len(path) - 1)), len(path) - 2)
        f = t * (len(path) - 1) - kk
        pts.append(path[kk].lerp(path[kk + 1], f))
        rr.append(r0 * (1 - 0.35 * t) * (0.78 + 0.22 * abs(math.sin(j * 1.9))))
    return rod(pts, rr, 6)


br = []
# atrás: as tranças saindo da presilha e caindo até o meio das costas
for k in range(17):
    a = (k / 16 - 0.5) * 1.7
    root = clip_c + Vector((math.sin(a) * 0.03 * H, 0.004 * H, -0.01 * H - abs(a) * 0.01 * H))
    # por fora do capuz abaixado do manto: saem para trás e caem pelas costas até a cintura
    p1 = root + Vector((math.sin(a) * 0.04 * H, 0.09 * H, -0.08 * H))
    p2 = p1 + Vector((math.sin(a) * 0.05 * H, 0.06 * H, -0.12 * H))
    end = p2 + Vector((math.sin(a) * 0.05 * H, 0.0, -(0.26 + 0.08 * random.random()) * H))
    br.append(braid([root, p1, p2, end], 0.015 * H))
# as que caem pela frente, por cima do ombro esquerdo dela (+x), até o peito
for k in range(6):
    root = on_head(1.2 + 0.12 * k, -0.15, 0.01 * H)
    if not root:
        continue
    sh_ = sk['sL'] + Vector((-0.02 * H + 0.012 * H * k, -0.06 * H, 0.05 * H))
    end = sh_ + Vector((-0.03 * H + 0.008 * H * k, -0.04 * H, -(0.22 + 0.03 * (k % 2)) * H))
    br.append(braid([root, root + Vector((0.01 * H, -0.01 * H, -0.06 * H)), sh_, end], 0.014 * H))
b.add('prop_hairBraids', merge(*br), hairm, region='head', subdiv=0)
b.group('prop_hair', 'prop_hair')

# ================================================================ FANTASIADA: prop_deerMask — o CRÂNIO DE CERVO esverdeado
# de musgo, o focinho longo para baixo, as órbitas fundas, as marcas vermelhas pintadas e as GALHADAS amarradas com fio
mk = Sculpt()
mk.ell(Vh(0, -0.02, 0.07), (0.15 * H, 0.16 * H, 0.15 * H))
mk.ell(Vh(0, -0.1, 0.0), (0.12 * H, 0.1 * H, 0.12 * H))
mk.chain([Vh(0, -0.15, 0.0), Vh(0, -0.2, -0.07), Vh(0, -0.225, -0.15), Vh(0, -0.235, -0.2)], [0.09 * H, 0.072 * H, 0.056 * H, 0.042 * H], step=0.4)
for s in (1, -1):
    mk.ell(Vh(s * 0.06, -0.15, 0.04), (0.04 * H, 0.04 * H, 0.04 * H), neg=True)
    mk.ell(Vh(s * 0.016, -0.25, -0.2), (0.013 * H, 0.016 * H, 0.016 * H), neg=True)
b.add('prop_deerMaskBone', mk.mesh(res=0.006, smooth=3, disp=lambda p: 0.0022 * H * n3(p, 26), target=3400), bone, region='head', subdiv=0)
# o musgo por cima da calota (manchas fofas)
Ms = Sculpt()
for k in range(16):
    a = random.uniform(-1.6, 1.6)
    el = random.uniform(0.3, 1.2)
    p = Vh(math.sin(a) * math.cos(el) * 0.15, -0.02 - math.cos(a) * math.cos(el) * 0.15, 0.07 + math.sin(el) * 0.14)
    Ms.ell(p, (0.04 * H, 0.04 * H, 0.022 * H))
Ms.ell(Vh(0, -0.02, 0.07), (0.145 * H, 0.155 * H, 0.145 * H), neg=True)
b.add('prop_deerMaskMoss', Ms.mesh(res=0.006, smooth=2, disp=lambda p: 0.004 * H * n3(p, 60), target=2000), moss, region='head', subdiv=0)
dk = []
for s in (1, -1):
    dk.append(ellipsoid(tuple(Vh(s * 0.058, -0.135, 0.04)), (0.03 * H, 0.016 * H, 0.03 * H), 10, 6))
b.add('prop_deerMaskDark', merge(*dk), material('dark_zuri', '#120e0c', 0.9), region='head', subdiv=0)
# as marcas vermelhas: a faixa no focinho e os traços nas órbitas
pm = [rod([Vh(0, -0.175, 0.02), Vh(0, -0.225, -0.08), Vh(0, -0.245, -0.15)], 0.008 * H, 4)]
for s in (1, -1):
    pm.append(rod([Vh(s * 0.035, -0.18, 0.0), Vh(s * 0.075, -0.15, -0.04)], 0.005 * H, 4))
b.add('prop_deerMaskPaint', merge(*pm), paint, region='head', subdiv=0)


def antler_branch(root, d, length, r, depth, out):
    tip = root + d * length
    mid = root.lerp(tip, 0.5) + Vector((0, 0, 0.02 * H))
    out.append(rod([root, mid, tip], [r, r * 0.8, r * 0.3], 6))
    if depth > 0:
        for t, turn in ((0.35, 0.7), (0.65, -0.5), (0.85, 0.5)):
            p = root.lerp(tip, t)
            nd = (d + Vector((0, -turn * 0.6, 0.9))).normalized()
            out.append(rod([p, p + nd * length * 0.45], [r * 0.65, r * 0.18], 5))


ant = []
for s in (1, -1):
    root = Vh(s * 0.1, -0.02, 0.15)
    d0 = Vector((s * 1.0, 0.08, 0.4)).normalized()
    antler_branch(root, d0, 0.2 * H, 0.024 * H, 0, ant)
    p1 = root + d0 * 0.2 * H
    d1 = Vector((s * 0.45, 0.05, 1.0)).normalized()
    antler_branch(p1, d1, 0.22 * H, 0.018 * H, 1, ant)
    p2 = p1 + d1 * 0.22 * H
    d2 = Vector((-s * 0.25, 0.0, 1.0)).normalized()
    ant.append(rod([p2, p2 + d2 * 0.1 * H], [0.012 * H, 0.003 * H], 5))
    for t in (0.3, 0.6):
        pp = root + d0 * 0.22 * H * t
        ant.append(rod([pp, pp + Vector((s * 0.02 * H, -0.06 * H, 0.09 * H))], [0.011 * H, 0.003 * H], 5))
b.add('prop_deerMaskAntlers', merge(*ant), antler, region='head', subdiv=0)
tw = []
for s in (1, -1):  # o fio amarrando a base das galhadas
    c = Vh(s * 0.12, -0.02, 0.16)
    for i in range(3):
        tw.append(rod([c + Vector((math.cos(a) * 0.022 * H, math.sin(a) * 0.022 * H, (i - 1) * 0.012 * H + 0.004 * H * math.sin(a))) for a in [j / 12 * TAU for j in range(13)]], 0.003 * H, 4, caps=False))
b.add('prop_deerMaskTwine', merge(*tw), twine, region='head', subdiv=0)
b.group('prop_deerMask', 'prop_deerMask')

# ================================================================ FANTASIADA: prop_cowl — o capuz enorme verde-oliva
# por trás do crânio, enrolado no pescoço e caindo nos ombros em dobras grossas
Cw = Sculpt()
Cw.ell(Vh(0, 0.05, 0.07), (0.185 * H, 0.2 * H, 0.2 * H))           # o capuz por trás e por cima do crânio
Cw.ell(Vh(0, 0.0, -0.06), (0.17 * H, 0.17 * H, 0.14 * H))
for k in range(14):  # o pano enrolado no pescoço e caindo nos ombros em dobras grossas, desencontradas
    a0 = k / 14 * TAU + random.uniform(-0.15, 0.15)
    z = HC.z - 0.2 * H - random.uniform(0, 0.05) * H
    r = random.uniform(0.17, 0.21) * H
    Cw.ell(Vector((math.sin(a0) * r, -math.cos(a0) * r * 0.8 + 0.02 * H, z)), (random.uniform(0.08, 0.11) * H, 0.08 * H, random.uniform(0.06, 0.09) * H))
# a volta do pano na frente do pescoço (o "cachecol" do capuz), caindo um pouco no peito
Cw.chain([Vh(math.sin(a) * 0.19, -math.cos(a) * 0.15 + 0.01, -0.24 - 0.05 * math.cos(a)) for a in [(-0.5 + i / 10) * 2.4 for i in range(11)]], 0.06 * H, step=0.4)
Cw.ell(Vh(0, -0.2, 0.0), (0.12 * H, 0.14 * H, 0.17 * H), neg=True)  # a abertura do rosto (o crânio aparece)
b.add('prop_cowlCloth', Cw.mesh(res=0.01, smooth=3, disp=lambda p: 0.006 * H * (ridge(n3(p, 5) * 5 + p.z / H * 12, 2) - 0.4), target=5000), robe, region='torso', weight_fn=cape_weights, subdiv=0)
b.group('prop_cowl', 'prop_cowl')

# ================================================================ FANTASIADA: prop_robe — a capa verde-oliva longa e
# ESFARRAPADA dos ombros até os tornozelos, a barra em tiras
prow = []
for v in VS:
    row = []
    for j in range(97):
        u = 0.06 + 0.88 * j / 96
        p = cape_pt(u * TAU, v, 1.1, 0.16 * H, 1.06)
        if v > 0.999:
            p = p + Vector((0, 0, -tatter(u, 0.16 * H, 60)))
        elif v > 0.85:
            p = p + Vector((0, 0, -tatter(u, 0.16 * H, 60) * (v - 0.85) / 0.15))
        row.append(p)
    prow.append(row)
po = b.add('prop_robeCloth', shell_grid(prow, 0.007 * H), robe, region='torso', weight_fn=cape_weights, subdiv=0)
relief(po, lambda p: 0.008 * H * (ridge(math.atan2(p.x, p.y) * 9 + n3(p, 9) * 1.5, 2) - 0.35) * smoothstep(top, top - 0.4 * H, p.z))
b.group('prop_robe', 'prop_robe')

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'zuri.blend'), check_existing=False)
