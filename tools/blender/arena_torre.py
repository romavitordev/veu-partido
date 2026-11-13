"""
TORRE DA TV VARMINHO — public/arenas/torre.glb (OUTRO LADO: a 3ª dungeon, o território do Estrangeiro)
Pedido do dono (2026-11-13): "a nova fase do Outro Lado: Torre de Transmissão, onde o boss será o Estrangeiro".
Estudo completo e fontes: docs/TORRE-TRANSMISSAO.md (wiki "Torre da TV Varminho" + prints dos episódios 6 e 7 de Sinais
do Outro Lado em Referencias visuais/Mapas/torre-tv-varminho/).
Cânone: a RECEPÇÃO (balcão da Regina e o símbolo enorme da emissora), a SALA DE SEGURANÇA (grade 4 × 4 de monitores), o
ESCRITÓRIO EDITORIAL, o ESTÚDIO DO APRESENTADOR, o LABORATÓRIO do 4º andar (Doppelgangers de cabeça baixa nas paredes,
gosma verde, cápsulas com gente), OS BECOS do 5º (corredores amarelo-esverdeados; as salas dos casulos, dos armários de
ponta-cabeça, do Fusca Azul e a dos buracos), o CORREDOR DE CABOS do 6º até a porta verde e a SALA DO SINO (dois
terminais, o sino ornamentado sobre o fosso e seis cápsulas, uma com a Dara).
PROPOSTA: a disposição de cada sala, os móveis e as medidas; a sala dos buracos virou a SALA DAS PILASTRAS (o precipício
do pedido do dono): aqui só as bordas, o fosso e as paredes — as pilastras são do jogo (src/pve/pillars.js), porque
mudam de lugar depois de cada queda.

Cada sala é um MÓDULO solto, como na Escola: o jogo leva o jogador de uma para a outra pelas portas (src/pve/Dungeon.js).
Sem teto; as paredes que tampam a luta ficam transparentes (OCC_). Coordenadas iguais às de src/pve/dungeons.js
(DUNGEONS.estrangeiro).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'torre.glb'
random.seed(1997)  # Sinais do Outro Lado
start()

M = {
    'wall': material('wall_torre', '#a89c80', 0.9),          # o bege de escritório dos anos 90
    'wall_dark': material('wall_torre_dark', '#3a3a36', 0.95),
    'carpet': material('carpet_torre', '#4a4e52', 1.0),
    'floor': material('floor_torre', '#6a665e', 0.7),
    'becos': material('wall_becos', '#b8b070', 0.9),          # os Becos: o papel de parede amarelo-esverdeado
    'becos_floor': material('carpet_becos', '#8a8048', 1.0),
    'lab': material('wall_lab_verde', '#2e4a2a', 0.8),
    'slime': material('slime_alheio', '#3a7a18', 0.2, emission='#4aaa20', strength=0.8),
    'wood': material('wood_torre', '#5a3e28', 0.7),
    'steel': material('steel_torre', '#6a6e72', 0.4, metal=0.7),
    'black': material('void_torre', '#030304', 1.0),
    'crt': material('crt_torre', '#1a1c1e', 0.5),
    'screen': material('screen_verde', '#2a5a2a', 0.3, emission='#5aff6a', strength=2.2),
    'screen_red': material('screen_vermelha', '#5a1a1a', 0.3, emission='#ff4a3a', strength=2.0),
    'lamp': material('lamp_torre', '#f0f0d8', 0.3, emission='#f8f0c8', strength=4),
    'logo': material('logo_varminho', '#2a8a3a', 0.4, emission='#3aff5a', strength=1.4),
    'paper': material('paper_torre', '#d8d0bc', 0.9),
    'red': material('extinguisher', '#a01a1a', 0.5),
    'sofa': material('sofa_torre', '#5a3a3a', 0.9),
    'blue': material('fusca_azul', '#2a5ab0', 0.35, metal=0.5),
    'glass': material('glass_torre', '#9ab0a8', 0.05, metal=0.8),
    'capsule': material('capsule_liquid', '#3a9a3a', 0.1, emission='#3aff4a', strength=1.0),
    'cable': material('cable_torre', '#151515', 0.6),
    'bell': material('bell_ornate', '#8a7a4a', 0.35, metal=0.9),
    'concrete': material('concrete_torre', '#4e4e4a', 0.95),
    'pit': material('pit_torre', '#000000', 1.0),
    'shadow': material('doppel_shadow', '#1e1e1a', 0.9),
    'exit': material('exit_sign_torre', '#20a050', 0.4, emission='#30ff70', strength=3),
}

HH = 3.2   # altura das paredes
T = 0.22   # espessura


def wall(name, x0, x1, z0, z1, mat=None, h=HH):
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    w = max(abs(x1 - x0), T)
    d = max(abs(z1 - z0), T)
    box(f'OCC_{name}', (cx, h / 2, cz), (w, h, d), mat or M['wall'])
    col_box(name, (cx, h / 2, cz), (w, h, d))


def closed_room(name, x0, x1, z0, z1, floor='carpet', wmat=None, gaps=()):
    """sala fechada; gaps = vãos nas paredes laterais (lado 'L'|'R', meia largura) centrados em z=0"""
    if floor:
        box(f'FLOOR_{name}', ((x0 + x1) / 2, -0.05, (z0 + z1) / 2), (x1 - x0, 0.1, z1 - z0), M[floor])
    wall(f'{name}_back', x0 - T / 2, x1 + T / 2, z0 - T / 2, z0 - T / 2, wmat)
    wall(f'{name}_front', x0 - T / 2, x1 + T / 2, z1 + T / 2, z1 + T / 2, wmat)
    g = dict(gaps)
    for side, x in (('L', x0 - T / 2), ('R', x1 + T / 2)):
        if side in g:
            h = g[side]
            wall(f'{name}_{side}a', x, x, z0, -h, wmat)
            wall(f'{name}_{side}b', x, x, h, z1, wmat)
        else:
            wall(f'{name}_{side}', x, x, z0, z1, wmat)


def lamp(name, x, z, flicker=False, w=1.3):
    box(f'{name}_housing', (x, 2.95, z), (w + 0.1, 0.06, 0.32), M['steel'])
    box(f'{"FLICKER_" if flicker else ""}{name}_tube', (x, 2.9, z), (w, 0.05, 0.12), M['lamp'])


def crt(name, x, y, z, rot_y=0.0, s=0.45, mat=None):
    """o monitor de tubo: a caixa cinza e a tela acesa na frente"""
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    box(f'{name}_case', (x, y, z), (s, s * 0.85, s * 0.9), M['crt'], rot_y=rot_y)
    box(f'{name}_screen', (x + fx * s * 0.46, y + 0.02, z + fz * s * 0.46), (s * 0.8, s * 0.62, 0.01), mat or M['screen'], rot_y=rot_y)


def office_desk(name, x, z, rot_y=0.0, monitor=True):
    """mesa de escritório com o monitor de tubo virado para a cadeira (rot_y = para onde a pessoa olha)"""
    box(f'{name}_top', (x, 0.74, z), (1.4, 0.05, 0.75), M['wood'], rot_y=rot_y)
    box(f'{name}_side', (x - 0.55 * math.cos(rot_y), 0.37, z + 0.55 * math.sin(rot_y)), (0.3, 0.72, 0.7), M['wood'], rot_y=rot_y)
    if monitor:
        fx, fz = math.sin(rot_y), math.cos(rot_y)
        crt(f'{name}_crt', x + fx * 0.15, 0.98, z + fz * 0.15, rot_y + math.pi, 0.42)
    col_box(name, (x, 0.4, z), (1.4, 0.8, 0.75) if abs(math.cos(rot_y)) > 0.5 else (0.75, 0.8, 1.4))


def filing(name, x, z, rot_y=0.0):
    box(f'{name}', (x, 0.66, z), (0.5, 1.32, 0.6), M['steel'], rot_y=rot_y)
    fx, fz = math.sin(rot_y), math.cos(rot_y)
    for k in range(4):
        box(f'{name}_h{k}', (x + fx * 0.31, 0.25 + k * 0.32, z + fz * 0.31), (0.16, 0.03, 0.02), M['black'], rot_y=rot_y)
    col_box(name, (x, 0.66, z), (0.55, 1.32, 0.65) if abs(fz) > 0.5 else (0.65, 1.32, 0.55))


def extinguisher(name, x, z):
    cyl(name, (x, 0.9, z), 0.08, 0.5, M['red'], seg=8)


def scatter_papers(name, cx, cz, n, spread):
    for k in range(n):
        box(f'{name}{k}', (cx + random.uniform(-spread, spread), 0.004 + k * 0.0004, cz + random.uniform(-spread, spread)), (0.21, 0.004, 0.29), M['paper'], rot_y=random.uniform(0, TAU))


def floor_number(name, x, z, n, rot_y):
    """o número do andar pintado grande na parede (os prints do ep. 6)"""
    text(f'DECAL_{name}', str(n), (x, 1.9, z), 0.9, M['paper'], rot_y=rot_y)


def capsule(name, x, z, h=2.4, person=True, broken=False):
    """a cápsula de vidro com o líquido verde e alguém dentro (o laboratório do 4º e a Sala do Sino)"""
    cyl(f'{name}_base', (x, 0, z), 0.55, 0.3, M['steel'], seg=14)
    if not broken:
        cyl(f'{name}_liquid', (x, 0.3, z), 0.45, h - 0.6, M['capsule'], seg=14)
    else:
        cyl(f'{name}_shard', (x, 0.3, z), 0.46, 0.5, M['glass'], seg=14)
    cyl(f'{name}_cap', (x, h - 0.3, z), 0.55, 0.3, M['steel'], seg=14)
    if person:
        box(f'{name}_body', (x, 1.2, z), (0.36, 1.3, 0.22), M['shadow'])
        sphere(f'{name}_head', (x, 1.98, z), (0.13, 0.15, 0.13), M['shadow'])
    col_cyl(name, (x, 0, z), 0.6, h)


# =============================================================== A RECEPÇÃO (x −22…0, z −6…6): onde a tentativa começa
closed_room('recepcao', -22, 0, -6, 6, floor='floor')
box('recepcao_main_door', (-21.9, 1.3, 0), (0.1, 2.6, 3.0), M['glass'])
# o balcão curvo da Regina
for k in range(7):
    a = -0.9 + k * 0.3
    x, z = -9.5 + math.sin(a) * 2.6, math.cos(a) * 2.6 - 1.2
    box(f'recepcao_counter{k}', (x, 0.55, z), (0.85, 1.1, 0.5), M['wood'], rot_y=a)
    col_box(f'recepcao_counter{k}', (x, 0.55, z), (0.8, 1.1, 0.8))
crt('recepcao_crt', -9.4, 1.32, 0.6, math.pi, 0.4)
# o símbolo ENORME da emissora na parede norte (um anel verde com a antena: PROPOSTA de forma)
cyl('recepcao_logo_ring', (-9.5, 2.0, -5.86), 1.0, 0.06, M['logo'], seg=24, rot_x=math.pi / 2)
cyl('recepcao_logo_hole', (-9.5, 2.0, -5.83), 0.7, 0.06, M['wall'], seg=24, rot_x=math.pi / 2)
box('recepcao_logo_mast', (-9.5, 2.0, -5.82), (0.16, 1.6, 0.04), M['logo'])
text('DECAL_recepcao_tv', 'TV VARMINHO', (-9.5, 0.65, -5.84), 0.4, M['logo'], rot_y=0.0)
# a sala de espera: sofás virados para a TV
for k, z in enumerate((-3.6, 3.6)):
    box(f'recepcao_sofa{k}', (-17.5, 0.35, z), (2.2, 0.7, 0.85), M['sofa'])
    box(f'recepcao_sofaback{k}', (-17.5, 0.75, z + (0.38 if z > 0 else -0.38)), (2.2, 0.8, 0.15), M['sofa'])
    col_box(f'recepcao_sofa{k}', (-17.5, 0.5, z), (2.2, 1.0, 0.9))
crt('recepcao_tv', -17.5, 0.85, -0.1, 0.0, 0.6, M['screen_red'])
box('recepcao_tvstand', (-17.5, 0.28, -0.1), (0.9, 0.55, 0.5), M['wood'])
col_box('recepcao_tvstand', (-17.5, 0.4, -0.1), (0.9, 0.8, 0.6))
for k, (x, z) in enumerate(((-21.4, -5.4), (-21.4, 5.4), (-0.6, -5.4))):
    cyl(f'recepcao_plant{k}', (x, 0, z), 0.25, 0.5, M['wood'], seg=8)
    sphere(f'recepcao_plantleaves{k}', (x, 0.9, z), (0.4, 0.5, 0.4), M['lab'])
floor_number('recepcao_n1', -0.13, -3.2, 1, -math.pi / 2)
extinguisher('recepcao_ext', -0.25, 3.5)
for i, x in enumerate((-18, -12, -6)):
    lamp(f'recepcao_lamp{i}', x, -2.5, flicker=(i == 1))
    lamp(f'recepcao_lampb{i}', x, 2.5)
scatter_papers('recepcao_paper', -10, 2.5, 6, 2.0)


# =============================================================== AS SALAS DE LUTA (17 × 14, entrada no oeste)
# Salas MAIORES (pedido do dono, 2026-11-13: "as salas estão meio apertadas"): eram 12 × 10. A mobília de cada sala foi
# desenhada para 12 × 10 e é ESTICADA para o tamanho novo (stretch: as posições, não os tamanhos) — o que estava
# encostado na parede continua encostado. As salas dos Becos também cresceram.
import arena_lib
RW, RD = 17, 14
XF = None
_place = arena_lib.place


def _place_xf(obj, pos, rot_y=0.0, rot_x=0.0, rot_z=0.0):
    if XF:
        ox, oz, nx, nz, kx, kz = XF
        pos = (nx + (pos[0] - ox) * kx, pos[1], nz + (pos[2] - oz) * kz)
    return _place(obj, pos, rot_y, rot_x, rot_z)


arena_lib.place = _place_xf


def stretch(ox, oz, nx, nz, kx, kz):
    global XF
    XF = (ox, oz, nx, nz, kx, kz)


def unstretch():
    global XF
    XF = None


def fight_room(name, x0, z0, floor='carpet', wmat=None):
    unstretch()
    closed_room(name, x0, x0 + RW, z0, z0 + RD, floor=floor, wmat=wmat)
    for i, (lx, lz) in enumerate(((4.5, 4.5), (12.5, 4.5), (4.5, 9.5), (12.5, 9.5))):
        lamp(f'{name}_lamp{i}', x0 + lx, z0 + lz, flicker=(i % 3 == 0))
    stretch(x0, z0, x0, z0, RW / 12, RD / 10)  # a mobília (desenhada para 12 × 10)


# a SALA DE SEGURANÇA (0, 30): a grade 4 × 4 de monitores na parede leste, o 1º Ponto de Transmissão
fight_room('seguranca', 0, 30, wmat=M['wall_dark'])
for i in range(4):
    for j in range(4):
        crt(f'seguranca_mon{i}{j}', 11.62, 0.95 + j * 0.5, 33.2 + i * 0.6, -math.pi / 2, 0.46, M['screen'] if (i + j) % 3 else M['screen_red'])
box('seguranca_rack', (11.62, 0.35, 34.1), (0.6, 0.7, 2.6), M['steel'])
col_box('seguranca_rack', (11.5, 1.2, 34.1), (0.9, 2.4, 2.6))
box('seguranca_console', (9.6, 0.42, 34.1), (0.9, 0.84, 2.6), M['crt'])
col_box('seguranca_console', (9.6, 0.42, 34.1), (0.9, 0.84, 2.6))
for k in range(2):
    box(f'seguranca_chair{k}', (8.6, 0.45, 33.4 + k * 1.4), (0.5, 0.06, 0.5), M['crt'])
filing('seguranca_file0', 1.0, 39.4, math.pi)
filing('seguranca_file1', 1.6, 39.4, math.pi)
floor_number('seguranca_n1', 6, 30.13, 1, 0.0)

# o ESCRITÓRIO EDITORIAL (20, 30): baias com mesas e monitores, estantes de arquivo, o 2º Ponto de Transmissão
fight_room('editorial', 20, 30)
for k, (x, z, r) in enumerate(((22.9, 31.4, 0.0), (30.6, 31.4, 0.0), (23.6, 38.6, math.pi), (28.0, 38.6, math.pi), (30.9, 38.6, math.pi))):
    office_desk(f'editorial_desk{k}', x, z, r, monitor=(k != 3))
for k in range(4):
    filing(f'editorial_file{k}', 31.6, 33 + k * 0.6 + (2 if k > 1 else 0), -math.pi / 2)
box('editorial_board', (20.14, 1.7, 35), (0.04, 1.2, 2.6), M['paper'])
scatter_papers('editorial_paper', 26, 35, 10, 2.6)
floor_number('editorial_n2', 26, 30.13, 2, 0.0)
extinguisher('editorial_ext', 20.25, 31)

# o ESTÚDIO DO APRESENTADOR (40, 30): a bancada do jornal, o fundo do cenário, as câmeras de estúdio
fight_room('estudio', 40, 30, floor='floor', wmat=M['wall_dark'])
box('estudio_set', (51.7, 1.6, 34.6), (0.2, 3.0, 4.6), M['logo'])
box('estudio_desk', (50.2, 0.5, 35), (1.0, 1.0, 3.2), M['wood'])
col_box('estudio_desk', (50.2, 0.5, 35), (1.0, 1.0, 3.2))
crt('estudio_monitor', 51.4, 2.4, 35, -math.pi / 2, 0.6, M['screen'])
for k, z in enumerate((32.6, 37.4)):
    cyl(f'estudio_cam{k}_ped', (44.0, 0, z), 0.08, 1.3, M['steel'], seg=8)
    box(f'estudio_cam{k}', (44.1, 1.45, z), (0.7, 0.4, 0.4), M['crt'], rot_y=math.pi / 2 + (0.3 if k else -0.3))
    col_cyl(f'estudio_cam{k}', (44.0, 0, z), 0.4, 1.6)
for k, z in enumerate((31.0, 39.0)):
    cyl(f'estudio_light{k}', (48.5, 0, z), 0.04, 2.6, M['steel'], seg=6)
    box(f'estudio_lighthead{k}', (48.5, 2.6, z), (0.4, 0.35, 0.4), M['lamp'])
floor_number('estudio_n3', 46, 30.13, 3, 0.0)

# o LABORATÓRIO DE ANÁLISES (0, 50) — 4º andar: tudo verde, gosma nas paredes, cápsulas com gente e Doppelgangers de
# cabeça baixa encostados nas paredes
fight_room('laboratorio', 0, 50, floor='floor', wmat=M['lab'])
for k, (x, z) in enumerate(((2.5, 50.9), (9.8, 50.9), (3.5, 59.1), (9.5, 59.1))):
    capsule(f'laboratorio_cap{k}', x, z)
for k, z in enumerate((51.4, 52.8, 57.2, 58.6)):
    # os Doppelgangers parados de cabeça baixa na parede leste (só a silhueta)
    box(f'laboratorio_doppel{k}', (11.55, 0.95, z), (0.3, 1.9, 0.5), M['shadow'])
    sphere(f'laboratorio_doppelhead{k}', (11.45, 1.85, z), (0.13, 0.15, 0.13), M['shadow'])
col_box('laboratorio_doppels0', (11.5, 1, 52.1), (0.6, 2, 2.0))
col_box('laboratorio_doppels1', (11.5, 1, 57.9), (0.6, 2, 2.0))
for k in range(9):
    box(f'DECAL_laboratorio_slime{k}', (random.uniform(1, 11), 0.006, random.uniform(51, 59)), (random.uniform(0.6, 1.6), 0.01, random.uniform(0.4, 1.2)), M['slime'], rot_y=random.uniform(0, TAU))
for k in range(5):
    box(f'DECAL_laboratorio_wallslime{k}', (random.uniform(1.5, 10.5), random.uniform(1.0, 2.6), 49.9), (random.uniform(0.4, 1.0), random.uniform(0.6, 1.4), 0.02), M['slime'])
box('laboratorio_table', (6, 0.45, 55), (2.2, 0.9, 0.9), M['steel'])
col_box('laboratorio_table', (6, 0.45, 55), (2.2, 0.9, 0.9))
floor_number('laboratorio_n4', 0.13, 57.5, 4, math.pi / 2)


# OS BECOS (5º andar): o papel de parede amarelo-esverdeado e as fluorescentes que zumbem
def becos_room(name, x0, z0, w=RW, d=RD, old=(None, None, 12, 10), lamps=True):
    """old = (x0, z0, largura, fundo) do desenho antigo da mobília (None = o mesmo canto)"""
    unstretch()
    closed_room(name, x0, x0 + w, z0, z0 + d, floor='becos_floor', wmat=M['becos'])
    if lamps:
        for i in range(int(w // 4)):
            for j, lz in enumerate((d * 0.3, d * 0.7)):
                lamp(f'{name}_lamp{i}{j}', x0 + 2 + i * 4, z0 + lz, flicker=((i + j) % 2 == 1))
    ox = x0 if old[0] is None else old[0]
    oz = z0 if old[1] is None else old[1]
    stretch(ox, oz, x0, z0, w / old[2], d / old[3])


# a SALA DOS CASULOS (20, 50): os casulos alienígenas com silhuetas, o líquido verde (os Interflorados saem daqui)
becos_room('casulos', 20, 50)
for k, (x, z) in enumerate(((23, 51.2), (24.6, 51.0), (30.8, 51.4), (22.8, 58.8), (27.2, 59.0), (31.0, 58.6), (30.6, 53.0))):
    sphere(f'casulos_pod{k}', (x, 0.95, z), (0.6, 1.0, 0.55), M['capsule'])
    box(f'casulos_pod{k}_shadow', (x, 0.95, z), (0.3, 1.2, 0.2), M['shadow'])
    col_cyl(f'casulos_pod{k}', (x, 0, z), 0.6, 2.0)
for k in range(8):
    box(f'DECAL_casulos_goo{k}', (random.uniform(21, 31), 0.006, random.uniform(51, 59)), (random.uniform(0.6, 1.4), 0.01, random.uniform(0.5, 1.1)), M['slime'], rot_y=random.uniform(0, TAU))
box('casulos_keyboard', (20.5, 1.0, 55), (0.5, 0.1, 1.6), M['steel'], rot_z=-0.4)  # o "teclado alienígena"

# a SALA DOS ARMÁRIOS (40, 50): armários de ponta-cabeça pendurados no teto (7 × 6 no cânone; aqui 6 × 4)
becos_room('armarios', 40, 50)
unstretch()
for i in range(8):  # a sala cresceu: 8 × 5 armários de ponta-cabeça (o cânone tem 7 × 6)
    for j in range(5):
        x, z = 41.6 + i * 1.97, 51.6 + j * 2.7
        box(f'armarios_cab{i}{j}', (x, 2.7, z), (0.6, 1.0, 0.5), M['steel'], rot_y=random.uniform(-0.15, 0.15))
        box(f'armarios_cab{i}{j}_rod', (x, 3.3, z), (0.04, 0.3, 0.04), M['steel'])

# OS BECOS: o corredor (60, 31…39) — sala de espreita
becos_room('becos', 60, 29, w=18, d=12, old=(60, 31, 16, 8))
XF_b = XF
unstretch()
for k, x in enumerate((64.5, 71.0)):
    wall(f'becos_spur{k}', x, x, 29, 32.6, M['becos'])  # as bifurcações que não levam a lugar nenhum
XF = XF_b
scatter_papers('becos_paper', 68, 35, 4, 3)

# a SALA DO FUSCA AZUL (60, 51…59): o fusca batido na parede com o alarme tocando — sala de espreita
becos_room('fusca', 60, 49, w=16, d=12, old=(60, 51, 12, 8))
box('fusca_body', (69.6, 0.55, 55), (3.6, 0.8, 1.55), M['blue'], bevel=0.25, rot_y=0.25)
sphere('fusca_roof', (69.4, 1.05, 54.95), (1.2, 0.45, 0.72), M['blue'])
for sx in (-1, 1):
    for sz in (-1, 1):
        cyl(f'fusca_wheel{sx}{sz}', (69.6 + sx * 1.15, 0.3, 55 + sz * 0.8), 0.3, 0.2, M['crt'], seg=12, rot_x=math.pi / 2, rot_y=0.25)
box('fusca_crumple', (71.4, 0.6, 55.4), (0.4, 0.9, 1.4), M['blue'], rot_y=0.6, rot_z=0.3)
box('DECAL_fusca_crack', (71.88, 1.4, 55.5), (0.02, 1.6, 1.8), M['black'])
col_box('fusca', (69.6, 0.7, 55), (3.8, 1.4, 1.9), rot_y=0.25)

# o ESCRITÓRIO DE ANÁLISE (0, 70) — 4º andar: a sala do RASTROPODA (miniboss sorteado). Cânone: armários de arquivo e o
# quadro de investigação com os resultados das pesquisas; gosma verde. Os sacos de farinha são do jogo (pve/Dungeon.js).
fight_room('analise', 0, 70, floor='floor', wmat=M['lab'])
for k in range(5):
    filing(f'analise_file{k}', 0.45, 71.2 + k * 0.6 if k < 3 else 76.6 + (k - 3) * 0.6, math.pi / 2)
box('analise_board', (11.86, 1.7, 75), (0.04, 1.4, 3.2), M['paper'])
for k in range(9):
    box(f'analise_note{k}', (11.82, 1.3 + (k % 3) * 0.35, 73.8 + (k // 3) * 0.9), (0.01, 0.22, 0.3), M['paper' if k % 2 else 'wall'])
for k in range(6):
    box(f'analise_string{k}', (11.81, 1.6, 74.3 + k * 0.35), (0.005, 0.01, 0.6), M['red'], rot_x=random.uniform(-0.6, 0.6))
office_desk('analise_desk0', 4.0, 71.4, 0.0)
office_desk('analise_desk1', 8.6, 78.6, math.pi)
for k in range(10):
    box(f'DECAL_analise_slime{k}', (random.uniform(1.5, 10.5), 0.006, random.uniform(71, 79)), (random.uniform(0.3, 0.8), 0.01, random.uniform(0.3, 0.7)), M['slime'], rot_y=random.uniform(0, TAU))
# as marcas no teto (ele PULA DO TETO): gosma pingando das paredes no alto
for k in range(6):
    box(f'DECAL_analise_drip{k}', (random.uniform(1, 11), random.uniform(2.5, 3.1), 70.12), (0.12, random.uniform(0.3, 0.7), 0.02), M['slime'])
floor_number('analise_n4', 0.13, 78.5, 4, math.pi / 2)
scatter_papers('analise_paper', 6, 75, 12, 3)

# o QUARTO ESCURO (20, 70) — Os Becos: o BILU. Sem luz (só uma fluorescente morta piscando), o papel de parede dos Becos.
becos_room('escuro', 20, 70, lamps=False)
box('escuro_housing', (26, 2.95, 75), (1.4, 0.06, 0.32), M['steel'])
box('FLICKER_escuro_tube', (26, 2.9, 75), (1.3, 0.05, 0.12), M['lamp'])
for k in range(4):
    box(f'escuro_pillar{k}', (23.5 + (k % 2) * 5, 1.6, 72.8 + (k // 2) * 4.4), (0.5, 3.2, 0.5), M['becos'])
    col_box(f'escuro_pillar{k}', (23.5 + (k % 2) * 5, 1.6, 72.8 + (k // 2) * 4.4), (0.5, 3.2, 0.5))
for k in range(6):  # os riscos de unha nas paredes
    box(f'DECAL_escuro_scratch{k}', (random.uniform(21, 31), random.uniform(0.8, 2.4), 70.12), (random.uniform(0.3, 0.6), 0.02, 0.01), M['black'], rot_x=0.0, rot_z=random.uniform(-0.6, 0.6))

unstretch()

# =============================================================== O LABIRINTO DOS BECOS (x 110…146, z 50…86)
# só o piso, as paredes de fora e as fluorescentes: as paredes de dentro são SORTEADAS pelo jogo a cada visita
# (src/pve/maze.js; pedido do dono, 2026-11-13: "um labirinto aleatório de corredores como uma backrooms")
LX0, LX1, LZ0, LZ1 = 110, 146, 50, 86
closed_room('labirinto', LX0, LX1, LZ0, LZ1, floor='becos_floor', wmat=M['becos'])
for i in range(6):
    for j in range(6):
        lamp(f'labirinto_lamp{i}{j}', LX0 + 3 + i * 6, LZ0 + 4 + j * 6, flicker=((i * 7 + j * 3) % 5 == 0))
for k in range(10):
    box(f'DECAL_labirinto_stain{k}', (random.uniform(LX0 + 1, LX1 - 1), 0.006, random.uniform(LZ0 + 1, LZ1 - 1)), (random.uniform(0.5, 1.4), 0.01, random.uniform(0.4, 1.0)), M['slime'], rot_y=random.uniform(0, TAU))

# =============================================================== A SALA DAS PILASTRAS (x 80…104, z 28…40)
# a sala dos buracos do 5º virou precipício: só a borda da entrada (x 80…83), a da saída (x 100…104) e o fosso escuro.
# As pilastras (que mudam de lugar) são do jogo: src/pve/pillars.js
PX0, PX1, PZ0, PZ1 = 80, 104, 28, 40
for name, x0, x1 in (('pil_entry', PX0, 83), ('pil_exit', 100, PX1)):
    box(f'FLOOR_{name}', ((x0 + x1) / 2, -3.0, (PZ0 + PZ1) / 2), (x1 - x0, 6.0, PZ1 - PZ0), M['becos_floor'])
    box(f'{name}_lip', (x1 - 0.06 if name == 'pil_entry' else x0 + 0.06, -0.02, (PZ0 + PZ1) / 2), (0.12, 0.06, PZ1 - PZ0), M['paper'])
box('pil_pit', ((PX0 + PX1) / 2, -14, (PZ0 + PZ1) / 2), (PX1 - PX0, 0.2, PZ1 - PZ0), M['pit'])
# as paredes descem até o fundo do fosso (de cima se vê o abismo)
wall('pil_back', PX0 - T / 2, PX1 + T / 2, PZ0 - T / 2, PZ0 - T / 2, M['becos'])
wall('pil_front', PX0 - T / 2, PX1 + T / 2, PZ1 + T / 2, PZ1 + T / 2, M['becos'])
wall('pil_L', PX0 - T / 2, PX0 - T / 2, PZ0, PZ1, M['becos'])
wall('pil_R', PX1 + T / 2, PX1 + T / 2, PZ0, PZ1, M['becos'])
for k, (x0, x1, z0, z1) in enumerate(((PX0, PX1, PZ0 - 0.2, PZ0), (PX0, PX1, PZ1, PZ1 + 0.2))):
    box(f'pil_shaft{k}', ((x0 + x1) / 2, -7, (z0 + z1) / 2), (x1 - x0, 14, z1 - z0), M['becos'])
box('pil_shaftL', (PX0 - 0.1, -7, (PZ0 + PZ1) / 2), (0.2, 14, PZ1 - PZ0), M['becos'])
box('pil_shaftR', (PX1 + 0.1, -7, (PZ0 + PZ1) / 2), (0.2, 14, PZ1 - PZ0), M['becos'])
for i in range(6):
    lamp(f'pil_lamp{i}', 82 + i * 4, 34, flicker=(i % 2 == 0))

# =============================================================== 6º ANDAR: O CORREDOR DE CABOS (x 38…70) e a SALA DO SINO
closed_room('cabos', 38, 70, -1.8, 1.8, floor='floor', wmat=M['lab'], gaps=(('R', 1.6),))
for k in range(26):
    # os cabos entrelaçados nas paredes
    x = 39 + k * 1.2
    for s in (-1, 1):
        cyl(f'cabos_cable{k}{s}', (x + random.uniform(-0.3, 0.3), 0.2, s * 1.62), 0.05, random.uniform(2.0, 3.0), M['cable'], seg=5, rot_x=random.uniform(-0.25, 0.25), rot_z=random.uniform(-0.4, 0.4))
for k in range(4):
    lamp(f'cabos_lamp{k}', 42 + k * 7, 0, flicker=True, w=0.9)
box('cabos_greendoor_l', (70.7, 1.3, -2.2), (1.0, 2.6, 0.12), M['logo'])  # a porta verde (escancarada para dentro da sala)
box('cabos_greendoor_r', (70.7, 1.3, 2.2), (1.0, 2.6, 0.12), M['logo'])
floor_number('cabos_n6', 38.13, 0, 6, math.pi / 2)

# a SALA DO SINO (x 70…94, z −11…11): o sino ornamentado sobre o fosso, os dois terminais, as seis cápsulas
closed_room('sino', 70, 94, -11, 11, floor='concrete', wmat=M['lab'], gaps=(('L', 1.6), ('R', 1.2)))
# o fosso circular e o sino pendurado (só o anel do fosso tem colisão: o meio é a arena)
cyl('sino_pit_rim', (82, 0, 0), 3.0, 0.12, M['steel'], seg=32)
cyl('sino_pit', (82, 0.01, 0), 2.7, 0.12, M['pit'], seg=32)
cyl('sino_bell', (82, 4.4, 0), 1.3, 2.4, M['bell'], seg=24, r_top=0.55)
sphere('sino_bell_top', (82, 6.9, 0), (0.6, 0.4, 0.6), M['bell'])
cyl('sino_bell_lip', (82, 4.3, 0), 1.42, 0.18, M['bell'], seg=24)
for k in range(10):
    a = k / 10 * TAU
    cyl(f'sino_bellcable{k}', (82 + math.cos(a) * 1.0, 6.8, math.sin(a) * 1.0), 0.04, 3.0, M['cable'], seg=4, rot_x=math.sin(a) * 0.5, rot_z=-math.cos(a) * 0.5)
col_cyl('sino_pit', (82, 0, 0), 2.6, 1.0)
# as seis cápsulas (quatro vazias, uma quebrada com a silhueta de cabos, uma com a Dara)
for k in range(6):
    side = -1 if k < 3 else 1
    x = 76 + (k % 3) * 6
    capsule(f'sino_cap{k}', x, side * 9.8, h=2.6, person=(k in (2, 4)), broken=(k == 4))
# os dois terminais de telas com os símbolos
for k, z in enumerate((-6.5, 6.5)):
    box(f'sino_terminal{k}', (92.8, 1.2, z), (0.8, 2.4, 3.0), M['crt'])
    for j in range(6):
        crt(f'sino_term{k}_s{j}', 92.3, 0.8 + (j // 3) * 0.7, z - 0.9 + (j % 3) * 0.9, -math.pi / 2, 0.5, M['screen'])
    col_box(f'sino_terminal{k}', (92.8, 1.2, z), (1.0, 2.4, 3.0))
for k in range(20):
    a = random.uniform(0, TAU)
    r = random.uniform(5, 9)
    cyl(f'sino_floorcable{k}', (82 + math.cos(a) * r, 0.04, math.sin(a) * r), 0.06, random.uniform(1.5, 3.5), M['cable'], seg=5, rot_x=math.pi / 2, rot_y=random.uniform(0, TAU))
for k in range(8):
    box(f'DECAL_sino_slime{k}', (random.uniform(72, 92), 0.006, random.uniform(-9, 9)), (random.uniform(0.6, 1.5), 0.01, random.uniform(0.5, 1.2)), M['slime'], rot_y=random.uniform(0, TAU))

# a saída (x 94…104)
box('FLOOR_saida', (99, -0.05, 0), (10, 0.1, 2.6), M['concrete'])
wall('saida_back', 94, 104, -1.3 - T / 2, -1.3 - T / 2, M['lab'])
wall('saida_front', 94, 104, 1.3 + T / 2, 1.3 + T / 2, M['lab'])
wall('saida_end', 104.1, 104.1, -1.4, 1.4, M['lab'])
box('saida_exitsign', (103.9, 2.85, 0), (0.06, 0.2, 0.6), M['exit'])

finalize(OUT)
