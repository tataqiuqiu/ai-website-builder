const fs = require('fs');

// Figma JSON 转换为 Layout Node 的转换器
class FigmaToLayoutConverter {
    constructor() {
        this.layoutNodes = [];
        this.pageWidth = 1920; // 默认页面宽度
    }

    // 主转换方法
    convert(figmaData) {
        this.layoutNodes = [];
        
        // 获取页面宽度（从根节点）
        if (figmaData && figmaData.absoluteBoundingBox) {
            this.pageWidth = figmaData.absoluteBoundingBox.width || 1920;
        }
        
        // 如果是 DOCUMENT 或 PAGE 或 CANVAS，则处理其子节点
        if (figmaData.type === 'DOCUMENT' || figmaData.type === 'PAGE' || figmaData.type === 'CANVAS') {
            if (figmaData.children) {
                figmaData.children.forEach(child => {
                    this.processNode(child, null);
                });
            }
        } else {
            this.processNode(figmaData, null);
        }
        
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
            isSection: false, // 标记是否为 Section
            isContainer: false, // 标记是否为 Container
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

        // 检测是否为 Section
        node.isSection = this.detectSection(figmaNode);
        
        // 检测是否为 Container
        node.isContainer = this.detectContainer(figmaNode);

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
                // 处理文本对齐
                if (figmaNode.style.textAlignHorizontal) {
                    switch(figmaNode.style.textAlignHorizontal) {
                        case 'LEFT': node.style.textAlign = 'left'; break;
                        case 'RIGHT': node.style.textAlign = 'right'; break;
                        case 'CENTER': node.style.textAlign = 'center'; break;
                        case 'JUSTIFIED': node.style.textAlign = 'justify'; break;
                    }
                }
                
                // 处理文本颜色
                // 优先从 fills 中获取颜色
                if (figmaNode.fills && figmaNode.fills.length > 0) {
                    const fill = figmaNode.fills[0];
                    if (fill.type === 'SOLID' && fill.color) {
                        node.style.color = this.rgbaToHex(fill.color, fill.opacity);
                    }
                }
            }
        } else {
            // 处理背景颜色（对于非文本节点）
            if (figmaNode.fills && figmaNode.fills.length > 0) {
                // 查找第一个可见的填充
                const fill = figmaNode.fills.find(f => f.visible !== false);
                if (fill) {
                    if (fill.type === 'SOLID' && fill.color) {
                        node.style.backgroundColor = this.rgbaToHex(fill.color, fill.opacity);
                    } else if (fill.type === 'IMAGE') {
                        // 如果是图片填充，记录图片引用
                        node.content.image = {
                            url: fill.imageRef,
                            width: figmaNode.absoluteBoundingBox?.width || 0,
                            height: figmaNode.absoluteBoundingBox?.height || 0
                        };
                        // 设置背景图样式以便 CSS 生成器使用
                        node.style.backgroundImage = `url(${fill.imageRef})`;
                        node.style.backgroundSize = fill.scaleMode === 'FILL' ? 'cover' : 'contain';
                    } else if (fill.type === 'GRADIENT_LINEAR') {
                        // 简单处理线性渐变
                        // 这里只是一个简化实现，实际可能需要更复杂的转换
                        if (fill.gradientStops && fill.gradientStops.length >= 2) {
                            const stop1 = fill.gradientStops[0];
                            const stop2 = fill.gradientStops[fill.gradientStops.length - 1];
                            const color1 = this.rgbaToHex(stop1.color);
                            const color2 = this.rgbaToHex(stop2.color);
                            node.style.background = `linear-gradient(to bottom, ${color1}, ${color2})`;
                        }
                    }
                }
            }
            
            // 处理描边（边框）
            if (figmaNode.strokes && figmaNode.strokes.length > 0) {
                const stroke = figmaNode.strokes[0];
                if (stroke.type === 'SOLID' && stroke.color) {
                    node.style.borderColor = this.rgbaToHex(stroke.color, stroke.opacity);
                    node.style.borderWidth = figmaNode.strokeWeight || 1;
                    node.style.borderStyle = 'solid';
                }
            }
            
            // 处理圆角
            if (figmaNode.cornerRadius) {
                node.style.borderRadius = figmaNode.cornerRadius;
            } else if (figmaNode.rectangleCornerRadii) {
                // 处理四个角不同的圆角
                const [tl, tr, br, bl] = figmaNode.rectangleCornerRadii;
                node.style.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
            }
            
            // 处理效果（阴影等）
            if (figmaNode.effects && figmaNode.effects.length > 0) {
                const shadow = figmaNode.effects.find(e => e.type === 'DROP_SHADOW' && e.visible !== false);
                if (shadow) {
                    const color = this.rgbaToHex(shadow.color, shadow.color.a);
                    const x = shadow.offset.x;
                    const y = shadow.offset.y;
                    const blur = shadow.radius;
                    const spread = shadow.spread || 0;
                    node.style.boxShadow = `${x}px ${y}px ${blur}px ${spread}px ${color}`;
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

    // 检测节点是否为 Section
    detectSection(figmaNode) {
        // 只检测容器类型的节点
        if (figmaNode.type !== 'FRAME' && figmaNode.type !== 'INSTANCE') {
            return false;
        }

        // 获取节点宽度
        const nodeWidth = figmaNode.absoluteBoundingBox?.width || 0;
        const nodeHeight = figmaNode.absoluteBoundingBox?.height || 0;

        // 计算宽度比例
        const widthRatio = nodeWidth / this.pageWidth;

        // 判断条件：宽度占比超过 90% 且高度大于 200px
        if (widthRatio > 0.9 && nodeHeight > 200) {
            return true;
        }

        return false;
    }

    // 检测节点是否为 Container（根据用户提供的代码实现）
    detectContainer(node) {
        // 只检测容器类型的节点
        if (node.type !== 'FRAME' && node.type !== 'INSTANCE') {
            return false;
        }

        const nodeWidth = node.absoluteBoundingBox?.width || 0;
        const diff = this.pageWidth - nodeWidth;

        // 如果宽度差大于200，则认为是容器
        if (diff > 200) {
            return true;
        }

        return false;
    }
    // 辅助方法：RGBA 转 Hex
    rgbaToHex(color, opacity = 1) {
        if (!color) return 'transparent';
        
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        
        // 处理透明度
        let a = color.a !== undefined ? color.a : 1;
        a = a * opacity;
        
        if (a >= 0.99) {
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        } else {
            return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
        }
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