"""
ZÉFERO — VAMPIROS (Hexatombe), o espécime do Velisar — public/models/zefero.glb.
Referência: wiki "Zéfero" (arte de corpo inteiro):
  - 1,70 m, magro e curvado; pele clara SUJA DE SANGUE; um pouco de cabelo escuro bagunçado no alto da cabeça; o rosto
    arranhado, os buracos dos olhos e a boca enorme de dentes (face_zefero); orelhas pontudas;
  - a CAMISA BRANCA de manga curta com BABADOS na gola e nas mangas, os SUSPENSÓRIOS escuros; a CALÇA azul-escura
    puxada até os joelhos (franzida); FAIXAS PRETAS enroladas nos antebraços e nas canelas; DESCALÇO, com garras;
  - o GRILHÃO de ferro com espinhos no pescoço e a CORRENTE pendurada na frente (a que o Velisar segura).
TÉCNICA: corpo pelo Builder (pés descalços); babados por cones achatados (rod); faixas por espiral de rod; corrente
por elos (rod fechado) alternando o plano.
  node tools/blender/build.mjs zefero   → public/models/zefero.glb (+ tools/blender/fonte/zefero.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'zefero.glb'
random.seed(171)

b = Builder(width=0.9, bulk=0.84, height=0.945)  # 1,70 m, magro
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_zefero', '#c9a294', 0.6)
shirt = material('shirt_zefero', '#d6c8b2', 0.85)
pants = material('pants_zefero', '#1e2840', 0.85)
M = {
    'skin': skin,
    'face': material('face_zefero', '#ffffff', 0.6),
    'torso': shirt,
    'arm': skin,
    'hand': skin,
    'legs': pants,
    'feet': skin,
}
blood = material('blood_zefero', '#5a0a0e', 0.35)
wrap = material('wrap_zefero', '#141214', 0.9)
susp = material('susp_zefero', '#2a1a14', 0.7)
iron = material('iron_zefero', '#4a4a50', 0.45, metal=0.8)
hair = material('hair_zefero', '#1a1210', 0.9)
claw = material('claw_zefero', '#3a2a20', 0.45)

PREVIEW = {'face_zefero': '#c49a8c'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.11, 0.135), (0.0, 0.135), (0.17, 0.112), (0.36, 0.148), (0.47, 0.17), (0.57, 0.1), (0.63, 0.058)]
hc = b.body(M, TP, arm_r=(0.046, 0.04, 0.034), leg_r=(0.07, 0.056, 0.042), head_r=(0.118, 0.13, 0.15), feet='bare')

# ================================================================ a CAMISA: mangas curtas com babado, gola de babado, manchas de sangue
for side in ('L', 'R'):
    s_, e_ = sk['s' + side], sk['e' + side]
    d = (e_ - s_)
    p0, p1 = s_ - d * 0.08, s_ + d * 0.42
    b.add(f'sleeve{side}', rod([p0, s_.lerp(p1, 0.5), p1], [0.075 * H, 0.068 * H, 0.062 * H], 12, caps=False), shirt, region='arm' + side, subdiv=1)
    fr = []
    dn = d.normalized()
    ax = dn.orthogonal().normalized()
    ay = dn.cross(ax)
    for k in range(9):
        a = k / 9 * TAU
        r = ax * math.cos(a) + ay * math.sin(a)
        base = p1 + r * 0.062 * H
        fr.append(cone(tuple(base - dn * 0.01 * H), tuple(base + r * 0.03 * H + dn * 0.035 * H), 0.018 * H, 4))
    b.add(f'sleeveFrill{side}', merge(*fr), shirt, region='arm' + side, subdiv=0)
# a gola de babado
fr = []
nz = 1.5 * H
for k in range(16):
    a = (k / 16 - 0.5) * TAU * 0.92
    base = Vector((math.sin(a) * 0.07 * H, -0.01 * H - math.cos(a) * 0.062 * H, nz))
    tip = Vector((math.sin(a) * 0.11 * H, -0.01 * H - math.cos(a) * 0.1 * H, nz - 0.035 * H))
    fr.append(cone(tuple(base), tuple(tip), 0.022 * H, 4))
b.add('collarFrill', merge(*fr), shirt, region='neck', subdiv=0)
# o babado do peitilho (a frente da camisa)
fr = []
for k in range(5):
    z = 1.42 * H - k * 0.05 * H
    base = Vector((0, -0.13 * H + k * 0.004 * H, z))
    fr.append(cone(tuple(base), tuple(base + Vector((0, -0.03 * H, -0.03 * H))), 0.03 * H, 4))
b.add('jabot', merge(*fr), shirt, region='chest', subdiv=0)
# manchas de sangue na camisa (placas finas rentes ao tronco)
spl = []
for k in range(9):
    a = random.uniform(-1.3, 1.3)
    z = hz + random.uniform(0.1, 0.5) * H
    rr = random.uniform(0.025, 0.05) * H
    rx = 0.15 * H + 0.012 * H
    c = Vector((math.sin(a) * rx, -math.cos(a) * 0.125 * H, z))
    c = Vector((c.x, c.y * 0.97, c.z))
    spl.append(ellipsoid(tuple(c), (rr * 0.45, rr * 0.08, rr * random.uniform(1.6, 2.6)), 8, 6))
b.add('shirtBlood', merge(*spl), blood, region='torso', subdiv=0)

# ================================================================ os SUSPENSÓRIOS
for s in (1, -1):
    pts = [(s * 0.06 * H, -0.135 * H, hz + 0.06 * H), (s * 0.075 * H, -0.15 * H, hz + 0.3 * H), (s * 0.085 * H, -0.12 * H, 1.45 * H),
           (s * 0.09 * H, -0.02 * H, 1.5 * H), (s * 0.08 * H, 0.1 * H, 1.44 * H), (s * 0.04 * H, 0.13 * H, hz + 0.3 * H), (s * 0.03 * H, 0.12 * H, hz + 0.06 * H)]
    b.add(f'susp{s}', rod(pts, 0.012 * H, 4, flat=(outward((0, 0)), 0.3)), susp, region='torso', subdiv=0)

# ================================================================ a CALÇA puxada até os joelhos (o rolo franzido) e as FAIXAS nas canelas
for side in ('L', 'R'):
    k_ = sk['k' + side]
    l_ = sk['l' + side]
    up = (l_ - k_).normalized()
    roll = rod([k_ + up * 0.02 * H - up * 0.0, k_ - up * 0.03 * H], [0.07 * H, 0.068 * H], 14, caps=False)
    ro = b.add(f'pantRoll{side}', roll, pants, region='k' + side, subdiv=1)
    relief(ro, lambda p: 0.006 * H * ridge(math.atan2(p.x - k_.x, p.y - k_.y) * 7 + n3(p, 9), 2))
    f_ = sk['foot' + side]
    a_, b_ = k_ - up * 0.07 * H, Vector((f_.x, f_.y, f_.z + 0.06 * H))
    pts = []
    turns = 7
    for i in range(turns * 10 + 1):
        t = i / (turns * 10)
        c = a_.lerp(b_, t)
        r = (0.052 - 0.014 * t) * H
        ang = t * turns * TAU
        pts.append(c + Vector((math.cos(ang) * r, math.sin(ang) * r, 0.012 * H * math.sin(ang * 0.5))))
    b.add(f'shinWrap{side}', rod(pts, 0.01 * H, 4), wrap, region='k' + side, subdiv=0)

# ================================================================ as FAIXAS PRETAS nos antebraços
for side in ('L', 'R'):
    e_, h_ = sk['e' + side], sk['hand' + side]
    dn = (h_ - e_).normalized()
    ax = dn.orthogonal().normalized()
    ay = dn.cross(ax)
    pts = []
    turns = 5
    for i in range(turns * 10 + 1):
        t = i / (turns * 10)
        c = e_.lerp(h_, 0.12 + 0.76 * t)
        r = (0.042 - 0.008 * t) * H
        ang = t * turns * TAU
        pts.append(c + (ax * math.cos(ang) + ay * math.sin(ang)) * r + dn * 0.006 * H * math.sin(ang * 0.5))
    b.add(f'armWrap{side}', rod(pts, 0.009 * H, 4), wrap, region='e' + side, subdiv=0)

# ================================================================ o GRILHÃO com espinhos e a CORRENTE pendurada na frente
cz = 1.535 * H
b.add('collar', tube([(0, -0.01 * H, cz - 0.022 * H, 0.072 * H, 0.068 * H), (0, -0.01 * H, cz, 0.076 * H, 0.072 * H), (0, -0.01 * H, cz + 0.022 * H, 0.072 * H, 0.068 * H)], 24, cap_start=False, cap_end=False), iron, region='neck', subdiv=0)
sp = []
for k in range(10):
    a = k / 10 * TAU
    base = Vector((math.sin(a) * 0.074 * H, -0.01 * H - math.cos(a) * 0.07 * H, cz))
    sp.append(cone(tuple(base), tuple(base + Vector((math.sin(a) * 0.045 * H, -math.cos(a) * 0.045 * H, 0))), 0.011 * H, 5))
b.add('collarSpikes', merge(*sp), iron, region='neck', subdiv=0)
links = []
p = Vector((0, -0.088 * H, cz - 0.01 * H))
ll = 0.034 * H
for k in range(11):
    c = p + Vector((0, -0.062 * H * min(1.0, k / 4), -ll * 0.75 * k))
    pts = []
    for i in range(13):
        a = i / 12 * TAU
        off = Vector((math.cos(a) * 0.011 * H, 0, math.sin(a) * ll * 0.5)) if k % 2 == 0 else Vector((0, math.cos(a) * 0.011 * H, math.sin(a) * ll * 0.5))
        pts.append(c + off)
    links.append(rod(pts, 0.0035 * H, 4, caps=False))
b.add('chain', merge(*links), iron, region='chest', subdiv=0)

# ================================================================ o CABELO escuro bagunçado no alto da cabeça
tufts = []
for k in range(9):
    a = random.uniform(0, TAU)
    rr = random.uniform(0.0, 0.05) * H
    base = Vector((hc.x + math.sin(a) * rr, hc.y + 0.01 * H + math.cos(a) * rr * 0.8, hc.z + 0.13 * H))
    tip = base + Vector((random.uniform(-0.05, 0.05) * H, random.uniform(-0.04, 0.04) * H, random.uniform(0.03, 0.06) * H))
    tufts.append(cone(tuple(base), tuple(tip), random.uniform(0.022, 0.032) * H, 5))
tufts.append(ellipsoid((hc.x, hc.y + 0.012 * H, hc.z + 0.115 * H), (0.075 * H, 0.08 * H, 0.04 * H), 12, 8))
b.add('hair', merge(*tufts), hair, region='head', subdiv=0)

# ================================================================ as ORELHAS pontudas e as GARRAS das mãos e dos pés
for s in (1, -1):
    b.add(f'earTip{s}', cone((s * 0.11 * H + hc.x, hc.y + 0.015 * H, hc.z + 0.0 * H), (s * 0.17 * H + hc.x, hc.y + 0.05 * H, hc.z + 0.06 * H), 0.022 * H, 6), skin, region='head', subdiv=0)
for side in ('L', 'R'):
    e_, h_ = sk['e' + side], sk['hand' + side]
    d = (h_ - e_).normalized()
    side_v = d.cross(Vector((0, 0, 1))).normalized() if abs(d.z) < 0.99 else Vector((1, 0, 0))
    cl = []
    for k in range(4):
        base = h_ + d * 0.06 * H + side_v * ((k - 1.5) * 0.014 * H)
        cl.append(cone(tuple(base), tuple(base + d * 0.05 * H + Vector((0, -0.015 * H, 0))), 0.006 * H, 5))
    b.add(f'claws{side}', merge(*cl), claw, region='e' + side, subdiv=0)
    f_ = sk['foot' + side]
    tc = []
    for k in range(5):
        base = Vector((f_.x + (k - 2) * 0.016 * H, f_.y - 0.11 * H, 0.012 * H))
        tc.append(cone(tuple(base), tuple(base + Vector((0, -0.035 * H, -0.008 * H))), 0.006 * H, 4))
    b.add(f'toeClaws{side}', merge(*tc), claw, region='leg' + side, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'zefero.blend'), check_existing=False)
