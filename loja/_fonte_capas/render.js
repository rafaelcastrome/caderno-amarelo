const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:800,height:1000}});
for (const [f,o] of [['kit','capa-kit-mentalista'],['desafios','capa-desafios']]){await p.goto('file://'+__dirname+'/'+f+'.html');await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:__dirname+'/../assets/img/'+o+'.png'});}
await b.close();})();
