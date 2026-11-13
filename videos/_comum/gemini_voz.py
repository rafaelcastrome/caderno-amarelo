#!/usr/bin/env python3
"""Uma requisição Gemini TTS de UMA voz, com direção de atuação: uma fala por parágrafo, pausa longa entre elas.
uso: gemini_voz.py falas.txt saida.wav --voz Kore --direcao "..." """
import argparse, base64, json, os, sys, urllib.request, wave
ap = argparse.ArgumentParser(); ap.add_argument("falas"); ap.add_argument("saida")
ap.add_argument("--voz", required=True); ap.add_argument("--direcao", default="")
ap.add_argument("--modelo", default="gemini-3.1-flash-tts-preview")
a = ap.parse_args()
paras = [p.strip() for p in open(a.falas, encoding="utf-8").read().split("\n") if p.strip()]
texto = (a.direcao + " Fale em português do Brasil, sotaque brasileiro natural, como ator de série da Netflix. "
         "Cada linha é uma fala separada: faça uma pausa de dois segundos entre elas.\n\n" + "\n\n".join(paras))
key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
body = {"contents": [{"parts": [{"text": texto}]}], "generationConfig": {"responseModalities": ["AUDIO"],
        "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": a.voz}}}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{a.modelo}:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
try: r = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e: sys.exit(f"HTTP {e.code}: {e.read().decode()[:600]}")
pcm = base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
with wave.open(a.saida, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
print(a.saida, len(pcm) / 48000, "s")
