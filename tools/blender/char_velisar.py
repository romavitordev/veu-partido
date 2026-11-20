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
coat = material('coat_velisar', '#141214', 0.8)
tunic = material('tunic_velisar', '#8a6428', 0.85)
M = {
    'skin': skin,
    'face': material('face_velisar', '#ffffff', 0.7),
    'torso': tunic,
    'arm': coat,  # as mangas do sobretudo
    'hand': skin,
    'legs': tunic,
    'feet': material('shoe_velisar', '#0c0a0a', 0.5),
}
tunic_dk = material('tunic_velisar_dk', '#5a4018', 0.9)
scarf = material('scarf_velisar', '#9a6a24', 0.9)
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
      (hz - 0.62 * H, 0.23, 0.2, 0.02), (0.1 * H, 0.31, 0.29, 0.03), (0.01 * H, 0.38, 0.36, 0.04)]
so = b.add('tunicSkirt', tube([(0, cy * H, z, rx * H, ry * H) for z, rx, ry, cy in SK], 48, cap_start=False, cap_end=False), tunic, region='skirt', subdiv=1)
relief(so, lambda p: (0.003 + 0.014 * max(0.0, min(1.0, (hz - p.z) / (0.9 * H)))) * H * ridge(math.atan2(p.x, -p.y) * 6 + n3(p, 4) * 1.5, 2))
b.add('tunicSkirtIn', tube([(0, cy * H, z, rx * H * 0.96, ry * H * 0.96) for z, rx, ry, cy in SK[3:]], 48, cap_start=False, cap_end=False), tunic_dk, region='skirt', subdiv=0)
# as pontas rasgadas da barra espalhadas no chão
tips = []
for i in range(14):
    a = i / 14 * TAU + random.uniform(-0.1, 0.1)
    r0x, r0y = SK[-1][1] * H, SK[-1][2] * H
    base = Vector((math.sin(a) * r0x, SK[-1][3] * H - math.cos(a) * r0y, 0.015 * H))
    tip = Vector((math.sin(a) * (r0x + random.uniform(0.06, 0.14) * H), SK[-1][3] * H - math.cos(a) * (r0y + random.uniform(0.06, 0.14) * H), 0.004 * H))
    tips.append(cone(tuple(base), tuple(tip), 0.035 * H, 4))
b.add('tunicTips', merge(*tips), tunic, region='skirt', subdiv=0)

# ================================================================ a GOLA ALTA: o cachecol ocre enrolado no pescoço
for k in range(4):
    z = 1.53 * H + k * 0.032 * H
    r = (0.075 - 0.004 * k) * H
    b.add(f'scarf{k}', rod([(math.sin(a) * r, -0.006 * H - math.cos(a) * r * 0.96, z + 0.008 * H * math.sin(a * 2 + k)) for a in [i / 24 * TAU for i in range(25)]], 0.016 * H, 6, caps=False), scarf, region='neck', subdiv=0)
b.add('scarfDrop', rod([(0.02 * H, -0.08 * H, 1.53 * H), (0.03 * H, -0.14 * H, 1.42 * H), (0.025 * H, -0.165 * H, 1.3 * H)], [0.028 * H, 0.03 * H, 0.022 * H], 6, flat=(outward((0, 0)), 0.5)), scarf, region='chest', subdiv=0)

# ================================================================ o SOBRETUDO PRETO: o peito e os ombros (aberto na frente) e as abas até os joelhos
UP = [(0.38, 0.164, 0.13, 2.45), (0.47, 0.178, 0.14, 2.55), (0.53, 0.16, 0.122, 2.65), (0.58, 0.122, 0.098, 2.75)]
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


# a pelerine dos ombros: abre larga como as asas, aberta na frente
cape = bat_edge(sk['sL'].z + 0.02 * H, 0.3 * H, 0.2 * H, math.pi - 2.75, math.pi + 2.75, 9, 0.24 * H)
collar_top = [Vector((p.x * 0.3, p.y * 0.42 - 0.01 * H, 1.6 * H)) for p in cape[0]]
b.add('batCape', shell_grid([collar_top, cape[0], cape[1]], 0.006), teal, region='chest', subdiv=1)
# as varetas da asa (as nervuras escuras)
ribs = []
for i in range(0, len(cape[0]), 4):
    ribs.append(rod([collar_top[i], cape[0][i], cape[1][i]], 0.005 * H, 4))
b.add('batRibs', merge(*ribs), teal_dk, region='chest', subdiv=0)
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
