# Monta o episódio 3: cartão "vocês escolheram" + ep3.mp4 + cartão final, com falas, trilha de suspense sintetizada,
# sons estranhos, passos e legendas. Uso: python3 tl_ep3.py && node ../../_toon3d/render.js cena_ep3.js ep3.mp4 --dados dados_ep3.json && python3 montar_ep3.py
import json, os, subprocess, numpy as np
from scipy.signal import butter, sosfilt
AQ = os.path.dirname(os.path.abspath(__file__)); os.chdir(AQ)
SR = 48000; S = '../sfx/'; W, H = 720, 1280
TLD = json.load(open('tl_ep3.json')); EV = TLD['ev']; DUR = TLD['dur']
E = lambda k: EV[k]['t'] + INI
fim = lambda k: E(k) + EV[k]['d']
INI, CARD = 2.6, 5.0
TOTAL = INI + DUR + CARD
def wav(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).copy()
N = int((TOTAL + 1) * SR)
voz, sfx, mus = (np.zeros(N, np.float32) for _ in range(3))
def poe(buf, a, t, g=1.0):
    i = int(t * SR); a = a[:max(0, N - i)]; buf[i:i + len(a)] += a * g
def laco(buf, a, de, ate, g, fi=0.8, fo=0.8):
    n = int((ate - de) * SR); a = np.tile(a, n // len(a) + 1)[:n]; env = np.ones(n)
    f1, f2 = max(1, int(fi * SR)), max(1, int(fo * SR)); env[:f1] = np.linspace(0, 1, f1); env[-f2:] = np.linspace(1, 0, f2); poe(buf, a * env, de, g)
tt = lambda d: np.arange(int(d * SR)) / SR
rng = np.random.default_rng(11)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x).astype(np.float32)
hp = lambda x, f: sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x).astype(np.float32)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], 'bandpass', fs=SR, output='sos'), x).astype(np.float32)
def env_ad(n, a, r): e = np.ones(n); a, r = int(a * SR), int(r * SR); e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r); return e

# ---------------- falas ----------------
legs = []
for k, e in EV.items():
    if 'arq' in e:
        a = wav(os.path.join('..', 'falas', e['arq'] + '.wav')); a = a / (np.abs(a).max() + 1e-9) * 0.85  # todas as falas no mesmo nível
        poe(voz, a, E(k), 1.0)
        legs.append((E(k), fim(k), e['quem'], e['leg']))
legs.append((E('MSG') + 0.6, E('JANELA1') + 0.3, 'msg', 'Mensagem do EU: "não olha pro motorista."'))

# ---------------- trilha de suspense (sintetizada) ----------------
def drone(d, f0=55.0):
    x = tt(d); lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * x)
    y = 0.5 * np.sin(2 * np.pi * f0 * x) + 0.3 * np.sin(2 * np.pi * f0 * 1.0595 * x) + 0.25 * np.sin(2 * np.pi * f0 * 0.5 * x)
    y += 0.12 * lp(rng.standard_normal(len(x)).astype(np.float32), 180)
    return (y * lfo * env_ad(len(x), 2.0, 1.5)).astype(np.float32)
def pad(d, notas, vib=0.003):
    x = tt(d); y = np.zeros(len(x))
    for f in notas:
        fase = 2 * np.pi * f * (x + vib * np.sin(2 * np.pi * 0.2 * x) / (2 * np.pi * 0.2))
        y += np.sin(fase) + 0.35 * np.sin(2 * fase) + 0.15 * np.sin(3 * fase)
    y = lp(y.astype(np.float32), 900) / len(notas)
    return (y * env_ad(len(x), 3.0, 2.0)).astype(np.float32)
def coracao(d, bpm0, bpm1):
    out = np.zeros(int(d * SR), np.float32); t = 0.0
    bate = lambda: (np.sin(2 * np.pi * 48 * tt(0.18)) * np.exp(-tt(0.18) * 22)).astype(np.float32)
    while t < d - 0.5:
        for dt, g in [(0, 1.0), (0.17, 0.7)]:
            i = int((t + dt) * SR); b = bate()[:len(out) - i]; out[i:i + len(b)] += b * g
        t += 60 / T_lerp(bpm0, bpm1, t / d)
    return out
