# Linha do tempo do episódio 2 (caminho NÃO ENTRAR). Gera dados_ep2.json (render) e tl_ep2.json (montagem).
import json, os, sys
sys.argv = [sys.argv[0]]
AQ = os.path.dirname(os.path.abspath(__file__))
import importlib.util
from tl import dur, boca  # reaproveita (tl.py roda de novo, é rápido)
FALAS = {
  'f0': ('ep2/f0', 'tu', 'Vai, mano... eu pego o próximo.'),
  'f1': ('ep2/f1', 'amigo', 'Tu é doido, mano. Fui!'),
  'f2': ('ep2/f2', 'tu', 'Atende, mano... atende...'),
  'g0': ('ep2/g0', 'grav', 'O número que você ligou está fora de área ou desligado.'),
  'f3': ('ep2/f3', 'tu', 'Parou de chover... do nada.'),
  'f4': ('ep2/f4', 'tu', 'Cadê todo mundo?'),
  'f5': ('ep2/f5', 'amigo', 'Mano... me escuta... o motorista virou pra mim... ele tem a tua cara.'),
  'f6': ('ep2/f6', 'tu', 'O quê?! Alô?! Mano?!'),
  'g1': ('ep2/g1', 'mot', 'E agora...? Vai subir?'),
}
SEQ = [('marca', 'INI', 0.0, 1.0), ('fala', 'f0', 0.2), ('fala', 'f1', 0.3), ('marca', 'FECHA', 0.2, 1.0), ('marca', 'PARTE', 0.0, 4.0),
       ('marca', 'SOZINHO', 0.2, 2.2), ('marca', 'LIGA', 0.2, 1.0), ('fala', 'f2', 0.6), ('fala', 'g0', 0.5), ('marca', 'HORA', 0.4, 2.0),
       ('marca', 'PARA', 0.0, 1.6), ('fala', 'f3', 0.3), ('marca', 'OLHA', 0.3, 2.4), ('fala', 'f4', 0.0), ('marca', 'MSG1', 0.8, 2.8),
       ('marca', 'MSG2', 0.2, 2.6), ('marca', 'LIGAAMIGO', 0.4, 1.6), ('fala', 'f5', 0.4), ('fala', 'f6', 0.3), ('marca', 'CAI', 0.2, 1.6),
       ('marca', 'FAROL', 0.4, 2.6), ('marca', 'CHEGA', 0.0, 4.2), ('marca', 'ROSTO', 0.3, 2.2), ('fala', 'g1', 0.2), ('marca', 'FIM', 1.6, 0.0)]
t, ev, bocas = 0.0, {}, {}
for it in SEQ:
    if it[0] == 'fala':
        _, i, folga = it; arq, quem, leg = FALAS[i]; d = dur(arq)
        t += folga; ev[i] = {'t': round(t, 3), 'd': round(d, 3), 'quem': quem, 'leg': leg, 'arq': arq}; bocas[i] = boca(arq); t += d
    else:
        _, nome, folga, d = it; t += folga; ev[nome] = {'t': round(t, 3), 'd': d}; t += d
json.dump({'bocas': bocas, 'tl': {k: v['t'] for k, v in ev.items()}, 'dur': round(t, 3), 'ev': ev}, open(os.path.join(AQ, 'dados_ep2.json'), 'w'), ensure_ascii=False)
json.dump({'dur': round(t, 3), 'ev': ev}, open(os.path.join(AQ, 'tl_ep2.json'), 'w'), ensure_ascii=False, indent=1)
print('ep2', round(t, 1), 's')
