function parseSections(node){
    if(!node.children) return []

    return node.children.map(child => {
        // 提取文本内容
        let textContent = '';
        if (child.type === 'TEXT') {
            textContent = child.characters || '';
        } else if (child.children) {
            // 递归查找子节点中的文本
            const extractText = (nodes) => {
                let text = '';
                nodes.forEach(n => {
                    if (n.type === 'TEXT') {
                        text += n.characters || '';
                    } else if (n.children) {
                        text += extractText(n.children);
                    }
                });
                return text;
            };
            textContent = extractText(child.children);
        }

        return {
            name: child.name,
            type: child.type,
            childrenCount: child.children ? child.children.length : 0,
            textContent: textContent.trim()
        }
    })
}

module.exports = parseSections