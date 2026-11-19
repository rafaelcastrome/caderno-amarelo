import itertools,sys
L={1:([5,14,16,4,13,11],3,30),
   2:([25,19,2,21,22,28,5,24],3,50),
   3:([55,25,22,52,58,35,42,24,21],3,100),
   4:([17,26,29,33,22,42,13,25,30,18],4,100)}
for k,(nums,n,t) in L.items():
  sols=[c for c in itertools.combinations(nums,n) if sum(c)==t]
  traps=[c for r in (2,3,4) if r!=n for c in itertools.combinations(nums,r) if sum(c)==t]
  near=sum(1 for c in itertools.combinations(nums,n) if abs(sum(c)-t)<=2 and sum(c)!=t)
  print(k,len(list(itertools.combinations(nums,n))),'sols',sols,'traps',traps,'near',near)
