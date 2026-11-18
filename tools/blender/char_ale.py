"""
ALÊ — PSIKOLERA (Hexatombe), o teclado da banda (elu) — public/models/ale.glb.
Cânone (wiki "Alê", lore/EQUIPES-HEXATOMBE.md): 25 anos, ~1,75 m; o CABELO LOIRO LONGO com a RAIZ VERMELHO-ALARANJADA;
os olhos azuis; o MACACÃO DE CAMISA DE FORÇA; os PIERCINGS; os PREGOS NA GOLA; o COLAR COM A PEDRA VERMELHA; a
MÁSCARA DE CORPSE PAINT branca e preta (foi Alê quem fez as máscaras da banda).
Aqui: o corpo, o macacão (inteiro, das mangas às pernas), as tiras, a gola com os pregos, o colar, os piercings, o
cabelo e a prop_maskOn (a máscara de corpse paint: só aparece no despertar e no especial da banda). A Lâmina Keytar fica
em código (src/models/weapons.js → laminaKeytar, props.js → addAleProps). Refeito em 2026-11-18 pelas artes oficiais
("Arte Alê com instrumento" de frente e de costas, "Arte Alê sem Máscara"): o tênis estilo all star, as pernas largas até o
tornozelo com o joelho esquerdo rasgado, a argola grande, as tiras com a ponta triangular, a franja e a alça do keytar.
  node tools/blender/build.mjs ale
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, shell_grid, relief, hug
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'ale.glb'
random.seed(25)

b = Builder(width=0.9, bulk=0.86, height=1.0)  # ~1,75 m, esguio
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_ale', '#efd6c6', 0.8)
suit = material('suit_ale', '#d8d0bc', 0.92)  # o macacão de camisa de força (sujeira: textura)
M = {
    'skin': skin,
    'face': material('face_ale', '#ffffff', 0.8),
    'torso': suit,
    'arm': suit,
    'hand': skin,
    'legs': material('legs_ale', '#d8d0bc', 0.92),
    'feet': material('boot_ale', '#16161a', 0.6),  # o tênis preto de lona
}
suit_dk = material('suit_ale_dk', '#aaa088', 0.92)
strap = material('strap_ale', '#bcb294', 0.85)
metal = material('buckle_ale', '#a0a0a6', 0.35, metal=0.9)
nail = material('nail_ale', '#7a7470', 0.45, metal=0.8)  # os pregos: ferro meio enferrujado
cord = material('cord_ale', '#141414', 0.6)
stone = material('stone_ale', '#c8102a', 0.15, emission='#a00010', strength=0.6)  # a pedra vermelha do colar
pierc = material('pierce_ale', '#d0d0d6', 0.25, metal=0.95)
sole = material('sole_ale', '#ecebe6', 0.8)  # a sola e a biqueira brancas
hairm = material('hair_ale', '#e6cf86', 0.65)  # o loiro
rootm = material('hair_ale_root', '#d4541e', 0.7)  # a raiz vermelho-alaranjada
maskw = material('mask_ale', '#f4f2ee', 0.45)
paint = material('paint_ale', '#0c0c0e', 0.6)

PREVIEW = {'face_ale': '#efd6c6'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.154), (0.0, 0.154), (0.18, 0.142), (0.38, 0.186), (0.5, 0.2), (0.6, 0.116), (0.66, 0.064)]
hc = b.body(M, TP, arm_r=(0.058, 0.05, 0.041), leg_r=(0.08, 0.066, 0.054), head_r=(0.126, 0.138, 0.152))


def part(name):
    return next(o for o in b.parts if o.name == name)


TOR = part('torso')
relief(TOR, lambda p: 0.0035 * H * (ridge(p.z / H * 24 + n3(p, 9) * 1.4, 2) - 0.4))
for side in ('L', 'R'):
    relief(part('arm' + side), lambda p: 0.0035 * H * (ridge(p.z / H * 30 + n3(p, 12) * 1.6, 2) - 0.4))
flat = (outward((0, 0)), 0.3)

# ================================================================ as PERNAS LARGAS do macacão até o tornozelo, o JOELHO RASGADO e o TÊNIS
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.06 * H)), l.lerp(k, 0.5), k, k.lerp(f, 0.55), k.lerp(f, 0.86)], [0.082 * H, 0.074 * H, 0.068 * H, 0.068 * H, 0.066 * H], step=0.45)
    P.ell(k.lerp(f, 0.84), (0.07 * H, 0.072 * H, 0.04 * H))  # a barra embolada no tornozelo
    fold = lambda p, c=(l.x, l.y): 0.006 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 5 + p.z / H * 26 + n3(p, 14), 2) - 0.35)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1400), M['legs'], region='leg' + side, subdiv=0)
    for t in (0.35, 0.7):  # as faixas da perna
        c = l.lerp(k, t) if t < 0.5 else k.lerp(f, 0.3)
        r = 0.078 * H if t < 0.5 else 0.072 * H
        b.add(f'legBand{side}{t}', tube([(c.x, c.y, c.z - 0.012 * H, r, r), (c.x, c.y, c.z + 0.012 * H, r, r)], 18), strap, region='leg' + side if t < 0.5 else 'k' + side, subdiv=0)
    # o TÊNIS estilo all star: o cano preto até o tornozelo, a sola branca e a biqueira branca
    B = Sculpt()
    B.chain([k.lerp(f, 0.84), f + Vector((0, 0.008 * H, 0.05 * H))], [0.054 * H, 0.052 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.054 * H, 0.12 * H, 0.042 * H))
    b.add('shoe' + side, B.mesh(res=0.007, smooth=3, target=1000), M['feet'], region='k' + side, subdiv=0)
    b.add('shoeSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.012 * H), (0.112 * H, 0.262 * H, 0.032 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
    b.add('shoeToe' + side, ellipsoid((f.x, f.y - 0.15 * H, f.z + 0.012 * H), (0.046 * H, 0.04 * H, 0.026 * H), 12, 6), sole, region='k' + side, subdiv=0)
    lace = [f + Vector((0, -0.07 * H + 0.02 * H * q, 0.05 * H + 0.012 * H * q)) for q in range(4)]
    b.add('laces' + side, merge(*[box(tuple(v), (0.05 * H, 0.008 * H, 0.006 * H), bevel=0.001) for v in lace]), sole, region='k' + side, subdiv=0)
# o JOELHO RASGADO (a perna esquerda dela, x > 0): a pele aparece no buraco e as pontas do pano caem
kL = sk['kL']
b.add('kneeSkin', ellipsoid(tuple(kL + Vector((0, -0.066 * H, 0.005 * H))), (0.05 * H, 0.022 * H, 0.06 * H), 12, 8), skin, region='kL', subdiv=0)
for i in range(7):
    a = i / 7 * TAU
    p0 = kL + Vector((math.cos(a) * 0.05 * H, -0.074 * H, math.sin(a) * 0.06 * H))
    b.add(f'kneeRag{i}', rod([p0, p0 + Vector((math.cos(a) * 0.012 * H, -0.006 * H, -random.uniform(0.02, 0.05) * H))], [0.012 * H, 0.002 * H], 4), suit_dk, region='kL', subdiv=0)

# ================================================================ o MACACÃO DE CAMISA DE FORÇA: as faixas, a ARGOLA do peito, a faixa do meio
for i, zf in enumerate((0.5, 0.42)):
    ring = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, hz + zf * H + 0.03 * H * math.cos(a)) for a in [j / 40 * TAU for j in range(41)]], 0.007 * H)
    b.add(f'chestBand{i}', rod(ring, 0.018 * H, 6, caps=False, flat=flat), strap, region='chest', subdiv=0)
belt = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, hz + 0.3 * H) for a in [i / 40 * TAU for i in range(41)]], 0.006 * H)
b.add('belt', rod(belt, 0.02 * H, 6, caps=False, flat=flat), strap, region='torso', subdiv=0)
vt = hug(TOR, [(0, -0.3 * H, z) for z in [hz + 0.6 * H - 0.62 * H * i / 12 for i in range(13)]], 0.008 * H)
b.add('vStrap', rod(vt, 0.014 * H, 5, flat=flat), strap, region='chest', subdiv=0)
rc = hug(TOR, [(0, -0.3 * H, hz + 0.3 * H)], 0.02 * H)[0]  # a ARGOLA grande na cintura alta (as artes)
b.add('chestRing', rod([rc + Vector((math.sin(t) * 0.03 * H, -0.004 * H, math.cos(t) * 0.03 * H)) for t in [i / 18 * TAU for i in range(19)]], 0.006 * H, 6, caps=False), metal, region='chest', subdiv=0)
# a ALÇA PRETA do keytar: do ombro esquerdo ao quadril direito (frente e costas)
fr = hug(TOR, [(0.13 * H, -0.3 * H, hz + 0.62 * H), (0.08 * H, -0.3 * H, hz + 0.5 * H), (-0.04 * H, -0.3 * H, hz + 0.3 * H), (-0.16 * H, -0.3 * H, hz + 0.12 * H), (-0.21 * H, -0.08 * H, hz + 0.04 * H)], 0.016 * H)
b.add('keytarStrapF', rod(fr, 0.02 * H, 5, flat=flat), cord, region='chest', subdiv=0)
bs = hug(TOR, [(0.13 * H, 0.3 * H, hz + 0.62 * H), (0.06 * H, 0.3 * H, hz + 0.45 * H), (-0.08 * H, 0.3 * H, hz + 0.24 * H), (-0.19 * H, 0.3 * H, hz + 0.08 * H), (-0.21 * H, -0.02 * H, hz + 0.04 * H)], 0.026 * H)
b.add('keytarStrapB', rod(bs, 0.02 * H, 5, flat=flat), cord, region='chest', subdiv=0)
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh, el, hd = sk['s' + side], sk['e' + side], sk['hand' + side]
    ax = (el - sh).normalized()
    for k_, t in enumerate((0.3, 0.62, 0.9)):  # as faixas enroladas no braço
        c = sh.lerp(el, t)
        r = 0.064 * H
        b.add(f'armStrap{side}{k_}', tube(limb_rings(c - ax * 0.011 * H, c + ax * 0.011 * H, r, r, n=1), 16), strap, region='arm' + side, subdiv=0)
    fa = (hd - el).normalized()
    # a PONTA DA MANGA RASGADA: o pano desfiado em pontas sobre a mão
    for i in range(8):
        a = i / 8 * TAU
        d = Vector((math.cos(a) * s, math.sin(a), 0))
        p0 = el.lerp(hd, 0.86) + d * 0.05 * H
        b.add(f'cuff{side}{i}', rod([p0, p0 + fa * random.uniform(0.03, 0.07) * H], [0.012 * H, 0.002 * H], 4), suit, region='e' + side, subdiv=0)
    # a TIRA COMPRIDA pendurada do antebraço até o joelho, com a PONTA TRIANGULAR de metal
    t0 = el.lerp(hd, 0.7) + Vector((s * 0.05 * H, 0, 0))
    tl = [t0 + Vector((0, 0, -0.07 * H * j)) for j in range(6)]
    b.add(f'armTail{side}', rod(tl, 0.012 * H, 4, flat=((lambda p, o=Vector((s, 0, 0)): o), 0.3)), strap, region='e' + side, subdiv=0)
    b.add(f'armTailTip{side}', cone(tuple(tl[-1] + Vector((0, 0, 0.004 * H))), tuple(tl[-1] + Vector((0, 0, -0.045 * H))), 0.017 * H, 3), metal, region='e' + side, subdiv=0)

# ================================================================ a GOLA COM OS PREGOS
b.add('collar', tube([(0, 0, hz + 0.57 * H, 0.104 * H, 0.092 * H), (0, 0, hz + 0.63 * H, 0.08 * H, 0.076 * H)], 22), suit_dk, region='chest', subdiv=0)
nl = []
for j in range(11):
    a = (j / 11) * TAU
    d = Vector((math.sin(a), -math.cos(a), random.uniform(-0.1, 0.25))).normalized()
    base = Vector((math.sin(a) * 0.088 * H, -math.cos(a) * 0.082 * H, hz + (0.6 + random.uniform(-0.01, 0.015)) * H))
    tip_ = base + d * random.uniform(0.04, 0.055) * H
    nl.append(cone(tuple(base - d * 0.01 * H), tuple(tip_), 0.0045 * H, 5))  # o corpo do prego, fino, para fora
    nl.append(ellipsoid(tuple(base - d * 0.004 * H), (0.009 * H, 0.009 * H, 0.004 * H), 8, 3))  # a cabeça do prego encostada no pano
b.add('collarNails', merge(*nl), nail, region='chest', subdiv=0)

# ================================================================ o COLAR COM A PEDRA VERMELHA
nz = hz + 0.66 * H
loop = [Vector((math.sin(a) * 0.066 * H, -math.cos(a) * 0.062 * H - 0.012 * H * max(0.0, math.cos(a)) * 2.6, nz - 0.07 * H * max(0.0, math.cos(a)) ** 2)) for a in [i / 30 * TAU for i in range(31)]]
b.add('necklace', rod(loop, 0.0035 * H, 4, caps=False), cord, region='chest', subdiv=0)
low = min(loop, key=lambda v: v.z)
b.add('necklaceStone', ellipsoid(tuple(low + Vector((0, -0.012 * H, -0.018 * H))), (0.016 * H, 0.009 * H, 0.022 * H), 10, 6), stone, region='chest', subdiv=0)
b.add('necklaceCap', ellipsoid(tuple(low + Vector((0, -0.01 * H, 0.002 * H))), (0.008 * H, 0.006 * H, 0.006 * H), 8, 4), metal, region='chest', subdiv=0)

# ================================================================ o CABELO LOIRO LONGO, com a RAIZ VERMELHO-ALARANJADA
HC = Vector((hc.x, hc.y, hc.z))
V = lambda x, y, z: HC + Vector((x * H, y * H, z * H))


def hair_weights(p):
    t = smoothstep(sk['hd'].z + 0.02 * H, sk['neck'].z - 0.04 * H, p.z)
    return {'hd': 1 - t, 'chest': t}


def wave(pts, amp, ph):
    return [p + Vector((math.sin(i * 1.3 + ph) * amp * H, 0, 0)) if i > 1 else p for i, p in enumerate(pts)]


# a RAIZ vermelho-alaranjada: só o alto do cabelo, rente às mechas loiras (sem degrau), com os fios descendo da risca
# do meio para os lados; as mechas loiras nascem por baixo dela
Rt = Sculpt()
Rt.ell(V(0, 0.012, 0.04), (0.156 * H, 0.166 * H, 0.158 * H))
Rt.ell(V(0, -0.125, -0.07), (0.104 * H, 0.1 * H, 0.15 * H), neg=True)


def crown_only(m, zcut):
    """Fica só o alto da calota (as faces acima de zcut): a raiz é uma camada fina sobre o loiro, sem degrau."""
    vs, fs, uv = m
    keep = [f for f in fs if sum(vs[k][2] for k in f) / len(f) > zcut]
    used = sorted({k for f in keep for k in f})
    idx = {k: n for n, k in enumerate(used)}
    return [vs[k] for k in used], [tuple(idx[k] for k in f) for f in keep], None


def root_strands(p):
    q = p - HC
    part_ = -0.003 * H * math.exp(-(q.x / (0.012 * H)) ** 2) if q.z > 0.1 * H and q.y > -0.12 * H else 0.0  # a risca do meio
    return 0.0025 * H * (ridge(q.y / H * 120 + n3(p, 20) * 1.2, 2) - 0.4) + part_  # os fios descem da risca para os lados


b.add('hairRoot', crown_only(Rt.mesh(res=0.005, smooth=3, disp=root_strands, target=2600), HC.z + 0.105 * H), rootm, region='head', weight_fn=hair_weights, subdiv=0)
# o COMPRIMENTO loiro: as mechas saem um pouco abaixo do alto (a raiz fica à mostra em cima) e descem até o meio das costas
Hr = Sculpt()
Hr.ell(V(0, 0.012, 0.04), (0.148 * H, 0.158 * H, 0.15 * H))  # a calota loira inteira por baixo (sem buraco no alto)
Hr.ell(V(0, 0.05, -0.02), (0.14 * H, 0.13 * H, 0.13 * H))  # a nuca coberta
for s in (1, -1):  # as cortinas da frente, repartidas no meio, até o peito
    for i in range(4):
        u = i / 3
        pts = [V(s * (0.09 + 0.05 * u), -0.06 + 0.06 * u, 0.08), V(s * (0.14 + 0.012 * u), -0.07 + 0.07 * u, 0.0),
               V(s * (0.152 + 0.012 * u), -0.06 + 0.07 * u, -0.13), V(s * (0.16 + 0.01 * u), -0.08 + 0.06 * u, -0.26),
               V(s * (0.165 + 0.012 * u), -0.1 + 0.05 * u, -0.38), V(s * (0.16 + 0.014 * u), -0.11 + 0.04 * u, -0.46 - random.random() * 0.04)]
        Hr.chain(wave(pts, 0.01, i + s), [k * H for k in (0.026, 0.034, 0.034, 0.032, 0.026, 0.008)], step=0.35)
for s in (1, -1):  # os lados atrás das orelhas
    for i in range(4):
        y = 0.02 + i * 0.035
        pts = [V(s * 0.13, y, 0.06), V(s * 0.154, y + 0.01, -0.06), V(s * 0.166, y + 0.04, -0.2), V(s * 0.17, 0.12 + i * 0.01, -0.34), V(s * 0.16, 0.16, -0.5 - random.random() * 0.05)]
        Hr.chain(wave(pts, 0.012, i * 2 + s), [k * H for k in (0.028, 0.032, 0.03, 0.026, 0.008)], step=0.35)
for i in range(11):  # atrás, até o meio das costas
    u = (i - 5) / 5
    x = u * 0.14
    end = -0.56 - (1 - abs(u)) * 0.06 - random.random() * 0.05
    pts = [V(x * 0.8, 0.12, 0.07), V(x, 0.158, -0.04), V(x * 1.05, 0.17, -0.18), V(x * 1.1, 0.19, -0.32), V(x * 1.08, 0.205, -0.45), V(x * 1.04, 0.21, end)]
    Hr.chain(wave(pts, 0.014, i), [k * H for k in (0.03, 0.034, 0.034, 0.03, 0.024, 0.008)], step=0.35)
for i in range(11):  # a FRANJA reta até a sobrancelha (a raiz vermelha só aparece no alto)
    x = -0.1 + 0.2 * i / 10
    top = V(x * 0.7, -0.09, 0.13)
    Hr.chain([top, V(x * 0.9, -0.142, 0.09), V(x, -0.155, 0.035 - random.random() * 0.012)], [0.017 * H, 0.014 * H, 0.004 * H], step=0.35)
Hr.ell(V(0, -0.125, -0.085), (0.104 * H, 0.1 * H, 0.13 * H), neg=True)  # o rosto livre


def strands(p):
    a = math.atan2(p.x - HC.x, p.y - HC.y)
    return 0.003 * H * (ridge(a * 26 + n3(p, 18) * 1.6, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.007, smooth=3, disp=strands, target=4200), hairm, region='head', weight_fn=hair_weights, subdiv=0)

# ================================================================ os PIERCINGS (cânone): o BRIDGE no nariz e TRÊS na orelha
fz = hc.z
pc = []
for s_ in (1, -1):
    pc.append(ellipsoid(tuple(V(s_ * 0.018, -0.15, 0.012)), (0.0035 * H, 0.0035 * H, 0.0035 * H), 6, 4))
pc.append(rod([V(-0.018, -0.152, 0.012), V(0.018, -0.152, 0.012)], 0.0016 * H, 4))
for k_ in range(3):
    c = V(0.13, 0.0, -0.035 - 0.016 * k_)
    pc.append(rod([c + Vector((0, math.cos(t) * 0.007 * H, math.sin(t) * 0.007 * H)) for t in [j / 10 * TAU for j in range(11)]], 0.002 * H, 4, caps=False))
b.add('piercings', merge(*pc), pierc, region='head', subdiv=0)

# ================================================================ prop_maskOn: a MÁSCARA DE CORPSE PAINT (branca, olhos e boca em preto)
MROWS = [(0.1, 0.1, 0.13, 1.1), (0.05, 0.122, 0.15, 1.25), (0.0, 0.13, 0.158, 1.3), (-0.05, 0.126, 0.158, 1.3), (-0.1, 0.11, 0.15, 1.2), (-0.15, 0.078, 0.13, 1.0)]
rows = [[Vector((math.sin(a_) * rx * H, hc.y - math.cos(a_) * ry * H, fz + dz * H)) for a_ in [-am + 2 * am * i / 18 for i in range(19)]] for dz, rx, ry, am in MROWS]
b.add('prop_maskOnShell', shell_grid(rows, 0.006), maskw, region='head', subdiv=1)
SURF = lambda x, z, off: Vector((x * H, hc.y - math.sqrt(max(0.0, 1 - (x / 0.13) ** 2)) * 0.158 * H - off * H, fz + z * H))
pt = []
for s in (1, -1):
    ex = s * 0.046
    # a mancha preta em volta do olho, puxada em ponta para cima e para baixo (o corpse paint clássico)
    for k_ in range(9):
        t = (k_ - 4) / 4
        pts = [SURF(ex + t * 0.02, 0.05 - abs(t) * 0.02, 0.006), SURF(ex + t * 0.024, 0.005, 0.007), SURF(ex + t * 0.018, -0.04 + abs(t) * 0.015, 0.006)]
        pt.append(rod(pts, [0.006 * H, 0.012 * H, 0.005 * H], 5))
    pt.append(rod([SURF(ex + s * 0.012, 0.05, 0.006), SURF(ex + s * 0.03, 0.095, 0.004)], [0.007 * H, 0.002 * H], 4))  # a ponta da sobrancelha
# o nariz preto e a boca costurada: os traços verticais sobre os lábios
pt.append(ellipsoid(tuple(SURF(0.0, -0.035, 0.012)), (0.012 * H, 0.008 * H, 0.008 * H), 8, 4))
for i in range(7):
    x = -0.03 + 0.06 * i / 6
    pt.append(rod([SURF(x, -0.07, 0.006), SURF(x * 1.1, -0.115 - 0.01 * (1 - abs(x) / 0.03), 0.005)], [0.004 * H, 0.002 * H], 4))
pt.append(rod([SURF(x, -0.092, 0.006) for x in [-0.034 + 0.068 * i / 8 for i in range(9)]], 0.003 * H, 4))
b.add('prop_maskOnPaint', merge(*pt), paint, region='head', subdiv=0)
b.group('prop_maskOn', 'prop_maskOn')

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'ale.blend'), check_existing=False)
