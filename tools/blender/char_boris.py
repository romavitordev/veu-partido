"""
BORIS LUKIC — Escriptas (os Marcados do Kian, Calamidade) — public/models/boris.glb.
Referência: wiki "Boris Lukic" (arte promocional de Calamidade e as cenas da campanha). Grande e largo (~1,90 m), 41 anos;
a BOINA (flat cap) marrom, a BARBA CURTA CINZENTA (no rosto: face_boris), o rosto sereno; a GOLA ALTA PRETA (turtleneck);
o SOBRETUDO LONGO cinza-esverdeado, aberto, até o joelho, com a gola larga e o BROCHE DOS LUKIC (o círculo dourado) no
peito; a CALÇA MARROM; as botas escuras; as mãos tatuadas (a escrita sérvia: material das mãos mais escuro nas costas).
A gadanha, a Foice Amaldiçoada e o Elmo Sangrento ficam em código (src/models/props.js → addBorisProps).
TÉCNICA (a do Rubens e da Beatrice): corpo pelo Builder; sobretudo como CASCA (shell_grid); boina, calça, botas e mangas
por ESCULTURA de metaballs com relevo.
  node tools/blender/build.mjs boris   → public/models/boris.glb (+ tools/blender/fonte/boris.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'boris.glb'
random.seed(41)

b = Builder(width=1.04, bulk=1.14, height=1.055)  # ~1,90 m, largo
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_boris', '#e0b89c', 0.8),
    'face': material('face_boris', '#ffffff', 0.8),
    'torso': material('turtleneck_boris', '#18181c', 0.9),
    'arm': material('turtleneck_boris', '#18181c', 0.9),
    'hand': material('hand_boris', '#c89a80', 0.8),  # as mãos tatuadas (mais escuras)
    'legs': material('pants_boris', '#5a3e2a', 0.9),
    'feet': material('boot_boris', '#1e1814', 0.55),
}
coat = material('coat_boris', '#5e6a5a', 0.85)
coat_dk = material('coat_boris_dk', '#424c40', 0.85)
cap = material('cap_boris', '#6a4a30', 0.9)
cap_dk = material('cap_boris_dk', '#4a3220', 0.9)
gold = material('brooch_boris', '#d8b040', 0.3, metal=0.9)
beltm = material('belt_boris', '#1a1412', 0.6)
sole = material('sole_boris', '#0c0a0a', 0.8)
beardm = material('beard_boris', '#8a8680', 0.9)

PREVIEW = {'face_boris': '#e0b89c'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.17), (0.0, 0.172), (0.17, 0.168), (0.32, 0.212), (0.45, 0.24), (0.55, 0.238), (0.61, 0.146), (0.66, 0.08)],
            arm_r=(0.064, 0.056, 0.048), leg_r=(0.096, 0.076, 0.056), head_r=(0.138, 0.15, 0.162), neck_r=0.082)


def part(name):
    return next(o for o in b.parts if o.name == name)


# ================================================================ a GOLA ALTA preta (turtleneck) dobrada no pescoço
b.add('turtleneck', tube([(0, 0, 1.56 * H, 0.098 * H, 0.09 * H), (0, 0, 1.62 * H, 0.094 * H, 0.088 * H), (0, 0, 1.7 * H, 0.09 * H, 0.084 * H)], 16), M['torso'], region='neck', subdiv=1)

# ================================================================ SOBRETUDO LONGO cinza-esverdeado, aberto até o joelho
CT = [(0.0, 0.196, 0.15, 0.42), (0.12, 0.196, 0.152, 0.44), (0.24, 0.205, 0.158, 0.46), (0.36, 0.232, 0.17, 0.48),
      (0.46, 0.244, 0.176, 0.52), (0.54, 0.212, 0.16, 0.6), (0.6, 0.14, 0.116, 0.78)]
SKT = [(0.02, 0.198, 0.152, 0.42), (-0.1, 0.204, 0.156, 0.42), (-0.22, 0.212, 0.162, 0.42), (-0.36, 0.222, 0.17, 0.42)]
for name, prof, reg in (('coat', CT, 'torso'), ('coatSkirt', SKT, 'skirt')):
    rows = [ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 34) for dz, rx, ry, gap in prof]
    ct = b.add(name, shell_grid(rows, 0.008), coat, region=reg, subdiv=1)
    relief(ct, lambda p: 0.003 * H * (ridge(math.atan2(p.x, -p.y) * 7 + n3(p, 7) * 2, 2) - 0.4) * (1.4 if p.z < hz else 0.5))
    for s in (1, -1):  # as bordas da abertura
        pts = []
        for dz, rx, ry, gap in prof:
            a = gap if s > 0 else TAU - gap
            pts.append(Vector((math.sin(a) * (rx + 0.003) * H, -math.cos(a) * (ry + 0.003) * H, hz + dz * H)))
        b.add(f'{name}Edge{s}', rod(pts, 0.011 * H, 6, flat=(outward((0, 0)), 0.4)), coat_dk, region=reg, subdiv=0)
for s in (1, -1):  # as LAPELAS largas
    lap = [Vector((s * 0.07 * H, -0.165 * H, hz + 0.3 * H)), Vector((s * 0.12 * H, -0.168 * H, hz + 0.45 * H)), Vector((s * 0.11 * H, -0.12 * H, hz + 0.58 * H))]
    b.add(f'lapel{s}', rod(lap, 0.03 * H, 6, flat=(outward((0, 0)), 0.25)), coat_dk, region='chest', subdiv=0)
hem = [(math.sin(a) * 0.225 * H, -math.cos(a) * 0.173 * H, hz - 0.36 * H) for a in [0.42 + (TAU - 0.84) * i / 34 for i in range(35)]]
b.add('coatHem', rod(hem, 0.012 * H, 6, flat=(outward((0, 0)), 0.35)), coat_dk, region='skirt', subdiv=0)
# a gola larga do sobretudo, deitada nos ombros
gola = [ring_pts(1.56 * H + k * 0.03 * H, (0.15 - k * 0.012) * H, (0.13 - k * 0.012) * H, 0.9, TAU - 0.9, 22) for k in range(3)]
b.add('coatCollar', shell_grid(gola, 0.009), coat_dk, region='neck', subdiv=1)
# o BROCHE DOS LUKIC no peito esquerdo (x > 0): o círculo dourado com a barra
br = Vector((0.1 * H, -0.19 * H, hz + 0.47 * H))
b.add('brooch', rod([(br.x + math.sin(a) * 0.02 * H, br.y, br.z + math.cos(a) * 0.02 * H) for a in [i / 16 * TAU for i in range(17)]], 0.004 * H, 5, caps=False), gold, region='chest', subdiv=0)
b.add('broochBar', rod([(br.x, br.y - 0.002, br.z - 0.026 * H), (br.x, br.y - 0.002, br.z + 0.026 * H)], 0.0035 * H, 4), gold, region='chest', subdiv=0)
# as MANGAS do sobretudo até o pulso
for side in ('L', 'R'):
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    end = e.lerp(h, 0.82)
    S = Sculpt()
    S.chain([s_ + Vector((0, 0, 0.02 * H)), s_.lerp(e, 0.5), e, end], [0.05 * H, 0.046 * H, 0.046 * H, 0.043 * H], step=0.4)
    S.ell(s_ + Vector((0, 0, 0.025 * H)), (0.05 * H, 0.05 * H, 0.045 * H))
    ax = (e - s_).normalized()
    fold = lambda p, a=s_, ax=ax: 0.0032 * H * (ridge((p - a).dot(ax) / H * 60 + n3(p, 12) * 2, 2) - 0.4)
    b.add('sleeve' + side, S.mesh(res=0.008, smooth=3, disp=fold, target=1100), coat, region='arm' + side, subdiv=0)
    b.add('sleeveCuff' + side, tube(limb_rings(end + (h - e).normalized() * 0.014 * H, end - (h - e).normalized() * 0.01 * H, 0.046 * H, 0.046 * H, n=1), 14), coat_dk, region='e' + side, subdiv=0)

# ================================================================ CALÇA MARROM e BOTAS escuras
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k + Vector((0, -0.003 * H, 0)), k.lerp(f, 0.6)],
            [0.086 * H, 0.074 * H, 0.064 * H, 0.058 * H], step=0.45)
    c2 = (l.x, l.y)
    fold = lambda p, c=c2, kz=k.z: 0.0028 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 30 + n3(p, 16), 2) - 0.35) * (1.6 if abs(p.z - kz) < 0.06 * H else 1)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
    B = Sculpt()
    B.chain([k.lerp(f, 0.58), k.lerp(f, 0.82), f + Vector((0, 0.005 * H, 0.06 * H))], [0.062 * H, 0.058 * H, 0.056 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.032 * H)), (0.06 * H, 0.12 * H, 0.048 * H))
    B.ell(f + Vector((0, -0.13 * H, 0.026 * H)), (0.054 * H, 0.054 * H, 0.038 * H))
    B.ell(f + Vector((0, 0.035 * H, 0.04 * H)), (0.056 * H, 0.054 * H, 0.054 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, disp=lambda p: 0.0016 * H * (ridge(p.z / H * 40 + n3(p, 10), 2) - 0.4), target=1000), M['feet'], region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.048 * H, f.z - 0.014 * H), (0.112 * H, 0.26 * H, 0.034 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
Hp = Sculpt()
Hp.ell(Vector((0, 0.0, hz - 0.02 * H)), (0.178 * H, 0.13 * H, 0.1 * H))
Hp.ell(Vector((0, 0.012 * H, hz - 0.055 * H)), (0.16 * H, 0.11 * H, 0.075 * H))
b.add('pantsHip', Hp.mesh(res=0.011, smooth=3, disp=lambda p: 0.0015 * H * n3(p, 14), target=800), M['legs'], region='body', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)
belt_ring = [(math.sin(a) * 0.18 * H, -math.cos(a) * 0.132 * H, hz + 0.06 * H) for a in [i / 28 * TAU for i in range(29)]]
b.add('belt', rod(belt_ring, 0.018 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), beltm, region='torso', subdiv=0)

# ================================================================ a BARBA curta cinzenta (volume rente no queixo e nas bochechas)
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
# a barba curta cinzenta é pintada no rosto (face_boris): o volume em metaballs ficava como um colar

# ================================================================ a BOINA (flat cap) marrom: a copa achatada caindo para a frente e a aba curta
Cp = Sculpt()
Cp.ell(Vh(0, 0.0, 0.1), (0.158 * H, 0.17 * H, 0.08 * H))
Cp.ell(Vh(0, -0.05, 0.11), (0.152 * H, 0.15 * H, 0.06 * H))
Cp.ell(Vh(0, 0.0, 0.0), (0.135 * H, 0.15 * H, 0.1 * H), neg=True)
b.add('cap', Cp.mesh(res=0.006, smooth=3, disp=lambda p: 0.0015 * H * (ridge(p.x / H * 50 + n3(p, 20), 2) - 0.4), target=1500), cap, region='head', subdiv=0)
brim = []
for k in range(3):
    brim.append(ring_pts(hc.z + 0.07 * H - k * 0.006 * H, (0.15 + k * 0.008) * H, (0.16 + k * 0.03) * H, -1.0, 1.0, 14))
b.add('capBrim', shell_grid(brim, 0.006), cap_dk, region='head', subdiv=1)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'boris.blend'), check_existing=False)
