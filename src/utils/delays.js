class DelayUtils {
  static getRandomDelay(min = 1000, max = 3000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static async randomWait(min = 1000, max = 3000) {
    const delay = this.getRandomDelay(min, max);
    console.log(`${delay}ms bekleniyor...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  static async humanLikeDelay() {
    // İnsan benzeri rastgele gecikme
    await this.randomWait(500, 2000);
  }

  static async longDelay() {
    // Uzun gecikme (sayfa yükleme vs.)
    await this.randomWait(2000, 5000);
  }

  static async shortDelay() {
    // Kısa gecikme
    await this.randomWait(200, 800);
  }
}

module.exports = DelayUtils;