"""
ASSOMBRAÇÃO — A Vigília, ep. 3 ("Samhain"), em Treb Ciach.
Dono (2026-11-19): "por dentro são espíritos azuis quase de energia (energia + conhecimento + morte)"; "nas fantasias
não dá pra ver a forma azul, são algumas de palha, couro etc."; "as mais fortes ao morrer quebram a fantasia e mostram a
forma azul, mas as mais fracas a fantasia só desmonta no chão".
Referências (Referencias visuais/Mapas/treb-ciach/episodios):
  - REVELANDO (as concept arts): `REV_0h18_fantasias_palha_corda` (as roupas: a CAPA DE PALHA grossa do pescoço ao
    chão e o manto escuro AMARRADO DE CORDAS com galhos), `REV_1h35_assombracoes_fantasiadas` e
    `REV_1h35_mascara_ferreiro` (fantasiadas, as Assombrações são silhuetas ESCURAS, curvadas, de chifres — "o medo
    distorce": a máscara do ferreiro é couro escuro com chifres curvos e presas, gola de palha),
    `REV_1h56_concept_rosto_repetido` (a forma azul: o ROSTO REPETIDO várias vezes, um em cima do outro);
  - ep. 3: `AV03_0h14_mascara_raizes_galhada` (raízes em espiral com galhada, o manto de capuz escuro),
    `AV03_0h15_mascaras_corvo_lobo` (o crânio de corvo pintado de preto, amarrado; o lobo com crina e penas),
    `AV03_2h51_assombracao_azul` / `3h01` (o espírito ciano, os dedos longos de luz).
  - wiki "Assombração": forma espectral azulada que conserva a aparência, "partes do rosto que se repetem", frias,
    raios no toque; o mestre no ep. 3 (59:51): "ela meio que flutua".
MONTAGEM: o ESPÍRITO completo (material `espirito`: o jogo o deixa INVISÍVEL enquanto a fantasia está inteira e o
acende como brilho azul quando a forte quebra a fantasia) e, por cima, a FANTASIA fechada (nada de azul aparece):
  - duas roupas, em juntas próprias: MANTO (J_roupaManto, J_capuzManto, J_mangaManto*: o manto de capuz escuro amarrado
    de cordas) e PALHA (J_roupaPalha, J_golaPalha, J_mangaPalha*: a capa de palha até o chão);
  - quatro máscaras (J_maskRaizes, J_maskCorvo, J_maskDemonio, J_maskBode); as luvas de couro (J_luva*) sempre.
O jogo sorteia uma roupa e uma máscara (src/models/assombracao.js). PROPOSTA: o desenho de cada peça.

JUNTAS nas posições do Zumbi de Sangue fraco (J_body, J_chest, J_neck, J_jaw, J_sh/el/hand L/R, J_hip/knee L/R).
Modelado em pé, olhando para +z.
"""
import sys
import os
import math
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector

from lib import reset, material, export_glb, hex_rgb, TAU
from npc_lib import rod, curve, joint, add, finish, blob
from npc_sculpt_lib import Sculpt, vcol_material, n3, white_vcols

random.seed(73)
reset()
M = {
    'spirit': material('espirito_assombracao', '#7ae0ff', 0.4, emission='#3ab8ff', strength=2.0),
    'core': material('espirito_nucleo_assombracao', '#e8fbff', 0.3, emission='#bff0ff', strength=3.0),
    'cloak': vcol_material('manto_assombracao', 0.9),
    'rag': material('trapo_assombracao', '#1e1c1a', 0.95),
    'rope': material('corda_assombracao', '#6a5a40', 0.9),
    'straw': material('palha_assombracao', '#a08850', 0.95),
    'strawDark': material('palha_escura_assombracao', '#6a5630', 0.95),
    'leather': material('couro_assombracao', '#2a1e16', 0.7),
    'bone': material('osso_assombracao', '#d8ccb0', 0.6),
    'boneBlack': material('osso_pintado_assombracao', '#141212', 0.55),
    'paint': material('tinta_branca_assombracao', '#c8c0b0', 0.7),
    'horn': material('chifre_assombracao', '#3a3024', 0.6),
    'tusk': material('presa_assombracao', '#d8ccaa', 0.5),
    'root': material('raiz_assombracao', '#3a2a1c', 0.9),
    'antler': material('galhada_assombracao', '#8a7458', 0.7),
    'feather': material('pena_assombracao', '#1a1a1c', 0.8),
    'socket': material('orbita_assombracao', '#050505', 0.95),
}
C = {k: Vector(hex_rgb(v)) for k, v in {
    'cloak': '#262420', 'cloakDark': '#121110', 'cloakAsh': '#3a3a3a', 'rot': '#1c2226',
}.items()}

