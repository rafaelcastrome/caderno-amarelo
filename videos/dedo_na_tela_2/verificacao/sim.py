import itertools
R,Cn=4,3
G=[['SORVETE','GATO','LUA'],
   ['FLOR','PEIXE','PIPA'],
   ['OVO','BANANA','BALÃO'],
   ['DADO','CHINELO','BOLA']]
cells=[(r,c) for r in range(R) for c in range(Cn)]
L={ (r,c):len(G[r][c]) for r,c in cells}
for r,c in cells: assert ((r+c)%2==0)==(L[(r,c)]%2==1), G[r][c]
def nb(p,alive): r,c=p; return [q for q in [(r-1,c),(r+1,c),(r,c-1),(r,c+1)] if q in alive]
def walk(starts,k,alive):
    S=set(starts)
    for _ in range(k): S={q for p in S for q in nb(p,alive)}
    return S
def first(alive):
    out=set()
    for p in cells:
        out|=walk([p],L[p],alive)
    return out
alive=set(cells)
S=first(alive); print('after first',sorted(G[r][c] for r,c in S))
import sys
best=[]
def search(S,alive,seq,depth):
    if len(S)==1:
        best.append((seq, [G[r][c] for r,c in S])); return
    if depth==0: return
    for k in (1,2,3):
        S2=walk(S,k,alive)
        if not S2: continue
        removable=[p for p in alive if p not in S2]
        # remove all removable, but keep each S2 cell with a neighbor unless it's final
        alive2=alive-set(removable)
        if len(S2)>1 and any(not nb(p,alive2) for p in S2): 
            # try keeping some
            continue
        search(S2,alive2,seq+[(k,[G[r][c] for r,c in removable])],depth-1)
alive1=alive-{p for p in cells if p not in S}
search(S,alive1,[],4)
for s,f in best:
    if f==['CHINELO']: print(s,f)
print(len(best), set(tuple(f) for s,f in best))
