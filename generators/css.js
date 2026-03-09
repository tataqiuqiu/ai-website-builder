const { generateCSS: generateAICSS } = require("../ai");

async function generateCSS(layout, useAI = true) {
  if (useAI) {
    console.log("使用 AI 生成 CSS...");
    try {
      const aiCSS = await generateAICSS(layout);
      return aiCSS;
    } catch (error) {
      console.error("AI 生成 CSS 失败，使用硬编码 CSS:", error.message);
      return generateLegacyCSS(layout);
    }
  } else {
    console.log("使用硬编码 CSS...");
    return generateLegacyCSS(layout);
  }
}

function generateLegacyCSS(layout) {
  // 基础通用样式
  let css = `
/* 基础重置 */
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.6;
  color: #333;
}

h1, h2, h3, p {
  margin-top: 0;
}

button {
  cursor: pointer;
  background: #0070f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  transition: background 0.3s ease;
}

button:hover {
  background: #0051a2;
}

/* 容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Section 通用样式 */
section {
  padding: 80px 20px;
}

/* Section Header */
.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.section-button {
  margin-top: 40px;
  padding: 12px 40px;
  font-size: 18px;
}
`;

  // banner 样式
  css += `
/* Banner */
.banner {
  text-align: center;
  padding: 120px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.banner-content {
  max-width: 800px;
  margin: 0 auto;
}

.banner-title {
  font-size: 3.5rem;
  margin-bottom: 20px;
  font-weight: 700;
}

.banner-subtitle {
  font-size: 1.5rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.banner-button {
  background: white;
  color: #667eea;
  padding: 15px 50px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.banner-button:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
`;

  // features 样式
  css += `
/* Features */
.features {
  background: #f8f9fa;
}

.features-list {
  display: flex;
  justify-content: center;
  gap: 40px;
  list-style: none;
  padding: 0;
  flex-wrap: wrap;
}

.feature-item {
  background: white;
  padding: 40px;
  border-radius: 12px;
  min-width: 280px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 20px;
}

.feature-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
}

.feature-description {
  color: #666;
  line-height: 1.8;
}
`;

  // cards 样式
  css += `
/* Cards */
.cards-list {
  display: flex;
  justify-content: center;
  gap: 30px;
  list-style: none;
  padding: 0;
  flex-wrap: wrap;
}

.card-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  min-width: 300px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.card-content {
  padding: 30px;
}

.card-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
}

.card-description {
  color: #666;
  line-height: 1.8;
  margin-bottom: 20px;
}

.card-button {
  background: #667eea;
  color: white;
  padding: 10px 30px;
  border-radius: 25px;
  font-size: 14px;
  transition: background 0.3s ease;
}

.card-button:hover {
  background: #5568d3;
}
`;

  // list 样式
  css += `
/* List */
.list-items {
  list-style: none;
  padding: 0;
  max-width: 800px;
  margin: 0 auto;
}

.list-item {
  padding: 25px 30px;
  margin: 15px 0;
  background: white;
  border-left: 4px solid #667eea;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.list-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.list-item-title {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #333;
}

.list-item-description {
  color: #666;
  line-height: 1.6;
}
`;

  // cms-list 样式
  css += `
/* CMS List */
.cms-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.cms-field {
  display: flex;
  flex-direction: column;
}

.cms-field-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.cms-field-input {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.cms-field-input:focus {
  outline: none;
  border-color: #667eea;
}
`;

  // footer 样式
  css += `
/* Footer */
.footer {
  background: #1a1a2e;
  color: white;
  padding: 80px 20px;
  margin-top: 80px;
}

.footer-title {
  font-size: 2rem;
  margin-bottom: 20px;
  color: white;
}

.footer-subtitle {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 30px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 30px;
  list-style: none;
  padding: 0;
  flex-wrap: wrap;
}

.footer-link a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link a:hover {
  color: white;
}
`;

  // 响应式设计
  css += `
/* 响应式断点 */
@media (max-width: 900px) {
  .features-list,
  .cards-list {
    flex-direction: column;
    align-items: center;
  }
  
  .feature-item,
  .card-item {
    min-width: 100%;
    margin-bottom: 20px;
  }
  
  .banner-title {
    font-size: 2.5rem;
  }
  
  .banner-subtitle {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .banner {
    padding: 80px 15px;
  }
  
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-subtitle {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
  
  .feature-item,
  .card-item {
    padding: 25px;
  }
  
  .cms-fields {
    grid-template-columns: 1fr;
  }
}
`;

  return css;
}

module.exports = generateCSS;