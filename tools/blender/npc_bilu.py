"""
BILU — Alheio do QUARTO ESCURO dos Becos (5º andar da Torre da TV Varminho; ep. 7 de Sinais do Outro Lado, só ouvido;
a aparência foi revelada no Episódio Extra). Ameaça recorrente da 3ª dungeon (docs/TORRE-TRANSMISSAO.md §2).
REFERÊNCIA VISUAL (wiki "Bilu", vista só no navegador, sem baixar): "Miniatura Bilu em Sinais do Outro Lado".
O que a arte mostra (e este modelo segue):
  · a cabeça é um CHAPÉU DE COGUMELO liso em cúpula, com uma COSTURA no meio (da frente para trás), sem rosto em cima;
  · dois OLHOS VERDES grandes e amendoados debaixo da aba, nas laterais; um focinho pequeno e fino no meio;
  · pescoço fino e uma BARRA DE OMBROS larga e reta (os ombros saltados);
  · BRAÇOS finíssimos e compridos, que abrem para fora e chegam ao CHÃO, com 5 dedos longos e abertos;
  · tronco magro: a COLUNA segmentada exposta na frente, dois TENTÁCULOS finos que descem do queixo pelo peito;
  · pernas CURTAS e arqueadas (joelhos para fora), pés com dedos compridos como mãos;
  · pele oliva escura, igual no corpo todo.
PROPOSTA: a altura exata (~2,5 m) e o número de vértebras.
Juntas (animadas em src/combat/alheios.js → Bilu.pose): body, hips, chest, head, armL/armR + elbowL/elbowR,
legL/legR + kneeL/kneeR. Olhando para +z, em pé.
"""
import sys
import os
import math

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb
from npc_lib import T, rod, curve, spike, blob, joint, add, finish

reset()
M = {
    'skin': material('skin_bilu', '#4b5636', 0.55),
    'dark': material('dark_bilu', '#262d1a', 0.7),
    'eye': material('glow_eye_bilu', '#46ff46', 0.15, emission='#3cff3c', strength=3.0),
}


def lathe(profile, center=(0, 0, 0), seg=24, squash=1.0):
    """gira um perfil [(raio, y)] em volta do eixo y (o chapéu do cogumelo); squash < 1 achata de frente para trás"""
    cx, cy, cz = center
    V, F, U = [], [], []
    n = len(profile)
    for i, (r, y) in enumerate(profile):
        for s in range(seg):
            a = s / seg * math.tau
            V.append(tuple(T(cx + math.cos(a) * r, cy + y, cz + math.sin(a) * r * squash)))
            U.append((s / seg, i / (n - 1)))
    for i in range(n - 1):
        for s in range(seg):
            a = i * seg + s
            b = i * seg + (s + 1) % seg
            F.append((a, b, b + seg, a + seg))
    return V, F, U


HIP = 0.95
body = joint('J_body', (0, 0, 0))
hips = joint('J_hips', (0, HIP, 0), body)
add(hips, 'pelvis', blob((0, -0.02, 0), (0.16, 0.08, 0.1), seg=12, rings=8), M['skin'])
add(hips, 'pelvis_v', blob((0, -0.08, 0.04), (0.07, 0.06, 0.06), seg=8, rings=6), M['skin'])

# ---------------------------------------------------------------- o tronco: a coluna exposta, as costelas magras
chest = joint('J_chest', (0, 0.05, 0), hips)
add(chest, 'back', rod(curve((0, 0, -0.04), (0, 0.45, -0.07), (0, 0.9, -0.02), 7), [0.07, 0.06, 0.055, 0.06, 0.08, 0.1, 0.1], seg=10, flat=1.6), M['skin'])
for k in range(8):  # as vértebras na frente (a coluna segmentada da miniatura)
    y = 0.04 + k * 0.075
    add(chest, f'vert{k}', blob((0, y, 0.035), (0.075 - k * 0.002, 0.03, 0.055), seg=10, rings=6), M['skin'])
    add(chest, f'vgap{k}', blob((0, y + 0.037, 0.03), (0.06, 0.008, 0.045), seg=8, rings=4), M['dark'])
add(chest, 'ribcage', blob((0, 0.75, 0.0), (0.15, 0.17, 0.1), seg=12, rings=8), M['skin'])
for k in range(3):
    add(chest, f'rib{k}', rod(curve((-0.15, 0.66 + k * 0.07, 0.02), (0, 0.62 + k * 0.07, 0.11), (0.15, 0.66 + k * 0.07, 0.02), 6), 0.012, seg=5), M['dark'])
# a BARRA dos ombros: larga e reta, as pontas saltadas
SH = 0.93
add(chest, 'shoulders', rod(curve((-0.47, SH - 0.03, 0), (0, SH + 0.04, -0.02), (0.47, SH - 0.03, 0), 9), [0.065, 0.06, 0.055, 0.05, 0.05, 0.05, 0.055, 0.06, 0.065], seg=10), M['skin'])
add(chest, 'collar', blob((0, SH, 0), (0.16, 0.06, 0.08), seg=10, rings=6), M['skin'])
add(chest, 'neck', rod([(0, SH, 0), (0, SH + 0.08, 0.02), (0, SH + 0.16, 0.04)], [0.045, 0.035, 0.035], seg=8), M['skin'])
# os dois tentáculos que descem do queixo pelo peito (cruzam na frente da coluna)
for sx in (1, -1):
    add(chest, f'tendril{sx}', rod(curve((sx * 0.03, SH + 0.1, 0.1), (sx * 0.1, 0.62, 0.17), (-sx * 0.05, 0.38, 0.1), 9), [0.022, 0.02, 0.018, 0.017, 0.016, 0.014, 0.012, 0.01, 0.006], seg=6), M['skin'])

