"""
ZUMBI DE TINTA — O Segredo na Ilha (wiki "Zumbi de Tinta"; a miniatura e a descrição do dono em 2026-11-19: a cabeça
para baixo, o corpo encurvado, os braços para baixo, a pele escurecida e a tinta escorrendo pelo corpo todo; sem rosto,
o rosto devorado num buraco de mordida com sangue, o cabelo caído cobrindo o rosto, e um rastro de tinta pelo chão).
Um morador da ilha (a regata branca rasgada e a calça escura) com a PELE ESCURECIDA, SEM ROSTO — no lugar dele um
BURACO DE MORDIDA em carne viva, sangrando —, o cabelo comprido e molhado caindo por cima do buraco, as unhas viradas
GARRAS e a TINTA escorrendo do corpo inteiro.
PROPOSTA: o morador genérico (a roupa e o cabelo), o desenho das manchas e dos escorridos.

JUNTAS nas MESMAS posições do Zumbi de Sangue fraco (npc_zumbi_lib.py): J_body, J_chest, J_neck, J_jaw, J_shL/elL/handL,
J_shR/elR/handR, J_hipL/kneeL, J_hipR/kneeR — o jogo o anima (src/combat/npcs.js → InkZombie: a cabeça baixa, o corpo
curvado e os braços pendurados; o rastro de tinta). Modelado em pé, olhando para +z.
"""
import sys
import os
import math
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector

from lib import reset, material, export_glb, hex_rgb, TAU
from npc_lib import rod, curve, spike, joint, add, finish
from npc_sculpt_lib import Sculpt, vcol_material, limb_fibers, ridge, n3, white_vcols

random.seed(41)
reset()
M = {
    'skin': vcol_material('pele_zumbi_tinta', 0.5),  # pele, roupa, veias e tinta (cor por vértice)
    'hair': material('cabelo_zumbi_tinta', '#1a1410', 0.85),
    'tooth': material('tooth_zumbi_tinta', '#d8ccaa', 0.4),
    'maw': material('maw_zumbi_tinta', '#1a0604', 0.8),
    'claw': material('claw_zumbi_tinta', '#2a1a10', 0.4),
    'ink': material('ink_zumbi_tinta', '#2a0e06', 0.2),
    'blood': material('sangue_zumbi_tinta', '#5a0606', 0.2),
    'gore': material('carne_zumbi_tinta', '#7a1612', 0.45),
}
C = {k: Vector(hex_rgb(v)) for k, v in {
    'skin': '#4a3a30', 'skinDark': '#241a14', 'vein': '#2a1208', 'ink': '#2a0e06', 'blood': '#5a0808',
    'gore': '#8a1a14', 'goreDark': '#2a0404',
    'shirt': '#a89a80', 'shirtDirt': '#4a3e2e', 'pants': '#2e2a26', 'pantsDark': '#1a1816',
}.items()}

hipY, shY, shZ, shX = 1.0, 0.64, 0.14, 0.21
upL, foreL, upR, foreR = 0.34, 0.31, 0.05, 0.04
thighL, shinL, thighR, shinR, hipX = 0.5, 0.48, 0.075, 0.05, 0.11
AMP = 0.003


def veins_at(p, scale=9, width=0.03):
    """a rede de VEIAS marrons (o fio de um ruído perto de zero)"""
    v = abs(n3((p[0] * 1.3, p[1] * 0.7, p[2] * 1.3), scale))
    return max(0.0, 1 - v / width)


def ink_at(p):
    """as MANCHAS de tinta e sangue escorrendo (mais embaixo e na frente)"""
    return n3((p[0] * 1.0, p[1] * 0.35, p[2] * 1.0), 4)


