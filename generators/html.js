function generateHTML(layout){

let html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI生成页面</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
`

    layout.sections.forEach(section => {

        if(section.type === "banner"){
            html += `
<section class="banner">
    <div class="container">
        <div class="banner-content">
            <h1 class="banner-title">${section.title}</h1>
            ${section.subtitle ? `<p class="banner-subtitle">${section.subtitle}</p>` : ''}
            ${section.button ? `<button class="banner-button">${section.button}</button>` : ''}
        </div>
    </div>
</section>
`
        }

        if(section.type === "features"){
            html += `
<section class="features">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">${section.title}</h2>
            ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
        </div>
        ${section.items ? `
        <ul class="features-list">
            ${section.items.map(item => `
            <li class="feature-item">
                <div class="feature-icon"></div>
                <h3 class="feature-title">${item.title}</h3>
                ${item.description ? `<p class="feature-description">${item.description}</p>` : ''}
            </li>
            `).join('')}
        </ul>
        ` : ''}
        ${section.button ? `<button class="section-button">${section.button}</button>` : ''}
    </div>
</section>
`
        }

        if(section.type === "cards"){
            html += `
<section class="cards">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">${section.title}</h2>
            ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
        </div>
        ${section.items ? `
        <ul class="cards-list">
            ${section.items.map(item => `
            <li class="card-item">
                <div class="card-content">
                    <h3 class="card-title">${item.title}</h3>
                    ${item.description ? `<p class="card-description">${item.description}</p>` : ''}
                    ${item.button ? `<button class="card-button">${item.button}</button>` : ''}
                </div>
            </li>
            `).join('')}
        </ul>
        ` : ''}
        ${section.button ? `<button class="section-button">${section.button}</button>` : ''}
    </div>
</section>
`
        }

        if(section.type === "list"){
            html += `
<section class="list">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">${section.title}</h2>
            ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
        </div>
        ${section.items ? `
        <ul class="list-items">
            ${section.items.map(item => `
            <li class="list-item">
                <h3 class="list-item-title">${item.title}</h3>
                ${item.description ? `<p class="list-item-description">${item.description}</p>` : ''}
            </li>
            `).join('')}
        </ul>
        ` : ''}
        ${section.button ? `<button class="section-button">${section.button}</button>` : ''}
    </div>
</section>
`
        }

        if(section.type === "cms-list"){
            html += `
<section class="cms-list">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">${section.title || 'CMS 列表'}</h2>
            ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
        </div>
        ${section.fields ? `
        <div class="cms-fields">
            ${section.fields.map(field => `
            <div class="cms-field">
                <label class="cms-field-label">${field}</label>
                <input type="text" class="cms-field-input" placeholder="${field}">
            </div>
            `).join('')}
        </div>
        ` : ''}
        ${section.button ? `<button class="section-button">${section.button}</button>` : ''}
    </div>
</section>
`
        }

        if(section.type === "footer"){
            html += `
<section class="footer">
    <div class="container">
        ${section.title ? `<h2 class="footer-title">${section.title}</h2>` : ''}
        ${section.subtitle ? `<p class="footer-subtitle">${section.subtitle}</p>` : ''}
        ${section.items ? `
        <ul class="footer-links">
            ${section.items.map(item => `
            <li class="footer-link"><a href="#">${item.title}</a></li>
            `).join('')}
        </ul>
        ` : ''}
    </div>
</section>
`
        }

    })

    html += `
</body>
</html>
`

    return html

}

module.exports = generateHTML