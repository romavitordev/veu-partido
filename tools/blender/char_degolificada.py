"""
A DEGOLIFICADA (chefe da 2ª dungeon do Outro Lado, a Escola Nostradamus) — public/models/degolificada.glb.
Cânone (wiki "Degolificada"): criatura de Medo com a forma de uma criança/adolescente que FLUTUA a poucos centímetros do
chão; CABELO PRETO LONGO cobrindo o rosto e descendo até o chão; a COLUNA TORTA; os MEMBROS PENDURADOS, sem força; a BOCA
COSTURADA e coberta por FAIXAS; a PELE RACHADA. Na Escola Nostradamus (A Ordem Paranormal) ela é o corpo da Agatha com a
mente do Gabriel (wiki "Gabriel Opspor").
Pelas artes de referência do dono (2026-11-06): o cabelo é MUITO maior que ela — uma coluna reta até o chão na frente do
corpo, que se espalha no chão e se abre em MECHAS GROSSAS que se enrolam na ponta (como tentáculos); a pele cinza-
esverdeada e rachada; os braços e as pernas ENFAIXADOS; a túnica rasgada cor de oliva e a SAIA esfarrapada marrom-
avermelhada; o FERIMENTO aberto na barriga com as vísceras penduradas; os olhos fundos e escuros; os pés apontando para
baixo (ela não pisa).

TÉCNICA (igual ao Espreitador): esculpida do zero com metaballs (sculpt_lib) num ESQUELETO PRÓPRIO com os ossos e nomes do
lutador (as animações são as de todos). O repouso já é torto e SUSPENSO: o corpo inteiro fica LIFT acima do chão (o
cabelo é que encosta nele), o peito torcido, a cabeça pendurada para a frente, os braços caídos e as pernas soltas.
  node tools/blender/build.mjs degolificada   → public/models/degolificada.glb (+ fonte/degolificada.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from lib import BONES, build_armature
from sculpt_lib import Sculpt, ridge, n3, rod, vcol_material, paint
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'degolificada.glb'
random.seed(29)  # 29 de fevereiro, a noite em que tudo começou na escola

b = Builder(thick=(1, 1, 1, 1))
sk = b.sk
LIFT = 0.36  # ela flutua: os pés ficam no ar


def V(x, y, z):
    return Vector((x, y, z))


# ================================================================ O ESQUELETO TORTO E SUSPENSO (frente = -y)
J = {
    'hips': V(0, 0.0, 0.92), 'sp': V(0.01, -0.01, 1.03), 'chest': V(0.05, -0.07, 1.27),
    'neck': V(0.07, -0.17, 1.45), 'hd': V(0.08, -0.25, 1.52), 'top': V(0.07, -0.4, 1.76),
    'sL': V(0.22, -0.1, 1.42), 'eL': V(0.27, -0.15, 1.08), 'handL': V(0.29, -0.19, 0.75), 'handTipL': V(0.3, -0.21, 0.62),
    'sR': V(-0.17, -0.03, 1.36), 'eR': V(-0.23, -0.08, 1.03), 'handR': V(-0.26, -0.11, 0.71), 'handTipR': V(-0.27, -0.13, 0.58),
    'lL': V(0.08, 0.0, 0.9), 'kL': V(0.09, -0.05, 0.5), 'footL': V(0.09, 0.03, 0.12), 'toeL': V(0.09, -0.02, -0.02),
    'lR': V(-0.08, 0.0, 0.9), 'kR': V(-0.1, -0.1, 0.52), 'footR': V(-0.1, 0.0, 0.15), 'toeR': V(-0.1, -0.04, 0.01),
}
J = {k: v + V(0, 0, LIFT) for k, v in J.items()}
J.update({'root': V(0, 0, 0), 'rootTip': V(0, 0, 0.1)})
sk.j.update(J)
bpy.data.objects.remove(b.arm)
b.arm = build_armature(sk)

SEG = {n: (sk[h], sk[t]) for n, h, t, _ in BONES if n != 'root'}


def seg_dist(p, a, c):
    ab = c - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / max(1e-9, ab.length_squared)))
    return (p - (a + ab * t)).length


def closest(p, a, c):
    ab = c - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / max(1e-9, ab.length_squared)))
    return a + ab * t


def bone_w(p, allow, k=3):
    p = Vector(p)
    sc = sorted(((1.0 / (seg_dist(p, *SEG[n]) ** 4 + 1e-7), n) for n in allow), reverse=True)[:k]
    s = sum(w for w, _ in sc)
    return {n: w / s for w, n in sc}


BODY_B = ['hips', 'sp', 'chest', 'neck', 'hd', 'lL', 'kL', 'footL', 'lR', 'kR', 'footR', 'sL', 'sR']
ARM_B = {s: ['chest', 's' + s, 'e' + s, 'hand' + s] for s in 'LR'}

skin = vcol_material('pele_degolificada', rough=0.85)
hairm = material('cabelo_degolificada', '#0a0909', 0.5)
band = material('faixa_degolificada', '#c2b496', 0.95)
stitch = material('costura_degolificada', '#1a0e0c', 0.7)
skirt_m = vcol_material('saia_degolificada', rough=0.95)
wound = material('ferida_degolificada', '#3a0608', 0.4)
guts = material('visceras_degolificada', '#a2465a', 0.35)
socket = material('olho_fundo_degolificada', '#020202', 0.9)
C = {k: Vector(hex_rgb(v)) for k, v in {
    'pele': '#8f9c86', 'racha': '#262a24', 'roxo': '#6c7468', 'roupa': '#4a4630', 'roupa2': '#5c5438', 'sangue': '#4a1214',
    'saia': '#6a2a1a', 'saia2': '#8a4020', 'saia3': '#3a1810',
}.items()}
MB = 1 / 0.575
Z0 = LIFT  # o "chão" do corpo de antes (para os limites da roupa)


def lim(t):
    return max(0.0, min(1.0, t))


def r3(x, y, z):
    return (x * MB, y * MB, z * MB)


def cracks(p):
    """a pele RACHADA: veios finos e escuros (ridge de ruído)"""
    w = n3(p, 3.0) * 5.0
    return ridge(p.x * 31 + p.z * 23 + w, 7) * ridge(p.y * 27 - p.z * 19 + w * 1.3, 7)


CLOTH = {'arm': False}


def clothed(p):
    # a túnica rasgada (do pescoço até o quadril; nos braços, só a manga curta)
    if CLOTH['arm']:
        return p.z > Z0 + 1.22
    return Z0 + 0.82 < p.z < Z0 + 1.4


def skin_col(p):
    if clothed(p):
        c = C['roupa'].lerp(C['roupa2'], lim(n3(p, 6.0) * 0.6 + 0.3))
        if n3(p, 9.0) > 0.35:  # manchas de sangue seco
            c = c.lerp(C['sangue'], 0.55)
        return c
    c = C['pele'].lerp(C['roxo'], lim(n3(p, 2.5) * 0.7 + 0.2) * 0.45)
    k = cracks(p)
    return c.lerp(C['racha'], lim((k - 0.55) * 3.0))


# ================================================================ O CORPO: magro, o peito torcido, a cabeça caída
S = Sculpt()
S.chain([sk['hips'] + V(0, 0, -0.04), sk['sp'], sk['chest'], sk['neck'] + V(0, 0.02, -0.04)], [0.085 * MB, 0.072 * MB, 0.088 * MB, 0.042 * MB])
S.ell(sk['chest'] + V(0, 0.02, 0.05), r3(0.12, 0.065, 0.065), dir=(sk['sL'] - sk['sR']).normalized())  # os ombros, tortos
S.ell(sk['hips'] + V(0, 0.01, -0.04), r3(0.1, 0.07, 0.075))
S.chain([sk['neck'], sk['hd'] + V(0, 0, 0.02)], [0.036 * MB, 0.04 * MB])
UP = (sk['top'] - sk['hd']).normalized()
HC = sk['hd'] + (sk['top'] - sk['hd']) * 0.42
S.ell(HC, r3(0.085, 0.092, 0.1), dir=UP)  # a cabeça pendurada
for s in 'LR':
    S.chain([sk['l' + s], sk['k' + s], sk['foot' + s]], [0.043 * MB, 0.03 * MB, 0.025 * MB])  # as pernas finas
    S.chain([sk['foot' + s], sk['toe' + s]], [0.024 * MB, 0.017 * MB])  # o pé esticado para baixo
body_mesh = S.mesh(res=0.009, smooth=3, disp=lambda p: -0.0025 * lim(cracks(p) - 0.6), target=9000)
bo = b.add('body', body_mesh, skin, region='torso', weight_fn=lambda p: bone_w(p, BODY_B), subdiv=0)
for pl in bo.data.polygons:
    pl.use_smooth = True
paint(bo, skin_col)

# ================================================================ OS BRAÇOS COMPRIDOS, CAÍDOS (dedos finos abertos)
for s in 'LR':
    A = Sculpt()
    A.chain([sk['s' + s], sk['e' + s], sk['hand' + s]], [0.034 * MB, 0.026 * MB, 0.021 * MB])
    A.ell(sk['hand' + s] + V(0, -0.01, -0.05), r3(0.03, 0.015, 0.045))  # a mão mole
    am = A.mesh(res=0.007, smooth=3, disp=lambda p: -0.002 * lim(cracks(p) - 0.6), target=3500)
    ao = b.add('arm' + s, am, skin, region='torso', weight_fn=lambda p, s=s: bone_w(p, ARM_B[s], 2), subdiv=0)
    for pl in ao.data.polygons:
        pl.use_smooth = True
    CLOTH['arm'] = True
    paint(ao, skin_col)
    CLOTH['arm'] = False
    sx = 1 if s == 'L' else -1
    fingers = []
    pc = sk['hand' + s] + V(0, -0.01, -0.09)
    for i in range(5):
        t = (i - 2) / 2
        base = pc + V(sx * t * 0.025, -0.012 * abs(t), 0)
        d = V(sx * t * 0.25, -0.1, -1).normalized()
        pts = [base]
        for k, l in enumerate((0.05, 0.045, 0.035) if i else (0.035, 0.03, 0.02)):  # dedos compridos, de garra
            d = (d + V(sx * random.uniform(-0.1, 0.1), -0.14, 0)).normalized()
            pts.append(pts[-1] + d * l)
        fingers.append(rod(pts, [0.011, 0.009, 0.007, 0.004], 6))
    fo = b.add('fingers' + s, merge(*fingers), skin, region='torso', weight_fn=lambda p, s=s: {'hand' + s: 1.0}, subdiv=0)
    paint(fo, skin_col)


# ================================================================ AS FAIXAS enroladas nos braços e nas pernas
def wrap(a, c, r, turns, bones, tilt=0.0):
    """uma faixa em espiral em volta do segmento a→c (raio r), achatada rente à pele"""
    ax = (c - a).normalized()
    side = ax.orthogonal().normalized()
    up = ax.cross(side)
    n = int(turns * 14)
    pts = []
    for i in range(n + 1):
        t = i / n
        ang = t * turns * math.tau
        rr = r * (1 + 0.08 * math.sin(ang * 3.1))
        pts.append(a.lerp(c, t) + (side * math.cos(ang) + up * math.sin(ang)) * rr)
    axis_pt = lambda p: p - closest(p, a, c)
    return rod(pts, [0.014] * len(pts), 5, caps=False, flat=(axis_pt, 0.3))


wraps = []
for s in 'LR':
    wraps.append(wrap(sk['e' + s].lerp(sk['s' + s], 0.25), sk['hand' + s] + V(0, 0, -0.03), 0.052, 6.5, ARM_B[s]))
    wraps.append(wrap(sk['k' + s] + V(0, 0, 0.12), sk['foot' + s] + V(0, 0, -0.02), 0.05, 7.0, None))
    wraps.append(wrap(sk['l' + s] + V(0, 0, -0.16), sk['k' + s] + V(0, 0, 0.04), 0.058, 4.0, None))
# as pontas soltas, penduradas
loose = []
for s in 'LR':
    for c0 in (sk['hand' + s] + V(0, 0, 0.0), sk['k' + s] + V(0, 0, -0.05)):
        L = random.uniform(0.08, 0.16)
        pts = [c0 + V(0.03, -0.02, -L * k / 3 + 0.01 * math.sin(k)) for k in range(4)]
        loose.append(rod(pts, [0.009, 0.009, 0.008, 0.007], 4))


def band_w(p):
    p = Vector(p)
    allow = ['eL', 'handL', 'eR', 'handR', 'lL', 'kL', 'footL', 'lR', 'kR', 'footR', 'sL', 'sR']
    return bone_w(p, allow, 2)


b.add('bandagesWrap', merge(*wraps, *loose), band, region='torso', weight_fn=band_w, subdiv=0)

# ================================================================ A SAIA esfarrapada (marrom-avermelhada, barra em tiras)
waist = sk['hips'] + V(0, 0.0, 0.06)
segs = 28
rows = 6
sv, sf, su = [], [], []
hem = [random.uniform(0.0, 0.16) + (0.08 if i % 3 == 0 else 0) for i in range(segs)]
for r in range(rows + 1):
    t = r / rows
    for i in range(segs + 1):
        a = i / segs * math.tau
        drop = 0.36 + hem[i % segs] * t
        z = waist.z - drop * t
        rad = 0.098 + 0.1 * t ** 0.8
        rx, ry = rad, rad * 0.82
        sv.append((waist.x + math.sin(a) * rx, waist.y - math.cos(a) * ry - 0.01 * t, z))
        su.append((i / segs, t))
for r in range(rows):
    for i in range(segs):
        a0 = r * (segs + 1) + i
        sf.append((a0, a0 + 1, a0 + segs + 2, a0 + segs + 1))
so = b.add('skirt', (sv, sf, su), skirt_m, region='torso', weight_fn=lambda p: bone_w(p, ['hips', 'lL', 'lR'], 2), subdiv=0)
for pl in so.data.polygons:
    pl.use_smooth = True
sol = bpy.data.objects.get(so.name) if hasattr(so, 'name') else None
if sol:
    sol.modifiers.new('solid', 'SOLIDIFY').thickness = 0.008


def skirt_col(p):
    k = lim(n3(p, 7.0) * 0.7 + 0.4)
    c = C['saia'].lerp(C['saia2'], k * 0.6)
    if (waist.z - p.z) > 0.32:
        c = c.lerp(C['saia3'], 0.6)  # a barra suja
    return c


paint(so, skirt_col)

# ================================================================ O FERIMENTO na barriga e as vísceras penduradas
WC = sk['sp'] + V(-0.01, -0.073, -0.02)
b.add('wound', ellipsoid(tuple(WC), (0.045, 0.018, 0.04), 14, 10), wound, region='torso', weight_fn=lambda p: {'sp': 1.0}, subdiv=0)
gl = []
for i in range(5):
    x = random.uniform(-0.03, 0.03)
    L = random.uniform(0.1, 0.24)
    pts = [WC + V(x, -0.012, 0.0)]
    for k in range(1, 6):
        pts.append(pts[-1] + V(random.uniform(-0.012, 0.012), -0.008 + 0.004 * k, -L / 5))
    gl.append(rod(pts, [0.013, 0.014, 0.012, 0.012, 0.011, 0.01], 6))
b.add('guts', merge(*gl), guts, region='torso', weight_fn=lambda p: {'sp': 0.5, 'hips': 0.5}, subdiv=0)

# ================================================================ O ROSTO: olhos fundos, a boca costurada e as faixas
fwd = UP.cross(V(1, 0, 0)).normalized()
if fwd.y > 0:
    fwd = -fwd
side = V(1, 0, 0)
# o rosto fica NA SUPERFÍCIE da cabeça esculpida (raio na malha): antes os olhos, a boca e as faixas ficavam enterrados
# dentro dela (a cabeça de metaball é maior que os números à mão) e não apareciam (2026-11-07)
TB = BVHTree.FromPolygons([Vector(v) for v in body_mesh[0]], body_mesh[1])


def face_pt(d):
    d = d.normalized()
    hit = TB.ray_cast(HC + d * 0.6, -d)
    return (hit[0], hit[1].normalized()) if hit[0] is not None else (HC + d * 0.13, d)


for s_ in (-1, 1):
    ep, en = face_pt(fwd * 0.088 + UP * 0.025 + side * s_ * 0.035)
    b.add(f'socket{s_}', ellipsoid(tuple(ep - en * 0.002), (0.022, 0.016, 0.018), 10, 8), socket, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
MOUTH, MN = face_pt(fwd * 0.09 - UP * 0.055)
# a FITA EM X na boca (wiki, hospedeira Agatha: "uma fita em formato de X na boca"): duas tiras cruzadas por cima da
# costura. É uma peça (prop) porque CEDE: na Devoradora / com o tempo ela some e a boca enorme aparece (models/props.js)
bands = []
for a in (0.62, -0.62):
    rot = side * math.cos(a) + UP * math.sin(a)
    c = MOUTH + MN * 0.008
    pts = [c + rot * (u * 0.075) + MN * (-0.03 * abs(u) ** 2 + (0.004 if a > 0 else 0)) for u in (-1, -0.5, 0, 0.5, 1)]
    bands.append(rod(pts, [0.0105] * 5, 5))
b.add('prop_mouthTape', merge(*bands), band, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
st = []
for i in range(7):  # os pontos da costura atravessando os lábios
    c = MOUTH + side * ((i - 3) * 0.013) + MN * 0.002
    st.append(rod([c + UP * 0.012, c - UP * 0.012], [0.0025, 0.0025], 4))
b.add('stitches', merge(*st), stitch, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

# a BOCA ENORME (wiki: "a fita cedeu e uma enorme boca com poderosos dentes foi revelada, uma aparência similar a
# Degolificada Devoradora"): o rasgo escuro do rosto até o peito, com DENTES grandes em volta. Escondida (prop) até ceder.
mouth_m = material('boca_degolificada', '#140203', 0.6)
gum = material('gengiva_degolificada', '#5a0c12', 0.4)
tooth = material('dente_degolificada', '#d8cfb4', 0.45)
BM = MOUTH + MN * 0.004 - UP * 0.045  # desce pelo queixo até o peito
b.add('prop_bigMouth', ellipsoid(tuple(BM), (0.058, 0.03, 0.105), 18, 14), mouth_m, region='torso', weight_fn=lambda p: {'hd': 0.6, 'neck': 0.4}, subdiv=0)
gums, teeth = [], []
for i in range(22):
    t = i / 22 * math.tau
    rim = BM + side * math.sin(t) * 0.062 + UP * math.cos(t) * 0.11 + MN * 0.022
    gums.append(ellipsoid(tuple(rim), (0.016, 0.012, 0.016), 6, 5))
    inward = (BM + MN * 0.035 - rim).normalized()
    L = random.uniform(0.028, 0.048)  # "poderosos dentes": grandes e tortos
    teeth.append(cone(tuple(rim), tuple(rim + inward * L + V(random.uniform(-0.006, 0.006), 0, random.uniform(-0.006, 0.006))), 0.0085 + random.random() * 0.004, 6))
b.add('prop_bigMouthGums', merge(*gums), gum, region='torso', weight_fn=lambda p: {'hd': 0.6, 'neck': 0.4}, subdiv=0)
b.add('prop_bigMouthTeeth', merge(*teeth), tooth, region='torso', weight_fn=lambda p: {'hd': 0.6, 'neck': 0.4}, subdiv=0)

# ================================================================ O CABELO
# 1) a COLUNA: mechas do couro cabeludo que caem retas até o chão, na frente e dos lados (o rosto aparece numa fresta)
strands = []
scalp_r = 0.16
col_c = V(HC.x, HC.y - 0.06, 0)  # o centro da coluna lá embaixo
for i in range(260):
    th = random.uniform(0, math.tau)
    ph = random.uniform(0.15, 1.4)
    loc = V(math.cos(th) * math.sin(ph), math.sin(th) * math.sin(ph), math.cos(ph))
    d0 = (UP.to_track_quat('Z', 'Y') @ loc).normalized()
    if d0.y > 0.12:
        continue  # atrás: a calota cobre (com a cabeça caída, tudo cai para a frente e para os lados)
    if d0.y < -0.3 and abs(d0.x) < 0.16:
        continue  # a fresta na frente do rosto (as artes mostram a boca enfaixada entre as mechas)
    root = HC + d0 * scalp_r
    pts = [root, root + d0 * 0.05]
    out = V(d0.x, d0.y, 0)
    out = out.normalized() if out.length > 1e-3 else V(0, -1, 0)
    end_z = random.uniform(0.0, 0.05)
    n_seg = 12
    z0 = pts[-1].z
    for k in range(1, n_seg + 1):
        t = k / n_seg
        z = z0 + (end_z - z0) * t
        spread = 0.05 + 0.1 * t ** 2 + random.uniform(-0.01, 0.01)  # a coluna abre um pouco embaixo
        x = root.x + out.x * spread + n3(V(i, k * 0.3, 0), 1.0) * 0.025 * t
        y = root.y + out.y * spread + n3(V(k * 0.3, i, 0), 1.0) * 0.025 * t
        y = min(y, root.y + 0.03)
        pts.append(V(x, y, z))
    # no chão, a ponta se espalha para fora
    tip = pts[-1]
    fan = V(tip.x - col_c.x, tip.y - col_c.y, 0)
    fan = fan.normalized() if fan.length > 1e-3 else out
    pts.append(tip + fan * random.uniform(0.1, 0.3) + V(0, 0, 0.005))
    r0 = random.uniform(0.008, 0.013)
    strands.append(rod(pts, [r0 * (1 - 0.5 * (j / (len(pts) - 1))) + 0.002 for j in range(len(pts))], 4))

# 2) as MECHAS-TENTÁCULO: grossas, saem da coluna e do chão em curvas e terminam ENROLADAS
for i in range(26):
    a = i / 26 * math.tau + random.uniform(-0.15, 0.15)
    h = random.uniform(0.15, 1.1)  # de que altura da coluna ela sai
    o = V(col_c.x + math.sin(a) * 0.12, col_c.y - math.cos(a) * 0.12, h + 0.05)
    dirv = V(math.sin(a), -math.cos(a), 0)
    reach = random.uniform(0.45, 1.05)
    pts = []
    n = 64
    for k in range(n + 1):
        t = k / n
        if t < 0.7:
            u = t / 0.7
            r = reach * u
            z = h * (1 - u) ** 1.6 + 0.03 + 0.12 * math.sin(u * math.pi) * (h < 0.4)
            wob = math.sin(u * math.pi * 2 + i) * 0.08 * u
            p = o + dirv * r + V(-dirv.y, dirv.x, 0) * wob
            p.z = z
        else:
            # o CACHO da ponta: uma volta e meia que fecha, em pé (no plano da direção dela)
            u = (t - 0.7) / 0.3
            ang = u * math.pi * 2.6
            cr = 0.12 * (1 - 0.65 * u)
            base = o + dirv * reach
            base.z = 0.0
            p = base + dirv * (math.sin(ang) * cr) + V(0, 0, 0.03 + cr - math.cos(ang) * cr)
        pts.append(p)
    rr = random.uniform(0.03, 0.045)
    strands.append(rod(pts, [rr * (1 - 0.8 * (j / n)) + 0.003 for j in range(n + 1)], 5))


def hair_w(p):
    z = p[2]
    if z > Z0 + 1.2:
        t = lim((z - Z0 - 1.2) / 0.25)
        return {'hd': t, 'chest': 1 - t} if t > 0 else {'chest': 1.0}
    if z > Z0 + 0.85:
        u = lim((z - Z0 - 0.85) / 0.35)
        return {'chest': u, 'hips': 1 - u}
    u = lim((z - 0.25) / (Z0 + 0.6))
    return {'hips': u, 'root': 1 - u} if u > 0 else {'root': 1.0}


b.add('hair', merge(*strands), hairm, region='torso', weight_fn=hair_w, subdiv=0)

# os ALUNOS PRESOS no cabelo (cânone da luta final citado pelo dono, 2026-11-06): braços de uniforme escolar saindo da
# coluna de cabelo, moles, e uma cabeça meio engolida embaixo. Peça escondida (prop) até a Devoradora. PROPOSTA: quantos
# e onde (a wiki não descreve a cena).
st_skin = material('pele_aluno', '#a89c8e', 0.85)  # pele sem vida, acinzentada
shirt = material('camisa_aluno', '#d8d4c8', 0.9)
st_hair = material('cabelo_aluno', '#2a1a10', 0.6)
blood = material('sangue_aluno', '#5a0a0e', 0.4)
arms_s, arms_k, hands, heads, caps, bl = [], [], [], [], [], []
for a, h, reach in ((-1.1, 0.95, 0.5), (1.25, 0.78, 0.55), (2.6, 1.05, 0.45), (-2.3, 0.62, 0.5), (0.25, 0.5, 0.42)):
    o = V(col_c.x + math.sin(a) * 0.12, col_c.y - math.cos(a) * 0.12, h + LIFT * 0.4)
    d = V(math.sin(a), -math.cos(a), 0)
    sd = V(-d.y, d.x, 0)
    elbow = o + d * reach * 0.55 + V(0, 0, -0.05)
    wrist = o + d * reach + V(0, 0, -0.2)  # caídos: sem força
    arms_s.append(rod([o - d * 0.05, o + d * 0.12, elbow], [0.04, 0.038, 0.034], 8))  # a manga da camisa do uniforme
    arms_k.append(rod([elbow - d * 0.02, (elbow + wrist) / 2, wrist], [0.027, 0.024, 0.021], 8))
    palm = wrist + V(0, 0, -0.04) + d * 0.01
    hands.append(ellipsoid(tuple(palm), (0.028, 0.02, 0.04), 8, 6))
    for k in range(4):  # os dedos abertos, pendurados
        base = palm + sd * ((k - 1.5) * 0.012) + V(0, 0, -0.03)
        hands.append(rod([base, base + V(0, 0, -0.035) + d * 0.01 + sd * ((k - 1.5) * 0.006), base + V(0, 0, -0.062) + d * 0.022], [0.0075, 0.0065, 0.005], 5))
    bl.append(ellipsoid(tuple(o + d * 0.035), (0.04, 0.04, 0.03), 8, 6))  # o sangue onde o braço some no cabelo
hc_ = V(col_c.x + 0.05, col_c.y - 0.1, 0.3)  # a cabeça de um aluno, meio engolida perto do chão
heads.append(ellipsoid(tuple(hc_), (0.08, 0.075, 0.095), 14, 10))
caps.append(ellipsoid(tuple(hc_ + V(0, 0.015, 0.03)), (0.085, 0.08, 0.08), 12, 9))
for nm, lst, m in (('Sleeves', arms_s, shirt), ('Arms', arms_k, st_skin), ('Hands', hands, st_skin), ('Head', heads, st_skin), ('Hair', caps, st_hair), ('Blood', bl, blood)):
    b.add(f'prop_trapped{nm}', merge(*lst), m, region='torso', weight_fn=hair_w, subdiv=0)
b.add('hairCap', ellipsoid(tuple(HC + UP * 0.025 + V(0, 0.01, 0)), (0.172, 0.172, 0.178), 20, 14), hairm, region='torso', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'degolificada.blend'), check_existing=False)
