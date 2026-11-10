# Monta a parte 4 (final): cartão + ep4.mp4 + volta pro quarto da parte 1 + FIM?, com falas, trilha de suspense sintetizada,
# sons estranhos, passos e legendas. Uso: python3 tl_ep4.py && node ../../_toon3d/render.js cena_ep4.js ep3.mp4 --dados dados_ep4.json && python3 montar_ep4.py
import json, os, subprocess, numpy as np
from scipy.signal import butter, sosfilt
AQ = os.path.dirname(os.path.abspath(__file__)); os.chdir(AQ)
SR = 48000; S = '../sfx/'; W, H = 720, 1280
TLD = json.load(open('tl_ep4.json')); EV = TLD['ev']; DUR = TLD['dur']
E = lambda k: EV[k]['t'] + INI
fim = lambda k: E(k) + EV[k]['d']
INI, CARD = 2.6, 4.0
Q0, QD = 7.5, 9.4   # trecho do quarto.mp4 (parte 1): toca, 'é o meu', 'Alô?', 'Não entra no ônibus das 7.'
TQ = INI + DUR      # começo do quarto
TOTAL = INI + DUR + QD + CARD
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
legs.append((E('NOTI') + 0.6, E('b1') + 1.4, 'msg', 'Notícia: "Ônibus 7 cai em córrego durante temporal às 7h. Ninguém sobreviveu."'))
QT = json.load(open('tl.json'))['quarto']['ev']
for k in ['a2', 'a3', 'a4']:
    e = QT[k]; tq = TQ + e['t'] - Q0
    a = wav(os.path.join('..', 'falas', e['arq'] + '.wav')); a = a / (np.abs(a).max() + 1e-9) * 0.85; poe(voz, a, tq, 1.0)
    legs.append((tq, tq + e['d'], e['quem'], e['leg']))

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
poe(mus, drone(E('NOTI') - INI + 1, 46.25), INI, 0.4)
poe(mus, vidro(E('VIRA') - INI, 1568), INI + 0.5, 0.15)
poe(mus, sussurros(E('NOTI') - E('VIRA')), E('VIRA'), 0.12)
poe(mus, batida(3, 40), E('VIRA') + 0.1, 0.55)                              # o motorista ali no corredor
poe(mus, batida(3.5, 34), E('NOTI'), 0.8)                                   # a notícia
poe(mus, coracao(E('OLHAM') - E('NOTI'), 58, 84), E('NOTI'), 0.5)
poe(mus, drone(E('OLHAM') - E('NOTI') + 1, 38.9), E('NOTI'), 0.45)
poe(mus, pad(E('CORRE') - E('OLHAM') + 1, [110, 130.8, 164.8, 196], 0.002), E('OLHAM'), 0.28)   # amizade (lá menor 7)
poe(mus, subida(E('CORRE') - E('a4')), E('a4'), 0.25)
poe(mus, drone(E('APAGA') - E('CORRE'), 55), E('CORRE'), 0.35)
poe(mus, reverso(1.4), E('APAGA') - 1.4, 0.5)
poe(mus, batida(4, 30), E('APAGA'), 1.0)                                    # apaga tudo
poe(mus, vidro(E('CEL') - E('APAGA'), 1046), E('APAGA') + 0.6, 0.3)
poe(mus, drone(TQ - E('APAGA'), 32.7), E('APAGA') + 0.3, 0.32)
poe(mus, subida(TQ - E('CEL')), E('CEL'), 0.3)
poe(mus, batida(3, 36), TQ, 0.9)                                            # corta pro quarto
poe(mus, drone(QD, 41.2) * 0.6, TQ + 0.5, 0.3)
poe(mus, batida(4.5, 28), TQ + QD, 1.0)                                     # FIM?
poe(mus, vidro(CARD, 880), TQ + QD + 0.3, 0.3)

