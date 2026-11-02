"""
RUBENS NALUTI — Ordo Realitas (Equipe Abutres, Calamidade) — public/models/rubens.glb.
Referência: wiki "Rubens Naluti" (arte promocional de Calamidade). 1,56 m, magro e baixo, pardo, olhos castanhos;
cabelo BRANCO CACHEADO preso num COQUE no alto, com poucas mechas soltas. Camisa longa AMARELA (mostarda), transpassada
em V no peito, onde aparece a CICATRIZ costurada por CABOS ELETRÔNICOS BRILHANTES (o último jogo do Anfitrião); JAQUETA
ESCURA curta de GOLA LEVANTADA, aberta, com as mangas puxadas até o meio do antebraço (as mangas amarelas aparecem);
a camisa de FLANELA VERDE xadrez amarrada na cintura caindo na frente (depois do Johnny); calça jeans PRETA; LUVAS
PRETAS SEM DEDO; o pingente de FLAMINGO no colar; a FACA do Johnny na coxa direita; o Amuleto de Proteção Elemental
(Símbolo de Sangue) preso na cintura. O martelo, a Glock e a faca na mão são montados em código (props.js).
TÉCNICA (a da Carina): corpo pelo Builder; jaqueta, gola e flanela como CASCAS (shell_grid); cabelo, calça, botas e
mangas por ESCULTURA de metaballs com relevo; modelado e conferido no Blender ao vivo pelo MCP em 4 vistas.
  node tools/blender/build.mjs rubens   → public/models/rubens.glb (+ tools/blender/fonte/rubens.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief, chain_mesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'rubens.glb'
random.seed(1560)

b = Builder(width=0.86, bulk=0.88, height=0.867)  # 1,56 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_rubens', '#9a6a46', 0.8),
    'face': material('face_rubens', '#ffffff', 0.8),
    'torso': material('shirt_rubens', '#b88a2a', 0.9),
    'arm': material('shirt_rubens', '#b88a2a', 0.9),
    'hand': material('glove_rubens', '#16161a', 0.6),
    'legs': material('pants_rubens', '#1c1c22', 0.9),
    'feet': material('boot_rubens', '#121214', 0.55),
}
shirt = M['torso']
shirt_dk = material('shirt_rubens_dk', '#8a6418', 0.9)
jacket = material('jacket_rubens', '#1e1e24', 0.7)
jacket_dk = material('jacket_rubens_dk', '#121216', 0.75)
plaid = material('plaid_rubens', '#ffffff', 0.9)
hairm = material('hair_rubens', '#e8e6e0', 0.7)
silver = material('silver_rubens', '#b8b8c0', 0.3, metal=0.9)
pink = material('flamingo_rubens', '#ff6aa8', 0.5)
cables = material('cables_glow_rubens', '#7af0ff', 0.3, emission='#4ae0ff', strength=2.5)
scar = material('skin_rubens_scar', '#7a4a34', 0.85)
beltm = material('belt_rubens', '#141416', 0.6)
sole = material('sole_rubens', '#0a0a0c', 0.8)
steel = material('steel_rubens', '#d8d4dc', 0.25, metal=0.9)
red = material('amulet_rubens', '#b01828', 0.5)

PREVIEW = {'face_rubens': '#9a6a46', 'plaid_rubens': '#3e5a44'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.15), (0.0, 0.15), (0.17, 0.138), (0.36, 0.17), (0.47, 0.188), (0.57, 0.11), (0.63, 0.062)],
            arm_r=(0.052, 0.044, 0.037), leg_r=(0.078, 0.06, 0.047), head_r=(0.14, 0.15, 0.164))


def part(name):
    return next(o for o in b.parts if o.name == name)


# ================================================================ o V da camisa transpassada: a pele do peito com a CICATRIZ
# costurada pelos CABOS que brilham (a abertura fica na frente, entre a gola da jaqueta)
vz0, vz1 = 1.4 * H, 1.6 * H
V = []
for k in range(5):
    z = vz0 + (vz1 - vz0) * k / 4
    w = 0.012 * H + 0.05 * H * k / 4
    V.append((z, w))
tor = part('torso')
ty = min(v.co.y for v in tor.data.vertices if abs(v.co.x) < 0.02 and abs(v.co.z - 1.5 * H) < 0.03 * H)
vv, vf = [], []
for i, (z, w) in enumerate(V):
    for j in range(5):
        x = -w + 2 * w * j / 4
        vv.append((x, ty - 0.004 * H + 0.06 * (x / H) ** 2, z))
for i in range(4):
    for j in range(4):
        a = i * 5 + j
        vf.append((a, a + 1, a + 6, a + 5))
b.add('chestV', (vv, vf, None), M['skin'], region='chest', subdiv=1)
# a cicatriz: a costura vertical e os cabos atravessando em zigue-zague
b.add('scarLine', rod([(0, ty - 0.008 * H, 1.42 * H), (0.002, ty - 0.009 * H, 1.5 * H), (0, ty - 0.008 * H, 1.58 * H)], 0.006 * H, 5), scar, region='chest', subdiv=0)
for i in range(5):
    z = 1.43 * H + i * 0.033 * H
    b.add(f'cable{i}', rod([(-0.016 * H, ty - 0.009 * H, z), (0.016 * H, ty - 0.011 * H, z + 0.012 * H)], 0.0032 * H, 4), cables, region='chest', subdiv=0)
# as bordas da camisa transpassada
for s in (1, -1):
    b.add(f'shirtEdge{s}', rod([(s * w, ty - 0.003 * H, z) for z, w in V] + [(s * 0.1 * H, ty + 0.02 * H, 1.62 * H)], 0.007 * H, 5), shirt_dk, region='chest', subdiv=0)

# ================================================================ JAQUETA ESCURA curta, aberta, de GOLA LEVANTADA
JK = [(0.13, 0.168, 0.13, 0.5), (0.24, 0.168, 0.124, 0.5), (0.36, 0.198, 0.136, 0.52), (0.46, 0.21, 0.144, 0.56),
      (0.54, 0.182, 0.13, 0.62), (0.6, 0.122, 0.1, 0.78)]
rows = [ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 30) for dz, rx, ry, gap in JK]
jk = b.add('jacket', shell_grid(rows, 0.007), jacket, region='torso', subdiv=1)
relief(jk, lambda p: 0.0022 * H * (ridge((p.z - hz) / H * 60 + n3(p, 9) * 2, 2) - 0.4) * (1 if p.z < hz + 0.3 * H else 0.4))
hem = [(math.sin(a) * 0.17 * H, -math.cos(a) * 0.132 * H, hz + 0.13 * H) for a in [0.5 + (TAU - 1.0) * i / 30 for i in range(31)]]
b.add('jacketHem', rod(hem, 0.014 * H, 6, flat=(outward((0, 0)), 0.35)), jacket_dk, region='torso', subdiv=0)
for s in (1, -1):  # as bordas da abertura
    pts = []
    for dz, rx, ry, gap in JK:
        a = gap if s > 0 else TAU - gap
        pts.append(Vector((math.sin(a) * (rx + 0.003) * H, -math.cos(a) * (ry + 0.003) * H, hz + dz * H)))
    b.add(f'jacketEdge{s}', rod(pts, 0.008 * H, 6, flat=(outward((0, 0)), 0.4)), jacket_dk, region='torso', subdiv=0)
# a GOLA LEVANTADA: sobe em volta do pescoço até perto do queixo, aberta na frente
gola = [ring_pts(1.55 * H + k * 0.05 * H, (0.112 + k * 0.006) * H, (0.098 + k * 0.006) * H, 0.75, TAU - 0.75, 20) for k in range(4)]
b.add('jacketCollar', shell_grid(gola, 0.008), jacket, region='neck', subdiv=1)
# as MANGAS da jaqueta puxadas até o meio do antebraço (a manga amarela da camisa aparece embaixo)
for side in ('L', 'R'):
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    end = e.lerp(h, 0.35)
    S = Sculpt()
    S.chain([s_ + Vector((0, 0, 0.02 * H)), s_.lerp(e, 0.5), e, end], [0.05 * H, 0.048 * H, 0.05 * H, 0.049 * H], step=0.4)
    S.ell(e.lerp(end, 0.55), (0.05 * H, 0.05 * H, 0.032 * H), dir=end - e)
    S.ell(s_ + Vector((0, 0, 0.02 * H)), (0.045 * H, 0.045 * H, 0.04 * H))
    ax = (e - s_).normalized()
    fold = lambda p, a=s_, ax=ax: 0.003 * H * (ridge((p - a).dot(ax) / H * 70 + n3(p, 14) * 2, 2) - 0.4)
    b.add('sleeve' + side, S.mesh(res=0.007, smooth=3, disp=fold, target=1000), jacket, region='arm' + side, subdiv=0)
    b.add('sleeveCuff' + side, tube(limb_rings(end + (h - e).normalized() * 0.012 * H, end - (h - e).normalized() * 0.008 * H, 0.051 * H, 0.051 * H, n=1), 14), jacket_dk, region='e' + side, subdiv=0)
    # o punho da camisa amarela no pulso
    b.add('shirtCuff' + side, tube(limb_rings(e.lerp(h, 0.8), e.lerp(h, 0.88), 0.041 * H, 0.041 * H, n=1), 12), shirt_dk, region='e' + side, subdiv=0)

# ================================================================ o colar com o PINGENTE DE FLAMINGO
pc = Vector((0.012 * H, ty - 0.02 * H, 1.47 * H))
b.add('necklace', rod([(-0.05 * H, ty + 0.03 * H, 1.6 * H), (-0.02 * H, ty - 0.01 * H, 1.52 * H), (pc.x, pc.y, pc.z + 0.02 * H),
                       (0.03 * H, ty - 0.01 * H, 1.52 * H), (0.05 * H, ty + 0.03 * H, 1.6 * H)], 0.0025, 5), silver, region='chest', subdiv=0)
b.add('flamingoBody', ellipsoid(tuple(pc), (0.012 * H, 0.006 * H, 0.008 * H), 10, 6), pink, region='chest', subdiv=0)
b.add('flamingoNeck', rod([(pc.x + 0.008 * H, pc.y, pc.z + 0.004 * H), (pc.x + 0.012 * H, pc.y - 0.001, pc.z + 0.016 * H),
                           (pc.x + 0.006 * H, pc.y - 0.001, pc.z + 0.026 * H), (pc.x + 0.001 * H, pc.y - 0.001, pc.z + 0.022 * H)], 0.0022 * H, 5), pink, region='chest', subdiv=0)
b.add('flamingoLeg', rod([(pc.x, pc.y, pc.z - 0.006 * H), (pc.x, pc.y, pc.z - 0.02 * H)], 0.0012 * H, 4), pink, region='chest', subdiv=0)

# ================================================================ CALÇA JEANS PRETA
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k + Vector((0, -0.003 * H, 0)), k.lerp(f, 0.55)],
            [0.068 * H, 0.058 * H, 0.05 * H, 0.046 * H], step=0.45)
    c2 = (l.x, l.y)
    fold = lambda p, c=c2, kz=k.z: 0.0026 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 30 + n3(p, 16), 2) - 0.35) * (1.6 if abs(p.z - kz) < 0.06 * H else 1)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
Hp = Sculpt()
Hp.ell(Vector((0, 0.0, hz - 0.02 * H)), (0.158 * H, 0.118 * H, 0.1 * H))
Hp.ell(Vector((0, 0.012 * H, hz - 0.055 * H)), (0.142 * H, 0.098 * H, 0.075 * H))
b.add('pantsHip', Hp.mesh(res=0.011, smooth=3, disp=lambda p: 0.0015 * H * n3(p, 14), target=800), M['legs'], region='body', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)

# a FACA DO JOHNNY na coxa direita (x < 0): a bainha com as duas tiras e o cabo
lR, kR = sk['lR'], sk['kR']
hp = lR.lerp(kR, 0.4)
b.add('sheath', box((hp.x - 0.072 * H, hp.y - 0.005 * H, hp.z - 0.02 * H), (0.022 * H, 0.05 * H, 0.15 * H), bevel=0.005), beltm, region='lR', subdiv=0)
b.add('knifeGrip', box((hp.x - 0.072 * H, hp.y - 0.005 * H, hp.z + 0.09 * H), (0.018 * H, 0.026 * H, 0.07 * H), bevel=0.004), jacket_dk, region='lR', subdiv=0)
b.add('knifeGuard', box((hp.x - 0.072 * H, hp.y - 0.005 * H, hp.z + 0.055 * H), (0.022 * H, 0.05 * H, 0.008 * H), bevel=0.002), steel, region='lR', subdiv=0)
for t in (0.28, 0.55):
    b.add(f'sheathStrap{t}', tube(limb_rings(lR.lerp(kR, t), lR.lerp(kR, t + 0.035), 0.072 * H, 0.072 * H, n=1), 14), beltm, region='lR', subdiv=0)

# ================================================================ BOTAS pretas curtas
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    B = Sculpt()
    B.chain([k.lerp(f, 0.55), k.lerp(f, 0.8), f + Vector((0, 0.005 * H, 0.06 * H))], [0.05 * H, 0.048 * H, 0.047 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.052 * H, 0.115 * H, 0.044 * H))
    B.ell(f + Vector((0, -0.125 * H, 0.024 * H)), (0.046 * H, 0.05 * H, 0.034 * H))
    B.ell(f + Vector((0, 0.035 * H, 0.04 * H)), (0.048 * H, 0.048 * H, 0.05 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, disp=lambda p: 0.0016 * H * (ridge(p.z / H * 40 + n3(p, 10), 2) - 0.4), target=1000), M['feet'], region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.014 * H), (0.1 * H, 0.24 * H, 0.032 * H), bevel=0.006), sole, region='k' + side, subdiv=0)

# ================================================================ CINTO, a FLANELA amarrada e o AMULETO
belt_ring = [(math.sin(a) * 0.166 * H, -math.cos(a) * 0.122 * H, hz + 0.08 * H) for a in [i / 28 * TAU for i in range(29)]]
b.add('belt', rod(belt_ring, 0.018 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), beltm, region='torso', subdiv=0)
# as mangas da flanela dão a volta na cintura e o NÓ fica na frente
wrap = [(math.sin(a) * 0.178 * H, -math.cos(a) * 0.134 * H, hz + 0.045 * H + 0.012 * H * math.cos(a)) for a in [i / 30 * TAU for i in range(31)]]
b.add('flannelWrap', rod(wrap, 0.024 * H, 7, caps=False), plaid, region='torso', subdiv=0)
knot = Vector((0.015 * H, -0.15 * H, hz + 0.045 * H))
Kn = Sculpt()
Kn.ell(knot, (0.035 * H, 0.025 * H, 0.03 * H))
for s in (1, -1):  # as pontas das mangas caindo do nó
    Kn.chain([knot + Vector((s * 0.015 * H, -0.004 * H, -0.01 * H)), knot + Vector((s * 0.03 * H, -0.006 * H, -0.09 * H)), knot + Vector((s * 0.035 * H, -0.004 * H, -0.16 * H))],
             [0.022 * H, 0.02 * H, 0.016 * H], step=0.4)
b.add('flannelKnot', Kn.mesh(res=0.006, smooth=3, disp=lambda p: 0.0015 * H * n3(p, 20), target=700), plaid, region='skirt', subdiv=0)
# o corpo da camisa caindo na frente, por cima da calça (até o meio da coxa)
FL = []
for k in range(6):
    z = hz + 0.03 * H - k * 0.055 * H
    flare = 1 + k * 0.03
    FL.append(ring_pts(z, 0.18 * H * flare, 0.138 * H * flare + k * 0.003 * H, -1.05 - k * 0.03, 1.05 + k * 0.03, 22))
fl = b.add('flannel', shell_grid(FL, 0.006), plaid, region='skirt', subdiv=1)
relief(fl, lambda p: 0.004 * H * (ridge(math.atan2(p.x, -p.y) * 9 + n3(p, 8), 2) - 0.4))
# o Amuleto de Proteção Elemental (Símbolo de Sangue) preso no cinto, do lado esquerdo (x > 0)
am = Vector((0.15 * H, -0.075 * H, hz + 0.05 * H))
b.add('amulet', ellipsoid(tuple(am), (0.02 * H, 0.006 * H, 0.02 * H), 12, 6), red, region='torso', subdiv=0)
b.add('amuletRing', rod([(am.x + math.sin(a) * 0.02 * H, am.y - 0.004 * H, am.z + math.cos(a) * 0.02 * H) for a in [i / 14 * TAU for i in range(15)]], 0.002 * H, 4, caps=False), silver, region='torso', subdiv=0)

# ================================================================ CABELO BRANCO CACHEADO preso num COQUE no alto + mechas soltas
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
Hr = Sculpt()
# a calota PUXADA para o coque: rente à cabeça, cobrindo a nuca até embaixo
Hr.ell(Vh(0, 0.012, 0.03), (0.15 * H, 0.162 * H, 0.15 * H))
Hr.ell(Vh(0, 0.05, -0.05), (0.142 * H, 0.13 * H, 0.13 * H))
# os CACHOS: pequenos e rentes na calota (o cabelo está puxado), mais soltos na nuca
for i in range(110):
    th = random.uniform(-math.pi, math.pi)
    ph = random.uniform(0.1, 2.05)
    d = Vector((math.sin(th) * math.sin(ph), -math.cos(th) * math.sin(ph) * 1.06, math.cos(ph)))
    if d.y < -0.35 and d.z < 0.6:  # o rosto livre
        continue
    if d.z < -0.1 and d.y < 0.2:  # abaixo das têmporas só atrás
        continue
    c = HC + Vector((d.x * 0.148 * H, 0.012 * H + d.y * 0.158 * H, 0.03 * H + d.z * 0.148 * H))
    Hr.ell(c, 0.02 * H)
# o COQUE: uma bola de cachos no alto, um pouco para trás
bun = Vh(0, 0.06, 0.19)
Hr.ell(bun, (0.058 * H, 0.058 * H, 0.05 * H))
for i in range(16):
    a = i / 16 * TAU
    Hr.ell(bun + Vector((math.sin(a) * 0.052 * H, math.cos(a) * 0.052 * H, random.uniform(-0.01, 0.035) * H)), 0.026 * H)
for i in range(5):
    a = i / 5 * TAU
    Hr.ell(bun + Vector((math.sin(a) * 0.025 * H, math.cos(a) * 0.025 * H, 0.05 * H)), 0.026 * H)
# as POUCAS MECHAS SOLTAS: dois cachinhos caindo nas têmporas e um na testa
for s, x0, ln in ((1, 0.115, 0.1), (-1, 0.118, 0.11), (-1, 0.045, 0.06)):
    top = Vh(s * x0, -0.1, 0.11)
    pts = [top]
    for k in range(1, 6):
        t = k / 5
        pts.append(top + Vector((s * (0.012 * H + 0.012 * H * math.sin(t * 9)), -0.02 * H - 0.012 * H * math.cos(t * 9), -ln * H * t)))
    Hr.chain(pts, [0.014 * H, 0.013 * H, 0.012 * H, 0.011 * H, 0.01 * H, 0.008 * H], step=0.4)
Hr.ell(Vh(0, -0.125, -0.07), (0.112 * H, 0.1 * H, 0.15 * H), neg=True)  # o rosto livre
Hr.ell(Vh(0, 0.01, -0.04), (0.105 * H, 0.115 * H, 0.12 * H), neg=True)


def curls(p):
    return 0.005 * H * (n3(p, 60) + 0.5 * n3(p, 120))


b.add('hair', Hr.mesh(res=0.006, smooth=2, disp=curls, target=4500), hairm, region='head', subdiv=0)
b.add('hairTie', tube([(bun.x, bun.y, bun.z - 0.052 * H, 0.042 * H, 0.042 * H), (bun.x, bun.y, bun.z - 0.036 * H, 0.046 * H, 0.046 * H)], 12), beltm, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'rubens.blend'), check_existing=False)
