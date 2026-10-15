const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
(async()=>{
 const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');let options={headless:true};if(fs.existsSync('chrome/chromium')){const bin=require('../test-deps/node_modules/@sparticuz/chromium');options={...options,executablePath:path.resolve('chrome/chromium'),args:bin.args,env:{...process.env,LD_LIBRARY_PATH:path.resolve('chrome/swiftshader')}};}const browser=await chromium.launch(options);
 const results={note:'0.31.5 restores global request/refresh behavior from 0.31.3; only independent catalog rendering is retained.',catalog:[]};
 try {for(const mobile of [false,true])for(const baseline of [true,false])for(const persona of [false,true]){
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900}});await page.goto('about:blank');
 // Isolated feature fixture measures catalog rendering while the folder endpoint is delayed.
 let source=fs.readFileSync('theme/src/features/catalog.js','utf8');if(baseline){source=fs.readFileSync('tests/performance-catalog-v0313.js','utf8');}
 await page.addScriptTag({content:source.replace('export function','function')+';window.createCatalog=createCatalog;'});
 const r=await page.evaluate(async(persona)=>{
 const main=document.createElement('main');document.body.append(main);const el=(tag,cls='',text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n};
 const core={state:{epoch:0,disposed:false,timers:new Set()},stop(){this.state.epoch++},later:setTimeout};
 const deps={core,ui:{state:{main,shadow:document,el,headerAgents:document.createElement('div')},own(){},button(text,fn,cls=''){const b=el('button',cls,text);b.onclick=fn;return b},error(e){throw e}},design:{state:{homeView:'scroll',personaView:'gallery',showHomeBanner:false}},extensions:{homeAgents(){}},avatars:{avatar(){return el('img','art')},observeImages(){}},navigation:{state:{}},data:{compact(x){return {...x,tags:[],title:''}},async get(url){await new Promise(r=>setTimeout(r,url.includes('groups')?600:20));return url.includes('groups')?[{name:'폴더',characterIds:['a'],personaIds:['a']}]:{items:[{id:'a',name:'A',tags:[]},{id:'b',name:'B',tags:[]}],hasMore:false}}}};
 const cat=createCatalog(deps);cat.initialize.forEach(x=>x.run());const start=performance.now();const load=()=>persona?cat.personaGallery():cat.loadHome();const selector=persona?'[data-persona-id=a]':'[data-character-id=a]';load();while(!main.querySelector(selector))await new Promise(r=>setTimeout(r,5));const first=performance.now()-start;const node=main.querySelector(selector);await new Promise(r=>setTimeout(r,650));const reused=node===main.querySelector(selector);const headings=[...main.querySelectorAll(persona?'.persona-folder h2':'.shelf h2')].map(x=>x.textContent);assertLocal(headings.join(',')===(persona?'페르소나,폴더':'캐릭터,폴더'),'grouping');
 function assertLocal(v,m){if(!v)throw Error(m)}
 // A late folder response cannot replace a different view.
 deps.data.get=async url=>{await new Promise(r=>setTimeout(r,url.includes('groups')?200:10));return url.includes('groups')?[]:{items:[{id:'a',name:'A',tags:[]}],hasMore:false}};
 load();await new Promise(r=>setTimeout(r,40));core.stop();main.textContent='다른 화면';await new Promise(r=>setTimeout(r,240));assertLocal(main.textContent==='다른 화면','stale view clobbered');
 return {firstCardMs:Math.round(first),reused,headings};
 },persona);assert(r.reused);if(!baseline)assert(r.firstCardMs<300);results.catalog.push({mobile,baseline,persona,...r});}
 }finally{await browser.close()}
 fs.writeFileSync('output/performance-v0315.json',JSON.stringify(results,null,2));console.log('PASS PC/mobile home/persona delayed folders, card identity and stale-view isolation; catalog optimization retained.');console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exitCode=1});