hipY, shY, shZ, shX = 1.0, 0.64, 0.1, 0.22
upL, foreL, upR, foreR = 0.31, 0.3, 0.05, 0.04
thighL, shinL, thighR, hipX = 0.5, 0.48, 0.07, 0.11


def cloak_col(p, sc):
    base = C['cloak'].lerp(C['cloakDark'], max(0.0, n3(p, 4) + 0.1) * 0.9)
    if n3((p[0] * 0.5, p[1] * 3, p[2] * 0.5), 6) > 0.25:  # as cinzas grudadas no pano
        base = base.lerp(C['cloakAsh'], 0.5)
    if p[1] < -0.5:  # a barra podre
        base = base.lerp(C['rot'], 0.6)
    return base


def cloak_disp(p):
    x, y, z = p
    return 0.006 * (math.sin(math.atan2(x, z) * 9 + n3(p, 3) * 2) - 0.2) * max(0.0, 0.5 - y)  # as dobras descendo


body = joint('J_body', (0, 0, 0))
chest = joint('J_chest', (0, hipY, 0), body)
top = (0, shY, shZ)

# ================================================================ O ESPÍRITO (por baixo de tudo; aparece só sem a fantasia)
# REMODEL (dono, 2026-11-19: "as assombrações azuis devem ter remodel"), pela arte do ep. 3 (`AV03_2h51_assombracao_azul`):
# um VELHO encurvado e magro, rosto enrugado de sobrancelha pesada, órbitas fundas, bochechas chupadas e nariz adunco, a
# boca entreaberta; o cabelo longo e ralo caindo para trás; a túnica de gola e botões; as MÃOS GRANDES de dedos longos e
# ossudos com garras; sem pés — a parte de baixo vira fiapos de fumaça. Por cima do rosto, o ECO do rosto repetido
# (`REV_1h56_concept_rosto_repetido`: a mesma cara escorregando para cima, borrada).
def chest_disp(p):
    x, y, z = p
    rib = 0.0045 * math.sin(y * 58) if 0.24 < y < 0.5 and z > 0.03 else 0.0  # as costelas sob a túnica
    return rib + 0.003 * n3(p, 18)


S = Sculpt('torso_espirito')
S.ell((0, -0.02, 0.0), (0.12, 0.1, 0.08))
S.ell((0, 0.15, 0.01), (0.12, 0.12, 0.08))
S.ell((0, 0.35, 0.04), (0.15, 0.14, 0.1))  # o peito para a frente
S.ell((0, 0.5, -0.04), (0.18, 0.12, 0.12))  # a corcunda
S.ell((0, 0.61, 0.0), (0.21, 0.05, 0.09))  # os ombros erguidos
for s_ in (1, -1):
    S.ell((s_ * 0.06, 0.42, 0.11), (0.05, 0.05, 0.03), neg=True)  # o peito afundado entre as costelas
S.build(chest, M['spirit'], 2400, res=0.008, disp=chest_disp)
add(chest, 'nucleo_espirito', rod([(0, 0.32, 0.05), (0, 0.42, 0.065), (0, 0.5, 0.05)], [0.035, 0.05, 0.03], seg=10), M['core'])  # o coração de luz, por dentro
# a túnica: a gola em volta do pescoço e a fileira de botões
gola = [(math.sin(a) * 0.1, 0.63 + 0.015 * math.cos(a), 0.03 + math.cos(a) * 0.08) for a in [i / 10 * TAU for i in range(11)]]
add(chest, 'gola_espirito', rod(gola, 0.016, seg=6), M['spirit'])
for i in range(5):
    y = 0.52 - i * 0.09
    add(chest, f'botao{i}_espirito', blob((0, y, 0.115 + (0.02 if 0.25 < y < 0.45 else 0.0)), (0.012, 0.012, 0.008), seg=6, rings=4), M['core'])

neck = joint('J_neck', (0, top[1] + 0.03, top[2] + 0.02), chest)


