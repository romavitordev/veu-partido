"""
FELINO DEVORADO e FELINO INFERNAL (Sobrevivendo ao Horror: Hexatombe, ep. 5 — o bestiário da Coroa de Espinhos; wiki
"Felino Devorado" e as artes em Referencias visuais/Personagens/sertao-hexatombe-bestiario/). Uma JAGUATIRICA tomada
pelo Sangue:
  - devorado: de quatro, o pelo vermelho com as ROSETAS escuras, as pernas compridas e a barriga pingando sangue; o
    CRÂNIO empurrado para cima do pescoço virou uma coluna com TRÊS PARES DE CHIFRES em garra; no lugar da cara, uma
    BOCA GRANDE cheia de dentes e a LÍNGUA comprida e pontuda; o RABO longo terminando num ESPINHO curvo;
  - infernal (só no Aniquilação): EM PÉ, mais alto e magro, sem o pelo (carne viva com veias), os braços longos com
    garras, o LEQUE DE OSSOS abrindo das costas como asas e o rabo de gancho ainda maior.

TÉCNICA: a escultura de metaballs (npc_sculpt_lib); chifres, dentes, garras e espinhos em tubos e cones. Juntas: body,
torso, head (o crânio em coluna + a boca de cima), jaw, tongue, legFL/FR/BL/BR com kneeFL/FR/BL/BR (no infernal as da
frente são os braços), tail e tail2 (a ponta do rabo). Animadas em código (src/combat/sertaoBeasts.js).
"""
import sys
import math
import random

from mathutils import Vector

from lib import reset, material, export_glb, hex_rgb
from npc_lib import rod, curve, spike, joint, add, finish
from npc_sculpt_lib import Sculpt, vcol_material, ridge, n3, white_vcols


