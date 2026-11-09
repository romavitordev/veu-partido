"""
IVETE BEICUR — Ordo Realitas (Desconjuração) — public/models/ivete.glb.
Referências (wiki "Ivete Beicur", vistas no navegador): a arte promocional de Desconjuração, "Ivete em Desconjuração -
Pt. 1", a miniatura com a escopeta e "Ivete de costas em Hexatombe". Entre 50 e 60 anos, ~1,68 m, magra.
  - cabelo GRISALHO preso no alto num RABO DE CAVALO bagunçado (desce até o alto das costas), mechas soltas no rosto;
  - REGATA PRETA com decote em V; JAQUETA JEANS desgastada por cima (aberta, bolsos com aba no peito, mangas puxadas até
    o cotovelo, a barra desfiada) — textura denim_ivete;
  - a TATUAGEM da insígnia dos Gaudérios Abutres no braço DIREITO (textura arms_ivete, só no braço direito);
  - CALÇA JEANS ESCURA, SAPATOS PRETOS, uma pulseira simples, e o CIGARRO na boca (o vício em fumar).
A espingarda com o cinto de cartuchos é montada em código (props.js addIveteProps: nas costas e na mão).
Feito e conferido no Blender aberto pelo MCP (regra do dono, 2026-11-09):
  exec(open(r"E:/arena paranormal/tools/blender/mcp_build.py", encoding="utf-8").read()); mcp_build("ivete")
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'ivete.glb'
random.seed(1966)

b = Builder(width=0.9, bulk=0.9, height=0.935)  # ~1,68 m, magra
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_ivete', '#d6a688', 0.8)
M = {
    'skin': skin,
    'face': material('face_ivete', '#ffffff', 0.8),  # rugas, olhos escuros, batom escuro (textura)
    'torso': material('skin_torso_ivete', '#d6a688', 0.8),  # o tronco (a regata é cortada dele)
    'armR': material('arms_ivete', '#ffffff', 0.8),  # a tatuagem dos Gaudérios no braço direito (textura)
    'armL': skin,
    'hand': skin,
    'legs': material('jeans_ivete', '#2a3446', 0.9),  # jeans escuro
    'feet': material('shoe_ivete', '#141416', 0.5),
}
tank = material('tank_ivete', '#18181c', 0.85)  # a regata preta
denim = material('denim_ivete', '#ffffff', 0.85)  # a jaqueta jeans gasta (textura)
denim_dk = material('denim_ivete_dk', '#41607e', 0.85)
fray = material('fray_ivete', '#cfd8de', 0.95)  # a barra desfiada
copper = material('copper_ivete', '#b87840', 0.35, metal=0.8)
beltm = material('belt_ivete', '#3a2416', 0.7)
silver = material('silver_ivete', '#c0c0c8', 0.3, metal=0.9)
sole = material('sole_ivete', '#0a0a0c', 0.8)
hairm = material('hair_ivete', '#c8c4c0', 0.6)  # grisalho
cig = material('cigarette', '#f2efe8', 0.8)
ember = material('cigaretteEmber', '#ff6a1a', 0.5, emission='#ff5010', strength=3.0)

PREVIEW = {'face_ivete': '#d6a688', 'arms_ivete': '#d6a688', 'denim_ivete': '#5a7c9e'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.11, 0.155), (0.0, 0.155), (0.17, 0.138), (0.36, 0.18), (0.47, 0.195), (0.57, 0.112), (0.63, 0.064)]
hc = b.body(M, TP, arm_r=(0.052, 0.044, 0.038), leg_r=(0.08, 0.062, 0.048), head_r=(0.13, 0.14, 0.154))


def part(name):
    return next(o for o in b.parts if o.name == name)


def lim(x):
    return max(0.0, min(1.0, x))


_bvh = {}


def bvh(name):
    if name not in _bvh:
        o = part(name)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        me.transform(o.matrix_world)
        bm = bmesh.new()
        bm.from_mesh(me)
        _bvh[name] = BVHTree.FromBMesh(bm)
        bm.free()
        bpy.data.meshes.remove(me)
    return _bvh[name]


def surf(name, origin, direction, off=0.0):
    hit = bvh(name).ray_cast(Vector(origin), Vector(direction).normalized())
    return None if hit[0] is None else hit[0] + hit[1] * off


def chest(p):
    x, y, z = p.x, p.y, p.z - hz
    if y > -0.02:
        return 0.0
    return 0.013 * H * math.exp(-((abs(x) - 0.068 * H) / (0.058 * H)) ** 2) * math.exp(-((z - 0.42 * H) / (0.06 * H)) ** 2)


relief(part('torso'), chest)

# ================================================================ a REGATA PRETA com decote em V (cortada do tronco)
V0, VS = 0.38, 0.5  # o V começa em hz + 0,38 H e abre 0,5 por unidade de altura
ARM, TOP, HEM = 0.14, 0.6, 0.03


def tank_keep(p):
    z = (p.z - hz) / H
    ax = abs(p.x) / H
    if z < HEM or z > TOP:
        return False
    if z > 0.43 and ax > ARM:
        return False  # as cavas
    if p.y < 0 and z > V0 and ax < (z - V0) * VS:
        return False  # o DECOTE EM V
    if p.y >= 0 and z > 0.54 and ax < 0.05 + (z - 0.54) * 0.6:
        return False  # o decote das costas
    if z > 0.56 and ax < 0.07:
        return False
    return True


tk = b.add('tank', clothe(part('torso'), tank_keep, 0.006 * H, cuts=5), tank, region='body', weight_fn=lambda p: auto_weights(sk, p, 'torso'), subdiv=0)


def snap_edges(obj):
    """as bordas do clothe saem em degraus: cada vértice da borda vai para a linha de corte mais próxima"""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    mw = obj.matrix_world
    inv = mw.inverted()
    for v in bm.verts:
        if not any(e.is_boundary for e in v.link_edges):
            continue
        p = mw @ v.co
        z, ax, sx = (p.z - hz) / H, abs(p.x) / H, (1 if p.x >= 0 else -1)
        c = []
        if z < HEM + 0.05:
            c.append(Vector((p.x, p.y, hz + HEM * H)))
        if z > TOP - 0.06:
            c.append(Vector((p.x, p.y, hz + TOP * H)))
        if z > 0.41 and ax > ARM - 0.04:
            c.append(Vector((sx * ARM * H, p.y, p.z)))
        if p.y < 0 and V0 - 0.01 < z < TOP + 0.02 and ax < (z - V0) * VS + 0.04:
            c.append(Vector((sx * max(0.0, z - V0) * VS * H, p.y, p.z)))
        if p.y >= 0 and z > 0.53 and ax < 0.05 + (z - 0.54) * 0.6 + 0.04:
            c.append(Vector((sx * (0.05 + max(0.0, z - 0.54) * 0.6) * H, p.y, p.z)))
        if c:
            q = min(c, key=lambda k: (k - p).length)
            if (q - p).length < 0.03 * H:
                v.co = inv @ q
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()


snap_edges(tk)

# ================================================================ a JAQUETA JEANS aberta, até a cintura
JK = [(0.05, 0.176, 0.134, 0.42), (0.12, 0.168, 0.126, 0.42), (0.24, 0.172, 0.126, 0.44), (0.36, 0.198, 0.142, 0.5),
      (0.46, 0.208, 0.148, 0.52), (0.54, 0.18, 0.13, 0.6), (0.6, 0.12, 0.098, 0.78)]
rows = [ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 30) for dz, rx, ry, gap in JK]
jk = b.add('jacket', shell_grid(rows, 0.007), denim, region='torso', subdiv=1)
relief(jk, lambda p: 0.0024 * H * (ridge((p.z - hz) / H * 55 + n3(p, 9) * 2, 2) - 0.4) * (1 if p.z < hz + 0.3 * H else 0.5))
# a BARRA DESFIADA (as costas de Hexatombe) e o cós da jaqueta
hemz = hz + JK[0][0] * H
hem = [(math.sin(a) * (JK[0][1] + 0.003) * H, -math.cos(a) * (JK[0][2] + 0.003) * H, hemz + 0.012 * H) for a in [JK[0][3] + (TAU - 2 * JK[0][3]) * i / 30 for i in range(31)]]
b.add('jacketBand', rod(hem, 0.014 * H, 6, flat=(outward((0, 0)), 0.35)), denim_dk, region='torso', subdiv=0)
frayed = [(math.sin(a) * (JK[0][1] + 0.002) * H, -math.cos(a) * (JK[0][2] + 0.002) * H, hemz - 0.004 * H) for a in [JK[0][3] + (TAU - 2 * JK[0][3]) * i / 30 for i in range(31)]]
b.add('jacketFray', rod(frayed, 0.006 * H, 5, flat=(outward((0, 0)), 0.5)), fray, region='torso', subdiv=0)
for s in (1, -1):  # as bordas da frente e os botões de cobre
    pts = []
    for dz, rx, ry, gap in JK:
        a = gap if s > 0 else TAU - gap
        pts.append(Vector((math.sin(a) * (rx + 0.003) * H, -math.cos(a) * (ry + 0.003) * H, hz + dz * H)))
    b.add(f'jacketEdge{s}', rod(pts, 0.008 * H, 6, flat=(outward((0, 0)), 0.4)), denim_dk, region='torso', subdiv=0)
    if s > 0:
        for dz in (0.12, 0.24, 0.36, 0.46):
            r = next(k for k in JK if k[0] >= dz - 1e-6)
            a = r[3] + 0.06
            c = Vector((math.sin(a) * (r[1] + 0.006) * H, -math.cos(a) * (r[2] + 0.006) * H, hz + dz * H))
            b.add(f'button{dz}', ellipsoid(tuple(c), (0.009 * H, 0.004 * H, 0.009 * H), 8, 4), copper, region='torso', subdiv=0)
    # o BOLSO DO PEITO com a aba e o botão (jaqueta jeans clássica)
    a = 0.62 if s > 0 else TAU - 0.62
    rx, ry = 0.205 * H, 0.146 * H
    pc = Vector((math.sin(a) * (rx + 0.004 * H), -math.cos(a) * (ry + 0.004 * H), hz + 0.42 * H))
    flap = [ring_pts(hz + (0.43 + k * 0.012) * H, rx + 0.006 * H, ry + 0.006 * H, a - 0.2, a + 0.2, 6) for k in range(3)]
    b.add(f'pocketFlap{s}', shell_grid(flap, 0.004), denim_dk, region='torso', subdiv=0)
    b.add(f'pocketButton{s}', ellipsoid((pc.x * 1.02, pc.y * 1.03, pc.z + 0.012 * H), (0.007 * H, 0.004 * H, 0.007 * H), 8, 4), copper, region='torso', subdiv=0)
# a GOLA de camisa dobrada
gola = [ring_pts(1.52 * H + k * 0.04 * H, (0.11 + k * 0.016) * H, (0.095 + k * 0.016) * H, 0.92 - k * 0.04, TAU - 0.92 + k * 0.04, 18) for k in range(3)]
b.add('jacketCollar', shell_grid(gola, 0.006), denim_dk, region='neck', subdiv=1)
# as MANGAS puxadas até o cotovelo, com o punho enrolado
for side in ('L', 'R'):
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    end = e.lerp(h, 0.12)
    S = Sculpt()
    S.chain([s_ + Vector((0, 0, 0.02 * H)), s_.lerp(e, 0.5), e, end], [0.05 * H, 0.051 * H, 0.051 * H, 0.051 * H], step=0.4)  # o braço tem ~0,065 m de raio (medido no MCP)
    S.ell(s_ + Vector((0, 0, 0.012 * H)), (0.047 * H, 0.047 * H, 0.04 * H))
    ax = (e - s_).normalized()
    fold = lambda p, a=s_, ax=ax: 0.0032 * H * (ridge((p - a).dot(ax) / H * 70 + n3(p, 14) * 2, 2) - 0.4)
    b.add('sleeve' + side, S.mesh(res=0.007, smooth=3, disp=fold, target=1000), denim, region='arm' + side, subdiv=0)
    d = (h - e).normalized()
    b.add('sleeveRoll' + side, tube(limb_rings(end - d * 0.02 * H, end + d * 0.012 * H, 0.058 * H, 0.057 * H, n=2), 14), denim_dk, region='e' + side, subdiv=0)

# ================================================================ CALÇA JEANS escura e o cinto
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k + Vector((0, -0.003 * H, 0)), k.lerp(f, 0.5), k.lerp(f, 0.86)],
            [0.07 * H, 0.06 * H, 0.052 * H, 0.05 * H, 0.05 * H], step=0.45)
    c2 = (l.x, l.y)
    fold = lambda p, c=c2, kz=k.z: 0.0026 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 30 + n3(p, 16), 2) - 0.35) * (1.6 if abs(p.z - kz) < 0.06 * H else 1)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
Hp = Sculpt()
Hp.ell(Vector((0, 0.0, hz - 0.02 * H)), (0.164 * H, 0.122 * H, 0.1 * H))
Hp.ell(Vector((0, 0.012 * H, hz - 0.055 * H)), (0.148 * H, 0.102 * H, 0.075 * H))
b.add('pantsHip', Hp.mesh(res=0.011, smooth=3, disp=lambda p: 0.0015 * H * n3(p, 14), target=800), M['legs'], region='body', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)
belt_ring = [(math.sin(a) * 0.17 * H, -math.cos(a) * 0.128 * H, hz + 0.05 * H) for a in [i / 28 * TAU for i in range(29)]]
b.add('belt', rod(belt_ring, 0.017 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), beltm, region='torso', subdiv=0)
b.add('buckle', box((0, -0.133 * H, hz + 0.05 * H), (0.04, 0.01, 0.03), bevel=0.004), silver, region='torso', subdiv=0)

# ================================================================ SAPATOS PRETOS
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    B = Sculpt()
    B.chain([k.lerp(f, 0.82), f + Vector((0, 0.005 * H, 0.045 * H))], [0.05 * H, 0.048 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.05 * H, 0.115 * H, 0.04 * H))
    B.ell(f + Vector((0, -0.125 * H, 0.022 * H)), (0.044 * H, 0.05 * H, 0.03 * H))
    B.ell(f + Vector((0, 0.03 * H, 0.035 * H)), (0.046 * H, 0.046 * H, 0.045 * H))
    b.add('shoe' + side, B.mesh(res=0.007, smooth=3, disp=lambda p: 0.001 * H * n3(p, 10), target=900), M['feet'], region='k' + side, subdiv=0)
    b.add('sole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.014 * H), (0.1 * H, 0.24 * H, 0.026 * H), bevel=0.005), sole, region='k' + side, subdiv=0)

# a PULSEIRA simples no pulso esquerdo (x > 0)
eL, hL = sk['eL'], sk['handL']
b.add('bracelet', tube(limb_rings(eL.lerp(hL, 0.86), eL.lerp(hL, 0.9), 0.042 * H, 0.042 * H, n=1), 14), silver, region='eL', subdiv=0)

# ================================================================ CABELO GRISALHO preso no alto (rabo de cavalo bagunçado)
HC = Vector((hc.x, hc.y, hc.z))
V = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
random.seed(1967)


def hair_weights(p):
    t = smoothstep(sk['hd'].z + 0.02 * H, sk['neck'].z - 0.01 * H, p.z)
    return {'hd': 1 - t, 'chest': t}


Hr = Sculpt()
Hr.ell(V(0, 0.014, 0.03), (0.142 * H, 0.155 * H, 0.15 * H))  # a calota rente (o cabelo puxado para trás)
TIE = V(0, 0.1, 0.13)  # onde o elástico prende: atrás do alto da cabeça
# as mechas PUXADAS da linha do cabelo até o elástico (a calota fica com sulcos de cabelo penteado para trás)
for i in range(16):
    a = (i / 15 - 0.5) * 2.6  # da têmpora esquerda à direita, pela frente
    p0 = V(math.sin(a) * 0.12, -math.cos(a) * 0.11, 0.1 - 0.06 * abs(math.sin(a)))
    mid = V(math.sin(a) * 0.1, -math.cos(a) * 0.04 + 0.02, 0.16)
    Hr.chain([p0, mid, TIE], [0.022 * H, 0.024 * H, 0.02 * H], step=0.4)
# o NÓ do elástico e o RABO DE CAVALO descendo até o alto das costas, em mechas desencontradas
Hr.ell(TIE, (0.045 * H, 0.04 * H, 0.04 * H))
for i in range(7):
    dx = (i - 3) * 0.013
    end = -0.4 - random.random() * 0.08
    # rente à nuca e às costas (antes saía em gancho, longe do pescoço — conferido de lado no MCP)
    pts = [TIE + Vector((dx * H * 0.4, 0.01 * H, 0)), V(dx, 0.175, 0.06), V(dx * 1.15, 0.185, -0.06), V(dx * 1.2, 0.175, -0.18),
           V(dx * 1.15, 0.17, -0.3), V(dx, 0.165, end)]
    Hr.chain(pts, [0.03 * H, 0.03 * H, 0.027 * H, 0.024 * H, 0.017 * H, 0.004 * H], step=0.35)
# as mechas SOLTAS: uma fina de cada lado do rosto (cai da têmpora até o queixo) e o alto um pouco bagunçado, rente
for s in (1, -1):
    pts = [V(s * 0.09, -0.1, 0.1), V(s * 0.12, -0.112, 0.0), V(s * 0.125, -0.1, -0.1), V(s * 0.115, -0.085, -0.19)]
    Hr.chain(pts, [0.013 * H, 0.012 * H, 0.009 * H, 0.003 * H], step=0.35)
for k in range(6):
    a = random.uniform(-1.3, 1.3)
    p0 = V(math.sin(a) * 0.09, -math.cos(a) * 0.06 + 0.02, 0.165)
    Hr.chain([p0, p0 + Vector((math.sin(a) * 0.03 * H, -0.01 * H, 0.008 * H)), p0 + Vector((math.sin(a) * 0.05 * H, 0.0, -0.012 * H))],
             [0.012 * H, 0.009 * H, 0.004 * H], step=0.4)
Hr.ell(V(0, -0.125, -0.06), (0.104 * H, 0.1 * H, 0.15 * H), neg=True)  # o rosto livre (a testa aparece)


def strands(p):
    a = math.atan2(p.x - HC.x, p.y - HC.y)
    return 0.0026 * H * (ridge(a * 26 + p.z / H * 20 + n3(p, 20) * 1.4, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.0065, smooth=3, disp=strands, target=4200), hairm, region='head', weight_fn=hair_weights, subdiv=0)
# o elástico preto
b.add('hairTie', tube(limb_rings(TIE + Vector((0, 0.035 * H, -0.004 * H)), TIE + Vector((0, 0.05 * H, -0.01 * H)), 0.03 * H, 0.03 * H, n=1), 12), M['feet'], region='head', subdiv=0)

# ================================================================ o CIGARRO no canto da boca (lado direito, -x) com a brasa
mouth = V(-0.035, -0.128, -0.075)
b.add('prop_cigarette', tube([(mouth.x, mouth.y, mouth.z, 0.0065, 0.0065), (mouth.x - 0.045, mouth.y - 0.032, mouth.z - 0.012, 0.0065, 0.0065)], 6), cig, region='head', subdiv=0)
b.add('prop_cigaretteEmber', ellipsoid((mouth.x - 0.047, mouth.y - 0.034, mouth.z - 0.013), (0.0075, 0.0075, 0.0075), 6, 4), ember, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'ivete.blend'), check_existing=False)