def face(Sc, o=(0, 0, 0), k=1.0):
    """a cara do velho (repetida no eco com deslocamento `o` e escala `k`)"""
    P = lambda x, y, z: (o[0] + x * k, o[1] + y * k, o[2] + z * k)
    R = lambda *r: tuple(v * k for v in r)
    for s_ in (1, -1):  # as sobrancelhas pesadas, caídas para fora
        Sc.chain([P(s_ * 0.008, 0.188, 0.078), P(s_ * 0.035, 0.192, 0.074), P(s_ * 0.06, 0.18, 0.058)], [0.012 * k, 0.014 * k, 0.009 * k])
    Sc.ell(P(0, 0.1, 0.035), R(0.052, 0.075, 0.06))  # a cara comprida
    for s_ in (1, -1):
        Sc.ell(P(s_ * 0.05, 0.135, 0.058), R(0.024, 0.018, 0.024))  # as maçãs do rosto saltadas
        Sc.ell(P(s_ * 0.05, 0.095, 0.078), R(0.02, 0.03, 0.02), neg=True)  # as bochechas chupadas
        Sc.ell(P(s_ * 0.031, 0.162, 0.088), R(0.021, 0.016, 0.02), neg=True)  # as órbitas fundas
    Sc.chain([P(0, 0.17, 0.085), P(0, 0.135, 0.108), P(0, 0.112, 0.102)], [0.011 * k, 0.016 * k, 0.01 * k])  # o nariz adunco
    Sc.ell(P(0, 0.074, 0.088), R(0.024, 0.012, 0.02), neg=True)  # a boca entreaberta


def wrinkles(p):
    x, y, z = p
    w = 0.0028 * math.sin(y * 150) if 0.2 < y < 0.26 and z > 0.02 else 0.0  # a testa enrugada
    return w + 0.002 * n3(p, 30)


H = Sculpt('cabeca_espirito')
H.chain([(0, -0.05, -0.02), (0, 0.03, 0.0)], [0.042, 0.04])  # o pescoço magro
H.ell((0, 0.18, -0.01), (0.085, 0.11, 0.095))  # o crânio
face(H)
H.build(neck, M['spirit'], 2200, res=0.0045, smooth=2, disp=wrinkles)
for s_ in (1, -1):
    add(neck, f'olho{s_}_espirito', rod([(s_ * 0.031, 0.162, 0.066), (s_ * 0.031, 0.162, 0.072)], 0.008, seg=8), M['core'])  # no fundo da órbita
# o ECO: a mesma cara escorregando para cima e um pouco para o lado
E = Sculpt('rostoEco_espirito')
face(E, o=(0.016, 0.075, -0.03), k=0.9)  # raso: sai da testa
E.build(neck, M['spirit'], 900, res=0.005, smooth=3)
for s_ in (1, -1):
    add(neck, f'olhoB{s_}_espirito', rod([(s_ * 0.028 + 0.016, 0.22, 0.038), (s_ * 0.028 + 0.016, 0.22, 0.044)], 0.007, seg=8), M['core'])
for i in range(26):  # o cabelo longo e ralo, caindo para trás e esvoaçando
    a = random.uniform(-1.7, 1.7)
    base = (math.sin(a) * 0.075, 0.25 + random.uniform(-0.02, 0.02) - abs(a) * 0.03, math.cos(a) * 0.05 - 0.035)
    sw = random.uniform(-0.05, 0.05)
    L = random.uniform(0.28, 0.46)
    pts = [base,
           (base[0] * 1.5 + sw * 0.3, base[1] - L * 0.2, base[2] - 0.09),
           (base[0] * 1.9 + sw, base[1] - L * 0.55, base[2] - 0.16),
           (base[0] * 2.2 - sw * 0.5, base[1] - L, base[2] - 0.2 - random.uniform(0, 0.08))]
    add(neck, f'cabelo{i}_espirito', rod(pts, [0.009, 0.007, 0.004, 0.001], seg=4), M['spirit'])
jaw = joint('J_jaw', (0, 0.1, 0.03), neck)
J = Sculpt('mandibula_espirito')  # o queixo ossudo, caído
J.chain(curve((-0.042, 0.0, -0.005), (0, -0.04, 0.05), (0.042, 0.0, -0.005), 6), [0.013, 0.015, 0.017, 0.017, 0.015, 0.013], step=0.5)
J.build(jaw, M['spirit'], 360, res=0.0045, smooth=2)
# (a fumaça em volta sai em partículas no jogo: src/combat/assombracao.js)

