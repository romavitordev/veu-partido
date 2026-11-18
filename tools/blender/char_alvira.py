"""
ALVIRA — VAMPIROS (Hexatombe), a Primeira Vampira — public/models/alvira.glb.
Referência: wiki "Alvira" (a arte de corpo inteiro "Arte Alvira em Hexatombe" e a de costas):
  - 1,70 m, PÁLIDA; o SORRISO ENORME de dentes afiados e as ATADURAS costuradas sobre os olhos (face_alvira);
  - o cabelo VERMELHO longuíssimo, até os joelhos, caindo pela frente dos ombros; a franja dos lados do rosto;
  - o HÁBITO DE FREIRA preto justo no peito e até o chão, com a cauda; o VÉU ENORME preto da cabeça quase até o chão,
    com as pontas RASGADAS e as TIRAS EM X nas costas;
  - o DIADEMA dourado na testa com a haste alta e a cruz; as CRUZES DE SANGUE douradas (invertidas) penduradas na
    corrente da cintura;
  - os BRAÇOS MUTILADOS enfaixados (ataduras manchadas de sangue em espiral) e o pescoço enrolado nas ataduras.
O Cajado da Cruz de Sangue fica em código (src/models/props.js → addAlviraProps).
TÉCNICA: corpo pelo Builder (base da Sabara); saia por tube; véu por shell_grid (como a máscara da Cindy/Alê);
cabelo: CALOTA contínua no Sculpt (char_cindy.py) e as mechas longas por rod achatado afinando (char_guizo.py).
  node tools/blender/build.mjs alvira   → public/models/alvira.glb (+ tools/blender/fonte/alvira.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'alvira.glb'
random.seed(91)

b = Builder(width=0.9, bulk=0.86, height=0.945)  # 1,70 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_alvira', '#e6d8d2', 0.7)
habit = material('habit_alvira', '#121014', 0.85)
bandage = material('bandage_alvira', '#b8948a', 0.9)
M = {
    'skin': skin,
    'face': material('face_alvira', '#ffffff', 0.75),
    'torso': habit,
    'arm': bandage,  # os braços mutilados, enfaixados
    'hand': skin,
    'legs': habit,
    'feet': material('shoe_alvira', '#0a0a0c', 0.5),
}
habit_dk = material('habit_alvira_dk', '#0a080a', 0.9)
veil = material('veil_alvira', '#0e0c10', 0.85)
blood = material('bandage_alvira_blood', '#6a1418', 0.8)
gold = material('gold_alvira', '#d0a040', 0.3, metal=0.9)
hairm = material('hair_alvira', '#8a1418', 0.65)
strap = material('strap_alvira', '#1a1216', 0.7)

PREVIEW = {'face_alvira': '#e6d8d2'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.11, 0.15), (0.0, 0.15), (0.17, 0.122), (0.36, 0.16), (0.47, 0.17), (0.57, 0.104), (0.63, 0.058)]
hc = b.body(M, TP, arm_r=(0.046, 0.04, 0.034), leg_r=(0.074, 0.058, 0.044), head_r=(0.13, 0.142, 0.156))
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))

# ================================================================ o HÁBITO: a saia longa até o chão, com a cauda atrás
SK = [(hz + 0.06 * H, 0.168, 0.132, 0.0), (hz - 0.05 * H, 0.182, 0.15, 0.004), (hz - 0.3 * H, 0.2, 0.172, 0.012),
      (hz - 0.55 * H, 0.222, 0.196, 0.024), (0.14 * H, 0.25, 0.23, 0.04), (0.02 * H, 0.28, 0.27, 0.07)]
so = b.add('habitSkirt', tube([(0, cy * H, z, rx * H, ry * H) for z, rx, ry, cy in SK], 48, cap_start=False, cap_end=False), habit, region='skirt', subdiv=1)
relief(so, lambda p: (0.003 + 0.012 * max(0.0, min(1.0, (hz - p.z) / (0.9 * H)))) * H * ridge(math.atan2(p.x, -p.y) * 7 + n3(p, 4) * 1.4, 2))
b.add('habitSkirtIn', tube([(0, cy * H, z, rx * H * 0.96, ry * H * 0.96) for z, rx, ry, cy in SK[3:]], 48, cap_start=False, cap_end=False), habit_dk, region='skirt', subdiv=0)
# a gola alta do hábito e as ATADURAS enroladas no pescoço (descendo dos olhos)
for k in range(5):
    z = 1.56 * H + k * 0.026 * H
    r = 0.064 * H + 0.002 * H * math.sin(k * 2.1)
    b.add(f'neckWrap{k}', rod([(math.sin(a) * r, -0.004 * H - math.cos(a) * r * 0.98, z + 0.006 * H * math.sin(a + k)) for a in [i / 24 * TAU for i in range(25)]], 0.0085 * H, 5, caps=False), bandage if k % 2 == 0 else blood, region='neck', subdiv=0)

# ================================================================ a CORRENTE da cintura e as CRUZES DE SANGUE douradas (invertidas)
chain = [(math.sin(a) * 0.178 * H, -math.cos(a) * 0.142 * H, hz + 0.05 * H - 0.05 * H * math.cos(a) ** 2 * (math.cos(a) > 0)) for a in [-1.4 + 2.8 * i / 30 for i in range(31)]]
b.add('crossChain', rod(chain, 0.005 * H, 5), gold, region='torso', subdiv=0)
crosses = []
for x in (-0.11, -0.055, 0.0, 0.055, 0.11):
    a = math.asin(max(-1, min(1, x / 0.178)))
    p = Vector((x * H, -math.cos(a) * 0.15 * H - 0.008 * H, hz + 0.05 * H - 0.05 * H * math.cos(a) ** 2))
    L = (0.13 if x == 0 else 0.09) * H
    top = p + Vector((0, -0.006 * H, -0.02 * H))
    crosses.append(rod([p, top], 0.0025 * H, 4))  # o elo
    crosses.append(box(tuple(top + Vector((0, 0, -L / 2))), (0.012 * H, 0.008 * H, L), bevel=0.002))
    crosses.append(box(tuple(top + Vector((0, 0, -L * 0.72))), (L * 0.55, 0.008 * H, 0.012 * H), bevel=0.002))  # invertida: a travessa embaixo
b.add('bloodCrosses', merge(*crosses), gold, region='skirt', subdiv=0)

# ================================================================ os BRAÇOS MUTILADOS: as ataduras em espiral manchadas de sangue
for side in ('L', 'R'):
    s_, e_, h_ = sk['s' + side], sk['e' + side], sk['hand' + side]
    for seg_, (a_, c_, r0, r1) in enumerate(((s_, e_, 0.05, 0.043), (e_, h_, 0.043, 0.036))):
        ax = (c_ - a_)
        t_ = ax.normalized()
        u_ = t_.orthogonal().normalized()
        v_ = t_.cross(u_)
        pts = []
        N = 60
        for i in range(N + 1):
            q = i / N
            ang = q * TAU * 5 + seg_ * 1.3
            r = (r0 + (r1 - r0) * q + 0.004) * H
            pts.append(a_ + ax * (0.04 + 0.92 * q) + (u_ * math.cos(ang) + v_ * math.sin(ang)) * r)
        b.add(f'armWrap{side}{seg_}', rod(pts, 0.006 * H, 4), blood if seg_ == 1 else bandage, region=('e' + side) if seg_ else ('arm' + side), subdiv=0)

# ================================================================ o VÉU ENORME: da cabeça quase até o chão, aberto só no rosto e na frente
# linhas (z, rx, ry, cy, meia-abertura A em volta das costas): no alto abraça a cabeça, desce largo pelas costas
VR = [(HC.z + 0.232 * H, 0.004, 0.004, hc.y + 0.015 * H, 3.14), (HC.z + 0.2 * H, 0.14, 0.15, hc.y + 0.015 * H, 3.05), (HC.z + 0.11 * H, 0.178, 0.19, hc.y + 0.014 * H, 2.72),
      (HC.z + 0.02 * H, 0.182, 0.192, hc.y + 0.016 * H, 2.5), (HC.z - 0.08 * H, 0.172, 0.172, hc.y + 0.022 * H, 2.45), (sk['sL'].z + 0.02 * H, 0.25, 0.18, 0.02 * H, 2.25),
      (hz + 0.35 * H, 0.27, 0.2, 0.04 * H, 2.2), (hz, 0.28, 0.22, 0.06 * H, 2.15), (0.42 * H, 0.3, 0.25, 0.08 * H, 2.1)]
NC = 32
rows = []
for z, rx, ry, cy, A in VR:
    rows.append([Vector((math.sin(a) * rx * H, cy - math.cos(a) * ry * H, z)) for a in [math.pi - A + 2 * A * i / NC for i in range(NC + 1)]])
# a barra RASGADA: pontas de comprimentos diferentes, umas quase no chão
last = VR[-1]
jag = [Vector((math.sin(a) * (last[1] + 0.02) * H, last[3] + 0.02 * H - math.cos(a) * (last[2] + 0.02) * H, (0.1 + 0.16 * (i % 2) + random.uniform(-0.04, 0.04)) * H))
       for i, a in enumerate([math.pi - last[4] + 2 * last[4] * i / NC for i in range(NC + 1)])]
rows.append(jag)
vh = shell_grid(rows[:6], 0.006)
b.add('veilHood', vh, veil, region='head', subdiv=1)
vm = b.add('veilMantle', shell_grid(rows[5:], 0.006), veil, region='torso', subdiv=1)
relief(vm, lambda p: 0.006 * H * max(0.0, min(1.0, (sk['sL'].z - p.z) / (0.5 * H))) * ridge(math.atan2(p.x, p.y) * 9 + n3(p, 3), 2))
# as TIRAS EM X nas costas do véu
for s in (1, -1):
    pts = []
    for q in range(9):
        t = q / 8
        z = sk['sL'].z - 0.02 * H - t * (sk['sL'].z - hz - 0.05 * H)
        x = s * (0.2 - 0.4 * t) * H
        k = max(0.0, 1 - (x / (0.29 * H)) ** 2)
        pts.append((x, 0.04 * H + math.sqrt(k) * 0.215 * H + 0.012 * H, z))
    b.add(f'veilStrap{s}', rod(pts, 0.012 * H, 5, flat=(outward((0, 0.04 * H)), 0.3)), strap, region='torso', subdiv=0)

# ================================================================ o DIADEMA dourado: a faixa na testa, a haste alta e a cruz
dia = [Vh(math.sin(a) * 0.15, -math.cos(a) * 0.158 + 0.012, 0.095 + 0.008 * math.cos(a)) for a in [-1.0 + 2.0 * i / 16 for i in range(17)]]
b.add('diadem', rod(dia, 0.006 * H, 5), gold, region='head', subdiv=0)
spike_base = Vh(0, -0.15, 0.11)
b.add('diademSpike', rod([spike_base, spike_base + Vector((0, 0.01 * H, 0.16 * H)), spike_base + Vector((0, 0.016 * H, 0.3 * H))], [0.008 * H, 0.006 * H, 0.002 * H], 5), gold, region='head', subdiv=0)
b.add('diademCross', rod([spike_base + Vector((-0.035 * H, 0.012 * H, 0.2 * H)), spike_base + Vector((0.035 * H, 0.012 * H, 0.2 * H))], 0.005 * H, 5), gold, region='head', subdiv=0)
b.add('diademGem', ellipsoid(tuple(spike_base + Vector((0, -0.004 * H, 0.0))), (0.014 * H, 0.008 * H, 0.016 * H), 10, 6), blood, region='head', subdiv=0)

# ================================================================ o CABELO VERMELHO: a calota contínua sob o véu, a franja e as mechas até os joelhos
Hr = Sculpt()
Hr.ell(Vh(0, 0.012, 0.045), (0.15 * H, 0.16 * H, 0.148 * H))
Hr.ell(Vh(0, 0.05, -0.02), (0.14 * H, 0.13 * H, 0.13 * H))
Hr.ell(Vh(0, -0.135, -0.06), (0.11 * H, 0.1 * H, 0.13 * H), neg=True)
b.add('hairCap', Hr.mesh(res=0.006, smooth=2, disp=lambda p: 0.003 * H * (ridge(math.atan2(p.x - HC.x, p.y - HC.y) * 16, 2) - 0.4), target=2500), hairm, region='head', subdiv=0)
bangs = []
for i in range(8):  # a franja dos lados do rosto, caindo sobre as ataduras (o meio fica livre: o sorriso)
    s = 1 if i % 2 else -1
    x = s * (0.05 + 0.07 * (i // 2) / 3)
    st = Vh(x, -0.145 + abs(x) * 0.35, 0.1)
    ln = 0.07 + 0.05 * (i // 2) / 3 + 0.02 * random.random()
    pts = [st + Vector((s * 0.01 * H * q, -0.012 * H * math.sin(q * 1.4), -ln * H * q)) for q in (0, 0.33, 0.66, 1.0)]
    bangs.append(rod(pts, [0.02 * H, 0.018 * H, 0.011 * H, 0.003 * H], 5, flat=(lambda p: p - HC, 0.45)))
b.add('hairBangs', merge(*bangs), hairm, region='head', subdiv=0)
locks = []
for i in range(28):  # as MECHAS LONGAS: das têmporas, por cima dos ombros, pela frente do corpo até os joelhos
    s = 1 if i % 2 else -1
    j = i // 2
    front = j < 9  # as da frente emolduram o tronco; as outras descem por fora do braço
    sh = sk['s' + ('L' if s == 1 else 'R')]
    t0 = Vh(s * (0.118 + 0.012 * random.random()), -0.05 + 0.012 * j, 0.01 - 0.008 * j)
    if front:
        x1, y1 = abs(sh.x) * 0.62 + 0.004 * j * H, -0.115 - 0.004 * j
        x2 = 0.1 + 0.008 * j + random.uniform(-0.005, 0.005)
        y2 = -0.15 + 0.004 * j
    else:
        k = j - 9
        x1, y1 = abs(sh.x) * 0.85, -0.04 + 0.02 * k
        x2 = 0.2 + 0.006 * k
        y2 = -0.03 + 0.025 * k
    ln = 0.95 - (0.0 if front else 0.08) + random.uniform(-0.07, 0.03)
    pts = [t0,
           Vector((s * x1, y1 * H, sh.z + 0.035 * H)),
           Vector((s * x2 * H, y2 * H, sh.z - 0.12 * H)),
           Vector((s * (x2 + 0.01) * H, (y2 - 0.01) * H, sh.z - 0.45 * H)),
           Vector((s * (x2 + 0.025) * H, (y2 - 0.02) * H, sh.z - ln * H))]
    locks.append(rod(pts, [0.014 * H, 0.02 * H, 0.019 * H, 0.014 * H, 0.002 * H], 5, flat=(outward((0, 0)), 0.4)))
b.add('hairLocks', merge(*locks), hairm, region='chest', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'alvira.blend'), check_existing=False)