T_lerp = lambda a, b, u: a + (b - a) * min(1, max(0, u))
def vidro(d, f=1760):  # tom agudo de vidro, com tremolo
    x = tt(d); y = np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * f * 1.5017 * x)
    return (y * (0.6 + 0.4 * np.sin(2 * np.pi * 5.3 * x)) * env_ad(len(x), 1.5, 1.5) * 0.25).astype(np.float32)
def batida(d=3.0, f=38):  # impacto grave com cauda
    x = tt(d); y = np.sin(2 * np.pi * f * x * (1 + 0.6 * np.exp(-x * 6))) * np.exp(-x * 1.6)
    y += 0.5 * lp(rng.standard_normal(len(x)).astype(np.float32), 400) * np.exp(-x * 7)
    return (y / np.abs(y).max()).astype(np.float32)
def subida(d):  # riser: ruído filtrado + tom que sobe
    x = tt(d); u = x / d; f = 200 + 1600 * u ** 2
    y = 0.4 * np.sin(2 * np.pi * np.cumsum(f) / SR) + bp(rng.standard_normal(len(x)).astype(np.float32), 600, 5000) * 0.6
    return (y * u ** 2).astype(np.float32)
def guincho(d=2.2):  # cordas dissonantes (cluster) que crescem
    x = tt(d); y = sum(np.sin(2 * np.pi * f * x + 3 * np.sin(2 * np.pi * 6 * x)) for f in [622, 659, 698, 740])
    return (y / 4 * np.minimum(1, x / 0.15) * np.exp(-np.maximum(0, x - 0.6) * 1.8)).astype(np.float32)
def sussurros(d):  # "vozes" de ruído formântico, bem baixinhas
    x = tt(d); n = rng.standard_normal(len(x)).astype(np.float32)
    y = bp(n, 900, 2600) * (0.5 + 0.5 * np.sin(2 * np.pi * 3.1 * x + np.sin(2 * np.pi * 0.7 * x) * 4)) ** 2
    return (y * env_ad(len(x), 1.0, 1.0)).astype(np.float32)
def reverso(d=1.6):  # som invertido que suga pro silêncio
    b = batida(d, 70)[::-1].copy(); return b

# camadas ao longo do episódio
poe(mus, batida(3.5, 34), 0.15, 0.8)                                       # abre o cartão
poe(mus, drone(E('ANDA') - INI + 1, 49), INI, 0.4)                         # entrando no ônibus vazio
poe(mus, sussurros(E('ANDA') - E('SOBE')), E('SOBE'), 0.1)
poe(mus, vidro(E('BONE') - E('PROCURA') + 3, 1568), E('PROCURA'), 0.18)
poe(mus, batida(2.5, 44), E('BONE') + 0.2, 0.55)                           # o boné
poe(mus, pad(E('SUSSURRO') - E('ANDA'), [110, 130.8, 155.6]), E('ANDA'), 0.22)  # a viagem (lá menor com 5ª diminuta)
poe(mus, drone(E('SUSSURRO') - E('ANDA'), 41.2), E('ANDA'), 0.35)
poe(mus, batida(3, 40), E('MSG'), 0.6)
for k in ['JANELA1', 'JANELA2', 'JANELA3']: poe(mus, guincho(1.6) * 0.5, E(k) + 1.2, 0.25)   # a mulher de novo
tic = (np.sin(2 * np.pi * 2400 * tt(0.02)) * np.exp(-tt(0.02) * 300)).astype(np.float32)
for k in range(int((E('SUSSURRO') - E('HORA')) / 0.35)): poe(mus, tic, E('HORA') + k * 0.35, 0.35)        # relógio andando pra trás
poe(mus, reverso(1.4), E('SUSSURRO') - 1.4, 0.45)
poe(mus, coracao(E('VIRA') - E('SUSSURRO'), 64, 96), E('SUSSURRO'), 0.55)
poe(mus, drone(E('VIRA') - E('SUSSURRO') + 1, 46.25), E('SUSSURRO'), 0.45)
poe(mus, pad(E('VIRA') - E('SUSSURRO'), [92.5, 98, 138.6], 0.006), E('SUSSURRO'), 0.2)
poe(mus, subida(E('VIRA') - E('b2')), E('b2'), 0.3)
poe(mus, batida(4, 30), E('VIRA') + 0.55, 1.0)                              # ele em pé no corredor
poe(mus, guincho(2.4), E('VIRA') + 0.55, 0.35)
poe(mus, drone(E('PARA') - E('VIRA'), 36.7), E('VIRA') + 0.5, 0.45)
poe(mus, batida(4, 34), E('b3') + EV['b3']['d'] + 0.1, 0.8)
poe(mus, subida(E('VE') - E('PARA') + 0.8), E('PARA'), 0.3)
poe(mus, batida(4, 32), E('VE') + 0.9, 1.0)                                 # tu mesmo no ponto
poe(mus, vidro(INI + DUR - E('VE'), 1046), E('VE') + 0.9, 0.3)
poe(mus, batida(4, 32), INI + DUR, 0.9)                                     # corte pro cartão final
poe(mus, vidro(CARD, 1318), INI + DUR + 0.2, 0.35)

