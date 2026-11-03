const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
for(const n of ['p1','p2','p3']){await p.goto('file://'+process.cwd()+'/'+n+'.html');await p.waitForTimeout(400);await p.screenshot({path:n+'.png'});}await b.close();})();
