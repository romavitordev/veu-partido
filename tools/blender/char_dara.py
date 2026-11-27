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
import bpy
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, hug
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
    'arm': material('skin_dara', '#efcdb6', 0.8),  # os braços e os ombros NUS: o sobretudo caiu até os cotovelos (arte)
    'handL': material('glove_dara', '#6a4428', 0.7),
    'handR': material('skin_dara', '#efcdb6', 0.8),
    'legs': material('pants_dara', '#3e2c20', 0.9),  # calça MARROM com as barras dobradas (wiki); escura como na arte
    'feet': material('shoe_dara', '#4a3020', 0.65),  # sapatos marrons (wiki)
}
coat = material('coat_dara', '#141416', 0.8)
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
TORSO = bpy.data.objects['torso']
# a FITA VERMELHA da gola: um nó pequeno e as duas pontas caindo sobre a blusa (arte promocional)
knot = hug(TORSO, [Vector((0, -0.1 * H, hz + 0.565 * H))], 0.012 * H)[0]
b.add('bow', ellipsoid(tuple(knot), (0.016 * H, 0.01 * H, 0.013 * H), 8, 6), red, region='torso', subdiv=0)
for s_ in (1, -1):
    tail = hug(TORSO, [Vector((s_ * (0.004 + 0.012 * t) * H, -0.1 * H, hz + (0.56 - 0.085 * t) * H)) for t in (0, 0.35, 0.7, 1.0)], 0.009 * H)
    b.add(f'bowtail{s_}', rod(tail, [0.009 * H, 0.009 * H, 0.008 * H, 0.004 * H], 6, flat=(lambda q: Vector((q.x, q.y, 0)), 0.35)), red, region='torso', subdiv=0)
b.add('choker', tube([(0, 0, 1.62 * H, 0.06 * H, 0.06 * H), (0, 0, 1.645 * H, 0.06 * H, 0.06 * H)], 14), red, region='neck', subdiv=0)
b.add('choker_gold', ellipsoid((0, -0.06 * H, 1.63 * H), (0.012, 0.008, 0.012), 6, 4), gold, region='neck', subdiv=0)
# os óculos de AVIADOR vermelhos de armação dourada, presos pela haste na blusa, do lado DIREITO dela (arte): colados na
# superfície (antes flutuavam na frente do peito e a auditoria os acusava como peças soltas)
gc = hug(TORSO, [Vector((-0.075 * H, -0.1 * H, hz + 0.42 * H))], 0.006 * H)[0]
for k, dz in enumerate((0.0, -0.05 * H)):
    c = gc + Vector((0.004 * H * k, -0.006 * H, dz))
    b.add(f'avi_rim{k}', ellipsoid(tuple(c), (0.026 * H, 0.009 * H, 0.022 * H), 10, 6), gold, region='torso', subdiv=0)
    b.add(f'avi_lens{k}', ellipsoid(tuple(c + Vector((0, -0.004 * H, 0))), (0.022 * H, 0.008 * H, 0.019 * H), 10, 6), red, region='torso', subdiv=0)
b.add('avi_bridge', rod([gc + Vector((0, -0.008 * H, -0.012 * H)), gc + Vector((0.004 * H, -0.01 * H, -0.025 * H)), gc + Vector((0.004 * H, -0.008 * H, -0.038 * H))], 0.003 * H, 5), gold, region='torso', subdiv=0)

