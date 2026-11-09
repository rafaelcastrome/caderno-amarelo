# Parte 1 da minissérie "Ligação do teu próprio número" com as cenas do Google Flow.
# Clipes do Flow (s4, s5, s7 e o teste) com as NOSSAS vozes colocadas nos inícios de fala do Flow;
# cenas sem crédito de vídeo (s3, s6, s8) viram imagem com movimento de câmera feito aqui.
# Saída: ligacao_numero_parte1_flow.mp4 (720x1280, 30 fps).
import subprocess, json, os, numpy as np
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(AQUI, '..', '..')
FP = os.path.join(AQUI, '..')
FALA = os.path.join(B, 'falas', 'p1')
SFX = os.path.join(B, 'sfx')
TMP = os.path.join(AQUI, 'tmp'); os.makedirs(TMP, exist_ok=True)
W, H, FPS, SR = 720, 1280, 30, 48000
FONTE = os.path.join(AQUI, 'Caveat-Bold.ttf')

def wav(p, ss=None, to=None):
    a = ['ffmpeg', '-v', 'error']
    if ss is not None: a += ['-ss', str(ss)]
    if to is not None: a += ['-to', str(to)]
    a += ['-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, np.float32).copy()

def fala(nome, ss=None, to=None): return wav(os.path.join(FALA, nome + '.wav'), ss, to)
def sfx(nome): return wav(os.path.join(SFX, nome + '.wav'))

# ---------------- planos ----------------
# tipo 'clip': vídeo do Flow (ate = corte em s; 'seg' = segura o último quadro)
# tipo 'foto': imagem com câmera (z0->z1 zoom, cx/cy centro, treme = tremida)
# falas: (início no plano, áudio, quem, legenda)
PLANOS = [
  dict(tipo='clip', src=os.path.join(B, 'flow_teste', 'cena_teste.mp4'), ate=8.0, seg=1.6,
       falas=[(1.38, fala('a0', 0, 0.75), 'mae', 'Filho!'),
              (3.24, fala('a0', 1.0), 'mae', 'Tu vai perder o ônibus das 7!'),
              (6.6, fala('a2'), 'tu', 'Ué... esse número... é o meu.')],
       sons=[(0.0, 'toque', 0.5), (2.6, 'toque', 0.5), (5.2, 'toque', 0.45), (7.8, 'toque', 0.4)]),
  dict(tipo='foto', src='s3.png', dur=12.2, z0=1.0, z1=1.18, cx=0.5, cy=0.62, treme=2.0,
       falas=[(0.5, fala('a3'), 'tu', 'Alô?'),
              (1.5, fala('a4'), 'tel', 'Não entra no ônibus das 7.'),
              (5.0, fala('a5'), 'tu', 'Quem tá falando?'),
              (7.0, fala('a6'), 'tel', 'Sou eu. Daqui a 20 minutos.')],
       sons=[(10.4, 'desliga', 0.5)]),
  dict(tipo='clip', src='s4.mp4', ate=5.6, seg=0,
       falas=[(1.36, fala('a7', 0, 0.6), 'mae', 'Filho?'),
              (2.68, fala('a7', 1.3), 'mae', 'Quem era no telefone?')], sons=[]),
  dict(tipo='clip', src='s5.mp4', ate=8.0, seg=1.0,
       falas=[(1.52, fala('b0', 0, 1.72), 'amigo', 'E aí, mano? Que cara é essa?'),
              (4.30, fala('b0', 2.26), 'amigo', 'Parece que viu um fantasma.'),
              (5.6, fala('b1'), 'tu', 'Cara... eu recebi uma ligação muito estranha.')], sons=[]),
  dict(tipo='foto', src='s6.png', dur=7.0, z0=1.0, z1=1.22, cx=0.5, cy=0.6, treme=0, msg=True,
       falas=[(1.0, fala('b2'), 'tu', 'Daqui a pouco começa a chover... aí ele chega.'),
              (5.5, fala('b3'), 'amigo', 'Quem chega?')],
       sons=[(0.1, 'vibra', 0.7)]),
  dict(tipo='clip', src='s7.mp4', ate=6.4, seg=0,
       falas=[(2.40, fala('b4'), 'amigo', 'Olha lá, mano! O das 7!')],
       sons=[(0.0, 'trovao', 0.8)]),
  dict(tipo='foto', src='s8.png', dur=9.5, z0=1.0, z1=1.3, cx=0.62, cy=0.62, treme=0, toca=4.0,
       falas=[(1.0, fala('c0'), 'motorista', 'Vai subir ou não vai, garoto?'),
              (5.2, fala('c1'), 'amigo', 'Bora, mano! Tá esperando o quê?')],
       sons=[(0.0, 'onibus', 0.6), (4.0, 'toque', 0.55), (6.6, 'toque', 0.55)]),
  dict(tipo='final', dur=5.0, falas=[], sons=[(0.0, 'toque', 0.35), (2.6, 'toque', 0.25)]),
]
COR = {'mae': (196, 140, 255), 'tu': (110, 190, 255), 'tel': (255, 95, 95), 'amigo': (120, 220, 120), 'motorista': (255, 190, 80)}
QUEM = {'mae': 'MÃE', 'tu': 'TU', 'tel': 'NO TELEFONE', 'amigo': 'AMIGO', 'motorista': 'MOTORISTA'}

def cobre(im, w, h):
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def escreve_msg(im):
    # texto dentro do balão vazio que o Flow desenhou (coordenadas da imagem 768x1376)
    d = ImageDraw.Draw(im); k = im.width / 768
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', round(19 * k))
    y = 812 * k
    for l in ['daqui a pouco', 'começa a', 'chover...', 'aí ele chega.']:
        d.text((332 * k, y), l, font=f, fill=(40, 40, 40)); y += 30 * k
    return im

def pagina_final():
    im = Image.new('RGB', (W, H), (255, 236, 140)); d = ImageDraw.Draw(im)
    for y in range(230, H, 56): d.line([(0, y), (W, y)], fill=(150, 185, 225), width=2)
    d.line([(88, 0), (88, H)], fill=(230, 110, 110), width=3)
    F = lambda s: ImageFont.truetype(FONTE, s)
    def c(t, y, s, cor):
        w = d.textlength(t, font=F(s)); d.text(((W - w) / 2, y), t, font=F(s), fill=cor)
    c('O QUE VOCÊ FARIA?', 310, 76, (30, 30, 30))
    for (t, x, cor) in [('ENTRAR', 45, (40, 150, 70)), ('NÃO ENTRAR', 365, (210, 60, 60))]:
        d.rounded_rectangle([x, 520, x + 310, 640], 26, outline=cor, width=7)
        w = d.textlength(t, font=F(54)); d.text((x + (310 - w) / 2, 545), t, font=F(54), fill=cor)
    c('comenta aqui embaixo', 720, 64, (60, 60, 60))
    d.line([(360, 812), (360, 845)], fill=(60, 60, 60), width=8); d.polygon([(360, 885), (330, 845), (390, 845)], fill=(60, 60, 60))
    c('Segue pra ver a parte 2', 960, 70, (40, 90, 200))
    return im

def frames_foto(p, n):
    im = Image.open(os.path.join(FP, p['src'])).convert('RGB')
    im = cobre(im, 1440, 2560)
    if p.get('msg'): im = escreve_msg(im)
    for i in range(n):
        t = i / FPS; u = i / max(1, n - 1); u = u * u * (3 - 2 * u)
        z = p['z0'] + (p['z1'] - p['z0']) * u
        bw, bh = 1440 / z, 2560 / z
        ox = p['treme'] * 3 * (np.sin(t * 13.1) + 0.6 * np.sin(t * 29.7)) + 6 * np.sin(t * 0.9)
        oy = p['treme'] * 3 * np.sin(t * 17.3) + 8 * np.sin(t * 1.3)
        if p.get('toca') and t >= p['toca']:  # celular toca: tremidinha na mão
            ox += 7 * np.sin(t * 95); oy += 3 * np.sin(t * 71)
        cx = 720 + (p['cx'] - 0.5) * (1440 - bw) + ox
        cy = 1280 + (p['cy'] - 0.5) * (2560 - bh) + oy
        x0 = min(max(cx - bw / 2, 0), 1440 - bw); y0 = min(max(cy - bh / 2, 0), 2560 - bh)
        yield im.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + bw, y0 + bh)).tobytes()

