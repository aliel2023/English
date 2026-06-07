const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  await page.goto('file://c:/Users/user/Desktop/alielenglish%20-%20Copy%20-%20Copy/index.html', { waitUntil: 'networkidle' });
  
  console.log("Page loaded. Testing clicks...");
  await page.click('#currentLangBtn').catch(e => console.log("Click lang err:", e.message));
  await page.waitForTimeout(500);
  
  await browser.close();
})();
