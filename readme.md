ai-website-builder 是AI自动化页面生成器，它从figma获取单页的设计稿，通过Yoga分析html tree结构，并写对应的CSS。


### 一、
layout.json
   ↓
生成 HTML
生成 CSS
生成 CMS 模板

### 二、
Figma设计稿
   ↓
Figma API
   ↓
AI识别模块
   ↓
生成 layout.json
   ↓
生成 HTML + CSS + CMS模板

##### 解析Frame / Text：展开如下
Figma JSON
   ↓
AI理解布局
   ↓
layout.json

##### AI理解布局：展开如下
Node程序
   ↓
Prompt + JSON
   ↓
AI API

### 未来、
Figma
 ↓
自动解析
 ↓
AI识别模块
 ↓
生成HTML
 ↓
生成CSS
 ↓
生成CMS模板

### 生成 CSS 样式
Figma JSON
    ↓
Layout解析
    ↓
DesignToken提取
    ↓
Component识别
    ↓
HTML
    ↓
CSS

### 技术架构
Figma API
   ↓
Layout Engine（布局解析）
   ↓
Component Detector（组件识别）
   ↓
Design Token 提取
   ↓
HTML + CSS 生成
   ↓
CMS 模板生成

# 
Figma JSON
   ↓
Normalize Nodes
   ↓
Layout Tree
   ↓
Yoga Layout Engine
   ↓
Computed Layout
   ↓
HTML + CSS


