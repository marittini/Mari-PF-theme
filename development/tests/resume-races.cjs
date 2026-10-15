const assert=require('node:assert/strict'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{
 const source=process.argv[2]||'theme/src/features/chats.js';const {createChats}=await import(pathToFileURL(path.resolve(source)));
 const calls=[],snapshots=[];const deps={notifications:{state:{unreadHydration:null,retainedUnread:new Map()},captureUnreadMetadata(){},chatUnreadMetadata:c=>({unreadCount:c.metadata?.autonomousUnreadCount||0,unreadVersion:c.metadata?.autonomousUnreadAt||''}),syncUnreadBadges:n=>snapshots.push(n),unreadSnapshot:()=>[...chat.state.chatRegistry.values()],notificationSnapshot:()=>new Map()},updates:{state:{}},core:{state:{disposed:false}},data:{state:{cache:new Map()},jsonRequest:(...args)=>new Promise(resolve=>calls.push({args,resolve}))}};
 const chat=createChats(deps);Object.assign(chat.state,{chatRegistry:new Map()});
 const old=chat.hydrateSavedUnread();assert.equal(calls.length,1);
 const fresh=chat.hydrateSavedUnread(true);assert.equal(calls.length,2,'forced resume must replace an older non-fresh pending read');assert(calls[0].args[3].aborted);assert.equal(calls[1].args[4],true);
 assert.equal(chat.hydrateSavedUnread(true),fresh,'one fresh read per resume burst');
 calls[1].resolve([{id:'other',metadata:{autonomousUnreadCount:3,autonomousUnreadAt:'new'}}]);assert.equal(await fresh,true);
 calls[0].resolve([{id:'other',metadata:{autonomousUnreadCount:0}}]);await old;assert.equal(chat.state.chatRegistry.get('other').unreadCount,3,'superseded response must not overwrite fresh metadata');assert.equal(snapshots.length,1);
 const abandoned=chat.hydrateSavedUnread(true);deps.notifications.state.unreadHydration.abort();const resumed=chat.hydrateSavedUnread(true);assert.equal(calls.length,4,'aborted pending read cannot block a fresh read');calls[3].resolve([{id:'other',metadata:{autonomousUnreadCount:5,autonomousUnreadAt:'newer'}}]);await resumed;calls[2].resolve([]);await abandoned;assert.equal(chat.state.chatRegistry.get('other').unreadCount,5);
 const failed=chat.hydrateSavedUnread(true);calls[4].resolve(null);assert.equal(await failed,false);assert.equal(deps.notifications.state.unreadHydration,null);
 console.log('PASS resume races: forced read replaces bootstrap read; fresh burst dedup; aborted pending replaced; ignored-abort late replies cannot replace unread metadata; failed reads release request slot.');
})().catch(e=>{console.error(e);process.exitCode=1});
