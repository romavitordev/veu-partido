"""
ARARA DEVORADA e ARARA INFERNAL (Sobrevivendo ao Horror: Hexatombe, ep. 5 — o bestiário da Coroa de Espinhos; wiki
"Arara Devorada" e as artes em Referencias visuais/Personagens/sertao-hexatombe-bestiario/). Uma arara-vermelha tomada
pelo Sangue: a plumagem VERMELHA-SANGUE com as faixas amarela e azul das penas de voo escurecidas, as GARRAS nas pontas
das asas, o BICO projetado para a frente com DUAS FILEIRAS LONGAS DE DENTES, os DOIS BRAÇOS MUSCULOSOS extras saindo do
peito (espinhos e pontas em gancho), o corpo encurvado e as patas com garras.
  - devorada: a arara tomada (voa e dá rasantes);
  - infernal: a variação (só no Aniquilação): mais escura, as COSTELAS abertas no peito, espinhos de osso no dorso e as
    ASAS DE MORCEGO de osso e membrana embaixo das asas (a arte da wiki).

TÉCNICA: a escultura de metaballs (npc_sculpt_lib) para tronco, cabeça e membros; as penas em fitas (ribbon), as garras
e os dentes em cones/tubos. Pose de modelagem: em pé, asas ABERTAS na horizontal (o jogo bate as asas girando as
juntas). Juntas: body, torso, head, jaw, wingL/R (braço da asa) com wingtipL/R (a mão), armL/R com forearmL/R (os braços
do peito), legL/R com kneeL/R, tail; a infernal tem também batL/R.
"""
import sys
import math
import random

from mathutils import Vector

from lib import reset, material, export_glb, hex_rgb
from npc_lib import rod, curve, spike, ribbon, joint, add, finish, T
from npc_sculpt_lib import Sculpt, vcol_material, ridge, n3, white_vcols


def membrane(fingers):
    """membrana entre dedos vizinhos (cada dedo = lista de pontos com o mesmo tamanho)"""
    V, F, U = [], [], []
    n = len(fingers[0])
    for f in fingers:
        for p in f:
            V.append(tuple(T(*p)))
            U.append((0, 0))
    for a in range(len(fingers) - 1):
        for i in range(n - 1):
            p = a * n + i
            q = (a + 1) * n + i
            F.append((p, p + 1, q + 1, q))
    return V, F, U


