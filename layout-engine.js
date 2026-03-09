const fs = require('fs');

// 布局引擎类
class LayoutEngine {
    constructor() {
        this.yoga = null;
        this.yogaNodes = new Map(); // 存储Yoga节点映射
    }

    // 初始化Yoga引擎
    async init() {
        const Yoga = await import('yoga-layout');
        this.yoga = Yoga.default;
        console.log('Yoga Layout 引擎初始化成功');
    }

    // 主方法：计算布局
    async calculateLayout(layoutNodes) {
        if (!this.yoga) {
            await this.init();
        }

        this.yogaNodes.clear();

        // 创建Yoga树
        const rootYogaNode = this.createYogaTree(layoutNodes);

        // 计算布局
        this.performLayoutCalculation(rootYogaNode, layoutNodes);

        // 读取计算结果
        this.readComputedLayout(layoutNodes);

        // 清理Yoga节点
        rootYogaNode.freeRecursive();

        return layoutNodes;
    }

    // 创建Yoga树
    createYogaTree(layoutNodes) {
        if (!layoutNodes || layoutNodes.length === 0) {
            return null;
        }

        // 创建根节点
        const rootNode = this.createYogaNode(layoutNodes[0]);
        this.yogaNodes.set(layoutNodes[0].id, rootNode);

        // 递归创建子节点
        this.createChildYogaNodes(layoutNodes[0], rootNode);

        return rootNode;
    }

    // 递归创建子节点
    createChildYogaNodes(layoutNode, parentYogaNode) {
        if (!layoutNode.children || layoutNode.children.length === 0) {
            return;
        }

        layoutNode.children.forEach((childLayoutNode, index) => {
            const childYogaNode = this.createYogaNode(childLayoutNode);
            this.yogaNodes.set(childLayoutNode.id, childYogaNode);
            parentYogaNode.insertChild(childYogaNode, index);

            // 递归处理子节点的子节点
            this.createChildYogaNodes(childLayoutNode, childYogaNode);
        });
    }

    // 创建单个Yoga节点
    createYogaNode(layoutNode) {
        const yogaNode = this.yoga.Node.create();

        // 设置尺寸
        if (layoutNode.layout.width > 0) {
            yogaNode.setWidth(layoutNode.layout.width);
        }
        if (layoutNode.layout.height > 0) {
            yogaNode.setHeight(layoutNode.layout.height);
        }

        // 设置布局方向
        if (layoutNode.layout.flexDirection === 'column') {
            yogaNode.setFlexDirection(this.yoga.FLEX_DIRECTION_COLUMN);
        } else {
            yogaNode.setFlexDirection(this.yoga.FLEX_DIRECTION_ROW);
        }

        // 设置对齐方式
        if (layoutNode.layout.justifyContent) {
            switch (layoutNode.layout.justifyContent) {
                case 'flex-start':
                    yogaNode.setJustifyContent(this.yoga.JUSTIFY_FLEX_START);
                    break;
                case 'center':
                    yogaNode.setJustifyContent(this.yoga.JUSTIFY_CENTER);
                    break;
                case 'flex-end':
                    yogaNode.setJustifyContent(this.yoga.JUSTIFY_FLEX_END);
                    break;
                case 'space-between':
                    yogaNode.setJustifyContent(this.yoga.JUSTIFY_SPACE_BETWEEN);
                    break;
                case 'space-around':
                    yogaNode.setJustifyContent(this.yoga.JUSTIFY_SPACE_AROUND);
                    break;
            }
        }

        if (layoutNode.layout.alignItems) {
            switch (layoutNode.layout.alignItems) {
                case 'flex-start':
                    yogaNode.setAlignItems(this.yoga.ALIGN_FLEX_START);
                    break;
                case 'center':
                    yogaNode.setAlignItems(this.yoga.ALIGN_CENTER);
                    break;
                case 'flex-end':
                    yogaNode.setAlignItems(this.yoga.ALIGN_FLEX_END);
                    break;
                case 'stretch':
                    yogaNode.setAlignItems(this.yoga.ALIGN_STRETCH);
                    break;
            }
        }

        // 设置内边距
        if (layoutNode.layout.padding) {
            yogaNode.setPadding(this.yoga.EDGE_LEFT, layoutNode.layout.padding.left);
            yogaNode.setPadding(this.yoga.EDGE_RIGHT, layoutNode.layout.padding.right);
            yogaNode.setPadding(this.yoga.EDGE_TOP, layoutNode.layout.padding.top);
            yogaNode.setPadding(this.yoga.EDGE_BOTTOM, layoutNode.layout.padding.bottom);
        }

        // 设置外边距
        if (layoutNode.layout.margin) {
            yogaNode.setMargin(this.yoga.EDGE_LEFT, layoutNode.layout.margin.left);
            yogaNode.setMargin(this.yoga.EDGE_RIGHT, layoutNode.layout.margin.right);
            yogaNode.setMargin(this.yoga.EDGE_TOP, layoutNode.layout.margin.top);
            yogaNode.setMargin(this.yoga.EDGE_BOTTOM, layoutNode.layout.margin.bottom);
        }

        // 设置间距
        if (layoutNode.layout.spacing) {
            yogaNode.setGap(this.yoga.GUTTER_ALL, layoutNode.layout.spacing);
        }

        return yogaNode;
    }

