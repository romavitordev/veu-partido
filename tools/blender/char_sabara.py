"""
SABARA (Fenna) — VAMPIROS (Hexatombe), a batedora — public/models/sabara.glb.
Referência: wiki "Sabara" (arte de corpo inteiro "Sabara sem Máscara" e a capa dos Arquivos Secretos ed. 7):
  - 1,60 m, pele negra; os olhos ARRANCADOS, a boca deformada de dentes pontiagudos (face_sabara), as ORELHAS
    PONTUDAS e o cabelo escuro em TRANÇAS;
  - o SOBRETUDO VERMELHO de bordas brancas franzidas e detalhes dourados, CORTADO EM DOIS: a parte de cima (as mangas e
    os ombros) e a metade de baixo pendendo do cinto como uma SAIA longa aberta na frente;
  - o COLETE PRETO de gola alta com FIVELAS DOURADAS e o LAÇO BRANCO no peito; a calça social preta; os COTURNOS
    cerimoniais pretos com fivelas; as luvas pretas;
  - os CINTOS de couro cruzando o corpo com as FACAS PEQUENAS presas (várias na coxa) e a BAINHA marrom da espada na
    cintura; os ÓCULOS DE CAÇA de lentes vermelhas na testa e a BANDANA vermelha baixada no pescoço.
A espada e a adaga cerimonial ficam em código (src/models/props.js → addSabaraProps).
TÉCNICA (a da Artemis e do Raziel): corpo pelo Builder; casaco como CASCA e saia por open_tube; cintos e facas por rod.
  node tools/blender/build.mjs sabara   → public/models/sabara.glb (+ tools/blender/fonte/sabara.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'sabara.glb'
random.seed(83)

b = Builder(width=0.92, bulk=0.9, height=0.89)  # 1,60 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_sabara', '#5a3828', 0.75)
red = material('coat_sabara', '#9a141c', 0.75)
M = {
    'skin': skin,
    'face': material('face_sabara', '#ffffff', 0.75),
    'torso': material('vest_sabara', '#141216', 0.7),
    'arm': red,  # as mangas do sobretudo vermelho
    'hand': material('glove_sabara', '#0e0e10', 0.5),
    'legs': material('pants_sabara', '#16141a', 0.85),
    'feet': material('boot_sabara', '#0c0c0e', 0.4),
}
vest = M['torso']
red_dk = material('coat_sabara_dk', '#6a0c12', 0.75)
white = material('frill_sabara', '#ece6dc', 0.85)
gold = material('gold_sabara', '#d0a040', 0.3, metal=0.9)
leather = material('belt_sabara', '#3a2418', 0.65)
scab = material('scabbard_sabara', '#5a3820', 0.6)
steel = material('knife_sabara', '#c4c8d0', 0.25, metal=0.95)
sole = material('sole_sabara', '#060608', 0.8)
hairm = material('hair_sabara', '#141012', 0.7)
lens = material('lens_sabara', '#d01828', 0.15, emission='#ff2030', strength=0.6)
band_m = material('bandana_sabara', '#b01820', 0.85)

PREVIEW = {'face_sabara': '#5a3828'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.11, 0.155), (0.0, 0.155), (0.17, 0.13), (0.36, 0.168), (0.47, 0.18), (0.57, 0.108), (0.63, 0.06)]
hc = b.body(M, TP, arm_r=(0.05, 0.042, 0.036), leg_r=(0.078, 0.06, 0.046), head_r=(0.13, 0.142, 0.156))
top = 1.55 * H

# ================================================================ o COLETE PRETO: gola alta e as FIVELAS DOURADAS na frente
b.add('collar', tube([(0, -0.004 * H, 1.56 * H, 0.072 * H, 0.07 * H), (0, -0.004 * H, 1.68 * H, 0.08 * H, 0.078 * H)], 20), vest, region='neck', subdiv=0)
for k in range(4):
    z = hz + (0.14 + 0.09 * k) * H
    b.add(f'vestBuckle{k}', box((0.03 * H, -0.168 * H + 0.012 * H * (k == 3), z), (0.03 * H, 0.008 * H, 0.016 * H), bevel=0.002), gold, region='torso', subdiv=0)
    b.add(f'vestStrap{k}', box((0, -0.162 * H + 0.012 * H * (k == 3), z), (0.09 * H, 0.006 * H, 0.012 * H), bevel=0.002), vest, region='torso', subdiv=0)
# o LAÇO BRANCO no peito
for s in (1, -1):
    b.add(f'bow{s}', ellipsoid((s * 0.03 * H, -0.165 * H, hz + 0.53 * H), (0.03 * H, 0.012 * H, 0.02 * H), 10, 6), white, region='chest', subdiv=0)
    b.add(f'bowTail{s}', rod([(s * 0.006 * H, -0.168 * H, hz + 0.52 * H), (s * 0.02 * H, -0.17 * H, hz + 0.46 * H)], [0.01 * H, 0.006 * H], 4), white, region='chest', subdiv=0)
b.add('bowKnot', ellipsoid((0, -0.17 * H, hz + 0.53 * H), (0.012 * H, 0.01 * H, 0.012 * H), 8, 6), white, region='chest', subdiv=0)

# ================================================================ a PARTE DE CIMA do sobretudo: os ombros e o peito, aberta na frente
UP = [(0.4, 0.176, 0.14, 2.4), (0.47, 0.19, 0.148, 2.5), (0.53, 0.172, 0.13, 2.6), (0.58, 0.13, 0.104, 2.7)]
rows = [ring_pts(hz + dz * H, (rx + 0.008) * H, (ry + 0.008) * H, math.pi - a, math.pi + a, 26) for dz, rx, ry, a in UP]
b.add('coatTop', shell_grid(rows, 0.008), red, region='torso', subdiv=1)
for s in (1, -1):  # as bordas BRANCAS FRANZIDAS da abertura e as ombreiras douradas
    a = 2.45
    ed = [(math.sin(math.pi + s * a) * (0.186 * H), -math.cos(math.pi + s * a) * (0.146 * H), hz + z * H) for z in (0.4, 0.47, 0.53, 0.58)]
    b.add(f'frillTop{s}', rod(ed, 0.012 * H, 6), white, region='chest', subdiv=0)
    shp = sk['sL' if s == 1 else 'sR']
    b.add(f'epaulet{s}', ellipsoid((shp.x * 0.95, 0, shp.z + 0.02 * H), (0.06 * H, 0.06 * H, 0.02 * H), 12, 6), gold, region='chest', subdiv=0)
    # o punho branco franzido da manga
    side = 'L' if s == 1 else 'R'
    c = sk['e' + side].lerp(sk['hand' + side], 0.8)
    b.add(f'cuff{s}', tube([(c.x, c.y, c.z - 0.015 * H, 0.05 * H, 0.05 * H), (c.x, c.y, c.z + 0.02 * H, 0.046 * H, 0.046 * H)], 14), white, region='e' + side, subdiv=0)

# ================================================================ o CINTO e a METADE DE BAIXO do sobretudo pendendo como SAIA aberta
b.add('belt', tube([(0, 0.004 * H, hz + 0.02 * H, 0.168 * H, 0.134 * H), (0, 0.004 * H, hz + 0.07 * H, 0.164 * H, 0.13 * H)], 24), leather, region='torso', subdiv=0)
b.add('beltBuckle', box((0, -0.14 * H, hz + 0.045 * H), (0.04 * H, 0.01 * H, 0.04 * H), bevel=0.003), gold, region='torso', subdiv=0)
GAP = 0.11  # fração da volta aberta de cada lado da frente
SK_Z = [hz + 0.02 * H, hz - 0.25 * H, hz - 0.55 * H, 0.14 * H]
rings = [(z, 0.178 * H * (1.0 + 0.16 * k), 0.142 * H * (1.0 + 0.18 * k)) for k, z in enumerate(SK_Z)]
so = b.add('coatSkirt', open_tube(rings, gap=GAP, seg=44), red, region='skirt', subdiv=1)
relief(so, lambda p: (0.004 + 0.01 * max(0.0, min(1.0, (hz - p.z) / (0.8 * H)))) * H * ridge(math.atan2(p.x, -p.y) * 6 + n3(p, 5) * 1.3, 2))
b.add('coatSkirtIn', open_tube([(z, rx * 0.95, ry * 0.95) for z, rx, ry in rings], gap=GAP + 0.01, seg=44), red_dk, region='skirt', subdiv=1)
# a barra branca franzida da saia
hr = rings[-1]
hem = [(math.sin(a) * hr[1], -math.cos(a) * hr[2], hr[0] + 0.008 * H * math.sin(a * 14)) for a in [GAP * TAU + (TAU - 2 * GAP * TAU) * i / 40 for i in range(41)]]
b.add('skirtHem', rod(hem, 0.012 * H, 6), white, region='skirt', subdiv=0)
for s in (1, -1):  # as bordas da abertura da saia
    a = GAP * TAU * (1 if s == 1 else -1)
    ed = [(math.sin(a) * rx, -math.cos(a) * ry, z) for z, rx, ry in rings]
    b.add(f'skirtEdge{s}', rod(ed, 0.01 * H, 6), white, region='skirt', subdiv=0)

# ================================================================ os CINTOS cruzando o corpo com as FACAS PEQUENAS
for s in (1, -1):
    pts = [(s * 0.15 * H, -0.1 * H, hz + 0.57 * H), (s * 0.08 * H, -0.17 * H, hz + 0.42 * H), (-s * 0.06 * H, -0.165 * H, hz + 0.24 * H), (-s * 0.155 * H, -0.05 * H, hz + 0.1 * H),
           (-s * 0.12 * H, 0.12 * H, hz + 0.18 * H), (s * 0.05 * H, 0.16 * H, hz + 0.4 * H), (s * 0.15 * H, 0.1 * H, hz + 0.57 * H)]
    b.add(f'bandolier{s}', rod(pts, 0.011 * H, 5, flat=(outward((0, 0)), 0.3)), leather, region='chest', subdiv=0)
knives = []
grips = []
for i, (x, z) in enumerate(((-0.09, 0.4), (-0.03, 0.31), (0.06, 0.36), (0.1, 0.27))):  # facas no peito, cabo para cima
    p = Vector((x * H, -0.178 * H, hz + z * H))
    knives.append(cone(p, p + Vector((0, 0, -0.06 * H)), 0.01 * H, 4))
    grips.append(rod([p, p + Vector((0, -0.002 * H, 0.03 * H))], 0.006 * H, 5))
for side in ('L', 'R'):  # as facas na COXA: a tira de couro e três facas
    s = 1 if side == 'L' else -1
    l, k = sk['l' + side], sk['k' + side]
    for t in (0.3, 0.55):
        c = l.lerp(k, t)
        b.add(f'thighStrap{side}{t}', tube([(c.x, c.y, c.z - 0.01 * H, 0.078 * H, 0.078 * H), (c.x, c.y, c.z + 0.01 * H, 0.078 * H, 0.078 * H)], 16), leather, region='leg' + side, subdiv=0)
    for j in range(3):
        a = 0.3 + 0.35 * j
        d = Vector((s * math.sin(a), -math.cos(a), 0))
        c = l.lerp(k, 0.42)
        p = Vector((c.x, c.y, c.z)) + d * 0.082 * H
        knives.append(cone(p + Vector((0, 0, -0.02 * H)), p + Vector((0, 0, -0.1 * H)), 0.009 * H, 4))
        grips.append(rod([p + Vector((0, 0, -0.02 * H)), p + Vector((0, 0, 0.02 * H))], 0.006 * H, 5))
b.add('knives', merge(*knives), steel, region='body', subdiv=0)
b.add('knifeGrips', merge(*grips), leather, region='body', subdiv=0)
# a BAINHA marrom da espada, na cintura esquerda, inclinada para trás
b.add('scabbard', rod([(0.17 * H, -0.06 * H, hz + 0.02 * H), (0.2 * H, 0.08 * H, hz - 0.3 * H), (0.21 * H, 0.17 * H, hz - 0.58 * H)], [0.024 * H, 0.022 * H, 0.016 * H], 6), scab, region='torso', subdiv=0)
b.add('scabbardTip', cone((0.21 * H, 0.17 * H, hz - 0.58 * H), (0.212 * H, 0.185 * H, hz - 0.63 * H), 0.018 * H, 6), gold, region='torso', subdiv=0)

# ================================================================ os COTURNOS cerimoniais com fivelas
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    B = Sculpt()
    B.chain([k.lerp(f, 0.35), k.lerp(f, 0.75), f + Vector((0, 0.005 * H, 0.06 * H))], [0.054 * H, 0.05 * H, 0.048 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.05 * H, 0.11 * H, 0.042 * H))
    B.ell(f + Vector((0, 0.03 * H, 0.04 * H)), (0.046 * H, 0.046 * H, 0.05 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, target=900), M['feet'], region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.014 * H), (0.096 * H, 0.22 * H, 0.03 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
    for t in (0.45, 0.65):
        c = k.lerp(f, t)
        b.add(f'bootBuckle{side}{t}', box((c.x, c.y - 0.056 * H, c.z), (0.026 * H, 0.008 * H, 0.016 * H), bevel=0.002), gold, region='k' + side, subdiv=0)

# ================================================================ a cabeça: ORELHAS PONTUDAS, as TRANÇAS, os ÓCULOS e a BANDANA
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
for s in (1, -1):
    b.add(f'earTip{s}', cone((s * 0.13 * H + hc.x, hc.y + 0.01 * H, hc.z + 0.01 * H), (s * 0.19 * H + hc.x, hc.y + 0.04 * H, hc.z + 0.07 * H), 0.022 * H, 6), skin, region='head', subdiv=0)
Hr = Sculpt()
Hr.ell(Vh(0, 0.015, 0.045), (0.146 * H, 0.158 * H, 0.14 * H))
Hr.ell(Vh(0, 0.05, -0.03), (0.138 * H, 0.12 * H, 0.12 * H))
Hr.ell(Vh(0, -0.13, -0.06), (0.11 * H, 0.1 * H, 0.14 * H), neg=True)
Hr.ell(Vh(0.15, -0.0, -0.0), (0.03 * H, 0.05 * H, 0.05 * H), neg=True)
Hr.ell(Vh(-0.15, -0.0, -0.0), (0.03 * H, 0.05 * H, 0.05 * H), neg=True)
b.add('hairCap', Hr.mesh(res=0.006, smooth=2, disp=lambda p: 0.004 * H * (ridge(math.atan2(p.x - HC.x, p.y - HC.y) * 14, 2) - 0.4), target=3000), hairm, region='head', subdiv=0)
braids = []
for i in range(9):  # as TRANÇAS caindo pelas costas e pelos ombros
    a = -1.9 + 3.8 * i / 8
    st = HC + Vector((math.sin(a) * 0.13 * H, math.cos(a) * 0.12 * H + 0.02 * H, -0.02 * H))
    ln = 0.3 + 0.06 * random.random()
    pts = [st + Vector((math.sin(a) * 0.02 * H * t / 6, (0.02 + 0.01 * t / 6) * H, -ln * H * t / 6)) for t in range(7)]
    for t in range(6):  # os gomos da trança
        p0, p1 = pts[t], pts[t + 1]
        braids.append(ellipsoid(tuple(p0.lerp(p1, 0.5)), (0.018 * H, 0.018 * H, ln * H / 12 + 0.006 * H), 8, 6))
b.add('braids', merge(*braids), hairm, region='head', subdiv=0)
# os ÓCULOS DE CAÇA de lentes vermelhas na testa
for s in (1, -1):
    b.add(f'goggle{s}', tube([(s * 0.048 * H + hc.x, hc.y - 0.13 * H, hc.z + 0.1 * H, 0.032 * H, 0.032 * H), (s * 0.048 * H + hc.x, hc.y - 0.155 * H, hc.z + 0.11 * H, 0.03 * H, 0.03 * H)], 14), gold, region='head', subdiv=0)
    b.add(f'lens{s}', ellipsoid((s * 0.048 * H + hc.x, hc.y - 0.156 * H, hc.z + 0.11 * H), (0.026 * H, 0.006 * H, 0.026 * H), 12, 6), lens, region='head', subdiv=0)
b.add('goggleStrap', tube([(hc.x, hc.y + 0.0 * H, hc.z + 0.09 * H, 0.15 * H, 0.155 * H), (hc.x, hc.y + 0.0 * H, hc.z + 0.115 * H, 0.15 * H, 0.155 * H)], 24), leather, region='head', subdiv=0)
# a BANDANA vermelha baixada no pescoço
Bd = Sculpt()
Bd.ell(Vector((0, -0.02 * H, 1.6 * H)), (0.1 * H, 0.1 * H, 0.04 * H))
Bd.ell(Vector((0, -0.09 * H, 1.55 * H)), (0.06 * H, 0.035 * H, 0.06 * H))
b.add('bandana', Bd.mesh(res=0.006, smooth=3, disp=lambda p: 0.003 * H * (ridge(p.x / H * 40 + n3(p, 20), 2) - 0.4), target=900), band_m, region='neck', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'sabara.blend'), check_existing=False)
