# Junta pedacos -> video.mp4, + audio.wav, legenda palavra por palavra (texto do roteiro, tempos do Whisper em voz_w.json),
# título na folha do caderno na abertura e o @ que passeia. Saída: rios_ferveram.mp4 (< ~10 MB)
import json, os, re, subprocess, difflib, unicodedata
os.chdir(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open('dados.json'))['tl']; DUR = TL[-1]['ini'] + TL[-1]['dur'] + 2.8
open('pedacos/lista.txt', 'w').write(''.join(f"file 'p{k}.mp4'\n" for k in range(4)))
if not os.environ.get('SEMCONCAT'): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'pedacos/lista.txt', '-c', 'copy', 'video.mp4'], check=True)
norm = lambda s: ''.join(ch for ch in unicodedata.normalize('NFD', s.lower()) if ch.isalnum())
txt = open('audio/falas.txt', encoding='utf-8').read().split('\n\n')
W = json.load(open('voz_w.json')); wn = [norm(w['text']) for w in W]
ASS = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 720", "PlayResY: 1280", "WrapStyle: 0", "",
       "[V4+ Styles]", "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       "Style: L,DejaVu Sans,44,&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,1,0,0,0,100,100,0,0,1,4.5,2,2,40,40,300,1", "",
       "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
AMAR = r'{\c&H30D2FF&}'; BRANCO = r'{\c&HFFFFFF&}'
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h}:{m:02d}:{s:05.2f}'
ws = ' '.join(p.strip() for p in txt).replace('...', '… ').split(); sn = [norm(w) for w in ws]
sm = difflib.SequenceMatcher(None, sn, wn, autojunk=False); m = {}
for a, b, n in sm.get_matching_blocks():
    for k in range(n): m[a + k] = b + k
ta = [None] * len(ws); tb = [None] * len(ws)
for i, j in m.items(): ta[i], tb[i] = W[j]['timestamp'][0], W[j]['timestamp'][1] or W[j]['timestamp'][0] + 0.3
for i in range(len(ws)):
    if ta[i] is None:
        p = next((tb[k] for k in range(i - 1, -1, -1) if tb[k] is not None), 0.0)
        q = next((ta[k] for k in range(i + 1, len(ws)) if ta[k] is not None), p + 0.4)
        ta[i], tb[i] = p, max(p + 0.05, q)
pal = list(zip(ws, ta, tb)); grupos, g = [], []; EV = []
for w in pal:
    g.append(w)
    if len(g) == 3 or re.search(r'[.,!?…:]$', w[0]): grupos.append(g); g = []
if g: grupos.append(g)
for gi, g in enumerate(grupos):
    prox = grupos[gi + 1][0][1] if gi + 1 < len(grupos) else g[-1][2] + 0.4
    fim_g = min(prox, g[-1][2] + 0.6)
    for k, (w, a, b) in enumerate(g):
        fim = g[k + 1][1] if k + 1 < len(g) else fim_g
        t = ' '.join((AMAR if j == k else BRANCO) + x[0] for j, x in enumerate(g))
        EV.append([a, max(a + 0.05, fim), t])
EV.sort(key=lambda e: e[0])
for i, e in enumerate(EV):
    if i + 1 < len(EV): e[1] = min(e[1], EV[i + 1][0])
    if e[1] - e[0] > 0.02: ASS.append(f"Dialogue: 0,{ts(e[0])},{ts(e[1])},L,,0,0,0,,{e[2]}")
open('legenda.ass', 'w', encoding='utf-8').write('\n'.join(ASS) + '\n')
T1 = TL[1]['ini']
marca = ("drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='@Cardeno_Amarelo':fontsize=24:fontcolor=white@0.55:"
         "x='40+(w-tw-80)*(0.5+0.5*sin(t/9))':y='330+(h*0.3)*(0.5+0.5*sin(t/13+1))'")
fc = (f"[1:v]format=rgba,fade=t=out:st={T1 - 0.6}:d=0.6:alpha=1[ti];"
      f"[0:v][ti]overlay=x=0:y=60:enable='lt(t,{T1})'[v1];"
      f"[3:v]format=rgba,fade=t=in:st={DUR - 4.5}:d=0.4:alpha=1[ct];"
      f"[v1][ct]overlay=x=0:y=110:enable='gte(t,{DUR - 4.5})'[v2];"
      f"[v2]ass=legenda.ass,{marca}[v]")
br = int((9.2 * 8 * 1024) / DUR - 96)
for passo in (1, 2):
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', 'video.mp4', '-loop', '1', '-t', str(DUR), '-i', 'titulo.png', '-i', 'audio.wav', '-loop', '1', '-t', str(DUR), '-i', 'cta.png', '-filter_complex', fc, '-map', '[v]',
           '-c:v', 'libx264', '-preset', 'slow', '-b:v', f'{br}k', '-pass', str(passo), '-passlogfile', '/tmp/claude-0/rf']
    cmd += (['-an', '-f', 'mp4', '/dev/null'] if passo == 1 else ['-map', '2:a', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', 'rios_ferveram.mp4'])
    subprocess.run(cmd, check=True)
print('rios_ferveram.mp4', os.path.getsize('rios_ferveram.mp4') / 1e6, 'MB', br, 'kbps')
