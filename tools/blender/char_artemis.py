"""
ARTEMIS (Artemis Deordelin Rodrigues) — Escriptas (os Marcados do Kian, Calamidade) — public/models/artemis.glb.
Referência: wiki "Artemis" (arte promocional de Calamidade). ALTA (1,90 m) e magra; o cabelo ESCURO DESGRENHADO na
altura do pescoço, com FRANJA; os olhos cinzentos (no rosto: face_artemis); o TOP PRETO curto (barriga de fora); o
MACACÃO-JOGGER CÁQUI/OLIVA com as alças por cima dos ombros, a parte de cima dobrada na cintura e os BOLSOS nas coxas
(onde o Gambá mora); a corrente de PLACAS no pescoço; as botas pretas. O Apache e o rifle ficam em código
(src/models/props.js → addArtemisProps); o Gambá é o companheiro (src/models/gamba.js).
TÉCNICA (a do Rubens e da Beatrice): corpo pelo Builder; top como CASCA; macacão, bolsos, botas e cabelo por ESCULTURA.
  node tools/blender/build.mjs artemis   → public/models/artemis.glb (+ tools/blender/fonte/artemis.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'artemis.glb'
random.seed(190)

b = Builder(width=0.92, bulk=0.9, height=1.055)  # 1,90 m, magra
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_artemis', '#e6c4ae', 0.8)
M = {
    'skin': skin,
    'face': material('face_artemis', '#ffffff', 0.8),
    'torso': skin,
    'arm': skin,
    'hand': skin,
    'legs': material('overall_artemis', '#4e4c30', 0.9),
    'feet': material('boot_artemis', '#141416', 0.55),
}
overall = M['legs']
overall_dk = material('overall_artemis_dk', '#3a3822', 0.9)
top = material('top_artemis', '#141416', 0.85)
hairm = material('hair_artemis', '#1c1618', 0.7)
steel = material('tags_artemis', '#b8bcc4', 0.3, metal=0.9)
sole = material('sole_artemis', '#08080a', 0.8)
strap = material('strap_artemis', '#9a8050', 0.8)  # as alças e faixas cáqui

PREVIEW = {'face_artemis': '#e6c4ae'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.152), (0.0, 0.152), (0.17, 0.13), (0.36, 0.17), (0.47, 0.184), (0.57, 0.108), (0.63, 0.06)],
            arm_r=(0.05, 0.042, 0.036), leg_r=(0.078, 0.06, 0.046), head_r=(0.13, 0.144, 0.158))

# ================================================================ o TOP PRETO curto (do peito até acima do umbigo)
TP = [(0.3, 0.158, 0.124, 0.0), (0.38, 0.178, 0.138, 0.0), (0.46, 0.19, 0.142, 0.0), (0.53, 0.162, 0.124, 0.0)]
rows = [ring_pts(hz + dz * H, (rx + 0.004) * H, (ry + 0.004) * H, 0.0, TAU, 32) for dz, rx, ry, _ in TP]
b.add('top', shell_grid(rows, 0.006), top, region='torso', subdiv=1)
for s in (1, -1):  # as alcinhas do top
    b.add(f'topStrap{s}', rod([(s * 0.07 * H, -0.12 * H, hz + 0.53 * H), (s * 0.085 * H, -0.06 * H, hz + 0.6 * H), (s * 0.085 * H, 0.06 * H, hz + 0.6 * H), (s * 0.07 * H, 0.11 * H, hz + 0.52 * H)], 0.008 * H, 5), top, region='chest', subdiv=0)

# ================================================================ o MACACÃO-JOGGER oliva: pernas largas presas no tornozelo
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k, k.lerp(f, 0.7)], [0.084 * H, 0.074 * H, 0.066 * H, 0.06 * H], step=0.45)
    P.ell(k.lerp(f, 0.78), (0.05 * H, 0.05 * H, 0.03 * H))  # o punho do jogger
    c2 = (l.x, l.y)
    fold = lambda p, c=c2, kz=k.z: 0.0032 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 34 + n3(p, 16), 2) - 0.35) * (1.6 if abs(p.z - kz) < 0.06 * H else 1)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1300), overall, region='leg' + side, subdiv=0)
    # os BOLSOS cargo na lateral da coxa
    sx = 1 if side == 'L' else -1
    pk = l.lerp(k, 0.5)
    b.add('pocket' + side, box((pk.x + sx * 0.078 * H, pk.y - 0.005 * H, pk.z), (0.022 * H, 0.1 * H, 0.12 * H), bevel=0.008), overall_dk, region='leg' + side, subdiv=0)
    b.add('pocketFlap' + side, box((pk.x + sx * 0.084 * H, pk.y - 0.005 * H, pk.z + 0.055 * H), (0.016 * H, 0.104 * H, 0.03 * H), bevel=0.005), overall_dk, region='leg' + side, subdiv=0)
    # as botas pretas
    B = Sculpt()
    B.chain([k.lerp(f, 0.72), f + Vector((0, 0.005 * H, 0.06 * H))], [0.048 * H, 0.046 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.05 * H, 0.115 * H, 0.042 * H))
    B.ell(f + Vector((0, 0.03 * H, 0.04 * H)), (0.046 * H, 0.046 * H, 0.05 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, target=900), M['feet'], region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.014 * H), (0.096 * H, 0.23 * H, 0.03 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
Hp = Sculpt()
Hp.ell(Vector((0, 0.0, hz - 0.01 * H)), (0.168 * H, 0.124 * H, 0.11 * H))
Hp.ell(Vector((0, 0.01 * H, hz + 0.08 * H)), (0.15 * H, 0.112 * H, 0.08 * H))
b.add('overallHip', Hp.mesh(res=0.011, smooth=3, disp=lambda p: 0.0016 * H * n3(p, 14), target=900), overall, region='body', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)
# polimento 2026-11-13 (banner de Calamidade): o macacão VESTIDO, com o PEITILHO até o peito e as ALÇAS cáqui por cima
# dos ombros, cruzando nas costas (antes estava dobrado na cintura)
Wst = Sculpt()
Wst.ell(Vector((0, 0.004 * H, hz + 0.15 * H)), (0.142 * H, 0.112 * H, 0.06 * H))
b.add('overallWaist', Wst.mesh(res=0.01, smooth=3, target=600), overall, region='torso', subdiv=0)
BIB = [(0.1, 0.17, 0.134, 1.15), (0.2, 0.152, 0.126, 0.95), (0.3, 0.17, 0.136, 0.78), (0.41, 0.19, 0.15, 0.6)]
rows = [ring_pts(hz + dz * H, rx * H, ry * H, -a, a, 14) for dz, rx, ry, a in BIB]
b.add('bib', shell_grid(rows, 0.007), overall, region='torso', subdiv=1)
b.add('bibPocket', box((0, -0.152 * H, hz + 0.3 * H), (0.11 * H, 0.008 * H, 0.08 * H), bevel=0.004), overall_dk, region='torso', subdiv=0)
for s in (1, -1):
    tx, ty_ = math.sin(0.6) * 0.19 * H * s, -math.cos(0.6) * 0.15 * H
    b.add(f'bibStrap{s}', rod([(tx, ty_ - 0.004 * H, hz + 0.41 * H), (s * 0.095 * H, -0.1 * H, hz + 0.54 * H), (s * 0.09 * H, -0.02 * H, hz + 0.61 * H),
                               (s * 0.08 * H, 0.07 * H, hz + 0.58 * H), (s * 0.02 * H, 0.13 * H, hz + 0.44 * H), (-s * 0.06 * H, 0.13 * H, hz + 0.24 * H)],
                              0.012 * H, 5, flat=(outward((0, 0)), 0.3)), strap, region='chest', subdiv=0)
    b.add(f'buckle{s}', box((tx, ty_ - 0.012 * H, hz + 0.42 * H), (0.026 * H, 0.008 * H, 0.03 * H), bevel=0.002), steel, region='chest', subdiv=0)
    # a faixa cáqui na lateral da perna (o detalhe claro do banner)
    l, k = sk['l' + ('L' if s == 1 else 'R')], sk['k' + ('L' if s == 1 else 'R')]
    b.add(f'sidePanel{s}', rod([l + Vector((s * 0.082 * H, 0, 0.06 * H)), l.lerp(k, 0.5) + Vector((s * 0.076 * H, 0, 0)), k + Vector((s * 0.066 * H, 0, 0))], 0.012 * H, 5), strap, region='leg' + ('L' if s == 1 else 'R'), subdiv=0)

# ================================================================ a corrente de PLACAS no pescoço
ty = -0.11 * H
b.add('chain', rod([(-0.06 * H, ty + 0.05 * H, 1.6 * H), (-0.035 * H, ty - 0.02 * H, 1.5 * H), (0, ty - 0.035 * H, 1.45 * H),
                    (0.035 * H, ty - 0.02 * H, 1.5 * H), (0.06 * H, ty + 0.05 * H, 1.6 * H)], 0.0022 * H, 4), steel, region='chest', subdiv=0)
for dx, dz in ((-0.008, 0.0), (0.008, -0.006)):
    b.add(f'tag{dx}', box((dx * H, ty - 0.04 * H, 1.42 * H + dz * H), (0.018 * H, 0.004 * H, 0.03 * H), bevel=0.002), steel, region='chest', subdiv=0)

# ================================================================ o CABELO ESCURO DESGRENHADO até o pescoço, com FRANJA
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
Hr = Sculpt()
Hr.ell(Vh(0, 0.01, 0.035), (0.152 * H, 0.165 * H, 0.152 * H))
Hr.ell(Vh(0, 0.05, -0.06), (0.14 * H, 0.12 * H, 0.13 * H))
for i in range(60):  # as mechas desgrenhadas caindo até o pescoço
    th = random.uniform(-2.6, 2.6)
    top = HC + Vector((math.sin(th) * 0.14 * H, -math.cos(th) * 0.15 * H + 0.01 * H, 0.06 * H))
    if abs(th) < 0.9:
        continue
    ln = random.uniform(0.16, 0.24)
    pts = [top + Vector((math.sin(th) * 0.01 * H * t, -math.cos(th) * 0.01 * H * t, -ln * H * t / 4)) for t in range(5)]
    Hr.chain(pts, [0.03 * H, 0.028 * H, 0.024 * H, 0.018 * H, 0.012 * H], step=0.45)
for i in range(9):  # a FRANJA na testa, em pontas irregulares
    x = -0.09 + 0.18 * i / 8
    top = Vh(x, -0.12, 0.1)
    ln = random.uniform(0.06, 0.1)
    Hr.chain([top, top + Vector((0, -0.025 * H, -ln * 0.6 * H)), top + Vector((random.uniform(-0.01, 0.01) * H, -0.03 * H, -ln * H))], [0.024 * H, 0.018 * H, 0.01 * H], step=0.45)
Hr.ell(Vh(0, -0.13, -0.08), (0.11 * H, 0.1 * H, 0.13 * H), neg=True)  # o rosto livre


def shag(p):
    return 0.006 * H * (ridge(p.z / H * 40 + n3(p, 30) * 3, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.006, smooth=2, disp=shag, target=4500), hairm, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'artemis.blend'), check_existing=False)
