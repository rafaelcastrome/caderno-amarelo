# Junta as partes renderizadas + música do vídeo de referência + letra na tela + @ que se move.
# Uso: python3 montar.py <video_referencia.mp4>
import subprocess, sys, json, os
from PIL import Image, ImageDraw, ImageFont
AQUI = os.path.dirname(os.path.abspath(__file__)); os.chdir(AQUI)
REF = sys.argv[1]; FIM = json.load(open('dados.json'))['fim']
LETRA = [(0, 1.9, 'Minha meta agora é\nmanter meu'), (1.9, 2.83, 'filho vivo'), (4.07, 5.53, 'Ele não quer\nescutar nada'), (5.53, 6.9, 'do que eu digo'),
         (8.1, 9.83, 'É o dia inteiro\nsalvando ele do\nperigo'), (9.83, 12.2, 'ele sobe em tudo'), (12.2, 14.33, 'vive correndo risco'),
         (15.47, 17.2, 'Sobe'), (17.2, 19.1, 'em tudo'), (19.1, 20.37, 'corre'), (20.37, 22.03, 'Perigo'), (23.3, 24.0, 'Sobe'), (24.0, 25.4, 'Em tudo'),
         (25.4, 26.2, 'Corre'), (26.2, 27.23, 'Perigo'), (27.23, 28.13, 'Sobe em tudo'), (28.13, 28.97, 'Sempre tá'), (28.97, 30.6, 'em perigo')]
F = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf', 60)
os.makedirs('render/letra', exist_ok=True)
pngs = []
for i, (a, b, txt) in enumerate(LETRA):
    im = Image.new('RGBA', (720, 1280), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    linhas = txt.split('\n'); y0 = 790 - len(linhas) * 37
    for k, l in enumerate(linhas):
        w = d.textlength(l, font=F); x = (720 - w) / 2; y = y0 + k * 74
        sombra = Image.new('RGBA', im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sombra)
        ds.text((x + 2, y + 4), l, font=F, fill=(0, 0, 0, 150)); im = Image.alpha_composite(im, sombra); d = ImageDraw.Draw(im)
        d.text((x, y), l, font=F, fill='white', stroke_width=2, stroke_fill=(30, 30, 30, 200))
    p = f'render/letra/l{i:02d}.png'; im.save(p); pngs.append((a, b, p))
open('render/lista.txt', 'w').write(''.join(f"file 'parte{k}.mp4'\n" for k in range(3)))
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', 'render/lista.txt', '-c', 'copy', 'render/video.mp4'], check=True)
ins = ['-i', 'render/video.mp4', '-ss', '0', '-t', str(FIM), '-i', REF]
for a, b, p in pngs: ins += ['-i', p]
fc = '[0:v]null[v0];'
for i, (a, b, p) in enumerate(pngs):
    fc += f"[v{i}][{i + 2}:v]overlay=0:0:enable='between(t,{a},{b - 0.001})'[v{i + 1}];"
n = len(pngs)
# @ que passeia devagar pela tela (marca d'água móvel)
fc += (f"[v{n}]drawtext=fontfile=/usr/share/fonts/opentype/inter/Inter-Bold.otf:text='@Cardeno_Amarelo':fontsize=26:fontcolor=white@0.55:"
       f"shadowcolor=black@0.35:shadowx=1:shadowy=1:x='60+(w-text_w-120)*(0.5+0.5*sin(t*0.21))':y='150+(h-420)*(0.5+0.5*sin(t*0.13+1.2))'[vf];"
       f"[1:a]afade=t=out:st={FIM - 0.9}:d=0.9[af]")
subprocess.run(['ffmpeg', '-y', '-v', 'error', *ins, '-filter_complex', fc, '-map', '[vf]', '-map', '[af]', '-t', str(FIM),
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '160k', 'bebe_traquinas.mp4'], check=True)
print('ok', os.path.getsize('bebe_traquinas.mp4') // 1024, 'KB')
