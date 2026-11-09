# Corta os takes do episódio 2 em falas (pontos no meio dos silêncios) e aplica filtro de telefone onde precisa.
import subprocess
TEL = 'highpass=f=320,lowpass=f=3300,acompressor=threshold=-20dB:ratio=4,volume=1.4'
CORTES = [('e1', 0.0, 2.78, 'f0', None), ('e1', 2.78, 6.37, 'f1', None), ('e1', 6.37, 9.05, 'f2', None),
          ('e1', 9.05, 12.44, 'f3', None), ('e1', 12.44, 14.48, 'f4', None), ('e1', 14.48, 21.32, 'f5', TEL),
          ('e1', 21.32, 99, 'f6', None), ('e2', 0.0, 8.28, 'g0', TEL),
          ('e2', 8.28, 99, 'g1', 'asetrate=24000*0.94,aresample=24000,aecho=0.8:0.7:60|120:0.25|0.15')]
for src, a, b, out, af in CORTES:
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', src + '.wav', '-ss', str(a), '-to', str(b)]
    flt = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    cmd += ['-af', flt + (',' + af if af else ''), out + '.wav']
    subprocess.run(cmd, check=True)
    print(out, subprocess.run(['ffprobe', '-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', out + '.wav'], capture_output=True, text=True).stdout.strip())
