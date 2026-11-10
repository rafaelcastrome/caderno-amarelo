# Linha do tempo da parte 4 (final). Gera dados_ep4.json e tl_ep4.json.
import json, os, sys
sys.argv = [sys.argv[0]]
AQ = os.path.dirname(os.path.abspath(__file__))
from tl import dur, boca
FALAS = {
  'a0': ('ep4/a0', 'tu', 'Mano... aquele lá fora... sou eu.'),
  'a1': ('ep4/a1', 'amigo', 'E aquele do teu lado... sou eu.'),
  'b0': ('ep4/b0', 'mot', 'Esse ônibus caiu no córrego... numa manhã de chuva. Às sete em ponto.'),
  'b1': ('ep4/b1', 'mot', 'Desde então, ele roda nessa mesma manhã. E alguém tem que dirigir.'),
  'b2': ('ep4/b2', 'mot', 'Só sai quem deixar outro no lugar.'),
  'a2': ('ep4/a2', 'amigo', 'Mano... vai tu. Eu fico.'),
  'a3': ('ep4/a3', 'tu', 'Não! Ou a gente sai junto, ou ninguém sai!'),
  'a4': ('ep4/a4', 'tu', 'Então eu fico. Desce, mano. Corre!'),
  'a5': ('ep4/a5', 'amigo', 'Mano!'),
  'b3': ('ep4/b3', 'mot', 'Agora... é a tua vez.'),
  'a6': ('ep4/a6', 'tu', 'Não entra no ônibus das 7.'),
}
SEQ = [('marca', 'INI', 0.0, 1.6), ('fala', 'a0', 0.0), ('fala', 'a1', 0.5), ('marca', 'VIRA', 0.4, 1.4), ('fala', 'b0', 0.2), ('marca', 'NOTI', 0.4, 3.6),
       ('fala', 'b1', 0.2), ('fala', 'b2', 0.6), ('marca', 'OLHAM', 0.3, 1.0), ('fala', 'a2', 0.0), ('fala', 'a3', 0.5), ('marca', 'PAUSA', 0.4, 1.4),
       ('fala', 'a4', 0.0), ('marca', 'CORRE', 0.1, 3.0), ('fala', 'a5', 0.0), ('marca', 'FECHA', 0.3, 1.2), ('marca', 'APAGA', 0.2, 1.6),
       ('fala', 'b3', 0.1), ('marca', 'CEL', 0.5, 2.6), ('fala', 'a6', 0.0), ('marca', 'FIM', 0.8, 0.0)]
t, ev, bocas = 0.0, {}, {}
for it in SEQ:
    if it[0] == 'fala':
        _, i, folga = it; arq, quem, leg = FALAS[i]; d = dur(arq)
        t += folga; ev[i] = {'t': round(t, 3), 'd': round(d, 3), 'quem': quem, 'leg': leg, 'arq': arq}; bocas[i] = boca(arq); t += d
    else:
        _, nome, folga, d = it; t += folga; ev[nome] = {'t': round(t, 3), 'd': d}; t += d
json.dump({'bocas': bocas, 'tl': {k: v['t'] for k, v in ev.items()}, 'dur': round(t, 3), 'ev': ev}, open(os.path.join(AQ, 'dados_ep4.json'), 'w'), ensure_ascii=False)
json.dump({'dur': round(t, 3), 'ev': ev}, open(os.path.join(AQ, 'tl_ep4.json'), 'w'), ensure_ascii=False, indent=1)
print('ep4', round(t, 1), 's', {k: v['t'] for k, v in ev.items()})
