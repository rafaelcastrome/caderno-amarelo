# Prévia de planos: prev.py 1 3 6 (números das cenas) [--f 0.6] -> prev/grade.jpg
import json, subprocess, sys, glob, os, re
from PIL import Image
a = sys.argv[1:]; f = 0.6
if '--f' in a: i = a.index('--f'); f = float(a[i + 1]); a = a[:i] + a[i + 2:]
d = json.load(open('dados.json')); I = d['ini'] + [d['dur']]
ts = [round(I[n - 1] + (I[n] - I[n - 1]) * f, 2) for n in map(int, a)]
for x in glob.glob('prev/q_*.jpg'): os.remove(x)
subprocess.run(['node', '../_toon3d/render.js', 'cena.js', 'prev/q.mp4', '--dados', 'dados.json', '--prev', *map(str, ts)], check=True)
fs = [f'prev/q_{t}.jpg' if os.path.exists(f'prev/q_{t}.jpg') else f'prev/q_{t:g}.jpg' for t in ts]
n = len(fs); c = min(8, n); r = (n + c - 1) // c
im = Image.new('RGB', (c * 225, r * 400))
for k, x in enumerate(fs): im.paste(Image.open(x).resize((225, 400)), ((k % c) * 225, (k // c) * 400))
im.save('prev/grade.jpg'); print(ts)
