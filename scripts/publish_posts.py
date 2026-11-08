#!/usr/bin/env python3
"""将网站导出的文章草稿或完整备份合并为正式文章。"""
import argparse,json
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('backup',type=Path);p.add_argument('--output',type=Path,default=Path(__file__).resolve().parents[1]/'dist/content/posts.json');args=p.parse_args()
b=json.loads(args.backup.read_text(encoding='utf-8'))
if b.get('format')=='bee-posts-v1':posts=b.get('posts')
elif b.get('format')=='bee-library-v1':posts=json.loads(b.get('data',{}).get('bee_posts','[]'))
else:raise SystemExit('无法识别备份格式，请从网站导出文章或完整备份。')
if not isinstance(posts,list):raise SystemExit('文章数据必须是数组。')
clean=[]
for v in posts:
 if not isinstance(v,dict) or any(not isinstance(v.get(k),str) or not v[k].strip() for k in ['id','title','body']):raise SystemExit('文章缺少有效的 id、标题或正文。')
 clean.append({k:v.get(k,'') for k in ['id','title','body','date','category','summary']})
existing=json.loads(args.output.read_text(encoding='utf-8')) if args.output.exists() else []
merged={v['id']:v for v in existing}
for v in clean:merged[v['id']]=v
result=sorted(merged.values(),key=lambda x:x.get('date',''),reverse=True)
args.output.parent.mkdir(parents=True,exist_ok=True)
# Only replace the file after every article has passed validation.
tmp=args.output.with_suffix('.json.tmp');tmp.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');tmp.replace(args.output)
print(f'已合并 {len(clean)} 篇文章；正式文章共 {len(result)} 篇。输出：{args.output}')