def build(kind):
    inf = kind == 'infernal'
    random.seed(53 if inf else 47)
    reset()
    M = {
        'body': vcol_material('fur_felino', 0.75),
        'tooth': material('tooth_felino', '#e0cca0', 0.35),
        'horn': material('bone_horn_felino', '#d0b088', 0.45),
        'hornTip': material('claw_horn_tip_felino', '#3a2418', 0.4),
        'maw': material('maw_felino', '#1a0404', 0.8),
        'claw': material('claw_felino', '#1a1210', 0.35),
        'tongue': material('flesh_tongue_felino', '#a0303c', 0.4),
        'eye': material('glow_eye_felino', '#ff3a1a', 0.3, emission='#ff3a1a', strength=2.5),
        'fanFlesh': material('flesh_fan_felino', '#7a1a1e', 0.6),
        'blood': material('goo_blood_felino', '#4a0606', 0.3),
    }
    C = {k: Vector(hex_rgb(v)) for k, v in {
        'fur': '#9a2a1e', 'tip': '#c04a30', 'dark': '#3a0a08', 'spot': '#2a0606',
        'flesh': '#8a1c20', 'fleshHi': '#b03a34', 'vein': '#4a1a40', 'bone': '#c8a880', 'maw': '#3a0606',
    }.items()}
    FUR = 0.0 if inf else 0.009

    def fur(p):
        if inf:  # carne viva: estrias de músculo
            x, y, z = p
            return 0.005 * (ridge(abs(x) * 90 + z * 40 + n3(p, 6) * 4 + y * 12, 3) - 0.4)
        x, y, z = p
        w = n3(p, 10) * 1.3
        v = ridge((x * 0.8 + y * 0.4) * 140 + z * 10 + w, 3)
        return FUR * (0.7 * v - 0.3)

    def color_fn(disp):
        def f(p, sc):
            fld = sc.field(p)
            if fld.get('bone', 0) > 0.3:
                return C['bone']
            if fld.get('vein', 0) > 0.25:
                return C['vein']
            if fld.get('maw', 0) > 0.3:
                return C['maw']
            if inf:
                k = max(0.0, min(1.0, fur(p) / 0.005 + 0.4))
                return C['dark'].lerp(C['flesh'], 0.7 + 0.3 * k).lerp(C['fleshHi'], max(0.0, k - 0.7) * 2)
            # as ROSETAS da jaguatirica: manchas escuras em anel
            r = n3(Vector(p) * 1.0, 7)
            if 0.28 < r < 0.5:
                return C['spot'].lerp(C['dark'], 0.3)
            k = max(0.0, min(1.0, (disp(p) / FUR if FUR else 0) + 0.45))
            return C['dark'].lerp(C['fur'], 0.72 + 0.28 * k).lerp(C['tip'], max(0.0, k - 0.75) * 1.5)
        return f

    body = joint('J_body', (0, 0, 0))
    if not inf:
        legH = 0.88
        torso = joint('J_torso', (0, legH, 0), body)
        S = Sculpt('tronco_felino')
        S.ell((0, 0.12, 0.3), (0.24, 0.29, 0.28))  # o peito alto (os ombros acima da anca)
        S.ell((0, -0.03, 0.0), (0.2, 0.22, 0.32))  # a barriga caída
        S.ell((0, 0.02, -0.34), (0.2, 0.22, 0.22))  # a anca
        S.chain([(0, 0.25, 0.42), (0, 0.42, 0.5), (0, 0.55, 0.55)], [0.17, 0.15, 0.14], step=0.5)  # pescoço erguido
        for s in (1, -1):
            S.ell((s * 0.13, 0.12, 0.34), (0.08, 0.17, 0.11))  # as escápulas
            S.ell((s * 0.13, 0.0, -0.36), (0.09, 0.17, 0.13))  # as coxas de trás
        for i in range(3):  # veias pelo flanco
            for s in (1, -1):
                z0 = 0.25 - i * 0.22
                S.chain([(s * 0.17, 0.12, z0), (s * 0.19, 0.0, z0 - 0.08), (s * 0.15, -0.12, z0 - 0.14)], 0.012, 'vein', step=0.6)
        S.build(torso, M['body'], 3600, res=0.01, smooth=3, disp=fur, color=color_fn(fur))
        for i in range(5):  # o sangue pingando da barriga
            x = random.uniform(-0.1, 0.1)
            z = random.uniform(-0.15, 0.25)
            ln = random.uniform(0.1, 0.25)
            add(torso, f'drip{i}', rod([(x, -0.15, z), (x, -0.15 - ln * 0.6, z), (x, -0.15 - ln, z)], [0.018, 0.012, 0.003], seg=5), M['blood'])

        # ---------------- o CRÂNIO em coluna com os chifres, e a BOCA no lugar da cara
        head = joint('J_head', (0, 0.58, 0.56), torso)
        H = Sculpt('cabeca_felino')
        H.chain([(0, -0.02, 0.0), (0, 0.18, -0.02), (0, 0.36, -0.06)], [0.16, 0.13, 0.11], step=0.5)  # a coluna do crânio
        H.ell((0, 0.43, -0.06), (0.21, 0.075, 0.12))  # o topo largo de onde saem os chifres
        H.ell((0, -0.02, 0.1), (0.15, 0.1, 0.16))  # a boca de cima
        H.ell((0, -0.07, 0.14), (0.1, 0.05, 0.12), 'maw', neg=True)  # o céu da boca escancarado
        for s in (1, -1):
            H.ell((s * 0.05, 0.28, 0.0), (0.03, 0.03, 0.03), 'maw', neg=True)  # as órbitas no alto
        H.build(head, M['body'], 1500, res=0.007, smooth=3, disp=fur, color=color_fn(fur))
        for s in (1, -1):
            add(head, f'eye{s}', rod([(s * 0.05, 0.28, -0.005), (s * 0.05, 0.28, 0.012)], 0.014, seg=6), M['eye'])
            # TRÊS PARES DE CHIFRES em garra: saem para os lados e para cima e curvam para dentro na ponta
            for i, (y, ln) in enumerate(((0.44, 0.42), (0.27, 0.3), (0.1, 0.2))):
                b = (s * 0.12, y, -0.06)
                # sai para o lado e para cima e a ponta dobra para a FRENTE e para dentro, como uma garra
                pts = curve(b, (s * (0.14 + ln * 1.0), y + ln * 0.75, -0.12), (s * (0.1 + ln * 0.55), y + ln * 0.7, 0.18), 7)
                add(head, f'horn{s}{i}', rod(pts, [0.05 - i * 0.01, 0.042 - i * 0.008, 0.034 - i * 0.007, 0.026 - i * 0.006, 0.018, 0.01, 0.002], seg=7), M['horn'])
                add(head, f'hornTip{s}{i}', rod(pts[-3:], [0.012, 0.007, 0.002], seg=6), M['hornTip'])
        for i in range(12):  # os dentes de cima, compridos
            t = i / 11
            a = (t - 0.5) * 2.2
            x, z = math.sin(a) * 0.1, 0.06 + math.cos(a) * 0.14
            ln = (0.08 + 0.05 * (1 - abs(t - 0.5) * 2)) * random.uniform(0.85, 1.15)
            add(head, f'toothU{i}', rod(curve((x, -0.06, z), (x * 1.05, -0.06 - ln * 0.6, z + 0.015), (x * 0.95, -0.06 - ln, z + 0.025), 4), [0.012, 0.009, 0.005, 0.001], seg=5), M['tooth'])
        jaw = joint('J_jaw', (0, -0.1, 0.02), head)
        Jw = Sculpt('mandibula_felino')
        Jw.chain([(0, 0, -0.02), (0, -0.03, 0.12), (0, -0.02, 0.22)], [0.1, 0.085, 0.06], step=0.5)
        Jw.ell((0, 0.03, 0.12), (0.075, 0.03, 0.09), 'maw', neg=True)
        Jw.build(jaw, M['body'], 700, res=0.006, smooth=2, disp=fur, color=color_fn(fur))
        for i in range(10):
            t = i / 9
            a = (t - 0.5) * 2.0
            x, z = math.sin(a) * 0.075, 0.05 + math.cos(a) * 0.15
            ln = 0.065 * random.uniform(0.85, 1.2)
            add(jaw, f'toothL{i}', rod(curve((x, 0.02, z), (x * 1.05, 0.02 + ln * 0.6, z + 0.01), (x * 0.95, 0.02 + ln, z + 0.02), 4), [0.011, 0.008, 0.004, 0.001], seg=5), M['tooth'])
        tongue = joint('J_tongue', (0, 0.0, 0.06), jaw)
        add(tongue, 'tongue', rod(curve((0, 0, 0), (0.0, 0.0, 0.35), (0.04, -0.32, 0.42), 9), [0.03, 0.032, 0.03, 0.027, 0.023, 0.018, 0.012, 0.006, 0.001], seg=8, flat=0.5), M['tongue'])
        add(jaw, 'drool', rod([(0.02, -0.06, 0.18), (0.02, -0.14, 0.19), (0.02, -0.24, 0.17)], [0.014, 0.009, 0.002], seg=5), M['blood'])

        legs = (('FL', 0.13, 0.32, False), ('FR', -0.13, 0.32, False), ('BL', 0.13, -0.36, True), ('BR', -0.13, -0.36, True))
        upper, lower = legH * 0.55, legH * 0.5
        for name, x, z, back in legs:
            leg = joint(f'J_leg{name}', (x, 0.0, z), torso)
            L = Sculpt(f'coxa{name}_felino')
            if back:  # pata de trás de gato: coxa para a frente, o jarrete para trás
                L.chain([(0, 0.08, 0), (0, -upper * 0.5, 0.08), (0, -upper, -0.02)], [0.13, 0.09, 0.06], step=0.5)
            else:
                L.chain([(0, 0.08, 0), (0, -upper * 0.5, -0.03), (0, -upper, 0.0)], [0.11, 0.08, 0.055], step=0.5)
            L.build(leg, M['body'], 700, res=0.007, smooth=2, disp=fur, color=color_fn(fur))
            knee = joint(f'J_knee{name}', (0, -upper, -0.02 if back else 0.0), leg)
            K = Sculpt(f'canela{name}_felino')
            K.chain([(0, 0, 0), (0, -lower * 0.6, -0.04 if back else 0.02), (0, -lower + 0.04, 0.02)], [0.055, 0.045, 0.042], step=0.5)
            K.ell((0, -lower + 0.03, 0.05), (0.065, 0.04, 0.08))  # a pata
            K.build(knee, M['body'], 600, res=0.006, smooth=2, disp=fur, color=color_fn(fur))
            for i in range(4):
                a = (i - 1.5) * 0.35
                b = (math.sin(a) * 0.045, -lower + 0.02, 0.1)
                add(knee, f'claw{i}', rod(curve(b, (b[0] * 1.1, -lower + 0.03, 0.15), (b[0] * 1.1, -lower - 0.01, 0.18), 4), [0.012, 0.009, 0.005, 0.001], seg=5), M['claw'])
        tail = joint('J_tail', (0, 0.1, -0.52), torso)
        tail_root, tail_len = (0, 0, 0), 1.5
    else:
        # ================================================================ INFERNAL: em pé
        torso = joint('J_torso', (0, 1.05, 0), body)
        S = Sculpt('tronco_felino_inf')
        S.ell((0, 0.5, 0.04), (0.24, 0.2, 0.17))  # o peito
        S.ell((0, 0.25, 0.02), (0.15, 0.2, 0.13))  # a cintura fina, as costelas
        S.ell((0, 0.0, 0.0), (0.18, 0.15, 0.14))  # a pelve
        S.chain([(0, 0.62, 0.06), (0, 0.78, 0.12)], [0.12, 0.1], step=0.5)
        for r in range(5):  # as costelas saltadas
            y = 0.44 - r * 0.07
            for s in (1, -1):
                S.chain([(s * 0.04, y, 0.15), (s * 0.15, y - 0.02, 0.12), (s * 0.2, y - 0.05, 0.0)], 0.018, step=0.5)
        for s in (1, -1):
            S.ell((s * 0.24, 0.6, 0.0), (0.1, 0.09, 0.1))  # ombros
            S.ell((s * 0.12, -0.04, 0.0), (0.11, 0.13, 0.12))  # coxas
            for i in range(3):
                S.chain([(s * 0.1, 0.55 - i * 0.15, 0.13), (s * 0.18, 0.45 - i * 0.15, 0.08), (s * 0.2, 0.3 - i * 0.15, -0.02)], 0.01, 'vein', step=0.6)
        S.build(torso, M['body'], 3600, res=0.009, smooth=3, disp=fur, color=color_fn(fur))
        # o LEQUE DE OSSOS das costas, abrindo como asas
        for s in (1, -1):
            for i in range(8):
                a = 0.15 + i * 0.22  # do alto para o lado e para baixo
                ln = 0.85 - abs(i - 3) * 0.07
                b = (s * 0.08, 0.58 - i * 0.05, -0.12)
                tip = (s * (0.12 + math.sin(a) * ln), 0.5 + math.cos(a) * ln * 0.85, -0.32)
                mid = ((b[0] + tip[0]) / 2 + s * 0.05, (b[1] + tip[1]) / 2 + 0.07, -0.24)
                add(torso, f'fan{s}{i}', rod([b, mid, tip], [0.045, 0.03, 0.004], seg=6), M['horn'])
                add(torso, f'fanFlesh{s}{i}', rod([b, ((b[0] + mid[0]) / 2, (b[1] + mid[1]) / 2 + 0.02, (b[2] + mid[2]) / 2), mid], [0.06, 0.05, 0.034], seg=6), M['fanFlesh'])
                add(torso, f'fanHook{s}{i}', rod(curve(tip, (tip[0] + s * 0.02, tip[1] + 0.05, tip[2] + 0.03), (tip[0] - s * 0.02, tip[1] + 0.06, tip[2] + 0.08), 4), [0.012, 0.009, 0.005, 0.001], seg=5), M['hornTip'])
        head = joint('J_head', (0, 0.84, 0.14), torso)
        H = Sculpt('cabeca_felino_inf')
        H.chain([(0, 0.0, 0.0), (0, 0.16, -0.02), (0, 0.3, -0.05)], [0.11, 0.09, 0.075], step=0.5)
        H.ell((0, 0.35, -0.06), (0.13, 0.05, 0.08))
        H.ell((0, -0.02, 0.09), (0.11, 0.08, 0.12))
        H.ell((0, -0.06, 0.12), (0.08, 0.045, 0.1), 'maw', neg=True)
        H.build(head, M['body'], 1300, res=0.006, smooth=3, disp=fur, color=color_fn(fur))
        for s in (1, -1):
            add(head, f'eye{s}', rod([(s * 0.045, 0.22, 0.02), (s * 0.045, 0.22, 0.04)], 0.013, seg=6), M['eye'])
            for i, (y, ln) in enumerate(((0.35, 0.3), (0.2, 0.22), (0.06, 0.15))):
                b = (s * 0.08, y, -0.05)
                pts = curve(b, (s * (0.09 + ln * 0.9), y + ln * 0.4, -0.07), (s * (0.07 + ln * 0.7), y + ln * 0.95, 0.03), 7)
                add(head, f'horn{s}{i}', rod(pts, [0.035 - i * 0.007, 0.03 - i * 0.006, 0.025 - i * 0.005, 0.02 - i * 0.004, 0.014, 0.008, 0.002], seg=7), M['horn'])
        for i in range(11):
            t = i / 10
            a = (t - 0.5) * 2.2
            x, z = math.sin(a) * 0.085, 0.05 + math.cos(a) * 0.12
            ln = 0.08 * random.uniform(0.85, 1.2)
            add(head, f'toothU{i}', rod(curve((x, -0.05, z), (x * 1.05, -0.05 - ln * 0.6, z + 0.015), (x * 0.95, -0.05 - ln, z + 0.025), 4), [0.011, 0.008, 0.004, 0.001], seg=5), M['tooth'])
        jaw = joint('J_jaw', (0, -0.09, 0.02), head)
        Jw = Sculpt('mandibula_felino_inf')
        Jw.chain([(0, 0, -0.02), (0, -0.03, 0.1), (0, -0.02, 0.19)], [0.085, 0.07, 0.05], step=0.5)
        Jw.build(jaw, M['body'], 600, res=0.005, smooth=2, disp=fur, color=color_fn(fur))
        for i in range(9):
            t = i / 8
            a = (t - 0.5) * 2.0
            x, z = math.sin(a) * 0.065, 0.04 + math.cos(a) * 0.13
            add(jaw, f'toothL{i}', rod(curve((x, 0.02, z), (x, 0.06, z + 0.01), (x * 0.95, 0.08, z + 0.02), 4), [0.01, 0.007, 0.004, 0.001], seg=5), M['tooth'])
        tongue = joint('J_tongue', (0, 0.0, 0.05), jaw)
        add(tongue, 'tongue', rod(curve((0, 0, 0), (0.0, 0.0, 0.3), (0.03, -0.3, 0.36), 9), [0.026, 0.028, 0.026, 0.023, 0.02, 0.016, 0.011, 0.005, 0.001], seg=8, flat=0.5), M['tongue'])
        # BRAÇOS longos (as patas da frente) e PERNAS
        for name, s in (('FL', 1), ('FR', -1)):
            arm = joint(f'J_leg{name}', (s * 0.27, 0.6, 0.0), torso)
            A = Sculpt(f'braco{name}_felino_inf')
            A.chain([(0, 0, 0), (s * 0.06, -0.22, 0.02), (s * 0.08, -0.45, 0.04)], [0.07, 0.055, 0.045], step=0.5)
            A.build(arm, M['body'], 600, res=0.006, smooth=2, disp=fur, color=color_fn(fur))
            el = joint(f'J_knee{name}', (s * 0.08, -0.45, 0.04), arm)
            E = Sculpt(f'antebraco{name}_felino_inf')
            E.chain([(0, 0, 0), (s * 0.02, -0.22, 0.06), (s * 0.02, -0.42, 0.08)], [0.045, 0.038, 0.035], step=0.5)
            E.ell((s * 0.02, -0.46, 0.1), (0.05, 0.05, 0.06))
            E.build(el, M['body'], 500, res=0.006, smooth=2, disp=fur, color=color_fn(fur))
            for i in range(4):
                a = (i - 1.5) * 0.4
                b = (s * 0.02 + math.sin(a) * 0.04, -0.48, 0.14)
                add(el, f'claw{i}', rod(curve(b, (b[0] * 1.1, -0.5, 0.24), (b[0] * 1.1, -0.6, 0.27), 4), [0.014, 0.011, 0.006, 0.001], seg=5), M['claw'])
        for name, s in (('BL', 1), ('BR', -1)):
            leg = joint(f'J_leg{name}', (s * 0.13, -0.06, 0.0), torso)
            L = Sculpt(f'coxa{name}_felino_inf')
            L.chain([(0, 0.05, 0), (s * 0.06, -0.22, 0.14), (s * 0.08, -0.4, 0.16)], [0.11, 0.08, 0.055], step=0.5)
            L.build(leg, M['body'], 600, res=0.007, smooth=2, disp=fur, color=color_fn(fur))
            knee = joint(f'J_knee{name}', (s * 0.08, -0.4, 0.16), leg)
            K = Sculpt(f'canela{name}_felino_inf')
            K.chain([(0, 0, 0), (0, -0.24, -0.12), (0, -0.47, -0.04)], [0.05, 0.04, 0.036], step=0.5)
            K.ell((0, -0.49, 0.02), (0.06, 0.035, 0.09))
            K.build(knee, M['body'], 500, res=0.006, smooth=2, disp=fur, color=color_fn(fur))
            for i in range(4):
                a = (i - 1.5) * 0.35
                b = (math.sin(a) * 0.05, -0.49, 0.09)
                add(knee, f'claw{i}', rod(curve(b, (b[0] * 1.1, -0.48, 0.15), (b[0] * 1.1, -0.52, 0.18), 4), [0.012, 0.009, 0.005, 0.001], seg=5), M['claw'])
        tail = joint('J_tail', (0, -0.05, -0.14), torso)
        tail_root, tail_len = (0, 0, 0), 1.3

    # ================================================================ o RABO longo com o ESPINHO curvo na ponta
    L = tail_len
    pts = curve(tail_root, (0, -0.25 * L, -0.55 * L), (0, 0.05 * L, -0.85 * L), 9)
    T1 = Sculpt('rabo_felino_' + kind)
    T1.chain(pts, [0.055, 0.05, 0.045, 0.042, 0.04, 0.037, 0.034, 0.032, 0.03], step=0.5)
    T1.build(tail, M['body'], 700, res=0.006, smooth=2, disp=fur, color=color_fn(fur))
    t2 = joint('J_tail2', pts[-1], tail)
    q = curve((0, 0, 0), (0, 0.25 * L, -0.12 * L), (0, 0.42 * L, 0.05 * L), 8)
    T2 = Sculpt('rabo2_felino_' + kind)
    T2.chain(q[:5], [0.03, 0.028, 0.025, 0.022, 0.02], step=0.5)
    T2.build(t2, M['body'], 400, res=0.005, smooth=2, disp=fur, color=color_fn(fur))
    # a lâmina curva da ponta (osso), com os ganchos por dentro
    add(t2, 'tailBlade', rod(q[4:], [0.03, 0.024, 0.014, 0.002], seg=7, flat=0.45), M['horn'])
    for i in range(3):
        b = q[4 + i]
        add(t2, f'tailHook{i}', spike(b, (b[0], b[1] - 0.04, b[2] + 0.06), 0.008, seg=4), M['hornTip'])

    white_vcols()
    finish()
    out = sys.argv[sys.argv.index('--') + 1]
    export_glb(out)
