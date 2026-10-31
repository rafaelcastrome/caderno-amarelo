"""Geradores de quebra-cabeças: labirintos (com solução) e sudokus (com solução única)."""
import random

def labirinto(cols, lins, semente):
    """Labirinto perfeito por busca em profundidade. Devolve (paredes, caminho) em coordenadas de célula."""
    rnd = random.Random(semente)
    # paredes[(c,l)] = conjunto de lados abertos: 'N','S','L','O'
    aberto = {(c, l): set() for c in range(cols) for l in range(lins)}
    viz = {'N': (0, -1), 'S': (0, 1), 'L': (1, 0), 'O': (-1, 0)}
    oposto = {'N': 'S', 'S': 'N', 'L': 'O', 'O': 'L'}
    pilha, visto = [(0, 0)], {(0, 0)}
    while pilha:
        c, l = pilha[-1]
        opcoes = [(d, (c + dx, l + dy)) for d, (dx, dy) in viz.items() if (c + dx, l + dy) in aberto and (c + dx, l + dy) not in visto]
        if not opcoes:
            pilha.pop(); continue
        d, nxt = rnd.choice(opcoes)
        aberto[(c, l)].add(d); aberto[nxt].add(oposto[d]); visto.add(nxt); pilha.append(nxt)
    # caminho da entrada (0,0) até a saída (cols-1, lins-1)
    ini, fim = (0, 0), (cols - 1, lins - 1)
    ant, fila = {ini: None}, [ini]
    while fila:
        cur = fila.pop(0)
        if cur == fim: break
        for d in aberto[cur]:
            dx, dy = viz[d]; nxt = (cur[0] + dx, cur[1] + dy)
            if nxt not in ant: ant[nxt] = cur; fila.append(nxt)
    caminho, cur = [], fim
    while cur: caminho.append(cur); cur = ant[cur]
    return aberto, caminho[::-1]

def svg_labirinto(cols, lins, aberto, caminho=None, larg_mm=170):
    t = 10
    W, H = cols * t, lins * t
    linhas = []
    for (c, l), ab in aberto.items():
        x, y = c * t, l * t
        if 'N' not in ab and not (c == 0 and l == 0): linhas.append(f'M{x} {y}h{t}')
        if 'O' not in ab: linhas.append(f'M{x} {y}v{t}')
        if l == lins - 1 and not (c == cols - 1): linhas.append(f'M{x} {y + t}h{t}')
        if c == cols - 1: linhas.append(f'M{x + t} {y}v{t}')
    # saída aberta embaixo da última célula
    sol = ''
    if caminho:
        pts = ' '.join(f'{c * t + t / 2} {l * t + t / 2}' for c, l in caminho)
        sol = f'<polyline points="{t / 2} {-t / 2} {pts} {W - t / 2} {H + t / 2}" fill="none" stroke="#d62828" stroke-width="{t * .3}" stroke-linecap="round" stroke-linejoin="round"/>'
    esp = max(1.2, t * .14)
    alt_mm = larg_mm * H / W
    return (f'<svg viewBox="-6 -12 {W + 12} {H + 24}" style="width:{larg_mm}mm;height:{alt_mm + larg_mm * 24 / W:.1f}mm;display:block;margin:0 auto">'
            f'<path d="{" ".join(linhas)}" stroke="#1d1d1d" stroke-width="{esp}" stroke-linecap="round" fill="none"/>{sol}'
            f'<text x="{t / 2}" y="-3" text-anchor="middle" style="font:{t * .8}px Caveat">entra</text>'
            f'<text x="{W - t / 2}" y="{H + 10}" text-anchor="middle" style="font:{t * .8}px Caveat">sai</text></svg>')

def _resolver(g, limite=2):
    """Conta soluções (até o limite) por backtracking. g é lista de 81 ints, 0 = vazio."""
    try:
        i = g.index(0)
    except ValueError:
        return 1
    l, c = divmod(i, 9)
    usados = set(g[l * 9:l * 9 + 9]) | set(g[c::9]) | {g[(l // 3 * 3 + a) * 9 + c // 3 * 3 + b] for a in range(3) for b in range(3)}
    total = 0
    for v in range(1, 10):
        if v not in usados:
            g[i] = v
            total += _resolver(g, limite - total)
            g[i] = 0
            if total >= limite: break
    return total

def sudoku(semente, pistas):
    rnd = random.Random(semente)
    base = lambda l, c: (3 * (l % 3) + l // 3 + c) % 9
    linhas = [g * 3 + l for g in rnd.sample(range(3), 3) for l in rnd.sample(range(3), 3)]
    colunas = [g * 3 + c for g in rnd.sample(range(3), 3) for c in rnd.sample(range(3), 3)]
    nums = rnd.sample(range(1, 10), 9)
    sol = [nums[base(l, c)] for l in linhas for c in colunas]
    jogo = sol[:]
    ordem = list(range(81)); rnd.shuffle(ordem)
    for i in ordem:
        if sum(1 for v in jogo if v) <= pistas: break
        guard, jogo[i] = jogo[i], 0
        if _resolver(jogo[:]) != 1: jogo[i] = guard
    return jogo, sol

def svg_sudoku(g, tam_mm=80, sol=None):
    cel = ''
    for i, v in enumerate(g):
        l, c = divmod(i, 9)
        if v: cel += f'<text x="{c * 10 + 5}" y="{l * 10 + 7.6}" text-anchor="middle" style="font:700 7px Nunito,Arial">{v}</text>'
        elif sol: cel += f'<text x="{c * 10 + 5}" y="{l * 10 + 7.6}" text-anchor="middle" fill="#d62828" style="font:6.5px Nunito,Arial">{sol[i]}</text>'
    finas = ''.join(f'M0 {k * 10}h90M{k * 10} 0v90' for k in range(1, 9) if k % 3)
    grossas = ''.join(f'M0 {k * 30}h90M{k * 30} 0v90' for k in range(1, 3))
    return (f'<svg viewBox="-1 -1 92 92" style="width:{tam_mm}mm;height:{tam_mm}mm;display:block;margin:1mm auto 0"><rect x="0" y="0" width="90" height="90" fill="none" stroke="#1d1d1d" stroke-width="1.2"/>'
            f'<path d="{finas}" stroke="#999" stroke-width=".35"/><path d="{grossas}" stroke="#1d1d1d" stroke-width="1"/>{cel}</svg>')
