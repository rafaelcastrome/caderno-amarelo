# Monta a parte 1: p1.mp4 (render) + cartão final, com falas, trilha de suspense sintetizada, efeitos e legendas.
# Uso: python3 tl_p1.py && ./render_pedacos.sh && python3 montar_p1.py
import json, os, subprocess, numpy as np
from scipy.signal import butter, sosfilt
AQ = os.path.dirname(os.path.abspath(__file__)); os.chdir(AQ)
SR = 48000; S = '../sfx/'; FA = '../falas/p1v2/'; W, H = 720, 1280
TLD = json.load(open('tl_p1.json')); EV = TLD['ev']; DUR = TLD['dur']
E = lambda k: EV[k]['t']
fim = lambda k: E(k) + EV[k]['d']
CARD = 4.5
TOTAL = DUR + CARD
def wav(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).copy()
N = int((TOTAL + 1) * SR)
voz, sfx, mus = (np.zeros(N, np.float32) for _ in range(3))
def poe(buf, a, t, g=1.0):
    i = int(t * SR); a = a[:max(0, N - i)]; buf[i:i + len(a)] += a * g
def laco(buf, a, de, ate, g, fi=0.8, fo=0.8):
    n = int((ate - de) * SR); a = np.tile(a, n // len(a) + 1)[:n]; env = np.ones(n)
    f1, f2 = max(1, int(fi * SR)), max(1, int(fo * SR)); env[:f1] = np.linspace(0, 1, f1); env[-f2:] = np.linspace(1, 0, f2); poe(buf, a * env, de, g)
tt = lambda d: np.arange(int(d * SR)) / SR
rng = np.random.default_rng(7)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x).astype(np.float32)
hp = lambda x, f: sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x).astype(np.float32)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], 'bandpass', fs=SR, output='sos'), x).astype(np.float32)
def env_ad(n, a, r): e = np.ones(n); a, r = int(a * SR), int(r * SR); e[:a] = np.linspace(0, 1, max(1, a)); e[-r:] *= np.linspace(1, 0, max(1, r)); return e
ruido = lambda d: rng.standard_normal(int(d * SR)).astype(np.float32)

# ---------------- falas ----------------
legs = []
for k, e in EV.items():
    if 'arq' not in e: continue
    p = FA + e['arq'] + '.wav'
    if not os.path.exists(p): continue
    a = wav(p); a = a / (np.abs(a).max() + 1e-9) * 0.85
    if e['quem'] == 'mae':  # atrás da porta de aço: abafada e com eco de concreto
        a = lp(a, 1300) * 1.6; eco = np.zeros(len(a) + int(0.5 * SR), np.float32); eco[:len(a)] += a
        for dt, g in [(0.09, 0.35), (0.19, 0.2), (0.31, 0.1)]: i = int(dt * SR); eco[i:i + len(a)] += a * g
        a = eco / np.abs(eco).max() * 0.8
    if k == 'l8': a = lp(a, 5000) * 0.9  # Léo, frio e baixo
    poe(voz, a, E(k), 1.0)
    legs.append((E(k), fim(k), e['quem'], e['leg']))

# ---------------- trilha (sintetizada) ----------------
def drone(d, f0=55.0):
    x = tt(d); lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * x)
    y = 0.5 * np.sin(2 * np.pi * f0 * x) + 0.3 * np.sin(2 * np.pi * f0 * 1.0595 * x) + 0.25 * np.sin(2 * np.pi * f0 * 0.5 * x)
    y += 0.12 * lp(ruido(d), 180)
    return (y * lfo * env_ad(len(x), 2.0, 1.5)).astype(np.float32)
def pulso(d, bpm, f=55):  # ostinato grave de perseguição
    out = np.zeros(int(d * SR), np.float32); per = 60 / bpm; t = 0.0; k = 0
    while t < d - 0.3:
        x = tt(0.22); n = (np.sin(2 * np.pi * f * (1.5 if k % 4 == 3 else 1) * x) + 0.4 * np.sign(np.sin(2 * np.pi * f * 2 * x)) * 0.3) * np.exp(-x * 9)
        i = int(t * SR); out[i:i + len(n)] += n[:len(out) - i]; t += per / 2; k += 1
    return lp(out, 1200) * env_ad(len(out), 0.3, 0.6).astype(np.float32)
