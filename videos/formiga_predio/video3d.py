"""Versão 3D da formiga caindo do prédio. Gera formiga_predio_3d.mp4.
Passos (tudo nesta pasta):
  npm install                         (three.js)
  python3 video3d.py linha            -> timeline.json + narracao3d.wav
  node render3d.js timeline.json fundo3d.mp4      (cenas 3D, ~10 min)
  python3 video3d.py                  -> junta 3D + textos + celular + voz
Prévia: node render3d.js timeline.json x 3 20 40  (salva prev3d_*.jpg)
Falas: falas/antonio/*.mp3 (Microsoft Antonio, gravado no PC do Rafael).
"""
import io, json, math, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import video as v

W, H, FPS, SR = 1080, 1920, 30, v.SR
INK, RED, BLUE, GREEN = v.INK, v.RED, v.BLUE, v.GREEN
ARQS = list(range(10)) + [11, 13, 14, 12]      # 10=foi direto, 11=abriu o Insta, 12=ficou assistindo, 13=formiga fala
GAP = v.GAP
EXTRA0 = v.EXTRA0


def carrega():
    clips = []
    for i in ARQS:
        fino = f',asetrate={int(SR * 1.3)},aresample={SR},atempo={1 / 1.3:.4f}' if i == 12 else ''
        r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'falas/antonio/fala{i}.mp3', '-af',
                            f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo={v.TEMPO}' + fino,
                            '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
        clips.append(np.frombuffer(r, np.int16).astype(np.float32))
    return clips


def monta(d):
    ev = {}; t = 0.2
    for i in range(11):
        if i == 2: t += EXTRA0
        if i == 8: t += 0.5
        ev[i] = (t, t + d[i]); t += d[i] + GAP[i]
    fase = {'A': (0, ev[1][1] + GAP[1] + EXTRA0), 'B': (ev[1][1] + GAP[1] + EXTRA0, ev[8][0] - 0.5)}
    fase['C'] = (fase['B'][1], ev[10][0] + 0.9)
    d0 = fase['C'][1]
    D = {'entra': 1.8}
    ev[11] = (d0 + 2.1, d0 + 2.1 + d[11])
    D['tap1'] = ev[11][0] + d[11] * 0.7                       # "...e seguiu na hora!"
    ev[12] = (ev[11][1] + 0.35, ev[11][1] + 0.35 + d[12])
    D['tap2'] = ev[12][0] - 0.1
    ev[13] = (ev[12][1] + 0.5, ev[12][1] + 0.5 + d[13])
    fase['D'] = (d0, ev[13][1] + 1.2)
    return ev, fase, D


