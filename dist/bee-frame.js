(()=>{'use strict';
const file=location.pathname.split('/').pop()||'index.html';
const area=file==='study.html'?'study':file==='atelier.html'?'atelier':'index';
const sub=location.hash.replace(/^#\/?/,'')||(area==='atelier'?'art':'home');
const shellUrl='shell.html#/'+area+'/'+sub;
if(window.self===window.top){
  // All direct entry URLs join the same long-lived document before audio starts.
  location.replace(shellUrl);
  return;
}
let shell=null;
try{shell=window.parent.BEE_SHELL||null}catch{}
if(!shell)return;
function sync(){try{shell.sync(location.href)}catch{}}
function routeLink(e){
 if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;
 const a=e.target.closest?.('a[href]');
 if(!a||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
 const raw=a.getAttribute('href');
 if(!raw||raw.startsWith('javascript:'))return;
 try{
  const url=new URL(raw,location.href);
  if(url.origin!==location.origin)return;
  if(!/^(?:index|study|atelier)\.html$/.test(url.pathname.split('/').pop()||'index.html'))return;
  e.preventDefault();
  shell.navigate(url.href);
 }catch{}
}
document.addEventListener('click',routeLink,true);
window.addEventListener('hashchange',sync);
window.addEventListener('load',sync);
})();