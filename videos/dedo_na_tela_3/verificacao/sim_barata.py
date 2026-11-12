import itertools,sys
from itertools import combinations
R,Cn=4,3
G=[['SORVETE','GATO','LUA'],['FLOR','PEIXE','PIPA'],['OVO','BARATA','BALÃO'],['DADO','CHINELO','BOLA']]
cells=[(r,c) for r in range(R) for c in range(Cn)]
L={(r,c):len(G[r][c]) for r,c in cells}
def nb(p,alive): r,c=p; return [q for q in [(r-1,c),(r+1,c),(r,c-1),(r,c+1)] if q in alive]
def walk(S,k,alive):
    S=set(S)
    for _ in range(k): S={q for p in S for q in nb(p,alive)}
    return S
alive=set(cells)
S=set()
for p in cells: S|=walk([p],L[p],alive)
print(sorted(G[r][c] for r,c in S))
res=[]
def ok(S,a): return all(nb(p,a) for p in S)
def search(S,alive,seq,depth):
    rem=[p for p in alive if p not in S]
    for n in range(1,4):
        for sub in combinations(rem,n):
            a2=alive-set(sub)
            if not ok(S,a2): continue
            for k in (1,2,3):
                S2=walk(S,k,a2)
                if len(S2)==1: res.append(seq+[([G[r][c] for r,c in sub],k),[G[r][c] for r,c in S2]])
                elif depth>1: search(S2,a2,seq+[([G[r][c] for r,c in sub],k)],depth-1)
search(S,alive,[],3)
fin=[r for r in res if r[-1]==['BARATA']]
fin.sort(key=lambda r:(len(r),sum(len(x[0]) for x in r[:-1])))
for r in fin[:10]: print(r)
