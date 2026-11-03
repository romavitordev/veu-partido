"""
BEATRICE PORTINARI — Ordo Realitas (Força D, Desconjuração) — public/models/beatrice.glb.
Referência: wiki "Beatrice Portinari" (miniaturas, arte promocional e concept de Desconjuração). 1,69 m, 23 anos,
nariz arrebitado e SARDAS (rosto, mãos, colo); cabelo CASTANHO ondulado, repartido de lado, um pouco abaixo dos ombros.
CAMISETA BRANCA de decote em U com o CORPETE PRETO na cintura; o COLAR DOURADO da LUA (o Pingente da Lua Dourada);
SOBRETUDO escuro um pouco maior que ela, com PELO na gola, aberto, até perto do joelho; a BOLSA DE COURO transversal
(as ferramentas de jardinagem); calça escura e CHINELOS (as miniaturas). Elástico de cabelo no pulso direito, pulseira
de couro no esquerdo. O URUTAU ORPHEU no ombro esquerdo (prop_orpheu: some na forma Existida — ele morre e as
memórias voltam). A balestra e o canivete são montados em código (props.js).
TÉCNICA (a da Carina e do Rubens): corpo pelo Builder; sobretudo e corpete como CASCAS (shell_grid); cabelo, calça,
mangas, gola de pelo e o Orpheu por ESCULTURA de metaballs com relevo; conferido no Blender ao vivo pelo MCP em 4 vistas.
  node tools/blender/build.mjs beatrice   → public/models/beatrice.glb (+ tools/blender/fonte/beatrice.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'beatrice.glb'
random.seed(1690)

b = Builder(width=0.88, bulk=0.9, height=0.94)  # 1,69 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_beatrice', '#eac6aa', 0.8),
    'face': material('face_beatrice', '#ffffff', 0.8),
    'torso': material('shirt_beatrice', '#ece8e0', 0.9),
    'arm': material('skin_beatrice', '#eac6aa', 0.8),
    'hand': material('skin_beatrice', '#eac6aa', 0.8),
    'legs': material('pants_beatrice', '#26262c', 0.9),
    'feet': material('skin_beatrice', '#eac6aa', 0.8),
}
coat = material('coat_beatrice', '#3a3d3a', 0.85)
coat_dk = material('coat_beatrice_dk', '#262826', 0.9)
fur = material('fur_beatrice', '#7a7062', 0.95)
corset = material('corset_beatrice', '#141416', 0.6)
leather = material('leather_beatrice', '#6a4a30', 0.7)
gold = material('gold_beatrice', '#d4a838', 0.35, metal=0.8)
hairm = material('hair_beatrice', '#5a3a26', 0.6)
sole = material('sole_beatrice', '#1a1a1e', 0.8)
owl = material('orpheu_beatrice', '#8a7458', 0.9)
owl_dk = material('orpheu_beatrice_dk', '#4a3a2a', 0.9)
owl_eye = material('orpheu_eye', '#f2c230', 0.3, emission='#f2b020', strength=0.6)
band = material('band_beatrice', '#141416', 0.7)

PREVIEW = {'face_beatrice': '#eac6aa'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.155), (0.0, 0.155), (0.17, 0.134), (0.36, 0.176), (0.47, 0.19), (0.57, 0.108), (0.63, 0.062)],
            arm_r=(0.05, 0.042, 0.036), leg_r=(0.08, 0.06, 0.046), head_r=(0.13, 0.14, 0.154))


def part(name):
    return next(o for o in b.parts if o.name == name)


def chest(p):
    x, y, z = p.x, p.y, p.z - hz
    if y > -0.02:
        return 0.0
    return 0.014 * H * math.exp(-((abs(x) - 0.068 * H) / (0.058 * H)) ** 2) * math.exp(-((z - 0.42 * H) / (0.06 * H)) ** 2)


relief(part('torso'), chest)

# ================================================================ o DECOTE EM U da camiseta: a pele do colo (com as sardas)
tor = part('torso')
ty = min(v.co.y for v in tor.data.vertices if abs(v.co.x) < 0.02 and abs(v.co.z - 1.5 * H) < 0.03 * H)
uz0, uz1 = 1.47 * H, 1.6 * H
vv, vf = [], []
for i in range(5):
    z = uz0 + (uz1 - uz0) * i / 4
    w = 0.058 * H * math.sqrt(max(0.05, i / 4)) + 0.004 * H  # o fundo arredondado do U
    for j in range(5):
        x = -w + 2 * w * j / 4
        vv.append((x, ty - 0.004 * H + 0.08 * (x / H) ** 2, z))
for i in range(4):
    for j in range(4):
        a = i * 5 + j
        vf.append((a, a + 1, a + 6, a + 5))
b.add('chestU', (vv, vf, None), M['skin'], region='chest', subdiv=1)
ue = [(0.062 * H * math.sin(a), ty - 0.003 * H + 0.08 * (0.062 * math.sin(a)) ** 2, uz1 - (uz1 - uz0) * math.cos(a) ** 2 * 1.02) for a in [-1.45 + 2.9 * i / 20 for i in range(21)]]
b.add('shirtHem', rod(ue, 0.005 * H, 5), M['torso'], region='chest', subdiv=0)

# o PINGENTE DA LUA DOURADA: a corrente e o disco com a lua crescente e os dois círculos
b.add('pendantChain', rod([(-0.05 * H, ty + 0.03 * H, 1.62 * H), (-0.025 * H, ty - 0.004 * H, 1.55 * H), (0, ty - 0.008 * H, 1.515 * H),
                           (0.025 * H, ty - 0.004 * H, 1.55 * H), (0.05 * H, ty + 0.03 * H, 1.62 * H)], 0.0022 * H, 4), gold, region='chest', subdiv=0)
pc = Vector((0, ty - 0.012 * H, 1.5 * H))
b.add('pendantMoon', ellipsoid(tuple(pc), (0.016 * H, 0.004 * H, 0.016 * H), 14, 6), gold, region='chest', subdiv=0)
moon = [(pc.x + math.sin(a) * 0.009 * H, pc.y - 0.004 * H, pc.z + math.cos(a) * 0.009 * H) for a in [0.6 + 4.6 * i / 14 for i in range(15)]]
b.add('pendantCrescent', rod(moon, 0.0026 * H, 4), coat_dk, region='chest', subdiv=0)

# ================================================================ o CORPETE PRETO na cintura, por cima da camiseta
CS = [(0.07, 0.15, 0.112), (0.15, 0.142, 0.106), (0.23, 0.15, 0.11), (0.3, 0.166, 0.118)]
crs = b.add('corset', shell_grid([ring_pts(hz + dz * H, rx * H, ry * H, 0, TAU, 32) for dz, rx, ry in CS], 0.006), corset, region='torso', subdiv=1)
for i in range(5):  # o cordão cruzado na frente
    z = hz + (0.09 + i * 0.045) * H
    b.add(f'lace{i}', rod([(-0.02 * H, -0.12 * H, z), (0.02 * H, -0.12 * H, z + 0.022 * H)], 0.0025 * H, 4), M['torso'], region='torso', subdiv=0)

# ================================================================ o SOBRETUDO escuro, aberto, um pouco grande para ela
JK = [(0.04, 0.19, 0.142, 0.42), (0.12, 0.184, 0.138, 0.42), (0.24, 0.188, 0.138, 0.44), (0.36, 0.212, 0.15, 0.5),
      (0.46, 0.222, 0.156, 0.54), (0.54, 0.192, 0.138, 0.62), (0.6, 0.128, 0.104, 0.82)]
rows = [ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 32) for dz, rx, ry, gap in JK]
jk = b.add('coat', shell_grid(rows, 0.007), coat, region='torso', subdiv=1)
relief(jk, lambda p: 0.0024 * H * (ridge((p.z - hz) / H * 50 + n3(p, 9) * 2, 2) - 0.4) * (1 if p.z < hz + 0.3 * H else 0.4))
# a SAIA do sobretudo: das ancas até um pouco acima do joelho, abrindo
SK = []
for k in range(7):
    z = hz + 0.06 * H - k * 0.06 * H
    flare = 1 + k * 0.035
    gap = 0.34 + k * 0.035
    SK.append(ring_pts(z, 0.19 * H * flare, 0.142 * H * flare, gap, TAU - gap, 30))
sk_ = b.add('coatSkirt', shell_grid(SK, 0.007), coat, region='skirt', subdiv=1)
relief(sk_, lambda p: 0.005 * H * (ridge(math.atan2(p.x, -p.y) * 6 + n3(p, 7), 2) - 0.4) * min(1, (hz - p.z) / (0.15 * H) + 0.2))
for s in (1, -1):  # as bordas da abertura, do pescoço até a barra
    pts = []
    for dz, rx, ry, gap in reversed(JK):
        a = gap if s > 0 else TAU - gap
        pts.append(Vector((math.sin(a) * (rx + 0.003) * H, -math.cos(a) * (ry + 0.003) * H, hz + dz * H)))
    b.add(f'coatEdge{s}', rod(pts, 0.009 * H, 6, flat=(outward((0, 0)), 0.4)), coat_dk, region='torso', subdiv=0)
    pts = []
    for k in range(7):
        flare = 1 + k * 0.035
        a = (0.34 + k * 0.035) if s > 0 else TAU - (0.34 + k * 0.035)
        pts.append(Vector((math.sin(a) * (0.19 * flare + 0.003) * H, -math.cos(a) * (0.142 * flare + 0.003) * H, hz + 0.06 * H - k * 0.06 * H)))
    b.add(f'coatSkirtEdge{s}', rod(pts, 0.009 * H, 6, flat=(outward((0, 0)), 0.4)), coat_dk, region='skirt', subdiv=0)
flare = 1 + 6 * 0.035
hem = [(math.sin(a) * (0.19 * flare + 0.002) * H, -math.cos(a) * (0.142 * flare + 0.002) * H, hz - 0.3 * H) for a in [0.55 + (TAU - 1.1) * i / 30 for i in range(31)]]
b.add('coatHem', rod(hem, 0.011 * H, 6, flat=(outward((0, 0)), 0.35)), coat_dk, region='skirt', subdiv=0)
# a GOLA DE PELO: tufos em volta dos ombros e do pescoço, aberta na frente
F = Sculpt()
for k in range(3):
    z = 1.53 * H + k * 0.03 * H
    for a in [0.75 + (TAU - 1.5) * i / 18 for i in range(19)]:
        r = (0.125 - k * 0.012) * H
        F.ell(Vector((math.sin(a) * r, -math.cos(a) * r * 0.85, z)), (0.034 * H, 0.03 * H, 0.03 * H))
F.ell(Vector((0, 0, 1.6 * H)), (0.06 * H, 0.055 * H, 0.12 * H), neg=True)
b.add('furCollar', F.mesh(res=0.006, smooth=3, disp=lambda p: 0.004 * H * (n3(p, 70) + 0.5 * n3(p, 140)), target=1600), fur, region='neck', subdiv=0)

# as MANGAS compridas e largas até o pulso (o sobretudo é maior que ela)
for side in ('L', 'R'):
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    end = e.lerp(h, 0.84)
    S = Sculpt()
    S.chain([s_ + Vector((0, 0, 0.02 * H)), s_.lerp(e, 0.5), e, end], [0.05 * H, 0.047 * H, 0.047 * H, 0.05 * H], step=0.4)
    S.ell(s_ + Vector((0, 0, 0.02 * H)), (0.05 * H, 0.05 * H, 0.044 * H))
    ax = (e - s_).normalized()
    fold = lambda p, a=s_, ax=ax: 0.0034 * H * (ridge((p - a).dot(ax) / H * 60 + n3(p, 14) * 2, 2) - 0.4)
    b.add('sleeve' + side, S.mesh(res=0.007, smooth=3, disp=fold, target=1000), coat, region='arm' + side, subdiv=0)
    b.add('sleeveCuff' + side, tube(limb_rings(end - (h - e).normalized() * 0.01 * H, end + (h - e).normalized() * 0.012 * H, 0.054 * H, 0.056 * H, n=1), 14), coat_dk, region='e' + side, subdiv=0)
# o elástico de cabelo no pulso direito (x < 0) e a pulseira de couro preta no esquerdo
eR, hR = sk['eR'], sk['handR']
b.add('hairTieWrist', tube(limb_rings(eR.lerp(hR, 0.9), eR.lerp(hR, 0.93), 0.04 * H, 0.04 * H, n=1), 12), band, region='eR', subdiv=0)
eL, hL = sk['eL'], sk['handL']
b.add('braceletL', tube(limb_rings(eL.lerp(hL, 0.88), eL.lerp(hL, 0.94), 0.041 * H, 0.041 * H, n=1), 12), band, region='eL', subdiv=0)

# ================================================================ a BOLSA DE COURO transversal: a alça do ombro direito ao quadril esquerdo
strap = [(-0.13 * H, -0.02 * H, 1.6 * H), (-0.1 * H, -0.15 * H, 1.5 * H), (-0.02 * H, -0.168 * H, 1.36 * H), (0.07 * H, -0.165 * H, hz + 0.24 * H),
         (0.15 * H, -0.13 * H, hz + 0.12 * H), (0.2 * H, -0.05 * H, hz + 0.04 * H)]
b.add('bagStrap', rod(strap, 0.012 * H, 5, flat=(outward((0, 0)), 0.35)), leather, region='torso', subdiv=0)
back = [(-0.13 * H, -0.02 * H, 1.6 * H), (-0.1 * H, 0.12 * H, 1.5 * H), (0.02 * H, 0.17 * H, 1.36 * H), (0.13 * H, 0.15 * H, hz + 0.2 * H), (0.2 * H, 0.06 * H, hz + 0.06 * H)]
b.add('bagStrapBack', rod(back, 0.012 * H, 5, flat=(outward((0, 0)), 0.35)), leather, region='torso', subdiv=0)
bc = Vector((0.225 * H, -0.0 * H, hz - 0.03 * H))
b.add('bag', box(tuple(bc), (0.05 * H, 0.15 * H, 0.12 * H), bevel=0.012), leather, region='torso', subdiv=0)
b.add('bagFlap', box((bc.x + 0.004 * H, bc.y, bc.z + 0.03 * H), (0.052 * H, 0.152 * H, 0.06 * H), bevel=0.01), coat_dk, region='torso', subdiv=0)
b.add('bagShears', box((bc.x - 0.004 * H, bc.y + 0.045 * H, bc.z + 0.09 * H), (0.012 * H, 0.012 * H, 0.05 * H), bevel=0.003), gold, region='torso', subdiv=0)

# ================================================================ CALÇA escura e os CHINELOS
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k + Vector((0, -0.003 * H, 0)), k.lerp(f, 0.5), k.lerp(f, 0.86)],
            [0.07 * H, 0.06 * H, 0.05 * H, 0.046 * H, 0.044 * H], step=0.45)
    c2 = (l.x, l.y)
    fold = lambda p, c=c2, kz=k.z: 0.0026 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 30 + n3(p, 16), 2) - 0.35) * (1.6 if abs(p.z - kz) < 0.06 * H else 1)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
    b.add('sandal' + side, sole_part((f.x, f.y - 0.05 * H, f.z - 0.02 * H), (0.085 * H, 0.23 * H, 0.016 * H), bevel=0.004), sole, region='k' + side, subdiv=0)
    toe = Vector((f.x, f.y - 0.12 * H, f.z - 0.01 * H))
    b.add('sandalStrap' + side, rod([(f.x - 0.04 * H, f.y - 0.04 * H, f.z - 0.012 * H), (toe.x, toe.y + 0.01 * H, toe.z + 0.035 * H), (f.x + 0.04 * H, f.y - 0.04 * H, f.z - 0.012 * H)], 0.006 * H, 4), sole, region='k' + side, subdiv=0)
Hp = Sculpt()
Hp.ell(Vector((0, 0.0, hz - 0.02 * H)), (0.162 * H, 0.12 * H, 0.1 * H))
Hp.ell(Vector((0, 0.012 * H, hz - 0.055 * H)), (0.146 * H, 0.1 * H, 0.075 * H))
b.add('pantsHip', Hp.mesh(res=0.011, smooth=3, disp=lambda p: 0.0015 * H * n3(p, 14), target=800), M['legs'], region='body', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)

# ================================================================ CABELO castanho ondulado, repartido de lado, abaixo dos ombros
HC = Vector((hc.x, hc.y, hc.z))
V = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
random.seed(1691)


def hair_weights(p):
    t = smoothstep(sk['hd'].z + 0.02 * H, sk['neck'].z - 0.01 * H, p.z)
    return {'hd': 1 - t, 'chest': t}


def wave(pts, amp, ph):
    return [p + Vector((math.sin(i * 1.5 + ph) * amp * H, 0, 0)) if i > 1 else p for i, p in enumerate(pts)]


Hr = Sculpt()
Hr.ell(V(0, 0.014, 0.028), (0.144 * H, 0.16 * H, 0.15 * H))  # a calota
for s in (1, -1):  # as cortinas da frente: das têmporas até a clavícula
    for i in range(4):
        u = i / 3
        pts = [V(s * (0.11 + 0.03 * u) * 0.9, -0.08 + 0.07 * u, 0.09), V(s * (0.14 + 0.012 * u), -0.07 + 0.075 * u, -0.02),
               V(s * (0.15 + 0.012 * u), -0.06 + 0.07 * u, -0.13), V(s * (0.158 + 0.01 * u), -0.08 + 0.06 * u, -0.24),
               V(s * (0.16 + 0.012 * u), -0.1 + 0.05 * u, -0.33), V(s * (0.155 + 0.014 * u), -0.1 + 0.04 * u, -0.36 - random.random() * 0.03)]
        Hr.chain(wave(pts, 0.012, i + s), [k * H for k in (0.032, 0.036, 0.034, 0.032, 0.026, 0.008)], step=0.35)
for s in (1, -1):  # os lados atrás das orelhas
    for i in range(4):
        y = 0.02 + i * 0.035
        pts = [V(s * 0.138, y, 0.06), V(s * 0.152, y + 0.01, -0.08), V(s * 0.164, y + 0.04, -0.2), V(s * 0.168, 0.12 + i * 0.01, -0.3), V(s * 0.16, 0.15, -0.37 - random.random() * 0.04)]
        Hr.chain(wave(pts, 0.012, i * 2 + s), [k * H for k in (0.032, 0.032, 0.03, 0.026, 0.008)], step=0.35)
for i in range(9):  # atrás, até um pouco abaixo dos ombros
    u = (i - 4) / 4
    x = u * 0.14
    end = -0.38 - (1 - abs(u)) * 0.04 - random.random() * 0.04
    pts = [V(x * 0.9, 0.12, 0.06), V(x, 0.155, -0.06), V(x * 1.05, 0.165, -0.18), V(x * 1.1, 0.18, -0.3), V(x * 1.05, 0.185, end)]
    Hr.chain(wave(pts, 0.014, i), [k * H for k in (0.034, 0.034, 0.032, 0.026, 0.008)], step=0.35)
# a FRANJA repartida de lado (o repartido à esquerda dela, x > 0): o volume vai para a direita, sobre a testa
for i in range(4):
    u = i / 3
    pts = [V(0.05, -0.04 + 0.03 * u, 0.152), V(-0.01 - 0.03 * u, -0.13 + 0.02 * u, 0.12 - 0.02 * u),
           V(-0.09 - 0.02 * u, -0.14 + 0.02 * u, 0.05), V(-0.13 - 0.01 * u, -0.11 + 0.02 * u, -0.04)]
    Hr.chain(pts, [0.02 * H, 0.018 * H, 0.016 * H, 0.01 * H], step=0.35)
for i in range(2):
    pts = [V(0.05, -0.04, 0.152), V(0.1, -0.12 + 0.02 * i, 0.11), V(0.13, -0.12 + 0.02 * i, 0.03)]
    Hr.chain(pts, [0.022 * H, 0.02 * H, 0.012 * H], step=0.35)
Hr.ell(V(0, -0.125, -0.07), (0.104 * H, 0.1 * H, 0.15 * H), neg=True)  # o rosto livre
Hr.ell(V(0, 0.01, -0.04), (0.1 * H, 0.11 * H, 0.12 * H), neg=True)


def strands(p):
    a = math.atan2(p.x - HC.x, p.y - HC.y)
    return 0.003 * H * (ridge(a * 26 + n3(p, 18) * 1.6, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.007, smooth=3, disp=strands, target=3600), hairm, region='head', weight_fn=hair_weights, subdiv=0)

# ================================================================ ORPHEU, o URUTAU, no ombro esquerdo (x > 0)
sL = sk['sL']
oc = Vector((sL.x + 0.035 * H, sL.y + 0.015 * H, sL.z + 0.125 * H))  # o centro do corpo, pousado em cima do ombro
O = Sculpt()
O.ell(oc, (0.0675 * H, 0.0648 * H, 0.1080 * H))  # corpo em pé (o urutau parece um galho)
O.ell(oc + Vector((0, -0.0081 * H, 0.1148 * H)), (0.0594 * H, 0.0540 * H, 0.0540 * H))  # a cabeça larga
O.chain([oc + Vector((0, 0.0405 * H, -0.0675 * H)), oc + Vector((0, 0.0675 * H, -0.1620 * H)), oc + Vector((0, 0.0783 * H, -0.2430 * H))],
        [0.0405 * H, 0.0324 * H, 0.0135 * H], step=0.4)  # a cauda longa caindo nas costas
for s in (1, -1):  # as asas fechadas
    O.ell(oc + Vector((s * 0.0540 * H, 0.0162 * H, -0.0135 * H)), (0.0216 * H, 0.0513 * H, 0.0945 * H))
b.add('prop_orpheu', O.mesh(res=0.005, smooth=3, disp=lambda p: 0.0034 * H * (ridge(p.z / H * 160 + n3(p, 40) * 2, 2) - 0.4), target=1400), owl, region='chest', subdiv=0)
for s in (1, -1):  # os olhos grandes amarelos e as manchas escuras das penas
    ec = oc + Vector((s * 0.0270 * H, -0.0540 * H, 0.1215 * H))
    b.add(f'prop_orpheuEye{s}', ellipsoid(tuple(ec), (0.0162 * H, 0.0108 * H, 0.0162 * H), 10, 6), owl_eye, region='chest', subdiv=0)
    b.add(f'prop_orpheuPupil{s}', ellipsoid(tuple(ec + Vector((0, -0.0095 * H, 0))), (0.0068 * H, 0.0041 * H, 0.0068 * H), 8, 4), corset, region='chest', subdiv=0)
b.add('prop_orpheuBeak', ellipsoid(tuple(oc + Vector((0, -0.0594 * H, 0.0972 * H))), (0.0081 * H, 0.0108 * H, 0.0081 * H), 8, 4), owl_dk, region='chest', subdiv=0)
b.add('prop_orpheuFeet', box(tuple(oc + Vector((0, -0.0068 * H, -0.1013 * H))), (0.0405 * H, 0.0270 * H, 0.0135 * H), bevel=0.003), owl_dk, region='chest', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'beatrice.blend'), check_existing=False)
