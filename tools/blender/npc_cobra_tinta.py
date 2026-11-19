"""
COBRA INFECTADA PELA TINTA — O Segredo na Ilha (wiki "Cobras Infectadas"; a miniatura enviada pelo dono em 2026-11-19:
"essas são as criaturas da ilha"). Como os outros animais da ilha (npc_bicho_lib.py): cadáver que anda, as escamas
ocre e marrons com faixas escuras, partes da carne derretida com as COSTELAS à mostra, as VEIAS marrom-avermelhadas
saindo de dentro do corpo, os olhos pequenos e vermelhos e a boca escancarada com as presas compridas.
Comprida (≈ 3,3 m) e grossa; ergue a frente do corpo para dar o bote (a arte mostra a cabeça alta, a boca aberta).

JUNTAS (animadas em código, src/combat/beasts.js → InkSnake): J_body (a raiz no chão), J_seg0 … J_seg9 em cadeia (seg0
é o pescoço, logo atrás da cabeça; cada um é filho do anterior e fica 0,33 m atrás dele, ao longo de -z), J_head (filha
do seg0, na frente) e J_jaw (filha da cabeça). Modelada esticada e reta, olhando para +z; o jogo ondula e ergue.
PROPOSTA: o tamanho e as faixas (a miniatura não dá escala).
"""
import sys
import os
import math
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector

from lib import reset, material, export_glb, hex_rgb
from npc_lib import rod, curve, joint, add, finish
from npc_sculpt_lib import Sculpt, vcol_material, ridge, n3, white_vcols

random.seed(31)
reset()
M = {
    'skin': vcol_material('pele_cobra', 0.6),
    'tooth': material('tooth_cobra', '#e0d2ac', 0.35),
    'maw': material('maw_cobra', '#1a0604', 0.8),
    'eye': material('glow_cobra', '#ff3a20', 0.3, emission='#ff3a20', strength=2.5),
    'goo': material('goo_cobra', '#5a1c10', 0.3),
    'tongue': material('flesh_lingua_cobra', '#8a2a30', 0.45),
}
C = {k: Vector(hex_rgb(v)) for k, v in {
    'ochre': '#6a4e26', 'band': '#33200e', 'belly': '#9a7c4c', 'dark': '#1a1008',
    'flesh': '#6a1e18', 'vein': '#8a2414', 'bone': '#c8b48c',
}.items()}

N = 10  # segmentos
SEG = 0.33
# o raio ao longo do corpo: o pescoço um pouco mais fino, o meio grosso, a cauda afinando até a ponta
R = [0.085, 0.1, 0.112, 0.118, 0.118, 0.112, 0.1, 0.082, 0.058, 0.032, 0.008]
FLESH = {2: 1, 5: -1}  # os segmentos com a carne aberta e as costelas (o lado de cada um)


def scales(p):
    """as escamas: um losango em relevo baixo (duas cristas cruzadas)"""
    x, y, z = p
    a = ridge((z * 0.9 + x * 1.2) * 70, 2)
    b = ridge((z * 0.9 - x * 1.2) * 70, 2)
    return 0.006 * (min(a, b) - 0.3) + 0.004 * n3(p, 9)


def color_for(i0):
    """a cor: ocre por cima com FAIXAS marrons atravessadas (mais claras na barriga); carne, veias e ossos por tag"""
    def f(p, sc):
        fld = sc.field(p)
        if fld.get('vein', 0) > 0.25:
            return C['vein'].lerp(C['dark'], max(0.0, n3(p, 14)) * 0.5)
        if fld.get('bone', 0) > 0.3:
            return C['bone']
        if fld.get('flesh', 0) > 0.25:
            return C['flesh'].lerp(C['dark'], max(0.0, n3(p, 9)) * 0.6)
        x, y, z = p
        zz = i0 * SEG - z  # distância da cabeça
        band = 0.5 + 0.5 * math.sin(zz * 9.5 + n3(p, 3) * 1.5)
        base = C['ochre'].lerp(C['band'], max(0.0, band - 0.45) * 1.6)
        if y < -0.03:  # a barriga clara
            base = base.lerp(C['belly'], min(1.0, (-y - 0.03) * 14))
        k = max(0.0, scales(p) / 0.006 + 0.3)
        return C['dark'].lerp(base, min(1.0, 0.55 + k * 0.6))
    return f


