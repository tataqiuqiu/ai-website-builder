// 基于计算布局的HTML生成器
class HTMLFromLayoutGenerator {
    constructor() {
        this.nodeIdCounter = 0;
    }

    // 主生成方法
    generate(computedLayout) {
        if (!computedLayout || computedLayout.length === 0) {
            return '';
        }

        this.nodeIdCounter = 0;
        let html = this.generateHTMLHeader();

        // 生成主体内容
        html += '<body>\n';
        computedLayout.forEach(node => {
            html += this.generateNode(node, 0);
        });
        html += '</body>\n</html>';

        return html;
    }

    // 生成HTML头部
    generateHTMLHeader() {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成页面 - 基于Figma布局</title>
    <link rel="stylesheet" href="style.css">
</head>
`;
    }

    // 生成单个节点
    generateNode(node, indent) {
        const indentStr = '    '.repeat(indent);
        const nodeId = this.generateNodeId(node);
        
        // 跳过某些不需要渲染的节点类型
        if (this.shouldSkipNode(node)) {
            return '';
        }

        let html = '';

        // 根据节点类型生成不同的HTML
        switch (node.type) {
            case 'TEXT':
                html = this.generateTextNode(node, indentStr, nodeId);
                break;
            case 'FRAME':
            case 'INSTANCE':
                html = this.generateContainerNode(node, indent, nodeId);
                break;
            case 'RECTANGLE':
            case 'ELLIPSE':
                html = this.generateShapeNode(node, indentStr, nodeId);
                break;
            default:
                // 其他类型作为容器处理
                html = this.generateContainerNode(node, indent, nodeId);
        }

        return html;
    }

    // 生成文本节点
    generateTextNode(node, indentStr, nodeId) {
        const text = node.content?.text || node.name || '';
        const computed = node.computedLayout || {};
        
        return `${indentStr}<div id="${nodeId}" class="text-node" data-text="${this.escapeText(text)}">${text}</div>\n`;
    }

    // 生成容器节点
    generateContainerNode(node, indent, nodeId) {
        const indentStr = '    '.repeat(indent);
        const computed = node.computedLayout || {};
        let html = `${indentStr}<div id="${nodeId}" class="container-node" data-type="${node.type}">\n`;

        // 递归生成子节点
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                html += this.generateNode(child, indent + 1);
            });
        }

        html += `${indentStr}</div>\n`;
        return html;
    }

    // 生成形状节点
    generateShapeNode(node, indentStr, nodeId) {
        const computed = node.computedLayout || {};
        return `${indentStr}<div id="${nodeId}" class="shape-node" data-shape="${node.type}"></div>\n`;
    }

    // 判断是否应该跳过节点
    shouldSkipNode(node) {
        // 跳过某些装饰性节点
        const skipTypes = ['VECTOR', 'BOOLEAN_OPERATION', 'GROUP'];
        return skipTypes.includes(node.type);
    }

    // 生成节点ID
    generateNodeId(node) {
        return `node-${node.id.replace(/:/g, '-')}`;
    }

    // 转义文本
    escapeText(text) {
        return text
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#039;');
    }
}

// 导出生成器
module.exports = HTMLFromLayoutGenerator;

// 测试函数
async function testHTMLGenerator() {
    try {
        const fs = require('fs');
        console.log('开始测试HTML生成器...');

        // 读取计算后的布局
        const computedLayout = JSON.parse(fs.readFileSync('computed_layout.json', 'utf8'));
        console.log(`加载了 ${computedLayout.length} 个计算后的布局节点`);

        // 创建生成器
        const generator = new HTMLFromLayoutGenerator();

        // 生成HTML
        console.log('开始生成HTML...');
        const html = generator.generate(computedLayout);
        console.log('HTML生成完成！');

        // 保存HTML
        fs.writeFileSync('output/index.html', html);
        console.log('HTML已保存到 output/index.html');

        // 显示HTML长度
        console.log(`生成的HTML长度: ${html.length} 字符`);

    } catch (error) {
        console.error('HTML生成器测试失败:', error.message);
        console.error(error);
    }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    testHTMLGenerator();
}