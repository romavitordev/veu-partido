"""
BRAN — A Vigília (Treb Ciach, Irlanda, 890) — public/models/bran.glb.
Referências (wiki "Bran", artes de frente e de costas, normal e fantasiado; notas em lore/A-VIGILIA.md):
  - quase 2 m, corpulento; cabelo RUIVO longo e CACHEADO até o peito, BARBA cheia ruiva, sardas, cicatriz na bochecha
    esquerda (no rosto: face_bran);
  - camisa VERDE de mangas longas; TÚNICA-COLETE escura de couro, toda REMENDADA, até o meio da coxa, com o cordão no
    pescoço; DOIS CINTOS de couro marrom e o PUNHAL de bainha marrom atravessado na frente;
  - calça escura dentro das BOTAS de couro com FAIXAS cruzadas na canela;
  - o grande MANTO PRETO até o tornozelo, aberto na frente, de GOLA de pelo felpudo, FRANJAS na barra e RETALHOS de
    XADREZ (verde e vinho) costurados (a textura cloak_bran);
  - o colar de TRÊS PENAS DE CORVO.
FANTASIADO (O Inquebrável, a Transformação): o MESMO modelo ligando as peças prop_crowMask (a MÁSCARA DE CRÂNIO DE
CORVO de bico longo) e prop_feathers (a GOLA ENORME de penas cinza-azuladas até a cintura); o cabelo some por baixo.
A lança "Justiça", as azagaias e o broquel são montados em código (models/props.js).
  node tools/blender/build.mjs bran   → public/models/bran.glb (+ tools/blender/fonte/bran.blend)
  ao vivo (MCP): exec(open(r"E:/arena paranormal/tools/blender/mcp_build.py", encoding="utf-8").read()); mcp_build("bran")
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'bran.glb'
random.seed(890)  # Treb Ciach, 890

b = Builder(width=1.06, bulk=1.12, height=1.1)  # ~1,98 m, largo
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_bran', '#e8b496', 0.8),
    'face': material('face_bran', '#ffffff', 0.8),
    'torso': material('shirt_bran', '#3e5a34', 0.9),
    'arm': material('shirt_bran', '#3e5a34', 0.9),
    'hand': material('skin_bran', '#e8b496', 0.8),
    'legs': material('pants_bran', '#262224', 0.9),
    'feet': material('boot_bran', '#3a281c', 0.7),
}
tunic = material('tunic_bran', '#ffffff', 0.85)  # o couro escuro remendado (textura)
leather = material('belt_bran', '#6a4226', 0.6)
leather_dk = material('wrap_bran', '#2e2018', 0.7)
cloak = material('cloak_bran', '#ffffff', 0.95)  # o manto preto com os retalhos de xadrez (textura)
fur = material('fur_bran', '#18161a', 0.95)
hairm = material('hair_bran', '#a8441c', 0.75)
steel = material('steel_bran', '#c8c4c0', 0.3, metal=0.85)
feather = material('feather_bran', '#141418', 0.6)
cord = material('cord_bran', '#202024', 0.8)
sole = material('sole_bran', '#1a120c', 0.8)
bone = material('bone_bran', '#5a5650', 0.7)   # o crânio de corvo, escurecido
bone_dk = material('bone_bran_dk', '#1c1a1a', 0.8)
plume = material('plume_bran', '#34404a', 0.85)  # as penas cinza-azuladas da fantasia
plume_lt = material('plume_lt_bran', '#46525e', 0.85)  # algumas penas mais claras (variação)
plume_dk = material('plume_dk_bran', '#1c2228', 0.9)  # a base por baixo das penas

PREVIEW = {'face_bran': '#e8b496', 'tunic_bran': '#3a3430', 'cloak_bran': '#1e1c1e'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.11, 0.16), (0.0, 0.16), (0.17, 0.15), (0.36, 0.18), (0.47, 0.198), (0.57, 0.12), (0.63, 0.066)],
            arm_r=(0.058, 0.05, 0.042), leg_r=(0.085, 0.066, 0.05), head_r=(0.136, 0.15, 0.16))
HC = Vector((hc.x, hc.y, hc.z))
Vh = lambda x, y, z: HC + Vector((x * H, y * H, z * H))


def part(name):
    return next(o for o in b.parts if o.name == name)


# ================================================================ TÚNICA-COLETE de couro remendada, do peito ao meio da
# coxa, fechada na frente com o decote em V raso (o cordão aparece) — as costuras dos remendos estão na textura
TU = [(-0.27, 0.19, 0.16), (-0.18, 0.182, 0.15), (-0.08, 0.172, 0.14), (0.02, 0.168, 0.134), (0.13, 0.162, 0.13),
      (0.24, 0.165, 0.126), (0.36, 0.192, 0.138), (0.46, 0.205, 0.146), (0.54, 0.182, 0.132), (0.6, 0.13, 0.104)]
rows = []
for dz, rx, ry in TU:
    z = hz + dz * H
    gap = 0.0 if dz < 0.5 else 0.3 + (dz - 0.5) * 3.5  # o decote em V no alto
    if dz < 0:  # a saia da túnica abre um pouco e se separa nas pernas pela frente
        gap = 0.06 * (-dz / 0.27)
    rows.append(ring_pts(z, rx * H, ry * H, gap, TAU - gap, 36))
tu = b.add('tunic', shell_grid(rows, 0.008), tunic, region='torso', subdiv=1)
relief(tu, lambda p: 0.0026 * H * (ridge((p.z - hz) / H * 40 + n3(p, 8) * 2, 2) - 0.4))

# ================================================================ os DOIS CINTOS de couro e o PUNHAL atravessado
for k, (dz, tilt) in enumerate(((0.07, 0.0), (0.0, 0.025))):
    ring = []
    for i in range(33):
        a = i / 32 * TAU
        ring.append((math.sin(a) * 0.173 * H, -math.cos(a) * 0.139 * H, hz + dz * H + tilt * H * math.sin(a)))
    b.add(f'belt{k}', rod(ring, 0.017 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), leather, region='torso', subdiv=0)
    bk = Vector((0.02 * H * (1 - 2 * k), -0.145 * H, hz + dz * H))
    b.add(f'buckle{k}', box(tuple(bk), (0.04 * H, 0.012 * H, 0.032 * H), bevel=0.003), steel, region='torso', subdiv=0)
# o PUNHAL na frente, atravessado da esquerda para a direita (a bainha marrom e o cabo)
d0 = Vector((0.12 * H, -0.15 * H, hz + 0.05 * H))
d1 = Vector((-0.1 * H, -0.158 * H, hz + 0.0 * H))
b.add('dagSheath', rod([d0, d0.lerp(d1, 0.5), d1], [0.018 * H, 0.016 * H, 0.006 * H], 6), leather, region='torso', subdiv=0)
dg = d0 + (d0 - d1).normalized() * 0.06 * H
b.add('dagGrip', rod([d0 + (d0 - d1).normalized() * 0.01 * H, dg], 0.011 * H, 6), leather_dk, region='torso', subdiv=0)
b.add('dagPommel', ellipsoid(tuple(dg), (0.014 * H, 0.014 * H, 0.014 * H), 8, 6), steel, region='torso', subdiv=0)

# ================================================================ BOTAS de couro com FAIXAS cruzadas na canela
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    B = Sculpt()
    B.chain([k.lerp(f, 0.35), k.lerp(f, 0.75), f + Vector((0, 0.005 * H, 0.06 * H))], [0.054 * H, 0.05 * H, 0.05 * H], step=0.4)
    B.ell(f + Vector((0, -0.05 * H, 0.03 * H)), (0.055 * H, 0.118 * H, 0.044 * H))
    B.ell(f + Vector((0, -0.13 * H, 0.022 * H)), (0.048 * H, 0.05 * H, 0.032 * H))
    B.ell(f + Vector((0, 0.035 * H, 0.04 * H)), (0.05 * H, 0.05 * H, 0.05 * H))
    b.add('boot' + side, B.mesh(res=0.007, smooth=3, disp=lambda p: 0.0018 * H * n3(p, 14), target=1000), M['feet'], region='k' + side, subdiv=0)
    b.add('bootSole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.014 * H), (0.105 * H, 0.25 * H, 0.03 * H), bevel=0.006), sole, region='k' + side, subdiv=0)
    # as faixas: anéis inclinados alternando, da canela até o tornozelo
    for i in range(6):
        t = 0.38 + i * 0.07
        c = k.lerp(f, t)
        r = 0.057 * H - i * 0.0012 * H
        tilt = 0.022 * H * (1 if i % 2 else -1)
        ring = [(c.x + math.sin(a) * r, c.y - math.cos(a) * r, c.z + tilt * math.sin(a)) for a in [j / 18 * TAU for j in range(19)]]
        b.add(f'bootWrap{side}{i}', rod(ring, 0.007 * H, 4, caps=False), leather_dk, region='k' + side, subdiv=0)

# ================================================================ o grande MANTO PRETO dos ombros até o tornozelo,
# aberto na frente (o peito, a túnica e os cintos à mostra), com os braços passando por dentro


def cape_pt(a, v, out=1.0):
    V0 = 0.22
    th = min(1.0, v / V0) * math.pi / 2  # o ombro é um ARCO redondo: sai do pescoço, passa por cima do ombro e desce
    side = abs(math.sin(a))
    kk = 0.55 + 0.45 * side
    dv = max(0.0, v - V0) / (1 - V0)
    rx = 0.12 * H + 0.25 * H * math.sin(th) * kk + dv * 0.17 * H  # abre em A até a barra
    ry = 0.11 * H + 0.1 * H * math.sin(th) + dv * 0.1 * H
    fold = 1 + 0.08 * min(1.0, v * 2.5) * (ridge(a * 4.5 + v * 1.2 + n3(Vector((a, v, 0)), 3)) - 0.4)
    hem = 0.03 * H * math.sin(a * 6) * max(0.0, v - 0.85) / 0.15  # a barra ondulada
    z0 = top + 0.11 * H - 0.17 * H * (1 - math.cos(th)) * kk  # o ombro: do pescoço (1,66 H) até ~1,49 H do lado
    z = z0 - dv * (z0 - 0.2 * H) + hem  # até o tornozelo
    return Vector((math.sin(a) * rx * fold * out / b.k_tx, -math.cos(a) * ry * fold * out / b.k_ty, z))


GAP = 0.085  # a abertura da frente: larga no alto, onde o manto vira para os lados
VS = [0.22 * k / 8 for k in range(8)] + [0.22 + 0.78 * k / 18 for k in range(0, 19)]


def gap_at(v):
    return GAP + 0.03 * max(0.0, 1 - v * 3)


cape_rows = [[cape_pt((gap_at(v) + (1 - 2 * gap_at(v)) * j / 72) * TAU, v) for j in range(73)] for v in VS]


def cape_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.16 * H, 0.32 * H, abs(p.x)) * smoothstep(top - 0.55 * H, top - 0.12 * H, p.z) * 0.5
    w_hip = smoothstep(hz + 0.12 * H, hz - 0.35 * H, p.z) * (1 - w_arm) * 0.75
    return {'s' + side: w_arm, 'hips': w_hip, 'sp': max(0.0, 1 - w_arm - w_hip)}


cape = b.add('cloak', shell_grid(cape_rows, 0.008 * H), cloak, region='torso', weight_fn=cape_weights, subdiv=0)
relief(cape, lambda p: 0.005 * H * (ridge(math.atan2(p.x, p.y) * 8 + n3(p, 9) * 1.5, 2) - 0.35) * smoothstep(top, top - 0.4 * H, p.z))

# a GOLA de pelo felpudo: um rolo grosso nos ombros e descendo pelas duas bordas da abertura até o chão
G = Sculpt()
collar = [cape_pt(a * TAU, 0.06, 1.0) for a in [gap_at(0.06) + (1 - 2 * gap_at(0.06)) * i / 24 for i in range(25)]]
G.chain(collar, 0.052 * H, step=0.5)
b.add('prop_furCollar', G.mesh(res=0.01, smooth=2, disp=lambda p: 0.008 * H * (n3(p, 40) + 0.6 * n3(p, 90)), target=5000), fur, region='torso', weight_fn=cape_weights, subdiv=0)
# as FRANJAS da barra: tiras curtas penduradas em toda a volta
fr = []
for j in range(70):
    u = gap_at(1) + (1 - 2 * gap_at(1)) * (j + 0.5) / 70
    a = u * TAU
    p0 = cape_pt(a, 0.985, 1.0)
    ln = (0.05 + 0.025 * random.random()) * H
    fr.append(rod([p0, p0 + Vector((random.uniform(-0.006, 0.006) * H, 0, -ln))], [0.008 * H, 0.004 * H], 4))
b.add('prop_furFringe', merge(*fr), fur, region='torso', weight_fn=cape_weights, subdiv=0)
# as bordas da frente: uma FAIXA de pelo deitada no manto, da gola até a barra, larga no alto e afinando
lap = []
for s in (1, -1):
    rows_ = []
    for v in [0.06 + 0.93 * k / 20 for k in range(21)]:
        wdt = 0.05 - 0.028 * min(1.0, v / 0.4)
        us = [gap_at(v) + wdt * j / 3 for j in range(4)]
        if s < 0:
            us = [1 - u for u in us]
        rows_.append([cape_pt(u * TAU, v, 1.025) for u in us])
    lap.append(shell_grid(rows_, 0.03 * H))
lp = b.add('prop_furLapel', merge(*lap), fur, region='torso', weight_fn=cape_weights, subdiv=1)
relief(lp, lambda p: 0.008 * H * (n3(p, 45) + 0.5 * n3(p, 100)))
b.group('prop_fur', 'prop_fur')  # a gola de pelo e as franjas: só no manto normal (o da fantasia é liso)

# ================================================================ o CORDÃO no pescoço e as TRÊS PENAS DE CORVO
ty = -0.15 * H
b.add('neckCord', rod([(-0.055 * H, -0.02 * H, 1.62 * H), (-0.03 * H, ty * 0.92, 1.53 * H), (0.0, ty * 0.98, 1.49 * H),
                       (0.03 * H, ty * 0.92, 1.53 * H), (0.055 * H, -0.02 * H, 1.62 * H)], 0.004 * H, 5), cord, region='chest', subdiv=0)
fe = []
for k, dx in enumerate((-0.022, 0.0, 0.022)):
    c = Vector((dx * H, ty * 1.02 - 0.004 * H, 1.47 * H))
    ln = (0.07 if k == 1 else 0.06) * H
    tilt = dx * 1.2
    fe.append(rod([c, c + Vector((tilt * H, -0.006 * H, -ln * 0.5)), c + Vector((tilt * 1.6 * H, -0.004 * H, -ln))],
                  [0.004 * H, 0.011 * H, 0.002 * H], 5, flat=((lambda p: Vector((0, -1, 0))), 0.25)))
b.add('crowFeathers', merge(*fe), feather, region='chest', subdiv=0)

# ================================================================ CABELO RUIVO longo e cacheado até o peito
# (revisto no Blender ao vivo, 2026-11-27): antes era uma bolha lisa com o rosto num buraco oval. Agora, como o Arthur
# (char_arthur.py), tudo nasce NA SUPERFÍCIE da cabeça (raycast): a calota colada, e os cachos são ESPIRAIS (ringlets)
# que caem dos lados e de trás até o peito — o que lê "cacheado" mesmo no tamanho do jogo.
from mathutils.bvhtree import BVHTree
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


def ringlet(S, top, down, length, r_coil, r_tube, turns, phase=0.0, out=None):
    """um cacho em espiral: o eixo desce de `top` na direção `down` (curvando para `out`), a mola em volta dele"""
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
        c = top + down * (length * t)
        if out is not None:
            c = c + Vector(out) * (t * t)
        ang = phase + t * turns * math.tau
        rc = r_coil * (1.0 - 0.35 * t)
        pts.append(c + side * (math.cos(ang) * rc) + fwd * (math.sin(ang) * rc))
        rad.append(r_tube * (1.0 - 0.45 * t))
    S.chain(pts, rad, step=0.5)


random.seed(31)
Hr = Sculpt()
# a CALOTA contínua colada no crânio (cobre o alto, os lados e a nuca; a testa e o rosto livres)
for i in range(30):
    for j in range(8):
        a = (i / 30 - 0.5) * math.tau
        el = -0.35 + 1.25 * j / 7
        if math.cos(a) > 0.45 and el < 0.62:
            continue  # testa e rosto
        if math.cos(a) > 0.1 and el < 0.05:
            continue  # as bochechas (ali fica a barba)
        q = on_head(a, el, (0.026 if el > 0.3 else 0.03) * H)
        if q:
            Hr.ell(q, (0.034 * H, 0.034 * H, 0.03 * H))
# o topete: volume na risca do meio, caindo de lado para a testa (os cachos de cima)
for s_ in (1, -1):
    for k in range(4):
        q = on_head(s_ * (0.25 + 0.17 * k), 0.68 - 0.05 * k, 0.03 * H)
        if q:
            ringlet(Hr, q, (s_ * 0.5, -0.4, -1), 0.07 * H, 0.01 * H, 0.02 * H, 1.2, phase=k)
# CACHOS da calota: espirais curtas apontando para fora em toda a cabeça (dão a textura dos cachos)
for i in range(90):
    a = random.uniform(-math.pi, math.pi)
    el = random.uniform(-0.1, 1.3)
    if math.cos(a) > 0.4 and el < 0.75:
        continue
    q = on_head(a, el, 0.04 * H)
    if q:
        d = (q - HC).normalized()
        ringlet(Hr, q, d * 0.6 + Vector((0, 0, -1)), 0.055 * H, 0.009 * H, 0.019 * H, 1.2, phase=i)
# os CACHOS LONGOS: dos lados e de trás, até o peito; os da frente passam por cima dos ombros
for s_ in (1, -1):
    for k in range(4):  # os da frente, por cima dos ombros
        q = on_head(s_ * (1.05 + 0.13 * k), -0.05 - 0.05 * k, 0.02 * H)
        if q:
            ringlet(Hr, q, (s_ * 0.06, -0.14, -1), (0.36 - 0.03 * k) * H, 0.014 * H, 0.025 * H, 4.5, phase=k * 1.7,
                    out=(s_ * 0.05 * H, -0.07 * H, 0))
    for k in range(5):  # os dos lados e de trás, deitados no manto até as escápulas
        q = on_head(s_ * (1.75 + 0.3 * k), -0.1 + 0.04 * (k % 2), 0.02 * H)
        if q:
            ringlet(Hr, q, (s_ * 0.08, 0.3, -1), (0.38 - 0.02 * k) * H, 0.014 * H, 0.026 * H, 4.2, phase=k * 2.3,
                    out=(s_ * 0.02 * H, 0.06 * H, 0))
Hr.ell(Vh(0, -0.16, -0.06), (0.1 * H, 0.08 * H, 0.13 * H), neg=True)  # o rosto livre


def curls(p):
    return 0.0025 * H * (n3(p, 70) + 0.5 * n3(p, 140))


b.add('prop_hairCurls', Hr.mesh(res=0.0055, smooth=1, disp=curls, target=9000), hairm, region='head', subdiv=0)

# ================================================================ a BARBA cheia ruiva, colada na mandíbula (das
# costeletas ao queixo), a ponta cacheada até o alto do peito, e o bigode. As bochechas acima da boca ficam livres.
Bd = Sculpt()
for i in range(23):
    a = (i / 22 - 0.5) * 2.9
    for el in (-0.12, -0.27, -0.42, -0.57, -0.72, -0.86):
        if abs(a) < 0.3 and el > -0.55:
            continue  # a boca
        if abs(a) < 0.85 and el > -0.38:
            continue  # as bochechas
        if abs(a) > 1.1 and el < -0.6:
            continue  # o pescoço dos lados
        q = on_head(a, el, 0.012 * H)
        if q:
            Bd.ell(q, (0.036 * H, 0.034 * H, 0.032 * H))
# a ponta da barba: alguns cachos curtos descendo do queixo
for k in range(9):
    a = (k / 8 - 0.5) * 1.5
    q = on_head(a, -0.8, 0.03 * H)
    if q:
        ringlet(Bd, q, (a * 0.25, -0.25, -1), (0.11 - 0.03 * abs(a)) * H, 0.01 * H, 0.028 * H, 1.6, phase=k * 1.3)
# o BIGODE cheio, caindo pelos cantos da boca até a barba
for s in (1, -1):
    pts = [on_head(s * a, el, 0.014 * H) for a, el in ((0.03, -0.36), (0.17, -0.37), (0.3, -0.45), (0.34, -0.58))]
    pts = [q for q in pts if q]
    if len(pts) > 1:
        Bd.chain(pts, [0.019 * H, 0.021 * H, 0.017 * H, 0.012 * H][:len(pts)], step=0.45)
b.add('prop_hairBeard', Bd.mesh(res=0.005, smooth=1, disp=curls, target=4500), hairm, region='head', subdiv=0)
b.group('prop_hair', 'prop_hair')

# ================================================================ FANTASIADO: prop_crowMask (crânio de corvo de bico longo)
HR = (0.136 * H, 0.15 * H, 0.16 * H)
mk = Sculpt()
mk.ell(Vh(0, -0.02, 0.04), (0.15 * H, 0.165 * H, 0.16 * H))  # o crânio por cima da cabeça
mk.ell(Vh(0, -0.1, -0.01), (0.12 * H, 0.1 * H, 0.12 * H))
beak = [Vh(0, -0.16, 0.0), Vh(0, -0.27, -0.06), Vh(0, -0.38, -0.15), Vh(0, -0.45, -0.25)]
mk.chain(beak, [0.07 * H, 0.05 * H, 0.03 * H, 0.008 * H], step=0.4)
for s in (1, -1):
    mk.ell(Vh(s * 0.065, -0.15, 0.03), (0.04 * H, 0.03 * H, 0.04 * H), neg=True)  # as órbitas
b.add('prop_crowMaskSkull', mk.mesh(res=0.006, smooth=3, disp=lambda p: 0.002 * H * n3(p, 30), target=2400), bone, region='head', subdiv=0)
ey = []
for s in (1, -1):
    ey.append(ellipsoid(tuple(Vh(s * 0.062, -0.135, 0.03)), (0.026 * H, 0.012 * H, 0.03 * H), 10, 6))
b.add('prop_crowMaskEyes', merge(*ey), bone_dk, region='head', subdiv=0)
# a fenda do bico (a linha escura entre as duas metades)
b.add('prop_crowMaskSlit', rod([Vh(0, -0.2, -0.045), Vh(0, -0.31, -0.1), Vh(0, -0.42, -0.21)], 0.004 * H, 4), bone_dk, region='head', subdiv=0)
b.group('prop_crowMask', 'prop_crowMask')

# prop_feathers: a GOLA ENORME de penas cinza-azuladas, dos ombros até a cintura, fechada no peito.
# (revisto no Blender ao vivo, 2026-11-27: era um saco de metaballs em forma de ovo, com textura de plástico-bolha.)
# Agora: uma base fina e escura (para não vazar entre as penas) e, por cima, PENAS DE VERDADE — lâminas achatadas em
# fileiras desencontradas, como telhas, apontando para baixo; as de cima curtas, as de baixo longas.
FROWS = 9
TOP = HC.z - 0.02 * H        # a gola sobe atrás até a altura das orelhas (não passa do alto da cabeça)
CHIN = HC.z - 0.13 * H       # acima do queixo a frente fica aberta (a máscara)


def mantle(v):
    """(rx, ry, z) da gola na fileira v (0 = alto, 1 = cintura)"""
    w = math.sin(min(1.0, v / 0.7) * math.pi / 2) ** 0.8  # sino: estreito no pescoço, largo nos ombros e no peito
    w *= 1 - 0.1 * max(0.0, v - 0.85) / 0.15
    return (0.1 + 0.23 * w) * H, (0.11 + 0.11 * w) * H, TOP - v * 0.68 * H


Fh = Sculpt()
for k in range(FROWS + 1):
    v = k / FROWS
    rx, ry, z = mantle(v)
    n = 20 + int(14 * v)
    for i in range(n):
        a = TAU * i / n
        if z > CHIN and math.cos(a) > 0.55:
            continue
        Fh.ell(Vector((math.sin(a) * rx * 0.92, -math.cos(a) * ry * 0.92 + 0.02 * H, z)), 0.05 * H)
b.add('prop_feathersBase', Fh.mesh(res=0.01, smooth=2, target=3500), plume_dk, region='torso', weight_fn=cape_weights, subdiv=0)

random.seed(77)
fa, fb = [], []
for k in range(FROWS):
    v = (k + 0.15) / FROWS
    rx, ry, z = mantle(v)
    ln = (0.12 + 0.1 * v) * H           # comprimento da pena
    wd = (0.018 + 0.01 * v) * H         # meia-largura
    n = 26 + int(20 * v)
    for i in range(n):
        a = TAU * (i + 0.5 * (k % 2)) / n + random.uniform(-0.05, 0.05)
        if z > CHIN and math.cos(a) > 0.0:
            continue
        out = Vector((math.sin(a), -math.cos(a), 0))
        root = Vector((math.sin(a) * rx, -math.cos(a) * ry + 0.02 * H, z)) + out * 0.03 * H
        tilt = 0.22 + 0.12 * random.random()
        d = (out * tilt + Vector((0, 0, -1))).normalized()
        L = ln * random.uniform(0.85, 1.1)
        pts = [root, root + d * L * 0.35 + out * 0.012 * H, root + d * L * 0.75 + out * 0.02 * H, root + d * L + out * 0.022 * H]
        rad = [wd * 0.3, wd, wd * 0.6, wd * 0.05]
        nf = (lambda o: (lambda p: o))(out)
        (fb if random.random() < 0.3 else fa).append(rod(pts, rad, 6, flat=(nf, 0.16)))
# a fileira de cima: penas eriçadas para cima e para fora, atrás da cabeça (a gola alta do corvo)
for i in range(22):
    a = math.pi * 0.5 + math.pi * i / 21 + random.uniform(-0.04, 0.04)  # só atrás e dos lados
    rx, ry, z = mantle(0.04)
    out = Vector((math.sin(a), -math.cos(a), 0))
    root = Vector((math.sin(a) * rx, -math.cos(a) * ry + 0.02 * H, z - 0.02 * H))
    d = (out * 0.4 + Vector((0, 0, 0.9))).normalized()
    L = 0.16 * H * random.uniform(0.85, 1.15)
    pts = [root, root + d * L * 0.35, root + d * L * 0.75 + out * 0.01 * H, root + d * L + out * 0.025 * H]
    nf = (lambda o: (lambda p: o))(out)
    (fb if i % 3 == 0 else fa).append(rod(pts, [0.006 * H, 0.02 * H, 0.013 * H, 0.001 * H], 6, flat=(nf, 0.16)))
b.add('prop_feathersA', merge(*fa), plume, region='torso', weight_fn=cape_weights, subdiv=0)
b.add('prop_feathersB', merge(*fb), plume_lt, region='torso', weight_fn=cape_weights, subdiv=0)
b.group('prop_feathers', 'prop_feathers')

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'bran.blend'), check_existing=False)
