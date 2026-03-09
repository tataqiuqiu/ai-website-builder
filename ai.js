const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: 'sk-80f62a7d01784a8490fdb23f33ac80f6',
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

async function analyzeLayout(figmaJSON){
    console.log('figmaJSON:', figmaJSON)

    const prompt = `
        你是一个网页架构师。

        根据 section 名称和文本内容识别网页模块。

        可识别模块：
        banner
        features
        cards
        list
        footer

        返回 JSON：

        {
            "sections":[
                {
                    "type":"banner",
                    "title":"",
                    "subtitle":"",
                    "button":""
                }
            ]
        }

        sections:
        ${JSON.stringify(figmaJSON)}
    `
    const res = await client.chat.completions.create({
        model: "qwen3.5-plus",
        messages:[
            {
                role:"user",
                content:prompt
            }
        ],
        temperature:0.2
    })

    // 解析 AI 返回的 JSON 字符串
    const content = res.choices[0].message.content
    
    return JSON.parse(content.replace(/```json|```/g,"").trim())

}


async function generateCSS(layout) {
    console.log('layout for CSS generation:', layout)

    const prompt = `
        你是一个前端 CSS 专家。

        根据提供的网页布局结构，生成现代化、美观的 CSS 样式。
        
        关键要求：
        1. 必须严格使用以下 HTML 类名结构，不要自己发明类名：
           - Banner区域: .banner, .container, .banner-content, .banner-title, .banner-subtitle, .banner-button
           - Features区域: .features, .container, .section-header, .section-title, .section-subtitle, .features-list, .feature-item, .feature-icon, .feature-title, .feature-description, .section-button
           - Cards区域: .cards, .container, .section-header, .section-title, .section-subtitle, .cards-list, .card-item, .card-content, .card-title, .card-description, .card-button, .section-button
           - List区域: .list, .container, .section-header, .section-title, .section-subtitle, .list-items, .list-item, .list-item-title, .list-item-description, .section-button
           - CMS List区域: .cms-list, .container, .section-header, .section-title, .section-subtitle, .cms-fields, .cms-field, .cms-field-label, .cms-field-input, .section-button
           - Footer区域: .footer, .container, .footer-title, .footer-subtitle, .footer-links, .footer-link

        2. 样式要求：
           - 使用 Flexbox 或 Grid 布局
           - 包含基础重置样式
           - 响应式设计（移动端优先）
           - 现代化的配色方案（科技蓝为主）和字体
           - 合适的间距和阴影效果
           - 悬停效果和过渡动画

        3. 只返回 CSS 代码，不要包含其他内容，不需要 Markdown 代码块标记。
        
        布局结构数据：
        ${JSON.stringify(layout)}
    `
    
    const res = await client.chat.completions.create({
        model: "qwen3.5-plus",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.3
    })

    // 返回 AI 生成的 CSS
    return res.choices[0].message.content.replace(/```css|```/g, "").trim()
}

module.exports = { analyzeLayout, generateCSS }