def skin_col(vein_k=1.0):
    def f(p, sc):
        base = C['skin'].lerp(C['skinDark'], max(0.0, n3(p, 5)) * 0.6)
        vk = veins_at(p) * vein_k
        if vk > 0:
            base = base.lerp(C['vein'], min(1.0, vk * 1.4))
        if ink_at(p) > 0.08:
            base = base.lerp(C['ink'], min(1.0, (ink_at(p) - 0.08) * 4))
        if veins_at((p[0] * 0.6, p[1] * 2.5, p[2] * 0.6), 6, 0.05) > 0:  # os ESCORRIDOS descendo pela pele
            base = base.lerp(C['ink'], 0.8)
        return base
    return f


def cloth_col(kind):
    def f(p, sc):
        fld = sc.field(p)
        if kind == 'shirt' and fld.get('skin', 0) > 0.4:
            return skin_col(0.8)(p, sc)
        if kind == 'shirt':
            base = C['shirt'].lerp(C['shirtDirt'], max(0.0, n3(p, 3) + 0.15) * 0.8)
        else:
            base = C['pants'].lerp(C['pantsDark'], max(0.0, n3(p, 4)) * 0.8)
        k = ink_at(p)
        if k > 0.02:
            base = base.lerp(C['ink'] if (kind == 'pants' or n3(p, 11) > 0) else C['blood'], min(1.0, (k - 0.02) * 3.0))
        if kind == 'shirt' and veins_at((p[0] * 0.6, p[1] * 2.5, p[2] * 0.6), 6, 0.06) > 0:  # os ESCORRIDOS descendo
            base = base.lerp(C['ink'], 0.85)
        return base
    return f


body = joint('J_body', (0, 0, 0))
chest = joint('J_chest', (0, hipY, 0), body)
top = (0, shY, shZ)

# ================================================================ TRONCO (a regata rasgada; os ombros e o peito à mostra)
S = Sculpt('torso_tinta')
S.ell((0, -0.03, 0.0), (0.15, 0.1, 0.1))  # pelve
S.ell((0, 0.14, 0.02), (0.15, 0.13, 0.1))  # barriga
S.ell((0, 0.34, 0.04), (0.17, 0.14, 0.11))  # costelas
S.ell((0, 0.5, 0.06), (0.2, 0.12, 0.12))  # tórax
S.ell((0, 0.62, 0.08), (0.22, 0.06, 0.1))  # cintura escapular
for s in (1, -1):
    S.ell((s * 0.19, 0.6, 0.08), (0.07, 0.07, 0.07), 'skin')  # o ombro de fora da regata
    S.ell((s * 0.08, 0.6, 0.15), (0.06, 0.05, 0.04), 'skin')  # o decote fundo
    S.ell((s * 0.1, 0.48, 0.15), (0.08, 0.06, 0.04))  # peitoral
S.ell((0.06, 0.24, 0.12), (0.07, 0.09, 0.03), 'skin')  # o RASGO na regata, a barriga à mostra

def torso_disp(p):
    x, y, z = p
    # as dobras e os rasgos do pano
    return 0.003 * (ridge((y + x * 0.4) * 30 + n3(p, 5) * 2, 2) - 0.4)

S.build(chest, M['skin'], 3000, res=0.008, disp=torso_disp, color=cloth_col('shirt'))


# ================================================================ CABEÇA: SEM ROSTO — o buraco da mordida, sangrando
neck = joint('J_neck', (0, top[1] + 0.03, top[2] + 0.06), chest)
HY = -0.07  # a cabeça desce (o pescoço era comprido demais)
HOLE = (0.0, 0.18 + HY, 0.075)  # o centro do buraco (onde era o rosto)
HR = (0.062, 0.078, 0.06)
H = Sculpt('head_tinta')
H.chain([(0, -0.04, -0.02), (0, 0.02, 0.0), (0, 0.05, 0.01)], [0.06, 0.052, 0.055])  # pescoço curto
H.ell((0, 0.25 + HY, 0.0), (0.095, 0.12, 0.11))  # crânio
H.ell((0, 0.17 + HY, 0.04), (0.08, 0.09, 0.08))  # o que sobrou da face
H.ell((0, 0.12 + HY, 0.05), (0.06, 0.04, 0.05))  # o queixo
H.ell(HOLE, HR, 'gore', neg=True)  # o BURACO: o rosto foi arrancado numa mordida
for k in range(9):  # a borda serrilhada: as marcas dos dentes que morderam
    a = k / 9 * TAU
    H.ell((HOLE[0] + math.cos(a) * HR[0] * 1.02, HOLE[1] + math.sin(a) * HR[1] * 1.02, HOLE[2] + 0.03), (0.016, 0.016, 0.03), 'gore', neg=True)
