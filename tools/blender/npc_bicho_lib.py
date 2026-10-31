"""
ANIMAIS INFECTADOS PELA TINTA (invocação do Amigo Imaginário) — O Segredo na Ilha, wiki "Javalis Infectados" e
"Cachorros Selvagens Infectados" (as miniaturas oficiais). Cadáveres ambulantes: o PELO marrom-escuro eriçado (a crina
espetada pelo dorso, tufos pendurados na barriga), partes da carne derretida e as COSTELAS expostas no flanco, as
VEIAS MARRONS-AVERMELHADAS enormes saindo de dentro do corpo e passando por cima do pelo até o OLHO pequeno, vermelho e
arregalado (as veias irradiam dele, e a tinta escorre); a boca aberta de um jeito monstruoso, com os dentes muito
maiores que o normal saindo para fora; patas com unhas enormes.
  - javali (npc_javali_tinta.py): enorme, corcunda nos ombros, o focinho de porco, as PRESAS curvas gigantes (duas
    para cima e outras saindo da boca);
  - cão (npc_cao_tinta.py): de lobo, magro e comprido, a mandíbula longa escancarada cheia de presas, a língua e o
    rabo peludo curvado.

TÉCNICA: a escultura do Carniçal (npc_sculpt_lib.py) — corpo, cabeça, mandíbula e pernas em metaballs fundidos, o pelo
em mechas por deslocamento, as veias e as costelas como cordões da própria forma (cor por vértice), a crina em pontas.
Juntas (J_*) nas MESMAS posições de antes: body, torso, head, jaw, as quatro pernas (legFL/FR/BL/BR com o joelho knee*)
e tail — animadas em código (src/combat/beasts.js → InkBeast).
"""
import sys
import math
import random

from mathutils import Vector

from lib import reset, material, export_glb, hex_rgb, TAU
from npc_lib import rod, curve, spike, joint, add, finish
from npc_sculpt_lib import Sculpt, vcol_material, ridge, n3, white_vcols


