"""
ORDO CALAMITAS (Calamidade, 67 d.C.) — as peças comuns dos dez novos modelos (v5.32.0): a armadura escura com placas,
os panos, o PANO DO PEITO com o Símbolo (textura tabard_<id>), as ombreiras, as capas, as saias de tiras (pteruges), as
botas e sandálias, os cabelos (curto, cacheado, longo), barba e bigode, os ELMOS (fechado, de gladiador, com crista) e as
faixas. Feito a partir dos já aprovados: char_gaius.py (armadura, capa, pano), char_amalia.py (cachecol, capuz, cachos)
e char_carina.py (cabelo longo). Cada char_<id>.py monta o seu com estas peças e as medidas da ficha (lore/ORDO-CALAMITAS.md).
"""
import math, random
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree


def grid(fn, nu, nv, flip=False):
    verts, faces, uvs = [], [], []
    for j in range(nv + 1):
        for i in range(nu + 1):
            verts.append(tuple(fn(i / nu, j / nv)))
            uvs.append((i / nu, 1 - j / nv))
    row = nu + 1
    for j in range(nv):
        for i in range(nu):
            a = j * row + i
            f = (a, a + 1, a + 1 + row, a + row)
            faces.append(tuple(reversed(f)) if flip else f)
    return verts, faces, uvs


