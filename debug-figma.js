const fs = require('fs');
const { getFigmaFile } = require('./figma');

async function debug() {
    console.log("正在获取 Figma 数据...");
    try {
        const figmaData = await getFigmaFile();
        console.log("获取成功，正在写入 figma_raw.json...");
        fs.writeFileSync('figma_raw.json', JSON.stringify(figmaData, null, 2));
        console.log("完成！");
    } catch (e) {
        console.error("获取失败:", e);
    }
}

debug();