// TTS-11LABS-ADD original DOM presentation functions, fetched 2026-10-13.
// Test harness supplies views, hidden and a small cue-regex fixture.
  function presentation(root,m){
    // The viewer owns these disposable display bubbles, not React. Annotate
    // them directly and keep its source -> split-display sibling contract.
    if(root.closest('.mari-convo-viewer-split-display'))return root;
    let state=views.get(root);
    const ownDisplay=state&&root.style.getPropertyValue('display')==='none'&&root.style.getPropertyPriority('display')==='important';
    const display=ownDisplay?state.display:root.style.getPropertyValue('display'),priority=ownDisplay?state.priority:root.style.getPropertyPriority('display');
    const styleKey=Array.from({length:root.style.length},(_,i)=>root.style.item(i)).filter(p=>p!=='display').map(p=>p+':'+root.style.getPropertyValue(p)+'!'+root.style.getPropertyPriority(p)).join(';');
    const signature=[m?.id,m?.content,m?.activeSwipeIndex,root.innerHTML,root.className,styleKey,display,priority].join('\u0000');
    if(state&&state.signature===signature&&state.copy.isConnected)return state.copy;
    if(state)state.copy.remove();
    const copy=root.cloneNode(true);copy.removeAttribute('data-mari-tts-source-view');copy.setAttribute('data-mari-tts-copy','1');
    if(display)copy.style.setProperty('display',display,priority);else copy.style.removeProperty('display');
    // The unchanged viewer explicitly excludes this class from splitting.
    // Guard only our copies; native bubbles must remain eligible for splitting.
    if(root.closest('[data-chat-mode="conversation"]')){
      for(const bubble of [copy,...copy.querySelectorAll('.mari-message-bubble')])if(bubble.matches('.mari-message-bubble'))bubble.classList.add('mari-convo-viewer-split-bubble');
    }
    // Forward ordinary link/image interactions to their untouched native elements.
    const peers=new WeakMap(),originals=[root,...root.querySelectorAll('*')],clones=[copy,...copy.querySelectorAll('*')];
    clones.forEach((node,i)=>peers.set(node,originals[i]));
    copy.addEventListener('click',event=>{if(event.target.closest('.mari-tts-line-controls'))return;const original=peers.get(event.target);if(original){event.preventDefault();event.stopPropagation();original.click();}});
    root.setAttribute('data-mari-tts-source-view','1');root.style.setProperty('display','none','important');root.after(copy);state={signature,copy,display,priority};views.set(root,state);return copy;
  }
  function releaseView(source,state){
    source.removeAttribute('data-mari-tts-source-view');
    const restore=node=>{if(node.style.getPropertyValue('display')==='none'&&node.style.getPropertyPriority('display')==='important'){if(state.display)node.style.setProperty('display',state.display,state.priority);else node.style.removeProperty('display');}};
    // A viewer loaded after TTS copies the native inline style into its split
    // bubbles. Remove our temporary hiding there as well before handing over.
    if(source.hasAttribute('data-mari-convo-viewer-split-source')&&source.nextElementSibling?.classList.contains('mari-convo-viewer-split-display'))for(const bubble of source.nextElementSibling.children)restore(bubble);
    restore(source);state.copy.remove();views.delete(source);
  }
  function clearViews(){for(const [source,state] of views)releaseView(source,state);}
  function textNodes(root) {
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('button,pre,code,textarea,.mari-tts-cue,.mari-tts-line-controls')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    const nodes=[];while(w.nextNode())nodes.push(w.currentNode);return nodes;
  }
  function hideCues(root,participants=[],speakerMarkup=false,audioText=false,cueSource='') {
    const nodes=textNodes(root),text=nodes.map(n=>n.nodeValue).join('');
    const sources=[...(speakerMarkup?[C.wrapperPattern,...C.idPatterns(participants.map(p=>p.id))]:[]),C.cuePattern+'[ \t]*'];
    const locate=offset=>{for(const n of nodes){if(offset<=n.nodeValue.length)return [n,offset];offset-=n.nodeValue.length;}return null;};
    const matches=[...text.matchAll(new RegExp(sources.join('|'),'gi'))].map(m=>({start:locate(m.index),end:locate(m.index+m[0].length)}));
    // Quotes in an attribute may be styled in separate DOM nodes. Hide the complete range.
    for(const m of matches.reverse()){
      if(!m.start||!m.end)continue;
      const range=document.createRange();range.setStart(...m.start);range.setEnd(...m.end);
      const span=document.createElement('span');span.className='mari-tts-cue';span.append(range.extractContents());range.insertNode(span);hidden.add(span);
    }
  }
