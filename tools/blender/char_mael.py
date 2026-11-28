"""
MAEL — A Vigília (Treb Ciach, Irlanda, 890) — public/models/mael.glb.
Referências (wiki "Mael", artes de frente e de costas, normal e fantasiado; notas em lore/A-VIGILIA.md):
  - ~1,80 m, magro e jovem; cabelo CASTANHO-ESCURO CACHEADO em MULLET (curto no alto, cachos mais longos na nuca), UM
    DREAD LOIRO longo do lado direito dele com uma planta enrolada, a COROA DE GALHOS com folhas que forma chifres;
    olhos esverdeados, bigode e barba ralos, cicatriz na sobrancelha esquerda (no rosto: face_mael);
  - camisa BRANCA gasta, quase amarelada, mangas dobradas no cotovelo, ABERTA no peito peludo; colares finos;
  - SUSPENSÓRIO de couro em X com bolsos, ervas, folhas e as TRÊS PEDRAS (verde, roxa, vermelha);
  - a faixa LARGA de couro trançado na cintura, o cinto e o LENÇO VERDE amarrado caindo de lado;
  - calça VERDE larga de listras finas (textura pants_mael), botas ALTAS amarradas, BRAÇADEIRAS e luvas sem dedos.
FANTASIADO (Herói da Vigília, a Transformação): o MESMO modelo ligando prop_woodMask (a MÁSCARA de casca em espiral com
GALHOS como chifres), prop_leafCollar (a gola de FOLHAS secas) e prop_heroCloak (a capa verde-oliva ESFARRAPADA em duas
camadas); o cabelo, o dread e a coroa somem por baixo. A machadinha é montada em código (models/vigiliaProps.js).
  node tools/blender/build.mjs mael   → public/models/mael.glb (+ tools/blender/fonte/mael.blend)
  ao vivo (MCP): exec(open(r"E:/arena paranormal/tools/blender/mcp_build.py", encoding="utf-8").read()); mcp_build("mael")
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'mael.glb'
random.seed(1890)

b = Builder(width=0.98, bulk=0.96, height=1.0)  # ~1,80 m, magro
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

SKIN = '#e0ae8e'
M = {
    'skin': material('skin_mael', SKIN, 0.8),
    'face': material('face_mael', '#ffffff', 0.8),
    'torso': material('skin_mael', SKIN, 0.8),      # o peito aberto; a camisa é a casca por cima
    'arm': material('shirt_mael', '#d6caa6', 0.9),  # as mangas
    'forearm': material('bracer_mael', '#4a2e1c', 0.6),  # as braçadeiras de couro
    'hand': material('glove_mael', '#5e3c24', 0.7),      # as luvas sem dedos
    'legs': material('pants_mael', '#ffffff', 0.9),      # a calça verde listrada (textura)
    'feet': material('boot_mael', '#2e1e14', 0.7),
}
shirt = M['arm']
leather = material('belt_mael', '#5a3820', 0.6)
leather_dk = material('strap_mael', '#2c1c12', 0.7)
weave = material('weave_mael', '#6a5640', 0.85)     # a faixa trançada da cintura
sash = material('sash_mael', '#5e7c36', 0.9)        # o lenço verde
hairm = material('hair_mael', '#3a2416', 0.75)
blond = material('dread_mael', '#c8a45c', 0.8)
twig = material('twig_mael', '#5a4028', 0.85)
leaf = material('leaf_mael', '#5e8a34', 0.8)
leaf_dk = material('leaf_dk_mael', '#3e5e22', 0.85)
cord = material('cord_mael', '#2a2018', 0.8)
sole = material('sole_mael', '#18100a', 0.8)
steel = material('steel_mael', '#b8b4ae', 0.35, metal=0.8)
stone_g = material('stone_g_mael', '#3ac070', 0.25)
stone_p = material('stone_p_mael', '#8a4ad0', 0.25)
stone_r = material('stone_r_mael', '#d03a3a', 0.25)
bark = material('bark_mael', '#57452c', 0.9)        # a máscara de casca
bark_dk = material('bark_dk_mael', '#3a2c1c', 0.9)
dryleaf = material('dryleaf_mael', '#6e5c2e', 0.9)  # as folhas secas da gola
dryleaf_lt = material('dryleaf_lt_mael', '#86703a', 0.9)
dryleaf_dk = material('dryleaf_dk_mael', '#3e3c1c', 0.9)
hcloak = material('cloak_mael', '#ffffff', 0.95)    # a capa esfarrapada (textura com os furos)

PREVIEW = {'face_mael': SKIN, 'pants_mael': '#4a5a34', 'cloak_mael': '#5a5a32'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.15), (0.0, 0.148), (0.17, 0.138), (0.36, 0.162), (0.47, 0.178), (0.57, 0.114), (0.63, 0.062)],
            arm_r=(0.05, 0.046, 0.04), leg_r=(0.1, 0.082, 0.045), head_r=(0.134, 0.146, 0.158))
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))


def part(name):
    return next(o for o in b.parts if o.name == name)


# ================================================================ a CAMISA branca gasta, aberta no peito em V fundo
SH = [(-0.05, 0.158, 0.138), (0.06, 0.154, 0.134), (0.16, 0.15, 0.13), (0.26, 0.158, 0.13), (0.36, 0.176, 0.136),
      (0.46, 0.19, 0.144), (0.54, 0.17, 0.132), (0.6, 0.122, 0.1)]


def shirt_r(dz):
    """(rx, ry) da camisa na altura dz (interpolado)"""
    for (z0, x0, y0), (z1, x1, y1) in zip(SH, SH[1:]):
        if z0 <= dz <= z1:
            t = (dz - z0) / (z1 - z0)
            return x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
    return (SH[0][1], SH[0][2]) if dz < SH[0][0] else (SH[-1][1], SH[-1][2])


def on_body(a, dz, off=0.0):
    """um ponto em cima da camisa: a = ângulo a partir da frente (+ = lado esquerdo dele), dz em H acima do quadril"""
    rx, ry = shirt_r(dz)
    return Vector((math.sin(a) * (rx * H + off), -math.cos(a) * (ry * H + off), hz + dz * H))


rows = []
for dz, rx, ry in SH:
    gap = 0.0 if dz < 0.28 else 0.22 + (dz - 0.28) * 2.2  # o V aberto até o meio do peito
    rows.append(ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 36))
sh = b.add('shirt', shell_grid(rows, 0.008), shirt, region='torso', subdiv=1)
relief(sh, lambda p: 0.0025 * H * (ridge(math.atan2(p.x, -p.y) * 9 + n3(p, 7) * 2, 2) - 0.4))
# a gola caída: a borda do V virada para fora
for s in (1, -1):
    pts = [on_body(s * (0.22 + (dz - 0.28) * 2.2), dz, 0.006 * H) for dz in (0.3, 0.38, 0.46, 0.54, 0.6)]
    b.add(f'collar{s}', rod(pts, 0.009 * H, 5, flat=(outward((0, 0)), 0.4)), shirt, region='chest', subdiv=0)
# os pelos do peito no V
Ch = Sculpt()
for i in range(26):
    dz = random.uniform(0.34, 0.52)
    a = random.uniform(-0.18, 0.18) * (1 - (0.52 - dz))
    Ch.ell(on_body(a, dz, -0.006 * H), (0.012 * H, 0.004 * H, 0.012 * H))
b.add('chestHair', Ch.mesh(res=0.004, smooth=1, target=600), hairm, region='chest', subdiv=0)
# as mangas DOBRADAS no cotovelo: um rolo de pano
for side in ('L', 'R'):
    e = sk['e' + side]
    s_ = sk['s' + side]
    d = (e - s_).normalized()
    c = e - d * 0.02 * H
    up = Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0))
    u1 = d.cross(up).normalized()
    u2 = d.cross(u1).normalized()
    ring = [c + (u1 * math.cos(a) + u2 * math.sin(a)) * 0.056 * H for a in [j / 16 * TAU for j in range(17)]]
    b.add('cuff' + side, rod(ring, 0.014 * H, 6, caps=False), shirt, region='s' + side, subdiv=0)

# ================================================================ a faixa TRANÇADA larga da cintura, o cinto e o LENÇO
wrows = [ring_pts(hz + dz * H, (shirt_r(dz)[0] + 0.01) * H, (shirt_r(dz)[1] + 0.01) * H, 0, TAU, 40) for dz in (-0.03, 0.03, 0.09, 0.14)]
wv = b.add('waistWeave', shell_grid(wrows, 0.01 * H), weave, region='torso', subdiv=0)
relief(wv, lambda p: 0.003 * H * (ridge((p.z - hz) / H * 120, 2) + 0.6 * ridge(math.atan2(p.x, -p.y) * 30, 3) - 0.6))
ring = [on_body(a, -0.04, 0.016 * H) for a in [j / 32 * TAU for j in range(33)]]
b.add('belt', rod(ring, 0.014 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), leather, region='torso', subdiv=0)
bk = on_body(0.0, -0.04, 0.03 * H)
b.add('buckle', box(tuple(bk), (0.036 * H, 0.01 * H, 0.03 * H), bevel=0.003), steel, region='torso', subdiv=0)
# o LENÇO VERDE: amarrado inclinado nos quadris (mais baixo do lado esquerdo dele), o nó e a ponta caída
srows = []
for k in range(4):
    zz = -0.13 + 0.03 * k
    srows.append([on_body(a, zz + 0.04 * math.sin(a + 0.6), 0.024 * H) for a in [j / 40 * TAU for j in range(41)]])
sa = b.add('sash', shell_grid(srows, 0.008 * H), sash, region='hips', subdiv=0)
relief(sa, lambda p: 0.004 * H * (ridge(math.atan2(p.x, -p.y) * 6 + (p.z - hz) / H * 30, 2) - 0.4))
kn = on_body(1.1, -0.11, 0.035 * H)
b.add('sashKnot', ellipsoid(tuple(kn), (0.03 * H, 0.025 * H, 0.03 * H), 8, 6), sash, region='hips', subdiv=0)
tail = [kn, kn + Vector((0.02 * H, -0.01 * H, -0.08 * H)), kn + Vector((0.01 * H, -0.005 * H, -0.17 * H)), kn + Vector((0.025 * H, 0.0, -0.24 * H))]
b.add('sashTail', rod(tail, [0.03 * H, 0.034 * H, 0.03 * H, 0.02 * H], 6, flat=(outward((0, 0)), 0.25)), sash, region='hips', subdiv=0)

# ================================================================ o SUSPENSÓRIO em X (frente e costas), os bolsos, as
# ervas, as folhas e as TRÊS PEDRAS (verde, roxa, vermelha)
for s in (1, -1):
    pts = []
    # frente: do quadril do lado oposto até o ombro; costas: do ombro até o quadril do lado oposto (o X)
    for k in range(9):
        t = k / 8
        dz = 0.14 + t * (0.555 - 0.14)
        a = -s * 0.75 + t * (s * 0.42 + s * 0.75)
        pts.append(on_body(a, dz, 0.012 * H))
    sh_top = on_body(s * 1.05, 0.6, 0.02 * H) + Vector((0, 0, 0.02 * H))  # por cima do ombro
    pts.append(sh_top)
    for k in range(1, 9):
        t = k / 8
        dz = 0.555 - t * (0.555 - 0.14)
        a = math.pi - s * 0.42 + t * s * 1.17  # do ombro de trás até o quadril do lado oposto
        pts.append(on_body(a, dz, 0.012 * H))
    b.add(f'susp{s}', rod(pts, 0.013 * H, 5, caps=False, flat=(outward((0, 0)), 0.3)), leather_dk, region='torso', subdiv=0)
# os dois bolsos no peito, em cima das tiras
for s, col in ((1, stone_g), (-1, stone_r)):
    p = on_body(s * 0.3, 0.3, 0.022 * H)
    b.add(f'pouch{s}', box(tuple(p), (0.05 * H, 0.022 * H, 0.05 * H), bevel=0.006), leather, region='chest', subdiv=0)
    b.add(f'stone{s}', ellipsoid(tuple(p + Vector((0, -0.016 * H, 0.03 * H))), (0.014 * H, 0.012 * H, 0.016 * H), 8, 6), col, region='chest', subdiv=0)
p = on_body(0.0, 0.22, 0.03 * H)  # a roxa no cruzamento do X
b.add('stoneP', ellipsoid(tuple(p), (0.016 * H, 0.012 * H, 0.018 * H), 8, 6), stone_p, region='chest', subdiv=0)
b.add('stoneRing', rod([p + Vector((math.cos(a) * 0.02 * H, -0.004 * H, math.sin(a) * 0.022 * H)) for a in [j / 12 * TAU for j in range(13)]], 0.003 * H, 4, caps=False), cord, region='chest', subdiv=0)
# as ervas e folhas presas nas tiras
lv = []
for k in range(9):
    s = 1 if k % 2 else -1
    dz = 0.24 + 0.035 * k
    a = s * (0.15 + 0.03 * k)
    c = on_body(a, dz, 0.026 * H)
    d = Vector((random.uniform(-0.5, 0.5), -0.2, random.uniform(-0.2, 1))).normalized()
    ln = random.uniform(0.04, 0.06) * H
    lv.append(rod([c, c + d * ln * 0.5, c + d * ln], [0.004 * H, 0.012 * H, 0.002 * H], 5, flat=((lambda q: Vector((0, -1, 0))), 0.2)))
b.add('stripLeaves', merge(*lv), leaf, region='chest', subdiv=0)

# ================================================================ os COLARES finos e o de plantas
for k, (dz, sag) in enumerate(((0.66, 0.03), (0.66, 0.07))):
    pts = [Vector((math.sin(a) * 0.06 * H, -math.cos(a) * 0.056 * H - (sag * H if abs(a) < 0.8 else 0) * math.cos(a), 1.6 * H - sag * H * max(0.0, math.cos(a)) ** 2)) for a in [-1.6 + 3.2 * j / 14 for j in range(15)]]
    b.add(f'necklace{k}', rod(pts, 0.0035 * H, 4, caps=False), cord, region='chest', subdiv=0)

# ================================================================ as BRAÇADEIRAS de couro (do meio do antebraço ao pulso) e as tiras
for side in ('L', 'R'):
    e, w = sk['e' + side], sk['hand' + side]
    d = (w - e).normalized()
    b.add('bracer' + side, rod([e.lerp(w, 0.22), e.lerp(w, 0.6), e.lerp(w, 0.97)], [0.052 * H, 0.05 * H, 0.046 * H], 10), M['forearm'], region='e' + side, subdiv=0)
    up = Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0))
    u1 = d.cross(up).normalized()
    u2 = d.cross(u1).normalized()
    for i in range(3):
        c = e.lerp(w, 0.3 + 0.25 * i)
        r = (0.055 - 0.004 * i) * H
        ring = [c + (u1 * math.cos(a) + u2 * math.sin(a)) * r + d * 0.012 * H * math.sin(a * 1) for a in [j / 14 * TAU for j in range(15)]]
        b.add(f'bracerTie{side}{i}', rod(ring, 0.004 * H, 4, caps=False), leather_dk, region='e' + side, subdiv=0)

# ================================================================ BOTAS altas de couro até embaixo do joelho, amarradas
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    B = Sculpt()
    B.chain([k.lerp(f, 0.06), k.lerp(f, 0.5), f + Vector((0, 0.005 * H, 0.06 * H))], [0.086 * H, 0.068 * H, 0.056 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.052 * H, 0.115 * H, 0.042 * H))
    B.ell(f + Vector((0, -0.13 * H, 0.022 * H)), (0.045 * H, 0.05 * H, 0.03 * H))
    B.ell(f + Vector((0, 0.035 * H, 0.04 * H)), (0.048 * H, 0.048 * H, 0.048 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, disp=lambda p: 0.0018 * H * n3(p, 14), target=1100), M['feet'], region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.014 * H), (0.1 * H, 0.24 * H, 0.028 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
    for i in range(8):  # as tiras cruzadas subindo a canela
        t = 0.12 + i * 0.075
        c = k.lerp(f, t)
        r = 0.084 * H - i * 0.003 * H
        tilt = 0.024 * H * (1 if i % 2 else -1)
        ring = [(c.x + math.sin(a) * r, c.y - math.cos(a) * r, c.z + tilt * math.sin(a)) for a in [j / 18 * TAU for j in range(19)]]
        b.add(f'bootTie{side}{i}', rod(ring, 0.005 * H, 4, caps=False), cord, region='k' + side, subdiv=0)
    # a boca da calça presa embaixo do joelho: o tecido sobra por cima da bota
    c = k.lerp(f, 0.06)
    Pc = Sculpt()  # a boca da calça fofa caindo por cima do cano da bota
    for j in range(14):
        a = j / 14 * TAU
        Pc.ell(c + Vector((math.sin(a) * 0.085 * H, -math.cos(a) * 0.082 * H, 0.02 * H)), (0.035 * H, 0.035 * H, 0.04 * H))
    b.add('pantCuff' + side, Pc.mesh(res=0.007, smooth=2, target=700), M['legs'], region='k' + side, subdiv=0)

# ================================================================ CABELO: o MULLET cacheado castanho-escuro, o DREAD loiro
# e a COROA DE GALHOS. Tudo nasce na superfície da cabeça (raycast), como o Bran (ver memória: cachos = ringlets)
_hd = part('head')
_dg = bpy.context.evaluated_depsgraph_get()
_bvh = BVHTree.FromObject(_hd, _dg)
_mw = _hd.matrix_world
_mwi = _mw.inverted()


def on_head(a, el, off):
    """a = ângulo a partir da frente (+ = lado esquerdo dele, +x), el = elevação a partir do equador da cabeça"""
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    o = _mwi @ (HC + d * 0.6 * H)
    hit = _bvh.ray_cast(o, (_mwi.to_3x3() @ -d).normalized())
    if hit[0] is None:
        return None
    return _mw @ hit[0] + (_mw.to_3x3() @ hit[1]).normalized() * off


def ringlet(S, top_, down, length, r_coil, r_tube, turns, phase=0.0, out=None):
    """um cacho em espiral: o eixo desce de top_ na direção down (curvando para out), a mola em volta dele"""
    down = Vector(down).normalized()
    side = down.cross(Vector((0, 0, 1)))
    if side.length < 1e-4:
        side = Vector((1, 0, 0))
    side.normalize()
    fwd = side.cross(down).normalized()
    n = max(10, int(turns * 16))
    pts, rad = [], []
    for j in range(n + 1):
        t = j / n
        c = top_ + down * (length * t)
        if out is not None:
            c = c + Vector(out) * (t * t)
        ang = phase + t * turns * math.tau
        rc = r_coil * (1.0 - 0.35 * t)
        pts.append(c + side * (math.cos(ang) * rc) + fwd * (math.sin(ang) * rc))
        rad.append(r_tube * (1.0 - 0.45 * t))
    S.chain(pts, rad, step=0.5)


Hr = Sculpt()
# a calota colada (a testa livre; dos lados, curta: as orelhas aparecem)
for i in range(30):
    for j in range(8):
        a = (i / 30 - 0.5) * math.tau
        el = -0.3 + 1.2 * j / 7
        if math.cos(a) > 0.45 and el < 0.6:
            continue  # testa e rosto
        if abs(math.sin(a)) > 0.75 and math.cos(a) > -0.35 and el < 0.12:
            continue  # as orelhas
        q = on_head(a, el, (0.024 if el > 0.3 else 0.016) * H)
        if q:
            Hr.ell(q, (0.03 * H, 0.03 * H, 0.027 * H))
# o volume cacheado do alto (mais alto que dos lados: o mullet)
for i in range(110):
    a = random.uniform(-math.pi, math.pi)
    el = random.uniform(0.25, 1.35)
    if math.cos(a) > 0.55 and el < 0.62:
        continue
    q = on_head(a, el, 0.045 * H)
    if q:
        d = (q - HC).normalized()
        ringlet(Hr, q, d * 0.7 + Vector((0, 0, -0.6)), 0.05 * H, 0.009 * H, 0.018 * H, 1.2, phase=i)
# os cachos caídos na testa
for k in range(6):
    q = on_head(-0.5 + 0.2 * k, 0.72 + 0.04 * (k % 2), 0.03 * H)
    if q:
        ringlet(Hr, q, (0.0, -0.6, -1), 0.06 * H, 0.009 * H, 0.016 * H, 1.3, phase=k * 1.9)
# a NUCA do mullet: cachos mais longos descendo até o pescoço
for k in range(9):
    a = math.pi + (k / 8 - 0.5) * 1.8
    q = on_head(a, -0.05 + 0.08 * (k % 2), 0.02 * H)
    if q:
        ringlet(Hr, q, (math.sin(a) * 0.15, 0.25, -1), (0.15 + 0.03 * (k % 3)) * H, 0.011 * H, 0.02 * H, 2.5, phase=k * 2.1,
                out=(0, 0.03 * H, 0))
Hr.ell(Vh(0, -0.17, -0.06), (0.1 * H, 0.08 * H, 0.12 * H), neg=True)  # o rosto livre


def curls(p):
    return 0.002 * H * (n3(p, 80) + 0.5 * n3(p, 160))


b.add('prop_hairCurls', Hr.mesh(res=0.005, smooth=1, disp=curls, target=9000), hairm, region='head', subdiv=0)

# o DREAD LOIRO: do lado direito dele (-x), da têmpora até o peito, com a planta enrolada e duas folhas
q0 = on_head(-1.05, 0.25, 0.02 * H)
dpts = [q0, q0 + Vector((-0.02 * H, -0.03 * H, -0.08 * H)), q0 + Vector((-0.03 * H, -0.06 * H, -0.18 * H)),
        q0 + Vector((-0.02 * H, -0.085 * H, -0.28 * H)), q0 + Vector((-0.01 * H, -0.095 * H, -0.37 * H))]
dr = rod(dpts, [0.014 * H, 0.015 * H, 0.014 * H, 0.013 * H, 0.008 * H], 7)
b.add('prop_hairDread', dr, blond, region='head', subdiv=1)
vine = []
for j in range(60):
    t = j / 59
    k = min(int(t * 4), 3)
    c = dpts[k].lerp(dpts[k + 1], t * 4 - k)
    ang = t * 9 * math.tau
    vine.append(c + Vector((math.cos(ang) * 0.016 * H, math.sin(ang) * 0.016 * H, 0)))
vl = [rod(vine, 0.0035 * H, 4)]
for t in (0.35, 0.7):
    c = vine[int(t * 59)]
    d = Vector((-0.6, -0.5, 0.3)).normalized()
    vl.append(rod([c, c + d * 0.025 * H, c + d * 0.05 * H], [0.003 * H, 0.012 * H, 0.002 * H], 5, flat=((lambda q: Vector((0, -1, 0.3))), 0.2)))
b.add('prop_hairVine', merge(*vl), leaf, region='head', subdiv=0)

# a COROA DE GALHOS: um anel torcido em volta da cabeça, com galhinhos para cima como CHIFRES e folhas
cr = []
crown = []
for j in range(41):
    a = j / 40 * TAU
    el = 0.62 if math.cos(a) > 0 else 0.42
    el = 0.42 + 0.2 * max(0.0, math.cos(a))
    q = on_head(a, el, 0.05 * H)
    if q:
        crown.append(q + Vector((0, 0, 0.004 * H * math.sin(a * 7))))
cr.append(rod(crown, 0.007 * H, 5, caps=False))
cr.append(rod([c + Vector((0, 0, 0.006 * H * math.cos(i))) for i, c in enumerate(crown)], 0.005 * H, 4, caps=False))
for s in (1, -1):  # os chifres: um galho maior de cada lado, com duas pontas
    q = on_head(s * 0.95, 0.75, 0.04 * H)
    if not q:
        continue
    d = Vector((s * 0.45, 0.05, 1)).normalized()
    p1 = q + d * 0.13 * H
    p2 = p1 + Vector((s * 0.05, -0.01, 0.06)).normalized() * 0.09 * H
    cr.append(rod([q, q.lerp(p1, 0.5), p1, p2], [0.011 * H, 0.009 * H, 0.006 * H, 0.002 * H], 5))
    p3 = p1 + Vector((-s * 0.02, -0.02, 0.07)).normalized() * 0.07 * H
    cr.append(rod([p1, p3], [0.005 * H, 0.0015 * H], 4))
    p4 = q.lerp(p1, 0.5) + Vector((s * 0.06, 0.02, 0.03)).normalized() * 0.05 * H
    cr.append(rod([q.lerp(p1, 0.5), p4], [0.005 * H, 0.0015 * H], 4))
    q2 = on_head(s * 0.45, 0.85, 0.04 * H)
    if q2:
        cr.append(rod([q2, q2 + Vector((s * 0.02, -0.01, 0.05)) * H, q2 + Vector((s * 0.035, -0.015, 0.08)) * H], [0.005 * H, 0.003 * H, 0.0012 * H], 4))
b.add('prop_hairCrown', merge(*cr), twig, region='head', subdiv=0)
lf = []
for j in range(16):
    c = crown[int(j / 16 * (len(crown) - 1))]
    d = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(0.2, 1))).normalized()
    ln = random.uniform(0.025, 0.04) * H
    lf.append(rod([c, c + d * ln * 0.5, c + d * ln], [0.003 * H, 0.011 * H, 0.0015 * H], 5, flat=((lambda q, dd=d: dd.cross(Vector((0, 0, 1))).normalized() if abs(dd.z) < 0.95 else Vector((1, 0, 0))), 0.2)))
b.add('prop_hairLeaves', merge(*lf), leaf, region='head', subdiv=0)
b.group('prop_hair', 'prop_hair')

# ================================================================ FANTASIADO: prop_woodMask — a máscara de casca em espiral
# cobrindo a cabeça toda, os GALHOS para cima como chifres
Mk = Sculpt()
EYE_X, EYE_Z = 0.042, 0.012  # (×H a partir do centro da cabeça) onde ficam os olhos do rosto
Mk.ell(Vh(0, -0.005, 0.02), (0.18 * H, 0.19 * H, 0.2 * H))
Mk.ell(Vh(0, -0.05, -0.1), (0.15 * H, 0.15 * H, 0.14 * H))
# o FURO DO OLHO (dono: "na mascara do mael parece ter só uma abertura do olho, analise a referencia"; arte "Mael
# Fantasiado"): a espiral da casca gira em volta de UMA abertura só, sobre o olho DIREITO dele (−X, à esquerda de quem
# olha). O furo atravessa a casca: o olho verde aparece lá dentro
FC = Vh(-EYE_X, -0.2, EYE_Z)  # o centro da espiral = o furo do olho
Mk.ell(FC, (0.022 * H, 0.08 * H, 0.02 * H), neg=True)


def spiral(p):
    v = p - FC
    r = math.hypot(v.x, v.z) / H
    ang = math.atan2(v.z, v.x)
    face = smoothstep(0.0, -0.1 * H, p.y - HC.y)  # só na frente
    g = ridge(r * 95 - ang * 1.0 * 1.5 + n3(p, 20) * 0.6, 2)
    bk = ridge(math.atan2(p.x - HC.x, p.y - HC.y) * 10 + (p.z / H) * 40 + n3(p, 10) * 2, 3)  # as fibras da casca atrás
    return 0.008 * H * (face * (g - 0.4) + (1 - face) * 0.7 * (bk - 0.4))


b.add('prop_woodMaskShell', Mk.mesh(res=0.006, smooth=2, disp=spiral, target=6000), bark, region='head', subdiv=0)
br = []


def branch(p0, d, ln, r, depth):
    d = d.normalized()
    p1 = p0 + d * ln * 0.5 + Vector((random.uniform(-0.01, 0.01), random.uniform(-0.01, 0.01), 0)) * H
    p2 = p0 + d * ln
    br.append(rod([p0, p1, p2], [r, r * 0.75, r * 0.4], 5))
    if depth > 0:
        for k in range(2):
            nd = d + Vector((random.uniform(-0.6, 0.6), random.uniform(-0.4, 0.4), random.uniform(0.0, 0.4)))
            branch(p0.lerp(p2, 0.55 + 0.3 * k), nd, ln * 0.6, r * 0.55, depth - 1)


for k in range(7):
    a = (k / 6 - 0.5) * 2.6 + math.pi  # para trás e dos lados (a frente é a espiral)
    a = (k / 6 - 0.5) * 3.0
    p0 = Vh(math.sin(a) * 0.12, 0.02 - math.cos(a) * 0.05, 0.16)
    d = Vector((math.sin(a) * 0.7, 0.2, 1))
    branch(p0, d, random.uniform(0.2, 0.28) * H, 0.012 * H, 2)
b.add('prop_woodMaskBranches', merge(*br), bark_dk, region='head', subdiv=0)
b.group('prop_woodMask', 'prop_woodMask')

# ================================================================ FANTASIADO: prop_leafCollar — a gola de FOLHAS secas
random.seed(77)
la, lb, lc = [], [], []
for k in range(6):
    v = k / 5
    z = 1.66 * H - v * 0.2 * H
    rx = (0.13 + 0.17 * math.sin(min(1.0, v / 0.6) * math.pi / 2)) * H
    ry = (0.12 + 0.11 * math.sin(min(1.0, v / 0.6) * math.pi / 2)) * H
    n = 26 + int(18 * v)
    for i in range(n):
        a = TAU * (i + 0.5 * (k % 2)) / n + random.uniform(-0.05, 0.05)
        out = Vector((math.sin(a), -math.cos(a), 0))
        root = Vector((math.sin(a) * rx, -math.cos(a) * ry + 0.01 * H, z))
        d = (out * (0.7 - 0.25 * v) + Vector((0, 0, -0.55 - 0.4 * v))).normalized()
        L = (0.1 + 0.05 * v) * H * random.uniform(0.85, 1.15)
        wd = 0.024 * H
        pts = [root, root + d * L * 0.3 + Vector((0, 0, 0.01 * H)), root + d * L * 0.7, root + d * L + Vector((0, 0, -0.012 * H))]
        nf = (lambda o: (lambda p: (o + Vector((0, 0, 0.6))).normalized()))(out)
        rr = random.random()
        (lb if rr < 0.25 else lc if rr < 0.4 else la).append(rod(pts, [wd * 0.25, wd, wd * 0.7, wd * 0.05], 6, flat=(nf, 0.14)))
b.add('prop_leafCollarA', merge(*la), dryleaf, region='chest', subdiv=0)
b.add('prop_leafCollarB', merge(*lb), dryleaf_lt, region='chest', subdiv=0)
b.add('prop_leafCollarC', merge(*lc), dryleaf_dk, region='chest', subdiv=0)
b.group('prop_leafCollar', 'prop_leafCollar')

# ================================================================ FANTASIADO: prop_heroCloak — a capa verde-oliva
# ESFARRAPADA em duas camadas: a capinha até o peito e a capa até as canelas, a barra em tiras rasgadas


def cape_pt(a, v, out=1.0, low=0.42 * H):
    V0 = 0.2
    th = min(1.0, v / V0) * math.pi / 2
    side = abs(math.sin(a))
    kk = 0.55 + 0.45 * side
    dv = max(0.0, v - V0) / (1 - V0)
    rx = 0.12 * H + 0.24 * H * math.sin(th) * kk + dv * 0.13 * H
    ry = 0.11 * H + 0.1 * H * math.sin(th) + dv * 0.08 * H
    fold = 1 + 0.07 * min(1.0, v * 2.5) * (ridge(a * 5 + v * 1.4 + n3(Vector((a, v, 0)), 3)) - 0.4)
    z0 = top + 0.11 * H - 0.17 * H * (1 - math.cos(th)) * kk
    z = z0 - dv * (z0 - low)
    return Vector((math.sin(a) * rx * fold * out / b.k_tx, -math.cos(a) * ry * fold * out / b.k_ty, z))


def tatter(u, depth):
    """a barra rasgada: tiras de comprimentos diferentes (dentes irregulares)"""
    k = u * 46
    tooth = abs((k % 1.0) - 0.5) * 2  # 0 no meio da tira, 1 no corte
    seed = math.floor(k)
    ln = 0.4 + 0.6 * ((math.sin(seed * 12.9898) * 43758.5453) % 1.0)
    return depth * ln * (1 - tooth ** 2)


def cloak_rows(vs, out, low, gap, depth):
    rows_ = []
    for v in vs:
        row = []
        for j in range(97):
            u = gap + (1 - 2 * gap) * j / 96
            p = cape_pt(u * TAU, v, out, low)
            if v > 0.999:
                p = p + Vector((0, 0, -tatter(u, depth)))
            elif v > 0.9:
                p = p + Vector((0, 0, -tatter(u, depth) * (v - 0.9) / 0.1))
            row.append(p)
        rows_.append(row)
    return rows_


def cape_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.16 * H, 0.32 * H, abs(p.x)) * smoothstep(top - 0.55 * H, top - 0.12 * H, p.z) * 0.5
    w_hip = smoothstep(hz + 0.12 * H, hz - 0.35 * H, p.z) * (1 - w_arm) * 0.75
    return {'s' + side: w_arm, 'hips': w_hip, 'sp': max(0.0, 1 - w_arm - w_hip)}


VS = [0.2 * k / 6 for k in range(6)] + [0.2 + 0.8 * k / 16 for k in range(0, 17)]
big = b.add('prop_heroCloakLong', shell_grid(cloak_rows(VS, 1.0, 0.36 * H, 0.06, 0.16 * H), 0.007 * H), hcloak, region='torso', weight_fn=cape_weights, subdiv=0)
relief(big, lambda p: 0.006 * H * (ridge(math.atan2(p.x, p.y) * 9 + n3(p, 9) * 1.5, 2) - 0.35) * smoothstep(top, top - 0.4 * H, p.z))
VS2 = [0.2 * k / 6 for k in range(6)] + [0.2 + 0.8 * k / 8 for k in range(0, 9)]
small = b.add('prop_heroCloakShort', shell_grid(cloak_rows(VS2, 1.06, top - 0.4 * H, 0.02, 0.08 * H), 0.007 * H), hcloak, region='torso', weight_fn=cape_weights, subdiv=0)
relief(small, lambda p: 0.005 * H * (ridge(math.atan2(p.x, p.y) * 11 + n3(p, 9) * 1.5, 2) - 0.35))
b.group('prop_heroCloak', 'prop_heroCloak')

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'mael.blend'), check_existing=False)
