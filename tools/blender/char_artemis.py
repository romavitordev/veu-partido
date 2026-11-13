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
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief, hug, clothe, smooth_border
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
    'legs': material('overall_artemis', '#433e29', 0.9),  # a calça cargo marrom-oliva escura (banner)
    'feet': material('boot_artemis', '#141416', 0.55),
}
overall = M['legs']
overall_dk = material('overall_artemis_dk', '#302c1e', 0.9)
bibm = material('overall_artemis_bib', '#55553a', 0.9)  # o peitilho e as alças de lona oliva
top = material('top_artemis', '#141416', 0.85)
hairm = material('hair_artemis', '#1c1618', 0.7)
steel = material('tags_artemis', '#b8bcc4', 0.3, metal=0.9)
sole = material('sole_artemis', '#08080a', 0.8)
strap = material('strap_artemis', '#8e7a50', 0.8)  # a bolsa do peito e os painéis cáqui das coxas

PREVIEW = {'face_artemis': '#e6c4ae'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.152), (0.0, 0.152), (0.17, 0.13), (0.36, 0.17), (0.47, 0.184), (0.57, 0.108), (0.63, 0.06)],
            arm_r=(0.05, 0.042, 0.036), leg_r=(0.078, 0.06, 0.046), head_r=(0.13, 0.144, 0.158))

def part(name):
    return next(o for o in b.parts if o.name == name)


# ================================================================ o TOP PRETO curto (do peito até acima do umbigo)
TOR = part('torso')
WT = lambda p: auto_weights(sk, p, 'torso')
k_x = 1.15  # o Builder engrossa o tronco (thick): as medidas abaixo já estão no mundo


def tank_keep(p):
    z = (p.z - hz) / H
    if not 0.1 < z < 0.64:
        return False
    if abs(p.x) > 0.105 * H * k_x and z > 0.43:  # as cavas
        return False
    if p.y < 0 and abs(p.x) < 0.075 * H * k_x and z > 0.5:  # o decote da frente
        return False
    if p.y > 0 and abs(p.x) < 0.06 * H * k_x and z > 0.56:  # o decote das costas
        return False
    return True


