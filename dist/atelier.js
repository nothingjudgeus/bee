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
  // The full-screen artwork viewer belongs to the iframe; the persistent
  // music UI belongs to the parent shell. Hide only its controls while viewing.
  try{window.parent.document.body.classList.add('bee-art-viewer-open')}catch{}
}
filterLine.addEventListener('click',e=>{const btn=e.target.closest('[data-artist]');if(!btn)return;activeArtist=btn.dataset.artist;renderFilters();renderArt()});
artSearch.addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderArt()});
artGrid.addEventListener('click',e=>{const view=e.target.closest('[data-view]'),pick=e.target.closest('[data-set]');if(view)showArtwork(Number(view.dataset.view));if(pick)chooseArt(pick.dataset.set)});
$('#art-viewer').addEventListener('close',()=>{
  try{window.parent.document.body.classList.remove('bee-art-viewer-open')}catch{}
});
window.addEventListener('pagehide',()=>{
  try{window.parent.document.body.classList.remove('bee-art-viewer-open')}catch{}
});
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
  if(updateUrl){history.replaceState(null,'',art?'#art':'#music');try{window.parent.BEE_SHELL?.sync(location.href)}catch{}}
}
$('#tab-art').onclick=()=>showTab('art');
$('#tab-music').onclick=()=>showTab('music');
window.addEventListener('hashchange',()=>showTab(location.hash==='#music'?'music':'art',false));
let engine=null;try{engine=window.parent.BEE_AUDIO}catch{}
const state=()=>engine?.getState()||{track:chosenTrack,trackId:chosenTrack.id,playing:false,volume:.28,elapsed:0,total:chosenTrack.seconds,looping:false};
let dragging=false;
const fmt=v=>{const n=Math.max(0,Math.floor(Number(v)||0)),m=Math.floor(n/60),sec=String(n%60).padStart(2,'0');return m>=60?Math.floor(m/60)+':'+String(m%60).padStart(2,'0')+':'+sec:m+':'+sec};
function musicCard(t,i){
 const current=state(),active=t.id===current.trackId,playing=active&&current.playing;
 return '<article role="listitem" class="music-card'+(active?' is-current':'')+'">'+
  '<span class="music-num">'+String(i+1).padStart(2,'0')+'</span>'+
  '<div class="music-text"><h3>'+esc(t.title)+'</h3><p>'+esc(t.composer)+' · '+esc(t.performer)+'</p>'+
  '<div class="music-detail-line"><span>'+esc(t.genre)+'</span>'+
  '<a class="music-license" href="'+esc(t.source)+'" target="_blank" rel="noopener noreferrer">演奏来源 ↗</a>'+
  '<a class="music-license" href="'+esc(t.licenseUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(t.license)+'</a></div></div>'+
  '<div class="music-action"><span class="music-duration">'+fmt(t.seconds)+'</span>'+
  '<button class="music-play" type="button" data-music="'+esc(t.id)+'" aria-label="'+(playing?'暂停 ':'播放 ')+esc(t.title)+'">'+(playing?'Ⅱ':'▶')+'</button></div></article>';
}
function updateProgress(){
 const now=state(),total=Number(now.total||0);
 $('#dock-elapsed').textContent=fmt(now.elapsed);
 $('#dock-total').textContent=fmt(total);
 if(!dragging){const bar=$('#dock-progress');bar.max=Math.max(1,total);bar.value=Math.min(total,now.elapsed)}
}
function renderMusic(){
 const now=state();chosenTrack=now.track||tracks[0];
 const minimized=Boolean(now.minimized);
 $('.music-studio').classList.toggle('is-player-collapsed',minimized);
 $('#music-panel-restore').hidden=!minimized;
 $('#music-grid').innerHTML=tracks.map(musicCard).join('');
 $('#music-dock').hidden=false;
 $('#dock-title').textContent=chosenTrack.title;
 $('#dock-desc').textContent=now.error||chosenTrack.performer;
 $('#dock-art').src=chosenTrack.art;
 $('#feature-art').src=chosenTrack.art;
 $('#feature-art').alt='选中曲目的画作封面：'+chosenTrack.title;
 $('#feature-number').textContent='NO. '+String(tracks.findIndex(t=>t.id===chosenTrack.id)+1).padStart(2,'0');
 $('#dock-toggle').textContent=now.playing?'Ⅱ':'▶';
 $('#dock-toggle').setAttribute('aria-label',now.playing?'暂停':'播放');
 $('#dock-source').href=chosenTrack.source;
 $('#dock-license').textContent=chosenTrack.license;$('#dock-license').href=chosenTrack.licenseUrl;
 $('#dock-volume').value=Math.round(now.volume*100);
 $('#dock-loop').setAttribute('aria-pressed',String(now.looping));
 $('#dock-loop').title=now.looping?'单曲循环开启':'播放完继续下一首';
 updateProgress();
}
$('#music-grid').addEventListener('click',e=>{const button=e.target.closest('[data-music]');if(button)engine?.choose(button.dataset.music,true)});
$('#dock-toggle').onclick=()=>engine?.toggle();
$('#dock-prev').onclick=()=>engine?.skip(-1);
$('#dock-next').onclick=()=>engine?.skip(1);
$('#dock-volume').oninput=e=>engine?.setVolume(Number(e.target.value)/100);
$('#dock-progress').addEventListener('input',e=>{dragging=true;$('#dock-elapsed').textContent=fmt(e.target.value)});
$('#dock-progress').addEventListener('change',e=>{dragging=false;engine?.seek(Number(e.target.value));updateProgress()});
$('#dock-loop').onclick=()=>engine?.setLoop(!state().looping);
const unsubscribe=engine?.subscribe((type)=>{
 if(type==='timeupdate'){updateProgress();return}
 if(type==='volume'&&document.activeElement===$('#dock-volume'))return;
 renderMusic();
});
if(unsubscribe)window.addEventListener('pagehide',unsubscribe,{once:true});
$('#music-panel-collapse').onclick=()=>engine?.setMiniCollapsed(true);
$('#music-panel-restore').onclick=()=>engine?.setMiniCollapsed(false);
$('#player-host').appendChild($('#music-dock'));
$('#search-open').onclick=()=>{showTab('art');window.scrollTo({top:Math.max(0,$('#section-art').getBoundingClientRect().top+scrollY-22),behavior:'smooth'});setTimeout(()=>$('#art-search').focus(),120)};
renderFilters();renderArt();renderMusic();
showTab(location.hash==='#music'?'music':'art',false);
})();