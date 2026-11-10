#!/usr/bin/env python3
"""Uma requisição Gemini TTS (Algieba, 3.1 preview) com todas as falas -> take.wav."""
import base64, json, os, sys, urllib.request, wave
falas, saida = sys.argv[1], sys.argv[2]
paras = [p.strip() for p in open(falas, encoding="utf-8").read().split("\n\n") if p.strip()]
texto = ("Narre em português do Brasil, como um criador de vídeos curtos animado e próximo, "
         "falando rápido e natural, com tom de espanto crescente: cada número é uma surpresa, "
         "e o final é de queixo caído. Faça uma pausa de dois segundos entre cada parágrafo:\n\n"
         + "\n\n".join(paras))
key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
body = {"contents": [{"parts": [{"text": texto}]}],
        "generationConfig": {"responseModalities": ["AUDIO"],
                             "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Algieba"}}}}}
req = urllib.request.Request(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
try:
    r = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e:
    sys.exit(f"HTTP {e.code}: {e.read().decode()[:600]}")
pcm = base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
with wave.open(saida, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
print(saida, len(pcm) / 48000, "s")
