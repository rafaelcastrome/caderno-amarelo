#!/usr/bin/env python3
"""Corta um take de várias falas usando o Whisper (palavras com tempo, take_w.json) + silêncios.
uso: cortar_alinhado.py take.wav falas.txt prefixo  -> prefixo0.wav, prefixo1.wav ... (uma por linha de falas.txt)"""
import json, re, subprocess, sys, difflib, unicodedata
wavp, txt, pre = sys.argv[1:4]
norm = lambda s: re.sub(r'[^a-z0-9 ]', ' ', unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode()).split()
linhas = [l.strip() for l in open(txt, encoding='utf-8') if l.strip()]
toks, dono = [], []
for i, l in enumerate(linhas):
    for t in norm(l): toks.append(t); dono.append(i)
W = json.load(open(wavp.replace('.wav', '_w.json')))
wt, wtime = [], []
for w, a, b in W:
    for t in norm(w): wt.append(t); wtime.append(a)
sm = difflib.SequenceMatcher(None, toks, wt, autojunk=False)
lw = [None] * len(wt)
for a, b, n in sm.get_matching_blocks():
    for k in range(n): lw[b + k] = dono[a + k]
ini = {}; fimw = {}
for k, i in enumerate(lw):  # só palavras que casaram com o texto
    if i is None: continue
    ini.setdefault(i, wtime[k]); fimw[i] = wtime[k]
dur = float(subprocess.run(['ffprobe', '-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', wavp], capture_output=True, text=True).stdout)
out = subprocess.run(['ffmpeg', '-v', 'info', '-i', wavp, '-af', 'silencedetect=n=-38dB:d=0.1', '-f', 'null', '-'], capture_output=True, text=True).stderr
ss = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]; se = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
sil = list(zip(ss, se))
cortes = []
for i in range(len(linhas)):
    if i not in ini:  # Whisper não pegou (fala curta): usa o trecho com som entre os silêncios do buraco
        a0 = fimw.get(i - 1, 0) + 0.4; b0 = ini.get(i + 1, dur)
        sons = [(sil[k][1], sil[k + 1][0]) for k in range(len(sil) - 1) if sil[k][1] > a0 and sil[k + 1][0] < b0]
        if not sons: sys.exit(f'fala {i} não encontrada: {linhas[i]}')
        s0 = max(sons, key=lambda x: x[1] - x[0]); ini[i] = s0[0]; fimw[i] = s0[0]
        print('aviso: fala', i, 'posicionada pelo silêncio em', round(s0[0], 2))
for i in range(len(linhas) - 1):
    a, b = fimw[i] + 0.15, ini[i + 1] + 0.05
    cand = [(e - s, s, e) for s, e in sil if s < b and e > a]
    if not cand: sys.exit(f'sem silêncio entre {i} e {i+1}')
    _, s, e = max(cand); cortes.append((s, e))
bordas = [(sil[0][1] if sil and sil[0][0] < 0.05 else 0.0)] + [x for c in cortes for x in c] + [dur]
FADE = 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse'
for i in range(len(linhas)):
    a, b = bordas[2 * i], bordas[2 * i + 1]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, a - 0.03):.3f}', '-to', f'{b + 0.03:.3f}', '-i', wavp, '-af', FADE, f'{pre}{i}.wav'], check=True)
    print(f'{pre}{i}: {a:.2f}-{b:.2f}  {linhas[i]}')
