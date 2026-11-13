"""
RASTROPODA — Alheio Camuflado da Torre da TV Varminho (4º andar; ep. 7 de Sinais do Outro Lado). Miniboss sorteado da
3ª dungeon do Outro Lado (docs/TORRE-TRANSMISSAO.md §2).
REFERÊNCIA VISUAL (wiki "Rastropoda", vista só no navegador, sem baixar):
  · "Miniatura Rastropoda em Sinais do Outro Lado" (a arte oficial da miniatura, de pé)
  · "Miniatura Rastropoda morto em Sinais do Outro Lado" (deitado: mostra a cauda inteira)
  · Guia Confidencial de Morato, páginas 12 e 13
O que a arte mostra (e este modelo segue):
  · o TRONCO ERGUIDO como o de um louva-a-deus, achatado de frente, que termina numa PLACA em losango/folha;
  · a borda da placa e do tronco é uma BABADO grosso e ondulado; no meio da placa, nervuras em espinha de peixe e
    UM nódulo redondo perto do alto; o miolo da placa brilha VERDE;
  · DOIS BRAÇOS finos e compridos, com cotovelo, que terminam em três GARRAS em gancho;
  · um MOLHO de PATINHAS finas e articuladas debaixo do tronco (e menores ao longo da cauda);
  · a CAUDA de LESMA comprida deitada no chão, larga e baixa, com o babado nas laterais e a ponta que se enrola;
  · cor oliva com manchas e veios verde-neon.
PROPOSTA: as medidas exatas (~2,9 m de pé, ~3,3 m de comprimento), o número de patas.
Juntas (animadas em src/combat/alheios.js → Rastropoda.pose): body; seg0 (o tronco erguido), seg1 e seg2 (a cauda) em
cadeia; head (a placa); armL/armR com foreL/foreR (os antebraços com as garras); leg<seg><L|R><k> (3 pares por segmento).
Olhando para +z, em pé no chão.
"""
import sys
import os
import math
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb
from npc_lib import T, rod, curve, spike, blob, joint, add, finish

random.seed(7)
reset()
M = {
    'skin': material('skin_rastropoda', '#56653a', 0.3),
    'ridge': material('ridge_rastropoda', '#323f1e', 0.45),
    'leg': material('leg_rastropoda', '#4a5a2e', 0.4),
    'claw': material('claw_rastropoda', '#1c2412', 0.35),
    'glow': material('glow_rastropoda', '#4fa82a', 0.3, emission='#3edc1a', strength=0.55),
    'node': material('node_rastropoda', '#6a8a3a', 0.25, emission='#3a9a1a', strength=0.5),
}


def loft(points, rw, rd, axis='y', seg=14):
    """tubo de seção ELÍPTICA com largura (rw) e espessura (rd) próprias em cada ponto.
    axis 'y': o tubo sobe (elipse no plano xz); 'z': o tubo deita ao longo de z (elipse no plano xy)"""
    n = len(points)
    V, F, U = [], [], []
    for i, (x, y, z) in enumerate(points):
        for s in range(seg):
            a = s / seg * math.tau
            c, si = math.cos(a) * rw[i], math.sin(a) * rd[i]
            p = (x + c, y, z + si) if axis == 'y' else (x + c, y + si, z)
            V.append(tuple(T(*p)))
            U.append((s / seg, i / (n - 1)))
    for i in range(n - 1):
        for s in range(seg):
            a = i * seg + s
            b = i * seg + (s + 1) % seg
            F.append((a, b, b + seg, a + seg))
    for end in (0, n - 1):
        c = len(V)
        V.append(tuple(T(*points[end])))
        U.append((0.5, 0.5))
        base = end * seg
        for s in range(seg):
            F.append((c, base + (s + 1) % seg, base + s))
    return V, F, U


def interp(prof, t):
    """perfil [(t, valor)] → valor em t (linear)"""
    for (t0, v0), (t1, v1) in zip(prof, prof[1:]):
        if t <= t1:
            return v0 + (v1 - v0) * (t - t0) / max(1e-6, t1 - t0)
    return prof[-1][1]


body = joint('J_body', (0, 0, 0))