for s in (1, -1):
    H.ell((s * 0.09, 0.21 + HY, 0.0), (0.015, 0.03, 0.02))  # orelha
    for k in range(4):  # as veias escuras saindo da ferida para o crânio
        a = (k / 4 - 0.4) * 2.2
        H.chain([(s * (HR[0] + 0.005), HOLE[1] + math.sin(a) * 0.05, HOLE[2] - 0.01),
                 (s * 0.085, HOLE[1] + math.sin(a) * 0.09 + 0.02, HOLE[2] - 0.07)], [0.008, 0.005], 'vein', step=0.5)


def head_col(p, sc):
    fld = sc.field(p)
    d = math.sqrt(((p[0] - HOLE[0]) / HR[0]) ** 2 + ((p[1] - HOLE[1]) / HR[1]) ** 2 + ((p[2] - HOLE[2]) / HR[2]) ** 2)
    if d < 1.25 and p[2] > 0.02:  # a carne viva do buraco: vermelha na borda, escura no fundo
        deep = max(0.0, min(1.0, (HOLE[2] + 0.04 - p[2]) / 0.06))
        return C['gore'].lerp(C['goreDark'], min(1.0, deep * 0.85 + max(0.0, n3(p, 30)) * 0.2))
    if d < 1.6 and p[2] > 0.0:  # o sangue em volta
        return C['blood'].lerp(C['skinDark'], max(0.0, (d - 1.25) / 0.35))
    if fld.get('vein', 0) > 0.3:
        return C['vein']
    return skin_col(1.3)(p, sc)


H.build(neck, M['skin'], 2200, res=0.005, smooth=3, color=head_col)
# lá dentro: o fundo escuro, os restos de dentes e o sangue escorrendo do buraco pelo queixo e pelo pescoço
add(neck, 'holeBack', rod([(0, HOLE[1] - 0.04, HOLE[2] - 0.03), (0, HOLE[1] + 0.04, HOLE[2] - 0.035)], 0.04, seg=8, flat=0.5), M['maw'])
for i in range(4):
    x = -0.03 + i * 0.02
    add(neck, f'stub{i}', rod([(x, HOLE[1] - 0.05, HOLE[2] - 0.01), (x * 1.1, HOLE[1] - 0.035, HOLE[2] + 0.005)], [0.005, 0.002], seg=5), M['tooth'])
for i in range(6):
    x = random.uniform(-0.045, 0.045)
    y0 = HOLE[1] - HR[1] * 0.8
    L = random.uniform(0.07, 0.2)
    add(neck, f'bleed{i}', rod([(x, y0, HOLE[2] + 0.02), (x * 1.05, y0 - L * 0.5, HOLE[2] + 0.025 - L * 0.15), (x * 1.08, y0 - L, HOLE[2] + 0.005 - L * 0.3)],
                                [0.009, 0.007, 0.002], seg=5), M['blood'])
