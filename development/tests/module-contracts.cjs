const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const root=path.resolve('theme'),contract=JSON.parse(fs.readFileSync(path.join(root,'module-contracts.json')));
 const first={},second={};
 for(const m of contract.modules){const source=fs.readFileSync(path.join(root,m.file),'utf8');const imported=await import(pathToFileURL(path.join(root,m.file)).href);assert.equal(typeof imported[m.factory],'function',m.file);first[m.id]=imported[m.factory](first);second[m.id]=imported[m.factory](second);assert.notEqual(first[m.id].state,second[m.id].state);assert.deepEqual(Object.keys(first[m.id].state).sort(),[...m.state].sort());for(const name of m.exports)assert.equal(typeof first[m.id][name],'function',m.id+'.'+name);if(!m.file.startsWith('src/engine/'))assert(!/__reactFiber\$|memoizedProps|memoizedState/.test(source),'Engine internals escaped adapter: '+m.file);}
 for(const m of contract.modules)for(const d of m.dependencies)assert(first[d],m.id+' -> '+d);
 const order=[],errors=[],oldError=console.error;console.error=(...args)=>errors.push(args);
 const life=first.lifecycle;
 life.configure({a:{initialize:[{order:20,run:()=>order.push('init20')}],cleanup:[{order:2,run:()=>order.push('clean2')}]},b:{initialize:[{order:10,run:()=>order.push('init10')}],cleanup:[{order:1,run:()=>{order.push('clean1');throw Error('expected cleanup fault')}}]}});
 life.start();life.start();life.dispose();life.dispose();console.error=oldError;
 assert.deepEqual(order,['init10','init20','clean1','clean2']);assert.equal(errors.length,1);assert.throws(()=>life.configure({}),/already started/);
 const failure=second.lifecycle;let cleaned=false;failure.configure({a:{initialize:[{order:1,run:()=>{throw Error('expected init fault')}}],cleanup:[{order:1,run:()=>cleaned=true}]}});assert.throws(()=>failure.start(),/expected init fault/);assert(cleaned);assert(failure.state.disposed);
 let saved;global.localStorage={setItem:(key,value)=>saved={key,value}};Object.assign(first.design.state,{showHomeBanner:false,homeView:'scroll',personaView:'gallery',chatLetterSpacing:1,chatLineHeight:2,roleplayPadding:15,translationReduction:4});first.design.saveDesignPreferences();assert.equal(JSON.parse(saved.value).translationReduction,4);assert.equal(JSON.parse(saved.value).roleplayPadding,15);delete global.localStorage;
 console.log('PASS module contracts: '+contract.modules.length+' factories, isolated state, explicit dependency APIs, engine-internal confinement, ordered initialization, idempotent/failure-isolated cleanup, initialization rollback, complete preference save.');
})().catch(e=>{console.error(e);process.exitCode=1});
