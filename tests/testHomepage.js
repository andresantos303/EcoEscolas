const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

(async function ecoEscolaTest() {
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options())
    .build();

  try {
    //Navegar até à página
    await driver.get("http://127.0.0.1:5501/frontend/routes/index.html");
    console.log("➡️  Página carregada");

    //Fazer scroll até à secção de planos
    const plansSection = await driver.findElement(By.id("planoatividades"));
    await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", plansSection);
    await driver.sleep(1000);

    //Clicar no primeiro plano disponível
    await driver.wait(until.elementsLocated(By.css("#plansContainer a.recipe-card")),5000,"Os planos não carregaram a tempo");
    const planos = await driver.findElements(By.css("#plansContainer a.recipe-card"));
    if (planos.length === 0) throw new Error("Nenhum plano encontrado em #plansContainer");
    await planos[0].click();
    console.log("✅ Clicado no primeiro plano");
    await driver.sleep(800);

    //Via navbar, navegar até à secção Contacto
    const contactLink = await driver.findElement(By.linkText("Contacto"));
    await contactLink.click();
    console.log("➡️  Navegado até Contacto");
    await driver.sleep(1000);

    //Certificar que o formulário de contacto está pronto
    await driver.wait(until.elementLocated(By.name("name")), 5000);

    //Preencher o formulário
    await driver.findElement(By.name("name")).sendKeys("André Santos");
    await driver.findElement(By.name("email")).sendKeys("40210109@esmad.ipp.pt");
    await driver.findElement(By.name("message")).sendKeys("Isto é uma mensagem de teste");
    console.log("✍️  Formulário preenchido");

    //Submeter
    const submitBtn = await driver.findElement(By.css("button.contact-submit-btn"));
    await submitBtn.click();
    console.log("📤 Formulário enviado");
    await driver.sleep(2000);
    console.log('✅ Homepage test passed.');

  } catch (err) {
    console.error("❌ Erro no teste:", err);
  } finally {
    await driver.quit();
  }
})();
