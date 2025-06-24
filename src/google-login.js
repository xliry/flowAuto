const { chromium } = require('playwright');
const credentialManager = require('./utils/credentials');
const DelayUtils = require('./utils/delays');
const StealthUtils = require('./utils/stealth');

class GoogleLogin {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('Tarayıcı başlatılıyor...');
    
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS === 'true',
      slowMo: 150, // İnsan benzeri hareket
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-client-side-phishing-detection',
        '--disable-default-apps',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-hang-monitor',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-report-upload',
        '--disable-background-timer-throttling',
        '--disable-background-networking',
        '--disable-permissions-api',
        '--disable-notifications'
      ]
    });

    const context = await this.browser.newContext({
      viewport: { width: 1366, height: 768 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
      geolocation: { latitude: 41.0082, longitude: 28.9784 }, // İstanbul
      permissions: ['geolocation']
    });

    // Bot tespitini engellemek için JavaScript çalıştır
    await context.addInitScript(() => {
      // WebDriver özelliklerini gizle
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Chrome runtime ekle
      window.chrome = {
        runtime: {},
        loadTimes: function() {
          return {
            connectionInfo: 'http/1.1',
            finishDocumentLoadTime: 1234567890123,
            finishLoadTime: 1234567890124,
            firstPaintAfterLoadTime: 1234567890125,
            firstPaintTime: 1234567890126,
            navigationType: 'Other',
            npnNegotiatedProtocol: 'unknown',
            requestTime: 1234567890122,
            startLoadTime: 1234567890123,
            wasAlternateProtocolAvailable: false,
            wasFetchedViaSpdy: false,
            wasNpnNegotiated: false
          };
        },
        csi: function() {
          return {
            startE: 1234567890123,
            onloadT: 1234567890124,
            pageT: 1234567890125,
            tran: 15
          };
        }
      };
      
      // Plugin listesi
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          return [
            {
              0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: Plugin},
              description: "Portable Document Format",
              filename: "internal-pdf-viewer",
              length: 1,
              name: "Chrome PDF Plugin"
            },
            {
              0: {type: "application/pdf", suffixes: "pdf", description: "", enabledPlugin: Plugin},
              description: "",
              filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
              length: 1,
              name: "Chrome PDF Viewer"
            }
          ];
        },
      });
      
      // Dil ayarları
      Object.defineProperty(navigator, 'languages', {
        get: () => ['tr-TR', 'tr', 'en-US', 'en'],
      });
      
      // Platform bilgileri
      Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32',
      });
      
      // WebGL bilgileri
      const getParameter = WebGLRenderingContext.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) {
          return 'Intel Inc.';
        }
        if (parameter === 37446) {
          return 'Intel(R) Iris(R) Graphics 6100';
        }
        return getParameter(parameter);
      };
      
      // Permissions API
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    this.page = await context.newPage();
    
    // Stealth headers ekle
    await this.page.setExtraHTTPHeaders(StealthUtils.getStealthHeaders());
    
    console.log('Tarayıcı hazır');
  }

  async login() {
    try {
      const credentials = await credentialManager.getCredentials();
      
      // Önce Google ana sayfasına git (daha az şüpheli)
      console.log('Google ana sayfasına gidiliyor...');
      await this.page.goto('https://www.google.com', {
        waitUntil: 'networkidle'
      });
      
      // Kullanıcı benzeri aktivite
      await StealthUtils.simulateUserActivity(this.page);
      await DelayUtils.randomWait(2000, 4000);
      
      // Şimdi giriş sayfasına git
      console.log('Google giriş sayfasına yönlendiriliyor...');
      await this.page.goto('https://accounts.google.com/signin/v2/identifier?continue=https%3A%2F%2Fwww.google.com&flowName=GlifWebSignIn&flowEntry=ServiceLogin', {
        waitUntil: 'networkidle'
      });
      
      await DelayUtils.randomWait(1500, 3000);

      // Güvenlik uyarısı kontrolü
      if (await StealthUtils.checkForSecurityWarning(this.page)) {
        console.log('⚠️  Güvenlik uyarısı algılandı! Farklı strateji deneniyor...');
        
        // Yavaş hareket moduna geç
        await DelayUtils.randomWait(5000, 8000);
        await StealthUtils.simulateUserActivity(this.page);
      }

      // CAPTCHA kontrolü
      await StealthUtils.checkForCaptcha(this.page);

      // Email adresini gir
      console.log('Email adresi giriliyor...');
      const emailInput = await this.page.waitForSelector('input[type="email"]', { timeout: 15000 });
      
      // Önce input'a odaklan
      await emailInput.click();
      await DelayUtils.shortDelay();
      
      // İnsan benzeri yazma
      await this.humanTypeText(emailInput, credentials.email);
      await DelayUtils.randomWait(800, 1500);
      
      // İleri butonuna tıkla - daha spesifik selector
      const nextButton = await this.page.waitForSelector('#identifierNext', { timeout: 10000 });
      await nextButton.click();
      await DelayUtils.randomWait(3000, 5000);

      // Şifreyi gir
      console.log('Şifre giriliyor...');
      const passwordInput = await this.page.waitForSelector('input[type="password"]', { timeout: 15000 });
      
      // Önce input'a odaklan
      await passwordInput.click();
      await DelayUtils.shortDelay();
      
      await this.humanTypeText(passwordInput, credentials.password);
      await DelayUtils.randomWait(1000, 2000);
      
      // Giriş butonuna tıkla - daha spesifik selector
      const passwordNextButton = await this.page.waitForSelector('#passwordNext', { timeout: 10000 });
      await passwordNextButton.click();
      await DelayUtils.randomWait(4000, 7000);

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
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      await element.type(char);
      
      // Rastgele yazma hızı - bazı harfler daha hızlı
      let delay = Math.random() * 200 + 50;
      if (i % 5 === 0) delay += Math.random() * 100; // Her 5. harfte daha uzun duraklama
      if (char === ' ') delay += Math.random() * 50; // Boşlukta kısa duraklama
      
      await new Promise(resolve => setTimeout(resolve, delay));
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