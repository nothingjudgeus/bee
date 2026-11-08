(()=>{
'use strict';
const library=window.BEE_ATELIER;
if(!library)return;
const artworks=library.artworks,tracks=library.tracks;
const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const read=(k,f)=>{try{return localStorage.getItem(k)??f}catch{return f}};
const write=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
let activeArtist='全部',query='',visibleArt=[...artworks],viewIndex=0;
let chosenArt=read('bee_art_choice','');
try{chosenArt=JSON.parse(chosenArt)?.id||''}catch{chosenArt=''}
let chosenTrack=tracks.find(t=>t.id===read('bee_music_choice',''))||tracks[0];
let playing=false,ctx=null,master=null,timer=null,nextNote=0,noteStep=0;
const artGrid=$('#art-grid'),artSearch=$('#art-search'),artCount=$('#art-count');
const filterLine=$('#art-filter'),banner=$('#selected-art-banner');
function renderFilters(){
  filterLine.innerHTML=['全部','莫奈','莫里索','毕沙罗','卡萨特','梵高'].map(x=>'<button type="button" data-artist="'+x+'" class="'+(x===activeArtist?'active':'')+'" aria-pressed="'+(x===activeArtist)+'">'+x+'</button>').join('');
}
function renderArt(){
  visibleArt=artworks.filter(a=>(activeArtist==='全部'||a.artist===activeArtist)&&(!query||(a.title+' '+a.artist+' '+a.year).toLowerCase().includes(query)));
  artCount.textContent=visibleArt.length;
  artGrid.innerHTML=visibleArt.length?visibleArt.map((a,i)=>
    '<article class="art-tile"><button class="art-frame" type="button" data-view="'+i+'" aria-label="放大 '+esc(a.title)+'"><img src="'+esc(a.src)+'" alt="'+esc(a.artist)+'《'+esc(a.title)+'》" loading="lazy" decoding="async" referrerpolicy="no-referrer"></button>'+
    '<div class="art-details"><div class="art-meta"><span>'+esc(a.artist)+'</span><span>'+esc(a.year)+'</span></div>'+
    '<h3 class="art-title">'+esc(a.title)+'</h3>'+
    '<button class="art-choose'+(a.id===chosenArt?' selected':'')+'" type="button" data-set="'+esc(a.id)+'">'+(a.id===chosenArt?'已选为首页封面':'设为首页封面 ↗')+'</button></div></article>'
  ).join(''):'<p class="empty-state">没有找到符合条件的画作，试试其他关键词。</p>';
  updateBanner();
}
function updateBanner(){
  const art=artworks.find(a=>a.id===chosenArt);
  if(!art){banner.hidden=true;return}
  banner.hidden=false;
  banner.innerHTML='已为书房选择：<strong>'+esc(art.artist)+' · '+esc(art.title)+'</strong> <a href="index.html#/home">返回书房查看 ↗</a>';
}
function chooseArt(id){
  const a=artworks.find(x=>x.id===id);if(!a)return;
  chosenArt=id;
  write('bee_art_choice',JSON.stringify({id:a.id,src:a.src,title:a.artist+' · '+a.title,artist:a.artist,source:a.source,year:a.year}));
  renderArt();
  if($('#art-viewer').open)$('#viewer-choose').textContent='已设为书房封面 ✓';
}
function showArtwork(i){
  if(i<0||i>=visibleArt.length)return;
  viewIndex=i;
  const a=visibleArt[i],modal=$('#art-viewer'),img=$('#viewer-image');
  $('#viewer-index').textContent='WORK '+String(i+1).padStart(2,'0')+' / '+String(visibleArt.length).padStart(2,'0');
  img.src=a.src;img.alt=a.artist+' · '+a.title;
  $('#viewer-artist').textContent=a.artist;
  $('#viewer-title').textContent=a.title;
  $('#viewer-year').textContent=a.year+' · '+a.credit;
  $('#viewer-source').href=a.source;
  $('#viewer-choose').textContent=a.id===chosenArt?'已设为书房封面 ✓':'设为书房封面';
  if(!modal.open)modal.showModal();
}
filterLine.addEventListener('click',e=>{const btn=e.target.closest('[data-artist]');if(!btn)return;activeArtist=btn.dataset.artist;renderFilters();renderArt()});
artSearch.addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderArt()});
artGrid.addEventListener('click',e=>{const view=e.target.closest('[data-view]'),pick=e.target.closest('[data-set]');if(view)showArtwork(Number(view.dataset.view));if(pick)chooseArt(pick.dataset.set)});
$('#viewer-close').onclick=()=>$('#art-viewer').close();
$('#viewer-prev').onclick=()=>showArtwork((viewIndex-1+visibleArt.length)%visibleArt.length);
$('#viewer-next').onclick=()=>showArtwork((viewIndex+1)%visibleArt.length);
$('#viewer-choose').onclick=()=>chooseArt(visibleArt[viewIndex].id);
$('#art-viewer').addEventListener('click',e=>{if(e.target===$('#art-viewer'))$('#art-viewer').close()});
document.addEventListener('keydown',e=>{if(!$('#art-viewer').open)return;if(e.key==='ArrowLeft')showArtwork((viewIndex-1+visibleArt.length)%visibleArt.length);if(e.key==='ArrowRight')showArtwork((viewIndex+1)%visibleArt.length)});
function showTab(tab,updateUrl=true){
  const art=tab!=='music';
  $('#tab-art').setAttribute('aria-selected',String(art));
  $('#tab-music').setAttribute('aria-selected',String(!art));
  $('#section-art').hidden=!art;
  $('#section-music').hidden=art;
  if(updateUrl)history.replaceState(null,'',art?'#art':'#music');
}
$('#tab-art').onclick=()=>showTab('art');
$('#tab-music').onclick=()=>showTab('music');
window.addEventListener('hashchange',()=>showTab(location.hash==='#music'?'music':'art',false));
const audio=new Audio();
audio.preload='metadata';
let partIndex=0,seekPending=null,playWanted=false,dragging=false,playError='';
let looping=false;
const totalSeconds=t=>Number(t.seconds||0);
const fmt=v=>{const n=Math.max(0,Math.floor(Number(v)||0));return Math.floor(n/3600)?Math.floor(n/3600)+':'+String(Math.floor(n%3600/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0'):Math.floor(n/60)+':'+String(n%60).padStart(2,'0')};
const parts=t=>t.parts?.length?t.parts:[{src:t.src,seconds:t.seconds,title:t.title}];
const beforePart=(i)=>parts(chosenTrack).slice(0,i).reduce((s,p)=>s+Number(p.seconds||0),0);
const elapsed=()=>beforePart(partIndex)+(Number.isFinite(audio.currentTime)?audio.currentTime:0);
function musicCard(t,i){
  const active=t.id===chosenTrack.id,play=active&&!audio.paused&&!audio.ended;
  return '<article role="listitem" class="music-card'+(active?' is-current':'')+'">'+
    '<span class="music-num">'+String(i+1).padStart(2,'0')+'</span>'+
    '<div class="music-text"><h3>'+esc(t.title)+'</h3><p>'+esc(t.composer)+' · '+esc(t.performer)+'</p>'+
    '<div class="music-detail-line"><span>'+esc(t.genre)+'</span>'+
    '<a class="music-license" href="'+esc(t.source)+'" target="_blank" rel="noopener noreferrer">演奏来源 ↗</a>'+
    '<a class="music-license" href="'+esc(t.licenseUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(t.license)+'</a></div></div>'+
    '<div class="music-action"><span class="music-duration">'+fmt(t.seconds)+'</span>'+
    '<button class="music-play" type="button" data-music="'+esc(t.id)+'" aria-label="'+(play?'暂停 ':'播放 ')+esc(t.title)+'">'+(play?'Ⅱ':'▶')+'</button></div></article>';
}
function renderMusic(){
  $('#music-grid').innerHTML=tracks.map(musicCard).join('');
  $('#music-dock').hidden=false;
  $('#dock-title').textContent=chosenTrack.title;
  $('#dock-desc').textContent=playError||chosenTrack.performer;
  $('#dock-art').src=chosenTrack.art;
  $('#feature-art').src=chosenTrack.art;
  $('#feature-art').alt='选中曲目的画作封面：'+chosenTrack.title;
  $('#feature-number').textContent='NO. '+String(tracks.findIndex(t=>t.id===chosenTrack.id)+1).padStart(2,'0');
  $('#dock-toggle').textContent=!audio.paused?'Ⅱ':'▶';
  $('#dock-toggle').setAttribute('aria-label',audio.paused?'播放':'暂停');
  $('#dock-source').href=chosenTrack.source;
  $('#dock-license').textContent=chosenTrack.license;$('#dock-license').href=chosenTrack.licenseUrl;
  updateProgress();
}
function updateProgress(){
  let n=totalSeconds(chosenTrack);
  $('#dock-total').textContent=fmt(n);
  $('#dock-elapsed').textContent=fmt(elapsed());
  if(!dragging){$('#dock-progress').max=n||1;$('#dock-progress').value=Math.min(n,elapsed());}
}
function setPart(i,position=0,continuePlaying=false){
  const list=parts(chosenTrack);
  if(i<0||i>=list.length)return;
  partIndex=i;
  seekPending=Math.max(0,position);
  playWanted=continuePlaying;
  audio.src=list[i].src;
  audio.load();
  updateProgress();
}
function setTrack(track,play=false){
  if(!track)return;
  audio.pause();
  chosenTrack=track;write('bee_music_choice',track.id);playError='';
  setPart(0,0,play);
  if(!play)renderMusic();
}
async function startPlayback(){
  playError='';
  try{if(!audio.src)setPart(partIndex,0,false);await audio.play();write('bee_sound','on');renderMusic();}
  catch(e){playError='音源暂不可播放，请查看原始演奏链接';write('bee_sound','off');renderMusic();}
}
function pausePlayback(){playWanted=false;audio.pause();write('bee_sound','off');renderMusic();}
function chooseTrack(id){
  const t=tracks.find(x=>x.id===id);
  if(!t)return;
  if(t.id===chosenTrack.id){audio.paused?startPlayback():pausePlayback();return;}
  setTrack(t,true);renderMusic();
}
function moveTrack(delta){const idx=tracks.findIndex(t=>t.id===chosenTrack.id);setTrack(tracks[(idx+delta+tracks.length)%tracks.length],true);renderMusic();}
audio.addEventListener('loadedmetadata',()=>{
  if(seekPending!==null){const pos=Math.max(0,Math.min(seekPending,Math.max(0,(audio.duration||0)-.15)));seekPending=null;try{audio.currentTime=pos}catch{}}
  if(playWanted){playWanted=false;startPlayback()}
  updateProgress();
});
audio.addEventListener('timeupdate',updateProgress);
audio.addEventListener('play',()=>{write('bee_sound','on');renderMusic()});
audio.addEventListener('pause',()=>{renderMusic()});
audio.addEventListener('ended',()=>{
  if(partIndex+1<parts(chosenTrack).length){setPart(partIndex+1,0,true);return}
  if(looping){setPart(0,0,true);return}
  moveTrack(1);
});
audio.addEventListener('error',()=>{
  playError='音源加载失败 · 可点击来源链接试听';
  playWanted=false;renderMusic();
});
$('#music-grid').addEventListener('click',e=>{const b=e.target.closest('[data-music]');if(b)chooseTrack(b.dataset.music)});
$('#dock-toggle').onclick=()=>audio.paused?startPlayback():pausePlayback();
$('#dock-prev').onclick=()=>moveTrack(-1);
$('#dock-next').onclick=()=>moveTrack(1);
$('#dock-volume').value=read('bee_volume','28');
audio.volume=Math.max(0,Math.min(1,Number($('#dock-volume').value)/100));
$('#dock-volume').oninput=e=>{write('bee_volume',e.target.value);audio.volume=Math.max(0,Math.min(1,Number(e.target.value)/100))};
$('#dock-progress').addEventListener('input',e=>{dragging=true;$('#dock-elapsed').textContent=fmt(e.target.value)});
$('#dock-progress').addEventListener('change',e=>{
  dragging=false;const t=Math.max(0,Number(e.target.value)||0);const list=parts(chosenTrack);
  let remainder=t,i=0;while(i<list.length-1&&remainder>=Number(list[i].seconds)){remainder-=Number(list[i].seconds);i++;}
  if(i===partIndex){try{audio.currentTime=remainder}catch{}}
  else{setPart(i,remainder,!audio.paused)}
  updateProgress();
});
$('#dock-loop').onclick=()=>{looping=!looping;$('#dock-loop').setAttribute('aria-pressed',String(looping));$('#dock-loop').title=looping?'当前作品循环':'播放下一首';};
window.addEventListener('pagehide',()=>{audio.pause();audio.removeAttribute('src');audio.load()});
if(read('bee_sound','off')==='on')write('bee_sound','off');
$('#player-host').appendChild($('#music-dock'));
$('#search-open').onclick=()=>{showTab('art');window.scrollTo({top:Math.max(0,$('#section-art').getBoundingClientRect().top+scrollY-22),behavior:'smooth'});setTimeout(()=>$('#art-search').focus(),120)};
renderFilters();renderArt();renderMusic();
showTab(location.hash==='#music'?'music':'art',false);
})();