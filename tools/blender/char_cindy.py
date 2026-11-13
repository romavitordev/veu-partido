"""
CINDY LOPES — PSIKOLERA (Hexatombe), líder e baixista da banda — public/models/cindy.glb.
Referências (remodel de 2026-11-14, pedido do dono: "analise varias imagens da cindy"): wiki "Cindy Lopes" — "Arte
Cindy com Baixo" (frente e costas), "Arte Cindy sem Máscara" (frente e costas), a arte conceitual, o pôster
"PSIKOLERA - Cindy" e a "Arte Fuzil de Cindy"; fanarts do Pinterest só para confirmar as cores (a mecha vermelha):
  - BAIXINHA e delicada; o cabelo CURTO, FOFO e DESGRENHADO, loiro-acinzentado, com a franja até a sobrancelha e a
    parte de baixo VERMELHA nas laterais (perto das orelhas); os olhos azuis com a maquiagem escorrendo (face_cindy);
  - a CAMISA DE FORÇA creme: a gola alta, o ARNÊS EM X cruzando o peito com a ARGOLA no alto e a faixa vertical no
    meio, as TRÊS CINTAS LARGAS embaixo do peito (com as abas), três faixas em cada braço com as ABAS PARA FORA e as
    MANGAS LONGAS RASGADAS dos dois lados, caindo do pulso; as tiras penduradas com as PONTAS TRIANGULARES de metal;
  - as CORRENTES em V da cintura até a ARGOLA da frente (e em U nas costas); a calça BUFANTE até abaixo do joelho; os
    COTURNOS PLATAFORMA pretos até o joelho, com as FIVELAS LARGAS, os CRAVOS na sola e as correntes no tornozelo;
  - a GARGANTILHA DE ESPINHOS; a ALÇA PRETA do baixo cruzando o peito e as costas; os anéis pretos;
  - prop_maskOn: a MÁSCARA BRANCA de porcelana com os OLHOS VERMELHOS e as LÁGRIMAS VERMELHAS escorrendo até o queixo —
    aparece na habilidade Máscara PSIKOLERA e fica no despertar. O Fuzil Baixo fica em código
    (src/models/weapons.js → fuzilBaixo, props.js → addCindyProps).
TÉCNICA (a do Eloy): corpo pelo Builder; a camisa de força é o próprio corpo com relevo; faixas por rod grudadas com hug().
  node tools/blender/build.mjs cindy   → public/models/cindy.glb (+ tools/blender/fonte/cindy.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, shell_grid, relief, hug, chain_mesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'cindy.glb'
random.seed(41)

b = Builder(width=0.86, bulk=0.84, height=0.88)  # baixinha (~1,58 m) e delicada
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_cindy', '#f0d2be', 0.8)
suit = material('suit_cindy', '#d4cab0', 0.92)  # a camisa de força creme (as artes da wiki)
M = {
    'skin': skin,
    'face': material('face_cindy', '#ffffff', 0.8),
    'torso': suit,
    'arm': suit,  # as mangas inteiras da camisa de força
    'hand': skin,
    'legs': suit,
    'feet': material('boot_cindy', '#2c2c32', 0.45),
}
suit_dk = material('suit_cindy_dk', '#a89c80', 0.92)
strap = material('strap_cindy', '#c4b896', 0.85)  # as faixas um tom abaixo do tecido
metal = material('buckle_cindy', '#a0a0a6', 0.35, metal=0.9)
chainm = material('chain_cindy', '#8a8a90', 0.35, metal=0.9)
sole = material('sole_cindy', '#0c0c0e', 0.8)
hairm = material('hair_cindy', '#c9a467', 0.7)  # o loiro-acinzentado
redh = material('hair_cindy_red', '#a01c28', 0.7)  # a parte de baixo vermelha, nas laterais
maskw = material('mask_cindy', '#f6f4f0', 0.4)
liner = material('liner_cindy', '#2a0a0e', 0.5)
blood = material('tri_cindy', '#c0141e', 0.45)
eyew = material('eyes_cindy', '#ff3a3a', 0.4, emission='#ff2020', strength=1.2)
ringm = material('rings_cindy', '#121214', 0.3, metal=0.6)
bandm = material('bassstrap_cindy', '#141416', 0.6)

PREVIEW = {'face_cindy': '#f0d2be'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.15), (0.0, 0.15), (0.18, 0.13), (0.38, 0.17), (0.5, 0.18), (0.6, 0.11), (0.66, 0.064)]
hc = b.body(M, TP, arm_r=(0.052, 0.044, 0.037), leg_r=(0.074, 0.06, 0.05), head_r=(0.134, 0.146, 0.158))


def part(name):
    return next(o for o in b.parts if o.name == name)


TOR = part('torso')
relief(TOR, lambda p: 0.0035 * H * (ridge(p.z / H * 24 + n3(p, 9) * 1.4, 2) - 0.4))
flat = (outward((0, 0)), 0.3)


def tip(name, at, down=0.045, region='hips'):
    """a PONTA TRIANGULAR de metal no fim de uma tira (chata, apontando para baixo)"""
    b.add(name, cone(at + Vector((0, 0, 0.004 * H)), at + Vector((0, 0, -down * H)), 0.017 * H, 3), metal, region=region, subdiv=0)


# ================================================================ a calça BUFANTE até abaixo do joelho e os COTURNOS
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.06 * H)), l.lerp(k, 0.45), l.lerp(k, 0.9)], [0.09 * H, 0.1 * H, 0.09 * H], step=0.45)
    P.ell(k + Vector((0, -0.004 * H, 0.025 * H)), (0.078 * H, 0.078 * H, 0.05 * H))  # o franzido bufante no joelho
    fold = lambda p, c=(l.x, l.y): 0.006 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 5 + p.z / H * 26 + n3(p, 14), 2) - 0.35)
    b.add('pants' + side, P.mesh(res=0.009, smooth=3, disp=fold, target=1200), suit, region='leg' + side, subdiv=0)
    # o coturno até o joelho, de cano largo
    B = Sculpt()
    B.chain([k + Vector((0, 0, -0.01 * H)), k.lerp(f, 0.5), f + Vector((0, 0.005 * H, 0.07 * H))], [0.06 * H, 0.055 * H, 0.054 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.035 * H)), (0.056 * H, 0.12 * H, 0.048 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, target=1000), M['feet'], region='k' + side, subdiv=0)
    # a PLATAFORMA grossa com os CRAVOS na borda
    sc = Vector((f.x, f.y - 0.045 * H, f.z - 0.03 * H))
    b.add('bootSole' + side, sole_part(tuple(sc), (0.11 * H, 0.26 * H, 0.07 * H), bevel=0.008), sole, region='k' + side, subdiv=0)
    studs = []
    for i in range(10):
        a = i / 10 * TAU
        d = Vector((math.sin(a), -math.cos(a), 0))
        base = sc + Vector((d.x * 0.056 * H, d.y * 0.13 * H, 0.008 * H))
        studs.append(cone(base, base + d * 0.016 * H, 0.006 * H, 5))
    b.add('soleSpikes' + side, merge(*studs), metal, region='k' + side, subdiv=0)
    # as FIVELAS LARGAS: quatro cintas grossas em volta do cano, com a fivela e a ponta para fora
    for i in range(4):
        c = k.lerp(f, 0.14 + 0.2 * i)
        r = (0.066 - 0.002 * i) * H
        b.add(f'bootStrap{side}{i}', tube([(c.x, c.y, c.z - 0.014 * H, r, r), (c.x, c.y, c.z + 0.014 * H, r, r)], 16), ringm, region='k' + side, subdiv=0)
        bx = Vector((c.x + s * r * 0.95, c.y - 0.01 * H, c.z))
        b.add(f'bootBuckle{side}{i}', box(tuple(bx), (0.012 * H, 0.036 * H, 0.032 * H), bevel=0.002), metal, region='k' + side, subdiv=0)
        b.add(f'bootTab{side}{i}', box(tuple(bx + Vector((s * 0.022 * H, 0.004 * H, 0))), (0.036 * H, 0.02 * H, 0.022 * H), bevel=0.002), ringm, region='k' + side, subdiv=0)
    # a CORRENTE cruzada no peito do pé
    a0 = f + Vector((0, 0.0, 0.05 * H))
    ring = [a0 + Vector((math.sin(t) * 0.066 * H, -math.cos(t) * 0.07 * H - 0.02 * H, -0.02 * H * (1 - abs(math.cos(t))))) for t in [i / 16 * TAU for i in range(17)]]
    b.add('ankleChain' + side, chain_mesh(ring, link=0.022 * H, r=0.003 * H), chainm, region='k' + side, subdiv=0)

# ================================================================ o ARNÊS EM X, a ARGOLA no alto e a faixa do meio
ringz = hz + 0.55 * H
for s in (1, -1):
    # do ombro, cruzando o peito até o lado de baixo do outro lado (as duas se cruzam no esterno)
    v = hug(TOR, [(s * 0.15 * H, -0.03 * H, hz + 0.6 * H), (s * 0.11 * H, -0.13 * H, hz + 0.56 * H), (s * 0.04 * H, -0.2 * H, hz + 0.49 * H),
                  (-s * 0.04 * H, -0.2 * H, hz + 0.43 * H), (-s * 0.1 * H, -0.18 * H, hz + 0.38 * H), (-s * 0.15 * H, -0.12 * H, hz + 0.34 * H)], 0.006 * H)
    b.add(f'xStrap{s}', rod(v, 0.015 * H, 5, flat=flat), strap, region='chest', subdiv=0)
    # nas costas, as faixas cruzam do mesmo jeito
    bk = hug(TOR, [(s * 0.15 * H, 0.03 * H, hz + 0.6 * H), (s * 0.07 * H, 0.2 * H, hz + 0.5 * H), (-s * 0.06 * H, 0.2 * H, hz + 0.42 * H), (-s * 0.15 * H, 0.14 * H, hz + 0.34 * H)], 0.006 * H)
    b.add(f'crossBack{s}', rod(bk, 0.015 * H, 5, flat=flat), strap, region='chest', subdiv=0)
# a faixa vertical da gola até a cintura (passa pela argola)
vt = hug(TOR, [(0, -0.2 * H, z) for z in [hz + 0.6 * H - 0.5 * H * i / 10 for i in range(11)]], 0.006 * H)
b.add('vStrap', rod(vt, 0.013 * H, 5, flat=flat), strap, region='chest', subdiv=0)
rc = hug(TOR, [(0, -0.2 * H, ringz)], 0.016 * H)[0]
b.add('chestRing', rod([rc + Vector((math.sin(t) * 0.02 * H, -0.004 * H, math.cos(t) * 0.02 * H - 0.008 * H)) for t in [i / 14 * TAU for i in range(15)]], 0.004 * H, 5, caps=False), metal, region='chest', subdiv=0)
# as TRÊS CINTAS LARGAS embaixo do peito, com as abas soltas dos lados
for i, z in enumerate((hz + 0.27 * H, hz + 0.31 * H, hz + 0.35 * H)):
    ring = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, z) for a in [j / 40 * TAU for j in range(41)]], 0.008 * H)
    b.add(f'band{i}', rod(ring, 0.018 * H, 6, caps=False, flat=flat), strap, region='chest', subdiv=0)
    for s in (1, -1):
        t = hug(TOR, [(s * 0.3 * H, 0.0, z)], 0.01 * H)[0]
        b.add(f'bandTab{i}{s}', box(tuple(t + Vector((s * 0.03 * H, 0, 0))), (0.06 * H, 0.008 * H, 0.026 * H), bevel=0.002), strap, region='chest', subdiv=0)
# a cinta da cintura (onde prendem as correntes e as tiras)
ring = hug(TOR, [(math.sin(a) * 0.3 * H, -math.cos(a) * 0.3 * H, hz + 0.12 * H) for a in [j / 40 * TAU for j in range(41)]], 0.008 * H)
b.add('waist', rod(ring, 0.016 * H, 6, caps=False, flat=flat), strap, region='chest', subdiv=0)

# ================================================================ as CORRENTES em V até a ARGOLA da frente (e em U atrás)
LEGS = [TOR, part('pantsL'), part('pantsR')]
oc = hug(LEGS, [Vector((0, -0.3 * H, hz - 0.05 * H))], 0.016 * H)[0]
b.add('hipRing', rod([oc + Vector((math.sin(t) * 0.024 * H, -0.002 * H, math.cos(t) * 0.024 * H)) for t in [i / 14 * TAU for i in range(15)]], 0.005 * H, 5, caps=False), metal, region='hips', subdiv=0)
for s in (1, -1):
    a = Vector((s * 0.17 * H, -0.15 * H, hz + 0.11 * H))
    path = [a.lerp(oc, t) + Vector((0, -0.02 * H * math.sin(t * math.pi), -0.03 * H * math.sin(t * math.pi))) for t in [i / 6 for i in range(7)]]
    path = hug(LEGS, path, 0.016 * H)
    b.add(f'hipChain{s}', chain_mesh(path, link=0.026 * H, r=0.0034 * H), chainm, region='hips', subdiv=0)
    bp = [Vector((s * 0.2 * H, 0.04 * H, hz + 0.11 * H)), Vector((s * 0.17 * H, 0.17 * H, hz - 0.02 * H)), Vector((s * 0.1 * H, 0.22 * H, hz - 0.07 * H)), Vector((s * 0.03 * H, 0.2 * H, hz + 0.1 * H))]
    bp = hug(LEGS, bp, 0.018 * H)
    b.add(f'backChain{s}', chain_mesh(bp, link=0.028 * H, r=0.0036 * H), chainm, region='hips', subdiv=0)
    # as TIRAS penduradas dos lados da frente, com a ponta triangular
    hp = hug(LEGS, [Vector((s * 0.14 * H, -0.3 * H, hz + 0.12 * H - 0.3 * H * j / 5)) for j in range(6)], 0.014 * H)
    b.add(f'hang{s}', rod(hp, 0.012 * H, 4, flat=((lambda p: Vector((0, -1, 0))), 0.3)), strap, region='hips', subdiv=0)
    tip(f'hangTip{s}', hp[-1])
# a faixa do meio continua até a argola de baixo
mp = hug(LEGS, [Vector((0, -0.3 * H, hz + 0.12 * H - 0.15 * H * j / 4)) for j in range(5)], 0.012 * H)
b.add('vStrapLow', rod(mp, 0.013 * H, 4, flat=((lambda p: Vector((0, -1, 0))), 0.3)), strap, region='hips', subdiv=0)

# ================================================================ a ALÇA PRETA do baixo: do ombro esquerdo ao quadril direito
fr = hug(TOR, [(0.13 * H, -0.06 * H, hz + 0.62 * H), (0.08 * H, -0.19 * H, hz + 0.5 * H), (-0.04 * H, -0.2 * H, hz + 0.3 * H), (-0.16 * H, -0.17 * H, hz + 0.12 * H), (-0.21 * H, -0.08 * H, hz + 0.04 * H)], 0.016 * H)
b.add('bassStrapF', rod(fr, 0.02 * H, 5, flat=flat), bandm, region='chest', subdiv=0)
bs = hug(TOR, [(0.13 * H, 0.06 * H, hz + 0.62 * H), (0.06 * H, 0.2 * H, hz + 0.45 * H), (-0.08 * H, 0.2 * H, hz + 0.24 * H), (-0.19 * H, 0.12 * H, hz + 0.08 * H), (-0.21 * H, -0.02 * H, hz + 0.04 * H)], 0.026 * H)
bs = [bs[0].lerp(bs[1], t / 3) for t in range(3)] + [bs[1].lerp(bs[2], t / 3) for t in range(3)] + [bs[2].lerp(bs[3], t / 3) for t in range(3)] + bs[3:]
bs = hug(TOR, bs, 0.026 * H)
b.add('bassStrapB', rod(bs, 0.02 * H, 5, flat=flat), bandm, region='chest', subdiv=0)

# ================================================================ a GOLA ALTA e a GARGANTILHA DE ESPINHOS
b.add('collarRing', tube([(0, 0, hz + 0.6 * H, 0.11 * H, 0.09 * H), (0, 0, hz + 0.655 * H, 0.074 * H, 0.07 * H)], 20), suit_dk, region='chest', subdiv=0)
nz = hz + 0.69 * H
b.add('choker', tube([(0, 0.004 * H, nz - 0.02 * H, 0.06 * H, 0.058 * H), (0, 0.004 * H, nz + 0.02 * H, 0.06 * H, 0.058 * H)], 20), ringm, region='neck', subdiv=0)
spikes = []
for i in range(12):
    a = i / 12 * TAU
    d = Vector((math.sin(a), -math.cos(a), 0))
    base = Vector((0, 0.004 * H, nz)) + Vector((d.x * 0.062 * H, d.y * 0.06 * H, 0))
    spikes.append(cone(base, base + d * 0.022 * H, 0.009 * H, 5))
b.add('chokerSpikes', merge(*spikes), metal, region='neck', subdiv=0)

# ================================================================ os braços: TRÊS FAIXAS com as abas, as MANGAS LONGAS RASGADAS
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh, el, hd = sk['s' + side], sk['e' + side], sk['hand' + side]
    for k in range(3):  # no braço, com a aba chata para fora
        c = sh.lerp(el, 0.3 + 0.27 * k)
        r = 0.06 * H
        b.add(f'armBand{side}{k}', tube([(c.x, c.y, c.z - 0.011 * H, r, r), (c.x, c.y, c.z + 0.011 * H, r, r)], 14), strap, region='arm' + side, subdiv=0)
        b.add(f'armTab{side}{k}', box((c.x + s * (r + 0.016 * H), c.y, c.z), (0.036 * H, 0.01 * H, 0.026 * H), bevel=0.002), strap, region='arm' + side, subdiv=0)
    # a MANGA: abre em sino do cotovelo até o pulso e o pano rasgado cai do lado de fora até a canela
    ax = (hd - el).normalized()
    out = Vector((s, 0, 0))
    sl = [el.lerp(hd, t) for t in (0.2, 0.5, 0.78, 0.95)]
    b.add(f'sleeve{side}', rod(sl, [0.05 * H, 0.06 * H, 0.074 * H, 0.084 * H], 10, caps=False), suit, region='e' + side, subdiv=0)
    top = hd + out * 0.03 * H + Vector((0, 0.01 * H, 0.02 * H))
    pane = [top + ax * 0.04 * H * t for t in range(5)]  # curto: o modelo é rígido e a manga acompanha o antebraço (na mira ela viraria uma tábua)
    b.add(f'sleevePanel{side}', rod(pane, [0.07 * H, 0.078 * H, 0.08 * H, 0.074 * H, 0.06 * H], 8, flat=((lambda p: Vector((0, -1, 0))), 0.3)), suit, region='e' + side, subdiv=0)
    for i in range(5):  # a ponta rasgada em tiras
        p0 = pane[-1] + Vector(((i - 2) * 0.026 * H, 0, 0))
        b.add(f'sleeveRag{side}{i}', rod([p0, p0 + ax * random.uniform(0.03, 0.06) * H], [0.012 * H, 0.003 * H], 4), suit_dk, region='e' + side, subdiv=0)
    for i in range(7):  # a boca da manga rasgada em pontas
        a = i / 7 * TAU
        d = Vector((math.cos(a) * s, math.sin(a), 0))
        p0 = el.lerp(hd, 0.95) + d * 0.08 * H
        b.add(f'cuff{side}{i}', rod([p0, p0 + ax * random.uniform(0.02, 0.04) * H], [0.01 * H, 0.003 * H], 4), suit_dk, region='e' + side, subdiv=0)
    # a TIRA COMPRIDA pendurada do braço, com a ponta triangular
    t0 = el + out * 0.06 * H + Vector((0, -0.01 * H, 0))
    tl = [t0 + ax * 0.06 * H * j for j in range(5)]
    b.add(f'armTail{side}', rod(tl, 0.011 * H, 4, flat=((lambda p, o=out: o), 0.3)), strap, region='e' + side, subdiv=0)
    tip(f'armTailTip{side}', tl[-1], region='e' + side)
# os dois ANÉIS PRETOS na mão direita
hd = sk['handR']
for i, dz in enumerate((0.0, -0.016)):
    c = hd + Vector((-0.004 * H, -0.03 * H, -0.075 * H + dz * H))
    b.add(f'ring{i}', rod([c + Vector((math.cos(t) * 0.02 * H, 0, math.sin(t) * 0.012 * H)) for t in [j / 10 * TAU for j in range(11)]], 0.004 * H, 5, caps=False), ringm, region='eR', subdiv=0)

# ================================================================ o CABELO: loiro-acinzentado, fofo, com a parte de baixo VERMELHA
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))
# a camada de baixo, VERMELHA, só nas laterais (perto das orelhas, como no pôster)
Pk = Sculpt()
for i in range(14):
    th = random.choice((1, -1)) * random.uniform(1.25, 2.2)
    top = HC + Vector((math.sin(th) * 0.13 * H, -math.cos(th) * 0.14 * H + 0.012 * H, 0.0))
    o = Vector((math.sin(th), -math.cos(th), 0))
    Pk.chain([top + Vector((0, 0, -0.02 * H)), top + o * 0.016 * H + Vector((0, 0, -0.065 * H)), top + o * 0.03 * H + Vector((0, 0, -0.12 * H))], [0.022 * H, 0.016 * H, 0.006 * H], step=0.45)
b.add('hairRed', Pk.mesh(res=0.006, smooth=2, target=2000), redh, region='head', subdiv=0)
# a camada de fora: mechas FOFAS que caem para os lados e para baixo, com as pontas soltas (as artes da wiki)
Hr = Sculpt()
Hr.ell(Vh(0, 0.012, 0.045), (0.155 * H, 0.164 * H, 0.152 * H))
Hr.ell(Vh(0, 0.05, -0.02), (0.14 * H, 0.13 * H, 0.13 * H))  # a nuca coberta
Hr.ell(Vh(0, 0.07, -0.075), (0.115 * H, 0.1 * H, 0.09 * H))
for i in range(150):
    th = random.uniform(-math.pi, math.pi)
    ph = random.uniform(0.2, 2.05 if abs(th) > 2.2 else 1.7)  # atrás desce até a nuca  # do alto da cabeça até a altura das orelhas
    d = Vector((math.sin(th) * math.sin(ph), -math.cos(th) * math.sin(ph), math.cos(ph)))
    if d.y < -0.5 and d.z < 0.6:  # o rosto fica livre
        continue
    if abs(th) > 1.15 and abs(th) < 2.3 and ph > 1.35:  # a lateral de baixo é da mecha vermelha
        continue
    base = HC + Vector((d.x * 0.145 * H, d.y * 0.155 * H + 0.01 * H, d.z * 0.14 * H + 0.04 * H))
    ln = random.uniform(0.05, 0.1) * H
    fall = Vector((d.x * 0.8, d.y * 0.8, d.z * 0.35 - 0.55))  # caem, não espetam para cima
    tp = base + (fall + Vector((random.uniform(-0.35, 0.35), random.uniform(-0.35, 0.35), random.uniform(-0.2, 0.25)))).normalized() * ln
    Hr.chain([base, base.lerp(tp, 0.5) + d * 0.012 * H, tp], [0.03 * H, 0.021 * H, 0.006 * H], step=0.45)
for i in range(12):  # a franja desfiada até a sobrancelha
    x = -0.1 + 0.2 * i / 11
    top = Vh(x, -0.12, 0.12)
    ln = random.uniform(0.07, 0.09)
    Hr.chain([top, top + Vector((x * 0.1 * H, -0.03 * H, -ln * 0.55 * H)), top + Vector((x * 0.2 * H + random.uniform(-0.012, 0.012) * H, -0.036 * H, -ln * H))], [0.02 * H, 0.013 * H, 0.004 * H], step=0.45)
Hr.ell(Vh(0, -0.135, -0.06), (0.11 * H, 0.1 * H, 0.13 * H), neg=True)


def messy(p):
    return 0.004 * H * (ridge(math.atan2(p.x - HC.x, p.y - HC.y) * 14 + p.z / H * 30 + n3(p, 30) * 2, 2) - 0.4)


HAIR = b.add('hair', Hr.mesh(res=0.0055, smooth=2, disp=messy, target=5500), hairm, region='head', subdiv=0)

# ================================================================ prop_maskOn: a MÁSCARA BRANCA, os OLHOS VERMELHOS e as LÁGRIMAS
fz = hc.z
MROWS = [(0.09, 0.1, 0.13, 1.1), (0.05, 0.122, 0.15, 1.25), (0.0, 0.13, 0.158, 1.3), (-0.05, 0.126, 0.158, 1.3), (-0.1, 0.11, 0.15, 1.2), (-0.14, 0.08, 0.13, 1.0)]
rows = [[Vector((math.sin(a_) * rx * H, hc.y - math.cos(a_) * ry * H, fz + dz * H)) for a_ in [-am + 2 * am * i / 18 for i in range(19)]] for dz, rx, ry, am in MROWS]
b.add('prop_maskOnShell', shell_grid(rows, 0.006), maskw, region='head', subdiv=1)
SURF = lambda x, z, off: Vector((x * H, hc.y - math.sqrt(max(0.0, 1 - (x / 0.13) ** 2)) * 0.158 * H - off * H, fz + z * H))
liners, tears, eyes = [], [], []
for s in (1, -1):
    ex = s * 0.046
    # o recorte do olho: um contorno fino escuro
    ring = [SURF(ex + math.cos(t) * 0.026, 0.004 + math.sin(t) * 0.012, 0.006) for t in [j / 16 * TAU for j in range(17)]]
    liners.append(rod(ring, 0.003 * H, 5, caps=False))
    eyes.append(ellipsoid(tuple(SURF(ex, 0.004, 0.004)), (0.018 * H, 0.006 * H, 0.009 * H), 10, 6))
    # as LÁGRIMAS VERMELHAS: três escorridos finos do olho até o queixo
    for j, (dx, ln) in enumerate(((-0.01, 0.07), (0.0, 0.11), (0.012, 0.085))):
        x = ex + dx * s
        pts = [SURF(x + 0.003 * math.sin(k * 1.7), -0.01 - ln * k / 6, 0.007) for k in range(7)]
        tears.append(rod(pts, [0.0045 * H, 0.004 * H, 0.0035 * H, 0.0035 * H, 0.003 * H, 0.003 * H, 0.0045 * H], 5))
# a boca: um traço curto e fechado
liners.append(rod([SURF(x, -0.09, 0.005) for x in [-0.018 + 0.036 * i / 6 for i in range(7)]], 0.004 * H, 5))
b.add('prop_maskOnLiner', merge(*liners), liner, region='head', subdiv=0)
b.add('prop_maskOnTris', merge(*tears), blood, region='head', subdiv=0)
b.add('prop_maskOnEyes', merge(*eyes), eyew, region='head', subdiv=0)
b.group('prop_maskOn', 'prop_maskOn')  # uma peça só (vários materiais): o jogo liga e desliga junto

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'cindy.blend'), check_existing=False)
