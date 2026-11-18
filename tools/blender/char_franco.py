"""
FRANCO — PSIKOLERA (Hexatombe), o guitarrista da banda — public/models/franco.glb.
Refeito em 2026-11-18 (dono: "estão bem feios") pelas artes oficiais da wiki "Franco": "Arte Franco com Guitarra" (de
frente e de costas) e "Arte Franco sem Máscara":
  - ~1,75 m, MAGRO; o cabelo RUIVO-ACOBREADO desgrenhado e espetado, médio (mechas na testa e na nuca); olhos verdes,
    sardas, QUEIMADURAS (face_franco); piercings na sobrancelha, na glabela e no lábio, brincos;
  - o MACACÃO DE CAMISA DE FORÇA creme encardido, de pernas BUFANTES que terminam LOGO ACIMA DO JOELHO; a GOLA ALTA com
    ESPINHOS curtos; as faixas HORIZONTAIS que abraçam o peito, a faixa VERTICAL do meio com a fivela;
  - as TIRAS RASGADAS penduradas dos braços (o "manto cinza queimado" da descrição: farrapos chamuscados); as
    BRAÇADEIRAS de couro marrom nos antebraços e as luvas sem dedo;
  - as JOELHEIRAS redondas de couro marrom com as CORRENTES entre elas; os COTURNOS MARRONS até o joelho com as
    CANELEIRAS cheias de ESPINHOS de metal;
  - o ARNÊS nas costas segurando o TANQUE (o tanque é peça de código: tanqueFranco).
A máscara de gás, o tanque e a Guitarra Lança-Chamas ficam em código (src/models/weapons.js; props.js → addFrancoProps).
  pelo Blender MCP: exec(open(r"E:/arena paranormal/tools/blender/mcp_build.py").read()); mcp_build("franco")
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, hug, chain_mesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'franco.glb'
random.seed(19)

b = Builder(width=0.9, bulk=0.86, height=1.0)  # ~1,75 m e magro
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_franco', '#e8bea2', 0.75)  # ruivo: a pele clara
suit = material('suit_franco', '#d4ccb6', 0.92)  # o macacão creme encardido (chamuscado: textura)
M = {
    'skin': skin,
    'face': material('face_franco', '#ffffff', 0.8),
    'torso': suit,
    'arm': material('sleeve_franco', '#d4ccb6', 0.92),
    'hand': material('glove_franco', '#3a2a22', 0.8),  # a luva sem dedo
    'legs': material('pants_franco', '#d4ccb6', 0.92),  # as pernas do macacão
    'feet': material('boot_franco', '#4a2c22', 0.6),  # o coturno marrom
}
suit_dk = material('suit_franco_dk', '#aaa08a', 0.92)
strap = material('strap_franco', '#c2b89c', 0.85)
rag = material('cloak_franco', '#bcb4a2', 0.95)  # os farrapos queimados (furos e bordas pretas: textura)
leather = material('leather_franco', '#5a3424', 0.6)  # joelheiras e braçadeiras
metal = material('buckle_franco', '#9a9a9e', 0.35, metal=0.9)
spike = material('spike_franco', '#c8c8cc', 0.3, metal=0.9)
chainm = material('chain_franco', '#7a7a80', 0.35, metal=0.9)
sole = material('sole_franco', '#1a1414', 0.7)
harness = material('harness_franco', '#2a2420', 0.7)
hairm = material('hair_franco', '#9a3c18', 0.65)  # ruivo-acobreado
hairDk = material('hair_franco_dk', '#6a2410', 0.7)
pierc = material('pierce_franco', '#d0d0d6', 0.25, metal=0.95)

PREVIEW = {'face_franco': '#e8bea2'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.158), (0.0, 0.158), (0.18, 0.15), (0.38, 0.196), (0.5, 0.21), (0.6, 0.12), (0.66, 0.066)]
hc = b.body(M, TP, arm_r=(0.064, 0.056, 0.046), leg_r=(0.084, 0.07, 0.058), head_r=(0.124, 0.136, 0.15))


def part(name):
    return next(o for o in b.parts if o.name == name)


TOR = part('torso')
relief(TOR, lambda p: 0.004 * H * (ridge(p.z / H * 22 + n3(p, 9) * 1.4, 2) - 0.4))
for side in ('L', 'R'):
    relief(part('arm' + side), lambda p: 0.004 * H * (ridge(p.z / H * 30 + n3(p, 12) * 1.6, 2) - 0.4))
flat = (outward((0, 0)), 0.3)

# ================================================================ as pernas BUFANTES do macacão (até logo acima do joelho)
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.06 * H)), l.lerp(k, 0.45), l.lerp(k, 0.74)], [0.088 * H, 0.09 * H, 0.084 * H], step=0.45)
    P.ell(l.lerp(k, 0.76), (0.082 * H, 0.082 * H, 0.042 * H))  # a barra franzida
    fold = lambda p, c=(l.x, l.y): 0.006 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 5 + p.z / H * 26 + n3(p, 14), 2) - 0.35)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
    for i in range(6):  # a barra em tiras soltas
        a = (i / 6) * TAU + 0.3
        p0 = l.lerp(k, 0.78) + Vector((math.sin(a) * 0.08 * H, -math.cos(a) * 0.08 * H, 0))
        b.add(f'pantsRag{side}{i}', rod([p0, p0 + Vector((0, 0, -random.uniform(0.03, 0.06) * H))], [0.012 * H, 0.003 * H], 4), suit_dk, region='leg' + side, subdiv=0)
    # a JOELHEIRA redonda de couro
    b.add('kneePad' + side, ellipsoid(tuple(k + Vector((0, -0.05 * H, 0.004 * H))), (0.07 * H, 0.04 * H, 0.072 * H), 14, 10), leather, region='k' + side, subdiv=0)
    b.add('kneeRim' + side, tube([(k.x, k.y - 0.074 * H, k.z - 0.004 * H, 0.06 * H, 0.06 * H), (k.x, k.y - 0.07 * H, k.z + 0.004 * H, 0.064 * H, 0.064 * H)], 16), harness, region='k' + side, subdiv=0)
    # o COTURNO marrom até o joelho
    B = Sculpt()
    B.chain([k + Vector((0, 0, -0.04 * H)), k.lerp(f, 0.5), f + Vector((0, 0.005 * H, 0.07 * H))], [0.07 * H, 0.062 * H, 0.06 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.035 * H)), (0.06 * H, 0.124 * H, 0.05 * H))
    bootfold = lambda p: 0.003 * H * (ridge(p.z / H * 60 + n3(p, 20), 2) - 0.4)
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, disp=bootfold, target=1300), M['feet'], region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.016 * H), (0.12 * H, 0.27 * H, 0.045 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
    for i in range(3):  # as cintas do cano
        c = k.lerp(f, 0.25 + 0.22 * i)
        r = (0.072 - 0.004 * i) * H
        b.add(f'bootStrap{side}{i}', tube([(c.x, c.y, c.z - 0.01 * H, r, r), (c.x, c.y, c.z + 0.01 * H, r, r)], 16), harness, region='k' + side, subdiv=0)
    # a CANELEIRA de ESPINHOS: fileiras de espinhos na frente e do lado de fora do cano
    sp = []
    for row in range(7):
        t = 0.12 + row * 0.11
        c = k.lerp(f, t)
        r = (0.07 - 0.006 * t) * H
        for a in (-0.45, -0.1, 0.25, 0.6, 0.95, 1.3):
            a2 = a * s + (0.08 if row % 2 else -0.08)
            d = Vector((math.sin(a2), -math.cos(a2), 0.15)).normalized()
            base = c + Vector((math.sin(a2) * r, -math.cos(a2) * r, 0))
            sp.append(cone(tuple(base), tuple(base + d * random.uniform(0.026, 0.04) * H), 0.0065 * H, 5))
    b.add('bootSpikes' + side, merge(*sp), spike, region='k' + side, subdiv=0)
# as CORRENTES penduradas da frente do quadril até as joelheiras
for s in (1, -1):
    kk = sk['kL' if s > 0 else 'kR']
    a = kk + Vector((-s * 0.05 * H, -0.06 * H, 0.03 * H))
    bb = Vector((0, -0.12 * H, hz - 0.12 * H))
    path = [a.lerp(bb, t) + Vector((0, -0.01 * H, -0.07 * H * math.sin(t * math.pi))) for t in [i / 6 for i in range(7)]]
    b.add(f'kneeChain{s}', chain_mesh(path, link=0.024 * H, r=0.0032 * H), chainm, region='hips', subdiv=0)

# ================================================================ a CAMISA DE FORÇA: as faixas horizontais, a faixa vertical e a fivela
for i, zf in enumerate((0.52, 0.44, 0.36)):
    ring = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, hz + zf * H) for a in [j / 40 * TAU for j in range(41)]], 0.007 * H)
    b.add(f'chestBand{i}', rod(ring, 0.017 * H, 6, caps=False, flat=flat), strap, region='chest', subdiv=0)
vt = hug(TOR, [(0, -0.3 * H, z) for z in [hz + 0.6 * H - 0.6 * H * i / 12 for i in range(13)]], 0.008 * H)
b.add('vStrap', rod(vt, 0.014 * H, 5, flat=flat), strap, region='chest', subdiv=0)
bk = hug(TOR, [(0, -0.3 * H, hz + 0.56 * H)], 0.014 * H)[0]
b.add('vBuckle', rod([bk + Vector((math.sin(t) * 0.018 * H, -0.003 * H, math.cos(t) * 0.022 * H)) for t in [i / 14 * TAU for i in range(15)]], 0.0045 * H, 5, caps=False), metal, region='chest', subdiv=0)
tipv = vt[-1]
b.add('vTip', cone(tuple(tipv + Vector((0, -0.004 * H, 0.006 * H))), tuple(tipv + Vector((0, -0.004 * H, -0.04 * H))), 0.016 * H, 3), metal, region='hips', subdiv=0)
belt = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, hz + 0.06 * H) for a in [i / 40 * TAU for i in range(41)]], 0.006 * H)
b.add('belt', rod(belt, 0.016 * H, 6, caps=False, flat=flat), strap, region='torso', subdiv=0)
# o ARNÊS do tanque: duas alças grossas dos ombros às costas
for s in (1, -1):
    hp = hug(TOR, [(s * 0.1 * H, -0.3 * H, hz + 0.5 * H), (s * 0.12 * H, -0.3 * H, hz + 0.6 * H), (s * 0.12 * H, 0.3 * H, hz + 0.6 * H), (s * 0.1 * H, 0.3 * H, hz + 0.45 * H), (s * 0.1 * H, 0.3 * H, hz + 0.2 * H)], 0.008 * H)
    b.add(f'harness{s}', rod(hp, 0.022 * H, 5, flat=flat), harness, region='chest', subdiv=0)

# ================================================================ os braços: faixas, BRAÇADEIRAS de couro e os FARRAPOS queimados pendurados
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh, el, hd = sk['s' + side], sk['e' + side], sk['hand' + side]
    ax = (el - sh).normalized()
    for k_, t in enumerate((0.3, 0.62)):
        c = sh.lerp(el, t)
        r = 0.07 * H
        b.add(f'armBand{side}{k_}', tube(limb_rings(c - ax * 0.011 * H, c + ax * 0.011 * H, r, r, n=1), 16), strap, region='arm' + side, subdiv=0)
    fa = (hd - el).normalized()
    a0, a1 = el.lerp(hd, 0.3), el.lerp(hd, 0.88)
    b.add(f'bracer{side}', tube(limb_rings(a0, a1, 0.06 * H, 0.056 * H, n=3), 16), leather, region='e' + side, subdiv=0)
    for t in (0.4, 0.62, 0.82):
        c = el.lerp(hd, t)
        b.add(f'bracerStrap{side}{int(t * 100)}', tube(limb_rings(c - fa * 0.007 * H, c + fa * 0.007 * H, 0.064 * H, 0.064 * H, n=1), 16), harness, region='e' + side, subdiv=0)
    # os FARRAPOS: tiras largas e chatas penduradas do braço e do cotovelo, chamuscadas
    for i in range(5):
        u = (i - 2) / 2
        top = sh.lerp(el, 0.55 + 0.1 * u) + Vector((s * 0.06 * H, 0.03 * H * u, 0))
        ln = random.uniform(0.2, 0.3) * H
        pts = [top + Vector((s * 0.01 * H * j, 0, -ln * j / 4)) for j in range(5)]
        b.add(f'rag{side}{i}', rod(pts, [0.02 * H, 0.022 * H, 0.02 * H, 0.016 * H, 0.008 * H], 4, flat=((lambda p, o=Vector((s, 0, 0)): o), 0.25)), rag, region='arm' + side, subdiv=0)
    for i in range(4):
        u = (i - 1.5) / 1.5
        top = el + Vector((s * 0.05 * H, 0.03 * H * u, -0.02 * H))
        ln = random.uniform(0.12, 0.2) * H
        pts = [top + fa * (ln * j / 3) for j in range(4)]
        b.add(f'ragE{side}{i}', rod(pts, [0.018 * H, 0.018 * H, 0.012 * H, 0.005 * H], 4, flat=((lambda p, o=Vector((s, 0, 0)): o), 0.25)), rag, region='e' + side, subdiv=0)

# ================================================================ a GOLA ALTA com ESPINHOS curtos
b.add('collar', tube([(0, 0, hz + 0.58 * H, 0.1 * H, 0.09 * H), (0, 0, hz + 0.67 * H, 0.074 * H, 0.072 * H)], 22), suit_dk, region='chest', subdiv=0)
sp = []
for j in range(18):
    a = j / 18 * TAU
    for zz in (0.61, 0.645):
        d = Vector((math.sin(a), -math.cos(a), 0.1)).normalized()
        rr = 0.088 if zz < 0.63 else 0.078
        base = Vector((math.sin(a) * rr * H, -math.cos(a) * rr * 0.97 * H, hz + zz * H))
        sp.append(cone(tuple(base), tuple(base + d * 0.022 * H), 0.006 * H, 5))
b.add('collarSpikes', merge(*sp), spike, region='chest', subdiv=0)

# ================================================================ o CABELO RUIVO desgrenhado (médio, espetado em mechas para todo lado)
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))


def hair_weights(p):
    t = smoothstep(sk['hd'].z - 0.02 * H, sk['neck'].z - 0.03 * H, p.z)
    return {'hd': 1 - t, 'chest': t}


Hr = Sculpt()
Hr.ell(Vh(0, 0.014, 0.04), (0.142 * H, 0.152 * H, 0.146 * H))
Hr.ell(Vh(0, 0.06, -0.03), (0.13 * H, 0.12 * H, 0.12 * H))  # a nuca coberta
# as MECHAS ESPETADAS do jeito do Guizo: cada uma é um tubo ACHATADO contra a cabeça que afina até uma ponta fina (no
# volume do Sculpt as pontas viravam bolinhas); nascem rente à calota, acompanham o crânio e soltam na ponta
spikes = []
for i in range(95):
    th = random.uniform(-math.pi, math.pi)
    ph0 = random.uniform(0.05, 0.9 if abs(th) > 2.0 else 0.75)
    if math.cos(th) > 0.6 and ph0 > 0.55:
        continue  # o rosto livre (a franja vem depois)
    n = 5
    ph1 = ph0 + random.uniform(0.35, 0.7)
    lift = random.uniform(0.25, 0.8)
    pts, rad = [], []
    for k in range(n + 1):
        t = k / n
        ph = ph0 + (ph1 - ph0) * t
        thk = th + 0.25 * math.sin(i * 1.7) * t  # a mecha torce
        d = Vector((math.sin(thk) * math.sin(ph), -math.cos(thk) * math.sin(ph), math.cos(ph)))
        r = 1.0 + 0.06 * math.sin(t * math.pi) + 0.55 * t ** 2 * lift  # a ponta solta para fora (o cabelo jogado para trás)
        pts.append(HC + Vector((d.x * 0.142 * H * r, d.y * 0.152 * H * r + 0.014 * H + 0.03 * H * t * t, d.z * 0.146 * H * r + 0.04 * H)))
        rad.append((0.03 - 0.028 * t ** 1.1) * H)
    spikes.append(rod(pts, rad, 6, flat=(lambda q: (q - HC).normalized(), 0.6)))
for i in range(120):  # os LADOS e a NUCA: mechas que caem rentes e soltam a ponta para fora (nada de calota lisa)
    th = random.uniform(0.85, math.pi) * random.choice((1, -1))
    ph0 = random.uniform(0.75, 1.75 if abs(th) > 2.2 else 1.3)
    ph1 = ph0 + random.uniform(0.35, 0.6)
    lift = random.uniform(0.15, 0.5)
    pts, rad = [], []
    for k in range(6):
        t = k / 5
        ph = ph0 + (ph1 - ph0) * t
        d = Vector((math.sin(th) * math.sin(ph), -math.cos(th) * math.sin(ph), math.cos(ph)))
        r = (1.22 if abs(th) > 2.2 else 1.12) + 0.04 * math.sin(t * math.pi) + 0.35 * t ** 2 * lift  # por fora da calota (a nuca é mais funda)
        pts.append(HC + Vector((d.x * 0.142 * H * r, d.y * 0.152 * H * r + 0.014 * H, d.z * 0.146 * H * r + 0.04 * H)))
        rad.append((0.028 - 0.026 * t ** 1.1) * H)
    spikes.append(rod(pts, rad, 6, flat=(lambda q: (q - HC).normalized(), 0.6)))
for i in range(9):  # as mechas na testa, desfiadas em ponta
    x = -0.09 + 0.18 * i / 8
    ln = random.uniform(0.07, 0.1)
    pts = [Vh(x * 0.6, -0.1, 0.14), Vh(x * 0.9, -0.14, 0.1), Vh(x * 1.1 + random.uniform(-0.012, 0.012), -0.155, 0.12 - ln)]
    spikes.append(rod(pts, [0.022 * H, 0.015 * H, 0.002 * H], 6, flat=(lambda q: (q - HC).normalized(), 0.6)))
Hr.ell(Vh(0, -0.13, -0.07), (0.106 * H, 0.1 * H, 0.13 * H), neg=True)


def messy(p):
    return 0.004 * H * (ridge(math.atan2(p.x - HC.x, p.y - HC.y) * 14 + p.z / H * 30 + n3(p, 30) * 2, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.0055, smooth=2, disp=messy, target=4000), hairm, region='head', weight_fn=hair_weights, subdiv=0)
b.add('hairSpikes', merge(*spikes), hairm, region='head', weight_fn=hair_weights, subdiv=0)
Rr = Sculpt()
Rr.ell(Vh(0, 0.08, -0.05), (0.11 * H, 0.07 * H, 0.08 * H))
Rr.ell(Vh(0, -0.04, -0.06), (0.13 * H, 0.12 * H, 0.14 * H), neg=True)
b.add('hairNape', Rr.mesh(res=0.006, smooth=2, target=800), hairDk, region='head', subdiv=0)

# ================================================================ os PIERCINGS: sobrancelha, glabela e lábio; os brincos
pc = []
pc.append(ellipsoid(tuple(Vh(0.052, -0.14, 0.05)), (0.0035 * H, 0.0035 * H, 0.0035 * H), 6, 4))
pc.append(ellipsoid(tuple(Vh(0.052, -0.138, 0.032)), (0.0035 * H, 0.0035 * H, 0.0035 * H), 6, 4))
pc.append(ellipsoid(tuple(Vh(0.0, -0.148, 0.03)), (0.003 * H, 0.003 * H, 0.003 * H), 6, 4))
c = Vh(-0.016, -0.15, -0.088)
pc.append(rod([c + Vector((math.cos(t) * 0.006 * H, -math.sin(t) * 0.004 * H, math.sin(t) * 0.006 * H)) for t in [j / 10 * TAU for j in range(11)]], 0.002 * H, 4, caps=False))
for s in (1, -1):
    c = Vh(s * 0.128, 0.0, -0.05)
    pc.append(rod([c + Vector((0, math.cos(t) * 0.008 * H, math.sin(t) * 0.008 * H)) for t in [j / 10 * TAU for j in range(11)]], 0.002 * H, 4, caps=False))
b.add('piercings', merge(*pc), pierc, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'franco.blend'), check_existing=False)