def linha():
    clips = carrega(); d = [len(c) / SR for c in clips]
    ev, fase, D = monta(d)
    DUR = fase['D'][1]
    json.dump({'ev': {k: list(x) for k, x in ev.items()}, 'fase': {k: list(x) for k, x in fase.items()}, 'D': D,
               'EXTRA0': EXTRA0, 'DUR': DUR, 'FPS': FPS}, open('timeline.json', 'w'), indent=1)
    # áudio
    full = np.zeros(int(DUR * SR) + SR, np.float32)
    for i, c in enumerate(clips):
        i0 = int(ev[i][0] * SR); full[i0:i0 + len(c)] += c[:len(full) - i0]
    c0 = clips[0]; tv0 = D['tap2'] + 0.4                       # vídeo tocando baixinho no celular
    seg = c0[:max(0, int((ev[12][0] - tv0) * SR))] * 0     # (sem voz por baixo da narração)
    full = full[:int(DUR * SR)]
    full += sfx(DUR, ev, fase, D)[:len(full)]
    with wave.open('voz3d.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.clip(full, -32768, 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voz3d.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '48000', 'narracao3d.wav'], check=True)
    print({k: (round(a, 2), round(b, 2)) for k, (a, b) in ev.items()}, fase, D, 'DUR', DUR)


def sfx(total, ev, fase, D):
    a = np.zeros(int(total * SR), np.float32); rng = np.random.default_rng(1)
    def add(t0, x):
        i = int(t0 * SR); a[i:i + len(x)] += x[:max(0, len(a) - i)]
    b0, b1 = fase['B'][0], fase['C'][0] + 0.5
    n = rng.standard_normal(int((b1 - b0) * SR)).astype(np.float32)
    n = np.convolve(n, np.ones(400) / 400, 'same') * 4000
    env = np.minimum(1, np.minimum(np.arange(len(n)) / SR / 0.6, (len(n) - np.arange(len(n))) / SR / 0.3))
    add(b0, n * env * 0.9)
    tt = np.arange(int(0.25 * SR)) / SR
    add(fase['C'][0] + 0.5, 9000 * np.sin(2 * math.pi * 110 * tt) * np.exp(-tt * 25))
    tc = np.arange(int(0.05 * SR)) / SR
    clk = 6000 * np.sin(2 * math.pi * 1800 * tc) * np.exp(-tc * 120)
    add(D['tap1'], clk); add(D['tap2'], clk)
    tp = np.arange(int(0.4 * SR)) / SR
    add(D['tap1'] + 0.05, 3500 * (np.sin(2 * math.pi * 1320 * tp) + 0.6 * np.sin(2 * math.pi * 1760 * tp)) * np.exp(-tp * 9))
    return a


# ---------------- camadas 2D por cima do 3D ----------------
def coracao(d, hx, hy, r, cor=(230, 60, 90)):
    d.ellipse([hx - r, hy - r, hx, hy], fill=cor); d.ellipse([hx, hy - r, hx + r, hy], fill=cor)
    d.polygon([(hx - r, hy - r / 2 + 2), (hx + r, hy - r / 2 + 2), (hx, hy + r)], fill=cor)


def vento(im, t, forte=1.0):
    d = ImageDraw.Draw(im)
    for i in range(16):
        rx = 120 + (i * 151) % 860
        ph = (t * (1300 + 90 * (i % 5)) + i * 211) % 2300
        ry = 2000 - ph; ln = 90 + 40 * (i % 3)
        d.line([(rx, ry), (rx, ry + ln)], fill=(235, 242, 250), width=4)


def perspectiva(src, quad):
    """cola src na tela: quad = 4 cantos (sup-esq, sup-dir, inf-dir, inf-esq) em pixels"""
    w, h = src.size
    A = []; B = []
    for (x, y), (u, vv) in zip(quad, [(0, 0), (w, 0), (w, h), (0, h)]):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -vv * x, -vv * y]); B.append(vv)
    coef = np.linalg.solve(np.array(A, float), np.array(B, float))
    lay = src.convert('RGBA').transform((W, H), Image.PERSPECTIVE, tuple(coef), Image.BICUBIC)
    mk = Image.new('L', (W, H), 0); ImageDraw.Draw(mk).polygon([tuple(p) for p in quad], fill=255)
    mk = mk.filter(ImageFilter.GaussianBlur(0.8))
    return lay, mk


def tela_d(t, ev, fase, D, cacheA):
    if t < fase['D'][0] + D['entra']:
        s = Image.new('RGB', (v.SW0, v.SH0), (15, 15, 20)); dd = ImageDraw.Draw(s)
        dd.text((v.SW0 / 2 - 80, 300), '21:40', font=v.UI(64, True), fill=(230, 230, 230)); return s
    if t < D['tap1']: return v._tela_perfil(False)
    if t < D['tap1'] + 0.4: return v._tela_perfil(False, (v.SW0 / 2, 300, (t - D['tap1']) / 0.4))
    if t < D['tap2']: return v._tela_perfil(True)
    if t < D['tap2'] + 0.3:
        gw = (v.SW0 - 8) // 3
        return v._tela_perfil(True, (gw / 2, 350 + gw * 0.77, (t - D['tap2']) / 0.3))
    k = int(((t - D['tap2'] - 0.3) * FPS)) % max(1, len(cacheA))      # nosso vídeo tocando (em loop)
    return Image.open(io.BytesIO(cacheA[k])).convert('RGB')


