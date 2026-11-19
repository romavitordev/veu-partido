"""
VILAREJO DE TREB CIACH (A Vigília) — public/arenas/treb_ciach.glb. Pedido do dono 2026-11-14 ("Treb Ciach em duas
versões, uma normal do vilarejo e uma dele em forma pós tempestade"; depois: "a versão normal de dia, céu cinza, sem
sol, nublado e névoa por todos os lugares; a pós-tempestade de noite, com aquela aura azul fantasmagórica"; "lembre da
fogueira com a chama de proteção e com o símbolo com o osso de cervo no topo"). Referências em
docs/REFERENCIAS-MAPAS.md §8 e `Referencias visuais/Mapas/treb-ciach/`:
  - o MAPA da wiki (wiki/Mapa_de_Treb_Ciach.png, Vila_de_Treb_Ciach.png): a vila cortada por um RIACHO com cerca de
    madeira; casas COMPRIDAS de enxaimel com telhado de palha íngreme, galhos cruzados nas pontas da cumeeira e chaminé
    de pedra; a horta cercada; o quadro de avisos; pinheiros entre as casas; caminhos de terra ligando tudo;
  - AV ep. 1 5h08 (casas de palha na névoa: enxaimel escuro, reboco claro, palha grossa com musgo, mato alto),
    5h39 (a rua de PEDRA entre as casas, com lanterna), 5h40–5h43 (a FOGUEIRA: uma torre alta de toras coberta de
    panos e peles, estacas em volta e, no topo, o SÍMBOLO — uma roda de madeira escura com raios e CHIFRES curvos para
    fora, e o CRÂNIO DE CERVO com galhada no meio);
  - AV ep. 2 0h07–0h23 (a tempestade azul engole as casas; depois, tudo exala FUMAÇA AZULADA espectral; a fogueira
    APAGADA; as tendas derrubadas; os rastros de lama dos Afogados).
  - PROPOSTA: a PRAÇA em volta da fogueira é a arena (r ≈ 17); a fogueira-torre no centro é o obstáculo; o riacho e a
    ponte ficam a leste, fora da luta; a disposição das casas.
O mesmo .glb serve as duas versões: o que é só de uma delas tem material próprio e a outra esconde (cfg.materials):
  fire_flame e torch_flame → só no Samhain (a tempestade apaga); mud_trail → só depois da tempestade.
  Sem barracas (dono: "não tem barracas de acampamento em Treb Ciach"); a cultura é a da Irlanda de 890: casas de
  enxaimel e palha, tochas e lanternas de ferro, ossos e peles no ritual.
As texturas (grama, lama, pedra da rua, reboco, palha, carvalho, pedra, osso, couro) são pintadas no jogo pelo nome
do material (src/arena/arenaTextures.js). Feito à mão (sem kits). Coordenadas do jogo; a câmera começa em +z olhando o
fundo (-z), onde fica a cruz celta.
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
    'tuft': material('grass_tuft', '#55663e', 1),
    'mud': material('village_mud', '#4a3e30', 1),
    'cobble': material('cobble_street', '#6a6458', 1),
    'sigil': material('protection_sigil', '#ffffff', 0.6, alpha=0.99),  # fundo transparente: só o desenho dourado
    'creek': material('creek_water', '#2a3436', 0.1, metal=0.25),
    'daub': material('wattle_daub', '#b8ae96', 1),
    'stone': material('field_stone', '#6e6c66', 1),
    'stone2': material('field_stone_dark', '#4e4c48', 1),
    'thatch': material('thatch_straw', '#8a7448', 1),
    'thatch2': material('thatch_old', '#6a5a3a', 1),
    'moss': material('thatch_moss', '#4a5230', 1),
    'timber': material('oak_timber', '#3e2c1e', 0.9),
    'wood': material('rough_wood', '#5a4430', 0.95),
    'char': material('charred_log', '#1c1612', 1),
    'hide': material('hide_drape', '#3a2c22', 0.95),
    'bone': material('bone_skull', '#d8ccb0', 0.7),
    'socket': material('skull_socket', '#0e0a08', 1),
    'ember': material('ember_bed', '#5a2010', 0.8, emission='#ff4010', strength=0.6),
    'fire': material('fire_flame', '#ffe070', 0.5, emission='#ffd020', strength=2.8),  # a chama de proteção é AMARELA (dono)
    'torch': material('torch_flame', '#ffb050', 0.5, emission='#ff7a20', strength=2.4),
    'window': material('window_glow', '#3a2410', 0.8, emission='#ff9a40', strength=1.6),
    'turnip': material('turnip_glow', '#d8c8a0', 0.7, emission='#ff9a30', strength=2.2),
    'turnip_skin': material('turnip_skin', '#c8b8a0', 0.8),
    'hay': material('hay', '#a08a50', 1),
    # a AURA da noite pós-tempestade (print do ep. mandado pelo dono): flores e mato que brilham em ciano no escuro; de dia
    # as flores são brancas e não brilham (cfg.materials)
    'flower': material('ghost_flower', '#e8f8ff', 0.6, emission='#5ae8ff', strength=1.6),
    'flower2': material('flower_yellow', '#e0c84a', 0.8),
    'birch': material('birch_bark', '#d4d4cc', 0.9),
    'leaf': material('birch_leaf', '#3a5a34', 1),
    'crop': material('crop_leaf', '#3e5a2a', 1),
    'pine': material('pine_dark', '#24301e', 1),
    'pine2': material('pine_blue', '#2a3830', 1),
    'bark': material('pine_bark', '#2e241c', 1),
    'hill': material('hill_moor', '#3e4a3a', 1),
    'rock': material('mountain_rock', '#5a5e60', 1),
    'trail': material('mud_trail', '#2a2a22', 0.4),
    'iron': material('black_iron', '#2a2826', 0.6, metal=0.6),
    # AV ep. 3 (o Samhain à noite, prints AV03_*): a LAMPARINA da porta de cada casa, que recebe a Chama de Proteção
    # (acesa no Samhain; apagada depois da tempestade, cfg.materials), e os CORDÕES de globos de vidro colorido
    'protect_lamp': material('protect_lamp', '#ffe8a0', 0.5, emission='#ffc840', strength=2.0),
    'glass_blue': material('lamp_glass_blue', '#9ad0ff', 0.3, emission='#5ab0ff', strength=1.4),
    'glass_amber': material('lamp_glass_amber', '#ffd890', 0.3, emission='#ffb040', strength=1.4),
    'glass_rose': material('lamp_glass_rose', '#ffc0d8', 0.3, emission='#ff7aa8', strength=1.2),
}
R_FIGHT = 19.0
# os caminhos de pedra que saem da praça (ângulo do jogo: x = sen a·r, z = cos a·r): para a câmera (+z), para a ponte
# do riacho (leste, +x) e para os fundos à esquerda
PATHS = (0.0, math.pi / 2, math.pi + 0.78)
CREEK_X = 37.0


def at(a, r):
    return math.sin(a) * r, math.cos(a) * r


def face_center(x, z):
    return math.atan2(-x, -z)


def near_path(a, gap):
    return any(abs((a - p + math.pi) % TAU - math.pi) < gap for p in PATHS)


def strut(name, a, b, r, mat, seg=6, r2=None):
    """cilindro (ou cone, com r2) de a até b (coordenadas do jogo)"""
    pa, pb = Vector(B(*a)), Vector(B(*b))
    d = pb - pa
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d.length)
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
        (-hw, -hd, 0), (hw, -hd, 0), (hw, 0, h), (-hw, 0, h),
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


def cottage(name, x, z, w=8.0, d=4.8, big=False, rot=None):
    """a casa COMPRIDA de enxaimel (AV ep. 1 5h08 e o mapa da wiki): base de pedra, reboco claro entre as vigas
    escuras com as mãos-francesas em diagonal, telhado de palha grosso e íngreme com a cumeeira de musgo e os galhos
    cruzados nas pontas, chaminé de pedra; a porta de tábuas, a janelinha acesa com as portadas abertas, o nabo de
    proteção no degrau"""
    ry = face_center(x, z) if rot is None else rot
    c, s = math.cos(ry), math.sin(ry)

    def P(lx, y, lz):  # local (x ao longo da fachada, z para a frente = para a praça) → jogo
        return (x + lx * c + lz * s, y, z - lx * s + lz * c)

    hw, hd = w / 2, d / 2
    plinth = 0.5
    hwall = 2.5 if not big else 2.9
    box(f'{name}_plinth', P(0, plinth / 2, 0), (w + 0.16, plinth, d + 0.16), M['stone2'], rot_y=ry)
    box(f'{name}_walls', P(0, (plinth + hwall) / 2, 0), (w, hwall - plinth, d), M['daub'], rot_y=ry)
    col_box(f'{name}', P(0, hwall / 2, 0), (w + 0.6, hwall, d + 0.6), rot_y=ry)
    T = M['timber']
    # o ENXAIMEL: frechal, travessa do meio e soleira nas quatro faces; esteios a cada ~1,6 m; mãos-francesas
    for lz in (-hd - 0.05, hd + 0.05):
        for y in (plinth + 0.08, 1.45, hwall - 0.09):
            box(f'{name}_rail{lz:.0f}{y:.1f}', P(0, y, lz), (w + 0.1, 0.17, 0.1), T, rot_y=ry)
        n = max(3, round(w / 1.6))
        for i in range(n + 1):
            lx = -hw + i * w / n
            box(f'{name}_post{lz:.0f}{i}', P(lx, (plinth + hwall) / 2, lz), (0.18, hwall - plinth, 0.1), T, rot_y=ry)
            if i < n and i % 2 == 0:  # a diagonal na baia (as de cima e as de baixo alternam o lado)
                x0, x1 = lx, lx + w / n
                strut(f'{name}_brace{lz:.0f}{i}a', P(x0 + 0.08, plinth + 0.1, lz), P(x1 - 0.08, 1.4, lz), 0.065, T, seg=4)
                strut(f'{name}_brace{lz:.0f}{i}b', P(x1 - 0.08, 1.5, lz), P(x0 + 0.08, hwall - 0.12, lz), 0.065, T, seg=4)
    for lx in (-hw - 0.05, hw + 0.05):
        for y in (plinth + 0.08, 1.45, hwall - 0.09):
            box(f'{name}_srail{lx:.0f}{y:.1f}', P(lx, y, 0), (0.1, 0.17, d + 0.1), T, rot_y=ry)
        for lz in (-hd, 0, hd):
            box(f'{name}_spost{lx:.0f}{lz:.0f}', P(lx, (plinth + hwall) / 2, lz), (0.1, hwall - plinth, 0.18), T, rot_y=ry)
        strut(f'{name}_sbrace{lx:.0f}', P(lx, plinth + 0.1, -hd + 0.1), P(lx, hwall - 0.12, -0.1), 0.065, T, seg=4)
    # a porta de tábuas com o batente e a janelinha acesa com as portadas abertas
    dx = -w * 0.22
    box(f'{name}_door', P(dx, plinth + 0.95, hd + 0.08), (1.0, 1.9, 0.08), M['wood'], rot_y=ry)
    box(f'{name}_lintel', P(dx, plinth + 1.95, hd + 0.1), (1.3, 0.2, 0.14), T, rot_y=ry)
    box(f'{name}_step', P(dx, 0.12, hd + 0.5), (1.3, 0.24, 0.7), M['stone'], rot_y=ry)
    for k, wx in enumerate((w * 0.18, -w * 0.4) if w > 7 else (w * 0.22,)):
        box(f'{name}_window{k}', P(wx, 1.75, hd + 0.07), (0.75, 0.6, 0.06), M['window'], rot_y=ry)  # a luz da lareira
        for sx in (-1, 1):
            box(f'{name}_shutter{k}{sx}', P(wx + sx * 0.62, 1.75, hd + 0.12), (0.4, 0.66, 0.05), M['wood'], rot_y=ry + sx * 0.25)
    # o TELHADO DE PALHA grosso e íngreme, descendo até perto do chão, com o beiral largo
    rh = 3.2 if not big else 3.8
    y0 = hwall - 0.4
    gable(f'{name}_roof', P(0, y0, 0), w + 1.1, d + 2.2, rh, M['thatch' if random.random() < 0.55 else 'thatch2'], rot_y=ry, jag=0.4)
    # a cumeeira de musgo (palha dobrada) e os GALHOS CRUZADOS nas pontas (o mapa da wiki)
    ytop = y0 + rh
    box(f'{name}_ridge', P(0, ytop - 0.12, 0), (w + 1.2, 0.42, 0.42), M['moss'], rot_y=ry, rot_x=math.pi / 4)
    for lx in (-(w + 1.1) / 2, (w + 1.1) / 2):
        strut(f'{name}_cross{lx:.0f}a', P(lx, ytop - 0.45, -0.45), P(lx, ytop + 0.7, 0.55), 0.06, T, seg=4)
        strut(f'{name}_cross{lx:.0f}b', P(lx, ytop - 0.45, 0.45), P(lx, ytop + 0.7, -0.55), 0.06, T, seg=4)
    # a chaminé de pedra
    cx = hw - 1.0
    box(f'{name}_chimney', P(cx, (hwall + 4.4) / 2, -0.6), (0.8, hwall + 4.4, 0.8), M['stone'], rot_y=ry)
    box(f'{name}_chimneyCap', P(cx, hwall + 4.45, -0.6), (1.0, 0.18, 1.0), M['stone2'], rot_y=ry)
    # a lenha empilhada na parede do lado
    if random.random() < 0.6:
        for i in range(4):
            for j in range(3 - i // 2):
                lz = -1.4 + j * 0.27 + (i % 2) * 0.13
                strut(f'{name}_logpile{i}{j}', P(-hw - 0.75, 0.13 + i * 0.23, lz), P(-hw - 0.12, 0.13 + i * 0.23, lz), 0.12, M['wood'], seg=6)
    # o NABO de proteção aceso no degrau
    tx = dx + 0.85
    sphere(f'{name}_turnip', P(tx, 0.22, hd + 0.5), (0.2, 0.22, 0.2), M['turnip'], seg=8, rings=6)
    sphere(f'{name}_turnipTop', P(tx, 0.44, hd + 0.5), (0.06, 0.08, 0.06), M['turnip_skin'], seg=5, rings=3)
    # o PÓRTICO de madeira na frente da porta, fora do beiral, com a GALHADA de cervo clara em cima e a LAMPARINA da
    # Chama de Proteção pendurada (AV ep. 3 2h48: a entrada com os chifres brancos; 0h56: de porta em porta)
    gz = hd + 1.55
    for sx in (-1, 1):
        strut(f'{name}_gatePost{sx}', P(dx + sx * 0.8, 0, gz), P(dx + sx * 0.8, 2.45, gz), 0.08, T, seg=5)
    box(f'{name}_gateBeam', P(dx, 2.45, gz), (2.0, 0.18, 0.18), T, rot_y=ry)
    ay = 2.55
    box(f'{name}_antlerPlate', P(dx, ay, gz), (0.36, 0.24, 0.16), M['bone'], rot_y=ry)
    for sx in (-1, 1):
        b0 = P(dx + sx * 0.12, ay + 0.05, gz)
        b1 = P(dx + sx * 0.5, ay + 0.45, gz + 0.05)
        b2 = P(dx + sx * 0.7, ay + 1.0, gz)
        strut(f'{name}_antler{sx}a', b0, b1, 0.045, M['bone'], seg=4, r2=0.035)
        strut(f'{name}_antler{sx}b', b1, b2, 0.035, M['bone'], seg=4, r2=0.014)
        for t, (ox, oy) in enumerate(((0.05, 0.38), (0.22, 0.34), (-0.04, 0.3))):
            base = P(dx + sx * (0.38 + t * 0.12), ay + 0.32 + t * 0.25, gz + 0.03)
            tip = P(dx + sx * (0.38 + t * 0.12 + ox), ay + 0.32 + t * 0.25 + oy, gz + 0.06)
            strut(f'{name}_tine{sx}{t}', base, tip, 0.025, M['bone'], seg=4, r2=0.008)
    lx_ = dx + 0.8
    strut(f'{name}_lampArm', P(lx_, 2.2, gz), P(lx_ + 0.5, 2.2, gz), 0.025, M['iron'], seg=4)
    for k_, yy in enumerate((2.12, 1.78)):  # a tampa e a base de ferro; o vidro aceso à mostra entre elas
        box(f'{name}_lampCage{k_}', P(lx_ + 0.45, yy, gz), (0.26, 0.05, 0.26), M['iron'], rot_y=ry)
    box(f'{name}_lampGlow', P(lx_ + 0.45, 1.95, gz), (0.2, 0.3, 0.2), M['protect_lamp'], rot_y=ry)


def pine(name, x, z, h):
    strut(f'{name}_trunk', (x, 0, z), (x, h * 0.3, z), 0.22, M['bark'], seg=5)
    mat = M['pine' if random.random() < 0.7 else 'pine2']
    for j in range(3):
        y0 = h * (0.18 + j * 0.24)
        cyl(f'{name}_tier{j}', (x, y0, z), h * (0.32 - j * 0.08), h * 0.42, mat, seg=7, r_top=0.05)


def gnarled(name, x, z, h):
    """a árvore velha e torta sem folhas (o mapa: a Árvore Anciã; as da vila são menores)"""
    top = (x + random.uniform(-0.6, 0.6), h * 0.55, z + random.uniform(-0.6, 0.6))
    strut(f'{name}_trunk', (x, 0, z), top, 0.35, M['bark'], seg=6, r2=0.22)
    for k in range(5):
        a = k / 5 * TAU + random.uniform(-0.4, 0.4)
        L = random.uniform(1.8, 3.2)
        mid = (top[0] + math.cos(a) * L * 0.6, top[1] + random.uniform(0.6, 1.4), top[2] + math.sin(a) * L * 0.6)
        strut(f'{name}_br{k}', top, mid, 0.14, M['bark'], seg=5, r2=0.08)
        end = (mid[0] + math.cos(a + 0.5) * L * 0.5, mid[1] + random.uniform(0.2, 1.0), mid[2] + math.sin(a + 0.5) * L * 0.5)
        strut(f'{name}_tw{k}', mid, end, 0.08, M['bark'], seg=4, r2=0.02)


def hay(name, x, z, ry):
    cyl(f'{name}', (x, 0, z), 0.55, 0.9, M['hay'], seg=10, rot_z=math.pi / 2, rot_y=ry)


def barrel(name, x, z):
    cyl(f'{name}', (x, 0, z), 0.38, 0.95, M['wood'], seg=10)
    cyl(f'{name}_hoop', (x, 0.7, z), 0.4, 0.06, M['iron'], seg=10)
    col_cyl(f'{name}', (x, 0, z), 0.4, 1.0)


def wattle(name, a0, a1, r, h=1.0):
    """a cerca de varas trançadas (pau a pique) num arco de a0 a a1"""
    n = max(2, int(abs(a1 - a0) * r / 0.55))
    for i in range(n + 1):
        x, z = at(a0 + (a1 - a0) * i / n, r)
        strut(f'{name}_stake{i}', (x, 0, z), (x + random.uniform(-0.04, 0.04), h + random.uniform(-0.05, 0.12), z), 0.045, M['wood'], seg=4)
        if i < n:
            x2, z2 = at(a0 + (a1 - a0) * (i + 1) / n, r)
            for j, y in enumerate((0.3, 0.55, 0.8)):
                strut(f'{name}_weave{i}_{j}', (x, y * h + 0.03 * (i % 2), z), (x2, y * h - 0.03 * (i % 2), z2), 0.04, M['wood'], seg=4)


def fence_line(name, p0, p1, h=1.1):
    """a cerca de varas do riacho: mourões e duas réguas"""
    x0, z0 = p0
    x1, z1 = p1
    L = math.hypot(x1 - x0, z1 - z0)
    n = max(1, int(L / 2.2))
    for i in range(n + 1):
        t = i / n
        x, z = x0 + (x1 - x0) * t, z0 + (z1 - z0) * t
        strut(f'{name}_post{i}', (x, 0, z), (x, h + random.uniform(-0.1, 0.1), z), 0.07, M['timber'], seg=5)
    for j, y in enumerate((0.45, 0.9)):
        strut(f'{name}_rail{j}', (x0, y * h, z0), (x1, y * h + random.uniform(-0.05, 0.05), z1), 0.045, M['wood'], seg=4)


# ================================================================ o CHÃO: grama irlandesa, a lama da praça, a PEDRA
# das ruas (AV ep. 1 5h39), as poças
cyl('GROUND_grass', (0, -0.3, 0), 140, 0.3, M['grass'], seg=64)
cyl('GROUND_square', (0, -0.29, 0), R_FIGHT + 3.0, 0.3, M['mud'], seg=48)
cyl('GROUND_plaza', (0, -0.28, 0), 7.0, 0.3, M['cobble'], seg=40)  # o calçamento em volta da fogueira
for k, a in enumerate(PATHS):
    L = 30 if a != math.pi / 2 else CREEK_X - R_FIGHT + 12
    x, z = at(a, R_FIGHT + L / 2 - 1)
    box(f'GROUND_path{k}', (x, -0.005, z), (3.2, 0.03, L), M['cobble'], rot_y=a)
    x, z = at(a, (R_FIGHT + 7.0) / 2 + 0.5)
    box(f'GROUND_pathIn{k}', (x, -0.01, z), (2.6, 0.02, R_FIGHT - 7.0 + 3), M['cobble'], rot_y=a)  # a rua até o meio
# o SÍMBOLO DO RITUAL da chama de proteção, em DOURADO no chão em volta da fogueira (dono: "faltou o símbolo do ritual
# da chama de proteção em dourado no chão em volta da fogueira"); a textura brilhante é pintada no jogo
# (arenaTextures.js, protection_sigil). PROPOSTA o desenho: anéis, sigilos e raios
plane('DECAL_protectionSigil', (0, 0.03, 0), (17.6, 17.6), M['sigil'], facing='up')
for k in range(40):  # as pedras soltas e o mato alto na beira da praça
    a = random.uniform(0, TAU)
    x, z = at(a, random.uniform(R_FIGHT + 0.5, R_FIGHT + 4.5))
    sphere(f'pebble{k}', (x, 0.02, z), (random.uniform(0.15, 0.4), random.uniform(0.08, 0.18), random.uniform(0.15, 0.35)), M['stone' if k % 2 else 'stone2'], seg=6, rings=4)
for k in range(150):
    a = random.uniform(0, TAU)
    r = random.uniform(R_FIGHT + 1, 34)
    if near_path(a, 0.07):
        continue
    x, z = at(a, r)
    for j in range(3):
        cyl(f'tuft{k}_{j}', (x + random.uniform(-0.3, 0.3), 0, z + random.uniform(-0.3, 0.3)), random.uniform(0.1, 0.18), random.uniform(0.4, 0.9), M['tuft'], seg=4, r_top=0.0,
            rot_x=random.uniform(-0.3, 0.3), rot_z=random.uniform(-0.3, 0.3))

# ================================================================ a GRANDE FOGUEIRA (AV ep. 1 5h40–5h43; dono: "a fogueira é
# bem maior, com ossos, um símbolo de ossos no topo com um crânio de cervo"): a torre ALTA de toras em grade sobre um
# monte de ossos, varões em pirâmide cobertos de peles com ossos e crânios pendurados, a chama de proteção acesa por baixo
# e, no topo, o SÍMBOLO — a roda com raios de OSSO, os chifres curvos e o crânio de cervo com a galhada
PR = 4.4  # raio da base (o obstáculo do meio da luta)
cyl('bonfire_ring', (0, 0, 0), PR + 0.3, 0.45, M['stone2'], seg=24)
cyl('bonfire_bed', (0, 0.4, 0), PR, 0.1, M['ember'], seg=24)
col_cyl('bonfire', (0, 0, 0), PR + 0.4, 4.0)
for i in range(14):  # a fogueira em grade: camadas de toras grossas cruzadas, afinando para cima
    y = 0.65 + i * 0.42
    half = 3.0 - i * 0.16
    for j in (-1, 0, 1):
        if j == 0 and i % 3:
            continue
        L = half + 0.45
        mat = M['char' if (i + j) % 3 == 0 else 'wood']
        if i % 2 == 0:
            strut(f'crib{i}{j}', (j * half, y, -L), (j * half, y, L), 0.24, mat, seg=6)
        else:
            strut(f'crib{i}{j}', (-L, y, j * half), (L, y, j * half), 0.24, mat, seg=6)
# os OSSOS amontoados em volta da base (fêmures, costelas e crânios — as oferendas do Samhain; PROPOSTA a disposição)
for k in range(46):
    a = random.uniform(0, TAU)
    r = random.uniform(PR - 1.0, PR + 0.15)
    x, z = at(a, r)
    t = random.uniform(0, TAU)
    L = random.uniform(0.5, 1.1)
    y = 0.45 + random.uniform(0, 0.35)
    strut(f'pileBone{k}', (x - math.cos(t) * L / 2, y, z - math.sin(t) * L / 2), (x + math.cos(t) * L / 2, y + random.uniform(-0.1, 0.2), z + math.sin(t) * L / 2), 0.06, M['bone'], seg=5)
    if k % 3 == 0:
        sphere(f'pileKnob{k}', (x + math.cos(t) * L / 2, y, z + math.sin(t) * L / 2), (0.1, 0.09, 0.1), M['bone'], seg=6, rings=4)
for k in range(9):  # crânios no monte
    a = k / 9 * TAU + random.uniform(-0.2, 0.2)
    x, z = at(a, PR - 0.35)
    sphere(f'pileSkull{k}', (x, 0.72, z), (0.24, 0.2, 0.26), M['bone'], seg=8, rings=6)
    for sx in (-1, 1):
        ex, ez = at(a + sx * 0.05, PR - 0.12)
        sphere(f'pileSkullEye{k}{sx}', (ex, 0.76, ez), (0.06, 0.06, 0.04), M['socket'], seg=5, rings=3)
# os varões em pirâmide por cima da grade, cobertos de peles, com ossos amarrados
TOP = 6.4
for k in range(14):
    a = k / 14 * TAU
    bx, bz = at(a, 2.4)
    strut(f'bonfire_pole{k}', (bx, TOP - 0.6, bz), (bx * 0.04, 12.0, bz * 0.04), 0.13, M['timber'], seg=5)
cyl('bonfire_drape', (0, TOP - 0.6, 0), 2.5, 5.2, M['hide'], seg=9, r_top=0.35)
for k in range(9):  # as tiras de pele caindo
    a = k / 9 * TAU + 0.3
    bx, bz = at(a, 2.55)
    box(f'bonfire_strip{k}', (bx, TOP - 0.8, bz), (0.8, 2.4, 0.06), M['hide'], rot_y=a, rot_x=0.22)
for k in range(10):  # os ossos longos amarrados em cruz nos varões e os crânios pendurados
    a = (k + 0.5) / 10 * TAU
    bx, bz = at(a, 2.25 - 0.08 * (k % 3))
    y = TOP + 0.6 + (k % 3) * 1.1
    for sgn in (-1, 1):
        tx, tz = math.cos(a) * 0.45 * sgn, -math.sin(a) * 0.45 * sgn
        strut(f'tiedBone{k}{sgn}', (bx - tx, y - 0.45, bz - tz), (bx + tx, y + 0.45, bz + tz), 0.07, M['bone'], seg=5)
    if k % 2 == 0:
        hx, hz = at(a, 2.65)
        sphere(f'hangSkull{k}', (hx, y - 0.9, hz), (0.22, 0.24, 0.24), M['bone'], seg=8, rings=6)
        strut(f'hangRope{k}', (hx, y - 0.65, hz), (hx * 0.92, y + 0.1, hz * 0.92), 0.025, M['hay'], seg=4)
# o mastro e o SÍMBOLO DE OSSO no topo, virado para a câmera (+z)
SY, SR = 14.2, 2.6  # centro e raio da roda
strut('symbol_mast', (0, 10.5, -0.2), (0, SY + SR + 0.4, -0.2), 0.16, M['timber'], seg=6)
NR = 24
for k in range(NR):  # a roda: o aro de madeira escura amarrada, com costelas presas
    a0, a1 = k / NR * TAU, (k + 1) / NR * TAU
    strut(f'symbol_rim{k}', (math.sin(a0) * SR, SY + math.cos(a0) * SR, 0), (math.sin(a1) * SR, SY + math.cos(a1) * SR, 0), 0.16, M['timber'], seg=6)
    if k % 2 == 0:
        am = (a0 + a1) / 2
        strut(f'symbol_rib{k}', (math.sin(am) * (SR - 0.35), SY + math.cos(am) * (SR - 0.35), 0.1), (math.sin(am + 0.12) * (SR + 0.1), SY + math.cos(am + 0.12) * (SR + 0.1), 0.12), 0.05, M['bone'], seg=4)
for k in range(8):  # os raios de OSSO (fêmures com as pontas grossas)
    a = k / 8 * TAU + 0.2
    p0 = (math.sin(a) * 0.45, SY + math.cos(a) * 0.45, 0.02)
    p1 = (math.sin(a) * (SR - 0.1), SY + math.cos(a) * (SR - 0.1), 0.02)
    strut(f'symbol_spoke{k}', p0, p1, 0.08, M['bone'], seg=5)
    sphere(f'symbol_knob{k}', p1, (0.15, 0.15, 0.13), M['bone'], seg=6, rings=4)
for k in range(14):  # os CHIFRES curvos apontando para fora, todos torcendo para o mesmo lado
    a = k / 14 * TAU + 0.13
    u = (math.sin(a), math.cos(a))
    t = (math.cos(a), -math.sin(a))
    sc = 1.0 + 0.25 * (k % 2)
    pts = [(SR - 0.05 + d * 0.62 * sc, d * d * 0.16 * sc) for d in range(5)]
    for j in range(4):
        (r0, s0), (r1, s1) = pts[j], pts[j + 1]
        p0 = (u[0] * r0 + t[0] * s0, SY + u[1] * r0 + t[1] * s0, 0.03)
        p1 = (u[0] * r1 + t[0] * s1, SY + u[1] * r1 + t[1] * s1, 0.03)
        strut(f'symbol_horn{k}_{j}', p0, p1, 0.13 - j * 0.028, M['bone'], seg=5, r2=0.13 - (j + 1) * 0.028)
# o CRÂNIO DE CERVO no meio (o focinho para baixo, as órbitas fundas) e a GALHADA
K = 1.6  # maior, para ler de longe
sphere('skull_cranium', (0, SY + 0.25 * K, 0.18 * K), (0.3 * K, 0.3 * K, 0.26 * K), M['bone'], seg=12, rings=8)
strut('skull_snout', (0, SY + 0.05 * K, 0.26 * K), (0, SY - 0.75 * K, 0.34 * K), 0.17 * K, M['bone'], seg=8, r2=0.07 * K)
for sx in (-1, 1):
    sphere(f'skull_eye{sx}', (sx * 0.16 * K, SY + 0.15 * K, 0.38 * K), (0.08 * K, 0.09 * K, 0.05 * K), M['socket'], seg=6, rings=4)
    sphere(f'skull_nose{sx}', (sx * 0.04 * K, SY - 0.68 * K, 0.42 * K), (0.03 * K, 0.06 * K, 0.02 * K), M['socket'], seg=5, rings=3)
    base = (sx * 0.18 * K, SY + 0.48 * K, 0.12 * K)
    beam = [base, (sx * 0.55 * K, SY + 1.0 * K, 0.05), (sx * 0.8 * K, SY + 1.6 * K, 0.0), (sx * 0.75 * K, SY + 2.25 * K, -0.05)]
    for j in range(3):
        strut(f'antler{sx}_{j}', beam[j], beam[j + 1], (0.07 - j * 0.015) * K, M['bone'], seg=5, r2=(0.055 - j * 0.015) * K)
    for j, (p, d) in enumerate(((beam[1], (sx * -0.1, 0.55)), (beam[2], (sx * 0.45, 0.4)), (beam[2], (sx * -0.3, 0.5)))):
        strut(f'antlerTine{sx}_{j}', p, (p[0] + d[0] * K, p[1] + d[1] * K, p[2] + 0.05), 0.045 * K, M['bone'], seg=4, r2=0.012 * K)
# a CHAMA DE PROTEÇÃO (só no Samhain): AMARELA (dono: "a chama de proteção é amarela e com sigilos de energia saindo
# como brasa" — os sigilos são partículas, cfg.particles glyphs), línguas por entre as toras da grade
for k in range(14):
    a = k / 14 * TAU + random.uniform(-0.2, 0.2)
    fx, fz = at(a, random.uniform(0.6, 2.6))
    cyl(f'FLICKER_flame{k}', (fx, 0.45, fz), random.uniform(0.45, 0.7), random.uniform(2.4, 4.4), M['fire'], seg=6, r_top=0.02,
        rot_x=random.uniform(-0.15, 0.15), rot_z=random.uniform(-0.15, 0.15))
cyl('FLICKER_flameCore', (0, 0.45, 0), 1.6, 5.2, M['fire'], seg=8, r_top=0.05)
# as estacas com os escudos redondos de couro, os crânios espetados e as TOCHAS em volta (AV ep. 1 5h41; acesas de dia)
for k in range(10):
    a = (k + 0.5) / 10 * TAU
    x, z = at(a, PR + 1.3)
    strut(f'pyreStake{k}', (x, 0, z), (x, 2.8, z), 0.08, M['timber'], seg=5)
    col_cyl(f'pyreStake{k}', (x, 0, z), 0.2, 2.8)
    if k % 2:
        cyl(f'pyreShield{k}', (x, 1.7, z), 0.5, 0.07, M['hide'], seg=12, rot_x=math.pi / 2, rot_y=a)
        sphere(f'pyreShieldBoss{k}', (x, 1.7, z), (0.12, 0.12, 0.12), M['iron'], seg=6, rings=4)
        sphere(f'pyreStakeSkull{k}', (x, 3.0, z), (0.2, 0.22, 0.22), M['bone'], seg=8, rings=6)
    else:
        cyl(f'pyreTorchHead{k}', (x, 2.8, z), 0.14, 0.3, M['char'], seg=6)
        cyl(f'FLICKER_torch{k}', (x, 3.05, z), 0.16, 0.6, M['torch'], seg=6, r_top=0.01)

# ================================================================ as CASAS compridas em volta da praça (o mapa da wiki)
HOUSES = [(0.62, 26.5, 8.5, 5.0, False), (1.05, 28.5, 7.0, 4.6, False), (2.1, 26.5, 9.0, 5.2, False), (2.62, 28.5, 7.5, 4.8, False),
          (math.pi, 31, 11, 6.0, True), (4.45, 26.5, 8.0, 5.0, False), (5.0, 28.5, 9.5, 5.2, False), (5.62, 26.5, 7.0, 4.6, False)]
for k, (a, r, w, d, big) in enumerate(HOUSES):
    x, z = at(a, r)
    cottage(f'house{k}', x, z, w, d, big=big)
# os CORDÕES de globos de vidro colorido entre as casas vizinhas, de beiral a beiral, em curva (AV ep. 3 0h58 e 2h48;
# PROPOSTA a disposição)
GLASS = (M['glass_blue'], M['glass_amber'], M['glass_rose'])
for k in range(len(HOUSES)):
    a0, r0 = HOUSES[k][0], HOUSES[k][1] - HOUSES[k][3] / 2 - 1.7
    a1, r1 = HOUSES[(k + 1) % len(HOUSES)][0], HOUSES[(k + 1) % len(HOUSES)][1] - HOUSES[(k + 1) % len(HOUSES)][3] / 2 - 1.7
    if (a1 - a0) % TAU > 1.2:
        continue
    (x0, z0), (x1, z1) = at(a0 + 0.12, r0), at(a1 - 0.12, r1)
    n = max(6, int(math.hypot(x1 - x0, z1 - z0) / 1.1))
    pts = []
    for i in range(n + 1):
        t = i / n
        pts.append((x0 + (x1 - x0) * t, 2.9 - 1.1 * 4 * t * (1 - t), z0 + (z1 - z0) * t))
    for i in range(n):
        strut(f'lampString{k}_{i}', pts[i], pts[i + 1], 0.012, M['iron'], seg=3)
        if 0 < i:
            gx, gy, gz = pts[i]
            sphere(f'lampGlobe{k}_{i}', (gx, gy - 0.16, gz), (0.11, 0.14, 0.11), GLASS[(i + k) % 3], seg=8, rings=5)
# as cercas de pau a pique entre as casas e a HORTA cercada atrás (o mapa)
for k, (a0, a1) in enumerate(((0.78, 0.95), (2.3, 2.48), (4.65, 4.85), (5.2, 5.45), (3.45, 3.62))):
    wattle(f'wattle{k}', a0, a1, 24.0)
hx, hz = at(2.35, 36)
for j in range(5):
    for i in range(6):
        sphere(f'crop{j}_{i}', (hx - 2.5 + i, 0.15, hz - 2 + j), (0.3, 0.25, 0.3), M['crop'], seg=6, rings=4)
for side in range(4):
    a0 = side * math.pi / 2 + math.pi / 4
    p0 = (hx + math.sin(a0) * 4.3, hz + math.cos(a0) * 4.3)
    p1 = (hx + math.sin(a0 + math.pi / 2) * 4.3, hz + math.cos(a0 + math.pi / 2) * 4.3)
    fence_line(f'cropFence{side}', p0, p1, 1.0)
# o QUADRO DE AVISOS na entrada da rua de baixo (o mapa)
nx, nz = 2.8, R_FIGHT + 3.5
for sx in (-1, 1):
    strut(f'notice_post{sx}', (nx + sx * 0.9, 0, nz), (nx + sx * 0.9, 2.4, nz), 0.08, M['timber'], seg=5)
box('notice_board', (nx, 1.6, nz), (2.0, 1.0, 0.08), M['wood'])
gable('notice_roof', (nx, 2.3, nz), 2.4, 0.7, 0.35, M['thatch2'])
for k in range(4):
    box(f'notice_paper{k}', (nx - 0.6 + k * 0.38, 1.6 + random.uniform(-0.2, 0.2), nz + 0.05), (0.28, 0.36, 0.01), M['daub'], rot_z=random.uniform(-0.1, 0.1))

# ================================================================ o RIACHO com a cerca e a PONTE (o mapa: a vila é cortada
# pelo riacho de norte a sul), a leste, fora da luta
box('GROUND_creek', (CREEK_X, -0.02, 0), (4.0, 0.06, 150), M['creek'])
for k in range(70):
    z = random.uniform(-70, 70)
    side = random.choice((-1, 1))
    sphere(f'creekStone{k}', (CREEK_X + side * random.uniform(2.0, 2.6), 0.05, z), (random.uniform(0.3, 0.6), random.uniform(0.15, 0.3), random.uniform(0.3, 0.7)), M['stone' if k % 3 else 'stone2'], seg=6, rings=4)
for seg_ in ((-60, -2.2), (2.2, 60)):
    fence_line(f'creekFence{seg_[0]}', (CREEK_X - 2.9, seg_[0]), (CREEK_X - 2.9, seg_[1]))
box('bridge_deck', (CREEK_X, 0.32, 0), (6.0, 0.16, 2.8), M['wood'])
for k in range(7):
    box(f'bridge_plank{k}', (CREEK_X - 2.6 + k * 0.86, 0.42, 0), (0.7, 0.06, 2.9), M['timber'] if k % 2 else M['wood'])
for sz in (-1.3, 1.3):
    for i in range(4):
        strut(f'bridge_post{sz:.0f}{i}', (CREEK_X - 2.7 + i * 1.8, 0, sz), (CREEK_X - 2.7 + i * 1.8, 1.25, sz), 0.07, M['timber'], seg=5)
    strut(f'bridge_rail{sz:.0f}', (CREEK_X - 2.7, 1.15, sz), (CREEK_X + 2.7, 1.1, sz), 0.05, M['wood'], seg=4)

# ================================================================ o MURO DE PEDRA com a CRUZ CELTA (AV ep. 1 4h26)
for k in range(9):
    a = math.pi + (k - 4) * 0.075
    x, z = at(a, 22.6)
    box(f'wall{k}', (x, 0.55, z), (2.6, 1.1 + random.uniform(-0.1, 0.15), 0.8), M['stone' if k % 2 else 'stone2'], rot_y=a)
col_box('wall', (0, 0.6, -22.6), (21, 1.2, 1.0))
box('cross_shaft', (0, 2.2, -23.0), (0.5, 4.4, 0.32), M['stone'])
box('cross_arm', (0, 3.2, -23.0), (2.0, 0.42, 0.32), M['stone'])
cyl('cross_ring', (0, 3.2, -23.0 - 0.16), 0.78, 0.32, M['stone'], seg=16, rot_x=math.pi / 2, cap=False)
box('cross_base', (0, 0.3, -23.0), (1.2, 0.6, 0.9), M['stone2'])

# ================================================================ os adereços da praça (fora do meio da luta)
for k in range(6):
    a = random.uniform(0, TAU)
    if near_path(a, 0.12):
        continue
    x, z = at(a, random.uniform(20.8, 23))
    hay(f'hay{k}', x, z, random.uniform(0, TAU))
for k, a in enumerate((0.95, -1.15, 2.5)):
    x, z = at(a, 20.4)
    barrel(f'barrel{k}', x, z)
# os nabos em estacas em volta da praça (a proteção do Samhain)
for k in range(10):
    a = (k + 0.5) / 10 * TAU
    x, z = at(a, R_FIGHT + 0.8)
    strut(f'stake{k}', (x, 0, z), (x, 1.2, z), 0.04, M['wood'], seg=4)
    sphere(f'stakeTurnip{k}', (x, 1.32, z), (0.17, 0.19, 0.17), M['turnip'], seg=8, rings=6)
# as lanternas de ferro nos postes da rua (AV ep. 1 5h39)
for k, a in enumerate((0.16, -0.16, math.pi / 2 - 0.15, math.pi / 2 + 0.15, math.pi + 0.62, math.pi + 0.94)):
    x, z = at(a, R_FIGHT + 2.2)
    strut(f'lampPost{k}', (x, 0, z), (x, 2.6, z), 0.07, M['timber'], seg=5)
    box(f'lampCage{k}', (x, 2.45, z), (0.32, 0.42, 0.32), M['iron'])
    box(f'lampGlow{k}', (x, 2.45, z), (0.24, 0.3, 0.24), M['window'])
# a carroça
box('cart_bed', (13.0, 0.75, 17.6), (2.6, 0.18, 1.4), M['wood'], rot_y=0.6)
for k, dz in enumerate((-0.8, 0.8)):
    cyl(f'cart_wheel{k}', (13.0, 0.0, 17.6 + dz), 0.5, 0.1, M['timber'], seg=12, rot_x=math.pi / 2, rot_y=0.6)
strut('cart_shaft', (12.1, 0.7, 18.7), (10.9, 0.4, 20.1), 0.06, M['wood'], seg=4)
col_box('cart', (13.0, 0.6, 17.6), (2.8, 1.2, 1.8), rot_y=0.6)

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

# ================================================================ as FLORES do campo (brilham em ciano na noite da aura; de dia
# são brancas) e as amarelas, em canteiros na beira da praça e entre as casas
for k in range(110):
    a = random.uniform(0, TAU)
    if near_path(a, 0.08):
        continue
    r = random.uniform(R_FIGHT + 0.8, 36)
    x, z = at(a, r)
    mat = M['flower2'] if k % 4 == 0 else M['flower']
    for j in range(6):
        fx, fz = x + random.uniform(-0.8, 0.8), z + random.uniform(-0.8, 0.8)
        h = random.uniform(0.25, 0.6)
        strut(f'stem{k}_{j}', (fx, 0, fz), (fx, h, fz), 0.015, M['tuft'], seg=3)
        sphere(f'bloom{k}_{j}', (fx, h, fz), (0.09, 0.03, 0.09), mat, seg=6, rings=3)
# as BÉTULAS brancas no fundo da floresta (o print do ep.)
for k in range(18):
    a = random.uniform(0, TAU)
    r = random.uniform(36, 48)
    x, z = at(a, r)
    if abs(x - CREEK_X) < 4 or (abs(x) < 3 and z > 30):
        continue
    h = random.uniform(9, 14)
    strut(f'birch{k}', (x, 0, z), (x + random.uniform(-0.5, 0.5), h, z + random.uniform(-0.5, 0.5)), 0.16, M['birch'], seg=6, r2=0.06)
    for j in range(4):
        b = random.uniform(0, TAU)
        y = h * random.uniform(0.5, 0.85)
        strut(f'birchBr{k}_{j}', (x, y, z), (x + math.cos(b) * 1.6, y + 1.4, z + math.sin(b) * 1.6), 0.04, M['birch'], seg=4)
        sphere(f'birchLeaf{k}_{j}', (x + math.cos(b) * 1.7, y + 1.6, z + math.sin(b) * 1.7), (0.8, 0.6, 0.8), M['leaf'], seg=6, rings=4)
# os NABOS-LANTERNA com o rosto entalhado pendurados nas forcas de madeira (o print do ep.: a proteção do Samhain)
for k, a in enumerate((0.35, 1.3, 2.35, 3.55, 4.2, 5.3)):
    x, z = at(a, R_FIGHT + 3.3)
    ry = face_center(x, z)
    strut(f'gallowPost{k}', (x, 0, z), (x, 2.6, z), 0.09, M['timber'], seg=5)
    ax, az = x + math.cos(ry) * 0.9, z - math.sin(ry) * 0.9
    strut(f'gallowArm{k}', (x, 2.5, z), (ax, 2.5, az), 0.06, M['timber'], seg=4)
    strut(f'gallowRope{k}', (ax, 2.5, az), (ax, 1.95, az), 0.015, M['hay'], seg=3)
    sphere(f'hangTurnip{k}', (ax, 1.75, az), (0.22, 0.24, 0.22), M['turnip'], seg=8, rings=6)
    fx, fz = at(a, R_FIGHT + 3.3 - 0.2)
    for sx in (-1, 1):  # os olhos e a boca entalhados (escuros, a luz por dentro)
        ex, ez = ax - math.sin(ry) * 0.0 + math.cos(ry) * 0.07 * sx, az + math.sin(ry) * 0.07 * sx
        sphere(f'hangTurnipEye{k}{sx}', (ex + math.sin(ry) * 0.2, 1.8, ez + math.cos(ry) * 0.2), (0.045, 0.04, 0.02), M['socket'], seg=4, rings=3)
    box(f'hangTurnipMouth{k}', (ax + math.sin(ry) * 0.21, 1.67, az + math.cos(ry) * 0.21), (0.14, 0.035, 0.02), M['socket'], rot_y=ry)

# ================================================================ as árvores velhas entre as casas, a FLORESTA DENSA e as
# MONTANHAS em volta
for k, (a, r) in enumerate(((0.85, 33), (1.85, 32), (2.9, 34.5), (3.9, 32.5), (4.75, 33.5), (5.35, 34.5))):
    x, z = at(a, r)
    gnarled(f'oldTree{k}', x, z, random.uniform(7, 10))
for k in range(170):
    a = random.uniform(0, TAU)
    r = random.uniform(38, 74)
    x, z = at(a, r)
    if abs(x) < 3 and z > 30:  # o caminho do fundo da câmera fica livre
        continue
    if abs(x - CREEK_X) < 4:  # o riacho
        continue
    pine(f'pine{k}', x, z, random.uniform(7, 15))
for k in range(22):
    a = (k + 0.5) / 22 * TAU + random.uniform(-0.1, 0.1)
    x, z = at(a, random.uniform(95, 120))
    sphere(f'hill{k}', (x, -4, z), (random.uniform(22, 34), random.uniform(14, 30), random.uniform(16, 24)), M['hill' if k % 3 else 'rock'], seg=10, rings=6)

finalize(OUT)