def vidro(d, f=1760):
    x = tt(d); y = np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * f * 1.5017 * x)
    return (y * (0.6 + 0.4 * np.sin(2 * np.pi * 5.3 * x)) * env_ad(len(x), 1.5, 1.5) * 0.25).astype(np.float32)
def batida(d=3.0, f=38):
    x = tt(d); y = np.sin(2 * np.pi * f * x * (1 + 0.6 * np.exp(-x * 6))) * np.exp(-x * 1.6)
    y += 0.5 * lp(ruido(d), 400) * np.exp(-x * 7)
    return (y / np.abs(y).max()).astype(np.float32)
def subida(d):
    x = tt(d); u = x / d; f = 200 + 1600 * u ** 2
    y = 0.4 * np.sin(2 * np.pi * np.cumsum(f) / SR) + bp(ruido(d), 600, 5000) * 0.6
    return (y * u ** 2).astype(np.float32)
def guincho(d=2.2):
    x = tt(d); y = sum(np.sin(2 * np.pi * f * x + 3 * np.sin(2 * np.pi * 6 * x)) for f in [622, 659, 698, 740])
    return (y / 4 * np.minimum(1, x / 0.15) * np.exp(-np.maximum(0, x - 0.6) * 1.8)).astype(np.float32)
def sussurros(d):
    x = tt(d); n = ruido(d)
    y = bp(n, 900, 2600) * (0.5 + 0.5 * np.sin(2 * np.pi * 3.1 * x + np.sin(2 * np.pi * 0.7 * x) * 4)) ** 2
    return (y * env_ad(len(x), 1.0, 1.0)).astype(np.float32)
def coracao(d, b0, b1):
    out = np.zeros(int(d * SR), np.float32); t = 0.0
    bate = lambda: (np.sin(2 * np.pi * 48 * tt(0.18)) * np.exp(-tt(0.18) * 22)).astype(np.float32)
    while t < d - 0.5:
        for dt, g in [(0, 1.0), (0.17, 0.7)]:
            i = int((t + dt) * SR); b = bate()[:len(out) - i]; out[i:i + len(b)] += b * g
        t += 60 / (b0 + (b1 - b0) * min(1, t / d))
    return out
reverso = lambda d=1.6: batida(d, 70)[::-1].copy()

poe(mus, batida(3.5, 34), E('ALERTA') + 0.05, 0.6)
poe(mus, drone(E('GRADES') - E('ALERTA') + 1, 46.25), E('ALERTA') + 1.0, 0.32)
poe(mus, vidro(E('LEOSAI') - E('l1'), 1568), E('l1'), 0.1)
poe(mus, subida(2.4), E('GRADES') - 2.2, 0.25); poe(mus, batida(3, 40), E('GRADES') + 0.2, 0.55)
poe(mus, drone(E('BAM') - E('GRADES'), 41.2), E('GRADES'), 0.38)
poe(mus, sussurros(E('e0') - E('ANDA')), E('ANDA'), 0.1)
poe(mus, batida(2.5, 44), E('e0'), 0.5)                                       # o segurança grita
poe(mus, coracao(E('BAM') - E('e3'), 60, 92), E('e3'), 0.45)
poe(mus, reverso(1.3), E('BAM') - 1.3, 0.55)
poe(mus, batida(4, 30), E('BAM'), 1.0); poe(mus, guincho(2.4), E('BAM') + 0.05, 0.35)  # mão no vidro
poe(mus, pulso(E('CORREDOR') + 1.5 - E('e4'), 150, 49), E('e4'), 0.55)        # correria
poe(mus, drone(E('CORREDOR') + 2 - E('e4'), 36.7), E('e4'), 0.35)
poe(mus, batida(3, 36), E('FECHA') + 1.05, 0.6)                               # porta de aço fecha
poe(mus, drone(E('TOC') - E('FECHA'), 32.7), E('FECHA') + 0.8, 0.3)
poe(mus, vidro(E('TOC') - E('n1'), 1046), E('n1'), 0.12)
poe(mus, sussurros(E('SILENCIO') - E('n2')), E('n2'), 0.14)
poe(mus, batida(3.5, 34), E('n3') + EV['n3']['d'] - 0.2, 0.55)                # "e sobrava"
poe(mus, coracao(E('VISOR') - E('TOC'), 72, 110), E('TOC'), 0.55)
poe(mus, drone(DUR - E('TOC') + 1, 30.9), E('TOC') + 0.5, 0.38)
poe(mus, subida(E('VISOR') + EV['VISOR']['d'] - E('mae1')), E('mae1'), 0.3)
poe(mus, batida(4, 28), E('l8') - 0.05, 1.0); poe(mus, guincho(2.6), E('l8') + 0.3, 0.3)
poe(mus, batida(4.5, 26), DUR, 1.0); poe(mus, vidro(CARD, 880), DUR + 0.3, 0.3)