# o SOBRETUDO PRETO aberto, CAÍDO DOS OMBROS (arte promocional): o corpo começa na altura das axilas, solto em volta do
# tronco e bem aberto na frente (a blusa aparece), até o meio da coxa
ct = [(hz - 0.24 * H, 0.215 * H, 0.17 * H), (hz - 0.06 * H, 0.205 * H, 0.16 * H), (hz + 0.16 * H, 0.18 * H, 0.138 * H), (hz + 0.33 * H, 0.215 * H, 0.152 * H), (hz + 0.43 * H, 0.235 * H, 0.158 * H)]
b.add('coat', open_tube(ct, gap=0.24, seg=26), coat, region='skirt')
# as MANGAS do sobretudo, soltas do meio do braço ao pulso, com a borda de cima dobrada; a gola enrolada passa por trás
# das costas e liga uma manga à outra
for side, s_ in (('L', 1), ('R', -1)):
    sh_, el_, ha_ = sk['s' + side], sk['e' + side], sk['hand' + side]
    b.add('sleeve' + side, tube(limb_rings(sh_.lerp(el_, 0.45), el_.lerp(ha_, 0.8), 0.058, 0.055, n=6, bulge=0.07), 14, cap_start=False, cap_end=False), coat, region='e' + side, subdiv=0)
    # a borda dobrada: um anel arredondado (não a boca reta de um cano)
    rc = sh_.lerp(el_, 0.45)
    ax = (el_ - sh_).normalized()
    ring = [rc + (ax.cross(Vector((0, 1, 0))).normalized() * math.cos(t) + ax.cross(Vector((1, 0, 0))).normalized() * math.sin(t)) * 0.058 for t in [k / 20 * 2 * math.pi for k in range(21)]]
    b.add('sleeveroll' + side, rod(ring, 0.011, 8, caps=False), coat, region='e' + side, subdiv=0)
sl, sr = sk['sL'].lerp(sk['eL'], 0.43), sk['sR'].lerp(sk['eR'], 0.43)
back = [sr.lerp(sl, t) + Vector((0, 0.15 * H * math.sin(t * math.pi) + 0.02 * H, -0.03 * H * math.sin(t * math.pi))) for t in [k / 12 for k in range(13)]]
b.add('coatcollar', rod(back, 0.03 * H, 8), coat, region='torso', subdiv=0)
# o BRACELETE DOURADO mecânico no braço esquerdo (arte)
sL, eL0 = sk['sL'], sk['eL']
sp = sL + Vector((0.01 * H, -0.02 * H, 0.03 * H))  # a OMBREIRA mecânica dourada sobre a alça da blusa (arte)
b.add('bracer', ellipsoid(tuple(sp), (0.05 * H, 0.05 * H, 0.03 * H), 12, 8), gold, region='torso', subdiv=0)
b.add('bracer_core', ellipsoid(tuple(sp + Vector((0, -0.012 * H, 0.022 * H))), (0.022 * H, 0.022 * H, 0.014 * H), 10, 6), material('brass_dark_dara', '#7a5a20', 0.4, metal=0.8), region='torso', subdiv=0)
# as BOLSAS das coxas na calça cargo
for side, s in (('L', 1), ('R', -1)):
    l, k = sk['l' + side], sk['k' + side]
    p = l.lerp(k, 0.45)
    b.add('thighpouch' + side, box((p.x + s * 0.075, p.y - 0.02, p.z), (0.03, 0.07, 0.09), bevel=0.008), bag, region='l' + side, subdiv=0)
    # raio 0,085 fazia as duas alças se cruzarem entre as coxas (z-fighting); agora mais justas e 4 mm para fora
    o_ = Vector((s * 0.004, 0, 0))
    b.add('thighstrap' + side, tube(limb_rings(l.lerp(k, 0.4) + o_, l.lerp(k, 0.44) + o_, 0.077, 0.077, n=1), 12), strap, region='l' + side, subdiv=0)
for side in ('L', 'R'):  # o punho CIANO da blusa aparecendo na boca da manga (arte)
    e, hnd = sk['e' + side], sk['hand' + side]
    b.add('cuff' + side, tube(limb_rings(e.lerp(hnd, 0.8), e.lerp(hnd, 0.86), 0.061, 0.056, n=1), 12), cyan, region='e' + side, subdiv=0)

