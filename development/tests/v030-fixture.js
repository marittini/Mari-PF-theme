// React useSyncExternalStore hook shapes: queue snapshots read live actions.
let sentinel=false,pendingPops=0;
function syncSentinel(){const open=[...document.querySelectorAll('.native-pane')].some(n=>!n.hidden);if(open&&!sentinel){sentinel=true;history.pushState({marinaraOverlay:true},'');}else if(!open&&sentinel){sentinel=false;pendingPops++;history.back();}}
window.addEventListener('popstate',()=>{if(pendingPops){pendingPops--;return;}if(sentinel){sentinel=false;closePanels();}});
window.actionLog=[];window.activeId=null;window.renderSeq=0;window.panelSeq=0;
window.fixtureSetupFlags={};
const actions={
 setPendingNewChatMode:value=>fixtureSetupFlags.pending=value,
 setShouldOpenSettings:value=>fixtureSetupFlags.settings=value,
 setShouldOpenWizard:value=>fixtureSetupFlags.wizard=value,
 setShouldOpenWizardInShortcutMode:value=>fixtureSetupFlags.shortcut=value,
 setSetupActive:value=>fixtureSetupFlags.setup=value,
 setActiveChatId:(id)=>{if(id)localStorage.setItem('marinara-active-chat-id',id);else localStorage.removeItem('marinara-active-chat-id');window.actionLog.push(['chat',id]);window.activeId=id;const seq=++window.renderSeq;if(id===null)return;window.chatOpened=true;setTimeout(()=>{if(seq!==window.renderSeq)return;const mode=id==='chat1'?'roleplay':id==='chat2'?'game':'conversation';document.querySelector('[data-chat-mode]').dataset.chatMode=mode;if(window.collapseComposer)document.querySelector('[data-chat-composer]').removeAttribute('data-chat-id');else document.querySelector('[data-chat-composer]').dataset.chatId=id;document.querySelector('[data-chat-mode]').__reactFiber$fixture={memoizedProps:{activeChatId:id},return:null};document.querySelector('[data-component=AppShell]').dataset.chatSurfaceActive='true';},220);},
 setSidebarOpen:(open)=>{window.actionLog.push(['sidebar',open]);const p=document.querySelector('[data-component=ChatSidebar]');p.hidden=!open;p.setAttribute('aria-hidden',String(!open));syncSentinel();},
 closeRightPanel:()=>{window.panelSeq++;window.actionLog.push(['closePanel']);document.querySelectorAll('[data-panel-key]').forEach(p=>{p.hidden=true;p.setAttribute('aria-hidden','true')});syncSentinel();},
 openRightPanel:(key)=>{window.actionLog.push(['panel',key]);const seq=++window.panelSeq;setTimeout(()=>{if(seq!==window.panelSeq)return;openPanel(key);syncSentinel();},80);},
 closeAllDetails:()=>{window.actionLog.push(['closeDetails']);},
 setAppAccentColor:(value)=>{window.actionLog.push(['accent',value]);localStorage.setItem('fixture-accent',value);document.documentElement.style.setProperty('--marinara-app-accent-static',value||'#6656ec');},
 setTheme:(theme)=>{window.actionLog.push(['theme',theme]);document.documentElement.dataset.theme=theme;},
 requestChatModeShortcut:(mode)=>{window.folderMode=mode;actions.setSidebarOpen(true);selectNativeMode(mode);},
 setSettingsTab:(tab)=>{window.actionLog.push(['settingsTab',tab]);document.getElementById('settings-tab-'+tab)?.setAttribute('aria-selected','true');if(tab==='appearance'&&!document.getElementById('settings-control-app-accent-color')){const control=document.createElement('div');control.id='settings-control-app-accent-color';control.__reactFiber$fixture={memoizedState:{memoizedState:actions.setAppAccentColor,queue:{value:actions.setAppAccentColor,getSnapshot:()=>actions.setAppAccentColor},next:null},return:null};document.querySelector('[data-panel-key=settings]').append(control);}},
 openModal:(type,props)=>{window.actionLog.push(['modal',type,props]);const modal=document.createElement('div');modal.className='mari-modal';modal.role='dialog';const b=document.createElement('button');b.textContent='콘보 시작';b.onclick=()=>{modal.remove();actions.setActiveChatId('chat0');};modal.append(b);document.body.append(modal);},
 openCharacterDetail:(id)=>{window.actionLog.push(['detail',id]);const n=document.createElement('div');n.dataset.component='DetailEditor';n.className='mari-editor-shell';n.textContent='편집 내용';document.querySelector('[data-component=CenterContent]').append(n);}
};
// Match the native sidebar's documented data-chat-mode-tab / aria-pressed contract.
function selectNativeMode(mode){window.nativeSelectedMode=mode;document.querySelectorAll('[data-component="ChatSidebar"] [data-chat-mode-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chatModeTab===mode)));}
for(const mode of ['conversation','roleplay','game']){const side=document.querySelector('[data-component="ChatSidebar"]');let tab=side.querySelector('[data-chat-mode-tab="'+mode+'"]');if(!tab){tab=document.createElement('button');tab.dataset.chatModeTab=mode;tab.textContent=mode;side.append(tab)}tab.onclick=()=>selectNativeMode(mode);}
selectNativeMode('conversation');

// One selector snapshot per hook, as used by React + Zustand in TopBar/AppShell.
let hook=null;for(const value of Object.values(actions).reverse())hook={memoizedState:value,queue:{value,getSnapshot:()=>value},next:hook};document.querySelector('[data-component=TopBar]').__reactFiber$fixture={memoizedState:hook,return:null};

const folderButton=document.createElement('button');folderButton.innerHTML='<svg class="lucide-folder-plus"></svg>새 폴더';folderButton.onclick=()=>window.nativeFolderCreated=(window.nativeFolderCreated||0)+1;document.querySelector('[data-component=ChatSidebar]').append(folderButton);

window.queryListeners=new Set();window.queryCacheFixture={subscribe(fn){queryListeners.add(fn);return ()=>queryListeners.delete(fn)}};document.querySelector('[data-component=TopBar]').__reactFiber$fixture.memoizedProps={value:{getQueryCache:()=>queryCacheFixture}};

const persistedAccent=localStorage.getItem('fixture-accent');if(persistedAccent)document.documentElement.style.setProperty('--marinara-app-accent-static',persistedAccent);
