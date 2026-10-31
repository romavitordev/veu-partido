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


def build(strong):
    random.seed(31 if strong else 7)
    reset()
    tag = 'forte' if strong else 'fraco'
    M = {
        'flesh': vcol_material('flesh_zumbi_' + tag, 0.42),  # a carne gosmenta (cor por vértice)
        'fang': material('fang_zumbi', '#ddd3b0' if not strong else '#c9c8a4', 0.4),
        'maw': material('maw_zumbi', '#140204', 0.8),
        'claw': material('claw_zumbi', '#2a0709', 0.4),
        'vein': material('vein_zumbi', '#3e050b', 0.5),
    }
    C = {k: Vector(hex_rgb(v)) for k, v in {
        'deep': '#4a0a0f', 'flesh': '#8a1a20', 'crest': '#d07070', 'vein': '#38040a', 'patch': '#5a0c12', 'hole': '#080102', 'gum': '#a8303c',
    }.items()}

    # ---------------- proporções (as juntas nas mesmas posições do modelo antigo)
    if strong:
        hipY, shY, shZ, shX = 0.95, 0.78, 0.22, 0.44
        upL, foreL, upR, foreR = 0.6, 0.66, 0.17, 0.13
        thighL, shinL, thighR, shinR, hipX = 0.46, 0.44, 0.16, 0.11, 0.22
    else:
        hipY, shY, shZ, shX = 1.0, 0.64, 0.14, 0.24
        upL, foreL, upR, foreR = 0.5, 0.52, 0.06, 0.045
        thighL, shinL, thighR, shinR, hipX = 0.5, 0.48, 0.07, 0.05, 0.12
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

    # ================================================================ TRONCO
    S = Sculpt('torso_' + tag)
    if strong:
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
    if strong:
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
    def arm(s, name):
        sh = joint(f'J_sh{name}', (s * shX, top[1] - 0.06, top[2] - 0.03), chest)
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
        fl = 0.2 if strong else 0.17
        Hd = Sculpt(f'hand{name}_{tag}')
        Hd.ell((0, -0.04, 0.01), (hw, 0.07, hw * 0.55))  # palma
        tips = []
        for i in range(4):
            a = (i - 1.5) * 0.36
            x0 = math.sin(a) * hw
            base = (x0, -0.09, 0.02)
            mid = (x0 * 1.35, -0.09 - fl * 0.55, 0.05)
            tip = (x0 * 1.5, -0.09 - fl, 0.1)
            Hd.chain([base, mid, tip], [hw * 0.3, hw * 0.26, hw * 0.2], step=0.5)
            tips.append(tip)
        th = [(-s * hw * 0.8, -0.04, 0.03), (-s * hw * 1.3, -0.1, 0.09), (-s * hw * 1.25, -0.14, 0.16)]
        Hd.chain(th, [hw * 0.3, hw * 0.24, hw * 0.18], step=0.5)
        Hd.build(hand, M['flesh'], 700, res=0.008 if strong else 0.0055, smooth=2, color=flesh_color(None, AMP))
        cl = 0.14 if strong else 0.1
        for i, tip in enumerate(tips + [th[-1]]):  # GARRAS longas e curvas
            c1 = (tip[0] * 1.05, tip[1] - cl * 0.45, tip[2] + cl * 0.4)
            c2 = (tip[0] * 1.08, tip[1] - cl * 0.7, tip[2] + cl)
            add(hand, f'claw{i}', rod([tip, c1, c2], [hw * 0.2, hw * 0.13, 0.002], seg=5), M['claw'])

    arm(1, 'L')
    arm(-1, 'R')

    # ================================================================ PERNAS com pés de garras
    for s, name in ((1, 'L'), (-1, 'R')):
        hip = joint(f'J_hip{name}', (s * hipX, 0, 0), chest)
        Th = Sculpt(f'thigh{name}_{tag}')
        Th.chain([(0, 0.02, 0), (0, -thighL * 0.35, 0.03), (0, -thighL * 0.7, 0.02), (0, -thighL + 0.02, 0.015)], [thighR, thighR * 1.05, thighR * 0.85, thighR * 0.7])
        Th.ell((0, -thighL * 0.45, thighR * 0.5), (thighR * 0.75, thighL * 0.3, thighR * 0.6))  # quadríceps
        Th.ell((0, -thighL * 0.45, -thighR * 0.5), (thighR * 0.7, thighL * 0.28, thighR * 0.55))  # posterior
        ft = limb_fibers((0, 0.02, 0), (0, -thighL, 0.02), 7, 1.0 * s, AMP)
        Th.build(hip, M['flesh'], 900, res=0.011 if strong else 0.0075, disp=ft, color=flesh_color(ft, AMP))

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
