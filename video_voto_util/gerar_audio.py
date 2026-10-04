"""Gera a narração de cada cena com edge-tts (ou um motor offline em pt-BR), mede as durações com ffprobe,
concatena tudo em narration.mp3 e salva os tempos das cenas em timeline.json."""
import asyncio
import json
import os
import re
import subprocess

import soundfile as sf

import edge_tts
import edge_tts.communicate as communicate

# O proxy de saída reassina o TLS; confia também no bundle dele, se existir.
CA_BUNDLE = "/root/.ccr/ca-bundle.crt"
if os.path.exists(CA_BUNDLE):
    communicate._SSL_CTX.load_verify_locations(cafile=CA_BUNDLE)

VOICE = "pt-BR-AntonioNeural"
RATE = "+10%"
HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(HERE, "audio")

CENAS = [
    "Existe mesmo voto útil no primeiro turno? Vamos olhar para a matemática da urna no papel.",
    "Para vencer a eleição já no primeiro turno, qualquer candidato precisa atingir a linha mágica de cinquenta por cento mais um dos votos válidos.",
    "Imagine que o Candidato A está na frente com quarenta e três por cento. Logo atrás vem o Candidato B com vinte e oito por cento, e outros três nomes do mesmo campo político têm seis, cinco e quatro por cento.",
    "Muita gente diz: tire o voto dos candidatos menores e passe para o B para derrotar o A no primeiro turno. Mas veja o que acontece quando somamos tudo.",
    "O Candidato B chegou aos cinquenta por cento mais um para ganhar no primeiro turno? Não. E o Candidato A perdeu algum voto com essa troca? Zero. A barra dele continua intacta.",
    "Matematicamente, trocar votos dentro da oposição não tira um milímetro do líder no primeiro turno. Para reduzir a porcentagem dele, é preciso tirar votos diretamente dele ou trazer novos eleitores. No primeiro turno, essa disputa serve apenas para medir força política para o segundo turno.",
    # Final: uma pequena história e o convite para seguir as redes.
    "Pense no João. Ele gostava do candidato C, mas trocou o voto pelo B achando que assim derrotaria o A já no primeiro turno. Na noite da apuração, o A continuava com os mesmos quarenta e três por cento, e a eleição foi para o segundo turno, exatamente como iria de qualquer jeito.",
    # Os @ estão escritos como se pronunciam ("rafaelcastrome", "rafaelcastro_me").
    "Moral da história: no primeiro turno, cada eleitor pode votar em quem realmente o representa, porque o confronto direto acontece no segundo turno. Gostou da explicação? Me segue no Instagrã, arroba rafael castro mê, e no Tic Tóc, arroba rafael castro ânderláin mê.",
]

# Pausa extra depois de cada cena (a cena 6 ganha mais tempo para a virada de página).
PAUSAS = {6: 1.4, 8: 2.5}

# Pequena pausa entre as cenas para a mão "respirar".
GAP = 0.6


def duracao(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path,
    ])
    return float(out.strip())


async def gerar_edge(texto, mp3):
    await edge_tts.Communicate(texto, VOICE, rate=RATE).save(mp3)


# Reserva offline 1: Kokoro (modelo neural, voz masculina nativa pt-BR "pm_alex").
# Os arquivos do modelo vêm das releases do GitHub do kokoro-onnx (~350 MB).
KOKORO_DIR = os.path.join(HERE, "models")
KOKORO_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
KOKORO_FILES = ["kokoro-v1.0.onnx", "voices-v1.0.bin"]
_kokoro = None


