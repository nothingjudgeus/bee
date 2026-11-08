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

## 2026-11-08 · 真实长篇器乐演奏更新

原有的 12 首浏览器程序化氛围乐曲现已从默认播放列表中替换为 9 套实际录音；这段历史记录保留用于解释之前版本。网站通过外部托管服务器播放，未将录音文件重新上传到 GitHub。

- 巴赫《哥德堡变奏曲》全套约 82 分钟；Kimiko Ishizaka 钢琴，Open Goldberg Variations，CC0 1.0：https://archive.org/details/The_Open_Goldberg_Variations-11823
- 巴赫《第三英国组曲》约 19:05；Radek Materka 钢琴，CC0：https://commons.wikimedia.org/wiki/File:J._S._Bach_-_English_Suite_no._3,_BWV_808.ogg
- 肖邦《f 小调幻想曲》约 12:19；Luke Faulkner 钢琴，CC0：https://commons.wikimedia.org/wiki/File:Chopin-fantasy-op.49-in-f-minor.ogg
- 肖邦《g 小调第一叙事曲》约 10:14；Frank Lévy 钢琴，CC BY 4.0（署名）：https://commons.wikimedia.org/wiki/File:Chopin_Ballade_no._1_in_G_minor,_Op._23_Frank_L%C3%A9vy.mp3
- 肖邦《第四谐谑曲》约 10:49；Alice Gi-Young Hwang 钢琴，CC0：https://commons.wikimedia.org/wiki/File:Chopin_Scherzo_no._4_in_E_major,_Op._54,_Alice_Gi-Young_Hwang.ogg
- 肖邦《第一钢琴协奏曲》第一乐章约 19:35；钢琴与弦乐四重奏版本，CC0：https://commons.wikimedia.org/wiki/File:Chopin_-_Piano_Concerto_no._1,_Op._11_(string_quartet)-1.ogg
- 舒曼《a 小调钢琴协奏曲》第二、三乐章约 14:47；CC0：https://commons.wikimedia.org/wiki/File:Schumann_-_Piano_Concerto_in_A_minor_Op.54_-_II._Intermezzo_and_III._Allegro_vivace.ogg
- 柴可夫斯基《第一钢琴协奏曲》第一乐章约 18:47；CC0：https://commons.wikimedia.org/wiki/File:Tchaikovsky,_Concerto_No.1_in_B-flat_minor_Op.23,_I._Allegro.ogg
- 李斯特《死之舞》约 15:30；钢琴与管弦乐队，CC BY-SA 2.0（署名及相同方式共享适用于改编）：https://commons.wikimedia.org/wiki/File:Liszt_Totentanz.ogg

每个网页音频条目带有录音来源和许可信息。CC BY、CC BY-SA 项目须保留署名、授权链接和改编说明；网站没有对录音进行加工。第三方图像与音频服务器可能有跨域、访问或带宽限制。
