const fs=require('fs'),assert=require('node:assert/strict'),vm=require('vm');
const {parseHTML}=require('../test-deps/node_modules/linkedom');
const base=process.argv[2]||'theme';
const factory=(file,name)=>new Function(fs.readFileSync(`${base}/src/engine/${file}.js`,'utf8').replace('export function','function')+`;return ${name}`)();
const createLaunch=factory('launch','createLaunch'),createAdapter=factory('adapter','createAdapter');
// Execute ME's verified useDeleteChat body; only TS annotations and generics are erased.
let body=fs.readFileSync('refs/verified-2.5.0/use-chats.ts','utf8').split('export function useDeleteChat() {')[1].split('export function useDeleteChatGroup()')[0];
body=('function useDeleteChat() {'+body).replace(/\(input: DeleteChatInput\)/g,'(input)').replace(/(getQueryData|setQueryData)<[^>]+>/g,'$1').replace(/\(value\): value is string/g,'(value)');
const getOptions=new Function('useQueryClient','useMutation','api','chatKeys','homeFeedKeys','removeChatsFromHomeFeed','getDeleteChatId','getDeleteChatGroupId','getDeleteChatForce','toast',body+';return useDeleteChat();');
(async()=>{
for(const kind of ['lost-callback','normal-callback','delete-error','different-room','other-mutation','other-route']){
 const {document,window}=parseHTML('<html><body><div data-component="AppShell"></div><div data-component="TopBar"></div></body></html>');Object.assign(global,{document,MutationObserver:window.MutationObserver,history:{state:{}}});
 let active='game-new',leaves=0,clears=0,deleted=false,unsubscribeCount=0,callbacks=0;const listeners=new Set();
 const cache={subscribe(fn){listeners.add(fn);return()=>{unsubscribeCount++;listeners.delete(fn)}}};
 document.querySelector('[data-component=TopBar]').__reactFiber$test={memoizedProps:{value:{getMutationCache:()=>cache}},return:null};
 global.localStorage={getItem:()=>active};const adapter=createAdapter({});adapter.state.lastChatSetter=id=>{clears++;active=id};
 const deps={adapter,core:{state:{disposed:false}},navigation:{state:{routeIntent:'start'},finishRoute:()=>{throw Error('deleted room cannot become ready')}},chats:{state:{chatMode:'game'}},ui:{state:{visible:n=>n.isConnected&&!n.hidden}},gestures:{returnFromNative:()=>{leaves++;deps.navigation.state.routeIntent='own'}}};
 const launch=createLaunch(deps);let resolveDelete,rejectDelete;const pending=new Promise((r,j)=>{resolveDelete=r;rejectDelete=j});
 const detail={id:active,mode:'game',metadata:'{}'},data=new Map([['chats,list',[detail]],['chats,detail,game-new',detail],['home-feed',{recentChats:[{chat:detail}]}]]);
 const qc={getQueryData:k=>data.get(k.join(',')),cancelQueries:async()=>{},setQueryData(k,v){const key=k.join(',');data.set(key,typeof v==='function'?v(data.get(key)):v)},removeQueries(){document.querySelector('[data-component=GameSetupWizard]')?.remove();const loading=document.createElement('div');loading.dataset.component='ChatArea.RestoringChat';document.body.append(loading)},invalidateQueries:async()=>{}};
 const keys={list:()=>['chats','list'],detail:id=>['chats','detail',id],group:id=>['chats','group',id]};
 const opts=getOptions(()=>qc,x=>x,{delete:()=>pending},keys,{all:['home-feed'],snapshot:()=>['home-feed']},(old,ids)=>old?{...old,recentChats:old.recentChats.filter(x=>!ids.has(x.chat.id))}:old,x=>typeof x==='string'?x:x.id,x=>typeof x==='string'?null:x.groupId,x=>typeof x!=='string'&&x.force,{error:()=>{}});
 const wizard=document.createElement('section');wizard.dataset.component='GameSetupWizard';wizard.innerHTML='<button aria-label="닫기"><svg class="lucide-x"></svg></button>';document.body.append(wizard);
 adapter.chatSurface=()=>null;launch.begin(new AbortController().signal,null);launch.state.selectedMode='game';launch.reconcile();
 assert.equal(launch.state.createdId,'game-new');const close=wizard.firstChild;launch.onClick({target:close});
 const context=await opts.onMutate('game-new');assert(!wizard.isConnected,'actual native onMutate removes detail and unmounts wizard');
 const emit=(status,vars='game-new',ctx=context)=>{for(const fn of [...listeners])fn({type:'updated',action:{type:status},mutation:{state:{status,variables:vars,context:ctx}}})};
 emit('pending');assert.equal(active,'game-new');assert.equal(leaves,0);
 if(kind==='different-room')active='B';if(kind==='other-route')deps.navigation.state.routeIntent='chat';
 if(kind==='other-mutation'){emit('success','game-new',{});emit('success','other-id');assert.equal(active,'game-new');assert.equal(leaves,0);launch.stop();resolveDelete();continue;}
 if(kind==='delete-error'){rejectDelete(Error('server failed'));try{await opts.mutationFn('game-new')}catch(e){opts.onError(e,'game-new',context);await opts.onSettled(null,e,'game-new',context);emit('error');}assert.equal(active,'game-new');assert.equal(leaves,0);launch.stop();continue;}
 resolveDelete();await opts.mutationFn('game-new');deleted=true;
 // React unmounted observer loses per-call onSuccess; native cache callbacks still run.
 if(kind==='normal-callback'){active=null;callbacks++;}
 await opts.onSettled(null,null,'game-new',context);emit('success');
 if(['different-room','other-route'].includes(kind)){assert.equal(active,kind==='different-room'?'B':'game-new');assert.equal(clears,0);assert.equal(leaves,0);launch.stop();}
 else{assert.equal(active,null,kind+': confirmed deletion must release its stale active ID');assert.equal(leaves,1);assert.equal(clears,kind==='normal-callback'?0:1);assert.equal(listeners.size,0);assert.equal(unsubscribeCount,1);}
 launch.stop();assert.equal(listeners.size,0);
}
console.log('PASS verified ME useDeleteChat onMutate/onError/onSettled: unmounted per-call callback recovery, native callback retained, failed deletion kept, unrelated mutation/room/route protected, subscription cleanup. No live React/TanStack runtime.');
})().catch(e=>{console.error(e);process.exitCode=1});
