"""Partes comuns dos scripts da prévia de vozes (PreviaVozes).

Os motores rodam em ambientes Python separados, em amostras_vozes/_env.
Entrada: amostras_vozes/previa/falas.json. Saídas: previa/tomadas/, previa/audio/<id>.mp3 e previa/narracao.json
(depois copiados para animados/public/assets/audio/previavozes e animados/src/roteiros/previavozes).
"""
import json
import os

AMOSTRAS = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # pasta amostras_vozes
ROTEIRO = os.path.join(AMOSTRAS, "previa")
TOMADAS = os.path.join(ROTEIRO, "tomadas")
AUDIO = os.path.join(ROTEIRO, "audio")
FFMPEG = r"C:\Users\rafae\Videos\caderno-amarelo-git\animados\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"
N_TOMADAS = int(os.environ.get("N_TOMADAS", "3"))


def roteiro():
    with open(os.path.join(ROTEIRO, "falas.json"), encoding="utf-8") as f:
        return json.load(f)


def falas_do_motor(motor):
    r = roteiro()
    return [(c, r["vozes"][c["quem"]]) for c in r["cenas"] if r["vozes"][c["quem"]]["motor"] == motor]