# ================================================================ o TRONCO erguido (seg0)
seg0 = joint('J_seg0', (0, 0.55, 0.25), body)
N = 12
TW = [(0, 0.32), (0.35, 0.22), (0.7, 0.19), (1, 0.25)]   # meia-largura (de baixo para cima)
TD = [(0, 0.3), (0.3, 0.22), (0.7, 0.16), (1, 0.13)]                 # meia-espessura
tpts = [(0, -0.4 + 1.38 * i / (N - 1), 0.04 * math.sin(i / (N - 1) * math.pi) + 0.1 * i / (N - 1)) for i in range(N)]
add(seg0, 'torso', loft(tpts, [interp(TW, i / (N - 1)) for i in range(N)], [interp(TD, i / (N - 1)) for i in range(N)]), M['skin'])
# o babado do tronco (as duas laterais, ondulado)
for side, sx in (('L', 1), ('R', -1)):
    pts = [(sx * (interp(TW, t) + 0.02), -0.15 + 1.1 * t, 0.1 * t + 0.03 * math.sin(t * 19)) for t in (k / 13 for k in range(14))]
    add(seg0, f'torso_frill{side}', rod(pts, 0.055, seg=7, wobble=0.25), M['skin'])
# as nervuras do peito (espinha de peixe) e o miolo verde
for k in range(4):
    y = 0.18 + k * 0.2
    zf = interp(TD, (y + 0.4) / 1.38) + 0.1 * (y + 0.4) / 1.38 - 0.01
    add(seg0, f'chest_glow{k}', blob((0, y + 0.08, zf - 0.02), (0.12, 0.08, 0.03), seg=10, rings=6), M['glow'])
    for side, sx in (('L', 1), ('R', -1)):
        add(seg0, f'chest_rib{k}{side}', rod(curve((0, y + 0.12, zf + 0.01), (sx * 0.12, y + 0.02, zf), (sx * 0.18, y - 0.1, zf - 0.06), 5), [0.03, 0.028, 0.024, 0.02, 0.015], seg=6), M['ridge'])
add(seg0, 'chest_mid', rod([(0, 0.1, 0.2), (0, 0.5, 0.2), (0, 0.98, 0.21)], 0.03, seg=6), M['ridge'])
# a barriga das costelas por baixo (onde nascem as patinhas)
add(seg0, 'under', blob((0, -0.1, 0.0), (0.3, 0.2, 0.3), seg=12, rings=8), M['skin'])

# ================================================================ a PLACA em losango (head)
head = joint('J_head', (0, 0.95, 0.1), seg0)
HN = 14
HW = [(0, 0.25), (0.3, 0.58), (0.55, 0.52), (0.8, 0.3), (0.94, 0.12), (1, 0.03)]
HD = [(0, 0.13), (0.5, 0.1), (1, 0.05)]
HH = 1.45
hpts = [(0, HH * i / (HN - 1), -0.04 * math.sin(i / (HN - 1) * math.pi)) for i in range(HN)]
add(head, 'plate', loft(hpts, [interp(HW, i / (HN - 1)) for i in range(HN)], [interp(HD, i / (HN - 1)) for i in range(HN)], seg=16), M['skin'])
# o miolo verde da placa (a frente) e a borda grossa e ondulada
add(head, 'plate_glow', blob((0, 0.6, 0.075), (0.4, 0.52, 0.04), seg=14, rings=10), M['glow'])
for side, sx in (('L', 1), ('R', -1)):
    pts = []
    for k in range(22):
        t = k / 21
        w = interp(HW, t) + 0.03
        pts.append((sx * w, HH * t + 0.02, -0.04 * math.sin(t * math.pi) + 0.035 * math.sin(t * 23 + sx)))
    pts.append((0, HH + 0.03, 0))
    add(head, f'plate_frill{side}', rod(pts, [0.07] * 8 + [0.065] * 8 + [0.055] * 4 + [0.045] * 3, seg=8, wobble=0.2), M['skin'])