# ---------------- efeitos ----------------
passos = wav(S + 'passos.wav'); vibra = wav(S + 'vibra.wav')
# murmúrio da praça
murm = bp(ruido(6), 250, 1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.9 * tt(6)) ** 2)
laco(sfx, murm, 0, E('GRADES') + 2.0, 0.22, fi=0.3, fo=1.5)
# alerta de emergência: tom duplo forte, em vários celulares
x = tt(3.0); sir = np.sign(np.sin(2 * np.pi * np.where((x * 2.5) % 1 < 0.5, 853, 960) * x)) * 0.25
sir = lp(sir.astype(np.float32), 4000) * env_ad(len(x), 0.02, 0.3)
poe(sfx, sir, E('ALERTA'), 0.85); poe(sfx, lp(sir, 1500), E('ALERTA') + 0.12, 0.4); poe(sfx, vibra, E('ALERTA'), 0.7)
# grades descendo: chacoalhar de metal
for k in range(5):
    d = 2.6; g = bp(ruido(d), 1200, 6000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 14 * tt(d)))) * env_ad(int(d * SR), 0.1, 0.4)
    poe(sfx, g, E('GRADES') + 0.2 + k * 0.35, 0.18)
    poe(sfx, batida(0.5, 110) * 0.3, E('GRADES') + 0.2 + k * 0.35 + d, 0.4)
# zumbido da luz piscando
zz = (np.sign(np.sin(2 * np.pi * 120 * tt(1.4))) * 0.05).astype(np.float32)
poe(sfx, zz * (rng.random(len(zz)) > 0.3), E('GRADES') - 0.2, 0.5)
# passos: levantar e andar até o vidro; Edson chegando; Léo correndo; fuga; escada; depósito
def passos_de(t0, t1, ritmo, g, f=1.0):
    t = t0
    while t < t1:
        p = passos[:int(0.25 * SR)]; poe(sfx, lp(p, 3500 * f), t, g); t += ritmo