body = joint('J_body', (0, R[3], 0))
prev = body
segs = []
for i in range(N):
    jnt = joint(f'J_seg{i}', (0, 0, 0) if i == 0 else (0, 0, -SEG), prev)
    segs.append(jnt)
    S = Sculpt(f'seg{i}_cobra')
    r0, r1 = R[i], R[i + 1]
    # o tubo do segmento, com sobra nas duas pontas (sem fresta quando ondula)
    S.chain([(0, 0, 0.06), (0, 0, -SEG * 0.5), (0, 0, -SEG - 0.04)], [r0 * 1.02, (r0 + r1) * 0.5, r1], step=0.4)
    if i in FLESH:
        sd = FLESH[i]
        # o FLANCO DERRETIDO: a carne exposta e as costelas saltando
        S.ell((sd * r0 * 0.75, 0.0, -SEG * 0.5), (r0 * 0.35, r0 * 0.7, SEG * 0.45), 'flesh')
        for k in range(4):
            z = -SEG * (0.2 + k * 0.2)
            S.chain([(sd * r0 * 0.55, r0 * 0.75, z), (sd * r0 * 1.02, 0.0, z + 0.01), (sd * r0 * 0.6, -r0 * 0.75, z)], 0.011, 'bone', step=0.5)
    if i < 8:
        # as VEIAS serpenteando por cima das escamas, saindo de dentro do corpo
        for s in (1, -1, 1, -1):
            if random.random() < 0.85:
                a0 = random.uniform(0.3, 1.6)
                pts = []
                for k in range(4):
                    a = a0 + random.uniform(-0.25, 0.25)
                    rr = r0 + (r1 - r0) * k / 3
                    pts.append((s * math.sin(a) * rr * 1.02, math.cos(a) * rr * 1.02, -SEG * (0.05 + k * 0.3)))
                S.chain(pts, [0.02, 0.017, 0.015, 0.01], 'vein', step=0.6)
    S.build(jnt, M['skin'], 900 if i < 8 else 500, res=0.008, smooth=3, disp=scales, color=color_for(i))
    if i in FLESH:
        sd = FLESH[i]
        for k in range(3):  # a gosma pingando da ferida
            z = -SEG * (0.25 + k * 0.22)
            add(jnt, f'goo{k}', rod([(sd * r0 * 0.8, -r0 * 0.4, z), (sd * r0 * 0.85, -r0 * 0.75, z), (sd * r0 * 0.85, -r0 * 1.05, z)], [0.014, 0.009, 0.002], seg=5), M['goo'])
    prev = jnt

# ================================================================ CABEÇA (a da cobra: larga atrás, focinho chato)
head = joint('J_head', (0, 0.0, 0.05), segs[0])
HL = 0.26
Hs = Sculpt('cabeca_cobra')
Hs.ell((0, 0.01, 0.06), (0.1, 0.07, 0.1))  # a parte de trás, larga (as glândulas)
Hs.ell((0, 0.015, HL * 0.62), (0.075, 0.05, 0.1))
Hs.ell((0, 0.02, HL * 0.95), (0.05, 0.035, 0.05))  # o focinho
for s in (1, -1):
    Hs.ell((s * 0.065, 0.05, HL * 0.55), (0.022, 0.022, 0.022), 'flesh', neg=True)  # a órbita funda
    Hs.ell((s * 0.072, 0.06, HL * 0.55), (0.03, 0.012, 0.03))  # a escama grossa por cima do olho
    for k in range(3):  # as veias irradiando do olho
        a = k * 2.1 + 0.3
        Hs.chain([(s * 0.07, 0.05 + math.sin(a) * 0.015, HL * 0.55 + math.cos(a) * 0.015),
                  (s * 0.085, 0.05 + math.sin(a) * 0.06, HL * 0.55 + math.cos(a) * 0.07 - 0.02)], [0.008, 0.005], 'vein', step=0.5)