# a REGATA PRETA justa (polimento: copiada do tronco, sem a "prateleira" do top antigo); o peitilho cobre a barriga
TOP = b.add('top', clothe(TOR, tank_keep, 0.006 * H, cuts=5), top, region='body', weight_fn=WT, subdiv=0)
smooth_border(TOP)

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
    b.add('pocket' + side, box((pk.x + sx * 0.078 * H, pk.y - 0.005 * H, pk.z - 0.02 * H), (0.022 * H, 0.1 * H, 0.14 * H), bevel=0.008), strap, region='leg' + side, subdiv=0)
    b.add('pocketFlap' + side, box((pk.x + sx * 0.084 * H, pk.y - 0.005 * H, pk.z + 0.045 * H), (0.016 * H, 0.104 * H, 0.03 * H), bevel=0.005), overall_dk, region='leg' + side, subdiv=0)
    # as botas pretas
    B = Sculpt()
    B.chain([k.lerp(f, 0.72), f + Vector((0, 0.005 * H, 0.06 * H))], [0.048 * H, 0.046 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.05 * H, 0.115 * H, 0.042 * H))
    B.ell(f + Vector((0, 0.03 * H, 0.04 * H)), (0.046 * H, 0.046 * H, 0.05 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, target=900), M['feet'], region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.014 * H), (0.096 * H, 0.23 * H, 0.03 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
Hp = Sculpt()
Hp.ell(Vector((0, 0.0, hz - 0.03 * H)), (0.15 * H, 0.112 * H, 0.12 * H))  # o gancho fechado (antes aparecia pele)
Hp.ell(Vector((0, 0.01 * H, hz + 0.08 * H)), (0.14 * H, 0.104 * H, 0.08 * H))
b.add('overallHip', Hp.mesh(res=0.011, smooth=3, disp=lambda p: 0.0016 * H * n3(p, 14), target=900), overall, region='torso', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)
# polimento 2026-11-13 (banner de Calamidade): o macacão VESTIDO, com o PEITILHO até o peito e as ALÇAS cáqui por cima
# dos ombros, cruzando nas costas (antes estava dobrado na cintura)
def bib_keep(p):
    z = (p.z - hz) / H
    return p.y < 0.02 * H and abs(p.x) < (0.135 - 0.04 * max(0.0, z - 0.2) / 0.22) * H * k_x and 0.06 < z < 0.42


BIBO = b.add('bib', clothe(TOR, bib_keep, 0.02 * H, cuts=5), bibm, region='body', weight_fn=WT, subdiv=0)
smooth_border(BIBO)
# a BOLSA grande cáqui no peito, com a aba e a fivela (banner)
pc = hug(BIBO, [(0, -0.3 * H, hz + 0.29 * H)], 0.02 * H)[0]
b.add('bibPocket', box(tuple(pc), (0.15 * H, 0.04 * H, 0.11 * H), bevel=0.008), strap, region='chest', subdiv=0)
b.add('bibFlap', box(tuple(pc + Vector((0, -0.022 * H, 0.04 * H))), (0.155 * H, 0.008 * H, 0.04 * H), bevel=0.003), strap, region='chest', subdiv=0)
b.add('bibClip', box(tuple(pc + Vector((0, -0.028 * H, 0.018 * H))), (0.022 * H, 0.006 * H, 0.026 * H), bevel=0.002), steel, region='chest', subdiv=0)
for s in (1, -1):
    # as ALÇAS de lona: sobem do peitilho, passam por cima do ombro e cruzam nas costas
    c = Vector((s * 0.03 * H, 0, hz + 0.42 * H))
    raw = [(s * 0.085 * H, -0.3 * H, hz + 0.4 * H), (s * 0.09 * H, -0.3 * H, hz + 0.5 * H), (s * 0.095 * H, -0.2 * H, hz + 0.6 * H), (s * 0.095 * H, 0.0, hz + 0.68 * H),
           (s * 0.09 * H, 0.2 * H, hz + 0.6 * H), (s * 0.04 * H, 0.3 * H, hz + 0.44 * H), (-s * 0.05 * H, 0.3 * H, hz + 0.3 * H), (-s * 0.1 * H, 0.3 * H, hz + 0.18 * H)]
    raw = [Vector(raw[i]).lerp(Vector(raw[i + 1]), t / 4) for i in range(len(raw) - 1) for t in range(4)] + [Vector(raw[-1])]  # denso: não corta por dentro
    pts = [hug([TOP, BIBO, TOR], [q], 0.006 * H, center=c)[0] for q in raw[:17]] + hug([TOP, BIBO, TOR], raw[17:], 0.006 * H)
    b.add(f'bibStrap{s}', rod(pts, 0.016 * H, 5, flat=((lambda p, c=c: p - c), 0.3)), bibm, region='chest', subdiv=0)
    bk = pts[4]
    b.add(f'buckle{s}', box(tuple(bk + Vector((0, -0.006 * H, 0))), (0.03 * H, 0.008 * H, 0.032 * H), bevel=0.002), steel, region='chest', subdiv=0)
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
for i in range(120):  # as mechas finas e desgrenhadas até o pescoço, com as pontas viradas para fora
    th = random.uniform(-2.7, 2.7)
    if abs(th) < 0.95:
        continue
    top = HC + Vector((math.sin(th) * 0.142 * H, -math.cos(th) * 0.152 * H + 0.01 * H, random.uniform(0.04, 0.09) * H))
    ln = random.uniform(0.17, 0.25) if abs(th) > 2.0 else random.uniform(0.14, 0.2)
    out = Vector((math.sin(th), -math.cos(th), 0))
    pts = [top + out * (0.008 * H * t + (0.012 * H if t == 4 else 0)) + Vector((0, 0, -ln * H * t / 4 + (0.012 * H if t == 4 else 0))) for t in range(5)]
    Hr.chain(pts, [0.022 * H, 0.02 * H, 0.017 * H, 0.012 * H, 0.006 * H], step=0.45)
Hr.ell(Vh(0, -0.116, 0.108), (0.105 * H, 0.04 * H, 0.04 * H))  # a FRANJA cheia
for i in range(15):  # e as pontas retas, cortadas na altura da sobrancelha
    x = -0.1 + 0.2 * i / 14
    top = Vh(x, -0.125, 0.12)
    ln = 0.05 + random.uniform(-0.006, 0.006) + 0.025 * abs(x) / 0.1
    Hr.chain([top, top + Vector((0, -0.02 * H, -ln * 0.6 * H)), top + Vector((random.uniform(-0.006, 0.006) * H, -0.022 * H, -ln * H))], [0.016 * H, 0.013 * H, 0.007 * H], step=0.45)
Hr.ell(Vh(0, -0.13, -0.08), (0.11 * H, 0.1 * H, 0.13 * H), neg=True)  # o rosto livre


def shag(p):
    return 0.004 * H * (ridge(p.z / H * 40 + n3(p, 30) * 3, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.006, smooth=2, disp=shag, target=4500), hairm, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'artemis.blend'), check_existing=False)
