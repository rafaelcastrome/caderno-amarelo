#!/usr/bin/env python3
"""Sintetiza uma risada de plateia (várias pessoas rindo "ha-ha-ha") e, opcionalmente, mixa no final de um áudio.

Os bancos de sons livres (Wikimedia Commons, Freesound) costumam estar bloqueados no sandbox, então a risada
é gerada aqui mesmo, sem arquivo de terceiros: cada "pessoa" é um trem de pulsos glotais (tom de voz próprio,
com tremor) passando por formantes da vogal "a", com sopro de "h" no começo de cada sílaba. Juntam-se dezenas
de pessoas com entradas espalhadas, posição estéreo diferente, um burburinho de fundo e uma reverberação de sala.

Uso (padrão: risada gravada do meme da casa alugada, que o Rafael aprovou; a sintetizada soou "de filme maligno"):
  python3 risada_plateia.py --mix narration.mp3 --inicio 69.9 --out narration.mp3 --arquivo <skill>/assets/risada_gargalhada.wav
Outros usos:
  python3 risada_plateia.py --out risada.wav --dur 5 [--pessoas 32] [--seed 7]
  python3 risada_plateia.py --mix narration.mp3 --inicio 69.6 --out narration.mp3 [--fim 73.8] [--ganho 1.5]
     --mix:    áudio do vídeo; a risada entra em --inicio (s) e vai até --fim (padrão: fim do áudio),
               crescendo em ~0,6 s e sumindo nos últimos ~1,2 s. O resultado mantém a duração de --fim.
Requer numpy, scipy e ffmpeg (python3 -m pip install numpy scipy).
"""
import argparse, os, shutil, subprocess, tempfile, wave
import numpy as np
from scipy.signal import lfilter

SR = 44100


def resonator(x, f, bw):
    r = np.exp(-np.pi * bw / SR)
    a = [1, -2 * r * np.cos(2 * np.pi * f / SR), r * r]
    return lfilter([1 - r], a, x)


def laugher(rng, dur):
    """Uma pessoa rindo: rajadas de 'ha-ha-ha' com o tom caindo ao longo da rajada."""
    n = int(dur * SR)
    out = np.zeros(n)
    female = rng.random() < 0.45
    f0base = rng.uniform(190, 330) if female else rng.uniform(100, 180)
    F1, F2, F3 = rng.uniform(680, 860), rng.uniform(1100, 1400), rng.uniform(2400, 2900)
    if female:
        F1, F2, F3 = F1 * 1.12, F2 * 1.12, F3 * 1.08
    t = rng.uniform(0, 0.6)
    while t < dur - 0.3:
        nsyl = rng.integers(4, 11)
        rate = rng.uniform(4.2, 6.0)               # sílabas por segundo
        f0 = f0base * rng.uniform(1.05, 1.35)
        for k in range(nsyl):
            sd = rng.uniform(0.09, 0.15)
            i0, i1 = int(t * SR), int((t + sd) * SR)
            if i1 >= n:
                break
            m = i1 - i0
            tt = np.arange(m) / SR
            # tom da sílaba: cai um pouco dentro dela e ao longo da rajada
            fs = f0 * (1 - 0.12 * k / nsyl) * (1 - 0.08 * tt / sd) * (1 + 0.02 * np.sin(2 * np.pi * 6 * tt))
            ph = np.cumsum(fs / SR)
            glot = (ph % 1.0) - 0.5                 # dente de serra ~ pulso glotal
            glot = lfilter([1], [1, -0.85], glot)   # inclinação espectral da voz
            breath = rng.normal(0, 1, m) * 0.35
            src = glot * 0.6 + breath
            # "h" soprado no começo: mais ruído e menos voz
            hpart = np.clip(1 - tt / 0.03, 0, 1)
            src = src * (1 - hpart) + rng.normal(0, 1, m) * hpart * 0.8
            v = resonator(src, F1, 90) + 0.7 * resonator(src, F2, 120) + 0.35 * resonator(src, F3, 180)
            env = np.minimum(1, tt / 0.012) * np.exp(-tt / (sd * 0.4))
            out[i0:i1] += v * env * (1 - 0.35 * k / nsyl)
            t += 1 / rate
        t += rng.uniform(0.25, 0.9)                 # respira e ri de novo
    return out / (np.abs(out).max() + 1e-9)