# ---------------- efeitos ----------------
passos = wav(S + 'passos.wav'); vibra = wav(S + 'vibra.wav'); onibus = wav(S + 'onibus.wav'); toque = wav(S + 'toque.wav')
motor = lp(np.tile(onibus[int(0.5 * SR):int(3.5 * SR)], 40), 260)
porta = lambda: (bp(rng.standard_normal(int(0.9 * SR)).astype(np.float32), 1500, 7000) * env_ad(int(0.9 * SR), 0.03, 0.5) * 0.6).astype(np.float32)
laco(sfx, motor, INI - 0.5, E('APAGA') + 0.1, 0.3, fi=0.5, fo=0.08)          # motor parado; morre quando apaga
poe(sfx, passos[:int(1.3 * SR)], E('VIRA') + 1.4, 0.45); poe(sfx, passos, E('b1'), 0.35)      # o motorista vem andando
poe(sfx, vibra, E('NOTI'), 0.8)
poe(sfx, passos, E('CORRE'), 0.75)                                           # amigo corre
poe(sfx, porta(), E('CORRE') + 0.4, 0.55); poe(sfx, porta(), E('FECHA'), 0.55); poe(sfx, batida(0.5, 90) * 0.4, E('FECHA') + 0.55, 0.5)
zz = (np.sign(np.sin(2 * np.pi * 120 * tt(1.4))) * 0.05).astype(np.float32)
for k in ['VIRA', 'APAGA']: poe(sfx, zz * (rng.random(len(zz)) > 0.3), E(k) - 0.6, 0.5)
eco = lp(passos, 1500); poe(sfx, eco, E('APAGA') + 2.0, 0.25)                # passos no escuro
bip = lambda d, f=425: (np.sin(2 * np.pi * f * tt(d)) * env_ad(int(d * SR), 0.01, 0.02) * 0.35).astype(np.float32)
clique = (np.sin(2 * np.pi * 1800 * tt(0.04)) * np.exp(-tt(0.04) * 120)).astype(np.float32)
poe(sfx, clique, E('CEL') + 1.8, 0.4)
t = E('CEL') + 2.0
while t < E('a6') - 0.3: poe(sfx, bp(bip(1.0), 300, 3300), t, 0.6); t += 2.0
# quarto da parte 1: fundo, toque, atende
laco(sfx, wav(S + 'fundo.wav'), TQ, TQ + QD, 0.3, fi=0.3, fo=0.3)
t = TQ + QT['TOQ']['t'] - Q0
while t < TQ + QT['VERDE']['t'] - Q0: poe(sfx, toque[:int(min(len(toque) / SR, TQ + QT['VERDE']['t'] - Q0 - t) * SR)], t, 0.45); t += len(toque) / SR
poe(sfx, clique, TQ + QT['VERDE']['t'] - Q0, 0.4)

# ---------------- mixagem (abaixa trilha e efeitos sob as falas) ----------------
envv = np.convolve(np.abs(voz), np.ones(4800) / 4800, 'same'); duck = 1 - 0.72 * np.clip(envv / 0.03, 0, 1)   # trilha bem mais baixa enquanto alguém fala
duck = np.convolve(duck, np.ones(9600) / 9600, 'same').astype(np.float32)
mix = voz * 1.0 + sfx * (0.5 + 0.4 * duck) * 0.8 + mus * duck * 0.6
mix = mix / np.abs(mix).max() * 0.9
mix[:int(TOTAL * SR)].astype(np.float32).tofile('audio_ep4.f32')

# ---------------- cartões ----------------
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; F = lambda s: ImageFont.truetype(FB, s)
def base(arg):
    subprocess.run(['ffmpeg', '-v', 'error', '-y'] + arg + ['-i', 'ep4.mp4', '-frames:v', '1', 'q.png'], check=True)
    im = Image.open('q.png').convert('RGB').filter(ImageFilter.GaussianBlur(14))
    im = Image.blend(im, Image.new('RGB', im.size, (8, 10, 16)), 0.62); return im, ImageDraw.Draw(im)