def sobre(im, t, i, ev, fase, D, ex, cacheA):
    d = ImageDraw.Draw(im)
    if t < fase['A'][1]:
        v.texto(im, 'Formiga x prédio', 112, INK, 60)
        if t < ev[1][0] - 0.15:
            v.texto(im, '50 andares · 150 m', 80, RED, 1660)
            if ex.get('topo'):
                x, y = ex['topo']; d.ellipse([x - 40, y - 40, x + 40, y + 40], outline=RED, width=7)
        else:
            s = v.pop(t, ev[1][0])
            if s > 0:
                img = v.T('Será que ela sobrevive?', 96, RED)
                if s < 1: img = v.esc(img, s, ('p3', round(s, 2)))
                d.rounded_rectangle([60, 1620, 1020, 1790], 30, fill=(255, 255, 255), outline=INK, width=6)
                im.paste(img, (540 - img.width // 2, 1705 - img.height // 2), img)
        wm = (560, 1840)
    elif t < fase['B'][1]:
        c = 44 * (t - fase['B'][0]) / (fase['B'][1] - fase['B'][0])
        vento(im, t)
        v.hud(im, t, fase, c)
        if ev[2][0] + 1.0 <= t < ev[3][0]: v.texto(im, 'parou de acelerar!', 90, RED, 1650)
        if ev[3][0] <= t < ev[4][0]: v.inset_pessoa_andando(im, t, ev[3][0] + 1.3)
        if ev[4][0] <= t < ev[5][0]: v.inset_pessoa_caindo(im, t, ev[4][0])
        if ev[5][0] <= t < ev[6][0]:
            for k, x in enumerate((300, 540, 780)):
                y = 1380 - 25 * math.sin(t * 6 + k)
                d.line([(x, y + 130), (x, y)], fill=BLUE, width=14)
                d.polygon([(x - 38, y + 10), (x + 38, y + 10), (x, y - 44)], fill=BLUE)
            v.texto(im, 'o ar segura ela!', 96, BLUE, 1650)
        if ev[6][0] <= t < ev[7][0]: v.texto(im, 'mais de 1 minuto caindo!', 84, INK, 1650)
        if ev[7][0] <= t:
            v.inset_arvore(im, t, ev[7][0])
            if t >= ev[7][0] + 0.8: v.texto(im, 'formiga planadora', 84, GREEN, 1700)
        wm = [(560, 1845), (120, 1845), (120, 30)][int(t // 6) % 3]
    elif t < fase['C'][1]:
        c0 = fase['C'][0]; tImp = c0 + 0.5
        if t < tImp:
            vento(im, t); v.hud(im, t, fase, 44 + (t - c0) / 0.5 * 5)
        if tImp <= t < tImp + 0.6: v.texto(im, 'tuc', 110, INK, 560, x=600, box=False)
        if ev[8][0] + 1.2 <= t < ev[9][0]: v.texto(im, 'e nada!', 120, GREEN, 1650)
        if ev[9][0] <= t < ev[10][0]: v.texto(im, 'armadura natural', 96, BLUE, 1650)
        wm = (130, 30)
    else:
        if ex.get('tela'):
            scr = tela_d(t, ev, fase, D, cacheA)
            lay, mk = perspectiva(scr, ex['tela'])
            im.paste(lay.convert('RGB'), (0, 0), mk)
        u = t - fase['D'][0]
        hx, hy = ex.get('cabeca', (300, 900))
        if t >= D['tap1'] + 0.3:
            for k in range(7):
                ph = ((t - D['tap1']) * 0.55 + k / 7) % 1
                coracao(d, hx + 90 * math.sin(k * 2.1 + u * 2) + k * 8 - 40, hy - 80 - ph * 520, 22 + 10 * (k % 3))
        if D['tap1'] + 0.4 <= t < D['tap1'] + 1.8:
            s = v.pop(t, D['tap1'] + 0.4); img = v.T('seguiu!', 100, RED)
            if 0 < s < 1: img = v.esc(img, s, ('sg', round(s, 2)))
            if s > 0: im.paste(img, (int(hx) - img.width // 2, int(hy) - 330), img)
        if D['tap2'] + 0.8 <= t < ev[13][0]:
            img = v.T('kkkkkk', 104, RED); im.paste(img, (60 + int(8 * math.sin(t * 30)), 380), img)
        if ev[11][0] <= t < ev[12][0]: v.texto(im, 'abriu o Caderno Amarelo', 80, INK, 1680)
        if ev[12][0] <= t < ev[13][0]: v.texto(im, 'rindo à toa', 96, INK, 1680)
        if t >= ev[13][0] - 0.1:
            s = v.pop(t, ev[13][0] - 0.1)
            if s > 0:
                bal = Image.new('RGBA', (1000, 400), (0, 0, 0, 0)); bd = ImageDraw.Draw(bal)
                bd.rounded_rectangle([10, 10, 990, 300], 60, fill=(255, 255, 255), outline=INK, width=7)
                bd.polygon([(170, 292), (260, 292), (150, 390)], fill=(255, 255, 255), outline=INK)
                bd.line([(172, 296), (258, 296)], fill=(255, 255, 255), width=10)
                l1 = v.T('Segue o Caderno Amarelo', 84, INK, sw=0); l2 = v.T('@Cardeno_Amarelo', 90, RED, sw=0)
                bal.paste(l1, (500 - l1.width // 2, 30), l1); bal.paste(l2, (500 - l2.width // 2, 150), l2)
                if s < 1: bal = v.esc(bal, s, ('bl', round(s, 2)))
                im.paste(bal, (540 - bal.width // 2, 120), bal)
        wm = [(560, 1845), (130, 1845)][int(t // 3) % 2]
    wmi = v.T('@Cardeno_Amarelo', 52, (240, 240, 240), stroke=(40, 40, 40), sw=3)
    im.paste(wmi, wm, wmi)
    return im


def main():
    tl = json.load(open('timeline.json'))
    ev = {int(k): tuple(x) for k, x in tl['ev'].items()}; fase = {k: tuple(x) for k, x in tl['fase'].items()}; D = tl['D']
    extras = json.load(open('fundo3d_extra.json'))
    DUR = tl['DUR']; N = int(round(DUR * FPS))
    rd = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', 'fundo3d.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    wr = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-i', 'narracao3d.wav', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p',
                           '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', 'formiga_predio_3d.mp4'], stdin=subprocess.PIPE)
    cacheA = []
    sel = set(float(s) for s in sys.argv[1:])
    for i in range(N):
        buf = rd.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        t = i / FPS
        im = Image.frombytes('RGB', (W, H), buf)
        im = sobre(im, t, i, ev, fase, D, extras[i] if i < len(extras) else {}, cacheA)
        if t < fase['A'][1]:                                           # guarda o começo pro vídeo no celular
            b = io.BytesIO(); im.resize((v.SW0, int(v.SW0 * H / W))).crop((0, 0, v.SW0, v.SH0)).save(b, 'JPEG', quality=80); cacheA.append(b.getvalue())
        if sel:
            if any(abs(t - s) < 0.5 / FPS for s in sel): im.save(f'prev_{t:.2f}.png')
            continue
        wr.stdin.write(im.tobytes())
    wr.stdin.close(); wr.wait()
    print('ok', N)


if __name__ == '__main__':
    if sys.argv[1:2] == ['linha']: linha()
    else: main()