def gerar_kokoro(texto, mp3):
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro
        os.makedirs(KOKORO_DIR, exist_ok=True)
        for nome in KOKORO_FILES:
            destino = os.path.join(KOKORO_DIR, nome)
            if not os.path.exists(destino):
                subprocess.check_call(["curl", "-sS", "-L", "--fail", "-o", destino, KOKORO_URL + nome])
        _kokoro = Kokoro(*(os.path.join(KOKORO_DIR, n) for n in KOKORO_FILES))
    fonemas = _kokoro.tokenizer.phonemize(texto, "pt-br")
    # O eSpeak insere uma vogal de apoio entre "r" e consoante ("tur-ə-no", "ur-ə-na");
    # no português brasileiro falado ela não existe.
    fonemas = re.sub(r"ɾə(?=[^\sˈˌaeiouɐɛɔæʊɪ])", "ɾ", fonemas)
    audio, sr = _kokoro.create(fonemas, voice="pm_alex", speed=1.1, lang="pt-br", is_phonemes=True)
    wav = mp3[:-4] + "_kokoro.wav"
    sf.write(wav, audio, sr)
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", wav, "-b:a", "192k", mp3])
    os.remove(wav)


def gerar_espeak(texto, mp3):
    """Reserva offline 2 (eSpeak-NG + MBROLA br3): voz sintética, bem robótica."""
    wav = mp3[:-4] + "_espeak.wav"
    subprocess.check_call(["espeak-ng", "-v", "mb-br3", "-s", "165", "-w", wav, texto],
                          stderr=subprocess.DEVNULL)
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", wav, "-b:a", "192k", mp3])
    os.remove(wav)


MOTORES = [
    ("edge-tts (pt-BR-AntonioNeural)", gerar_edge),
    ("kokoro (pm_alex, pt-BR)", gerar_kokoro),
    ("espeak-ng (mb-br3)", gerar_espeak),
]


async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    # Usa o primeiro motor que funcionar e mantém a mesma voz em todas as cenas.
    for motor, gerar in MOTORES:
        try:
            for i, texto in enumerate(CENAS, 1):
                r = gerar(texto, os.path.join(AUDIO_DIR, f"cena{i}.mp3"))
                if asyncio.iscoroutine(r):
                    await r
            break
        except Exception as e:  # noqa: BLE001
            print(f"[aviso] {motor} falhou ({type(e).__name__}: {str(e)[:200]}); tentando o próximo motor.")
    else:
        raise SystemExit("Nenhum motor de TTS funcionou.")

    # Converte cada cena em WAV (com o silêncio do intervalo) e concatena.
    lista = []
    cenas = []
    t = 0.0
    for i in range(1, len(CENAS) + 1):
        mp3 = os.path.join(AUDIO_DIR, f"cena{i}.mp3")
        wav = os.path.join(AUDIO_DIR, f"cena{i}.wav")
        d = duracao(mp3)
        pad = PAUSAS.get(i, GAP)
        subprocess.check_call([
            "ffmpeg", "-y", "-v", "error", "-i", mp3, "-ar", "44100", "-ac", "2",
            "-af", f"apad=pad_dur={pad}", wav,
        ])
        dw = duracao(wav)
        cenas.append({"cena": i, "start": round(t, 3), "end": round(t + dw, 3),
                      "fala": round(d, 3), "texto": CENAS[i - 1]})
        t += dw
        lista.append(f"file '{wav}'")

    lista_path = os.path.join(AUDIO_DIR, "lista.txt")
    with open(lista_path, "w") as f:
        f.write("\n".join(lista) + "\n")
    subprocess.check_call([
        "ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lista_path,
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100",
        "-c:a", "libmp3lame", "-b:a", "192k", os.path.join(HERE, "narration.mp3"),
    ])

    total = duracao(os.path.join(HERE, "narration.mp3"))
    with open(os.path.join(HERE, "timeline.json"), "w") as f:
        json.dump({"total": round(total, 3), "motor_tts": motor, "cenas": cenas}, f, ensure_ascii=False, indent=2)
    for c in cenas:
        print(f"Cena {c['cena']}: {c['start']:.2f}s -> {c['end']:.2f}s")
    print(f"Total: {total:.2f}s  (voz: {motor})")


if __name__ == "__main__":
    asyncio.run(main())
