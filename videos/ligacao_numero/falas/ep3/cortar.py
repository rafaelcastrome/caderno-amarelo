# Corta os takes do episódio 3 em falas. Motorista = tua voz mais grave com eco (igual ao fim do ep. 2).
import subprocess
MOT = 'asetrate=24000*0.94,aresample=24000,aecho=0.8:0.7:60|120:0.25|0.15'
CORTES = [('a', 0, 3.3, 'a0'), ('a', 3.3, 6.4, 'a1'), ('a', 7.4, 10.5, 'a2'), ('a', 11.5, 16.45, 'a3'), ('a', 16.45, 19.9, 'a4'),
          ('a', 19.9, 23.9, 'a5'), ('a', 23.9, 27.25, 'a6'), ('a', 27.25, 30.37, 'a7'), ('a', 30.37, 99, 'a8'),
          ('b', 0, 6.0, 'b0', MOT), ('b', 6.0, 10.8, 'b1', MOT), ('b', 10.8, 13.87, 'b2'), ('b', 13.87, 99, 'b3', MOT)]
for src, a, b, out, *af in CORTES:
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', src + '.wav', '-ss', str(a), '-to', str(b)] + (['-af', af[0]] if af else []) + [out + '.wav']
    subprocess.run(cmd, check=True)