# o cabelo comprido, preto e molhado: a CALOTA justa no crânio (lição do cabelo: calota como a da Cindy) e as MECHAS
# caindo POR CIMA do buraco (com a cabeça baixa, o cabelo pende na frente e esconde o que sobrou do rosto) e pela nuca
Hc = Sculpt('cabelo_tinta')
Hc.ell((0, 0.27 + HY, 0.006), (0.106, 0.106, 0.12))
Hc.ell((0, 0.17 + HY, -0.03), (0.102, 0.13, 0.1))  # a nuca
Hc.ell((0, 0.06 + HY, 0.02), (0.2, 0.12, 0.2), neg=True)  # corta embaixo (o pescoço livre)
Hc.build(neck, M['hair'], 900, res=0.005, smooth=3)
for i in range(46):
    a = random.uniform(-2.9, 2.9)
    front = abs(a) < 1.1
    base = (math.sin(a) * 0.104, 0.3 + HY + random.uniform(-0.02, 0.02), math.cos(a) * 0.115 - 0.004)
    if front:  # a franja comprida cai reta na frente do buraco, afastada do rosto
        fall = random.uniform(0.2, 0.32)
        mid = (base[0] * 1.05, base[1] - 0.06, base[2] + 0.045)
        tip = (base[0] * 1.1 + random.uniform(-0.01, 0.01), base[1] - fall, base[2] + 0.05)
    else:
        fall = random.uniform(0.18, 0.3)
        mid = (base[0] * 1.08, base[1] - fall * 0.4, base[2] * 1.08)
        tip = (base[0] * 1.12, base[1] - fall, base[2] * 1.05 - 0.01)
    add(neck, f'hair{i}', rod([base, mid, tip], [0.017, 0.013, 0.002], seg=5, flat=0.5), M['hair'])
# a mandíbula: um toco de carne pendurado embaixo do buraco (o jogo ainda a mexe)
jaw = joint('J_jaw', (0, 0.13 + HY, 0.05), neck)
J = Sculpt('jaw_tinta')
J.chain(curve((-0.045, 0.0, 0.0), (0, -0.025, 0.06), (0.045, 0.0, 0.0), 6), [0.018, 0.02, 0.022, 0.022, 0.02, 0.018], step=0.5)
J.build(jaw, M['gore'], 400, res=0.005, smooth=2)
add(jaw, 'jawDrip', rod([(0.01, -0.02, 0.055), (0.012, -0.08, 0.06), (0.01, -0.14, 0.05)], [0.007, 0.005, 0.0015], seg=5), M['blood'])


# a TINTA escorrendo do corpo inteiro: fios pendurados (com a cor por vértice, as manchas e os escorridos na pele)
def drips(jnt, tag, pts, n):
    for i in range(n):
        x, y, z = random.choice(pts)
        x += random.uniform(-0.03, 0.03)
        L = random.uniform(0.06, 0.18)
        add(jnt, f'inkDrip{tag}{i}', rod([(x, y, z), (x * 1.02, y - L * 0.6, z + 0.005), (x * 1.03, y - L, z)], [0.011, 0.008, 0.002], seg=5), M['ink'])


drips(chest, 'T', [(0.12, 0.55, 0.16), (-0.12, 0.55, 0.16), (0.0, 0.4, 0.17), (0.05, 0.2, 0.13), (-0.08, 0.1, 0.12),
                   (0.17, 0.3, 0.0), (-0.17, 0.3, 0.0), (0.0, 0.45, -0.12)], 14)

