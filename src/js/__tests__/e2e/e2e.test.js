import puppetteer from 'puppeteer';
import { fork } from 'child_process';

jest.setTimeout(30000); // default puppeteer timeout

describe('Форма валидатора кредитной карты', () => {
  let browser = null;
  let page = null;
  let server = null;
  const baseUrl = 'http://localhost:9000';

  beforeAll(async () => {
    server = fork(`${__dirname}/e2e.server.js`);
    await new Promise((resolve, reject) => {
      server.on('error', reject);
      server.on('message', (message) => {
        if (message === 'ok') {
          resolve();
        }
      });
    });

    browser = await puppetteer.launch({
      // headless: false, // show gui
      // slowMo: 250,
      // devtools: true, // show devTools
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    server.kill();
  });

  test('должен проверить валидный номер кредитной карты с помощью Enter ', async () => {
    await page.goto(baseUrl);
    const form = await page.$('[data-widget=creditCard-form-widget]');
    const input = await form.$('[data-id=creditCard-input]');
    await input.type('6011887534423704938');
    await input.press('Enter');
    await page.waitForSelector('.cardTitle');
  });
  test('должен проверить валидный номер кредитной карты с помощью button', async () => {
    await page.goto(baseUrl);
    const form = await page.$('[data-widget=creditCard-form-widget]');
    const input = await form.$('[id=creditCard-input]');
    await input.type('6011887534423704938');
    const button = await form.$('[data-id=creditCard-submit]');
    button.click();
    await page.waitForSelector('.cardTitle');
  });
  test('должен проверить не валидный номер кредитной карты с помощью Enter ', async () => {
    await page.goto(baseUrl);
    const form = await page.$('[data-widget=creditCard-form-widget]');
    const input = await form.$('[data-id=creditCard-input]');
    await input.type('6011182724579612500');
    await input.press('Enter');
    await page.waitForSelector('.cardTitle');
  });
  test('должен проверить не валидный номер кредитной карты с помощью button', async () => {
    await page.goto(baseUrl);
    const form = await page.$('[data-widget=creditCard-form-widget]');
    const input = await form.$('[id=creditCard-input]');
    await input.type('6011887534423704500');
    const button = await form.$('[data-id=creditCard-submit]');
    button.click();
    await page.waitForSelector('.cardTitle');
  });
});
