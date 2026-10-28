# Gera cenas/audio/cenaN.mp3 com a voz Antonio (edge-tts) a partir de cenas/projeto.json.
# Rodar no PC do Rafael (a nuvem bloqueia o endpoint novo da Microsoft):  python gravar_antonio_pc.py
import asyncio, json, os, edge_tts
edge_tts.communicate.WSS_URL = ("wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1"
                                "?Ocp-Apim-Subscription-Key=" + edge_tts.constants.TRUSTED_CLIENT_TOKEN)
AQUI = os.path.dirname(os.path.abspath(__file__))
proj = json.load(open(os.path.join(AQUI, "cenas", "projeto.json"), encoding="utf-8"))
out = os.path.join(AQUI, "cenas", "audio")
os.makedirs(out, exist_ok=True)

async def main():
    for i, c in enumerate(proj["cenas"], 1):
        mp3 = os.path.join(out, f"cena{i}.mp3")
        await edge_tts.Communicate(c["fala"], proj["voz"]["edge"], rate=proj["voz"]["edgeRate"]).save(mp3)
        print("ok", mp3, os.path.getsize(mp3))

asyncio.run(main())
