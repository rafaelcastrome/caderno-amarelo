exec(open('sim.py').read().split('alive=set(cells)')[0])
from itertools import combinations
alive=set(cells)
S=first(alive)
res=[]
def ok(S,alive): return all(nb(p,alive) for p in S) if len(S)>1 else True
def search(S,alive,seq,depth):
    # eliminate step: choose subset of non-occupied alive cells to remove (1..3)
    rem=[p for p in alive if p not in S]
    for n in range(1,4):
        for sub in combinations(rem,n):
            a2=alive-set(sub)
            if not ok(S,a2): continue
            # all alive cells must be connected? require S cells have neighbors
            for k in (1,3):
                S2=walk(S,k,a2)
                if len(S2)==1:
                    res.append(seq+[([G[r][c] for r,c in sub],k)]+[[G[r][c] for r,c in S2]]); 
                elif depth>1:
                    search(S2,a2,seq+[([G[r][c] for r,c in sub],k)],depth-1)
search(S,alive,[],4)
fin=[r for r in res if r[-1]==['CHINELO']]
print(len(res),len(fin))
fin.sort(key=len)
for r in fin[:15]: print(r)