def crowd(dur, pessoas=32, seed=7):
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    L, R = np.zeros(n), np.zeros(n)
    for i in range(pessoas):
        # poucas risadas na frente (altas e nítidas) e o resto mais baixo, ao fundo
        v = laugher(rng, dur) * (rng.uniform(0.8, 1.0) if i < 4 else rng.uniform(0.15, 0.35))
        pan = rng.uniform(0.15, 0.85)
        L += v * np.sqrt(1 - pan)
        R += v * np.sqrt(pan)
    # burburinho de fundo (ruído passado por formantes de voz, modulado devagar)
    bed = rng.normal(0, 1, n)
    bed = resonator(bed, 500, 400) + resonator(bed, 1500, 600)
    mod = 0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * np.arange(n) / SR + 1.3)
    bed = bed / np.abs(bed).max() * 0.12 * mod
    L += bed; R += np.roll(bed, 300)
    # reverberação de sala: resposta ao impulso de ruído decaindo
    ir_n = int(0.7 * SR)
    for ch in (0, 1):
        ir = rng.normal(0, 1, ir_n) * np.exp(-np.arange(ir_n) / (0.16 * SR))
        ir[0] = 6
        sig = L if ch == 0 else R
        wet = np.convolve(sig, ir)[:n]
        sig[:] = sig * 0.75 + wet / np.abs(wet).max() * np.abs(sig).max() * 0.35
    # suaviza o agudo (plateia é ouvida "de longe")
    L, R = lfilter([0.35], [1, -0.65], L), lfilter([0.35], [1, -0.65], R)
    st = np.stack([L, R], 1)
    return st / np.abs(st).max() * 0.9


def load_audio(path, dur):
    """Lê uma risada gravada (estéreo, 44,1 kHz), repete se for curta e corta na duração pedida."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vn', '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    st = np.frombuffer(raw, dtype=np.int16).reshape(-1, 2).astype(float) / 32768
    n = int(dur * SR)
    if len(st) < n:
        st = np.tile(st, (n // len(st) + 1, 1))
    st = st[:n]
    return st / (np.abs(st).max() + 1e-9) * 0.9


def write_wav(path, st):
    d = (np.clip(st, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--dur', type=float, default=5)
    ap.add_argument('--pessoas', type=int, default=14)
    ap.add_argument('--seed', type=int, default=7)
    ap.add_argument('--mix')
    ap.add_argument('--inicio', type=float)
    ap.add_argument('--fim', type=float)
    ap.add_argument('--ganho', type=float, default=1.5)
    ap.add_argument('--arquivo', help='usa esta risada gravada (wav/mp3/mp4) em vez de sintetizar; a risada preferida do Rafael fica em assets/risada_gargalhada.wav')
    a = ap.parse_args()
    if not a.mix:
        write_wav(a.out, crowd(a.dur, a.pessoas, a.seed)); print('OK', a.out); return
    fim = a.fim or float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.mix],
                                        capture_output=True, text=True).stdout)
    dur = fim - a.inicio
    st = load_audio(a.arquivo, dur) if a.arquivo else crowd(dur, a.pessoas, a.seed)
    tt = np.arange(len(st)) / SR
    env = np.minimum(1, tt / 0.6) * np.clip((dur - tt) / 1.2, 0, 1)
    st = st * env[:, None] * a.ganho
    with tempfile.TemporaryDirectory() as d:
        lw = os.path.join(d, 'risada.wav'); write_wav(lw, st)
        tmp = os.path.join(d, 'mix' + os.path.splitext(a.out)[1])
        ms = int(a.inicio * 1000)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.mix, '-i', lw, '-filter_complex',
                        f'[1:a]adelay={ms}|{ms}[r];[0:a][r]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95,atrim=0:{fim}',
                        '-ac', '2', '-ar', str(SR), tmp], check=True)
        shutil.move(tmp, a.out)
    print('OK', a.out)


if __name__ == '__main__':
    main()
