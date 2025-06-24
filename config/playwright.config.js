module.exports = {
  // Tarayıcı ayarları
  browsers: ['chromium'],
  
  // Varsayılan ayarlar
  use: {
    headless: process.env.HEADLESS === 'true',
    viewport: { width: 1366, height: 768 },
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
    
    // Anti-detection ayarları
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // Ekran görüntüsü ve video kayıt
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Ağ ayarları
    ignoreHTTPSErrors: true,
    
    // Zaman aşımı ayarları
    actionTimeout: 30000,
    navigationTimeout: 60000
  },
  
  // Test dosyaları
  testDir: './src',
  
  // Paralel çalışma
  workers: 1,
  
  // Retry ayarları
  retries: 2,
  
  // Raporlama
  reporter: 'list'
};