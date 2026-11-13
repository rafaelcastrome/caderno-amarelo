# Monta o vídeo: clipes flow/fNN.mp4 + falas + efeitos sintetizados + legendas + título + @ andando.
# uso: python3 build.py && python3 montar.py  -> clipe_vinganca.mp4
import os, subprocess, numpy as np
from scipy.signal import butter, sosfilt
AQ = os.path.dirname(os.path.abspath(__file__)); os.chdir(AQ)
import importlib.util
spec = importlib.util.spec_from_file_location('b', 'build.py'); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
CENAS = b.CENAS; SR = 48000
HK0, HK = 12.3, 4.7  # gancho: narrador + o puxão do cabo (cena 6) logo no começo
OFF = HK
INI = (OFF + np.cumsum([0] + [d for d, _ in CENAS])).tolist(); TOTAL = INI[-1]
LEG = {'C1': 'Ai... minha coluna... mais uma caixa... só mais uma...', 'C2': 'Peraí... que que é isso? Meu crachá... da Microsoft.',
       'C3': 'Oi! Parece que você está escrevendo uma carta! Quer ajuda?', 'E1': 'Clippy... a partir de hoje... você vai trabalhar lá embaixo. No depósito.',
       'C4': 'Mas... por quê?! Eu ajudava todo mundo!', 'E2': 'Sei lá. Só vai.', 'C5': 'Vinte anos... sem motivo nenhum.',
       'C6': 'Parece que você está tentando mandar um e-mail...', 'C7': '...Quer ajuda?', 'P1': 'Oi! Eu sou o Copilot, o novo assistente! E você... quem é?', 'X1': 'Eu?... Eu sou o cara que você substituiu.'}
def wav(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).copy()
N = int((TOTAL + 1) * SR); voz, sfx, mus = (np.zeros(N, np.float32) for _ in range(3))
def poe(buf, a, t, g=1.0):
    i = int(t * SR); a = a[:max(0, N - i)]; buf[i:i + len(a)] += a * g
