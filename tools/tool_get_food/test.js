const puppeteer = require('puppeteer');

async function test() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  await page.goto('https://guide.michelin.com/en/vn/hanoi-region/hanoi/restaurants', { waitUntil: 'networkidle2' });
  const cards = await page.evaluate(() => {
    // Try to find the h3 or a tags containing names
    return Array.from(document.querySelectorAll('.card__menu-content--title a')).map(a => a.innerText);
  });
  console.log("Michelin Titles:", cards.length > 0 ? cards : "None found with .card__menu-content--title a");
  
  if (cards.length === 0) {
    const backupCards = await page.evaluate(() => {
      // Look for h3 classes
      return Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim()).filter(t => t.length > 0);
    });
    console.log("H3 Tags:", backupCards.slice(0, 10));
  }
  await browser.close();
}
test();
