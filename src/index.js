const GoogleLogin = require('./google-login');
const AlternativeGoogleLogin = require('./alternative-login');

class AutomationFramework {
  constructor() {
    this.googleLogin = new GoogleLogin();
    this.altLogin = new AlternativeGoogleLogin();
    this.currentLogin = null;
  }

  async start() {
    console.log('🚀 Google Otomasyon Aracı Başlatılıyor...\n');

    try {
      // Giriş yöntemi seç
      await this.selectLoginMethod();

      // Ana menü
      await this.showMainMenu();

    } catch (error) {
      console.error('❌ Hata:', error.message);
    } finally {
      if (this.currentLogin) {
        await this.currentLogin.close();
      }
    }
  }

  async selectLoginMethod() {
    const inquirer = await import('inquirer');
    
    const { method } = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'method',
        message: 'Hangi giriş yöntemini kullanmak istiyorsunuz?',
        choices: [
          { name: '🤖 Otomatik giriş (varsayılan)', value: 'auto' },
          { name: '👤 Manuel giriş (güvenli)', value: 'manual' },
          { name: '🐌 Yavaş giriş (bot tespiti için)', value: 'slow' },
          { name: '🔵 OAuth2 giriş', value: 'oauth' }
        ]
      }
    ]);

    switch (method) {
      case 'auto':
        this.currentLogin = this.googleLogin;
        await this.currentLogin.init();
        break;
      case 'manual':
      case 'slow':
      case 'oauth':
        this.currentLogin = this.altLogin;
        await this.currentLogin.init();
        break;
    }

    // Seçilen yöntemle giriş yap
    if (method === 'manual') {
      await this.currentLogin.manualLogin();
    } else if (method === 'slow') {
      await this.currentLogin.slowLogin();
    } else if (method === 'oauth') {
      await this.currentLogin.oauth2Login();
    }
  }

  async showMainMenu() {
    const inquirer = await import('inquirer');
    while (true) {
      console.log('\n=== ANA MENÜ ===');
      
      const { action } = await inquirer.default.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Ne yapmak istiyorsunuz?',
          choices: [
            { name: '🔐 Google hesabına giriş yap', value: 'login' },
            { name: '📧 Gmail\'e git', value: 'gmail' },
            { name: '💾 Google Drive\'a git', value: 'drive' },
            { name: '📷 Google Photos\'a git', value: 'photos' },
            { name: '📅 Google Calendar\'a git', value: 'calendar' },
            { name: '📄 Google Docs\'a git', value: 'docs' },
            { name: '📊 Google Sheets\'e git', value: 'sheets' },
            { name: '🖼️  Ekran görüntüsü al', value: 'screenshot' },
            { name: '🔧 Özel işlem yap', value: 'custom' },
            { name: '❌ Çıkış', value: 'exit' }
          ]
        }
      ]);

      switch (action) {
        case 'login':
          if (this.currentLogin === this.googleLogin) {
            const loginSuccess = await this.currentLogin.login();
            if (loginSuccess) {
              console.log('Giriş başarılı! Şimdi diğer servislere gidebilirsiniz.');
            }
          } else {
            console.log('Alternatif giriş yöntemi zaten seçildi.');
          }
          break;

        case 'gmail':
        case 'drive':
        case 'photos':
        case 'calendar':
        case 'docs':
        case 'sheets':
          await this.currentLogin.navigateToService(action);
          break;

        case 'screenshot':
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          if (this.currentLogin.takeScreenshot) {
            await this.currentLogin.takeScreenshot(`screenshot-${timestamp}.png`);
          } else {
            await this.currentLogin.page.screenshot({ 
              path: `screenshot-${timestamp}.png`, 
              fullPage: true 
            });
            console.log(`Ekran görüntüsü alındı: screenshot-${timestamp}.png`);
          }
          break;

        case 'custom':
          await this.handleCustomAction();
          break;

        case 'exit':
          console.log('👋 Program sonlandırılıyor...');
          return;

        default:
          console.log('Geçersiz seçim');
      }
    }
  }

  async handleCustomAction() {
    const inquirer = await import('inquirer');
    const { customAction } = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'customAction',
        message: 'Hangi özel işlemi yapmak istiyorsunuz?',
        choices: [
          { name: '🌐 Özel URL\'ye git', value: 'goto_url' },
          { name: '⏰ Bekle', value: 'wait' },
          { name: '🔄 Sayfayı yenile', value: 'refresh' },
          { name: '◀️ Geri git', value: 'back' }
        ]
      }
    ]);

    switch (customAction) {
      case 'goto_url':
        const { url } = await inquirer.default.prompt([
          {
            type: 'input',
            name: 'url',
            message: 'Gitmek istediğiniz URL\'yi girin:',
            validate: (input) => input.length > 0 || 'URL boş olamaz'
          }
        ]);
        
        console.log(`${url} adresine gidiliyor...`);
        await this.currentLogin.page.goto(url, { waitUntil: 'networkidle' });
        console.log('✅ Sayfa yüklendi');
        break;

      case 'wait':
        const { waitTime } = await inquirer.default.prompt([
          {
            type: 'number',
            name: 'waitTime',
            message: 'Kaç saniye beklemek istiyorsunuz?',
            default: 5
          }
        ]);
        
        console.log(`${waitTime} saniye bekleniyor...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        console.log('✅ Bekleme tamamlandı');
        break;

      case 'refresh':
        console.log('Sayfa yenileniyor...');
        await this.currentLogin.page.reload({ waitUntil: 'networkidle' });
        console.log('✅ Sayfa yenilendi');
        break;

      case 'back':
        console.log('Geri gidiliyor...');
        await this.currentLogin.page.goBack({ waitUntil: 'networkidle' });
        console.log('✅ Geri gidildi');
        break;
    }
  }
}

// Programı başlat
if (require.main === module) {
  const automation = new AutomationFramework();
  automation.start().catch(console.error);
}

module.exports = AutomationFramework;