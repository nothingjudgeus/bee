(()=>{'use strict';
const tracks=window.BEE_ATELIER?.tracks||[];
const lookup=id=>tracks.find(t=>t.id===id)||tracks[0];
const stored=(key,def)=>{try{return localStorage.getItem(key)??def}catch{return def}};
const store=(key,value)=>{try{localStorage.setItem(key,String(value))}catch{}};
const audio=new Audio();audio.preload='metadata';
let track=lookup(stored('bee_music_choice',''));
let partIndex=0,seekPending=null,autoplayPending=false,looping=stored('bee_music_loop','false')==='true';
let error='',hasStarted=false;
const listeners=new Set();
let notifyTimer=0;
const pieces=()=>track?.parts?.length?track.parts:[{src:track?.src,seconds:track?.seconds,title:track?.title}];
const offset=index=>pieces().slice(0,index).reduce((n,p)=>n+Number(p.seconds||0),0);
const elapsed=()=>offset(partIndex)+(Number.isFinite(audio.currentTime)?audio.currentTime:0);
const getState=()=>({
 track,trackId:track?.id||'',playing:!audio.paused&&!audio.ended&&!error,
 paused:audio.paused,elapsed:elapsed(),total:Number(track?.seconds||0),volume:audio.volume,
 partIndex,looping,error,hasStarted
});
const emit=type=>{const state=getState();for(const fn of [...listeners]){try{fn(type,state)}catch(e){console.warn('Bee player listener:',e)}};renderMini(state)};
function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
audio.volume=Math.max(0,Math.min(1,(Number(stored('bee_volume','28'))||28)/100));
function setPart(index,position=0,play=false){
 const list=pieces();if(!list[index]?.src)return;
 partIndex=index;seekPending=Math.max(0,position);autoplayPending=play;
 audio.src=list[index].src;audio.load();
 emit('track');
 if(play)requestPlay();
}
function requestPlay(){
 if(!track){error='暂无音源';emit('error');return Promise.resolve(false)}
 if(!audio.src){setPart(partIndex,0,false)}
 error='';hasStarted=true;
 const result=audio.play();
 result?.then(()=>{store('bee_sound','on');emit('play')}).catch(()=>{
   error='音乐源暂不可用，请尝试其他曲目';
   store('bee_sound','off');emit('error');
 });
 return result;
}
function play(){if(!audio.src)setPart(0,0,false);return requestPlay()}
function pause(){autoplayPending=false;audio.pause();store('bee_sound','off');emit('pause')}
function toggle(){if(audio.paused||audio.ended)return play();return pause()}
function choose(id,shouldPlay=true){
 const next=lookup(id);if(!next)return;
 if(track?.id===next.id){if(shouldPlay)return toggle();return}
 audio.pause();error='';track=next;partIndex=0;store('bee_music_choice',next.id);
 setPart(0,0,shouldPlay);if(!shouldPlay)emit('track');
}
function skip(n){
 const i=tracks.findIndex(t=>t.id===track?.id);
 const next=tracks[(i+n+tracks.length)%tracks.length];if(!next)return;
 audio.pause();track=next;partIndex=0;error='';store('bee_music_choice',next.id);
 setPart(0,0,true);
}
function seek(seconds){
 const total=Number(track?.seconds||0);
 let remaining=Math.min(Math.max(0,Number(seconds)||0),Math.max(0,total-.25));
 const all=pieces();let index=0;
 while(index<all.length-1&&remaining>=Number(all[index].seconds)){remaining-=Number(all[index].seconds);index++}
 if(index===partIndex&&audio.src){try{audio.currentTime=remaining}catch{seekPending=remaining}}
 else setPart(index,remaining,!audio.paused);
 emit('timeupdate');
}
function setVolume(v){
 audio.volume=Math.max(0,Math.min(1,Number(v)||0));store('bee_volume',Math.round(audio.volume*100));
 emit('volume');
}
function setLoop(value){looping=Boolean(value);store('bee_music_loop',String(looping));emit('loop')}
audio.addEventListener('loadedmetadata',()=>{
 if(seekPending!==null){
   const pos=Math.min(seekPending,Math.max(0,(audio.duration||0)-.2));
   seekPending=null;try{audio.currentTime=pos}catch{}
 }
 if(autoplayPending){autoplayPending=false;if(audio.paused)requestPlay()}
 emit('metadata');
});
audio.addEventListener('timeupdate',()=>emit('timeupdate'));
audio.addEventListener('play',()=>{hasStarted=true;store('bee_sound','on');emit('play')});
audio.addEventListener('pause',()=>emit('pause'));
audio.addEventListener('ended',()=>{
 if(partIndex+1<pieces().length){setPart(partIndex+1,0,true);return}
 if(looping){setPart(0,0,true);return}
 skip(1);
});
audio.addEventListener('error',()=>{error='音源加载失败，请选择其他曲目';autoplayPending=false;emit('error')});
window.BEE_AUDIO={audio,getState,subscribe,play,pause,toggle,choose,skip,seek,setVolume,setLoop,refreshMini:()=>renderMini(getState())};
const $=selector=>document.querySelector(selector);
const mini=$('#bee-mini-player');
const fmt=t=>{const n=Math.max(0,Math.floor(Number(t)||0)),m=Math.floor(n/60),s=String(n%60).padStart(2,'0');return m>=60?Math.floor(m/60)+':'+String(m%60).padStart(2,'0')+':'+s:m+':'+s};
let lastId='';
function renderMini(state){
 if(!mini)return;
 const showing=state.hasStarted&&(window.BEE_SHELL?.currentArea!=='atelier'||window.BEE_SHELL?.currentSection!=='music');
 mini.hidden=!showing;
 document.body.classList.toggle('bee-has-mini',showing);
 if(!showing)return;
 const name=$('#bee-mini-title'),playBtn=$('#bee-mini-toggle'),progress=$('#bee-mini-progress');
 if(state.trackId!==lastId){name.textContent=state.track?.title||'未选择音乐';lastId=state.trackId;}
 playBtn.textContent=state.playing?'Ⅱ':'▶';
 playBtn.setAttribute('aria-label',state.playing?'暂停':'播放');
 $('#bee-mini-current').textContent=fmt(state.elapsed);
 $('#bee-mini-total').textContent=fmt(state.total);
 if(document.activeElement!==progress){progress.max=Math.max(1,state.total);progress.value=Math.min(state.elapsed,state.total)}
}
$('#bee-mini-toggle').onclick=toggle;
$('#bee-mini-prev').onclick=()=>skip(-1);
$('#bee-mini-next').onclick=()=>skip(1);
$('#bee-mini-progress').onchange=e=>seek(Number(e.target.value));
$('#bee-mini-title').onclick=()=>window.BEE_SHELL?.navigate('atelier.html#music');
window.addEventListener('pagehide',()=>audio.pause());
renderMini(getState());
// Optional diagnostics for verifying actual HTMLAudioElement playback; hidden during normal use.
if(new URLSearchParams(location.search).has('diag')){
 const panel=document.createElement('pre');panel.id='bee-audio-diagnostics';
 Object.assign(panel.style,{position:'fixed',top:'6px',right:'6px',zIndex:'9999',background:'#101923e9',color:'#e9f0ff',font:'11px/1.4 monospace',padding:'12px',width:'380px',maxHeight:'360px',overflow:'auto',whiteSpace:'pre-wrap',pointerEvents:'none'});
 document.body.append(panel);
 const recent=[];
 for(const event of ['loadstart','loadedmetadata','loadeddata','canplay','playing','play','pause','waiting','stalled','suspend','timeupdate','error','emptied','seeked']){
  audio.addEventListener(event,()=>{if(event!=='timeupdate'){recent.push(event);if(recent.length>12)recent.shift()}});
 }
 setInterval(()=>{
  const st=getState();
  panel.textContent=JSON.stringify({track:st.trackId,elapsed:st.elapsed,playing:st.playing,paused:audio.paused,readyState:audio.readyState,networkState:audio.networkState,audioError:audio.error?.code??null,audioErrorMessage:audio.error?.message??null,partIndex,src:audio.currentSrc.slice(0,160),shellRoute:location.hash,visibility:document.visibilityState,events:recent},null,2);
 },450);
}
})();