# ================================================================ ROUPA 1: o MANTO de capuz escuro, AMARRADO DE CORDAS
rM = joint('J_roupaManto', (0, 0, 0), chest)
K = Sculpt('manto')
K.ell((0, 0.6, 0.0), (0.22, 0.09, 0.15))  # os ombros
K.chain([(0, 0.48, -0.01), (0, 0.12, -0.02), (0, -0.28, -0.03), (0, -0.7, -0.03)], [0.17, 0.2, 0.26, 0.31], step=0.4)  # fechado, um sino
K.ell((0, -1.06, -0.03), (0.45, 0.24, 0.45), neg=True)  # a barra aberta embaixo
K.ell((0, 0.66, 0.08), (0.1, 0.07, 0.08), neg=True)  # a gola
K.build(rM, M['cloak'], 3400, res=0.009, disp=cloak_disp, color=cloak_col)
for i in range(22):  # a barra rasgada
    a = (i / 22) * TAU
    r = 0.31 + random.uniform(-0.02, 0.01)
    x, z = math.sin(a) * r, math.cos(a) * r - 0.03
    L = random.uniform(0.08, 0.18)
    add(rM, f'tira{i}', rod([(x, -0.82, z), (x * 1.04, -0.82 - L * 0.5, z * 1.04), (x * 1.07, -0.82 - L, z * 1.08)], [0.035, 0.025, 0.004], seg=5, flat=0.35), M['rag'])
# as CORDAS enroladas no corpo (o concept da roupa de corda) e os galhos presos nelas
for k, (y, r, tilt) in enumerate(((0.42, 0.215, 0.08), (0.2, 0.235, -0.06), (-0.05, 0.27, 0.1), (-0.35, 0.31, -0.05))):
    pts = [(math.sin(a) * r, y + math.sin(a) * tilt, math.cos(a) * r - 0.01) for a in [j / 16 * TAU for j in range(17)]]
    add(rM, f'corda{k}', rod(pts, 0.012, seg=5, caps=False), M['rope'])
for k in range(6):
    a = random.uniform(-2.6, 2.6)
    b = (math.sin(a) * 0.25, random.uniform(-0.3, 0.3), math.cos(a) * 0.25)
    add(rM, f'galho{k}', rod([b, (b[0] * 1.2, b[1] + 0.12, b[2] * 1.2), (b[0] * 1.35 + random.uniform(-0.04, 0.04), b[1] + 0.22, b[2] * 1.3)], [0.008, 0.006, 0.002], seg=4), M['root'])
for k in range(5):  # pontas de corda pendendo
    x = random.uniform(-0.15, 0.15)
    add(rM, f'pontaCorda{k}', rod([(x, -0.05, 0.25), (x * 1.1, -0.2, 0.28), (x * 1.15, -0.32, 0.29)], 0.008, seg=4), M['rope'])
cM = joint('J_capuzManto', (0, 0, 0), neck)
Kh = Sculpt('capuz_manto')
Kh.ell((0, 0.18, -0.02), (0.135, 0.16, 0.145))
Kh.ell((0, 0.17, 0.11), (0.085, 0.12, 0.08), neg=True)  # a abertura do rosto (a máscara tampa)
Kh.ell((0, -0.02, 0.0), (0.17, 0.07, 0.17), neg=True)
Kh.ell((0, 0.04, -0.02), (0.16, 0.08, 0.15))  # o capuz cai sobre os ombros
Kh.build(cM, M['cloak'], 1200, res=0.007, color=cloak_col)

# ================================================================ ROUPA 2: a CAPA DE PALHA grossa, do pescoço até o chão
rP = joint('J_roupaPalha', (0, 0, 0), chest)
Kp = Sculpt('capa_palha')
Kp.ell((0, 0.6, 0.0), (0.2, 0.09, 0.13))
Kp.chain([(0, 0.48, -0.01), (0, 0.1, -0.02), (0, -0.3, -0.03), (0, -0.66, -0.03)], [0.15, 0.17, 0.21, 0.25], step=0.4)
Kp.ell((0, -1.02, -0.03), (0.45, 0.24, 0.45), neg=True)
Kp.build(rP, M['strawDark'], 2400, res=0.01)
# os FEIXES de palha em camadas, caindo de cada fileira (o desenho: a palha arrepiada, mais longa embaixo)
for row, (y0, r0, n, L) in enumerate(((0.66, 0.19, 30, 0.4), (0.4, 0.18, 34, 0.46), (0.08, 0.2, 36, 0.5), (-0.26, 0.24, 38, 0.56))):
    for i in range(n):
        a = (i / n) * TAU + row * 0.11
        r = r0 + random.uniform(0.0, 0.025)
        x, z = math.sin(a) * r, math.cos(a) * r - 0.02
        ln = L * random.uniform(0.85, 1.15)
        out = random.uniform(0.1, 0.22)
        add(rP, f'feixe{row}_{i}', rod([(x, y0, z), (x * (1 + out), y0 - ln * 0.5, z * (1 + out)), (x * (1 + out * 1.8) + random.uniform(-0.02, 0.02), y0 - ln, z * (1 + out * 1.8))],
                                       [0.028, 0.02, 0.003], seg=4, flat=0.4), M['straw'] if (i + row) % 3 else M['strawDark'])