# ================================================================ BRAÇOS: as veias pelos braços e mãos, as GARRAS
def arm(s, name):
    sh = joint(f'J_sh{name}', (s * shX, top[1] - 0.06, top[2] - 0.03), chest)
    U = Sculpt(f'upper{name}_tinta')
    U.ell((s * 0.01, -0.02, 0), (upR * 1.4, upR * 1.4, upR * 1.3))
    U.chain([(0, -upL * 0.15, 0), (0, -upL * 0.5, 0.005), (0, -upL, 0)], [upR, upR * 1.05, upR * 0.82], step=0.6)
    U.build(sh, M['skin'], 700, res=0.006, color=skin_col(1.4))
    el = joint(f'J_el{name}', (0, -upL, 0), sh)
    F = Sculpt(f'fore{name}_tinta')
    F.chain([(0, 0.01, 0), (0, -foreL * 0.3, 0.005), (0, -foreL + 0.02, 0)], [foreR * 1.05, foreR * 1.15, foreR * 0.8], step=0.6)
    F.build(el, M['skin'], 600, res=0.0055, color=skin_col(1.6))
    hand = joint(f'J_hand{name}', (0, -foreL, 0), el)
    hw = 0.045
    Hd = Sculpt(f'hand{name}_tinta')
    Hd.ell((0, -0.04, 0.01), (hw, 0.05, hw * 0.45))
    tips = []
    for i in range(4):
        a = (i - 1.5) * 0.3
        x0 = math.sin(a) * hw
        tip = (x0 * 1.3, -0.15, 0.05)
        Hd.chain([(x0, -0.08, 0.015), (x0 * 1.2, -0.12, 0.035), tip], [0.012, 0.011, 0.009], step=0.5)
        tips.append(tip)
    th = [(-s * hw * 0.8, -0.035, 0.025), (-s * hw * 1.2, -0.08, 0.06), (-s * hw * 1.15, -0.11, 0.09)]
    Hd.chain(th, [0.013, 0.011, 0.009], step=0.5)
    Hd.build(hand, M['skin'], 600, res=0.0045, smooth=2, color=skin_col(1.8))
    for i, tip in enumerate(tips + [th[-1]]):  # as unhas que viraram GARRAS
        add(hand, f'claw{i}', rod([tip, (tip[0] * 1.04, tip[1] - 0.03, tip[2] + 0.025), (tip[0] * 1.06, tip[1] - 0.045, tip[2] + 0.06)], [0.008, 0.005, 0.001], seg=5), M['claw'])
    drips(sh, 'U' + name, [(s * upR * 0.9, -0.08, 0.02), (0, -0.2, upR * 0.9), (-s * upR * 0.8, -0.15, 0.0)], 3)
    drips(el, 'F' + name, [(s * foreR * 0.9, -0.05, 0.01), (0, -0.15, foreR * 0.9)], 3)
    for i in range(3):  # a tinta pingando dos dedos
        x = random.uniform(-0.03, 0.03)
        add(hand, f'drip{i}', rod([(x, -0.12, 0.03), (x, -0.17, 0.035), (x, -0.22, 0.03)], [0.006, 0.004, 0.001], seg=5), M['ink'])


arm(1, 'L')
arm(-1, 'R')

# ================================================================ PERNAS: a calça escura manchada, os pés descalços
for s, name in ((1, 'L'), (-1, 'R')):
    hip = joint(f'J_hip{name}', (s * hipX, 0, 0), chest)
    Th = Sculpt(f'thigh{name}_tinta')
    Th.chain([(0, 0.03, 0), (0, -thighL * 0.4, 0.01), (0, -thighL + 0.02, 0.01)], [thighR * 1.15, thighR * 1.05, thighR * 0.85])
    Th.build(hip, M['skin'], 700, res=0.007, color=cloth_col('pants'))
    knee = joint(f'J_knee{name}', (0, -thighL, 0.02), hip)
    Sh = Sculpt(f'shin{name}_tinta')
    Sh.chain([(0, 0.02, 0), (0, -shinL * 0.35, -0.01), (0, -shinL + 0.08, -0.005)], [shinR * 1.3, shinR * 1.25, shinR * 1.05])  # a perna da calça
    Sh.ell((0, -shinL + 0.12, 0.0), (shinR * 1.5, 0.04, shinR * 1.5))  # a barra dobrada
    Sh.build(knee, M['skin'], 600, res=0.006, color=cloth_col('pants'))
    F = Sculpt(f'foot{name}_tinta')
    F.chain([(0, -shinL + 0.09, -0.005), (0, -shinL + 0.04, 0.0)], [0.035, 0.035], step=0.5)
    F.ell((0, -shinL + 0.025, 0.06), (0.04, 0.022, 0.09))  # o pé descalço, sujo
    F.build(knee, M['skin'], 400, res=0.005, color=skin_col(1.0))
    drips(hip, 'L' + name, [(s * thighR, -0.1, 0.03), (0, -0.25, thighR * 1.1), (-s * thighR, -0.3, 0.0)], 3)
    drips(knee, 'S' + name, [(s * shinR * 1.2, -0.1, 0.02), (0, -0.2, shinR * 1.3)], 2)

white_vcols()
finish()
out = sys.argv[sys.argv.index('--') + 1]
export_glb(out)
