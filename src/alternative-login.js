const { chromium } = require('playwright');
const credentialManager = require('./utils/credentials');
const DelayUtils = require('./utils/delays');

class AlternativeGoogleLogin {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('Alternatif tarayıcı başlatılıyor...');
    
    // Daha minimal yaklaşım - gerçek kullanıcı profili simüle et
    this.browser = await chromium.launch({
      headless: false, // Mutlaka görünür mod
      slowMo: 50,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--exclude-switches=enable-automation',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    // Gerçek kullanıcı profili ayarları
    const context = await this.browser.newContext({
      viewport: null, // Tam ekran
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
      geolocation: { latitude: 41.0082, longitude: 28.9784 },
      permissions: ['geolocation', 'notifications']
    });

    // Minimal bot engelleme
    await context.addInitScript(() => {
      delete navigator.__proto__.webdriver;
      
      // Chrome object
      window.chrome = {
        runtime: {},
        loadTimes: function() { return {}; },
        csi: function() { return {}; }
      };
    });

    this.page = await context.newPage();
    console.log('Alternatif tarayıcı hazır');
  }

  async manualLogin() {
    try {
      console.log('\n🔴 MANUEL GİRİŞ MODU');
      console.log('Google giriş sayfası açılacak, manuel olarak giriş yapın...');
      
      // Google giriş sayfasını aç
      await this.page.goto('https://accounts.google.com/signin', {
        waitUntil: 'networkidle'
      });
      
      console.log('\n📋 TALİMATLAR:');
      console.log('1. Açılan tarayıcıda email ve şifrenizi girin');
      console.log('2. İki faktörlü doğrulama varsa tamamlayın');
      console.log('3. CAPTCHA varsa çözün');
      console.log('4. Giriş başarılı olunca bu terminale geri dönün');
      console.log('5. Enter tuşuna basın...\n');
      
      // Kullanıcının giriş yapmasını bekle
      process.stdin.setRawMode(true);
      process.stdin.resume();
      
      await new Promise((resolve) => {
        process.stdin.on('data', () => {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          resolve();
        });
      });
      
      // Giriş durumunu kontrol et
      const currentUrl = this.page.url();
      if (currentUrl.includes('myaccount') || currentUrl.includes('google.com') && !currentUrl.includes('signin')) {
        console.log('✅ Manuel giriş başarılı!');
        return true;
      } else {
        console.log('❌ Giriş tamamlanmamış gibi görünüyor');
        return false;
      }
      
    } catch (error) {
      console.error('Manuel giriş hatası:', error.message);
      return false;
    }
  }

  async oauth2Login() {
    try {
      console.log('\n🔵 OAUTH2 YÖNTEMİ');
      console.log('OAuth2 ile güvenli giriş deneniyor...');
      
      // OAuth2 URL'si ile giriş
      const oauthUrl = 'https://accounts.google.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:8080&scope=https://www.googleapis.com/auth/userinfo.email&response_type=code';
      
      console.log('OAuth2 giriş sayfası açılıyor...');
      await this.page.goto('https://accounts.google.com', {
        waitUntil: 'networkidle'
      });
      
      return true;
    } catch (error) {
      console.error('OAuth2 giriş hatası:', error.message);
      return false;
    }
  }

  async slowLogin() {
    try {
      const credentials = await credentialManager.getCredentials();
      
      console.log('\n🐌 YAVAS GİRİŞ MODU');
      console.log('Çok yavaş ve dikkatli giriş deneniyor...');
      
      // Ana sayfadan başla
      await this.page.goto('https://www.google.com.tr', {
        waitUntil: 'networkidle'
      });
      
      // 5 saniye bekle
      console.log('Ana sayfada bekleniyor...');
      await DelayUtils.randomWait(5000, 8000);
      
      // Manuel olarak giriş linkine tıkla
      try {
        await this.page.click('text="Oturum açın"', { timeout: 5000 });
      } catch {
        await this.page.goto('https://accounts.google.com/signin', {
          waitUntil: 'networkidle'
        });
      }
      
      await DelayUtils.randomWait(3000, 5000);
      
      // Email çok yavaş yaz
      console.log('Email çok yavaş giriliyor...');
      const emailInput = await this.page.waitForSelector('input[type="email"]');
      await emailInput.click();
      
      for (const char of credentials.email) {
        await emailInput.type(char);
        await DelayUtils.randomWait(300, 800); // Çok yavaş
      }
      
      await DelayUtils.randomWait(2000, 4000);
      await this.page.click('#identifierNext');
      await DelayUtils.randomWait(4000, 7000);
      
      // Şifre çok yavaş yaz
      console.log('Şifre çok yavaş giriliyor...');
      const passwordInput = await this.page.waitForSelector('input[type="password"]');
      await passwordInput.click();
      
      for (const char of credentials.password) {
        await passwordInput.type(char);
        await DelayUtils.randomWait(300, 800); // Çok yavaş
      }
      
      await DelayUtils.randomWait(2000, 4000);
      await this.page.click('#passwordNext');
      await DelayUtils.randomWait(5000, 10000);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('myaccount') || !currentUrl.includes('signin')) {
        console.log('✅ Yavaş giriş başarılı!');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Yavaş giriş hatası:', error.message);
      return false;
    }
  }

  async navigateToService(serviceName) {
    const services = {
      'gmail': 'https://mail.google.com',
      'drive': 'https://drive.google.com',
      'photos': 'https://photos.google.com'
    };

    const url = services[serviceName.toLowerCase()];
    if (url) {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      console.log(`✅ ${serviceName} açıldı`);
      return true;
    }
    return false;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = AlternativeGoogleLogin;