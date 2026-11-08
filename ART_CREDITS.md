# 画作与声音

- Claude Monet, Grainstack in the Sunlight, Snow Effect, 1891. Museum Barberini, Hasso Plattner Collection. Public-domain reproduction via Wikimedia Commons. Source: https://commons.wikimedia.org/wiki/File:Claude_Monet_-_W_1287_-_Meule,_effet_de_neige,_soleil.jpg
- Vincent van Gogh, The Flowering Orchard, 1888. The Metropolitan Museum of Art, 56.13. Public Domain, Open Access. Source: https://www.metmuseum.org/art/collection/search/436527 . Image resized to WebP for web delivery; complete painting available in the viewer.
- 雪后: original procedural ambient score, synthesized in-browser with sine harmonics, a four-chord progression, and sparse bell notes. Not a recording of an existing song. No external audio service or audio tracking.

First visit asks the visitor to enable or disable music. Sound and motion preferences persist locally. A browser may require a fresh interaction after full-page navigation. Background tabs suspend audio. Keyboard Escape closes dialogs. Reduced-motion system preferences disable animation.

QA: JavaScript syntax checks; browser checks for first-visit chooser, playback state, mute, volume control presence, painting switching, full-image viewer and motion toggle. Audio playback state verified; subjective sound quality not audited by listening. No three-width automated inspector in managed browser environment.

Additional collection images, downloaded locally (Met Open Access / CC0 reproductions):
- Claude Monet, The Manneporte (Étretat), 1883. Met collection 437133. Reproduction: https://commons.wikimedia.org/wiki/File:The_Manneporte_(%C3%89tretat)_MET_DT1897.jpg ; image https://images.metmuseum.org/CRDImages/ep/web-large/DT1897.jpg
- Claude Monet, The Seine at Vétheuil, 1880. Met collection 437135. Image https://images.metmuseum.org/CRDImages/ep/web-large/DP-14201-035.jpg
- Vincent van Gogh, Roses, 1890. Met collection 436534. https://www.metmuseum.org/art/collection/search/436534 ; image https://images.metmuseum.org/CRDImages/ep/web-large/DP346475.jpg

The original exercise and reference images remain third-party educational source material. No blanket open-source or commercial redistribution license is granted for those materials. Review their source permissions before putting the repository or its exercise images in public distribution.

## 2026-11-08 · 画与声扩充馆

- 新增 33 幅芝加哥艺术博物馆（Art Institute of Chicago）馆藏作品目录，均根据官方 API 返回的 `is_public_domain=true` 和 `image_id` 登记；图片以该馆 IIIF 图像服务在线读取，不在此仓库重复存储。
- 原五幅莫奈/梵高画作沿用现有 `dist/assets/` 静态文件，来源见上方。
- 每幅外部馆藏画作保留作者、标题、年代和芝加哥艺术博物馆原作品链接；资料与官方 API 以其条款为准。图像来源：https://www.artic.edu 和 https://api.artic.edu/docs/ 。
- 音乐集共 12 首在浏览器 Web Audio 中实时合成的原创氛围乐曲（包括《雪后》），所有音符与配置均在 `dist/atelier-data.js`；没有第三方唱片录音或音乐文件，也没有复制受保护的录音。
- 作品/曲目设置只保存在当前浏览器，不涉及公开上传用户数据。外部图片需要互联网连接，后续如要离线打包需单独处理权利声明和资源。
