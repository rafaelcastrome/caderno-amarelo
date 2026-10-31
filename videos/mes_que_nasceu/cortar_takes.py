#!/usr/bin/env python3
"""Corta as tomadas takeA/takeB nos silêncios de troca de fala (>= 0,4 s) -> falas/cortes/cenaNN.wav."""
import os, re, subprocess
AQUI = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(AQUI, 'falas'); OUT = os.path.join(F, 'cortes'); os.makedirs(OUT, exist_ok=True)
n = 1
for take, falas in (('takeA', 7), ('takeB', 7)):
    arq = os.path.join(F, take + '.wav')
    log = subprocess.run(['ffmpeg', '-i', arq, '-af', 'silencedetect=n=-45dB:d=0.25', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    ini = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    fim = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    sil = [(a, b) for a, b in zip(ini, fim) if b - a >= 0.38 and a > 0.5]
    assert len(sil) == falas - 1, (take, sil)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq],
                               capture_output=True, text=True).stdout)
    lim = [0.0] + [(a + b) / 2 for a, b in sil] + [dur]
    for i in range(falas):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', arq, '-ss', f'{lim[i]:.3f}', '-to', f'{lim[i+1]:.3f}',
                        os.path.join(OUT, f'cena{n:02d}.wav')], check=True)
        print(f'cena{n:02d}: {take} {lim[i]:.2f}-{lim[i+1]:.2f}'); n += 1
