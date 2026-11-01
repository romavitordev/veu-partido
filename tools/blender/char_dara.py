"""
DARA ALICE VENTURINI — public/models/dara.glb (Os Cinco, a Médica de Campo; pedido de 2026-10-31 "completar Os Cinco").
Referência: wiki "Dara Alice Venturini" (arte de Sinais do Outro Lado). 19 anos, 1,57 m, pele clara, cabelo CASTANHO
CURTO, olhos escuros, FAIXA CIANO amarrada na cabeça; GARGANTILHA vermelha com detalhe dourado; SOBRETUDO PRETO;
óculos de aviador VERMELHO de armação dourada pendurado na blusa ESVERDEADA (da banda The Pression) com laço vermelho
na gola; calça MARROM com a barra dobrada, sapatos marrons, meia VERMELHA no pé direito e CIANO no esquerdo; bolsas e
bandoleiras com a lanterna UV, o radar e o alicate; o WALKIE-TALKIE no braço esquerdo; luva marrom e ciano; a BOLSA
ENORME no ombro. Montado sobre o script da Erin (lib.Builder + acabamento sculpt_lib).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'dara.glb'
b = Builder(width=0.86, bulk=0.88, height=0.875)  # 1,57 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_dara', '#efcdb6', 0.8),
    'face': material('face_dara', '#ffffff', 0.8),
    'torso': material('shirt_dara', '#3a8070', 0.85),  # a blusa ESVERDEADA (wiki: 'blusa esverdeada'; turquesa na arte promocional)
    'arm': material('coat_dara', '#141416', 0.8),
    'handL': material('glove_dara', '#6a4428', 0.7),
    'handR': material('skin_dara', '#efcdb6', 0.8),
    'legs': material('pants_dara', '#3e2c20', 0.9),  # calça MARROM com as barras dobradas (wiki); escura como na arte
    'feet': material('shoe_dara', '#4a3020', 0.65),  # sapatos marrons (wiki)
}
coat = M['arm']
cyan = material('cyan_dara', '#2ab8c8', 0.7)
red = material('red_dara', '#b0202a', 0.7)
gold = material('gold_dara', '#d0a640', 0.35, metal=0.8)
strap = material('strap_dara', '#3a2a1e', 0.8)
bag = material('bag_dara', '#7a5a38', 0.85)
blackp = material('plastic_dara', '#1e1e22', 0.5)
uv = material('uv_dara', '#9a5aff', 0.3, emission='#7a3aff', strength=1.5)
hairm = material('hair_dara', '#6a3420', 0.55)  # castanho-avermelhado
white = material('white_dara', '#e8e8e0', 0.8)

hc = b.body(M, [(-0.11, 0.146), (0.0, 0.146), (0.17, 0.136), (0.36, 0.178), (0.47, 0.186), (0.57, 0.104), (0.63, 0.062)],
            arm_r=(0.056, 0.045, 0.038), leg_r=(0.08, 0.062, 0.048), head_r=(0.134, 0.144, 0.156))

# a GOLA BRANCA da blusa (gola de marinheiro, arte promocional)
for s in (1, -1):
    b.add(f'collar_w{s}', tube([(s * 0.03 * H, -0.1 * H, hz + 0.6 * H, 0.012 * H, 0.004 * H), (s * 0.07 * H, -0.12 * H, hz + 0.55 * H, 0.016 * H, 0.004 * H), (s * 0.09 * H, -0.125 * H, hz + 0.5 * H, 0.012 * H, 0.004 * H)], 6), white, region='torso', subdiv=0)
# o laço vermelho da gola e a gargantilha com o detalhe dourado
b.add('bow', merge(ellipsoid((-0.025 * H, -0.105 * H, hz + 0.56 * H), (0.03, 0.014, 0.02), 8, 5), ellipsoid((0.025 * H, -0.105 * H, hz + 0.56 * H), (0.03, 0.014, 0.02), 8, 5)), red, region='torso', subdiv=0)
b.add('choker', tube([(0, 0, 1.62 * H, 0.06 * H, 0.06 * H), (0, 0, 1.645 * H, 0.06 * H, 0.06 * H)], 14), red, region='neck', subdiv=0)
b.add('choker_gold', ellipsoid((0, -0.06 * H, 1.63 * H), (0.012, 0.008, 0.012), 6, 4), gold, region='neck', subdiv=0)
# os óculos de aviador vermelhos pendurados na blusa
for s in (1, -1):
    c = (s * 0.035 * H, -0.13 * H, hz + 0.5 * H)
    b.add(f'avi_rim{s}', ellipsoid(c, (0.03, 0.01, 0.024), 10, 6), gold, region='torso', subdiv=0)
    b.add(f'avi_lens{s}', ellipsoid((c[0], c[1] - 0.006, c[2]), (0.026, 0.008, 0.02), 10, 6), red, region='torso', subdiv=0)

# o SOBRETUDO PRETO aberto (wiki: "sobretudo preto"), até o meio da coxa
ct = [(hz - 0.24 * H, 0.21 * H, 0.165 * H), (hz - 0.06 * H, 0.2 * H, 0.155 * H), (hz + 0.16 * H, 0.172 * H, 0.13 * H), (hz + 0.36 * H, 0.21 * H, 0.148 * H), (hz + 0.48 * H, 0.218 * H, 0.15 * H), (hz + 0.57 * H, 0.15 * H, 0.112 * H), (hz + 0.62 * H, 0.108 * H, 0.09 * H)]
b.add('coat', open_tube(ct, gap=0.2, seg=26), coat, region='skirt')
# o BRACELETE DOURADO mecânico no braço esquerdo (arte)
sL, eL0 = sk['sL'], sk['eL']
b.add('bracer', tube(limb_rings(sL.lerp(eL0, 0.35), sL.lerp(eL0, 0.65), 0.062, 0.058, n=2), 12), gold, region='eL', subdiv=0)
# as BOLSAS das coxas na calça cargo
for side, s in (('L', 1), ('R', -1)):
    l, k = sk['l' + side], sk['k' + side]
    p = l.lerp(k, 0.45)
    b.add('thighpouch' + side, box((p.x + s * 0.075, p.y - 0.02, p.z), (0.03, 0.07, 0.09), bevel=0.008), bag, region='l' + side, subdiv=0)
    b.add('thighstrap' + side, tube(limb_rings(l.lerp(k, 0.4), l.lerp(k, 0.44), 0.085, 0.085, n=1), 12), strap, region='l' + side, subdiv=0)
for s in (1, -1):
    lap = [(s * 0.065 * H, -0.098 * H, hz + 0.6 * H, 0.028 * H, 0.008 * H), (s * 0.11 * H, -0.13 * H, hz + 0.5 * H, 0.036 * H, 0.008 * H), (s * 0.13 * H, -0.145 * H, hz + 0.4 * H, 0.022 * H, 0.008 * H)]
    b.add(f'lapel{s}', tube(lap, 6), coat, region='torso', subdiv=0)
for side in ('L', 'R'):
    sh, e = sk['s' + side], sk['e' + side]
    b.add('cuff' + side, tube(limb_rings(e.lerp(sk['hand' + side], 0.72), e.lerp(sk['hand' + side], 0.86), 0.05, 0.05, n=1), 12), coat, region='e' + side, subdiv=0)

# a BANDOLEIRA cruzando o peito e a ALÇA da bolsa grande no ombro direito
for k, s in enumerate((1, -1)):  # as alças de couro verticais (suspensório da bolsa, arte promocional)
    pts = [(s * 0.1 * H, -0.12 * H, hz + 0.58 * H, 0.016 * H, 0.006 * H), (s * 0.095 * H, -0.142 * H, hz + 0.36 * H, 0.016 * H, 0.006 * H), (s * 0.09 * H, -0.135 * H, hz + 0.08 * H, 0.016 * H, 0.006 * H)]
    b.add(f'bandolier{k}', tube(pts, 6), strap, region='torso', subdiv=0)
# a bolsa enorme pendurada no quadril esquerdo, maior que o tronco
b.add('bigbag', box((0.21 * H, 0.02 * H, hz + 0.02 * H), (0.11 * H, 0.22 * H, 0.2 * H), bevel=0.02), bag, region='torso', subdiv=0)
b.add('bigbag_flap', box((0.21 * H, -0.02 * H, hz + 0.1 * H), (0.115 * H, 0.16 * H, 0.06 * H), bevel=0.01), strap, region='torso', subdiv=0)
# o cinto com as bolsinhas, a LANTERNA UV, o RADAR e o ALICATE
b.add('belt', tube([(0, 0, hz + 0.02 * H, 0.168 * H, 0.122 * H), (0, 0, hz + 0.065 * H, 0.168 * H, 0.122 * H)], 22), strap, region='torso', subdiv=0)
for k, a in enumerate((-0.8, -0.3, 0.3)):
    p = Vector((math.sin(a) * 0.175 * H, -math.cos(a) * 0.13 * H, hz + 0.035 * H))
    b.add(f'pouch{k}', box(tuple(p), (0.055, 0.035, 0.06), bevel=0.006), bag, region='torso', subdiv=0)
lp = Vector((-0.17 * H, -0.06 * H, hz - 0.02 * H))
b.add('uv_lamp', tube([(lp.x, lp.y, lp.z - 0.07, 0.018, 0.018), (lp.x, lp.y, lp.z + 0.04, 0.02, 0.02), (lp.x, lp.y, lp.z + 0.06, 0.026, 0.026)], 10), blackp, region='torso', subdiv=0)
b.add('uv_glass', ellipsoid((lp.x, lp.y, lp.z + 0.065), (0.022, 0.022, 0.006), 10, 4), uv, region='torso', subdiv=0)
b.add('radar', box((-0.12 * H, 0.1 * H, hz + 0.04 * H), (0.06, 0.03, 0.08), bevel=0.006), blackp, region='torso', subdiv=0)
b.add('pliers', merge(box((0.1 * H, -0.12 * H, hz - 0.03 * H), (0.008, 0.008, 0.07)), box((0.112 * H, -0.12 * H, hz - 0.03 * H), (0.008, 0.008, 0.07))), red, region='torso', subdiv=0)

# o WALKIE-TALKIE preso no braço esquerdo e a faixa ciano da luva
eL, hL = sk['eL'], sk['handL']
wt = eL.lerp(hL, 0.4)
b.add('walkie', box((wt.x + 0.045, wt.y, wt.z), (0.025, 0.04, 0.07), bevel=0.005), blackp, region='eL', subdiv=0)
b.add('walkie_ant', box((wt.x + 0.045, wt.y + 0.012, wt.z + 0.06), (0.006, 0.006, 0.05)), blackp, region='eL', subdiv=0)
gb = hL.lerp(eL, 0.08)
b.add('glove_band', tube([(gb.x, gb.y, gb.z, 0.042, 0.042), (gb.x, gb.y, gb.z + 0.018, 0.042, 0.042)], 10), cyan, region='eL', subdiv=0)

# barras dobradas da calça e as meias de cores diferentes (vermelha na direita, ciano na esquerda)
for side, sock in (('L', cyan), ('R', red)):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('cuffpant' + side, tube(limb_rings(k.lerp(f, 0.78), k.lerp(f, 0.86), 0.058, 0.058, n=1), 12), M['legs'], region='k' + side, subdiv=0)
    b.add('sock' + side, tube(limb_rings(k.lerp(f, 0.86), f + Vector((0, 0, 0.045)), 0.046, 0.046, n=1), 12), sock, region='k' + side, subdiv=0)
    b.add('sole' + side, sole_part((f.x, f.y - 0.05, f.z - 0.022), (0.1 * H, 0.24 * H, 0.022)), material('sole_dara', '#2a1c12', 0.9), region='k' + side, subdiv=0)

# ---------------- cabelo castanho CURTO (na altura do queixo) e a FAIXA CIANO amarrada
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.012), (0.146 * H, 0.156 * H, 0.168 * H), front=0.24, side=0.5, back=0.6), hairm, region='head')
HC = Vector((hc.x, hc.y + 0.006, hc.z + 0.012))
HR = (0.146 * H, 0.156 * H, 0.168 * H)
random.seed(19)
locks = []
for i in range(20):
    u = i / 19
    a = math.pi * 0.3 + u * math.pi * 1.4
    top = HC + Vector((math.sin(a) * HR[0] * 0.55, -math.cos(a) * HR[1] * 0.55, HR[2] * 0.95))
    mid = HC + Vector((math.sin(a) * HR[0] * 1.06, -math.cos(a) * HR[1] * 1.06, -0.02 * H))
    o = Vector((math.sin(a), -math.cos(a), 0))
    ln = random.uniform(0.08, 0.11) * H  # curto: termina no queixo
    pts, rad = [], []
    for k in range(7):
        t = k / 6
        q = top.lerp(mid, min(1.0, t * 2.0)) if t < 0.5 else mid + Vector((0, 0, -ln * (t - 0.5) / 0.5))
        q = q + o * (math.sin(t * math.pi * 2 + i) * 0.008 * H * t)
        pts.append(q)
        rad.append((0.028 - 0.02 * t ** 1.5) * H)
    locks.append(tube([(q.x, q.y, q.z, r, r) for q, r in zip(pts, rad)], 6))
b.add('hair_locks', merge(*locks), hairm, region='head', subdiv=0)
for i in range(5):
    x = 0.07 - i * 0.03
    b.add(f'bang{i}', tube([(x, -0.125 * H, hc.z + 0.13, 0.028, 0.015), (x - 0.03, -0.14 * H, hc.z + 0.1, 0.022, 0.011), (x - 0.05, -0.142 * H, hc.z + 0.08, 0.01, 0.007)], 6), hairm, region='head', subdiv=0)
bz = hc.z + 0.1 * H
b.add('headband', tube([(0, 0.0, bz - 0.014, 0.15 * H, 0.16 * H), (0, 0.0, bz + 0.014, 0.148 * H, 0.158 * H)], 24, cap_start=False, cap_end=False), cyan, region='head', subdiv=0)
b.add('headband_knot', merge(ellipsoid((0.04, 0.155 * H, bz), (0.02, 0.012, 0.016), 6, 4), tube([(0.04, 0.16 * H, bz, 0.012, 0.006), (0.07, 0.17 * H, bz - 0.08, 0.01, 0.005)], 5)), cyan, region='head', subdiv=0)
# o LAÇO da bandana em cima da cabeça (as duas orelhas do laço)
for s in (1, -1):
    b.add(f'bow_top{s}', ellipsoid((0.05 * H + s * 0.035 * H, -0.03 * H, bz + 0.08 * H), (0.035 * H, 0.012 * H, 0.025 * H), 8, 5), cyan, region='head', subdiv=0)

import sculpt_lib
sculpt_lib.cloth_pass(b.parts, ['shirt_dara', 'pants_dara', 'coat_dara'], H)
sculpt_lib.hair_pass(b.parts, ['hair_dara'], H, (hc.x, hc.y, hc.z))
b.export(OUT)