def frames_clip(p):
    src = p['src'] if os.path.isabs(p['src']) else os.path.join(FP, p['src'])
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-t', str(p['ate']), '-vf', f'scale={W}:{H},fps={FPS}',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    fs = [raw[i:i + W * H * 3] for i in range(0, len(raw), W * H * 3)]
    fs += [fs[-1]] * round(p.get('seg', 0) * FPS)
    return fs

# ---------------- vídeo ----------------
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                        '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
                        os.path.join(TMP, 'video.mp4')], stdin=subprocess.PIPE)
inicio, legs, t0 = [], [], 0.0
for p in PLANOS:
    if p['tipo'] == 'clip':
        fs = frames_clip(p)
    elif p['tipo'] == 'foto':
        fs = list(frames_foto(p, round(p['dur'] * FPS)))
    else:
        fs = [pagina_final().tobytes()] * round(p['dur'] * FPS)
    for f in fs: enc.stdin.write(f)
    p['t0'], p['dur'] = t0, len(fs) / FPS
    t0 += p['dur']
enc.stdin.close(); enc.wait()
TOTAL = t0

# ---------------- áudio ----------------
mix = np.zeros(int((TOTAL + 1) * SR), np.float32)
def poe(a, t, g=1.0):
    i = int(t * SR); a = a[:max(0, len(mix) - i)]; mix[i:i + len(a)] += a * g
