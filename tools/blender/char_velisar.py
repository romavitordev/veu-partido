"""
VELISAR — VAMPIROS (Hexatombe), o ator do cinema mudo — public/models/velisar.glb.
Referência: wiki "Velisar" (a arte de corpo inteiro "Arte Velisar em Hexatombe"):
  - 2 m, ESGUIO, membros longos, pele VERMELHO-ESCURA; careca com os CORTES na cabeça, os buracos dos olhos, as
    orelhas LONGAS e pontudas e os dentes longos (face_velisar); os dedos longos com GARRAS;
  - a TÚNICA amarelo-ocre até o chão, abrindo em pontas rasgadas; a gola alta enrolada (o cachecol ocre);
  - o SOBRETUDO PRETO (aberto na frente, as abas até os joelhos) com os BABADOS DE ASA DE MORCEGO azul-petróleo nos
    ombros, nos punhos e na barra, cada ponta com um PINGENTE de metal; as TIRAS azuis penduradas com a ponta de metal.
TÉCNICA: corpo pelo Builder (base da Sabara/Alvira); túnica por tube; sobretudo como casca + open_tube (Sabara);
babados por shell_grid com a barra recortada em pontas; garras e pingentes por cone.
  node tools/blender/build.mjs velisar   → public/models/velisar.glb (+ tools/blender/fonte/velisar.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'velisar.glb'
random.seed(131)

b = Builder(width=0.9, bulk=0.78, height=1.11)  # 2,0 m, esguio
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_velisar', '#9a4a44', 0.7)
coat = material('coat_velisar', '#1c1614', 0.8)
tunic = material('tunic_velisar', '#5e3a1c', 0.85)  # a túnica marrom (a arte: marrom-terra, mais clara no peito)
vest = material('vest_velisar', '#94561e', 0.85)
M = {
    'skin': skin,
    'face': material('face_velisar', '#ffffff', 0.7),
    'torso': vest,
    'arm': coat,  # as mangas do sobretudo
    'hand': skin,
    'legs': tunic,
    'feet': material('shoe_velisar', '#0c0a0a', 0.5),
}
tunic_dk = material('tunic_velisar_dk', '#3a2210', 0.9)
scarf = material('scarf_velisar', '#a4501c', 0.9)
teal = material('wing_velisar', '#2e6a72', 0.6)
teal_dk = material('wing_velisar_dk', '#1a3e44', 0.7)
metal = material('pendant_velisar', '#b8bcc4', 0.25, metal=0.9)
claw = material('claw_velisar', '#2a1612', 0.45)
coat_dk = material('coat_velisar_dk', '#0a080a', 0.85)

PREVIEW = {'face_velisar': '#9a4a44'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.11, 0.14), (0.0, 0.14), (0.17, 0.118), (0.36, 0.15), (0.47, 0.17), (0.57, 0.1), (0.63, 0.055)]
hc = b.body(M, TP, arm_r=(0.044, 0.038, 0.032), leg_r=(0.066, 0.052, 0.04), head_r=(0.122, 0.138, 0.162))
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))

# ================================================================ a TÚNICA ocre até o chão, abrindo em pontas rasgadas
SK = [(hz + 0.06 * H, 0.158, 0.122, 0.0), (hz - 0.08 * H, 0.17, 0.138, 0.004), (hz - 0.35 * H, 0.19, 0.16, 0.01),
      (hz - 0.62 * H, 0.21, 0.19, 0.025), (0.14 * H, 0.24, 0.23, 0.045), (0.05 * H, 0.27, 0.28, 0.07), (0.008 * H, 0.3, 0.33, 0.1)]
# (passe no Blender MCP, 2026-11-20: a barra abria 1,7 m e virava um vulcão de pontas; agora cai reta e arrasta atrás)
so = b.add('tunicSkirt', tube([(0, cy * H, z, rx * H, ry * H) for z, rx, ry, cy in SK], 48, cap_start=False, cap_end=False), tunic, region='skirt', subdiv=1)
relief(so, lambda p: (0.003 + 0.014 * max(0.0, min(1.0, (hz - p.z) / (0.9 * H)))) * H * ridge(math.atan2(p.x, -p.y) * 6 + n3(p, 4) * 1.5, 2))
b.add('tunicSkirtIn', tube([(0, cy * H, z, rx * H * 0.96, ry * H * 0.96) for z, rx, ry, cy in SK[3:]], 48, cap_start=False, cap_end=False), tunic_dk, region='skirt', subdiv=0)
# as pontas rasgadas da barra espalhadas no chão
tips = []
for i in range(18):
    a = i / 18 * TAU + random.uniform(-0.08, 0.08)
    r0x, r0y = SK[-1][1] * H, SK[-1][2] * H
    back = max(0.0, -math.cos(a))  # 0 na frente, 1 atrás
    ln = random.uniform(0.02, 0.05) * H + back ** 1.5 * random.uniform(0.12, 0.2) * H  # a cauda arrasta atrás
    base = Vector((math.sin(a) * r0x * 0.97, SK[-1][3] * H - math.cos(a) * r0y * 0.97, 0.012 * H))
    tip = Vector((math.sin(a) * (r0x + ln), SK[-1][3] * H - math.cos(a) * (r0y + ln), 0.003 * H))
    tips.append(cone(tuple(base), tuple(tip), 0.04 * H, 4))
b.add('tunicTips', merge(*tips), tunic, region='skirt', subdiv=0)

# ================================================================ a GOLA ALTA: o cachecol ocre enrolado no pescoço
SCZ = [(1.49, 0.088, 0.084), (1.53, 0.094, 0.09), (1.57, 0.09, 0.086), (1.61, 0.084, 0.08), (1.645, 0.074, 0.07)]
sc = b.add('scarf', tube([(0, -0.008 * H, z * H, rx * H, ry * H) for z, rx, ry in SCZ], 28, cap_start=False, cap_end=True), scarf, region='neck', subdiv=1)
# as voltas do pano: faixas em espiral (não molas soltas)
relief(sc, lambda p: 0.007 * H * ridge((p.z / H) * 95 + math.atan2(p.x, -p.y) * 0.9 + n3(p, 10) * 0.8, 2))
b.add('scarfDrop', rod([(0.02 * H, -0.08 * H, 1.53 * H), (0.03 * H, -0.14 * H, 1.42 * H), (0.025 * H, -0.165 * H, 1.3 * H)], [0.028 * H, 0.03 * H, 0.022 * H], 6, flat=(outward((0, 0)), 0.5)), scarf, region='chest', subdiv=0)

# ================================================================ o SOBRETUDO PRETO: o peito e os ombros (aberto na frente) e as abas até os joelhos
UP = [(0.16, 0.166, 0.134, 2.5), (0.27, 0.16, 0.128, 2.45), (0.38, 0.164, 0.13, 2.45), (0.47, 0.178, 0.14, 2.55), (0.53, 0.16, 0.122, 2.65), (0.58, 0.122, 0.098, 2.75)]
rows = [ring_pts(hz + dz * H, (rx + 0.01) * H, (ry + 0.01) * H, math.pi - a, math.pi + a, 26) for dz, rx, ry, a in UP]
b.add('coatTop', shell_grid(rows, 0.008), coat, region='torso', subdiv=1)
GAP = 0.13
CZ = [hz + 0.2 * H, hz + 0.02 * H, hz - 0.25 * H, hz - 0.52 * H]
rings = [(z, 0.17 * H * (1.0 + 0.1 * k), 0.135 * H * (1.0 + 0.12 * k)) for k, z in enumerate(CZ)]
co = b.add('coatSkirt', open_tube(rings, gap=GAP, seg=44), coat, region='skirt', subdiv=1)
relief(co, lambda p: 0.006 * H * ridge(math.atan2(p.x, -p.y) * 5 + n3(p, 5), 2))
b.add('coatSkirtIn', open_tube([(z, rx * 0.95, ry * 0.95) for z, rx, ry in rings], gap=GAP + 0.01, seg=44), coat_dk, region='skirt', subdiv=1)

# ================================================================ os BABADOS DE ASA DE MORCEGO: a pelerine nos ombros e a barra do sobretudo
pend = []


def bat_edge(z_of, rx, ry, a0, a1, n, depth):
    """Uma fileira de babados: os arcos entre as 'varetas' da asa, cada ponta com o pingente de metal."""
    top = []
    bot = []
    for i in range(n * 4 + 1):
        a = a0 + (a1 - a0) * i / (n * 4)
        q = (i % 4) / 4
        sag = depth * (1 - math.sin(q * math.pi) * 0.75) if i % 4 else depth * 1.25  # as pontas descem mais
        x, y = math.sin(a) * rx, -math.cos(a) * ry
        top.append(Vector((x, y, z_of)))
        bot.append(Vector((x * 1.08, y * 1.08, z_of - sag)))
        if i % 4 == 0:
            p = Vector((x * 1.09, y * 1.09, z_of - sag))
            pend.append(cone(tuple(p), tuple(p + Vector((0, 0, -0.045 * H))), 0.008 * H, 5))
    return [top, bot]


# A GOLA DE ASA DE MORCEGO (a arte: sobe atrás da cabeça como uma gola alta e desce em pontas sobre os ombros). As
# VARETAS saem da base do pescoço; entre elas a membrana se recorta em arco (o babado). Ângulo 0 = frente (-y),
# aberta na frente. Atrás a gola SOBE até a altura das orelhas; nos lados ela CAI sobre os ombros e o alto do braço.
NECK_Z = 1.53 * H
N_RIBS = 13
A0, A1 = 0.62, TAU - 0.62


def collar_outer(a):
    back = max(0.0, -math.cos(a))           # 1 atrás, 0 nos lados
    side = abs(math.sin(a))                 # 1 nos lados
    r = (0.19 + 0.17 * side * (1 - back) + 0.07 * back) * H
    z = NECK_Z + (-0.16 * side * (1 - back) + 0.32 * back ** 1.3) * H
    return Vector((math.sin(a) * r * 1.15, -math.cos(a) * r * 0.95 + 0.03 * H, z))


def collar_inner(a):
    return Vector((math.sin(a) * 0.072 * H, -math.cos(a) * 0.066 * H - 0.004 * H, NECK_Z + 0.02 * H))


SEG = N_RIBS - 1
NS = SEG * 6
rows = [[], [], [], []]
for i in range(NS + 1):
    a = A0 + (A1 - A0) * i / NS
    q = (i % 6) / 6
    scal = 1 - 0.3 * math.sin(q * math.pi)  # o recorte em arco entre duas varetas
    pi_, po = collar_inner(a), collar_outer(a)
    edge = pi_.lerp(po, scal)
    mid1 = pi_.lerp(po, 0.36 * scal)
    mid2 = pi_.lerp(po, 0.7 * scal)
    # a membrana estufa um pouco para fora entre as varetas (não é uma folha plana)
    bulge = Vector((math.sin(a), -math.cos(a), 0)) * (0.012 * H * math.sin(q * math.pi))
    rows[0].append(pi_)
    rows[1].append(mid1 + bulge * 0.6)
    rows[2].append(mid2 + bulge)
    rows[3].append(edge)
cape = b.add('batCape', shell_grid(rows, 0.007), teal, region='chest', subdiv=1)
relief(cape, lambda p: 0.0025 * H * n3(p, 18))
ribs = []
for k in range(N_RIBS):
    a = A0 + (A1 - A0) * k / SEG
    pi_, po = collar_inner(a), collar_outer(a)
    d = (po - pi_).normalized()
    tip = po + d * 0.05 * H
    ribs.append(rod([pi_, pi_.lerp(po, 0.5) + Vector((0, 0, 0.004 * H)), po], [0.008 * H, 0.0065 * H, 0.005 * H], 5))
    pend.append(cone(tuple(po), tuple(tip), 0.009 * H, 5))  # a garra de metal na ponta de cada vareta
b.add('batRibs', merge(*ribs), teal_dk, region='chest', subdiv=0)
# a faixa de babado no QUADRIL (a arte: a barra do paletó acaba no quadril com a faixa azul recortada)
waist = bat_edge(hz - 0.02 * H, 0.172 * H, 0.142 * H, GAP * TAU, TAU - GAP * TAU, 9, 0.075 * H)
waist_top = [Vector((p.x, p.y, p.z + 0.045 * H)) for p in waist[0]]
b.add('batWaist', shell_grid([waist_top, waist[0], waist[1]], 0.006), teal, region='skirt', subdiv=1)
# a barra do sobretudo em babados
hem = bat_edge(CZ[-1] + 0.02 * H, rings[-1][1], rings[-1][2], GAP * TAU, TAU - GAP * TAU, 8, 0.1 * H)
hem_top = [Vector((p.x, p.y, p.z + 0.07 * H)) for p in hem[0]]
b.add('batHem', shell_grid([hem_top, hem[0], hem[1]], 0.006), teal, region='skirt', subdiv=1)
# os punhos em babado
for side in ('L', 'R'):
    c = sk['e' + side].lerp(sk['hand' + side], 0.78)
    for k in range(5):
        a = k / 5 * TAU
        p0 = Vector((c.x + math.sin(a) * 0.05 * H, c.y - math.cos(a) * 0.05 * H, c.z + 0.02 * H))
        p1 = Vector((c.x + math.sin(a) * 0.085 * H, c.y - math.cos(a) * 0.085 * H, c.z - 0.07 * H))
        b.add(f'cuff{side}{k}', rod([p0, p1], [0.022 * H, 0.008 * H], 4, flat=(outward((c.x, c.y)), 0.2)), teal, region='e' + side, subdiv=0)
        pend.append(cone(tuple(p1), tuple(p1 + Vector((0, 0, -0.035 * H))), 0.006 * H, 4))
# as TIRAS azuis penduradas (do peito e da cintura), com a ponta de metal
for i, (x, z, ln) in enumerate(((0.13, hz + 0.45 * H, 0.42), (-0.14, hz + 0.43 * H, 0.38), (0.17, hz + 0.02 * H, 0.5), (-0.17, hz, 0.46), (0.2, hz + 0.3 * H, 0.35))):
    y = -0.11 * H if abs(x) < 0.16 else -0.06 * H
    st = Vector((x * H, y, z))
    en = st + Vector((x * 0.1 * H, -0.012 * H, -ln * H))
    b.add(f'strap{i}', rod([st, st.lerp(en, 0.5) + Vector((0, -0.01 * H, 0)), en], 0.012 * H, 4, flat=(outward((0, 0)), 0.25)), teal, region='skirt' if z < hz + 0.1 * H else 'chest', subdiv=0)
    b.add(f'strapRing{i}', tube([(st.x, st.y, st.z - 0.006 * H, 0.016 * H, 0.016 * H), (st.x, st.y, st.z + 0.006 * H, 0.016 * H, 0.016 * H)], 10), metal, region='chest', subdiv=0)
    pend.append(cone(tuple(en), tuple(en + Vector((0, 0, -0.05 * H))), 0.01 * H, 5))
b.add('pendants', merge(*pend), metal, region='body', subdiv=0)

# ================================================================ as ORELHAS LONGAS e pontudas e as GARRAS dos dedos
for s in (1, -1):
    b.add(f'earTip{s}', cone((s * 0.115 * H + hc.x, hc.y + 0.015 * H, hc.z + 0.0 * H), (s * 0.2 * H + hc.x, hc.y + 0.06 * H, hc.z + 0.09 * H), 0.024 * H, 6), skin, region='head', subdiv=0)
for side in ('L', 'R'):
    e_, h_ = sk['e' + side], sk['hand' + side]
    d = (h_ - e_).normalized()
    side_v = d.cross(Vector((0, 0, 1))).normalized() if abs(d.z) < 0.99 else Vector((1, 0, 0))
    cl = []
    for k in range(4):
        base = h_ + d * 0.075 * H + side_v * ((k - 1.5) * 0.014 * H) + Vector((0, -0.01 * H, 0))
        cl.append(cone(tuple(base), tuple(base + d * 0.075 * H + Vector((0, -0.02 * H, 0))), 0.006 * H, 5))
    b.add(f'claws{side}', merge(*cl), claw, region='e' + side, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'velisar.blend'), check_existing=False)
