#!/usr/bin/env python3
"""Marca d'água com o link dos jogos no rodapé + zoom no link no final do vídeo.

Passo final, depois do vídeo pronto (vale pra qualquer pipeline: whiteboard,
three.js, PIL...). Não mexe na skill whiteboard-video.

    python3 ferramentas/marca_jogos/marca_jogos.py entrada.mp4 saida.mp4
    python3 ferramentas/marca_jogos/marca_jogos.py entrada.mp4 saida.mp4 --texto "Quer jogar mais desafios?"

Regras (Rafael, thread 71, 15/11/2026):
- faixa fixa o vídeo inteiro (nunca some), numa linha só, no rodapé abaixo do @
  (y ~1838-1902 num 1080x1920), faixa que os vídeos de desafio não usam;
- o link pisca (azul <-> vermelho) pra chamar atenção;
- no final, o vídeo congela, escurece um pouco e a faixa cresce até o meio da tela
  como um cartão grande com o link (zoom final), ~2,6 s a mais no vídeo.
"""
import argparse, json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE = os.path.join(AQUI, '..', '..', '.claude', 'skills', 'whiteboard-video', 'assets', 'Caveat-Bold.ttf')
LINK_PADRAO = 'O link tá na nossa bio!'
TEXTO_PADRAO = 'Quer jogar esse jogo?'

TINTA = (40, 36, 30, 255)
AMARELO = (255, 210, 63, 245)
AZUL = (28, 78, 190, 255)
VERMELHO = (214, 40, 40, 255)

# Faixa do rodapé no quadro 1080x1920.
CX, CY, LARG_MAX, ALT = 520, 1870, 860, 64
PISCA = 1.2          # período do pisca do link (s)
ZOOM, SEGURA = 0.6, 2.0   # duração do zoom final e de quanto tempo o cartão fica parado (s)


def pilula(w, h, pad, borda):
    im = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r = h // 2
    d.rounded_rectangle((pad + 3, pad + 5, pad + w + 3, pad + h + 5), r, fill=(0, 0, 0, 50))
    d.rounded_rectangle((pad, pad, pad + w, pad + h), r, fill=AMARELO, outline=TINTA, width=borda)
    return im, d


def faixa(texto, link, cor_link, esc):
    """Uma linha: 'Quer jogar esse jogo?  cadernoamarelo.netlify.app'."""
    tam = 40
    while True:
        f1 = ImageFont.truetype(FONTE, round((tam - 4) * esc))
        f2 = ImageFont.truetype(FONTE, round(tam * esc))
        gap = round(14 * esc)
        w1 = f1.getlength(texto); w2 = f2.getlength(link)
        larg = w1 + gap + w2 + round(56 * esc)
        if larg <= LARG_MAX * esc or tam <= 26:
            break
        tam -= 1
    h = round(ALT * esc); pad = round(8 * esc)
    im, d = pilula(round(larg), h, pad, max(2, round(3 * esc)))
    x = pad + (larg - (w1 + gap + w2)) / 2
    y = pad + h / 2
    d.text((x, y), texto, font=f1, fill=TINTA, anchor='lm')
    d.text((x + w1 + gap, y), link, font=f2, fill=cor_link, anchor='lm')
    return im


def cartao(texto, link, cor_link, esc):
    """Cartão grande do final: duas linhas, ocupa a largura da tela."""
    w, h = round(940 * esc), round(250 * esc); pad = round(12 * esc)
    im, d = pilula(w, h, pad, max(3, round(6 * esc)))
    f1 = ImageFont.truetype(FONTE, round(74 * esc))
    tam = 104
    while ImageFont.truetype(FONTE, round(tam * esc)).getlength(link) > w * 0.88:
        tam -= 2
    f2 = ImageFont.truetype(FONTE, round(tam * esc))
    d.text((pad + w / 2, pad + h * 0.30), texto, font=f1, fill=TINTA, anchor='mm')
    d.text((pad + w / 2, pad + h * 0.68), link, font=f2, fill=cor_link, anchor='mm')
    return im


