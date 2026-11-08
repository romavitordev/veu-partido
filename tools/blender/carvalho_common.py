"""
O CASAL CARVALHO — Fernando e Luciano (Ordo Realitas, Equipe Brasa / Força D, Desconjuração). Um CORPO só para os dois:
no cânone o Fernando vive dentro do corpo do marido, o Luciano, e só os OLHOS mostram quem está no controle — rosa no
Fernando, amarelo no Luciano. Por isso char_fernando.py e char_luciano.py chamam este arquivo e só mudam o rosto
(face_fernando / face_luciano em textures.js) e a bandoleira da M4 (o Luciano anda com o fuzil).
Referências: wiki "Fernando Carvalho" e "Luciano Carvalho" (Aparência, Desconjuração) e as artes da HQ Desconjuração
Pt. 1 e da campanha: homem negro, forte, 1,78 m, cabelo castanho escuro RASPADO estilo militar, barba rala, a CICATRIZ
abaixo do olho direito (o tiro do Devorado, ep. 14); camisa social BRANCA com as MANGAS de FLORES vinho (textura
sleeve_carvalho), por fora da calça, gola aberta; calça MARROM; sapatos ACINZENTADOS com CADARÇOS ROSA; os dois ANÉIS
dos rituais (Reação e Descarnar) na mão direita. A M4, a Glock 17 e o canivete na mão são montados em código (props.js).
TÉCNICA (a do Rubens): corpo pelo Builder; camisa como CASCA (shell_grid) com relevo; calça, sapatos e cabelo por
ESCULTURA de metaballs.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector


def build(variant, OUT):
    random.seed(1780)
    b = Builder(width=1.02, bulk=1.1, height=0.99)  # 1,78 m, porte forte de ex-militar
    sk = b.sk
    H = sk.h
    hz = sk['hips'].z

    skin = material('skin_carvalho', '#5a3a28', 0.8)
    M = {
        'skin': skin,
        'face': material('face_' + variant, '#ffffff', 0.8),
        'torso': material('shirt_carvalho', '#ece8e2', 0.85),
        'arm': material('sleeve_carvalho', '#ffffff', 0.85),  # flores vinho (textura)
        'hand': skin,
        'legs': material('pants_carvalho', '#5c4232', 0.9),
        'feet': material('shoe_carvalho', '#8a8a90', 0.6),
    }
    shirt = M['torso']
    shirt_dk = material('shirt_carvalho_dk', '#cfcac2', 0.85)
    button = material('button_carvalho', '#f4f2ee', 0.4)
    hairm = material('hair_carvalho', '#1c1410', 0.8)
    lace = material('lace_carvalho', '#ff6ab0', 0.6)
    sole = material('sole_carvalho', '#3a3a3e', 0.8)
    silver = material('ring_carvalho', '#c8c8d0', 0.3, metal=0.9)
    strap = material('strap_carvalho', '#141416', 0.6)
    PREVIEW = {'face_' + variant: '#5a3a28', 'sleeve_carvalho': '#e8d8d8'}
    for m in bpy.data.materials:
        for k, c in PREVIEW.items():
            if m.name.endswith(k):
                m['preview'] = c

    TP = [(-0.11, 0.17), (0.0, 0.172), (0.14, 0.17), (0.28, 0.19), (0.4, 0.212), (0.5, 0.222), (0.57, 0.13), (0.63, 0.074)]
    hc = b.body(M, TP, arm_r=(0.07, 0.06, 0.049), leg_r=(0.096, 0.077, 0.056), head_r=(0.136, 0.148, 0.16), neck_r=0.074)

    def part(name):
        return next(o for o in b.parts if o.name == name)

    tor = part('torso')
    ty = min(v.co.y for v in tor.data.vertices if abs(v.co.x) < 0.02 and abs(v.co.z - 1.5 * H) < 0.03 * H)

    # ============================================================ CAMISA SOCIAL BRANCA por fora da calça
    # o corpo da camisa desce da cintura até o quadril, solto (a barra cai por cima da calça)
    SH = []
    for k in range(6):
        z = hz + 0.16 * H - k * 0.05 * H
        flare = 1 + k * 0.035
        SH.append(ring_pts(z, 0.2 * H * flare, 0.158 * H * flare, 0.0, TAU, 32))
    sh = b.add('shirtHem', shell_grid(SH, 0.006), shirt, region='skirt', subdiv=1)
    relief(sh, lambda p: 0.0035 * H * (ridge(math.atan2(p.x, -p.y) * 7 + n3(p, 9) * 1.5, 2) - 0.4))
    # as dobras do tecido no peito e nas costas (o torso é a própria camisa)
    relief(tor, lambda p: 0.0018 * H * (ridge(p.z / H * 26 + math.atan2(p.x, -p.y) * 2 + n3(p, 10) * 2, 2) - 0.45))
    # a GOLA aberta: sobe em volta do pescoço e abre em V na frente
    gola = [ring_pts(1.56 * H + k * 0.03 * H, (0.098 + k * 0.004) * H, (0.086 + k * 0.004) * H, 0.6, TAU - 0.6, 20) for k in range(3)]
    b.add('collar', shell_grid(gola, 0.006), shirt, region='neck', subdiv=1)
    for s in (1, -1):  # as pontas da gola dobradas para fora
        b.add(f'collarTip{s}', rod([(s * 0.03 * H, ty - 0.004 * H, 1.6 * H), (s * 0.075 * H, ty + 0.01 * H, 1.555 * H), (s * 0.09 * H, ty + 0.03 * H, 1.6 * H)],
                                   0.008 * H, 5, flat=(outward((0, 0)), 0.3)), shirt_dk, region='chest', subdiv=0)
    # o V da pele no colarinho aberto
    b.add('chestV', ellipsoid((0, ty + 0.002 * H, 1.555 * H), (0.03 * H, 0.006 * H, 0.04 * H), 10, 6), skin, region='chest', subdiv=0)
    # a carcela e os botões descendo pela frente
    b.add('placket', rod([(0, ty - 0.003 * H, 1.52 * H), (0, ty - 0.012 * H, 1.3 * H), (0, -0.152 * H, hz + 0.02 * H), (0, -0.16 * H, hz - 0.08 * H)],
                         0.006 * H, 5, flat=(outward((0, 0)), 0.3)), shirt_dk, region='chest', subdiv=0)
    for i, z in enumerate((1.48, 1.38, 1.28, 1.18, 1.08)):
        b.add(f'btn{i}', ellipsoid((0, ty - 0.012 * H - 0.004 * i * H, z * H), (0.006 * H, 0.003 * H, 0.006 * H), 8, 4), button, region='chest', subdiv=0)
    # os PUNHOS brancos da camisa (as mangas floridas terminam neles)
    for side in ('L', 'R'):
        e, h = sk['e' + side], sk['hand' + side]
        b.add('cuff' + side, tube(limb_rings(e.lerp(h, 0.78), e.lerp(h, 0.9), 0.054 * H, 0.054 * H, n=1), 12), shirt, region='e' + side, subdiv=0)

    # ============================================================ CALÇA MARROM
    for side in ('L', 'R'):
        l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
        P = Sculpt()
        P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k + Vector((0, -0.003 * H, 0)), k.lerp(f, 0.6), k.lerp(f, 0.88)],
                [0.1 * H, 0.084 * H, 0.068 * H, 0.062 * H, 0.06 * H], step=0.45)
        c2 = (l.x, l.y)
        fold = lambda p, c=c2, kz=k.z: 0.003 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 28 + n3(p, 16), 2) - 0.35) * (1.6 if abs(p.z - kz) < 0.06 * H else 1)
        b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
    Hp = Sculpt()
    Hp.ell(Vector((0, 0.0, hz - 0.02 * H)), (0.178 * H, 0.134 * H, 0.1 * H))
    Hp.ell(Vector((0, 0.012 * H, hz - 0.06 * H)), (0.16 * H, 0.112 * H, 0.078 * H))
    b.add('pantsHip', Hp.mesh(res=0.011, smooth=3, disp=lambda p: 0.0015 * H * n3(p, 14), target=800), M['legs'], region='body',
          weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)

    # ============================================================ SAPATOS ACINZENTADOS com CADARÇOS ROSA
    for side in ('L', 'R'):
        k, f = sk['k' + side], sk['foot' + side]
        S = Sculpt()
        S.ell(f + Vector((0, -0.05 * H, 0.032 * H)), (0.054 * H, 0.118 * H, 0.04 * H))
        S.ell(f + Vector((0, -0.128 * H, 0.024 * H)), (0.048 * H, 0.052 * H, 0.032 * H))
        S.ell(f + Vector((0, 0.03 * H, 0.04 * H)), (0.05 * H, 0.05 * H, 0.048 * H))
        b.add('shoe' + side, S.mesh(res=0.007, smooth=3, disp=lambda p: 0.0012 * H * n3(p, 12), target=900), M['feet'], region='k' + side, subdiv=0)
        b.add('shoeSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.012 * H), (0.104 * H, 0.25 * H, 0.026 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
        for i in range(3):  # os cadarços rosa cruzando o peito do pé
            y = f.y - 0.06 * H - i * 0.022 * H
            z = f.z + 0.064 * H - i * 0.008 * H
            b.add(f'lace{side}{i}', rod([(f.x - 0.024 * H, y, z), (f.x + 0.024 * H, y - 0.006 * H, z)], 0.0032 * H, 4), lace, region='k' + side, subdiv=0)

    # ============================================================ CABELO RASPADO (estilo militar): a calota bem rente
    HC = Vector((hc.x, hc.y, hc.z))
    Hr = Sculpt()
    Hr.ell(HC + Vector((0, 0.006 * H, 0.008 * H)), (0.147 * H, 0.159 * H, 0.169 * H))  # a calota rente ao crânio (o miolo fica dentro da cabeça)
    Hr.ell(HC + Vector((0, -0.12 * H, -0.06 * H)), (0.13 * H, 0.09 * H, 0.15 * H), neg=True)  # o rosto livre
    Hr.ell(HC + Vector((0, -0.03 * H, -0.12 * H)), (0.16 * H, 0.16 * H, 0.08 * H), neg=True)  # nada abaixo das orelhas
    for s in (1, -1):  # as orelhas para fora
        Hr.ell(HC + Vector((s * 0.14 * H, 0.0, -0.03 * H)), (0.03 * H, 0.05 * H, 0.06 * H), neg=True)
    b.add('hair', Hr.mesh(res=0.006, smooth=2, disp=lambda p: 0.0012 * H * n3(p, 90), target=2500), hairm, region='head', subdiv=0)

    # ============================================================ os DOIS ANÉIS dos rituais na mão direita (x < 0)
    hR = sk['handR']
    for i, dz in enumerate((-0.035, -0.05)):
        c = hR + Vector((0.0, -0.012 * H + i * 0.014 * H, dz * H))
        b.add(f'ring{i}', rod([(c.x + math.sin(a) * 0.012 * H, c.y + math.cos(a) * 0.012 * H, c.z) for a in [j / 12 * TAU for j in range(13)]],
                              0.0028 * H, 4, caps=False), silver, region='eR', subdiv=0)

    # ============================================================ LUCIANO: a BANDOLEIRA da M4 cruzando o peito
    if variant == 'luciano':
        sling = [(0.16 * H, 0.0, 1.6 * H), (0.12 * H, -0.15 * H, 1.5 * H), (0.0, -0.205 * H, 1.32 * H), (-0.12 * H, -0.18 * H, 1.12 * H),
                 (-0.18 * H, -0.08 * H, 1.02 * H), (-0.17 * H, 0.1 * H, 1.1 * H), (-0.05 * H, 0.165 * H, 1.35 * H), (0.12 * H, 0.12 * H, 1.55 * H), (0.16 * H, 0.0, 1.6 * H)]
        b.add('sling', rod(sling, 0.009 * H, 5, caps=False, flat=(outward((0, 0)), 0.3)), strap, region='torso', subdiv=0)

    b.export(OUT)
    src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
    os.makedirs(src, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, variant + '.blend'), check_existing=False)
