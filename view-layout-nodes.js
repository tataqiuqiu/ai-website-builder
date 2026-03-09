const fs = require('fs');

// 读取布局节点
const layoutNodes = JSON.parse(fs.readFileSync('layout_nodes.json', 'utf8'));

// 递归打印节点结构
function printNode(node, indent = 0) {
    const prefix = '  '.repeat(indent);
    const type = node.type || 'UNKNOWN';
    const name = node.name || 'unnamed';
    
    let info = `${prefix}- [${type}] ${name}`;
    if (node.layout) {
        info += ` (${node.layout.width.toFixed(0)}x${node.layout.height.toFixed(0)})`;
        if (node.layout.flexDirection) {
            info += ` | ${node.layout.flexDirection}`;
        }
    }
    console.log(info);
    
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => printNode(child, indent + 1));
    }
}

// 打印前几个节点
console.log('=== Layout Nodes Structure (前5个节点) ===\n');
layoutNodes.slice(0, 5).forEach(node => printNode(node));

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
const stats = countNodes({ children: layoutNodes });
console.log('Total nodes:', stats.total);
console.log('By type:', stats.byType);