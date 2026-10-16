"""Transcreve cada tomada com Whisper (faster-whisper large-v3-turbo, marca de tempo por palavra), fica com a tomada
que mais bate com o texto do roteiro e grava previa/audio/<id>.mp3 (loudnorm -16 LUFS, 48 kHz mono, como o narrar.mjs)
e previa/narracao.json (mesmo formato do narrar.mjs). A legenda usa as palavras do roteiro com os tempos do Whisper.
"""
import difflib, glob, json, os, re, subprocess, sys, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import AUDIO, FFMPEG, ROTEIRO, TOMADAS, roteiro
from faster_whisper import WhisperModel

NUM = {"1": "um", "2": "dois", "6": "seis", "6x1": "seis por um", "6por1": "seis por um", "40": "quarenta",
       "42": "quarenta e duas", "44": "quarenta e quatro", "underline": "anderlain"}


def normal(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)


def tokens_roteiro(fala):
    return [w for w in (re.sub(r"^\W+|\W+$", "", p) for p in fala.split()) if w]


def palavras_whisper(segs):
    out = []
    for s in segs:
        for w in s.words or []:
            t = normal(w.word)
            partes = NUM.get(t, t).split()
            passo = (w.end - w.start) / max(1, len(partes))  # "42" -> "quarenta e duas": divide o tempo da palavra
            for k, parte in enumerate(partes):
                out.append({"n": parte, "inicio": w.start + k * passo, "fim": w.start + (k + 1) * passo})
    return out


def alinhar(tokens, ws):
    a = [normal(t) for t in tokens]
    b = [w["n"] for w in ws]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    tempos = [None] * len(a)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                tempos[i1 + k] = (ws[j1 + k]["inicio"], ws[j1 + k]["fim"])
        elif op == "replace":  # quantidades diferentes: espalha o trecho do Whisper pelas palavras do roteiro
            ini, fim = ws[j1]["inicio"], ws[j2 - 1]["fim"]
            passo = (fim - ini) / (i2 - i1)
            for k in range(i2 - i1):
                tempos[i1 + k] = (ini + k * passo, ini + (k + 1) * passo)
    for i, t in enumerate(tempos):  # palavra que o Whisper não ouviu: encaixa entre as vizinhas
        if t is None:
            ant = next((tempos[k][1] for k in range(i - 1, -1, -1) if tempos[k]), 0.05)
            prox = next((tempos[k][0] for k in range(i + 1, len(tempos)) if tempos[k]), ant + 0.3)
            tempos[i] = (ant, max(ant + 0.05, min(prox, ant + 0.3)))
    faltam = sum(i2 - i1 for op, i1, i2, j1, j2 in sm.get_opcodes() if op == "delete")
    return [{"texto": t, "inicio": round(s, 3), "fim": round(e, 3)} for t, (s, e) in zip(tokens, tempos)], sm.ratio(), faltam


def main():
    r = roteiro()
    m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
    os.makedirs(AUDIO, exist_ok=True)
    indice = {"voz": "varias (ver falas.json > vozes)", "falas": {}}
    total = 0.0
    for c in r["cenas"]:
        melhor = None
        for arq in sorted(glob.glob(os.path.join(TOMADAS, f"{c['id']}_t*.*"))):
            segs, info = m.transcribe(arq, language="pt", beam_size=5, word_timestamps=True)
            segs = list(segs)
            palavras, nota, faltam = alinhar(tokens_roteiro(c["fala"]), palavras_whisper(segs))
            fala_s = palavras[-1]["fim"]
            txt = " ".join(s.text.strip() for s in segs)
            print(f"{os.path.basename(arq):12} nota {nota:.2f} faltam {faltam}  fala {fala_s:4.1f}s | {txt}", flush=True)
            chave = (-faltam, round(nota, 2), -fala_s)  # palavra engolida pesa mais que palavra trocada
            if melhor is None or chave > melhor[0]:
                melhor = (chave, arq, palavras, info.duration, nota, txt)
        _, arq, palavras, dur, nota, txt = melhor
        vel = r["vozes"][c["quem"]].get("velocidade", 1.0)  # atempo: acelera sem mudar a altura da voz
        if vel != 1.0:
            palavras = [{**p, "inicio": round(p["inicio"] / vel, 3), "fim": round(p["fim"] / vel, 3)} for p in palavras]
            dur /= vel
        filtro = (f"atempo={vel}," if vel != 1.0 else "") + "loudnorm=I=-16:TP=-1.5:LRA=11"
        subprocess.check_call([FFMPEG, "-y", "-loglevel", "error", "-i", arq, "-af", filtro,
                               "-ar", "48000", "-ac", "1", "-b:a", "160k", os.path.join(AUDIO, f"{c['id']}.mp3")])
        indice["falas"][c["id"]] = {"texto": c["fala"], "tomada": os.path.basename(arq), "nota_whisper": round(nota, 3),
                                    "ouvido": txt, "arquivo": f"assets/audio/{r.get('pasta_audio', 'previavozes')}/{c['id']}.mp3",
                                    "duracao": round(dur, 3), "palavras": palavras}
        print(f"==> {c['id']}: {os.path.basename(arq)} (nota {nota:.2f})", flush=True)
        total += c.get("antes", 0) + min(dur, palavras[-1]["fim"] + 0.25) + c.get("pausa", 0.5)
    indice["total"] = round(total, 3)
    with open(os.path.join(ROTEIRO, "narracao.json"), "w", encoding="utf-8") as f:
        f.write(json.dumps(indice, ensure_ascii=False, indent=1) + "\n")
    print(f"Total estimado: {total:.1f} s")


main()
