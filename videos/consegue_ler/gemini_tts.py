#!/usr/bin/env python3
"""Narração com Gemini TTS (só biblioteca padrão; roda na nuvem ou no PC do Rafael).

Uso:
  python gemini_tts.py <voz> <texto.txt> <saida.wav> [--modelo gemini-2.5-flash-preview-tts]
A chave vem da variável de ambiente GEMINI_API_KEY (ou GOOGLE_API_KEY). Nunca grave a chave em arquivo.
"""
import base64, json, os, sys, urllib.request, wave

ESTILO = ("Leia em português do Brasil, sotaque brasileiro, como um criador de TikTok "
          "gravando um áudio de WhatsApp: animado, natural, ritmo rápido, respeitando as "
          "pausas das reticências. Leia só o texto, sem comentar nada:\n\n")


def main():
    args = sys.argv[1:]
    modelo = 'gemini-2.5-flash-preview-tts'
    if '--modelo' in args:
        i = args.index('--modelo'); modelo = args[i + 1]; del args[i:i + 2]
    voz, txt, out = args
    chave = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not chave:
        sys.exit('GEMINI_API_KEY não está definida')
    texto = open(txt, encoding='utf-8').read().strip()
    corpo = {
        'contents': [{'parts': [{'text': ESTILO + texto}]}],
        'generationConfig': {
            'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voz}}},
        },
    }
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent',
        data=json.dumps(corpo).encode(), headers={'Content-Type': 'application/json', 'x-goog-api-key': chave})
    with urllib.request.urlopen(req, timeout=300) as r:
        resp = json.load(r)
    parte = resp['candidates'][0]['content']['parts'][0]['inlineData']
    pcm = base64.b64decode(parte['data'])
    taxa = 24000
    for p in parte.get('mimeType', '').split(';'):
        if p.strip().startswith('rate='):
            taxa = int(p.split('=')[1])
    with wave.open(out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(taxa); w.writeframes(pcm)
    print(f'{out}: {len(pcm) / 2 / taxa:.1f} s ({voz}, {modelo})')


if __name__ == '__main__':
    main()
