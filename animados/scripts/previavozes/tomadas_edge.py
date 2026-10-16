"""Tomada do edge-tts (determinístico: uma tomada basta). Precisa de internet."""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import ja_existe, TOMADAS, falas_do_motor
import edge_tts


async def main():
    os.makedirs(TOMADAS, exist_ok=True)
    for c, voz in [x for x in falas_do_motor("edge") if not ja_existe(x[0]["id"])]:
        await edge_tts.Communicate(c["fala"], voz["voz"], rate=voz.get("ritmo", "+0%")).save(os.path.join(TOMADAS, f"{c['id']}_t1.mp3"))
        print(c["id"], "ok", flush=True)

asyncio.run(main())
