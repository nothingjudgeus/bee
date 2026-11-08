(()=>{'use strict';
const paint={monet:{src:'assets/monet-snow.jpg',title:'莫奈 · 阳光下的雪中麦垛，1891',source:'https://commons.wikimedia.org/wiki/File:Claude_Monet_-_W_1287_-_Meule,_effet_de_neige,_soleil.jpg'},vangogh:{src:'assets/vangogh-orchard.webp',title:'梵高 · 盛开的果园，1888',source:'https://www.metmuseum.org/art/collection/search/436527'}};
const safeGet=k=>{try{return localStorage.getItem(k)}catch{return null}},safeSet=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
const chosenPainting=(()=>{try{const v=JSON.parse(safeGet('bee_art_choice')||'null');return v&&typeof v.src==='string'&&typeof v.title==='string'&&typeof v.source==='string'?v:null}catch{return null}})();
if(chosenPainting)paint.user={src:chosenPainting.src,title:chosenPainting.title,source:chosenPainting.source};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let calm=safeGet('bee_motion')==='calm'||reduced.matches;
document.body.classList.toggle('calm-motion',calm);
const progress=document.createElement('div');progress.className='reading-progress';document.body.append(progress);
const controls=document.createElement('div');controls.className='sound-controls';
controls.innerHTML='<button id="sound-toggle" aria-pressed="false"><span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i></span><span id="sound-label">配乐关闭</span></button><a class="sound-library" href="atelier.html#music" title="切换长篇纯音乐">选曲 ↗</a><label for="sound-volume">音量</label><input type="range" id="sound-volume" aria-label="配乐音量" min="0" max="100" value="28"><button id="motion-toggle" aria-pressed="'+!calm+'">'+(calm?'动态关闭':'动态开启')+'</button>';
document.body.append(controls);
const toggle=document.getElementById('sound-toggle'),label=document.getElementById('sound-label'),volume=document.getElementById('sound-volume');
let engine=null;try{engine=window.parent.BEE_AUDIO}catch{}
// The shared parent player already provides music controls, including collapse / restore.
// Hide the legacy child audio toolbar to avoid two overlapping playback bars.
if(engine){controls.hidden=true;controls.style.display='none';}
function ui(){
 const state=engine?.getState();
 const playing=Boolean(state?.playing);
 controls.classList.toggle('is-playing',playing);
 toggle.setAttribute('aria-pressed',String(playing));
 label.textContent=playing?(state.track?.title||'音乐')+' · 播放中':'配乐关闭';
 if(state&&document.activeElement!==volume)volume.value=Math.round(state.volume*100);
}
const start=()=>engine?.play();
const stop=()=>engine?.pause();
toggle.onclick=()=>engine?.toggle();
volume.oninput=()=>engine?.setVolume(Number(volume.value)/100);
const unsubscribe=engine?.subscribe((type)=>{if(type!=='timeupdate')ui()});
if(unsubscribe)window.addEventListener('pagehide',unsubscribe,{once:true});
ui();
document.getElementById('motion-toggle').onclick=e=>{calm=!calm;safeSet('bee_motion',calm?'calm':'on');document.body.classList.toggle('calm-motion',calm);e.currentTarget.textContent=calm?'动态关闭':'动态开启';e.currentTarget.setAttribute('aria-pressed',String(!calm))};
const pref=safeGet('bee_sound');
if(pref===null&&!engine?.getState()?.hasStarted){
 const dialog=document.createElement('dialog');dialog.id='music-welcome';
 dialog.innerHTML='<h2>让书房有一点声音。</h2><p>选择钢琴组曲、幻想曲或协奏曲，让完整的演奏陪你阅读。</p><div class="welcome-actions"><button id="welcome-play">播放纯音乐</button><button id="welcome-silent">安静进入</button></div><p class="sound-note">在「画与声」可自由换曲。栏目切换不会打断正在播放的音乐。</p>';
 document.body.append(dialog);dialog.showModal();
 document.getElementById('welcome-play').onclick=()=>{dialog.close();start()};
 document.getElementById('welcome-silent').onclick=()=>{safeSet('bee_sound','off');dialog.close()};
 dialog.addEventListener('cancel',()=>safeSet('bee_sound','off'));
}
const viewer=document.createElement('dialog');viewer.id='art-viewer';viewer.innerHTML='<img alt=""><div class="art-viewer-footer"><span></span><a target="_blank" rel="noopener">馆藏与图像来源 ↗</a><button>关闭</button></div>';document.body.append(viewer);viewer.querySelector('button').onclick=()=>viewer.close();viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
document.addEventListener('click',e=>{let switcher=e.target.closest('[data-paint]');if(switcher){let stage=switcher.closest('.art-stage'),p=paint[switcher.dataset.paint],img=stage.querySelector('img');stage.dataset.art=switcher.dataset.paint;img.classList.remove('paint-change');img.src=p.src;img.alt=p.title;requestAnimationFrame(()=>img.classList.add('paint-change'));stage.querySelector('.art-credit').textContent=p.title;stage.querySelectorAll('[data-paint]').forEach(b=>b.setAttribute('aria-pressed',String(b===switcher)))}let enlarge=e.target.closest('.art-enlarge');if(enlarge){let key=enlarge.dataset.painting||enlarge.closest('.art-stage')?.dataset.art||'monet',p=paint[key];viewer.querySelector('img').src=p.src;viewer.querySelector('img').alt=p.title;viewer.querySelector('span').textContent=p.title+' · '+(key==='user'?'书房精选画作':key==='monet'?'巴贝里尼博物馆 · Public Domain':'The Met · Public Domain');viewer.querySelector('a').href=p.source;viewer.showModal()}});
let io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){if(!calm)e.target.classList.add('motion-enter');io.unobserve(e.target)}}),{threshold:.08});
function bind(){document.querySelectorAll('.section-head,.journal-row,.study-band>div,.study-band li,.art-pause>div,.about-strip>*,.chapter>a,.reading h2').forEach((el,i)=>{if(el.dataset.motionBound)return;el.dataset.motionBound='1';el.style.setProperty('--delay',(i%4)*60+'ms');io.observe(el)});let stage=document.querySelector('.art-stage');
if(stage&&paint.user&&!stage.dataset.galleryApplied){
  stage.dataset.galleryApplied='1';stage.dataset.art='user';
  const frame=stage.querySelector('.art-image');
  if(frame){frame.src=paint.user.src;frame.alt=paint.user.title;frame.onerror=()=>{frame.onerror=null;frame.src=paint.monet.src;stage.dataset.art='monet';stage.querySelector('.art-credit').textContent=paint.monet.title};}
  const credit=stage.querySelector('.art-credit');if(credit)credit.textContent=paint.user.title;
  stage.querySelectorAll('[data-paint]').forEach(b=>b.setAttribute('aria-pressed','false'));
}
if(stage&&!stage.dataset.tiltBound){stage.dataset.tiltBound='1';stage.addEventListener('pointermove',e=>{if(calm||e.pointerType!=='mouse')return;let r=stage.getBoundingClientRect();stage.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*3+'deg');stage.style.setProperty('--rx',-((e.clientY-r.top)/r.height-.5)*3+'deg')});stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--rx','0deg');stage.style.setProperty('--ry','0deg')})}}
const main=document.querySelector('#main')||document.querySelector('#app');if(main)new MutationObserver(bind).observe(main,{childList:true,subtree:true});bind();
let ticking=false;window.addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{let total=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(total>0?Math.min(1,scrollY/total):0)+')';ticking=false})},{passive:true});
})();