# a BANDOLEIRA cruzando o peito e a ALÇA da bolsa grande no ombro direito
for k, s in enumerate((1, -1)):  # as alças de couro verticais (suspensório da bolsa, arte promocional)
    pts = [(s * 0.1 * H, -0.12 * H, hz + 0.58 * H, 0.016 * H, 0.006 * H), (s * 0.095 * H, -0.142 * H, hz + 0.36 * H, 0.016 * H, 0.006 * H), (s * 0.09 * H, -0.128 * H, hz + 0.05 * H, 0.016 * H, 0.005 * H)]
    b.add(f'bandolier{k}', tube(pts, 6), strap, region='torso', subdiv=0)
# a bolsa enorme pendurada no quadril esquerdo, maior que o tronco
# a BOLSA ENORME de primeiros socorros pendurada no quadril esquerdo, POR TRÁS do braço (antes uma caixa saltando da manga)
BG = Vector((0.2 * H, 0.09 * H, hz - 0.03 * H))
Bs = Sculpt()
Bs.ell(BG, (0.06 * H, 0.15 * H, 0.12 * H))
Bs.ell(BG + Vector((0, 0, 0.07 * H)), (0.055 * H, 0.14 * H, 0.06 * H))
b.add('bigbag', Bs.mesh(res=0.007, smooth=2, target=1200), bag, region='torso', subdiv=0)
b.add('bigbag_flap', box(tuple(BG + Vector((0.052 * H, 0, 0.06 * H))), (0.012 * H, 0.13 * H, 0.07 * H), bevel=0.01), strap, region='torso', subdiv=0)
b.add('bigbag_cross', box(tuple(BG + Vector((0.066 * H, 0, 0.03 * H))), (0.004 * H, 0.03 * H, 0.03 * H)), red, region='torso', subdiv=0)  # a cruz de primeiros socorros
# o cinto com as bolsinhas, a LANTERNA UV, o RADAR e o ALICATE
b.add('belt', tube([(0, 0, hz + 0.02 * H, 0.168 * H, 0.122 * H), (0, 0, hz + 0.065 * H, 0.168 * H, 0.122 * H)], 22), strap, region='torso', subdiv=0)
for k, a in enumerate((-1.25, -0.75, -0.3, 0.3, 0.75)):
    p = Vector((math.sin(a) * 0.182 * H, -math.cos(a) * 0.136 * H, hz + 0.02 * H))
    b.add(f'pouch{k}', box(tuple(p), (0.05, 0.03, 0.055 + 0.01 * (k % 2)), bevel=0.008), bag, region='torso', subdiv=0)
lp = Vector((-0.17 * H, -0.06 * H, hz - 0.02 * H))
b.add('uv_lamp', tube([(lp.x, lp.y, lp.z - 0.07, 0.018, 0.018), (lp.x, lp.y, lp.z + 0.04, 0.02, 0.02), (lp.x, lp.y, lp.z + 0.06, 0.026, 0.026)], 10), blackp, region='torso', subdiv=0)
b.add('uv_glass', ellipsoid((lp.x, lp.y, lp.z + 0.065), (0.022, 0.022, 0.006), 10, 4), uv, region='torso', subdiv=0)
b.add('radar', box((-0.12 * H, 0.1 * H, hz + 0.04 * H), (0.06, 0.03, 0.08), bevel=0.006), blackp, region='torso', subdiv=0)
b.add('pliers', merge(box((0.1 * H, -0.12 * H, hz - 0.03 * H), (0.008, 0.008, 0.07)), box((0.112 * H, -0.12 * H, hz - 0.03 * H), (0.008, 0.008, 0.07))), red, region='torso', subdiv=0)

# o WALKIE-TALKIE preso no braço esquerdo e a faixa ciano da luva
eL, hL = sk['eL'], sk['handL']
wt = eL.lerp(hL, 0.4)
b.add('walkie', box((wt.x + 0.075, wt.y, wt.z), (0.025, 0.04, 0.07), bevel=0.005), blackp, region='eL', subdiv=0)
b.add('walkie_ant', box((wt.x + 0.075, wt.y + 0.012, wt.z + 0.06), (0.006, 0.006, 0.05)), blackp, region='eL', subdiv=0)
gb = hL.lerp(eL, 0.08)
b.add('glove_band', tube([(gb.x, gb.y, gb.z, 0.042, 0.042), (gb.x, gb.y, gb.z + 0.018, 0.042, 0.042)], 10), cyan, region='eL', subdiv=0)

