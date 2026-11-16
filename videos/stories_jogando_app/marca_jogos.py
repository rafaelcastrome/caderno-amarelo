#!/usr/bin/env python3
"""Marca d'água "Quer jogar esse jogo?" + link do app de jogos no rodapé do vídeo.

Passo final, depois do vídeo pronto (vale pra qualquer pipeline: whiteboard,
three.js, PIL...). Não mexe na skill whiteboard-video.

    python3 ferramentas/marca_jogos/marca_jogos.py entrada.mp4 saida.mp4
    python3 ferramentas/marca_jogos/marca_jogos.py entrada.mp4 saida.mp4 --texto "Quer jogar mais desafios?"

Regras do desenho (pedido do Rafael, thread 71, 15/11/2026):
- faixa fixa no rodapé do CONTEÚDO (y ~1635-1735 num 1080x1920), acima do @ da marca;
- centralizada na horizontal (x 160-920);
- some sozinha (fade de 0,2 s) quando o próprio vídeo desenha algo nessa faixa,
  pra nunca cobrir conteúdo; volta quando a faixa fica livre.
"""
import argparse, json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE = '/tmp/v72/Caveat-Bold.ttf'
LINK_PADRAO = 'caderno-amarelo-loja.pages.dev'
TEXTO_PADRAO = 'Quer jogar esse jogo?'

# Caixa da faixa no quadro 1080x1920 (escala junto se o vídeo tiver outro tamanho).
CX, CY, LARG, ALT = 540, 1685, 760, 100


def desenhar_faixa(texto, link, escala):
    w, h = round(LARG * escala), round(ALT * escala)
    pad = round(8 * escala)
    im = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r = h // 2
    # sombra leve + pílula amarela da marca com contorno de caneta
    d.rounded_rectangle((pad + 3, pad + 5, pad + w + 3, pad + h + 5), r, fill=(0, 0, 0, 45))
    d.rounded_rectangle((pad, pad, pad + w, pad + h), r, fill=(255, 210, 63, 240),
                        outline=(40, 36, 30, 255), width=max(2, round(3 * escala)))
    f1 = ImageFont.truetype(FONTE, round(38 * escala))
    f2 = ImageFont.truetype(FONTE, round(46 * escala))
    tinta = (40, 36, 30, 255)
    azul = (28, 78, 190, 255)
    meio = pad + w / 2
    d.text((meio, pad + h * 0.30), texto, font=f1, fill=tinta, anchor='mm')
    d.text((meio, pad + h * 0.70), link, font=f2, fill=azul, anchor='mm')
    return im, pad


def info(video):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                          'stream=width,height,r_frame_rate', '-of', 'json', video],
                         capture_output=True, text=True, check=True).stdout
    s = json.loads(out)['streams'][0]
    n, dd = s['r_frame_rate'].split('/')
    return s['width'], s['height'], float(n) / float(dd)


def ocupacao(video, caixa):
    """Fração de tinta (escuro ou cor forte) dentro da faixa, por quadro."""
    x0, y0, x1, y1 = caixa
    sw, sh = (x1 - x0) // 4, (y1 - y0) // 4
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf',
                          f'crop={x1-x0}:{y1-y0}:{x0}:{y0},scale={sw}:{sh}',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, sh, sw, 3).astype(np.int16)
    mx, mn = a.max(-1), a.min(-1)
    tinta = (mx < 150) | ((mx - mn) > 80)   # linhas do caderno são claras e pouco saturadas
    return tinta.mean(axis=(1, 2))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('entrada'); ap.add_argument('saida')
    ap.add_argument('--texto', default=TEXTO_PADRAO)
    ap.add_argument('--link', default=LINK_PADRAO)
    ap.add_argument('--inicio', type=float, default=0.0, help='segundo em que a faixa aparece')
    ap.add_argument('--limiar', type=float, default=0.012, help='tinta na faixa que faz ela sumir')
    ap.add_argument('--sempre', action='store_true', help='não some quando há conteúdo na faixa')
    ap.add_argument('--crf', default='28')
    a = ap.parse_args()

    W, H, fps = info(a.entrada)
    esc = W / 1080
    faixa, pad = desenhar_faixa(a.texto, a.link, esc)
    fw, fh = faixa.size
    fx = round(CX * esc - fw / 2); fy = round(CY * H / 1920 - fh / 2)
    fx = max(0, min(W - fw, fx)); fy = max(0, min(H - fh, fy))
    rgba = np.asarray(faixa).astype(np.float32)
    cor, alfa = rgba[..., :3], rgba[..., 3:] / 255.0

    # Visibilidade por quadro: some quando o vídeo usa a faixa (olha 0,25 s pra frente e pra trás).
    occ = ocupacao(a.entrada, (fx, fy, fx + fw, fy + fh)) if not a.sempre else None
    n = len(occ) if occ is not None else None
    alvo = None
    if occ is not None:
        livre = occ < a.limiar
        k = max(1, round(0.25 * fps))
        ocupado = np.convolve(~livre, np.ones(2 * k + 1), 'same') > 0
        alvo = (~ocupado).astype(np.float32)
        ini = int(a.inicio * fps)
        alvo[:ini] = 0
        passo = 1.0 / max(1, round(0.2 * fps))
        vis = np.zeros_like(alvo); v = 0.0
        for i, t in enumerate(alvo):
            v = min(t, v + passo) if t > v else max(t, v - passo)
            vis[i] = v
        print(f'faixa visível em {100 * (vis > 0.5).mean():.0f}% do vídeo', file=sys.stderr)

    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', a.entrada, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                           stdout=subprocess.PIPE)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                            '-s', f'{W}x{H}', '-r', str(fps), '-i', '-', '-i', a.entrada,
                            '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-preset', 'slow',
                            '-crf', a.crf, '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                            '-c:a', 'copy', a.saida], stdin=subprocess.PIPE)
    tam = W * H * 3; i = 0
    while True:
        buf = dec.stdout.read(tam)
        if len(buf) < tam:
            break
        q = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
        v = 1.0 if alvo is None else (vis[i] if i < len(vis) else vis[-1])
        if alvo is None and i < a.inicio * fps:
            v = 0.0
        if v > 0:
            reg = q[fy:fy + fh, fx:fx + fw].astype(np.float32)
            al = alfa * v
            q[fy:fy + fh, fx:fx + fw] = (reg * (1 - al) + cor * al).astype(np.uint8)
        enc.stdin.write(q.tobytes()); i += 1
    enc.stdin.close(); enc.wait(); dec.wait()
    print(a.saida)


if __name__ == '__main__':
    main()
