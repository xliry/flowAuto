class StealthUtils {
  // Gerçek kullanıcı gibi mouse hareketleri
  static async humanMouseMove(page) {
    const viewport = page.viewportSize();
    const x = Math.floor(Math.random() * viewport.width);
    const y = Math.floor(Math.random() * viewport.height);
    
    await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
  }

  // Rastgele scroll hareketleri
  static async randomScroll(page) {
    const scrollDistance = Math.floor(Math.random() * 500) + 100;
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    await page.evaluate((distance, dir) => {
      window.scrollBy(0, distance * dir);
    }, scrollDistance, direction);
  }

  // Sayfa üzerinde rastgele tıklama (boş alanlara)
  static async randomPageInteraction(page) {
    try {
      const viewport = page.viewportSize();
      // Sayfanın ortasına yakın rastgele nokta
      const x = Math.floor(Math.random() * (viewport.width / 2)) + viewport.width / 4;
      const y = Math.floor(Math.random() * (viewport.height / 2)) + viewport.height / 4;
      
      await page.mouse.click(x, y);
    } catch (error) {
      // Tıklama başarısız olursa devam et
    }
  }

  // Kullanıcı benzeri aktivite simülasyonu
  static async simulateUserActivity(page) {
    const activities = [
      () => this.humanMouseMove(page),
      () => this.randomScroll(page),
      () => this.randomPageInteraction(page)
    ];

    const activity = activities[Math.floor(Math.random() * activities.length)];
    await activity();
  }

  // Anti-detection headers
  static getStealthHeaders() {
    return {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'max-age=0',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    };
  }

  // Captcha varsa bekle ve bildirim ver
  static async checkForCaptcha(page) {
    try {
      const captchaElements = [
        'iframe[src*="recaptcha"]',
        '[data-sitekey]',
        '.g-recaptcha',
        'iframe[title="recaptcha"]',
        '.captcha'
      ];

      for (const selector of captchaElements) {
        const element = await page.$(selector);
        if (element) {
          console.log('🤖 CAPTCHA tespit edildi! Manuel olarak çözün ve devam edin...');
          console.log('Bekleniyor... (CAPTCHA çözüldükten sonra otomatik devam edecek)');
          
          // CAPTCHA kaybolana kadar bekle
          await page.waitForSelector(selector, { 
            state: 'detached', 
            timeout: 300000 // 5 dakika bekle
          });
          
          console.log('✅ CAPTCHA çözüldü, devam ediliyor...');
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Güvenlik uyarısı varsa algıla
  static async checkForSecurityWarning(page) {
    const warningTexts = [
      'güvenli olmayabilir',
      'güvenli değil',
      'farklı bir tarayıcı',
      'Bu tarayıcı veya uygulama güvenli olmayabilir',
      'browser or app may not be secure',
      'try a different browser'
    ];

    for (const text of warningTexts) {
      try {
        const element = await page.getByText(text, { timeout: 2000 });
        if (element) {
          console.log('⚠️  Güvenlik uyarısı tespit edildi!');
          return true;
        }
      } catch (error) {
        // Metin bulunamadı, devam et
      }
    }
    return false;
  }
}

module.exports = StealthUtils;