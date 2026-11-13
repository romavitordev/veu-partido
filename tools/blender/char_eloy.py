"""
ELOY FURTADO — PSIKOLERA (Hexatombe), baterista e fundador da banda — public/models/eloy.glb.
Referências: wiki "Eloy Furtado" (arte conceitual de corpo inteiro e o pôster mascarado "PSIKOLERA - Eloy"):
  - ~1,90 m, MUSCULOSO; o cabelo CASTANHO LISO até os ombros com mechas caindo no rosto; os olhos verdes (face_eloy);
  - o MACACÃO DE CAMISA DE FORÇA inteiro, bege-acinzentado, com as FAIXAS CRUZADAS no peito e a faixa vertical presa na
    gola pelo CADEADO; a gola rasgada com PONTAS nos ombros; as mangas RASGADAS (os braços de fora, com as cicatrizes
    de corte) e as FIVELAS SOLTAS penduradas; as FAIXAS nas mãos e nos antebraços; a barra larga e rasgada; o tênis
    tipo all star;
  - prop_maskOn: a FOCINHEIRA preta de espinhos na metade de baixo do rosto e os olhos TODOS BRANCOS — aparece na
    habilidade Focinheira (o ritmo descontrolado). As baquetas ficam em código (src/models/props.js → addEloyProps).
TÉCNICA (a da Artemis): corpo pelo Builder; macacão como o próprio corpo com relevo; faixas por rod; cabelo por ESCULTURA.
  node tools/blender/build.mjs eloy   → public/models/eloy.glb (+ tools/blender/fonte/eloy.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief, hug
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'eloy.glb'
random.seed(25)

b = Builder(width=1.04, bulk=1.06, height=1.055)  # ~1,90 m, musculoso
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_eloy', '#e0b898', 0.8)
suit = material('suit_eloy', '#8c8768', 0.92)  # o macacão de camisa de força cáqui-oliva acinzentado (pôster)
M = {
    'skin': skin,
    'face': material('face_eloy', '#ffffff', 0.8),
    'torso': suit,
    'arm': material('arm_eloy', '#ffffff', 0.8),  # os braços de fora com as cicatrizes de corte (textura)
    'hand': material('wrap_eloy', '#e6dcc4', 0.95),  # as faixas nas mãos
    'legs': suit,
    'feet': material('shoe_eloy', '#1a1a20', 0.7),
}
suit_dk = material('suit_eloy_dk', '#5f5b46', 0.92)
strap = material('strap_eloy', '#6e6a54', 0.85)  # as faixas um tom abaixo do tecido (arte conceitual)
wrap = M['hand']
metal = material('buckle_eloy', '#a8a8ac', 0.35, metal=0.9)
lock = material('lock_eloy', '#8a7a4a', 0.35, metal=0.9)
sole = material('sole_eloy', '#ece8de', 0.7)
hairm = material('hair_eloy', '#4a3020', 0.7)
muz = material('muzzle_eloy', '#121214', 0.45, metal=0.3)
spike = material('spike_eloy', '#c8c8cc', 0.3, metal=0.9)
eyew = material('eyes_eloy', '#f4f4f0', 0.4, emission='#ffffff', strength=0.6)

PREVIEW = {'face_eloy': '#e0b898', 'arm_eloy': '#e0b898'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.17), (0.0, 0.17), (0.18, 0.168), (0.38, 0.22), (0.5, 0.236), (0.6, 0.128), (0.66, 0.072)]
hc = b.body(M, TP, arm_r=(0.07, 0.058, 0.047), leg_r=(0.094, 0.078, 0.066), head_r=(0.135, 0.146, 0.16))


def part(name):
    return next(o for o in b.parts if o.name == name)


# o tecido grosso: dobras no tronco e nas pernas largas
relief(part('torso'), lambda p: 0.004 * H * (ridge(p.z / H * 22 + n3(p, 9) * 1.4, 2) - 0.4))
for side in ('L', 'R'):
    relief(part('leg' + side), lambda p: 0.005 * H * (ridge(p.z / H * 26 + math.atan2(p.x, p.y) * 3 + n3(p, 11) * 1.6, 2) - 0.4))

# ================================================================ as pernas LARGAS do macacão e a barra rasgada
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.06 * H)), l.lerp(k, 0.5), k, k.lerp(f, 0.55), k.lerp(f, 0.82)], [0.098 * H, 0.084 * H, 0.078 * H, 0.072 * H, 0.07 * H], step=0.45)
    fold = lambda p, c=(l.x, l.y): 0.004 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 30 + n3(p, 14), 2) - 0.35)
    b.add('pants' + side, P.mesh(res=0.01, smooth=3, disp=fold, target=1300), suit, region='leg' + side, subdiv=0)
    # a barra RASGADA: tiras penduradas
    bz = k.lerp(f, 0.84)
    for i in range(7):
        a = i / 7 * TAU + random.uniform(-0.2, 0.2)
        d = Vector((math.sin(a), -math.cos(a), 0))
        p0 = Vector((bz.x, bz.y, bz.z)) + d * 0.076 * H
        ln = random.uniform(0.03, 0.06) * H
        b.add(f'hem{side}{i}', rod([p0, p0 + d * 0.006 * H + Vector((0, 0, -ln))], [0.012 * H, 0.004 * H], 4), suit_dk, region='k' + side, subdiv=0)
    if side == 'L':  # a barra DOBRADA (enrolada) na perna esquerda
        cz = k.lerp(f, 0.68)
        b.add('cuffL', tube([(cz.x, cz.y, cz.z - 0.025 * H, 0.08 * H, 0.08 * H), (cz.x, cz.y, cz.z, 0.088 * H, 0.088 * H), (cz.x, cz.y, cz.z + 0.025 * H, 0.08 * H, 0.08 * H)], 18), suit_dk, region='k' + side, subdiv=0)
    # o tênis tipo ALL STAR: cano até o tornozelo, a biqueira e a sola brancas
    sx = f.x
    B = Sculpt()
    B.chain([f + Vector((0, 0.01 * H, 0.08 * H)), f + Vector((0, 0.005 * H, 0.04 * H))], [0.046 * H, 0.046 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.05 * H, 0.12 * H, 0.04 * H))
    b.add('shoe' + side, B.mesh(res=0.007, smooth=3, target=900), M['feet'], region='k' + side, subdiv=0)
    b.add('shoeSole' + side, sole_part((sx, f.y - 0.045 * H, f.z - 0.012 * H), (0.1 * H, 0.25 * H, 0.032 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
    b.add('shoeToe' + side, ellipsoid((sx, f.y - 0.15 * H, f.z + 0.012 * H), (0.044 * H, 0.04 * H, 0.026 * H), 12, 8), sole, region='k' + side, subdiv=0)

# ================================================================ o ARNÊS da camisa de força (pôster + arte conceitual)
TOR = part('torso')
flat = (outward((0, 0)), 0.3)
# as duas faixas dos OMBROS descendo em V até o CADEADO central, logo abaixo da gola
lockz = hz + 0.46 * H
for s in (1, -1):
    v = hug(TOR, [(s * 0.19 * H, -0.04 * H, hz + 0.58 * H), (s * 0.16 * H, -0.12 * H, hz + 0.55 * H), (s * 0.09 * H, -0.2 * H, hz + 0.5 * H), (s * 0.014 * H, -0.2 * H, lockz + 0.01 * H)], 0.006 * H)
    b.add(f'vStrap{s}', rod(v, 0.017 * H, 5, flat=flat), strap, region='chest', subdiv=0)
    # nas costas, as faixas cruzando em X
    bk = hug(TOR, [(s * 0.15 * H, 0.03 * H, hz + 0.6 * H), (s * 0.08 * H, 0.2 * H, hz + 0.46 * H), (0, 0.2 * H, hz + 0.36 * H), (-s * 0.09 * H, 0.2 * H, hz + 0.24 * H), (-s * 0.16 * H, 0.1 * H, hz + 0.14 * H)], 0.006 * H)
    b.add(f'crossBack{s}', rod(bk, 0.016 * H, 5, flat=flat), strap, region='chest', subdiv=0)
# a FAIXA LARGA enrolada no peito (abraça o tronco todo)
for z, w in ((hz + 0.4 * H, 0.03 * H), (hz + 0.24 * H, 0.02 * H)):
    ring = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, z) for a in [i / 40 * TAU for i in range(41)]], 0.007 * H)
    b.add(f'chestBand{int(w * 1000)}', rod(ring, w, 6, caps=False, flat=flat), strap, region='chest', subdiv=0)
# o ZÍPER no meio, da gola até o cinto
zp = hug(TOR, [(0, -0.2 * H, z) for z in [hz + 0.08 * H + 0.5 * H * i / 10 for i in range(11)]], 0.004 * H)
b.add('zipper', rod(zp, 0.006 * H, 5), metal, region='chest', subdiv=0)
# o cinto e a fivela
BELT = b.add('belt', tube([(0, 0.004 * H, hz + 0.03 * H, 0.182 * H, 0.15 * H), (0, 0.004 * H, hz + 0.07 * H, 0.18 * H, 0.148 * H)], 24), strap, region='torso', subdiv=0)
b.add('beltBuckle', box((0, -0.156 * H, hz + 0.05 * H), (0.05 * H, 0.012 * H, 0.04 * H), bevel=0.003), metal, region='torso', subdiv=0)
# as FAIXAS PENDURADAS na frente da cintura: duas curtas com fivela e uma longa com a ponta triangular
for i, (x, ln) in enumerate(((0.07, 0.13), (-0.035, 0.11), (-0.1, 0.27))):
    pts = [Vector((x * H + 0.004 * H * k * (1 if i % 2 else -1), -0.3 * H, hz + 0.04 * H - ln * H * k / 4)) for k in range(5)]
    pts = hug([TOR, BELT, part('pantsL'), part('pantsR')], pts, 0.014 * H)
    b.add(f'hang{i}', rod(pts, 0.013 * H, 4, flat=((lambda p: Vector((0, -1, 0))), 0.3)), strap, region='hips', subdiv=0)
    e = pts[-1]
    if i == 2:  # a ponta triangular de metal
        b.add('hangTip', cone(e + Vector((0, 0, 0.005 * H)), e + Vector((0, 0, -0.04 * H)), 0.016 * H, 3), metal, region='hips', subdiv=0)
    else:
        b.add(f'hangBuckle{i}', box(tuple(e + Vector((0, 0, 0.02 * H))), (0.03 * H, 0.008 * H, 0.026 * H), bevel=0.002), metal, region='hips', subdiv=0)
# o CADEADO no encontro das faixas do peito
lk = hug(TOR, [(0, -0.2 * H, lockz)], 0.02 * H)[0]
b.add('padlock', box(tuple(lk), (0.036 * H, 0.018 * H, 0.034 * H), bevel=0.004), lock, region='chest', subdiv=0)
b.add('padlockShackle', rod([lk + Vector((sx_ * 0.011 * H, 0, dz * H)) for sx_, dz in ((-1, 0.016), (-1, 0.036), (1, 0.036), (1, 0.016))], 0.0035 * H, 5), metal, region='chest', subdiv=0)

# ================================================================ a GOLA RASGADA com PONTAS nos ombros
for i in range(22):
    a = i / 22 * TAU
    if abs(math.sin(a / 2)) < 0.1:  # a frente da gola fica livre para o cadeado
        continue
    d = Vector((math.sin(a), -math.cos(a), 0))
    rx = 0.1 * H + 0.12 * H * abs(math.sin(a)) ** 1.5
    base = Vector((0, 0, hz + 0.6 * H)) + Vector((d.x * rx, d.y * 0.1 * H, -0.03 * H * abs(math.sin(a))))
    tip = base + d * random.uniform(0.04, 0.07) * H + Vector((0, 0, random.uniform(0.0, 0.05) * H))
    b.add(f'collar{i}', cone(base, tip, 0.024 * H, 5), suit_dk, region='chest', subdiv=0)
b.add('collarRing', tube([(0, 0, hz + 0.58 * H, 0.12 * H, 0.1 * H), (0, 0, hz + 0.63 * H, 0.085 * H, 0.08 * H)], 20), suit, region='chest', subdiv=0)

# ================================================================ as MANGAS RASGADAS (só o toco no ombro) e as FIVELAS SOLTAS penduradas
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh, el = sk['s' + side], sk['e' + side]
    St = Sculpt()
    St.chain([sh + Vector((-s * 0.01 * H, 0, 0.02 * H)), sh.lerp(el, 0.35)], [0.066 * H, 0.062 * H], step=0.45)
    b.add('sleeve' + side, St.mesh(res=0.009, smooth=3, disp=lambda p: 0.004 * H * (ridge(p.z / H * 30 + n3(p, 12), 2) - 0.4), target=700), suit, region='arm' + side, subdiv=0)
    cz = sh.lerp(el, 0.36)
    for i in range(6):  # a borda rasgada
        a = i / 6 * TAU + random.uniform(-0.3, 0.3)
        d = Vector((math.cos(a) * s, math.sin(a), 0))
        p0 = cz + d * 0.08 * H
        b.add(f'tear{side}{i}', rod([p0, p0 + Vector((0, 0, -random.uniform(0.025, 0.05) * H))], [0.011 * H, 0.003 * H], 4), suit_dk, region='arm' + side, subdiv=0)
    # a faixa solta com a fivela, pendurada do braço
    p0 = sh.lerp(el, 0.3) + Vector((s * 0.07 * H, -0.02 * H, 0))
    b.add('looseStrap' + side, rod([p0, p0 + Vector((s * 0.02 * H, -0.01 * H, -0.08 * H)), p0 + Vector((s * 0.01 * H, -0.015 * H, -0.16 * H))], 0.011 * H, 4, flat=(outward((0, 0)), 0.3)), strap, region='arm' + side, subdiv=0)
    b.add('looseBuckle' + side, box(tuple(p0 + Vector((s * 0.012 * H, -0.015 * H, -0.165 * H))), (0.022 * H, 0.008 * H, 0.024 * H), bevel=0.002), metal, region='arm' + side, subdiv=0)
    # as FAIXAS enroladas no antebraço (do pulso até perto do cotovelo)
    hd = sk['hand' + side]
    for k in range(7):
        t = 0.2 + 0.1 * k
        c = el.lerp(hd, t)
        r = (0.052 - 0.006 * t) * H
        tilt = 0.02 * H * (1 if k % 2 else -1)
        b.add(f'wrap{side}{k}', tube([(c.x, c.y, c.z - 0.012 * H + tilt, r, r), (c.x, c.y, c.z + 0.012 * H - tilt, r, r)], 14), wrap, region='e' + side, subdiv=0)

# ================================================================ o CABELO CASTANHO LISO até os ombros, com mechas no rosto
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
Hr = Sculpt()
Hr.ell(Vh(0, 0.012, 0.035), (0.15 * H, 0.162 * H, 0.15 * H))
Hr.ell(Vh(0, 0.05, -0.05), (0.145 * H, 0.12 * H, 0.14 * H))
for i in range(70):  # as mechas lisas caindo até os ombros
    th = random.uniform(-2.8, 2.8)
    if abs(th) < 1.0:
        continue
    top = HC + Vector((math.sin(th) * 0.14 * H, -math.cos(th) * 0.15 * H + 0.01 * H, 0.08 * H))
    ln = random.uniform(0.26, 0.34)
    pts = [top + Vector((math.sin(th) * 0.012 * H * t, -math.cos(th) * 0.008 * H * t + 0.004 * H * t, -ln * H * t / 4)) for t in range(5)]
    Hr.chain(pts, [0.03 * H, 0.028 * H, 0.025 * H, 0.02 * H, 0.012 * H], step=0.45)
for x, ln in ((-0.085, 0.16), (0.09, 0.19)):  # as MECHAS caindo dos lados do rosto
    top = Vh(x, -0.13, 0.11)
    Hr.chain([top, top + Vector((0, -0.03 * H, -ln * 0.5 * H)), top + Vector((x * 0.2 * H, -0.035 * H, -ln * H))], [0.016 * H, 0.012 * H, 0.006 * H], step=0.45)
for sx in (1, -1):  # a franja repartida no meio, caindo para os lados da testa
    Hr.chain([Vh(sx * 0.01, -0.12, 0.13), Vh(sx * 0.05, -0.14, 0.1), Vh(sx * 0.09, -0.135, 0.05), Vh(sx * 0.11, -0.12, 0.0)], [0.026 * H, 0.022 * H, 0.016 * H, 0.01 * H], step=0.45)
Hr.ell(Vh(0, -0.135, -0.045), (0.108 * H, 0.1 * H, 0.13 * H), neg=True)


def straight(p):
    return 0.004 * H * (ridge(math.atan2(p.x - HC.x, p.y - HC.y) * 18 + n3(p, 30) * 2, 2) - 0.4)


HAIR = b.add('hair', Hr.mesh(res=0.006, smooth=2, disp=straight, target=4500), hairm, region='head', subdiv=0)

# ================================================================ prop_maskOn: a FOCINHEIRA de espinhos + os olhos BRANCOS
fz = hc.z - 0.065 * H
mask_parts = []
# a casca preta da focinheira: do nariz ao queixo, contornando a frente do rosto
MROWS = [(-0.07, 0.1, 0.142, 1.25), (-0.035, 0.118, 0.158, 1.35), (0.0, 0.126, 0.165, 1.4), (0.035, 0.124, 0.166, 1.35)]
rows = [[Vector((math.sin(a_) * rx * H, hc.y - math.cos(a_) * ry * H, fz + dz * H)) for a_ in [-am + 2 * am * i / 16 for i in range(17)]] for dz, rx, ry, am in MROWS]
b.add('prop_maskOnShell', shell_grid(rows, 0.008), muz, region='head', subdiv=1)
for i in range(5):  # os espinhos da frente
    for j in range(2):
        a = -0.75 + 1.5 * i / 4
        d = Vector((math.sin(a), -math.cos(a), 0))
        base = Vector((0, hc.y, fz + (0.015 - 0.04 * j) * H)) + Vector((d.x * 0.122 * H, d.y * 0.162 * H, 0))
        mask_parts.append(cone(base, base + d * 0.03 * H, 0.009 * H, 6))
mask_parts.append(rod([(s * 0.11 * H, -0.03 * H, fz + 0.02 * H) for s in (1,)] + [(0.13 * H, 0.06 * H, fz + 0.04 * H), (0, 0.15 * H, fz + 0.05 * H), (-0.13 * H, 0.06 * H, fz + 0.04 * H), (-0.11 * H, -0.03 * H, fz + 0.02 * H)], 0.008 * H, 5))
b.add('prop_maskOnSpikes', merge(*mask_parts), spike, region='head', subdiv=0)
hp = hug([HAIR, part('head')], [HC + Vector((0, -math.cos(a) * 0.2 * H, math.sin(a) * 0.2 * H)) for a in [-0.22 + (math.pi + 0.1) * i / 16 for i in range(17)]], 0.006 * H, center=HC)
b.add('prop_maskOnHarness', rod(hp, 0.014 * H, 5, flat=((lambda p: p - HC), 0.35)), muz, region='head', subdiv=0)
top = max(hp, key=lambda v: v.z)
mask_parts.append(cone(top - Vector((0, 0, 0.01 * H)), top + Vector((0, 0.01 * H, 0.07 * H)), 0.018 * H, 6))
eyes = [ellipsoid((s * 0.045 * H, hc.y - 0.137 * H, hc.z + 0.004 * H), (0.022 * H, 0.008 * H, 0.012 * H), 10, 6) for s in (1, -1)]
b.add('prop_maskOnEyes', merge(*eyes), eyew, region='head', subdiv=0)
b.group('prop_maskOn', 'prop_maskOn')  # uma peça só (dois materiais): o jogo liga e desliga junto

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'eloy.blend'), check_existing=False)