# ---------------- efeitos ----------------
passos = wav(S + 'passos.wav'); vibra = wav(S + 'vibra.wav'); onibus = wav(S + 'onibus.wav')
motor = lp(np.tile(onibus[int(0.5 * SR):int(3.5 * SR)], 40), 500)
porta = lambda: (bp(rng.standard_normal(int(0.9 * SR)).astype(np.float32), 1500, 7000) * env_ad(int(0.9 * SR), 0.03, 0.5) * 0.6).astype(np.float32)
lento = lambda x: lp(x, 260)
laco(sfx, lento(motor), INI - 0.5, E('ANDA'), 0.35, fi=0.5, fo=0.5)          # motor em marcha lenta
laco(sfx, motor, E('ANDA'), E('PARA'), 0.28, fi=1.5, fo=1.2)                  # rodando
poe(sfx, onibus, E('PARA') - 2.6, 0.6)                                         # freio
poe(sfx, passos[:int(0.9 * SR)], E('SOBE') + 0.1, 0.7)                        # sobe o degrau
poe(sfx, porta(), E('SOBE') + 1.0, 0.55); poe(sfx, batida(0.5, 90) * 0.4, E('SOBE') + 1.55, 0.5)
poe(sfx, passos, E('PROCURA') + 0.2, 0.55); poe(sfx, passos[:int(1.4 * SR)], E('ATRAS') + 0.1, 0.6)
poe(sfx, passos[:int(1.2 * SR)], E('VIRA') + 0.55, 0.5)                       # alguém andando no corredor
eco = lp(passos, 1500); poe(sfx, eco, E('JANELA2') + 0.2, 0.25); poe(sfx, eco, E('HORA') + 2.0, 0.25)   # passos lá atrás, sem ninguém
poe(sfx, vibra, E('MSG'), 0.8)
zz = (np.sign(np.sin(2 * np.pi * 120 * tt(1.4))) * 0.05).astype(np.float32)  # lâmpada piscando
for k in ['VIRA', 'PARA']: poe(sfx, zz * (rng.random(len(zz)) > 0.3), E(k) - 0.2, 0.5)
rangido = (np.sin(2 * np.pi * np.cumsum(300 + 120 * np.sin(2 * np.pi * 3 * tt(0.9))) / SR) * env_ad(int(0.9 * SR), 0.1, 0.4) * 0.3).astype(np.float32)
poe(sfx, bp(rangido, 200, 3000), E('ANDA') + 6, 0.3); poe(sfx, bp(rangido, 200, 3000), E('JANELA3') - 1.0, 0.3)
poe(sfx, porta(), E('VE') + 0.4, 0.5)                                         # a porta abre no ponto

# ---------------- mixagem (abaixa trilha e efeitos sob as falas) ----------------
envv = np.convolve(np.abs(voz), np.ones(4800) / 4800, 'same'); duck = 1 - 0.55 * np.clip(envv / 0.03, 0, 1)
duck = np.convolve(duck, np.ones(9600) / 9600, 'same').astype(np.float32)
mix = voz * 1.0 + sfx * (0.5 + 0.4 * duck) * 0.8 + mus * duck * 0.6
mix = mix / np.abs(mix).max() * 0.9
mix[:int(TOTAL * SR)].astype(np.float32).tofile('audio_ep3.f32')

# ---------------- cartões ----------------
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; F = lambda s: ImageFont.truetype(FB, s)
def base(arg):
    subprocess.run(['ffmpeg', '-v', 'error', '-y'] + arg + ['-i', 'ep3.mp4', '-frames:v', '1', 'q.png'], check=True)
    im = Image.open('q.png').convert('RGB').filter(ImageFilter.GaussianBlur(14))
    im = Image.blend(im, Image.new('RGB', im.size, (8, 10, 16)), 0.62); return im, ImageDraw.Draw(im)
