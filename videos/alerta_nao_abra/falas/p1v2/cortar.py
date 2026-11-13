# Takes de uma voz por personagem (gemini_voz.py) cortados com _comum/cortar_alinhado.py; Léo 5-8 cortado à mão (Whisper confundiu os "Tô").
import subprocess
for f in ['tu', 'edson', 'mae', 'neide', 'marcos']:
    import os
    if os.path.exists(f + '.wav'): subprocess.run(['python3', '../../../_comum/cortar_alinhado.py', f + '.wav', f + '.txt', f + '_'], check=True)
subprocess.run(['python3', '../../../_comum/cortar_alinhado.py', 'leo.wav', 'leo.txt', 'leo_'])
F = 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse'
for a, b, o in [(16.24, 17.80, 'leo_5'), (18.33, 18.68, 'leo_6'), (19.45, 21.46, 'leo_7'), (22.13, 23.76, 'leo_8')]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-to', str(b), '-i', 'leo.wav', '-af', F, o + '.wav'], check=True)
