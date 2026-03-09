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

    // 生成文本节点 - 使用更语义化的标签
    generateTextNode(node, indentStr, nodeId) {
        const text = node.content?.text || node.name || '';
        const computed = node.computedLayout || {};
        
        // 根据文本内容和样式选择合适的标签
        let tagName = 'span';
        let className = 'text-node';
        
        // 检查是否为标题
        if (this.isHeading(node)) {
            const level = this.getHeadingLevel(node);
            tagName = `h${level}`;
            className = `heading heading-${level}`;
        }
        // 检查是否为按钮文本
        else if (this.isButtonText(node)) {
            tagName = 'span';
            className = 'button-text';
        }
        // 检查是否为链接文本
        else if (this.isLinkText(node)) {
            tagName = 'a';
            className = 'link-text';
        }
        // 检查是否为段落文本
        else if (this.isParagraph(node)) {
            tagName = 'p';
            className = 'paragraph';
        }
        
        // 添加额外的类名
        if (node.style?.textAlign) {
            className += ` text-${node.style.textAlign}`;
        }
        
        return `${indentStr}<${tagName} id="${nodeId}" class="${className}" data-text="${this.escapeText(text)}">${text}</${tagName}>\n`;
    }
    
    // 判断是否为标题
    isHeading(node) {
        const text = node.content?.text || '';
        const fontSize = node.style?.fontSize || 0;
        
        // 根据字号判断
        if (fontSize >= 48) return true;
        if (fontSize >= 36) return true;
        if (fontSize >= 24) return true;
        
        // 根据文本内容判断（简化的启发式规则）
        const headingPatterns = [
            /^(第|Chapter|Part|Section)\s*\d+/i,
            /^(一|二|三|四|五|六|七|八|九|十)、/,
            /^(【|「|『)/,
            /^(产品|方案|案例|功能|服务|关于)/
        ];
        
        return headingPatterns.some(pattern => pattern.test(text));
    }
    
    // 获取标题级别
    getHeadingLevel(node) {
        const fontSize = node.style?.fontSize || 0;
        
        if (fontSize >= 48) return 1;
        if (fontSize >= 36) return 2;
        if (fontSize >= 30) return 3;
        if (fontSize >= 24) return 4;
        if (fontSize >= 20) return 5;
        return 6;
    }
    
    // 判断是否为按钮文本
    isButtonText(node) {
        const text = node.content?.text || '';
        const buttonPatterns = [
            /^(立即|点击|查看|了解|下载|注册|登录|提交|确认|取消)/,
            /^(按钮|Button|Click|Submit)/i,
            /^(更多|展开|收起|返回|继续)/
        ];
        return buttonPatterns.some(pattern => pattern.test(text));
    }
    
    // 判断是否为链接文本
    isLinkText(node) {
        const text = node.content?.text || '';
        const linkPatterns = [
            /^(http|https|www)/i,
            /(点击|访问|查看详情|了解更多)/
        ];
        return linkPatterns.some(pattern => pattern.test(text));
    }
    
    // 判断是否为段落文本
    isParagraph(node) {
        const text = node.content?.text || '';
        // 如果文本较长且不是标题，则认为是段落
        return text.length > 50 && !this.isHeading(node);
    }

    // 生成容器节点 - 使用更语义化的标签
    generateContainerNode(node, indent, nodeId) {
        const indentStr = '    '.repeat(indent);
        const computed = node.computedLayout || {};
        
        // 检查是否为 Section
        const isSection = node.isSection === true;
        const isContainer = node.isContainer === true;
        
        // 根据节点名称和内容选择语义化标签
        let tagName = 'div';
        let className = 'container-node';
        let role = '';
        
        if (isSection) {
            tagName = 'section';
            className = 'section';
        } else if (this.isHeader(node)) {
            tagName = 'header';
            className = 'header';
            role = 'banner';
        } else if (this.isFooter(node)) {
            tagName = 'footer';
            className = 'footer';
            role = 'contentinfo';
        } else if (this.isNav(node)) {
            tagName = 'nav';
            className = 'navigation';
            role = 'navigation';
        } else if (this.isMain(node)) {
            tagName = 'main';
            className = 'main-content';
            role = 'main';
        } else if (this.isArticle(node)) {
            tagName = 'article';
            className = 'article';
        } else if (this.isAside(node)) {
            tagName = 'aside';
            className = 'sidebar';
            role = 'complementary';
        }
        
        // 如果是 Container，添加 container 类
        if (isContainer) {
            className += ' container';
        }
        
        // 构建属性
        let attributes = `id="${nodeId}" class="${className}" data-type="${node.type}"`;
        if (role) {
            attributes += ` role="${role}"`;
        }
        
        let html = `${indentStr}<${tagName} ${attributes}>\n`;

        // 递归生成子节点
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                html += this.generateNode(child, indent + 1);
            });
        }

        html += `${indentStr}</${tagName}>\n`;
        return html;
    }
    
    // 判断是否为页头
    isHeader(node) {
        const name = node.name?.toLowerCase() || '';
        return name.includes('header') || name.includes('导航') || name.includes('nav');
    }
    
    // 判断是否为页脚
    isFooter(node) {
        const name = node.name?.toLowerCase() || '';
        return name.includes('footer') || name.includes('页脚') || name.includes('底部');
    }
    
    // 判断是否为导航
    isNav(node) {
        const name = node.name?.toLowerCase() || '';
        return name.includes('nav') || name.includes('导航') || name.includes('menu');
    }
    
    // 判断是否为主内容区
    isMain(node) {
        const name = node.name?.toLowerCase() || '';
        return name.includes('main') || name.includes('内容') || name.includes('content');
    }
    
    // 判断是否为文章
    isArticle(node) {
        const name = node.name?.toLowerCase() || '';
        return name.includes('article') || name.includes('文章') || name.includes('案例') || name.includes('card');
    }
    
    // 判断是否为侧边栏
    isAside(node) {
        const name = node.name?.toLowerCase() || '';
        return name.includes('aside') || name.includes('侧边') || name.includes('sidebar');
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