def build(kind):
    boar = kind == 'javali'
    random.seed(17 if boar else 23)
    reset()
    M = {
        'fur': vcol_material('fur_bicho', 0.85),  # o corpo inteiro (pelo, carne, veias) com a cor por vértice
        'mane': material('fur2_bicho', '#3a2618' if boar else '#4a3424', 0.9),  # a crina e os tufos
        'tooth': material('tooth_bicho', '#d8c8a0', 0.4),
        'maw': material('maw_bicho', '#1a0604', 0.8),
        'claw': material('claw_bicho', '#14100c', 0.4),
        'eye': material('glow_bicho', '#ff3a20', 0.3, emission='#ff3a20', strength=2.5),
        'goo': material('goo_bicho', '#5a1c10', 0.3),
        'tongue': material('flesh_lingua_bicho', '#a0404a', 0.45),
    }
    C = {k: Vector(hex_rgb(v)) for k, v in {
        'fur': '#4a3222' if boar else '#5a3e28', 'tip': '#7a5a3a' if boar else '#8a6a48', 'dark': '#22160e',
        'flesh': '#6a2420', 'vein': '#7a3424', 'bone': '#c8b48c', 'snout': '#3a2a24',
    }.items()}

    # ---------------- proporções (juntas nas mesmas posições do modelo antigo)
    if boar:
        legH, halfL, bodyR, humpH, headL = 0.5, 0.62, (0.34, 0.36), 0.18, 0.5
        legR, legX = (0.075, 0.055), 0.2
    else:
        legH, halfL, bodyR, humpH, headL = 0.52, 0.42, (0.17, 0.2), 0.05, 0.36
        legR, legX = (0.045, 0.03), 0.12
    upper, lower = legH * 0.52, legH * 0.5
    FUR = 0.02 if boar else 0.013  # comprimento das mechas (deslocamento)

    def fur_disp(axis_dir=(0, 0, -1)):
        """mechas de pelo: sulcos finos correndo para trás (e para baixo nos flancos), quebrados por ruído"""
        def f(p):
            x, y, z = p
            w = n3(p, 11) * 1.4
            v = ridge((x * 1.0 + y * 0.35) * (110 if boar else 150) + z * 9 + w, 3)  # mechas finas
            v2 = ridge((x * 0.6 - y * 0.8) * (45 if boar else 60) + z * 4 + n3(p, 5) * 2, 2)  # tufos maiores
            return FUR * (0.55 * v + 0.45 * v2 - 0.4) * (0.5 + 0.5 * abs(n3(p, 3)) * 2)
        return f

    def color_fn(disp_fn):
        def f(p, sc):
            fld = sc.field(p)
            if fld.get('vein', 0) > 0.25:
                return C['vein'].lerp(C['dark'], max(0.0, n3(p, 14)) * 0.5)
            if fld.get('bone', 0) > 0.3:
                return C['bone']
            if fld.get('flesh', 0) > 0.25:
                return C['flesh'].lerp(C['dark'], max(0.0, n3(p, 9)) * 0.6)
            if fld.get('snout', 0) > 0.5:
                return C['snout']
            k = max(0.0, min(1.0, disp_fn(p) / FUR + 0.4)) if disp_fn else 0.4
            return C['dark'].lerp(C['fur'], min(1.0, k * 1.5)).lerp(C['tip'], max(0.0, k - 0.7) * 2.5)
        return f

    body = joint('J_body', (0, 0, 0))
    torso = joint('J_torso', (0, legH, 0), body)

    # ================================================================ TRONCO
    S = Sculpt('tronco_' + kind)
    spine = []
    for i in range(9):
        t = i / 8
        z = -halfL + t * 2 * halfL
        hump = humpH * math.sin(min(1.0, t * 1.3) * math.pi * 0.5) * (1 - max(0.0, t - 0.8) * 2)
        r = bodyR[0] * (0.62 + 0.45 * math.sin(math.pi * (0.15 + t * 0.75))) * (1 if boar else 0.72 + 0.45 * t) + hump * 0.35  # o cão: peito fundo, cintura fina
        spine.append((z, hump, r))
        S.ell((0, bodyR[1] * 0.1 + hump * 0.5, z), (r, r * bodyR[1] / bodyR[0], halfL * 0.32))
    S.ell((0, -bodyR[1] * 0.25, 0.05), (bodyR[0] * 0.8, bodyR[1] * 0.55, halfL * 0.8))  # barriga
    S.ell((0, bodyR[1] * 0.1 + humpH * 0.6, halfL * 0.85), (bodyR[0] * 0.8, bodyR[1] * 0.8, halfL * 0.35))  # o pescoço grosso
    for s in (1, -1):  # ombros e ancas (onde as pernas encaixam)
        S.ell((s * legX, 0.0, halfL * 0.62), (legR[0] * 1.9, legR[0] * 2.6, legR[0] * 2.1))
        S.ell((s * legX, 0.02, -halfL * 0.62), (legR[0] * 2.0, legR[0] * 2.8, legR[0] * 2.3))
    def surf(y, z, a, s=1):
        """o ponto da SUPERFÍCIE do tronco na direção do ângulo a (0 = topo, pi/2 = flanco), na seção z: anda para fora
        pelo campo dos metaballs até ele cair abaixo do limiar (0,6) e refina por bisseção"""
        o = Vector((0, y, z))
        d = Vector((s * math.sin(a), math.cos(a), 0))
        tot = lambda q: sum(S.field(q).values())
        lo, hi = 0.0, 0.02
        while hi < 1.5 and tot(o + d * hi) >= 0.6:
            lo, hi = hi, hi + 0.02
        for _ in range(8):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if tot(o + d * mid) >= 0.6 else (lo, mid)
        return o + d * lo, d

    def midY(z):
        k = min(len(spine) - 1, max(0, int((z + halfL) / (2 * halfL) * 8)))
        return bodyR[1] * 0.1 + spine[k][1] * 0.5

    # o FLANCO DERRETIDO: a carne exposta e as costelas saltando (um lado só, como na arte)
    side = 1
    fz = -halfL * 0.05
    p0, d0 = surf(midY(fz), fz, math.pi * 0.5, side)
    S.ell(tuple(p0 - d0 * bodyR[0] * 0.12), (bodyR[0] * 0.28, bodyR[1] * 0.45, halfL * 0.38), 'flesh')
    rr = 0.02 if boar else 0.013
    ribs = []
    for r in range(5 if boar else 4):
        z = fz - halfL * 0.26 + r * halfL * 0.13
        pts = [surf(midY(z), z, a, side) for a in (0.95, 1.25, 1.57, 1.9, 2.2)]
        ribs.append([tuple(p + d * rr * 0.2) for p, d in pts])
    # as VEIAS: saem de dentro do corpo nos flancos e serpenteiam para a frente, subindo o pescoço até o olho;
    # galhos curtos saem delas
    vr = 0.03 if boar else 0.018
    veins = []
    for s in (1, -1):
        for i in range(3 if boar else 2):
            z = -halfL * (0.75 - i * 0.3)
            a = random.uniform(1.0, 1.6)
            pts = []
            while z < halfL * 1.05:
                p, d = surf(midY(z), z, a, s)
                pts.append(tuple(p + d * vr * 0.35))
                z += halfL * 0.12
                a = max(0.45, min(1.9, a + random.uniform(-0.35, 0.3) - 0.04))
            veins.append(pts)
            for j in range(1, len(pts) - 2, 3):  # galhos
                zb = pts[j][2]
                ab = random.uniform(0.6, 2.0)
                br = [pts[j]]
                for k in range(3):
                    zb += random.uniform(-0.06, 0.06)
                    ab += (0.25 if ab < 1.3 else -0.25)
                    p, d = surf(midY(zb), zb, ab, s)
                    br.append(tuple(p + d * vr * 0.3))
                veins.append(br)
    for pts in ribs:
        S.chain(pts, rr, 'bone', step=0.5)
    for pts in veins:
        S.chain(pts, [vr] * (len(pts) - 1) + [vr * 0.6], 'vein', step=0.6)

    fd = fur_disp()
    S.build(torso, M['fur'], 4200 if boar else 3200, res=0.012 if boar else 0.008, smooth=3, disp=fd, color=color_fn(fd))

    # a CRINA espetada pelo dorso e os tufos pendurados na barriga
    for i in range(22 if boar else 16):
        t = i / (21 if boar else 15)
        z = -halfL * 0.85 + t * halfL * 1.9
        for s in (-1, 0, 1):
            p, d = surf(midY(z), z, s * 0.15)
            ln = (0.16 if boar else 0.1) * (1.25 if t > 0.55 else 0.9) * random.uniform(0.7, 1.2)
            add(torso, f'mane{i}{s}', spike(tuple(p - d * 0.02), (p.x + s * 0.04 + random.uniform(-0.02, 0.02), p.y + ln, p.z - ln * 0.7), 0.028 if boar else 0.018, seg=4), M['mane'])
    for i in range(70 if boar else 55):  # o pelo DESGRENHADO pelos flancos, barriga e pescoço (pontas para trás e para baixo)
        z = random.uniform(-halfL * 0.85, halfL * 1.0)
        a = random.uniform(0.5, 2.9)
        s = random.choice((1, -1))
        if s == side and abs(z - fz) < halfL * 0.35 and a < 2.4:
            continue  # o flanco aberto fica sem pelo
        p, d = surf(midY(z), z, a, s)
        ln = random.uniform(0.07, 0.14) if boar else random.uniform(0.05, 0.1)
        base = p - d * 0.015
        tip = (base.x + d.x * ln * 0.35, base.y - ln * 0.75, base.z - ln * 0.6)
        add(torso, f'shag{i}', spike(tuple(base), tip, 0.03 if boar else 0.02, seg=4), M['mane'])
    for i in range(4):  # a gosma pingando do flanco aberto
        z = fz + random.uniform(-halfL * 0.3, halfL * 0.3)
        p, d = surf(midY(z), z, 2.3, side)
        ln = random.uniform(0.08, 0.18)
        add(torso, f'goo{i}', rod([tuple(p), (p.x, p.y - ln * 0.6, p.z), (p.x, p.y - ln, p.z)], [0.018, 0.012, 0.003], seg=5), M['goo'])

    # ================================================================ CABEÇA
    head = joint('J_head', (0, bodyR[1] * 0.3 + humpH * 0.6, halfL * 0.95), torso)
    Hs = Sculpt('cabeca_' + kind)
    if boar:
        Hs.ell((0, 0.06, 0.02), (0.2, 0.2, 0.2))  # a nuca larga
        Hs.ell((0, 0.04, headL * 0.4), (0.16, 0.15, 0.2))
        Hs.ell((0, -0.0, headL * 0.75), (0.11, 0.1, 0.15))
        Hs.ell((0, -0.03, headL + 0.0), (0.09, 0.085, 0.05), 'snout')  # o disco do focinho de porco
        for s in (1, -1):
            Hs.ell((s * 0.035, -0.03, headL + 0.045), (0.02, 0.025, 0.03), 'snout', neg=True)  # narinas
            Hs.ell((s * 0.12, 0.16, 0.02), (0.05, 0.1, 0.03), dir=(s * 0.5, 1, -0.4))  # orelha
            Hs.ell((s * 0.11, 0.1, headL * 0.32), (0.035, 0.035, 0.03), 'flesh', neg=True)  # a órbita funda
        jawZ = headL * 0.45
    else:
        Hs.ell((0, 0.05, 0.0), (0.11, 0.11, 0.12))  # crânio de lobo
        Hs.ell((0, 0.03, headL * 0.45), (0.075, 0.07, 0.13))
        Hs.ell((0, 0.0, headL * 0.85), (0.045, 0.045, 0.1))  # o focinho comprido
        Hs.ell((0, 0.01, headL + 0.01), (0.03, 0.026, 0.026), 'snout')  # a trufa
        for s in (1, -1):
            Hs.ell((s * 0.06, 0.16, -0.01), (0.032, 0.09, 0.02), dir=(s * 0.35, 1, -0.3))  # orelha pontuda
            Hs.ell((s * 0.06, 0.07, headL * 0.38), (0.024, 0.024, 0.02), 'flesh', neg=True)  # órbita
        jawZ = headL * 0.3
    for s in (1, -1):  # as veias irradiando do olho
        for i in range(4):
            a = i / 4 * TAU + 0.4
            ex, ey, ez = (s * (0.11 if boar else 0.06), 0.1 if boar else 0.07, headL * (0.32 if boar else 0.38))
            ln = (0.12 if boar else 0.08)
            Hs.chain([(ex * 1.08, ey + math.sin(a) * 0.02, ez + math.cos(a) * 0.02), (ex * 1.1, ey + math.sin(a) * ln, ez + math.cos(a) * ln * 0.9 - 0.02)], [0.012 if boar else 0.008, 0.008 if boar else 0.005], 'vein', step=0.5)
    hd = fur_disp()
    Hs.build(head, M['fur'], 1800 if boar else 1300, res=0.009 if boar else 0.006, smooth=3, disp=hd, color=color_fn(hd))
    # os olhos pequenos, vermelhos e arregalados; a tinta escorrendo
    for s in (1, -1):
        ex, ey, ez = (s * (0.11 if boar else 0.06), 0.1 if boar else 0.07, headL * (0.32 if boar else 0.38))
        add(head, f'eye{s}', rod([(ex * 0.95, ey, ez - 0.01), (ex * 0.98, ey, ez + 0.005)], 0.02 if boar else 0.014, seg=8), M['eye'])
        add(head, f'tear{s}', rod([(ex * 1.05, ey - 0.02, ez + 0.01), (ex * 1.1, ey - 0.06, ez + 0.03), (ex * 1.08, ey - 0.12, ez + 0.02)], [0.012, 0.008, 0.002], seg=5), M['goo'])
    # a boca de cima: céu escuro e os DENTES grandes saindo para fora
    add(head, 'mawU', rod([(0, -0.07, jawZ - 0.02), (0, -0.075, jawZ + headL * 0.3), (0, -0.06, headL * 0.95)], [0.07 if boar else 0.04, 0.06 if boar else 0.035, 0.03 if boar else 0.02], seg=10), M['maw'])
    nU = 10 if boar else 12
    for i in range(nU):
        t = i / (nU - 1)
        s = 1 if i % 2 else -1
        z = jawZ + t * (headL * 0.95 - jawZ)
        x = s * (0.08 if boar else 0.042) * (1 - t * 0.35)
        ln = (0.09 + 0.05 * (1 - t)) if boar else (0.06 + 0.05 * math.sin(t * math.pi))
        ln *= random.uniform(0.8, 1.2)
        add(head, f'toothU{i}', rod(curve((x, -0.07, z), (x * 1.08, -0.07 - ln * 0.6, z + 0.03), (x * 0.95, -0.07 - ln, z + 0.05), 4), [0.016 if boar else 0.01, 0.011 if boar else 0.007, 0.006 if boar else 0.004, 0.0015], seg=5), M['tooth'])
    if boar:
        for s in (1, -1):
            # as PRESAS gigantes: um par saindo do focinho e curvando para cima e para trás, outro mais baixo e para fora
            add(head, f'tusk{s}', rod(curve((s * 0.08, -0.06, headL * 0.78), (s * 0.24, -0.02, headL * 0.98), (s * 0.18, 0.22, headL * 0.8), 8), [0.04, 0.036, 0.03, 0.024, 0.017, 0.011, 0.006, 0.002], seg=7), M['tooth'])
            add(head, f'tusk2{s}', rod(curve((s * 0.1, -0.08, headL * 0.6), (s * 0.3, -0.12, headL * 0.75), (s * 0.34, 0.02, headL * 0.95), 7), [0.03, 0.026, 0.02, 0.015, 0.01, 0.005, 0.0015], seg=7), M['tooth'])

    jaw = joint('J_jaw', (0, -0.08, jawZ), head)
    Js = Sculpt('mandibula_' + kind)
    Js.chain([(0, -0.02, -0.04), (0, -0.04, headL * 0.25), (0, -0.04, headL * (0.5 if boar else 0.62))], [0.09 if boar else 0.05, 0.075 if boar else 0.04, 0.05 if boar else 0.028], step=0.5)
    jd = fur_disp()
    Js.build(jaw, M['fur'], 700 if boar else 500, res=0.008 if boar else 0.006, smooth=2, disp=jd, color=color_fn(jd))
    add(jaw, 'mawL', rod([(0, 0.01, 0.0), (0, 0.015, headL * (0.45 if boar else 0.55))], [0.06 if boar else 0.035, 0.03 if boar else 0.02], seg=8), M['maw'])
    nL = 8 if boar else 10
    for i in range(nL):
        t = i / (nL - 1)
        s = 1 if i % 2 else -1
        z = t * headL * (0.48 if boar else 0.6)
        x = s * (0.06 if boar else 0.03) * (1 - t * 0.3)
        ln = (0.08 if boar else 0.06) * random.uniform(0.8, 1.25)
        add(jaw, f'toothL{i}', rod(curve((x, 0.0, z), (x * 1.08, ln * 0.6, z + 0.02), (x * 0.95, ln, z + 0.04), 4), [0.014 if boar else 0.009, 0.01 if boar else 0.006, 0.005 if boar else 0.003, 0.0015], seg=5), M['tooth'])
    if not boar:  # a língua comprida pendendo
        add(jaw, 'tongue', rod(curve((0, 0.02, headL * 0.05), (0, 0.03, headL * 0.45), (0.01, -0.06, headL * 0.68), 6), [0.022, 0.024, 0.022, 0.018, 0.014, 0.008], seg=8, flat=0.45), M['tongue'])
    add(jaw, 'drool', rod([(0, -0.05, headL * 0.35), (0, -0.1, headL * 0.37), (0, -0.16, headL * 0.35)], [0.016, 0.01, 0.003], seg=5), M['goo'])

    # ================================================================ PERNAS com unhas enormes
    for name, x, z in (('FL', legX, halfL * 0.62), ('FR', -legX, halfL * 0.62), ('BL', legX, -halfL * 0.62), ('BR', -legX, -halfL * 0.62)):
        back = name[0] == 'B'
        leg = joint(f'J_leg{name}', (x, 0, z), torso)
        Ls = Sculpt(f'coxa{name}_{kind}')
        Ls.chain([(0, 0.06, 0), (0, -upper * 0.45, -0.02 if back else 0.02), (0, -upper, 0)], [legR[0] * (1.9 if back else 1.6), legR[0] * 1.25, legR[0]], step=0.5)
        ld = fur_disp()
        Ls.build(leg, M['fur'], 600, res=0.009 if boar else 0.006, smooth=2, disp=ld, color=color_fn(ld))
        for i in range(3):  # tufos na parte de trás da perna
            yy = -upper * (0.2 + i * 0.25)
            add(leg, f'legTuft{i}', spike((0, yy, -legR[0] * 0.8), (random.uniform(-0.02, 0.02), yy - 0.06, -legR[0] * 0.8 - (0.07 if boar else 0.05)), legR[0] * 0.45, seg=4), M['mane'])
        knee = joint(f'J_knee{name}', (0, -upper, 0), leg)
        Ks = Sculpt(f'canela{name}_{kind}')
        Ks.chain([(0, 0, 0), (0, -lower * 0.6, 0.01), (0, -lower + 0.04, 0.02)], [legR[0], legR[1] * 1.05, legR[1]], step=0.5)
        Ks.ell((0, -lower + 0.025, 0.05), (legR[1] * 1.5, 0.03, legR[1] * 1.9))  # a pata larga
        kd = fur_disp()
        Ks.build(knee, M['fur'], 500, res=0.008 if boar else 0.0055, smooth=2, disp=kd, color=color_fn(kd))
        for i in range(4):
            a = (i - 1.5) * 0.4
            base = (math.sin(a) * legR[1] * 1.2, -lower + 0.015, 0.05 + legR[1] * 1.5)
            add(knee, f'nail{i}', rod([base, (base[0] * 1.2, -lower + 0.005, base[2] + (0.06 if boar else 0.045)), (base[0] * 1.25, -lower - 0.008, base[2] + (0.1 if boar else 0.075))], [0.014 if boar else 0.009, 0.009 if boar else 0.006, 0.0015], seg=5), M['claw'])

    # ================================================================ RABO
    tail = joint('J_tail', (0, bodyR[1] * 0.35, -halfL * 1.02), torso)
    Ts = Sculpt('rabo_' + kind)
    if boar:
        Ts.chain(curve((0, 0, 0), (0, -0.05, -0.08), (0.03, -0.18, -0.06), 5), [0.03, 0.024, 0.018, 0.014, 0.01], step=0.5)
    else:
        # o rabo peludo e cheio, curvando para cima como na miniatura
        Ts.chain(curve((0, 0, 0), (0, 0.02, -0.25), (0, 0.22, -0.42), 8), [0.035, 0.05, 0.06, 0.062, 0.058, 0.05, 0.038, 0.02], step=0.5)
    td = fur_disp()
    Ts.build(tail, M['fur'], 400 if boar else 700, res=0.007, smooth=2, disp=td, color=color_fn(td))

    white_vcols()
    finish()
    out = sys.argv[sys.argv.index('--') + 1]
    export_glb(out)
