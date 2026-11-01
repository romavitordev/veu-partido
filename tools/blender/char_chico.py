"""
FRANCISCO "CHICO" ALBUQUERQUE — public/models/chico.glb (Os Cinco, o Técnico; pedido de 2026-10-31 "completar Os Cinco").
Referência: wiki "Francisco Albuquerque" (arte e miniatura de Sinais do Outro Lado). 1,47 m, pele clara, cabelo castanho
LONGO e bagunçado, cavanhaque por fazer, piercing na sobrancelha e ESPIRAIS VERMELHAS nas bochechas (textura face_chico);
na cabeça os ÓCULOS REFLETIVOS coloridos com uma peça de metal e fios presos com fita; FONES no pescoço. Blusa preta da
The Pression com as mangas listradas AMARELO e PRETO (a direita arregaçada), luva marrom e amarela na mão direita, duas
pulseiras (espinhos e um visor); MACACÃO BEGE por cima, pochete, bolsas e bandoleiras com ferramentas e o walkie-talkie;
calça larga e coturnos; a BOLSA de tecnologia no ombro com o TOCA-DISCOS e uma ANTENA; o broche dourado na cintura.
Montado sobre o script da Dara/Erin (lib.Builder + acabamento sculpt_lib).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'chico.glb'
b = Builder(width=0.9, bulk=0.95, height=0.82)  # 1,47 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_chico', '#eac6ac', 0.8),
    'face': material('face_chico', '#ffffff', 0.8),
    'torso': material('suit_chico', '#a89a78', 0.85),  # o MACACÃO BEGE (wiki), um pouco mais fosco que antes
    'armL': material('sleeve_chico', '#ffffff', 0.85),  # manga listrada amarelo/preto (textura)
    'armR': material('sleeve_chico', '#ffffff', 0.85),
    'handR': material('glove_chico', '#7a5430', 0.7),
    'handL': material('skin_chico', '#eac6ac', 0.8),
    'legs': material('suit_chico', '#a89a78', 0.85),  # o macacão desce pelas pernas (calças largas)
    'feet': material('boot_chico', '#141416', 0.65),  # coturnos pretos de cadarço
}
black = material('shirt_chico', '#1a1a1e', 0.8)
yellow = material('yellow_chico', '#e0b828', 0.7)
strap = material('strap_chico', '#3a2a1e', 0.8)
bag = material('bag_chico', '#5a4a3a', 0.85)
metal = material('metal_chico', '#9a9aa2', 0.35, metal=0.8)
tape = material('tape_chico', '#b8b8bc', 0.5)
gold = material('gold_chico', '#d0a640', 0.35, metal=0.8)
lens = material('lens_chico', '#8a5aff', 0.1, metal=0.6, emission='#3a6aff', strength=0.4)  # refletivo colorido
plastic = material('plastic_chico', '#1e1e22', 0.5)
vinyl = material('vinyl_chico', '#0e0e10', 0.3)
hairm = material('hair_chico', '#5a3a20', 0.6)
red = material('wire_red', '#c02a2a', 0.6)

hc = b.body(M, [(-0.11, 0.156), (0.0, 0.158), (0.17, 0.15), (0.36, 0.18), (0.47, 0.186), (0.57, 0.108), (0.63, 0.064)],
            arm_r=(0.058, 0.048, 0.041), leg_r=(0.09, 0.074, 0.06), head_r=(0.136, 0.146, 0.158))

# a blusa preta aparecendo no decote do macacão e as alças do macacão
b.add('shirt_v', box((0, -0.128 * H, hz + 0.5 * H), (0.12 * H, 0.008, 0.12 * H)), black, region='torso', subdiv=0)
b.add('band_print', box((0, -0.132 * H, hz + 0.5 * H), (0.06 * H, 0.006, 0.04 * H)), yellow, region='torso', subdiv=0)  # a estampa amarela na blusa preta
for s in (1, -1):
    b.add(f'overall_strap{s}', tube([(s * 0.08 * H, -0.13 * H, hz + 0.42 * H, 0.018 * H, 0.006 * H), (s * 0.09 * H, -0.11 * H, hz + 0.56 * H, 0.018 * H, 0.006 * H), (s * 0.1 * H, 0.0, hz + 0.6 * H, 0.018 * H, 0.006 * H)], 6), strap, region='torso', subdiv=0)  # alças do colete
# a manga direita arregaçada: o punho dobrado acima do cotovelo
eR, hR, sR = sk['eR'], sk['handR'], sk['sR']
b.add('rolled_R', tube(limb_rings(sR.lerp(eR, 0.8), sR.lerp(eR, 0.95), 0.068, 0.068, n=1), 12), yellow, region='armR', subdiv=0)
# as pulseiras do pulso direito: espinhos e o "visor"
wr = hR.lerp(eR, 0.12)
b.add('bracelet_spike', merge(tube([(wr.x, wr.y, wr.z, 0.048, 0.048), (wr.x, wr.y, wr.z + 0.014, 0.048, 0.048)], 12),
                              *[cone((wr.x + math.sin(a) * 0.048, wr.y - math.cos(a) * 0.048, wr.z + 0.007), (wr.x + math.sin(a) * 0.064, wr.y - math.cos(a) * 0.064, wr.z + 0.007), 0.007, 4) for a in [i / 8 * TAU for i in range(8)]]),
      plastic, region='eR', subdiv=0)
b.add('bracelet_visor', merge(tube([(wr.x, wr.y, wr.z + 0.03, 0.047, 0.047), (wr.x, wr.y, wr.z + 0.05, 0.047, 0.047)], 12), box((wr.x - 0.045, wr.y, wr.z + 0.04), (0.014, 0.03, 0.022))), metal, region='eR', subdiv=0)

# pochete, cinto com bolsas e as ferramentas; o broche dourado
b.add('belt', tube([(0, 0, hz + 0.02 * H, 0.178 * H, 0.13 * H), (0, 0, hz + 0.065 * H, 0.178 * H, 0.13 * H)], 22), strap, region='torso', subdiv=0)
b.add('fannypack', box((0.0, -0.15 * H, hz + 0.01 * H), (0.14 * H, 0.05 * H, 0.06 * H), bevel=0.012), bag, region='torso', subdiv=0)
b.add('brooch', ellipsoid((0.1 * H, -0.14 * H, hz + 0.045 * H), (0.012, 0.006, 0.012), 6, 4), gold, region='torso', subdiv=0)
for k, a in enumerate((-1.0, 0.9, 1.4)):
    p = Vector((math.sin(a) * 0.185 * H, -math.cos(a) * 0.14 * H, hz + 0.0))
    b.add(f'pouch{k}', box(tuple(p), (0.05, 0.035, 0.07), bevel=0.006), bag, region='torso', subdiv=0)
b.add('wrench', merge(box((-0.19 * H, -0.04, hz - 0.08 * H), (0.012, 0.018, 0.14)), box((-0.19 * H, -0.04, hz - 0.0 * H), (0.014, 0.04, 0.03))), metal, region='torso', subdiv=0)
b.add('walkie', box((0.17 * H, -0.08 * H, hz + 0.32 * H), (0.03, 0.04, 0.07), bevel=0.005), plastic, region='torso', subdiv=0)
b.add('walkie_name', box((0.17 * H, -0.104 * H, hz + 0.32 * H), (0.025, 0.004, 0.012)), material('walkie_light_chico', '#3a8aff', 0.3, emission='#2a6aff', strength=1.5), region='torso', subdiv=0)  # a luz azul do walkie
# o SCANNER DE ENERGIA aceso na cintura (verde, arte promocional)
b.add('scanner', box((0.12 * H, -0.15 * H, hz - 0.05 * H), (0.05, 0.03, 0.07), bevel=0.006), plastic, region='torso', subdiv=0)
b.add('scanner_screen', box((0.12 * H, -0.168 * H, hz - 0.045 * H), (0.035, 0.004, 0.04)), material('scanner_glow_chico', '#5aff7a', 0.3, emission='#3aff5a', strength=2.0), region='torso', subdiv=0)
# a bandoleira e a BOLSA DE TECNOLOGIA no ombro (o toca-discos e a antena saindo)
pts = [(-0.16 * H, -0.13 * H, hz + 0.56 * H, 0.016 * H, 0.006 * H), (0, -0.142 * H, hz + 0.34 * H, 0.016 * H, 0.006 * H), (0.17 * H, -0.12 * H, hz + 0.1 * H, 0.016 * H, 0.006 * H)]
b.add('bandolier', tube(pts, 6), strap, region='torso', subdiv=0)
bc = Vector((0.2 * H, 0.06 * H, hz + 0.04 * H))
b.add('techbag', box(tuple(bc), (0.1 * H, 0.2 * H, 0.17 * H), bevel=0.02), bag, region='torso', subdiv=0)
b.add('turntable', tube([(bc.x, bc.y + 0.02, bc.z + 0.09 * H, 0.07 * H, 0.07 * H), (bc.x, bc.y + 0.02, bc.z + 0.1 * H, 0.07 * H, 0.07 * H)], 16), vinyl, region='torso', subdiv=0)
b.add('antenna', tube([(bc.x - 0.02, bc.y + 0.08 * H, bc.z + 0.08 * H, 0.006, 0.006), (bc.x - 0.04, bc.y + 0.1 * H, bc.z + 0.36 * H, 0.004, 0.004)], 5), metal, region='torso', subdiv=0)
b.add('antenna_tip', ellipsoid((bc.x - 0.04, bc.y + 0.1 * H, bc.z + 0.37 * H), (0.012, 0.012, 0.012), 6, 4), red, region='torso', subdiv=0)

# calça larga dentro dos coturnos
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('bootshaft' + side, tube(limb_rings(k.lerp(f, 0.55), f + Vector((0, 0, 0.05)), 0.064, 0.064, n=3), 12), M['feet'], region='k' + side)
    b.add('bootsole' + side, sole_part((f.x, f.y - 0.05, f.z - 0.022), (0.11 * H, 0.26 * H, 0.026)), material('sole_chico', '#0e0e0e', 0.9), region='k' + side, subdiv=0)

# os FONES no pescoço
nz = 1.6 * H
b.add('headphones_band', tube([(0, 0.01, nz, 0.085 * H, 0.08 * H), (0, 0.01, nz + 0.012, 0.085 * H, 0.08 * H)], 16, cap_start=False, cap_end=False), plastic, region='neck', subdiv=0)
for s in (1, -1):
    b.add(f'headphone{s}', ellipsoid((s * 0.075 * H, -0.03 * H, nz - 0.01), (0.03, 0.03, 0.035), 10, 6), plastic, region='neck', subdiv=0)

# ---------------- cabelo castanho LONGO e bagunçado
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.012), (0.148 * H, 0.158 * H, 0.17 * H), front=0.22, side=0.5, back=0.66), hairm, region='head')
HC = Vector((hc.x, hc.y + 0.006, hc.z + 0.012))
HR = (0.148 * H, 0.158 * H, 0.17 * H)
random.seed(23)
locks = []
for i in range(26):
    u = i / 25
    a = math.pi * 0.28 + u * math.pi * 1.44
    top = HC + Vector((math.sin(a) * HR[0] * 0.55, -math.cos(a) * HR[1] * 0.55, HR[2] * 0.95))
    mid = HC + Vector((math.sin(a) * HR[0] * 1.1, -math.cos(a) * HR[1] * 1.1, -0.01 * H))
    o = Vector((math.sin(a), -math.cos(a), 0))
    ln = random.uniform(0.2, 0.3) * H  # longo: passa do ombro
    pts, rad = [], []
    for k in range(8):
        t = k / 7
        q = top.lerp(mid, min(1.0, t * 2.2)) if t < 0.45 else mid + Vector((0, 0, -ln * (t - 0.45) / 0.55))
        q = q + o * (math.sin(t * math.pi * 3 + i * 1.7) * 0.02 * H * t + random.uniform(-0.01, 0.01) * H)  # bagunçado
        pts.append(q)
        rad.append((0.03 - 0.022 * t ** 1.4) * H)
    locks.append(tube([(q.x, q.y, q.z, r, r) for q, r in zip(pts, rad)], 6))
b.add('hair_locks', merge(*locks), hairm, region='head', subdiv=0)
for i in range(6):
    x = 0.09 - i * 0.035
    b.add(f'bang{i}', tube([(x, -0.125 * H, hc.z + 0.14, 0.028, 0.015), (x + random.uniform(-0.03, 0.03), -0.145 * H, hc.z + 0.1, 0.022, 0.011), (x + random.uniform(-0.04, 0.04), -0.146 * H, hc.z + 0.06, 0.01, 0.007)], 6), hairm, region='head', subdiv=0)
# o cavanhaque por fazer
b.add('goatee', ellipsoid((0, -0.128 * H, hc.z - 0.155 * H), (0.016, 0.006, 0.02), 8, 5), hairm, region='head', subdiv=0)

# ---------------- o VISOR REFLETIVO colorido na TESTA (arte promocional), a peça de metal e os fios na fita
gz = hc.z + 0.06 * H
b.add('goggle_strap', tube([(0, 0.004, gz - 0.012, 0.152 * H, 0.162 * H), (0, 0.004, gz + 0.014, 0.15 * H, 0.16 * H)], 24, cap_start=False, cap_end=False), strap, region='head', subdiv=0)
b.add('goggle_visor', merge(*[ellipsoid((x * H, -0.15 * H + abs(x) * 0.35 * H, gz + 0.004), (0.026 * H, 0.012 * H, 0.022 * H), 10, 6) for x in (-0.075, -0.025, 0.025, 0.075)]), lens, region='head', subdiv=0)
b.add('gadget', box((0.1 * H, -0.06 * H, gz + 0.06), (0.04, 0.05, 0.03), bevel=0.004), metal, region='head', subdiv=0)
b.add('gadget_tape', box((0.1 * H, -0.06 * H, gz + 0.06), (0.044, 0.02, 0.034)), tape, region='head', subdiv=0)
b.add('gadget_wire', tube([(0.1 * H, -0.03 * H, gz + 0.06, 0.004, 0.004), (0.13 * H, 0.04 * H, gz + 0.02, 0.004, 0.004), (0.12 * H, 0.1 * H, gz - 0.06, 0.004, 0.004)], 4), red, region='head', subdiv=0)

import sculpt_lib
sculpt_lib.cloth_pass(b.parts, ['suit_chico', 'shirt_chico', 'pants_chico'], H)
sculpt_lib.hair_pass(b.parts, ['hair_chico'], H, (hc.x, hc.y, hc.z))
b.export(OUT)