passos_de(E('GRADES') + 1.8, E('VIDRO') + 0.2, 0.5, 0.35)
passos_de(E('e0') - 1.2, E('e0') + 0.6, 0.45, 0.3)
passos_de(E('LEOVOLTA'), E('LEOVOLTA') + 2.0, 0.28, 0.4)
passos_de(E('CORRE'), E('CORRE') + EV['CORRE']['d'], 0.24, 0.6)
passos_de(E('CORRE') + 0.1, E('CORRE') + EV['CORRE']['d'], 0.27, 0.35, 0.6)
passos_de(E('ESCADA'), E('ESCADA') + EV['ESCADA']['d'], 0.2, 0.55, 0.7)
passos_de(E('CORREDOR'), E('CORREDOR') + 1.8, 0.3, 0.45, 0.6)
passos_de(E('FECHA') + 0.2, E('FECHA') + 1.8, 0.45, 0.3, 0.6)
passos_de(E('LEVANTA') + 0.2, E('mae1'), 0.6, 0.25, 0.5)
# respiração ofegante na correria
x = tt(EV['CORRE']['d'] + 3.5); resp = bp(ruido(len(x) / SR), 500, 2500) * np.maximum(0, np.sin(2 * np.pi * 1.6 * x)) ** 2
poe(sfx, resp * env_ad(len(x), 0.3, 1.5), E('CORRE'), 0.12)
# batida no vidro (BAM) e batidas que seguem pelo corredor
poe(sfx, batida(1.2, 70), E('BAM'), 0.9); poe(sfx, bp(ruido(0.4), 2000, 7000) * env_ad(int(0.4 * SR), 0.005, 0.35), E('BAM'), 0.3)
for k in range(6): poe(sfx, lp(batida(0.8, 80), 600), E('CORRE') + 0.4 + k * 0.62, 0.45 - k * 0.04)
# porta de funcionários abre; porta de aço fecha (clang)
ran = lambda: (bp(ruido(0.9), 300, 2000) * env_ad(int(0.9 * SR), 0.05, 0.5) * 0.4).astype(np.float32)
poe(sfx, ran(), E('CORRE') + 2.8, 0.5)
x = tt(2.2); clang = (np.sin(2 * np.pi * 180 * x) + 0.6 * np.sin(2 * np.pi * 437 * x) + 0.4 * np.sin(2 * np.pi * 731 * x)) * np.exp(-x * 3.5)
clang = (clang / np.abs(clang).max()).astype(np.float32); poe(sfx, ran(), E('FECHA') + 0.4, 0.4); poe(sfx, clang, E('FECHA') + 1.05, 0.6); poe(sfx, batida(1.5, 50), E('FECHA') + 1.05, 0.5)
# zumbido da lâmpada no depósito
hum = (np.sin(2 * np.pi * 120 * tt(4)) * 0.6 + 0.3 * np.sin(2 * np.pi * 240 * tt(4))).astype(np.float32)
laco(sfx, hum, E('FECHA') + 1.2, DUR, 0.05)
poe(sfx, zz, E('SILENCIO') + 0.4, 0.5)
# TOC TOC TOC na porta de aço
x = tt(0.6); toc = (np.sin(2 * np.pi * 95 * x) * np.exp(-x * 14) + 0.5 * np.sin(2 * np.pi * 260 * x) * np.exp(-x * 25)).astype(np.float32)
toc += np.convolve(toc, np.r_[np.zeros(int(0.07 * SR)), [0.35]], 'full')[:len(toc)]
for k in range(3): poe(sfx, toc, E('TOC') + 0.25 + k * 0.55, 1.0)
for k in range(2): poe(sfx, toc, E('mae0') + EV['mae0']['d'] + 0.2 + k * 0.5, 0.6)

# ---------------- mixagem ----------------
envv = np.convolve(np.abs(voz), np.ones(4800) / 4800, 'same'); duck = 1 - 0.7 * np.clip(envv / 0.03, 0, 1)
duck = np.convolve(duck, np.ones(9600) / 9600, 'same').astype(np.float32)
mix = voz * 1.0 + sfx * (0.5 + 0.4 * duck) * 0.85 + mus * duck * 0.6
mix = mix / np.abs(mix).max() * 0.9
mix[:int(TOTAL * SR)].astype(np.float32).tofile('audio_p1.f32')

# ---------------- cartão final ----------------
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; F = lambda s: ImageFont.truetype(FB, s)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-0.1', '-i', 'p1.mp4', '-frames:v', '1', 'q.png'], check=True)
im = Image.open('q.png').convert('RGB').filter(ImageFilter.GaussianBlur(14)); im = Image.blend(im, Image.new('RGB', im.size, (8, 10, 16)), 0.62); d = ImageDraw.Draw(im)
def c(txt, y, s, cor): w = d.textlength(txt, font=F(s)); d.text(((W - w) / 2, y), txt, font=F(s), fill=cor, stroke_width=3, stroke_fill=(0, 0, 0))
def botao(x0, y0, x1, y1, txt, s, cor):
    d.rounded_rectangle([x0, y0, x1, y1], 24, fill=cor)
    for j, l in enumerate(txt):
        w = d.textlength(l, font=F(s)); d.text(((x0 + x1 - w) / 2, (y0 + y1) / 2 - len(txt) * s * 0.6 + j * s * 1.2), l, font=F(s), fill=(255, 255, 255))
