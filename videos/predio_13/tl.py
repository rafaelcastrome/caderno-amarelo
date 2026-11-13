# Linha do tempo: 31 falas (c01..c31, uma por cena) + cena 32 muda. Gera dados.json (render) e tl.json (montagem).
# Falas tocadas com atempo 1.1 (montar.py), então a duração aqui já vem dividida por 1.1.
import json, os, subprocess
AQ = os.path.dirname(os.path.abspath(__file__)); F = os.path.join(AQ, 'falas')
TXT = [p.strip() for f in ('a.txt', 'b.txt') for p in open(os.path.join(F, f), encoding='utf-8').read().split('\n\n') if p.strip()]
assert len(TXT) == 31, len(TXT)
TEMPO = 1.1
FOLGA = {1: 0.25, 9: 0.6, 10: 0.5, 13: 0.5, 16: 0.9, 20: 0.6, 21: 0.4, 22: 1.6, 23: 0.6, 24: 0.8, 25: 0.6, 26: 0.6, 27: 0.6, 28: 0.6, 29: 1.6, 31: 0.6}
EXTRA = {9: 0.4, 20: 0.6, 21: 1.4, 23: 0.6, 26: 0.8, 28: 1.2, 31: 1.0}  # tempo de imagem depois da fala
def dur(p):
    if not os.path.exists(p): return None
    return float(subprocess.run(['ffprobe', '-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout) / TEMPO
t, cenas, est = 0.0, [], []
for i, txt in enumerate(TXT, 1):
    t += FOLGA.get(i, 0.35)
    d = dur(os.path.join(F, f'c{i:02d}.wav'))
    if d is None: d = (0.4 + 0.068 * len(txt)) / TEMPO * 1.15; est.append(i)
    cenas.append({'n': i, 't': round(t, 3), 'd': round(d, 3), 'txt': txt, 'arq': f'c{i:02d}'})
    t += d + EXTRA.get(i, 0)
t += 0.2; cenas.append({'n': 32, 't': round(t, 3), 'd': 3.2, 'txt': ''}); t += 3.2
# corte de imagem: cada cena começa um pouco antes da fala
ini = [max(0, c['t'] - (0.25 if c['n'] > 1 else c['t'])) for c in cenas]
dados = {'dur': round(t, 3), 'ini': [round(x, 3) for x in ini], 'fala': [c['t'] for c in cenas], 'fd': [c['d'] for c in cenas]}
json.dump(dados, open(os.path.join(AQ, 'dados.json'), 'w'))
json.dump({'dur': round(t, 3), 'cenas': cenas}, open(os.path.join(AQ, 'tl.json'), 'w'), ensure_ascii=False, indent=1)
print('total', round(t, 1), 's; estimadas:', est)
