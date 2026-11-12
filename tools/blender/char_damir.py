"""
DAMIR LUKIC — Escriptas (os Marcados do Kian, Calamidade) — public/models/damir.glb.
Referência: wiki "Damir Lukic" (arte promocional de Calamidade). 1,75 m, magro; CARECA e pálido; o FEDORA ROXO de faixa
preta; o TAPA-OLHO preto no olho direito (no rosto: face_damir); a CAMISA VINHO de GOLA DRAPEADA (cowl); o BLAZER ROXO
aberto; a calça preta e os sapatos pretos; a mão tatuada. A bengala de prata e o caderninho ficam em código
(src/models/props.js → addDamirProps).
TÉCNICA (a do Rubens): corpo pelo Builder; blazer como CASCA (shell_grid); chapéu, calça, sapatos e mangas por ESCULTURA.
  node tools/blender/build.mjs damir   → public/models/damir.glb (+ tools/blender/fonte/damir.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'damir.glb'
random.seed(1975)

b = Builder(width=0.94, bulk=0.9, height=0.972)  # ~1,75 m, magro
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_damir', '#e4c8b4', 0.8),
    'face': material('face_damir', '#ffffff', 0.8),
    'torso': material('shirt_damir', '#6a1a32', 0.85),
    'arm': material('shirt_damir', '#6a1a32', 0.85),
    'hand': material('hand_damir', '#d8b8a2', 0.8),
    'legs': material('pants_damir', '#16161a', 0.9),
    'feet': material('shoe_damir', '#0e0e10', 0.4),
}
blazer = material('blazer_damir', '#5a3478', 0.8)
blazer_dk = material('blazer_damir_dk', '#3e2254', 0.8)
shirt_dk = material('shirt_damir_dk', '#4e1024', 0.85)
hat = material('hat_damir', '#5e3a7e', 0.85)
band = material('hatband_damir', '#121214', 0.7)
sole = material('sole_damir', '#08080a', 0.8)
beltm = material('belt_damir', '#121214', 0.5)
silver = material('silver_damir', '#c8ccd4', 0.3, metal=0.9)

PREVIEW = {'face_damir': '#e4c8b4'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.15), (0.0, 0.152), (0.17, 0.142), (0.32, 0.172), (0.45, 0.194), (0.55, 0.196), (0.61, 0.122), (0.66, 0.066)],
            arm_r=(0.054, 0.046, 0.04), leg_r=(0.08, 0.062, 0.048), head_r=(0.134, 0.148, 0.164))

# ================================================================ a GOLA DRAPEADA (cowl) da camisa vinho: dobras caindo em U no peito
for k in range(3):
    dz = 1.6 * H - k * 0.035 * H
    rr = 0.105 * H + k * 0.012 * H
    pts = [(math.sin(a) * rr, -math.cos(a) * (rr * 0.92) - k * 0.006 * H, dz - (0.05 + k * 0.03) * H * math.cos(a) ** 2) for a in [-1.3 + 2.6 * i / 16 for i in range(17)]]
    b.add(f'cowl{k}', rod(pts, 0.014 * H, 6), M['torso'] if k % 2 == 0 else shirt_dk, region='chest', subdiv=0)
b.add('cowlBack', tube([(0, 0, 1.57 * H, 0.1 * H, 0.094 * H), (0, 0, 1.64 * H, 0.094 * H, 0.088 * H)], 14), M['torso'], region='neck', subdiv=0)

# ================================================================ BLAZER ROXO aberto, até o quadril
JK = [(-0.12, 0.172, 0.138, 0.6), (0.0, 0.17, 0.136, 0.6), (0.13, 0.166, 0.134, 0.6), (0.24, 0.168, 0.13, 0.6),
      (0.36, 0.188, 0.14, 0.62), (0.46, 0.204, 0.148, 0.66), (0.54, 0.182, 0.136, 0.72), (0.6, 0.126, 0.104, 0.86)]
rows = [ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 30) for dz, rx, ry, gap in JK[2:]]
jk = b.add('blazer', shell_grid(rows, 0.007), blazer, region='torso', subdiv=1)
relief(jk, lambda p: 0.002 * H * (ridge((p.z - hz) / H * 50 + n3(p, 9) * 2, 2) - 0.4))
rows2 = [ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 30) for dz, rx, ry, gap in JK[:3]]
b.add('blazerSkirt', shell_grid(rows2, 0.007), blazer, region='skirt', subdiv=1)
hem = [(math.sin(a) * 0.175 * H, -math.cos(a) * 0.14 * H, hz - 0.12 * H) for a in [0.6 + (TAU - 1.2) * i / 30 for i in range(31)]]
b.add('blazerHem', rod(hem, 0.009 * H, 6, flat=(outward((0, 0)), 0.35)), blazer_dk, region='skirt', subdiv=0)
for s in (1, -1):  # as bordas e as lapelas
    pts = []
    for dz, rx, ry, gap in JK:
        a = gap if s > 0 else TAU - gap
        pts.append(Vector((math.sin(a) * (rx + 0.003) * H, -math.cos(a) * (ry + 0.003) * H, hz + dz * H)))
    b.add(f'blazerEdge{s}', rod(pts[:3], 0.008 * H, 6, flat=(outward((0, 0)), 0.4)), blazer_dk, region='skirt', subdiv=0)
    b.add(f'blazerEdgeT{s}', rod(pts[2:], 0.008 * H, 6, flat=(outward((0, 0)), 0.4)), blazer_dk, region='torso', subdiv=0)
    lap = [Vector((s * 0.09 * H, -0.142 * H, hz + 0.3 * H)), Vector((s * 0.12 * H, -0.15 * H, hz + 0.44 * H)), Vector((s * 0.1 * H, -0.11 * H, hz + 0.57 * H))]
    b.add(f'lapel{s}', rod(lap, 0.024 * H, 6, flat=(outward((0, 0)), 0.25)), blazer_dk, region='chest', subdiv=0)
for side in ('L', 'R'):  # as mangas do blazer até o pulso
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    end = e.lerp(h, 0.8)
    S = Sculpt()
    S.chain([s_ + Vector((0, 0, 0.02 * H)), s_.lerp(e, 0.5), e, end], [0.046 * H, 0.042 * H, 0.042 * H, 0.04 * H], step=0.4)
    S.ell(s_ + Vector((0, 0, 0.025 * H)), (0.047 * H, 0.047 * H, 0.042 * H))
    ax = (e - s_).normalized()
    fold = lambda p, a=s_, ax=ax: 0.0025 * H * (ridge((p - a).dot(ax) / H * 60 + n3(p, 12) * 2, 2) - 0.4)
    b.add('sleeve' + side, S.mesh(res=0.007, smooth=3, disp=fold, target=1000), blazer, region='arm' + side, subdiv=0)
    b.add('shirtCuff' + side, tube(limb_rings(e.lerp(h, 0.8), e.lerp(h, 0.88), 0.038 * H, 0.038 * H, n=1), 12), M['torso'], region='e' + side, subdiv=0)

# ================================================================ CALÇA PRETA e SAPATOS
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k, k.lerp(f, 0.86)], [0.07 * H, 0.06 * H, 0.052 * H, 0.05 * H], step=0.45)
    c2 = (l.x, l.y)
    fold = lambda p, c=c2: 0.002 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 3 + p.z / H * 20 + n3(p, 16), 2) - 0.35)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1200), M['legs'], region='leg' + side, subdiv=0)
    Sh = Sculpt()
    Sh.ell(f + Vector((0, -0.05 * H, 0.026 * H)), (0.048 * H, 0.12 * H, 0.036 * H))
    Sh.ell(f + Vector((0, 0.025 * H, 0.034 * H)), (0.046 * H, 0.05 * H, 0.04 * H))
    b.add('shoe' + side, Sh.mesh(res=0.006, smooth=3, target=700), M['feet'], region='k' + side, subdiv=0)
    b.add('shoeSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.012 * H), (0.094 * H, 0.24 * H, 0.024 * H), bevel=0.005), sole, region='k' + side, subdiv=0)
Hp = Sculpt()
Hp.ell(Vector((0, 0.0, hz - 0.02 * H)), (0.16 * H, 0.12 * H, 0.1 * H))
b.add('pantsHip', Hp.mesh(res=0.011, smooth=3, target=700), M['legs'], region='body', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)
belt_ring = [(math.sin(a) * 0.162 * H, -math.cos(a) * 0.126 * H, hz + 0.06 * H) for a in [i / 28 * TAU for i in range(29)]]
b.add('belt', rod(belt_ring, 0.014 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), beltm, region='torso', subdiv=0)
b.add('buckle', box((0, -0.13 * H, hz + 0.06 * H), (0.035 * H, 0.008 * H, 0.026 * H), bevel=0.002), silver, region='torso', subdiv=0)

# ================================================================ o FEDORA ROXO (a copa com o vinco e a aba larga) e a faixa preta
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
Ht = Sculpt()
Ht.ell(Vh(0, 0.0, 0.1), (0.146 * H, 0.156 * H, 0.11 * H))  # a copa assentada na cabeça (a cabeça fica por dentro)
Ht.ell(Vh(0, 0.0, 0.215), (0.05 * H, 0.09 * H, 0.03 * H), neg=True)  # o vinco no alto
b.add('hatCrown', Ht.mesh(res=0.006, smooth=3, target=1400), hat, region='head', subdiv=0)
brim = [ring_pts(hc.z + (0.045 - 0.012 * (r - 0.14) / 0.1) * H, r * H, r * 1.08 * H, 0.0, TAU, 32) for r in (0.14, 0.19, 0.235)]
b.add('hatBrim', shell_grid(brim, 0.012), hat, region='head', subdiv=1)
b.add('hatBand', tube([(HC.x, HC.y, hc.z + 0.05 * H, 0.147 * H, 0.158 * H), (HC.x, HC.y, hc.z + 0.09 * H, 0.145 * H, 0.156 * H)], 24), band, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'damir.blend'), check_existing=False)
