#!/usr/bin/env python3
"""本地预览；只监听本机，不是后台管理服务器。"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import argparse, webbrowser
parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8080);parser.add_argument('--no-open',action='store_true');args=parser.parse_args()
root=Path(__file__).resolve().parents[1]/'dist'
server=ThreadingHTTPServer(('127.0.0.1',args.port),partial(SimpleHTTPRequestHandler,directory=str(root)))
url=f'http://localhost:{args.port}/';print('Bee 本地预览：'+url,flush=True)
if not args.no_open:webbrowser.open(url)
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
