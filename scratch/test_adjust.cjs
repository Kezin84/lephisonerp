const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5174/');
  
  await page.waitForSelector('button[title="Mở form tạo mới Báo giá"]', { timeout: 5000 });
  await page.click('button[title="Mở form tạo mới Báo giá"]');
  await page.waitForTimeout(500);
  
  // click the edit button of the first row
  const editBtn = await page.$('.btn-edit');
  if (editBtn) {
    await editBtn.click();
    console.log('Clicked edit button');
    await page.waitForTimeout(500);
    
    // click the adjust price button
    const adjustBtn = await page.$('button[title="Điều chỉnh Giá Lic"]');
    if (adjustBtn) {
      await adjustBtn.click();
      console.log('Clicked adjust button');
      await page.waitForTimeout(500);
      
      // click apply button
      const applyBtn = await page.$('.lucide-check');
      if (applyBtn) {
        await applyBtn.evaluate(b => b.parentNode.click());
        console.log('Clicked apply button');
      } else {
        console.log('Apply button not found');
      }
    } else {
      console.log('Adjust button not found');
    }
  } else {
    console.log('Edit button not found');
  }
  
  await page.waitForTimeout(1000);
  await browser.close();
})();