def c(d, txt, y, s, cor): w = d.textlength(txt, font=F(s)); d.text(((W - w) / 2, y), txt, font=F(s), fill=cor, stroke_width=3, stroke_fill=(0, 0, 0))
def botao(d, x0, y0, x1, y1, txt, s, cor):
    d.rounded_rectangle([x0, y0, x1, y1], 24, fill=cor)
    for j, l in enumerate(txt):
        w = d.textlength(l, font=F(s)); d.text(((x0 + x1 - w) / 2, (y0 + y1) / 2 - len(txt) * s * 0.6 + j * s * 1.2), l, font=F(s), fill=(255, 255, 255))
im, d = base(['-ss', '0'])
c(d, 'EPISÓDIO 3', 400, 64, (255, 255, 255)); c(d, 'VOCÊS ESCOLHERAM:', 520, 40, (230, 230, 230))
botao(d, 110, 590, 610, 720, ['SUBIR PRA', 'SALVAR O AMIGO'], 40, (60, 170, 100)); im.save('c3_ini.png')
im, d = base(['-sseof', '-0.1'])
c(d, 'O QUE VOCÊ FARIA?', 380, 54, (255, 255, 255))
botao(d, 50, 500, 345, 640, ['DESCER', 'SOZINHO'], 34, (225, 70, 70))
botao(d, 375, 500, 670, 640, ['FICAR COM', 'O AMIGO'], 34, (60, 170, 100))
c(d, 'Comenta aqui embaixo', 690, 36, (230, 230, 230)); c(d, 'Segue pra ver a parte 4', 820, 42, (255, 214, 90)); im.save('c3_fim.png')
for nome, dd, vf in [('c3_ini', INI, 'fade=out:st=%.2f:d=0.4' % (INI - 0.4)), ('c3_fim', CARD, 'fade=in:st=0:d=0.5')]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', nome + '.png', '-t', str(dd), '-r', '30', '-vf', vf, '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', nome + '.mp4'], check=True)
open('lista_ep3.txt', 'w').write("file 'c3_ini.mp4'\nfile 'ep3.mp4'\nfile 'c3_fim.mp4'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'lista_ep3.txt', '-c', 'copy', 'video_ep3.mp4'], check=True)

# ---------------- legendas ----------------
COR = {'tu': '0xffffff', 'amigo': '0xffd27a', 'grav': '0xbdbdbd', 'mot': '0xff5a5a', 'msg': '0x8affc1'}
os.makedirs('legf3', exist_ok=True); fil = []; legs.sort()
def quebra(x, n=30):
    linhas, cur = [], ''
    for w in x.split():
        if cur and len(cur) + 1 + len(w) > n: linhas.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return linhas + [cur]
for i, (a, b, quem, x) in enumerate(legs):
    b = min(b + 0.4, legs[i + 1][0] - 0.05) if i + 1 < len(legs) else b + 0.5
    for j, l in enumerate(quebra(x)):
        open(f'legf3/{i}_{j}.txt', 'w').write(l)
        fil.append(f"drawtext=fontfile={FB}:textfile=legf3/{i}_{j}.txt:fontsize=31:fontcolor={COR[quem]}:borderw=4:bordercolor=0x111111:x=(w-tw)/2:y=h*0.15+{j * 42}:enable='between(t,{a:.2f},{b:.2f})'")
fil.append(f"drawtext=fontfile={FB}:text='@Cardeno_Amarelo':fontsize=22:fontcolor=white@0.55:borderw=2:bordercolor=0x000000@0.4:x=40+(w-tw-80)*(0.5+0.5*sin(t*0.37)):y=h*0.07+40*sin(t*0.23)")
open('filtro_ep3.txt', 'w').write(','.join(fil))
saida = 'ligacao_numero_ep3_3d.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'video_ep3.mp4', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'audio_ep3.f32', '-filter_script:v', 'filtro_ep3.txt',
                '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-c:v', 'libx264', '-preset', 'slow', '-b:v', '650k', '-maxrate', '1100k', '-bufsize', '2000k', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '112k', '-ar', '48000', '-movflags', '+faststart', '-shortest', saida], check=True)
print('ok', round(TOTAL, 1), 's', os.path.getsize(saida) // 1024, 'KB')
