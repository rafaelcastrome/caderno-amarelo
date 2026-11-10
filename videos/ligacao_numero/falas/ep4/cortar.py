# Corta os takes da parte 4 em falas. Motorista = tua voz mais grave com eco.
import subprocess
MOT = 'asetrate=24000*0.94,aresample=24000,aecho=0.8:0.7:60|120:0.25|0.15'
CORTES = [('a', 0, 5.1, 'a0'), ('a', 5.1, 9.38, 'a1'), ('a', 9.38, 13.3, 'a2'), ('a', 13.3, 17.3, 'a3'), ('a', 17.3, 21.4, 'a4'),
          ('a', 21.4, 22.75, 'a5'), ('a', 22.75, 99, 'a6'),
          ('b', 0, 9.1, 'b0', MOT), ('b', 9.1, 18.0, 'b1', MOT), ('b', 18.0, 23.0, 'b2', MOT), ('b', 23.0, 27.8, 'b3', MOT)]
for src, a, b, out, *af in CORTES:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src + '.wav', '-ss', str(a), '-to', str(b)] + (['-af', af[0]] if af else []) + [out + '.wav'], check=True)
