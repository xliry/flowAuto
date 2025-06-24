# Google Otomasyon Aracı

Google hesabına güvenli giriş yapabilen ve çeşitli Google servislerinde otomasyon yapabilen Node.js uygulaması.

## Özellikler

- 🔐 Güvenli Google hesap girişi
- 🤖 Bot tespitini engelleyen gelişmiş stealth özellikler
- 📧 Gmail, Drive, Photos, Calendar vb. servislere otomatik erişim
- 🎭 İnsan benzeri davranış simülasyonu
- 🔒 Güvenli kimlik bilgi yönetimi
- 📷 Ekran görüntüsü alma
- 🌐 Özel URL'lere gitme

## Kurulum

1. Projeyi klonlayın veya indirin
2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. Playwright tarayıcılarını yükleyin:

```bash
npx playwright install chromium
```

## Kullanım

### 1. Kimlik Bilgilerini Ayarlama

İki yöntem mevcuttur:

**Yöntem 1: .env dosyası (Önerilen)**
```bash
cp .env.example .env
# .env dosyasını düzenleyerek email ve şifrenizi girin
```

**Yöntem 2: Manual giriş**
Program başlatıldığında kimlik bilgilerinizi isteyecektir.

### 2. Programı Çalıştırma

```bash
npm start
```

### 3. Menü Seçenekleri

- **Google hesabına giriş yap**: Kimlik bilgilerinizle Google'a giriş yapar
- **Gmail/Drive/Photos vb.**: İlgili Google servisine yönlendirir
- **Ekran görüntüsü al**: Mevcut sayfanın ekran görüntüsünü alır
- **Özel işlem yap**: URL'ye gitme, bekleme, sayfa yenileme gibi işlemler

## Anti-Detection Özellikleri

- Gerçek tarayıcı user-agent kullanımı
- İnsan benzeri yazma ve tıklama hızı
- Randomly delays between actions
- Bot tespitini engelleyen JavaScript kodları
- Viewport ve dil ayarları

## Güvenlik

- Şifreler hiçbir yerde saklanmaz
- HTTPS bağlantıları kullanılır
- Kimlik bilgileri sadece RAM'de tutulur
- .env dosyası .gitignore'da

## Gereksinimler

- Node.js 16+
- Linux/Windows/macOS
- Internet bağlantısı

## Sorun Giderme

### Giriş başarısız oluyor
- İki faktörlü doğrulama (2FA) etkinse devre dışı bırakın
- "Güvenlik düzeyi düşük uygulamalara izin ver" ayarını kontrol edin
- Captcha çıkarsa manuel olarak çözün

### Tarayıcı açılmıyor
- Playwright tarayıcılarının yüklü olduğundan emin olun:
  ```bash
  npx playwright install chromium
  ```

### Bot tespit ediliyor
- Headless modunu kapatın (.env'de `HEADLESS=false`)
- Gecikme sürelerini artırın
- Farklı user-agent deneyin

## Lisans

MIT License