gP = joint('J_golaPalha', (0, 0, 0), neck)
for i in range(28):  # a GOLA de palha arrepiada em volta do pescoço (a máscara do ferreiro)
    a = (i / 28) * TAU
    b = (math.sin(a) * 0.1, 0.02, math.cos(a) * 0.09)
    t = (math.sin(a) * 0.2, 0.1 + random.uniform(-0.03, 0.05), math.cos(a) * 0.18)
    add(gP, f'gola{i}', rod([b, ((b[0] + t[0]) / 2, 0.08, (b[2] + t[2]) / 2), t], [0.012, 0.009, 0.002], seg=4, flat=0.4), M['straw'])
Kc = Sculpt('capuz_palha')  # o capuz de pano escuro por baixo da palha
Kc.ell((0, 0.18, -0.02), (0.13, 0.155, 0.14))
Kc.ell((0, 0.17, 0.11), (0.085, 0.12, 0.08), neg=True)
Kc.ell((0, -0.02, 0.0), (0.17, 0.07, 0.17), neg=True)
Kc.build(gP, M['cloak'], 900, res=0.007, color=cloak_col)


# ================================================================ AS MÁSCARAS (o jogo mostra uma)
def face_plate(jn, tag, mat, snout=0.0, down=0.0):
    """a placa da máscara por cima do rosto inteiro (as órbitas fundas e escuras: nada de luz passa)"""
    Mk = Sculpt('mascara_' + tag)
    Mk.ell((0, 0.2, 0.075), (0.105, 0.095, 0.08))  # a testa
    Mk.chain([(0, 0.17, 0.11), (0, 0.1 - down * 0.5, 0.13 + snout * 0.5), (0, 0.04 - down, 0.13 + snout)], [0.08, 0.06, 0.04])
    for s in (1, -1):
        Mk.ell((s * 0.05, 0.18, 0.135), (0.027, 0.025, 0.05), neg=True)
        Mk.ell((s * 0.09, 0.19, 0.07), (0.035, 0.035, 0.035))  # as maçãs
    Mk.ell((0, 0.17, 0.0), (0.09, 0.12, 0.085), neg=True)
    Mk.build(jn, mat, 1000, res=0.004, smooth=2)
    for s in (1, -1):  # o fundo escuro das órbitas
        add(jn, f'orbita{s}', rod([(s * 0.05, 0.18, 0.1), (s * 0.05, 0.18, 0.115)], 0.022, seg=8), M['socket'])


# 1) RAÍZES em espiral com a galhada (AV03 0h14)
mR = joint('J_maskRaizes', (0, 0, 0), neck)
face_plate(mR, 'raizes', M['root'], 0.02)
for k in range(10):  # as raízes enroladas em espiral por cima da face
    a0 = k / 10 * TAU
    pts = []
    for j in range(9):
        t = j / 8
        a = a0 + t * 2.4
        r = 0.03 + t * 0.07
        pts.append((math.cos(a) * r, 0.16 + math.sin(a) * r * 1.1, 0.14 + 0.02 * math.sin(t * 3) - t * 0.04))
    add(mR, f'raiz{k}', rod(pts, [0.009 * (1 - 0.7 * j / 8) + 0.002 for j in range(9)], seg=4), M['root'])
