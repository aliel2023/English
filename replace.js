const fs = require('fs'); const files = ['index.html', 'contact.html', 'daily-word.html', 'pricing.html', 'resources.html', 'test.html']; files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8'); c = c.replace(/<div class="lang-switcher">[\s\S]*?<\/div>/, `<div class="lang-dropdown nav-item">
                        <button class="lang-btn current-lang" id="currentLangBtn" onclick="toggleLangDropdown()">AZ</button>
                        <div class="lang-menu" id="langMenu">
                            <button class="lang-option" onclick="switchLanguage('az', event)">AZ</button>
                            <button class="lang-option" onclick="switchLanguage('en', event)">EN</button>
                            <button class="lang-option" onclick="switchLanguage('ru', event)">RU</button>
                            <button class="lang-option" onclick="switchLanguage('tr', event)">TR</button>
                        </div>
                    </div>`); fs.writeFileSync(f, c);
});
