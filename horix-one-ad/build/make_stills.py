# Mockup scenes: the real designs (poster exported from Pixel, spread captured from Layout, logo exported from Vector)
# are placed under the transparent windows of the mockups.
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, os, subprocess
A = 'assets/'; O = 'build/stills/'

def cover(im, w, h):
    s = max(w / im.width, h / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - w) // 2; y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def holes(mock):
    a = np.array(mock)[:, :, 3] < 10
    cols = a.any(axis=0); runs = []; s = None
    for x, v in enumerate(cols):
        if v and s is None: s = x
        if not v and s is not None: runs.append((s, x - 1)); s = None
    if s is not None: runs.append((s, len(cols) - 1))
    big = [r for r in runs if r[1] - r[0] > 100]
    out = []
    for x0, x1 in big:
        ys = np.where(a[:, x0:x1 + 1].any(axis=1))[0]; out.append((x0, ys.min(), x1 + 1, ys.max() + 1))
    return out

def place(mock_path, designs, out, margin=2):
    mock = Image.open(mock_path).convert('RGBA'); H = holes(mock)
    base = Image.new('RGBA', mock.size, (20, 19, 20, 255))
    for (x0, y0, x1, y1), d in zip(H, designs):
        base.paste(cover(d.convert('RGB'), x1 - x0 + 2 * margin, y1 - y0 + 2 * margin), (x0 - margin, y0 - margin))
    base.alpha_composite(mock); base.convert('RGB').save(out, quality=94); print(out, H)

poster = Image.open(A + 'poster_akltk.png')
place(A + 'mockups/mockup_poster.png', [poster], O + 'm_poster.jpg')
sp = Image.open('build/spread.png'); w = sp.width // 2
place(A + 'mockups/mockup_booklet.png', [sp.crop((0, 0, w, sp.height)), sp.crop((w, 0, sp.width, sp.height))], O + 'm_booklet.jpg')
# phone: app splash with the Vector logo on the brand gradient
os.system('cd build && node ../capture/svg2png.js ../assets/logo_akltk.svg stills/logo_1080.png')
logo = Image.open(O + 'logo_1080.png').convert('RGBA')
bg = cover(Image.open(A + 'backgrounds/bg_orange_warm.jpg'), 1000, 2060)
lg = logo.resize((700, 700), Image.LANCZOS)
screen = Image.new('RGB', (1000, 2060)); screen.paste(bg, (0, 0))
screen = screen.convert('RGBA'); screen.alpha_composite(lg, (150, 640)); screen = screen.convert('RGB')
place(A + 'mockups/phone_hand_app.png', [screen], O + 'm_phone.jpg')