tt = lambda d: np.arange(int(d * SR)) / SR
rng = np.random.default_rng(3); ruido = lambda d: rng.standard_normal(int(d * SR)).astype(np.float32)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x).astype(np.float32)
bp = lambda x, a, c: sosfilt(butter(2, [a, c], 'bandpass', fs=SR, output='sos'), x).astype(np.float32)
def env(n, a, r): e = np.ones(n); a, r = max(1, int(a * SR)), max(1, int(r * SR)); e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r); return e.astype(np.float32)
def laco(buf, a, de, ate, g):
    n = int((ate - de) * SR); x = np.tile(a, n // len(a) + 1)[:n] * env(n, 0.3, 0.3); poe(buf, x, de, g)
def batida(d=1.5, f=45):
    x = tt(d); y = np.sin(2 * np.pi * f * x * (1 + 0.6 * np.exp(-x * 6))) * np.exp(-x * 2.5) + 0.4 * lp(ruido(d), 500) * np.exp(-x * 9)
    return (y / np.abs(y).max()).astype(np.float32)
def tom(f, d, dec=4.0, harm=(1, 0.3)): x = tt(d); return (sum(h * np.sin(2 * np.pi * f * (k + 1) * x) for k, h in enumerate(harm)) * np.exp(-x * dec) * env(len(x), 0.005, 0.05)).astype(np.float32)
def drone(d, f0):
    x = tt(d); y = 0.5 * np.sin(2 * np.pi * f0 * x) + 0.3 * np.sin(2 * np.pi * f0 * 1.06 * x) + 0.2 * np.sin(2 * np.pi * f0 * 0.5 * x)
    return (y * env(len(x), 1.0, 0.8)).astype(np.float32)
def tink(f=2400): x = tt(0.25); return (np.sin(2 * np.pi * f * x) * np.exp(-x * 30) * 0.5 + np.sin(2 * np.pi * f * 1.48 * x) * np.exp(-x * 40) * 0.3).astype(np.float32)

# falas e legendas
legs = []
for i, (D, falas) in enumerate(CENAS):
    for nome, ini, quem in falas:
        a = wav(f'audio/{nome}.wav'); a = a / (np.abs(a).max() + 1e-9) * 0.85
        if nome == 'C7': a = a * 1.1
        t = INI[i] + ini; poe(voz, a, t); legs.append((t, t + len(a) / SR, quem, LEG[nome], i))
S = INI
# 1 depósito: zumbido de galpão, pulinhos de metal, gemido
laco(sfx, lp(ruido(3), 300) * 0.6 + 0.2 * np.sin(2 * np.pi * 60 * tt(3)).astype(np.float32), S[0], S[2], 0.18)
for k in range(int((CENAS[0][0] - 0.6) / 0.35)): poe(sfx, lp(tink(1900 + (k % 2) * 200), 1200), S[0] + 0.1 + k * 0.35, 0.06)
for k in range(5): poe(mus, tom([196, 175, 165, 147, 131][k], 1.6, 1.6, (1, 0.4, 0.15)), S[0] + 0.3 + k * 1.4, 0.16)
# 2 a caixa cai, crachá
poe(sfx, batida(1.2, 60), S[1] + 0.75, 0.8); poe(sfx, bp(ruido(0.3), 300, 2500) * env(int(0.3 * SR), 0.005, 0.25), S[1] + 0.75, 0.35)
poe(sfx, bp(ruido(0.5), 1500, 6000) * env(int(0.5 * SR), 0.05, 0.3), S[1] + 0.85, 0.12)  # crachá deslizando
for k, f in enumerate([523, 659, 784, 1046]): poe(mus, tom(f, 1.4, 2.5), S[1] + 3.2 + k * 0.12, 0.14)  # brilho da memória
# 3 flashback: chiado de CRT, teclado, plim do assistente, tecla e "boop"
laco(sfx, (0.3 * np.sin(2 * np.pi * 15734 / 4 * tt(2)) * 0 + bp(ruido(2), 3000, 9000) * 0.15).astype(np.float32), S[2], S[4], 0.25)
for k in range(10): poe(sfx, bp(ruido(0.05), 1500, 5000) * env(int(0.05 * SR), 0.002, 0.04), S[2] + 0.1 + k * 0.17 + (k % 3) * 0.03, 0.3)
poe(sfx, tom(1318, 0.6, 6) + tom(1760, 0.6, 5) * 0.7, S[2] + 0.45, 0.35)
poe(sfx, bp(ruido(0.06), 1000, 4000) * env(int(0.06 * SR), 0.002, 0.05), S[2] + 4.55, 0.6)
x = tt(0.35); poe(sfx, (np.sin(2 * np.pi * np.cumsum(900 - 600 * x / 0.35) / SR) * env(len(x), 0.01, 0.1)).astype(np.float32), S[2] + 4.68, 0.3)
for k, f in enumerate([392, 494, 587, 494]): poe(mus, tom(f, 0.9, 2.2), S[2] + 0.4 + k * 1.1, 0.1)
# 4 demissão: "tum" no "demitido", trombone triste no fim
poe(sfx, batida(1.6, 42), S[3] + 4.3, 0.55)
for k, f in enumerate([233, 220, 208, 196]): poe(mus, tom(f, 0.9 if k < 3 else 1.8, 1.2 if k < 3 else 0.9, (1, 0.5, 0.3, 0.2)), S[3] + 10.4 + k * 0.32, 0.2)
# 5 raiva subindo: drone + coração
poe(mus, drone(CENAS[4][0] + 0.3, 49), S[4], 0.35)
for k in range(6): poe(sfx, batida(0.4, 50) * 0.8, S[4] + 0.5 + k * 0.62, 0.45)
x = tt(2.2); poe(mus, (bp(ruido(2.2), 500, 4000) * (x / 2.2) ** 2).astype(np.float32), S[4] + 2.2, 0.25)
# 6 servidores: ventoinhas + bipes; puxão, faísca, tudo desliga
# gancho (0..HK): narrador, tensão, puxão, faísca, apagão
TH = 16.2 - HK0
n0 = wav('audio/N0.wav'); poe(voz, n0 / (np.abs(n0).max() + 1e-9) * 0.85, 0.15)
poe(mus, drone(TH + 0.2, 41), 0, 0.35); poe(sfx, batida(0.3, 120), TH, 0.5)
crh = bp(ruido(0.7), 2000, 9000) * (rng.random(int(0.7 * SR)) > 0.85) * env(int(0.7 * SR), 0.005, 0.3); poe(sfx, crh.astype(np.float32), TH + 0.08, 0.6)
x = tt(1.2); poe(sfx, (np.sin(2 * np.pi * np.cumsum(420 * np.exp(-x * 2.2) + 30) / SR) * env(len(x), 0.01, 0.3)).astype(np.float32), TH + 0.12, 0.35)
poe(sfx, batida(2.0, 32), TH + 0.12, 0.9)
TP = S[5] + 16.2
laco(sfx, (bp(ruido(2), 200, 1500) * 0.5 + 0.1 * np.sin(2 * np.pi * 120 * tt(2))).astype(np.float32), S[5], TP + 0.25, 0.3)
for k in range(26): poe(sfx, tom(2000 + 300 * (k % 3), 0.08, 30, (1,)), S[5] + 0.3 + k * 0.6, 0.08)
for k, f in enumerate([880, 1175, 1568]): poe(sfx, tom(f, 0.6, 5), S[5] + 1.0 + k * 0.08, 0.2)  # Copilot liga
for k in range(5): poe(sfx, tink(1700 + (k % 2) * 200), S[5] + 0.1 + k * 0.3, 0.22)
poe(mus, drone(16.4, 41), S[5], 0.3)
poe(sfx, batida(0.3, 120), TP, 0.5)                                   # plugue saindo
cr = bp(ruido(0.7), 2000, 9000) * (rng.random(int(0.7 * SR)) > 0.85) * env(int(0.7 * SR), 0.005, 0.3); poe(sfx, cr.astype(np.float32), TP + 0.08, 0.6)
x = tt(1.6); poe(sfx, (np.sin(2 * np.pi * np.cumsum(420 * np.exp(-x * 2.2) + 30) / SR) * env(len(x), 0.01, 0.4)).astype(np.float32), TP + 0.12, 0.35)  # desligando
poe(sfx, batida(2.5, 32), TP + 0.12, 0.9)
# 7 escuro: grave baixinho + sting no "Quer ajuda?"
poe(mus, drone(CENAS[6][0], 36), S[6], 0.3); poe(mus, batida(2.0, 30), S[6] + 1.55, 0.55)

dd = np.convolve(np.abs(voz), np.ones(4800) / 4800, 'same'); duck = 1 - 0.6 * np.clip(dd / 0.03, 0, 1)
duck = np.convolve(duck, np.ones(9600) / 9600, 'same').astype(np.float32)
mix = voz + sfx * (0.55 + 0.45 * duck) + mus * duck * 0.8
mix = mix / np.abs(mix).max() * 0.9; mix[:int(TOTAL * SR)].astype(np.float32).tofile('mix.f32')

# vídeo: junta clipes
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(HK0), '-t', str(HK), '-i', 'flow/f06.mp4', '-an', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30', 'gancho.mp4'], check=True)
open('lista.txt', 'w').write("file 'gancho.mp4'\n" + ''.join(f"file 'flow/f{i+1:02d}.mp4'\n" for i in range(len(CENAS))))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'lista.txt', '-an', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30', 'junto.mp4'], check=True)
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; CAV = os.path.abspath('../_papel3d/Caveat-Bold.ttf')
COR = {'clipe': '0xd8d0ff', 'chefe': '0xffd27a', 'copilot': '0x9fe8ff'}; NOME = {'clipe': 'CLIPPY', 'chefe': 'CHEFE', 'copilot': 'COPILOT'}
os.makedirs('leg', exist_ok=True); fil = []; legs.sort()
def quebra(x, n=28):
    ls, cur = [], ''
    for w in x.split():
        if cur and len(cur) + 1 + len(w) > n: ls.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return ls + [cur]
for i, (a, c, quem, x, cena) in enumerate(legs):
    c = min(c + 0.35, legs[i + 1][0] - 0.05) if i + 1 < len(legs) else min(TOTAL, c + 0.6)
    ls = quebra(x); y0 = 0.18 if cena in (1, 4) else 0.74
    open(f'leg/{i}_n.txt', 'w').write(NOME[quem])
    fil.append(f"drawtext=fontfile={FB}:textfile=leg/{i}_n.txt:fontsize=24:fontcolor=0xf2c230:borderw=3:bordercolor=0x111111:x=(w-tw)/2:y=h*{y0}-34:enable='between(t,{a:.2f},{c:.2f})'")
    for j, l in enumerate(ls):
        open(f'leg/{i}_{j}.txt', 'w').write(l)
        fil.append(f"drawtext=fontfile={FB}:textfile=leg/{i}_{j}.txt:fontsize=32:fontcolor={COR[quem]}:borderw=4:bordercolor=0x111111:x=(w-tw)/2:y=h*{y0}+{j * 42}:enable='between(t,{a:.2f},{c:.2f})'")
# título (gancho do quadro 0) e etiquetas de tempo
ETQ = [('A Microsoft não caiu', 0, HK, 60, 0.07), ('por ataque hacker...', 0, HK, 60, 0.07 + 0.065),
       ('O Clippy da Microsoft...', OFF, OFF + 3.4, 54, 0.06), ('20 anos depois', OFF + 0.5, OFF + 3.4, 44, 0.06 + 0.055),
       ('1997', S[2] + 0.05, S[4] - 0.1, 110, 0.05), ('Hoje', S[4] + 0.05, S[4] + 2.2, 50, 0.07)]
for k, (txt, a, c, fs, y) in enumerate(ETQ):
    open(f'leg/etq{k}.txt', 'w').write(txt)
    fil.append(f"drawtext=fontfile={CAV}:textfile=leg/etq{k}.txt:fontsize={fs}:fontcolor=0x2b2622:box=1:boxcolor={'0xf2c230@0.97' if txt == '1997' else '0xfffaf0@0.92'}:boxborderw={22 if txt == '1997' else 14}:x=(w-tw)/2:y=h*{y}:enable='between(t,{a:.2f},{c:.2f})'")
fil.append(f"drawtext=fontfile={FB}:text='@Cardeno_Amarelo':fontsize=22:fontcolor=white@0.6:borderw=2:bordercolor=0x000000@0.4:x=40+(w-tw-80)*(0.5+0.5*sin(t*0.37)):y=h*0.93+14*sin(t*0.5)")
open('filtro.txt', 'w').write(','.join(fil))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'junto.mp4', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'mix.f32',
                '-filter_script:v', 'filtro.txt', '-map', '0:v', '-map', '1:a', '-af', 'loudnorm=I=-15:TP=-1.5',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-shortest', 'clipe_vinganca.mp4'], check=True)
print('ok', TOTAL)