# ---------------------------------------------------------------- a cabeça de COGUMELO
head = joint('J_head', (0, SH + 0.16, 0.04), chest)
CAP = [(0.0, 0.44), (0.14, 0.425), (0.25, 0.38), (0.33, 0.3), (0.39, 0.19), (0.415, 0.09), (0.405, 0.02), (0.37, -0.02),
       (0.3, -0.03), (0.2, -0.0), (0.1, 0.02), (0.0, 0.03)]
add(head, 'cap', lathe(CAP, (0, 0, 0), seg=28, squash=0.92), M['skin'])
# a costura do alto (da frente para trás)
seam = []
for r, y in CAP[:7]:
    seam.append((0, y + 0.006, r * 0.92))
seam = list(reversed(seam)) + [(0, y + 0.006, -r * 0.92) for r, y in CAP[1:7]]
add(head, 'seam', rod(seam, 0.012, seg=5), M['dark'])
# os olhos grandes e amendoados, sob a aba, inclinados para fora
for side, sx in (('L', 1), ('R', -1)):
    add(head, f'eye{side}', blob((sx * 0.235, -0.035, 0.27), (0.095, 0.07, 0.05), seg=12, rings=8), M['eye'])
    add(head, f'socket{side}', blob((sx * 0.235, -0.035, 0.25), (0.115, 0.088, 0.05), seg=12, rings=8), M['dark'])
# o rosto fino debaixo do chapéu e o focinho pequeno
add(head, 'face', blob((0, -0.06, 0.12), (0.09, 0.09, 0.1), seg=10, rings=8), M['skin'])
add(head, 'snout', blob((0, -0.12, 0.2), (0.04, 0.05, 0.05), seg=8, rings=6), M['skin'])
add(head, 'nostril', blob((0, -0.15, 0.235), (0.02, 0.012, 0.012), seg=6, rings=4), M['dark'])

# ---------------------------------------------------------------- os braços que chegam ao chão, abertos para fora
for side, sx in (('L', 1), ('R', -1)):
    arm = joint(f'J_arm{side}', (sx * 0.47, SH - 0.03, 0), chest)
    add(arm, f'shoulder{side}', blob((sx * 0.01, 0.01, 0), (0.075, 0.07, 0.07), seg=8, rings=6), M['skin'])
    ELB = (sx * 0.2, -0.86, 0.02)
    add(arm, f'upper{side}', rod(curve((0, 0, 0), (sx * 0.06, -0.45, 0.0), ELB, 6), [0.05, 0.042, 0.036, 0.034, 0.034, 0.036], seg=8), M['skin'])
    elbow = joint(f'J_elbow{side}', ELB, arm)
    add(elbow, f'elbowknob{side}', blob((0, 0, 0), (0.04, 0.045, 0.04), seg=8, rings=6), M['skin'])
    WR = (sx * 0.2, -0.8, 0.06)
    add(elbow, f'fore{side}', rod(curve((0, 0, 0), (sx * 0.1, -0.42, 0.03), WR, 6), [0.036, 0.032, 0.029, 0.027, 0.026, 0.03], seg=8), M['skin'])
    add(elbow, f'hand{side}', blob((WR[0], WR[1] - 0.03, WR[2]), (0.045, 0.05, 0.04), seg=8, rings=6), M['skin'])
    # cinco dedos longos e abertos, a ponta encostando no chão
    for k in range(5):
        a = (k - 2) / 2 * 0.95  # leque de −0,95 a +0,95 rad
        dx, dz = math.sin(a) * sx, math.cos(a)
        wx, wy, wz = WR
        p0 = (wx, wy - 0.04, wz)
        p1 = (wx + (sx * 0.08 + dx * 0.05), wy - 0.12, wz + dz * 0.08)
        p2 = (wx + (sx * 0.12 + dx * 0.16), wy - 0.21, wz + dz * 0.2)
        add(elbow, f'finger{side}{k}', rod(curve(p0, p1, p2, 5), [0.016, 0.014, 0.012, 0.009, 0.005], seg=5), M['skin'])

    # ------------------------------------------------------------ as pernas curtas e arqueadas
    leg = joint(f'J_leg{side}', (sx * 0.11, -0.05, 0), hips)
    KN = (sx * 0.2, -0.38, 0.07)
    add(leg, f'thigh{side}', rod(curve((0, 0, 0), (sx * 0.14, -0.15, 0.02), KN, 6), [0.055, 0.05, 0.045, 0.04, 0.036, 0.036], seg=8), M['skin'])
    knee = joint(f'J_knee{side}', KN, leg)
    add(knee, f'kneeknob{side}', blob((0, 0, 0), (0.042, 0.05, 0.045), seg=8, rings=6), M['skin'])
    ANK = (-sx * 0.03, -0.42, -0.03)
    add(knee, f'shin{side}', rod(curve((0, 0, 0), (sx * 0.0, -0.22, 0.0), ANK, 6), [0.036, 0.032, 0.028, 0.026, 0.026, 0.03], seg=8), M['skin'])
    # o pé: dedos compridos como os de uma mão, abertos para a frente
    for k in range(4):
        a = (k - 1.5) / 1.5 * 0.6
        dx, dz = math.sin(a) * sx, math.cos(a)
        ax, ay, az = ANK
        p0 = (ax, ay, az)
        p1 = (ax + dx * 0.06, ay - 0.06, az + dz * 0.06)
        p2 = (ax + dx * 0.15, ay - 0.1, az + dz * 0.18)
        add(knee, f'toe{side}{k}', rod(curve(p0, p1, p2, 5), [0.017, 0.015, 0.012, 0.009, 0.005], seg=5), M['skin'])

finish()
export_glb(sys.argv[sys.argv.index('--') + 1])
