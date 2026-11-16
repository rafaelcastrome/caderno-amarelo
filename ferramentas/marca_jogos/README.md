# Marca d'água dos jogos

Faixa amarela fixa no rodapé com "Quer jogar esse jogo?" + link do app de jogos
(o link pisca azul/vermelho; padrão caRdenoamarelo.netlify.app). No final, o vídeo congela, escurece e a faixa
cresce até o meio da tela como um cartão grande (zoom final, +2,6 s).
Vai em TODO vídeo de desafio/jogo, como último passo depois do vídeo pronto
(qualquer pipeline). Não altera a skill whiteboard-video.

```
python3 ferramentas/marca_jogos/marca_jogos.py video.mp4 video_com_marca.mp4
# desafio que não existe no app:
python3 ferramentas/marca_jogos/marca_jogos.py video.mp4 saida.mp4 --texto "Quer jogar mais desafios?"
```

- Posição: y ~1838-1902 (1080x1920), abaixo do @, faixa que os vídeos de desafio não usam.
  Ao criar vídeo novo, deixe essa faixa livre.
- `--link` troca o endereço; `--sem-zoom` tira o zoom final.