    // 执行布局计算
    performLayoutCalculation(rootYogaNode, layoutNodes) {
        if (!rootYogaNode || !layoutNodes || layoutNodes.length === 0) {
            return;
        }

        const rootNode = layoutNodes[0];
        const width = rootNode.layout.width || 1920;
        const height = rootNode.layout.height || 1080;

        // 计算布局
        rootYogaNode.calculateLayout(width, height, this.yoga.DIRECTION_LTR);
    }

    // 读取计算后的布局
    readComputedLayout(layoutNodes) {
        if (!layoutNodes || layoutNodes.length === 0) {
            return;
        }

        // 递归读取每个节点的计算结果
        this.readNodeComputedLayout(layoutNodes[0]);
    }

    // 递归读取节点计算结果
    readNodeComputedLayout(layoutNode) {
        const yogaNode = this.yogaNodes.get(layoutNode.id);
        if (!yogaNode) {
            return;
        }

        // 读取计算后的布局信息
        layoutNode.computedLayout = {
            width: yogaNode.getComputedWidth(),
            height: yogaNode.getComputedHeight(),
            left: yogaNode.getComputedLeft(),
            top: yogaNode.getComputedTop(),
            right: yogaNode.getComputedRight(),
            bottom: yogaNode.getComputedBottom(),
            marginLeft: yogaNode.getComputedMargin(this.yoga.EDGE_LEFT),
            marginRight: yogaNode.getComputedMargin(this.yoga.EDGE_RIGHT),
            marginTop: yogaNode.getComputedMargin(this.yoga.EDGE_TOP),
            marginBottom: yogaNode.getComputedMargin(this.yoga.EDGE_BOTTOM),
            paddingLeft: yogaNode.getComputedPadding(this.yoga.EDGE_LEFT),
            paddingRight: yogaNode.getComputedPadding(this.yoga.EDGE_RIGHT),
            paddingTop: yogaNode.getComputedPadding(this.yoga.EDGE_TOP),
            paddingBottom: yogaNode.getComputedPadding(this.yoga.EDGE_BOTTOM),
            borderLeftWidth: yogaNode.getComputedBorder(this.yoga.EDGE_LEFT),
            borderRightWidth: yogaNode.getComputedBorder(this.yoga.EDGE_RIGHT),
            borderTopWidth: yogaNode.getComputedBorder(this.yoga.EDGE_TOP),
            borderBottomWidth: yogaNode.getComputedBorder(this.yoga.EDGE_BOTTOM)
        };

        // 递归处理子节点
        if (layoutNode.children) {
            layoutNode.children.forEach(child => {
                this.readNodeComputedLayout(child);
            });
        }
    }
}

// 导出布局引擎
module.exports = LayoutEngine;

// 测试函数
async function testLayoutEngine() {
    try {
        console.log('开始测试布局引擎...');

        // 读取布局节点
        const layoutNodes = JSON.parse(fs.readFileSync('layout_nodes.json', 'utf8'));
        console.log(`加载了 ${layoutNodes.length} 个布局节点`);

        // 创建布局引擎
        const engine = new LayoutEngine();

        // 计算布局
        console.log('开始计算布局...');
        const computedLayout = await engine.calculateLayout(layoutNodes);
        console.log('布局计算完成！');

        // 保存计算结果
        fs.writeFileSync('computed_layout.json', JSON.stringify(computedLayout, null, 2));
        console.log('计算后的布局已保存到 computed_layout.json');

        // 显示前几个节点的计算结果
        console.log('\n前3个节点的计算结果:');
        computedLayout.slice(0, 3).forEach((node, index) => {
            if (node.computedLayout) {
                console.log(`${index + 1}. ${node.type}: ${node.name}`);
                console.log(`   原始尺寸: ${node.layout.width.toFixed(0)}x${node.layout.height.toFixed(0)}`);
                console.log(`   计算尺寸: ${node.computedLayout.width.toFixed(0)}x${node.computedLayout.height.toFixed(0)}`);
                console.log(`   计算位置: (${node.computedLayout.left.toFixed(0)}, ${node.computedLayout.top.toFixed(0)})`);
            }
        });

    } catch (error) {
        console.error('布局引擎测试失败:', error.message);
        console.error(error);
    }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    testLayoutEngine();
}