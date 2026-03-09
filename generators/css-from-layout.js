// 基于计算布局的CSS生成器
class CSSFromLayoutGenerator {
    constructor() {
        this.cssRules = [];
    }

    // 主生成方法
    generate(computedLayout) {
        if (!computedLayout || computedLayout.length === 0) {
            return '';
        }

        this.cssRules = [];
        
        // 生成基础样式
        this.generateBaseStyles();
        
        // 生成节点样式
        computedLayout.forEach(node => {
            this.generateNodeStyles(node);
        });
        
        // 生成响应式样式
        this.generateResponsiveStyles();
        
        return this.cssRules.join('\n\n');
    }

    // 生成基础样式
    generateBaseStyles() {
        this.cssRules.push(`
/* 基础重置 */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333;
}

/* 基础容器 */
.container-node {
    position: absolute;
    overflow: hidden;
}

/* 文本节点 */
.text-node {
    position: absolute;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 形状节点 */
.shape-node {
    position: absolute;
    background-color: #f0f0f0;
}

/* 响应式断点 */
@media (max-width: 768px) {
    .container-node {
        position: relative;
    }
}
`);
    }

    // 生成单个节点的样式
    generateNodeStyles(node) {
        if (!node.computedLayout) {
            return;
        }

        const computed = node.computedLayout;
        const nodeId = this.generateNodeId(node);
        
        // 生成节点样式
        let css = `/* ${node.type}: ${node.name || 'unnamed'} */\n`;
        css += `#${nodeId} {\n`;
        
        // 位置和尺寸
        css += `    left: ${computed.left}px;\n`;
        css += `    top: ${computed.top}px;\n`;
        css += `    width: ${computed.width}px;\n`;
        css += `    height: ${computed.height}px;\n`;
        
        // 边距
        if (computed.marginLeft > 0) css += `    margin-left: ${computed.marginLeft}px;\n`;
        if (computed.marginRight > 0) css += `    margin-right: ${computed.marginRight}px;\n`;
        if (computed.marginTop > 0) css += `    margin-top: ${computed.marginTop}px;\n`;
        if (computed.marginBottom > 0) css += `    margin-bottom: ${computed.marginBottom}px;\n`;
        
        // 内边距
        if (computed.paddingLeft > 0) css += `    padding-left: ${computed.paddingLeft}px;\n`;
        if (computed.paddingRight > 0) css += `    padding-right: ${computed.paddingRight}px;\n`;
        if (computed.paddingTop > 0) css += `    padding-top: ${computed.paddingTop}px;\n`;
        if (computed.paddingBottom > 0) css += `    padding-bottom: ${computed.paddingBottom}px;\n`;
        
        // 边框
        if (computed.borderLeftWidth > 0) css += `    border-left-width: ${computed.borderLeftWidth}px;\n`;
        if (computed.borderRightWidth > 0) css += `    border-right-width: ${computed.borderRightWidth}px;\n`;
        if (computed.borderTopWidth > 0) css += `    border-top-width: ${computed.borderTopWidth}px;\n`;
        if (computed.borderBottomWidth > 0) css += `    border-bottom-width: ${computed.borderBottomWidth}px;\n`;
        
        // 文本样式
        if (node.type === 'TEXT' && node.style) {
            if (node.style.fontSize) css += `    font-size: ${node.style.fontSize}px;\n`;
            if (node.style.fontFamily) css += `    font-family: ${node.style.fontFamily};\n`;
            if (node.style.fontWeight) css += `    font-weight: ${node.style.fontWeight};\n`;
            if (node.style.color) css += `    color: ${node.style.color};\n`;
            if (node.style.textAlign) css += `    text-align: ${node.style.textAlign};\n`;
        }
        
        // 形状样式
        if (node.type === 'RECTANGLE') {
            css += `    background-color: ${node.style?.backgroundColor || '#f0f0f0'};\n`;
        } else if (node.type === 'ELLIPSE') {
            css += `    border-radius: 50%;\n`;
            css += `    background-color: ${node.style?.backgroundColor || '#f0f0f0'};\n`;
        }
        
        // 透明度
        if (node.style?.opacity) {
            css += `    opacity: ${node.style.opacity};\n`;
        }
        
        css += `}\n`;
        
        this.cssRules.push(css);
    }

    // 生成响应式样式
    generateResponsiveStyles() {
        this.cssRules.push(`
/* 响应式断点 */
@media (max-width: 768px) {
    .container-node {
        position: relative;
        width: 100%;
        left: 0;
        top: 0;
    }
    
    .text-node {
        width: 100%;
        left: 0;
        top: 0;
    }
    
    .shape-node {
        width: 100%;
        left: 0;
        top: 0;
    }
}

@media (max-width: 480px) {
    .container-node {
        padding: 10px;
    }
    
    .text-node {
        font-size: 14px;
    }
}
`);
    }

    // 生成节点ID
    generateNodeId(node) {
        return `node-${node.id.replace(/:/g, '-')}`;
    }
}

// 导出生成器
module.exports = CSSFromLayoutGenerator;

// 测试函数
async function testCSSGenerator() {
    try {
        const fs = require('fs');
        console.log('开始测试CSS生成器...');

        // 读取计算后的布局
        const computedLayout = JSON.parse(fs.readFileSync('computed_layout.json', 'utf8'));
        console.log(`加载了 ${computedLayout.length} 个计算后的布局节点`);

        // 创建生成器
        const generator = new CSSFromLayoutGenerator();

        // 生成CSS
        console.log('开始生成CSS...');
        const css = generator.generate(computedLayout);
        console.log('CSS生成完成！');

        // 保存CSS
        fs.writeFileSync('output/style.css', css);
        console.log('CSS已保存到 output/style.css');

        // 显示CSS长度
        console.log(`生成的CSS长度: ${css.length} 字符`);

    } catch (error) {
        console.error('CSS生成器测试失败:', error.message);
        console.error(error);
    }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    testCSSGenerator();
}