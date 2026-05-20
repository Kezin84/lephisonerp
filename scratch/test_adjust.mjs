import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:5174/');
    
    await page.waitForSelector('.icon-btn', { timeout: 5000 });
    
    // Check if we need to open the quote creation form
    // The previous script failed here, maybe the button has a different class or title
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const title = await btn.evaluate(b => b.title);
      if (title.includes('tạo mới Báo giá') || title.includes('Báo giá mới')) {
        await btn.click();
        console.log('Clicked create quote button');
        break;
      }
    }
    
    await page.waitForTimeout(1000);
    
    // Look for add item manually button
    const addManualBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent.includes('Nhập tay'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    
    if (addManualBtn) {
      console.log('Clicked add manual item');
      await page.waitForTimeout(1000);
      
      // Look for the edit button
      const editBtn = await page.$('.btn-edit');
      if (editBtn) {
        await editBtn.click();
        console.log('Clicked edit item');
        await page.waitForTimeout(1000);
        
        // Look for the adjust price button
        const adjustBtn = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const target = btns.find(b => b.title === 'Điều chỉnh Giá Lic');
          if (target) {
            target.click();
            return true;
          }
          return false;
        });
        
        if (adjustBtn) {
          console.log('Clicked adjust price for Giá Lic');
          await page.waitForTimeout(1000);
          
          // Select 'number' radio
          await page.evaluate(() => {
            const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
            const target = radios.find(r => r.value === 'number');
            if (target) target.click();
          });
          console.log('Selected Đặt tổng tiền mới');
          await page.waitForTimeout(500);
          
          // Input 10000
          await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
            // The last number input is probably the one in adjustPriceModal
            const target = inputs[inputs.length - 1];
            if (target) {
              target.value = 10000;
              target.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });
          console.log('Inputted 10000');
          await page.waitForTimeout(500);
          
          // Click Áp dụng
          await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const target = btns.find(b => b.textContent.includes('Áp dụng'));
            if (target) target.click();
          });
          console.log('Clicked Áp dụng');
          
          await page.waitForTimeout(1000);
          console.log('Test completed successfully');
        } else {
          console.log('Adjust price button not found');
        }
      } else {
        console.log('Edit item button not found');
      }
    } else {
      console.log('Add manual item button not found');
    }
    
    await browser.close();
  } catch (err) {
    console.error('Test error:', err);
  }
})();