for s in (1, -1):  # a galhada
    base, p1, p2 = (s * 0.07, 0.28, 0.04), (s * 0.18, 0.44, 0.0), (s * 0.27, 0.62, -0.06)
    add(mR, f'galhada{s}', rod([base, p1, p2], [0.018, 0.013, 0.005], seg=6), M['antler'])
    for k, (tt, up, out) in enumerate(((0.3, 0.11, 0.02), (0.6, 0.13, -0.04), (0.85, 0.1, 0.05), (0.95, 0.07, -0.02))):
        q = Vector(base).lerp(Vector(p1), tt * 2) if tt < 0.5 else Vector(p1).lerp(Vector(p2), (tt - 0.5) * 2)
        add(mR, f'ponta{s}{k}', rod([tuple(q), (q.x + s * out, q.y + up, q.z + 0.04)], [0.01, 0.002], seg=5), M['antler'])
# 2) o crânio de CORVO pintado de preto, com as coisas amarradas na frente (AV03 0h15; Revelando 0h18)
mC = joint('J_maskCorvo', (0, 0, 0), neck)
face_plate(mC, 'corvo', M['boneBlack'], 0.0)
add(mC, 'bico', rod([(0, 0.16, 0.15), (0, 0.1, 0.27), (0, 0.02, 0.36)], [0.04, 0.022, 0.003], seg=8, flat=0.75), M['boneBlack'])
for k in range(4):  # as inscrições brancas pintadas
    add(mC, f'risco{k}', rod([(-0.06 + k * 0.04, 0.26, 0.12), (-0.055 + k * 0.04, 0.21, 0.145)], 0.004, seg=4), M['paint'])
for k in range(5):  # os amuletos amarrados (ossinhos e penas) pendendo
    x = -0.07 + k * 0.035
    add(mC, f'amarra{k}', rod([(x, 0.1, 0.13), (x, 0.0, 0.14), (x * 1.1, -0.06, 0.14)], 0.004, seg=4), M['rope'])
    add(mC, f'pena{k}', rod([(x * 1.1, -0.06, 0.14), (x * 1.15, -0.12, 0.15), (x * 1.2, -0.17, 0.14)], [0.012, 0.01, 0.002], seg=4, flat=0.3), M['feather'])
# 3) o DEMÔNIO de couro com chifres curvos e presas (a do ferreiro, Revelando 1h35)
mD = joint('J_maskDemonio', (0, 0, 0), neck)
face_plate(mD, 'demonio', M['leather'], 0.01, 0.02)
for s in (1, -1):
    add(mD, f'chifre{s}', rod([(s * 0.08, 0.27, 0.06), (s * 0.17, 0.36, 0.02), (s * 0.2, 0.46, 0.05), (s * 0.16, 0.52, 0.12)], [0.03, 0.022, 0.013, 0.002], seg=8), M['horn'])
    add(mD, f'presa{s}', rod([(s * 0.035, 0.05, 0.15), (s * 0.05, 0.1, 0.17), (s * 0.045, 0.14, 0.16)], [0.012, 0.007, 0.001], seg=6), M['tusk'])
    add(mD, f'orelha{s}', rod([(s * 0.1, 0.2, 0.05), (s * 0.16, 0.22, 0.03), (s * 0.2, 0.25, 0.0)], [0.02, 0.012, 0.002], seg=5, flat=0.4), M['leather'])
add(mD, 'boca', rod([(-0.04, 0.06, 0.155), (0, 0.05, 0.165), (0.04, 0.06, 0.155)], 0.01, seg=5), M['socket'])
# 4) o crânio de BODE com os chifres para trás e a coroa de vime
mB = joint('J_maskBode', (0, 0, 0), neck)
face_plate(mB, 'bode', M['bone'], 0.07, 0.03)
for s in (1, -1):
    add(mB, f'chifreB{s}', rod([(s * 0.06, 0.27, 0.06), (s * 0.11, 0.35, -0.02), (s * 0.16, 0.32, -0.12), (s * 0.16, 0.2, -0.1)], [0.025, 0.018, 0.011, 0.003], seg=7), M['horn'])
for i in range(8):
    a = (i / 8) * TAU
    add(mB, f'vime{i}', rod([(math.sin(a) * 0.115, 0.29, math.cos(a) * 0.1), (math.sin(a + 0.6) * 0.12, 0.31, math.cos(a + 0.6) * 0.11)], 0.007, seg=4), M['straw'])


