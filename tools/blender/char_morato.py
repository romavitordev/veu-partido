"""
MORATO VERTALER — public/models/morato.glb (Os Cinco, o líder; pedido de 2026-10-31 "completar Os Cinco").
Referência: wiki "Morato Vertaler" (aparência): homem negro de olhar cansado, cabelo TRANÇADO preso num COQUE com
algumas tranças soltas, a CICATRIZ DE CONHECIMENTO no lado esquerdo da cabeça, barba por fazer (textura face_morato),
FAIXA VERMELHA amarrada na testa, CAMISA SOCIAL CINZA-ESCURA, JAQUETA AZUL com detalhes VERMELHOS nos ombros e o
COLAR DE IDENTIFICAÇÃO MILITAR no pescoço. Refeito em 2026-11-01 pelas artes da wiki ("Morato em Sinais do Outro Lado":
DREADS presos num COQUE no alto com mechas soltas em volta do rosto, a faixa vermelha com as PONTAS LONGAS caindo pelo lado
esquerdo até o peito, jaqueta VERDE-AZULADA escura com DRAGONAS VERMELHAS e botões, camisa cinza-esverdeada, corrente; e a
"Arte conceitual de Morato": MOCHILA com alças, cinto com bolsas, o pano XADREZ VERMELHO na cintura, calça CAMUFLADA com
JOELHEIRAS, luvas pretas, tênis).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'morato.glb'
b = Builder(width=1.06, bulk=1.05, height=1.02)  # ~1,83 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_morato', '#5a3a28', 0.75),
    'face': material('face_morato', '#ffffff', 0.75),
    'torso': material('jacket_morato', '#2a3b44', 0.8),  # a jaqueta verde-azulada escura
    'armL': material('jacket_morato', '#2a3b44', 0.8),
    'armR': material('jacket_morato', '#2a3b44', 0.8),
    'handR': material('glove_morato', '#141416', 0.6),  # luvas pretas
    'handL': material('glove_morato', '#141416', 0.6),
    'legs': material('camo_morato', '#ffffff', 0.85),  # calça camuflada (textura camo_morato)
    'feet': material('shoe_morato', '#1c1c20', 0.6),
}
shirt = material('shirt_morato', '#5a6660', 0.8)  # a camisa cinza-esverdeada
red = material('red_morato', '#b0242a', 0.7)
metal = material('metal_morato', '#a8a8b0', 0.3, metal=0.85)
strap = material('strap_morato', '#2a2018', 0.8)
hairm = material('hair_morato', '#141010', 0.65)
glyph = material('glyph_morato', '#e8c060', 0.4, emission='#e8b040', strength=0.6)  # a cicatriz de Conhecimento

hc = b.body(M, [(-0.11, 0.17), (0.0, 0.172), (0.17, 0.168), (0.36, 0.205), (0.47, 0.215), (0.57, 0.118), (0.63, 0.07)],
            arm_r=(0.066, 0.056, 0.046), leg_r=(0.096, 0.078, 0.062), head_r=(0.13, 0.142, 0.156))

# a camisa social cinza aparecendo na jaqueta aberta (painel na frente + gola) e os botões
b.add('shirt_front', box((0, -0.15 * H, hz + 0.5 * H), (0.075 * H, 0.012, 0.12 * H)), shirt, region='torso', subdiv=0)
# a GOLA alta da jaqueta em volta do pescoço
b.add('jacket_collar', tube([(0, 0.005, 1.5 * H, 0.085 * H, 0.08 * H), (0, 0.01, 1.68 * H, 0.07 * H, 0.066 * H)], 18, cap_start=False, cap_end=False), M['torso'], region='neck', subdiv=0)
for s in (1, -1):
    b.add(f'collar{s}', box((s * 0.05 * H, -0.12 * H, hz + 0.57 * H), (0.05 * H, 0.012, 0.025 * H)), shirt, region='torso', subdiv=0)
    # lapela da jaqueta
    b.add(f'lapel{s}', box((s * 0.115 * H, -0.153 * H, hz + 0.44 * H), (0.025 * H, 0.01, 0.15 * H)), M['torso'], region='torso', subdiv=0)
    # os detalhes VERMELHOS nos ombros
    sh = sk['sL' if s > 0 else 'sR']
    b.add(f'shoulder_red{s}', box((sh.x - s * 0.01, sh.y, sh.z + 0.012), (0.05, 0.13, 0.018), bevel=0.006), red, region='torso', subdiv=0)  # a DRAGONA
    b.add(f'epaulet_btn{s}', ellipsoid((sh.x - s * 0.03, sh.y - 0.05, sh.z + 0.025), (0.008, 0.008, 0.005), 6, 4), metal, region='torso', subdiv=0)
    b.add(f'pack_strap{s}', tube([(s * 0.1 * H, -0.13 * H, hz + 0.56 * H, 0.016 * H, 0.006 * H), (s * 0.12 * H, -0.145 * H, hz + 0.35 * H, 0.016 * H, 0.006 * H), (s * 0.13 * H, -0.13 * H, hz + 0.18 * H, 0.016 * H, 0.006 * H)], 6), strap, region='torso', subdiv=0)
# a MOCHILA nas costas
b.add('backpack', box((0, 0.115 * H, hz + 0.38 * H), (0.17 * H, 0.08 * H, 0.2 * H), bevel=0.02), material('pack_morato', '#4a4434', 0.85), region='torso', subdiv=0)
b.add('backpack_roll', tube([(-0.15 * H, 0.12 * H, hz + 0.58 * H, 0.04 * H, 0.04 * H), (0.15 * H, 0.12 * H, hz + 0.58 * H, 0.04 * H, 0.04 * H)], 10), material('roll_morato', '#3a3a30', 0.85), region='torso', subdiv=0)
# o pano XADREZ VERMELHO pendurado no lado direito da cintura
b.add('plaid', box((-0.16 * H, -0.04 * H, hz - 0.08 * H), (0.06 * H, 0.012, 0.14 * H)), material('plaid_morato', '#a0242a', 0.85), region='torso', subdiv=0)
for k in range(3):
    b.add(f'beltpouch{k}', box(((k - 1) * 0.09 * H, -0.145 * H, hz + 0.0 * H), (0.035, 0.025, 0.045), bevel=0.005), material('pouch_morato', '#5a4a32', 0.85), region='torso', subdiv=0)
for k in range(4):
    b.add(f'button{k}', ellipsoid((0, -0.158 * H, hz + (0.2 + k * 0.1) * H), (0.008, 0.004, 0.008), 6, 4), metal, region='torso', subdiv=0)
# punhos vermelhos da jaqueta
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    b.add('cuff' + side, tube(limb_rings(h.lerp(e, 0.18), h.lerp(e, 0.28), 0.052, 0.052, n=1), 12), red, region='e' + side, subdiv=0)

# cinto e botas
b.add('belt', tube([(0, 0, hz + 0.0 * H, 0.176 * H, 0.13 * H), (0, 0, hz + 0.04 * H, 0.176 * H, 0.13 * H)], 22), strap, region='torso', subdiv=0)
b.add('buckle', box((0, -0.135 * H, hz + 0.02 * H), (0.03, 0.006, 0.022)), metal, region='torso', subdiv=0)
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('kneepad' + side, ellipsoid((k.x, k.y - 0.06, k.z + 0.02), (0.06, 0.03, 0.07), 10, 6), material('kneepad_morato', '#1c1c20', 0.6), region='k' + side, subdiv=0)
    b.add('kneeskull' + side, ellipsoid((k.x, k.y - 0.088, k.z + 0.025), (0.022, 0.006, 0.024), 8, 5), material('skullpatch_morato', '#e8e4dc', 0.7), region='k' + side, subdiv=0)
    b.add('sock' + side, tube(limb_rings(k.lerp(f, 0.82), f + Vector((0, 0, 0.06)), 0.052, 0.052, n=2), 12), material('sock_morato', '#e8e4dc', 0.8), region='k' + side, subdiv=0)
    b.add('bootsole' + side, sole_part((f.x, f.y - 0.05, f.z - 0.022), (0.11 * H, 0.27 * H, 0.03)), material('sole_morato', '#e8e4dc', 0.9), region='k' + side, subdiv=0)  # tênis de sola branca

# o COLAR DE IDENTIFICAÇÃO MILITAR
nz = 1.58 * H
b.add('dogtag_chain', tube([(0, -0.01, nz, 0.07 * H, 0.068 * H), (0, -0.01, nz + 0.004, 0.07 * H, 0.068 * H)], 16, cap_start=False, cap_end=False), metal, region='neck', subdiv=0)
b.add('dogtag_drop', tube([(0, -0.075 * H, nz - 0.005, 0.002, 0.002), (0, -0.12 * H, hz + 0.5 * H, 0.002, 0.002)], 4), metal, region='torso', subdiv=0)
for s, dz in ((1, 0.0), (-1, -0.01)):
    b.add(f'dogtag{s}', box((s * 0.01, -0.126 * H, hz + 0.48 * H + dz), (0.016, 0.003, 0.026), bevel=0.003), metal, region='torso', subdiv=0)

# ---------------- cabelo TRANÇADO: touca rente + COQUE atrás no alto + algumas tranças soltas
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.004, hc.z + 0.01), (0.138 * H, 0.15 * H, 0.162 * H), front=0.16, side=0.42, back=0.6), hairm, region='head')
HC = Vector((hc.x, hc.y + 0.004, hc.z + 0.01))
bun = HC + Vector((0, 0.04 * H, 0.17 * H))  # o coque no alto da cabeça
b.add('bun', ellipsoid(tuple(bun), (0.07 * H, 0.06 * H, 0.06 * H), 12, 8), hairm, region='head')
# os DREADS do couro cabeludo subindo para o coque (grossos, como na arte)
rows = []
for i in range(9):
    a = math.pi * (-0.75 + i * 1.5 / 8)
    sx, sy = math.sin(a), -math.cos(a)
    root = Vector((hc.x + sx * 0.13 * H, hc.y + sy * 0.13 * H, hc.z + 0.07 * H))
    rows.append(tube([(root.x, root.y, root.z, 0.016, 0.016), (root.x * 0.6, root.y * 0.6 + bun.y * 0.4, hc.z + 0.16 * H, 0.016, 0.016), (bun.x + sx * 0.02, bun.y - 0.02, bun.z - 0.01, 0.014, 0.014)], 5))
b.add('locs_up', merge(*rows), hairm, region='head', subdiv=0)
# as MECHAS SOLTAS: saem do coque e caem em volta do rosto (dos dois lados, sobre a testa e atrás)
random.seed(7)
braids = []
for i in range(16):
    a = math.pi * (-0.85 + i * 1.7 / 15)
    sx, sy = math.sin(a), -math.cos(a)
    top = bun + Vector((sx * 0.035 * H, sy * 0.035 * H, -0.01 * H))
    edge = Vector((hc.x + sx * 0.15 * H, hc.y + sy * 0.15 * H, hc.z + 0.09 * H))
    if sy < -0.8:
        continue  # o rosto fica livre: as mechas caem pelos lados e atrás
    ln = (0.07 if sy < -0.45 else 0.2) * H * random.uniform(0.8, 1.15)  # nas têmporas mais curtas
    pts = []
    for k in range(8):
        t = k / 7
        q = top.lerp(edge, min(1.0, t * 2.5)) if t < 0.4 else edge + Vector((sx * 0.012 * H * (t - 0.4), sy * 0.01 * H * (t - 0.4), -ln * (t - 0.4) / 0.6))
        pts.append((q.x + random.uniform(-0.003, 0.003), q.y, q.z, 0.013, 0.013))
    braids.append(tube(pts, 5))
b.add('locs', merge(*braids), hairm, region='head', subdiv=0)
# a CICATRIZ DE CONHECIMENTO no lado ESQUERDO da cabeça (aparece entre as tranças)
b.add('scar_glyph', merge(box((0.135 * H, 0.0, hc.z + 0.07 * H), (0.004, 0.05, 0.008)), box((0.135 * H, 0.0, hc.z + 0.07 * H), (0.004, 0.008, 0.05))), glyph, region='head', subdiv=0)

# ---------------- a FAIXA VERMELHA na testa com o nó e as pontas atrás
fz = hc.z + 0.07 * H
b.add('headband', tube([(0, 0.004, fz - 0.014, 0.142 * H, 0.154 * H), (0, 0.004, fz + 0.014, 0.142 * H, 0.154 * H)], 24, cap_start=False, cap_end=False), red, region='head', subdiv=0)
b.add('headband_knot', ellipsoid((0.125 * H, -0.045 * H, fz), (0.02, 0.02, 0.022), 8, 5), red, region='head', subdiv=0)
for k, dx in enumerate((0.0, 0.03)):
    b.add(f'headband_tail{k}', tube([(0.125 * H + dx * 0.5, -0.05 * H, fz - 0.01, 0.014, 0.005), (0.13 * H + dx * 0.5, -0.07 * H, fz - 0.15 * H, 0.015, 0.005), (0.12 * H + dx * 0.5, -0.12 * H, fz - 0.32 * H, 0.014, 0.005)], 6), red, region='chest', subdiv=0)

import sculpt_lib
sculpt_lib.cloth_pass(b.parts, ['jacket_morato', 'pants_morato'], H)
b.export(OUT)
