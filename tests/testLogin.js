// Selenium script to test the simple login form without fixed ChromeDriver
const { Builder, By, Key, until } = require('selenium-webdriver');

(async function testLogin() {
  let driver = await new Builder()
    .forBrowser('chrome') // Let Selenium manage the driver
    .build();

  try {
    // Open local page served via Live Server (adjust if needed)
    await driver.get('http://127.0.0.1:5500/login.html');
    await driver.sleep(1000);

    // Fill in credentials
    await driver.findElement(By.id('email')).sendKeys('secretariado@gmail.com');
    await driver.findElement(By.id('password')).sendKeys('User1234');

    // Click login button
    await driver.findElement(By.id('loginBtn')).click();

    // Wait for the success message to appear
    await driver.wait(until.elementIsVisible(await driver.findElement(By.id('success'))), 5000);

    console.log('✅ Login test passed.');

  } catch (error) {
    console.log('❌ Test failed:', error);
  } finally {
    await driver.sleep(3000);
    await driver.quit();
  }
})();
