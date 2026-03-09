const fs = require('fs');

// Figma JSON 转换为 Layout Node 的转换器
class FigmaToLayoutConverter {
    constructor() {
        this.layoutNodes = [];
    }

    // 主转换方法
    convert(figmaData) {
        this.layoutNodes = [];
        this.processNode(figmaData, null);
        return this.layoutNodes;
    }

    // 处理单个Figma节点
    processNode(figmaNode, parentLayoutNode) {
        // 跳过非布局节点
        if (!figmaNode || !figmaNode.type) return;

        // 创建布局节点
        const layoutNode = this.createLayoutNode(figmaNode);
        
        // 如果有父节点，添加为子节点
        if (parentLayoutNode) {
            parentLayoutNode.children.push(layoutNode);
        } else {
            // 根节点
            this.layoutNodes.push(layoutNode);
        }

        // 递归处理子节点
        if (figmaNode.children && figmaNode.children.length > 0) {
            figmaNode.children.forEach(child => {
                this.processNode(child, layoutNode);
            });
        }
    }

    // 创建标准化的布局节点
    createLayoutNode(figmaNode) {
        const node = {
            id: figmaNode.id,
            type: figmaNode.type,
            name: figmaNode.name || 'unnamed',
            children: [],
            layout: {
                width: 0,
                height: 0,
                left: 0,
                top: 0,
                flexDirection: 'row', // 默认为水平布局
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                flexWrap: 'nowrap',
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                },
                margin: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            style: {
                backgroundColor: 'transparent',
                color: '#000000',
                fontSize: 16,
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'normal',
                textAlign: 'left'
            },
            content: {
                text: '',
                image: null
            }
        };

        // 处理尺寸和位置
        if (figmaNode.absoluteBoundingBox) {
            const { x, y, width, height } = figmaNode.absoluteBoundingBox;
            node.layout.width = width;
            node.layout.height = height;
            node.layout.left = x;
            node.layout.top = y;
        }

        // 处理布局模式
        if (figmaNode.layoutMode) {
            switch (figmaNode.layoutMode) {
                case 'HORIZONTAL':
                    node.layout.flexDirection = 'row';
                    break;
                case 'VERTICAL':
                    node.layout.flexDirection = 'column';
                    break;
                case 'NONE':
                    node.layout.flexDirection = 'row';
                    break;
            }
        }

        // 处理对齐方式
        if (figmaNode.primaryAxisAlignItems) {
            switch (figmaNode.primaryAxisAlignItems) {
                case 'MIN':
                    node.layout.alignItems = 'flex-start';
                    break;
                case 'CENTER':
                    node.layout.alignItems = 'center';
                    break;
                case 'MAX':
                    node.layout.alignItems = 'flex-end';
                    break;
                case 'SPACE_BETWEEN':
                    node.layout.justifyContent = 'space-between';
                    break;
            }
        }

        // 处理文本内容
        if (figmaNode.type === 'TEXT') {
            node.content.text = figmaNode.characters || '';
            
            // 处理文本样式
            if (figmaNode.style) {
                if (figmaNode.style.fontSize) {
                    node.style.fontSize = figmaNode.style.fontSize;
                }
                if (figmaNode.style.fontFamily) {
                    node.style.fontFamily = figmaNode.style.fontFamily;
                }
                if (figmaNode.style.fontWeight) {
                    node.style.fontWeight = figmaNode.style.fontWeight;
                }
                if (figmaNode.style.textColor) {
                    node.style.color = figmaNode.style.textColor;
                }
            }
        }

        // 处理容器类型
        if (figmaNode.type === 'FRAME' || figmaNode.type === 'INSTANCE') {
            // 处理内边距
            if (figmaNode.padding) {
                node.layout.padding = {
                    left: figmaNode.padding.left || 0,
                    right: figmaNode.padding.right || 0,
                    top: figmaNode.padding.top || 0,
                    bottom: figmaNode.padding.bottom || 0
                };
            }

            // 处理边距（在Figma中是通过位置计算的，这里简化处理）
            if (figmaNode.layoutMode === 'HORIZONTAL' || figmaNode.layoutMode === 'VERTICAL') {
                // 如果是布局容器，设置默认的间距
                node.layout.spacing = figmaNode.itemSpacing || 0;
            }
        }

        // 处理图片
        if (figmaNode.type === 'IMAGE' || figmaNode.type === 'INSTANCE' && figmaNode.children && figmaNode.children.length > 0) {
            // 检查是否有图片填充
            if (figmaNode.fills && figmaNode.fills.length > 0) {
                const fill = figmaNode.fills[0];
                if (fill.type === 'IMAGE') {
                    node.content.image = {
                        url: fill.imageRef,
                        width: figmaNode.absoluteBoundingBox?.width || 0,
                        height: figmaNode.absoluteBoundingBox?.height || 0
                    };
                }
            }
        }

        return node;
    }
}

// 导出转换器
module.exports = FigmaToLayoutConverter;

// 测试函数
async function testConversion() {
    try {
        const figmaData = JSON.parse(fs.readFileSync('figma_raw.json', 'utf8'));
        const converter = new FigmaToLayoutConverter();
        const layoutNodes = converter.convert(figmaData);
        
        // 保存转换结果
        fs.writeFileSync('layout_nodes.json', JSON.stringify(layoutNodes, null, 2));
        console.log(`转换完成！生成了 ${layoutNodes.length} 个布局节点`);
        console.log('布局节点已保存到 layout_nodes.json');
        
        // 输出前几个节点的概要
        console.log('\n前3个布局节点概要:');
        layoutNodes.slice(0, 3).forEach((node, index) => {
            console.log(`${index + 1}. ${node.type}: ${node.name} (${node.layout.width}x${node.layout.height})`);
        });
        
    } catch (error) {
        console.error('转换失败:', error.message);
    }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    testConversion();
}