class Ordo:
    def __init__(self, b, hc, head_r=(0.138, 0.148, 0.162)):
        self.b = b
        self.sk = b.sk
        self.H = b.sk.h
        self.hz = b.sk['hips'].z
        self.top = 1.55 * self.H
        self.hc = Vector((hc.x, hc.y, hc.z))
        self.hs = head_r[0] / 0.138  # escala da cabeça (os cabelos longos foram medidos na cabeça padrão)
        self.head_r = head_r
        self._bvh = {}

    # ---------------------------------------------------------------- utilidades
    def part(self, name):
        return next(o for o in self.b.parts if o.name == name)

    def W(self, reg):
        return lambda p: auto_weights(self.sk, p, reg)

    def bvh(self, name):
        if name not in self._bvh:
            o = self.part(name)
            dg = bpy.context.evaluated_depsgraph_get()
            me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
            me.transform(o.matrix_world)
            bm = bmesh.new()
            bm.from_mesh(me)
            self._bvh[name] = BVHTree.FromBMesh(bm)
            bm.free()
            bpy.data.meshes.remove(me)
        return self._bvh[name]

    def surf(self, name, origin, direction, off=0.0):
        hit = self.bvh(name).ray_cast(Vector(origin), Vector(direction).normalized())
        return None if hit[0] is None else hit[0] + hit[1] * off

    def front(self, name, x, z, off=0.0):
        return self.surf(name, Vector((x, -0.6 * self.H, z)), Vector((0, 1, 0)), off)

    def on_head(self, a, el, off):
        d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
        return self.surf('head', self.hc + d * 0.6 * self.H, -d, off)

    def V(self, x, y, z):
        s, H = self.hs, self.H
        return self.hc + Vector((x * H * s, y * H * s, z * H * s))

    def hang_w(self, z_belt):
        H = self.H

        def f(p):
            if p.z > z_belt:
                return self.W('torso')(p)
            k = min(1.0, (z_belt - p.z) / (0.35 * H))
            side = 'lL' if p.x > 0 else 'lR'
            return {'hips': 1 - 0.45 * k, side: 0.45 * k}
        return f

    def cape_w(self, p):
        H, hz = self.H, self.hz
        side = 'L' if p.x > 0 else 'R'
        w_leg = smoothstep(hz - 0.05 * H, hz - 0.7 * H, p.z) * 0.25
        w_hip = smoothstep(hz + 0.35 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
        return {'chest': max(0.0, 1 - w_leg - w_hip), 'hips': w_hip, 'l' + side: w_leg}

    def hair_w(self, p):
        t = smoothstep(self.sk['hd'].z + 0.02 * self.H, self.sk['neck'].z - 0.01 * self.H, p.z)
        return {'hd': 1 - t, 'chest': t}

    # ---------------------------------------------------------------- roupa de baixo, calça, mangas
    def under(self, mat, sleeves=None, sleeve_to='elbow', pants=None, pants_low=0.2):
        b, H, hz, top = self.b, self.H, self.hz, self.top
        tor = self.part('torso')
        b.add('under', clothe(tor, lambda p: hz - 0.02 * H < p.z < top + 0.03 * H, 0.008 * H, cuts=2), mat, region='body', weight_fn=self.W('torso'), subdiv=0)
        for side in ('L', 'R'):
            f = self.sk['foot' + side]
            if pants:
                pl = b.add('pants' + side, clothe(self.part('leg' + side), lambda p, f=f: p.z > f.z + pants_low * H, 0.018 * H, cuts=1), pants, region='body', weight_fn=self.W('leg' + side), subdiv=0)
                relief(pl, lambda p: 0.004 * H * (ridge(p.z / H * 14 + n3(p, 9) * 1.4, 2) - 0.4))
            if sleeves:
                e_, h_ = self.sk['e' + side], self.sk['hand' + side]
                lim = {'elbow': e_.z + 0.02 * H, 'mid': e_.z - 0.08 * H, 'wrist': h_.z + 0.04 * H, 'short': self.sk['s' + side].z - 0.1 * H}[sleeve_to]
                b.add('sleeve' + side, clothe(self.part('arm' + side), lambda p, lim=lim: p.z > lim, 0.01 * H, cuts=1), sleeves, region='body', weight_fn=self.W('arm' + side), subdiv=0)

    # ---------------------------------------------------------------- a couraça em faixas (lorica) ou lisa (peitoral)
    def cuirass(self, mat, lo=0.08, hi=0.02, bands=22, depth=0.006, thick=0.03, chest_relief=0.0):
        b, H, hz, top = self.b, self.H, self.hz, self.top
        c = b.add('cuirass', clothe(self.part('torso'), lambda p: hz + lo * H < p.z < top - hi * H, thick * H, cuts=2), mat, region='body', weight_fn=self.W('torso'), subdiv=0)
        if bands:
            relief(c, lambda p: depth * H * (ridge(p.z / H * bands, 3) - 0.3))
        if chest_relief:  # o peitoral musculoso (a couraça grega/romana)
            pz = top - 0.17 * H

            def pec(p):
                v = 0.0
                for s in (1, -1):
                    dx, dz = (p.x - s * 0.07 * H) / (0.08 * H), (p.z - pz) / (0.07 * H)
                    v += math.exp(-(dx * dx + dz * dz)) if p.y < 0 else 0
                return chest_relief * H * v
            relief(c, pec)
        return c

    def bracers(self, mat, ridges=26, lo=0.03, hi=0.01, thick=0.02):
        b, H = self.b, self.H
        for side in ('L', 'R'):
            e_, h_ = self.sk['e' + side], self.sk['hand' + side]
            br = b.add('bracer' + side, clothe(self.part('arm' + side), lambda p, e_=e_, h_=h_: h_.z + lo * H < p.z < e_.z + hi * H, thick * H, cuts=1), mat, region='body', weight_fn=self.W('arm' + side), subdiv=0)
            if ridges:
                relief(br, lambda p: 0.004 * H * (ridge(p.z / H * ridges, 3) - 0.3))

    def belt(self, mat, buckle=None, z0=0.0, z1=0.05, thick=0.04):
        b, H, hz = self.b, self.H, self.hz
        b.add('belt', clothe(self.part('torso'), lambda p: hz + z0 * H < p.z < hz + z1 * H, thick * H, cuts=1), mat, region='body', weight_fn=self.W('torso'), subdiv=0)
        if buckle:
            q = self.front('belt', 0, hz + (z0 + z1) / 2 * H, 0.004 * H)
            if q:
                S = Sculpt()
                S.ell(q, (0.03 * H, 0.012 * H, 0.025 * H))
                b.add('buckle', S.mesh(res=0.003, smooth=1, target=300), buckle, region='body', weight_fn=self.W('torso'), subdiv=0)

    # ---------------------------------------------------------------- as ombreiras: 'pointed' (ponta que sobe, como o Gaius),
    # 'plates' (três lâminas sobrepostas), 'round' (a cúpula grande do guerreiro)
    def pauldrons(self, mat, style='plates', trim=None, size=1.0):
        b, H = self.b, self.H
        for side in ('L', 'R'):
            s = 1 if side == 'L' else -1
            sh = self.sk['s' + side]
            wf = (lambda p, s=s: {('sL' if s > 0 else 'sR'): 0.6, 'chest': 0.4})
            base = sh + Vector((s * 0.02 * H, 0.0, 0.035 * H))
            P = Sculpt()
            if style == 'pointed':
                P.ell(base, (0.09 * H * size, 0.1 * H * size, 0.04 * H * size))
                P.chain([base + Vector((s * 0.03 * H, 0, 0.0)), base + Vector((s * 0.05 * H, 0, 0.09 * H)), base + Vector((s * 0.035 * H, 0.0, 0.19 * H))],
                        [0.07 * H, 0.045 * H, 0.008 * H], step=0.4)
            elif style == 'round':
                P.ell(base + Vector((s * 0.02 * H, 0, -0.03 * H)), (0.1 * H * size, 0.1 * H * size, 0.062 * H * size))
                P.ell(base + Vector((s * 0.045 * H, 0, -0.09 * H)), (0.088 * H * size, 0.092 * H * size, 0.04 * H * size))
            else:  # três lâminas descendo pelo braço
                for k in range(3):
                    P.ell(base + Vector((s * (0.02 + 0.025 * k) * H, 0, -0.045 * k * H)), (0.085 * H * size, 0.09 * H * size, 0.032 * H * size))
            b.add('pauldron' + side, P.mesh(res=0.004, smooth=2, target=1200), mat, region='body', weight_fn=wf, subdiv=0)
            if trim:
                t = Sculpt()
                t.chain([base + Vector((s * 0.085 * H * size, -0.06 * H, -0.03 * H)), base + Vector((s * 0.098 * H * size, 0.0, -0.025 * H)), base + Vector((s * 0.085 * H * size, 0.06 * H, -0.03 * H))], [0.012 * H] * 3, step=0.4)
                b.add('pauldronTrim' + side, t.mesh(res=0.003, smooth=1, target=300), trim, region='body', weight_fn=wf, subdiv=0)

    # ---------------------------------------------------------------- o PANO DO PEITO com o Símbolo (textura tabard_<id>)
    def tabard(self, mat, half=0.09, bottom=0.5, flare=0.6, over=('cuirass', 'belt')):
        b, H, hz, top = self.b, self.H, self.hz, self.top
        Z_TOP, Z_BELT, Z_BOT = top - 0.07 * H, hz + 0.02 * H, hz - bottom * H
        HALF = half * H
        verts, faces, uvs = [], [], []
        NX, NZ = 6, 22
        belt_y = {}
        for j in range(NZ + 1):
            t = j / NZ
            z = Z_TOP + (Z_BOT - Z_TOP) * t
            for i in range(NX + 1):
                u = i / NX
                x = (u - 0.5) * 2 * HALF * (1 + max(0.0, (Z_BELT - z) / H) * flare)
                if z >= Z_BELT:
                    q = None
                    for name in over:
                        try:
                            h = self.front(name, x, z, 0.012 * H)
                        except StopIteration:
                            h = None
                        if h and (q is None or h.y < q.y):
                            q = h
                    q = q or Vector((x, -0.15 * H, z))
                    belt_y[i] = q.y
                else:
                    q = Vector((x, belt_y.get(i, -0.15 * H) - 0.01 * H - (Z_BELT - z) * 0.1, z))
                    for name in ('skirt', 'pteruges'):  # por cima da saia (a de malha, a de pano) e das tiras
                        if self._has(name):
                            h = self.front(name, x, z, 0.014 * H)
                            if h and h.y < q.y:
                                q = h
                verts.append(tuple(q))
                uvs.append((u, 1 - t))
        row = NX + 1
        for j in range(NZ):
            for i in range(NX):
                a = j * row + i
                faces.append((a, a + 1, a + 1 + row, a + row))
        b.add('tabard', (verts, faces, uvs), mat, region='body', weight_fn=self.hang_w(Z_BELT), subdiv=0)

    # ---------------------------------------------------------------- as PTERUGES: tiras de couro em volta do quadril (a saia romana)
    def pteruges(self, mat, n=16, length=0.24, r=0.2, skip_front=0.0, z0=0.0, w=0.75):
        b, H, hz = self.b, self.H, self.hz
        strips = []
        zb = hz + z0 * H
        for k in range(n):
            a = (k + 0.5) / n * TAU
            if abs(math.atan2(math.sin(a), math.cos(a))) < skip_front:
                continue
            half = math.pi / n * w

            def fn(u, v, a=a, half=half):
                aa = a + (u - 0.5) * 2 * half
                rr = r * H + v * 0.035 * H
                return Vector((math.sin(aa) * rr * 1.05, -math.cos(aa) * rr * 0.85, zb - v * length * H))
            strips.append(grid(fn, 2, 4))
            strips.append(grid(lambda u, v, fn=fn: fn(u, v) * 1.0 + Vector((0, 0, 0)), 2, 4, flip=True))
        b.add('pteruges', merge(*strips), mat, region='body', weight_fn=self.hang_w(zb + 0.01 * H), subdiv=0)
        # as franjas de metal nas pontas
        return zb

    # ---------------------------------------------------------------- a SAIA de pano (dá a volta por trás; gap = a frente aberta)
    def skirt(self, mat, inner, length=0.62, r0=0.2, flare=0.08, gap=0.22, z0=0.03, nu=28):
        b, H, hz = self.b, self.H, self.hz

        def pt(u, v, out=1.0):
            a = (u - 0.5) * TAU * (1 - gap) + math.pi
            z = hz + z0 * H - v * length * H
            r = r0 * H + v * flare * H
            return Vector((math.sin(a) * r * 1.05 * out, -math.cos(a) * r * 0.85 * out, z))
        wf = self.hang_w(hz + z0 * H)
        b.add('skirt', grid(pt, nu, 10), mat, region='body', weight_fn=wf, subdiv=0)
        b.add('skirt_in', grid(lambda u, v: pt(u, v, 0.985), nu, 10, flip=True), inner, region='body', weight_fn=wf, subdiv=0)

    # ---------------------------------------------------------------- a CAPA (dos ombros; arc = a volta coberta, 0 = frente)
    def cape(self, mat, inner, length=1.0, gap=0.3, w0=0.27, d0=0.16, spread=0.12, name='cape', arc=None, nu=34, nv=22):
        b, H, top = self.b, self.H, self.top
        zt = top + 0.02 * H
        zb = zt - length * zt

        def pt(u, v, out=1.0):
            if arc:
                a = (arc[0] + u * (arc[1] - arc[0])) * TAU
            else:
                a = (gap / 2 + u * (1 - gap)) * TAU
            z = zt + (zb - zt) * v
            w = w0 * H + spread * H * v ** 1.3
            d = d0 * H + spread * 1.4 * H * v ** 1.3
            p = Vector((math.sin(a) * w * out, -math.cos(a) * d * out + 0.03 * H, max(z, 0.006 * H)))
            return p
        b.add(name, grid(pt, nu, nv), mat, region='body', weight_fn=self.cape_w, subdiv=0)
        b.add(name + '_in', grid(lambda u, v: pt(u, v, 0.985), nu, nv, flip=True), inner, region='body', weight_fn=self.cape_w, subdiv=0)

    # ---------------------------------------------------------------- o CACHECOL enrolado no pescoço (o da Amalia)
    def scarf(self, mat, thick=1.0, tail=True):
        b, H, top = self.b, self.H, self.top
        nk = self.sk['neck']
        S = Sculpt()
        for ring, (zz, rr) in enumerate(((top + 0.0 * H, 0.1), (top + 0.04 * H, 0.09), (top + 0.075 * H, 0.08))):
            for i in range(20):
                a = i / 20 * TAU
                S.ell(Vector((nk.x + math.sin(a) * rr * H, nk.y - math.cos(a) * rr * 0.92 * H + 0.008 * H, zz)), (0.04 * H * thick, 0.04 * H * thick, 0.032 * H * thick))
        if tail:  # a ponta caindo na frente, de lado
            s0 = Vector((nk.x + 0.06 * H, nk.y - 0.09 * H, top - 0.01 * H))
            S.chain([s0, s0 + Vector((0.01 * H, -0.02 * H, -0.1 * H)), s0 + Vector((0.015 * H, -0.03 * H, -0.2 * H))], [0.04 * H, 0.036 * H, 0.03 * H], step=0.4)
        b.add('scarf', S.mesh(res=0.005, smooth=2, disp=lambda p: 0.004 * H * (ridge(math.atan2(p.x, -p.y) * 5 + p.z / H * 20 + n3(p, 6), 2) - 0.4), target=2400),
              mat, region='body', weight_fn=lambda p: {'neck': 0.5, 'chest': 0.5}, subdiv=0)

    # ---------------------------------------------------------------- BOTAS (com grevas) e SANDÁLIAS romanas
    def boots(self, mat, sole, greave=None, high=0.22):
        b, H = self.b, self.H
        for side in ('L', 'R'):
            s = 1 if side == 'L' else -1
            f = self.sk['foot' + side]
            heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
            toe = Vector((f.x - s * 0.004 * H, f.y - 0.15 * H, f.z + 0.008 * H))
            U = Sculpt()
            U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.01 * H)), toe], [0.05 * H, 0.052 * H, 0.042 * H], step=0.45)
            U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + high * 0.6 * H)), Vector((f.x, f.y + 0.004 * H, f.z + high * H))], [0.064 * H, 0.064 * H, 0.068 * H], step=0.45)
            b.add('boot' + side, U.mesh(res=0.006, smooth=2, target=1100), mat, region='body', weight_fn=self.W('k' + side), subdiv=0)
            self._sole(side, sole)
            if greave:
                gq = self.front('leg' + side, f.x, f.z + 0.2 * H, 0.03 * H)
                if gq:
                    gv = Sculpt()
                    gv.ell(gq, (0.048 * H, 0.02 * H, 0.11 * H))
                    gv.ell(gq + Vector((0, 0.004 * H, 0.12 * H)), (0.04 * H, 0.022 * H, 0.035 * H))  # o joelho
                    b.add('greave' + side, gv.mesh(res=0.004, smooth=2, target=500), greave, region='body', weight_fn=self.W('k' + side), subdiv=0)

    def _sole(self, side, sole):
        b, H = self.b, self.H
        s = 1 if side == 'L' else -1
        f = self.sk['foot' + side]
        heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
        toe = Vector((f.x - s * 0.004 * H, f.y - 0.15 * H, f.z + 0.008 * H))
        S2 = Sculpt()
        S2.chain([heel + Vector((0, 0.008 * H, -0.022 * H)), toe + Vector((0, -0.01 * H, -0.006 * H))], [0.057 * H, 0.05 * H], step=0.35)
        so = S2.mesh(res=0.006, smooth=2, target=500)
        so = ([(x, y, max(z, f.z - 0.04 * H) if z < f.z - 0.012 * H else min(z, f.z - 0.002 * H)) for x, y, z in so[0]], so[1], so[2])
        b.add('bootSole' + side, so, sole, region='body', weight_fn=self.W('k' + side), subdiv=0)

    def sandals(self, strap, sole, up=0.24):
        """as sandálias romanas: a sola e as tiras de couro cruzando o pé e subindo pela canela"""
        b, H = self.b, self.H
        for side in ('L', 'R'):
            f = self.sk['foot' + side]
            self._sole(side, sole)
            rods = []
            # tiras cruzando o peito do pé
            for k in range(3):
                pts = []
                yk = f.y - (0.03 + 0.04 * k) * H
                for i in range(9):
                    a = -math.pi / 2 + i / 8 * math.pi
                    o = Vector((f.x + math.sin(a) * 0.4 * H, yk, f.z + 0.03 * H + math.cos(a) * 0.4 * H))
                    q = self.surf('foot' + side, o, Vector((f.x, yk, f.z + 0.01 * H)) - o, 0.004 * H) if self._has('foot' + side) else None
                    if q:
                        pts.append(q)
                if len(pts) > 3:
                    rods.append(rod(pts, [0.006 * H] * len(pts), 5))
            # as voltas pela canela, em espiral
            leg = 'leg' + side
            pts = []
            for i in range(41):
                t = i / 40
                a = t * TAU * 3.2
                z = f.z + 0.05 * H + t * up * H
                d = Vector((math.sin(a), -math.cos(a), 0))
                q = self.surf(leg, Vector((f.x, f.y, z)) + d * 0.5 * H, -d, 0.005 * H)
                if q:
                    pts.append(q)
            if len(pts) > 4:
                rods.append(rod(pts, [0.006 * H] * len(pts), 5))
            if rods:
                b.add('sandal' + side, merge(*rods), strap, region='body', weight_fn=self.W('k' + side), subdiv=0)

    def _has(self, name):
        return any(o.name == name for o in self.b.parts)

    # ---------------------------------------------------------------- CABELOS
    def hair_short(self, mat, curly=0.0, lift=1.0, forehead=0.65, thick=1.0, name='hair'):
        """curto rente (o do Gaius); curly > 0 = cachos (o crespo do Faustus, o cacheado do Marcellus)"""
        H = self.H
        C = Sculpt()
        r = 0.03 * H * thick
        for i in range(24):
            a = i / 24 * TAU
            for el in (0.3, 0.6, 0.95, 1.25):
                if el < forehead and math.cos(a) > 0.4:
                    continue  # a testa livre
                q = self.on_head(a, el, (-0.012 + 0.012 * curly) * H * lift)
                if q:
                    C.ell(q, (r * (1 + 0.3 * curly), r * (1 + 0.3 * curly), 0.022 * H * (1 + 0.6 * curly) * thick))
        C.ell(self.hc + Vector((0, 0.01 * H, 0.08 * H * self.hs)), (0.1 * H * self.hs, 0.11 * H * self.hs, 0.06 * H * self.hs))  # a calota contínua
        if curly:
            disp = lambda p: curly * 0.006 * H * (math.sin(p.x / H * 160) * math.sin(p.y / H * 150) * math.sin(p.z / H * 140))
        else:
            disp = lambda p: 0.0015 * H * (ridge(p.x / H * 80 + p.z / H * 40, 2) - 0.4)
        self.b.add(name, C.mesh(res=0.004, smooth=2, disp=disp, target=3200), mat, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

    def hair_long(self, mat, length=0.6, bangs='middle', wave=0.0, seed=1, name='hair'):
        """longo e solto (o da Carina): calota, cortinas na frente dos ombros, lados e o lençol de trás"""
        H = self.H
        V = self.V
        random.seed(seed)
        L = length

        def wv(pts, ph):
            if not wave:
                return pts
            return [p + Vector((math.sin(i * 1.5 + ph) * wave * H, 0, 0)) if i > 1 else p for i, p in enumerate(pts)]

        Hr = Sculpt()
        Hr.ell(V(0, 0.014, 0.028), (0.146 * H * self.hs, 0.164 * H * self.hs, 0.152 * H * self.hs))
        fl = min(L, 0.5)
        for s in (1, -1):
            for i in range(4):
                u = i / 3
                pts = [V(s * (0.112 + 0.03 * u) * 0.9, -0.085 + 0.07 * u, 0.09), V(s * (0.142 + 0.012 * u), -0.07 + 0.075 * u, -0.02),
                       V(s * (0.15 + 0.012 * u), -0.06 + 0.07 * u, -0.13), V(s * (0.158 + 0.01 * u), -0.09 + 0.06 * u, -0.25 * fl / 0.5),
                       V(s * (0.15 + 0.012 * u), -0.14 + 0.05 * u, -fl - random.random() * 0.03)]
                Hr.chain(wv(pts, i + s), [k * H for k in (0.032, 0.036, 0.034, 0.03, 0.008)], step=0.35)
            for i in range(4):
                y = 0.02 + i * 0.035
                pts = [V(s * 0.138, y, 0.06), V(s * 0.152, y + 0.01, -0.08), V(s * 0.162, y + 0.05, -0.22),
                       V(s * 0.162, 0.16 + i * 0.01, -0.22 - (L - 0.22) * 0.5), V(s * 0.145, 0.2, -L - random.random() * 0.04)]
                Hr.chain(wv(pts, i * 2 + s), [k * H for k in (0.032, 0.032, 0.03, 0.026, 0.006)], step=0.35)
        for i in range(9):
            u = (i - 4) / 4
            x = u * 0.14
            end = -L - 0.06 - (1 - abs(u)) * 0.05 - random.random() * 0.04
            pts = [V(x * 0.9, 0.12, 0.06), V(x, 0.155, -0.06), V(x * 1.05, 0.16, -0.18), V(x * 1.1, 0.19, (-0.18 + end) / 2),
                   V(x * 1.05, 0.205, end)]
            Hr.chain(wv(pts, i), [k * H for k in (0.034, 0.034, 0.032, 0.028, 0.006)], step=0.35)
        if bangs == 'middle':
            for s in (1, -1):
                for i in range(3):
                    u = i / 2
                    pts = [V(s * 0.012, -0.05 + 0.03 * u, 0.152), V(s * (0.06 + 0.02 * u), -0.13 + 0.02 * u, 0.12 - 0.01 * u),
                           V(s * (0.105 + 0.015 * u), -0.135 + 0.02 * u, 0.05), V(s * (0.125 + 0.01 * u), -0.11 + 0.02 * u, -0.03)]
                    Hr.chain(pts, [0.024 * H, 0.022 * H, 0.018 * H, 0.01 * H], step=0.35)
        else:  # penteado para trás
            for i in range(7):
                u = (i - 3) / 3
                pts = [V(u * 0.1, -0.135, 0.1), V(u * 0.11, -0.08, 0.165), V(u * 0.115, 0.04, 0.17), V(u * 0.12, 0.14, 0.09)]
                Hr.chain(pts, [0.026 * H, 0.03 * H, 0.03 * H, 0.026 * H], step=0.35)
        Hr.ell(V(0, -0.125, -0.07), (0.106 * H * self.hs, 0.1 * H * self.hs, 0.15 * H * self.hs), neg=True)  # o rosto livre
        Hr.ell(V(0, 0.01, -0.04), (0.1 * H * self.hs, 0.11 * H * self.hs, 0.12 * H * self.hs), neg=True)
        hc = self.hc

        def strands(p):
            a = math.atan2(p.x - hc.x, p.y - hc.y)
            return 0.0028 * H * (ridge(a * 30 + n3(p, 20) * 1.4, 2) - 0.4)
        self.b.add(name, Hr.mesh(res=0.007, smooth=3, disp=strands, target=4200), mat, region='head', weight_fn=self.hair_w, subdiv=0)

    def beard(self, mat, full=True, mustache=True, name='beard'):
        H = self.H
        B = Sculpt()
        if full:
            for i in range(15):
                a = -1.0 + i / 14 * 2.0
                for el in (-0.5, -0.75):
                    q = self.on_head(a, el, -0.012 * H)
                    if q:
                        B.ell(q, (0.019 * H, 0.017 * H, 0.021 * H))
            mq = self.on_head(0.0, -0.95, 0.0)
            if mq:
                B.ell(mq + Vector((0, -0.006 * H, -0.004 * H)), (0.036 * H, 0.028 * H, 0.032 * H))
        if mustache:
            for s in (1, -1):
                q0 = self.on_head(0.0, -0.3, 0.002 * H)
                q1 = self.on_head(s * 0.35, -0.38, 0.0)
                q2 = self.on_head(s * 0.5, -0.55, -0.002 * H)
                pts = [p for p in (q0, q1, q2 if not full else None) if p]
                if len(pts) >= 2:
                    B.chain(pts, [0.013 * H, 0.011 * H, 0.006 * H][:len(pts)], step=0.35)
        self.b.add(name, B.mesh(res=0.004, smooth=2, disp=lambda p: 0.002 * H * (ridge(p.x / H * 60 + p.z / H * 90, 2) - 0.4), target=2000), mat, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

    # ---------------------------------------------------------------- o CAPUZ (aberto na frente)
    def hood(self, mat, inner, open_=0.3, r=(0.16, 0.17, 0.19), drop=0.06):
        H = self.H
        hc = self.hc
        HC = Vector((hc.x, hc.y + 0.01 * H, hc.z + 0.012 * H))
        HR = tuple(x * H * self.hs for x in r)

        def pt(u, v, out=1.0):
            a = (open_ / 2 + u * (1 - open_)) * TAU
            el = math.pi / 2 - v * math.pi * 0.8
            rr = math.cos(el)
            x = math.sin(a) * rr * HR[0]
            y = -math.cos(a) * rr * HR[1]
            z = math.sin(el) * HR[2]
            p = HC + Vector((x, y, z)) * out
            if v > 0.55:
                k = (v - 0.55) / 0.45
                p += Vector((x, y, 0)).normalized() * k * drop * H
            p.y += 0.02 * H
            return p
        self.b.add('hood', grid(pt, 30, 12), mat, region='head', subdiv=0)
        self.b.add('hood_in', grid(lambda u, v: pt(u, v, 0.96), 30, 12, flip=True), inner, region='head', subdiv=0)

    # ---------------------------------------------------------------- os ELMOS (peças prop_helmet*: o jogo tira e põe)
    def _shell(self, name, mat, c, R, el_lo, hole=None, narrow=0.0, nu=44, nv=18, thick=0.012):
        """uma casca de elmo: superfície por latitude/longitude (a=0 é a frente, -y), de el_lo até o topo, com espessura
        (a face de dentro invertida e a borda de baixo); hole(a, el) → True abre a janela. Metaballs negativas apagavam
        a casca fina inteira, por isso a casca é paramétrica."""
        H = self.H
        rx, ry, rz = R

        def P(a, el, out=1.0):
            k = 1 - narrow * max(0.0, -math.sin(el))
            return c + Vector((math.sin(a) * math.cos(el) * rx * k * out, -math.cos(a) * math.cos(el) * ry * k * out, math.sin(el) * rz * out))
        inn = 1 - thick * H / max(rx, ry)
        verts, faces = [], []
        row = nu + 1
        for side, out in ((0, 1.0), (1, inn)):
            base = len(verts)
            for j in range(nv + 1):
                el = el_lo + (math.pi / 2 - el_lo) * j / nv
                for i in range(nu + 1):
                    a = -math.pi + TAU * i / nu
                    verts.append(tuple(P(a, el, out)))
            for j in range(nv):
                for i in range(nu):
                    am = -math.pi + TAU * (i + 0.5) / nu
                    em = el_lo + (math.pi / 2 - el_lo) * (j + 0.5) / nv
                    if hole and hole(am, em):
                        continue
                    a0 = base + j * row + i
                    f = (a0, a0 + 1, a0 + 1 + row, a0 + row)
                    faces.append(f if side == 0 else tuple(reversed(f)))
        # a borda de baixo (liga a casca de fora à de dentro)
        half = len(verts) // 2
        for i in range(nu):
            faces.append((i, half + i, half + i + 1, i + 1))
        self.b.add(name, (verts, faces, None), mat, region='head', subdiv=0)
        return P

    def helmet_closed(self, metal, dark, trim=None, crest=None, slit=True, name='prop_helmet', scale=1.2):
        """o ELMO FECHADO (Marius, Veritus): a casca até abaixo do queixo, a fenda dos olhos, os respiros e o vinco do meio"""
        H = self.H
        rx, ry, rz = (x * H * scale for x in self.head_r)
        c = self.hc + Vector((0, -0.012 * H, -0.006 * H))  # adiantado: o queixo e a barba ficam dentro
        P = self._shell(name + 'Shell', metal, c, (rx, ry * 1.06, rz), -1.3, narrow=0.22)
        if trim:  # o vinco do meio, da nuca ao queixo, passando pela frente
            pts = [P(0.0, el, 1.02) for el in (-1.25, -0.95, -0.6, -0.25, 0.1, 0.45, 0.8, 1.2, 1.5)] + [P(math.pi, el, 1.02) for el in (1.2, 0.8, 0.4, 0.0)]
            ring = [P(-math.pi + TAU * i / 40, -1.05, 1.02) for i in range(41)]  # o friso da gola
            self.b.add(name + 'Ridge', merge(rod(pts, [0.011 * H] * len(pts), 6), rod(ring, [0.009 * H] * len(ring), 6)), trim, region='head', subdiv=0)
        if slit:
            ez = math.asin(max(-1.0, min(1.0, (self.hc.z + 0.012 * H - c.z) / rz)))
            sl = []
            for s in (1, -1):
                pts = [P(s * a, ez, 1.03) for a in (0.1, 0.3, 0.5, 0.7)]
                sl.append(rod(pts, [0.012 * H] * len(pts), 6))
            holes = Sculpt()
            for s in (1, -1):
                for k in range(3):
                    for j in range(3):
                        holes.ell(P(s * (0.18 + 0.13 * k), ez - 0.28 - 0.14 * j, 1.02), (0.006 * H, 0.006 * H, 0.006 * H))
            self.b.add(name + 'Slit', merge(*sl), dark, region='head', subdiv=0)
            self.b.add(name + 'Holes', holes.mesh(res=0.0025, smooth=1, target=800), dark, region='head', subdiv=0)
        if crest:
            self._crest(crest, c, ry, rz, name)
        self.b.group(name, name)

    def helmet_gladiator(self, metal, dark, trim=None, crest=None, name='prop_helmet', scale=1.3):
        """o GRANDE ELMO DE GLADIADOR (Faustus): a casca com a janela do rosto, a ABA larga, a GRADE e a crista"""
        H = self.H
        rx, ry, rz = (x * H * scale for x in self.head_r)
        c = self.hc + Vector((0, 0.008 * H, 0.012 * H))
        win = lambda a, el: abs(a) < 0.62 and -0.62 < el < 0.12
        P = self._shell(name + 'Shell', metal, c, (rx, ry, rz), -0.85, hole=win, narrow=0.15)
        # a ABA larga (na altura das têmporas), um pouco caída para trás
        el_b = -0.1

        def brim(u, v):
            a = -math.pi + u * TAU
            r = 1.0 + v * 0.32
            p = P(a, el_b, 1.0)
            d = Vector((p.x - c.x, p.y - c.y, 0))
            return Vector((c.x, c.y, p.z)) + d * r - Vector((0, 0, v * 0.03 * H * (1 + 0.6 * max(0.0, math.cos(a + math.pi)))))
        self.b.add(name + 'Brim', grid(brim, 44, 2), metal, region='head', subdiv=0)
        self.b.add(name + 'BrimIn', grid(brim, 44, 2, flip=True), metal, region='head', subdiv=0)
        # a GRADE sobre a janela
        bars = []
        for k in range(-4, 5):
            a = k / 4 * 0.6
            bars.append(rod([P(a, el, 1.0) for el in (-0.64, -0.4, -0.15, 0.1, 0.14)], [0.0045 * H] * 5, 5))
        for el in (-0.5, -0.3, -0.1):
            bars.append(rod([P(-0.64 + 1.28 * i / 10, el, 1.004) for i in range(11)], [0.004 * H] * 11, 5))
        frame = [P(-0.64, el, 1.0) for el in (-0.64, 0.14)] + [P(0.64, el, 1.0) for el in (0.14, -0.64)]
        bars.append(rod(frame + [frame[0]], [0.008 * H] * 5, 6))
        self.b.add(name + 'Grille', merge(*bars), trim or dark, region='head', subdiv=0)
        if crest:
            self._crest(crest, c, ry, rz, name, high=1.3)
        self.b.group(name, name)

    def helmet_galea(self, metal, trim, crest, name='prop_helmet', transverse=False, scale=1.12):
        """o ELMO COM CRISTA (Cornelius): a calota, as PROTEÇÕES DAS BOCHECHAS, a aba da nuca e a crista de penas"""
        H = self.H
        rx, ry, rz = (x * H * scale for x in self.head_r)
        c = self.hc + Vector((0, 0.008 * H, 0.012 * H))
        P = self._shell(name + 'Shell', metal, c, (rx, ry, rz), -0.28)
        # a aba da nuca (sai para trás e para baixo) e o friso da testa
        def neck(u, v):
            a = math.pi * (0.55 + 0.9 * u)
            p = P(a, -0.28, 1.0)
            d = Vector((p.x - c.x, p.y - c.y, 0)).normalized()
            return p + d * v * 0.05 * H - Vector((0, 0, v * 0.05 * H))
        self.b.add(name + 'Neck', grid(neck, 16, 2), metal, region='head', subdiv=0)
        self.b.add(name + 'NeckIn', grid(neck, 16, 2, flip=True), metal, region='head', subdiv=0)
        brow = [P(a, -0.2, 1.03) for a in [x / 8 * 1.6 - 1.6 for x in range(17)]]
        parts = [rod(brow, [0.012 * H] * len(brow), 6)]
        ch = Sculpt()
        for s in (1, -1):  # as proteções das bochechas, penduradas até a mandíbula
            top_ = P(s * 1.3, -0.3, 1.0)
            ch.ell(top_ + Vector((0, -0.01 * H, -0.06 * H)), (0.012 * H, 0.04 * H, 0.065 * H))
        self.b.add(name + 'Cheeks', ch.mesh(res=0.003, smooth=2, target=900), trim, region='head', subdiv=0)
        self.b.add(name + 'Brow', merge(*parts), trim, region='head', subdiv=0)
        self._crest(crest, c, ry, rz, name, transverse=transverse)
        self.b.group(name, name)

    def _crest(self, mat, c, ry, rz, name, high=1.0, transverse=False):
        H = self.H
        S = Sculpt()
        n = 11
        for k in range(n):
            t = -1.1 + 2.2 * k / (n - 1)
            if transverse:
                p = c + Vector((math.sin(t) * ry * 0.95, 0.0, math.cos(t) * rz * 1.02))
            else:
                p = c + Vector((0, math.sin(t) * ry * 1.0, math.cos(t) * rz * 1.02))
            up = (p - c).normalized()
            S.ell(p + up * 0.04 * H * high, (0.014 * H, 0.03 * H, 0.05 * H * high) if not transverse else (0.03 * H, 0.014 * H, 0.05 * H * high))
        self.b.add(name + 'Crest', S.mesh(res=0.004, smooth=2, disp=lambda p: 0.003 * H * (ridge(p.y / H * 120 + p.x / H * 120, 2) - 0.4), target=1600), mat, region='head', subdiv=0)

    # ---------------------------------------------------------------- as FAIXAS enroladas nos braços (o Veritus do Hexatombe)
    def bandages(self, mat, blood=None, lo=0.02, hi=None, seed=5):
        b, H = self.b, self.H
        random.seed(seed)
        for side in ('L', 'R'):
            h_, s_ = self.sk['hand' + side], self.sk['s' + side]
            top = hi if hi is not None else s_.z - 0.08 * H
            o = b.add('bandage' + side, clothe(self.part('arm' + side), lambda p, h_=h_, top=top: h_.z - 0.02 * H < p.z < top, 0.012 * H, cuts=1), mat, region='body', weight_fn=self.W('arm' + side), subdiv=0)
            relief(o, lambda p: 0.004 * H * (ridge(p.z / H * 40 + math.atan2(p.x - h_.x, p.y - h_.y) * 0.9, 2) - 0.35))
            if blood:
                S = Sculpt()
                e_ = self.sk['e' + side]
                for k in range(7):
                    t = random.random()
                    base = h_.lerp(e_, t * 1.6) if t < 0.6 else e_.lerp(s_, (t - 0.6))
                    a = random.random() * TAU
                    d = Vector((math.sin(a), -math.cos(a), 0))
                    q = self.surf('bandage' + side, base + d * 0.4 * H, -d, 0.0015 * H)
                    if q:  # a mancha achatada na faixa (não bolinha)
                        S.ell(q, (0.026 * H, 0.034 * H, 0.005 * H), dir=d)
                try:
                    b.add('blood' + side, S.mesh(res=0.003, smooth=2, target=500), blood, region='body', weight_fn=self.W('arm' + side), subdiv=0)
                except Exception:
                    pass

    # ---------------------------------------------------------------- o PEITO NU musculoso (Remus, o Veritus do Hexatombe)
    def muscles(self, k=1.0, abs_=True):
        H, hz, top = self.H, self.hz, self.top
        tor = self.part('torso')
        pz = top - 0.16 * H

        def fn(p):
            if p.y > 0.02 * H:
                return 0.0
            v = 0.0
            for s in (1, -1):  # o peitoral
                dx, dz = (p.x - s * 0.075 * H) / (0.075 * H), (p.z - pz) / (0.06 * H)
                v += 0.012 * math.exp(-(dx * dx + dz * dz))
            if abs_:  # o abdome em gomos
                for r in range(3):
                    for s in (1, -1):
                        dx, dz = (p.x - s * 0.03 * H) / (0.026 * H), (p.z - (pz - 0.11 * H - r * 0.06 * H)) / (0.024 * H)
                        v += 0.006 * math.exp(-(dx * dx + dz * dz))
            return k * H * v
        relief(tor, fn)
        # e as formas esculpidas por cima (a malha do tronco é baixa demais para o relevo sozinho)
        S = Sculpt()
        for s in (1, -1):
            q = self.front('torso', s * 0.07 * H, pz, -0.012 * H)
            if q:
                S.ell(q, (0.072 * H, 0.05 * H, 0.022 * H * k), dir=(s * 0.25, -1, -0.15))
            if abs_:
                for r in range(3):
                    q = self.front('torso', s * 0.032 * H, pz - 0.11 * H - r * 0.055 * H, -0.006 * H)
                    if q:
                        S.ell(q, (0.026 * H, 0.022 * H, 0.012 * H * k), dir=(0, -1, 0))
        try:
            self.b.add('muscles', S.mesh(res=0.004, smooth=2, target=1600), tor.data.materials[0], region='body', weight_fn=self.W('torso'), subdiv=0)
        except Exception as e:
            print('muscles:', e)

    # ---------------------------------------------------------------- a GOLA grossa do manto em volta do pescoço (a do Gaius)
    def collar(self, mat, r=0.11):
        H, top = self.H, self.top
        nk = self.sk['neck']
        S = Sculpt()
        for i in range(24):
            a = i / 24 * TAU
            S.ell(Vector((nk.x + math.sin(a) * r * H, nk.y - math.cos(a) * (r - 0.01) * H + 0.01 * H, top + 0.02 * H)), (0.05 * H, 0.05 * H, 0.04 * H))
        self.b.add('collar', S.mesh(res=0.005, smooth=2, target=1800), mat, region='body', weight_fn=lambda p: {'neck': 0.5, 'chest': 0.5}, subdiv=0)
