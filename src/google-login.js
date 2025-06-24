const { chromium } = require('playwright');
const credentialManager = require('./utils/credentials');
const DelayUtils = require('./utils/delays');

class GoogleLogin {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('Tarayıcı başlatılıyor...');
    
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS === 'true',
      slowMo: 100, // İnsan benzeri hareket
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions-except=/path/to/extension',
        '--disable-extensions',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const context = await this.browser.newContext({
      viewport: { width: 1366, height: 768 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul'
    });

    // Bot tespitini engellemek için JavaScript çalıştır
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      window.chrome = {
        runtime: {},
      };
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['tr-TR', 'tr', 'en-US', 'en'],
      });
    });

    this.page = await context.newPage();
    console.log('Tarayıcı hazır');
  }

  async login() {
    try {
      const credentials = await credentialManager.getCredentials();
      
      console.log('Google giriş sayfasına gidiliyor...');
      await this.page.goto('https://accounts.google.com/signin', {
        waitUntil: 'networkidle'
      });
      
      await DelayUtils.humanLikeDelay();

      // Email adresini gir
      console.log('Email adresi giriliyor...');
      const emailInput = await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // İnsan benzeri yazma
      await this.humanTypeText(emailInput, credentials.email);
      await DelayUtils.shortDelay();
      
      // İleri butonuna tıkla
      await this.page.click('button:has-text("İleri"), button:has-text("Next")');
      await DelayUtils.longDelay();

      // Şifreyi gir
      console.log('Şifre giriliyor...');
      const passwordInput = await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
      
      await this.humanTypeText(passwordInput, credentials.password);
      await DelayUtils.shortDelay();
      
      // Giriş butonuna tıkla
      await this.page.click('button:has-text("İleri"), button:has-text("Next")');
      await DelayUtils.longDelay();

      // Başarılı giriş kontrolü
      await this.page.waitForLoadState('networkidle');
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('myaccount.google.com') || currentUrl.includes('accounts.google.com/ManageAccount')) {
        console.log('✅ Google hesabına başarıyla giriş yapıldı!');
        return true;
      } else {
        console.log('❌ Giriş başarısız olabilir. Mevcut URL:', currentUrl);
        return false;
      }

    } catch (error) {
      console.error('Giriş hatası:', error.message);
      return false;
    }
  }

  async humanTypeText(element, text) {
    // İnsan benzeri yazma simülasyonu
    for (const char of text) {
      await element.type(char);
      await DelayUtils.randomWait(50, 150);
    }
  }

  async navigateToService(serviceName) {
    const services = {
      'gmail': 'https://mail.google.com',
      'drive': 'https://drive.google.com',
      'photos': 'https://photos.google.com',
      'calendar': 'https://calendar.google.com',
      'docs': 'https://docs.google.com',
      'sheets': 'https://sheets.google.com',
      'slides': 'https://slides.google.com'
    };

    const url = services[serviceName.toLowerCase()];
    if (!url) {
      console.log('Desteklenen servisler:', Object.keys(services).join(', '));
      return false;
    }

    console.log(`${serviceName} servisine gidiliyor...`);
    await this.page.goto(url, { waitUntil: 'networkidle' });
    await DelayUtils.humanLikeDelay();
    
    console.log(`✅ ${serviceName} açıldı`);
    return true;
  }

  async takeScreenshot(filename = 'screenshot.png') {
    await this.page.screenshot({ 
      path: filename, 
      fullPage: true 
    });
    console.log(`Ekran görüntüsü alındı: ${filename}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('Tarayıcı kapatıldı');
    }
  }
}

module.exports = GoogleLogin;