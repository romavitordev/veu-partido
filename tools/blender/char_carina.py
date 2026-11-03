"""
CARINA LEONE — Ordo Realitas (Equipe Abutres, Calamidade) — public/models/carina.glb.
Referência: wiki "Carina Leone" (arte de Calamidade). 1,80 m, atlética. Cabelo CASTANHO LONGO E SOLTO, repartido no
meio, caindo pela frente dos ombros e até o meio das costas, com as MECHAS CIANO (prop_streakCyan) — depois da Marca elas ficam DOURADAS e brilham em combate (prop_streakGold, só na
Transformação). GOLA ALTA preta (puxada até o queixo); JAQUETA DE COURO CINZA com o BRASÃO DOS LEONE nas costas e as
mangas puxadas, mostrando os antebraços TATUADOS (textura arms_carina); PINGENTE de cabeça de leão; CALÇA ESCURA com as
CORRENTES; BOTAS PRETAS ALTAS; o coldre da Glock na coxa direita e as facas de arremesso no cinto. O nunchaku e a Glock
são montados em código (props.js).
TÉCNICA (a da Aghata): corpo pelo Builder; jaqueta e gola como CASCAS (shell_grid); cabelo, calça, botas e mangas por
ESCULTURA de metaballs com o relevo das dobras; correntes de elos de verdade (chain_mesh).
v4.17.0 (refeita no Blender ao vivo pelo MCP, conferida em 4 vistas): cabelo solto comprido no lugar do rabo de cavalo,
mangas justas (as bolas da corrente somam campo e incham: raios bem perto do braço), quadril da calça menor.
  node tools/blender/build.mjs carina   → public/models/carina.glb (+ tools/blender/fonte/carina.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief, chain_mesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'carina.glb'
random.seed(1800)

b = Builder(width=0.92, bulk=0.94, height=1.0)  # 1,80 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_carina', '#e2b89c', 0.8),
    'face': material('face_carina', '#ffffff', 0.8),
    'torso': material('turtleneck_carina', '#16161a', 0.85),
    'arm': material('arms_carina', '#ffffff', 0.8),
    'hand': material('glove_carina', '#1a1a1e', 0.6),
    'legs': material('pants_carina', '#24242c', 0.9),
    'feet': material('boot_carina', '#121214', 0.55),
}
black = M['torso']
jacket = material('leather_grey', '#6a6a72', 0.5)
jacket_dk = material('leather_grey_dk', '#4a4a52', 0.6)
silver = material('silver_carina', '#b8b8c0', 0.3, metal=0.9)
gold = material('gold_carina', '#d4a838', 0.35, metal=0.8)
hairm = material('hair_carina', '#6e4630', 0.6)
cyan = material('hair_cyan', '#3ad0e0', 0.5)
goldHair = material('hair_gold', '#f2c230', 0.4, emission='#f2b020', strength=2.0)
beltm = material('belt_carina', '#141416', 0.6)
sole = material('sole_carina', '#0a0a0c', 0.8)
steel = material('steel_carina', '#d8d4dc', 0.25, metal=0.9)
holster = material('holster_carina', '#1e1a18', 0.7)

PREVIEW = {'face_carina': '#e2b89c', 'arms_carina': '#e2b89c'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.16), (0.0, 0.16), (0.17, 0.142), (0.36, 0.19), (0.47, 0.205), (0.57, 0.115), (0.63, 0.066)],
            arm_r=(0.056, 0.047, 0.04), leg_r=(0.084, 0.064, 0.05), head_r=(0.132, 0.142, 0.156))


def part(name):
    return next(o for o in b.parts if o.name == name)


def chest(p):
    x, y, z = p.x, p.y, p.z - hz
    if y > -0.02:
        return 0.0
    return 0.016 * H * math.exp(-((abs(x) - 0.07 * H) / (0.06 * H)) ** 2) * math.exp(-((z - 0.43 * H) / (0.06 * H)) ** 2)


relief(part('torso'), chest)

# ================================================================ a GOLA ALTA preta, puxada até o queixo
G = Sculpt()
for k in range(4):
    z = 1.55 * H + k * 0.032 * H
    for a in [i / 14 * TAU for i in range(14)]:
        G.ell(Vector((math.sin(a) * 0.066 * H, -math.cos(a) * 0.063 * H, z)), (0.026 * H, 0.026 * H, 0.024 * H))
G.ell(Vector((0, 0, 1.6 * H)), (0.05 * H, 0.05 * H, 0.1 * H), neg=True)
b.add('turtleneck', G.mesh(res=0.006, smooth=3, disp=lambda p: 0.0018 * H * (ridge(p.z / H * 140 + n3(p, 30), 2) - 0.4), target=1100), black, region='neck', subdiv=0)

# ================================================================ JAQUETA DE COURO CINZA, aberta, até o quadril
JK = [(0.04, 0.182, 0.136, 0.4), (0.12, 0.176, 0.13, 0.4), (0.24, 0.18, 0.13, 0.42), (0.36, 0.208, 0.146, 0.48),
      (0.46, 0.218, 0.152, 0.5), (0.54, 0.186, 0.134, 0.58), (0.6, 0.122, 0.1, 0.76)]
rows = [ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 30) for dz, rx, ry, gap in JK]
jk = b.add('jacket', shell_grid(rows, 0.007), jacket, region='torso', subdiv=1)
relief(jk, lambda p: 0.0022 * H * (ridge((p.z - hz) / H * 60 + n3(p, 9) * 2, 2) - 0.4) * (1 if p.z < hz + 0.3 * H else 0.4))
hem = [(math.sin(a) * 0.186 * H, -math.cos(a) * 0.139 * H, hz + 0.04 * H) for a in [0.4 + (TAU - 0.8) * i / 30 for i in range(31)]]
b.add('jacketHem', rod(hem, 0.013 * H, 6, flat=(outward((0, 0)), 0.35)), jacket_dk, region='torso', subdiv=0)
for s in (1, -1):  # as bordas da abertura
    pts = []
    for dz, rx, ry, gap in JK:
        a = gap if s > 0 else TAU - gap
        pts.append(Vector((math.sin(a) * (rx + 0.003) * H, -math.cos(a) * (ry + 0.003) * H, hz + dz * H)))
    b.add(f'jacketEdge{s}', rod(pts, 0.008 * H, 6, flat=(outward((0, 0)), 0.4)), jacket_dk, region='torso', subdiv=0)
gola = [ring_pts(1.53 * H + k * 0.045 * H, (0.112 + k * 0.018) * H, (0.097 + k * 0.018) * H, 0.9 - k * 0.05, TAU - 0.9 + k * 0.05, 18) for k in range(3)]
b.add('jacketCollar', shell_grid(gola, 0.007), jacket, region='neck', subdiv=1)
for s in (1, -1):  # o zíper
    a = 0.42 if s > 0 else TAU - 0.42
    zp = [(math.sin(a) * 0.178 * H, -math.cos(a) * 0.136 * H - 0.003, hz + (0.06 + i * 0.05) * H) for i in range(9)]
    b.add(f'zip{s}', rod(zp, 0.003 * H, 4), silver, region='torso', subdiv=0)
# o BRASÃO DOS LEONE nas costas: o disco dourado com a cabeça de leão em relevo (a juba em raios)
bc = Vector((0, 0.158 * H, hz + 0.17 * H))  # abaixo das pontas do cabelo
b.add('crestDisc', ellipsoid(tuple(bc), (0.06 * H, 0.006 * H, 0.06 * H), 18, 6), gold, region='torso', subdiv=0)
mane = []
for i in range(14):
    a = i / 14 * TAU
    mane.append(rod([(bc.x + math.sin(a) * 0.022 * H, bc.y + 0.006 * H, bc.z + math.cos(a) * 0.022 * H),
                     (bc.x + math.sin(a + 0.25) * 0.048 * H, bc.y + 0.005 * H, bc.z + math.cos(a + 0.25) * 0.048 * H)], 0.004 * H, 4))
b.add('crestMane', merge(*mane), jacket_dk, region='torso', subdiv=0)
b.add('crestFace', ellipsoid((bc.x, bc.y + 0.008 * H, bc.z), (0.02 * H, 0.006 * H, 0.024 * H), 10, 6), jacket_dk, region='torso', subdiv=0)

# as MANGAS puxadas até o meio do antebraço (os antebraços tatuados aparecem)
for side in ('L', 'R'):
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    end = e.lerp(h, 0.4)
    S = Sculpt()
    S.chain([s_ + Vector((0, 0, 0.02 * H)), s_.lerp(e, 0.5), e, end], [0.047 * H, 0.043 * H, 0.044 * H, 0.043 * H], step=0.4)
    S.ell(e.lerp(end, 0.55), (0.047 * H, 0.047 * H, 0.03 * H), dir=end - e)
    S.ell(s_ + Vector((0, 0, 0.02 * H)), (0.046 * H, 0.046 * H, 0.041 * H))
    ax = (e - s_).normalized()
    fold = lambda p, a=s_, ax=ax: 0.003 * H * (ridge((p - a).dot(ax) / H * 70 + n3(p, 14) * 2, 2) - 0.4)
    b.add('sleeve' + side, S.mesh(res=0.007, smooth=3, disp=fold, target=1000), jacket, region='arm' + side, subdiv=0)
    b.add('sleeveCuff' + side, tube(limb_rings(end + (h - e).normalized() * 0.012 * H, end - (h - e).normalized() * 0.008 * H, 0.048 * H, 0.048 * H, n=1), 14), jacket_dk, region='e' + side, subdiv=0)
    # a faixa das mãos (luta)
    b.add('wrap' + side, tube(limb_rings(e.lerp(h, 0.86), e.lerp(h, 0.98), 0.046, 0.05, n=1), 12), M['hand'], region='e' + side, subdiv=0)

# ================================================================ o PINGENTE de cabeça de leão
b.add('pendantCord', rod([(-0.06 * H, -0.07 * H, 1.6 * H), (-0.03 * H, -0.125 * H, 1.5 * H), (0, -0.14 * H, 1.45 * H), (0.03 * H, -0.125 * H, 1.5 * H), (0.06 * H, -0.07 * H, 1.6 * H)], 0.003, 5), silver, region='torso', subdiv=0)
pc = Vector((0, -0.146 * H, 1.43 * H))
b.add('pendantLion', ellipsoid(tuple(pc), (0.016 * H, 0.008 * H, 0.019 * H), 10, 6), gold, region='torso', subdiv=0)
pm = [(pc.x + math.sin(a) * 0.02 * H, pc.y + 0.002, pc.z + math.cos(a) * 0.02 * H) for a in [i / 16 * TAU for i in range(17)]]
b.add('pendantMane', rod(pm, 0.005 * H, 5, caps=False), gold, region='torso', subdiv=0)

# ================================================================ CALÇA ESCURA justa
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k + Vector((0, -0.003 * H, 0)), k.lerp(f, 0.45)],
            [0.072 * H, 0.062 * H, 0.052 * H, 0.048 * H], step=0.45)
    c2 = (l.x, l.y)
    fold = lambda p, c=c2, kz=k.z: 0.0026 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 30 + n3(p, 16), 2) - 0.35) * (1.6 if abs(p.z - kz) < 0.06 * H else 1)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
Hp = Sculpt()
Hp.ell(Vector((0, 0.0, hz - 0.02 * H)), (0.168 * H, 0.124 * H, 0.1 * H))
Hp.ell(Vector((0, 0.012 * H, hz - 0.055 * H)), (0.152 * H, 0.104 * H, 0.075 * H))
b.add('pantsHip', Hp.mesh(res=0.011, smooth=3, disp=lambda p: 0.0015 * H * n3(p, 14), target=800), M['legs'], region='body', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)

# o COLDRE da Glock na coxa direita (x < 0) com as duas tiras
lR, kR = sk['lR'], sk['kR']
hp = lR.lerp(kR, 0.35)
b.add('holster', box((hp.x - 0.075 * H, hp.y - 0.01 * H, hp.z), (0.028 * H, 0.07 * H, 0.12 * H), bevel=0.006), holster, region='lR', subdiv=0)
for t in (0.25, 0.5):
    b.add(f'holsterStrap{t}', tube(limb_rings(lR.lerp(kR, t), lR.lerp(kR, t + 0.035), 0.078 * H, 0.078 * H, n=1), 14), beltm, region='lR', subdiv=0)

# ================================================================ BOTAS PRETAS ALTAS (até o joelho)
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    B = Sculpt()
    B.chain([k.lerp(f, 0.08), k.lerp(f, 0.5), f + Vector((0, 0.005 * H, 0.06 * H))], [0.056 * H, 0.05 * H, 0.048 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.054 * H, 0.12 * H, 0.044 * H))
    B.ell(f + Vector((0, -0.13 * H, 0.024 * H)), (0.048 * H, 0.05 * H, 0.034 * H))
    B.ell(f + Vector((0, 0.035 * H, 0.04 * H)), (0.05 * H, 0.05 * H, 0.05 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, disp=lambda p: 0.0016 * H * (ridge(p.z / H * 40 + n3(p, 10), 2) - 0.4), target=1000), M['feet'], region='k' + side, subdiv=0)
    b.add('bootTop' + side, tube(limb_rings(k.lerp(f, 0.06), k.lerp(f, 0.11), 0.06 * H, 0.059 * H, n=1), 14), M['feet'], region='k' + side, subdiv=0)
    for t in (0.3, 0.55):  # as fivelas do cano
        b.add(f'bootStrap{side}{t}', tube(limb_rings(k.lerp(f, t), k.lerp(f, t + 0.04), 0.056 * H, 0.056 * H, n=1), 14), beltm, region='k' + side, subdiv=0)
        c = k.lerp(f, t + 0.02)
        b.add(f'bootBuckle{side}{t}', box((c.x + (0.05 * H if side == 'L' else -0.05 * H), c.y, c.z), (0.008, 0.02, 0.016), bevel=0.002), silver, region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.014 * H), (0.105 * H, 0.25 * H, 0.032 * H), bevel=0.006), sole, region='k' + side, subdiv=0)

# ================================================================ CINTO, as CORRENTES da calça e as facas de arremesso
belt_ring = [(math.sin(a) * 0.176 * H, -math.cos(a) * 0.13 * H, hz + 0.06 * H) for a in [i / 28 * TAU for i in range(29)]]
b.add('belt', rod(belt_ring, 0.02 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), beltm, region='torso', subdiv=0)
b.add('buckle', box((0, -0.136 * H, hz + 0.06 * H), (0.05, 0.012, 0.035), bevel=0.004), silver, region='torso', subdiv=0)
for side, a0, a1 in ((1, 0.35, 1.5), (-1, -0.35, -1.5)):  # as duas correntes em arco, da frente para os lados
    ch = []
    for i in range(9):
        t = i / 8
        a = a0 + (a1 - a0) * t
        ch.append((math.sin(a) * 0.182 * H, -math.cos(a) * 0.136 * H, hz + 0.05 * H - math.sin(t * math.pi) * 0.1 * H))
    b.add(f'pantsChain{side}', chain_mesh(ch, link=0.02, r=0.0028), silver, region='torso', subdiv=0)
for i in range(3):  # as facas de arremesso no lado esquerdo do cinto (x > 0)
    a = 1.05 + i * 0.16
    p = Vector((math.sin(a) * 0.19 * H, -math.cos(a) * 0.14 * H, hz + 0.03 * H))
    # a da frente é a que ela tira no arremesso (Faca no Olho): vira peça (prop_beltKnife*) para sumir do cinto
    hn, bn = ('prop_beltKnifeH', 'prop_beltKnifeB') if i == 0 else (f'knifeHandle{i}', f'knifeBlade{i}')
    b.add(hn, box(tuple(p), (0.012, 0.012, 0.05), bevel=0.002), beltm, region='torso', subdiv=0)
    b.add(bn, box((p.x, p.y, p.z - 0.06), (0.006, 0.02, 0.07), bevel=0.001), steel, region='torso', subdiv=0)

# ================================================================ CABELO castanho LONGO E SOLTO + as MECHAS
# (arte de Calamidade: repartido no meio, as cortinas caem pela frente dos ombros até o peito e o resto até o meio
# das costas). O que fica abaixo da cabeça segue o PEITO, para não atravessar o tronco quando a cabeça vira.
HC = Vector((hc.x, hc.y, hc.z))
V = lambda x, y, z: HC + Vector((x * H, y * H, z * H))  # relativo ao centro da cabeça
random.seed(1801)


def hair_weights(p):
    t = smoothstep(sk['hd'].z + 0.02 * H, sk['neck'].z - 0.01 * H, p.z)
    return {'hd': 1 - t, 'chest': t}


Hr = Sculpt()
Hr.ell(V(0, 0.014, 0.028), (0.146 * H, 0.164 * H, 0.152 * H))  # a calota
FRONT = []
# as CORTINAS da frente: saem das têmporas, cobrem as orelhas e caem por cima dos ombros até o peito
for s in (1, -1):
    for i in range(5):
        u = i / 4  # 0 = mais perto do rosto, 1 = mais para trás
        pts = [V(s * (0.112 + 0.03 * u) * 0.9, -0.085 + 0.07 * u, 0.09),
               V(s * (0.142 + 0.012 * u), -0.07 + 0.075 * u, -0.02),
               V(s * (0.15 + 0.012 * u), -0.06 + 0.07 * u, -0.13),
               V(s * (0.155 + 0.01 * u), -0.1 + 0.06 * u, -0.25),
               V(s * (0.15 + 0.012 * u), -0.17 + 0.05 * u, -0.37),
               V(s * (0.14 + 0.014 * u), -0.185 + 0.04 * u, -0.5 - random.random() * 0.03),
               V(s * (0.13 + 0.02 * u), -0.18 + 0.03 * u, -0.6 - random.random() * 0.05)]
        Hr.chain(pts, [k * H for k in (0.032, 0.036, 0.034, 0.032, 0.028, 0.022, 0.006)], step=0.35)
        FRONT.append((s, i, pts))
# os LADOS: atrás da orelha, passam por cima do ombro e se juntam ao lençol de trás
for s in (1, -1):
    for i in range(4):
        y = 0.02 + i * 0.035
        pts = [V(s * 0.138, y, 0.06), V(s * 0.152, y + 0.01, -0.08), V(s * 0.162, y + 0.05, -0.22),
               V(s * 0.162, 0.16 + i * 0.01, -0.34), V(s * 0.155, 0.2, -0.48), V(s * 0.14, 0.2, -0.6 - random.random() * 0.04)]
        Hr.chain(pts, [k * H for k in (0.032, 0.032, 0.03, 0.028, 0.022, 0.006)], step=0.35)
# o LENÇOL de trás: do alto da nuca até o meio das costas, as pontas desiguais
for i in range(9):
    u = (i - 4) / 4
    x = u * 0.14
    end = -0.66 - (1 - abs(u)) * 0.06 - random.random() * 0.04
    pts = [V(x * 0.9, 0.12, 0.06), V(x, 0.155, -0.06), V(x * 1.05, 0.16, -0.18), V(x * 1.1, 0.19, -0.3),
           V(x * 1.1, 0.205, -0.44), V(x * 1.05, 0.21, -0.56), V(x * 0.95, 0.205, end)]
    Hr.chain(pts, [k * H for k in (0.034, 0.034, 0.032, 0.03, 0.028, 0.022, 0.006)], step=0.35)
# a FRANJA repartida no meio, caindo para os lados e deixando a testa à mostra
for s in (1, -1):
    for i in range(3):
        u = i / 2
        pts = [V(s * 0.012, -0.05 + 0.03 * u, 0.152), V(s * (0.06 + 0.02 * u), -0.13 + 0.02 * u, 0.12 - 0.01 * u),
               V(s * (0.105 + 0.015 * u), -0.135 + 0.02 * u, 0.05), V(s * (0.125 + 0.01 * u), -0.11 + 0.02 * u, -0.03)]
        Hr.chain(pts, [0.024 * H, 0.022 * H, 0.018 * H, 0.01 * H], step=0.35)
Hr.ell(V(0, -0.125, -0.07), (0.106 * H, 0.1 * H, 0.15 * H), neg=True)  # o rosto livre
Hr.ell(V(0, 0.01, -0.04), (0.1 * H, 0.11 * H, 0.12 * H), neg=True)


def strands(p):
    a = math.atan2(p.x - HC.x, p.y - HC.y)
    return 0.0028 * H * (ridge(a * 30 + n3(p, 20) * 1.4, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.007, smooth=3, disp=strands, target=4000), hairm, region='head', weight_fn=hair_weights, subdiv=0)


# as MECHAS: uma no repartido e duas na cortina do lado direito (x < 0), por cima do cabelo — ciano (sempre) e a cópia
# dourada brilhando (Transformação)
def streaks():
    R = Sculpt()
    R.chain([V(-0.012, -0.06, 0.162), V(-0.07, -0.135, 0.13), V(-0.115, -0.14, 0.055), V(-0.14, -0.115, -0.03)],
            [0.012 * H, 0.012 * H, 0.011 * H, 0.008 * H], step=0.35)
    for s, i, pts in FRONT:
        if s < 0 and i in (1, 3):
            q = [p + (p - Vector((HC.x, HC.y, p.z))).normalized() * 0.012 * H for p in pts]
            R.chain(q, [0.012 * H] * 5 + [0.01 * H, 0.004 * H], step=0.35)
    return R.mesh(res=0.005, smooth=2, disp=strands, target=900)


b.add('prop_streakCyan', streaks(), cyan, region='head', weight_fn=hair_weights, subdiv=0)
b.add('prop_streakGold', streaks(), goldHair, region='head', weight_fn=hair_weights, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'carina.blend'), check_existing=False)
