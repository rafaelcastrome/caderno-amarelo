# Linha do tempo do episódio 3 (caminho SUBIR PRA SALVAR O AMIGO). Gera dados_ep3.json e tl_ep3.json.
import json, os, sys
sys.argv = [sys.argv[0]]
AQ = os.path.dirname(os.path.abspath(__file__))
from tl import dur, boca
FALAS = {
  'b0': ('ep3/b0', 'mot', 'Sobe... ele tá lá atrás.'),
  'a0': ('ep3/a0', 'tu', 'Cadê meu amigo?!'),
  'a1': ('ep3/a1', 'tu', 'Mano?! Tu tá aqui?'),
  'a2': ('ep3/a2', 'tu', 'Esse é o boné dele...'),
  'b1': ('ep3/b1', 'mot', 'Ninguém desce antes do ponto final.'),
  'a3': ('ep3/a3', 'tu', 'Peraí... essa mulher de novo?'),
  'a4': ('ep3/a4', 'tu', 'A gente tá passando na mesma rua...'),
  'a5': ('ep3/a5', 'tu', 'O celular... a hora tá voltando...'),
  'a6': ('ep3/a6', 'amigo', 'Mano... aqui atrás...'),
  'a7': ('ep3/a7', 'tu', 'Mano! Levanta, bora descer!'),
  'a8': ('ep3/a8', 'amigo', 'Não dá, mano... ele disse que só um de nós desce.'),
  'b2': ('ep3/b2', 'amigo', 'Ele tá olhando pra gente...'),
  'b3': ('ep3/b3', 'mot', 'Escolhe.'),
}
SEQ = [('marca', 'INI', 0.0, 0.6), ('fala', 'b0', 0.0), ('marca', 'SOBE', 0.2, 1.4), ('fala', 'a0', 0.2), ('marca', 'PROCURA', 0.2, 1.8), ('fala', 'a1', 0.0),
       ('marca', 'BONE', 0.6, 1.0), ('fala', 'a2', 0.0), ('marca', 'ANDA', 0.6, 1.6), ('fala', 'b1', 0.2), ('marca', 'MSG', 0.6, 3.2),
       ('marca', 'JANELA1', 0.4, 3.0), ('marca', 'JANELA2', 1.4, 0.8), ('fala', 'a3', 0.0), ('marca', 'JANELA3', 1.4, 0.8), ('fala', 'a4', 0.0),
       ('marca', 'HORA', 0.6, 0.8), ('fala', 'a5', 0.0), ('marca', 'SUSSURRO', 1.6, 0.0), ('fala', 'a6', 0.0), ('marca', 'ATRAS', 0.2, 1.6),
       ('fala', 'a7', 0.0), ('marca', 'LEVANTA', 0.4, 1.0), ('fala', 'a8', 0.0), ('fala', 'b2', 0.6), ('marca', 'VIRA', 0.3, 1.8), ('fala', 'b3', 0.3),
       ('marca', 'PARA', 0.8, 3.0), ('marca', 'VE', 0.0, 3.8), ('marca', 'FIM', 0.2, 0.0)]
t, ev, bocas = 0.0, {}, {}
for it in SEQ:
    if it[0] == 'fala':
        _, i, folga = it; arq, quem, leg = FALAS[i]; d = dur(arq)
        t += folga; ev[i] = {'t': round(t, 3), 'd': round(d, 3), 'quem': quem, 'leg': leg, 'arq': arq}; bocas[i] = boca(arq); t += d
    else:
        _, nome, folga, d = it; t += folga; ev[nome] = {'t': round(t, 3), 'd': d}; t += d
json.dump({'bocas': bocas, 'tl': {k: v['t'] for k, v in ev.items()}, 'dur': round(t, 3), 'ev': ev}, open(os.path.join(AQ, 'dados_ep3.json'), 'w'), ensure_ascii=False)
json.dump({'dur': round(t, 3), 'ev': ev}, open(os.path.join(AQ, 'tl_ep3.json'), 'w'), ensure_ascii=False, indent=1)
print('ep3', round(t, 1), 's', {k: v['t'] for k, v in ev.items()})
