"""
CAIO TELES — PSIKOLERA (Hexatombe), o vocalista da banda — public/models/caio.glb.
Referências (wiki "Caio Teles", vistas no navegador, sem baixar): "Arte Caio com Microfone em Hexatombe" (frente e
costas), "Arte Caio Teles sem Mascara em Hexatombe" (frente e costas), "Arte conceitual de Caio":
  - alto e ROBUSTO; o MACACÃO de camisa de força creme, inteiro (mangas compridas), manchado de sangue nos punhos, nos
    joelhos e na barra;
  - as TIRAS: três faixas em volta de cada braço, as faixas que saem dos ombros e caem em LAÇOS pelo peito e pelas costas,
    a faixa vertical da gola até o meio das pernas, as faixas nas canelas;
  - a GOLA com a argola de metal e a CORRENTE pendurada no pescoço como colar, até a barriga;
  - as ALGEMAS COM ESPINHOS nos dois pulsos; as FAIXAS vermelho-escuras nas mãos; a corrente presa no tornozelo esquerdo;
    o sapato preto;
  - sem máscara: o cabelo preto curto com o topo pintado de VERMELHO, a barba rala, os piercings (face_caio);
  - prop_maskOn: a MÁSCARA DE FERRO vermelha — uma placa "PARE" ALONGADA na vertical, com as frestas dos olhos e a fenda
    da boca (a pintura é a textura mask_caio). Só aparece no despertar, como o resto da PSIKOLERA.
A Espada Microfone fica em código (src/models/weapons.js → espadaMicrofone; props.js → addCaioProps).
  exec(open("tools/blender/mcp_build.py").read()); mcp_build("caio")   (Blender vivo pelo MCP)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, shell_grid, relief, hug, chain_mesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'caio.glb'
random.seed(91)

b = Builder(width=1.05, bulk=1.06, height=1.05)  # alto e robusto
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_caio', '#d2a07e', 0.8)
suit = material('suit_caio', '#d9d0bb', 0.92)  # o macacão creme da arte (respingos de sangue: textura)
pants = material('pants_caio', '#d9d0bb', 0.92)  # as pernas (joelhos e barra encharcados: textura)
M = {
    'skin': skin,
    'face': material('face_caio', '#ffffff', 0.8),
    'torso': suit,
    'arm': material('sleeve_caio', '#d9d0bb', 0.92),  # mangas compridas (o sangue escorre até o punho: textura)
    'hand': material('wrap_caio', '#6e2a24', 0.95),  # as faixas vermelho-escuras nas mãos
    'legs': suit,
    'feet': material('shoe_caio', '#16161a', 0.6),
}
strap = material('strap_caio', '#b0a58c', 0.85)  # as tiras, um tom abaixo do tecido
blood = material('blood_caio', '#8a2a26', 0.8)
bloodDk = material('blood_caio_dk', '#5a1414', 0.7)  # o sangue mais velho e encharcado  # o sangue nos punhos, nos joelhos e na barra
wrap = M['hand']
metal = material('buckle_caio', '#9a9a9e', 0.35, metal=0.9)
iron = material('iron_caio', '#3a3a3e', 0.45, metal=0.8)  # as algemas
spike = material('spike_caio', '#c8c8cc', 0.3, metal=0.9)
chainm = material('chain_caio', '#8e8e94', 0.35, metal=0.9)
sole = material('sole_caio', '#2a2a2e', 0.7)
hairm = material('hair_caio', '#141214', 0.7)
hairr = material('hair_caio_red', '#a8141c', 0.6)
maskm = material('mask_caio', '#ffffff', 0.45, metal=0.3)  # a pintura da placa PARE (textura no jogo)
maskb = material('mask_caio_back', '#5a0a0e', 0.5, metal=0.4)

PREVIEW = {'face_caio': '#d2a07e', 'mask_caio': '#b8141c'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.172), (0.0, 0.172), (0.18, 0.17), (0.38, 0.222), (0.5, 0.238), (0.6, 0.13), (0.66, 0.072)]
hc = b.body(M, TP, arm_r=(0.074, 0.062, 0.05), leg_r=(0.094, 0.078, 0.066), head_r=(0.132, 0.144, 0.158))


def part(name):
    return next(o for o in b.parts if o.name == name)


# o tecido grosso: dobras no tronco e nos braços
relief(part('torso'), lambda p: 0.004 * H * (ridge(p.z / H * 22 + n3(p, 9) * 1.4, 2) - 0.4))
for side in ('L', 'R'):
    relief(part('arm' + side), lambda p: 0.004 * H * (ridge(p.z / H * 30 + n3(p, 12) * 1.6, 2) - 0.4))

def cyl_uv(part, a, b):
    """UV cilíndrico ao longo de a→b (u = 0,5 na frente; v = 1 em a): as peças esculpidas vêm sem UV"""
    v, f, _ = part
    a, b = Vector(a), Vector(b)
    ax = b - a
    L = ax.length
    ax.normalize()
    ref = Vector((0, -1, 0))
    ref = (ref - ax * ref.dot(ax)).normalized()
    ref2 = ax.cross(ref)
    uv = []
    for q in v:
        d = Vector(q) - a
        r = d - ax * d.dot(ax)
        uv.append((math.atan2(r.dot(ref2), r.dot(ref)) / TAU + 0.5, 1 - d.dot(ax) / L))
    return v, f, uv


TOR = part('torso')
flat = (outward((0, 0)), 0.3)

# ================================================================ as PERNAS largas do macacão, as tiras da canela e o sapato
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.06 * H)), l.lerp(k, 0.5), k, k.lerp(f, 0.55), k.lerp(f, 0.86)], [0.1 * H, 0.086 * H, 0.08 * H, 0.074 * H, 0.074 * H], step=0.45)
    fold = lambda p, c=(l.x, l.y): 0.004 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 30 + n3(p, 14), 2) - 0.35)
    b.add('pants' + side, cyl_uv(P.mesh(res=0.01, smooth=3, disp=fold, target=1300), l + Vector((0, 0, 0.06 * H)), k.lerp(f, 0.9)), pants, region='leg' + side, subdiv=0)
    # as TIRAS nas canelas (duas) e no joelho (uma)
    for t, r in ((0.1, 0.082), (0.45, 0.077), (0.62, 0.076)):
        c = k.lerp(f, t) if t > 0.2 else l.lerp(k, 0.92)
        tilt = 0.01 * H
        b.add(f'shinStrap{side}{int(t * 100)}', tube([(c.x, c.y, c.z - 0.013 * H + tilt, r * H, r * H), (c.x, c.y, c.z + 0.013 * H - tilt, r * H, r * H)], 18), strap, region=('k' if t > 0.2 else 'leg') + side, subdiv=0)
    # o sapato preto
    B = Sculpt()
    B.chain([f + Vector((0, 0.01 * H, 0.08 * H)), f + Vector((0, 0.005 * H, 0.04 * H))], [0.05 * H, 0.05 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.052 * H, 0.12 * H, 0.042 * H))
    b.add('shoe' + side, B.mesh(res=0.007, smooth=3, target=900), M['feet'], region='k' + side, subdiv=0)
    b.add('shoeSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.012 * H), (0.105 * H, 0.255 * H, 0.03 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
    if side == 'L':  # a CORRENTE presa no tornozelo esquerdo, caindo no chão
        ac = k.lerp(f, 0.9)
        ring = [Vector((ac.x + math.sin(a) * 0.08 * H, ac.y - math.cos(a) * 0.08 * H, ac.z + 0.01 * H * math.sin(2 * a))) for a in [i / 20 * TAU for i in range(21)]]
        b.add('ankleChain', chain_mesh(ring, link=0.022 * H, r=0.0032 * H, closed=True), chainm, region='k' + side, subdiv=0)
        tail = [ring[5], ring[5] + Vector((0.03 * H, 0.02 * H, -0.05 * H)), Vector((ac.x + 0.12 * H, ac.y + 0.08 * H, f.z - 0.02 * H)), Vector((ac.x + 0.2 * H, ac.y + 0.2 * H, f.z - 0.02 * H))]
        b.add('ankleChainTail', chain_mesh(tail, link=0.022 * H, r=0.0032 * H), chainm, region='k' + side, subdiv=0)

# ================================================================ o ARNÊS: os LAÇOS que caem dos ombros pelo peito e pelas costas
SH = {s: Vector((s * 0.2 * H, 0.0, hz + 0.585 * H)) for s in (1, -1)}
for i, (sag, off) in enumerate(((0.47, 0.006), (0.4, 0.011), (0.33, 0.016))):
    for front in (True, False):
        if not front and i == 2:
            continue
        y = -0.24 * H if front else 0.22 * H
        z0 = hz + (0.585 - 0.01 * i) * H
        pts = []
        for j in range(13):
            u = j / 12
            x = (u * 2 - 1) * 0.2 * H
            z = z0 - (z0 - (hz + sag * H)) * math.sin(u * math.pi) ** 0.8
            pts.append((x, y, z))
        pts = hug(TOR, pts, off * H)
        b.add(f'loop{"F" if front else "B"}{i}', rod(pts, 0.02 * H, 5, flat=flat), strap, region='chest', subdiv=0)
# as alças por cima dos ombros (de onde os laços saem)
for s in (1, -1):
    over = hug(TOR, [(s * 0.2 * H, -0.12 * H, hz + 0.57 * H), (s * 0.21 * H, 0.0, hz + 0.62 * H), (s * 0.2 * H, 0.12 * H, hz + 0.57 * H)], 0.01 * H)
    b.add(f'over{s}', rod(over, 0.02 * H, 5, flat=flat), strap, region='chest', subdiv=0)
# a FAIXA VERTICAL da gola até o meio das pernas, com a fivela no peito
vz = hug(TOR, [(0, -0.22 * H, z) for z in [hz + 0.58 * H - 0.6 * H * i / 12 for i in range(13)]], 0.012 * H)
b.add('centerStrap', rod(vz, 0.018 * H, 5, flat=flat), strap, region='chest', subdiv=0)
bk = vz[4]
b.add('centerBuckle', box(tuple(bk + Vector((0, -0.006 * H, 0))), (0.04 * H, 0.01 * H, 0.03 * H), bevel=0.003), metal, region='chest', subdiv=0)
# o cinto
belt = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, hz + 0.05 * H) for a in [i / 40 * TAU for i in range(41)]], 0.006 * H)
b.add('belt', rod(belt, 0.022 * H, 6, caps=False, flat=flat), strap, region='torso', subdiv=0)
bf = min(belt, key=lambda v: v.y)
b.add('beltBuckle', box(tuple(bf + Vector((0, -0.006 * H, 0))), (0.05 * H, 0.01 * H, 0.036 * H), bevel=0.003), metal, region='torso', subdiv=0)

# ================================================================ a GOLA com a ARGOLA e a CORRENTE do pescoço
b.add('collar', tube([(0, 0, hz + 0.585 * H, 0.112 * H, 0.098 * H), (0, 0, hz + 0.63 * H, 0.084 * H, 0.08 * H)], 22), suit, region='chest', subdiv=0)
rg = Vector((0, -0.095 * H, hz + 0.6 * H))
ringpts = [rg + Vector((math.cos(a) * 0.022 * H, -0.004 * H, math.sin(a) * 0.022 * H)) for a in [i / 16 * TAU for i in range(17)]]
b.add('collarRing', rod(ringpts, 0.005 * H, 6, caps=False), metal, region='chest', subdiv=0)
# a corrente: sai dos dois lados da gola e cai em U até a barriga (por cima das tiras)
neck = []
for j in range(17):
    u = j / 16
    a = (u * 2 - 1) * 1.25
    x = math.sin(a) * 0.12 * H
    z = hz + 0.59 * H - 0.32 * H * math.cos((u * 2 - 1) * math.pi / 2) ** 1.4
    neck.append((x, -0.2 * H, z))
neck = hug([TOR] + [o for o in b.parts if o.name.startswith(('loopF', 'centerStrap'))], neck, 0.01 * H)
b.add('neckChain', chain_mesh(neck, link=0.03 * H, r=0.004 * H), chainm, region='chest', subdiv=0)

# ================================================================ BRAÇOS: as três tiras, o sangue no punho, as ALGEMAS COM ESPINHOS
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh, el, hd = sk['s' + side], sk['e' + side], sk['hand' + side]
    for k_, t in enumerate((0.3, 0.5, 0.7)):
        c = sh.lerp(el, t)
        r = (0.08 - 0.008 * t) * H
        ax = (el - sh).normalized()
        b.add(f'armStrap{side}{k_}', tube(limb_rings(c - ax * 0.014 * H, c + ax * 0.014 * H, r, r, n=1), 16), strap, region='arm' + side, subdiv=0)
        bk = c + Vector((s * r, -0.01 * H, 0))
        b.add(f'armBuckle{side}{k_}', box(tuple(bk), (0.012 * H, 0.024 * H, 0.02 * H), bevel=0.002), metal, region='arm' + side, subdiv=0)
        # as pontas soltas das tiras (a arte: penduradas para fora do braço)
        b.add(f'armTail{side}{k_}', rod([bk, bk + Vector((s * 0.008 * H, -0.006 * H, -0.03 * H)), bk + Vector((s * 0.01 * H, -0.004 * H, -0.055 * H))], 0.009 * H, 4, flat=(outward((0, 0)), 0.3)), strap, region='arm' + side, subdiv=0)
    # o sangue no punho da manga
    c0, c1 = el.lerp(hd, 0.62), el.lerp(hd, 0.8)
    b.add('cuffBlood' + side, tube(limb_rings(c0, c1, 0.06 * H, 0.057 * H, n=1), 16), blood, region='e' + side, subdiv=0)
    # a ALGEMA com espinhos no pulso
    c = el.lerp(hd, 0.86)
    ax = (hd - el).normalized()
    b.add('cuff' + side, tube(limb_rings(c - ax * 0.022 * H, c + ax * 0.022 * H, 0.062 * H, 0.062 * H, n=1), 18), iron, region='e' + side, subdiv=0)
    ref = Vector((0, 0, 1)) if abs(ax.z) < 0.9 else Vector((1, 0, 0))
    u1 = ax.cross(ref).normalized()
    u2 = ax.cross(u1).normalized()
    sp = []
    for j in range(10):
        a = j / 10 * TAU
        d = u1 * math.cos(a) + u2 * math.sin(a)
        base = c + d * 0.058 * H + ax * (0.008 * H if j % 2 else -0.008 * H)
        sp.append(cone(tuple(base), tuple(base + d * 0.04 * H), 0.008 * H, 6))
    b.add('cuffSpikes' + side, merge(*sp), spike, region='e' + side, subdiv=0)
    # a corrente curta pendurada da algema
    p0 = c - u2 * 0.064 * H
    b.add('cuffChain' + side, chain_mesh([p0, p0 + Vector((0, -0.01 * H, -0.05 * H)), p0 + Vector((s * 0.01 * H, -0.02 * H, -0.1 * H))], link=0.02 * H, r=0.003 * H), chainm, region='e' + side, subdiv=0)

# ================================================================ o CABELO preto curto com o TOPO VERMELHO
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
Hr = Sculpt()
Hr.ell(Vh(0, 0.012, 0.03), (0.146 * H, 0.156 * H, 0.15 * H))
Hr.ell(Vh(0, -0.135, -0.06), (0.112 * H, 0.1 * H, 0.14 * H), neg=True)  # o rosto livre
Hr.ell(Vh(0, 0.04, -0.14), (0.16 * H, 0.16 * H, 0.06 * H), neg=True)  # a nuca raspada curta
HAIR = b.add('hair', Hr.mesh(res=0.006, smooth=2, disp=lambda p: 0.003 * H * (ridge(math.atan2(p.x - HC.x, p.y - HC.y) * 20 + n3(p, 30) * 2, 2) - 0.4), target=3500), hairm, region='head', subdiv=0)
# só UMA MECHA pintada de vermelho (a arte sem máscara): na frente, do lado esquerdo, caindo para o lado
Rr = Sculpt()
for k in range(6):
    x = 0.035 + 0.012 * k + random.uniform(-0.004, 0.004)
    top = Vh(x, -0.1 + 0.012 * k, 0.15 - 0.6 * x * x)
    mid = top + Vector((0.02 * H, -0.025 * H, -0.005 * H))
    tip = top + Vector(((0.045 + random.uniform(0, 0.015)) * H, -0.04 * H, -random.uniform(0.03, 0.05) * H))
    Rr.chain([top, mid, tip], [0.016 * H, 0.012 * H, 0.004 * H], step=0.45)
b.add('hairRed', Rr.mesh(res=0.004, smooth=2, target=900), hairr, region='head', subdiv=0)

# O SANGUE da roupa é PINTADO nas texturas (src/models/textures.js: suit_caio, sleeve_caio, pants_caio): respingos,
# os punhos e a barra encharcados, os joelhos manchados (a arte)

# ================================================================ MAIS CORRENTES: os laços na cintura e as pontas penduradas
for s in (1, -1):
    path = hug(TOR, [(s * 0.02 * H, -0.24 * H, hz + 0.04 * H), (s * 0.1 * H, -0.24 * H, hz - 0.06 * H), (s * 0.17 * H, -0.2 * H, hz - 0.02 * H), (s * 0.2 * H, -0.05 * H, hz + 0.04 * H)], 0.03 * H)
    b.add(f'hipChain{s}', chain_mesh(path, link=0.026 * H, r=0.0036 * H), chainm, region='hips', subdiv=0)
    bp = hug(TOR, [(s * 0.2 * H, 0.04 * H, hz + 0.04 * H), (s * 0.12 * H, 0.2 * H, hz - 0.04 * H), (0, 0.22 * H, hz + 0.0), (-s * 0.05 * H, 0.21 * H, hz + 0.03 * H)], 0.03 * H)
    b.add(f'backChain{s}', chain_mesh(bp, link=0.028 * H, r=0.0036 * H), chainm, region='hips', subdiv=0)
# a corrente solta que cai do cinto pela coxa esquerda, com o cadeado na ponta
lL, kL = sk['lL'], sk['kL']
drop = [Vector(q) for q in hug(TOR, [(0.13 * H, -0.3 * H, hz + 0.04 * H)], 0.03 * H)]
for t in (0.25, 0.5):
    c = lL.lerp(kL, t)
    drop += hug(part('pantsL'), [c + Vector((0.02 * H, -0.3 * H, 0))], 0.012 * H, center=c)
b.add('thighChain', chain_mesh(drop, link=0.026 * H, r=0.0036 * H), chainm, region='legL', subdiv=0)
b.add('thighLock', box(tuple(drop[-1] + Vector((0, 0, -0.025 * H))), (0.03 * H, 0.014 * H, 0.032 * H), bevel=0.003), metal, region='legL', subdiv=0)
# os ESPINHOS nas tiras dos braços (a arte: pontas para fora nos braços)
for side in ('L', 'R'):
    s_ = 1 if side == 'L' else -1
    sh, el = sk['s' + side], sk['e' + side]
    spk = []
    for t in (0.3, 0.5, 0.7):
        c = sh.lerp(el, t)
        r = (0.08 - 0.008 * t) * H
        for a in (-0.6, 0.0, 0.6):
            d = Vector((s_ * math.cos(a), -math.sin(a) * 0.8, 0)).normalized()
            base = c + d * (r - 0.004 * H)
            spk.append(cone(tuple(base), tuple(base + d * 0.03 * H), 0.007 * H, 6))
    b.add('armSpikes' + side, merge(*spk), spike, region='arm' + side, subdiv=0)

# ================================================================ prop_maskOn: a MÁSCARA DE FERRO — a placa PARE alongada
# a placa é um octógono ALONGADO na vertical, curvado em volta do rosto. UV plano (u pela largura, v pela altura): a
# textura mask_caio pinta o vermelho, a borda branca, o "PARE", as frestas dos olhos e a fenda da boca.
MW, MH = 0.118, 0.205  # meia largura e meia altura (frações de H)
mz = hc.z + 0.015 * H
OCT = [(-0.05, 0.205), (0.05, 0.205), (0.118, 0.125), (0.118, -0.125), (0.05, -0.205), (-0.05, -0.205), (-0.118, -0.125), (-0.118, 0.125)]


def outline(n=64):
    pts = []
    per = [math.dist(OCT[i], OCT[(i + 1) % 8]) for i in range(8)]
    tot = sum(per)
    for j in range(n):
        d = j / n * tot
        i = 0
        while d > per[i]:
            d -= per[i]
            i += 1
        a, c = OCT[i], OCT[(i + 1) % 8]
        t = d / per[i]
        pts.append((a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t))
    return pts


def surf(x, z, off):
    # a placa curva em volta do rosto (raio 0,15 H na horizontal), colada à frente do nariz
    y = hc.y - (0.176 + off) * H + (0.15 - math.sqrt(max(0.0, 0.0225 - x * x))) * H
    return (x * H, y, mz + z * H)


OUT_PTS = outline()
N = len(OUT_PTS)
RINGS = 6
verts, faces, uvs = [], [], []
for side, off in (('front', 0.0), ('back', -0.016)):
    base = len(verts)
    verts.append(surf(0, 0, off))
    uvs.append((0.5, 0.5))
    for r in range(1, RINGS + 1):
        k = r / RINGS
        for (x, z) in OUT_PTS:
            verts.append(surf(x * k, z * k, off))
            uvs.append((0.5 + x * k / (2 * MW), 0.5 + z * k / (2 * MH)))
    ring = lambda r, j: base + 1 + (r - 1) * N + (j % N)
    for j in range(N):
        tri = (base, ring(1, j), ring(1, j + 1))
        faces.append(tri if side == 'back' else tri[::-1])
    for r in range(1, RINGS):
        for j in range(N):
            q = (ring(r, j), ring(r + 1, j), ring(r + 1, j + 1), ring(r, j + 1))
            faces.append(q if side == 'back' else q[::-1])
fo = lambda j: 1 + (RINGS - 1) * N + (j % N)
bo = lambda j: (1 + RINGS * N) + 1 + (RINGS - 1) * N + (j % N)
for j in range(N):  # a borda (a espessura da chapa)
    faces.append((fo(j), fo(j + 1), bo(j + 1), bo(j)))
b.add('prop_maskOnPlate', (verts, faces, uvs), maskm, region='head', subdiv=0)
# a tira de couro que prende a placa atrás da cabeça
hp = hug([HAIR, part('head')], [HC + Vector((math.sin(a) * 0.17 * H, -math.cos(a) * 0.17 * H, 0.02 * H)) for a in [1.2 + (TAU - 2.4) * i / 14 for i in range(15)]], 0.006 * H, center=HC)
b.add('prop_maskOnStrap', rod(hp, 0.012 * H, 5, flat=((lambda p: p - HC), 0.35)), maskb, region='head', subdiv=0)
# os REBITES nos cantos da placa
rv = []
for (x, z) in OCT:
    p = Vector(surf(x * 0.86, z * 0.9, 0.004))
    rv.append(ellipsoid(tuple(p), (0.008 * H, 0.005 * H, 0.008 * H), 8, 6))
b.add('prop_maskOnRivets', merge(*rv), metal, region='head', subdiv=0)
b.group('prop_maskOn', 'prop_maskOn')  # uma peça só (vários materiais): o jogo liga e desliga junto

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'caio.blend'), check_existing=False)
