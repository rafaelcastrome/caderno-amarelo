# Junta video.mp4 + audio.wav, queima a legenda palavra por palavra (texto do roteiro, tempo do Whisper) e o @ que se mexe.
# Saída: predio_13.mp4 (720x1280, < ~10 MB). Uso: python3 final.py
import json, os, re, subprocess, difflib, unicodedata
AQ = os.path.dirname(os.path.abspath(__file__)); os.chdir(AQ)
TEMPO = 1.1
TL = json.load(open('tl.json')); DUR = TL['dur']
norm = lambda s: ''.join(ch for ch in unicodedata.normalize('NFD', s.lower()) if ch.isalnum())
NUM = {'12': 'doze', '13': 'treze', '14': 'catorze', '10': 'dez', '20': 'vinte', '50': 'cinquenta'}
def tempos(c):
    """palavras do roteiro com (início, fim) no vídeo"""
    ws = c['txt'].replace('...', '… ').split(); jf = f"falas/{c['arq']}_w.json"
    if not os.path.exists(jf): # sem Whisper: espalha pela duração
        tot = sum(len(w) for w in ws); t = c['t']; out = []
        for w in ws: d = c['d'] * len(w) / tot; out.append((w, t, t + d)); t += d
        return out
    W = json.load(open(jf)); wn = [norm(NUM.get(norm(x['w']), x['w'])) for x in W]; sn = [norm(w) for w in ws]
    sm = difflib.SequenceMatcher(None, sn, wn, autojunk=False); m = {}
    for a, b, n in sm.get_matching_blocks():
        for k in range(n): m[a + k] = b + k
    ta = [None] * len(ws); tb = [None] * len(ws)
    for i, j in m.items(): ta[i], tb[i] = W[j]['a'], W[j]['b']
    # sem par: interpola entre vizinhos
    for i in range(len(ws)):
        if ta[i] is None:
            p = next((tb[k] for k in range(i - 1, -1, -1) if tb[k] is not None), 0.0)
            q = next((ta[k] for k in range(i + 1, len(ws)) if ta[k] is not None), W[-1]['b'] if W else c['d'] * TEMPO)
            ta[i], tb[i] = p, max(p + 0.05, q)
    return [(w, c['t'] + a / TEMPO, c['t'] + (b if b else a + 0.3) / TEMPO) for w, a, b in zip(ws, ta, tb)]

def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h}:{m:02d}:{s:05.2f}'
ASS = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 720", "PlayResY: 1280", "WrapStyle: 0", "",
       "[V4+ Styles]", "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       "Style: L,DejaVu Sans,46,&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,1,0,0,0,100,100,0,0,1,4.5,2,2,40,40,330,1", "",
       "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
AMAR = r'{\c&H30D2FF&}'; BRANCO = r'{\c&HFFFFFF&}'
for c in TL['cenas']:
    if not c.get('txt'): continue
    ws = tempos(c); grupos, g = [], []
    for w in ws:
        g.append(w)
        if len(g) == 3 or re.search(r'[.,!?…:]$', w[0]): grupos.append(g); g = []
    if g: grupos.append(g)
    for gi, g in enumerate(grupos):
        fim_g = grupos[gi + 1][0][1] if gi + 1 < len(grupos) else g[-1][2] + 0.35
        for k, (w, a, b) in enumerate(g):
            fim = g[k + 1][1] if k + 1 < len(g) else fim_g
            txt = ' '.join((AMAR if j == k else BRANCO) + x[0].replace('{', '').replace('}', '') for j, x in enumerate(g))
            ASS.append(f"Dialogue: 0,{ts(a)},{ts(max(a + 0.05, fim))},L,,0,0,0,,{txt}")
open('legenda.ass', 'w', encoding='utf-8').write('\n'.join(ASS) + '\n')
# @ que passeia devagar pelos cantos de cima
marca = ("drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='@Cardeno_Amarelo':fontsize=24:fontcolor=white@0.55:"
         "x='40+(w-tw-80)*(0.5+0.5*sin(t/9))':y='60+(h*0.42)*(0.5+0.5*sin(t/13+1))'")
vf = f"ass=legenda.ass,{marca}"
br = int((9.6 * 8 * 1024) / DUR - 96)  # kbps de vídeo pra ficar < ~9.8 MB
for passo in (1, 2):
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', 'video.mp4', '-i', 'audio.wav', '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-b:v', f'{br}k', '-pass', str(passo), '-passlogfile', '/tmp/p13']
    cmd += (['-an', '-f', 'mp4', '/dev/null'] if passo == 1 else ['-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', 'predio_13.mp4'])
    subprocess.run(cmd, check=True)
print('predio_13.mp4', os.path.getsize('predio_13.mp4') / 1e6, 'MB', br, 'kbps')
