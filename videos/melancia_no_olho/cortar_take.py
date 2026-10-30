#!/usr/bin/env python3
"""Corta uma tomada única (Gemini) em falas: falas/cortes/cenaNN.wav.

Usa os tempos das palavras do Whisper (take1_words.json) só para achar a vizinhança de cada
fronteira; o corte vai para o MEIO do maior silêncio real (RMS < -50 dB, >= 60 ms) ali perto.
Uso: python cortar_take.py falas/take1.wav falas/take1_words.json
"""
import difflib, json, math, os, re, subprocess, sys, unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
TAXA, HOP = 24000, 240  # 10 ms
LIM = -50


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in s if unicodedata.category(c) != 'Mn'))


def main():
    take, palavras = sys.argv[1], json.load(open(sys.argv[2]))
    cenas = json.load(open(os.path.join(AQUI, 'cenas', 'projeto.json'), encoding='utf-8'))['cenas']
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', take, '-ac', '1', '-ar', str(TAXA), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    a = memoryview(raw).cast('h')
    n = len(a) // HOP
    db = []
    for k in range(n):
        seg = a[k * HOP:(k + 1) * HOP]
        rms = math.sqrt(sum(x * x for x in seg) / HOP) / 32768
        db.append(20 * math.log10(rms + 1e-9))
    # trechos de silêncio
    sil, k = [], 0
    while k < n:
        if db[k] < LIM:
            j = k
            while j < n and db[j] < LIM:
                j += 1
            if j - k >= 6:
                sil.append((k * HOP / TAXA, j * HOP / TAXA))
            k = j
        else:
            k += 1
    ws = [(norm(w['text']), w['timestamp'][0], w['timestamp'][1]) for w in palavras]
    cortes, idx = [], 0
    for c in cenas[1:]:
        # as duas primeiras palavras da fala, comparadas por semelhança (o Whisper escreve "piska", "3"...)
        nw = min(2, len(c['fala'].split()))
        alvo = ''.join(norm(x) for x in c['fala'].split()[:nw])
        p1 = norm(c['fala'].split()[0])
        while idx < len(ws) and (difflib.SequenceMatcher(None, alvo, ''.join(w[0] for w in ws[idx:idx + nw])).ratio() < 0.75
                                 or difflib.SequenceMatcher(None, p1, ws[idx][0]).ratio() < 0.6):
            idx += 1
        if idx >= len(ws):
            sys.exit(f'não achei o começo de: {c["fala"]}')
        t = ws[idx][1]
        ant = cortes[-1] if cortes else 0.0
        perto = [s for s in sil if s[1] > t - 1.5 and s[0] < t + 0.5 and (s[0] + s[1]) / 2 > ant + 0.2]
        if not perto:
            sys.exit(f'sem silêncio perto de {t:.2f}s ({c["fala"][:30]})')
        # o fim do silêncio deve cair perto do começo da palavra (o Whisper atrasa ~0,2 s)
        s = min(perto, key=lambda s: abs(s[1] - (t - 0.15)) - 0.3 * min(s[1] - s[0], 0.5))
        cortes.append((s[0] + s[1]) / 2)
        idx += 1
    out = os.path.join(AQUI, 'falas', 'cortes')
    os.makedirs(out, exist_ok=True)
    limites = [0.0] + cortes + [len(a) / TAXA]
    for i in range(len(cenas)):
        t0, t1 = limites[i], limites[i + 1]
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', take, '-ss', f'{t0:.3f}', '-to', f'{t1:.3f}',
                        '-af', 'afade=t=in:d=0.008,areverse,afade=t=in:d=0.008,areverse',
                        os.path.join(out, f'cena{i + 1:02d}.wav')], check=True)
        print(f'cena{i + 1:02d}: {t0:6.2f} -> {t1:6.2f}')


if __name__ == '__main__':
    main()
