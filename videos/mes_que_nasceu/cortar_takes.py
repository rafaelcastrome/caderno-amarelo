#!/usr/bin/env python3
"""Uso: python cortar_takes.py v3A:0.45 v3B:0.5 (tomada:silêncio mínimo entre falas).
Corta as tomadas nos silêncios de troca de fala (>= 0,4 s) -> falas/cortes/cenaNN.wav."""
import os, re, subprocess
AQUI = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(AQUI, 'falas'); OUT = os.path.join(F, 'cortes'); os.makedirs(OUT, exist_ok=True)
n = 1
import sys
TAKES = [(a.split(':')[0], 7, float(a.split(':')[1])) for a in sys.argv[1:]] or [('takeA', 7, 0.38), ('takeB', 7, 0.38)]
for take, falas, minsil in TAKES:
    arq = os.path.join(F, take + '.wav')
    log = subprocess.run(['ffmpeg', '-i', arq, '-af', 'silencedetect=n=-45dB:d=0.25', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    ini = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    fim = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    sil = [(a, b) for a, b in zip(ini, fim) if b - a >= minsil and a > 0.5]
    assert len(sil) == falas - 1, (take, sil)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq],
                               capture_output=True, text=True).stdout)
    lim = [0.0] + [(a + b) / 2 for a, b in sil] + [dur]
    for i in range(falas):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', arq, '-ss', f'{lim[i]:.3f}', '-to', f'{lim[i+1]:.3f}',
                        os.path.join(OUT, f'cena{n:02d}.wav')], check=True)
        print(f'cena{n:02d}: {take} {lim[i]:.2f}-{lim[i+1]:.2f}'); n += 1
