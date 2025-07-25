import { Builder, By, until } from 'selenium-webdriver';
import assert from 'assert';
import http from 'http';

const environment = process.argv[2] || 'local';

const seleniumUrl = environment === 'github'
  ? 'http://selenium:4444/wd/hub' 
  : 'http://localhost:4444/wd/hub';

const serverUrl = environment === 'github'
  ? 'http://testserver:80'
  : 'http://host.docker.internal:80'; // for Docker + host network

console.log(`Running tests in '${environment}' environment`);
console.log(`Selenium URL: ${seleniumUrl}`);
console.log(`Server URL: ${serverUrl}`);

async function checkWebServerUp() {
  return new Promise((resolve, reject) => {
    http.get(serverUrl, res => {
      console.log(`Status code from ${serverUrl}: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log('✅ Web server is running on port 80');
        resolve();
      } else {
        reject(new Error('Web server returned non-200 status'));
      }
    }).on('error', err => {
      reject(new Error('Web server is not reachable: ' + err.message));
    });
  });
}

async function runInputTest(driver, testInput, shouldRedirect, expectedText = '') {
  await driver.get(serverUrl);

  const input = await driver.wait(until.elementLocated(By.css('input[name="search"]')), 5000);
  await input.clear();
  await input.sendKeys(testInput);

  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await submitButton.click();

  if (shouldRedirect) {
    await driver.wait(until.urlContains('/result'), 5000);
    const body = await driver.findElement(By.tagName('body'));
    const bodyText = await body.getText();
    console.log(`Redirected content: ${bodyText}`);
    assert.ok(bodyText.includes(expectedText), 'Expected text not found on /result page');
    console.log(`Passed: "${testInput}" accepted and displayed.`);
  } else {
    // Remains on home with warning
    await driver.wait(until.urlContains('/?warn=1'), 5000);
    console.log(`Passed: "${testInput}" correctly rejected and stayed on home page.`);
  }
}

(async function runTests() {
  try {
    // 1. Check server on port 80
    await checkWebServerUp();

    const driver = await new Builder()
      .forBrowser('chrome')
      .usingServer(seleniumUrl)
      .build();

    try {
      // 2. SQL injection input
      await runInputTest(driver, "' OR 1=1 --", false);

      // 3. XSS attack input
      await runInputTest(driver, "<script>alert(1)</script>", false);

      // 4. Normal input
      await runInputTest(driver, "apple123", true, "apple123");

    } finally {
      await driver.quit();
    }

  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
