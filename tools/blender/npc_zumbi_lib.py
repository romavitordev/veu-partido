"""
ZUMBI DE SANGUE (invocação do Diabo, "Senhor do Sangue") — wiki "Zumbis de Sangue" (miniaturas de Desconjuração).

Cânone: pele GOSMENTA e avermelhada, os músculos expostos com estrias claras e VEIAS escuras por cima; CEGOS — as
órbitas dos olhos vazias (pretas); os dentes crescem todos pontudos e a boca se expande cheia deles; as unhas viram
garras longas. Duas variações (build(strong)):
  - FRACO (npc_zumbi_sangue.py, "Homem-Feto" pelo Kaiser): magro e comprido, crânio grande e calvo, as duas órbitas
    fundas e a bocarra vertical de presas compridas cor de marfim; braços longos até os joelhos;
  - FORTE = o BESTIAL (npc_zumbi_sangue_forte.py): muito maior, uma CORCOVA de músculo nas costas, quase de quatro; o
    crânio cresceu e se PARTIU AO MEIO a partir do topo (o sulco do focinho), a mandíbula enorme com o dobro de presas.

TÉCNICA: a escultura do Carniçal (npc_sculpt_lib.py) — cada peça é uma forma contínua de metaballs, com as estrias dos
músculos por deslocamento e a cor por vértice (vermelho escuro nos sulcos, rosado nas cristas, manchas mais escuras).
Peças em juntas (J_*) nas MESMAS posições de antes (src/combat/npcs.js → BloodZombie.pose e BLOOD_ZOMBIE.leg contam
com elas). Modelado em pé, membros retos para baixo, olhando para +z; a postura curvada é dada pelo jogo.
"""
import sys
import os
import math
import random

import bpy
from mathutils import Vector

from lib import reset, material, export_glb, hex_rgb, TAU
from npc_lib import rod, curve, spike, joint, add, finish
from npc_sculpt_lib import Sculpt, vcol_material, limb_fibers, ridge, n3, white_vcols


def quibungo_extras(chest, M, MAW_C, MAW_D):
    """as costas do Quibungo: os ESPINHOS DE OSSO em arco (como costelas) em volta da bocarra e a LÍNGUA em três juntas.
    No jogo o tronco vai inclinado ~0,7 rad para a frente (de quatro): U é o "para cima" e F o "para a frente" no
    mundo"""
    th = 0.7
    U = Vector((0, math.sin(th), -math.cos(th)))
    F = Vector((0, math.cos(th), math.sin(th)))
    X = Vector((1, 0, 0))
    c0, d = Vector(MAW_C), Vector(MAW_D).normalized()
    # REMODELO (dono, 2026-11-20, com as artes oficiais de Hexatombe: "um remodel agora com essas referencias"): a COROA
    # de espinhos de osso é o que mais marca a silhueta — 9 de cada lado, compridos, saindo dos ombros e das costas e
    # curvando para cima e para a frente por trás da bocarra da frente (a arte de frente mostra um leque em volta da
    # "cabeça"); os de trás, mais curtos, descem pela espinha
    for s in (1, -1):
        # a COROA: na crista dos ombros, em leque — os do meio para cima, os de fora abrindo para o lado — inclinada para
        # a frente, por trás da bocarra (a arte de frente)
        for i in range(7):
            t = i / 6
            a = 0.12 + t * 1.25  # 0 = para cima, ~1,4 = para o lado
            c = c0 + d * (0.5 - 0.12 * t) * 0.95
            ln = (0.78 - 0.22 * t) * random.uniform(0.9, 1.08)
            b = Vector((s * (0.08 + 0.2 * t), c.y - 0.04 * t, c.z + 0.08 + 0.04 * t))
            dr = (U * math.cos(a) + X * s * math.sin(a) + F * 0.55).normalized()
            mid = b + dr * ln * 0.55 + X * s * ln * 0.08
            tip = b + dr * ln + F * ln * 0.18 - X * s * ln * 0.06  # a ponta curva para a frente e para dentro
            pts = curve(tuple(b), tuple(mid), tuple(tip), 8)
            r0 = 0.042 - 0.008 * t
            add(chest, f'spine{s}{i}', rod(pts, [r0, r0 * 0.88, r0 * 0.74, r0 * 0.6, r0 * 0.46, r0 * 0.33, r0 * 0.2, 0.003], seg=7), M['bone'])
            add(chest, f'spineTip{s}{i}', rod(pts[-3:], [r0 * 0.32, r0 * 0.18, 0.002], seg=6), M['boneTip'])
        # e os das COSTAS (a arte de costas): dos dois lados da fenda, para cima e um pouco para trás, menores para baixo
        for i in range(6):
            t = i / 5
            c = c0 + d * (0.3 - t * 0.85) * 0.95
            ln = (0.6 - 0.3 * t) * random.uniform(0.88, 1.1)
            b = Vector((s * (0.16 + 0.03 * math.sin(t * 3)), c.y, c.z + 0.05))
            dr = (U + X * s * 0.35 - F * (0.15 + 0.4 * t)).normalized()
            pts = curve(tuple(b), tuple(b + dr * ln * 0.55 + X * s * ln * 0.1), tuple(b + dr * ln + F * ln * 0.12), 8)
            r0 = 0.034 - 0.01 * t
            add(chest, f'spineB{s}{i}', rod(pts, [r0, r0 * 0.88, r0 * 0.74, r0 * 0.6, r0 * 0.46, r0 * 0.33, r0 * 0.2, 0.003], seg=7), M['bone'])
            add(chest, f'spineBTip{s}{i}', rod(pts[-3:], [r0 * 0.32, r0 * 0.18, 0.002], seg=6), M['boneTip'])
        # a BOCARRA DAS COSTAS (arte de costas): uma fenda comprida na espinha com dentes curvos que se cruzam por cima
        for i in range(11):
            t = i / 10
            c = c0 + d * (t - 0.5) * 0.62
            ln = 0.16 + 0.06 * math.sin(t * math.pi)
            b = Vector((s * 0.085, c.y, c.z - 0.01))
            add(chest, f'btooth{s}{i}', rod(curve(tuple(b), tuple(b + X * -s * ln * 0.35 + U * ln * 0.5), tuple(b + X * -s * ln * 1.05 + U * ln * 0.25), 5),
                                            [0.017, 0.013, 0.009, 0.005, 0.0015], seg=5), M['fang'])
    # a LÍNGUA (as artes: comprida, roxa, enrolando bem acima dele): três juntas, ~2,6 m esticada
    tg = joint('J_tongue', tuple(c0 + U * 0.02), chest)
    q1 = curve((0, 0, 0), tuple(U * 0.7 - F * 0.25), tuple(U * 1.25 - F * 0.05), 8)
    add(tg, 'tongue1', rod(q1, [0.095, 0.09, 0.085, 0.08, 0.076, 0.072, 0.068, 0.064], seg=10), M['tongue'])
    tg2 = joint('J_tongue2', q1[-1], tg)
    q2 = curve((0, 0, 0), tuple(U * 0.75 + F * 0.4), tuple(U * 0.95 - F * 0.4), 8)
    add(tg2, 'tongue2', rod(q2, [0.064, 0.06, 0.056, 0.052, 0.048, 0.045, 0.042, 0.04], seg=10), M['tongue'])
    tg3 = joint('J_tongue3', q2[-1], tg2)
    q3 = curve((0, 0, 0), tuple(U * 0.15 - F * 0.6), tuple(U * 0.6 - F * 0.55), 9)
    add(tg3, 'tongue3', rod(q3, [0.04, 0.037, 0.034, 0.03, 0.026, 0.021, 0.015, 0.008, 0.002], seg=10), M['tongue'])