# barras dobradas da calça e as meias de cores diferentes (vermelha na direita, ciano na esquerda)
for side, sock in (('L', cyan), ('R', red)):
    k, f = sk['k' + side], sk['foot' + side]
    # (2026-11-26, fatia 4) antes a barra ficava no tornozelo e a meia (raio 0,046) sumia DENTRO da perna (0,048):
    # agora a calça está dobrada no meio da canela, com uma barra larga e um rolo grosso, e a meia cobre dali até o sapato
    c0, c1 = k.lerp(f, 0.48), k.lerp(f, 0.58)
    b.add('cuffpant' + side, tube(limb_rings(c0, c1, 0.065, 0.066, n=1), 14, cap_start=False, cap_end=False), M['legs'], region='k' + side, subdiv=0)
    ax = (f - k).normalized(); u_ = ax.cross(Vector((1, 0, 0))).normalized(); w_ = ax.cross(u_).normalized()
    for cc, rr, th in ((c1, 0.066, 0.009), (c0, 0.065, 0.006)):  # o rolo da dobra embaixo e a costura em cima
        ring = [cc + (u_ * math.cos(t) + w_ * math.sin(t)) * rr for t in [j / 20 * 2 * math.pi for j in range(21)]]
        b.add('cuffroll' + side, rod(ring, th, 8, caps=False), M['legs'], region='k' + side, subdiv=0)
    s0 = k.lerp(f, 0.58)
    b.add('sock' + side, tube(limb_rings(s0, f + Vector((0, 0, 0.04)), 0.058, 0.051, n=2), 12, cap_start=False, cap_end=False), sock, region='k' + side, subdiv=0)
    for j in range(3):  # as listras do punho da meia, que aparecem logo abaixo da dobra
        sp_ = k.lerp(f, 0.61 + j * 0.03)
        ring = [sp_ + (u_ * math.cos(t) + w_ * math.sin(t)) * 0.0575 for t in [i / 16 * 2 * math.pi for i in range(17)]]
        b.add('sockrib' + side, rod(ring, 0.0035, 6, caps=False), sock, region='k' + side, subdiv=0)
    b.add('sole' + side, sole_part((f.x, f.y - 0.05, f.z - 0.022), (0.1 * H, 0.24 * H, 0.022)), material('sole_dara', '#2a1c12', 0.9), region='k' + side, subdiv=0)

# ---------------- o CABELO: chanel LISO castanho-acobreado na altura do queixo, franja jogada de lado, e a FAIXA CIANO
# (polido em 2026-11-26 pela arte promocional de Sinais do Outro Lado: antes eram tiras espetadas soltas, como peruca).
# Método da Cindy (memória "lições de cabelo"): uma CALOTA contínua no Sculpt e as mechas fundidas nela, nunca tiras soltas.
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
random.seed(19)
Hr = Sculpt()
Hr.ell(Vh(0, 0.012, 0.03), (0.148 * H, 0.158 * H, 0.15 * H))  # a calota
Hr.ell(Vh(0, 0.05, -0.055), (0.142 * H, 0.118 * H, 0.105 * H))  # o volume de trás, até a nuca
BOB = -0.128  # onde o chanel termina (a linha do queixo)
for i in range(120):
    th = random.uniform(-math.pi, math.pi)  # 0 = frente (-y)
    ph = random.uniform(0.25, 1.15)
    if abs(th) < 1.3:  # a frente é só da franja: uma mecha da frente desceria reta sobre o rosto (as laterais o emolduram)
        continue
    o = Vector((math.sin(th), -math.cos(th), 0))
    base = HC + Vector((o.x * math.sin(ph) * 0.146 * H, o.y * math.sin(ph) * 0.154 * H + 0.012 * H, math.cos(ph) * 0.15 * H + 0.03 * H))
    side = HC + Vector((o.x * 0.152 * H, o.y * 0.158 * H + 0.012 * H, -0.03 * H))  # o volume lateral (liso, cai reto)
    end = HC + Vector((o.x * 0.138 * H, o.y * 0.146 * H + 0.012 * H, (BOB + random.uniform(-0.006, 0.006)) * H))  # a ponta vira para dentro
    Hr.chain([base, side, end], [0.032 * H, 0.03 * H, 0.016 * H], step=0.45)
