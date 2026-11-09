# Monta a parte 1 em 3D: quarto.mp4 + rua.mp4 + cartão final, com falas (tl.json), sons e legendas.
# Uso: python3 tl.py && (render das cenas) && python3 montar_final.py
import json, os, subprocess, numpy as np
AQ = os.path.dirname(os.path.abspath(__file__)); os.chdir(AQ)
SR = 48000; S = '../sfx/'; W, H = 720, 1280
TL = json.load(open('tl.json'))
def wav(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).copy()
def dur(p): return float(subprocess.run(['ffprobe', '-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
CARD = 5.0
DQ, DR = TL['quarto']['dur'], TL['rua']['dur']
T0 = {'quarto': 0.0, 'rua': DQ}; TOTAL = DQ + DR + CARD
mix = np.zeros(int((TOTAL + 1) * SR), np.float32)
def poe(a, t, g=1.0):
    i = int(t * SR); a = a[:max(0, len(mix) - i)]; mix[i:i + len(a)] += a * g
def laco(a, de, ate, g, fade=0.8):
    n = int((ate - de) * SR); a = np.tile(a, n // len(a) + 1)[:n]; f = int(fade * SR)
    env = np.ones(n); env[:f] = np.linspace(0, 1, f); env[-f:] = np.linspace(1, 0, f); poe(a * env, de, g)
rng = np.random.default_rng(7)
def whoosh(d=2.0):  # caminhão passando: ruído grave que cresce e some
    n = int(d * SR); x = rng.standard_normal(n).astype(np.float32)
    k = np.exp(-np.linspace(-3, 3, n) ** 2); y = np.convolve(x, np.ones(40) / 40, 'same') * k
    return (y / np.abs(y).max() * 0.9).astype(np.float32)
def drone(d):  # tensão: dois senos graves
    tt = np.arange(int(d * SR)) / SR; y = 0.5 * np.sin(2 * np.pi * 55 * tt) + 0.3 * np.sin(2 * np.pi * 58.3 * tt)
    env = np.minimum(1, tt / 1.0) * np.minimum(1, (d - tt) / 0.6); return (y * env).astype(np.float32)
def clique(): tt = np.arange(int(0.04 * SR)) / SR; return (np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 120)).astype(np.float32)

legs = []
for cena, info in TL.items():
    b0 = T0[cena]; ev = info['ev']
    for k, e in ev.items():
        if 'arq' in e:
            p = os.path.join('..', 'falas', e['arq'] + '.wav')
            if os.path.exists(p): poe(wav(p), b0 + e['t'], 1.0)
            legs.append((b0 + e['t'], b0 + e['t'] + e['d'], e['quem'], e['leg']))
q, r = TL['quarto']['ev'], TL['rua']['ev']
legs.append((DQ + r['LE']['t'] + 0.3, DQ + r['VIRA']['t'] + 0.3, 'msg', 'Mensagem do EU: "olha pro outro lado da rua."'))
# ---- sons do quarto ----
laco(wav(S + 'fundo.wav'), 0, DQ, 0.28)
toque = wav(S + 'toque.wav')
t = q['TOQ']['t']
while t < q['VERDE']['t']: poe(toque[:int(min(len(toque) / SR, q['VERDE']['t'] - t) * SR)], t, 0.45); t += len(toque) / SR
poe(clique(), q['VERDE']['t'], 0.4)
poe(wav(S + 'desliga.wav'), q['DESLIGA']['t'], 0.5)
poe(wav(S + 'passos.wav'), q['DESLIGA']['t'] + 0.3, 0.6)
# ---- sons da rua ----
R = DQ
laco(wav(S + 'rua.wav'), R, R + DR, 0.32)
passos = wav(S + 'passos.wav'); poe(passos, R + 0.1, 0.7); poe(passos, R + 2.6, 0.6)
poe(wav(S + 'vibra.wav'), R + r['VIBRA']['t'], 0.7)
poe(drone(r['CAMINHAO']['t'] + 0.6 - r['VIRA']['t']), R + r['VIRA']['t'], 0.35)
poe(whoosh(2.0), R + r['CAMINHAO']['t'] - 0.6, 0.6)
poe(wav(S + 'trovao.wav'), R + r['TROVAO']['t'], 0.9)
laco(wav(S + 'chuva.wav'), R + r['TROVAO']['t'] + 0.2, TOTAL, 0.55, fade=1.5)
poe(wav(S + 'onibus.wav'), R + r['ONIBUS']['t'] + 0.6, 0.75)
t = R + r['TOCA']['t']
while t < TOTAL - 0.5: poe(toque, t, 0.5 if t < R + DR else 0.3); t += len(toque) / SR
pk = np.abs(mix).max(); mix = mix / pk * 0.9
mix[:int(TOTAL * SR)].astype(np.float32).tofile('audio_final.f32')

# ---- cartão final: último quadro escurecido e borrado + texto ----
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-0.1', '-i', 'rua.mp4', '-frames:v', '1', 'ultimo.png'], check=True)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
im = Image.open('ultimo.png').convert('RGB').filter(ImageFilter.GaussianBlur(14))
im = Image.blend(im, Image.new('RGB', im.size, (8, 10, 16)), 0.62); d = ImageDraw.Draw(im)
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; F = lambda s: ImageFont.truetype(FB, s)
def c(txt, y, s, cor): w = d.textlength(txt, font=F(s)); d.text(((W - w) / 2, y), txt, font=F(s), fill=cor, stroke_width=3, stroke_fill=(0, 0, 0))
c('O QUE VOCÊ FARIA?', 380, 54, (255, 255, 255))
for txt, x, cor in [('ENTRAR', 60, (60, 190, 100)), ('NÃO ENTRAR', 370, (225, 70, 70))]:
    d.rounded_rectangle([x, 520, x + 290, 620], 24, fill=cor)
    w = d.textlength(txt, font=F(38)); d.text((x + (290 - w) / 2, 548), txt, font=F(38), fill=(255, 255, 255))
c('Comenta aqui embaixo', 690, 36, (230, 230, 230))
c('Segue pra ver a parte 2', 820, 42, (255, 214, 90))
im.save('cartao.png')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', 'cartao.png', '-t', str(CARD), '-r', '30', '-vf', 'fade=in:st=0:d=0.5', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', 'cartao.mp4'], check=True)
open('lista.txt', 'w').write("file 'quarto.mp4'\nfile 'rua.mp4'\nfile 'cartao.mp4'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'lista.txt', '-c', 'copy', 'video_final.mp4'], check=True)

# ---- legendas ----
COR = {'mae': '0xd9b3ff', 'tu': '0xffffff', 'tel': '0xff8a8a', 'amigo': '0xffd27a', 'motorista': '0x9fd3ff', 'msg': '0x8affc1'}
FT = FB; os.makedirs('legf', exist_ok=True); fil = []
legs.sort()
def quebra(x, n=30):
    if len(x) <= n: return [x]
    ws = x.split(); best = None
    for k in range(1, len(ws)):
        a, b = ' '.join(ws[:k]), ' '.join(ws[k:])
        if best is None or max(len(a), len(b)) < max(map(len, best)): best = [a, b]
    return best
for i, (a, b, quem, x) in enumerate(legs):
    b = min(b + 0.4, legs[i + 1][0] - 0.05) if i + 1 < len(legs) else b + 0.5
    for j, l in enumerate(quebra(x)):
        open(f'legf/{i}_{j}.txt', 'w').write(l)
        fil.append(f"drawtext=fontfile={FT}:textfile=legf/{i}_{j}.txt:fontsize=31:fontcolor={COR[quem]}:borderw=4:bordercolor=0x111111:x=(w-tw)/2:y=h*0.15+{j * 42}:enable='between(t,{a:.2f},{b:.2f})'")
fil.append(f"drawtext=fontfile={FT}:text='@Cardeno_Amarelo':fontsize=22:fontcolor=white@0.55:borderw=2:bordercolor=0x000000@0.4:x=40+(w-tw-80)*(0.5+0.5*sin(t*0.37)):y=h*0.07+40*sin(t*0.23)")
open('filtro_final.txt', 'w').write(','.join(fil))
saida = 'ligacao_numero_parte1_3d.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'video_final.mp4', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'audio_final.f32', '-filter_script:v', 'filtro_final.txt',
                '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-c:v', 'libx264', '-preset', 'slow', '-b:v', '650k', '-maxrate', '1100k', '-bufsize', '2000k', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '112k', '-ar', '48000', '-movflags', '+faststart', '-shortest', saida], check=True)
print('ok', round(TOTAL, 1), 's', os.path.getsize(saida) // 1024, 'KB')
