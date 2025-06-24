const GoogleLogin = require('./google-login');

class AutomationFramework {
  constructor() {
    this.googleLogin = new GoogleLogin();
  }

  async start() {
    console.log('🚀 Google Otomasyon Aracı Başlatılıyor...\n');

    try {
      // Tarayıcıyı başlat
      await this.googleLogin.init();

      // Ana menü
      await this.showMainMenu();

    } catch (error) {
      console.error('❌ Hata:', error.message);
    } finally {
      await this.googleLogin.close();
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
          const loginSuccess = await this.googleLogin.login();
          if (loginSuccess) {
            console.log('Giriş başarılı! Şimdi diğer servislere gidebilirsiniz.');
          }
          break;

        case 'gmail':
        case 'drive':
        case 'photos':
        case 'calendar':
        case 'docs':
        case 'sheets':
          await this.googleLogin.navigateToService(action);
          break;

        case 'screenshot':
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          await this.googleLogin.takeScreenshot(`screenshot-${timestamp}.png`);
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
        await this.googleLogin.page.goto(url, { waitUntil: 'networkidle' });
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
        await this.googleLogin.page.reload({ waitUntil: 'networkidle' });
        console.log('✅ Sayfa yenilendi');
        break;

      case 'back':
        console.log('Geri gidiliyor...');
        await this.googleLogin.page.goBack({ waitUntil: 'networkidle' });
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