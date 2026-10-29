#!/usr/bin/env python3
"""Junta as falas (falas/antonio/cenaNN.mp3) em cenas/narration.mp3 + cenas/timeline.json.

Cada fala tem o silêncio da ponta aparado (corte só onde o som está abaixo de -50 dB),
depois vem a pausa da cena (projeto.json -> cenas[i].pausa). timeline: start / falaFim / end.
Uso: python montar_audio.py [pasta_das_falas]
"""
import json, os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
FALAS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, 'falas', 'antonio')
CENAS = os.path.join(AQUI, 'cenas')
TAXA = 24000


def pcm(arq):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', arq, '-ac', '1', '-ar', str(TAXA), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    return memoryview(raw).cast('h')


def aparar(a, limiar=0.003, folga=0.06):
    lim = int(limiar * 32768)
    ini = next((i for i in range(len(a)) if abs(a[i]) > lim), 0)
    fim = next((i for i in range(len(a) - 1, -1, -1) if abs(a[i]) > lim), len(a) - 1)
    f = int(folga * TAXA)
    return a[max(0, ini - f):min(len(a), fim + f)]


def main():
    cenas = json.load(open(os.path.join(CENAS, 'projeto.json'), encoding='utf-8'))['cenas']
    saida, tl, t = bytearray(), [], 0.0
    for i, c in enumerate(cenas, 1):
        fala = aparar(pcm(os.path.join(FALAS, f'cena{i:02d}.mp3')))
        saida += fala.tobytes()
        falaFim = t + len(fala) / TAXA
        pausa = int(c.get('pausa', 0.3) * TAXA)
        saida += bytes(2 * pausa)
        end = falaFim + pausa / TAXA
        tl.append({'start': round(t, 3), 'falaFim': round(falaFim, 3), 'end': round(end, 3)})
        t = end
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(TAXA), '-ac', '1', '-i', '-',
                    '-af', 'afade=t=in:d=0.01', '-b:a', '160k', os.path.join(CENAS, 'narration.mp3')],
                   input=bytes(saida), check=True)
    json.dump({'total': round(t, 3), 'motor_tts': 'edge pt-BR-AntonioNeural +10% (gravado no PC)', 'cenas': tl},
              open(os.path.join(CENAS, 'timeline.json'), 'w'), indent=1)
    print(f'narration.mp3: {t:.1f} s, {len(tl)} cenas')


if __name__ == '__main__':
    main()
