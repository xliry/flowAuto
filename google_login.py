import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
import random
import os
from dotenv import load_dotenv

load_dotenv()

class GoogleLoginUndetected:
    def __init__(self):
        self.driver = None
        
    def init_driver(self):
        """Chrome driver'ı başlat"""
        print("Undetected Chrome başlatılıyor...")
        
        options = uc.ChromeOptions()
        
        # Temel ayarlar
        options.add_argument("--no-first-run")
        options.add_argument("--no-default-browser-check") 
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-web-security")
        options.add_argument("--allow-running-insecure-content")
        options.add_argument("--start-maximized")
        
        # Türkiye lokasyonu
        options.add_argument("--lang=tr-TR")
        options.add_argument("--accept-lang=tr-TR,tr,en-US,en")
        
        # User agent
        options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Profil ayarları
        prefs = {
            "profile.default_content_setting_values.notifications": 2,
            "profile.default_content_settings.popups": 0,
            "profile.managed_default_content_settings.images": 2
        }
        options.add_experimental_option("prefs", prefs)
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        try:
            self.driver = uc.Chrome(options=options, version_main=None)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            print("✅ Chrome başarıyla başlatıldı")
            return True
        except Exception as e:
            print(f"❌ Chrome başlatma hatası: {e}")
            return False
    
    def human_type(self, element, text, min_delay=0.05, max_delay=0.3):
        """İnsan gibi yazma"""
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(min_delay, max_delay))
    
    def random_delay(self, min_sec=1, max_sec=3):
        """Rastgele bekleme"""
        time.sleep(random.uniform(min_sec, max_sec))
    
    def simulate_human_behavior(self):
        """İnsan davranışı simüle et"""
        # Rastgele mouse hareketi
        self.driver.execute_script("""
            function simulateMouseMove() {
                const event = new MouseEvent('mousemove', {
                    clientX: Math.random() * window.innerWidth,
                    clientY: Math.random() * window.innerHeight
                });
                document.dispatchEvent(event);
            }
            simulateMouseMove();
        """)
        
        # Rastgele scroll
        scroll_amount = random.randint(100, 500)
        self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
        time.sleep(random.uniform(0.5, 1.5))
    
    def login(self, email=None, password=None):
        """Google'a giriş yap"""
        try:
            # Credentials'ı al
            if not email:
                email = os.getenv('GOOGLE_EMAIL')
            if not password:
                password = os.getenv('GOOGLE_PASSWORD')
                
            if not email or not password:
                print("❌ Email veya şifre bulunamadı!")
                print("GOOGLE_EMAIL ve GOOGLE_PASSWORD environment variable'larını ayarlayın")
                return False
            
            print("Google ana sayfasına gidiliyor...")
            self.driver.get("https://www.google.com")
            self.random_delay(2, 4)
            self.simulate_human_behavior()
            
            print("Giriş sayfasına yönlendiriliyor...")
            self.driver.get("https://accounts.google.com/signin/v2/identifier")
            self.random_delay(3, 5)
            
            # Email gir
            print("Email giriliyor...")
            email_input = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.ID, "identifierId"))
            )
            
            # Input'a tıkla ve odaklan
            email_input.click()
            self.random_delay(0.5, 1)
            
            # İnsan gibi yaz
            self.human_type(email_input, email)
            self.random_delay(1, 2)
            
            # Next butonuna tıkla
            next_button = self.driver.find_element(By.ID, "identifierNext")
            next_button.click()
            self.random_delay(3, 5)
            
            # Şifre gir
            print("Şifre giriliyor...")
            password_input = WebDriverWait(self.driver, 15).until(
                EC.element_to_be_clickable((By.NAME, "password"))
            )
            
            password_input.click()
            self.random_delay(0.5, 1)
            
            self.human_type(password_input, password)
            self.random_delay(1, 2)
            
            # Password next
            password_next = self.driver.find_element(By.ID, "passwordNext")
            password_next.click()
            self.random_delay(5, 8)
            
            # Başarı kontrolü
            current_url = self.driver.current_url
            if "myaccount.google.com" in current_url or ("accounts.google.com" in current_url and "signin" not in current_url):
                print("✅ Giriş başarılı!")
                return True
            else:
                print(f"❌ Giriş başarısız - URL: {current_url}")
                
                # Hata mesajlarını kontrol et
                try:
                    error_elements = self.driver.find_elements(By.CSS_SELECTOR, "[jsname='B34EJ'] span, [data-a11y-title-piece], .LXRPh")
                    for error in error_elements:
                        if error.text:
                            print(f"Hata: {error.text}")
                except:
                    pass
                    
                return False
                
        except Exception as e:
            print(f"❌ Giriş hatası: {e}")
            return False
    
    def navigate_to_service(self, service):
        """Google servisine git"""
        services = {
            'gmail': 'https://mail.google.com',
            'drive': 'https://drive.google.com',
            'photos': 'https://photos.google.com',
            'calendar': 'https://calendar.google.com',
            'docs': 'https://docs.google.com',
            'sheets': 'https://sheets.google.com'
        }
        
        url = services.get(service.lower())
        if not url:
            print(f"Desteklenen servisler: {', '.join(services.keys())}")
            return False
        
        print(f"{service} servisine gidiliyor...")
        self.driver.get(url)
        self.random_delay(3, 5)
        print(f"✅ {service} açıldı")
        return True
    
    def take_screenshot(self, filename="screenshot.png"):
        """Ekran görüntüsü al"""
        self.driver.save_screenshot(filename)
        print(f"Ekran görüntüsü kaydedildi: {filename}")
    
    def close(self):
        """Tarayıcıyı kapat"""
        if self.driver:
            self.driver.quit()
            print("Tarayıcı kapatıldı")


def main():
    google = GoogleLoginUndetected()
    
    try:
        # Driver'ı başlat
        if not google.init_driver():
            return
        
        # Giriş yap
        if google.login():
            print("\n🎉 Google hesabına başarıyla giriş yapıldı!")
            
            # İsteğe bağlı: Bir servise git
            service = input("\nHangi servise gitmek istersiniz? (gmail/drive/photos/enter=yok): ").strip()
            if service:
                google.navigate_to_service(service)
            
            # Screenshot al
            google.take_screenshot("google_login_success.png")
            
            input("\nDevam etmek için Enter'a basın...")
        
    except KeyboardInterrupt:
        print("\n\nProgram durduruldu")
    finally:
        google.close()


if __name__ == "__main__":
    main()