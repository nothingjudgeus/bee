# Bee · 雪霁书房 — 完整运营源码

数学书房 + 个人博客的完整静态网站，包含 12 章、67 个方法、74 道题、原解析与配图、可编辑知识图谱、五步方法训练、复盘、文章草稿和备份。新版采用暖纸色与墨色、文字分支图谱、油画穿插和可关闭配乐。无需付费框架或安装前端依赖。

**从这里开始：** [中文运营手册](docs/运营手册.md) · [源码编辑地图](docs/源码编辑地图.md) · [部署与迁移](docs/部署与迁移.md)

## 立即运行

安装 Python 3 后，Windows 双击 `start-windows.bat`；macOS/Linux 运行 `sh start-macos-linux.sh`。会打开 `http://localhost:8080/`。保持终端开启，Ctrl+C 停止。也可运行 `python3 scripts/serve.py --port 8081` 更换端口。

`dist/` 是完整网站目录，可直接放到任意静态服务器。请通过 HTTP 服务预览，直接双击 HTML 会限制正式文章 JSON 的读取。

## 上传 GitHub 并发布

把此项目的**全部文件**上传到你的仓库根目录，包括 `.github/workflows/deploy.yml`，不要只上传压缩包。仓库默认分支使用 `main`。仓库 Settings → Pages → Source 选择 GitHub Actions；在 Actions 运行 Publish Bee website。成功后 Pages 页面显示网址。之后每次推送 main 会重新发布。

网站发布的是 `dist/`，源码、维护脚本、文档不作为网页发布。项目地址下的资源使用相对路径，也兼容 GitHub Pages 的仓库子路径。未绑定你的 GitHub 账号，也没有代替你创建仓库或修改权限。

## 修改内容

| 要修改 | 文件 |
|---|---|
| 主页、导航、页脚 | `dist/index.html`、`dist/site.js` |
| 主站颜色、字体、布局 | `dist/site.css` |
| 数学页面、图谱、训练逻辑 | `dist/atlas.js` |
| 题目、解析、章节、方法内容 | `dist/atlas-data.js` |
| 数学样式 | `dist/study.css`，结构样式在 `dist/study-base.css` |
| 正式博客文章 | `dist/content/posts.json` |
| 油画、题图 | `dist/assets/` |
| 配乐、动态、首次选择 | `dist/atmosphere.js`、`dist/atmosphere.css` |

正式文章与本地草稿分开：在网站“写一页”写好后导出文章备份，再运行 `python3 scripts/publish_posts.py 备份文件.json`，提交更新后的 `dist/content/posts.json` 即可发布。

## 检查

安装 Node.js 22 或较新版本后运行 `node scripts/validate.mjs`（或 `npm run check`）。不需要 `npm install`。自动发布也会先检查脚本语法、题目与知识点关联、配图及文章 JSON。

## 数据与实际能力

这是可独立运营的**静态站**，没有服务端账号、数据库、跨设备自动同步、公共后台或自动识题。源码、资源与发布配置均可编辑，不依赖原 ChatGPT 托管。学习记录与草稿存在访客浏览器，通过导出/导入手工迁移；你的浏览器个人记录不会自动包含在这个源码包里。

现有数学内容来自原积分图谱，本次主要是界面与交付工程调整，没有重新逐题审核所有数学答案。艺术资源和原资料的授权范围见 `ART_CREDITS.md` 与 `NOTICE.md`。

## 联系

Bee：nothingjudgeus@gmail.com
