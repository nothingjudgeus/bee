import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let failures=[];
for(const file of ['atlas.js','site.js','atmosphere.js','atlas-data.js','atelier-data.js','atelier.js','bee-frame.js','bee-audio.js','bee-session.js'])new vm.Script(fs.readFileSync(path.join(root,'dist',file),'utf8'),{filename:file});
const box={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'dist/atlas-data.js'),'utf8'),box);const d=box.window.ATLAS_DATA;
for(const key of ['modules','nodes','exercises']){let a=d[key];if(new Set(a.map(x=>x.id)).size!==a.length)failures.push('重复 id: '+key)}
const mods=new Set(d.modules.map(x=>x.id)),nodes=new Set(d.nodes.map(x=>x.id)),ex=new Set(d.exercises.map(x=>x.id));
for(const n of d.nodes){if(!mods.has(n.module))failures.push('未知章节 '+n.id);for(const id of n.exerciseIds||[])if(!ex.has(id))failures.push('未知题号 '+id)}
for(const e of d.exercises){if(!mods.has(e.module))failures.push('未知题目章节 '+e.id);for(const id of e.nodeIds||[])if(!nodes.has(id))failures.push('未知知识点 '+id);for(const f of [...(e.figureImages||[]),...(e.answerImages||[])])if(!fs.existsSync(path.join(root,'dist',f)))failures.push('缺少配图 '+f)}
for(const filename of ['study.html','index.html','atelier.html','shell.html']){const html=fs.readFileSync(path.join(root,'dist',filename),'utf8');for(const m of html.matchAll(/(?:src|href)=["']([^"'#]+)["']/g)){const url=m[1];if(/^(?:https?:|data:|mailto:|tel:)/.test(url))continue;const f=url.split(/[?#]/)[0];if(!fs.existsSync(path.join(root,'dist',f)))failures.push(filename+' 缺少 '+f)}}
const atelierBox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'dist/atelier-data.js'),'utf8'),atelierBox);
const collection=atelierBox.window.BEE_ATELIER;
if(!collection||!Array.isArray(collection.artworks)||!Array.isArray(collection.tracks))failures.push('画与声收藏馆缺少目录');
else{
  if(collection.artworks.length!==38||collection.tracks.length!==9)failures.push('画集或音乐集数量异常');
  for(const key of ['artworks','tracks'])if(new Set(collection[key].map(x=>x.id)).size!==collection[key].length)failures.push('画与声目录 id 重复 '+key);
  for(const art of collection.artworks){if(!art.src||!art.title||!art.source)failures.push('画作资料不完整 '+art.id);if(art.src?.startsWith('assets/')&&!fs.existsSync(path.join(root,'dist',art.src)))failures.push('缺少画作 '+art.src)}
  for(const music of collection.tracks){
    if(!music.title||!music.composer||!music.performer||!music.source||!music.license||!music.licenseUrl||!(music.seconds>=600))failures.push('长篇录音资料不完整 '+music.id);
    const parts=music.parts?.length?music.parts:[{src:music.src,seconds:music.seconds}];
    if(!parts.length||parts.some(p=>!p.src?.startsWith('https://')||!(p.seconds>0)))failures.push('录音源或时长无效 '+music.id);
  }
}
const posts=JSON.parse(fs.readFileSync(path.join(root,'dist/content/posts.json'),'utf8'));if(!Array.isArray(posts))failures.push('正式文章必须为数组');else for(const p of posts)if(!p.id||!p.title||typeof p.body!=='string')failures.push('文章字段错误');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`检查通过：${d.modules.length} 章 / ${d.nodes.length} 方法 / ${d.exercises.length} 题；脚本语法、题目关联和本地配图正常。`);
