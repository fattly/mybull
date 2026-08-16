# 今日你的牛

一个轻量、有仪式感的每日牛人格抽取网站。用户每天可以召唤自己的“今日牛”，查看牛气值、标签和专属文案，并生成适合保存与分享的今日牛卡。

线上地址：[https://mybull.fattly.cn](https://mybull.fattly.cn)

## 功能

- 6 大类、54 种牛人格：搞钱、工作、学习、情绪、社交、科技。
- N / R / SR / SSR / UR 五级稀有度体系。
- 基于设备标识和当天日期生成每日固定结果。
- 根据工作日、周末和当前时段调整抽取权重。
- 召唤动画、牛气值、个性标签与文案变体。
- 每天可“偷偷换牛卡” 5 次。
- Canvas 生成 1080 × 1440 PNG 牛卡。
- 牛卡二维码指向 `https://mybull.fattly.cn`。
- 好友入口页与 URL 参数分享。
- PC、平板和 WAP 端响应式布局。

## 技术栈

- 原生 HTML / CSS / JavaScript
- LocalStorage 本地状态存储
- Canvas API 图片导出
- 高质量 WebP 透明素材
- CSS 九宫格切片 + Canvas 源区域裁切
- 无前端框架、无构建步骤

## 项目结构

```text
.
├── index.html                              # 页面结构和资源入口
├── css/
│   └── style.css                          # 设计系统、动画和响应式样式
├── js/
│   ├── bulls-data.js                     # 54 种牛数据与九宫格行列映射
│   └── app.js                            # 抽取、渲染、牛卡、分享与本地存储逻辑
├── images/
│   ├── 01_money_bulls_grid.webp          # 搞钱类九宫格
│   ├── 02_work_bulls_grid.webp           # 工作类九宫格
│   ├── 03_study_bulls_grid.webp          # 学习类九宫格
│   ├── 04_emotion_bulls_grid.webp        # 情绪类九宫格
│   ├── 05_social_bulls_grid.webp         # 社交类九宫格
│   ├── 06_tech_bulls_grid.webp           # 科技类九宫格
│   ├── bulls/xiaban.png                  # 清理跨格残像后的下班牛切图
│   └── mybull-qrcode.png                 # 正式域名二维码
└── scripts/
    └── serve.py                          # 本地静态服务
```

## 本地运行

项目是纯静态站点，可直接打开 `index.html`。为了保持图片导出和分享链接行为与线上环境一致，建议通过 HTTP 服务预览。

```bash
python3 -m http.server 8088
```

然后访问：

```text
http://127.0.0.1:8088
```

也可使用项目自带的后台服务脚本：

```bash
python3 scripts/serve.py
```

## 九宫格素材

6 张分类原图均为 3 × 3 透明 WebP 九宫格，单张体积控制在 900KB 以下。`js/bulls-data.js` 中的 `BULL_IMAGE_GRIDS` 按照 `row` / `col` 为每种牛建立映射，页面展示和 Canvas 导出共用同一套坐标。

新增或替换素材时，请同步检查：

1. 图片文件名和分类是否一致。
2. `BULL_IMAGE_GRIDS` 中的 ID 顺序是否与九宫格位置一致。
3. 九宫格边界是否存在跨格像素。
4. 结果页、牛卡预览和导出 PNG 是否显示同一头牛。

## 数据与本地状态

项目使用 LocalStorage 保存：

- 设备 ID。
- 当日抽取结果。
- 当日换牛次数。
- 最近 30 天的牛历记录。

清空浏览器站点数据后，设备 ID 和当日结果会重新生成。

## 部署

本项目不需要构建，将仓库内的静态文件部署到 Web 根目录即可。生产环境建议：

- 使用 HTTPS。
- 确保 `images/`、`css/` 和 `js/` 目录可公开访问。
- 为 PNG、CSS 和 JavaScript 资源配置浏览器缓存。
- 版本更新时同步调整 `index.html` 中的资源版本参数。