c('O QUE TU FARIA?', 330, 58, (255, 255, 255))
botao(70, 470, 340, 640, ['ABRIR', 'A PORTA'], 44, (215, 50, 50)); botao(380, 470, 650, 640, ['NÃO', 'ABRIR'], 44, (40, 120, 210))
c('Comenta aqui', 720, 40, (255, 214, 90)); c('Segue pra ver a parte 2', 790, 36, (255, 255, 255))
im.save('c1_fim.png')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', 'c1_fim.png', '-t', str(CARD), '-r', '30', '-vf', 'fade=in:st=0:d=0.3', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', 'c1_fim.mp4'], check=True)
open('lista_p1.txt', 'w').write("file 'p1.mp4'\nfile 'c1_fim.mp4'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'lista_p1.txt', '-c', 'copy', 'video_p1.mp4'], check=True)

# ---------------- legendas e título ----------------
COR = {'tu': '0xffffff', 'leo': '0x8fc3ff', 'edson': '0xffd27a', 'neide': '0xa8f0c8', 'marcos': '0xd6b0ff', 'mae': '0xff7a7a'}
os.makedirs('legf1', exist_ok=True); fil = []; legs.sort()
def quebra(x, n=30):
    linhas, cur = [], ''
    for w in x.split():
        if cur and len(cur) + 1 + len(w) > n: linhas.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return linhas + [cur]
for i, (a, b, quem, x) in enumerate(legs):
    b = min(b + 0.4, legs[i + 1][0] - 0.05) if i + 1 < len(legs) else b + 0.5
    for j, l in enumerate(quebra(x)):
        open(f'legf1/{i}_{j}.txt', 'w').write(l)
        fil.append(f"drawtext=fontfile={FB}:textfile=legf1/{i}_{j}.txt:fontsize=31:fontcolor={COR[quem]}:borderw=4:bordercolor=0x111111:x=(w-tw)/2:y=h*0.15+{j * 42}:enable='between(t,{a:.2f},{b:.2f})'")
open('legf1/tit1.txt', 'w').write('ALERTA: NÃO ABRA'); open('legf1/tit2.txt', 'w').write('PARTE 1')
fil.append(f"drawtext=fontfile={FB}:textfile=legf1/tit1.txt:fontsize=44:fontcolor=0xff4a4a:borderw=5:bordercolor=0x000000:x=(w-tw)/2:y=h*0.06:enable='between(t,0,3.2)'")
fil.append(f"drawtext=fontfile={FB}:textfile=legf1/tit2.txt:fontsize=28:fontcolor=white:borderw=4:bordercolor=0x000000:x=(w-tw)/2:y=h*0.06+56:enable='between(t,0,3.2)'")
fil.append(f"drawtext=fontfile={FB}:text='@Cardeno_Amarelo':fontsize=22:fontcolor=white@0.55:borderw=2:bordercolor=0x000000@0.4:x=40+(w-tw-80)*(0.5+0.5*sin(t*0.37)):y='h*0.09+40*sin(t*0.23)+h*0.7*gt(t,3.2)*(0.5+0.5*sin(t*0.11))'")
open('filtro_p1.txt', 'w').write(','.join(fil))
saida = 'alerta_nao_abra_parte1.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'video_p1.mp4', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'audio_p1.f32', '-filter_script:v', 'filtro_p1.txt',
                '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-c:v', 'libx264', '-preset', 'slow', '-b:v', '380k', '-maxrate', '700k', '-bufsize', '1400k', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '112k', '-ar', '48000', '-movflags', '+faststart', '-shortest', saida], check=True)
print('ok', round(TOTAL, 1), 's', os.path.getsize(saida) // 1024, 'KB')
