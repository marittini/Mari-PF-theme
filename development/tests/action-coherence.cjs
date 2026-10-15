const assert=require('node:assert/strict'),fs=require('fs');
const {parseHTML}=(()=>{try{return require('linkedom')}catch{return require('../test-deps/node_modules/linkedom')}})();
const load=(file,name)=>new Function(fs.readFileSync(file,'utf8').replace('export function','function')+`;return ${name}`)();
(async()=>{
 const {document,window}=parseHTML('<html><body><div data-component="AppShell"></div><main></main></body></html>');
 Object.assign(global,{document,window,MutationObserver:window.MutationObserver,history:{state:null},CSS:{escape:s=>s}});
 let active='A',closed=0,own=0,native=0,finished=0,settingCalls=0,closeWorks=true;const notices=[];
 const noop=()=>{};const html=document.documentElement,root=document.createElement('div'),main=document.querySelector('main');root.dataset.native='true';
 const actions={setActiveChatId:id=>{if(closeWorks)active=id},openRightPanel:key=>{const n=document.createElement('div');n.dataset.panelKey=key;n.setAttribute('aria-hidden','false');document.body.append(n)},closeAllDetails:noop,closeRightPanel:()=>document.querySelectorAll('[data-panel-key]').forEach(n=>n.remove()),setSidebarOpen:noop,setSettingsTab:()=>settingCalls++};
 const deps={core:{state:{disposed:false,epoch:0,timers:new Set()},stop(){this.state.epoch++},bindLater:noop,later:fn=>{deps.delayed=fn}},ui:{state:{html,root,main,tabs:[],visible:n=>!!n?.isConnected&&!n.hidden},own:()=>{own++;root.dataset.native='false'},native:()=>{native++;root.dataset.native='true'},notice:x=>notices.push(x),button:()=>document.createElement('button')},adapter:{dismissChatSetup:()=>true,engineActions:()=>actions,activeSession:()=>({known:true,id:active}),clearActiveChat:a=>{closed++;a.setActiveChatId(null);return !active},engineNavigator:()=>null,chatSurface:()=>({id:'stale',surface:main})},notifications:{suspendUnread:noop,acknowledgeUnread:noop},history:{state:{},armNativeBack:()=>finished++,installBackWatcher:noop,remember:noop},nativeUi:{bindNativeUi:noop},chats:{state:{chatMode:'conversation'},rememberChatVisit:noop},catalog:{state:{},loadHome:noop},convo:{bindSplits:noop},extensions:{state:{},homeAgents:noop,retryNative:noop},updates:{invalidateChats:noop},avatars:{state:{},scheduleCrops:noop},gestures:{returnFromNative:noop},data:{state:{cache:new Map()}},hub:{hub:noop}};
 const nav=load('theme/src/engine/navigation.js','createNavigation')(deps);deps.navigation=nav;
 // Portals mounted outside AppShell must wake the route observer without another unrelated mutation.
 const c=new AbortController();const pending=nav.waitEngine(()=>document.querySelector('#portal'),c.signal,100);
 const portal=document.createElement('div');portal.id='portal';document.body.append(portal);assert.equal(await pending,portal);portal.remove();
 await nav.openNative('characters');assert.equal(active,null,'panel navigation closes native A');assert.equal(root.dataset.native,'true');assert.equal(finished,1);
 const old=nav.beginRoute('panel');nav.beginRoute('detail');const before={native,own,finished};nav.finishRoute('panel',old);nav.routeFailure(Error('old failure'),noop,old);assert.deepEqual({native,own,finished},before,'stale completion/failure cannot override new route');assert.equal(nav.state.routeIntent,'detail');
 // Resolve an awaited action, cancel before its continuation runs: no stale settings-tab mutation.
 // settings() closes over waitEngine; its first wait resolves immediately, then cancellation happens in a microtask.
 const settings=nav.settings('appearance');queueMicrotask(()=>nav.go('home',true));await settings;assert.equal(settingCalls,0,'cancelled settings request cannot select a tab');
 active='A';closeWorks=false;nav.state.nativeOrigin={view:'home'};nav.go('home');assert.equal(nav.state.nativeOrigin.view,'home','failed exit retains origin');
 await nav.openNative('personas');assert.equal(root.dataset.native,'true','failed closure must reveal real native session');assert.equal(nav.state.bridgeBusy,false);assert.equal(html.classList.contains('mft-transition'),false);assert.equal(active,'A');closeWorks=true;
 // Stale chat markup is insufficient to adopt a room after closing a panel.
 nav.state.routeIntent='panel';root.dataset.native='true';active=null;nav.onModeClick({target:{closest:s=>s==='button,[role="tab"]'?{}:null}});deps.delayed();assert.equal(nav.state.routeIntent,'panel');
 // Android CloseWatcher must call native wizard X, including native async cleanup; never theme-exit it.
 let handler,exits=0,dismissed=0;global.CloseWatcher=class{addEventListener(_,fn){handler=fn}destroy(){}};window.CloseWatcher=global.CloseWatcher;deps.gestures={state:{phone:{matches:true}},returnFromNative:()=>exits++};deps.navigation.state.routeIntent='start';deps.catalog.state.detailCard=null;
 deps.launch=load('theme/src/engine/launch.js','createLaunch')(deps);
 const h=load('theme/src/engine/history.js','createHistory')(deps);h.state.exitUntil=0;const wizard=document.createElement('div');wizard.dataset.component='GameSetupWizard';wizard.setAttribute('role','dialog');wizard.innerHTML='<button><svg class="lucide-x"></svg></button>';document.body.append(wizard);wizard.firstChild.onclick=()=>dismissed++;deps.launch.begin(new AbortController().signal,null);h.installBackWatcher();handler();assert.equal(dismissed,1);assert.equal(exits,0);await Promise.resolve();wizard.firstChild.disabled=true;handler();assert.equal(dismissed,1);assert.equal(exits,0,'disabled wizard X cannot fall through to theme back');wizard.remove();
 // Agent button existence/click alone cannot report success; actual selected state is required.
 nav.waitEngine=(test,signal)=>{const c=new AbortController();signal?.addEventListener('abort',()=>c.abort(),{once:true});if(signal?.aborted)c.abort();return load('theme/src/engine/navigation.js','createNavigation')(deps).waitEngine(test,c.signal,35)};
 const ext=load('theme/src/engine/extensions.js','createExtensions')(deps);
 const tabs=document.createElement('div');tabs.dataset.component='HomeBrowserHub.TabList';tabs.innerHTML='<button role="tab" id="marinara-home-tab-noodle" aria-selected="false">Noodle</button>';document.body.append(tabs);
 let mark=finished;await ext.openAgent('Noodle');assert.equal(finished,mark,'unresponsive native tab is not a successful agent route');assert.equal(nav.state.bridgeBusy,false);assert.equal(html.classList.contains('mft-transition'),false);
 tabs.firstChild.onclick=()=>tabs.firstChild.setAttribute('aria-selected','true');await ext.openAgent('Noodle');assert.equal(finished,mark+1);assert.equal(nav.state.routeIntent,'agent');
 // An unrelated existing native panel cannot make an extension toggle take over the screen.
 const pane=document.createElement('div');pane.dataset.panelKey='settings';pane.setAttribute('aria-hidden','false');document.body.append(pane);const toggle=document.createElement('button');document.body.append(toggle);mark=native;ext.runExtension(toggle);await new Promise(r=>setTimeout(r,45));assert.equal(native,mark);
 nav.state.navController.abort();deps.launch.stop();h.cleanup[0].run();
 console.log('PASS portal wakeup; panel closes native session; stale route completion/failure and settings mutation blocked; failed exit retains origin and native surface; stale composer rejected; mobile wizard back uses native X and respects disabled state; agent selection acknowledgement and unrelated extension panel isolation.');
})().catch(e=>{console.error(e);process.exitCode=1});