def info(video):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                          'stream=width,height,r_frame_rate', '-of', 'json', video],
                         capture_output=True, text=True, check=True).stdout
    s = json.loads(out)['streams'][0]
    n, dd = s['r_frame_rate'].split('/')
    return s['width'], s['height'], float(n) / float(dd)


def colar(q, im, cx, cy, op=1.0):
    """Cola a imagem RGBA centrada em (cx, cy) no quadro q (uint8 HxWx3)."""
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    x0, y0 = round(cx - w / 2), round(cy - h / 2)
    H, W = q.shape[:2]
    sx0, sy0 = max(0, -x0), max(0, -y0)
    x0c, y0c = max(0, x0), max(0, y0)
    x1c, y1c = min(W, x0 + w), min(H, y0 + h)
    if x1c <= x0c or y1c <= y0c:
        return
    a = a[sy0:sy0 + (y1c - y0c), sx0:sx0 + (x1c - x0c)]
    al = a[..., 3:] / 255.0 * op
    reg = q[y0c:y1c, x0c:x1c].astype(np.float32)
    q[y0c:y1c, x0c:x1c] = (reg * (1 - al) + a[..., :3] * al).astype(np.uint8)


def suave(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('entrada'); ap.add_argument('saida')
    ap.add_argument('--texto', default=TEXTO_PADRAO)
    ap.add_argument('--link', default=LINK_PADRAO)
    ap.add_argument('--sem-zoom', action='store_true', help='não acrescenta o zoom final')
    ap.add_argument('--crf', default='28')
    a = ap.parse_args()

    W, H, fps = info(a.entrada)
    esc = W / 1080
    cx, cy = CX * esc, CY * H / 1920
    faixas = [faixa(a.texto, a.link, c, esc) for c in (AZUL, VERMELHO)]
    cartoes = [cartao(a.texto, a.link, c, esc) for c in (AZUL, VERMELHO)]

    def fase(t):  # 0 = azul, 1 = vermelho
        return 0 if (t % PISCA) < PISCA / 2 else 1

    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', a.entrada, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                           stdout=subprocess.PIPE)
    extra = 0 if a.sem_zoom else round((ZOOM + SEGURA) * fps)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                            '-s', f'{W}x{H}', '-r', str(fps), '-i', '-', '-i', a.entrada,
                            '-map', '0:v', '-map', '1:a?', '-af', 'apad', '-shortest',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', a.crf, '-pix_fmt', 'yuv420p',
                            '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '128k', a.saida],
                           stdin=subprocess.PIPE)
    tam = W * H * 3; i = 0; ultimo = None
    while True:
        buf = dec.stdout.read(tam)
        if len(buf) < tam:
            break
        q = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
        ultimo = q.copy()
        colar(q, faixas[fase(i / fps)], cx, cy)
        enc.stdin.write(q.tobytes()); i += 1

    # Zoom final: congela o último quadro, escurece e a faixa vira o cartão grande no meio.
    if extra and ultimo is not None:
        base = ultimo.astype(np.float32)
        nz = max(1, round(ZOOM * fps))
        fw = faixas[0].size[0]
        cw = cartoes[0].size[0]
        for k in range(extra):
            t = (i + k) / fps
            p = suave(k / nz)
            q = (base * (1 - 0.45 * p)).astype(np.uint8)
            c = cartoes[fase(t)]
            s = (fw + (cw - fw) * p) / cw          # começa do tamanho da faixa e cresce até o cartão
            if k > nz:                             # pulsinho leve enquanto segura
                s *= 1 + 0.025 * np.sin(2 * np.pi * (k - nz) / fps / PISCA)
            im = c.resize((max(1, round(c.size[0] * s)), max(1, round(c.size[1] * s))), Image.LANCZOS)
            px, py = cx + (W / 2 - cx) * p, cy + (H * 0.5 - cy) * p
            colar(q, im, px, py)
            enc.stdin.write(q.tobytes())
    enc.stdin.close(); enc.wait(); dec.wait()
    print(a.saida)


if __name__ == '__main__':
    main()
