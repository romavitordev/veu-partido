"""
GWAYNE Ó DOIRNÁIN — A Vigília (Treb Ciach, Irlanda, 890) — public/models/gwayne.glb.
Referências (wiki "Gwayne Ó Doirnáin", artes de frente e de costas, normal e fantasiado; notas em lore/A-VIGILIA.md):
  - ~1,75 m, ombros largos; cabelo ESCURO médio REPARTIDO NO MEIO, e uma TRANÇA LOIRA (piebaldismo) do lado esquerdo
    dele, amarrada com um pano AZULADO e com uma CONTA de espiral na ponta; olhos azuis, nariz grande, cicatriz na
    sobrancelha esquerda (no rosto: face_gwayne);
  - MANTO verde-escuro, quase preto, com CAPUZ (abaixado, a gola de pano em volta do pescoço), preso por um BROCHE
    PENANULAR dourado; por baixo a TÚNICA VERDE até o joelho, aberta embaixo na frente, sobre a CAMISA MARROM;
  - o pano VERMELHO-XADREZ amarrado na cintura, os cintos, a bolsa de couro, a adaga atravessada e a ALJAVA na cintura
    (flechas de penas vermelhas); braceletes de couro PRETO amarrados, a OMBREIRA de couro marrom no ombro direito;
  - calças BEGE folgadas enfiadas nas faixas de couro da canela, sapatos pretos baixos, luvas pretas.
FANTASIADO (O Morto que Caminha, a Transformação): o MESMO modelo ligando prop_skullMask (o CRÂNIO de cão/lobo com as
presas, as órbitas fundas e as PENAS VERMELHAS do lado), prop_pelt (a PELE de pelo cinza-escuro por cima da cabeça e dos
ombros, descendo nas costas) e prop_poncho (a capa verde-oliva longa e ESFARRAPADA); o cabelo e a gola do capuz somem.
O arco (que era da Gwyneth) e a adaga são montados em código (models/vigiliaProps.js).
  node tools/blender/build.mjs gwayne   → public/models/gwayne.glb (+ tools/blender/fonte/gwayne.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'gwayne.glb'
random.seed(869)  # Gwayne e Gwyneth nasceram em 869

b = Builder(width=1.04, bulk=1.0, height=0.98)  # ~1,75 m, ombros largos
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

SKIN = '#e6b89a'
M = {
    'skin': material('skin_gwayne', SKIN, 0.8),
    'face': material('face_gwayne', '#ffffff', 0.8),
    'torso': material('tunic_gwayne', '#3e4a2c', 0.9),   # a túnica verde
    'arm': material('shirt_gwayne', '#5a3e2a', 0.9),     # as mangas da camisa marrom
    'forearm': material('bracer_gwayne', '#1c1a1a', 0.6),  # os braceletes de couro preto
    'hand': material('glove_gwayne', '#221e1e', 0.7),     # as luvas pretas
    'legs': material('pants_gwayne', '#a89a84', 0.9),     # as calças bege
    'feet': material('shoe_gwayne', '#1a1616', 0.7),
}
tunic = M['torso']
tunic_dk = material('tunic_dk_gwayne', '#2c3620', 0.9)    # a barra da túnica
leather = material('belt_gwayne', '#4a3222', 0.6)
leather_dk = material('wrap_gwayne', '#2a1e16', 0.7)
plaid = material('plaid_gwayne', '#ffffff', 0.9)          # o pano vermelho-xadrez (textura)
cloak = material('cloak_gwayne', '#20261c', 0.95)         # o manto verde quase preto
gold = material('gold_gwayne', '#c8a040', 0.35, metal=0.8)
steel = material('steel_gwayne', '#b8b4ae', 0.35, metal=0.8)
hairm = material('hair_gwayne', '#2e2018', 0.75)
blond = material('braid_gwayne', '#d8bc78', 0.75)
blue = material('tie_gwayne', '#4a6aa0', 0.85)            # o pano azulado da trança
bead = material('bead_gwayne', '#c03a2a', 0.4)            # a conta com a espiral
wood = material('wood_gwayne', '#5a3e26', 0.8)
fletch = material('fletch_gwayne', '#a82424', 0.8)        # as penas vermelhas das flechas
sole = material('sole_gwayne', '#120e0c', 0.8)
bone = material('bone_gwayne', '#d8ceb0', 0.7)            # o crânio da fantasia
bone_dk = material('bone_dk_gwayne', '#1a1614', 0.8)
pelt = material('pelt_gwayne', '#2a2a30', 0.95)           # a pele de pelo cinza-escuro
pelt_lt = material('pelt_lt_gwayne', '#46464e', 0.95)
poncho = material('poncho_gwayne', '#ffffff', 0.95)       # a capa oliva esfarrapada (textura)
feather = material('feather_gwayne', '#b02020', 0.7)

PREVIEW = {'face_gwayne': SKIN, 'plaid_gwayne': '#8a2a2a', 'poncho_gwayne': '#4a4e30'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.155), (0.0, 0.152), (0.17, 0.142), (0.36, 0.17), (0.47, 0.19), (0.57, 0.12), (0.63, 0.064)],
            arm_r=(0.056, 0.049, 0.041), leg_r=(0.1, 0.084, 0.05), head_r=(0.132, 0.146, 0.158))
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))


def part(name):
    return next(o for o in b.parts if o.name == name)


# ================================================================ a TÚNICA VERDE do peito até o joelho, aberta embaixo
# na frente (a fenda), com a barra mais escura
TU = [(-0.44, 0.205, 0.17), (-0.34, 0.195, 0.162), (-0.22, 0.184, 0.152), (-0.1, 0.174, 0.143), (0.0, 0.168, 0.138),
      (0.12, 0.16, 0.132), (0.24, 0.164, 0.13), (0.36, 0.184, 0.14), (0.46, 0.198, 0.148), (0.54, 0.178, 0.134),
      (0.6, 0.128, 0.104)]


def tunic_r(dz):
    for (z0, x0, y0), (z1, x1, y1) in zip(TU, TU[1:]):
        if z0 <= dz <= z1:
            t = (dz - z0) / (z1 - z0)
            return x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
    return (TU[0][1], TU[0][2]) if dz < TU[0][0] else (TU[-1][1], TU[-1][2])


def on_body(a, dz, off=0.0):
    rx, ry = tunic_r(dz)
    return Vector((math.sin(a) * (rx * H + off), -math.cos(a) * (ry * H + off), hz + dz * H))


rows = []
for dz, rx, ry in TU:
    gap = 0.0
    if dz < -0.2:  # a fenda da frente, aberta embaixo
        gap = 0.07 * (-0.2 - dz) / 0.24
    if dz > 0.52:  # o decote redondo
        gap = 0.12 + (dz - 0.52) * 1.5
    rows.append(ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 40))
tu = b.add('tunic', shell_grid(rows, 0.008), tunic, region='torso', subdiv=1)
relief(tu, lambda p: 0.003 * H * (ridge(math.atan2(p.x, -p.y) * 7 + n3(p, 6) * 2, 2) - 0.4) * smoothstep(hz, hz - 0.3 * H, p.z))
# a barra escura: uma faixa na borda de baixo e subindo pela fenda
hem = []
for j in range(41):
    u = 0.07 + 0.86 * j / 40
    hem.append(on_body(u * TAU, -0.43, 0.004 * H))
b.add('tunicHem', rod(hem, 0.012 * H, 5, caps=False), tunic_dk, region='torso', subdiv=0)
for s in (1, -1):
    b.add(f'tunicSlit{s}', rod([on_body(s * 0.07 * TAU, -0.43, 0.004 * H), on_body(s * 0.035 * TAU, -0.32, 0.004 * H), on_body(s * 0.005, -0.2, 0.004 * H)], 0.01 * H, 5), tunic_dk, region='torso', subdiv=0)
# a gola da camisa marrom aparecendo no decote
b.add('shirtCollar', rod([on_body(a, 0.6, -0.004 * H) for a in [(-0.5 + j / 20) * 1.1 for j in range(21)]], 0.014 * H, 6, caps=False), M['arm'], region='chest', subdiv=0)

# ================================================================ o PANO VERMELHO-XADREZ amarrado na cintura, os CINTOS,
# a BOLSA de couro, a ADAGA atravessada e a ALJAVA de flechas de penas vermelhas
wrows = [ring_pts(hz + dz * H, (tunic_r(dz)[0] + 0.012) * H, (tunic_r(dz)[1] + 0.012) * H, 0, TAU, 44) for dz in (0.02, 0.07, 0.12, 0.16)]
pw = b.add('plaidWrap', shell_grid(wrows, 0.012 * H), plaid, region='torso', subdiv=0)
relief(pw, lambda p: 0.004 * H * (ridge(math.atan2(p.x, -p.y) * 6 + (p.z - hz) / H * 30 + n3(p, 8), 2) - 0.4))
# o nó do pano do lado esquerdo dele e as pontas caídas
kn = Sculpt()
kn.ell(on_body(0.9, 0.08, 0.03 * H), (0.035 * H, 0.03 * H, 0.03 * H))
for k, dx in enumerate((-0.01, 0.02)):
    c = on_body(0.9 + dx * 4, 0.06, 0.035 * H)
    kn.chain([c, c + Vector((dx * H, -0.01 * H, -0.08 * H)), c + Vector((dx * 1.6 * H, -0.012 * H, -0.15 * H))], [0.022 * H, 0.02 * H, 0.014 * H], step=0.4)
b.add('plaidKnot', kn.mesh(res=0.006, smooth=2, target=900), plaid, region='torso', subdiv=0)
for k, (dz, tilt) in enumerate(((0.0, 0.0), (-0.05, 0.03))):
    ring = []
    for i in range(33):
        a = i / 32 * TAU
        rx, ry = tunic_r(dz)
        ring.append((math.sin(a) * (rx + 0.016) * H, -math.cos(a) * (ry + 0.016) * H, hz + dz * H + tilt * H * math.sin(a)))
    b.add(f'belt{k}', rod(ring, 0.015 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), leather, region='torso', subdiv=0)
    b.add(f'buckle{k}', box(tuple(on_body(0.1 - 0.2 * k, dz, 0.02 * H)), (0.036 * H, 0.012 * H, 0.03 * H), bevel=0.003), steel, region='torso', subdiv=0)
# a BOLSA do lado esquerdo dele, pendurada no cinto
pc = on_body(1.15, -0.06, 0.04 * H)
b.add('pouch', box(tuple(pc), (0.07 * H, 0.045 * H, 0.085 * H), bevel=0.012), leather, region='torso', subdiv=1)
b.add('pouchFlap', box(tuple(pc + Vector((0, -0.006 * H, 0.03 * H))), (0.074 * H, 0.05 * H, 0.03 * H), bevel=0.008), leather_dk, region='torso', subdiv=0)
# a ADAGA atravessada na frente, de bainha marrom (a da mão vem em código)
d0 = on_body(-0.45, 0.03, 0.03 * H)
d1 = on_body(0.35, -0.02, 0.03 * H)
b.add('dagSheath', rod([d0, d0.lerp(d1, 0.5), d1], [0.016 * H, 0.015 * H, 0.006 * H], 6), leather_dk, region='torso', subdiv=0)
dg = d0 + (d0 - d1).normalized() * 0.06 * H
b.add('dagGrip', rod([d0, dg], 0.01 * H, 6), leather, region='torso', subdiv=0)
b.add('dagPommel', ellipsoid(tuple(dg), (0.013 * H, 0.013 * H, 0.013 * H), 8, 6), steel, region='torso', subdiv=0)
# a ALJAVA no quadril direito dele, inclinada para a frente, com as flechas de penas vermelhas para fora
q0 = on_body(-1.25, -0.2, 0.06 * H)
q1 = q0 + Vector((-0.02 * H, -0.12 * H, 0.32 * H))
b.add('quiver', rod([q0, q0.lerp(q1, 0.5), q1], [0.034 * H, 0.038 * H, 0.04 * H], 10), leather_dk, region='torso', subdiv=0)
b.add('quiverRim', rod([q1 + Vector((math.cos(a) * 0.041 * H, math.sin(a) * 0.041 * H * 0.3, 0)) for a in [j / 12 * TAU for j in range(13)]], 0.006 * H, 4, caps=False), leather, region='torso', subdiv=0)
qd = (q1 - q0).normalized()
sh, fl = [], []
for k in range(9):
    a = k / 9 * TAU
    base = q1 + Vector((math.cos(a) * 0.022 * H, math.sin(a) * 0.022 * H, 0)) - qd * 0.03 * H
    tip = base + (qd + Vector((math.cos(a) * 0.12, math.sin(a) * 0.12, 0))).normalized() * 0.1 * H
    sh.append(rod([base, tip], 0.004 * H, 4))
    fd = (tip - base).normalized()
    side = fd.cross(Vector((0, 0, 1))).normalized() if abs(fd.z) < 0.95 else Vector((1, 0, 0))
    fl.append(rod([tip - fd * 0.06 * H, tip - fd * 0.02 * H, tip], [0.002 * H, 0.014 * H, 0.004 * H], 4, flat=((lambda q, s_=side: s_), 0.2)))
b.add('arrowShafts', merge(*sh), wood, region='torso', subdiv=0)
b.add('arrowFletch', merge(*fl), fletch, region='torso', subdiv=0)
# a alça da aljava cruzando o peito até o ombro esquerdo dele
b.add('quiverStrap', rod([q0 + Vector((0, 0.02 * H, 0.05 * H)), on_body(-0.9, 0.2, 0.02 * H), on_body(-0.3, 0.42, 0.02 * H), on_body(0.4, 0.56, 0.01 * H), on_body(1.4, 0.58, 0.0)], 0.009 * H, 5, flat=(outward((0, 0)), 0.3)), leather, region='torso', subdiv=0)

# ================================================================ os BRACELETES de couro preto amarrados e a OMBREIRA
for side in ('L', 'R'):
    e, w = sk['e' + side], sk['hand' + side]
    d = (w - e).normalized()
    b.add('bracer' + side, rod([e.lerp(w, 0.18), e.lerp(w, 0.6), e.lerp(w, 0.96)], [0.054 * H, 0.05 * H, 0.046 * H], 10), M['forearm'], region='e' + side, subdiv=0)
    up = Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0))
    u1 = d.cross(up).normalized()
    u2 = d.cross(u1).normalized()
    for i in range(4):  # o cadarço cruzado
        c = e.lerp(w, 0.26 + 0.18 * i)
        r = (0.056 - 0.003 * i) * H
        ring = [c + (u1 * math.cos(a) + u2 * math.sin(a)) * r + d * 0.014 * H * math.sin(a) for a in [j / 14 * TAU for j in range(15)]]
        b.add(f'bracerLace{side}{i}', rod(ring, 0.003 * H, 4, caps=False), leather, region='e' + side, subdiv=0)
# a ombreira de couro marrom no ombro DIREITO dele (-x)
s_ = sk['sR']
ob = Sculpt()
ob.ell(s_ + Vector((-0.012 * H, 0.0, 0.035 * H)), (0.075 * H, 0.08 * H, 0.045 * H))
ob.ell(s_ + Vector((-0.012 * H, 0.0, 0.01 * H)), (0.062 * H, 0.068 * H, 0.04 * H), neg=True)
b.add('pauldron', ob.mesh(res=0.006, smooth=2, target=900), leather, region='sR', subdiv=0)

# ================================================================ as CALÇAS bege folgadas presas nas FAIXAS de couro da
# canela e os SAPATOS pretos baixos
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    # o pano fofo sobrando por cima das faixas, logo abaixo do joelho
    Pc = Sculpt()
    c = k.lerp(f, 0.12)
    for j in range(14):
        a = j / 14 * TAU
        Pc.ell(c + Vector((math.sin(a) * 0.08 * H, -math.cos(a) * 0.078 * H, 0.015 * H)), (0.036 * H, 0.036 * H, 0.05 * H))
    b.add('pantPuff' + side, Pc.mesh(res=0.007, smooth=2, target=700), M['legs'], region='k' + side, subdiv=0)
    # as faixas de couro enroladas do tornozelo até embaixo do joelho
    Wr = Sculpt()
    Wr.chain([k.lerp(f, 0.16), k.lerp(f, 0.6), f + Vector((0, 0.005 * H, 0.06 * H))], [0.066 * H, 0.054 * H, 0.05 * H], step=0.4)
    b.add('legWrap' + side, Wr.mesh(res=0.007, smooth=3, target=900), leather_dk, region='k' + side, subdiv=0)
    for i in range(8):
        t = 0.18 + i * 0.085
        cc = k.lerp(f, t)
        r = 0.068 * H - i * 0.0022 * H
        tilt = 0.026 * H * (1 if i % 2 else -1)
        ring = [(cc.x + math.sin(a) * r, cc.y - math.cos(a) * r, cc.z + tilt * math.sin(a)) for a in [j / 18 * TAU for j in range(19)]]
        b.add(f'legBand{side}{i}', rod(ring, 0.006 * H, 4, caps=False), leather, region='k' + side, subdiv=0)
    B = Sculpt()  # o sapato baixo de couro
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.052 * H, 0.115 * H, 0.04 * H))
    B.ell(f + Vector((0, -0.13 * H, 0.022 * H)), (0.045 * H, 0.05 * H, 0.028 * H))
    B.ell(f + Vector((0, 0.035 * H, 0.04 * H)), (0.048 * H, 0.048 * H, 0.045 * H))
    b.add('shoe' + side, B.mesh(res=0.007, smooth=3, target=900), M['feet'], region='k' + side, subdiv=0)
    b.add('shoeSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.012 * H), (0.1 * H, 0.24 * H, 0.024 * H), bevel=0.006), sole, region='k' + side, subdiv=0)

# ================================================================ o MANTO verde quase preto dos ombros até a canela,
# aberto na frente, com o CAPUZ abaixado (a gola de pano em volta do pescoço) e o BROCHE PENANULAR dourado


def cape_pt(a, v, out=1.0, low=0.3 * H):
    V0 = 0.22
    th = min(1.0, v / V0) * math.pi / 2
    side = abs(math.sin(a))
    kk = 0.55 + 0.45 * side
    dv = max(0.0, v - V0) / (1 - V0)
    rx = 0.12 * H + 0.25 * H * math.sin(th) * kk + dv * 0.13 * H
    ry = 0.11 * H + 0.1 * H * math.sin(th) + dv * 0.09 * H
    fold = 1 + 0.08 * min(1.0, v * 2.5) * (ridge(a * 4.5 + v * 1.2 + n3(Vector((a, v, 0)), 3)) - 0.4)
    z0 = top + 0.11 * H - 0.17 * H * (1 - math.cos(th)) * kk
    z = z0 - dv * (z0 - low)
    return Vector((math.sin(a) * rx * fold * out / b.k_tx, -math.cos(a) * ry * fold * out / b.k_ty, z))


def tatter(u, depth, n=40):
    k = u * n
    tooth = abs((k % 1.0) - 0.5) * 2
    seed = math.floor(k)
    ln = 0.4 + 0.6 * ((math.sin(seed * 12.9898) * 43758.5453) % 1.0)
    return depth * ln * (1 - tooth ** 2)


GAP = 0.1


def gap_at(v):
    return GAP + 0.03 * max(0.0, 1 - v * 3)


def cape_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.16 * H, 0.32 * H, abs(p.x)) * smoothstep(top - 0.55 * H, top - 0.12 * H, p.z) * 0.5
    w_hip = smoothstep(hz + 0.12 * H, hz - 0.35 * H, p.z) * (1 - w_arm) * 0.75
    return {'s' + side: w_arm, 'hips': w_hip, 'sp': max(0.0, 1 - w_arm - w_hip)}


VS = [0.22 * k / 8 for k in range(8)] + [0.22 + 0.78 * k / 18 for k in range(0, 19)]
cape_rows = []
for v in VS:
    row = []
    for j in range(73):
        u = gap_at(v) + (1 - 2 * gap_at(v)) * j / 72
        p = cape_pt(u * TAU, v)
        if v > 0.9:  # a barra puída de leve
            p = p + Vector((0, 0, -tatter(u, 0.04 * H) * (v - 0.9) / 0.1))
        row.append(p)
    cape_rows.append(row)
cp = b.add('cloak', shell_grid(cape_rows, 0.008 * H), cloak, region='torso', weight_fn=cape_weights, subdiv=0)
relief(cp, lambda p: 0.005 * H * (ridge(math.atan2(p.x, p.y) * 8 + n3(p, 9) * 1.5, 2) - 0.35) * smoothstep(top, top - 0.4 * H, p.z))
# o CAPUZ abaixado: o pano grosso enrolado em volta do pescoço e caindo nas costas
Hd = Sculpt()
cowl = [cape_pt(a * TAU, 0.05, 1.0) for a in [gap_at(0.05) + (1 - 2 * gap_at(0.05)) * i / 24 for i in range(25)]]
Hd.chain(cowl, 0.032 * H, step=0.5)
for i in range(7):  # o capuz dobrado nas costas
    a = math.pi + (i / 6 - 0.5) * 1.6
    Hd.ell(cape_pt(a, 0.12, 1.06) + Vector((0, 0.02 * H, -0.03 * H)), (0.055 * H, 0.035 * H, 0.06 * H))
b.add('prop_hoodCowl', Hd.mesh(res=0.009, smooth=2, disp=lambda p: 0.004 * H * (ridge(n3(p, 6) * 6, 2) - 0.4), target=3500), cloak, region='torso', weight_fn=cape_weights, subdiv=0)
# o BROCHE PENANULAR dourado no peito direito dele: o anel aberto e o alfinete atravessado
bc = cape_pt(-gap_at(0.12) * TAU - 0.18, 0.12, 1.06) + Vector((0, -0.01 * H, -0.02 * H))
ringp = [bc + Vector((math.cos(a) * 0.03 * H, -0.004 * H, math.sin(a) * 0.03 * H)) for a in [0.5 + j / 20 * (TAU - 1.0) for j in range(21)]]
br = [rod(ringp, 0.0055 * H, 5, caps=True)]
for s in (1, -1):
    br.append(ellipsoid(tuple(ringp[0 if s > 0 else -1]), (0.009 * H, 0.008 * H, 0.009 * H), 6, 5))
br.append(rod([bc + Vector((-0.045 * H, -0.006 * H, 0.03 * H)), bc + Vector((0.045 * H, -0.006 * H, -0.03 * H))], 0.003 * H, 4))
b.add('brooch', merge(*br), gold, region='chest', subdiv=0)

# ================================================================ CABELO escuro médio REPARTIDO NO MEIO, caindo até a
# mandíbula e cobrindo as orelhas, e a TRANÇA LOIRA do lado esquerdo dele (+x) com o pano azulado e a conta de espiral
_hd = part('head')
_dg = bpy.context.evaluated_depsgraph_get()
_bvh = BVHTree.FromObject(_hd, _dg)
_mw = _hd.matrix_world
_mwi = _mw.inverted()


def on_head(a, el, off):
    """a = ângulo a partir da frente (+ = lado esquerdo dele, +x), el = elevação a partir do equador da cabeça"""
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    o = _mwi @ (HC + d * 0.6 * H)
    hit = _bvh.ray_cast(o, (_mwi.to_3x3() @ -d).normalized())
    if hit[0] is None:
        return None
    return _mw @ hit[0] + (_mw.to_3x3() @ hit[1]).normalized() * off


Hr = Sculpt()
# a CALOTA contínua rente à cabeça (o método da Cindy: elipsoides colados, sem touca alta) e a nuca coberta
Hr.ell(Vh(0, 0.012, 0.035), (0.146 * H, 0.157 * H, 0.142 * H))
Hr.ell(Vh(0, 0.05, -0.03), (0.138 * H, 0.125 * H, 0.12 * H))
Hr.ell(Vh(0, 0.06, -0.085), (0.12 * H, 0.1 * H, 0.08 * H))
# as mechas que saem da RISCA DO MEIO e descem pelos lados até a mandíbula, cobrindo as orelhas (rentes: on_head)
for s in (1, -1):
    for k in range(9):
        q0 = on_head(s * (0.06 + 0.07 * k), 1.25 - 0.04 * k, 0.012 * H)
        q1 = on_head(s * (0.6 + 0.09 * k), 0.5 - 0.03 * k, 0.016 * H)
        q2 = on_head(s * (1.15 + 0.07 * k), -0.2 - 0.05 * (k % 3), 0.018 * H)
        if q0 and q1 and q2:
            Hr.chain([q0, q1, q2, q2 + Vector((0, 0.004 * H, -0.045 * H))], [0.016 * H, 0.018 * H, 0.016 * H, 0.006 * H], step=0.45)
# atrás: as pontas até a nuca
for k in range(11):
    a = math.pi + (k / 10 - 0.5) * 2.2
    q = on_head(a, -0.05, 0.016 * H)
    if q:
        Hr.chain([q, q + Vector((0, 0.008 * H, -0.06 * H))], [0.022 * H, 0.006 * H], step=0.45)
Hr.ell(Vh(0, -0.17, -0.05), (0.1 * H, 0.08 * H, 0.12 * H), neg=True)  # o rosto livre


def strands(p):
    # as mechas penteadas para os lados a partir da risca do meio
    a = math.atan2(p.x - HC.x, -(p.y - HC.y))
    return 0.0022 * H * (ridge(a * 26 + (p.z - HC.z) / H * 8 + n3(p, 30), 2) - 0.4)


b.add('prop_hairCap', Hr.mesh(res=0.0055, smooth=2, disp=strands, target=8000), hairm, region='head', subdiv=0)
# a risca do meio: um sulco fino da testa até o alto
b.add('prop_hairPart', rod([on_head(0, 0.8, 0.016 * H), on_head(0, 1.15, 0.02 * H), on_head(0, 1.45, 0.02 * H)], 0.0025 * H, 4), M['skin'], region='head', subdiv=0)
# a TRANÇA LOIRA: da têmpora esquerda dele até o peito, três gomos torcidos
t0 = on_head(0.95, 0.25, 0.03 * H)
path = [t0, t0 + Vector((0.025 * H, -0.03 * H, -0.08 * H)), t0 + Vector((0.035 * H, -0.05 * H, -0.18 * H)),
        t0 + Vector((0.03 * H, -0.065 * H, -0.24 * H))]
bd = Sculpt()
N = 36
for j in range(N + 1):
    t = j / N
    kk = min(int(t * 3), 2)
    c = path[kk].lerp(path[kk + 1], t * 3 - kk)
    for s in range(3):
        ang = t * 7 * math.tau + s * math.tau / 3
        bd.ell(c + Vector((math.cos(ang) * 0.0045 * H, math.sin(ang) * 0.0045 * H, 0)), 0.0065 * H * (1 - 0.3 * t))
b.add('prop_hairBraid', bd.mesh(res=0.004, smooth=1, target=2200), blond, region='head', subdiv=0)
tie = path[3] + Vector((0, 0, 0.012 * H))
b.add('prop_hairTie', rod([tie + Vector((math.cos(a) * 0.0075 * H, math.sin(a) * 0.0075 * H, 0)) for a in [j / 10 * TAU for j in range(11)]], 0.005 * H, 4, caps=False), blue, region='head', subdiv=0)
b.add('prop_hairBead', ellipsoid(tuple(path[3] + Vector((0, 0, -0.016 * H))), (0.009 * H, 0.009 * H, 0.011 * H), 8, 6), bead, region='head', subdiv=0)
b.group('prop_hair', 'prop_hair')

# ================================================================ FANTASIADO: prop_skullMask — o CRÂNIO de cão/lobo cor
# de osso: a calota por cima da cabeça, o FOCINHO longo para a frente e para baixo, as ÓRBITAS fundas e escuras, as
# PRESAS da arcada de cima e as PENAS VERMELHAS do lado esquerdo dele (à direita de quem olha)
mk = Sculpt()
mk.ell(Vh(0, -0.02, 0.05), (0.15 * H, 0.17 * H, 0.15 * H))           # a calota
mk.ell(Vh(0, -0.1, -0.02), (0.13 * H, 0.11 * H, 0.12 * H))           # as maçãs
snout = [Vh(0, -0.15, -0.02), Vh(0, -0.24, -0.07), Vh(0, -0.32, -0.12), Vh(0, -0.37, -0.15)]
mk.chain(snout, [0.085 * H, 0.068 * H, 0.052 * H, 0.04 * H], step=0.4)
for s in (1, -1):
    mk.ell(Vh(s * 0.06, -0.16, 0.035), (0.042 * H, 0.04 * H, 0.038 * H), neg=True)   # as órbitas
    mk.ell(Vh(s * 0.016, -0.385, -0.13), (0.014 * H, 0.02 * H, 0.012 * H), neg=True)  # as narinas
mk.ell(Vh(0, -0.26, -0.19), (0.08 * H, 0.16 * H, 0.04 * H), neg=True)    # sem mandíbula: a arcada de cima termina aqui
b.add('prop_skullMaskBone', mk.mesh(res=0.006, smooth=3, disp=lambda p: 0.0018 * H * n3(p, 26), target=3200), bone, region='head', subdiv=0)
ey = []
for s in (1, -1):
    ey.append(ellipsoid(tuple(Vh(s * 0.058, -0.14, 0.035)), (0.032 * H, 0.016 * H, 0.03 * H), 10, 6))
    ey.append(ellipsoid(tuple(Vh(s * 0.016, -0.375, -0.13)), (0.011 * H, 0.008 * H, 0.009 * H), 6, 5))
b.add('prop_skullMaskDark', merge(*ey), bone_dk, region='head', subdiv=0)
fg = []
for k, (s, x, y, ln) in enumerate(((1, 0.05, -0.31, 0.055), (-1, 0.05, -0.31, 0.055), (1, 0.03, -0.35, 0.03), (-1, 0.03, -0.35, 0.03),
                                   (1, 0.06, -0.24, 0.03), (-1, 0.06, -0.24, 0.03))):
    p0 = Vh(s * x, y, -0.15)
    fg.append(rod([p0, p0 + Vector((0, -0.004 * H, -ln * H))], [0.008 * H, 0.0015 * H], 5))
b.add('prop_skullMaskFangs', merge(*fg), bone, region='head', subdiv=0)
fe = []
for k, dx in enumerate((0.0, 0.025)):
    c = Vh(0.13 + dx * 0.3, -0.08 - dx, 0.0)
    ln = (0.2 - 0.03 * k) * H
    fe.append(rod([c, c + Vector((0.01 * H, -0.004 * H, -ln * 0.5)), c + Vector((0.016 * H, -0.002 * H, -ln))],
                  [0.004 * H, 0.016 * H, 0.002 * H], 5, flat=((lambda p: Vector((1, 0, 0))), 0.25)))
b.add('prop_skullMaskFeathers', merge(*fe), feather, region='head', subdiv=0)
b.group('prop_skullMask', 'prop_skullMask')

# ================================================================ FANTASIADO: prop_pelt — a PELE de pelo cinza-escuro por
# cima da cabeça (atrás do crânio) e caindo pelos ombros e pelas costas, com as mechas desgrenhadas na borda
Pl = Sculpt()
Pl.ell(Vh(0, 0.02, 0.06), (0.19 * H, 0.2 * H, 0.17 * H))
for k in range(8):
    v = k / 7
    z = HC.z - 0.08 * H - v * 0.5 * H
    rx = (0.16 + 0.2 * math.sin(min(1.0, v / 0.5) * math.pi / 2)) * H
    ry = (0.13 + 0.07 * math.sin(min(1.0, v / 0.5) * math.pi / 2)) * H
    for i in range(22):
        a = TAU * i / 22
        if math.cos(a) > 0.2 - 0.5 * v and v < 0.6:
            continue  # a frente fica aberta (o crânio e o peito)
        if math.cos(a) > -0.2 and v >= 0.6:
            continue  # embaixo, só nas costas e nos lados
        Pl.ell(Vector((math.sin(a) * rx, -math.cos(a) * ry + 0.03 * H, z)), 0.07 * H)
Pl.ell(Vh(0, -0.17, -0.04), (0.12 * H, 0.1 * H, 0.14 * H), neg=True)  # o rosto (o crânio cobre)


def shag(p):
    return 0.01 * H * (n3(p, 30) + 0.6 * n3(p, 70)) + 0.006 * H * (ridge(p.z / H * 60 + n3(p, 12) * 4, 2) - 0.4)


b.add('prop_peltBody', Pl.mesh(res=0.01, smooth=2, disp=shag, target=6000), pelt, region='torso', weight_fn=cape_weights, subdiv=0)
# as mechas soltas na borda de baixo e dos lados (cinza mais claro e escuro)
la, lb = [], []
for i in range(60):
    a = math.pi + (i / 59 - 0.5) * 4.4
    v = 1.0
    z = HC.z - 0.08 * H - 0.5 * H
    rx, ry = 0.36 * H, 0.2 * H
    root = Vector((math.sin(a) * rx * 0.95, -math.cos(a) * ry + 0.03 * H, z + random.uniform(-0.03, 0.06) * H))
    if math.cos(a) > -0.2:
        root.z += 0.25 * H * smoothstep(-0.2, 0.6, math.cos(a))
    L = random.uniform(0.08, 0.16) * H
    d = Vector((math.sin(a) * 0.15, -math.cos(a) * 0.1, -1)).normalized()
    (lb if i % 3 == 0 else la).append(rod([root, root + d * L * 0.5, root + d * L], [0.014 * H, 0.009 * H, 0.002 * H], 5))
b.add('prop_peltShagA', merge(*la), pelt, region='torso', weight_fn=cape_weights, subdiv=0)
b.add('prop_peltShagB', merge(*lb), pelt_lt, region='torso', weight_fn=cape_weights, subdiv=0)
b.group('prop_pelt', 'prop_pelt')

# ================================================================ FANTASIADO: prop_poncho — a capa verde-oliva longa e
# ESFARRAPADA por cima de tudo, dos ombros até a canela, a barra em tiras compridas
VS2 = [0.22 * k / 8 for k in range(8)] + [0.22 + 0.78 * k / 18 for k in range(0, 19)]
prow = []
for v in VS2:
    row = []
    for j in range(97):
        u = 0.02 + 0.96 * j / 96
        p = cape_pt(u * TAU, v, 1.08, 0.24 * H)
        if v > 0.999:
            p = p + Vector((0, 0, -tatter(u, 0.2 * H, 52)))
        elif v > 0.85:
            p = p + Vector((0, 0, -tatter(u, 0.2 * H, 52) * (v - 0.85) / 0.15))
        row.append(p)
    prow.append(row)
po = b.add('prop_ponchoCloth', shell_grid(prow, 0.007 * H), poncho, region='torso', weight_fn=cape_weights, subdiv=0)
relief(po, lambda p: 0.007 * H * (ridge(math.atan2(p.x, p.y) * 9 + n3(p, 9) * 1.5, 2) - 0.35) * smoothstep(top, top - 0.4 * H, p.z))
b.group('prop_poncho', 'prop_poncho')

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'gwayne.blend'), check_existing=False)