# a nervura central e as nervuras em V (espinha de peixe) sobre o verde
add(head, 'plate_mid', rod([(0, 0.0, 0.11), (0, 0.55, 0.13), (0, 1.0, 0.1)], [0.035, 0.03, 0.025], seg=6), M['ridge'])
for k in range(8):
    y = 0.08 + k * 0.12
    w = interp(HW, y / HH) * 0.78
    for side, sx in (('L', 1), ('R', -1)):
        add(head, f'plate_rib{k}{side}', rod(curve((0, y + 0.1, 0.12), (sx * w * 0.5, y + 0.04, 0.11), (sx * w, y - 0.08, 0.07), 5), [0.026, 0.024, 0.02, 0.016, 0.012], seg=6), M['ridge'])
# o NÓDULO redondo perto do alto (o "olho")
add(head, 'node', blob((0, 1.12, 0.07), (0.12, 0.12, 0.08), seg=12, rings=8), M['node'])
add(head, 'node_ring', rod([(0.145 * math.cos(a), 1.12 + 0.145 * math.sin(a), 0.06) for a in (i / 12 * math.tau for i in range(13))], 0.025, seg=6), M['ridge'])

# ================================================================ os BRAÇOS de louva-a-deus (garras em gancho)
for side, sx in (('L', 1), ('R', -1)):
    arm = joint(f'J_arm{side}', (sx * 0.2, 0.62, 0.16), seg0)
    ELB = (sx * 0.42, -0.5, 0.35)
    add(arm, f'shoulder{side}', blob((0, 0, 0), (0.08, 0.08, 0.08), seg=8, rings=6), M['leg'])
    add(arm, f'upper{side}', rod(curve((0, 0, 0), (sx * 0.28, -0.1, 0.2), ELB, 7), [0.06, 0.055, 0.05, 0.048, 0.046, 0.046, 0.05], seg=8), M['leg'])
    fore = joint(f'J_fore{side}', ELB, arm)
    add(fore, f'elbow{side}', blob((0, 0, 0), (0.065, 0.065, 0.065), seg=8, rings=6), M['leg'])
    HAND = (sx * 0.28, 0.5, 0.32)
    add(fore, f'fore{side}', rod(curve((0, 0, 0), (sx * 0.2, 0.18, 0.15), HAND, 7), [0.05, 0.046, 0.042, 0.04, 0.038, 0.036, 0.04], seg=8), M['leg'])
    add(fore, f'hand{side}', blob(HAND, (0.06, 0.07, 0.06), seg=8, rings=6), M['leg'])
    # três garras compridas que curvam para baixo (gancho)
    for k, (dx, dz) in enumerate(((0.1, 0.05), (0.02, 0.12), (-0.06, 0.06))):
        hx, hy, hz = HAND
        p0 = (hx, hy + 0.02, hz)
        p1 = (hx + sx * dx, hy + 0.2, hz + dz + 0.12)
        p2 = (hx + sx * dx * 1.3, hy - 0.12, hz + dz + 0.3)
        add(fore, f'claw{side}{k}', rod(curve(p0, p1, p2, 7), [0.03, 0.028, 0.024, 0.02, 0.015, 0.01, 0.004], seg=6), M['claw'])

# ================================================================ a CAUDA de lesma (seg1, seg2), deitada no chão
seg1 = joint('J_seg1', (0, -0.33, -0.25), seg0)
seg2 = joint('J_seg2', (0, 0, -1.2), seg1)
CW = [(0, 0.44), (0.35, 0.46), (0.7, 0.4), (1, 0.32)]
CH = [(0, 0.24), (1, 0.18)]
pts1 = [(0, 0.0, 0.3 - 1.55 * i / 9) for i in range(10)]
add(seg1, 'tail1', loft(pts1, [interp(CW, i / 9) for i in range(10)], [interp(CH, i / 9) for i in range(10)], axis='z', seg=14), M['skin'])
# a ponta: afina e enrola para cima
TW2 = [(0, 0.33), (0.4, 0.26), (0.75, 0.16), (1, 0.05)]
pts2 = []
for i in range(14):
    t = i / 13
    z = 0.1 - 1.25 * min(t, 0.75) / 0.75 if t <= 0.75 else -1.15 - 0.2 * math.sin((t - 0.75) / 0.25 * math.pi * 0.5)
    y = 0.0 + max(0, (t - 0.55) / 0.45) ** 1.6 * 0.55
    pts2.append((0.06 * math.sin(t * 4), y, z))
