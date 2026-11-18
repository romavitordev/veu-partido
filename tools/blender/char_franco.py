"""
FRANCO — PSIKOLERA (Hexatombe), o guitarrista da banda — public/models/franco.glb.
Cânone (wiki "Franco", lore/EQUIPES-HEXATOMBE.md): 19 anos, ~1,75 m, MAGRO; o cabelo RUIVO espetado; QUEIMADURAS pelo
corpo e a TATUAGEM TRIBAL na panturrilha; a CAMISA DE FORÇA com ESPINHOS NA GOLA, o MANTO CINZA queimado e furado por
cima, a CALÇA ATÉ A CANELA, as CANELEIRAS DE METAL COM ESPINHOS sobre o COTURNO; a MÁSCARA DE GÁS preta com espinhos e
lentes vermelhas, com o tubo ligado a um TANQUE nas costas.
Aqui: o corpo, a roupa, o manto, as caneleiras e o cabelo. A máscara de gás, o tanque e a Guitarra Lança-Chamas ficam em
código (src/models/weapons.js → mascaraFranco / tanqueFranco / guitarraLancaChamas; props.js → addFrancoProps). As
queimaduras e a tatuagem são pintadas (src/models/textures.js: face_franco, skin_franco_leg).
  node tools/blender/build.mjs franco
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, hug
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'franco.glb'
random.seed(19)

b = Builder(width=0.93, bulk=0.88, height=1.0)  # ~1,75 m e magro
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_franco', '#e6b89a', 0.75)  # ruivo: a pele clara
suit = material('suit_franco', '#d6ccb4', 0.92)  # a camisa de força (sangue e queimado: textura)
M = {
    'skin': skin,
    'face': material('face_franco', '#ffffff', 0.8),
    'torso': suit,
    'arm': material('sleeve_franco', '#d6ccb4', 0.92),
    'hand': material('wrap_franco', '#5a2a22', 0.95),
    'legs': material('pants_franco', '#3a3634', 0.9),  # a calça escura até a canela
    'feet': material('boot_franco', '#141416', 0.55),
}
calf = material('skin_franco_leg', '#e6b89a', 0.75)  # a canela de fora, com a tatuagem tribal (textura)
strap = material('strap_franco', '#a89c84', 0.85)
cloak = material('cloak_franco', '#6a6864', 0.95)  # o manto cinza queimado (furos e bordas pretas: textura)
cloakIn = material('cloak_franco_in', '#3a3836', 0.95)
metal = material('buckle_franco', '#9a9a9e', 0.35, metal=0.9)
guard = material('greave_franco', '#5a5a60', 0.4, metal=0.85)
spike = material('spike_franco', '#c8c8cc', 0.3, metal=0.9)
sole = material('sole_franco', '#2a2a2e', 0.7)
hairm = material('hair_franco', '#c8461c', 0.65)  # RUIVO
hairDk = material('hair_franco_dk', '#8a2a10', 0.7)

PREVIEW = {'face_franco': '#e6b89a', 'skin_franco_leg': '#e6b89a'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.158), (0.0, 0.158), (0.18, 0.152), (0.38, 0.2), (0.5, 0.214), (0.6, 0.12), (0.66, 0.066)]
hc = b.body(M, TP, arm_r=(0.064, 0.054, 0.044), leg_r=(0.084, 0.07, 0.058), head_r=(0.126, 0.138, 0.152))


def part(name):
    return next(o for o in b.parts if o.name == name)


def grid(fn, nu, nv, flip=False):
    verts, faces, uvs = [], [], []
    for j in range(nv + 1):
        for i in range(nu + 1):
            verts.append(tuple(fn(i / nu, j / nv)))
            uvs.append((i / nu, 1 - j / nv))
    row = nu + 1
    for j in range(nv):
        for i in range(nu):
            a = j * row + i
            f = (a, a + 1, a + 1 + row, a + row)
            faces.append(tuple(reversed(f)) if flip else f)
    return verts, faces, uvs


def cyl_uv(part_, a, b_):
    v, f, _ = part_
    a, b_ = Vector(a), Vector(b_)
    ax = b_ - a
    L = ax.length
    ax.normalize()
    ref = Vector((0, -1, 0))
    ref = (ref - ax * ref.dot(ax)).normalized()
    ref2 = ax.cross(ref)
    uv = []
    for q in v:
        d = Vector(q) - a
        r = d - ax * d.dot(ax)
        uv.append((math.atan2(r.dot(ref2), r.dot(ref)) / TAU + 0.5, 1 - d.dot(ax) / L))
    return v, f, uv


relief(part('torso'), lambda p: 0.004 * H * (ridge(p.z / H * 22 + n3(p, 9) * 1.4, 2) - 0.4))
for side in ('L', 'R'):
    relief(part('arm' + side), lambda p: 0.004 * H * (ridge(p.z / H * 30 + n3(p, 12) * 1.6, 2) - 0.4))
TOR = part('torso')
flat = (outward((0, 0)), 0.3)

# ================================================================ a CALÇA ATÉ A CANELA, a canela de fora, a CANELEIRA COM ESPINHOS e o COTURNO
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.06 * H)), l.lerp(k, 0.5), k, k.lerp(f, 0.3)], [0.094 * H, 0.08 * H, 0.074 * H, 0.07 * H], step=0.45)
    fold = lambda p, c=(l.x, l.y): 0.004 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 30 + n3(p, 14), 2) - 0.35)
    b.add('pants' + side, P.mesh(res=0.01, smooth=3, disp=fold, target=1100), M['legs'], region='leg' + side, subdiv=0)
    # a barra dobrada no meio da canela
    c = k.lerp(f, 0.3)
    b.add('cuffRoll' + side, tube([(c.x, c.y, c.z - 0.012 * H, 0.072 * H, 0.072 * H), (c.x, c.y, c.z + 0.012 * H, 0.074 * H, 0.074 * H)], 18), M['legs'], region='k' + side, subdiv=0)
    # a CANELA de fora (a tatuagem tribal vai na textura): só a parte entre a barra e o coturno aparece
    C = Sculpt()
    C.chain([k.lerp(f, 0.28), k.lerp(f, 0.62)], [0.05 * H, 0.046 * H], step=0.45)
    b.add('calf' + side, cyl_uv(C.mesh(res=0.007, smooth=3, target=600), k.lerp(f, 0.28), k.lerp(f, 0.62)), calf, region='k' + side, subdiv=0)
    # o COTURNO preto, alto
    B = Sculpt()
    B.chain([k.lerp(f, 0.6), f + Vector((0, 0.008 * H, 0.06 * H))], [0.058 * H, 0.056 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.056 * H, 0.122 * H, 0.045 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, target=1000), M['feet'], region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.012 * H), (0.11 * H, 0.26 * H, 0.034 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
    # a CANELEIRA DE METAL na frente do coturno, com três espinhos
    g0, g1 = k.lerp(f, 0.62), k.lerp(f, 0.92)
    gv = []
    gf = []
    NU = 7
    for j, t in enumerate((0.0, 0.5, 1.0)):
        c = g0.lerp(g1, t)
        for i in range(NU + 1):
            a = (-0.55 + 1.1 * i / NU) * math.pi
            gv.append((c.x + math.sin(a) * 0.066 * H, c.y - math.cos(a) * 0.066 * H, c.z))
    for j in range(2):
        for i in range(NU):
            a0 = j * (NU + 1) + i
            gf.append((a0, a0 + 1, a0 + NU + 2, a0 + NU + 1))
    b.add('greave' + side, (gv, gf, [(0, 0)] * len(gv)), guard, region='k' + side, subdiv=0)
    sp = []
    for t in (0.15, 0.5, 0.85):
        c = g0.lerp(g1, t) + Vector((0, -0.064 * H, 0))
        sp.append(cone(tuple(c), tuple(c + Vector((0, -0.045 * H, 0.008 * H))), 0.011 * H, 6))
    b.add('greaveSpikes' + side, merge(*sp), spike, region='k' + side, subdiv=0)

# ================================================================ a CAMISA DE FORÇA: as tiras no peito, o cinto e as mangas
for i, zf in enumerate((0.5, 0.36)):
    pts = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, hz + zf * H) for a in [(-0.45 + 0.9 * j / 16) * math.pi for j in range(17)]], 0.008 * H)
    b.add(f'chestStrap{i}', rod(pts, 0.02 * H, 5, flat=flat), strap, region='chest', subdiv=0)
    bk = min(pts, key=lambda v: v.y)
    b.add(f'chestBuckle{i}', box(tuple(bk + Vector((0.03 * H, -0.006 * H, 0))), (0.036 * H, 0.01 * H, 0.028 * H), bevel=0.003), metal, region='chest', subdiv=0)
belt = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, hz + 0.05 * H) for a in [i / 40 * TAU for i in range(41)]], 0.006 * H)
b.add('belt', rod(belt, 0.022 * H, 6, caps=False, flat=flat), strap, region='torso', subdiv=0)
for side in ('L', 'R'):
    sh, el, hd = sk['s' + side], sk['e' + side], sk['hand' + side]
    for k_, t in enumerate((0.45, 0.75)):
        c = sh.lerp(el, t)
        r = 0.07 * H
        ax = (el - sh).normalized()
        b.add(f'armStrap{side}{k_}', tube(limb_rings(c - ax * 0.013 * H, c + ax * 0.013 * H, r, r, n=1), 16), strap, region='arm' + side, subdiv=0)

# ================================================================ a GOLA COM ESPINHOS
b.add('collar', tube([(0, 0, hz + 0.57 * H, 0.104 * H, 0.092 * H), (0, 0, hz + 0.625 * H, 0.08 * H, 0.076 * H)], 22), suit, region='chest', subdiv=0)
sp = []
for j in range(14):
    a = j / 14 * TAU
    d = Vector((math.sin(a), -math.cos(a), 0.25)).normalized()
    base = Vector((math.sin(a) * 0.086 * H, -math.cos(a) * 0.08 * H, hz + 0.605 * H))
    sp.append(cone(tuple(base), tuple(base + d * 0.05 * H), 0.009 * H, 6))
b.add('collarSpikes', merge(*sp), spike, region='chest', subdiv=0)

# ================================================================ o MANTO CINZA queimado (dos ombros até o meio da coxa, aberto na frente)
top = hz + 0.6 * H
GAP = 0.3


def cloak_pt(u, v, out=1.0):
    a = (GAP / 2 + u * (1 - GAP)) * TAU
    z = top - v * (top - (hz - 0.32 * H))
    w = 0.25 * H + 0.06 * H * v ** 1.2
    d = 0.16 * H + 0.08 * H * v ** 1.2
    # a barra queimada e rasgada: pontas irregulares embaixo
    if v > 0.85:
        z += (0.04 * H * ridge(u * 23 + 1.3, 3)) * (v - 0.85) / 0.15
    fold = 1 + 0.04 * math.sin(u * TAU * 6) * v
    return Vector((math.sin(a) * w * out * fold, -math.cos(a) * d * out * fold + 0.02 * H, z))


def cloak_w(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.3 * H, p.z) * 0.3
    w_hip = smoothstep(hz + 0.3 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    return {'chest': max(0.0, 1 - w_leg - w_hip), 'hips': w_hip, 'l' + side: w_leg}


b.add('cloak', grid(cloak_pt, 34, 18), cloak, region='body', weight_fn=cloak_w, subdiv=0)
b.add('cloak_in', grid(lambda u, v: cloak_pt(u, v, 0.985), 34, 18, flip=True), cloakIn, region='body', weight_fn=cloak_w, subdiv=0)

# ================================================================ o CABELO RUIVO ESPETADO
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
Hr = Sculpt()
Hr.ell(Vh(0, 0.014, 0.035), (0.138 * H, 0.148 * H, 0.14 * H))
Hr.ell(Vh(0, -0.132, -0.06), (0.11 * H, 0.1 * H, 0.14 * H), neg=True)  # o rosto livre
Hr.ell(Vh(0, 0.04, -0.13), (0.16 * H, 0.16 * H, 0.06 * H), neg=True)
HAIR = b.add('hair', Hr.mesh(res=0.006, smooth=2, target=3000), hairm, region='head', subdiv=0)
S = Sculpt()
for k in range(34):
    # pontos na calota (sem a testa baixa): as pontas saem para fora e para cima
    a = random.uniform(-math.pi * 0.95, math.pi * 0.95)
    el_ = random.uniform(0.15, 1.25)
    d = Vector((math.sin(a) * math.cos(el_), math.cos(a) * math.cos(el_) * 1.05 + 0.15, math.sin(el_) + 0.25)).normalized()
    if d.y < -0.55 and d.z < 0.55:
        continue  # a franja não cobre os olhos
    root = Vh(0, 0.014, 0.035) + Vector((d.x * 0.128 * H, d.y * 0.138 * H, d.z * 0.13 * H))
    L = random.uniform(0.06, 0.1) * H
    tip = root + d * L + Vector((0, 0.02 * H, 0.01 * H))
    S.chain([root, root.lerp(tip, 0.5), tip], [0.024 * H, 0.014 * H, 0.003 * H], step=0.45)
b.add('hairSpikes', S.mesh(res=0.005, smooth=2, target=3500), hairm, region='head', subdiv=0)
# as raízes mais escuras atrás
Rr = Sculpt()
Rr.ell(Vh(0, 0.07, -0.04), (0.12 * H, 0.08 * H, 0.08 * H))
Rr.ell(Vh(0, -0.05, -0.06), (0.14 * H, 0.12 * H, 0.14 * H), neg=True)
b.add('hairNape', Rr.mesh(res=0.006, smooth=2, target=800), hairDk, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'franco.blend'), check_existing=False)
