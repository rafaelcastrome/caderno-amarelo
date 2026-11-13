# Gera os arquivos por id (t0.., l0.., e0.., mae0..) usados pela linha do tempo, com o timbre de cada personagem.
# Léo +1 semitom (mais novo), Edson -2 semitons (mais velho e grave). Neide/Marcos: takes novos quando existirem, senão os da 1ª gravação.
import subprocess, os, shutil
def tom(st): r = 2 ** (st / 12); return f'asetrate=24000*{r:.4f},aresample=24000,atempo={1 / r:.4f}'
FX = {'leo': tom(1.0), 'edson': tom(-2.0)}
MAP = [('tu', 't', 12, None), ('leo', 'l', 9, 'leo'), ('edson', 'e', 7, 'edson'), ('mae', 'mae', 2, None), ('neide', 'n', 4, None), ('marcos', 'm', 4, None)]
for src, pre, n, fx in MAP:
    for k in range(n):
        ent = f'{src}_{k}.wav'; out = f'{pre}{k}.wav'
        if not os.path.exists(ent):
            shutil.copy(f'../p1/{pre}{k}.wav', out); continue
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', ent] + (['-af', FX[fx]] if fx else []) + [out], check=True)
print('ok')
