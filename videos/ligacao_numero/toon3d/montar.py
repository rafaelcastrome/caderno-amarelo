# Junta o vídeo 3D (video_teste.mp4) com falas, toque, ambiente e legendas no estilo da referência.
import subprocess, numpy as np, os
SR = 48000; F = '../falas/p1/'; S = '../sfx/'
def wav(p): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
DUR = 16.0
mix = np.zeros(int(DUR * SR) + SR, np.float32)
def poe(a, t, g=1.0): i = int(t * SR); a = a[:len(mix) - i]; mix[i:i + len(a)] += a * g
falas = [(0.5, 'a0', 'mae', 'Filho! Tu vai perder o ônibus das 7!'), (3.9, 'a1', 'tu', 'Tô indo, mãe! Cadê esse tênis...'),
         (9.2, 'a2', 'tu', 'Ué... esse número... é o meu.'), (12.5, 'a3', 'tu', 'Alô?'), (13.2, 'a4', 'tel', 'Não entra no ônibus das 7.')]
for t, n, q, x in falas: poe(wav(F + n + '.wav'), t)
for t in np.arange(7.4, 12.0, 2.62): poe(wav(S + 'toque.wav')[:int(min(2.62, 12.0 - t) * SR)], t, 0.45)
fundo = wav(S + 'fundo.wav'); poe(fundo[:int(DUR * SR)], 0, 0.3)
mix = mix / np.abs(mix).max() * 0.9
mix[:int(DUR * SR)].tofile('audio.f32')
COR = {'mae': '0xd9b3ff', 'tu': '0xffffff', 'tel': '0xff8a8a'}
FT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
os.makedirs('leg', exist_ok=True); fil = []
dur = {n: float(subprocess.run(['ffprobe', '-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', F + n + '.wav'], capture_output=True, text=True).stdout) for _, n, _, _ in falas}
for i, (t, n, q, x) in enumerate(falas):
    b = min(t + dur[n] + 0.4, falas[i + 1][0] - 0.05) if i + 1 < len(falas) else DUR
    open(f'leg/{i}.txt', 'w').write(x)
    fil.append(f"drawtext=fontfile={FT}:textfile=leg/{i}.txt:fontsize=30:fontcolor={COR[q]}:borderw=4:bordercolor=0x111111:x=(w-tw)/2:y=h*0.17:enable='between(t,{t:.2f},{b:.2f})'")
fil.append(f"drawtext=fontfile={FT}:text='@Cardeno_Amarelo':fontsize=22:fontcolor=white@0.6:borderw=2:bordercolor=0x000000@0.4:x=40+(w-tw-80)*(0.5+0.5*sin(t*0.37)):y=h*0.08+40*sin(t*0.23)")
open('filtro.txt', 'w').write(','.join(fil))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'video_teste.mp4', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'audio.f32', '-filter_script:v', 'filtro.txt',
                '-af', 'loudnorm=I=-15:TP=-1.5', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-shortest', '-movflags', '+faststart', 'teste_3d.mp4'], check=True)
print('ok')
