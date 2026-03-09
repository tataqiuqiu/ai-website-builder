const fs = require('fs');

// 读取 Figma JSON
const figmaData = JSON.parse(fs.readFileSync('figma_raw.json', 'utf8'));

// 递归遍历节点并打印结构
function analyzeNode(node, indent = 0) {
    const prefix = '  '.repeat(indent);
    const type = node.type || 'UNKNOWN';
    const name = node.name || 'unnamed';
    const id = node.id;
    
    let info = `${prefix}- [${type}] ${name} (id: ${id})`;
    
    // 如果有尺寸信息
    if (node.absoluteBoundingBox) {
        const { x, y, width, height } = node.absoluteBoundingBox;
        info += ` @(${x},${y}) ${width}x${height}`;
    }
    
    // 如果有 AutoLayout 信息
    if (node.layoutMode) {
        info += ` | Layout: ${node.layoutMode}`;
        if (node.primaryAxisSizingMode) {
            info += ` (${node.primaryAxisSizingMode}/${node.secondaryAxisSizingMode})`;
        }
        if (node.primaryAxisAlignItems) {
            info += ` | Align: ${node.primaryAxisAlignItems}`;
        }
        if (node.counterAxisSizingMode) {
            info += ` | Counter: ${node.counterAxisSizingMode}`;
        }
    }
    
    console.log(info);
    
    // 如果有子节点
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => analyzeNode(child, indent + 1));
    }
}

// 分析根节点
console.log('=== Figma Node Structure ===\n');
analyzeNode(figmaData);

// 统计信息
function countNodes(node) {
    const counts = { total: 1, byType: {} };
    
    const type = node.type || 'UNKNOWN';
    counts.byType[type] = (counts.byType[type] || 0) + 1;
    
    if (node.children) {
        node.children.forEach(child => {
            const childCounts = countNodes(child);
            counts.total += childCounts.total;
            for (const [type, count] of Object.entries(childCounts.byType)) {
                counts.byType[type] = (counts.byType[type] || 0) + count;
            }
        });
    }
    
    return counts;
}

console.log('\n=== Node Statistics ===');
const stats = countNodes(figmaData);
console.log('Total nodes:', stats.total);
console.log('By type:', stats.byType);