#!/usr/bin/env python3
"""Confere a grade: um número de cada fileira, cada um de uma cor (coluna) diferente -> sempre 27."""
import itertools
G = [[6, 9, 4, 5], [12, 15, 10, 11], [4, 7, 2, 3], [5, 8, 3, 4]]
somas = {sum(G[i][p[i]] for i in range(4)) for p in itertools.permutations(range(4))}
print("somas possíveis:", somas)
