#!/usr/bin/env python3
"""Uma requisição Gemini TTS (Algieba, 3.1) com estilo de contador de história de suspense. uso: tts.py falas.txt saida.wav"""
import base64, json, os, sys, urllib.request, wave
src, out = sys.argv[1], sys.argv[2]
paras = [p.strip() for p in open(src, encoding="utf-8").read().split("\n\n") if p.strip()]
texto = ("Leia em português do Brasil como um narrador contando uma história de mistério, "
         "em voz baixa e envolvente, natural, com suspense nas pausas, sem exagero. Ritmo calmo mas sem arrastar. "
         "Faça uma pausa de um segundo e meio entre cada parágrafo:\n\n" + "\n\n".join(paras))
key = os.environ.get("GEMINI_API_KEY")
body = {"contents": [{"parts": [{"text": texto}]}], "generationConfig": {"responseModalities": ["AUDIO"],
        "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Algieba"}}}}}
req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
try: r = json.load(urllib.request.urlopen(req, timeout=400))
except urllib.error.HTTPError as e: sys.exit(f"HTTP {e.code}: {e.read().decode()[:400]}")
if "content" not in r["candidates"][0]: sys.exit(json.dumps(r)[:500])
pcm = base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
with wave.open(out, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
print(out, round(len(pcm) / 48000, 1), "s")
