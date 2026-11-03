"""Monta o vídeo de stories do jogo: gravação da tela num celular sobre o papel do caderno + narração.
Uso: python3 montar.py <pasta dos quadros> <pasta dos áudios> <saída.mp4>"""
import glob, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

Q, AUD, SAIDA = sys.argv[1:4]
W, H, FPS = 1080, 1920, 30
AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE = os.path.join(AQUI, '..', 'stories_jogo_desafios', 'Caveat-Bold.ttf')
f = lambda s: ImageFont.truetype(FONTE, s)
TINTA, VERM, AMAR = (31, 31, 36), (214, 40, 40), (255, 210, 63)

def papel():
    im = Image.new('RGB', (W, H), (251, 244, 221)); d = ImageDraw.Draw(im)
    for x in range(0, W, 54): d.line([(x, 0), (x, H)], fill=(205, 214, 236), width=2)
    for y in range(0, H, 54): d.line([(0, y), (W, y)], fill=(205, 214, 236), width=2)
    d.rectangle([88, 0, 92, H], fill=(233, 138, 138))
    return im
FUNDO = papel()

# quadros da gravação
arqs = sorted(glob.glob(os.path.join(Q, '*.jpg')))
ts = [float(os.path.basename(a).split('_')[1][:-4]) for a in arqs]
M = {m['nome']: m['t'] for m in json.load(open(os.path.join(Q, 'marcas.json')))}
def quadro(t):
    i = max(0, max([k for k, x in enumerate(ts) if x <= t] or [0]))
    return arqs[i]

ESC = 0.80
SW, SH = int(780 * ESC), int(1560 * ESC)
SX, SY = (W - SW) // 2, 360
cache = {}
def tela(arq):
    if arq not in cache:
        cache.clear(); cache[arq] = Image.open(arq).convert('RGB').resize((SW, SH), Image.LANCZOS)
    return cache[arq]

def moldura(im):
    d = ImageDraw.Draw(im)
    sh = Image.new('L', (W, H), 0); ImageDraw.Draw(sh).rounded_rectangle([SX - 22 + 16, SY - 22 + 18, SX + SW + 22 + 16, SY + SH + 22 + 18], 60, fill=110)
    im.paste((60, 50, 30), (0, 0), sh.filter(ImageFilter.GaussianBlur(14)))
    d.rounded_rectangle([SX - 22, SY - 22, SX + SW + 22, SY + SH + 22], 60, fill=TINTA)

def legenda(im, txt, cor=TINTA, y=230):
    d = ImageDraw.Draw(im); fo = f(84)
    w = d.textlength(txt, font=fo); x = (W - w) / 2
    d.rounded_rectangle([x - 30, y - 8, x + w + 30, y + 96], 18, fill=AMAR)
    d.text((x, y - 6), txt, font=fo, fill=cor)

def arroba(im):
    d = ImageDraw.Draw(im); fo = f(52); t = '@Cardeno_Amarelo'
    d.text(((W - d.textlength(t, font=fo)) / 2, SY + SH + 40), t, font=fo, fill=(90, 90, 90))

def dur(a):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a]))
A = {i: os.path.join(AUD, f'fala_{i:02d}.mp3') for i in range(1, 7)}
D = {i: dur(a) for i, a in A.items()}

# segmentos: (início na gravação, fim, legenda, falas, momento-alvo da última fala terminar (rel.), segura no início)
segs = [
    dict(t0=M['home'], t1=M['d1'], cap='Joga esse aqui', falas=[1, 2], segura_ini=True),
    dict(t0=M['d1'], t1=M['d1_fim'], cap='Parece fácil...', falas=[3], fim_fala=M['d1_fim'] - 1.0),
    dict(t0=M['d2'], t1=M['d2_fim'], cap='E esse?', falas=[4], fim_fala=M['d2_fim'] - 1.0),
    dict(t0=M['d3'], t1=M['d3_fim'], cap='66 desafios', falas=[5]),
    dict(t0=M['d5'], t1=M['d5_fim'], cap='66 desafios', falas=[]),
    dict(t0=M['d9'], t1=M['d9_fim'], cap='66 desafios', falas=[]),
]
# a fala 5 cobre os 3 relances: distribui o tempo dela nos 3
extra5 = max(0, D[5] + 0.3 - sum(s['t1'] - s['t0'] for s in segs[3:]))
for s in segs[3:]: s['t1'] += extra5 / 3

plano, sons, t = [], [], 0.0
for s in segs:
    vid = s['t1'] - s['t0']; fal = sum(D[i] for i in s['falas']) + 0.25 * len(s['falas'])
    if 'fim_fala' in s:
        ini = max(0.1, (s['fim_fala'] - s['t0']) - fal)
        L = max(vid, ini + fal + 0.3)
    else:
        ini = 0.15
        L = max(vid, fal + 0.3)
    segura = L - vid if s.get('segura_ini') else 0
    plano.append((t, L, s, segura))
    tt = t + ini
    for i in s['falas']: sons.append((tt, A[i])); tt += D[i] + 0.25
    t += L
FIM_INI = t
L_FIM = max(3.2, D[6] + 0.8)
sons.append((FIM_INI + 0.3, A[6]))
TOTAL = FIM_INI + L_FIM

def cartao_final(k):
    im = FUNDO.copy(); d = ImageDraw.Draw(im)
    def c(txt, y, fo, cor=TINTA, marca=False):
        w = d.textlength(txt, font=fo); x = (W - w) / 2
        if marca: d.rectangle([x - 10, y + fo.size * 0.55, x + w + 10, y + fo.size * 0.95], fill=AMAR)
        d.text((x, y), txt, font=fo, fill=cor)
    c('Desafios do', 470, f(130)); c('Caderno Amarelo', 610, f(130), VERM, True)
    c('os 2 primeiros são de graça', 880, f(76))
    if k > 0.6:
        d.rounded_rectangle([250, 1040, 830, 1180], 40, fill=AMAR, outline=TINTA, width=6)
        c('link na bio', 1060, f(96))
    c('@Cardeno_Amarelo', 1400, f(60), (90, 90, 90))
    return im

base = FUNDO.copy(); moldura(base)
proc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                         '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p', '/tmp/_jogo_mudo.mp4'], stdin=subprocess.PIPE)
for n in range(int(TOTAL * FPS)):
    tv = n / FPS
    if tv >= FIM_INI:
        im = cartao_final(tv - FIM_INI)
    else:
        p0, L, s, segura = next(p for p in plano if p[0] <= tv < p[0] + p[1])
        rel = tv - p0
        tr = s['t0'] + max(0, rel - segura)
        tr = min(tr, s['t1'] - 0.01)
        im = base.copy(); im.paste(tela(quadro(tr)), (SX, SY))
        legenda(im, s['cap']); arroba(im)
    proc.stdin.write(im.tobytes())
proc.stdin.close(); proc.wait()

# áudio
ent, filt = [], []
for k, (t0, a) in enumerate(sons):
    ent += ['-i', a]; filt.append(f'[{k + 1}:a]adelay={int(t0 * 1000)}|{int(t0 * 1000)},apad[a{k}]')
mix = ''.join(f'[a{k}]' for k in range(len(sons)))
fc = ';'.join(filt) + f';{mix}amix=inputs={len(sons)}:normalize=0,atrim=0:{TOTAL:.2f}[ao]'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/_jogo_mudo.mp4', *ent, '-filter_complex', fc, '-map', '0:v', '-map', '[ao]',
                '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-shortest', SAIDA], check=True)
print('ok', round(TOTAL, 1), 's')