def camada(nome, de, ate, g):
    a = sfx(nome); n = int((ate - de) * SR); a = np.tile(a, n // len(a) + 1)[:n]
    fade = int(0.8 * SR); env = np.ones(n); env[:fade] = np.linspace(0, 1, fade); env[-fade:] = np.linspace(1, 0, fade)
    poe(a * env, de, g)
for p in PLANOS:
    for (t, a, q, txt) in p['falas']:
        poe(a, p['t0'] + t, 1.0)
        legs.append((p['t0'] + t, p['t0'] + t + len(a) / SR, q, txt))
    for (t, n, g) in p['sons']: poe(sfx(n), p['t0'] + t, g)
P = PLANOS
camada('fundo', 0, P[3]['t0'], 0.35)
camada('rua', P[3]['t0'], P[5]['t0'] + 0.5, 0.35)
camada('chuva', P[5]['t0'], P[7]['t0'] + 1.5, 0.55)
pk = np.abs(mix).max(); mix = mix / max(pk, 1e-6) * 0.89
mix[:int(TOTAL * SR)].astype(np.float32).tofile(os.path.join(TMP, 'audio.f32'))

# ---------------- legendas (topo, sobre o borrão dos cadernos) + @ que anda ----------------
LG = os.path.join(TMP, 'leg'); os.makedirs(LG, exist_ok=True)
def quebra(txt, n=28):
    if len(txt) <= n: return [txt]
    ws = txt.split(); best = None
    for k in range(1, len(ws)):
        a, b = ' '.join(ws[:k]), ' '.join(ws[k:])
        if best is None or max(len(a), len(b)) < max(map(len, best)): best = [a, b]
    if max(map(len, best)) <= n + 6: return best
    ls, cur = [], ''
    for w in txt.split():
        if len(cur) + len(w) + 1 > n and cur: ls.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return ls + [cur]
fil = []
for i, (a, b, q, txt) in enumerate(legs):
    b = min(b + 0.5, legs[i + 1][0] - 0.05) if i + 1 < len(legs) else b + 0.6
    cor = '0x%02x%02x%02x' % COR[q]
    open(f'{LG}/q{i}.txt', 'w').write(QUEM[q])
    fil.append(f"drawtext=fontfile={FONTE}:textfile={LG}/q{i}.txt:fontsize=30:fontcolor={cor}:borderw=5:bordercolor=0x1a1a1a:x=(w-tw)/2:y=36:enable='between(t,{a:.2f},{b:.2f})'")
    for j, l in enumerate(quebra('"' + txt + '"')):
        open(f'{LG}/l{i}_{j}.txt', 'w').write(l)
        fil.append(f"drawtext=fontfile={FONTE}:textfile={LG}/l{i}_{j}.txt:fontsize=52:fontcolor=white:borderw=6:bordercolor=0x1a1a1a:x=(w-tw)/2:y={76 + 58 * j}:enable='between(t,{a:.2f},{b:.2f})'")
fil.append(f"drawtext=fontfile={FONTE}:text='@Cardeno_Amarelo':fontsize=30:fontcolor=white@0.75:borderw=3:bordercolor=0x000000@0.5:"
           f"x=40+(w-tw-80)*(0.5+0.5*sin(t*0.37)):y=h*0.72+150*sin(t*0.23)")
open(os.path.join(TMP, 'filtro.txt'), 'w').write(','.join(fil))
saida = os.path.join(AQUI, 'ligacao_numero_parte1_flow.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(TMP, 'video.mp4'), '-f', 'f32le', '-ar', str(SR), '-ac', '1',
                '-i', os.path.join(TMP, 'audio.f32'), '-filter_script:v', os.path.join(TMP, 'filtro.txt'), '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11',
                '-c:v', 'libx264', '-preset', 'slow', '-b:v', '1100k', '-maxrate', '1600k', '-bufsize', '3000k',
                '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-movflags', '+faststart', '-shortest', saida], check=True)
json.dump([dict(t0=round(p['t0'], 2), dur=round(p['dur'], 2), src=p.get('src', 'final')) for p in PLANOS], open(os.path.join(AQUI, 'planos.json'), 'w'), indent=1)
print('ok', round(TOTAL, 2), 's', os.path.getsize(saida) // 1024, 'KB')