def fur_tuft(jnt, name, base, axis, side, n, ln, M):
    """os TUFOS DE PELO das artes ("pelos já consumidos pela carne"): mechas finas e escuras na parte de trás dos
    antebraços e das coxas, penteadas para baixo ao longo do membro"""
    ax = Vector(axis).normalized()
    for i in range(n):
        t = i / max(1, n - 1)
        b = Vector(base) + ax * (t * ln * 1.4)
        off = Vector((side * random.uniform(-0.05, 0.05), 0, -random.uniform(0.0, 0.05)))
        L = ln * random.uniform(0.6, 1.0)
        p0 = b + off
        p2 = p0 + ax * L * 0.8 + Vector((0, 0, -L * 0.55))
        p1 = (p0 + p2) / 2 + Vector((0, 0, -L * 0.1))
        add(jnt, f'{name}{i}', rod(curve(tuple(p0), tuple(p1), tuple(p2), 4), [0.012, 0.008, 0.004, 0.001], seg=4), M['fur'])


def felino_extras(chest, neck, M):
    """o FELINO INFERNAL (Aniquilação) sobre o Zumbi Fraco: o LEQUE DE ESPINHOS DE OSSO abrindo das costas como asas,
    a COROA de chifres-garra na cabeça e o RABO comprido em S com a lâmina (juntas tail/tail2)"""
    X = Vector((1, 0, 0))
    for s in (1, -1):
        for row, (yb, n, L) in enumerate(((0.56, 7, 0.62), (0.4, 6, 0.48), (0.26, 4, 0.34))):
            for i in range(n):
                t = i / (n - 1)
                a = 0.15 + t * 1.25  # 0 = para cima, ~pi/2 = para o lado
                ln = L * (1 - 0.3 * abs(t - 0.35)) * random.uniform(0.9, 1.1)
                b = Vector((s * (0.06 + 0.02 * row), yb - t * 0.05, -0.08 + 0.01 * row))
                d = Vector((s * math.sin(a), math.cos(a), -0.35))
                mid = b + d * ln * 0.55
                tip = b + d * ln + Vector((-s * 0.08, 0.06, 0.12)) * ln  # a ponta vira para dentro e para a frente
                pts = curve(tuple(b), tuple(mid), tuple(tip), 7)
                r0 = 0.036 - 0.006 * row
                add(chest, f'fan{s}{row}{i}', rod(pts, [r0, r0 * 0.85, r0 * 0.7, r0 * 0.55, r0 * 0.42, r0 * 0.28, 0.003], seg=6), M['bone'])
                add(chest, f'fanTip{s}{row}{i}', rod(pts[-3:], [r0 * 0.32, r0 * 0.18, 0.002], seg=5), M['boneTip'])
        for k, (ln, sp, bz) in enumerate(((0.36, 0.6, 0.0), (0.28, 1.0, -0.06), (0.22, 1.4, -0.1))):
            b = (s * 0.08, 0.46, bz)
            m = (s * (0.08 + ln * math.sin(sp) * 0.9), 0.46 + ln * math.cos(sp) * 0.75, bz - ln * 0.1)
            t = (s * (0.08 + ln * math.sin(sp) * 0.65), 0.46 + ln * math.cos(sp) * 0.75 + ln * 0.45, bz + ln * 0.18)
            pts = curve(b, m, t, 7)
            add(neck, f'horn{s}{k}', rod(pts, [0.026, 0.022, 0.019, 0.015, 0.011, 0.007, 0.002], seg=6), M['claw'])
    tl = joint('J_tail', (0, -0.04, -0.1), chest)
    p1 = curve((0, 0, 0), (0, -0.25, -0.3), (0, -0.55, -0.5), 7)
    add(tl, 'tail1', rod(p1, [0.06, 0.055, 0.05, 0.046, 0.042, 0.039, 0.036], seg=9), M['tail'])
    tl2 = joint('J_tail2', p1[-1], tl)
    p2 = curve((0, 0, 0), (0, -0.2, -0.5), (0, 0.45, -0.75), 8)
    add(tl2, 'tail2', rod(p2, [0.036, 0.033, 0.03, 0.027, 0.024, 0.021, 0.018, 0.016], seg=8), M['tail'])
    bl = curve(p2[-1], (0, 0.95, -0.7), (0, 1.05, -0.3), 7)
    add(tl2, 'blade', rod(bl, [0.03, 0.04, 0.038, 0.03, 0.02, 0.01, 0.002], seg=8, flat=0.35), M['bone'])


