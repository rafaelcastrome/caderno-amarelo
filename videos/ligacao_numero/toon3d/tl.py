# Linha do tempo da parte 1 em 3D: calcula quando cada fala/evento começa em cada cena a partir da duração dos áudios.
# Gera dados_<cena>.json (bocas + tempos) pro render e tl.json pro montar.py.
import json, os, subprocess, numpy as np
AQ = os.path.dirname(os.path.abspath(__file__))
F1 = os.path.join(AQ, '..', 'falas', 'p1'); F3 = os.path.join(AQ, '..', 'falas', 'p3d')

# fala: (id, arquivo, quem, legenda). Arquivos p3d/dN_k.wav saem do corte dos takes novos.
FALAS = {
  'a0': ('p1/a0', 'mae', 'Filho! Tu vai perder o ônibus das 7!'),
  'a1': ('p1/a1', 'tu', 'Tô indo, mãe! Cadê esse tênis...'),
  'a2': ('p1/a2', 'tu', 'Ué... esse número... é o meu.'),
  'a3': ('p1/a3', 'tu', 'Alô?'),
  'a4': ('p1/a4', 'tel', 'Não entra no ônibus das 7.'),
  'a5': ('p1/a5', 'tu', 'Quem tá falando?'),
  'a6': ('p1/a6', 'tel', 'Sou eu. Daqui a 20 minutos.'),
  't1': ('p3d/d1_0', 'tel', 'Escuta... quando começar a chover, ele chega. Não entra nele.'),
  'alo': ('p3d/d1_1', 'tu', 'Alô? Alô?!'),
  'm1': ('p3d/d1_2', 'mae', 'Filho? Quem era no telefone?'),
  'f1': ('p3d/d1_3', 'tu', 'Ninguém, mãe... foi engano.'),
  'm2': ('p3d/d1_4', 'mae', 'Leva o guarda-chuva. Vai chover às 7 em ponto, deu no jornal.'),
  'b0': ('p1/b0', 'amigo', 'E aí, mano? Que cara é essa? Parece que viu um fantasma.'),
  'b1': ('p1/b1', 'tu', 'Cara... eu recebi uma ligação muito estranha.'),
  'e1': ('p3d/d2_0', 'tu', 'Era a minha voz, mano. Falando pra eu não entrar no ônibus.'),
  'e2': ('p3d/d2_1', 'amigo', 'Tu tá vendo muito filme de terror, hein?'),
  'e3': ('p3d/d2_2', 'amigo', 'Que foi? Tá olhando o quê?'),
  'e4': ('p3d/d2_3', 'tu', 'Nada... achei que tinha visto... deixa pra lá.'),
  'e5': ('p3d/d2_4', 'tu', 'Começou a chover...'),
  'b4': ('p1/b4', 'amigo', 'Olha lá, mano! O das 7!'),
  'c0': ('p1/c0', 'motorista', 'Vai subir ou não vai, garoto?'),
  'c1': ('p1/c1', 'amigo', 'Bora, mano! Tá esperando o quê?'),
}
# sequência por cena: ('fala', id, folga_antes) ou ('marca', nome, folga_antes, duracao)
CENAS = {
  'quarto': [('fala', 'a0', 0.5), ('fala', 'a1', 0.4), ('marca', 'TOQ', 0.3, 0.0), ('marca', 'SOBE', 0.4, 1.0),
             ('fala', 'a2', 0.5), ('marca', 'VERDE', 0.6, 0.0), ('fala', 'a3', 0.5), ('fala', 'a4', 0.4), ('fala', 'a5', 0.8),
             ('fala', 'a6', 0.7), ('fala', 't1', 0.6), ('marca', 'DESLIGA', 0.2, 0.0), ('fala', 'alo', 0.7),
             ('marca', 'OLHAMAE', 0.5, 0.9), ('fala', 'm1', 0.1), ('fala', 'f1', 0.6), ('fala', 'm2', 0.6), ('marca', 'JANELA', 0.3, 1.6), ('marca', 'FIM', 0.6, 0.0)],
  'rua': [('marca', 'ANDA', 0.0, 3.2), ('fala', 'b0', 0.2), ('fala', 'b1', 0.5), ('fala', 'e1', 0.3), ('fala', 'e2', 0.4),
          ('marca', 'VIBRA', 0.7, 0.0), ('marca', 'LE', 0.2, 2.6), ('marca', 'VIRA', 0.0, 1.2), ('marca', 'ENCARA', 0.0, 2.4),
          ('marca', 'CAMINHAO', 0.0, 1.3), ('fala', 'e3', 0.5), ('fala', 'e4', 0.4), ('marca', 'HORA', 0.5, 1.8),
          ('marca', 'TROVAO', 0.2, 0.0), ('fala', 'e5', 1.0), ('fala', 'b4', 0.8), ('marca', 'ONIBUS', 0.2, 3.8),
          ('fala', 'c0', 0.3), ('fala', 'c1', 0.6), ('marca', 'TOCA', 0.3, 0.0), ('marca', 'FIM', 3.6, 0.0)],
}

def caminho(arq):
    return os.path.join(AQ, '..', 'falas', arq + '.wav')

def dur(arq):
    p = caminho(arq)
    if not os.path.exists(p): return None
    return float(subprocess.run(['ffprobe', '-v', '0', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)

def boca(arq):
    p = caminho(arq)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', '16000', '-af', 'bandpass=f=1000:w=1800', '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32); n = 16000 // 30
    e = np.array([np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, max(1, len(x) - n), n)])
    e = np.clip(e / (np.percentile(e, 95) + 1e-9), 0, 1) ** 0.7; e[e < 0.12] = 0
    return {'fps': 30, 'v': [round(float(v), 3) for v in e]}

tl = {}
for cena, seq in CENAS.items():
    t, ev, bocas = 0.0, {}, {}
    for it in seq:
        if it[0] == 'fala':
            _, i, folga = it; arq, quem, leg = FALAS[i]
            d = dur(arq); est = d is None
            if est: d = 0.4 + 0.068 * len(leg)
            t += folga; ev[i] = {'t': round(t, 3), 'd': round(d, 3), 'quem': quem, 'leg': leg, 'arq': arq, 'estimado': est}
            if not est: bocas[i] = boca(arq)
            t += d
        else:
            _, nome, folga, d = it; t += folga; ev[nome] = {'t': round(t, 3), 'd': d}; t += d
    tl[cena] = {'dur': round(t, 3), 'ev': ev}
    json.dump({'bocas': bocas, 'tl': {k: v['t'] for k, v in ev.items()}, 'dur': round(t, 3), 'ev': ev}, open(os.path.join(AQ, f'dados_{cena}.json'), 'w'), ensure_ascii=False)
json.dump(tl, open(os.path.join(AQ, 'tl.json'), 'w'), ensure_ascii=False, indent=1)
for c in tl: print(c, tl[c]['dur'], 's', sum(1 for e in tl[c]['ev'].values() if e.get('estimado')), 'falas estimadas')
