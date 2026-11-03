const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const n of ['s1','s2','s3']){await p.goto('file://'+process.cwd()+'/'+n+'.html');await p.waitForTimeout(400);await p.screenshot({path:n+'.png'});}await b.close();})();
