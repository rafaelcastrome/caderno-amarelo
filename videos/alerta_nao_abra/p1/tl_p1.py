# Linha do tempo da parte 1 a partir da duração das falas. Gera dados_p1.json (render) e tl_p1.json (montagem).
import json, os, subprocess, numpy as np
AQ = os.path.dirname(os.path.abspath(__file__)); F = os.path.join(AQ, '..', 'falas', 'p1v2')
FALAS = {
 'l0': ('leo', 'Que isso?!'), 't0': ('tu', 'Chegou pra todo mundo.'),
 'l1': ('leo', 'Deve ser teste. A Defesa Civil fez um mês passado.'),
 't1': ('tu', 'Teste não fala "quem chamar seu nome", Léo.'),
 'l2': ('leo', 'Tá... bora embora antes que fique estranho. Pega as coisas, que eu vou buscar o carregador no carro.'),
 't2': ('tu', 'Agora?'), 'l3': ('leo', 'Dois minutos. Me espera na escada rolante.'),
 'e0': ('edson', 'Aí não, garoto! Sai do vidro!'), 't3': ('tu', 'Meu amigo tá no estacionamento!'),
 'e1': ('edson', 'E vai ficar lá. Ordem da central. Ninguém sai, ninguém entra.'), 't4': ('tu', 'Mas é só um alerta...'),
 'e2': ('edson', 'Eu trabalho aqui faz quinze anos. A central nunca mandou trancar tudo.'),
 'e3': ('edson', 'Lá embaixo tem o depósito. Porta de aço. Vem.'), 't5': ('tu', 'E o Léo?'),
 'l4': ('leo', 'Tô aqui. Tô aqui.'), 't6': ('tu', 'Já? E o carregador?'), 'l5': ('leo', 'Deixa. Vamo.'),
 'e4': ('edson', 'CORRE!'),
 'm0': ('marcos', 'Alguém tem sinal? Eu não tenho sinal!'), 'n0': ('neide', 'Aqui embaixo ninguém tem, moço. Nunca teve.'),
 'm1': ('marcos', 'Então como chegou o alerta?'),
 'e5': ('edson', 'Um, dois, três, quatro... e eu. Cinco. Ninguém abre essa porta até a central liberar. Combinado?'),
 'm2': ('marcos', 'Combinado nada. Eu tenho filho em casa.'), 'e6': ('edson', 'Todo mundo tem alguém em casa.'),
 't7': ('tu', 'Tá bem?'), 'l6': ('leo', 'Tô.'), 't8': ('tu', 'Tá esquisito, cara.'), 'l7': ('leo', 'Tô com frio. Só isso.'),
 't9': ('tu', 'A senhora já viu isso antes, né?'),
 'n1': ('neide', 'Antes de ser shopping, isso aqui era o hospital. Eu era da limpeza lá também.'), 't10': ('tu', 'E?'),
 'n2': ('neide', 'Teve uma noite igual. Mandaram trancar a ala de baixo... De manhã, abriram. Faltava gente.'),
 'm3': ('marcos', 'Faltava como?'), 'n3': ('neide', 'Faltava. E sobrava.'),
 'mae0': ('mae', 'Filho? Filho, sou eu... abre, pelo amor de Deus. Eu tô machucada.'),
 't11': ('tu', 'Ela tá em casa... ela nem sabe que eu tô aqui.'), 'mae1': ('mae', 'Sei sim, filho. Abre.'),
 'l8': ('leo', 'Abre. É tua mãe.'),
}
SEQ = [('m', 'INI', 0, 0.3), ('m', 'ALERTA', 0, 3.0),
 ('f', 'l0', 0.1), ('f', 't0', 0.3), ('f', 'l1', 0.3), ('f', 't1', 0.3), ('f', 'l2', 0.3), ('f', 't2', 0.2), ('f', 'l3', 0.2),
 ('m', 'LEOSAI', 0.1, 2.4), ('m', 'GRADES', 0, 2.6), ('m', 'ANDA', 0, 6.5), ('m', 'VIDRO', 0, 1.4),
 ('f', 'e0', 0), ('f', 't3', 0.3), ('f', 'e1', 0.2), ('f', 't4', 0.3), ('f', 'e2', 0.3), ('f', 'e3', 0.3), ('f', 't5', 0.3),
 ('m', 'LEOVOLTA', 0.1, 2.2), ('f', 'l4', 0), ('f', 't6', 0.2), ('f', 'l5', 0.2),
 ('m', 'BAM', 0.2, 1.4), ('f', 'e4', 0), ('m', 'CORRE', 0.1, 4.6), ('m', 'ESCADA', 0, 3.4), ('m', 'CORREDOR', 0, 2.4),
 ('f', 'm0', 0), ('f', 'n0', 0.3), ('f', 'm1', 0.3), ('m', 'FECHA', 0.3, 1.8),
 ('f', 'e5', 0.2), ('f', 'm2', 0.3), ('f', 'e6', 0.3), ('m', 'SENTA', 0.3, 1.5),
 ('f', 't7', 0.2), ('f', 'l6', 0.4), ('f', 't8', 0.4), ('f', 'l7', 0.3),
 ('f', 't9', 0.8), ('f', 'n1', 0.3), ('f', 't10', 0.4), ('f', 'n2', 0.4), ('f', 'm3', 0.3), ('f', 'n3', 0.5),
 ('m', 'SILENCIO', 0.3, 2.0), ('m', 'TOC', 0, 2.2), ('f', 'mae0', 0.2), ('m', 'LEVANTA', 0.3, 1.2),
 ('f', 't11', 0), ('f', 'mae1', 0.5), ('m', 'VISOR', 0.3, 1.8), ('f', 'l8', 0.2), ('m', 'FIM', 0.2, 1.8)]
def wav(i): return os.path.join(F, i + '.wav')
def dur(i):
    p = wav(i)
    if not os.path.exists(p): return None
    return float(subprocess.run(['ffprobe', '-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
def boca(i):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', wav(i), '-ac', '1', '-ar', '16000', '-af', 'bandpass=f=1000:w=1800', '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32); n = 16000 // 30
    e = np.array([np.sqrt(np.mean(x[k:k + n] ** 2)) for k in range(0, max(1, len(x) - n), n)])
    e = np.clip(e / (np.percentile(e, 95) + 1e-9), 0, 1) ** 0.7; e[e < 0.12] = 0
    return {'fps': 30, 'v': [round(float(v), 3) for v in e]}
t, ev, bocas, est = 0.0, {}, {}, []
for it in SEQ:
    if it[0] == 'f':
        _, i, folga = it; quem, leg = FALAS[i]; d = dur(i)
        if d is None: d = 0.5 + 0.065 * len(leg); est.append(i)
        else: bocas[i] = boca(i)
        t += folga; ev[i] = {'t': round(t, 3), 'd': round(d, 3), 'quem': quem, 'leg': leg, 'arq': i}; t += d
    else:
        _, nome, folga, d = it; t += folga; ev[nome] = {'t': round(t, 3), 'd': d}; t += d
json.dump({'bocas': bocas, 'tl': {k: v['t'] for k, v in ev.items()}, 'dur': round(t, 3), 'ev': ev}, open(os.path.join(AQ, 'dados_p1.json'), 'w'), ensure_ascii=False)
json.dump({'dur': round(t, 3), 'ev': ev}, open(os.path.join(AQ, 'tl_p1.json'), 'w'), ensure_ascii=False, indent=1)
print('p1', round(t, 1), 's; estimadas:', est)
