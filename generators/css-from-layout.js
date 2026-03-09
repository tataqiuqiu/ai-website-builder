// 基于计算布局的CSS生成器（增强版）
class CSSFromLayoutGenerator {
    constructor() {
        this.cssRules = [];
        this.nodeDepth = new Map(); // 记录节点深度用于z-index
    }

    // 主生成方法
    generate(computedLayout) {
        if (!computedLayout || computedLayout.length === 0) {
            return '';
        }

        this.cssRules = [];
        this.nodeDepth.clear();
        
        // 计算节点深度
        this.calculateNodeDepth(computedLayout, 0);
        
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

    // 计算节点深度
    calculateNodeDepth(nodes, depth) {
        nodes.forEach(node => {
            this.nodeDepth.set(node.id, depth);
            if (node.children && node.children.length > 0) {
                this.calculateNodeDepth(node.children, depth + 1);
            }
        });
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

html, body {
    width: 100%;
    min-height: 100vh;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    overflow-x: hidden;
}

/* 图片自适应 */
img {
    max-width: 100%;
    height: auto;
    display: block;
}

/* Section 样式 */
.section {
    position: relative;
    width: 100%;
    padding: 80px 0;
    overflow: hidden;
}

/* Container 样式 - 自动识别的容器 */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* 基础容器 */
.container-node {
    position: relative;
}

/* 文本节点 */
.text-node {
    position: relative;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

/* 形状节点 */
.shape-node {
    position: relative;
}

/* 标题样式 */
.heading {
    font-weight: bold;
    line-height: 1.3;
}

.heading-1 { font-size: 48px; }
.heading-2 { font-size: 36px; }
.heading-3 { font-size: 30px; }
.heading-4 { font-size: 24px; }
.heading-5 { font-size: 20px; }
.heading-6 { font-size: 18px; }

/* 段落样式 */
.paragraph {
    line-height: 1.8;
    margin-bottom: 1em;
}

/* 按钮文本 */
.button-text {
    display: inline-block;
    cursor: pointer;
}

/* 链接样式 */
.link-text {
    color: inherit;
    text-decoration: none;
    transition: color 0.3s ease;
}

.link-text:hover {
    color: #0066cc;
}

/* 文本对齐 */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }

/* 响应式断点 */
@media (max-width: 768px) {
    .section {
        padding: 40px 0;
    }
    
    .heading-1 { font-size: 36px; }
    .heading-2 { font-size: 28px; }
    .heading-3 { font-size: 24px; }
    .heading-4 { font-size: 20px; }
    .heading-5 { font-size: 18px; }
    .heading-6 { font-size: 16px; }
}
`);
    }

    // 生成单个节点的样式
    generateNodeStyles(node) {
        if (!node.computedLayout) {
            return;
        }

        const computed = node.computedLayout;
        const layout = node.layout || {};
        const nodeId = this.generateNodeId(node);
        const isSection = node.isSection === true;
        const isContainer = node.isContainer === true;
        
        // 生成节点样式
        let css = `/* ${node.type}: ${node.name || 'unnamed'}${isSection ? ' (Section)' : ''}${isContainer ? ' (Container)' : ''} */\n`;
        css += `#${nodeId} {\n`;
        
        // 1. Display属性
        css += this.generateDisplayProperty(node, layout);
        
        // 2. Position属性
        css += this.generatePositionProperty(node, computed, isSection);
        
        // 3. 尺寸
        css += this.generateSizeProperty(node, computed, isSection);
        
        // 4. Flexbox布局属性
        css += this.generateFlexboxProperties(node, layout);
        
        // 5. 间距属性
        css += this.generateSpacingProperties(computed);
        
        // 6. 边框属性
        css += this.generateBorderProperties(node, computed);
        
        // 7. 文本样式
        if (node.type === 'TEXT' && node.style) {
            css += this.generateTextStyles(node.style);
        }
        
        // 8. 形状样式
        if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
            css += this.generateShapeStyles(node);
        }
        
        // 9. 背景样式
        css += this.generateBackgroundStyles(node);
        
        // 10. 阴影效果
        if (node.style?.boxShadow) {
            css += `    box-shadow: ${node.style.boxShadow};\n`;
        }
        
        // 11. 透明度
        if (node.style?.opacity && node.style.opacity < 1) {
            css += `    opacity: ${node.style.opacity};\n`;
        }
        
        // 12. Overflow处理
        css += this.generateOverflowProperty(node);
        
        // 13. Z-index层级
        css += this.generateZIndex(node);
        
        // 14. 过渡效果
        css += `    transition: all 0.3s ease;\n`;
        
        css += `}\n`;
        
        this.cssRules.push(css);

        // 递归处理子节点
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                this.generateNodeStyles(child);
            });
        }
    }

    // 生成display属性
    generateDisplayProperty(node, layout) {
        let css = '';
        
        // 如果是flex容器
        if (layout.flexDirection) {
            css += `    display: flex;\n`;
        } else if (node.children && node.children.length > 0) {
            // 有子节点的容器默认使用flex
            css += `    display: flex;\n`;
        } else {
            css += `    display: block;\n`;
        }
        
        return css;
    }

    // 生成position属性
    generatePositionProperty(node, computed, isSection) {
        let css = '';
        
        if (isSection) {
            css += `    position: relative;\n`;
        } else if (node.isContainer) {
            css += `    position: relative;\n`;
        } else if (node.type === 'TEXT') {
            css += `    position: relative;\n`;
        } else if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
            css += `    position: absolute;\n`;
            css += `    left: ${computed.left}px;\n`;
            css += `    top: ${computed.top}px;\n`;
        } else {
            css += `    position: relative;\n`;
        }
        
        return css;
    }

    // 生成尺寸属性
    generateSizeProperty(node, computed, isSection) {
        let css = '';
        
        if (isSection) {
            // Section宽度100%
            css += `    width: 100%;\n`;
            css += `    min-height: ${computed.height}px;\n`;
        } else if (node.isContainer) {
            // Container有max-width
            css += `    width: ${computed.width}px;\n`;
            css += `    max-width: 100%;\n`;
        } else if (node.type === 'TEXT') {
            // 文本节点宽度自适应
            css += `    width: auto;\n`;
            css += `    min-width: ${computed.width}px;\n`;
        } else {
            css += `    width: ${computed.width}px;\n`;
        }
        
        // 高度处理
        if (node.type !== 'TEXT') {
            if (node.children && node.children.length > 0) {
                // 有子节点的容器高度自适应
                css += `    min-height: ${computed.height}px;\n`;
            } else {
                css += `    height: ${computed.height}px;\n`;
            }
        }
        
        return css;
    }

    // 生成Flexbox属性
    generateFlexboxProperties(node, layout) {
        let css = '';
        
        // Flex方向
        if (layout.flexDirection) {
            css += `    flex-direction: ${layout.flexDirection};\n`;
        }
        
        // 主轴对齐
        if (layout.justifyContent) {
            css += `    justify-content: ${layout.justifyContent};\n`;
        }
        
        // 交叉轴对齐
        if (layout.alignItems) {
            css += `    align-items: ${layout.alignItems};\n`;
        }
        
        // Flex换行
        if (layout.flexWrap) {
            css += `    flex-wrap: ${layout.flexWrap};\n`;
        }
        
        // 间距（gap）
        if (layout.spacing && layout.spacing > 0) {
            css += `    gap: ${layout.spacing}px;\n`;
        }
        
        // Flex属性（针对子元素）
        if (layout.flex) {
            css += `    flex: ${layout.flex};\n`;
        }
        
        return css;
    }

    // 生成间距属性
    generateSpacingProperties(computed) {
        let css = '';
        
        // 外边距
        if (computed.marginLeft > 0) css += `    margin-left: ${computed.marginLeft}px;\n`;
        if (computed.marginRight > 0) css += `    margin-right: ${computed.marginRight}px;\n`;
        if (computed.marginTop > 0) css += `    margin-top: ${computed.marginTop}px;\n`;
        if (computed.marginBottom > 0) css += `    margin-bottom: ${computed.marginBottom}px;\n`;
        
        // 内边距
        if (computed.paddingLeft > 0) css += `    padding-left: ${computed.paddingLeft}px;\n`;
        if (computed.paddingRight > 0) css += `    padding-right: ${computed.paddingRight}px;\n`;
        if (computed.paddingTop > 0) css += `    padding-top: ${computed.paddingTop}px;\n`;
        if (computed.paddingBottom > 0) css += `    padding-bottom: ${computed.paddingBottom}px;\n`;
        
        return css;
    }

    // 生成边框属性
    generateBorderProperties(node, computed) {
        let css = '';
        
        // 边框宽度
        if (computed.borderLeftWidth > 0 || computed.borderRightWidth > 0 || 
            computed.borderTopWidth > 0 || computed.borderBottomWidth > 0) {
            css += `    border-left-width: ${computed.borderLeftWidth}px;\n`;
            css += `    border-right-width: ${computed.borderRightWidth}px;\n`;
            css += `    border-top-width: ${computed.borderTopWidth}px;\n`;
            css += `    border-bottom-width: ${computed.borderBottomWidth}px;\n`;
        }
        
        // 边框样式和颜色
        if (node.style?.borderColor) {
            css += `    border-color: ${node.style.borderColor};\n`;
            css += `    border-style: ${node.style.borderStyle || 'solid'};\n`;
            if (node.style.borderWidth) {
                css += `    border-width: ${node.style.borderWidth}px;\n`;
            }
        }
        
        // 圆角
        if (node.style?.borderRadius) {
            css += `    border-radius: ${node.style.borderRadius};\n`;
        }
        
        // 椭圆特殊处理
        if (node.type === 'ELLIPSE') {
            css += `    border-radius: 50%;\n`;
        }
        
        return css;
    }

    // 生成文本样式
    generateTextStyles(style) {
        let css = '';
        
        if (style.fontSize) css += `    font-size: ${style.fontSize}px;\n`;
        if (style.fontFamily) css += `    font-family: ${style.fontFamily};\n`;
        if (style.fontWeight) css += `    font-weight: ${style.fontWeight};\n`;
        if (style.color) css += `    color: ${style.color};\n`;
        if (style.textAlign) css += `    text-align: ${style.textAlign};\n`;
        if (style.lineHeight) css += `    line-height: ${style.lineHeight};\n`;
        if (style.letterSpacing) css += `    letter-spacing: ${style.letterSpacing}px;\n`;
        if (style.textDecoration) css += `    text-decoration: ${style.textDecoration};\n`;
        if (style.textTransform) css += `    text-transform: ${style.textTransform};\n`;
        
        return css;
    }

    // 生成形状样式
    generateShapeStyles(node) {
        let css = '';
        
        // 默认背景色
        if (!node.style?.backgroundColor && !node.style?.background && !node.style?.backgroundImage) {
            css += `    background-color: #f0f0f0;\n`;
        }
        
        return css;
    }

    // 生成背景样式
    generateBackgroundStyles(node) {
        let css = '';
        
        if (node.style?.backgroundColor) {
            css += `    background-color: ${node.style.backgroundColor};\n`;
        }
        
        if (node.style?.background) {
            css += `    background: ${node.style.background};\n`;
        }
        
        if (node.style?.backgroundImage) {
            css += `    background-image: ${node.style.backgroundImage};\n`;
            css += `    background-size: ${node.style.backgroundSize || 'cover'};\n`;
            css += `    background-position: center;\n`;
            css += `    background-repeat: no-repeat;\n`;
        }
        
        return css;
    }

    // 生成overflow属性
    generateOverflowProperty(node) {
        let css = '';
        
        // 文本节点特殊处理
        if (node.type === 'TEXT') {
            // 长文本允许换行
            const text = node.content?.text || '';
            if (text.length > 50) {
                css += `    overflow: visible;\n`;
                css += `    white-space: normal;\n`;
            } else {
                css += `    overflow: hidden;\n`;
                css += `    white-space: nowrap;\n`;
                css += `    text-overflow: ellipsis;\n`;
            }
        } else if (node.children && node.children.length > 0) {
            // 有子节点的容器
            css += `    overflow: visible;\n`;
        } else {
            css += `    overflow: hidden;\n`;
        }
        
        return css;
    }

    // 生成z-index
    generateZIndex(node) {
        const depth = this.nodeDepth.get(node.id) || 0;
        // 基于深度计算z-index，每层增加10
        const zIndex = depth * 10;
        
        if (zIndex > 0) {
            return `    z-index: ${zIndex};\n`;
        }
        return '';
    }

    // 生成响应式样式
    generateResponsiveStyles() {
        this.cssRules.push(`
/* 响应式断点 */
@media (max-width: 1200px) {
    .container-node {
        padding-left: 15px;
        padding-right: 15px;
    }
}

@media (max-width: 768px) {
    .container-node {
        width: 100% !important;
        padding-left: 10px;
        padding-right: 10px;
    }
    
    .container-node.container {
        padding: 0 15px;
    }
    
    .text-node {
        width: 100%;
        white-space: normal;
        overflow: visible;
    }
    
    .shape-node {
        position: relative;
        left: auto !important;
        top: auto !important;
        width: 100% !important;
    }
    
    /* 移动端垂直布局 */
    .container-node {
        flex-direction: column !important;
    }
}

@media (max-width: 480px) {
    .container-node {
        padding: 10px;
    }
    
    .text-node {
        font-size: 14px;
    }
    
    .heading-1 { font-size: 28px; }
    .heading-2 { font-size: 24px; }
    .heading-3 { font-size: 20px; }
    .heading-4 { font-size: 18px; }
    .heading-5 { font-size: 16px; }
    .heading-6 { font-size: 14px; }
}

/* 打印样式 */
@media print {
    .section {
        page-break-inside: avoid;
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