def build(kind):
    inf = kind == 'infernal'
    random.seed(41 if inf else 31)
    reset()
    M = {
        'body': vcol_material('plume_arara', 0.8),
        'red': material('feather_red_arara', '#5a0c0c' if inf else '#8a1414', 0.85),
        'band': material('feather_band_arara', '#6a3a14' if inf else '#a8681c', 0.8),
        'blue': material('feather_blue_arara', '#24183a' if inf else '#2c2a6a', 0.8),
        'dark': material('feather_dark_arara', '#2a0606' if inf else '#4a0a0c', 0.85),
        'beak': material('beak_arara', '#d8cfc0', 0.4),
        'beakTip': material('beak_tip_arara', '#24201e', 0.4),
        'tooth': material('tooth_arara', '#e0d0a8', 0.35),
        'maw': material('maw_arara', '#1a0404', 0.8),
        'claw': material('claw_arara', '#141010', 0.35),
        'bone': material('bone_arara', '#c8b090', 0.5),
        'eye': material('glow_eye_arara', '#ff2a1a', 0.3, emission='#ff2a1a', strength=3.0),
        'skin': material('membrane_arara', '#3a0a0e', 0.6),
        'scale': material('scale_leg_arara', '#4a4040', 0.7),
        'blood': material('goo_blood_arara', '#4a0606', 0.3),
    }
    C = {k: Vector(hex_rgb(v)) for k, v in {
        'red': '#5a0c0c' if inf else '#9a1a16', 'tip': '#7a1a14' if inf else '#c42a1e', 'dark': '#1e0404' if inf else '#3a0606',
        'flesh': '#6a1418', 'muscle': '#8a2228' if inf else '#7a1c20', 'face': '#b8a89a' if not inf else '#8a6a60',
        'scale': '#3a3030', 'bone': '#c8b090',
    }.items()}
    FD = 0.012

    def plume(p):
        """plumagem: escamas de pena (sulcos em ondas para trás)"""
        x, y, z = p
        w = n3(p, 7) * 3.0
        v = ridge(z * 45 - y * 55 + abs(x) * 20 + w, 4)  # as fileiras de penas (escamas), tortas pelo ruído
        v2 = ridge(abs(x) * 120 + y * 60 + n3(p, 3) * 2, 2)  # as barbas finas
        return FD * (0.65 * v + 0.35 * v2 - 0.4) * (0.6 + 0.8 * abs(n3(p, 2)))

    def color_fn(disp):
        def f(p, sc):
            fld = sc.field(p)
            if fld.get('bone', 0) > 0.3:
                return C['bone']
            if fld.get('muscle', 0) > 0.3:
                return C['muscle'].lerp(C['dark'], max(0.0, n3(p, 13)) * 0.6)
            if fld.get('flesh', 0) > 0.3:
                return C['flesh'].lerp(C['dark'], max(0.0, n3(p, 8)) * 0.5)
            if fld.get('face', 0) > 0.5:
                return C['face'].lerp(C['red'], max(0.0, n3(p, 20)) * 0.6)
            if fld.get('scale', 0) > 0.4:
                return C['scale']
            k = max(0.0, min(1.0, disp(p) / FD + 0.45)) if disp else 0.5
            return C['dark'].lerp(C['red'], 0.55 + 0.45 * min(1.0, k * 1.4)).lerp(C['tip'], max(0.0, k - 0.75) * 1.6)
        return f

    body = joint('J_body', (0, 0, 0))
    TY = 0.8
    torso = joint('J_torso', (0, TY, 0), body)

    # ================================================================ TRONCO encurvado
    S = Sculpt('tronco_arara_' + kind)
    S.ell((0, 0.12, 0.06), (0.25, 0.3, 0.24))  # o peito largo
    S.ell((0, -0.12, -0.02), (0.21, 0.24, 0.22))  # a barriga
    S.ell((0, 0.02, -0.22), (0.17, 0.2, 0.2))  # o dorso caindo para a cauda
    S.ell((0, -0.2, -0.36), (0.1, 0.1, 0.14))  # a raiz da cauda
    S.chain([(0, 0.32, 0.1), (0, 0.46, 0.2), (0, 0.55, 0.28)], [0.15, 0.13, 0.11], step=0.5)  # pescoço para a frente
    for s in (1, -1):
        S.ell((s * 0.2, 0.3, 0.0), (0.12, 0.12, 0.13))  # os ombros das asas
        S.ell((s * 0.12, -0.24, -0.02), (0.1, 0.12, 0.11))  # as coxas emplumadas
        S.ell((s * 0.13, 0.04, 0.2), (0.08, 0.08, 0.08), 'muscle')  # a raiz dos braços do peito
    if inf:
        S.ell((0, 0.02, 0.22), (0.15, 0.2, 0.06), 'flesh')  # o peito aberto
        for r in range(4):  # as costelas expostas
            y = 0.18 - r * 0.08
            for s in (1, -1):
                S.chain([(s * 0.03, y, 0.26), (s * 0.12, y - 0.02, 0.26), (s * 0.19, y - 0.05, 0.18)], 0.016, 'bone', step=0.5)
    bd = plume
    S.build(torso, M['body'], 3600, res=0.011, smooth=3, disp=bd, color=color_fn(bd))
    # penas desgrenhadas pelo corpo (pontas para trás e para baixo)
    for i in range(70):
        a = random.uniform(0, math.tau)
        y = random.uniform(-0.3, 0.4)
        r = 0.22 - abs(y) * 0.12
        x, z = math.sin(a) * r, math.cos(a) * r - 0.05
        if z > 0.12 and abs(x) < 0.15 and inf:
            continue
        ln = random.uniform(0.08, 0.16)
        add(torso, f'shag{i}', spike((x, y, z), (x * 1.25, y - ln * 0.8, z - ln * 0.5), 0.022, seg=4), M['red' if random.random() < 0.7 else 'dark'])
    if inf:  # espinhos de osso no dorso
        for i in range(7):
            z = 0.1 - i * 0.07
            y = 0.32 - i * 0.04
            add(torso, f'dspike{i}', spike((0, y, z), (0, y + 0.16 - i * 0.01, z - 0.1), 0.025, seg=5), M['bone'])
    # o sangue escorrendo do peito
    for i in range(4):
        x = random.uniform(-0.12, 0.12)
        add(torso, f'drip{i}', rod([(x, 0.05, 0.27), (x * 1.05, -0.05, 0.26), (x, -0.16, 0.24)], [0.014, 0.01, 0.002], seg=5), M['blood'])

    # ================================================================ CABEÇA e o BICO de dentes
    head = joint('J_head', (0, 0.6, 0.32), torso)
    H = Sculpt('cabeca_arara_' + kind)
    H.ell((0, 0.06, 0.0), (0.13, 0.13, 0.14))
    H.ell((0, 0.02, 0.08), (0.11, 0.1, 0.1))
    for s in (1, -1):
        H.ell((s * 0.085, 0.05, 0.08), (0.04, 0.06, 0.07), 'face')  # o rosto pálido da arara
        H.ell((s * 0.095, 0.08, 0.08), (0.026, 0.026, 0.024), 'flesh', neg=True)  # órbita funda
    hd = plume
    H.build(head, M['body'], 1400, res=0.007, smooth=3, disp=hd, color=color_fn(hd))
    for s in (1, -1):
        add(head, f'eye{s}', rod([(s * 0.088, 0.08, 0.075), (s * 0.1, 0.08, 0.09)], 0.018, seg=8), M['eye'])
    # bico superior: a curva grande projetada para a frente, a ponta em gancho
    upper = curve((0, 0.07, 0.12), (0, 0.12, 0.42), (0, -0.1, 0.48), 9)
    add(head, 'beakU', rod(upper, [0.085, 0.08, 0.072, 0.062, 0.05, 0.038, 0.026, 0.014, 0.003], seg=10, flat=0.85), M['beak'])
    add(head, 'beakTip', rod(upper[-3:], [0.026, 0.014, 0.003], seg=8), M['beakTip'])
    add(head, 'mawU', rod([(0, -0.0, 0.1), (0, 0.01, 0.3)], [0.06, 0.03], seg=8), M['maw'])
    # as duas fileiras LONGAS de dentes do bico de cima (para baixo)
    for s in (1, -1):
        for i in range(9):
            t = i / 8
            z = 0.12 + t * 0.3
            y = 0.03 + math.sin(t * math.pi) * 0.05 - t * 0.06
            x = s * (0.055 - t * 0.03)
            ln = 0.05 + 0.03 * math.sin(t * math.pi) * random.uniform(0.8, 1.2)
            add(head, f'toothU{s}{i}', rod(curve((x, y, z), (x * 1.05, y - ln * 0.6, z + 0.01), (x * 0.95, y - ln, z + 0.02), 4), [0.011, 0.008, 0.004, 0.001], seg=5), M['tooth'])
    jaw = joint('J_jaw', (0, -0.03, 0.1), head)
    lower = curve((0, 0, 0), (0, -0.06, 0.18), (0, -0.02, 0.3), 7)
    add(jaw, 'beakL', rod(lower, [0.07, 0.065, 0.055, 0.045, 0.033, 0.02, 0.004], seg=10, flat=0.8), M['beak'])
    add(jaw, 'mawL', rod([(0, 0.02, 0.02), (0, -0.0, 0.22)], [0.05, 0.02], seg=8), M['maw'])
    for s in (1, -1):
        for i in range(7):
            t = i / 6
            z = 0.03 + t * 0.25
            y = -0.01 - math.sin(t * math.pi) * 0.04
            x = s * (0.045 - t * 0.025)
            ln = 0.045 * random.uniform(0.8, 1.2)
            add(jaw, f'toothL{s}{i}', rod(curve((x, y, z), (x * 1.05, y + ln * 0.6, z + 0.01), (x * 0.95, y + ln, z + 0.02), 4), [0.01, 0.007, 0.004, 0.001], seg=5), M['tooth'])
    add(jaw, 'drool', rod([(0, -0.05, 0.16), (0.005, -0.12, 0.17), (0, -0.2, 0.16)], [0.012, 0.008, 0.002], seg=5), M['blood'])
    # o topete de penas da nuca
    for i in range(6):
        a = (i - 2.5) * 0.25
        add(head, f'crest{i}', spike((math.sin(a) * 0.06, 0.15, -0.04), (math.sin(a) * 0.12, 0.24, -0.2), 0.03, seg=4), M['red'])

    # ================================================================ ASAS abertas (penas em fitas) com GARRAS na ponta
    def feather(jnt, name, base, tip, w, mat, up=0.0):
        mid = ((base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2 + up, (base[2] + tip[2]) / 2)
        add(jnt, name, ribbon([base, mid, tip], [w, w * 0.9, w * 0.15], normal=(0, 1, 0)), mat)

    for side, s in (('L', 1), ('R', -1)):
        w = joint(f'J_wing{side}', (s * 0.24, 0.32, -0.02), torso)
        Wd = Sculpt(f'asa{side}_arara_{kind}')
        Wd.chain([(0, 0, 0), (s * 0.3, 0.05, -0.02), (s * 0.62, 0.04, 0.0)], [0.08, 0.06, 0.045], step=0.5)
        Wd.build(w, M['body'], 700, res=0.009, smooth=2, disp=plume, color=color_fn(plume))
        # as coberteiras (vermelhas), a faixa (amarela escurecida) e as penas de voo (azul)
        for i in range(10):
            t = i / 9
            bx = s * (0.04 + t * 0.58)
            feather(w, f'cov{i}', (bx, 0.035, 0.03), (bx + s * 0.03, 0.02, -0.26), 0.11, M['red'])
            feather(w, f'band{i}', (bx, 0.02, -0.08), (bx + s * 0.05, 0.0, -0.46), 0.1, M['band'])
            feather(w, f'sec{i}', (bx, 0.005, -0.15), (bx + s * (0.06 + t * 0.06), -0.03, -0.72 - 0.06 * math.sin(t * math.pi)), 0.1, M['blue'])
        wt = joint(f'J_wingtip{side}', (s * 0.62, 0.04, 0.0), w)
        Wt = Sculpt(f'mao{side}_arara_{kind}')
        Wt.chain([(0, 0, 0), (s * 0.28, 0.02, 0.04)], [0.045, 0.03], step=0.5)
        Wt.build(wt, M['body'], 300, res=0.008, smooth=2, disp=plume, color=color_fn(plume))
        for i in range(9):  # as primárias em leque (de trás para fora)
            a = i / 8
            ang = -math.pi / 2 + a * math.pi * 0.5  # -90° (para trás) até 0 (para fora)
            ln = 0.6 + 0.3 * a
            bx = s * (0.02 + a * 0.26)
            tip = (bx + s * math.cos(ang + math.pi / 2 - 0.0) * 0 + s * math.sin(a * 1.2) * ln * 0.85, -0.04, 0.02 + math.cos(a * 1.2) * -ln)
            feather(wt, f'prim{i}', (bx, 0.0, -0.02), tip, 0.1, M['blue' if i % 3 else 'dark'])
            if i % 2 == 0:
                feather(wt, f'pcov{i}', (bx, 0.02, 0.0), (bx + (tip[0] - bx) * 0.45, 0.01, tip[2] * 0.45), 0.1, M['red'])
        for i in range(3):  # as GARRAS do punho, curvas para a frente
            a = (i - 1) * 0.35
            b = (s * 0.27, 0.03, 0.06)
            add(wt, f'wclaw{i}', rod(curve(b, (b[0] + s * 0.05, 0.06 + a * 0.08, 0.17), (b[0] + s * 0.02, 0.0 + a * 0.08, 0.24), 5), [0.022, 0.018, 0.013, 0.007, 0.001], seg=6), M['claw'])

        # ================================================================ os BRAÇOS do peito (músculo, espinhos, gancho)
        arm = joint(f'J_arm{side}', (s * 0.14, 0.04, 0.22), torso)
        A = Sculpt(f'braco{side}_arara_{kind}')
        A.chain([(0, 0, 0), (s * 0.05, -0.08, 0.1), (s * 0.06, -0.17, 0.17)], [0.07, 0.065, 0.05], 'muscle', step=0.45)
        A.ell((s * 0.03, -0.06, 0.07), (0.06, 0.075, 0.06), 'muscle')  # o bíceps
        A.build(arm, M['body'], 600, res=0.007, smooth=2, color=color_fn(None))
        fa = joint(f'J_forearm{side}', (s * 0.06, -0.17, 0.17), arm)
        Fa = Sculpt(f'antebraco{side}_arara_{kind}')
        Fa.chain([(0, 0, 0), (s * 0.0, -0.02, 0.14), (s * -0.01, 0.0, 0.26)], [0.05, 0.045, 0.032], 'muscle', step=0.45)
        Fa.build(fa, M['body'], 500, res=0.006, smooth=2, color=color_fn(None))
        for i in range(3):  # espinhos no antebraço
            z = 0.05 + i * 0.08
            add(fa, f'aspike{i}', spike((s * 0.03, 0.03, z), (s * 0.08, 0.09, z - 0.04), 0.014, seg=5), M['bone'])
        for i in range(3):  # os dedos em GANCHO
            a = (i - 1) * 0.5
            b = (s * -0.01 + math.sin(a) * 0.03, 0.0, 0.27)
            add(fa, f'hook{i}', rod(curve(b, (b[0] + math.sin(a) * 0.05, 0.02, 0.38), (b[0] + math.sin(a) * 0.06, -0.08, 0.4), 5), [0.018, 0.015, 0.011, 0.006, 0.001], seg=6), M['claw'])

        # ================================================================ PERNAS de escama e as garras
        leg = joint(f'J_leg{side}', (s * 0.12, -0.26, -0.02), torso)
        Lg = Sculpt(f'coxa{side}_arara_{kind}')
        Lg.chain([(0, 0.04, 0), (0, -0.14, 0.04), (0, -0.28, 0.06)], [0.085, 0.06, 0.04], step=0.5)
        Lg.build(leg, M['body'], 500, res=0.008, smooth=2, disp=plume, color=color_fn(plume))
        for i in range(9):  # as penas da coxa caindo por cima do joelho
            a = random.uniform(0, math.tau)
            b = (math.sin(a) * 0.07, random.uniform(-0.05, -0.2), math.cos(a) * 0.07 + 0.03)
            add(leg, f'tshag{i}', spike(b, (b[0] * 1.3, b[1] - 0.16, b[2] * 1.2 - 0.03), 0.03, seg=4), M['red'])
        kn = joint(f'J_knee{side}', (0, -0.28, 0.06), leg)
        add(kn, 'tarsus', rod([(0, 0, 0), (0, -0.12, -0.03), (0, -0.24, 0.0)], [0.045, 0.036, 0.03], seg=8), M['scale'])
        for i, (dx, dz) in enumerate(((0.05, 1), (-0.05, 1), (0.04, -1), (-0.04, -1))):  # zigodáctilo: 2 para a frente, 2 para trás
            b = (dx * 0.4, -0.24, 0.0)
            e = (dx, -0.26, dz * 0.13)
            add(kn, f'toe{i}', rod([b, e], [0.024, 0.018], seg=6), M['scale'])
            add(kn, f'talon{i}', rod(curve(e, (e[0] * 1.05, -0.25, e[2] + dz * 0.06), (e[0] * 1.05, -0.31, e[2] + dz * 0.07), 4), [0.015, 0.011, 0.006, 0.001], seg=5), M['beakTip'])

        # ================================================================ ASAS DE MORCEGO de osso (só a infernal)
        if inf:
            bat = joint(f'J_bat{side}', (s * 0.17, 0.06, -0.12), torso)
            add(bat, 'batArm', rod([(0, 0, 0), (s * 0.3, -0.06, -0.06), (s * 0.55, -0.02, -0.04)], [0.03, 0.022, 0.018], seg=7), M['bone'])
            fingers = []
            for i in range(5):
                a = i / 4
                ang = -0.25 - a * 1.35  # dos dedos para fora e para baixo
                ln = 0.75 - a * 0.25
                p0 = (s * 0.55, -0.02, -0.04)
                p2 = (p0[0] + s * math.cos(ang) * ln, p0[1] + math.sin(ang) * ln, p0[2] - 0.12 - a * 0.1)
                p1 = ((p0[0] + p2[0]) / 2 + s * 0.04, (p0[1] + p2[1]) / 2 + 0.04, (p0[2] + p2[2]) / 2)
                pts = curve(p0, p1, p2, 6)
                add(bat, f'batFinger{i}', rod(pts, [0.016, 0.014, 0.012, 0.01, 0.007, 0.002], seg=6), M['bone'])
                add(bat, f'batClaw{i}', spike(pts[-1], (pts[-1][0] + s * 0.03, pts[-1][1] - 0.07, pts[-1][2]), 0.01, seg=4), M['claw'])
                fingers.append(pts)
            # a membrana rasgada: só entre alguns dedos (como na arte, com buracos)
            add(bat, 'batSkin', membrane([[(x, y, z) for x, y, z in f] for f in fingers[:3]]), M['skin'])
            add(bat, 'batSkin2', membrane([[(x, y, z) for x, y, z in f][:4] for f in fingers[3:]]), M['skin'])
            add(bat, 'batSkin3', membrane([[(x, y, z) for x, y, z in f][:5] + [(s * 0.2, -0.05, -0.05)] for f in (fingers[4], [(s * 0.3, -0.06, -0.06)] * 6)]), M['skin'])

    # ================================================================ CAUDA de penas longas
    tail = joint('J_tail', (0, -0.22, -0.4), torso)
    for i in range(7):
        a = (i - 3) * 0.09
        ln = 1.0 - abs(i - 3) * 0.12
        tip = (math.sin(a) * ln * 0.8, -ln * 0.55, -ln * 0.75)
        mid = (tip[0] * 0.5, tip[1] * 0.4, tip[2] * 0.5)
        add(tail, f'tail{i}', ribbon([(math.sin(a) * 0.03, 0.0, 0.0), mid, tip], [0.075, 0.07, 0.01], normal=(0, 0.8, -0.6)), M['red' if i != 3 else 'blue'])
        if inf and i % 2 == 0:
            add(tail, f'tailbone{i}', rod([(math.sin(a) * 0.03, 0.01, 0.0), mid, tip], [0.01, 0.008, 0.002], seg=5), M['bone'])

    white_vcols()
    finish()
    out = sys.argv[sys.argv.index('--') + 1]
    export_glb(out)
