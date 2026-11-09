"""
TRISTAN MONTEIRO (Desconjuração) — public/models/tristan.glb. Feito com a técnica atual (sculpt_lib: roupa a partir do
corpo, metaballs, relevo, peças coladas na superfície por raio) a partir da ARTE OFICIAL "Miniatura Tristan em
Desconjuração", da "Arte promocional de Tristan em Desconjuração" e do texto da wiki ("Tristan Monteiro", Aparência):
  ALTO e FORTE (29 anos, ex-militar); cabelo CASTANHO na altura do PESCOÇO, repartido no meio, as mechas da frente caindo
  dos lados da testa; BARBA RALA; pele clara com QUEIMADURAS nos braços e no peito (texturas arms_tristan e
  skin_torso_tristan; o rosto em face_tristan);
  REGATA AZUL LISA com decote em V (wiki: "regata azul com decote em V"; nas artes, um azul acinzentado escuro);
  CALÇA JEANS MARROM; TÊNIS simples BEGE;
  a JAQUETA DE VERÍSSIMO (wiki "Itens Amaldiçoados": "jaqueta de estilo aviador feita de couro marrom com a gola forrada
  de pele branca"; a mesma da miniatura do Veríssimo jovem em Sinais do Outro Lado): o Tristan anda com ela APOIADA NOS
  OMBROS, sem vestir as mangas — a capa curta nos ombros com a gola e as lapelas de lã, as frentes penduradas na frente
  dos ombros e as costas caindo atrás dos braços até o quadril (os braços saem livres por baixo).
A Glock com silenciador e lanterna, o coquetel molotov e o lança-chamas (os tanques nas costas) ficam em código
(src/models/props.js → addTristanProps).
  node tools/blender/build.mjs tristan   → public/models/tristan.glb (+ tools/blender/fonte/tristan.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, shell_grid, relief, clothe, ring_pts
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'tristan.glb'
random.seed(1991)  # o ano em que ele nasceu

b = Builder(width=1.05, bulk=1.1, height=1.05)  # alto e forte (~1,87 m)
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_tristan', '#e2b49c', 0.8)
M = {
    'skin': skin,
    'face': material('face_tristan', '#ffffff', 0.8),  # olhos escuros, barba rala, uma queimadura no pescoço (textura)
    'torso': material('skin_torso_tristan', '#ffffff', 0.8),  # as queimaduras do peito (aparecem no V e nos ombros)
    'arm': material('arms_tristan', '#ffffff', 0.8),  # as queimaduras dos braços (textura)
    'hand': skin,
    'legs': material('pants_tristan', '#4e3a2c', 0.9),  # jeans marrom
    'feet': skin,
}
tank = material('tank_tristan', '#3e4c5e', 0.85)  # a regata azul lisa
leather = material('jacket_verissimo', '#6e4630', 0.6)  # o couro marrom da jaqueta de aviador
leather_dk = material('jacket_verissimo_dk', '#4e3022', 0.65)
fleece = material('fleece_verissimo', '#e6dccb', 0.95)  # a gola forrada de pele branca
shoe = material('shoe_tristan', '#c8ae88', 0.75)  # tênis simples bege
sole = material('sole_tristan', '#ece6da', 0.8)
lace = material('lace_tristan', '#e8e0d0', 0.8)
hairm = material('hair_tristan', '#4a3324', 0.65)
beardm = material('beard_tristan', '#4a3426', 0.85)

PREVIEW = {'face_tristan': '#e2b49c', 'skin_torso_tristan': '#e2b49c', 'arms_tristan': '#e2b49c'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.03, 0.17), (0.0, 0.174), (0.16, 0.168), (0.32, 0.2), (0.45, 0.226), (0.55, 0.226), (0.61, 0.14), (0.66, 0.08)]
hc = b.body(M, TP, arm_r=(0.076, 0.062, 0.05), leg_r=(0.094, 0.074, 0.055), head_r=(0.136, 0.148, 0.16), neck_r=0.08, feet='bare')


def part(name):
    return next(o for o in b.parts if o.name == name)


def lim(x):
    return max(0.0, min(1.0, x))


def W(reg):
    return lambda p: auto_weights(sk, p, reg)


HEAD = lambda p: {'hd': 1.0}
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


# ================================================================ os MÚSCULOS de ex-militar (relevo na malha: as queimaduras continuam)
def chest_relief(p):
    x, y, z = p.x, p.y, p.z - hz
    ax = abs(x)
    d = 0.0
    if y < -0.02:
        d += 0.014 * H * math.exp(-((ax - 0.085 * H) / (0.07 * H)) ** 2) * math.exp(-((z - 0.47 * H) / (0.055 * H)) ** 2)  # peitorais
        d -= 0.005 * H * math.exp(-((z - 0.41 * H) / (0.014 * H)) ** 2) * (ax < 0.15 * H)
        if 0.12 * H < z < 0.38 * H and ax < 0.08 * H:
            d += 0.004 * H - 0.004 * H * math.exp(-(x / (0.01 * H)) ** 2)
    else:
        d += 0.009 * H * math.exp(-((ax - 0.12 * H) / (0.06 * H)) ** 2) * math.exp(-((z - 0.4 * H) / (0.12 * H)) ** 2)
    if z > 0.53 * H:  # o trapézio
        d += 0.01 * H * math.exp(-((ax - 0.12 * H) / (0.05 * H)) ** 2) * min(1.0, (z - 0.53 * H) / (0.06 * H))
    return d


relief(part('torso'), chest_relief)


def arm_relief(side):
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]

    def f(p):
        if p.z > s_.z + 0.05 * H:
            return 0.0
        if p.z >= e.z:
            t = (s_.z + 0.05 * H - p.z) / (s_.z + 0.05 * H - e.z)
            front = lim((s_.y - p.y) / (0.05 * H))
            back = lim((p.y - s_.y) / (0.05 * H))
            return (0.024 * H * math.exp(-((t - 0.12) / 0.15) ** 2)
                    + 0.018 * H * math.sin(min(1, t) * math.pi) * front ** 0.7
                    + 0.014 * H * math.sin(min(1, t) * math.pi) * back ** 0.7)
        t = (e.z - p.z) / (e.z - h.z)
        return 0.014 * H * math.exp(-((t - 0.25) / 0.22) ** 2) - 0.006 * H * lim((t - 0.7) / 0.3)
    return f


for side in ('L', 'R'):
    relief(part('arm' + side), arm_relief(side))


# ================================================================ a REGATA AZUL LISA com decote em V (a malha do tronco, inflada e cortada)
def tank_keep(p):
    z = (p.z - hz) / H
    ax = abs(p.x) / H
    front = p.y < 0
    if z < 0.035 or z > 0.66:
        return False  # a barra fica no quadril, por cima do cós da calça
    if z > 0.45 and ax > 0.16:
        return False  # as cavas
    if front and z > 0.41 and ax < (z - 0.41) * 0.45:
        return False  # o DECOTE EM V fundo (o peito queimado aparece)
    if not front and z > 0.58 and ax < 0.06 + (z - 0.58) * 0.6:
        return False  # o decote das costas
    if z > 0.6 and ax < 0.085:
        return False
    return True


tk = b.add('tank', clothe(part('torso'), tank_keep, 0.008 * H, cuts=5), tank, region='body', weight_fn=W('torso'), subdiv=0)
# tecido liso: só as dobras moles de malha folgada na barriga e embaixo do peito
relief(tk, lambda p: 0.0022 * H * (ridge(p.z / H * 22 + math.atan2(p.x, -p.y) * 1.6 + n3(p, 9) * 1.4, 2) - 0.45) * (p.z < hz + 0.4 * H))

# ================================================================ CALÇA JEANS MARROM e TÊNIS BEGE
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k + Vector((0, -0.003 * H, 0)), k.lerp(f, 0.6), f + Vector((0, 0, 0.085 * H))],
            [0.1 * H, 0.084 * H, 0.07 * H, 0.064 * H, 0.062 * H], step=0.45)
    c2 = (l.x, l.y)
    fold = lambda p, c=c2, kz=k.z: 0.003 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 4 + p.z / H * 28 + n3(p, 16), 2) - 0.35) * (1.6 if abs(p.z - kz) < 0.06 * H else 1)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
    S = Sculpt()
    S.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.056 * H, 0.122 * H, 0.04 * H))
    S.ell(f + Vector((0, -0.13 * H, 0.022 * H)), (0.05 * H, 0.052 * H, 0.03 * H))
    S.ell(f + Vector((0, 0.03 * H, 0.04 * H)), (0.052 * H, 0.05 * H, 0.05 * H))
    b.add('shoe' + side, S.mesh(res=0.007, smooth=3, disp=lambda p: 0.001 * H * n3(p, 12), target=900), shoe, region='k' + side, subdiv=0)
    b.add('sole' + side, sole_part((f.x, f.y - 0.047 * H, f.z - 0.012 * H), (0.108 * H, 0.262 * H, 0.026 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
    for i in range(3):  # os cadarços no peito do pé
        y = f.y - 0.06 * H - i * 0.022 * H
        z = f.z + 0.062 * H - i * 0.008 * H
        b.add(f'lace{side}{i}', rod([(f.x - 0.022 * H, y, z), (f.x + 0.022 * H, y - 0.006 * H, z)], 0.003 * H, 4), lace, region='k' + side, subdiv=0)
Hp = Sculpt()
Hp.ell(Vector((0, 0.0, hz + 0.01 * H)), (0.19 * H, 0.132 * H, 0.1 * H))  # sobe até o cós (embaixo da barra da regata); mais largo que o tronco
Hp.ell(Vector((0, 0.012 * H, hz - 0.05 * H)), (0.17 * H, 0.118 * H, 0.08 * H))
Hp.ell(Vector((0, 0.008 * H, hz - 0.11 * H)), (0.11 * H, 0.1 * H, 0.06 * H))  # o gancho da calça (o fundo do tronco não aparece entre as pernas)
b.add('pantsHip', Hp.mesh(res=0.011, smooth=3, disp=lambda p: 0.0015 * H * n3(p, 14), target=800), M['legs'], region='body',
      weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)

# ================================================================ a JAQUETA DE VERÍSSIMO apoiada nos ombros (couro marrom, gola de lã)
sL = sk['sL']
SX = abs(sL.x)
sz = sL.z
JA = 0.62  # meia-abertura da frente (rad): as bordas caem na frente do peito, a regata aparece no meio
JB = 2.2   # a parte de trás começa atrás dos braços (medido no MCP: o braço vai até y = +0,065H; aqui a borda fica em +0,13H)
NJ = 40
# Medido no Blender (MCP): o braço vai até SX + 0,109H e o alto do ombro fica em sz + 0,06H. A jaqueta fica APOIADA:
# (1) a capa curta por cima dos ombros, (2) as costas caindo ATRÁS dos braços até o quadril, (3) as duas frentes curtas
# penduradas na frente dos ombros — os braços saem livres por baixo (como na miniatura; nos golpes nada atravessa)
YOKE = [  # (z, meia-largura, meia-profundidade)
    (sz + 0.09 * H, 0.1 * H, 0.098 * H),       # em volta do pescoço (a gola por cima)
    (sz + 0.078 * H, SX * 0.7, 0.15 * H),      # o trapézio
    (sz + 0.07 * H, SX + 0.04 * H, 0.19 * H),  # por cima do alto do ombro
    (sz + 0.045 * H, SX + 0.09 * H, 0.205 * H),  # a queda inclinada (sem "prateleira")
    (sz + 0.0 * H, SX + 0.12 * H, 0.215 * H),  # a curva do deltoide
]
yk = b.add('jacketYoke', shell_grid([ring_pts(z, rx, ry, JA, TAU - JA, NJ) for z, rx, ry in YOKE], 0.008), leather, region='torso', subdiv=1)
BACK = [  # as costas: do ombro até a barra no quadril, atrás dos braços
    (sz + 0.06 * H, SX + 0.0 * H, 0.2 * H),      # sai de baixo da capa dos ombros, seguindo a queda
    (sz + 0.0 * H, SX + 0.1 * H, 0.214 * H),
    (sz - 0.1 * H, SX + 0.1 * H, 0.222 * H),
    (sz - 0.26 * H, SX + 0.085 * H, 0.222 * H),
    (hz + 0.12 * H, SX + 0.07 * H, 0.218 * H),
    (hz + 0.03 * H, SX + 0.075 * H, 0.222 * H),  # a barra (estilo aviador), mais junta
]
bk = b.add('jacketBack', shell_grid([ring_pts(z, rx, ry, JB, TAU - JB, NJ) for z, rx, ry in BACK], 0.008), leather, region='torso', subdiv=1)
relief(bk, lambda p: 0.007 * H * (ridge(math.atan2(p.x, -p.y) * 6 + n3(p, 7) * 1.4, 2) - 0.4) * lim((sz - 0.04 * H - p.z) / (0.12 * H)))  # o couro caindo em dobras
hem = [Vector((math.sin(a) * BACK[-1][1], -math.cos(a) * BACK[-1][2], BACK[-1][0] + 0.012 * H)) for a in [JB + (TAU - 2 * JB) * i / NJ for i in range(NJ + 1)]]
b.add('jacketHem', rod(hem, 0.016 * H, 6, caps=True, flat=(outward((0, 0)), 0.35)), leather_dk, region='torso', subdiv=0)
# as FRENTES: duas abas penduradas na frente de cada ombro, até o meio do peito (cobrem o alto do braço por fora)
FR = [(sz + 0.02 * H, SX + 0.105 * H, 0.212 * H), (sz - 0.06 * H, SX + 0.1 * H, 0.21 * H), (sz - 0.17 * H, SX + 0.09 * H, 0.2 * H), (sz - 0.26 * H, SX + 0.08 * H, 0.19 * H)]
for s in (1, -1):
    a0, a1 = (JA, 1.12) if s > 0 else (TAU - 1.12, TAU - JA)
    fr = b.add(f'jacketFront{s}', shell_grid([ring_pts(z, rx, ry, a0, a1, 10) for z, rx, ry in FR], 0.008), leather, region='torso', subdiv=1)
    relief(fr, lambda p: 0.004 * H * (ridge(p.x / H * 30 + n3(p, 8), 2) - 0.4))
    # a LAPELA de lã descendo pela borda da frente (a pele dobrada por fora) e o vivo escuro na barra da aba
    ed = [Vector((s * math.sin(JA) * rx, -math.cos(JA) * ry, z)) for z, rx, ry in [YOKE[0]] + FR]
    ed[0] = ed[0] + Vector((0, -0.01 * H, 0))
    b.add(f'lapel{s}', rod(ed, [0.03 * H, 0.036 * H, 0.032 * H, 0.022 * H, 0.012 * H], 6, flat=(outward((0, 0)), 0.35)), fleece, region='torso', subdiv=0)
    z, rx, ry = FR[-1]
    b.add(f'frontHem{s}', rod([Vector((math.sin(a) * rx, -math.cos(a) * ry, z + 0.008 * H)) for a in [a0 + (a1 - a0) * k / 8 for k in range(9)]], 0.012 * H, 5, flat=(outward((0, 0)), 0.35)), leather_dk, region='torso', subdiv=0)
# a GOLA forrada de pele branca, larga, deitada em volta do pescoço e dos ombros
gola = []
for i in range(NJ + 1):
    a = 0.75 + (TAU - 1.5) * i / NJ
    gola.append(Vector((math.sin(a) * 0.125 * H, -math.cos(a) * 0.12 * H, sz + 0.092 * H)))
b.add('collarFleece', rod(gola, 0.034 * H, 8, caps=True, flat=(lambda p: Vector((p.x, p.y, 0.6 * H)), 0.45)), fleece, region='torso', subdiv=0)
# (as mangas vazias ficam atrás das costas da jaqueta: não aparecem nas artes e viravam "palitos" ao lado dos braços)

# ================================================================ CABELO CASTANHO na altura do pescoço, REPARTIDO NO MEIO
HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    """a = ângulo a partir da frente (+ = lado esquerdo dele, +x), el = elevação a partir do equador"""
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


D = Sculpt()
for i in range(28):  # a calota colada na cabeça
    for j in range(6):
        a = (i / 28 - 0.5) * TAU
        el = 0.25 + 0.6 * j / 5
        if math.cos(a) > 0.5 and el < 0.78:
            continue  # testa e rosto
        q = on_head(a, el, (0.03 if abs(math.sin(a)) > 0.8 and el < 0.5 else 0.01) * H)  # cobre as orelhas
        if q:
            D.ell(q, (0.03 * H, 0.03 * H, 0.027 * H))
# o ALTO DA CABEÇA cheio (antes ficava ralo: a calota parava em el 0,85 e o meio só tinha as mechas da risca) — fileiras
# até o cocuruto, deixando só a RISCA do meio (|x| pequeno na frente) mais rasa
for i in range(24):
    for el in (0.95, 1.1, 1.25, 1.4):
        a = (i / 24 - 0.5) * TAU
        if math.cos(a) > 0.2 and el < 1.05:
            continue  # a testa fica livre
        risca = abs(math.sin(a)) < 0.12 and math.cos(a) > 0
        q = on_head(a, el, (0.006 if risca else 0.016) * H)
        if q:
            D.ell(q, (0.032 * H, 0.032 * H, 0.026 * H))
top = on_head(0.0, 1.55, 0.014 * H)
if top:
    D.ell(top, (0.05 * H, 0.06 * H, 0.03 * H))
# as mechas do alto saindo da RISCA DO MEIO e caindo para os lados, e as da frente emoldurando o rosto
for s in (1, -1):
    for i in range(7):
        a0 = s * (0.06 + i * 0.07)
        p0 = on_head(a0 * 0.6, 1.25, 0.02 * H)
        p1 = on_head(a0 + s * 0.35, 0.95, 0.026 * H)
        p2 = on_head(a0 + s * 0.75, 0.55, 0.03 * H)
        pts = [q for q in (p0, p1, p2) if q]
        if len(pts) > 2:
            D.chain(pts, [0.018 * H, 0.022 * H, 0.02 * H], step=0.5)
    # a mecha da frente que cai do lado da testa até a maçã do rosto
    p0 = on_head(s * 0.28, 0.98, 0.024 * H)
    p1 = on_head(s * 0.6, 0.5, 0.028 * H)
    if p0 and p1:
        D.chain([p0, p1, p1 + Vector((s * 0.012 * H, -0.006 * H, -0.08 * H)), p1 + Vector((s * 0.018 * H, 0.0, -0.13 * H))],
                [0.02 * H, 0.022 * H, 0.016 * H, 0.004 * H], step=0.5)
# o resto SOLTO dos lados e da nuca, até a metade do pescoço
rnd = random.Random(29)
for i in range(18):
    a = math.copysign(min(math.pi, 1.0 + abs((i / 17 - 0.5) * 2) * 2.2), (i / 17 - 0.5) or 1)
    p0 = on_head(a, 0.4, 0.016 * H)
    if not p0:
        continue
    d = Vector((math.sin(a), -math.cos(a), 0)).normalized()
    ln = rnd.uniform(0.15, 0.19) * H
    pts = [p0 + Vector((0, 0, 0.03 * H)), p0, p0 + d * 0.02 * H + Vector((0, 0.004 * H, -ln * 0.5)), p0 + d * 0.03 * H + Vector((0, 0.008 * H, -ln * 0.85)), p0 + d * 0.034 * H + Vector((0, 0.01 * H, -ln))]
    D.chain(pts, [0.024 * H, 0.026 * H, 0.022 * H, 0.014 * H, 0.004 * H], step=0.5)
hd_ = lambda p: 0.002 * H * (ridge(p.x / H * 100 + p.z / H * 30 + n3(p, 30), 2) - 0.4)
b.add('hair', D.mesh(res=0.0045, smooth=2, disp=hd_, target=5200), hairm, region='body', weight_fn=HEAD, subdiv=0)

# ================================================================ BARBA RALA (curta, rente: queixo, maxilar e o bigode fino)
B = Sculpt()
for i in range(19):
    a = (i / 18 - 0.5) * 2.6
    for el in (-0.38, -0.5, -0.62, -0.74):
        if abs(a) < 0.32 and el > -0.55:
            continue  # a boca
        if abs(a) < 0.8 and el > -0.45:
            continue  # as bochechas acima da boca ficam livres
        q = on_head(a, el, -0.005 * H)
        if q:
            B.ell(q, (0.012 * H, 0.012 * H, 0.011 * H))  # rente: a barba RALA (o resto é a sombra na textura)
for s in (1, -1):  # as costeletas
    q = on_head(s * 1.18, -0.05, -0.001 * H)
    if q:
        B.ell(q, (0.014 * H, 0.014 * H, 0.022 * H))
for s in (1, -1):  # o bigode fino
    pts = [on_head(s * a, el, 0.002 * H) for a, el in ((0.03, -0.37), (0.16, -0.39), (0.27, -0.46))]
    pts = [q for q in pts if q]
    if len(pts) > 1:
        B.chain(pts, [0.008 * H, 0.009 * H, 0.006 * H][:len(pts)], step=0.45)
b.add('beard', B.mesh(res=0.0035, smooth=2, disp=lambda p: 0.0012 * H * (ridge(p.x / H * 160 + p.z / H * 50, 2) - 0.4), target=2200), beardm, region='body', weight_fn=HEAD, subdiv=0)
br = []
for s in (1, -1):  # as sobrancelhas grossas e escuras
    pts = [(s * 0.022 * H, hc.y - 0.15 * H, hc.z + 0.036 * H), (s * 0.05 * H, hc.y - 0.147 * H, hc.z + 0.043 * H), (s * 0.076 * H, hc.y - 0.137 * H, hc.z + 0.035 * H)]
    br.append(rod(pts, 0.0065 * H, 5, flat=(lambda q: q - hc, 0.5)))
b.add('brows', merge(*br), hairm, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'tristan.blend'), check_existing=False)