def c(d, txt, y, s, cor): w = d.textlength(txt, font=F(s)); d.text(((W - w) / 2, y), txt, font=F(s), fill=cor, stroke_width=3, stroke_fill=(0, 0, 0))
def botao(d, x0, y0, x1, y1, txt, s, cor):
    d.rounded_rectangle([x0, y0, x1, y1], 24, fill=cor)
    for j, l in enumerate(txt):
        w = d.textlength(l, font=F(s)); d.text(((x0 + x1 - w) / 2, (y0 + y1) / 2 - len(txt) * s * 0.6 + j * s * 1.2), l, font=F(s), fill=(255, 255, 255))
im, d = base(['-ss', '0'])
c(d, 'PARTE 4', 430, 70, (255, 255, 255)); botao(d, 210, 540, 510, 640, ['FINAL'], 56, (225, 60, 60)); im.save('c4_ini.png')
im = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(im)
c(d, 'FIM?', 540, 120, (235, 60, 60)); c(d, 'Segue pra mais histórias assim', 760, 36, (255, 214, 90)); im.save('c4_fim.png')
for nome, dd, vf in [('c4_ini', INI, 'fade=out:st=%.2f:d=0.4' % (INI - 0.4)), ('c4_fim', CARD, 'fade=in:st=0:d=0.3')]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', nome + '.png', '-t', str(dd), '-r', '30', '-vf', vf, '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', nome + '.mp4'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(Q0), '-t', str(QD), '-i', 'quarto.mp4', '-r', '30', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', 'quarto_fim.mp4'], check=True)
open('lista_ep4.txt', 'w').write("file 'c4_ini.mp4'\nfile 'ep4.mp4'\nfile 'quarto_fim.mp4'\nfile 'c4_fim.mp4'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'lista_ep4.txt', '-c', 'copy', 'video_ep4.mp4'], check=True)

# ---------------- legendas ----------------
COR = {'tu': '0xffffff', 'amigo': '0xffd27a', 'grav': '0xbdbdbd', 'mot': '0xff5a5a', 'msg': '0x8affc1', 'tel': '0xff8a8a'}
os.makedirs('legf4', exist_ok=True); fil = []; legs.sort()
def quebra(x, n=30):
    linhas, cur = [], ''
    for w in x.split():
        if cur and len(cur) + 1 + len(w) > n: linhas.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return linhas + [cur]
for i, (a, b, quem, x) in enumerate(legs):
    b = min(b + 0.4, legs[i + 1][0] - 0.05) if i + 1 < len(legs) else b + 0.5
    for j, l in enumerate(quebra(x)):
        open(f'legf4/{i}_{j}.txt', 'w').write(l)
        fil.append(f"drawtext=fontfile={FB}:textfile=legf4/{i}_{j}.txt:fontsize=31:fontcolor={COR[quem]}:borderw=4:bordercolor=0x111111:x=(w-tw)/2:y=h*0.15+{j * 42}:enable='between(t,{a:.2f},{b:.2f})'")
fil.append(f"drawtext=fontfile={FB}:text='@Cardeno_Amarelo':fontsize=22:fontcolor=white@0.55:borderw=2:bordercolor=0x000000@0.4:x=40+(w-tw-80)*(0.5+0.5*sin(t*0.37)):y=h*0.07+40*sin(t*0.23)")
open('filtro_ep4.txt', 'w').write(','.join(fil))
saida = 'ligacao_numero_ep4_3d.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'video_ep4.mp4', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'audio_ep4.f32', '-filter_script:v', 'filtro_ep4.txt',
                '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-c:v', 'libx264', '-preset', 'slow', '-b:v', '650k', '-maxrate', '1100k', '-bufsize', '2000k', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '112k', '-ar', '48000', '-movflags', '+faststart', '-shortest', saida], check=True)
print('ok', round(TOTAL, 1), 's', os.path.getsize(saida) // 1024, 'KB')