def build(strong, quibungo=False, felino=False):
    """quibungo=True: o QUIBUNGO (o chefe do Sertão, npc_quibungo.py) sobre o Zumbi Forte — pedido do dono (2026-11-20):
    "o quimbungo deveria ter como base o zumbi de sangue gigante e ser editado pra ficar com as caracteristicas do
    quimbungo": o SEGUNDO PAR DE BRAÇOS, os dedos longos, as MANDÍBULAS dos lados da boca, a BOCARRA nas costas cercada
    de ESPINHOS DE OSSO em arco e a LÍNGUA comprida que sai dela (juntas tongue/tongue2/tongue3)"""
    Q = quibungo
    FI = felino  # o FELINO INFERNAL (npc_felino_infernal.py) sobre o Zumbi Fraco
    random.seed(71 if Q else 53 if FI else 31 if strong else 7)
    reset()
    tag = 'quibungo' if Q else 'felinoinf' if FI else 'forte' if strong else 'fraco'
    M = {
        'flesh': vcol_material('flesh_zumbi_' + tag, 0.42),  # a carne gosmenta (cor por vértice)
        'fang': material('fang_zumbi', '#ddd3b0' if not strong else '#c9c8a4', 0.4),
        'maw': material('maw_zumbi', '#140204', 0.8),
        'claw': material('claw_zumbi', '#2a0709', 0.4),
        'vein': material('vein_zumbi', '#3e050b', 0.5),
        'bone': material('bone_spine_quibungo', '#d4b48a', 0.45),
        'boneTip': material('claw_spine_tip_quibungo', '#4a2a1a', 0.4),
        'tongue': material('flesh_tongue_quibungo', '#8a2a4a', 0.4),
        'eye': material('glow_eye_quibungo', '#ffb020', 0.3, emission='#ff8a10', strength=3.0),
        'tail': material('tail_felinoinf', '#7a1418', 0.45),
        'fur': material('vein_fur_quibungo', '#3a0a0e', 0.7),
    }
    C = {k: Vector(hex_rgb(v)) for k, v in {
        'deep': '#4a0a0f', 'flesh': '#8a1a20', 'crest': '#d07070', 'vein': '#38040a', 'patch': '#5a0c12', 'hole': '#080102', 'gum': '#a8303c',
    }.items()}

    # ---------------- proporções (as juntas nas mesmas posições do modelo antigo)
    if strong:
        hipY, shY, shZ, shX = 0.95, 0.78, 0.22, 0.44
        upL, foreL, upR, foreR = 0.6, 0.66, 0.17, 0.13
        thighL, shinL, thighR, shinR, hipX = 0.46, 0.44, 0.16, 0.11, 0.22
        if Q:  # as artes: membros compridos e SECOS (tendões, não massa) — as juntas ficam nos mesmos lugares
            upR, foreR, thighR, shinR = 0.125, 0.095, 0.125, 0.085
    else:
        hipY, shY, shZ, shX = 1.0, 0.64, 0.14, 0.24
        upL, foreL, upR, foreR = 0.5, 0.52, 0.06, 0.045
        thighL, shinL, thighR, shinR, hipX = 0.5, 0.48, 0.07, 0.05, 0.12
    UPL, FOREL, UPR, FORER = upL, foreL, upR, foreR
    AMP = 0.005 if strong else 0.0035  # profundidade das estrias (leves: a carne é lisa e gosmenta, com estrias claras)

    def flesh_color(disp_fn, amp):
        """sulcos escuros, cristas rosadas e manchas mais escuras (o desenho tem placas de carne escura)"""
        def f(p, sc):
            ho = sc.field(p).get('hole', 0)
            if ho > 0.3:
                return C['hole']
            if sc.field(p).get('gum', 0) > 0.5:
                return C['gum']
            k = max(0.0, min(1.0, disp_fn(p) / amp + 0.35)) if disp_fn else 0.5
            base = C['flesh'].lerp(C['deep'], (1 - k) ** 2 * 0.35).lerp(C['crest'], min(1.0, max(0.0, k - 0.75) * 4) * max(0.0, n3(p, 3) + 0.3))
            m = n3(p, 6)
            if m > 0.18:  # as placas de carne mais escura
                base = base.lerp(C['patch'], min(1.0, (m - 0.18) * 5) * 0.75)
            v = abs(n3((p[0] * 1.3, p[1] * 0.6, p[2] * 1.3), 9))  # as VEIAS escuras serpenteando
            if v < 0.025:
                base = base.lerp(C['vein'], 1 - v / 0.025)
            return base
        return f

    body = joint('J_body', (0, 0, 0))
    chest = joint('J_chest', (0, hipY, 0), body)
    top = (0, shY, shZ)
    MAW_C, MAW_D = (0, 0.66, -0.29), (0, 1, -0.35)  # a bocarra das costas (centro e eixo, na espinha)

    # ================================================================ TRONCO
    S = Sculpt('torso_' + tag)
    if Q:
        # REMODELO pelas artes de Hexatombe: o tronco SECO e comprido (cintura fina, costelas e barriga encolhida), os
        # ombros altos e curvados para a frente; a corcova vira a base da coroa de espinhos e da bocarra das costas
        S.ell((0, -0.04, 0.0), (0.2, 0.15, 0.15))  # pelve estreita
        S.ell((0, 0.18, 0.0), (0.17, 0.2, 0.14))  # a cintura fina
        S.ell((0, 0.44, 0.06), (0.3, 0.24, 0.22))  # a caixa torácica
        S.ell((0, 0.7, 0.0), (0.32, 0.22, 0.25))  # a corcova dos ombros
        S.ell((0, 0.82, 0.12), (0.24, 0.14, 0.2))
        for s in (1, -1):
            S.ell((s * 0.16, 0.56, 0.24), (0.14, 0.11, 0.08))  # peitoral seco
            S.ell((s * 0.3, 0.72, 0.1), (0.16, 0.16, 0.16))  # ombro alto
            S.ell((s * 0.2, 0.62, -0.16), (0.15, 0.22, 0.12))  # dorso
            S.ell((s * 0.24, 0.32, 0.0), (0.09, 0.22, 0.13), dir=(s * 0.3, 1, 0))  # dorsal fino
            S.ell((s * 0.13, -0.06, -0.07), (0.11, 0.11, 0.1))  # glúteo
            S.ell((s * 0.3, 0.42, 0.14), (0.12, 0.11, 0.11))  # o ombro do 2º par de braços
            for k in range(4):  # as COSTELAS saltadas dos flancos
                y = 0.3 + k * 0.075
                S.ell((s * 0.2, y, 0.12 - k * 0.01), (0.1, 0.022, 0.08), dir=(s * 1, -0.35, 0.4))
        S.ell(MAW_C, (0.12, 0.36, 0.09), 'gum', dir=MAW_D)
        S.ell((MAW_C[0], MAW_C[1], MAW_C[2] + 0.03), (0.07, 0.33, 0.13), 'hole', dir=MAW_D, neg=True)
    elif strong:
        S.ell((0, -0.04, 0.0), (0.26, 0.16, 0.2))  # pelve larga
        S.ell((0, 0.2, 0.06), (0.3, 0.22, 0.24))  # barriga
        S.ell((0, 0.48, 0.14), (0.42, 0.26, 0.3))  # tórax enorme
        S.ell((0, 0.74, 0.02), (0.36, 0.26, 0.3))  # a CORCOVA (as costas sobem acima dos ombros)
        S.ell((0, 0.84, 0.14), (0.3, 0.16, 0.24))
        for s in (1, -1):
            S.ell((s * 0.2, 0.56, 0.36), (0.18, 0.13, 0.11))  # peitoral
            S.ell((s * 0.3, 0.72, 0.12), (0.2, 0.2, 0.2))  # trapézio/ombro alto
            S.ell((s * 0.24, 0.66, -0.16), (0.18, 0.24, 0.16))  # dorso
            S.ell((s * 0.32, 0.3, 0.02), (0.13, 0.26, 0.18), dir=(s * 0.3, 1, 0))  # grande dorsal
            S.ell((s * 0.16, -0.06, -0.08), (0.14, 0.13, 0.12))  # glúteo
            for k in range(3):
                S.ell((s * 0.085, 0.36 - k * 0.12, 0.27 - k * 0.02), (0.075, 0.06, 0.05))  # gomos do abdômen
    else:
        S.ell((0, -0.05, 0.0), (0.12, 0.09, 0.09))  # pelve
        S.ell((0, 0.1, 0.02), (0.1, 0.12, 0.08))  # barriga funda
        S.ell((0, 0.3, 0.05), (0.15, 0.13, 0.1))  # costelas baixas
        S.ell((0, 0.48, 0.09), (0.19, 0.13, 0.12))  # caixa torácica
        S.ell((0, 0.62, 0.12), (0.22, 0.06, 0.09))  # cintura escapular
        for s in (1, -1):
            S.ell((s * 0.09, 0.52, 0.17), (0.085, 0.06, 0.045))  # peitoral magro
            S.ell((s * 0.15, 0.6, 0.08), (0.06, 0.1, 0.05), dir=(s * 1, 0.4, 0))  # trapézio
            S.ell((s * 0.14, 0.38, 0.03), (0.05, 0.13, 0.05), dir=(s * 0.3, 1, 0))  # dorsal
            S.ell((s * 0.07, -0.08, -0.05), (0.06, 0.07, 0.05))  # glúteo
            S.ell((s * 0.11, 0.62, 0.17), (0.05, 0.02, 0.025), dir=(s * 1, 0.1, 0))  # clavícula saltada
        for k in range(7):  # a coluna saltada nas costas
            y = 0.05 + k * 0.085
            S.ell((0, y, -0.06 + y * 0.12), (0.025, 0.022, 0.03))

    def torso_disp(p):
        x, y, z = p
        ax = abs(x)
        w = n3(p, 7) * 0.7
        if not strong and z > 0.04 and 0.28 < y < 0.58 and ax > 0.03:  # costelas do magro
            return 0.006 * (ridge((y + ax * 0.25) * 70 + w * 0.3, 2) - 0.35)
        if z > 0.1 and y > 0.42 and ax < 0.32:  # peitorais: leque do esterno ao ombro
            v = ridge(math.atan2(y - 0.6, ax + 0.02) * 9 + w)
        else:  # flancos e costas: fibras diagonais subindo para os ombros
            v = ridge((y + ax * (0.9 if z > 0 else -0.6)) * (28 if strong else 40) + w)
        v -= 0.6 * math.exp(-(ax / 0.012) ** 2) if z > 0.05 else 0  # a linha do esterno
        return AMP * (v - 0.35)

    S.build(chest, M['flesh'], 4200 if strong else 3000, res=0.012 if strong else 0.009, disp=torso_disp, color=flesh_color(torso_disp, AMP))

    # ================================================================ CABEÇA (sem olhos) E MANDÍBULA
    if Q:
        # REMODELO pelas artes: o Quibungo NÃO TEM CABEÇA — a frente da corcova vira uma BOCARRA enorme, sem olhos,
        # aberta para a frente, com as presas compridas e curvas em LEQUE em volta da borda (em cima e embaixo) e as
        # fileiras de presas dos lados (as várias mandíbulas). Juntas neck/jaw/mandL/mandR nos mesmos lugares de antes
        neck = joint('J_neck', (0, top[1] - 0.04, top[2] + 0.2), chest)
        H = Sculpt('head_quibungo')
        H.ell((0, 0.04, -0.06), (0.24, 0.2, 0.22))  # a massa que sai da corcova
        H.ell((0, 0.08, 0.14), (0.2, 0.15, 0.2))  # a "testa" da bocarra (o lábio de cima, alto)
        H.ell((0, 0.1, 0.3), (0.17, 0.08, 0.12))
        for s in (1, -1):
            H.ell((s * 0.15, 0.0, 0.18), (0.07, 0.15, 0.16))  # os cantos da boca (as bochechas que seguram as presas)
        H.ell((0, -0.04, 0.26), (0.13, 0.12, 0.2), 'hole', neg=True)  # a goela escura

        def head_disp(p):
            x, y, z = p
            v = ridge(math.atan2(abs(x), y + 0.05) * 7 + n3(p, 6))
            return AMP * (v - 0.35)

        H.build(neck, M['flesh'], 1500, res=0.01, smooth=4, disp=head_disp, color=flesh_color(head_disp, AMP))
        add(neck, 'mawU', rod(curve((0.16, -0.02, 0.12), (0, 0.0, 0.42), (-0.16, -0.02, 0.12), 9), 0.04, seg=6), M['maw'])
        for row, (rr, n, L0) in enumerate(((1.0, 15, 0.34), (0.8, 11, 0.2))):  # 2 fileiras em leque no lábio de cima
            for i in range(n):
                a = (i - (n - 1) / 2) / ((n - 1) / 2) * 1.45
                base = Vector((math.sin(a) * 0.19 * rr, 0.06 - 0.03 * row, 0.12 + math.cos(a) * 0.28 * rr))
                ln = L0 * (0.8 + 0.3 * math.cos(a)) * random.uniform(0.85, 1.15)
                out = Vector((math.sin(a) * 0.6, 0, math.cos(a))).normalized()
                # saem para fora e para a frente e a ponta vira para baixo (o leque das artes)
                mid = base + out * ln * 0.55 + Vector((0, 0.03, 0))
                tip = base + out * ln * 0.75 + Vector((0, -ln * 0.6, 0))
                add(neck, f'fangU{row}_{i}', rod(curve(tuple(base), tuple(mid), tuple(tip), 5), [0.02, 0.015, 0.01, 0.005, 0.0015], seg=5), M['fang'])
        jaw = joint('J_jaw', (0, -0.06, 0.06), neck)
        J = Sculpt('jaw_quibungo')
        J.chain(curve((-0.17, 0.0, 0.0), (0, -0.12, 0.46), (0.17, 0.0, 0.0), 9), [0.06, 0.06, 0.055, 0.05, 0.05, 0.05, 0.055, 0.06, 0.06], step=0.5)
        J.ell((0, -0.08, 0.2), (0.14, 0.05, 0.18))
        J.ell((0, -0.03, 0.22), (0.11, 0.04, 0.14), 'hole', neg=True)
        J.build(jaw, M['flesh'], 800, res=0.009, smooth=3, color=flesh_color(None, AMP))
        for i in range(13):  # o leque de baixo, subindo
            a = (i - 6) / 6 * 1.4
            base = Vector((math.sin(a) * 0.16, -0.04, 0.16 + math.cos(a) * 0.24))
            ln = 0.26 * (0.8 + 0.3 * math.cos(a)) * random.uniform(0.85, 1.15)
            out = Vector((math.sin(a) * 0.6, 0, math.cos(a))).normalized()
            add(jaw, f'fangL{i}', rod(curve(tuple(base), tuple(base + out * ln * 0.5 - Vector((0, 0.02, 0))), tuple(base + out * ln * 0.7 + Vector((0, ln * 0.6, 0))), 5),
                                      [0.018, 0.014, 0.009, 0.0045, 0.0015], seg=5), M['fang'])
        for i in range(3):
            x = random.uniform(-0.1, 0.1)
            add(jaw, f'drip{i}', rod([(x, -0.1, 0.38), (x, -0.18, 0.39), (x * 1.05, -0.26 - i * 0.04, 0.39)], [0.012, 0.009, 0.005], seg=5), M['vein'])
        # as MANDÍBULAS dos lados: placas de carne com fileiras de presas abrindo para os lados (o "pente" de presas
        # das artes, logo atrás do canto da boca)
        for sd, nm in ((1, 'L'), (-1, 'R')):
            md = joint(f'J_mand{nm}', (sd * 0.2, -0.05, 0.2), neck)
            Md = Sculpt(f'mand{nm}_quibungo')
            Md.chain([(0, 0.06, -0.08), (sd * 0.03, -0.02, 0.06), (0, -0.06, 0.18)], [0.06, 0.055, 0.035], step=0.5)
            Md.build(md, M['flesh'], 450, res=0.008, smooth=2, color=flesh_color(None, AMP))
            for i in range(9):
                t = i / 8
                b = Vector((sd * 0.03, 0.08 - t * 0.16, -0.08 + t * 0.26))
                ln = 0.13 * random.uniform(0.8, 1.2) * (1 - 0.3 * abs(t - 0.5))
                add(md, f'mfang{i}', rod(curve(tuple(b), tuple(b + Vector((sd * ln * 0.6, 0.01, ln * 0.3))), tuple(b + Vector((sd * ln * 0.8, -ln * 0.5, ln * 0.55))), 4),
                                         [0.016, 0.011, 0.006, 0.0015], seg=5), M['fang'])
    elif strong:
        # o BESTIAL: a cabeça afundada entre os ombros, baixa e comprida como um focinho; o crânio partido ao meio a
        # partir do topo (o sulco fundo no meio) e a bocarra de presas que pinga
        neck = joint('J_neck', (0, top[1] - 0.04, top[2] + 0.2), chest)
        H = Sculpt('head_forte')
        H.ell((0, 0.02, 0.0), (0.22, 0.2, 0.2))  # a massa da nuca (some no trapézio)
        H.ell((0, 0.04, 0.16), (0.2, 0.15, 0.2))
        H.ell((0, 0.0, 0.32), (0.17, 0.12, 0.16))  # o focinho
        for s in (1, -1):
            H.ell((s * 0.1, 0.1, 0.22), (0.1, 0.08, 0.2), dir=(0, 0, 1))  # as duas metades do crânio
            H.ell((s * 0.13, -0.02, 0.32), (0.06, 0.06, 0.14), dir=(0, 0, 1))  # bochechas que seguram as presas
        H.ell((0, 0.17, 0.24), (0.03, 0.08, 0.3), 'hole', neg=True)  # o SULCO: o crânio partido no meio
        H.ell((0, -0.1, 0.36), (0.14, 0.05, 0.12), 'hole', neg=True)  # o céu da boca aberto

        def head_disp(p):
            x, y, z = p
            # pregas da carne correndo ao longo do focinho, e o sulco do meio mais fundo
            v = ridge(math.atan2(abs(x), y + 0.05) * 7 + n3(p, 6))
            return AMP * (v - 0.35) - 0.012 * math.exp(-(x / 0.02) ** 2) * (1 if y > 0.05 and z > 0.05 else 0)

        H.build(neck, M['flesh'], 1700, res=0.01, smooth=4, disp=head_disp, color=flesh_color(head_disp, AMP))
        add(neck, 'mawU', rod(curve((0.15, -0.08, 0.22), (0, -0.09, 0.5), (-0.15, -0.08, 0.22), 9), 0.045, seg=6), M['maw'])
        for i in range(11):  # presas de cima: muitas, longas, irregulares, curvas para baixo e para dentro
            a = (i - 5) / 5 * 1.3
            base = (math.sin(a) * 0.16, -0.06, 0.24 + math.cos(a) * 0.2)
            ln = 0.17 + 0.07 * math.cos(a * 1.1) + random.uniform(-0.03, 0.03)
            tip = (base[0] * 0.85, base[1] - ln, base[2] + 0.03)
            add(neck, f'fangU{i}', rod(curve(base, (base[0] * 1.05, base[1] - ln * 0.55, base[2] + 0.07), tip, 5), [0.026, 0.019, 0.012, 0.006, 0.002], seg=6), M['fang'])
        jaw = joint('J_jaw', (0, -0.06, 0.06), neck)
        J = Sculpt('jaw_forte')
        J.chain(curve((-0.17, 0.0, 0.0), (0, -0.12, 0.42), (0.17, 0.0, 0.0), 9), [0.07, 0.07, 0.065, 0.06, 0.06, 0.06, 0.065, 0.07, 0.07], step=0.5)
        J.ell((0, -0.08, 0.2), (0.15, 0.06, 0.18))
        J.ell((0, -0.03, 0.22), (0.12, 0.04, 0.14), 'hole', neg=True)  # a língua/garganta escura
        J.build(jaw, M['flesh'], 900, res=0.009, smooth=3, color=flesh_color(None, AMP))
        for i in range(9):
            a = (i - 4) / 4 * 1.2
            base = (math.sin(a) * 0.15, -0.03, 0.18 + math.cos(a) * 0.2)
            ln = 0.13 + random.uniform(-0.03, 0.03)
            add(jaw, f'fangL{i}', rod(curve(base, (base[0] * 1.05, base[1] + ln * 0.55, base[2] + 0.05), (base[0] * 0.9, base[1] + ln, base[2] - 0.01), 5), [0.026, 0.018, 0.011, 0.005, 0.002], seg=6), M['fang'])
        # o sangue pingando da boca
        for i in range(3):
            x = random.uniform(-0.1, 0.1)
            add(jaw, f'drip{i}', rod([(x, -0.1, 0.36), (x, -0.18, 0.37), (x * 1.05, -0.24 - i * 0.04, 0.37)], [0.012, 0.009, 0.005], seg=5), M['vein'])
    else:
        # o FRACO: crânio grande e calvo de feto, as duas ÓRBITAS VAZIAS e fundas, a bocarra vertical cheia de presas
        neck = joint('J_neck', (0, top[1] + 0.03, top[2] + 0.06), chest)
        H = Sculpt('head_fraco')
        H.chain([(0, -0.05, -0.02), (0, 0.06, 0.0), (0, 0.13, 0.02)], [0.055, 0.05, 0.06])  # pescoço fino
        H.ell((0, 0.38, -0.01), (0.17, 0.18, 0.18))  # a calota grande
        H.ell((0, 0.3, 0.07), (0.15, 0.13, 0.13))  # testa e órbitas
        H.ell((0, 0.17, 0.08), (0.12, 0.11, 0.1))  # a face comprida da boca
        for s in (1, -1):
            H.ell((s * 0.08, 0.35, 0.13), (0.065, 0.035, 0.05))  # arcada das órbitas
            H.ell((s * 0.078, 0.3, 0.19), (0.055, 0.058, 0.06), 'hole', neg=True)  # ÓRBITA vazia (cava)
            H.ell((s * 0.11, 0.17, 0.1), (0.035, 0.08, 0.05))  # as bochechas que esticam com a boca
        H.ell((0, 0.15, 0.18), (0.085, 0.085, 0.07), 'hole', neg=True)  # a BOCARRA aberta, larga
        for i in range(12):  # a gengiva em volta da boca
            a = i / 12 * TAU
            H.ell((math.sin(a) * 0.088, 0.15 + math.cos(a) * 0.085, 0.15), (0.02, 0.02, 0.02), 'gum')

        def head_disp(p):
            x, y, z = p
            v = ridge((y * 1.0 + abs(x) * 0.6) * 35 + n3(p, 6) * 1.5)
            return 0.0025 * (v - 0.35)

        H.build(neck, M['flesh'], 2400, res=0.007, smooth=4, disp=head_disp, color=flesh_color(head_disp, 0.0025))
        add(neck, 'maw', rod(curve((0, 0.22, 0.13), (0, 0.15, 0.1), (0, 0.08, 0.13), 5), 0.06, seg=8), M['maw'])
        add(neck, 'orbitL', rod([(0.078, 0.3, 0.13), (0.078, 0.3, 0.16)], 0.04, seg=8), M['maw'])
        add(neck, 'orbitR', rod([(-0.078, 0.3, 0.13), (-0.078, 0.3, 0.16)], 0.04, seg=8), M['maw'])
        for i in range(7):  # presas de cima: longas, cor de marfim, descendo na boca
            a = (i - 3) / 3 * 1.05
            base = (math.sin(a) * 0.085, 0.225 - (1 - math.cos(a)) * 0.04, 0.16 + math.cos(a) * 0.04)
            ln = 0.09 + 0.03 * math.cos(a) + random.uniform(-0.015, 0.015)
            add(neck, f'fangU{i}', rod(curve(base, (base[0] * 1.1, base[1] - ln * 0.5, base[2] + 0.03), (base[0] * 0.8, base[1] - ln, base[2] + 0.01), 5), [0.014, 0.011, 0.007, 0.004, 0.0015], seg=5), M['fang'])
        jaw = joint('J_jaw', (0, 0.08, 0.06), neck)
        J = Sculpt('jaw_fraco')
        J.chain(curve((-0.08, 0.02, 0.0), (0, -0.06, 0.13), (0.08, 0.02, 0.0), 7), [0.03, 0.032, 0.034, 0.035, 0.034, 0.032, 0.03], step=0.5)
        J.build(jaw, M['flesh'], 500, res=0.006, smooth=2, color=flesh_color(None, AMP))
        for i in range(6):  # presas de baixo subindo
            a = (i - 2.5) / 2.5 * 1.0
            base = (math.sin(a) * 0.065, -0.03, 0.06 + math.cos(a) * 0.06)
            ln = 0.08 + random.uniform(-0.015, 0.015)
            add(jaw, f'fangL{i}', rod(curve(base, (base[0] * 1.1, base[1] + ln * 0.5, base[2] + 0.03), (base[0] * 0.85, base[1] + ln, base[2] + 0.01), 5), [0.013, 0.01, 0.006, 0.003, 0.0015], seg=5), M['fang'])

    # ================================================================ BRAÇOS longos com garras
    def arm(s, name, at=None, k=1.0):
        upL, foreL, upR, foreR = UPL * k, FOREL * k, UPR * k, FORER * k
        sh = joint(f'J_sh{name}', at or (s * shX, top[1] - 0.06, top[2] - 0.03), chest)
        U = Sculpt(f'upper{name}_{tag}')
        U.ell((s * 0.02, -0.03, 0), (upR * 1.35, upR * 1.4, upR * 1.3))  # deltoide
        U.chain([(0, -upL * 0.15, 0), (0, -upL * 0.5, 0.01), (0, -upL, 0)], [upR, upR * 1.05, upR * 0.8], step=0.6)
        U.ell((0, -upL * 0.45, upR * 0.45), (upR * 0.75, upL * 0.28, upR * 0.7))  # bíceps
        U.ell((0, -upL * 0.4, -upR * 0.4), (upR * 0.8, upL * 0.3, upR * 0.7))  # tríceps
        fu = limb_fibers((0, 0.04, 0), (0, -upL, 0), 6, 0.9 * s, AMP)
        U.build(sh, M['flesh'], 900, res=0.011 if strong else 0.007, disp=fu, color=flesh_color(fu, AMP))

        el = joint(f'J_el{name}', (0, -upL, 0), sh)
        F = Sculpt(f'fore{name}_{tag}')
        F.chain([(0, 0.01, 0), (0, -foreL * 0.25, 0.01), (0, -foreL * 0.6, 0.005), (0, -foreL + 0.02, 0)], [foreR * 0.95, foreR * 1.2, foreR * 0.95, foreR * 0.7], step=0.6)
        ff = limb_fibers((0, 0.02, 0), (0, -foreL, 0), 6, -0.8 * s, AMP)
        F.build(el, M['flesh'], 750, res=0.01 if strong else 0.0065, disp=ff, color=flesh_color(ff, AMP))

        hand = joint(f'J_hand{name}', (0, -foreL, 0), el)
        hw = foreR * 1.5
        fl = (0.2 if strong else 0.17) * (1.8 if Q else 1)  # o Quibungo: os dedos LONGOS da arte
        # o Quibungo anda DE QUATRO: a palma vira para TRÁS (com o braço à frente, ela fica para baixo, apoiada no chão)
        # e as garras curvam para baixo (dono, 2026-11-21: "as mãos do quibungo estão ao contrario")
        zf = -1 if Q else 1
        Hd = Sculpt(f'hand{name}_{tag}')
        Hd.ell((0, -0.04, 0.01 * zf), (hw, 0.07, hw * 0.55))  # palma
        tips = []
        for i in range(4):
            a = (i - 1.5) * 0.36
            x0 = math.sin(a) * hw
            base = (x0, -0.09, 0.02 * zf)
            mid = (x0 * 1.35, -0.09 - fl * 0.55, 0.05 * zf)
            tip = (x0 * 1.5, -0.09 - fl, 0.1 * zf)
            Hd.chain([base, mid, tip], [hw * 0.3, hw * 0.26, hw * 0.2], step=0.5)
            tips.append(tip)
        th = [(-s * hw * 0.8, -0.04, 0.03 * zf), (-s * hw * 1.3, -0.1, 0.09 * zf), (-s * hw * 1.25, -0.14, 0.16 * zf)]
        Hd.chain(th, [hw * 0.3, hw * 0.24, hw * 0.18], step=0.5)
        Hd.build(hand, M['flesh'], 700, res=0.008 if strong else 0.0055, smooth=2, color=flesh_color(None, AMP))
        cl = (0.14 if strong else 0.1) * (1.4 if Q else 1)
        for i, tip in enumerate(tips + [th[-1]]):  # GARRAS longas e curvas
            c1 = (tip[0] * 1.05, tip[1] - cl * 0.45, tip[2] + cl * 0.4 * zf)
            c2 = (tip[0] * 1.08, tip[1] - cl * 0.7, tip[2] + cl * zf)
            add(hand, f'claw{i}', rod([tip, c1, c2], [hw * 0.2, hw * 0.13, 0.002], seg=5), M['claw'])
        if Q:  # o tufo de pelo atrás do antebraço (as artes: a "manga" peluda do cotovelo ao pulso)
            fur_tuft(el, f'fur{name}', (0, -foreL * 0.1, -foreR * 0.9), (0, -1, -0.15), s, 9, foreL * 0.42, M)

    arm(1, 'L')
    arm(-1, 'R')
    if Q:  # o SEGUNDO PAR de braços, saindo das costelas, um pouco menor
        arm(1, 'L2', (shX * 0.78, 0.42, 0.2), 0.82)
        arm(-1, 'R2', (-shX * 0.78, 0.42, 0.2), 0.82)
        quibungo_extras(chest, M, MAW_C, MAW_D)
    if FI:
        felino_extras(chest, neck, M)

    # ================================================================ PERNAS com pés de garras
    for s, name in ((1, 'L'), (-1, 'R')):
        hip = joint(f'J_hip{name}', (s * hipX, 0, 0), chest)
        Th = Sculpt(f'thigh{name}_{tag}')
        Th.chain([(0, 0.02, 0), (0, -thighL * 0.35, 0.03), (0, -thighL * 0.7, 0.02), (0, -thighL + 0.02, 0.015)], [thighR, thighR * 1.05, thighR * 0.85, thighR * 0.7])
        Th.ell((0, -thighL * 0.45, thighR * 0.5), (thighR * 0.75, thighL * 0.3, thighR * 0.6))  # quadríceps
        Th.ell((0, -thighL * 0.45, -thighR * 0.5), (thighR * 0.7, thighL * 0.28, thighR * 0.55))  # posterior
        ft = limb_fibers((0, 0.02, 0), (0, -thighL, 0.02), 7, 1.0 * s, AMP)
        Th.build(hip, M['flesh'], 900, res=0.011 if strong else 0.0075, disp=ft, color=flesh_color(ft, AMP))
        if Q:  # o pelo nas coxas e no joelho (as artes)
            fur_tuft(hip, f'furT{name}', (0, -thighL * 0.2, -thighR * 0.8), (0, -1, -0.1), s, 8, thighL * 0.4, M)

        knee = joint(f'J_knee{name}', (0, -thighL, 0.02), hip)
        Sh = Sculpt(f'shin{name}_{tag}')
        Sh.chain([(0, 0.02, 0), (0, -shinL * 0.25, -0.01), (0, -shinL * 0.6, -0.012), (0, -shinL + 0.07, -0.005)], [shinR * 1.05, shinR * 1.1, shinR * 0.85, shinR * 0.7])
        Sh.ell((0, -shinL * 0.3, -shinR * 0.6), (shinR * 0.85, shinL * 0.24, shinR * 0.75))  # panturrilha
        fw = shinR * 1.6
        Sh.ell((0, -shinL + 0.04, 0.04), (fw, 0.035, fw * 1.7))  # o pé comprido
        toes = []
        for i in range(3):
            a = (i - 1) * 0.35
            base = (math.sin(a) * fw * 0.7, -shinL + 0.03, 0.04 + fw * 1.4)
            tip = (math.sin(a) * fw * 1.1, -shinL + 0.02, 0.04 + fw * 2.3)
            Sh.chain([base, tip], [fw * 0.38, fw * 0.3], step=0.5)
            toes.append(tip)
        fs = limb_fibers((0, 0.0, 0), (0, -shinL + 0.08, 0), 6, -0.9 * s, AMP)
        Sh.build(knee, M['flesh'], 900, res=0.009 if strong else 0.0065, disp=fs, color=flesh_color(fs, AMP))
        for i, tip in enumerate(toes):
            add(knee, f'toeClaw{i}', rod([tip, (tip[0] * 1.1, -shinL + 0.015, tip[2] + fw * 0.4), (tip[0] * 1.15, -shinL + 0.002, tip[2] + fw * 0.8)], [fw * 0.25, fw * 0.16, 0.0015], seg=5), M['claw'])

    white_vcols()
    finish()
    out = sys.argv[sys.argv.index('--') + 1]
    export_glb(out)
