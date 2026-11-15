import random, json
C, R = 6, 7; N = C*R
def paths(g):
    ends=set(); maxlen=0
    for s in range(2,13):
        i=s-1; steps=0
        while isinstance(g[i],int):
            i+=g[i]; steps+=1
            if i>=N: return None
        ends.add(i); maxlen=max(maxlen,steps)
    return ends, maxlen
best=None
for seed in range(200000):
    rnd=random.Random(seed)
    g=[rnd.choice([1,2,3,4]) for _ in range(N)]
    target=rnd.randint(33,38); g[target]='COCO'
    decoys=rnd.sample([k for k in range(14,N) if abs(k-target)>2],4)
    for k,name in zip(decoys,['SOL','CORACAO','ESTRELA','PIZZA']): g[k]=name
    r=paths(g)
    nums=[x for x in g if isinstance(x,int)]
    if r and r[0]=={target} and all(nums.count(k)>=7 for k in (1,2,3,4)) and r[1]>=6:
        # all path cells
        best=(seed,g,target,r[1]); break
print(best)
json.dump({"C":C,"R":R,"grade":best[1],"alvo":best[2]},open("grade.json","w"))
# show paths
g=best[1]
for s in range(2,13):
    i=s-1; p=[i]
    while isinstance(g[i],int): i+=g[i]; p.append(i)
    print(s,p)