# ================================================================ BRAÇOS: o espírito, as mangas de cada roupa e as LUVAS de couro
def arm(s, name):
    sh = joint(f'J_sh{name}', (s * shX, top[1] - 0.05, top[2] - 0.03), chest)
    U = Sculpt(f'braco{name}_espirito')  # magro, o osso marcando
    U.chain([(0, 0, 0), (0, -upL * 0.5, 0.0), (0, -upL, 0)], [upR * 0.95, upR * 0.75, upR * 0.7], step=0.6)
    U.build(sh, M['spirit'], 500, res=0.006)
    el = joint(f'J_el{name}', (0, -upL, 0), sh)
    F = Sculpt(f'antebraco{name}_espirito')
    F.chain([(0, 0.01, 0), (0, -foreL * 0.5, 0.0), (0, -foreL + 0.02, 0)], [foreR * 0.9, foreR * 0.8, foreR * 0.65], step=0.6)
    F.ell((0, 0.0, -0.005), (foreR * 0.9, 0.02, foreR * 0.9))  # o cotovelo ossudo
    F.build(el, M['spirit'], 420, res=0.0055)
    hand = joint(f'J_hand{name}', (0, -foreL, 0), el)
    hw = 0.05  # as MÃOS GRANDES da arte
    Hd = Sculpt(f'mao{name}_espirito')
    Hd.ell((0, -0.045, 0.012), (hw, 0.055, hw * 0.4))
    for i in range(4):
        Hd.ell((math.sin((i - 1.5) * 0.3) * hw * 0.9, -0.09, 0.018), (0.012, 0.012, 0.012))  # os nós dos dedos
    Hd.build(hand, M['spirit'], 420, res=0.004, smooth=2)
    for i in range(4):  # os dedos longos e ossudos, curvando em garra
        a = (i - 1.5) * 0.3
        x0 = math.sin(a) * hw * 0.9
        L = 0.2 - abs(i - 1.5) * 0.025
        add(hand, f'dedo{i}_espirito', rod([(x0, -0.09, 0.018), (x0 * 1.3, -0.09 - L * 0.4, 0.035), (x0 * 1.5, -0.09 - L * 0.75, 0.07), (x0 * 1.55, -0.09 - L * 0.95, 0.12)],
                                            [0.011, 0.009, 0.006, 0.0012], seg=6), M['spirit'])
    add(hand, 'polegar_espirito', rod([(-s * hw * 0.8, -0.03, 0.03), (-s * hw * 1.4, -0.08, 0.075), (-s * hw * 1.5, -0.13, 0.11)], [0.012, 0.009, 0.0012], seg=6), M['spirit'])
    # MANTO: a manga larga de pano
    for tag, mat, color in (('Manto', M['cloak'], cloak_col),):
        ju = joint(f'J_manga{tag}{name}', (0, 0, 0), sh)
        Sl = Sculpt(f'manga{tag}{name}')
        Sl.chain([(0, 0.02, 0), (0, -upL * 0.5, 0.0), (0, -upL - 0.02, 0.0)], [upR * 1.5, upR * 1.55, upR * 1.65], step=0.6)
        Sl.build(ju, mat, 600, res=0.007, color=color)
        jl = joint(f'J_mangaB{tag}{name}', (0, 0, 0), el)
        Sl2 = Sculpt(f'mangaB{tag}{name}')
        Sl2.chain([(0, 0.02, 0), (0, -foreL * 0.5, 0.01), (0, -foreL + 0.01, 0.02)], [foreR * 1.7, foreR * 1.9, foreR * 2.3], step=0.6)
        Sl2.ell((0, -foreL - 0.03, 0.02), (foreR * 1.8, 0.05, foreR * 1.8), neg=True)
        Sl2.build(jl, mat, 500, res=0.0065, color=color)
    # PALHA: os feixes de palha descendo pelo braço
    ju = joint(f'J_mangaPalha{name}', (0, 0, 0), sh)
    for i in range(14):
        a = (i / 14) * TAU
        y0 = random.uniform(0.0, -upL * 0.6)
        b = (math.sin(a) * upR * 1.4, y0, math.cos(a) * upR * 1.4)
        add(ju, f'palhaBraco{i}', rod([b, (b[0] * 1.5, y0 - 0.14, b[2] * 1.5), (b[0] * 1.9, y0 - 0.28, b[2] * 1.9)], [0.012, 0.009, 0.002], seg=4, flat=0.4), M['straw'])
    jl = joint(f'J_mangaBPalha{name}', (0, 0, 0), el)
    Sl3 = Sculpt(f'mangaBPalha{name}')  # o braço de pano escuro por baixo da palha
    Sl3.chain([(0, 0.02, 0), (0, -foreL + 0.01, 0.0)], [foreR * 1.5, foreR * 1.6], step=0.6)
    Sl3.build(jl, M['cloak'], 400, res=0.0065, color=cloak_col)
    # as LUVAS de couro amarradas (as mãos nunca ficam de fora) e as garras de unha comprida da fantasia
    jg = joint(f'J_luva{name}', (0, 0, 0), hand)
    G = Sculpt(f'luva{name}')
    G.ell((0, -0.035, 0.01), (hw * 1.25, 0.052, hw * 0.65))
    G.build(jg, M['leather'], 350, res=0.0045, smooth=2)
    for i in range(4):
        a = (i - 1.5) * 0.32
        x0 = math.sin(a) * hw
        add(jg, f'dedoLuva{i}', rod([(x0, -0.07, 0.015), (x0 * 1.5, -0.14, 0.04), (x0 * 1.8, -0.2, 0.07)], [0.015, 0.012, 0.004], seg=5), M['leather'])
    add(jg, 'polegarLuva', rod([(-s * hw * 0.8, -0.03, 0.025), (-s * hw * 1.5, -0.08, 0.07), (-s * hw * 1.6, -0.11, 0.1)], [0.015, 0.012, 0.004], seg=5), M['leather'])
    for k in range(3):
        add(jg, f'tira{k}', rod([(math.sin(k * 2.1) * 0.05, 0.01 - k * 0.025, math.cos(k * 2.1) * 0.04), (math.sin(k * 2.1 + 3) * 0.05, -0.005 - k * 0.025, math.cos(k * 2.1 + 3) * 0.04)], 0.005, seg=4), M['rope'])


