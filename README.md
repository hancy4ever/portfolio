# ZHIZ 个人作品集

直接双击 `index.html` 即可浏览。网站不需要安装依赖。

## 图片目录

请按作品分区把图片放入对应文件夹：

- `image/painting`：绘画
- `image/interactive`：游戏与交互
- `image/modeling`：建模

放入文件夹后，在 `projects.js` 的 `window.PORTFOLIO_PROJECTS` 数组中添加作品信息。`cover` 用于首页和作品列表；`images` 用于配置详情页的多张图片。未配置 `images` 时自动使用单张 `image`。

```js
{
  title: "作品名称",
  category: "painting",
  year: "2026",
  cover: "image/painting/example-cover.webp",
  image: "image/painting/example.webp",
  images: [
    "image/painting/example-01.webp",
    "image/painting/example-02.webp"
  ],
  description: "作品介绍",
  bilibili: "",
  projectUrl: ""
}
```

不配置单独封面时：

```js
cover: "",
image: "image/painting/example.webp",
images: []
```

分类值分别是 `painting`、`interactive`、`modeling`。

## 大图操作

点击任意作品卡片打开全屏查看器。多张图片按配置顺序纵向展示，配置视频时可继续向下滚动观看；项目信息与操作按钮位于侧栏。支持缩放、复位和全屏，键盘可使用 `+`、`-`、`0` 和 `Esc`。