# a FRANJA jogada de lado: nasce numa risca à esquerda dela (+x) e cai em diagonal sobre a testa até a sobrancelha
for i in range(9):  # mechas separadas (pontas finas e desiguais), não um rolo
    u = i / 8
    j = random.uniform(-0.008, 0.008)
    top = Vh(0.065 - 0.06 * u, -0.1 + 0.015 * u, 0.138 - 0.008 * u)
    mid = Vh(0.03 - 0.09 * u + j, -0.149, 0.108 - 0.014 * u)
    tip = Vh(-0.015 - 0.1 * u + j, -0.146 + 0.028 * u, 0.072 - 0.03 * u + random.uniform(-0.01, 0.006))
    Hr.chain([top, mid, tip], [0.014 * H, 0.009 * H, 0.0025 * H], step=0.4)
Hr.ell(Vh(0, -0.15, -0.055), (0.118 * H, 0.105 * H, 0.118 * H), neg=True)  # o rosto livre


def straight(p):  # fios LISOS: sulcos verticais finos, sem bagunça
    return 0.0028 * H * (ridge(math.atan2(p.x - HC.x, p.y - HC.y) * 26 + n3(p, 18) * 1.2, 2) - 0.4)


HAIR = b.add('hair', Hr.mesh(res=0.0055, smooth=2, disp=straight, target=5000), hairm, region='head', subdiv=0)

# a FAIXA (bandana ciano): passa pelo alto da cabeça atrás da franja, de orelha a orelha, e desce por baixo do cabelo na nuca
U = Vector((0, -0.5, 0.866))  # o plano da faixa: inclinado para a frente
X = Vector((1, 0, 0))
# só o arco de cima aparece: nas laterais a faixa entra por baixo do cabelo (as pontas afinam para dentro dele)
ts = [0.2 + (math.pi - 0.4) * k / 30 for k in range(31)]
band = hug(HAIR, [HC + (X * math.cos(t) + U * math.sin(t)) * 0.16 * H for t in ts], 0.004 * H, center=HC)
band = [q - (q - HC).normalized() * 0.012 * H * max(0.0, 1 - min(k, 30 - k) / 3) for k, q in enumerate(band)]
b.add('headband', rod(band, 0.016 * H, 6, caps=False, flat=(lambda q: q - HC, 0.35)), cyan, region='head', subdiv=0)
# o NÓ no alto (um pouco para a direita dela) e as duas pontas para cima, como orelhas
kt = hug(HAIR, [HC + (X * math.cos(1.75) + U * math.sin(1.75)) * 0.16 * H], 0.012 * H, center=HC)[0]
nrm = (kt - HC).normalized()
b.add('headband_knot', ellipsoid(tuple(kt), (0.022 * H, 0.02 * H, 0.016 * H), 8, 6), cyan, region='head', subdiv=0)
for s in (1, -1):
    tip = kt + nrm * 0.075 * H + Vector((s * 0.055 * H, 0.01 * H, 0))
    midp = kt.lerp(tip, 0.5) + nrm * 0.01 * H
    b.add(f'headband_end{s}', rod([kt, midp, tip], [0.016 * H, 0.014 * H, 0.004 * H], 6, flat=(lambda q: Vector((0, -1, 0.2)), 0.3)), cyan, region='head', subdiv=0)

import sculpt_lib
sculpt_lib.cloth_pass(b.parts, ['shirt_dara', 'pants_dara', 'coat_dara'], H)
b.export(OUT)
