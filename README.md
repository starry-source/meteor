<p align="center">
    <img src="./meteor.svg" width="147" height="147">
</p>

<p>
<h1 align="center" style="line-height:1;">Meteor</h1>
<p align="center">专业的演示文稿制作器，支持 Html 打包<br>
由星源开发 · Developed by Starry Source</p>
</p>
<p align="center" class="shields">
  <span style="text-decoration:none">
    <img src="https://img.shields.io/github/stars/starry-source/meteor" alt="GitHub stars"/>
  </span>
  <!-- <span href="https://github.com/starry-source/meteor/issues" style="text-decoration:none">
    <img src="https://img.shields.io/github/issues/starry-source/meteor.svg" alt="GitHub issues"/>
  </span>
  <span href="https://github.com/starry-source/meteor/network" style="text-decoration:none">
    <img src="https://img.shields.io/github/forks/starry-source/meteor.svg" alt="GitHub forks"/>
  </span> -->
  <span style="text-decoration:none">
    <img src="https://img.shields.io/github/license/starry-source/meteor" alt="GitHub License"/>
  </pan>
</p>

<!-- 
> [!NOTE]
> 功能尚不完善，尚不可用于实际制作使用。 -->


## 引言
想必，你对 PPT 并不陌生。其应用极广，办公、演讲、教学，甚至于海报制作、图片编辑、视频剪辑，民众对 PPT 的依赖可谓极深。

然而，正版 Office 要价高昂，且个人电脑之制作、大屏幕之演示，都应购买正版 Office，这无疑是大多人不愿承受的。

虽 WPS 免费，功能亦不完善，还有兼容性问题，加之乌烟瘴气的广告、繁杂的 VIP 限制，不敢恭维。

故曰：天下苦 PPT 久矣。

而开发 Meteor ，正为解济受此苦者。

## 简介
Meteor 是一个演示文稿制作器。

作为亮点，Meteor 制作的演示文稿可 **随时随地** 播放。
即，在所有电脑上，不必安装 Meteor，也能播放演示文稿。

当然目前，功能上只能实现基本的制作，可满足日常使用。

（界面有变更，以实际为准）
![编辑界面](art/edit.png)
<!-- ![播放界面](art/play.png) -->

## 正常使用

- 在右侧 Releases 中下载最新版本的可执行文件（`.exe` 文件）。
- 运行程序，在浏览器（推荐 Chrome 或 Edge）中打开显示的网址，即可使用。

## 代码部署

1. **克隆存储库**  
以你喜欢的方式下载项目源码，然后：
```sh
cd meteor
```

2. **安装 Python（3.9 为宜，其它版本亦可）**  

3. **虚拟环境（可选）**  
如果你认为，此项目的依赖会污染本机生态，可考虑使用虚拟环境：
（详细参考 [Python 官方文档](https://docs.python.org/zh-cn/3/library/venv.html#creating-virtual-environments)）
```sh
# 创建
python -m venv venv
# 激活
source venv/bin/activate  # 于 Linux/macOS
venv\Scripts\activate     # 于 Windows
```

4. **安装依赖**  
```sh
pip install -r requirements.txt
```

5. **启动服务器**  
```sh
python manage.py runserver
```

6. **开始**  
打开你喜欢的浏览器（Chromium 内核最佳，拒绝 FireFox），进入显示的网址（通常为 `http://127.0.0.1:8000`），即可。

## 开发环境

Windows 11 24h2\
Python 3.9.13\
Django 4.2.20\
Microsoft Edge
