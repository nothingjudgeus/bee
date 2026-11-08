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
  artGrid.innerHTML=visibleArt.length?visibleArt.map((a,i)=>'<article class="art-tile"><button class="art-frame" type="button" data-view="'+i+'" aria-label="放大 '+esc(a.title)+'"><img src="'+esc(a.src)+'" alt="'+esc(a.artist)+'《'+esc(a.title)+'》" loading="lazy" referrerpolicy="no-referrer"></button><h3 class="art-title">'+esc(a.title)+'</h3><div class="art-meta"><span>'+esc(a.artist)+'</span><span>'+esc(a.year)+'</span></div><button class="art-choose'+(a.id===chosenArt?' selected':'')+'" type="button" data-set="'+esc(a.id)+'">'+(a.id===chosenArt?'当前书房封面':'设为书房封面')+'</button></article>').join(''):'<p class="empty-state">没有找到符合条件的画作，试试其他关键词。</p>';
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
function musicCard(t,i){
  const current=t.id===chosenTrack.id;
  return '<article class="music-card'+(current?' is-current':'')+'"><img src="'+esc(t.art)+'" alt="" loading="lazy"><div class="music-text"><span class="music-num">NO. '+String(i+1).padStart(2,'0')+'</span><h3>'+esc(t.title)+'</h3><p>'+esc(t.subtitle)+'</p></div><button class="music-play" data-music="'+t.id+'" aria-label="'+(current&&playing?'暂停':'试听')+esc(t.title)+'">'+(current&&playing?'Ⅱ':'▶')+'</button></article>';
}
function renderMusic(){
  $('#music-grid').innerHTML=tracks.map(musicCard).join('');
  $('#music-dock').hidden=false;
  $('#dock-title').textContent=chosenTrack.title;
  $('#dock-desc').textContent=chosenTrack.subtitle;
  $('#dock-art').src=chosenTrack.art;
  $('#dock-toggle').textContent=playing?'Ⅱ':'▶';
  $('#dock-toggle').setAttribute('aria-label',playing?'暂停':'播放');
}
const Audio=window.AudioContext||window.webkitAudioContext;
function note(midi,at,duration,gain,pad){
  if(!ctx||!master)return;
  const f=440*Math.pow(2,(midi-69)/12),timbre=chosenTrack.timbre;
  const wave=pad?'sine':timbre==='felt'?'triangle':timbre==='plucked'?'triangle':'sine';
  const harmonics=pad?[1,2]:timbre==='glass'?[1,2,3]:[1,2];
  harmonics.forEach((h,i)=>{
    const osc=ctx.createOscillator(),amp=ctx.createGain(),attack=pad?1.2:timbre==='felt'?.04:.012;
    osc.type=wave;osc.frequency.value=f*h;osc.detune.value=i?1:0;
    amp.gain.setValueAtTime(.00001,at);
    amp.gain.linearRampToValueAtTime(gain/(1+i*3),at+attack);
    amp.gain.exponentialRampToValueAtTime(.00001,at+duration);
    osc.connect(amp);amp.connect(master);
    osc.start(at);osc.stop(at+duration+.05);
    osc.onended=()=>{osc.disconnect();amp.disconnect()};
  });
}
function schedule(){
  if(!playing||!ctx||ctx.state!=='running')return;
  while(nextNote<ctx.currentTime+.45){
    const track=chosenTrack,chord=track.chords[Math.floor(noteStep/4)%track.chords.length];
    if(noteStep%4===0)chord.forEach(n=>note(n,nextNote,track.step*4+.3,.08,true));
    note(track.melody[noteStep%track.melody.length],nextNote,Math.min(track.step*2.3,6),.12,false);
    if(noteStep%2===0)note(chord[2]+12,nextNote+.52,track.step*1.5,.038,false);
    nextNote+=track.step;noteStep++;
  }
}
function stopAudio(){
  playing=false;
  if(timer){clearInterval(timer);timer=null}
  const old=ctx;ctx=null;master=null;
  if(old)old.close().catch(()=>{});
  write('bee_sound','off');renderMusic();
}
async function startAudio(){
  if(!Audio){$('#dock-desc').textContent='此浏览器不支持 Web Audio';return}
  if(ctx)stopAudio();
  try{
    ctx=new Audio();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    await ctx.resume();if(!ctx)return;
    master.gain.setTargetAtTime(Number($('#dock-volume').value)/100,ctx.currentTime,.15);
    playing=true;write('bee_sound','on');
    noteStep=0;nextNote=ctx.currentTime+.08;timer=setInterval(schedule,170);schedule();renderMusic();
  }catch{playing=false;renderMusic();$('#dock-desc').textContent='音频启动失败，请点击重试'}
}
function pickTrack(id){
  const track=tracks.find(t=>t.id===id);if(!track)return;
  if(track.id===chosenTrack.id&&playing){stopAudio();return}
  if(playing)stopAudio();
  chosenTrack=track;write('bee_music_choice',track.id);startAudio();renderMusic();
}
$('#music-grid').addEventListener('click',e=>{const b=e.target.closest('[data-music]');if(b)pickTrack(b.dataset.music)});
$('#dock-toggle').onclick=()=>playing?stopAudio():startAudio();
function moveTrack(n){const i=tracks.findIndex(t=>t.id===chosenTrack.id);pickTrack(tracks[(i+n+tracks.length)%tracks.length].id)}
$('#dock-prev').onclick=()=>moveTrack(-1);
$('#dock-next').onclick=()=>moveTrack(1);
$('#dock-volume').value=read('bee_volume','18');
$('#dock-volume').oninput=e=>{write('bee_volume',e.target.value);if(ctx&&master)master.gain.setTargetAtTime(Number(e.target.value)/100,ctx.currentTime,.1)};
document.addEventListener('visibilitychange',()=>{if(!ctx||!playing)return;if(document.hidden)ctx.suspend().catch(()=>{});else ctx.resume().then(()=>{nextNote=Math.max(nextNote,ctx.currentTime+.1);schedule()}).catch(()=>{})});
window.addEventListener('pagehide',()=>{if(timer)clearInterval(timer);if(ctx)ctx.close().catch(()=>{})});
renderFilters();renderArt();renderMusic();
showTab(location.hash==='#music'?'music':'art',false);
})();