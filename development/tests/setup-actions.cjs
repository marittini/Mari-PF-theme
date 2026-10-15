const assert=require('node:assert/strict'),fs=require('fs');
const {parseHTML}=(()=>{try{return require('linkedom')}catch{return require('../test-deps/node_modules/linkedom')}})();
const createAdapter=new Function(fs.readFileSync('theme/src/engine/adapter.js','utf8').replace('export function','function')+';return createAdapter')();
const {document}=parseHTML('<html><body><div data-component="AppShell"><header data-component="TopBar"></header></div></body></html>');global.document=document;
const state={pending:'roleplay',settings:true,wizard:true,shortcut:true,setup:true};let calls=0,localOpen=true;
const actions={setPendingNewChatMode:v=>{calls++;state.pending=v},setShouldOpenSettings:v=>{calls++;state.settings=v},setShouldOpenWizard:v=>{calls++;state.wizard=v},setShouldOpenWizardInShortcutMode:v=>{calls++;state.shortcut=v},setSetupActive:v=>{calls++;state.setup=v}};
const a=createAdapter({});a.initialize.forEach(x=>x.run());assert.equal(a.prepareChat({}),false);assert.equal(calls,0,'missing action cannot partially clear flags');
// The real notification component remains in Fiber when it returns null: no DOM anchor or notification rail.
let hooks=null;for(const fn of Object.values(actions))hooks={memoizedState:fn,next:hooks};const shell=document.querySelector('[data-component=AppShell]');shell.__reactFiber$test={memoizedState:null,child:{memoizedState:hooks,child:null,sibling:null},return:null};
let found=a.engineActions();for(const key of Object.keys(actions))assert.equal(found[key],actions[key]);
const wizard=document.createElement('div');wizard.dataset.component='ChatSetupWizard';wizard.innerHTML='<button><svg class="lucide-x"></svg></button>';wizard.firstChild.onclick=()=>{localOpen=false;wizard.remove()};document.body.append(wizard);assert.equal(a.prepareChat(found),true);assert.equal(localOpen,false);assert.deepEqual(state,{pending:null,settings:false,wizard:false,shortcut:false,setup:false});
// Stable reset actions survive the return-null component being unmounted.
shell.__reactFiber$test.child=null;found=a.engineActions();assert.equal(found.setShouldOpenWizard,actions.setShouldOpenWizard);assert.equal(a.prepareChat(found),true);a.cleanup.forEach(x=>x.run());assert.deepEqual(a.state.cachedChatActions,{});
console.log('PASS required native reset actions discovered on return-null Fiber, all-or-none reset, local ChatSetupWizard onFinish, cached stable actions across unmount, cleanup.');
