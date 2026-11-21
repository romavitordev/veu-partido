"""
O KERBEROS (Hexatombe ep. 10, "Renascimento"; wiki "Kerberos" e as artes em Referencias visuais/kerberos/). No fim de
Hexatombe a Coroa de Espinhos rompe a Membrana, o lugar vira um INFERNO, o Quibungo derrete numa gosma e o Kerberos
nasce do corpo dele. Cânone (wiki): criatura de Sangue, um enorme ser QUADRÚPEDE parecido com um cão, mais de 3 m de
altura e 7 m de comprimento; pele vermelha e asquerosa como músculo exposto, ESPINHOS e VEIAS pelo corpo todo; SEIS
PATAS caninas com garras e uma CAUDA enorme; TRÊS CABEÇAS diferentes:
  - de um lado, a de VERME DENTADO: cilíndrica, a boca redonda com os dentes rodeando por dentro e espinhos saindo
    perpendiculares da cabeça;
  - no meio, a mais CANINA: muitos dentes e SETE DENTES ENORMES na frente da mandíbula de cima;
  - do outro lado, a INSETOIDE: QUATRO QUELÍCERAS e uma mandíbula interna de dentes ainda mais afiados.
Dono, 2026-11-20: no Aniquilação, se o Quibungo demora a morrer, ele derrete e surge o Kerberos (pve/kerberosInferno.js);
2026-11-21: e a transformação do Quibungo jogável vira o Kerberos (char_kerberos.py, a forma quibungo_kerberos).

TÉCNICA: a escultura de metaballs (npc_sculpt_lib), como o Felino Devorado. Coordenadas do jogo (y para cima, +z para a
frente). Juntas: body, torso, neckL/neckC/neckR (as três cabeças, cada uma com jawL/jawC/jawR), legFL/FR/ML/MR/BL/BR com
kneeFL... (as seis patas), tail e tail2. Animado em código (src/combat/sertaoBeasts.js, classe Kerberos).
"""
import math
import random

from mathutils import Vector

from lib import reset, material, hex_rgb
from npc_lib import rod, curve, spike, joint, add, finish
from npc_sculpt_lib import Sculpt, vcol_material, ridge, n3, white_vcols, limb_fibers

H = 1.35  # a altura do tronco (o ombro fica ~1,7: o jogo escala ~1,6 → ~2,7 m)


