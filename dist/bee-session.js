(()=>{'use strict';
const allowed=new Set(['index.html','study.html','atelier.html']);
const frame=document.querySelector('#bee-page');
const getArea=file=>file==='study.html'?'study':file==='atelier.html'?'atelier':'index';
const getFile=area=>area==='study'?'study.html':area==='atelier'?'atelier.html':'index.html';
function routeOf(input){
 try{
  const u=new URL(input,location.href);
  if(u.origin!==location.origin)return null;
  const file=u.pathname.split('/').pop()||'index.html';
  if(!allowed.has(file))return null;
  const area=getArea(file);
  const sub=u.hash.replace(/^#\/?/,'')||(area==='atelier'?'art':'home');
  return {area,sub,file,href:file+'#'+(area==='atelier'?'':'/')+sub,hash:'#/'+area+'/'+sub};
 }catch{return null}
}
function fromHash(){
 const match=location.hash.match(/^#\/(index|study|atelier)(?:\/(.*))?$/);
 const area=match?.[1]||'index';
 const sub=match?.[2]||(area==='atelier'?'art':'home');
 return routeOf(getFile(area)+'#'+(area==='atelier'?'':'/')+sub);
}
let routing=false;
function update(url,push){
 const route=routeOf(url);if(!route)return false;
 const current=frame?.contentWindow?.location;
 if(push&&location.hash!==route.hash)history.pushState(null,'',route.hash);
 const prev=window.BEE_SHELL.currentArea;
 window.BEE_SHELL.currentArea=route.area;
 window.BEE_SHELL.currentSection=route.sub.split('/')[0];
 // Same document: update only the inner hash. Preserve active audio element in this parent.
 try{
  const currentFile=current?.pathname.split('/').pop();
  if(currentFile===route.file){
   if(current.hash!==new URL(route.href,location.href).hash)current.hash=new URL(route.href,location.href).hash;
  }else{
   frame.src=route.file+'?v=20261108-type2'+route.href.slice(route.file.length);
  }
 }catch{frame.src=route.file+'?v=20261108-type2'+route.href.slice(route.file.length)}
 window.BEE_AUDIO?.getState&&document.dispatchEvent(new Event('bee:route'));
 const engine=window.BEE_AUDIO;if(engine?.refreshMini)engine.refreshMini();
 return true;
}
function navigate(href){return update(href,true)}
function sync(href){
 const route=routeOf(href);if(!route)return false;
 window.BEE_SHELL.currentArea=route.area;
 window.BEE_SHELL.currentSection=route.sub.split('/')[0];
 if(location.hash!==route.hash)history.replaceState(null,'',route.hash);
 window.BEE_AUDIO?.refreshMini?.();
 return true;
}
window.BEE_SHELL={navigate,sync,currentArea:'index',currentSection:'home'};
window.addEventListener('popstate',()=>update(fromHash()?.href||'index.html#/home',false));
window.addEventListener('hashchange',()=>update(fromHash()?.href||'index.html#/home',false));
frame.addEventListener('load',()=>{try{sync(frame.contentWindow.location.href)}catch{}});
update(fromHash()?.href||'index.html#/home',false);
})();