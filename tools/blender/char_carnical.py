"""
O CARNIÇAL (lutador jogável) — public/models/carnical.glb. Irmão do NPC de tools/blender/npc_carnical.py (que fica para a
invocação), agora no ESQUELETO DE LUTADOR para usar os clipes de garra do Raziel.
Referências: wiki "Carniçal Preto da Morte" (arte do Livro de Regras e miniatura de O Segredo na Floresta).
Humanoide de ~2,1 m, MAGRO e MUSCULOSO, de LODO PRETO-ACINZENTADO todo ESTRIADO; ombros largos com BRILHO VERMELHO por
baixo (e nos flancos), cintura fina, pescoço longo de tendões, TENDÕES PÁLIDOS soltos pelos braços. A cabeça é uma
CAVEIRA bege rachada TOMADA PELO LODO (o Lodo sai de trás e escorre pelas costas), o topo rompido mostra o CÉREBRO
VERMELHO e o SÍMBOLO ESPIRAL brilha na testa (textura face_skull_carnical). Mãos grandes com GARRAS curvas.

TÉCNICA: a mesma do Deus da Morte — cada parte é UMA forma de metaballs fundidos (sculpt_lib) com as estrias por
deslocamento e a cor por vértice; o crânio usa a cabeça do Builder com a textura.
  node tools/blender/build.mjs carnical   → public/models/carnical.glb (+ fonte/carnical_lutador.blend; o build também refaz o NPC de mesmo id)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, vcol_material, paint
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'carnical.glb'
random.seed(13)

b = Builder(width=1.08, bulk=0.95, height=1.17)  # ~2,1 m, magro
sk = b.sk
H = sk.h
hz = sk['hips'].z

lodo = vcol_material('lodo_carnical')
bone = material('face_skull_carnical', '#ffffff', 0.6)  # a caveira rachada com o Símbolo Espiral (textura)
tendon = material('tendon_carnical', '#b8ab94', 0.7)  # os tendões pálidos soltos
claw = material('claw_carnical', '#0c0a0e', 0.35)
brain = material('glow_brain_carnical', '#9a1c18', 0.5, emission='#5a0e0c', strength=1.2)
ember = material('glow_ombro_carnical', '#7a1410', 0.5, emission='#9a1a12', strength=1.6)
bone['preview'] = '#cbb68f'

C = {k: Vector(hex_rgb(v)) for k, v in {'lodo': '#1a181d', 'crest': '#46424e', 'ember': '#7a1610'}.items()}
AMP = 0.005 * H


def V(x, y, z):
    return Vector((x * H, y * H, z * H))


def lim(t):
    return max(0.0, min(1.0, t))


def fibers(a, b_, n, twist, amp=AMP):
    a, b_ = Vector(a), Vector(b_)
    ax = b_ - a
    L = ax.length
    ax = ax / L

    def f(p):
        t = lim((p - a).dot(ax) / L)
        q = p - (a + ax * t * L)
        th = math.atan2(q.x, q.y)
        k = 0.55 + 0.45 * (n3(p, 1.1) * 0.5 + 0.5)
        return amp * k * (ridge(n * th + twist * t + n3(p, 1.8) * 1.6, 2) - 0.35)
    return f


def glow_zone(p):
    """o brilho vermelho por baixo dos ombros e nos flancos (miniatura)"""
    ax = abs(p.x)
    sh = max(0.0, 1 - math.hypot(ax - 0.17 * H, p.z - 1.38 * H) / (0.07 * H))
    fl = max(0.0, 1 - abs(ax - 0.14 * H) / (0.03 * H)) * max(0.0, 1 - abs(p.z - 1.18 * H) / (0.1 * H)) if abs(p.y) < 0.06 * H else 0.0
    return max(sh, fl)


def shade_by(fn, amp=AMP):
    def f(p):
        k = lim(fn(p) / amp + 0.35) ** 1.5
        c = C['lodo'].lerp(C['crest'], k * 0.75)
        e = glow_zone(p) * (1 - k * 0.6)
        return c.lerp(C['ember'], min(1.0, e)) if e > 0 else c
    return f


def weights(region):
    return lambda p: auto_weights(sk, p, region)


def add_sculpt(name, S, fn, target, region, res=0.016, smooth=3):
    o = b.add(name, S.mesh(res=res, smooth=smooth, disp=fn, target=target), lodo, region='body', weight_fn=weights(region), subdiv=0)
    paint(o, shade_by(fn))
    return o


# ================================================================ TRONCO magro: peito largo, cintura fina, pescoço longo
T = Sculpt()
T.ell(V(0, 0, 0.93), (0.14 * H, 0.1 * H, 0.09 * H))  # pelve
T.ell(V(0, 0, 1.06), (0.11 * H, 0.085 * H, 0.1 * H))  # a cintura fina
T.ell(V(0, 0.0, 1.2), (0.15 * H, 0.1 * H, 0.1 * H))  # costelas
T.ell(V(0, -0.01, 1.34), (0.19 * H, 0.115 * H, 0.1 * H))  # o peito
T.chain([V(0, 0.0, 1.4), V(0, -0.01, 1.5), V(0, -0.015, 1.58)], [0.06 * H, 0.05 * H, 0.045 * H], step=0.5)  # o pescoço longo
for s in (1, -1):
    T.ell(V(s * 0.09, -0.075, 1.36), (0.09 * H, 0.05 * H, 0.07 * H))  # peitorais
    T.ell(V(s * 0.13, 0.02, 1.44), (0.1 * H, 0.07 * H, 0.06 * H), dir=(s * 1, 0, -0.4))  # trapézio até o ombro
    T.ell(V(s * 0.15, 0.04, 1.24), (0.05 * H, 0.08 * H, 0.14 * H), dir=(s * 0.35, 0, 1))  # grande dorsal (o V)
    T.ell(V(s * 0.03, -0.01, 1.48), (0.018 * H, 0.025 * H, 0.08 * H), dir=(-s * 0.35, -0.4, 1))  # esternocleidomastoide
    T.ell(V(s * 0.07, 0.05, 0.88), (0.075 * H, 0.065 * H, 0.075 * H))  # glúteos
    for k in range(3):
        T.ell(V(s * 0.04, -0.085, 1.25 - k * 0.07), (0.04 * H, 0.035 * H, 0.03 * H))  # o abdômen em gomos


def torso_fn(p):
    ax = abs(p.x)
    z = p.z / H
    w = n3(p, 2.4) * 0.8
    if z > 1.42 and ax < 0.07 * H:  # pescoço: tendões verticais
        v = ridge(math.atan2(p.x, p.y) * 9 + w)
    elif p.y < -0.05 * H and z > 1.3 and ax < 0.2 * H:  # peitorais em leque
        v = ridge(math.atan2(p.z - 1.46 * H, ax + 0.02 * H) * 24 + w)
    elif p.y < -0.05 * H and 1.0 < z <= 1.3 and ax < 0.08 * H:  # abdômen
        g = min(abs(z - zk) for zk in (1.285, 1.215, 1.145, 1.075))
        v = 0.9 - math.exp(-(g / 0.01) ** 2) - math.exp(-(ax / (0.01 * H)) ** 2) * 0.9
        return AMP * 1.3 * (v - 0.35)
    else:  # flancos e costas: diagonais subindo aos ombros (as costelas aparecem)
        v = ridge((p.z + ax * (0.8 if p.y < 0 else -0.6)) / H * 90 + w)
    return AMP * (v - 0.35)


add_sculpt('torso', T, torso_fn, 7000, 'torso')

# o brilho vermelho sob os ombros (pequenas brasas que acendem no escuro)
em = []
for s in (1, -1):
    for k in range(5):
        a = k / 5 * math.pi - math.pi / 2
        em.append(ellipsoid((s * (0.17 + math.cos(a) * 0.035) * H, (0.0 + math.sin(a) * 0.05) * H, 1.355 * H), (0.018 * H, 0.018 * H, 0.012 * H), 6, 4))
b.add('ember', merge(*em), ember, region='chest', subdiv=0)


# ================================================================ BRAÇOS longos, os tendões pálidos e as MÃOS com GARRAS
def arm(side):
    s = 1 if side == 'L' else -1
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    A = Sculpt()
    A.ell(sh + V(s * 0.01, 0, 0.0), (0.085 * H, 0.08 * H, 0.08 * H))  # deltoide
    A.chain([sh + V(0, 0, 0.02), sh.lerp(e, 0.5), e + V(0, 0, 0.02)], [0.06 * H, 0.05 * H, 0.042 * H], step=0.5)
    A.ell(sh.lerp(e, 0.5) + V(0, -0.03, 0.0), (0.055 * H, 0.05 * H, 0.09 * H))  # bíceps
    A.ell(sh.lerp(e, 0.45) + V(s * 0.005, 0.035, 0.0), (0.055 * H, 0.05 * H, 0.1 * H))  # tríceps
    A.chain([e, e.lerp(h, 0.5), h + V(0, 0, 0.03)], [0.045 * H, 0.04 * H, 0.032 * H], step=0.5)
    A.ell(e.lerp(h, 0.3) + V(s * 0.005, -0.01, 0.0), (0.06 * H, 0.055 * H, 0.09 * H))  # antebraço
    palm = h + V(0, -0.01, -0.05)
    A.ell(palm, (0.055 * H, 0.03 * H, 0.06 * H))  # a mão grande, aberta
    tips = []
    for i in range(4):  # os dedos longos
        x = s * (0.03 - i * 0.02)
        root = palm + V(x, -0.005, -0.04)
        tip = root + V(x * 0.25, -0.03, -0.085)
        A.chain([root, root.lerp(tip, 0.5) + V(0, -0.012, 0), tip], [0.014 * H, 0.012 * H, 0.009 * H], step=0.6)
        tips.append(tip)
    thumb = palm + V(-s * 0.045, -0.04, -0.01)
    A.chain([palm + V(-s * 0.03, -0.02, 0.02), thumb], [0.016 * H, 0.012 * H], step=0.6)
    tips.append(thumb)
    f_up = fibers(sh + V(0, 0, 0.06), e, 9, 1.6 * s)
    f_lo = fibers(e, h, 8, -1.4 * s)
    fn = lambda p: f_up(p) if p.z > e.z else (f_lo(p) if p.z > h.z + 0.02 * H else AMP * 0.3 * (ridge(p.x / H * 160) - 0.35))
    add_sculpt('arm' + side, A, fn, 3600, 'arm' + side, res=0.012)
    # as GARRAS curvas (pretas) na ponta de cada dedo
    cl = []
    for t in tips:
        c1 = t + V(0, -0.02, -0.035)
        c2 = t + V(0, 0.0, -0.065)
        cl.append(rod([t, c1, c2], [0.008 * H, 0.005 * H, 0.001 * H], 5))
    b.add('claws' + side, merge(*cl), claw, region='hand' + side, subdiv=0)
    # TENDÕES PÁLIDOS soltos: dois fios que saem do ombro e entram no antebraço
    td = []
    for k in range(2):
        a0 = sh + V(s * 0.04, -0.02 + k * 0.05, -0.02)
        a1 = e + V(s * 0.05, -0.02 + k * 0.04, 0.02)
        mid = a0.lerp(a1, 0.5) + V(s * 0.03, 0, 0)
        td.append(rod([a0, mid, a1], [0.006 * H, 0.008 * H, 0.006 * H], 5))
    b.add('tendons' + side, merge(*td), tendon, region='body', weight_fn=weights('arm' + side), subdiv=0)


arm('L')
arm('R')


# ================================================================ PERNAS longas e os PÉS com garras
def leg(side):
    s = 1 if side == 'L' else -1
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    Lg = Sculpt()
    Lg.chain([l + V(0, 0, 0.06), l.lerp(k, 0.5), k + V(0, 0, 0.02)], [0.075 * H, 0.06 * H, 0.045 * H], step=0.5)
    Lg.ell(l.lerp(k, 0.4) + V(s * 0.01, -0.03, 0), (0.065 * H, 0.055 * H, 0.13 * H))  # quadríceps
    Lg.ell(l.lerp(k, 0.5) + V(0, 0.03, 0), (0.06 * H, 0.055 * H, 0.12 * H))  # posterior
    Lg.chain([k, k.lerp(f, 0.5), f + V(0, 0, 0.07)], [0.045 * H, 0.04 * H, 0.03 * H], step=0.5)
    Lg.ell(k.lerp(f, 0.3) + V(0, 0.025, 0), (0.05 * H, 0.045 * H, 0.09 * H))  # panturrilha
    Lg.ell(f + V(0, -0.05, 0.005), (0.045 * H, 0.11 * H, 0.03 * H))  # o pé longo
    Lg.ell(f + V(0, 0.03, 0.02), (0.035 * H, 0.04 * H, 0.035 * H))  # calcanhar
    toes = []
    for i in range(3):
        t = f + V(s * (0.025 - i * 0.025), -0.15, 0.0)
        Lg.ell(t, (0.014 * H, 0.025 * H, 0.016 * H))
        toes.append(t)
    f_th = fibers(l + V(0, 0, 0.06), k, 10, 1.8 * s)
    f_sh = fibers(k, f + V(0, 0, 0.07), 8, -1.4 * s)
    fn = lambda p: f_th(p) if p.z > k.z else (f_sh(p) if p.z > f.z + 0.08 * H else AMP * 0.3 * (ridge(p.y / H * 120) - 0.35))
    add_sculpt('leg' + side, Lg, fn, 3200, 'leg' + side, res=0.013)
    cl = [rod([t + V(0, -0.02, 0), t + V(0, -0.045, -0.005), t + V(0, -0.06, -0.02)], [0.007 * H, 0.005 * H, 0.001 * H], 5) for t in toes]
    b.add('toeClaws' + side, merge(*cl), claw, region='foot' + side, subdiv=0)


leg('L')
leg('R')

# ================================================================ a CAVEIRA tomada pelo Lodo, o CÉREBRO à mostra
b.add('skull', head_part(sk, radii=(0.075, 0.085, 0.095)), bone, region='head', subdiv=0)
hc = head_center(sk)
Hd = Sculpt()
Hd.ell(hc + V(0, 0.045, 0.0), (0.085 * H, 0.075 * H, 0.1 * H))  # o Lodo saindo de trás da cabeça
Hd.chain([hc + V(0, 0.07, -0.02), hc + V(0, 0.08, -0.12), hc + V(0, 0.07, -0.22)], [0.06 * H, 0.05 * H, 0.03 * H], step=0.5)  # escorrendo pelas costas
for s in (1, -1):
    Hd.ell(hc + V(s * 0.05, 0.0, 0.06), (0.03 * H, 0.04 * H, 0.04 * H))  # os dedos de Lodo por cima do crânio
Hd.ell(hc + V(0, -0.06, -0.005), (0.075 * H, 0.06 * H, 0.1 * H), neg=True)  # o rosto (a caveira) livre
hood_fn = lambda p: AMP * 0.8 * (ridge(math.atan2(p.x - hc.x, p.z - hc.z) * 16 + n3(p, 4)) - 0.35)
add_sculpt('lodoHead', Hd, hood_fn, 1500, 'head', res=0.011)
Br = Sculpt()  # o topo rompido: o cérebro vermelho aparecendo
Br.ell(hc + V(0, -0.005, 0.085), (0.045 * H, 0.05 * H, 0.025 * H))
for i in range(4):
    Br.ell(hc + V((i - 1.5) * 0.02, -0.01, 0.092), (0.014 * H, 0.04 * H, 0.014 * H))
brain_fn = lambda p: 0.003 * H * (ridge((p.x - hc.x) / H * 300 + n3(p, 9) * 3, 2) - 0.4)
b.add('brain', Br.mesh(res=0.008, smooth=2, disp=brain_fn, target=600), brain, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'carnical_lutador.blend'), check_existing=False)