def build():
    random.seed(97)
    reset()
    M = {
        'flesh': vcol_material('flesh_kerberos', 0.45),
        'bone': material('bone_spine_kerberos', '#d8c4a0', 0.4),
        'boneTip': material('claw_spine_tip_kerberos', '#5a3a26', 0.4),
        'fang': material('fang_kerberos', '#e4d8b8', 0.35),
        'maw': material('maw_kerberos', '#1a0306', 0.8),
        'gum': material('gum_kerberos', '#7a2a5a', 0.5),  # o roxo de dentro das bocas (a arte do Livro de Regras)
        'claw': material('claw_kerberos', '#1e0a08', 0.35),
        'vein': material('vein_kerberos', '#3a0408', 0.5),
    }
    C = {k: Vector(hex_rgb(v)) for k, v in {
        'deep': '#3e060c', 'flesh': '#8e1a1e', 'crest': '#c8504a', 'vein': '#2a0206', 'patch': '#5a0a10', 'hole': '#120204',
        'gum': '#7a2a5a',
    }.items()}
    AMP = 0.006

    def fibers(p):
        """as fibras do músculo exposto: correm ao longo do corpo, com veias por cima"""
        x, y, z = p
        w = n3(p, 6) * 1.2
        return AMP * (ridge((y * 0.7 + abs(x) * 0.5) * 34 + z * 6 + w, 3) - 0.35)

    def color_fn(disp, amp=AMP):
        def f(p, sc):
            fld = sc.field(p)
            if fld.get('hole', 0) > 0.3:
                return C['hole']
            if fld.get('gum', 0) > 0.4:
                return C['gum']
            k = max(0.0, min(1.0, (disp(p) / amp if disp else 0) + 0.35))
            base = C['flesh'].lerp(C['deep'], (1 - k) ** 2 * 0.4).lerp(C['crest'], max(0.0, k - 0.75) * 2.4 * max(0.0, n3(p, 3) + 0.3))
            m = n3(p, 5)
            if m > 0.2:
                base = base.lerp(C['patch'], min(1.0, (m - 0.2) * 4) * 0.7)
            v = abs(n3((p[0] * 1.2, p[1] * 0.8, p[2] * 0.5), 8))  # as VEIAS serpenteando (o desenho tem muitas)
            if v < 0.03:
                base = base.lerp(C['vein'], 1 - v / 0.03)
            return base
        return f

    body = joint('J_body', (0, 0, 0))
    torso = joint('J_torso', (0, H, 0), body)

    # ================================================================ O TRONCO (peito alto e largo, ancas mais baixas)
    S = Sculpt('tronco_kerberos')
    S.ell((0, 0.12, 0.7), (0.56, 0.6, 0.56))  # o peito enorme
    S.ell((0, 0.38, 0.62), (0.44, 0.34, 0.44))  # a corcova dos ombros
    S.ell((0, -0.02, 0.05), (0.44, 0.44, 0.62))  # o meio (as patas do meio)
    S.ell((0, -0.06, -0.7), (0.42, 0.42, 0.46))  # as ancas
    S.ell((0, -0.24, 0.2), (0.3, 0.2, 0.7))  # a barriga
    for s in (1, -1):
        S.ell((s * 0.36, 0.0, 0.85), (0.22, 0.4, 0.26))  # as escápulas da frente
        S.ell((s * 0.38, -0.08, 0.05), (0.2, 0.34, 0.24))  # as do meio
        S.ell((s * 0.34, -0.1, -0.72), (0.22, 0.36, 0.3))  # as coxas de trás
        for i in range(5):  # as costelas saltadas nos flancos
            z = 0.45 - i * 0.2
            S.chain([(s * 0.3, 0.3, z), (s * 0.46, 0.05, z - 0.04), (s * 0.4, -0.2, z - 0.08)], 0.04, step=0.5)
    # as bases dos três pescoços (saem do peito, para a frente)
    for x, y in ((0.0, 0.5), (0.4, 0.3), (-0.4, 0.3)):
        S.chain([(x * 0.6, y - 0.1, 0.9), (x, y, 1.15)], [0.3, 0.26], step=0.5)
    S.build(torso, M['flesh'], 5200, res=0.016, smooth=3, disp=fibers, color=color_fn(fibers))

    # os ESPINHOS pelo corpo (a arte: fileiras nas costas, nos ombros e descendo pelos flancos, curvos para trás)
    for s in (1, -1):
        for i in range(9):
            t = i / 8
            z = 0.75 - t * 1.55
            yb = 0.5 - 0.18 * t - 0.1 * math.sin(t * math.pi) * 0
            b = Vector((s * 0.12, yb, z))
            ln = (0.55 - 0.25 * t) * random.uniform(0.85, 1.1)
            d = Vector((s * 0.35, 1.0, -0.55)).normalized()
            pts = curve(tuple(b), tuple(b + d * ln * 0.55), tuple(b + d * ln + Vector((0, -0.05, -ln * 0.25))), 7)
            r0 = 0.05 - 0.015 * t
            add(torso, f'spineB{s}{i}', rod(pts, [r0, r0 * 0.85, r0 * 0.7, r0 * 0.52, r0 * 0.36, r0 * 0.2, 0.003], seg=7), M['bone'])
        for i in range(7):  # a 2ª fileira, nos flancos, mais curtos e para o lado
            t = i / 6
            z = 0.6 - t * 1.3
            b = Vector((s * 0.38, 0.22 - 0.1 * t, z))
            ln = 0.3 * random.uniform(0.8, 1.15)
            d = Vector((s * 1.0, 0.6, -0.5)).normalized()
            add(torso, f'spineF{s}{i}', rod(curve(tuple(b), tuple(b + d * ln * 0.5), tuple(b + d * ln + Vector((0, 0, -ln * 0.2))), 5), [0.032, 0.024, 0.016, 0.008, 0.002], seg=6), M['bone'])
    # veias grossas por cima da carne (a arte tem cordões escuros)
    for i in range(6):
        s = 1 if i % 2 else -1
        z0 = 0.8 - i * 0.3
        add(torso, f'vein{i}', rod(curve((s * 0.2, 0.45, z0), (s * 0.5, 0.1, z0 - 0.1), (s * 0.42, -0.25, z0 - 0.25), 7), 0.016, seg=5), M['vein'])

    # ================================================================ AS TRÊS CABEÇAS
    def neck(name, at, to, r0, r1):
        nk = joint(f'J_neck{name}', at, torso)
        N = Sculpt(f'pescoco{name}_kerberos')
        tv = Vector(to)
        N.chain([(0, 0, 0), tuple(tv * 0.5 + Vector((0, 0.06, 0))), tuple(tv)], [r0, (r0 + r1) / 2, r1], step=0.5)
        f = limb_fibers((0, 0, 0), to, 7, 0.8, AMP)
        N.build(nk, M['flesh'], 900, res=0.012, smooth=2, disp=f, color=color_fn(f))
        return nk

    # --- a do MEIO: a CANINA (o focinho comprido, a boca escancarada, SETE dentes enormes na frente)
    nC = neck('C', (0, 0.5, 1.15), (0, 0.32, 0.4), 0.27, 0.22)
    hC = Vector((0, 0.32, 0.4))
    Hc = Sculpt('cabecaC_kerberos')
    Hc.ell(tuple(hC + Vector((0, 0.06, 0.1))), (0.25, 0.22, 0.26))  # o crânio
    Hc.ell(tuple(hC + Vector((0, 0.0, 0.42))), (0.18, 0.13, 0.3))  # o focinho
    Hc.ell(tuple(hC + Vector((0, -0.08, 0.4))), (0.13, 0.06, 0.26), 'hole', neg=True)  # o céu da boca
    for s in (1, -1):
        Hc.ell(tuple(hC + Vector((s * 0.12, 0.16, 0.0))), (0.06, 0.07, 0.08))  # as cristas atrás
    Hc.build(nC, M['flesh'], 1500, res=0.01, smooth=3, disp=fibers, color=color_fn(fibers))
    for i in range(7):  # os SETE DENTES ENORMES da frente (cânone)
        a = (i - 3) / 3 * 0.9
        b = hC + Vector((math.sin(a) * 0.14, -0.06, 0.58 + math.cos(a) * 0.08 - 0.08))
        ln = 0.24 * (1 - 0.25 * abs(i - 3) / 3) * random.uniform(0.92, 1.08)
        add(nC, f'fangBig{i}', rod(curve(tuple(b), tuple(b + Vector((0, -ln * 0.6, 0.04))), tuple(b + Vector((0, -ln, -0.03))), 5), [0.03, 0.024, 0.016, 0.008, 0.002], seg=6), M['fang'])
    for s in (1, -1):  # os dentes de trás, menores
        for i in range(6):
            b = hC + Vector((s * 0.15, -0.06, 0.5 - i * 0.07))
            ln = 0.09 * random.uniform(0.8, 1.2)
            add(nC, f'fangU{s}{i}', spike(tuple(b), tuple(b + Vector((s * -0.01, -ln, 0.01))), 0.014, seg=5), M['fang'])
    jC = joint('J_jawC', tuple(hC + Vector((0, -0.12, 0.08))), nC)
    Jc = Sculpt('mandibulaC_kerberos')
    Jc.chain([(0, 0, 0), (0, -0.05, 0.28), (0, -0.04, 0.46)], [0.15, 0.11, 0.07], step=0.5)
    Jc.ell((0, 0.06, 0.26), (0.08, 0.05, 0.2), 'hole', neg=True)
    Jc.ell((0, 0.02, 0.3), (0.1, 0.04, 0.2), 'gum')
    Jc.build(jC, M['flesh'], 700, res=0.009, smooth=2, color=color_fn(None))
    for s in (1, -1):
        for i in range(7):
            b = Vector((s * 0.1, 0.02, 0.48 - i * 0.065))
            ln = 0.11 * random.uniform(0.8, 1.2)
            add(jC, f'fangL{s}{i}', spike(tuple(b), tuple(b + Vector((0, ln, 0.01))), 0.015, seg=5), M['fang'])

    # --- a da ESQUERDA: o VERME DENTADO (cilíndrica, a boca redonda cheia de dentes, espinhos perpendiculares)
    nL = neck('L', (0.42, 0.3, 1.12), (0.2, 0.18, 0.36), 0.24, 0.2)
    hL = Vector((0.2, 0.18, 0.36))
    ax = Vector((0.25, 0.1, 1.0)).normalized()
    Hl = Sculpt('cabecaL_kerberos')
    Hl.chain([tuple(hL), tuple(hL + ax * 0.3), tuple(hL + ax * 0.58)], [0.22, 0.23, 0.22], step=0.5)
    Hl.ell(tuple(hL + ax * 0.66), (0.15, 0.15, 0.15), 'hole', neg=True)  # a boca redonda
    Hl.ell(tuple(hL + ax * 0.6), (0.17, 0.17, 0.06), 'gum')
    Hl.build(nL, M['flesh'], 1300, res=0.01, smooth=3, disp=fibers, color=color_fn(fibers))
    up = Vector((0, 1, 0))
    side = ax.cross(up).normalized()
    up = side.cross(ax).normalized()
    for k in range(3):  # os espinhos saindo perpendiculares, em anéis
        c = hL + ax * (0.12 + k * 0.17)
        for i in range(8):
            a = i / 8 * math.tau + k * 0.4
            nrm = side * math.cos(a) + up * math.sin(a)
            b = c + nrm * 0.2
            ln = 0.22 * random.uniform(0.8, 1.2)
            add(nL, f'wspike{k}{i}', spike(tuple(b), tuple(b + nrm * ln - ax * 0.05), 0.022, seg=5), M['bone'])
    jL = joint('J_jawL', tuple(hL + ax * 0.62), nL)  # o anel de dentes da boca (abre e fecha)
    for r, n, ln in ((0.15, 14, 0.13), (0.1, 10, 0.1)):
        for i in range(n):
            a = i / n * math.tau
            nrm = side * math.cos(a) + up * math.sin(a)
            b = nrm * r
            add(jL, f'wtooth{r}{i}', spike(tuple(b), tuple(b - nrm * ln * 0.85 - ax * ln * 0.4), 0.014, seg=5), M['fang'])

    # --- a da DIREITA: a INSETOIDE (as QUATRO QUELÍCERAS em volta da boca de dentes)
    nR = neck('R', (-0.42, 0.3, 1.12), (-0.2, 0.22, 0.34), 0.24, 0.2)
    hR = Vector((-0.2, 0.22, 0.34))
    Hr = Sculpt('cabecaR_kerberos')
    Hr.ell(tuple(hR + Vector((0, 0.05, 0.12))), (0.22, 0.2, 0.26))  # a carapaça
    Hr.ell(tuple(hR + Vector((0, -0.04, 0.34))), (0.15, 0.13, 0.12))  # a boca
    Hr.ell(tuple(hR + Vector((0, -0.04, 0.42))), (0.1, 0.09, 0.08), 'hole', neg=True)
    for s in (1, -1):
        Hr.ell(tuple(hR + Vector((s * 0.12, 0.2, 0.05))), (0.07, 0.1, 0.12))  # as placas da carapaça
    Hr.build(nR, M['flesh'], 1200, res=0.01, smooth=3, disp=fibers, color=color_fn(fibers))
    for i in range(12):  # a mandíbula de dentro, cheia de dentes
        a = i / 12 * math.tau
        b = hR + Vector((math.cos(a) * 0.08, -0.04 + math.sin(a) * 0.07, 0.42))
        add(nR, f'itooth{i}', spike(tuple(b), tuple(b + Vector((-math.cos(a) * 0.05, -math.sin(a) * 0.05, 0.04))), 0.01, seg=4), M['fang'])
    jR = joint('J_jawR', tuple(hR + Vector((0, -0.04, 0.34))), nR)  # as quelíceras (abrem como pinças)
    for k, (sx, sy) in enumerate(((1, 1), (-1, 1), (1, -1), (-1, -1))):
        b = Vector((sx * 0.1, sy * 0.06, 0.02))
        pts = curve(tuple(b), tuple(b + Vector((sx * 0.2, sy * 0.1, 0.22))), tuple(b + Vector((sx * 0.02, sy * 0.02, 0.42))), 8)
        add(jR, f'chel{k}', rod(pts, [0.045, 0.042, 0.038, 0.032, 0.025, 0.018, 0.01, 0.002], seg=7), M['bone'])
        add(jR, f'chelTip{k}', rod(pts[-3:], [0.012, 0.007, 0.002], seg=5), M['boneTip'])

    # ================================================================ AS SEIS PATAS (caninas, com garras)
    up_l, lo_l = 0.58, 0.68
    for name, x, z, back in (('FL', 0.4, 0.82, False), ('FR', -0.4, 0.82, False), ('ML', 0.44, 0.05, False),
                             ('MR', -0.44, 0.05, False), ('BL', 0.38, -0.72, True), ('BR', -0.38, -0.72, True)):
        s = 1 if x > 0 else -1
        leg = joint(f'J_leg{name}', (x, -0.1, z), torso)
        L = Sculpt(f'coxa{name}_kerberos')
        if back:  # pata de trás de cão: a coxa vai para a frente e o jarrete para trás
            L.chain([(0, 0.12, -0.04), (0, -up_l * 0.5, 0.1), (0, -up_l, 0.06)], [0.27, 0.2, 0.14], step=0.5)
        else:
            L.chain([(0, 0.12, 0), (0, -up_l * 0.5, -0.04), (0, -up_l, 0)], [0.24, 0.18, 0.13], step=0.5)
        f = limb_fibers((0, 0, 0), (0, -up_l, 0), 6, 0.9 * s, AMP)
        L.build(leg, M['flesh'], 800, res=0.011, smooth=2, disp=f, color=color_fn(f))
        knee = joint(f'J_knee{name}', (0, -up_l, 0.06 if back else 0.0), leg)
        K = Sculpt(f'canela{name}_kerberos')
        if back:
            K.chain([(0, 0, 0), (0, -lo_l * 0.55, -0.14), (0, -lo_l + 0.06, -0.06)], [0.13, 0.1, 0.09], step=0.5)
        else:
            K.chain([(0, 0, 0), (0, -lo_l * 0.6, 0.02), (0, -lo_l + 0.06, 0.02)], [0.12, 0.1, 0.09], step=0.5)
        K.ell((0, -lo_l + 0.05, 0.08), (0.14, 0.07, 0.17))  # a pata
        f2 = limb_fibers((0, 0, 0), (0, -lo_l, 0), 6, -0.8 * s, AMP)
        K.build(knee, M['flesh'], 700, res=0.009, smooth=2, disp=f2, color=color_fn(f2))
        for i in range(4):  # as garras
            a = (i - 1.5) * 0.4
            b = (math.sin(a) * 0.08, -lo_l + 0.04, 0.18)
            add(knee, f'claw{i}', rod(curve(b, (b[0] * 1.15, -lo_l + 0.05, 0.27), (b[0] * 1.2, -lo_l - 0.02, 0.32), 5), [0.022, 0.017, 0.011, 0.005, 0.001], seg=5), M['claw'])
        add(leg, 'spineLeg', spike((s * 0.12, -0.1, -0.05), (s * 0.3, 0.05, -0.2), 0.03, seg=5), M['bone'])

    # ================================================================ A CAUDA enorme, com espinhos
    tail = joint('J_tail', (0, 0.05, -1.05), torso)
    p1 = curve((0, 0, 0), (0, -0.1, -0.6), (0, -0.4, -1.1), 9)
    T1 = Sculpt('cauda_kerberos')
    T1.chain(p1, [0.2, 0.18, 0.16, 0.15, 0.14, 0.13, 0.12, 0.11, 0.1], step=0.5)
    f = limb_fibers((0, 0, 0), p1[-1], 6, 1.2, AMP)
    T1.build(tail, M['flesh'], 900, res=0.011, smooth=2, disp=f, color=color_fn(f))
    for i in range(1, 8):
        b = Vector(p1[i]) + Vector((0, 0.12 - i * 0.008, 0))
        add(tail, f'tspike{i}', spike(tuple(b), tuple(b + Vector((0, 0.22 - i * 0.015, -0.12))), 0.03 - i * 0.002, seg=5), M['bone'])
    t2 = joint('J_tail2', p1[-1], tail)
    p2 = curve((0, 0, 0), (0, -0.3, -0.55), (0, 0.15, -1.05), 10)
    T2 = Sculpt('cauda2_kerberos')
    T2.chain(p2, [0.1, 0.09, 0.085, 0.08, 0.072, 0.064, 0.056, 0.048, 0.04, 0.03], step=0.5)
    T2.build(t2, M['flesh'], 600, res=0.009, smooth=2, color=color_fn(None))
    for i in range(2, 9, 2):
        b = Vector(p2[i]) + Vector((0, 0.07, 0))
        add(t2, f'tspike2{i}', spike(tuple(b), tuple(b + Vector((0, 0.16, -0.08))), 0.02, seg=5), M['bone'])

    white_vcols()
    finish()
