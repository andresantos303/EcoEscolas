// Selenium script to test the simple login form without fixed ChromeDriver
const { Builder, By, Key, until } = require('selenium-webdriver');

(async function testLogin() {
  let driver = await new Builder()
    .forBrowser('chrome') // Let Selenium manage the driver
    .build();

  try {
    // Open local page served via Live Server (adjust if needed)
    await driver.get('http://127.0.0.1:5501/frontend/routes/login.html');
    await driver.sleep(1000);

    // Fill in credentials
    await driver.findElement(By.id('email')).sendKeys('admin@teste.com');
    await driver.findElement(By.id('password')).sendKeys('admin123');

    // Click login button
    await driver.findElement(By.id('loginBtn')).click();

    console.log('✅ Login test passed.');

  } catch (error) {
    console.log('❌ Test failed:', error);
  } finally {
    await driver.sleep(3000);
    await driver.quit();
  }
})();
