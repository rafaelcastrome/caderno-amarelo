# Marca d'água dos jogos

Faixa amarela no rodapé com "Quer jogar esse jogo?" + link do app de jogos.
Vai em TODO vídeo de desafio/jogo, como último passo depois do vídeo pronto
(qualquer pipeline). Não altera a skill whiteboard-video.

```
python3 ferramentas/marca_jogos/marca_jogos.py video.mp4 video_com_marca.mp4
# desafio que não existe no app:
python3 ferramentas/marca_jogos/marca_jogos.py video.mp4 saida.mp4 --texto "Quer jogar mais desafios?"
```

- Posição: y ~1635-1735 (1080x1920), acima do @, centralizada na horizontal.
- Some sozinha (fade) quando o vídeo desenha algo na faixa; `--sempre` desliga isso.
- `--link` troca o endereço (ex.: se um dia tiver domínio próprio). `--inicio 2` faz aparecer só depois do gancho.
