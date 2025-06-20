const { Builder, By, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

(async function openChromeTest() {
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options())
    .build();

  try {
    await driver.get("http://127.0.0.1:5500/frontend/index.html");

    try {
      const cookieButton = await driver.findElement(By.id("pAtividades"));
      await cookieButton.click();
    } catch (e) {
      console.log("❕Nenhum botão do menu encontrado.");
    }

    await driver.findElement(By.name('name')).sendKeys('André Santos');
    await driver.findElement(By.name('email')).sendKeys('40210109@esmad.ipp.pt');
    await driver.findElement(By.name('message')).sendKeys('Isto é uma mensagem de teste');

    await driver.sleep(3000);
    console.log("✅ Formulário realizado com sucesso.");
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  } finally {
    await driver.quit();
  }
})();
