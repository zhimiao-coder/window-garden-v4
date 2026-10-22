# 窗中有园 · A Garden Through a Window

苏州花窗双语互动展，第四版。纯静态 HTML、CSS、JavaScript；图片、字体及 Three.js 均随仓库提供，无需安装依赖或构建。

## GitHub Pages

将本目录的全部文件放在仓库根目录，在 Settings → Pages 选择 Deploy from a branch、main、/(root)。请保留 .nojekyll 文件，使平台直接发布静态资源。

发布后的站点地址以 GitHub Pages 实际返回结果为准；项目站点通常为 `https://<用户名>.github.io/<仓库名>/`。直接上传 ZIP 文件不会发布网站，必须提交解压后的目录内容。

## 页面

- `index.html`：完整展览
- `sources.html`：出处与许可
- `viewer.html`：独立 3D 模型
- `embed-example.html`：同站点嵌入示例

## 本地预览

在本目录运行 `python -m http.server 8766 --bind 127.0.0.1`，在浏览器访问对应本地地址。不要直接双击 HTML 文件运行 ES 模块。

## 署名与许可

图片、字体、第三方代码和照片依据的几何研究分别适用所附许可。请保留 `sources.html`、`assets/` 中的出处记录与字体许可，以及 `vendor/LICENSE-three.txt`。图片许可不自动覆盖整站原创代码和文字。
