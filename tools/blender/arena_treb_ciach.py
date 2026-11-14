"""
VILAREJO DE TREB CIACH (A Vigília) — public/arenas/treb_ciach.glb. Pedido do dono 2026-11-14 ("Treb Ciach em duas
versões, uma normal do vilarejo e uma dele em forma pós tempestade"); referências em docs/REFERENCIAS-MAPAS.md §8 e
`Referencias visuais/Mapas/treb-ciach/` (o mapa desenhado da wiki, AV ep. 1 5h08 e AV ep. 2 0h07–0h23):
  - canon (wiki "Treb Ciach", AV ep. 1–2): vilarejo da Irlanda do ano 890; casas de barro, madeira, pedra e PALHA (o
    telhado grosso de palha, as chaminés de pedra); a GRANDE FOGUEIRA do Samhain onde se renova a CHAMA DE PROTEÇÃO;
    as tendas do festival; os NABOS de proteção nas portas (ep. 2: "os nabos não foram eficazes"); o muro de pedra com
    a CRUZ CELTA; floresta densa e montanhas em volta; o pântano dos Afogados ao lado;
  - a TEMPESTADE (ep. 2, "A Torre"): a nuvem azul engole a vila na noite do ritual; ao amanhecer a fogueira está
    APAGADA, sem resquício da chama, e tudo exala uma FUMAÇA AZULADA espectral; os Afogados sobem do pântano e
    arrastam gente (os rastros de lama); as tendas foram derrubadas e queimadas na defesa.
  - PROPOSTA: a PRAÇA em volta da fogueira é a arena (r ≈ 17); a fogueira no centro é o obstáculo.
O mesmo .glb serve as duas versões: o que é só de uma delas tem material próprio e a outra esconde (cfg.materials):
  fire_flame, tent_cloth, turnip_glow → só a noite do Samhain; tent_fallen, mud_trail → só depois da tempestade.
Feito à mão (sem kits). Coordenadas do jogo; a câmera começa em +z olhando o fundo (-z), onde fica a cruz celta.
  node tools/blender/build.mjs treb_ciach   → public/arenas/treb_ciach.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import bmesh
from mathutils import Vector
from arena_lib import *
from arena_lib import _obj_from_bmesh
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'treb_ciach.glb'
random.seed(890)  # o ano da Vigília
start()

M = {
    'grass': material('irish_grass', '#4a5a3a', 1),
    'mud': material('village_mud', '#4a3e30', 1),
    'path': material('trodden_path', '#5e5040', 1),
    'daub': material('wattle_daub', '#9a8a70', 1),
    'stone': material('field_stone', '#6e6c66', 1),
    'stone2': material('field_stone_dark', '#4e4c48', 1),
    'thatch': material('thatch_straw', '#8a7448', 1),
    'thatch2': material('thatch_old', '#6a5a3a', 1),
    'timber': material('oak_timber', '#3e2c1e', 0.9),
    'wood': material('rough_wood', '#5a4430', 0.95),
    'char': material('charred_log', '#1c1612', 1),
    'ember': material('ember_bed', '#5a2010', 0.8, emission='#ff4010', strength=0.6),
    'fire': material('fire_flame', '#ff9a30', 0.5, emission='#ff6a10', strength=2.6),
    'window': material('window_glow', '#3a2410', 0.8, emission='#ff9a40', strength=1.6),
    'tent': material('tent_cloth', '#8a7a62', 0.95),
    'tent2': material('tent_cloth_red', '#6a2a1e', 0.95),
    'fallen': material('tent_fallen', '#5a5040', 1),
    'turnip': material('turnip_glow', '#d8c8a0', 0.7, emission='#ff9a30', strength=2.2),
    'turnip_skin': material('turnip_skin', '#c8b8a0', 0.8),
    'hay': material('hay', '#a08a50', 1),
    'pine': material('pine_dark', '#24301e', 1),
    'pine2': material('pine_blue', '#2a3830', 1),
    'bark': material('pine_bark', '#2e241c', 1),
    'hill': material('hill_moor', '#3e4a3a', 1),
    'rock': material('mountain_rock', '#5a5e60', 1),
    'trail': material('mud_trail', '#2a2a22', 0.4),
    'iron': material('black_iron', '#2a2826', 0.6, metal=0.6),
    'rope': material('hemp_rope', '#7a6a4a', 1),
}
R_FIGHT = 17.0


def at(a, r):
    return math.sin(a) * r, math.cos(a) * r


def face_center(x, z):
    return math.atan2(-x, -z)


def strut(name, a, b, r, mat, seg=6):
    """cilindro de a até b (coordenadas do jogo)"""
    pa, pb = Vector(B(*a)), Vector(B(*b))
    d = pb - pa
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r, depth=d.length)
    o = _obj_from_bmesh(name, bm, mat)
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    o.location = (pa + pb) / 2
    return o


def gable(name, pos, w, d, h, mat, rot_y=0.0, jag=0.0):
    """telhado de duas águas: cumeeira ao longo de x (largura w), caindo para ±z (profundidade d), altura h.
    jag > 0: a borda de baixo desfiada (palha velha)"""
    bm = bmesh.new()
    hw, hd = w / 2, d / 2
    v = [bm.verts.new(p) for p in (
        (-hw, -hd, 0), (hw, -hd, 0), (hw, 0, h), (-hw, 0, h),   # a água de trás (y blender = -z jogo)
        (-hw, hd, 0), (hw, hd, 0))]
    bm.faces.new([v[0], v[1], v[2], v[3]])
    bm.faces.new([v[3], v[2], v[5], v[4]])
    bm.faces.new([v[0], v[3], v[4]])
    bm.faces.new([v[1], v[5], v[2]])
    bm.faces.new([v[0], v[4], v[5], v[1]])
    if jag:
        for vv in (v[0], v[1], v[4], v[5]):
            vv.co.z -= random.uniform(0, jag)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = _obj_from_bmesh(name, bm, mat)
    return place(o, pos, rot_y)


def cottage(name, x, z, w=6.0, d=4.6, rot=None, big=False):
    """a casa de barro e madeira com o telhado grosso de palha e a chaminé de pedra; o nabo aceso na porta"""
    ry = face_center(x, z) if rot is None else rot
    c, s = math.cos(ry), math.sin(ry)

    def loc(lx, lz):  # local (x ao longo da fachada, z para a frente = para a praça) → jogo
        return x + lx * c + lz * s, z - lx * s + lz * c

    hwall = 2.3 if not big else 2.7
    box(f'{name}_walls', (x, hwall / 2, z), (w, hwall, d), M['daub'], rot_y=ry)
    col_box(f'{name}', (x, hwall / 2, z), (w + 0.4, hwall, d + 0.4), rot_y=ry)
    # o enxaimel: os esteios de carvalho nas quinas e no meio
    for lx in (-w / 2, 0, w / 2):
        for lz in (-d / 2, d / 2):
            px, pz = loc(lx, lz)
            box(f'{name}_post{lx:.0f}{lz:.0f}', (px, hwall / 2, pz), (0.22, hwall, 0.22), M['timber'], rot_y=ry)
    px, pz = loc(0, d / 2 + 0.01)
    box(f'{name}_beam', (px, hwall - 0.1, pz), (w + 0.2, 0.2, 0.16), M['timber'], rot_y=ry)
    # a porta e a janelinha
    dx, dz = loc(-w * 0.18, d / 2 + 0.03)
    box(f'{name}_door', (dx, 0.95, dz), (1.0, 1.9, 0.08), M['wood'], rot_y=ry)
    wx, wz = loc(w * 0.25, d / 2 + 0.03)
    box(f'{name}_window', (wx, 1.5, wz), (0.7, 0.55, 0.06), M['window'], rot_y=ry)  # a luz da lareira lá dentro
    # o telhado de palha: grosso, descendo até perto do chão, com o beiral largo
    gable(f'{name}_roof', (x, hwall - 0.35, z), w + 1.2, d + 2.0, 2.6 if not big else 3.1, M['thatch' if random.random() < 0.6 else 'thatch2'], rot_y=ry, jag=0.35)
    # a chaminé de pedra num dos lados
    cx, cz = loc(w / 2 - 0.6, -d * 0.15)
    box(f'{name}_chimney', (cx, (hwall + 3.4) / 2, cz), (0.7, hwall + 3.4, 0.7), M['stone'], rot_y=ry)
    # o NABO de proteção aceso no degrau (a variante da tempestade apaga)
    tx, tz = loc(-w * 0.18 + 0.85, d / 2 + 0.45)
    sphere(f'{name}_turnip', (tx, 0.22, tz), (0.2, 0.22, 0.2), M['turnip'], seg=8, rings=6)
    sphere(f'{name}_turnipTop', (tx, 0.44, tz), (0.06, 0.08, 0.06), M['turnip_skin'], seg=5, rings=3)


def pine(name, x, z, h):
    strut(f'{name}_trunk', (x, 0, z), (x, h * 0.3, z), 0.22, M['bark'], seg=5)
    mat = M['pine' if random.random() < 0.7 else 'pine2']
    for j in range(3):
        y0 = h * (0.18 + j * 0.24)
        cyl(f'{name}_tier{j}', (x, y0, z), h * (0.32 - j * 0.08), h * 0.42, mat, seg=7, r_top=0.05)


def hay(name, x, z, ry):
    cyl(f'{name}', (x, 0, z), 0.55, 0.9, M['hay'], seg=10, rot_z=math.pi / 2, rot_y=ry)


def barrel(name, x, z):
    cyl(f'{name}', (x, 0, z), 0.38, 0.95, M['wood'], seg=10)
    cyl(f'{name}_hoop', (x, 0.7, z), 0.4, 0.06, M['iron'], seg=10)
    col_cyl(f'{name}', (x, 0, z), 0.4, 1.0)


# ================================================================ o chão: a grama da Irlanda, a terra batida da praça
cyl('GROUND_grass', (0, -0.3, 0), 140, 0.3, M['grass'], seg=64)
cyl('GROUND_square', (0, -0.29, 0), R_FIGHT + 2.5, 0.3, M['mud'], seg=48)
for k, (a, L) in enumerate(((0.0, 30), (math.pi * 0.55, 34), (math.pi * 1.3, 32))):  # os caminhos que saem da praça
    x, z = at(a, R_FIGHT + L / 2)
    box(f'GROUND_path{k}', (x, -0.005, z), (3.0, 0.02, L), M['path'], rot_y=a)

# ================================================================ a GRANDE FOGUEIRA no centro (a chama de proteção)
cyl('bonfire_ring', (0, 0, 0), 2.0, 0.35, M['stone2'], seg=16)
cyl('bonfire_bed', (0, 0.3, 0), 1.75, 0.08, M['ember'], seg=16)
col_cyl('bonfire', (0, 0, 0), 2.0, 2.0)
for k in range(14):  # os toros em pirâmide (carvão por baixo: a variante apagada mostra o mesmo monte)
    a = k / 14 * TAU + random.uniform(-0.1, 0.1)
    bx, bz = at(a, 1.5)
    strut(f'bonfire_log{k}', (bx, 0.3, bz), (bx * 0.12, 3.4 + random.uniform(-0.3, 0.4), bz * 0.12), 0.13, M['char' if k % 3 else 'wood'], seg=5)
for k in range(7):  # a CHAMA (só na noite do Samhain): línguas finas e tortas dentro da pirâmide de toros
    a = k / 7 * TAU + random.uniform(-0.2, 0.2)
    fx, fz = at(a, random.uniform(0.25, 0.6))
    cyl(f'FLICKER_flame{k}', (fx, 0.35, fz), random.uniform(0.28, 0.42), random.uniform(1.4, 2.4), M['fire'], seg=6, r_top=0.02,
        rot_x=random.uniform(-0.18, 0.18), rot_z=random.uniform(-0.18, 0.18))
cyl('FLICKER_flameCore', (0, 0.35, 0), 0.6, 2.7, M['fire'], seg=7, r_top=0.03)

# ================================================================ as CASAS em volta da praça (o mapa da wiki: as de
# palha na beira do caminho; a do fundo é a maior)
HOUSES = [(-0.15, 24, 8, 5.6, True), (0.75, 23, 6, 4.6, False), (1.35, 25, 6.5, 4.8, False), (2.2, 24, 6, 4.4, False),
          (-0.95, 23, 6.2, 4.6, False), (-1.7, 25, 7, 5, False), (2.75, 27, 5.5, 4.2, False)]
for k, (a, r, w, d, big) in enumerate(HOUSES):
    x, z = at(a + math.pi, r)  # o fundo (-z) é a = 0 aqui
    cottage(f'house{k}', x, z, w, d, big=big)

# ================================================================ o MURO DE PEDRA com a CRUZ CELTA (AV ep. 1 4h26)
for k in range(9):
    a = math.pi + (k - 4) * 0.075
    x, z = at(a, 20.2)
    box(f'wall{k}', (x, 0.55, z), (2.6, 1.1 + random.uniform(-0.1, 0.15), 0.8), M['stone' if k % 2 else 'stone2'], rot_y=a)
col_box('wall', (0, 0.6, -20.2), (21, 1.2, 1.0))
box('cross_shaft', (0, 2.2, -20.6), (0.5, 4.4, 0.32), M['stone'])
box('cross_arm', (0, 3.2, -20.6), (2.0, 0.42, 0.32), M['stone'])
cyl('cross_ring', (0, 3.2, -20.6 - 0.16), 0.78, 0.32, M['stone'], seg=16, rot_x=math.pi / 2, cap=False)
box('cross_base', (0, 0.3, -20.6), (1.2, 0.6, 0.9), M['stone2'])

# ================================================================ as TENDAS do festival (de pé no Samhain; derrubadas
# e queimadas depois da tempestade — Mael e Bran as jogaram sobre os Afogados)
TENTS = [(0.45, 19.5), (-0.5, 19.8), (1.9, 19.3), (-2.05, 19.6)]
for k, (a, r) in enumerate(TENTS):
    x, z = at(a, r)
    ry = face_center(x, z)
    # de pé: a lona em duas águas sobre o mastro (só na noite)
    gable(f'tent{k}', (x, 0, z), 3.2, 3.0, 2.5, M['tent' if k % 2 else 'tent2'], rot_y=ry + math.pi / 2)
    strut(f'tent{k}_pole', (x, 0, z), (x, 2.6, z), 0.06, M['tent' if k % 2 else 'tent2'], seg=4)
    # caída: a lona no chão, rasgada, com os paus quebrados (só depois da tempestade)
    box(f'tentDown{k}', (x, 0.08, z), (3.4, 0.12, 2.8), M['fallen'], rot_y=ry + random.uniform(-0.4, 0.4), rot_x=random.uniform(-0.08, 0.08))
    for j in range(2):
        a2 = random.uniform(0, TAU)
        strut(f'tentDown{k}_stick{j}', (x + math.cos(a2) * 0.4, 0.15, z + math.sin(a2) * 0.4), (x + math.cos(a2) * 1.8, 0.3, z + math.sin(a2) * 1.8), 0.05, M['fallen'], seg=4)

# ================================================================ os adereços da praça (fora do meio da luta)
for k in range(6):
    a = random.uniform(0, TAU)
    x, z = at(a, random.uniform(18.5, 21))
    hay(f'hay{k}', x, z, random.uniform(0, TAU))
for k, a in enumerate((0.95, -1.15, 2.5)):
    x, z = at(a, 18.4)
    barrel(f'barrel{k}', x, z)
# os nabos em estacas em volta da praça (a proteção do Samhain)
for k in range(10):
    a = (k + 0.5) / 10 * TAU
    x, z = at(a, R_FIGHT + 0.8)
    strut(f'stake{k}', (x, 0, z), (x, 1.2, z), 0.04, M['wood'], seg=4)
    sphere(f'stakeTurnip{k}', (x, 1.32, z), (0.17, 0.19, 0.17), M['turnip'], seg=8, rings=6)
# a carroça
box('cart_bed', (11.5, 0.75, 15.8), (2.6, 0.18, 1.4), M['wood'], rot_y=0.6)
for k, (dx, dz) in enumerate(((-0.9, -0.8), (0.9, 0.8))):
    cyl(f'cart_wheel{k}', (11.5 + dx * math.cos(0.6) + dz * math.sin(0.6) * 0.0, 0.0, 15.8 + dz), 0.5, 0.1, M['timber'], seg=12, rot_x=math.pi / 2, rot_y=0.6)
strut('cart_shaft', (10.6, 0.7, 16.9), (9.4, 0.4, 18.3), 0.06, M['wood'], seg=4)
col_box('cart', (11.5, 0.6, 15.8), (2.8, 1.2, 1.8), rot_y=0.6)

# ================================================================ os RASTROS DE LAMA do pântano (só depois da
# tempestade): os Afogados vieram do lado oeste (−x) e arrastaram gente de volta
for k in range(5):
    z0 = random.uniform(-10, 10)
    x = -R_FIGHT - 6
    zz = z0
    for j in range(9):
        x += random.uniform(2.0, 2.8)
        zz += random.uniform(-0.9, 0.9)
        box(f'DECAL_trail{k}_{j}', (x, 0.012, zz), (random.uniform(1.6, 2.6), 0.01, random.uniform(0.35, 0.6)), M['trail'], rot_y=math.pi / 2 + random.uniform(-0.3, 0.3))
        if x > -4:
            break

# ================================================================ a FLORESTA DENSA e as MONTANHAS em volta
for k in range(140):
    a = random.uniform(0, TAU)
    r = random.uniform(32, 70)
    x, z = at(a, r)
    if abs(x) < 3 and z > 30:  # o caminho do fundo da câmera fica livre
        continue
    pine(f'pine{k}', x, z, random.uniform(7, 15))
for k in range(22):
    a = (k + 0.5) / 22 * TAU + random.uniform(-0.1, 0.1)
    x, z = at(a, random.uniform(95, 120))
    sphere(f'hill{k}', (x, -4, z), (random.uniform(22, 34), random.uniform(14, 30), random.uniform(16, 24)), M['hill' if k % 3 else 'rock'], seg=10, rings=6)

finalize(OUT)