Hs.build(head, M['skin'], 1100, res=0.006, smooth=3, disp=scales, color=color_for(0))
for s in (1, -1):
    add(head, f'eye{s}', rod([(s * 0.062, 0.05, HL * 0.54), (s * 0.068, 0.05, HL * 0.565)], 0.017, seg=8), M['eye'])
    add(head, f'tear{s}', rod([(s * 0.075, 0.035, HL * 0.58), (s * 0.08, 0.0, HL * 0.62), (s * 0.08, -0.05, HL * 0.6)], [0.009, 0.006, 0.0015], seg=5), M['goo'])
# o céu da boca e as PRESAS compridas (curvas para trás), mais a fileira de dentes
add(head, 'mawU', rod([(0, -0.02, 0.0), (0, -0.025, HL * 0.55), (0, -0.015, HL * 0.95)], [0.07, 0.055, 0.03], seg=10, flat=0.5), M['maw'])
for s in (1, -1):
    add(head, f'fang{s}', rod(curve((s * 0.035, -0.03, HL * 0.9), (s * 0.04, -0.1, HL * 0.92), (s * 0.03, -0.15, HL * 0.82), 6), [0.013, 0.011, 0.009, 0.006, 0.003, 0.001], seg=6), M['tooth'])
    for k in range(5):
        z = HL * (0.25 + k * 0.12)
        x = s * (0.06 - k * 0.005)
        add(head, f'toothU{s}{k}', rod([(x, -0.025, z), (x, -0.055, z - 0.01), (x, -0.075, z - 0.025)], [0.007, 0.004, 0.001], seg=5), M['tooth'])

jaw = joint('J_jaw', (0, -0.03, 0.02), head)
Js = Sculpt('mandibula_cobra')
Js.chain([(0, -0.01, 0.0), (0, -0.02, HL * 0.5), (0, -0.015, HL * 0.92)], [0.075, 0.055, 0.03], step=0.5)
Js.build(jaw, M['skin'], 500, res=0.006, smooth=2, disp=scales, color=color_for(0))
add(jaw, 'mawL', rod([(0, 0.012, 0.02), (0, 0.016, HL * 0.85)], [0.055, 0.025], seg=8, flat=0.5), M['maw'])
for s in (1, -1):
    for k in range(5):
        z = HL * (0.2 + k * 0.14)
        x = s * (0.05 - k * 0.006)
        add(jaw, f'toothL{s}{k}', rod([(x, 0.015, z), (x, 0.04, z - 0.01), (x, 0.06, z - 0.02)], [0.006, 0.0035, 0.001], seg=5), M['tooth'])
# a língua bífida pendendo para fora
add(jaw, 'tongue', rod(curve((0, 0.01, HL * 0.3), (0, 0.0, HL * 1.0), (0, -0.05, HL * 1.25), 6), [0.012, 0.012, 0.011, 0.01, 0.008, 0.006], seg=6, flat=0.4), M['tongue'])
for s in (1, -1):
    add(jaw, f'fork{s}', rod([(0, -0.05, HL * 1.25), (s * 0.02, -0.07, HL * 1.36)], [0.005, 0.001], seg=5, flat=0.5), M['tongue'])
add(jaw, 'drool', rod([(0, -0.02, HL * 0.5), (0, -0.07, HL * 0.52), (0, -0.12, HL * 0.5)], [0.012, 0.007, 0.002], seg=5), M['goo'])

white_vcols()
finish()
out = sys.argv[sys.argv.index('--') + 1]
export_glb(out)
