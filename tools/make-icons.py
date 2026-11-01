# Ícones da marca VÉU PARTIDO (v4.2.0, no lugar do "AP" do Arena Paranormal — mesma linguagem: fundo preto-roxo, letra
# metálica com brilho roxo e a linha dos cinco elementos embaixo). O "V" está PARTIDO pela fenda da Membrana: a metade
# de baixo deslocada e, no rasgo, o roxo do Outro Lado com a borda carmesim — só dentro da letra.
# Gera os PNGs do PWA/celular, o ícone do Electron e o favicon .ico. Uso: python tools/make-icons.py (precisa do Pillow)
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = 2048  # desenha grande e reduz (antisserrilhado)
K = S / 512
ELEMENTS = [(220, 38, 56), (160, 160, 170), (246, 196, 40), (150, 80, 255), (240, 240, 250)]  # sangue, morte, energia, conhecimento, medo


def P(pts, scale, off=(0, 0)):
    return [((256 + (x - 256) * scale) * K + off[0], (256 + (y - 256) * scale) * K + off[1]) for x, y in pts]


def grad(size, top, bottom):
    g = Image.new('RGBA', (1, 256))
    for y in range(256):
        t = y / 255
        g.putpixel((0, y), tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)) + (255,))
    return g.resize(size)


def poly_mask(pts):
    m = Image.new('L', (S, S), 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return m


def art(scale=1.0, elements=True):
    img = grad((S, S), (20, 11, 32), (6, 4, 10))
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(P([(110, 70), (402, 360)], scale), fill=(110, 50, 200, 120))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(S * 0.08)))

    V = [(112, 84), (206, 84), (256, 282), (306, 84), (400, 84), (300, 352), (212, 352)]
    cut = [(60, 262), (196, 222), (218, 238), (300, 196), (322, 208), (452, 160)]
    shift = (10 * scale * K, 22 * scale * K)
    vm = poly_mask(P(V, scale))
    above = poly_mask(P(cut + [(452, 0), (60, 0)], scale))
    below = poly_mask(P(cut + [(452, 512), (60, 512)], scale))
    top = ImageChops.multiply(vm, above)
    bot = ImageChops.offset(ImageChops.multiply(vm, below), int(shift[0]), int(shift[1]))
    letter = ImageChops.lighter(top, bot)

    # brilho roxo em volta da letra e a sombra dura embaixo (como o "AP")
    halo = Image.new('RGBA', (S, S), (150, 80, 255, 0))
    halo.putalpha(letter.filter(ImageFilter.GaussianBlur(S * 0.03)).point(lambda a: int(a * 0.85)))
    img.alpha_composite(halo)
    sh = Image.new('RGBA', (S, S), (0, 0, 0, 200))
    img.paste(sh, (int(S * 0.008), int(S * 0.012)), letter)
    metal = grad((S, S), (252, 248, 255), (160, 140, 205))
    img.paste(metal, (0, 0), letter)

    # o rasgo: entre a borda de cima e a de baixo, só dentro da letra (um pouco além da borda, para brilhar)
    gap = poly_mask(P(cut, scale) + list(reversed(P(cut, scale, shift))))
    inside = ImageChops.lighter(vm, ImageChops.offset(vm, int(shift[0]), int(shift[1]))).filter(ImageFilter.MaxFilter(int(S * 0.02) | 1))
    gap = ImageChops.multiply(gap, inside)
    rg = Image.new('RGBA', (S, S), (170, 90, 255, 0))
    rg.putalpha(gap.filter(ImageFilter.GaussianBlur(S * 0.02)))
    img.alpha_composite(rg)
    tear = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    td = ImageDraw.Draw(tear)
    td.line(P(cut, scale), fill=(214, 20, 50, 255), width=int(S * 0.012 * scale), joint='curve')
    td.line(P(cut, scale, shift), fill=(214, 20, 50, 255), width=int(S * 0.012 * scale), joint='curve')
    mid = (shift[0] / 2, shift[1] / 2)
    td.line(P(cut, scale, mid), fill=(196, 140, 255, 255), width=int(S * 0.03 * scale), joint='curve')
    td.line(P(cut, scale, mid), fill=(250, 244, 255, 255), width=int(S * 0.009 * scale), joint='curve')
    tear.putalpha(ImageChops.multiply(tear.getchannel('A'), inside))
    img.alpha_composite(tear)

    if elements:
        d = ImageDraw.Draw(img)
        y = 418
        for i, col in enumerate(ELEMENTS):
            x = 256 + (i - 2) * 50
            r = 13
            dia = P([(x, y - r), (x + r, y), (x, y + r), (x - r, y)], scale)
            gl = Image.new('RGBA', (S, S), col + (0,))
            gm = poly_mask(dia).filter(ImageFilter.GaussianBlur(S * 0.01))
            gl.putalpha(gm)
            img.alpha_composite(gl)
            d.polygon(dia, fill=col + (255,))
        for x0, x1 in ((54, 118), (394, 458)):
            d.line(P([(x0, y), (x1, y)], scale), fill=(220, 210, 240, 200), width=int(S * 0.004))
    return img


def save(img, size, path):
    img.resize((size, size), Image.LANCZOS).save(os.path.join(ROOT, path), optimize=True)
    print(path, size)


full = art(1.0)
save(full, 192, 'public/icons/icon-192.png')
save(full, 512, 'public/icons/icon-512.png')
save(art(0.74), 512, 'public/icons/icon-maskable-512.png')  # zona segura do Android
save(full, 180, 'public/icons/apple-touch-icon.png')
save(full, 512, 'electron/icon.png')
# favicon: só o V partido (os elementos somem em 16 px), um pouco maior
small = art(1.22, elements=False)
small.resize((256, 256), Image.LANCZOS).save(os.path.join(ROOT, 'public/veu-partido.ico'), sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
small.resize((64, 64), Image.LANCZOS).save(os.path.join(os.environ.get('PREVIEW_DIR', ROOT), 'favicon-preview.png'))
print('public/veu-partido.ico')
