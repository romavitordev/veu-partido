"""
AGHATA — "a Vampira" (Transtornados, Hexatombe) — public/models/aghata.glb.
Referências: wiki "Aghata" (o visual da Hexatombe) e a arte de corpo inteiro "Vampira" (cores e o xadrez cáqui).
1,62 m, magra; cabelo preto BAGUNÇADO até os ombros com a mecha VERMELHA na franja, brinco de PENA na orelha esquerda,
presas (textura do rosto). Blusa vermelha de GOLA ALTA com o símbolo ritual na gola; o COLAR e as correntes no pescoço;
JAQUETA preta de couro curta (até o cinto) com os detalhes vermelhos, gola alta aberta e as mangas puxadas até o meio do
antebraço; braços TATUADOS (textura arms_vampira) e duas pulseiras; LUVAS vermelhas de motoqueira; CINTO com a corrente;
a camisa xadrez amarrada na cintura (a da Lina), caindo do lado esquerdo; JEANS azul rasgado nos joelhos; COTURNOS
vermelhos de cadarço com a sola preta; o livro preso na cintura. A faca é montada em código.
TÉCNICA (a do Cristino / Cristopher): corpo pelo Builder; jaqueta, gola e camisa amarrada como CASCAS (shell_grid, com
UV para o xadrez); cabelo, jeans, coturnos e mangas por ESCULTURA de metaballs com o relevo das dobras; correntes de elos
de verdade (chain_mesh). Mesmas juntas e regiões de antes: as poses e os golpes não mudam.
  node tools/blender/build.mjs aghata   → public/models/aghata.glb (+ tools/blender/fonte/aghata.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief, chain_mesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'aghata.glb'
random.seed(1662)

b = Builder(width=0.9, bulk=0.92, height=0.9)  # 1,62 m
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_vampira', '#d6a68c', 0.8),
    'face': material('face_vampira', '#ffffff', 0.8),
    'torso': material('shirt_red', '#a01e24', 0.85),
    'arm': material('arms_vampira', '#ffffff', 0.8),
    'hand': material('glove_red', '#8e1a22', 0.6),
    'legs': material('jeans_teal', '#2c4654', 0.9),
    'feet': material('boot_red', '#8a2026', 0.65),
}
red = M['torso']
jacket = material('leather_jacket', '#1c1f24', 0.5)
jacket_dk = material('leather_jacket_dk', '#0f1114', 0.6)
red_trim = material('jacket_red', '#9a1a22', 0.55)
silver = material('silver_vampira', '#b8b8c0', 0.3, metal=0.9)
cord = material('cord_black', '#101012', 0.6)
hairm = material('hair_vampira', '#101216', 0.6)
hair_red = material('hair_red', '#a8182a', 0.6)
plaid = material('plaid', '#ffffff', 0.9)
feather = material('feather', '#cfc6b4', 0.9)
book = material('book', '#5a4a38', 0.8)
beltm = material('belt_black', '#141416', 0.6)
laces = material('laces', '#d8c49a', 0.8)
sole = material('sole_black', '#141416', 0.8)
symbol = material('symbol_vampira', '#121014', 0.5)

PREVIEW = {'face_vampira': '#d6a68c', 'arms_vampira': '#d6a68c', 'plaid': '#a88e58'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.155), (0.0, 0.158), (0.17, 0.14), (0.36, 0.185), (0.47, 0.196), (0.57, 0.11), (0.63, 0.065)],
            arm_r=(0.054, 0.045, 0.038), leg_r=(0.08, 0.062, 0.048), head_r=(0.135, 0.145, 0.158))


def part(name):
    return next(o for o in b.parts if o.name == name)


def lim(x):
    return max(0.0, min(1.0, x))


# o busto e a cintura fina, esculpidos na malha da blusa (o UV fica)
def chest(p):
    x, y, z = p.x, p.y, p.z - hz
    if y > -0.02:
        return 0.0
    return 0.018 * H * math.exp(-((abs(x) - 0.07 * H) / (0.06 * H)) ** 2) * math.exp(-((z - 0.43 * H) / (0.06 * H)) ** 2)


relief(part('torso'), chest)

# ================================================================ a GOLA ALTA da blusa vermelha (dobrada) e o símbolo ritual
G = Sculpt()
for k in range(3):
    z = 1.56 * H + k * 0.035 * H
    for a in [i / 14 * TAU for i in range(14)]:
        G.ell(Vector((math.sin(a) * 0.066 * H, -math.cos(a) * 0.062 * H, z)), (0.026 * H, 0.026 * H, 0.024 * H))
G.ell(Vector((0, 0, 1.6 * H)), (0.05 * H, 0.05 * H, 0.08 * H), neg=True)  # o pescoço passa por dentro
b.add('turtleneck', G.mesh(res=0.006, smooth=3, disp=lambda p: 0.0018 * H * (ridge(p.z / H * 140 + n3(p, 30), 2) - 0.4), target=1100), red, region='neck', subdiv=0)
# o símbolo na frente da gola: círculo cortado por uma cruz alongada (como os sigilos das tatuagens)
cz = 1.61 * H
cy = -0.093 * H
circ = [(math.sin(a) * 0.016 * H, cy, cz + math.cos(a) * 0.016 * H) for a in [i / 16 * TAU for i in range(17)]]
sym = [rod(circ, 0.0022 * H, 4, caps=False),
       rod([(-0.022 * H, cy, cz), (0.022 * H, cy, cz)], 0.002 * H, 4),
       rod([(0, cy, cz + 0.024 * H), (0, cy, cz - 0.03 * H)], 0.002 * H, 4)]
b.add('collarSymbol', merge(*sym), symbol, region='neck', subdiv=0)

# ================================================================ JAQUETA preta de couro, curta e aberta, com os detalhes vermelhos
# (z relativo ao quadril → meia-largura, meia-profundidade, meio-ângulo da abertura da frente)
JK = [(0.11, 0.176, 0.13, 0.42), (0.17, 0.172, 0.126, 0.42), (0.27, 0.178, 0.128, 0.44), (0.37, 0.204, 0.142, 0.5),
      (0.46, 0.21, 0.146, 0.52), (0.54, 0.178, 0.13, 0.6), (0.6, 0.118, 0.096, 0.78)]
rows = [ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 30) for dz, rx, ry, gap in JK]
jk = b.add('jacket', shell_grid(rows, 0.007), jacket, region='torso', subdiv=1)
# o couro: vincos na cintura e debaixo dos braços
relief(jk, lambda p: 0.0022 * H * (ridge((p.z - hz) / H * 60 + n3(p, 9) * 2, 2) - 0.4) * (1 if p.z < hz + 0.3 * H else 0.4))
# as bordas da abertura e a barra em VERMELHO
for s in (1, -1):
    pts = []
    for dz, rx, ry, gap in JK:
        a = gap if s > 0 else TAU - gap
        pts.append(Vector((math.sin(a) * (rx + 0.003) * H, -math.cos(a) * (ry + 0.003) * H, hz + dz * H)))
    b.add(f'jacketEdge{s}', rod(pts, 0.009 * H, 6, flat=(outward((0, 0)), 0.4)), red_trim, region='torso', subdiv=0)
hem = [(math.sin(a) * 0.18 * H, -math.cos(a) * 0.133 * H, hz + 0.11 * H) for a in [0.42 + (TAU - 0.84) * i / 30 for i in range(31)]]
b.add('jacketHem', rod(hem, 0.013 * H, 6, flat=(outward((0, 0)), 0.35)), jacket_dk, region='torso', subdiv=0)
# a gola alta da jaqueta, aberta na frente e virando para fora
gola = [ring_pts(1.53 * H + k * 0.045 * H, (0.11 + k * 0.016) * H, (0.095 + k * 0.016) * H, 0.9 - k * 0.05, TAU - 0.9 + k * 0.05, 18) for k in range(3)]
b.add('jacketCollar', shell_grid(gola, 0.007), jacket, region='neck', subdiv=1)
b.add('collarRim', rod(gola[-1], 0.006 * H, 5), red_trim, region='neck', subdiv=0)
# os bolsos do peito com a lapela forrada de vermelho e o botão de pressão
for sx in (1, -1):
    b.add(f'pocket{sx}', box((sx * 0.085 * H, -0.142 * H, hz + 0.38 * H), (0.06 * H, 0.006 * H, 0.06 * H), bevel=0.003), jacket, region='torso', subdiv=0)
    b.add(f'pocketFlap{sx}', box((sx * 0.085 * H, -0.149 * H, hz + 0.422 * H), (0.07 * H, 0.012 * H, 0.024 * H), bevel=0.003), red_trim, region='torso', subdiv=0)
    b.add(f'snap{sx}', ellipsoid((sx * 0.085 * H, -0.157 * H, hz + 0.418 * H), (0.007, 0.004, 0.007), 6, 4), silver, region='torso', subdiv=0)
# o zíper de metal descendo nas duas bordas
for s in (1, -1):
    a = 0.44 if s > 0 else TAU - 0.44
    zp = [(math.sin(a) * 0.17 * H, -math.cos(a) * 0.132 * H - 0.003, hz + (0.13 + i * 0.04) * H) for i in range(9)]
    b.add(f'zip{s}', rod(zp, 0.003 * H, 4), silver, region='torso', subdiv=0)

# as MANGAS puxadas até o meio do antebraço (escultura: o couro amontoado no cotovelo e no punho)
for side in ('L', 'R'):
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    end = e.lerp(h, 0.44)
    S = Sculpt()
    S.chain([s_ + Vector((0, 0, 0.02 * H)), s_.lerp(e, 0.5), e, end], [0.05 * H, 0.046 * H, 0.048 * H, 0.047 * H], step=0.4)
    S.ell(e.lerp(end, 0.55), (0.052 * H, 0.052 * H, 0.035 * H), dir=end - e)  # o couro amontoado ao puxar a manga
    S.ell(s_ + Vector((0, 0, 0.02 * H)), (0.05 * H, 0.05 * H, 0.045 * H))  # a cabeça do ombro
    ax = (e - s_).normalized()
    fold = lambda p, a=s_, ax=ax: 0.003 * H * (ridge((p - a).dot(ax) / H * 70 + n3(p, 14) * 2, 2) - 0.4)
    b.add('sleeve' + side, S.mesh(res=0.007, smooth=3, disp=fold, target=1000), jacket, region='arm' + side, subdiv=0)
    b.add('sleeveCuff' + side, tube(limb_rings(end + (h - e).normalized() * 0.012 * H, end - (h - e).normalized() * 0.008 * H, 0.05 * H, 0.05 * H, n=1), 14), red_trim, region='e' + side, subdiv=0)
    # o punho da blusa vermelha aparecendo, o punho da luva e as DUAS pulseiras
    b.add('gloveCuff' + side, tube(limb_rings(e.lerp(h, 0.84), e.lerp(h, 0.96), 0.048, 0.052, n=1), 12), M['hand'], region='e' + side, subdiv=0)
    for k, (t, r) in enumerate(((0.72, 0.047), (0.78, 0.048))):
        c = e.lerp(h, t)
        ring = [c + Vector((math.sin(a) * r, math.cos(a) * r, 0.004 * math.sin(a * 3))) for a in [i / 14 * TAU for i in range(15)]]
        b.add(f'bracelet{side}{k}', rod(ring, 0.0045, 5, caps=False), silver if k else cord, region='e' + side, subdiv=0)

# ================================================================ o COLAR (cordão com a argola) e as CORRENTES no pescoço
for k, (z0, dz, rr) in enumerate(((1.555 * H, 0.055 * H, 0.09 * H), (1.54 * H, 0.11 * H, 0.096 * H))):
    pts = []
    for i in range(21):
        a = (i / 20 - 0.5) * 2.2
        pts.append((math.sin(a) * rr, -math.cos(a) * rr * 0.92 - 0.006, z0 - dz * math.cos(a) ** 6))
    b.add(f'neckChain{k}', chain_mesh(pts, link=0.016, r=0.0022), silver, region='torso', subdiv=0)
b.add('necklace', rod([(-0.06 * H, -0.07 * H, 1.6 * H), (-0.03 * H, -0.125 * H, 1.5 * H), (0, -0.138 * H, 1.46 * H), (0.03 * H, -0.125 * H, 1.5 * H), (0.06 * H, -0.07 * H, 1.6 * H)], 0.0035, 5), cord, region='torso', subdiv=0)
pend = [(math.sin(a) * 0.016 * H, -0.142 * H, 1.44 * H + math.cos(a) * 0.016 * H) for a in [i / 16 * TAU for i in range(17)]]
b.add('pendant', rod(pend, 0.004 * H, 5, caps=False), silver, region='torso', subdiv=0)

# ================================================================ JEANS justo, rasgado nos joelhos
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k + Vector((0, -0.003 * H, 0)), k.lerp(f, 0.55)],
            [0.07 * H, 0.06 * H, 0.05 * H, 0.046 * H], step=0.45)
    # o RASGO: o joelho cavado e a pele aparecendo por dentro
    P.ell(k + Vector((0, -0.07 * H, 0.008 * H)), (0.035 * H, 0.02 * H, 0.024 * H), neg=True)
    c2 = (l.x, l.y)
    fold = lambda p, c=c2, kz=k.z: 0.0028 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 30 + n3(p, 16), 2) - 0.35) * (1.6 if abs(p.z - kz) < 0.06 * H else 1)
    b.add('jeans' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
    b.add('rip' + side, ellipsoid((k.x, k.y - 0.05 * H, k.z + 0.008 * H), (0.03 * H, 0.012 * H, 0.02 * H), 10, 6), M['skin'], region='leg' + side, subdiv=0)
    # os fios brancos atravessando o rasgo
    th = [rod([(k.x - 0.026 * H, k.y - 0.066 * H, k.z + (0.004 + j * 0.008) * H), (k.x + 0.026 * H, k.y - 0.068 * H, k.z + (0.002 + j * 0.008) * H)], 0.0016 * H, 3) for j in range(3)]
    b.add('ripThreads' + side, merge(*th), laces, region='leg' + side, subdiv=0)
Hp = Sculpt()  # o quadril do jeans, unindo as pernas
Hp.ell(Vector((0, 0.0, hz - 0.02 * H)), (0.17 * H, 0.125 * H, 0.11 * H))
Hp.ell(Vector((0, 0.035 * H, hz - 0.06 * H)), (0.155 * H, 0.11 * H, 0.09 * H))
b.add('jeansHip', Hp.mesh(res=0.011, smooth=3, disp=lambda p: 0.0015 * H * n3(p, 14), target=800), M['legs'], region='body', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)

# ================================================================ COTURNOS vermelhos de cadarço, sola preta
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    B = Sculpt()
    B.chain([k.lerp(f, 0.45), f + Vector((0, 0.005 * H, 0.06 * H))], [0.05 * H, 0.048 * H], step=0.4)  # o cano até o meio da canela
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.056 * H, 0.12 * H, 0.045 * H))  # o peito do pé
    B.ell(f + Vector((0, -0.13 * H, 0.025 * H)), (0.05 * H, 0.05 * H, 0.035 * H))  # o bico arredondado
    B.ell(f + Vector((0, 0.035 * H, 0.04 * H)), (0.05 * H, 0.05 * H, 0.05 * H))  # o calcanhar
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, disp=lambda p: 0.0015 * H * (ridge(p.z / H * 90, 2) - 0.4), target=900), M['feet'], region='k' + side, subdiv=0)
    b.add('bootCuff' + side, tube(limb_rings(k.lerp(f, 0.43), k.lerp(f, 0.49), 0.053 * H, 0.052 * H, n=1), 14), jacket_dk, region='k' + side, subdiv=0)
    xs = []
    for i in range(6):
        p = k.lerp(f, 0.52 + i * 0.07)
        y = p.y - 0.064 * H - (0.02 * H if i == 5 else 0)
        xs.append(rod([(p.x - 0.026 * H, y, p.z + 0.008 * H), (p.x + 0.026 * H, y, p.z - 0.008 * H)], 0.0035 * H, 3))
        xs.append(rod([(p.x + 0.026 * H, y, p.z + 0.008 * H), (p.x - 0.026 * H, y, p.z - 0.008 * H)], 0.0035 * H, 3))
    b.add('laces' + side, merge(*xs), laces, region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.014 * H), (0.105 * H, 0.25 * H, 0.032 * H), bevel=0.006), sole, region='k' + side, subdiv=0)

# ================================================================ CINTO com a corrente, a camisa xadrez amarrada e o livro
belt_ring = [(math.sin(a) * 0.17 * H, -math.cos(a) * 0.124 * H, hz + 0.08 * H) for a in [i / 28 * TAU for i in range(29)]]
b.add('belt', rod(belt_ring, 0.02 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), beltm, region='torso', subdiv=0)
b.add('buckle', box((0, -0.13 * H, hz + 0.08 * H), (0.05, 0.012, 0.035), bevel=0.004), silver, region='torso', subdiv=0)
# a corrente da carteira: do passante da frente, num arco até o quadril direito
ch = [(-0.05 * H, -0.135 * H, hz + 0.07 * H)]
for i in range(1, 9):
    t = i / 8
    a = -0.35 - t * 1.0
    ch.append((math.sin(a) * 0.175 * H, -math.cos(a) * 0.132 * H, hz + 0.07 * H - math.sin(t * math.pi) * 0.09 * H))
b.add('beltChain', chain_mesh(ch, link=0.02, r=0.0028), silver, region='torso', subdiv=0)

# a camisa xadrez: a faixa em volta da cintura, as mangas com o nó na frente e a aba comprida do lado esquerdo
band = [ring_pts(hz + (0.04 - k * 0.04) * H, (0.178 + k * 0.006) * H, (0.135 + k * 0.006) * H, 0.25, TAU - 0.25, 26) for k in range(3)]
b.add('shirtBand', shell_grid(band, 0.006), plaid, region='torso', subdiv=1)
for s in (1, -1):  # as mangas vindo dos lados até o nó
    path = [(s * 0.17 * H, -0.06 * H, hz + 0.02 * H), (s * 0.1 * H, -0.135 * H, hz + 0.02 * H), (s * 0.025 * H, -0.15 * H, hz + 0.02 * H)]
    b.add(f'shirtSleeve{s}', rod(path, 0.022 * H, 8), plaid, region='torso', subdiv=0)
b.add('shirtKnot', rod([(-0.02 * H, -0.15 * H, hz + 0.03 * H), (0.02 * H, -0.155 * H, hz + 0.01 * H)], 0.03 * H, 8), plaid, region='torso', subdiv=0)
for s in (1, -1):  # as pontas das mangas pendendo do nó
    b.add(f'sleeveEnd{s}', rod([(s * 0.012 * H, -0.155 * H, hz), (s * 0.03 * H, -0.165 * H, hz - 0.1 * H), (s * 0.035 * H, -0.16 * H, hz - 0.17 * H)], [0.02 * H, 0.019 * H, 0.017 * H], 8), plaid, region='skirt', subdiv=0)


# a aba da camisa: cai pelas costas e pelo lado ESQUERDO até o joelho (x > 0 = esquerda do boneco)
def flap_row(z, a0, a1, rx, ry, n=16):
    return ring_pts(z, rx, ry, a0, a1, n)


flap = []
for k in range(6):
    t = k / 5
    z = hz - (0.0 + t * 0.4) * H
    a0 = 0.95 - t * 0.15  # a frente da aba (lado esquerdo)
    a1 = 3.6 - t * 1.6  # nas costas ela é mais curta: termina antes conforme desce
    flap.append(flap_row(z, a0, a1, (0.186 + t * 0.03) * H, (0.142 + t * 0.03) * H))
fl = b.add('shirtFlap', shell_grid(flap, 0.005), plaid, region='skirt', subdiv=1)
relief(fl, lambda p: 0.004 * H * (ridge(math.atan2(p.x, p.y) * 9 + n3(p, 8), 2) - 0.4))  # o pano caindo em pregas

# o livro preso no lado direito da cintura, com a tira de couro
b.add('book', box((-0.19 * H, 0.0, hz - 0.03 * H), (0.035, 0.12, 0.15), bevel=0.005), book, region='torso', subdiv=0)
b.add('bookStrap', box((-0.2 * H, 0.0, hz - 0.03 * H), (0.04, 0.022, 0.155)), beltm, region='torso', subdiv=0)

# ================================================================ CABELO preto bagunçado até os ombros + a mecha VERMELHA
HC = Vector((hc.x, hc.y, hc.z))
Hr = Sculpt()
Hr.ell(HC + Vector((0, 0.01 * H, 0.035 * H)), (0.158 * H, 0.164 * H, 0.155 * H))  # a massa no alto da cabeça
Hr.chain([HC + Vector((0, 0.1 * H, 0.0)), HC + Vector((0, 0.12 * H, -0.1 * H)), HC + Vector((0, 0.1 * H, -0.2 * H))], [0.12 * H, 0.11 * H, 0.06 * H], step=0.5)
for s in (1, -1):  # os lados caindo até os ombros, abrindo para fora nas pontas
    Hr.chain([HC + Vector((s * 0.12 * H, 0.0, 0.02 * H)), HC + Vector((s * 0.145 * H, 0.03 * H, -0.08 * H)), HC + Vector((s * 0.15 * H, 0.05 * H, -0.18 * H))],
             [0.04 * H, 0.04 * H, 0.022 * H], step=0.5)
# as mechas bagunçadas: saem da massa, descem rentes e só as pontas abrem para fora (camadas, não bolas)
for i in range(22):
    a = 1.0 + (i / 21) * (TAU - 2.0) + random.uniform(-0.06, 0.06)
    out = Vector((math.sin(a), -math.cos(a) * 0.95, 0))
    z0 = 0.08 * H - (i % 3) * 0.05 * H
    base = HC + out * 0.14 * H + Vector((0, 0, z0))
    mid = HC + out * 0.155 * H + Vector((0, 0, z0 - 0.09 * H))
    tip = HC + out * (0.17 + random.random() * 0.04) * H + Vector((0, 0, max(z0 - 0.2 * H, -0.22 * H) - random.random() * 0.03 * H))
    Hr.chain([base, mid, tip], [0.03 * H, 0.022 * H, 0.007 * H], step=0.35)
# a franja picotada: do alto da cabeça para a testa, parando acima dos olhos
FR = []
for i in range(7):
    a = -0.8 + i * 0.27
    root = HC + Vector((math.sin(a) * 0.05 * H, -0.06 * H, 0.15 * H))
    mid = HC + Vector((math.sin(a) * 0.1 * H, -0.135 * H, 0.11 * H))
    tip = HC + Vector((math.sin(a) * 0.115 * H, -0.15 * H, (0.05 + (i % 2) * 0.02) * H))
    FR.append((root, mid, tip))
    Hr.chain([root, mid, tip], [0.03 * H, 0.022 * H, 0.006 * H], step=0.35)
Hr.ell(HC + Vector((0, -0.11 * H, -0.1 * H)), (0.118 * H, 0.1 * H, 0.14 * H), neg=True)  # o rosto livre
Hr.ell(HC + Vector((0, 0.01 * H, -0.04 * H)), (0.1 * H, 0.11 * H, 0.12 * H), neg=True)  # oco por dentro (sem atravessar a cabeça)


def strands(p):
    a = math.atan2(p.x - HC.x, p.y - HC.y)
    return 0.0035 * H * (ridge(a * 28 + n3(p, 20) * 1.6, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.007, smooth=3, disp=strands, target=2600), hairm, region='head', subdiv=0)
# a MECHA VERMELHA na franja, do lado direito (x < 0)
R = Sculpt()
root, mid, tip = FR[1]
fwd = Vector((0, -0.018 * H, 0.006 * H))
R.chain([root + fwd, mid + fwd, tip + fwd + Vector((0, 0, 0.01 * H))], [0.018 * H, 0.016 * H, 0.006 * H], step=0.35)
b.add('redStreak', R.mesh(res=0.005, smooth=2, disp=strands, target=500), hair_red, region='head', subdiv=0)

# o brinco de PENA na orelha esquerda (x > 0): argola, a haste e a pena com as barbas
ex = 0.135 * H
fz = hc.z - 0.05 * H
b.add('earring', rod([(ex, 0.0, fz), (ex + 0.004, 0.0, fz - 0.03 * H)], 0.0025, 4), silver, region='head', subdiv=0)
fth = [(ex + 0.006, 0.0, fz - 0.03 * H - t * 0.1 * H) for t in (0, 0.3, 0.6, 1.0)]
b.add('feather', rod(fth, [0.004 * H, 0.014 * H, 0.012 * H, 0.002 * H], 6, flat=(lambda p: Vector((1, 0, 0)), 0.25)), feather, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'aghata.blend'), check_existing=False)
