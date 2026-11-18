"""
ALÊ — PSIKOLERA (Hexatombe), o teclado da banda (elu) — public/models/ale.glb.
Cânone (wiki "Alê", lore/EQUIPES-HEXATOMBE.md): 25 anos, ~1,75 m; o CABELO LOIRO LONGO com a RAIZ VERMELHO-ALARANJADA;
os olhos azuis; o MACACÃO DE CAMISA DE FORÇA; os PIERCINGS; os PREGOS NA GOLA; o COLAR COM A PEDRA VERMELHA; a
MÁSCARA DE CORPSE PAINT branca e preta (foi Alê quem fez as máscaras da banda).
Aqui: o corpo, o macacão (inteiro, das mangas às pernas), as tiras, a gola com os pregos, o colar, os piercings, o
cabelo e a prop_maskOn (a máscara de corpse paint: só aparece no despertar e no especial da banda). A Lâmina Keytar fica
em código (src/models/weapons.js → laminaKeytar, props.js → addAleProps). Coturnos e tiras = PROPOSTA (as artes não
mostram os pés de perto).
  node tools/blender/build.mjs ale
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, shell_grid, relief, hug
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'ale.glb'
random.seed(25)

b = Builder(width=0.9, bulk=0.86, height=1.0)  # ~1,75 m, esguio
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_ale', '#efd6c6', 0.8)
suit = material('suit_ale', '#d8d0bc', 0.92)  # o macacão de camisa de força (sujeira: textura)
M = {
    'skin': skin,
    'face': material('face_ale', '#ffffff', 0.8),
    'torso': suit,
    'arm': suit,
    'hand': skin,
    'legs': material('legs_ale', '#d8d0bc', 0.92),
    'feet': material('boot_ale', '#18181c', 0.5),
}
suit_dk = material('suit_ale_dk', '#aaa088', 0.92)
strap = material('strap_ale', '#bcb294', 0.85)
metal = material('buckle_ale', '#a0a0a6', 0.35, metal=0.9)
nail = material('nail_ale', '#7a7470', 0.45, metal=0.8)  # os pregos: ferro meio enferrujado
cord = material('cord_ale', '#141414', 0.6)
stone = material('stone_ale', '#c8102a', 0.15, emission='#a00010', strength=0.6)  # a pedra vermelha do colar
pierc = material('pierce_ale', '#d0d0d6', 0.25, metal=0.95)
sole = material('sole_ale', '#0c0c0e', 0.8)
hairm = material('hair_ale', '#e6cf86', 0.65)  # o loiro
rootm = material('hair_ale_root', '#d4541e', 0.7)  # a raiz vermelho-alaranjada
maskw = material('mask_ale', '#f4f2ee', 0.45)
paint = material('paint_ale', '#0c0c0e', 0.6)

PREVIEW = {'face_ale': '#efd6c6'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.154), (0.0, 0.154), (0.18, 0.142), (0.38, 0.186), (0.5, 0.2), (0.6, 0.116), (0.66, 0.064)]
hc = b.body(M, TP, arm_r=(0.058, 0.05, 0.041), leg_r=(0.08, 0.066, 0.054), head_r=(0.126, 0.138, 0.152))


def part(name):
    return next(o for o in b.parts if o.name == name)


TOR = part('torso')
relief(TOR, lambda p: 0.0035 * H * (ridge(p.z / H * 24 + n3(p, 9) * 1.4, 2) - 0.4))
for side in ('L', 'R'):
    relief(part('arm' + side), lambda p: 0.0035 * H * (ridge(p.z / H * 30 + n3(p, 12) * 1.6, 2) - 0.4))
flat = (outward((0, 0)), 0.3)

# ================================================================ as PERNAS do macacão (largas, com dobras) e os COTURNOS
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.06 * H)), l.lerp(k, 0.5), k, k.lerp(f, 0.55)], [0.092 * H, 0.08 * H, 0.074 * H, 0.072 * H], step=0.45)
    fold = lambda p, c=(l.x, l.y): 0.004 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 30 + n3(p, 14), 2) - 0.35)
    b.add('pants' + side, P.mesh(res=0.01, smooth=3, disp=fold, target=1100), M['legs'], region='leg' + side, subdiv=0)
    B = Sculpt()
    B.chain([k.lerp(f, 0.5), f + Vector((0, 0.008 * H, 0.06 * H))], [0.062 * H, 0.058 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.056 * H, 0.122 * H, 0.045 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, target=1000), M['feet'], region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.012 * H), (0.11 * H, 0.26 * H, 0.04 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
    for t in (0.6, 0.78):  # duas fivelas no cano
        c = k.lerp(f, t)
        b.add(f'bootStrap{side}{t}', tube([(c.x, c.y, c.z - 0.008 * H, 0.066 * H, 0.066 * H), (c.x, c.y, c.z + 0.008 * H, 0.066 * H, 0.066 * H)], 16), cord, region='k' + side, subdiv=0)

# ================================================================ o MACACÃO DE CAMISA DE FORÇA: as tiras cruzadas, o cinto e as mangas
for i, zf in enumerate((0.48, 0.34)):
    pts = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, hz + zf * H) for a in [(-0.45 + 0.9 * j / 16) * math.pi for j in range(17)]], 0.008 * H)
    b.add(f'chestStrap{i}', rod(pts, 0.02 * H, 5, flat=flat), strap, region='chest', subdiv=0)
    bk = min(pts, key=lambda v: v.y)
    b.add(f'chestBuckle{i}', box(tuple(bk + Vector((-0.03 * H, -0.006 * H, 0))), (0.036 * H, 0.01 * H, 0.028 * H), bevel=0.003), metal, region='chest', subdiv=0)
belt = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, hz + 0.05 * H) for a in [i / 40 * TAU for i in range(41)]], 0.006 * H)
b.add('belt', rod(belt, 0.022 * H, 6, caps=False, flat=flat), strap, region='torso', subdiv=0)
# o zíper/fecho do macacão: a costura do meio, do pescoço até a cintura
zp = hug(TOR, [(0, -0.3 * H, hz + (0.06 + 0.5 * j / 10) * H) for j in range(11)], 0.004 * H)
b.add('zip', rod(zp, 0.006 * H, 4, flat=flat), suit_dk, region='torso', subdiv=0)
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh, el, hd = sk['s' + side], sk['e' + side], sk['hand' + side]
    for k_, t in enumerate((0.4, 0.72)):
        c = sh.lerp(el, t)
        r = 0.066 * H
        ax = (el - sh).normalized()
        b.add(f'armStrap{side}{k_}', tube(limb_rings(c - ax * 0.012 * H, c + ax * 0.012 * H, r, r, n=1), 16), strap, region='arm' + side, subdiv=0)
    # o punho da manga, largo, e a tira solta pendurada com a fivela
    c = el.lerp(hd, 0.82)
    b.add(f'cuff{side}', tube([(c.x, c.y, c.z - 0.02 * H, 0.054 * H, 0.054 * H), (c.x, c.y, c.z + 0.02 * H, 0.056 * H, 0.056 * H)], 16), suit_dk, region='e' + side, subdiv=0)
    ax = (hd - el).normalized()
    t0 = el + Vector((s * 0.058 * H, -0.01 * H, 0))
    tl = [t0 + ax * 0.05 * H * j for j in range(5)]
    b.add(f'armTail{side}', rod(tl, 0.011 * H, 4, flat=((lambda p, o=Vector((s, 0, 0)): o), 0.3)), strap, region='e' + side, subdiv=0)
    b.add(f'armTailBuckle{side}', box(tuple(tl[-1]), (0.01 * H, 0.026 * H, 0.022 * H), bevel=0.002), metal, region='e' + side, subdiv=0)

# ================================================================ a GOLA COM OS PREGOS
b.add('collar', tube([(0, 0, hz + 0.57 * H, 0.104 * H, 0.092 * H), (0, 0, hz + 0.63 * H, 0.08 * H, 0.076 * H)], 22), suit_dk, region='chest', subdiv=0)
nl = []
for j in range(11):
    a = (j / 11) * TAU
    d = Vector((math.sin(a), -math.cos(a), random.uniform(-0.1, 0.25))).normalized()
    base = Vector((math.sin(a) * 0.088 * H, -math.cos(a) * 0.082 * H, hz + (0.6 + random.uniform(-0.01, 0.015)) * H))
    tip_ = base + d * random.uniform(0.04, 0.055) * H
    nl.append(cone(tuple(base - d * 0.01 * H), tuple(tip_), 0.0045 * H, 5))  # o corpo do prego, fino, para fora
    nl.append(ellipsoid(tuple(base - d * 0.004 * H), (0.009 * H, 0.009 * H, 0.004 * H), 8, 3))  # a cabeça do prego encostada no pano
b.add('collarNails', merge(*nl), nail, region='chest', subdiv=0)

# ================================================================ o COLAR COM A PEDRA VERMELHA
nz = hz + 0.66 * H
loop = [Vector((math.sin(a) * 0.066 * H, -math.cos(a) * 0.062 * H - 0.012 * H * max(0.0, math.cos(a)) * 2.6, nz - 0.07 * H * max(0.0, math.cos(a)) ** 2)) for a in [i / 30 * TAU for i in range(31)]]
b.add('necklace', rod(loop, 0.0035 * H, 4, caps=False), cord, region='chest', subdiv=0)
low = min(loop, key=lambda v: v.z)
b.add('necklaceStone', ellipsoid(tuple(low + Vector((0, -0.012 * H, -0.018 * H))), (0.016 * H, 0.009 * H, 0.022 * H), 10, 6), stone, region='chest', subdiv=0)
b.add('necklaceCap', ellipsoid(tuple(low + Vector((0, -0.01 * H, 0.002 * H))), (0.008 * H, 0.006 * H, 0.006 * H), 8, 4), metal, region='chest', subdiv=0)

# ================================================================ o CABELO LOIRO LONGO, com a RAIZ VERMELHO-ALARANJADA
HC = Vector((hc.x, hc.y, hc.z))
V = lambda x, y, z: HC + Vector((x * H, y * H, z * H))


def hair_weights(p):
    t = smoothstep(sk['hd'].z + 0.02 * H, sk['neck'].z - 0.04 * H, p.z)
    return {'hd': 1 - t, 'chest': t}


def wave(pts, amp, ph):
    return [p + Vector((math.sin(i * 1.3 + ph) * amp * H, 0, 0)) if i > 1 else p for i, p in enumerate(pts)]


# a RAIZ: a calota rente à cabeça, vermelho-alaranjada (aparece no alto e no repartido do meio)
Rt = Sculpt()
Rt.ell(V(0, 0.014, 0.03), (0.142 * H, 0.156 * H, 0.148 * H))
Rt.ell(V(0, -0.125, -0.07), (0.104 * H, 0.1 * H, 0.15 * H), neg=True)
Rt.ell(V(0, 0.01, -0.06), (0.11 * H, 0.12 * H, 0.1 * H), neg=True)
b.add('hairRoot', Rt.mesh(res=0.0065, smooth=2, target=2200), rootm, region='head', subdiv=0)
# o COMPRIMENTO loiro: as mechas saem um pouco abaixo do alto (a raiz fica à mostra em cima) e descem até o meio das costas
Hr = Sculpt()
for s in (1, -1):  # as cortinas da frente, repartidas no meio, até o peito
    for i in range(4):
        u = i / 3
        pts = [V(s * (0.07 + 0.05 * u), -0.07 + 0.06 * u, 0.12), V(s * (0.14 + 0.012 * u), -0.07 + 0.07 * u, 0.0),
               V(s * (0.152 + 0.012 * u), -0.06 + 0.07 * u, -0.13), V(s * (0.16 + 0.01 * u), -0.08 + 0.06 * u, -0.26),
               V(s * (0.165 + 0.012 * u), -0.1 + 0.05 * u, -0.38), V(s * (0.16 + 0.014 * u), -0.11 + 0.04 * u, -0.46 - random.random() * 0.04)]
        Hr.chain(wave(pts, 0.01, i + s), [k * H for k in (0.026, 0.034, 0.034, 0.032, 0.026, 0.008)], step=0.35)
for s in (1, -1):  # os lados atrás das orelhas
    for i in range(4):
        y = 0.02 + i * 0.035
        pts = [V(s * 0.12, y, 0.1), V(s * 0.154, y + 0.01, -0.06), V(s * 0.166, y + 0.04, -0.2), V(s * 0.17, 0.12 + i * 0.01, -0.34), V(s * 0.16, 0.16, -0.5 - random.random() * 0.05)]
        Hr.chain(wave(pts, 0.012, i * 2 + s), [k * H for k in (0.028, 0.032, 0.03, 0.026, 0.008)], step=0.35)
for i in range(11):  # atrás, até o meio das costas
    u = (i - 5) / 5
    x = u * 0.14
    end = -0.56 - (1 - abs(u)) * 0.06 - random.random() * 0.05
    pts = [V(x * 0.8, 0.1, 0.12), V(x, 0.158, -0.04), V(x * 1.05, 0.17, -0.18), V(x * 1.1, 0.19, -0.32), V(x * 1.08, 0.205, -0.45), V(x * 1.04, 0.21, end)]
    Hr.chain(wave(pts, 0.014, i), [k * H for k in (0.03, 0.034, 0.034, 0.03, 0.024, 0.008)], step=0.35)
Hr.ell(V(0, -0.125, -0.07), (0.104 * H, 0.1 * H, 0.15 * H), neg=True)  # o rosto livre


def strands(p):
    a = math.atan2(p.x - HC.x, p.y - HC.y)
    return 0.003 * H * (ridge(a * 26 + n3(p, 18) * 1.6, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.007, smooth=3, disp=strands, target=4200), hairm, region='head', weight_fn=hair_weights, subdiv=0)

# ================================================================ os PIERCINGS: argolas na orelha e no lábio
fz = hc.z
pc = []
for s in (1, -1):
    for k_ in range(2):
        c = V(s * 0.13, 0.0, -0.045 - 0.018 * k_)
        pc.append(rod([c + Vector((0, math.cos(t) * 0.008 * H, math.sin(t) * 0.008 * H)) for t in [j / 10 * TAU for j in range(11)]], 0.0022 * H, 4, caps=False))
c = V(0.016, -0.152, -0.088)  # no lábio de baixo, do lado
pc.append(rod([c + Vector((math.cos(t) * 0.007 * H, -math.sin(t) * 0.004 * H, math.sin(t) * 0.006 * H)) for t in [j / 10 * TAU for j in range(11)]], 0.0022 * H, 4, caps=False))
b.add('piercings', merge(*pc), pierc, region='head', subdiv=0)

# ================================================================ prop_maskOn: a MÁSCARA DE CORPSE PAINT (branca, olhos e boca em preto)
MROWS = [(0.1, 0.1, 0.13, 1.1), (0.05, 0.122, 0.15, 1.25), (0.0, 0.13, 0.158, 1.3), (-0.05, 0.126, 0.158, 1.3), (-0.1, 0.11, 0.15, 1.2), (-0.15, 0.078, 0.13, 1.0)]
rows = [[Vector((math.sin(a_) * rx * H, hc.y - math.cos(a_) * ry * H, fz + dz * H)) for a_ in [-am + 2 * am * i / 18 for i in range(19)]] for dz, rx, ry, am in MROWS]
b.add('prop_maskOnShell', shell_grid(rows, 0.006), maskw, region='head', subdiv=1)
SURF = lambda x, z, off: Vector((x * H, hc.y - math.sqrt(max(0.0, 1 - (x / 0.13) ** 2)) * 0.158 * H - off * H, fz + z * H))
pt = []
for s in (1, -1):
    ex = s * 0.046
    # a mancha preta em volta do olho, puxada em ponta para cima e para baixo (o corpse paint clássico)
    for k_ in range(9):
        t = (k_ - 4) / 4
        pts = [SURF(ex + t * 0.02, 0.05 - abs(t) * 0.02, 0.006), SURF(ex + t * 0.024, 0.005, 0.007), SURF(ex + t * 0.018, -0.04 + abs(t) * 0.015, 0.006)]
        pt.append(rod(pts, [0.006 * H, 0.012 * H, 0.005 * H], 5))
    pt.append(rod([SURF(ex + s * 0.012, 0.05, 0.006), SURF(ex + s * 0.03, 0.095, 0.004)], [0.007 * H, 0.002 * H], 4))  # a ponta da sobrancelha
# o nariz preto e a boca costurada: os traços verticais sobre os lábios
pt.append(ellipsoid(tuple(SURF(0.0, -0.035, 0.012)), (0.012 * H, 0.008 * H, 0.008 * H), 8, 4))
for i in range(7):
    x = -0.03 + 0.06 * i / 6
    pt.append(rod([SURF(x, -0.07, 0.006), SURF(x * 1.1, -0.115 - 0.01 * (1 - abs(x) / 0.03), 0.005)], [0.004 * H, 0.002 * H], 4))
pt.append(rod([SURF(x, -0.092, 0.006) for x in [-0.034 + 0.068 * i / 8 for i in range(9)]], 0.003 * H, 4))
b.add('prop_maskOnPaint', merge(*pt), paint, region='head', subdiv=0)
b.group('prop_maskOn', 'prop_maskOn')

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'ale.blend'), check_existing=False)