add(seg2, 'tail2', loft(pts2, [interp(TW2, i / 13) for i in range(14)], [0.18 * (1 - 0.65 * i / 13) for i in range(14)], axis='z', seg=12), M['skin'])
# o babado das laterais da cauda (ondulado, rente ao chão)
for jn, seg_, prof, zr in ((seg1, 1, CW, (0.25, -1.25)), (seg2, 2, TW2, (0.05, -1.0))):
    for side, sx in (('L', 1), ('R', -1)):
        pts = []
        for k in range(16):
            t = k / 15
            z = zr[0] + (zr[1] - zr[0]) * t
            pts.append((sx * (interp(prof, t) + 0.03 + 0.03 * math.sin(t * 17 + seg_)), -0.12 + 0.03 * math.cos(t * 13), z))
        add(jn, f'tail_frill{seg_}{side}', rod(pts, 0.06, seg=6, wobble=0.3), M['skin'])
# manchas verdes no dorso da cauda e as rugas de lesma
for jn, nm, zr, w in ((seg1, 1, (0.1, -1.2), 0.36), (seg2, 2, (0.0, -0.9), 0.22)):
    for k in range(5):
        z = zr[0] + (zr[1] - zr[0]) * (k + random.uniform(0.1, 0.9)) / 5
        add(jn, f'tail_spot{nm}{k}', blob((random.uniform(-0.5, 0.5) * w, 0.17 if nm == 1 else 0.12, z), (random.uniform(0.08, 0.15), 0.03, random.uniform(0.1, 0.2)), seg=8, rings=5), M['glow'])
    for k in range(4):
        z = zr[0] + (zr[1] - zr[0]) * (k + 0.5) / 4
        add(jn, f'tail_fold{nm}{k}', rod(curve((-w, 0.05, z), (0, 0.27 if nm == 1 else 0.2, z + 0.04), (w, 0.05, z), 7), 0.022, seg=5), M['ridge'])

# ================================================================ as PATINHAS finas e articuladas
def leg(jn, name, hip, reach, knee_up, r0, drop):
    """junta da patinha no quadril; perna de três pedaços até o chão (em coordenadas da junta)"""
    sx = 1 if hip[0] >= 0 else -1
    lj = joint(name, hip, jn)
    k1 = (sx * reach * 0.45, knee_up, 0.04)
    k2 = (sx * reach * 0.85, knee_up * 0.4, 0.08)
    foot = (sx * reach, -drop, 0.14)
    add(lj, name[2:], rod([(0, 0, 0), k1, k2, foot], [r0, r0 * 0.8, r0 * 0.6, r0 * 0.3], seg=6), M['leg'])
    for k, p in enumerate((k1, k2)):
        add(lj, f'{name[2:]}_kn{k}', blob(p, (r0 * 0.9, r0 * 0.9, r0 * 0.9), seg=6, rings=4), M['leg'])
    for k in (-1, 1):  # dedinhos
        add(lj, f'{name[2:]}_toe{k}', spike(foot, (foot[0] + sx * 0.06, foot[1] - 0.02, foot[2] + 0.07 * k), 0.012, seg=4), M['claw'])


for k, z in enumerate((0.3, 0.12, -0.08)):  # debaixo do tronco: as maiores
    for side, sx in (('L', 1), ('R', -1)):
        leg(seg0, f'J_leg0{side}{k}', (sx * 0.18, -0.15, z), 0.6 - k * 0.04, 0.12, 0.03, 0.4)
for k, z in enumerate((0.0, -0.45, -0.9)):  # o começo da cauda
    for side, sx in (('L', 1), ('R', -1)):
        leg(seg1, f'J_leg1{side}{k}', (sx * 0.3, 0.12, z), 0.42, 0.05, 0.024, 0.34)
for k, z in enumerate((0.0, -0.35, -0.7)):  # a cauda: patinhas miúdas
    for side, sx in (('L', 1), ('R', -1)):
        leg(seg2, f'J_leg2{side}{k}', (sx * 0.22, 0.12, z), 0.3, 0.03, 0.018, 0.34)

finish()
export_glb(sys.argv[sys.argv.index('--') + 1])