arm(1, 'L')
arm(-1, 'R')

# ================================================================ PERNAS: o espírito vira fiapos (sem pés: flutua); a roupa cobre
for s, name in ((1, 'L'), (-1, 'R')):
    hip = joint(f'J_hip{name}', (s * hipX, 0, 0), chest)
    Th = Sculpt(f'coxa{name}_espirito')
    Th.chain([(0, 0.03, 0), (0, -thighL * 0.4, -0.01), (0, -thighL * 0.7, -0.03)], [thighR * 0.8, thighR * 0.6, thighR * 0.35])
    Th.build(hip, M['spirit'], 420, res=0.007)
    knee = joint(f'J_knee{name}', (0, -thighL, 0.0), hip)
    for k in range(5):  # sem pés: a perna se desfaz em fiapos de fumaça arrastando para trás
        ox = (k - 2) * 0.018
        sw = random.uniform(-0.04, 0.04)
        add(knee, f'fiapoPerna{k}_espirito', rod([(ox, 0.2, -0.02), (ox * 2 + sw, -shinL * 0.3, -0.08 - k * 0.012), (ox * 3 - sw, -shinL * 0.65, -0.2 - k * 0.03), (ox * 3.5 + sw, -shinL * 0.9, -0.34 - k * 0.04)],
                                                  [0.04, 0.03, 0.014, 0.001], seg=6), M['spirit'])
# a SAIA da túnica: um sino de luz da cintura para baixo (a silhueta de manto da arte), e as tiras se desfazendo
Sk = Sculpt('saia_espirito')
Sk.chain([(0, 0.06, 0.0), (0, -0.15, -0.02), (0, -0.38, -0.05)], [0.13, 0.16, 0.19], step=0.4)
Sk.ell((0, -0.62, -0.06), (0.3, 0.22, 0.3), neg=True)  # a barra aberta embaixo
Sk.build(chest, M['spirit'], 1200, res=0.009, disp=lambda p: 0.006 * math.sin(math.atan2(p[0], p[2]) * 11) * max(0.0, 0.1 - p[1]))
for i in range(12):
    a = (i / 12) * TAU
    r0 = 0.12
    L = random.uniform(0.35, 0.6)
    pts = [(math.sin(a) * r0, 0.02, math.cos(a) * r0 * 0.75),
           (math.sin(a) * r0 * 1.35, -L * 0.4, math.cos(a) * r0 - 0.05),
           (math.sin(a) * r0 * 1.6, -L * 0.75, math.cos(a) * r0 - 0.14),
           (math.sin(a) * r0 * 1.7, -L, math.cos(a) * r0 - 0.24)]
    add(chest, f'barra{i}_espirito', rod(pts, [0.03, 0.024, 0.012, 0.001], seg=5, flat=0.5), M['spirit'])

white_vcols()
finish()
out = sys.argv[sys.argv.index('--') + 1]
export_glb(out)
