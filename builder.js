const fs = require('fs');
const path = require('path');
const FigmaToLayoutConverter = require('./convert-figma-to-layout');
const LayoutEngine = require('./layout-engine');
const HTMLFromLayoutGenerator = require('./generators/html-from-layout');
const CSSFromLayoutGenerator = require('./generators/css-from-layout');

async function build() {
    try {
        console.log('🚀 开始构建流程...\n');

        // 1. 读取 Figma JSON
        console.log('📦 读取 Figma 数据...');
        if (!fs.existsSync('figma_raw.json')) {
            throw new Error('找不到 figma_raw.json 文件');
        }
        
        // 读取文件
        const rawData = fs.readFileSync('figma_raw.json', 'utf8');
        const figmaData = JSON.parse(rawData);
        console.log('✅ Figma 数据读取成功');

        // 第一步：Figma JSON → Layout Node
        console.log('\n🔄 第一步：转换 Figma JSON 为 Layout Node...');
        const converter = new FigmaToLayoutConverter();
        // figmaData 可能是整个文档对象，我们需要找到其中的页面或节点
        // 这里假设 figmaData 是我们想要转换的节点，或者它包含 document.children
        let rootNode = figmaData;
        if (figmaData.document) {
            rootNode = figmaData.document;
        }
        
        const layoutNodes = converter.convert(rootNode);
        fs.writeFileSync('layout_nodes.json', JSON.stringify(layoutNodes, null, 2));
        console.log(`✅ 转换完成，生成了 ${layoutNodes.length} 个布局节点`);

        // 第二步 & 第三步 & 第四步：Layout Tree → Yoga Tree → 计算布局 → 读取布局
        console.log('\n📐 第二至四步：计算布局...');
        const layoutEngine = new LayoutEngine();
        const computedLayout = await layoutEngine.calculateLayout(layoutNodes);
        fs.writeFileSync('computed_layout.json', JSON.stringify(computedLayout, null, 2));
        console.log('✅ 布局计算完成');

        // 第五步：生成 HTML、CSS
        console.log('\n🎨 第五步：生成 HTML 和 CSS...');
        
        // 确保输出目录存在
        if (!fs.existsSync('output')) {
            fs.mkdirSync('output');
        }

        // 生成 HTML
        const htmlGenerator = new HTMLFromLayoutGenerator();
        const html = htmlGenerator.generate(computedLayout);
        fs.writeFileSync('output/index.html', html);
        console.log('✅ HTML 生成成功: output/index.html');

        // 生成 CSS
        const cssGenerator = new CSSFromLayoutGenerator();
        const css = cssGenerator.generate(computedLayout);
        fs.writeFileSync('output/style.css', css);
        console.log('✅ CSS 生成成功: output/style.css');

        console.log('\n✨ 构建流程全部完成！');

    } catch (error) {
        console.error('\n❌ 构建失败:', error.message);
        console.error(error);
    }
}

if (require.main === module) {
    build();
}

module.exports = build;
